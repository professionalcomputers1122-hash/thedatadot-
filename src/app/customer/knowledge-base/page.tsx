"use client";

import { useState } from "react";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";

interface KBArticle {
  id: string;
  category: string;
  iconType: "disc" | "package" | "shield" | "cloud" | "fileText" | "cpu" | "lock";
  title: string;
  summary: string;
  content: string;
}

const articles: KBArticle[] = [
  {
    id: "kb-1",
    category: "Data Recovery",
    iconType: "disc",
    title: "Immediate Protocol: What to Do If a Hard Drive Starts Clicking or Grinding",
    summary:
      "Crucial emergency steps to prevent permanent rotational scraping of the magnetic recording platters.",
    content:
      "1. Cut power immediately by unplugging the power cable or shutting down the machine. Do NOT attempt to restart it or 'try one more time'.\n\n2. Do NOT run chkdsk, fsck, disk repair utilities, or commercial recovery software. Software utilities force failing mechanical heads to repeatedly scrape across the platters, grinding recoverable data sectors into airborne dust.\n\n3. Do NOT open the hard drive casing. Microscopic dust particles present in ordinary room air will settle onto the platters, causing permanent head crash. Drive covers must only be opened inside an ISO Class-5 laminar flow cleanroom.\n\n4. Pack the drive in an anti-static ESD bag with at least 3 inches of bubble wrap on all sides and schedule cleanroom intake immediately.",
  },
  {
    id: "kb-2",
    category: "Logistics & Intake",
    iconType: "package",
    title: "How to Safely Pack Hard Drives, SSDs & RAID Arrays for Courier Transit",
    summary:
      "Ensure zero transit shock occurs while your storage media travels to our cleanroom facility.",
    content:
      "1. Static Electricity Protection: Place each hard drive or SSD inside an individual anti-static ESD shielding bag.\n\n2. Cushioning: Wrap each bag securely with heavy-duty bubble wrap (at least 3 to 4 layers, providing a minimum of 2 inches of padding on every face).\n\n3. Box Rigidity: Place the wrapped drives in a rigid corrugated cardboard box. Do NOT use padded envelopes or paper sleeves, as courier sorting belts can crush them.\n\n4. Immobility: Fill any empty space with bubble wrap or packing foam so the drive cannot move or rattle inside the box when gently shaken.\n\n5. Labeling: Clearly write your Ticket Number (e.g., #TDD-XXXX) on the outside of the box and include a printed copy of your ticket confirmation inside.",
  },
  {
    id: "kb-3",
    category: "Client Portal Guide",
    iconType: "fileText",
    title: "Understanding Your 4-Stage Ticket Lifecycle in the Client Dashboard",
    summary:
      "A complete guide to what each milestone means as your case progresses from intake to completion.",
    content:
      "Your dashboard displays real-time telemetry synced with our technician bench workspace:\n\n• Stage 1 — Media Intake: The device has arrived at our lab, received a unique forensic barcode, and is stored in our climate-controlled intake vault.\n\n• Stage 2 — Cleanroom Diagnostics: Senior engineers calibrate donor heads, check spindle alignment, and inspect platters under high-power optical magnification.\n\n• Stage 3 — PC-3000 Imaging: Platter mirroring using Ace Laboratory PC-3000 hardware systems. Raw sector data is extracted non-destructively to an isolated target drive.\n\n• Stage 4 — Verification & Return: File integrity checksums are validated against your critical target folder list, followed by secure return packaging or encrypted cloud delivery.",
  },
  {
    id: "kb-4",
    category: "Client Portal Guide",
    iconType: "cpu",
    title: "How to Download & Inspect Cleanroom Laboratory Attachments",
    summary:
      "Preview microscopic photos and download official PDF bench diagnostic reports directly from your portal.",
    content:
      "Whenever cleanroom technicians inspect your device or complete imaging milestones, they attach diagnostic evidence to your case file:\n\n1. Locate the 'Attached Laboratory Files & Diagnostics' panel on your dashboard active case spotlight or ticket detail view.\n\n2. Image Previews: Click the eye icon on any photo (e.g. platter photos, donor head alignment, microscope inspection) to view in full resolution lightbox.\n\n3. PDF Reports: Click the download arrow icon next to any PDF attachment to save the formal cleanroom diagnostic sheet or file tree directory to your computer.",
  },
  {
    id: "kb-5",
    category: "Cybersecurity",
    iconType: "shield",
    title: "Emergency Ransomware Playbook: First 15 Minutes Checklist",
    summary:
      "Prevent malware from pivoting across your corporate network and encrypting shared NAS volumes.",
    content:
      "1. Physically disconnect the Ethernet cable and turn off Wi-Fi on all affected machines immediately.\n\n2. Do NOT shut down or power off the servers yet; volatile RAM memory contains cryptographic keys and process artifacts that our forensic team can dump and analyze.\n\n3. Isolate the backup server and verify that immutable air-gapped snapshots are decoupled from the corporate network.\n\n4. Contact our 24/7 incident hotline (+91 6380488373) immediately for memory forensic acquisition and containment assistance.",
  },
  {
    id: "kb-6",
    category: "Cloud Solutions",
    iconType: "cloud",
    title: "How to Restore Accidentally Deleted Files in Microsoft 365 & OneDrive",
    summary:
      "Recovering documents deleted past the local recycle bin window before permanent purge.",
    content:
      "1. Sign into the Microsoft 365 web portal and navigate to your OneDrive or SharePoint document library.\n\n2. Open the 'Recycle Bin'. If the file is visible, select it and click 'Restore'.\n\n3. Second-Stage Recycle Bin: If the file is not in the first-stage bin, scroll to the bottom of the page and click 'Second-stage recycle bin' (site collection recycle bin), which retains deleted files for up to an additional 93 days.\n\n4. For permanently purged mailboxes or SharePoint sites, contact our team to restore from our immutable daily cloud snapshots.",
  },
  {
    id: "kb-7",
    category: "Data Recovery",
    iconType: "lock",
    title: "Protocol for Water, Liquid, or Flood-Damaged Storage Devices",
    summary:
      "Critical handling rules to prevent corrosive salts and rust from destroying platters.",
    content:
      "1. Do NOT apply heat: Never use hair dryers, ovens, or direct sunlight to dry wet hard drives. Heating causes mineral residues and salts to bake into the magnetic substrate.\n\n2. Do NOT power on: Applying electrical current to a wet PCB controller causes instantaneous short circuits that can destroy ROM chips and preamp electronics.\n\n3. Keep in a sealed bag: Wrap the wet media in paper towels, place inside a sealed Ziploc bag, and deliver it to our lab within 24–48 hours for ultrasonic de-ionized wash and platter drying.",
  },
];

export default function CustomerKnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>("kb-1");

  const categories = ["All", "Data Recovery", "Logistics & Intake", "Client Portal Guide", "Cybersecurity", "Cloud Solutions"];

  const filtered = articles.filter((a) => {
    const matchesCat = selectedCategory === "All" || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const renderIcon = (type: KBArticle["iconType"]) => {
    switch (type) {
      case "disc":
        return (
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      case "package":
        return (
          <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        );
      case "fileText":
        return (
          <svg className="w-5 h-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
        );
      case "cpu":
        return (
          <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="16" height="16" x="4" y="4" rx="2" />
            <rect width="6" height="6" x="9" y="9" rx="1" />
            <path d="M15 2v2" />
            <path d="M15 20v2" />
            <path d="M2 15h2" />
            <path d="M2 9h2" />
            <path d="M20 15h2" />
            <path d="M20 9h2" />
            <path d="M9 2v2" />
            <path d="M9 20v2" />
          </svg>
        );
      case "shield":
        return (
          <svg className="w-5 h-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case "cloud":
        return (
          <svg className="w-5 h-5 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
        );
      case "lock":
      default:
        return (
          <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* HERO SEARCH */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-3">
            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
            <span>Customer Knowledge Base &amp; Technical Guides</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Cleanroom Procedures &amp; Troubleshooting
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Verified recovery procedures, packaging instructions, ticket milestone guides, and emergency protocols.
          </p>

          <div className="mt-6 relative">
            <input
              type="text"
              placeholder="Search guides (e.g. 'clicking drive', 'ransomware', 'packing', 'attachments')..."
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

        {/* ARTICLES ACCORDION LIST */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <span className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 shrink-0">
                        {renderIcon(item.iconType)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {item.category}
                          </span>
                        </div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-950">{item.title}</h2>
                        <p className="text-xs text-slate-500 mt-1">{item.summary}</p>
                      </div>
                    </div>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-0 sm:pl-14">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-800">No guides matching your criteria.</p>
              <p className="text-slate-400 mt-1">Try another search keyword or browse all categories.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM HELPFUL LINKS */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-slate-950">Have General Questions?</h3>
              </div>
              <p className="text-xs text-slate-600">
                Review answers regarding our No Data, No Recovery Fee guarantee, turnaround times, and cleanroom NDA.
              </p>
            </div>
            <Link
              href="/customer/faq"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Browse Client FAQs</span>
              <span>→</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-slate-950">Need Immediate Lab Intake?</h3>
              </div>
              <p className="text-xs text-slate-600">
                Open a support case to receive a tracking barcode and arrange courier pickup for your media.
              </p>
            </div>
            <Link
              href="/customer/tickets/new"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Open Support Ticket</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* STILL NEED ASSISTANCE CALLOUT */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold">Have a critical cleanroom emergency?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Connect directly with our 24/7 ISO Class-5 emergency cleanroom dispatch.
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
