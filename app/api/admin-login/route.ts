import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { password, mode } = await req.json();
    const input = (password || "").trim();
    let adminPass = "Ravs123"; let masterKey = "Ravs1234";
    try {
      const { data } = await supabase.from("app_settings").select("key, value").in("key", ["admin_password", "master_key"]);
      if(data){ adminPass = data.find(d=>d.key==="admin_password")?.value?.trim() || adminPass; masterKey = data.find(d=>d.key==="master_key")?.value?.trim() || masterKey; }
    } catch {}
    if (mode === "admin") {
      if (input === adminPass) return NextResponse.json({ success: true, isMaster: false });
      return NextResponse.json({ success: false, message: "Wrong Admin Password!" });
    }
    if (mode === "master") {
      if (input === masterKey) return NextResponse.json({ success: true, isMaster: true });
      return NextResponse.json({ success: false, message: "Wrong Master Key" });
    }
    return NextResponse.json({ success: false });
  } catch { return NextResponse.json({ success: false }); }
}
