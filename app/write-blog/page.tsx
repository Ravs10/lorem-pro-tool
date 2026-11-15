"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function makeSlug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4);
}

export default function WriteBlog() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", title: "", category: "General", excerpt: "", cover_image: "", content: "", seo_title: "", seo_description: "", tags: "", website: "", author_bio: "" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.name || !form.email || !form.title || form.content.length < 200) {
      alert("Please enter Name, Email, Title and at least 200 characters of blog content!");
      return;
    }
    if (form.website && !form.website.startsWith("http")) {
      alert("Please enter Website with https:// - e.g. https://myblog.com");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/submit-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setLoading(false);
    if (d.error) alert("Error: " + d.error);
    else setDone(true);
  }

  if (done) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl">🎉</div>
      <h1 className="text-3xl font-bold mt-4">Blog Submitted Successfully!</h1>
      <p className="text-gray-600 mt-2">It will appear on the site after Admin review. We will email you as soon as it is approved!</p>
      <p className="text-sm text-green-600 font-bold mt-3">✅ Your DoFollow backlink request is also saved. If approved, your Author Bio + Website link will go live with the blog.</p>
      <div className="flex gap-3 justify-center flex-wrap mt-6">
        <button onClick={() => setDone(false)} className="bg-black text-white px-6 py-3 rounded-full font-bold">✍️ Write Another Blog</button>
        <Link href="/blog" className="bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-full font-bold">📝 All Blogs →</Link>
        <Link href="/" className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold">🏠 Home</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => router.back()} className="px-5 py-2.5 bg-black text-white rounded-full font-bold text-sm">← Go Back</button>
        <Link href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-full font-bold text-sm">🏠 Home</Link>
        <Link href="/blog" className="px-5 py-2.5 bg-white border-2 border-orange-500 text-orange-600 rounded-full font-bold text-sm">📝 All Blogs →</Link>
      </div>

      <h1 className="text-3xl font-bold">✍️ Write a Blog</h1>
      <p className="text-gray-600 mt-1">Your blog will be published after Admin review. No login required!</p>

      <Link href="/write-for-us" className="block bg-black text-white rounded-2xl p-5 mt-4">
        <p className="font-bold text-lg">🔗 Get 1 FREE DoFollow Backlink + Author Bio</p>
        <p className="text-sm text-gray-300 mt-1">Like Medium & Quora - Just fill your Website Link & Author Bio below. If your blog is approved, your backlink goes live too!</p>
        <p className="text-xs text-orange-400 font-bold mt-2">Learn How It Works →</p>
      </Link>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <input placeholder="Your Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-3 rounded-xl" />
        <input placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-3 rounded-xl" />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-4">
        <p className="font-bold">🔗 Get Your Free DoFollow Backlink</p>
        <p className="text-xs text-gray-500 mt-1">Fill this to get your backlink + Author Bio box below your blog. Leave empty if you do not want a backlink.</p>
        <input placeholder="Your Website Link (for DoFollow Backlink) - e.g. https://myblog.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="w-full border p-3 rounded-xl mt-3 bg-white" />
        <textarea placeholder="Author Bio - 2 lines about you - e.g. I am an SEO Blogger with 5 years of experience in blogging & affiliate marketing." value={form.author_bio} onChange={e => setForm({ ...form, author_bio: e.target.value })} className="w-full border p-3 rounded-xl mt-3 h-[70px] bg-white" />
        <p className="text-xs text-gray-500 mt-1">This bio + website link will show below your blog as Author Bio Box, like Medium.</p>
        {(form.name || form.author_bio || form.website) && (
          <div className="bg-white border rounded-xl p-3 mt-3 flex gap-3 items-start">
            <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">{(form.name || "A").charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-[11px] text-gray-400">WRITTEN BY - PREVIEW</p>
              <p className="font-bold">{form.name || "Your Name"}</p>
              <p className="text-sm text-gray-500">{form.author_bio || "Your bio will appear here..."}</p>
              {form.website && <p className="text-sm text-blue-600 font-bold mt-1">🌐 Visit My Website →</p>}
            </div>
          </div>
        )}
      </div>

      <input placeholder="Blog Title * - e.g. How to Become a Crorepati with SIP" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border p-3 rounded-xl mt-4" />
      <div className="flex gap-4 mt-4">
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border p-3 rounded-xl flex-1">
          <option>General</option><option>Finance</option><option>YouTube</option><option>AI Tools</option><option>Career</option><option>Study</option><option>Technology</option><option>Blogging & SEO</option><option>Business & Startup</option><option>Health & Fitness</option><option>Education</option><option>Travel</option><option>Food & Recipe</option><option>Sports & Cricket</option><option>Entertainment & Movies</option><option>Tools & Apps</option>
        </select>
        <input placeholder="Cover Image Link (optional)" value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })} className="border p-3 rounded-xl flex-[2]" />
      </div>
      <textarea placeholder="Short Excerpt - In 1-2 lines, what is this blog about?" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full border p-3 rounded-xl mt-4 h-[70px]" />
      <textarea placeholder="Write your full blog here... Minimum 200 characters *" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full border p-3 rounded-xl mt-4 h-[300px]" />
      <p className="text-xs text-gray-500 mt-1">{form.content.length} characters</p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-4">
        <p className="font-bold">🔍 SEO Settings - For Google (Like Blogger)</p>
        <p className="text-xs text-gray-500 mt-1">If you leave this empty, it will be auto-generated from Title and Excerpt!</p>
        <input placeholder="SEO Title - This will show on Google (up to 60 chars)" maxLength={60} value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} className="w-full border p-3 rounded-xl mt-3 bg-white" />
        <p className="text-[11px] text-gray-500 mt-1">{form.seo_title.length}/60 - {form.seo_title.length > 60 ? '❌ Too long' : '✅ Perfect'}</p>
        <textarea placeholder="SEO Description - This will show below on Google (up to 155 chars) - e.g. How to make 1 Crore in 10 years with SIP? Complete guide..." maxLength={160} value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} className="w-full border p-3 rounded-xl mt-3 h-[70px] bg-white" />
        <p className="text-[11px] text-gray-500 mt-1">{form.seo_description.length}/160</p>
        <input placeholder="Tags - Separate with comma - e.g. sip, mutual fund, money, finance" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full border p-3 rounded-xl mt-3 bg-white" />
        {(form.seo_title || form.title) && (
          <div className="bg-white border rounded-xl p-3 mt-4">
            <p className="text-[11px] text-gray-500">GOOGLE PREVIEW 👇</p>
            <p className="text-blue-700 text-lg leading-tight mt-1">{form.seo_title || form.title}</p>
            <p className="text-green-700 text-xs">lorem-pro-tool.run4ravish.workers.dev › blog › ...</p>
            <p className="text-sm text-gray-600 line-clamp-2">{form.seo_description || form.excerpt || form.content.slice(0, 155)}</p>
          </div>
        )}
      </div>

      <button onClick={submit} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold mt-4">{loading ? "Submitting..." : "Submit for Review →"}</button>
      <p className="text-xs text-center text-gray-500 mt-3">Spam / Copied / Low-quality content will not be approved.</p>

      <div className="flex gap-3 flex-wrap mt-8">
        <button onClick={() => router.back()} className="px-6 py-3 bg-black text-white rounded-full font-bold">← Go Back</button>
        <Link href="/" className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold">🏠 Home</Link>
        <Link href="/blog" className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-full font-bold">📝 All Blogs →</Link>
      </div>
    </div>
  );
}
