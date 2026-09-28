import { NextRequest, NextResponse } from 'next/server';
import { GlobalFonts, createCanvas } from '@napi-rs/canvas';
import { join } from 'path';

export async function GET(req: NextRequest, { params }: { params: { size: string } }) {
  try {
    const sizeParam = params.size || "800x600";
    const [w, h] = sizeParam.split('x').map(v => parseInt(v) || 500);
    const width = Math.min(Math.max(w, 10), 4000);
    const height = Math.min(Math.max(h, 10), 4000);
    
    const search = req.nextUrl.searchParams;
    const text = search.get('text') || `${width} x ${height}`;
    const bg = search.get('bg') || '#111827';
    const bg2 = search.get('bg2') || '#4f46e5';
    const color = search.get('color') || '#ffffff';
    const isGradient = search.get('gradient') === '1';

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (isGradient) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, bg);
      grad.addColorStop(1, bg2);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bg;
    }
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = color;
    ctx.font = `bold ${Math.max(14, width / 15)}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    const png = await canvas.encode('png');
    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
