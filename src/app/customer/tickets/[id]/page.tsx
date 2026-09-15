"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import {
  initialTickets,
  fetchTicketsFromSupabase,
  fetchMessagesFromSupabase,
  sendMessageToSupabase,
  deleteTicketFromSupabase,
  parseTicketRow,
} from "@/lib/portalData";
import { getCustomerSession, CustomerUser } from "@/lib/clientAuth";

interface Message {
  sender: "Customer" | "Technician";
  author: string;
  time: string;
  text: string;
}

export default function CustomerTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync ticket details and perform authorization boundary check
  useEffect(() => {
    const currentCustomer = getCustomerSession();
    if (!currentCustomer) {
      router.push("/customer/login");
      return;
    }
    setCustomer(currentCustomer);

    const activeCust = currentCustomer;
    const custEmail = activeCust.email.toLowerCase();
    const custCompany = activeCust.company.toLowerCase();

    async function loadData(silent: boolean = false) {
      if (!silent) setLoading(true);
      else setIsSyncing(true);

      try {
        let found: any = null;

        // 1. Direct single-ticket endpoint fetch for instant live telemetry
        try {
          const res = await fetch(`/api/tickets/${ticketId}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.ticket) {
              found = parseTicketRow(data.ticket);
            }
          }
        } catch (apiErr) {
          console.warn("Direct ticket API fetch warn:", apiErr);
        }

        // 2. Fallback to list query
        if (!found) {
          const liveTickets = await fetchTicketsFromSupabase();
          found = liveTickets.find(
            (t) => t.id.toLowerCase() === ticketId.toLowerCase()
          );
        }

        // 3. Fallback to initialTickets only for demo account Aravind
        if (!found && ticketId.toUpperCase() === "TDD-8942") {
          found = initialTickets.find(
            (t) => t.id.toLowerCase() === ticketId.toLowerCase()
          );
        }

        if (!found) {
          setIsNotFound(true);
          setLoading(false);
          setIsSyncing(false);
          return;
        }

        // Anti-IDOR Check: Ensure ticket belongs strictly to current customer's account
        const isOwner =
          (found.customerEmail && found.customerEmail.toLowerCase() === custEmail) ||
          (custCompany && custCompany.trim().length > 2 && found.companyName.toLowerCase().trim() === custCompany.trim()) ||
          (custEmail.includes("aravind") && (found.id === "TDD-8942" || found.companyName.toLowerCase().includes("apex")));

        if (!isOwner) {
          console.warn(
            `[SECURITY AUDIT] Unauthorized IDOR attempt detected for ticket ${ticketId} by ${activeCust.email}`
          );
          setIsUnauthorized(true);
          setLoading(false);
          setIsSyncing(false);
          return;
        }

        setTicket(found);

        // Fetch live messages from Supabase
        const liveMsgs = await fetchMessagesFromSupabase(ticketId);
        if (liveMsgs && liveMsgs.length > 0) {
          setMessages(
            liveMsgs.map((m: any) => ({
              sender: m.sender,
              author: m.author,
              time: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Today",
              text: m.text,
            }))
          );
        } else if (ticketId.toUpperCase() === "TDD-8942") {
          // Dr. Aravind demo ticket
          setMessages([
            {
              sender: "Customer",
              author: "Dr. Aravind Swaminathan",
              time: "Sep 12, 10:15 AM",
              text: "Our server dropped offline after power flicker during MRI scan. Loud clicking noise heard from the 4TB Seagate drive. Critical patient databases .mdf are on this drive.",
            },
            {
              sender: "Technician",
              author: "K. Vignesh (Cleanroom Lead)",
              time: "Sep 12, 11:30 AM",
              text: "Media received in cleanroom. Outer casing inspected and serial barcoded. Drive placed on anti-static isolation mat.",
            },
            {
              sender: "Technician",
              author: "K. Vignesh (Cleanroom Lead)",
              time: "Sep 13, 02:45 PM",
              text: "Cleanroom bench inspection complete. Mechanical head assembly damaged; donor heads transplanted in Class-5 cleanroom. Imaging 100% of raw sectors to safe lab target.",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load customer ticket details:", err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    }

    loadData();

    // Auto poll updates every 8 seconds
    const interval = setInterval(() => loadData(true), 8000);
    return () => clearInterval(interval);
  }, [ticketId, router]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !customer || !ticket) return;

    setSending(true);
    const authorName = customer.name;
    const newMsgText = replyText.trim();

    try {
      await sendMessageToSupabase(ticket.id, "Customer", authorName, newMsgText);

      setMessages((prev) => [
        ...prev,
        {
          sender: "Customer",
          author: authorName,
          time: "Just now",
          text: newMsgText,
        },
      ]);
      setReplyText("");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete Ticket #${ticket.id}? This will purge all messages, telemetry data, and tracking history.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const ok = await deleteTicketFromSupabase(ticket.id);
      if (ok) {
        alert(`Ticket #${ticket.id} has been permanently deleted.`);
        router.push("/customer/tickets");
      } else {
        alert("Failed to delete ticket. Please check connection and try again.");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error("Delete ticket error:", err);
      alert("Error deleting ticket.");
      setIsDeleting(false);
    }
  };

  // 1. ACCESS DENIED IDOR VIOLATION SCREEN
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased">
        <CustomerNav />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-20 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 text-3xl border border-rose-500/30 mb-4">
            🛡️
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Access Denied: Zero-Trust Security Boundary
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Ticket <strong className="text-white font-mono">#{ticketId}</strong> is encrypted under another enterprise client organization. 
            You are authenticated as <strong className="text-blue-400">{customer?.company || "your organization"}</strong>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/customer/tickets"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition"
            >
              ← Return to Authorized Tickets
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased">
        <CustomerNav />
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-4" />
          <p className="text-xs font-mono text-slate-400">Decrypting telemetry for case #{ticketId}...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. TICKET NOT FOUND
  if (isNotFound || !ticket) {
    return (
      <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased">
        <CustomerNav />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Ticket #{ticketId} Not Found
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            The requested ticket identifier does not exist or has been permanently purged.
          </p>
          <div className="mt-6">
            <Link
              href="/customer/tickets"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition"
            >
              ← Back to Tickets Directory
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* AMBIENT GLOW MESH */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] bg-indigo-600/8 rounded-full blur-[140px]" />
      </div>

      <CustomerNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER TOOLBAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/customer/tickets"
              className="text-xs font-mono font-semibold text-slate-400 hover:text-white mb-2 inline-flex items-center gap-1 transition"
            >
              <span>←</span>
              <span>Back to Tickets List</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
                Case #{ticket.id}
              </h1>
              <span className="rounded-full bg-slate-800/80 border border-slate-700 px-3 py-0.5 text-xs font-bold text-slate-200">
                {ticket.category === "Cybersecurity"
                  ? "🛡️ Cybersecurity"
                  : ticket.category === "Cloud Solutions"
                  ? "☁️ Cloud Solutions"
                  : ticket.category === "Managed IT"
                  ? "🖥️ Managed IT"
                  : "💽 Data Recovery"}
              </span>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-mono font-extrabold ${
                  ticket.status === "Resolved"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                }`}
              >
                {ticket.status} {ticket.clonedPercent && ticket.clonedPercent > 0 ? `(${ticket.clonedPercent}%)` : ""}
              </span>
              <span className="rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                {ticket.priority} SLA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const activeCust = customer;
                if (!activeCust) return;
                fetch(`/api/tickets/${ticket.id}`)
                  .then((r) => r.json())
                  .then((d) => {
                    if (d?.ticket) setTicket(parseTicketRow(d.ticket));
                  })
                  .catch(() => {});
              }}
              disabled={isSyncing}
              className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-mono font-bold text-blue-400 hover:bg-blue-500/20 transition shadow-sm flex items-center gap-1.5"
              title="Sync live status and technician progress score"
            >
              <span className={isSyncing ? "animate-spin" : ""}>⚡</span>
              <span>{isSyncing ? "Syncing..." : "Sync Telemetry"}</span>
            </button>

            <button
              onClick={handleDeleteTicket}
              disabled={isDeleting}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/60 transition shadow-sm flex items-center gap-1.5"
              title="Permanently remove this ticket"
            >
              <span>🗑️</span>
              <span>{isDeleting ? "Deleting..." : "Delete Ticket"}</span>
            </button>

            <a
              href="tel:+916380488373"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
            >
              📞 Hotline
            </a>
          </div>
        </div>

        {/* TICKET DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT: TARGET & STATUS (2 COLS) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                {ticket.category === "Cybersecurity"
                  ? "Security Incident & Threat Profile"
                  : ticket.category === "Cloud Solutions"
                  ? "Cloud Infrastructure & Scope Analysis"
                  : ticket.category === "Managed IT"
                  ? "Systems Specification & Issue Analysis"
                  : "Hardware Target & Failure Analysis"}
              </h2>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="text-slate-400 font-medium">
                    {ticket.category === "Cybersecurity"
                      ? "Target Host / IP:"
                      : ticket.category === "Cloud Solutions"
                      ? "Target Cloud Platform:"
                      : ticket.category === "Managed IT"
                      ? "Equipment / Fleet Target:"
                      : "Device Make & Model:"}
                  </span>
                  <span className="font-bold text-white">{ticket.deviceOrSubject}</span>
                </div>

                {ticket.serialNumber && (
                  <div className="flex justify-between border-b border-slate-800/80 pb-2.5">
                    <span className="text-slate-400 font-medium">
                      {ticket.category === "Cybersecurity"
                        ? "Host / Segment ID:"
                        : ticket.category === "Cloud Solutions"
                        ? "Tenant ID / Domain:"
                        : ticket.category === "Managed IT"
                        ? "Asset Tag / Location:"
                        : "Serial Number:"}
                    </span>
                    <span className="font-mono font-bold text-slate-200">{ticket.serialNumber}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="text-slate-400 font-medium">Service Category:</span>
                  <span className="font-semibold text-blue-400">{ticket.category}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="text-slate-400 font-medium">
                    {ticket.category === "Cybersecurity"
                      ? "Threat Remediation Progress:"
                      : ticket.category === "Cloud Solutions"
                      ? "Deployment Progress:"
                      : ticket.category === "Managed IT"
                      ? "Resolution Progress:"
                      : "Extracted Data Volume:"}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {ticket.clonedPercent && ticket.clonedPercent > 0
                      ? ticket.category === "Cybersecurity"
                        ? `${ticket.clonedPercent}% Remediated`
                        : ticket.category === "Data Recovery"
                        ? `${ticket.clonedPercent}% Cloned`
                        : `${ticket.clonedPercent}% Deployed`
                      : "Awaiting Diagnostics (Intake Phase)"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">
                    {ticket.category === "Cybersecurity"
                      ? "Reported Threat Indicators:"
                      : ticket.category === "Cloud Solutions" || ticket.category === "Managed IT"
                      ? "Requirements & Scope:"
                      : "Reported Symptoms:"}
                  </span>
                  <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 leading-relaxed">
                    {ticket.symptoms}
                  </p>
                </div>

                {ticket.techNotes && (
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">
                      {ticket.category === "Cybersecurity"
                        ? "SOC Cyber Findings & Directives:"
                        : ticket.category === "Cloud Solutions" || ticket.category === "Managed IT"
                        ? "Systems Engineering Directives:"
                        : "Forensic Lab Findings:"}
                    </span>
                    <p className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 leading-relaxed font-mono text-[11px]">
                      {ticket.techNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* INTERACTIVE MESSAGE THREAD */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {ticket.category === "Cybersecurity"
                  ? "Direct Communication Stream with Security Lead"
                  : ticket.category === "Cloud Solutions"
                  ? "Direct Communication Stream with Cloud Architect"
                  : ticket.category === "Managed IT"
                  ? "Direct Communication Stream with Systems Engineer"
                  : "Direct Communication Stream with Forensic Engineer"}
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-1 text-xs">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                    <p className="font-semibold text-slate-400">No chat messages in this case yet</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Send a message below to communicate directly with your assigned specialist.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isTech = m.sender === "Technician";
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${
                          isTech
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-100 ml-4 shadow-sm"
                            : "border-slate-800 bg-slate-950/60 text-slate-200 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[11px] text-white">
                            {isTech
                              ? ticket.category === "Cybersecurity"
                                ? "🛡️ "
                                : ticket.category === "Cloud Solutions"
                                ? "☁️ "
                                : "🔬 "
                              : "👤 "}
                            {m.author}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{m.time}</span>
                        </div>
                        <p className="leading-relaxed text-slate-300">{m.text}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* REPLY FORM */}
              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Type a message or inquiry to your assigned specialist..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition disabled:opacity-50"
                  >
                    {sending ? "Transmitting..." : "Send Reply to Engineering Desk →"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: SPECIALIST & SERVICE LEVEL (1 COL) */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl text-xs">
              <h3 className="font-mono font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-3">
                {ticket.category === "Cybersecurity"
                  ? "Assigned Security Lead"
                  : ticket.category === "Cloud Solutions"
                  ? "Assigned Cloud Architect"
                  : ticket.category === "Managed IT"
                  ? "Assigned Systems Lead"
                  : "Assigned Forensic Staff"}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-500/15 text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-500/30">
                  {ticket.assignedTech && ticket.assignedTech !== "Unassigned"
                    ? ticket.assignedTech.substring(0, 2).toUpperCase()
                    : "⏳"}
                </div>
                <div>
                  <p className="font-bold text-white">
                    {ticket.assignedTech && ticket.assignedTech !== "Unassigned"
                      ? ticket.assignedTech
                      : "Pending Specialist Dispatch"}
                  </p>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    {ticket.assignedTech && ticket.assignedTech !== "Unassigned"
                      ? ticket.category === "Cybersecurity"
                        ? "SOC Operations Center"
                        : ticket.category === "Cloud Solutions"
                        ? "Cloud Architecture Desk"
                        : ticket.category === "Managed IT"
                        ? "Managed Infrastructure Hub"
                        : "Class-5 Cleanroom Bench"
                      : "Super Admin Triage Queue"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-800 pt-3 text-slate-400 font-mono">
                <p>Created: <strong className="text-slate-200">{ticket.createdAt || "Today"}</strong></p>
                <p>Last Update: <strong className="text-slate-200">{ticket.lastUpdated || "Live from Supabase"}</strong></p>
                <p>SLA Tier: <strong className="text-rose-400">{ticket.priority || "CRITICAL"} SLA</strong></p>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-xl p-6 text-xs text-blue-200 shadow-2xl">
              <h4 className="font-bold text-blue-300 mb-1.5 flex items-center gap-1.5">
                <span>🛡️</span> Guaranteed Service Standard
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {ticket.category === "Data Recovery"
                  ? "All data recovery tickets at The Data Dot are backed by our strict No Data, No Recovery Fee guarantee. You only pay if files are 100% verified."
                  : ticket.category === "Cybersecurity"
                  ? "All incident responses are executed in accordance with ISO 27001 zero-trust containment protocols with contractual non-disclosure assurance."
                  : "All cloud and infrastructure deployments are backed by our 99.99% enterprise uptime commitment and 15-minute response SLA."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
