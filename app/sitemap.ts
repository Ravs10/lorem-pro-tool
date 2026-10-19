import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lorem-pro-tool.run4ravish.workers.dev';
  const lastModified = new Date('2026-10-19');

  const routes = [
    // Main - Root hi Lorem Ipsum Generator hai
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    
    // Main Tools
    { path: '/fake-data-generator', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/word-counter', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/character-counter', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/password-generator', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/placeholder-qr-generator', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/case-converter', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/fancy-text', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/image-to-text', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/text-to-handwriting', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/remove-duplicates', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/avatar', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },

    // Info Pages - Tumhare diye hue exact links
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/disclaimer', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
