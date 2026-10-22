// app/api/palette/route.ts
import { NextRequest, NextResponse } from "next/server";

function randomHex() {
  return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
}

function getPaletteForPrompt(prompt: string): string[] {
  const p = prompt.toLowerCase();
  
  if(p.includes("sunset") || p.includes("desert") || p.includes("dusk"))
    return ["#FF7A1A","#FF3C38","#FFB20F","#2D1B69","#0A0A14"];
  if(p.includes("ocean") || p.includes("sea") || p.includes("water") || p.includes("beach"))
    return ["#00C9FF","#0072FF","#00FFA3","#0A1931","#FFFFFF"];
  if(p.includes("forest") || p.includes("nature") || p.includes("jungle") || p.includes("tree"))
    return ["#2D6A4F","#40916C","#95D5B2","#081C15","#D8F3DC"];
  if(p.includes("neon") || p.includes("cyber") || p.includes("futuristic") || p.includes("synthwave"))
    return ["#FF00FF","#00FFFF","#FFFF00","#0A0A14","#FFFFFF"];
  if(p.includes("pastel") || p.includes("soft") || p.includes("cute"))
    return ["#FFC8A2","#FFAFCC","#A2D2FF","#CDB4DB","#FFC8A2"];
  if(p.includes("christmas"))
    return ["#FF0000","#00A303","#FFFFFF","#FFD700","#0A0A14"];
  if(p.includes("halloween"))
    return ["#FF7518","#000000","#7A3B2E","#FFD700","#FFFFFF"];
  if(p.includes("love") || p.includes("valentine") || p.includes("romantic"))
    return ["#FF006E","#FF4081","#FF80AB","#3A0CA3","#FFFFFF"];

  // Default random
  return [randomHex(), randomHex(), randomHex(), randomHex(), randomHex()];
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if(!prompt || !prompt.trim()){
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const colors = getPaletteForPrompt(prompt);

    // Yaha chaaho to real AI (OpenAI) laga sakte ho, abhi ke liye keyword logic 100% kaam karega
    return NextResponse.json({ 
      colors, 
      source: "ai",
      prompt 
    });

  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
