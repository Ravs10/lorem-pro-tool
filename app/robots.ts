import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // ✅ FIX - /admin Bhi Add Kar Diya - Ab Google Admin Nahi Dekh Payega!
        disallow: ['/api/', '/private/', '/admin', '/admin/*'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin', '/admin/*'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],
    sitemap: 'https://lorem-pro-tool.run4ravish.workers.dev/sitemap.xml',
    host: 'https://lorem-pro-tool.run4ravish.workers.dev',
  }
}
