"use client";
import { useState, useEffect, useRef} from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [pass, setPass] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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
  const [recoveryRole, setRecoveryRole] = useState<"admin" | "master">("admin");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifType, setNotifType] = useState("info");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isAllTools, setIsAllTools] = useState(true);
  const [notifExpiry, setNotifExpiry] = useState("");
  const [noExpiry, setNoExpiry] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [adminOldPass, setAdminOldPass] = useState("");
  const [adminSelfNewPass, setAdminSelfNewPass] = useState("");
  const [newMasterEmail, setNewMasterEmail] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentFilter, setCommentFilter] = useState<"all"|"pending"|"approved">("all");
  const [trashPosts, setTrashPosts] = useState<any[]>([]);
  const [trashComments, setTrashComments] = useState<any[]>([]);
  const [trashTab, setTrashTab] = useState<"posts"|"comments">("posts");
  // ✅ FIX: Trash count sabko dikhega, Trash kholega sirf Master
  const [trashCount, setTrashCount] = useState(0);
  const [lastTrashMsg, setLastTrashMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store", credentials: "include" });
        const d = await res.json();
        if (d.role) {
          setIsLoggedIn(true);
          setIsMaster(d.role === "master");
          fetchTools(); fetchOffers(); fetchPosts(); fetchComments(); fetchTrashCount();
          if(d.role==="master"){ fetchTrash(); }
        }
      } catch {}
      setAuthChecked(true);
    })();
  }, []);

  const fetchTools = async () => { const { data } = await supabase.from("tools").select("*").order("name"); if (data) setTools(data); };
  const fetchOffers = async () => { const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }); if (data) setOffers(data); };
  // ✅ FIX: is_deleted = false ki jagah != true, taaki NULL wale bhi Live me aaye
  const fetchPosts = async () => { const { data } = await supabase.from("blogs").select("*").neq("is_deleted", true).order("created_at", { ascending: false }); if (data) setPosts(data); };
  const fetchComments = async () => { const { data } = await supabase.from("comments").select("*").neq("is_deleted", true).order("created_at", { ascending: false }); if (data) setComments(data); };
  // ✅ FIX: Sirf Count - Admin aur Master dono ko dikhega
  const fetchTrashCount = async () => {
    const { count: c1 } = await supabase.from("blogs").select("id", { count: "exact", head: true }).eq("is_deleted", true);
    const { count: c2 } = await supabase.from("comments").select("id", { count: "exact", head: true }).eq("is_deleted", true);
    setTrashCount((c1||0) + (c2||0));
  };
  const fetchTrash = async () => {
    const { data: tp } = await supabase.from("blogs").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false });
    if(tp) setTrashPosts(tp);
    const { data: tc } = await supabase.from("comments").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false });
    if(tc) setTrashComments(tc);
    setTrashCount((tp?.length||0) + (tc?.length||0));
  };
  const getToolKey = (t:any) => (t.slug && String(t.slug).trim()!==""? String(t.slug).trim() : String(t.id));
  const cleanSlug = (s:any) => String(s || "").trim().toLowerCase().replace(/\s+/g, '-').replace(/^\/+/,"").replace(/^tools\//,"");

  const handleLogin = async () => {
    if(!pass) return alert("Password likho");
    setLoading(true);
    const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", password: pass }) });
    const d = await res.json();
    if (d.success) { setIsLoggedIn(true); setIsMaster(d.role === "master"); fetchTools(); fetchOffers(); fetchPosts(); fetchComments(); fetchTrashCount(); if(d.role==="master") fetchTrash(); setPass(""); setActiveTab("tools"); } else alert(d.error || "Wrong password");
    setLoading(false);
  };
  const handleSendOtp = async () => {
    setLoading(true);
    const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send-otp", recovery_role: recoveryRole }) });
    const d = await res.json(); setLoading(false);
    if(d.success){ alert(`✅ OTP sent to ${d.maskedEmail || "your email"}`); setOtpSent(true); setShowOtp(true); } else alert("❌ "+(d.error || d.message));
  };
  const handleVerifyOtp = async () => {
    if(!otp) return alert("OTP likho");
    setLoading(true);
    const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify-otp", otp }) });
    const d = await res.json(); setLoading(false);
    if(d.success){ setIsLoggedIn(true); setIsMaster(d.role === "master"); fetchTools(); fetchOffers(); fetchPosts(); fetchComments(); fetchTrashCount(); if(d.role==="master") fetchTrash(); } else alert(d.error || "Wrong OTP");
  };
  const toggleTool = async (tool: any) => { const n =!tool.is_active; setTools((p: any) => p.map((t: any) => t.id === tool.id? {...t, is_active: n } : t)); const { error } = await supabase.from('tools').update({ is_active: n }).eq('id', tool.id); if (error) { alert(error.message); setTools((p: any) => p.map((t: any) => t.id === tool.id? {...t, is_active: tool.is_active } : t)); } };
  const handleToolUpdate = async () => { const { error } = await supabase.from("tools").update({ name: editTool.name, slug: editTool.slug }).eq("id", editTool.id); if (error) alert(error.message); else { setEditTool(null); fetchTools(); } };
  const handlePostUpdate = async () => {
    if(!editPost.title || !editPost.content) return alert("Title + Content likho");
    const slug = String(editPost.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const { error } = await supabase.from("blogs").update({ title: editPost.title, content: editPost.content, slug }).eq("id", editPost.id);
    if(error) alert("❌ "+error.message); else { alert("✅ Post Updated!"); setEditPost(null); setEditingPostId(null); fetchPosts(); }
  };
  const approveComment = async (c:any, val:boolean) => {
    setComments(prev=>prev.map(x=>x.id===c.id? {...x, is_approved: val, approved: val, status: val? "approved":"pending"}: x));
    const { error } = await supabase.from("comments").update({ is_approved: val }).eq("id", c.id);
    if(error) { alert(error.message); fetchComments(); }
  };
  const movePostToTrash = async (p:any) => {
    if(!confirm(`"${p.title}" ko Trash me bheju? Master wapas Restore kar payega.`)) return;
    // Pehle UI se hatao taaki Admin ko turant pata chale
    setPosts(prev=>prev.filter(x=>x.id!==p.id));
    const { error } = await supabase.from("blogs").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: isMaster? "master":"admin" }).eq("id", p.id);
    if(error){ alert("❌ Trash nahi hua: "+error.message+" | SQL chalaya hai?"); fetchPosts(); return; }
    const newCount = trashCount + 1;
    setTrashCount(newCount);
    setLastTrashMsg(`✅ "${p.title}" Trash me gaya! Total Trash: ${newCount}`);
    setTimeout(()=>setLastTrashMsg(""), 4000);
    fetchTrashCount();
    if(isMaster) fetchTrash();
  };
  const moveCommentToTrash = async (c:any) => {
    if(!confirm("Is comment ko Trash me bheju? Master Restore kar payega.")) return;
    setComments(prev=>prev.filter(x=>x.id!==c.id));
    const { error } = await supabase.from("comments").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: isMaster? "master":"admin" }).eq("id", c.id);
    if(error){ alert("❌ Trash nahi hua: "+error.message); fetchComments(); return; }
    const newCount = trashCount + 1;
    setTrashCount(newCount);
    setLastTrashMsg(`✅ Comment Trash me gaya! Total Trash: ${newCount}`);
    setTimeout(()=>setLastTrashMsg(""), 4000);
    fetchTrashCount();
    if(isMaster) fetchTrash();
  };
  const restorePost = async (id:string) => { const { error } = await supabase.from("blogs").update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq("id", id); if(error) alert(error.message); else { alert("♻️ Post Restore ho gaya!"); fetchPosts(); fetchTrash(); fetchTrashCount(); } };
  const permanentDeletePost = async (p:any) => { if(!confirm(`"${p.title}" ko HAMESHA ke liye delete kar du? Ye wapas nahi aayega!`)) return; const { error } = await supabase.from("blogs").delete().eq("id", p.id); if(error) alert(error.message); else { alert("❌ Permanent Delete ho gaya"); fetchTrash(); fetchTrashCount(); } };
  const restoreComment = async (id:string) => { const { error } = await supabase.from("comments").update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq("id", id); if(error) alert(error.message); else { alert("♻️ Comment Restore ho gaya!"); fetchComments(); fetchTrash(); fetchTrashCount(); } };
  const permanentDeleteComment = async (c:any) => { if(!confirm("Is comment ko HAMESHA ke liye delete kar du?")) return; const { error } = await supabase.from("comments").delete().eq("id", c.id); if(error) alert(error.message); else { alert("❌ Comment Permanent Delete"); fetchTrash(); fetchTrashCount(); } };

  const contentRef = useRef(null)
  const renderPreview = (text:any) => { return text.split('\n').map((line:any, i:any) => { if(line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold my-2">{line.slice(4)}</h3>; if(line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold my-3">{line.slice(3)}</h2>; if(line.startsWith('- ')) return <li key={i} className="ml-5 list-disc">{line.replace('- ','')}</li>; let parts = line.split(/(\*\*.*?\*\*)/g); return <p key={i} className="my-1">{parts.map((p:any, j:any) => { if(p.startsWith('**') && p.endsWith('**')) return <b key={j}>{p.slice(2,-2)}</b>; let linkMatch = p.match(/\[(.*)\]\((.*)\)/); if(linkMatch) return <a key={j} href={linkMatch[2]} target="_blank" className="text-blue-600 underline">{linkMatch[1]}</a>; return p })}</p> }) }
  const insertFormat = (b:any, a="") => { const el:any = contentRef.current; if(!el) return; const s = el.selectionStart, e = el.selectionEnd; const sel = content.substring(s,e); const newText = content.substring(0,s) + b + (sel||"text") + a + content.substring(e); setContent(newText); }
  const updatePasswordSecure = async (type: string, newValue: string) => { if(!newValue) return alert("Naya password likho"); const res = await fetch("/api/admin-change", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, newValue, authKey: authForChange }) }); const d = await res.json(); if(d.success){ alert("✅ "+d.message); setNewAdminPass(""); setNewMasterKey(""); setAuthForChange(""); } else alert("❌ "+d.message); }
  const adminSelfChange = async () => { if(!adminOldPass ||!adminSelfNewPass) return alert("Old aur New dono likho"); const res = await fetch("/api/admin-change", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "admin_self", oldValue: adminOldPass, newValue: adminSelfNewPass }) }); const d = await res.json(); if(d.success){ alert("✅ Password changed!"); setAdminOldPass(""); setAdminSelfNewPass(""); } else alert("❌ "+d.message); }
  const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST", cache: "no-store", credentials: "include" }); setIsLoggedIn(false); setIsMaster(false); window.location.href = "/admin"; };
  const filteredComments = comments.filter((c:any)=>{ const approved = c.is_approved===true || c.approved===true || c.status==="approved"; if(commentFilter==="pending") return !approved; if(commentFilter==="approved") return approved; return true; });

  if (!authChecked) { return (<div className="min-h-screen flex items-center justify-center p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}><p className="text-white font-bold text-lg animate-pulse">Loading Admin...</p></div>); }
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 p-8 rounded-[32px] shadow-xl w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-2 text-white">{showOtp? "Verify OTP 🔐" : showForgot? "Master Login 👑" : "Admin Login"}</h1>
          <p className="text-white/70 text-sm mb-6">{showOtp? `OTP for ${recoveryRole}` : showForgot? "Only Master Key allowed" : "Admin Password se login"}</p>
          {!showOtp? (<><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={showForgot? "Enter Master Key ONLY" : "Enter Admin Password"} className="w-full p-4 rounded-2xl bg-white/90 outline-none mb-4"/><button onClick={handleLogin} className="w-full bg-black text-white p-4 rounded-2xl font-bold">{loading?"...": showForgot? "Unlock with Master ONLY" : "Login"}</button><div className="mt-4 border-t border-white/20 pt-4"><p className="text-white/80 text-xs mb-2 text-center">Password / Key bhool gaye?</p><select value={recoveryRole} onChange={e=>setRecoveryRole(e.target.value as any)} className="w-full p-3 rounded-xl bg-white mb-2 text-sm font-bold"><option value="admin">🔑 Recover Admin Password</option><option value="master">👑 Recover Master Key</option></select><button onClick={handleSendOtp} className="w-full bg-white text-black p-3 rounded-2xl font-bold text-sm">{loading? "..." : `📧 Send ${recoveryRole} OTP`}</button></div><button onClick={()=>setShowForgot(!showForgot)} className="w-full mt-3 text-white/90 text-sm underline">{showForgot? "Back to Admin Login" : "Use Master Key instead"}</button></>) : (<><input type="text" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter 6 digit OTP" className="w-full p-4 rounded-2xl bg-white/90 outline-none mb-4 text-center text-xl tracking-widest"/><button onClick={handleVerifyOtp} className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold">{loading?"...": `Verify & Login as ${recoveryRole}`}</button><button onClick={()=>{setShowOtp(false); setOtpSent(false)}} className="w-full mt-4 text-white/90 text-sm underline">Back to Login</button><button onClick={handleSendOtp} className="w-full mt-2 text-white/80 text-xs underline">Resend OTP</button></>)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-white">⚡ Lorem Pro Tool {isMaster? "👑 MASTER" : "🛡️ ADMIN"}</h1><button onClick={handleLogout} className="px-4 py-2 bg-white/90 rounded-full shadow text-sm">Logout</button></div>
        {lastTrashMsg && <div className="mb-4 p-3 bg-green-500 text-white rounded-xl font-bold text-sm text-center animate-pulse">{lastTrashMsg}</div>}
        <div className="flex gap-2 mb-6 p-1.5 bg-white/20 backdrop-blur-xl rounded-full w-fit border border-white/30 flex-wrap">
          <button onClick={()=>setActiveTab("tools")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="tools"?"bg-white text-black shadow":"text-white/80"}`}>Tools</button>
          <button onClick={()=>setActiveTab("blog")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="blog"?"bg-white text-black shadow":"text-white/80"}`}>Blog</button>
          <button onClick={()=>{setActiveTab("posts"); fetchPosts();}} className={`px-6 py-2.5 rounded-full font-bold ${activeTab==="posts"?"bg-black text-white shadow":"bg-black text-white"}`}>📝 Posts ({posts.length})</button>
          <button onClick={()=>{setActiveTab("comments"); fetchComments();}} className={`px-6 py-2.5 rounded-full font-bold ${activeTab==="comments"?"bg-white text-black shadow":"text-white/80"}`}>💬 Comments ({comments.length})</button>
          <button onClick={()=>{ if(!isMaster){ alert("🗑️ Trash sirf Master dekh sakta hai. Tumne Trash me bheja hai, Master Restore kar dega."); return; } setActiveTab("trash"); fetchTrash(); }} className={`px-6 py-2.5 rounded-full font-bold ${activeTab==="trash"?"bg-red-600 text-white shadow":"bg-red-500 text-white"}`}>🗑️ Trash ({trashCount})</button>
          {!isMaster && <button onClick={()=>setActiveTab("myaccount")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="myaccount"?"bg-white text-black shadow":"text-white/80"}`}>👤 My Account</button>}
          {isMaster && <button onClick={()=>setActiveTab("settings")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="settings"?"bg-white text-black shadow":"text-white/80"}`}>⚙️ Settings</button>}
          {isMaster && <button onClick={()=>setActiveTab("announcements")} className={`px-6 py-2.5 rounded-full font-bold ${activeTab==="announcements"?"bg-yellow-400 text-black shadow":"text-white/80 bg-black/20"}`}>📢 Offers</button>}
        </div>

        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-[24px] p-6 shadow-xl">
          {activeTab==="tools"?(
            <>
              <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-white text-lg">Tools Control ({tools.length})</h2><button onClick={async()=>{ if(!confirm("Saare khali slugs ko naam se auto-generate kar du?")) return; setLoading(true); for(const t of tools){ if(!t.slug || String(t.slug).trim()===""){ const newSlug = String(t.name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); await supabase.from("tools").update({slug:newSlug}).eq("id", t.id); } } setLoading(false); alert("✅ Saare slugs fix ho gaye!"); fetchTools(); }} className="px-4 py-2 bg-yellow-400 text-black rounded-full text-xs font-bold">{loading? "..." : "🛠️ Fix Empty Slugs (1 Click)"}</button></div>
              <div className="grid gap-3">{tools.map((tool:any)=>(<div key={tool.id} className={`p-4 rounded-2xl backdrop-blur border shadow-sm flex justify-between items-center transition-all ${tool.is_active? "bg-white/90 border-white/50" : "bg-red-50/80 border-red-200 opacity-70"}`}><div className="flex items-center gap-3"><button onClick={()=>toggleTool(tool)} className={`w-12 h-7 rounded-full p-1 transition-all ${tool.is_active? "bg-green-500" : "bg-gray-300"}`}><div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${tool.is_active? "translate-x-5" : "translate-x-0"}`}></div></button><div><p className="font-semibold">{tool.name}</p><p className="text-xs text-gray-500">{tool.is_active? "🟢 Live" : "🔴 Disabled"} - {tool.slug? tool.slug : "❌ SLUG KHALI - Fix button dabao"}</p><p className="text-[10px] text-blue-500">/{cleanSlug(tool.slug)}</p></div></div><div className="flex gap-2">{tool.slug && String(tool.slug).trim()!=="" ? (<a href={`/${cleanSlug(tool.slug)}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-2 bg-black text-white rounded-full">View</a>) : (<button onClick={()=>alert("Slug khali hai - Pehle Edit karke Slug dalo")} className="text-xs px-3 py-2 bg-gray-400 text-white rounded-full">View</button>)}<button onClick={()=>setEditTool(tool)} className="text-xs px-3 py-2 bg-white border rounded-full">Edit</button></div></div>))}</div>
            </>
          ): activeTab==="posts"? (
            <div className="space-y-3 bg-white/90 p-5 rounded-2xl"><h2 className="font-bold text-lg">📝 All Posts ({posts.length})</h2><p className="text-xs text-gray-500">🗑️ Trash me abhi: <b>{trashCount}</b> item hai - Master ke paas hai</p>{posts.length===0 && <p className="text-sm text-gray-500">Koi Post nahi hai. Blog Tab se Post karo.</p>}{posts.map((p:any)=>(<div key={p.id} className="p-3 border rounded-xl flex justify-between items-center gap-3"><div><p className="font-bold text-sm">{p.title}</p><p className="text-[11px] text-gray-500">/blog/{p.slug}</p></div><div className="flex gap-2 flex-wrap justify-end"><a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-bold">View</a><button onClick={()=>{ setEditPost({...p}); setEditingPostId(p.id); }} className="px-3 py-1.5 bg-yellow-400 text-black rounded-full text-xs font-bold">Edit</button><button onClick={()=>movePostToTrash(p)} className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold">🗑️ Trash</button></div></div>))}</div>
          ): activeTab==="comments"? (
            <div className="space-y-3 bg-white/90 p-5 rounded-2xl"><div className="flex justify-between items-center flex-wrap gap-2"><h2 className="font-bold text-lg">💬 Comments ({filteredComments.length}/{comments.length})</h2><div className="flex gap-1 bg-gray-100 p-1 rounded-full"><button onClick={()=>setCommentFilter("all")} className={`px-3 py-1 rounded-full text-xs font-bold ${commentFilter==="all"?"bg-black text-white":""}`}>All</button><button onClick={()=>setCommentFilter("pending")} className={`px-3 py-1 rounded-full text-xs font-bold ${commentFilter==="pending"?"bg-yellow-400 text-black":""}`}>⏳ Pending</button><button onClick={()=>setCommentFilter("approved")} className={`px-3 py-1 rounded-full text-xs font-bold ${commentFilter==="approved"?"bg-green-600 text-white":""}`}>✅ Approved</button></div></div><p className="text-xs text-gray-500">🗑️ Trash me abhi: <b>{trashCount}</b> item hai</p>{filteredComments.length===0 && <p className="text-sm text-gray-500">Koi comment nahi hai is filter me.</p>}{filteredComments.map((c:any)=>{ const approved = c.is_approved===true || c.approved===true || c.status==="approved"; return (<div key={c.id} className={`p-3 border rounded-xl ${approved? "bg-green-50 border-green-200":"bg-yellow-50 border-yellow-200"}`}><div className="flex justify-between gap-2 flex-wrap"><p className="font-bold text-sm">{c.name || c.author || c.user_name || "Anonymous"} <span className={`text-[10px] px-2 py-0.5 rounded-full ml-1 ${approved?"bg-green-200 text-green-800":"bg-yellow-200 text-yellow-800"}`}>{approved?"✅ Approved":"⏳ Pending"}</span></p><p className="text-[11px] text-gray-500">{c.created_at? new Date(c.created_at).toLocaleString() : ""}</p></div><p className="text-sm text-gray-700 mt-1">{c.comment || c.message || c.text || c.content}</p><p className="text-[11px] text-blue-600 mt-1">Post: {c.blog_slug || c.blog_id || c.post_slug || c.slug || "-"}</p><div className="flex gap-2 mt-2">{!approved ? (<button onClick={()=>approveComment(c, true)} className="px-4 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold">✅ Approve</button>) : (<button onClick={()=>approveComment(c, false)} className="px-4 py-1.5 bg-yellow-400 text-black rounded-full text-xs font-bold">⏳ Unapprove</button>)}<button onClick={()=>moveCommentToTrash(c)} className="px-4 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold">🗑️ Trash</button></div></div>); })}</div>
          ): activeTab==="trash" && isMaster? (
            <div className="space-y-4 bg-white/90 p-5 rounded-2xl"><h2 className="font-bold text-lg">🗑️ Master Trash - 👑 Sirf Master Control ({trashCount})</h2><p className="text-xs text-gray-500">Admin ne jo Delete kiya, wo yaha hai. Restore karo ya Permanent Delete karo.</p><div className="flex gap-2"><button onClick={()=>setTrashTab("posts")} className={`px-4 py-2 rounded-full text-xs font-bold ${trashTab==="posts"?"bg-black text-white":"bg-gray-100"}`}>📝 Trash Posts ({trashPosts.length})</button><button onClick={()=>setTrashTab("comments")} className={`px-4 py-2 rounded-full text-xs font-bold ${trashTab==="comments"?"bg-black text-white":"bg-gray-100"}`}>💬 Trash Comments ({trashComments.length})</button><button onClick={()=>fetchTrash()} className="px-4 py-2 rounded-full text-xs font-bold bg-blue-100">🔄 Refresh</button></div>{trashTab==="posts" && (<div className="space-y-2">{trashPosts.length===0 && <p className="text-sm text-gray-500">Trash khali hai ✅</p>}{trashPosts.map((p:any)=>(<div key={p.id} className="p-3 border border-red-200 bg-red-50 rounded-xl"><p className="font-bold text-sm">{p.title}</p><p className="text-[11px] text-gray-500">Deleted by: <b>{p.deleted_by || "admin"}</b> | {p.deleted_at? new Date(p.deleted_at).toLocaleString() : ""} | /blog/{p.slug}</p><div className="flex gap-2 mt-2"><button onClick={()=>restorePost(p.id)} className="px-4 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold">♻️ Restore</button><button onClick={()=>permanentDeletePost(p)} className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold">❌ Permanent Delete</button></div></div>))}</div>)}{trashTab==="comments" && (<div className="space-y-2">{trashComments.length===0 && <p className="text-sm text-gray-500">Trash khali hai ✅</p>}{trashComments.map((c:any)=>(<div key={c.id} className="p-3 border border-red-200 bg-red-50 rounded-xl"><p className="font-bold text-sm">{c.name || c.author || "Anonymous"}</p><p className="text-sm text-gray-700">{c.comment || c.message || c.text || c.content}</p><p className="text-[11px] text-gray-500">Deleted by: <b>{c.deleted_by || "admin"}</b> | {c.deleted_at? new Date(c.deleted_at).toLocaleString() : ""}</p><div className="flex gap-2 mt-2"><button onClick={()=>restoreComment(c.id)} className="px-4 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold">♻️ Restore</button><button onClick={()=>permanentDeleteComment(c)} className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold">❌ Permanent Delete</button></div></div>))}</div>)}</div>
          ): activeTab==="myaccount"? (
            <div className="space-y-4 bg-white/90 p-5 rounded-2xl"><h2 className="font-bold text-lg">👤 Admin Control Panel</h2><input type="password" value={adminOldPass} onChange={e=>setAdminOldPass(e.target.value)} placeholder="Old Admin Password" className="w-full p-3 rounded-xl border" /><input type="password" value={adminSelfNewPass} onChange={e=>setAdminSelfNewPass(e.target.value)} placeholder="New Admin Password" className="w-full p-3 rounded-xl border" /><button onClick={adminSelfChange} className="w-full bg-black text-white p-4 rounded-xl font-bold">🔑 Change My Password</button></div>
          ): activeTab==="announcements" && isMaster? (
            <div className="space-y-4 bg-white/90 p-5 rounded-2xl"><h2 className="font-bold text-lg">📢 Master Offer {editingOfferId && <span className="text-xs bg-yellow-200 px-2 py-1 rounded-full ml-2">Editing</span>}</h2><input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeholder="Title" className="w-full p-3 rounded-xl border font-bold" /><textarea value={notifMsg} onChange={e=>setNotifMsg(e.target.value)} placeholder="Message" className="w-full p-3 rounded-xl border h-24"></textarea><select value={notifType} onChange={e=>setNotifType(e.target.value)} className="w-full p-3 rounded-xl border font-bold bg-white"><option value="info">🔵 Info - Blue</option><option value="offer">🟢 Offer - Green</option><option value="alert">🔴 Alert - Red</option><option value="warning">🟡 Warning - Orange</option><option value="premium">⚫ Premium - Black Gold</option><option value="diwali">💜 Diwali - Purple</option></select><div className="bg-gray-50 p-3 rounded-xl border"><label className="flex items-center gap-2 text-sm font-bold mb-3 cursor-pointer"><input type="checkbox" checked={isAllTools} onChange={e=>{ const c=e.target.checked; setIsAllTools(c); if(c) setSelectedTools([]); }} className="w-5 h-5" />📍 Show on ALL Tools</label>{!isAllTools && (<><div className="flex justify-between mb-2"><span className="text-xs font-bold">Tools:</span><div className="flex gap-2"><button type="button" onClick={()=>setSelectedTools(tools.map((t:any)=>getToolKey(t)))} className="text-xs bg-black text-white px-2 py-1 rounded-full">All Select</button><button type="button" onClick={()=>setSelectedTools([])} className="text-xs bg-gray-200 px-2 py-1 rounded-full">Clear</button></div></div><div className="bg-white border rounded-lg max-h-[220px] overflow-y-auto p-2 grid gap-1">{tools.map((t:any)=>{ const key = getToolKey(t); const checked = selectedTools.includes(key); return (<label key={key} className="flex items-center gap-2 text-sm p-2 hover:bg-gray-100 rounded cursor-pointer"><input type="checkbox" checked={checked} onChange={(e)=>{ const isChecked = e.target.checked; setSelectedTools(prev => isChecked? [...prev, key] : prev.filter(k=>k!==key)); }} className="w-4 h-4" />{t.name} <span className="text-[10px] text-gray-400">({key})</span></label>) })}</div></>)}<p className="text-[11px] mt-2 font-bold text-blue-600">{isAllTools? '✓ ALL par dikhega' : selectedTools.length>0? `✓ ${selectedTools.length} selected: ${selectedTools.join(', ')}` : '❌ Koi select nahi'}</p></div><div className="bg-gray-50 p-3 rounded-xl border"><label className="flex items-center gap-2 text-sm font-bold mb-2 cursor-pointer"><input type="checkbox" checked={noExpiry} onChange={e=>{ setNoExpiry(e.target.checked); if(e.target.checked) setNotifExpiry(""); }} className="w-4 h-4" />♾️ Lifetime</label>{!noExpiry && <input type="datetime-local" value={notifExpiry} onChange={e=>setNotifExpiry(e.target.value)} className="w-full p-3 rounded-xl border mt-1 bg-white" />}</div><div className="flex gap-2"><button onClick={async()=>{ const finalTarget = isAllTools? "all" : selectedTools.join(','); if(!notifTitle||!notifMsg) return alert("Title + Message likho"); if(!isAllTools && selectedTools.length===0) return alert("1 tool select karo"); setLoading(true); const payload = {title:notifTitle,message:notifMsg,type:notifType,target_tool:finalTarget, expires_at: noExpiry ||!notifExpiry? null : new Date(notifExpiry).toISOString(), is_active: true}; let error; if(editingOfferId){ const res = await supabase.from("notifications").update(payload).eq("id", editingOfferId); error=res.error; } else { const res = await supabase.from("notifications").insert([payload]); error=res.error; } setLoading(false); if(error) alert("❌ "+error.message); else { alert(editingOfferId? "✅ Updated!" : "✅ Published!"); setNotifTitle(""); setNotifMsg(""); setNotifExpiry(""); setNoExpiry(true); setIsAllTools(true); setSelectedTools([]); setEditingOfferId(null); fetchOffers(); } }} className="flex-1 bg-black text-white p-4 rounded-xl font-bold">{loading? "..." : editingOfferId? "💾 Update" : "🚀 Publish"}</button>{editingOfferId && <button onClick={()=>{ setEditingOfferId(null); setNotifTitle(""); setNotifMsg(""); setNotifExpiry(""); setNoExpiry(true); setIsAllTools(true); setSelectedTools([]); }} className="px-6 bg-gray-200 rounded-xl font-bold">Cancel</button>}</div><div className="mt-6 border-t pt-4"><h3 className="font-bold text-base mb-3">📋 Live Offers ({offers.length}) - Tick karke ON/OFF karo</h3><div className="grid gap-2">{offers.map((o:any)=>(<div key={o.id} className={`p-3 border rounded-xl shadow-sm flex gap-3 items-start ${o.is_active===false? 'bg-gray-100 opacity-60' : 'bg-white'}`}><input type="checkbox" checked={o.is_active!==false} onChange={async(e)=>{ const newVal = e.target.checked; setOffers(prev=>prev.map(x=>x.id===o.id? {...x, is_active: newVal}: x)); const {error} = await supabase.from("notifications").update({is_active: newVal}).eq("id", o.id); if(error) alert(error.message); }} className="w-5 h-5 mt-1" title="ON/OFF publish" /><div className="flex-1"><p className="font-bold text-sm">{o.title} <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-gray-100">{o.type}</span> {o.is_active===false && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-1">OFF</span>}</p><p className="text-xs text-gray-600 mt-1">{o.message}</p><p className="text-[10px] text-gray-500 mt-1 break-all">🎯 {o.target_tool} | {o.expires_at? `⏰ ${new Date(o.expires_at).toLocaleString()}` : '♾️ Lifetime'}</p><div className="flex gap-2 mt-2"><button onClick={()=>{ setNotifTitle(o.title); setNotifMsg(o.message); setNotifType(o.type); setEditingOfferId(o.id); if(o.target_tool==='all'){ setIsAllTools(true); setSelectedTools([]); } else { setIsAllTools(false); setSelectedTools(o.target_tool.split(',').map((s:string)=>s.trim()).filter(Boolean)); } if(o.expires_at){ setNoExpiry(false); const d=new Date(o.expires_at); const pad=(n:number)=>String(n).padStart(2,'0'); setNotifExpiry(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`); } else { setNoExpiry(true); } window.scrollTo({top:0, behavior:'smooth'}); }} className="px-4 py-1.5 bg-yellow-400 text-black rounded-full text-xs font-bold">Edit</button><button onClick={async()=>{ if(!confirm("Delete?")) return; await supabase.from("notifications").delete().eq("id", o.id); fetchOffers(); }} className="px-4 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold">Delete</button></div></div></div>))}</div></div></div>
          ): activeTab==="settings" && isMaster? (
            <div className="space-y-6"><h2 className="font-bold text-white text-lg">🔐 Master Settings</h2><div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-2xl"><p className="text-xs font-bold mb-2">Master Key Verification (Agar OTP se login ho to khali chhod sakte ho)</p><input value={authForChange} onChange={e=>setAuthForChange(e.target.value)} type="password" placeholder="Master Key (optional if logged in via OTP)" className="w-full p-3 rounded-xl border-2 border-yellow-400 bg-white" /></div><div className="bg-white/90 p-5 rounded-2xl"><div className="flex gap-2"><input value={newAdminPass} onChange={e=>setNewAdminPass(e.target.value)} placeholder="New Admin Password" className="flex-1 p-3 rounded-xl border" /><button onClick={()=>updatePasswordSecure("admin_password", newAdminPass)} className="px-6 bg-black text-white rounded-xl font-bold">Reset</button></div></div><div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl"><div className="flex gap-2"><input value={newMasterKey} onChange={e=>setNewMasterKey(e.target.value)} placeholder="New Master Key" className="flex-1 p-3 rounded-xl border" /><button onClick={()=>updatePasswordSecure("master_key", newMasterKey)} className="px-6 bg-yellow-400 text-black rounded-xl font-bold">Update</button></div></div><div className="bg-blue-50 border border-blue-300 p-5 rounded-2xl"><h3 className="font-bold text-sm mb-2">📧 Emergency Email Change</h3><p className="text-xs text-gray-500 mb-2">Master Key bhool gaye? OTP se login hai to yahan se email change kar sakte ho</p><div className="flex gap-2"><input value={newMasterEmail} onChange={e=>setNewMasterEmail(e.target.value)} placeholder="New Recovery Email" className="flex-1 p-3 rounded-xl border" /><button onClick={async()=>{ if(!newMasterEmail.includes("@")) return alert("Valid email likho"); setLoading(true); const res = await fetch("/api/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "change-master-email", newEmail: newMasterEmail }) }); const d = await res.json(); setLoading(false); if(d.success){ alert(`✅ Email updated to ${d.maskedEmail}`); setNewMasterEmail(""); } else alert("❌ "+(d.error || d.message)); }} className="px-6 bg-blue-600 text-white rounded-xl font-bold">{loading? "..." : "Update Email"}</button></div></div></div>
          ):(
            <><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Blog Title" className="w-full p-4 rounded-xl border mb-2" /><div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl mb-2 items-center"><button type="button" onClick={()=>insertFormat("**","**")}>B</button><button type="button" onClick={()=>insertFormat("\n## ","")}>H2</button><button type="button" onClick={()=>insertFormat("\n### ","")}>H3</button><button type="button" onClick={()=>insertFormat("\n- ","")}>List</button><button type="button" onClick={()=>insertFormat("[", "](https://)")} >Link</button><button type="button" onClick={()=>setShowPreview(!showPreview)} className="ml-auto px-3 py-1 bg-purple-600 text-white rounded-lg">{showPreview? "Edit" : "Preview"}</button></div>{!showPreview? (<textarea ref={contentRef} value={content} onChange={e=>setContent(e.target.value)} placeholder="Blog Content..." className="w-full h-[300px] p-4 rounded-xl border" />) : (<div className="w-full h-[300px] p-4 rounded-xl border bg-white overflow-y-auto whitespace-pre-wrap"><h2 className="font-bold text-lg mb-2">{title}</h2><div>{renderPreview(content)}</div></div>)}<button onClick={async()=>{ if(!title ||!content) return alert("Fill all"); setLoading(true); const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); const { error } = await supabase.from("blogs").insert([{title, content, slug}]); if(error){ alert("❌ "+error.message); } else { alert("✅ Posted!"); setTitle(""); setContent(""); fetchPosts(); } setLoading(false); }} className="w-full bg-black text-white p-4 rounded-xl font-bold mt-2">{loading? "Posting..." : "Post Blog"}</button></>
          )}
        </div>
        {editTool && (<div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"><div className="bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl"><h3 className="font-bold text-lg mb-4">Edit Tool</h3><input value={editTool.name} onChange={e=>setEditTool({...editTool, name:e.target.value})} className="w-full p-3 rounded-xl border mb-3"/><input value={editTool.slug} onChange={e=>setEditTool({...editTool, slug:e.target.value})} className="w-full p-3 rounded-xl border mb-3"/><div className="flex gap-2"><button onClick={()=>setEditTool(null)} className="flex-1 p-3 rounded-xl border">Cancel</button><button onClick={handleToolUpdate} className="flex-1 p-3 rounded-xl bg-black text-white">Save</button></div></div></div>)}
        {editPost && (<div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"><div className="bg-white rounded-[24px] p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"><h3 className="font-bold text-lg mb-4">✏️ Edit Post</h3><input value={editPost.title} onChange={e=>setEditPost({...editPost, title:e.target.value})} placeholder="Post Title" className="w-full p-3 rounded-xl border mb-3"/><textarea value={editPost.content} onChange={e=>setEditPost({...editPost, content:e.target.value})} placeholder="Post Content" className="w-full h-[250px] p-3 rounded-xl border mb-3"/><div className="flex gap-2"><button onClick={()=>{setEditPost(null); setEditingPostId(null);}} className="flex-1 p-3 rounded-xl border">Cancel</button><button onClick={handlePostUpdate} className="flex-1 p-3 rounded-xl bg-black text-white font-bold">💾 Update Post</button></div></div></div>)}
      </div>
    </div>
  );
}
