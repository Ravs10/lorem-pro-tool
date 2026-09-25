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
    const fetch=async()=>{
        const {data}=await supabase.from("tools").select("*").eq("is_active",true)
      setTools(data||[])
    }
    fetch()
  },[])

  return(
    <div style={{padding:20, maxWidth:900, margin:"auto"}}>
      <h1 style={{fontSize:28, fontWeight:"bold"}}>🛠️ All Tools</h1>
      <p>Admin Panel se ON/OFF hota hai - bina deploy ke!</p>
      
      <div style={{marginTop:20, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:16}}>
        {tools.map(t=>(
          <Link key={t.id} href={t.slug==='lorem-ipsum-generator' ? '/' : `/${t.slug}`} style={{textDecoration:"none"}}>
            <div style={{border:"1px solid #ddd", borderRadius:12, padding:16, background:"#fff", boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <h3 style={{margin:0, color:"#000"}}>{t.name}</h3>
              <p style={{fontSize:13, color:"#666", marginTop:6}}>{t.slug}</p>
              <span style={{display:"inline-block", marginTop:10, padding:"4px 10px", background:"#16a34a", color:"#fff", borderRadius:20, fontSize:12}}>LIVE ✓</span>
            </div>
          </Link>
        ))}
      </div>

      {tools.length===0 && <p style={{marginTop:20, color:"red"}}>Koi tool ON nahi hai! Admin me jaake ON karo.</p>}

      <div style={{marginTop:30}}>
        <Link href="/" style={{color:"blue"}}>← Back to Home</Link>
      </div>
    </div>
  )
}
