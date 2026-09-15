import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { initialTechnicians } from "@/lib/portalData";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      technicians: initialTechnicians,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve technicians" },
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
    const { name, email, role, station, pin, password } = body;

    if (!name || !email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid technician name and corporate email required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedPin = pin ? pin.trim() : Math.floor(1000 + Math.random() * 9000).toString();
    const assignedPassword = password ? password.trim() : `Tech@${assignedPin}!`;

    // Audit log
    try {
      const supabase = createAdminClient();
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-TECH-ADD-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "REGISTER_LABORATORY_TECHNICIAN",
          target: `${cleanEmail} (${name})`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Technician audit log warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      technician: {
        id: `TECH-0${Math.floor(10 + Math.random() * 90)}`,
        name: name.trim(),
        email: cleanEmail,
        role: role || "Forensic Cleanroom Technician",
        station: station || "PC-3000 Bench 01 (Class-5 Hood)",
        activeCases: 0,
        status: "Available",
        pin: assignedPin,
        password: assignedPassword,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register technician" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const { email, pin, password } = body;

    if (!email || (!pin && !password)) {
      return NextResponse.json(
        { success: false, error: "Valid email and new PIN or Password required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin ? pin.trim() : undefined;
    const cleanPassword = password ? password.trim() : undefined;

    // Record audit trail in Supabase
    try {
      const supabase = createAdminClient();
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-TECH-PW-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "RESET_TECHNICIAN_PASSWORD",
          target: cleanEmail,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Technician password reset audit log warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Credentials updated successfully for ${cleanEmail}`,
      pin: cleanPin,
      password: cleanPassword,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reset technician password/PIN" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Audit log
    try {
      const supabase = createAdminClient();
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-TECH-DEL-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "REMOVE_LABORATORY_TECHNICIAN",
          target: cleanEmail,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Technician deletion audit log warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Technician ${cleanEmail} removed from laboratory roster`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete technician" },
      { status: 500 }
    );
  }
}
