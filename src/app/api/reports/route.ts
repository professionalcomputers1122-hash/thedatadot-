import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export interface DiagnosisReportItem {
  id: string; // e.g. "DR-2003"
  jobId: string; // "2003"
  reportDateIso: string;
  recoveryDateIso: string;
  clientName: string;
  deviceType: "HDD" | "SSD" | "NVMe" | "FLASH";
  brand: string;
  model: string;
  serialNumber: string;
  capacity: string;
  iface: string;
  fileSystem: string;
  diagnosis: string;
  symptoms: string;
  findings: string;
  recoveryMethod: string;
  recoveryAssessment: string;
  estimatedTime: string;
  diagnosisCharge: string;
  finalRecoveryCost: string;
  recoveryStatus: string;
  recoveredData: string;
  dataVerification: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const supabase = createAdminClient();

    // 1. Check for permanently deleted reports in audit_logs
    const deletedReportIds = new Set<string>();
    try {
      const { data: deleteLogs } = await supabase
        .from("audit_logs")
        .select("target")
        .eq("action", "DELETE_REPORT");

      if (deleteLogs) {
        deleteLogs.forEach((l) => {
          const match = l.target?.match(/Report\s*#?([A-Za-z0-9\-]+)/i);
          if (match && match[1]) {
            deletedReportIds.add(match[1].trim().toUpperCase());
          }
        });
      }
    } catch (logErr) {
      console.warn("Audit log check note for reports GET:", logErr);
    }

    // 2. Query Supabase tickets table for reports (IDs starting with DR- or RPT-)
    let query = supabase
      .from("tickets")
      .select("*")
      .or("id.ilike.DR-%,id.ilike.RPT-%")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `id.ilike.%${search}%,customer_name.ilike.%${search}%,device_or_subject.ilike.%${search}%,serial_number.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API /api/reports GET error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 3. Map rows and parse JSON payload from symptoms
    const reports: DiagnosisReportItem[] = (data || [])
      .filter((row) => !deletedReportIds.has((row.id || "").trim().toUpperCase()))
      .map((row) => {
        let payload: any = {};
        try {
          if (row.symptoms && row.symptoms.startsWith("{")) {
            payload = JSON.parse(row.symptoms);
          }
        } catch {
          payload = {};
        }

        const rawJobId = (row.id || "").replace(/^DR-|^RPT-/i, "") || payload.jobId || "2003";

        return {
          id: row.id,
          jobId: payload.jobId || rawJobId,
          reportDateIso: payload.reportDateIso || new Date(row.created_at).toISOString().split("T")[0],
          recoveryDateIso: payload.recoveryDateIso || new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
          clientName: row.customer_name || payload.clientName || "Client",
          deviceType: (payload.deviceType || row.media_type || "HDD") as any,
          brand: payload.brand || "Seagate",
          model: payload.model || "Barracuda",
          serialNumber: row.serial_number || payload.serialNumber || "ABC123456",
          capacity: payload.capacity || "1TB",
          iface: payload.iface || row.assigned_bench || "SATA",
          fileSystem: payload.fileSystem || "NTFS",
          diagnosis: payload.diagnosis || row.tech_notes || "Head failure",
          symptoms: payload.symptoms || "Drive not detecting, clicking sound",
          findings: payload.findings || "Read/write heads damaged",
          recoveryMethod: payload.recoveryMethod || "Head replacement and controlled data imaging",
          recoveryAssessment: payload.recoveryAssessment || "Recovery possible, subject to platter condition",
          estimatedTime: payload.estimatedTime || row.urgency || "7–10 Business Days",
          diagnosisCharge: payload.diagnosisCharge || "₹750",
          finalRecoveryCost: payload.finalRecoveryCost || "₹15,000–₹17,500",
          recoveryStatus: payload.recoveryStatus || row.status || "Pending",
          recoveredData: payload.recoveredData || "-",
          dataVerification: payload.dataVerification || "Pending",
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (err: any) {
    console.error("[API /api/reports GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      jobId = `${Math.floor(1000 + Math.random() * 9000)}`,
      clientName = "Client",
      deviceType = "HDD",
      brand = "Seagate",
      model = "Barracuda",
      serialNumber = "ABC123456",
      capacity = "1TB",
      iface = "SATA",
      fileSystem = "NTFS",
      diagnosis = "Head failure",
      symptoms = "Clicking sound, drive not detecting",
      findings = "Read/write heads completely damaged",
      recoveryMethod = "Head replacement and controlled data imaging",
      recoveryAssessment = "Recovery possible, subject to platter condition",
      estimatedTime = "7–10 Business Days",
      diagnosisCharge = "₹750",
      finalRecoveryCost = "₹15,000–₹17,500",
      recoveryStatus = "Pending",
      recoveredData = "-",
      dataVerification = "Pending",
      reportDateIso = new Date().toISOString().split("T")[0],
      recoveryDateIso = new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    } = body;

    const reportId = `DR-${jobId}`;

    const fullReportPayload = {
      jobId,
      reportDateIso,
      recoveryDateIso,
      clientName,
      deviceType,
      brand,
      model,
      serialNumber,
      capacity,
      iface,
      fileSystem,
      diagnosis,
      symptoms,
      findings,
      recoveryMethod,
      recoveryAssessment,
      estimatedTime,
      diagnosisCharge,
      finalRecoveryCost,
      recoveryStatus,
      recoveredData,
      dataVerification,
    };

    const supabaseRecord = {
      id: reportId,
      customer_name: clientName,
      customer_email: "support@thedatadot.com",
      company_name: "The Data Dot Lab",
      device_or_subject: `${brand} ${model} (${capacity})`,
      serial_number: serialNumber,
      media_type: deviceType,
      status: recoveryStatus,
      urgency: "Standard",
      assigned_bench: iface,
      tech_notes: diagnosis,
      symptoms: JSON.stringify(fullReportPayload),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();

    // Upsert into tickets relation in Supabase
    const { data, error } = await supabase
      .from("tickets")
      .upsert(supabaseRecord, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("[API /api/reports POST Supabase error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Insert Audit Log
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-REP-${Date.now().toString(36).toUpperCase()}`,
          actor: "Technician Desk",
          action: "SAVE_DIAGNOSIS_REPORT",
          target: `Report #${reportId} (${clientName} - ${serialNumber})`,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log warning on report save:", auditErr);
    }

    return NextResponse.json({
      success: true,
      report: {
        ...fullReportPayload,
        id: reportId,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
      },
    });
  } catch (err: any) {
    console.error("[API /api/reports POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save report" },
      { status: 500 }
    );
  }
}
