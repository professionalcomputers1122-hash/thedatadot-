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
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* HERO SEARCH */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-3">
            <span>Customer Knowledge Base &amp; Troubleshooting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            How can our engineering team help you?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Verified recovery procedures, packaging instructions, and cloud IT tutorials.
          </p>

          <div className="mt-6 relative">
            <input
              type="text"
              placeholder="Search guides (e.g. clicking drive, ransomware, packing, M365)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 pl-11 text-xs shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
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
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-2xl p-2 rounded-2xl bg-blue-50 border border-blue-100 shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          {item.category}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-950">{item.title}</h2>
                      <p className="text-xs text-slate-500 mt-1">{item.summary}</p>
                    </div>
                  </div>

                  <span className="text-slate-400 font-bold text-lg shrink-0">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-12">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* STILL NEED ASSISTANCE CALLOUT */}
        <div className="mt-10 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold">Have a critical emergency not listed here?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Connect directly with our 24/7 emergency cleanroom dispatch.
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
