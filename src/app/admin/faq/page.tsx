"use client";

import { useState, useEffect } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import { fetchFaqsFromSupabase, createOrUpdateFaqInSupabase } from "@/lib/portalData";

export type FAQCategoryName =
  | "General FAQ"
  | "IT Management & Support"
  | "Network & Infrastructure"
  | "Cybersecurity & Compliance"
  | "Cloud & Microsoft 365"
  | "Data Recovery Lab";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategoryName;
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    // General FAQ
    {
      id: "faq-gen-1",
      category: "General FAQ",
      question: "What does The Data Dot do and who do you support?",
      answer: "The Data Dot is an enterprise IT partner providing managed IT support, 24/7 helpdesk, cloud infrastructure, network architecture, cybersecurity defense, and certified cleanroom data recovery for business organizations.",
    },
    {
      id: "faq-gen-2",
      category: "General FAQ",
      question: "How does your flat-rate billing model work?",
      answer: "We provide transparent, all-inclusive monthly retainer pricing per user/workstation with zero surprise billing or unexpected hourly fees. All routine maintenance, remote support, and monitoring are covered.",
    },
    // IT Management & Support
    {
      id: "faq-it-1",
      category: "IT Management & Support",
      question: "What is your guaranteed SLA response time for critical outages?",
      answer: "Our Enterprise SLA guarantees a response within 15 minutes, 24 hours a day, 365 days a year, connecting you directly to Tier-3 network & security engineers.",
    },
    {
      id: "faq-it-2",
      category: "IT Management & Support",
      question: "How does 24/7 remote and on-site support work?",
      answer: "Over 90% of technical tickets are resolved within minutes through our secure remote desktop agent. For hardware failures, cabling, or server replacements, our engineers dispatch on-site.",
    },
    {
      id: "faq-it-3",
      category: "IT Management & Support",
      question: "Do you handle operating system and software patching?",
      answer: "Yes. All Windows, macOS, and Linux servers/endpoints receive automated, vulnerability-tested patch cycles scheduled outside business hours to ensure zero workstation disruption.",
    },
    // Network & Infrastructure
    {
      id: "faq-net-1",
      category: "Network & Infrastructure",
      question: "Can you upgrade our office Wi-Fi and network switches?",
      answer: "Yes. We design and install high-density Wi-Fi 6E/7 access points, managed gigabit/10GbE PoE switches, structured Cat6a cabling, and isolated guest/IoT VLAN networks for zero interference.",
    },
    {
      id: "faq-net-2",
      category: "Network & Infrastructure",
      question: "How do you handle ISP internet outages and firewall failovers?",
      answer: "We configure enterprise SD-WAN firewalls with automated dual-WAN failover (e.g. Fiber + 5G backup) so your phone lines, cloud ERP, and checkout terminals stay online even if your primary ISP drops.",
    },
    // Cybersecurity & Compliance
    {
      id: "faq-sec-1",
      category: "Cybersecurity & Compliance",
      question: "How do you protect workstations against ransomware and phishing?",
      answer: "We deploy layered zero-trust defense: DNS filtering, endpoint behavioral monitoring (EDR/XDR), multi-factor authentication (MFA), automated phishing drills, and air-gapped snapshots.",
    },
    {
      id: "faq-sec-2",
      category: "Cybersecurity & Compliance",
      question: "Do you help with HIPAA, PCI-DSS, and SOC 2 compliance audits?",
      answer: "Yes. We enforce mandatory encryption at rest and in transit, configure immutable audit logging, enforce password policies, and prepare detailed compliance readiness documentation.",
    },
    // Cloud & Microsoft 365
    {
      id: "faq-cloud-1",
      category: "Cloud & Microsoft 365",
      question: "Can you migrate our legacy on-premise email to Microsoft 365?",
      answer: "Yes. We perform seamless Microsoft 365 tenant migrations (Exchange email, calendars, OneDrive, SharePoint) over a scheduled weekend with zero email loss and zero employee downtime.",
    },
    {
      id: "faq-cloud-2",
      category: "Cloud & Microsoft 365",
      question: "How do you optimize cloud server costs in Microsoft Azure?",
      answer: "We audit your cloud footprint quarterly, right-size virtual machines, eliminate orphan storage disks, apply reserved instances, and implement auto-shutdown schedules for development environments.",
    },
    // Data Recovery Lab
    {
      id: "faq-dr-1",
      category: "Data Recovery Lab",
      question: "What is your 'No Data, No Recovery Fee' policy?",
      answer: "If our cleanroom engineers are unable to recover your critical files, you pay nothing. Zero diagnostic fees, zero parts costs, and zero risk to your organization.",
    },
    {
      id: "faq-dr-2",
      category: "Data Recovery Lab",
      question: "Why should I not try to turn on a clicking hard drive?",
      answer: "Clicking sounds indicate physical head crash or slider detachment. Every second a clicking drive spins physically scratches the recording layer off platters, destroying files permanently.",
    },
    {
      id: "faq-dr-3",
      category: "Data Recovery Lab",
      question: "Can you recover data from dropped, dead, or locked NVMe SSDs?",
      answer: "Yes. Using advanced PC-3000 Flash & Portable III stations, we perform chip-off forensic dumps, bypass locked NAND controllers, and rebuild virtual translators without altering source media.",
    },
    {
      id: "faq-dr-4",
      category: "Data Recovery Lab",
      question: "How do you handle multi-drive RAID 5, 6, and NAS server crashes?",
      answer: "We image every disk on hardware write-blockers, reverse-engineer stripe sizes and drive sequences using XOR parity reconstruction, and rebuild the file tree even if multiple drives failed.",
    },
  ]);

  const categories: FAQCategoryName[] = [
    "General FAQ",
    "IT Management & Support",
    "Network & Infrastructure",
    "Cybersecurity & Compliance",
    "Cloud & Microsoft 365",
    "Data Recovery Lab",
  ];

  const [activeTab, setActiveTab] = useState<"All" | FAQCategoryName>("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [newCat, setNewCat] = useState<FAQCategoryName>("General FAQ");
  const [notification, setNotification] = useState("");

  // Sync live FAQs from Supabase on mount
  useEffect(() => {
    async function loadFaqs() {
      try {
        const liveFaqs = await fetchFaqsFromSupabase();
        if (liveFaqs && liveFaqs.length > 0) {
          setFaqs(
            liveFaqs.map((f) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
              category: f.category as FAQCategoryName,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load FAQs from Supabase:", err);
      }
    }
    loadFaqs();
  }, []);

  const filtered = faqs.filter((f) => {
    const matchesTab = activeTab === "All" || f.category === activeTab;
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewQ("");
    setNewA("");
    setNewCat(activeTab !== "All" ? activeTab : "General FAQ");
    setShowModal(true);
  };

  const handleOpenEdit = (item: FAQItem) => {
    setEditingId(item.id);
    setNewQ(item.question);
    setNewA(item.answer);
    setNewCat(item.category);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.trim() || !newA.trim()) return;

    const faqId = editingId || `faq-${Date.now()}`;

    if (editingId) {
      setFaqs((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, question: newQ, answer: newA, category: newCat }
            : item
        )
      );
      setNotification(`FAQ updated in ${newCat} & saved to Supabase.`);
    } else {
      const created: FAQItem = {
        id: faqId,
        question: newQ,
        answer: newA,
        category: newCat,
      };
      setFaqs([created, ...faqs]);
      setNotification(`New FAQ published to /faq (${newCat}) & saved to Supabase!`);
    }

    await createOrUpdateFaqInSupabase({
      id: faqId,
      category: newCat,
      question: newQ,
      answer: newA,
      display_order: 1,
    });

    setShowModal(false);
    setTimeout(() => setNotification(""), 4000);
  };

  const handleDelete = (id: string, q: string) => {
    if (confirm(`Delete this FAQ: "${q.slice(0, 40)}..."?`)) {
      setFaqs(faqs.filter((item) => item.id !== id));
      setNotification("FAQ item deleted.");
      setTimeout(() => setNotification(""), 4000);
    }
  };

  return (
    <AdminLayoutShell
      title="All Services FAQ Manager"
      subtitle="Publish and manage service-related questions and answers across all IT, Network, Security, Cloud, and Lab divisions"
      actions={
        <div className="flex items-center gap-3">
          <a
            href="/faq"
            target="_blank"
            className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5"
          >
            <span>Live FAQ Page</span>
            <span>↗</span>
          </a>
          <button
            onClick={handleOpenAdd}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs flex items-center gap-1"
          >
            <span>+ Add FAQ Item</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        
        {/* TOAST ALERT */}
        {notification && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-4 font-bold text-emerald-300 flex items-center justify-between">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")}>✕</button>
          </div>
        )}

        {/* ALL SERVICE CATEGORIES OVERVIEW GRID */}
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const count = faqs.filter((f) => f.category === cat).length;
            const isSelected = activeTab === cat;
            return (
              <div
                key={cat}
                onClick={() => setActiveTab(isSelected ? "All" : cat)}
                className={`cursor-pointer rounded-2xl border p-3.5 transition flex flex-col justify-between ${
                  isSelected
                    ? "border-blue-500 bg-blue-950/40 shadow-md shadow-blue-900/20 ring-1 ring-blue-500/50"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {cat.split(" ")[0]}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                    {count}
                  </span>
                </div>
                <p className="mt-2 font-bold text-white text-xs leading-snug">{cat}</p>
              </div>
            );
          })}
        </div>

        {/* SEARCH & HORIZONTAL SERVICE FILTER TABS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search questions, answers, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-blue-500"
          />

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("All")}
              className={`rounded-xl px-3 py-1.5 font-bold transition text-xs ${
                activeTab === "All"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              All ({faqs.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`rounded-xl px-3 py-1.5 font-bold transition text-xs ${
                  activeTab === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQS MASTER LIST */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {filtered.map((f) => (
              <div key={f.id} className="p-6 hover:bg-slate-800/30 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-slate-700">
                    {f.category}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenEdit(f)}
                      className="text-[11px] font-semibold text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(f.id, f.question)}
                      className="text-[11px] text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{f.question}</h3>
                <p className="text-slate-400 leading-relaxed text-xs">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ADD / EDIT FAQ MODAL (ALL SERVICES AVAILABLE) */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm text-xs">
            <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-white">
                  {editingId ? "Edit Service FAQ Item" : "Create New Service FAQ"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Select Related Service Category
                  </label>
                  <select
                    value={newCat}
                    onChange={(e: any) => setNewCat(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Question</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How do you configure Wi-Fi 6E VLAN segmentation?"
                    value={newQ}
                    onChange={(e) => setNewQ(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Answer</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide a clear, reassuring answer for your clients..."
                    value={newA}
                    onChange={(e) => setNewA(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-blue-500 text-xs leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md"
                  >
                    {editingId ? "Save Changes" : "Publish FAQ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayoutShell>
  );
}
