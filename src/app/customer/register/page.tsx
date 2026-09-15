"use client";

import { useState } from "react";
import Link from "next/link";

export default function CustomerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

    try {
      // Dispatch onboarding notification via email/audit endpoint
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "enterprise_lead",
          name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          company: formData.companyName,
          service: formData.serviceNeeded,
          sla: formData.slaTier,
          message: formData.requirements || "Enterprise client onboarding request submitted via customer portal.",
        }),
      });
    } catch (err) {
      console.warn("Onboarding notification dispatch note:", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden antialiased selection:bg-blue-500/30 selection:text-blue-200">
      {/* AMBIENT GLOW MESH */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-15%] left-[30%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-[0_0_25px_rgba(37,99,235,0.45)] group-hover:scale-105 transition">
              •
            </div>
            <span className="text-xl font-bold tracking-tight text-white">The Data Dot</span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Onboarding Gateway</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Request Client Portal Onboarding
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Enterprise SLA registration for cleanroom recovery, SOC response, and 24/7 infrastructure monitoring
          </p>
        </div>

        {submitted ? (
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 text-3xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              ✓
            </div>
            <h2 className="text-xl font-bold text-white">
              Onboarding Request Dispatched
            </h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Thank you, <strong className="text-slate-200">{formData.contactName}</strong>! Your enterprise onboarding profile for <strong className="text-blue-400">{formData.companyName}</strong> has been routed to our Administration &amp; Cleanroom Intake desk.
            </p>

            <div className="my-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left text-xs space-y-2 text-slate-300 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Target Organization:</span>
                <span className="font-semibold text-white">{formData.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Contact Email:</span>
                <span className="text-blue-400">{formData.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Requested SLA Tier:</span>
                <span className="font-semibold text-emerald-400">{formData.slaTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Action:</span>
                <span className="font-bold text-blue-400">Admin Account Provisioning</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-left text-[11px] text-blue-200 mb-6 leading-relaxed">
              <strong className="text-white">What happens next:</strong>
              <ol className="list-decimal pl-4 mt-1 space-y-0.5 text-slate-300">
                <li>Our administration desk verifies your corporate identity and SLA agreement.</li>
                <li>Your dedicated customer portal account and login password will be provisioned by the Super Admin.</li>
                <li>An activation confirmation with your credentials will be dispatched to <strong className="text-white">{formData.email}</strong> within 2 business hours.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/customer/login"
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition"
              >
                ← Return to Client Login
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                Back to Homepage
              </Link>
            </div>

            <p className="mt-6 text-[11px] text-slate-500 font-mono">
              Immediate emergency? Hotline: <a href="tel:+916380488373" className="font-semibold text-blue-400 hover:underline">+91 6380488373</a>
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl sm:p-10">
            {/* Enterprise Access Notice */}
            <div className="mb-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-200 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-white mb-1">
                <span>🛡️</span> Enterprise Provisioning Policy
              </p>
              <p className="text-[11px] text-slate-300">
                To guarantee chain-of-custody for forensic media and HIPAA/SOC-2 data security, portal accounts are provisioned exclusively by The Data Dot Administration upon verified client onboarding.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Diagnostics or Horizon Legal LLP"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aravind S."
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Direct Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98402 11928"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Corporate Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm transition font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Primary Service Requirement
                  </label>
                  <select
                    value={formData.serviceNeeded}
                    onChange={(e) => setFormData({ ...formData, serviceNeeded: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition"
                  >
                    <option value="Emergency Cleanroom Data Recovery" className="bg-slate-900 text-slate-200">Emergency Cleanroom Data Recovery</option>
                    <option value="Managed IT Services & SOC Monitoring" className="bg-slate-900 text-slate-200">Managed IT Services &amp; SOC Monitoring</option>
                    <option value="Cloud Migration & Hybrid Infrastructure" className="bg-slate-900 text-slate-200">Cloud Migration &amp; Hybrid Infrastructure</option>
                    <option value="Cybersecurity & Ransomware Defense" className="bg-slate-900 text-slate-200">Cybersecurity &amp; Ransomware Defense</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Requested SLA Tier
                  </label>
                  <select
                    value={formData.slaTier}
                    onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition"
                  >
                    <option value="Enterprise 15-Min 24/7 SLA" className="bg-slate-900 text-slate-200">Enterprise 15-Min 24/7 SLA</option>
                    <option value="Priority 4-Hour Response" className="bg-slate-900 text-slate-200">Priority 4-Hour Response</option>
                    <option value="Standard Retainer Support" className="bg-slate-900 text-slate-200">Standard Retainer Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Initial Scope / Media Symptoms / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Failed 4-bay RAID 5 array or 35 employee workstations requiring 24/7 monitoring."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Submitting Onboarding Request...</span>
                  ) : (
                    <span>Submit Onboarding Request for Admin Review →</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-400">
              Already an onboarded client?{" "}
              <Link href="/customer/login" className="font-bold text-blue-400 hover:text-blue-300">
                Sign In to Portal Here
              </Link>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-slate-500 font-mono">
          ISO Class-5 Cleanroom Certified • Protected by The Data Dot 99.98% Recovery Guarantee
        </p>
      </div>
    </main>
  );
}
