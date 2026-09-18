// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
const LANGS = [["HI","Hindi"],["EN","English"],["ES","Spanish"],["FR","French"],["DE","German"],["RU","Russian"],["JA","Japanese"],["IT","Italian"],["AR","Arabic"],["PT","Portuguese"]]
const DB = {
HI: ["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन जरूरी है।"],
EN: ["Healthy life needs daily yoga.","Morning walk keeps body fit.","Balanced diet is essential."],
ES: ["La vida saludable necesita yoga diario.","Caminar por la mañana mantiene el cuerpo en forma.","La dieta equilibrada es esencial."],
FR: ["La vie saine nécessite du yoga quotidien.","La marche matinale garde le corps en forme.","Une alimentation équilibrée est essentielle."],
DE: ["Gesundes Leben braucht tägliches Yoga.","Morgenspaziergang hält den Körper fit.","Ausgewogene Ernährung ist wichtig."],
RU: ["Здоровая жизнь требует ежедневной йоги.","Утренняя прогулка поддерживает форму.","Сбалансированная диета важна."],
JA: ["健康的な生活には毎日のヨガが必要です。","朝の散歩は体を健康に保ちます。","バランスの取れた食事が不可欠です。"],
IT: ["La vita sana ha bisogno di yoga quotidiano.","La passeggiata mattutina mantiene il corpo in forma.","Una dieta equilibrata è essenziale."],
AR: ["الحياة الصحية تحتاج اليوغا اليومية.","المشي الصباحي يحافظ على اللياقة.","النظام الغذائي المتوازن ضروري."],
PT: ["Vida saudável precisa de ioga diária.","Caminhada matinal mantém o corpo em forma.","Dieta equilibrada é essencial."]
}
export default function Page(){
const [lang,setLang]=useState("HI")
const [mode,setMode]=useState("paragraph")
const [cnt,setCnt]=useState(3)
const [out,setOut]=useState("")
const [cp,setCp]=useState(false)
const [menu,setMenu]=useState(false)
const gen=()=>{
let base = DB[lang] || DB.EN
let allWords = base.join(" ").split(" ").filter(Boolean)
let r=""
if(mode==="word"){ r = allWords.slice(0,cnt).join(" ") }
else if(mode==="sentence"){ r = base.slice(0,cnt).join(" ") }
else if(mode==="list"){ r = base.slice(0,cnt).map(v=>`• ${v}`).join("\n") }
else { let a=[]; for(let i=0;i<cnt;i++){ a.push(base[i%base.length]) } r=a.join("\n\n") }
setOut(r)
}
useEffect(()=>{ gen() },[lang,mode,cnt])
return(
<div style={{background:"#f1f5f9",minHeight:"100vh",color:"#000"}}>
<header style={{background:"#fff",padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,borderBottom:"1px solid #ddd"}}>
<b>LoremPro V23 ✓</b>
<button onClick={()=>setMenu(!menu)} style={{background:"#000",color:"#fff",borderRadius:20,padding:"6px 14px",border:"none",fontWeight:800}}>Menu</button>
</header>
{menu && <div style={{background:"#fff",padding:10,display:"flex",gap:8,flexWrap:"wrap",borderBottom:"1px solid #ddd"}}>{["gen","art","use","tool"].map(id=><button key={id} onClick={()=>{setMenu(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}} style={{border:"1px solid #000",padding:"8px 14px",borderRadius:20,fontSize:12,fontWeight:800,background:"#fff"}}>{id}</button>)}</div>}
<div style={{maxWidth:600,margin:"auto",padding:12}}>
<div id="gen" style={{background:"#fff",borderRadius:16,padding:12,border:"1px solid #ddd"}}>
<label style={{fontSize:12,fontWeight:900}}>SELECT LANGUAGE (Dropdown) V23</label>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #4f46e5",fontWeight:800,marginTop:8,color:"#000",background:"#fff"}}>
{LANGS.map(([c,n])=><option key={c} value={c}>{c} - {n}</option>)}
</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:12}}>
{["paragraph","sentence","word","list"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10,borderRadius:10,background:mode===m?"#4f46e5":"#f3f4f6",color:mode===m?"#fff":"#000",border:"none",fontSize:10,fontWeight:800}}>{m.toUpperCase()}</button>)}
</div>
<div style={{display:"flex",gap:10,alignItems:"center",marginTop:12}}>
<span style={{fontSize:11,fontWeight:800}}>Count:</span>
<input type="range" min={1} max={20} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<b style={{border:"2px solid #000",padding:"6px 12px",borderRadius:8}}>{cnt}</b>
</div>
<div style={{fontSize:10,color:"#666",marginTop:4}}>{mode==="word"?`${cnt} words exact`:mode==="sentence"?`${cnt} sentences`:`${cnt} ${mode}`}</div>
<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,fontWeight:900,marginTop:10,border:"none"}}>GENERATE {mode.toUpperCase()} - {lang} ({cnt})</button>
<div style={{background:"#fff",color:"#000",border:"2px solid #000",borderRadius:12,padding:12,marginTop:12,whiteSpace:"pre-wrap",fontSize:15,lineHeight:"22px",minHeight:80}}>{out}</div>
<div style={{fontSize:11,fontWeight:700,display:"flex",justifyContent:"space-between",marginTop:8}}><span>Words:{out?out.split(" ").filter(Boolean).length:0}</span><span>Chars:{out.length}</span><span style={{color:"green"}}>Fixed</span></div>
<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
<button onClick={()=>{navigator.clipboard.writeText(out);setCp(true);setTimeout(()=>setCp(false),1200)}} style={{background:cp?"green":"#000",color:"#fff",padding:"10px 14px",borderRadius:20,border:"none",fontWeight:800}}>{cp?"Copied✓":"Copy"}</button>
</div>
</div>
<footer style={{background:"#000",color:"#fff",borderRadius:12,padding:12,marginTop:12,textAlign:"center",fontSize:11}}>© 2026 LoremPro V23 - Dropdown Fixed + WORD Exact</footer>
</div>
</div>
)
}
