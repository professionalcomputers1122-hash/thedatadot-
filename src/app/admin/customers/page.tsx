"use client";

import { useState } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import { initialCustomers } from "@/lib/portalData";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState("");

  const [newCust, setNewCust] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    sla: "Enterprise 15-Min",
  });

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `CUST-00${customers.length + 1}`,
      name: newCust.name,
      company: newCust.company,
      email: newCust.email,
      phone: newCust.phone,
      sla: newCust.sla,
      activeTickets: 0,
      status: "Active",
    };
    setCustomers([...customers, created]);
    setShowAddModal(false);
    setNewCust({ name: "", company: "", email: "", phone: "", sla: "Enterprise 15-Min" });
    setNotification(`Customer ${created.name} (${created.company}) registered successfully.`);
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <AdminLayoutShell
      title="Customer Accounts Directory"
      subtitle="Manage registered enterprise clients, assigned SLA tiers, and contact profiles"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs"
        >
          + Add Customer Account
        </button>
      }
    >
      <div className="space-y-6">
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")}>✕</button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <input
            type="text"
            placeholder="Search by customer name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-blue-500"
          />
          <span className="text-slate-400">Total Accounts: <strong>{customers.length}</strong></span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Contact Name</th>
                  <th className="px-5 py-3.5">Organization</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">SLA Tier</th>
                  <th className="px-5 py-3.5">Active Cases</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-blue-400">{c.id}</td>
                    <td className="px-5 py-4 font-bold text-white">{c.name}</td>
                    <td className="px-5 py-4 text-slate-200">{c.company}</td>
                    <td className="px-5 py-4">
                      <p className="text-slate-300">{c.email}</p>
                      <span className="text-[11px] text-slate-500">{c.phone}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold">
                        {c.sla}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {c.activeTickets} Active
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setNotification(`Password reset token emailed to ${c.email}`);
                          setTimeout(() => setNotification(""), 4000);
                        }}
                        className="text-[11px] font-bold text-blue-400 hover:underline"
                      >
                        Reset PW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD CUSTOMER MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm text-xs">
            <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-white">Create New Customer Account</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Diagnostics"
                    value={newCust.company}
                    onChange={(e) => setNewCust({ ...newCust, company: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aravind S."
                    value={newCust.name}
                    onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="aravind@scandiagnostics.com"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Direct Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98402 11928"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">SLA Tier</label>
                  <select
                    value={newCust.sla}
                    onChange={(e) => setNewCust({ ...newCust, sla: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none"
                  >
                    <option>Enterprise 15-Min</option>
                    <option>Priority 4-Hour</option>
                    <option>Standard Next-Day</option>
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
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500"
                  >
                    Create Customer
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
