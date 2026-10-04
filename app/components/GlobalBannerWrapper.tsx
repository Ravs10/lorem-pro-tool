"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const [banners, setBanners] = useState<any[]>([]);
  const pathname = usePathname();
  const currentSlug = pathname?.split('/')[1] || '';

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (!data) return;
      // filter expired
      const valid = data.filter((b:any) =>!b.expires_at || new Date(b.expires_at) > new Date());

      // filter by current tool
      const filtered = valid.filter((b:any) => {
        if (!b.target_tool) return true;
        if (b.target_tool === 'all') return true;
        const targets = b.target_tool.split(',').map((s:string)=>s.trim());
        return targets.includes(currentSlug) || targets.includes('all') || currentSlug === '' ;
      });
      setBanners(filtered);
    })();
  }, [currentSlug]);

  if (!banners.length) return null;

  return (
    <div className="w-full flex flex-col">
      {banners.map((banner:any) => {
        const bg = styles[banner.type] || styles.info;
        return (
          <div key={banner.id} className={`relative w-full bg-gradient-to-r ${bg} text-white py-3.5 px-12 text-center shadow-lg`}>
            <button onClick={() => setBanners(p=>p.filter(x=>x.id!==banner.id))} className="absolute top-2 right-2 z-50 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur border border-white/30 flex items-center justify-center text-white font-bold text-lg leading-none">×</button>
            <div className="flex items-center justify-center gap-2 text-[14px] font-bold flex-wrap pr-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black uppercase">{banner.type}</span>
              <span>{banner.title}</span>
              <span className="opacity-70">—</span>
              <span className="font-medium">{banner.message}</span>
            </div>
          </div>
        )
      })}
    </div>
  );
}
