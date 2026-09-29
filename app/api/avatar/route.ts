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

  const chars = Array.from(rawName)
  const hasEmoji = /[^a-zA-Z0-9\s]/.test(rawName)
  let initials = ''
  let isEmojiMode = false
  if (hasEmoji) {
    const emojiOnly = chars.filter(c => /[^a-zA-Z0-9\s]/.test(c)).join('').slice(0,2)
    initials = emojiOnly || 'R'; isEmojiMode =!!emojiOnly
  } else {
    const words = rawName.split(/\s+/).filter(Boolean)
    initials = words.map(w => w[0]).join('').slice(0,2).toUpperCase() || 'R'
  }

  const clip = shape === 'circle'
? `<circle cx="${size/2}" cy="${size/2}" r="${size*0.42}"/>`
  : shape === 'squircle'
? `<path d="M ${size*0.18} ${size*0.06} C ${size*0.06} ${size*0.06} ${size*0.06} ${size*0.06} ${size*0.06} ${size*0.18} L ${size*0.06} ${size*0.82} C ${size*0.06} ${size*0.94} ${size*0.06} ${size*0.94} ${size*0.18} ${size*0.94} L ${size*0.82} ${size*0.94} C ${size*0.94} ${size*0.94} ${size*0.94} ${size*0.94} ${size*0.94} ${size*0.82} L ${size*0.94} ${size*0.18} C ${size*0.94} ${size*0.06} ${size*0.94} ${size*0.06} ${size*0.82} ${size*0.06} Z"/>`
  : `<rect x="${size*0.06}" y="${size*0.06}" width="${size*0.88}" height="${size*0.88}" rx="${shape==='rounded'?size*0.20:0}"/>`

  // FIX: Shadow ko bada aur dark kiya, filter region bada kiya taaki crop na ho
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000" flood-opacity="0.75"/>
    </filter>
    <radialGradient id="g1" cx="0%" cy="0%"><stop offset="0%" stop-color="#${bg}"/><stop offset="100%" stop-color="#${bg}" stop-opacity="0.7"/></radialGradient>
    <radialGradient id="g2" cx="100%" cy="0%" r="120%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.7"/><stop offset="100%" stop-opacity="0"/></radialGradient>
    <clipPath id="c">${clip}</clipPath>
    ${pattern==='dots'?`<pattern id="pat" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" opacity="0.18"/></pattern>`:''}
  </defs>

  <!-- Background for shadow visibility -->
  <rect width="${size}" height="${size}" fill="#0a0a0a" opacity="${shadow==='1'?'1':'0'}"/>

  <g filter="${shadow==='1'?'url(#sh)':''}">
    <g clip-path="url(#c)">
      <rect x="${size*0.06}" y="${size*0.06}" width="${size*0.88}" height="${size*0.88}" fill="#${bg}"/>
      <rect x="${size*0.06}" y="${size*0.06}" width="${size*0.88}" height="${size*0.88}" fill="url(#g1)"/>
      <rect x="${size*0.06}" y="${size*0.06}" width="${size*0.88}" height="${size*0.88}" fill="url(#g2)"/>
      ${pattern!=='mesh'?`<rect x="${size*0.06}" y="${size*0.06}" width="${size*0.88}" height="${size*0.88}" fill="url(#pat)"/>`:''}
      ${glass==='1'?`<ellipse cx="${size/2}" cy="${size*0.28}" rx="${size*0.32}" ry="${size*0.14}" fill="white" opacity="0.18"/>`:''}
    </g>
  </g>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="${isEmojiMode?'Apple Color Emoji,Segoe UI Emoji,sans-serif':'Inter,sans-serif'}" font-weight="800" font-size="${isEmojiMode?size*0.38:size*0.26}" fill="#${color}">${initials}</text>
  </svg>`
  return new Response(svg, { headers: { 'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=31536000, immutable','Access-Control-Allow-Origin':'*' } })
}
