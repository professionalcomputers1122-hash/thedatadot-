"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ================= 5 SECURITY DEFENSE FEATURES (MATCHING PANEL 5) =================

function ThreatProtectionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function DataEncryptionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function AccessControlIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}

function ComplianceReadyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function SecurityAuditsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="m8 11 2 2 4-4" />
    </svg>
  );
}

const coreSecurityFeatures = [
  {
    title: "Advanced Threat Protection",
    description: "Proactive monitoring and automated threat detection.",
    icon: <ThreatProtectionIcon />,
  },
  {
    title: "Data Encryption",
    description: "Your sensitive data is always secure in transit and at rest.",
    icon: <DataEncryptionIcon />,
  },
  {
    title: "Access Control",
    description: "Role-based access, least-privilege policies, and multi-factor authentication.",
    icon: <AccessControlIcon />,
  },
  {
    title: "Compliance Ready",
    description: "Full support for GDPR, HIPAA, SOC 2, and rigorous industry standards.",
    icon: <ComplianceReadyIcon />,
  },
  {
    title: "Regular Security Audits",
    description: "Continuous vulnerability scanning and proactive posture improvement.",
    icon: <SecurityAuditsIcon />,
  },
];

const complianceStandards = [
  {
    name: "HIPAA",
    label: "Healthcare & Patient Data",
    detail: "Zero-exposure EHR/EMR safeguards, encrypted communications, and audit trails.",
  },
  {
    name: "SOC 2 Type II",
    label: "Security & Confidentiality",
    detail: "Audited operational controls verifying data integrity, access governance, and privacy.",
  },
  {
    name: "ISO/IEC 27001",
    label: "Information Security Management",
    detail: "Structured risk mitigation and security management adhering to international standards.",
  },
  {
    name: "PCI-DSS",
    label: "Payment & Cardholder Safety",
    detail: "Hardened checkout gateways, network tokenization, and recurring vulnerability testing.",
  },
  {
    name: "GDPR",
    label: "Global Data Privacy",
    detail: "Technical and organizational measures (TOMs) ensuring complete user privacy protection.",
  },
  {
    name: "NIST CSF",
    label: "Cybersecurity Framework",
    detail: "Continuous alignment with Center for Internet Security (CIS) and NIST guidelines.",
  },
];

const defenseLifecycle = [
  {
    step: "01",
    title: "Assess & Audit",
    text: "We scan your digital perimeter, inspect access privileges, and uncover unpatched vulnerabilities across devices and cloud setups.",
  },
  {
    step: "02",
    title: "Shield & Enforce",
    text: "We deploy next-generation endpoint antivirus, mandate Multi-Factor Authentication, and close risky cloud loopholes.",
  },
  {
    step: "03",
    title: "Monitor & Hunt",
    text: "Our 24/7 security center analyzes real-time activity, flagging and neutralizing suspicious login attempts and anomalies.",
  },
  {
    step: "04",
    title: "Contain & Recover",
    text: "If an unexpected event occurs, devices are quarantined immediately and clean-room backups restore operations in minutes.",
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-[#071426]">
      {/* HEADER */}
      <Header />

      {/* ================= HERO SECTION (MATCHING PANEL 5 OF REFERENCE) ================= */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[450px] w-[450px] rounded-full bg-sky-50 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          {/* HEADER TITLE & SUBTITLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Enterprise Cybersecurity &amp; Compliance</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] text-[#071426] leading-tight">
              Security &amp; Compliance
            </h1>

            <p className="mt-4 text-xl font-semibold text-blue-600 sm:text-2xl">
              Your data. Our priority.
            </p>

            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              We protect your workstations, cloud environments, and sensitive client information
              with layered, enterprise-grade defense built for zero downtime and total peace of mind.
            </p>
          </motion.div>

          {/* TWO COLUMN CONTENT: 5 CORE FEATURES (LEFT) + GLOWING CYBER SHIELD (RIGHT) */}
          <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LEFT COLUMN: 5 CORE DEFENSE FEATURES */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              {coreSecurityFeatures.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ x: 6 }}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                    {item.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#071426] tracking-tight transition group-hover:text-blue-600">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* RIGHT COLUMN: GLOWING CYBER SHIELD 3D GRAPHIC */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative aspect-square w-full max-w-[480px] overflow-hidden rounded-3xl border border-blue-500/30 bg-[#071426] shadow-2xl shadow-blue-600/20">
                <Image
                  src="/images/security/cyber-shield.jpg"
                  alt="Glowing cyber defense shield and padlock"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover transition duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>

          {/* ================= CALLOUT BOX: A MORE SECURE TOMORROW ================= */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-[#071426] via-[#092244] to-[#071426] p-8 sm:p-10 text-white shadow-xl border border-blue-500/30"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-400/40">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    A More Secure Tomorrow
                  </h2>
                  <p className="mt-1 text-sm text-slate-300 sm:text-base">
                    Security is not an option, it&apos;s a foundation.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-xl"
                >
                  <span>Our Security Approach</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= COMPLIANCE STANDARDS BAR ================= */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Regulatory Standards &amp; Certifications
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#071426] sm:text-3xl">
              Engineered for strict industry regulatory compliance
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {complianceStandards.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 border border-blue-100">
                  {item.name}
                </span>
                <h3 className="mt-3 text-base font-bold text-[#071426]">
                  {item.label}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4-STAGE DEFENSE LIFECYCLE ================= */}
      <section className="py-20 px-6 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              How We Protect You
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#071426] sm:text-3xl">
              The 4-stage cybersecurity defense lifecycle
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {defenseLifecycle.map((stage) => (
              <div
                key={stage.step}
                className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-blue-300 hover:bg-white hover:shadow-lg"
              >
                <span className="text-2xl font-black text-blue-600">
                  {stage.step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#071426]">
                  {stage.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {stage.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= READY TO GET STARTED GLOBAL BANNER ================= */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071426] via-[#092244] to-[#071426] p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
            <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />

            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-white">
                    Ready to Get Started?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    Let&apos;s build a more secure and productive future together.
                    Speak with an IT security specialist today.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-xl"
                >
                  <span>Get a Free Consultation</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}