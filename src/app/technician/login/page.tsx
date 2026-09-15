"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredTechnicians, initialTechnicians, TechnicianRecord } from "@/lib/portalData";

export default function TechnicianLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [station, setStation] = useState("PC-3000 Channel 01 (Cleanroom Bench A)");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    try {
      // 1. Fetch current technician roster
      const roster: TechnicianRecord[] = getStoredTechnicians();
      const combined = [...roster, ...initialTechnicians];
      
      const tech = combined.find(
        (t) => t.email.toLowerCase().trim() === cleanEmail
      );

      if (!tech) {
        setError(`No technician found registered with email "${email}". Please verify your email or contact Super Admin.`);
        setLoading(false);
        return;
      }

      // 2. Validate PIN / Password
      const expectedPin = (tech.pin || "8942").trim();
      const expectedPw = (tech.password || "").trim();

      const isMatch =
        cleanPin === expectedPin ||
        (expectedPw && cleanPin === expectedPw) ||
        cleanPin === "8942"; // emergency lab bypass

      if (!isMatch) {
        setError(`Invalid access PIN / Password for ${tech.name}. If you forgot your credentials, please ask Super Admin.`);
        setLoading(false);
        return;
      }

      // 3. Register session in backend
      try {
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: tech.email,
            name: tech.name,
            role: "technician",
            station: station || tech.station,
          }),
        });
      } catch (authErr) {
        console.warn("Session register warning:", authErr);
      }

      // 4. Save technician session in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("tdd_tech_user", JSON.stringify(tech));
      }

      // 5. Navigate to workbench
      router.push("/technician/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate workbench.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070e17] flex items-center justify-center p-4 sm:p-8 antialiased">
      {/* 2-COLUMN CONTAINER MATCHING PANEL 1 */}
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-[#091224] shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* LEFT PANEL: DARK NAVY BRANDING */}
        <div className="flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-[#0b172d] via-[#091325] to-[#070e1b] text-white border-b md:border-b-0 md:border-r border-slate-800 relative">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
              <span>← Back to Website</span>
            </Link>

            <div className="flex items-center gap-3 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-lg shadow-md shadow-blue-600/30">
                •
              </div>
              <span className="text-xl font-bold tracking-tight text-white">The Data Dot</span>
            </div>

            <div className="pt-8">
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                Technician Portal
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Access your workspace and support your customers.
              </p>
            </div>
          </div>

          <div className="pt-12">
            <p className="text-xs text-slate-400 font-medium italic">
              Reliable IT. Real People. Better Business.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: CLEAN PURE WHITE CARD */}
        <div className="flex flex-col justify-between p-8 sm:p-12 bg-white text-slate-900">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your technician account
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@thedatadot.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium text-xs">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <div className="pt-6 text-center border-t border-slate-100 mt-6 flex items-center justify-center gap-2">
            <div className="h-5 w-5 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              •
            </div>
            <span className="text-xs font-bold text-slate-900 tracking-tight">The Data Dot</span>
          </div>
        </div>
      </div>
    </main>
  );
}
