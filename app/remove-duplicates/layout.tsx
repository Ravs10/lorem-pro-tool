import type { Metadata } from "next"

const SITE_URL = "https://yourdomain.com" // <-- apna domain daalo
const PAGE_URL = `${SITE_URL}/remove-duplicates`
const OG_IMAGE = `${SITE_URL}/og/remove-duplicates.png`

export const metadata: Metadata = {
  title: "Remove Duplicates Online Free - Remove Duplicate Lines in Seconds",
  description:
    "Remove duplicates online free in seconds. Delete duplicate lines, words, CSV & paragraphs. Fuzzy match, normalize spaces, highlight & diff. No signup, 100% private.",
  keywords: [
    "remove duplicates",
    "remove duplicate lines",
    "remove duplicates online",
    "remove duplicate lines online",
    "duplicate line remover",
    "delete duplicate lines",
    "remove repeated lines",
    "deduplicate text",
    "remove duplicate words",
    "remove duplicate entries",
    "unique lines online",
    "lorem pro tool",
    "Lorem Ipsum Generator", 
    "lipsum pro"
  ],
  authors: [{ name: "Remove Duplicates Tool" }],
  creator: "Remove Duplicates Tool",
  publisher: "Remove Duplicates Tool",
  category: "Utilities",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: PAGE_URL,
    languages: { "en-US": PAGE_URL, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Remove Duplicates Online Free - Clean Text in Seconds",
    description:
      "Paste text, remove duplicate lines instantly. Fuzzy match, normalize spaces, keep first/last, sort A-Z. Free, no signup.",
    siteName: "Remove Duplicates Tool",
    locale: "en_US",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Remove Duplicates Online Free Tool", type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Duplicates Online Free",
    description: "Remove duplicate lines, words & CSV entries in seconds. Free & private.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
}

export default function RemoveDuplicatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
