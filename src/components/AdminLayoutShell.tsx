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
        { name: "Executive Dashboard", href: "/admin/dashboard", icon: "📊" },
        { name: "Reports & Forensic SLA", href: "/admin/reports", icon: "📈" },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        { name: "Master Tickets", href: "/admin/tickets", icon: "🎫" },
        { name: "Customer Accounts", href: "/admin/customers", icon: "👤" },
        { name: "Client Companies", href: "/admin/companies", icon: "🏢" },
        { name: "Lab Technicians", href: "/admin/technicians", icon: "🔧" },
      ],
    },
    {
      group: "CONTENT CMS",
      items: [
        { name: "Blog Publisher", href: "/admin/blog", icon: "📝" },
        { name: "FAQ Manager", href: "/admin/faq", icon: "❓" },
        { name: "Knowledge Base", href: "/admin/knowledge-base", icon: "📚" },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        { name: "Company Settings", href: "/admin/settings", icon: "⚙️" },
        { name: "SOC 2 Audit Logs", href: "/admin/audit-logs", icon: "🛡️" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#060c18] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-[#070e1b] flex flex-col justify-between">
        <div>
          {/* LOGO & BRAND */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-600/20 border border-red-500/30">
                👑
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight">The Data Dot</span>
                <span className="block text-[10px] text-red-400 font-bold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* NAV ITEMS */}
          <nav className="p-4 space-y-5 text-xs">
            {navGroups.map((grp) => (
              <div key={grp.group}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                  {grp.group}
                </span>
                <div className="space-y-1">
                  {grp.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition ${
                          active
                            ? "bg-blue-600 text-white font-bold shadow-xs"
                            : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                        }`}
                      >
                        <span className="text-xs">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* BOTTOM USER & ACTIONS */}
        <div className="p-4 border-t border-slate-800 text-xs bg-slate-950/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-red-600/30 text-red-400 font-bold flex items-center justify-center text-xs border border-red-500/40">
                A
              </div>
              <div className="truncate max-w-[120px]">
                <p className="font-bold text-white text-[11px] truncate">Super Admin</p>
                <p className="text-[10px] text-slate-400 truncate">support@thedatadot.com</p>
              </div>
            </div>
            <Link
              href="/admin/login"
              className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Exit
            </Link>
          </div>

          <Link
            href="/"
            target="_blank"
            className="block text-center text-[11px] font-semibold text-blue-400 hover:underline pt-1"
          >
            ← View Public Website
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* HEADER BAR */}
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* PAGE BODY */}
        <div className="p-6 sm:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
