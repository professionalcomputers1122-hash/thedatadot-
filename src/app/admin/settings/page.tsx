"use client";

import { useState, useEffect } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/adminAuth";

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
    // Section 3: Website Appearance & Public Live Banner
    showAnnouncementBanner: true,
    announcementText: "🔴 24/7 Forensic On-Call & Incident Response Active • ISO Class-5 Lab Operational • Hotline: +91 6380488373",
    announcementLink: "/contact",
    cleanroomStatusText: "100% Operational • ISO Class-5 Cleanroom Certified",
    avgDispatchMinutes: 11,
    enableLiveTelemetryTicker: true,
    publicHeaderTheme: "light",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tdd_site_settings");
        if (saved) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {
        console.warn("Failed loading saved admin settings:", e);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tdd_site_settings", JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent("tdd_site_settings_updated", { detail: settings }));
      } catch (e) {
        console.warn("Failed saving site settings to localStorage:", e);
      }
    }
    setNotification("Global website appearance, public live updates & contact settings saved successfully!");
    setTimeout(() => setNotification(""), 4000);
  };

  // Section 4: Security & Master Key state
  const [adminEmail, setAdminEmail] = useState("ebinezer@thedatadot.com");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [secNotice, setSecNotice] = useState("");
  const [secError, setSecError] = useState("");

  useEffect(() => {
    const creds = getAdminCredentials();
    setAdminEmail(creds.email);
  }, []);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecNotice("");
    setSecError("");

    const creds = getAdminCredentials();

    if (currentPw !== creds.password) {
      setSecError("Current Master Security Key is incorrect.");
      return;
    }

    if (newPw.length < 8) {
      setSecError("New password must be at least 8 characters long.");
      return;
    }

    if (newPw !== confirmPw) {
      setSecError("New password and confirm password do not match.");
      return;
    }

    saveAdminCredentials({ password: newPw });
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setSecNotice("✓ Executive Admin Master Key updated successfully.");
    setTimeout(() => setSecNotice(""), 5000);
  };

  return (
    <AdminLayoutShell
      title="Global Settings &amp; Configuration"
      subtitle="Corporate contact details, SLA thresholds, cleanroom rules, and website live appearance"
    >
      <div className="space-y-6 text-xs max-w-4xl animate-in fade-in">
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>✓ {notification}</span>
            </span>
            <button onClick={() => setNotification("")} className="text-emerald-600 hover:text-emerald-900">✕</button>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs text-slate-900">
          <form onSubmit={handleSave} className="space-y-8">
            {/* SECTION 1: CONTACT DETAILS */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
                <span>1. Official Corporate Contact Details</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">24/7 Lab Dispatch Hotline</label>
                  <input
                    type="tel"
                    value={settings.hotline}
                    onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white focus:border-blue-500 font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guaranteed Policy</label>
                  <input
                    type="text"
                    value={settings.recoveryGuarantee}
                    onChange={(e) => setSettings({ ...settings, recoveryGuarantee: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block font-semibold text-slate-700 mb-1">
                  Cleanroom Media Receiving &amp; Courier Facility
                </label>
                <textarea
                  rows={2}
                  value={settings.cleanroomAddress}
                  onChange={(e) => setSettings({ ...settings, cleanroomAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            {/* SECTION 2: SLA & ALLOCATION */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4">
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
                  <span className="text-slate-600">
                    <strong className="text-slate-900">Smart Bench Routing:</strong> Automatically route incoming mechanical drives to PC-3000 Bench 01 and SSDs to Flash Station.
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsAlertsEnabled}
                    onChange={(e) => setSettings({ ...settings, smsAlertsEnabled: e.target.checked })}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span className="text-slate-600">
                    <strong className="text-slate-900">Automated SMS Webhooks:</strong> Dispatch SMS alerts via Twilio/Gupshup when drive cloning exceeds 99%.
                  </span>
                </label>
              </div>
            </div>

            {/* SECTION 3: WEBSITE APPEARANCE & PUBLIC LIVE BANNER */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  3. Website Appearance &amp; Home Page Live Updates
                </h2>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  Live Sync
                </span>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                  <input
                    type="checkbox"
                    checked={settings.showAnnouncementBanner}
                    onChange={(e) => setSettings({ ...settings, showAnnouncementBanner: e.target.checked })}
                    className="accent-blue-600 h-4 w-4 cursor-pointer"
                  />
                  <div>
                    <strong className="text-slate-900 block">Enable Public Emergency / Announcement Top Bar</strong>
                    <span className="text-[11px] text-slate-500">Shows a live dismissible alert banner at the top of the homepage</span>
                  </div>
                </label>

                {settings.showAnnouncementBanner && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-4 border-l-2 border-blue-600">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Announcement Banner Text</label>
                      <input
                        type="text"
                        value={settings.announcementText}
                        onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                        placeholder="e.g. 24/7 Lab Operational • Emergency hotline active"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Call-To-Action Link</label>
                      <input
                        type="text"
                        value={settings.announcementLink}
                        onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 font-mono text-[11px]"
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cleanroom Lab Live Status Message</label>
                    <input
                      type="text"
                      value={settings.cleanroomStatusText}
                      onChange={(e) => setSettings({ ...settings, cleanroomStatusText: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Average Response SLA (Minutes)</label>
                    <input
                      type="number"
                      value={settings.avgDispatchMinutes}
                      onChange={(e) => setSettings({ ...settings, avgDispatchMinutes: Number(e.target.value) || 11 })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableLiveTelemetryTicker}
                    onChange={(e) => setSettings({ ...settings, enableLiveTelemetryTicker: e.target.checked })}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span className="text-slate-600">
                    <strong className="text-slate-900">Live Telemetry Ticker on Home Page:</strong> Display active real-time operational status (cleanroom status, response speed, SOC 2 compliance) with live pulsing heartbeat indicator.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Save All Settings &amp; Update Live Website</span>
                <span>✓</span>
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 4: EXECUTIVE SECURITY & MASTER ADMIN PASSWORD */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2">
                <span>🔐</span>
                <span>Executive Administrator Security &amp; Access Keys</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage master credentials for the Super Admin Command Console.
              </p>
            </div>
            <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-mono font-bold text-rose-700">
              Tier-1 Security
            </span>
          </div>

          {secNotice && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
              {secNotice}
            </div>
          )}

          {secError && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
              {secError}
            </div>
          )}

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Executive Administrator
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{adminEmail}</p>
              </div>
              <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-700 self-start sm:self-auto shadow-2xs">
                Super Admin Role
              </span>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Update Master Security Key
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-6 py-2.5 font-bold text-white hover:bg-rose-500 shadow-md shadow-rose-600/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Update Master Security Key</span>
                  <span>🔐</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
