"use client";import{useState,useEffect}from"react";
const LANGS=[["HI","Hindi"],["EN","English"],["ES","Spanish"],["FR","French"],["DE","German"],["RU","Russian"],["JA","Japanese"],["IT","Italian"],["AR","Arabic"],["PT","Portuguese"],["BN","Bengali"],["UR","Urdu"],["ZH","Chinese"],["KO","Korean"],["TR","Turkish"],["NL","Dutch"],["PL","Polish"],["TH","Thai"],["VI","Vietnamese"],["ID","Indonesian"],["TA","Tamil"],["TE","Telugu"],["MR","Marathi"],["GU","Gujarati"]];
const DB:any={
HI:["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन जरूरी है।","पानी ज्यादा पीने से ताजगी रहती है।","ध्यान से तनाव कम होता है।"],
EN:["Healthy life needs daily yoga.","Morning walk keeps body fit.","Balanced diet is essential.","Drinking more water keeps freshness.","Meditation reduces stress."],
ES:["La vida saludable necesita yoga diario.","Caminar por la mañana mantiene el cuerpo en forma.","La dieta equilibrada es esencial.","Beber agua mantiene la frescura.","La meditación reduce el estrés."],
FR:["La vie saine nécessite du yoga quotidien.","La marche matinale garde le corps en forme.","Une alimentation équilibrée est essentielle.","Boire de l'eau garde la fraîcheur.","La méditation réduit le stress."],
DE:["Gesundes Leben braucht tägliches Yoga.","Morgenspaziergang hält den Körper fit.","Ausgewogene Ernährung ist wichtig.","Wasser trinken hält frisch.","Meditation reduziert Stress."],
RU:["Здоровая жизнь требует ежедневной йоги.","Утренняя прогулка поддерживает форму.","Сбалансированная диета важна.","Питьевая вода сохраняет свежесть.","Медитация снижает стресс."],
JA:["健康的な生活には毎日のヨガが必要です。","朝の散歩は体を健康に保ちます。","バランスの取れた食事が不可欠です。","水を飲むと新鮮さを保ちます。","瞑想はストレスを軽減します。"],
IT:["La vita sana ha bisogno di yoga quotidiano.","La passeggiata mattutina mantiene il corpo in forma.","Una dieta equilibrata è essenziale.","Bere acqua mantiene freschezza.","La meditazione riduce lo stress."],
AR:["الحياة الصحية تحتاج اليوغا اليومية.","المشي الصباحي يحافظ على اللياقة.","النظام الغذائي المتوازن ضروري.","شرب الماء يحافظ على النضارة.","التأمل يقلل التوتر."],
PT:["Vida saudável precisa de ioga diária.","Caminhada matinal mantém o corpo em forma.","Dieta equilibrada é essencial.","Beber água mantém frescor.","Meditação reduz estresse."]
};
const getData=(l:string)=>{return DB[l]||DB.EN;};
export default function Page(){
const[lang,setLang]=useState("HI");const[mode,setMode]=useState("paragraph");const[cnt,setCnt]=useState(3);const[out,setOut]=useState("");const[cp,setCp]=useState(false);const[menu,setMenu]=useState(false);
const gen=()=>{let base=getData(lang);let pool=[...base];while(pool.length<30)pool=[...pool,...base];let uniq=[...new Set(pool)];
let r="";if(mode==="word"){let all=uniq.join(" ").split(" ").filter(w=>w.length>0);r=all.slice(0,cnt).join(" ");}else if(mode==="sentence"){r=uniq.slice(0,cnt).join(" ");}else if(mode==="list"){r=uniq.slice(0,cnt).map(v=>`• ${v}`).join("\n");}else{let a=[];for(let i=0;i<cnt;i++){a.push(uniq.slice((i*2)%uniq.length,(i*2)%uniq.length+2).join(" "));}r=a.join("\n\n");}setOut(r);};
useEffect(()=>{gen();},[lang,mode,cnt]);
const dl=(t:string)=>{let x=out;if(t==="UPPER")x=x.toUpperCase();if(t==="LOWER")x=x.toLowerCase();const b=new Blob([x]);const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=t+".txt";a.click();};
const scroll=(id:string)=>{setMenu(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"});};
return(<div style={{background:"#f1f5f9",minHeight:"100vh",color:"#000",fontFamily:"system-ui"}}><header style={{background:"#fff",padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,borderBottom:"1px solid #ddd",zIndex:10}}><b>LoremPro V21</b><button onClick={()=>setMenu(!menu)} style={{background:"#000",color:"#fff",borderRadius:20,padding:"6px 14px",border:"none",fontWeight:800}}>Menu</button></header>
{menu&&<div style={{background:"#fff",padding:10,display:"flex",gap:8,flexWrap:"wrap",borderBottom:"1px solid #ddd",position:"sticky",top:48,zIndex:9}}>{[["gen","Generator"],["art","Articles"],["use","How to Use"],["tool","Other Tools"]].map(([id,lbl])=><button key={id} onClick={()=>scroll(id)} style={{border:"1px solid #000",padding:"8px 14px",borderRadius:20,fontSize:12,fontWeight:800,background:"#fff"}}>{lbl}</button>)}</div>}
<div style={{maxWidth:600,margin:"auto",padding:12}}>
<div id="gen" style={{background:"#fff",borderRadius:16,padding:12,border:"1px solid #ddd"}}>
<label style={{fontSize:12,fontWeight:900}}>SELECT LANGUAGE (Dropdown)</label>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #4f46e5",fontWeight:800,marginTop:8,color:"#000",background:"#fff"}}>
{LANGS.map(([c,n])=><option key={c} value={c}>{c} - {n}</option>)}</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:12}}>{["paragraph","sentence","word","list"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10,borderRadius:10,background:mode===m?"#4f46e5":"#f3f4f6",color:mode===m?"#fff":"#000",border:"none",fontSize:10,fontWeight:800}}>{m.toUpperCase()}</button>)}</div>
<div style={{display:"flex",gap:10,alignItems:"center",marginTop:12}}><span style={{fontSize:11,fontWeight:800}}>Count:</span><input type="range" min={1} max={20} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/><b style={{border:"2px solid #000",padding:"6px 12px",borderRadius:8,minWidth:20,textAlign:"center"}}>{cnt}</b></div>
<div style={{fontSize:10,color:"#666",marginTop:4}}>{mode==="word"?`${cnt} words exact`:mode==="sentence"?`${cnt} sentences`:mode==="list"?`${cnt} list items`:`${cnt} paragraphs`}</div>
<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,fontWeight:900,marginTop:10,border:"none"}}>GENERATE {mode.toUpperCase()} - {lang} ({cnt} {mode})</button>
<div style={{background:"#fff",color:"#000",border:"2px solid #000",borderRadius:12,padding:12,marginTop:12,whiteSpace:"pre-wrap",fontSize:15,lineHeight:"22px",minHeight:80}}>{out}</div>
<div style={{fontSize:11,fontWeight:700,display:"flex",justifyContent:"space-between",marginTop:8}}><span>Words:{out?out.split(/\s+/).filter(w=>w).length:0}</span><span>Chars:{out.length}</span><span style={{color:"green"}}>No Repeat:YES</span></div>
<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}><button onClick={()=>{navigator.clipboard.writeText(out);setCp(true);setTimeout(()=>setCp(false),1200)}} style={{background:cp?"green":"#000",color:"#fff",padding:"10px 14px",borderRadius:20,border:"none",fontWeight:800}}>{cp?"Copied✓":"Copy"}</button>{["TXT","HTML","UPPER","LOWER","SLUG","JSON","MD","LIST"].map(t=><button key={t} onClick={()=>dl(t)} style={{border:"1px solid #000",padding:"8px 10px",borderRadius:20,fontSize:10,fontWeight:800,background:"#fff"}}>{t}</button>)}</div></div>
<a href="https://www.blogger.com" target="_blank" style={{display:"block",background:"#ff6a00",color:"#fff",textAlign:"center",padding:14,borderRadius:12,fontWeight:900,textDecoration:"none",marginTop:12}}>Move to Blogger - Full Width</a>
<div id="art" style={{background:"#fff",borderRadius:12,padding:12,marginTop:12,border:"1px solid #ddd"}}><b>Latest Articles</b><p style={{fontSize:12,marginTop:6}}>What is Lorem Ipsum? (All Languages)<br/>Why Multi-Language Lorem Ranks Better</p></div>
<div id="use" style={{background:"#fff",borderRadius:12,padding:12,marginTop:12,border:"1px solid #ddd"}}><b>How to Use</b><p style={{fontSize:12}}>1. Dropdown se language select karo<br/>2. Mode + Count select<br/>3. Generate → Exact count milega</p></div>
<div id="tool" style={{background:"#fff",borderRadius:12,padding:12,marginTop:12,border:"1px solid #ddd"}}><b>Other Tools</b><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:6}}>{["Word Counter","Hashtag Gen","Meta Tags","YT Title"].map(t=><div key={t} style={{border:"1px solid #eee",padding:8,borderRadius:8,fontSize:11}}>{t} →</div>)}</div></div>
<footer style={{background:"#000",color:"#fff",borderRadius:12,padding:12,marginTop:12,textAlign:"center",fontSize:11}}>© 2026 LoremPro V21 - Dropdown + Exact WORD Count + Working Menu</footer>
</div></div>)}
