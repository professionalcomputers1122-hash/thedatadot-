"use client";

import { useState, useEffect } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import { initialTechnicians } from "@/lib/portalData";

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState("");

  const [newTech, setNewTech] = useState({
    name: "",
    email: "",
    role: "Forensic Cleanroom Technician",
    station: "PC-3000 Bench 02",
  });

  // Load persisted technicians from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("tdd_laboratory_technicians");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(
            (t: any) =>
              !t.name?.toLowerCase().includes("murugan") &&
              !t.email?.toLowerCase().includes("murugan")
          );
          setTechnicians(filtered);
          localStorage.setItem("tdd_laboratory_technicians", JSON.stringify(filtered));
        }
      }
    } catch (e) {
      console.warn("Failed loading technicians from storage:", e);
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `TECH-0${technicians.length + 50}`,
      name: newTech.name.trim(),
      email: newTech.email.trim(),
      role: newTech.role,
      station: newTech.station,
      activeCases: 0,
      status: "Available",
    };

    const updated = [...technicians, created];
    setTechnicians(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("tdd_laboratory_technicians", JSON.stringify(updated));
    }

    setShowAddModal(false);
    setNewTech({ name: "", email: "", role: "Forensic Cleanroom Technician", station: "PC-3000 Bench 02" });
    setNotification(`✓ Technician ${created.name} registered and bench credentials generated.`);
    setTimeout(() => setNotification(""), 4000);
  };

  const handleDeleteTechnician = (t: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove technician "${t.name}" (${t.role}) from the laboratory roster?\n\nTheir assigned hardware bench (${t.station}) will be unallocated.`
    );
    if (!confirmed) return;

    const updated = technicians.filter((tech) => tech.id !== t.id && tech.email !== t.email);
    setTechnicians(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("tdd_laboratory_technicians", JSON.stringify(updated));
    }

    setNotification(`✓ Technician "${t.name}" removed from laboratory roster.`);
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <AdminLayoutShell
      title="Laboratory Technicians &amp; Workbenches"
      subtitle="Cleanroom forensic staff roster, ISO Class-5 laminar station allocations, and active workload"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs flex items-center gap-1.5"
        >
          <span>+</span> Add Laboratory Technician
        </button>
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

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Staff ID</th>
                  <th className="px-5 py-3.5">Technician Name</th>
                  <th className="px-5 py-3.5">Engineering Specialization</th>
                  <th className="px-5 py-3.5">Assigned Hardware Workbench</th>
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
                      <span className="text-[11px] text-slate-500">{t.email}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">{t.role}</td>
                    <td className="px-5 py-4 text-indigo-300 font-semibold">{t.station}</td>
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
                            setNotification(`Temporary PIN re-issued for ${t.name}`);
                            setTimeout(() => setNotification(""), 4000);
                          }}
                          className="text-[11px] font-bold text-blue-400 hover:underline px-1.5"
                        >
                          Reset PIN
                        </button>
                        <button
                          onClick={() => handleDeleteTechnician(t)}
                          className="rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold transition"
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

        {/* ADD MODAL */}
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
      </div>
    </AdminLayoutShell>
  );
}
