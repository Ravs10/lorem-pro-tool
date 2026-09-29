import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || 'RC'
  const bg = searchParams.get('bg') || 'ec4899'
  const txt = searchParams.get('txt') || 'ffeb3b'
  const size = parseInt(searchParams.get('size') || '320')
  const shape = searchParams.get('shape') || 'squircle'
  const shadow = searchParams.get('shadow') === 'true'
  const glass = searchParams.get('glass') === 'true'

  const initials = name.slice(0,2).toUpperCase()
  
  const radius = shape === 'circle' ? '50%' : shape === 'squircle' ? '25%' : '18%'

  const svg = `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      ${shadow ? `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.25"/></filter>` : ''}
    </defs>
    <rect width="${size}" height="${size}" rx="${shape === 'circle' ? size/2 : 48}" fill="#${bg}" ${shadow ? 'filter="url(#sh)"' : ''}/>
    ${glass ? `<rect x="0" y="0" width="${size}" height="${size/2}" rx="${shape === 'circle' ? size/2 : 48}" fill="white" opacity="0.18"/>` : ''}
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial" font-weight="800" font-size="${size*0.38}" fill="#${txt}">${initials}</text>
  </svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
