import type { Metadata } from "next";

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";
const TOOL_SLUG = "/youtube-thumbnail-downloader"; // agar slug alag hai to yahan change kar dena
const TOOL_TITLE = "YouTube Thumbnail Downloader - Download HD Thumbnails Free";
const TOOL_DESCRIPTION = "Free YouTube Thumbnail Downloader by Lorem Pro Tool. Download HD, SD, HQ, MQ thumbnails from YouTube videos, Shorts & live. Bulk ZIP, 4x enhance, no signup.";

export const metadata: Metadata = {
  title: TOOL_TITLE,
  description: TOOL_DESCRIPTION,
  keywords: [
    "youtube thumbnail downloader",
    "yt thumbnail downloader",
    "download youtube thumbnail hd",
    "youtube shorts thumbnail downloader",
    "bulk thumbnail downloader",
    "lorem pro tool youtube thumbnail",
    "lorem pro tool", 
    "lorem pro tool youtube thumbnail downloadar", 
  ],
  alternates: {
    canonical: `${SITE_URL}${TOOL_SLUG}`,
  },
  openGraph: {
    title: TOOL_TITLE,
    description: TOOL_DESCRIPTION,
    url: `${SITE_URL}${TOOL_SLUG}`,
    siteName: "Lorem Pro Tool",
    type: "website",
    locale: "en_US",
    // opengraph-image.png isi folder me hai to ye auto uth jayega,
    // fir bhi explicit de rahe hain strongest ke liye
    images: [
      {
        url: `${SITE_URL}${TOOL_SLUG}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: TOOL_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_TITLE,
    description: TOOL_DESCRIPTION,
    images: [`${SITE_URL}${TOOL_SLUG}/opengraph-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "YouTube Thumbnail Downloader",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            isPartOf: {
              "@type": "WebSite",
              name: "Lorem Pro Tool",
              url: SITE_URL,
            },
            url: `${SITE_URL}${TOOL_SLUG}`,
            description: TOOL_DESCRIPTION,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </>
  );
}
