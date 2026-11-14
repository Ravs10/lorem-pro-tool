"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function ClosedContent() {
  const search = useSearchParams();
  const slug = search.get("slug") || search.get("tool") || "";
  const [tool, setTool] = useState(null);
  const [left, setLeft] = useState("");
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!slug) { setTried(true); return; }
    (async () => {
      const clean = String(slug).trim().toLowerCase().replace(/^\/+/, "").replace(/^tools\//, "");
      // 1st try - exact slug
      let { data } = await supabase.from("tools").select("*").eq("slug", clean).maybeSingle();
      // 2nd try - original slug
      if (!data) { const r2 = await supabase.from("tools").select("*").eq("slug", slug).maybeSingle(); data = r2.data; }
      // 3rd try - agar phir bhi nahi mila to fallback banao, Loading pe mat atko
      if (!data) {
        data = { name: clean.replace(/-/g, " ").toUpperCase() || "Tool", slug: clean, public_reason: "Maintenance chal raha hai. Thodi der baad try karo.", public_auto_on_at: null };
      }
      setTool(data);
      setTried(true);
    })();
  }, [slug]);

  useEffect(() => {
    if (!tool?.public_auto_on_at) return;
    const tick = () => {
      const diff = new Date(tool.public_auto_on_at).getTime() - Date.now();
      if (diff <= 0) { window.location.reload(); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${h > 0 ? h + "h " : ""}${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tool]);

  if (!tried || !tool) return <div className="min-h-screen flex items-center justify-center"><p className="font-bold animate-pulse">Loading... {slug}</p></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md text-center shadow-2xl">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">{tool?.name || "Tool"} Temporarily Closed</h1>
        <p className="text-gray-600 text-sm mb-4">{tool?.public_reason || "Maintenance chal raha hai. Thodi der baad try karo."}</p>
        {tool?.public_auto_on_at ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-red-500">AUTO RE-OPEN IN</p>
            <p className="text-2xl font-bold text-red-600">{left || "Calculating..."}</p>
            <p className="text-[11px] text-gray-500 mt-1">Auto ON: {new Date(tool.public_auto_on_at).toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold text-red-600">Closed Forever - Manual ON Hoga</p>
          </div>
        )}
        <button onClick={() => window.location.reload()} className="w-full bg-black text-white p-4 rounded-2xl font-bold mb-2">🔄 Check Again</button>
        <a href="/" className="block w-full bg-gray-100 p-4 rounded-2xl font-bold text-sm">🏠 Home Jao</a>
        <p className="text-[10px] text-gray-400 mt-2">Slug: {slug}</p>
      </div>
    </div>
  );
}

export default function ToolClosedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <ClosedContent />
    </Suspense>
  );
}
