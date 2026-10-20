import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://lorem-pro-tool.run4ravish.workers.dev"),
  title: "Free Image to Text OCR Tool - 99% Accurate | Hindi + English",
  description: "Free online Image to Text converter. Extract text from images, photos, scanned PDFs & camera with 99% accuracy. Supports Hindi, English & 12+ languages. 100% private, on-device OCR, no upload to server.",
  keywords: [
    "image to text",
    "ocr online",
    "image to text converter",
    "jpg to text",
    "png to text",
    "photo to text",
    "hindi ocr",
    "free ocr tool",
    "pdf ocr",
    "camera ocr",
    "lorem pro tool", 
    "Lorem Pro Tool Ocr", 
    "tiff to text"
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  openGraph: {
    title: "Free Image to Text OCR Tool - Hindi + English Support",
    description: "Convert any image, PDF or camera photo to editable text in seconds. 100% free, private and super fast on-device OCR.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/image-to-text",
    siteName: "Lorem Pro Tool",
    type: "website",
    images: [
      {
        url: "/og-ocr.png",
        width: 1200,
        height: 630,
        alt: "Free Image to Text OCR Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image to Text OCR Tool - Hindi + English",
    description: "Extract text from any image, PDF or camera with AI OCR - 100% private, no upload.",
    images: ["/og-ocr.png"],
  },
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/image-to-text",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
