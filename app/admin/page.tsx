"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("blog");
  const [tools, setTools] = useState<any[]>([]);
  const [editTool, setEditTool] = useState<any>(null);

  useEffect(() => {
    if (localStorage.getItem("lorem_admin") === "true") {
      setIsLoggedIn(true);
      fetchTools();
    }
  }, []);

  const fetchTools = async () => {
    const { data } = await supabase.from("tools").select("*").order("name");
    if (data) setTools(data);
  };

  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
    const d = await res.json();
    if (d.success) { localStorage.setItem("lorem_admin", "true"); setIsLoggedIn(true); fetchTools(); }
    else alert("Wrong password");
    setLoading(false);
  };

  const handleBlogSubmit = async () => {
    if (!title ||!content) return alert("Fill all");
    setLoading(true);
    const { error } = await supabase.from("blogs").insert([{ title, content }]);
    setLoading(false);
    if (error) alert(error.message); else { alert("Posted!"); setTitle(""); setContent(""); }
  };

  const handleToolUpdate = async () => {
    const { error } = await supabase.from("tools").update({ name: editTool.name, slug: editTool.slug, description: editTool.description }).eq("id", editTool.id);
    if (error) alert(error.message); else { alert("Updated!"); setEditTool(null); fetchTools(); }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7] p-4">
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[32px] shadow-xl border border-white w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full p-4 rounded-2xl border bg-white/50 outline-none mb-4"/>
          <button onClick={handleLogin} className="w-full bg-black text-white p-4 rounded-2xl">{loading?"...":"Login"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">⚡ Lorem Pro Tool</h1>
          <button onClick={()=>{localStorage.removeItem("lorem_admin"); setIsLoggedIn(false)}} className="px-4 py-2 bg-white rounded-full shadow text-sm">Logout</button>
        </div>

        <div className="flex gap-2 mb-6 p-1.5 bg-white/60 backdrop-blur-xl rounded-full w-fit shadow-sm border border-white/50">
          <button onClick={()=>setActiveTab("blog")} className={`px-6 py-2.5 rounded-full font-medium transition-all ${activeTab==="blog"?"bg-black text-white shadow":"text-gray-500"}`}>Blog</button>
          <button onClick={()=>setActiveTab("tools")} className={`px-6 py-2.5 rounded-full font-medium transition-all ${activeTab==="tools"?"bg-black text-white shadow":"text-gray-500"}`}>Tools</button>
        </div>

        {activeTab==="blog"?(
          <div className="bg-white/70 backdrop-blur-2xl rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/60">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Blog Title" className="w-full p-4 rounded-2xl border border-gray-200/50 bg-white/70 mb-4 outline-none"/>
            <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Blog Content" className="w-full p-4 rounded-2xl border border-gray-200/50 bg-white/70 h-56 mb-4 outline-none"/>
            <button onClick={handleBlogSubmit} className="w-full bg-black text-white p-4 rounded-2xl font-semibold">Post Blog</button>
          </div>
        ):(
          <div className="bg-white/70 backdrop-blur-2xl rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/60">
            <h2 className="font-bold mb-4">Tools ({tools.length})</h2>
            <div className="grid gap-3">
              {tools.map((tool:any)=>(
                <div key={tool.id} className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div><p className="font-medium">{tool.name}</p><p className="text-xs text-gray-400">{tool.slug}</p></div>
                  <div className="flex gap-2">
                    <button onClick={()=>window.open(`/${tool.slug}`, '_blank')} className="text-xs px-4 py-2 bg-black text-white rounded-full">View</button>
                    <button onClick={()=>setEditTool(tool)} className="text-xs px-4 py-2 bg-white border rounded-full">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {editTool && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-bold text-lg mb-4">Edit Tool</h3>
              <input value={editTool.name} onChange={e=>setEditTool({...editTool, name:e.target.value})} className="w-full p-3 rounded-xl border mb-3" placeholder="Name"/>
              <input value={editTool.slug} onChange={e=>setEditTool({...editTool, slug:e.target.value})} className="w-full p-3 rounded-xl border mb-3" placeholder="Slug - jaise lorem-ipsum-generator"/>
              <textarea value={editTool.description||""} onChange={e=>setEditTool({...editTool, description:e.target.value})} className="w-full p-3 rounded-xl border mb-4 h-24" placeholder="Description"/>
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
