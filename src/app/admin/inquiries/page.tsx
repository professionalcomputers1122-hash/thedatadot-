"use client";

import { useState, useEffect } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import {
  Inquiry,
  fetchInquiriesFromSupabase,
  updateInquiryInSupabase,
  deleteInquiryFromSupabase,
  createTicketInSupabase,
} from "@/lib/portalData";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [notification, setNotification] = useState("");

  // Coordinate Modal State
  const [coordinateModalInquiry, setCoordinateModalInquiry] = useState<Inquiry | null>(null);
  const [coordStatus, setCoordStatus] = useState<string>("In Coordination");
  const [coordNotes, setCoordNotes] = useState<string>("");
  const [savingCoord, setSavingCoord] = useState(false);

  // Convert to Customer Modal State
  const [convertModalInquiry, setConvertModalInquiry] = useState<Inquiry | null>(null);
  const [custName, setCustName] = useState("");
  const [custCompany, setCustCompany] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custSla, setCustSla] = useState("Enterprise 15-Min 24/7 SLA");
  const [custPassword, setCustPassword] = useState("");
  const [converting, setConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState<any | null>(null);

  // Create Ticket Modal State
  const [ticketModalInquiry, setTicketModalInquiry] = useState<Inquiry | null>(null);
  const [ticketCategory, setTicketCategory] = useState<"Data Recovery" | "Cloud Solutions" | "Cybersecurity" | "Managed IT">("Data Recovery");
  const [ticketDevice, setTicketDevice] = useState("");
  const [ticketUrgency, setTicketUrgency] = useState<"Critical" | "High" | "Standard">("Standard");
  const [ticketSymptoms, setTicketSymptoms] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Delete Modal State
  const [deleteModalInquiry, setDeleteModalInquiry] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load inquiries
  const loadData = async () => {
    try {
      const data = await fetchInquiriesFromSupabase();
      setInquiries(data || []);
    } catch (err) {
      console.warn("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    const handleUpdate = () => loadData();
    window.addEventListener("inquiries-updated", handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("inquiries-updated", handleUpdate);
    };
  }, []);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TDD-${rand}#26`;
  };

  // Open Convert Modal
  const openConvertModal = (inq: Inquiry) => {
    setConvertModalInquiry(inq);
    setCustName(inq.customerName || "");
    setCustCompany(inq.companyName || "");
    setCustEmail(inq.customerEmail || "");
    setCustPhone(inq.phone || "+91 6380488373");
    setCustSla(
      inq.urgency === "Critical"
        ? "Enterprise 15-Min 24/7 SLA"
        : inq.urgency === "High"
        ? "Priority 4-Hour Rapid SLA"
        : "Standard Business Support"
    );
    setCustPassword(generateRandomPassword());
    setConversionSuccess(null);
  };

  // Handle Customer Account Creation
  const handleConvertCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertModalInquiry) return;
    setConverting(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: custName,
          company: custCompany,
          email: custEmail,
          phone: custPhone,
          slaTier: custSla,
          password: custPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create customer account");
      }

      // Mark inquiry as Converted in database
      await updateInquiryInSupabase(convertModalInquiry.id, {
        status: "Converted",
        coordinationNotes: `Converted to official customer account #${json.customer?.id || ""} on ${new Date().toLocaleDateString()}. Initial credentials provisioned.`,
      });

      // Update local state
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === convertModalInquiry.id ? { ...i, status: "Converted" } : i
        )
      );

      setConversionSuccess({
        id: json.customer?.id || "CUST-CREATED",
        name: custName,
        company: custCompany,
        email: custEmail,
        password: custPassword,
        sla: custSla,
      });

      setNotification(`✓ Customer account successfully created for ${custName} (${custCompany})!`);
      setTimeout(() => setNotification(""), 6000);
    } catch (err: any) {
      console.error("Conversion error:", err);
      alert(err.message || "Failed to convert inquiry to customer account.");
    } finally {
      setConverting(false);
    }
  };

  // Open Ticket Modal
  const openTicketModal = (inq: Inquiry) => {
    setTicketModalInquiry(inq);
    let defaultCategory: "Data Recovery" | "Cloud Solutions" | "Cybersecurity" | "Managed IT" = "Data Recovery";
    if (inq.service?.toLowerCase().includes("cloud")) defaultCategory = "Cloud Solutions";
    else if (inq.service?.toLowerCase().includes("cyber") || inq.service?.toLowerCase().includes("soc")) defaultCategory = "Cybersecurity";
    else if (inq.service?.toLowerCase().includes("managed")) defaultCategory = "Managed IT";

    setTicketCategory(defaultCategory);
    setTicketDevice(inq.service || "Enterprise Service Case");
    setTicketUrgency(
      inq.urgency === "Critical" ? "Critical" : inq.urgency === "High" ? "High" : "Standard"
    );
    setTicketSymptoms(`Inquiry Ref: #${inq.id}\nTeam Size: ${inq.teamSize || "N/A"}\n\nClient Request:\n${inq.message}`);
  };

  // Handle Ticket Creation
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketModalInquiry) return;
    setCreatingTicket(true);

    try {
      const generatedTicketId = `TDD-${Math.floor(1000 + Math.random() * 9000)}`;

      await createTicketInSupabase({
        id: generatedTicketId,
        customerName: ticketModalInquiry.customerName,
        customerEmail: ticketModalInquiry.customerEmail,
        companyName: ticketModalInquiry.companyName || "Direct Client",
        category: ticketCategory,
        deviceOrSubject: ticketDevice,
        urgency: ticketUrgency,
        symptoms: ticketSymptoms,
        techNotes: `Ticket created from converted website lead #${ticketModalInquiry.id}.`,
      });

      setNotification(`✓ Official Ticket #${generatedTicketId} registered in Lab Workbench!`);
      setTimeout(() => setNotification(""), 6000);
      setTicketModalInquiry(null);
    } catch (err: any) {
      console.error("Create ticket error:", err);
      alert(err.message || "Failed to create official ticket.");
    } finally {
      setCreatingTicket(false);
    }
  };

  // Open Coordination Notes Modal
  const openCoordinateModal = (inq: Inquiry) => {
    setCoordinateModalInquiry(inq);
    setCoordStatus(inq.status || "In Coordination");
    setCoordNotes(inq.coordinationNotes || "");
  };

  // Save Coordination Notes & Status
  const handleSaveCoordination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinateModalInquiry) return;
    setSavingCoord(true);

    try {
      const ok = await updateInquiryInSupabase(coordinateModalInquiry.id, {
        status: coordStatus,
        coordinationNotes: coordNotes,
      });

      if (ok) {
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === coordinateModalInquiry.id
              ? { ...i, status: coordStatus, coordinationNotes: coordNotes }
              : i
          )
        );
        setNotification(`✓ Lead #${coordinateModalInquiry.id} updated: ${coordStatus}`);
        setTimeout(() => setNotification(""), 5000);
        setCoordinateModalInquiry(null);
      } else {
        alert("Failed to update coordination status.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCoord(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteModalInquiry) return;
    setIsDeleting(true);
    try {
      const ok = await deleteInquiryFromSupabase(deleteModalInquiry.id);
      if (ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== deleteModalInquiry.id));
        setNotification(`✓ Inquiry #${deleteModalInquiry.id} deleted.`);
        setTimeout(() => setNotification(""), 5000);
        setDeleteModalInquiry(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyText = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setNotification(`✓ ${label} copied to clipboard!`);
      setTimeout(() => setNotification(""), 4000);
    }
  };

  // Filtered inquiries
  const filtered = inquiries.filter((inq) => {
    const matchesFilter =
      filter === "ALL" ||
      (filter === "New Request" && inq.status === "New Request") ||
      (filter === "In Coordination" && inq.status === "In Coordination") ||
      (filter === "Contacted" && inq.status === "Contacted") ||
      (filter === "Converted" && inq.status === "Converted");

    const matchesSource =
      sourceFilter === "ALL" ||
      (sourceFilter === "ONBOARDING" &&
        (inq.source?.toLowerCase().includes("onboard") || inq.id.startsWith("INQ-ONB"))) ||
      (sourceFilter === "CONTACT" &&
        !inq.source?.toLowerCase().includes("onboard") &&
        !inq.id.startsWith("INQ-ONB"));

    const matchesSearch =
      inq.id.toLowerCase().includes(search.toLowerCase()) ||
      inq.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inq.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      inq.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (inq.phone && inq.phone.toLowerCase().includes(search.toLowerCase())) ||
      (inq.service && inq.service.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSource && matchesSearch;
  });

  // KPI Metrics
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === "New Request").length;
  const inCoordCount = inquiries.filter((i) => i.status === "In Coordination" || i.status === "Contacted").length;
  const convertedCount = inquiries.filter((i) => i.status === "Converted").length;

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "New Request":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            New Request
          </span>
        );
      case "In Coordination":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
            In Coordination
          </span>
        );
      case "Contacted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Contacted
          </span>
        );
      case "Converted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/20">
            <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
            Converted to Customer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-500/20">
            {st}
          </span>
        );
    }
  };

  const getUrgencyBadge = (urg: string) => {
    const clean = urg?.toUpperCase() || "STANDARD";
    if (clean === "CRITICAL") {
      return (
        <span className="rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold text-rose-400 uppercase">
          🔴 Critical 15m SLA
        </span>
      );
    }
    if (clean === "HIGH") {
      return (
        <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-400 uppercase">
          🟡 Priority &lt;4h
        </span>
      );
    }
    return (
      <span className="rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[11px] font-bold text-blue-400 uppercase">
        🟢 Standard SLA
      </span>
    );
  };

  const getSourceBadge = (source?: string, id?: string) => {
    const isSpecialOnboarding =
      source?.toLowerCase().includes("onboarding") || id?.startsWith("INQ-ONB");
    const isRegister = source?.toLowerCase().includes("register");

    if (isSpecialOnboarding) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[11px] font-bold text-purple-300">
          <span>🚀</span>
          <span>Onboarding Intake</span>
        </span>
      );
    }
    if (isRegister) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
          <span>🔐</span>
          <span>Portal Registration</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[11px] font-bold text-blue-300">
        <span>🌐</span>
        <span>Contact Form</span>
      </span>
    );
  };

  return (
    <AdminLayoutShell
      title="Client Requests & SLA Inquiries"
      subtitle="Coordinate with incoming website prospects, update SLA status, and convert verified leads into customer accounts."
      actions={
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      }
    >
      {/* Toast Notification */}
      {notification && (
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200 flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification("")} className="text-blue-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TOTAL CAPTURED LEADS</span>
            <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400 font-bold">ALL</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">{totalCount}</div>
          <div className="mt-1 text-xs text-slate-500">Website Consultation Submissions</div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/20 to-slate-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-blue-300 text-xs font-semibold">
            <span>NEW REQUESTS</span>
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-blue-400 tracking-tight">{newCount}</div>
          <div className="mt-1 text-xs text-blue-300/70">Awaiting initial call &amp; review</div>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-[#0f172a]/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold">
            <span>IN COORDINATION</span>
            <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] text-indigo-400 font-bold">ACTIVE</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-indigo-400 tracking-tight">{inCoordCount}</div>
          <div className="mt-1 text-xs text-slate-500">Scope, quote &amp; NDA underway</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
            <span>CONVERTED CLIENTS</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 font-bold">100%</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-400 tracking-tight">{convertedCount}</div>
          <div className="mt-1 text-xs text-emerald-300/70">Provisioned in Customer Accounts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0f172a] p-1 text-xs font-semibold">
          {[
            { id: "ALL", label: "All Inquiries" },
            { id: "New Request", label: "New Requests" },
            { id: "In Coordination", label: "In Coordination" },
            { id: "Contacted", label: "Contacted" },
            { id: "Converted", label: "Converted" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Source Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#0f172a] p-1 text-xs font-semibold">
            {[
              { id: "ALL", label: "All Channels" },
              { id: "ONBOARDING", label: "🚀 Onboarding Leads" },
              { id: "CONTACT", label: "🌐 Contact Forms" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSourceFilter(st.id)}
                className={`rounded-lg px-2.5 py-1 transition ${
                  sourceFilter === st.id
                    ? "bg-slate-700 text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search leads, name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#0f172a] px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-3" />
          <p className="text-xs text-slate-400">Loading incoming prospective client requests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-[#0f172a]/30 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white">No Inquiries Found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            {search ? `No results matching "${search}".` : "No client onboarding or consultation requests match the selected criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq) => {
            const isConverted = inq.status === "Converted";
            return (
              <div
                key={inq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  inq.status === "New Request"
                    ? "border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-[#0f172a] to-[#0f172a] shadow-lg shadow-blue-950/20"
                    : isConverted
                    ? "border-emerald-500/20 bg-[#0f172a]/80"
                    : "border-slate-800 bg-[#0f172a]/70 hover:border-slate-700"
                }`}
              >
                {/* Inquiry Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-6 py-4 bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      #{inq.id}
                    </span>
                    {getStatusBadge(inq.status)}
                    {getUrgencyBadge(inq.urgency)}
                    {getSourceBadge(inq.source, inq.id)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>
                      {inq.createdAt
                        ? new Date(inq.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent"}
                    </span>
                    <button
                      onClick={() => setDeleteModalInquiry(inq)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                      title="Delete inquiry"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Inquiry Body */}
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Column 1: Client Contact Profile */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PROSPECTIVE CLIENT</div>
                        <div className="text-base font-bold text-white mt-0.5">{inq.customerName}</div>
                        <div className="text-xs text-blue-400 font-semibold">{inq.companyName || "Organization Unspecified"}</div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          <a href={`mailto:${inq.customerEmail}`} className="text-slate-300 hover:text-blue-400 underline underline-offset-2 truncate">
                            {inq.customerEmail}
                          </a>
                        </div>

                        {inq.phone && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${inq.phone}`} className="text-emerald-300 hover:underline font-bold">
                              {inq.phone}
                            </a>
                          </div>
                        )}

                        {inq.teamSize && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Team Size: <strong className="text-slate-200">{inq.teamSize}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Service & Client Requirements */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">REQUESTED SERVICE</div>
                      <div className="text-xs font-semibold text-slate-200 bg-slate-900/60 rounded-lg p-2 border border-slate-800">
                        {inq.service || "Enterprise Technical Consultation"}
                      </div>

                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">PROJECT DESCRIPTION / SYMPTOMS</div>
                      <div className="text-xs text-slate-300 bg-slate-900/60 rounded-xl p-3 border border-slate-800 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {inq.message || "No project description provided."}
                      </div>
                    </div>

                    {/* Column 3: Internal Coordination Notes & Actions */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <span>COORDINATION LOG</span>
                          <button
                            onClick={() => openCoordinateModal(inq)}
                            className="text-blue-400 hover:text-blue-300 normal-case text-xs font-semibold"
                          >
                            Edit Notes ✎
                          </button>
                        </div>
                        <div className="mt-1 text-xs text-slate-400 bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 leading-relaxed min-h-[64px]">
                          {inq.coordinationNotes || (
                            <span className="italic text-slate-600">
                              No internal coordination notes yet. Click &quot;Coordinate&quot; to log client discussions.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        {/* 1. Coordinate / Update Notes */}
                        <button
                          onClick={() => openCoordinateModal(inq)}
                          className="flex-1 min-w-[120px] rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition text-center"
                        >
                          💬 Coordinate
                        </button>

                        {/* 2. Convert to Customer Account */}
                        {!isConverted ? (
                          <button
                            onClick={() => openConvertModal(inq)}
                            className="flex-1 min-w-[140px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition text-center"
                          >
                            👤 Convert to Customer
                          </button>
                        ) : (
                          <button
                            onClick={() => openTicketModal(inq)}
                            className="flex-1 min-w-[140px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition text-center"
                          >
                            🎫 Create Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Coordinate / Update Notes & Status */}
      {/* ========================================================================= */}
      {coordinateModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-gradient-to-b from-[#0f172a] to-[#0b1324] p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Coordinate with #{coordinateModalInquiry.id}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{coordinateModalInquiry.customerName} ({coordinateModalInquiry.companyName})</p>
              </div>
              <button onClick={() => setCoordinateModalInquiry(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCoordination} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Coordination Lifecycle Status
                </label>
                <select
                  value={coordStatus}
                  onChange={(e) => setCoordStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="New Request">🔵 New Request (Pending Contact)</option>
                  <option value="In Coordination">🟣 In Coordination (Calls/NDA in progress)</option>
                  <option value="Contacted">🟡 Contacted (Awaiting Client Reply)</option>
                  <option value="Converted">🟢 Converted (Onboarded as Customer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Internal Coordination Notes / Discussion Summary
                </label>
                <textarea
                  rows={4}
                  value={coordNotes}
                  onChange={(e) => setCoordNotes(e.target.value)}
                  placeholder="e.g. Spoke with client via phone at 2:30 PM. Sent standard enterprise NDA. They will courier 2x SAS drives for cleanroom evaluation..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCoordinateModalInquiry(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoord}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {savingCoord ? "Saving..." : "Save Coordination Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 1-Click Convert to Customer Account */}
      {/* ========================================================================= */}
      {convertModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#0f172a] to-[#0b1324] p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-400 mb-1 border border-blue-500/20">
                  Provision Customer Account
                </div>
                <h3 className="text-base font-bold text-white">Convert Lead to Active Customer</h3>
              </div>
              <button onClick={() => setConvertModalInquiry(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {conversionSuccess ? (
              <div className="space-y-4 py-2">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-white">Account Created Successfully!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {conversionSuccess.name} from <strong>{conversionSuccess.company}</strong> is now officially provisioned in the Customer Portal.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Portal Login URL:</span>
                    <span className="text-blue-400 font-mono">/customer/login</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Corporate Email:</span>
                    <span className="text-white font-bold">{conversionSuccess.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Password:</span>
                    <span className="text-amber-300 font-mono font-bold">{conversionSuccess.password}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SLA Retainer:</span>
                    <span className="text-emerald-400 font-semibold">{conversionSuccess.sla}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = `The Data Dot Customer Portal Credentials\nLogin URL: https://thedatadot.vercel.app/customer/login\nEmail: ${conversionSuccess.email}\nPassword: ${conversionSuccess.password}\nSLA Tier: ${conversionSuccess.sla}`;
                      copyText(text, "Login Credentials");
                    }}
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    📋 Copy Client Credentials
                  </button>
                  <button
                    onClick={() => {
                      const inq = convertModalInquiry;
                      setConvertModalInquiry(null);
                      if (inq) openTicketModal(inq);
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    🎫 Create First Ticket →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConvertCustomer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={custCompany}
                      onChange={(e) => setCustCompany(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Phone Contact
                    </label>
                    <input
                      type="text"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Assigned SLA Tier
                  </label>
                  <select
                    value={custSla}
                    onChange={(e) => setCustSla(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Enterprise 15-Min 24/7 SLA">Enterprise 15-Min 24/7 SLA (Critical)</option>
                    <option value="Priority 4-Hour Rapid SLA">Priority 4-Hour Rapid SLA</option>
                    <option value="Standard Business Support">Standard Business Support</option>
                    <option value="Dedicated Retainer Account">Dedicated Retainer Account</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Initial Assigned Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustPassword(generateRandomPassword())}
                      className="text-[11px] text-blue-400 hover:text-blue-300"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-amber-300 font-mono font-bold outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    This password will be pre-provisioned for the client to log into their customer tracking portal.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConvertModalInquiry(null)}
                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={converting}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {converting ? "Creating Account..." : "Provision Customer Account →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Create Official Ticket for Converted Customer */}
      {/* ========================================================================= */}
      {ticketModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0f172a] to-[#0b1324] p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 mb-1 border border-emerald-500/20">
                  Lab Workbench Intake
                </div>
                <h3 className="text-base font-bold text-white">Create Official Ticket for {ticketModalInquiry.customerName}</h3>
              </div>
              <button onClick={() => setTicketModalInquiry(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Service Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Data Recovery">Cleanroom Data Recovery</option>
                    <option value="Cloud Solutions">Cloud Solutions &amp; 365</option>
                    <option value="Cybersecurity">Cybersecurity &amp; SOC</option>
                    <option value="Managed IT">Managed Enterprise IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={ticketUrgency}
                    onChange={(e) => setTicketUrgency(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Critical">🔴 Critical (15-Min SLA)</option>
                    <option value="High">🟡 High (4-Hour SLA)</option>
                    <option value="Standard">🟢 Standard Business SLA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Device / Case Subject *
                </label>
                <input
                  type="text"
                  required
                  value={ticketDevice}
                  onChange={(e) => setTicketDevice(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Diagnostics / Case Intake Symptoms
                </label>
                <textarea
                  rows={4}
                  value={ticketSymptoms}
                  onChange={(e) => setTicketSymptoms(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTicketModalInquiry(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {creatingTicket ? "Dispatching..." : "Dispatch to Workbench →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Delete Confirmation Modal */}
      {/* ========================================================================= */}
      <ModernDeleteModal
        isOpen={!!deleteModalInquiry}
        onClose={() => setDeleteModalInquiry(null)}
        onConfirm={handleConfirmDelete}
        itemType="Client Inquiry"
        itemName={`#${deleteModalInquiry?.id || ""} - ${deleteModalInquiry?.customerName || ""}`}
        description={`Are you sure you want to permanently delete inquiry #${deleteModalInquiry?.id}?`}
        isDeleting={isDeleting}
      />
    </AdminLayoutShell>
  );
}
