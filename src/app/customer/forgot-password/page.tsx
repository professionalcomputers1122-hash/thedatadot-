"use client";

import { useState } from "react";
import Link from "next/link";

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

      <div className="w-full max-w-md relative z-10">
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Reset Portal Password
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your corporate email address to receive a secure recovery token
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mb-3">
                ✓
              </div>
              <h2 className="text-base font-bold text-slate-950">Reset Instructions Sent!</h2>
              <p className="text-xs text-slate-600 mt-1">
                We have emailed a single-use password recovery link to <strong>{email}</strong>.
              </p>
              <Link
                href="/customer/login"
                className="mt-6 inline-block w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Return to Login →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Sending Link..." : "Send Password Reset Link →"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/customer/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
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
