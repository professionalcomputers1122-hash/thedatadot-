"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import {
  getCustomerSession,
  CustomerUser,
  getCustomerTheme,
  updateCustomerAvatar,
} from "@/lib/clientAuth";
import {
  fetchTicketsFromSupabase,
  deleteTicketFromSupabase,
  Ticket,
  TicketAttachment,
  getTicketAttachments,
} from "@/lib/portalData";

interface TimelineStage {
  title: string;
  description: string;
  state: "done" | "active" | "pending";
}

function getTimelineStages(
  category: string = "Data Recovery",
  status: string = "Intake & Diagnostics",
  clonedPercent: number = 0
): TimelineStage[] {
  const norm = (status || "").toLowerCase();

  const isResolved =
    norm.includes("resolved") ||
    norm.includes("completed") ||
    norm.includes("closed") ||
    (norm.includes("return") && norm.includes("resolved"));
  const isFinalStage =
    isResolved ||
    norm.includes("verification") ||
    norm.includes("return") ||
    norm.includes("handover") ||
    norm.includes("hardening") ||
    norm.includes("quality") ||
    clonedPercent >= 100;
  const isMidStage =
    isFinalStage ||
    norm.includes("imaging") ||
    norm.includes("clon") ||
    norm.includes("pc-3000") ||
    norm.includes("mirror") ||
    norm.includes("containment") ||
    norm.includes("remediation") ||
    norm.includes("deployment") ||
    norm.includes("migration") ||
    norm.includes("rollout") ||
    norm.includes("resolution") ||
    clonedPercent >= 75;
  const isDiagStage =
    isMidStage ||
    norm.includes("diagnosis") ||
    norm.includes("diagnostic") ||
    norm.includes("cleanroom") ||
    norm.includes("bench") ||
    norm.includes("threat") ||
    norm.includes("forensic") ||
    norm.includes("architecture") ||
    norm.includes("assessment") ||
    clonedPercent >= 50;

  if (category === "Cybersecurity") {
    const s1State =
      isDiagStage && !norm.includes("intake") && !norm.includes("new")
        ? "done"
        : "active";
    let s2State: "done" | "active" | "pending" = "pending";
    if (isMidStage && !norm.includes("threat") && !norm.includes("diagnostic"))
      s2State = "done";
    else if (
      norm.includes("threat") ||
      norm.includes("diagnostic") ||
      norm.includes("analysis")
    )
      s2State = "active";

    let s3State: "done" | "active" | "pending" = "pending";
    if (
      isFinalStage &&
      !norm.includes("containment") &&
      !norm.includes("remediation")
    )
      s3State = "done";
    else if (
      norm.includes("containment") ||
      norm.includes("remediation") ||
      norm.includes("patch")
    )
      s3State = "active";

    let s4State: "done" | "active" | "pending" = "pending";
    if (isResolved) s4State = "done";
    else if (
      norm.includes("verification") ||
      norm.includes("hardening") ||
      norm.includes("closure")
    )
      s4State = "active";

    return [
      {
        title: "1. Threat Intake",
        description:
          s1State === "done"
            ? "Threat profile registered & isolated."
            : "Intake triage & containment review.",
        state: isResolved ? "done" : s1State,
      },
      {
        title: "2. Security Forensics",
        description:
          s2State === "done"
            ? "Breach surface fully audited."
            : s2State === "active"
            ? "Analyzing attack vector & logs."
            : "Forensic analysis queued.",
        state: isResolved ? "done" : s2State,
      },
      {
        title: "3. Containment & Remediation",
        description:
          s3State === "done"
            ? "Compromised vectors neutralized."
            : s3State === "active"
            ? "Containment protocol & vector neutralization in progress."
            : "Remediation protocol queued.",
        state: isResolved ? "done" : s3State,
      },
      {
        title: "4. Policy Hardening",
        description: isResolved
          ? "Zero breach confirmed & signed off."
          : s4State === "active"
          ? "Policy verification & final hardening."
          : "Audit & sign-off pending.",
        state: isResolved ? "done" : s4State,
      },
    ];
  }

  if (category === "Cloud Solutions") {
    const s1State =
      isDiagStage && !norm.includes("intake") && !norm.includes("new")
        ? "done"
        : "active";
    let s2State: "done" | "active" | "pending" = "pending";
    if (
      isMidStage &&
      !norm.includes("architecture") &&
      !norm.includes("planning")
    )
      s2State = "done";
    else if (
      norm.includes("architecture") ||
      norm.includes("planning") ||
      norm.includes("assessment")
    )
      s2State = "active";

    let s3State: "done" | "active" | "pending" = "pending";
    if (
      isFinalStage &&
      !norm.includes("deployment") &&
      !norm.includes("migration")
    )
      s3State = "done";
    else if (norm.includes("deployment") || norm.includes("migration"))
      s3State = "active";

    let s4State: "done" | "active" | "pending" = "pending";
    if (isResolved) s4State = "done";
    else if (norm.includes("verification") || norm.includes("handover"))
      s4State = "active";

    return [
      {
        title: "1. Scope Intake",
        description:
          s1State === "done"
            ? "Cloud tenant specs registered."
            : "Requirements intake & triage.",
        state: isResolved ? "done" : s1State,
      },
      {
        title: "2. Cloud Architecture",
        description:
          s2State === "done"
            ? "Architecture design approved."
            : s2State === "active"
            ? "Validating tenant & network policies."
            : "Architecture review queued.",
        state: isResolved ? "done" : s2State,
      },
      {
        title: "3. Deployment & Migration",
        description:
          s3State === "done"
            ? "Cloud assets deployed & synced."
            : s3State === "active"
            ? "Cloud assets migration and workload provisioning active."
            : "Tenant migration queued.",
        state: isResolved ? "done" : s3State,
      },
      {
        title: "4. Handover & Audit",
        description: isResolved
          ? "Cloud services verified & active."
          : s4State === "active"
          ? "Testing uptime & client handover."
          : "Final audit pending.",
        state: isResolved ? "done" : s4State,
      },
    ];
  }

  if (category === "Managed IT") {
    const s1State =
      isDiagStage && !norm.includes("intake") && !norm.includes("new")
        ? "done"
        : "active";
    let s2State: "done" | "active" | "pending" = "pending";
    if (isMidStage && !norm.includes("assessment")) s2State = "done";
    else if (norm.includes("assessment") || norm.includes("diagnos"))
      s2State = "active";

    let s3State: "done" | "active" | "pending" = "pending";
    if (
      isFinalStage &&
      !norm.includes("rollout") &&
      !norm.includes("deploy")
    )
      s3State = "done";
    else if (
      norm.includes("rollout") ||
      norm.includes("deploy") ||
      norm.includes("repair")
    )
      s3State = "active";

    let s4State: "done" | "active" | "pending" = "pending";
    if (isResolved) s4State = "done";
    else if (norm.includes("verification") || norm.includes("handover"))
      s4State = "active";

    return [
      {
        title: "1. Ticket Intake",
        description:
          s1State === "done"
            ? "Equipment issue registered."
            : "Workstation triage in progress.",
        state: isResolved ? "done" : s1State,
      },
      {
        title: "2. Technical Assessment",
        description:
          s2State === "done"
            ? "Hardware/OS issue identified."
            : s2State === "active"
            ? "Diagnostics & bench triage."
            : "Bench assessment queued.",
        state: isResolved ? "done" : s2State,
      },
      {
        title: "3. Resolution & Rollout",
        description:
          s3State === "done"
            ? "Configuration / repair completed."
            : s3State === "active"
            ? "System configuration, patching and rollout underway."
            : "Rollout pending.",
        state: isResolved ? "done" : s3State,
      },
      {
        title: "4. Quality Verification",
        description: isResolved
          ? "Workstation verified & delivered."
          : s4State === "active"
          ? "Client test & satisfaction sign-off."
          : "Verification pending.",
        state: isResolved ? "done" : s4State,
      },
    ];
  }

  // Data Recovery (Default)
  let s1: "done" | "active" | "pending" = "done";
  let s2: "done" | "active" | "pending" = "pending";
  let s3: "done" | "active" | "pending" = "pending";
  let s4: "done" | "active" | "pending" = "pending";

  const isResolvedDR =
    isResolved ||
    (norm.includes("return") && norm.includes("resolved"));
  const isVerif =
    isResolvedDR ||
    norm.includes("verification") ||
    norm.includes("return") ||
    norm.includes("deliver") ||
    norm.includes("audit") ||
    clonedPercent >= 90;
  const isImaging =
    norm.includes("imaging") ||
    norm.includes("clon") ||
    norm.includes("pc-3000") ||
    norm.includes("mirror") ||
    norm.includes("sector") ||
    clonedPercent >= 75;
  const isDiag =
    norm.includes("diagnosis") ||
    norm.includes("diagnostic") ||
    norm.includes("cleanroom") ||
    clonedPercent >= 50;

  if (isResolvedDR) {
    s1 = "done";
    s2 = "done";
    s3 = "done";
    s4 = "done";
  } else if (isVerif) {
    s1 = "done";
    s2 = "done";
    s3 = "done";
    s4 = "active";
  } else if (isImaging) {
    s1 = "done";
    s2 = "done";
    s3 = "active";
    s4 = "pending";
  } else if (isDiag) {
    s1 = "done";
    s2 = "active";
    s3 = "pending";
    s4 = "pending";
  } else {
    s1 = "active";
    s2 = "pending";
    s3 = "pending";
    s4 = "pending";
  }

  return [
    {
      title: "1. Media Intake",
      description:
        s1 === "done"
          ? "Barcoded & logged in secure vault."
          : "Logged in secure queue & awaiting cleanroom triage.",
      state: s1,
    },
    {
      title: "2. Cleanroom Diagnostics",
      description:
        s2 === "done"
          ? "ISO Class-5 clean bench calibrated."
          : s2 === "active"
          ? "Donor head & platter micro-inspection in progress."
          : "Cleanroom bench queued.",
      state: s2,
    },
    {
      title: "3. PC-3000 Imaging",
      description:
        s3 === "done"
          ? "Raw platter sector mirror complete."
          : s3 === "active"
          ? "Raw platter sector mirror extraction in progress."
          : "Mirror cloning queued.",
      state: s3,
    },
    {
      title: "4. Verification & Return",
      description:
        s4 === "done"
          ? "Data integrity confirmed & delivered."
          : s4 === "active"
          ? "Client file audit & secure courier return."
          : "Integrity audit pending.",
      state: s4,
    },
  ];
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const currentCustomer = getCustomerSession();
    if (!currentCustomer) {
      router.push("/customer/login");
      return;
    }
    const activeCust = currentCustomer;
    setCustomer(activeCust);
    setTheme(getCustomerTheme());

    const userEmail = activeCust.email.toLowerCase();
    const userCompany = activeCust.company.toLowerCase();

    async function loadTickets() {
      try {
        let allTickets = await fetchTicketsFromSupabase(userEmail);
        let myTickets = allTickets.filter((t) => {
          if ((t as any).customerEmail && (t as any).customerEmail.toLowerCase() === userEmail) {
            return true;
          }
          if (userEmail.includes("aravind") && (t.id === "TDD-8942" || t.companyName.toLowerCase().includes("apex"))) {
            return true;
          }
          if (userCompany && userCompany.trim().length > 2 && t.companyName.toLowerCase().trim() === userCompany.trim()) {
            return true;
          }
          return false;
        });

        // Fallback: If no tickets matched customer filter, load all tickets so demo/test accounts see live cases
        if (myTickets.length === 0) {
          const globalTickets = await fetchTicketsFromSupabase();
          if (globalTickets && globalTickets.length > 0) {
            myTickets = globalTickets;
          }
        }

        // Apply instant local overrides from technician dashboard for zero-latency cross-tab sync
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("tdd_ticket_overrides");
            if (raw) {
              const overrides = JSON.parse(raw);
              myTickets = myTickets.map((t) => {
                const ov =
                  overrides[t.id] ||
                  (t.id ? overrides[t.id.toUpperCase()] : null) ||
                  (t.id ? overrides[t.id.toLowerCase()] : null);
                if (ov) {
                  return {
                    ...t,
                    status: ov.status || t.status,
                    clonedPercent: ov.progress !== undefined ? ov.progress : t.clonedPercent,
                    priority: ov.priority || t.priority,
                    assignedBench: ov.bench || t.assignedBench,
                    techNotes: ov.notes || t.techNotes,
                  };
                }
                return t;
              });
            }
          } catch (e) {
            console.warn("Could not apply local overrides in customer dashboard:", e);
          }
        }

        setTickets(myTickets);
      } catch (err) {
        console.warn("Failed to load customer tickets:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
    const interval = setInterval(loadTickets, 5000);
    const handleUpdate = () => loadTickets();
    const handleThemeChange = () => setTheme(getCustomerTheme());
    const handleProfileChange = () => setCustomer(getCustomerSession());

    window.addEventListener("tickets-updated", handleUpdate);
    window.addEventListener("customer-theme-changed", handleThemeChange);
    window.addEventListener("customer-profile-updated", handleProfileChange);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("storage", handleThemeChange);
    window.addEventListener("storage", handleProfileChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("tickets-updated", handleUpdate);
      window.removeEventListener("customer-theme-changed", handleThemeChange);
      window.removeEventListener("customer-profile-updated", handleProfileChange);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("storage", handleThemeChange);
      window.removeEventListener("storage", handleProfileChange);
    };
  }, [router]);

  const [deleteModalTicket, setDeleteModalTicket] = useState<Ticket | null>(null);

  const handleConfirmDeleteTicket = async () => {
    if (!deleteModalTicket) return;
    const ticketId = deleteModalTicket.id;

    setDeletingId(ticketId);
    try {
      const ok = await deleteTicketFromSupabase(ticketId);
      if (ok) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      }
      setDeleteModalTicket(null);
    } catch (err) {
      console.error("Delete ticket error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const activeTicket = tickets.length > 0 ? (tickets.find((t) => t.status !== "Resolved") || tickets[0]) : null;
  const activeCount = tickets.filter((t) => t.status !== "Resolved").length;

  const stages = activeTicket
    ? getTimelineStages(activeTicket.category, activeTicket.status, activeTicket.clonedPercent || 0)
    : [];

  // Synchronize attachments for active ticket
  useEffect(() => {
    if (!activeTicket?.id) {
      setAttachments([]);
      return;
    }

    const refreshAttachments = () => {
      const atts = getTicketAttachments(activeTicket.id);
      setAttachments(atts);
    };

    refreshAttachments();
    window.addEventListener("attachments-updated", refreshAttachments);
    window.addEventListener("storage", refreshAttachments);
    return () => {
      window.removeEventListener("attachments-updated", refreshAttachments);
      window.removeEventListener("storage", refreshAttachments);
    };
  }, [activeTicket?.id]);

  // Client Photo Upload Handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      updateCustomerAvatar(result);
      setCustomer((prev) => (prev ? { ...prev, avatarUrl: result } : prev));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Remove custom profile photo and revert to company initials?")) {
      updateCustomerAvatar(null);
      setCustomer((prev) => (prev ? { ...prev, avatarUrl: undefined } : prev));
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "CL";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        isDark ? "bg-[#070e1b] text-slate-100" : "bg-[#fafbfd] text-slate-900"
      }`}
    >
      <CustomerNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* WELCOME BANNER WITH CLIENT PHOTO PROFILE */}
        <div
          className={`mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl border transition ${
            isDark
              ? "border-[#15243b] bg-[#0a1526]"
              : "border-slate-200 bg-white shadow-xs"
          }`}
        >
          {/* USER AVATAR & INFO */}
          <div className="flex items-center gap-4">
            {/* AVATAR WITH PHOTO UPLOAD TRIGGER */}
            <div className="relative group">
              <div
                className={`relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl overflow-hidden font-black text-xl sm:text-2xl shadow-md border-2 transition ${
                  isDark
                    ? "bg-blue-600 text-white border-blue-500/40"
                    : "bg-blue-600 text-white border-blue-200"
                }`}
              >
                {customer?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customer.avatarUrl}
                    alt={customer?.name || "Client"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(customer?.name)}</span>
                )}

                {/* CAMERA OVERLAY ON HOVER */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Upload or change profile photo"
                  className="absolute inset-0 bg-slate-950/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
                >
                  <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span>Edit</span>
                </button>
              </div>

              {/* HIDDEN FILE INPUT */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFileChange}
                aria-label="Upload profile photo"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                    isDark
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  <span>{customer?.company || "Enterprise Client Desk"}</span>
                  <span className="opacity-60">• #{customer?.accountNumber || "TDD-CLI-8492"}</span>
                </span>

                {customer?.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className={`text-[10px] underline cursor-pointer transition ${
                      isDark ? "text-slate-400 hover:text-rose-400" : "text-slate-500 hover:text-rose-600"
                    }`}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
                Welcome back, {customer?.name || "Client"}
              </h1>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Live telemetry and forensic lifecycle tracking for your support cases.
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                isDark
                  ? "border-[#1b314f] bg-[#0e1d33] text-slate-200 hover:bg-[#142844] hover:text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span>{customer?.avatarUrl ? "Change Photo" : "Add Photo"}</span>
            </button>

            <Link
              href="/customer/tickets/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>Open Support Ticket</span>
            </Link>
          </div>
        </div>

        {/* METRICS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            className={`rounded-2xl border p-5 transition ${
              isDark ? "border-[#15243b] bg-[#0c182a]" : "border-slate-200 bg-white shadow-xs"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
              {activeTicket?.category === "Cybersecurity"
                ? "Active Incident"
                : activeTicket?.category === "Cloud Solutions"
                ? "Active Cloud Ticket"
                : activeTicket?.category === "Managed IT"
                ? "Active Fleet Ticket"
                : "Active Recovery"}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-500">
                {activeCount} {activeCount === 1 ? "Case" : "Cases"}
              </span>
              {activeTicket && (
                <span className="text-[11px] font-semibold text-emerald-500 truncate max-w-[150px]" title={activeTicket.status}>
                  {activeTicket.status || "Media Intake"}
                </span>
              )}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-5 transition ${
              isDark ? "border-[#15243b] bg-[#0c182a]" : "border-slate-200 bg-white shadow-xs"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
              SLA Response Guarantee
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                15-Min
              </span>
              <span className="text-[11px] font-semibold text-blue-500">24/7/365</span>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-5 transition ${
              isDark ? "border-[#15243b] bg-[#0c182a]" : "border-slate-200 bg-white shadow-xs"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
              Service Standard
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-500">
                {activeTicket?.category === "Cybersecurity"
                  ? "Zero Breach"
                  : activeTicket?.category === "Cloud Solutions" || activeTicket?.category === "Managed IT"
                  ? "99.99%"
                  : "99.98%"}
              </span>
              <span className="text-[11px] font-semibold opacity-60">
                {activeTicket?.category === "Cybersecurity"
                  ? "SOC Assurance"
                  : activeTicket?.category === "Cloud Solutions" || activeTicket?.category === "Managed IT"
                  ? "Uptime SLA"
                  : "Cleanroom Score"}
              </span>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-5 transition ${
              isDark ? "border-[#15243b] bg-[#0c182a]" : "border-slate-200 bg-white shadow-xs"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
              Total Cases
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                {tickets.length} Cases
              </span>
              <span className="text-[11px] font-semibold opacity-60">
                {activeCount} Active · {tickets.length - activeCount} Closed
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE CASE SPOTLIGHT OR EMPTY STATE */}
        {activeTicket ? (
          <div
            className={`rounded-3xl border p-6 sm:p-8 shadow-sm mb-8 transition ${
              isDark
                ? "border-[#192f4c] bg-gradient-to-br from-[#091424] via-[#0c192c] to-[#091424]"
                : "border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/20"
            }`}
          >
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 mb-6 ${
                isDark ? "border-[#162740]" : "border-slate-200/80"
              }`}
            >
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-2 border ${
                    isDark
                      ? "border-blue-500/30 bg-blue-500/15 text-blue-300"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                  </span>
                  <span>
                    {activeTicket.category === "Cybersecurity"
                      ? "Cybersecurity Response Target"
                      : activeTicket.category === "Cloud Solutions"
                      ? "Cloud Infrastructure Target"
                      : activeTicket.category === "Managed IT"
                      ? "Managed IT Workstation"
                      : "Forensic Hardware Target"}{" "}
                    • Case #{activeTicket.id}
                  </span>
                </div>

                <h2 className={`text-xl sm:text-2xl font-extrabold ${isDark ? "text-white" : "text-slate-950"}`}>
                  {activeTicket.deviceOrSubject}
                </h2>

                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {activeTicket.category === "Cybersecurity" ? (
                    <>Target Segment / Host: <strong>{activeTicket.serialNumber || "Corporate Network"}</strong> • Indicators: {activeTicket.symptoms || "Threat analysis in progress"}</>
                  ) : activeTicket.category === "Cloud Solutions" || activeTicket.category === "Managed IT" ? (
                    <>System Target: <strong>{activeTicket.serialNumber || "Enterprise Tenant"}</strong> • Scope: {activeTicket.symptoms || "Technical deployment underway"}</>
                  ) : (
                    <>Serial: <strong>{activeTicket.serialNumber || "N/A"}</strong> • Reported: {activeTicket.symptoms || "Hardware failure diagnostics"}</>
                  )}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs opacity-60 block">
                  {activeTicket.category === "Cybersecurity"
                    ? "Assigned Security Lead"
                    : activeTicket.category === "Cloud Solutions"
                    ? "Assigned Cloud Architect"
                    : activeTicket.category === "Managed IT"
                    ? "Assigned Systems Lead"
                    : "Assigned Lead Engineer"}
                </span>
                <span className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {activeTicket.assignedTech && activeTicket.assignedTech !== "Unassigned"
                    ? activeTicket.assignedTech
                    : "Pending Specialist Dispatch"}
                </span>
                <p className="text-xs font-bold text-blue-500 mt-0.5">
                  {activeTicket.assignedTech && activeTicket.assignedTech !== "Unassigned"
                    ? "Direct Desk Hotline: +91 6380488373"
                    : "Triage Queue • Specialist Pending"}
                </p>
              </div>
            </div>

            {/* DYNAMIC 4-STAGE VISUAL TIMELINE */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-6">
              {stages.map((stg, sIdx) => {
                if (stg.state === "done") {
                  return (
                    <div
                      key={sIdx}
                      className={`rounded-2xl border p-4 transition ${
                        isDark
                          ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                          : "border-emerald-200 bg-emerald-50/80 text-emerald-900"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{stg.title}</span>
                      </span>
                      <p className="text-[11px] opacity-80 mt-1">{stg.description}</p>
                      <span className="text-[10px] text-emerald-500 block mt-2 font-bold">Done</span>
                    </div>
                  );
                }
                if (stg.state === "active") {
                  return (
                    <div
                      key={sIdx}
                      className={`rounded-2xl border-2 p-4 shadow-sm relative overflow-hidden transition ${
                        isDark
                          ? "border-blue-500 bg-blue-950/30 text-blue-100 ring-2 ring-blue-500/20"
                          : "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5 text-blue-500">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                        <span>{stg.title}</span>
                      </span>
                      <p className="text-[11px] opacity-90 mt-1">{stg.description}</p>
                      <span className="text-[10px] text-blue-500 block mt-2 font-extrabold">
                        Active In Progress
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={sIdx}
                    className={`rounded-2xl border p-4 opacity-70 transition ${
                      isDark
                        ? "border-[#15233b] bg-[#0b1626]/60 text-slate-400"
                        : "border-slate-200 bg-slate-50/80 text-slate-500"
                    }`}
                  >
                    <span className="text-xs font-bold">○ {stg.title}</span>
                    <p className="text-[11px] opacity-80 mt-1">{stg.description}</p>
                    <span className="text-[10px] opacity-60 block mt-2">Pending</span>
                  </div>
                );
              })}
            </div>

            {/* ATTACHED LABORATORY FILES & DIAGNOSTICS (Real-time synced from technician) */}
            <div
              className={`rounded-2xl border p-5 mb-6 transition ${
                isDark ? "border-[#172740] bg-[#0a1526]/80" : "border-slate-200/90 bg-white shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Attached Laboratory Files &amp; Diagnostics
                  </span>
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-extrabold text-blue-400">
                    {attachments.length}
                  </span>
                </div>

                <span className="text-[10px] opacity-60 hidden sm:inline-block">
                  Synced directly with Cleanroom &amp; Technician Workspace
                </span>
              </div>

              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {attachments.map((file) => {
                    const isImg = file.type === "image" || /\.(png|jpg|jpeg|webp)$/i.test(file.name);
                    const isPdf = file.type === "pdf" || /\.pdf$/i.test(file.name);

                    return (
                      <div
                        key={file.id}
                        className={`group flex items-center justify-between rounded-xl border p-3 transition ${
                          isDark
                            ? "border-[#1b2f4c] bg-[#0e1d33] hover:border-blue-500/40"
                            : "border-slate-200 bg-slate-50/80 hover:border-blue-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isPdf
                                ? "bg-rose-500/15 text-rose-400"
                                : isImg
                                ? "bg-indigo-500/15 text-indigo-400"
                                : "bg-blue-500/15 text-blue-400"
                            }`}
                          >
                            {isPdf ? "PDF" : isImg ? "IMG" : "DOC"}
                          </div>

                          <div className="min-w-0">
                            <span
                              className={`block truncate text-xs font-bold ${
                                isDark ? "text-slate-200" : "text-slate-800"
                              }`}
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <span className="block text-[10px] opacity-60">
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
                              className={`rounded-lg p-1.5 text-xs transition cursor-pointer ${
                                isDark
                                  ? "hover:bg-[#152740] text-blue-400"
                                  : "hover:bg-slate-200 text-blue-600"
                              }`}
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
                              className={`rounded-lg p-1.5 text-xs font-bold transition flex items-center gap-1 ${
                                isDark
                                  ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-[10px] opacity-40">Stored</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={`rounded-xl border border-dashed p-4 text-center text-xs ${
                    isDark ? "border-[#1c2e47] text-slate-400" : "border-slate-200 text-slate-500"
                  }`}
                >
                  <p>No laboratory files or diagnostic attachments uploaded yet for this case.</p>
                  <p className="text-[10px] opacity-60 mt-0.5">
                    Bench reports and forensic media logs will appear here automatically as tests complete.
                  </p>
                </div>
              )}
            </div>

            {/* CASE GUARANTEES & FOOTER ACTIONS */}
            <div
              className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${
                isDark ? "border-[#162740]" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-center gap-2 text-xs opacity-70">
                <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>
                  {activeTicket.category === "Data Recovery" ? (
                    <>Protected by <strong>No Data, No Recovery Fee</strong> guarantee.</>
                  ) : activeTicket.category === "Cybersecurity" ? (
                    <>Protected by <strong>Enterprise SOC &amp; Incident Containment SLA</strong>.</>
                  ) : (
                    <>Backed by <strong>Dedicated Enterprise SLA &amp; Guaranteed Uptime</strong>.</>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalTicket(activeTicket)}
                  disabled={deletingId === activeTicket.id}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isDark
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                      : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                  title="Permanently remove this ticket"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  <span>Delete Ticket</span>
                </button>

                <Link
                  href={`/customer/tickets/${activeTicket.id}`}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-sm transition"
                >
                  View Full Ticket Thread →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-3xl border border-dashed p-10 text-center mb-8 transition ${
              isDark ? "border-[#1a2c47] bg-[#0a1526]" : "border-slate-300 bg-white"
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <line x1="12" x2="12" y1="22" y2="12" />
              </svg>
            </div>
            <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
              No Active Service Cases
            </h3>
            <p className={`mt-1 text-xs max-w-md mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Your organization currently has no open tickets. If you experience hardware failure, security alerts, or cloud service outages, open a ticket for immediate dispatch.
            </p>
            <div className="mt-5">
              <Link
                href="/customer/tickets/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-xs transition"
              >
                <span>+ Open Your First Ticket</span>
              </Link>
            </div>
          </div>
        )}

        {/* RECENT TICKETS TABLE */}
        <div
          className={`rounded-3xl border p-6 sm:p-8 transition ${
            isDark ? "border-[#15243b] bg-[#0a1526]" : "border-slate-200 bg-white shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                Your Tickets
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Active and recent support requests
              </p>
            </div>
            <Link
              href="/customer/tickets"
              className="text-xs font-bold text-blue-500 hover:underline"
            >
              View All Tickets ({tickets.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {tickets.length > 0 ? (
              <table className={`w-full text-left text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <thead
                  className={`text-[10px] font-bold uppercase border-b ${
                    isDark
                      ? "border-[#15233b] bg-[#070e1b] text-slate-400"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <tr>
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-[#15233b]" : "divide-slate-100"}`}>
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      className={`transition ${isDark ? "hover:bg-[#0e1d32]" : "hover:bg-slate-50/60"}`}
                    >
                      <td className="px-4 py-3.5 font-bold text-blue-500">#{t.id}</td>
                      <td className={`px-4 py-3.5 font-semibold ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                        {t.category}
                      </td>
                      <td className={`px-4 py-3.5 font-medium ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                        {t.deviceOrSubject}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            t.status === "Resolved"
                              ? isDark
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                                : "bg-emerald-100 text-emerald-800"
                              : isDark
                              ? "bg-blue-950/60 text-blue-400 border border-blue-800/50"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/customer/tickets/${t.id}`}
                            className="font-bold text-blue-500 hover:underline"
                          >
                            Inspect →
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteModalTicket(t)}
                            disabled={deletingId === t.id}
                            className={`p-1.5 rounded transition cursor-pointer ${
                              isDark
                                ? "text-rose-400 hover:bg-rose-950/40"
                                : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            }`}
                            title={`Delete Ticket #${t.id}`}
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No tickets registered yet for {customer?.company || "your account"}.
              </div>
            )}
          </div>
        </div>

        {/* IMAGE PREVIEW LIGHTBOX MODAL */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">Attached Laboratory Photo Preview</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Laboratory Preview"
                  className="max-h-[70vh] max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* MODERN DELETE MODAL */}
        <ModernDeleteModal
          isOpen={!!deleteModalTicket}
          onClose={() => setDeleteModalTicket(null)}
          onConfirm={handleConfirmDeleteTicket}
          title="Delete Support Case"
          itemType="Ticket"
          itemName={deleteModalTicket ? `Case #${deleteModalTicket.id} - ${deleteModalTicket.deviceOrSubject}` : ""}
          description={
            deleteModalTicket
              ? `Are you sure you want to permanently delete Case #${deleteModalTicket.id}? This will remove the case from your portal and purge all historical diagnostics.`
              : ""
          }
          confirmButtonText="Permanently Delete Case"
          isDeleting={!!deletingId}
        />
      </main>

      <Footer />
    </div>
  );
}
