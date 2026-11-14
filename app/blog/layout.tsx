import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://lorem-pro-tool.run4ravish.workers.dev'),
  title: {
    default: 'Lorem Pro Tool - 26+ Free Online Tools in One Place | No Login, No Ads',
    template: '%s | Lorem Pro Tool',
  },
  description: 'Lorem Pro Tool - 26+ Free Online Tools in One Place. Lorem Ipsum Generator, YouTube Title, Tags & Description Generator, Word Counter & more. 100% Free, No Login, No Ads.',
  keywords: ['Lorem Pro Tool', 'Free Online Tools', 'Lorem Ipsum Generator', 'YouTube Title Generator', 'Free Tools No Login', 'Word Counter'],
  authors: [{ name: 'Admin', url: 'https://lorem-pro-tool.run4ravish.workers.dev' }],
  creator: 'Admin',
  publisher: 'Lorem Pro Tool',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lorem-pro-tool.run4ravish.workers.dev',
    siteName: 'Lorem Pro Tool',
    title: 'Lorem Pro Tool - 26+ Free Online Tools in One Place',
    description: '26+ Free Online Tools in One Place. No Login, No Ads. 100% Free.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Lorem Pro Tool - 26+ Free Online Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lorem Pro Tool - 26+ Free Online Tools',
    description: '26+ Free Online Tools in One Place. No Login, No Ads.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: 'https://lorem-pro-tool.run4ravish.workers.dev' },
  verification: { google: 'PASTE_YAHAN_GOOGLE_SEARCH_CONSOLE_CODE' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Lorem Pro Tool",
    "url": "https://lorem-pro-tool.run4ravish.workers.dev",
    "author": { "@type": "Person", "name": "Admin" },
    "publisher": { "@type": "Organization", "name": "Lorem Pro Tool" },
  }
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  )
}
