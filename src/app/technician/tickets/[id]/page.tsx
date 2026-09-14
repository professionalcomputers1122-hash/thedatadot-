"use client";

import { use, useState } from "react";
import Link from "next/link";
import TechnicianNav from "@/components/TechnicianNav";
import Footer from "@/components/Footer";
import { initialTickets } from "@/lib/portalData";

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

  const ticket =
    initialTickets.find((t) => t.id.toLowerCase() === ticketId.toLowerCase()) ||
    initialTickets[0];

  const [status, setStatus] = useState(ticket.status);
  const [progress, setProgress] = useState(ticket.clonedPercent || 50);
  const [notes, setNotes] = useState(ticket.techNotes);
  const [notification, setNotification] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "Customer",
      author: ticket.customerName,
      time: "Sep 12, 10:15 AM",
      text: ticket.symptoms,
    },
    {
      sender: "Technician",
      author: "S. Murugan (Cleanroom Lead)",
      time: "Sep 12, 11:30 AM",
      text: "Device logged in cleanroom vault. Starting donor slider matching.",
    },
    {
      sender: "Technician",
      author: "S. Murugan (Cleanroom Lead)",
      time: "Sep 13, 02:45 PM",
      text: "Donor heads swapped under ISO Class-5 clean air bench. PC-3000 mirror imaging initiated.",
    },
  ]);

  const [replyText, setReplyText] = useState("");

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Hardware recovery status updated! Synced to Customer Portal.");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setMessages([
      ...messages,
      {
        sender: "Technician",
        author: "S. Murugan (Cleanroom Lead)",
        time: "Just now",
        text: replyText,
      },
    ]);
    setReplyText("");
    setNotification("Message dispatched to Customer Portal.");
    setTimeout(() => setNotification(""), 4000);
  };

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
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Client: <strong className="text-white">{ticket.companyName}</strong>
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
                    * Client timeline updates automatically upon save.
                  </span>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-indigo-500 transition"
                  >
                    Save Hardware Update →
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
                {messages.map((m, idx) => {
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
                })}
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
                    <span className="font-mono text-indigo-300">{ticket.serialNumber}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Intake Date:</span>
                  <span>{ticket.createdAt}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Customer SLA:</span>
                  <span className="text-red-400 font-bold">15-Minute Critical</span>
                </div>

                <div className="mt-4">
                  <span className="text-slate-500 block mb-1">Customer Failure Statement:</span>
                  <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                    {ticket.symptoms}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Workbench &amp; Tooling Calibration
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>PC-3000 Channel 01: Write-blocked SATA 6Gb/s</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>ISO Class-5 Laminar Hood: 0.05 in. w.g. pressure</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Micro-head comb unloader kit calibrated</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
