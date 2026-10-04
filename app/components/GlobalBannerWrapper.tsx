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
  const currentSlug = (pathname?.split('/')[1] || '').toLowerCase();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (!data) return;
      const valid = data.filter((b:any) =>!b.expires_at || new Date(b.expires_at) > new Date());
      const filtered = valid.filter((b:any) => {
        const target = (b.target_tool || 'all').toLowerCase();
        if (target === 'all') return true;
        if (!currentSlug) return true; // homepage pe all
        return target.split(',').map((s:string)=>s.trim()).some((s:string) => currentSlug.includes(s) || s.includes(currentSlug));
      });
      setBanners(filtered);
    })();
  }, [currentSlug]);

  if (!banners.length) return null;
  return (
    <div className="w-full">
      {banners.map((banner:any) => (
        <div key={banner.id} className={`relative w-full bg-gradient-to-r ${styles[banner.type] || styles.info} text-white py-3 px-12 text-center`}>
          <button onClick={() => setBanners(p=>p.filter(x=>x.id!==banner.id))} className="absolute top-1 right-2 w-8 h-8 rounded-full bg-black/30 border border-white/30 font-bold">×</button>
          <span className="bg-white text-black text-[10px] px-2 py-0.5 rounded-full mr-2">{banner.type}</span>
          <b>{banner.title}</b> — {banner.message}
        </div>
      ))}
    </div>
  );
}
