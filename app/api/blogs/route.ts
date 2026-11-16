import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// --- 1. RATE LIMIT: 1 IP se 1 ghante me max 5 blog ---
const hits = new Map<string, { count: number, time: number }>();
function isRateLimited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.time > 3600_000) { hits.set(ip, { count: 1, time: now }); return false; }
  if (h.count >= 5) return true;
  h.count++; return false;
}

// --- 2. NORMAL EMAIL CHECK - Fake / Temp Mail Block, No OTP ---
const DISPOSABLE = ["tempmail.com","10minutemail.com","guerrillamail.com","mailinator.com","temp-mail.org","yopmail.com","fakeinbox.com","trashmail.com","getnada.com","sharklasers.com","maildrop.cc"];
function isValidEmail(email: string) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) return false;
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE.includes(domain)) return false;
  if (domain.startsWith("test") || domain.includes("example") || domain.includes("fake") || domain.includes("sample")) return false;
  return true;
}

// --- 3. SCRIPT / XSS SAAF KARNA ---
function cleanText(text: string) {
  if (!text) return "";
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?<\/embed>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");
}

function cleanUrl(url: string) {
  if (!url) return "";
  const u = url.trim();
  if (!u.startsWith("https://") && !u.startsWith("http://")) return "";
  try { new URL(u); return u; } catch { return ""; }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("cf-connecting-ip") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many blogs. Please try after 1 hour." }, { status: 429 });
    }

    const body = await req.json();
    let { title, slug, excerpt, seo_title, seo_description, content, category, tags, author_name, author_email, cover_image, author_website, author_bio } = body;

    if (!title || title.length < 10 || title.length > 120) return NextResponse.json({ error: "Title must be 10-120 characters." }, { status: 400 });
    if (!content || content.length < 300 || content.length > 20000) return NextResponse.json({ error: "Content must be 300-20000 characters." }, { status: 400 });
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: "Slug is invalid. Use only small letters, numbers and -" }, { status: 400 });
    if (!author_name || author_name.length < 2 || author_name.length > 50) return NextResponse.json({ error: "Please enter your real name." }, { status: 400 });

    // NORMAL EMAIL CHECK - No OTP
    if (!author_email || !isValidEmail(author_email)) {
      return NextResponse.json({ error: "Please enter a valid email address. Temporary / fake emails are not allowed." }, { status: 400 });
    }

    const safeWebsite = cleanUrl(author_website || "");
    if (!safeWebsite) return NextResponse.json({ error: "Please enter a valid website URL starting with https://" }, { status: 400 });
    const safeCover = cleanUrl(cover_image || "");

    const { data: existing } = await supabase.from("blogs").select("id").eq("slug", slug).single();
    if (existing) return NextResponse.json({ error: "This slug already exists. Please change it." }, { status: 400 });

    const safeContent = cleanText(content);
    const safeBio = cleanText(author_bio || "").slice(0, 200);
    const safeExcerpt = cleanText(excerpt || "").slice(0, 160);
    // --- NEW: SEO FIELDS - Khali ho to Title/Excerpt se auto bhar jayega ---
    const safeSeoTitle = cleanText(seo_title || "").slice(0, 60) || cleanText(title).slice(0, 60);
    const safeSeoDesc = cleanText(seo_description || "").slice(0, 160) || safeExcerpt;

    const { data, error } = await supabase.from("blogs").insert([{
      title: cleanText(title), slug, excerpt: safeExcerpt, seo_title: safeSeoTitle, seo_description: safeSeoDesc, content: safeContent,
      category: category || "General", tags: cleanText(tags || ""),
      author_name: cleanText(author_name), author_email: author_email.toLowerCase().trim(),
      cover_image: safeCover || null, author_website: safeWebsite, author_bio: safeBio,
      status: "pending", is_deleted: false, is_dofollow: false
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
