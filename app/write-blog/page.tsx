"use client";
import { useState } from "react";
import Link from "next/link";

export default function WriteBlog() {
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", seo_title: "", seo_description: "", content: "", category: "Finance", tags: "", author_name: "", author_email: "", cover_image: "", author_website: "", author_bio: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e: any) {
    e.preventDefault(); setMsg("");
    if (form.content.length < 300) { setMsg("❌ Content is too short, write at least 300 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Submit failed");
      setMsg("✅ Blog Submitted! You will get DoFollow after approval.");
      setForm({ ...form, title: "", slug: "", excerpt: "", seo_title: "", seo_description: "", content: "", category: "Finance", tags: "", author_name: "", author_email: "", cover_image: "", author_website: "", author_bio: "" });
    } catch (err: any) { setMsg("❌ Error: " + err.message); } finally { setLoading(false); }
  }

  const Label = ({ children, required }: any) => (
    <label className="block text-sm font-bold text-gray-700 -mb-2">{children} {required && <span className="text-red-600">*</span>}</label>
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold">✍️ Write a Blog</h1>
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4 text-sm leading-relaxed">
        <p className="font-bold">🎁 What You Will Get?</p>
        <p>✅ 1. Blog Goes Live After Approval &nbsp; ✅ 2. Author Bio Box &nbsp; ✅ 3. <b>DoFollow Link If Quality Is Good</b> (All links start as UGC)</p>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4 w-full">
        <p className="font-bold text-sm pt-2">👤 ABOUT YOU - Author Bio</p>

        <Label required>Your Name</Label>
        <input name="author_name" value={form.author_name} onChange={handle} placeholder="Enter your full name" required className="w-full border p-3 rounded-xl outline-none" />

        <Label required>Your Email</Label>
        <input name="author_email" value={form.author_email} onChange={handle} placeholder="Enter your email address" required type="email" className="w-full border p-3 rounded-xl outline-none" />

        <Label required>Your Website / Blog URL</Label>
        <input name="author_website" value={form.author_website} onChange={handle} placeholder="e.g. https://example.com" required type="url" className="w-full border p-3 rounded-xl outline-none" />

        <Label required>Your Bio</Label>
        <textarea name="author_bio" value={form.author_bio} onChange={handle} placeholder="Write 1-2 lines about yourself. e.g. I am a finance blogger, writing about SIP for 2 years." required rows={2} maxLength={200} className="w-full border p-3 rounded-xl outline-none resize-none" />
        <p className="text-xs text-gray-500 -mt-2">{form.author_bio.length}/200 • This bio will appear below your blog, with your website link.</p>

        <p className="font-bold text-sm pt-2">📝 BLOG DETAILS</p>

        <Label required>Blog Title</Label>
        <input name="title" value={form.title} onChange={handle} placeholder="Enter an attractive blog title" required className="w-full border p-3 rounded-xl outline-none" />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label required>Slug</Label>
            <input name="slug" value={form.slug} onChange={handle} placeholder="e.g. sip-calculator-guide" className="w-full border p-3 rounded-xl outline-none mt-2" />
          </div>
          <div className="w-full sm:w-[160px]">
            <Label required>Category</Label>
            <select name="category" value={form.category} onChange={handle} className="w-full border p-3 rounded-xl outline-none mt-2"><option>Finance</option><option>General</option><option>YouTube</option><option>AI Tools</option><option>Career</option><option>Study</option><option>Technology</option><option>Blogging & SEO</option><option>Business & Startup</option><option>Health & Fitness</option><option>Education</option><option>Travel</option><option>Food & Recipe</option><option>Sports & Cricket</option><option>Entertainment & Movies</option><option>Tools & Apps</option></select>
          </div>
        </div>

        <Label required>Short Description (For Blog List Page)</Label>
        <div className="bg-[#fffaf0] border rounded-xl p-4 w-full box-border">
          <textarea name="excerpt" value={form.excerpt} onChange={handle} placeholder="Write a short summary of your blog in 1-2 lines. This will appear on Blog List page." maxLength={160} rows={3} className="w-full bg-transparent outline-none resize-none text-[15px] leading-relaxed" />
          <p className="text-right text-xs text-gray-500">{form.excerpt.length}/160 - {form.excerpt.length >= 50 ? "✅ Perfect" : "Write a little more"}</p>
        </div>

        <p className="font-bold text-sm pt-2">🔍 SEO SETTINGS - For Google Ranking</p>

        <Label>SEO Title (Will Appear on Google)</Label>
        <input name="seo_title" value={form.seo_title} onChange={handle} placeholder="e.g. Personal Loan EMI Calculator 2026 - Free Tool" maxLength={60} className="w-full border p-3 rounded-xl outline-none" />
        <p className="text-xs text-gray-500 -mt-2">{form.seo_title.length}/60 • If left empty, Blog Title will appear on Google. {form.seo_title.length > 60 ? "❌ Too long" : form.seo_title.length >= 40 ? "✅ Perfect" : "40-60 characters is best"}</p>

        <Label>SEO Description (Will Appear Below Title on Google)</Label>
        <div className="bg-[#f0fdf4] border border-green-200 rounded-xl p-4 w-full box-border">
          <textarea name="seo_description" value={form.seo_description} onChange={handle} placeholder="Write a 1-2 line description that will appear on Google search. Include your main keyword." maxLength={160} rows={3} className="w-full bg-transparent outline-none resize-none text-[15px] leading-relaxed" />
          <p className="text-right text-xs text-gray-500">{form.seo_description.length}/160 - {form.seo_description.length >= 120 ? "✅ Perfect" : form.seo_description.length >= 50 ? "Write a little more" : "120-155 characters is best"}</p>
        </div>

        <Label>Tags</Label>
        <input name="tags" value={form.tags} onChange={handle} placeholder="Enter tags separated by comma, e.g. SIP, Mutual Fund, Finance" className="w-full border p-3 rounded-xl outline-none" />

        <Label>Cover Image URL</Label>
        <input name="cover_image" value={form.cover_image} onChange={handle} placeholder="Paste cover image URL (optional)" className="w-full border p-3 rounded-xl outline-none" />

        {/* GOOGLE PREVIEW - NOW USES SEO FIELDS */}
        <div className="bg-[#fffaf0] border rounded-xl p-4 w-full box-border">
          <p className="text-xs font-bold text-gray-500 mb-2">GOOGLE PREVIEW 👇</p>
          <p className="text-[#1a0dab] text-[17px] leading-snug break-words">{form.seo_title || form.title || "Your title will appear here"}</p>
          <p className="text-[13px] text-[#006621] truncate">lorem-pro-tool... › blog › {form.slug || "your-slug"}</p>
          <p className="text-[13px] text-gray-600 leading-relaxed break-words line-clamp-2">{form.seo_description || form.excerpt || "Your SEO description will appear here on Google search."}</p>
        </div>

        <Label required>Blog Content</Label>
        <textarea name="content" value={form.content} onChange={handle} placeholder="Write your full blog here... (Minimum 300 characters)" rows={15} required className="w-full border p-3 rounded-xl outline-none text-[15px] leading-relaxed" />
        <p className="text-xs text-gray-500">Content: {form.content.length} characters</p>

        {msg && <p className="p-3 rounded-xl bg-gray-100 text-sm font-bold break-words">{msg}</p>}
        <button disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl">{loading ? "Submitting..." : "Submit Blog For Review →"}</button>
        <p className="text-center text-xs text-gray-500">Your link will start as UGC. It will change to DoFollow after admin approval. You can check the status on your blog page.</p>
      </form>

      <div className="flex flex-wrap gap-3 mt-6">
        <Link href="/blog" className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold">← Go Back</Link>
        <Link href="/" className="bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-bold">🏠 Home</Link>
        <Link href="/blog" className="border border-orange-500 text-orange-600 px-5 py-2.5 rounded-full text-sm font-bold">📝 All Blogs →</Link>
      </div>
    </div>
  );
}
