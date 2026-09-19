import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const urgency = searchParams.get("urgency");
    const customerEmail = searchParams.get("customer_email") || searchParams.get("email");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const supabase = createAdminClient();
    let query = supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (urgency && urgency !== "all") {
      query = query.ilike("urgency", urgency);
    }
    if (customerEmail) {
      query = query.ilike("customer_email", customerEmail);
    }
    if (search) {
      query = query.or(
        `id.ilike.%${search}%,company_name.ilike.%${search}%,customer_name.ilike.%${search}%,device_or_subject.ilike.%${search}%,serial_number.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API /api/tickets GET error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // Read any permanently deleted ticket IDs from audit_logs to prevent auto-restoration
    const deletedTicketIds = new Set<string>();
    try {
      const { data: deleteLogs } = await supabase
        .from("audit_logs")
        .select("target")
        .eq("action", "DELETE_TICKET");

      if (deleteLogs) {
        deleteLogs.forEach((l) => {
          const match = l.target?.match(/Ticket\s*#?([A-Za-z0-9\-]+)/i);
          if (match && match[1]) {
            deletedTicketIds.add(match[1].trim().toUpperCase());
          }
        });
      }
    } catch (logErr) {
      console.warn("Audit logs check note in tickets GET:", logErr);
    }

    const inquiryStatuses = new Set(["New Request", "In Coordination", "Contacted", "Converted"]);
    const cleanTickets = (data || []).filter(
      (t) =>
        !deletedTicketIds.has((t.id || "").trim().toUpperCase()) &&
        !t.id.toUpperCase().startsWith("INQ-") &&
        !t.id.toUpperCase().startsWith("DR-") &&
        !t.id.toUpperCase().startsWith("RPT-") &&
        !inquiryStatuses.has(t.status)
    );

    return NextResponse.json(
      {
        success: true,
        count: cleanTickets.length,
        tickets: cleanTickets,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[API /api/tickets GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();

    // Normalizing camelCase and snake_case keys
    const customerName = body.customerName || body.customer_name;
    const customerEmail = body.customerEmail || body.customer_email;
    const companyName = body.companyName || body.company_name || customerName || "Enterprise Client";
    const deviceOrSubject = body.deviceOrSubject || body.device_or_subject;
    const mediaType = body.mediaType || body.media_type || "HDD";
    const serialNumber = body.serialNumber || body.serial_number || "N/A";
    const urgency = body.urgency || "Standard";
    const symptoms = body.symptoms || "";
    const techNotes = body.techNotes || body.tech_notes || "Ticket registered. Awaiting Super Admin triage and technician dispatch.";
    const assignedBench = body.assignedBench || body.assigned_bench || "Pending Allocation";
    const assignedTech = body.assignedTech || body.assigned_tech || "Unassigned";

    if (!customerName || !customerEmail || !deviceOrSubject) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: customerName, customerEmail, deviceOrSubject",
        },
        { status: 400 }
      );
    }

    const ticketId = body.id || `TDD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicketRecord = {
      id: ticketId,
      company_name: companyName,
      customer_name: customerName,
      customer_email: customerEmail,
      device_or_subject: deviceOrSubject,
      media_type: mediaType,
      serial_number: serialNumber,
      status:
        body.status && body.status.toLowerCase() !== "intake & diagnostics"
          ? body.status
          : deviceOrSubject?.toLowerCase().includes("cyber")
          ? "Threat Intake"
          : deviceOrSubject?.toLowerCase().includes("cloud")
          ? "Scope Intake"
          : deviceOrSubject?.toLowerCase().includes("managed") || deviceOrSubject?.toLowerCase().includes("fleet")
          ? "Ticket Intake"
          : "Media Intake",
      cloned_percent: body.clonedPercent !== undefined ? body.clonedPercent : 0,
      urgency,
      symptoms,
      tech_notes: techNotes,
      assigned_bench: assignedBench,
      assigned_tech: assignedTech,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();

    // 1. Insert ticket into Supabase PostgreSQL
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .insert([newTicketRecord])
      .select()
      .single();

    if (ticketError) {
      console.error("[API /api/tickets POST database error]:", ticketError);
      return NextResponse.json(
        { success: false, error: ticketError.message },
        { status: 500 }
      );
    }

    // 2. Insert initial system audit entry
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          actor: `${customerName} (${customerEmail})`,
          action: "CREATE_TICKET",
          target: `Ticket #${ticketId}`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("[API /api/tickets POST audit log warn]:", auditErr);
    }

    // 3. Dispatch SLA Notification via Resend (if configured)
    const apiKey = process.env.RESEND_API_KEY;
    const supportMailbox = process.env.SUPPORT_EMAIL || "support@thedatadot.com";

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        // Alert to engineering desk
        await resend.emails.send({
          from: "The Data Dot Alert <onboarding@resend.dev>",
          to: supportMailbox,
          subject: `[TICKET ALERT: ${urgency.toUpperCase()}] #${ticketId} - ${companyName}`,
          html: `
            <div style="font-family: sans-serif; background: #070e17; color: #f1f5f9; padding: 24px; border-radius: 12px;">
              <h2 style="color: #38bdf8;">New Hardware Case #${ticketId}</h2>
              <p><strong>Customer:</strong> ${customerName} (${companyName})</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Device:</strong> ${deviceOrSubject} (SN: ${serialNumber})</p>
              <p><strong>Urgency:</strong> ${urgency}</p>
              <p><strong>Symptoms:</strong> ${symptoms || "None provided"}</p>
              <p><a href="http://localhost:3000/technician/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;padding:8px 16px;border-radius:6px;text-decoration:none;margin-top:12px;">Open Cleanroom Workbench</a></p>
            </div>
          `,
        });

        // Receipt to customer
        if (customerEmail.includes("@")) {
          await resend.emails.send({
            from: "The Data Dot Support <onboarding@resend.dev>",
            to: customerEmail,
            subject: `Case Registered: #${ticketId} - The Data Dot Cleanroom Lab`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                <h2 style="color: #2563eb;">Hardware Intake Confirmed</h2>
                <p>Hello ${customerName},</p>
                <p>Your case <strong>#${ticketId}</strong> has been logged in our secure cleanroom facility.</p>
                <p><strong>Target Hardware:</strong> ${deviceOrSubject}</p>
                <p><strong>Priority SLA:</strong> ${urgency}</p>
                <p>You can track the live PC-3000 sector imaging progress anytime in our Customer Portal.</p>
                <br>
                <p>Best regards,<br><strong>The Data Dot Engineering Desk</strong><br>Hotline: +91 6380488373</p>
              </div>
            `,
          });
        }
      } catch (emailErr) {
        console.warn("[API /api/tickets POST Resend dispatch warn]:", emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        ticket: ticketData || newTicketRecord,
        ticketId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[API /api/tickets POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {
        // ignore body parse error
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const supabase = createAdminClient();

    // 1. Delete associated messages
    await supabase.from("ticket_messages").delete().eq("ticket_id", id);

    // 2. Delete ticket record
    const { error } = await supabase.from("tickets").delete().eq("id", id);

    if (error) {
      console.error("[API /api/tickets DELETE error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 3. Record permanent deletion in audit_logs
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          actor: "Admin / Client User",
          action: "DELETE_TICKET",
          target: `Ticket #${id}`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("[API /api/tickets DELETE audit warn]:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Ticket #${id} permanently purged`,
    });
  } catch (err: any) {
    console.error("[API /api/tickets DELETE exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

