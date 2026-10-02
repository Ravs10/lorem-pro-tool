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

    // 1. Supabase se asli password lo (yehi secure hai)
    let adminPass = "Ravs123"; // fallback only
    let masterKey = "Ravs1234"; // fallback only
    try {
      const { data } = await supabase.from("app_settings").select("key, value").in("key", ["admin_password", "master_key"]);
      if (data) {
        adminPass = data.find(d => d.key === "admin_password")?.value?.trim() || adminPass;
        masterKey = data.find(d => d.key === "master_key")?.value?.trim() || masterKey;
      }
    } catch {}

    // Env se bhi override (Cloudflare vars)
    const envPass = (process.env.ADMIN_PASSWORD || "").trim();
    const envMaster = (process.env.MASTER_KEY || "").trim();
    if(envPass) adminPass = envPass;
    if(envMaster) masterKey = envMaster;

    // 2. ADVANCE LOGIC
    if (mode === "admin") {
      // Normal login: ONLY admin password
      if (input === adminPass) return NextResponse.json({ success: true, isMaster: false });
      return NextResponse.json({ success: false, message: "Wrong Admin Password! Forgot hai to Master Key use karo" });
    }

    if (mode === "master") {
      // Forgot login: ONLY master key
      if (input === masterKey) return NextResponse.json({ success: true, isMaster: true });
      return NextResponse.json({ success: false, message: "Wrong Master Key" });
    }

    return NextResponse.json({ success: false });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Server Error" });
  }
}
