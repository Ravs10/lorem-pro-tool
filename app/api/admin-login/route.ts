import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const { action, password, otp, recovery_role, isMasterLogin } = await req.json();
  const { data: configs } = await supabase.from("admin_config").select("*");
  const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value;
  const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value;

  if (action === "login") {
    // FIX 1: Agar "Use as Master key" pe click hai, to SIRF master key allow hogi
    if (isMasterLogin) {
      if (password === masterKey) return NextResponse.json({ success: true, is_master: true, role: "master" });
      return NextResponse.json({ success: false, error: "Only Master Key allowed here" }, { status: 401 });
    }
    // Normal login me dono allow hain - aapko yahi chahiye tha
    if (password === masterKey) return NextResponse.json({ success: true, is_master: true, role: "master" });
    if (password === adminPass) return NextResponse.json({ success: true, is_master: false, role: "admin" });
    return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
  }

  if (action === "send-otp") {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // FIX 2: OTP Email fix - expiry 10 min
    await supabase.from("otp_store").upsert({ email: "run4ravish@gmail.com", otp: newOtp, role: recovery_role || "admin", expires_at: new Date(Date.now() + 10*60*1000).toISOString() }, { onConflict: 'email' });
    
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Ravish Blog <onboarding@resend.dev>", to: process.env.RECOVERY_EMAIL || "run4ravish@gmail.com", subject: `Your OTP is ${newOtp}`, html: `<div style="font-family:sans-serif"><h2>OTP: ${newOtp}</h2><p>Valid for 10 minutes for ${recovery_role} recovery</p></div>` })
    });
    return NextResponse.json({ success: true, debug_otp: newOtp }); // debug ke liye OTP yahin dikhega
  }

  if (action === "verify-otp") {
    const { data } = await supabase.from("otp_store").select("*").eq("otp", otp).single();
    if (!data) return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    if (new Date(data.expires_at) < new Date()) return NextResponse.json({ success: false, error: "OTP Expired" }, { status: 400 });
    return NextResponse.json({ success: true, is_master: data.role === "master", role: data.role });
  }
  return NextResponse.json({ success: false }, { status: 400 });
}
