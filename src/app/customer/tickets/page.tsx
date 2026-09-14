"use client";

import { useState } from "react";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import { initialTickets, Ticket } from "@/lib/portalData";

export default function CustomerTicketsPage() {
  const [tickets] = useState<Ticket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceOrSubject.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && t.status !== "Resolved") ||
      (statusFilter === "RESOLVED" && t.status === "Resolved");
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Support &amp; Data Recovery Tickets
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor cleanroom recovery progress and enterprise cloud tickets
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
              placeholder="Search by Ticket ID, drive model, serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
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
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                categoryFilter === "Data Recovery"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              💽 Data Recovery
            </button>
            <button
              onClick={() => setCategoryFilter("Cloud Solutions")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                categoryFilter === "Cloud Solutions"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              ☁️ Cloud
            </button>
          </div>
        </div>

        {/* TICKETS TABLE */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Service Category</th>
                  <th className="px-5 py-3.5">Hardware / Subject</th>
                  <th className="px-5 py-3.5">Urgency</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5">Lead Tech</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-bold text-blue-600">
                      #{t.id}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {t.category}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{t.deviceOrSubject}</p>
                      {t.serialNumber && (
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                          SN: {t.serialNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          t.priority === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : t.priority === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          t.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {t.status} {t.clonedPercent ? `(${t.clonedPercent}%)` : ""}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {t.assignedTech}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/customer/tickets/${t.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 font-bold text-blue-600 hover:bg-blue-50 transition"
                      >
                        <span>View</span>
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
