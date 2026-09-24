"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export interface ITContractData {
  contractId: string;
  contractDateIso: string;
  effectiveDateIso: string;
  term: string;
  clientCompany: string;
  clientSignatory: string;
  clientTitle: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  planTier: string;
  workstations: string;
  servers: string;
  cloudSeats: string;
  networkDevices: string;
  slaUrgency: string;
  p1Response: string;
  p2Response: string;
  p3Response: string;
  p4Response: string;
  retainerFee: string;
  billingCycle: string;
  accountDirector: string;
  notes: string;
}

export interface ITManagementContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCompany?: {
    id?: string;
    name?: string;
    industry?: string;
    plan?: string;
    accountManager?: string;
  } | null;
  onSaved?: (contract: ITContractData) => void;
}

export default function ITManagementContractModal({
  isOpen,
  onClose,
  initialCompany,
  onSaved,
}: ITManagementContractModalProps) {
  // Generate random or sequential ref ID
  const defaultRefId = () => `TDD-MSA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const todayIso = () => new Date().toISOString().split("T")[0];

  const [contractId, setContractId] = useState(defaultRefId());
  const [contractDateIso, setContractDateIso] = useState(todayIso());
  const [effectiveDateIso, setEffectiveDateIso] = useState(todayIso());
  const [term, setTerm] = useState("12 Months (Annual Master Agreement)");

  const [clientCompany, setClientCompany] = useState(
    initialCompany?.name || "Apex Healthcare Diagnostic Centers Pvt Ltd"
  );
  const [clientSignatory, setClientSignatory] = useState("Dr. Arvind Ramanathan");
  const [clientTitle, setClientTitle] = useState("Managing Director & CTO");
  const [clientEmail, setClientEmail] = useState("a.ramanathan@apexhealth.in");
  const [clientPhone, setClientPhone] = useState("+91 98410 77291");
  const [clientAddress, setClientAddress] = useState("Plot 14B, Tech Park Road, Guindy, Chennai 600032");

  const [planTier, setPlanTier] = useState(
    initialCompany?.plan || "Enterprise 24/7 Unlimited SLA"
  );
  const [workstations, setWorkstations] = useState("35 Workstations / Laptops");
  const [servers, setServers] = useState("2 Windows Servers + 1 NAS");
  const [cloudSeats, setCloudSeats] = useState("35 Microsoft 365 Business Seats");
  const [networkDevices, setNetworkDevices] = useState("1 UTM Firewall + 4 Managed APs");

  const [slaUrgency, setSlaUrgency] = useState("15-Minute Emergency Critical Response");
  const [p1Response, setP1Response] = useState("≤ 15 Minutes");
  const [p2Response, setP2Response] = useState("≤ 2 Hours");
  const [p3Response, setP3Response] = useState("≤ 4 Hours");
  const [p4Response, setP4Response] = useState("Next Business Day");

  const [retainerFee, setRetainerFee] = useState("₹45,000 / Month + GST");
  const [billingCycle, setBillingCycle] = useState("Monthly in Advance (Net 15 Days)");
  const [accountDirector, setAccountDirector] = useState(
    initialCompany?.accountManager ? `${initialCompany.accountManager} (Senior IT Lead)` : "Ebinezer (Lead Solutions Director)"
  );
  const [notes, setNotes] = useState("");

  const [showFormOnMobile, setShowFormOnMobile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync when initialCompany changes
  useEffect(() => {
    if (initialCompany) {
      if (initialCompany.name) setClientCompany(initialCompany.name);
      if (initialCompany.plan) {
        setPlanTier(initialCompany.plan);
        if (initialCompany.plan.toLowerCase().includes("24/7") || initialCompany.plan.toLowerCase().includes("15-min")) {
          setSlaUrgency("15-Minute Emergency Critical Response");
          setP1Response("≤ 15 Minutes");
          setRetainerFee("₹45,000 / Month + GST");
        } else if (initialCompany.plan.toLowerCase().includes("4-hour") || initialCompany.plan.toLowerCase().includes("priority")) {
          setSlaUrgency("2-Hour Priority Response SLA");
          setP1Response("≤ 2 Hours");
          setRetainerFee("₹28,000 / Month + GST");
        } else {
          setSlaUrgency("Same-Day Standard Business SLA");
          setP1Response("≤ 4 Hours");
          setRetainerFee("₹16,500 / Month + GST");
        }
      }
      if (initialCompany.accountManager) {
        setAccountDirector(`${initialCompany.accountManager} (Senior Account Executive)`);
      }
      setContractId(`TDD-MSA-${initialCompany.id ? initialCompany.id.replace(/[^a-zA-Z0-9]/g, "") : Math.floor(100 + Math.random() * 900)}-${new Date().getFullYear()}`);
    }
  }, [initialCompany]);

  const handlePlanChange = (selected: string) => {
    setPlanTier(selected);
    if (selected.includes("24/7") || selected.includes("15-Min")) {
      setSlaUrgency("15-Minute Emergency Critical Response");
      setP1Response("≤ 15 Minutes");
      setP2Response("≤ 2 Hours");
      setP3Response("≤ 4 Hours");
      setRetainerFee("₹45,000 / Month + GST");
    } else if (selected.includes("Priority") || selected.includes("4-Hour")) {
      setSlaUrgency("2-Hour Priority Response SLA");
      setP1Response("≤ 2 Hours");
      setP2Response("≤ 4 Hours");
      setP3Response("≤ 8 Hours");
      setRetainerFee("₹28,000 / Month + GST");
    } else {
      setSlaUrgency("Same-Day Standard Business SLA");
      setP1Response("≤ 4 Hours");
      setP2Response("≤ 8 Hours");
      setP3Response("Next Business Day");
      setRetainerFee("₹16,500 / Month + GST");
    }
  };

  // Mount print portal on beforeprint / afterprint
  useEffect(() => {
    if (!isOpen) return;

    const setupPrintPortal = () => {
      const contractElement = document.getElementById("printableContractArea");
      if (!contractElement) return;
      let portal = document.getElementById("tdd-contract-print-portal");
      if (!portal) {
        portal = document.createElement("div");
        portal.id = "tdd-contract-print-portal";
        document.body.appendChild(portal);
      }
      portal.innerHTML = contractElement.innerHTML;
    };

    const cleanupPrintPortal = () => {
      const portal = document.getElementById("tdd-contract-print-portal");
      if (portal) portal.remove();
    };

    window.addEventListener("beforeprint", setupPrintPortal);
    window.addEventListener("afterprint", cleanupPrintPortal);

    return () => {
      window.removeEventListener("beforeprint", setupPrintPortal);
      window.removeEventListener("afterprint", cleanupPrintPortal);
      cleanupPrintPortal();
    };
  }, [isOpen]);

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    const contractElement = document.getElementById("printableContractArea");
    if (!contractElement) {
      window.print();
      return;
    }

    const existing = document.getElementById("tdd-contract-print-portal");
    if (existing) existing.remove();

    const portal = document.createElement("div");
    portal.id = "tdd-contract-print-portal";
    portal.innerHTML = contractElement.innerHTML;
    document.body.appendChild(portal);

    const cleanup = () => {
      const p = document.getElementById("tdd-contract-print-portal");
      if (p) p.remove();
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);

    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 2500);
    }, 60);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const contractPayload: ITContractData = {
      contractId,
      contractDateIso,
      effectiveDateIso,
      term,
      clientCompany,
      clientSignatory,
      clientTitle,
      clientEmail,
      clientPhone,
      clientAddress,
      planTier,
      workstations,
      servers,
      cloudSeats,
      networkDevices,
      slaUrgency,
      p1Response,
      p2Response,
      p3Response,
      p4Response,
      retainerFee,
      billingCycle,
      accountDirector,
      notes,
    };

    try {
      // Save into localStorage repository
      if (typeof window !== "undefined") {
        const key = "tdd_it_contracts";
        const existingRaw = localStorage.getItem(key);
        let list: ITContractData[] = [];
        if (existingRaw) {
          try {
            list = JSON.parse(existingRaw);
          } catch (e) {
            list = [];
          }
        }
        const filtered = list.filter((c) => c.contractId !== contractId);
        filtered.unshift(contractPayload);
        localStorage.setItem(key, JSON.stringify(filtered));
        window.dispatchEvent(new Event("contracts-updated"));
      }

      setSaveSuccessMsg("✓ Master Contract Saved Successfully!");
      if (onSaved) onSaved(contractPayload);
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    } catch (err) {
      console.warn("Save contract warning:", err);
      setSaveSuccessMsg("✓ Contract Saved Locally");
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const formattedDate = new Date(contractDateIso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      
      {/* PRINT ISOLATION ENGINE */}
      <style jsx global>{`
        @media screen {
          #tdd-contract-print-portal {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm !important;
          }
          body > *:not(#tdd-contract-print-portal) {
            display: none !important;
          }
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #tdd-contract-print-portal {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 2mm 3mm !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
          }
          #tdd-contract-print-portal * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-[1340px] max-h-[96vh] bg-[#0c1424] text-slate-100 rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL CONTROL HEADER */}
        <div className="no-print bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>IT Management Master Services Agreement &amp; SLA</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                  Live Contract Engine
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                The Data Dot Enterprise Solutions • Rapid Response Hotline: +91 6380488373
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <button
              type="button"
              onClick={() => setShowFormOnMobile(!showFormOnMobile)}
              className="lg:hidden rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300"
            >
              {showFormOnMobile ? "View Document Preview →" : "← Edit Contract Variables"}
            </button>

            {/* Print / Export Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl border border-blue-400/40 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Print executive contract or save as PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Save as PDF</span>
            </button>

            {/* Save to System Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Agreement"}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer ml-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {saveSuccessMsg && (
          <div className="no-print bg-emerald-950/80 border-b border-emerald-800 px-5 py-2 text-xs font-bold text-emerald-300 flex items-center justify-between animate-in fade-in">
            <span>{saveSuccessMsg}</span>
            <span className="text-[10px] text-emerald-400 font-mono">Sync complete</span>
          </div>
        )}

        {/* MAIN BODY: SPLIT VIEW (FORM ON LEFT, DOCUMENT ON RIGHT) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ================= LEFT SIDE: FORM EDITOR (420px) ================= */}
          <div
            className={`w-full lg:w-[450px] shrink-0 border-r border-slate-800 bg-[#090f1d] p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs ${
              showFormOnMobile ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="font-bold text-white text-sm">Fill Relevant Details</h3>
                <p className="text-[11px] text-slate-400">All standard SLA clauses &amp; legal terms default automatically</p>
              </div>
              <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded">
                AUTO-FILL
              </span>
            </div>

            {/* CONTRACT METADATA */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                1. Agreement Identifiers
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Contract ID</label>
                  <input
                    type="text"
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 font-mono text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDateIso}
                    onChange={(e) => {
                      setEffectiveDateIso(e.target.value);
                      setContractDateIso(e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* CLIENT ORGANIZATION */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                2. Client Entity &amp; Signatory
              </span>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Organization / Legal Name</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Authorized Contact</label>
                  <input
                    type="text"
                    value={clientSignatory}
                    onChange={(e) => setClientSignatory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={clientTitle}
                    onChange={(e) => setClientTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Direct Phone</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Operating Facility / Office Address</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* SERVICE TIER & SCOPE */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                3. Service Plan &amp; Infrastructure
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Service Plan Level</label>
                <select
                  value={planTier}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Enterprise 24/7 Unlimited SLA">Enterprise 24/7 Unlimited SLA (Mission Critical)</option>
                  <option value="Business Pro Priority MSP">Business Pro Priority MSP (2-Hour SLA)</option>
                  <option value="Standard Retainer & Monitoring">Standard Retainer &amp; Monitoring (Same-Day SLA)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Workstations / PCs</label>
                  <input
                    type="text"
                    value={workstations}
                    onChange={(e) => setWorkstations(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Server Instances</label>
                  <input
                    type="text"
                    value={servers}
                    onChange={(e) => setServers(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cloud / M365 Seats</label>
                  <input
                    type="text"
                    value={cloudSeats}
                    onChange={(e) => setCloudSeats(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Network / Firewall</label>
                  <input
                    type="text"
                    value={networkDevices}
                    onChange={(e) => setNetworkDevices(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* COMMERCIALS & SLA */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                4. Commercials &amp; Lead Director
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Monthly Retainer</label>
                  <input
                    type="text"
                    value={retainerFee}
                    onChange={(e) => setRetainerFee(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white font-bold text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Billing Schedule</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-2 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  >
                    <option value="Monthly in Advance (Net 15 Days)">Monthly in Advance (Net 15 Days)</option>
                    <option value="Quarterly in Advance (5% Discount)">Quarterly in Advance (5% Discount)</option>
                    <option value="Annual Retainer (10% Discount)">Annual Retainer (10% Discount)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Agreement Term</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-2 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  >
                    <option value="12 Months (Annual Master Agreement)">12 Months (Annual Master Agreement)</option>
                    <option value="24 Months (Two-Year Price Lock)">24 Months (Two-Year Price Lock)</option>
                    <option value="36 Months (Enterprise Term)">36 Months (Enterprise Term)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Account Lead</label>
                  <input
                    type="text"
                    value={accountDirector}
                    onChange={(e) => setAccountDirector(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* DEFAULT AUTOMATED CLAUSES SUMMARY */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span>✓</span> Pre-Configured Enterprise Clauses:
              </span>
              <p className="text-[10px] leading-relaxed text-slate-400">
                The agreement includes all standard MSP terms: 24/7 telemetry, patch management, EDR, ISO 27001 NDA, 30-day notice renewal, and Cleanroom data recovery discounts.
              </p>
            </div>
          </div>

          {/* ================= RIGHT SIDE: LIVE DOCUMENT PREVIEW ================= */}
          <div className="flex-1 bg-slate-900/90 p-4 sm:p-6 overflow-y-auto custom-scrollbar flex justify-center items-start">
            
            <div
              id="printableContractArea"
              className="w-full max-w-[800px] bg-white text-slate-950 rounded-2xl shadow-2xl p-7 sm:p-9 border border-slate-200 text-xs leading-relaxed"
            >
              {/* DOCUMENT LETTERHEAD */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-2xl tracking-tighter shrink-0">
                    d<span className="text-red-500">.</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase leading-tight">
                      THE DATA DOT ENTERPRISE SOLUTIONS
                    </h1>
                    <p className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
                      24/7 Managed IT Infrastructure • Cleanroom Forensic Labs • Cloud Security
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      SOC 2 TYPE II AUDITED • ISO/IEC 27001 CERTIFIED MSP DESK
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-slate-950 text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                    Master Services Agreement
                  </span>
                  <div className="text-[11px] font-mono text-slate-700 font-bold">
                    Ref: {contractId}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Date: <span className="font-semibold text-slate-900">{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* AGREEMENT PREAMBLE */}
              <div className="bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-200">
                <p className="text-[11px] text-slate-700">
                  This <strong>Master Services Agreement &amp; Service Level Agreement (SLA)</strong> is made effective as of 
                  <strong> {formattedDate}</strong>, by and between:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2.5 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider">Service Provider:</span>
                    <p className="font-bold text-slate-950">The Data Dot Enterprise Solutions</p>
                    <p className="text-slate-600 text-[10.5px]">Direct Hotline: +91 6380488373 • support@thedatadot.com</p>
                    <p className="text-slate-600 text-[10.5px]">Lead Director: <span className="font-semibold text-slate-900">{accountDirector}</span></p>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider">Client Entity:</span>
                    <p className="font-bold text-slate-950">{clientCompany || "Client Organization"}</p>
                    <p className="text-slate-600 text-[10.5px]">Authorized Contact: <span className="font-semibold text-slate-900">{clientSignatory}</span> ({clientTitle})</p>
                    <p className="text-slate-600 text-[10.5px]">Site: {clientAddress}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 1: INFRASTRUCTURE SCOPE TABLE */}
              <div className="mb-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                  <h3 className="font-extrabold text-[11.5px] uppercase tracking-wider text-slate-900">
                    1. Covered Infrastructure Scope &amp; Plan Tier
                  </h3>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {planTier}
                  </span>
                </div>

                <table className="w-full border-collapse border border-slate-200 text-[11px] mb-1">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold">
                      <th className="border border-slate-200 p-2 text-left w-1/4">Infrastructure Asset</th>
                      <th className="border border-slate-200 p-2 text-left w-1/3">Covered Scope</th>
                      <th className="border border-slate-200 p-2 text-left">Included Management Standard</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-200 p-2 font-semibold text-slate-900">Workstations / PCs</td>
                      <td className="border border-slate-200 p-2 font-medium">{workstations}</td>
                      <td className="border border-slate-200 p-2 text-slate-600">24/7 EDR Monitoring, OS/App Patching &amp; Remote Helpdesk</td>
                    </tr>
                    <tr className="bg-slate-50/70">
                      <td className="border border-slate-200 p-2 font-semibold text-slate-900">Server Infrastructure</td>
                      <td className="border border-slate-200 p-2 font-medium">{servers}</td>
                      <td className="border border-slate-200 p-2 text-slate-600">Hyper-V/VM Health Telemetry, Backup Replication &amp; RAID Sentinel</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 p-2 font-semibold text-slate-900">Cloud / Identity</td>
                      <td className="border border-slate-200 p-2 font-medium">{cloudSeats}</td>
                      <td className="border border-slate-200 p-2 text-slate-600">M365 Tenant Hardening, MFA Enforcement &amp; Admin Governance</td>
                    </tr>
                    <tr className="bg-slate-50/70">
                      <td className="border border-slate-200 p-2 font-semibold text-slate-900">Network &amp; Security</td>
                      <td className="border border-slate-200 p-2 font-medium">{networkDevices}</td>
                      <td className="border border-slate-200 p-2 text-slate-600">Firewall Rules, Intrusion Prevention &amp; Wi-Fi Optimization</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 2: SLA RESPONSE MATRIX */}
              <div className="mb-4">
                <h3 className="font-extrabold text-[11.5px] uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-200 pb-1">
                  2. Service Level Agreement (SLA) Matrix
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10.5px]">
                  <div className="border border-red-200 bg-red-50/60 rounded-xl p-2">
                    <span className="block font-extrabold text-red-700 uppercase text-[9.5px]">Priority 1 (Critical)</span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{p1Response}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Whole site down, server crash, ransomware</p>
                  </div>
                  <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-2">
                    <span className="block font-extrabold text-amber-700 uppercase text-[9.5px]">Priority 2 (High)</span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{p2Response}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Core department degraded, VPN link offline</p>
                  </div>
                  <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-2">
                    <span className="block font-extrabold text-blue-700 uppercase text-[9.5px]">Priority 3 (Medium)</span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{p3Response}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Single PC fault, printer offline, app error</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50 rounded-xl p-2">
                    <span className="block font-extrabold text-slate-700 uppercase text-[9.5px]">Priority 4 (Normal)</span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{p4Response}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">User onboarding, hardware consultation</p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: COMMERCIALS */}
              <div className="mb-4">
                <h3 className="font-extrabold text-[11.5px] uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-200 pb-1">
                  3. Commercial Terms &amp; Retainer Fee
                </h3>
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Retainer Rate:</span>
                    <span className="text-sm font-extrabold text-slate-950">{retainerFee}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Billing Terms:</span>
                    <span className="font-bold text-slate-800">{billingCycle}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Agreement Term:</span>
                    <span className="font-bold text-slate-800">{term}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: DEFAULT LEGAL & SECURITY CLAUSES */}
              <div className="mb-4 space-y-2 text-[10px] text-slate-600 leading-normal border-t border-slate-200 pt-2.5">
                <p>
                  <strong>4. Confidentiality &amp; Non-Disclosure:</strong> The Data Dot enforces strict confidentiality conforming to ISO 27001 standards and SOC 2 Type II controls. All client data, infrastructure credentials, and institutional files remain strictly private.
                </p>
                <p>
                  <strong>5. Out-of-Scope Hardware Replacement:</strong> Physical hardware parts (e.g. motherboards, failed drives) and third-party software licenses are billed at pass-through cost upon client written authorization.
                </p>
                <p>
                  <strong>6. Term &amp; Renewal:</strong> This Agreement automatically renews annually unless either party provides thirty (30) days written notice prior to term expiration. Either party may terminate immediately for uncured material breach upon 14 days notice.
                </p>
                <p>
                  <strong>7. Cleanroom Lab Priority Privilege:</strong> Client enjoys prioritized cleanroom forensic data recovery bench access at discounted partner rates (25% forensic fee waiver) for catastrophic hardware failure.
                </p>
              </div>

              {/* SIGNATURES BLOCK */}
              <div className="border-t-2 border-slate-900 pt-3.5 mt-4">
                <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider mb-3">
                  IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date:
                </p>

                <div className="grid grid-cols-2 gap-6 text-[11px]">
                  {/* PROVIDER SIGNATURE */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <span className="text-[9px] uppercase font-bold text-blue-700 tracking-wider block">Service Provider</span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">THE DATA DOT ENTERPRISE SOLUTIONS</p>
                    
                    <div className="my-2 py-1.5 border-b border-slate-300 font-serif italic text-blue-900 text-base">
                      Ebinezer
                    </div>

                    <p className="font-bold text-slate-900">Authorized Signatory</p>
                    <p className="text-[10px] text-slate-500">Director of Enterprise Infrastructure</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Verified Corporate Seal • SOC 2 Desk</p>
                  </div>

                  {/* CLIENT SIGNATURE */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider block">Client Organization</span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{clientCompany || "Client Organization"}</p>
                    
                    <div className="my-2 py-1.5 border-b border-slate-300 font-serif italic text-slate-800 text-base">
                      {clientSignatory || "Authorized Signatory"}
                    </div>

                    <p className="font-bold text-slate-900">{clientSignatory}</p>
                    <p className="text-[10px] text-slate-500">{clientTitle}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Date: {formattedDate}</p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 flex items-center justify-between">
                <span>THE DATA DOT IT MANAGEMENT DESK • 24/7 HOTLINE: +91 6380488373</span>
                <span className="font-mono">VALIDATED CONTRACT DOCUMENT</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
