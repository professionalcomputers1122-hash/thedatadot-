"use client";

import { useState, useEffect } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import { registerCustomerAccount, deleteCustomerAccount, getDeletedEmails } from "@/lib/clientAuth";

interface CustomerRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  sla: string;
  slaTier?: string;
  password?: string;
  activeTickets: number;
  status: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Change Password Modal State
  const [passwordModalCustomer, setPasswordModalCustomer] = useState<CustomerRecord | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [newCust, setNewCust] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    sla: "Enterprise 15-Min 24/7 SLA",
    password: "",
  });

  // Fetch customers from backend API on mount
  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      const deletedSet = getDeletedEmails();
      try {
        const res = await fetch("/api/customers");
        const json = await res.json();
        if (json?.success && Array.isArray(json.customers)) {
          const formatted: CustomerRecord[] = json.customers
            .filter((c: any) => c.email && !deletedSet.has(c.email.toLowerCase().trim()))
            .map((c: any) => ({
              id: c.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
              name: c.name || "Client Executive",
              company: c.company || "Enterprise Client",
              email: c.email,
              phone: c.phone || "+91 6380488373",
              sla: c.slaTier || c.sla || "Enterprise 15-Min 24/7 SLA",
              password: c.password,
              activeTickets: c.activeTickets || 0,
              status: c.status || "Active",
            }));
          setCustomers(formatted);
        }
      } catch (err) {
        console.warn("API load error, falling back to local storage:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TDD-${rand}#26`;
  };

  const copyCredentials = (c: CustomerRecord) => {
    const pwText = c.password ? c.password : "[Password configured by Admin]";
    const text = `The Data Dot Client Portal Login\nURL: https://thedatadot.vercel.app/customer/login\nCorporate Email: ${c.email}\nAssigned Password: ${pwText}\nSLA Tier: ${c.sla}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setNotification(`✓ Credentials for ${c.name} (${c.email}) copied to clipboard.`);
    } else {
      setNotification(`Credentials: ${c.email} | PW: ${pwText}`);
    }
    setTimeout(() => setNotification(""), 5000);
  };

  const [deleteModalCustomer, setDeleteModalCustomer] = useState<CustomerRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDeleteCustomer = async () => {
    if (!deleteModalCustomer) return;
    const c = deleteModalCustomer;
    setIsDeleting(true);

    try {
      await fetch(
        `/api/customers?id=${c.id}&email=${encodeURIComponent(c.email)}&company=${encodeURIComponent(c.company)}`,
        {
          method: "DELETE",
        }
      );

      deleteCustomerAccount(c.email);
      setCustomers((prev) => prev.filter((item) => item.email !== c.email && item.id !== c.id));
      setNotification(`✓ Customer "${c.name}" (${c.company}) and all associated tickets permanently deleted.`);
      setDeleteModalCustomer(null);
      setTimeout(() => setNotification(""), 6000);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setNotification("Failed to delete customer. Please try again.");
      setTimeout(() => setNotification(""), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalCustomer || newPasswordValue.trim().length < 4) return;

    setSavingPassword(true);
    const assignedPw = newPasswordValue.trim();

    try {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: passwordModalCustomer.email,
          password: assignedPw,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setNotification(data.error || "Failed to update password");
        setSavingPassword(false);
        return;
      }

      // Update state
      setCustomers((prev) =>
        prev.map((c) =>
          c.email === passwordModalCustomer.email ? { ...c, password: assignedPw } : c
        )
      );

      // Update in clientAuth
      registerCustomerAccount({
        id: passwordModalCustomer.id,
        name: passwordModalCustomer.name,
        email: passwordModalCustomer.email,
        company: passwordModalCustomer.company,
        phone: passwordModalCustomer.phone,
        accountNumber: `TDD-CLI-${passwordModalCustomer.id.substring(0, 4)}`,
        slaTier: passwordModalCustomer.sla,
        password: assignedPw,
        status: "Active",
      });

      setNotification(
        `✓ Password updated for ${passwordModalCustomer.name} (${passwordModalCustomer.company}). New Password: ${assignedPw}`
      );
      setPasswordModalCustomer(null);
      setNewPasswordValue("");
      setTimeout(() => setNotification(""), 7000);
    } catch (err) {
      console.error("Password update error:", err);
      setNotification("Failed to update password.");
      setTimeout(() => setNotification(""), 4000);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.email || !newCust.company || !newCust.name) return;

    setSubmitting(true);
    const assignedPassword = newCust.password.trim() || generateRandomPassword();

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCust.name,
          company: newCust.company,
          email: newCust.email,
          phone: newCust.phone,
          slaTier: newCust.sla,
          password: assignedPassword,
        }),
      });

      const data = await res.json();

      const created: CustomerRecord = {
        id: data?.customer?.id || `CUST-00${customers.length + 1}`,
        name: newCust.name.trim(),
        company: newCust.company.trim(),
        email: newCust.email.trim().toLowerCase(),
        phone: newCust.phone.trim() || "+91 6380488373",
        sla: newCust.sla,
        password: assignedPassword,
        activeTickets: 0,
        status: "Active",
      };

      registerCustomerAccount({
        id: created.id,
        name: created.name,
        email: created.email,
        company: created.company,
        phone: created.phone,
        accountNumber: `TDD-CLI-${Math.floor(1000 + Math.random() * 9000)}`,
        slaTier: created.sla,
        password: assignedPassword,
        status: "Active",
      });

      setCustomers([created, ...customers]);
      setShowAddModal(false);
      setNewCust({
        name: "",
        company: "",
        email: "",
        phone: "",
        sla: "Enterprise 15-Min 24/7 SLA",
        password: "",
      });

      setNotification(
        `✓ Customer ${created.name} (${created.company}) provisioned! Login: ${created.email} | Password: ${assignedPassword}`
      );
      setTimeout(() => setNotification(""), 8000);
    } catch (err) {
      console.error("Failed to add customer:", err);
      setNotification("Failed to save customer account. Please retry.");
      setTimeout(() => setNotification(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayoutShell
      title="Customer Accounts Directory"
      subtitle="Provision verified enterprise client accounts, manage custom individual passwords, and assign SLA tiers"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs flex items-center gap-1.5"
        >
          <span>+</span> Provision New Client
        </button>
      }
    >
      <div className="space-y-6">
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg">
            <span className="leading-relaxed">{notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-400 hover:text-white ml-4">
              ✕
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <input
            type="text"
            placeholder="Search by client name, organization, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-blue-500"
          />
          <div className="flex items-center gap-3 text-slate-400">
            {loading && <span className="text-[11px] text-blue-400 animate-pulse">Syncing with database...</span>}
            <span>Total Accounts: <strong className="text-white">{customers.length}</strong></span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Contact Person</th>
                  <th className="px-5 py-3.5">Organization</th>
                  <th className="px-5 py-3.5">Corporate Email &amp; Phone</th>
                  <th className="px-5 py-3.5">SLA Tier</th>
                  <th className="px-5 py-3.5">Active Cases</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-blue-400">{c.id.length > 8 ? c.id.substring(0, 8) + "..." : c.id}</td>
                    <td className="px-5 py-4 font-bold text-white">{c.name}</td>
                    <td className="px-5 py-4 text-slate-200">{c.company}</td>
                    <td className="px-5 py-4">
                      <p className="text-slate-200 font-mono text-[11px]">{c.email}</p>
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
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyCredentials(c)}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition"
                          title="Copy login details to send to client"
                        >
                          📋 Copy Info
                        </button>
                        <button
                          onClick={() => {
                            setPasswordModalCustomer(c);
                            setNewPasswordValue(c.password || generateRandomPassword());
                          }}
                          className="rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-semibold transition"
                          title="Change password for this person"
                        >
                          🔑 Change PW
                        </button>
                        <button
                          onClick={() => setDeleteModalCustomer(c)}
                          className="rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer"
                          title="Delete customer and revoke portal access"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CHANGE PASSWORD MODAL */}
        {passwordModalCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm text-xs">
            <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Change Password</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Update individual portal password for {passwordModalCustomer.name}
                  </p>
                </div>
                <button
                  onClick={() => setPasswordModalCustomer(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-300 space-y-1">
                  <p><strong>Client:</strong> {passwordModalCustomer.name}</p>
                  <p><strong>Organization:</strong> {passwordModalCustomer.company}</p>
                  <p className="font-mono text-[11px]"><strong>Email:</strong> {passwordModalCustomer.email}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-300">New Password</label>
                    <button
                      type="button"
                      onClick={() => setNewPasswordValue(generateRandomPassword())}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      ⚡ Generate Random
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showChangePassword ? "text" : "password"}
                      required
                      placeholder="Enter new individual password"
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 pr-12 text-white font-mono outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                    >
                      {showChangePassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Only this client will be able to log in with this updated password.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPasswordModalCustomer(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    {savingPassword ? "Updating Password..." : "Save Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PROVISION CUSTOMER MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm text-xs">
            <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Provision Enterprise Client Account</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Create credentials and assign SLA tier for a converted business client
                  </p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company / Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Diagnostics LLP"
                    value={newCust.company}
                    onChange={(e) => setNewCust({ ...newCust, company: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Corporate Client Email (Login ID)</label>
                  <input
                    type="email"
                    required
                    placeholder="client@organization.com"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300">Individual Portal Password</label>
                    <button
                      type="button"
                      onClick={() => setNewCust({ ...newCust, password: generateRandomPassword() })}
                      className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                    >
                      ⚡ Generate Random Key
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter client password (min 4 characters)"
                      value={newCust.password}
                      onChange={(e) => setNewCust({ ...newCust, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 pr-10 text-white font-mono outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    The client will log in at /customer/login using this email and password.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assigned SLA Retainer Tier</label>
                  <select
                    value={newCust.sla}
                    onChange={(e) => setNewCust({ ...newCust, sla: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none"
                  >
                    <option>Enterprise 15-Min 24/7 SLA</option>
                    <option>Priority 4-Hour Response</option>
                    <option>Standard Business Retainer</option>
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
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    {submitting ? "Provisioning Client..." : "Provision & Activate Access"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* MODERN DELETE MODAL */}
        <ModernDeleteModal
          isOpen={!!deleteModalCustomer}
          onClose={() => setDeleteModalCustomer(null)}
          onConfirm={handleConfirmDeleteCustomer}
          title="Delete Customer Account"
          itemType="Customer Account"
          itemName={deleteModalCustomer ? `${deleteModalCustomer.name} (${deleteModalCustomer.company})` : ""}
          description={
            deleteModalCustomer
              ? `Are you sure you want to permanently delete the customer account for "${deleteModalCustomer.name}"? This will immediately revoke their portal login and permanently delete all their recovery tickets.`
              : ""
          }
          isDeleting={isDeleting}
        />
      </div>
    </AdminLayoutShell>
  );
}
