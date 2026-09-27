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
      <div className="absolute -top-32 left-0 right-0 h-32 bg-black"></div>
      <div className="relative max-w-7xl mx-auto p-4">
        <div className="rounded-[20px] p-2 bg-zinc-900">
          <div className="rounded-[18px] p-6 bg-black">
            <h4 className="text-white font-bold mb-3">All Tools</h4>
            <div className="flex flex-wrap gap-3">
              <Link href="/fake-data-generator">Fake Data Generator</Link>
              <Link href="/password-generator">Password Generator</Link>
              <Link href="/tools">All Tools →</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div className="rounded-2xl bg-zinc-900 p-6">
            <h4 className="text-white font-bold mb-3">📝 Blog</h4>
            <div className="space-y-2 text-sm opacity-80">
              <Link href="/blog" className="block hover:text-orange-400">📝 Blog →</Link>

              {/* AUTOMATIC - Admin jo bhi post karega yaha aa jayega */}
              {latestBlogs?.map((b) => (
                <Link key={b.slug} href={`/blog/${b.slug}`} className="block hover:text-orange-400 truncate">
                  → {b.title}
                </Link>
              ))}
            </div>
          </div>

          {/* aapka baki footer yaha same rahega */}
        </div>
      </div>
    </footer>
  );
}
