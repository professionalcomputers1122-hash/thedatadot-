"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TechnicianNav from "@/components/TechnicianNav";
import Footer from "@/components/Footer";
import { initialTickets, Ticket, fetchTicketsFromSupabase } from "@/lib/portalData";

export default function TechnicianTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const live = await fetchTicketsFromSupabase();
        if (live && live.length > 0) {
          setTickets(live);
        } else {
          setTickets(initialTickets);
        }
      } catch (err) {
        console.warn("Failed to load tickets in technician portal:", err);
        setTickets(initialTickets);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = tickets.filter((t) => {
    const matchesFilter =
      filter === "ALL" ||
      t.category === filter ||
      (filter === "UNASSIGNED" && (!t.assignedTech || t.assignedTech === "Unassigned"));

    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.companyName.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceOrSubject.toLowerCase().includes(search.toLowerCase()) ||
      (t.serialNumber && t.serialNumber.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getProgressLabel = (t: Ticket) => {
    const pct = t.clonedPercent || 0;
    if (t.category === "Cybersecurity") return `${pct}% Remediated`;
    if (t.category === "Cloud Solutions") return `${pct}% Deployed`;
    if (t.category === "Managed IT") return `${pct}% Resolved`;
    return `${pct}% Cloned`;
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <TechnicianNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-0.5 text-xs font-bold text-indigo-300 mb-2">
              <span>Enterprise Specialist Queue</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Technical Workbench &amp; Diagnostic Queue
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live cases across Data Recovery, Cybersecurity, Cloud Infrastructure, and Managed IT.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              ● Live Supabase Link Active
            </span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <input
            type="text"
            placeholder="Search Ticket ID, company, device model, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-indigo-500"
          />

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              All Services ({tickets.length})
            </button>
            <button
              onClick={() => setFilter("UNASSIGNED")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "UNASSIGNED"
                  ? "bg-amber-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-amber-400 hover:text-white"
              }`}
            >
              ⚠️ Unassigned
            </button>
            <button
              onClick={() => setFilter("Data Recovery")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "Data Recovery"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              💽 Recovery
            </button>
            <button
              onClick={() => setFilter("Cybersecurity")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "Cybersecurity"
                  ? "bg-rose-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              🛡️ Cyber
            </button>
            <button
              onClick={() => setFilter("Cloud Solutions")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "Cloud Solutions"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              ☁️ Cloud
            </button>
            <button
              onClick={() => setFilter("Managed IT")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "Managed IT"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              🖥️ Managed IT
            </button>
          </div>
        </div>

        {/* WORKBENCH TABLE */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden text-xs">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3" />
              <p className="text-xs text-slate-400 font-mono">Synchronizing workbench cases...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-400">No matching tickets in queue</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4">Ticket ID</th>
                    <th className="px-5 py-4">Client Org</th>
                    <th className="px-5 py-4">Target / Scope</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Assigned Specialist</th>
                    <th className="px-5 py-4">Stage</th>
                    <th className="px-5 py-4">Progress</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((t) => {
                    const isUnassigned =
                      !t.assignedTech ||
                      t.assignedTech === "Unassigned" ||
                      t.assignedTech.toLowerCase().includes("unassigned");

                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-4 font-bold text-indigo-400">
                          #{t.id}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-white">{t.companyName}</p>
                          <span className="text-[11px] text-slate-400 block">{t.customerName}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-200">{t.deviceOrSubject}</p>
                          {t.serialNumber && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              ID: {t.serialNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              t.category === "Cybersecurity"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : t.category === "Cloud Solutions"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : t.category === "Managed IT"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isUnassigned ? (
                            <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                              ⚠️ Unassigned
                            </span>
                          ) : (
                            <span className="text-slate-200 font-semibold">{t.assignedTech}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-slate-300 font-medium">
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {Number(t.clonedPercent) > 0 ? (
                            <div className="w-28">
                              <div className="flex justify-between text-[10px] font-bold text-emerald-400 mb-1">
                                <span>{getProgressLabel(t)}</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${t.clonedPercent}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">0% (Pending)</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/technician/tickets/${t.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 font-bold text-white hover:bg-indigo-500 transition shadow-xs"
                          >
                            <span>Open Bench</span>
                            <span>→</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
