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

    // 1. Delete record from Supabase
    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", cleanId);

    if (error) {
      console.error("[API /api/reports/[id] DELETE error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 2. Audit log entry to prevent restore
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-DEL-REP-${Date.now().toString(36).toUpperCase()}`,
          actor: "Technician Desk",
          action: "DELETE_REPORT",
          target: `Report #${cleanId}`,
          created_at: new Date().toISOString(),
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
