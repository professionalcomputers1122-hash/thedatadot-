"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2">
            <Link href="/" aria-label="The Data Dot home" className="inline-block">
              <Image
                src="/logo.png"
                alt="The Data Dot"
                width={160}
                height={27}
                style={{ height: "auto" }}
                className="w-[160px] brightness-0 invert"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Enterprise IT support, cybersecurity, cloud architecture, and compliance
              solutions designed for businesses worldwide.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>24/7 Monitoring &amp; SOC</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-blue-400">
                <span>15-Min Response SLA</span>
              </div>
            </div>

            {/* SOCIAL MEDIA ICONS */}
            <div className="mt-6 flex items-center gap-2.5 text-slate-400">
              <a
                href="https://www.linkedin.com/in/thedatadot/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 transition hover:border-blue-500 hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/thedatadot/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 transition hover:border-blue-500 hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
                </svg>
              </a>
              <a
                href="https://x.com/thedatadot_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 transition hover:border-blue-500 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              IT Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/services" className="transition hover:text-white">
                  Managed IT Support
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-white">
                  Cybersecurity &amp; MDR
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-white">
                  Cloud &amp; Microsoft 365
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-white">
                  Remote Technical Support
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-white">
                  Backup &amp; Disaster Recovery
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-white">
                  IT Strategy &amp; Consulting
                </Link>
              </li>
            </ul>
          </div>

          {/* INDUSTRIES */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Industries
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/industries" className="transition hover:text-white">
                  Healthcare &amp; Clinics (HIPAA)
                </Link>
              </li>
              <li>
                <Link href="/industries" className="transition hover:text-white">
                  Finance &amp; Accounting (SEC)
                </Link>
              </li>
              <li>
                <Link href="/industries" className="transition hover:text-white">
                  Legal &amp; Law Firms
                </Link>
              </li>
              <li>
                <Link href="/industries" className="transition hover:text-white">
                  Manufacturing &amp; Logistics
                </Link>
              </li>
              <li>
                <Link href="/industries" className="transition hover:text-white">
                  Education &amp; Schools (FERPA)
                </Link>
              </li>
              <li>
                <Link href="/industries" className="transition hover:text-white">
                  E-commerce &amp; Retail (PCI-DSS)
                </Link>
              </li>
            </ul>
          </div>

          {/* TRUST & ACCESS */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Trust &amp; Access
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/security" className="text-blue-400 transition hover:text-blue-300">
                  Cybersecurity Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition hover:text-white">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-white">
                  About Our Company
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-white">
                  Contact Support
                </Link>
              </li>
              <li className="pt-2 flex flex-col gap-2.5">
                {/* DATA RECOVERY LAB BUTTON */}
                <Link
                  href="/data-recovery"
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white transition hover:border-red-400 hover:text-red-300 w-fit shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                  <span className="font-bold text-white tracking-wide">Data Recovery Lab</span>
                </Link>

                <Link
                  href="/portal"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white w-fit"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Client Login</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} The Data Dot. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>SOC 2 Type II &amp; GDPR Aligned</span>
            </span>
            <Link href="/policies" className="hover:text-slate-400 transition">Privacy Policy</Link>
            <Link href="/policies" className="hover:text-slate-400 transition">Terms of Service</Link>
            <Link href="/policies" className="hover:text-slate-400 transition">Cookie Policy</Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open_cookie_preferences"));
                }
              }}
              className="hover:text-slate-300 transition text-slate-400 underline cursor-pointer"
            >
              Cookie Preferences
            </button>
            <Link href="/policies" className="hover:text-slate-400 transition">SLA</Link>
            <Link href="/data-recovery" className="hover:text-red-400 text-slate-400 font-medium transition">Data Recovery Lab</Link>
            <Link href="/portal" className="hover:text-slate-400 transition">Client Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
