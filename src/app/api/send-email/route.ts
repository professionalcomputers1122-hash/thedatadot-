import { NextResponse } from "next/server";
import { Resend } from "resend";

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 8; // Max 8 submissions per minute

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check (Anti-Brute Force / Anti-Flooding)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = Date.now();
    const timestamps = (rateLimitMap.get(clientIp) || []).filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      console.warn(`[SECURITY ALERT] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait 60 seconds before trying again.",
        },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    timestamps.push(now);
    rateLimitMap.set(clientIp, timestamps);

    const body = await req.json();
    const {
      type = "contact", // "inquiry" | "contact" | "ticket"
      ticketId,
      inquiryId,
      customerName,
      customerEmail,
      companyName,
      phone,
      teamSize,
      service,
      deviceOrSubject,
      serialNumber,
      urgency = "Standard",
      symptoms,
      message,
    } = body;

    const supportMailbox = process.env.SUPPORT_EMAIL || "support@thedatadot.com";
    const adminEmail = process.env.ADMIN_EMAIL || "ebinezer@thedatadot.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "support@thedatadot.com";
    const rawApiKey = process.env.RESEND_API_KEY || "";
    const apiKey = rawApiKey.replace(/^re_re_/, "re_").trim();
    const technicianEmail = body.technicianEmail || body.technician_email || body.assignedTechEmail;

    const refId =
      inquiryId ||
      ticketId ||
      (type === "ticket"
        ? `TDD-${Math.floor(100000 + Math.random() * 900000)}`
        : `INQ-${Math.floor(100000 + Math.random() * 900000)}`);

    const isTicket = type === "ticket";
    const cleanUrgency = urgency.charAt(0).toUpperCase() + urgency.slice(1).toLowerCase();
    const displayService = service || deviceOrSubject || "Cleanroom Recovery & Enterprise IT";
    const targetMessage = message || symptoms || "No specific details provided.";

    const adminSubject = isTicket
      ? `[TICKET DISPATCH: ${cleanUrgency.toUpperCase()}] #${refId} - ${companyName || customerName}`
      : `[CLIENT LEAD DISPATCH: ${cleanUrgency.toUpperCase()}] #${refId} - ${companyName || customerName}`;

    const adminPortalUrl = isTicket
      ? "https://www.thedatadot.com/admin/tickets"
      : "https://www.thedatadot.com/admin/inquiries";

    // -------------------------------------------------------------
    // TEMPLATE 1: Admin / Internal Engineering Dispatch
    // -------------------------------------------------------------
    const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The Data Dot - Internal Operations Dispatch</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 28px 16px; line-height: 1.6; }
    .card { max-width: 620px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background-color: #070e1b; border-top: 3px solid #2563eb; border-bottom: 1px solid #1e293b; padding: 24px 32px; }
    .brand-title { font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
    .brand-sub { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px; }
    .badge-critical { background-color: #7f1d1d; color: #fca5a5; border: 1px solid #991b1b; }
    .badge-high { background-color: #78350f; color: #fcd34d; border: 1px solid #92400e; }
    .badge-standard { background-color: #1e3a8a; color: #93c5fd; border: 1px solid #1d4ed8; }
    .content { padding: 32px; }
    .lead-title { margin: 0 0 6px 0; font-size: 17px; font-weight: 700; color: #ffffff; }
    .lead-meta { margin: 0 0 20px 0; font-size: 12px; color: #94a3b8; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #141e33; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
    .table td { padding: 10px 16px; border-bottom: 1px solid #1e293b; font-size: 13px; }
    .table tr:last-child td { border-bottom: none; }
    .table td.label { width: 35%; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .table td.value { width: 65%; color: #f8fafc; font-weight: 600; }
    .message-box { background-color: #141e33; border: 1px solid #1e293b; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 18px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1; white-space: pre-wrap; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 13px; text-align: center; }
    .footer { background-color: #070e1b; padding: 20px 32px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand-title">THE DATA DOT</div>
      <div class="brand-sub">${isTicket ? "INTERNAL TICKET DISPATCH DESK" : "ENTERPRISE CLIENT INTAKE DESK"}</div>
      <span class="badge badge-${cleanUrgency.toLowerCase()}">${cleanUrgency.toUpperCase()} PRIORITY &bull; SLA ACTIVATED</span>
    </div>

    <div class="content">
      <h2 class="lead-title">${isTicket ? "New Case Registered" : "New Client Consultation File"} #${refId}</h2>
      <p class="lead-meta">Captured via Public Portal &bull; System Routing: Super Admin &amp; Solutions Engineering</p>

      <table class="table">
        <tr>
          <td class="label">Reference ID</td>
          <td class="value"><span style="color: #60a5fa; font-family: monospace; font-size: 13px;">#${refId}</span></td>
        </tr>
        <tr>
          <td class="label">Contact Name</td>
          <td class="value">${customerName || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Organization</td>
          <td class="value">${companyName || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Corporate Email</td>
          <td class="value"><a href="mailto:${customerEmail}" style="color: #60a5fa; text-decoration: none;">${customerEmail || "N/A"}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td class="label">Escalation Phone</td>
          <td class="value">${phone}</td>
        </tr>
        ` : ""}
        ${teamSize ? `
        <tr>
          <td class="label">Organization Scale</td>
          <td class="value">${teamSize}</td>
        </tr>
        ` : ""}
        <tr>
          <td class="label">Target Service</td>
          <td class="value">${displayService}</td>
        </tr>
        <tr>
          <td class="label">SLA Tier</td>
          <td class="value">${cleanUrgency} Priority</td>
        </tr>
      </table>

      <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 6px;">
        SCOPE SPECIFICATIONS &amp; CLIENT MESSAGE
      </div>
      <div class="message-box">
${targetMessage}
      </div>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${adminPortalUrl}" class="btn">
          ${isTicket ? "Open Case in Admin Console" : "Review File in Inquiries Portal"}
        </a>
      </div>
    </div>

    <div class="footer">
      The Data Dot Enterprise Support Operations Desk<br>
      Hotline: +91 6380488373 &bull; Primary Mailbox: ${supportMailbox}
    </div>
  </div>
</body>
</html>
`;

    // -------------------------------------------------------------
    // TEMPLATE 2: Client Confirmation Receipt (Executive Corporate)
    // -------------------------------------------------------------
    const clientSubject = isTicket
      ? `Receipt: Service Case #${refId} Registered - The Data Dot`
      : `Confirmation: Service Request #${refId} Received - The Data Dot`;

    const slaCommitmentText =
      cleanUrgency === "Critical"
        ? "15-Minute Emergency Response SLA"
        : cleanUrgency === "High"
        ? "Priority Response within 4 Hours"
        : "Standard Business Response within Same-Day";

    const clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The Data Dot - Service Acknowledgement</title>
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
      margin-bottom: 26px;
    }
    .summary-table {
      width: 100%;
      border-collapse: collapse;
    }
    .summary-table td {
      padding: 11px 18px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .summary-table tr:last-child td {
      border-bottom: none;
    }
    .summary-label {
      width: 40%;
      color: #64748b;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-value {
      width: 60%;
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .timeline-container {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 22px;
      margin: 26px 0;
      background-color: #ffffff;
    }
    .timeline-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #475569;
      margin-bottom: 16px;
    }
    .timeline-row {
      display: table;
      width: 100%;
      margin-bottom: 14px;
    }
    .timeline-row:last-child {
      margin-bottom: 0;
    }
    .timeline-badge {
      display: table-cell;
      width: 26px;
      vertical-align: top;
    }
    .timeline-num {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background-color: #2563eb;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      line-height: 20px;
    }
    .timeline-body {
      display: table-cell;
      vertical-align: top;
      padding-left: 10px;
    }
    .timeline-heading {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 2px 0;
    }
    .timeline-desc {
      font-size: 12px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
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
        ${
          isTicket
            ? `We acknowledge receipt of your service case submission. Your incident file has been assigned reference tracking number <strong>#${refId}</strong> and entered into our engineering triage queue under our <strong>${slaCommitmentText}</strong>.`
            : `Thank you for contacting The Data Dot. We acknowledge receipt of your corporate IT consultation and Service Level Agreement (SLA) intake file. Your inquiry has been registered under reference tracking number <strong>#${refId}</strong> and routed to our solutions engineering desk under our <strong>${slaCommitmentText}</strong>.`
        }
      </p>

      <div class="summary-card">
        <table class="summary-table">
          <tr>
            <td class="summary-label">Reference ID</td>
            <td class="summary-value"><span style="color: #2563eb; font-family: monospace; font-size: 14px; font-weight: 700;">#${refId}</span></td>
          </tr>
          <tr>
            <td class="summary-label">Service Focus</td>
            <td class="summary-value">${displayService}</td>
          </tr>
          <tr>
            <td class="summary-label">SLA Commitment</td>
            <td class="summary-value">${cleanUrgency} Priority &bull; ${slaCommitmentText}</td>
          </tr>
          ${companyName ? `
          <tr>
            <td class="summary-label">Organization</td>
            <td class="summary-value">${companyName}</td>
          </tr>
          ` : ""}
          ${customerEmail ? `
          <tr>
            <td class="summary-label">Registered Email</td>
            <td class="summary-value">${customerEmail}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div class="timeline-container">
        <div class="timeline-title">Operational Workflow &amp; Next Steps</div>

        <div class="timeline-row">
          <div class="timeline-badge"><div class="timeline-num">1</div></div>
          <div class="timeline-body">
            <div class="timeline-heading">Technical Triage &amp; Scoping</div>
            <div class="timeline-desc">A senior solutions architect evaluates your infrastructure profile, hardware specifications, and required response window.</div>
          </div>
        </div>

        <div class="timeline-row">
          <div class="timeline-badge"><div class="timeline-num">2</div></div>
          <div class="timeline-body">
            <div class="timeline-heading">Dedicated Consultation &amp; Execution Proposal</div>
            <div class="timeline-desc">Our engineering desk will coordinate directly via phone or corporate email to finalize technical deliverables, NDA terms, and diagnostic logistics.</div>
          </div>
        </div>

        <div class="timeline-row">
          <div class="timeline-badge"><div class="timeline-num">3</div></div>
          <div class="timeline-body">
            <div class="timeline-heading">Client Portal Provisioning</div>
            <div class="timeline-desc">You can monitor live status progression, bench imaging telemetry, and technical reports through the secured client portal.</div>
          </div>
        </div>
      </div>

      <div class="cta-container">
        <a href="https://www.thedatadot.com/portal" class="btn-primary">
          Access Client Portal
        </a>
      </div>

      <div class="escalation-box">
        <strong>Need Immediate Emergency Assistance?</strong><br>
        24/7 Operations Desk Hotline: <a href="tel:+916380488373" style="color: #2563eb; text-decoration: none; font-weight: 700;">+91 6380488373</a> &bull; Support Mailbox: <a href="mailto:support@thedatadot.com" style="color: #2563eb; text-decoration: none; font-weight: 700;">support@thedatadot.com</a>
      </div>
    </div>

    <div class="footer">
      The Data Dot Enterprise Support &bull; ISO 27001 &amp; SOC 2 Type II Aligned<br>
      Operations Center: Plot 14B, Tech Park Road, Guindy, Chennai 600032
      <div class="legal-notice">
        CONFIDENTIALITY NOTICE: This transmission is intended strictly for the named recipient and may contain privileged or proprietary information. If you have received this message in error, please discard immediately.
      </div>
    </div>
  </div>
</body>
</html>
`;

    // -------------------------------------------------------------
    // DISPATCH LOGIC (Resilient Dual Send via Resend)
    // -------------------------------------------------------------
    let adminMailSent = false;
    let clientMailSent = false;
    let adminError: string | null = null;
    let clientError: string | null = null;
    let resendMessageId: string | null = null;

    if (apiKey) {
      const resend = new Resend(apiKey);

      const adminRecipients: string[] = [supportMailbox];
      if (adminEmail && !adminRecipients.includes(adminEmail.trim().toLowerCase())) {
        adminRecipients.push(adminEmail.trim());
      }
      if (technicianEmail && technicianEmail.includes("@") && !adminRecipients.includes(technicianEmail.trim().toLowerCase())) {
        adminRecipients.push(technicianEmail.trim());
      }

      const fromAlertSender = fromEmail ? `The Data Dot Alert <${fromEmail}>` : "The Data Dot Alert <onboarding@resend.dev>";
      const fromSupportSender = fromEmail ? `The Data Dot Support <${fromEmail}>` : "The Data Dot Support <onboarding@resend.dev>";

      // 1. Send Admin / Technician Alert Email
      try {
        const adminRes = await resend.emails.send({
          from: fromAlertSender,
          to: adminRecipients,
          subject: adminSubject,
          html: adminHtml,
        });

        if (adminRes.error) {
          adminError = adminRes.error.message || JSON.stringify(adminRes.error);
          console.error("Resend dispatch error to admin/technician mailbox:", adminRes.error);
        } else {
          adminMailSent = true;
          resendMessageId = adminRes.data?.id || null;
          console.log(`[EMAIL DISPATCH] Admin/Technician alert #${refId} delivered to ${adminRecipients.join(", ")}`);
        }
      } catch (err: any) {
        adminError = err.message || "Admin email send failed";
        console.error("Resend admin send exception:", err);
      }

      // 2. Send Client Confirmation Email (if valid client email)
      if (customerEmail && customerEmail.includes("@")) {
        try {
          const clientRes = await resend.emails.send({
            from: fromSupportSender,
            to: customerEmail,
            subject: clientSubject,
            html: clientHtml,
          });

          if (clientRes.error) {
            clientError = clientRes.error.message || JSON.stringify(clientRes.error);
            console.warn("Resend dispatch note for client email:", clientRes.error);
          } else {
            clientMailSent = true;
            console.log(`[EMAIL DISPATCH] Confirmation receipt #${refId} delivered to client ${customerEmail}`);
          }
        } catch (err: any) {
          clientError = err.message || "Client receipt send failed";
          console.warn("Resend client send note:", err);
        }
      }

      return NextResponse.json({
        success: true,
        refId,
        provider: "resend",
        adminMailSent,
        clientMailSent,
        adminError,
        clientError,
        resendMessageId,
      });
    }

    // Fallback when RESEND_API_KEY is not configured
    console.warn(
      `[EMAIL NOTICE] Alert for #${refId} skipped live delivery. RESEND_API_KEY is not configured.`
    );

    return NextResponse.json({
      success: true,
      refId,
      provider: "unconfigured",
      adminMailSent: false,
      clientMailSent: false,
      note: "Email generated but not dispatched. Please configure a valid RESEND_API_KEY in your environment variables.",
    });
  } catch (err: any) {
    console.error("Email API Route exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
