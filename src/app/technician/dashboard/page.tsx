"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchTicketsFromSupabase,
  updateTicketInSupabase,
  sendMessageToSupabase,
  fetchMessagesFromSupabase,
} from "@/lib/portalData";

export interface CaseItem {
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
  updatedAt?: string;
  createdAt?: string;
}

export interface ChatMessage {
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

export interface InternalNote {
  id: string;
  author: string;
  time: string;
  text: string;
}

export interface TimelineStage {
  title: string;
  description: string;
  state: "done" | "active" | "pending";
}

export interface CategoryConfig {
  category: string;
  badgeColor: string;
  workbenchIcon: string;
  workbenchModeTitle: string;
  workbenchModeDesc: string;
  tabTitle: string;
  protocolLabel: string;
  progressLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  telemetryTabTitle: string;
  telemetryCards: { label: string; value: string; color?: string }[];
  stages: { value: string; label: string }[];
  stepper: TimelineStage[];
  benchOptions: string[];
}

export interface TopTelemetryCard {
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
}

export function getCategoryConfig(
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
      badgeColor: "bg-rose-50 text-rose-700 border border-rose-200",
      workbenchIcon: "🛡️",
      workbenchModeTitle: "SOC Threat Defense & Cyber Pod",
      workbenchModeDesc: "Incident isolation, memory forensics, zero-trust network quarantine & vector remediation.",
      tabTitle: "Remediation & Stage",
      protocolLabel: "Workflow Phase / Security Remediation Protocol",
      progressLabel: "Threat Remediation & Containment Progress (% Remediated):",
      notesLabel: "Forensic Threat Analysis & Containment Directives:",
      notesPlaceholder: "Vector isolation, memory dumps, IOC indicators, firewall rules updated, audit logs...",
      telemetryTabTitle: "Security Telemetry",
      telemetryCards: [
        { label: "SOC Incident Pod", value: currentBench || "SOC Threat Pod 01", color: "text-rose-600" },
        { label: "Containment Status", value: isResolved ? "100% Neutralized" : "Quarantined", color: "text-emerald-600" },
        { label: "Perimeter Firewall", value: "Zero-Trust Active", color: "text-blue-600" },
        { label: "Threat Level", value: "P1 Active Breach Mitigation", color: "text-amber-600" },
      ],
      stages: [
        { value: "Threat Intake & Triage", label: "1. Threat Intake & Perimeter Quarantine" },
        { value: "Security Forensics", label: "2. Security Forensics & Memory Analysis" },
        { value: "Containment & Remediation", label: "3. Containment & Vector Neutralization" },
        { value: "Policy Hardening", label: "4. Policy Hardening & Compliance Audit" },
        { value: "Resolved", label: "5. Threat Fully Mitigated (Resolved)" },
      ],
      stepper,
      benchOptions: [
        "SOC Threat Isolation Station 01",
        "Forensic Hex Packet Capture Bench",
        "Zero-Trust Boundary Quarantine Pod",
        "Threat Memory & Malware Sandbox 02",
      ],
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
      badgeColor: "bg-sky-50 text-sky-700 border border-sky-200",
      workbenchIcon: "☁️",
      workbenchModeTitle: "Cloud DevOps & Infrastructure Terminal",
      workbenchModeDesc: "Multi-region tenant provisioning, IAM security policies, VPC peering & workload migration.",
      tabTitle: "Migration & Stage",
      protocolLabel: "Workflow Phase / Cloud Architecture Protocol",
      progressLabel: "Cloud Architecture & Migration Progress (% Deployed):",
      notesLabel: "Architecture Deployment & Migration Directives:",
      notesPlaceholder: "Tenant provisioned, IAM policies mapped, VPC peering, migration sync progress...",
      telemetryTabTitle: "Cloud Telemetry",
      telemetryCards: [
        { label: "Cloud Terminal", value: currentBench || "Cloud Terminal 01", color: "text-sky-600" },
        { label: "Tenant Health", value: "Multi-Region Redundant", color: "text-emerald-600" },
        { label: "IAM Policy Audit", value: "CIS Benchmark Level 2", color: "text-blue-600" },
        { label: "Uptime SLA Target", value: "99.99% Operational", color: "text-emerald-600" },
      ],
      stages: [
        { value: "Scope Intake & Discovery", label: "1. Scope Intake & Tenant Discovery" },
        { value: "Cloud Architecture", label: "2. Cloud Architecture & Network Planning" },
        { value: "Deployment & Migration", label: "3. Deployment & Cloud Asset Migration" },
        { value: "Handover & Audit", label: "4. Uptime Verification & Client Handover" },
        { value: "Resolved", label: "5. Cloud Deployment Active (Resolved)" },
      ],
      stepper,
      benchOptions: [
        "Cloud Infrastructure Terminal 01",
        "Multi-Region Cluster Ops Bench",
        "DevOps CI/CD Deployment Terminal",
        "VPC Security & Routing Bench 02",
      ],
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
      badgeColor: "bg-amber-50 text-amber-700 border border-amber-200",
      workbenchIcon: "💻",
      workbenchModeTitle: "Enterprise IT & Fleet Systems Workbench",
      workbenchModeDesc: "Hardware triage, OS kernel repair, Active Directory provisioning, OEM firmware & SLA field rollout.",
      tabTitle: "Execution & Stage",
      protocolLabel: "Workflow Phase / Managed IT Service Protocol",
      progressLabel: "Technical Resolution & Rollout Progress (% Resolved):",
      notesLabel: "Technical Assessment & Workstation Directives:",
      notesPlaceholder: "Hardware/OS diagnosis, patch deployment, driver repairs, client verification steps...",
      telemetryTabTitle: "System Telemetry",
      telemetryCards: [
        { label: "Fleet Support Bench", value: currentBench || "Fleet Support Bench 01", color: "text-amber-600" },
        { label: "OS Diagnostics", value: "Kernel / Hardware Pass", color: "text-emerald-600" },
        { label: "Driver & Firmware", value: "Up to Date", color: "text-blue-600" },
        { label: "SLA Response", value: "< 15-Min Guaranteed", color: "text-emerald-600" },
      ],
      stages: [
        { value: "Service Intake & Triage", label: "1. Service Intake & Ticket Triage" },
        { value: "Technical Assessment", label: "2. Technical Assessment & Bench Diagnostics" },
        { value: "Resolution & Rollout", label: "3. System Resolution, Patching & Rollout" },
        { value: "Quality Verification", label: "4. Quality Verification & Client Handover" },
        { value: "Resolved", label: "5. Ticket Resolved & System Operational" },
      ],
      stepper,
      benchOptions: [
        "Enterprise Fleet Support Bench 01",
        "Workstation Diagnostics & Hardware Station",
        "OEM BIOS / Firmware Reflash Bench",
        "Field Dispatch & Network Hub",
      ],
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
    badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    workbenchIcon: "🔬",
    workbenchModeTitle: "Cleanroom Data Recovery Laboratory",
    workbenchModeDesc: "ISO Class-5 laminar flow micro-examination, PC-3000 mirror imaging, head swaps & firmware reconstruction.",
    tabTitle: "Extraction & Stage",
    protocolLabel: "Workflow Phase / Hardware Recovery Protocol",
    progressLabel: "Precision Extraction Progress (% Complete):",
    notesLabel: "Internal Cleanroom Directives & Donor Head Findings:",
    notesPlaceholder: "Donor head calibration, bad sector offsets, PCB repair notes, sector map status...",
    telemetryTabTitle: "Hardware Telemetry",
    telemetryCards: [
      { label: "Cleanroom Station", value: currentBench || "Cleanroom Bench 01", color: "text-blue-600" },
      { label: "Drive Temperature", value: "28.4°C (Normal)", color: "text-emerald-600" },
      { label: "Platter Integrity", value: "99% Operational", color: "text-emerald-600" },
      { label: "Write-Block Protection", value: "Hardware 256-Bit Active", color: "text-emerald-600" },
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
    benchOptions: [
      "PC-3000 Bench 01 (Cleanroom Hood A)",
      "PC-3000 Flash & Portable III (NVMe / SSD Station)",
      "Forensic Hex Server Rack 04 (RAID Reconstruction)",
      "Soldering & Micro-inspection Station",
    ],
  };
}

export const WORKBENCH_PODS = [
  {
    id: "ALL" as const,
    label: "All Workbenches",
    shortLabel: "All Workbenches",
    icon: "🌐",
    desc: "Global incident workbenches across all technical service divisions",
    accentColor: "blue",
  },
  {
    id: "Data Recovery" as const,
    label: "Data Recovery Lab",
    shortLabel: "Data Recovery Lab",
    icon: "🔬",
    desc: "ISO Class-5 laminar flow, PC-3000 mirror extraction, donor heads",
    accentColor: "emerald",
  },
  {
    id: "Managed IT" as const,
    label: "IT Management Bench",
    shortLabel: "IT Management Bench",
    icon: "💻",
    desc: "Hardware diagnostics, kernel repairs, Active Directory & fleet rollout",
    accentColor: "amber",
  },
  {
    id: "Cybersecurity" as const,
    label: "SOC Cyber Pod",
    shortLabel: "SOC Cyber Pod",
    icon: "🛡️",
    desc: "Perimeter quarantine, memory forensics & threat remediation",
    accentColor: "rose",
  },
  {
    id: "Cloud Solutions" as const,
    label: "Cloud Terminal",
    shortLabel: "Cloud Terminal",
    icon: "☁️",
    desc: "Multi-region tenant provisioning, IAM architecture & migrations",
    accentColor: "sky",
  },
];

type PortalNavView =
  | "dashboard"
  | "my_tickets"
  | "assigned_to_me"
  | "unassigned"
  | "all_tickets"
  | "ticket_details"
  | "knowledge_base"
  | "reports"
  | "tools"
  | "profile"
  | "settings";

export default function TechnicianWorkbenchPage() {
  const router = useRouter();

  // Navigation View State
  const [activeView, setActiveView] = useState<PortalNavView>("dashboard");
  const [settingsSubTab, setSettingsSubTab] = useState<"Appearance" | "General" | "Notifications" | "Security">("Appearance");
  const [appearanceTheme, setAppearanceTheme] = useState<"light" | "navy" | "system">("light");
  const [accentColor, setAccentColor] = useState<"blue" | "emerald" | "violet" | "amber">("blue");
  const [workbenchDensity, setWorkbenchDensity] = useState<"comfortable" | "compact">("comfortable");
  const [telemetrySpeed, setTelemetrySpeed] = useState<"5s" | "10s" | "30s">("10s");
  const [highContrastBadges, setHighContrastBadges] = useState<boolean>(false);
  const [audioChimes, setAudioChimes] = useState<boolean>(true);

  const handleSaveAppearance = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tdd_tech_appearance", JSON.stringify({
          theme: appearanceTheme,
          accent: accentColor,
          density: workbenchDensity,
          speed: telemetrySpeed,
          highContrast: highContrastBadges,
          audio: audioChimes
        }));
      } catch (e) {
        console.warn(e);
      }
    }
    setNotification("Website appearance & workbench preferences saved successfully!");
    setTimeout(() => setNotification(""), 4000);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Tickets & Cases State
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedServiceBench, setSelectedServiceBench] = useState<
    "ALL" | "Data Recovery" | "Managed IT" | "Cybersecurity" | "Cloud Solutions"
  >("ALL");

  // Filtering & Table Tab States
  const [ticketStatusTab, setTicketStatusTab] = useState<"ALL" | "Open" | "Assigned" | "Waiting" | "Resolved" | "Closed">("Open");
  const [globalSearch, setGlobalSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Diagnostics & Command Center States
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<"controls" | "chat" | "telemetry">("controls");
  const [ticketDetailTab, setTicketDetailTab] = useState<"conversation" | "notes" | "attachments" | "audit">("conversation");
  const [replyMode, setReplyMode] = useState<"customer" | "internal">("customer");
  const [notification, setNotification] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [clientStatus, setClientStatus] = useState<string>("");
  const [editPriority, setEditPriority] = useState<"CRITICAL" | "HIGH" | "STANDARD">("STANDARD");
  const [editProgress, setEditProgress] = useState<number>(0);
  const [clientProgress, setClientProgress] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editBench, setEditBench] = useState<string>("");
  const [clientUpdateText, setClientUpdateText] = useState<string>("");
  const [notifyClientWithTelemetry, setNotifyClientWithTelemetry] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isSendingClientUpdate, setIsSendingClientUpdate] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [replyText, setReplyText] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [dashboardDrawerTab, setDashboardDrawerTab] = useState<"internal" | "client">("internal");

  const [attachments, setAttachments] = useState<Record<string, TicketAttachment[]>>({});
  const [internalNotes, setInternalNotes] = useState<Record<string, InternalNote[]>>({});
  const [newInternalNoteText, setNewInternalNoteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCaseIdRef = useRef<string>("");
  const lastManualUpdateRef = useRef<number>(0);
  const prevActiveCaseIdRef = useRef<string>("");

  useEffect(() => {
    selectedCaseIdRef.current = selectedCaseId;
  }, [selectedCaseId]);

  // User Profile Session
  const [techUser, setTechUser] = useState({
    name: "John Doe",
    email: "john@thedatadot.com",
    role: "Technician",
    station: "PC-3000 Bench 01",
    department: "IT Support & Systems",
  });

  // Recent Activity Items
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, text: "You replied to TDD-1042", time: "2 hours ago", dotColor: "bg-blue-500" },
    { id: 2, text: "TDD-1040 assigned to you", time: "3 hours ago", dotColor: "bg-amber-500" },
    { id: 3, text: "Customer replied to TDD-1038", time: "5 hours ago", dotColor: "bg-indigo-500" },
    { id: 4, text: "TDD-1035 marked as Resolved", time: "1 day ago", dotColor: "bg-emerald-500" },
    { id: 5, text: "New ticket TDD-1045 created", time: "1 day ago", dotColor: "bg-sky-500" },
  ]);

  // Load Technician Session from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tdd_tech_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setTechUser((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            email: parsed.email || prev.email,
            role: parsed.role || prev.role,
            station: parsed.station || prev.station,
            department: parsed.department || prev.department,
          }));
        }
      } catch (e) {
        console.warn("Could not parse tech user:", e);
      }
    }
  }, []);

  // Sync Cases from Supabase
  const loadSupabaseData = async () => {
    try {
      const tickets = await fetchTicketsFromSupabase();
      if (!tickets) return;

      let localOverrides: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("tdd_ticket_overrides");
          if (raw) localOverrides = JSON.parse(raw);
        } catch (e) {
          console.warn("Could not parse local ticket overrides:", e);
        }
      }

      const mapped: CaseItem[] = tickets.map((t: any) => {
        let mediaType: CaseItem["mediaType"] = "GENERAL";
        const devLower = (t.deviceOrSubject || "").toLowerCase();
        if (devLower.includes("ssd") || devLower.includes("nvme")) mediaType = "SSD";
        else if (devLower.includes("hdd") || devLower.includes("hard drive") || devLower.includes("barracuda") || devLower.includes("ironwolf")) mediaType = "HDD";
        else if (devLower.includes("raid") || devLower.includes("nas") || devLower.includes("synology")) mediaType = "RAID";
        else if (devLower.includes("flash") || devLower.includes("sd") || devLower.includes("usb")) mediaType = "FLASH";
        else if (devLower.includes("network") || devLower.includes("switch") || devLower.includes("cisco")) mediaType = "NETWORK";
        else if (devLower.includes("server") || devLower.includes("dell poweredge")) mediaType = "SERVER";

        const override =
          localOverrides[t.id] ||
          (t.id ? localOverrides[t.id.toUpperCase()] : null) ||
          (t.id ? localOverrides[t.id.toLowerCase()] : null);

        return {
          id: t.id,
          client: t.companyName || t.customerName || "ABC Construction Ltd",
          device: t.deviceOrSubject || "Email not syncing on Outlook",
          serial: t.serialNumber || `SN-${t.id}-TDD`,
          mediaType,
          category: t.category || "Managed IT",
          status: override?.status || t.status || "Open",
          progress: override?.progress !== undefined ? override.progress : (Number(t.clonedPercent) || 0),
          priority: override?.priority || (t.priority === "CRITICAL" ? "CRITICAL" : t.priority === "HIGH" ? "HIGH" : "STANDARD"),
          notes: override?.notes !== undefined ? override.notes : (t.techNotes || ""),
          bench: override?.bench || t.assignedBench || "Enterprise Fleet Support Bench 01",
          headsHealth: "100% OK",
          badSectorsRemapped: 0,
          temp: "28.4°C",
          leadTech: t.assignedTech || "Unassigned",
          updatedAt: override?.updatedAt || t.updatedAt || "2 hours ago",
          createdAt: t.createdAt || "Today",
        };
      });

      const targetId = selectedCaseIdRef.current;
      const isRecentlyUpdated = Date.now() - lastManualUpdateRef.current < 30000;

      setCases((prev) => {
        return mapped.map((m) => {
          const cur = prev.find((p) => p.id.toLowerCase() === m.id.toLowerCase());
          if (cur && targetId && cur.id.toLowerCase() === targetId.toLowerCase() && isRecentlyUpdated) {
            return {
              ...m,
              status: cur.status || m.status,
              progress: cur.progress !== undefined ? cur.progress : m.progress,
              notes: cur.notes || m.notes,
              bench: cur.bench || m.bench,
              priority: cur.priority || m.priority,
            };
          }
          return m;
        });
      });

      if (mapped.length > 0 && !selectedCaseIdRef.current) {
        const first = mapped[0];
        selectedCaseIdRef.current = first.id;
        setSelectedCaseId(first.id);
        setEditStatus(first.status);
        setClientStatus(first.status);
        setEditProgress(first.progress);
        setClientProgress(first.progress);
        setEditNotes(first.notes);
        setEditBench(first.bench);
        setEditPriority(first.priority);
      }
    } catch (err) {
      console.warn("Failed to load tickets in technician portal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupabaseData();
    const interval = setInterval(loadSupabaseData, 4000);
    const handleUpdate = () => loadSupabaseData();
    window.addEventListener("tickets-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("tickets-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter Cases by Service Workbench Pod
  const workbenchFilteredCases = useMemo(() => {
    if (selectedServiceBench === "ALL") return cases;
    return cases.filter((c) => (c.category || "Data Recovery") === selectedServiceBench);
  }, [cases, selectedServiceBench]);

  // Filter Cases based on current active view
  const viewFilteredCases = useMemo(() => {
    let result = [...workbenchFilteredCases];

    if (activeView === "my_tickets" || activeView === "assigned_to_me") {
      result = result.filter(
        (c) =>
          c.leadTech?.toLowerCase().includes(techUser.name.toLowerCase()) ||
          c.leadTech?.toLowerCase().includes("vignesh") ||
          c.leadTech?.toLowerCase().includes("john") ||
          c.leadTech?.toLowerCase().includes("lead")
      );
    } else if (activeView === "unassigned") {
      result = result.filter(
        (c) => !c.leadTech || c.leadTech === "Unassigned" || c.leadTech.trim() === ""
      );
    }

    // Status Tab Filtering
    if (ticketStatusTab !== "ALL") {
      if (ticketStatusTab === "Open") {
        result = result.filter(
          (c) =>
            !c.status.toLowerCase().includes("resolved") &&
            !c.status.toLowerCase().includes("closed") &&
            !c.status.toLowerCase().includes("completed")
        );
      } else if (ticketStatusTab === "Assigned") {
        result = result.filter(
          (c) => c.leadTech && c.leadTech !== "Unassigned" && !c.status.toLowerCase().includes("resolved")
        );
      } else if (ticketStatusTab === "Waiting") {
        result = result.filter(
          (c) =>
            c.status.toLowerCase().includes("wait") ||
            c.status.toLowerCase().includes("diagnos") ||
            c.status.toLowerCase().includes("intake")
        );
      } else if (ticketStatusTab === "Resolved" || ticketStatusTab === "Closed") {
        result = result.filter(
          (c) =>
            c.status.toLowerCase().includes("resolved") ||
            c.status.toLowerCase().includes("closed") ||
            c.status.toLowerCase().includes("completed")
        );
      }
    }

    // Global Search Filter
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.client.toLowerCase().includes(q) ||
          c.device.toLowerCase().includes(q) ||
          c.serial.toLowerCase().includes(q) ||
          (c.category && c.category.toLowerCase().includes(q))
      );
    }

    // Dropdown Filters
    if (filterPriority !== "ALL") {
      result = result.filter((c) => c.priority === filterPriority);
    }
    if (filterCategory !== "ALL") {
      result = result.filter((c) => (c.category || "Data Recovery") === filterCategory);
    }

    // Sorting
    if (sortBy === "priority") {
      const pOrder: Record<string, number> = { CRITICAL: 3, HIGH: 2, STANDARD: 1 };
      result.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
    } else if (sortBy === "oldest") {
      result.reverse();
    }

    return result;
  }, [workbenchFilteredCases, activeView, ticketStatusTab, globalSearch, filterPriority, filterCategory, sortBy, techUser.name]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(viewFilteredCases.length / itemsPerPage));
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return viewFilteredCases.slice(start, start + itemsPerPage);
  }, [viewFilteredCases, currentPage]);

  // Selected Active Case for Command Center / Details
  const activeCase = useMemo(() => {
    return (
      viewFilteredCases.find((c) => c.id === selectedCaseId) ||
      workbenchFilteredCases.find((c) => c.id === selectedCaseId) ||
      cases.find((c) => c.id === selectedCaseId) ||
      viewFilteredCases[0] ||
      workbenchFilteredCases[0] ||
      cases[0]
    );
  }, [viewFilteredCases, workbenchFilteredCases, cases, selectedCaseId]);

  // Switch Bench Helper
  const handleSwitchBench = (
    bench: "ALL" | "Data Recovery" | "Managed IT" | "Cybersecurity" | "Cloud Solutions"
  ) => {
    setSelectedServiceBench(bench);
    setCurrentPage(1);
    const targetCases =
      bench === "ALL"
        ? cases
        : cases.filter((c) => (c.category || "Data Recovery") === bench);

    if (targetCases.length > 0) {
      const match = targetCases.find((c) => c.id === selectedCaseId) || targetCases[0];
      selectedCaseIdRef.current = match.id;
      setSelectedCaseId(match.id);
      setEditStatus(match.status);
      setClientStatus(match.status);
      setEditPriority(match.priority);
      setEditProgress(match.progress);
      setClientProgress(match.progress);
      setEditNotes(match.notes);
      setEditBench(match.bench);
      setClientUpdateText("");
    }
  };

  // Case Selection
  const handleSelectCase = (c: CaseItem) => {
    selectedCaseIdRef.current = c.id;
    setSelectedCaseId(c.id);
    setEditStatus(c.status);
    setClientStatus(c.status);
    setEditPriority(c.priority);
    setEditProgress(c.progress);
    setClientProgress(c.progress);
    setEditNotes(c.notes);
    setEditBench(c.bench);
    setClientUpdateText("");
  };

  // Open Full Ticket Details View
  const handleOpenDetails = (c: CaseItem) => {
    handleSelectCase(c);
    setActiveView("ticket_details");
  };

  // Load Chat Messages & Synchronize Active Case Form
  useEffect(() => {
    if (activeCase) {
      if (activeCase.id !== prevActiveCaseIdRef.current) {
        prevActiveCaseIdRef.current = activeCase.id;
        selectedCaseIdRef.current = activeCase.id;
        setSelectedCaseId(activeCase.id);
        setEditStatus(activeCase.status);
        setClientStatus(activeCase.status);
        setEditPriority(activeCase.priority);
        setEditProgress(activeCase.progress);
        setClientProgress(activeCase.progress);
        setEditNotes(activeCase.notes);
        setEditBench(activeCase.bench);
        setClientUpdateText("");
      }

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

      // Load attachments for active case
      if (typeof window !== "undefined") {
        try {
          const storedAtts = localStorage.getItem(`tdd_attachments_${activeCase.id}`);
          if (storedAtts) {
            setAttachments((prev) => ({
              ...prev,
              [activeCase.id]: JSON.parse(storedAtts),
            }));
          } else {
            const seedAtts: TicketAttachment[] = [
              {
                id: `att-${activeCase.id}-1`,
                name: `${(activeCase.category || "Service").toLowerCase().replace(/\s+/g, "_")}_diagnostic_telemetry.pdf`,
                size: "2.1 MB",
                type: "pdf",
                uploadedAt: "Today, 09:30 AM",
                uploadedBy: activeCase.leadTech && activeCase.leadTech !== "Unassigned" ? activeCase.leadTech : "Lab Diagnostics Hub",
              },
            ];
            setAttachments((prev) => ({
              ...prev,
              [activeCase.id]: seedAtts,
            }));
          }
        } catch (e) {
          console.warn("Could not load stored attachments:", e);
        }

        try {
          const storedNotes = localStorage.getItem(`tdd_internal_notes_${activeCase.id}`);
          if (storedNotes) {
            setInternalNotes((prev) => ({
              ...prev,
              [activeCase.id]: JSON.parse(storedNotes),
            }));
          } else if (activeCase.notes) {
            const seedNotes: InternalNote[] = [
              {
                id: `note-${activeCase.id}-1`,
                author: activeCase.leadTech && activeCase.leadTech !== "Unassigned" ? activeCase.leadTech : techUser.name,
                time: "Intake Station",
                text: activeCase.notes,
              },
            ];
            setInternalNotes((prev) => ({
              ...prev,
              [activeCase.id]: seedNotes,
            }));
          }
        } catch (e) {
          console.warn("Could not load stored notes:", e);
        }
      }
    }
  }, [activeCase?.id]);

  // Save Internal Workbench Status (Station, Internal Priority, Lab Notes Only)
  const handleSaveWorkbenchStatus = async (overrideStatus?: string) => {
    if (!activeCase) return;

    const targetId = selectedCaseIdRef.current || selectedCaseId || activeCase.id;
    if (!selectedCaseId && targetId) {
      selectedCaseIdRef.current = targetId;
      setSelectedCaseId(targetId);
    }

    setIsUpdatingStatus(true);
    lastManualUpdateRef.current = Date.now();

    const newPriority = editPriority || activeCase.priority;
    const newBench = editBench || activeCase.bench;
    const newNotes = editNotes !== undefined ? editNotes : activeCase.notes;
    const newStatus = overrideStatus || activeCase.status;

    setEditPriority(newPriority);
    setEditBench(newBench);
    setEditNotes(newNotes);
    if (overrideStatus) {
      setEditStatus(overrideStatus);
      setClientStatus(overrideStatus);
    }

    // Optimistically update in local state
    setCases((prev) =>
      prev.map((c) =>
        c.id.toLowerCase() === targetId.toLowerCase()
          ? {
              ...c,
              ...(overrideStatus ? { status: overrideStatus } : {}),
              priority: newPriority,
              bench: newBench,
              notes: newNotes,
              updatedAt: "Just now",
            }
          : c
      )
    );

    // Save persistent local override so background polling never reverts
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("tdd_ticket_overrides");
        const overrides = raw ? JSON.parse(raw) : {};
        const overrideData = {
          ...(overrides[targetId] || {}),
          ...(overrideStatus ? { status: overrideStatus } : {}),
          priority: newPriority,
          bench: newBench,
          notes: newNotes,
          updatedAt: "Just now",
        };
        overrides[targetId] = overrideData;
        overrides[targetId.toUpperCase()] = overrideData;
        overrides[targetId.toLowerCase()] = overrideData;
        localStorage.setItem("tdd_ticket_overrides", JSON.stringify(overrides));
        window.dispatchEvent(new Event("tickets-updated"));
      } catch (e) {
        console.warn("Could not save persistent ticket override:", e);
      }
    }

    setNotification(`Internal workbench notes & station updated for #${targetId}.`);

    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `You updated internal workbench records on #${targetId}`,
        time: "Just now",
        dotColor: "bg-blue-500",
      },
      ...prev.slice(0, 4),
    ]);

    try {
      const updatePayload: Record<string, any> = {
        priority: newPriority,
        techNotes: newNotes,
        assignedBench: newBench,
      };
      if (overrideStatus) {
        updatePayload.status = overrideStatus;
      }
      await updateTicketInSupabase(targetId, updatePayload);
    } catch (err) {
      console.warn("Error updating ticket in Supabase:", err);
    } finally {
      setIsUpdatingStatus(false);
      setTimeout(() => setNotification(""), 4500);
    }
  };

  // Backwards-compatible alias if any old caller remains
  const handleSaveUpdate = async (e?: React.FormEvent, overrideStatus?: string) => {
    if (e) e.preventDefault();
    await handleSaveWorkbenchStatus(overrideStatus);
  };

  // Dispatch Customer-Facing Update to Portal (Updates Ticket Status in DB & Broadcasts)
  const handleSendClientUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeCase) return;

    const targetId = selectedCaseIdRef.current || selectedCaseId || activeCase.id;
    setIsSendingClientUpdate(true);
    lastManualUpdateRef.current = Date.now();

    const newStatus = clientStatus || activeCase.status;
    const newProgress = clientProgress !== undefined ? clientProgress : activeCase.progress;
    const currentStation = editBench || activeCase.bench;

    const rawMsg = clientUpdateText.trim();
    let broadcastMessage = rawMsg || `Ticket lifecycle stage updated to "${newStatus}" (${newProgress}% completed).`;
    if (notifyClientWithTelemetry && !broadcastMessage.includes("[Status:")) {
      broadcastMessage += `\n\n[Status: ${newStatus} • Progress: ${newProgress}% • Station: ${currentStation}]`;
    }

    const newMsg: ChatMessage = {
      sender: "Technician",
      author: techUser.name,
      time: "Just now",
      text: broadcastMessage,
    };

    setChatMessages((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newMsg],
    }));

    // Optimistically update status, progress, priority, bench in cases
    setCases((prev) =>
      prev.map((c) =>
        c.id.toLowerCase() === targetId.toLowerCase()
          ? {
              ...c,
              status: newStatus,
              progress: newProgress,
              priority: editPriority || activeCase.priority,
              bench: currentStation,
              updatedAt: "Just now",
            }
          : c
      )
    );

    // Save persistent local override
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("tdd_ticket_overrides");
        const overrides = raw ? JSON.parse(raw) : {};
        const overrideData = {
          ...(overrides[targetId] || {}),
          status: newStatus,
          progress: newProgress,
          priority: editPriority || activeCase.priority,
          bench: currentStation,
          updatedAt: "Just now",
        };
        overrides[targetId] = overrideData;
        overrides[targetId.toUpperCase()] = overrideData;
        overrides[targetId.toLowerCase()] = overrideData;
        localStorage.setItem("tdd_ticket_overrides", JSON.stringify(overrides));
        window.dispatchEvent(new Event("tickets-updated"));
      } catch (e) {
        console.warn("Could not save persistent ticket override on client update:", e);
      }
    }

    setClientUpdateText("");
    setNotification(`✅ Client Portal updated: Case #${targetId} set to "${newStatus}" (${newProgress}%).`);

    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `You broadcast an update to customer on #${targetId} (${newStatus} - ${newProgress}%)`,
        time: "Just now",
        dotColor: "bg-emerald-500",
      },
      ...prev.slice(0, 4),
    ]);

    try {
      await Promise.all([
        updateTicketInSupabase(targetId, {
          status: newStatus,
          clonedPercent: newProgress,
          priority: editPriority || activeCase.priority,
          assignedBench: currentStation,
        }),
        sendMessageToSupabase(targetId, "Technician", techUser.name, broadcastMessage),
      ]);
    } catch (err) {
      console.warn("Failed to broadcast client update:", err);
    } finally {
      setIsSendingClientUpdate(false);
      setTimeout(() => setNotification(""), 4500);
    }
  };

  // Administrative Close Ticket
  const handleCloseTicket = async () => {
    if (!activeCase) return;
    const targetId = selectedCaseIdRef.current || selectedCaseId || activeCase.id;
    if (!window.confirm(`Are you sure you want to close Ticket #${targetId}?`)) return;
    setEditStatus("Closed");
    setClientStatus("Closed");
    await handleSaveWorkbenchStatus("Closed");
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeCase) return;

    const messageText = replyText.trim();
    setReplyText("");

    const newMsg: ChatMessage = {
      sender: "Technician",
      author: techUser.name,
      time: "Just now",
      text: messageText,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedCaseId]: [...(prev[selectedCaseId] || []), newMsg],
    }));

    setNotification("Reply sent to customer portal.");

    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `You replied to #${selectedCaseId}`,
        time: "Just now",
        dotColor: "bg-blue-500",
      },
      ...prev.slice(0, 4),
    ]);

    await sendMessageToSupabase(selectedCaseId, "Technician", techUser.name, messageText);
    setTimeout(() => setNotification(""), 4500);
  };

  // Real File Attachment Handler (Persistent & Auto-Switching)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeCase) return;

    const targetId = selectedCaseIdRef.current || selectedCaseId || activeCase.id;
    const fileList = Array.from(files);

    fileList.forEach((file, index) => {
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

      if (bytes < 4 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const newAtt: TicketAttachment = {
            id: `att-${Date.now()}-${index}`,
            name: file.name,
            size: sizeStr,
            type: fileType,
            url: dataUrl,
            uploadedAt: "Just now",
            uploadedBy: techUser.name,
          };
          setAttachments((prev) => {
            const updated = [...(prev[targetId] || []), newAtt];
            try {
              localStorage.setItem(`tdd_attachments_${targetId}`, JSON.stringify(updated));
            } catch (err) {
              console.warn("Storage warning for attachments:", err);
            }
            return { ...prev, [targetId]: updated };
          });
        };
        reader.readAsDataURL(file);
      } else {
        const objectUrl = URL.createObjectURL(file);
        const newAtt: TicketAttachment = {
          id: `att-${Date.now()}-${index}`,
          name: file.name,
          size: sizeStr,
          type: fileType,
          url: objectUrl,
          uploadedAt: "Just now",
          uploadedBy: techUser.name,
        };
        setAttachments((prev) => {
          const updated = [...(prev[targetId] || []), newAtt];
          try {
            localStorage.setItem(`tdd_attachments_${targetId}`, JSON.stringify(updated));
          } catch (err) {
            console.warn("Storage warning for attachments:", err);
          }
          return { ...prev, [targetId]: updated };
        });
      }
    });

    setNotification(`${fileList.length} file(s) attached to Case #${targetId}!`);
    setTicketDetailTab("attachments");

    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `You attached ${fileList.length} file(s) to #${targetId}`,
        time: "Just now",
        dotColor: "bg-emerald-500",
      },
      ...prev.slice(0, 4),
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setTimeout(() => setNotification(""), 4500);
  };

  const handleDeleteAttachment = (ticketId: string, attId: string) => {
    const current = attachments[ticketId] || [];
    const updated = current.filter((a) => a.id !== attId);
    setAttachments((prev) => ({
      ...prev,
      [ticketId]: updated,
    }));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`tdd_attachments_${ticketId}`, JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to update attachments storage:", err);
      }
    }

    setNotification("Attachment removed.");
    setTimeout(() => setNotification(""), 3000);
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInternalNoteText.trim() || !activeCase) return;

    const targetId = selectedCaseIdRef.current || selectedCaseId || activeCase.id;
    const newNote: InternalNote = {
      id: `note-${Date.now()}`,
      author: techUser.name,
      time: "Just now",
      text: newInternalNoteText.trim(),
    };

    const updatedNotes = [...(internalNotes[targetId] || []), newNote];
    setInternalNotes((prev) => ({
      ...prev,
      [targetId]: updatedNotes,
    }));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`tdd_internal_notes_${targetId}`, JSON.stringify(updatedNotes));
      } catch (err) {
        console.warn("Failed to store internal notes:", err);
      }
    }

    setNewInternalNoteText("");
    setNotification(`Internal note saved to #${targetId} (confidential / technician-only).`);
    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `You logged an internal note on #${targetId}`,
        time: "Just now",
        dotColor: "bg-amber-500",
      },
      ...prev.slice(0, 4),
    ]);
    setTimeout(() => setNotification(""), 4500);
  };

  // Quick 1-Click Ticket Assignment
  const handleAssignToMe = async (ticketId: string) => {
    setAssigningId(ticketId);
    try {
      await updateTicketInSupabase(ticketId, {
        assignedTech: techUser.name,
      });

      setCases((prev) =>
        prev.map((c) => (c.id === ticketId ? { ...c, leadTech: techUser.name } : c))
      );

      setNotification(`Ticket #${ticketId} has been successfully assigned to you!`);
      setActivityFeed((prev) => [
        {
          id: Date.now(),
          text: `Ticket #${ticketId} assigned to you`,
          time: "Just now",
          dotColor: "bg-amber-500",
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      console.warn("Failed to assign ticket:", err);
    } finally {
      setAssigningId(null);
      setTimeout(() => setNotification(""), 4500);
    }
  };

  // Compute KPI Counts
  const kpiStats = useMemo(() => {
    const totalOpen = cases.filter(
      (c) =>
        !c.status.toLowerCase().includes("resolved") &&
        !c.status.toLowerCase().includes("closed") &&
        !c.status.toLowerCase().includes("completed")
    ).length;

    const totalUrgent = cases.filter(
      (c) =>
        (c.priority === "CRITICAL" || c.priority === "HIGH") &&
        !c.status.toLowerCase().includes("resolved")
    ).length;

    const totalWaiting = cases.filter(
      (c) =>
        c.status.toLowerCase().includes("wait") ||
        c.status.toLowerCase().includes("diagnos") ||
        c.status.toLowerCase().includes("intake")
    ).length;

    const totalResolved = cases.filter(
      (c) =>
        c.status.toLowerCase().includes("resolved") ||
        c.status.toLowerCase().includes("closed") ||
        c.status.toLowerCase().includes("completed")
    ).length;

    return {
      open: totalOpen || 12,
      urgent: totalUrgent || 4,
      waiting: totalWaiting || 6,
      resolved: totalResolved || 28,
    };
  }, [cases]);

  // Standard ITIL / MSP Ticket Lifecycle Stages (Steps 1 - 6)
  const CORE_STAGES = [
    { value: "Open", label: "Step 1: Open" },
    { value: "Assigned", label: "Step 2: Assigned" },
    { value: "In Progress", label: "Step 3: In Progress" },
    { value: "Waiting for Customer", label: "Step 4: Waiting for Customer" },
    { value: "Resolved", label: "Step 5: Resolved" },
    { value: "Closed", label: "Step 6: Closed" },
  ];

  // Category Configuration for Active Ticket
  const currentConfig = activeCase
    ? getCategoryConfig(
        activeCase.category,
        editStatus || activeCase.status,
        editProgress !== undefined ? editProgress : activeCase.progress,
        editBench || activeCase.bench
      )
    : null;

  const availableStages = useMemo(() => {
    const core = [...CORE_STAGES];
    const techStages = currentConfig ? currentConfig.stages : [];
    const extras = techStages.filter(
      (ts) => !core.some((c) => c.value.toLowerCase() === ts.value.toLowerCase())
    );
    return {
      core,
      extras,
      all: [...core, ...extras],
    };
  }, [currentConfig]);

  const currentMessages = activeCase
    ? chatMessages[selectedCaseId] || [
        {
          sender: "Customer",
          author: activeCase.client,
          time: "Today, 10:24 AM",
          text: "Hi, our Outlook client isn't syncing emails on my laptop. It was working fine this morning but now it's stuck on 'Trying to connect'. I've tried restarting and re-adding my account but no luck.",
        },
      ]
    : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR NAVIGATION (Dark Navy Matching All Panels) */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-[#15233b] bg-[#0b1728] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* BRAND LOGO HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#172740]">
            <Link href="/technician/dashboard" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-500/20 text-white font-black text-sm">
                •
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block">
                  The Data Dot
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white lg:hidden text-lg"
            >
              ✕
            </button>
          </div>

          {/* PRIMARY NAVIGATION LINKS */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 text-xs">
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "my_tickets", label: "My Tickets", icon: "🎫" },
              { id: "assigned_to_me", label: "Assigned to Me", icon: "👤" },
              { id: "unassigned", label: "Unassigned", icon: "📥", badge: cases.filter((c) => !c.leadTech || c.leadTech === "Unassigned").length },
              { id: "all_tickets", label: "All Tickets", icon: "📑" },
              { id: "knowledge_base", label: "Knowledge Base", icon: "📚" },
              { id: "reports", label: "Reports", icon: "📈" },
              { id: "tools", label: "Tools", icon: "🛠️" },
            ].map((item) => {
              const isActive = activeView === item.id || (item.id === "my_tickets" && activeView === "ticket_details");
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as PortalNavView);
                    setSidebarOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:bg-[#132238] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm opacity-90">{item.icon}</span>
                    <span className="text-[13px]">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                        isActive ? "bg-white text-blue-600" : "bg-blue-500/30 text-blue-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SECONDARY NAVIGATION FOOTER */}
          <div className="border-t border-[#172740] p-3.5 space-y-1 text-xs">
            <button
              onClick={() => {
                setActiveView("profile");
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2 font-medium transition ${
                activeView === "profile"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-300 hover:bg-[#132238] hover:text-white"
              }`}
            >
              <span className="text-sm">👤</span>
              <span className="text-[13px]">Profile</span>
            </button>

            <button
              onClick={() => {
                setActiveView("settings");
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2 font-medium transition ${
                activeView === "settings"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-300 hover:bg-[#132238] hover:text-white"
              }`}
            >
              <span className="text-sm">⚙️</span>
              <span className="text-[13px]">Settings</span>
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 font-medium text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition"
            >
              <span className="text-sm">🚪</span>
              <span className="text-[13px]">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN APPLICATION SHELL (Light Theme Matching All Panels) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP HEADER BAR (Pure White Matching Mockups) */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
            >
              ☰
            </button>

            {/* Global Search */}
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search tickets, customers or knowledge base..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (activeView !== "dashboard" && activeView !== "my_tickets" && activeView !== "all_tickets") {
                    setActiveView("dashboard");
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 text-xs">
            {/* Supabase Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-mono text-[11px] text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync Active</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setNotification("Telemetry updated.")}
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition"
            >
              <span className="text-base">🔔</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Technician Profile Pill (Matching Mockup #2 top-right) */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] font-bold text-white text-xs shadow-sm">
                {techUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="font-bold text-slate-900 text-xs block">
                  {techUser.name}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {techUser.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* TOAST NOTIFICATION */}
        {notification && (
          <div className="mx-8 mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in">
            <span>✓ {notification}</span>
            <button
              onClick={() => setNotification("")}
              className="text-emerald-600 hover:text-emerald-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. MAIN WORKSPACE BODY */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* ========================================================= */}
          {/* VIEW 2: MAIN DASHBOARD (Panel 2 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* GREETING & DATE (Matching Panel 2) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Good morning, {techUser.name.split(" ")[0]} 👋
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Here's what's happening with your tickets today.
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-medium text-slate-600 block">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Let's keep things running smoothly.
                  </span>
                </div>
              </div>

              {/* 4 SUMMARY KPI CARDS (Matching Panel 2 Exactly) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Open Tickets */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-xl">
                    {kpiStats.open}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">My Open Tickets</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">↑ 3 from last week</span>
                  </div>
                </div>

                {/* 2. Urgent Tickets */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-extrabold text-xl">
                    {kpiStats.urgent}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Urgent Tickets</span>
                    <span className="text-[11px] text-rose-600 font-semibold">↓ 1 from last week</span>
                  </div>
                </div>

                {/* 3. Waiting for Customer */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-extrabold text-xl">
                    {kpiStats.waiting}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Waiting for Customer</span>
                    <span className="text-[11px] text-slate-400 font-medium">No change</span>
                  </div>
                </div>

                {/* 4. Resolved */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-xl">
                    {kpiStats.resolved}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Resolved This Month</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">↑ 12% from last month</span>
                  </div>
                </div>
              </div>

              {/* DEDICATED SERVICE WORKBENCH SWITCHER BAR */}
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <span>Dedicated Service Workbenches</span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Specialized Lab Routing
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Active: <strong className="text-blue-600 font-bold">{selectedServiceBench}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {WORKBENCH_PODS.map((pod) => {
                    const isSelected = selectedServiceBench === pod.id;
                    const count =
                      pod.id === "ALL"
                        ? cases.length
                        : cases.filter((c) => (c.category || "Data Recovery") === pod.id).length;

                    return (
                      <button
                        key={pod.id}
                        onClick={() => handleSwitchBench(pod.id)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition text-left ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm font-bold"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{pod.icon}</span>
                          <span className="truncate">{pod.shortLabel}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MAIN DUAL COLUMN LAYOUT (Panel 2) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: MY TICKETS CARD (7 COLS) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                    {/* CARD HEADER WITH STATUS TABS & VIEW ALL */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">My Tickets</h2>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* STATUS TABS */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                          {(["Open", "Assigned", "Waiting", "Resolved", "Closed"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                setTicketStatusTab(st);
                                setCurrentPage(1);
                              }}
                              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                                ticketStatusTab === st
                                  ? "bg-white text-blue-600 shadow-sm"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setActiveView("my_tickets")}
                          className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                        >
                          View All Tickets →
                        </button>
                      </div>
                    </div>

                    {/* TICKETS TABLE (Matching Panel 2) */}
                    {loading ? (
                      <div className="py-12 text-center text-xs text-slate-400 font-mono">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
                        <p>Syncing tickets with Supabase...</p>
                      </div>
                    ) : viewFilteredCases.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        <p className="text-lg mb-2">📋</p>
                        <p className="font-semibold text-slate-700">No tickets found in this tab</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Try clicking another status tab or switching workbench pod.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <th className="pb-3 pr-2">#</th>
                              <th className="pb-3 pr-4">Title</th>
                              <th className="pb-3 pr-4">Customer</th>
                              <th className="pb-3 pr-4">Priority</th>
                              <th className="pb-3 pr-4">Status</th>
                              <th className="pb-3 pr-2">Updated</th>
                              <th className="pb-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedCases.map((c) => {
                              const isSelected = c.id === activeCase?.id;
                              return (
                                <tr
                                  key={c.id}
                                  onClick={() => handleSelectCase(c)}
                                  className={`cursor-pointer transition ${
                                    isSelected
                                      ? "bg-blue-50/60 font-medium text-slate-900"
                                      : "hover:bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  <td className="py-3.5 pr-2 font-mono text-[11px] font-bold text-slate-800">
                                    #{c.id}
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <div className="font-bold text-slate-900 truncate max-w-[170px]">
                                      {c.device}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {c.category} • {c.mediaType}
                                    </div>
                                  </td>
                                  <td className="py-3.5 pr-4 truncate max-w-[120px] text-slate-700 font-medium">
                                    {c.client}
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                        c.priority === "CRITICAL"
                                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                                          : c.priority === "HIGH"
                                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                                          : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                      }`}
                                    >
                                      {c.priority === "CRITICAL" ? "High" : c.priority === "HIGH" ? "Medium" : "Low"}
                                    </span>
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                        c.status.toLowerCase().includes("resolved")
                                          ? "bg-emerald-50 text-emerald-600"
                                          : c.status.toLowerCase().includes("wait")
                                          ? "bg-amber-50 text-amber-600"
                                          : c.status.toLowerCase().includes("progress")
                                          ? "bg-indigo-50 text-indigo-600"
                                          : "bg-blue-50 text-blue-600"
                                      }`}
                                    >
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 pr-2 text-slate-400 text-[11px] whitespace-nowrap">
                                    {c.updatedAt || "2 hours ago"}
                                  </td>
                                  <td className="py-3.5 text-right">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDetails(c);
                                      }}
                                      className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                    >
                                      Open
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span>
                          Showing page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 disabled:opacity-40 hover:bg-slate-100 text-slate-700"
                          >
                            ‹
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                            <button
                              key={num}
                              onClick={() => setCurrentPage(num)}
                              className={`h-7 w-7 rounded-lg text-xs font-bold ${
                                currentPage === num
                                  ? "bg-blue-600 text-white"
                                  : "border border-slate-200 hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 disabled:opacity-40 hover:bg-slate-100 text-slate-700"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: RECENT ACTIVITY & TIP OF THE DAY & COMMAND CENTER (5 COLS) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* RECENT ACTIVITY CARD (Matching Panel 2) */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Recent Activity
                      </h3>
                      <button
                        onClick={() => setNotification("Activity stream updated.")}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activityFeed.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 text-xs">
                          <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${item.dotColor}`} />
                          <div className="flex-1 leading-snug">
                            <p className="font-semibold text-slate-800 text-[12px]">{item.text}</p>
                            <span className="text-[10px] text-slate-400">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TIP OF THE DAY CARD (Matching Panel 2) */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💡</span>
                      <h4 className="font-bold text-blue-900 text-xs">Tip of the Day</h4>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      Always double-check drive sector maps before cloning passes, and confirm status updates with the customer before signing off.
                    </p>
                  </div>

                  {/* ACTIVE TICKET COMMAND CENTER DRAWER */}
                  {activeCase && (
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] font-mono text-blue-600 font-bold block">
                            Active Case #{activeCase.id}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                            {activeCase.device}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(activeCase)}
                          className="rounded-xl bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 text-xs font-bold hover:bg-blue-600 hover:text-white transition shrink-0 cursor-pointer"
                        >
                          Workspace →
                        </button>
                      </div>

                      {/* UNIFIED CLIENT PORTAL UPDATE PANEL */}
                      <div className="space-y-3.5 text-xs">
                        <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📢</span>
                            <div>
                              <span className="font-bold text-slate-900 text-xs block">Client Portal Update</span>
                              <span className="text-[10px] text-slate-500">Live sync to customer tracking portal</span>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                            🟢 Live Sync
                          </span>
                        </div>

                        {/* Priority & Station Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                              Priority:
                            </label>
                            <select
                              value={editPriority || activeCase.priority}
                              onChange={(e) => setEditPriority(e.target.value as any)}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                            >
                              <option value="CRITICAL">High</option>
                              <option value="HIGH">Medium</option>
                              <option value="STANDARD">Low</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                              Station:
                            </label>
                            <select
                              value={editBench || activeCase.bench}
                              onChange={(e) => setEditBench(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500 truncate font-medium"
                            >
                              {currentConfig?.benchOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Client Lifecycle Stage */}
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                            Client Lifecycle Stage:
                          </label>
                          <select
                            value={clientStatus || activeCase.status}
                            onChange={(e) => setClientStatus(e.target.value)}
                            className="w-full rounded-xl border border-blue-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                          >
                            <optgroup label="Core Lifecycle (Steps 1 - 6)">
                              {availableStages.core.map((st) => (
                                <option key={st.value} value={st.value}>
                                  {st.label}
                                </option>
                              ))}
                            </optgroup>
                            {availableStages.extras.length > 0 && (
                              <optgroup label={`${activeCase.category} Execution Stages`}>
                                {availableStages.extras.map((st) => (
                                  <option key={st.value} value={st.value}>
                                    {st.label}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>

                        {/* Client Progress Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-700">Client Completion Progress:</span>
                            <span className="font-mono font-bold text-blue-600">
                              {clientProgress !== undefined ? clientProgress : activeCase.progress}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={clientProgress !== undefined ? clientProgress : activeCase.progress}
                            onChange={(e) => setClientProgress(Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                          />
                          <div className="flex items-center gap-1.5 pt-1.5">
                            {[25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setClientProgress(pct)}
                                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                                  (clientProgress !== undefined ? clientProgress : activeCase.progress) === pct
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Quick Presets:
                          </label>
                          <div className="flex flex-col gap-1">
                            {[
                              "Diagnostics completed, bench operations underway.",
                              "Recovery 100% verified, preparing files for handover.",
                              "Awaiting customer authorization for next phase.",
                            ].map((tmpl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setClientUpdateText(tmpl)}
                                className="rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 px-2 py-1 text-[11px] text-slate-700 text-left truncate transition cursor-pointer"
                              >
                                + {tmpl}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                            Customer Message / Dispatch:
                          </label>
                          <textarea
                            rows={3}
                            value={clientUpdateText}
                            onChange={(e) => setClientUpdateText(e.target.value)}
                            placeholder={`Update message for ${activeCase.client} (optional)...`}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={notifyClientWithTelemetry}
                            onChange={(e) => setNotifyClientWithTelemetry(e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Include stage &amp; progress stamp in message</span>
                        </label>

                        <button
                          type="button"
                          onClick={handleSendClientUpdate}
                          disabled={isSendingClientUpdate}
                          className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-500 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingClientUpdate ? (
                            <>
                              <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Syncing to Portal...</span>
                            </>
                          ) : (
                            <>
                              <span>🌐</span>
                              <span>Sync &amp; Send Client Update</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* QUICK ATTACHMENT & WORKSPACE ACTIONS */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 rounded-xl border border-blue-200 bg-blue-50/50 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <span>📎</span>
                          <span>Add Attachment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(activeCase)}
                          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <span>Full Workspace</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3, 4, 5, 6: MY TICKETS / ASSIGNED / UNASSIGNED / ALL */}
          {/* (Matching Panels 3, 4, 5, 6 in Mockup) */}
          {/* ========================================================= */}
          {(activeView === "my_tickets" ||
            activeView === "assigned_to_me" ||
            activeView === "unassigned" ||
            activeView === "all_tickets") && (
            <div className="space-y-6">
              {/* VIEW HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {activeView === "my_tickets"
                      ? "My Tickets"
                      : activeView === "assigned_to_me"
                      ? "Assigned to Me"
                      : activeView === "unassigned"
                      ? "Unassigned Tickets"
                      : "All Tickets"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeView === "unassigned"
                      ? "Pick up and assign tickets."
                      : "View and manage your support tickets."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNotification("Create ticket wizard opened.")}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm"
                  >
                    + New Ticket
                  </button>
                </div>
              </div>

              {/* CARD CONTAINER */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                {/* STATUS TABS (Matching Panel 3) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                    {(["Open", "Assigned", "Waiting", "Resolved", "Closed", "ALL"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setTicketStatusTab(st);
                          setCurrentPage(1);
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          ticketStatusTab === st
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* FILTER DROPDOWNS (Matching Panels 3-6) */}
                  <div className="flex items-center gap-2 text-xs">
                    <select
                      value={filterPriority}
                      onChange={(e) => {
                        setFilterPriority(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                    >
                      <option value="ALL">All Priorities</option>
                      <option value="CRITICAL">High</option>
                      <option value="HIGH">Medium</option>
                      <option value="STANDARD">Low</option>
                    </select>

                    <select
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Data Recovery">Data Recovery</option>
                      <option value="Managed IT">Managed IT</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Cloud Solutions">Cloud Solutions</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                </div>

                {/* TABLE (Matching Panels 3, 4, 5, 6) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pr-2">#</th>
                        <th className="pb-3 pr-4">Title</th>
                        <th className="pb-3 pr-4">Customer</th>
                        <th className="pb-3 pr-4">Priority</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Updated</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedCases.map((c) => {
                        const isSelected = c.id === activeCase?.id;
                        return (
                          <tr
                            key={c.id}
                            onClick={() => handleSelectCase(c)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? "bg-blue-50/60 font-medium text-slate-900"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                          <td className="py-3.5 pr-2 font-mono text-[11px] font-bold text-slate-800">
                            #{c.id}
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="font-bold text-slate-900">{c.device}</div>
                            <div className="text-[10px] text-slate-400">
                              {c.category} • {c.mediaType}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 text-slate-700 font-medium">{c.client}</td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                c.priority === "CRITICAL"
                                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                                  : c.priority === "HIGH"
                                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              }`}
                            >
                              {c.priority === "CRITICAL" ? "High" : c.priority === "HIGH" ? "Medium" : "Low"}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                c.status.toLowerCase().includes("resolved")
                                  ? "bg-emerald-50 text-emerald-600"
                                  : c.status.toLowerCase().includes("wait")
                                  ? "bg-amber-50 text-amber-600"
                                  : c.status.toLowerCase().includes("progress")
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {c.updatedAt || "2 hours ago"}
                          </td>
                          <td className="py-3.5 text-right">
                            {activeView === "unassigned" ? (
                              <button
                                disabled={assigningId === c.id}
                                onClick={() => handleAssignToMe(c.id)}
                                className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 shadow-sm"
                              >
                                {assigningId === c.id ? "Assigning..." : "Assign"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenDetails(c)}
                                className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-600 hover:text-white transition"
                              >
                                Open
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION (Matching Panels 3, 6) */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span>
                      Showing page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-100 text-slate-700"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold ${
                          currentPage === 1 ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        1
                      </button>
                      {totalPages >= 2 && (
                        <button
                          onClick={() => setCurrentPage(2)}
                          className={`h-8 w-8 rounded-lg text-xs font-bold ${
                            currentPage === 2 ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          2
                        </button>
                      )}
                      {totalPages >= 3 && (
                        <button
                          onClick={() => setCurrentPage(3)}
                          className={`h-8 w-8 rounded-lg text-xs font-bold ${
                            currentPage === 3 ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          3
                        </button>
                      )}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-100 text-slate-700"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 7: TICKET DETAILS (Panel 7 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "ticket_details" && activeCase && (
            <div className="space-y-6">
              {/* TOP NAVIGATION BREADCRUMB */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveView("my_tickets")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  ← Back to My Tickets
                </button>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>Created: {activeCase.createdAt || "4 Aug 2025, 10:24 AM"}</span>
                  <span>•</span>
                  <span>Last updated: {activeCase.updatedAt || "4 Aug 2025, 2:15 PM"}</span>
                </div>
              </div>

              {/* TICKET TITLE & BADGES (Matching Panel 7) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    #{activeCase.id}
                  </span>
                  <span className="rounded-full bg-rose-50 border border-rose-200 text-rose-600 px-2.5 py-0.5 text-[10px] font-bold">
                    High Priority
                  </span>
                </div>

                <h1 className="text-xl font-bold text-slate-900">
                  {activeCase.device}
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed">
                  User is experiencing issues with synchronization across devices. They've tried restarting and re-adding the account, but the issue persists.
                </p>

                {/* METADATA CHIPS */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <span className="text-slate-400">Customer:</span>
                    <strong className="text-slate-800">{activeCase.client}</strong>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <span className="text-slate-400">Assigned To:</span>
                    <strong className="text-slate-800">{activeCase.leadTech || techUser.name}</strong>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <span className="text-slate-400">Category:</span>
                    <strong className="text-slate-800">{activeCase.category}</strong>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <span className="text-slate-400">Allocated Station:</span>
                    <strong className="text-blue-600 font-mono">{editBench || activeCase.bench}</strong>
                  </div>
                </div>

                {/* WORKFLOW STEPPER (Interactive Steps 1-6 Matching Panel 7) */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Workflow Lifecycle Progression
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click stage to select • Click <strong className="text-blue-600 font-semibold">Save Internal Update</strong> to save
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {["Open", "Assigned", "In Progress", "Waiting for Customer", "Resolved", "Closed"].map((st, i) => {
                      const currentStatus = (editStatus || activeCase.status || "").toLowerCase();
                      const isSelected = currentStatus === st.toLowerCase();
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setEditStatus(st)}
                          title={`Select Step ${i + 1}: ${st}`}
                          className={`text-center p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer hover:shadow-sm ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-500/25"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <span className={`text-[10px] block font-mono font-bold ${
                            isSelected ? "text-blue-100" : "text-slate-400"
                          }`}>
                            Step {i + 1}
                          </span>
                          <span className="truncate block mt-0.5 font-bold">{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2-COLUMN DETAILS WORKSPACE: CHAT / CONVERSATION (LEFT) + ACTIONS (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: CONVERSATION TABS (8 COLS) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                    {/* TABS HEADER */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 border-b border-slate-100 pb-3 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setTicketDetailTab("conversation")}
                        className={`pb-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                          ticketDetailTab === "conversation"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>💬</span>
                        <span>Customer Conversation</span>
                        <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px]">
                          {currentMessages.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTicketDetailTab("notes")}
                        className={`pb-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                          ticketDetailTab === "notes"
                            ? "border-amber-600 text-amber-700"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>🔒</span>
                        <span>Internal Notes</span>
                        <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px]">
                          {(internalNotes[activeCase.id] || []).length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTicketDetailTab("attachments")}
                        className={`pb-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                          ticketDetailTab === "attachments"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>📎</span>
                        <span>Attachments</span>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px]">
                          {(attachments[activeCase.id] || []).length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTicketDetailTab("audit")}
                        className={`pb-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                          ticketDetailTab === "audit"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>📜</span>
                        <span>Audit Log</span>
                      </button>
                    </div>

                    {/* TAB 1: CUSTOMER CONVERSATION */}
                    {ticketDetailTab === "conversation" && (
                      <div className="space-y-4">
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {currentMessages.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              <span className="text-2xl block mb-2">💬</span>
                              <p className="font-semibold text-slate-600">No conversation messages yet</p>
                              <p className="text-xs text-slate-400 mt-1">Send a message below to communicate directly with the customer portal.</p>
                            </div>
                          ) : (
                            currentMessages.map((msg, idx) => {
                              const isTech = msg.sender === "Technician";
                              return (
                                <div
                                  key={idx}
                                  className={`rounded-xl border p-4 space-y-2 ${
                                    isTech
                                      ? "border-blue-200 bg-blue-50/40 text-slate-800 ml-4"
                                      : "border-slate-200 bg-slate-50/70 text-slate-800 mr-4"
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">{msg.author}</span>
                                      <span
                                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                          isTech ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"
                                        }`}
                                      >
                                        {msg.sender}
                                      </span>
                                    </div>
                                    <span className="text-slate-400 text-[11px]">{msg.time}</span>
                                  </div>
                                  <p className="text-xs leading-relaxed whitespace-pre-line text-slate-700">{msg.text}</p>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* DEDICATED CUSTOMER REPLY FORM */}
                        <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>✉️</span>
                              <span>Send Direct Message to Customer</span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setReplyText(
                                  "Hello, our engineering team has reviewed this case and bench diagnostics are actively underway. We will provide another update shortly."
                                )
                              }
                              className="text-xs text-blue-600 hover:underline cursor-pointer"
                            >
                              + Insert Template
                            </button>
                          </div>

                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Type a customer message for ${activeCase.client}...`}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
                          />

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              Dispatched immediately to the customer portal
                            </span>
                            <button
                              type="submit"
                              disabled={!replyText.trim()}
                              className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 transition shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <span>✉️</span>
                              <span>Send to Customer Portal</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* TAB 2: INTERNAL LAB NOTES (TECHNICIAN CONFIDENTIAL) */}
                    {ticketDetailTab === "notes" && (
                      <div className="space-y-4">
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {(internalNotes[activeCase.id] || []).length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-amber-50/50 rounded-xl border border-dashed border-amber-200">
                              <span className="text-2xl block mb-2">🔒</span>
                              <p className="font-semibold text-slate-700">No private internal notes yet</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Internal notes are completely private and never shown to the customer. Use them for firmware offsets, donor head serials, or lab shift handover.
                              </p>
                            </div>
                          ) : (
                            (internalNotes[activeCase.id] || []).map((note) => (
                              <div
                                key={note.id}
                                className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{note.author}</span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                                      🔒 Internal Note
                                    </span>
                                  </div>
                                  <span className="text-slate-400 text-[11px] font-mono">{note.time}</span>
                                </div>
                                <p className="text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-line bg-white/80 p-2.5 rounded-lg border border-amber-100">
                                  {note.text}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* DEDICATED INTERNAL NOTE FORM */}
                        <form onSubmit={handleAddInternalNote} className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <span>🔒</span>
                              <span>Add Private Technician Note</span>
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md">
                              Confidential
                            </span>
                          </div>

                          <textarea
                            rows={3}
                            value={newInternalNoteText}
                            onChange={(e) => setNewInternalNoteText(e.target.value)}
                            placeholder="Record ROM checksum, donor head serial, forensic drive geometry, or internal notes..."
                            className="w-full rounded-xl border border-amber-200 bg-amber-50/20 p-3 text-xs font-mono text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition"
                          />

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              Never visible to customer or client portal
                            </span>
                            <button
                              type="submit"
                              disabled={!newInternalNoteText.trim()}
                              className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white hover:bg-amber-500 transition shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <span>💾</span>
                              <span>Save Internal Note</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* TAB 3: ATTACHMENTS */}
                    {ticketDetailTab === "attachments" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Attached Files &amp; Laboratory Logs ({((attachments[activeCase.id]) || []).length})
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>📎</span>
                            <span>Upload New File</span>
                          </button>
                        </div>

                        {/* FILE LIST */}
                        <div className="space-y-2.5">
                          {((attachments[activeCase.id]) || []).length === 0 ? (
                            <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                              <span className="text-3xl block mb-2">📁</span>
                              <p className="font-semibold text-slate-700">No attachments uploaded yet</p>
                              <p className="text-xs text-slate-400 mt-1 mb-4">
                                Attach forensic captures, intake photos, SMART reports, or hex logs.
                              </p>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 text-xs font-bold transition cursor-pointer"
                              >
                                <span>📎</span>
                                <span>Select File from Computer</span>
                              </button>
                            </div>
                          ) : (
                            ((attachments[activeCase.id]) || []).map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-base">
                                    {file.type === "pdf"
                                      ? "📄"
                                      : file.type === "image"
                                      ? "🖼️"
                                      : file.type === "archive"
                                      ? "📦"
                                      : file.type === "binary"
                                      ? "💾"
                                      : "📎"}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                                    <p className="text-[11px] text-slate-400 font-mono">
                                      {file.size} • Uploaded {file.uploadedAt} by {file.uploadedBy}
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
                                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1"
                                    >
                                      <span>⬇️</span>
                                      <span>Download</span>
                                    </a>
                                  ) : (
                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                      Verified File
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAttachment(activeCase.id, file.id)}
                                    className="rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-1 text-xs font-bold transition cursor-pointer"
                                    title="Remove Attachment"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* DRAG & DROP / CLICK PROMPT BOX */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-5 rounded-xl border border-dashed border-blue-300 bg-blue-50/30 text-center cursor-pointer hover:bg-blue-50/60 transition group"
                        >
                          <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">📎</span>
                          <p className="text-xs font-bold text-blue-700">Click to attach more documents or logs</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, JPG, PNG, BIN, ZIP, LOG up to 50MB</p>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: AUDIT LOG */}
                    {ticketDetailTab === "audit" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800">Operational Audit Trail</span>
                          <span className="text-[10px] font-mono text-slate-400">Target #{activeCase.id}</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                            <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800">Assigned to {activeCase.leadTech}</p>
                              <p className="text-[11px] text-slate-400 font-mono">Bench station: {activeCase.bench}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800">Current Lifecycle: {activeCase.status}</p>
                              <p className="text-[11px] text-slate-400 font-mono">Calibrated Progress: {activeCase.progress}%</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800">Intake Created &amp; Telemetry Registered</p>
                              <p className="text-[11px] text-slate-400 font-mono">{activeCase.createdAt} • System Authenticated</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: TICKET ACTIONS (4 COLS - SEPARATED WORKBENCH & CLIENT DISPATCH) */}
                <div className="lg:col-span-4 space-y-5">
                  {/* CLIENT STATUS & PORTAL UPDATE (CUSTOMER-FACING & LIVE SYNC) */}
                  <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-b from-blue-50/40 to-white p-5 shadow-sm space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">
                          📢
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">
                            Client Status Update
                          </h3>
                          <span className="text-[10px] text-slate-500 block">
                            Live sync with customer tracking portal
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        🟢 Client Portal Sync
                      </span>
                    </div>

                    {/* Priority & Station Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-700 text-[11px]">
                          Priority:
                        </label>
                        <select
                          value={editPriority || activeCase.priority}
                          onChange={(e) => setEditPriority(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                        >
                          <option value="CRITICAL">High</option>
                          <option value="HIGH">Medium</option>
                          <option value="STANDARD">Low</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-700 text-[11px]">
                          Station / Bench:
                        </label>
                        <select
                          value={editBench || activeCase.bench}
                          onChange={(e) => setEditBench(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium truncate"
                        >
                          {currentConfig?.benchOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Client Lifecycle Stage */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700 text-[11px]">
                        Client Lifecycle Stage:
                      </label>
                      <select
                        value={clientStatus || activeCase.status}
                        onChange={(e) => setClientStatus(e.target.value)}
                        className="w-full rounded-xl border border-blue-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                      >
                        <optgroup label="Core Lifecycle (Steps 1 - 6)">
                          {availableStages.core.map((st) => (
                            <option key={st.value} value={st.value}>
                              {st.label}
                            </option>
                          ))}
                        </optgroup>
                        {availableStages.extras.length > 0 && (
                          <optgroup label={`${activeCase.category} Execution Stages`}>
                            {availableStages.extras.map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    {/* Client Progress Slider */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">Client Completion Progress:</span>
                        <span className="font-mono font-bold text-blue-600">
                          {clientProgress !== undefined ? clientProgress : activeCase.progress}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={clientProgress !== undefined ? clientProgress : activeCase.progress}
                        onChange={(e) => setClientProgress(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                      />
                      <div className="flex items-center gap-1.5 pt-1">
                        {[25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setClientProgress(pct)}
                            className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                              (clientProgress !== undefined ? clientProgress : activeCase.progress) === pct
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preset Status Quick Chips */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Quick Preset Messages:
                      </label>
                      <div className="flex flex-col gap-1">
                        {[
                          "Diagnostics completed, bench operations underway.",
                          "Replacement components acquired, resuming procedure.",
                          "Recovery 100% verified, preparing files for handover.",
                          "Awaiting customer authorization for next phase.",
                        ].map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setClientUpdateText(tmpl)}
                            className="rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 px-2.5 py-1 text-[11px] text-slate-700 transition text-left truncate cursor-pointer"
                          >
                            + {tmpl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Client Update Message Textarea */}
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700 text-[11px]">
                        Customer Message / Dispatch:
                      </label>
                      <textarea
                        rows={3}
                        value={clientUpdateText}
                        onChange={(e) => setClientUpdateText(e.target.value)}
                        placeholder="Type update message for client to view on tracking portal (optional)..."
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Telemetry Toggle */}
                    <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifyClientWithTelemetry}
                        onChange={(e) => setNotifyClientWithTelemetry(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Include stage ({clientStatus || activeCase.status}) &amp; progress ({clientProgress !== undefined ? clientProgress : activeCase.progress}%) stamp</span>
                    </label>

                    {/* Send Client Update Button */}
                    <button
                      type="button"
                      onClick={handleSendClientUpdate}
                      disabled={isSendingClientUpdate}
                      className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-500 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingClientUpdate ? (
                        <>
                          <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Syncing to Portal...</span>
                        </>
                      ) : (
                        <>
                          <span>🌐</span>
                          <span>Sync &amp; Send Client Update</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-blue-600/80 text-center -mt-1">
                      Directly updates ticket status &amp; progress in customer portal database.
                    </p>
                  </div>

                  {/* 3. ADMINISTRATIVE QUICK ACTIONS */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Quick Actions
                    </span>

                    <button
                      type="button"
                      onClick={() => setNotification("Reassign ticket dialog opened.")}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 font-semibold text-slate-700 hover:bg-slate-100 text-left px-3 flex items-center gap-2 transition cursor-pointer"
                    >
                      <span>🔄</span>
                      <span>Reassign Ticket</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-xl border border-blue-200 bg-blue-50/50 py-2 font-semibold text-blue-700 hover:bg-blue-100 text-left px-3 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>📎</span>
                        <span>Add Attachment</span>
                      </div>
                      <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-mono font-bold">
                        {(attachments[activeCase.id] || []).length} attached
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseTicket}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50 py-2 font-bold text-rose-600 hover:bg-rose-100 text-center block transition cursor-pointer"
                    >
                      ✕ Close Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 8: KNOWLEDGE BASE (Panel 8 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "knowledge_base" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Find answers and resources to help resolve tickets faster.
                </p>
              </div>

              {/* SEARCH BAR */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              {/* GRID OF 6 CARDS (Matching Panel 8) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Microsoft 365 Setup", sub: "Microsoft 365", count: "12 articles", icon: "🌐" },
                  { title: "Email Troubleshooting", sub: "Email", count: "8 articles", icon: "✉️" },
                  { title: "Windows Support", sub: "Windows", count: "15 articles", icon: "💻" },
                  { title: "Network & Internet", sub: "Networking", count: "10 articles", icon: "🔌" },
                  { title: "Printer Support", sub: "Hardware", count: "6 articles", icon: "🖨️" },
                  { title: "Security & MFA", sub: "Security", count: "9 articles", icon: "🛡️" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-blue-300 transition cursor-pointer space-y-2"
                  >
                    <span className="text-2xl block">{item.icon}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    <span className="text-[11px] text-slate-400 block">{item.sub}</span>
                    <span className="text-xs text-blue-600 font-bold block pt-1">{item.count}</span>
                  </div>
                ))}
              </div>

              {/* RECENT ARTICLES (Matching Panel 8) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recent Articles</h3>
                  <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    { title: "How to reset a user's Microsoft 365 password", date: "2 days ago" },
                    { title: "Fix Outlook stuck on 'Trying to connect'", date: "4 days ago" },
                    { title: "Add a shared mailbox in Outlook", date: "1 week ago" },
                  ].map((art, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                      <span className="font-semibold text-slate-800">{art.title}</span>
                      <span className="text-[11px] text-slate-400">{art.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 9: REPORTS (Panel 9 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "reports" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track your performance and notifications.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-600 shadow-sm font-medium">
                  Last 30 Days ▾
                </div>
              </div>

              {/* 4 STATS (Matching Panel 9) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Total Tickets</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">48</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">↑ 12%</span>
                </div>
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Resolved</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">28</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">↑ 18%</span>
                </div>
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Avg. Response Time</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">2.4 hrs</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">↑ 26%</span>
                </div>
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Avg. Resolve Time</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">6.8 hrs</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">↑ 15%</span>
                </div>
              </div>

              {/* CHARTS (Matching Panel 9) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tickets by Status (Donut) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Tickets by Status</h3>
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-4">
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-blue-500 border-t-emerald-500 border-r-amber-500 border-b-rose-500 shadow-inner">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-slate-900 block">48</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <span className="text-slate-600">Open: <strong className="text-slate-900">12</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        <span className="text-slate-600">In Progress: <strong className="text-slate-900">6</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-slate-600">Waiting: <strong className="text-slate-900">6</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Resolved: <strong className="text-slate-900">18</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                        <span className="text-slate-600">Closed: <strong className="text-slate-900">4</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tickets by Priority (Bars) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Tickets by Priority</h3>
                  <div className="flex items-end justify-between gap-4 h-44 pt-6 px-4">
                    {[
                      { label: "Urgent", count: 4, height: "35%", color: "bg-rose-500" },
                      { label: "High", count: 14, height: "70%", color: "bg-amber-500" },
                      { label: "Medium", count: 18, height: "95%", color: "bg-blue-500" },
                      { label: "Low", count: 5, height: "45%", color: "bg-emerald-500" },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                        <span className="text-xs font-bold text-slate-700">{bar.count}</span>
                        <div
                          className={`w-full rounded-t-lg ${bar.color} transition-all duration-500`}
                          style={{ height: bar.height }}
                        />
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 10: TOOLS (Panel 10 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "tools" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tools</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quick access to useful tasks and resources.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Remote Support", desc: "Launch remote session tool", icon: "🖥️" },
                  { title: "Password Generator", desc: "Generate secure passwords", icon: "🔐" },
                  { title: "IP Lookup", desc: "Check IP address details", icon: "🌐" },
                  { title: "System Info", desc: "View system information", icon: "⚙️" },
                ].map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3"
                  >
                    <span className="text-2xl block">{t.icon}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 11: PROFILE (Panel 11 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "profile" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your account information.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e293b] font-bold text-white text-xl shadow">
                    {techUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{techUser.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{techUser.role}</p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{techUser.email}</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={techUser.name}
                      onChange={(e) => setTechUser({ ...techUser, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={techUser.email}
                      onChange={(e) => setTechUser({ ...techUser, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={techUser.department}
                      onChange={(e) => setTechUser({ ...techUser, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("tdd_tech_user", JSON.stringify(techUser));
                      }
                      try {
                        await fetch("/api/technicians", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email: techUser.email,
                            name: techUser.name,
                            department: techUser.department,
                          }),
                        });
                      } catch (e) {
                        console.warn("Could not sync profile to backend:", e);
                      }
                      setNotification("✓ Profile details updated and saved to Supabase.");
                      setTimeout(() => setNotification(""), 4000);
                    }}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-500 transition shadow-sm"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 12: SETTINGS (Panel 12 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "settings" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Configuration Center
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">Technician Workbench Settings</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Workbench Settings &amp; Appearance</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize your UI appearance, theme, notifications, security credentials, and live telemetry sync.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* SETTINGS SUBTABS (Matching Panel 12 with full interactivity) */}
                <div className="space-y-1.5 text-xs">
                  {(["Appearance", "General", "Notifications", "Security"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSettingsSubTab(tab)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold transition flex items-center justify-between ${
                        settingsSubTab === tab
                          ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">
                          {tab === "Appearance" ? "🎨" : tab === "General" ? "⚙️" : tab === "Notifications" ? "🔔" : "🔒"}
                        </span>
                        <span>{tab}</span>
                      </div>
                      {settingsSubTab === tab && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}

                  <div className="pt-4 border-t border-slate-200/80 mt-4 px-2 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Active Theme
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="capitalize">{appearanceTheme} Workspace</span>
                    </div>
                  </div>
                </div>

                {/* SETTINGS SUBTAB CONTENT */}
                <div className="md:col-span-3 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6 text-xs">
                  {/* SUBTAB 1: APPEARANCE */}
                  {settingsSubTab === "Appearance" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Website &amp; Workbench Appearance</h3>
                          <p className="text-[11px] text-slate-400">Control visual theme, accent colors, contrast, and layout density.</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600 border border-blue-100">
                          Live UI Preview
                        </span>
                      </div>

                      {/* THEME SELECTOR */}
                      <div>
                        <label className="block font-bold text-slate-800 mb-2">Theme Mode</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "light", label: "Clean Light", desc: "Default high-readability", icon: "☀️", previewBg: "bg-white border-slate-200 text-slate-800" },
                            { id: "navy", label: "Dark Navy", desc: "Low eye strain in dark lab", icon: "🌙", previewBg: "bg-[#0b1324] border-slate-700 text-white" },
                            { id: "system", label: "System Sync", desc: "Matches operating system", icon: "💻", previewBg: "bg-gradient-to-r from-white to-slate-800 border-slate-300 text-slate-800" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setAppearanceTheme(t.id as any)}
                              className={`rounded-xl border p-3 text-left transition relative ${
                                appearanceTheme === t.id
                                  ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20"
                                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-base">{t.icon}</span>
                                {appearanceTheme === t.id && (
                                  <span className="text-blue-600 font-bold text-xs">✓ Active</span>
                                )}
                              </div>
                              <p className="font-bold text-slate-900">{t.label}</p>
                              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{t.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ACCENT COLOR SELECTOR */}
                      <div>
                        <label className="block font-bold text-slate-800 mb-2">Accent Brand Tone</label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { id: "blue", name: "Data Dot Blue", color: "#2563eb" },
                            { id: "emerald", name: "Forensic Emerald", color: "#10b981" },
                            { id: "violet", name: "Cyber Violet", color: "#8b5cf6" },
                            { id: "amber", name: "High-Priority Amber", color: "#f59e0b" },
                          ].map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setAccentColor(c.id as any)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                                accentColor === c.id
                                  ? "border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600"
                                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ backgroundColor: c.color }} />
                              <span className="text-xs">{c.name}</span>
                              {accentColor === c.id && <span className="text-[10px]">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* WORKBENCH DENSITY & TELEMETRY SPEED */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">Workbench Layout Density</label>
                          <select
                            value={workbenchDensity}
                            onChange={(e) => setWorkbenchDensity(e.target.value as any)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 outline-none focus:border-blue-500 font-medium"
                          >
                            <option value="comfortable">Comfortable Grid (Spacious)</option>
                            <option value="compact">Compact Triage (High Density Data)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">Live Telemetry Sync Rate</label>
                          <select
                            value={telemetrySpeed}
                            onChange={(e) => setTelemetrySpeed(e.target.value as any)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 outline-none focus:border-blue-500 font-medium"
                          >
                            <option value="5s">5 Seconds (Real-time Streaming)</option>
                            <option value="10s">10 Seconds (Standard Polling)</option>
                            <option value="30s">30 Seconds (Low Network Bandwidth)</option>
                          </select>
                        </div>
                      </div>

                      {/* TOGGLES */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800 block">High-Contrast Status Badges</span>
                            <span className="text-[11px] text-slate-400">Boosts visibility of ticket urgency and bench flags</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={highContrastBadges}
                            onChange={(e) => setHighContrastBadges(e.target.checked)}
                            className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800 block">Audio Chimes for Incoming Messages</span>
                            <span className="text-[11px] text-slate-400">Play subtle sound chime when customer or admin replies</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={audioChimes}
                            onChange={(e) => setAudioChimes(e.target.checked)}
                            className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                          />
                        </label>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveAppearance}
                          className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-500 transition shadow-sm flex items-center gap-2"
                        >
                          <span>Save Appearance Settings</span>
                          <span>✓</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: GENERAL */}
                  {settingsSubTab === "General" && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-sm">General Workbench Settings</h3>
                        <p className="text-[11px] text-slate-400">Set primary timezone, regional format, and default bench views.</p>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Time Zone</label>
                        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 outline-none">
                          <option>(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                          <option>(UTC+01:00) London, Dublin, Edinburgh</option>
                          <option>(UTC-05:00) Eastern Time (US &amp; Canada)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Language</label>
                          <select className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 outline-none">
                            <option>English (UK)</option>
                            <option>English (US)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Default Ticket View</label>
                          <select className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 outline-none">
                            <option>My Tickets</option>
                            <option>All Tickets</option>
                            <option>Unassigned</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setNotification("General preferences updated successfully!");
                            setTimeout(() => setNotification(""), 3500);
                          }}
                          className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-500 transition shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: NOTIFICATIONS */}
                  {settingsSubTab === "Notifications" && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-sm">Alerts &amp; Notification Rules</h3>
                        <p className="text-[11px] text-slate-400">Configure email, desktop push, and SMS dispatch channels.</p>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800 block">Critical Ticket Email Alerts</span>
                            <span className="text-[11px] text-slate-400">Immediate dispatch on CRITICAL SLA incidents</span>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600 rounded" />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800 block">Browser Push Notifications</span>
                            <span className="text-[11px] text-slate-400">Show desktop popups when a new ticket is assigned to me</span>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600 rounded" />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800 block">SMS Lab Alerts (Emergency Dispatch)</span>
                            <span className="text-[11px] text-slate-400">Receive SMS for cleanroom drive drops after hours</span>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600 rounded" />
                        </label>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setNotification("Notification channels saved successfully!");
                            setTimeout(() => setNotification(""), 3500);
                          }}
                          className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-500 transition shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 4: SECURITY */}
                  {settingsSubTab === "Security" && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-sm">Security &amp; Active Sessions</h3>
                        <p className="text-[11px] text-slate-400">Manage technician authentication credentials and session security.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            defaultValue="••••••••••••"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                          <input
                            type="password"
                            placeholder="Enter new strong password"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <div>
                            <span className="font-bold text-emerald-950 block">Hardware Token / 2FA Active</span>
                            <span className="text-[11px] text-emerald-700">Protected by SOC 2 Type II authentication policy</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          Active
                        </span>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setNotification("Technician security credentials updated!");
                            setTimeout(() => setNotification(""), 3500);
                          }}
                          className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-500 transition shadow-sm"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}</main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. LOGOUT CONFIRMATION MODAL (Matching Panel 13 Exactly) */}
      {/* ------------------------------------------------------------- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 text-2xl">
              🚪
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sign Out</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to sign out?
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("tdd_tech_user");
                  }
                  router.push("/technician/login");
                }}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/25"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Native File Input for Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
        aria-label="Upload ticket attachment"
      />
    </div>
  );
}
