"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import {
  initialTickets,
  fetchTicketsFromSupabase,
  fetchMessagesFromSupabase,
  sendMessageToSupabase,
  deleteTicketFromSupabase,
  parseTicketRow,
  applyTicketOverrides,
  TicketAttachment,
  getTicketAttachments,
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
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
              found = applyTicketOverrides(parseTicketRow(data.ticket));
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
          // Dr. Aravind demo ticket ONLY
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

    // Auto-poll live ticket telemetry from technician every 5 seconds & instant event sync
    const interval = setInterval(() => loadData(true), 5000);
    const handleSync = () => loadData(true);

    window.addEventListener("tickets-updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("tickets-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [ticketId, router]);

  // Synchronize attachments for this ticket
  useEffect(() => {
    if (!ticketId) return;

    const refreshAttachments = () => {
      const atts = getTicketAttachments(ticketId);
      const filtered = Array.isArray(atts)
        ? atts.filter((a) => !a.name.includes("_diagnostic_telemetry.pdf"))
        : [];
      setAttachments(filtered);
    };

    refreshAttachments();
    window.addEventListener("attachments-updated", refreshAttachments);
    window.addEventListener("storage", refreshAttachments);
    return () => {
      window.removeEventListener("attachments-updated", refreshAttachments);
      window.removeEventListener("storage", refreshAttachments);
    };
  }, [ticketId]);

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

  const handleConfirmDelete = async () => {
    if (!ticket) return;
    setIsDeleting(true);

    try {
      const ok = await deleteTicketFromSupabase(ticket.id);
      if (ok) {
        setShowDeleteModal(false);
        router.push("/customer/tickets");
      } else {
        setIsDeleting(false);
      }
    } catch (err) {
      console.error("Delete ticket error:", err);
      setIsDeleting(false);
    }
  };

  // 1. ACCESS DENIED IDOR VIOLATION SCREEN
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
        <CustomerNav />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-sm">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            Access Denied: Unauthorized Ticket
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Ticket <strong>#{ticketId}</strong> belongs to another client organization. 
            You are authenticated as <strong>{customer?.company || "your organization"}</strong>. 
            Direct cross-organization ticket inspection is blocked by our zero-trust isolation policy.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/customer/tickets"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              ← Return to Your Authorized Tickets
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
      <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
        <CustomerNav />
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
          <p className="text-xs font-bold text-slate-600">
            Loading forensic case #{ticketId}...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. TICKET NOT FOUND
  if (isNotFound || !ticket) {
    return (
      <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
        <CustomerNav />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Ticket #{ticketId} Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The requested ticket identifier does not exist or has been archived.
          </p>
          <div className="mt-6">
            <Link
              href="/customer/tickets"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
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
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* HEADER BAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/customer/tickets"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 inline-flex items-center gap-1.5 transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Tickets List</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Ticket #{ticket.id}
              </h1>
              <span className="rounded-full px-3 py-0.5 text-xs font-bold border bg-slate-100 text-slate-800 border-slate-200">
                {ticket.category}
              </span>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-extrabold ${
                  ticket.status === "Resolved"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {ticket.status}
              </span>
              <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold">
                {ticket.priority} SLA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const activeCust = customer;
                if (!activeCust) return;
                setIsSyncing(true);
                fetch(`/api/tickets/${ticket.id}`)
                  .then((r) => r.json())
                  .then((d) => {
                    if (d?.ticket) setTicket(parseTicketRow(d.ticket));
                  })
                  .catch(() => {})
                  .finally(() => setIsSyncing(false));
              }}
              disabled={isSyncing}
              className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Sync live status and technician telemetry"
            >
              <svg className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isSyncing ? "Syncing..." : "Sync Live Status"}</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Permanently remove this ticket"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Delete Ticket</span>
            </button>

            <a
              href="tel:+916380488373"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Hotline: +91 6380488373</span>
            </a>
          </div>
        </div>

        {/* TICKET DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT: TARGET & STATUS + ATTACHMENTS + MESSAGES (2 COLS) */}
          <div className="lg:col-span-2 space-y-6">
            {/* TARGET CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
                <span>
                  {ticket.category === "Cybersecurity"
                    ? "Security Incident & Threat Profile"
                    : ticket.category === "Cloud Solutions"
                    ? "Cloud Infrastructure & Scope Analysis"
                    : ticket.category === "Managed IT"
                    ? "Systems Specification & Issue Analysis"
                    : "Hardware Target & Failure Analysis"}
                </span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium">
                    {ticket.category === "Cybersecurity"
                      ? "Target Host / IP:"
                      : ticket.category === "Cloud Solutions"
                      ? "Target Cloud Platform:"
                      : ticket.category === "Managed IT"
                      ? "Equipment / Fleet Target:"
                      : "Device Make & Model:"}
                  </span>
                  <span className="font-bold text-slate-950">{ticket.deviceOrSubject}</span>
                </div>

                {ticket.serialNumber && (
                  <div className="flex justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-medium">
                      {ticket.category === "Cybersecurity"
                        ? "Host / Segment ID:"
                        : ticket.category === "Cloud Solutions"
                        ? "Tenant ID / Domain:"
                        : ticket.category === "Managed IT"
                        ? "Asset Tag / Location:"
                        : "Serial Number:"}
                    </span>
                    <span className="font-mono font-bold text-blue-700">{ticket.serialNumber}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium">Service Category:</span>
                  <span className="font-semibold text-blue-600">{ticket.category}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium">Current Execution Stage:</span>
                  <span className="font-bold text-emerald-600">
                    {ticket.status || "Media Intake"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block mb-1">
                    {ticket.category === "Cybersecurity"
                      ? "Reported Threat Indicators:"
                      : ticket.category === "Cloud Solutions" || ticket.category === "Managed IT"
                      ? "Requirements & Scope:"
                      : "Reported Symptoms:"}
                  </span>
                  <p className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 leading-relaxed">
                    {ticket.symptoms}
                  </p>
                </div>

                {ticket.techNotes && (
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">
                      {ticket.category === "Cybersecurity"
                        ? "SOC Cyber Findings & Directives:"
                        : ticket.category === "Cloud Solutions" || ticket.category === "Managed IT"
                        ? "Systems Engineering Directives:"
                        : "Forensic Lab Findings:"}
                    </span>
                    <p className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-950 leading-relaxed font-mono text-[11px]">
                      {ticket.techNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ATTACHED LABORATORY FILES & DIAGNOSTICS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Attached Laboratory Files &amp; Diagnostics
                  </h3>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200">
                    {attachments.length}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400">
                  Direct technician sync
                </span>
              </div>

              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((file) => {
                    const isImg = file.type === "image" || /\.(png|jpg|jpeg|webp)$/i.test(file.name);
                    const isPdf = file.type === "pdf" || /\.pdf$/i.test(file.name);

                    return (
                      <div
                        key={file.id}
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3 hover:border-blue-300 hover:bg-white transition"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isPdf
                                ? "bg-rose-100 text-rose-700"
                                : isImg
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {isPdf ? "PDF" : isImg ? "IMG" : "DOC"}
                          </div>

                          <div className="min-w-0">
                            <span className="block truncate text-xs font-bold text-slate-800" title={file.name}>
                              {file.name}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {file.size} • {file.uploadedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isImg && file.url && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(file.url || null)}
                              title="Preview Image"
                              className="rounded-lg p-1.5 text-xs text-blue-600 hover:bg-slate-200 transition cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          )}

                          {file.url ? (
                            <a
                              href={file.url}
                              download={file.name}
                              target="_blank"
                              rel="noreferrer"
                              title="Download Attachment"
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center gap-1 border border-blue-200"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                              </svg>
                              <span>Download</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">Stored</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                  <p>No technician file attachments currently linked to this case.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Lab scans, sector heatmaps, and formal completion certificates will appear here automatically.
                  </p>
                </div>
              )}
            </div>

            {/* INTERACTIVE MESSAGE THREAD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>
                  {ticket.category === "Cybersecurity"
                    ? "Direct Communication Thread with Security Lead"
                    : ticket.category === "Cloud Solutions"
                    ? "Direct Communication Thread with Cloud Architect"
                    : ticket.category === "Managed IT"
                    ? "Direct Communication Thread with Systems Engineer"
                    : "Direct Communication Thread with Forensic Engineer"}
                </span>
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-1 text-xs">
                {messages.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-slate-400">
                    <p className="font-semibold text-slate-600">
                      No chat messages in this case yet
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
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
                            ? "border-blue-200 bg-blue-50/60 text-blue-950 ml-4"
                            : "border-slate-200 bg-slate-50/80 text-slate-900 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[11px] flex items-center gap-1.5">
                            {isTech ? (
                              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </span>
                            )}
                            <span>{m.author}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">{m.time}</span>
                        </div>
                        <p className="leading-relaxed">{m.text}</p>
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
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-blue-600 transition"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{sending ? "Sending..." : "Send Reply to Engineering"}</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: SPECIALIST & SERVICE LEVEL (1 COL) */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs text-xs">
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-3">
                {ticket.category === "Cybersecurity"
                  ? "Assigned Security Lead"
                  : ticket.category === "Cloud Solutions"
                  ? "Assigned Cloud Architect"
                  : ticket.category === "Managed IT"
                  ? "Assigned Systems Lead"
                  : "Assigned Forensic Staff"}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-200">
                  {ticket.assignedTech && ticket.assignedTech !== "Unassigned"
                    ? ticket.assignedTech.substring(0, 2).toUpperCase()
                    : "UN"}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {ticket.assignedTech && ticket.assignedTech !== "Unassigned"
                      ? ticket.assignedTech
                      : "Pending Specialist Dispatch"}
                  </p>
                  <span className="text-[11px] text-slate-500">
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

              <div className="space-y-2 border-t border-slate-100 pt-3 text-slate-600">
                <p>Created: <strong className="text-slate-950">{ticket.createdAt || "Today"}</strong></p>
                <p>Last Update: <strong className="text-slate-950">{ticket.lastUpdated || "Live from Supabase"}</strong></p>
                <p>SLA Tier: <strong className="text-rose-600">{ticket.priority || "CRITICAL"} SLA</strong></p>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-6 text-xs text-blue-950">
              <h4 className="font-bold text-blue-900 mb-1">Guaranteed Service Standard</h4>
              <p className="text-[11px] leading-relaxed text-blue-800">
                {ticket.category === "Data Recovery"
                  ? "All data recovery tickets at The Data Dot are backed by our strict No Data, No Recovery Fee guarantee. You only pay if files are 100% verified."
                  : ticket.category === "Cybersecurity"
                  ? "All incident responses are executed in accordance with ISO 27001 zero-trust containment protocols with contractual non-disclosure assurance."
                  : "All cloud and infrastructure deployments are backed by our 99.99% enterprise uptime commitment and 15-minute response SLA."}
              </p>
            </div>
          </div>
        </div>

        {/* IMAGE PREVIEW LIGHTBOX MODAL */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-2 border border-slate-300 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-xs">
                <span className="font-bold text-slate-900">Attachment Preview</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Attachment preview"
                  className="max-h-[70vh] w-auto rounded-lg object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* MODERN DELETE MODAL */}
        <ModernDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Support Ticket"
          itemType="Ticket"
          itemName={`Ticket #${ticket.id} - ${ticket.deviceOrSubject}`}
          description={`Are you sure you want to permanently delete Ticket #${ticket.id}? This will purge all message history, diagnostic scans, and tracking telemetry.`}
          confirmButtonText="Permanently Delete Ticket"
          isDeleting={isDeleting}
        />

      </main>

      <Footer />
    </div>
  );
}
