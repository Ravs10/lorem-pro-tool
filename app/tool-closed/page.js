"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function ClosedContent() {
  const slug = useSearchParams().get("slug");
  const [tool, setTool] = useState(null);
  const [left, setLeft] = useState("");

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase.from("tools").select("*").eq("slug", slug).single();
      if (data) setTool(data);
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

  if (!tool) return <div className="min-h-screen flex items-center justify-center"><p className="font-bold animate-pulse">Loading...</p></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md text-center shadow-2xl">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">{tool?.name || "Tool"} Temporarily Closed</h1>
        <p className="text-gray-600 text-sm mb-4">{tool?.public_reason || "Maintenance chal raha hai. Thodi der baad try karo."}</p>
        {tool?.public_auto_on_at ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-red-500">AUTO RE-OPEN IN</p>
            <p className="text-2xl font-bold text-red-600">{left}</p>
            <p className="text-[11px] text-gray-500 mt-1">Auto ON: {new Date(tool.public_auto_on_at).toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold text-red-600">Closed Forever - Manual ON Hoga</p>
          </div>
        )}
        <button onClick={() => window.location.reload()} className="w-full bg-black text-white p-4 rounded-2xl font-bold mb-2">🔄 Check Again</button>
        <a href="/" className="block w-full bg-gray-100 p-4 rounded-2xl font-bold text-sm">🏠 Home Jao</a>
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
