"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ToolClosed from "@/components/ToolClosed";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function ClosedContent() {
  const slug = useSearchParams().get("slug");
  const [tool, setTool] = useState<any>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase.from("tools").select("*").eq("slug", slug).single().then(({ data }) => {
      if (data) {
        setTool(data);
        if (data.public_auto_on_at) setRemaining(new Date(data.public_auto_on_at).getTime() - Date.now());
      }
    });
  }, [slug]);

  // Timer
  useEffect(() => {
    if (!tool?.public_auto_on_at) return;
    const t = setInterval(() => {
      const left = new Date(tool.public_auto_on_at).getTime() - Date.now();
      if (left <= 0) { window.location.href = "/" + slug; return; }
      setRemaining(left);
    }, 1000);
    return () => clearInterval(t);
  }, [tool]);

  if (!tool) return <div className="p-10 text-center">Loading...</div>;
  return <ToolClosed tool={tool} remaining={remaining} />;
}

export default function Page() {
  return <Suspense><ClosedContent /></Suspense>;
}
