"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import { getAdminSession, AdminSession } from "@/lib/adminAuth";

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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#070e1b] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-xs font-mono">
          <div className="h-8 w-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <span>Verifying Executive Security Credentials (ebinezer@thedatadot.com)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070e1b] text-slate-100 flex flex-col antialiased selection:bg-red-600 selection:text-white">
      {/* 1. TOP NAVIGATION HEADER (MATCHING CLIENT & TECHNICIAN DASHBOARDS) */}
      <AdminNav />

      {/* 2. SUBHEADER WITH PAGE TITLE & ACTION BUTTONS */}
      <div className="border-b border-slate-800/80 bg-[#091224]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      </div>

      {/* 3. CENTERED MAX-W-7XL CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {children}
      </main>

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
}
