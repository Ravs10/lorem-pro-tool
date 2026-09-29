export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  const url = new URL(req.url);
  const size = parseInt(url.searchParams.get('size') || '200');
  const text = url.searchParams.get('text') || 'RS';
  const bg1 = url.searchParams.get('bg1') || '6366f1';
  const bg2 = url.searchParams.get('bg2') || 'a855f7';
  const initials = text.split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#${bg1}"/><stop offset="100%" stop-color="#${bg2}"/></linearGradient></defs><rect width="100%" height="100%" rx="${size/2}" fill="url(#g)"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-weight="900" font-size="${size/2.5}" fill="white">${initials}</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000' } });
}
