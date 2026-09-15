"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCustomerSession, logoutCustomer, CustomerUser } from "@/lib/clientAuth";

export default function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);

  useEffect(() => {
    setCustomer(getCustomerSession());
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logoutCustomer();
    router.push("/customer/login");
  };

  const links = [
    { name: "Dashboard", href: "/customer/dashboard", icon: "📊" },
    { name: "My Tickets", href: "/customer/tickets", icon: "🎫" },
    { name: "Knowledge Base", href: "/customer/knowledge-base", icon: "📚" },
    { name: "Profile", href: "/customer/profile", icon: "🏢" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-6">
          <Link href="/customer/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-base shadow-xs">
              •
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-slate-950">The Data Dot</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200/80">
                  Customer Desk
                </span>
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xs">{l.icon}</span>
                  <span>{l.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ACCOUNT INFO & ACTIONS */}
        <div className="flex items-center gap-3">
          {customer ? (
            <>
              <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-bold text-slate-900">
                  {customer.company}
                </span>
                <span className="text-slate-400 text-[11px]">
                  • #{customer.accountNumber}
                </span>
              </div>

              <Link
                href="/customer/tickets/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <span>+ New Ticket</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/customer/login"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
            >
              Sign In to Portal →
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
