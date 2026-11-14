"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function makeSlug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4);
}

export default function WriteBlog() {
  // ✅ 1. YAHAN ADD KIYA - form state me seo wale 3 field
  const [form, setForm] = useState({ name: "", email: "", title: "", category: "General", excerpt: "", cover_image: "", content: "", seo_title: "", seo_description: "", tags: "" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.name || !form.email || !form.title || form.content.length < 200) {
      alert("Naam, Email, Title aur kam se kam 200 characters ka blog likho!");
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
      status: "pending", // Admin approve karega tabhi live hoga
      is_deleted: false,
      // ✅ 2. YAHAN ADD KIYA - submit me SEO bhej diya
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
      <h1 className="text-3xl font-bold mt-4">Blog Submit Ho Gaya!</h1>
      <p className="text-gray-600 mt-2">Admin review ke baad approve hoga, tab site pe dikhega. Approve hote hi hum email kar denge!</p>
      <Link href="/blog" className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-full">Back to Blog</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">✍️ Write a Blog</h1>
      <p className="text-gray-600 mt-1">Tumhara blog Admin ke review ke baad publish hoga. No login chahiye!</p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <input placeholder="Tumhara Naam *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-3 rounded-xl" />
        <input placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-3 rounded-xl" />
      </div>
      <input placeholder="Blog Title * - e.g. SIP Se Crorepati Kaise Bane" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border p-3 rounded-xl mt-4" />
      <div className="flex gap-4 mt-4">
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border p-3 rounded-xl flex-1">
          <option>General</option><option>Finance</option><option>YouTube</option><option>AI Tools</option><option>Career</option><option>Study</option>
        </select>
        <input placeholder="Cover Image Link (optional)" value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })} className="border p-3 rounded-xl flex-[2]" />
      </div>
      <textarea placeholder="Short Excerpt - 1-2 line me kya hai blog me" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full border p-3 rounded-xl mt-4 h-[70px]" />
      <textarea placeholder="Yahan poora blog likho... kam se kam 200 characters *" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full border p-3 rounded-xl mt-4 h-[300px]" />
      <p className="text-xs text-gray-500 mt-1">{form.content.length} characters</p>

      {/* ✅ 3. YAHAN ADD KIYA - SEO Box - Content ke baad, Submit button ke pehle */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-4">
        <p className="font-bold">🔍 SEO Settings - Google Ke Liye (Blogger Jaisa)</p>
        <p className="text-xs text-gray-500 mt-1">Ye nahi bharoge to Title aur Excerpt se apne aap ban jayega!</p>
        <input placeholder="SEO Title - Google me ye dikhega (60 chars tak)" maxLength={60} value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} className="w-full border p-3 rounded-xl mt-3 bg-white" />
        <p className="text-[11px] text-gray-500 mt-1">{form.seo_title.length}/60 - {form.seo_title.length > 60 ? '❌ Lamba hai' : '✅ Perfect'}</p>
        <textarea placeholder="SEO Description - Google me neeche ye dikhega (155 chars tak) - e.g. SIP se 10 saal me 1 Crore kaise banaye? Poora guide Hindi me..." maxLength={160} value={form.seo_description} onChange={e => setForm({ ...form, seo_description: e.target.value })} className="w-full border p-3 rounded-xl mt-3 h-[70px] bg-white" />
        <p className="text-[11px] text-gray-500 mt-1">{form.seo_description.length}/160</p>
        <input placeholder="Tags - comma se alag likho - e.g. sip, mutual fund, paisa, finance" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full border p-3 rounded-xl mt-3 bg-white" />
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
      <p className="text-xs text-center text-gray-500 mt-3">Spam / Copy / Ganda content approve nahi hoga.</p>
    </div>
  );
}
