"use client";
import { useState, useEffect, useRef} from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tools");
  const [tools, setTools] = useState<any[]>([]);
  const [editTool, setEditTool] = useState<any>(null);

  useEffect(() => {
    if (localStorage.getItem("lorem_admin") === "true") { setIsLoggedIn(true); fetchTools(); }
  }, []);
  const fetchTools = async () => {
    const { data } = await supabase.from("tools").select("*").order("name");
    if (data) setTools(data);
  };
  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
    const d = await res.json();
    if (d.success) { localStorage.setItem("lorem_admin", "true"); setIsLoggedIn(true); fetchTools(); } else alert("Wrong password");
    setLoading(false);
  };
  const toggleTool = async (tool:any) => {
    const { error } = await supabase.from("tools").update({ is_enabled:!tool.is_enabled }).eq("id", tool.id);
    if (!error) fetchTools(); else alert(error.message);
  };
  const handleToolUpdate = async () => {
    const { error } = await supabase.from("tools").update({ name: editTool.name, slug: editTool.slug }).eq("id", editTool.id);
    if (error) alert(error.message); else { setEditTool(null); fetchTools(); }
  };
const contentRef = useRef(null)
const insertFormat = (b, a="") => {
  const el = contentRef.current; if(!el) return;
  const s = el.selectionStart, e = el.selectionEnd;
  const sel = content.substring(s,e);
  const newText = content.substring(0,s) + b + sel + a + content.substring(e);
  setContent(newText);
}
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 p-8 rounded-[32px] shadow-xl w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-6 text-white">Admin Login</h1>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full p-4 rounded-2xl bg-white/90 outline-none mb-4"/>
          <button onClick={handleLogin} className="w-full bg-black text-white p-4 rounded-2xl font-bold">{loading?"...":"Login"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">⚡ Lorem Pro Tool</h1>
          <button onClick={()=>{localStorage.removeItem("lorem_admin"); setIsLoggedIn(false)}} className="px-4 py-2 bg-white/90 rounded-full shadow text-sm">Logout</button>
        </div>
        <div className="flex gap-2 mb-6 p-1.5 bg-white/20 backdrop-blur-xl rounded-full w-fit border border-white/30">
          <button onClick={()=>setActiveTab("tools")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="tools"?"bg-white text-black shadow":"text-white/80"}`}>Tools ON/OFF</button>
          <button onClick={()=>setActiveTab("blog")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="blog"?"bg-white text-black shadow":"text-white/80"}`}>Blog</button>
        </div>

        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-[24px] p-6 shadow-xl">
          {activeTab==="tools"?(
            <>
              <h2 className="font-bold mb-4 text-white text-lg">Tools Control ({tools.length})</h2>
              <div className="grid gap-3">
                {tools.map((tool:any)=>(
                  <div key={tool.id} className={`p-4 rounded-2xl backdrop-blur border shadow-sm flex justify-between items-center transition-all ${tool.is_enabled? "bg-white/90 border-white/50" : "bg-red-50/80 border-red-200 opacity-70"}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={()=>toggleTool(tool)} className={`w-12 h-7 rounded-full p-1 transition-all ${tool.is_enabled? "bg-green-500" : "bg-gray-300"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${tool.is_enabled? "translate-x-5" : "translate-x-0"}`}></div>
                      </button>
                      <div><p className="font-semibold">{tool.name}</p><p className="text-xs text-gray-500">{tool.is_enabled? "🟢 Live" : "🔴 Disabled"} - {tool.slug}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>window.open(`/${tool.slug}`, '_blank')} className="text-xs px-3 py-2 bg-black text-white rounded-full">View</button>
                      <button onClick={()=>setEditTool(tool)} className="text-xs px-3 py-2 bg-white border rounded-full">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ):(
            <>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Blog Title" className="w-full p-4 rounded-2xl bg-white/90 mb-4 outline-none"/>
              <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Blog Content" className="w-full p-4 rounded-2xl bg-white/90 h-56 mb-4 outline-none"/>
              <button onClick={async()=>{ if(!title||!content) return alert("Fill all"); setLoading(true); const {error}=await supabase.from("blogs").insert([{title,content}]); setLoading(false); if(error) alert(error.message); else {alert("Posted!"); setTitle(""); setContent("");}}} className="w-full bg-black text-white p-4 rounded-2xl font-bold">Post Blog</button>
            </>
          )}
        </div>

        {editTool && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-bold text-lg mb-4">Edit Tool</h3>
              <input value={editTool.name} onChange={e=>setEditTool({...editTool, name:e.target.value})} className="w-full p-3 rounded-xl border mb-3"/>
              <input value={editTool.slug} onChange={e=>setEditTool({...editTool, slug:e.target.value})} className="w-full p-3 rounded-xl border mb-3"/>
              <div className="flex gap-2">
                <button onClick={()=>setEditTool(null)} className="flex-1 p-3 rounded-xl border">Cancel</button>
                <button onClick={handleToolUpdate} className="flex-1 p-3 rounded-xl bg-black text-white">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
