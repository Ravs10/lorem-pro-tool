'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function ToolsPage(){
 const [tools, setTools] = useState<any[]>([])
 useEffect(()=>{ getTools() },[])
 async function getTools(){
  const {data} = await supabase.from('tools_control').select('*')
  if(data) setTools(data)
 }
 async function toggle(id:any, active:boolean){
  await supabase.from('tools_control').update({is_active: !active}).eq('id', id)
  getTools()
 }
 return(
  <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-4 text-white">
   <h1 className="text-2xl font-bold mb-4">🛠️ Tools ON/OFF Control</h1>
   <div className="space-y-3">
    {tools.map(t=>(
     <div key={t.id} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 flex justify-between">
      <p>{t.name} - {t.slug}</p>
      <button onClick={()=>toggle(t.id, t.is_active)} className={`${t.is_active?'bg-green-500':'bg-red-500'} px-4 py-1 rounded-full text-xs font-bold`}>{t.is_active?'ON':'OFF'}</button>
     </div>
    ))}
   </div>
  </div>
 )
}
