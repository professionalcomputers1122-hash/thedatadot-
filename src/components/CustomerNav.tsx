"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getCustomerSession,
  logoutCustomer,
  CustomerUser,
  getCustomerTheme,
  setCustomerTheme,
} from "@/lib/clientAuth";

export default function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setCustomer(getCustomerSession());
    setTheme(getCustomerTheme());

    const handleProfileUpdate = () => {
      setCustomer(getCustomerSession());
    };
    const handleThemeUpdate = () => {
      setTheme(getCustomerTheme());
    };

    window.addEventListener("customer-profile-updated", handleProfileUpdate);
    window.addEventListener("customer-theme-changed", handleThemeUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    window.addEventListener("storage", handleThemeUpdate);

    return () => {
      window.removeEventListener("customer-profile-updated", handleProfileUpdate);
      window.removeEventListener("customer-theme-changed", handleThemeUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
      window.removeEventListener("storage", handleThemeUpdate);
    };
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setCustomerTheme(nextTheme);
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logoutCustomer();
    router.push("/customer/login");
  };

  const isDark = theme === "dark";

  // Clean Lucide SVG Icons (No Emojis)
  const navItems = [
    {
      name: "Dashboard",
      href: "/customer/dashboard",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      name: "My Tickets",
      href: "/customer/tickets",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2" />
          <path d="M13 17v2" />
          <path d="M13 11v2" />
        </svg>
      ),
    },
    {
      name: "Knowledge Base",
      href: "/customer/knowledge-base",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      ),
    },
    {
      name: "Profile",
      href: "/customer/profile",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "CL";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b backdrop-blur-md ${
        isDark
          ? "border-[#15233b] bg-[#070e1b]/95 text-slate-100"
          : "border-slate-200 bg-white/95 text-slate-900"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-6">
          <Link href="/customer/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white text-base shadow-sm">
              •
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
                  The Data Dot
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                    isDark
                      ? "bg-blue-950/60 text-blue-400 border-blue-800/60"
                      : "bg-blue-50 text-blue-700 border-blue-200/80"
                  }`}
                >
                  Customer Desk
                </span>
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav
            className={`hidden md:flex items-center gap-1 pl-4 border-l ${
              isDark ? "border-[#162740]" : "border-slate-200"
            }`}
          >
            {navItems.map((l) => {
              const active = pathname === l.href || (l.href !== "/customer/dashboard" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? isDark
                        ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30"
                        : "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : isDark
                      ? "text-slate-300 hover:bg-[#112035] hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="opacity-90">{l.icon}</span>
                  <span>{l.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ACCOUNT INFO, THEME TOGGLE, AVATAR & ACTIONS */}
        <div className="flex items-center gap-3">
          {/* THEME TOGGLE SWITCH (Light / Dark) */}
          <button
            type="button"
            onClick={handleToggleTheme}
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition cursor-pointer ${
              isDark
                ? "border-[#1c304d] bg-[#0e1d32] text-amber-300 hover:bg-[#142844] hover:text-amber-200"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              // Sun Icon
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              // Moon Icon
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          {customer ? (
            <>
              {/* COMPANY BADGE */}
              <div
                className={`hidden lg:flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs ${
                  isDark
                    ? "border-[#192b45] bg-[#0c182a]"
                    : "border-slate-200 bg-slate-50/80"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className={`font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {customer.company}
                </span>
                <span className="text-[11px] opacity-60">
                  • #{customer.accountNumber}
                </span>
              </div>

              {/* CLIENT AVATAR / PHOTO */}
              <Link
                href="/customer/profile"
                className="flex items-center gap-2 group cursor-pointer"
                title={`${customer.name} - Profile & Settings`}
              >
                <div
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden font-bold text-xs ring-2 transition ${
                    isDark
                      ? "bg-blue-600 text-white ring-blue-500/40 group-hover:ring-blue-400"
                      : "bg-blue-600 text-white ring-blue-200 group-hover:ring-blue-400"
                  }`}
                >
                  {customer.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={customer.avatarUrl}
                      alt={customer.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(customer.name)}</span>
                  )}
                </div>
              </Link>

              <Link
                href="/customer/tickets/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-500 transition"
              >
                <span>+ New Ticket</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isDark
                    ? "border-[#1c304d] text-slate-300 hover:bg-[#122238] hover:text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/customer/login"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-xs transition"
            >
              Sign In to Portal →
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
