import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  
  const savedPass = process.env.ADMIN_PASSWORD || "admin123";
  const masterKey = process.env.MASTER_KEY || "LoremMaster@123";

  if (password === savedPass || password === masterKey) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
