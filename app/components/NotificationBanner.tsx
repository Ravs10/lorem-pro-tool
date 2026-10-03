"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function NotificationBanner({ toolSlug }: { toolSlug: string }) {
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data } = await supabase.from("notifications").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (data) {
        const now = new Date();
        const filtered = data.filter((n: any) => {
          // Expiry check
          if (n.expires_at && new Date(n.expires_at) < now) return false;
          // Target check
          return n.target_tool === "all" || n.target_tool === toolSlug;
        });
        setNotifs(filtered);
      }
    };
    fetchNotifs();
  }, [toolSlug]);

  if (!notifs.length) return null;

  return (
    <div className="space-y-2 my-3">
      {notifs.map((n: any) => (
        <div key={n.id} className={`p-3 rounded-xl text-sm font-medium flex justify-between items-center border ${n.type === 'offer'? 'bg-green-50 border-green-300 text-green-800' : n.type === 'alert'? 'bg-red-50 border-red-300 text-red-800' : 'bg-blue-50 border-blue-300 text-blue-800'}`}>
          <div><b>{n.title}:</b> {n.message} {n.expires_at && <span className="text-xs opacity-70 ml-2">(Valid till {new Date(n.expires_at).toLocaleDateString()})</span>}</div>
          <button onClick={(e)=> e.currentTarget.parentElement!.remove()} className="ml-3 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}
