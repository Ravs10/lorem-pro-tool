import React from "react";

export const metadata = {
  title: "Avatar Generator - Free Letter & Gradient Avatar Maker",
  description: "Free Avatar Generator - Create stunning letter avatars, gradient avatars and more. UI Avatars alternative.",
  keywords: [
    "avatar generator",
    "letter avatar generator",
    "gradient avatar maker",
    "profile picture maker",
    "discord avatar generator",
    "github avatar generator",
    "ui avatars alternative",
    "initial avatar generator",
    "free avatar maker",
    "avatar creator online",
    "random avatar generator",
    "material avatar generator"
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  openGraph: {
    title: "Avatar Generator - Free Letter & Gradient Avatar Maker",
    description: "Create stunning letter avatars with our free online tool.",
    url: "https://loremprotool.com/avatar",
    siteName: "Lorem Pro Tool",
    type: "website",
    images: [{ url: "https://loremprotool.com/og-avatar.png", width: 1200, height: 630, alt: "Avatar Generator" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Avatar Generator - Free Letter & Gradient Avatar Maker",
    description: "Best free UI Avatars alternative - Create beautiful letter avatars"
  },
  alternates: { canonical: "https://loremprotool.com/avatar" },
  robots: { index: true, follow: true }
};

export default function AvatarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
