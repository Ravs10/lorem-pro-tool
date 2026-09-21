import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://lorem-pro-tool.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
  url: 'https://lorem-pro-tool.vercel.app/fake-data-generator',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
},
  ]
}
