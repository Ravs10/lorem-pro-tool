'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'black', color: 'white' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontWeight: 'bold', fontSize: '20px', textDecoration: 'none', color: 'white' }}>
          ⚡ Lorem Pro Tool
        </Link>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isHome && (
            <Link href="/" style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
              ← Back
            </Link>
          )}
          <Link href="/#all-tools" style={{ background: 'white', color: 'black', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            ✨ All Tools
          </Link>
        </div>
      </div>
    </header>
  )
}
