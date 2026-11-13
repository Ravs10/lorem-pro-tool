import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ comments: [] });

  const { data } = await supabaseAdmin
    .from("comments")
    .select("*")
    .eq("blog_slug", slug)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: Request) {
  const { blog_slug, name, comment } = await req.json();
  if (!blog_slug || !name?.trim() || !comment?.trim())
    return NextResponse.json({ error: "Name aur comment likho" }, { status: 400 });
  if (name.length > 50 || comment.length > 1000)
    return NextResponse.json({ error: "Comment bahut lamba hai" }, { status: 400 });

  const { error } = await supabaseAdmin.from("comments").insert([
    { blog_slug, name: name.trim(), comment: comment.trim(), status: "pending", is_approved: false },
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: "Pending me gaya, Admin Approve karega" });
}
