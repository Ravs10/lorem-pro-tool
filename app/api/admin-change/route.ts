import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { type, newValue, authKey } = await req.json();
    
    const { data } = await supabaseAdmin.from("app_settings").select("*");
    const masterKey = data?.find((r:any) => r.key === "master_key")?.value;

    if (authKey !== masterKey) {
      return NextResponse.json({ success: false, message: "Master Key galat hai, verification fail" }, { status: 401 });
    }

    const { error } = await supabaseAdmin.from("app_settings").update({ value: newValue }).eq("key", type);
    if (error) throw error;

    return NextResponse.json({ success: true, message: `${type} update ho gaya` });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
