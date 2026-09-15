"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import {
  initialTickets,
  Ticket,
  fetchTicketsFromSupabase,
  initialTechnicians,
  sendMessageToSupabase,
  deleteTicketFromSupabase,
} from "@/lib/portalData";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [notification, setNotification] = useState("");

  const handleDeleteTicket = async (ticketId: string) => {
    const ok = window.confirm(
      `⚠️ PERMANENT PURGE: Are you sure you want to permanently delete Ticket #${ticketId}? All messages, diagnostics, and records will be purged.`
    );
    if (!ok) return;

    try {
      await deleteTicketFromSupabase(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setNotification(`✓ Case #${ticketId} permanently deleted and removed from system.`);
      setTimeout(() => setNotification(""), 5000);
    } catch (err) {
      console.error("Delete ticket error:", err);
      alert("Failed to delete ticket.");
    }
  };

  // Assign Modal State
  const [assignModalTicket, setAssignModalTicket] = useState<Ticket | null>(null);
  const [selectedTech, setSelectedTech] = useState("");
  const [selectedStation, setSelectedStation] = useState("PC-3000 Bench 01 (Class-5 Hood)");
  const [selectedStatus, setSelectedStatus] = useState("Cleanroom Diagnosis");
  const [techDirective, setTechDirective] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Load live tickets from Supabase and technicians from storage
  useEffect(() => {
    async function loadData() {
      try {
        const liveTickets = await fetchTicketsFromSupabase();
        setTickets(liveTickets || []);
      } catch (err) {
        console.warn("Failed to load tickets from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // 10-second polling for real-time dispatch updates
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const unassignedCount = tickets.filter(
    (t) => !t.assignedTech || t.assignedTech === "Unassigned"
  ).length;

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.companyName.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceOrSubject.toLowerCase().includes(search.toLowerCase());

    if (filter === "UNASSIGNED") {
      return matchesSearch && (!t.assignedTech || t.assignedTech === "Unassigned");
    }
    if (filter === "ALL") return matchesSearch;
    return matchesSearch && t.category === filter;
  });

  const openAssignModal = (ticket: Ticket) => {
    setAssignModalTicket(ticket);
    const firstTech = technicians[0]?.name || "K. Vignesh";
    setSelectedTech(
      ticket.assignedTech && ticket.assignedTech !== "Unassigned"
        ? ticket.assignedTech
        : firstTech
    );
    setSelectedStation(
      ticket.assignedBench && ticket.assignedBench !== "Pending Allocation"
        ? ticket.assignedBench
        : ticket.category === "Cybersecurity"
        ? "SOC Threat Isolation Station 01"
        : ticket.category === "Cloud Solutions"
        ? "Cloud Infrastructure Terminal 01"
        : ticket.category === "Managed IT"
        ? "Enterprise Fleet Support Bench 01"
        : "PC-3000 Bench 01 (Class-5 Hood)"
    );
    setSelectedStatus(
      (ticket.status as string) === "Intake & Diagnostics"
        ? ticket.category === "Cybersecurity"
          ? "Threat Containment & Analysis"
          : ticket.category === "Cloud Solutions"
          ? "Cloud Architecture & Security"
          : ticket.category === "Managed IT"
          ? "Technical Assessment"
          : "Cleanroom Diagnosis"
        : (ticket.status as string)
    );
    setTechDirective(
      `Case dispatched by Super Admin. Target: ${ticket.deviceOrSubject}. Immediate triage authorized.`
    );
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalTicket || !selectedTech) return;

    setAssigning(true);
    const ticketId = assignModalTicket.id;
    const assignedName = selectedTech.trim();

    try {
      // 1. Update ticket in Supabase via PATCH /api/tickets/[id]
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTech: assignedName,
          assignedBench: selectedStation,
          status: selectedStatus,
          techNotes: techDirective,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update ticket assignment in Supabase");
      }

      // 2. Post formal assignment message into ticket chat
      try {
        await sendMessageToSupabase(
          ticketId,
          "Technician",
          assignedName,
          `Lead Technician Assignment: Super Admin has allocated this case to ${assignedName} on workstation "${selectedStation}". Initial bench inspection and diagnostic clone protocol commenced.`
        );
      } catch (msgErr) {
        console.warn("Assignment notification chat warning:", msgErr);
      }

      // 3. Update local state
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                assignedTech: assignedName,
                status: selectedStatus as any,
                techNotes: techDirective,
              }
            : t
        )
      );

      setNotification(
        `✓ Case #${ticketId} successfully assigned to ${assignedName} on ${selectedStation}!`
      );
      setAssignModalTicket(null);
      setTimeout(() => setNotification(""), 6000);
    } catch (err: any) {
      console.error("Assignment error:", err);
      alert("Failed to save assignment. Please check server logs.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AdminLayoutShell
      title="Master Tickets & Technician Dispatch"
      subtitle="Super Admin case assignment, ISO Class-5 cleanroom dispatch, and engineering workload triage"
    >
      <div className="space-y-6 text-xs">
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/70 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg">
            <span>{notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-400 hover:text-white ml-4">
              ✕
            </button>
          </div>
        )}

        {/* UNASSIGNED CASES BANNER */}
        {unassignedCount > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <div>
                <p className="font-bold text-amber-300">
                  {unassignedCount} New {unassignedCount === 1 ? "Case Awaiting" : "Cases Awaiting"} Technician Assignment
                </p>
                <p className="text-[11px] text-amber-400/80">
                  Newly raised client recovery tickets require Super Admin triage and technician dispatch.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilter("UNASSIGNED")}
              className="rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400 transition shrink-0"
            >
              View Unassigned Queue ({unassignedCount}) →
            </button>
          </div>
        )}

        {/* CONTROLS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search tickets by case ID, client, organization, drive model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-blue-500 text-xs"
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
              All Cases ({tickets.length})
            </button>
            <button
              onClick={() => setFilter("UNASSIGNED")}
              className={`rounded-xl px-3 py-1.5 font-bold transition flex items-center gap-1.5 ${
                filter === "UNASSIGNED"
                  ? "bg-amber-500 text-slate-950"
                  : "border border-slate-800 bg-slate-950 text-amber-400 hover:text-white"
              }`}
            >
              <span>⚠️ Unassigned ({unassignedCount})</span>
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

        {/* MASTER TABLE */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Organization &amp; Client</th>
                  <th className="px-5 py-3.5">Device Target</th>
                  <th className="px-5 py-3.5">SLA Urgency</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Extraction</th>
                  <th className="px-5 py-3.5">Assigned Technician</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((t) => {
                  const isUnassigned = !t.assignedTech || t.assignedTech === "Unassigned";

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono font-bold text-blue-400">#{t.id}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-white block">{t.companyName}</span>
                        <span className="text-slate-400 text-[11px]">{t.customerName}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-medium">
                        <div>{t.deviceOrSubject}</div>
                        <span className="text-[10px] text-slate-500 font-mono">SN: {t.serialNumber || "N/A"}</span>
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
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-400">
                        {t.clonedPercent ? `${t.clonedPercent}%` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {isUnassigned ? (
                          <button
                            onClick={() => openAssignModal(t)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-xs"
                          >
                            <span>⚡</span>
                            <span>Assign Tech</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{t.assignedTech}</span>
                            <button
                              onClick={() => openAssignModal(t)}
                              className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline font-bold"
                            >
                              [Reassign]
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openAssignModal(t)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-bold text-amber-300 hover:bg-slate-700"
                        >
                          Dispatch
                        </button>
                        <Link
                          href={`/technician/tickets/${t.id}`}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-bold text-blue-400 hover:text-white"
                        >
                          Workbench →
                        </Link>
                        <button
                          onClick={() => handleDeleteTicket(t.id)}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 font-bold text-rose-400 hover:bg-rose-500/20 transition"
                          title="Permanently Delete Ticket"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ASSIGN TECHNICIAN MODAL */}
        {assignModalTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 text-slate-200 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400 text-sm">
                      Case #{assignModalTicket.id}
                    </span>
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Super Admin Dispatch
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Assign Technician &amp; Workbench
                  </h3>
                </div>
                <button
                  onClick={() => setAssignModalTicket(null)}
                  className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* TICKET SUMMARY CARD */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 mb-5 text-xs space-y-1.5">
                <p>
                  <strong className="text-slate-400">Client:</strong>{" "}
                  <span className="text-white font-semibold">{assignModalTicket.customerName}</span> ({assignModalTicket.companyName})
                </p>
                <p>
                  <strong className="text-slate-400">Device Target:</strong>{" "}
                  <span className="text-white font-semibold">{assignModalTicket.deviceOrSubject}</span>
                </p>
                <p>
                  <strong className="text-slate-400">Reported Symptoms:</strong>{" "}
                  <span className="text-slate-300">{assignModalTicket.symptoms || "Hardware failure diagnostics"}</span>
                </p>
                <p>
                  <strong className="text-slate-400">SLA Priority:</strong>{" "}
                  <span className="font-bold text-red-400">{assignModalTicket.priority}</span>
                </p>
              </div>

              <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Select Specialist Technician:
                  </label>
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
                  >
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.name}>
                        {tech.name} — {tech.role} ({tech.station})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Assign Cleanroom / Laboratory Workbench:
                  </label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="PC-3000 Bench 01 (Class-5 Hood)">
                      PC-3000 Bench 01 (ISO Class-5 Laminar Hood)
                    </option>
                    <option value="PC-3000 Flash & Portable III">
                      PC-3000 Flash &amp; Portable III (NVMe / SSD Station)
                    </option>
                    <option value="Forensic Hex Server Rack 04">
                      Forensic Hex Server Rack 04 (RAID / SAS Reconstruction)
                    </option>
                    <option value="SOC Threat Isolation Station 01">
                      SOC Threat Isolation Station 01 (Cybersecurity IR)
                    </option>
                    <option value="Cloud Infrastructure Terminal 01">
                      Cloud Infrastructure Terminal 01 (Cloud Architecture)
                    </option>
                    <option value="Enterprise Fleet Support Bench 01">
                      Enterprise Fleet Support Bench 01 (Managed IT)
                    </option>
                    <option value="Soldering & Micro-inspection Station">
                      Soldering &amp; Micro-inspection Station
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Update Case Stage Status:
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="Intake & Diagnostics">Intake &amp; Diagnostics</option>
                    <option value="Cleanroom Diagnosis">Cleanroom Diagnosis (Data Recovery)</option>
                    <option value="PC-3000 Imaging">PC-3000 Imaging (Data Recovery)</option>
                    <option value="Threat Containment & Analysis">Threat Containment &amp; Analysis (Cybersecurity)</option>
                    <option value="Security Forensics">Security Forensics (Cybersecurity)</option>
                    <option value="Cloud Architecture & Security">Cloud Architecture &amp; Security (Cloud)</option>
                    <option value="Architecture & Deployment">Architecture &amp; Deployment (Cloud)</option>
                    <option value="Technical Assessment">Technical Assessment (Managed IT)</option>
                    <option value="Resolution & Rollout">Resolution &amp; Rollout (Managed IT)</option>
                    <option value="Integrity Verification">Integrity Verification</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Super Admin Dispatch Directive / Internal Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={techDirective}
                    onChange={(e) => setTechDirective(e.target.value)}
                    placeholder="Instructions for lead technician..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAssignModalTicket(null)}
                    className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md transition disabled:opacity-50"
                  >
                    {assigning ? "Assigning..." : "Confirm & Dispatch Technician"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}

