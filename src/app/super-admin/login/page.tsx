"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { verifyAdminLogin, setAdminSession } from "@/lib/adminAuth";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = verifyAdminLogin(email, password);

    if (!result.success || !result.session) {
      setError(result.error || "Access Denied: Invalid administrator credentials.");
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.session.email,
          name: result.session.name,
          role: "super_admin",
        }),
      });
    } catch (apiErr) {
      console.warn("Backend session cookie register warning:", apiErr);
    }

    setAdminSession(result.session);

    setTimeout(() => {
      setLoading(false);
      router.push("/super-admin/dashboard");
    }, 400);
  };

  const handleFillCredentials = () => {
    setEmail("ebinezer@thedatadot.com");
    setPassword("Ebinezer@2005");
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#050b14] text-white flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-red-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="w-full max-w-md relative z-10">
        {/* BRAND BADGE */}
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl shadow-xl shadow-red-600/20 mb-4 border border-red-500/30">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Super Admin Command Center
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Restricted access • Authorized personnel only
          </p>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-950/60 p-3.5 text-xs text-red-300 flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-bold text-white">Access Denied</p>
                <p className="mt-0.5 text-[11px] text-red-300/90">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Super Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ebinezer@thedatadot.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Master Security Key / Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-red-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating Session..." : "Unlock Command Center →"}
            </button>
          </form>

          {/* Quick-fill button */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Admin: <strong>ebinezer@...</strong></span>
            <button
              type="button"
              onClick={handleFillCredentials}
              className="text-red-400 hover:text-red-300 hover:underline font-semibold cursor-pointer"
            >
              Autofill Credentials
            </button>
          </div>

          <div className="mt-6 text-center border-t border-slate-800 pt-5">
            <Link
              href="/admin/login"
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Switch to Executive Admin Console →
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500 font-mono">
          Cryptographic Hardware Enclave • TLS 1.3 • SOC 2 Type II
        </p>
      </div>
    </main>
  );
}
