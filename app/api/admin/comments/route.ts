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
    // 1. Seedha "admin" / "master" likha ho to
    if (c.value === "admin" || c.value === "master") return c.value;
    // 2. JSON me role ho to {"role":"admin"}
    try {
      const v = JSON.parse(c.value);
      if (v.role === "admin" || v.role === "master") return v.role;
      if (v.user?.role === "admin" || v.user?.role === "master") return v.user.role;
    } catch {}
    // 3. Cookie ka naam hi role bata raha ho
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

  // ✅ FIX: Har action me status + is_approved + is_deleted - teeno ek sath update karo, taaki Public wali File se match kare
  if (action === "approve") update = { status: "approved", is_approved: true, approved: true, is_deleted: false };
  if (action === "reject") update = { status: "rejected", is_approved: false, approved: false, is_deleted: false };
  if (action === "trash") update = { status: "trash", is_approved: false, approved: false, is_deleted: true };
  if (action === "restore") update = { status: "pending", is_approved: false, approved: false, is_deleted: false };
  if (action === "edit") {
    if (!text?.trim()) return NextResponse.json({ error: "Text likho" }, { status: 400 });
    update = { comment: text.trim() };
  }
  // Permanent Delete - SIRF MASTER kar sakta hai, Admin nahi
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
