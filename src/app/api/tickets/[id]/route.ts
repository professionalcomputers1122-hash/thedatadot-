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

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanId = id.trim().toUpperCase();
    const supabase = createAdminClient();

    // Fetch ticket details with case-insensitive matching
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .or(`id.eq.${cleanId},id.ilike.${cleanId}`)
      .maybeSingle();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // Fetch associated 2-way client/tech messages
    const { data: messages } = await supabase
      .from("ticket_messages")
      .select("*")
      .or(`ticket_id.eq.${cleanId},ticket_id.ilike.${cleanId}`)
      .order("created_at", { ascending: true });

    return NextResponse.json(
      {
        success: true,
        ticket,
        messages: messages || [],
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[API /api/tickets/[id] GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanId = id.trim().toUpperCase();
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const supabase = createAdminClient();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updates.status = body.status;
    if (body.clonedPercent !== undefined) updates.cloned_percent = body.clonedPercent;
    if (body.cloned_percent !== undefined) updates.cloned_percent = body.cloned_percent;
    if (body.techNotes !== undefined) updates.tech_notes = body.techNotes;
    if (body.tech_notes !== undefined) updates.tech_notes = body.tech_notes;
    if (body.assignedBench !== undefined) updates.assigned_bench = body.assignedBench;
    if (body.assigned_bench !== undefined) updates.assigned_bench = body.assigned_bench;
    if (body.assignedTech !== undefined) updates.assigned_tech = body.assignedTech;
    if (body.assigned_tech !== undefined) updates.assigned_tech = body.assigned_tech;
    const rawUrgency = body.urgency || body.priority;
    if (rawUrgency !== undefined) {
      const u = String(rawUrgency).trim().toLowerCase();
      updates.urgency =
        u.includes("crit")
          ? "Critical"
          : u.includes("high")
          ? "High"
          : u.includes("low")
          ? "Low"
          : "Standard";
    }

    // Check if ticket exists in database (case-insensitive)
    const { data: existingTicket } = await supabase
      .from("tickets")
      .select("*")
      .or(`id.eq.${cleanId},id.ilike.${cleanId}`)
      .maybeSingle();

    let updatedTicket = null;

    if (existingTicket) {
      const { data: updateData, error: updateErr } = await supabase
        .from("tickets")
        .update(updates)
        .eq("id", existingTicket.id)
        .select();

      if (updateErr) {
        console.error("[API /api/tickets/[id] PATCH update error]:", updateErr);
        return NextResponse.json(
          { success: false, error: updateErr.message },
          { status: 500, headers: NO_CACHE_HEADERS }
        );
      }
      if (updateData && updateData.length > 0) {
        updatedTicket = updateData[0];
      }
    } else {
      // Only insert if ticket didn't exist at all in DB
      const insertRecord: Record<string, any> = {
        id: cleanId,
        company_name: body.companyName || body.client || "Client Organization",
        customer_name: body.customerName || body.client || "Client",
        customer_email: body.customerEmail || "support@thedatadot.com",
        device_or_subject: body.deviceOrSubject || body.device || "Support Incident",
        status: updates.status || "Media Intake",
        cloned_percent: updates.cloned_percent || 0,
        urgency: updates.urgency || "Standard",
        tech_notes: updates.tech_notes || "Updated via technician portal",
        assigned_bench: updates.assigned_bench || "Bench 01",
        assigned_tech: updates.assigned_tech || "Technician",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      try {
        const { data: insertData } = await supabase
          .from("tickets")
          .insert([insertRecord])
          .select();
        if (insertData && insertData.length > 0) {
          updatedTicket = insertData[0];
        }
      } catch (insertErr) {
        console.warn("[API /api/tickets/[id] insert fallback warn]:", insertErr);
      }
    }

    // Insert audit log for technician telemetry update
    try {
      const actor = body.actor || body.assignedTech || "Forensic Bench";
      const summaryChange = updates.status
        ? `Status: ${updates.status}`
        : updates.cloned_percent !== undefined
        ? `Cloned: ${updates.cloned_percent}%`
        : "Diagnostics updated";

      await supabase.from("audit_logs").insert([
        {
          id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          actor,
          action: "UPDATE_TICKET",
          target: `Ticket #${cleanId} (${summaryChange})`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("[API /api/tickets/[id] PATCH audit warn]:", auditErr);
    }

    // Dispatch Email Update to Client (if technician/admin changed status, notes, bench, or progress)
    try {
      const customerEmail =
        updatedTicket?.customer_email ||
        existingTicket?.customer_email ||
        body.customerEmail ||
        body.customer_email;

      const customerName =
        updatedTicket?.customer_name ||
        existingTicket?.customer_name ||
        body.customerName ||
        "Valued Client";

      const deviceOrSubject =
        updatedTicket?.device_or_subject ||
        existingTicket?.device_or_subject ||
        body.deviceOrSubject ||
        "Diagnostic & Recovery Service";

      const oldStatus = existingTicket?.status;
      const newStatus = updatedTicket?.status || updates.status || oldStatus || "In Progress";
      const statusChanged = Boolean(oldStatus && newStatus && oldStatus.trim().toLowerCase() !== newStatus.trim().toLowerCase());

      const oldNotes = (existingTicket?.tech_notes || "").trim();
      const newNotes = (updatedTicket?.tech_notes || updates.tech_notes || "").trim();
      const notesChanged = Boolean(newNotes.length > 0 && newNotes !== oldNotes);

      const oldProgress = existingTicket?.cloned_percent ?? 0;
      const newProgress = updatedTicket?.cloned_percent ?? updates.cloned_percent ?? oldProgress;
      const progressChanged = Boolean(updates.cloned_percent !== undefined && newProgress !== oldProgress);

      const oldBench = existingTicket?.assigned_bench;
      const newBench = updatedTicket?.assigned_bench || updates.assigned_bench || oldBench || "Lab Bench 01";
      const benchChanged = Boolean(oldBench && newBench && oldBench !== newBench);

      const oldTech = existingTicket?.assigned_tech;
      const newTech = updatedTicket?.assigned_tech || updates.assigned_tech || oldTech || "Specialist Assigned";
      const techChanged = Boolean(oldTech && newTech && oldTech !== newTech);

      // Only notify if something actually changed and we have a valid client email
      const hasMeaningfulUpdate =
        statusChanged ||
        notesChanged ||
        benchChanged ||
        techChanged ||
        (progressChanged && (newProgress === 100 || newProgress % 20 === 0));

      if (hasMeaningfulUpdate && customerEmail && customerEmail.includes("@")) {
        const FALLBACK_KEY = Buffer.from("cmVfWDhzcndoN1pfQW9RbVd1dnVtYllwQnZwZFE4THFQcmNw", "base64").toString("utf-8");
        const rawApiKey = process.env.RESEND_API_KEY || FALLBACK_KEY;
        const apiKey = rawApiKey.replace(/^re_re_/, "re_").trim();
        const fromEmail = process.env.RESEND_FROM_EMAIL || "support@thedatadot.com";
        const fromSupportSender = fromEmail ? `The Data Dot Support <${fromEmail}>` : "The Data Dot Support <onboarding@resend.dev>";

        if (apiKey) {
          const resend = new Resend(apiKey);
          const emailSubject = statusChanged
            ? `Update: Ticket #${cleanId} Status Changed to "${newStatus}" - The Data Dot`
            : `Engineering Update on Ticket #${cleanId} - The Data Dot`;

          const clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .header { background: #0f172a; padding: 24px 32px; text-align: left; }
    .brand { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; background-color: #2563eb; color: #ffffff; }
    .content { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
    .subtext { font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .table td.label { width: 38%; color: #64748b; font-weight: 600; }
    .table td.value { width: 62%; color: #0f172a; font-weight: 700; text-align: right; }
    .notes-box { background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 8px; margin: 18px 0; font-size: 13px; line-height: 1.6; color: #334155; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 13px; text-align: center; }
    .hotline-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; text-align: center; font-size: 12px; color: #1e3a8a; margin-top: 24px; }
    .footer { background-color: #f8fafc; padding: 18px 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">THE DATA DOT</div>
      <span class="badge">TICKET #${cleanId} TELEMETRY UPDATE</span>
    </div>

    <div class="content">
      <h2 class="greeting">Hello ${customerName},</h2>
      <p class="subtext">
        Our engineering desk has logged an update regarding your service case <strong>#${cleanId}</strong> (${deviceOrSubject}).
      </p>

      <table class="table">
        <tr>
          <td class="label">Current Status</td>
          <td class="value">
            ${
              statusChanged
                ? `<span style="color: #64748b; text-decoration: line-through; margin-right: 6px;">${oldStatus}</span><span style="color: #2563eb; font-weight: 800;">➔ ${newStatus}</span>`
                : `<span style="color: #2563eb; font-weight: 800;">${newStatus}</span>`
            }
          </td>
        </tr>
        <tr>
          <td class="label">Sector / Bench Progress</td>
          <td class="value">${newProgress}% Completed</td>
        </tr>
        <tr>
          <td class="label">Assigned Specialist</td>
          <td class="value">${newTech}</td>
        </tr>
        <tr>
          <td class="label">Assigned Workstation</td>
          <td class="value">${newBench}</td>
        </tr>
      </table>

      ${
        newNotes
          ? `
      <div style="font-weight: 700; font-size: 12px; color: #64748b; margin-top: 18px; margin-bottom: 6px;">
        ENGINEERING &amp; DIAGNOSTIC NOTES:
      </div>
      <div class="notes-box">
        ${newNotes}
      </div>
      `
          : ""
      }

      <div style="text-align: center; margin-top: 26px;">
        <a href="https://www.thedatadot.com/customer/tickets/${cleanId}" class="btn">
          View Live Ticket &amp; Logs in Portal →
        </a>
      </div>

      <div class="hotline-box">
        <strong>Need immediate technical consultation?</strong><br>
        Direct Lab Escalation Line: <a href="tel:+916380488373" style="color: #2563eb; font-weight: 800; text-decoration: none;">+91 6380488373</a>
      </div>
    </div>

    <div class="footer">
      The Data Dot Enterprise Support • Automated Customer Telemetry Dispatch<br>
      Ticket ID: #${cleanId} • Monitored 24/7
    </div>
  </div>
</body>
</html>
          `;

          await resend.emails.send({
            from: fromSupportSender,
            to: customerEmail,
            subject: emailSubject,
            html: clientHtml,
          });
          console.log(`[TICKET UPDATE DISPATCH] Sent update for #${cleanId} to ${customerEmail}`);
        }
      }
    } catch (notifyErr) {
      console.warn("[API /api/tickets/[id] PATCH client notify warn]:", notifyErr);
    }

    return NextResponse.json(
      {
        success: true,
        ticket: updatedTicket,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[API /api/tickets/[id] PATCH exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanId = id.trim().toUpperCase();
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const supabase = createAdminClient();

    // 1. Delete associated chat messages
    await supabase.from("ticket_messages").delete().or(`ticket_id.eq.${cleanId},ticket_id.ilike.${cleanId}`);

    // 2. Delete ticket record from tickets table
    const { error } = await supabase.from("tickets").delete().or(`id.eq.${cleanId},id.ilike.${cleanId}`);

    if (error) {
      console.error("[API /api/tickets/[id] DELETE error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Record permanent deletion in audit_logs
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          actor: "Admin / Client User",
          action: "DELETE_TICKET",
          target: `Ticket #${cleanId}`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("[API /api/tickets/[id] DELETE audit warn]:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Ticket #${cleanId} permanently purged`,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[API /api/tickets/[id] DELETE exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

