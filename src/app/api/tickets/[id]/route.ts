import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Fetch associated 2-way client/tech messages
    const { data: messages } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      success: true,
      ticket,
      messages: messages || [],
    });
  } catch (err: any) {
    console.error("[API /api/tickets/[id] GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const supabase = createAdminClient();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updates.status = body.status;
    if (body.clonedPercent !== undefined) updates.cloned_percent = body.clonedPercent;
    if (body.cloned_percent !== undefined) updates.cloned_percent = body.cloned_percent;
    if (body.techNotes !== undefined) updates.tech_notes = body.techNotes;
    if (body.tech_notes !== undefined) updates.tech_notes = body.tech_notes;
    if (body.assignedBench !== undefined) updates.assigned_bench = body.assignedBench;
    if (body.assigned_bench !== undefined) updates.assigned_bench = body.assigned_bench;
    if (body.assignedTech !== undefined) updates.assigned_tech = body.assignedTech;
    if (body.assigned_tech !== undefined) updates.assigned_tech = body.assigned_tech;
    if (body.urgency !== undefined) updates.urgency = body.urgency;

    const { data: updatedTicket, error } = await supabase
      .from("tickets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[API /api/tickets/[id] PATCH error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Insert audit log for technician telemetry update
    try {
      const actor = body.actor || body.assignedTech || "Forensic Bench";
      const summaryChange = updates.status
        ? `Status: ${updates.status}`
        : updates.cloned_percent !== undefined
        ? `Cloned: ${updates.cloned_percent}%`
        : "Diagnostics updated";

      await supabase.from("audit_logs").insert([
        {
          id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          actor,
          action: "UPDATE_TICKET",
          target: `Ticket #${id} (${summaryChange})`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("[API /api/tickets/[id] PATCH audit warn]:", auditErr);
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (err: any) {
    console.error("[API /api/tickets/[id] PATCH exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
