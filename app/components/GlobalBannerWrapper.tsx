"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const styles: any = {
  info: "from-blue-600 via-indigo-600 to-violet-600",
  offer: "from-emerald-500 via-green-500 to-teal-600",
  alert: "from-red-600 via-rose-600 to-pink-600",
  warning: "from-amber-500 via-orange-500 to-red-500",
  premium: "from-zinc-800 via-black to-zinc-900",
  diwali: "from-fuchsia-600 via-pink-600 to-purple-600"
};

const icons: any = {
  info: "💡",
  offer: "🎉",
  alert: "🚨",
  warning: "⚠️",
  premium: "👑",
  diwali: "🪔"
};

export default function GlobalBannerWrapper() {
  const [banners, setBanners] = useState<any[]>([]);
  const pathname = usePathname();
  const currentSlug = (pathname?.split('/')[1] || '').toLowerCase().trim();

  useEffect(() => {
    (async () => {
      const { data: tools } = await supabase.from("tools").select("id,slug");
      const idToSlug: any = {};
      (tools || []).forEach((t:any)=>{
        const s = (t.slug||"").toLowerCase().trim();
        if(s) idToSlug[String(t.id).toLowerCase()] = s;
        idToSlug[s] = s;
      });

      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (!data) return;
      const valid = data.filter((b:any) => b.is_active!== false && (!b.expires_at || new Date(b.expires_at) > new Date()));

      const filtered = valid.filter((b:any) => {
        const raw = (b.target_tool || 'all').toLowerCase();
        if (raw === 'all') return true;
        if (!currentSlug) return false;

        const targets = raw.split(',').map((s:string)=>s.trim()).filter(Boolean);
        const expanded = targets.map((t:string)=> idToSlug[t] || t);
        return expanded.some((t:string)=> t && (currentSlug === t || currentSlug.includes(t) || t.includes(currentSlug)));
      });
      setBanners(filtered);
    })();
  }, [currentSlug]);

  if (!banners.length) return null;
  return (
    <div className="w-full flex flex-col">
      {banners.map((banner:any) => (
        <div
          key={banner.id}
          className={`relative w-full bg-gradient-to-r ${styles[banner.type] || styles.info} bg-[length:300%_100%] animate-gradient text-white py-3.5 px-12 text-center border-b border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] overflow-hidden group`}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shine" />

          {/* Glowing dots */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1 left-[10%] w-1 h-1 bg-white rounded-full animate-ping" />
            <div className="absolute bottom-1 left-[30%] w-1 h-1 bg-white rounded-full animate-ping delay-700" />
            <div className="absolute top-2 right-[20%] w-1 h-1 bg-white rounded-full animate-ping delay-300" />
          </div>

          <button
            onClick={() => setBanners(p=>p.filter(x=>x.id!==banner.id))}
            className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm border border-white/30 font-bold hover:bg-black/40 hover:rotate-90 transition-all duration-300 z-20"
          >×</button>

          <div className="relative z-10 flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-white text-black text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-md animate-pulseBadge">
              {banner.type}
            </span>
            <span className="text-base animate-bounceIcon">{icons[banner.type] || "✨"}</span>
            <b className="font-extrabold tracking-wide">{banner.title}</b>
            <span className="opacity-90 font-medium">— {banner.message}</span>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shineMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulseBadge {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
          50% { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(255,255,255,0); }
        }
        @keyframes bounceIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
       .animate-gradient {
          animation: gradientMove 4s ease infinite;
        }
       .animate-shine {
          animation: shineMove 3s ease-in-out infinite;
        }
       .animate-pulseBadge {
          animation: pulseBadge 1.8s ease-in-out infinite;
        }
       .animate-bounceIcon {
          animation: bounceIcon 1.2s ease-in-out infinite;
        }
       .group:hover.animate-gradient {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
