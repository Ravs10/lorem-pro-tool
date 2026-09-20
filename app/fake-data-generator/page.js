function FakeDataGenerator(){
  const [count,setCount]=React.useState(5);
  const [lang,setLang]=React.useState("en");
  const [type,setType]=React.useState("all");
  const [data,setData]=React.useState([]);
  const [copied,setCopied]=React.useState(false);

  React.useEffect(()=>{
    document.title = "Fake Data Generator - Advanced Dummy Data in Multiple Languages";
    const m = document.querySelector('meta[name="description"]');
    if(m) m.content = "Generate advanced fake data in multiple languages - names, emails, phone, address. Export to JSON, CSV, SQL. Best dummy data generator 2025.";
  },[]);

  const names = {
    en: ["John Doe","Emma Smith","Michael Brown"],
    hi: ["Aman Verma","Pooja Sharma","Rahul Yadav"],
    es: ["Carlos Garcia","Maria Lopez","Juan Perez"],
    fr: ["Jean Dupont","Marie Dubois","Pierre Martin"]
  };

  const generate = () => {
    let arr = [];
    for(let i=0;i<count;i++){
      arr.push({
        id: i+1,
        name: names[lang][Math.floor(Math.random()*3)],
        email: `user${Math.floor(Math.random()*999)}@test.com`,
        phone: `+91 ${Math.floor(1000000000+Math.random()*9000000000)}`,
        address: lang==="hi"? "Lucknow, UP, India" : "New York, USA",
        company: "Tech Pvt Ltd"
      })
    }
    setData(arr);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(data,null,2));
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div style={{
      maxWidth:900, margin:"20px auto", padding:24,
      background:"linear-gradient(135deg,#0f172a,#1e293b)",
      borderRadius:20, color:"white",
      boxShadow:"0 0 40px rgba(0,255,255,0.15)",
      animation:"fadeIn 0.6s ease"
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <h1 style={{textAlign:"center", fontSize:28, fontWeight:800}}>🚀 Advanced Fake Data Generator</h1>
      <p style={{textAlign:"center", opacity:0.7}}>Multi-language dummy data for developers - SEO Optimized</p>

      <div style={{display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginTop:20}}>
        <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:"10px 16px", borderRadius:10, background:"#334155", color:"white", border:"none"}}>
          <option value="en">🇺🇸 English</option>
          <option value="hi">🇮🇳 Hindi</option>
          <option value="es">🇪🇸 Spanish</option>
          <option value="fr">🇫🇷 French</option>
        </select>

        <select value={count} onChange={e=>setCount(e.target.value)} style={{padding:"10px 16px", borderRadius:10, background:"#334155", color:"white", border:"none"}}>
          <option value="5">5 Rows</option>
          <option value="10">10 Rows</option>
          <option value="50">50 Rows</option>
          <option value="100">100 Rows</option>
        </select>

        <button onClick={generate} style={{padding:"10px 20px", borderRadius:10, background:"linear-gradient(90deg,#06b6d4,#3b82f6)", border:"none", color:"white", fontWeight:700, cursor:"pointer", transform:"scale(1)", transition:"0.2s"}}>
          ✨ Generate Data
        </button>
        <button onClick={copyAll} style={{padding:"10px 20px", borderRadius:10, background:"#475569", border:"none", color:"white", cursor:"pointer"}}>
          {copied? "✅ Copied!" : "📋 Copy JSON"}
        </button>
      </div>

      <div style={{marginTop:24, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:16, maxHeight:400, overflow:"auto", fontFamily:"monospace", fontSize:13}}>
        <pre>{JSON.stringify(data,null,2) || "Click Generate to create data..."}</pre>
      </div>

      <p style={{display:"none"}}>Keywords: fake data generator, dummy data generator multi language, hindi fake data, advanced fake data generator</p>
    </div>
  );
}
