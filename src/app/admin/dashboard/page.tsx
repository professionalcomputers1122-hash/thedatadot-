"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import { fetchTicketsFromSupabase, deleteTicketFromSupabase, Ticket } from "@/lib/portalData";
import { getAdminSession } from "@/lib/adminAuth";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [adminName, setAdminName] = useState("Ebinezer");
  const [adminEmail, setAdminEmail] = useState("ebinezer@thedatadot.com");

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      setAdminName(session.name);
      setAdminEmail(session.email);
    }

    async function load() {
      try {
        const live = await fetchTicketsFromSupabase();
        setTickets(live || []);
      } catch (e) {
        console.warn("Tickets load warn:", e);
      } finally {
        setLoading(false);
      }

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
    }

    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const unassignedCount = tickets.filter(
    (t) => !t.assignedTech || t.assignedTech === "Unassigned"
  ).length;

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.deviceOrSubject.toLowerCase().includes(q) ||
        (t.assignedTech && t.assignedTech.toLowerCase().includes(q));

      if (filterCategory === "UNASSIGNED") {
        return matchesSearch && (!t.assignedTech || t.assignedTech === "Unassigned");
      }
      if (filterCategory === "ALL") return matchesSearch;
      return matchesSearch && t.category === filterCategory;
    });
  }, [tickets, search, filterCategory]);

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "Cybersecurity":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300 border border-rose-500/30">
            Cybersecurity
          </span>
        );
      case "Cloud Solutions":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
            Cloud
          </span>
        );
      case "Managed IT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
            Managed IT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-500/30">
            Data Recovery
          </span>
        );
    }
  };

  return (
    <AdminLayoutShell
      title="Executive Command Dashboard"
      subtitle="Overview of lab operations, SLA metrics, customer pipelines, and live telemetry"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/inquiries"
            className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition shadow-xs flex items-center gap-1.5"
          >
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Client Leads ({newInquiriesCount})</span>
          </Link>
          <Link
            href="/admin/tickets"
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition shadow-sm"
          >
            Manage All Tickets ({tickets.length}) →
          </Link>
        </div>
      }
    >
      <div className="space-y-8 animate-in fade-in">
        {/* 1. WELCOME BANNER (MATCHING CLIENT & TECHNICIAN DASHBOARDS) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0c1527] via-[#091223] to-[#070e1b] shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/10 blur-[90px]" />

          <div className="flex items-center gap-4 sm:gap-5 relative z-10">
            {/* AVATAR */}
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl shadow-xl shadow-red-600/25 border-2 border-red-500/40 shrink-0">
              EB
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold border border-red-500/30 bg-red-500/15 text-red-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                  <span>Super Admin Command Center</span>
                  <span className="opacity-60">• Tier-1 Security</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {adminEmail}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Welcome back, {adminName}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Executive management overview • Cleanroom bench triage, client pipelines, and audit telemetry.
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            {unassignedCount > 0 && (
              <Link
                href="/admin/tickets"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-400 transition"
              >
                <span>⚡</span>
                <span>Dispatch Queue ({unassignedCount})</span>
              </Link>
            )}

            <Link
              href="/admin/inquiries"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 shadow-sm hover:bg-slate-700 hover:text-white transition"
            >
              <span>🔔</span>
              <span>Review Leads ({newInquiriesCount})</span>
            </Link>
          </div>
        </div>

        {/* 2. LEADS ALERT BANNER */}
        {newInquiriesCount > 0 && (
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#0f172a] p-4 text-xs text-blue-200 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-blue-950/20">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-bold">
                🔔
              </span>
              <span>
                You have <strong className="text-white font-bold">{newInquiriesCount} new client consultation / SLA request(s)</strong> waiting for review and specialist dispatch.
              </span>
            </div>
            <Link
              href="/admin/inquiries"
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 font-bold text-white hover:bg-blue-500 transition shadow-xs"
            >
              Review Leads &amp; Coordinate →
            </Link>
          </div>
        )}

        {/* 3. METRICS ROW (MATCHING CLIENT & TECHNICIAN METRIC CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1427] p-5 shadow-sm hover:border-slate-700 transition">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recovery SLA Success
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-400">99.98%</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ISO-5 Class
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">500+ verified cleanroom jobs</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1427] p-5 shadow-sm hover:border-slate-700 transition">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Cleanroom Bays
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-blue-400">4 / 4</span>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                100% Load
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">PC-3000 Channels 01-04 active</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1427] p-5 shadow-sm hover:border-slate-700 transition">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Client Organizations
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white">{customerCount || 48}</span>
              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Enterprise
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Active enterprise contracts</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1427] p-5 shadow-sm hover:border-slate-700 transition">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Unassigned Triage Queue
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-400">
                {unassignedCount} {unassignedCount === 1 ? "Case" : "Cases"}
              </span>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Needs Dispatch
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Average triage dispatch &lt; 9 mins</p>
          </div>
        </div>

        {/* 4. MASTER HARDWARE & INCIDENT PIPELINE TABLE */}
        <div className="rounded-3xl border border-slate-800 bg-[#0c1427] shadow-xl overflow-hidden">
          {/* TABLE HEADER & FILTER TABS */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Master Service Ticket Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live hardware targets, cleanroom bays, and specialist dispatch
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/tickets"
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs"
                >
                  Open Full Ticket Manager →
                </Link>
              </div>
            </div>

            {/* SEARCH & CATEGORY FILTER TABS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search tickets by ID, client, hardware..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-8 pr-4 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
                {[
                  { id: "ALL", label: `All (${tickets.length})` },
                  { id: "UNASSIGNED", label: `Unassigned (${unassignedCount})`, highlight: true },
                  { id: "Data Recovery", label: "Data Recovery" },
                  { id: "Cybersecurity", label: "Cybersecurity" },
                  { id: "Cloud Solutions", label: "Cloud" },
                  { id: "Managed IT", label: "Managed IT" },
                ].map((tab) => {
                  const isActive = filterCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterCategory(tab.id)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition text-xs cursor-pointer ${
                        isActive
                          ? tab.highlight
                            ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                            : "bg-blue-600 text-white font-bold shadow-sm"
                          : tab.highlight
                          ? "border border-slate-800 bg-slate-900 text-amber-400 hover:text-white"
                          : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
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
              <tbody className="divide-y divide-slate-800/70">
                {filteredTickets.length === 0 ? (
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
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-blue-400">
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
                                className="bg-blue-500 h-1.5 rounded-full"
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
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                              Pending Dispatch
                            </Link>
                          ) : (
                            <span className="text-slate-300 font-medium">{t.assignedTech}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href="/admin/tickets"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold transition"
                            >
                              Dispatch
                            </Link>
                            <Link
                              href={`/technician/tickets/${t.id}`}
                              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition hidden sm:inline-block"
                            >
                              Workbench →
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteModalTicket(t)}
                              disabled={deletingId === t.id}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-xs cursor-pointer"
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

        {/* 5. QUICK SHORTCUTS (MATCHING WORKBENCH TILES) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Link
            href="/admin/blog"
            className="rounded-3xl border border-slate-800 bg-[#0c1427] p-6 hover:border-slate-700 transition group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition">
              Blog &amp; Case Study Publisher
            </h3>
            <p className="text-slate-400 mt-1.5 text-xs leading-relaxed">
              Publish forensic recovery case studies and technical guides directly to the public website.
            </p>
          </Link>

          <Link
            href="/admin/technicians"
            className="rounded-3xl border border-slate-800 bg-[#0c1427] p-6 hover:border-slate-700 transition group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition">
              Technician &amp; Bench Roster
            </h3>
            <p className="text-slate-400 mt-1.5 text-xs leading-relaxed">
              Manage forensic specialists and monitor PC-3000 Cleanroom bay workloads.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="rounded-3xl border border-slate-800 bg-[#0c1427] p-6 hover:border-slate-700 transition group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition">
              Company Settings &amp; Security
            </h3>
            <p className="text-slate-400 mt-1.5 text-xs leading-relaxed">
              Configure Master Security Keys, 24/7 hotline (+91 6380488373), and emergency SLA rules.
            </p>
          </Link>
        </div>

        {/* MODERN DELETE MODAL */}
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
          isDeleting={!!deletingId}
        />
      </div>
    </AdminLayoutShell>
  );
}
