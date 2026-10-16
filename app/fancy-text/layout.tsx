import type { Metadata, Viewport } from 'next';

const SITE_URL = 'https://lorem-pro-tool.run4ravish.workers.dev';
const PAGE_URL = `${SITE_URL}/fancy-text`;
const SITE_NAME = 'FancyText Generator';
const SITE_TITLE = 'Fancy Text Generator — 500+ Stylish Fonts, Funny Text & Cool Unicode Styles (Free)';
const SITE_DESCRIPTION =
  'Free fancy text generator with 500+ stylish fonts, 28 funny text styles, and cool Unicode characters. Instantly copy & paste fancy letters for Instagram, TikTok, Discord, Twitter/X, WhatsApp bios & posts. No signup, no ads, unlimited use.';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07071a' },
    { media: '(prefers-color-scheme: light)', color: '#f5f5ff' },
  ],
  colorScheme: 'dark light',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'fancy text', 'fancy text generator', 'stylish text', 'cool fonts',
    'unicode text', 'fancy letters', 'text styles', 'copy paste fonts',
    'instagram fonts', 'instagram bio fonts', 'tiktok caption fonts',
    'discord nickname fonts', 'twitter x display names', 'whatsapp status text',
    'facebook post fonts', 'youtube title fonts', 'gaming username fonts',
    'fortnite username fonts', 'roblox username fonts', 'minecraft username fonts',
    'bold text', 'italic text', 'cursive text', 'cursive fonts', 'script fonts',
    'gothic fonts', 'fraktur fonts', 'bubble text', 'circled text', 'squared text',
    'fullwidth text', 'monospace text', 'small caps text', 'upside down text',
    'funny text', 'funny text generator', 'mocking spongebob text',
    'uwu text generator', 'zalgo text', 'glitch text', 'leet speak', '1337 text',
    'pirate text', 'robot text', 'strikethrough text', 'aesthetic fonts',
    'decorative text', 'fancy text with colors', 'colored text generator', 'lorem pro tool', 'Lorem Ipsum Generator', 'lipsum pro', 
    'share fancy text as image', 'fancy text keyboard shortcuts', 'undo redo text editor',
  ],
  authors: [{ name: SITE_NAME, url: PAGE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: 'Utilities',
  classification: 'Text Tools, Font Generators, Unicode',
  referrer: 'origin-when-cross-origin',
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-US': PAGE_URL, 'en-GB': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: PAGE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200, height: 630,
        alt: 'Fancy Text Generator — 500+ Stylish Fonts & Funny Text',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true, follow: true,
    googleBot: {
      index: true, follow: true, noimageindex: false,
      'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: SITE_NAME },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_CODE',
  },
};

const FAQS = [
  { q: 'What is a fancy text generator?', a: 'A fancy text generator is an online tool that converts ordinary letters into alternative Unicode characters and symbols. Because these alternative letters exist as real characters in the Unicode standard, the resulting text can be copied and pasted anywhere - Instagram bios, Twitter/X posts, Facebook comments, Discord messages, TikTok captions, WhatsApp chats, or YouTube titles - without installing anything.' },
  { q: 'How does this fancy text tool work?', a: 'Type or paste your text into the input box at the top of the page. The tool instantly converts your text into 500+ styles using mathematical alphanumeric symbols, decorative Unicode blocks, combining diacritical marks, and artistic wrappers. Click any style card to copy it to your clipboard - or use the Share button to send it directly.' },
  { q: 'Is this fancy text generator free?', a: 'Yes, 100% free. There is no signup, no login, no ads, and no character limit. You can generate unlimited fancy text styles every day at no cost.' },
  { q: 'Will fancy text work on Instagram, Twitter/X, Facebook, and TikTok?', a: 'Yes. All of the Unicode characters used here are supported on Instagram, Twitter/X, Facebook, TikTok, Discord, WhatsApp, Telegram, Snapchat, Reddit, Pinterest, YouTube, LinkedIn, and most modern websites.' },
  { q: 'What is the Funny Text dropdown feature?', a: 'The Funny Text dropdown is a special collection of 28 comedic text transformations - including Mocking SpongeBob case, UwU speak, Pirate talk, Leet (1337) speak, Zalgo glitch text, Robot mode, Dog and Cat speak, Yoda speak, Zombie, Vampire, Wizard spell, and more.' },
  { q: 'Can I save my favorite fancy text styles?', a: 'Yes. Click the star icon on any style card to save it to your Favorites. Favorites are stored locally in your browser so they persist between visits - no account required. You can also view recently-copied styles via the Recent tab.' },
  { q: 'Can I use the generated text for commercial purposes?', a: 'Yes. You own the text you generate. You can use it in social media posts, bios, product names, usernames, T-shirts, artwork, or anywhere else.' },
  { q: 'Is there a character limit?', a: 'No! There is no character limit. You can type as much text as you want, in any language - English, Hindi, Arabic, Chinese, Japanese, Korean, Russian, and more.' },
  { q: 'What is the Share as PNG image toggle?', a: 'When ON, the Share button renders your text with your chosen color and background as a large, crisp PNG image - perfect for WhatsApp Stories, Instagram Stories, or anywhere colored text is needed. When OFF, the Share button sends just the fancy text as plain text.' },
  { q: 'Can I copy text with colors and background?', a: 'Yes. When you select a text color or background, the Copy button automatically places the styled text on your clipboard using HTML formatting. This means apps like Gmail, Google Docs, Word, Outlook, Telegram, and Notion keep your exact colors and gradients.' },
  { q: 'Can I undo my changes?', a: 'Yes! The editor has full Undo and Redo support - up to 100 steps. Press Ctrl/Cmd + Z to undo, Ctrl/Cmd + Shift + Z (or Ctrl + Y) to redo.' },
  { q: 'What keyboard shortcuts are available?', a: 'Ctrl/Cmd + Z = Undo, Ctrl/Cmd + Shift + Z = Redo, Ctrl/Cmd + S = Download as .txt, Ctrl/Cmd + K = Focus search, Ctrl/Cmd + / = Toggle toolbar, Ctrl/Cmd + Shift + P = Toggle Share as PNG, Ctrl/Cmd + Shift + D = Toggle theme, ? = Shortcuts dialog, Esc = Close panels.' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      isPartOf: { '@id': `${SITE_URL}#website` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Fancy Text Generator', item: PAGE_URL },
      ],
    },
    {
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: PAGE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '1284', bestRating: '5', worstRating: '1' },
      featureList: [
        '500+ fancy text styles', 'Funny text generator (28 modes)',
        'Bold, italic, cursive, gothic, bubble fonts',
        'Custom text colors and gradient backgrounds',
        'Share as PNG image with colors', 'Undo and Redo (up to 100 steps)',
        'Full keyboard shortcuts', 'Dark and light theme',
        'Favorites and recent history', 'Copy & paste with colors (HTML/RTF)',
        'Download as .txt', 'Works with Instagram, TikTok, Discord, WhatsApp, Twitter/X',
      ],
      screenshot: `${SITE_URL}/og-image.png`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Use the Fancy Text Generator',
      description: 'Generate, customize, and share 500+ fancy text styles and funny text in a few seconds.',
      totalTime: 'PT1M',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Type your text', text: 'Type or paste your text into the input box. There is no character limit.' },
        { '@type': 'HowToStep', position: 2, name: 'Choose a style', text: 'Browse 500+ fancy text styles by category or search, or pick a Funny Text style from the dropdown.' },
        { '@type': 'HowToStep', position: 3, name: 'Customize color', text: 'Open the Color & Background panel to pick from 16 text colors and 12 background styles.' },
        { '@type': 'HowToStep', position: 4, name: 'Choose share mode', text: 'Toggle Share as PNG image ON to send a colored image, or leave OFF to share plain fancy text.' },
        { '@type': 'HowToStep', position: 5, name: 'Copy or Share', text: 'Click any style card to copy, or use the Share button. Rich colors are preserved on the clipboard.' },
      ],
    },
  ],
};

export default function FancyTextLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
