"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import {
  Ticket,
  fetchTicketsFromSupabase,
  initialTechnicians,
  getStoredTechnicians,
  sendMessageToSupabase,
  deleteTicketFromSupabase,
  createTicketInSupabase,
  TechnicianRecord,
  getDeletedTechnicianEmails,
} from "@/lib/portalData";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [notification, setNotification] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalTicket, setDeleteModalTicket] = useState<Ticket | null>(null);

  const handleConfirmDeleteTicket = async () => {
    if (!deleteModalTicket) return;
    const ticketId = deleteModalTicket.id;

    setDeletingId(ticketId);
    try {
      await deleteTicketFromSupabase(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setNotification(`✓ Case #${ticketId} permanently deleted and removed from system.`);
      setDeleteModalTicket(null);
      setTimeout(() => setNotification(""), 5000);
    } catch (err) {
      console.error("Delete ticket error:", err);
      setNotification("Failed to delete ticket.");
    } finally {
      setDeletingId(null);
    }
  };

  // Assign Modal State
  const [assignModalTicket, setAssignModalTicket] = useState<Ticket | null>(null);
  const [selectedTech, setSelectedTech] = useState("");
  const [selectedStation, setSelectedStation] = useState("PC-3000 Bench 01 (Class-5 Hood)");
  const [selectedStatus, setSelectedStatus] = useState("Cleanroom Diagnosis");
  const [techDirective, setTechDirective] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Create Ticket Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    id: `TDD-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: "",
    companyName: "",
    customerEmail: "",
    category: "Data Recovery" as "Data Recovery" | "Cloud Solutions" | "Cybersecurity" | "Managed IT",
    deviceOrSubject: "",
    mediaType: "HDD" as "HDD" | "SSD" | "RAID" | "FLASH" | "NETWORK" | "SERVER" | "GENERAL",
    serialNumber: "",
    urgency: "Standard" as "Critical" | "High" | "Standard",
    assignedTech: "",
    assignedBench: "PC-3000 Bench 01 (Class-5 Hood)",
    symptoms: "",
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketData.customerName || !newTicketData.customerEmail || !newTicketData.deviceOrSubject) {
      alert("Please enter customer name, email address, and device/subject description.");
      return;
    }
    setCreatingTicket(true);
    try {
      const generatedId = await createTicketInSupabase({
        id: newTicketData.id,
        customerName: newTicketData.customerName,
        companyName: newTicketData.companyName || newTicketData.customerName,
        customerEmail: newTicketData.customerEmail,
        category: newTicketData.category,
        deviceOrSubject: newTicketData.deviceOrSubject,
        mediaType: newTicketData.mediaType,
        serialNumber: newTicketData.serialNumber,
        urgency: newTicketData.urgency,
        assignedTech: newTicketData.assignedTech || "Unassigned",
        assignedBench: newTicketData.assignedBench || "Pending Allocation",
        symptoms: newTicketData.symptoms,
      });

      const newRecord: Ticket = {
        id: generatedId,
        companyName: newTicketData.companyName || newTicketData.customerName,
        customerName: newTicketData.customerName,
        customerEmail: newTicketData.customerEmail,
        status: newTicketData.category === "Cybersecurity" ? "Threat Intake" : "Media Intake",
        priority: (newTicketData.urgency.toUpperCase() as "CRITICAL" | "HIGH" | "STANDARD"),
        assignedTech: newTicketData.assignedTech || "Unassigned",
        assignedBench: newTicketData.assignedBench || "Pending Allocation",
        deviceOrSubject: newTicketData.deviceOrSubject,
        category: newTicketData.category,
        mediaType: newTicketData.mediaType,
        serialNumber: newTicketData.serialNumber,
        symptoms: newTicketData.symptoms,
        techNotes: "",
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        lastUpdated: "Just now",
      };

      setTickets((prev) => [newRecord, ...prev]);
      setNotification(`✓ Master Case #${generatedId} created successfully & dispatched.`);
      setShowCreateModal(false);
      setNewTicketData({
        id: `TDD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: "",
        companyName: "",
        customerEmail: "",
        category: "Data Recovery",
        deviceOrSubject: "",
        mediaType: "HDD",
        serialNumber: "",
        urgency: "Standard",
        assignedTech: "",
        assignedBench: "PC-3000 Bench 01 (Class-5 Hood)",
        symptoms: "",
      });
      setTimeout(() => setNotification(""), 5000);
    } catch (err) {
      console.error("Failed to create ticket:", err);
      setNotification("Failed to create ticket. Please check connection.");
    } finally {
      setCreatingTicket(false);
    }
  };

  // Load live tickets & technicians from Supabase and localStorage
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

      try {
        const storedTechs = getStoredTechnicians();
        const combined = [...(storedTechs || []), ...initialTechnicians];
        const deletedSet = getDeletedTechnicianEmails();
        const seen = new Set<string>();
        const uniqueTechs: TechnicianRecord[] = [];

        for (const t of combined) {
          const emailKey = (t.email || "").toLowerCase().trim();
          const idKey = (t.id || "").toLowerCase().trim();
          const nameKey = (t.name || "").toLowerCase().trim();

          if (deletedSet.has(emailKey) || deletedSet.has(idKey)) continue;
          if (nameKey.includes("murugan") || emailKey.includes("murugan")) continue;

          const dedupeKey = nameKey || emailKey || idKey;
          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            uniqueTechs.push(t);
          }
        }

        setTechnicians(uniqueTechs);
      } catch (e) {}
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

      // 3. Dispatch automated email alert directly to the receiving technician
      const matchedTech = technicians.find(
        (t) => t.name.toLowerCase().trim() === assignedName.toLowerCase().trim()
      );
      if (matchedTech?.email) {
        try {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "ticket",
              ticketId,
              customerName: assignModalTicket.customerName,
              customerEmail: assignModalTicket.customerEmail,
              companyName: assignModalTicket.companyName,
              service: assignModalTicket.category,
              deviceOrSubject: assignModalTicket.deviceOrSubject,
              serialNumber: assignModalTicket.serialNumber,
              urgency: assignModalTicket.priority,
              technicianEmail: matchedTech.email,
              message: `Case allocated to you by Super Admin. Workstation: ${selectedStation}. Directive: ${techDirective || "Commence standard diagnostics."}`,
            }),
          });
        } catch (emailErr) {
          console.warn("Technician dispatch email warning:", emailErr);
        }
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

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "Cybersecurity":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            Cybersecurity
          </span>
        );
      case "Cloud Solutions":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
            Cloud
          </span>
        );
      case "Managed IT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            Managed IT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
            Data Recovery
          </span>
        );
    }
  };

  return (
    <AdminLayoutShell
      title="Master Tickets & Technician Dispatch"
      subtitle="Super Admin case assignment, ISO Class-5 cleanroom dispatch, and engineering workload triage"
      actions={
        <button
          onClick={() => {
            setNewTicketData((prev) => ({
              ...prev,
              id: `TDD-${Math.floor(1000 + Math.random() * 9000)}`,
            }));
            setShowCreateModal(true);
          }}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-sm leading-none font-bold">+</span>
          <span>Create New Ticket</span>
        </button>
      }
    >
      <div className="space-y-6 text-xs">
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
            <span>{notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-700 hover:text-emerald-950 ml-4">
              ✕
            </button>
          </div>
        )}

        {/* UNASSIGNED CASES BANNER */}
        {unassignedCount > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <div>
                <p className="font-bold text-amber-900">
                  {unassignedCount} New {unassignedCount === 1 ? "Case Awaiting" : "Cases Awaiting"} Technician Assignment
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  Newly raised client recovery tickets require Super Admin triage and technician dispatch.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilter("UNASSIGNED")}
              className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400 transition shrink-0 shadow-xs"
            >
              View Unassigned Queue ({unassignedCount}) →
            </button>
          </div>
        )}

        {/* CONTROLS */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search tickets by case ID, client, organization, drive model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-2xs transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 font-bold transition text-xs ${
                filter === "ALL"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              All Cases ({tickets.length})
            </button>
            <button
              onClick={() => setFilter("UNASSIGNED")}
              className={`rounded-xl px-3 py-1.5 font-bold transition flex items-center gap-1.5 text-xs ${
                filter === "UNASSIGNED"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "border border-slate-200 bg-white text-amber-700 hover:text-amber-900 hover:bg-amber-50 shadow-2xs"
              }`}
            >
              <span>Unassigned ({unassignedCount})</span>
            </button>
            <button
              onClick={() => setFilter("Data Recovery")}
              className={`rounded-xl px-3 py-1.5 font-bold transition text-xs ${
                filter === "Data Recovery"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              Data Recovery
            </button>
            <button
              onClick={() => setFilter("Cybersecurity")}
              className={`rounded-xl px-3 py-1.5 font-bold transition text-xs ${
                filter === "Cybersecurity"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              Cybersecurity
            </button>
            <button
              onClick={() => setFilter("Cloud Solutions")}
              className={`rounded-xl px-3 py-1.5 font-bold transition text-xs ${
                filter === "Cloud Solutions"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              Cloud
            </button>
            <button
              onClick={() => setFilter("Managed IT")}
              className={`rounded-xl px-3 py-1.5 font-bold transition text-xs ${
                filter === "Managed IT"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              Managed IT
            </button>
          </div>
        </div>

        {/* MASTER TABLE */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Service Category</th>
                  <th className="px-5 py-3.5">Organization &amp; Client</th>
                  <th className="px-5 py-3.5">Device Target</th>
                  <th className="px-5 py-3.5">SLA Urgency</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assigned Specialist</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => {
                  const isUnassigned = !t.assignedTech || t.assignedTech === "Unassigned";

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 font-mono font-bold text-blue-600">#{t.id}</td>
                      <td className="px-5 py-4">{getCategoryBadge(t.category)}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 block">{t.companyName}</span>
                        <span className="text-slate-500 text-[11px]">{t.customerName}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        <div>{t.deviceOrSubject}</div>
                        <span className="text-[10px] text-slate-400 font-mono">SN: {t.serialNumber || "N/A"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                            t.priority === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : t.priority === "HIGH"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isUnassigned ? (
                          <button
                            onClick={() => openAssignModal(t)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs"
                          >
                            <span>⚡</span>
                            <span>Assign Tech</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{t.assignedTech}</span>
                            <button
                              onClick={() => openAssignModal(t)}
                              className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                            >
                              [Reassign]
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAssignModal(t)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-blue-600 hover:bg-slate-50 shadow-2xs transition text-xs"
                          >
                            Dispatch
                          </button>
                          <Link
                            href={`/technician/tickets/${t.id}`}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition text-xs"
                          >
                            Workbench →
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteModalTicket(t)}
                            disabled={deletingId === t.id}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition text-xs cursor-pointer shadow-2xs"
                            title="Permanently Delete Ticket"
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

        {/* ASSIGN TECHNICIAN MODAL */}
        {assignModalTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 text-sm">
                      Case #{assignModalTicket.id}
                    </span>
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                      Super Admin Dispatch
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Assign Technician &amp; Workbench
                  </h3>
                </div>
                <button
                  onClick={() => setAssignModalTicket(null)}
                  className="rounded-lg bg-slate-100 p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              {/* TICKET SUMMARY CARD */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5 text-xs space-y-1.5">
                <p>
                  <strong className="text-slate-500">Client:</strong>{" "}
                  <span className="text-slate-900 font-semibold">{assignModalTicket.customerName}</span> ({assignModalTicket.companyName})
                </p>
                <p>
                  <strong className="text-slate-500">Device Target:</strong>{" "}
                  <span className="text-slate-900 font-semibold">{assignModalTicket.deviceOrSubject}</span>
                </p>
                <p>
                  <strong className="text-slate-500">Reported Symptoms:</strong>{" "}
                  <span className="text-slate-700">{assignModalTicket.symptoms || "Hardware failure diagnostics"}</span>
                </p>
                <p>
                  <strong className="text-slate-500">SLA Priority:</strong>{" "}
                  <span className="font-bold text-rose-600">{assignModalTicket.priority}</span>
                </p>
              </div>

              <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Select Specialist Technician:
                  </label>
                  <select
                    value={selectedTech}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      setSelectedTech(chosen);
                      const matched = technicians.find((t) => t.name === chosen);
                      if (matched?.station) {
                        setSelectedStation(matched.station);
                      }
                    }}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.name}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Assign Cleanroom / Laboratory Workbench:
                  </label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  <label className="block font-bold text-slate-600 mb-1">
                    Update Case Stage Status:
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  <label className="block font-bold text-slate-600 mb-1">
                    Super Admin Dispatch Directive / Internal Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={techDirective}
                    onChange={(e) => setTechDirective(e.target.value)}
                    placeholder="Instructions for lead technician..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssignModalTicket(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs transition disabled:opacity-50"
                  >
                    {assigning ? "Dispatching..." : "Confirm & Dispatch Technician"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* CREATE MASTER TICKET MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs text-xs">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Master Ticket</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Register a new customer case, select service division, and dispatch to engineering workbench
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Case Tracking ID
                    </label>
                    <input
                      type="text"
                      value={newTicketData.id}
                      onChange={(e) =>
                        setNewTicketData({ ...newTicketData, id: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-blue-600 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Service Division <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newTicketData.category}
                      onChange={(e: any) =>
                        setNewTicketData({ ...newTicketData, category: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
                    >
                      <option value="Data Recovery">Data Recovery Lab</option>
                      <option value="Cloud Solutions">Cloud Solutions</option>
                      <option value="Cybersecurity">Cybersecurity & Forensics</option>
                      <option value="Managed IT">Managed IT & Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Client / Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={newTicketData.customerName}
                      onChange={(e) =>
                        setNewTicketData({ ...newTicketData, customerName: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apollo Diagnostics Ltd"
                      value={newTicketData.companyName}
                      onChange={(e) =>
                        setNewTicketData({ ...newTicketData, companyName: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">
                      Customer Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@company.com"
                      value={newTicketData.customerEmail}
                      onChange={(e) =>
                        setNewTicketData({ ...newTicketData, customerEmail: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">
                      Device / Subject Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Seagate IronWolf 4TB NAS RAID Drive - Clicking sound & undetectable"
                      value={newTicketData.deviceOrSubject}
                      onChange={(e) =>
                        setNewTicketData({ ...newTicketData, deviceOrSubject: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Hardware / Media Architecture
                    </label>
                    <select
                      value={newTicketData.mediaType}
                      onChange={(e: any) =>
                        setNewTicketData({ ...newTicketData, mediaType: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="HDD">HDD (Mechanical Platters)</option>
                      <option value="SSD">SSD (NAND Flash / NVMe)</option>
                      <option value="RAID">RAID / Server Array / NAS</option>
                      <option value="FLASH">USB Flash / Monolith / SD</option>
                      <option value="NETWORK">Network Infrastructure / Firewall</option>
                      <option value="SERVER">Cloud Tenant / Virtual Server</option>
                      <option value="GENERAL">General IT Workstation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Serial Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WX12A49018"
                      value={newTicketData.serialNumber}
                      onChange={(e) =>
                        setNewTicketData({ ...newTicketData, serialNumber: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Case Priority SLA
                    </label>
                    <select
                      value={newTicketData.urgency}
                      onChange={(e: any) =>
                        setNewTicketData({ ...newTicketData, urgency: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Standard">Standard (24 - 48 Hours)</option>
                      <option value="High">High Priority (12 - 24 Hours)</option>
                      <option value="Critical">Critical Cleanroom Emergency (Immediate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Dispatch Assigned Technician
                    </label>
                    <select
                      value={newTicketData.assignedTech}
                      onChange={(e) => {
                        const chosen = e.target.value;
                        const matched = technicians.find((t) => t.name === chosen);
                        setNewTicketData({
                          ...newTicketData,
                          assignedTech: chosen,
                          ...(matched?.station ? { assignedBench: matched.station } : {}),
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="">Unassigned (Awaiting Queue)</option>
                      {technicians.map((t) => (
                        <option key={t.id || t.email} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">
                      Assigned Hardware Station / Bench
                    </label>
                    <select
                      value={newTicketData.assignedBench}
                      onChange={(e) =>
                        setNewTicketData({ ...newTicketData, assignedBench: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="PC-3000 Bench 01 (Class-5 Hood)">PC-3000 Bench 01 (Class-5 Hood)</option>
                      <option value="PC-3000 Flash & Portable III">PC-3000 Flash & Portable III</option>
                      <option value="SOC Terminal 03">SOC Terminal 03</option>
                      <option value="Pending Allocation">Pending Allocation</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">
                      Initial Symptoms & Diagnosis Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter client description of failure, clicking noises, bad sectors, ransom notes, etc..."
                      value={newTicketData.symptoms}
                      onChange={(e) =>
                        setNewTicketData({ ...newTicketData, symptoms: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTicket}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-700 shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{creatingTicket ? "Creating..." : "Create & Dispatch Master Ticket"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODERN DELETE MODAL */}
        <ModernDeleteModal
          isOpen={!!deleteModalTicket}
          onClose={() => setDeleteModalTicket(null)}
          onConfirm={handleConfirmDeleteTicket}
          title="Delete Master Ticket"
          itemType="Ticket"
          itemName={deleteModalTicket ? `Ticket #${deleteModalTicket.id} - ${deleteModalTicket.companyName}` : ""}
          description={
            deleteModalTicket
              ? `Are you sure you want to permanently purge Ticket #${deleteModalTicket.id} (${deleteModalTicket.deviceOrSubject})? All forensic diagnostics, communications, and tracking records will be permanently removed.`
              : ""
          }
          confirmButtonText="Permanently Delete Ticket"
          isDeleting={!!deletingId}
        />
      </div>
    </AdminLayoutShell>
  );
}
