import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.replace("/", "").split("/")[0];
  
  // Admin, API, Blog, Static files ko chhedo mat
  if (!slug || slug.startsWith("admin") || slug.startsWith("api") || slug.startsWith("blog") || slug.startsWith("_next") || slug.includes(".")) {
    return NextResponse.next();
  }

  // Supabase se sirf is tool ka status check karo
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${url}/rest/v1/tools?slug=eq.${slug}&select=public_open,public_auto_on_at,public_reason,name`, {
      headers: { apikey: key!, Authorization: `Bearer ${key}` },
      next: { revalidate: 0 }
    });
    const data = await res.json();
    const tool = data?.[0];

    // Tool hi nahi hai to jaane do (Blog / Page hoga)
    if (!tool) return NextResponse.next();

    // Agar Public Open hai to jaane do
    if (tool.public_open) return NextResponse.next();

    // Auto ON Time Khatam ho gaya? To khol do
    if (tool.public_auto_on_at && Date.now() >= new Date(tool.public_auto_on_at).getTime()) {
      // Auto ON ko background me update karo (Middleware me wait mat karo)
      fetch(`${url}/rest/v1/tools?slug=eq.${slug}`, {
        method: "PATCH",
        headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ public_open: true, public_auto_on_at: null, public_reason: "", public_locked_by: null }),
      }).catch(() => {});
      return NextResponse.next();
    }

    // Band hai to Closed Page pe bhej do
    const closedUrl = req.nextUrl.clone();
    closedUrl.pathname = "/tool-closed";
    closedUrl.searchParams.set("slug", slug);
    return NextResponse.rewrite(closedUrl);

  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/:slug*"],
};
