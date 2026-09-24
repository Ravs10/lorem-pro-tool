"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("blog");
  const [tools, setTools] = useState<any[]>([]);

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
    if (!pass) return alert("Password dalo");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("lorem_admin", "true");
        setIsLoggedIn(true);
        fetchTools();
      } else alert("Wrong password");
    } catch { alert("Login failed"); }
    setLoading(false);
  };

  const handleBlogSubmit = async () => {
    if (!title ||!content) return alert("Fill all fields");
    setLoading(true);
    const { error } = await supabase.from("blogs").insert([{ title, content }]);
    setLoading(false);
    if (error) alert(error.message);
    else { alert("Blog posted!"); setTitle(""); setContent(""); }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        <div className="backdrop-blur-xl bg-white/80 p-8 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className="w-full p-4 border border-gray-200 rounded-2xl bg-white/50 mb-4 focus:outline-none" />
          <button onClick={handleLogin} className="w-full bg-black text-white p-4 rounded-2xl font-semibold">{loading? "Loading..." : "Login"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">⚡ Lorem Pro Tool</h1>
          <button onClick={() => { localStorage.removeItem("lorem_admin"); setIsLoggedIn(false); }} className="px-4 py-2 bg-white rounded-full shadow text-sm">Logout</button>
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={() => setActiveTab("blog")} className={`px-6 py-3 rounded-full font-medium ${activeTab === "blog"? "bg-black text-white shadow-lg" : "bg-white/70 backdrop-blur border"}`}>Blog</button>
          <button onClick={() => setActiveTab("tools")} className={`px-6 py-3 rounded-full font-medium ${activeTab === "tools"? "bg-black text-white shadow-lg" : "bg-white/70 backdrop-blur border"}`}>Tools</button>
        </div>

        {activeTab === "blog"? (
          <div className="backdrop-blur-xl bg-white/80 rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog Title" className="w-full p-4 border border-gray-200 rounded-2xl mb-4 bg-white/60" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Blog Content" className="w-full p-4 border border-gray-200 rounded-2xl h-56 mb-4 bg-white/60" />
            <button onClick={handleBlogSubmit} className="w-full bg-black text-white p-4 rounded-2xl font-semibold">Post Blog</button>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/80 rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20">
            <h2 className="font-bold mb-4 text-lg">Tools ({tools.length})</h2>
            <div className="grid gap-3">
              {tools.map((tool: any) => (
                <div key={tool.id} className="group p-4 rounded-2xl bg-white/60 border border-gray-200/50 flex justify-between items-center">
                  <span className="font-medium">{tool.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => window.open(`/${tool.slug}`, '_blank')} className="text-xs px-3 py-1.5 bg-black text-white rounded-full">View</button>
                    <button onClick={() => alert(tool.slug)} className="text-xs px-3 py-1.5 bg-white border rounded-full">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
