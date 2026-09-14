import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const actor = searchParams.get("actor");
    const action = searchParams.get("action");

    const supabase = createAdminClient();
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (actor) {
      query = query.ilike("actor", `%${actor}%`);
    }
    if (action) {
      query = query.ilike("action", `%${action}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API /api/audit-logs GET error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      logs: data || [],
    });
  } catch (err: any) {
    console.error("[API /api/audit-logs GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
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
    const { actor, action, target } = body;

    if (!actor || !action || !target) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: actor, action, target" },
        { status: 400 }
      );
    }

    const logId =
      body.id ||
      `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const logRecord = {
      id: logId,
      actor,
      action,
      target,
      ip: clientIp,
      created_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .insert([logRecord])
      .select()
      .single();

    if (error) {
      console.error("[API /api/audit-logs POST error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        log: data || logRecord,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[API /api/audit-logs POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
