"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function makeSlug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4);
}

export default function WriteBlog() {
  const router = useRouter();
  // Form state - Including SEO fields
  const [form, setForm] = useState({ name: "", email: "", title: "", category: "General", excerpt: "", cover_image: "", content: "", seo_title: "", seo_description: "", tags: "" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.name || !form.email || !form.title || form.content.length < 200) {
      alert("Please enter Name, Email, Title and at least 200 characters of blog content!");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("blogs").insert([{
      title: form.title,
      slug: makeSlug(form.title),
      excerpt: form.excerpt || form.content.slice(0, 150),
      content: form.content,
      category: form.category,
      cover_image: form.cover_image || null,
      author_name: form.name,
      author_email: form.email,
      status: "pending", // Will go live only after Admin approves
      is_deleted: false,
      // SEO fields - Submit with blog
      seo_title: form.seo_title || form.title,
      seo_description: form.seo_description || form.excerpt || form.content.slice(0, 155),
      tags: form.tags,
    }]);
    setLoading(false);
    if (error) alert("Error: " + error.message);
    else setDone(true);
  }

  if (done) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl">🎉</div>
      <h1 className="text-3xl font-bold mt-4">Blog Submitted Successfully!</h1>
      <p className="text-gray-600 mt-2">It will appear on the site after Admin review. We will email you as soon as it is approved!</p>
      <div className="flex gap-3 justify-center flex-wrap mt-6">
        <button onClick={() => setDone(false)} className="bg-black text-white px-6 py-3 rounded-full font-bold">✍️ Write Another Blog</button>
        <Link href="/blog" className="bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-full font-bold">📝 All Blogs →</Link>
        <Link href="/" className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold">🏠 Home</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ✅ TOP NAVIGATION - Same as Blog Detail Page */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => router.back()} className="px-5 py-2.5 bg-black text-white rounded-full font-bold text-sm">← Go Back</button>
        <Link href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-full font-bold text-sm">🏠 Home</Link>
        <Link href="/blog" className="px-5 py-2.5 bg-white border-2 border-orange-500 text-orange-600 rounded-full font-bold text-sm">📝 All Blogs →</Link>
      </div>

      <h1 className="text-3xl font-bold">✍️ Write a Blog</h1>
      <p className="text-gray-600 mt-1">Your blog will be published after Admin review. No login required!</p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <input placeholder="Your Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-3 rounded-xl" />
        <input placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-3 rounded-xl" />
      </div>
      <input placeholder="Blog Title * - e.g. How to Become a Crorepati with SIP" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border p-3 rounded-xl mt-4" />
      <div className="flex gap-4 mt-4">
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border p-3 rounded-xl flex-1">
          <option>General</option><option>Finance</option><option>YouTube</option><option>AI Tools</option><option>Career</option><option>Study</option>
        </select>
        <input placeholder="Cover Image Link (optional)" value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })} className="border p-3 rounded-xl flex-[2]" />
      </div>
      <textarea placeholder="Short Excerpt - In 1-2 lines, what is this blog about?" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full border p-3 rounded-xl mt-4 h-[70px]" />
      <textarea placeholder="Write your full blog here... Minimum 200 characters *" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full border p-3 rounded-xl mt-4 h-[300px]" />
      <p className="text-xs text-gray-500 mt-1">{form.content.length} characters</p>

      {/* ✅ SEO Box - After Content, Before Submit Button */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-4">
        <p className="font-bold">🔍 SEO Settings - For Google (Like Blogger)</p>
        <p className="text-xs text-gray-500 mt-1">If you leave this empty, it will be auto-generated from Title and Excerpt!</p>
        <input placeholder="SEO Title - This will show on Google (up to 60 chars)" maxLength={60} value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} className="w-full border p-3 rounded-xl mt-3 bg-white" />
        <p className="text-[11px] text-gray-500 mt-1">{form.seo_title.length}/60 - {form.seo_title.length > 60 ? '❌ Too long' : '✅ Perfect'}</p>
        <textarea placeholder="SEO Description - This will show below on Google (up to 155 chars) - e.g. How to make 1 Crore in 10 years with SIP? Complete guide..." maxLength={160} value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} className="w-full border p-3 rounded-xl mt-3 h-[70px] bg-white" />
        <p className="text-[11px] text-gray-500 mt-1">{form.seo_description.length}/160</p>
        <input placeholder="Tags - Separate with comma - e.g. sip, mutual fund, money, finance" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full border p-3 rounded-xl mt-3 bg-white" />
        {/* Live Google Preview */}
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

      {/* ✅ BOTTOM NAVIGATION - Same as Blog Detail Page */}
      <div className="flex gap-3 flex-wrap mt-8">
        <button onClick={() => router.back()} className="px-6 py-3 bg-black text-white rounded-full font-bold">← Go Back</button>
        <Link href="/" className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold">🏠 Home</Link>
        <Link href="/blog" className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-full font-bold">📝 All Blogs →</Link>
      </div>
    </div>
  );
}
