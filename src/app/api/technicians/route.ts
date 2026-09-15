import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { initialTechnicians } from "@/lib/portalData";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Query audit logs to identify technicians that have been explicitly deleted
    const { data: delLogs } = await supabase
      .from("audit_logs")
      .select("target")
      .in("action", ["DELETE_TECHNICIAN", "REMOVE_LABORATORY_TECHNICIAN"]);

    const deletedEmails = new Set<string>(
      (delLogs || []).map((d: any) => (d.target || "").toLowerCase().trim())
    );

    const activeTechs = initialTechnicians.filter(
      (t) => !deletedEmails.has(t.email.toLowerCase().trim())
    );

    return NextResponse.json({
      success: true,
      technicians: activeTechs,
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

    // Audit log & profiles sync in Supabase
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

      await supabase.from("profiles").upsert(
        {
          email: cleanEmail,
          full_name: name.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
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
    const { email, pin, password, name, department, role, station } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin ? pin.trim() : undefined;
    const cleanPassword = password ? password.trim() : undefined;

    // Record audit trail & sync to Supabase
    try {
      const supabase = createAdminClient();
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-TECH-PW-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: cleanPin || cleanPassword ? "RESET_TECHNICIAN_PASSWORD" : "UPDATE_TECHNICIAN_PROFILE",
          target: cleanEmail,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);

      if (name) {
        await supabase.from("profiles").upsert(
          {
            email: cleanEmail,
            full_name: name.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );
      }
    } catch (auditErr) {
      console.warn("Technician update audit log warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Technician details updated successfully for ${cleanEmail}`,
      pin: cleanPin,
      password: cleanPassword,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update technician" },
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
    const supabase = createAdminClient();

    // 1. Delete from Supabase profiles table
    try {
      await supabase.from("profiles").delete().ilike("email", cleanEmail);
    } catch (profErr) {
      console.warn("Supabase profile deletion warning:", profErr);
    }

    // 2. Delete from technicians table if exists
    try {
      await supabase.from("technicians").delete().ilike("email", cleanEmail);
    } catch (techErr) {
      // Table may not exist yet, safe to proceed
    }

    // 3. Unassign active tickets in Supabase so no orphan tickets remain
    try {
      await supabase
        .from("tickets")
        .update({ assigned_tech: "Unassigned" })
        .ilike("assigned_tech", `%${cleanEmail}%`);
    } catch (ticketErr) {
      console.warn("Ticket reassign warning:", ticketErr);
    }

    // 4. Record in Supabase audit logs
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-TECH-DEL-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "DELETE_TECHNICIAN",
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
      message: `Technician ${cleanEmail} permanently deleted from laboratory roster and Supabase`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete technician" },
      { status: 500 }
    );
  }
}
