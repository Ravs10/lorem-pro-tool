import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RECOVERY_EMAIL = "run4ravish@gmail.com";
const OTP_EXPIRY_MIN = 5;

// --- BRUTE FORCE CONFIG ---
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_TIME_MIN = 10; // 10 min block
const MAX_OTP_SEND = 3; // 10 min me sirf 3 OTP
const MAX_OTP_VERIFY = 5;

// Memory store (Workers me bhi chalega, cold start pe reset hoga par kaam karega)
// Better ke liye isko Supabase table me bhi daal sakte hain
const loginAttempts = new Map<string, { count: number; firstAt: number; blockedUntil?: number }>();
const otpSendAttempts = new Map<string, { count: number; firstAt: number; blockedUntil?: number }>();

function getIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown-ip";
}

function isBlocked(map: Map<string, any>, ip: string) {
  const rec = map.get(ip);
  if (!rec) return false;
  if (rec.blockedUntil && Date.now() < rec.blockedUntil) {
    return Math.ceil((rec.blockedUntil - Date.now()) / 1000 / 60); // kitne min bache
  }
  // 10 min ke baad auto reset
  if (Date.now() - rec.firstAt > BLOCK_TIME_MIN * 60 * 1000) {
    map.delete(ip);
    return false;
  }
  return false;
}

function addAttempt(map: Map<string, any>, ip: string, max: number) {
  const now = Date.now();
  const rec = map.get(ip);
  if (!rec) {
    map.set(ip, { count: 1, firstAt: now });
    return false;
  }
  rec.count++;
  if (rec.count > max) {
    rec.blockedUntil = now + BLOCK_TIME_MIN * 60 * 1000;
    return true; // blocked now
  }
  return false;
}

export async function POST(req: NextRequest) {
  const { action, password, otp } = await req.json();
  const ip = getIP(req);

  const { data: configs } = await supabase.from("admin_config").select("*");
  const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value;
  const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value;

  // 1. LOGIN
  if (action === "login") {
    const blockedMin = isBlocked(loginAttempts, ip);
    if (blockedMin) {
      return NextResponse.json({ success: false, error: `Too many attempts! ${blockedMin} min baad try karo.` }, { status: 429 });
    }

    if (password === masterKey) {
      loginAttempts.delete(ip);
      const res = NextResponse.json({ success: true, role: "master" });
      res.cookies.set("role", "master", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
      return res;
    }
    if (password === adminPass) {
      loginAttempts.delete(ip);
      const res = NextResponse.json({ success: true, role: "admin" });
      res.cookies.set("role", "admin", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
      return res;
    }

    const nowBlocked = addAttempt(loginAttempts, ip, MAX_LOGIN_ATTEMPTS);
    if (nowBlocked) {
      return NextResponse.json({ success: false, error: `5 galat try! ${BLOCK_TIME_MIN} min ke liye block ho gaye.` }, { status: 429 });
    }
    const left = MAX_LOGIN_ATTEMPTS - (loginAttempts.get(ip)?.count || 0);
    return NextResponse.json({ success: false, error: `Wrong password! ${left} try bache hain.` }, { status: 401 });
  }

  // 2. SEND OTP
  if (action === "send-otp") {
    const blockedMin = isBlocked(otpSendAttempts, ip);
    if (blockedMin) {
      return NextResponse.json({ success: false, error: `OTP limit! ${blockedMin} min baad try karo.` }, { status: 429 });
    }

    const nowBlocked = addAttempt(otpSendAttempts, ip, MAX_OTP_SEND);
    if (nowBlocked) {
      return NextResponse.json({ success: false, error: `3 OTP bhej diye! ${BLOCK_TIME_MIN} min baad try karo.` }, { status: 429 });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from("otp_store").delete().eq("email", RECOVERY_EMAIL);
    await supabase.from("otp_store").insert([{ email: RECOVERY_EMAIL, otp: newOtp, role: "admin", created_at: new Date().toISOString() }]);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Toolz4You <onboarding@resend.dev>", to: RECOVERY_EMAIL, subject: `Your Admin OTP is ${newOtp}`, html: `<h1>${newOtp}</h1><p>Valid for ${OTP_EXPIRY_MIN} mins</p>` })
    });
    return NextResponse.json({ success: true });
  }

  // 3. VERIFY OTP
  if (action === "verify-otp") {
    const blockedMin = isBlocked(loginAttempts, `otp-${ip}`);
    if (blockedMin) {
      return NextResponse.json({ success: false, error: `Too many OTP try! ${blockedMin} min baad.` }, { status: 429 });
    }

    const { data } = await supabase.from("otp_store").select("*").eq("email", RECOVERY_EMAIL).eq("otp", otp).single();
    if (!data) {
      const nowBlocked = addAttempt(loginAttempts, `otp-${ip}`, MAX_OTP_VERIFY);
      if (nowBlocked) return NextResponse.json({ success: false, error: `5 galat OTP! ${BLOCK_TIME_MIN} min block.` }, { status: 429 });
      return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    }

    const created = new Date(data.created_at).getTime();
    if (Date.now() - created > OTP_EXPIRY_MIN * 60 * 1000) {
      await supabase.from("otp_store").delete().eq("id", data.id);
      return NextResponse.json({ success: false, error: "OTP Expired" }, { status: 400 });
    }

    await supabase.from("otp_store").delete().eq("id", data.id);
    loginAttempts.delete(ip);
    loginAttempts.delete(`otp-${ip}`);
    otpSendAttempts.delete(ip);

    const res = NextResponse.json({ success: true, role: data.role });
    res.cookies.set("role", data.role, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
    return res;
  }

  return NextResponse.json({ success: false }, { status: 400 });
}
