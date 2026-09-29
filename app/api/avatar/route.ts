import { NextRequest } from 'next/server'
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || 'RP'
  const size = parseInt(searchParams.get('size') || '320')
  const bg = (searchParams.get('bg') || '6d28d9').replace('#','')
  const color = (searchParams.get('color') || 'ffffff').replace('#','')
  const shape = searchParams.get('shape') || 'squircle'
  const pattern = searchParams.get('pattern') || 'mesh'
  const shadow = searchParams.get('shadow') || '0'
  const emoji = searchParams.get('emoji') || ''

  const initials = emoji? emoji : name.trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  const isSquircle = shape==='squircle'
  const clip = shape==='circle'? `<circle cx="${size/2}" cy="${size/2}" r="${size/2}"/>` : isSquircle? `<path d="M ${size*0.12} 0 C 0 0 0 0 0 ${size*0.12} L 0 ${size*0.88} C 0 ${size} 0 ${size} ${size*0.12} ${size} L ${size*0.88} ${size} C ${size} ${size} ${size} ${size} ${size} ${size*0.88} L ${size} ${size*0.12} C ${size} 0 ${size} 0 ${size*0.88} 0 Z"/>` : `<rect width="${size}" height="${size}" rx="${shape==='rounded'?size*0.24:0}"/>`
  const shadowFilter = shadow==='1'? `<filter id="sh"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/></filter>` : ''
  const patternDef = pattern==='dots'? `<pattern id="pat" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" opacity="0.2"/></pattern>` : pattern==='grid'? `<pattern id="pat" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" stroke-opacity="0.12" stroke-width="1"/></pattern>` : pattern==='stripes'? `<pattern id="pat" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="6" height="12" fill="white" opacity="0.08"/></pattern>` : ''

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>${shadowFilter}<radialGradient id="g1" cx="0%" cy="0%" r="100%"><stop offset="0%" stop-color="#${bg}"/><stop offset="100%" stop-color="#${bg}" stop-opacity="0.6"/></radialGradient><radialGradient id="g2" cx="100%" cy="0%" r="120%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.9"/><stop offset="100%" stop-color="#0000"/></radialGradient><radialGradient id="g3" cx="100%" cy="100%" r="100%"><stop offset="0%" stop-color="#ec4899" stop-opacity="0.8"/><stop offset="100%" stop-color="#0000"/></radialGradient><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter><clipPath id="c">${clip}</clipPath>${patternDef}</defs>
  <g ${shadow==='1'?'filter="url(#sh)"':''}><g clip-path="url(#c)"><rect width="${size}" height="${size}" fill="#${bg}"/><rect width="${size}" height="${size}" fill="url(#g1)"/><rect width="${size}" height="${size}" fill="url(#g2)"/><rect width="${size}" height="${size}" fill="url(#g3)"/><rect width="${size}" height="${size}" fill="url(#pat)"/><rect width="${size}" height="${size}" filter="url(#noise)" opacity="0.05"/></g></g>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="${size*0.38}" fill="#${color}">${initials}</text></svg>`
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000' } })
}
