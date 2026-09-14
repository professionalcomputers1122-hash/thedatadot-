"use client";

import { useState, useEffect } from "react";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import { getCustomerSession, updateCustomerSession } from "@/lib/clientAuth";

export default function CustomerProfilePage() {
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
  }, []);

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
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Organization Profile &amp; Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your company contact information, pickup address, and SMS milestone alerts.
          </p>
        </div>

        {notification && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")}>✕</button>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                1. Organization Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    disabled
                    value={profile.accountNumber}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Contact Person</label>
                  <input
                    type="text"
                    value={profile.contactPerson}
                    onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SLA Tier</label>
                  <input
                    type="text"
                    disabled
                    value={profile.slaTier}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-blue-700 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                2. Contact &amp; Emergency Hardware Pickup Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Dispatch Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Courier Pickup Address for Failed Media (HDDs, Servers)
                </label>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                3. Notification Preferences
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.smsAlerts}
                    onChange={(e) => setProfile({ ...profile, smsAlerts: e.target.checked })}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span>
                    <strong>SMS Critical Milestones:</strong> Instant mobile alert when cleanroom donor heads are swapped and cloning passes 50% and 99%.
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.emailReports}
                    onChange={(e) => setProfile({ ...profile, emailReports: e.target.checked })}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span>
                    <strong>Daily Forensic Email Summaries:</strong> Detailed sector error logs delivered each evening.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
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
