import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white mt-16">

      {/* ===== HIRE ME PROMO SECTION ===== */}
      <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-black rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* LEFT - Pitch */}
            <div>
              <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                AVAILABLE FOR NEW PROJECTS
              </div>

              <h2 className="text-4xl md:text-5xl font-black leading-[0.9] text-black">
                Got an Idea? <br />
                <span className="text-white">Let's Build It.</span>
              </h2>

              <p className="text-black/80 font-medium mt-4 text-[15px] leading-relaxed">
                I don't just build apps. I build <b>money-making tools, high-converting websites, SaaS products & automation systems</b> that save time & make you money.
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                {['Custom Tools', 'Websites', 'Web Apps', 'Mobile Apps', 'SaaS', 'AI Tools', 'Automation', 'E-commerce'].map((t) => (
                  <span key={t} className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT - Offer Box */}
            <div className="bg-black rounded-[24px] p-7 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-black text-white">What I Can Do For You 👇</h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li className="flex gap-3"><span className="text-orange-500">✓</span> <span><b className="text-white">Custom Business Tools</b> — Lorem Tool jaisa apna tool</span></li>
                <li className="flex gap-3"><span className="text-orange-500">✓</span> <span><b className="text-white">Lightning Fast Websites</b> — Next.js, SEO ready</span></li>
                <li className="flex gap-3"><span className="text-orange-500">✓</span> <span><b className="text-white">Web & Mobile Apps</b> — Idea to Play Store</span></li>
                <li className="flex gap-3"><span className="text-orange-500">✓</span> <span><b className="text-white">Automation & AI</b> — Kaam 10x fast</span></li>
              </ul>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <a href="https://wa.me/919999999999" target="_blank" className="bg-[#25D366] text-black text-center py-3 rounded-full font-black text-sm hover:scale-105 transition">
                  WhatsApp Me
                </a>
                <a href="mailto:ravish@example.com" className="bg-white text-black text-center py-3 rounded-full font-black text-sm hover:bg-zinc-200 transition">
                  Email Me
                </a>
              </div>
              <p className="text-center text-[11px] text-zinc-500 mt-3 tracking-wide">⚡ REPLY IN 2 HOURS • 100% CONFIDENTIAL IDEA</p>
            </div>

          </div>
        </div>
      </div>

      {/* ===== NORMAL FOOTER LINKS ===== */}
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-zinc-400">
        <div>
          <p className="text-white font-black text-lg">Ravish • Lorem Pro Tool</p>
          <p className="mt-2 max-w-sm">Building tools that people actually use. Let's turn your idea into a profitable product.</p>
        </div>
        <div className="flex gap-6 font-bold">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <Link href="/blog" className="hover:text-orange-500">Blog</Link>
          <Link href="/privacy" className="hover:text-orange-500">Privacy</Link>
        </div>
      </div>

      <div className="text-center text-[12px] text-zinc-600 pb-6">© {new Date().getFullYear()} Ravish. All rights reserved.</div>
    </footer>
  )
}
