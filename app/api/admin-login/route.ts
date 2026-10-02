import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// OTP ko memory me store karne ke liye
// @ts-ignore
const globalStore = globalThis as any;

export async function POST(req: Request) {
  try {
    const { password, mode, otp } = await req.json();
    const input = (password || "").trim();

    // --- 1. OTP SEND KARNE KA MODE ---
    if (mode === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // OTP ko 5 minute ke liye save karo
      globalStore._recoveryOtp = {
        otp: generatedOtp,
        expiry: Date.now() + 5 * 60 * 1000,
      };

      // Resend se email bhejo
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Admin Recovery <onboarding@resend.dev>',
          to: process.env.RECOVERY_EMAIL_TO!,
          subject: 'Your Admin OTP - Lorem Pro Tool',
          html: `<h2>Your OTP is: ${generatedOtp}</h2><p>Ye OTP 5 minute ke liye valid hai.</p>`
        });
        return NextResponse.json({ success: true, message: "OTP sent to email" });
      } catch (e: any) {
        return NextResponse.json({ success: false, message: "Email send failed: " + e.message });
      }
    }

    // --- 2. OTP VERIFY KARNE KA MODE ---
    if (mode === "verify-otp") {
      const stored = globalStore._recoveryOtp;
      if (!stored) return NextResponse.json({ success: false, message: "OTP expired, resend karo" });
      if (Date.now() > stored.expiry) return NextResponse.json({ success: false, message: "OTP expired" });
      if ((otp || "").trim() === stored.otp) {
        globalStore._recoveryOtp = null;
        return NextResponse.json({ success: true, isMaster: true });
      }
      return NextResponse.json({ success: false, message: "Wrong OTP!" });
    }

    // --- 3. AAPKA PURANA PASSWORD WALA SYSTEM (same as before) ---
    let adminPass = "Ravs123"; let masterKey = "Ravs1234";
    try {
      const { data } = await supabase.from("app_settings").select("key, value").in("key", ["admin_password", "master_key"]);
      if(data){ adminPass = data.find(d=>d.key==="admin_password")?.value?.trim() || adminPass; masterKey = data.find(d=>d.key==="master_key")?.value?.trim() || masterKey; }
    } catch {}
    if (mode === "admin") {
      if (input === adminPass) return NextResponse.json({ success: true, isMaster: false });
      return NextResponse.json({ success: false, message: "Wrong Admin Password!" });
    }
    if (mode === "master") {
      if (input === masterKey) return NextResponse.json({ success: true, isMaster: true });
      return NextResponse.json({ success: false, message: "Wrong Master Key" });
    }
    return NextResponse.json({ success: false });
  } catch (e: any) { return NextResponse.json({ success: false, message: e.message }); }
}
