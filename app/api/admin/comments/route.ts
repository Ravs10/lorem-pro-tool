import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  const supabaseAdmin = getAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  const text = searchParams.get("text");

  // Button ab GET se hi kaam karega - POST Cloudflare par atak raha tha
  if (id && action) {
    // Permanent Delete
    if (action === "delete_permanent") {
      const { error } = await supabaseAdmin.from("comments").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, via: "GET" });
    }

    let update: any = {};
    if (action === "approve") update = { status: "approved", is_approved: true };
    if (action === "reject") update = { status: "rejected", is_approved: false };
    if (action === "trash") update = { status: "trash", is_approved: false };
    if (action === "restore") update = { status: "pending", is_approved: false };
    if (action === "edit" && text) update = { comment: text };

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Galat action" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("comments")
      .update(update)
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, via: "GET" });
  }

  const { data, error } = await supabaseAdmin.from("comments").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: Request) {
  const supabaseAdmin = getAdmin();
  const { id, action, text } = await req.json();
  if (!id || !action) return NextResponse.json({ error: "id/action chahiye" }, { status: 400 });

  let update: any = null;
  let shouldDelete = false;

  if (action === "approve") update = { status: "approved", is_approved: true };
  if (action === "reject") update = { status: "rejected", is_approved: false };
  if (action === "trash") update = { status: "trash", is_approved: false };
  if (action === "restore") update = { status: "pending", is_approved: false };
  if (action === "edit") {
    if (!text?.trim()) return NextResponse.json({ error: "Text likho" }, { status: 400 });
    update = { comment: text.trim() };
  }
  if (action === "delete_permanent") shouldDelete = true;

  if (shouldDelete) {
    const { error } = await supabaseAdmin.from("comments").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (!update) return NextResponse.json({ error: "Galat action" }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("comments").update(update).eq("id", id).select();
  if (error) return NextResponse.json({ error: error.message, update }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "ID nahi mili, update hua hi nahi", id }, { status: 404 });
  return NextResponse.json({ success: true, updated: data[0] });
}

export async function PATCH(req: Request) {
  return POST(req);
}
