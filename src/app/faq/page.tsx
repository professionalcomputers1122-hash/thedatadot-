"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchFaqsFromSupabase } from "@/lib/portalData";

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceFAQCategory {
  id: string;
  name: string;
  badge: string;
  description: string;
  questions: FAQItem[];
}

const allServiceFAQCategories: ServiceFAQCategory[] = [
  {
    id: "general",
    name: "General FAQ",
    badge: "Company & Terms",
    description: "About The Data Dot, flat-rate pricing models, response SLAs, and onboarding.",
    questions: [
      {
        question: "What does The Data Dot do and who do you support?",
        answer:
          "The Data Dot provides comprehensive technology services for enterprise and growing organizations. Our divisions cover managed 24/7 IT support, enterprise cybersecurity, cloud infrastructure, network architecture, and cleanroom data recovery.",
      },
      {
        question: "How does your flat-rate billing model work?",
        answer:
          "We offer transparent, predictable monthly retainer agreements with zero surprise hourly fees. All standard helpdesk requests, proactive system maintenance, security patch cycles, and workstation monitoring are included.",
      },
      {
        question: "How quickly can you onboard our organization?",
        answer:
          "Standard onboarding is completed within 3 to 5 business days without disturbing daily staff operations. We deploy our secure monitoring agents, conduct a non-invasive infrastructure audit, and establish 24/7 emergency dispatch routes.",
      },
      {
        question: "Do you offer month-to-month contracts or long-term commitments?",
        answer:
          "We offer both flexible month-to-month agreements and annual retainer plans with discounted service rates. Our service philosophy is to earn your partnership every single month through exceptional support and 15-minute response times.",
      },
    ],
  },
  {
    id: "it-management",
    name: "IT Management & Support",
    badge: "24/7 Help Desk & SLAs",
    description: "Guaranteed SLA response times, remote diagnostics, on-site engineers, and patch management.",
    questions: [
      {
        question: "What is your guaranteed SLA response time for critical outages?",
        answer:
          "Our Enterprise SLA guarantees an engineer responds within 15 minutes, 24/7/365. Priority routing immediately escalates critical business outages, server crashes, and security alerts to Tier-3 engineers.",
      },
      {
        question: "How does 24/7 remote and on-site support work?",
        answer:
          "Over 92% of everyday user requests are resolved within minutes through our secure one-click remote desktop agent. For physical hardware malfunctions, network cabling, or server replacements, certified field technicians dispatch directly on-site.",
      },
      {
        question: "How do you manage operating system updates and security patches?",
        answer:
          "All Windows, macOS, and Linux servers/workstations receive automated patch testing and deployment outside of business hours to prevent unexpected reboot crashes or workflow interruptions.",
      },
      {
        question: "Can you support our remote and hybrid workforce?",
        answer:
          "Yes. We configure secure remote work environments, manage endpoint encryption (BitLocker/FileVault), enforce VPN/Zero-Trust tunnels, and ship pre-configured laptops directly to your employees' doorsteps.",
      },
    ],
  },
  {
    id: "network",
    name: "Network & Infrastructure",
    badge: "Wi-Fi 6E/7 & SD-WAN",
    description: "High-density enterprise Wi-Fi, managed firewalls, ISP failover, and switch architecture.",
    questions: [
      {
        question: "Can you upgrade our office Wi-Fi and eliminate dead zones?",
        answer:
          "Yes. We conduct predictive heat-map radio surveys and install high-density Wi-Fi 6E/7 access points with smart roaming, ensuring rock-solid wireless coverage for video calls, laptops, and mobile scanners.",
      },
      {
        question: "How do you protect against internet service provider (ISP) outages?",
        answer:
          "We configure enterprise firewalls with automated dual-WAN failover (such as Primary Fiber + Secondary 5G Cellular Backup). If your primary ISP drops, your network switches connections in under 2 seconds without dropping active VoIP calls or cloud sessions.",
      },
      {
        question: "Do you configure VLAN network segmentation for security?",
        answer:
          "Yes. We isolate corporate workstations, confidential financial databases, guest Wi-Fi networks, and untrusted IoT devices (printers, smart TVs, cameras) into separate VLANs to prevent lateral threat movement.",
      },
      {
        question: "Do you install and organize server racks and patch panels?",
        answer:
          "Yes. We handle complete structured cabling (Cat6/Cat6a, Fiber), cable management cleanups, server rack rebuilds, uninterruptible power supply (UPS) backups, and temperature-monitored server rooms.",
      },
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & Compliance",
    badge: "Zero Trust & Ransomware",
    description: "Ransomware isolation, endpoint EDR/XDR, phishing simulations, and HIPAA/SOC 2 readiness.",
    questions: [
      {
        question: "How do you protect our workstations against modern ransomware?",
        answer:
          "We implement layered defense: real-time behavioral endpoint detection (EDR/XDR), automated threat containment, strict access privileges, and immutable air-gapped backups to ensure business recovery without paying ransoms.",
      },
      {
        question: "Do you train employees to recognize phishing and email scams?",
        answer:
          "Yes. We conduct automated simulated phishing campaigns and deliver micro-training modules to turn your employees into a vigilant human firewall against credential harvesting and wire fraud.",
      },
      {
        question: "Can you help our business prepare for SOC 2 Type II or HIPAA audits?",
        answer:
          "Yes. We configure full encryption at rest and in transit, multi-factor authentication (MFA), immutable audit logs, screen-lock timeouts, and compliance evidence documentation to help you pass audits with zero stress.",
      },
      {
        question: "Do you perform external and internal vulnerability scans?",
        answer:
          "Yes. We perform continuous vulnerability scanning on public firewalls, open ports, web applications, and internal server operating systems to patch security flaws before cybercriminals can exploit them.",
      },
    ],
  },
  {
    id: "cloud",
    name: "Cloud & Microsoft 365",
    badge: "Azure & Productivity",
    description: "Microsoft 365 tenant migrations, cloud backup snapshots, and cloud cost governance.",
    questions: [
      {
        question: "Can you migrate our company email to Microsoft 365 without downtime?",
        answer:
          "Yes. We have performed hundreds of zero-downtime migrations from on-premise Exchange, Google Workspace, and IMAP servers to Microsoft 365 with 100% calendar, contact, and email preservation.",
      },
      {
        question: "How do you optimize cloud server expenses in Microsoft Azure?",
        answer:
          "We conduct quarterly cloud efficiency audits, downsize idle CPU/RAM resources, eliminate unattached storage volumes, apply reserved instance discounts, and schedule dev server auto-shutdowns.",
      },
      {
        question: "Do you back up Microsoft 365 data?",
        answer:
          "Yes. Microsoft does not provide native long-term backup for accidental user deletions or malicious overwrites. We configure automated cloud-to-cloud daily backups for Exchange, OneDrive, SharePoint, and Teams.",
      },
      {
        question: "Can you configure conditional access and Multi-Factor Authentication (MFA)?",
        answer:
          "Yes. We enforce phishing-resistant MFA, geofence login permissions to approved countries, and block legacy authentication protocols to stop 99.9% of automated account compromise attempts.",
      },
    ],
  },
  {
    id: "data-recovery",
    name: "Data Recovery Lab",
    badge: "ISO Class-5 Cleanroom",
    description: "Cleanroom head swaps, clicking hard drives, NVMe SSD safe-mode, and RAID reconstruction.",
    questions: [
      {
        question: "What is your 'No Data, No Recovery Fee' policy?",
        answer:
          "If our cleanroom engineers are unable to recover your critical files, you pay nothing. Zero diagnostic fees, zero parts costs, and zero risk. You only pay when we successfully extract and verify your essential data.",
      },
      {
        question: "Why must I immediately stop running a clicking or scraping hard drive?",
        answer:
          "Clicking sounds indicate that mechanical read/write heads have dropped onto the platters. Every second the drive spins, it physically scrapes the microscopic magnetic coating off the platters, turning recoverable files into airborne dust.",
      },
      {
        question: "Can you recover data from dead or unreadable NVMe SSDs?",
        answer:
          "Yes. Using specialized PC-3000 Flash and Portable III NVMe hardware, our engineers bypass locked controller safe-modes, perform chip-off forensic NAND reads, and rebuild corrupted virtual translator tables.",
      },
      {
        question: "How do you reconstruct crashed RAID 5, RAID 6, and NAS arrays?",
        answer:
          "We clone every individual drive onto write-blockers to preserve original media integrity. Then, using proprietary XOR parity algorithms, our engineers determine stripe sizes, drive order, and rebuild the volume even if multiple disks failed.",
      },
      {
        question: "Why is an ISO Class-5 cleanroom necessary for mechanical drive repair?",
        answer:
          "A single dust particle is larger than the microscopic gap between a hard drive head and its platter. Exposing open platters to normal room air causes catastrophic head crashes. Our laminar air benches maintain zero dust contamination down to 0.5 microns.",
      },
    ],
  },
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<ServiceFAQCategory[]>(allServiceFAQCategories);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const liveFaqs = await fetchFaqsFromSupabase();
        if (liveFaqs && liveFaqs.length > 0) {
          setCategories((prev) => {
            const copy = prev.map((c) => ({ ...c, questions: [...c.questions] }));
            liveFaqs.forEach((lf) => {
              const matchedCat = copy.find(
                (c) =>
                  c.name.toLowerCase() === lf.category.toLowerCase() ||
                  c.id.toLowerCase() === lf.category.toLowerCase()
              );
              if (matchedCat) {
                if (!matchedCat.questions.some((q) => q.question === lf.question)) {
                  matchedCat.questions.unshift({
                    question: lf.question,
                    answer: lf.answer,
                  });
                }
              }
            });
            return copy;
          });
        }
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      }
    }
    loadFaqs();
  }, []);

  const visibleCategories = categories.filter((cat) => {
    if (activeTab !== "all" && cat.id !== activeTab) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-50/70">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Frequently Asked Questions
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl leading-tight">
              Comprehensive Answers Across{" "}
              <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                All Services
              </span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Find technical and operational answers across our managed IT, network architecture, cybersecurity, cloud solutions, and cleanroom data recovery divisions.
            </p>

            {/* Clean Professional Search Input */}
            <div className="mt-8 mx-auto max-w-xl">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions (e.g. Wi-Fi, SLA response, ransomware, RAID)..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            {/* Professional Clean Category Filter Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                All Services
              </button>

              {allServiceFAQCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    activeTab === cat.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Accordions by Category */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 space-y-14">
          {visibleCategories.map((cat) => {
            const matchedQuestions = cat.questions.filter((q) => {
              if (!search.trim()) return true;
              return (
                q.question.toLowerCase().includes(search.toLowerCase()) ||
                q.answer.toLowerCase().includes(search.toLowerCase()) ||
                cat.name.toLowerCase().includes(search.toLowerCase())
              );
            });

            if (matchedQuestions.length === 0) return null;

            return (
              <div key={cat.id} className="scroll-mt-24" id={cat.id}>
                
                {/* Category Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 mb-2">
                      {cat.badge}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                      {cat.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {cat.description}
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400">
                    {matchedQuestions.length} Questions
                  </span>
                </div>

                {/* Accordion list with clean chevron */}
                <div className="space-y-3">
                  {matchedQuestions.map((item, idx) => (
                    <details
                      key={item.question}
                      open={idx === 0 && !search}
                      className="group rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-4 font-semibold text-slate-900 sm:px-7 text-sm sm:text-base">
                        <span className="leading-snug">{item.question}</span>

                        <span className="ml-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180 group-open:text-blue-600">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </summary>

                      <div className="border-t border-slate-100 px-6 pb-5 pt-3.5 sm:px-7">
                        <p className="text-sm leading-relaxed text-slate-600">
                          {item.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Professional Bottom CTA */}
      <section className="bg-[#071426] py-16 text-white lg:py-20 border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Have a Specific Project or Outage Inquiry?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Our engineering, network, cloud, and data recovery teams are available 24/7. Connect directly with an account engineer for technical assessments and service agreements.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row text-xs font-bold">
            <Link
              href="/contact"
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/30"
            >
              Contact Our Engineers →
            </Link>

            <Link
              href="/data-recovery"
              className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Cleanroom Lab Intake →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}