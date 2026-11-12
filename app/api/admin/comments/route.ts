import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ⚠️ IMPORTANT: Ye check tumhari /api/admin/me wali file se match karna chahiye.
// Agar tumhari login API cookie ka naam alag hai (jaise 'admin_token'), to yaha wahi naam daalo.
async function getRole() {
  const cookieStore = cookies();
  // Tumhari /api/admin/me jo cookie check karti hai, wahi yaha check hogi.
  // Agar /api/admin/me me JWT verify hota hai, to yaha bhi wahi logic copy karo.
  // Abhi ke liye: agar cookie me role hai to use karo, nahi to null.
  // Sabse safe: apni /api/admin-login wali file bhej do, main exact likh dunga.
  const c: any = cookieStore.get("admin_session") || cookieStore.get("admin_token") || cookieStore.get("role");
  if (!c) return null;
  try {
    const v = JSON.parse(c.value);
    return v.role || v;
  } catch {
    return c.value; // "admin" ya "master" seedha likha ho to
  }
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

  if (action === "approve") update = { status: "approved", is_approved: true };
  if (action === "reject") update = { status: "rejected", is_approved: false };
  if (action === "trash") update = { status: "trash", is_approved: false };
  if (action === "restore") update = { status: "pending", is_approved: false }; // Trash se wapas Pending
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
