import { NextRequest } from 'next/server'
export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get('name') || 'Ravi Patel'
  const size = parseInt(searchParams.get('size') || '320')
  const bg = (searchParams.get('bg') || '6d28d9').replace('#','')
  const color = (searchParams.get('color') || 'ffffff').replace('#','')
  const shape = searchParams.get('shape') || 'squircle'
  const pattern = searchParams.get('pattern') || 'mesh'
  const hasShadow = searchParams.get('shadow') === '1'
  const glass = searchParams.get('glass') === '1'
  const chars = Array.from(raw.trim())
  const emojiRegex = /\p{Emoji}/u
  const firstEmoji = chars.find(c=>emojiRegex.test(c))
  const text = firstEmoji? firstEmoji : (chars.filter(c=>!emojiRegex.test(c)).join('').trim().slice(0,2).toUpperCase() || 'R')
  const rx = shape==='circle'? size/2 : shape==='squircle'? size*0.26 : shape==='rounded'? 28 : 0
  let defs = ''
  let extraFill = ''
  if(pattern==='mesh'){
    defs+=`<radialGradient id="m1" cx="20%" cy="30%" r="80%"><stop offset="0%" stop-color="#${bg}"/><stop offset="100%" stop-color="#ec4899"/></radialGradient><radialGradient id="m2" cx="80%" cy="80%" r="70%"><stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8"/><stop offset="100%" stop-color="transparent"/></radialGradient>`
    extraFill=`<rect width="${size}" height="${size}" rx="${rx}" fill="url(#m1)"/><rect width="${size}" height="${size}" rx="${rx}" fill="url(#m2)"/>`
  } else if(pattern==='dots'){
    defs+=`<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="white" opacity="0.22"/></pattern>`
    extraFill=`<rect width="${size}" height="${size}" rx="${rx}" fill="url(#dots)"/>`
  } else if(pattern==='grid'){
    defs+=`<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" stroke-opacity="0.12" stroke-width="1"/></pattern>`
    extraFill=`<rect width="${size}" height="${size}" rx="${rx}" fill="url(#grid)"/>`
  } else if(pattern==='stripes'){
    defs+=`<pattern id="stripes" width="18" height="18" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="18" stroke="white" stroke-opacity="0.18" stroke-width="4"/></pattern>`
    extraFill=`<rect width="${size}" height="${size}" rx="${rx}" fill="url(#stripes)"/>`
  }
  if(hasShadow){ defs+=`<filter id="sh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity="0.55"/></filter>` }
  const glassPart = glass? `<ellipse cx="${size/2}" cy="${size*0.22}" rx="${size*0.48}" ry="${size*0.28}" fill="white" opacity="0.20"/><ellipse cx="${size/2}" cy="${size*0.28}" rx="${size*0.36}" ry="${size*0.14}" fill="white" opacity="0.12"/>` : ''
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs><g ${hasShadow?'filter="url(#sh)"':''}><rect width="${size}" height="${size}" rx="${rx}" fill="#${bg}"/>${extraFill}${glassPart}<text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="${size*0.38}" fill="#${color}">${text}</text></g></svg>`
  return new Response(svg,{headers:{'Content-Type':'image/svg+xml'}})
}
