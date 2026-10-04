import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // FIX: ANON nahi, SERVICE ROLE
);

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!name ||!domain) return "***@***";
  return name[0] + '***' + name.slice(-1) + '@' + domain;
}

export async function POST(req: NextRequest) {
  try {
    const { type, newValue, authKey, oldValue, newEmail } = await req.json();

    // Cookie se role aur auth method nikalo
    const role = req.cookies.get("role")?.value;
    const authMethod = req.cookies.get("auth_method")?.value;

    const { data: configs } = await supabase.from("admin_config").select("*");
    const adminPass = configs?.find((c:any)=>c.key==="admin_password")?.value;
    const masterKey = configs?.find((c:any)=>c.key==="master_key")?.value;

    // 1. ADMIN apna khud ka password change
    if (type === "admin_self") {
      if (role!== "admin" && role!== "master") {
        return NextResponse.json({ success: false, message: "Login required" }, { status: 401 });
      }
      if (oldValue!== adminPass) {
        // FIX: Password leak band - current password dikhana band
        return NextResponse.json({ success: false, message: "Old password galat hai" }, { status: 400 });
      }
      await supabase.from("admin_config").update({ value: newValue }).eq("key", "admin_password");
      // FIX: Naya password message me dikhana band
      return NextResponse.json({ success: true, message: "Password Updated Successfully!" });
    }

    // 2. MASTER ke kaam - sirf master kar sakta hai
    if (role!== "master") {
      return NextResponse.json({ success: false, message: "Only master can do this" }, { status: 403 });
    }

    // FIX: Deadlock khatam - Master Key YA OTP dono allow
    const isMasterKeyOk = authKey && authKey === masterKey;
    const isOtpLogin = authMethod === "email_otp";

    // Agar master key di hai to check karo, agar OTP se login hai to bina master key ke bhi allow
    if (!isMasterKeyOk &&!isOtpLogin) {
      // Agar authKey khali hai aur OTP se login hai to allow
      if (!(isOtpLogin &&!authKey)) {
         return NextResponse.json({ success: false, message: "Master Key verification failed. OTP se login ho to bina key ke try karo" }, { status: 401 });
      }
    }

    if (type === "admin_password") {
      await supabase.from("admin_config").update({ value: newValue }).eq("key", "admin_password");
      return NextResponse.json({ success: true, message: "Admin Password Changed Successfully!" });
    }

    if (type === "master_key") {
      await supabase.from("admin_config").update({ value: newValue }).eq("key", "master_key");
      return NextResponse.json({ success: true, message: "Master Key Updated Successfully!" });
    }

    if (type === "master_email") {
      if (!newEmail ||!newEmail.includes("@")) {
        return NextResponse.json({ success: false, message: "Valid email do" }, { status: 400 });
      }
      const exists = configs?.find((c:any)=>c.key==="master_email");
      if (exists) {
        await supabase.from("admin_config").update({ value: newEmail }).eq("key", "master_email");
      } else {
        await supabase.from("admin_config").insert([{ key: "master_email", value: newEmail }]);
      }
      return NextResponse.json({ success: true, message: "Email Updated", maskedEmail: maskEmail(newEmail) });
    }

    return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
  } catch (e:any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
