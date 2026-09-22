import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { password } = await req.json();

  const savedPass = process.env.ADMIN_PASSWORD;
  const masterKey = process.env.MASTER_KEY;

  // Master Key se login
  if (password === masterKey) {
    return NextResponse.json({ success: true, isMaster: true });
  }

  // Admin Password se login
  if (password === savedPass) {
    return NextResponse.json({ success: true, isMaster: false });
  }

  return NextResponse.json({ success: false });
}
