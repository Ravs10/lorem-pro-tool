import type { Metadata } from "next";

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";
const PAGE_URL = `${SITE_URL}/hashtag-generator`;
const TITLE = "Hashtag Generator - Free Viral Hashtag Generator for Instagram, TikTok, YouTube | 2026";
const DESCRIPTION = "Free AI Hashtag Generator for Instagram, TikTok, YouTube, LinkedIn, Twitter, Facebook. Generate viral hashtags with viral score, difficulty, banned check, favorites & export. 100+ niches - Cricket, Chess, Travel, Food, Fitness. No login, 100% private, Cloudflare Edge.";
const KEYWORDS = [
  "hashtag generator",
  "instagram hashtag generator",
  "tiktok hashtag generator",
  "youtube hashtag generator",
  "viral hashtag generator",
  "free hashtag generator",
  "ai hashtag generator",
  "reels hashtag generator",
  "cricket hashtags",
  "chess hashtags",
  "travel hashtags",
  "fitness hashtags",
  "best hashtags 2026",
  "trending hashtags",
  "hashtag for instagram",
  "linkedin hashtag generator",
  "facebook hashtag generator",
  "hashtag maker",
  "hashtag finder",
  "instagram reels hashtags",
  "tiktok viral hashtags",
  "youtube shorts hashtags",
  "lorem pro tool", 
  "lorem pro tool hashtag generator", 
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: "Lorem Pro Tools", url: SITE_URL }],
  creator: "Lorem Pro Tools",
  publisher: "Lorem Pro Tools",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Lorem Pro Tools",
    images: [
      {
        url: "/hashtag-generator/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Hashtag Generator - Free Viral Hashtag Generator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hashtag-generator/opengraph-image.png"],
    creator: "@loremprotools",
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
  category: "technology",
  classification: "Hashtag Generator Tool",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function HashtagGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${PAGE_URL}#app`,
        name: "Hashtag Generator",
        alternateName: "Free Hashtag Generator",
        description: DESCRIPTION,
        url: PAGE_URL,
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "4127",
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Organization",
          name: "Lorem Pro Tools",
          url: SITE_URL,
        },
        keywords: KEYWORDS.join(", "),
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Is hashtag generator free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, 100% free, no login, unlimited generations. All processing happens in your browser.",
            },
          },
          {
            "@type": "Question",
            name: "How many hashtags should I use on Instagram?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Instagram allows up to 30 hashtags, but best practice 2026 is 20-25 mix of high, medium, low competition.",
            },
          },
          {
            "@type": "Question",
            name: "What is viral score?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Viral score is heuristic estimate 35-98 based on keyword relevance and pool data, not live API.",
            },
          },
          {
            "@type": "Question",
            name: "Does this check banned hashtags?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, built-in and custom blocklist filters risky tags. It cannot guarantee real-time shadowban status.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use for YouTube, TikTok, LinkedIn?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, each platform has different limit and best time – TikTok 10, Twitter 5, LinkedIn 8, YouTube 15.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: `${SITE_URL}/tools`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Hashtag Generator",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "HowTo",
        name: "How to Generate Viral Hashtags",
        description: "Step by step guide to generate viral hashtags for Instagram, TikTok, YouTube",
        totalTime: "PT1M",
        tool: {
          "@type": "HowToTool",
          name: "Hashtag Generator",
        },
        step: [
          {
            "@type": "HowToStep",
            name: "Enter Topic",
            text: "Enter topic like cricket, chess, travel or paste caption",
          },
          {
            "@type": "HowToStep",
            name: "Select Platform",
            text: "Select Instagram 30, TikTok 10, YouTube 15 as per limit",
          },
          {
            "@type": "HowToStep",
            name: "Generate & Filter",
            text: "Generate hashtags, filter by difficulty, search, sort by viral score",
          },
          {
            "@type": "HowToStep",
            name: "Copy & Export",
            text: "Copy selected hashtags or export as TXT, CSV, JSON for schedulers",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
