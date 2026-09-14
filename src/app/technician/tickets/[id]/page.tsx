"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import TechnicianNav from "@/components/TechnicianNav";
import Footer from "@/components/Footer";
import {
  initialTickets,
  fetchTicketsFromSupabase,
  fetchMessagesFromSupabase,
  sendMessageToSupabase,
  updateTicketInSupabase,
} from "@/lib/portalData";

interface Message {
  sender: "Customer" | "Technician";
  author: string;
  time: string;
  text: string;
}

export default function TechnicianTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState<any>(() => {
    return (
      initialTickets.find((t) => t.id.toLowerCase() === ticketId.toLowerCase()) ||
      null
    );
  });

  const [status, setStatus] = useState("Cleanroom Diagnosis");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");
  const [notification, setNotification] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const liveTickets = await fetchTicketsFromSupabase();
        let found = liveTickets.find(
          (t) => t.id.toLowerCase() === ticketId.toLowerCase()
        );

        if (!found) {
          found = initialTickets.find(
            (t) => t.id.toLowerCase() === ticketId.toLowerCase()
          );
        }

        if (found) {
          setTicket(found);
          setStatus(found.status || "Cleanroom Diagnosis");
          setProgress(found.clonedPercent || 0);
          setNotes(found.techNotes || "");

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
                text: "ISO Class-5 clean bench opened. Microscopic inspection revealed Slider Head #1 unseated and contacting outer platter rim. Donor head assembly swapped and calibrated. Proceeding to PC-3000 mirror imaging.",
              },
              {
                sender: "Technician",
                author: "K. Vignesh (Cleanroom Lead)",
                time: "Today, 03:15 PM",
                text: "PC-3000 Platter Mirror at 99.8% complete. 3.82 TB extracted without unrecoverable bad sector errors. The EMR database file (.mdf) is 100% intact.",
              },
            ]);
          } else {
            const initialThread: Message[] = [];
            if (found.symptoms) {
              initialThread.push({
                sender: "Customer",
                author: found.customerName || "Client",
                time: found.createdAt || "Intake",
                text: found.symptoms,
              });
            }
            if (found.techNotes) {
              initialThread.push({
                sender: "Technician",
                author: found.assignedTech && found.assignedTech !== "Unassigned" ? found.assignedTech : "Bench Intake Desk",
                time: "Bench Intake",
                text: found.techNotes,
              });
            }
            setMessages(initialThread);
          }
        }
      } catch (err) {
        console.error("Failed to load technician ticket:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [ticketId]);

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    setSaving(true);
    try {
      await updateTicketInSupabase(ticket.id, {
        status,
        clonedPercent: progress,
        techNotes: notes,
      });
      setNotification("Hardware recovery status updated! Synced live to Customer Portal.");
    } catch (err) {
      console.warn("Update sync warning:", err);
      setNotification("Status updated locally.");
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(""), 4000);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;

    const messageText = replyText.trim();
    const currentAuthor =
      ticket.assignedTech && ticket.assignedTech !== "Unassigned"
        ? ticket.assignedTech
        : "K. Vignesh (Cleanroom Lead)";

    setMessages((prev) => [
      ...prev,
      {
        sender: "Technician",
        author: currentAuthor,
        time: "Just now",
        text: messageText,
      },
    ]);
    setReplyText("");
    setNotification("Message dispatched to Customer Portal.");
    setTimeout(() => setNotification(""), 4000);

    try {
      await sendMessageToSupabase(
        ticket.id,
        "Technician",
        currentAuthor,
        messageText
      );
    } catch (err) {
      console.warn("Message dispatch error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased">
        <TechnicianNav />
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4" />
          <p className="text-xs text-slate-400 font-mono">Calibrating Workbench Target #{ticketId}...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased">
        <TechnicianNav />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Target #{ticketId} Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            No active hardware forensic record found for this identifier.
          </p>
          <div className="mt-6">
            <Link
              href="/technician/tickets"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
            >
              ← Back to Lab Queue
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <TechnicianNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/technician/tickets"
              className="text-xs font-semibold text-slate-400 hover:text-white mb-2 inline-block"
            >
              ← Back to Lab Queue
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Workbench Target #{ticket.id}
              </h1>
              <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 text-xs font-bold">
                {status}
              </span>
              <span className="rounded-full bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                {ticket.priority || "CRITICAL"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Client: <strong className="text-white">{ticket.companyName}</strong> ({ticket.customerName})
            </span>
          </div>
        </div>

        {notification && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")}>✕</button>
          </div>
        )}

        {/* WORKBENCH GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* LEFT: CONTROLLER FORM (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-sm text-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-5">
                Forensic Extraction Controls &amp; Stage
              </h2>

              <form onSubmit={handleSaveUpdate} className="space-y-5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Hardware Recovery Stage
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500"
                  >
                    <option>Media Received</option>
                    <option>Cleanroom Diagnosis</option>
                    <option>PC-3000 Imaging</option>
                    <option>Integrity Verification</option>
                    <option>Resolved</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-semibold text-slate-300">
                      Sector Extraction Progress (% Cloned)
                    </label>
                    <span className="text-sm font-black text-emerald-400">
                      {progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={(e) => setProgress(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-700 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Internal Forensic Engineering Log / Donor Head Notes
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-500">
                    * Client timeline updates live upon save.
                  </span>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Hardware Update →"}
                  </button>
                </div>
              </form>
            </div>

            {/* DIRECT CLIENT MESSAGES */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-sm text-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Client Communication Thread
              </h2>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
                    <p className="font-semibold text-slate-400">No communication logs recorded yet</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Use the form below to dispatch an official cleanroom bench update to the customer.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isTech = m.sender === "Technician";
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border ${
                          isTech
                            ? "border-indigo-500/30 bg-indigo-950/40 text-indigo-200 ml-4"
                            : "border-slate-800 bg-slate-950 text-slate-200 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[11px]">
                            {isTech ? "🔬 " : "👤 "}
                            {m.author}
                          </span>
                          <span className="text-[10px] text-slate-400">{m.time}</span>
                        </div>
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Send an official laboratory update to the client..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-indigo-500 text-xs"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 transition"
                  >
                    Send Update to Client Portal →
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: HARDWARE SPECS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6 text-xs">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-4">
                Media Technical Identity
              </h3>

              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Device:</span>
                  <span className="font-bold text-white">{ticket.deviceOrSubject}</span>
                </div>

                {ticket.serialNumber && (
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Serial Number:</span>
                    <span className="font-mono text-emerald-400">{ticket.serialNumber}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-indigo-400">{ticket.category}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Client Org:</span>
                  <span className="text-white">{ticket.companyName}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Intake Contact:</span>
                  <span className="text-white">{ticket.customerName}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Assigned Bench:</span>
                  <span className="text-indigo-300 font-mono">PC-3000 Flash / SAS Bench 01</span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Reported Damage / Symptoms:</span>
                  <p className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 leading-relaxed font-mono text-[11px]">
                    {ticket.symptoms}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-950/20 p-6 text-xs text-indigo-200">
              <h4 className="font-bold text-indigo-300 mb-2">Class-5 Clean Bench Protocol</h4>
              <p className="text-[11px] leading-relaxed text-indigo-300/80">
                Ensure grounding wrist strap is attached before unsealing drive top cover. All head transplants require donor slider gap verification under 100x microscope.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
