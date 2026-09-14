import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const supabase = createAdminClient();
    let query = supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true });

    if (category && category !== "All") {
      query = query.ilike("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API /api/faq GET error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      faqs: data || [],
    });
  } catch (err: any) {
    console.error("[API /api/faq GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, category, question, answer, display_order } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: question, answer" },
        { status: 400 }
      );
    }

    const faqId = id || `faq-${Date.now().toString(36)}-${Math.floor(10 + Math.random() * 90)}`;

    const faqRecord = {
      id: faqId,
      category: category || "General",
      question: question.trim(),
      answer: answer.trim(),
      display_order: typeof display_order === "number" ? display_order : 0,
      created_at: body.created_at || new Date().toISOString(),
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("faqs")
      .upsert([faqRecord])
      .select()
      .single();

    if (error) {
      console.error("[API /api/faq POST error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      faq: data || faqRecord,
    });
  } catch (err: any) {
    console.error("[API /api/faq POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
