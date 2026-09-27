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
    <footer className="relative mt-16 bg-black text-white">
      <div className="relative max-w-7xl mx-auto px-4 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* All Tools Card */}
          <div className="rounded-[20px] p-[1px] bg-zinc-800">
            <div className="rounded-[19px] bg-zinc-900 p-6 h-full">
              <h4 className="text-white font-bold text-lg mb-4">All Tools</h4>
              <div className="flex flex-col gap-2 text-sm opacity-80">
                <Link href="/fake-data-generator" className="hover:text-orange-400">Fake Data Generator</Link>
                <Link href="/password-generator" className="hover:text-orange-400">Password Generator</Link>
                <Link href="/tools" className="hover:text-orange-400 mt-2">All Tools →</Link>
              </div>
            </div>
          </div>

          {/* Blog Card - AUTOMATIC */}
          <div className="rounded-[20px] p-[1px] bg-zinc-800">
            <div className="rounded-[19px] bg-zinc-900 p-6 h-full">
              <h4 className="text-white font-bold text-lg mb-4">📝 Blog</h4>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/blog" className="hover:text-orange-400">📝 Blog →</Link>
                {latestBlogs && latestBlogs.length > 0? (
                  latestBlogs.map((b) => (
                    <Link key={b.slug} href={`/blog/${b.slug}`} className="hover:text-orange-400 opacity-80 truncate" title={b.title}>
                      → {b.title}
                    </Link>
                  ))
                ) : (
                  <span className="opacity-50">No blogs yet</span>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="text-center text-xs opacity-40 mt-8">
          © {new Date().getFullYear()} Lorem Pro Tool
        </div>

      </div>
    </footer>
  );
}
