"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import {
  getCustomerSession,
  updateCustomerSession,
  updateCustomerAvatar,
  compressImageToDataUrl,
  CustomerUser,
} from "@/lib/clientAuth";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [notification, setNotification] = useState("");
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

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
    setCustomer(cust);

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

    const handleProfileChange = () => setCustomer(getCustomerSession());

    window.addEventListener("customer-profile-updated", handleProfileChange);
    window.addEventListener("storage", handleProfileChange);

    return () => {
      window.removeEventListener("customer-profile-updated", handleProfileChange);
      window.removeEventListener("storage", handleProfileChange);
    };
  }, [router]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    try {
      const compressed = await compressImageToDataUrl(file, 320, 0.85);
      updateCustomerAvatar(compressed);
      setCustomer((prev) => (prev ? { ...prev, avatarUrl: compressed } : prev));
      setNotification("Photo updated! Click 'Save Profile Settings' to finalize.");
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      console.error("Failed compressing photo:", err);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        updateCustomerAvatar(result);
        setCustomer((prev) => (prev ? { ...prev, avatarUrl: result } : prev));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Remove custom profile photo and revert to company initials?")) {
      updateCustomerAvatar(null);
      setCustomer((prev) => (prev ? { ...prev, avatarUrl: undefined } : prev));
      setNotification("Profile photo removed.");
      setTimeout(() => setNotification(""), 4000);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "CL";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateCustomerSession({
      company: profile.companyName,
      name: profile.contactPerson,
      email: profile.email,
      phone: profile.phone,
      avatarUrl: customer?.avatarUrl || undefined,
    });
    if (customer?.avatarUrl) {
      updateCustomerAvatar(customer.avatarUrl);
    }
    if (updated) {
      setCustomer(updated);
    }
    setNotification("Profile settings and photo saved successfully!");
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
            Manage your company contact information, photo avatar, pickup address, and SMS milestone alerts.
          </p>
        </div>

        {notification && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{notification}</span>
            </span>
            <button onClick={() => setNotification("")} className="text-slate-400 hover:text-slate-800">✕</button>
          </div>
        )}

        {/* UPLOAD YOUR PHOTO CARD */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Upload Your Photo</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-2xl shadow-sm border border-blue-200 bg-blue-50 text-blue-700">
                {customer?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customer.avatarUrl}
                    alt={customer.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(customer?.name || profile.contactPerson)}</span>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-900">
                {profile.contactPerson}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile.companyName} • {profile.email}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  <span>Upload Your Photo</span>
                </button>
                {customer?.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE DETAILS FORM */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                1. Organization Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 bg-white"
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
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 bg-white"
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                2. Contact &amp; Emergency Hardware Pickup Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Dispatch Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 bg-white"
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
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 bg-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
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
                  <span className="text-slate-700">
                    <strong className="text-slate-950">SMS Critical Milestones:</strong> Instant mobile alert when cleanroom donor heads are swapped and imaging commences.
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.emailReports}
                    onChange={(e) => setProfile({ ...profile, emailReports: e.target.checked })}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span className="text-slate-700">
                    <strong className="text-slate-950">Daily Forensic Email Summaries:</strong> Detailed sector error logs and status summaries delivered each evening.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition cursor-pointer"
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
