import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = decodeURIComponent(id || "").trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Missing report ID" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const rawId = cleanId.replace(/^DR-/i, "").replace(/^RPT-/i, "");
    const drId = `DR-${rawId}`;
    const rptId = `RPT-${rawId}`;

    // 1. Delete all variants of the ID from tickets in Supabase
    const { error } = await supabase
      .from("tickets")
      .delete()
      .or(`id.eq.${cleanId},id.eq.${rawId},id.eq.${drId},id.eq.${rptId}`);

    if (error) {
      console.error("[API /api/reports/[id] DELETE error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 2. Audit log entry to prevent restore
    try {
      const now = new Date().toISOString();
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-DEL-REP-${Date.now().toString(36).toUpperCase()}-1`,
          actor: "Technician Desk",
          action: "DELETE_REPORT",
          target: `Report #${cleanId}`,
          created_at: now,
        },
        {
          id: `LOG-DEL-REP-${Date.now().toString(36).toUpperCase()}-2`,
          actor: "Technician Desk",
          action: "DELETE_REPORT",
          target: `Report #${drId}`,
          created_at: now,
        },
        {
          id: `LOG-DEL-REP-${Date.now().toString(36).toUpperCase()}-3`,
          actor: "Technician Desk",
          action: "DELETE_REPORT",
          target: `Report #${rawId}`,
          created_at: now,
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log warning on report delete:", auditErr);
    }

    return NextResponse.json({
      success: true,
      deletedId: cleanId,
    });
  } catch (err: any) {
    console.error("[API /api/reports/[id] DELETE exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete report" },
      { status: 500 }
    );
  }
}
