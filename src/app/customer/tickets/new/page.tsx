"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import Footer from "@/components/Footer";
import { createTicketInSupabase, sendMessageToSupabase } from "@/lib/portalData";
import { getCustomerSession } from "@/lib/clientAuth";

export default function CustomerNewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "Data Recovery",
    device: "",
    serial: "",
    capacity: "4TB",
    symptoms: "Clicking sound, drive not spinning",
    trauma: "Physical drop / shock",
    urgency: "CRITICAL",
    description: "",
  });

  useEffect(() => {
    const cust = getCustomerSession();
    if (!cust) {
      router.push("/customer/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mediaType = formData.device.toLowerCase().includes("ssd")
        ? "SSD"
        : formData.device.toLowerCase().includes("raid")
        ? "RAID"
        : formData.device.toLowerCase().includes("flash")
        ? "FLASH"
        : "HDD";

      const urgencyVal: "Critical" | "High" | "Standard" =
        formData.urgency === "CRITICAL"
          ? "Critical"
          : formData.urgency === "HIGH"
          ? "High"
          : "Standard";

      const customer = getCustomerSession();
      if (!customer) {
        router.push("/customer/login");
        return;
      }

      const newTicketId = await createTicketInSupabase({
        companyName: customer.company,
        customerName: customer.name,
        customerEmail: customer.email,
        category: formData.category as any,
        deviceOrSubject: formData.device || `${formData.category} Service Request`,
        mediaType: mediaType as any,
        serialNumber: formData.serial || "N/A",
        urgency: urgencyVal,
        symptoms: `${formData.symptoms} - ${formData.trauma}. ${formData.description}`,
        techNotes: `New ${formData.category} service ticket via Customer Portal by ${customer.name}. Case queued for Super Admin triage and specialist dispatch.`,
        assignedTech: "Unassigned",
        assignedBench: "Pending Allocation",
      });

      const intakeDescription = formData.description
        ? `${formData.symptoms} (${formData.trauma}) - ${formData.description}`
        : `${formData.symptoms} (${formData.trauma})`;

      try {
        await sendMessageToSupabase(
          newTicketId,
          "Customer",
          customer.name,
          intakeDescription
        );
        await sendMessageToSupabase(
          newTicketId,
          "Technician",
          "Triage Desk",
          `Ticket #${newTicketId} registered in ${formData.category} triage queue. Super Admin is reviewing requirements to assign a dedicated specialist.`
        );
      } catch (msgErr) {
        console.warn("Intake message initialization warning:", msgErr);
      }

      // Dispatch alert via Resend to Support Mailbox & Customer
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ticket",
            ticketId: newTicketId,
            customerName: customer.name,
            customerEmail: customer.email,
            companyName: customer.company,
            service: formData.category,
            deviceOrSubject: formData.device,
            serialNumber: formData.serial,
            urgency: urgencyVal,
            symptoms: `${formData.symptoms} - ${formData.trauma}. ${formData.description}`,
          }),
        });
      } catch (emailErr) {
        console.warn("Email alert dispatch warning:", emailErr);
      }

      setLoading(false);
      router.push(`/customer/tickets/${newTicketId}`);
    } catch (err) {
      console.error("Ticket submission error:", err);
      setLoading(false);
      router.push("/customer/tickets");
    }
  };

  const isDataRecovery = formData.category === "Data Recovery";
  const isCybersecurity = formData.category === "Cybersecurity";
  const isCloud = formData.category === "Cloud Solutions";
  const isManagedIT = formData.category === "Managed IT";

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col antialiased relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* AMBIENT GLOW MESH */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] bg-indigo-600/8 rounded-full blur-[140px]" />
      </div>

      <CustomerNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/customer/tickets"
            className="text-xs font-mono font-semibold text-slate-400 hover:text-white mb-2 inline-flex items-center gap-1 transition"
          >
            <span>←</span>
            <span>Back to Tickets Directory</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Open New Support &amp; Recovery Ticket
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit service specifications to dispatch our specialized engineering desk.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* SERVICE CATEGORY */}
            <div>
              <label className="block font-bold text-white mb-2 text-sm">
                1. Service Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "Data Recovery", label: "💽 Cleanroom Recovery" },
                  { id: "Cybersecurity", label: "🛡️ Cybersecurity & SOC" },
                  { id: "Cloud Solutions", label: "☁️ Cloud Infrastructure" },
                  { id: "Managed IT", label: "🖥️ Managed IT Fleet" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`rounded-2xl border p-3.5 text-center font-bold transition text-xs ${
                      formData.category === cat.id
                        ? "border-blue-500 bg-blue-500/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-blue-400/40"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* HARDWARE / SYSTEM SPECIFICATIONS */}
            <div className="border-t border-slate-800/80 pt-5">
              <label className="block font-bold text-white mb-2 text-sm">
                {isDataRecovery
                  ? "2. Storage Hardware / Server Specifications"
                  : isCybersecurity
                  ? "2. Target Infrastructure & Affected Systems"
                  : isCloud
                  ? "2. Cloud Platform & Scope Specifications"
                  : "2. Workstation Fleet & Equipment Target"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {isDataRecovery
                      ? "Device Make & Model"
                      : isCybersecurity
                      ? "Target Host / Segment / IP"
                      : isCloud
                      ? "Cloud Platform / Service"
                      : "Equipment / Fleet Target"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      isDataRecovery
                        ? "e.g. Seagate IronWolf 4TB / Synology NAS"
                        : isCybersecurity
                        ? "e.g. Domain Controller / VPN / Host 192.168.1.10"
                        : isCloud
                        ? "e.g. Microsoft 365 Tenant / Azure VM / AWS"
                        : "e.g. Dell Latitude Fleet / Cisco Switch"
                    }
                    value={formData.device}
                    onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {isDataRecovery
                      ? "Serial Number (if visible)"
                      : isCybersecurity
                      ? "Domain / Host Identifier"
                      : isCloud
                      ? "Tenant ID / Corporate Domain"
                      : "Asset Tag / Office Location"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isDataRecovery
                        ? "e.g. WDC-WMC4N0E83719"
                        : isCybersecurity
                        ? "e.g. corp.internal.net"
                        : isCloud
                        ? "e.g. company.onmicrosoft.com"
                        : "e.g. Chennai HQ Floor 2"
                    }
                    value={formData.serial}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {isDataRecovery
                      ? "Storage Capacity"
                      : isCybersecurity
                      ? "Threat Scope / Hosts"
                      : isCloud
                      ? "User Volume / Scale"
                      : "Affected User Count"}
                  </label>
                  <select
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition"
                  >
                    {isDataRecovery ? (
                      <>
                        <option value="500 GB" className="bg-slate-900 text-slate-200">500 GB</option>
                        <option value="1 TB - 2 TB" className="bg-slate-900 text-slate-200">1 TB - 2 TB</option>
                        <option value="4 TB - 8 TB" className="bg-slate-900 text-slate-200">4 TB - 8 TB</option>
                        <option value="10 TB - 20 TB Enterprise" className="bg-slate-900 text-slate-200">10 TB - 20 TB Enterprise</option>
                        <option value="Multi-Disk RAID Array (20TB+)" className="bg-slate-900 text-slate-200">Multi-Disk RAID Array (20TB+)</option>
                      </>
                    ) : isCybersecurity ? (
                      <>
                        <option value="Single Endpoint Host" className="bg-slate-900 text-slate-200">Single Endpoint Host</option>
                        <option value="5 - 20 Workstations" className="bg-slate-900 text-slate-200">5 - 20 Workstations</option>
                        <option value="Core Network & Server Segment" className="bg-slate-900 text-slate-200">Core Network & Server Segment</option>
                        <option value="Entire Organization Domain" className="bg-slate-900 text-slate-200">Entire Organization Domain</option>
                      </>
                    ) : isCloud ? (
                      <>
                        <option value="1 - 25 Cloud Users" className="bg-slate-900 text-slate-200">1 - 25 Cloud Users</option>
                        <option value="26 - 100 Cloud Users" className="bg-slate-900 text-slate-200">26 - 100 Cloud Users</option>
                        <option value="100+ Enterprise Tier" className="bg-slate-900 text-slate-200">100+ Enterprise Tier</option>
                        <option value="Hybrid Multi-Cloud Cluster" className="bg-slate-900 text-slate-200">Hybrid Multi-Cloud Cluster</option>
                      </>
                    ) : (
                      <>
                        <option value="Individual User Workstation" className="bg-slate-900 text-slate-200">Individual User Workstation</option>
                        <option value="Department Cluster (10-30 Users)" className="bg-slate-900 text-slate-200">Department Cluster (10-30 Users)</option>
                        <option value="Entire Branch Office Infrastructure" className="bg-slate-900 text-slate-200">Entire Branch Office Infrastructure</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* OBSERVED SYMPTOMS / REQUIREMENTS */}
            <div className="border-t border-slate-800/80 pt-5">
              <label className="block font-bold text-white mb-2 text-sm">
                {isDataRecovery
                  ? "3. Observed Failure Symptoms & Background"
                  : isCybersecurity
                  ? "3. Security Incident Indicators & Threat Vector"
                  : isCloud
                  ? "3. Cloud Requirements & Problem Statement"
                  : "3. Technical Issue Details & Scope"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Primary Symptom / Objective
                  </label>
                  <select
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition"
                  >
                    {isDataRecovery ? (
                      <>
                        <option value="Clicking, grinding, or beeping sounds (Head Crash)" className="bg-slate-900 text-slate-200">Clicking, grinding, or beeping sounds (Head Crash)</option>
                        <option value="Completely dead / No power / Blown PCB" className="bg-slate-900 text-slate-200">Completely dead / No power / Blown PCB</option>
                        <option value="RAW File system / Asks to format drive" className="bg-slate-900 text-slate-200">RAW File system / Asks to format drive</option>
                        <option value="Freezing computer / Extremely slow read speeds" className="bg-slate-900 text-slate-200">Freezing computer / Extremely slow read speeds</option>
                        <option value="Ransomware encrypted / Extension renamed" className="bg-slate-900 text-slate-200">Ransomware encrypted / Extension renamed</option>
                      </>
                    ) : isCybersecurity ? (
                      <>
                        <option value="Ransomware file encryption (.locked files)" className="bg-slate-900 text-slate-200">Ransomware file encryption (.locked files)</option>
                        <option value="Unauthorized login attempt from unknown IP" className="bg-slate-900 text-slate-200">Unauthorized login attempt from unknown IP</option>
                        <option value="Suspicious data exfiltration or bandwidth surge" className="bg-slate-900 text-slate-200">Suspicious data exfiltration or bandwidth surge</option>
                        <option value="Phishing attack / Compromised staff credentials" className="bg-slate-900 text-slate-200">Phishing attack / Compromised staff credentials</option>
                        <option value="Firewall breach alert / Port scan detected" className="bg-slate-900 text-slate-200">Firewall breach alert / Port scan detected</option>
                      </>
                    ) : isCloud ? (
                      <>
                        <option value="Cloud tenant migration from on-premise" className="bg-slate-900 text-slate-200">Cloud tenant migration from on-premise</option>
                        <option value="Microsoft 365 MFA & Conditional Access audit" className="bg-slate-900 text-slate-200">Microsoft 365 MFA & Conditional Access audit</option>
                        <option value="Azure / AWS VM downtime or network drop" className="bg-slate-900 text-slate-200">Azure / AWS VM downtime or network drop</option>
                        <option value="Immutable cloud backup snapshot failure" className="bg-slate-900 text-slate-200">Immutable cloud backup snapshot failure</option>
                        <option value="Mail flow disruption / MX record DNS issue" className="bg-slate-900 text-slate-200">Mail flow disruption / MX record DNS issue</option>
                      </>
                    ) : (
                      <>
                        <option value="Office Wi-Fi / core switch packet drop" className="bg-slate-900 text-slate-200">Office Wi-Fi / core switch packet drop</option>
                        <option value="Operating system boot failure / blue screen" className="bg-slate-900 text-slate-200">Operating system boot failure / blue screen</option>
                        <option value="Software deployment or patch rollout error" className="bg-slate-900 text-slate-200">Software deployment or patch rollout error</option>
                        <option value="Hardware upgrade / RAM / SSD expansion" className="bg-slate-900 text-slate-200">Hardware upgrade / RAM / SSD expansion</option>
                        <option value="Slow workstation response across fleet" className="bg-slate-900 text-slate-200">Slow workstation response across fleet</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Event Context / Trigger
                  </label>
                  <select
                    value={formData.trauma}
                    onChange={(e) => setFormData({ ...formData, trauma: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition"
                  >
                    {isDataRecovery ? (
                      <>
                        <option value="Physical drop / shock / bumped while on" className="bg-slate-900 text-slate-200">Physical drop / shock / bumped while on</option>
                        <option value="Power surge / lightning strike / blackout" className="bg-slate-900 text-slate-200">Power surge / lightning strike / blackout</option>
                        <option value="Accidental deletion or partition wipe" className="bg-slate-900 text-slate-200">Accidental deletion or partition wipe</option>
                        <option value="Sudden failure with no visible trauma" className="bg-slate-900 text-slate-200">Sudden failure with no visible trauma</option>
                      </>
                    ) : isCybersecurity ? (
                      <>
                        <option value="Active security threat in progress" className="bg-slate-900 text-slate-200">Active security threat in progress</option>
                        <option value="Discovered during routine system check" className="bg-slate-900 text-slate-200">Discovered during routine system check</option>
                        <option value="Third-party security alert notification" className="bg-slate-900 text-slate-200">Third-party security alert notification</option>
                        <option value="Employee clicked untrusted link/payload" className="bg-slate-900 text-slate-200">Employee clicked untrusted link/payload</option>
                      </>
                    ) : isCloud ? (
                      <>
                        <option value="Scheduled migration / project rollout" className="bg-slate-900 text-slate-200">Scheduled migration / project rollout</option>
                        <option value="Immediate operational disruption" className="bg-slate-900 text-slate-200">Immediate operational disruption</option>
                        <option value="Quarterly security & compliance audit" className="bg-slate-900 text-slate-200">Quarterly security & compliance audit</option>
                        <option value="End of support for legacy server" className="bg-slate-900 text-slate-200">End of support for legacy server</option>
                      </>
                    ) : (
                      <>
                        <option value="Active disruption during business hours" className="bg-slate-900 text-slate-200">Active disruption during business hours</option>
                        <option value="Weekend maintenance / office move" className="bg-slate-900 text-slate-200">Weekend maintenance / office move</option>
                        <option value="New employee onboarding requirement" className="bg-slate-900 text-slate-200">New employee onboarding requirement</option>
                        <option value="Recurring hardware freeze" className="bg-slate-900 text-slate-200">Recurring hardware freeze</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isDataRecovery
                    ? "Detailed Description of Critical Files to Prioritize"
                    : isCybersecurity
                    ? "Detailed Threat Indicators, Affected Shares, or Demands"
                    : isCloud
                    ? "Detailed Migration Scope, Mailbox Counts, or Error Logs"
                    : "Detailed Workstation Specs, Office Floor, or Problem Details"}
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    isDataRecovery
                      ? "e.g. Need SQL server database .mdf file and accounting QuickBooks files urgently..."
                      : isCybersecurity
                      ? "e.g. Shared NAS was encrypted overnight with readme.txt ransom note. 12 workstations affected..."
                      : isCloud
                      ? "e.g. Need to migrate 45 mailboxes from Exchange 2016 to M365 Business Premium with MFA..."
                      : "e.g. Switch in rack 2 dropping packets to accounting floor. 15 users cannot connect..."
                  }
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition"
                />
              </div>
            </div>

            {/* URGENCY & SLA */}
            <div className="border-t border-slate-800/80 pt-5">
              <label className="block font-bold text-white mb-2 text-sm">
                4. Select Urgency Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="radio"
                    name="urgency"
                    value="STANDARD"
                    checked={formData.urgency === "STANDARD"}
                    onChange={() => setFormData({ ...formData, urgency: "STANDARD" })}
                    className="mt-1 accent-blue-500"
                  />
                  <div>
                    <span className="font-bold text-white block">Standard (1-2 Days)</span>
                    <span className="text-[11px] text-slate-400">Regular triage evaluation.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 cursor-pointer hover:border-amber-500/50 transition">
                  <input
                    type="radio"
                    name="urgency"
                    value="HIGH"
                    checked={formData.urgency === "HIGH"}
                    onChange={() => setFormData({ ...formData, urgency: "HIGH" })}
                    className="mt-1 accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-amber-300 block">Priority (&lt; 4 Hours)</span>
                    <span className="text-[11px] text-amber-200/70">Expedited triage &amp; engineer allocation.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/15 p-3.5 cursor-pointer hover:border-rose-500/60 transition shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                  <input
                    type="radio"
                    name="urgency"
                    value="CRITICAL"
                    checked={formData.urgency === "CRITICAL"}
                    onChange={() => setFormData({ ...formData, urgency: "CRITICAL" })}
                    className="mt-1 accent-rose-500"
                  />
                  <div>
                    <span className="font-bold text-rose-300 block">🔴 Critical (15-Min SLA)</span>
                    <span className="text-[11px] text-rose-200/80">24/7 dedicated engineer dispatch.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {isDataRecovery
                  ? "Protected by our No Data, No Recovery Fee cleanroom guarantee."
                  : isCybersecurity
                  ? "Protected by our Enterprise SOC & Zero-Trust Incident SLA."
                  : "Protected by our Enterprise Service Level Agreement."}
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-7 py-3 text-xs font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition disabled:opacity-50"
              >
                {loading ? "Registering Case..." : "Submit Ticket & Dispatch Engineering →"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
