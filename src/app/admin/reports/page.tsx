"use client";

import AdminLayoutShell from "@/components/AdminLayoutShell";

export default function AdminReportsPage() {
  return (
    <AdminLayoutShell
      title="Forensic Lab Analytics &amp; SLA Reports"
      subtitle="Verified recovery success scores, cleanroom turnaround times, and storage volume telemetry"
    >
      <div className="space-y-8 text-xs">
        {/* TOP KPI ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Data Restored</span>
            <p className="text-3xl font-black text-white mt-1">142.8 TB</p>
            <span className="text-[11px] text-emerald-400 font-semibold block mt-1">↑ 18.2% vs last quarter</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recovery Success Rate</span>
            <p className="text-3xl font-black text-emerald-400 mt-1">99.98%</p>
            <span className="text-[11px] text-slate-400 block mt-1">Certified Cleanroom Standard</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Rush Turnaround</span>
            <p className="text-3xl font-black text-blue-400 mt-1">9.2 Hours</p>
            <span className="text-[11px] text-slate-400 block mt-1">12-Hour Priority SLA Target</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">15-Min SLA Compliance</span>
            <p className="text-3xl font-black text-emerald-400 mt-1">100.0%</p>
            <span className="text-[11px] text-slate-400 block mt-1">Zero breaches (past 12 mos)</span>
          </div>
        </div>

        {/* MEDIA RECOVERY SUCCESS BREAKDOWN */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
          <h2 className="text-base font-bold text-white mb-1">
            Recovery Success Rate by Storage Architecture
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Detailed statistical breakdown of hardware extraction across ISO Class-5 clean benches.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                <span>Enterprise RAID Arrays (RAID 0, 1, 5, 6, 10, ZFS)</span>
                <span className="text-emerald-400 font-black">100.0% Success</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                <span>Mechanical Hard Drives (Clicking Sliders &amp; Head Crashes)</span>
                <span className="text-emerald-400 font-black">99.8% Success</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "99.8%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                <span>Solid State Drives (M.2 PCIe NVMe &amp; SATA SSD)</span>
                <span className="text-emerald-400 font-black">99.6% Success</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "99.6%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                <span>BitLocker Encrypted &amp; Corrupted SQL Databases</span>
                <span className="text-emerald-400 font-black">100.0% Success</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* COMPLIANCE & ACCREDITATION AUDIT */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8">
          <h2 className="text-base font-bold text-white mb-1">
            Forensic Cleanroom Certifications
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Audited laboratory standards ensuring strict legal admissibility of recovered digital evidence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">✓ ISO 14644-1 Class 5</span>
              <p className="text-slate-400 text-[11px]">Maximum 3,520 particles per cubic meter of air at 0.5 microns.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">✓ SOC 2 Type II Certified</span>
              <p className="text-slate-400 text-[11px]">Strict chain-of-custody tracking with cryptographic media write-blocking.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">✓ HIPAA &amp; GDPR Compliant</span>
              <p className="text-slate-400 text-[11px]">Zero customer data retained after confirmed delivery and verification.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
