import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ravish123";
const MASTER_KEY = process.env.MASTER_KEY || process.env.MASTER_PASSWORD || "";
const RECOVERY_TO = process.env.RECOVERY_EMAIL_TO || process.env.ADMIN_EMAIL || "";
const RECOVERY_FROM = process.env.RECOVERY_EMAIL_FROM || "onboarding@resend.dev";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password, email, otp } = body;

    // 1. LOGIN
    if (action === "login") {
      if (!password) return NextResponse.json({ success: false, error: "Password required" }, { status: 400 });

      if (MASTER_KEY && password === MASTER_KEY) {
        return NextResponse.json({ success: true, is_master: true, role: "master" });
      }
      if (password === ADMIN_PASSWORD) {
        return NextResponse.json({ success: true, is_master: false, role: "admin" });
      }
      return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
    }

    // 2. SEND OTP - FIX: email required nahi, RECOVERY_TO use karega
    if (action === "send-otp") {
      const toEmail = email || RECOVERY_TO;
      if (!toEmail) return NextResponse.json({ success: false, error: "RECOVERY_EMAIL_TO env missing" }, { status: 400 });
      if (!RESEND_KEY) return NextResponse.json({ success: false, error: "RESEND_API_KEY missing" }, { status: 400 });

      const resend = new Resend(RESEND_KEY);
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in global (Cloudflare KV nahi hai to memory me, better hai Supabase ya KV use karo)
      // Temporary: Cookie / header me bhejna best nahi, isliye hum isko env KV jaisa store kar rahe hai
      // Simple fix ke liye hum isko 10 min ke liye memory me rakhte hain via global
      (global as any).lastOtp = generatedOtp;
      (global as any).lastOtpTime = Date.now();

      await resend.emails.send({
        from: RECOVERY_FROM,
        to: toEmail,
        subject: "Your Lorem Pro Tool Admin OTP",
        html: `<h2>Your OTP is: <b>${generatedOtp}</b></h2><p>Valid for 10 minutes</p>`,
      });

      return NextResponse.json({ success: true, message: toEmail });
    }

    // 3. VERIFY OTP
    if (action === "verify-otp") {
      const storedOtp = (global as any).lastOtp;
      const storedTime = (global as any).lastOtpTime;
      if (!storedOtp) return NextResponse.json({ success: false, error: "OTP not sent yet" }, { status: 400 });
      if (Date.now() - storedTime > 10 * 60 * 1000) return NextResponse.json({ success: false, error: "OTP expired" }, { status: 400 });
      if (otp !== storedOtp) return NextResponse.json({ success: false, error: "Wrong OTP" }, { status: 401 });

      // OTP se login hamesha ADMIN hota hai, MASTER nahi
      return NextResponse.json({ success: true, is_master: false, role: "admin" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
