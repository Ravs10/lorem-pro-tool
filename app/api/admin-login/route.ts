import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const globalStore = globalThis as any;

export async function POST(req: Request) {
  try {
    const { password, mode, otp } = await req.json();
    const input = (password || "").trim();

    if (mode === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      globalStore._recoveryOtp = { otp: generatedOtp, expiry: Date.now() + 5*60*1000 };

      // Cloudflare Workers Builds me env direct process.env se aata hai
      const apiKey = process.env.RESEND_API_KEY?.trim();
      const emailTo = process.env.RECOVERY_EMAIL_TO || "run4ravish@gmail.com";
      const emailFrom = process.env.RECOVERY_EMAIL_FROM || "onboarding@resend.dev";

      if (!apiKey) {
        console.log("ENV DEBUG:", Object.keys(process.env).filter(k=>k.includes("RESEND") || k.includes("RECOVERY")));
        return NextResponse.json({ success: false, message: `RESEND_API_KEY missing. Build variables check karo.` });
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `Admin Recovery <${emailFrom}>`,
          to: emailTo,
          subject: 'Your Admin OTP',
          html: `<h2>OTP: ${generatedOtp}</h2><p>5 min valid</p>`
        }),
      });

      const data = await res.json();
      if (!res.ok) return NextResponse.json({ success: false, message: "Resend: " + JSON.stringify(data) });
      return NextResponse.json({ success: true, message: "OTP sent" });
    }

    if (mode === "verify-otp") {
      const stored = globalStore._recoveryOtp;
      if (!stored || Date.now() > stored.expiry) return NextResponse.json({ success: false, message: "OTP expired, resend karo" });
      if ((otp||"").trim() === stored.otp) { globalStore._recoveryOtp = null; return NextResponse.json({ success: true, isMaster: true }); }
      return NextResponse.json({ success: false, message: "Wrong OTP!" });
    }

    let adminPass = "Ravs123", masterKey = "Ravs1234";
    try {
      const { data } = await supabase.from("app_settings").select("key, value").in("key", ["admin_password", "master_key"]);
      if(data){ adminPass = data.find(d=>d.key==="admin_password")?.value?.trim() || adminPass; masterKey = data.find(d=>d.key==="master_key")?.value?.trim() || masterKey; }
    } catch {}

    if (mode === "admin") return NextResponse.json(input === adminPass ? { success: true, isMaster: false } : { success: false, message: "Wrong Admin Password!" });
    if (mode === "master") return NextResponse.json(input === masterKey ? { success: true, isMaster: true } : { success: false, message: "Wrong Master Key" });

    return NextResponse.json({ success: false });
  } catch (e:any) { return NextResponse.json({ success: false, message: e.message }); }
}
