import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://lorem-pro-tool.run4ravish.workers.dev"),
  title: "2 in 1 Placeholder QR Generator (2026) | Placeholder Image + QR Code Maker | Lorem Pro Tool",
  description: "Free 2-in-1 Ultra Pro Tool: Create custom placeholder images (via.placeholder.com alternative) + Generate QR codes for UPI, WiFi, WhatsApp, URL, Email. Bulk ZIP download, no watermark.",
  keywords: [
    "placeholder image generator",
    "placeholder qr generator",
    "via.placeholder.com alternative",
    "custom placeholder generator",
    "dummy image generator",
    "qr code generator",
    "upi qr code generator",
    "wifi qr code generator",
    "whatsapp qr code generator",
    "bulk placeholder generator", 
    "lorem pro tool", 
    "Lorem Ipsum Generator" 
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/placeholder-qr-generator",
  },
  openGraph: {
    title: "2 in 1 Placeholder QR Generator - Free | Lorem Pro Tool",
    description: "Generate custom placeholder images + QR codes for UPI, WiFi, WhatsApp in one tool. Free bulk ZIP download.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/placeholder-qr-generator",
    siteName: "Lorem Pro Tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2 in 1 Placeholder QR Generator - Free",
    description: "Placeholder images + QR codes for UPI, WiFi, WhatsApp. No watermark, bulk ZIP download.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "2 in 1 Placeholder QR Generator",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Free 2-in-1 tool to create placeholder images and QR codes for UPI, WiFi, WhatsApp, URL"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Is this tool free and without watermark?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% free, no watermark, no login, no limit. Unlimited images and QR codes for personal and commercial use." }},
          { "@type": "Question", "name": "Difference from via.placeholder.com?", "acceptedAnswer": { "@type": "Answer", "text": "via.placeholder.com is external and can go down. Our tool uses YOUR OWN /api route on your domain, so it's faster, supports gradient, bulk ZIP, and is fully reliable." }},
          { "@type": "Question", "name": "How does Bulk ZIP Download work?", "acceptedAnswer": { "@type": "Answer", "text": "It calls your own API for each size and packs all PNGs into a ZIP using JSZip. Perfect for developers needing 10-15 banner sizes at once." }},
          { "@type": "Question", "name": "Is UPI QR safe?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, we generate standard UPI format (upi://pay?pa=...). Works with Google Pay, PhonePe, Paytm, BHIM. No data stored." }},
          { "@type": "Question", "name": "Can I use this API in my projects?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Your API link is public: /api/{width}x{height}?text=Hello&bg=111827&color=ffffff. Use it in <img> tags like via.placeholder.com." }},
          { "@type": "Question", "name": "Does QR data stay private?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, total privacy. QR is generated client-side, we don't save URL, WiFi password, UPI ID or any data." }}
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
