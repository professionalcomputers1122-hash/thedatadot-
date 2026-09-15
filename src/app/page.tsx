import Link from "next/link";
import Image from "next/image";
import Tech3D from "@/components/Tech3D";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-slate-100">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              Reliable IT. Secure Business.
            </div>

            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[42px] leading-tight">
              IT support that keeps your business moving.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              The Data Dot provides practical IT support, cybersecurity,
              cloud solutions, backup, networking and technology consulting
              for businesses that depend on reliable systems.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-lg bg-blue-600 px-7 py-4 text-center font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Talk to Our Team
              </Link>

              <Link
                href="/services"
                className="rounded-lg border border-slate-300 bg-white px-7 py-4 text-center font-semibold text-slate-800 transition hover:border-blue-400 hover:text-blue-600"
              >
                Explore Services
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-bold text-slate-950">24/7</p>
                <p className="text-sm text-slate-500">Support focused</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-950">Secure</p>
                <p className="text-sm text-slate-500">Security-first approach</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-950">Scalable</p>
                <p className="text-sm text-slate-500">Built for growth</p>
              </div>
            </div>
          </div>

          {/* RIGHT - SERVER ANIMATION */}
          <div className="relative min-h-[500px]">
            <Tech3D />
          </div>
        </div>
      </section>

      {/* ================= TRUST & COMPLIANCE BAR ================= */}
      <section className="border-y border-slate-200/80 bg-slate-50/70 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 text-center">
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span>Serving Enterprise Teams</span>
          </div>

          <div className="hidden md:block h-4 w-px bg-slate-300" />

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">✓</span>
              <span><strong>SOC 2 Type II</strong> Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">✓</span>
              <span><strong>GDPR &amp; UK DPA</strong> Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">✓</span>
              <span><strong>ISO 27001</strong> Standards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">✓</span>
              <span><strong>15-Min</strong> Emergency SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Core Capabilities
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              Technology that works for your business
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              From everyday IT support to cybersecurity and cloud infrastructure,
              we help businesses keep technology reliable, secure, and useful.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={<HeadsetIcon />}
              title="Managed IT"
              description="Reliable day-to-day technology support for your team, so you can focus on your business."
            />

            <ServiceCard
              icon={<CybersecurityIcon />}
              title="Cybersecurity"
              description="Protect users, systems and business data from modern threats."
            />

            <ServiceCard
              icon={<CloudIcon />}
              title="Cloud & Microsoft 365"
              description="Modern cloud systems without unnecessary complexity."
            />

            <ServiceCard
              icon={<NetworkIcon />}
              title="Networks"
              description="Reliable business connectivity and infrastructure."
            />

            <ServiceCard
              icon={<BackupRecoveryIcon />}
              title="Backup & Recovery"
              description="Prepare your business for disruption and recovery."
            />

            <ServiceCard
              icon={<ConsultingIcon />}
              title="IT Consulting"
              description="Make better technology decisions with confidence."
            />
          </div>
        </div>
      </section>

      {/* ================= WHY US ================= */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Why The Data Dot
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Technology should make business easier
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                We focus on clear communication, practical solutions, and
                security-conscious technology decisions instead of unnecessary
                complexity.
              </p>

              <div className="mt-8 space-y-5">
                <Benefit
                  title="Business-focused support"
                  text="We look at the technology problem from a business perspective."
                />

                <Benefit
                  title="Security-conscious by design"
                  text="Security is considered across systems, users, devices and data."
                />

                <Benefit
                  title="Clear communication"
                  text="You should understand what is happening and why it matters."
                />

                <Benefit
                  title="Built to scale"
                  text="Technology should support your business as it grows."
                />
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="grid gap-5 sm:grid-cols-2">
                  <StatCard
                    number="01"
                    title="Understand"
                    text="Learn how your business operates."
                  />

                  <StatCard
                    number="02"
                    title="Assess"
                    text="Identify risks and technology gaps."
                  />

                  <StatCard
                    number="03"
                    title="Improve"
                    text="Implement practical improvements."
                  />

                  <StatCard
                    number="04"
                    title="Support"
                    text="Keep improving as your business changes."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INDUSTRIES ================= */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Industries
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                IT support for growing businesses
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                Our approach can be adapted to the technology needs,
                workflows, and security requirements of different industries.
              </p>
            </div>

            <Link
              href="/industries"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              View all industries →
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <IndustryCard
              title="Small & Medium Businesses"
              image="/images/industries/smb.jpg.png"
            />

            <IndustryCard
              title="Professional Services"
              image="/images/industries/professional-services.jpg.png"
            />

            <IndustryCard
              title="Healthcare"
              image="/images/industries/healthcare.jpg.png"
            />

            <IndustryCard
              title="Construction"
              image="/images/industries/construction.jpg.png"
            />
          </div>
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Security &amp; Trust
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Protect the technology your business depends on
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
                Security is not a single product. It is a layered approach
                covering identity, devices, networks, cloud services,
                backups, and people.
              </p>

              <Link
                href="/security"
                className="mt-8 inline-flex rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Explore Security
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SecurityCard
                title="Identity & Access"
                text="Protect accounts and control access."
              />

              <SecurityCard
                title="Endpoint Security"
                text="Protect business devices and users."
              />

              <SecurityCard
                title="Network Security"
                text="Reduce infrastructure and connectivity risks."
              />

              <SecurityCard
                title="Backup & Recovery"
                text="Prepare for accidental loss and disruption."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              How It Works
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              A Transparent, Predictable Path to Reliable IT
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              From initial assessment to continuous 24/7 monitoring, we ensure seamless technology without unexpected downtime.
            </p>
          </div>

          <div className="mt-14 relative">
            <div className="hidden md:block absolute top-12 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -z-0" />

            <div className="grid gap-6 md:grid-cols-4 relative z-10">
              <ProcessStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M8 9h8" />
                    <path d="M8 13h5" />
                  </svg>
                }
                badge="Phase 1"
                title="Discover"
                subtitle="Goal Alignment & Review"
                text="We discuss your business workflows, team challenges, and software stack in a zero-pressure discovery session."
              />

              <ProcessStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <circle cx="12" cy="11" r="3" />
                    <path d="m14.5 13.5 2.5 2.5" />
                  </svg>
                }
                badge="Phase 2"
                title="Audit & Assess"
                subtitle="Infrastructure Health Check"
                text="We inspect your network, cloud setup, and security gaps to deliver a prioritized, transparent roadmap."
              />

              <ProcessStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>
                }
                badge="Phase 3"
                title="Deploy & Modernize"
                subtitle="Zero-Downtime Rollout"
                text="We roll out tested cloud tools, automated backups, and cybersecurity defenses without interrupting your team."
              />

              <ProcessStep
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    <path d="M12 12v3" />
                    <path d="M9 13.5h6" />
                  </svg>
                }
                badge="Continuous"
                badgeColor="emerald"
                title="Protect & Manage"
                subtitle="24/7 Monitoring & 15-Min SLA"
                text="Certified engineers monitor your infrastructure 24/7/365, proactively preventing downtime with rapid support."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLOG & INSIGHTS ================= */}
      <section className="border-b border-slate-200/80 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Knowledge &amp; Tech Advice</span>
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Practical Technology Insights
              </h2>

              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Actionable advice on cybersecurity, cloud migrations, and proactive IT support from our technical specialists.
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-800"
            >
              <span>View all articles</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <BlogCard
              title="10 Cybersecurity Tips for Small Businesses"
              category="Cybersecurity"
              date="Sep 10, 2026"
              readTime="5 min read"
              image="/images/blog/cybersecurity-tips.jpg"
              excerpt="Practical, cost-effective defense tactics to protect workstations, employee credentials, and sensitive customer data."
            />

            <BlogCard
              title="The Benefits of Cloud Solutions for Growing Companies"
              category="Cloud Solutions"
              date="Sep 05, 2026"
              readTime="4 min read"
              image="/images/blog/cloud-solutions.jpg"
              excerpt="How modern cloud infrastructure and Microsoft 365 eliminate physical server headaches and enhance remote collaboration."
            />

            <BlogCard
              title="How to Choose the Right IT Support Partner"
              category="Managed IT"
              date="Aug 28, 2026"
              readTime="6 min read"
              image="/images/blog/it-partner.jpg"
              excerpt="The critical criteria to evaluate before signing an IT agreement: response SLAs, security accountability, and flat pricing."
            />
          </div>
        </div>
      </section>

      {/* ================= READY TO GET STARTED GLOBAL BANNER ================= */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071426] via-[#092244] to-[#071426] p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
            <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />

            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-white">
                    Ready to Get Started?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    Let&apos;s build a more secure and productive future together.
                    Speak with an IT specialist today.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-200/90">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      15-Min Response SLA
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      24/7 Security Operations
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      Predictable Flat-Rate Pricing
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-xl"
                >
                  <span>Get a Free Consultation</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

                <Link
                  href="/portal"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/40"
                >
                  <span>Client Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </main>
  );
}

/* ================= COMPONENTS ================= */

function HeadsetIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="headsetGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M6 18v-3a10 10 0 0 1 20 0v3"
        stroke="url(#headsetGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <rect x="4" y="16" width="4.5" height="8" rx="2.25" fill="url(#headsetGrad)" />
      <rect x="23.5" y="16" width="4.5" height="8" rx="2.25" fill="url(#headsetGrad)" />
      <path
        d="M25 22v2a4 4 0 0 1-4 4h-3"
        stroke="url(#headsetGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="28" r="1.5" fill="url(#headsetGrad)" />
    </svg>
  );
}

function CybersecurityIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.5L26 7.5v8c0 6.8-4.5 13.2-10 15.5-5.5-2.3-10-8.7-10-15.5v-8L16 3.5z"
        fill="url(#shieldGrad)"
      />
      <path
        d="M11.5 16.5l3.5 3.5 6-6.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M23.5 24H8.5A6.5 6.5 0 0 1 8 11.02a8 8 0 0 1 15.2-2.12A6 6 0 0 1 23.5 24z"
        fill="url(#cloudGrad)"
      />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="netGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="12" y="4" width="8" height="6.5" rx="2" fill="url(#netGrad)" />
      <path d="M16 10.5v6" stroke="url(#netGrad)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M7 16.5h18" stroke="url(#netGrad)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M7 16.5v5M25 16.5v5" stroke="url(#netGrad)" strokeWidth="2.8" strokeLinecap="round" />
      <rect x="3" y="21.5" width="8" height="6.5" rx="2" fill="url(#netGrad)" />
      <rect x="21" y="21.5" width="8" height="6.5" rx="2" fill="url(#netGrad)" />
    </svg>
  );
}

function BackupRecoveryIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="dbGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M5 8c0-2.2 4.9-4 11-4s11 1.8 11 4-4.9 4-11 4-11-1.8-11-4z"
        fill="url(#dbGrad)"
      />
      <path
        d="M5 8v6c0 2.2 4.9 4 11 4 1.5 0 2.9-.1 4.2-.35"
        stroke="url(#dbGrad)"
        strokeWidth="3.2"
        fill="none"
      />
      <path
        d="M5 14v6c0 2.2 4.9 4 11 4 1.1 0 2.1-.06 3.1-.18"
        stroke="url(#dbGrad)"
        strokeWidth="3.2"
        fill="none"
      />
      <path
        d="M26.5 19.5a4.5 4.5 0 1 1-4.2 6.1"
        stroke="url(#dbGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M22 19.5h4.5v4.5"
        stroke="url(#dbGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConsultingIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="4" y="19" width="5.5" height="9" rx="1.5" fill="url(#barGrad)" />
      <rect x="13.25" y="14" width="5.5" height="14" rx="1.5" fill="url(#barGrad)" />
      <rect x="22.5" y="9" width="5.5" height="19" rx="1.5" fill="url(#barGrad)" />
      <path
        d="M5 12l8-7 13-1"
        stroke="url(#barGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 4h5v5"
        stroke="url(#barGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  href = "/services",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-start overflow-hidden rounded-[28px] border border-blue-100/80 bg-white p-8 sm:p-9 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10"
    >
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-gradient-to-tl from-blue-100/60 via-blue-50/30 to-transparent transition-transform duration-500 group-hover:scale-125" />

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ecf3fe] border border-blue-100/60 transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-950 tracking-tight">
        {title}
      </h3>

      <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      <div className="mt-6 flex h-9 w-9 items-center justify-center rounded-full bg-[#ecf3fe] text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function Benefit({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
        ✓
      </div>

      <div>
        <h3 className="font-semibold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 leading-6 text-slate-600">
          {text}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <span className="text-sm font-bold text-blue-600">
        {number}
      </span>

      <h3 className="mt-3 font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>
    </div>
  );
}

function IndustryCard({
  title,
  image,
}: {
  title: string;
  image: string;
}) {
  return (
    <Link
      href="/industries"
      className="group relative block h-64 overflow-hidden rounded-2xl bg-slate-200"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-bold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-200">
          IT support & technology solutions
        </p>
      </div>
    </Link>
  );
}

function SecurityCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 h-2 w-10 rounded-full bg-blue-500" />

      <h3 className="font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function ProcessStep({
  icon,
  badge,
  badgeColor = "blue",
  title,
  subtitle,
  text,
}: {
  icon: React.ReactNode;
  badge: string;
  badgeColor?: "blue" | "emerald";
  title: string;
  subtitle: string;
  text: string;
}) {
  return (
    <div className="group flex flex-col items-center rounded-3xl border border-slate-200/90 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/10">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-500 group-hover:to-blue-600">
        {icon}
      </div>

      <span
        className={`mt-5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
          badgeColor === "emerald"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-blue-50 text-blue-600"
        }`}
      >
        {badge}
      </span>

      <h3 className="mt-2 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-xs font-semibold text-slate-700">
        {subtitle}
      </p>

      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
        {text}
      </p>
    </div>
  );
}

function BlogCard({
  title,
  category,
  date,
  readTime,
  image,
  excerpt,
}: {
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
}) {
  return (
    <Link
      href="/blog"
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/20">
          {category}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>{date}</span>
            <span>•</span>
            <span className="text-blue-600 font-bold">{readTime}</span>
          </div>

          <h3 className="mt-3 text-lg font-bold leading-snug text-slate-950 transition group-hover:text-blue-600">
            {title}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
            {excerpt}
          </p>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition group-hover:text-blue-800">
            <span>Read Full Insight</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              className="transition group-hover:translate-x-1"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
