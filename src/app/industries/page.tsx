"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const industriesList = [
  {
    title: "Healthcare",
    tagline: "HIPAA Compliance & Patient Record Security",
    image: "/images/industries/healthcare.jpg.png",
    description:
      "Protect sensitive patient records, keep clinic software running 24/7, and meet all HIPAA standards with complete peace of mind.",
    tags: [
      "HIPAA Compliance & Audits",
      "Medical Software (EHR/EMR) Uptime",
      "Secure Telehealth & Remote Care",
      "Fast 24/7 IT Help Desk for Clinics",
    ],
    badge: "HIPAA Compliant",
  },
  {
    title: "Finance & Accounting",
    tagline: "Bank-Grade Security & Fraud Protection",
    image: "/images/industries/finance.jpg",
    description:
      "Safeguard financial accounts, prevent phishing attacks, and keep your accounting systems fast and reliable during busy tax seasons.",
    tags: [
      "FINRA & SEC Regulatory Support",
      "Bank-Grade Data Encryption",
      "Zero-Downtime Tax Season Support",
      "Automated Daily Cloud Backups",
    ],
    badge: "SOC 2 Type II",
  },
  {
    title: "Legal & Law Firms",
    tagline: "Confidential Case Files & Client Portals",
    image: "/images/industries/legal.jpg",
    description:
      "Keep confidential attorney-client communications secure, stop data leaks, and access case files from court or home without risk.",
    tags: [
      "Encrypted Case File Storage",
      "Secure Client Portals & Signatures",
      "Law Practice Software Support",
      "Protection Against Ransomware",
    ],
    badge: "Strict Confidentiality",
  },
  {
    title: "Manufacturing & Logistics",
    tagline: "Zero Factory Downtime & Plant IT",
    image: "/images/industries/manufacturing.jpg",
    description:
      "Stop costly machine downtime, connect warehouse scanners and shop floor devices safely, and keep shipments moving on time.",
    tags: [
      "Plant Floor Network Reliability",
      "Warehouse Scanner & ERP Support",
      "Quick Disaster & System Recovery",
      "Cyber Protection for Equipment",
    ],
    badge: "24/7 Plant Uptime",
  },
  {
    title: "Education & Schools",
    tagline: "Campus-Wide Wi-Fi & Student Laptops",
    image: "/images/industries/education.jpg",
    description:
      "Fast, reliable Wi-Fi across classrooms, safe web filtering for students, and simple management for 1:1 Chromebooks and laptops.",
    tags: [
      "Safe Student Web Filtering (CIPA/FERPA)",
      "High-Speed Campus & Classroom Wi-Fi",
      "Easy Laptop & Tablet Management",
      "Google Classroom & Portal Support",
    ],
    badge: "FERPA Compliant",
  },
  {
    title: "E-commerce & Retail",
    tagline: "High-Traffic Websites & Payment Security",
    image: "/images/industries/ecommerce.jpg",
    description:
      "Keep your online store running fast during holiday sales surges, prevent checkout crashes, and protect customer credit card info.",
    tags: [
      "PCI-DSS Secure Checkout",
      "Crash Prevention on Flash Sales",
      "Inventory & POS Syncing",
      "Bot & Fraud Protection",
    ],
    badge: "PCI-DSS Level 1",
  },
];

const complianceBadges = [
  { name: "HIPAA", detail: "Healthcare & Patient Privacy" },
  { name: "FINRA / SEC", detail: "Finance & Accounting Standards" },
  { name: "SOC 2 Type II", detail: "Verified Security Controls" },
  { name: "ISO 27001", detail: "Global Data Protection" },
  { name: "GDPR", detail: "Consumer Privacy Protection" },
  { name: "PCI-DSS", detail: "Credit Card & Payment Safety" },
];

export default function IndustriesPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-[#071426]">
      {/* HEADER */}
      <Header />

      {/* ================= HERO SECTION (MATCHING REFERENCE DESIGN) ================= */}
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
              <span>IT Solutions Built For Your Industry</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] text-[#071426] leading-tight">
              Industries We Support
            </h1>

            <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
              Every business has unique technology challenges. Whether you run a medical clinic,
              law firm, CPA office, or warehouse, we provide fast, secure, and headache-free IT
              support built specifically for your day-to-day operations.
            </p>
          </motion.div>

          {/* ================= 6 PHOTOGRAPHIC INDUSTRY CARDS (3x2 GRID) ================= */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {industriesList.map((ind, idx) => (
              <motion.article
                key={ind.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
              >
                {/* PHOTOGRAPHIC HERO CARD WITH OVERLAY */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <Image
                    src={ind.image}
                    alt={ind.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/90 via-[#071426]/40 to-transparent" />

                  {/* BADGE ON TOP RIGHT */}
                  <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/20">
                    {ind.badge}
                  </div>

                  {/* TITLE OVER PHOTO */}
                  <div className="absolute bottom-4 left-5 right-5">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {ind.title}
                    </h2>
                    <p className="text-xs font-medium text-blue-200/90 mt-0.5">
                      {ind.tagline}
                    </p>
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {ind.description}
                    </p>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        What We Deliver
                      </p>
                      <ul className="mt-3 space-y-2">
                        {ind.tags.map((tag) => (
                          <li key={tag} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                              ✓
                            </span>
                            <span>{tag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-800"
                    >
                      <span>Explore {ind.title} Solutions</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* ================= VIEW ALL INDUSTRIES CTA BUTTON ================= */}
          <div className="mt-14 flex flex-col items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl"
            >
              <span>View All Industries</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className="text-xs text-slate-500">
              Don&apos;t see your industry? We build custom IT setups tailored to your specific business needs.
            </p>
          </div>
        </div>
      </section>

      {/* ================= REGULATORY & COMPLIANCE BAR ================= */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Security &amp; Compliance You Can Trust
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#071426] sm:text-3xl">
              Built to meet strict enterprise security and privacy standards
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {complianceBadges.map((badge) => (
              <div
                key={badge.name}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-sm font-bold text-[#071426]">{badge.name}</h3>
                <p className="mt-0.5 text-[11px] text-slate-500">{badge.detail}</p>
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
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-white">
                    Ready to Get Started?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    Let&apos;s build a more secure and productive future together. Speak with an industry IT specialist today.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-xl"
                >
                  <span>Get a Free Consultation</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
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