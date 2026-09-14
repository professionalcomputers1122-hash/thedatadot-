"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ================= EXACT SVG ICONS MATCHING USER'S REFERENCE (media_1789367387025.png) =================

// 01: Headset SVG icon
function ManagedITIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="srvHeadsetGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M6 18v-4a10 10 0 0 1 20 0v4"
        stroke="url(#srvHeadsetGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="16"
        width="5"
        height="9"
        rx="2.5"
        fill="url(#srvHeadsetGrad)"
      />
      <rect
        x="23"
        y="16"
        width="5"
        height="9"
        rx="2.5"
        fill="url(#srvHeadsetGrad)"
      />
    </svg>
  );
}

// 02: Cybersecurity Shield SVG icon
function CybersecurityIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="srvCyberGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.5L26 7.5v8c0 6.8-4.5 13.2-10 15.5-5.5-2.3-10-8.7-10-15.5v-8L16 3.5z"
        fill="url(#srvCyberGrad)"
      />
      <path
        d="M11.5 16.5l3.5 3.5 6-6.5"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 03: Cloud SVG icon
function CloudServiceIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="srvCloudGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M24 24H8.5A6.5 6.5 0 0 1 8 11a8 8 0 0 1 15.2-2.1A6 6 0 0 1 24 24z"
        fill="url(#srvCloudGrad)"
      />
    </svg>
  );
}

// 04: Networks Topology SVG icon
function NetworkServiceIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="srvNetGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="11" y="4" width="10" height="8" rx="2" fill="url(#srvNetGrad)" />
      <path
        d="M16 12v6"
        stroke="url(#srvNetGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M7 18h18"
        stroke="url(#srvNetGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M8 18v3M24 18v3"
        stroke="url(#srvNetGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="4" y="21" width="8" height="7" rx="1.8" fill="url(#srvNetGrad)" />
      <rect x="20" y="21" width="8" height="7" rx="1.8" fill="url(#srvNetGrad)" />
    </svg>
  );
}

// 05: Backup & Recovery Database SVG icon
function BackupServiceIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="srvBackupGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M5 8c0-2.2 4.9-4 11-4s11 1.8 11 4-4.9 4-11 4-11-1.8-11-4z"
        fill="url(#srvBackupGrad)"
      />
      <path
        d="M5 8v6c0 2.2 4.9 4 11 4 1.5 0 2.9-.1 4.2-.35"
        stroke="url(#srvBackupGrad)"
        strokeWidth="2.8"
        fill="none"
      />
      <path
        d="M5 14v6c0 2.2 4.9 4 11 4 1.1 0 2.1-.06 3.1-.18"
        stroke="url(#srvBackupGrad)"
        strokeWidth="2.8"
        fill="none"
      />
      <path
        d="M26.5 19.5a4.5 4.5 0 1 1-4.2 6.1"
        stroke="url(#srvBackupGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M22 19.5h4.5v4.5"
        stroke="url(#srvBackupGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 06: IT Consulting Rising Bar Chart SVG icon
function ConsultingServiceIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="srvConsultGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="5" y="19" width="5.5" height="9" rx="1.5" fill="url(#srvConsultGrad)" />
      <rect x="13.25" y="14" width="5.5" height="14" rx="1.5" fill="url(#srvConsultGrad)" />
      <rect x="21.5" y="9" width="5.5" height="19" rx="1.5" fill="url(#srvConsultGrad)" />
      <path
        d="M5 13l8-6 11-2"
        stroke="url(#srvConsultGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 5h5v5"
        stroke="url(#srvConsultGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ================= 6 CORE IT SERVICES =================
const servicesList = [
  {
    title: "Managed IT",
    subtitle: "Proactive 24/7 Monitoring & Help Desk",
    icon: <ManagedITIcon />,
    description:
      "Reliable day-to-day technology support for your team, so you can focus on running and growing your business.",
    deliverables: [
      "15-Minute average ticket response time",
      "24/7 Automated workstation & server monitoring",
      "Software patches, security updates & maintenance",
      "Dedicated, friendly engineering help desk",
    ],
    link: "/contact?service=managed-it",
  },
  {
    title: "Cybersecurity",
    subtitle: "Complete Threat & Ransomware Defense",
    icon: <CybersecurityIcon />,
    description:
      "Protect users, systems, and sensitive business data from malware, phishing, ransomware, and unauthorized intrusions.",
    deliverables: [
      "Next-Gen Endpoint Antivirus (EDR/XDR)",
      "Employee phishing awareness training",
      "Multi-Factor Authentication (MFA) enforcement",
      "Managed firewall & vulnerability detection",
    ],
    link: "/security",
  },
  {
    title: "Cloud & Microsoft 365",
    subtitle: "Modern Cloud Systems Without Complexity",
    icon: <CloudServiceIcon />,
    description:
      "Seamless cloud migration, Microsoft 365 licensing, and secure remote file access for modern and distributed teams.",
    deliverables: [
      "Seamless email & file cloud migration",
      "Microsoft 365 & Google Workspace administration",
      "Secure work-from-anywhere VPN & Zero Trust access",
      "Cloud backup, identity protection & license audits",
    ],
    link: "/contact?service=cloud",
  },
  {
    title: "Networks",
    subtitle: "Fast Business Connectivity & Wi-Fi",
    icon: <NetworkServiceIcon />,
    description:
      "Reliable business connectivity and infrastructure. Eliminate dead zones, dropped Zoom calls, and network bottlenecks.",
    deliverables: [
      "Enterprise-grade Wi-Fi 6/7 office coverage",
      "Managed switches, routers & network segmentation",
      "On-demand onsite dispatch for cabling & hardware",
      "VoIP business phone system integration",
    ],
    link: "/contact?service=networks",
  },
  {
    title: "Backup & Recovery",
    subtitle: "Automated Daily Backups & Disaster Readiness",
    icon: <BackupServiceIcon />,
    description:
      "Prepare your business for disruption and disaster with automated, encrypted backups that can be restored in minutes.",
    deliverables: [
      "Automated daily immutable cloud backups",
      "Fast 1-click system and file restoration",
      "Ransomware-proof air-gapped data retention",
      "Regular disaster recovery drill testing",
    ],
    link: "/contact?service=backup",
  },
  {
    title: "IT Consulting",
    subtitle: "Strategic Guidance & Technology Roadmaps",
    icon: <ConsultingServiceIcon />,
    description:
      "Make better technology decisions with confidence. Align IT investments with your business goals and avoid costly mistakes.",
    deliverables: [
      "Dedicated Virtual CIO (vCIO) advisory",
      "Hardware lifecycle planning & predictable budgeting",
      "Vendor contract review & software consolidation",
      "HIPAA, SOC 2 & compliance readiness audits",
    ],
    link: "/contact?service=consulting",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-[#071426]">
      {/* HEADER */}
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[450px] w-[450px] rounded-full bg-sky-50 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 text-center lg:pt-24 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Technology That Works For Your Business</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] text-[#071426] leading-tight">
              Our IT Services
            </h1>

            <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
              From everyday IT support to cybersecurity and cloud infrastructure,
              we help businesses keep technology reliable, secure, and useful.
            </p>
          </motion.div>

          {/* ================= 6 CORE SERVICE CARDS (3x2 GRID MATCHING REFERENCE) ================= */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {servicesList.map((service, idx) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
              >
                {/* DECORATIVE CURVED BLUE ARC (MATCHING USER REFERENCE) */}
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-blue-50/60 transition duration-500 group-hover:scale-150 group-hover:bg-blue-100/60" />

                <div>
                  {/* TOP ROW: ICON (LEFT) & ARROW (RIGHT) (MATCHING PANEL 3) */}
                  <div className="flex items-center justify-between">
                    {/* SOFT ROUNDED ICON CONTAINER */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/70 p-3 shadow-inner border border-blue-100/80 transition duration-300 group-hover:scale-110 group-hover:from-blue-100 group-hover:to-blue-200/60">
                      {service.icon}
                    </div>

                    <Link
                      href={service.link}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1 shadow-sm"
                      aria-label={`Learn more about ${service.title}`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                      >
                        <path
                          d="M5 12h14M12 5l7 7-7 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>

                  {/* TITLE & TAGLINE */}
                  <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#071426]">
                    {service.title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-blue-600">
                    {service.subtitle}
                  </p>

                  {/* DESCRIPTION */}
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>

                  {/* DELIVERABLES CHECKLIST */}
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      What&apos;s Included
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-xs font-medium text-slate-700"
                        >
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* BOTTOM ROW: CTA LINK */}
                <div className="relative mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                  <Link
                    href={service.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-800"
                  >
                    <span>Get Started With {service.title}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= THE DATA DOT SERVICE PROMISE & SLA BAR ================= */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Why Businesses Rely On Us
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#071426] sm:text-3xl">
              IT support built on accountability, speed, and trust
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#071426]">15-Min Response SLA</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                When you need help, you reach a dedicated certified technician immediately—no waiting on hold for hours.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#071426]">99.9% Monitored Uptime</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Automated 24/7 background monitors detect and resolve server or network problems before your team notices.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#071426]">Predictable Flat Pricing</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                One clear, flat monthly agreement covers all your support, security, and maintenance with zero surprise bills.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#071426]">Dedicated Expert Team</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Experienced, certified system engineers dedicated to your ongoing business continuity and success.
              </p>
            </div>
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
                    Speak with an IT specialist today.
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