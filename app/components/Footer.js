import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function Footer() {
  const { data: latestBlogs } = await supabase
  .from('blogs')
  .select('title, slug')
  .order('created_at', { ascending: false })
  .limit(3);

  return (
    <footer className="relative mt-20 bg-black overflow-hidden">
      {/* Orange Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-orange-500/30 via-red-500/20 to-orange-500/30 blur-[120px] rounded-full -translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-4 pb-10 pt-8">

        {/* Top Animated Border */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse mb-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1 - Tools */}
          <div className="group relative rounded-[24px] p-[1.5px] bg-gradient-to-br from-orange-400 via-zinc-800 to-zinc-800 hover:from-orange-500 hover:to-orange-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <div className="rounded-[22px] bg-gradient-to-br from-zinc-900 to-black p-7 h-full">
              <h4 className="text-white font-black text-xl mb-5 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full animate-pulse"></span>
                All Tools
              </h4>
              <div className="flex flex-col gap-3">
                <Link href="/fake-data-generator" className="group/link flex justify-between items-center text-zinc-400 hover:text-orange-400 transition-all duration-300 hover:pl-2">
                  <span>Fake Data Generator</span><span className="opacity-0 group-hover/link:opacity-100 transition">→</span>
                </Link>
                <Link href="/password-generator" className="group/link flex justify-between items-center text-zinc-400 hover:text-orange-400 transition-all duration-300 hover:pl-2">
                  <span>Password Generator</span><span className="opacity-0 group-hover/link:opacity-100 transition">→</span>
                </Link>
                <Link href="/tools" className="mt-4 inline-flex items-center gap-2 bg-orange-500 text-black font-bold px-5 py-2.5 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 w-fit">
                  All Tools <span className="group-hover:translate-x-1 transition">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2 - Blog AUTOMATIC */}
          <div className="group relative rounded-[24px] p-[1.5px] bg-gradient-to-br from-orange-400 via-zinc-800 to-zinc-800 hover:from-orange-500 hover:to-orange-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <div className="rounded-[22px] bg-gradient-to-br from-zinc-900 to-black p-7 h-full">
              <h4 className="text-white font-black text-xl mb-5 flex items-center gap-2">
                <span className="text-xl">📝</span> Blog
                <span className="ml-auto text-[10px] bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full animate-pulse">LIVE</span>
              </h4>
              <div className="flex flex-col gap-3">
                <Link href="/blog" className="text-zinc-400 hover:text-orange-400 transition">📝 Blog →</Link>
                {latestBlogs?.map((b, i) => (
                  <Link key={b.slug} href={`/blog/${b.slug}`} className="group/link flex gap-2 text-zinc-300 hover:text-white transition-all duration-300 hover:pl-1" style={{animationDelay: `${i*100}ms`}}>
                    <span className="text-orange-500 group-hover/link:translate-x-1 transition">→</span>
                    <span className="truncate">{b.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-zinc-800 pt-6">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} <span className="text-white font-bold">Lorem Pro Tool</span> — Built with <span className="text-orange-500 animate-pulse">⚡</span></p>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-xs text-zinc-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
