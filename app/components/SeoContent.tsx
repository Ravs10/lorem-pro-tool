"use client"
import { useState } from "react"

export default function SeoContent() {
  const [showAll, setShowAll] = useState(false)

  return (
    <div style={{ padding: 20, color: "#000", lineHeight: 1.8 }}>

      {/* HEADER + SHOW ALL / HIDE ALL */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
          Complete Guide
        </h2>
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "2px solid #000",
            background: showAll ? "#000" : "#fff",
            color: showAll ? "#fff" : "#000",
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {showAll ? "Hide All ▲" : "Show All ▼"}
        </button>
      </div>

      {/* 1. WHAT IS LOREM IPSUM - Hamesha dikhega */}
      <h3 style={{ marginTop: 20 }}>
        What is Lorem Ipsum?
      </h3>
      <p style={{ fontSize: 14 }}>
        Lorem Ipsum is dummy placeholder text used by designers, developers, and content creators to fill layouts before real content is ready.
      </p>
      <p style={{ fontSize: 14 }}>
        It looks like real text but has no meaning, so readers focus on design instead of words.
      </p>
      <p style={{ fontSize: 14 }}>
        LoremPro is the world&apos;s most advanced Lorem Ipsum Generator.
      </p>
      <p style={{ fontSize: 14 }}>
        It supports 77 languages with native, meaningful sentences - not boring Latin.
      </p>
      <p style={{ fontSize: 14 }}>
        You can generate Sentence, Paragraph, Word, and List modes in one click, copy it, and download it in 8 formats - 100% free, no login.
      </p>

      {/* BAaki SAARA CONTENT - Sirf Show All par dikhega */}
      {showAll && (
        <div>

          <h3 style={{ marginTop: 20 }}>
            History of Lorem Ipsum
          </h3>
          <p style={{ fontSize: 14 }}>
            Lorem Ipsum is more than 500 years old.
          </p>
          <p style={{ fontSize: 14 }}>
            It originated from Cicero&apos;s writings in 45 BC.
          </p>
          <p style={{ fontSize: 14 }}>
            In the 1500s, an unknown printer scrambled it to make a type specimen book.
          </p>
          <p style={{ fontSize: 14 }}>
            Since then, it became the standard dummy text for printing, and later for web design.
          </p>
          <p style={{ fontSize: 14 }}>
            Today in 2026, Lorem Ipsum is still used because it works.
          </p>
          <p style={{ fontSize: 14 }}>
            It helps designers test fonts, layouts, and spacing without waiting for real content.
          </p>

          <h3 style={{ marginTop: 20 }}>
            Why Use Lorem Ipsum Generator?
          </h3>
          <p style={{ fontSize: 14 }}>
            Using a generator saves time and makes your design look professional.
          </p>
          <p style={{ fontSize: 14 }}>
            Instead of typing random words, you get perfect placeholder text instantly.
          </p>
          <ul style={{ fontSize: 14 }}>
            <li>
              <b>77 Languages:</b> Hindi, English, Spanish, French, German, Arabic, Bengali, Tamil, Telugu, Marathi, Urdu, and 66 more.
            </li>
            <li>
              <b>4 Modes:</b> Sentence, Paragraph, Word, List - for every use case.
            </li>
            <li>
              <b>Counter 0-100:</b> Generate up to 100 items at once.
            </li>
            <li>
              <b>Live Counters:</b> Words, Characters, Sentences, Paragraphs, Reading Time.
            </li>
            <li>
              <b>8 Download Types:</b> TXT, HTML, JSON, CSV, MD, JS, RTF, PDF.
            </li>
            <li>
              <b>100% Free:</b> No login, no signup, no watermark.
            </li>
          </ul>

          <h3 style={{ marginTop: 20 }}>
            How To Use - Step By Step
          </h3>
          <ol style={{ fontSize: 14 }}>
            <li>
              <b>Step 1:</b> Select your language from dropdown (Default: Hindi).
            </li>
            <li>
              <b>Step 2:</b> Select Mode - SENTENCE, PARAGRAPH, WORD, or LIST.
            </li>
            <li>
              <b>Step 3:</b> Set Counter 0 to 100 with slider or number box.
            </li>
            <li>
              <b>Step 4:</b> Click GENERATE - text generates automatically.
            </li>
            <li>
              <b>Step 5:</b> Click Copy Text or Download in 8 formats.
            </li>
          </ol>

          <h3 style={{ marginTop: 20 }}>
            Lorem Ipsum in Hindi - हिन्दी में
          </h3>
          <p style={{ fontSize: 14 }}>
            Hindi me Lorem Ipsum generate karna ab bahut aasaan hai.
          </p>
          <p style={{ fontSize: 14 }}>
            LoremPro Hindi me native, meaningful sentences deta hai - jaise &quot;Swasth jeevan ke liye yoga zaroori hai&quot;.
          </p>
          <p style={{ fontSize: 14 }}>
            Ye designers aur developers ke liye best hai jo Hindi websites, apps aur posters banate hain.
          </p>
          <p style={{ fontSize: 14 }}>
            Aap Hindi ke saath-saath Bengali, Tamil, Telugu, Marathi, Punjabi, Urdu aur 70 aur bhashaon me bhi text bana sakte hain.
          </p>

          <h3 style={{ marginTop: 20 }}>
            Best Practices
          </h3>
          <ul style={{ fontSize: 14 }}>
            <li>
              Use PARAGRAPH mode for full page mockups.
            </li>
            <li>
              Use SENTENCE mode for headings and cards.
            </li>
            <li>
              Use WORD mode to test font width and titles.
            </li>
            <li>
              Always check word count for SEO before using in real design.
            </li>
          </ul>

          <h3 style={{ marginTop: 20 }}>
            More Free Tools
          </h3>
          <p style={{ fontSize: 14 }}>
            LoremPro ke saath-saath aap hamare dusre free tools bhi use kar sakte hain - Word Counter, Case Converter, Image to Text, QR Generator, Password Generator, aur Age Calculator.
          </p>
          <p style={{ fontSize: 14 }}>
            Saare tools 100% free hain aur bina login ke chalte hain.
          </p>

          <h3 style={{ marginTop: 20 }}>
            Frequently Asked Questions (FAQ)
          </h3>

          <h4>
            Is Lorem Ipsum Generator free?
          </h4>
          <p style={{ fontSize: 14 }}>
            Yes, 100% free. No login, no signup, no watermark, unlimited generation.
          </p>

          <h4>
            Can I generate Lorem Ipsum in Hindi?
          </h4>
          <p style={{ fontSize: 14 }}>
            Yes. We support Hindi and 76 other languages including Bengali, Tamil, Telugu, Marathi, Urdu, Spanish, Arabic, French, German, and more.
          </p>

          <h4>
            Can I download the generated text?
          </h4>
          <p style={{ fontSize: 14 }}>
            Yes. You can download in 8 formats including TXT, HTML, PDF, DOC, JSON, CSV, and Markdown.
          </p>

          <h4>
            Can I use generated text for commercial projects?
          </h4>
          <p style={{ fontSize: 14 }}>
            Yes. You can use it anywhere for free for personal or commercial projects. No attribution required.
          </p>

          <h4>
            How many languages are supported?
          </h4>
          <p style={{ fontSize: 14 }}>
            We support 77 languages - the world&apos;s largest collection for a Lorem Ipsum Generator.
          </p>

          <p style={{ fontSize: 12, color: "#666", marginTop: 20 }}>
            Last Updated: October 2026 | Made with ❤️ in India
          </p>

        </div>
      )}

    </div>
  )
}
