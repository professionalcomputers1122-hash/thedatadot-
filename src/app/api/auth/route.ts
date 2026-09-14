import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tdd_auth_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(sessionCookie, "base64").toString("utf-8")
      );
      return NextResponse.json({
        authenticated: true,
        user: decoded,
      });
    } catch {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
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

    const body = await req.json();
    const { email, role = "customer", name, pin, accessKey } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const normalizedRole = role.toLowerCase();
    const userName = name || email.split("@")[0].replace(".", " ");

    const sessionPayload = {
      email,
      name: userName,
      role: normalizedRole,
      station: body.station || (normalizedRole === "technician" ? "Bench 01" : undefined),
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

    // Record audit trail in Supabase
    try {
      const supabase = createAdminClient();
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          actor: `${email} (${normalizedRole.toUpperCase()})`,
          action: "AUTHENTICATE_SESSION",
          target: `${normalizedRole.toUpperCase()} Portal Access`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("[API /api/auth audit log warn]:", auditErr);
    }

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (err: any) {
    console.error("[API /api/auth POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("tdd_auth_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Session terminated successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to logout" },
      { status: 500 }
    );
  }
}
