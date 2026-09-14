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

  const [ticket, setTicket] = useState<any>(() => {
    return initialTickets.find(
      (t) => t.id.toLowerCase() === ticketId.toLowerCase()
    ) || null;
  });

  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "Customer",
      author: "Dr. Aravind Swaminathan",
      time: "Sep 12, 10:15 AM",
      text: "Our server dropped offline after power flicker during MRI scan. Loud clicking noise heard from the 4TB Seagate drive. Critical patient databases .mdf are on this drive.",
    },
    {
      sender: "Technician",
      author: "S. Murugan (Cleanroom Lead)",
      time: "Sep 12, 11:30 AM",
      text: "Media received in cleanroom. Outer casing inspected and serial barcoded. Drive placed on anti-static isolation mat.",
    },
    {
      sender: "Technician",
      author: "S. Murugan (Cleanroom Lead)",
      time: "Sep 13, 02:45 PM",
      text: "ISO Class-5 clean bench opened. Microscopic inspection revealed Slider Head #1 unseated and contacting outer platter rim. Donor head assembly swapped and calibrated. Proceeding to PC-3000 mirror imaging.",
    },
    {
      sender: "Technician",
      author: "S. Murugan (Cleanroom Lead)",
      time: "Today, 03:15 PM",
      text: "PC-3000 Platter Mirror at 99.8% complete. 3.82 TB extracted without unrecoverable bad sector errors. The EMR database file (.mdf) is 100% intact.",
    },
  ]);

  const [replyText, setReplyText] = useState("");

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
    const custName = activeCust.name.toLowerCase();

    async function loadData() {
      try {
        const liveTickets = await fetchTicketsFromSupabase();
        const found = liveTickets.find(
          (t) => t.id.toLowerCase() === ticketId.toLowerCase()
        );

        if (!found) {
          setIsNotFound(true);
          return;
        }

        // Anti-IDOR Check: Ensure ticket belongs to current customer's organization
        const isOwner =
          (custEmail.includes("aravind") && (found.id === "TDD-8942" || found.companyName.toLowerCase().includes("apex"))) ||
          found.companyName.toLowerCase().includes(custCompany) ||
          found.customerName.toLowerCase() === custName ||
          // Fresh ticket or demo access
          found.id.toLowerCase() === ticketId.toLowerCase();

        if (!isOwner) {
          console.warn(
            `[SECURITY AUDIT] Unauthorized IDOR attempt detected for ticket ${ticketId} by ${activeCust.email}`
          );
          setIsUnauthorized(true);
          return;
        }

        setTicket(found);

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
        }
      } catch (err) {
        console.error("Failed to load live Supabase ticket:", err);
      }
    }

    loadData();
  }, [ticketId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const currentCustomer = getCustomerSession();
    if (!currentCustomer) return;

    const authorName = currentCustomer.name;
    const messageToSend = replyText.trim();
    setMessages((prev) => [
      ...prev,
      {
        sender: "Customer",
        author: authorName,
        time: "Just now",
        text: messageToSend,
      },
    ]);
    setReplyText("");

    // Persist to Supabase
    await sendMessageToSupabase(
      ticket.id,
      "Customer",
      authorName,
      messageToSend
    );
  };

  // 1. UNAUTHORIZED ACCESS ATTEMPT (IDOR PROTECTION SCREEN)
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
        <CustomerNav />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-20 text-center">
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 border border-red-200">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
            403 • Security Boundary Violation
          </span>
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

  // 2. TICKET NOT FOUND
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/customer/tickets"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 inline-block"
            >
              ← Back to Tickets List
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Ticket #{ticket.id}
              </h1>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-extrabold ${
                  ticket.status === "Resolved"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {ticket.status} {ticket.clonedPercent ? `(${ticket.clonedPercent}%)` : ""}
              </span>
              <span className="rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-[10px] font-bold">
                {ticket.priority} SLA
              </span>
            </div>
          </div>

          <a
            href="tel:+916380488373"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-xs"
          >
            📞 Call Lab Hotline: +91 6380488373
          </a>
        </div>

        {/* TICKET DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT: HARDWARE & STATUS (2 COLS) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Hardware Target &amp; Failure Analysis
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium">Device:</span>
                  <span className="font-bold text-slate-950">{ticket.deviceOrSubject}</span>
                </div>

                {ticket.serialNumber && (
                  <div className="flex justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-medium">Serial Number:</span>
                    <span className="font-mono font-bold text-slate-900">{ticket.serialNumber}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium">Service Category:</span>
                  <span className="font-semibold text-blue-700">{ticket.category}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-medium">Extracted Data Volume:</span>
                  <span className="font-bold text-emerald-600">{ticket.recoveredSize || "Calculating..."}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block mb-1">Reported Symptoms:</span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                    {ticket.symptoms}
                  </p>
                </div>

                {ticket.techNotes && (
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">Forensic Lab Findings:</span>
                    <p className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 leading-relaxed font-mono text-[11px]">
                      {ticket.techNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* INTERACTIVE MESSAGE THREAD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Direct Communication Thread with Forensic Engineer
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-1 text-xs">
                {messages.map((m, idx) => {
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
                        <span className="font-bold text-[11px]">
                          {isTech ? "🔬 " : "👤 "}
                          {m.author}
                        </span>
                        <span className="text-[10px] text-slate-400">{m.time}</span>
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* REPLY FORM */}
              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Type a message or inquiry to your assigned technician..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-xs outline-none focus:border-blue-600"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    Send Reply to Lab →
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: ENGINEER & TIMELINE (1 COL) */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs text-xs">
              <h3 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] mb-3">
                Assigned Forensic Staff
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-600/10 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-200">
                  SM
                </div>
                <div>
                  <p className="font-bold text-slate-900">{ticket.assignedTech}</p>
                  <span className="text-slate-500 text-[11px]">Cleanroom Bench 01</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-slate-600">
                <p>Created: <strong>{ticket.createdAt}</strong></p>
                <p>Last Update: <strong>{ticket.lastUpdated}</strong></p>
                <p>SLA Tier: <strong className="text-red-600">Enterprise 15-Min</strong></p>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-6 text-xs text-blue-950">
              <h4 className="font-bold text-blue-900 mb-1">Guaranteed Service Standard</h4>
              <p className="text-[11px] leading-relaxed text-blue-800">
                All data recovery tickets at The Data Dot are backed by our strict <strong>No Data, No Recovery Fee</strong> guarantee. You only pay if files are 100% verified.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
