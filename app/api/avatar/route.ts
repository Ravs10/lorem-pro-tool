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
  const shape = searchParams.get('shape') || 'circle'
  const angle = searchParams.get('angle') || '135'

  // --- FINAL EMOJI FIX (ON/OFF dono me same result) ---
  let initials = 'LP'
  const cleaned = text.replace(/[^a-zA-Z0-9 ]/g, '').trim()
  if (cleaned) {
    initials = cleaned.split(' ').filter(Boolean).map((w: any) => w[0]).join('').toUpperCase().slice(0,2)
  }
  if (!initials) initials = 'LP'

  const pad = shadow? 40 : border + 6
  const total = size + pad * 2
  const center = total / 2
  const r = size / 2

  const filter = shadow? `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.4"/></filter>` : ''
  const patternDefs = `<pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" fill-opacity="0.3"/></pattern><pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-opacity="0.15" stroke-width="0.5"/></pattern>`
  const glassDef = glass? `<radialGradient id="gl" cx="30%" cy="30%"><stop offset="0%" stop-color="white" stop-opacity="0.4"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>` : ''
  const grad = `<linearGradient id="g" gradientTransform="rotate(${angle})"><stop offset="0%" stop-color="#${bg1}"/><stop offset="100%" stop-color="#${bg2}"/></linearGradient>`

  const svg = `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg"><defs>${grad}${filter}${patternDefs}${glassDef}</defs><rect x="${center-r-border}" y="${center-r-border}" width="${size+border*2}" height="${size+border*2}" rx="${shape==='circle'? (size+border*2)/2 : 28}" fill="#${borderColor}" /><rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : 22}" fill="url(#g)" ${shadow? 'filter="url(#sh)"' : ''}/>${pattern==='dots'? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : 22}" fill="url(#dots)"/>` : ''}${pattern==='grid'? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : 22}" fill="url(#grid)"/>` : ''}${glass? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : 22}" fill="url(#gl)"/>` : ''}<text x="${center}" y="${center+6}" text-anchor="middle" dominant-baseline="central" font-family="Inter, sans-serif" font-weight="${fw}" font-size="${size*0.4}" fill="white">${initials}</text></svg>`

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' } })
}
