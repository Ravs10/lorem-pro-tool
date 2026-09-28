import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Placeholder + QR Code Generator (2026) | UPI, WiFi, WhatsApp | Lorem Pro Tool",
  description: "Free 2-in-1 tool: Create custom placeholder images with text, size, colors & generate instant QR codes for URL, UPI Payment, WiFi, WhatsApp, Email, Phone. Download PNG + QR in 1 click. Free, no watermark.",
  keywords: [
    "placeholder image generator",
    "custom placeholder generator", 
    "image placeholder with text",
    "dummy image generator",
    "800x600 placeholder",
    "qr code generator",
    "qr generator with text",
    "free placeholder generator",
    "upi qr code generator",
    "wifi qr code generator",
    "whatsapp qr code generator",
    "url qr code generator",
    "upi payment qr code",
    "qr code maker",
    "lorem pro tool"
  ],
  openGraph: {
    title: "Image Placeholder + QR Generator - Free",
    description: "Generate custom placeholder images with custom text and QR codes instantly. UPI, WiFi, WhatsApp support.",
    url: "https://lorem-pro-tool.vercel.app/image-to-text",
    type: "website",
  },
  alternates: {
    canonical: "https://lorem-pro-tool.vercel.app/image-to-text"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
