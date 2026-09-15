"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Tech3D from "@/components/Tech3D";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchTicketsFromSupabase, fetchBlogPostsFromSupabase, Ticket } from "@/lib/portalData";

interface BlogPostItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
}

const DEFAULT_ARTICLES: BlogPostItem[] = [
  {
    id: "cybersecurity-tips",
    title: "10 Cybersecurity Tips for Small Businesses",
    category: "Cybersecurity",
    date: "Sep 10, 2026",
    readTime: "5 min read",
    image: "/images/blog/cybersecurity-tips.jpg",
    excerpt: "Practical, cost-effective defense tactics to protect workstations, employee credentials, and sensitive customer data.",
  },
  {
    id: "cloud-solutions-benefits",
    title: "The Benefits of Cloud Solutions for Growing Companies",
    category: "Cloud Solutions",
    date: "Sep 05, 2026",
    readTime: "4 min read",
    image: "/images/blog/cloud-solutions.jpg",
    excerpt: "How modern cloud infrastructure and Microsoft 365 eliminate physical server headaches and enhance remote collaboration.",
  },
  {
    id: "choose-it-partner",
    title: "How to Choose the Right IT Support Partner",
    category: "Managed IT",
    date: "Aug 28, 2026",
    readTime: "6 min read",
    image: "/images/blog/it-partner.jpg",
    excerpt: "The critical criteria to evaluate before signing an IT agreement: response SLAs, security accountability, and flat pricing.",
  },
];

export default function Home() {
  // 1. Live State for Telemetry, Tickets, and Dynamic Content
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [articles, setArticles] = useState<BlogPostItem[]>(DEFAULT_ARTICLES);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("just now");
  const [siteSettings, setSiteSettings] = useState({
    showAnnouncementBanner: true,
    announcementText: "🔴 24/7 Forensic On-Call & Incident Response Active • ISO Class-5 Lab Operational • Hotline: +91 6380488373",
    announcementLink: "/contact",
    cleanroomStatusText: "100% Operational • ISO Class-5 Cleanroom Certified",
    avgDispatchMinutes: 11,
    enableLiveTelemetryTicker: true,
    hotline: "+91 6380488373",
  });

  // 2. Load and Poll Live Telemetry & CMS Updates
  useEffect(() => {
    // Load local site settings if customized by admin
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("tdd_site_settings");
        if (savedSettings) {
          setSiteSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
        }
      } catch (e) {
        console.warn("Could not read site settings:", e);
      }
    }

    async function syncLiveData() {
      try {
        // A. Live Tickets Telemetry
        const liveTickets = await fetchTicketsFromSupabase();
        if (liveTickets && liveTickets.length > 0) {
          setTickets(liveTickets);
        }

        // B. Live Blog Posts from Admin CMS
        const livePosts = await fetchBlogPostsFromSupabase();
        if (livePosts && livePosts.length > 0) {
          const published = livePosts
            .filter((p: any) => p.status === "Published" || !p.status)
            .map((p: any) => ({
              id: p.id,
              title: p.title,
              category: p.category || "Technology",
              date: p.date || "Recent",
              readTime: p.read_time || p.readTime || "5 min read",
              image: p.cover_image || p.coverImage || "/images/blog/cybersecurity-tips.jpg",
              excerpt: p.excerpt || "Read our technical analysis and practical IT solutions.",
            }));

          if (published.length > 0) {
            // Merge with defaults to ensure at least 3 cards
            const merged = [...published, ...DEFAULT_ARTICLES].filter(
              (item, index, self) => index === self.findIndex((t) => t.id === item.id)
            ).slice(0, 3);
            setArticles(merged);
          }
        }
        setLastSyncTime("just now");
      } catch (err) {
        console.warn("Live sync error:", err);
      }
    }

    syncLiveData();
    const interval = setInterval(syncLiveData, 15000);

    // Listen to admin live settings updates
    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setSiteSettings((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("tdd_site_settings_updated", handleSettingsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("tdd_site_settings_updated", handleSettingsUpdate);
    };
  }, []);

  // Compute Live Metrics
  const resolvedCount = tickets.filter((t) =>
    (t.status || "").toLowerCase().includes("resolved")
  ).length;
  const totalCasesDisplay = 15420 + resolvedCount;
  const activeQueuedCases = tickets.filter(
    (t) => !(t.status || "").toLowerCase().includes("resolved")
  ).length;

  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* ================= 1. LIVE EMERGENCY ANNOUNCEMENT TOP BAR ================= */}
      {siteSettings.showAnnouncementBanner && !bannerDismissed && (
        <aside aria-label="Live Emergency Announcement" className="relative z-50 bg-gradient-to-r from-slate-950 via-[#071933] to-slate-950 text-white border-b border-blue-500/20 px-4 py-2.5 text-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex flex-1 items-center justify-center gap-2 text-center sm:justify-start">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="font-semibold text-slate-200 line-clamp-1">
                {siteSettings.announcementText}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={siteSettings.announcementLink}
                className="hidden sm:inline-flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2 transition"
              >
                <span>Emergency Helpdesk</span>
                <span>→</span>
              </Link>
              <button
                onClick={() => setBannerDismissed(true)}
                className="rounded p-1 text-slate-400 hover:text-white transition"
                title="Dismiss Banner"
                aria-label="Dismiss announcement banner"
              >
                ✕
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ================= 2. SITE HEADER ================= */}
      <Header />

      {/* ================= 3. LIVE LAB TELEMETRY TICKER BAR ================= */}
      {siteSettings.enableLiveTelemetryTicker && (
        <section aria-label="Live Lab Telemetry Bar" className="border-b border-slate-200/80 bg-slate-50/90 py-2.5 px-6 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="uppercase tracking-wider text-[11px] text-emerald-700 font-extrabold">
                  Live Lab Telemetry
                </span>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="text-slate-600 hidden sm:inline font-medium">
                {siteSettings.cleanroomStatusText}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-600 font-medium text-[11px]">
              <span className="hidden md:inline">
                Active Queue: <strong className="text-slate-900 font-bold">{activeQueuedCases > 0 ? activeQueuedCases : 8} cases in progress</strong>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>
                Avg SLA: <strong className="text-emerald-700 font-bold">{siteSettings.avgDispatchMinutes} Min Dispatch</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono text-[10px]">
                Auto-sync: <span className="text-blue-600 font-bold">{lastSyncTime}</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ================= 4. HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/60 to-slate-100">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          {/* LEFT COLUMN */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Reliable IT. Certified Data Recovery. Secure Business.</span>
            </div>

            <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-[44px] leading-tight">
              IT support &amp; emergency data recovery that keeps your business moving.
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
              The Data Dot delivers practical managed IT support, ISO Class-5 cleanroom data recovery,
              cybersecurity defense, cloud solutions, and rapid technology consulting
              for businesses that demand 100% operational uptime.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-xl bg-blue-600 px-7 py-4 text-center font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-xl"
              >
                Talk to Our Lab Engineers
              </Link>

              <Link
                href="/data-recovery"
                className="rounded-xl border border-slate-300 bg-white px-7 py-4 text-center font-bold text-slate-800 transition hover:border-blue-400 hover:text-blue-600 shadow-sm"
              >
                Emergency Data Recovery →
              </Link>
            </div>

            {/* LIVE DYNAMIC COUNTERS ROW */}
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200/80 pt-6">
              <div>
                <p className="text-2xl font-extrabold text-slate-950">
                  {totalCasesDisplay.toLocaleString()}+
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Verified Cases Recovered
                </p>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-emerald-600">
                  99.98%
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Recovery Success Rate
                </p>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-blue-600">
                  &lt;15m
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Emergency Response SLA
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - 3D INTERACTIVE SERVER & CLEANROOM HUD */}
          <div className="relative min-h-[480px]">
            <Tech3D />
          </div>
        </div>
      </section>

      {/* ================= 5. TRUST & COMPLIANCE BAR ================= */}
      <section className="border-y border-slate-200/80 bg-slate-50/70 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 text-center">
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span>Serving Enterprise Teams &amp; Regulated Industries</span>
          </div>

          <div className="hidden md:block h-4 w-px bg-slate-300" />

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">✓</span>
              <span><strong>SOC 2 Type II</strong> Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">✓</span>
              <span><strong>GDPR &amp; UK DPA</strong> Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">✓</span>
              <span><strong>ISO 27001 / ISO-5</strong> Standards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">✓</span>
              <span><strong>15-Min</strong> Emergency Response</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. CORE SERVICES ================= */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Core Capabilities
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              Technology and forensic recovery that works for your business
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              From everyday IT support to cleanroom hardware recovery, cybersecurity defense, and Microsoft 365 cloud infrastructure,
              we help organizations keep systems reliable, secure, and useful.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={<BackupRecoveryIcon />}
              title="Forensic Data Recovery"
              description="Certified ISO Class-5 cleanroom lab for failed hard drives, NVMe SSDs, and mission-critical enterprise RAID arrays."
              href="/data-recovery"
            />

            <ServiceCard
              icon={<HeadsetIcon />}
              title="Managed IT Support"
              description="Reliable 24/7 day-to-day helpdesk, automated device patching, and dedicated engineer support for your entire team."
              href="/services"
            />

            <ServiceCard
              icon={<CybersecurityIcon />}
              title="Cybersecurity Defense"
              description="Protect users, endpoints, and business databases from ransomware, credential harvesting, and network intrusions."
              href="/security"
            />

            <ServiceCard
              icon={<CloudIcon />}
              title="Cloud &amp; Microsoft 365"
              description="Modern cloud systems, Azure active directory identity management, and automated immutable cloud backups."
              href="/services"
            />

            <ServiceCard
              icon={<NetworkIcon />}
              title="Enterprise Networks"
              description="High-speed Wi-Fi 6E/7 architectures, hardware firewalls, and SD-WAN infrastructure engineered for uninterrupted connectivity."
              href="/services"
            />

            <ServiceCard
              icon={<ConsultingIcon />}
              title="IT Strategy &amp; vCIO"
              description="Make strategic technology decisions with confidence. Audit IT risk, forecast capital spend, and streamline compliance."
              href="/services"
            />
          </div>
        </div>
      </section>

      {/* ================= 7. WHY US ================= */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Why The Data Dot
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Technology should make business easier, not harder
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                We focus on clear communication, practical solutions, and
                security-conscious technology decisions instead of confusing buzzwords or vendor lock-in.
              </p>

              <div className="mt-8 space-y-5">
                <Benefit
                  title="Zero-Risk Recovery Guarantee"
                  text="No data recovered, no recovery fee. 100% transparent diagnostics and written evaluations."
                />
                <Benefit
                  title="Security-conscious by design"
                  text="Security is layered across physical storage, identity, devices, networks, and automated backups."
                />
                <Benefit
                  title="Clear, transparent communication"
                  text="Real-time ticket tracking, live status progress meters, and zero surprise hourly billing overages."
                />
                <Benefit
                  title="Engineered to scale"
                  text="Modular IT infrastructure and cloud setups that grow seamlessly alongside your organization."
                />
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="grid gap-5 sm:grid-cols-2">
                  <StatCard
                    number="01"
                    title="Understand"
                    text="Examine how your team operates and what data is mission-critical."
                  />
                  <StatCard
                    number="02"
                    title="Assess"
                    text="Identify hardware failure points, cybersecurity gaps, and SLA risks."
                  />
                  <StatCard
                    number="03"
                    title="Remediate"
                    text="Deploy cleanroom recovery, hardened cloud backups, and proactive defenses."
                  />
                  <StatCard
                    number="04"
                    title="Support"
                    text="Continuous 24/7 monitoring and proactive engineering maintenance."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. INDUSTRIES ================= */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Tailored Industry Support
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Specialized IT compliance &amp; recovery for regulated sectors
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                Our team meets the stringent regulatory frameworks, audit trails, and 24/7 uptime requirements of critical industries.
              </p>
            </div>

            <Link
              href="/industries"
              className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
            >
              <span>View all industries</span>
              <span>→</span>
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <IndustryCard
              title="Small &amp; Medium Businesses"
              image="/images/industries/smb.jpg.png"
            />
            <IndustryCard
              title="Professional &amp; Legal Services"
              image="/images/industries/professional-services.jpg.png"
            />
            <IndustryCard
              title="Healthcare &amp; Diagnostics"
              image="/images/industries/healthcare.jpg.png"
            />
            <IndustryCard
              title="Construction &amp; Logistics"
              image="/images/industries/construction.jpg.png"
            />
          </div>
        </div>
      </section>

      {/* ================= 9. SECURITY & TRUST ================= */}
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Security &amp; Trust
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Protect the technology your enterprise relies on
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
                True cybersecurity is not a single product. It is a defense-in-depth framework
                covering identity, devices, networks, immutable backups, and people.
              </p>
              <Link
                href="/security"
                className="mt-8 inline-flex rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/30"
              >
                Explore Security Architecture
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SecurityCard
                title="Identity &amp; Multi-Factor (MFA)"
                text="Zero-trust access policies, conditional access, and passwordless authentication."
              />
              <SecurityCard
                title="Endpoint &amp; EDR Defense"
                text="Automated anti-ransomware detection, isolate infected hosts in under 30 seconds."
              />
              <SecurityCard
                title="Firewalls &amp; Network Shields"
                text="Encrypted site-to-site VPNs, intrusion prevention systems, and deep packet inspection."
              />
              <SecurityCard
                title="Air-Gapped Cloud Backup"
                text="Immutable, tamper-proof offsite snapshots resistant to malicious deletion."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 10. HOW IT WORKS ================= */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              How It Works
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              A Transparent, Predictable Path to Reliable IT
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              From media diagnosis to 24/7 infrastructure monitoring, we ensure seamless technology with zero surprises.
            </p>
          </div>

          <div className="mt-14 relative">
            <div className="hidden md:block absolute top-12 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -z-0" />
            <div className="grid gap-6 md:grid-cols-4 relative z-10">
              <ProcessStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M8 9h8" />
                    <path d="M8 13h5" />
                  </svg>
                }
                badge="Phase 1"
                title="Discover &amp; Diagnose"
                subtitle="Zero-Obligation Intake"
                text="We evaluate your failed storage media or audit your IT stack in a zero-pressure assessment."
              />

              <ProcessStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <circle cx="12" cy="11" r="3" />
                    <path d="m14.5 13.5 2.5 2.5" />
                  </svg>
                }
                badge="Phase 2"
                title="Cleanroom Audit"
                subtitle="Forensic Inspection"
                text="In our ISO-5 cleanroom, certified engineers examine firmware, platters, and network vulnerabilities."
              />

              <ProcessStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>
                }
                badge="Phase 3"
                title="Recover &amp; Deploy"
                subtitle="Zero-Downtime Execution"
                text="Raw data extraction using PC-3000 systems or seamless deployment of hardened cloud tools."
              />

              <ProcessStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    <path d="M12 12v3" />
                    <path d="M9 13.5h6" />
                  </svg>
                }
                badge="Continuous"
                badgeColor="emerald"
                title="Protect &amp; Manage"
                subtitle="24/7 Monitoring &amp; 15-Min SLA"
                text="Engineers monitor your systems around the clock, proactively preventing outages with rapid incident response."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 11. DYNAMIC BLOG & KNOWLEDGE (LIVE CMS FEED) ================= */}
      <section className="border-b border-slate-200/80 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                <span>Live CMS &amp; Tech Insights</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Practical Technology &amp; Recovery Insights
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Actionable advice on cleanroom data recovery, cybersecurity compliance, and cloud optimization published directly by our engineering staff.
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-800"
            >
              <span>View all articles</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {articles.slice(0, 3).map((art) => (
              <BlogCard
                key={art.id}
                title={art.title}
                category={art.category}
                date={art.date}
                readTime={art.readTime}
                image={art.image}
                excerpt={art.excerpt}
                href={`/blog#${art.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= 12. READY TO GET STARTED BANNER ================= */}
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
                    Need Emergency Help or IT Consultation?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    Speak directly with a forensic data recovery specialist or certified network engineer today.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-200/90">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      15-Min Response Guarantee
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      ISO Class-5 Cleanroom Facility
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      Hotline: {siteSettings.hotline}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-xl"
                >
                  <span>Request Free Diagnostic</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>

                <Link
                  href="/portal"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/40"
                >
                  <span>Client Portal Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 13. FOOTER ================= */}
      <Footer />
    </main>
  );
}

/* ================= ICONS & CARDS ================= */

function HeadsetIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="headsetGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M6 18v-3a10 10 0 0 1 20 0v3" stroke="url(#headsetGrad)" strokeWidth="3.2" strokeLinecap="round" />
      <rect x="4" y="16" width="4.5" height="8" rx="2.25" fill="url(#headsetGrad)" />
      <rect x="23.5" y="16" width="4.5" height="8" rx="2.25" fill="url(#headsetGrad)" />
      <path d="M25 22v2a4 4 0 0 1-4 4h-3" stroke="url(#headsetGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="28" r="1.5" fill="url(#headsetGrad)" />
    </svg>
  );
}

function CybersecurityIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M16 3.5L26 7.5v8c0 6.8-4.5 13.2-10 15.5-5.5-2.3-10-8.7-10-15.5v-8L16 3.5z" fill="url(#shieldGrad)" />
      <path d="M11.5 16.5l3.5 3.5 6-6.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M23.5 24H8.5A6.5 6.5 0 0 1 8 11.02a8 8 0 0 1 15.2-2.12A6 6 0 0 1 23.5 24z" fill="url(#cloudGrad)" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="netGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="12" y="4" width="8" height="6.5" rx="2" fill="url(#netGrad)" />
      <path d="M16 10.5v6" stroke="url(#netGrad)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M7 16.5h18" stroke="url(#netGrad)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M7 16.5v5M25 16.5v5" stroke="url(#netGrad)" strokeWidth="2.8" strokeLinecap="round" />
      <rect x="3" y="21.5" width="8" height="6.5" rx="2" fill="url(#netGrad)" />
      <rect x="21" y="21.5" width="8" height="6.5" rx="2" fill="url(#netGrad)" />
    </svg>
  );
}

function BackupRecoveryIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="dbGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M5 8c0-2.2 4.9-4 11-4s11 1.8 11 4-4.9 4-11 4-11-1.8-11-4z" fill="url(#dbGrad)" />
      <path d="M5 8v6c0 2.2 4.9 4 11 4 1.5 0 2.9-.1 4.2-.35" stroke="url(#dbGrad)" strokeWidth="3.2" fill="none" />
      <path d="M5 14v6c0 2.2 4.9 4 11 4 1.1 0 2.1-.06 3.1-.18" stroke="url(#dbGrad)" strokeWidth="3.2" fill="none" />
      <path d="M26.5 19.5a4.5 4.5 0 1 1-4.2 6.1" stroke="url(#dbGrad)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22 19.5h4.5v4.5" stroke="url(#dbGrad)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ConsultingIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="4" y="19" width="5.5" height="9" rx="1.5" fill="url(#barGrad)" />
      <rect x="13.25" y="14" width="5.5" height="14" rx="1.5" fill="url(#barGrad)" />
      <rect x="22.5" y="9" width="5.5" height="19" rx="1.5" fill="url(#barGrad)" />
      <path d="M5 12l8-7 13-1" stroke="url(#barGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 4h5v5" stroke="url(#barGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  href = "/services",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-start overflow-hidden rounded-[28px] border border-blue-100/80 bg-white p-8 sm:p-9 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10"
    >
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-gradient-to-tl from-blue-100/60 via-blue-50/30 to-transparent transition-transform duration-500 group-hover:scale-125" />
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ecf3fe] border border-blue-100/60 transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-950 tracking-tight">{title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{description}</p>
      <div className="mt-6 flex h-9 w-9 items-center justify-center rounded-full bg-[#ecf3fe] text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function Benefit({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
        ✓
      </div>
      <div>
        <h3 className="font-bold text-slate-950">{title}</h3>
        <p className="mt-1 leading-6 text-slate-600 text-sm">{text}</p>
      </div>
    </div>
  );
}

function StatCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <span className="text-sm font-bold text-blue-600">{number}</span>
      <h3 className="mt-3 font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function IndustryCard({ title, image }: { title: string; image: string }) {
  return (
    <Link
      href="/industries"
      className="group relative block h-64 overflow-hidden rounded-2xl bg-slate-200"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-bold text-white text-base">{title}</h3>
        <p className="mt-1 text-xs text-slate-200">Compliance &amp; technology solutions</p>
      </div>
    </Link>
  );
}

function SecurityCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 h-2 w-10 rounded-full bg-blue-500" />
      <h3 className="font-bold text-white text-base">{title}</h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}

function ProcessStep({
  icon,
  badge,
  badgeColor = "blue",
  title,
  subtitle,
  text,
}: {
  icon: React.ReactNode;
  badge: string;
  badgeColor?: "blue" | "emerald";
  title: string;
  subtitle: string;
  text: string;
}) {
  return (
    <div className="group flex flex-col items-center rounded-3xl border border-slate-200/90 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/10">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-500 group-hover:to-blue-600">
        {icon}
      </div>
      <span
        className={`mt-5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
          badgeColor === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
        }`}
      >
        {badge}
      </span>
      <h3 className="mt-2 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-xs font-semibold text-slate-700">{subtitle}</p>
      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function BlogCard({
  title,
  category,
  date,
  readTime,
  image,
  excerpt,
  href = "/blog",
}: {
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/20">
          {category}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>{date}</span>
            <span>•</span>
            <span className="text-blue-600 font-bold">{readTime}</span>
          </div>

          <h3 className="mt-3 text-lg font-bold leading-snug text-slate-950 transition group-hover:text-blue-600 line-clamp-2">
            {title}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
            {excerpt}
          </p>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition group-hover:text-blue-800">
            <span>Read Insight</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" className="transition group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
