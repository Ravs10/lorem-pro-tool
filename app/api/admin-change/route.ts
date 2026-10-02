import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { type, newValue, authKey } = await req.json(); // type = admin_password | master_key

    // Verify Master Key first - bina master ke change nahi hoga
    const { data } = await supabase.from("app_settings").select("value").eq("key", "master_key").single();
    const masterKey = data?.value || process.env.MASTER_KEY || "Ravs1234";

    if (authKey !== masterKey) {
      return NextResponse.json({ success: false, message: "Master Key galat hai, change allowed nahi" });
    }

    const { error } = await supabase.from("app_settings").upsert({ key: type, value: newValue });
    if (error) throw error;

    return NextResponse.json({ success: true, message: `${type} changed!` });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message });
  }
}
