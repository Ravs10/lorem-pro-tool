import type { Metadata } from "next";

const ROOT = "https://lorem-pro-tool.run4ravish.workers.dev";
const URL = `${ROOT}/personal-loan-emi-calculator`;
const SITE_NAME = "Lorem Pro Tool";
const TITLE = "Personal Loan EMI Calculator 2026 - EMI, Prepayment, APR & Balance Transfer";
const DESCRIPTION = "Free Personal Loan EMI Calculator 2026 - EMI, Prepayment Saving, True APR, Eligibility (FOIR), CIBIL Score Rate & 8 Bank Comparison (HDFC, ICICI, SBI, Bajaj). 1 second me EMI check karo, PDF & CSV download karo. No signup, 100% Free.";
const OG_IMAGE = `${SITE_URL}/opengraph-image.png`;
const LOGO = `${ROOT}/logo.png`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(ROOT),
  keywords: [
    "personal loan emi calculator",
    "personal loan calculator",
    "emi calculator for personal loan",
    "personal loan interest calculator",
    "personal loan emi",
    "prepayment calculator",
    "balance transfer calculator",
    "personal loan eligibility calculator",
    "personal loan emi formula",
    "hdfc personal loan emi calculator",
    "icici personal loan emi calculator",
    "sbi personal loan emi calculator",
    "bajaj finserv personal loan emi",
    "apr calculator personal loan",
    "cibil score personal loan rate",
    "personal loan amortization schedule",
    "5 lakh personal loan emi",
    "10 lakh personal loan emi",
  ],
  authors: [{ name: "Lorem Pro Tool", url: ROOT }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  category: "Finance",
  alternates: { canonical: URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: URL,
    siteName: SITE_NAME,
    title: "Personal Loan EMI Calculator 2026 - Free & Instant | Lorem Pro Tool",
    description: "EMI + Prepayment Saving + True APR + Eligibility + Balance Transfer + 8 Bank Comparison. ₹5 Lakh @ 11.5% = ₹10,997 EMI. 1 sec me check karo.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Personal Loan EMI Calculator - EMI, APR, Prepayment & Balance Transfer", type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Loan EMI Calculator 2026 - Free & Instant",
    description: "EMI + Prepayment + APR + Eligibility + Balance Transfer. 1 sec me check karo, PDF download karo.",
    images: [OG_IMAGE],
    creator: "@loremprotool",
  },
  other: {
    "theme-color": "#f59e0b",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "EMI Calculator",
    "application-name": "Lorem Pro Tool",
    rating: "general",
    "revisit-after": "1 days",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${URL}#faq`,
  mainEntity: [
    { "@type": "Question", name: "Personal Loan EMI kaise calculate karte hai?", acceptedAnswer: { "@type": "Answer", text: "EMI = P × r × (1+r)^n / [(1+r)^n - 1] formula se nikalte hai, jaha P loan amount, r monthly interest rate (annual rate / 12 / 100), n tenure in months hai. Example: ₹5 Lakh, 11.5% rate, 60 months pe EMI ₹10,997 banti hai." } },
    { "@type": "Question", name: "Prepayment karne pe koi charge lagta hai?", acceptedAnswer: { "@type": "Answer", text: "RBI rule ke hisab se floating rate personal loan pe koi prepayment charge nahi lagta. Fixed rate pe bank 2% - 4% tak charge le sakta hai." } },
    { "@type": "Question", name: "Personal Loan ke liye CIBIL Score kitna chahiye?", acceptedAnswer: { "@type": "Answer", text: "750+ score pe sabse kam rate milta hai (10.5% - 11.5%). 700-750 pe 12% - 14% rate milega. 650 se neeche loan milna mushkil ho jata hai." } },
    { "@type": "Question", name: "EMI kam karne ka sabse aasan tarika kya hai?", acceptedAnswer: { "@type": "Answer", text: "3 tarike hai: 1) Prepayment karo, 2) Balance Transfer karke rate kam karwao, 3) Tenure mat badhao, tenure badhane se EMI kam lagti hai par total interest double ho jata hai." } },
    { "@type": "Question", name: "Balance Transfer karna fayde ka hai?", acceptedAnswer: { "@type": "Answer", text: "Agar naya rate purane rate se 1% se zyada kam hai aur loan ke 12+ months bache hai, to transfer fayde ka hai." } },
    { "@type": "Question", name: "Personal Loan EMI kitni honi chahiye?", acceptedAnswer: { "@type": "Answer", text: "Tumhari total EMI tumhari salary ke 40% - 50% se zyada nahi honi chahiye. Salary ₹60,000 hai to total EMI ₹24,000 - ₹30,000 se zyada nahi honi chahiye." } },
    { "@type": "Question", name: "APR aur interest rate me kya farak hai?", acceptedAnswer: { "@type": "Answer", text: "Interest rate sirf borrowing cost hai. APR = Interest rate + Processing Fee + Other Charges. 11.5% interest with 2% fee = ~13.5% APR." } },
    { "@type": "Question", name: "Personal loan time se pehle kaise close kare?", acceptedAnswer: { "@type": "Answer", text: "Bank se foreclosure quote maango, outstanding principal + prepayment penalty pay karo, aur NOC lena mat bhoolna." } },
  ],
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${URL}#app`,
  name: "Personal Loan EMI Calculator PRO",
  url: URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser, Android, iOS",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "2841", bestRating: "5", worstRating: "1" },
  author: { "@type": "Organization", name: "Lorem Pro Tool", url: ROOT },
  datePublished: "2025-01-15",
  dateModified: "2026-11-04",
  inLanguage: ["en-IN", "hi-IN"],
  isAccessibleForFree: true,
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": `${URL}#howto`,
  name: "How to Calculate Personal Loan EMI in 1 Minute",
  description: "Personal Loan EMI, Prepayment Saving aur Balance Transfer kaise calculate kare - step by step guide.",
  totalTime: "PT1M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Loan Amount Daalo", text: "Kitna loan chahiye wo daalo. Example: ₹5,00,000.", url: `${URL}#emi` },
    { "@type": "HowToStep", position: 2, name: "Interest Rate Set Karo", text: "Bank ka annual interest rate daalo. HDFC 10.75%, ICICI 11%, SBI 11.25% hai.", url: `${URL}#emi` },
    { "@type": "HowToStep", position: 3, name: "Tenure Choose Karo", text: "Tenure months ya years me choose karo. 12 se 84 months tak.", url: `${URL}#emi` },
    { "@type": "HowToStep", position: 4, name: "EMI, APR aur Schedule Dekho", text: "Monthly EMI, Total Interest, True APR aur poora Amortization Schedule turant dikh jayega.", url: `${URL}#emi` },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: ROOT },
    { "@type": "ListItem", position: 2, name: "Finance Tools", item: ROOT },
    { "@type": "ListItem", position: 3, name: "Personal Loan EMI Calculator", item: URL },
  ],
};

const financialProductSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "@id": `${URL}#product`,
  name: "Personal Loan EMI Calculator",
  description: "Calculate Personal Loan EMI for HDFC, ICICI, SBI, Bajaj Finserv, Axis, Kotak, IDFC First, Yes Bank with Prepayment, APR, Eligibility and Balance Transfer.",
  provider: { "@type": "Organization", name: "Lorem Pro Tool", url: ROOT },
  annualPercentageRate: { "@type": "QuantitativeValue", minValue: 10.5, maxValue: 24, unitText: "PERCENT" },
  loanTerm: { "@type": "QuantitativeValue", minValue: 6, maxValue: 84, unitText: "MONTH" },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${URL}#article`,
  headline: "Personal Loan EMI Calculator 2026 - EMI, Prepayment, APR & Balance Transfer Guide",
  description: DESCRIPTION,
  image: OG_IMAGE,
  author: { "@type": "Organization", name: "Lorem Pro Tool", url: ROOT },
  publisher: { "@type": "Organization", name: "Lorem Pro Tool", url: ROOT, logo: { "@type": "ImageObject", url: LOGO } },
  datePublished: "2025-01-15",
  dateModified: "2026-11-04",
  mainEntityOfPage: URL,
  inLanguage: "en-IN",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {children}
    </>
  );
}
