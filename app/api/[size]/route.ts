import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(req: NextRequest, { params }: { params: { size: string } }) {
  try {
    const sizeParam = params.size || "800x600";
    const isAvatar = req.nextUrl.pathname.includes('/avatar/');
    let [w, h] = sizeParam.split('x').map(Number);
    let width = w || 800; let height = h || 600;

    const sp = req.nextUrl.searchParams;
    let text = sp.get('text') || `${width}x${height}`;
    const name = sp.get('name') || 'Ankit Kumar';
    if(isAvatar){
      text = name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    }

    const bg1 = sp.get('bg1') || '#6366f1';
    const bg2 = sp.get('bg2') || '#a855f7';
    const color = sp.get('color') || '#ffffff';
    const font = sp.get('font') || 'Poppins';
    const border = sp.get('border') || '24';
    const shadow = sp.get('shadow') === 'true';
    const pattern = sp.get('pattern') === 'true';
    const format = (sp.get('format') || 'svg').toLowerCase();

    const fontFamily = font === 'Mono'? 'Courier New, monospace' : font === 'Bold'? 'Arial Black, sans-serif' : 'Poppins, sans-serif';

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient>${shadow? `<filter id="sh"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-opacity="0.4"/></filter>` : ''}${pattern? `<pattern id="p" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="1.5" fill="white" opacity="0.15"/></pattern>` : ''}</defs><rect width="100%" height="100%" rx="${border}" fill="url(#g)" ${shadow? 'filter="url(#sh)"' : ''}/>${pattern? `<rect width="100%" height="100%" rx="${border}" fill="url(#p)"/>` : ''}<text x="50%" y="50%" font-family="${fontFamily}" font-size="${Math.min(width,height)/7}" fill="${color}" text-anchor="middle" dy=".35em" font-weight="800">${text}</text></svg>`;

    if(format === 'svg'){
      return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' } });
    }
    const buf = await sharp(Buffer.from(svg)).toFormat(format as any).toBuffer();
    return new NextResponse(buf, { headers: { 'Content-Type': `image/${format}`, 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch(e){
    return new NextResponse('Error', { status: 500 });
  }
}
