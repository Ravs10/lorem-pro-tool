import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FALLBACK_EMAIL = "run4ravish@gmail.com";
const OTP_EXPIRY_MIN = 5;
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_TIME_MIN = 10;
const MAX_OTP_SEND = 3;
const MAX_OTP_VERIFY = 5;

const loginAttempts = new Map<string, { count: number; firstAt: number; blockedUntil?: number }>();
const otpSendAttempts = new Map<string, { count: number; firstAt: number; blockedUntil?: number }>();

function getIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown-ip";
}
function isBlocked(map: Map<string, any>, ip: string) {
  const rec = map.get(ip);
  if (!rec) return false;
  if (rec.blockedUntil && Date.now() < rec.blockedUntil) {
    return Math.ceil((rec.blockedUntil - Date.now()) / 1000 / 60);
  }
  if (Date.now() - rec.firstAt > BLOCK_TIME_MIN * 60 * 1000) {
    map.delete(ip);
    return false;
  }
  return false;
}
function addAttempt(map: Map<string, any>, ip: string, max: number) {
  const now = Date.now();
  const rec = map.get(ip);
  if (!rec) { map.set(ip, { count: 1, firstAt: now }); return false; }
  rec.count++;
  if (rec.count > max) { rec.blockedUntil = now + BLOCK_TIME_MIN * 60 * 1000; return true; }
  return false;
}
function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!name ||!domain) return "***@***";
  return name[0] + '***' + name.slice(-1) + '@' + domain;
}

export async function POST(req: NextRequest) {
  const { action, password, otp, newEmail } = await req.json();
  const ip = getIP(req);

  const { data: configs } = await supabase.from("admin_config").select("*");
  const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value;
  const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value;
  const masterEmail = configs?.find((c:any)=>c.key==="master_email")?.value || FALLBACK_EMAIL;

  // 1. LOGIN
  if (action === "login") {
    const blockedMin = isBlocked(loginAttempts, ip);
    if (blockedMin) return NextResponse.json({ success: false, error: `Too many attempts! ${blockedMin} min baad try karo.` }, { status: 429 });

    if (password === masterKey) {
      loginAttempts.delete(ip);
      const res = NextResponse.json({ success: true, role: "master" });
      res.cookies.set("role", "master", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
      res.cookies.set("auth_method", "master_key", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
      return res;
    }
    if (password === adminPass) {
      loginAttempts.delete(ip);
      const res = NextResponse.json({ success: true, role: "admin" });
      res.cookies.set("role", "admin", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
      res.cookies.set("auth_method", "password", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
      return res;
    }
    const nowBlocked = addAttempt(loginAttempts, ip, MAX_LOGIN_ATTEMPTS);
    if (nowBlocked) return NextResponse.json({ success: false, error: `5 galat try! ${BLOCK_TIME_MIN} min block.` }, { status: 429 });
    const left = MAX_LOGIN_ATTEMPTS - (loginAttempts.get(ip)?.count || 0);
    return NextResponse.json({ success: false, error: `Wrong password! ${left} try bache hain.` }, { status: 401 });
  }

  // 2. SEND OTP - ab dynamic email se
  if (action === "send-otp") {
    const blockedMin = isBlocked(otpSendAttempts, ip);
    if (blockedMin) return NextResponse.json({ success: false, error: `OTP limit! ${blockedMin} min baad.` }, { status: 429 });
    const nowBlocked = addAttempt(otpSendAttempts, ip, MAX_OTP_SEND);
    if (nowBlocked) return NextResponse.json({ success: false, error: `3 OTP bhej diye! ${BLOCK_TIME_MIN} min baad.` }, { status: 429 });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from("otp_store").delete().eq("email", masterEmail);
    // FIX: role master hona chahiye, admin nahi
    await supabase.from("otp_store").insert([{ email: masterEmail, otp: newOtp, role: "master", created_at: new Date().toISOString() }]);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Toolz4You <onboarding@resend.dev>", to: masterEmail, subject: `Your Master OTP is ${newOtp}`, html: `<h1>${newOtp}</h1><p>Valid for ${OTP_EXPIRY_MIN} mins</p>` })
    });
    // FIX: masked email return
    return NextResponse.json({ success: true, maskedEmail: maskEmail(masterEmail) });
  }

  // 3. VERIFY OTP
  if (action === "verify-otp") {
    const blockedMin = isBlocked(loginAttempts, `otp-${ip}`);
    if (blockedMin) return NextResponse.json({ success: false, error: `Too many OTP try! ${blockedMin} min baad.` }, { status: 429 });

    const { data } = await supabase.from("otp_store").select("*").eq("email", masterEmail).eq("otp", otp).single();
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

    const res = NextResponse.json({ success: true, role: "master" });
    res.cookies.set("role", "master", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
    // FIX: OTP se verified hai ye mark karo taaki password change ho sake
    res.cookies.set("auth_method", "email_otp", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 86400 });
    return res;
  }

  // 4. NEW: CHANGE MASTER EMAIL (emergency ke liye)
  if (action === "change-master-email") {
    const role = req.cookies.get("role")?.value;
    const authMethod = req.cookies.get("auth_method")?.value;
    if (role!== "master") return NextResponse.json({ success: false, error: "Only master can change email" }, { status: 403 });
    // Allow if master_key OR email_otp verified
    if (authMethod!== "master_key" && authMethod!== "email_otp") {
      return NextResponse.json({ success: false, error: "Verify with Master key or OTP first" }, { status: 403 });
    }
    if (!newEmail ||!newEmail.includes("@")) return NextResponse.json({ success: false, error: "Valid email do" }, { status: 400 });

    // update or insert master_email
    const exists = configs?.find((c:any)=>c.key==="master_email");
    if (exists) {
      await supabase.from("admin_config").update({ value: newEmail }).eq("key", "master_email");
    } else {
      await supabase.from("admin_config").insert([{ key: "master_email", value: newEmail }]);
    }
    return NextResponse.json({ success: true, message: "Email updated", maskedEmail: maskEmail(newEmail) });
  }

  return NextResponse.json({ success: false }, { status: 400 });
}
