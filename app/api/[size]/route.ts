import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { size: string } }) {
  try {
    const sizeParam = params?.size || "800x600";
    const [w, h] = sizeParam.split('x').map((v: string) => parseInt(v) || 500);
    const width = Math.min(Math.max(w, 10), 4000);
    const height = Math.min(Math.max(h, 10), 4000);
    
    const search = req.nextUrl.searchParams;
    const text = search.get('text') || `${width} x ${height}`;
    const bg = (search.get('bg') || '#111827').replace('#','');
    const bg2 = (search.get('bg2') || '#4f46e5').replace('#','');
    const color = (search.get('color') || '#ffffff').replace('#','');
    const isGradient = search.get('gradient') === '1';
    const fontSize = Math.max(14, Math.floor(width / 15));

    const fill = isGradient 
      ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#${bg}"/><stop offset="100%" stop-color="#${bg2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`
      : `<rect width="100%" height="100%" fill="#${bg}"/>`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${fill}
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#${color}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">${text}</text>
    </svg>`;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (e: any) {
    return new Response(`<svg><text>${e.message}</text></svg>`, { headers: { 'Content-Type': 'image/svg+xml' }, status: 500 });
  }
}
