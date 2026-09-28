import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: "Free Image Placeholder + QR Code Generator (2026) | Lorem Pro Tool",
  description: "Generate custom placeholder images with text & instant QR codes. Set size, colors, custom lorem text. Download PNG + QR in 1 click. Free, no watermark.",
  keywords: ["placeholder image generator", "qr code generator", "image placeholder with text", "custom placeholder generator", "qr generator with text", "free placeholder image"],
  alternates: { canonical: "https://lorem-pro-tool.vercel.app/image-qr-generator" },
  openGraph: {
    title: "Custom Placeholder Image + QR Generator - Free",
    description: "Create placeholder images with custom text and QR codes instantly.",
    type: "website",
  }
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
