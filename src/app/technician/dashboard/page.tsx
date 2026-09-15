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

interface TimelineStage {
  title: string;
  description: string;
  state: "done" | "active" | "pending";
}

interface CategoryConfig {
  category: string;
  badgeColor: string;
  tabTitle: string;
  protocolLabel: string;
  progressLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  telemetryTabTitle: string;
  telemetryCards: { label: string; value: string; color?: string }[];
  stages: { value: string; label: string }[];
  stepper: TimelineStage[];
}

function getCategoryConfig(
  category?: string,
  status: string = "",
  progress: number = 0,
  currentBench?: string
): CategoryConfig {
  const norm = (status || "").toLowerCase();
  const cat = category || "Data Recovery";

  const isResolved =
    norm.includes("resolved") ||
    norm.includes("completed") ||
    norm.includes("closed");

  if (cat === "Cybersecurity") {
    const isStage4 = isResolved || norm.includes("hardening") || norm.includes("closure");
    const isStage3 = isStage4 || norm.includes("containment") || norm.includes("remediation") || norm.includes("patch");
    const isStage2 = isStage3 || norm.includes("forensic") || norm.includes("analysis") || norm.includes("threat");

    const s1State: "done" | "active" | "pending" = isResolved || isStage2 ? "done" : "active";
    const s2State: "done" | "active" | "pending" = isResolved || isStage3 ? "done" : isStage2 ? "active" : "pending";
    const s3State: "done" | "active" | "pending" = isResolved || isStage4 ? "done" : isStage3 ? "active" : "pending";
    const s4State: "done" | "active" | "pending" = isResolved ? "done" : isStage4 ? "active" : "pending";

    const stepper: TimelineStage[] = [
      { title: "Threat Intake", description: "Perimeter Isolation", state: s1State },
      { title: "Security Forensics", description: "Vector & Log Audit", state: s2State },
      { title: "Containment & Remediation", description: `${progress}% Mitigated`, state: s3State },
      { title: "Policy Hardening", description: isResolved ? "Breach Closed" : "Final Sign-off", state: s4State },
    ];

    return {
      category: "Cybersecurity",
      badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      tabTitle: "Remediation & Stage",
      protocolLabel: "Workflow Phase / Security Remediation Protocol",
      progressLabel: "Threat Remediation & Containment Progress (% Remediated):",
      notesLabel: "Forensic Threat Analysis & Containment Directives:",
      notesPlaceholder: "Vector isolation, memory dumps, IOC indicators, firewall rules updated, audit logs...",
      telemetryTabTitle: "Security Telemetry",
      telemetryCards: [
        { label: "SOC Incident Pod", value: currentBench || "SOC Threat Pod 01", color: "text-rose-400" },
        { label: "Containment Status", value: isResolved ? "100% Neutralized" : "Quarantined", color: "text-emerald-400" },
        { label: "Perimeter Firewall", value: "Zero-Trust Active", color: "text-blue-400" },
        { label: "Threat Level", value: "P1 Active Breach Mitigation", color: "text-amber-400" },
      ],
      stages: [
        { value: "Threat Intake & Triage", label: "1. Threat Intake & Perimeter Quarantine" },
        { value: "Security Forensics", label: "2. Security Forensics & Memory Analysis" },
        { value: "Containment & Remediation", label: "3. Containment & Vector Neutralization" },
        { value: "Policy Hardening", label: "4. Policy Hardening & Compliance Audit" },
        { value: "Resolved", label: "5. Threat Fully Mitigated (Resolved)" },
      ],
      stepper,
    };
  }

  if (cat === "Cloud Solutions") {
    const isStage4 = isResolved || norm.includes("handover") || norm.includes("audit");
    const isStage3 = isStage4 || norm.includes("deployment") || norm.includes("migration");
    const isStage2 = isStage3 || norm.includes("architecture") || norm.includes("planning") || norm.includes("security");

    const s1State: "done" | "active" | "pending" = isResolved || isStage2 ? "done" : "active";
    const s2State: "done" | "active" | "pending" = isResolved || isStage3 ? "done" : isStage2 ? "active" : "pending";
    const s3State: "done" | "active" | "pending" = isResolved || isStage4 ? "done" : isStage3 ? "active" : "pending";
    const s4State: "done" | "active" | "pending" = isResolved ? "done" : isStage4 ? "active" : "pending";

    const stepper: TimelineStage[] = [
      { title: "Scope Intake", description: "Tenant Specifications", state: s1State },
      { title: "Cloud Architecture", description: "IAM & VPC Planning", state: s2State },
      { title: "Deployment & Migration", description: `${progress}% Deployed`, state: s3State },
      { title: "Handover & Audit", description: isResolved ? "Services Active" : "Uptime Verification", state: s4State },
    ];

    return {
      category: "Cloud Solutions",
      badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      tabTitle: "Migration & Stage",
      protocolLabel: "Workflow Phase / Cloud Architecture Protocol",
      progressLabel: "Cloud Architecture & Migration Progress (% Deployed):",
      notesLabel: "Architecture Deployment & Migration Directives:",
      notesPlaceholder: "Tenant provisioned, IAM policies mapped, VPC peering, migration sync progress...",
      telemetryTabTitle: "Cloud Telemetry",
      telemetryCards: [
        { label: "Cloud Terminal", value: currentBench || "Cloud Terminal 01", color: "text-sky-400" },
        { label: "Tenant Health", value: "Multi-Region Redundant", color: "text-emerald-400" },
        { label: "IAM Policy Audit", value: "CIS Benchmark Level 2", color: "text-blue-400" },
        { label: "Uptime SLA Target", value: "99.99% Operational", color: "text-emerald-400" },
      ],
      stages: [
        { value: "Scope Intake & Discovery", label: "1. Scope Intake & Tenant Discovery" },
        { value: "Cloud Architecture", label: "2. Cloud Architecture & Network Planning" },
        { value: "Deployment & Migration", label: "3. Deployment & Cloud Asset Migration" },
        { value: "Handover & Audit", label: "4. Uptime Verification & Client Handover" },
        { value: "Resolved", label: "5. Cloud Deployment Active (Resolved)" },
      ],
      stepper,
    };
  }

  if (cat === "Managed IT") {
    const isStage4 = isResolved || norm.includes("quality") || norm.includes("verification") || norm.includes("handover");
    const isStage3 = isStage4 || norm.includes("rollout") || norm.includes("deploy") || norm.includes("patch") || norm.includes("repair");
    const isStage2 = isStage3 || norm.includes("assessment") || norm.includes("diagnos");

    const s1State: "done" | "active" | "pending" = isResolved || isStage2 ? "done" : "active";
    const s2State: "done" | "active" | "pending" = isResolved || isStage3 ? "done" : isStage2 ? "active" : "pending";
    const s3State: "done" | "active" | "pending" = isResolved || isStage4 ? "done" : isStage3 ? "active" : "pending";
    const s4State: "done" | "active" | "pending" = isResolved ? "done" : isStage4 ? "active" : "pending";

    const stepper: TimelineStage[] = [
      { title: "Service Intake", description: "Incident Triage", state: s1State },
      { title: "Technical Assessment", description: "Bench Diagnostics", state: s2State },
      { title: "Resolution & Rollout", description: `${progress}% Resolved`, state: s3State },
      { title: "Quality Verification", description: isResolved ? "Client Sign-off" : "Validation Pending", state: s4State },
    ];

    return {
      category: "Managed IT",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      tabTitle: "Execution & Stage",
      protocolLabel: "Workflow Phase / Managed IT Service Protocol",
      progressLabel: "Technical Resolution & Rollout Progress (% Resolved):",
      notesLabel: "Technical Assessment & Workstation Directives:",
      notesPlaceholder: "Hardware/OS diagnosis, patch deployment, driver repairs, client verification steps...",
      telemetryTabTitle: "System Telemetry",
      telemetryCards: [
        { label: "Fleet Support Bench", value: currentBench || "Fleet Support Bench 01", color: "text-amber-400" },
        { label: "OS Diagnostics", value: "Kernel / Hardware Pass", color: "text-emerald-400" },
        { label: "Driver & Firmware", value: "Up to Date", color: "text-blue-400" },
        { label: "SLA Response", value: "< 15-Min Guaranteed", color: "text-emerald-400" },
      ],
      stages: [
        { value: "Service Intake & Triage", label: "1. Service Intake & Ticket Triage" },
        { value: "Technical Assessment", label: "2. Technical Assessment & Bench Diagnostics" },
        { value: "Resolution & Rollout", label: "3. System Resolution, Patching & Rollout" },
        { value: "Quality Verification", label: "4. Quality Verification & Client Handover" },
        { value: "Resolved", label: "5. Ticket Resolved & System Operational" },
      ],
      stepper,
    };
  }

  // Data Recovery (Default)
  const isStage4 = isResolved || norm.includes("tree") || norm.includes("return") || norm.includes("file system");
  const isStage3 = isStage4 || norm.includes("pc-3000") || norm.includes("mirror") || norm.includes("translator") || norm.includes("imaging") || norm.includes("clon");
  const isStage2 = isStage3 || norm.includes("cleanroom") || norm.includes("diagnos");

  const s1State: "done" | "active" | "pending" = isResolved || isStage2 ? "done" : "active";
  const s2State: "done" | "active" | "pending" = isResolved || isStage3 ? "done" : isStage2 ? "active" : "pending";
  const s3State: "done" | "active" | "pending" = isResolved || isStage4 ? "done" : isStage3 ? "active" : "pending";
  const s4State: "done" | "active" | "pending" = isResolved ? "done" : isStage4 ? "active" : "pending";

  const stepper: TimelineStage[] = [
    { title: "Media Received", description: "Cleanroom Barcode Intake", state: s1State },
    { title: "Cleanroom Diagnostics", description: "ISO Class-5 Inspection", state: s2State },
    { title: "PC-3000 Raw Extraction", description: progress > 0 ? `${progress}% Cloned` : "Platter Mirror Queued", state: s3State },
    { title: "Integrity Verification", description: isResolved ? "Data Recovered" : "File Tree Audit", state: s4State },
  ];

  return {
    category: "Data Recovery",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    tabTitle: "Extraction & Stage",
    protocolLabel: "Workflow Phase / Hardware Recovery Protocol",
    progressLabel: "Precision Extraction Progress (% Complete):",
    notesLabel: "Internal Cleanroom Directives & Donor Head Findings:",
    notesPlaceholder: "Donor head calibration, bad sector offsets, PCB repair notes, sector map status...",
    telemetryTabTitle: "Hardware Telemetry",
    telemetryCards: [
      { label: "Cleanroom Station", value: currentBench || "Cleanroom Bench 01", color: "text-blue-400" },
      { label: "Drive Temperature", value: "28.4°C (Normal)", color: "text-emerald-400" },
      { label: "Platter Integrity", value: "99% Operational", color: "text-emerald-400" },
      { label: "Write-Block Protection", value: "Hardware 256-Bit Active", color: "text-emerald-400" },
    ],
    stages: [
      { value: "Media Received", label: "1. Media Received (Cleanroom Intake)" },
      { value: "Cleanroom Diagnosis", label: "2. Cleanroom Diagnosis (ISO Class-5)" },
      { value: "PC-3000 Raw Platter Mirrored Extraction", label: "3. PC-3000 Raw Platter Mirrored Extraction" },
      { value: "Firmware Virtual Translator Rebuild", label: "4. Firmware Virtual Translator Rebuild" },
      { value: "File System Verification & File Tree Extracted", label: "5. File System Verification & File Tree Extracted" },
      { value: "Resolved", label: "6. Completed & Recovered (Resolved)" },
    ],
    stepper,
  };
}

export default function TechnicianWorkbenchPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [notification, setNotification] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [replyText, setReplyText] = useState("");
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<"controls" | "chat" | "telemetry">("controls");

  // Load live tickets from Supabase & poll for real-time changes
  useEffect(() => {
    async function loadLiveTickets() {
      try {
        const liveTickets = await fetchTicketsFromSupabase();
        const mappedCases: CaseItem[] = (liveTickets || []).map((t) => {
          const mediaType = (t.mediaType as any) || "HDD";
          const progress = t.clonedPercent ? Number(t.clonedPercent) : 0;
          const priority: "CRITICAL" | "HIGH" | "STANDARD" =
            t.priority === "CRITICAL" ? "CRITICAL" : t.priority === "HIGH" ? "HIGH" : "STANDARD";

          return {
            id: t.id,
            client: t.companyName || t.customerName || "Enterprise Client",
            device: t.deviceOrSubject,
            serial: t.serialNumber || "N/A",
            mediaType: mediaType,
            category: t.category,
            status: t.status,
            progress: progress,
            priority: priority,
            notes: t.techNotes || "",
            bench:
              t.assignedBench ||
              (t.category === "Cybersecurity"
                ? "SOC Threat Isolation Station 01"
                : t.category === "Cloud Solutions"
                ? "Cloud Infrastructure Terminal 01"
                : t.category === "Managed IT"
                ? "Enterprise Fleet Support Bench 01"
                : "PC-3000 Bench 01 (Cleanroom Hood A)"),
            headsHealth: "Hardware Calibrated",
            badSectorsRemapped: 0,
            temp: "28.4°C (Normal)",
            leadTech: t.assignedTech,
          };
        });

        setCases(mappedCases);
        if (mappedCases.length > 0) {
          setSelectedCaseId((prev) => {
            const exists = mappedCases.find((c) => c.id === prev);
            return exists ? prev : mappedCases[0].id;
          });
        } else {
          setSelectedCaseId("");
        }
      } catch (err) {
        console.warn("Failed to load technician cases from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveTickets();
    const interval = setInterval(loadLiveTickets, 4000);

    const handleUpdate = () => loadLiveTickets();
    window.addEventListener("tickets-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("tickets-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
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
    if (!activeCase) return;

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
    if (!replyText.trim() || !activeCase) return;

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

  const currentMessages = activeCase
    ? chatMessages[selectedCaseId] || [
        {
          sender: "Customer",
          author: activeCase.client,
          time: "Today",
          text:
            activeCase.category === "Cybersecurity"
              ? "Awaiting forensic threat analysis report."
              : activeCase.category === "Cloud Solutions"
              ? "Awaiting cloud tenant architecture review."
              : activeCase.category === "Managed IT"
              ? "Awaiting system diagnostic report."
              : "Awaiting cleanroom intake analysis report.",
        },
      ]
    : [];

  const currentConfig = activeCase
    ? getCategoryConfig(
        activeCase.category,
        editStatus || activeCase.status,
        editProgress !== undefined ? editProgress : activeCase.progress,
        activeCase.bench
      )
    : null;

  const availableStages = currentConfig ? [...currentConfig.stages] : [];
  if (activeCase && currentConfig) {
    const currentVal = editStatus || activeCase.status;
    if (currentVal && !availableStages.some((s) => s.value === currentVal)) {
      availableStages.unshift({
        value: currentVal,
        label: `Current: ${currentVal}`,
      });
    }
  }

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
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                cases.length > 0
                  ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                  : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              }`}>
                {cases.length > 0 ? "P1 Critical" : "Operational"}
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

        {/* WORKBENCH CONTENT */}
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-16 text-center shadow-sm">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-3" />
            <p className="text-xs text-slate-400 font-mono">Synchronizing Technical Workbench with Supabase...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-16 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-xl mb-4 text-blue-400">
              🔬
            </div>
            <h3 className="text-base font-bold text-white mb-2">No Active Cases on Technical Workbench</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              Workbench is clean and synchronized with Super Admin. Deleted tickets have been permanently purged. When clients or admins raise new tickets, they will stream here live.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Supabase Sync Active (Live Polling)</span>
            </div>
          </div>
        ) : activeCase ? (
          /* DUAL PANE WORKBENCH */
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-400">#{c.id}</span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                            c.category === "Cybersecurity"
                              ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                              : c.category === "Cloud Solutions"
                              ? "bg-sky-500/10 text-sky-300 border-sky-500/20"
                              : c.category === "Managed IT"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          }`}
                        >
                          {c.category || "Data Recovery"}
                        </span>
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
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-mono text-blue-400">
                      Diagnostic Command Center #{activeCase.id}
                    </span>
                    {currentConfig && (
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold ${currentConfig.badgeColor}`}
                      >
                        {activeCase.category || "Data Recovery"}
                      </span>
                    )}
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

              {/* DYNAMIC CATEGORY WORKFLOW STEPPER */}
              {currentConfig && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  {currentConfig.stepper.map((step, idx) => {
                    const isDone = step.state === "done";
                    const isActive = step.state === "active";
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          isDone
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : isActive
                            ? "border-blue-500/40 bg-blue-500/15 ring-1 ring-blue-400/30 shadow-sm"
                            : "border-slate-800 bg-slate-950/50 opacity-60"
                        }`}
                      >
                        <span
                          className={`text-xs font-bold block truncate ${
                            isDone
                              ? "text-emerald-300"
                              : isActive
                              ? "text-blue-300"
                              : "text-slate-400"
                          }`}
                        >
                          [{step.title}]
                        </span>
                        <span
                          className={`text-[10px] font-mono block mt-0.5 ${
                            isDone
                              ? "text-emerald-400"
                              : isActive
                              ? "text-blue-400 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          {isDone
                            ? "Completed"
                            : isActive
                            ? (editProgress !== undefined ? editProgress : activeCase.progress) > 0
                              ? `${editProgress !== undefined ? editProgress : activeCase.progress}% Active`
                              : "Active"
                            : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

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
                  {currentConfig ? currentConfig.tabTitle : "Execution & Stage"}
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
                  {currentConfig ? currentConfig.telemetryTabTitle : "Telemetry"}
                </button>
              </div>

              {/* TAB 1: PROTOCOL CONTROLS & STAGE */}
              {activeWorkbenchTab === "controls" && currentConfig && (
                <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      {currentConfig.protocolLabel}:
                    </label>
                    <select
                      value={editStatus || activeCase.status}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-blue-500 font-medium"
                    >
                      {availableStages.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-slate-300">
                        {currentConfig.progressLabel}
                      </label>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {editProgress !== undefined ? editProgress : activeCase.progress}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editProgress !== undefined ? editProgress : activeCase.progress}
                      onChange={(e) => setEditProgress(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-800 accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      {currentConfig.notesLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={editNotes !== undefined ? editNotes : activeCase.notes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder={currentConfig.notesPlaceholder}
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
              {activeWorkbenchTab === "telemetry" && currentConfig && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    {currentConfig.telemetryCards.map((card, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{card.label}</span>
                        <span className={`text-xs font-bold mt-1 block ${card.color || "text-emerald-400"}`}>
                          {card.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Full Incident Specs</span>
                      <span className="text-slate-400 text-[11px]">
                        Target: {activeCase.device} • Category: {activeCase.category || "Data Recovery"} • Station: {activeCase.bench}
                      </span>
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
        ) : null}
      </div>

      <Footer />
    </main>
  );
}
