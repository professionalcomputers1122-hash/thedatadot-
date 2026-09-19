"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    teamSize: "11 - 50 employees",
    serviceFocus: "Managed IT Services (24/7 Unlimited Support & Monitoring)",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    requirements: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.companyName || !formData.contactName) return;

    setLoading(true);
    const generatedRef = `INQ-ONB-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanUrgency = formData.slaTier.includes("15-Min")
      ? "Critical"
      : formData.slaTier.includes("4-Hour")
      ? "High"
      : "Standard";

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
          teamSize: formData.teamSize,
          service: formData.serviceFocus,
          urgency: cleanUrgency,
          message: formData.requirements || "Enterprise client onboarding intake submitted via public onboarding portal.",
          source: "Dedicated Onboarding Portal",
        }),
      });

      // 2. Dispatch Dual Emails (Admin notification + Client confirmation receipt)
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
          teamSize: formData.teamSize,
          service: formData.serviceFocus,
          urgency: cleanUrgency,
          message: formData.requirements || "Enterprise client onboarding intake submitted via public onboarding portal.",
        }),
      });
    } catch (err) {
      console.warn("Onboarding submission error:", err);
    } finally {
      setRefNumber(generatedRef);
      setLoading(false);
      setSubmitted(true);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      teamSize: "11 - 50 employees",
      serviceFocus: "Managed IT Services (24/7 Unlimited Support & Monitoring)",
      slaTier: "Enterprise 15-Min 24/7 SLA",
      requirements: "",
    });
    setSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-blue-50/20 to-white py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-indigo-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Enterprise Client Onboarding &amp; SLA Intake</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-[42px] leading-tight">
            Fast-Track Your Organization Into 24/7 Managed IT &amp; SLA Protection
          </h1>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 max-w-3xl mx-auto">
            Complete your onboarding intake to establish mutual NDA coverage, dedicated account engineering, and real-time portal monitoring within 15 minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
              <span className="text-blue-600 font-bold">✓</span> 15-Minute Emergency Response
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
              <span className="text-blue-600 font-bold">✓</span> SOC 2 Type II &amp; HIPAA Compliant
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
              <span className="text-blue-600 font-bold">✓</span> 100% Mutual NDA Protected
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
              <span className="text-blue-600 font-bold">✓</span> Dedicated Account Manager
            </span>
          </div>
        </div>
      </section>

      {/* Main Intake Form Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-10">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Organization Onboarding File
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    This file is routed directly to the Super Admin desk for immediate account setup and SLA validation.
                  </p>
                </div>

                {/* Company & Contact Name */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="companyName" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Company / Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      required
                      placeholder="e.g. Apex Health Diagnostic Labs"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactName" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Primary Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Sundaram"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Corporate Business Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="rajesh@apexhealth.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Direct Phone / Escalation Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 98401 23456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Team Size & Service Focus */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="teamSize" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Organization Scale / Team Size
                    </label>
                    <select
                      id="teamSize"
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="1 - 10 employees">1 - 10 employees</option>
                      <option value="11 - 50 employees">11 - 50 employees</option>
                      <option value="51 - 250 employees">51 - 250 employees</option>
                      <option value="250+ employees">250+ employees (Enterprise Fleet)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="serviceFocus" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Primary Service Requirement <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="serviceFocus"
                      value={formData.serviceFocus}
                      onChange={(e) => setFormData({ ...formData, serviceFocus: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Managed IT Services (24/7 Unlimited Support & Monitoring)">Managed IT Services (24/7 Support & Monitoring)</option>
                      <option value="Emergency Data Recovery Lab (Cleanroom Drive & RAID Recovery)">Emergency Cleanroom Data Recovery (Drive &amp; RAID)</option>
                      <option value="Cybersecurity, EDR & SOC 2 Compliance Hardening">Cybersecurity, EDR &amp; SOC 2 Compliance Hardening</option>
                      <option value="Cloud Infrastructure & Microsoft 365 Architecture">Cloud Infrastructure &amp; Microsoft 365 Architecture</option>
                      <option value="Disaster Recovery & Immutable Cloud Backup">Disaster Recovery &amp; Immutable Cloud Backup</option>
                      <option value="Other Enterprise IT Infrastructure">Other Custom IT Requirement</option>
                    </select>
                  </div>
                </div>

                {/* Requested SLA Tier */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Requested Service Level Agreement (SLA) Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        tier: "Enterprise 15-Min 24/7 SLA",
                        tag: "Critical Outages & Forensics",
                        accent: "border-red-600 bg-red-50 text-red-900",
                        badge: "15-Min SLA",
                      },
                      {
                        tier: "Priority 4-Hour Rapid SLA",
                        tag: "Business Operational Support",
                        accent: "border-amber-600 bg-amber-50 text-amber-900",
                        badge: "< 4-Hour SLA",
                      },
                      {
                        tier: "Standard Business Support",
                        tag: "Scheduled IT Management",
                        accent: "border-blue-600 bg-blue-50 text-blue-900",
                        badge: "Same-Day SLA",
                      },
                    ].map((item) => (
                      <button
                        key={item.tier}
                        type="button"
                        onClick={() => setFormData({ ...formData, slaTier: item.tier })}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          formData.slaTier === item.tier
                            ? `${item.accent} ring-2 ring-blue-500/20 shadow-xs`
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs font-bold">{item.badge}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{item.tag}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Scope / Infrastructure */}
                <div>
                  <label htmlFor="requirements" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Current IT Infrastructure, Workstations &amp; Immediate Needs
                  </label>
                  <textarea
                    id="requirements"
                    rows={4}
                    placeholder="Describe your current IT environment (e.g. number of servers, operating systems, cloud providers, or urgent system issues)..."
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* NDA Assurance */}
                <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 text-xs text-blue-900 leading-relaxed flex items-start gap-3">
                  <span className="text-base">🛡️</span>
                  <div>
                    <strong>Standard Mutual NDA Enforced:</strong> All architecture telemetry and contact records submitted are strictly protected under mutual non-disclosure and SOC 2 Type II controls.
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-75 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing Onboarding File...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Onboarding File &amp; Initialize SLA →</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Success Confirmation */
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 text-3xl mb-5 shadow-md shadow-emerald-500/10">
                  ✓
                </div>

                <span className="inline-flex rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-3">
                  Onboarding File Registered · Fast-Track Dispatch
                </span>

                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Thank You, {formData.contactName}!
                </h2>

                <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your enterprise onboarding file for <strong className="text-slate-900">{formData.companyName}</strong> has been logged and sent to our Administration &amp; Solutions Architecture queue.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-xs max-w-md mx-auto space-y-2.5">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Tracking Reference:</span>
                    <span className="font-mono font-bold text-blue-600">#{refNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Company:</span>
                    <span className="font-semibold text-slate-900">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Target Service:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">{formData.serviceFocus}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">SLA Commitment:</span>
                    <span className="font-bold text-emerald-700">{formData.slaTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Next Milestone:</span>
                    <span className="font-bold text-blue-700">Account Provisioning &amp; Coordination Call</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Submit Another Onboarding File
                  </button>
                  <Link
                    href="/portal"
                    className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition"
                  >
                    Client Portal Access →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
