export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanSlug(s: string) {
  return s.trim().replace(/^\//, "").replace(/^blog\//, "").replace(/^tools\//, "");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = cleanSlug(searchParams.get("slug") || "");
  if (!slug) return NextResponse.json({ comments: [] });

  const { data } = await supabaseAdmin
    .from("comments")
    .select("*")
    .eq("blog_slug", slug)
    .eq("status", "approved")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: Request) {
  const { blog_slug, name, comment } = await req.json();
  const slug = cleanSlug(blog_slug || "");
  if (!slug || !name?.trim() || !comment?.trim())
    return NextResponse.json({ error: "Name aur comment likho" }, { status: 400 });

  const { error } = await supabaseAdmin.from("comments").insert([
    { blog_slug: slug, name: name.trim(), comment: comment.trim(), status: "pending", is_approved: false },
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: "Pending me gaya, Admin Approve karega" });
}
