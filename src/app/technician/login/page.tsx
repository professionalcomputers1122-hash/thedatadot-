"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredTechnicians, initialTechnicians, TechnicianRecord } from "@/lib/portalData";

export default function TechnicianLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("vignesh.ssd@thedatadot.com");
  const [pin, setPin] = useState("8942");
  const [station, setStation] = useState("PC-3000 Channel 01 (Cleanroom Bench A)");
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
        setError(`Invalid access PIN / Password for ${tech.name}. If you forgot your credentials, please ask the Super Admin to reset your PIN in the Admin Dashboard.`);
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

  const handleQuickFill = (tEmail: string, tPin: string, tStation: string) => {
    setEmail(tEmail);
    setPin(tPin);
    setStation(tStation);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#070e17] text-white flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 text-slate-400 hover:text-white transition text-xs">
            <span>← Back to Main Website</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl font-bold tracking-tight text-white">The Data Dot</span>
            <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
              Forensic Lab
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Internal Cleanroom Engineering &amp; Hardware Recovery Authentication
          </p>
        </div>

        {/* DEDICATED TECHNICIAN LOGIN CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/95 to-[#0b1320]/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
              Cleanroom Workbench Login
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              ISO Class-5 Laminar Stations • PC-3000 Telemetry &amp; Write-Block
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-xs text-rose-300">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Staff Corporate Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tech@thedatadot.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Assigned PC-3000 Station
              </label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-white outline-none focus:border-indigo-500 text-xs"
              >
                <option>PC-3000 Channel 01 (Cleanroom Bench A)</option>
                <option>PC-3000 Portable III NVMe Station</option>
                <option>Forensic Hex Server Rack 04</option>
                <option>Soldering &amp; Micro-inspection Station</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300">
                  Workbench Access PIN / Password
                </label>
                <span className="text-[10px] text-slate-400">
                  Default: 8942
                </span>
              </div>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN or password"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-white font-mono placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Authenticating Bench..." : "Unlock Forensic Workbench →"}
            </button>
          </form>

          {/* QUICK DEMO CREDENTIAL SELECTOR */}
          <div className="mt-5 border-t border-slate-800/80 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Test Credentials:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill("vignesh.ssd@thedatadot.com", "8942", "PC-3000 Portable III NVMe Station")}
                className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1 text-[10px] font-mono text-slate-300 hover:border-indigo-500 hover:text-white"
              >
                K. Vignesh (8942)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("rajesh.lab@thedatadot.com", "7103", "PC-3000 Channel 01 (Cleanroom Bench A)")}
                className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1 text-[10px] font-mono text-slate-300 hover:border-indigo-500 hover:text-white"
              >
                M. Rajesh (7103)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("balaji.cloud@thedatadot.com", "5519", "Forensic Hex Server Rack 04")}
                className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1 text-[10px] font-mono text-slate-300 hover:border-indigo-500 hover:text-white"
              >
                R. Balaji (5519)
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-3 text-center">
            <Link
              href="/portal"
              className="text-xs text-slate-400 hover:text-white transition"
            >
              ← Switch to Client Portal View
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          ISO Class-5 Certified • 256-Bit Hardware Write-Block Active • Internal Staff Only
        </p>
      </div>
    </main>
  );
}
