import { NextRequest } from 'next/server';
import sharp from 'sharp';
export async function GET(req: NextRequest, { params }: { params: { size: string } }) {
  try {
    const sizeParam = params.size || "800x600";
    const isAvatar = req.nextUrl.pathname.includes('/avatar/');
    let [w, h] = sizeParam.split('x').map(Number);
    let width = w || 800; let height = h || 600;
    if (isAvatar &&!sizeParam.includes('x')) { width = w; height = w; }
    const sp = req.nextUrl.searchParams;
    let text = sp.get('text') || `${width}x${height}`;
    const name = sp.get('name') || 'Ankit Kumar';
    if(isAvatar){ text = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2); }
    const bg1 = sp.get('bg1') || '#6366f1'; const bg2 = sp.get('bg2') || '#a855f7';
    const color = sp.get('color') || '#ffffff'; const font = sp.get('font') || 'Poppins';
    const border = sp.get('border') || '24'; const shadow = sp.get('shadow') === 'true';
    const pattern = sp.get('pattern') === 'true'; const format = (sp.get('format') || 'svg').toLowerCase();
    const fontFamily = font === 'Mono'? 'monospace' : font === 'Serif'? 'serif' : 'system-ui, sans-serif';
    const isCircle = isAvatar;
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient>${shadow? `<filter id="s"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.3"/></filter>` : ''}${pattern? `<pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.15"/></pattern>` : ''}</defs><rect width="100%" height="100%" rx="${isCircle? '50%' : border}" fill="url(#g)" ${shadow? 'filter="url(#s)"' : ''}/>${pattern? `<rect width="100%" height="100%" rx="${isCircle? '50%' : border}" fill="url(#p)"/>` : ''}<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="${fontFamily}" font-size="${Math.min(width,height)/5}" font-weight="700" fill="${color}">${text}</text></svg>`;
    if (format === 'svg') { return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000' } }); }
    const buffer = await sharp(Buffer.from(svg)).toFormat(format as any).toBuffer();
    const contentType = format === 'jpg'? 'image/jpeg' : format === 'webp'? 'image/webp' : 'image/png';
    return new Response(buffer, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' } });
  } catch (e) { return new Response('Error generating image', { status: 500 }); }
}
