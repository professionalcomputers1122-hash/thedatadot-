"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import TechnicianNav from "@/components/TechnicianNav";
import Footer from "@/components/Footer";

export default function TechnicianReportPreviewPage() {
  const [jobId, setJobId] = useState("2003");
  // Calendar dates in YYYY-MM-DD for native datepicker
  const [reportDateIso, setReportDateIso] = useState("2026-09-19");
  const [recoveryDateIso, setRecoveryDateIso] = useState("2026-09-29");

  const [clientName, setClientName] = useState("Sanjay Vignesh");
  const [deviceType, setDeviceType] = useState<"HDD" | "SSD" | "NVMe" | "FLASH">("HDD");
  const [brand, setBrand] = useState("Seagate");
  const [model, setModel] = useState("Barracuda");
  const [serialNumber, setSerialNumber] = useState("ABC123456");
  const [capacity, setCapacity] = useState("1TB");
  const [iface, setIface] = useState("SATA");
  const [fileSystem, setFileSystem] = useState("NTFS");

  const [diagnosis, setDiagnosis] = useState("Head failure");
  const [symptoms, setSymptoms] = useState("Clicking sound, drive not detecting");
  const [findings, setFindings] = useState("Read/write heads completely damaged");
  const [recoveryMethod, setRecoveryMethod] = useState("Head replacement and controlled data imaging");
  const [recoveryAssessment, setRecoveryAssessment] = useState("Recovery possible, subject to platter condition");
  const [estimatedTime, setEstimatedTime] = useState("7–10 Business Days");
  const [diagnosisCharge, setDiagnosisCharge] = useState("₹750");
  const [finalRecoveryCost, setFinalRecoveryCost] = useState("₹15,000–₹17,500");

  const [recoveryStatus, setRecoveryStatus] = useState("Pending");
  const [recoveredData, setRecoveredData] = useState("-");
  const [dataVerification, setDataVerification] = useState("Pending");

  const [showFormOnMobile, setShowFormOnMobile] = useState(false);

  // Format YYYY-MM-DD to DD-MM-YYYY for report display
  const formatDisplayDate = (isoStr: string) => {
    if (!isoStr) return "";
    const parts = isoStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return isoStr;
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1324] text-slate-100 flex flex-col antialiased">
      
      {/* STRICT 1-PAGE A4 PRINT STYLESHEET */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide all non-report elements */
          body * {
            visibility: hidden !important;
          }
          /* Strictly show ONLY the single A4 report sheet */
          #printableReportArea, #printableReportArea * {
            visibility: visible !important;
          }
          #printableReportArea {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 284mm !important;
            margin: 0 !important;
            padding: 2mm 4mm !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
            overflow: hidden !important;
          }
          .no-print, header, nav, footer, aside {
            display: none !important;
          }
        }
      `}</style>

      {/* TOP HEADER NAVIGATION (HIDDEN ON PRINT) */}
      <div className="no-print">
        <TechnicianNav />
      </div>

      {/* TOP BANNER WITH EDIT & PRINT BUTTONS (HIDDEN ON PRINT) */}
      <div className="no-print bg-blue-950/80 border-b border-blue-800/60 px-6 py-3 text-xs text-blue-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              <strong>1-Page Diagnostic Report Preview:</strong> Contact: +91 6380488373 • support@thedatadot.com • Tiruvallur, Tamilnadu • Calendar for Report &amp; Recovery Dates.
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowFormOnMobile(!showFormOnMobile)}
              className="lg:hidden rounded-lg bg-blue-800 px-3 py-1 text-xs font-semibold text-white"
            >
              {showFormOnMobile ? "Hide Form" : "Edit Fields"}
            </button>
            <button
              onClick={handlePrint}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-1.5 font-bold text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              title="Prints exactly 1 single A4 page"
            >
              <span>🖨️</span>
              <span>Print / Save as 1-Page PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* LEFT: TECHNICIAN FORM CONTROLLER (NO-PRINT) */}
        <aside
          className={`no-print w-full lg:w-[380px] shrink-0 bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3.5 text-xs ${
            showFormOnMobile ? "block" : "hidden lg:block"
          }`}
        >
          <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Report Customizer</h2>
              <p className="text-[11px] text-slate-400">Values update live on the 1-page report</p>
            </div>
            <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
              Job #{jobId}
            </span>
          </div>

          <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1">
            {/* ROW 1: JOB ID & CALENDAR REPORT DATE */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Job ID</label>
                <input
                  type="text"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Report Date 📅</label>
                <input
                  type="date"
                  value={reportDateIso}
                  onChange={(e) => setReportDateIso(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 font-medium [color-scheme:dark]"
                />
              </div>
            </div>

            {/* CALENDAR RECOVERY DATE PICKER */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Est. Recovery Date 📅</label>
              <input
                type="date"
                value={recoveryDateIso}
                onChange={(e) => setRecoveryDateIso(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 font-medium [color-scheme:dark]"
              />
            </div>

            {/* CLIENT NAME */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* DEVICE TYPE & CAPACITY */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Device Type</label>
                <select
                  value={deviceType}
                  onChange={(e: any) => setDeviceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 font-semibold text-blue-300"
                >
                  <option value="HDD">Hard Disk Drive (HDD)</option>
                  <option value="SSD">Solid State Drive (SSD)</option>
                  <option value="NVMe">M.2 NVMe PCIe SSD</option>
                  <option value="FLASH">Flash / USB Drive</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Capacity</label>
                <input
                  type="text"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* BRAND & MODEL */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* SERIAL, INTERFACE, FILE SYSTEM */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Serial No.</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Interface</label>
                <input
                  type="text"
                  value={iface}
                  onChange={(e) => setIface(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 text-[11px]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">File System</label>
                <input
                  type="text"
                  value={fileSystem}
                  onChange={(e) => setFileSystem(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 text-[11px]"
                />
              </div>
            </div>

            {/* DIAGNOSIS & SYMPTOMS */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Device Condition / Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Detected Symptoms</label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Technical Findings</label>
              <textarea
                rows={2}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 leading-snug"
              />
            </div>

            {/* RECOVERY METHOD & ASSESSMENT */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Recovery Method</label>
              <input
                type="text"
                value={recoveryMethod}
                onChange={(e) => setRecoveryMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Recovery Assessment</label>
              <input
                type="text"
                value={recoveryAssessment}
                onChange={(e) => setRecoveryAssessment(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* CHARGES & TIME */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Diag. Fee</label>
                <input
                  type="text"
                  value={diagnosisCharge}
                  onChange={(e) => setDiagnosisCharge(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Est. Recovery</label>
                <input
                  type="text"
                  value={finalRecoveryCost}
                  onChange={(e) => setFinalRecoveryCost(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-blue-400 font-bold outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Est. Time</label>
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500 text-[11px]"
                />
              </div>
            </div>

            {/* STATUS & VERIFICATION */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Recovery Status</label>
                <input
                  type="text"
                  value={recoveryStatus}
                  onChange={(e) => setRecoveryStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Verification</label>
                <input
                  type="text"
                  value={dataVerification}
                  onChange={(e) => setDataVerification(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800 flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🖨️</span>
              <span>Print / Save as 1-Page PDF</span>
            </button>
          </div>
        </aside>

        {/* RIGHT: OFFICIAL STRICT 1-PAGE A4 REPORT SHEET */}
        <section
          id="printableReportArea"
          className="print-page w-full max-w-[780px] bg-white text-slate-900 rounded-2xl border border-slate-300 p-6 sm:p-9 print:p-3 shadow-xl relative"
        >
          
          {/* TOP HEADER: OFFICIAL LOGO + 3 SERVICES + TAGLINE */}
          <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-200">
            <div>
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="The Data Dot"
                  width={205}
                  height={38}
                  priority
                  style={{ height: "auto" }}
                  className="w-[165px] sm:w-[205px]"
                />
              </div>
              <p className="text-[10.5px] sm:text-[11.5px] font-semibold text-slate-600 tracking-wide mt-1.5">
                Experts in Data Recovery, IT Support &amp; Cyber Security
              </p>
            </div>

            {/* SERVICES MATRIX */}
            <div className="flex items-center gap-3.5 text-right">
              <div className="text-[9px] font-bold text-slate-700 space-y-0.5 tracking-wider uppercase leading-tight">
                <div>DATA RECOVERY</div>
                <div>IT SUPPORT</div>
                <div>CYBER SECURITY</div>
              </div>
              <div className="h-8 w-[1.5px] bg-blue-400"></div>
              <div className="text-[9px] font-bold text-slate-800 space-y-0.5 tracking-wider uppercase leading-tight text-left">
                <div>YOUR DATA</div>
                <div>OUR EXPERTISE</div>
                <div>A SAFER TOMORROW</div>
              </div>
            </div>
          </div>

          {/* MAIN REPORT TITLE & JOB BADGE */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pb-2.5">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                ADVANCED DATA RECOVERY REPORT
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase mt-0.5">
                DIAGNOSIS &nbsp;•&nbsp; ANALYSIS &nbsp;•&nbsp; RECOVERY ASSESSMENT
              </p>
            </div>

            <div className="bg-blue-50/70 border border-blue-100 rounded-lg px-3.5 py-1.5 text-right min-w-[170px] shadow-xs">
              <div className="text-[11px] text-slate-700 flex justify-between gap-3">
                <span className="font-bold text-slate-900">Job ID:</span>
                <span className="font-black text-blue-700 font-mono">{jobId}</span>
              </div>
              <div className="text-[10px] text-slate-600 flex justify-between gap-3 mt-0.5">
                <span className="text-slate-500">Report Date:</span>
                <span className="font-medium">{formatDisplayDate(reportDateIso)}</span>
              </div>
              <div className="text-[10px] text-slate-600 flex justify-between gap-3 mt-0.5">
                <span className="text-slate-500">Est. Recovery:</span>
                <span className="font-semibold text-blue-700">{formatDisplayDate(recoveryDateIso)}</span>
              </div>
              <div className="text-[10px] text-slate-600 flex justify-between gap-3 mt-0.5">
                <span className="text-slate-500">Report Type:</span>
                <span className="font-semibold text-slate-800">Initial Diagnosis</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: CLIENT & DEVICE INFORMATION */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-200">
            <h2 className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-slate-900 mb-2">
              1. CLIENT &amp; DEVICE INFORMATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              
              {/* LEFT TABLE */}
              <div className="sm:col-span-7 space-y-1 text-[11px] text-slate-700">
                <div className="flex">
                  <span className="w-28 font-semibold text-slate-900">Client Name</span>
                  <span className="mr-2.5">:</span>
                  <span className="font-medium text-slate-800">{clientName}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold text-slate-900">Device Type</span>
                  <span className="mr-2.5">:</span>
                  <span className="font-medium text-slate-800">
                    {deviceType === "HDD" ? "Hard Disk Drive (HDD)" : deviceType === "SSD" ? "Solid State Drive (SSD)" : deviceType === "NVMe" ? "M.2 NVMe PCIe SSD" : "Flash Drive / Pen Drive"}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold text-slate-900">Brand / Model</span>
                  <span className="mr-2.5">:</span>
                  <span className="font-medium text-slate-800">{brand} {model}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold text-slate-900">Serial Number</span>
                  <span className="mr-2.5">:</span>
                  <span className="font-mono font-medium text-slate-800">{serialNumber}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold text-slate-900">Capacity</span>
                  <span className="mr-2.5">:</span>
                  <span className="font-medium text-slate-800">{capacity}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold text-slate-900">Interface</span>
                  <span className="mr-2.5">:</span>
                  <span className="font-medium text-slate-800">{iface}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-semibold text-slate-900">File System</span>
                  <span className="mr-2.5">:</span>
                  <span className="font-medium text-slate-800">{fileSystem}</span>
                </div>
              </div>

              {/* RIGHT DRIVE GRAPHIC & QUOTE */}
              <div className="sm:col-span-5 flex items-center justify-center gap-3 pl-2">
                <div className="w-20 h-28 shrink-0 flex items-center justify-center">
                  {deviceType === "HDD" && (
                    <svg className="w-20 h-28 drop-shadow-sm" viewBox="0 0 100 135" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="5" width="90" height="125" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2"/>
                      <rect x="9" y="9" width="82" height="117" rx="4" fill="#e2e8f0"/>
                      <circle cx="12" cy="12" r="2.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8"/>
                      <circle cx="88" cy="12" r="2.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8"/>
                      <circle cx="12" cy="122" r="2.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8"/>
                      <circle cx="88" cy="122" r="2.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8"/>
                      <rect x="15" y="16" width="70" height="56" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1"/>
                      <circle cx="50" cy="44" r="23" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2"/>
                      <circle cx="50" cy="44" r="14" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1"/>
                      <circle cx="50" cy="44" r="5" fill="#94a3b8"/>
                      <path d="M50 44 L30 60" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
                      <rect x="15" y="78" width="70" height="42" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1"/>
                      <rect x="19" y="83" width="62" height="6" rx="1" fill="#3b82f6"/>
                      <text x="50" y="88" fontSize="4.5" fontFamily="sans-serif" fontWeight="bold" fill="#ffffff" textAnchor="middle">SATA FORENSIC MEDIA</text>
                      <rect x="19" y="93" width="2" height="8" fill="#1e293b"/>
                      <rect x="23" y="93" width="4" height="8" fill="#1e293b"/>
                      <rect x="29" y="93" width="1" height="8" fill="#1e293b"/>
                      <rect x="32" y="93" width="3" height="8" fill="#1e293b"/>
                      <rect x="37" y="93" width="5" height="8" fill="#1e293b"/>
                      <rect x="44" y="93" width="2" height="8" fill="#1e293b"/>
                      <rect x="48" y="93" width="4" height="8" fill="#1e293b"/>
                      <rect x="54" y="93" width="3" height="8" fill="#1e293b"/>
                      <rect x="59" y="93" width="2" height="8" fill="#1e293b"/>
                      <rect x="63" y="93" width="5" height="8" fill="#1e293b"/>
                      <rect x="70" y="93" width="2" height="8" fill="#1e293b"/>
                      <rect x="74" y="93" width="4" height="8" fill="#1e293b"/>
                      <text x="50" y="106" fontSize="4" fontFamily="monospace" fill="#64748b" textAnchor="middle">CERTIFIED CLEANROOM INTAKE</text>
                      <text x="50" y="114" fontSize="3.5" fontFamily="monospace" fill="#94a3b8" textAnchor="middle">THE DATA DOT LABS</text>
                    </svg>
                  )}

                  {deviceType === "SSD" && (
                    <svg className="w-20 h-28 drop-shadow-sm" viewBox="0 0 100 135" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="8" width="88" height="120" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                      <rect x="10" y="12" width="80" height="112" rx="3" fill="#0f172a"/>
                      <rect x="16" y="24" width="68" height="74" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1"/>
                      <rect x="20" y="28" width="60" height="12" rx="1" fill="#2563eb"/>
                      <text x="50" y="37" fontSize="6" fontFamily="sans-serif" fontWeight="900" fill="#ffffff" textAnchor="middle">SOLID STATE DRIVE</text>
                      <text x="50" y="52" fontSize="5" fontFamily="monospace" fontWeight="bold" fill="#0f172a" textAnchor="middle">2.5" SATA 6Gb/s</text>
                      <text x="50" y="62" fontSize="8" fontFamily="sans-serif" fontWeight="900" fill="#2563eb" textAnchor="middle">NAND FLASH</text>
                      <rect x="20" y="72" width="60" height="7" fill="#f1f5f9"/>
                      <rect x="22" y="73" width="2" height="5" fill="#0f172a"/>
                      <rect x="26" y="73" width="3" height="5" fill="#0f172a"/>
                      <rect x="31" y="73" width="1" height="5" fill="#0f172a"/>
                      <rect x="34" y="73" width="4" height="5" fill="#0f172a"/>
                      <rect x="40" y="73" width="2" height="5" fill="#0f172a"/>
                      <rect x="44" y="73" width="3" height="5" fill="#0f172a"/>
                      <rect x="49" y="73" width="4" height="5" fill="#0f172a"/>
                      <rect x="55" y="73" width="2" height="5" fill="#0f172a"/>
                      <rect x="59" y="73" width="5" height="5" fill="#0f172a"/>
                      <rect x="66" y="73" width="2" height="5" fill="#0f172a"/>
                      <rect x="70" y="73" width="4" height="5" fill="#0f172a"/>
                      <text x="50" y="89" fontSize="3.5" fontFamily="monospace" fill="#64748b" textAnchor="middle">FORENSIC LAB STORAGE</text>
                      <rect x="25" y="124" width="25" height="4" fill="#fbbf24"/>
                      <rect x="55" y="124" width="15" height="4" fill="#fbbf24"/>
                    </svg>
                  )}

                  {deviceType === "NVMe" && (
                    <svg className="w-20 h-28 drop-shadow-sm" viewBox="0 0 100 135" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="22" y="6" width="56" height="123" rx="3" fill="#064e3b" stroke="#047857" strokeWidth="1.5"/>
                      <rect x="28" y="125" width="20" height="4" fill="#fbbf24"/>
                      <rect x="52" y="125" width="20" height="4" fill="#fbbf24"/>
                      <circle cx="50" cy="6" r="4" fill="#f1f5f9" stroke="#047857" strokeWidth="1.5"/>
                      <rect x="30" y="24" width="40" height="25" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                      <text x="50" y="38" fontSize="4" fontFamily="monospace" fontWeight="bold" fill="#38bdf8" textAnchor="middle">PCIe Gen 4x4</text>
                      <text x="50" y="44" fontSize="3" fontFamily="monospace" fill="#94a3b8" textAnchor="middle">NVMe CONTROLLER</text>
                      <rect x="33" y="53" width="34" height="12" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                      <text x="50" y="61" fontSize="3.5" fontFamily="monospace" fill="#cbd5e1" textAnchor="middle">DRAM BUFFER</text>
                      <rect x="28" y="70" width="44" height="22" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                      <text x="50" y="82" fontSize="4" fontFamily="monospace" fontWeight="bold" fill="#fbbf24" textAnchor="middle">3D NAND FLASH</text>
                      <text x="50" y="88" fontSize="3" fontFamily="monospace" fill="#94a3b8" textAnchor="middle">HIGH DENSITY CHIP</text>
                      <rect x="28" y="96" width="44" height="22" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                      <text x="50" y="108" fontSize="4" fontFamily="monospace" fontWeight="bold" fill="#fbbf24" textAnchor="middle">3D NAND FLASH</text>
                      <text x="50" y="114" fontSize="3" fontFamily="monospace" fill="#94a3b8" textAnchor="middle">FORENSIC READOUT</text>
                    </svg>
                  )}

                  {deviceType === "FLASH" && (
                    <svg className="w-20 h-28 drop-shadow-sm" viewBox="0 0 100 135" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="30" y="38" width="40" height="85" rx="5" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
                      <rect x="34" y="44" width="32" height="50" rx="2" fill="#1e293b"/>
                      <text x="50" y="65" fontSize="5" fontFamily="sans-serif" fontWeight="bold" fill="#38bdf8" textAnchor="middle">USB 3.2</text>
                      <text x="50" y="75" fontSize="4" fontFamily="monospace" fill="#94a3b8" textAnchor="middle">FLASH MEDIA</text>
                      <rect x="35" y="10" width="30" height="28" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5"/>
                      <rect x="40" y="16" width="6" height="8" rx="1" fill="#334155"/>
                      <rect x="54" y="16" width="6" height="8" rx="1" fill="#334155"/>
                      <circle cx="50" cy="112" r="4" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                    </svg>
                  )}
                </div>

                <div className="space-y-1 max-w-[125px]">
                  <p className="text-[11px] font-serif italic text-blue-900 leading-tight">
                    “Recovering your valuable data with expertise and care.”
                  </p>
                  <div className="h-[1.5px] w-10 bg-blue-400"></div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DETAILED DIAGNOSIS FINDINGS */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1">
            <h2 className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              2. DETAILED DIAGNOSIS FINDINGS
            </h2>

            <div className="space-y-1 text-[11px] text-slate-700">
              <div className="flex">
                <span className="w-32 font-semibold text-slate-900 shrink-0">Device Condition</span>
                <span className="mr-2.5">:</span>
                <span className="text-slate-800 font-medium">{diagnosis}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold text-slate-900 shrink-0">Detected Symptoms</span>
                <span className="mr-2.5">:</span>
                <span className="text-slate-800">{symptoms}</span>
              </div>
              <div className="flex items-start">
                <span className="w-32 font-semibold text-slate-900 shrink-0">Technical Findings</span>
                <span className="mr-2.5">:</span>
                <span className="text-slate-800 leading-snug">{findings}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: ADVANCED RECOVERY ASSESSMENT */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1">
            <h2 className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              3. ADVANCED RECOVERY ASSESSMENT
            </h2>

            <div className="space-y-1 text-[11px] text-slate-700">
              <div className="flex">
                <span className="w-32 font-semibold text-slate-900 shrink-0">Recovery Method</span>
                <span className="mr-2.5">:</span>
                <span className="text-slate-800">{recoveryMethod}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold text-slate-900 shrink-0">Expected Outcome</span>
                <span className="mr-2.5">:</span>
                <span className="text-slate-800">{recoveryAssessment}</span>
              </div>
              <div className="flex items-start">
                <span className="w-32 font-semibold text-slate-900 shrink-0">Important Note</span>
                <span className="mr-2.5">:</span>
                <span className="text-slate-800 leading-snug">
                  Final recovery results can be confirmed only after completing the recovery process and verifying the recovered data.
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4 & 5: ESTIMATED RECOVERY TIME & ESTIMATED CHARGES */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* SECTION 4: ESTIMATED RECOVERY TIME */}
            <div className="space-y-1">
              <h2 className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-100">
                4. ESTIMATED RECOVERY TIME
              </h2>
              <div className="space-y-0.5 text-[11px] pt-0.5">
                <div className="flex items-center">
                  <span className="w-28 font-semibold text-slate-900">Estimated Time</span>
                  <span className="mr-2">:</span>
                  <span className="font-bold text-slate-900 text-xs">{estimatedTime}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-28 font-semibold text-slate-900">Recovery Date</span>
                  <span className="mr-2">:</span>
                  <span className="font-semibold text-blue-700 text-xs">{formatDisplayDate(recoveryDateIso)}</span>
                </div>
              </div>
              <p className="text-[9.5px] text-slate-400 italic pt-0.5 leading-tight">
                The estimated duration may vary depending on device condition and recovery process.
              </p>
            </div>

            {/* SECTION 5: ESTIMATED CHARGES */}
            <div className="space-y-1">
              <h2 className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-100">
                5. ESTIMATED CHARGES
              </h2>
              <div className="space-y-0.5 text-[11px] pt-0.5">
                <div className="flex items-center">
                  <span className="w-32 font-semibold text-slate-900">Diagnosis Charge</span>
                  <span className="mr-2">:</span>
                  <span className="font-medium text-slate-800">{diagnosisCharge} (Non-refundable)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 font-semibold text-slate-900">Final Recovery Cost</span>
                  <span className="mr-2">:</span>
                  <span className="font-black text-blue-700 text-xs">{finalRecoveryCost}</span>
                </div>
              </div>
              <p className="text-[9.5px] text-slate-400 italic pt-0.5 leading-tight">
                Final charges may vary if additional hardware complications are identified.
              </p>
            </div>
          </div>

          {/* SECTION 6: DATA SAFETY NOTE */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1">
            <h2 className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              6. DATA SAFETY NOTE
            </h2>
            <ul className="space-y-1 text-[10.5px] text-slate-700 leading-snug">
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                <span>The original device will be handled using industry-standard data recovery procedures.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                <span>No unnecessary write operations will be performed on the original media.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                <span>Please do not attempt formatting, initialization, CHKDSK, disk repair, or further power-on attempts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                <span>The recovered data will be provided on a separate storage device (client-provided or new).</span>
              </li>
            </ul>
          </div>

          {/* SECTION 7 & 8: RECOVERY RESULT & TERMS & CONDITIONS */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            
            {/* SECTION 7: RECOVERY RESULT */}
            <div className="sm:col-span-4 space-y-1.5">
              <h2 className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-100">
                7. RECOVERY RESULT
              </h2>
              <div className="space-y-1 text-[10.5px] text-slate-700 pt-0.5">
                <div className="flex">
                  <span className="w-24 font-semibold text-slate-900">Recovery Status</span>
                  <span className="mr-1.5">:</span>
                  <span className="font-bold text-amber-600">{recoveryStatus}</span>
                </div>
                <div className="flex">
                  <span className="w-24 font-semibold text-slate-900">Recovered Data</span>
                  <span className="mr-1.5">:</span>
                  <span className="font-medium text-slate-400">{recoveredData}</span>
                </div>
                <div className="flex">
                  <span className="w-24 font-semibold text-slate-900">Verification</span>
                  <span className="mr-1.5">:</span>
                  <span className="font-medium text-slate-600">{dataVerification}</span>
                </div>
              </div>
            </div>

            {/* SECTION 8: TERMS & CONDITIONS */}
            <div className="sm:col-span-8 space-y-1.5">
              <h2 className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-100">
                8. DATA RECOVERY TERMS &amp; CONDITIONS
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-700 pt-0.5 leading-snug">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px]">01</span>
                  <span>Final quote provided post-diagnosis.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px]">05</span>
                  <span>Data delivered via client or new storage.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px]">02</span>
                  <span>Recovery starts only after approval.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px]">06</span>
                  <span>Data retained 1 day, then permanently deleted.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px]">03</span>
                  <span>No Data, No Charge applies.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px]">07</span>
                  <span>Drives must be collected within 10 days.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px]">04</span>
                  <span>Full payment required before handover.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px]">08</span>
                  <span>After 10 days, company is not liable for media.</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER - EXACT CONTACT DETAILS & NO QUOTES */}
          <div className="mt-4 pt-2.5 border-t-2 border-blue-600">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-700 font-medium">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">📞 <strong>+91 6380488373</strong></span>
                <span className="flex items-center gap-1">✉ <strong>support@thedatadot.com</strong></span>
                <span className="flex items-center gap-1">🌐 <strong>www.thedatadot.com</strong></span>
                <span className="flex items-center gap-1">📍 <strong>Tiruvallur, Tamilnadu</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2 pt-1 text-[8.5px] text-slate-400 border-t border-slate-100">
              <span>Confidential: This report is intended only for the client mentioned above.</span>
              <span>Job ID: <strong className="text-slate-600 font-mono">{jobId}</strong> &nbsp;|&nbsp; Page 1 of 1</span>
            </div>
          </div>

        </section>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
