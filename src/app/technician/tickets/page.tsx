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
        setTickets(live || []);
      } catch (err) {
        console.warn("Failed to load tickets in technician portal:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 4000);

    const handleUpdate = () => loadData();
    window.addEventListener("tickets-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("tickets-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
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
    <div className="min-h-screen bg-[#0b1324] text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <TechnicianNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-300 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              <span>Specialist Triage &amp; Bench Queue</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Technical Workbench &amp; Diagnostic Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active engineering incidents across Data Recovery, Cybersecurity, Cloud, and Enterprise IT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-[#0f172a] border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Supabase Telemetry Active
            </span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-sm">
          <input
            type="text"
            placeholder="Search Ticket ID, client org, device model, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-white outline-none focus:border-blue-500 transition"
          />

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition text-xs ${
                filter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              All Services ({tickets.length})
            </button>
            <button
              onClick={() => setFilter("UNASSIGNED")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition text-xs ${
                filter === "UNASSIGNED"
                  ? "bg-amber-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-amber-400 hover:text-white"
              }`}
            >
              Unassigned
            </button>
            <button
              onClick={() => setFilter("Data Recovery")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition text-xs ${
                filter === "Data Recovery"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Data Recovery
            </button>
            <button
              onClick={() => setFilter("Cybersecurity")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition text-xs ${
                filter === "Cybersecurity"
                  ? "bg-rose-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Cybersecurity
            </button>
            <button
              onClick={() => setFilter("Cloud Solutions")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition text-xs ${
                filter === "Cloud Solutions"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Cloud
            </button>
            <button
              onClick={() => setFilter("Managed IT")}
              className={`rounded-xl px-3 py-1.5 font-semibold transition text-xs ${
                filter === "Managed IT"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Managed IT
            </button>
          </div>
        </div>

        {/* WORKBENCH TABLE */}
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] shadow-md overflow-hidden text-xs">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-3" />
              <p className="text-xs text-slate-400 font-mono">Synchronizing workbench queue...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-400">No matching tickets in diagnostic queue</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Ticket ID</th>
                    <th className="px-5 py-3.5">Client Org</th>
                    <th className="px-5 py-3.5">Target / Scope</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Specialist</th>
                    <th className="px-5 py-3.5">Stage</th>
                    <th className="px-5 py-3.5">Progress</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filtered.map((t) => {
                    const isUnassigned =
                      !t.assignedTech ||
                      t.assignedTech === "Unassigned" ||
                      t.assignedTech.toLowerCase().includes("unassigned");

                    return (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-4 font-mono font-bold text-blue-400">
                          #{t.id}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{t.companyName}</p>
                          <span className="text-[11px] text-slate-400 block">{t.customerName}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-200">{t.deviceOrSubject}</p>
                          {t.serialNumber && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              SN: {t.serialNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              t.category === "Cybersecurity"
                                ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                                : t.category === "Cloud Solutions"
                                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                : t.category === "Managed IT"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            }`}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isUnassigned ? (
                            <span className="rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold">
                              Unassigned
                            </span>
                          ) : (
                            <span className="text-slate-200 font-medium">{t.assignedTech}</span>
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
                              <div className="flex justify-between text-[10px] font-mono font-semibold text-emerald-400 mb-1">
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
                            <span className="text-slate-500 text-[11px] font-mono">0% (Pending)</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/technician/tickets/${t.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-500 transition text-xs shadow-xs"
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
