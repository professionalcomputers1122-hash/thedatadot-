"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import { getCustomerSession, updateCustomerSession } from "@/lib/clientAuth";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [notification, setNotification] = useState("");
  const [profile, setProfile] = useState({
    companyName: "Enterprise Client",
    accountNumber: "TDD-CLI-8492",
    contactPerson: "Client User",
    email: "client@example.com",
    phone: "+91 6380488373",
    address: "Chennai, Tamil Nadu, India",
    slaTier: "Enterprise 15-Min Emergency SLA",
    smsAlerts: true,
    emailReports: true,
  });

  useEffect(() => {
    const cust = getCustomerSession();
    if (!cust) {
      router.push("/customer/login");
      return;
    }
    setProfile({
      companyName: cust.company,
      accountNumber: cust.accountNumber,
      contactPerson: cust.name,
      email: cust.email,
      phone: cust.phone || "+91 6380488373",
      address: "Chennai, Tamil Nadu, India",
      slaTier: cust.slaTier || "Enterprise 15-Min Emergency SLA",
      smsAlerts: true,
      emailReports: true,
    });
  }, [router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerSession({
      company: profile.companyName,
      name: profile.contactPerson,
      email: profile.email,
      phone: profile.phone,
    });
    setNotification("Profile details updated successfully!");
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* AMBIENT GLOW MESH */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] bg-indigo-600/8 rounded-full blur-[140px]" />
      </div>

      <CustomerNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Account #{profile.accountNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Organization Profile &amp; Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your company contact information, pickup address, and SMS milestone alerts.
          </p>
        </div>

        {notification && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                1. Organization Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Account Number</label>
                  <input
                    type="text"
                    disabled
                    value={profile.accountNumber}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 text-slate-400 font-mono text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Lead Contact Person</label>
                  <input
                    type="text"
                    value={profile.contactPerson}
                    onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">SLA Tier</label>
                  <input
                    type="text"
                    disabled
                    value={profile.slaTier}
                    className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5 text-blue-300 font-mono font-bold text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                2. Contact &amp; Emergency Hardware Pickup Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Corporate Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Emergency Dispatch Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Courier Pickup Address for Failed Media (HDDs, Servers)
                </label>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-xs"
                />
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                3. Notification Preferences
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={profile.smsAlerts}
                    onChange={(e) => setProfile({ ...profile, smsAlerts: e.target.checked })}
                    className="accent-blue-500 h-4 w-4"
                  />
                  <span>
                    <strong className="text-white">SMS Critical Milestones:</strong> Instant mobile alert when cleanroom donor heads are swapped and cloning passes 50% and 99%.
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={profile.emailReports}
                    onChange={(e) => setProfile({ ...profile, emailReports: e.target.checked })}
                    className="accent-blue-500 h-4 w-4"
                  />
                  <span>
                    <strong className="text-white">Daily Forensic Email Summaries:</strong> Detailed sector error logs and status briefs delivered each evening.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition"
              >
                Save Profile Settings
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
