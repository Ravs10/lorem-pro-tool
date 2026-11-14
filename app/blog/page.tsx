"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function BlogList() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") || ""; // ?tag=sip se aayega

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("blogs").select("*").eq("status", "approved").eq("is_deleted", false).order("created_at", { ascending: false });
      setBlogs(data || []);
    })();
  }, []);

  // Jab tag URL se aaye to search clear kar do taaki tag wala filter sahi chale
  useEffect(() => {
    if (tag) { setSearch(""); setCat("All"); }
  }, [tag]);

  const cats = ["All", ...new Set(blogs.map(b => b.category || "General"))];

  // ✅ TAG FILTER - YAHIN LAGAYA
  const filtered = blogs.filter(b =>
    (cat === "All" || (b.category || "General") === cat) &&
    (b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt?.toLowerCase().includes(search.toLowerCase())) &&
    (!tag || (b.tags || "").toLowerCase().includes(tag.toLowerCase()))
  );

  // Popular Tags - Upar dikhane ke liye
  const allTags = [...new Set(blogs.flatMap(b => (b.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean)))].slice(0, 10);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold">Our Blog</h1>
          <p className="text-gray-600 mt-1">Tips, Guides & Free Tools - By Admin & Our Community</p>
        </div>
        <Link href="/blog/write" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-semibold shadow">✍️ Write a Blog</Link>
      </div>

      {/* ✅ TAG ACTIVE BANNER - Jab kisi tag pe click karke aayega to ye dikhega */}
      {tag && (
        <div className="bg-orange-100 border border-orange-200 rounded-full px-4 py-2.5 flex justify-between items-center mb-4">
          <p className="text-sm font-bold">🏷️ Showing blogs for Tag: <span className="text-orange-700">#{tag}</span> ({filtered.length} found)</p>
          <Link href="/blog" className="text-sm bg-black text-white px-3 py-1 rounded-full">✕ Clear</Link>
        </div>
      )}

      {/* Search + Category */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search blog... e.g. SIP, YouTube..." className="w-full border p-3 rounded-xl mb-4 outline-none focus:ring-2 ring-orange-300" />
      <div className="flex gap-2 flex-wrap mb-3">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full text-sm border ${cat === c ? "bg-black text-white" : "bg-white"}`}>{c}</button>
        ))}
      </div>

      {/* ✅ POPULAR TAGS - Blogger Jaisa Tag Cloud */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8 items-center">
          <span className="text-sm font-bold">🏷️ Popular:</span>
          {allTags.map(t => (
            <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className={`px-3 py-1 rounded-full text-xs border ${tag.toLowerCase() === t.toLowerCase() ? "bg-orange-500 text-white border-orange-500 font-bold" : "bg-white hover:bg-orange-50"}`}>#{t}</Link>
          ))}
        </div>
      )}

      {/* Featured - Tag filter pe Featured mat dikhao, seedha list dikhao */}
      {featured && search === "" && cat === "All" && !tag && (
        <Link href={`/blog/${featured.slug}`} className="block bg-[#fffaf0] border rounded-2xl overflow-hidden mb-8 hover:shadow-lg transition">
          {featured.cover_image && <img src={featured.cover_image} className="w-full h-[280px] object-cover" />}
          <div className="p-6">
            <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">⭐ FEATURED • {featured.category || "General"}</span>
            <h2 className="text-3xl font-bold mt-3">{featured.title}</h2>
            <p className="text-gray-600 mt-2 line-clamp-2">{featured.excerpt}</p>
            <p className="text-sm text-gray-500 mt-3">By {featured.author_name || "Admin"} • {new Date(featured.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} • {Math.max(1, Math.ceil((featured.content?.length || 500) / 1000))} min read</p>
            {/* Featured me bhi Tags */}
            {featured.tags && <p className="text-xs mt-2 text-gray-500">{featured.tags.split(",").map((t: string) => `#${t.trim()} `)}</p>}
          </div>
        </Link>
      )}

      {/* Grid - Tag filter pe sab dikhao, nahi to rest */}
      <div className="grid md:grid-cols-3 gap-5">
        {(tag ? filtered : rest).map(b => (
          <Link key={b.id} href={`/blog/${b.slug}`} className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition">
            {b.cover_image ? <img src={b.cover_image} className="w-full h-[170px] object-cover" /> : <div className="h-[170px] bg-orange-50 flex items-center justify-center text-5xl">📝</div>}
            <div className="p-4">
              <span className="text-[11px] bg-gray-100 px-2 py-1 rounded-full">{b.category || "General"}</span>
              <h3 className="font-bold text-lg mt-2 line-clamp-2 leading-snug">{b.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{b.excerpt}</p>
              {/* ✅ Har Card Pe Tags */}
              {b.tags && (
                <p className="text-[11px] text-orange-600 mt-2 truncate">{b.tags.split(",").map((t: string) => `#${t.trim()} `)}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">By {b.author_name || "Admin"} • {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Koi blog nahi mila {tag ? `Tag #${tag} ke liye` : ""}. Pehla blog tum likho! ✍️</p>
          {tag && <Link href="/blog" className="inline-block mt-3 bg-black text-white px-5 py-2 rounded-full text-sm">All Blogs Dekho</Link>}
        </div>
      )}
    </div>
  );
}

// Suspense isliye chahiye kyunki useSearchParams Next.js me aise hi chalta hai
export default function BlogPage() {
  return (
    <Suspense fallback={<p className="text-center py-20">Loading blogs...</p>}>
      <BlogList />
    </Suspense>
  );
}
