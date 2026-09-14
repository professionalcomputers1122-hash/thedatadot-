"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Custom SVG Icons
function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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

function StethoscopeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

// ================= SELF-DIAGNOSIS TYPES =================
type MediaType = "hdd" | "ssd" | "raid" | "crypto" | "";
type SymptomType = "clicking" | "dead" | "raw" | "freezing" | "encrypted" | "";
type TraumaType = "dropped" | "surge" | "format" | "sudden" | "";

interface DiagnosisResult {
  category: "HEAD_CRASH" | "LOGICAL" | "PCB_SURGE" | "FIRMWARE" | "RANSOMWARE";
  severity: "CRITICAL" | "MODERATE" | "HIGH" | "URGENT";
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  subtitle: string;
  explanation: string;
  urgentWarning?: string;
  guidelines: string[];
  protocol: string;
  hardwareTools: string;
  successRate: string;
  turnaround: string;
}

export default function DataRecoveryPage() {
  // Self-Diagnosis State
  const [step, setStep] = useState<number>(1);
  const [selectedMedia, setSelectedMedia] = useState<MediaType>("");
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomType>("");
  const [selectedTrauma, setSelectedTrauma] = useState<TraumaType>("");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  // Compute Diagnosis
  const runDiagnosis = (media: MediaType, symptom: SymptomType, trauma: TraumaType) => {
    // 1. Mechanical Head Issue (Clicking, grinding, or dropped mechanical drive)
    if (symptom === "clicking" || (media === "hdd" && trauma === "dropped")) {
      setDiagnosis({
        category: "HEAD_CRASH",
        severity: "CRITICAL",
        badge: "🔴 CRITICAL PHYSICAL EMERGENCY · ISO CLASS-5 REQUIRED",
        badgeBg: "bg-red-50 border-red-200",
        badgeText: "text-red-700",
        title: "Mechanical Head Crash & Platter Contact Detected",
        subtitle: "Severe hardware failure of the read/write slider assembly or spindle motor.",
        explanation:
          "Clicking, scraping, or ticking sounds indicate that the fragile microscopic read/write heads have unseated from their air bearing and are physically brushing against the spinning magnetic platters.",
        urgentWarning:
          "CRITICAL ACTION REQUIRED: Cut power immediately. Do NOT plug this drive back in or run commercial software. Each second a clicking drive spins permanently shaves the magnetic recording layer off the platters, turning recoverable files into dust.",
        guidelines: [
          "Do not open the drive outside a certified ISO Class-5 cleanroom environment (microscopic dust particles destroy platter tracks).",
          "Do not try 'freezer' or 'tap' tricks found on YouTube — they cause fatal moisture condensation and head-gap collapse.",
          "Keep the drive in an anti-static bag and pack with at least 3 inches of bubble wrap.",
        ],
        protocol: "Cleanroom Donor Head Assembly Swap & PC-3000 Raw Platter Mirrored Extraction",
        hardwareTools: "Class 100 Laminar Clean Air Bench, Head Comb Unloaders, PC-3000 HDD Forensic Station",
        successRate: "92% – 96% (If drive was powered down quickly)",
        turnaround: "24 – 48 Hours (Rush 12-Hour Priority Available)",
      });
      setStep(4);
      return;
    }

    // 2. PCB / Power Surge / Completely Dead
    if (symptom === "dead" || trauma === "surge") {
      setDiagnosis({
        category: "PCB_SURGE",
        severity: "HIGH",
        badge: "🟡 ELECTRICAL FAILURE · COMPONENT LEVEL REPAIR",
        badgeBg: "bg-amber-50 border-amber-200",
        badgeText: "text-amber-800",
        title: "Power Surge, Blown TVS Diode, or Controller Board Burnout",
        subtitle: "The storage platters or NAND memory cells are completely intact.",
        explanation:
          "The drive fails to power on or spin because the external printed circuit board (PCB) sustained a transient voltage spike, triggering safety diodes or blowing the spindle motor controller IC.",
        urgentWarning:
          "DO NOT buy a generic replacement PCB online and screw it on. Modern storage devices possess unique adaptive calibration data stored in a specific 8-pin ROM microchip. Swapping boards without ROM transfer will cause spindle miscalibration and permanent data corruption.",
        guidelines: [
          "Hardware components on the PCB must undergo micro-soldering and thermal diode testing.",
          "ROM firmware must be desoldered and transferred to an identical donor board revision.",
          "High recovery probability because inner magnetic media or NAND flash chips were shielded from the voltage surge.",
        ],
        protocol: "Component-Level SMD Micro-Soldering, TVS Diode Isolation & ROM Firmware Calibration Transfer",
        hardwareTools: "Hot Air Rework Station, Digital Logic Analyzer, Hakko Micro-Soldering System, PC-3000 Terminal",
        successRate: "96% – 98% (Platters/NAND are undamaged)",
        turnaround: "12 – 24 Hours",
      });
      setStep(4);
      return;
    }

    // 3. Ransomware / Encryption
    if (symptom === "encrypted") {
      setDiagnosis({
        category: "RANSOMWARE",
        severity: "URGENT",
        badge: "🟣 CRYPTOGRAPHIC INVESTIGATION · ISOLATION PROTOCOL",
        badgeBg: "bg-purple-50 border-purple-200",
        badgeText: "text-purple-700",
        title: "Cryptographic Payload, BitLocker Header Loss, or Ransomware",
        subtitle: "Files are intact at the raw binary level but locked behind encrypted headers.",
        explanation:
          "Your storage device has been locked by a cryptographic cipher, ransomware extension, or corrupted encryption descriptor keys (BitLocker/LUKS/FileVault).",
        urgentWarning:
          "Immediately disconnect this drive and the host machine from all local networks and internet connections to prevent lateral spread across other company servers and NAS backups.",
        guidelines: [
          "Do not pay unverified ransom demands — attackers frequently disappear or provide broken decryptors.",
          "Do not run aggressive disk cleaners or antivirus scanners that delete encrypted file headers or restore checkpoints.",
          "Deep volume carving can often extract unencrypted shadow copies, database temp files, and previous versions.",
        ],
        protocol: "Raw Sector Carving, Volume Shadow Copy Extraction & Cryptographic Header Reconstruction",
        hardwareTools: "Deep Hex Disassembler, BitLocker Key Parser, SQL Forensic Reconstructor",
        successRate: "Case-by-case (High for partial encryption & database temp carving)",
        turnaround: "12 – 36 Hours",
      });
      setStep(4);
      return;
    }

    // 4. Firmware / Controller Lock / Bad Blocks (SSDs or hanging HDDs)
    if (symptom === "freezing" || (media === "ssd" && trauma === "sudden")) {
      setDiagnosis({
        category: "FIRMWARE",
        severity: "HIGH",
        badge: "🟠 FIRMWARE DEGRADATION · PC-3000 SPECIALIST LAB",
        badgeBg: "bg-orange-50 border-orange-200",
        badgeText: "text-orange-800",
        title: "NAND Controller Safe-Mode Lockout or Service Area Degradation",
        subtitle: "Device hangs the operating system, drops offline, or reports 0 MB capacity.",
        explanation:
          "The internal Flash Translation Layer (FTL) or hard drive Service Area (SA) has accumulated bad sectors beyond its threshold, forcing the micro-controller into panic/safe mode.",
        guidelines: [
          "Standard operating systems cannot communicate with locked controllers and will freeze or crash.",
          "Requires specialized hardware diagnostic channels to bypass the manufacturer firmware lock.",
          "Virtual translator reconstruction allows reading raw memory chips block-by-block without triggering controller panic.",
        ],
        protocol: "PC-3000 Flash Virtual Translator Building & Non-Destructive Raw Sector Mirroring",
        hardwareTools: "PC-3000 Express / Flash Lab, High-Speed Clone Station with Read-Error Tolerance",
        successRate: "90% – 94%",
        turnaround: "24 – 36 Hours",
      });
      setStep(4);
      return;
    }

    // 5. Default / Logical Case (Asks to format, accidental deletion, RAW filesystem)
    setDiagnosis({
      category: "LOGICAL",
      severity: "MODERATE",
      badge: "🟢 SAFE LOGICAL RECOVERY · HARDWARE 100% HEALTHY",
      badgeBg: "bg-emerald-50 border-emerald-200",
      badgeText: "text-emerald-800",
      title: "Logical File System Corruption, RAW Disk, or Accidental Deletion",
      subtitle: "The drive hardware, platters, and electronics are in pristine physical health.",
      explanation:
        "The file system index (NTFS MFT, APFS B-tree, EXT4 inode, or FAT directory table) was damaged during an unexpected disconnect, accidental format, or OS crash.",
      urgentWarning:
        "DO NOT download recovery software directly onto the damaged drive, and DO NOT click 'Format' when prompted by Windows. Saving new files overwrites the unallocated disk sectors where your files are still waiting.",
      guidelines: [
        "Create a 1:1 bitstream forensic image of the entire disk first before attempting any recovery.",
        "Work strictly on the secondary clone, never on the original client media.",
        "Files, photos, accounting ledgers, and database records remain 100% intact until overwritten.",
      ],
      protocol: "Write-Blocked Hex Forensic Imaging & Deep File Signature Cluster Reconstruction",
      hardwareTools: "Hardware Write-Blocker (Tableau), PC-3000 Software Suite, Hex Pattern Disassembler",
      successRate: "98%+ (If no new data has been written)",
      turnaround: "4 – 12 Hours Express",
    });
    setStep(4);
  };

  const resetDiagnosis = () => {
    setStep(1);
    setSelectedMedia("");
    setSelectedSymptom("");
    setSelectedTrauma("");
    setDiagnosis(null);
  };

  return (
    <main className="min-h-screen bg-[#fafbfd] text-slate-900 antialiased">
      {/* GLOBAL HEADER */}
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            {/* LAB BADGE */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>
              <span>Enterprise Cleanroom Recovery</span>
              <span className="text-blue-300">·</span>
              <span className="text-blue-900 font-extrabold">99.98% Success Score</span>
            </div>

            {/* MAIN HEADLINE */}
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[44px] leading-tight">
              Critical Data Recovery &amp; Decryption When It Matters Most.
            </h1>

            {/* SUBTITLE */}
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl">
              Specialized cleanroom recovery for corrupted RAID arrays, failed NVMe/SSDs, clicking hard drives, locked encrypted volumes, and damaged enterprise databases with an industry-leading <strong className="font-semibold text-slate-900">99.98% success score</strong>. Guaranteed No Data, No Recovery Fee.
            </p>

            {/* REPUTATION SUMMARY & UPWORK TOP RATED STRIP (NO INDIVIDUAL REVIEWS) */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              {/* 99.98% SUCCESS SCORE BADGE */}
              <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 shadow-xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-xs">
                  ★
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-950">99.98% Success Score</span>
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-extrabold text-blue-800">Forensic</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium">Certified Lab Recovery Rate</p>
                </div>
              </div>

              {/* UPWORK TOP RATED BADGE */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 shadow-xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#14a800] text-white font-black text-xs shadow-xs">
                  up
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-950">Upwork Top Rated</span>
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-800">100% JSS</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium">Top Rated Specialist • 50+ Contracts</p>
                </div>
              </div>

              {/* GOOGLE REVIEWS COUNT BADGE */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Google Verified</span>
                    <span className="text-xs font-extrabold text-slate-950">5.0</span>
                    <span className="text-amber-400 text-xs">★★★★★</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">50+ Enterprise Reviews</p>
                </div>
              </div>

              {/* FIVERR PRO BADGE */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1dbf73] text-white font-extrabold text-[11px]">
                  fi.
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Fiverr Pro</span>
                    <span className="text-xs font-extrabold text-slate-950">5.0</span>
                    <span className="text-amber-400 text-xs">★★★★★</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">150+ Orders • 1-Day Delivery</p>
                </div>
              </div>

              {/* NO DATA NO FEE BADGE */}
              <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-2.5 text-xs font-bold text-blue-800">
                <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                <span>No Data, No Recovery Fee</span>
              </div>
            </div>

            {/* CTAS */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#self-diagnosis"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99]"
              >
                <StethoscopeIcon className="w-4 h-4 text-blue-200" />
                <span>Start Self-Diagnosis Tool</span>
                <span>↓</span>
              </a>

              <a
                href="tel:+916380488373"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-xs transition hover:border-slate-400 hover:bg-slate-50"
              >
                <PhoneIcon className="w-4 h-4 text-blue-600" />
                <span>Call Lab Dispatch: +91 6380488373</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE SELF-DIAGNOSIS WIZARD ================= */}
      <section id="self-diagnosis" className="border-b border-slate-200/80 bg-slate-50/70 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          {/* HEADER */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 mb-3">
              <StethoscopeIcon className="w-3.5 h-3.5" />
              <span>Interactive Storage Self-Diagnosis Tool</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              Diagnose your storage failure in seconds.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Answer 3 quick questions to identify your exact failure classification (Head Crash, Logical Corruption, PCB Surge, or Firmware Lock) and see the safest immediate protocol.
            </p>
          </div>

          {/* DIAGNOSIS CARD CONTAINER */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 relative overflow-hidden">
            
            {/* PROGRESS BAR */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <span>{step < 4 ? `Step ${step} of 3` : "Diagnostic Result Ready"}</span>
                <span className="text-blue-600 font-semibold">{step === 1 ? "Storage Type" : step === 2 ? "Symptoms" : step === 3 ? "Event Context" : "Analysis Complete"}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: MEDIA TYPE */}
            {step === 1 && (
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  1. What kind of device or storage media failed?
                </h3>
                <p className="mt-1 text-xs text-slate-500 mb-6">
                  Select the storage hardware that contains your lost files or unbootable system.
                </p>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedia("hdd");
                      setStep(2);
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-xs group"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      💽
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">Mechanical Hard Drive (HDD)</h4>
                      <p className="text-xs text-slate-500 mt-1">External USB disk, desktop SATA drive, or laptop spinning disk (Seagate, WD, Toshiba).</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedia("ssd");
                      setStep(2);
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-xs group"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      ⚡
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">Solid State Drive (NVMe / SSD)</h4>
                      <p className="text-xs text-slate-500 mt-1">M.2 PCIe NVMe, SATA SSD, or Apple soldered SSD (Samsung, Crucial, SanDisk).</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedia("raid");
                      setStep(2);
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-xs group"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      🏢
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">Multi-Drive RAID / NAS / SAN</h4>
                      <p className="text-xs text-slate-500 mt-1">Synology, QNAP, Dell PowerEdge, TrueNAS, RAID 0, 1, 5, 6, 10 array failure.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedia("crypto");
                      setStep(2);
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-600 hover:bg-blue-50/40 hover:shadow-xs group"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      🔒
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">Encrypted / Flash / Database</h4>
                      <p className="text-xs text-slate-500 mt-1">BitLocker lost keys, corrupted SQL databases, USB flash sticks, or ransomware.</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SYMPTOMS */}
            {step === 2 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-950">
                    2. What physical or audible symptoms do you observe?
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    ← Back
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Select the behavior that closest matches what happened when you tried to access your files.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSymptom("clicking");
                      setStep(3);
                    }}
                    className="w-full flex items-start gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5 text-left transition hover:border-red-500 hover:bg-red-50/30 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 font-bold text-sm">
                      🔊
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-950 group-hover:text-red-700 transition">
                          Clicking, grinding, ticking, beeping, or scraping sounds
                        </h4>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          Mechanical Risk
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Drive makes audible repetitive noises, spins down after a few clicks, or beeps continuously without mounting.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSymptom("dead");
                      setStep(3);
                    }}
                    className="w-full flex items-start gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5 text-left transition hover:border-amber-500 hover:bg-amber-50/30 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-sm">
                      🔌
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-950 group-hover:text-amber-800 transition">
                          Completely dead: No power, no spin, no LED, or burnt smell
                        </h4>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Electrical PCB
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Device does not draw power or register in BIOS/Device Manager. Often happens after power surge or wrong power adapter.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSymptom("raw");
                      setStep(3);
                    }}
                    className="w-full flex items-start gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5 text-left transition hover:border-emerald-500 hover:bg-emerald-50/30 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm">
                      💻
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-950 group-hover:text-emerald-800 transition">
                          Recognized, but asks to format, shows RAW filesystem, or files deleted
                        </h4>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Logical Case
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Drive spins smoothly and quietly, but operating system reports &ldquo;You need to format the disk before you can use it&rdquo;.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSymptom("freezing");
                      setStep(3);
                    }}
                    className="w-full flex items-start gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5 text-left transition hover:border-orange-500 hover:bg-orange-50/30 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-800 font-bold text-sm">
                      ⚠️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-950 group-hover:text-orange-800 transition">
                          Freezes computer on plug-in, read errors, or drops offline
                        </h4>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                          Bad Blocks / Firmware
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        File transfer freezes at 99%, Windows Explorer crashes, or NVMe SSD disappears from file manager midway.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSymptom("encrypted");
                      setStep(3);
                    }}
                    className="w-full flex items-start gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5 text-left transition hover:border-purple-500 hover:bg-purple-50/30 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold text-sm">
                      🔒
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-950 group-hover:text-purple-800 transition">
                          Files encrypted with strange extensions or ransom notice left
                        </h4>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                          Ransomware
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Documents and photos renamed with random alphanumeric extensions and instructions to pay.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONTEXT / TRAUMA */}
            {step === 3 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-950">
                    3. What happened right before the failure occurred?
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    ← Back
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Understanding what triggered the incident allows our engineers to calculate the precise forensic procedure.
                </p>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrauma("dropped");
                      runDiagnosis(selectedMedia, selectedSymptom, "dropped");
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-600 hover:bg-blue-50/40 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      💥
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">Physical Shock / Dropped</h4>
                      <p className="text-xs text-slate-500 mt-1">Drive fell from a desk, was bumped while writing, or experienced liquid spill.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrauma("surge");
                      runDiagnosis(selectedMedia, selectedSymptom, "surge");
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-600 hover:bg-blue-50/40 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      ⚡
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">Power Surge / Outage</h4>
                      <p className="text-xs text-slate-500 mt-1">Sudden blackouts, generator switch, thunderstorm, or wrong laptop charger.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrauma("format");
                      runDiagnosis(selectedMedia, selectedSymptom, "format");
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-600 hover:bg-blue-50/40 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      🔄
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">Accidental Format / OS Reinstall</h4>
                      <p className="text-xs text-slate-500 mt-1">Selected wrong partition during Windows/macOS install, or emptied trash.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrauma("sudden");
                      runDiagnosis(selectedMedia, selectedSymptom, "sudden");
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-600 hover:bg-blue-50/40 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      ❓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">Sudden Natural Failure</h4>
                      <p className="text-xs text-slate-500 mt-1">Worked normally yesterday, but ceased working on boot with no trauma.</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: FINAL DIAGNOSTIC RESULT */}
            {step === 4 && diagnosis && (
              <div className="space-y-6">
                {/* RESULT HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${diagnosis.badgeBg} ${diagnosis.badgeText}`}>
                      {diagnosis.badge}
                    </div>
                    <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                      {diagnosis.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600">
                      {diagnosis.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetDiagnosis}
                    className="self-start sm:self-center shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    ↺ Restart Diagnosis
                  </button>
                </div>

                {/* URGENT WARNING BANNER (IF CRITICAL OR WARNING) */}
                {diagnosis.urgentWarning && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 text-xs sm:text-sm text-red-900 flex items-start gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Immediate Action Warning:</strong> {diagnosis.urgentWarning}
                    </div>
                  </div>
                )}

                {/* DETAILED EXPLANATION */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
                    Forensic Engineering Assessment
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {diagnosis.explanation}
                  </p>

                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Critical Safeguards to Preserve Your Data:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {diagnosis.guidelines.map((g, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SPECIFICATIONS & TURNAROUND GRID */}
                <div className="grid gap-4 sm:grid-cols-3 text-xs">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Required Lab Protocol</span>
                    <p className="mt-1 font-bold text-slate-900">{diagnosis.protocol}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Estimated Recovery Probability</span>
                    <p className="mt-1 font-extrabold text-emerald-600 text-sm">{diagnosis.successRate}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Standard Turnaround</span>
                    <p className="mt-1 font-bold text-blue-600">{diagnosis.turnaround}</p>
                  </div>
                </div>

                {/* ACTION CALLOUT */}
                <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-400 border border-blue-400/30 mb-2">
                      Priority Cleanroom Intake Open
                    </span>
                    <h4 className="text-lg sm:text-xl font-bold text-white">
                      Ready to recover your critical files?
                    </h4>
                    <p className="mt-1 text-xs text-slate-300 max-w-md">
                      Protected by our strict <strong>No Data, No Recovery Fee</strong> guarantee. You pay nothing if files cannot be retrieved.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <a
                      href="tel:+916380488373"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      <span>Call Lab: +91 6380488373</span>
                    </a>

                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-xs font-semibold text-white hover:border-blue-400 transition text-center"
                    >
                      <span>Request Free Intake Ticket →</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ================= 6 DETAILED RECOVERY CAPABILITIES ================= */}
      <section className="border-b border-slate-200/80 bg-white py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Capabilities</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              What we recover for businesses &amp; teams
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Decades of combined engineering experience recovering unbootable servers, corrupted volumes, and physically degraded media.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* CAPABILITY 1 */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-950">RAID, NAS &amp; SAN Servers</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Recovery for RAID 0, 1, 5, 6, 10, multiple disk dropouts, failed array rebuilds, and corrupted storage volumes from Synology, QNAP, Dell EMC, and HPE.
              </p>
            </div>

            {/* CAPABILITY 2 */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><rect x="9" y="11" width="6" height="5" rx="1" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-950">Decryption &amp; Corrupted Files</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Advanced cryptographic extraction, BitLocker keys, ransomware decryptors, corrupted zip archives, and raw partition reconstruction.
              </p>
            </div>

            {/* CAPABILITY 3 */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h10v10H7z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-950">SSDs, NVMe &amp; Flash Media</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Specialized recovery for dead controller chips, bad NAND blocks, unmountable solid-state drives, firmware corruption, and monolithic flash storage.
              </p>
            </div>

            {/* CAPABILITY 4 */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-950">Hard Drives &amp; External Disks</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Mechanical head replacement in Class 100 clean environments, clicking drives, motor seizure repairs, dropped drives, and bad sector extraction.
              </p>
            </div>

            {/* CAPABILITY 5 */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-950">Databases &amp; Accounting Files</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Recovery for Microsoft SQL Server (.mdf), QuickBooks (.qbw), MySQL, PostgreSQL, Oracle, and customer transaction databases.
              </p>
            </div>

            {/* CAPABILITY 6 */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-950">Virtual Machines &amp; Cloud</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                VMware ESXi VMFS volumes, Microsoft Hyper-V VHDX files, damaged cloud storage snapshots, and unmountable virtual drives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP RECOVERY PROCESS ================= */}
      <section className="border-b border-slate-200/80 bg-slate-50/60 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Forensic Workflow</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              How our data recovery process works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Predictable, secure, and achieving an industry-high 99.98% recovery success score from diagnosis to secure delivery.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                01
              </div>
              <h3 className="text-base font-bold text-slate-950">Free Diagnostic</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Our engineers inspect your hardware or corrupt files to identify the issue and verify what data can be saved.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                02
              </div>
              <h3 className="text-base font-bold text-slate-950">Upfront Fixed Quote</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                You receive a flat-rate price with zero hidden fees. Protected by our No Data, No Recovery Fee guarantee.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                03
              </div>
              <h3 className="text-base font-bold text-slate-950">Clean Extraction</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Certified clean-bench diagnostics and cryptographic tools restore your files, photos, ledgers, and raw partitions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                04
              </div>
              <h3 className="text-base font-bold text-slate-950">Secure Return</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Files are returned via encrypted media or secure high-speed cloud link only after you confirm data integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NO DATA NO FEE GUARANTEE CALLOUT ================= */}
      <section className="bg-slate-950 py-16 px-6 text-white relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-[#0a1e38] to-slate-950 p-8 text-center shadow-2xl sm:flex-row sm:p-12 sm:text-left">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-600/30 text-2xl font-bold text-blue-400">
              <ShieldCheckIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-0.5 text-[11px] font-bold text-blue-300 mb-2">
                <span>Certified 99.98% Recovery Success Score</span>
              </div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">No Data, No Recovery Fee Guarantee</h3>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                Backed by our industry-leading 99.98% recovery success score. If our specialists cannot recover your critical files, you pay absolutely nothing. Zero diagnostic loopholes. Zero financial risk for your business.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="tel:+916380488373"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Call: +91 6380488373</span>
            </a>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-xs font-semibold text-white transition hover:border-blue-400 hover:bg-slate-800"
            >
              Request Free Intake
            </Link>
          </div>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <Footer />
    </main>
  );
}

