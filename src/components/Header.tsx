"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const otherNavLinks = [
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export default function Header({ theme = "light" }: { theme?: "light" | "dark" }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMegaOpen, setServicesMegaOpen] = useState(false);
  const [industriesMegaOpen, setIndustriesMegaOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${
        isDark
          ? "border-slate-800/80 bg-[#071426]/90 text-white"
          : "border-slate-200/80 bg-white/95 text-slate-900"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* LOGO */}
        <Link href="/" aria-label="The Data Dot home" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="The Data Dot"
            width={175}
            height={30}
            priority
            style={{ height: "auto" }}
            className={`w-[155px] sm:w-[175px] ${isDark ? "brightness-0 invert" : ""}`}
          />
        </Link>

        {/* DESKTOP NAVIGATION WITH SERVICES EXPAND MEGA MENU */}
        <nav className="hidden items-center gap-6 lg:flex">
          {/* HOME */}
          <Link
            href="/"
            className={`text-sm transition ${
              pathname === "/"
                ? "font-semibold text-blue-600"
                : isDark
                  ? "font-medium text-slate-300 hover:text-white"
                  : "font-medium text-slate-600 hover:text-blue-600"
            }`}
          >
            Home
          </Link>

          {/* ================= SERVICES EXPAND MEGA MENU TRIGGER ================= */}
          <div
            className="relative"
            onMouseEnter={() => {
              setServicesMegaOpen(true);
              setIndustriesMegaOpen(false);
            }}
            onMouseLeave={() => setServicesMegaOpen(false)}
          >
            <button
              type="button"
              onClick={() => setServicesMegaOpen(!servicesMegaOpen)}
              className={`flex items-center gap-1.5 py-7 text-sm font-medium transition cursor-pointer ${
                pathname.startsWith("/services") || servicesMegaOpen
                  ? "font-semibold text-blue-600"
                  : isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-blue-600"
              }`}
              aria-expanded={servicesMegaOpen}
            >
              <span>Services</span>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  servicesMegaOpen ? "rotate-180 text-blue-600" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* FULL-WIDTH SERVICES EXPANDED MEGA MENU PANEL */}
            {servicesMegaOpen && (
              <div
                className="fixed left-0 right-0 top-20 w-screen bg-[#14263e] text-white shadow-2xl border-t border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                onMouseEnter={() => setServicesMegaOpen(true)}
                onMouseLeave={() => setServicesMegaOpen(false)}
              >
                <div className="mx-auto max-w-7xl px-8 py-9">
                  {/* TOP BANNER */}
                  <div className="flex items-center justify-between border-b border-slate-700/70 pb-5 mb-7 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                        Enterprise Technology Solutions
                      </span>
                      <span className="text-slate-300">Explore all specialized managed IT, cloud infrastructure, and cybersecurity divisions:</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/onboarding"
                        onClick={() => setServicesMegaOpen(false)}
                        className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm"
                      >
                        Client Onboarding Intake →
                      </Link>
                      <Link
                        href="/services"
                        onClick={() => setServicesMegaOpen(false)}
                        className="text-blue-400 font-bold hover:underline"
                      >
                        Explore All Services Overview →
                      </Link>
                    </div>
                  </div>

                  {/* 4 ORGANIZED COLUMNS OF CORE IT SERVICES */}
                  <div className="grid grid-cols-4 gap-8">
                    {/* COLUMN 1: MANAGED IT SUPPORT */}
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-3 pb-2 border-b border-slate-700/60">
                        Managed IT Support
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-200">
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            24/7 Helpdesk &amp; User Support
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Proactive System Monitoring
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Remote &amp; On-Site IT Support
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Server &amp; Endpoint Patching
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Hardware Lifecycle &amp; Assets
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Dedicated Account Engineer
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 2: CLOUD & MICROSOFT 365 */}
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-3 pb-2 border-b border-slate-700/60">
                        Cloud &amp; Microsoft 365
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-200">
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Microsoft 365 Migration &amp; Licensing
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Azure Cloud Infrastructure
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Identity &amp; Multi-Factor Auth (MFA)
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Virtual Desktops &amp; Remote Work
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Cloud Security Hardening
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Cloud License Optimization
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 3: CYBERSECURITY & DEFENSE */}
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-3 pb-2 border-b border-slate-700/60">
                        Cybersecurity Defense
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-200">
                        <li>
                          <Link href="/security" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Managed Detection &amp; Response (MDR)
                          </Link>
                        </li>
                        <li>
                          <Link href="/security" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Zero Trust Identity &amp; Access
                          </Link>
                        </li>
                        <li>
                          <Link href="/security" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Endpoint &amp; Anti-Ransomware Defense
                          </Link>
                        </li>
                        <li>
                          <Link href="/security" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            SOC 2 Type II &amp; HIPAA Readiness
                          </Link>
                        </li>
                        <li>
                          <Link href="/security" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Employee Anti-Phishing Training
                          </Link>
                        </li>
                        <li>
                          <Link href="/security" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Vulnerability Assessment
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 4: NETWORKS & INFRASTRUCTURE */}
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-3 pb-2 border-b border-slate-700/60">
                        Networks &amp; Strategy
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-200">
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Business Wi-Fi 6E/7 &amp; Switching
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Enterprise Firewalls &amp; SD-WAN
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Automated Immutable Backup
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Disaster Recovery Planning
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            Structured Cabling &amp; Hardware
                          </Link>
                        </li>
                        <li>
                          <Link href="/services" onClick={() => setServicesMegaOpen(false)} className="hover:text-blue-300 hover:translate-x-1 inline-block transition">
                            IT Consulting &amp; vCIO Strategy
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* ================= INDUSTRIES EXPAND MEGA MENU TRIGGER ================= */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIndustriesMegaOpen(true);
              setServicesMegaOpen(false);
            }}
            onMouseLeave={() => setIndustriesMegaOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIndustriesMegaOpen(!industriesMegaOpen)}
              className={`flex items-center gap-1.5 py-7 text-sm font-medium transition cursor-pointer ${
                pathname.startsWith("/industries") || industriesMegaOpen
                  ? "font-semibold text-blue-600"
                  : isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-blue-600"
              }`}
              aria-expanded={industriesMegaOpen}
            >
              <span>Industries</span>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  industriesMegaOpen ? "rotate-180 text-blue-600" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* FULL-WIDTH INDUSTRIES EXPANDED MEGA MENU PANEL */}
            {industriesMegaOpen && (
              <div
                className="fixed left-0 right-0 top-20 w-screen bg-[#14263e] text-white shadow-2xl border-t border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                onMouseEnter={() => setIndustriesMegaOpen(true)}
                onMouseLeave={() => setIndustriesMegaOpen(false)}
              >
                <div className="mx-auto max-w-7xl px-8 py-9">
                  {/* TOP BANNER */}
                  <div className="flex items-center justify-between border-b border-slate-700/70 pb-5 mb-7 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                        Tailored Sector Solutions
                      </span>
                      <span className="text-slate-300">
                        Industry-specific compliance, uptime reliability, and specialized technology frameworks:
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/industries"
                        onClick={() => setIndustriesMegaOpen(false)}
                        className="text-blue-400 font-bold hover:underline"
                      >
                        Explore All Industries Overview →
                      </Link>
                    </div>
                  </div>

                  {/* 4 ORGANIZED COLUMNS OF INDUSTRIES & COMPLIANCE */}
                  <div className="grid grid-cols-4 gap-8">
                    {/* COLUMN 1: HEALTHCARE & FINANCE */}
                    <div className="space-y-6">
                      <div>
                        <Link
                          href="/industries"
                          onClick={() => setIndustriesMegaOpen(false)}
                          className="group block"
                        >
                          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/60">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition">
                              Healthcare &amp; Clinics
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                              HIPAA
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mb-2 leading-snug">
                            Patient record security, EHR/EMR uptime &amp; telehealth support.
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            <li className="hover:text-blue-300 transition">• HIPAA Audits &amp; Compliance</li>
                            <li className="hover:text-blue-300 transition">• Medical Software 24/7 Uptime</li>
                            <li className="hover:text-blue-300 transition">• Secure Telehealth Infrastructure</li>
                          </ul>
                        </Link>
                      </div>

                      <div>
                        <Link
                          href="/industries"
                          onClick={() => setIndustriesMegaOpen(false)}
                          className="group block"
                        >
                          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/60">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition">
                              Finance &amp; Accounting
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                              FINRA / SEC
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mb-2 leading-snug">
                            Bank-grade security, anti-phishing &amp; zero-downtime tax seasons.
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            <li className="hover:text-blue-300 transition">• SEC &amp; FINRA Regulatory IT</li>
                            <li className="hover:text-blue-300 transition">• Automated Cloud Backups</li>
                            <li className="hover:text-blue-300 transition">• Financial Data Encryption</li>
                          </ul>
                        </Link>
                      </div>
                    </div>

                    {/* COLUMN 2: LEGAL & EDUCATION */}
                    <div className="space-y-6">
                      <div>
                        <Link
                          href="/industries"
                          onClick={() => setIndustriesMegaOpen(false)}
                          className="group block"
                        >
                          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/60">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition">
                              Legal &amp; Law Firms
                            </h4>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded">
                              Confidential
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mb-2 leading-snug">
                            Attorney-client file encryption, secure client portals &amp; ransomware defense.
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            <li className="hover:text-blue-300 transition">• Encrypted Case Storage</li>
                            <li className="hover:text-blue-300 transition">• Secure Portal &amp; e-Signatures</li>
                            <li className="hover:text-blue-300 transition">• Legal Practice Software</li>
                          </ul>
                        </Link>
                      </div>

                      <div>
                        <Link
                          href="/industries"
                          onClick={() => setIndustriesMegaOpen(false)}
                          className="group block"
                        >
                          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/60">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition">
                              Education &amp; Schools
                            </h4>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded">
                              FERPA / CIPA
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mb-2 leading-snug">
                            Campus Wi-Fi 6E/7, safe student web filtering &amp; laptop management.
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            <li className="hover:text-blue-300 transition">• Student Web Filtering</li>
                            <li className="hover:text-blue-300 transition">• Chromebook Fleet Management</li>
                            <li className="hover:text-blue-300 transition">• Classroom Network Reliability</li>
                          </ul>
                        </Link>
                      </div>
                    </div>

                    {/* COLUMN 3: MANUFACTURING & ECOMMERCE */}
                    <div className="space-y-6">
                      <div>
                        <Link
                          href="/industries"
                          onClick={() => setIndustriesMegaOpen(false)}
                          className="group block"
                        >
                          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/60">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition">
                              Manufacturing &amp; Logistics
                            </h4>
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                              24/7 Plant
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mb-2 leading-snug">
                            Zero shop floor downtime, warehouse scanner IT &amp; supply chain ERP.
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            <li className="hover:text-blue-300 transition">• Plant Floor Network Stability</li>
                            <li className="hover:text-blue-300 transition">• Warehouse Scanners &amp; ERP</li>
                            <li className="hover:text-blue-300 transition">• Rapid Disaster Recovery</li>
                          </ul>
                        </Link>
                      </div>

                      <div>
                        <Link
                          href="/industries"
                          onClick={() => setIndustriesMegaOpen(false)}
                          className="group block"
                        >
                          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-700/60">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition">
                              E-commerce &amp; Retail
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                              PCI-DSS
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mb-2 leading-snug">
                            High-traffic speed, flash sale crash prevention &amp; payment security.
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            <li className="hover:text-blue-300 transition">• PCI-DSS Level 1 Compliance</li>
                            <li className="hover:text-blue-300 transition">• Flash Sale Traffic Protection</li>
                            <li className="hover:text-blue-300 transition">• POS &amp; Inventory Syncing</li>
                          </ul>
                        </Link>
                      </div>
                    </div>

                    {/* COLUMN 4: COMPLIANCE HIGHLIGHT CARD */}
                    <div className="rounded-2xl border border-slate-700/80 bg-[#0a1829] p-5 flex flex-col justify-between">
                      <div>
                        <span className="inline-block rounded bg-blue-500/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-400 mb-3 border border-blue-400/30">
                          Industry Compliance
                        </span>
                        <h4 className="text-sm font-bold text-white mb-2">
                          Audit-Ready Architecture
                        </h4>
                        <p className="text-xs leading-relaxed text-slate-300 mb-4">
                          We configure and maintain your IT environment strictly aligned with top regulatory frameworks.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-400">✓</span>
                            <span>HIPAA</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-400">✓</span>
                            <span>FINRA / SEC</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-400">✓</span>
                            <span>SOC 2 Type II</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-400">✓</span>
                            <span>PCI-DSS</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-400">✓</span>
                            <span>ISO 27001</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-400">✓</span>
                            <span>FERPA / CIPA</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800">
                        <Link
                          href="/industries"
                          onClick={() => setIndustriesMegaOpen(false)}
                          className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm"
                        >
                          <span>View All Industries</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* OTHER NAV LINKS: Security, FAQ, Blog, About */}
          {otherNavLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition ${
                  isActive
                    ? "font-semibold text-blue-600"
                    : isDark
                      ? "font-medium text-slate-300 hover:text-white"
                      : "font-medium text-slate-600 hover:text-blue-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/data-recovery"
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-bold transition shadow-sm ${
              isDark
                ? "border-red-500/40 bg-red-950/40 text-white hover:border-red-400"
                : "border-red-200 bg-red-50/90 text-slate-900 hover:border-red-300 hover:bg-red-100/80 hover:text-red-700"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
            </span>
            <span className="font-bold tracking-tight">Data Recovery Lab</span>
          </Link>

          <Link
            href="/portal"
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              isDark
                ? "border-slate-700 bg-slate-800/80 text-slate-200 hover:border-blue-500 hover:text-white"
                : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-600"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Client Login</span>
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span>Contact Us</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/data-recovery"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition shadow-sm ${
              isDark
                ? "border-red-500/40 bg-red-950/40 text-white"
                : "border-red-200 bg-red-50/90 text-slate-900"
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600"></span>
            </span>
            <span className="font-bold">Lab</span>
          </Link>

          <Link
            href="/portal"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-200"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Portal</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className={`rounded-lg p-2 transition ${
              isDark
                ? "text-slate-300 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      {mobileMenuOpen && (
        <div
          className={`border-b px-6 py-5 lg:hidden ${
            isDark ? "border-slate-800 bg-[#071426]" : "border-slate-200 bg-white"
          }`}
        >
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>

            {/* MOBILE SERVICES ACCORDION */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex w-full items-center justify-between text-sm font-bold text-slate-900"
              >
                <span>Services (Expand)</span>
                <svg
                  className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {mobileServicesOpen && (
                <div className="mt-3 space-y-2 border-t border-slate-200 pt-2 text-xs">
                  <Link
                    href="/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    All Managed IT Services
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cloud &amp; Microsoft 365
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Networks &amp; Infrastructure
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE INDUSTRIES ACCORDION */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
              <button
                type="button"
                onClick={() => setMobileIndustriesOpen(!mobileIndustriesOpen)}
                className="flex w-full items-center justify-between text-sm font-bold text-slate-900"
              >
                <span>Industries (Expand)</span>
                <svg
                  className={`h-4 w-4 transition-transform ${mobileIndustriesOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {mobileIndustriesOpen && (
                <div className="mt-3 space-y-2 border-t border-slate-200 pt-2 text-xs">
                  <Link
                    href="/industries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100 font-bold text-blue-600"
                  >
                    Explore All Industries Overview →
                  </Link>
                  <Link
                    href="/industries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Healthcare &amp; Clinics (HIPAA)
                  </Link>
                  <Link
                    href="/industries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Finance &amp; Accounting (FINRA / SEC)
                  </Link>
                  <Link
                    href="/industries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Legal &amp; Law Firms
                  </Link>
                  <Link
                    href="/industries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Education &amp; Schools (FERPA)
                  </Link>
                  <Link
                    href="/industries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Manufacturing &amp; Logistics
                  </Link>
                  <Link
                    href="/industries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg p-2 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    E-commerce &amp; Retail (PCI-DSS)
                  </Link>
                </div>
              )}
            </div>

            {/* OTHER NAV LINKS: Security, FAQ, Blog, About */}
            {otherNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-slate-200/80 pt-3 dark:border-slate-800 flex flex-col gap-2.5">
              <Link
                href="/data-recovery"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-bold transition shadow-sm ${
                  isDark
                    ? "border-red-500/40 bg-red-950/40 text-white"
                    : "border-red-200 bg-red-50/90 text-slate-900 hover:bg-red-100/80"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
                </span>
                <span className="font-bold tracking-tight">Data Recovery Lab</span>
              </Link>

              {/* CLIENT LOGIN BUTTON */}
              <Link
                href="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:text-blue-600"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Client Login</span>
              </Link>

              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg border border-blue-500/40 bg-blue-500/10 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 transition hover:bg-blue-500/20"
              >
                Client Onboarding &amp; SLA →
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Contact Us
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
