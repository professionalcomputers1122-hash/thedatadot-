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
      ? `🚨 [TICKET ALERT: ${cleanUrgency.toUpperCase()}] #${refId} - ${companyName || customerName}`
      : `🔔 [NEW CLIENT INQUIRY: ${cleanUrgency.toUpperCase()}] #${refId} - ${companyName || customerName}`;

    const adminPortalUrl = isTicket
      ? "https://thedatadot.vercel.app/admin/tickets"
      : "https://thedatadot.vercel.app/admin/inquiries";

    // -------------------------------------------------------------
    // TEMPLATE 1: Admin / Team Dispatch Notification ("New Form Mail")
    // -------------------------------------------------------------
    const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070e17; color: #f1f5f9; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 24px 32px; text-align: left; }
    .brand { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
    .badge-critical { background-color: #ef4444; color: #ffffff; }
    .badge-high { background-color: #f59e0b; color: #ffffff; }
    .badge-standard { background-color: #3b82f6; color: #ffffff; }
    .content { padding: 32px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
    .table td { padding: 12px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
    .table td.label { width: 35%; color: #94a3b8; font-weight: 600; }
    .table td.value { width: 65%; color: #f8fafc; font-weight: 700; }
    .message-box { background-color: #1e293b; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1; white-space: pre-wrap; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 13px; text-align: center; }
    .footer { background-color: #0b1120; padding: 20px 32px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">THE DATA DOT • ${isTicket ? "TICKET DISPATCH" : "CLIENT LEAD DISPATCH"}</div>
      <span class="badge badge-${cleanUrgency.toLowerCase()}">${cleanUrgency.toUpperCase()} SLA ALERT</span>
    </div>

    <div class="content">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #ffffff;">
        ${isTicket ? "New Ticket Submitted" : "New Website Form Submission"} #${refId}
      </h2>
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        Submitted via Website • Captured for Team Coordination
      </p>

      <table class="table">
        <tr>
          <td class="label">Reference ID</td>
          <td class="value"><span style="color: #60a5fa; font-family: monospace; font-size: 14px;">#${refId}</span></td>
        </tr>
        <tr>
          <td class="label">Client Name</td>
          <td class="value">${customerName || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Company / Org</td>
          <td class="value">${companyName || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Direct Email</td>
          <td class="value"><a href="mailto:${customerEmail}" style="color: #60a5fa; text-decoration: none;">${customerEmail || "N/A"}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td class="label">Phone Contact</td>
          <td class="value"><a href="tel:${phone}" style="color: #34d399; text-decoration: none; font-weight: bold;">${phone}</a></td>
        </tr>
        ` : ""}
        ${teamSize ? `
        <tr>
          <td class="label">Team / Company Size</td>
          <td class="value">${teamSize}</td>
        </tr>
        ` : ""}
        <tr>
          <td class="label">Target Service</td>
          <td class="value">${displayService}</td>
        </tr>
        <tr>
          <td class="label">SLA Priority</td>
          <td class="value"><strong style="color: ${cleanUrgency === "Critical" ? "#ef4444" : cleanUrgency === "High" ? "#f59e0b" : "#38bdf8"};">${cleanUrgency}</strong></td>
        </tr>
      </table>

      <div style="font-weight: 700; font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
        REQUIREMENTS / CLIENT MESSAGE:
      </div>
      <div class="message-box">
${targetMessage}
      </div>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${adminPortalUrl}" class="btn">
          ${isTicket ? "Open Ticket in Console →" : "Review & Coordinate in Inquiries Portal →"}
        </a>
      </div>
    </div>

    <div class="footer">
      The Data Dot Enterprise Support • 24/7 Rapid Response Desk<br>
      Hotline: +91 6380488373 • Mailbox: ${supportMailbox}
    </div>
  </div>
</body>
</html>
`;

    // -------------------------------------------------------------
    // TEMPLATE 2: Client Confirmation Receipt Email
    // -------------------------------------------------------------
    const clientSubject = isTicket
      ? `Received: Ticket #${refId} - The Data Dot`
      : `Confirmation: We Received Your Request #${refId} - The Data Dot`;

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
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .header { background: #0f172a; padding: 28px 32px; text-align: left; }
    .brand { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .tagline { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .content { padding: 32px; }
    .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; }
    .subtext { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; }
    .info-card { background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .info-row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .steps-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .step-item { display: flex; gap: 12px; margin-bottom: 14px; }
    .step-item:last-child { margin-bottom: 0; }
    .step-num { width: 24px; height: 24px; border-radius: 50%; background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-content h4 { margin: 0 0 2px 0; font-size: 13px; color: #0f172a; }
    .step-content p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.4; }
    .hotline-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center; font-size: 13px; color: #1e3a8a; }
    .footer { background-color: #f8fafc; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">THE DATA DOT</div>
      <div class="tagline">Enterprise IT Infrastructure & Cleanroom Data Recovery</div>
    </div>

    <div class="content">
      <h2 class="greeting">Thank you, ${customerName || "there"}!</h2>
      <p class="subtext">
        We have received your ${isTicket ? "service ticket" : "consultation and SLA request"}. Our engineering desk is currently reviewing your case details under our <strong>${slaCommitmentText}</strong> commitment.
      </p>

      <div class="info-card">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Reference Tracking #</td>
            <td style="padding: 6px 0; font-size: 14px; color: #2563eb; font-weight: 800; text-align: right; font-family: monospace;">#${refId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Requested Service</td>
            <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">${displayService}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">SLA Urgency Level</td>
            <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">${cleanUrgency} Priority</td>
          </tr>
          ${companyName ? `
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Company / Org</td>
            <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">${companyName}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div class="steps-box">
        <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 12px;">What happens next:</div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 32px; padding-bottom: 12px;">
              <div style="width: 22px; height: 22px; border-radius: 50%; background: #2563eb; color: #fff; font-size: 11px; font-weight: bold; text-align: center; line-height: 22px;">1</div>
            </td>
            <td style="padding-bottom: 12px;">
              <strong style="font-size: 13px; color: #0f172a;">Technical Evaluation</strong>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">A designated solutions architect reviews your infrastructure requirements and scope.</div>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 32px; padding-bottom: 12px;">
              <div style="width: 22px; height: 22px; border-radius: 50%; background: #2563eb; color: #fff; font-size: 11px; font-weight: bold; text-align: center; line-height: 22px;">2</div>
            </td>
            <td style="padding-bottom: 12px;">
              <strong style="font-size: 13px; color: #0f172a;">Coordination & Proposal</strong>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Our team will connect via phone or email to align on SLA terms, NDA signing, and diagnostics.</div>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 32px;">
              <div style="width: 22px; height: 22px; border-radius: 50%; background: #2563eb; color: #fff; font-size: 11px; font-weight: bold; text-align: center; line-height: 22px;">3</div>
            </td>
            <td>
              <strong style="font-size: 13px; color: #0f172a;">Client Portal Provisioning</strong>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">You'll receive personalized login access to track tickets, bench imaging, and forensic logs in real time.</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="hotline-box">
        <strong>Need Immediate Emergency Assistance?</strong><br>
        Call our 24/7 Rapid Response Escalation Desk directly at <a href="tel:+916380488373" style="color: #2563eb; font-weight: 800; text-decoration: none;">+91 6380488373</a>.
      </div>
    </div>

    <div class="footer">
      The Data Dot Enterprise Support • ISO 27001 &amp; SOC 2 Type II Certified<br>
      Automated dispatch confirmation. Please retain this email for your records.
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
    console.log(
      `[EMAIL SIMULATED] Alert for #${refId} queued for ${supportMailbox} and client ${customerEmail}. RESEND_API_KEY pending.`
    );

    return NextResponse.json({
      success: true,
      refId,
      provider: "simulated",
      adminMailSent: true,
      clientMailSent: !!(customerEmail && customerEmail.includes("@")),
      note: "Email generated. Configure RESEND_API_KEY for live delivery.",
    });
  } catch (err: any) {
    console.error("Email API Route exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
