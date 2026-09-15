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
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070e17]/85 backdrop-blur-xl text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-6">
          <Link href="/customer/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-extrabold text-white text-base shadow-lg shadow-blue-500/25 border border-blue-400/30">
              •
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">The Data Dot</span>
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-extrabold text-blue-400 border border-blue-500/30">
                  Client Desk
                </span>
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-800">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
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
              <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-bold text-slate-200">
                  {customer.company}
                </span>
                <span className="text-slate-500 text-[11px] font-mono">
                  • #{customer.accountNumber}
                </span>
              </div>

              <Link
                href="/customer/tickets/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition"
              >
                <span>+ New Ticket</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/customer/login"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition"
            >
              Sign In to Portal →
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
