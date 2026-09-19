"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginCustomer } from "@/lib/clientAuth";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid corporate email address.");
      return;
    }

    if (!password) {
      setError("Please enter your account password.");
      return;
    }

    setLoading(true);
    const res = await loginCustomer(email, password);
    if (!res.success) {
      setError(res.error || "Authentication failed.");
      setLoading(false);
      return;
    }

    router.push("/customer/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased">
      {/* Background radial gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

      <div className="w-full max-w-md relative z-10">
        {/* BRAND HEADER */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-3"
          >
            <span>← Back to Website</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-sm shadow-md shadow-blue-600/20">
              •
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">The Data Dot</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Client Portal Sign In</h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time forensic hardware tracking, SLA compliance, and cloud ticketing
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-[11px] text-blue-900 flex items-start gap-2">
            <span className="text-blue-600 font-bold">ℹ️</span>
            <span>
              <strong>Authorized Access Only:</strong> Accounts are provisioned exclusively by The Data Dot Administration upon service onboarding.
            </span>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <div className="flex-1">
                <p className="font-bold">Authentication Failed</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Corporate Email ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@organization.com"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">Password / Access Key</label>
                <Link
                  href="/contact"
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  Need password reset?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 pr-10 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-blue-600" />
                <span>Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Authenticating Credentials..." : "Sign In to Client Portal →"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600">
            New client organization?{" "}
            <Link href="/onboarding" className="font-bold text-blue-600 hover:underline">
              Request Client Onboarding →
            </Link>
          </div>
        </div>

        {/* SECURITY FOOTNOTE */}
        <p className="mt-6 text-center text-[11px] text-slate-400">
          256-Bit TLS Encrypted • Protected by The Data Dot 99.98% Data Recovery SLA
        </p>
      </div>
    </main>
  );
}
