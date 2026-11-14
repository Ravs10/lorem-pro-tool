import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl;
  const path = url.pathname;

  if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next") || path.startsWith("/tool-closed") || path === "/" || path === "/favicon.ico") return NextResponse.next();

  const slug = path.replace(/^\/+/, "").split("/")[0];
  if (!slug) return NextResponse.next();

  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPA_URL || !SUPA_KEY) return NextResponse.next();

  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/tools?slug=eq.${slug}&select=*`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    const arr = await res.json();
    const data = arr?.[0];
    if (!data) return NextResponse.next();

    if (!data.public_open && data.public_auto_on_at && Date.now() >= new Date(data.public_auto_on_at).getTime()) {
      await fetch(`${SUPA_URL}/rest/v1/tools?id=eq.${data.id}`, {
        method: "PATCH",
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ public_open: true, public_auto_on_at: null, public_reason: "", public_locked_by: null }),
      });
      return NextResponse.next();
    }

    if (!data.public_open) {
      const closed = new URL("/tool-closed", req.url);
      closed.searchParams.set("slug", slug);
      closed.searchParams.set("name", data.name || slug);
      closed.searchParams.set("reason", data.public_reason || "Maintenance chal raha hai");
      if (data.public_auto_on_at) closed.searchParams.set("auto_on", data.public_auto_on_at);
      return NextResponse.redirect(closed);
    }
  } catch (e) { return NextResponse.next(); }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
