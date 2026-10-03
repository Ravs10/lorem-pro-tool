import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password, email, otp } = body;

    // 1. Normal Login (Admin or Master)
    if (action === "login") {
      const { data } = await supabaseAdmin.from("app_settings").select("*");
      const adminPass = data?.find((r:any) => r.key === "admin_password")?.value;
      const masterKey = data?.find((r:any) => r.key === "master_key")?.value;

      if (password === adminPass || password === masterKey) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
    }

    // 2. Send OTP
    if (action === "send-otp") {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      await supabaseAdmin.from("admin_otps").delete().eq("email", email);
      await supabaseAdmin.from("admin_otps").insert([{ email, otp: otpCode, expires_at: expiresAt }]);

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RECOVERY_EMAIL_FROM || "onboarding@resend.dev",
        to: process.env.RECOVERY_EMAIL_TO || email,
        subject: "Your Admin OTP - Lorem Pro Tool",
        html: `<h2>Your OTP is: <b>${otpCode}</b></h2><p>Valid for 10 minutes</p>`
      });

      return NextResponse.json({ success: true });
    }

    // 3. Verify OTP
    if (action === "verify-otp") {
      const { data } = await supabaseAdmin.from("admin_otps").select("*").eq("email", email).eq("otp", otp).order("created_at", { ascending: false }).limit(1).single();
      if (!data) return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 401 });
      if (new Date(data.expires_at) < new Date()) return NextResponse.json({ success: false, error: "OTP Expired" }, { status: 401 });
      
      await supabaseAdmin.from("admin_otps").delete().eq("email", email);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
