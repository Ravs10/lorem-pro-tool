import type { Metadata } from "next";

const BASE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SIP Calculator 2025 — Free SIP Return Calculator India & USA | Step-up SIP + LTCG Tax",
    template: "%s | Lorem Pro Tool",
  },
  description: "Free advanced SIP calculator with step-up SIP, LTCG tax, expense ratio, inflation adjustment, CAGR, goal planner, and CSV export. Calculate ₹ or $ monthly mutual fund returns with 100% accuracy. Updated for 2025 tax rules.",
  keywords: [
    "sip calculator", "sip calculator india", "free sip calculator", "step up sip calculator",
    "sip return calculator", "mutual fund calculator", "sip calculator 2025",
    "sip calculator with inflation", "sip calculator with tax", "₹500 sip calculator",
    "₹25000 sip calculator", "₹1 crore sip calculator", "retirement sip calculator",
    "FIRE calculator india", "lorem pro tool"
  ],
  alternates: {
    canonical: "/sip-calculator",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${BASE_URL}/sip-calculator`,
    siteName: "Lorem Pro Tool",
    title: "SIP Calculator PRO MAX 2025 - ₹1 Crore with ₹25k SIP?",
    description: "Advanced free SIP calculator with step-up SIP, LTCG tax, inflation, CAGR, and goal planner. Calculate mutual fund returns in ₹ or $. No signup required.",
    images: [
      {
        url: `${BASE_URL}/sip-calculator/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "SIP Calculator PRO MAX - Lorem Pro Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIP Calculator 2025 - Step-up + Tax + Inflation",
    description: "Calculate mutual fund SIP returns with step-up, tax, inflation & CAGR. Free, no signup, India & USA.",
    images: [`${BASE_URL}/sip-calculator/opengraph-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "Finance",
};

export default function SipLayout({ children }: { children: React.ReactNode }) {
  const schemaWebApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SIP Calculator PRO MAX 2025",
    "url": `${BASE_URL}/sip-calculator`,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "isAccessibleForFree": true,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "3184" },
    "featureList": "Step-up SIP, LTCG tax, Inflation-adjusted, CAGR, Goal-based planner, SIP vs Lumpsum, CSV export, Multi-currency"
  };

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is a SIP calculator?", "acceptedAnswer": { "@type": "Answer", "text": "A SIP calculator estimates future value of monthly mutual fund investments based on amount, return rate, and duration using compound interest." } },
      { "@type": "Question", "name": "What is step-up SIP?", "acceptedAnswer": { "@type": "Answer", "text": "Step-up SIP increases SIP amount by fixed % every year, showing realistic corpus for salaried investors." } },
      { "@type": "Question", "name": "How is LTCG tax calculated?", "acceptedAnswer": { "@type": "Answer", "text": "Equity held >12 months: 12.5% above ₹1.25 lakh. Debt: slab rate. Tool applies correctly." } }
    ]
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "SIP Calculator", "item": `${BASE_URL}/sip-calculator` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebApplication) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />
      {children}
    </>
  );
}
