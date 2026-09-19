"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { getAdminSession, clearAdminSession, AdminSession } from "@/lib/adminAuth";

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
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      router.push("/admin/login");
    } else {
      setAdminSession(session);
      setAuthChecking(false);
    }

    const handleSessionChange = (e: any) => {
      if (!e.detail) {
        router.push("/admin/login");
      } else {
        setAdminSession(e.detail);
      }
    };

    window.addEventListener("tdd_admin_session_changed", handleSessionChange);
    return () => window.removeEventListener("tdd_admin_session_changed", handleSessionChange);
  }, [router]);

  const handleSignOut = () => {
    clearAdminSession();
    router.push("/admin/login");
  };

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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-600 text-xs font-mono">
          <div className="h-8 w-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          <span>Verifying Executive Security Credentials (ebinezer@thedatadot.com)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row antialiased selection:bg-red-600 selection:text-white">
      {/* 1. LIGHT SIDEBAR (CLEAN WHITE THEME MATCHING CLIENT & TECHNICIAN DESIGN) */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col justify-between shadow-xs">
        <div>
          {/* BRAND HEADER */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-red-600/20">
                •
              </div>
              <div>
                <span className="text-sm font-bold text-slate-950 tracking-tight block">The Data Dot</span>
                <span className="block text-[10px] text-red-600 font-extrabold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* NAV GROUPS */}
          <nav className="p-3.5 space-y-5 text-xs">
            {navGroups.map((grp) => (
              <div key={grp.group}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1.5">
                  {grp.group}
                </span>
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          active
                            ? "bg-red-50 text-red-700 font-bold border border-red-200/80 shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span className={active ? "text-red-600" : "text-slate-400"}>
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

        {/* BOTTOM USER PANEL (EBINEZER PROFILE & LOGOUT) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 text-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs border border-red-200 shadow-xs">
                EB
              </div>
              <div className="truncate max-w-[120px]">
                <p className="font-bold text-slate-900 text-xs truncate">
                  {adminSession?.name || "Ebinezer"}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-mono">
                  {adminSession?.email || "ebinezer@thedatadot.com"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-[10px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition cursor-pointer shadow-xs"
              title="End Secure Admin Session"
            >
              Sign Out
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="block text-center text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition pt-1"
          >
            ← View Public Website
          </Link>
        </div>
      </aside>

      {/* 2. PURE WHITE MAIN APPLICATION SHELL */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* TOP STATUS HEADER BAR (WHITE THEME MATCHING CLIENT & TECHNICIAN MOCKUPS) */}
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
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
