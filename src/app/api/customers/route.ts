import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export const INITIAL_PRESETS = [
  {
    id: "CUST-0001",
    name: "Enterprise Admin",
    email: "support@thedatadot.com",
    company: "The Data Dot Engineering Desk",
    phone: "+91 6380488373",
    accountNumber: "TDD-CLI-0001",
    slaTier: "Internal Super Admin SLA",
    password: "Admin@DataDot2026!",
    status: "Active",
    activeTickets: 0,
  },
];

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Query audit logs to identify accounts that have been explicitly deleted
    const { data: delLogs } = await supabase
      .from("audit_logs")
      .select("target")
      .eq("action", "DELETE_CUSTOMER_ACCOUNT_AND_TICKETS");

    const deletedEmails = new Set<string>(
      (delLogs || []).map((d: any) => (d.target || "").toLowerCase().trim())
    );

    const { data: companies, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    const accountsMap = new Map<string, any>();

    // Process companies from Supabase first
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
          const emailNorm = meta.email.toLowerCase().trim();
          // Skip if this customer was deleted by admin
          if (deletedEmails.has(emailNorm)) continue;

          accountsMap.set(emailNorm, {
            id: comp.id,
            name: meta.contactName || meta.name || comp.name,
            company: comp.name,
            email: emailNorm,
            phone: meta.phone || "+91 6380488373",
            slaTier: comp.plan || meta.slaTier || "Enterprise 15-Min 24/7 SLA",
            password: meta.password,
            accountNumber: meta.accountNumber || `TDD-CLI-${comp.id.substring(0, 4).toUpperCase()}`,
            status: comp.contract_status || "Active",
            activeTickets: 0,
            createdAt: comp.created_at,
          });
        }
      }
    }

    // Only add presets if not deleted and not in database
    for (const preset of INITIAL_PRESETS) {
      const presetEmail = preset.email.toLowerCase().trim();
      if (!deletedEmails.has(presetEmail) && !accountsMap.has(presetEmail)) {
        accountsMap.set(presetEmail, preset);
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
      customers: INITIAL_PRESETS,
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

    if (!password || password.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: "An individual password of at least 4 characters is required" },
        { status: 400 }
      );
    }

    const assignedPassword = password.trim();
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

    // Check if company with this email already exists, update it if so
    const { data: existingCompanies } = await supabase
      .from("companies")
      .select("id, industry")
      .ilike("industry", `%"email":"${cleanEmail}"%`);

    let savedCompanyId = null;

    if (existingCompanies && existingCompanies.length > 0) {
      const existingId = existingCompanies[0].id;
      await supabase
        .from("companies")
        .update({
          name: cleanCompany,
          industry: metadata,
          plan: cleanSla,
        })
        .eq("id", existingId);
      savedCompanyId = existingId;
    } else {
      const { data, error } = await supabase
        .from("companies")
        .insert([
          {
            name: cleanCompany,
            industry: metadata,
            plan: cleanSla,
            contract_status: "Active Retainer",
            account_manager: "Enterprise Lead Desk",
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
      savedCompanyId = data?.id;
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
      id: savedCompanyId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
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

// PATCH: Super Admin updates individual password for a specific customer
export async function PATCH(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || password.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: "Valid email and new password (min 4 characters) required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const newPassword = password.trim();
    const supabase = createAdminClient();

    // Find company by email
    const { data: companies } = await supabase
      .from("companies")
      .select("*")
      .ilike("industry", `%"email":"${cleanEmail}"%`);

    if (companies && companies.length > 0) {
      const comp = companies[0];
      let meta: any = {};
      try {
        meta = JSON.parse(comp.industry);
      } catch {
        meta = {};
      }
      meta.password = newPassword;

      await supabase
        .from("companies")
        .update({ industry: JSON.stringify(meta) })
        .eq("id", comp.id);
    }

    // Audit log
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-PW-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "UPDATE_CUSTOMER_PASSWORD",
          target: cleanEmail,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log password update warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${cleanEmail}`,
    });
  } catch (err: any) {
    console.error("[API /api/customers PATCH exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update password" },
      { status: 500 }
    );
  }
}

// DELETE: Deletes company account AND cascades all tickets & messages
export async function DELETE(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email")?.toLowerCase().trim();
    const company = searchParams.get("company")?.trim();

    const supabase = createAdminClient();

    // 1. Delete company record & profiles
    if (id && id.length > 20 && id.includes("-")) {
      await supabase.from("companies").delete().eq("id", id);
    }
    if (email) {
      await supabase.from("companies").delete().ilike("industry", `%"email":"${email}"%`);
      await supabase.from("profiles").delete().ilike("email", email);
    }
    if (company) {
      await supabase.from("companies").delete().ilike("name", company);
    }

    // 2. Cascade delete all tickets for this customer email or company so they don't linger
    if (email || company) {
      // Find ticket IDs first to delete associated messages
      let ticketQuery = supabase.from("tickets").select("id");
      if (email && company) {
        ticketQuery = ticketQuery.or(`customer_email.ilike.${email},company_name.ilike.${company}`);
      } else if (email) {
        ticketQuery = ticketQuery.ilike("customer_email", email);
      } else if (company) {
        ticketQuery = ticketQuery.ilike("company_name", company);
      }
      const { data: customerTickets } = await ticketQuery;

      if (customerTickets && customerTickets.length > 0) {
        const ticketIds = customerTickets.map((t) => t.id);
        await supabase.from("ticket_messages").delete().in("ticket_id", ticketIds);
      }

      // Delete the tickets
      let delQuery = supabase.from("tickets").delete();
      if (email && company) {
        delQuery = delQuery.or(`customer_email.ilike.${email},company_name.ilike.${company}`);
      } else if (email) {
        delQuery = delQuery.ilike("customer_email", email);
      } else if (company) {
        delQuery = delQuery.ilike("company_name", company);
      }
      await delQuery;
    }

    // 3. Record in audit logs
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-DEL-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "DELETE_CUSTOMER_ACCOUNT_AND_TICKETS",
          target: email || id || "Unknown Customer",
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log delete warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Customer account and all associated tickets permanently deleted.",
    });
  } catch (err: any) {
    console.error("[API /api/customers DELETE exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}
