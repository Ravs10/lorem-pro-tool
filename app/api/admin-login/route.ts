import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const input = (password || "").trim();

    // Fallback hardcoded so login always works
    const savedPass = "Ravs123";
    const masterKey = "Ravs1234";

    const envPass = (process.env.ADMIN_PASSWORD || "").trim();
    const envMaster = (process.env.MASTER_KEY || "").trim();

    const isValid = input === savedPass || input === masterKey || (envPass && input === envPass) || (envMaster && input === envMaster);

    if (isValid) {
      const isMaster = input === masterKey || (envMaster && input === envMaster);
      return NextResponse.json({ success: true, isMaster });
    }

    return NextResponse.json({ success: false, message: "Wrong password" });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Error" });
  }
}
