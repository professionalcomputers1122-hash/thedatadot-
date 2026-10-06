import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.redirect(new URL("/newsletter/unsubscribe", req.url));
  }

  try {
    const supabase = createAdminClient();
    await supabase
      .from("tickets")
      .update({
        status: "Unsubscribed",
        tech_notes: "Unsubscribed via one-click newsletter email link.",
        updated_at: new Date().toISOString(),
      })
      .ilike("customer_email", email)
      .ilike("id", "NEWS-%");
  } catch (err) {
    console.warn("Unsubscribe database update note:", err);
  }

  return NextResponse.redirect(
    new URL(`/newsletter/unsubscribe?email=${encodeURIComponent(email)}&status=success`, req.url)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase
      .from("tickets")
      .update({
        status: "Unsubscribed",
        tech_notes: "Unsubscribed via newsletter preferences.",
        updated_at: new Date().toISOString(),
      })
      .ilike("customer_email", email)
      .ilike("id", "NEWS-%");

    return NextResponse.json({ success: true, email, unsubscribed: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
