export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const size = parseInt(searchParams.get('size') || '400');
  const text = searchParams.get('text') || 'RS';
  const bg1 = (searchParams.get('bg1') || '6366f1').replace('#','');
  const bg2 = (searchParams.get('bg2') || 'a855f7').replace('#','');
  const border = parseInt(searchParams.get('border') || '0');
  const borderColor = (searchParams.get('borderColor') || 'ffffff').replace('#','');
  const shadow = searchParams.get('shadow') === '1';
  const glass = searchParams.get('glass') === '1';
  const pattern = searchParams.get('pattern') || 'none';
  const fw = searchParams.get('fw') || '900';
  const emojiMode = searchParams.get('emoji') === '1';

  let initials = text;
  if(!emojiMode){
    initials = text.split(' ').map((w:any)=>w[0]).join('').toUpperCase().slice(0,2);
  }

  const pad = shadow? 40 : border + 5;
  const total = size + pad*2;
  const center = total/2;
  const r = size/2;

  const filter = shadow? `<filter id="sh" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="black" flood-opacity="0.7"/></filter>` : '';
  const patternDef = pattern === 'dots'? `<pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" opacity="0.2"/></pattern>` : '';
  const glassDef = glass? `<radialGradient id="gls" cx="30%" cy="30%"><stop offset="0%" stop-color="white" stop-opacity="0.4"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>` : '';

  const svg = `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#${bg1}"/><stop offset="100%" stop-color="#${bg2}"/></linearGradient>${filter}${patternDef}${glassDef}</defs>
  <circle cx="${center}" cy="${center}" r="${r+border}" fill="#${borderColor}" ${shadow? 'filter="url(#sh)"' : ''}/>
  <circle cx="${center}" cy="${center}" r="${r}" fill="url(#g)" ${shadow? 'filter="url(#sh)"' : ''}/>
  ${pattern!== 'none'? `<circle cx="${center}" cy="${center}" r="${r}" fill="url(#dots)"/>` : ''}
  ${glass? `<circle cx="${center}" cy="${center}" r="${r}" fill="url(#gls)"/>` : ''}
  <text x="${center}" y="${center+ (emojiMode? 10 : 5)}" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="${fw}" font-size="${emojiMode? r*0.9 : r/1.2}" fill="white">${initials}</text>
  </svg>`;

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' } });
}
