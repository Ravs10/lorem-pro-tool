"use client";
import Link from 'next/link'
import { useState, useEffect, useRef} from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tools");
  const [tools, setTools] = useState<any[]>([]);
  const [editTool, setEditTool] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false)
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newMasterKey, setNewMasterKey] = useState("");
  const [authForChange, setAuthForChange] = useState("");

  useEffect(() => {
    if (localStorage.getItem("lorem_admin") === "true") {
      setIsLoggedIn(true);
      setIsMaster(localStorage.getItem("lorem_is_master")==="true");
      fetchTools();
    }
  }, []);
  const fetchTools = async () => {
    const { data } = await supabase.from("tools").select("*").order("name");
    if (data) setTools(data);
  };

  // --- FIX 1: Secure Login with mode ---
  const handleLogin = async () => {
    setLoading(true);
    const mode = showForgot? "master" : "admin";
    const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass, mode }) });
    const d = await res.json();
    if (d.success) {
      localStorage.setItem("lorem_admin", "true");
      localStorage.setItem("lorem_is_master", d.isMaster? "true" : "false");
      setIsLoggedIn(true); setIsMaster(d.isMaster); fetchTools(); setPass("");
    } else alert(d.message || "Wrong password");
    setLoading(false);
  };

  const toggleTool = async (tool: any) => { const n =!tool.is_active; setTools((p: any) => p.map((t: any) => t.id === tool.id? {...t, is_active: n } : t)); const { error } = await supabase.from('tools').update({ is_active: n }).eq('id', tool.id); if (error) { alert(error.message); setTools((p: any) => p.map((t: any) => t.id === tool.id? {...t, is_active: tool.is_active } : t)); } };
  const handleToolUpdate = async () => {
    const { error } = await supabase.from("tools").update({ name: editTool.name, slug: editTool.slug }).eq("id", editTool.id);
    if (error) alert(error.message); else { setEditTool(null); fetchTools(); }
  };
const contentRef = useRef(null)
const renderPreview = (text:any) => {
  return text.split('\n').map((line:any, i:any) => {
  if(line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold my-2">{line.slice(4)}</h3>
if(line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold my-3">{line.slice(3)}</h2>
    if(line.startsWith('- ')) return <li key={i} className="ml-5 list-disc">{line.replace('- ','')}</li>
    let parts = line.split(/(\*\*.*?\*\*)/g);
    return <p key={i} className="my-1">{parts.map((p:any, j:any) => {
      if(p.startsWith('**') && p.endsWith('**')) return <b key={j}>{p.slice(2,-2)}</b>
      let linkMatch = p.match(/\[(.*)\]\((.*)\)/);
      if(linkMatch) return <a key={j} href={linkMatch[2]} target="_blank" className="text-blue-600 underline">{linkMatch[1]}</a>
      return p
    })}</p>
  })
}
const insertFormat = (b:any, a="") => {
  const el:any = contentRef.current; if(!el) return;
  const s = el.selectionStart, e = el.selectionEnd;
  const sel = content.substring(s,e);
  const newText = content.substring(0,s) + b + (sel||"text") + a + content.substring(e);
  setContent(newText);
}

// --- FIX 2: Secure Password Change via API ---
const updatePasswordSecure = async (type: string, newValue: string) => {
  if(!newValue) return alert("Naya password likho");
  if(!authForChange) return alert("Pehle Master Key se verify karo (upar wala box)");
  const res = await fetch("/api/admin-change", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, newValue, authKey: authForChange }) });
  const d = await res.json();
  if(d.success){ alert("✅ "+d.message); setNewAdminPass(""); setNewMasterKey(""); }
  else alert("❌ "+d.message);
}

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 p-8 rounded-[32px] shadow-xl w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-2 text-white">{showForgot? "Master Login 👑" : "Admin Login"}</h1>
          <p className="text-white/70 text-sm mb-6">{showForgot? "Master Key Ravs1234 se login" : "Admin Password Ravs123 se login"}</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={showForgot? "Enter Master Key" : "Enter Admin Password"} className="w-full p-4 rounded-2xl bg-white/90 outline-none mb-4"/>
          <button onClick={handleLogin} className="w-full bg-black text-white p-4 rounded-2xl font-bold">{loading?"...": showForgot? "Unlock with Master" : "Login"}</button>
          <button onClick={()=>setShowForgot(!showForgot)} className="w-full mt-4 text-white/90 text-sm underline">{showForgot? "Back to Admin Login" : "Forgot Password? Use Master Key"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">⚡ Lorem Pro Tool {isMaster && "👑 MASTER"}</h1>
          <button onClick={()=>{localStorage.clear(); location.reload()}} className="px-4 py-2 bg-white/90 rounded-full shadow text-sm">Logout</button>
        </div>
        <div className="flex gap-2 mb-6 p-1.5 bg-white/20 backdrop-blur-xl rounded-full w-fit border border-white/30 flex-wrap">
          <button onClick={()=>setActiveTab("tools")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="tools"?"bg-white text-black shadow":"text-white/80"}`}>Tools</button>
          <button onClick={()=>setActiveTab("blog")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="blog"?"bg-white text-black shadow":"text-white/80"}`}>Blog</button>
          <button onClick={()=>setActiveTab("settings")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="settings"?"bg-white text-black shadow":"text-white/80"}`}>⚙️ Settings</button>
          <Link href="/admin/posts" className="px-6 py-2 rounded-full bg-black text-white font-bold text-center">📝 Posts</Link>
        </div>

        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-[24px] p-6 shadow-xl">
          {activeTab==="tools"?(
            <>
              <h2 className="font-bold mb-4 text-white text-lg">Tools Control ({tools.length})</h2>
              <div className="grid gap-3">
                {tools.map((tool:any)=>(
                  <div key={tool.id} className={`p-4 rounded-2xl backdrop-blur border shadow-sm flex justify-between items-center transition-all ${tool.is_active? "bg-white/90 border-white/50" : "bg-red-50/80 border-red-200 opacity-70"}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={()=>toggleTool(tool)} className={`w-12 h-7 rounded-full p-1 transition-all ${tool.is_active? "bg-green-500" : "bg-gray-300"}`}><div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${tool.is_active? "translate-x-5" : "translate-x-0"}`}></div></button>
                      <div><p className="font-semibold">{tool.name}</p><p className="text-xs text-gray-500">{tool.is_active? "🟢 Live" : "🔴 Disabled"} - {tool.slug}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>window.open(`/${tool.slug}`, '_blank')} className="text-xs px-3 py-2 bg-black text-white rounded-full">View</button>
                      <button onClick={()=>setEditTool(tool)} className="text-xs px-3 py-2 bg-white border rounded-full">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ): activeTab==="settings"? (
            <div className="space-y-6">
              <h2 className="font-bold text-white text-lg">🔐 Advanced Password Control</h2>
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-2xl">
                <h3 className="font-bold text-sm mb-2">🔑 Master Verification (Har change ke liye zaruri)</h3>
                <input value={authForChange} onChange={e=>setAuthForChange(e.target.value)} type="password" placeholder="Enter Master Key to verify" className="w-full p-3 rounded-xl border-2 border-yellow-400 bg-white" />
              </div>
              <div className="bg-white/90 p-5 rounded-2xl">
                <h3 className="font-bold mb-3">Change / Reset Admin Password</h3>
                <div className="flex gap-2">
                  <input value={newAdminPass} onChange={e=>setNewAdminPass(e.target.value)} placeholder="New Admin Password" className="flex-1 p-3 rounded-xl border" />
                  <button onClick={()=>updatePasswordSecure("admin_password", newAdminPass)} className="px-6 bg-black text-white rounded-xl font-bold">Reset</button>
                </div>
              </div>
              {isMaster && (
                <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl">
                  <h3 className="font-bold mb-3">👑 Change Master Key (Master Only)</h3>
                  <div className="flex gap-2">
                    <input value={newMasterKey} onChange={e=>setNewMasterKey(e.target.value)} placeholder="New Master Key" className="flex-1 p-3 rounded-xl border" />
                    <button onClick={()=>updatePasswordSecure("master_key", newMasterKey)} className="px-6 bg-yellow-400 text-black rounded-xl font-bold">Update Master</button>
                  </div>
                </div>
              )}
            </div>
          ):(
            <>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Blog Title" className="w-full p-4 rounded-xl border mb-2" />
              <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl mb-2 items-center">
              <button type="button" onClick={()=>insertFormat("**","**")}>B</button><button type="button" onClick={()=>insertFormat("\n## ","")}>H2</button><button type="button" onClick={()=>insertFormat("\n### ","")}>H3</button><button type="button" onClick={()=>insertFormat("\n- ","")}>List</button><button type="button" onClick={()=>insertFormat("[", "](https://)")} >Link</button><button type="button" onClick={()=>setShowPreview(!showPreview)} className="ml-auto px-3 py-1 bg-purple-600 text-white rounded-lg">{showPreview? "Edit" : "Preview"}</button>
              </div>
              {!showPreview? (<textarea ref={contentRef} value={content} onChange={e=>setContent(e.target.value)} placeholder="Blog Content..." className="w-full h-[300px] p-4 rounded-xl border" />) : (<div className="w-full h-[300px] p-4 rounded-xl border bg-white overflow-y-auto whitespace-pre-wrap"><h2 className="font-bold text-lg mb-2">{title}</h2><div>{renderPreview(content)}</div></div>)}
              <button onClick={async()=>{ if(!title ||!content) return alert("Fill all"); setLoading(true); await supabase.from("blogs").insert([{title, content}]); setLoading(false); setTitle(""); setContent(""); alert("Posted!"); }} className="w-full bg-black text-white p-4 rounded-xl font-bold mt-2">Post Blog</button>
            </>
          )}
        </div>
        {editTool && (<div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"><div className="bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl"><h3 className="font-bold text-lg mb-4">Edit Tool</h3><input value={editTool.name} onChange={e=>setEditTool({...editTool, name:e.target.value})} className="w-full p-3 rounded-xl border mb-3"/><input value={editTool.slug} onChange={e=>setEditTool({...editTool, slug:e.target.value})} className="w-full p-3 rounded-xl border mb-3"/><div className="flex gap-2"><button onClick={()=>setEditTool(null)} className="flex-1 p-3 rounded-xl border">Cancel</button><button onClick={handleToolUpdate} className="flex-1 p-3 rounded-xl bg-black text-white">Save</button></div></div></div>)}
      </div>
    </div>
  );
}
