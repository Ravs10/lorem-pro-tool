import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Sirf List dekhne ke liye
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data }, { headers: { "Cache-Control": "no-store" } });
}

// POST - Permanent Fix: Approve/Reject/Trash/Edit sab isi se hoga
export async function POST(req: Request) {
  const supabase = getSupabase();
  const { id, action, text } = await req.json();

  if (!id || !action) return NextResponse.json({ error: "id/action missing" }, { status: 400 });

  let update: any = {};
  if (action === "approve") update = { status: "approved", is_approved: true };
  if (action === "reject") update = { status: "rejected", is_approved: false };
  if (action === "trash") update = { status: "trash", is_approved: false };
  if (action === "restore") update = { status: "pending", is_approved: false };
  if (action === "edit") update = { comment: text };

  if (action === "delete_permanent") {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const { error } = await supabase.from("comments").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
