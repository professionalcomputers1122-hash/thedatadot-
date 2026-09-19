"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getCustomerSession,
  logoutCustomer,
  CustomerUser,
} from "@/lib/clientAuth";

export default function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);

  useEffect(() => {
    setCustomer(getCustomerSession());

    const handleProfileUpdate = () => {
      setCustomer(getCustomerSession());
    };

    window.addEventListener("customer-profile-updated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      window.removeEventListener("customer-profile-updated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logoutCustomer();
    router.push("/customer/login");
  };

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
      name: "FAQs",
      href: "/customer/faq",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 text-slate-900 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-6">
          <Link href="/customer/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="The Data Dot"
              width={165}
              height={28}
              priority
              style={{ height: "auto" }}
              className="w-[140px] sm:w-[160px]"
            />
            <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 hidden sm:inline-block">
              Customer Desk
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
            {navItems.map((l) => {
              const active = pathname === l.href || (l.href !== "/customer/dashboard" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
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

        {/* ACCOUNT INFO, AVATAR & ACTIONS */}
        <div className="flex items-center gap-3">
          {customer ? (
            <>
              {/* COMPANY BADGE */}
              <div className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-bold text-slate-900">
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
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden font-bold text-xs ring-2 ring-blue-200 group-hover:ring-blue-400 bg-blue-600 text-white transition">
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
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
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
