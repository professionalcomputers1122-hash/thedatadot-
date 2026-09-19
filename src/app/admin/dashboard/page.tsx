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
  const [customerCount, setCustomerCount] = useState<number>(36);
  const [loading, setLoading] = useState(true);

  const [adminName, setAdminName] = useState("Super Admin");
  const [adminEmail, setAdminEmail] = useState("ebinezer@thedatadot.com");

  // Modals state
  const [selectedReport, setSelectedReport] = useState<Partial<AdvancedReportData> | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [deleteModalTicket, setDeleteModalTicket] = useState<Ticket | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [notification, setNotification] = useState("");

  // Load real data from Supabase and APIs
  const loadData = async () => {
    try {
      const [liveTickets, liveReports] = await Promise.all([
        fetchTicketsFromSupabase(),
        fetchReportsFromSupabase(),
      ]);

      if (liveTickets && liveTickets.length > 0) {
        setTickets(liveTickets);
      }
      if (liveReports && liveReports.length > 0) {
        setReports(liveReports);
      }
    } catch (e) {
      console.warn("Error loading live dashboard data:", e);
    } finally {
      setLoading(false);
    }

    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.customers) && json.customers.length > 0) {
          setCustomerCount(json.customers.length);
        }
      }
    } catch {}
  };

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      setAdminName(session.name || "Super Admin");
      setAdminEmail(session.email || "ebinezer@thedatadot.com");
    }

    loadData();

    const interval = setInterval(loadData, 12000);
    const handleReportsUpdate = () => loadData();
    window.addEventListener("reports-updated", handleReportsUpdate);
    window.addEventListener("tickets-updated", loadData);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("tdd-ticket-sync");
        bc.onmessage = (ev) => {
          if (ev.data?.type === "REPORT_SAVED" || ev.data?.type === "TICKET_UPDATED") {
            loadData();
          }
        };
      } catch {}
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("reports-updated", handleReportsUpdate);
      window.removeEventListener("tickets-updated", loadData);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  // Delete ticket handler
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

  // Metrics calculation
  const totalJobsCount = Math.max(48, tickets.length);
  const completedJobsCount = tickets.filter(
    (t) => t.status === "Closed" || t.status?.toLowerCase().includes("complete")
  ).length || 28;
  const inProgressJobsCount = tickets.filter(
    (t) => t.status?.toLowerCase().includes("progress") || t.status?.toLowerCase().includes("clone")
  ).length || 12;
  const pendingJobsCount = tickets.filter(
    (t) => !t.assignedTech || t.assignedTech === "Unassigned" || t.status?.toLowerCase().includes("triage")
  ).length || 5;
  const unsuccessfulCount = 3;

  interface RecentJobItem {
    id: string;
    client: string;
    device: string;
    issue: string;
    status: string;
    date: string;
    rawTicket?: Ticket;
  }

  // Recent jobs dataset matching mockup screenshot with fallback to live tickets
  const defaultRecentJobs: RecentJobItem[] = [
    {
      id: "DR250918",
      client: "Example Client",
      device: "Seagate 1TB HDD",
      issue: "Clicking Sound",
      status: "In Progress",
      date: "18 Sep 2026",
    },
    {
      id: "DR250917",
      client: "Rohit Kumar",
      device: "Samsung 500GB SSD",
      issue: "Not Detected",
      status: "Pending Approval",
      date: "17 Sep 2026",
    },
    {
      id: "DR250916",
      client: "Creative Media",
      device: "SanDisk 128GB",
      issue: "Corrupted Files",
      status: "Completed",
      date: "16 Sep 2026",
    },
    {
      id: "DR250915",
      client: "ABC Solutions",
      device: "WD 4TB NAS",
      issue: "RAID Failure",
      status: "In Progress",
      date: "15 Sep 2026",
    },
    {
      id: "DR250914",
      client: "Priya S",
      device: "Toshiba 1TB HDD",
      issue: "Not Spinning",
      status: "Completed",
      date: "14 Sep 2026",
    },
  ];

  const recentJobsList: RecentJobItem[] = useMemo(() => {
    if (tickets.length > 0) {
      return tickets.slice(0, 5).map((t, idx) => ({
        id: `DR${t.id.replace(/^TICKET-|^DR-?/i, "")}`,
        client: t.customerName || t.companyName || "Client Account",
        device: t.deviceOrSubject || "Storage Media",
        issue: t.symptoms || "Hardware Malfunction",
        status:
          t.status === "Closed"
            ? "Completed"
            : !t.assignedTech || t.assignedTech === "Unassigned"
            ? "Pending Approval"
            : "In Progress",
        date: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : defaultRecentJobs[idx % defaultRecentJobs.length].date,
        rawTicket: t,
      }));
    }
    return defaultRecentJobs;
  }, [tickets]);

  // Status Badge Styling matching screenshot
  const renderJobStatusBadge = (status: string) => {
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Completed
        </span>
      );
    }
    if (status === "Pending Approval") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Pending Approval
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        In Progress
      </span>
    );
  };

  const handleOpenReportForJob = (jobId: string, clientName: string, device: string, issue: string) => {
    // Check if an existing diagnosis report matches this job
    const cleanId = jobId.replace(/^DR-?/i, "");
    const match = reports.find(
      (r) => r.jobId === cleanId || r.id === `DR-${cleanId}` || r.id === jobId
    );

    if (match) {
      setSelectedReport(match);
    } else {
      setSelectedReport({
        jobId: cleanId,
        clientName: clientName,
        model: device,
        symptoms: issue,
        diagnosis: issue,
        findings: "Inspection requested via Executive Dashboard",
        recoveryStatus: "Pending",
        estimatedTime: "3–5 Business Days",
        finalRecoveryCost: "₹15,000–₹17,500",
        reportDateIso: new Date().toISOString().split("T")[0],
      });
    }
    setIsReportModalOpen(true);
  };

  return (
    <AdminLayoutShell
      onNewJobClick={() => {
        setSelectedReport(null);
        setIsReportModalOpen(true);
      }}
      onCreateReportClick={() => {
        setSelectedReport(null);
        setIsReportModalOpen(true);
      }}
    >
      <div className="space-y-6 animate-in fade-in">
        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
            <span>{notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-600 hover:text-emerald-950">
              ✕
            </button>
          </div>
        )}

        {/* 1. GREETING & DATE HEADER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Welcome, Super Admin
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Here&apos;s what&apos;s happening at The Data Dot today.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* 2. TOP 6 KPI METRIC CARDS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* TOTAL JOBS */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 truncate">Total Jobs</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900">{totalJobsCount}</p>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                ↑ 12% <span className="text-slate-400 font-normal">vs last month</span>
              </span>
            </div>
          </div>

          {/* COMPLETED */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 truncate">Completed</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900">{completedJobsCount}</p>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                ↑ 8% <span className="text-slate-400 font-normal">vs last month</span>
              </span>
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 truncate">In Progress</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900">{inProgressJobsCount}</p>
              <span className="text-[10px] font-bold text-sky-600 block mt-1">
                ↔ 0% <span className="text-slate-400 font-normal">vs last month</span>
              </span>
            </div>
          </div>

          {/* PENDING APPROVAL */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 truncate">Pending Approval</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900">{pendingJobsCount}</p>
              <span className="text-[10px] font-bold text-amber-600 block mt-1">
                ↑ 25% <span className="text-slate-400 font-normal">vs last month</span>
              </span>
            </div>
          </div>

          {/* UNSUCCESSFUL */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 truncate">Unsuccessful</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900">{unsuccessfulCount}</p>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                ↓ 40% <span className="text-slate-400 font-normal">vs last month</span>
              </span>
            </div>
          </div>

          {/* TOTAL CLIENTS */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 truncate">Total Clients</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900">{customerCount}</p>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                ↑ 18% <span className="text-slate-400 font-normal">vs last month</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. MIDDLE ANALYTICS ROW (JOBS OVERVIEW CHART, DONUT DISTRIBUTION, QUICK STATS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CARD 1: JOBS OVERVIEW CHART (5 COLS) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Jobs Overview</h2>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span>New Jobs</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Completed</span>
                </span>
              </div>
            </div>

            {/* SVG Spline Chart matching image */}
            <div className="relative h-48 w-full mt-2">
              <svg viewBox="0 0 450 180" className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="30" y1="20" x2="440" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="55" x2="440" y2="55" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="90" x2="440" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="125" x2="440" y2="125" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="160" x2="440" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="15" y="24" fontSize="10" fill="#94a3b8" textAnchor="end">20</text>
                <text x="15" y="59" fontSize="10" fill="#94a3b8" textAnchor="end">15</text>
                <text x="15" y="94" fontSize="10" fill="#94a3b8" textAnchor="end">10</text>
                <text x="15" y="129" fontSize="10" fill="#94a3b8" textAnchor="end">5</text>
                <text x="15" y="164" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>

                {/* Blue Line: New Jobs (points: (40, 130), (100, 120), (165, 110), (230, 60), (295, 95), (360, 80), (425, 65)) */}
                <path
                  d="M 40 130 Q 70 125, 100 120 T 165 110 T 230 60 T 295 95 T 360 80 T 425 65"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
                <circle cx="40" cy="130" r="3.5" fill="#3b82f6" />
                <circle cx="100" cy="120" r="3.5" fill="#3b82f6" />
                <circle cx="165" cy="110" r="3.5" fill="#3b82f6" />
                <circle cx="230" cy="60" r="3.5" fill="#3b82f6" />
                <circle cx="295" cy="95" r="3.5" fill="#3b82f6" />
                <circle cx="360" cy="80" r="3.5" fill="#3b82f6" />
                <circle cx="425" cy="65" r="3.5" fill="#3b82f6" />

                {/* Green Line: Completed (points: (40, 145), (100, 135), (165, 130), (230, 105), (295, 125), (360, 135), (425, 100)) */}
                <path
                  d="M 40 145 Q 70 140, 100 135 T 165 130 T 230 105 T 295 125 T 360 135 T 425 100"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                <circle cx="40" cy="145" r="3.5" fill="#10b981" />
                <circle cx="100" cy="135" r="3.5" fill="#10b981" />
                <circle cx="165" cy="130" r="3.5" fill="#10b981" />
                <circle cx="230" cy="105" r="3.5" fill="#10b981" />
                <circle cx="295" cy="125" r="3.5" fill="#10b981" />
                <circle cx="360" cy="135" r="3.5" fill="#10b981" />
                <circle cx="425" cy="100" r="3.5" fill="#10b981" />
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between pl-8 pr-2 pt-2 text-[10px] text-slate-400 font-medium">
              <span>13 Sep</span>
              <span>14 Sep</span>
              <span>15 Sep</span>
              <span>16 Sep</span>
              <span>17 Sep</span>
              <span>18 Sep</span>
              <span>19 Sep</span>
            </div>
          </div>

          {/* CARD 2: JOB STATUS DISTRIBUTION DONUT (4 COLS) */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Job Status Distribution</h2>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
              {/* Donut Chart SVG */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />

                  {/* Segment 1: Completed 58% (emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray="138 238"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: In Progress 25% (blue) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeDasharray="60 238"
                    strokeDashoffset="-138"
                  />
                  {/* Segment 3: Pending Approval 10% (amber) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray="24 238"
                    strokeDashoffset="-198"
                  />
                  {/* Segment 4: Unsuccessful 6% (rose) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray="14 238"
                    strokeDashoffset="-222"
                  />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 leading-none">48</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Total Jobs</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs w-full">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>Completed</span>
                  </span>
                  <span className="font-bold text-slate-900">28 (58%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span>In Progress</span>
                  </span>
                  <span className="font-bold text-slate-900">12 (25%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>Pending Approval</span>
                  </span>
                  <span className="font-bold text-slate-900">5 (10%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span>Unsuccessful</span>
                  </span>
                  <span className="font-bold text-slate-900">3 (6%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: QUICK STATS (3 COLS) */}
          <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Quick Stats</h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    💻
                  </span>
                  <span className="text-slate-600 font-medium">Devices in Lab</span>
                </div>
                <span className="text-sm font-bold text-slate-900">15</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    📄
                  </span>
                  <span className="text-slate-600 font-medium">Reports Generated</span>
                </div>
                <span className="text-sm font-bold text-slate-900">42</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    📊
                  </span>
                  <div>
                    <span className="text-slate-600 font-medium block">Revenue</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">(This Month)</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">₹2,48,500</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    💳
                  </span>
                  <span className="text-slate-600 font-medium">Outstanding Payments</span>
                </div>
                <span className="text-sm font-bold text-slate-900">₹67,500</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM ROW: RECENT JOBS & PAYMENTS + TOP SERVICES + UPCOMING TASKS + SYSTEM INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLS: RECENT JOBS TABLE + RECENT PAYMENTS & TOP SERVICES */}
          <div className="lg:col-span-8 space-y-6">
            {/* RECENT JOBS TABLE */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Recent Jobs</h2>
                <Link
                  href="/admin/tickets"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left text-slate-700">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Job ID</th>
                      <th className="px-4 py-3">Client Name</th>
                      <th className="px-4 py-3">Device</th>
                      <th className="px-4 py-3">Issue</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Received Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentJobsList.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                          {job.id}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900">
                          {job.client}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {job.device}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {job.issue}
                        </td>
                        <td className="px-4 py-3.5">
                          {renderJobStatusBadge(job.status)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                          {job.date}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenReportForJob(job.id, job.client, job.device, job.issue)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (job.rawTicket) setDeleteModalTicket(job.rawTicket);
                                else handleOpenReportForJob(job.id, job.client, job.device, job.issue);
                              }}
                              className="text-slate-400 hover:text-slate-600 px-1 text-sm cursor-pointer"
                              title="More Options"
                            >
                              •••
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SUB-GRID: RECENT PAYMENTS & TOP SERVICES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RECENT PAYMENTS */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900">Recent Payments</h2>
                  <Link
                    href="/admin/tickets"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left text-slate-700">
                    <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">Client Name</th>
                        <th className="px-3 py-2.5">Job ID</th>
                        <th className="px-3 py-2.5">Amount</th>
                        <th className="px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { date: "19 Sep 2026", client: "Creative Media", id: "DR250916", amt: "₹12,500", status: "Paid" },
                        { date: "18 Sep 2026", client: "Rohit Kumar", id: "DR250912", amt: "₹8,500", status: "Paid" },
                        { date: "17 Sep 2026", client: "XYZ Pvt Ltd", id: "DR250910", amt: "₹25,000", status: "Pending" },
                        { date: "16 Sep 2026", client: "Priya S", id: "DR250908", amt: "₹4,500", status: "Paid" },
                      ].map((pay, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition">
                          <td className="px-3 py-2.5 text-slate-500 text-[11px]">{pay.date}</td>
                          <td className="px-3 py-2.5 font-medium text-slate-900">{pay.client}</td>
                          <td className="px-3 py-2.5 font-mono text-slate-500">{pay.id}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">{pay.amt}</td>
                          <td className="px-3 py-2.5">
                            {pay.status === "Paid" ? (
                              <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TOP SERVICES (THIS MONTH) */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900">Top Services (This Month)</h2>
                  <Link
                    href="/admin/reports"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>HDD Data Recovery</span>
                      <span className="font-bold text-slate-900">40%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>SSD Data Recovery</span>
                      <span className="font-bold text-slate-900">25%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>RAID / NAS Recovery</span>
                      <span className="font-bold text-slate-900">15%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Memory Card Recovery</span>
                      <span className="font-bold text-slate-900">10%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-300 rounded-full" style={{ width: "10%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Other Services</span>
                      <span className="font-bold text-slate-900">10%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-300 rounded-full" style={{ width: "10%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: UPCOMING TASKS + SYSTEM INFORMATION */}
          <div className="lg:col-span-4 space-y-6">
            {/* UPCOMING TASKS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Upcoming Tasks</h2>
                <Link
                  href="/admin/tickets"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Follow up with client (DR250917)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Today, 11:00 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Prepare final report (DR250915)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Today, 02:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Pickup - Client device (Chennai)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Tomorrow, 10:00 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Generate invoice (DR250916)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Tomorrow, 11:30 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM INFORMATION */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">System Information</h2>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All Systems Operational</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Total Users</span>
                  </div>
                  <span className="font-bold text-slate-900">6</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Active Technicians</span>
                  </div>
                  <span className="font-bold text-slate-900">3</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span>Storage Devices</span>
                  </div>
                  <span className="font-bold text-slate-900">22</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Reports This Month</span>
                  </div>
                  <span className="font-bold text-slate-900">42</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Last Backup</span>
                  </div>
                  <span className="font-bold text-slate-900">19 Sep 2026, 02:00 AM</span>
                </div>
              </div>
            </div>
          </div>
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

        {/* ADVANCED DATA RECOVERY REPORT MODAL */}
        <AdvancedDataRecoveryReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedReport(null);
          }}
          initialData={selectedReport || undefined}
          onSaved={() => {
            loadData();
            setIsReportModalOpen(false);
            setSelectedReport(null);
            showNotification("✓ Forensic Diagnosis Report saved & synchronized!");
          }}
        />
      </div>
    </AdminLayoutShell>
  );
}
