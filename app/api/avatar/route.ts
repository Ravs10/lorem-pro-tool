export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const size = parseInt(searchParams.get('size') || '200')
  const text = searchParams.get('text') || 'LP'
  const bg1 = (searchParams.get('bg1') || 'f7971e').replace('#','')
  const bg2 = (searchParams.get('bg2') || 'ffd200').replace('#','')
  const border = parseInt(searchParams.get('border') || '0')
  const borderColor = (searchParams.get('borderColor') || 'ffffff').replace('#','')
  const shadow = searchParams.get('shadow') === '1'
  const glass = searchParams.get('glass') === '1'
  const pattern = searchParams.get('pattern') || 'none'
  const fw = searchParams.get('fw') || '900'
  const emojiMode = searchParams.get('emoji') === '1'
  const shape = searchParams.get('shape') || 'circle'
  const angle = searchParams.get('angle') || '135'

  // --- EMOJI FIX ---
  let cleanedText = text.trim();
  if (!emojiMode) {
    cleanedText = cleanedText.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').trim();
  }
  let initials = cleanedText.split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  // agar khali ya sirf special char /? bacha to LP
  if (!initials || /^[^A-Z0-9]+$/u.test(initials) || initials.includes('?')) {
    initials = 'LP';
  }
  // Agar original me sirf emoji tha aur emoji ON hai tab bhi LP dikhao kyunki SVG font emoji support nahi karta
  if (/^[\p{Extended_Pictographic}\uFE0F\s]+$/u.test(text.trim())) {
    initials = 'LP';
  }

  const pad = shadow? 40 : border + 6;
  const total = size + pad * 2;
  const center = total / 2;
  const r = size / 2;

  const filter = shadow? `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.4"/></filter>` : '';

  // YAHI FIX HAI - Dono pattern hamesha define
  const patternDefs = `
    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" fill-opacity="0.3"/></pattern>
    <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-opacity="0.15" stroke-width="0.5"/></pattern>
  `;

  const glassDef = glass? `<radialGradient id="gl" cx="30%" cy="30%"><stop offset="0%" stop-color="white" stop-opacity="0.4"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>` : '';
  const grad = `<linearGradient id="g" gradientTransform="rotate(${angle})"><stop offset="0%" stop-color="#${bg1}"/><stop offset="100%" stop-color="#${bg2}"/></linearGradient>`;

  const svg = `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg">
<defs>${grad}${filter}${patternDefs}${glassDef}</defs>
<rect x="${center-r-border}" y="${center-r-border}" width="${size+border*2}" height="${size+border*2}" rx="${shape==='circle'? (size+border*2)/2 : 28}" fill="#${borderColor}" />
<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : 22}" fill="url(#g)" ${shadow? 'filter="url(#sh)"' : ''}/>
${pattern==='dots'? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : 22}" fill="url(#dots)"/>` : ''}
${pattern==='grid'? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : 22}" fill="url(#grid)"/>` : ''}
${glass? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : 22}" fill="url(#gl)"/>` : ''}
<text x="${center}" y="${center + (emojiMode? 0 : 6)}" text-anchor="middle" dominant-baseline="central" font-family="Inter, sans-serif" font-weight="${fw}" font-size="${size*0.4}" fill="white">${initials}</text>
</svg>`;

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' } })
}
