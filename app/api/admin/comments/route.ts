import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getRole() {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  for (const c of all) {
    if (c.value === "admin" || c.value === "master") return c.value;
    try {
      const v = JSON.parse(c.value);
      if (v.role === "admin" || v.role === "master") return v.role;
      if (v.user?.role === "admin" || v.user?.role === "master") return v.user.role;
    } catch {}
    if (c.name.includes("master")) return "master";
    if (c.name.includes("admin")) return "admin";
  }
  return null;
}

export async function GET() {
  const role = await getRole();
  if (role !== "admin" && role !== "master")
    return NextResponse.json({ error: "Login karo" }, { status: 401 });
  const { data } = await supabaseAdmin.from("comments").select("*").order("created_at", { ascending: false });
  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: Request) {
  const role = await getRole();
  if (role !== "admin" && role !== "master")
    return NextResponse.json({ error: "Login karo" }, { status: 401 });

  const { id, action, text } = await req.json();
  if (!id || !action) return NextResponse.json({ error: "id/action chahiye" }, { status: 400 });

  let update: any = null;
  let shouldDelete = false;

  // ✅ SIRF 2 COLUMN - status aur is_approved. Koi extra column nahi, taaki Update Fail na ho
  if (action === "approve") update = { status: "approved", is_approved: true };
  if (action === "reject") update = { status: "rejected", is_approved: false };
  if (action === "trash") update = { status: "trash", is_approved: false };
  if (action === "restore") update = { status: "pending", is_approved: false };
  if (action === "edit") {
    if (!text?.trim()) return NextResponse.json({ error: "Text likho" }, { status: 400 });
    update = { comment: text.trim() };
  }
  if (action === "delete_permanent") {
    if (role !== "master") return NextResponse.json({ error: "Sirf Master kar sakta hai" }, { status: 403 });
    shouldDelete = true;
  }

  if (shouldDelete) {
    const { error } = await supabaseAdmin.from("comments").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (!update) return NextResponse.json({ error: "Galat action" }, { status: 400 });

  const { error } = await supabaseAdmin.from("comments").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
