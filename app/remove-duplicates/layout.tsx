import type { Metadata } from "next"

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev"
const PAGE_URL = `${SITE_URL}/remove-duplicates`
const OG_IMAGE = `${SITE_URL}/og/remove-duplicates.png`

export const metadata: Metadata = {
  title: "Remove Duplicates Online Free - Remove Duplicate Lines, Words & CSV",
  description:
    "Remove duplicates online free. Delete duplicate lines, words, CSV & paragraphs instantly with fuzzy match, normalize spaces, highlight & diff view. 100% free & private.",
  keywords: [
    "remove duplicates",
    "remove duplicate lines",
    "remove duplicate lines online",
    "remove duplicates online free",
    "duplicate line remover",
    "delete duplicate lines",
    "remove duplicate words",
    "remove duplicate words online",
    "deduplicate text online",
    "find and remove duplicates",
    "remove duplicate entries",
    "remove duplicate csv entries",
    "online duplicate remover",
    "unique line filter",
    "lorem pro tool", 
    "lorem pro tool remove duplicates", 
    "text deduplicator tool"
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Remove Duplicates Online Free - Clean Text in Seconds",
    description:
      "Paste text, remove duplicate lines instantly. Fuzzy match, normalize spaces, keep first/last, sort A-Z. Free, no signup.",
    siteName: "Lorem Pro Tool",
    locale: "en_US",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Remove Duplicates Online Free Tool" }],
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
