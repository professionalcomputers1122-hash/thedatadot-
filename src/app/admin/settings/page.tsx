"use client";

import { useState } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";

export default function AdminSettingsPage() {
  const [notification, setNotification] = useState("");
  const [settings, setSettings] = useState({
    companyName: "The Data Dot",
    supportEmail: "support@thedatadot.com",
    hotline: "+91 6380488373",
    cleanroomAddress: "Forensic Cleanroom Facility, Mount Road, Chennai, Tamil Nadu 600002",
    recoveryGuarantee: "No Data, No Recovery Fee Guarantee (100% Zero-Risk)",
    slaThreshold: 15,
    autoAssignBenches: true,
    smsAlertsEnabled: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Global system & contact settings saved successfully!");
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <AdminLayoutShell
      title="Global Settings &amp; Configuration"
      subtitle="Corporate contact details, SLA thresholds, cleanroom rules, and notification webhooks"
    >
      <div className="space-y-6 text-xs max-w-4xl">
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 font-bold text-emerald-300 flex items-center justify-between">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")}>✕</button>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                1. Official Corporate Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Primary Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">24/7 Lab Dispatch Hotline</label>
                  <input
                    type="tel"
                    value={settings.hotline}
                    onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500 font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guaranteed Policy</label>
                  <input
                    type="text"
                    value={settings.recoveryGuarantee}
                    onChange={(e) => setSettings({ ...settings, recoveryGuarantee: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block font-semibold text-slate-300 mb-1">
                  Cleanroom Media Receiving &amp; Courier Facility
                </label>
                <textarea
                  rows={2}
                  value={settings.cleanroomAddress}
                  onChange={(e) => setSettings({ ...settings, cleanroomAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                2. SLA &amp; Automated Allocation
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoAssignBenches}
                    onChange={(e) => setSettings({ ...settings, autoAssignBenches: e.target.checked })}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span>
                    <strong>Smart Bench Routing:</strong> Automatically route incoming mechanical drives to PC-3000 Bench 01 and SSDs to Flash Station.
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsAlertsEnabled}
                    onChange={(e) => setSettings({ ...settings, smsAlertsEnabled: e.target.checked })}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span>
                    <strong>Automated SMS Webhooks:</strong> Dispatch SMS alerts via Twilio/Gupshup when drive cloning exceeds 99%.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-500 shadow-md transition"
              >
                Save Global Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
