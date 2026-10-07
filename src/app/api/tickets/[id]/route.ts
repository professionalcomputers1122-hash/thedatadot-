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

      // Only notify client when the ticket STATUS actually changes (e.g. Intake -> Diagnostics -> Cloning -> Resolved)
      if (statusChanged && customerEmail && customerEmail.includes("@")) {
        const rawApiKey = process.env.RESEND_API_KEY || "";
        const apiKey = rawApiKey.replace(/^re_re_/, "re_").trim();
        const fromEmail = process.env.RESEND_FROM_EMAIL || "support@thedatadot.com";
        const fromSupportSender = fromEmail ? `The Data Dot Support <${fromEmail}>` : "The Data Dot Support <onboarding@resend.dev>";

        if (apiKey) {
          const resend = new Resend(apiKey);
          const emailSubject = `Operational Update: Case #${cleanId} Status changed to "${newStatus}" - The Data Dot`;

          const clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The Data Dot - Case Telemetry Update</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      margin: 0;
      padding: 32px 16px;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
    }
    .header {
      background-color: #091321;
      border-top: 3px solid #2563eb;
      padding: 30px 36px 26px;
    }
    .brand-title {
      font-size: 21px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-top: 5px;
    }
    .content {
      padding: 36px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 14px 0;
    }
    .lead {
      font-size: 14px;
      color: #334155;
      margin: 0 0 24px 0;
      line-height: 1.65;
    }
    .summary-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .summary-table {
      width: 100%;
      border-collapse: collapse;
    }
    .summary-table td {
      padding: 12px 18px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .summary-table tr:last-child td {
      border-bottom: none;
    }
    .summary-label {
      width: 42%;
      color: #64748b;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-value {
      width: 58%;
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .notes-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      border-radius: 6px;
      margin: 20px 0;
      font-size: 13px;
      line-height: 1.6;
      color: #334155;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0 10px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: 700;
      text-decoration: none;
      font-size: 13px;
      letter-spacing: 0.3px;
    }
    .escalation-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      border-radius: 6px;
      padding: 16px 20px;
      margin-top: 26px;
      font-size: 12px;
      color: #334155;
      line-height: 1.6;
    }
    .footer {
      background-color: #091321;
      padding: 26px 36px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #1e293b;
      line-height: 1.6;
    }
    .footer a {
      color: #60a5fa;
      text-decoration: none;
    }
    .legal-notice {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #1e293b;
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
    }
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
        We are providing an official engineering telemetry update regarding your active service case <strong>#${cleanId}</strong> (${deviceOrSubject}).
      </p>

      <div class="summary-card">
        <table class="summary-table">
          <tr>
            <td class="summary-label">Case Reference #</td>
            <td class="summary-value"><span style="color: #2563eb; font-family: monospace; font-size: 13px; font-weight: 700;">#${cleanId}</span></td>
          </tr>
          <tr>
            <td class="summary-label">Operational Status</td>
            <td class="summary-value">
              ${
                statusChanged
                  ? `<span style="color: #64748b; text-decoration: line-through; margin-right: 6px;">${oldStatus}</span><span style="color: #2563eb; font-weight: 700;">&rarr; ${newStatus}</span>`
                  : `<span style="color: #2563eb; font-weight: 700;">${newStatus}</span>`
              }
            </td>
          </tr>
          <tr>
            <td class="summary-label">Diagnostic Telemetry</td>
            <td class="summary-value">${newProgress}% Completed</td>
          </tr>
          <tr>
            <td class="summary-label">Designated Lead Tech</td>
            <td class="summary-value">${newTech}</td>
          </tr>
          <tr>
            <td class="summary-label">Allocated Workstation</td>
            <td class="summary-value">${newBench}</td>
          </tr>
        </table>
      </div>

      ${
        newNotes
          ? `
      <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 20px; margin-bottom: 6px;">
        Engineering &amp; Diagnostic Protocol Notes
      </div>
      <div class="notes-box">
        ${newNotes}
      </div>
      `
          : ""
      }

      <div class="cta-container">
        <a href="https://www.thedatadot.com/customer/tickets/${cleanId}" class="btn-primary">
          View Case Telemetry in Portal
        </a>
      </div>

      <div class="escalation-box">
        <strong>Need Immediate Technical Consultation?</strong><br>
        24/7 Operations Desk Hotline: <a href="tel:+916380488373" style="color: #2563eb; text-decoration: none; font-weight: 700;">+91 6380488373</a> &bull; Support Mailbox: <a href="mailto:support@thedatadot.com" style="color: #2563eb; text-decoration: none; font-weight: 700;">support@thedatadot.com</a>
      </div>
    </div>

    <div class="footer">
      The Data Dot Enterprise Support &bull; Automated Telemetry Dispatch<br>
      Incident Tracking ID: #${cleanId} &bull; ISO 27001 Certified Operations Desk
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

