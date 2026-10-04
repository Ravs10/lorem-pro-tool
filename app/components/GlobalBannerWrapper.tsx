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
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.log("Banner error:", error.message);
        return;
      }
      if (!data || data.length === 0) return;

      const now = new Date();
      // Sabse naya valid banner nikalo
      const valid = data.find((b: any) => {
        if (!b.is_active && b.is_active !== undefined) return false;
        if (!b.expires_at) return true; // agar expiry null hai to hamesha dikhao
        return new Date(b.expires_at) > now;
      });

      if (valid) setBanner(valid);
    };
    fetchBanner();
  }, []);

  if (!banner) return null;

  const bg = banner.type === "offer" ? "bg-green-600" : banner.type === "alert" ? "bg-red-600" : "bg-black";

  return (
    <div className={`${bg} text-white text-center py-2.5 px-4 text-sm font-bold`}>
      🚀 {banner.title} - {banner.message}
      <button onClick={() => setBanner(null)} className="ml-3 text-white/70 text-xs">✕</button>
    </div>
  );
}
