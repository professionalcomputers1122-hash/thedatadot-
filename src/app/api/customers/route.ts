import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export const DEFAULT_ACCOUNTS = [
  {
    id: "CUST-1001",
    name: "Ebinezer",
    email: "ebinezer@thedatadot.com",
    company: "The Data Dot Client Desk",
    phone: "+91 6380488373",
    accountNumber: "TDD-CLI-1001",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    password: "Password@123",
    status: "Active",
    activeTickets: 0,
  },
  {
    id: "CUST-0001",
    name: "Enterprise Admin",
    email: "support@thedatadot.com",
    company: "The Data Dot Engineering Desk",
    phone: "+91 6380488373",
    accountNumber: "TDD-CLI-0001",
    slaTier: "Internal Super Admin SLA",
    password: "Password@123",
    status: "Active",
    activeTickets: 0,
  },
  {
    id: "CUST-8492",
    name: "Dr. Aravind Swaminathan",
    email: "aravind@scandiagnostics.com",
    company: "Apex Healthcare Diagnostic Center",
    phone: "+91 98402 11928",
    accountNumber: "TDD-CLI-8492",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    password: "Password@123",
    status: "Active",
    activeTickets: 1,
  },
  {
    id: "CUST-8493",
    name: "Dr. Aravind Swaminathan",
    email: "aravind@apexhealth.com",
    company: "Apex Healthcare Diagnostic Center",
    phone: "+91 98402 11928",
    accountNumber: "TDD-CLI-8493",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    password: "Password@123",
    status: "Active",
    activeTickets: 1,
  },
  {
    id: "CUST-9021",
    name: "Advocate K. V. Sundaram",
    email: "sundaram@nexuslegal.in",
    company: "Nexus Legal Advisors LLP",
    phone: "+91 94441 82910",
    accountNumber: "TDD-CLI-9021",
    slaTier: "Priority 4-Hour Response",
    password: "Password@123",
    status: "Active",
    activeTickets: 1,
  },
  {
    id: "CUST-6614",
    name: "M. Rajesh Kumar",
    email: "rajesh@metrologistics.com",
    company: "Metropolitan Logistics Warehousing",
    phone: "+91 97909 34120",
    accountNumber: "TDD-CLI-6614",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    password: "Password@123",
    status: "Active",
    activeTickets: 1,
  },
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: companies, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[API /api/customers GET] Supabase warning:", error.message);
      return NextResponse.json({
        success: true,
        customers: DEFAULT_ACCOUNTS,
      });
    }

    const accountsMap = new Map<string, any>();

    // Load defaults first
    for (const acc of DEFAULT_ACCOUNTS) {
      accountsMap.set(acc.email.toLowerCase(), acc);
    }

    // Process companies from Supabase
    if (companies && Array.isArray(companies)) {
      for (const comp of companies) {
        let meta: any = null;
        try {
          if (comp.industry && comp.industry.startsWith("{")) {
            meta = JSON.parse(comp.industry);
          }
        } catch {
          // not json
        }

        if (meta && meta.email) {
          const emailNorm = meta.email.toLowerCase();
          accountsMap.set(emailNorm, {
            id: comp.id,
            name: meta.contactName || meta.name || comp.name,
            company: comp.name,
            email: emailNorm,
            phone: meta.phone || "+91 6380488373",
            slaTier: comp.plan || meta.slaTier || "Enterprise 15-Min 24/7 SLA",
            password: meta.password || "Password@123",
            accountNumber: meta.accountNumber || `TDD-CLI-${comp.id.substring(0, 4).toUpperCase()}`,
            status: comp.contract_status || "Active",
            activeTickets: 0,
            createdAt: comp.created_at,
          });
        }
      }
    }

    const customerList = Array.from(accountsMap.values());

    return NextResponse.json({
      success: true,
      count: customerList.length,
      customers: customerList,
    });
  } catch (err: any) {
    console.error("[API /api/customers GET exception]:", err);
    return NextResponse.json({
      success: true,
      customers: DEFAULT_ACCOUNTS,
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
    const { name, company, email, phone, slaTier, password } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!company || !name) {
      return NextResponse.json(
        { success: false, error: "Company name and contact person name are required" },
        { status: 400 }
      );
    }

    const assignedPassword = (password && password.trim().length >= 4)
      ? password.trim()
      : `Client@${new Date().getFullYear()}!`;

    const cleanEmail = email.trim().toLowerCase();
    const cleanCompany = company.trim();
    const cleanName = name.trim();
    const cleanPhone = (phone && phone.trim()) || "+91 6380488373";
    const cleanSla = slaTier || "Enterprise 15-Min 24/7 SLA";
    const accountNumber = `TDD-CLI-${Math.floor(1000 + Math.random() * 9000)}`;

    const metadata = JSON.stringify({
      contactName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: assignedPassword,
      accountNumber,
      slaTier: cleanSla,
    });

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          name: cleanCompany,
          industry: metadata,
          plan: cleanSla,
          contract_status: "Active Retainer",
          account_manager: "S. Murugan",
          devices_recovered: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[API /api/customers POST insert error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Audit log
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-CLI-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "PROVISION_ENTERPRISE_CLIENT",
          target: `${cleanEmail} (${cleanCompany})`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log creation warning:", auditErr);
    }

    const createdCustomer = {
      id: data?.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: cleanName,
      company: cleanCompany,
      email: cleanEmail,
      phone: cleanPhone,
      slaTier: cleanSla,
      password: assignedPassword,
      accountNumber,
      status: "Active",
      activeTickets: 0,
    };

    return NextResponse.json({
      success: true,
      customer: createdCustomer,
    });
  } catch (err: any) {
    console.error("[API /api/customers POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to provision customer" },
      { status: 500 }
    );
  }
}
