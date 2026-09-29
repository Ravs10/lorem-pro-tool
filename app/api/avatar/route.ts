import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || 'RP'
  const size = parseInt(searchParams.get('size') || '200')
  const bg = searchParams.get('bg') || '6d28d9'
  const color = searchParams.get('color') || 'ffffff'
  const shape = searchParams.get('shape') || 'squircle'
  const pattern = searchParams.get('pattern') || 'mesh'
  const font = searchParams.get('font') || 'bold'

  const initials = name.trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  const meshGradient = `
    <defs>
      <radialGradient id="g1" cx="0%" cy="0%" r="100%"><stop offset="0%" stop-color="#${bg}"/><stop offset="100%" stop-color="#${bg}00"/></radialGradient>
      <radialGradient id="g2" cx="100%" cy="0%" r="120%"><stop offset="0%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#0000"/></radialGradient>
      <radialGradient id="g3" cx="100%" cy="100%" r="100%"><stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#0000"/></radialGradient>
      <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <clipPath id="clip">${shape==='circle'?`<circle cx="${size/2}" cy="${size/2}" r="${size/2}"/>`: shape==='squircle'?`<path d="M ${size*0.1} 0 C 0 0 ${size*0.1} 0 ${size*0.5} C 0 ${size*0.9} 0 ${size} ${size*0.1} ${size} C ${size*0.5} ${size} ${size*0.9} ${size} ${size} ${size*0.9} C ${size} ${size*0.5} ${size} ${size*0.1} ${size*0.9} 0 C ${size*0.5} 0 ${size*0.1} 0 ${size*0.1} 0 Z"/>`:`<rect width="${size}" height="${size}" rx="${size*0.2}"/>`}</clipPath>
    </defs>
  `

  const patternLayer = pattern==='dots'? `<circle cx="20" cy="20" r="1.5" fill="white" opacity="0.15"/><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse"><use href="#dot"/></pattern>` : pattern==='grid'? `<pattern id="p" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" stroke-opacity="0.07" stroke-width="1"/></pattern>` : ''

  const svg = `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    ${meshGradient}
    <g clip-path="url(#clip)">
      <rect width="${size}" height="${size}" fill="#${bg}"/>
      <rect width="${size}" height="${size}" fill="url(#g1)"/>
      <rect width="${size}" height="${size}" fill="url(#g2)" opacity="0.8"/>
      <rect width="${size}" height="${size}" fill="url(#g3)" opacity="0.7"/>
      ${pattern==='mesh'? '' : `<rect width="${size}" height="${size}" fill="url(#p)"/>`}
      <rect width="${size}" height="${size}" filter="url(#noise)" opacity="0.04"/>
    </g>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Sora, sans-serif" font-weight="${font==='bold'?'800':'600'}" font-size="${size*0.38}" fill="#${color}" style="letter-spacing:-0.05em">${initials}</text>
  </svg>`

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000' } })
}
