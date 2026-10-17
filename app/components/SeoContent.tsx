"use client";
import { useState } from "react";

function Section({ title, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-black hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors duration-300 hover:bg-slate-50"
      >
        <h2 className="text-[16px] font-bold text-slate-900">{title}</h2>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white text-lg transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-slate-700 leading-relaxed text-[14px]">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function SeoContent() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-slate-900">📖 Complete Guide</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="rounded-full bg-black px-4 py-2 text-[12px] font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-slate-800 active:scale-95"
        >
          {showAll ? "Hide All ▲" : "Show All ▼"}
        </button>
      </div>

      {/* Jab Show All ON hoga, tabhi sab khulega - iske liye hum key use kar rahe hain */}
      <div key={String(showAll)}>
        <Section title="What is Lorem Ipsum? The Ultimate Guide to Dummy Text" defaultOpen={true}>
          <p className="mb-3">Lorem Ipsum is placeholder text used by designers, developers, and publishers to fill a layout before the final content is ready. It allows you to focus on visual design, typography, spacing, and user experience without getting distracted by readable content.</p>
          <p>Lorem Pro Tool takes this classic concept to the next level by offering it in 77 native languages, not just Latin. Our free generator helps you generate sentences, paragraphs, words, and lists instantly. No login, no signup, 100% free forever.</p>
        </Section>

        <Section title="History of Lorem Ipsum - Where Did It Come From?">
          <p className="mb-3">Lorem Ipsum comes from a Latin text written by Cicero in 45 BC, called &quot;de Finibus Bonorum et Malorum&quot;. The famous line &quot;Lorem ipsum dolor sit amet...&quot; is a scrambled version of that original text.</p>
          <p>In the 1960s, Letraset popularized it for print design, and in the 1990s, Aldus PageMaker made it standard for digital design. Today, it is the world standard for placeholder text.</p>
        </Section>

        <Section title="Why Use Lorem Pro Tool? 77 Languages, 4 Modes">
          <p className="mb-3">Most generators only give you English or Latin. Lorem Pro Tool gives you native dummy text in Hindi, English, Spanish, Arabic, French, German, Chinese, Japanese, Bengali, Tamil, Telugu, Marathi, Urdu, Portuguese, Russian, Italian, Korean, Turkish, and 59 more languages.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Sentence Mode:</b> For headings, taglines, button text</li>
            <li><b>Paragraph Mode:</b> For blog posts, articles, about pages</li>
            <li><b>Word Mode:</b> For search boxes, labels, menus</li>
            <li><b>List Mode:</b> For bullet points, features, pricing tables</li>
          </ul>
        </Section>

        <Section title="How To Use Lorem Ipsum Generator - Step By Step">
          <ol className="list-decimal pl-5 space-y-2">
            <li><b>Select Language:</b> Choose from 77 languages from dropdown.</li>
            <li><b>Select Mode:</b> Choose Sentence, Paragraph, Word, or List.</li>
            <li><b>Select Count:</b> Use slider to select 1 to 100.</li>
            <li><b>Generate & Copy:</b> Click Generate, then Copy or Download in 8 formats.</li>
          </ol>
        </Section>

        <Section title="Lorem Ipsum in Hindi - हिंदी डमी टेक्स्ट">
          <p>Hindi is one of the most searched languages for dummy text in India. Our Hindi generator gives you natural Hindi sentences that look like real content. Perfect for Indian designers building websites for Hindi audience, government portals, news sites, and local businesses.</p>
        </Section>

        <Section title="Best Practices for Using Dummy Text in Design">
          <ul className="list-disc pl-5 space-y-1">
            <li>Always test with real language. If final site will be in Spanish, test with Spanish dummy text.</li>
            <li>Check for text overflow. German words are longer, Arabic is RTL, Chinese is compact.</li>
            <li>Do not use Lorem Ipsum in production. Replace it before launch.</li>
            <li>Use our <a href="/word-counter" className="text-blue-600 underline">Word Counter</a> to check exact word count.</li>
          </ul>
        </Section>

        <Section title="More Free Tools From Lorem Pro">
          <p>Try our <a href="/case-converter" className="text-blue-600 underline">Case Converter</a>, <a href="/password-generator" className="text-blue-600 underline">Password Generator</a>, <a href="/fancy-text" className="text-blue-600 underline">Fancy Text Generator</a>, <a href="/fake-data-generator" className="text-blue-600 underline">Fake Data Generator</a>, <a href="/placeholder-qr-generator" className="text-blue-600 underline">Placeholder QR Generator</a>, <a href="/image-to-text" className="text-blue-600 underline">Image to Text</a>, <a href="/text-to-handwriting" className="text-blue-600 underline">Text to Handwriting</a>, <a href="/remove-duplicates" className="text-blue-600 underline">Remove Duplicates</a>. All tools are free, no login required.</p>
        </Section>

        <Section title="Frequently Asked Questions (FAQ)">
          <div className="space-y-3">
            <div><h3 className="font-bold text-slate-900">Is Lorem Ipsum Generator free?</h3><p>Yes, 100% free. No login, no signup, no watermark.</p></div>
            <div><b>Can I generate Lorem Ipsum in Hindi?</b><p>Yes. We support Hindi and 76 other languages.</p></div>
            <div><b>How many words can I generate?</b><p>You can generate up to 100 paragraphs, sentences, or lists in one click.</p></div>
            <div><b>Can I download the generated text?</b><p>Yes. You can download in 8 formats including TXT, HTML, PDF, DOC, JSON, CSV, and Markdown.</p></div>
            <div><b>Is Lorem Ipsum good for SEO?</b><p>No, it is for design testing only. Never publish it live.</p></div>
          </div>
        </Section>
      </div>

      <p className="mt-4 text-center text-[12px] text-slate-500">Last Updated: October 2026 | Lorem Pro Tool - Free Tools for Designers, Developers & Creators.</p>
    </section>
  );
}
