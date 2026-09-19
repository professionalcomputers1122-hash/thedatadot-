"use client";

import { use, useState, useEffect, useRef } from "react";
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

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export default function TechnicianTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState<any>(null);

  const [status, setStatus] = useState("Media Received");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");
  const [notification, setNotification] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let found = null;
        try {
          const res = await fetch(`/api/tickets/${ticketId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.ticket) {
              found = data.ticket;
            }
          }
        } catch (e) {
          console.warn("Direct ticket fetch error:", e);
        }

        if (!found) {
          const liveTickets = await fetchTicketsFromSupabase();
          found = liveTickets.find(
            (t) => t.id.toLowerCase() === ticketId.toLowerCase()
          );
        }

        if (found) {
          let override: any = null;
          if (typeof window !== "undefined") {
            try {
              const raw = localStorage.getItem("tdd_ticket_overrides");
              if (raw) {
                const parsed = JSON.parse(raw);
                override = parsed[ticketId] || (ticketId ? parsed[ticketId.toUpperCase()] : null) || (ticketId ? parsed[ticketId.toLowerCase()] : null);
              }
            } catch (e) {
              console.warn("Override check warning:", e);
            }
          }

          const resolvedStatus = override?.status || found.status || (found.category === "Data Recovery" ? "Media Received" : "Intake & Diagnostics");
          const resolvedProgress = override?.progress !== undefined ? override.progress : (Number(found.clonedPercent) || 0);
          const resolvedNotes = override?.notes !== undefined ? override.notes : (found.techNotes || "");

          setTicket({
            ...found,
            status: resolvedStatus,
            clonedPercent: resolvedProgress,
            techNotes: resolvedNotes,
          });
          setStatus(resolvedStatus);
          setProgress(resolvedProgress);
          setNotes(resolvedNotes);

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

          // Load attachments for this ticket
          if (typeof window !== "undefined") {
            try {
              const storedAtts = localStorage.getItem(`tdd_attachments_${ticketId}`);
              if (storedAtts) {
                setAttachments(JSON.parse(storedAtts));
              } else {
                setAttachments([
                  {
                    id: `att-${ticketId}-1`,
                    name: `${(found.category || "Service").toLowerCase().replace(/\s+/g, "_")}_diagnostic_telemetry.pdf`,
                    size: "2.1 MB",
                    type: "pdf",
                    uploadedAt: found.createdAt || "Today",
                    uploadedBy: found.assignedTech && found.assignedTech !== "Unassigned" ? found.assignedTech : "Bench Intake Desk",
                  },
                ]);
              }
            } catch (attErr) {
              console.warn("Could not load stored attachments:", attErr);
            }
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

  // Dedicated Internal Workbench Status Update (Button Only - No Automatic Customer Chat Broadcast)
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    setSaving(true);

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("tdd_ticket_overrides");
        const overrides = raw ? JSON.parse(raw) : {};
        const overrideData = {
          status,
          progress,
          notes,
          updatedAt: "Just now",
        };
        overrides[ticket.id] = overrideData;
        overrides[ticket.id.toUpperCase()] = overrideData;
        overrides[ticket.id.toLowerCase()] = overrideData;
        localStorage.setItem("tdd_ticket_overrides", JSON.stringify(overrides));
        window.dispatchEvent(new Event("tickets-updated"));
      } catch (storageErr) {
        console.warn("Could not save persistent override:", storageErr);
      }
    }

    try {
      await updateTicketInSupabase(ticket.id, {
        status,
        clonedPercent: progress,
        techNotes: notes,
      });

      setTicket((prev: any) => ({
        ...prev,
        status,
        clonedPercent: progress,
        techNotes: notes,
      }));

      setNotification("Internal workbench update saved successfully!");
    } catch (err) {
      console.warn("Update sync warning:", err);
      setNotification("Status updated locally.");
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(""), 4000);
    }
  };

  // Real File Attachment Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !ticket) return;

    const newAtts: TicketAttachment[] = [];
    Array.from(files).forEach((file, index) => {
      const bytes = file.size;
      let sizeStr = `${(bytes / 1024).toFixed(1)} KB`;
      if (bytes > 1024 * 1024) {
        sizeStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }

      let fileType = "generic";
      const nameLower = file.name.toLowerCase();
      if (file.type.includes("pdf") || nameLower.endsWith(".pdf")) fileType = "pdf";
      else if (file.type.includes("image") || nameLower.endsWith(".png") || nameLower.endsWith(".jpg") || nameLower.endsWith(".jpeg") || nameLower.endsWith(".webp")) fileType = "image";
      else if (nameLower.endsWith(".zip") || nameLower.endsWith(".tar") || nameLower.endsWith(".gz") || nameLower.endsWith(".7z")) fileType = "archive";
      else if (nameLower.endsWith(".bin") || nameLower.endsWith(".hex") || nameLower.endsWith(".img") || nameLower.endsWith(".dd") || nameLower.endsWith(".mdf")) fileType = "binary";
      else if (file.type.includes("text") || nameLower.endsWith(".log") || nameLower.endsWith(".txt") || nameLower.endsWith(".json")) fileType = "text";

      const objectUrl = URL.createObjectURL(file);

      newAtts.push({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        size: sizeStr,
        type: fileType,
        url: objectUrl,
        uploadedAt: "Just now",
        uploadedBy: ticket.assignedTech && ticket.assignedTech !== "Unassigned" ? ticket.assignedTech : "Bench Specialist",
      });
    });

    const updated = [...attachments, ...newAtts];
    setAttachments(updated);

    if (typeof window !== "undefined") {
      try {
        const serializable = updated.map((a) => ({
          ...a,
          url: a.url?.startsWith("blob:") ? undefined : a.url,
        }));
        localStorage.setItem(`tdd_attachments_${ticketId}`, JSON.stringify(serializable));
      } catch (err) {
        console.warn("Storage warning for attachments:", err);
      }
    }

    setNotification(`${newAtts.length} file(s) attached successfully!`);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setTimeout(() => setNotification(""), 4000);
  };

  const handleDeleteAttachment = (attId: string) => {
    const updated = attachments.filter((a) => a.id !== attId);
    setAttachments(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`tdd_attachments_${ticketId}`, JSON.stringify(updated));
      } catch (err) {
        console.warn("Storage warning for attachments:", err);
      }
    }
    setNotification("Attachment removed.");
    setTimeout(() => setNotification(""), 3000);
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
      <div className="min-h-screen bg-[#0b1324] text-slate-100 flex flex-col antialiased">
        <TechnicianNav />
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-4" />
          <p className="text-xs text-slate-400 font-mono">Calibrating Workbench Target #{ticketId}...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#0b1324] text-slate-100 flex flex-col antialiased">
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
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
            >
              ← Back to Diagnostic Queue
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1324] text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <TechnicianNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/technician/tickets"
              className="text-xs font-medium text-slate-400 hover:text-white mb-2 inline-block transition"
            >
              ← Back to Diagnostic Queue
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                #{ticket.id}
              </h1>
              <span className="rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-0.5 text-xs font-semibold">
                {status}
              </span>
              <span className="rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold">
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
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/70 p-4 text-xs font-semibold text-emerald-300 flex items-center justify-between shadow-sm">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* WORKBENCH GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* LEFT: CONTROLLER FORM (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 text-xs shadow-sm">
              <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Technical Execution Controls &amp; Stage
                </h2>
                <span className="text-[11px] font-mono text-blue-400">Telemetry Push Active</span>
              </div>

              <form onSubmit={handleSaveUpdate} className="space-y-5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    {ticket.category === "Cybersecurity"
                      ? "SOC Containment & Remediation Stage"
                      : ticket.category === "Cloud Solutions"
                      ? "Cloud Architecture & Migration Stage"
                      : ticket.category === "Managed IT"
                      ? "Managed IT Service Resolution Stage"
                      : "Hardware Recovery Stage"}
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-500 font-medium transition"
                  >
                    {(() => {
                      const stages =
                        ticket.category === "Cybersecurity"
                          ? [
                              "Intake & Diagnostics",
                              "Threat Intake & Triage",
                              "Security Forensics",
                              "Containment & Remediation",
                              "Policy Hardening",
                              "Resolved",
                            ]
                          : ticket.category === "Cloud Solutions"
                          ? [
                              "Intake & Diagnostics",
                              "Scope Intake & Discovery",
                              "Cloud Architecture",
                              "Deployment & Migration",
                              "Handover & Audit",
                              "Resolved",
                            ]
                          : ticket.category === "Managed IT"
                          ? [
                              "Intake & Diagnostics",
                              "Service Intake & Triage",
                              "Technical Assessment",
                              "Resolution & Rollout",
                              "Quality Verification",
                              "Resolved",
                            ]
                          : [
                              "Intake & Diagnostics",
                              "Media Received",
                              "Cleanroom Diagnosis",
                              "PC-3000 Raw Platter Mirrored Extraction",
                              "Firmware Virtual Translator Rebuild",
                              "File System Verification & File Tree Extracted",
                              "Resolved",
                            ];

                      if (status && !stages.includes(status)) {
                        stages.unshift(status);
                      }

                      return stages.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-semibold text-slate-300">
                      {ticket.category === "Cybersecurity"
                        ? "Remediation & Hardening Progress (% Remediated)"
                        : ticket.category === "Cloud Solutions"
                        ? "Architecture Deployment & Migration (% Deployed)"
                        : ticket.category === "Managed IT"
                        ? "Technical Resolution & Deployment (% Resolved)"
                        : "Sector Extraction Progress (% Cloned)"}
                    </label>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={progress}
                    onChange={(e) => setProgress(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-800 accent-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    {ticket.category === "Cybersecurity"
                      ? "Forensic Threat Analysis / Containment Notes"
                      : ticket.category === "Cloud Solutions"
                      ? "Cloud Architecture Deployment & Configuration Log"
                      : ticket.category === "Managed IT"
                      ? "Engineering Field Notes / Technical Resolution Summary"
                      : "Internal Forensic Engineering Log / Donor Head Notes"}
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter technical observations, forensic logs, or resolution steps..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-500 font-mono text-xs leading-relaxed transition"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    * Status, progress, and engineering notes saved to internal system.
                  </span>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-500 transition disabled:opacity-50 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💾</span>
                    <span>{saving ? "Saving Internal Update..." : "Save Internal Update"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* DIRECT CLIENT MESSAGES */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 text-xs shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Client Communication Thread
                </h2>
                <span className="text-[11px] text-slate-400">Two-way authenticated sync</span>
              </div>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-900/60 rounded-xl border border-dashed border-slate-800">
                    <p className="font-semibold text-slate-400">No communication logs recorded yet</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Use the field below to dispatch an engineering case update to the client.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isTech = m.sender === "Technician";
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border ${
                          isTech
                            ? "border-blue-500/20 bg-blue-950/30 text-blue-100 ml-4"
                            : "border-slate-800 bg-slate-900 text-slate-200 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-[11px] text-slate-200">
                            {isTech ? "Specialist: " : "Client: "}
                            {m.author}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{m.time}</span>
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
                  placeholder="Send an official laboratory or engineering update to the client..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-blue-500 text-xs transition"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 transition text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✉️</span>
                    <span>Send Client Update</span>
                  </button>
                </div>
              </form>
            </div>

            {/* ATTACHMENTS & LAB FILES */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 text-xs shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span>📎</span>
                    <span>Case Attachments &amp; Lab Captures ({attachments.length})</span>
                  </h2>
                  <span className="text-[11px] text-slate-400">Forensic images, diagnostics, and test results</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 font-semibold text-white hover:bg-blue-500 transition text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>📎</span>
                  <span>Upload File</span>
                </button>
              </div>

              {attachments.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-900/60 rounded-xl border border-dashed border-slate-800">
                  <p className="font-semibold text-slate-400">No attachments uploaded yet</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Click the button above to upload firmware dumps, photos, or logs.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400 font-bold text-sm">
                          {file.type === "pdf" ? "📄" : file.type === "image" ? "🖼️" : file.type === "archive" ? "📦" : file.type === "binary" ? "💾" : "📎"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {file.size} • {file.uploadedAt} by {file.uploadedBy}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {file.url ? (
                          <a
                            href={file.url}
                            download={file.name}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center gap-1"
                          >
                            <span>⬇️</span>
                            <span>Download</span>
                          </a>
                        ) : (
                          <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400">
                            Verified File
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(file.id)}
                          className="rounded-lg border border-rose-900/60 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 px-2 py-1 text-xs font-bold transition cursor-pointer"
                          title="Delete Attachment"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: HARDWARE / TECHNICAL SPECS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6 text-xs">
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-4 border-b border-slate-800 pb-3">
                {ticket.category === "Cybersecurity"
                  ? "Target Infrastructure & Host Identity"
                  : ticket.category === "Cloud Solutions"
                  ? "Cloud Tenant & Environment Identity"
                  : ticket.category === "Managed IT"
                  ? "Fleet Asset & System Identity"
                  : "Media Technical Identity"}
              </h3>

              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">
                    {ticket.category === "Data Recovery" ? "Device Target:" : "Subject / Scope:"}
                  </span>
                  <span className="font-semibold text-white text-right">{ticket.deviceOrSubject}</span>
                </div>

                {ticket.serialNumber && (
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">
                      {ticket.category === "Cybersecurity"
                        ? "Host / Domain:"
                        : ticket.category === "Cloud Solutions"
                        ? "Tenant ID:"
                        : ticket.category === "Managed IT"
                        ? "Asset Tag:"
                        : "Serial Number:"}
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">{ticket.serialNumber}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Service Category:</span>
                  <span className="font-semibold text-blue-400">{ticket.category}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Client Org:</span>
                  <span className="text-white font-medium">{ticket.companyName}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Authorized Contact:</span>
                  <span className="text-white">{ticket.customerName}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Assigned Station / Unit:</span>
                  <span className="text-blue-300 font-mono">
                    {ticket.assignedBench && ticket.assignedBench !== "Pending Allocation"
                      ? ticket.assignedBench
                      : ticket.category === "Cybersecurity"
                      ? "SOC Threat Isolation Pod 02"
                      : ticket.category === "Cloud Solutions"
                      ? "Cloud Architecture Terminal 01"
                      : ticket.category === "Managed IT"
                      ? "Enterprise Fleet Workbench 03"
                      : "PC-3000 Flash / SAS Bench 01"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">
                    {ticket.category === "Cybersecurity"
                      ? "Threat Scope & Incident Indicators:"
                      : ticket.category === "Cloud Solutions"
                      ? "Cloud Architecture Requirements:"
                      : ticket.category === "Managed IT"
                      ? "Fleet Hardware / Workstation Issues:"
                      : "Reported Damage / Symptoms:"}
                  </span>
                  <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed font-mono text-[11px]">
                    {ticket.symptoms}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-6 text-xs text-blue-200">
              <h4 className="font-bold text-blue-300 mb-2">
                {ticket.category === "Cybersecurity"
                  ? "SOC Rapid Incident Containment Protocol"
                  : ticket.category === "Cloud Solutions"
                  ? "Enterprise Cloud Architecture Guardrail"
                  : ticket.category === "Managed IT"
                  ? "Managed IT Infrastructure Protocol"
                  : "Class-5 Clean Bench Protocol"}
              </h4>
              <p className="text-[11px] leading-relaxed text-blue-300/80">
                {ticket.category === "Cybersecurity"
                  ? "Maintain forensic evidence chain of custody. Isolate affected subnets and preserve volatile RAM captures prior to applying containment scripts."
                  : ticket.category === "Cloud Solutions"
                  ? "Enforce least-privilege IAM and zero-trust network boundaries. Verify snapshot rollbacks before commencing tenant cutovers."
                  : ticket.category === "Managed IT"
                  ? "Verify configuration change requests against enterprise tickets. Run baseline latency and health tests before final sign-off."
                  : "Ensure grounding wrist strap is attached before unsealing drive top cover. All head transplants require donor slider gap verification under 100x microscope."}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden Native File Input for Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
        aria-label="Upload ticket attachment"
      />

      <Footer />
    </div>
  );
}
