"use client"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AllTools(){
  const [tools,setTools]=useState<any[]>([])

  useEffect(()=>{
    const fetchTools=async()=>{
      const {data} = await supabase.from("tools").select("*").eq("is_active", true).order("id", {ascending: true})
      setTools(data || [])
    }
    fetchTools()
  },[])

  // ✅ FINAL FIX - Slug chahe kaisa bhi ho, hamesha /tools/slug banega
  function getLink(slug: string | null){
    if(!slug) return "/tools"
    let s = String(slug).trim()
    if(!s) return "/tools"
    // Agar slug me /admin hai to wo Tool nahi hai
    if(s.includes("admin")) return "/tools"
    // Aage ka / hatao
    s = s.replace(/^\/+/,"")
    // Agar pehle se tools/ likha hai to dobara mat lagao
    s = s.replace(/^tools\//,"")
    // Aakhir me / hatao
    s = s.replace(/\/+$/,"")
    if(!s) return "/tools"
    return `/tools/${s}`
  }

  return(
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-[20px] p-[1.5px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_30px_rgba(249,115,22,0.3)] mb-8">
          <div className="rounded-[18px] bg-zinc-950 p-6">
            <h1 className="text-3xl font-extrabold flex items-center gap-3">🔥 All Tools <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span></h1>
            <p className="text-zinc-400 text-sm mt-2">Admin Panel se ON/OFF hota hai — jo ON hoga wahi yaha dikhega</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
          {tools.map(t=>(
            <Link key={t.id} href={getLink(t.slug)}>
              <div className="group h-full p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500 hover:bg-zinc-900/80 transition-all hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors">{t.name}</h3>
                <p className="text-zinc-500 text-[13px] mt-1 line-clamp-2">{t.description || t.desc || "Use this tool for free"}</p>
                <p className="text-[10px] text-zinc-600 mt-2">Link: {getLink(t.slug)}</p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-bold">OPEN →</span>
              </div>
            </Link>
          ))}
        </div>

        {tools.length===0 && <p className="text-center text-zinc-500 mt-20">No tools enabled from Admin Panel</p>}

        <div className="mt-10 text-center">
          <Link href="/" className="text-orange-400 text-sm hover:text-white">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
