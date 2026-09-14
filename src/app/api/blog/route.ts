import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "Published";
    const includeDrafts = searchParams.get("includeDrafts") === "true" || status === "all";

    const supabase = createAdminClient();
    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!includeDrafts && status) {
      query = query.eq("status", status);
    }
    if (category && category !== "All") {
      query = query.ilike("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API /api/blog GET error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      posts: data || [],
    });
  } catch (err: any) {
    console.error("[API /api/blog GET exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, read_time, status, cover_image, excerpt, content } = body;

    if (!title || !category || !excerpt) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, category, excerpt" },
        { status: 400 }
      );
    }

    const postId =
      body.id ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const postRecord = {
      id: postId,
      title,
      category,
      read_time: read_time || "5 min read",
      status: status || "Published",
      cover_image: cover_image || null,
      excerpt,
      content: content || excerpt,
      created_at: body.created_at || new Date().toISOString(),
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .upsert([postRecord])
      .select()
      .single();

    if (error) {
      console.error("[API /api/blog POST error]:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: data || postRecord,
    });
  } catch (err: any) {
    console.error("[API /api/blog POST exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
