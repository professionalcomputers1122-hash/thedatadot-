"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginCustomer } from "@/lib/clientAuth";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      await loginCustomer(email);
      router.push("/customer/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased">
      {/* Background radial gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

      <div className="w-full max-w-md relative z-10">
        {/* BRAND HEADER */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25">
              •
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">The Data Dot</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Customer Portal Login</h1>
          <p className="mt-1 text-xs text-slate-500">
            Track hardware recovery in real time and manage enterprise IT tickets
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Business Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">Password</label>
                <Link
                  href="/customer/forgot-password"
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-blue-600" />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Portal →"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600">
            Don&apos;t have an account yet?{" "}
            <Link href="/customer/register" className="font-bold text-blue-600 hover:underline">
              Register Organization
            </Link>
          </div>
        </div>

        {/* SECURITY FOOTNOTE */}
        <p className="mt-6 text-center text-[11px] text-slate-400">
          256-Bit TLS Encrypted • Protected by The Data Dot 99.98% Recovery Guarantee
        </p>
      </div>
    </main>
  );
}
