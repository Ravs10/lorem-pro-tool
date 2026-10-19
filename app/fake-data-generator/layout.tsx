import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fake Data Generator - Free Fake Name, Email, Mobile, Address in 30 Languages | Lorem Pro',
  description: 'Free Fake Data Generator by Lorem Pro. Generate 1-1000 fake name, email, mobile, address, city, PAN, Aadhaar in Hindi, Bhojpuri, Tamil, Telugu, English, Chinese, Japanese & 30 languages. For developers, testers, students. 100% Free, No Login.',
  keywords: ['fake data generator','fake name generator','fake email generator','fake mobile number generator','dummy data generator','test data generator','mock data generator','fake address generator','bhojpuri fake data','hindi fake data','lorem pro', 'lorem pro tool', 'Lorem Ipsum Generator'],
  authors: [{ name: 'Lorem Pro' }],
  alternates: { canonical: 'https://lorempro.in/fake-data-generator' },
  openGraph: {
    title: 'Fake Data Generator - 30 Languages Free Tool | Lorem Pro',
    description: 'Generate 1 to 1000 fake records in Hindi, Bhojpuri, English, Chinese, Japanese. JSON, CSV, SQL export. 100% Free, No Login.',
    url: 'https://lorem-pro-tool.run4ravish.workers.dev/fake-data-generator',
    siteName: 'Lorem Pro',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: 'Fake Data Generator - 30 Languages Free', description: 'Generate fake name, email, mobile, address in 30 languages. Free tool by Lorem Pro.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is this fake data real? Can I use it for official work?", "acceptedAnswer": { "@type": "Answer", "text": "No, all data is 100% fake and randomly generated for testing only. Do not use for KYC, bank, or government work." } },
      { "@type": "Question", "name": "How many languages are supported?", "acceptedAnswer": { "@type": "Answer", "text": "Total 30 languages - Hindi, Bhojpuri, Tamil, Telugu, Marathi, Bengali, English, Japanese, Chinese, Spanish, French, German, Russian, Arabic, Korean and more." } },
      { "@type": "Question", "name": "Why is Email always in English even when I select Hindi or Chinese?", "acceptedAnswer": { "@type": "Answer", "text": "Because email addresses with Hindi or Chinese script are invalid worldwide. Email system only accepts English letters (RFC standard)." } },
      { "@type": "Question", "name": "Is this tool free? How many records can I generate?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% free with no login. Generate 1 to 1000 records in one click and export in JSON, CSV, TXT, SQL formats." } },
      { "@type": "Question", "name": "Can I use this for my college project or startup demo?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, perfect for college projects, startup MVPs, UI design mockups, and client demos. GDPR safe." } },
      { "@type": "Question", "name": "Will my generated data be saved? Is it private?", "acceptedAnswer": { "@type": "Answer", "text": "Data is generated in your browser only. We do not store your data on server." } },
      { "@type": "Question", "name": "Can I generate Bhojpuri fake data for Bihar UP apps?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, select Bhojpuri language. You will get names like खेसारी लाल, पवन सिंह and cities like पटना, आरा, बलिया, छपरा." } }
    ]
  }
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Fake Data Generator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "url": "https://lorempro.in/fake-data-generator",
    "author": { "@type": "Organization", "name": "Lorem Pro", "url": "https://lorempro.in" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1240" }
  }
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://lorempro.in" },
      { "@type": "ListItem", "position": 2, "name": "Fake Data Generator", "item": "https://lorempro.in/fake-data-generator" }
    ]
  }
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Use Fake Data Generator",
    "step": [
      { "@type": "HowToStep", "text": "Select Language like Bhojpuri, Hindi, Tamil, Chinese." },
      { "@type": "HowToStep", "text": "Select Fields like Name, Email, Mobile, Address, City." },
      { "@type": "HowToStep", "text": "Select Count from 1 to 1000 and click Generate." },
      { "@type": "HowToStep", "text": "Copy or Download in JSON, CSV, TXT, SQL format." }
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />
      {children}
    </>
  )
}
