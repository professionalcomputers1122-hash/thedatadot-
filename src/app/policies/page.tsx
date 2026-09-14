"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ================= POLICY ICONS (MATCHING PANEL 9) =================

function PrivacyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CookieIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="9" r="1.5" fill="currentColor" />
      <circle cx="15" cy="8" r="1" fill="currentColor" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

function TermsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function SLAIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AcceptableUseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

// ================= THE 5 POLICIES (MATCHING PANEL 9) =================
const policiesList = [
  {
    id: "privacy",
    title: "Privacy Policy",
    subtitle: "How we collect, use and protect your data.",
    icon: <PrivacyIcon />,
    lastUpdated: "June 2026",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          At The Data Dot, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you visit our website, use our IT managed
          services, or communicate with our engineering support desk.
        </p>
        <h4 className="text-base font-bold text-[#071426]">1. Information We Collect</h4>
        <p>
          We collect information that you provide directly to us when requesting a consultation, submitting
          support tickets, or communicating with our team. This may include contact details (name, business email,
          phone number), company information, and technical network logs necessary to resolve IT support requests.
        </p>
        <h4 className="text-base font-bold text-[#071426]">2. How We Use Your Information</h4>
        <p>
          We use the information we collect to deliver, maintain, and protect our services; provide 24/7 technical
          support; fulfill contractual Service Level Agreements (SLAs); and send essential operational security notices.
          We do not sell, rent, or trade your personal or business data to third parties.
        </p>
        <h4 className="text-base font-bold text-[#071426]">3. Data Security &amp; Encryption</h4>
        <p>
          We implement enterprise-grade technical and organizational security measures, including AES-256 encryption at
          rest, TLS 1.3 encryption in transit, strict role-based access controls (RBAC), and multi-factor authentication (MFA).
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    subtitle: "Information about cookies and tracking technologies.",
    icon: <CookieIcon />,
    lastUpdated: "June 2026",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          This Cookie Policy explains how The Data Dot uses cookies and similar tracking technologies to recognize you
          when you visit our website and client portal.
        </p>
        <h4 className="text-base font-bold text-[#071426]">1. What Are Cookies?</h4>
        <p>
          Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely
          used to ensure websites function properly, maintain secure portal sessions, and provide anonymized analytical reports.
        </p>
        <h4 className="text-base font-bold text-[#071426]">2. Types of Cookies We Use</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Essential Cookies:</strong> Required for website navigation, load balancing, and authenticating support portal sessions.</li>
          <li><strong>Performance &amp; Analytics:</strong> Help us understand page load speeds and traffic patterns to optimize technical performance.</li>
          <li><strong>Functional Cookies:</strong> Remember your interface preferences (such as light/dark modes or language settings).</li>
        </ul>
        <h4 className="text-base font-bold text-[#071426]">3. Managing Cookies</h4>
        <p>
          You can adjust your browser settings to refuse or delete cookies at any time. However, disabling essential cookies may impact your ability to log into the client support portal.
        </p>
      </div>
    ),
  },
  {
    id: "terms",
    title: "Terms of Service",
    subtitle: "Rules and guidelines for using our website.",
    icon: <TermsIcon />,
    lastUpdated: "June 2026",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          These Terms of Service govern your access to and use of The Data Dot website, client portals, and related technology
          support services. By accessing our platform, you agree to be bound by these terms.
        </p>
        <h4 className="text-base font-bold text-[#071426]">1. Use of Services</h4>
        <p>
          You agree to use our services solely for lawful business purposes and in compliance with all applicable local, national,
          and international laws and cybersecurity regulations.
        </p>
        <h4 className="text-base font-bold text-[#071426]">2. Intellectual Property</h4>
        <p>
          All trademarks, software architectures, logos, text, designs, and graphics displayed on this website are the proprietary
          property of The Data Dot and protected by copyright and intellectual property laws.
        </p>
        <h4 className="text-base font-bold text-[#071426]">3. Limitation of Liability</h4>
        <p>
          To the maximum extent permitted by applicable law, The Data Dot shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages resulting from your use of or inability to access our public web portal.
        </p>
      </div>
    ),
  },
  {
    id: "sla",
    title: "SLA",
    subtitle: "Our service level commitments.",
    icon: <SLAIcon />,
    lastUpdated: "June 2026",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          Our Service Level Agreement (SLA) defines our binding performance standards, guaranteed response times, and
          system availability commitments for all managed IT clients.
        </p>
        <h4 className="text-base font-bold text-[#071426]">1. Guaranteed Response Times</h4>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
              <tr>
                <th className="p-3">Severity Level</th>
                <th className="p-3">Definition</th>
                <th className="p-3">Response SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="p-3 font-semibold text-rose-600">Critical (P1)</td>
                <td className="p-3">Total server outage, ransomware attack, or core business halt</td>
                <td className="p-3 font-bold">&lt; 15 Minutes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-amber-600">High (P2)</td>
                <td className="p-3">Major function impaired affecting multiple team members</td>
                <td className="p-3 font-bold">&lt; 30 Minutes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-blue-600">Standard (P3)</td>
                <td className="p-3">Individual user workstation issue or general software glitch</td>
                <td className="p-3 font-bold">&lt; 1 Hour</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600">Request (P4)</td>
                <td className="p-3">New user setup, equipment ordering, or routine inquiry</td>
                <td className="p-3 font-bold">&lt; 4 Hours</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h4 className="text-base font-bold text-[#071426]">2. Infrastructure Uptime Guarantee</h4>
        <p>
          We guarantee 99.9% availability for monitored core cloud infrastructure and networking equipment managed under
          our active comprehensive agreement.
        </p>
      </div>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use Policy",
    subtitle: "Guidelines for using our services.",
    icon: <AcceptableUseIcon />,
    lastUpdated: "June 2026",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          This Acceptable Use Policy (AUP) specifies actions prohibited when accessing networks, cloud tenants, and support
          systems managed by The Data Dot.
        </p>
        <h4 className="text-base font-bold text-[#071426]">1. Prohibited Network Activities</h4>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Attempting to bypass authentication mechanisms, conduct unauthorized penetration tests, or tamper with security controls.</li>
          <li>Transmitting unauthorized mass marketing (spam), phishing communications, or deceptive emails.</li>
          <li>Distributing malware, trojans, ransomware, or malicious automated scrapers.</li>
          <li>Hosting or transmitting content that infringes upon copyright, trade secrets, or intellectual property rights.</li>
        </ul>
        <h4 className="text-base font-bold text-[#071426]">2. Security Responsibility</h4>
        <p>
          Authorized users must safeguard their login credentials, enforce strong passwords, and report any suspicious network
          anomalies or potential credential compromises to our support desk immediately.
        </p>
      </div>
    ),
  },
];

export default function PoliciesPage() {
  const [selectedPolicy, setSelectedPolicy] = useState<string>("privacy");

  const activePolicy = policiesList.find((p) => p.id === selectedPolicy) || policiesList[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-[#071426]">
      {/* HEADER */}
      <Header />

      {/* ================= HERO & POLICIES LIST (MATCHING PANEL 9) ================= */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[450px] w-[450px] rounded-full bg-sky-50 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Legal Governance &amp; Compliance</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] text-[#071426] leading-tight">
              Our Policies
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Transparency and trust.
            </p>
          </motion.div>

          {/* ================= 5 POLICY CARDS (EXACT MATCH PANEL 9) ================= */}
          <div className="mt-14 mx-auto max-w-3xl space-y-4">
            {policiesList.map((policy, idx) => {
              const isSelected = selectedPolicy === policy.id;
              return (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setSelectedPolicy(policy.id);
                    const el = document.getElementById("policy-detail-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
                    isSelected
                      ? "border-blue-400 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200/90 bg-white shadow-sm hover:border-blue-300 hover:shadow-md hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    {/* BLUE CIRCLE ICON BADGE */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition duration-300 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white"
                      }`}
                    >
                      {policy.icon}
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-[#071426] sm:text-lg transition group-hover:text-blue-600">
                        {policy.title}
                      </h2>
                      <p className="text-xs text-slate-500 sm:text-sm mt-0.5">
                        {policy.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT ARROW CHEVRON */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= POLICY DETAIL VIEWER SECTION ================= */}
      <section id="policy-detail-section" className="border-b border-slate-200/80 bg-slate-50/70 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {activePolicy.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#071426]">{activePolicy.title}</h3>
                  <p className="text-xs text-slate-400">Last updated: {activePolicy.lastUpdated}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-200">
                  Active &amp; Enforced
                </span>
                <button
                  onClick={() => window.print()}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                >
                  Print / Save
                </button>
              </div>
            </div>

            <div className="mt-8">
              {activePolicy.content}
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
