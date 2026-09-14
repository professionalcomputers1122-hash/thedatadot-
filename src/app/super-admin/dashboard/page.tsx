"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  status: "Published" | "Draft";
  excerpt: string;
}

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "blog" | "users" | "leads">("blog");
  const [notification, setNotification] = useState<string>("");

  // Blog Posts State
  const [articles, setArticles] = useState<BlogPost[]>([
    {
      id: "cybersecurity-tips",
      title: "10 Cybersecurity Tips for Small Businesses",
      category: "Cybersecurity",
      date: "Sep 10, 2026",
      readTime: "5 min read",
      status: "Published",
      excerpt: "Practical, cost-effective defense tactics to protect workstations and credentials.",
    },
    {
      id: "cloud-solutions-benefits",
      title: "The Benefits of Cloud Solutions for Growing Companies",
      category: "Cloud Solutions",
      date: "Sep 05, 2026",
      readTime: "4 min read",
      status: "Published",
      excerpt: "How modern cloud infrastructure eliminates physical server headaches.",
    },
    {
      id: "choose-it-partner",
      title: "How to Choose the Right IT Support Partner",
      category: "Managed IT",
      date: "Aug 28, 2026",
      readTime: "6 min read",
      status: "Published",
      excerpt: "The critical criteria to evaluate before signing an IT agreement.",
    },
    {
      id: "data-recovery-cleanroom-guide",
      title: "What Happens Inside an ISO Class-5 Data Recovery Cleanroom",
      category: "Data Recovery",
      date: "Draft",
      readTime: "7 min read",
      status: "Draft",
      excerpt: "Behind the scenes look at head swap micro-soldering and PC-3000 mirror imaging.",
    },
  ]);

  // New Article Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Cybersecurity");
  const [newReadTime, setNewReadTime] = useState("5 min read");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);

  // Publish Article
  const handlePublishArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newPost: BlogPost = {
      id: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: newTitle,
      category: newCategory,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: newReadTime,
      status: "Published",
      excerpt: newExcerpt,
    };

    setArticles([newPost, ...articles]);
    setShowNewArticleModal(false);
    setNewTitle("");
    setNewExcerpt("");
    setNewContent("");
    setNotification(`Article "${newPost.title}" successfully published to live blog!`);
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <main className="min-h-screen bg-[#060c18] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      <Header theme="dark" />

      {/* SUPER ADMIN TOP BAR */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/30 text-red-400 font-black border border-red-500/30">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Super Admin Command Center</h1>
                <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-red-300">
                  Full Authority
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong>support@thedatadot.com</strong> • System Uptime: 99.99%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              <span>View Live Blog ↗</span>
            </Link>

            <Link
              href="/super-admin/login"
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* TOAST NOTIFICATION */}
        {notification && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-xs font-semibold text-emerald-300 flex items-center justify-between">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-400">✕</button>
          </div>
        )}

        {/* METRICS STRIP */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Recovery Success</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">99.98%</span>
              <span className="text-[11px] text-emerald-400 font-semibold">Forensic Lab</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Cases in Lab</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-400">4 Devices</span>
              <span className="text-[11px] text-slate-400">Cleanroom</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Published Blog Articles</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{articles.filter(a => a.status === "Published").length}</span>
              <span className="text-[11px] text-slate-400">Live on /blog</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Client Inquiries</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">3 Pending</span>
              <span className="text-[11px] text-amber-400 font-semibold">+91 6380488373</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("blog")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "blog"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            📝 Blog &amp; Article Manager ({articles.length})
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "leads"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            📬 Incoming Client Inquiries (3)
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            👥 Team &amp; Technicians (4)
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            ⚙️ System &amp; Audit Logs
          </button>
        </div>

        {/* TAB 1: BLOG MANAGER */}
        {activeTab === "blog" && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Live Blog Article Management</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Create, edit, and publish content directly to your public website.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewArticleModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
              >
                <span>+ Write New Article</span>
              </button>
            </div>

            {/* ARTICLES LIST TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Article Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-4">
                        <p className="font-bold text-white">{art.title}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">{art.excerpt}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-blue-300">
                          {art.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">{art.date}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            art.status === "Published"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href="/blog"
                            target="_blank"
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                          >
                            Preview
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setArticles(articles.filter((a) => a.id !== art.id));
                              setNotification(`Removed "${art.title}"`);
                            }}
                            className="rounded-lg px-2 py-1 text-[11px] text-red-400 hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: INCOMING CLIENT INQUIRIES */}
        {activeTab === "leads" && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-1">Incoming Inquiries &amp; Lab Requests</h2>
            <p className="text-xs text-slate-400 mb-6">Inquiries submitted through Contact Us and Emergency hotline.</p>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Dr. Aravind Swaminathan (Radiology Lead)</span>
                    <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300">
                      Urgent Head Crash
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Phone: <strong>+91 98402 11928</strong> • Email: aravind@scandiagnostics.com
                  </p>
                  <p className="text-slate-300 mt-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    &ldquo;Our Western Digital 8TB storage array started ticking loudly during morning scans. Needs emergency cleanroom extraction.&rdquo;
                  </p>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <a
                    href="tel:+919840211928"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 text-center"
                  >
                    Call Client
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setNotification("Case assigned to Cleanroom Bench A (Technician K. Vignesh).");
                      setTimeout(() => setNotification(""), 4000);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-700 text-center"
                  >
                    Assign to Technician
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Kavitha Ramanathan (Finance Manager)</span>
                    <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                      Managed Cloud IT
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Phone: <strong>+91 94441 82739</strong> • Email: k.raman@srilakshmi-audits.in
                  </p>
                  <p className="text-slate-300 mt-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    &ldquo;Requesting proposal for Microsoft 365 cloud migration and immutable ransomware backup for 35 chartered accountants.&rdquo;
                  </p>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <a
                    href="tel:+919444182739"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 text-center"
                  >
                    Call Client
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setNotification("Proposal ticket created for Cloud Migration.");
                      setTimeout(() => setNotification(""), 4000);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-700 text-center"
                  >
                    Generate Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEAM & TECHNICIANS */}
        {activeTab === "users" && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Staff &amp; User Accounts</h2>
                <p className="text-xs text-slate-400">Manage internal laboratory technicians and client permissions.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotification("Invite link generated for new technician.");
                  setTimeout(() => setNotification(""), 4000);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
              >
                + Add Technician
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-red-600/30 border border-red-500/40 flex items-center justify-center font-bold text-red-400">
                    👑
                  </div>
                  <div>
                    <h3 className="font-bold text-white">The Data Dot Super Admin</h3>
                    <p className="text-slate-400">support@thedatadot.com</p>
                  </div>
                </div>
                <span className="rounded-full bg-red-500/20 px-3 py-1 text-[10px] font-bold text-red-300 border border-red-500/30">
                  Super Admin
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400">
                    🔧
                  </div>
                  <div>
                    <h3 className="font-bold text-white">K. Vignesh</h3>
                    <p className="text-slate-400">vignesh.ssd@thedatadot.com • Solid State &amp; Cleanroom Lead</p>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                  Technician
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400">
                    🏢
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Apex Healthcare Partners</h3>
                    <p className="text-slate-400">admin@apexhealth.in • Client Account #TDD-8492</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                  Client
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM LOGS */}
        {activeTab === "overview" && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-sm text-xs">
            <h2 className="text-xl font-bold text-white mb-1">System &amp; Forensic Audit Logs</h2>
            <p className="text-xs text-slate-400 mb-6">Cryptographic activity trail for SOC 2 Type II compliance.</p>

            <div className="space-y-2 font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-emerald-400">[2026-09-14 16:42:01]</span> Super Admin authenticated from IP 192.168.1.1 (Session 256-bit TLS encrypted).
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-blue-400">[2026-09-14 16:35:12]</span> Technician TECH-048 updated Case #TDD-8942 status to &apos;PC-3000 Raw Platter Mirrored Extraction&apos; (99.8%).
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-indigo-400">[2026-09-14 15:10:04]</span> ISO Class-5 Laminar bench sensor test: 0.05 in. w.g. pressure passed certification.
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-amber-400">[2026-09-14 14:02:49]</span> Client Apex Healthcare logged in and previewed 5 recovered files.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ================= WRITE NEW ARTICLE MODAL ================= */}
      {showNewArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Publish New Article to Website</h3>
                <p className="text-slate-400">Article will instantly appear on your public /blog page.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewArticleModal(false)}
                className="rounded-full p-2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishArticle} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 7 Critical Signs Your Hard Drive Is About to Fail"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                  >
                    <option>Cybersecurity</option>
                    <option>Data Recovery</option>
                    <option>Cloud Solutions</option>
                    <option>Managed IT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={newReadTime}
                    onChange={(e) => setNewReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Short Excerpt / Preview</label>
                <input
                  type="text"
                  required
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="Brief 1-sentence summary that appears on the card preview..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Article Body</label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write the full post here. Markdown formatting is supported..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewArticleModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
                >
                  🚀 Publish Article Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
