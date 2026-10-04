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
  info: "💡", offer: "🎉", alert: "🚨", warning: "⚠️", premium: "👑", diwali: "🪔"
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
          className={`relative w-full bg-gradient-to-r ${styles[banner.type] || styles.info} bg-[length:300%_100%] animate-gradient text-white py-2.5 px-3 pr-11 text-center border-b border-white/20 shadow-md overflow-hidden`}
        >
          {/* Shine */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shine" />

          {/* X - Top Right Corner Fixed */}
          <button
            onClick={() => setBanners(p=>p.filter(x=>x.id!==banner.id))}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/30 border border-white/40 text-white font-bold text-sm leading-none flex items-center justify-center hover:bg-black/50 hover:rotate-90 transition-all duration-300 z-20"
          >×</button>

          <div className="relative z-10 flex items-center justify-center gap-1.5 flex-wrap text-[14px] leading-tight">
            <span className="bg-white text-black text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulseBadge">
              {banner.type}
            </span>
            <span className="animate-bounceIcon">{icons[banner.type] || "✨"}</span>
            {/* Blink Animation Added */}
            <b className="font-extrabold animate-blink">{banner.title}</b>
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
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes bounceIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes blinkText {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.4; }
        }
       .animate-gradient { animation: gradientMove 4s ease infinite; }
       .animate-shine { animation: shineMove 3s ease-in-out infinite; }
       .animate-pulseBadge { animation: pulseBadge 1.5s ease-in-out infinite; }
       .animate-bounceIcon { animation: bounceIcon 1s ease-in-out infinite; }
       .animate-blink { animation: blinkText 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
