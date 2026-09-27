import Link from 'next/link'

const tools = [
  { name: 'Character Counter', href: '/character-counter' },
  { name: 'Word Counter', href: '/word-counter' },
  { name: 'Lorem Ipsum Generator', href: '/' },
  { name: 'Case Converter', href: '/case-converter' },
  { name: 'Remove Duplicate Lines', href: '/remove-duplicates' },
  { name: 'Text to Handwriting', href: '/text-to-handwriting' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white mt-16">

      {/* 1. HIRE ME PROMO */}
      <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-black rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
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
                I don't just build apps. I build <b>money-making tools, high-converting websites, SaaS & automation systems</b> that save time & make you money.
              </p>
            </div>

            <div className="bg-black rounded-[24px] p-7 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-black text-white">What I Can Do For You 👇</h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li className="flex gap-3"><span className="text-orange-500">✓</span> <span><b className="text-white">Custom Tools</b> — Your own Lorem Tool</span></li>
                <li className="flex gap-3"><span className="text-orange-500">✓</span> <span><b className="text-white">Websites</b> — Next.js, SEO Ready</span></li>
                <li className="flex gap-3"><span className="text-orange-500">✓</span> <span><b className="text-white">Web & Mobile Apps</b> — Idea to Play Store</span></li>
              </ul>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <a href="https://wa.me/919999999999" target="_blank" className="bg-[#25D366] text-black text-center py-3 rounded-full font-black text-sm hover:scale-105 transition">WhatsApp Me</a>
                <a href="mailto:ravish@example.com" className="bg-white text-black text-center py-3 rounded-full font-black text-sm hover:bg-zinc-200 transition">Email Me</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OLD FOOTER RESTORED */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div>
            <p className="text-white font-black text-xl">Lorem Pro Tool</p>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Free online tools for writers, developers & creators. Fast, private & no login required.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full text-xs text-zinc-300 border border-zinc-800">
              Made with ❤️ by Ravish
            </div>
          </div>

          <div>
            <h4 className="text-white font-black tracking-wide mb-4">ALL TOOLS</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="hover:text-orange-500 hover:translate-x-1 inline-block transition-all">
                    → {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black tracking-wide mb-4">EXPLORE</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><Link href="/blog" className="hover:text-orange-500 transition">→ Blog - Tips & Guides</Link></li>
              <li><Link href="/" className="hover:text-orange-500 transition">→ Home</Link></li>
              <li><Link href="/about" className="hover:text-orange-500 transition">→ About Me</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-500 transition">→ Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-orange-500 transition">→ Contact</Link></li>
            </ul>
          </div>

        </div>
      </div>

      <div className="border-t border-zinc-900 text-center text-[12px] text-zinc-600 py-6">
        © {new Date().getFullYear()} Lorem Pro Tool • Built by Ravish
      </div>
    </footer>
  )
}
