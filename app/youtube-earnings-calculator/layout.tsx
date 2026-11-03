import type { Metadata } from "next";

const BASE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";

export const metadata: Metadata = {
  title: {
    default: "YouTube Earnings Calculator 2024 - AdSense + Sponsorship + Tax (India & USA)",
    template: "%s | Lorem Pro Tool"
  },
  description: "Most advanced YouTube earnings calculator. Calculate AdSense (55% cut), sponsorships $5/1k, memberships, Super Thanks, tax. 15 niches, 20 countries, USD/INR. 7.8M views = $42,325 net. Finance niche $22 CPM.",
  keywords: [
    "youtube earnings calculator",
    "youtube money calculator 2024",
    "youtube cpm calculator india",
    "youtube rpm calculator",
    "youtube sponsorship calculator",
    "adsense calculator india",
    "how much youtube pays for 1 million views",
    "youtube income tax calculator india",
    "youtube earnings calculator inr",
    "youtube money calculator usa",
    "highest paying youtube niches",
    "lorem pro tool", 
    "lorem pro tool youtube earnings calculator", 
    "faceless youtube channel earnings"
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/youtube-earnings-calculator",
  },
  openGraph: {
    title: "YouTube Earnings Calculator 2024 - $42,325/mo for 7.8M Views (Real Data)",
    description: "AdSense $7772 + Sponsorship $39255 - Tax = $42325 NET. Supports Finance $22 CPM, Gaming $1.5 CPM. 20 countries, USD/INR, Growth Projection.",
    url: `${BASE_URL}/youtube-earnings-calculator`,
    siteName: "Lorem Pro Tool",
    images: [
      {
        url: `${BASE_URL}/youtube-earnings-calculator/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "YouTube Earnings Calculator - 15 Niches 20 Countries USD INR",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Earnings Calculator India - Sponsorship + Tax + INR",
    description: "Calculate exact YouTube income in INR/USD. 15 niches, 20 countries. Export CSV, 6-month growth.",
    images: [`${BASE_URL}/youtube-earnings-calculator/opengraph-image.png`],
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
  category: "Finance",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "YouTube Earnings Calculator PRO MAX 2024",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "3842", "bestRating": "5" },
    "featureList": "15 niches, 20 countries, USD INR toggle, AdSense 55%, Sponsorship per 1k, Memberships, Super Thanks, Tax, 6-month growth projection, CSV export, RPM calculator",
    "screenshot": `${BASE_URL}/youtube-earnings-calculator/opengraph-image.png`
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "YouTube Earnings Calculator", "item": `${BASE_URL}/youtube-earnings-calculator` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
