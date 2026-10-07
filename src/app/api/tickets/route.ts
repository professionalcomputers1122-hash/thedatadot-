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
        !t.id.toUpperCase().startsWith("NEWS-") &&
        t.company_name !== "Newsletter Subscriber" &&
        t.status !== "Subscribed" &&
        t.status !== "Unsubscribed" &&
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
    const rawApiKey = process.env.RESEND_API_KEY || "";
    const apiKey = rawApiKey.replace(/^re_re_/, "re_").trim();
    const supportMailbox = process.env.SUPPORT_EMAIL || "support@thedatadot.com";
    const adminEmail = process.env.ADMIN_EMAIL || "ebinezer@thedatadot.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "support@thedatadot.com";
    const techEmail = body.assignedTechEmail || body.assigned_tech_email || body.technicianEmail;

    const adminRecipients: string[] = [supportMailbox];
    if (adminEmail && !adminRecipients.includes(adminEmail.trim().toLowerCase())) {
      adminRecipients.push(adminEmail.trim());
    }
    if (techEmail && techEmail.includes("@") && !adminRecipients.includes(techEmail.trim().toLowerCase())) {
      adminRecipients.push(techEmail.trim());
    }

    const fromAlertSender = fromEmail ? `The Data Dot Alert <${fromEmail}>` : "The Data Dot Alert <onboarding@resend.dev>";
    const fromSupportSender = fromEmail ? `The Data Dot Support <${fromEmail}>` : "The Data Dot Support <onboarding@resend.dev>";

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        // 1. Alert to engineering desk & assigned technician
        await resend.emails.send({
          from: fromAlertSender,
          to: adminRecipients,
          subject: `[TICKET DISPATCH: ${urgency.toUpperCase()}] #${ticketId} - ${companyName || customerName}`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
    .header { background-color: #070e1b; border-top: 3px solid #2563eb; padding: 20px 28px; }
    .title { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 28px; font-size: 13px; line-height: 1.6; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; background: #141e33; border-radius: 8px; }
    .table td { padding: 8px 14px; border-bottom: 1px solid #1e293b; }
    .table td.label { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 600; width: 35%; }
    .table td.val { color: #f8fafc; font-weight: 600; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 10px 22px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 12px; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">THE DATA DOT &bull; CASE DISPATCH #${ticketId}</div>
    </div>
    <div class="content">
      <table class="table">
        <tr><td class="label">Reference</td><td class="val">#${ticketId}</td></tr>
        <tr><td class="label">Client</td><td class="val">${customerName} (${companyName})</td></tr>
        <tr><td class="label">Email</td><td class="val">${customerEmail}</td></tr>
        <tr><td class="label">Subject / Hardware</td><td class="val">${deviceOrSubject}</td></tr>
        <tr><td class="label">Serial Number</td><td class="val">${serialNumber || "N/A"}</td></tr>
        <tr><td class="label">SLA Urgency</td><td class="val">${urgency}</td></tr>
        <tr><td class="label">Assigned Tech</td><td class="val">${assignedTech}</td></tr>
      </table>
      <p style="color: #94a3b8; margin: 12px 0 4px 0; font-size: 11px; text-transform: uppercase; font-weight: 700;">Diagnostic Notes / Symptoms:</p>
      <div style="background: #141e33; padding: 12px; border-radius: 6px; color: #cbd5e1;">${symptoms || "None provided"}</div>
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://www.thedatadot.com/technician/dashboard" class="btn">Open Workbench Console</a>
      </div>
    </div>
  </div>
</body>
</html>
          `,
        });

        // 2. Dispatch Executive Corporate Receipt to Client
        if (customerEmail && customerEmail.includes("@")) {
          const clientSubject = `Receipt: Service Case #${ticketId} Registered - The Data Dot`;
          const clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The Data Dot - Service Acknowledgement</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 32px 16px; line-height: 1.6; }
    .wrapper { max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); }
    .header { background-color: #091321; border-top: 3px solid #2563eb; padding: 30px 36px 26px; }
    .brand-title { font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
    .brand-subtitle { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 5px; }
    .content { padding: 36px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0; }
    .lead { font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.65; }
    .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
    .summary-table { width: 100%; border-collapse: collapse; }
    .summary-table td { padding: 12px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .summary-table tr:last-child td { border-bottom: none; }
    .summary-label { width: 40%; color: #64748b; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-value { width: 60%; color: #0f172a; font-weight: 600; text-align: right; }
    .cta-container { text-align: center; margin: 30px 0 10px 0; }
    .btn-primary { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 30px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 13px; letter-spacing: 0.3px; }
    .escalation-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px 20px; margin-top: 26px; font-size: 12px; color: #334155; line-height: 1.6; }
    .footer { background-color: #091321; padding: 26px 36px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #1e293b; line-height: 1.6; }
    .legal-notice { margin-top: 14px; padding-top: 14px; border-top: 1px solid #1e293b; font-size: 10px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-title">THE DATA DOT</div>
      <div class="brand-subtitle">Enterprise IT Solutions &bull; Cleanroom Data Recovery</div>
    </div>
    <div class="content">
      <h1 class="greeting">Dear ${customerName || "Valued Client"},</h1>
      <p class="lead">
        We acknowledge receipt of your service case submission. Your incident file has been assigned reference tracking number <strong>#${ticketId}</strong> and entered into our engineering triage queue under our <strong>${urgency} SLA</strong> standard.
      </p>
      <div class="summary-card">
        <table class="summary-table">
          <tr><td class="summary-label">Reference ID</td><td class="summary-value"><span style="color: #2563eb; font-family: monospace; font-size: 13px; font-weight: 700;">#${ticketId}</span></td></tr>
          <tr><td class="summary-label">Subject / Hardware</td><td class="summary-value">${deviceOrSubject}</td></tr>
          <tr><td class="summary-label">SLA Tier</td><td class="summary-value">${urgency} Priority</td></tr>
          <tr><td class="summary-label">Organization</td><td class="summary-value">${companyName}</td></tr>
        </table>
      </div>
      <div class="cta-container">
        <a href="https://www.thedatadot.com/customer/tickets/${ticketId}" class="btn-primary">
          View Case Status in Client Portal
        </a>
      </div>
      <div class="escalation-box">
        <strong>Need Immediate Emergency Assistance?</strong><br>
        24/7 Operations Desk Hotline: <a href="tel:+916380488373" style="color: #2563eb; text-decoration: none; font-weight: 700;">+91 6380488373</a> &bull; Support Mailbox: <a href="mailto:support@thedatadot.com" style="color: #2563eb; text-decoration: none; font-weight: 700;">support@thedatadot.com</a>
      </div>
    </div>
    <div class="footer">
      The Data Dot Enterprise Support &bull; ISO 27001 &amp; SOC 2 Type II Aligned
      <div class="legal-notice">
        CONFIDENTIALITY NOTICE: This transmission is intended strictly for the named recipient and may contain privileged or proprietary information. If you have received this message in error, please discard immediately.
      </div>
    </div>
  </div>
</body>
</html>
          `;

          await resend.emails.send({
            from: fromSupportSender,
            to: customerEmail,
            subject: clientSubject,
            html: clientHtml,
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

