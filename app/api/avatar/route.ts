export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const size = parseInt(searchParams.get('size') || '400')
  const text = searchParams.get('text') || 'Rav'
  const bg1 = (searchParams.get('bg1') || 'f7971e').replace('#','')
  const bg2 = (searchParams.get('bg2') || 'ffd200').replace('#','')
  const bg3 = (searchParams.get('bg3') || 'ff6a00').replace('#','')
  const border = parseInt(searchParams.get('border') || '4')
  const borderColor = (searchParams.get('borderColor') || 'ffffff').replace('#','')
  const borderStyle = searchParams.get('borderStyle') || 'solid'
  const shadow = searchParams.get('shadow') === '1'
  const glass = searchParams.get('glass') === '1'
  const pattern = (searchParams.get('pattern') || 'none').toLowerCase()
  const shape = searchParams.get('shape') || 'circle'
  const angle = searchParams.get('angle') || '135'
  const fw = searchParams.get('fw') || '800'
  const font = searchParams.get('font') || 'inter'

  // Hi-tech initials logic - emoji hata ke LP nahi, letter nikalega
  let initials = 'LP'
  const cleaned = text.replace(/[^a-zA-Z0-9 ]/g, '').trim()
  if (cleaned) {
    const words = cleaned.split(' ').filter(Boolean)
    if (words.length === 1) initials = words[0].slice(0,2).toUpperCase()
    else initials = words.map((w:any)=>w[0]).join('').toUpperCase().slice(0,2)
  }
  if (!initials) initials = 'LP'

  const pad = shadow? 50 : border + 10
  const total = size + pad*2
  const center = total/2
  const r = size/2

  const fonts: any = {
    inter: 'Inter, sans-serif',
    poppins: 'Poppins, sans-serif',
    montserrat: 'Montserrat, sans-serif',
    space: 'Space Grotesk, sans-serif',
    outfit: 'Outfit, sans-serif'
  }

  // Advanced filters
  const filters = `
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.35"/></filter>
    <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  `

  const patterns = `
    <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="white" fill-opacity="0.3"/></pattern>
    <pattern id="grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" stroke-width="1.2" stroke-opacity="0.25"/></pattern>
    <pattern id="diagonal" x="0" y="0" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="12" stroke="white" stroke-opacity="0.2" stroke-width="1"/></pattern>
    <pattern id="plus" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 6 v12 M6 12 h12" stroke="white" stroke-opacity="0.25" stroke-width="1.5"/></pattern>
    <linearGradient id="mesh1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#${bg1}"/><stop offset="50%" stop-color="#${bg2}"/><stop offset="100%" stop-color="#${bg3}"/></linearGradient>
  `

  const glassGrad = glass? `<radialGradient id="gl" cx="35%" cy="25%" r="70%"><stop offset="0%" stop-color="white" stop-opacity="0.45"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>` : ''

  const grad = `<linearGradient id="g" gradientTransform="rotate(${angle})"><stop offset="0%" stop-color="#${bg1}"/><stop offset="100%" stop-color="#${bg2}"/></linearGradient>`

  const useGrad = pattern === 'mesh'? 'url(#mesh1)' : 'url(#g)'

  // Shape path
  let clipPath = ''
  let borderPath = ''
  if (shape === 'circle') {
    clipPath = `rx="${r}"`
  } else if (shape === 'squircle') {
    clipPath = `rx="${size*0.3}"`
  } else if (shape === 'hexagon') {
    // hexagon via clipPath
  }

  const borderDash = borderStyle === 'dashed'? `stroke-dasharray="12 8"` : borderStyle === 'double'? `stroke-dasharray="0"` : ''

  const svg = `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg">
<defs>${grad}${filters}${patterns}${glassGrad}</defs>

<!-- Border -->
${border>0? `<rect x="${center-r-border}" y="${center-r-border}" width="${size+border*2}" height="${size+border*2}" rx="${shape==='circle'? (size+border*2)/2 : shape==='squircle'? (size+border*2)*0.3 : 20}" fill="none" stroke="#${borderColor}" stroke-width="${borderStyle==='double'? border*2 : border}" ${borderDash} opacity="${borderStyle==='double'? '0.8': '1'}"/>` : ''}

<!-- Main bg -->
<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : shape==='squircle'? size*0.3 : 22}" fill="${useGrad}" ${shadow? 'filter="url(#sh)"' : ''}/>

<!-- Pattern overlay -->
${pattern!=='none' && pattern!=='mesh'? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : shape==='squircle'? size*0.3 : 22}" fill="url(#${pattern})"/>` : ''}

<!-- Noise -->
${pattern==='noise'? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : shape==='squircle'? size*0.3 : 22}" filter="url(#noise)" opacity="0.15"/>` : ''}

<!-- Glass -->
${glass? `<rect x="${center-r}" y="${center-r}" width="${size}" height="${size}" rx="${shape==='circle'? r : shape==='squircle'? size*0.3 : 22}" fill="url(#gl)"/>` : ''}

<!-- Text -->
<text x="${center}" y="${center+8}" text-anchor="middle" dominant-baseline="middle" font-family="${fonts[font] || fonts.inter}" font-weight="${fw}" font-size="${initials.length>1? size*0.38 : size*0.5}" fill="white" style="letter-spacing:1px; text-shadow: 0 2px 8px rgba(0,0,0,0.2)">${initials}</text>
</svg>`

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' } })
}
