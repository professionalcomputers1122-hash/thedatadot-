"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";

interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: "Subscribed" | "Unsubscribed" | string;
  subject: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Subscribed" | "Unsubscribed">("ALL");
  const [notification, setNotification] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State for Delete
  const [deleteModalSubscriber, setDeleteModalSubscriber] = useState<Subscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load subscribers from API
  const loadSubscribers = async () => {
    try {
      const res = await fetch("/api/newsletter");
      const json = await res.json();
      if (json.success && Array.isArray(json.subscribers)) {
        setSubscribers(json.subscribers);
      }
    } catch (err) {
      console.error("Failed to load newsletter subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
    const interval = setInterval(loadSubscribers, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchesSearch =
        !search ||
        (sub.email && sub.email.toLowerCase().includes(search.toLowerCase())) ||
        (sub.name && sub.name.toLowerCase().includes(search.toLowerCase())) ||
        (sub.id && sub.id.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

  // Metric counts
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.status === "Subscribed").length;
  const unsubscribedCount = subscribers.filter((s) => s.status === "Unsubscribed").length;

  // Single-Click CSV Export Handler
  const handleExportCSV = (onlySelected: boolean = false) => {
    const listToExport = onlySelected
      ? subscribers.filter((s) => selectedIds.has(s.id))
      : filteredSubscribers;

    if (listToExport.length === 0) {
      setNotification("No subscriber records available to export.");
      setTimeout(() => setNotification(""), 4000);
      return;
    }

    const headers = [
      "Subscriber ID",
      "Email Address",
      "Full Name",
      "Subscription Status",
      "Advisory Channel",
      "Date Subscribed",
    ];

    const escapeCsv = (str: string) => {
      const clean = (str || "").replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows = [
      headers.join(","),
      ...listToExport.map((s) =>
        [
          escapeCsv(s.id),
          escapeCsv(s.email),
          escapeCsv(s.name),
          escapeCsv(s.status),
          escapeCsv(s.subject),
          escapeCsv(s.createdAt ? new Date(s.createdAt).toISOString() : ""),
        ].join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `thedatadot_newsletter_subscribers_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification(`Successfully exported ${listToExport.length} subscriber email records to CSV.`);
    setTimeout(() => setNotification(""), 5000);
  };

  // Single-Click Copy All Emails Handler
  const handleCopyEmails = (onlyActive: boolean = true) => {
    const targetList = onlyActive
      ? subscribers.filter((s) => s.status === "Subscribed")
      : filteredSubscribers;

    const emailList = targetList
      .map((s) => s.email?.trim())
      .filter((e): e is string => Boolean(e && e.includes("@")));

    if (emailList.length === 0) {
      setNotification("No email addresses available to copy.");
      setTimeout(() => setNotification(""), 4000);
      return;
    }

    const emailString = emailList.join(", ");
    navigator.clipboard.writeText(emailString).then(
      () => {
        setNotification(`Copied ${emailList.length} subscriber email addresses to clipboard.`);
        setTimeout(() => setNotification(""), 5000);
      },
      () => {
        setNotification("Failed to copy emails to clipboard. Please check browser permissions.");
        setTimeout(() => setNotification(""), 4000);
      }
    );
  };

  // Single-click copy individual email
  const handleCopySingleEmail = (email: string, id: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Toggle Subscription Status (Subscribed / Unsubscribed)
  const handleToggleStatus = async (sub: Subscriber) => {
    const newStatus = sub.status === "Subscribed" ? "Unsubscribed" : "Subscribed";
    setUpdatingId(sub.id);
    try {
      const res = await fetch("/api/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sub.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus } : s))
        );
        setNotification(`Subscriber status updated to ${newStatus}.`);
        setTimeout(() => setNotification(""), 4000);
      } else {
        alert(data.error || "Failed to update subscriber status");
      }
    } catch (err: any) {
      console.error(err);
      alert("Network error updating subscriber");
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteModalSubscriber) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/newsletter?id=${encodeURIComponent(deleteModalSubscriber.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== deleteModalSubscriber.id));
        selectedIds.delete(deleteModalSubscriber.id);
        setSelectedIds(new Set(selectedIds));
        setNotification(`Subscriber #${deleteModalSubscriber.id} removed successfully.`);
        setTimeout(() => setNotification(""), 4000);
        setDeleteModalSubscriber(null);
      } else {
        alert(data.error || "Failed to delete subscriber record");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error deleting subscriber record");
    } finally {
      setIsDeleting(false);
    }
  };

  // Checkbox selection helpers
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredSubscribers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSubscribers.map((s) => s.id)));
    }
  };

  return (
    <AdminLayoutShell
      title="Newsletter Audience & Subscribers"
      subtitle="Corporate subscriber registry, delivery channel health, and single-click email list export"
    >
      {/* Toast Notification */}
      {notification && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification("")}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Subscribers</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-bold">ALL</span>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 tracking-tight">{totalSubscribers}</div>
          <div className="mt-1 text-xs text-slate-500">Corporate and individual subscribers</div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            <span>Active Subscribed</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-600 tracking-tight">{activeSubscribers}</div>
          <div className="mt-1 text-xs text-slate-500">Delivery eligible subscribers</div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold uppercase tracking-wider">
            <span>Unsubscribed</span>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800 font-bold border border-amber-200">
              OPTED OUT
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-600 tracking-tight">{unsubscribedCount}</div>
          <div className="mt-1 text-xs text-slate-500">Excluded from active mailings</div>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-white p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <span>Dispatch Channel</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-bold border border-blue-200">
              VERIFIED
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 truncate">newsletter@news.thedatadot.com</div>
          <div className="mt-1 text-xs text-slate-500">news.thedatadot.com (Resend SMTP)</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-slate-50/50">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              All Subscribers ({totalSubscribers})
            </button>
            <button
              onClick={() => setStatusFilter("Subscribed")}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === "Subscribed"
                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Active ({activeSubscribers})
            </button>
            <button
              onClick={() => setStatusFilter("Unsubscribed")}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === "Unsubscribed"
                  ? "bg-amber-600 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Unsubscribed ({unsubscribedCount})
            </button>
          </div>

          {/* Search and Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search email, name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Single-Click Export CSV Button */}
            <button
              onClick={() => handleExportCSV(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition cursor-pointer"
              title="Export all visible subscriber email records to a CSV file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>

            {/* Single-Click Copy All Active Emails Button */}
            <button
              onClick={() => handleCopyEmails(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer"
              title="Copy active subscriber email addresses to clipboard for email dispatch"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Active Emails</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadSubscribers}
              className="rounded-xl border border-slate-300 bg-white p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition"
              title="Refresh subscriber list"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Selected Items Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-slate-900 px-5 py-2.5 text-xs text-white flex items-center justify-between animate-fade-in">
            <span className="font-medium">
              <strong className="font-bold text-white">{selectedIds.size}</strong> subscribers selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV(true)}
                className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition"
              >
                Export Selected CSV
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Subscribers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredSubscribers.length > 0 &&
                      selectedIds.size === filteredSubscribers.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                </th>
                <th className="py-3 px-4">Reference ID</th>
                <th className="py-3 px-4">Subscriber Email</th>
                <th className="py-3 px-4">Subscriber Name</th>
                <th className="py-3 px-4">Channel / Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subscribed Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && subscribers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                      <span>Loading newsletter audience registry...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <svg className="w-8 h-8 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold text-slate-600">No newsletter subscribers found</span>
                      <span className="text-slate-400 text-xs">
                        {search ? "No records match your query." : "Subscribers will appear here when visitors join the advisory track."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => {
                  const isSubscribed = sub.status === "Subscribed";
                  const isSelected = selectedIds.has(sub.id);

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-50/80 transition group ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(sub.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                      </td>

                      {/* Reference ID */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                        #{sub.id}
                      </td>

                      {/* Subscriber Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <span>{sub.email}</span>
                          <button
                            onClick={() => handleCopySingleEmail(sub.email, sub.id)}
                            className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition"
                            title="Copy email to clipboard"
                          >
                            {copiedId === sub.id ? (
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Subscriber Name */}
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {sub.name || "Subscriber"}
                      </td>

                      {/* Channel / Track */}
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={sub.subject}>
                        {sub.subject || "Daily Technical Advisory"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSubscribed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Subscribed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Unsubscribed
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle status */}
                          <button
                            onClick={() => handleToggleStatus(sub)}
                            disabled={updatingId === sub.id}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                              isSubscribed
                                ? "border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                            title={isSubscribed ? "Mark as unsubscribed" : "Re-activate subscriber"}
                          >
                            {updatingId === sub.id
                              ? "Updating..."
                              : isSubscribed
                              ? "Unsubscribe"
                              : "Re-activate"}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeleteModalSubscriber(sub)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete subscriber record"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <strong className="font-semibold text-slate-800">{filteredSubscribers.length}</strong> of{" "}
            <strong className="font-semibold text-slate-800">{totalSubscribers}</strong> registered subscribers
          </div>
          <div className="flex items-center gap-3">
            <span>Delivered via <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[10px]">news.thedatadot.com</code></span>
            <span>•</span>
            <button
              onClick={() => handleExportCSV(false)}
              className="text-emerald-700 font-bold hover:underline"
            >
              Export CSV
            </button>
            <span>•</span>
            <button
              onClick={() => handleCopyEmails(true)}
              className="text-blue-700 font-bold hover:underline"
            >
              Copy Active Emails
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalSubscriber && (
        <ModernDeleteModal
          isOpen={Boolean(deleteModalSubscriber)}
          onClose={() => setDeleteModalSubscriber(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Subscriber Record"
          itemType="Newsletter Subscriber"
          itemName={`${deleteModalSubscriber.email} (#${deleteModalSubscriber.id})`}
          description="Are you sure you want to permanently remove this subscriber from the newsletter registry? They will no longer receive advisory mailings."
          confirmButtonText="Delete Subscriber"
          isDeleting={isDeleting}
        />
      )}
    </AdminLayoutShell>
  );
}
