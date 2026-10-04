"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const styles: any = {
  info: "from-blue-600 to-indigo-600",
  offer: "from-green-500 to-emerald-600",
  alert: "from-red-600 to-rose-600",
  warning: "from-amber-500 to-orange-500",
  premium: "from-zinc-900 to-black",
  diwali: "from-fuchsia-600 to-pink-600"
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
        idToSlug[s] = s; // slug to slug
      });

      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (!data) return;
      const valid = data.filter((b:any) => b.is_active!== false && (!b.expires_at || new Date(b.expires_at) > new Date()));

      const filtered = valid.filter((b:any) => {
        const raw = (b.target_tool || 'all').toLowerCase();
        if (raw === 'all') return true;
        if (!currentSlug) return false; // homepage par specific wala mat dikhao

        const targets = raw.split(',').map((s:string)=>s.trim()).filter(Boolean);
        // id ko slug me convert karo
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
        <div key={banner.id} className={`relative w-full bg-gradient-to-r ${styles[banner.type] || styles.info} text-white py-3 px-12 text-center border-b border-white/10`}>
          <button onClick={() => setBanners(p=>p.filter(x=>x.id!==banner.id))} className="absolute top-1 right-2 w-8 h-8 rounded-full bg-black/30 border border-white/30 font-bold">×</button>
          <span className="bg-white text-black text-[10px] px-2 py-0.5 rounded-full mr-2 font-bold">{banner.type}</span>
          <b>{banner.title}</b> — {banner.message}
        </div>
      ))}
    </div>
  );
}
