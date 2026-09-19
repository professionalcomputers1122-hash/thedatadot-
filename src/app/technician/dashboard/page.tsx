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
import AdvancedDataRecoveryReportModal, {
  AdvancedReportData,
} from "@/components/AdvancedDataRecoveryReportModal";
import {
  fetchReportsFromSupabase,
  deleteReportFromSupabase,
  DiagnosisReport,
} from "@/lib/reportData";

export interface CaseItem {
  id: string;
  client: string;
  company?: string;
  customerName?: string;
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
  symptoms?: string;
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

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  updated: string;
  summary: string;
  steps: string[];
  codeSnippet?: string;
}

export const KNOWLEDGE_BASE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "kb-001",
    title: "How to reset a user's Microsoft 365 password",
    category: "Microsoft 365 Setup",
    readTime: "3 min read",
    updated: "2 days ago",
    summary: "Standard procedure to reset user passwords, invalidate active refresh tokens, and enforce MFA change upon next sign-in.",
    steps: [
      "Navigate to Microsoft 365 Admin Center (admin.microsoft.com) -> Users -> Active users.",
      "Search for the user account and select 'Reset password' in the top action ribbon.",
      "Check 'Automatically create a password' or enter a strong 16-character temporary password.",
      "Ensure 'Require this user to change their password when they first sign in' is checked.",
      "Click 'Reset password' and securely dispatch credentials to user via authorized channel."
    ],
    codeSnippet: "# PowerShell automated reset with Microsoft.Graph:\nUpdate-MgUserPassword -UserId 'user@clientdomain.com' -Password 'TempPass!9842#X' -ForceChangePasswordNextSignIn $true",
  },
  {
    id: "kb-002",
    title: "Fix Outlook stuck on 'Trying to connect'",
    category: "Email Troubleshooting",
    readTime: "4 min read",
    updated: "4 days ago",
    summary: "Resolve Outlook connectivity lockups caused by credential manager corruption, modern authentication timeout, or TCP port blockages.",
    steps: [
      "Open Windows Credential Manager -> Windows Credentials -> Remove all generic credentials starting with 'MicrosoftOffice16_Data'.",
      "Verify connectivity to 'outlook.office365.com' on port 443 via Test-NetConnection.",
      "Start Outlook in Safe Mode: press Win+R and type 'outlook.exe /safe'.",
      "Disable third-party COM Add-ins (File -> Options -> Add-ins -> COM Add-ins -> Go).",
      "Re-launch Outlook normally; prompt for Modern Authentication will re-negotiate OAuth2 tokens."
    ],
    codeSnippet: "Test-NetConnection -ComputerName outlook.office365.com -Port 443\ncmdkey /list | Select-String 'MicrosoftOffice'",
  },
  {
    id: "kb-003",
    title: "Add a shared mailbox in Outlook",
    category: "Microsoft 365 Setup",
    readTime: "2 min read",
    updated: "1 week ago",
    summary: "Add delegated shared mailboxes to desktop Outlook when automapping has not yet completed or was disabled by policy.",
    steps: [
      "In Outlook, navigate to File -> Account Settings -> Account Settings.",
      "Select the user's primary Microsoft 365 Exchange account -> click 'Change'.",
      "Click 'More Settings' -> Advanced tab -> click 'Add...'.",
      "Type the email alias or display name of the Shared Mailbox -> click OK.",
      "Click Apply -> OK -> Restart Outlook to begin caching mailbox items."
    ],
  },
  {
    id: "kb-004",
    title: "Troubleshoot Windows 11 BSOD & Inaccessible Boot Device",
    category: "Windows Support",
    readTime: "6 min read",
    updated: "3 days ago",
    summary: "Step-by-step forensic triage for 0x0000007B INACCESSIBLE_BOOT_DEVICE caused by VMD / RST driver discrepancies or corrupted BCD store.",
    steps: [
      "Boot workstation into Windows Recovery Environment (WinRE) Command Prompt.",
      "Run diskpart -> 'list disk' and 'list volume' to confirm partition layout and bitlocker state.",
      "Inspect storage controller in BIOS/UEFI: check whether mode is Intel VMD / RST vs AHCI / NVMe.",
      "Rebuild EFI bootloader: bcdboot C:\\Windows /s S: /f UEFI (where S: is EFI system partition).",
      "Execute disk check for pending bad blocks: chkdsk C: /f /r."
    ],
    codeSnippet: "diskpart\nlist volume\nbootrec /fixboot\nbcdboot C:\\Windows /s S: /f UEFI",
  },
  {
    id: "kb-005",
    title: "Flush DNS cache and release/renew DHCP lease via PowerShell",
    category: "Network & Internet",
    readTime: "2 min read",
    updated: "5 days ago",
    summary: "Standard lab networking troubleshooting to resolve DNS poisoning, IP collisions, and gateway reachability issues.",
    steps: [
      "Open PowerShell as Administrator.",
      "Flush client DNS cache to force fresh resolution against upstream servers.",
      "Release DHCP lease to unbind current IP configuration.",
      "Renew DHCP lease from local lab router / domain controller.",
      "Verify gateway round-trip time and packet loss."
    ],
    codeSnippet: "Clear-DnsClientCache\nRelease-NetIPAddress -InterfaceAlias 'Ethernet'\nRenew-NetIPAddress -InterfaceAlias 'Ethernet'\nTest-Connection -ComputerName 8.8.8.8 -Count 4",
  },
  {
    id: "kb-006",
    title: "Clear print spooler stuck queue & restart Print Spooler service",
    category: "Printer Support",
    readTime: "3 min read",
    updated: "6 days ago",
    summary: "Fix stuck network or local printer queues where jobs refuse to delete or block subsequent print orders.",
    steps: [
      "Stop the Windows Print Spooler service.",
      "Purge all orphaned .SHD and .SPL files in the PRINTERS system spool directory.",
      "Restart Print Spooler service with clean queue.",
      "Send a standard diagnostic test page to verify communication with network printer IP."
    ],
    codeSnippet: "Stop-Service -Name Spooler -Force\nRemove-Item -Path $env:SystemRoot\\System32\\spool\\PRINTERS\\* -Force\nStart-Service -Name Spooler",
  },
  {
    id: "kb-007",
    title: "Enforce MFA registration and reset Microsoft Authenticator session",
    category: "Security & MFA",
    readTime: "4 min read",
    updated: "1 week ago",
    summary: "Reset multi-factor authentication methods when user switches mobile devices or gets locked out of Microsoft Authenticator push prompts.",
    steps: [
      "Sign in to Microsoft Entra admin center (entra.microsoft.com) -> Users -> All users.",
      "Select user -> Authentication methods ribbon.",
      "Click 'Require re-register multifactor authentication'.",
      "Revoke active MFA sessions to invalidate existing push tokens immediately.",
      "Instruct user to visit aka.ms/mfasetup to scan the new QR code with Microsoft Authenticator."
    ],
    codeSnippet: "# Revoke sign-in sessions with Azure AD PowerShell:\nRevoke-MgUserSignInSession -UserId 'user@clientdomain.com'",
  },
];

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
        { value: "Threat Intake", label: "1. Threat Intake (Perimeter Isolation)" },
        { value: "Security Forensics", label: "2. Security Forensics (Vector Analysis)" },
        { value: "Containment & Remediation", label: "3. Containment & Remediation" },
        { value: "Policy Hardening", label: "4. Policy Hardening (Mitigated / Resolved)" },
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
        { value: "Scope Intake", label: "1. Scope Intake (Tenant Specifications)" },
        { value: "Cloud Architecture", label: "2. Cloud Architecture (IAM & Network Planning)" },
        { value: "Deployment & Migration", label: "3. Deployment & Cloud Asset Migration" },
        { value: "Handover & Audit", label: "4. Handover & Audit (Active / Resolved)" },
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
        { value: "Ticket Intake", label: "1. Ticket Intake (Equipment Issue Registered)" },
        { value: "Technical Assessment", label: "2. Technical Assessment (Diagnostics)" },
        { value: "Resolution & Rollout", label: "3. Resolution & Rollout (System Patching)" },
        { value: "Quality Verification", label: "4. Quality Verification (Operational / Resolved)" },
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
  const isStage4 = isResolved || norm.includes("verif") || norm.includes("tree") || norm.includes("return") || norm.includes("file system");
  const isStage3 = isStage4 || norm.includes("pc-3000") || norm.includes("mirror") || norm.includes("translator") || norm.includes("imaging") || norm.includes("clon");
  const isStage2 = isStage3 || norm.includes("cleanroom") || norm.includes("diagnos");

  const s1State: "done" | "active" | "pending" = isResolved || isStage2 ? "done" : "active";
  const s2State: "done" | "active" | "pending" = isResolved || isStage3 ? "done" : isStage2 ? "active" : "pending";
  const s3State: "done" | "active" | "pending" = isResolved || isStage4 ? "done" : isStage3 ? "active" : "pending";
  const s4State: "done" | "active" | "pending" = isResolved ? "done" : isStage4 ? "active" : "pending";

  const stepper: TimelineStage[] = [
    { title: "Media Intake", description: "Cleanroom Barcode Intake", state: s1State },
    { title: "Cleanroom Diagnostics", description: "ISO Class-5 Inspection", state: s2State },
    { title: "PC-3000 Imaging", description: "Raw Platter Sector Mirror", state: s3State },
    { title: "Verification & Return", description: isResolved ? "Data Recovered" : "File Tree Audit & Delivery", state: s4State },
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
      { value: "Media Intake", label: "1. Media Intake (Cleanroom Barcode Intake)" },
      { value: "Cleanroom Diagnostics", label: "2. Cleanroom Diagnostics (ISO Class-5 Inspection)" },
      { value: "PC-3000 Imaging", label: "3. PC-3000 Imaging (Raw Platter Sector Mirror)" },
      { value: "Verification & Return", label: "4. Verification & Return (Data Recovered / Handover)" },
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
  | "diagnosis_report"
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalInitialData, setReportModalInitialData] = useState<Partial<AdvancedReportData> | undefined>(undefined);

  // Diagnosis Reports State (Supabase Connected)
  const [diagnosisReports, setDiagnosisReports] = useState<DiagnosisReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("ALL");
  const [reportToDelete, setReportToDelete] = useState<DiagnosisReport | null>(null);
  const [isDeletingReport, setIsDeletingReport] = useState(false);

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

  // New Ticket Creation State for Technicians
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    customerName: "",
    customerEmail: "",
    companyName: "",
    deviceOrSubject: "",
    category: "Data Recovery",
    mediaType: "HDD" as CaseItem["mediaType"],
    serialNumber: "",
    urgency: "Standard" as "Standard" | "High" | "Critical",
    assignedBench: "Forensic Platter Pod 1",
    assignedTech: "Sanjay Vignesh",
    status: "Intake & Diagnostics",
    symptoms: "",
  });

  // Tools Modal State
  const [activeToolModal, setActiveToolModal] = useState<"remote" | "password" | "ip" | "system" | null>(null);
  const [remoteSessionCode, setRemoteSessionCode] = useState("839-214");
  const [remoteCopied, setRemoteCopied] = useState(false);
  const [pwdLength, setPwdLength] = useState(16);
  const [pwdIncludeUpper, setPwdIncludeUpper] = useState(true);
  const [pwdIncludeNumbers, setPwdIncludeNumbers] = useState(true);
  const [pwdIncludeSymbols, setPwdIncludeSymbols] = useState(true);
  const [generatedPwd, setGeneratedPwd] = useState("");
  const [pwdCopied, setPwdCopied] = useState(false);
  const [ipInput, setIpInput] = useState("103.145.72.18");
  const [isPinging, setIsPinging] = useState(false);
  const [ipLookupResult, setIpLookupResult] = useState<any>({
    ip: "103.145.72.18",
    hostname: "client-gw.chennai.airtel.in",
    location: "Chennai, Tamil Nadu, IN",
    isp: "Bharti Airtel Ltd - Enterprise Fiber",
    latency: "14 ms",
    dnsStatus: "Healthy (Resolved via 1.1.1.1)",
  });
  const [systemInfoData, setSystemInfoData] = useState<any>(null);

  // Knowledge Base State
  const [kbSearchQuery, setKbSearchQuery] = useState("");
  const [selectedKbCategory, setSelectedKbCategory] = useState<string | null>(null);
  const [selectedKbArticle, setSelectedKbArticle] = useState<KnowledgeArticle | null>(null);
  const [showAllKbArticles, setShowAllKbArticles] = useState(false);

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
          company: t.companyName || t.customerName || "The Data Dot Client",
          customerName: t.customerName || t.companyName || "Client Custodian",
          device: t.deviceOrSubject || "Storage Drive / Forensic Subject",
          serial: t.serialNumber || `SN-${t.id}-TDD`,
          mediaType,
          category: t.category || "Data Recovery",
          status: override?.status || t.status || "Open",
          progress: override?.progress !== undefined ? override.progress : (Number(t.clonedPercent) || 0),
          priority: override?.priority || (t.priority === "CRITICAL" ? "CRITICAL" : t.priority === "HIGH" ? "HIGH" : "STANDARD"),
          notes: override?.notes !== undefined ? override.notes : (t.techNotes || ""),
          bench: override?.bench || t.assignedBench || "ISO Class-5 Cleanroom Station 01",
          headsHealth: t.headsHealth || "100% OK",
          badSectorsRemapped: t.badSectorsRemapped || 0,
          temp: t.temp || "28.4°C",
          leadTech: t.assignedTech || "Unassigned",
          updatedAt: override?.updatedAt || t.updatedAt || "2 hours ago",
          createdAt: t.createdAt || "Today",
          symptoms: t.symptoms || t.deviceOrSubject || "Cleanroom diagnostic assessment required",
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

  // Load Diagnosis Reports from Supabase
  const loadReportsFromSupabase = async () => {
    try {
      const data = await fetchReportsFromSupabase();
      if (data) {
        setDiagnosisReports(data);
      }
    } catch (err) {
      console.warn("Failed to fetch reports:", err);
    }
  };

  useEffect(() => {
    loadReportsFromSupabase();
    const handleRepUpdate = () => loadReportsFromSupabase();
    window.addEventListener("reports-updated", handleRepUpdate);
    return () => window.removeEventListener("reports-updated", handleRepUpdate);
  }, []);

  const handleDeleteReport = async (reportId: string) => {
    setIsDeletingReport(true);
    try {
      const cleanId = reportId.trim();
      const rawId = cleanId.replace(/^DR-/i, "").replace(/^RPT-/i, "");
      await deleteReportFromSupabase(cleanId);
      setDiagnosisReports((prev) =>
        prev.filter((r) => {
          const rId = (r.id || "").toLowerCase();
          const rJob = (r.jobId || "").toLowerCase();
          return (
            rId !== cleanId.toLowerCase() &&
            rId !== rawId.toLowerCase() &&
            rId !== `dr-${rawId}`.toLowerCase() &&
            rJob !== cleanId.toLowerCase() &&
            rJob !== rawId.toLowerCase()
          );
        })
      );
      setNotification("Diagnosis report deleted permanently from Supabase.");
      setTimeout(() => setNotification(""), 3500);
      setReportToDelete(null);
    } catch (err) {
      console.error("Delete report error:", err);
      setNotification("Failed to delete report.");
      setTimeout(() => setNotification(""), 3500);
    } finally {
      setIsDeletingReport(false);
    }
  };

  const filteredDiagnosisReports = useMemo(() => {
    let list = [...diagnosisReports];
    if (reportStatusFilter !== "ALL") {
      list = list.filter((r) => r.recoveryStatus.toLowerCase().includes(reportStatusFilter.toLowerCase()));
    }
    if (reportSearchQuery.trim()) {
      const q = reportSearchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.jobId.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.serialNumber.toLowerCase().includes(q) ||
          r.brand.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.diagnosis.toLowerCase().includes(q)
      );
    }
    return list;
  }, [diagnosisReports, reportStatusFilter, reportSearchQuery]);

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

  // Open Advanced Diagnostic Report Generator Modal (100% separate client report)
  const handleOpenReportModal = (targetReport?: DiagnosisReport) => {
    if (targetReport) {
      setReportModalInitialData(targetReport);
    } else {
      // New fresh report for client
      const nextId = `${2000 + diagnosisReports.length + 1}`;
      setReportModalInitialData({
        jobId: nextId,
        clientName: "",
        serialNumber: "",
        brand: "Seagate",
        model: "Barracuda",
        deviceType: "HDD",
        capacity: "1TB",
        iface: "SATA",
        fileSystem: "NTFS",
        diagnosis: "Head failure",
        symptoms: "Clicking sound, drive not detecting",
      });
    }
    setIsReportModalOpen(true);
  };

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

      // Load attachments for active case (empty by default - no automatic dummy reports)
      if (typeof window !== "undefined") {
        try {
          const storedAtts = localStorage.getItem(`tdd_attachments_${activeCase.id}`);
          if (storedAtts) {
            const parsed = JSON.parse(storedAtts);
            const filtered = Array.isArray(parsed)
              ? parsed.filter(
                  (a: any) =>
                    a &&
                    !a.name?.toLowerCase().includes("diagnostic_telemetry") &&
                    !a.name?.toLowerCase().includes("telemetry.pdf") &&
                    !a.uploadedBy?.toLowerCase().includes("lab diagnostics hub")
                )
              : [];
            if (Array.isArray(parsed) && filtered.length !== parsed.length) {
              const json = JSON.stringify(filtered);
              localStorage.setItem(`tdd_attachments_${activeCase.id}`, json);
              localStorage.setItem(`tdd_attachments_${activeCase.id.toUpperCase()}`, json);
              localStorage.setItem(`tdd_attachments_${activeCase.id.toLowerCase()}`, json);
            }
            setAttachments((prev) => ({
              ...prev,
              [activeCase.id]: filtered,
            }));
          } else {
            setAttachments((prev) => ({
              ...prev,
              [activeCase.id]: [],
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
    const currentStation = editBench || activeCase.bench;

    // Automatic progress calculation based on the 4 stages for DB compatibility
    let autoProgress = 25;
    const norm = newStatus.toLowerCase();
    if (norm.includes("resolved") || norm.includes("closed") || norm.includes("completed") || (norm.includes("return") && norm.includes("resolved"))) {
      autoProgress = 100;
    } else if (norm.includes("return") || norm.includes("verification") || norm.includes("hardening") || norm.includes("audit") || norm.includes("handover")) {
      autoProgress = 95;
    } else if (norm.includes("pc-3000") || norm.includes("imaging") || norm.includes("containment") || norm.includes("remediation") || norm.includes("deployment") || norm.includes("migration") || norm.includes("rollout") || norm.includes("repair")) {
      autoProgress = 75;
    } else if (norm.includes("cleanroom") || norm.includes("diagnos") || norm.includes("forensic") || norm.includes("architecture") || norm.includes("assessment")) {
      autoProgress = 50;
    } else {
      autoProgress = 25;
    }

    const rawMsg = clientUpdateText.trim();
    let broadcastMessage = rawMsg || `Ticket lifecycle stage updated to "${newStatus}".`;
    if (notifyClientWithTelemetry && !broadcastMessage.includes("[Stage:")) {
      broadcastMessage += `\n\n[Stage: ${newStatus} • Station: ${currentStation}]`;
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
              progress: autoProgress,
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
          progress: autoProgress,
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
    setNotification(`✅ Client Portal updated: Case #${targetId} set to "${newStatus}".`);

    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `You broadcast an update to customer on #${targetId} (${newStatus})`,
        time: "Just now",
        dotColor: "bg-emerald-500",
      },
      ...prev.slice(0, 4),
    ]);

    try {
      await Promise.all([
        updateTicketInSupabase(targetId, {
          status: newStatus,
          clonedPercent: autoProgress,
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

  // Instant 1-Click Stage Selection & Sync to Client Portal
  const handleSelectAndSyncStage = async (stageValue: string) => {
    if (!activeCase) return;

    setClientStatus(stageValue);
    setEditStatus(stageValue);

    const targetId = selectedCaseIdRef.current || selectedCaseId || activeCase.id;
    lastManualUpdateRef.current = Date.now();

    const currentStation = editBench || activeCase.bench;

    // Automatic progress calculation based on the 4 stages for DB compatibility
    let autoProgress = 25;
    const norm = stageValue.toLowerCase();
    if (
      norm.includes("resolved") ||
      norm.includes("closed") ||
      norm.includes("completed") ||
      (norm.includes("return") && norm.includes("resolved"))
    ) {
      autoProgress = 100;
    } else if (
      norm.includes("return") ||
      norm.includes("verification") ||
      norm.includes("hardening") ||
      norm.includes("audit") ||
      norm.includes("handover")
    ) {
      autoProgress = 95;
    } else if (
      norm.includes("pc-3000") ||
      norm.includes("imaging") ||
      norm.includes("containment") ||
      norm.includes("remediation") ||
      norm.includes("deployment") ||
      norm.includes("migration") ||
      norm.includes("rollout") ||
      norm.includes("repair")
    ) {
      autoProgress = 75;
    } else if (
      norm.includes("cleanroom") ||
      norm.includes("diagnos") ||
      norm.includes("forensic") ||
      norm.includes("architecture") ||
      norm.includes("assessment")
    ) {
      autoProgress = 50;
    } else {
      autoProgress = 25;
    }

    setClientProgress(autoProgress);
    setEditProgress(autoProgress);

    // Optimistically update status and progress in cases state
    setCases((prev) =>
      prev.map((c) =>
        c.id.toLowerCase() === targetId.toLowerCase()
          ? {
              ...c,
              status: stageValue,
              progress: autoProgress,
              priority: editPriority || activeCase.priority,
              bench: currentStation,
              updatedAt: "Just now",
            }
          : c
      )
    );

    // Save persistent local override immediately for instant 0ms cross-tab sync
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("tdd_ticket_overrides");
        const overrides = raw ? JSON.parse(raw) : {};
        const overrideData = {
          ...(overrides[targetId] || {}),
          status: stageValue,
          progress: autoProgress,
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
        console.warn("Could not save persistent ticket override:", e);
      }
    }

    setNotification(`✅ Client Portal updated: Case #${targetId} set to "${stageValue}".`);
    setTimeout(() => setNotification(""), 4000);

    const broadcastMsg = `Ticket lifecycle stage updated to "${stageValue}".`;
    setChatMessages((prev) => ({
      ...prev,
      [targetId]: [
        ...(prev[targetId] || []),
        {
          sender: "Technician",
          author: techUser.name,
          time: "Just now",
          text: broadcastMsg,
        },
      ],
    }));

    setActivityFeed((prev) => [
      {
        id: Date.now(),
        text: `Stage advanced on #${targetId} → ${stageValue}`,
        time: "Just now",
        dotColor: "bg-blue-500",
      },
      ...prev.slice(0, 4),
    ]);

    // Asynchronously update Supabase backend
    try {
      await Promise.all([
        updateTicketInSupabase(targetId, {
          status: stageValue,
          clonedPercent: autoProgress,
          priority: editPriority || activeCase.priority,
          assignedBench: currentStation,
        }),
        sendMessageToSupabase(targetId, "Technician", techUser.name, broadcastMsg),
      ]);
    } catch (err) {
      console.warn("Failed to broadcast stage update to Supabase:", err);
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
              const json = JSON.stringify(updated);
              localStorage.setItem(`tdd_attachments_${targetId}`, json);
              localStorage.setItem(`tdd_attachments_${targetId.toUpperCase()}`, json);
              localStorage.setItem(`tdd_attachments_${targetId.toLowerCase()}`, json);
              window.dispatchEvent(new Event("attachments-updated"));
              window.dispatchEvent(new Event("storage"));
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
            const json = JSON.stringify(updated);
            localStorage.setItem(`tdd_attachments_${targetId}`, json);
            localStorage.setItem(`tdd_attachments_${targetId.toUpperCase()}`, json);
            localStorage.setItem(`tdd_attachments_${targetId.toLowerCase()}`, json);
            window.dispatchEvent(new Event("attachments-updated"));
            window.dispatchEvent(new Event("storage"));
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
        const json = JSON.stringify(updated);
        localStorage.setItem(`tdd_attachments_${ticketId}`, json);
        localStorage.setItem(`tdd_attachments_${ticketId.toUpperCase()}`, json);
        localStorage.setItem(`tdd_attachments_${ticketId.toLowerCase()}`, json);
        window.dispatchEvent(new Event("attachments-updated"));
        window.dispatchEvent(new Event("storage"));
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

  // Dynamic Live KPI Counts from Cases (Image 1)
  const kpiStats = useMemo(() => {
    const hasCases = cases.length > 0;
    const totalOpen = cases.filter(
      (c) =>
        !c.status.toLowerCase().includes("resolved") &&
        !c.status.toLowerCase().includes("closed") &&
        !c.status.toLowerCase().includes("completed")
    ).length;

    const totalUrgent = cases.filter(
      (c) =>
        (c.priority === "CRITICAL" || c.priority === "HIGH") &&
        !c.status.toLowerCase().includes("resolved") &&
        !c.status.toLowerCase().includes("closed")
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
      open: hasCases ? totalOpen : 12,
      urgent: hasCases ? totalUrgent : 4,
      waiting: hasCases ? totalWaiting : 6,
      resolved: hasCases ? totalResolved : 28,
    };
  }, [cases]);

  // Dynamic Live Reports Metrics (Image 3)
  const reportsStats = useMemo(() => {
    const hasCases = cases.length > 0;
    const total = cases.length;
    const openCount = cases.filter(
      (c) =>
        c.status.toLowerCase().includes("open") ||
        c.status.toLowerCase().includes("intake") ||
        c.status.toLowerCase().includes("diagnos")
    ).length;
    const inProgressCount = cases.filter(
      (c) =>
        c.status.toLowerCase().includes("progress") ||
        c.status.toLowerCase().includes("cloning") ||
        c.status.toLowerCase().includes("imaging") ||
        c.status.toLowerCase().includes("carving")
    ).length;
    const waitingCount = cases.filter((c) => c.status.toLowerCase().includes("wait")).length;
    const resolvedCount = cases.filter(
      (c) =>
        c.status.toLowerCase().includes("resolved") ||
        c.status.toLowerCase().includes("completed")
    ).length;
    const closedCount = cases.filter((c) => c.status.toLowerCase().includes("closed")).length;

    const urgentCount = cases.filter((c) => c.priority === "CRITICAL").length;
    const highCount = cases.filter((c) => c.priority === "HIGH").length;
    const mediumCount = cases.filter((c) => c.priority === "STANDARD" || !c.priority).length;
    const lowCount = cases.filter((c) => (c as any).priority === "LOW").length;

    return {
      total: hasCases ? total : 48,
      resolved: hasCases ? (resolvedCount + closedCount) : 28,
      avgResponse: "2.4 hrs",
      avgResolve: "6.8 hrs",
      byStatus: {
        open: hasCases ? openCount : 12,
        inProgress: hasCases ? inProgressCount : 6,
        waiting: hasCases ? waitingCount : 6,
        resolved: hasCases ? resolvedCount : 18,
        closed: hasCases ? closedCount : 4,
      },
      byPriority: {
        urgent: hasCases ? urgentCount : 4,
        high: hasCases ? highCount : 14,
        medium: hasCases ? mediumCount : 18,
        low: hasCases ? lowCount : 5,
      },
    };
  }, [cases]);

  // Telemetry Sync & Reset Handlers
  const handleForceSync = async () => {
    setNotification("Syncing live telemetry and tickets from Supabase...");
    await loadSupabaseData();
    await loadReportsFromSupabase();
    setNotification("All tickets, metrics, and reports synchronized with Supabase!");
    setTimeout(() => setNotification(""), 3500);
  };

  const handleResetOverrides = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tdd_ticket_overrides");
      window.dispatchEvent(new Event("tickets-updated"));
    }
    loadSupabaseData();
    setNotification("Local ticket overrides reset. Re-synced 100% with Supabase database.");
    setTimeout(() => setNotification(""), 4000);
  };

  // Technician New Ticket Creation
  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.customerName.trim() || !newTicketForm.customerEmail.trim() || !newTicketForm.deviceOrSubject.trim()) {
      setNotification("Please fill in Customer Name, Email, and Device/Subject.");
      setTimeout(() => setNotification(""), 3500);
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newTicketForm.customerName.trim(),
          customerEmail: newTicketForm.customerEmail.trim(),
          companyName: newTicketForm.companyName.trim() || newTicketForm.customerName.trim(),
          deviceOrSubject: newTicketForm.deviceOrSubject.trim(),
          mediaType: newTicketForm.mediaType,
          serialNumber: newTicketForm.serialNumber.trim() || "N/A",
          urgency: newTicketForm.urgency,
          assignedBench: newTicketForm.assignedBench,
          assignedTech: newTicketForm.assignedTech,
          status: newTicketForm.status,
          symptoms: newTicketForm.symptoms.trim() || "Intake triage logged by technician.",
        }),
      });

      const json = await res.json();
      if (res.ok && json.ticket) {
        const t = json.ticket;
        const newCaseItem: CaseItem = {
          id: t.id,
          client: t.customer_name || newTicketForm.customerName,
          customerName: t.customer_name || newTicketForm.customerName,
          company: t.company_name || newTicketForm.companyName,
          device: t.device_or_subject || newTicketForm.deviceOrSubject,
          serial: t.serial_number || newTicketForm.serialNumber || "N/A",
          mediaType: (t.media_type as any) || newTicketForm.mediaType,
          category: newTicketForm.category || "Data Recovery",
          status: t.status || newTicketForm.status,
          progress: 10,
          priority: (newTicketForm.urgency.toUpperCase() as any) || "STANDARD",
          notes: newTicketForm.symptoms || "New intake triage logged.",
          bench: newTicketForm.assignedBench,
          leadTech: newTicketForm.assignedTech,
          createdAt: "Just now",
          updatedAt: "Just now",
          symptoms: newTicketForm.symptoms,
        };

        setCases((prev) => [newCaseItem, ...prev]);
        setSelectedCaseId(newCaseItem.id);
        setIsNewTicketModalOpen(false);
        setNotification(`Ticket #${newCaseItem.id} created successfully and saved to Supabase!`);
        setTimeout(() => setNotification(""), 4500);

        setNewTicketForm({
          customerName: "",
          customerEmail: "",
          companyName: "",
          deviceOrSubject: "",
          category: "Data Recovery",
          mediaType: "HDD",
          serialNumber: "",
          urgency: "Standard",
          assignedBench: "Forensic Platter Pod 1",
          assignedTech: techUser.name,
          status: "Intake & Diagnostics",
          symptoms: "",
        });
      } else {
        throw new Error(json.error || "Failed to create ticket");
      }
    } catch (err: any) {
      console.error("Create ticket error:", err);
      setNotification(`Error creating ticket: ${err.message || "Failed to save"}`);
      setTimeout(() => setNotification(""), 4000);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Password Generator Helper
  const generatePassword = (length = pwdLength) => {
    let chars = "abcdefghijklmnopqrstuvwxyz";
    if (pwdIncludeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (pwdIncludeNumbers) chars += "0123456789";
    if (pwdIncludeSymbols) chars += "!@#$%^&*()-_=+[]{}|;:,.<>?";
    let res = "";
    for (let i = 0; i < length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPwd(res);
    setPwdCopied(false);
    return res;
  };

  const handleCopyPassword = () => {
    if (!generatedPwd) return;
    navigator.clipboard.writeText(generatedPwd);
    setPwdCopied(true);
    setNotification("Password copied to clipboard!");
    setTimeout(() => {
      setPwdCopied(false);
      setNotification("");
    }, 3000);
  };

  // Remote Support Helper
  const handleRefreshRemoteCode = () => {
    const code = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    setRemoteSessionCode(code);
    setRemoteCopied(false);
    setNotification(`New remote session code generated: ${code}`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleCopyRemoteLink = () => {
    const url = `https://remote.thedatadot.com/join?pin=${remoteSessionCode.replace("-", "")}`;
    navigator.clipboard.writeText(url);
    setRemoteCopied(true);
    setNotification("Remote support link copied to clipboard!");
    setTimeout(() => {
      setRemoteCopied(false);
      setNotification("");
    }, 3000);
  };

  // IP Diagnostic Helper
  const handleRunIpLookup = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setIpLookupResult({
        ip: ipInput || "103.145.72.18",
        hostname: (ipInput || "").includes("thedatadot") ? "lab.thedatadot.com" : `client-${Math.floor(Math.random() * 100)}.chennai.airtel.in`,
        location: "Chennai, Tamil Nadu, IN",
        isp: "Enterprise Low-Latency Gateway",
        latency: `${Math.floor(8 + Math.random() * 12)} ms`,
        dnsStatus: "Healthy (All records validated)",
      });
      setNotification(`IP diagnostics completed for ${ipInput || "gateway"}!`);
      setTimeout(() => setNotification(""), 3000);
    }, 600);
  };

  // Open Tools Modal
  const handleOpenTool = (tool: "remote" | "password" | "ip" | "system") => {
    if (tool === "password" && !generatedPwd) {
      generatePassword(16);
    }
    if (tool === "system" && typeof window !== "undefined") {
      setSystemInfoData({
        os: navigator.platform || "Windows 11 Enterprise",
        userAgent: navigator.userAgent.slice(0, 70) + "...",
        online: navigator.onLine,
        cores: navigator.hardwareConcurrency || 8,
        memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB RAM` : "16 GB Lab RAM",
        screen: `${window.screen.width} x ${window.screen.height}`,
        bench: selectedServiceBench,
        syncStatus: "Connected to Supabase WebSocket",
      });
    }
    setActiveToolModal(tool);
  };

  // Category Configuration for Active Ticket
  const currentConfig = activeCase
    ? getCategoryConfig(
        activeCase.category,
        editStatus || clientStatus || activeCase.status,
        clientProgress !== undefined ? clientProgress : (editProgress !== undefined ? editProgress : activeCase.progress),
        editBench || activeCase.bench
      )
    : null;

  // 4-Stage Category Execution Pipeline (Direct 1:1 match with Customer Portal)
  const ticketStages = useMemo(() => {
    let stages = currentConfig?.stages && currentConfig.stages.length > 0
      ? [...currentConfig.stages]
      : [
          { value: "Media Intake", label: "1. Media Intake" },
          { value: "Cleanroom Diagnostics", label: "2. Cleanroom Diagnostics" },
          { value: "PC-3000 Imaging", label: "3. PC-3000 Imaging" },
          { value: "Verification & Return", label: "4. Verification & Return (Resolved)" },
        ];

    // Keep current status selectable if it was an older legacy state (e.g. Open / Closed)
    const curStatus = clientStatus || activeCase?.status;
    if (curStatus && !stages.some((s) => s.value.toLowerCase() === curStatus.toLowerCase())) {
      stages = [{ value: curStatus, label: `Current: ${curStatus}` }, ...stages];
    }

    return stages;
  }, [currentConfig, clientStatus, activeCase?.status]);

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
              { id: "diagnosis_report", label: "Diagnosis Report", icon: "📄", badge: diagnosisReports.length },
              { id: "all_tickets", label: "All Tickets", icon: "📑" },
              { id: "knowledge_base", label: "Knowledge Base", icon: "📚" },
              { id: "reports", label: "Reports", icon: "📈" },
              { id: "tools", label: "Tools", icon: "🛠️" },
            ].map((item) => {
              const isActive = activeView === item.id || (item.id === "my_tickets" && activeView === "ticket_details");
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id as PortalNavView);
                    setSidebarOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 font-medium transition cursor-pointer ${
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
          <div className="flex items-center gap-3 text-xs">
            {/* Create Ticket Action Button */}
            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 font-bold text-white shadow-sm hover:bg-blue-500 transition cursor-pointer"
            >
              <span className="text-sm leading-none">+</span>
              <span>New Ticket</span>
            </button>

            {/* Supabase Live Indicator (Interactive Force-Sync) */}
            <button
              onClick={handleForceSync}
              title="Click to force live telemetry and tickets synchronization with Supabase"
              className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 font-mono text-[11px] text-emerald-700 transition cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync Active</span>
              <span className="text-[10px] text-emerald-600 ml-0.5">🔄</span>
            </button>

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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Good morning, {techUser.name.split(" ")[0]} 👋
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Here's what's happening with your tickets today.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsNewTicketModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white text-xs shadow-sm hover:bg-blue-500 transition cursor-pointer"
                  >
                    <span className="text-sm leading-none">+</span>
                    <span>New Ticket</span>
                  </button>

                  <button
                    onClick={handleForceSync}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                    title="Synchronize real-time telemetry from Supabase"
                  >
                    <span>🔄</span>
                    <span>Sync Live Data</span>
                  </button>

                  <button
                    onClick={handleResetOverrides}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm hover:bg-slate-50 transition cursor-pointer"
                    title="Reset local overrides and re-fetch clean Supabase state"
                  >
                    <span>↺</span>
                    <span>Reset Overrides</span>
                  </button>

                  <div className="hidden sm:block pl-2 border-l border-slate-200 text-left">
                    <span className="text-xs font-medium text-slate-600 block">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Lab Telemetry Active
                    </span>
                  </div>
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
                            onChange={(e) => handleSelectAndSyncStage(e.target.value)}
                            className="w-full rounded-xl border border-blue-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                          >
                            {ticketStages.map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </select>
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
                    onClick={() => setIsNewTicketModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm cursor-pointer"
                  >
                    <span className="text-sm leading-none">+</span>
                    <span>New Ticket</span>
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
          {/* VIEW: DIAGNOSIS REPORTS HUB (Matches Tickets Layout) */}
          {/* ========================================================= */}
          {activeView === "diagnosis_report" && (
            <div className="space-y-6">
              {/* HEADER BANNER WITH + CREATE REPORT BUTTON */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Diagnosis Reports
                    </h2>
                    <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 text-xs font-bold font-mono">
                      {diagnosisReports.length} {diagnosisReports.length === 1 ? "Report" : "Reports"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Cleanroom diagnostic assessments, drive inspection records, and 1-page printable customer reports synced to Supabase.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenReportModal()}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-sm font-black">+</span>
                    <span>Create Report</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                {/* STATUS TABS */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  {[
                    { id: "ALL", label: "All Reports", count: diagnosisReports.length },
                    { id: "Pending", label: "Pending", count: diagnosisReports.filter(r => r.recoveryStatus?.toLowerCase().includes("pending")).length },
                    { id: "In Progress", label: "In Progress", count: diagnosisReports.filter(r => r.recoveryStatus?.toLowerCase().includes("progress") || r.recoveryStatus?.toLowerCase().includes("diagnos")).length },
                    { id: "Completed", label: "Completed", count: diagnosisReports.filter(r => r.recoveryStatus?.toLowerCase().includes("completed") || r.recoveryStatus?.toLowerCase().includes("resolved")).length },
                  ].map((tab) => {
                    const isTabActive = reportStatusFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setReportStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                          isTabActive
                            ? "bg-blue-600 text-white shadow-sm font-semibold"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isTabActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* SEARCH INPUT */}
                <div className="w-full sm:w-72 relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    value={reportSearchQuery}
                    onChange={(e) => setReportSearchQuery(e.target.value)}
                    placeholder="Search Job ID, client, SN, or brand..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                  />
                  {reportSearchQuery && (
                    <button
                      onClick={() => setReportSearchQuery("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* REPORTS TABLE */}
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
                {filteredDiagnosisReports.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-2xl border border-blue-100">
                      📄
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {reportSearchQuery ? "No matching reports found" : "No diagnosis reports created yet"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {reportSearchQuery
                        ? "Try adjusting your search criteria or filter tabs."
                        : "Create and save official cleanroom intake reports, hardware assessments, and 1-page client PDFs."}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenReportModal()}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 text-xs shadow-md transition inline-flex items-center gap-2 cursor-pointer mt-2"
                    >
                      <span>+ Create Report</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5">Job ID &amp; Date</th>
                          <th className="px-4 py-3.5">Client Name</th>
                          <th className="px-4 py-3.5">Device &amp; Media</th>
                          <th className="px-4 py-3.5">Serial Number</th>
                          <th className="px-4 py-3.5">Diagnosis / Symptoms</th>
                          <th className="px-4 py-3.5">Status &amp; Cost</th>
                          <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDiagnosisReports.map((report) => {
                          const isPending = report.recoveryStatus?.toLowerCase().includes("pending");
                          const isCompleted = report.recoveryStatus?.toLowerCase().includes("completed") || report.recoveryStatus?.toLowerCase().includes("resolved");
                          return (
                            <tr
                              key={report.id || report.jobId}
                              className="hover:bg-blue-50/40 transition group"
                            >
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span className="font-mono font-bold text-blue-700 block">
                                  #{report.jobId}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {report.reportDateIso}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                                {report.clientName}
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="font-medium text-slate-800">
                                  <span className="font-bold text-slate-900">{report.deviceType}</span> • {report.brand} {report.model}
                                </div>
                                <span className="text-[10.5px] text-slate-500 block">
                                  Cap: {report.capacity} ({report.iface})
                                </span>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] font-bold text-slate-700">
                                <span className="rounded bg-slate-100 px-2 py-0.5 border border-slate-200">
                                  {report.serialNumber}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 max-w-[200px]">
                                <span className="font-semibold text-slate-800 block truncate" title={report.diagnosis}>
                                  {report.diagnosis}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate" title={report.symptoms}>
                                  {report.symptoms}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    isCompleted
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : isPending
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-blue-50 text-blue-700 border border-blue-200"
                                  }`}
                                >
                                  {report.recoveryStatus}
                                </span>
                                <span className="text-[11px] font-mono font-bold text-slate-800 block mt-0.5">
                                  {report.finalRecoveryCost}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReportModal(report)}
                                    className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="View & Print 1-Page Report"
                                  >
                                    <span>🖨️</span>
                                    <span>Print / View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReportModal(report)}
                                    className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                                    title="Edit this report"
                                  >
                                    <span>✏️</span>
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReportToDelete(report)}
                                    className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 text-xs font-semibold transition cursor-pointer"
                                    title="Delete report from Supabase"
                                  >
                                    <span>🗑️</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>Created: {activeCase.createdAt || "4 Aug 2025, 10:24 AM"}</span>
                    <span>•</span>
                    <span>Last updated: {activeCase.updatedAt || "4 Aug 2025, 2:15 PM"}</span>
                  </div>
                </div>
              </div>

              {/* TICKET TITLE & BADGES (Matching Panel 7) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    #{activeCase.id}
                  </span>
                  <span className="rounded-full bg-rose-50 border border-rose-200 text-rose-600 px-2.5 py-0.5 text-[10px] font-bold">
                    {activeCase.priority || "High Priority"}
                  </span>
                  <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 text-[10px] font-semibold">
                    {activeCase.category || "Data Recovery"}
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

                {/* WORKFLOW STEPPER (Interactive 4-Stage Category Pipeline Matching Client Portal) */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      {activeCase.category || "Data Recovery"} 4-Stage Workflow (Client Portal Synced)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click any stage to <strong className="text-blue-600 font-semibold">instantly advance &amp; sync</strong> client portal in real-time
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {ticketStages.map((st, i) => {
                      const currentStatus = (clientStatus || editStatus || activeCase.status || "").toLowerCase();
                      const isSelected =
                        currentStatus === st.value.toLowerCase() ||
                        currentStatus === st.label.toLowerCase() ||
                        (st.value.toLowerCase() === "verification & return" && (currentStatus.includes("resolved") || currentStatus.includes("return")));
                      return (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => handleSelectAndSyncStage(st.value)}
                          title={`Select Stage ${i + 1}: ${st.label}`}
                          className={`text-left p-3 rounded-xl border text-xs font-semibold transition cursor-pointer hover:shadow-sm ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-500/25"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`text-[10px] block font-mono font-bold ${
                              isSelected ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            Stage {i + 1}
                          </span>
                          <span className="truncate block mt-0.5 font-bold text-[13px]">{st.value}</span>
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
                                Attach forensic captures, intake photos, or diagnostic files from your computer.
                              </p>
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 text-xs font-bold transition cursor-pointer"
                                >
                                  <span>📎</span>
                                  <span>Select File from Computer</span>
                                </button>
                              </div>
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
                        onChange={(e) => handleSelectAndSyncStage(e.target.value)}
                        className="w-full rounded-xl border border-blue-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                      >
                        {ticketStages.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
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
                      <span>Include stage stamp ({clientStatus || activeCase.status}) in client message</span>
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
          {/* ========================================================= */}
          {/* VIEW 8: KNOWLEDGE BASE (Panel 8 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "knowledge_base" && (() => {
            const categories = [
              { title: "Microsoft 365 Setup", sub: "Microsoft 365", icon: "🌐" },
              { title: "Email Troubleshooting", sub: "Email", icon: "✉️" },
              { title: "Windows Support", sub: "Windows", icon: "💻" },
              { title: "Network & Internet", sub: "Networking", icon: "🔌" },
              { title: "Printer Support", sub: "Hardware", icon: "🖨️" },
              { title: "Security & MFA", sub: "Security", icon: "🛡️" },
            ];

            const filteredArticles = KNOWLEDGE_BASE_ARTICLES.filter((art) => {
              const query = kbSearchQuery.toLowerCase().trim();
              const matchesQuery =
                !query ||
                art.title.toLowerCase().includes(query) ||
                art.summary.toLowerCase().includes(query) ||
                art.category.toLowerCase().includes(query) ||
                art.steps.some((s) => s.toLowerCase().includes(query));

              const matchesCat =
                !selectedKbCategory || art.category.toLowerCase() === selectedKbCategory.toLowerCase();

              return matchesQuery && matchesCat;
            });

            return (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Find answers and standard operating procedures to resolve tickets and lab cases faster.
                  </p>
                </div>

                {/* SEARCH BAR */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Search articles by title, keyword, error code, or command snippet..."
                      value={kbSearchQuery}
                      onChange={(e) => setKbSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                    {kbSearchQuery && (
                      <button
                        onClick={() => setKbSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {(selectedKbCategory || kbSearchQuery) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Active filters:</span>
                      {selectedKbCategory && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                          <span>{selectedKbCategory}</span>
                          <button
                            onClick={() => setSelectedKbCategory(null)}
                            className="hover:text-blue-900 ml-1 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {kbSearchQuery && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                          <span>Query: "{kbSearchQuery}"</span>
                          <button
                            onClick={() => setKbSearchQuery("")}
                            className="hover:text-slate-900 ml-1 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedKbCategory(null);
                          setKbSearchQuery("");
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-semibold ml-auto"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* GRID OF 6 CARDS (Clickable Categories with Live Counts) */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Browse Knowledge Categories
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click card to filter articles
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((item, idx) => {
                      const isSelected = selectedKbCategory === item.title;
                      const catCount = KNOWLEDGE_BASE_ARTICLES.filter(
                        (a) => a.category.toLowerCase() === item.title.toLowerCase()
                      ).length;

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedKbCategory(isSelected ? null : item.title)}
                          className={`rounded-2xl border p-6 shadow-sm transition cursor-pointer space-y-2 relative ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-400/20"
                              : "border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-md"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-4 right-4 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Active Filter
                            </span>
                          )}
                          <span className="text-2xl block">{item.icon}</span>
                          <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                          <span className="text-[11px] text-slate-400 block">{item.sub}</span>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-blue-600 font-bold block">
                              {catCount} {catCount === 1 ? "article" : "articles"}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">Explore →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FILTERED ARTICLES LIST */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        {selectedKbCategory ? `Articles in ${selectedKbCategory}` : "Available SOP & Support Guides"}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Showing {filteredArticles.length} of {KNOWLEDGE_BASE_ARTICLES.length} guides
                      </p>
                    </div>
                    {selectedKbCategory && (
                      <button
                        onClick={() => setSelectedKbCategory(null)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Show All Categories
                      </button>
                    )}
                  </div>

                  {filteredArticles.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <p className="text-sm font-semibold">No articles match your search criteria.</p>
                      <p className="text-xs mt-1">Try clearing filters or adjusting your keywords.</p>
                      <button
                        onClick={() => {
                          setSelectedKbCategory(null);
                          setKbSearchQuery("");
                        }}
                        className="mt-3 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {filteredArticles.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => setSelectedKbArticle(art)}
                          className="group rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm p-4 transition cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="rounded-md bg-blue-100/70 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                {art.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {art.readTime}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                              {art.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {art.summary}
                            </p>
                          </div>
                          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-mono">Updated {art.updated}</span>
                            <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                              Read Guide →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RECENT QUICK ACCESS GUIDES */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Recent Lab SOP Guides
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedKbCategory(null);
                        setKbSearchQuery("");
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    {KNOWLEDGE_BASE_ARTICLES.slice(0, 3).map((art) => (
                      <div
                        key={art.id}
                        onClick={() => setSelectedKbArticle(art)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">📄</span>
                          <div>
                            <span className="font-semibold text-slate-800 hover:text-blue-600 transition block">
                              {art.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{art.category} • {art.readTime}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-blue-600 font-semibold">Open →</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* VIEW 9: REPORTS (Panel 9 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "reports" && (() => {
            const maxP = Math.max(
              reportsStats.byPriority.urgent,
              reportsStats.byPriority.high,
              reportsStats.byPriority.medium,
              reportsStats.byPriority.low,
              1
            );

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports &amp; Live Telemetry</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time SLA resolution metrics and ticket distribution synchronized with Supabase database.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleForceSync}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
                      title="Force live refresh from Supabase"
                    >
                      <span>🔄</span>
                      <span>Sync Live Telemetry</span>
                    </button>

                    <button
                      onClick={handleResetOverrides}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 shadow-sm hover:bg-slate-50 transition cursor-pointer"
                      title="Clear local overrides and pull raw Supabase numbers"
                    >
                      <span>↺</span>
                      <span>Reset &amp; Re-Sync</span>
                    </button>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm font-medium">
                      All Time Telemetry ▾
                    </div>
                  </div>
                </div>

                {/* 4 STATS (Computed from Supabase Tickets) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                    <span className="text-xs text-slate-400 font-medium">Total Tickets</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{reportsStats.total}</div>
                    <span className="text-[11px] text-emerald-600 font-semibold">Active in system</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                    <span className="text-xs text-slate-400 font-medium">Resolved / Closed</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{reportsStats.resolved}</div>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      {reportsStats.total > 0
                        ? `${Math.round((reportsStats.resolved / reportsStats.total) * 100)}% resolution rate`
                        : "100% resolution rate"}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                    <span className="text-xs text-slate-400 font-medium">Avg. Response Time</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{reportsStats.avgResponse}</div>
                    <span className="text-[11px] text-emerald-600 font-semibold">SLA On-Track</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                    <span className="text-xs text-slate-400 font-medium">Avg. Resolve Time</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{reportsStats.avgResolve}</div>
                    <span className="text-[11px] text-emerald-600 font-semibold">Cleanroom Standard</span>
                  </div>
                </div>

                {/* CHARTS (Dynamic from Live Supabase Cases) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tickets by Status (Donut) */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">Tickets by Live Status</h3>
                      <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Supabase
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
                      <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-blue-500 border-t-emerald-500 border-r-amber-500 border-b-rose-500 shadow-inner">
                        <div className="text-center">
                          <span className="text-2xl font-bold text-slate-900 block">{reportsStats.total}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          <span className="text-slate-600">
                            Open: <strong className="text-slate-900">{reportsStats.byStatus.open}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                          <span className="text-slate-600">
                            In Progress: <strong className="text-slate-900">{reportsStats.byStatus.inProgress}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                          <span className="text-slate-600">
                            Waiting: <strong className="text-slate-900">{reportsStats.byStatus.waiting}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="text-slate-600">
                            Resolved: <strong className="text-slate-900">{reportsStats.byStatus.resolved}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                          <span className="text-slate-600">
                            Closed: <strong className="text-slate-900">{reportsStats.byStatus.closed}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tickets by Priority (Dynamic Bars) */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">Tickets by SLA Priority</h3>
                      <span className="text-[11px] text-slate-400">Live Breakdown</span>
                    </div>
                    <div className="flex items-end justify-between gap-4 h-44 pt-4 px-4">
                      {[
                        { label: "Urgent", count: reportsStats.byPriority.urgent, color: "bg-rose-500" },
                        { label: "High", count: reportsStats.byPriority.high, color: "bg-amber-500" },
                        { label: "Medium", count: reportsStats.byPriority.medium, color: "bg-blue-500" },
                        { label: "Low", count: reportsStats.byPriority.low, color: "bg-emerald-500" },
                      ].map((bar, idx) => {
                        const barHeightPercent = Math.max(12, Math.round((bar.count / maxP) * 90));
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                            <span className="text-xs font-bold text-slate-700">{bar.count}</span>
                            <div
                              className={`w-full rounded-t-lg ${bar.color} transition-all duration-500 shadow-sm`}
                              style={{ height: `${barHeightPercent}%` }}
                            />
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {bar.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* VIEW 10: TOOLS (Panel 10 in Mockup) */}
          {/* ========================================================= */}
          {activeView === "tools" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technician Diagnostic Tools</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quick access to utility tools for remote desktop control, password security, network ping diagnostics, and client telemetry.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: "remote" as const,
                    title: "Remote Support",
                    desc: "Generate secure 6-digit session PINs, copy invite links, and launch Quick Assist / AnyDesk.",
                    icon: "🖥️",
                    badge: "Live Session",
                    color: "border-blue-200 hover:border-blue-400 bg-blue-50/20",
                  },
                  {
                    id: "password" as const,
                    title: "Password Generator",
                    desc: "Create enterprise high-entropy passwords with custom length, symbols, and 1-click clipboard copy.",
                    icon: "🔐",
                    badge: "Security",
                    color: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/20",
                  },
                  {
                    id: "ip" as const,
                    title: "IP Lookup & DNS",
                    desc: "Perform real-time DNS resolution, gateway latency ping checks, and ISP geolocation lookups.",
                    icon: "🌐",
                    badge: "Network Diag",
                    color: "border-indigo-200 hover:border-indigo-400 bg-indigo-50/20",
                  },
                  {
                    id: "system" as const,
                    title: "System Info",
                    desc: "Inspect live client hardware specs, browser user agent, screen geometry, and active bench socket.",
                    icon: "⚙️",
                    badge: "Telemetry",
                    color: "border-amber-200 hover:border-amber-400 bg-amber-50/20",
                  },
                ].map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenTool(t.id)}
                    className={`group rounded-2xl border ${t.color} bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl block p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform">
                          {t.icon}
                        </span>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {t.badge}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                          {t.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>Launch Utility</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
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

      {/* DELETE REPORT CONFIRMATION MODAL */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-2xl">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Diagnosis Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete Diagnosis Report{" "}
              <strong className="text-slate-900 font-mono font-bold">
                #{reportToDelete.jobId}
              </strong>{" "}
              for <strong className="text-slate-800">{reportToDelete.clientName}</strong>? This will remove the report from Supabase database.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isDeletingReport}
                onClick={() => handleDeleteReport(reportToDelete.id || `DR-${reportToDelete.jobId}`)}
                className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition shadow-md shadow-rose-600/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isDeletingReport ? "Deleting from Supabase..." : "Delete Report Permanently"}</span>
              </button>
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADVANCED DATA RECOVERY DIAGNOSTIC REPORT GENERATOR MODAL */}
      <AdvancedDataRecoveryReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialData={reportModalInitialData}
        onSaved={() => {
          loadReportsFromSupabase();
          setNotification("Diagnosis Report saved successfully to Supabase!");
          setTimeout(() => setNotification(""), 4000);
        }}
      />

      {/* ============================================================= */}
      {/* 5. TECHNICIAN NEW TICKET CREATION MODAL                       */}
      {/* ============================================================= */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
                  +
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Create New Support &amp; Service Ticket</h3>
                  <p className="text-[11px] text-slate-500">Log client intake directly to Supabase PostgreSQL database</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewTicket} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Customer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rajesh Kumar"
                    value={newTicketForm.customerName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Customer Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., rajesh@domain.com"
                    value={newTicketForm.customerEmail}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organization / Company</label>
                  <input
                    type="text"
                    placeholder="e.g., Apex Healthcare Ltd"
                    value={newTicketForm.companyName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Device / Subject Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Seagate 2TB HDD Clicking Sound"
                    value={newTicketForm.deviceOrSubject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, deviceOrSubject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Data Recovery">Data Recovery</option>
                    <option value="Managed IT">Managed IT</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud Solutions">Cloud Solutions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Media / Device Type</label>
                  <select
                    value={newTicketForm.mediaType}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, mediaType: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="HDD">HDD (Mechanical)</option>
                    <option value="SSD">SSD (SATA / PCIe)</option>
                    <option value="NVMe">NVMe M.2</option>
                    <option value="RAID">RAID Array / NAS</option>
                    <option value="FLASH">Flash / USB / SD</option>
                    <option value="SERVER">Server Blade</option>
                    <option value="NETWORK">Network Switch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Serial / Asset Number</label>
                  <input
                    type="text"
                    placeholder="e.g., WDC-WD20EZAZ"
                    value={newTicketForm.serialNumber}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, serialNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SLA Urgency / Priority</label>
                  <select
                    value={newTicketForm.urgency}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, urgency: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Standard">Standard (24-48h)</option>
                    <option value="High">High (Same Day)</option>
                    <option value="Critical">Critical (Immediate Cleanroom)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Lead Tech</label>
                  <select
                    value={newTicketForm.assignedTech}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, assignedTech: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value={techUser.name}>{techUser.name} (You)</option>
                    <option value="Sarah Jenkins">Sarah Jenkins (NOC Lead)</option>
                    <option value="Marcus Vance">Marcus Vance (Forensics)</option>
                    <option value="Unassigned">Unassigned (Pool)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Bench Station</label>
                  <select
                    value={newTicketForm.assignedBench}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, assignedBench: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="ISO Class-5 Cleanroom Station 01">ISO Class-5 Station 01</option>
                    <option value="Forensic Platter Pod 1">Forensic Platter Pod 1</option>
                    <option value="NAND Flash Depackaging Bench">NAND Flash Bench</option>
                    <option value="IT Diagnostics Station 01">IT Diagnostics 01</option>
                    <option value="SOC Threat Defense Pod">SOC Threat Pod</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Symptoms &amp; Initial Diagnostic Directives
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe failure symptoms, diagnostic observations, sounds, error codes, and customer requirements..."
                  value={newTicketForm.symptoms}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, symptoms: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-500 transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingTicket ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Ticket &amp; Save</span>
                      <span>✓</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. REMOTE SUPPORT MODAL                                       */}
      {/* ============================================================= */}
      {activeToolModal === "remote" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-lg font-bold">
                  🖥️
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Remote Support Session Console</h3>
                  <p className="text-[11px] text-slate-400">Encrypted technician session link and client PIN</p>
                </div>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* PIN Card */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 text-center space-y-2">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-700 block">
                6-Digit Client Session PIN
              </span>
              <div className="font-mono text-3xl font-extrabold tracking-widest text-slate-900 select-all">
                {remoteSessionCode}
              </div>
              <p className="text-[11px] text-slate-500">Valid for 15 minutes • TLS 1.3 encrypted</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshRemoteCode}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                🔄 Refresh Code
              </button>
              <button
                onClick={handleCopyRemoteLink}
                className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm"
              >
                {remoteCopied ? "✓ Link Copied!" : "📋 Copy Invite Link"}
              </button>
            </div>

            {/* Fast Launch Protocols */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Direct Protocol Launchers:</span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="ms-quick-assist:"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center hover:bg-white hover:border-blue-400 transition"
                  title="Open Microsoft Quick Assist"
                >
                  <span className="block text-sm">🪟</span>
                  <span className="text-[10px] font-bold text-slate-700 block mt-0.5">Quick Assist</span>
                </a>
                <a
                  href="anydesk:"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center hover:bg-white hover:border-blue-400 transition"
                  title="Open AnyDesk Client"
                >
                  <span className="block text-sm">🔴</span>
                  <span className="text-[10px] font-bold text-slate-700 block mt-0.5">AnyDesk</span>
                </a>
                <a
                  href="mstsc:"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center hover:bg-white hover:border-blue-400 transition"
                  title="Launch Windows RDP"
                >
                  <span className="block text-sm">💻</span>
                  <span className="text-[10px] font-bold text-slate-700 block mt-0.5">MS RDP</span>
                </a>
              </div>
            </div>

            <button
              onClick={() => setActiveToolModal(null)}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Done / Close Console
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. PASSWORD GENERATOR MODAL                                   */}
      {/* ============================================================= */}
      {activeToolModal === "password" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg font-bold">
                  🔐
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Enterprise Password Generator</h3>
                  <p className="text-[11px] text-slate-400">High-entropy cryptographic passwords for client accounts</p>
                </div>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Password Box */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900 break-all select-all">
                  {generatedPwd || "Generating..."}
                </span>
                <button
                  onClick={handleCopyPassword}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shrink-0"
                >
                  {pwdCopied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-700 font-semibold pt-1 border-t border-emerald-200/60">
                <span>Entropy: {pwdLength >= 16 ? "Military Grade (128-bit)" : "Strong (80-bit)"}</span>
                <span>Length: {pwdLength} characters</span>
              </div>
            </div>

            {/* Slider & Toggles */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Password Length</span>
                  <span className="font-bold text-blue-600">{pwdLength}</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={32}
                  value={pwdLength}
                  onChange={(e) => {
                    const l = parseInt(e.target.value);
                    setPwdLength(l);
                    generatePassword(l);
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pwdIncludeUpper}
                    onChange={(e) => {
                      setPwdIncludeUpper(e.target.checked);
                      setTimeout(() => generatePassword(), 50);
                    }}
                    className="accent-blue-600 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pwdIncludeNumbers}
                    onChange={(e) => {
                      setPwdIncludeNumbers(e.target.checked);
                      setTimeout(() => generatePassword(), 50);
                    }}
                    className="accent-blue-600 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer col-span-2">
                  <input
                    type="checkbox"
                    checked={pwdIncludeSymbols}
                    onChange={(e) => {
                      setPwdIncludeSymbols(e.target.checked);
                      setTimeout(() => generatePassword(), 50);
                    }}
                    className="accent-blue-600 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Symbols (!@#$%^&amp;*)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => generatePassword()}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
              >
                🔄 Regenerate
              </button>
              <button
                onClick={() => setActiveToolModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 8. IP LOOKUP & NETWORK DIAGNOSTIC MODAL                       */}
      {/* ============================================================= */}
      {activeToolModal === "ip" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                  🌐
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">IP &amp; DNS Diagnostic Tool</h3>
                  <p className="text-[11px] text-slate-400">Ping latency and DNS resolution test</p>
                </div>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Host / IP Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    placeholder="e.g. 103.145.72.18 or domain.com"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 outline-none font-mono focus:border-blue-500"
                  />
                  <button
                    onClick={handleRunIpLookup}
                    disabled={isPinging}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
                  >
                    {isPinging ? "Testing..." : "Diagnose"}
                  </button>
                </div>
              </div>

              {ipLookupResult && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-sans font-semibold">IP Address:</span>
                    <span className="font-bold text-slate-900">{ipLookupResult.ip}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-sans font-semibold">Reverse Hostname:</span>
                    <span className="text-slate-700">{ipLookupResult.hostname}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-sans font-semibold">Location / Node:</span>
                    <span className="text-slate-700">{ipLookupResult.location}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-sans font-semibold">Latency / RTT:</span>
                    <span className="font-bold text-emerald-600">{ipLookupResult.latency} (Low Latency)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-semibold">DNS Validation:</span>
                    <span className="font-bold text-blue-600">{ipLookupResult.dnsStatus}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveToolModal(null)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 9. SYSTEM INFO & LAB TELEMETRY MODAL                          */}
      {/* ============================================================= */}
      {activeToolModal === "system" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg font-bold">
                  ⚙️
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">System &amp; Cleanroom Bench Telemetry</h3>
                  <p className="text-[11px] text-slate-400">Live workstation specs and database connection telemetry</p>
                </div>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Host Platform</span>
                <span className="font-bold text-slate-800 block mt-1">
                  {systemInfoData?.os || "Windows 11 Enterprise (x64)"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CPU Cores</span>
                <span className="font-bold text-slate-800 block mt-1">
                  {systemInfoData?.cores || 8} Logical Cores
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lab Memory</span>
                <span className="font-bold text-slate-800 block mt-1">
                  {systemInfoData?.memory || "16 GB DDR5 RAM"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Screen Resolution</span>
                <span className="font-bold text-slate-800 block mt-1 font-mono">
                  {systemInfoData?.screen || "1920 x 1080"}
                </span>
              </div>

              <div className="col-span-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="font-bold text-emerald-950 block">Supabase Realtime WebSocket</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Channel: db_changes / live_telemetry</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  Connected
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveToolModal(null)}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 10. KNOWLEDGE BASE ARTICLE READER MODAL                        */}
      {/* ============================================================= */}
      {selectedKbArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 p-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {selectedKbArticle.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedKbArticle.readTime}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Updated {selectedKbArticle.updated}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {selectedKbArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedKbArticle(null)}
                className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Summary */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-900 block mb-1">Standard Operating Procedure Overview:</span>
                {selectedKbArticle.summary}
              </div>

              {/* Step by Step Checklist */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Step-by-Step Resolution Directives:
                </h4>
                <div className="space-y-2">
                  {selectedKbArticle.steps.map((step, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 accent-blue-600 rounded cursor-pointer"
                      />
                      <span className="text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 mr-1.5">{idx + 1}.</strong>
                        {step}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Code / Command Snippet if present */}
              {selectedKbArticle.codeSnippet && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">
                      Diagnostic Command / Automation Script:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedKbArticle.codeSnippet || "");
                        setNotification("Command snippet copied to clipboard!");
                        setTimeout(() => setNotification(""), 3000);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      📋 Copy Script
                    </button>
                  </div>
                  <pre className="rounded-xl border border-slate-800 bg-[#0f172a] p-3.5 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                    {selectedKbArticle.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedKbArticle(null)}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-500 transition shadow-sm cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
