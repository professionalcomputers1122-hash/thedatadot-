"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import AdvancedDataRecoveryReportModal, {
  AdvancedReportData,
} from "@/components/AdvancedDataRecoveryReportModal";
import { fetchTicketsFromSupabase, deleteTicketFromSupabase, Ticket } from "@/lib/portalData";
import {
  fetchReportsFromSupabase,
  deleteReportFromSupabase,
  DiagnosisReport,
} from "@/lib/reportData";
import { getAdminSession } from "@/lib/adminAuth";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);

  const [adminName, setAdminName] = useState("Ebinezer");
  const [adminEmail, setAdminEmail] = useState("ebinezer@thedatadot.com");

  // Ticket filters
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketCategory, setTicketCategory] = useState("ALL");
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [deleteModalTicket, setDeleteModalTicket] = useState<Ticket | null>(null);

  // Report filters & modals
  const [reportSearch, setReportSearch] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState<Partial<AdvancedReportData> | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<DiagnosisReport | null>(null);
  const [isDeletingReport, setIsDeletingReport] = useState(false);
  const [notification, setNotification] = useState("");

  // Load live data from Supabase and APIs
  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const liveReports = await fetchReportsFromSupabase();
      if (liveReports) {
        setReports(liveReports);
      }
    } catch (e) {
      console.warn("Failed loading reports on admin dashboard:", e);
    } finally {
      setReportsLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const liveTickets = await fetchTicketsFromSupabase();
      setTickets(liveTickets || []);
    } catch (e) {
      console.warn("Tickets load warn:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.customers)) {
          setCustomerCount(data.customers.length);
        }
      }
    } catch (e) {
      console.warn("Failed fetching customer count:", e);
    }

    try {
      const inqRes = await fetch("/api/inquiries?status=New%20Request");
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        if (Array.isArray(inqData.inquiries)) {
          setNewInquiriesCount(inqData.inquiries.length);
        }
      }
    } catch (e) {
      console.warn("Failed fetching inquiries count:", e);
    }
  };

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      setAdminName(session.name);
      setAdminEmail(session.email);
    }

    loadTickets();
    loadReports();
    loadMetrics();

    // Setup periodic polling & real-time broadcast listeners
    const interval = setInterval(() => {
      loadTickets();
      loadReports();
      loadMetrics();
    }, 12000);

    const handleReportsUpdate = () => loadReports();
    window.addEventListener("reports-updated", handleReportsUpdate);
    window.addEventListener("tickets-updated", loadTickets);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("tdd-ticket-sync");
        bc.onmessage = (ev) => {
          if (
            ev.data?.type === "REPORT_SAVED" ||
            ev.data?.type === "REPORT_DELETED" ||
            ev.data?.type === "REPORTS_UPDATED"
          ) {
            loadReports();
          } else if (ev.data?.type === "TICKET_UPDATED" || ev.data?.type === "TICKET_CREATED") {
            loadTickets();
          }
        };
      } catch (e) {}
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("reports-updated", handleReportsUpdate);
      window.removeEventListener("tickets-updated", loadTickets);
      if (bc) {
        try {
          bc.close();
        } catch (e) {}
      }
    };
  }, []);

  // Delete Ticket
  const handleConfirmDeleteTicket = async () => {
    if (!deleteModalTicket) return;
    const ticketId = deleteModalTicket.id;
    setDeletingTicketId(ticketId);
    try {
      const ok = await deleteTicketFromSupabase(ticketId);
      if (ok) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        showNotification(`✓ Ticket #${ticketId} deleted successfully.`);
      }
      setDeleteModalTicket(null);
    } catch (err) {
      console.error("Delete ticket error:", err);
    } finally {
      setDeletingTicketId(null);
    }
  };

  // Delete Report
  const handleConfirmDeleteReport = async () => {
    if (!reportToDelete) return;
    setIsDeletingReport(true);
    try {
      const repId = reportToDelete.id || `DR-${reportToDelete.jobId}`;
      await deleteReportFromSupabase(repId);
      setReports((prev) => prev.filter((r) => r.id !== repId && r.jobId !== reportToDelete.jobId));
      showNotification(`✓ Forensic Report #${repId} deleted from database.`);
      setReportToDelete(null);
    } catch (err) {
      console.error("Delete report error:", err);
    } finally {
      setIsDeletingReport(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const unassignedCount = tickets.filter(
    (t) => !t.assignedTech || t.assignedTech === "Unassigned"
  ).length;

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = ticketSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.deviceOrSubject.toLowerCase().includes(q) ||
        (t.assignedTech && t.assignedTech.toLowerCase().includes(q));

      if (ticketCategory === "UNASSIGNED") {
        return matchesSearch && (!t.assignedTech || t.assignedTech === "Unassigned");
      }
      if (ticketCategory === "ALL") return matchesSearch;
      return matchesSearch && t.category === ticketCategory;
    });
  }, [tickets, ticketSearch, ticketCategory]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = reportSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.jobId.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        r.serialNumber.toLowerCase().includes(q) ||
        r.diagnosis.toLowerCase().includes(q) ||
        r.findings.toLowerCase().includes(q);

      if (reportStatusFilter === "ALL") return matchesSearch;
      if (reportStatusFilter === "COMPLETED") {
        return (
          matchesSearch &&
          (r.recoveryStatus.toLowerCase().includes("complete") ||
            r.recoveryStatus.toLowerCase().includes("deliver") ||
            r.recoveryStatus.toLowerCase().includes("ready"))
        );
      }
      if (reportStatusFilter === "IN_PROGRESS") {
        return (
          matchesSearch &&
          (r.recoveryStatus.toLowerCase().includes("progress") ||
            r.recoveryStatus.toLowerCase().includes("imaging") ||
            r.recoveryStatus.toLowerCase().includes("cloning"))
        );
      }
      if (reportStatusFilter === "PENDING") {
        return (
          matchesSearch &&
          (r.recoveryStatus.toLowerCase().includes("pending") ||
            r.recoveryStatus.toLowerCase().includes("triage") ||
            r.recoveryStatus.toLowerCase().includes("quote"))
        );
      }
      if (reportStatusFilter === "HDD") {
        return matchesSearch && r.deviceType === "HDD";
      }
      if (reportStatusFilter === "SSD") {
        return matchesSearch && (r.deviceType === "SSD" || r.deviceType === "NVMe");
      }
      return matchesSearch;
    });
  }, [reports, reportSearch, reportStatusFilter]);

  const completedReportsCount = reports.filter(
    (r) =>
      r.recoveryStatus.toLowerCase().includes("complete") ||
      r.recoveryStatus.toLowerCase().includes("deliver") ||
      r.recoveryStatus.toLowerCase().includes("ready")
  ).length;

  const pendingReportsCount = reports.filter(
    (r) =>
      r.recoveryStatus.toLowerCase().includes("pending") ||
      r.recoveryStatus.toLowerCase().includes("triage") ||
      r.recoveryStatus.toLowerCase().includes("quote")
  ).length;

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "Cybersecurity":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">
            Cybersecurity
          </span>
        );
      case "Cloud Solutions":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
            Cloud
          </span>
        );
      case "Managed IT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            Managed IT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400 border border-red-500/20">
            Data Recovery
          </span>
        );
    }
  };

  const getReportStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("complete") || s.includes("ready") || s.includes("deliver")) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {status}
        </span>
      );
    }
    if (s.includes("progress") || s.includes("imaging") || s.includes("clon")) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-400 border border-blue-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        {status}
      </span>
    );
  };

  return (
    <AdminLayoutShell
      title="Executive Command Dashboard"
      subtitle="Overview of ISO Class-5 cleanroom benches, real-time diagnostic reports, SLA compliance, and customer pipelines"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              loadReports();
              loadTickets();
              showNotification("✓ Telemetry & Diagnostic Reports re-synchronized!");
            }}
            className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-600 transition flex items-center gap-1.5 shadow-xs"
            title="Force refresh reports and tickets"
          >
            <span className="text-red-500 font-bold">↻</span>
            <span className="hidden sm:inline">Sync Live</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedReport(null);
              setIsReportModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-bold text-white hover:from-red-500 hover:to-rose-500 transition shadow-md shadow-red-600/30 flex items-center gap-2"
          >
            <span>+</span>
            <span>Author Diagnosis Report</span>
          </button>
        </div>
      }
    >
      <div className="space-y-8 animate-in fade-in">
        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/80 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400">✓</span>
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification("")}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. EXECUTIVE WELCOME BANNER (RED & CARBON BLACK COMMAND THEME) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0c1527] via-[#090f1d] to-[#060b17] p-6 sm:p-8 shadow-2xl">
          {/* Subtle crimson ambient glow in top right */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* AVATAR WITH RED GRADIENT & CRIMSON GLOW */}
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl sm:text-3xl shadow-lg shadow-red-600/30 border-2 border-red-500/40 shrink-0">
                EB
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border border-red-500/40 bg-red-600/15 text-red-400 shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                    <span>Super Admin Console</span>
                    <span className="opacity-70">• Tier-1 Access</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">
                    <span className="text-emerald-400">🔒</span>
                    {adminEmail}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                  Welcome back, {adminName}
                </h1>
                <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                  Executive Command Center • Real-time telemetry across PC-3000 Cleanroom bays, synchronized diagnostic laboratory reports, and verified legal chain-of-custody tracking.
                </p>
              </div>
            </div>

            {/* ACTION SHORTCUTS */}
            <div className="flex flex-wrap items-center gap-2.5">
              {unassignedCount > 0 && (
                <Link
                  href="/admin/tickets"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition"
                >
                  <span className="animate-pulse">⚡</span>
                  <span>Dispatch Queue ({unassignedCount})</span>
                </Link>
              )}

              <Link
                href="/admin/inquiries"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition shadow-sm"
              >
                <span>🔔</span>
                <span>Client Leads ({newInquiriesCount})</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSelectedReport(null);
                  setIsReportModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-red-600/30 hover:bg-red-500 transition"
              >
                <span>📄</span>
                <span>New Lab Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. LEADS ALERT BANNER IF NEW LEADS */}
        {newInquiriesCount > 0 && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-200 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-xs shadow-xs">
                🔔
              </span>
              <span>
                You have <strong className="font-extrabold text-white">{newInquiriesCount} new client recovery consultation request(s)</strong> awaiting executive dispatch and SLA assignment.
              </span>
            </div>
            <Link
              href="/admin/inquiries"
              className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500 transition shadow-xs"
            >
              Review Leads &amp; Coordinate →
            </Link>
          </div>
        )}

        {/* 3. FORENSIC TELEMETRY KPI METRICS ROW (MATCHING SCREENSHOT EXACTLY) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verified Cleanroom Telemetry &amp; SLA Metrics
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Live Hardware Feed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CARD 1: TOTAL DATA RESTORED */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#0a1020]/90 shadow-xl hover:border-slate-700 transition">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Data Restored
              </span>
              <p className="text-3xl font-black text-white mt-1.5">142.8 TB</p>
              <span className="text-[11px] text-emerald-400 font-semibold block mt-1.5">
                ↑ 18.2% vs last quarter
              </span>
            </div>

            {/* CARD 2: RECOVERY SUCCESS RATE */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#0a1020]/90 shadow-xl hover:border-slate-700 transition">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recovery Success Rate
              </span>
              <p className="text-3xl font-black text-emerald-400 mt-1.5">99.98%</p>
              <span className="text-[11px] text-slate-400 block mt-1.5">
                Certified Cleanroom Standard
              </span>
            </div>

            {/* CARD 3: AVG RUSH TURNAROUND */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#0a1020]/90 shadow-xl hover:border-slate-700 transition">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Avg Rush Turnaround
              </span>
              <p className="text-3xl font-black text-blue-400 mt-1.5">9.2 Hours</p>
              <span className="text-[11px] text-slate-400 block mt-1.5">
                12-Hour Priority SLA Target
              </span>
            </div>

            {/* CARD 4: 15-MIN SLA COMPLIANCE */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#0a1020]/90 shadow-xl hover:border-slate-700 transition">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                15-Min SLA Compliance
              </span>
              <p className="text-3xl font-black text-emerald-400 mt-1.5">100.0%</p>
              <span className="text-[11px] text-slate-400 block mt-1.5">
                Zero breaches (past 12 mos)
              </span>
            </div>
          </div>
        </div>

        {/* 4. STORAGE ARCHITECTURE RECOVERY VISUALIZER & CERTIFICATIONS (FROM SCREENSHOT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* LEFT 2 COLUMNS: RECOVERY SUCCESS RATE BY STORAGE ARCHITECTURE */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-[#0a1020]/95 p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">
                Recovery Success Rate by Storage Architecture
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Verified Bench Stats
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Detailed statistical breakdown of hardware extraction across ISO Class-5 clean benches.
            </p>

            <div className="space-y-4">
              {/* RAID */}
              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                  <span>Enterprise RAID Arrays (RAID 0, 1, 5, 6, 10, ZFS)</span>
                  <span className="text-emerald-400 font-black">100.0% Success</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: "100%" }} />
                </div>
              </div>

              {/* HDD */}
              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                  <span>Mechanical Hard Drives (Clicking Sliders &amp; Head Crashes)</span>
                  <span className="text-emerald-400 font-black">99.8% Success</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: "99.8%" }} />
                </div>
              </div>

              {/* SSD */}
              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                  <span>Solid State Drives (M.2 PCIe NVMe &amp; SATA SSD)</span>
                  <span className="text-emerald-400 font-black">99.6% Success</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: "99.6%" }} />
                </div>
              </div>

              {/* SQL */}
              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                  <span>BitLocker Encrypted &amp; Corrupted SQL Databases</span>
                  <span className="text-emerald-400 font-black">100.0% Success</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FORENSIC CLEANROOM CERTIFICATIONS */}
          <div className="rounded-3xl border border-slate-800 bg-[#0a1020]/95 p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h2 className="text-base font-bold text-white">Forensic Cleanroom Certifications</h2>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Audited laboratory standards ensuring strict legal admissibility of recovered digital evidence.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition">
                  <span className="text-emerald-400 font-bold block mb-1">✓ ISO 14644-1 Class 5</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Maximum 3,520 particles per cubic meter of air at 0.5 microns.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition">
                  <span className="text-emerald-400 font-bold block mb-1">✓ SOC 2 Type II Certified</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Strict chain-of-custody tracking with cryptographic media write-blocking.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition">
                  <span className="text-emerald-400 font-bold block mb-1">✓ HIPAA &amp; GDPR Compliant</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Zero customer data retained after confirmed delivery and verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Auditor: CyberTrust Lab</span>
              <span className="text-emerald-400 font-bold">100% Valid</span>
            </div>
          </div>
        </div>

        {/* 5. SYNCHRONIZED LABORATORY DIAGNOSIS REPORTS SECTION */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a1020]/95 shadow-2xl overflow-hidden">
          {/* SECTION HEADER & CONTROLS */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600/20 text-red-400 font-black text-xs border border-red-500/30">
                    🔬
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Synchronized Laboratory Diagnosis Reports
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Live diagnostic assessments, read/write head triage, platter evaluations, and recovery quotes authored on technician workbenches.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-time Sync Active ({reports.length} Reports)</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedReport(null);
                    setIsReportModalOpen(true);
                  }}
                  className="rounded-xl bg-red-600 hover:bg-red-500 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm"
                >
                  + Author Report
                </button>
              </div>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search reports by ID, client, serial, drive..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-2 pl-8 pr-4 text-xs text-white placeholder-slate-500 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
                {[
                  { id: "ALL", label: `All Reports (${reports.length})` },
                  { id: "COMPLETED", label: `Completed (${completedReportsCount})` },
                  { id: "IN_PROGRESS", label: "In Progress" },
                  { id: "PENDING", label: `Pending (${pendingReportsCount})` },
                  { id: "HDD", label: "HDDs" },
                  { id: "SSD", label: "SSDs & NVMe" },
                ].map((tab) => {
                  const isActive = reportStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReportStatusFilter(tab.id)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition text-xs cursor-pointer ${
                        isActive
                          ? "bg-red-600 text-white shadow-xs"
                          : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* REPORTS TABLE */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Report / Job ID</th>
                  <th className="px-5 py-3.5">Client &amp; Contact</th>
                  <th className="px-5 py-3.5">Storage Media</th>
                  <th className="px-5 py-3.5">Diagnostic Findings</th>
                  <th className="px-5 py-3.5">Recovery Method &amp; Assessment</th>
                  <th className="px-5 py-3.5">Estimated Cost</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2 font-mono text-xs">
                        <div className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                        <span>Synchronizing diagnostic reports with Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                      <p className="font-semibold text-slate-400 text-sm">No diagnostic reports match query</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try adjusting your search criteria or click &quot;Author Report&quot; to generate an official laboratory diagnosis.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => {
                    const cleanJobId = r.jobId || r.id.replace(/^DR-/i, "");
                    return (
                      <tr key={r.id || r.jobId} className="hover:bg-slate-900/60 transition">
                        {/* ID */}
                        <td className="px-5 py-3.5 font-mono font-bold text-red-400 whitespace-nowrap">
                          #{r.id || `DR-${cleanJobId}`}
                        </td>

                        {/* CLIENT */}
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-white block">{r.clientName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">Job #{cleanJobId}</span>
                        </td>

                        {/* MEDIA ARCHITECTURE */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-white font-mono text-[11px]">
                            <span className="font-bold text-red-400">{r.deviceType || "HDD"}</span>
                            <span>{r.capacity}</span>
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                            {r.brand} {r.model}
                          </span>
                        </td>

                        {/* DIAGNOSIS */}
                        <td className="px-5 py-3.5 max-w-xs">
                          <span className="font-bold text-slate-200 block truncate">{r.diagnosis}</span>
                          <span className="text-[11px] text-slate-400 block truncate">{r.findings || r.symptoms}</span>
                        </td>

                        {/* ASSESSMENT */}
                        <td className="px-5 py-3.5 max-w-xs">
                          <span className="text-slate-300 block truncate">{r.recoveryAssessment}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">ETA: {r.estimatedTime}</span>
                        </td>

                        {/* COST */}
                        <td className="px-5 py-3.5 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {r.finalRecoveryCost || "₹15,000–₹17,500"}
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {getReportStatusBadge(r.recoveryStatus)}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReport(r);
                                setIsReportModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition flex items-center gap-1"
                              title="Inspect & Print Forensic Report"
                            >
                              <span>👁️</span>
                              <span>Inspect</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setReportToDelete(r)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs"
                              title="Delete Diagnosis Report"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. MASTER SERVICE TICKET DIRECTORY */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a1020]/95 shadow-2xl overflow-hidden">
          {/* TABLE HEADER & FILTER TABS */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">Master Service Ticket Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live hardware targets, technician dispatch bays, and forensic recovery progress meters
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/tickets"
                  className="rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-xs flex items-center gap-1.5"
                >
                  <span>Open Full Ticket Manager →</span>
                </Link>
              </div>
            </div>

            {/* SEARCH & CATEGORY FILTER TABS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search tickets by ID, client, hardware..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-2 pl-8 pr-4 text-xs text-white placeholder-slate-500 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
                {[
                  { id: "ALL", label: `All Tickets (${tickets.length})` },
                  { id: "UNASSIGNED", label: `Unassigned (${unassignedCount})`, highlight: true },
                  { id: "Data Recovery", label: "Data Recovery" },
                  { id: "Cybersecurity", label: "Cybersecurity" },
                  { id: "Cloud Solutions", label: "Cloud" },
                  { id: "Managed IT", label: "Managed IT" },
                ].map((tab) => {
                  const isActive = ticketCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTicketCategory(tab.id)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition text-xs cursor-pointer ${
                        isActive
                          ? tab.highlight
                            ? "bg-amber-500 text-slate-950 font-extrabold shadow-xs"
                            : "bg-red-600 text-white font-bold shadow-xs"
                          : tab.highlight
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                          : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TICKET TABLE */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Client Organization</th>
                  <th className="px-5 py-3.5">Target Subject</th>
                  <th className="px-5 py-3.5">Stage &amp; Progress</th>
                  <th className="px-5 py-3.5">Lead Specialist</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400 font-mono text-xs">
                      Loading master tickets...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                      <p className="font-semibold text-slate-400 text-sm">No tickets found</p>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or category filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.slice(0, 10).map((t) => {
                    const isUnassigned = !t.assignedTech || t.assignedTech === "Unassigned";
                    return (
                      <tr key={t.id} className="hover:bg-slate-900/60 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-red-400">
                          #{t.id}
                        </td>
                        <td className="px-5 py-3.5">{getCategoryBadge(t.category)}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-white block">{t.companyName}</span>
                          <span className="text-[11px] text-slate-400">{t.customerName}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate">
                          {t.deviceOrSubject}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-red-600 to-rose-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(10, t.clonedPercent || 15))}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-slate-400">
                              {t.clonedPercent ? `${t.clonedPercent}%` : t.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {isUnassigned ? (
                            <Link
                              href="/admin/tickets"
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                              Pending Dispatch
                            </Link>
                          ) : (
                            <span className="text-slate-200 font-medium">{t.assignedTech}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href="/admin/tickets"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                            >
                              Dispatch
                            </Link>
                            <Link
                              href={`/technician/tickets/${t.id}`}
                              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition hidden sm:inline-block shadow-xs"
                            >
                              Workbench →
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteModalTicket(t)}
                              disabled={deletingTicketId === t.id}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs cursor-pointer"
                              title={`Delete Ticket #${t.id}`}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. QUICK MODULE SHORTCUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Link
            href="/admin/blog"
            className="rounded-3xl border border-slate-800 bg-[#0a1020]/90 p-6 hover:border-slate-700 hover:bg-slate-900/80 transition group shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600/15 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-red-400 transition">
              Blog &amp; Case Study Publisher
            </h3>
            <p className="text-slate-400 mt-1.5 text-xs leading-relaxed">
              Publish forensic recovery case studies and technical guides directly to the public website.
            </p>
          </Link>

          <Link
            href="/admin/technicians"
            className="rounded-3xl border border-slate-800 bg-[#0a1020]/90 p-6 hover:border-slate-700 hover:bg-slate-900/80 transition group shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition">
              Technician &amp; Bench Roster
            </h3>
            <p className="text-slate-400 mt-1.5 text-xs leading-relaxed">
              Manage forensic specialists and monitor PC-3000 Cleanroom bay workloads.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="rounded-3xl border border-slate-800 bg-[#0a1020]/90 p-6 hover:border-slate-700 hover:bg-slate-900/80 transition group shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-rose-400 transition">
              Company Settings &amp; Security
            </h3>
            <p className="text-slate-400 mt-1.5 text-xs leading-relaxed">
              Configure Master Security Keys, 24/7 hotline (+91 6380488373), and emergency SLA rules.
            </p>
          </Link>
        </div>

        {/* MODERN DELETE MODAL FOR TICKET */}
        <ModernDeleteModal
          isOpen={!!deleteModalTicket}
          onClose={() => setDeleteModalTicket(null)}
          onConfirm={handleConfirmDeleteTicket}
          title="Delete Ticket"
          itemType="Ticket"
          itemName={deleteModalTicket ? `Ticket #${deleteModalTicket.id} - ${deleteModalTicket.companyName}` : ""}
          description={
            deleteModalTicket
              ? `Are you sure you want to permanently delete Ticket #${deleteModalTicket.id} (${deleteModalTicket.deviceOrSubject})? This action cannot be undone.`
              : ""
          }
          confirmButtonText="Permanently Delete Ticket"
          isDeleting={!!deletingTicketId}
        />

        {/* MODERN DELETE MODAL FOR REPORT */}
        <ModernDeleteModal
          isOpen={!!reportToDelete}
          onClose={() => setReportToDelete(null)}
          onConfirm={handleConfirmDeleteReport}
          title="Delete Forensic Report"
          itemType="Diagnostic Report"
          itemName={
            reportToDelete
              ? `Report #${reportToDelete.id || `DR-${reportToDelete.jobId}`} (${reportToDelete.clientName})`
              : ""
          }
          description={
            reportToDelete
              ? `Are you sure you want to permanently delete Forensic Report #${reportToDelete.id || `DR-${reportToDelete.jobId}`} for client ${reportToDelete.clientName}? This action will permanently remove the record from Supabase.`
              : ""
          }
          confirmButtonText="Delete Forensic Report"
          isDeleting={isDeletingReport}
        />

        {/* ADVANCED DATA RECOVERY REPORT MODAL */}
        <AdvancedDataRecoveryReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedReport(null);
          }}
          initialData={selectedReport || undefined}
          onSaved={() => {
            loadReports();
            setIsReportModalOpen(false);
            setSelectedReport(null);
            showNotification("✓ Forensic Diagnosis Report saved & synchronized!");
          }}
        />
      </div>
    </AdminLayoutShell>
  );
}
