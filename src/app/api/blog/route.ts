import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "Published";
    const includeDrafts = searchParams.get("includeDrafts") === "true" || status === "all";

    const supabase = createAdminClient();

    // Query audit logs to identify explicitly deleted articles
    const { data: delLogs } = await supabase
      .from("audit_logs")
      .select("target")
      .eq("action", "DELETE_BLOG_POST");

    const deletedIds = new Set<string>(
      (delLogs || []).map((d: any) => (d.target || "").trim())
    );

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

    const filtered = (data || []).filter((p: any) => !deletedIds.has(p.id));

    return NextResponse.json({
      success: true,
      count: filtered.length,
      posts: filtered,
      deletedIds: Array.from(deletedIds),
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

export async function DELETE(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const title = searchParams.get("title") || id || "Blog Article";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Blog post ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Delete from blog_posts table
    await supabase.from("blog_posts").delete().eq("id", id);

    // 2. Insert into audit_logs so it remains permanently deleted
    try {
      await supabase.from("audit_logs").insert([
        {
          id: `LOG-BLOG-DEL-${Date.now().toString(36).toUpperCase()}`,
          actor: "Super Admin",
          action: "DELETE_BLOG_POST",
          target: id,
          ip: clientIp,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (auditErr) {
      console.warn("Audit log insert error for blog delete:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Blog post "${title}" (${id}) permanently deleted.`,
    });
  } catch (err: any) {
    console.error("[API /api/blog DELETE exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
