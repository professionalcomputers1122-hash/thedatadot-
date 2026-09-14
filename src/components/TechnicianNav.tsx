"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TechnicianNav() {
  const pathname = usePathname();

  const links = [
    { name: "Forensic Workbench", href: "/technician/dashboard", icon: "🔬" },
    { name: "All Hardware Tickets", href: "/technician/tickets", icon: "💽" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#070e17]/95 backdrop-blur-md text-slate-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-6">
          <Link href="/technician/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/40 text-indigo-400 border border-indigo-500/40 font-bold text-base">
              🔧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">The Data Dot</span>
                <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-extrabold">
                  Forensic Lab
                </span>
              </div>
            </div>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden sm:flex items-center gap-1 pl-4 border-l border-slate-800">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <span>{l.icon}</span>
                  <span>{l.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* STATUS & ACTIONS */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ISO Class-5 Bench Online</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
            <span className="text-slate-400">Tech:</span>
            <span className="font-bold text-white">K. Vignesh</span>
          </div>

          <Link
            href="/technician/login"
            className="rounded-xl border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </header>
  );
}
