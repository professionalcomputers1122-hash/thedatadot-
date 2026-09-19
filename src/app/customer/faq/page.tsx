"use client";

import { useState } from "react";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";

interface FAQItem {
  id: string;
  category: "Data Recovery" | "Ticket Tracking" | "Logistics & Shipping" | "Security & NDA" | "Billing & Guarantees";
  question: string;
  answer: string;
}

const clientFAQs: FAQItem[] = [
  {
    id: "faq-1",
    category: "Data Recovery",
    question: "What is your 'No Data, No Recovery Fee' guarantee?",
    answer:
      "If our certified cleanroom engineers are unable to recover your critical target files, you do not pay any recovery fees. There are zero diagnostic bench fees, zero donor parts charges, and zero risk. You only pay after we extract your files and you verify data integrity.",
  },
  {
    id: "faq-2",
    category: "Ticket Tracking",
    question: "What do the 4 progress stages in my dashboard represent?",
    answer:
      "• Stage 1 (Media Intake): Your device is received, barcoded, logged into our secure vault, and assigned to a cleanroom specialist.\n• Stage 2 (Cleanroom Diagnostics): Certified engineers inspect mechanical donor heads, spindle motors, and platters inside our ISO Class-5 laminar flow bench.\n• Stage 3 (PC-3000 Imaging): Non-destructive raw sector mirror extraction using Ace Laboratory PC-3000 hardware systems.\n• Stage 4 (Verification & Return): File directory tree audit, client file checklist verification, and secure return dispatch.",
  },
  {
    id: "faq-3",
    category: "Ticket Tracking",
    question: "How do I download and preview laboratory diagnostic files & attachments?",
    answer:
      "On your customer dashboard or on any individual ticket page, scroll to the 'Attached Laboratory Files & Diagnostics' section. Click the eye icon on any image to preview microscopic donor head photos or cleanroom inspection logs in a high-resolution lightbox. Click the download icon to save official PDF bench reports directly to your computer.",
  },
  {
    id: "faq-4",
    category: "Data Recovery",
    question: "Why should I immediately cut power if my hard drive is clicking or grinding?",
    answer:
      "Clicking or scraping sounds indicate physical head crash: the microscopic read/write heads have dropped and are physically contacting the rapidly spinning magnetic platters. Every additional second of power scrapes away the microscopic ferromagnetic data recording layer, turning recoverable data into airborne dust. Unplug the drive immediately and do not attempt to run repair software.",
  },
  {
    id: "faq-5",
    category: "Logistics & Shipping",
    question: "How should I package my hard drive or SSD for courier pickup?",
    answer:
      "1. Place each device in an anti-static ESD shielding bag.\n2. Wrap with at least 3 to 4 layers of heavy-duty bubble wrap (minimum 2 inches of cushioning on all sides).\n3. Pack into a sturdy corrugated cardboard box (never use a padded paper envelope).\n4. Mark the box with your Ticket Reference ID (e.g. #TDD-XXXX) and address it to The Data Dot Cleanroom Intake.",
  },
  {
    id: "faq-6",
    category: "Security & NDA",
    question: "How is my confidential corporate or personal data protected during recovery?",
    answer:
      "All forensic recoveries are executed inside a biometric-restricted facility operating under strict ISO Class-5 cleanroom and HIPAA/SOC-2 security guidelines. Platter mirror images are stored on an isolated, air-gapped forensic storage array with 256-bit AES encryption. A legally binding Non-Disclosure Agreement (NDA) covers every case, and target drives are permanently purged 14 days after client verification.",
  },
  {
    id: "faq-7",
    category: "Billing & Guarantees",
    question: "How will my recovered data be returned to me?",
    answer:
      "For recoveries under 100 GB, we provide a 256-bit TLS encrypted, password-protected secure cloud download link. For recoveries exceeding 100 GB or multi-terabyte volumes, your data is transferred onto a brand-new, BitLocker-encrypted external hard drive or high-speed NVMe drive, shipped via insured priority courier or available for in-person cleanroom collection.",
  },
  {
    id: "faq-8",
    category: "Logistics & Shipping",
    question: "Can I drop off my failed media in person?",
    answer:
      "Yes. In-person handoffs are welcomed at our cleanroom reception during business hours (Monday – Saturday, 9:00 AM – 7:00 PM). For critical 24/7 emergencies, please call our emergency hotline (+91 6380488373) before arrival so cleanroom engineers can be dispatched to the intake desk.",
  },
  {
    id: "faq-9",
    category: "Data Recovery",
    question: "Can you recover data from water-damaged, dropped, or fire-damaged media?",
    answer:
      "Yes. We specialize in severe physical damage. For water-submerged drives: do NOT dry them with heat or hair dryers, as drying accelerates corrosive oxidation. Keep the media sealed in a damp ziplock bag and deliver it to our cleanroom immediately for ultrasonic platter de-contamination.",
  },
  {
    id: "faq-10",
    category: "Billing & Guarantees",
    question: "What is your emergency turnaround SLA?",
    answer:
      "Our 24/7 Emergency Cleanroom SLA provides diagnosis within 4 to 8 hours, with round-the-clock non-stop bench work by dedicated senior engineers. Standard cases typically receive full diagnostic assessment and file tree listings within 24 to 48 hours.",
  },
];

const categories = [
  "All Categories",
  "Data Recovery",
  "Ticket Tracking",
  "Logistics & Shipping",
  "Security & NDA",
  "Billing & Guarantees",
] as const;

export default function CustomerFAQPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  const filtered = clientFAQs.filter((item) => {
    const matchesCategory =
      selectedCategory === "All Categories" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* HERO SEARCH HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-3">
            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span>Client Support &amp; Cleanroom FAQ</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Clear guidance on cleanroom data recovery, ticket stage milestones, file downloads, and logistics.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-6 relative">
            <input
              type="text"
              placeholder="Search FAQs (e.g. 'clicking drive', 'attachments', 'guarantee', 'shipping')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 pl-11 text-xs shadow-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
            <svg
              className="absolute left-4 top-3.5 w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ ACCORDION LIST */}
        <div className="space-y-3.5">
          {filtered.length > 0 ? (
            filtered.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="w-full text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div>
                      <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-100 mb-1.5">
                        {faq.category}
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-slate-950">
                        {faq.question}
                      </h2>
                    </div>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-800">No matching questions found.</p>
              <p className="text-slate-400 mt-1">Try searching with a different term or browse our Knowledge Base.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All Categories");
                }}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* QUICK NAVIGATION TO KNOWLEDGE BASE & TICKET CREATION */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-slate-950">Technical Knowledge Base</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step-by-step forensic procedures, emergency hardware shut-off protocols, and cleanroom packaging guidelines.
              </p>
            </div>
            <Link
              href="/customer/knowledge-base"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Explore Knowledge Base</span>
              <span>→</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-slate-950">Have a Specific Issue?</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open a new case with our engineering lab for immediate hardware barcode intake and bench diagnostic dispatch.
              </p>
            </div>
            <Link
              href="/customer/tickets/new"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>+ Open New Support Ticket</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 24/7 HOTLINE CALLOUT */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-400/30 mb-2">
              <span>24/7 Cleanroom Laboratory Hotline</span>
            </div>
            <h3 className="text-lg font-bold">Need immediate emergency assistance?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Speak directly with an on-duty recovery engineer for immediate advice before courier dispatch.
            </p>
          </div>
          <a
            href="tel:+916380488373"
            className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition shrink-0"
          >
            Call Hotline: +91 6380488373
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
