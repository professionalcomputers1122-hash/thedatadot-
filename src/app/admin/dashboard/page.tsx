"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import { initialTickets, initialCustomers, fetchTicketsFromSupabase } from "@/lib/portalData";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        const live = await fetchTicketsFromSupabase();
        setTickets(live || []);
      } catch (e) {
        console.warn(e);
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

  return (
    <AdminLayoutShell
      title="Executive Command Dashboard"
      subtitle="Overview of lab operations, SLA metrics, customer pipelines, and published content"
      actions={
        <Link
          href="/admin/tickets"
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs"
        >
          View All Tickets ({tickets.length}) →
        </Link>
      }
    >
      <div className="space-y-8">
        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recovery Success Score
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">99.98%</span>
              <span className="text-xs text-emerald-400 font-semibold">ISO Certified</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Based on 500+ verified cleanroom jobs</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Cleanroom Bays
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-400">4 / 4</span>
              <span className="text-xs text-blue-400 font-semibold">100% Capacity</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">PC-3000 Channel 01-04 active</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Client Organizations
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{customerCount}</span>
              <span className="text-xs text-slate-400 font-semibold">Enterprise</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">All contracts in good standing</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Avg SLA Response
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">9.4 min</span>
              <span className="text-xs text-emerald-400 font-semibold">vs 15m Target</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Zero SLA breaches this month</p>
          </div>
        </div>

        {/* ACTIVE RECOVERY PIPELINE */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Live Hardware Recovery Pipeline</h2>
              <p className="text-xs text-slate-400">Active cleanroom targets and sector extraction status</p>
            </div>
            <Link
              href="/admin/tickets"
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              Manage Tickets →
            </Link>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Case ID</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Device Target</th>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3">Extraction</th>
                  <th className="pb-3">Lead Tech</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {tickets.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 font-bold text-blue-400">#{t.id}</td>
                    <td className="py-3.5 font-medium text-white">{t.companyName}</td>
                    <td className="py-3.5 text-slate-300">{t.deviceOrSubject}</td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 font-black text-emerald-400">
                      {t.clonedPercent ? `${t.clonedPercent}%` : "—"}
                    </td>
                    <td className="py-3.5">
                      {!t.assignedTech || t.assignedTech === "Unassigned" ? (
                        <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                          ⚠️ Unassigned
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium">{t.assignedTech}</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href="/admin/tickets"
                        className="text-blue-400 hover:underline font-bold"
                      >
                        Dispatch →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK MANAGEMENT SHORTCUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Link
            href="/admin/blog"
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-blue-500 transition group"
          >
            <span className="text-xl block mb-2">📝</span>
            <h3 className="font-bold text-white group-hover:text-blue-400 transition">
              Blog &amp; Content Publisher
            </h3>
            <p className="text-slate-400 mt-1 text-[11px]">
              Publish new articles and manage posts live on the website.
            </p>
          </Link>

          <Link
            href="/admin/technicians"
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-blue-500 transition group"
          >
            <span className="text-xl block mb-2">🔧</span>
            <h3 className="font-bold text-white group-hover:text-blue-400 transition">
              Technician &amp; Bench Roster
            </h3>
            <p className="text-slate-400 mt-1 text-[11px]">
              Manage forensic engineers and assign PC-3000 workbenches.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-blue-500 transition group"
          >
            <span className="text-xl block mb-2">⚙️</span>
            <h3 className="font-bold text-white group-hover:text-blue-400 transition">
              Company Settings &amp; SLA Rules
            </h3>
            <p className="text-slate-400 mt-1 text-[11px]">
              Configure contact hotlines (+91 6380488373) and SLA thresholds.
            </p>
          </Link>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
