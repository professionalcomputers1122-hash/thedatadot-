"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Custom SVG Icons
function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function ClientDashboardPage() {
  const [showFileModal, setShowFileModal] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Sample client data
  const clientInfo = {
    name: "Apex Healthcare Diagnostic Center",
    accountNumber: "TDD-CLI-8492",
    slaTier: "Enterprise 15-Min Response",
    assignedEngineer: "K. Vignesh (Forensic Storage Lead)",
  };

  const activeCase = {
    caseId: "TDD-8942",
    device: "Seagate IronWolf Pro 4TB SATA 3.5\"",
    serial: "WDC-WMC4N0E83719",
    reportedIssue: "Clicking sound, drive not recognized in BIOS (Mechanical Head Crash)",
    statusStage: 3, // 1: Received, 2: Cleanroom, 3: PC-3000 Imaging, 4: Delivery
    clonedPercent: 99.8,
    recoveredSize: "3.82 TB of 4.0 TB",
    intakeDate: "Sep 12, 2026",
    estimatedCompletion: "Today, 6:00 PM IST",
  };

  const recoveredFilesSample = [
    { name: "EMR_Patient_Records_2024_2026.mdf", size: "1.42 TB", status: "100% Intact" },
    { name: "Radiology_DICOM_Images.zip", size: "840 GB", status: "100% Intact" },
    { name: "Accounting_Tally_Database.qbw", size: "420 GB", status: "100% Intact" },
    { name: "Staff_Credentials_Archived.xlsx", size: "12 MB", status: "100% Intact" },
    { name: "Payroll_Ledgers_Q1-Q3.pdf", size: "1.2 GB", status: "100% Intact" },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      <Header />

      {/* DASHBOARD TOP SUBHEADER */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-950">{clientInfo.name}</h1>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800">
                  Client Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Account: {clientInfo.accountNumber} • SLA: {clientInfo.slaTier}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              <span>+ New Service Ticket</span>
            </button>

            <Link
              href="/portal"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* ================= ACTIVE DATA RECOVERY SPOTLIGHT ================= */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 p-6 shadow-md sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                <span>Active Cleanroom Case: #{activeCase.caseId}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                {activeCase.device}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Serial Number: <strong>{activeCase.serial}</strong> • Reported Issue: {activeCase.reportedIssue}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">Lead Forensic Engineer</span>
              <span className="text-sm font-bold text-slate-900">{clientInfo.assignedEngineer}</span>
              <a
                href="tel:+916380488373"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                <span>Call Engineer: +91 6380488373</span>
              </a>
            </div>
          </div>

          {/* VISUAL RECOVERY TIMELINE PROGRESS (4 STAGES) */}
          <div className="my-8">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              <span>Live Cleanroom Progress</span>
              <span className="text-emerald-600 font-extrabold text-sm">{activeCase.clonedPercent}% Cloned</span>
            </div>

            {/* PROGRESS STAGES */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* STAGE 1 */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span>1. Media Intake</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-900 font-medium">Checked in, barcoded, anti-static logged.</p>
                <span className="mt-2 block text-[10px] text-emerald-700">Completed (Sep 12)</span>
              </div>

              {/* STAGE 2 */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span>2. Cleanroom Diagnostics</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-900 font-medium">ISO Class-5 donor head replacement done.</p>
                <span className="mt-2 block text-[10px] text-emerald-700">Completed (Sep 13)</span>
              </div>

              {/* STAGE 3 (ACTIVE) */}
              <div className="rounded-2xl border-2 border-blue-500 bg-blue-50/90 p-4 shadow-sm relative overflow-hidden">
                <span className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-blue-400/20 animate-pulse" />
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  <span>3. PC-3000 Imaging</span>
                </div>
                <p className="mt-1 text-[11px] text-blue-950 font-semibold">
                  Mirroring raw sectors ({activeCase.recoveredSize}).
                </p>
                <span className="mt-2 block text-[10px] font-bold text-blue-700">Currently Active</span>
              </div>

              {/* STAGE 4 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 opacity-70">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                  <span>○</span>
                  <span>4. Verify &amp; Return</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 font-medium">File integrity audit &amp; secure courier dispatch.</p>
                <span className="mt-2 block text-[10px] text-slate-400">Est. {activeCase.estimatedCompletion}</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-5">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
              <span>Protected by <strong>No Data, No Recovery Fee</strong> guarantee.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFileModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xs hover:bg-slate-50 transition"
              >
                <span>🔍 Verify Recovered Files (5)</span>
              </button>

              <a
                href="tel:+916380488373"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-500 transition"
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                <span>Contact Lab Dispatch</span>
              </a>
            </div>
          </div>
        </div>

        {/* ================= SUPPORT TICKETS TABLE ================= */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Active IT &amp; Cloud Support Tickets</h3>
              <p className="text-xs text-slate-500">Track company workstation and cloud infrastructure tickets</p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewTicketModal(true)}
              className="self-start sm:self-center text-xs font-bold text-blue-600 hover:underline"
            >
              + Submit New Support Request
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Team</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-bold text-slate-950">#TDD-8942</td>
                  <td className="px-4 py-3.5 text-blue-700 font-semibold">Data Recovery</td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">Seagate IronWolf 4TB (Clicking slider)</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                      PC-3000 Extraction
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium">Cleanroom Storage Lab</td>
                  <td className="px-4 py-3.5 text-slate-500">12 mins ago</td>
                </tr>

                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-bold text-slate-950">#TDD-8910</td>
                  <td className="px-4 py-3.5 text-indigo-700 font-semibold">Cloud Infrastructure</td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">Microsoft 365 MFA Policy &amp; Mailbox Audit</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium">Tier-3 Security Engineers</td>
                  <td className="px-4 py-3.5 text-slate-500">Yesterday</td>
                </tr>

                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-bold text-slate-950">#TDD-8884</td>
                  <td className="px-4 py-3.5 text-amber-700 font-semibold">Cybersecurity</td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">Quarterly Endpoint Vulnerability Scan</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                      Scheduled (Sep 20)
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium">SOC Compliance Team</td>
                  <td className="px-4 py-3.5 text-slate-500">3 days ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================= RECOVERED FILES MODAL ================= */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-950">
                  Recovered File Verification — Case #{activeCase.caseId}
                </h4>
                <p className="text-xs text-slate-500">
                  Preview of healthy reconstructed file structures ready for handover.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
              {recoveredFilesSample.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-blue-50/40 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📄</span>
                    <div>
                      <p className="font-bold text-slate-900">{file.name}</p>
                      <span className="text-[11px] text-slate-500">{file.size}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    {file.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <span className="text-xs text-slate-500 font-medium">
                Total Extracted: <strong>3.82 TB (99.8% Integrity)</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-500"
              >
                Close File Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW SERVICE TICKET MODAL ================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h4 className="text-lg font-bold text-slate-950">Submit Service or Lab Ticket</h4>
              <button
                type="button"
                onClick={() => {
                  setShowNewTicketModal(false);
                  setTicketSubmitted(false);
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {ticketSubmitted ? (
              <div className="my-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-3">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <h5 className="text-base font-bold text-slate-950">Ticket Dispatched Successfully!</h5>
                <p className="mt-1 text-xs text-slate-600">
                  Case <strong>#TDD-8945</strong> has been created. A Tier-3 engineer has been notified according to your 15-minute SLA.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTicketModal(false);
                    setTicketSubmitted(false);
                  }}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTicketSubmitted(true);
                }}
                className="mt-4 space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                  <select className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 outline-none focus:border-blue-500">
                    <option>Critical Cleanroom Data Recovery</option>
                    <option>Cloud Infrastructure / M365 Issue</option>
                    <option>Urgent Workstation / Server Outage</option>
                    <option>Firewall &amp; Security Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NAS RAID volume offline after power drop"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hardware / Device Serial (if recovery)</label>
                  <input
                    type="text"
                    placeholder="e.g. WD Red Plus 8TB SN: WX21A..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Urgency Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 p-2.5 cursor-pointer hover:border-blue-400">
                      <input type="radio" name="urgency" defaultChecked />
                      <span>Standard</span>
                    </label>
                    <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 p-2.5 cursor-pointer hover:border-blue-400">
                      <input type="radio" name="urgency" />
                      <span>Priority</span>
                    </label>
                    <label className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 p-2.5 cursor-pointer text-red-700 font-bold">
                      <input type="radio" name="urgency" />
                      <span>Critical (15m)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketModal(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500"
                  >
                    Submit Ticket →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
