import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ANON nahi, SERVICE key use karo
);

const RECOVERY_EMAIL = "run4ravish@gmail.com";
const OTP_EXPIRY_MIN = 5;

export async function POST(req: NextRequest) {
  const { action, password, otp } = await req.json();

  const { data: configs } = await supabase.from("admin_config").select("*");
  const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value;
  const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value;

  // 1. LOGIN - Role server decide karega, client nahi
  if (action === "login") {
    if (password === masterKey) {
      const res = NextResponse.json({ success: true, role: "master" });
      res.cookies.set("role", "master", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
      return res;
    }
    if (password === adminPass) {
      const res = NextResponse.json({ success: true, role: "admin" });
      res.cookies.set("role", "admin", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
      return res;
    }
    return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
  }

  // 2. SEND OTP - Hamesha ADMIN ke liye hi OTP, Master ke liye nahi
  // Agar Master ko OTP chahiye toh alag flow banao
  if (action === "send-otp") {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Purane OTP delete + naya OTP with expiry
    await supabase.from("otp_store").delete().eq("email", RECOVERY_EMAIL);
    await supabase.from("otp_store").insert([{ 
      email: RECOVERY_EMAIL, 
      otp: newOtp, 
      role: "admin", // FIXED: Client se nahi, hamesha admin
      created_at: new Date().toISOString() 
    }]);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        from: "Toolz4You <onboarding@resend.dev>", 
        to: RECOVERY_EMAIL, 
        subject: `Your Admin OTP is ${newOtp}`, 
        html: `<h1>${newOtp}</h1><p>Valid for ${OTP_EXPIRY_MIN} mins</p>` 
      })
    });
    return NextResponse.json({ success: true });
  }

  // 3. VERIFY OTP - Expiry + Email check
  if (action === "verify-otp") {
    const { data } = await supabase.from("otp_store").select("*").eq("email", RECOVERY_EMAIL).eq("otp", otp).single();
    if (!data) return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });

    const created = new Date(data.created_at).getTime();
    if (Date.now() - created > OTP_EXPIRY_MIN * 60 * 1000) {
      await supabase.from("otp_store").delete().eq("id", data.id);
      return NextResponse.json({ success: false, error: "OTP Expired" }, { status: 400 });
    }

    await supabase.from("otp_store").delete().eq("id", data.id);
    
    const res = NextResponse.json({ success: true, role: data.role });
    res.cookies.set("role", data.role, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
    return res;
  }

  return NextResponse.json({ success: false }, { status: 400 });
}
