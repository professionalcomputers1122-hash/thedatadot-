import Header from "@/components/Header";
import PortalLoginForm from "@/components/PortalLoginForm";

export const metadata = {
  title: "Client Portal & Support Desk | The Data Dot",
  description:
    "Secure client login, ticket submission, and 24/7 technical assistance for authorized enterprise clients.",
};

export default function ClientPortalPage() {
  return (
    <main className="min-h-screen bg-[#071426] text-white selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[160px]" />
      </div>

      {/* Top Header */}
      <Header theme="dark" />

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Information, SLA, & Support Channels */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Enterprise Client Workspace
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] leading-tight">
              Unified IT Support &amp;{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Service Desk
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              Authorized portal for enterprise client organizations.
              Submit emergency service tickets, monitor infrastructure health,
              and connect with your dedicated engineering team.
            </p>

            {/* Quick Access Badges / Features */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-white">15-Min Response SLA</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Priority routing to Tier-3 network &amp; security engineers for critical outages.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <h3 className="mt-3 font-semibold text-white">Remote Assistance</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  One-click instant remote diagnostic session for Windows, macOS, and Linux servers.
                </p>
              </div>
            </div>

            {/* Direct Emergency Phone Line */}
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                24/7/365 Emergency Dispatch Line:
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="text-slate-400">Direct Line:</span>
                  <a href="tel:+916380488373" className="font-bold text-blue-400 hover:underline">
                    +91 6380488373
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Secure Client Login Card */}
          <div className="lg:col-span-6">
            <PortalLoginForm />
          </div>

        </div>
      </div>
    </main>
  );
}
