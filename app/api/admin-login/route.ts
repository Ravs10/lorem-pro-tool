import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const role = recovery_role || "admin";
    
    // Purana OTP delete karke naya daalo - upsert se better
    await supabase.from("otp_store").delete().eq("email", "run4ravish@gmail.com");
    const { error: insertErr } = await supabase.from("otp_store").insert([{ 
      email: "run4ravish@gmail.com", 
      otp: newOtp, 
      role: role, 
      expires_at: new Date(Date.now() + 10*60*1000).toISOString() 
    }]);
    
    if(insertErr) return NextResponse.json({ success: false, error: "DB Error: "+insertErr.message });

    // Email bhejo
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          from: "OTP <onboarding@resend.dev>", 
          to: process.env.RECOVERY_EMAIL || "run4ravish@gmail.com", 
          subject: `Your ${role} OTP is ${newOtp}`, 
          html: `<h1>${newOtp}</h1><p>Valid 10 min</p>` 
        })
      });
    } catch(e){}

    return NextResponse.json({ success: true, debug_otp: newOtp, message: "OTP sent" });
  }

  if (action === "verify-otp") {
    // Latest OTP check
    const { data, error } = await supabase.from("otp_store").select("*").eq("otp", otp).order("expires_at", { ascending: false }).limit(1).single();
    if (error || !data) return NextResponse.json({ success: false, error: "Invalid OTP - Not found in DB" }, { status: 400 });
    if (new Date(data.expires_at) < new Date()) return NextResponse.json({ success: false, error: "OTP Expired" }, { status: 400 });
    
    // Use hone ke baad delete
    await supabase.from("otp_store").delete().eq("id", data.id);
    return NextResponse.json({ success: true, is_master: data.role === "master", role: data.role });
  }

  return NextResponse.json({ success: false }, { status: 400 });
}
