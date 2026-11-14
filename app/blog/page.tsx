import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ✅ STRONGEST SEO - Blog List Page
export const metadata = {
  title: 'Blog | Lorem Pro Tool - 26+ Free Online Tools, Tips & Guides',
  description: 'Read Lorem Pro Tool Blog by Admin - Best free tool to generate viral YouTube titles, tags & descriptions, Lorem Ipsum history, 26+ free online tools in one place. No login, no ads.',
  keywords: ['Lorem Pro Tool Blog', 'Free Online Tools', 'Viral YouTube Titles', 'Lorem Ipsum History', 'Free Tools Blog', 'Lorem Pro'],
  authors: [{ name: 'Admin', url: 'https://lorem-pro-tool.run4ravish.workers.dev/blog' }],
  openGraph: {
    title: 'Blog | Lorem Pro Tool - 26+ Free Online Tools',
    description: 'Best free tool to generate viral YouTube titles, Lorem Ipsum history & more. Read blogs by Admin.',
    type: 'website',
    url: 'https://lorem-pro-tool.run4ravish.workers.dev/blog',
    siteName: 'Lorem Pro Tool',
    locale: 'en_US',
    images: [{ url: 'https://lorem-pro-tool.run4ravish.workers.dev/og-image.png', width: 1200, height: 630, alt: 'Lorem Pro Tool Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Lorem Pro Tool',
    description: '26+ Free Online Tools, Tips & Guides by Admin',
    images: ['https://lorem-pro-tool.run4ravish.workers.dev/og-image.png'],
  },
  alternates: { canonical: 'https://lorem-pro-tool.run4ravish.workers.dev/blog' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
}

function cleanExcerpt(text: string) {
  if (!text) return ""
  return text.replace(/<[^>]*>?/gm, "").replace(/#{1,3}\s/g, "").replace(/\*\*/g, "").replace(/-\s/g, "").trim().slice(0, 150) + "..."
}

export default async function BlogPage() {
  const { data: blogs } = await supabase.from('blogs').select('*').neq('is_deleted', true).order('created_at', { ascending: false })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Lorem Pro Tool Blog",
    "url": "https://lorem-pro-tool.run4ravish.workers.dev/blog",
    "author": { "@type": "Person", "name": "Admin" },
    "publisher": { "@type": "Organization", "name": "Lorem Pro Tool", "url": "https://lorem-pro-tool.run4ravish.workers.dev" },
    "blogPost": (blogs || []).map((b: any) => ({
      "@type": "BlogPosting",
      "headline": b.title,
      "url": `https://lorem-pro-tool.run4ravish.workers.dev/blog/${b.slug}`,
      "datePublished": b.created_at,
      "dateModified": b.created_at,
      "author": { "@type": "Person", "name": "Admin" },
    }))
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#fffaf0] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-black">Blog</h1>
        <Link href="/" className="px-5 py-2.5 rounded-full bg-orange-500 text-white font-bold">🏠 Home</Link>
      </div>
      <div className="grid gap-6">
        {blogs?.map((blog: any) => (
          <Link key={blog.slug} href={`/blog/${blog.slug}`} className="block bg-[#fff7e6] p-6 rounded-[24px] border border-orange-100 shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{blog.title}</h2>
            {/* ✅ CHANGE: Ab By Admin Hai, By Ravish Nahi */}
            <p className="text-orange-500 text-sm font-bold mt-2">{new Date(blog.created_at).toLocaleDateString()} | By Admin</p>
            <p className="text-gray-600 mt-3 leading-relaxed">{cleanExcerpt(blog.content)}</p>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-8">
        <Link href="/" className="px-8 py-3 rounded-full bg-black text-white font-bold">← Go to Home</Link>
        <Link href="/" className="px-8 py-3 rounded-full bg-orange-500 text-white font-bold">🏠 Home Page</Link>
      </div>
    </div>
  )
}
