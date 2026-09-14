"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    slaTier: "Enterprise 15-Min Response",
    password: "",
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/customer/dashboard");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25">
              •
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">The Data Dot</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Register Organization Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Setup your portal access for emergency hardware intake and cloud support
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Company / Hospital / Firm Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Healthcare Diagnostic Center"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Aravind S."
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Direct Phone / Mobile
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98402 11928"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Corporate Email
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Preferred SLA Tier
              </label>
              <select
                value={formData.slaTier}
                onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 text-sm bg-white"
              >
                <option>Enterprise 15-Min Response (24/7/365)</option>
                <option>Priority 4-Hour Response</option>
                <option>Standard Business Support (Next-Day)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Create Account Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Organization Account →"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link href="/customer/login" className="font-bold text-blue-600 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
