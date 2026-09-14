// Shared Mock Data Store for Customer, Technician, and Admin Portals

export interface Ticket {
  id: string;
  customerName: string;
  companyName: string;
  customerEmail?: string;
  category: "Data Recovery" | "Cloud Solutions" | "Cybersecurity" | "Managed IT";
  deviceOrSubject: string;
  serialNumber?: string;
  status: "Media Received" | "Cleanroom Diagnosis" | "PC-3000 Imaging" | "Integrity Verification" | "Resolved";
  priority: "CRITICAL" | "HIGH" | "STANDARD";
  assignedTech: string;
  clonedPercent?: number;
  recoveredSize?: string;
  createdAt: string;
  lastUpdated: string;
  symptoms: string;
  techNotes: string;
}

export const initialTickets: Ticket[] = [
  {
    id: "TDD-8942",
    customerName: "Dr. Aravind Swaminathan",
    companyName: "Apex Healthcare Diagnostic Center",
    category: "Data Recovery",
    deviceOrSubject: "Seagate IronWolf Pro 4TB SATA 3.5\"",
    serialNumber: "WDC-WMC4N0E83719",
    status: "PC-3000 Imaging",
    priority: "CRITICAL",
    assignedTech: "S. Murugan (Cleanroom Lead)",
    clonedPercent: 99.8,
    recoveredSize: "3.82 TB of 4.0 TB",
    createdAt: "Sep 12, 2026",
    lastUpdated: "12 mins ago",
    symptoms: "Loud clicking head crash following power outage on MRI scanner server.",
    techNotes: "Heads 0-3 reading cleanly following ISO Class-5 donor slider swap. Mirrored 3.82 TB.",
  },
  {
    id: "TDD-8943",
    customerName: "Advocate Rajesh Menon",
    companyName: "Nexus Legal Advisors LLP",
    category: "Data Recovery",
    deviceOrSubject: "Samsung 980 Pro NVMe 2TB M.2",
    serialNumber: "S6B0NS0W102948F",
    status: "Cleanroom Diagnosis",
    priority: "HIGH",
    assignedTech: "K. Vignesh (Solid State Forensic)",
    clonedPercent: 74.5,
    recoveredSize: "1.49 TB of 2.0 TB",
    createdAt: "Sep 13, 2026",
    lastUpdated: "1 hour ago",
    symptoms: "Elpis controller locked in read-only safe mode. BitLocker key on file.",
    techNotes: "Bypassing bad NAND blocks in bank 2 using PC-3000 Flash virtual translator.",
  },
  {
    id: "TDD-8944",
    customerName: "Dinesh Karthik",
    companyName: "Metropolitan Logistics Warehousing",
    category: "Data Recovery",
    deviceOrSubject: "QNAP TS-453D 4-Bay RAID 5 (WD Red Plus 4TB x4)",
    serialNumber: "QNP-RAID-9921",
    status: "Cleanroom Diagnosis",
    priority: "CRITICAL",
    assignedTech: "S. Murugan (Cleanroom Lead)",
    clonedPercent: 42.0,
    recoveredSize: "5.1 TB of 12.0 TB",
    createdAt: "Sep 13, 2026",
    lastUpdated: "2 hours ago",
    symptoms: "Disk 2 failed 2 months ago, Disk 4 dropped out yesterday during warehouse audit.",
    techNotes: "XOR parity algorithm calculating missing block sectors. Volume reconstruction in progress.",
  },
  {
    id: "TDD-8910",
    customerName: "Kavitha Ramanathan",
    companyName: "Sri Lakshmi Tax & Audits",
    category: "Cloud Solutions",
    deviceOrSubject: "Microsoft 365 MFA Policy & Mailbox Audit",
    status: "Resolved",
    priority: "STANDARD",
    assignedTech: "R. Balaji (Cloud Security)",
    createdAt: "Sep 10, 2026",
    lastUpdated: "Sep 11, 2026",
    symptoms: "Quarterly audit of employee MFA policies and immutable cloud backup verification.",
    techNotes: "All 35 accounts secured with FIDO2/Authenticator apps. Immutable Veeam snapshot confirmed.",
  },
];

export const initialCustomers = [
  {
    id: "CUST-001",
    name: "Dr. Aravind Swaminathan",
    company: "Apex Healthcare Diagnostic Center",
    email: "aravind@scandiagnostics.com",
    phone: "+91 98402 11928",
    sla: "Enterprise 15-Min",
    activeTickets: 1,
    status: "Active",
  },
  {
    id: "CUST-002",
    name: "Advocate Rajesh Menon",
    company: "Nexus Legal Advisors LLP",
    email: "rmenon@nexuslegal.in",
    phone: "+91 98410 44231",
    sla: "Priority 4-Hour",
    activeTickets: 1,
    status: "Active",
  },
  {
    id: "CUST-003",
    name: "Dinesh Karthik",
    company: "Metropolitan Logistics Warehousing",
    email: "dkarthik@metrologistics.com",
    phone: "+91 99400 88219",
    sla: "Enterprise 15-Min",
    activeTickets: 1,
    status: "Active",
  },
  {
    id: "CUST-004",
    name: "Kavitha Ramanathan",
    company: "Sri Lakshmi Tax & Audits",
    email: "k.raman@srilakshmi-audits.in",
    phone: "+91 94441 82739",
    sla: "Standard",
    activeTickets: 0,
    status: "Active",
  },
];

export const initialTechnicians = [
  {
    id: "TECH-048",
    name: "S. Murugan",
    email: "murugan.tech@thedatadot.com",
    role: "Cleanroom Storage Lead",
    station: "PC-3000 Bench 01 (Class-5 Hood)",
    activeCases: 2,
    status: "On Bench",
  },
  {
    id: "TECH-052",
    name: "K. Vignesh",
    email: "vignesh.ssd@thedatadot.com",
    role: "Solid State & NVMe Specialist",
    station: "PC-3000 Flash & Portable III",
    activeCases: 1,
    status: "On Bench",
  },
  {
    id: "TECH-039",
    name: "R. Balaji",
    email: "balaji.cloud@thedatadot.com",
    role: "Cloud & Network Security Engineer",
    station: "SOC Terminal 03",
    activeCases: 1,
    status: "Available",
  },
];

// ================= LIVE SUPABASE REAL-TIME HELPERS =================
import { supabase, isSupabaseConfigured } from "./supabase";

export async function fetchTicketsFromSupabase(customerEmail?: string): Promise<Ticket[]> {
  try {
    if (typeof window !== "undefined") {
      const url = customerEmail
        ? `/api/tickets?customer_email=${encodeURIComponent(customerEmail)}`
        : "/api/tickets";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.tickets)) {
          return json.tickets.map((row: any) => ({
            id: row.id,
            customerName: row.customer_name,
            companyName: row.company_name,
            customerEmail: row.customer_email,
            category: "Data Recovery",
            deviceOrSubject: row.device_or_subject,
            serialNumber: row.serial_number,
            status: (row.status as any) || "Cleanroom Diagnosis",
            priority: (row.urgency?.toUpperCase() as any) || "STANDARD",
            assignedTech: row.assigned_tech || "S. Murugan (Cleanroom Lead)",
            clonedPercent: Number(row.cloned_percent) || 0,
            recoveredSize: `${row.cloned_percent}% cloned`,
            createdAt: row.created_at
              ? new Date(row.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Today",
            lastUpdated: "Live from API",
            symptoms: row.symptoms || "",
            techNotes: row.tech_notes || "",
          }));
        }
      }
    }
  } catch (apiErr) {
    console.warn("Falling back to direct Supabase tickets query:", apiErr);
  }

  if (!isSupabaseConfigured) return initialTickets;
  try {
    let query = supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (customerEmail) {
      query = query.ilike("customer_email", customerEmail);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      companyName: row.company_name,
      customerEmail: row.customer_email,
      category: "Data Recovery",
      deviceOrSubject: row.device_or_subject,
      serialNumber: row.serial_number,
      status: (row.status as any) || "Cleanroom Diagnosis",
      priority: (row.urgency?.toUpperCase() as any) || "STANDARD",
      assignedTech: row.assigned_tech || "S. Murugan (Cleanroom Lead)",
      clonedPercent: Number(row.cloned_percent) || 0,
      recoveredSize: `${row.cloned_percent}% cloned`,
      createdAt: row.created_at
        ? new Date(row.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Today",
      lastUpdated: "Live from Supabase",
      symptoms: row.symptoms || "",
      techNotes: row.tech_notes || "",
    }));
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return initialTickets;
  }
}

export async function updateTicketInSupabase(
  id: string,
  updates: { status?: string; clonedPercent?: number; techNotes?: string }
) {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) return;
    }
  } catch (apiErr) {
    console.warn("Fallback to direct Supabase update:", apiErr);
  }

  if (!isSupabaseConfigured) return;
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.status) payload.status = updates.status;
    if (updates.clonedPercent !== undefined) payload.cloned_percent = updates.clonedPercent;
    if (updates.techNotes !== undefined) payload.tech_notes = updates.techNotes;

    await supabase.from("tickets").update(payload).eq("id", id);
  } catch (err) {
    console.error("Failed to update ticket in Supabase:", err);
  }
}

export async function fetchMessagesFromSupabase(ticketId: string) {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      if (res.ok) {
        const json = await res.json();
        return json.messages;
      }
    }
  } catch (apiErr) {
    console.warn("Fallback to direct Supabase message fetch:", apiErr);
  }

  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error || !data) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function sendMessageToSupabase(
  ticketId: string,
  sender: "Customer" | "Technician" | "Admin",
  author: string,
  text: string
) {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, author, text }),
      });
      if (res.ok) return;
    }
  } catch (apiErr) {
    console.warn("Fallback to direct Supabase message insert:", apiErr);
  }

  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("ticket_messages").insert([
      {
        ticket_id: ticketId,
        sender,
        author,
        text,
      },
    ]);
  } catch (err) {
    console.error("Failed to insert message into Supabase:", err);
  }
}

export interface NewTicketInput {
  id?: string;
  companyName: string;
  customerName: string;
  customerEmail: string;
  deviceOrSubject: string;
  mediaType?: "HDD" | "SSD" | "RAID" | "FLASH" | "NETWORK" | "SERVER" | "GENERAL";
  serialNumber?: string;
  urgency?: "Critical" | "High" | "Standard";
  symptoms?: string;
  techNotes?: string;
}

export async function createTicketInSupabase(input: NewTicketInput): Promise<string> {
  const ticketId = input.id || `TDD-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticketId,
          companyName: input.companyName,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          deviceOrSubject: input.deviceOrSubject,
          mediaType: input.mediaType || "HDD",
          serialNumber: input.serialNumber || "N/A",
          urgency: input.urgency || "Standard",
          symptoms: input.symptoms || "",
          techNotes: input.techNotes || "Awaiting hardware reception in Class-5 cleanroom.",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.ticketId || ticketId;
      }
    }
  } catch (apiErr) {
    console.warn("Fallback to direct Supabase ticket insert:", apiErr);
  }

  if (!isSupabaseConfigured) return ticketId;

  try {
    const { error } = await supabase.from("tickets").insert([
      {
        id: ticketId,
        company_name: input.companyName,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        device_or_subject: input.deviceOrSubject,
        media_type: input.mediaType || "HDD",
        serial_number: input.serialNumber || "N/A",
        status: "Intake & Diagnostics",
        cloned_percent: 0,
        urgency: input.urgency || "Standard",
        symptoms: input.symptoms || "",
        tech_notes: input.techNotes || "Awaiting hardware reception in Class-5 cleanroom.",
        assigned_bench: "Cleanroom Intake Station",
        assigned_tech: "S. Murugan (Cleanroom Lead)",
      },
    ]);

    if (error) {
      console.error("Error creating ticket in Supabase:", error);
    }
  } catch (err) {
    console.error("Failed to insert ticket into Supabase:", err);
  }

  return ticketId;
}

export interface SupabaseBlogPost {
  id: string;
  title: string;
  category: string;
  read_time?: string;
  status: "Published" | "Draft";
  cover_image?: string;
  excerpt: string;
  content?: string;
  created_at?: string;
}

export async function fetchBlogPostsFromSupabase(): Promise<SupabaseBlogPost[]> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/blog");
      if (res.ok) {
        const json = await res.json();
        if (json.posts) return json.posts;
      }
    }
  } catch (apiErr) {
    console.warn("Fallback to direct Supabase blog query:", apiErr);
  }

  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error("Failed to fetch blog posts from Supabase:", err);
    return [];
  }
}

export async function createOrUpdateBlogPostInSupabase(post: SupabaseBlogPost) {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      if (res.ok) return;
    }
  } catch (apiErr) {
    console.warn("Fallback to direct Supabase blog upsert:", apiErr);
  }

  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("blog_posts").upsert([post]);
  } catch (err) {
    console.error("Failed to upsert blog post in Supabase:", err);
  }
}

export interface SupabaseFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order?: number;
  created_at?: string;
}

export async function fetchFaqsFromSupabase(): Promise<SupabaseFaq[]> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/faq");
      if (res.ok) {
        const json = await res.json();
        if (json.faqs) return json.faqs;
      }
    }
  } catch (apiErr) {
    console.warn("Fallback to direct Supabase faq query:", apiErr);
  }

  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error("Failed to fetch faqs from Supabase:", err);
    return [];
  }
}

export async function createOrUpdateFaqInSupabase(faq: SupabaseFaq) {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faq),
      });
      if (res.ok) return;
    }
  } catch (apiErr) {
    console.warn("Fallback to direct Supabase faq upsert:", apiErr);
  }

  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("faqs").upsert([faq]);
  } catch (err) {
    console.error("Failed to upsert faq in Supabase:", err);
  }
}
