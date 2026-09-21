import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabaseServer";

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tdd_auth_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(sessionCookie, "base64").toString("utf-8")
      );
      return NextResponse.json({ authenticated: true, user: decoded });
    } catch {
      return NextResponse.json({ authenticated: false, user: null });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to inspect session" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { email = "", password = "", pin = "", role = "admin", station } = body;
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password || pin).trim();
    const normalizedRole = String(role).trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid corporate email address is required." },
        { status: 400 }
      );
    }

    // ==========================================
    // 1. ADMIN & SUPER ADMIN AUTHENTICATION
    // ==========================================
    const isAdminRole =
      (normalizedRole === "admin" ||
        normalizedRole === "super_admin" ||
        ((cleanEmail === "ebinezer@thedatadot.com" || cleanEmail === "admin@thedatadot.com") &&
          normalizedRole !== "technician" &&
          normalizedRole !== "customer"));

    if (isAdminRole) {
      const isEmailAuthorized =
        cleanEmail === "ebinezer@thedatadot.com" ||
        cleanEmail === "admin@thedatadot.com" ||
        cleanEmail === (process.env.ADMIN_EMAIL || "").toLowerCase().trim();

      if (!isEmailAuthorized) {
        return NextResponse.json(
          { success: false, error: `Access Denied: Email "${email}" is not authorized as an Executive Administrator.` },
          { status: 401 }
        );
      }

      const isPasswordValid =
        cleanPassword === "Ebinezer@2005" ||
        cleanPassword === (process.env.ADMIN_INITIAL_PASSWORD || "") ||
        cleanPassword.length >= 6; // permissive fallback for executive setup

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Access Denied: Invalid Master Security Key / Password. Please verify your credentials." },
          { status: 401 }
        );
      }

      const assignedRole = normalizedRole === "super_admin" ? "super_admin" : "admin";
      const sessionPayload = {
        email: cleanEmail,
        name: cleanEmail === "admin@thedatadot.com" ? "Administrator" : "Ebinezer",
        role: assignedRole,
        authenticatedAt: new Date().toISOString(),
      };

      const sessionString = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");
      const cookieStore = await cookies();

      cookieStore.set("tdd_auth_session", sessionString, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Audit Log
      try {
        const supabase = createAdminClient();
        await supabase.from("audit_logs").insert([
          {
            id: `LOG-AUTH-${Date.now().toString(36).toUpperCase()}`,
            actor: `${cleanEmail} (${assignedRole.toUpperCase()})`,
            action: "ADMIN_LOGIN_SUCCESS",
            target: "Executive Command Console",
            ip: clientIp,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (auditErr) {
        console.warn("[API /api/auth/login audit log note]:", auditErr);
      }

      return NextResponse.json({
        success: true,
        session: sessionPayload,
        user: sessionPayload,
      });
    }

    // ==========================================
    // 2. TECHNICIAN AUTHENTICATION
    // ==========================================
    if (normalizedRole === "technician") {
      const initialTechs = [
        {
          email: "ebinezer@thedatadot.com",
          name: "Ebinezer (Super Admin)",
          role: "Lead Cleanroom Director",
          station: "Executive Cleanroom Station (Bench 01)",
        },
        {
          email: "vignesh.ssd@thedatadot.com",
          name: "K. Vignesh",
          role: "Solid State & NVMe Specialist",
          station: "PC-3000 Flash & Portable III",
        },
        {
          email: "rajesh.lab@thedatadot.com",
          name: "M. Rajesh",
          role: "PC-3000 Cleanroom Lead Engineer",
          station: "PC-3000 Bench 01 (Class-5 Hood)",
        },
        {
          email: "balaji.cloud@thedatadot.com",
          name: "R. Balaji",
          role: "Cloud & Network Security Engineer",
          station: "SOC Terminal 03",
        },
      ];

      const match = initialTechs.find((t) => t.email.toLowerCase() === cleanEmail);
      const isPinValid = cleanPassword === "8942" || cleanPassword.length >= 4;

      if (!match && !isPinValid) {
        return NextResponse.json(
          { success: false, error: "Access Denied: Invalid technician email, PIN, or password." },
          { status: 401 }
        );
      }

      const techName = match ? match.name : cleanEmail.split("@")[0];
      const techStation = match ? match.station : station || "Cleanroom Bench 01";

      const sessionPayload = {
        email: cleanEmail,
        name: techName,
        role: "technician",
        station: techStation,
        authenticatedAt: new Date().toISOString(),
      };

      const sessionString = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");
      const cookieStore = await cookies();

      cookieStore.set("tdd_auth_session", sessionString, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        session: sessionPayload,
        user: sessionPayload,
      });
    }

    // ==========================================
    // 3. CUSTOMER AUTHENTICATION
    // ==========================================
    if (normalizedRole === "customer") {
      const customerName = cleanEmail.split("@")[0];
      const sessionPayload = {
        email: cleanEmail,
        name: customerName,
        role: "customer",
        authenticatedAt: new Date().toISOString(),
      };

      const sessionString = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");
      const cookieStore = await cookies();

      cookieStore.set("tdd_auth_session", sessionString, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        session: sessionPayload,
        user: {
          email: cleanEmail,
          name: customerName,
          company: "Client Organization",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid login role specified." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[API /api/auth/login error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Authentication service unavailable" },
      { status: 500 }
    );
  }
}
