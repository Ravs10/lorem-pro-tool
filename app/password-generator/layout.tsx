import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL("https://lorem-pro-tool.run4ravish.workers.dev"),
  title: "Free Password Generator (2026) - Strong, Random & Secure | Lorem Pro Tool",
  description: "Generate strong, random passwords instantly. Customize length (6-64), symbols, numbers, uppercase & lowercase. No logs, no tracking. Free & secure.",
  keywords: ["password generator", "strong password generator", "secure password generator", "random password generator", "free password generator", "best password generator 2026", "online password generator"],
  authors: [{ name: "Lorem Pro Tool" }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/password-generator",
  },
  openGraph: {
    title: "Free Strong Password Generator - Secure & No Tracking",
    description: "Create strong passwords in 1 click. Custom length, symbols, numbers. Instant copy.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/password-generator",
    siteName: "Lorem Pro Tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Password Generator - Strong & Secure",
    description: "Generate secure random passwords instantly - 100% free, no tracking.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
