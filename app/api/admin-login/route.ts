import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, password, otp, recovery_role } = body;
  const { data: configs } = await supabase.from("admin_config").select("*");
  const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value || process.env.ADMIN_PASSWORD;
  const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value || process.env.MASTER_KEY;

  if (action === "login") {
    if (password === masterKey) return NextResponse.json({ success: true, is_master: true, role: "master" });
    if (password === adminPass) return NextResponse.json({ success: true, is_master: false, role: "admin" });
    return NextResponse.json({ success: false, error: "Wrong password. Current admin is: "+adminPass }, { status: 401 });
  }

  if (action === "send-otp") {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from("otp_store").upsert({ email: "run4ravish@gmail.com", otp: newOtp, role: recovery_role || "admin", expires_at: new Date(Date.now() + 10*60*1000).toISOString() }, { onConflict: 'email' });
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "onboarding@resend.dev", to: "run4ravish@gmail.com", subject: `OTP ${newOtp}`, html: `<h1>OTP: ${newOtp}</h1>` })
      });
    } catch(e){}
    return NextResponse.json({ success: true, debug_otp: newOtp });
  }

  if (action === "verify-otp") {
    const { data } = await supabase.from("otp_store").select("*").eq("otp", otp).single();
    if (!data) return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    if (new Date(data.expires_at) < new Date()) return NextResponse.json({ success: false, error: "OTP Expired" }, { status: 400 });
    return NextResponse.json({ success: true, is_master: data.role === "master", role: data.role });
  }
  return NextResponse.json({ success: false }, { status: 400 });
}
