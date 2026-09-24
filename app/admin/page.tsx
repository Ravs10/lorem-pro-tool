"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMasterInfo, setShowMasterInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("blog");
const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
  if (localStorage.getItem("lorem_admin") === "true") setIsLoggedIn(true)
  fetchTools()
}, []);

const fetchTools = async () => {
  const { data } = await supabase.from("tools").select("*").order("name");
  if (data) setTools(data);
}

  const handleLogin = async () => {
    if(!pass) return alert("Please enter password");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
      const data = await res.json();
      if (data.success) {
        if (data.isMaster) {
          alert("Logged in with Master Key! You have admin access now.");
        }
        localStorage.setItem("lorem_admin", "true");
        setIsLoggedIn(true);
      } else {
        alert("Invalid password!");
      }
    } catch { alert("Something went wrong"); }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("lorem_admin");
    localStorage.removeItem("lorem_pass");
    setIsLoggedIn(false);
    setPass("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-white font-bold text-xl">Lorem Pro Tool</h1>
            <span className="text-[10px] text-cyan-300 border border-cyan-300/30 px-3 py-1 rounded-full">ADMIN PORTAL • v2026.1</span>
          </div>
          <h2 className="text-4xl font-bold text-white text-center mb-2">Admin Login</h2>
          <p className="text-slate-400 text-center text-sm mb-8">Sign in securely to access dashboard</p>
          <label className="text-white/80 text-sm mb-2 block">Admin Password</label>
          <div className="relative mb-3">
            <input type={showPass? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••••••" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 pr-12" />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-white/50">👁️</button>
          </div>
          <div className="text-right mb-6">
            <button onClick={() => setShowMasterInfo(!showMasterInfo)} className="text-cyan-300 text-sm hover:underline">Forgot password? Use Master Key</button>
          </div>
          {showMasterInfo && (
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 mb-4 text-cyan-200 text-xs leading-5">
              Your Master Key is your backup access. If you forgot your admin password, enter your Master Key in the password field above to log in.
            </div>
          )}
          <button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition">{loading? "Logging..." : "Login →"}</button>
          <p className="text-center text-[11px] text-slate-500 mt-6">Protected by end-to-end encryption • Session timeout: 12 hours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Publish Blog Post</h1>
          <button onClick={handleLogout} className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm hover:bg-red-600 transition">Logout</button>
        </div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full border rounded-xl px-4 py-3 mb-4" />
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content" className="w-full border rounded-xl px-4 py-3 h-40 mb-4"></textarea>
        <button onClick={async()=>{
          const {error}=await supabase.from("blogs").insert([{title, content}]);
          if(!error){ alert("Published!"); setTitle(""); setContent(""); } else alert(error.message);
        }} className="bg-black text-white px-6 py-3 rounded-xl w-full">Publish</button>
      </div>
    </div>
  );
}
