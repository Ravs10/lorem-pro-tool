import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2 in 1 Placeholder QR Generator (2026) | Placeholder Image + QR Code Maker | Lorem Pro Tool",
  description: "Free 2-in-1 Ultra Pro Tool: Create custom placeholder images (via.placeholder.com alternative) + Generate QR codes for UPI, WiFi, WhatsApp, URL, Email. Bulk ZIP download, no watermark.",
  keywords: [
    "placeholder image generator",
    "placeholder qr generator",
    "2 in 1 ultra pro tool",
    "via.placeholder.com alternative",
    "custom placeholder generator",
    "image placeholder with text",
    "dummy image generator",
    "800x600 placeholder",
    "qr code generator",
    "qr generator with text",
    "upi qr code generator",
    "wifi qr code generator",
    "whatsapp qr code generator",
    "url qr code generator",
    "upi payment qr code",
    "bulk placeholder generator"
  ],
  openGraph: {
    title: "2 in 1 Placeholder QR Generator - Free | Lorem Pro Tool",
    description: "Generate custom placeholder images + QR codes for UPI, WiFi, WhatsApp in one tool. Free bulk ZIP download.",
    url: "https://lorem-pro-tool.vercel.app/placeholder-qr-generator",
    type: "website",
  },
  alternates: {
    canonical: "https://lorem-pro-tool.vercel.app/placeholder-qr-generator"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "2 in 1 Placeholder QR Generator",
        "applicationCategory": "DesignApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Free 2-in-1 tool to create placeholder images and QR codes for UPI, WiFi, WhatsApp, URL"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What is Placeholder QR Generator?", "acceptedAnswer": { "@type": "Answer", "text": "It is a 2-in-1 free tool - first part creates custom placeholder images like via.placeholder.com with custom size, text, color, gradient. Second part generates QR codes for URL, UPI, WiFi, WhatsApp, Email, Phone." }},
          { "@type": "Question", "name": "Is via.placeholder.com API needed?", "acceptedAnswer": { "@type": "Answer", "text": "No, this is your own alternative. It uses your own /api/[size] route, so no external dependency and faster bulk generation." }},
          { "@type": "Question", "name": "How to download bulk placeholders?", "acceptedAnswer": { "@type": "Answer", "text": "Enter sizes like 300x250, 728x90, 1200x630 in bulk box and click Bulk ZIP Download. It will fetch from your own API and create a ZIP." }}
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
