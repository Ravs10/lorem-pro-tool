import Link from "next/link";
import Header from "../components/Header";

const TOOLS = [
  ["/", "🏠 Lorem Generator - Home"],
  ["/fake-data-generator", "👤 Fake Data Generator"],
  ["/tools", "🚀 All Tools"],
];

const PAGES = [
  ["/", "Home"],
  ["/?page=how", "📖 How to Use"],
  ["/?page=contact", "📞 Contact"],
  ["/?page=privacy", "🔒 Privacy"],
  ["/?page=hire", "💼 Hire Me"],
  ["/?page=article", "📄 Article"],
];

export default function ToolsPage(){
  return(
    <div style={{background:"#6366f1", minHeight:"100vh", padding:"20px"}}>
      <div style={{maxWidth:720, margin:"auto"}}>
        <Header />
        <div style={{background:"#fff", padding:"20px", borderRadius:"16px"}}>
          <h1 style={{marginTop:0}}>All Tools 🚀</h1>
          <div style={{display:"grid", gap:"12px"}}>
            {TOOLS.map(([link,label]:any)=>(
              <Link key={link} href={link} style={{padding:"14px", background:"#f4f4f5", borderRadius:"10px", textDecoration:"none", color:"#000", fontWeight:"700"}}>{label}</Link>
            ))}
          </div>
          <h2 style={{marginTop:"30px"}}>Menu</h2>
          <div style={{display:"grid", gap:"12px"}}>
            {PAGES.map(([link,label]:any)=>(
              <Link key={link} href={link} style={{padding:"14px", background:"#fff", border:"1px solid #ddd", borderRadius:"10px", textDecoration:"none", color:"#000"}}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
