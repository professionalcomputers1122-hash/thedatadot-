"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { getAdminSession, clearAdminSession, AdminSession } from "@/lib/adminAuth";

interface AdminLayoutShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  onNewJobClick?: () => void;
  onCreateReportClick?: () => void;
}

export default function AdminLayoutShell({
  children,
  title,
  subtitle,
  actions,
  onNewJobClick,
  onCreateReportClick,
}: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
        {
          name: "Reports & Forensic SLA",
          href: "/admin/reports",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
        {
          name: "Technician Bench",
          href: "/admin/technicians",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
      ],
    },
    {
      group: "CONTENT & KNOWLEDGE",
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
      <div className="min-h-screen bg-[#0c1424] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-300 text-xs font-mono">
          <div className="h-9 w-9 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="font-semibold tracking-wide">
            Authenticating Session (ebinezer@thedatadot.com)...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. LEFT SIDEBAR (EXACT DARK NAVY/SLATE BLUE THEME FROM SCREENSHOT) */}
      <aside className="w-full md:w-64 shrink-0 bg-[#0c1424] border-r border-slate-800 flex flex-col justify-between z-40 text-slate-300">
        <div>
          {/* LOGO & BRAND */}
          <div className="p-4 border-b border-slate-800/80">
            <Link href="/admin/dashboard" className="block group">
              <div className="bg-white rounded-xl px-3.5 py-2 inline-flex items-center justify-center shadow-xs border border-white/20 group-hover:shadow-md transition">
                <Image
                  src="/logo.png"
                  alt="The Data Dot"
                  width={145}
                  height={26}
                  priority
                  style={{ height: "auto" }}
                  className="w-[130px]"
                />
              </div>
              <span className="block text-[9.5px] text-slate-400 font-medium tracking-tight mt-2 leading-tight">
                Data Recovery | IT Support | Cyber Security
                <br />
                <span className="text-blue-400 font-bold uppercase tracking-wider text-[8.5px]">Admin Command Console</span>
              </span>
            </Link>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <nav className="p-3 space-y-4 text-xs max-h-[calc(100vh-270px)] overflow-y-auto custom-scrollbar">
            {navGroups.map((grp) => (
              <div key={grp.group}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                  {grp.group}
                </span>
                <div className="space-y-1">
                  {grp.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.name + item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition ${
                          active
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
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

        {/* BOTTOM SECTION: CLEAN PROFILE & WEBSITE LINK */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090f1c] text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-white transition py-1"
          >
            <span>View Public Website</span>
            <span>↗</span>
          </Link>
          <div className="pt-2 mt-1.5 border-t border-slate-800/80 text-[9.5px] font-bold tracking-wider text-slate-500">
            DATA TODAY. A BETTER TOMORROW.
          </div>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7fb]">
        {/* TOP STATUS & SEARCH HEADER (EXACT WHITE BAR FROM SCREENSHOT) */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4 w-full max-w-lg">
            {/* Header Official Logo */}
            <Link href="/admin/dashboard" className="flex items-center shrink-0" title="The Data Dot Dashboard">
              <Image
                src="/logo.png"
                alt="The Data Dot"
                width={135}
                height={24}
                priority
                style={{ height: "auto" }}
                className="w-[115px] sm:w-[130px]"
              />
            </Link>

            {/* SEARCH BAR */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by Job ID, Client Name, Serial Number, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* RIGHT ACTIONS: NOTIFICATIONS, SETTINGS & PROFILE PILL */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            {/* Direct Technician Bench Link */}
            <Link
              href="/admin/technicians"
              className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="View Technician Bench Roster"
            >
              <span>⚡ Technician Bench</span>
              <span>→</span>
            </Link>

            {/* Notification Bell with Badge 3 */}
            <Link
              href="/admin/inquiries"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                3
              </span>
            </Link>

            {/* Settings Cog */}
            <Link
              href="/admin/settings"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* Profile Pill & Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-[#0c1424] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    Super Admin
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    The Data Dot
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{adminSession?.name || "Ebinezer"}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{adminSession?.email || "ebinezer@thedatadot.com"}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Security &amp; Settings
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Public Website →
                  </Link>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-bold"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY CANVAS */}
        <main className="p-6 sm:p-8 flex-1">
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                {title && (
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
