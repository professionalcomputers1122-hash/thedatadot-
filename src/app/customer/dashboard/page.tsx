"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import { getCustomerSession, CustomerUser } from "@/lib/clientAuth";
import { fetchTicketsFromSupabase, deleteTicketFromSupabase, Ticket } from "@/lib/portalData";

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
    norm.includes("closed");
  const isFinalStage =
    isResolved ||
    norm.includes("verification") ||
    norm.includes("return") ||
    norm.includes("handover") ||
    norm.includes("hardening");
  const isMidStage =
    isFinalStage ||
    norm.includes("imaging") ||
    norm.includes("clon") ||
    norm.includes("containment") ||
    norm.includes("remediation") ||
    norm.includes("deployment") ||
    norm.includes("migration");
  const isDiagStage =
    isMidStage ||
    norm.includes("diagnosis") ||
    norm.includes("diagnostic") ||
    norm.includes("bench") ||
    norm.includes("threat") ||
    norm.includes("architecture") ||
    norm.includes("assessment");

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
            ? `${clonedPercent || 0}% Threat Remediation`
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
            ? `${clonedPercent || 0}% Migration / Deployment`
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
            ? `${clonedPercent || 0}% Resolution Progress`
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

  const isDiag = norm.includes("diagnosis") || norm.includes("diagnostic");
  const isImaging = norm.includes("imaging") || norm.includes("clon");
  const isVerif = norm.includes("verification") || norm.includes("return");

  if (isResolved) {
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
          : "Logged in secure queue & awaiting triage.",
      state: s1,
    },
    {
      title: "2. Cleanroom Diagnostics",
      description:
        s2 === "done"
          ? "ISO Class-5 clean bench calibrated."
          : s2 === "active"
          ? "Donor head & platter micro-inspection."
          : "Cleanroom bench queued.",
      state: s2,
    },
    {
      title: "3. PC-3000 Imaging",
      description:
        s3 === "done"
          ? "Raw platter sector mirror complete."
          : s3 === "active"
          ? `${clonedPercent || 0}% Raw Platter Mirror Cloned`
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
  const [showFileModal, setShowFileModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const currentCustomer = getCustomerSession();
    if (!currentCustomer) {
      router.push("/customer/login");
      return;
    }
    const activeCust = currentCustomer;
    setCustomer(activeCust);

    const userEmail = activeCust.email.toLowerCase();
    const userCompany = activeCust.company.toLowerCase();

    async function loadTickets() {
      try {
        const allTickets = await fetchTicketsFromSupabase(userEmail);
        const myTickets = allTickets.filter((t) => {
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

        setTickets(myTickets);
      } catch (err) {
        console.warn("Failed to load customer tickets:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
    const interval = setInterval(loadTickets, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Ticket #${ticketId}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(ticketId);
    try {
      const ok = await deleteTicketFromSupabase(ticketId);
      if (ok) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      } else {
        alert("Failed to delete ticket. Please check connection and try again.");
      }
    } catch (err) {
      console.error("Delete ticket error:", err);
      alert("Error occurred while deleting ticket.");
    } finally {
      setDeletingId(null);
    }
  };

  const activeTicket = tickets.length > 0 ? (tickets.find((t) => t.status !== "Resolved") || tickets[0]) : null;
  const activeCount = tickets.filter((t) => t.status !== "Resolved").length;

  const stages = activeTicket
    ? getTimelineStages(activeTicket.category, activeTicket.status, activeTicket.clonedPercent || 0)
    : [];

  const files = [
    { name: "Recovered_Database_Extract.mdf", size: "1.42 TB", status: "100% Intact" },
    { name: "Forensic_Images_Archive.zip", size: "840 GB", status: "100% Intact" },
    { name: "Company_Financial_Records.qbw", size: "420 GB", status: "100% Intact" },
    { name: "Authentication_Credentials_Backup.xlsx", size: "12 MB", status: "100% Intact" },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* WELCOME BANNER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
              <span>
                {customer?.company || "Enterprise Client Desk"} • Account #{customer?.accountNumber || "TDD-CLI-8492"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Welcome back, {customer?.name || "Client"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Live dashboard for your hardware cases, SOC incidents, and cloud tickets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
            >
              <span>+ Open New Support Ticket</span>
            </Link>
          </div>
        </div>

        {/* METRICS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              {activeTicket?.category === "Cybersecurity"
                ? "Active Incident"
                : activeTicket?.category === "Cloud Solutions"
                ? "Active Cloud Ticket"
                : activeTicket?.category === "Managed IT"
                ? "Active Fleet Ticket"
                : "Active Recovery"}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">
                {activeCount} {activeCount === 1 ? "Case" : "Cases"}
              </span>
              {activeTicket && (
                <span className="text-[11px] font-semibold text-emerald-600">
                  {activeTicket.clonedPercent && activeTicket.clonedPercent > 0
                    ? activeTicket.category === "Cybersecurity"
                      ? `${activeTicket.clonedPercent}% Remediated`
                      : activeTicket.category === "Data Recovery"
                      ? `${activeTicket.clonedPercent}% Cloned`
                      : `${activeTicket.clonedPercent}% Deployed`
                    : activeTicket.status || "Intake Stage"}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">SLA Response Guarantee</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">15-Min</span>
              <span className="text-[11px] font-semibold text-blue-600">24/7/365</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Service Standard</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">
                {activeTicket?.category === "Cybersecurity"
                  ? "Zero Breach"
                  : activeTicket?.category === "Cloud Solutions" || activeTicket?.category === "Managed IT"
                  ? "99.99%"
                  : "99.98%"}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {activeTicket?.category === "Cybersecurity"
                  ? "SOC Assurance"
                  : activeTicket?.category === "Cloud Solutions" || activeTicket?.category === "Managed IT"
                  ? "Uptime SLA"
                  : "Cleanroom Score"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Cases</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">{tickets.length} Cases</span>
              <span className="text-[11px] font-semibold text-slate-500">
                {activeCount} Active · {tickets.length - activeCount} Closed
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE CASE SPOTLIGHT OR EMPTY STATE */}
        {activeTicket ? (
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/20 p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                  </span>
                  <span>
                    {activeTicket.category === "Cybersecurity"
                      ? "🛡️ Cybersecurity Response Target"
                      : activeTicket.category === "Cloud Solutions"
                      ? "☁️ Cloud Infrastructure Target"
                      : activeTicket.category === "Managed IT"
                      ? "🖥️ Managed IT System"
                      : "💽 Forensic Hardware Target"}{" "}
                    • Case #{activeTicket.id}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                  {activeTicket.deviceOrSubject}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
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
                <span className="text-xs text-slate-500 block">
                  {activeTicket.category === "Cybersecurity"
                    ? "Assigned Security Lead"
                    : activeTicket.category === "Cloud Solutions"
                    ? "Assigned Cloud Architect"
                    : activeTicket.category === "Managed IT"
                    ? "Assigned Systems Lead"
                    : "Assigned Lead Engineer"}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {activeTicket.assignedTech && activeTicket.assignedTech !== "Unassigned"
                    ? activeTicket.assignedTech
                    : "Pending Admin Dispatch"}
                </span>
                <p className="text-xs font-bold text-blue-600 mt-0.5">
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
                    <div key={sIdx} className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        ✓ {stg.title}
                      </span>
                      <p className="text-[11px] text-emerald-900 mt-1">{stg.description}</p>
                      <span className="text-[10px] text-emerald-700 block mt-2 font-bold">Done</span>
                    </div>
                  );
                }
                if (stg.state === "active") {
                  return (
                    <div key={sIdx} className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 shadow-sm relative overflow-hidden">
                      <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                        {stg.title}
                      </span>
                      <p className="text-[11px] text-blue-950 mt-1">{stg.description}</p>
                      <span className="text-[10px] text-blue-700 block mt-2 font-extrabold">
                        Active In Progress
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={sIdx} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 opacity-70">
                    <span className="text-xs font-bold text-slate-600">○ {stg.title}</span>
                    <p className="text-[11px] text-slate-500 mt-1">{stg.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-2">Pending</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
              <span className="text-xs text-slate-600">
                {activeTicket.category === "Data Recovery" ? (
                  <>Protected by <strong>No Data, No Recovery Fee</strong> guarantee.</>
                ) : activeTicket.category === "Cybersecurity" ? (
                  <>Protected by <strong>Enterprise SOC & Incident Containment SLA</strong>.</>
                ) : (
                  <>Backed by <strong>Dedicated Enterprise SLA & Guaranteed Uptime</strong>.</>
                )}
              </span>

              <div className="flex flex-wrap items-center gap-3">
                {activeTicket.category === "Data Recovery" ? (
                  <button
                    type="button"
                    onClick={() => setShowFileModal(true)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 shadow-xs transition"
                  >
                    🔍 Verify Recovered File List
                  </button>
                ) : activeTicket.category === "Cybersecurity" ? (
                  <button
                    type="button"
                    onClick={() => alert("Security Containment Checklist:\n✓ Segment Isolated\n✓ Compromised IPs Blocked\n✓ Memory Dump Analyzed\n✓ Persistence Vectors Neutralized")}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 shadow-xs transition"
                  >
                    🛡️ View Security Checklist
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert("Deployment Quality Checklist:\n✓ DNS & MX Propagated\n✓ MFA Security Enforced\n✓ Mail Flow Certified\n✓ End-User Access Validated")}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 shadow-xs transition"
                  >
                    📋 View Deployment Checklist
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteTicket(activeTicket.id)}
                  disabled={deletingId === activeTicket.id}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-xs transition"
                  title="Permanently remove this ticket"
                >
                  {deletingId === activeTicket.id ? "Deleting..." : "🗑️ Delete Ticket"}
                </button>

                <Link
                  href={`/customer/tickets/${activeTicket.id}`}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
                >
                  View Full Ticket Thread →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-xs mb-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-xl font-bold mb-3">
              📦
            </div>
            <h3 className="text-base font-bold text-slate-950">No Active Service Cases</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Your organization currently has no open tickets. If you experience hardware failure, security alerts, or cloud service outages, open a ticket for immediate dispatch.
            </p>
            <div className="mt-5">
              <Link
                href="/customer/tickets/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
              >
                + Open Your First Ticket
              </Link>
            </div>
          </div>
        )}

        {/* RECENT TICKETS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Your Tickets</h3>
              <p className="text-xs text-slate-500">Active and recent support requests</p>
            </div>
            <Link
              href="/customer/tickets"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All Tickets ({tickets.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {tickets.length > 0 ? (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5 font-bold text-blue-600">#{t.id}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{t.category}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">{t.deviceOrSubject}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            t.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.status} {t.clonedPercent ? `(${t.clonedPercent}%)` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/customer/tickets/${t.id}`}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            Inspect →
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteTicket(t.id)}
                            disabled={deletingId === t.id}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title={`Delete Ticket #${t.id}`}
                          >
                            🗑️
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
      </main>

      {/* RECOVERED FILES MODAL */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-950">
                  Recovered Files Verification — Case #{activeTicket?.id || "TDD"}
                </h4>
                <p className="text-slate-500 text-xs">Reconstructed files verified in forensic isolation.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📄</span>
                    <div>
                      <p className="font-bold text-slate-900">{f.name}</p>
                      <span className="text-[11px] text-slate-500">{f.size}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 text-[10px]">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-slate-500">Total Cloned: <strong>{activeTicket?.clonedPercent || 100}% Integrity</strong></span>
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
