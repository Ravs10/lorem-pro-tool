import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, content, category, tags, author_name, author_email, cover_image } = body;

    if (!title || !content || !slug) {
      return NextResponse.json({ error: "Title, Content aur Slug zaroori hai" }, { status: 400 });
    }

    const { data, error } = await supabase.from("blogs").insert([{
      title, slug, excerpt: excerpt || "", content,
      category: category || "General",
      tags: tags || "",
      author_name: author_name || "Guest",
      author_email: author_email || "",
      cover_image: cover_image || null,
      status: "pending",
      is_deleted: false,
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
