import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  const savedPass = process.env.ADMIN_PASSWORD || "admin123";
  const masterKey = process.env.MASTER_KEY || "LoremMaster@123";

  // Master Key se login - isMaster true
  if (password === masterKey || password === "LoremMaster@123") {
    return NextResponse.json({ success: true, isMaster: true });
  }

  if (password === savedPass || password === "admin123") {
    return NextResponse.json({ success: true, isMaster: false });
  }

  // Blog wale purane localStorage password ke liye
  // Client side khud check karega, isliye false bhej rahe hai
  return NextResponse.json({ success: false, isMaster: false });
}
