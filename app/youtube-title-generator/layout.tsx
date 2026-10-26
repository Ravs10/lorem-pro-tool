import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Title Generator - 1000+ Viral AI Titles in Hindi, English, Spanish | Lorem Pro Tool",
  description: "Generate 1000+ viral, SEO-optimized YouTube titles with AI. Free YouTube Title Generator for Hindi, English & Spanish creators. Get 100 tags, 100 keywords, 100 hashtags & 50 thumbnails. No API, Unlimited, 100% Free - Lorem Pro Tool.",
  keywords: [
    "youtube title generator", "youtube title generator ai", "viral youtube title generator",
    "youtube title maker", "youtube video title generator", "best youtube title generator",
    "youtube title generator free", "ai title generator youtube", "youtube title generator hindi",
    "hindi youtube title generator", "youtube title generator english", "youtube title generator spanish",
    "youtube seo title generator", "catchy youtube titles", "clickbait title generator youtube",
    "youtube title ideas", "youtube title generator 1000", "youtube title generator 100",
    "youtube tags generator", "youtube keywords generator", "youtube hashtags generator",
    "youtube thumbnail ideas", "viral title generator", "youtube growth tool",
    "lorem pro tool youtube", "free youtube title tool", "youtube title generator no api",
    "youtube title generator unlimited", "best title for youtube video", "youtube title seo",
    "youtube title generator for gaming", "youtube title generator for vlog",
    "youtube title generator for education", "youtube title generator for tech",
    "youtube title generator with keywords", "youtube title generator with hashtags"
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  applicationName: "Lorem Pro Tool",
  metadataBase: new URL("https://lorem-pro-tool.run4ravish.workers.dev"),
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/youtube-title-generator",
    languages: {
      "en-US": "https://lorem-pro-tool.run4ravish.workers.dev/en/youtube-title-generator",
      "hi-IN": "https://lorem-pro-tool.run4ravish.workers.dev/hi/youtube-title-generator",
      "es-ES": "https://lorem-pro-tool.run4ravish.workers.dev/es/youtube-title-generator",
    },
  },
  openGraph: {
    title: "YouTube Title Generator - 1000+ Viral AI Titles | Free & Unlimited",
    description: "Generate 1000+ viral YouTube titles instantly. Includes 100 tags, 100 keywords, 100 hashtags. Free for Hindi, English, Spanish creators.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/youtube-title-generator",
    siteName: "Lorem Pro Tool",
    images: [
      {
        url: "https://lorem-pro-tool.run4ravish.workers.dev/og/youtube-title-generator.png",
        width: 1200,
        height: 630,
        alt: "YouTube Title Generator by Lorem Pro Tool - 1000+ Titles",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Title Generator - 1000+ Viral Titles Free",
    description: "AI YouTube Title Generator with 100 Tags, Keywords, Hashtags. No API Cost. Unlimited Free.",
    images: ["https://lorem-pro-tool.run4ravish.workers.dev/og/youtube-title-generator.png"],
    creator: "@loremprotool",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function YoutubeTitleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "YouTube Title Generator - Lorem Pro Tool",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "url": "https://lorem-pro-tool.run4ravish.workers.dev/youtube-title-generator",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "2847" },
    "description": "Free AI YouTube Title Generator that creates 1000+ viral titles, 100 tags, 100 keywords, 100 hashtags and 50 thumbnail ideas in Hindi, English and Spanish. No API, Unlimited usage."
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is YouTube Title Generator free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% free and unlimited. No API key needed. Generate 1000+ titles anytime." } },
      { "@type": "Question", "name": "How many titles can I generate?", "acceptedAnswer": { "@type": "Answer", "text": "You can generate 700 to 1000+ viral titles in one click with 100 tags, keywords and hashtags." } },
      { "@type": "Question", "name": "Does it support Hindi?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, it supports Hindi, English and Spanish with native viral title formulas." } }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {children}
    </>
  );
}
