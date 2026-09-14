"use client";

import { useState } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";

interface Company {
  id: string;
  name: string;
  industry: string;
  plan: string;
  accountManager: string;
  devicesRecovered: number;
  contractStatus: "Active Retainer" | "On-Demand SLA";
}

export default function AdminCompaniesPage() {
  const [companies] = useState<Company[]>([
    {
      id: "ORG-101",
      name: "Apex Healthcare Diagnostic Center",
      industry: "Healthcare & Diagnostics",
      plan: "Enterprise 15-Min 24/7 SLA",
      accountManager: "S. Murugan",
      devicesRecovered: 14,
      contractStatus: "Active Retainer",
    },
    {
      id: "ORG-102",
      name: "Nexus Legal Advisors LLP",
      industry: "Corporate & Patent Law",
      plan: "Priority 4-Hour Response",
      accountManager: "K. Vignesh",
      devicesRecovered: 6,
      contractStatus: "Active Retainer",
    },
    {
      id: "ORG-103",
      name: "Metropolitan Logistics Warehousing",
      industry: "Supply Chain & Storage",
      plan: "Enterprise 15-Min 24/7 SLA",
      accountManager: "S. Murugan",
      devicesRecovered: 22,
      contractStatus: "Active Retainer",
    },
    {
      id: "ORG-104",
      name: "Sri Lakshmi Tax & Audits",
      industry: "Financial Services",
      plan: "Standard Business Support",
      accountManager: "R. Balaji",
      devicesRecovered: 3,
      contractStatus: "On-Demand SLA",
    },
  ]);

  const [search, setSearch] = useState("");

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayoutShell
      title="Client Organizations &amp; Companies"
      subtitle="B2B institutional client portfolios, recovery history, and assigned account executives"
    >
      <div className="space-y-6 text-xs">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search by company name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white outline-none focus:border-blue-500"
          />
          <span className="text-slate-400">Total B2B Clients: <strong>{companies.length}</strong></span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Org Code</th>
                  <th className="px-5 py-3.5">Company Name</th>
                  <th className="px-5 py-3.5">Industry Domain</th>
                  <th className="px-5 py-3.5">Contract Agreement</th>
                  <th className="px-5 py-3.5">Total Devices Recovered</th>
                  <th className="px-5 py-3.5">Account Executive</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-blue-400">{c.id}</td>
                    <td className="px-5 py-4 font-bold text-white">{c.name}</td>
                    <td className="px-5 py-4 text-slate-300">{c.industry}</td>
                    <td className="px-5 py-4 text-slate-300 font-semibold">{c.plan}</td>
                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {c.devicesRecovered} Drives
                    </td>
                    <td className="px-5 py-4 text-slate-400">{c.accountManager}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                        {c.contractStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
