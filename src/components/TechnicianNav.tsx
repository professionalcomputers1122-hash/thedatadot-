"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TechnicianNav() {
  const pathname = usePathname();

  const links = [
    { name: "Diagnostic Workbench", href: "/technician/dashboard" },
    { name: "All Incidents & Tickets", href: "/technician/tickets" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0a0f1d]/95 backdrop-blur-md text-slate-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* LOGO & TITLE */}
        <div className="flex items-center gap-6">
          <Link href="/technician/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-extrabold text-white text-sm shadow-sm">
              •
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">Technician Workbench</span>
            </div>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden sm:flex items-center gap-1 pl-4 border-l border-slate-800 text-xs">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    active
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  {l.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* STATUS & ACTIONS */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Server: Online</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-slate-300">
            <span>Updates: Current</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center">
              KV
            </div>
            <span className="text-slate-200 font-semibold text-xs">K. Vignesh</span>
          </div>

          <Link
            href="/technician/login"
            className="rounded-lg border border-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            Exit
          </Link>
        </div>
      </div>
    </header>
  );
}
