"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ToolClosed from "@/components/ToolClosed";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function ClosedContent() {
  const slug = useSearchParams().get("slug");
  const [tool, setTool] = useState(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase.from("tools").select("*").eq("slug", slug).single();
      if (data) setTool(data);
    })();
  }, [slug]);

  if (!tool) return <div className="min-h-screen flex items-center justify-center"><p className="font-bold animate-pulse">Loading...</p></div>;

  return <ToolClosed tool={tool} />;
}

export default function ToolClosedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <ClosedContent />
    </Suspense>
  );
}
