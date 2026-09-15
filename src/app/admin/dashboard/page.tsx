"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import { fetchTicketsFromSupabase, deleteTicketFromSupabase, Ticket } from "@/lib/portalData";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const live = await fetchTicketsFromSupabase();
        setTickets(live || []);
      } catch (e) {
        console.warn(e);
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

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "Cybersecurity":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">
            Cybersecurity
          </span>
        );
      case "Cloud Solutions":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
            Cloud
          </span>
        );
      case "Managed IT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            Managed IT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
            Data Recovery
          </span>
        );
    }
  };

  return (
    <AdminLayoutShell
      title="Executive Command Dashboard"
      subtitle="Overview of lab operations, SLA metrics, customer pipelines, and published content"
      actions={
        <Link
          href="/admin/tickets"
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm"
        >
          View All Tickets ({tickets.length}) →
        </Link>
      }
    >
      <div className="space-y-8">
        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recovery SLA Success
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-400">99.98%</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ISO-5 Class
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Based on 500+ verified cleanroom jobs</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Cleanroom Bays
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-blue-400">4 / 4</span>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                100% Load
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">PC-3000 Channels 01-04 operational</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Client Organizations
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{customerCount || 48}</span>
              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Enterprise
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Active enterprise SLA contracts</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Unassigned Triage Queue
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-400">
                {unassignedCount} {unassignedCount === 1 ? "Case" : "Cases"}
              </span>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Needs Dispatch
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Average triage dispatch: &lt; 9.4 mins</p>
          </div>
        </div>

        {/* MASTER HARDWARE & INCIDENT PIPELINE TABLE */}
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Master Service Ticket Directory</h2>
              <p className="text-xs text-slate-400">Live hardware targets, cloud migrations, and SOC security incidents</p>
            </div>
            <Link
              href="/admin/tickets"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              Manage &amp; Dispatch Tickets →
            </Link>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950/50 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Service Category</th>
                  <th className="px-5 py-3.5">Client Organization</th>
                  <th className="px-5 py-3.5">Hardware Target / Subject</th>
                  <th className="px-5 py-3.5">Stage</th>
                  <th className="px-5 py-3.5">Lead Specialist</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {tickets.slice(0, 8).map((t) => {
                  const isUnassigned = !t.assignedTech || t.assignedTech === "Unassigned";
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-400">#{t.id}</td>
                      <td className="px-5 py-3.5">{getCategoryBadge(t.category)}</td>
                      <td className="px-5 py-3.5 font-semibold text-white">{t.companyName}</td>
                      <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate">{t.deviceOrSubject}</td>
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
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                            Pending Dispatch
                          </span>
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
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK SHORTCUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Link
            href="/admin/blog"
            className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 hover:border-slate-700 transition group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-bold text-white group-hover:text-blue-400 transition">
              Blog &amp; Case Study Publisher
            </h3>
            <p className="text-slate-400 mt-1 text-[11px]">
              Publish new recovery forensics and technical articles live on the website.
            </p>
          </Link>

          <Link
            href="/admin/technicians"
            className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 hover:border-slate-700 transition group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-white group-hover:text-blue-400 transition">
              Technician &amp; Bench Roster
            </h3>
            <p className="text-slate-400 mt-1 text-[11px]">
              Manage forensic specialists and allocate cleanroom PC-3000 workbenches.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 hover:border-slate-700 transition group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-bold text-white group-hover:text-blue-400 transition">
              Company Settings &amp; SLA Rules
            </h3>
            <p className="text-slate-400 mt-1 text-[11px]">
              Configure emergency dispatch hotline (+91 6380488373) and SLA tiers.
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
