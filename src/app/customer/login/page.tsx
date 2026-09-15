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
      setError("Please enter your account password or access key.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginCustomer(email, password);
      if (!result.success) {
        setError(result.error || "Access Denied: Invalid credentials or unauthorized account.");
        setLoading(false);
        return;
      }
      router.push("/customer/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected authentication error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased selection:bg-blue-500/30 selection:text-blue-200">
      {/* AMBIENT GLOW MESH */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-15%] left-[30%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* BRAND HEADER */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-[0_0_25px_rgba(37,99,235,0.45)] group-hover:scale-105 transition">
              •
            </div>
            <span className="text-xl font-bold tracking-tight text-white">The Data Dot</span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Executive Client Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Client Portal Sign In</h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time cleanroom hardware tracking, SOC incident telemetry, and cloud operations
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl sm:p-10">
          <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-[11px] text-blue-200 flex items-start gap-2">
            <span className="text-blue-400 font-bold">ℹ️</span>
            <span>
              <strong className="text-white">Authorized Access Only:</strong> Accounts are provisioned exclusively by The Data Dot Administration upon service onboarding.
            </span>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <div className="flex-1">
                <p className="font-bold text-rose-200">Authentication Failed</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-rose-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Corporate Email ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@organization.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm font-medium transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300">Password / Access Key</label>
                <Link
                  href="/contact"
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
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
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 pr-12 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm font-medium transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 text-xs font-mono font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-blue-500" />
                <span>Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Authenticating Credentials..." : "Sign In to Client Portal →"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-400">
            New client organization?{" "}
            <Link href="/customer/register" className="font-bold text-blue-400 hover:text-blue-300">
              Request Client Onboarding →
            </Link>
          </div>
        </div>

        {/* SECURITY FOOTNOTE */}
        <p className="mt-6 text-center text-[11px] text-slate-500 font-mono">
          256-Bit TLS Encrypted • Protected by The Data Dot 99.98% Cleanroom SLA
        </p>
      </div>
    </main>
  );
}
