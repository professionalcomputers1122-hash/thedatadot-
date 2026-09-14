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
        deviceOrSubject: formData.device || `${formData.category} Service Request`,
        mediaType: mediaType as any,
        serialNumber: formData.serial || "N/A",
        urgency: urgencyVal,
        symptoms: `${formData.symptoms} - ${formData.trauma}. ${formData.description}`,
        techNotes: `New client intake via Customer Portal by ${customer.name}. Prioritized for Cleanroom Bench inspection.`,
      });

      if (formData.description) {
        await sendMessageToSupabase(
          newTicketId,
          "Customer",
          customer.name,
          formData.description
        );
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

  return (
    <div className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col antialiased">
      <CustomerNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <Link
            href="/customer/tickets"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 inline-block"
          >
            ← Back to Tickets Directory
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Open New Support &amp; Lab Recovery Ticket
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in your device failure details to dispatch our forensic cleanroom engineers or cloud team.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* SERVICE CATEGORY */}
            <div>
              <label className="block font-bold text-slate-900 mb-2 text-sm">
                1. Service Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "Data Recovery", label: "Cleanroom Recovery" },
                  { id: "Cloud Solutions", label: "Cloud Infrastructure" },
                  { id: "Cybersecurity", label: "Security & Ransomware" },
                  { id: "Managed IT", label: "Managed Workstation" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`rounded-2xl border p-3.5 text-center font-bold transition text-xs ${
                      formData.category === cat.id
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* HARDWARE DEVICE DETAILS */}
            <div className="border-t border-slate-100 pt-5">
              <label className="block font-bold text-slate-900 mb-2 text-sm">
                2. Storage Hardware / Server Specifications
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Device Make &amp; Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Seagate IronWolf 4TB / Synology NAS"
                    value={formData.device}
                    onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Serial Number (if available)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WDC-WMC4N0E83719"
                    value={formData.serial}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Capacity
                  </label>
                  <select
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 text-xs bg-white"
                  >
                    <option>500 GB</option>
                    <option>1 TB - 2 TB</option>
                    <option>4 TB - 8 TB</option>
                    <option>10 TB - 20 TB Enterprise</option>
                    <option>Multi-Disk RAID Array (20TB+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* OBSERVED SYMPTOMS */}
            <div className="border-t border-slate-100 pt-5">
              <label className="block font-bold text-slate-900 mb-2 text-sm">
                3. Observed Failure Symptoms &amp; Background
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Symptom
                  </label>
                  <select
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 text-xs bg-white"
                  >
                    <option>Clicking, grinding, or beeping sounds (Head Crash)</option>
                    <option>Completely dead / No power / Blown PCB</option>
                    <option>RAW File system / Asks to format drive</option>
                    <option>Freezing computer / Extremely slow read speeds</option>
                    <option>Ransomware encrypted / Extension renamed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Event Context
                  </label>
                  <select
                    value={formData.trauma}
                    onChange={(e) => setFormData({ ...formData, trauma: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 outline-none focus:border-blue-600 text-xs bg-white"
                  >
                    <option>Physical drop / shock / bumped while on</option>
                    <option>Power surge / lightning strike / blackout</option>
                    <option>Accidental deletion or partition wipe</option>
                    <option>Sudden failure with no visible trauma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Description of Critical Files to Prioritize
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Need SQL server database .mdf file and accounting QuickBooks files urgently..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 text-xs"
                />
              </div>
            </div>

            {/* URGENCY & SLA */}
            <div className="border-t border-slate-100 pt-5">
              <label className="block font-bold text-slate-900 mb-2 text-sm">
                4. Select Urgency Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3.5 cursor-pointer hover:border-slate-300">
                  <input
                    type="radio"
                    name="urgency"
                    value="STANDARD"
                    checked={formData.urgency === "STANDARD"}
                    onChange={() => setFormData({ ...formData, urgency: "STANDARD" })}
                    className="mt-1 accent-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Standard (1-2 Days)</span>
                    <span className="text-[11px] text-slate-500">Regular cleanroom queue evaluation.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/40 p-3.5 cursor-pointer hover:border-amber-300">
                  <input
                    type="radio"
                    name="urgency"
                    value="HIGH"
                    checked={formData.urgency === "HIGH"}
                    onChange={() => setFormData({ ...formData, urgency: "HIGH" })}
                    className="mt-1 accent-amber-600"
                  />
                  <div>
                    <span className="font-bold text-amber-900 block">Priority (&lt; 4 Hours)</span>
                    <span className="text-[11px] text-amber-800">Expedited cleanroom donor head swap.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50/60 p-3.5 cursor-pointer hover:border-red-400">
                  <input
                    type="radio"
                    name="urgency"
                    value="CRITICAL"
                    checked={formData.urgency === "CRITICAL"}
                    onChange={() => setFormData({ ...formData, urgency: "CRITICAL" })}
                    className="mt-1 accent-red-600"
                  />
                  <div>
                    <span className="font-bold text-red-950 block">🔴 Critical (15-Min SLA)</span>
                    <span className="text-[11px] text-red-800">24/7 dedicated cleanroom engineer assigned.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Protected by our <strong>No Data, No Recovery Fee</strong> guarantee.
              </span>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Dispatching Ticket..." : "Submit Ticket &amp; Request Courier Pickup →"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
