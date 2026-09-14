import { NextResponse } from "next/server";
import { Resend } from "resend";

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 submissions per minute

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
          error: "Rate limit exceeded. Too many requests in a short period. Please wait 60 seconds before trying again.",
        },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    timestamps.push(now);
    rateLimitMap.set(clientIp, timestamps);

    const body = await req.json();
    const {
      type, // "ticket" | "contact"
      ticketId,
      customerName,
      customerEmail,
      companyName,
      phone,
      service,
      deviceOrSubject,
      serialNumber,
      urgency = "Standard",
      symptoms,
      message,
    } = body;

    const supportMailbox = process.env.SUPPORT_EMAIL || "support@thedatadot.com";
    const apiKey = process.env.RESEND_API_KEY;

    const refId = ticketId || `TDD-${Math.floor(100000 + Math.random() * 900000)}`;
    const subject =
      type === "ticket"
        ? `[TICKET ALERT: ${urgency.toUpperCase()}] #${refId} - ${companyName || customerName}`
        : `[NEW INQUIRY] #${refId} from ${customerName} (${companyName || "General"})`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070e17; color: #f1f5f9; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
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
    .message-box { background-color: #1e293b; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 13px; text-align: center; }
    .footer { background-color: #0b1120; padding: 20px 32px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">THE DATA DOT • SUPPORT DISPATCH</div>
      <span class="badge badge-${urgency.toLowerCase()}">${urgency.toUpperCase()} SLA ALERT</span>
    </div>

    <div class="content">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #ffffff;">Incoming Request #${refId}</h2>
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        Submitted on Website • Persisted in Supabase PostgreSQL
      </p>

      <table class="table">
        <tr>
          <td class="label">Reference / Ticket ID</td>
          <td class="value">${refId}</td>
        </tr>
        <tr>
          <td class="label">Client Name</td>
          <td class="value">${customerName || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Organization / Company</td>
          <td class="value">${companyName || "N/A"}</td>
        </tr>
        <tr>
          <td class="label">Client Email</td>
          <td class="value"><a href="mailto:${customerEmail}" style="color: #60a5fa;">${customerEmail || "N/A"}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td class="label">Phone Contact</td>
          <td class="value">${phone}</td>
        </tr>
        ` : ""}
        <tr>
          <td class="label">Service Category</td>
          <td class="value">${service || "Cleanroom Data Recovery"}</td>
        </tr>
        ${deviceOrSubject ? `
        <tr>
          <td class="label">Hardware / Subject</td>
          <td class="value">${deviceOrSubject}</td>
        </tr>
        ` : ""}
        ${serialNumber ? `
        <tr>
          <td class="label">Serial / Model #</td>
          <td class="value">${serialNumber}</td>
        </tr>
        ` : ""}
      </table>

      ${(symptoms || message) ? `
      <div style="font-weight: 700; font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
        DIAGNOSTIC / CLIENT NOTES:
      </div>
      <div class="message-box">
        ${symptoms || message}
      </div>
      ` : ""}

      <div style="text-align: center; margin-top: 28px;">
        <a href="http://localhost:3000/technician/dashboard" class="btn">
          View in Workbench Console →
        </a>
      </div>
    </div>

    <div class="footer">
      The Data Dot Enterprise Support • 24/7 Rapid Response Unit<br>
      Hotline: +91 6380488373 • Mailbox: ${supportMailbox}
    </div>
  </div>
</body>
</html>
    `;

    // Dispatch email if RESEND_API_KEY is configured
    if (apiKey) {
      const resend = new Resend(apiKey);

      // 1. Send alert to support mailbox
      const { data, error } = await resend.emails.send({
        from: "The Data Dot Alert <onboarding@resend.dev>",
        to: supportMailbox,
        subject,
        html: htmlContent,
      });

      if (error) {
        console.error("Resend API dispatch error to support mailbox:", error);
      }

      // 2. Also send confirmation receipt to customer if valid email provided
      if (customerEmail && customerEmail.includes("@")) {
        await resend.emails.send({
          from: "The Data Dot Support <onboarding@resend.dev>",
          to: customerEmail,
          subject: `Received: Ticket #${refId} - The Data Dot`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #2563eb;">We have received your support request</h2>
              <p>Hello ${customerName || "there"},</p>
              <p>Your case <strong>#${refId}</strong> has been logged in our system under <strong>${urgency}</strong> SLA priority.</p>
              <p>Our dedicated engineering team is reviewing your hardware/service requirements and will contact you shortly.</p>
              <p>For immediate emergency assistance, call our 24/7 hotline at <strong>+91 6380488373</strong>.</p>
              <br>
              <p>Best regards,<br><strong>The Data Dot Engineering Desk</strong></p>
            </div>
          `,
        });
      }

      return NextResponse.json({
        success: true,
        dispatched: true,
        refId,
        provider: "resend",
        resendId: data?.id,
      });
    }

    // Fallback when API key is pending configuration
    console.log(
      `[EMAIL DISPATCH] Alert for #${refId} queued for Support Mailbox (${supportMailbox}). RESEND_API_KEY pending.`
    );

    return NextResponse.json({
      success: true,
      dispatched: false,
      refId,
      provider: "resend_simulated",
      note: "Email generated. Configure RESEND_API_KEY in .env.local for live delivery.",
    });
  } catch (err: any) {
    console.error("Email API Route failure:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
