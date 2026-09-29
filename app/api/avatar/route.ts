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

  // FIX: Agar emoji + letter mix hai to sirf emoji ya sirf letter dikhao, mix nahi
  const chars = Array.from(rawName)
  const hasEmoji = /[^a-zA-Z0-9\s]/.test(rawName)

  let initials = ''
  let isEmojiMode = false

  if (hasEmoji) {
    // Emoji mil gaya to sirf emoji dikhao, letter hata do -?R bug khatam
    const emojiOnly = chars.filter(c => /[^a-zA-Z0-9\s]/.test(c)).join('').slice(0,2)
    if (emojiOnly) {
      initials = emojiOnly
      isEmojiMode = true
    } else {
      initials = 'R'
    }
  } else {
    // Sirf letters hai
    const words = rawName.split(/\s+/).filter(Boolean)
    initials = words.map(w => w[0]).join('').slice(0,2).toUpperCase() || 'R'
  }

  const clip = shape === 'circle'
 ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2}"/>`
  : shape === 'squircle'
 ? `<path d="M ${size*0.12} 0 C 0 0 0 0 0 ${size*0.12} L 0 ${size*0.88} C 0 ${size} 0 ${size} ${size*0.12} ${size} L ${size*0.88} ${size} C ${size} ${size} ${size} ${size} ${size} ${size*0.88} L ${size} ${size*0.12} C ${size} 0 ${size} 0 ${size*0.88} 0 Z"/>`
  : `<rect width="${size}" height="${size}" rx="${shape==='rounded'?size*0.24:0}"/>`

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${shadow==='1'?`<filter id="sh"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.4"/></filter>`:''}
    <radialGradient id="g1" cx="0%" cy="0%"><stop offset="0%" stop-color="#${bg}"/><stop offset="100%" stop-color="#${bg}" stop-opacity="0.7"/></radialGradient>
    <radialGradient id="g2" cx="100%" cy="0%" r="120%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.7"/><stop offset="100%" stop-opacity="0"/></radialGradient>
    <clipPath id="c">${clip}</clipPath>
    ${pattern==='dots'?`<pattern id="pat" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" opacity="0.18"/></pattern>`:''}
    ${pattern==='grid'?`<pattern id="pat" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M 26 0 L 0 0 0 26" stroke="white" stroke-opacity="0.1" fill="none"/></pattern>`:''}
    ${pattern==='stripes'?`<pattern id="pat" width="12" height="12" patternTransform="rotate(45)"><rect width="6" height="12" fill="white" opacity="0.08"/></pattern>`:''}
  </defs>
  <g ${shadow==='1'?'filter="url(#sh)"':''}>
    <g clip-path="url(#c)">
      <rect width="${size}" height="${size}" fill="#${bg}"/>
      <rect width="${size}" height="${size}" fill="url(#g1)"/><rect width="${size}" height="${size}" fill="url(#g2)"/>
      ${pattern!=='mesh'?`<rect width="${size}" height="${size}" fill="url(#pat)"/>`:''}
      ${glass==='1'?`<ellipse cx="${size/2}" cy="${size*0.22}" rx="${size*0.42}" ry="${size*0.18}" fill="white" opacity="0.14"/>`:''}
    </g>
  </g>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="${isEmojiMode?'Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif':'Inter,sans-serif'}" font-weight="800" font-size="${isEmojiMode?size*0.55:size*0.38}" fill="#${color}">${initials}</text>
  </svg>`
  return new Response(svg, { headers: { 'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=31536000, immutable','Access-Control-Allow-Origin':'*' } })
}
