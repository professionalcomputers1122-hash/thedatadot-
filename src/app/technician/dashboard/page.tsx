"use client";

import { useState, useEffect, useMemo } from "react";
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
      badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
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
      badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
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
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
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
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
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
    benchOptions: [
      "PC-3000 Bench 01 (Cleanroom Hood A)",
      "PC-3000 Flash & Portable III (NVMe / SSD Station)",
      "Forensic Hex Server Rack 04 (RAID Reconstruction)",
      "Soldering & Micro-inspection Station",
    ],
  };
}

export function getWorkbenchTopTelemetry(
  benchType: "ALL" | "Data Recovery" | "Managed IT" | "Cybersecurity" | "Cloud Solutions",
  allCases: CaseItem[]
): TopTelemetryCard[] {
  const currentCases =
    benchType === "ALL"
      ? allCases
      : allCases.filter((c) => (c.category || "Data Recovery") === benchType);

  if (benchType === "Data Recovery") {
    return [
      {
        label: "Cleanroom Media Queue",
        value: `${currentCases.length} Drives`,
        badge: "P1 Cleanroom",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "Cleanroom Pressure",
        value: "0.05 in. w.g.",
        badge: "ISO Class-5",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "PC-3000 Imager Stations",
        value: "3 Active",
        badge: "1 Standby",
        badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Verified Recovery Rate",
        value: "99.98%",
        badge: "30-Day SLA",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
    ];
  }

  if (benchType === "Managed IT") {
    return [
      {
        label: "Fleet Workstation Queue",
        value: `${currentCases.length} Units`,
        badge: "Active Triage",
        badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      },
      {
        label: "Hardware & OS Diagnostics",
        value: "99.4%",
        badge: "Kernel/OS Pass",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "Resolution Response SLA",
        value: "< 15-Min",
        badge: "Guaranteed",
        badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Deployment Drivers & Patches",
        value: "Verified",
        badge: "OEM Synced",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
    ];
  }

  if (benchType === "Cybersecurity") {
    return [
      {
        label: "Active Threat Incidents",
        value: `${currentCases.length} Breaches`,
        badge: "SOC Quarantined",
        badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      },
      {
        label: "Perimeter Isolation",
        value: "Zero-Trust",
        badge: "Enforced",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "SIEM Threat Severity",
        value: "P1 Critical",
        badge: "Defense Active",
        badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      },
      {
        label: "Mitigation SLA",
        value: "100%",
        badge: "Neutralized",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
    ];
  }

  if (benchType === "Cloud Solutions") {
    return [
      {
        label: "Active Cloud Migrations",
        value: `${currentCases.length} Tenants`,
        badge: "In Progress",
        badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      },
      {
        label: "Tenant Cluster Health",
        value: "Multi-Region",
        badge: "Redundant",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "Migration Throughput",
        value: "1.2 Gbps",
        badge: "Live Stream",
        badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Uptime Availability Target",
        value: "99.99%",
        badge: "SLA Active",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
    ];
  }

  // ALL Workbenches
  return [
    {
      label: "Master Engineering Queue",
      value: `${allCases.length} Cases`,
      badge: allCases.length > 0 ? "P1 Active" : "Operational",
      badgeColor:
        allCases.length > 0
          ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Technical Workbenches",
      value: "4 Online",
      badge: "Cleanroom / IT / SOC / Cloud",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "SLA Fulfillment Rate",
      value: "99.8%",
      badge: "Enterprise SLA",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Live Supabase Telemetry",
      value: "Connected",
      badge: "Real-Time Polling",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];
}

export const WORKBENCH_PODS = [
  {
    id: "ALL" as const,
    label: "All Workbenches",
    shortLabel: "All Workbenches",
    icon: "🌐",
    desc: "Global incident workbenches across all technical service divisions",
    stationType: "Cross-Discipline Multi-Bench",
    accentColor: "blue",
  },
  {
    id: "Data Recovery" as const,
    label: "Cleanroom Data Recovery Laboratory",
    shortLabel: "Data Recovery Lab",
    icon: "🔬",
    desc: "ISO Class-5 laminar flow, PC-3000 mirror extraction, donor heads & firmware rebuilds",
    stationType: "ISO Class-5 Laminar Hoods & PC-3000",
    accentColor: "emerald",
  },
  {
    id: "Managed IT" as const,
    label: "Enterprise IT & Fleet Systems Workbench",
    shortLabel: "IT Management Bench",
    icon: "💻",
    desc: "Hardware diagnostics, kernel repairs, Active Directory, OEM firmware & SLA field rollout",
    stationType: "Hardware Bench & Network Triage",
    accentColor: "amber",
  },
  {
    id: "Cybersecurity" as const,
    label: "SOC Threat Defense & Cyber Pod",
    shortLabel: "SOC Cyber Pod",
    icon: "🛡️",
    desc: "Perimeter quarantine, memory forensics, zero-trust containment & vector remediation",
    stationType: "Isolated SIEM Sandbox & Threat Pod",
    accentColor: "rose",
  },
  {
    id: "Cloud Solutions" as const,
    label: "Cloud DevOps & Infrastructure Terminal",
    shortLabel: "Cloud Terminal",
    icon: "☁️",
    desc: "Multi-region tenant provisioning, IAM security architecture, VPC peering & live migrations",
    stationType: "DevOps CI/CD & Cluster Terminal",
    accentColor: "sky",
  },
];

type PortalNavView =
  | "dashboard"
  | "my_tickets"
  | "assigned_to_me"
  | "unassigned"
  | "all_tickets"
  | "knowledge_base"
  | "reports"
  | "tools"
  | "profile"
  | "settings";

export default function TechnicianWorkbenchPage() {
  const router = useRouter();

  // Navigation View State
  const [activeView, setActiveView] = useState<PortalNavView>("dashboard");
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
  const itemsPerPage = 6;

  // Diagnostics & Command Center States
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<"controls" | "chat" | "telemetry">("controls");
  const [notification, setNotification] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editBench, setEditBench] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [replyText, setReplyText] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // User Profile Session
  const [techUser, setTechUser] = useState({
    name: "John Doe",
    email: "john@thedatadot.com",
    role: "Lead Systems Technician",
    station: "PC-3000 Bench 01",
    department: "IT Support & Forensics",
  });

  // Recent Activity Items
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, text: "You replied to TDD-1042", time: "2 hours ago", icon: "💬" },
    { id: 2, text: "TDD-1040 allocated to Fleet Support Bench", time: "3 hours ago", icon: "💻" },
    { id: 3, text: "Customer replied to TDD-1038", time: "5 hours ago", icon: "📨" },
    { id: 4, text: "TDD-1035 marked as Resolved", time: "1 day ago", icon: "✅" },
    { id: 5, text: "New ticket TDD-1045 synced from portal", time: "1 day ago", icon: "⚡" },
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

      const mapped: CaseItem[] = tickets.map((t: any) => {
        let mediaType: CaseItem["mediaType"] = "GENERAL";
        const devLower = (t.deviceOrSubject || "").toLowerCase();
        if (devLower.includes("ssd") || devLower.includes("nvme")) mediaType = "SSD";
        else if (devLower.includes("hdd") || devLower.includes("hard drive") || devLower.includes("barracuda") || devLower.includes("ironwolf")) mediaType = "HDD";
        else if (devLower.includes("raid") || devLower.includes("nas") || devLower.includes("synology")) mediaType = "RAID";
        else if (devLower.includes("flash") || devLower.includes("sd") || devLower.includes("usb")) mediaType = "FLASH";
        else if (devLower.includes("network") || devLower.includes("switch") || devLower.includes("cisco")) mediaType = "NETWORK";
        else if (devLower.includes("server") || devLower.includes("dell poweredge")) mediaType = "SERVER";

        return {
          id: t.id,
          client: t.companyName || t.customerName || "Enterprise Client",
          device: t.deviceOrSubject || "Diagnostic Hardware Asset",
          serial: t.serialNumber || `SN-${t.id}-TDD`,
          mediaType,
          category: t.category || "Data Recovery",
          status: t.status || "Open",
          progress: Number(t.clonedPercent) || 0,
          priority: t.priority === "CRITICAL" ? "CRITICAL" : t.priority === "HIGH" ? "HIGH" : "STANDARD",
          notes: t.techNotes || "",
          bench: t.assignedBench || "PC-3000 Bench 01",
          headsHealth: "100% OK",
          badSectorsRemapped: 0,
          temp: "28.4°C",
          leadTech: t.assignedTech || "Unassigned",
          updatedAt: t.updatedAt || "Just now",
          createdAt: t.createdAt || "Today",
        };
      });

      setCases(mapped);
      if (mapped.length > 0 && !selectedCaseId) {
        setSelectedCaseId(mapped[0].id);
        setEditStatus(mapped[0].status);
        setEditProgress(mapped[0].progress);
        setEditNotes(mapped[0].notes);
        setEditBench(mapped[0].bench);
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

  // Selected Active Case for Command Center
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
      setSelectedCaseId(match.id);
      setEditStatus(match.status);
      setEditProgress(match.progress);
      setEditNotes(match.notes);
      setEditBench(match.bench);
    }
  };

  // Case Selection
  const handleSelectCase = (c: CaseItem) => {
    setSelectedCaseId(c.id);
    setEditStatus(c.status);
    setEditProgress(c.progress);
    setEditNotes(c.notes);
    setEditBench(c.bench);
  };

  // Load Chat Messages for Active Case
  useEffect(() => {
    if (activeCase) {
      setEditStatus(activeCase.status);
      setEditProgress(activeCase.progress);
      setEditNotes(activeCase.notes);
      setEditBench(activeCase.bench);

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
  }, [selectedCaseId, activeCase?.id]);

  // Save Telemetry & Update to Supabase
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;

    const newStatus = editStatus || activeCase.status;
    const newProgress = editProgress !== undefined ? editProgress : activeCase.progress;
    const newNotes = editNotes !== undefined ? editNotes : activeCase.notes;
    const newBench = editBench || activeCase.bench;

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCaseId
          ? { ...c, status: newStatus, progress: newProgress, notes: newNotes, bench: newBench }
          : c
      )
    );

    setNotification(`Case #${selectedCaseId} saved! Station allocated to "${newBench}". Telemetry broadcasted.`);

    // Add to activity feed
    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `You updated #${selectedCaseId} to "${newStatus}"`,
        time: "Just now",
        icon: "⚡",
      },
      ...prev.slice(0, 4),
    ]);

    await updateTicketInSupabase(selectedCaseId, {
      status: newStatus,
      clonedPercent: newProgress,
      techNotes: newNotes,
      assignedBench: newBench,
    });

    try {
      await sendMessageToSupabase(
        selectedCaseId,
        "Technician",
        techUser.name,
        `Specialist Telemetry: Station "${newBench}" • Stage "${newStatus}" • Progress at ${newProgress}%. ${
          newNotes ? ` Notes: ${newNotes}` : ""
        }`
      );
    } catch (msgErr) {
      console.warn("Broadcast warning:", msgErr);
    }

    setTimeout(() => setNotification(""), 4500);
  };

  // Live Reply to Customer
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeCase) return;

    const messageText = replyText.trim();
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

    setReplyText("");
    setNotification(`Message sent to ${activeCase.client} and synced to ticket log.`);

    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `You sent a message on #${selectedCaseId}`,
        time: "Just now",
        icon: "💬",
      },
      ...prev.slice(0, 4),
    ]);

    await sendMessageToSupabase(selectedCaseId, "Technician", techUser.name, messageText);
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
          text: `You picked up ticket #${ticketId}`,
          time: "Just now",
          icon: "📥",
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

  // Category Configuration for Active Ticket
  const currentConfig = activeCase
    ? getCategoryConfig(
        activeCase.category,
        editStatus || activeCase.status,
        editProgress !== undefined ? editProgress : activeCase.progress,
        editBench || activeCase.bench
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
              ? "Awaiting workstation diagnostic report."
              : "Awaiting cleanroom intake analysis report.",
        },
      ]
    : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0f1d] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR NAVIGATION (Matching Panels 2 - 13) */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-800/80 bg-[#070c18] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* BRAND LOGO HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
            <Link href="/technician/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 text-white font-black text-base">
                •
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block">
                  The Data Dot
                </span>
                <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase block">
                  Technician Portal
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
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 text-xs">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Workbench Operations
            </div>

            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "my_tickets", label: "My Tickets", icon: "🎫" },
              { id: "assigned_to_me", label: "Assigned to Me", icon: "👤" },
              { id: "unassigned", label: "Unassigned Tickets", icon: "📥", badge: cases.filter((c) => !c.leadTech || c.leadTech === "Unassigned").length },
              { id: "all_tickets", label: "All Tickets", icon: "📑" },
              { id: "knowledge_base", label: "Knowledge Base", icon: "📚" },
              { id: "reports", label: "Reports & SLAs", icon: "📈" },
              { id: "tools", label: "Diagnostic Tools", icon: "🛠️" },
            ].map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as PortalNavView);
                    setSidebarOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                        isActive ? "bg-white text-blue-600" : "bg-blue-500/20 text-blue-300"
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
          <div className="border-t border-slate-800/60 p-4 space-y-1 text-xs bg-[#060a14]/70">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Account & System
            </div>

            <button
              onClick={() => {
                setActiveView("profile");
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium transition ${
                activeView === "profile"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <span className="text-sm">👤</span>
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                setActiveView("settings");
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium transition ${
                activeView === "settings"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <span className="text-sm">⚙️</span>
              <span>Settings</span>
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 font-medium text-rose-400 hover:bg-rose-500/10 transition"
            >
              <span className="text-sm">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN APPLICATION SHELL */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP HEADER BAR (Matching Mockup) */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#070c18]/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
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
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 text-xs">
            {/* Supabase Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Sync Active</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotification("Supabase telemetry & ticket stream updated!")}
                className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white transition"
              >
                <span>🔔</span>
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[#070c18]" />
              </button>
            </div>

            {/* Technician Profile Pill */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 pl-2 pr-3.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white text-xs shadow">
                {techUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <span className="font-bold text-white text-xs block leading-tight">
                  {techUser.name}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {techUser.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* TOAST NOTIFICATION */}
        {notification && (
          <div className="mx-6 mt-4 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/80 px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-lg animate-in fade-in">
            <span>✓ {notification}</span>
            <button
              onClick={() => setNotification("")}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. MAIN WORKSPACE CONTENT */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ========================================================= */}
          {/* VIEW A: MAIN DASHBOARD (Panel 2 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* WELCOME HEADER GREETING */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Good morning, {techUser.name.split(" ")[0]} 👋
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Here's what's happening with your technical tickets &amp; workbench today.
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-300 block">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Let's keep systems running smoothly.
                  </span>
                </div>
              </div>

              {/* 4 SUMMARY KPI CARDS (Matching Panel 2) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Open Tickets */}
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold text-lg">
                    {kpiStats.open}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">My Open Tickets</span>
                    <span className="text-[11px] text-emerald-400 font-mono">↑ 3 from last week</span>
                  </div>
                </div>

                {/* 2. Urgent Tickets */}
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold text-lg">
                    {kpiStats.urgent}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Urgent Tickets</span>
                    <span className="text-[11px] text-rose-400 font-mono">P1 Critical Queue</span>
                  </div>
                </div>

                {/* 3. Waiting for Customer / Bench */}
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-lg">
                    {kpiStats.waiting}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Waiting on Action</span>
                    <span className="text-[11px] text-slate-400 font-mono">Customer / Intake</span>
                  </div>
                </div>

                {/* 4. Resolved */}
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-lg">
                    {kpiStats.resolved}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Resolved This Month</span>
                    <span className="text-[11px] text-emerald-400 font-mono">↑ 12% resolution rate</span>
                  </div>
                </div>
              </div>

              {/* DEDICATED SERVICE WORKBENCH SWITCHER BAR */}
              <div className="rounded-2xl border border-slate-800/80 bg-[#0e1628] p-3 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span>Dedicated Service Workbenches</span>
                    <span className="text-[10px] font-normal font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      Multi-Pod Routing
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Showing: <strong className="text-blue-300">{selectedServiceBench}</strong>
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
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition text-left ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "bg-[#0a0f1d] text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{pod.icon}</span>
                          <span className="truncate">{pod.shortLabel}</span>
                        </div>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MAIN DUAL COLUMN LAYOUT: MY TICKETS TABLE (LEFT) + COMMAND CENTER & WIDGETS (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: MY TICKETS TABLE (7 COLS) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm space-y-4">
                    {/* CARD HEADER WITH STATUS TABS */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div>
                        <h2 className="text-base font-bold text-white">My Active Tickets</h2>
                        <p className="text-[11px] text-slate-400">
                          {viewFilteredCases.length} ticket{viewFilteredCases.length === 1 ? "" : "s"} found in current view
                        </p>
                      </div>

                      {/* STATUS TABS */}
                      <div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                        {(["Open", "Assigned", "Waiting", "Resolved", "ALL"] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              setTicketStatusTab(st);
                              setCurrentPage(1);
                            }}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                              ticketStatusTab === st
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FILTER & SEARCH ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <select
                        value={filterPriority}
                        onChange={(e) => {
                          setFilterPriority(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 outline-none focus:border-blue-500"
                      >
                        <option value="ALL">All Priorities</option>
                        <option value="CRITICAL">P1 - Critical</option>
                        <option value="HIGH">P2 - High</option>
                        <option value="STANDARD">P3 - Standard</option>
                      </select>

                      <select
                        value={filterCategory}
                        onChange={(e) => {
                          setFilterCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 outline-none focus:border-blue-500"
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
                        className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 outline-none focus:border-blue-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">Highest Priority</option>
                      </select>
                    </div>

                    {/* TICKETS TABLE (Matching Mockup #2) */}
                    {loading ? (
                      <div className="py-12 text-center text-xs text-slate-400 font-mono">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-2" />
                        <p>Syncing tickets with Supabase...</p>
                      </div>
                    ) : viewFilteredCases.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        <p className="text-lg mb-2">📋</p>
                        <p className="font-semibold text-slate-300">No tickets found in this view</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Try switching status tabs or resetting filters.
                        </p>
                        <button
                          onClick={() => {
                            setTicketStatusTab("ALL");
                            setFilterPriority("ALL");
                            setFilterCategory("ALL");
                            setSelectedServiceBench("ALL");
                          }}
                          className="mt-3 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-blue-400 hover:bg-slate-700"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <th className="pb-3 pr-2">#</th>
                              <th className="pb-3 pr-4">Title &amp; Device</th>
                              <th className="pb-3 pr-4">Customer</th>
                              <th className="pb-3 pr-4">Priority</th>
                              <th className="pb-3 pr-4">Status</th>
                              <th className="pb-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {paginatedCases.map((c) => {
                              const isSelected = c.id === activeCase?.id;
                              return (
                                <tr
                                  key={c.id}
                                  onClick={() => handleSelectCase(c)}
                                  className={`cursor-pointer transition ${
                                    isSelected
                                      ? "bg-blue-600/10 font-medium text-white"
                                      : "hover:bg-slate-900/60 text-slate-300"
                                  }`}
                                >
                                  <td className="py-3.5 pr-2 font-mono text-[11px] font-bold text-blue-400">
                                    #{c.id}
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <div className="font-bold text-white truncate max-w-[180px]">
                                      {c.device}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono truncate">
                                      {c.category} • {c.mediaType}
                                    </div>
                                  </td>
                                  <td className="py-3.5 pr-4 truncate max-w-[120px] text-slate-300 font-medium">
                                    {c.client}
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                        c.priority === "CRITICAL"
                                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                          : c.priority === "HIGH"
                                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                          : "bg-slate-800 text-slate-300"
                                      }`}
                                    >
                                      {c.priority === "CRITICAL" ? "Critical" : c.priority === "HIGH" ? "High" : "Standard"}
                                    </span>
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        c.status.toLowerCase().includes("resolved")
                                          ? "bg-emerald-500/15 text-emerald-300"
                                          : c.status.toLowerCase().includes("wait")
                                          ? "bg-amber-500/15 text-amber-300"
                                          : "bg-blue-500/15 text-blue-300"
                                      }`}
                                    >
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-right">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectCase(c);
                                      }}
                                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                        isSelected
                                          ? "bg-blue-600 text-white shadow-sm"
                                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                      }`}
                                    >
                                      {isSelected ? "Active" : "Inspect"}
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
                      <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
                        <span>
                          Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="rounded-lg border border-slate-800 px-2.5 py-1 disabled:opacity-40 hover:bg-slate-800 text-white"
                          >
                            ← Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                            <button
                              key={num}
                              onClick={() => setCurrentPage(num)}
                              className={`h-7 w-7 rounded-lg text-xs font-bold ${
                                currentPage === num
                                  ? "bg-blue-600 text-white"
                                  : "border border-slate-800 hover:bg-slate-800 text-slate-300"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="rounded-lg border border-slate-800 px-2.5 py-1 disabled:opacity-40 hover:bg-slate-800 text-white"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TIP OF THE DAY CARD (Matching Mockup #2) */}
                  <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-blue-900/20 p-4 text-xs shadow-sm flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <h4 className="font-bold text-blue-300">Tip of the Day</h4>
                      <p className="text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                        Remember to update the ticket stage and allocate physical station channels before transferring storage drives into ISO Class-5 laminar flow hoods or initiating PC-3000 mirror passes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT: DIAGNOSTIC COMMAND CENTER & ACTIVITY FEED (5 COLS) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* DIAGNOSTIC COMMAND CENTER FOR ACTIVE CASE */}
                  {activeCase ? (
                    <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-xl space-y-4">
                      {/* TARGET HEADER */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-blue-400">
                              #{activeCase.id}
                            </span>
                            {currentConfig && (
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ${currentConfig.badgeColor}`}
                              >
                                {activeCase.category}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1 truncate max-w-[220px]">
                            {activeCase.device}
                          </h3>
                          <p className="text-[11px] text-slate-400 truncate">
                            Client: <strong className="text-slate-200">{activeCase.client}</strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                            Allocated Station
                          </span>
                          <span className="text-xs font-bold font-mono text-blue-300">
                            {editBench || activeCase.bench}
                          </span>
                        </div>
                      </div>

                      {/* CATEGORY WORKFLOW STEPPER */}
                      {currentConfig && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {currentConfig.stepper.map((step, idx) => {
                            const isDone = step.state === "done";
                            const isActive = step.state === "active";
                            return (
                              <div
                                key={idx}
                                className={`p-2 rounded-xl border text-center transition ${
                                  isDone
                                    ? "border-emerald-500/30 bg-emerald-500/10"
                                    : isActive
                                    ? "border-blue-500/40 bg-blue-500/15 ring-1 ring-blue-400/30"
                                    : "border-slate-800 bg-slate-950/40 opacity-60"
                                }`}
                              >
                                <span
                                  className={`text-[11px] font-bold block truncate ${
                                    isDone
                                      ? "text-emerald-300"
                                      : isActive
                                      ? "text-blue-300"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {step.title}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 block mt-0.5 truncate">
                                  {step.description}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* TABS */}
                      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveWorkbenchTab("controls")}
                          className={`rounded-lg py-1.5 font-semibold transition ${
                            activeWorkbenchTab === "controls"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Protocol
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveWorkbenchTab("chat")}
                          className={`rounded-lg py-1.5 font-semibold transition ${
                            activeWorkbenchTab === "chat"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Live Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveWorkbenchTab("telemetry")}
                          className={`rounded-lg py-1.5 font-semibold transition ${
                            activeWorkbenchTab === "telemetry"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Telemetry
                        </button>
                      </div>

                      {/* TAB 1: PROTOCOL CONTROLS */}
                      {activeWorkbenchTab === "controls" && currentConfig && (
                        <form onSubmit={handleSaveUpdate} className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-300 mb-1">
                              {currentConfig.protocolLabel}:
                            </label>
                            <select
                              value={editStatus || activeCase.status}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-blue-500 font-medium text-xs"
                            >
                              {availableStages.map((st) => (
                                <option key={st.value} value={st.value}>
                                  {st.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-300 mb-1">
                              Allocated Station / Pod:
                            </label>
                            <select
                              value={editBench || activeCase.bench}
                              onChange={(e) => setEditBench(e.target.value)}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-blue-500 font-medium text-xs"
                            >
                              {currentConfig.benchOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                              {editBench && !currentConfig.benchOptions.includes(editBench) && (
                                <option value={editBench}>{editBench}</option>
                              )}
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-semibold text-slate-300 text-[11px]">
                                {currentConfig.progressLabel}
                              </label>
                              <span className="text-xs font-mono font-bold text-emerald-400">
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
                              className="w-full h-1.5 rounded-lg bg-slate-800 accent-blue-500 cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-300 mb-1 text-[11px]">
                              {currentConfig.notesLabel}
                            </label>
                            <textarea
                              rows={2}
                              value={editNotes !== undefined ? editNotes : activeCase.notes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder={currentConfig.notesPlaceholder}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-200 outline-none font-mono text-[11px] focus:border-blue-500"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition"
                          >
                            Broadcast Telemetry to Portal →
                          </button>
                        </form>
                      )}

                      {/* TAB 2: LIVE CHAT */}
                      {activeWorkbenchTab === "chat" && (
                        <div className="space-y-3 text-xs">
                          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 max-h-56 overflow-y-auto space-y-2.5">
                            {currentMessages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl max-w-[90%] text-[11px] ${
                                  msg.sender === "Technician"
                                    ? "ml-auto bg-blue-600/20 border border-blue-500/30 text-white"
                                    : "bg-slate-900 border border-slate-800 text-slate-200"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-0.5 text-[9px]">
                                  <span className="font-bold text-blue-300">{msg.author}</span>
                                  <span className="text-slate-500">{msg.time}</span>
                                </div>
                                <p className="leading-relaxed">{msg.text}</p>
                              </div>
                            ))}
                          </div>

                          <form onSubmit={handleSendReply} className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type lab message to client..."
                              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 outline-none text-xs focus:border-blue-500"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 text-xs shadow-sm"
                            >
                              Send
                            </button>
                          </form>
                        </div>
                      )}

                      {/* TAB 3: TELEMETRY */}
                      {activeWorkbenchTab === "telemetry" && currentConfig && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            {currentConfig.telemetryCards.map((card, idx) => (
                              <div
                                key={idx}
                                className="rounded-xl border border-slate-800 bg-slate-950 p-3"
                              >
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                  {card.label}
                                </span>
                                <span
                                  className={`text-xs font-bold mt-0.5 block ${
                                    card.color || "text-emerald-400"
                                  }`}
                                >
                                  {card.value}
                                </span>
                              </div>
                            ))}
                          </div>
                          <Link
                            href={`/technician/tickets/${activeCase.id}`}
                            className="block text-center rounded-xl border border-slate-800 bg-slate-900 py-2 text-xs font-semibold text-blue-400 hover:text-white transition"
                          >
                            Open Detailed Incident Page →
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* RECENT ACTIVITY CARD (Matching Mockup #2) */}
                  <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Recent Activity
                      </h3>
                      <button
                        onClick={() => setNotification("Activity log refreshed from Supabase.")}
                        className="text-[11px] text-blue-400 hover:underline"
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {activityFeed.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2.5 text-xs text-slate-300"
                        >
                          <span className="text-sm">{item.icon}</span>
                          <div className="flex-1 leading-snug">
                            <p className="text-[11px] font-medium text-slate-200">{item.text}</p>
                            <span className="text-[10px] text-slate-500">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW B: MY TICKETS / ASSIGNED / UNASSIGNED / ALL TICKETS */}
          {/* (Matching Panels 3, 4, 5, 6 in Mockup) */}
          {/* ========================================================= */}
          {(activeView === "my_tickets" ||
            activeView === "assigned_to_me" ||
            activeView === "unassigned" ||
            activeView === "all_tickets") && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    {activeView === "my_tickets"
                      ? "My Tickets"
                      : activeView === "assigned_to_me"
                      ? "Assigned to Me"
                      : activeView === "unassigned"
                      ? "Unassigned Tickets"
                      : "All Tickets"}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeView === "unassigned"
                      ? "Pick up and claim unassigned customer tickets for technical triage."
                      : "View and manage active engineering tickets across all workbenches."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm space-y-4">
                {/* STATUS TABS */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                    {(["ALL", "Open", "Assigned", "Waiting", "Resolved"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setTicketStatusTab(st);
                          setCurrentPage(1);
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          ticketStatusTab === st
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {viewFilteredCases.length} total tickets in this view
                  </span>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pr-2">#</th>
                        <th className="pb-3 pr-4">Title</th>
                        <th className="pb-3 pr-4">Customer</th>
                        <th className="pb-3 pr-4">Priority</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Assigned Tech</th>
                        <th className="pb-3 pr-4">Station</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {paginatedCases.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/60 text-slate-300">
                          <td className="py-3.5 pr-2 font-mono text-[11px] font-bold text-blue-400">
                            #{c.id}
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="font-bold text-white">{c.device}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {c.category} • {c.mediaType}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 text-slate-200">{c.client}</td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                c.priority === "CRITICAL"
                                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                  : c.priority === "HIGH"
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {c.priority}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                c.status.toLowerCase().includes("resolved")
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-blue-500/15 text-blue-300"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-slate-300 font-mono text-[11px]">
                            {c.leadTech || "Unassigned"}
                          </td>
                          <td className="py-3.5 pr-4 text-slate-400 font-mono text-[11px]">
                            {c.bench}
                          </td>
                          <td className="py-3.5 text-right">
                            {activeView === "unassigned" ? (
                              <button
                                disabled={assigningId === c.id}
                                onClick={() => handleAssignToMe(c.id)}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition shadow-sm"
                              >
                                {assigningId === c.id ? "Assigning..." : "Assign"}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleSelectCase(c);
                                  setActiveView("dashboard");
                                }}
                                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-slate-700 hover:text-white transition"
                              >
                                Open Workbench
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="rounded-lg border border-slate-800 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-800 text-white"
                      >
                        ← Prev
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-lg border border-slate-800 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-800 text-white"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW C: KNOWLEDGE BASE (Panel 8 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "knowledge_base" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Knowledge Base</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Find answers and engineering protocols to diagnose and resolve tickets faster.
                </p>
              </div>

              {/* CATEGORY GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Microsoft 365 Setup", desc: "Exchange, Outlook, SharePoint & Tenant Sync", count: "12 articles", icon: "🌐" },
                  { title: "Email Troubleshooting", desc: "IMAP, POP, DNS MX Records, DKIM & SPF", count: "8 articles", icon: "✉️" },
                  { title: "Cleanroom Data Recovery", desc: "PC-3000 mirror imaging, head swaps & firmware reconstruction", count: "15 articles", icon: "🔬" },
                  { title: "Network & Firewalls", desc: "VLAN routing, IPSec tunnels, Wi-Fi 6 & zero-trust", count: "10 articles", icon: "🔌" },
                  { title: "Workstation Fleet Hardware", desc: "Motherboard repair, RAM testing, NVMe firmware updates", count: "6 articles", icon: "💻" },
                  { title: "Security & Threat Containment", desc: "Ransomware quarantine, memory dumps, SIEM rules", count: "9 articles", icon: "🛡️" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm hover:border-blue-500/50 hover:bg-slate-900 transition cursor-pointer"
                  >
                    <span className="text-2xl mb-3 block">{item.icon}</span>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    <span className="text-[11px] font-mono text-blue-400 mt-3 block font-bold">
                      {item.count} →
                    </span>
                  </div>
                ))}
              </div>

              {/* RECENT ARTICLES */}
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-3">
                  Recent Engineering Articles
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { title: "How to mirror Seagate Barracuda drives with weak heads on PC-3000", date: "2 days ago", views: "142 views" },
                    { title: "Resolving Outlook connectivity drops under Windows 11 24H2 Active Directory", date: "4 days ago", views: "98 views" },
                    { title: "Isolating infected lateral movement endpoints using Zero-Trust VLAN quarantine", date: "1 week ago", views: "210 views" },
                  ].map((art, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700"
                    >
                      <span className="font-semibold text-slate-200">{art.title}</span>
                      <span className="text-[11px] text-slate-500 font-mono shrink-0 ml-4">{art.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW D: REPORTS & METRICS (Panel 9 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "reports" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Technical Reports</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track workbench performance, SLA response times, and division throughput.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300 font-mono">
                  Reporting Period: Last 30 Days
                </div>
              </div>

              {/* 4 METRIC TILES (Matching Mockup #9) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Total Tickets</span>
                  <div className="text-2xl font-black text-white mt-1">48</div>
                  <span className="text-[11px] text-emerald-400 font-mono">↑ 12% vs last month</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Resolved Tickets</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">28</div>
                  <span className="text-[11px] text-emerald-400 font-mono">↑ 18% completion</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Avg. Response Time</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">2.4 hrs</div>
                  <span className="text-[11px] text-blue-400 font-mono">↓ 26% faster SLA</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Avg. Resolve Time</span>
                  <div className="text-2xl font-black text-indigo-400 mt-1">6.8 hrs</div>
                  <span className="text-[11px] text-emerald-400 font-mono">↑ 15% efficiency</span>
                </div>
              </div>

              {/* CHARTS ROW (Matching Mockup #9) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tickets by Status */}
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-white">Tickets by Status</h3>
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-4">
                    {/* Radial Donut Representation */}
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-blue-500 border-t-emerald-500 border-r-amber-500 border-b-rose-500">
                      <div className="text-center">
                        <span className="text-2xl font-black text-white block">48</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Total</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-slate-300">Open Tickets: <strong>12</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-slate-300">In Progress: <strong>6</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-rose-500" />
                        <span className="text-slate-300">Waiting on Customer: <strong>2</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-300">Resolved &amp; Closed: <strong>28</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tickets by Priority */}
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-white">Tickets by Priority</h3>
                  <div className="flex items-end justify-between gap-4 h-44 pt-6 px-4">
                    {[
                      { label: "Urgent (P1)", count: 4, height: "40%", color: "bg-rose-500" },
                      { label: "High (P2)", count: 14, height: "75%", color: "bg-amber-500" },
                      { label: "Medium", count: 18, height: "90%", color: "bg-blue-500" },
                      { label: "Low", count: 12, height: "60%", color: "bg-emerald-500" },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                        <span className="text-xs font-bold font-mono text-white">{bar.count}</span>
                        <div
                          className={`w-full rounded-t-xl ${bar.color} transition-all duration-500`}
                          style={{ height: bar.height }}
                        />
                        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[70px] text-center">
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
          {/* VIEW E: DIAGNOSTIC TOOLS (Panel 10 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "tools" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Diagnostic Tools</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Quick access to certified diagnostic utilities, recovery imagers, and security testers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Remote Support", desc: "Launch secure remote technician session", icon: "🖥️", action: "Launch Session" },
                  { title: "Password Generator", desc: "Generate secure cryptographic passwords", icon: "🔐", action: "Open Tool" },
                  { title: "IP & DNS Lookup", desc: "Check IP address details and MX records", icon: "🌐", action: "Run Lookup" },
                  { title: "System Info Audit", desc: "Scan workstation hardware specs and kernel", icon: "⚙️", action: "Scan Asset" },
                ].map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm space-y-3"
                  >
                    <span className="text-2xl block">{t.icon}</span>
                    <h3 className="font-bold text-white text-sm">{t.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                    <button
                      onClick={() => setNotification(`Tool "${t.title}" activated.`)}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 py-2 text-xs font-bold text-blue-400 hover:bg-slate-800 hover:text-white transition"
                    >
                      {t.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW F: PROFILE (Panel 11 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "profile" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your technician credentials and workbench station assignment.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xl shadow-lg">
                    {techUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{techUser.name}</h3>
                    <p className="text-xs text-blue-400 font-mono">{techUser.role}</p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{techUser.email}</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={techUser.name}
                      onChange={(e) => setTechUser({ ...techUser, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={techUser.email}
                      onChange={(e) => setTechUser({ ...techUser, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={techUser.department}
                      onChange={(e) => setTechUser({ ...techUser, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Allocated Station Channel</label>
                    <input
                      type="text"
                      value={techUser.station}
                      onChange={(e) => setTechUser({ ...techUser, station: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("tdd_tech_user", JSON.stringify(techUser));
                      }
                      setNotification("Profile details saved successfully.");
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
          {/* VIEW G: SETTINGS (Panel 12 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "settings" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your workbench preferences and notifications.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-sm space-y-5 text-xs">
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Time Zone</label>
                    <select className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none">
                      <option>(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                      <option>(UTC+00:00) London, Dublin, Edinburgh</option>
                      <option>(UTC-05:00) Eastern Time (US &amp; Canada)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Language</label>
                    <select className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none">
                      <option>English (UK)</option>
                      <option>English (US)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Default Ticket View</label>
                    <select className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none">
                      <option>My Tickets</option>
                      <option>All Tickets</option>
                      <option>Unassigned Tickets</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Email Notifications</span>
                        <span className="text-[11px] text-slate-400">Receive email alerts for new critical ticket allocations</span>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600 rounded cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Browser Push Notifications</span>
                        <span className="text-[11px] text-slate-400">Show desktop notifications for customer replies</span>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600 rounded cursor-pointer" />
                    </div>
                  </div>

                  <button
                    onClick={() => setNotification("Preferences saved successfully.")}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-500 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. LOGOUT CONFIRMATION MODAL (Matching Panel 13) */}
      {/* ------------------------------------------------------------- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[#0f172a] p-6 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-2xl">
              🚪
            </div>
            <h3 className="text-lg font-bold text-white">Sign Out</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to sign out from your technical workbench session?
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("tdd_tech_user");
                  }
                  router.push("/technician/login");
                }}
                className="rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/30"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
