export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const size = parseInt(searchParams.get('size') || '200');
  const text = searchParams.get('text') || 'RS';
  const bg1 = (searchParams.get('bg1') || '6366f1').replace('#','');
  const bg2 = (searchParams.get('bg2') || 'a855f7').replace('#','');
  const hasShadow = searchParams.get('shadow') === '1';
  const initials = text.split(' ').map((w:any)=>w[0]).join('').toUpperCase().slice(0,2);
  const pad = hasShadow? 30 : 0;
  const total = size + pad*2;
  const filter = hasShadow? `<filter id="sh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="black" flood-opacity="0.6"/></filter>` : '';
  const svg = `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#${bg1}"/><stop offset="100%" stop-color="#${bg2}"/></linearGradient>${filter}</defs><circle cx="${total/2}" cy="${total/2}" r="${size/2}" fill="url(#g)" ${hasShadow? 'filter="url(#sh)"' : ''}/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="${size/2.5}" fill="white">${initials}</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' } });
}
