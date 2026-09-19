import Link from "next/link";
import Header from "../components/Header";

const tools = [
  { name: "Lorem Generator", desc: "77 languages, 20 styles", icon: "📝", link: "/", color: "#6366f1" },
  { name: "Fake Data Generator", desc: "Name, email, address", icon: "👤", link: "/fake-data-generator", color: "#10b981" },
];

export default function ToolsPage(){
  return(
    <div style={{background:"#6366f1", minHeight:"100vh", padding:"16px"}}>
      <div style={{maxWidth:720, margin:"0 auto"}}>
        <Header />
        <div style={{background:"#fff", borderRadius:"24px", padding:"20px", marginTop:"16px"}}>
          <div style={{textAlign:"center", marginBottom:"20px"}}>
            <div style={{fontSize:"50px"}}>🚀</div>
            <h1 style={{margin:"10px 0 6px", fontSize:"28px"}}>All Tools</h1>
            <p style={{color:"#666", margin:0}}>2 Powerful tools for developers</p>
          </div>

          <div style={{display:"grid", gap:"14px"}}>
            {tools.map(t=>(
              <Link key={t.link} href={t.link} style={{textDecoration:"none"}}>
                <div style={{border:"2px solid #f0f0f0", borderRadius:"16px", padding:"16px", display:"flex", gap:"14px", alignItems:"center", background:"#fff"}}>
                  <div style={{width:"56px", height:"56px", borderRadius:"14px", background:t.color+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px"}}>{t.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:"800", color:"#000", fontSize:"16px"}}>{t.name}</div>
                    <div style={{color:"#666", fontSize:"13px", marginTop:"2px"}}>{t.desc}</div>
                  </div>
                  <div style={{color:"#000", fontWeight:"bold"}}>→</div>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/" style={{display:"block", marginTop:"20px", textAlign:"center", background:"#000", color:"#fff", padding:"14px", borderRadius:"12px", textDecoration:"none", fontWeight:"700"}}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
