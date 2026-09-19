"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface AdminLayoutShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AdminLayoutShell({
  children,
  title,
  subtitle,
  actions,
}: AdminLayoutShellProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      group: "OVERVIEW",
      items: [
        {
          name: "Executive Dashboard",
          href: "/admin/dashboard",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          name: "Reports & Forensic SLA",
          href: "/admin/reports",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        {
          name: "Client Requests / Leads",
          href: "/admin/inquiries",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          ),
        },
        {
          name: "Master Tickets",
          href: "/admin/tickets",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          ),
        },
        {
          name: "Customer Accounts",
          href: "/admin/customers",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
        {
          name: "Client Companies",
          href: "/admin/companies",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          name: "Lab Technicians",
          href: "/admin/technicians",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "CONTENT CMS",
      items: [
        {
          name: "Blog Publisher",
          href: "/admin/blog",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
        {
          name: "FAQ Manager",
          href: "/admin/faq",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          name: "Knowledge Base",
          href: "/admin/knowledge-base",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        {
          name: "Company Settings",
          href: "/admin/settings",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          ),
        },
        {
          name: "SOC 2 Audit Logs",
          href: "/admin/audit-logs",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1324] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-[#0f172a] flex flex-col justify-between">
        <div>
          {/* BRAND HEADER */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                •
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight">The Data Dot</span>
                <span className="block text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* NAV GROUPS */}
          <nav className="p-3.5 space-y-5 text-xs">
            {navGroups.map((grp) => (
              <div key={grp.group}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                  {grp.group}
                </span>
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          active
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                        }`}
                      >
                        <span className={active ? "text-white" : "text-slate-400"}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* BOTTOM USER PANEL */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/30">
                SA
              </div>
              <div className="truncate max-w-[120px]">
                <p className="font-bold text-white text-xs truncate">Super Admin</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">admin@thedatadot.com</p>
              </div>
            </div>
            <Link
              href="/admin/login"
              className="text-[10px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              Sign Out
            </Link>
          </div>

          <Link
            href="/"
            target="_blank"
            className="block text-center text-[11px] font-medium text-slate-400 hover:text-blue-400 transition pt-1"
          >
            ← View Public Website
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0b1324]">
        {/* TOP STATUS HEADER BAR */}
        <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-6 sm:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
