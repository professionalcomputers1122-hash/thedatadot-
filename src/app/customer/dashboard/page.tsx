"use client";

import { useState } from "react";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";

export default function CustomerDashboardPage() {
  const [showFileModal, setShowFileModal] = useState(false);

  const files = [
    { name: "EMR_Patient_Records_2024_2026.mdf", size: "1.42 TB", status: "100% Intact" },
    { name: "Radiology_DICOM_Images.zip", size: "840 GB", status: "100% Intact" },
    { name: "Accounting_Tally_Database.qbw", size: "420 GB", status: "100% Intact" },
    { name: "Staff_Credentials_Archived.xlsx", size: "12 MB", status: "100% Intact" },
    { name: "Payroll_Ledgers_Q1-Q3.pdf", size: "1.2 GB", status: "100% Intact" },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* WELCOME BANNER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
              <span>Apex Healthcare Diagnostic Center • Account #TDD-8492</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Welcome back, Dr. Aravind Swaminathan
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Your active hardware cases, cleanroom progress, and cloud support tickets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
            >
              <span>+ Request Media Pickup / Ticket</span>
            </Link>
          </div>
        </div>

        {/* METRICS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Active Recovery</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">1 Device</span>
              <span className="text-[11px] font-semibold text-emerald-600">99.8% Cloned</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">SLA Response Guarantee</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">15-Min</span>
              <span className="text-[11px] font-semibold text-blue-600">24/7/365</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Recovery Success</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">99.98%</span>
              <span className="text-[11px] font-semibold text-slate-500">Cleanroom Score</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Cases</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">2 Cases</span>
              <span className="text-[11px] font-semibold text-slate-500">1 Active · 1 Closed</span>
            </div>
          </div>
        </div>

        {/* ACTIVE CLEANROOM SPOTLIGHT */}
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/20 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                <span>Active Forensic Target • Case #TDD-8942</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                Seagate IronWolf Pro 4TB SATA 3.5&quot;
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Serial: <strong>WDC-WMC4N0E83719</strong> • Reported: Severe clicking head contact after power surge
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-500 block">Assigned Lead Engineer</span>
              <span className="text-sm font-bold text-slate-900">S. Murugan (Cleanroom Lead)</span>
              <p className="text-xs font-bold text-blue-600 mt-0.5">Lab Hotline: +91 6380488373</p>
            </div>
          </div>

          {/* 4-STAGE VISUAL TIMELINE */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                ✓ 1. Media Intake
              </span>
              <p className="text-[11px] text-emerald-900 mt-1">Barcoded &amp; logged in secure vault.</p>
              <span className="text-[10px] text-emerald-700 block mt-2 font-bold">Done (Sep 12)</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                ✓ 2. Head Swap
              </span>
              <p className="text-[11px] text-emerald-900 mt-1">Class-5 donor sliders calibrated.</p>
              <span className="text-[10px] text-emerald-700 block mt-2 font-bold">Done (Sep 13)</span>
            </div>

            <div className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 shadow-sm relative overflow-hidden">
              <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                3. PC-3000 Imaging
              </span>
              <p className="text-[11px] text-blue-950 mt-1">Cloning raw sectors (3.82 TB).</p>
              <span className="text-[10px] text-blue-700 block mt-2 font-extrabold">99.8% Finished (Active)</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 opacity-70">
              <span className="text-xs font-bold text-slate-600">○ 4. Verification &amp; Return</span>
              <p className="text-[11px] text-slate-500 mt-1">Client audit &amp; secure courier dispatch.</p>
              <span className="text-[10px] text-slate-400 block mt-2">Est. Today, 6:00 PM</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
            <span className="text-xs text-slate-600">
              Protected by <strong>No Data, No Recovery Fee</strong> guarantee.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFileModal(true)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 shadow-xs transition"
              >
                🔍 Verify Recovered File List (5)
              </button>

              <Link
                href="/customer/tickets/TDD-8942"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
              >
                View Full Ticket Thread →
              </Link>
            </div>
          </div>
        </div>

        {/* RECENT TICKETS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Your Tickets</h3>
              <p className="text-xs text-slate-500">Active and recent support requests</p>
            </div>
            <Link
              href="/customer/tickets"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All Tickets (2) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-bold text-blue-600">#TDD-8942</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">Data Recovery</td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">Seagate IronWolf Pro 4TB (Clicking heads)</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                      PC-3000 Imaging (99.8%)
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href="/customer/tickets/TDD-8942"
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-bold text-blue-600">#TDD-8910</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">Cloud Solutions</td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">Microsoft 365 MFA Policy &amp; Mailbox Audit</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Resolved
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href="/customer/tickets/TDD-8910"
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* RECOVERED FILES MODAL */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-950">
                  Recovered Files Verification — Case #TDD-8942
                </h4>
                <p className="text-slate-500 text-xs">Reconstructed patient records and hospital accounting databases.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📄</span>
                    <div>
                      <p className="font-bold text-slate-900">{f.name}</p>
                      <span className="text-[11px] text-slate-500">{f.size}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 text-[10px]">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-slate-500">Total Cloned: <strong>3.82 TB (99.8% Integrity)</strong></span>
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
