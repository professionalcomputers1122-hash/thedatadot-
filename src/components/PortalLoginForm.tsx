"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginCustomer } from "@/lib/clientAuth";

export default function PortalLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid corporate email address.");
      return;
    }

    if (!password) {
      setError("Please enter your account password or access key.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginCustomer(email, password);
      if (!res.success) {
        setError(res.error || "Access Denied: Invalid credentials or unprovisioned account.");
        setLoading(false);
        return;
      }
      router.push("/customer/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected error occurred during authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-[#0b1626]/95 p-8 shadow-2xl shadow-blue-950/40 backdrop-blur-xl sm:p-10">
      
      {/* Top subtle glow bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600" />

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-[26px]">
          Client Portal Sign In
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
          Access your organization&apos;s support desk, active SLAs, and live forensic recovery tracker.
        </p>
      </div>

      {/* Enterprise Authorized Access Badge */}
      <div className="mt-5 mb-2 rounded-xl border border-blue-500/20 bg-blue-950/40 p-3 text-[11px] text-blue-200 flex items-start gap-2">
        <span className="text-blue-400 font-bold">🛡️</span>
        <span className="leading-tight">
          <strong>Authorized Access Only:</strong> Client portal accounts are provisioned exclusively by The Data Dot Administration upon service onboarding.
        </span>
      </div>

      {error && (
        <div className="mt-4 mb-2 rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs text-red-300">
          <p className="font-bold text-[11px]">Authentication Notice</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-red-200">{error}</p>
        </div>
      )}

      {/* STANDARD LOGIN FORM */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">
            Corporate Email
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@organization.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-300">Password / Access Key</label>
            <Link
              href="/contact"
              className="text-[11px] font-medium text-blue-400 transition hover:text-blue-300 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-10 pr-10 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-[11px] text-slate-400">Remember this workstation</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Authenticating Credentials...
            </span>
          ) : (
            "Sign In to Client Portal →"
          )}
        </button>
      </form>

      {/* Sign-up link */}
      <div className="mt-5 text-center text-xs text-slate-400">
        New client organization?{" "}
        <Link href="/onboarding" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
          Request Client Onboarding →
        </Link>
      </div>

      {/* Security Footnote */}
      <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-800/80 pt-5 text-[11px] text-slate-500">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>256-Bit TLS Encryption • SOC 2 Type II &amp; HIPAA Compliant</span>
      </div>

    </div>
  );
}
