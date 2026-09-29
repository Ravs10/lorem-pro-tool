import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawName = (searchParams.get('name') || 'RP').trim()
  const size = parseInt(searchParams.get('size') || '320')
  const bg = (searchParams.get('bg') || '6d28d9').replace('#','')
  const color = (searchParams.get('color') || 'ffffff').replace('#','')
  const shape = searchParams.get('shape') || 'squircle'
  const pattern = searchParams.get('pattern') || 'mesh'
  const shadow = searchParams.get('shadow') || '0'
  const glass = searchParams.get('glass') || '0'

  // FIXED EMOJI DETECTION - No \p{Emoji} regex, so no TS error
  // Agar name me sirf emoji ya non-english chars hai aur length choti hai to emoji samjho
  const isOnlyEmoji = rawName.length <= 4 && /[^a-zA-Z0-9\s]/.test(rawName)
  let initials = ''
  if (isOnlyEmoji) {
    initials = rawName
  } else {
    const words = rawName.split(/\s+/).filter(Boolean)
    initials = words.map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'RP'
  }

  const clip = shape === 'circle'
 ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2}"/>`
   : shape === 'squircle'
 ? `<path d="M ${size*0.12} 0 C 0 0 0 0 0 ${size*0.12} L 0 ${size*0.88} C 0 ${size} 0 ${size} ${size*0.12} ${size} L ${size*0.88} ${size} C ${size} ${size} ${size} ${size} ${size} ${size*0.88} L ${size} ${size*0.12} C ${size} 0 ${size} 0 ${size*0.88} 0 Z"/>`
    : `<rect width="${size}" height="${size}" rx="${shape==='rounded'?size*0.24:0}"/>`

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${shadow==='1'?`<filter id="sh"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-opacity="0.5"/></filter>`:''}
    <radialGradient id="g1" cx="0%" cy="0%"><stop offset="0%" stop-color="#${bg}"/><stop offset="100%" stop-color="#${bg}" stop-opacity="0.6"/></radialGradient>
    <radialGradient id="g2" cx="100%" cy="0%" r="120%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.8"/><stop offset="100%" stop-opacity="0"/></radialGradient>
    <radialGradient id="g3" cx="100%" cy="100%"><stop offset="0%" stop-color="#ec4899" stop-opacity="0.7"/><stop offset="100%" stop-opacity="0"/></radialGradient>
    <clipPath id="c">${clip}</clipPath>
    ${pattern==='dots'?`<pattern id="pat" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" opacity="0.22"/></pattern>`:''}
    ${pattern==='grid'?`<pattern id="pat" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M 26 0 L 0 0 0 26" stroke="white" stroke-opacity="0.12" fill="none"/></pattern>`:''}
    ${pattern==='stripes'?`<pattern id="pat" width="12" height="12" patternTransform="rotate(45)"><rect width="6" height="12" fill="white" opacity="0.1"/></pattern>`:''}
  </defs>
  <g ${shadow==='1'?'filter="url(#sh)"':''}>
    <g clip-path="url(#c)">
      <rect width="${size}" height="${size}" fill="#${bg}"/>
      <rect width="${size}" height="${size}" fill="url(#g1)"/><rect width="${size}" height="${size}" fill="url(#g2)"/><rect width="${size}" height="${size}" fill="url(#g3)"/>
      ${pattern!=='mesh'?`<rect width="${size}" height="${size}" fill="url(#pat)"/>`:''}
      ${glass==='1'?`<ellipse cx="${size/2}" cy="${size*0.2}" rx="${size*0.45}" ry="${size*0.25}" fill="white" opacity="0.18"/><ellipse cx="${size/2}" cy="${size*0.25}" rx="${size*0.35}" ry="${size*0.12}" fill="white" opacity="0.1"/>`:''}
    </g>
  </g>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,Inter,sans-serif" font-weight="800" font-size="${isOnlyEmoji?size*0.48:size*0.38}" fill="#${color}">${initials}</text>
  </svg>`
  return new Response(svg, { headers: { 'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=31536000, immutable','Access-Control-Allow-Origin':'*' } })
}
