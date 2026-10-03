import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { type, newValue, authKey, oldValue } = await req.json();
    const { data: configs } = await supabase.from("admin_config").select("*");
    const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value;
    const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value;

    if (type === "admin_self") {
      if (oldValue !== adminPass) return NextResponse.json({ success: false, message: "Old password galat hai. Current: "+adminPass }, { status: 400 });
      await supabase.from("admin_config").update({ value: newValue }).eq("key", "admin_password");
      return NextResponse.json({ success: true, message: "Password Updated! Ab se naya password: "+newValue });
    }

    if (authKey !== masterKey) return NextResponse.json({ success: false, message: "Master Key galat hai" }, { status: 401 });

    if (type === "admin_password") {
      await supabase.from("admin_config").update({ value: newValue }).eq("key", "admin_password");
      return NextResponse.json({ success: true, message: "Admin Password Set to "+newValue });
    }
    if (type === "master_key") {
      await supabase.from("admin_config").update({ value: newValue }).eq("key", "master_key");
      return NextResponse.json({ success: true, message: "Master Key Set to "+newValue });
    }
    return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
  } catch (e:any) { return NextResponse.json({ success: false, message: e.message }, { status: 500 }); }
}
