import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const raw = (searchParams.get('name') || 'RC').trim()
  const size = Math.min(800, parseInt(searchParams.get('size') || '320'))
  const bg = (searchParams.get('bg') || 'ec4899').replace('#','')
  const color = (searchParams.get('color') || 'ffeb3b').replace('#','')
  const shape = searchParams.get('shape') || 'squircle'
  const pattern = searchParams.get('pattern') || 'mesh'
  const shadow = searchParams.get('shadow') || '0'
  const glass = searchParams.get('glass') || '0'

  const arr = Array.from(raw)
  const emojiOnly = arr.filter(c => /[^a-zA-Z0-9\s]/.test(c)).join('').slice(0,2)
  const isEmoji = emojiOnly.length>0
  const initials = isEmoji? emojiOnly : raw.split(/\s+/).filter(Boolean).map(w=>Array.from(w)[0]).join('').slice(0,2).toUpperCase() || 'RC'

  // Avatar ko chota kar diya taaki shadow ke liye jagah bache - print me bhi dikhega
  const m = shadow==='1'? size*0.12 : size*0.02
  const s = size - m*2

  const clip = shape==='circle'? `<circle cx="${size/2}" cy="${size/2}" r="${s/2}"/>`
  : shape==='squircle'? `<path d="M ${m+ s*0.12} ${m} C ${m} ${m} ${m} ${m} ${m} ${m+ s*0.12} L ${m} ${m+ s*0.88} C ${m} ${m+s} ${m} ${m+s} ${m+ s*0.12} ${m+s} L ${m+ s*0.88} ${m+s} C ${m+s} ${m+s} ${m+s} ${m+ s*0.88} L ${m+s} ${m+ s*0.12} C ${m+s} ${m} ${m+s} ${m} ${m+ s*0.88} ${m} Z"/>`
  : `<rect x="${m}" y="${m}" width="${s}" height="${s}" rx="${shape==='rounded'?s*0.22:0}"/>`

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity="0.8"/></filter>
    <radialGradient id="g1" cx="20%" cy="10%"><stop offset="0%" stop-color="#${bg}" stop-opacity="1"/><stop offset="100%" stop-color="#${bg}" stop-opacity="0.6"/></radialGradient>
    <radialGradient id="g2" cx="90%" cy="20%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.8"/><stop offset="100%" stop-opacity="0"/></radialGradient>
    <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.8" fill="white" opacity="0.35"/></pattern>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" stroke="white" stroke-opacity="0.25" stroke-width="0.8" fill="none"/></pattern>
    <pattern id="stripes" width="10" height="10" patternTransform="rotate(45)"><rect width="5" height="10" fill="white" opacity="0.2"/></pattern>
  </defs>
  ${shadow==='1'?`<rect width="${size}" height="${size}" fill="#111" rx="${size*0.04}"/>`:''}
  <g ${shadow==='1'?'filter="url(#sh)"':''}>
    <g clip-path="url(#c)"><clipPath id="c">${clip}</clipPath>
      <rect x="${m}" y="${m}" width="${s}" height="${s}" fill="#${bg}"/>
      <rect x="${m}" y="${m}" width="${s}" height="${s}" fill="url(#g1)"/>
      ${pattern!=='mesh'?`<rect x="${m}" y="${m}" width="${s}" height="${s}" fill="url(#g2)"/>`:''}
      ${pattern==='dots'?`<rect x="${m}" y="${m}" width="${s}" height="${s}" fill="url(#dots)"/>`:''}
      ${pattern==='grid'?`<rect x="${m}" y="${m}" width="${s}" height="${s}" fill="url(#grid)"/>`:''}
      ${pattern==='stripes'?`<rect x="${m}" y="${m}" width="${s}" height="${s}" fill="url(#stripes)"/>`:''}
      ${pattern==='mesh'?`<rect x="${m}" y="${m}" width="${s}" height="${s}" fill="url(#g2)"/>`:''}
      ${glass==='1'?`<ellipse cx="${size/2}" cy="${m + s*0.22}" rx="${s*0.38}" ry="${s*0.18}" fill="white" opacity="0.22"/>`:''}
    </g>
  </g>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="${isEmoji?'Apple Color Emoji,Segoe UI Emoji,sans-serif':'Inter,Arial,sans-serif'}" font-weight="800" font-size="${isEmoji?s*0.45:s*0.38}" fill="#${color}">${initials}</text>
  </svg>`
  return new Response(svg, { headers: { 'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=31536000, immutable','Access-Control-Allow-Origin':'*' } })
}
