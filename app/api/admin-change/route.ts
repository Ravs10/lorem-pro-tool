import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Ye route abhi Cloudflare Vars change nahi kar sakta, isliye sirf message dega
  // Asli password change Cloudflare Dashboard se hi hota hai
  return NextResponse.json({ 
    success: false, 
    message: "Password change sirf Cloudflare Dashboard > Runtime variables se hoga. Security ke liye API se change disable hai." 
  }, { status: 400 });
}
