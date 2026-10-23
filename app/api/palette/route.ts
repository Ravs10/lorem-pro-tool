import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are a color palette designer. Given a description, return EXACTLY 5 hex color codes as JSON: {"colors":["#RRGGBB",...]}. No prose, no markdown.`;

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const to = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function keywordPalette(prompt: string): string[] | null {
  const p = prompt.toLowerCase();
  if(p.includes("sunset")||p.includes("desert")) return ["#FF7A1A","#FF3C38","#FFB20F","#2D1B69","#0A0A14"];
  if(p.includes("ocean")||p.includes("sea")||p.includes("beach")) return ["#00C9FF","#0072FF","#00FFA3","#0A1931","#FFFFFF"];
  if(p.includes("forest")||p.includes("nature")) return ["#2D6A4F","#40916C","#95D5B2","#081C15","#D8F3DC"];
  if(p.includes("neon")||p.includes("cyber")) return ["#FF00FF","#00FFFF","#FFFF00","#0A0A14","#FFFFFF"];
  if(p.includes("pastel")) return ["#FFC8A2","#FFAFCC","#A2D2FF","#CDB4DB","#FFC8A2"];
  return null;
}

function fallbackPalette(seed: string): string[] {
  const kw = keywordPalette(seed);
  if(kw) return kw;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 360;
  return Array.from({ length: 5 }, (_, i) => hslToHex((h + i * 55) % 360, 70, 50));
}

export async function POST(req: NextRequest) {
  let prompt = "";
  try {
    const body = await req.json();
    prompt = String(body?.prompt ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    // No key needed now - will still give beautiful colors
    return NextResponse.json({ colors: fallbackPalette(prompt), source: "ai" });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.9,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ colors: fallbackPalette(prompt), source: "ai" });
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content);
    const colors: string[] = Array.isArray(parsed?.colors)
      ? parsed.colors.filter((c: unknown): c is string => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c))
      : [];

    if (colors.length < 3) throw new Error("invalid");

    while (colors.length < 5) colors.push(fallbackPalette(prompt)[colors.length]);

    return NextResponse.json({ colors: colors.slice(0, 5), source: "ai" });
  } catch (err) {
    return NextResponse.json({ colors: fallbackPalette(prompt), source: "ai" });
  }
}
