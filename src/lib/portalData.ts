// Shared Mock Data Store for Customer, Technician, and Admin Portals

export interface Ticket {
  id: string;
  customerName: string;
  companyName: string;
  customerEmail?: string;
  category: "Data Recovery" | "Cloud Solutions" | "Cybersecurity" | "Managed IT";
  deviceOrSubject: string;
  serialNumber?: string;
  status: "Media Received" | "Cleanroom Diagnosis" | "PC-3000 Imaging" | "Integrity Verification" | "Resolved" | "Intake & Diagnostics" | "Threat Containment & Analysis" | "Architecture & Deployment" | string;
  priority: "CRITICAL" | "HIGH" | "STANDARD";
  assignedTech: string;
  assignedBench?: string;
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
    assignedTech: "K. Vignesh (Solid State Forensic)",
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
    assignedTech: "Unassigned",
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
    id: "TECH-052",
    name: "K. Vignesh",
    email: "vignesh.ssd@thedatadot.com",
    role: "Solid State & NVMe Specialist",
    station: "PC-3000 Flash & Portable III",
    activeCases: 1,
    status: "On Bench",
  },
  {
    id: "TECH-064",
    name: "M. Rajesh",
    email: "rajesh.lab@thedatadot.com",
    role: "PC-3000 Cleanroom Lead Engineer",
    station: "PC-3000 Bench 01 (Class-5 Hood)",
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

export function parseTicketRow(row: any): Ticket {
  // 1. Detect Category
  let category: "Data Recovery" | "Cloud Solutions" | "Cybersecurity" | "Managed IT" = "Data Recovery";
  const rawSubject = row.device_or_subject || "";
  const mediaType = (row.media_type || "").toUpperCase();

  if (row.category && ["Data Recovery", "Cloud Solutions", "Cybersecurity", "Managed IT"].includes(row.category)) {
    category = row.category;
  } else if (rawSubject.includes("[Cybersecurity]") || mediaType === "NETWORK") {
    category = "Cybersecurity";
  } else if (rawSubject.includes("[Cloud Solutions]") || mediaType === "SERVER") {
    category = "Cloud Solutions";
  } else if (rawSubject.includes("[Managed IT]") || mediaType === "GENERAL") {
    category = "Managed IT";
  }

  // 2. Clean subject
  const cleanSubject = rawSubject.replace(/^\[(Cybersecurity|Cloud Solutions|Managed IT|Data Recovery)\]\s*/, "") || "Service Target";

  // 3. Sanitize Technician - remove any "Murugan" and default to Unassigned
  let assignedTech = row.assigned_tech || "Unassigned";
  if (assignedTech.toLowerCase().includes("murugan")) {
    assignedTech = "Unassigned";
  }

  // 4. Cloned / Progress Percent
  const clonedPercent = Number(row.cloned_percent) || 0;

  // 5. Recovered Size or Progress Description
  let recoveredSize = "Awaiting Diagnostics";
  if (clonedPercent > 0) {
    if (category === "Data Recovery") {
      recoveredSize = `${clonedPercent}% cloned`;
    } else if (category === "Cybersecurity") {
      recoveredSize = `${clonedPercent}% remediated`;
    } else {
      recoveredSize = `${clonedPercent}% deployed`;
    }
  }

  return {
    id: row.id,
    customerName: row.customer_name,
    companyName: row.company_name,
    customerEmail: row.customer_email,
    category,
    deviceOrSubject: cleanSubject,
    serialNumber: row.serial_number,
    status: row.status || "Intake & Diagnostics",
    priority: (row.urgency?.toUpperCase() as any) || "STANDARD",
    assignedTech,
    assignedBench:
      row.assigned_bench ||
      (category === "Cybersecurity"
        ? "SOC Threat Isolation Station 01"
        : category === "Cloud Solutions"
        ? "Cloud Infrastructure Terminal 01"
        : category === "Managed IT"
        ? "Enterprise Fleet Support Bench 01"
        : "PC-3000 Bench 01 (Class-5 Hood)"),
    clonedPercent,
    recoveredSize,
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
  };
}

const DELETED_TICKETS_KEY = "tdd_deleted_ticket_ids";

export function getDeletedTicketIds(): Set<string> {
  const set = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(DELETED_TICKETS_KEY);
      if (stored) {
        JSON.parse(stored).forEach((id: string) => set.add(id.trim().toUpperCase()));
      }
    } catch (e) {
      console.warn("Failed reading deleted tickets from storage:", e);
    }
  }
  return set;
}

export async function deleteTicketFromSupabase(ticketId: string): Promise<boolean> {
  const cleanId = ticketId.trim();
  // 1. Mark in localStorage cache
  if (typeof window !== "undefined") {
    try {
      const current = getDeletedTicketIds();
      current.add(cleanId.toUpperCase());
      localStorage.setItem(DELETED_TICKETS_KEY, JSON.stringify(Array.from(current)));
    } catch (e) {
      console.warn("Storage update warning:", e);
    }
  }

  // 2. Call backend API DELETE /api/tickets/[id]
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/tickets/${encodeURIComponent(cleanId)}`, {
        method: "DELETE",
      });
      if (res.ok) return true;
    }
  } catch (apiErr) {
    console.warn("API ticket delete fallback:", apiErr);
  }

  // 3. Fallback direct Supabase delete if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from("ticket_messages").delete().eq("ticket_id", cleanId);
      await supabase.from("tickets").delete().eq("id", cleanId);
      return true;
    } catch (err) {
      console.error("Direct Supabase ticket delete error:", err);
    }
  }
  return true;
}

export async function fetchTicketsFromSupabase(customerEmail?: string): Promise<Ticket[]> {
  const deletedIds = getDeletedTicketIds();

  try {
    if (typeof window !== "undefined") {
      const url = customerEmail
        ? `/api/tickets?customer_email=${encodeURIComponent(customerEmail)}`
        : "/api/tickets";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.tickets)) {
          return json.tickets
            .map(parseTicketRow)
            .filter((t: Ticket) => !deletedIds.has(t.id.trim().toUpperCase()));
        }
      }
    }
  } catch (apiErr) {
    console.warn("Falling back to direct Supabase tickets query:", apiErr);
  }

  if (!isSupabaseConfigured) return [];
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

    return data
      .map(parseTicketRow)
      .filter((t: Ticket) => !deletedIds.has(t.id.trim().toUpperCase()));
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return [];
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
  category?: "Data Recovery" | "Cloud Solutions" | "Cybersecurity" | "Managed IT";
  deviceOrSubject: string;
  mediaType?: "HDD" | "SSD" | "RAID" | "FLASH" | "NETWORK" | "SERVER" | "GENERAL";
  serialNumber?: string;
  urgency?: "Critical" | "High" | "Standard";
  symptoms?: string;
  techNotes?: string;
  assignedBench?: string;
  assignedTech?: string;
}

export async function createTicketInSupabase(input: NewTicketInput): Promise<string> {
  const ticketId = input.id || `TDD-${Math.floor(1000 + Math.random() * 9000)}`;
  const chosenCategory = input.category || "Data Recovery";
  const mappedMediaType =
    input.mediaType ||
    (chosenCategory === "Cybersecurity"
      ? "NETWORK"
      : chosenCategory === "Cloud Solutions"
      ? "SERVER"
      : chosenCategory === "Managed IT"
      ? "GENERAL"
      : "HDD");

  const formattedSubject = input.deviceOrSubject.startsWith("[")
    ? input.deviceOrSubject
    : `[${chosenCategory}] ${input.deviceOrSubject}`;

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
          category: chosenCategory,
          deviceOrSubject: formattedSubject,
          mediaType: mappedMediaType,
          serialNumber: input.serialNumber || "N/A",
          status: "Intake & Diagnostics",
          clonedPercent: 0,
          urgency: input.urgency || "Standard",
          symptoms: input.symptoms || "",
          techNotes: input.techNotes || `New ${chosenCategory} ticket placed in Super Admin triage queue for dispatch.`,
          assignedBench: "Pending Allocation",
          assignedTech: "Unassigned",
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
        device_or_subject: formattedSubject,
        media_type: mappedMediaType,
        serial_number: input.serialNumber || "N/A",
        status: "Intake & Diagnostics",
        cloned_percent: 0,
        urgency: input.urgency || "Standard",
        symptoms: input.symptoms || "",
        tech_notes: input.techNotes || `New ${chosenCategory} case placed in Super Admin triage queue for engineer dispatch.`,
        assigned_bench: input.assignedBench || "Pending Allocation",
        assigned_tech: input.assignedTech || "Unassigned",
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

export function getDeletedBlogIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("tdd_deleted_blog_ids");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {
    console.warn("Failed reading deleted blog ids:", e);
  }
  return new Set();
}

export async function deleteBlogPostFromSupabase(id: string, title?: string): Promise<boolean> {
  // 1. Record in local blacklist
  if (typeof window !== "undefined") {
    try {
      const current = getDeletedBlogIds();
      current.add(id);
      localStorage.setItem("tdd_deleted_blog_ids", JSON.stringify(Array.from(current)));
    } catch (e) {
      console.warn("Storage error for deleted blog:", e);
    }
  }

  // 2. Call DELETE /api/blog
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(
        `/api/blog?id=${encodeURIComponent(id)}&title=${encodeURIComponent(title || id)}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) return true;
    }
  } catch (apiErr) {
    console.warn("API delete blog error:", apiErr);
  }

  // 3. Direct Supabase delete fallback
  if (isSupabaseConfigured) {
    try {
      await supabase.from("blog_posts").delete().eq("id", id);
      return true;
    } catch (err) {
      console.error("Direct Supabase blog delete error:", err);
    }
  }

  return true;
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
