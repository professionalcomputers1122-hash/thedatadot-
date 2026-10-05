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

    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[API /api/tickets/[id]/messages GET error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: data || [],
    });
  } catch (err: any) {
    console.error("[API /api/tickets/[id]/messages GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await req.json();
    const { sender, author, text } = body;

    if (!sender || !author || !text?.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: sender, author, text" },
        { status: 400 }
      );
    }

    const validSenders = ["Customer", "Technician", "Admin"];
    if (!validSenders.includes(sender)) {
      return NextResponse.json(
        { success: false, error: "Invalid sender. Must be Customer, Technician, or Admin." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const newMsg = {
      ticket_id: id,
      sender,
      author,
      text: text.trim(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("ticket_messages")
      .insert([newMsg])
      .select()
      .single();

    if (error) {
      console.error("[API /api/tickets/[id]/messages POST error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: data || newMsg,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[API /api/tickets/[id]/messages POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
