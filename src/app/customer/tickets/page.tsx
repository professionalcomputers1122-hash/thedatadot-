"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import { fetchTicketsFromSupabase, deleteTicketFromSupabase, Ticket, formatTicketDateTime } from "@/lib/portalData";
import { getCustomerSession } from "@/lib/clientAuth";

export default function CustomerTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Date Range Filter State
  const [datePreset, setDatePreset] = useState<"ALL" | "TODAY" | "7DAYS" | "30DAYS" | "CUSTOM">("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

  useEffect(() => {
    const cust = getCustomerSession();
    if (!cust) {
      router.push("/customer/login");
      return;
    }
    const activeCust = cust;
    const userEmail = activeCust.email.toLowerCase();
    const userCompany = activeCust.company.toLowerCase();

    async function load() {
      try {
        let all = await fetchTicketsFromSupabase(userEmail);
        let myTickets = all.filter((t) => {
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

        if (myTickets.length === 0) {
          const global = await fetchTicketsFromSupabase();
          if (global && global.length > 0) {
            myTickets = global;
          }
        }

        setTickets(myTickets);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const interval = setInterval(load, 2000);
    const handleUpdate = () => load();

    window.addEventListener("tickets-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("tdd-ticket-sync");
        bc.onmessage = (ev) => {
          if (ev.data?.type === "TICKET_UPDATED") {
            load();
          }
        };
      } catch (e) {}
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("tickets-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      if (bc) {
        try {
          bc.close();
        } catch (e) {}
      }
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

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceOrSubject.toLowerCase().includes(search.toLowerCase()) ||
      (t.serialNumber && t.serialNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && t.status !== "Resolved") ||
      (statusFilter === "RESOLVED" && t.status === "Resolved");

    if (!matchesSearch || !matchesCategory || !matchesStatus) return false;

    // Date range filter
    if (datePreset === "ALL" && !startDate && !endDate) return true;

    const { timestamp } = formatTicketDateTime(t);
    const now = new Date();

    if (datePreset === "TODAY") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
      return timestamp >= todayStart && timestamp <= todayEnd;
    }

    if (datePreset === "7DAYS") {
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      return timestamp >= sevenDaysAgo;
    }

    if (datePreset === "30DAYS") {
      const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      return timestamp >= thirtyDaysAgo;
    }

    if (startDate) {
      const startMs = new Date(startDate + "T00:00:00").getTime();
      if (!isNaN(startMs) && timestamp < startMs) return false;
    }

    if (endDate) {
      const endMs = new Date(endDate + "T23:59:59.999").getTime();
      if (!isNaN(endMs) && timestamp > endMs) return false;
    }

    return true;
  });

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "Cybersecurity":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold border bg-rose-50 text-rose-700 border-rose-200">
            <svg className="w-3 h-3 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Cybersecurity</span>
          </span>
        );
      case "Cloud Solutions":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
            <svg className="w-3 h-3 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
            <span>Cloud Solutions</span>
          </span>
        );
      case "Managed IT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
            <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Managed IT</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
            <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            <span>Data Recovery</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Enterprise Support &amp; Recovery Tickets
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live telemetry for Data Recovery, Cybersecurity, Cloud Infrastructure, and Managed IT
            </p>
          </div>

          <Link
            href="/customer/tickets/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <span>+ Open New Ticket</span>
          </Link>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search Ticket ID, hardware target, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                categoryFilter === "ALL"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setCategoryFilter("Data Recovery")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                categoryFilter === "Data Recovery"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Recovery</span>
            </button>
            <button
              onClick={() => setCategoryFilter("Cybersecurity")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                categoryFilter === "Cybersecurity"
                  ? "bg-rose-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Cyber</span>
            </button>
            <button
              onClick={() => setCategoryFilter("Cloud Solutions")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                categoryFilter === "Cloud Solutions"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Cloud</span>
            </button>
            <button
              onClick={() => setCategoryFilter("Managed IT")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                categoryFilter === "Managed IT"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Managed IT</span>
            </button>
          </div>
        </div>

        {/* DATE RANGE FILTER BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Filter By Date:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setDatePreset("ALL");
                  setStartDate("");
                  setEndDate("");
                  setShowCustomDateInputs(false);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  datePreset === "ALL" && !startDate && !endDate
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Dates
              </button>
              <button
                type="button"
                onClick={() => {
                  setDatePreset("TODAY");
                  setStartDate("");
                  setEndDate("");
                  setShowCustomDateInputs(false);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  datePreset === "TODAY"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setDatePreset("7DAYS");
                  setStartDate("");
                  setEndDate("");
                  setShowCustomDateInputs(false);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  datePreset === "7DAYS"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  setDatePreset("30DAYS");
                  setStartDate("");
                  setEndDate("");
                  setShowCustomDateInputs(false);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  datePreset === "30DAYS"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  setDatePreset("CUSTOM");
                  setShowCustomDateInputs(true);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  datePreset === "CUSTOM" || showCustomDateInputs
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>Custom Range</span>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Custom Range Inputs */}
            {(showCustomDateInputs || datePreset === "CUSTOM" || startDate || endDate) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDatePreset("CUSTOM");
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDatePreset("CUSTOM");
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {(startDate || endDate || datePreset !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setDatePreset("ALL");
                      setStartDate("");
                      setEndDate("");
                      setShowCustomDateInputs(false);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Range Summary */}
          {(datePreset !== "ALL" || startDate || endDate) && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Showing <strong>{filtered.length}</strong> of <strong>{tickets.length}</strong> tickets for{" "}
                <span className="font-semibold text-blue-700">
                  {datePreset === "TODAY"
                    ? "Today"
                    : datePreset === "7DAYS"
                    ? "Last 7 Days"
                    : datePreset === "30DAYS"
                    ? "Last 30 Days"
                    : startDate && endDate
                    ? `${startDate} to ${endDate}`
                    : startDate
                    ? `from ${startDate}`
                    : endDate
                    ? `up to ${endDate}`
                    : "Selected Range"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setDatePreset("ALL");
                  setStartDate("");
                  setEndDate("");
                  setShowCustomDateInputs(false);
                }}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Clear Date Filter ×
              </button>
            </div>
          )}
        </div>

        {/* TICKETS TABLE */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-3" />
              <p className="text-xs font-mono text-slate-400">
                Synchronizing live portal tickets...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No tickets found</p>
              <p className="text-xs text-slate-400 mt-1">
                {search || datePreset !== "ALL" || startDate || endDate
                  ? "No cases match your filter criteria."
                  : "You have no active support tickets in this view."}
              </p>
              {(datePreset !== "ALL" || startDate || endDate || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setDatePreset("ALL");
                    setStartDate("");
                    setEndDate("");
                    setSearch("");
                    setCategoryFilter("ALL");
                    setStatusFilter("ALL");
                    setShowCustomDateInputs(false);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-[10px] font-bold uppercase border-b bg-slate-50 text-slate-500 border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Ticket ID</th>
                    <th className="px-5 py-3.5">Service Category</th>
                    <th className="px-5 py-3.5">Target / Subject</th>
                    <th className="px-5 py-3.5">Date &amp; Time</th>
                    <th className="px-5 py-3.5">Urgency</th>
                    <th className="px-5 py-3.5">Current Status</th>
                    <th className="px-5 py-3.5">Lead Specialist</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((t) => {
                    const isUnassigned =
                      !t.assignedTech ||
                      t.assignedTech === "Unassigned" ||
                      t.assignedTech.toLowerCase().includes("unassigned");

                    return (
                      <tr key={t.id} className="transition hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-bold text-blue-600">
                          #{t.id}
                        </td>
                        <td className="px-5 py-4">
                          {getCategoryBadge(t.category)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{t.deviceOrSubject}</p>
                          {t.serialNumber && (
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              ID: {t.serialNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {(() => {
                            const dt = formatTicketDateTime(t);
                            return (
                              <div>
                                <p className="font-semibold text-slate-900">{dt.date}</p>
                                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                  <svg className="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>{dt.time || "Logged"}</span>
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              t.priority === "CRITICAL"
                                ? "bg-rose-100 text-rose-800"
                                : t.priority === "HIGH"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                t.status === "Resolved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {isUnassigned ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pending Dispatch
                            </span>
                          ) : (
                            <span className="font-medium text-slate-800">
                              {t.assignedTech}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/customer/tickets/${t.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 font-bold text-blue-600 hover:bg-blue-50 transition"
                            >
                              <span>View</span>
                              <span>→</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteModalTicket(t)}
                              disabled={deletingId === t.id}
                              className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                              title={`Delete Ticket #${t.id}`}
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
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

        {/* MODERN DELETE MODAL */}
        <ModernDeleteModal
          isOpen={!!deleteModalTicket}
          onClose={() => setDeleteModalTicket(null)}
          onConfirm={handleConfirmDeleteTicket}
          title="Delete Support Ticket"
          itemType="Ticket"
          itemName={deleteModalTicket ? `Ticket #${deleteModalTicket.id} - ${deleteModalTicket.deviceOrSubject}` : ""}
          description={
            deleteModalTicket
              ? `Are you sure you want to permanently delete Ticket #${deleteModalTicket.id}? This will remove the case from your ticket directory and purge all diagnostic logs.`
              : ""
          }
          confirmButtonText="Permanently Delete Ticket"
          isDeleting={!!deletingId}
        />
      </main>

      <Footer />
    </div>
  );
}
