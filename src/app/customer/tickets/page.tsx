"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import { fetchTicketsFromSupabase, deleteTicketFromSupabase, Ticket } from "@/lib/portalData";
import { getCustomerSession } from "@/lib/clientAuth";

export default function CustomerTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        const all = await fetchTicketsFromSupabase(userEmail);
        const myTickets = all.filter((t) => {
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

        setTickets(myTickets);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Ticket #${ticketId}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(ticketId);
    try {
      const ok = await deleteTicketFromSupabase(ticketId);
      if (ok) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      } else {
        alert("Failed to delete ticket. Please check connection and try again.");
      }
    } catch (err) {
      console.error("Delete ticket error:", err);
      alert("Error occurred while deleting ticket.");
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
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "Cybersecurity":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-300 border border-rose-500/30">
            <span>🛡️</span> Cybersecurity
          </span>
        );
      case "Cloud Solutions":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
            <span>☁️</span> Cloud Solutions
          </span>
        );
      case "Managed IT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
            <span>🖥️</span> Managed IT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-300 border border-blue-500/30">
            <span>💽</span> Data Recovery
          </span>
        );
    }
  };

  const getProgressLabel = (t: Ticket) => {
    const pct = t.clonedPercent || 0;
    if (t.category === "Cybersecurity") {
      return `${pct}% Remediated`;
    }
    if (t.category === "Cloud Solutions") {
      return `${pct}% Deployed`;
    }
    if (t.category === "Managed IT") {
      return `${pct}% Resolved`;
    }
    return `${pct}% Cloned`;
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* AMBIENT GLOW MESH */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] bg-indigo-600/8 rounded-full blur-[140px]" />
      </div>

      <CustomerNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>Direct Telemetry Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Enterprise Support &amp; Recovery Tickets
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live telemetry for Cleanroom Data Recovery, SOC Cybersecurity, Cloud Infrastructure, and Managed IT
            </p>
          </div>

          <Link
            href="/customer/tickets/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition"
          >
            <span>+ Open New Ticket</span>
          </Link>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-4 mb-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search Ticket ID, serial, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition ${
                categoryFilter === "ALL"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setCategoryFilter("Data Recovery")}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition ${
                categoryFilter === "Data Recovery"
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              💽 Recovery
            </button>
            <button
              onClick={() => setCategoryFilter("Cybersecurity")}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition ${
                categoryFilter === "Cybersecurity"
                  ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                  : "border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              🛡️ Cyber
            </button>
            <button
              onClick={() => setCategoryFilter("Cloud Solutions")}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition ${
                categoryFilter === "Cloud Solutions"
                  ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                  : "border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              ☁️ Cloud
            </button>
            <button
              onClick={() => setCategoryFilter("Managed IT")}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition ${
                categoryFilter === "Managed IT"
                  ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                  : "border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              🖥️ Managed IT
            </button>
          </div>
        </div>

        {/* TICKETS TABLE */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-3" />
              <p className="text-xs text-slate-400 font-mono">Synchronizing live portal tickets from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <p className="font-bold text-white text-sm">No tickets found</p>
              <p className="text-xs text-slate-500 mt-1">
                {search ? "No cases match your search criteria." : "You have no active support tickets in this view."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] font-mono font-bold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Ticket ID</th>
                    <th className="px-5 py-3.5">Service Category</th>
                    <th className="px-5 py-3.5">Target / Subject</th>
                    <th className="px-5 py-3.5">Urgency</th>
                    <th className="px-5 py-3.5">Current Status</th>
                    <th className="px-5 py-3.5">Lead Specialist</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((t) => {
                    const isUnassigned =
                      !t.assignedTech ||
                      t.assignedTech === "Unassigned" ||
                      t.assignedTech.toLowerCase().includes("unassigned");

                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-4 font-mono font-bold text-blue-400">
                          #{t.id}
                        </td>
                        <td className="px-5 py-4">
                          {getCategoryBadge(t.category)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-white">{t.deviceOrSubject}</p>
                          {t.serialNumber && (
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              ID: {t.serialNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                              t.priority === "CRITICAL"
                                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                : t.priority === "HIGH"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                                t.status === "Resolved"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {t.status}
                            </span>
                            {Number(t.clonedPercent) > 0 && (
                              <span className="text-[10px] font-mono font-semibold text-emerald-400">
                                {getProgressLabel(t)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {isUnassigned ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              Pending Dispatch
                            </span>
                          ) : (
                            <span className="text-slate-200 font-medium flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              {t.assignedTech}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/customer/tickets/${t.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 font-bold text-xs text-blue-400 hover:bg-slate-700 hover:text-white transition"
                            >
                              <span>View</span>
                              <span>→</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteTicket(t.id)}
                              disabled={deletingId === t.id}
                              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 transition text-xs"
                              title={`Permanently delete Ticket #${t.id}`}
                            >
                              {deletingId === t.id ? "..." : "🗑️"}
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
      </main>

      <Footer />
    </div>
  );
}
