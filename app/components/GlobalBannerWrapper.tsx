"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const styles: any = {
  info: "from-blue-600 via-indigo-600 to-violet-600",
  offer: "from-green-500 via-emerald-600 to-teal-600",
  alert: "from-red-600 via-rose-600 to-pink-600",
  warning: "from-amber-500 via-orange-500 to-yellow-500",
  premium: "from-zinc-900 via-neutral-800 to-black border border-yellow-500/50",
  diwali: "from-fuchsia-600 via-purple-600 to-pink-600"
};

export default function GlobalBannerWrapper() {
  const [banner, setBanner] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!data) return;
      // expiry check
      if (data.expires_at && new Date(data.expires_at) < new Date()) return;
      setBanner(data);
    })();
  }, []);

  if (!banner) return null;
  const bg = styles[banner.type] || styles.info;

  return (
    <div className={`relative w-full bg-gradient-to-r ${bg} text-white py-3.5 px-12 text-center shadow-lg animate-pulse`}>
      {/* X - Top Right Corner Fixed */}
      <button
        onClick={() => setBanner(null)}
        className="absolute top-2 right-2 z-50 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur border border-white/30 flex items-center justify-center text-white font-bold text-lg leading-none"
      >
        ×
      </button>

      <div className="flex items-center justify-center gap-2 text-[14px] md:text-[15px] font-bold leading-snug flex-wrap pr-2">
        <span>🔥</span>
        <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black tracking-widest uppercase">NEW</span>
        <span>{banner.title}</span>
        <span className="opacity-70">—</span>
        <span className="font-medium">{banner.message}</span>
        <span>✨</span>
      </div>
    </div>
  );
}
