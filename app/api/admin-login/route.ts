import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const { action, password, otp, recovery_role, isMasterLogin } = await req.json();
  const { data: configs } = await supabase.from("admin_config").select("*");
  const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value;
  const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value;

  if (action === "login") {
    if (isMasterLogin) {
      if (password === masterKey) return NextResponse.json({ success: true, is_master: true, role: "master" });
      return NextResponse.json({ success: false, error: "Only Master Key allowed here" }, { status: 401 });
    }
    if (password === masterKey) return NextResponse.json({ success: true, is_master: true, role: "master" });
    if (password === adminPass) return NextResponse.json({ success: true, is_master: false, role: "admin" });
    return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
  }

  if (action === "send-otp") {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from("otp_store").delete().eq("email", "run4ravish@gmail.com");
    const { error } = await supabase.from("otp_store").insert([{ email: "run4ravish@gmail.com", otp: newOtp, role: recovery_role || "admin" }]);
    if(error) return NextResponse.json({ success: false, error: "DB Error: "+error.message });

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "onboarding@resend.dev", to: "run4ravish@gmail.com", subject: `OTP ${newOtp}`, html: `<h1>${newOtp}</h1>` })
      });
    } catch(e){}
    return NextResponse.json({ success: true, debug_otp: newOtp });
  }

  if (action === "verify-otp") {
    const { data } = await supabase.from("otp_store").select("*").eq("otp", otp).single();
    if (!data) return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    await supabase.from("otp_store").delete().eq("id", data.id);
    return NextResponse.json({ success: true, is_master: data.role === "master", role: data.role });
  }
  return NextResponse.json({ success: false }, { status: 400 });
}
