import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function getSetting(key: string) {
  const { data } = await supabaseAdmin.from("app_settings").select("value").eq("key", key).single();
  return data?.value || null;
}

export async function POST(req: Request) {
  try {
    const { action, email, otp, password } = await req.json();

    const resendKey = await getSetting("resend_api_key");
    const toEmail = await getSetting("recovery_email_to");
    const fromEmail = await getSetting("recovery_email_from");
    const adminPass = await getSetting("admin_password");
    const masterKey = await getSetting("master_key");

    if (!resendKey) return NextResponse.json({ error: "Resend key not set" }, { status: 500 });

    if (action === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await supabaseAdmin.from("app_settings").upsert({ key: `otp_${email}`, value: JSON.stringify({ otp: generatedOtp, exp: Date.now() + 5*60*1000 }) });

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromEmail, to: toEmail, subject: `OTP: ${generatedOtp} - Admin Login`, html: `<h2>Your OTP is ${generatedOtp}</h2><p>Valid for 5 minutes</p>` }),
      });
      const result = await res.json();
      if (!res.ok) return NextResponse.json({ error: result }, { status: 500 });
      return NextResponse.json({ success: true, message: "OTP sent" });
    }

    if (action === "verify-otp") {
       const { data } = await supabaseAdmin.from("app_settings").select("value").eq("key", `otp_${email}`).single();
       if(!data) return NextResponse.json({ error: "OTP not found" }, { status: 400 });
       const saved = JSON.parse(data.value);
       if (Date.now() > saved.exp) return NextResponse.json({ error: "OTP expired" }, { status: 400 });
       if (saved.otp !== otp) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
       await supabaseAdmin.from("app_settings").delete().eq("key", `otp_${email}`);
       return NextResponse.json({ success: true, token: "admin_verified", admin_password: adminPass });
    }

    if (action === "login") {
        if (password === adminPass || password === masterKey) {
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
