// Shared Mock Data Store for Customer, Technician, and Admin Portals

export interface Ticket {
  id: string;
  customerName: string;
  companyName: string;
  customerEmail?: string;
  category: "Data Recovery" | "Cloud Solutions" | "Cybersecurity" | "Managed IT";
  deviceOrSubject: string;
  serialNumber?: string;
  mediaType?: string;
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

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export function getTicketAttachments(ticketId: string): TicketAttachment[] {
  if (typeof window === "undefined" || !ticketId) return [];
  try {
    const raw =
      localStorage.getItem(`tdd_attachments_${ticketId}`) ||
      localStorage.getItem(`tdd_attachments_${ticketId.toUpperCase()}`) ||
      localStorage.getItem(`tdd_attachments_${ticketId.toLowerCase()}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter(
          (a) =>
            a &&
            !a.name?.toLowerCase().includes("diagnostic_telemetry") &&
            !a.name?.toLowerCase().includes("telemetry.pdf") &&
            !a.uploadedBy?.toLowerCase().includes("lab diagnostics hub")
        );
        if (filtered.length !== parsed.length) {
          saveTicketAttachments(ticketId, filtered);
        }
        return filtered;
      }
    }
  } catch (e) {
    console.warn("Could not read attachments:", e);
  }
  return [];
}

export function saveTicketAttachments(ticketId: string, atts: TicketAttachment[]): void {
  if (typeof window === "undefined" || !ticketId) return;
  try {
    const json = JSON.stringify(atts);
    localStorage.setItem(`tdd_attachments_${ticketId}`, json);
    localStorage.setItem(`tdd_attachments_${ticketId.toUpperCase()}`, json);
    localStorage.setItem(`tdd_attachments_${ticketId.toLowerCase()}`, json);
    window.dispatchEvent(new Event("attachments-updated"));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.warn("Could not save attachments:", e);
  }
}

export const initialTickets: Ticket[] = [];

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

export interface CompanyRecord {
  id: string;
  name: string;
  industry: string;
  plan: string;
  accountManager: string;
  devicesRecovered: number;
  contractStatus: "Active Retainer" | "On-Demand SLA";
}

export const initialCompanies: CompanyRecord[] = [
  {
    id: "ORG-101",
    name: "Apex Healthcare Diagnostic Center",
    industry: "Healthcare & Diagnostics",
    plan: "Enterprise 15-Min 24/7 SLA",
    accountManager: "K. Vignesh",
    devicesRecovered: 14,
    contractStatus: "Active Retainer",
  },
  {
    id: "ORG-102",
    name: "Nexus Legal Advisors LLP",
    industry: "Corporate & Patent Law",
    plan: "Priority 4-Hour Response",
    accountManager: "K. Vignesh",
    devicesRecovered: 6,
    contractStatus: "Active Retainer",
  },
  {
    id: "ORG-103",
    name: "Metropolitan Logistics Warehousing",
    industry: "Supply Chain & Storage",
    plan: "Enterprise 15-Min 24/7 SLA",
    accountManager: "M. Rajesh",
    devicesRecovered: 22,
    contractStatus: "Active Retainer",
  },
  {
    id: "ORG-104",
    name: "Sri Lakshmi Tax & Audits",
    industry: "Financial Services",
    plan: "Standard Business Support",
    accountManager: "R. Balaji",
    devicesRecovered: 3,
    contractStatus: "On-Demand SLA",
  },
];

export const DELETED_COMPANIES_KEY = "tdd_deleted_company_ids";
export const COMPANIES_STORAGE_KEY = "tdd_admin_companies";

export function getDeletedCompanyIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_COMPANIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((item: string) => item.toLowerCase().trim()));
      }
    }
  } catch (e) {
    console.warn("Failed reading deleted companies:", e);
  }
  return new Set();
}

export function deleteCompanyRecord(idOrName: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedCompanyIds();
    set.add(idOrName.toLowerCase().trim());
    localStorage.setItem(DELETED_COMPANIES_KEY, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new Event("companies-updated"));
  } catch (e) {
    console.warn("Failed deleting company from storage:", e);
  }
}

export interface TechnicianRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  station: string;
  activeCases: number;
  status: string;
  pin?: string;
  password?: string;
}

export const initialTechnicians: TechnicianRecord[] = [
  {
    id: "TECH-052",
    name: "K. Vignesh",
    email: "vignesh.ssd@thedatadot.com",
    role: "Solid State & NVMe Specialist",
    station: "PC-3000 Flash & Portable III",
    activeCases: 1,
    status: "On Bench",
    pin: "8942",
    password: "Tech@DataDot2026!",
  },
  {
    id: "TECH-064",
    name: "M. Rajesh",
    email: "rajesh.lab@thedatadot.com",
    role: "PC-3000 Cleanroom Lead Engineer",
    station: "PC-3000 Bench 01 (Class-5 Hood)",
    activeCases: 1,
    status: "On Bench",
    pin: "7103",
    password: "Rajesh@DataDot2026!",
  },
  {
    id: "TECH-039",
    name: "R. Balaji",
    email: "balaji.cloud@thedatadot.com",
    role: "Cloud & Network Security Engineer",
    station: "SOC Terminal 03",
    activeCases: 1,
    status: "Available",
    pin: "5519",
    password: "Balaji@DataDot2026!",
  },
];

export const TECHNICIANS_STORAGE_KEY = "tdd_laboratory_technicians";
export const DELETED_TECHNICIANS_KEY = "tdd_deleted_technician_emails";

export function getDeletedTechnicianEmails(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_TECHNICIANS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((item: string) => item.toLowerCase().trim()));
      }
    }
  } catch (e) {
    console.warn("Failed reading deleted technicians:", e);
  }
  return new Set();
}

export function markTechnicianAsDeleted(emailOrId: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedTechnicianEmails();
    set.add(emailOrId.toLowerCase().trim());
    localStorage.setItem(DELETED_TECHNICIANS_KEY, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new Event("technicians-updated"));
  } catch (e) {
    console.warn("Failed deleting technician from storage:", e);
  }
}

export function getStoredTechnicians(): TechnicianRecord[] {
  if (typeof window === "undefined") return initialTechnicians;
  const deletedSet = getDeletedTechnicianEmails();
  try {
    const raw = localStorage.getItem(TECHNICIANS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (t: TechnicianRecord) => !deletedSet.has(t.email.toLowerCase().trim()) && !deletedSet.has(t.id.toLowerCase().trim())
        );
      }
    }
  } catch (e) {
    console.warn("Failed loading technicians from storage:", e);
  }
  return initialTechnicians.filter(
    (t: TechnicianRecord) => !deletedSet.has(t.email.toLowerCase().trim()) && !deletedSet.has(t.id.toLowerCase().trim())
  );
}

export function saveStoredTechnicians(technicians: TechnicianRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(technicians));
    window.dispatchEvent(new Event("technicians-updated"));
  } catch (e) {
    console.warn("Failed saving technicians to storage:", e);
  }
}

// ================= LIVE SUPABASE REAL-TIME HELPERS =================
export { supabase, isSupabaseConfigured } from "./supabase";
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
      window.dispatchEvent(new Event("tickets-updated"));
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

export function applyTicketOverrides(t: Ticket): Ticket {
  if (typeof window === "undefined") return t;
  try {
    const raw = localStorage.getItem("tdd_ticket_overrides");
    if (!raw) return t;
    const overrides = JSON.parse(raw);
    const cleanId = (t.id || "").trim().toUpperCase();
    const ov =
      overrides[cleanId] ||
      overrides[t.id] ||
      (t.id ? overrides[t.id.toLowerCase()] : null);
    if (ov) {
      // Overrides older than 45 seconds have expired — server DB is authoritative
      if (ov.timestamp && Date.now() - ov.timestamp > 45000) {
        return t;
      }
      // If server data already matches or has progressed past this override, don't override
      if (t.status === ov.status && (ov.progress === undefined || t.clonedPercent === ov.progress)) {
        return t;
      }
      return {
        ...t,
        status: ov.status || t.status,
        clonedPercent: ov.progress !== undefined ? ov.progress : t.clonedPercent,
        priority: ov.priority || t.priority,
        assignedBench: ov.bench || t.assignedBench,
        techNotes: ov.notes || t.techNotes,
        lastUpdated: ov.updatedAt || t.lastUpdated,
      };
    }
  } catch (e) {
    console.warn("Error reading tdd_ticket_overrides:", e);
  }
  return t;
}

export async function fetchTicketsFromSupabase(customerEmail?: string): Promise<Ticket[]> {
  const deletedIds = getDeletedTicketIds();
  const inquiryStatuses = new Set(["New Request", "In Coordination", "Contacted", "Converted"]);

  try {
    if (typeof window !== "undefined") {
      const url = customerEmail
        ? `/api/tickets?customer_email=${encodeURIComponent(customerEmail)}&_t=${Date.now()}`
        : `/api/tickets?_t=${Date.now()}`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.tickets)) {
          let list = json.tickets
            .map(parseTicketRow)
            .filter(
              (t: Ticket) =>
                !deletedIds.has(t.id.trim().toUpperCase()) &&
                !t.id.toUpperCase().startsWith("INQ-") &&
                !t.id.toUpperCase().startsWith("DR-") &&
                !t.id.toUpperCase().startsWith("RPT-") &&
                !inquiryStatuses.has(t.status)
            )
            .map(applyTicketOverrides);

          // If querying for customerEmail returned 0 tickets, try global list as fallback
          if (list.length === 0 && customerEmail) {
            const fallbackRes = await fetch(`/api/tickets?_t=${Date.now()}`, {
              cache: "no-store",
              headers: {
                "Pragma": "no-cache",
                "Cache-Control": "no-cache",
              },
            });
            if (fallbackRes.ok) {
              const fallbackJson = await fallbackRes.json();
              if (Array.isArray(fallbackJson.tickets) && fallbackJson.tickets.length > 0) {
                list = fallbackJson.tickets
                  .map(parseTicketRow)
                  .filter(
                    (t: Ticket) =>
                      !deletedIds.has(t.id.trim().toUpperCase()) &&
                      !t.id.toUpperCase().startsWith("INQ-") &&
                      !t.id.toUpperCase().startsWith("DR-") &&
                      !t.id.toUpperCase().startsWith("RPT-") &&
                      !inquiryStatuses.has(t.status)
                  )
                  .map(applyTicketOverrides);
              }
            }
          }

          return list;
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

    let results = data || [];
    if (results.length === 0 && customerEmail) {
      // Fallback to all tickets if specific customer email has no rows
      const fallback = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (fallback.data && fallback.data.length > 0) {
        results = fallback.data;
      }
    }

    return results
      .map(parseTicketRow)
      .filter(
        (t: Ticket) =>
          !deletedIds.has(t.id.trim().toUpperCase()) &&
          !t.id.toUpperCase().startsWith("INQ-") &&
          !t.id.toUpperCase().startsWith("DR-") &&
          !t.id.toUpperCase().startsWith("RPT-") &&
          !inquiryStatuses.has(t.status)
      )
      .map(applyTicketOverrides);
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return [];
  }
}

export async function updateTicketInSupabase(
  id: string,
  updates: {
    status?: string;
    clonedPercent?: number;
    techNotes?: string;
    assignedBench?: string;
    assignedTech?: string;
    priority?: string;
    urgency?: string;
  }
) {
  const cleanId = (id || "").trim().toUpperCase();

  // Optimistic broadcast and local override for instant 0ms cross-tab reflection
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("tdd_ticket_overrides");
      const overrides = raw ? JSON.parse(raw) : {};
      const overrideData = {
        ...(overrides[cleanId] || {}),
        status: updates.status,
        progress: updates.clonedPercent,
        priority: updates.priority || updates.urgency,
        bench: updates.assignedBench,
        notes: updates.techNotes,
        timestamp: Date.now(),
        updatedAt: "Just now",
      };
      overrides[cleanId] = overrideData;
      overrides[cleanId.toLowerCase()] = overrideData;
      localStorage.setItem("tdd_ticket_overrides", JSON.stringify(overrides));
      window.dispatchEvent(new Event("tickets-updated"));

      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("tdd-ticket-sync");
        bc.postMessage({
          type: "TICKET_UPDATED",
          id: cleanId,
          status: updates.status,
          progress: updates.clonedPercent,
          bench: updates.assignedBench,
          timestamp: Date.now(),
        });
        bc.close();
      }
    } catch (e) {
      console.warn("Local sync broadcast warn:", e);
    }
  }

  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/tickets/${cleanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          urgency: updates.urgency || updates.priority,
        }),
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
    if (updates.assignedBench !== undefined) payload.assigned_bench = updates.assignedBench;
    if (updates.assignedTech !== undefined) payload.assigned_tech = updates.assignedTech;
    if (updates.urgency || updates.priority) payload.urgency = updates.urgency || updates.priority;

    await supabase.from("tickets").update(payload).or(`id.eq.${cleanId},id.ilike.${cleanId}`);
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
      const res = await fetch(`/api/blog?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
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

export async function createOrUpdateBlogPostInSupabase(
  post: SupabaseBlogPost
): Promise<{ success: boolean; error?: string; post?: any }> {
  // 1. Un-blacklist the post ID from local deleted IDs if it was previously marked deleted
  if (typeof window !== "undefined") {
    try {
      const current = getDeletedBlogIds();
      if (current.has(post.id)) {
        current.delete(post.id);
        localStorage.setItem("tdd_deleted_blog_ids", JSON.stringify(Array.from(current)));
      }
    } catch (e) {
      console.warn("Local storage update warning:", e);
    }
  }

  // 2. Primary call to backend API /api/blog (uses server-side admin client)
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("blog-updated"));
        }
        return { success: true, post: json.post || post };
      }
      if (!res.ok && json.error) {
        console.warn("API returned error on blog post:", json.error);
        // If API fails, try direct Supabase fallback below
      }
    }
  } catch (apiErr: any) {
    console.warn("Fallback to direct Supabase blog upsert:", apiErr);
  }

  // 3. Fallback direct Supabase client upsert
  if (!isSupabaseConfigured) {
    return { success: false, error: "Database client is not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .upsert([post])
      .select()
      .single();

    if (error) {
      console.error("Failed to upsert blog post in Supabase:", error);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("blog-updated"));
    }
    return { success: true, post: data || post };
  } catch (err: any) {
    console.error("Exception upserting blog post in Supabase:", err);
    return { success: false, error: err.message || "Failed to save blog post" };
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

// ================= CLIENT INQUIRIES & LEADS =================

export interface Inquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  phone: string;
  teamSize?: string;
  service: string;
  urgency: string;
  message: string;
  source?: string;
  coordinationNotes?: string;
  status: "New Request" | "In Coordination" | "Contacted" | "Converted" | string;
  createdAt: string;
  updatedAt?: string;
}

export async function fetchInquiriesFromSupabase(statusFilter?: string): Promise<Inquiry[]> {
  try {
    if (typeof window !== "undefined") {
      const url =
        statusFilter && statusFilter !== "ALL"
          ? `/api/inquiries?status=${encodeURIComponent(statusFilter)}`
          : "/api/inquiries";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.inquiries)) {
          return json.inquiries;
        }
      }
    }
  } catch (err) {
    console.warn("Error fetching inquiries from API:", err);
  }
  return [];
}

export async function updateInquiryInSupabase(
  id: string,
  updates: {
    status?: string;
    coordinationNotes?: string;
    assignedTech?: string;
  }
): Promise<boolean> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        window.dispatchEvent(new Event("inquiries-updated"));
        return true;
      }
    }
  } catch (err) {
    console.warn("Failed updating inquiry via API:", err);
  }
  return false;
}

export async function deleteInquiryFromSupabase(id: string): Promise<boolean> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.dispatchEvent(new Event("inquiries-updated"));
        return true;
      }
    }
  } catch (err) {
    console.warn("Failed deleting inquiry via API:", err);
  }
  return false;
}

export interface TimelineStage {
  title: string;
  description: string;
  state: "done" | "active" | "pending";
}

export function getTimelineStages(
  category: string = "Data Recovery",
  status: string = "Intake & Diagnostics",
  clonedPercent: number = 0
): TimelineStage[] {
  const norm = (status || "").toLowerCase();

  const isResolved =
    norm.includes("resolved") ||
    norm.includes("completed") ||
    norm.includes("closed") ||
    (norm.includes("return") && norm.includes("resolved"));
  const isFinalStage =
    isResolved ||
    norm.includes("verification") ||
    norm.includes("return") ||
    norm.includes("handover") ||
    norm.includes("hardening") ||
    norm.includes("quality") ||
    clonedPercent >= 100;
  const isMidStage =
    isFinalStage ||
    norm.includes("imaging") ||
    norm.includes("clon") ||
    norm.includes("pc-3000") ||
    norm.includes("mirror") ||
    norm.includes("containment") ||
    norm.includes("remediation") ||
    norm.includes("deployment") ||
    norm.includes("migration") ||
    norm.includes("rollout") ||
    norm.includes("resolution") ||
    clonedPercent >= 75;
  const isDiagStage =
    isMidStage ||
    norm.includes("diagnosis") ||
    norm.includes("diagnostic") ||
    norm.includes("cleanroom") ||
    norm.includes("bench") ||
    norm.includes("threat") ||
    norm.includes("forensic") ||
    norm.includes("architecture") ||
    clonedPercent >= 50;

  if (category === "Cybersecurity") {
    const s1State =
      isDiagStage && !norm.includes("intake") && !norm.includes("new")
        ? "done"
        : "active";

    let s2State: "done" | "active" | "pending" = "pending";
    if (
      isMidStage &&
      !norm.includes("analysis") &&
      !norm.includes("diagnos") &&
      !norm.includes("forensic")
    )
      s2State = "done";
    else if (
      norm.includes("analysis") ||
      norm.includes("diagnos") ||
      norm.includes("forensic")
    )
      s2State = "active";

    let s3State: "done" | "active" | "pending" = "pending";
    if (
      isFinalStage &&
      !norm.includes("contain") &&
      !norm.includes("remediat")
    )
      s3State = "done";
    else if (norm.includes("contain") || norm.includes("remediat"))
      s3State = "active";

    let s4State: "done" | "active" | "pending" = "pending";
    if (isResolved) s4State = "done";
    else if (norm.includes("harden") || norm.includes("sign-off"))
      s4State = "active";

    return [
      {
        title: "1. Incident Intake",
        description:
          s1State === "done"
            ? "SOC alert verified."
            : "Alert intake & triage in progress.",
        state: isResolved ? "done" : s1State,
      },
      {
        title: "2. Security Forensics",
        description:
          s2State === "done"
            ? "Breach surface fully audited."
            : s2State === "active"
            ? "Analyzing attack vector & logs."
            : "Forensic analysis queued.",
        state: isResolved ? "done" : s2State,
      },
      {
        title: "3. Containment & Remediation",
        description:
          s3State === "done"
            ? "Compromised vectors neutralized."
            : s3State === "active"
            ? "Containment protocol & vector neutralization in progress."
            : "Remediation protocol queued.",
        state: isResolved ? "done" : s3State,
      },
      {
        title: "4. Policy Hardening",
        description: isResolved
          ? "Zero breach confirmed & signed off."
          : s4State === "active"
          ? "Policy verification & final hardening."
          : "Audit & sign-off pending.",
        state: isResolved ? "done" : s4State,
      },
    ];
  }

  if (category === "Cloud Solutions") {
    const s1State =
      isDiagStage && !norm.includes("intake") && !norm.includes("new")
        ? "done"
        : "active";

    let s2State: "done" | "active" | "pending" = "pending";
    if (
      isMidStage &&
      !norm.includes("review") &&
      !norm.includes("architect") &&
      !norm.includes("diagnos")
    )
      s2State = "done";
    else if (
      norm.includes("review") ||
      norm.includes("architect") ||
      norm.includes("diagnos")
    )
      s2State = "active";

    let s3State: "done" | "active" | "pending" = "pending";
    if (
      isFinalStage &&
      !norm.includes("migrat") &&
      !norm.includes("deploy")
    )
      s3State = "done";
    else if (norm.includes("migrat") || norm.includes("deploy"))
      s3State = "active";

    let s4State: "done" | "active" | "pending" = "pending";
    if (isResolved) s4State = "done";
    else if (norm.includes("handover") || norm.includes("quality"))
      s4State = "active";

    return [
      {
        title: "1. Scope & Telemetry Intake",
        description:
          s1State === "done"
            ? "Workload specifications verified."
            : "Requirement telemetry under review.",
        state: isResolved ? "done" : s1State,
      },
      {
        title: "2. Cloud Architecture Review",
        description:
          s2State === "done"
            ? "Tenant topology calibrated."
            : s2State === "active"
            ? "Cloud blueprint calibration underway."
            : "Architecture blueprint queued.",
        state: isResolved ? "done" : s2State,
      },
      {
        title: "3. Deployment & Migration",
        description:
          s3State === "done"
            ? "Instances provisioned & verified."
            : s3State === "active"
            ? "Automated infrastructure rollout in progress."
            : "Deployment pipeline queued.",
        state: isResolved ? "done" : s3State,
      },
      {
        title: "4. Quality Verification",
        description: isResolved
          ? "Production sign-off complete."
          : s4State === "active"
          ? "Load verification & client handover in progress."
          : "Sign-off & monitoring pending.",
        state: isResolved ? "done" : s4State,
      },
    ];
  }

  if (category === "Managed IT") {
    const s1State =
      isDiagStage && !norm.includes("intake") && !norm.includes("new")
        ? "done"
        : "active";

    let s2State: "done" | "active" | "pending" = "pending";
    if (
      isMidStage &&
      !norm.includes("triage") &&
      !norm.includes("assess") &&
      !norm.includes("diagnos")
    )
      s2State = "done";
    else if (
      norm.includes("triage") ||
      norm.includes("assess") ||
      norm.includes("diagnos")
    )
      s2State = "active";

    let s3State: "done" | "active" | "pending" = "pending";
    if (
      isFinalStage &&
      !norm.includes("rollout") &&
      !norm.includes("deploy")
    )
      s3State = "done";
    else if (
      norm.includes("rollout") ||
      norm.includes("deploy") ||
      norm.includes("repair")
    )
      s3State = "active";

    let s4State: "done" | "active" | "pending" = "pending";
    if (isResolved) s4State = "done";
    else if (norm.includes("verification") || norm.includes("handover"))
      s4State = "active";

    return [
      {
        title: "1. Ticket Intake",
        description:
          s1State === "done"
            ? "Equipment issue registered."
            : "Workstation triage in progress.",
        state: isResolved ? "done" : s1State,
      },
      {
        title: "2. Technical Assessment",
        description:
          s2State === "done"
            ? "Hardware/OS issue identified."
            : s2State === "active"
            ? "Diagnostics & bench triage."
            : "Bench assessment queued.",
        state: isResolved ? "done" : s2State,
      },
      {
        title: "3. Resolution & Rollout",
        description:
          s3State === "done"
            ? "Configuration / repair completed."
            : s3State === "active"
            ? "System configuration, patching and rollout underway."
            : "Rollout pending.",
        state: isResolved ? "done" : s3State,
      },
      {
        title: "4. User Verification",
        description: isResolved
          ? "Incident resolution confirmed."
          : s4State === "active"
          ? "User validation & sign-off."
          : "Validation pending.",
        state: isResolved ? "done" : s4State,
      },
    ];
  }

  // DEFAULT: DATA RECOVERY
  let s1: "done" | "active" | "pending" = "pending";
  let s2: "done" | "active" | "pending" = "pending";
  let s3: "done" | "active" | "pending" = "pending";
  let s4: "done" | "active" | "pending" = "pending";

  const isResolvedDR =
    isResolved ||
    (norm.includes("return") && norm.includes("resolved"));
  const isVerif =
    isResolvedDR ||
    norm.includes("verification") ||
    norm.includes("return") ||
    norm.includes("deliver") ||
    norm.includes("audit") ||
    clonedPercent >= 90;
  const isImaging =
    norm.includes("imaging") ||
    norm.includes("clon") ||
    norm.includes("pc-3000") ||
    norm.includes("mirror") ||
    norm.includes("sector") ||
    clonedPercent >= 75;
  const isDiag =
    norm.includes("diagnosis") ||
    norm.includes("diagnostic") ||
    norm.includes("cleanroom") ||
    clonedPercent >= 50;

  if (isResolvedDR) {
    s1 = "done";
    s2 = "done";
    s3 = "done";
    s4 = "done";
  } else if (isVerif) {
    s1 = "done";
    s2 = "done";
    s3 = "done";
    s4 = "active";
  } else if (isImaging) {
    s1 = "done";
    s2 = "done";
    s3 = "active";
    s4 = "pending";
  } else if (isDiag) {
    s1 = "done";
    s2 = "active";
    s3 = "pending";
    s4 = "pending";
  } else {
    s1 = "active";
    s2 = "pending";
    s3 = "pending";
    s4 = "pending";
  }

  return [
    {
      title: "1. Media Intake",
      description:
        s1 === "done"
          ? "Barcoded & logged in secure vault."
          : "Logged in secure queue & awaiting cleanroom triage.",
      state: s1,
    },
    {
      title: "2. Cleanroom Diagnostics",
      description:
        s2 === "done"
          ? "ISO Class-5 clean bench calibrated."
          : s2 === "active"
          ? "Donor head & platter micro-inspection in progress."
          : "Cleanroom bench queued.",
      state: s2,
    },
    {
      title: "3. PC-3000 Imaging",
      description:
        s3 === "done"
          ? "Raw platter sector mirror complete."
          : s3 === "active"
          ? "Raw platter sector mirror extraction in progress."
          : "Mirror cloning queued.",
      state: s3,
    },
    {
      title: "4. Verification & Return",
      description:
        s4 === "done"
          ? "Data integrity confirmed & delivered."
          : s4 === "active"
          ? "Client file audit & secure courier return."
          : "Integrity audit pending.",
      state: s4,
    },
  ];
}

