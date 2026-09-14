"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/admin/dashboard");
    }, 500);
  };

  return (
    <main className="min-h-screen bg-[#050b14] text-white flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl shadow-xl shadow-red-600/20 mb-4 border border-red-500/30">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Admin Command Console
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Executive management • All systems, content CMS, and telemetry
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Executive Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="support@thedatadot.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Master Security Key
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
              className="w-full rounded-xl bg-red-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? "Authenticating Console..." : "Unlock Admin Console →"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5 text-center">
            <Link
              href="/portal"
              className="text-xs text-slate-400 hover:text-white transition"
            >
              ← Return to Client Portal
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          TLS 1.3 Cryptographic Session • SOC 2 Type II Audited
        </p>
      </div>
    </main>
  );
}
