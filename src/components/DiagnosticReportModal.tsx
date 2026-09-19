"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { TicketAttachment } from "@/lib/portalData";

export interface DiagnosticReportData {
  ticketId: string;
  clientName: string;
  companyName: string;
  deviceOrSubject: string;
  serialNumber?: string;
  category: string;
  priority?: string;
  status: string;
  clonedPercent?: number;
  assignedTech?: string;
  assignedBench?: string;
  symptoms?: string;
  headsHealth?: string;
  badSectorsRemapped?: number;
  temp?: string;
  notes?: string;
  createdAt?: string;
}

export interface DiagnosticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: DiagnosticReportData | null;
  onAttachReport?: (attachment: TicketAttachment) => void;
}

export default function DiagnosticReportModal({
  isOpen,
  onClose,
  reportData,
  onAttachReport,
}: DiagnosticReportModalProps) {
  const [attached, setAttached] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !reportData) return null;

  const reportNumber = `TDD-REP-${reportData.ticketId.replace(/[^a-zA-Z0-9]/g, "")}-${new Date().getFullYear()}`;
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleAttach = () => {
    if (!onAttachReport) return;
    const attachment: TicketAttachment = {
      id: `att-rep-${reportData.ticketId}-${Date.now()}`,
      name: `Cleanroom_Diagnostic_Report_${reportData.ticketId}.pdf`,
      size: "1.2 MB",
      type: "pdf",
      uploadedAt: "Just now",
      uploadedBy: reportData.assignedTech || "Lead Recovery Specialist",
    };
    onAttachReport(attachment);
    setAttached(true);
    setTimeout(() => setAttached(false), 3000);
  };

  const progress = reportData.clonedPercent || 0;
  const isResolved = reportData.status === "Resolved" || progress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto">
        {/* MODAL CONTROL HEADER (Hidden on print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Official Laboratory Diagnostic Report
              </h2>
              <p className="text-[11px] text-slate-500">
                Generated dynamically from Case #{reportData.ticketId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAttachReport && (
              <button
                type="button"
                onClick={handleAttach}
                disabled={attached}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  attached
                    ? "bg-emerald-600 text-white"
                    : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
                title="Attach this report to case files and sync to customer portal"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                <span>{attached ? "✓ Attached to Case!" : "Attach to Case Files"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              title="Close modal"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT CONTAINER */}
        <div
          ref={printRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible"
        >
          {/* 1. OFFICIAL LETTERHEAD & BRAND */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="The Data Dot"
                  width={185}
                  height={32}
                  priority
                  style={{ height: "auto" }}
                  className="w-[160px] sm:w-[185px]"
                />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-700 tracking-tight">
                ISO Class-5 Cleanroom Laboratory &amp; Forensic Hardware Recovery
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                24/7 Enterprise Incident &amp; Forensic Dispatch • Hotline: +91 6380488373
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white mb-1.5">
                Official Lab Certificate
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                TECHNICAL DIAGNOSTIC REPORT
              </h1>
              <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                Report ID: {reportNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Generated: {reportDate}
              </p>
            </div>
          </div>

          {/* 2. CASE & CLIENT METADATA GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Case / Ticket Reference
              </span>
              <span className="text-sm font-black text-blue-600 font-mono mt-0.5 block">
                #{reportData.ticketId}
              </span>
              <span className="text-[10px] text-slate-500">{reportData.category}</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Client Organization
              </span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate" title={reportData.companyName}>
                {reportData.companyName || "Private Client"}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                Attn: {reportData.clientName || "Authorized Custodian"}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Assigned Cleanroom Lead
              </span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                {reportData.assignedTech && reportData.assignedTech !== "Unassigned"
                  ? reportData.assignedTech
                  : "Senior Cleanroom Engineer"}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">
                {reportData.assignedBench || "ISO Class-5 Bench #1"}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Service Level Agreement
              </span>
              <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                {reportData.priority || "Enterprise 15-Min"} SLA
              </span>
              <span className="text-[10px] text-slate-500">
                Status: {reportData.status}
              </span>
            </div>
          </div>

          {/* 3. MEDIA HARDWARE SPECIFICATIONS */}
          <div className="py-5 border-b border-slate-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-[11px] font-bold">1</span>
              <span>Storage Media &amp; Hardware Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Media Description / Model
                </span>
                <p className="font-bold text-slate-900 mt-0.5">{reportData.deviceOrSubject}</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Serial Number
                </span>
                <p className="font-mono font-bold text-blue-700 mt-0.5">
                  {reportData.serialNumber || "N/A (Intake Tag Applied)"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reported Malfunction / Symptoms
                </span>
                <p className="font-semibold text-rose-700 mt-0.5 truncate" title={reportData.symptoms}>
                  {reportData.symptoms || "Hardware failure & non-detection"}
                </p>
              </div>
            </div>
          </div>

          {/* 4. CLEANROOM PHYSICAL & LOGICAL DIAGNOSTICS */}
          <div className="py-5 border-b border-slate-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-[11px] font-bold">2</span>
              <span>Cleanroom Optical Inspection &amp; Physical Bench Findings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">Platter Magnetic Surface</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                    Clean / No Head Rings
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Optical microscopic evaluation under high-vacuum laminar flow confirmed zero radial or circumferential gouging across primary data recording bands.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">Read/Write Head Assembly</span>
                  <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                    {reportData.headsHealth || "Donor Calibrated"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pre-amplifier circuits calibrated. Donor head micro-alignment verified against factory servo tracks to ensure zero platter drag during sector read cycles.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">Spindle Motor &amp; Bearings</span>
                  <span className="rounded-full bg-slate-100 text-slate-800 px-2 py-0.5 text-[10px] font-bold">
                    RPM Stabilized (34°C)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Spindle current nominal. Fluid dynamic bearings free of mechanical seize; spindle axis stable under thermal monitoring.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">Firmware &amp; Service Area (SA)</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                    PC-3000 Modules Patched
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Translator tables, defect lists (G-List / P-List), and ROM overlays patched to prevent drive firmware loops and timeout disconnects.
                </p>
              </div>
            </div>
          </div>

          {/* 5. SECTOR IMAGING TELEMETRY */}
          <div className="py-5 border-b border-slate-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-[11px] font-bold">3</span>
              <span>PC-3000 Hardware Mirroring &amp; Sector Telemetry</span>
            </h3>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900">
                  Raw Platter Sector Extraction Progress
                </span>
                <span className="font-black text-blue-700 font-mono text-sm">
                  {progress}% Extracted
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.max(5, progress)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-2 border-t border-blue-100 text-slate-600">
                <div>
                  <span className="text-slate-400 block">Extraction Hardware:</span>
                  <strong className="text-slate-900">ACE PC-3000 Express</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Remapped Bad Sectors:</span>
                  <strong className="text-slate-900">{reportData.badSectorsRemapped ?? 0} sectors</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Thermal Sensor:</span>
                  <strong className="text-slate-900">{reportData.temp || "34°C (Normal)"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Overall Prognosis:</span>
                  <strong className="text-emerald-700">
                    {isResolved ? "100% Recovered" : progress >= 75 ? "High (95% - 99%)" : "Favorable"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* 6. RECOVERY RECOMMENDATION & TECHNICIAN NOTES */}
          <div className="py-5 border-b border-slate-200 text-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-[11px] font-bold">4</span>
              <span>Engineering Directive &amp; File Tree Recovery Notes</span>
            </h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 leading-relaxed text-slate-700 font-mono text-[11px] whitespace-pre-line">
              {reportData.notes ||
                `• MFT master file table reconstructed successfully.\n• Critical user partition mounted on isolated forensic target station.\n• Target directories ready for checksum validation and encrypted customer handover.`}
            </div>
          </div>

          {/* 7. QUALITY CERTIFICATION & SIGN-OFF */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
            <div className="text-slate-500 text-[11px] max-w-sm">
              <p className="font-bold text-slate-800 mb-0.5">
                Protected by The Data Dot 100% Guarantee
              </p>
              <p className="leading-tight">
                No Data, No Recovery Fee policy applies. Forensic target media is encrypted with 256-bit AES BitLocker and purged 14 days after customer integrity verification.
              </p>
            </div>

            <div className="flex items-center gap-6 text-center">
              <div className="border-t border-slate-400 pt-1 w-36">
                <span className="block font-bold text-slate-900">
                  {reportData.assignedTech || "Lead Lab Specialist"}
                </span>
                <span className="text-[10px] text-slate-400">Forensic Lead Engineer</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-600/40 p-2 text-[10px] font-black uppercase text-blue-700 tracking-wider">
                <span>ISO CLASS-5 LAB</span>
                <span className="text-[8px] font-semibold text-slate-400">CERTIFIED FORENSIC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
