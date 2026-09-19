import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanId = id.trim().toUpperCase();
    const supabase = createAdminClient();

    // Fetch ticket details with case-insensitive matching
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .or(`id.eq.${cleanId},id.ilike.${cleanId}`)
      .maybeSingle();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // Fetch associated 2-way client/tech messages
    const { data: messages } = await supabase
      .from("ticket_messages")
      .select("*")
      .or(`ticket_id.eq.${cleanId},ticket_id.ilike.${cleanId}`)
      .order("created_at", { ascending: true });

    return NextResponse.json(
      {
        success: true,
        ticket,
        messages: messages || [],
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[API /api/tickets/[id] GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
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
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanId = id.trim().toUpperCase();
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

    // Check if ticket exists in database (case-insensitive)
    const { data: existingTicket } = await supabase
      .from("tickets")
      .select("*")
      .or(`id.eq.${cleanId},id.ilike.${cleanId}`)
      .maybeSingle();

    let updatedTicket = null;

    if (existingTicket) {
      const { data: updateData, error: updateErr } = await supabase
        .from("tickets")
        .update(updates)
        .eq("id", existingTicket.id)
        .select();

      if (updateErr) {
        console.error("[API /api/tickets/[id] PATCH update error]:", updateErr);
      }
      if (updateData && updateData.length > 0) {
        updatedTicket = updateData[0];
      }
    } else {
      // Only insert if ticket didn't exist at all in DB
      const insertRecord: Record<string, any> = {
        id: cleanId,
        company_name: body.companyName || body.client || "Client Organization",
        customer_name: body.customerName || body.client || "Client",
        customer_email: body.customerEmail || "support@thedatadot.com",
        device_or_subject: body.deviceOrSubject || body.device || "Support Incident",
        status: updates.status || "Media Intake",
        cloned_percent: updates.cloned_percent || 0,
        urgency: updates.urgency || "Standard",
        tech_notes: updates.tech_notes || "Updated via technician portal",
        assigned_bench: updates.assigned_bench || "Bench 01",
        assigned_tech: updates.assigned_tech || "Technician",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      try {
        const { data: insertData } = await supabase
          .from("tickets")
          .insert([insertRecord])
          .select();
        if (insertData && insertData.length > 0) {
          updatedTicket = insertData[0];
        }
      } catch (insertErr) {
        console.warn("[API /api/tickets/[id] insert fallback warn]:", insertErr);
      }
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
          target: `Ticket #${cleanId} (${summaryChange})`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("[API /api/tickets/[id] PATCH audit warn]:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        ticket: updatedTicket,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[API /api/tickets/[id] PATCH exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanId = id.trim().toUpperCase();
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const supabase = createAdminClient();

    // 1. Delete associated chat messages
    await supabase.from("ticket_messages").delete().or(`ticket_id.eq.${cleanId},ticket_id.ilike.${cleanId}`);

    // 2. Delete ticket record from tickets table
    const { error } = await supabase.from("tickets").delete().or(`id.eq.${cleanId},id.ilike.${cleanId}`);

    if (error) {
      console.error("[API /api/tickets/[id] DELETE error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Record permanent deletion in audit_logs
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          actor: "Admin / Client User",
          action: "DELETE_TICKET",
          target: `Ticket #${cleanId}`,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("[API /api/tickets/[id] DELETE audit warn]:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Ticket #${cleanId} permanently purged`,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[API /api/tickets/[id] DELETE exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

