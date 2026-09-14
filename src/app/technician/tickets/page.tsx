"use client";

import { useState } from "react";
import Link from "next/link";
import TechnicianNav from "@/components/TechnicianNav";
import Footer from "@/components/Footer";
import { initialTickets, Ticket } from "@/lib/portalData";

export default function TechnicianTicketsPage() {
  const [tickets] = useState<Ticket[]>(initialTickets);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = tickets.filter((t) => {
    const matchesFilter =
      filter === "ALL" ||
      (filter === "HDD" && t.deviceOrSubject.toLowerCase().includes("ironwolf")) ||
      (filter === "SSD" && t.deviceOrSubject.toLowerCase().includes("980 pro")) ||
      (filter === "RAID" && t.deviceOrSubject.toLowerCase().includes("raid"));
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.companyName.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceOrSubject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <TechnicianNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-0.5 text-xs font-bold text-indigo-300 mb-2">
              <span>Laboratory Hardware Queue</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cleanroom Diagnostic &amp; Recovery Tickets
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned physical media targets across PC-3000 channels and laminar airflow stations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              ● 3 Channels Active
            </span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <input
            type="text"
            placeholder="Search by ticket ID, company, drive model, serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-indigo-500"
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
              All Hardware
            </button>
            <button
              onClick={() => setFilter("HDD")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "HDD"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              💽 HDDs
            </button>
            <button
              onClick={() => setFilter("SSD")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "SSD"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              ⚡ NVMe / SSD
            </button>
            <button
              onClick={() => setFilter("RAID")}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                filter === "RAID"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              🏢 RAID Servers
            </button>
          </div>
        </div>

        {/* WORKBENCH TABLE */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Ticket ID</th>
                  <th className="px-5 py-4">Client Company</th>
                  <th className="px-5 py-4">Storage Hardware</th>
                  <th className="px-5 py-4">Urgency</th>
                  <th className="px-5 py-4">Forensic Stage</th>
                  <th className="px-5 py-4">Extraction</th>
                  <th className="px-5 py-4 text-right">Workbench</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((t) => (
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
                          SN: {t.serialNumber}
                        </span>
                      )}
                    </td>
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
                      <span className="text-slate-300 font-medium">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {t.clonedPercent ? (
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] font-bold text-emerald-400 mb-1">
                            <span>Cloned</span>
                            <span>{t.clonedPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${t.clonedPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
