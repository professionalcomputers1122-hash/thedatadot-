"use client";

import { useState } from "react";
import Link from "next/link";

export default function CustomerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    serviceNeeded: "Emergency Cleanroom Data Recovery",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    requirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.companyName || !formData.contactName) return;

    setLoading(true);
    const generatedRef = `INQ-ONB-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanUrgency = formData.slaTier?.toLowerCase().includes("15-min") ? "Critical" : "Standard";

    try {
      // 1. Save onboarding lead into Admin Inquiries system
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: generatedRef,
          customerName: formData.contactName,
          customerEmail: formData.email,
          companyName: formData.companyName,
          phone: formData.phone,
          service: formData.serviceNeeded,
          urgency: cleanUrgency,
          message: formData.requirements || "Enterprise client onboarding request submitted via customer portal registration.",
          source: "Client Portal Onboarding Form",
        }),
      });

      // 2. Dispatch Dual Emails (Admin alert + Client receipt)
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "inquiry",
          inquiryId: generatedRef,
          customerName: formData.contactName,
          customerEmail: formData.email,
          companyName: formData.companyName,
          phone: formData.phone,
          service: formData.serviceNeeded,
          urgency: cleanUrgency,
          message: formData.requirements || "Enterprise client onboarding request submitted via customer portal registration.",
        }),
      });
    } catch (err) {
      console.warn("Onboarding notification dispatch note:", err);
    } finally {
      setRefNumber(generatedRef);
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafbfd] text-slate-900 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25">
              •
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">The Data Dot</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Request Client Portal Onboarding
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enterprise SLA registration for cleanroom recovery and 24/7 infrastructure monitoring
          </p>
        </div>

        {submitted ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 text-3xl shadow-md shadow-emerald-500/10">
              ✓
            </div>
            <h2 className="text-xl font-bold text-slate-950">
              Onboarding Request Dispatched
            </h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Thank you, <strong className="text-slate-900">{formData.contactName}</strong>! Your enterprise onboarding file for <strong className="text-slate-900">{formData.companyName}</strong> has been routed to our Administration &amp; Cleanroom Intake desk.
            </p>

            <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-2 text-slate-700">
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Tracking Reference:</span>
                <span className="font-mono font-bold text-blue-600">#{refNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Target Organization:</span>
                <span className="font-semibold text-slate-900">{formData.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Contact Email:</span>
                <span className="font-mono text-slate-900">{formData.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Requested SLA Tier:</span>
                <span className="font-semibold text-blue-600">{formData.slaTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Next Action:</span>
                <span className="font-bold text-emerald-600">Admin Account Provisioning</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-left text-[11px] text-blue-900 mb-6 leading-relaxed">
              <strong>What happens next:</strong>
              <ol className="list-decimal pl-4 mt-1 space-y-0.5 text-blue-800">
                <li>Our administration desk verifies your corporate identity and SLA agreement.</li>
                <li>Your dedicated customer portal account and login password will be provisioned by the Super Admin.</li>
                <li>An activation confirmation with your credentials will be dispatched to <strong>{formData.email}</strong> within 2 business hours.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/customer/login"
                className="w-full sm:w-auto rounded-xl bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition"
              >
                ← Return to Client Login
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto rounded-xl border border-slate-300 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Back to Homepage
              </Link>
            </div>

            <p className="mt-6 text-[11px] text-slate-400">
              Immediate emergency? Hotline: <a href="tel:+916380488373" className="font-semibold text-slate-600 underline">+91 6380488373</a>
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
            {/* Enterprise Access Notice */}
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-blue-950 mb-1">
                <span>🛡️</span> Enterprise Provisioning Policy
              </p>
              <p className="text-[11px] text-blue-800">
                To guarantee chain-of-custody for forensic media and HIPAA/SOC-2 data security, portal accounts are provisioned exclusively by The Data Dot Administration upon verified client onboarding.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Diagnostics or Horizon Legal LLP"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aravind S."
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Direct Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98402 11928"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Corporate Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Primary Service Requirement
                  </label>
                  <select
                    value={formData.serviceNeeded}
                    onChange={(e) => setFormData({ ...formData, serviceNeeded: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 text-xs bg-white"
                  >
                    <option>Emergency Cleanroom Data Recovery</option>
                    <option>Managed IT Services &amp; SOC Monitoring</option>
                    <option>Cloud Migration &amp; Hybrid Infrastructure</option>
                    <option>Cybersecurity &amp; Ransomware Defense</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Requested SLA Tier
                  </label>
                  <select
                    value={formData.slaTier}
                    onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 text-xs bg-white"
                  >
                    <option>Enterprise 15-Min 24/7 SLA</option>
                    <option>Priority 4-Hour Response</option>
                    <option>Standard Retainer Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Initial Scope / Media Symptoms / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Failed 4-bay RAID 5 array or 35 employee workstations requiring 24/7 monitoring."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Submitting Onboarding Request...</span>
                  ) : (
                    <span>Submit Onboarding Request for Admin Review →</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600">
              Already an onboarded client?{" "}
              <Link href="/customer/login" className="font-bold text-blue-600 hover:underline">
                Sign In to Portal Here
              </Link>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-slate-400">
          ISO Class-5 Cleanroom Certified • Protected by The Data Dot 99.98% Recovery Guarantee
        </p>
      </div>
    </main>
  );
}
