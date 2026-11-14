import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Ek Tool Ka Data Laane Ke Liye (Admin Slug Fix Ke Liye)
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH - Slug Sahi Karne Ke Liye
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("tools")
    .update(body)
    .eq("slug", params.slug)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
