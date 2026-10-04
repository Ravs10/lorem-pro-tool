"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GlobalBannerWrapper() {
  const [banner, setBanner] = useState<any>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
       .from("notifications")
       .select("*")
       .order("created_at", { ascending: false })
       .limit(5);
      if (!data) return;
      const now = new Date();
      const valid = data.find((b: any) => {
        if (b.is_active === false) return false;
        if (!b.expires_at) return true;
        return new Date(b.expires_at) > now;
      });
      if (valid) setBanner(valid);
    };
    fetchBanner();
  }, []);

  if (!banner) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      `}</style>

      <div className="relative w-full overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white py-3 px-4 text-center shadow-[0_4px_20px_rgba(124,58,237,0.4)]">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{animation:'shimmer 2.5s infinite'}}></div>
        </div>

        <div className="relative flex items-center justify-center gap-2 md:gap-3 flex-wrap text-sm md:text-[15px] font-bold tracking-wide">
          <span className="animate-[float_2s_ease-in-out_infinite] text-lg">🔥</span>

          <span className="px-2.5 py-0.5 rounded-full bg-white text-violet-700 text-[10px] font-black tracking-widest uppercase animate-pulse">
            NEW
          </span>

          <span className="drop-shadow-sm">{banner.title}</span>
          <span className="hidden md:inline opacity-60">—</span>
          <span className="font-medium opacity-95">{banner.message}</span>

          <span className="animate-[float_2s_ease-in-out_infinite] text-lg">✨</span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setBanner(null)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white transition"
        >
          ✕
        </button>

        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-300 via-pink-300 to-yellow-300"></div>
      </div>
    </>
  );
}
