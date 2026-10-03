import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, password, otp } = body;

  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "ravish123";
  const MASTER_KEY = process.env.MASTER_KEY || "Ravs1234";
  const TO = process.env.RECOVERY_EMAIL_TO;
  const FROM = process.env.RECOVERY_EMAIL_FROM || "onboarding@resend.dev";
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);

  // LOGIN
  if (action === "login") {
    if (password === MASTER_KEY) return NextResponse.json({ success: true, is_master: true, role: "master" });
    if (password === ADMIN_PASS) return NextResponse.json({ success: true, is_master: false, role: "admin" });
    return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
  }

  // SEND OTP
  if (action === "send-otp") {
    if (!RESEND_KEY) return NextResponse.json({ success: false, error: "RESEND_API_KEY missing" }, { status: 500 });
    if (!TO) return NextResponse.json({ success: false, error: "RECOVERY_EMAIL_TO missing" }, { status: 500 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await supabase.from("otp_store").delete().eq("email", TO);
    await supabase.from("otp_store").insert({ email: TO, code });

    const resend = new Resend(RESEND_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      subject: `Admin OTP: ${code}`,
      html: `<h2>Your OTP is: ${code}</h2><p>Valid for 10 minutes</p>`,
    });

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: TO });
  }

  // VERIFY OTP
  if (action === "verify-otp") {
    const { data } = await supabase.from("otp_store").select("*").eq("code", otp).order("created_at", { ascending: false }).limit(1).single();
    if (!data) return NextResponse.json({ success: false, error: "Wrong OTP" }, { status: 401 });

    const isExpired = Date.now() - new Date(data.created_at).getTime() > 10 * 60 * 1000;
    if (isExpired) return NextResponse.json({ success: false, error: "OTP expired" }, { status: 401 });

    await supabase.from("otp_store").delete().eq("id", data.id);
    // OTP se hamesha ADMIN login
    return NextResponse.json({ success: true, is_master: false, role: "admin" });
  }

  return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
}
