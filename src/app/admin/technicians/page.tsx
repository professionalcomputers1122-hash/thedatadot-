"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import {
  initialTechnicians,
  TechnicianRecord,
  getStoredTechnicians,
  saveStoredTechnicians,
  markTechnicianAsDeleted,
} from "@/lib/portalData";

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState<TechnicianRecord[]>(initialTechnicians);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState("");

  // Password / PIN Reset Modal State
  const [passwordModalTech, setPasswordModalTech] = useState<TechnicianRecord | null>(null);
  const [newPinValue, setNewPinValue] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // New Technician Form State
  const [newTech, setNewTech] = useState({
    name: "",
    email: "",
    role: "Forensic Cleanroom Technician",
    station: "PC-3000 Bench 02",
    pin: "8942",
    password: "Tech@DataDot2026!",
  });

  // Random generators
  const generateRandomPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Tech@${randomPart}!`;
  };

  // Load technicians from localStorage on mount and sync with events
  useEffect(() => {
    const loadData = () => {
      const stored = getStoredTechnicians();
      if (stored && stored.length > 0) {
        // Sanitize: ensure no legacy dummy names
        const filtered = stored.filter(
          (t: TechnicianRecord) =>
            !t.name?.toLowerCase().includes("murugan") &&
            !t.email?.toLowerCase().includes("murugan")
        );
        // Ensure every tech has at least a default PIN
        const normalized = filtered.map((t, index) => ({
          ...t,
          pin: t.pin || ["8942", "7103", "5519"][index % 3] || "8942",
          password: t.password || `Tech@DataDot${index + 1}!`,
        }));
        setTechnicians(normalized);
      }
    };

    loadData();
    window.addEventListener("technicians-updated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("technicians-updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Copy technician login credentials to clipboard
  const copyCredentials = (t: TechnicianRecord) => {
    const pin = t.pin || "8942";
    const pw = t.password || "Tech@DataDot2026!";
    const text = `The Data Dot Laboratory Technician Access\nWorkbench URL: https://thedatadot.vercel.app/technician/login\nStaff Corporate Email: ${t.email}\nWorkbench Access PIN: ${pin}\nPortal Password: ${pw}\nAssigned Hardware Bench: ${t.station}\nEngineering Specialization: ${t.role}`;
    navigator.clipboard.writeText(text);
    setNotification(`✓ Login credentials for "${t.name}" copied to clipboard.`);
    setTimeout(() => setNotification(""), 5000);
  };

  // Open password reset modal
  const openPasswordModal = (t: TechnicianRecord) => {
    setPasswordModalTech(t);
    setNewPinValue(t.pin || generateRandomPin());
    setNewPasswordValue(t.password || generateRandomPassword());
  };

  // Save technician password / PIN reset
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalTech) return;

    const assignedPin = newPinValue.trim();
    const assignedPassword = newPasswordValue.trim();

    if (!assignedPin && !assignedPassword) {
      setNotification("Please specify a new PIN or Password.");
      return;
    }

    setSavingPassword(true);

    try {
      // Call backend API for audit logging & server persistence
      await fetch("/api/technicians", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: passwordModalTech.email,
          pin: assignedPin,
          password: assignedPassword,
        }),
      });

      // Update local state and localStorage
      const updated = technicians.map((tech) => {
        if (tech.id === passwordModalTech.id || tech.email.toLowerCase() === passwordModalTech.email.toLowerCase()) {
          return {
            ...tech,
            pin: assignedPin || tech.pin,
            password: assignedPassword || tech.password,
          };
        }
        return tech;
      });

      setTechnicians(updated);
      saveStoredTechnicians(updated);

      setNotification(
        `✓ Password & PIN updated for ${passwordModalTech.name}. New PIN: ${assignedPin} | Password: ${assignedPassword}`
      );
      setPasswordModalTech(null);
      setTimeout(() => setNotification(""), 6000);
    } catch (err) {
      console.error("Failed to reset technician password/PIN:", err);
      setNotification("Failed to update credentials. Please try again.");
      setTimeout(() => setNotification(""), 4000);
    } finally {
      setSavingPassword(false);
    }
  };

  // Add new technician
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newTech.email.trim().toLowerCase();
    const assignedPin = newTech.pin.trim() || generateRandomPin();
    const assignedPw = newTech.password.trim() || generateRandomPassword();

    const created: TechnicianRecord = {
      id: `TECH-0${technicians.length + 50}`,
      name: newTech.name.trim(),
      email: cleanEmail,
      role: newTech.role,
      station: newTech.station,
      activeCases: 0,
      status: "Available",
      pin: assignedPin,
      password: assignedPw,
    };

    try {
      await fetch("/api/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(created),
      });
    } catch (e) {
      console.warn("Server technician register warning:", e);
    }

    const updated = [...technicians, created];
    setTechnicians(updated);
    saveStoredTechnicians(updated);

    setShowAddModal(false);
    setNewTech({
      name: "",
      email: "",
      role: "Forensic Cleanroom Technician",
      station: "PC-3000 Bench 02",
      pin: generateRandomPin(),
      password: generateRandomPassword(),
    });
    setNotification(`✓ Technician ${created.name} registered. Access PIN: ${created.pin}`);
    setTimeout(() => setNotification(""), 5000);
  };

  const [deleteModalTech, setDeleteModalTech] = useState<TechnicianRecord | null>(null);
  const [isDeletingTech, setIsDeletingTech] = useState(false);

  // Confirm delete technician
  const handleConfirmDeleteTech = async () => {
    if (!deleteModalTech) return;
    const t = deleteModalTech;
    setIsDeletingTech(true);

    try {
      await fetch(`/api/technicians?email=${encodeURIComponent(t.email)}&id=${encodeURIComponent(t.id)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Server technician deletion warning:", e);
    }

    markTechnicianAsDeleted(t.email);
    if (t.id) markTechnicianAsDeleted(t.id);

    const updated = technicians.filter(
      (tech) => tech.id !== t.id && tech.email.toLowerCase() !== t.email.toLowerCase()
    );
    setTechnicians(updated);
    saveStoredTechnicians(updated);

    setNotification(`✓ Technician "${t.name}" removed from laboratory roster.`);
    setDeleteModalTech(null);
    setIsDeletingTech(false);
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <AdminLayoutShell
      title="Laboratory Technicians & Workbenches"
      subtitle="Cleanroom forensic staff roster, ISO Class-5 laminar station allocations, and secure workbench access PIN management"
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href="/technician/dashboard"
            onClick={() => {
              if (typeof window !== "undefined") {
                const current = localStorage.getItem("tdd_tech_user");
                if (!current) {
                  const techSession = {
                    id: "admin-tech-direct",
                    name: "Super Admin (Ebinezer)",
                    email: "ebinezer@thedatadot.com",
                    role: "Lead Forensic Cleanroom Engineer",
                    station: "PC-3000 Flash & Portable III (Bench 01)",
                    department: "Cleanroom Laboratory",
                  };
                  localStorage.setItem("tdd_tech_user", JSON.stringify(techSession));
                }
              }
            }}
            className="rounded-xl border border-blue-500/40 bg-blue-600/15 text-blue-400 hover:bg-blue-600 hover:text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <span>⚡ Open Technician Bench (No Login)</span>
            <span>↗</span>
          </Link>
          <button
            onClick={() => {
              setNewTech((prev) => ({
                ...prev,
                pin: generateRandomPin(),
                password: generateRandomPassword(),
              }));
              setShowAddModal(true);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs flex items-center gap-1.5"
          >
            <span>+</span> Add Laboratory Technician
          </button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg">
            <span>{notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-400 hover:text-white ml-4">
              ✕
            </button>
          </div>
        )}

        {/* DIRECT WORKBENCH ACCESS / INSTANT LOGIN ROSTER */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>⚡ Instant Technician Workbench Login (No PIN Required)</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono">
                  Direct Access Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select any technician below to instantly log into their dedicated hardware workbench without typing a PIN or password.
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {technicians.length} Dedicated Benches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {technicians.map((tech) => (
              <div
                key={tech.id + tech.email}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 hover:border-blue-500/50 hover:bg-slate-950 transition flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-indigo-400">
                      {tech.id}
                    </span>
                    <span className="rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold">
                      {tech.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm mt-1.5 group-hover:text-blue-400 transition">
                    {tech.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {tech.role}
                  </p>
                  <p className="text-[10px] text-indigo-300 font-mono mt-1">
                    📍 {tech.station}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("tdd_tech_user", JSON.stringify(tech));
                        window.location.href = "/technician/dashboard";
                      }
                    }}
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Login as {tech.name.split(" ")[0]}</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("tdd_tech_user", JSON.stringify(tech));
                        window.open("/technician/dashboard", "_blank");
                      }
                    }}
                    className="rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-800 text-slate-300 p-2 text-xs transition cursor-pointer"
                    title="Open in new tab"
                  >
                    <span>↗</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Staff ID</th>
                  <th className="px-5 py-3.5">Technician Name</th>
                  <th className="px-5 py-3.5">Engineering Specialization</th>
                  <th className="px-5 py-3.5">Assigned Hardware Workbench</th>
                  <th className="px-5 py-3.5">Workbench Credentials</th>
                  <th className="px-5 py-3.5">Active Cases</th>
                  <th className="px-5 py-3.5">Bench Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {technicians.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-400">{t.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{t.name}</p>
                      <span className="text-[11px] text-slate-400 font-mono">{t.email}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">{t.role}</td>
                    <td className="px-5 py-4 text-indigo-300 font-semibold">{t.station}</td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-mono">
                        <span className="text-slate-400 font-sans text-[10px]">PIN:</span>
                        <span className="font-bold text-emerald-400">{t.pin || "8942"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {t.activeCases} Devices
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          t.status === "On Bench"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              localStorage.setItem("tdd_tech_user", JSON.stringify(t));
                              window.open("/technician/dashboard", "_blank");
                            }
                          }}
                          className="rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2.5 py-1 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                          title={`Open ${t.name}'s hardware bench directly without login`}
                        >
                          <span>⚡</span> Open Bench
                        </button>
                        <button
                          onClick={() => copyCredentials(t)}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition"
                          title="Copy technician login credentials"
                        >
                          📋 Copy Info
                        </button>
                        <button
                          onClick={() => openPasswordModal(t)}
                          className="rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-semibold transition flex items-center gap-1"
                          title="Reset PIN / Password for this technician"
                        >
                          <span>🔑</span> Reset PIN / PW
                        </button>
                        <button
                          onClick={() => setDeleteModalTech(t)}
                          className="rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer"
                          title="Remove technician from roster"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESET PASSWORD / PIN MODAL */}
        {passwordModalTech && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm text-xs">
            <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🔑</span> Reset Technician Credentials
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Update workbench access PIN and portal password for {passwordModalTech.name}
                  </p>
                </div>
                <button
                  onClick={() => setPasswordModalTech(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-300 space-y-1">
                  <p><strong>Staff Member:</strong> {passwordModalTech.name} ({passwordModalTech.id})</p>
                  <p><strong>Workbench Station:</strong> {passwordModalTech.station}</p>
                  <p className="font-mono text-[11px]"><strong>Corporate Email:</strong> {passwordModalTech.email}</p>
                </div>

                {/* PIN FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-300">
                      Workbench Access PIN (4-Digit)
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewPinValue(generateRandomPin())}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      ⚡ Generate Random PIN
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="e.g. 8942"
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white font-mono text-sm tracking-widest outline-none focus:border-blue-500"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">
                    Used by the technician to unlock their cleanroom PC-3000 bench on login.
                  </p>
                </div>

                {/* PASSWORD FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-300">
                      Portal Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewPasswordValue(generateRandomPassword())}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      ⚡ Generate Secure PW
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter new technician password"
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 pr-12 text-white font-mono outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPasswordModalTech(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    {savingPassword ? "Updating Credentials..." : "Save & Update Credentials"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD TECHNICIAN MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm text-xs">
            <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-white">Add Laboratory Technician</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Technician Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Karthikeyan"
                    value={newTech.name}
                    onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Internal Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="karthik.tech@thedatadot.com"
                    value={newTech.email}
                    onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Engineering Specialization</label>
                  <select
                    value={newTech.role}
                    onChange={(e) => setNewTech({ ...newTech, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none"
                  >
                    <option>Forensic Cleanroom Technician</option>
                    <option>Solid State Forensic Analyst</option>
                    <option>Enterprise RAID Recovery Specialist</option>
                    <option>Lead Cleanroom Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hardware Workstation / Bench</label>
                  <select
                    value={newTech.station}
                    onChange={(e) => setNewTech({ ...newTech, station: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none"
                  >
                    <option>PC-3000 Bench 01 (Class-5 Hood)</option>
                    <option>PC-3000 Bench 02</option>
                    <option>Flash / Monolith Extraction Bay</option>
                    <option>High-Throughput SAS Imaging Rack</option>
                  </select>
                </div>

                {/* INITIAL PIN FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-300">Workbench Access PIN</label>
                    <button
                      type="button"
                      onClick={() => setNewTech({ ...newTech, pin: generateRandomPin() })}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      ⚡ Generate PIN
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8942"
                    value={newTech.pin}
                    onChange={(e) => setNewTech({ ...newTech, pin: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white font-mono outline-none focus:border-blue-500"
                  />
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
                    Register Technician
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* MODERN DELETE MODAL */}
        <ModernDeleteModal
          isOpen={!!deleteModalTech}
          onClose={() => setDeleteModalTech(null)}
          onConfirm={handleConfirmDeleteTech}
          title="Remove Laboratory Technician"
          itemType="Technician"
          itemName={deleteModalTech ? `${deleteModalTech.name} (${deleteModalTech.id})` : ""}
          description={
            deleteModalTech
              ? `Are you sure you want to remove technician "${deleteModalTech.name}" (${deleteModalTech.role}) from the laboratory roster? Their assigned hardware workbench (${deleteModalTech.station}) will be unallocated.`
              : ""
          }
          confirmButtonText="Remove Technician"
          isDeleting={isDeletingTech}
        />
      </div>
    </AdminLayoutShell>
  );
}
