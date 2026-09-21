import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const supabase = createAdminClient();

    // 1. Check for any inquiries permanently deleted in audit_logs
    const deletedInquiryIds = new Set<string>();
    try {
      const { data: deleteLogs } = await supabase
        .from("audit_logs")
        .select("target")
        .eq("action", "DELETE_INQUIRY");

      if (deleteLogs) {
        deleteLogs.forEach((l) => {
          const match = l.target?.match(/Inquiry\s*#?([A-Za-z0-9\-]+)/i);
          if (match && match[1]) {
            deletedInquiryIds.add(match[1].trim().toUpperCase());
          }
        });
      }
    } catch (logErr) {
      console.warn("Audit logs check note in inquiries GET:", logErr);
    }

    // 2. Fetch all inquiry-type tickets from Supabase
    // We look for IDs starting with INQ- OR status in inquiry workflow stages
    let query = supabase
      .from("tickets")
      .select("*")
      .or("id.ilike.INQ-%,status.eq.New Request,status.eq.In Coordination,status.eq.Contacted,status.eq.Converted")
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `id.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,company_name.ilike.%${search}%,device_or_subject.ilike.%${search}%,serial_number.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API /api/inquiries GET error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Filter out deleted inquiries
    const cleanInquiries = (data || [])
      .filter((row) => !deletedInquiryIds.has((row.id || "").trim().toUpperCase()))
      .map((row) => {
        let parsedSymptoms = { phone: row.serial_number || "", teamSize: "", message: row.symptoms || "" };
        try {
          if (row.symptoms && row.symptoms.startsWith("{")) {
            parsedSymptoms = { ...parsedSymptoms, ...JSON.parse(row.symptoms) };
          }
        } catch {
          // not json, keep fallback
        }

        return {
          id: row.id,
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          companyName: row.company_name,
          phone: parsedSymptoms.phone || row.serial_number || "",
          teamSize: parsedSymptoms.teamSize || "11 - 50 employees",
          service: row.device_or_subject,
          urgency: row.urgency || "Standard",
          message: parsedSymptoms.message || row.symptoms || "",
          source: (parsedSymptoms as any).source || (row.id.startsWith("INQ-ONB") ? "Client Onboarding Portal" : "Website Contact Form"),
          coordinationNotes: row.tech_notes || "",
          status: row.status || "New Request",
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });

    return NextResponse.json({
      success: true,
      count: cleanInquiries.length,
      inquiries: cleanInquiries,
    });
  } catch (err: any) {
    console.error("[API /api/inquiries GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
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
    const finalName = (body.customerName || body.name || body.contactName || body.fullName || "").trim();
    const finalEmail = (body.customerEmail || body.email || "").trim();
    const finalCompany = (body.companyName || body.company || "Direct Client Inquiry").trim();
    const {
      phone = "",
      teamSize = "11 - 50 employees",
      service,
      serviceNeeded,
      urgency,
      sla,
      slaTier,
      message,
      requirements,
      source = "Website Consultation / SLA Form",
      id,
    } = body;

    const finalService = service || serviceNeeded || "General Consultation & SLA";
    const rawUrgency = urgency || sla || slaTier || "Standard";
    const finalUrgency = rawUrgency.toLowerCase().includes("15-min") || rawUrgency.toLowerCase().includes("critical")
      ? "Critical"
      : rawUrgency.toLowerCase().includes("4-hour") || rawUrgency.toLowerCase().includes("high")
      ? "High"
      : "Standard";
    const finalMessage = message || requirements || "No additional message provided.";

    if (!finalName || !finalEmail) {
      return NextResponse.json(
        { success: false, error: "Name and email are required to submit an inquiry." },
        { status: 400 }
      );
    }

    const inquiryId = id || `INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const structuredSymptoms = JSON.stringify({
      phone: phone || "N/A",
      teamSize: teamSize || "11 - 50 employees",
      message: finalMessage,
      source: source || "Website Consultation / SLA Form",
    });

    const record = {
      id: inquiryId,
      company_name: finalCompany,
      customer_name: finalName,
      customer_email: finalEmail,
      device_or_subject: finalService,
      media_type: "GENERAL",
      serial_number: phone || "N/A",
      status: "New Request",
      cloned_percent: 0,
      urgency: finalUrgency,
      symptoms: structuredSymptoms,
      tech_notes: `Initial inquiry logged from ${source}. Awaiting team coordination.`,
      assigned_bench: "Client Coordination Desk",
      assigned_tech: "Unassigned",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();

    // 1. Insert inquiry into Supabase
    const { data, error } = await supabase
      .from("tickets")
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error("[API /api/inquiries POST database error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 2. Insert audit log
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-INQ-${Date.now().toString(36).toUpperCase()}`,
          actor: `${finalName} (${finalEmail})`,
          action: "NEW_CLIENT_INQUIRY",
          target: `Inquiry #${inquiryId}`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log insert warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      inquiryId,
      inquiry: {
        id: inquiryId,
        customerName: finalName,
        customerEmail: finalEmail,
        companyName: finalCompany,
        phone,
        teamSize,
        service: finalService,
        urgency: finalUrgency,
        message: finalMessage,
        source: source || "Website Consultation / SLA Form",
        status: "New Request",
        createdAt: record.created_at,
      },
    });
  } catch (err: any) {
    console.error("[API /api/inquiries POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to log client inquiry" },
      { status: 500 }
    );
  }
}
