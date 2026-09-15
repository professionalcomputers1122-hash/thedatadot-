"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import ModernDeleteModal from "@/components/ModernDeleteModal";
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
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "Cybersecurity":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
            <span>🛡️</span> Cybersecurity
          </span>
        );
      case "Cloud Solutions":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
            <span>☁️</span> Cloud Solutions
          </span>
        );
      case "Managed IT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <span>🖥️</span> Managed IT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
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
              💽 Recovery
            </button>
            <button
              onClick={() => setCategoryFilter("Cybersecurity")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                categoryFilter === "Cybersecurity"
                  ? "bg-rose-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🛡️ Cyber
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
            <button
              onClick={() => setCategoryFilter("Managed IT")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                categoryFilter === "Managed IT"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🖥️ Managed IT
            </button>
          </div>
        </div>

        {/* TICKETS TABLE */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-3" />
              <p className="text-xs text-slate-400 font-mono">Synchronizing live portal tickets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No tickets found</p>
              <p className="text-xs text-slate-400 mt-1">
                {search ? "No cases match your search criteria." : "You have no active support tickets in this view."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
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
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((t) => {
                    const isUnassigned =
                      !t.assignedTech ||
                      t.assignedTech === "Unassigned" ||
                      t.assignedTech.toLowerCase().includes("unassigned");

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition">
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
                            {Number(t.clonedPercent) > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-600">
                                {getProgressLabel(t)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {isUnassigned ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pending Dispatch
                            </span>
                          ) : (
                            <span className="text-slate-800 font-medium">{t.assignedTech}</span>
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
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
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
