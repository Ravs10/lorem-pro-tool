import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lorem-pro-tool.run4ravish.workers.dev';
  const lastMod = new Date('2026-11-04');

  return [
    { url: baseUrl, lastModified: lastMod, changeFrequency: 'weekly', priority: 1 },

    // HIGH CPC / MONEY TOOLS
    { url: `${baseUrl}/fd-rd-calculator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/income-tax-calculator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/personal-loan-emi-calculator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/fire-calculator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/mortgage-calculator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/sip-calculator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/youtube-earnings-calculator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/resume-builder`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.9 },

    // VIRAL / AI TOOLS
    { url: `${baseUrl}/ai-detector`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/hashtag-generator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/youtube-title-generator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/youtube-thumbnail-downloader`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.85 },

    // BLOG + NORMAL TOOLS
    { url: `${baseUrl}/blog`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/word-counter`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/character-counter`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/fake-data-generator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/color-palette`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/case-converter`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/password-generator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/placeholder-qr-generator`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/fancy-text`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/image-to-text`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/text-to-handwriting`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/remove-duplicates`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/avatar`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },

    // PAGES
    { url: `${baseUrl}/about`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/disclaimer`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
