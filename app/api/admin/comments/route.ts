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

async function handleAction(supabase: any, id: string, action: string, text?: string) {
  if (action === "delete_permanent") {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  }

  let update: any = {};
  if (action === "approve") update = { status: "approved", is_approved: true };
  if (action === "reject") update = { status: "rejected", is_approved: false };
  if (action === "trash") update = { status: "trash", is_approved: false };
  if (action === "restore") update = { status: "pending", is_approved: false };
  if (action === "edit") update = { comment: text };

  if (Object.keys(update).length === 0) return { error: "unknown action" };

  const { error } = await supabase.from("comments").update(update).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

// GET - List + Action Dono - Address Bar ke liye bhi
export async function GET(req: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  const text = searchParams.get("text") || undefined;

  // Agar id+action hai to Action karo - Sujata wala Rasta
  if (id && action) {
    const result: any = await handleAction(supabase, id, action, text);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  }

  // Warna List do
  const { data, error } = await supabase.from("comments").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data }, { headers: { "Cache-Control": "no-store" } });
}

// POST - Button ke liye
export async function POST(req: Request) {
  const supabase = getSupabase();
  const { id, action, text } = await req.json();
  if (!id || !action) return NextResponse.json({ error: "id/action missing" }, { status: 400 });
  const result: any = await handleAction(supabase, id, action, text);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
