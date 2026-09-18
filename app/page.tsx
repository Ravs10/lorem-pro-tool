"use client"
import {useState,useEffect} from "react"
const DB:any={
"HI":["Swasth jeevan ke liye roz yoga jaruri hai","Subah tahalna sharir ko fit rakhta hai","Paani khoob peena chahiye","Jaldi sone se dimag tez hota hai","Hari sabjiya khana sehat ke liye accha hai"],
"EN":["Healthy life needs daily yoga","Morning walk keeps body fit","Drink more water daily","Early to bed makes brain sharp","Green vegetables are good for health"],
"OR":["Sustha jeevan pain yoga darkar","Sakala bhramana deha ku sustha rakhe","Pani besi pibaku padiba","Jaldi soiba buddhi teja kare"],
"BN":["Sustho jiboner jonno protidin yoga dorkar","Sokale hata swasther jonno bhalo","Beshi jol pan korun","Taratari ghum buddhi baray"],
"TE":["Arogyakara jeevitaniki roju yoga avasaram","Udayam nadavatanam aarogyaniki manchidi","Neellu ekkuva tagandi","Twaraga nidra medhassunu penchunu"],
"TA":["Arokiyamana vaazhkkaiku thinamum yoga thevai","Kaalai nadai udalukku nallathu","Thanneer athikam kudiyungal","Seekiram thoonguvathu moolaiyai koosharukkum"],
"KN":["Arogyakara jeevanake prati dina yoga beku","Belegge nadeyuvudu arogyakku olledu","Hechchu neeru kudiyiri","Begane malaguvudu buddhivantage"],
"ML":["Arogyakaramaaya jeevitattinu divasavum yoga venam","Ravile nadakkunnathu aarogyattinu nallathu","Vellam kooduthal kudikkuka","Pettennu urangunnathu buddhi koodum"],
"MR":["Nirogi jivanasathi darroj yog hava","Sakali firne sharirala fit thevate","Pani jast pya","Lavkar zopane buddhi kushagra hote"],
"GU":["Swasth jivan mate roj yog jaruri chhe","Savar ma chalvu sharir ne fit rakhe chhe","Pani vadhu pivo","Vahela suvu thi buddhi tej thay chhe"],
"PA":["Sehatmand jeevan layi roz yoga zaruri hai","Saver di sair sehat layi changi hai","Paani vadh peena chahida","Jaldi soun naal dimag tez hunda"]
}

export default function Page(){
const [lang,setLang]=useState("HI")
const [cnt,setCnt]=useState(3)
const [out,setOut]=useState("")
const [copied,setCopied]=useState(false)

const gen = (l=lang,c=cnt) => {
  let arr = DB[l] || DB["EN"]
  let txt = arr.slice(0,c).join("\n\n")
  setOut(txt)
}

useEffect(()=>{gen("HI",3)},[])

return(
<div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",minHeight:"100vh",fontFamily:"system-ui",padding:12,color:"#000"}}>
<div style={{maxWidth:600,margin:"auto",background:"#fff",borderRadius:16,padding:14}}>
<select value={lang} onChange={e=>{let v=e.target.value; setLang(v); gen(v,cnt)}} style={{width:"100%",padding:14,borderRadius:8,border:"2px solid #6366f1",fontWeight:800,color:"#000",background:"#fff",fontSize:16}}>
<option value="HI">HI-Hindi</option><option value="EN">EN-English</option><option value="OR">OR-Odia</option><option value="BN">BN-Bengali</option><option value="TE">TE-Telugu</option><option value="TA">TA-Tamil</option><option value="KN">KN-Kannada</option><option value="ML">ML-Malayalam</option><option value="MR">MR-Marathi</option><option value="GU">GU-Gujarati</option><option value="PA">PA-Punjabi</option>
</select>

<div style={{marginTop:12,display:"flex",alignItems:"center",gap:10}}>
<input type="range" min={1} max={5} value={cnt} onChange={e=>{let v=Number(e.target.value); setCnt(v); gen(lang,v)}} style={{flex:1}}/>
<b>Count: {cnt}</b>
</div>

<button onClick={()=>gen(lang,cnt)} style={{width:"100%",background:"#111",color:"#fff",padding:14,borderRadius:10,marginTop:12,fontWeight:900,border:"none",fontSize:16}}>GENERATE {lang}</button>

<div style={{border:"2px solid #111",borderRadius:10,padding:12,marginTop:12,minHeight:120,background:"#ffffff",color:"#000000",fontWeight:600,whiteSpace:"pre-wrap",fontSize:15}}>{out}</div>

<button onClick={()=>{navigator.clipboard.writeText(out);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{width:"100%",background:copied?"#16a34a":"#111",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800,marginTop:10}}>{copied?"✅ Copied!":"Copy"}</button>
</div>
</div>)}
