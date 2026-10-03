import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { action, password, email, otp, recovery_role } = await req.json();
  
  const { data: configs } = await supabase.from("admin_config").select("*");
  const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value || process.env.ADMIN_PASSWORD;
  const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value || process.env.MASTER_KEY;

  if (action === "login") {
    if (password === masterKey) {
      return NextResponse.json({ success: true, is_master: true, role: "master" });
    }
    if (password === adminPass) {
      return NextResponse.json({ success: true, is_master: false, role: "admin" });
    }
    return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
  }

  if (action === "send-otp") {
    // yaha aapka existing OTP wala code same rehne do
    // bas email send logic
    const { error } = await supabase.from("otp_store").upsert({
      email,
      otp: Math.floor(100000 + Math.random() * 900000).toString(),
      role: recovery_role || "admin",
      expires_at: new Date(Date.now() + 10*60*1000).toISOString()
    });
    return NextResponse.json({ success: true });
  }

  if (action === "verify-otp") {
    const { data } = await supabase.from("otp_store").select("*").eq("otp", otp).single();
    if (!data) return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    const isMasterOtp = data.role === "master";
    return NextResponse.json({ success: true, is_master: isMasterOtp, role: data.role });
  }

  return NextResponse.json({ success: false }, { status: 400 });
}
