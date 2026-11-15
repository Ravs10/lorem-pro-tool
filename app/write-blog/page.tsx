"use client";
import { useState } from "react";
import Link from "next/link";

export default function WriteBlog() {
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", category: "Finance", tags: "", author_name: "", author_email: "", cover_image: "", author_website: "", author_bio: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e: any) {
    e.preventDefault(); setMsg("");
    if (form.content.length < 300) { setMsg("❌ Content bahut chhota hai, kam se kam 300 characters likho."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Submit fail");
      setMsg("✅ Blog Submit Ho Gaya! Approve hone par aapko DoFollow milega.");
      setForm({ ...form, title: "", slug: "", excerpt: "", content: "", category: "Finance", tags: "", author_name: "", author_email: "", cover_image: "", author_website: "", author_bio: "" });
    } catch (err: any) { setMsg("❌ Error: " + err.message); } finally { setLoading(false); }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold">✍️ Write a Blog</h1>
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4 text-sm leading-relaxed">
        <p className="font-bold">🎁 Kya Milega?</p>
        <p>✅ 1. Approve hone par Blog Live &nbsp; ✅ 2. Author Bio Box &nbsp; ✅ 3. <b>Quality acchi hui to DoFollow Link</b> (Shuru me sab link UGC rahenge)</p>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4 w-full">
        <p className="font-bold text-sm pt-2">👤 ABOUT YOU - Author Bio</p>
        <input name="author_name" value={form.author_name} onChange={handle} placeholder="Your Name *" required className="w-full border p-3 rounded-xl outline-none" />
        <input name="author_email" value={form.author_email} onChange={handle} placeholder="Your Email *" required type="email" className="w-full border p-3 rounded-xl outline-none" />
        <input name="author_website" value={form.author_website} onChange={handle} placeholder="Your Website / Blog URL - e.g. https://mera-blog.com *" required type="url" className="w-full border p-3 rounded-xl outline-none" />
        <textarea name="author_bio" value={form.author_bio} onChange={handle} placeholder="Your Bio - 1-2 line me apne baare me likho. e.g. Main Finance Blogger hu, 2 saal se SIP par likh raha hu. *" required rows={2} maxLength={200} className="w-full border p-3 rounded-xl outline-none resize-none" />
        <p className="text-xs text-gray-500 -mt-2">{form.author_bio.length}/200 • Ye Bio aapke blog ke neeche dikhega, usi me aapki Website ka link hoga.</p>

        <p className="font-bold text-sm pt-2">📝 BLOG DETAILS</p>
        <input name="title" value={form.title} onChange={handle} placeholder="Blog Title *" required className="w-full border p-3 rounded-xl outline-none" />
        <div className="flex flex-col sm:flex-row gap-3">
          <input name="slug" value={form.slug} onChange={handle} placeholder="slug-like-this" className="w-full sm:flex-1 border p-3 rounded-xl outline-none" />
          <select name="category" value={form.category} onChange={handle} className="w-full sm:w-[160px] border p-3 rounded-xl outline-none"><option>Finance</option><option>General</option><option>YouTube</option><option>AI Tools</option><option>Career</option><option>Study</option><option>Technology</option><option>Blogging & SEO</option><option>Business & Startup</option><option>Health & Fitness</option><option>Education</option><option>Travel</option><option>Food & Recipe</option><option>Sports & Cricket</option><option>Entertainment & Movies</option><option>Tools & Apps</option></select>
        </div>
        <textarea name="excerpt" value={form.excerpt} onChange={handle} placeholder="Short Description (SEO - 160 chars)" maxLength={160} rows={3} className="w-full border p-3 rounded-xl outline-none resize-none" />
        <input name="tags" value={form.tags} onChange={handle} placeholder="Tags - comma se alag karo" className="w-full border p-3 rounded-xl outline-none" />
        <input name="cover_image" value={form.cover_image} onChange={handle} placeholder="Cover Image URL (optional)" className="w-full border p-3 rounded-xl outline-none" />
        <textarea name="content" value={form.content} onChange={handle} placeholder="Poora blog yaha likho... (Min 300 characters)" rows={15} required className="w-full border p-3 rounded-xl outline-none text-[15px] leading-relaxed" />
        <p className="text-xs text-gray-500">Content: {form.content.length} characters</p>
        {msg && <p className="p-3 rounded-xl bg-gray-100 text-sm font-bold break-words">{msg}</p>}
        <button disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl">{loading ? "Submitting..." : "Submit Blog For Review →"}</button>
        <p className="text-center text-xs text-gray-500">Shuru me aapka link UGC rahega. Admin ke approve karne par DoFollow me badal jayega. Aap apne blog page par Status dekh sakte ho.</p>
      </form>
    </div>
  );
}
