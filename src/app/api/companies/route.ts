import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { initialCompanies, CompanyRecord } from "@/lib/portalData";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Query audit logs to check for deleted companies
    const { data: delLogs } = await supabase
      .from("audit_logs")
      .select("target")
      .eq("action", "DELETE_COMPANY_ORGANIZATION");

    const deletedNames = new Set<string>(
      (delLogs || []).map((d: any) => (d.target || "").toLowerCase().trim())
    );

    // Fetch companies from Supabase
    const { data: dbCompanies } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    const companyMap = new Map<string, CompanyRecord>();

    // Add initial companies first if not deleted
    for (const c of initialCompanies) {
      const normName = c.name.toLowerCase().trim();
      const normId = c.id.toLowerCase().trim();
      if (!deletedNames.has(normName) && !deletedNames.has(normId)) {
        companyMap.set(normName, c);
      }
    }

    // Overlay database companies
    if (dbCompanies && Array.isArray(dbCompanies)) {
      for (const comp of dbCompanies) {
        const normName = (comp.name || "").toLowerCase().trim();
        const normId = (comp.id || "").toLowerCase().trim();
        if (deletedNames.has(normName) || deletedNames.has(normId)) continue;

        companyMap.set(normName, {
          id: comp.id.length > 8 ? `ORG-${comp.id.substring(0, 4).toUpperCase()}` : comp.id,
          name: comp.name,
          industry: comp.industry && !comp.industry.startsWith("{") ? comp.industry : "Enterprise IT Infrastructure",
          plan: comp.plan || "Enterprise 15-Min 24/7 SLA",
          accountManager: comp.account_manager || "K. Vignesh",
          devicesRecovered: comp.devices_recovered || 0,
          contractStatus: (comp.contract_status as any) || "Active Retainer",
        });
      }
    }

    return NextResponse.json({
      success: true,
      companies: Array.from(companyMap.values()),
    });
  } catch (err: any) {
    console.error("[API /api/companies GET exception]:", err);
    return NextResponse.json({
      success: true,
      companies: initialCompanies,
    });
  }
}

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const { name, industry, plan, accountManager, contractStatus } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Valid company name is required" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanIndustry = industry ? industry.trim() : "Enterprise IT & Technology";
    const cleanPlan = plan || "Enterprise 15-Min 24/7 SLA";
    const cleanManager = accountManager || "K. Vignesh";
    const cleanStatus = contractStatus || "Active Retainer";
    const orgId = `ORG-${Math.floor(100 + Math.random() * 900)}`;

    const newCompany: CompanyRecord = {
      id: orgId,
      name: cleanName,
      industry: cleanIndustry,
      plan: cleanPlan,
      accountManager: cleanManager,
      devicesRecovered: 0,
      contractStatus: cleanStatus as any,
    };

    try {
      const supabase = createAdminClient();
      await supabase.from("companies").insert([
        {
          name: cleanName,
          industry: cleanIndustry,
          plan: cleanPlan,
          account_manager: cleanManager,
          contract_status: cleanStatus,
          devices_recovered: 0,
        },
      ]);

      await supabase.from("audit_logs").insert([
        {
          id: `LOG-ORG-ADD-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "REGISTER_COMPANY_ORGANIZATION",
          target: cleanName,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (dbErr) {
      console.warn("Database company insert warning:", dbErr);
    }

    return NextResponse.json({
      success: true,
      company: newCompany,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create company" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (!id && !name) {
      return NextResponse.json(
        { success: false, error: "Company ID or Name is required for deletion" },
        { status: 400 }
      );
    }

    const cleanName = name ? name.trim() : "";
    const cleanId = id ? id.trim() : "";

    const supabase = createAdminClient();

    // 1. Delete company record from Supabase
    try {
      if (cleanId && cleanId.includes("-") && cleanId.length > 30) {
        // UUID format
        await supabase.from("companies").delete().eq("id", cleanId);
      }
      if (cleanName) {
        await supabase.from("companies").delete().ilike("name", cleanName);
      }
    } catch (e) {
      console.warn("Company table delete warning:", e);
    }

    // 2. Log audit trail to record permanent deletion
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-ORG-DEL-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "DELETE_COMPANY_ORGANIZATION",
          target: cleanName || cleanId,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Company delete audit log warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Organization "${cleanName || cleanId}" permanently deleted.`,
    });
  } catch (err: any) {
    console.error("[API /api/companies DELETE exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete company organization" },
      { status: 500 }
    );
  }
}
