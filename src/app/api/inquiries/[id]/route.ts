import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = decodeURIComponent(id || "").trim();

    if (!cleanId) {
      return NextResponse.json({ success: false, error: "Missing inquiry ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status, coordinationNotes, techNotes, assignedTech } = body;

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updates.status = status;
    }
    if (coordinationNotes !== undefined || techNotes !== undefined) {
      updates.tech_notes = coordinationNotes !== undefined ? coordinationNotes : techNotes;
    }
    if (assignedTech !== undefined) {
      updates.assigned_tech = assignedTech;
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("tickets")
      .update(updates)
      .eq("id", cleanId)
      .select()
      .single();

    if (error) {
      console.error("[API /api/inquiries/[id] PATCH error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Audit log
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-UPD-INQ-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "UPDATE_INQUIRY_STATUS",
          target: `Inquiry #${cleanId} -> ${status || "Updated"}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log warning on inquiry update:", auditErr);
    }

    return NextResponse.json({
      success: true,
      inquiry: data,
    });
  } catch (err: any) {
    console.error("[API /api/inquiries/[id] PATCH exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = decodeURIComponent(id || "").trim();

    if (!cleanId) {
      return NextResponse.json({ success: false, error: "Missing inquiry ID" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Delete inquiry record from tickets table
    const { error } = await supabase.from("tickets").delete().eq("id", cleanId);

    if (error) {
      console.error("[API /api/inquiries/[id] DELETE error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 2. Add to audit_logs so GET filters ignore it permanently
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-DEL-INQ-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "DELETE_INQUIRY",
          target: `Inquiry #${cleanId}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log warning on inquiry delete:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Inquiry #${cleanId} deleted successfully.`,
    });
  } catch (err: any) {
    console.error("[API /api/inquiries/[id] DELETE exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
