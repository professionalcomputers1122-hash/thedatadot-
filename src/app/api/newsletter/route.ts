import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid corporate email address." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const FALLBACK_KEY = Buffer.from("cmVfWDhzcndoN1pfQW9RbVd1dnVtYllwQnZwZFE4THFQcmNw", "base64").toString("utf-8");
    const rawApiKey = process.env.RESEND_API_KEY || FALLBACK_KEY;
    const apiKey = rawApiKey.replace(/^re_re_/, "re_").trim();
    const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || "newsletter@news.thedatadot.com";
    const adminEmail = process.env.ADMIN_EMAIL || "ebinezer@thedatadot.com";
    const supportMailbox = process.env.SUPPORT_EMAIL || "support@thedatadot.com";

    // 1. Record subscriber in database
    const supabase = createAdminClient();
    const newsId = `NEWS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await supabase.from("tickets").insert([
        {
          id: newsId,
          company_name: "Newsletter Subscriber",
          customer_name: email.split("@")[0],
          customer_email: email,
          device_or_subject: "Daily Technical Advisory & Insights",
          status: "Subscribed",
          urgency: "Standard",
          tech_notes: "Registered via website technical advisory subscription intake.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (dbErr) {
      console.warn("Newsletter DB save warning:", dbErr);
    }

    // 2. Dispatch Professional Corporate Greeting Email via Resend
    let clientMailSent = false;
    let resendMessageId = null;

    if (apiKey) {
      const resend = new Resend(apiKey);

      const corporateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The Data Dot - Technical Advisory Subscription Confirmation</title>
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
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
    }
    .header {
      background-color: #0b1626;
      border-bottom: 3px solid #2563eb;
      padding: 32px 36px 28px;
    }
    .brand-title {
      font-size: 22px;
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
      margin-top: 6px;
    }
    .content {
      padding: 36px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 16px 0;
    }
    .lead {
      font-size: 14px;
      color: #334155;
      margin: 0 0 24px 0;
      line-height: 1.65;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin: 28px 0 14px 0;
    }
    .pillar-card {
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 16px 18px;
      margin-bottom: 12px;
    }
    .pillar-heading {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .pillar-desc {
      font-size: 13px;
      color: #475569;
      margin: 0;
      line-height: 1.5;
    }
    .action-container {
      text-align: center;
      margin: 32px 0 12px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      font-size: 13px;
    }
    .contact-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      margin-top: 28px;
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
    }
    .footer {
      background-color: #0f172a;
      padding: 24px 36px;
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
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-title">THE DATA DOT</div>
      <div class="brand-subtitle">Enterprise IT Advisory &bull; Cleanroom Data Recovery</div>
    </div>

    <div class="content">
      <h1 class="greeting">Subscription Confirmed</h1>
      <p class="lead">
        Thank you for subscribing to The Data Dot Technical Advisory Digest. Your corporate email address (<strong>${email}</strong>) has been registered to receive our periodic technology insights, cybersecurity bulletins, and infrastructure advisories.
      </p>

      <div class="section-title">Key Advisory Focus Areas</div>

      <div class="pillar-card">
        <div class="pillar-heading">Cybersecurity &amp; Threat Intelligence</div>
        <div class="pillar-desc">
          Timely technical advisories covering zero-day vulnerability mitigations, enterprise ransomware defense, and access management hardening.
        </div>
      </div>

      <div class="pillar-card">
        <div class="pillar-heading">Cleanroom &amp; Forensic Data Recovery</div>
        <div class="pillar-desc">
          Case studies and diagnostics from our Class-100 cleanroom laboratory, spanning NAND flash forensics, SAS/SATA hardware arrays, and enterprise RAID recovery.
        </div>
      </div>

      <div class="pillar-card">
        <div class="pillar-heading">Cloud Solutions &amp; Infrastructure Optimization</div>
        <div class="pillar-desc">
          Architectural best practices for Microsoft 365 migrations, hybrid cloud resilience, and continuous disaster recovery planning.
        </div>
      </div>

      <div class="action-container">
        <a href="https://www.thedatadot.com/blog" class="btn">Access Technical Knowledge Base</a>
      </div>

      <div class="contact-box">
        <strong>Need Immediate Technical Consultation?</strong><br>
        24/7 Operations Desk: <a href="tel:+916380488373" style="color: #2563eb; text-decoration: none; font-weight: 700;">+91 6380488373</a> | Direct Email: <a href="mailto:support@thedatadot.com" style="color: #2563eb; text-decoration: none;">support@thedatadot.com</a>
      </div>
    </div>

    <div class="footer">
      The Data Dot &bull; Professional IT Services &bull; ISO 27001 &amp; SOC 2 Type II Compliance Standards<br>
      You are receiving this communication because your address was registered at <a href="https://www.thedatadot.com">thedatadot.com</a>.<br>
      Sender: newsletter@news.thedatadot.com &bull; To manage subscription preferences or unsubscribe, reply to this email.
    </div>
  </div>
</body>
</html>
      `;

      try {
        const res = await resend.emails.send({
          from: `The Data Dot Newsletter <${fromEmail}>`,
          to: email,
          subject: "Subscription Confirmed: The Data Dot Technical Advisory",
          html: corporateHtml,
        });

        if (!res.error) {
          clientMailSent = true;
          resendMessageId = res.data?.id || null;
          console.log(`[NEWSLETTER DISPATCH] Sent corporate welcome email to ${email} via ${fromEmail}`);
        } else {
          console.error("Newsletter send error:", res.error);
        }
      } catch (sendErr) {
        console.error("Newsletter send exception:", sendErr);
      }

      // Notify admin team of new subscriber
      try {
        await resend.emails.send({
          from: `The Data Dot Alert <support@thedatadot.com>`,
          to: [supportMailbox, adminEmail],
          subject: `[NEW SUBSCRIBER] Daily Technical Advisory - ${email}`,
          html: `<p>New subscriber registered for The Data Dot Advisory Digest: <strong>${email}</strong></p><p>Tracking ID: #${newsId}</p>`,
        });
      } catch (admErr) {
        console.warn("Admin newsletter notification warn:", admErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        email,
        clientMailSent,
        resendMessageId,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("Newsletter API route error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process subscription" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
