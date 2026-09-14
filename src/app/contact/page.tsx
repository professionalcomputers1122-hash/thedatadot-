"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createTicketInSupabase } from "@/lib/portalData";

// Custom SVG Icons
function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function HardDriveIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="12" x2="2" y2="12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="6" y1="16" x2="6.01" y2="16" />
      <line x1="10" y1="16" x2="10.01" y2="16" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function StarIcon({ className = "w-4 h-4 text-amber-400 fill-amber-400" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function DiscoveryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <path d="m11 8 3 3-3 3" />
    </svg>
  );
}

function BlueprintIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function DeploymentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

const serviceOptions = [
  "Managed IT Services (24/7 Unlimited Support & Monitoring)",
  "Emergency Data Recovery Lab (Cleanroom Drive & RAID Recovery)",
  "Cybersecurity, EDR & SOC 2 Compliance Hardening",
  "Cloud Infrastructure & Microsoft 365 Architecture",
  "Network Engineering, SD-WAN & Enterprise Wi-Fi",
  "Disaster Recovery & Immutable Cloud Backup",
  "Strategic IT Consulting & Virtual CIO (vCIO)",
  "Other / Custom Technical Requirement",
];

const teamSizes = [
  "1 - 10 employees",
  "11 - 50 employees",
  "51 - 250 employees",
  "250+ employees",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    teamSize: "11 - 50 employees",
    service: serviceOptions[0],
    urgency: "standard", // standard | high | critical
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedRef = `TDD-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Persist inquiry into Supabase
      await createTicketInSupabase({
        id: generatedRef,
        customerName: formData.name,
        customerEmail: formData.email,
        companyName: formData.company || "Direct Client Inquiry",
        deviceOrSubject: formData.service,
        mediaType: "GENERAL",
        urgency: formData.urgency === "critical" ? "Critical" : formData.urgency === "high" ? "High" : "Standard",
        symptoms: `Team size: ${formData.teamSize}. Phone: ${formData.phone || "N/A"}. Message: ${formData.message}`,
        techNotes: "Incoming client inquiry via website Contact page.",
      });

      // 2. Dispatch via Resend to Support Mailbox & Client
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          ticketId: generatedRef,
          customerName: formData.name,
          customerEmail: formData.email,
          companyName: formData.company,
          phone: formData.phone,
          service: formData.service,
          urgency: formData.urgency === "critical" ? "Critical" : formData.urgency === "high" ? "High" : "Standard",
          message: `Team Size: ${formData.teamSize}\n\n${formData.message}`,
        }),
      });
    } catch (err) {
      console.error("Contact submission error:", err);
    }

    setRefNumber(generatedRef);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      teamSize: "11 - 50 employees",
      service: serviceOptions[0],
      urgency: "standard",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-blue-50/20 to-white py-16 sm:py-20 lg:py-24">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-indigo-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Top SLA Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>
              <span>15-Minute Emergency Response SLA · SOC 2 &amp; ISO 27001 Standards</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[44px] leading-tight">
              Let&apos;s talk about your IT infrastructure, cloud &amp; cybersecurity.
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600">
              Whether you need 24/7 managed IT support, emergency cleanroom data recovery, cloud migration, or proactive cyber defense, our certified enterprise engineers respond within 15 minutes.
            </p>

            {/* Trust Badges Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-700">
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <span className="font-semibold text-slate-900">5.0</span>
                <span className="text-slate-500">(50+ Enterprise Reviews)</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                <span>15-Min Response SLA</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                <span>SOC 2 &amp; HIPAA Compliant</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
                <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                <span>100% Mutual NDA Protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Contact & Inquiry Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            
            {/* Left Column: Direct Communication Channels & Fast Tracks */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Direct Dispatch &amp; Support
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                  Immediate engineering assistance.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Choose the channel that best suits your timeline. For urgent system outages or physical disk emergencies, call our 24/7 hotline directly.
                </p>
              </div>

              {/* Emergency Phone Dispatch Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition-all hover:border-blue-200 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <PhoneIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-950">
                        24/7 Emergency Phone Dispatch
                      </h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live On-Call
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Direct engineering dispatch for critical server outages and emergency escalations.
                    </p>

                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Direct Hotline:</span>
                        <a
                          href="tel:+916380488373"
                          className="font-bold text-blue-600 hover:text-blue-700 hover:underline text-sm"
                        >
                          +91 6380488373
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Solutions Email */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition-all hover:border-blue-200 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <MailIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">
                      Direct Support &amp; Solutions
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Send project specifications, architecture briefs, or RFP inquiries directly to our engineering team.
                    </p>
                    <a
                      href="mailto:support@thedatadot.com"
                      className="mt-3 inline-block font-semibold text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      support@thedatadot.com
                    </a>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Guaranteed engineer response under 15 minutes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Data Recovery Lab Fast-Track */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-white p-6 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <HardDriveIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-950">
                        Emergency Data Recovery Lab
                      </h3>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        Class-5 Cleanroom
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Physical drive failure, corrupted RAID array, dropped SSD, or ransomware recovery with zero data loss guarantee.
                    </p>
                    <Link
                      href="/data-recovery"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <span>Submit Critical Drive for Lab Diagnostics</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Existing SLA Clients Portal */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition-all hover:border-blue-200 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                    <ShieldCheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">
                      Existing SLA Client Portal
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Current clients can access the SSO ticketing portal for instant priority escalations, SLA response dashboards, and status updates.
                    </p>
                    <Link
                      href="/portal"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>Open Dedicated Client Portal</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Consultation & SLA Proposal Form */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9 lg:p-10 relative">
              {!isSubmitted ? (
                <>
                  <div className="mb-8">
                    <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
                      Direct Engineering Intake
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                      Request a Consultation or SLA Proposal
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Fill out the form below. A senior solutions architect will review your environment and contact you within 15 minutes.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name & Company */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label htmlFor="company" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Company / Organization <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          placeholder="e.g. Acme Health Corp"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Business Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="s.jenkins@acme.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Direct Phone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+91 6380488373"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    {/* Team Size & Primary Need */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="teamSize" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Team / Organization Size
                        </label>
                        <select
                          id="teamSize"
                          name="teamSize"
                          value={formData.teamSize}
                          onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        >
                          {teamSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="service" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Primary Service Required <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="service"
                          name="service"
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        >
                          {serviceOptions.map((srv) => (
                            <option key={srv} value={srv}>
                              {srv}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Project Urgency Selector */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Project Urgency / SLA Target
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, urgency: "standard" })}
                          className={`rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition-all ${
                            formData.urgency === "standard"
                              ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="block font-bold">🟢 Standard</span>
                          <span className="text-[11px] font-normal opacity-80">1-2 Days</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, urgency: "high" })}
                          className={`rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition-all ${
                            formData.urgency === "high"
                              ? "border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="block font-bold">🟡 Priority</span>
                          <span className="text-[11px] font-normal opacity-80">&lt; 4 Hours</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, urgency: "critical" })}
                          className={`rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition-all ${
                            formData.urgency === "critical"
                              ? "border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500/20"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="block font-bold">🔴 Critical</span>
                          <span className="text-[11px] font-normal opacity-80">15-Min SLA</span>
                        </button>
                      </div>
                    </div>

                    {/* Detailed Requirements Message */}
                    <div>
                      <label htmlFor="message" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Project Details / Technical Requirements <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Tell us about your infrastructure (e.g., number of workstations, cloud environment, existing security posture, or any urgent pain points)..."
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* NDA & Privacy Guarantee */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="text-slate-900 font-semibold">Strict Confidentiality:</strong> All shared technical architecture and contact data are strictly governed under standard mutual NDA policies and never shared with third parties.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Routing to Senior Engineer...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Request &amp; Receive SLA Proposal</span>
                          <span>→</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-slate-400">
                      By submitting, you authorize The Data Dot technical architects to review your enquiry in accordance with our enterprise SLA.
                    </p>
                  </form>
                </>
              ) : (
                /* Submission Success State */
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>

                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-3">
                    Enquiry Logged · Fast-Track Dispatch
                  </span>

                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                    Thank you, {formData.name || "Partner"}!
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600 max-w-md mx-auto">
                    Your request has been routed to our enterprise engineering queue. A senior architect will reach out to <strong className="text-slate-900">{formData.email}</strong> within {formData.urgency === "critical" ? "15 minutes" : "2 business hours"}.
                  </p>

                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-xs max-w-md mx-auto space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Tracking Reference:</span>
                      <span className="font-bold text-blue-600">#{refNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Target Service:</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[200px]">{formData.service}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Priority SLA Tier:</span>
                      <span className="font-bold text-emerald-700 capitalize">{formData.urgency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Company:</span>
                      <span className="font-semibold text-slate-900">{formData.company}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
                    >
                      Submit Another Technical Inquiry
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Upgraded "What Happens Next" Process Cards (Replacing 01, 02, 03) */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Clear &amp; Predictable Process
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-950">
              What happens after you reach out?
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              We eliminate ambiguity with a systematic, engineer-led consultation designed to respect your time and provide actionable solutions immediately.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Step 1 Card */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <DiscoveryIcon />
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                  STEP 01
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                Rapid Architecture &amp; Needs Discovery
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Within 15 minutes of your enquiry, an enterprise solutions engineer analyzes your current infrastructure, compliance constraints, and immediate technology pain points.
              </p>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  No Sales Pressure · Direct Tech Review
                </span>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BlueprintIcon />
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                  STEP 02
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                Tailored Scope &amp; Fixed-Fee SLA Proposal
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                We present a comprehensive, customized roadmap outlining proactive monitoring, guaranteed SLA response thresholds, and straightforward transparent pricing without hidden surprises.
              </p>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  100% Transparent Retainer or Project Scope
                </span>
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <DeploymentIcon />
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                  STEP 03
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                Zero-Downtime Rollout &amp; 24/7 Coverage
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Our deployment team coordinates non-disruptive agent installations, configures secure backups, and provides your team immediate access to our 24/7 priority helpdesk.
              </p>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  Dedicated Technical Account Lead
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dark Navy Global CTA Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 py-16 sm:py-20 text-white relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            <span>24/7/365 On-Call Emergency IT &amp; Lab Support</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[40px] leading-tight">
            Experiencing a critical outage or catastrophic data loss?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            Do not let system downtime disrupt your business operations. Our rapid dispatch engineers and cleanroom data recovery specialists are standing by.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="tel:+916380488373"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 hover:shadow-blue-500/35"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Call Dispatch: +91 6380488373</span>
            </a>

            <Link
              href="/data-recovery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-blue-400 hover:bg-slate-800"
            >
              <HardDriveIcon className="w-4 h-4 text-blue-400" />
              <span>Emergency Data Recovery Lab</span>
            </Link>

            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              <span>Explore All Services</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}