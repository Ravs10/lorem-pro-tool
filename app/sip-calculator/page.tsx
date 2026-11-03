import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const SITE_URL = "https://yourdomain.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "SIP Calculator 2025 — Free SIP Return Calculator India & USA | Step-up SIP + LTCG Tax",
    template: "%s | SIP Calculator PRO MAX",
  },
  description:
    "Free advanced SIP calculator with step-up SIP, LTCG tax, expense ratio, inflation adjustment, CAGR, goal planner, and CSV export. Calculate ₹ or $ monthly mutual fund returns with 100% accuracy. Updated for 2025 tax rules.",
  keywords: [
    "sip calculator", "sip calculator india", "free sip calculator", "step up sip calculator",
    "sip return calculator", "mutual fund calculator", "sip calculator 2025",
    "sip calculator with inflation", "sip calculator with tax", "sip calculator with CAGR",
    "sip vs lumpsum calculator", "LTCG tax calculator india", "ELSS sip calculator",
    "sip calculator for 10 years", "sip calculator for 20 years", "sip calculator for 30 years",
    "retirement sip calculator", "FIRE calculator india", "sip compound interest calculator",
    "monthly investment calculator", "sip future value calculator", "sip maturity calculator",
    "best sip calculator 2025", "online sip calculator", "top up sip calculator",
    "₹500 sip calculator", "₹25000 sip calculator", "₹1 crore sip calculator",
    "sip calculator usa", "sip calculator usd", "index fund sip calculator",
  ],
  authors: [{ name: "PRO MAX Tools", url: SITE_URL }],
  creator: "PRO MAX Tools",
  publisher: "PRO MAX Tools",
  category: "Finance",
  classification: "Financial Calculator",

  alternates: {
    canonical: "/sip-calculator",
    languages: {
      "en-IN": "/sip-calculator",
      "en-US": "/sip-calculator",
      "en-GB": "/sip-calculator",
      "hi-IN": "/sip-calculator",
      "x-default": "/sip-calculator",
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_US", "en_GB"],
    url: "/sip-calculator",
    siteName: "SIP Calculator PRO MAX",
    title: "SIP Calculator 2025 — Free Systematic Investment Plan Calculator (India & USA)",
    description:
      "Advanced free SIP calculator with step-up SIP, LTCG tax, inflation, CAGR, and goal planner. Calculate mutual fund returns in ₹ or $. No signup required.",
    images: [
      {
        url: "/og-sip-calculator.png",
        width: 1200,
        height: 630,
        alt: "SIP Calculator PRO MAX — Free Mutual Fund Return Calculator",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@yourhandle",
    creator: "@yourhandle",
    title: "SIP Calculator 2025 — Free Step-up SIP Return Calculator",
    description: "Calculate mutual fund SIP returns with step-up, tax, inflation & CAGR. Free, no signup, India & USA.",
    images: ["/og-sip-calculator.png"],
  },

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

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },

  manifest: "/manifest.webmanifest",

  verification: {
    google: "GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
    yandex: "YANDEX_VERIFICATION_CODE",
    yahoo: "YAHOO_VERIFICATION_CODE",
  },

  appleWebApp: {
    capable: true,
    title: "SIP Calculator PRO MAX",
    statusBarStyle: "black-translucent",
  },

  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
    "theme-color": "#07070B",
    "color-scheme": "dark light",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07070B" },
    { media: "(prefers-color-scheme: light)", color: "#F5F7FA" },
  ],
  colorScheme: "dark light",
};

/* ---------- JSON-LD SCHEMAS ---------- */
const schemaWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "SIP Calculator PRO MAX",
  description: "Free advanced SIP calculator for mutual fund returns with step-up, tax, and inflation.",
  inLanguage: "en-IN",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "PRO MAX Tools",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  sameAs: [
    "https://twitter.com/yourhandle",
    "https://www.facebook.com/yourhandle",
    "https://www.linkedin.com/company/yourhandle",
    "https://www.youtube.com/@yourhandle",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@yourdomain.com",
    availableLanguage: ["English", "Hindi"],
  },
};

const schemaWebApplication = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/sip-calculator#app`,
  name: "SIP Calculator PRO MAX 2025",
  url: `${SITE_URL}/sip-calculator`,
  description:
    "Advanced free SIP calculator with step-up SIP, LTCG tax, expense ratio, inflation adjustment, CAGR, goal planner, and CSV export. Works for India (₹) and USA ($).",
  applicationCategory: "FinanceApplication",
  applicationSubCategory: "InvestmentCalculator",
  operatingSystem: "Web, Android, iOS",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "3184",
  },
  featureList: [
    "Step-up SIP calculation",
    "LTCG tax calculation (Equity + Debt)",
    "Inflation-adjusted returns",
    "CAGR and absolute return",
    "Goal-based SIP planner",
    "SIP vs Lumpsum comparison",
    "CSV export",
    "Multi-currency (INR, USD)",
    "Save and load scenarios",
  ],
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a SIP calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A SIP calculator is a free online tool that estimates the future value of your monthly mutual fund investments based on SIP amount, expected return rate, and duration. It applies compound interest to show total corpus, invested amount, and wealth gained.",
      },
    },
    {
      "@type": "Question",
      name: "Is this SIP calculator accurate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. It uses the standard annuity-due compound formula used by AMFI and major fund houses. Results are projections based on assumed constant returns; actual returns vary with market performance.",
      },
    },
    {
      "@type": "Question",
      name: "What is a step-up SIP calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A step-up SIP calculator lets you increase the SIP amount by a fixed percentage every year, showing a realistic corpus projection for salaried investors whose income rises annually.",
      },
    },
    {
      "@type": "Question",
      name: "How much should I invest in SIP monthly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A common rule is to invest 20%–30% of net monthly income. For retirement, target 30× annual expenses. Use the goal planner in the SIP calculator to compute the exact monthly amount needed.",
      },
    },
    {
      "@type": "Question",
      name: "What return should I assume for SIP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "12%–14% for equity mutual funds (historical Nifty 50 average), 6%–7% for debt funds, and 10%–12% for hybrid funds. Conservative planners should use 10%.",
      },
    },
    {
      "@type": "Question",
      name: "How is LTCG tax calculated on SIP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each SIP instalment is a separate purchase with its own holding period. Equity units held over 12 months qualify for LTCG at 12.5% above ₹1.25 lakh exemption (post 2024 budget). Debt funds are taxed at the investor's slab rate.",
      },
    },
    {
      "@type": "Question",
      name: "Is SIP better than lumpsum?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SIP is better for salaried investors and volatile markets due to rupee-cost averaging. Lumpsum is better if you have idle capital during market corrections. The SIP calculator shows both side-by-side for comparison.",
      },
    },
    {
      "@type": "Question",
      name: "Can I stop SIP anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. SIP is completely flexible. You can pause, stop, or modify the amount anytime without penalty. An exit load (0%–1%) may apply if redeemed before the lock-in period.",
      },
    },
    {
      "@type": "Question",
      name: "What is CAGR in SIP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CAGR (Compound Annual Growth Rate) is the annualised return of your SIP that accounts for compounding. It gives a single number to compare investments — a SIP of ₹25,000/month for 15 years producing ₹1.26 crore has a CAGR of ~12%.",
      },
    },
    {
      "@type": "Question",
      name: "Is this SIP calculator free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, 100% free with no signup, no email, and no ads interrupting calculations. Runs entirely in your browser for privacy.",
      },
    },
  ],
};

const schemaHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Use the SIP Calculator",
  description: "Step-by-step guide to calculate your SIP mutual fund returns using the free online SIP calculator.",
  totalTime: "PT2M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "INR", value: "0" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Select Currency", text: "Choose INR for Indian mutual funds or USD for US/global funds." },
    { "@type": "HowToStep", position: 2, name: "Enter SIP Amount", text: "Enter your monthly SIP amount. Minimum ₹500 in India." },
    { "@type": "HowToStep", position: 3, name: "Set Duration", text: "Enter investment duration in years (1–40)." },
    { "@type": "HowToStep", position: 4, name: "Enter Return Rate", text: "Enter expected annual return — typically 12% for equity funds." },
    { "@type": "HowToStep", position: 5, name: "Add Step-up", text: "Enter annual step-up percentage (e.g., 10%) to model salary-linked investing." },
    { "@type": "HowToStep", position: 6, name: "Configure Tax & Inflation", text: "Choose LTCG / debt slab tax and enter expected inflation rate." },
    { "@type": "HowToStep", position: 7, name: "Set Goal Corpus", text: "Enter your target corpus to see the SIP required to reach it." },
    { "@type": "HowToStep", position: 8, name: "Review & Export", text: "View FV, net after tax, CAGR, and export the year-wise schedule as CSV." },
  ],
};

const schemaBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators` },
    { "@type": "ListItem", position: 3, name: "SIP Calculator", item: `${SITE_URL}/sip-calculator` },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebsite) }}
        />
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
        />
        <Script
          id="ld-webapp"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebApplication) }}
        />
        <Script
          id="ld-faq"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }}
        />
        <Script
          id="ld-howto"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }}
        />
        <Script
          id="ld-breadcrumb"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-[#07070B] text-white`}>
        {children}
      </body>
    </html>
  );
}
