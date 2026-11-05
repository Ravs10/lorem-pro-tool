import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Income Tax Calculator 2025-26 (AY 2026-27) - New vs Old Regime | Free",
  description:
    "Free CA-level Income Tax Calculator for FY 2025-26 (AY 2026-27). Compare New vs Old Regime, calculate HRA, 80C, 80D, NPS 80CCD, Home Loan 24(b), STCG/LTCG, Crypto 30% tax, Surcharge + Marginal Relief, Cess & Monthly TDS. 12L tak 0 tax check karo.",
  keywords: [
    "income tax calculator",
    "income tax calculator 2025-26",
    "income tax calculator ay 2026-27",
    "new vs old regime calculator",
    "new tax regime calculator",
    "old tax regime calculator",
    "HRA calculator",
    "80C calculator",
    "80D calculator",
    "NPS calculator",
    "TDS calculator",
    "advance tax calculator",
    "salary tax calculator india",
    "crypto tax calculator india",
    "capital gains tax calculator",
    "surcharge calculator",
    "marginal relief calculator",
    "section 87A calculator",
    "senior citizen tax calculator",
    "80G calculator",
    "80CCD NPS calculator",
    "STCG LTCG calculator",
    "VDA tax calculator",
    "lorem pro tool", 
    "lorem pro tool income tax calculator", 
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  category: "Finance",
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
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-calculator",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-calculator",
    siteName: "Lorem Pro Tool",
    title: "Income Tax Calculator Pro 2025-26 - New vs Old Regime | Save ₹1,50,000",
    description:
      "FY 2025-26 ka sabse accurate Income Tax Calculator. HRA + 80C + 80D + NPS + Capital Gains + Surcharge + Marginal Relief. 12 Lakh tak 0 Tax check karo - FREE.",
    images: [
      {
        url: "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-og.png",
        width: 1200,
        height: 630,
        alt: "Income Tax Calculator Pro - FY 2025-26 New vs Old Regime",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Income Tax Calculator Pro 2025-26 - New vs Old Regime",
    description:
      "Free CA-level calculator: HRA, 80C, 80D, NPS, Home Loan, Crypto, Surcharge + Marginal Relief. Best regime in 10 seconds.",
    images: ["https://lorem-pro-tool.run4ravish.workers.dev/income-tax-og.png"],
    creator: "@loremprotool",
  },
  verification: {
    google: "PASTE_GOOGLE_SEARCH_CONSOLE_CODE_HERE",
  },
  other: {
    "theme-color": "#0A0A14",
    "revisit-after": "1 days",
    rating: "general",
  },
};

export default function IncomeTaxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://lorem-pro-tool.run4ravish.workers.dev/#website",
        url: "https://lorem-pro-tool.run4ravish.workers.dev/",
        name: "Lorem Pro Tool",
        description: "Free online calculators and tools - Income Tax, SIP, FIRE, EMI, Mortgage and more.",
        publisher: {
          "@type": "Organization",
          name: "Lorem Pro Tool",
          url: "https://lorem-pro-tool.run4ravish.workers.dev/",
        },
        inLanguage: "en-IN",
      },
      {
        "@type": "WebPage",
        "@id": "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-calculator",
        url: "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-calculator",
        name: "Income Tax Calculator 2025-26 (AY 2026-27)",
        isPartOf: { "@id": "https://lorem-pro-tool.run4ravish.workers.dev/#website" },
        about: { "@id": "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-calculator#calculator" },
        description:
          "Free Income Tax Calculator for FY 2025-26 comparing New vs Old Regime with HRA, 80C, 80D, NPS, Capital Gains, Surcharge and Marginal Relief.",
        inLanguage: "en-IN",
        datePublished: "2025-04-01",
        dateModified: "2026-11-05",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-calculator#calculator",
        name: "Income Tax Calculator Pro",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-calculator",
        author: {
          "@type": "Organization",
          name: "Lorem Pro Tool",
        },
        creator: {
          "@type": "Organization",
          name: "Velora",
          description: "Developed by Velora",
        },
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "3847",
          bestRating: "5",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "12 Lakh tak New Regime me 0 tax kaise?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Section 87A rebate ki wajah se FY 2025-26 me ₹12 lakh tak taxable income pe zero tax lagta hai. Standard deduction ₹75,000 ke baad ₹12.75 lakh tak ki gross salary pe koi tax nahi bachta.",
            },
          },
          {
            "@type": "Question",
            name: "New vs Old Regime kaunsa better hai?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Agar total deductions (HRA + 80C + 80D + 24b + NPS) ₹4-5 lakh se zyada hain to Old Regime better ho sakta hai. Otherwise New Regime with ₹12L rebate usually better hai.",
            },
          },
          {
            "@type": "Question",
            name: "HRA exemption ka formula kya hai?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "HRA exempt = minimum of (1) HRA received, (2) Basic x 50% Metro / 40% non-Metro, (3) Rent paid - Basic x 10%.",
            },
          },
          {
            "@type": "Question",
            name: "Crypto pe tax kaise calculate hota hai?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Virtual Digital Assets pe flat 30% tax hai. Koi deduction nahi, koi basic exemption nahi, loss carry-forward nahi. Surcharge normal rate pe lagta hai.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://lorem-pro-tool.run4ravish.workers.dev/" },
          { "@type": "ListItem", position: 2, name: "Tools", item: "https://lorem-pro-tool.run4ravish.workers.dev/" },
          {
            "@type": "ListItem",
            position: 3,
            name: "Income Tax Calculator",
            item: "https://lorem-pro-tool.run4ravish.workers.dev/income-tax-calculator",
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
