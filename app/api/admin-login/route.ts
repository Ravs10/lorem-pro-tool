import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getCloudflareContext } from "@opennextjs/cloudflare"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// @ts-ignore
const globalStore = globalThis as any;

export async function POST(req: Request) {
  try {
    const { password, mode, otp } = await req.json();
    const input = (password || "").trim();

    if (mode === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      globalStore._recoveryOtp = {
        otp: generatedOtp,
        expiry: Date.now() + 5 * 60 * 1000,
      };

      try {
        // Cloudflare env + normal env dono try karo
        let apiKey = process.env.RESEND_API_KEY;
        let emailTo = process.env.RECOVERY_EMAIL_TO;
        let emailFrom = process.env.RECOVERY_EMAIL_FROM || 'onboarding@resend.dev';

        try {
          const { env } = await getCloudflareContext({ async: true }) as any;
          if (env?.RESEND_API_KEY) apiKey = env.RESEND_API_KEY;
          if (env?.RECOVERY_EMAIL_TO) emailTo = env.RECOVERY_EMAIL_TO;
          if (env?.RECOVERY_EMAIL_FROM) emailFrom = env.RECOVERY_EMAIL_FROM;
        } catch {}

        if (!apiKey) {
          return NextResponse.json({ success: false, message: "RESEND_API_KEY missing in Cloudflare" });
        }

        // SDK ki jagah direct API - Missing API key error nahi ayega
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `Admin Recovery <${emailFrom}>`,
            to: emailTo,
            subject: 'Your Admin OTP - Lorem Pro Tool',
            html: `<h2>Your OTP is: ${generatedOtp}</h2><p>Ye OTP 5 minute ke liye valid hai.</p>`
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return NextResponse.json({ success: false, message: "Email send failed: " + JSON.stringify(data) });
        }

        return NextResponse.json({ success: true, message: "OTP sent to email" });
      } catch (e: any) {
        return NextResponse.json({ success: false, message: "Email send failed: " + e.message });
      }
    }

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
