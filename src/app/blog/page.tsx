"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WordReveal from "@/components/WordReveal";
import { fetchBlogPostsFromSupabase, getDeletedBlogIds } from "@/lib/portalData";

// ================= ARTICLES (PRIMARY 3 MATCHING PANEL 7 EXACTLY) =================
const primaryArticles = [
  {
    id: "cybersecurity-tips",
    title: "10 Cybersecurity Tips for Small Businesses",
    category: "Cybersecurity",
    date: "Sep 10, 2026",
    readTime: "5 min read",
    image: "/images/blog/cybersecurity-tips.jpg",
    excerpt:
      "Practical, cost-effective defense tactics to protect your workstations, employee credentials, and sensitive customer data against modern ransomware and phishing.",
    content: `Small businesses are currently the prime target for automated ransomware attacks. Cybercriminals understand that smaller firms often lack dedicated full-time security operation teams, making them vulnerable to credential stuffing and phishing lures.

### 1. Mandatory Multi-Factor Authentication (MFA)
Enable MFA across Microsoft 365, Google Workspace, and every cloud console. Authenticator apps with number-matching prevent push fatigue and block 99% of automated credential attacks.

### 2. DNS-Layer Content Filtering
Deploying DNS-level shields (such as Cloudflare Gateway or Cisco Umbrella) prevents employees from accidentally resolving known phishing, command-and-control, or malicious ransomware domains.

### 3. Endpoint Detection & Response (EDR)
Traditional legacy antivirus looking for file hashes is obsolete against fileless malware and PowerShell injectors. Modern AI-driven EDR isolates infected workstations within seconds before threat actors can pivot laterally.

### 4. Zero-Trust Access & Least Privilege
Never permit users to operate daily workstations with local administrator rights. Restricting privilege escalation prevents downloaded payloads from installing persistence services.

### 5. Automated Patch Verification
Outdated operating systems, VPN appliances, and web browsers represent the single biggest vulnerability vector. Continuous automated patching ensures zero-day vulnerabilities are closed proactively.`,
  },
  {
    id: "cloud-solutions-benefits",
    title: "The Benefits of Cloud Solutions for Growing Companies",
    category: "Cloud Solutions",
    date: "Sep 05, 2026",
    readTime: "4 min read",
    image: "/images/blog/cloud-solutions.jpg",
    excerpt:
      "How modern cloud infrastructure and Microsoft 365 eliminate physical server headaches, enhance remote collaboration, and scale effortlessly with your team.",
    content: `Migrating legacy on-premise physical servers to modern hybrid cloud environments eliminates catastrophic single points of failure, reduces utility costs, and provides seamless enterprise-grade redundancy.

### Eliminate Capital Server Upgrades
Traditional server hardware requires major capital replacements every 3–5 years, alongside expensive UPS battery backups, HVAC cooling, and maintenance contracts. Cloud infrastructure shifts IT spending from unpredictable capital expenses to predictable operational spending.

### Seamless Distributed Collaboration
With Microsoft 365 and cloud-native file storage, distributed teams access files, spreadsheets, and databases securely from any verified device with granular tenant protection.

### Rapid Disaster Recovery & Redundancy
Cloud environments feature built-in geo-redundant snapshots. If a local workstation suffers physical damage, employees can sign in to a virtual cloud workspace and resume productive operations immediately.`,
  },
  {
    id: "choose-it-partner",
    title: "How to Choose the Right IT Support Partner",
    category: "Managed IT",
    date: "Aug 28, 2026",
    readTime: "6 min read",
    image: "/images/blog/it-partner.jpg",
    excerpt:
      "The critical criteria to evaluate before signing an IT agreement: guaranteed response SLAs, proactive security monitoring, and predictable flat-rate billing.",
    content: `Choosing an outsourced IT partner is one of the most critical operational decisions for any modern company. The difference between an ordinary reactive break-fix technician and an enterprise Managed Service Provider (MSP) is night and day.

### 1. Contractually Guaranteed SLAs
Look for clear, written Service Level Agreements with response times under 15 minutes for critical outages. Avoid providers who offer vague "best effort" responses without financial penalties for missed targets.

### 2. Proactive Monitoring vs. Reactive Repair
Your IT partner should be resolving issues before your staff even notices them. Real-time telemetry on hard drive health, thermal thresholds, and network latency stops downtime before it begins.

### 3. Transparent Flat-Rate Support
Unexpected billing overages erode trust. Top-tier providers offer transparent, per-seat monthly agreements that cover all routine support, preventative maintenance, and cyber audits without hidden invoices.`,
  },
];

const additionalArticles = [
  {
    id: "data-backups-guide",
    title: "Why Immutable Backups Are Your Ultimate Safety Net",
    category: "Backup & Recovery",
    date: "Aug 15, 2026",
    readTime: "5 min read",
    image: "/images/blog/cybersecurity-tips.jpg",
    excerpt:
      "Understanding air-gapped data snapshots and why traditional external hard drives are no longer enough to protect against automated ransomware attacks.",
    content: `Modern ransomware strains actively seek out network shares and external USB drives to encrypt or delete backups before executing their encryption payload.

Immutable cloud storage locks data snapshots in a write-once-read-many (WORM) vault that cannot be altered, encrypted, or deleted by any user or administrator until the retention window expires. Combined with air-gapped offsite replication, your business data remains 100% recoverable even after an aggressive breach.`,
  },
  {
    id: "microsoft-365-security",
    title: "Essential Microsoft 365 Security Settings Every Office Must Audit",
    category: "Cloud Solutions",
    date: "Aug 02, 2026",
    readTime: "4 min read",
    image: "/images/blog/cloud-solutions.jpg",
    excerpt:
      "Default cloud configurations leave doors open for unauthorized access. Here are the 5 settings your IT administrator should turn on today.",
    content: `Out of the box, Microsoft 365 defaults to permissive user settings designed for ease of setup rather than high security.

### Crucial Security Baselines:
- **Block Legacy Authentication**: Legacy protocols like IMAP/POP3 bypass multi-factor authentication entirely. Disabling them stops 95% of brute-force password spraying.
- **Enforce Conditional Access**: Require devices to be company-registered and located in approved countries before granting access to corporate mailboxes.
- **Automated Forwarding Rules**: Audit mailbox forwarding daily to detect covert data exfiltration rules created by compromised user accounts.`,
  },
  {
    id: "office-network-speed",
    title: "How to Eliminate Office Wi-Fi Dead Zones and Video Lag",
    category: "Networks",
    date: "Jul 22, 2026",
    readTime: "5 min read",
    image: "/images/blog/it-partner.jpg",
    excerpt:
      "Troubleshooting dropped Zoom calls, slow file transfers, and device bottlenecks with modern enterprise Wi-Fi 6/7 access point architectures.",
    content: `Consumer-grade mesh routers cannot handle the concurrent radio traffic generated by modern offices filled with laptops, VoIP handsets, smartphones, and wireless printers.

Upgrading to enterprise ceiling-mounted Wi-Fi 6/7 access points with Power-over-Ethernet (PoE) and central cloud management eliminates signal degradation and optimizes frequency channel assignment dynamically.`,
  },
];

const categories = [
  "All",
  "Cybersecurity",
  "Cloud Solutions",
  "Managed IT",
  "Backup & Recovery",
  "Networks",
  "Data Recovery",
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [liveArticles, setLiveArticles] = useState<any[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [shareToast, setShareToast] = useState("");

  const loadLive = async () => {
    const delSet = getDeletedBlogIds();
    setDeletedIds(delSet);

    try {
      const posts = await fetchBlogPostsFromSupabase();
      if (posts && posts.length > 0) {
        const published = posts.filter(
          (p) => p.status === "Published" && !delSet.has(p.id)
        );
        setLiveArticles(
          published.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            date: p.created_at
              ? new Date(p.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Latest",
            readTime: p.read_time || "5 min read",
            image: p.cover_image || "/images/blog/cybersecurity-tips.jpg",
            excerpt: p.excerpt,
            content: p.content || p.excerpt,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load blog posts:", err);
    }
  };

  useEffect(() => {
    loadLive();

    const handleUpdate = () => loadLive();
    window.addEventListener("blog-updated", handleUpdate);
    return () => window.removeEventListener("blog-updated", handleUpdate);
  }, []);

  // Check URL query on mount for direct article open (e.g. ?article=slug)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const artId = params.get("article");
      if (artId) {
        const found =
          liveArticles.find((a) => a.id === artId) ||
          primaryArticles.find((a) => a.id === artId) ||
          additionalArticles.find((a) => a.id === artId);
        if (found) setSelectedArticle(found);
      }
    }
  }, [liveArticles]);

  const visiblePrimary = primaryArticles.filter((p) => !deletedIds.has(p.id));
  const visibleAdditional = additionalArticles.filter((a) => !deletedIds.has(a.id));
  const visibleLive = liveArticles.filter((l) => !deletedIds.has(l.id));

  // Merge live articles with defaults, live articles take precedence
  const allArticles =
    visibleLive.length > 0
      ? [
          ...visibleLive,
          ...visiblePrimary.filter((p) => !visibleLive.some((l) => l.id === p.id)),
          ...visibleAdditional.filter((a) => !visibleLive.some((l) => l.id === a.id)),
        ]
      : [...visiblePrimary, ...visibleAdditional];

  // Correct filtering: always search across all articles
  const categoryArticles =
    activeCategory === "All"
      ? allArticles
      : allArticles.filter(
          (art) => art.category.toLowerCase() === activeCategory.toLowerCase()
        );

  const filteredArticles = showAllArticles
    ? categoryArticles
    : categoryArticles.slice(0, 6);

  const handleShare = (art: any) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/blog?article=${encodeURIComponent(art.id)}`;
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(`Article link copied to clipboard!`);
        setTimeout(() => setShareToast(""), 3500);
      });
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-[#071426]">
      {/* HEADER */}
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[450px] w-[450px] rounded-full bg-sky-50 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-16 text-center lg:pt-24 lg:pb-20">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>TECHNOLOGY &amp; SECURITY KNOWLEDGE BASE</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[44px] text-[#071426] leading-tight">
              <WordReveal text="Latest Technology Insights & IT Guides" />
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl mx-auto">
              Practical cybersecurity advice, cloud infrastructure blueprints, and managed IT guidance written by certified enterprise specialists.
            </p>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* TOAST ALERT */}
          {shareToast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 backdrop-blur-md px-5 py-3 font-bold text-emerald-300 shadow-2xl flex items-center gap-2 animate-bounce">
              <span>✓ {shareToast}</span>
            </div>
          )}

          {/* ================= PRIMARY ARTICLE CARDS ================= */}
          <div className="mt-14 mx-auto max-w-4xl space-y-6 text-left">
            <AnimatePresence>
              {filteredArticles.map((article, idx) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(idx * 0.04, 0.2),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => setSelectedArticle(article)}
                  className="group relative flex flex-col sm:flex-row items-stretch overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm zoho-card-lift hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 cursor-pointer"
                >
                  {/* THUMBNAIL IMAGE (LEFT ON DESKTOP) */}
                  <div className="relative aspect-[16/10] sm:w-72 sm:shrink-0 overflow-hidden bg-slate-900">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 288px"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute left-3.5 top-3.5 rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/20 shadow-sm">
                      {article.category}
                    </div>
                  </div>

                  {/* CONTENT (RIGHT) */}
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                    <div>
                      {/* DATE & READ TIME BADGE */}
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>{article.date}</span>
                        <span>•</span>
                        <span className="text-blue-600">{article.readTime}</span>
                      </div>

                      {/* ARTICLE TITLE */}
                      <h2 className="mt-2.5 text-xl sm:text-2xl font-bold tracking-tight text-[#071426] transition group-hover:text-blue-600 leading-snug">
                        {article.title}
                      </h2>

                      {/* EXCERPT */}
                      <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-slate-600">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* READ ARTICLE LINK WITH ARROW & SHARE */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArticle(article);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 transition group-hover:text-blue-800 cursor-pointer"
                      >
                        <span>Read Full Article</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.3"
                          className="zoho-hover-arrow"
                        >
                          <path
                            d="M5 12h14M12 5l7 7-7 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(article);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-600 transition cursor-pointer"
                        title="Copy article link"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* ================= VIEW ALL ARTICLES BUTTON ================= */}
          {categoryArticles.length > 6 && (
            <div className="mt-14 flex justify-center">
              <button
                onClick={() => setShowAllArticles(!showAllArticles)}
                className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                <span>{showAllArticles ? "Show Primary Insights" : `View All Articles (${categoryArticles.length})`}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className={`transition-transform duration-300 ${
                    showAllArticles ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= FULL ARTICLE READER MODAL ================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-2xl text-[#071426]">
            
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
              aria-label="Close article reader"
            >
              ✕
            </button>

            {/* COVER IMAGE */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md">
              <Image
                src={selectedArticle.image}
                alt={selectedArticle.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                  {selectedArticle.category}
                </span>
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                  {selectedArticle.readTime}
                </span>
              </div>
            </div>

            {/* HEADER METADATA */}
            <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span className="text-blue-600">The Data Dot Engineering Team</span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#071426] leading-tight">
              {selectedArticle.title}
            </h1>

            {/* EXCERPT LEAD */}
            <div className="mt-4 rounded-2xl border-l-4 border-blue-600 bg-blue-50/60 p-4 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
              {selectedArticle.excerpt}
            </div>

            {/* FULL ARTICLE BODY WITH CLEAN FORMATTING */}
            <div className="mt-6 space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed max-h-[45vh] overflow-y-auto pr-2">
              {(selectedArticle.content || selectedArticle.excerpt)
                .split("\n\n")
                .map((block: string, bIdx: number) => {
                  const trimmed = block.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3
                        key={bIdx}
                        className="pt-3 text-lg sm:text-xl font-bold text-[#071426]"
                      >
                        {trimmed.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2
                        key={bIdx}
                        className="pt-4 text-xl sm:text-2xl font-bold text-[#071426]"
                      >
                        {trimmed.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith("> ")) {
                    return (
                      <blockquote
                        key={bIdx}
                        className="rounded-xl border-l-4 border-amber-500 bg-amber-50/70 p-3.5 text-sm italic text-amber-900"
                      >
                        {trimmed.replace("> ", "")}
                      </blockquote>
                    );
                  }
                  if (trimmed.startsWith("- ")) {
                    const items = trimmed.split("\n").map((i: string) => i.replace(/^-\s*/, ""));
                    return (
                      <ul key={bIdx} className="list-disc list-inside space-y-1 pl-2 text-slate-700">
                        {items.map((it: string, itIdx: number) => (
                          <li key={itIdx}>{it}</li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={bIdx} className="leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
            </div>

            {/* MODAL FOOTER ACTIONS */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleShare(selectedArticle)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span>Share Link</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
                >
                  <span>Speak with IT Specialist →</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= NEWSLETTER & TECH BRIEFING BANNER ================= */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm text-center zoho-card-lift">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
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
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
            <span>WEEKLY TECH DIGEST</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#071426]">
            Get Practical IT Insights Delivered to Your Inbox
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
            Actionable cybersecurity alerts, cloud advice, and business tech tips without spam or marketing fluff.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your work email address"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 rounded-xl bg-blue-600 px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              Subscribe
            </button>
          </form>
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
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                    ENTERPRISE IT CONSULTATION
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-white">
                    Ready to Get Started?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
                    Let&apos;s build a more secure and productive future together. Speak with an IT specialist today.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-xl"
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