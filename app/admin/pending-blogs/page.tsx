"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function PendingBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending | approved | rejected

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("blogs").select("*").eq("is_deleted", false).eq("status", filter).order("created_at", { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: string, status: string) {
    const msg = status === "approved" ? "Is blog ko APPROVE karke live kar du?" : status === "rejected" ? "Is blog ko REJECT kar du?" : "Wapas PENDING me daal du?";
    if (!confirm(msg)) return;
    const { error } = await supabase.from("blogs").update({ status }).eq("id", id);
    if (error) alert("Error: " + error.message);
    else { alert(status === "approved" ? "✅ Approved! Ab site pe live hai!" : status === "rejected" ? "❌ Rejected!" : "Pending me daal diya!"); load(); }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Pakka delete karna hai? Ye wapas nahi aayega!")) return;
    const { error } = await supabase.from("blogs").update({ is_deleted: true }).eq("id", id);
    if (!error) { alert("Deleted!"); load(); }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📝 Blog Approval</h1>
          <p className="text-gray-600 mt-1">User ke bheje hue blog yahan aayenge. Tum approve karoge tabhi live honge!</p>
        </div>
        <Link href="/admin" className="text-sm bg-gray-100 px-4 py-2 rounded-full">← Back to Admin</Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mt-6">
        {["pending", "approved", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-sm font-semibold capitalize border ${filter === f ? "bg-black text-white" : "bg-white"}`}>
            {f === "pending" ? "⏳ Pending" : f === "approved" ? "✅ Approved" : "❌ Rejected"}
          </button>
        ))}
        <Link href="/blog" target="_blank" className="ml-auto text-sm text-orange-600 font-semibold pt-2">View Live Blog →</Link>
      </div>

      {loading ? <p className="py-10 text-center">Loading...</p> : blogs.length === 0 ? (
        <div className="text-center py-16 bg-[#fffaf0] rounded-2xl mt-6 border">
          <div className="text-5xl">🎉</div>
          <p className="font-bold mt-3">Koi {filter} blog nahi hai!</p>
          <p className="text-sm text-gray-500">Jab koi user blog likhega to yahan aa jayega.</p>
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {blogs.map(b => (
            <div key={b.id} className="bg-white border rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">{b.category || "General"}</span>
                  <h2 className="font-bold text-xl mt-2">{b.title}</h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{b.excerpt}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    By <b>{b.author_name || "Admin"}</b> ({b.author_email || "no email"}) • {new Date(b.created_at).toLocaleString("en-IN")} • {b.content?.length} chars
                  </p>
                  {/* Full Content Preview */}
                  <details className="mt-3">
                    <summary className="text-sm text-orange-600 cursor-pointer font-semibold">Full Blog Padho ↓</summary>
                    <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-xl mt-2 max-h-[300px] overflow-auto">{b.content}</p>
                  </details>
                </div>
                {b.cover_image && <img src={b.cover_image} className="w-[120px] h-[80px] object-cover rounded-xl hidden md:block" />}
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                {filter !== "approved" && (
                  <button onClick={() => updateStatus(b.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold">✅ Approve & Publish</button>
                )}
                {filter !== "rejected" && (
                  <button onClick={() => updateStatus(b.id, "rejected")} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">❌ Reject</button>
                )}
                {filter !== "pending" && (
                  <button onClick={() => updateStatus(b.id, "pending")} className="bg-gray-200 px-4 py-2 rounded-full text-sm font-semibold">⏳ Back to Pending</button>
                )}
                <Link href={`/blog/${b.slug}`} target="_blank" className="bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold">👁️ Preview</Link>
                <button onClick={() => deleteBlog(b.id)} className="bg-gray-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
