"use client";

import { useState } from "react";
import Link from "next/link";

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased selection:bg-blue-500/30 selection:text-blue-200">
      {/* AMBIENT GLOW MESH */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-15%] left-[30%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-[0_0_25px_rgba(37,99,235,0.45)] group-hover:scale-105 transition">
              •
            </div>
            <span className="text-xl font-bold tracking-tight text-white">The Data Dot</span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Credential Recovery</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Reset Portal Password
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Enter your corporate email address to receive a secure recovery token
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl sm:p-10">
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-2xl mb-3 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                ✓
              </div>
              <h2 className="text-base font-bold text-white">Reset Instructions Sent!</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                We have emailed a single-use password recovery link to <strong className="text-blue-400">{email}</strong>.
              </p>
              <Link
                href="/customer/login"
                className="mt-6 inline-block w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition"
              >
                Return to Login →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm font-medium transition font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition disabled:opacity-50"
              >
                {loading ? "Sending Link..." : "Send Password Reset Link →"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/customer/login"
                  className="text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
