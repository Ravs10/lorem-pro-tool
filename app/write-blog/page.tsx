"use client";
import { useState } from "react";
import Link from "next/link";

export default function WriteBlog() {
  const [form, setForm] = useState({ title: "SIP Calculator: ₹500 Mahine Se ₹1 Crore Kaise Banaye? [2026 Full Guide]", slug: "sip-calculator-500-se-1-crore-kaise-banaye", excerpt: "SIP Calculator se jaano ₹500, ₹1000 aur ₹5000 mahine ki SIP se kitne saal me 1 Crore banega. SIP Formula, 12% Return ka magic aur Best SIP Plan 2026.", content: "", category: "Finance", tags: "SIP Calculator, SIP Kya Hai, Mutual Fund SIP, Best SIP Plan, SIP Return Calculator", author_name: "", author_email: "", cover_image: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e: any) {
    e.preventDefault();
    setMsg("");
    if (form.content.length < 300) { setMsg("❌ Content bahut chhota hai, kam se kam 300 characters likho."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Submit fail ho gaya");
      setMsg("✅ Blog Submit Ho Gaya! Admin approve karne ke baad dikhega.");
      setForm({ ...form, title: "", slug: "", content: "", excerpt: "", tags: "" });
    } catch (err: any) {
      setMsg("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold">✍️ Write a Blog</h1>
      <p className="text-sm text-gray-500 mt-1">Approved hone par 1 FREE DoFollow Backlink milega.</p>

      <form onSubmit={submit} className="mt-5 space-y-4 w-full">
        <input name="author_name" value={form.author_name} onChange={handle} placeholder="Your Name *" required className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-orange-300" />
        <input name="author_email" value={form.author_email} onChange={handle} placeholder="Your Email *" required type="email" className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-orange-300" />
        <input name="title" value={form.title} onChange={handle} placeholder="Blog Title *" required className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-orange-300" />
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input name="slug" value={form.slug} onChange={handle} placeholder="slug-like-this" className="w-full sm:flex-1 border p-3 rounded-xl outline-none" />
          <select name="category" value={form.category} onChange={handle} className="w-full sm:w-[160px] border p-3 rounded-xl outline-none">
            <option>Finance</option><option>General</option><option>YouTube</option><option>AI Tools</option><option>Career</option><option>Study</option><option>Technology</option><option>Blogging & SEO</option><option>Business & Startup</option><option>Health & Fitness</option><option>Education</option><option>Travel</option><option>Food & Recipe</option><option>Sports & Cricket</option><option>Entertainment & Movies</option><option>Tools & Apps</option>
          </select>
        </div>

        <div className="bg-[#fffaf0] border rounded-xl p-4 w-full box-border">
          <textarea name="excerpt" value={form.excerpt} onChange={handle} placeholder="Short Description (SEO ke liye - 160 characters)" maxLength={160} rows={3} className="w-full bg-transparent outline-none resize-none text-[15px] leading-relaxed" />
          <p className="text-right text-xs text-gray-500">{form.excerpt.length}/160 - {form.excerpt.length >= 50 ? "✅ Perfect" : "Thoda aur likho"}</p>
        </div>

        <input name="tags" value={form.tags} onChange={handle} placeholder="Tags - comma se alag karo" className="w-full border p-3 rounded-xl outline-none" />
        <input name="cover_image" value={form.cover_image} onChange={handle} placeholder="Cover Image URL (optional)" className="w-full border p-3 rounded-xl outline-none" />

        <div className="bg-[#fffaf0] border rounded-xl p-4 w-full box-border">
          <p className="text-xs font-bold text-gray-500 mb-2">GOOGLE PREVIEW 👇</p>
          <p className="text-[#1a0dab] text-[17px] leading-snug break-words">{form.title || "Title yaha dikhega"}</p>
          <p className="text-[13px] text-[#006621] truncate">lorem-pro-tool... › blog › {form.slug}</p>
          <p className="text-[13px] text-gray-600 leading-relaxed break-words line-clamp-2">{form.excerpt}</p>
        </div>

        <textarea name="content" value={form.content} onChange={handle} placeholder="Apna poora blog yaha likho... (Min 300 characters)" rows={15} required className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-orange-300 text-[15px] leading-relaxed" />
        <p className="text-xs text-gray-500">Content: {form.content.length} characters</p>

        {msg && <p className="p-3 rounded-xl bg-gray-100 text-sm font-bold break-words">{msg}</p>}

        <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-base">
          {loading ? "Submitting..." : "Submit Blog For Review →"}
        </button>
        <p className="text-center text-xs text-gray-500">Spam / Copied / Low-quality content will not be approved.</p>
      </form>

      <div className="flex flex-wrap gap-3 mt-6">
        <Link href="/blog" className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold">← Go Back</Link>
        <Link href="/" className="bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-bold">🏠 Home</Link>
        <Link href="/blog" className="border border-orange-500 text-orange-600 px-5 py-2.5 rounded-full text-sm font-bold">📝 All Blogs →</Link>
      </div>
    </div>
  );
}
