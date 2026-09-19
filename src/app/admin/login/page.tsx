"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { verifyAdminLogin, setAdminSession } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Verify credentials
    const result = verifyAdminLogin(email, password);

    if (!result.success || !result.session) {
      setError(result.error || "Access Denied: Invalid administrator credentials.");
      setLoading(false);
      return;
    }

    try {
      // 1. Register authenticated session in backend cookie
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.session.email,
          name: result.session.name,
          role: "admin",
        }),
      });
    } catch (apiErr) {
      console.warn("Backend session cookie register warning:", apiErr);
    }

    // 2. Save active admin session in client storage
    setAdminSession(result.session);

    // 3. Redirect to dashboard
    setTimeout(() => {
      setLoading(false);
      router.push("/admin/dashboard");
    }, 400);
  };

  return (
    <main className="min-h-screen bg-[#050b14] text-white flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased">
      {/* Dynamic ambient background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-red-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="w-full max-w-md relative z-10">
        {/* BRAND HEADER */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl px-5 py-2.5 inline-flex items-center justify-center shadow-xl shadow-red-600/10 mb-4 border border-white/20">
            <Image
              src="/logo.png"
              alt="The Data Dot"
              width={160}
              height={28}
              priority
              style={{ height: "auto" }}
              className="w-[145px]"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Admin Command Console
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Executive management • High-security forensic telemetry &amp; dispatch
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs text-rose-300 animate-in fade-in flex items-start gap-2.5">
              <span className="text-base shrink-0">⚠️</span>
              <div className="flex-1 leading-relaxed">
                <p className="font-bold text-white">Security Verification Failed</p>
                <p className="mt-0.5 text-[11px] text-rose-300/90">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Executive Admin Email
              </label>
              <input
                type="email"
                name="admin_login_email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@thedatadot.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Master Security Key / Password
              </label>
              <input
                type="password"
                name="admin_login_password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying Credentials..." : "Unlock Admin Console →"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5 text-center flex items-center justify-between text-xs">
            <Link
              href="/portal"
              className="text-slate-400 hover:text-white transition text-[11px]"
            >
              ← Return to Client Portal
            </Link>
            <Link
              href="/technician/login"
              className="text-slate-400 hover:text-blue-400 transition text-[11px]"
            >
              Technician Login →
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500 font-mono">
          TLS 1.3 Cryptographic Session • SOC 2 Type II Audited • ISO 27001
        </p>
      </div>
    </main>
  );
}
