export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const size = parseInt(searchParams.get('size') || '400');
  const text = searchParams.get('text') || 'RS';
  const bg1 = (searchParams.get('bg1') || '6366f1').replace('#','');
  const bg2 = (searchParams.get('bg2') || 'a855f7').replace('#','');
  const border = parseInt(searchParams.get('border') || '8');
  const borderColor = (searchParams.get('borderColor') || 'ffffff').replace('#','');
  const shadow = searchParams.get('shadow') === '1';
  const glass = searchParams.get('glass') === '1';
  const pattern = searchParams.get('pattern') || 'none';
  const fw = searchParams.get('fw') || '900';
  const emojiMode = searchParams.get('emoji') === '1';
  const shape = searchParams.get('shape') || 'circle'; // new
  const angle = searchParams.get('angle') || '135'; // new

  let initials = text;
  if(!emojiMode){
    initials = text.split(' ').map((w:any)=>w[0]).join('').toUpperCase().slice(0,2);
  }

  const pad = shadow? 40 : border + 5;
  const total = size + pad*2;
  const center = total/2;
  const r = size/2;
  const rx = shape === 'square'? 30 : r + border;

  const filter = shadow? `<filter id="sh" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="25" stdDeviation="22" flood-color="black" flood-opacity="0.8"/></filter>` : '';
  const patternDef = pattern === 'dots'? `<pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.8" fill="white" opacity="0.35"/></pattern><pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-opacity="0.18" stroke-width="0.7"/></pattern>` : '';
  const glassDef = glass? `<radialGradient id="gls" cx="28%" cy="22%" r="70%"><stop offset="0%" stop-color="white" stop-opacity="0.55"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>` : '';

  const grad = `<linearGradient id="g" gradientTransform="rotate(${angle})" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#${bg1}"/><stop offset="100%" stop-color="#${bg2}"/></linearGradient>`;

  const clip = shape === 'square'? `rx="40"` : '';

  const svg = `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg">
  <defs>${grad}${filter}${patternDef}${glassDef}</defs>
  <rect x="${center-r-border}" y="${center-r-border}" width="${size+border*2}" height="${size+border*2}" rx="${shape==='square'?40:r+border}" fill="#${borderColor}" ${shadow? 'filter="url(#sh)"' : ''}/>
  <rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='square'?32:r}" fill="url(#g)" ${shadow? 'filter="url(#sh)"' : ''}/>
  ${pattern==='dots'? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='square'?32:r}" fill="url(#dots)"/>` : ''}
  ${pattern==='grid'? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='square'?32:r}" fill="url(#grid)"/>` : ''}
  ${glass? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='square'?32:r}" fill="url(#gls)"/>` : ''}
  <text x="${center}" y="${center+ (emojiMode? 12 : 6)}" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="${fw}" font-size="${emojiMode? r*0.85 : r/1.15}" fill="white">${initials}</text>
  </svg>`;

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' } });
}
