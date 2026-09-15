"use client";

import { useState, useEffect } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import {
  initialCompanies,
  CompanyRecord,
  getDeletedCompanyIds,
  deleteCompanyRecord,
} from "@/lib/portalData";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>(initialCompanies);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Organization Form
  const [newOrg, setNewOrg] = useState({
    name: "",
    industry: "Healthcare & Diagnostics",
    plan: "Enterprise 15-Min 24/7 SLA",
    accountManager: "K. Vignesh",
    contractStatus: "Active Retainer",
  });

  // Load companies on mount & listen to real-time events
  useEffect(() => {
    async function loadCompanies() {
      try {
        const deletedSet = getDeletedCompanyIds();
        const res = await fetch("/api/companies");
        const data = await res.json();

        let list: CompanyRecord[] = [];
        if (data?.success && Array.isArray(data.companies)) {
          list = data.companies;
        } else {
          list = initialCompanies;
        }

        const filtered = list.filter(
          (c) =>
            !deletedSet.has(c.id.toLowerCase().trim()) &&
            !deletedSet.has(c.name.toLowerCase().trim())
        );
        setCompanies(filtered);
      } catch (err) {
        console.warn("Failed loading companies from API:", err);
        const deletedSet = getDeletedCompanyIds();
        setCompanies(
          initialCompanies.filter(
            (c) =>
              !deletedSet.has(c.id.toLowerCase().trim()) &&
              !deletedSet.has(c.name.toLowerCase().trim())
          )
        );
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
    const interval = setInterval(loadCompanies, 6000);

    const handleUpdate = () => loadCompanies();
    window.addEventListener("companies-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("companies-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const [deleteModalTarget, setDeleteModalTarget] = useState<CompanyRecord | null>(null);

  // Permanent Delete Company Organization Handler
  const handleConfirmDelete = async () => {
    if (!deleteModalTarget) return;
    const c = deleteModalTarget;
    setDeletingId(c.id);

    try {
      // 1. Call server API to delete from Supabase and log audit trail
      await fetch(
        `/api/companies?id=${encodeURIComponent(c.id)}&name=${encodeURIComponent(c.name)}`,
        {
          method: "DELETE",
        }
      );

      // 2. Persist deletion in local storage so it never reappears
      deleteCompanyRecord(c.id);
      deleteCompanyRecord(c.name);

      // 3. Immediately update UI state
      setCompanies((prev) =>
        prev.filter(
          (item) =>
            item.id !== c.id &&
            item.name.toLowerCase().trim() !== c.name.toLowerCase().trim()
        )
      );

      setNotification(`✓ Organization "${c.name}" permanently deleted.`);
      setDeleteModalTarget(null);
      setTimeout(() => setNotification(""), 5000);
    } catch (err) {
      console.error("Failed to delete company:", err);
      setNotification("Failed to delete organization. Please try again.");
      setTimeout(() => setNotification(""), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  // Add Organization Handler
  const handleAddOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrg.name.trim()) return;

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrg),
      });

      const data = await res.json();
      if (data?.success && data.company) {
        setCompanies((prev) => [data.company, ...prev]);
      } else {
        const fallback: CompanyRecord = {
          id: `ORG-${Math.floor(100 + Math.random() * 900)}`,
          name: newOrg.name.trim(),
          industry: newOrg.industry,
          plan: newOrg.plan,
          accountManager: newOrg.accountManager,
          devicesRecovered: 0,
          contractStatus: newOrg.contractStatus as any,
        };
        setCompanies((prev) => [fallback, ...prev]);
      }

      setShowAddModal(false);
      setNewOrg({
        name: "",
        industry: "Healthcare & Diagnostics",
        plan: "Enterprise 15-Min 24/7 SLA",
        accountManager: "K. Vignesh",
        contractStatus: "Active Retainer",
      });
      setNotification(`✓ Organization "${newOrg.name}" registered successfully.`);
      setTimeout(() => setNotification(""), 5000);
    } catch (err) {
      console.error("Failed to add company:", err);
      setNotification("Failed to register organization.");
      setTimeout(() => setNotification(""), 4000);
    }
  };

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayoutShell
      title="Client Organizations &amp; Companies"
      subtitle="B2B institutional client portfolios, recovery history, and assigned account executives"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs flex items-center gap-1.5"
        >
          <span>+</span> Register Organization
        </button>
      }
    >
      <div className="space-y-6 text-xs">
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg">
            <span>{notification}</span>
            <button
              onClick={() => setNotification("")}
              className="text-emerald-400 hover:text-white ml-4"
            >
              ✕
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search by company name, org code, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-blue-500"
          />
          <span className="text-slate-400">
            Total B2B Organizations: <strong>{companies.length}</strong>
          </span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-3" />
              <p className="text-slate-400 font-mono text-xs">Loading client organizations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-sm font-semibold text-slate-300 mb-1">No organizations found</p>
              <p className="text-xs text-slate-500">
                {search ? "No matches for your search term." : "All organizations have been removed."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Org Code</th>
                    <th className="px-5 py-3.5">Company Name</th>
                    <th className="px-5 py-3.5">Industry Domain</th>
                    <th className="px-5 py-3.5">Contract Agreement</th>
                    <th className="px-5 py-3.5">Total Devices Recovered</th>
                    <th className="px-5 py-3.5">Account Executive</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono font-bold text-blue-400">{c.id}</td>
                      <td className="px-5 py-4 font-bold text-white">{c.name}</td>
                      <td className="px-5 py-4 text-slate-300">{c.industry}</td>
                      <td className="px-5 py-4 text-slate-300 font-semibold">{c.plan}</td>
                      <td className="px-5 py-4 font-bold text-emerald-400">
                        {c.devicesRecovered} Drives
                      </td>
                      <td className="px-5 py-4 text-slate-400">{c.accountManager}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                          {c.contractStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeleteModalTarget(c)}
                          disabled={deletingId === c.id}
                          className="rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold transition flex items-center gap-1 ml-auto disabled:opacity-50 cursor-pointer"
                          title={`Permanently delete organization "${c.name}"`}
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* REGISTER ORGANIZATION MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm text-xs">
            <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-white">Register Client Organization</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddOrg} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Diagnostics & Imaging"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Industry Domain
                  </label>
                  <select
                    value={newOrg.industry}
                    onChange={(e) => setNewOrg({ ...newOrg, industry: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none"
                  >
                    <option>Healthcare &amp; Diagnostics</option>
                    <option>Corporate &amp; Patent Law</option>
                    <option>Supply Chain &amp; Storage</option>
                    <option>Financial Services</option>
                    <option>Enterprise IT Infrastructure</option>
                    <option>Manufacturing &amp; Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contract SLA Agreement
                  </label>
                  <select
                    value={newOrg.plan}
                    onChange={(e) => setNewOrg({ ...newOrg, plan: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none"
                  >
                    <option>Enterprise 15-Min 24/7 SLA</option>
                    <option>Priority 4-Hour Response</option>
                    <option>Standard Business Support</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Assigned Account Executive
                  </label>
                  <select
                    value={newOrg.accountManager}
                    onChange={(e) => setNewOrg({ ...newOrg, accountManager: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none"
                  >
                    <option>K. Vignesh</option>
                    <option>M. Rajesh</option>
                    <option>R. Balaji</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Retainer Status
                  </label>
                  <select
                    value={newOrg.contractStatus}
                    onChange={(e) => setNewOrg({ ...newOrg, contractStatus: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none"
                  >
                    <option>Active Retainer</option>
                    <option>On-Demand SLA</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 transition"
                  >
                    Register Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODERN DELETE MODAL */}
        <ModernDeleteModal
          isOpen={!!deleteModalTarget}
          onClose={() => setDeleteModalTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Client Organization"
          itemType="Organization"
          itemName={deleteModalTarget ? `${deleteModalTarget.name} (${deleteModalTarget.id})` : ""}
          description={
            deleteModalTarget
              ? `Are you sure you want to permanently delete organization "${deleteModalTarget.name}"? This will remove the company portfolio and contract SLA agreements from the Admin Console.`
              : ""
          }
          isDeleting={!!deletingId}
        />
      </div>
    </AdminLayoutShell>
  );
}
