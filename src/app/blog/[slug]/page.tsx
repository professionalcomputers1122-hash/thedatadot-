import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabaseServer";

interface Props {
  params: Promise<{ slug: string }>;
}

const DEFAULT_ARTICLES = [
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

async function getArticleBySlug(slug: string) {
  // 1. Try Supabase
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", slug)
      .single();

    if (data && data.status === "Published") {
      return {
        id: data.id,
        title: data.title,
        category: data.category,
        date: data.created_at
          ? new Date(data.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Latest",
        readTime: data.read_time || "5 min read",
        image: data.cover_image || "/images/blog/cybersecurity-tips.jpg",
        excerpt: data.excerpt,
        content: data.content || data.excerpt,
      };
    }
  } catch (err) {
    console.warn("Could not load article from Supabase:", err);
  }

  // 2. Fallback to default articles
  const fallback = DEFAULT_ARTICLES.find((a) => a.id === slug);
  return fallback || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | The Data Dot",
    };
  }

  return {
    title: `${article.title} | The Data Dot Blog`,
    description: article.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = DEFAULT_ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f8fbff] text-[#071426]">
      <Header />

      <article className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        {/* BREADCRUMB & BACK LINK */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-8">
          <Link href="/blog" className="hover:text-blue-600 transition flex items-center gap-1.5">
            <span>← Back to All Articles</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600">{article.category}</span>
        </div>

        {/* COVER IMAGE */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-center gap-2.5">
            <span className="rounded-full bg-blue-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
              {article.category}
            </span>
            <span className="rounded-full bg-slate-950/70 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white">
              {article.readTime}
            </span>
          </div>
        </div>

        {/* METADATA & TITLE */}
        <div className="mt-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Published {article.date}</span>
            <span>•</span>
            <span className="text-blue-600">The Data Dot Engineering Specialists</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] text-[#071426] leading-tight">
            {article.title}
          </h1>

          {/* EXCERPT LEAD */}
          <div className="mt-6 rounded-2xl border-l-4 border-blue-600 bg-blue-50/70 p-5 text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            {article.excerpt}
          </div>
        </div>

        {/* FULL ARTICLE BODY */}
        <div className="mt-8 space-y-5 text-base sm:text-lg text-slate-700 leading-relaxed border-b border-slate-200 pb-12">
          {(article.content || article.excerpt)
            .split("\n\n")
            .map((block: string, bIdx: number) => {
              const trimmed = block.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith("### ")) {
                return (
                  <h3
                    key={bIdx}
                    className="pt-4 text-xl sm:text-2xl font-bold text-[#071426]"
                  >
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={bIdx}
                    className="pt-6 text-2xl sm:text-3xl font-bold text-[#071426]"
                  >
                    {trimmed.replace("## ", "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote
                    key={bIdx}
                    className="rounded-2xl border-l-4 border-amber-500 bg-amber-50/70 p-4 text-base italic text-amber-950 my-4"
                  >
                    {trimmed.replace("> ", "")}
                  </blockquote>
                );
              }
              if (trimmed.startsWith("- ")) {
                const items = trimmed
                  .split("\n")
                  .map((i: string) => i.replace(/^-\s*/, ""));
                return (
                  <ul
                    key={bIdx}
                    className="list-disc list-inside space-y-2 pl-3 text-slate-700 my-4"
                  >
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

        {/* CTA BANNER */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-[#071426] via-[#092244] to-[#071426] p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              ENTERPRISE IT CONSULTATION
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Need assistance implementing these protocols?
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-md">
              Speak directly with our certified engineers for guaranteed 15-minute response times and comprehensive managed security.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            Schedule IT Consultation →
          </Link>
        </div>

        {/* RELATED ARTICLES */}
        {related.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold tracking-tight text-[#071426] mb-6">
              More Insights &amp; IT Guides
            </h3>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-900 mb-3">
                    <Image
                      src={rel.image}
                      alt={rel.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                    {rel.category}
                  </span>
                  <h4 className="text-sm font-bold text-[#071426] group-hover:text-blue-600 transition line-clamp-2">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}
