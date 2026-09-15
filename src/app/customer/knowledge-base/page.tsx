"use client";

import { useState } from "react";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";

export default function CustomerKnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("kb-1");

  const articles = [
    {
      id: "kb-1",
      category: "Data Recovery",
      icon: "💽",
      title: "Immediate Protocol: What to Do If a Hard Drive Starts Clicking",
      summary:
        "Crucial steps to avoid permanently scraping the magnetic recording layers off spinning platters.",
      content:
        "1. Cut power immediately by unplugging the power cable or shutting down the machine. Do NOT attempt to restart it.\n2. Do NOT run chkdsk, disk repair utilities, or commercial recovery software. Software forces failing heads to repeatedly scrape across the platters, turning recoverable data sectors into dust.\n3. Do NOT open the hard drive casing. Microscopic dust particles present in ordinary room air will settle onto the platters, causing permanent head crash.\n4. Pack the drive in an anti-static bag and wrap with at least 3 inches of bubble wrap before handing over to our courier.",
    },
    {
      id: "kb-2",
      category: "Data Recovery",
      icon: "📦",
      title: "How to Safely Pack Hard Drives and NVMe SSDs for Courier Transit",
      summary: "Ensure zero shock damage occurs while your storage device is in transit to our cleanroom.",
      content:
        "Always place each hard drive inside an individual anti-static ESD shielding bag. Wrap the drive securely with heavy-duty bubble wrap (at least 3-4 layers). Place it in a rigid corrugated cardboard box, ensuring there is no empty space for the drive to shift or bounce during transit. Clearly label the box with your Case ID (#TDD-XXXX).",
    },
    {
      id: "kb-3",
      category: "Cybersecurity",
      icon: "🛡️",
      title: "Emergency Ransomware Playbook: First 15 Minutes Checklist",
      summary: "Prevent malware from pivoting across your corporate network and encrypting shared NAS volumes.",
      content:
        "1. Physically disconnect the Ethernet cable and turn off Wi-Fi on all affected machines immediately.\n2. Do NOT shut down or power off the servers yet; volatile RAM memory contains cryptographic keys that our forensic team can dump and analyze.\n3. Isolate the backup server and verify that immutable air-gapped snapshots are decoupled from the network.\n4. Contact our 24/7 incident hotline (+91 6380488373) for remote memory forensic acquisition.",
    },
    {
      id: "kb-4",
      category: "Cloud Solutions",
      icon: "☁️",
      title: "How to Restore Accidentally Deleted Files in Microsoft 365 & OneDrive",
      summary: "Recovering documents deleted past the local recycle bin window.",
      content:
        "Sign into the Microsoft 365 web portal and navigate to your OneDrive or SharePoint document library. Open the 'Recycle Bin'. If the file is not visible, scroll to the bottom and click 'Second-stage recycle bin' (site collection recycle bin), which retains deleted files for an additional 93 days. For permanently purged mailboxes, open an emergency ticket with our Tier-3 team.",
    },
  ];

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* AMBIENT GLOW MESH */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] bg-indigo-600/8 rounded-full blur-[140px]" />
      </div>

      <CustomerNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HERO SEARCH */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Knowledge Base &amp; Technical Playbooks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            How can our engineering desk assist you?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Verified hardware protocols, ransomware checklists, and cloud infrastructure playbooks.
          </p>

          <div className="mt-6 relative">
            <input
              type="text"
              placeholder="Search playbooks (e.g. clicking drive, ransomware, packing, M365)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 pl-11 text-xs text-slate-200 shadow-2xl outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
            />
            <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
          </div>
        </div>

        {/* ARTICLES ACCORDION LIST */}
        <div className="space-y-4">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl transition hover:border-slate-700/80"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-2xl p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                          {item.category}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-white">{item.title}</h2>
                      <p className="text-xs text-slate-400 mt-1">{item.summary}</p>
                    </div>
                  </div>

                  <span className="text-slate-400 font-bold text-lg shrink-0">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line pl-12 font-sans">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* STILL NEED ASSISTANCE CALLOUT */}
        <div className="mt-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/70 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="text-lg font-bold">Have a critical emergency not listed here?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect directly with our 24/7 emergency cleanroom and SOC dispatch.
            </p>
          </div>
          <a
            href="tel:+916380488373"
            className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition shrink-0"
          >
            Call Hotline: +91 6380488373
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
