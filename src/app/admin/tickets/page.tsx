"use client";

import { useState } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import { initialTickets, Ticket } from "@/lib/portalData";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [notification, setNotification] = useState("");

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.companyName.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceOrSubject.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || t.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayoutShell
      title="Master Tickets Registry"
      subtitle="Enterprise-wide recovery cases, workstation tickets, and engineering queue oversight"
    >
      <div className="space-y-6 text-xs">
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")}>✕</button>
          </div>
        )}

        {/* CONTROLS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search tickets by case ID, organization, drive model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-blue-500"
          />

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setFilter("Data Recovery")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "Data Recovery"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              💽 Cleanroom
            </button>
            <button
              onClick={() => setFilter("Cloud Solutions")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "Cloud Solutions"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              ☁️ Cloud
            </button>
          </div>
        </div>

        {/* MASTER TABLE */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Organization</th>
                  <th className="px-5 py-3.5">Device Target</th>
                  <th className="px-5 py-3.5">SLA Urgency</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Extraction</th>
                  <th className="px-5 py-3.5">Assigned Tech</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-blue-400">#{t.id}</td>
                    <td className="px-5 py-4 font-bold text-white">{t.companyName}</td>
                    <td className="px-5 py-4 text-slate-300 font-medium">{t.deviceOrSubject}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          t.priority === "CRITICAL"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : t.priority === "HIGH"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-300">{t.status}</span>
                    </td>
                    <td className="px-5 py-4 font-black text-emerald-400">
                      {t.clonedPercent ? `${t.clonedPercent}%` : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-400">{t.assignedTech}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/technician/tickets/${t.id}`}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 font-bold text-blue-400 hover:text-white"
                      >
                        Workbench →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
