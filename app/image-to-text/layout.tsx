import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Image to Text OCR Tool - 99% Accurate | Hindi + English",
  description: "Free online Image to Text converter. Extract text from images, photos, scanned documents with 99% accuracy. Supports Hindi, English & 100+ languages. 100% private, no upload to server.",
  keywords: ["image to text", "ocr online", "image to text converter", "jpg to text", "png to text", "photo to text", "hindi ocr", "free ocr tool", "placeholder qr generator"],
  authors: [{ name: "Lorem Pro Tool" }],
  openGraph: {
    title: "Free Image to Text OCR Tool - Hindi + English Support",
    description: "Convert any image to editable text in seconds. 100% free, private and super fast OCR.",
    type: "website",
    url: "https://lorem-pro-tool.vercel.app/image-to-text",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image to Text OCR Tool",
    description: "Extract text from any image with AI OCR",
  },
  alternates: {
    canonical: "https://lorem-pro-tool.vercel.app/image-to-text",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
