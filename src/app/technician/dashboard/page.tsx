"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TechnicianNav from "@/components/TechnicianNav";
import Footer from "@/components/Footer";
import {
  fetchTicketsFromSupabase,
  updateTicketInSupabase,
  sendMessageToSupabase,
  fetchMessagesFromSupabase,
} from "@/lib/portalData";

interface CaseItem {
  id: string;
  client: string;
  device: string;
  serial: string;
  mediaType: "HDD" | "SSD" | "RAID" | "FLASH" | "NETWORK" | "SERVER" | "GENERAL";
  category?: string;
  status: string;
  progress: number;
  priority: "CRITICAL" | "HIGH" | "STANDARD";
  notes: string;
  bench: string;
  headsHealth?: string;
  badSectorsRemapped?: number;
  temp?: string;
  leadTech?: string;
}

interface ChatMessage {
  sender: "Customer" | "Technician";
  author: string;
  time: string;
  text: string;
}

export default function TechnicianWorkbenchPage() {
  const [cases, setCases] = useState<CaseItem[]>([
    {
      id: "TDD-8942",
      client: "Apex Healthcare Diagnostic Center",
      device: "4TB Seagate SATA (ST4000DM004)",
      serial: "WDC-WMC4N0E83719",
      mediaType: "HDD",
      status: "PC-3000 Raw Platter Mirrored Extraction",
      progress: 99.8,
      priority: "CRITICAL",
      notes: "Cleanroom donor slider heads calibrated. Head 0-3 reading cleanly. 3.82TB cloned.",
      bench: "PC-3000 Channel 01 (Cleanroom Bench A)",
      headsHealth: "Head 0-3 Operational (Swapped in Class-5)",
      badSectorsRemapped: 142,
      temp: "28.4°C (Normal)",
    },
    {
      id: "TDD-8943",
      client: "Nexus Legal Advisors LLP",
      device: "Samsung 980 Pro NVMe 2TB M.2",
      serial: "S6B0NS0W102948F",
      mediaType: "SSD",
      status: "Firmware Virtual Translator Rebuild",
      progress: 74.5,
      priority: "HIGH",
      notes: "Elpis controller locked in safe-mode. Bypassing bad NAND blocks in bank 2.",
      bench: "PC-3000 Portable III NVMe Station",
      headsHealth: "NAND Controller Safe Mode Bypass Active",
      badSectorsRemapped: 890,
      temp: "34.1°C (Normal)",
    },
    {
      id: "TDD-8944",
      client: "Metropolitan Logistics Warehousing",
      device: "QNAP TS-453D 4-Bay RAID 5",
      serial: "QNP-RAID-9921",
      mediaType: "RAID",
      status: "Hex Pattern XOR Parity Reconstruction",
      progress: 42.0,
      priority: "CRITICAL",
      notes: "Rebuilding missing blocks via XOR parity algorithm.",
      bench: "Forensic Hex Server Rack 04",
      headsHealth: "RAID Stripe 64KB Block Alignment Synced",
      badSectorsRemapped: 2150,
      temp: "29.8°C (Normal)",
    },
  ]);

  const [selectedCaseId, setSelectedCaseId] = useState<string>("TDD-8942");
  const [notification, setNotification] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editProgress, setEditProgress] = useState<number>(99.8);
  const [editNotes, setEditNotes] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [replyText, setReplyText] = useState("");
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<"controls" | "chat" | "telemetry">("controls");

  // Load live tickets from Supabase on mount
  useEffect(() => {
    async function loadLiveTickets() {
      try {
        const liveTickets = await fetchTicketsFromSupabase();
        if (liveTickets && liveTickets.length > 0) {
          const mappedCases: CaseItem[] = liveTickets.map((t) => {
            const mediaType = t.mediaType || "HDD";
            const progress = t.clonedPercent ? Number(t.clonedPercent) : 0;
            const priority: "CRITICAL" | "HIGH" | "STANDARD" =
              t.priority === "CRITICAL" ? "CRITICAL" : t.priority === "HIGH" ? "HIGH" : "STANDARD";

            return {
              id: t.id,
              client: t.companyName || t.customerName || "Enterprise Client",
              device: t.deviceOrSubject,
              serial: t.serialNumber || "N/A",
              mediaType: mediaType as any,
              category: t.category,
              status: t.status,
              progress: progress,
              priority: priority,
              notes: t.techNotes || "",
              bench: t.assignedBench || "PC-3000 Bench 01 (Cleanroom Hood A)",
              headsHealth: "Hardware Calibrated",
              badSectorsRemapped: 0,
              temp: "28.4°C (Normal)",
              leadTech: t.assignedTech,
            };
          });

          setCases(mappedCases);
          if (mappedCases.length > 0) {
            setSelectedCaseId(mappedCases[0].id);
            setEditStatus(mappedCases[0].status);
            setEditProgress(mappedCases[0].progress);
            setEditNotes(mappedCases[0].notes);
          }
        }
      } catch (err) {
        console.warn("Failed to load technician cases from Supabase:", err);
      }
    }

    loadLiveTickets();
  }, []);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  useEffect(() => {
    if (activeCase) {
      setEditStatus(activeCase.status);
      setEditProgress(activeCase.progress);
      setEditNotes(activeCase.notes);

      async function loadChat() {
        try {
          const liveMsgs = await fetchMessagesFromSupabase(activeCase.id);
          if (liveMsgs && liveMsgs.length > 0) {
            setChatMessages((prev) => ({
              ...prev,
              [activeCase.id]: liveMsgs.map((m: any) => ({
                sender: m.sender,
                author: m.author,
                time: m.created_at
                  ? new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Today",
                text: m.text,
              })),
            }));
          }
        } catch (e) {
          console.warn("Could not load case chat:", e);
        }
      }
      loadChat();
    }
  }, [selectedCaseId]);

  const handleSelectCase = (c: CaseItem) => {
    setSelectedCaseId(c.id);
    setEditStatus(c.status);
    setEditProgress(c.progress);
    setEditNotes(c.notes);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newStatus = editStatus || activeCase.status;
    const newProgress = editProgress !== undefined ? editProgress : activeCase.progress;
    const newNotes = editNotes !== undefined ? editNotes : activeCase.notes;

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCaseId
          ? {
              ...c,
              status: newStatus,
              progress: newProgress,
              notes: newNotes,
            }
          : c
      )
    );
    setNotification(`Case #${selectedCaseId} saved! Telemetry synced to Customer Portal.`);

    await updateTicketInSupabase(selectedCaseId, {
      status: newStatus,
      clonedPercent: newProgress,
      techNotes: newNotes,
    });

    const broadcastAuthor =
      activeCase?.leadTech && activeCase.leadTech !== "Unassigned"
        ? activeCase.leadTech
        : "Lead Specialist (K. Vignesh)";

    try {
      await sendMessageToSupabase(
        selectedCaseId,
        "Technician",
        broadcastAuthor,
        `Specialist Telemetry Update: Stage updated to "${newStatus}" • Progress at ${newProgress}%. ${
          newNotes ? ` Notes: ${newNotes}` : ""
        }`
      );
    } catch (msgErr) {
      console.warn("Broadcast warning:", msgErr);
    }

    setTimeout(() => setNotification(""), 4500);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const messageText = replyText.trim();
    const currentAuthor =
      activeCase?.leadTech && activeCase.leadTech !== "Unassigned"
        ? activeCase.leadTech
        : "K. Vignesh (Cleanroom Lead)";

    const newMsg: ChatMessage = {
      sender: "Technician",
      author: currentAuthor,
      time: "Just now",
      text: messageText,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedCaseId]: [...(prev[selectedCaseId] || []), newMsg],
    }));

    setReplyText("");
    setNotification(`Update sent to ${activeCase.client} and synced to ticket log.`);

    await sendMessageToSupabase(selectedCaseId, "Technician", currentAuthor, messageText);
    setTimeout(() => setNotification(""), 4500);
  };

  const currentMessages = chatMessages[selectedCaseId] || [
    {
      sender: "Customer",
      author: activeCase.client,
      time: "Today",
      text: "Awaiting cleanroom intake analysis report.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b1324] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      <TechnicianNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* TOAST NOTIFICATION */}
        {notification && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/70 p-4 text-xs font-semibold text-emerald-300 flex items-center justify-between shadow-lg">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* TOP BENCH TELEMETRY STRIP */}
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Assigned Queue</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{cases.length} Cases</span>
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                P1 Critical
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cleanroom Pressure</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">0.05 in. w.g.</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ISO Class-5
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">PC-3000 Stations</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-400">3 Active</span>
              <span className="text-xs font-mono text-slate-400">1 Standby</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Verified Recovery</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">99.98%</span>
              <span className="text-xs font-mono text-slate-400">30-Day Rate</span>
            </div>
          </div>
        </div>

        {/* DUAL PANE WORKBENCH */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: INCIDENT QUEUE & ASSIGNMENTS (5 COLS) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-white tracking-tight">Incident Queue &amp; Assignments</h2>
              <span className="text-xs text-slate-400 font-mono">Select case to load</span>
            </div>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {cases.map((c) => {
                const isSelected = c.id === activeCase.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-blue-500 bg-[#131d35] shadow-md ring-1 ring-blue-500/50"
                        : "border-slate-800 bg-[#0f172a] hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">#{c.id}</span>
                        <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                          {c.mediaType}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                          c.priority === "CRITICAL"
                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                            : c.priority === "HIGH"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {c.priority === "CRITICAL" ? "P1 - CRITICAL" : c.priority === "HIGH" ? "P2 - URGENT" : "P3 - STANDARD"}
                      </span>
                    </div>

                    <h3 className="mt-2 text-xs font-bold text-white truncate">{c.device}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{c.client}</p>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate max-w-[200px]">{c.status}</span>
                      <span className="font-mono font-bold text-emerald-400">{c.progress}%</span>
                    </div>

                    {/* MINI PROGRESS BAR */}
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: DIAGNOSTIC COMMAND CENTER (7 COLS) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl">
              {/* TARGET HEADER */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5 mb-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-mono text-blue-400 mb-1.5">
                    <span>Diagnostic Command Center #{activeCase.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{activeCase.device}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Client: <strong className="text-slate-200">{activeCase.client}</strong> • S/N: <code className="text-slate-300">{activeCase.serial}</code>
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Workbench Allocation</span>
                  <span className="text-xs font-semibold text-blue-300 font-mono">{activeCase.bench}</span>
                </div>
              </div>

              {/* WORKFLOW STEPPER */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center">
                  <span className="text-xs font-bold text-emerald-300 block">[Cleanroom Intake]</span>
                  <span className="text-[10px] font-mono text-emerald-400">Completed</span>
                </div>
                <div className="p-2.5 rounded-xl border border-blue-500/40 bg-blue-500/15 text-center ring-1 ring-blue-400/30">
                  <span className="text-xs font-bold text-blue-300 block">[PC-3000 Raw Mirror]</span>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">Active Protocol</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-center opacity-70">
                  <span className="text-xs font-bold text-slate-400 block">[Integrity Verification]</span>
                  <span className="text-[10px] font-mono text-slate-500">Pending</span>
                </div>
              </div>

              {/* TABS */}
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 mb-5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveWorkbenchTab("controls")}
                  className={`rounded-lg py-2 font-semibold transition ${
                    activeWorkbenchTab === "controls"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Extraction &amp; Stage
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkbenchTab("chat")}
                  className={`rounded-lg py-2 font-semibold transition ${
                    activeWorkbenchTab === "chat"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Live Customer Stream
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkbenchTab("telemetry")}
                  className={`rounded-lg py-2 font-semibold transition ${
                    activeWorkbenchTab === "telemetry"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Hardware Telemetry
                </button>
              </div>

              {/* TAB 1: EXTRACTION & STAGE */}
              {activeWorkbenchTab === "controls" && (
                <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Workflow Phase / Recovery Protocol:
                    </label>
                    <select
                      value={editStatus || activeCase.status}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-blue-500"
                    >
                      <option value="Initial Hardware Intake & Diode Diagnostic">1. Initial Intake &amp; Diode Diagnostics</option>
                      <option value="Cleanroom Diagnosis">2. Cleanroom Diagnosis (ISO Class-5)</option>
                      <option value="PC-3000 Raw Platter Mirrored Extraction">3. PC-3000 Raw Platter Mirrored Extraction</option>
                      <option value="Firmware Virtual Translator Rebuild">4. Firmware Virtual Translator Rebuild</option>
                      <option value="File System Verification & File Tree Extracted">5. File System Verification &amp; File Tree Extracted</option>
                      <option value="Threat Containment & Analysis">Threat Containment &amp; Analysis (Cyber)</option>
                      <option value="Security Forensics">Security Forensics (Cyber)</option>
                      <option value="Architecture & Deployment">Architecture &amp; Deployment (Cloud)</option>
                      <option value="Resolution & Rollout">Resolution &amp; Rollout (Managed IT)</option>
                      <option value="Resolved">6. Completed / Resolved</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-slate-300">
                        Precision Extraction Progress (% Complete):
                      </label>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {editProgress !== undefined && editProgress !== 0 ? editProgress : activeCase.progress}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editProgress !== undefined && editProgress !== 0 ? editProgress : activeCase.progress}
                      onChange={(e) => setEditProgress(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-800 accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Internal Diagnostic Directives &amp; Findings:
                    </label>
                    <textarea
                      rows={3}
                      value={editNotes || activeCase.notes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Donor head calibration, bad sector offsets, PCB repair notes..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 outline-none font-mono text-xs focus:border-blue-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      * Saved directly to Supabase and visible on the client's dashboard milestone timeline.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>Live sync with Client Portal active</span>
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition"
                    >
                      Broadcast Telemetry to Portal →
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: LIVE CUSTOMER STREAM */}
              {activeWorkbenchTab === "chat" && (
                <div className="space-y-4 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 max-h-72 overflow-y-auto space-y-3">
                    {currentMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl max-w-[85%] ${
                          msg.sender === "Technician"
                            ? "ml-auto bg-blue-600/20 border border-blue-500/30 text-white"
                            : "bg-slate-900 border border-slate-800 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 text-[10px]">
                          <span className="font-bold text-blue-300">{msg.author}</span>
                          <span className="text-slate-500">{msg.time}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* REPLY INPUT */}
                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type official lab message to client..."
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500 text-xs"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 transition text-xs shadow-sm"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: TELEMETRY METRICS */}
              {activeWorkbenchTab === "telemetry" && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bench Allocation</span>
                      <span className="text-xs font-bold text-blue-300 mt-1 block">Cleanroom Bench 01</span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Drive Temperature</span>
                      <span className="text-xs font-bold text-emerald-400 mt-1 block">28.4°C (Normal)</span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Platter Integrity Health</span>
                      <span className="text-xs font-bold text-emerald-400 mt-1 block">99% Operational</span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Write-Block Protection</span>
                      <span className="text-xs font-bold text-emerald-400 mt-1 block">Hardware 256-Bit Active</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Full Incident Specs</span>
                      <span className="text-slate-400 text-[11px]">Serial: {activeCase.serial} • Station: {activeCase.bench}</span>
                    </div>
                    <Link
                      href={`/technician/tickets/${activeCase.id}`}
                      className="text-xs font-bold text-blue-400 hover:underline"
                    >
                      Open Case View →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
