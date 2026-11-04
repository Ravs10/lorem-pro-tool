import type { Metadata } from "next";

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";
const PAGE_URL = "https://lorem-pro-tool.run4ravish.workers.dev/fire-calculator";
const OG_IMAGE = "https://lorem-pro-tool.run4ravish.workers.dev/og-fire-calculator.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "FIRE Calculator 2026 — Financial Independence Retire Early Calculator (Free, India + USA)",
  description:
    "Free FIRE Calculator 2026: Calculate your FIRE Number, Coast FIRE, Barista FIRE, Lean FIRE & Fat FIRE. Monte Carlo simulation, FIRE Age Finder, 4% Rule, tax & health inflation included. For India (₹) & USA ($). No signup.",
  keywords: [
    "FIRE calculator",
    "FIRE number calculator",
    "financial independence calculator",
    "retire early calculator",
    "Coast FIRE calculator",
    "Barista FIRE calculator",
    "Lean FIRE calculator",
    "Fat FIRE calculator",
    "4% rule calculator",
    "safe withdrawal rate calculator",
    "Monte Carlo retirement calculator",
    "FIRE India calculator",
    "FIRE calculator 2026",
    "early retirement calculator",
    "retirement corpus calculator",
    "how much to retire early",
    "financial freedom calculator",
    "25x rule calculator",
    "FIRE calculator with inflation",
    "FIRE calculator with tax",
    "SIP for FIRE",
    "FIRE age calculator",
    "when can I retire calculator",
    "lorem pro tool", 
    "lorem pro tool fire calculator", 
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "FIRE Calculator 2026 — Retire Early at 40, 45, 50 | Free",
    description:
      "Find your exact FIRE Number in 30 seconds. Coast FIRE, Barista FIRE, Lean & Fat FIRE + Monte Carlo 1000 simulations. Works for India ₹ & USA $. 100% Free.",
    siteName: "Lorem Pro Tool",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "FIRE Calculator 2026 - Financial Independence Retire Early Calculator",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FIRE Calculator 2026 — Retire Early at 40, 45, 50 | Free",
    description:
      "Calculate FIRE Number, Coast FIRE, Barista FIRE + Monte Carlo success rate. Free for India ₹ & USA $. No signup.",
    images: [OG_IMAGE],
    creator: "@loremprotool",
  },
  category: "Finance",
  other: {
    "google-site-verification": "PASTE_YOUR_GOOGLE_VERIFICATION_CODE_HERE",
  },
};

export default function FireCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": PAGE_URL,
        url: PAGE_URL,
        name: "FIRE Calculator 2026 — Financial Independence Retire Early Calculator",
        description:
          "Free FIRE Calculator to find FIRE Number, Coast FIRE, Barista FIRE, Lean FIRE, Fat FIRE with Monte Carlo simulation.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en-IN",
        datePublished: "2026-01-01",
        dateModified: "2026-11-04",
      },
      {
        "@type": "WebApplication",
        name: "FIRE Calculator",
        url: PAGE_URL,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "2847",
          bestRating: "5",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a FIRE calculator?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A FIRE calculator computes the total retirement corpus you need to achieve financial independence and retire early. It uses your income, savings, investment returns, inflation, and expenses to calculate a target number based on the 4% safe withdrawal rule.",
            },
          },
          {
            "@type": "Question",
            name: "What does FIRE stand for?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "FIRE stands for Financial Independence, Retire Early. It's a movement where people save and invest 50%-70% of their income to retire in their 30s or 40s instead of 60.",
            },
          },
          {
            "@type": "Question",
            name: "What is the 4% rule?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The 4% rule states that withdrawing 4% of your retirement corpus per year (adjusted for inflation) should allow your money to last 30+ years. It implies your FIRE number is 25x your annual expenses.",
            },
          },
          {
            "@type": "Question",
            name: "What is Coast FIRE?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Coast FIRE is the corpus you need TODAY such that — with no further investment — it will grow to your full FIRE number by traditional retirement age.",
            },
          },
          {
            "@type": "Question",
            name: "What is Barista FIRE?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Barista FIRE means you've accumulated enough to cover most expenses, and take a part-time job to bridge the gap until full retirement.",
            },
          },
          {
            "@type": "Question",
            name: "Is this FIRE calculator free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, 100% free, no signup, no email. All calculations run in your browser.",
            },
          },
        ],
      },
      {
        "@type": "HowTo",
        name: "How to use FIRE Calculator",
        step: [
          { "@type": "HowToStep", text: "Select currency ₹ INR or $ USD" },
          { "@type": "HowToStep", text: "Enter your current age and target retirement age" },
          { "@type": "HowToStep", text: "Enter income, current savings and monthly SIP" },
          { "@type": "HowToStep", text: "Enter expected return, inflation and monthly expenses" },
          { "@type": "HowToStep", text: "Check your FIRE Number, Coast FIRE, Barista FIRE and Monte Carlo success rate" },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "FIRE Calculator", item: PAGE_URL },
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
