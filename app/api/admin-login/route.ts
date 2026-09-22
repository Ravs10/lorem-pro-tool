import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password, action } = await req.json();
  
  const savedPass = process.env.ADMIN_PASSWORD || "admin123";
  const masterKey = process.env.MASTER_KEY || "LoremMaster@123";

  // Agar master key se login hai to isMaster = true
  if (password === masterKey) {
    return NextResponse.json({ success: true, isMaster: true });
  }
  if (password === savedPass) {
    return NextResponse.json({ success: true, isMaster: false });
  }
  // Purane localStorage wale password ke liye bhi allow kar dete hain
  // Taaki blog wala panel bhi chale
  return NextResponse.json({ success: false }, { status: 401 });
}
