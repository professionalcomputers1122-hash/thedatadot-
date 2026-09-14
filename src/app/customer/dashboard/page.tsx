"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import { getCustomerSession, CustomerUser } from "@/lib/clientAuth";
import { fetchTicketsFromSupabase, Ticket } from "@/lib/portalData";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFileModal, setShowFileModal] = useState(false);

  useEffect(() => {
    const currentCustomer = getCustomerSession();
    if (!currentCustomer) {
      router.push("/customer/login");
      return;
    }
    const activeCust = currentCustomer;
    setCustomer(activeCust);

    const userEmail = activeCust.email.toLowerCase();
    const userCompany = activeCust.company.toLowerCase();
    const userName = activeCust.name.toLowerCase();

    async function loadTickets() {
      try {
        const allTickets = await fetchTicketsFromSupabase();
        // Filter tickets belonging to this customer/company
        const myTickets = allTickets.filter((t) => {
          // If demo account Aravind, include TDD-8942 and Apex cases
          if (userEmail.includes("aravind") || userCompany.includes("apex")) {
            return (
              t.id === "TDD-8942" ||
              t.companyName.toLowerCase().includes("apex") ||
              t.customerName.toLowerCase().includes("aravind")
            );
          }
          // For any other customer, match by email or company name
          return (
            (t as any).customerEmail?.toLowerCase() === userEmail ||
            t.customerName.toLowerCase() === userName ||
            t.companyName.toLowerCase().includes(userCompany)
          );
        });

        setTickets(myTickets);
      } catch (err) {
        console.warn("Failed to load customer tickets:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  const activeTicket = tickets.find((t) => t.status !== "Resolved") || tickets[0];
  const activeCount = tickets.filter((t) => t.status !== "Resolved").length;

  const files = [
    { name: "Recovered_Database_Extract.mdf", size: "1.42 TB", status: "100% Intact" },
    { name: "Forensic_Images_Archive.zip", size: "840 GB", status: "100% Intact" },
    { name: "Company_Financial_Records.qbw", size: "420 GB", status: "100% Intact" },
    { name: "Authentication_Credentials_Backup.xlsx", size: "12 MB", status: "100% Intact" },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* WELCOME BANNER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
              <span>
                {customer?.company || "Enterprise Client Desk"} • Account #{customer?.accountNumber || "TDD-CLI-8492"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Welcome back, {customer?.name || "Client"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Your active hardware cases, cleanroom progress, and cloud support tickets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
            >
              <span>+ Request Media Pickup / Ticket</span>
            </Link>
          </div>
        </div>

        {/* METRICS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Active Recovery</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">
                {activeCount} {activeCount === 1 ? "Device" : "Devices"}
              </span>
              {activeTicket && (
                <span className="text-[11px] font-semibold text-emerald-600">
                  {activeTicket.clonedPercent || 0}% Cloned
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">SLA Response Guarantee</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">15-Min</span>
              <span className="text-[11px] font-semibold text-blue-600">24/7/365</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Recovery Success</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">99.98%</span>
              <span className="text-[11px] font-semibold text-slate-500">Cleanroom Score</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Cases</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">{tickets.length} Cases</span>
              <span className="text-[11px] font-semibold text-slate-500">
                {activeCount} Active · {tickets.length - activeCount} Closed
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE CLEANROOM SPOTLIGHT OR EMPTY STATE */}
        {activeTicket ? (
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/20 p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                  </span>
                  <span>Active Forensic Target • Case #{activeTicket.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                  {activeTicket.deviceOrSubject}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Serial: <strong>{activeTicket.serialNumber || "N/A"}</strong> • Reported: {activeTicket.symptoms || "Hardware failure diagnostics"}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-slate-500 block">Assigned Lead Engineer</span>
                <span className="text-sm font-bold text-slate-900">{activeTicket.assignedTech || "S. Murugan (Cleanroom Lead)"}</span>
                <p className="text-xs font-bold text-blue-600 mt-0.5">Lab Hotline: +91 6380488373</p>
              </div>
            </div>

            {/* 4-STAGE VISUAL TIMELINE */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  ✓ 1. Media Intake
                </span>
                <p className="text-[11px] text-emerald-900 mt-1">Barcoded &amp; logged in secure vault.</p>
                <span className="text-[10px] text-emerald-700 block mt-2 font-bold">Done</span>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  ✓ 2. Bench Diagnostics
                </span>
                <p className="text-[11px] text-emerald-900 mt-1">Class-5 clean bench calibrated.</p>
                <span className="text-[10px] text-emerald-700 block mt-2 font-bold">Done</span>
              </div>

              <div className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 shadow-sm relative overflow-hidden">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  3. PC-3000 Imaging
                </span>
                <p className="text-[11px] text-blue-950 mt-1">{activeTicket.status || "Cloning raw sectors"}.</p>
                <span className="text-[10px] text-blue-700 block mt-2 font-extrabold">
                  {activeTicket.clonedPercent || 0}% Finished (Active)
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 opacity-70">
                <span className="text-xs font-bold text-slate-600">○ 4. Verification &amp; Return</span>
                <p className="text-[11px] text-slate-500 mt-1">Client audit &amp; secure courier dispatch.</p>
                <span className="text-[10px] text-slate-400 block mt-2">In Progress</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
              <span className="text-xs text-slate-600">
                Protected by <strong>No Data, No Recovery Fee</strong> guarantee.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFileModal(true)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 shadow-xs transition"
                >
                  🔍 Verify Recovered File List
                </button>

                <Link
                  href={`/customer/tickets/${activeTicket.id}`}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
                >
                  View Full Ticket Thread →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-xs mb-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-xl font-bold mb-3">
              📦
            </div>
            <h3 className="text-base font-bold text-slate-950">No Active Hardware Cases</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Your organization currently has no open recovery tickets. If you experience a crashed drive, server drop, or RAID failure, open a ticket for immediate dispatch.
            </p>
            <div className="mt-5">
              <Link
                href="/customer/tickets/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
              >
                + Open Your First Recovery Ticket
              </Link>
            </div>
          </div>
        )}

        {/* RECENT TICKETS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Your Tickets</h3>
              <p className="text-xs text-slate-500">Active and recent support requests</p>
            </div>
            <Link
              href="/customer/tickets"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All Tickets ({tickets.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {tickets.length > 0 ? (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5 font-bold text-blue-600">#{t.id}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{t.category}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">{t.deviceOrSubject}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            t.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.status} {t.clonedPercent ? `(${t.clonedPercent}%)` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/customer/tickets/${t.id}`}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          Inspect →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No tickets registered yet for {customer?.company || "your account"}.
              </div>
            )}
          </div>
        </div>

      </main>

      {/* RECOVERED FILES MODAL */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-950">
                  Recovered Files Verification — Case #{activeTicket?.id || "TDD"}
                </h4>
                <p className="text-slate-500 text-xs">Reconstructed files verified in forensic isolation.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📄</span>
                    <div>
                      <p className="font-bold text-slate-900">{f.name}</p>
                      <span className="text-[11px] text-slate-500">{f.size}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 text-[10px]">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-slate-500">Total Cloned: <strong>{activeTicket?.clonedPercent || 100}% Integrity</strong></span>
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
