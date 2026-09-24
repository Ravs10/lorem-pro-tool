"use client"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ToolsControl(){
  const [tools,setTools]=useState<any[]>([])
  const [loading,setLoading]=useState(true)

  const fetchTools=async()=>{
    const {data} = await supabase.from("tools_control").select("*").order("id")
    setTools(data||[])
    setLoading(false)
  }

  useEffect(()=>{fetchTools()},[])

  const toggle=async(id:string, status:boolean)=>{
    await supabase.from("tools_control").update({is_active:!status}).eq("id",id)
    fetchTools()
  }

  if(loading) return <div style={{padding:20}}>Loading...</div>

  return(
    <div style={{padding:20, maxWidth:600, margin:"auto"}}>
      <h1 style={{fontSize:24, fontWeight:"bold"}}>🛠️ Tools Control Panel</h1>
      <p>ON/OFF karo - bina deploy ke!</p>
      <div style={{marginTop:20, display:"grid", gap:12}}>
        {tools.map(t=>(
          <div key={t.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:12, border:"1px solid #ddd", borderRadius:8, background: t.is_active ? "#f0fdf4" : "#fef2f2"}}>
            <div>
              <b>{t.name}</b><br/>
              <small>{t.slug}</small>
            </div>
            <button 
              onClick={()=>toggle(t.id, t.is_active)}
              style={{padding:"6px 14px", borderRadius:6, border:"none", color:"#fff", background: t.is_active ? "#16a34a" : "#dc2626", cursor:"pointer"}}
            >
              {t.is_active ? "ON" : "OFF"}
            </button>
          </div>
        ))}
      </div>
      <a href="/" style={{display:"block", marginTop:20, color:"blue"}}>← Back to Home</a>
    </div>
  )
}
