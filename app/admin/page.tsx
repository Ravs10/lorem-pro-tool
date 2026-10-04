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
  const [notifTarget, setNotifTarget] = useState("all");
  const [notifExpiry, setNotifExpiry] = useState("");
  const [noExpiry, setNoExpiry] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  const [adminOldPass, setAdminOldPass] = useState("");
  const [adminSelfNewPass, setAdminSelfNewPass] = useState("");

  const RECOVERY_EMAIL = "run4ravish@gmail.com";

  useEffect(() => {
    if (localStorage.getItem("lorem_admin") === "true") {
      setIsLoggedIn(true);
      setIsMaster(localStorage.getItem("lorem_is_master")==="true");
      fetchTools();
      fetchOffers();
    }
  }, []);

  const fetchTools = async () => {
    const { data } = await supabase.from("tools").select("*").order("name");
    if (data) setTools(data);
  };

  const fetchOffers = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (data) setOffers(data);
  };

  const handleLogin = async () => {
    if(!pass) return alert("Password likho");
    setLoading(true);
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", password: pass, isMasterLogin: showForgot })
    });
    const d = await res.json();
    if (d.success) {
      localStorage.setItem("lorem_admin", "true");
      localStorage.setItem("lorem_is_master", d.is_master? "true" : "false");
      localStorage.setItem("lorem_role", d.role || (d.is_master? "master" : "admin"));
      setIsLoggedIn(true);
      setIsMaster(!!d.is_master);
      fetchTools();
      fetchOffers();
      setPass("");
      setActiveTab("tools");
    } else alert(d.error || "Wrong password");
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send-otp", recovery_role: recoveryRole })
    });
    const d = await res.json();
    setLoading(false);
    if(d.success){
      alert(`✅ ${recoveryRole.toUpperCase()} OTP sent to ${RECOVERY_EMAIL}`);
      setOtpSent(true);
      setShowOtp(true);
    } else alert("❌ "+(d.error || d.message));
  };

  const handleVerifyOtp = async () => {
    if(!otp) return alert("OTP likho");
    setLoading(true);
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-otp", otp })
    });
    const d = await res.json();
    setLoading(false);
    if(d.success){
      localStorage.setItem("lorem_admin", "true");
      localStorage.setItem("lorem_is_master", d.is_master? "true" : "false");
      localStorage.setItem("lorem_role", d.role || "admin");
      setIsLoggedIn(true);
      setIsMaster(!!d.is_master);
      fetchTools();
      fetchOffers();
    } else alert(d.error || "Wrong OTP");
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
const updatePasswordSecure = async (type: string, newValue: string) => {
  if(!newValue) return alert("Naya password likho");
  if(!authForChange) return alert("Pehle Master Key se verify karo");
  const res = await fetch("/api/admin-change", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, newValue, authKey: authForChange }) });
  const d = await res.json();
  if(d.success){ alert("✅ "+d.message); setNewAdminPass(""); setNewMasterKey(""); setAuthForChange(""); }
  else alert("❌ "+d.message);
}

const adminSelfChange = async () => {
  if(!adminOldPass ||!adminSelfNewPass) return alert("Old aur New dono likho");
  const res = await fetch("/api/admin-change", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "admin_self", oldValue: adminOldPass, newValue: adminSelfNewPass }) });
  const d = await res.json();
  if(d.success){ alert("✅ Password changed!"); setAdminOldPass(""); setAdminSelfNewPass(""); }
  else alert("❌ "+d.message);
}

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 p-8 rounded-[32px] shadow-xl w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-2 text-white">{showOtp? "Verify OTP 🔐" : showForgot? "Master Login 👑" : "Admin Login"}</h1>
          <p className="text-white/70 text-sm mb-6">{showOtp? `OTP for ${recoveryRole}` : showForgot? "Only Master Key allowed" : "Admin Password se login"}</p>
          {!showOtp? (
            <>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={showForgot? "Enter Master Key ONLY" : "Enter Admin Password"} className="w-full p-4 rounded-2xl bg-white/90 outline-none mb-4"/>
              <button onClick={handleLogin} className="w-full bg-black text-white p-4 rounded-2xl font-bold">{loading?"...": showForgot? "Unlock with Master ONLY" : "Login"}</button>
              <div className="mt-4 border-t border-white/20 pt-4">
                <p className="text-white/80 text-xs mb-2 text-center">Password / Key bhool gaye?</p>
                <select value={recoveryRole} onChange={e=>setRecoveryRole(e.target.value as any)} className="w-full p-3 rounded-xl bg-white mb-2 text-sm font-bold">
                  <option value="admin">🔑 Recover Admin Password</option>
                  <option value="master">👑 Recover Master Key</option>
                </select>
                <button onClick={handleSendOtp} className="w-full bg-white text-black p-3 rounded-2xl font-bold text-sm">{loading? "..." : `📧 Send ${recoveryRole} OTP`}</button>
              </div>
              <button onClick={()=>setShowForgot(!showForgot)} className="w-full mt-3 text-white/90 text-sm underline">{showForgot? "Back to Admin Login" : "Use Master Key instead"}</button>
            </>
          ) : (
            <>
              <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter 6 digit OTP" className="w-full p-4 rounded-2xl bg-white/90 outline-none mb-4 text-center text-xl tracking-widest"/>
              <button onClick={handleVerifyOtp} className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold">{loading?"...": `Verify & Login as ${recoveryRole}`}</button>
              <button onClick={()=>{setShowOtp(false); setOtpSent(false)}} className="w-full mt-4 text-white/90 text-sm underline">Back to Login</button>
              <button onClick={handleSendOtp} className="w-full mt-2 text-white/80 text-xs underline">Resend OTP</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">⚡ Lorem Pro Tool {isMaster? "👑 MASTER" : "🛡️ ADMIN"}</h1>
          <button onClick={()=>{localStorage.clear(); location.reload()}} className="px-4 py-2 bg-white/90 rounded-full shadow text-sm">Logout</button>
        </div>
        <div className="flex gap-2 mb-6 p-1.5 bg-white/20 backdrop-blur-xl rounded-full w-fit border border-white/30 flex-wrap">
          <button onClick={()=>setActiveTab("tools")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="tools"?"bg-white text-black shadow":"text-white/80"}`}>Tools</button>
          <button onClick={()=>setActiveTab("blog")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="blog"?"bg-white text-black shadow":"text-white/80"}`}>Blog</button>
          {!isMaster && <button onClick={()=>setActiveTab("myaccount")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="myaccount"?"bg-white text-black shadow":"text-white/80"}`}>👤 My Account</button>}
          {isMaster && <button onClick={()=>setActiveTab("settings")} className={`px-6 py-2.5 rounded-full font-medium ${activeTab==="settings"?"bg-white text-black shadow":"text-white/80"}`}>⚙️ Settings</button>}
          {isMaster && <button onClick={()=>setActiveTab("announcements")} className={`px-6 py-2.5 rounded-full font-bold ${activeTab==="announcements"?"bg-yellow-400 text-black shadow":"text-white/80 bg-black/20"}`}>📢 Offers</button>}
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
          ): activeTab==="myaccount"? (
            <div className="space-y-4 bg-white/90 p-5 rounded-2xl">
              <h2 className="font-bold text-lg">👤 Admin Control Panel</h2>
              <p className="text-xs text-gray-600">Aap yaha apna Admin password khud change kar sakte ho.</p>
              <input type="password" value={adminOldPass} onChange={e=>setAdminOldPass(e.target.value)} placeholder="Old Admin Password" className="w-full p-3 rounded-xl border" />
              <input type="password" value={adminSelfNewPass} onChange={e=>setAdminSelfNewPass(e.target.value)} placeholder="New Admin Password" className="w-full p-3 rounded-xl border" />
              <button onClick={adminSelfChange} className="w-full bg-black text-white p-4 rounded-xl font-bold">🔑 Change My Password</button>
            </div>
          ): activeTab==="announcements" && isMaster? (
            <div className="space-y-4 bg-white/90 p-5 rounded-2xl">
              <h2 className="font-bold text-lg">📢 Master Offer + Auto Expiry {editingOfferId && <span className="text-xs bg-yellow-200 px-2 py-1 rounded-full ml-2">Editing Mode</span>}</h2>
              <input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeholder="Title - e.g. Diwali 50% OFF" className="w-full p-3 rounded-xl border font-bold" />
              <textarea value={notifMsg} onChange={e=>setNotifMsg(e.target.value)} placeholder="Message - e.g. Use code DIWALI50" className="w-full p-3 rounded-xl border h-24"></textarea>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select value={notifType} onChange={e=>setNotifType(e.target.value)} className="p-3 rounded-xl border font-bold bg-white">
                  <option value="info">🔵 Info - Blue</option>
                  <option value="offer">🟢 Offer - Green</option>
                  <option value="alert">🔴 Alert - Red</option>
                  <option value="warning">🟡 Warning - Orange/Yellow</option>
                  <option value="premium">⚫ Premium - Black + Gold</option>
                  <option value="diwali">💜 Diwali - Purple Pink</option>
                </select>
                <select value={notifTarget} onChange={e=>setNotifTarget(e.target.value)} className="p-3 rounded-xl border flex-1 bg-white"><option value="all">📍 Show on ALL Tools</option>{tools.map((t:any)=><option key={t.id} value={t.slug}>{t.name} only</option>)}</select>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border">
                <label className="flex items-center gap-2 text-sm font-bold mb-2 cursor-pointer">
                  <input type="checkbox" checked={noExpiry} onChange={e=>{ setNoExpiry(e.target.checked); if(e.target.checked) setNotifExpiry(""); }} className="w-4 h-4" />
                  ♾️ Post without Expiry (Lifetime - ye option wapas laga diya)
                </label>
                {!noExpiry && (
                  <>
                    <label className="text-xs font-bold text-gray-600">⏰ Auto Expiry Date</label>
                    <input type="datetime-local" value={notifExpiry} onChange={e=>setNotifExpiry(e.target.value)} className="w-full p-3 rounded-xl border mt-1 bg-white" />
                  </>
                )}
                {noExpiry && <p className="text-[11px] text-green-600 font-medium">✓ Ye offer kabhi expire nahi hoga</p>}
              </div>

              <div className="flex gap-2">
                <button onClick={async()=>{
                  if(!notifTitle||!notifMsg) return alert("Title + Message likho");
                  setLoading(true);
                  let error;
                  const payload = {title:notifTitle,message:notifMsg,type:notifType,target_tool:notifTarget, expires_at: noExpiry ||!notifExpiry? null : new Date(notifExpiry).toISOString()};
                  if(editingOfferId){
                    const res = await supabase.from("notifications").update(payload).eq("id", editingOfferId);
                    error = res.error;
                  } else {
                    const res = await supabase.from("notifications").insert([{...payload, is_active: true }]);
                    error = res.error;
                  }
                  setLoading(false);
                  if(error) alert("❌ "+error.message);
                  else { alert(editingOfferId? "✅ Updated!" : "✅ Published!"); setNotifTitle(""); setNotifMsg(""); setNotifExpiry(""); setNoExpiry(true); setEditingOfferId(null); fetchOffers(); }
                }} className="flex-1 bg-black text-white p-4 rounded-xl font-bold">{loading? "..." : editingOfferId? "💾 Update Offer" : noExpiry? "🚀 Publish Lifetime" : "🚀 Publish with Expiry"}</button>
                {editingOfferId && <button onClick={()=>{ setEditingOfferId(null); setNotifTitle(""); setNotifMsg(""); setNotifExpiry(""); setNoExpiry(true); }} className="px-6 bg-gray-200 rounded-xl font-bold">Cancel</button>}
              </div>

              <div className="mt-8 border-t pt-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-base">📋 Live Offers ({offers.length})</h3>
                  <button onClick={fetchOffers} className="text-xs px-3 py-1 bg-gray-100 rounded-full">Refresh</button>
                </div>
                {offers.length===0? <p className="text-sm text-gray-500 text-center py-4">Koi offer nahi hai</p> : (
                  <div className="grid gap-2">
                    {offers.map((o:any)=>(
                      <div key={o.id} className="p-3 border rounded-xl flex justify-between items-center bg-white shadow-sm">
                        <div className="flex-1">
                          <p className="font-bold text-sm flex items-center gap-2">{o.title} <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                            ${o.type==='offer'?'bg-green-100 text-green-700': o.type==='alert'?'bg-red-100 text-red-700': o.type==='warning'?'bg-amber-100 text-amber-700': o.type==='premium'?'bg-black text-yellow-400': o.type==='diwali'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{o.type}</span></p>
                          <p className="text-xs text-gray-600 mt-1">{o.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">🎯 {o.target_tool} | {o.expires_at? `⏰ ${new Date(o.expires_at).toLocaleString()}` : '♾️ Lifetime'}</p>
                        </div>
                        <div className="flex flex-col gap-2 ml-3">
                          <button onClick={()=>{
                            setNotifTitle(o.title); setNotifMsg(o.message); setNotifType(o.type); setNotifTarget(o.target_tool); setEditingOfferId(o.id);
                            if(o.expires_at){ setNoExpiry(false); const d=new Date(o.expires_at); const pad=(n:number)=>String(n).padStart(2,'0'); setNotifExpiry(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`); } else { setNoExpiry(true); setNotifExpiry(""); }
                            window.scrollTo({top:0, behavior:'smooth'});
                          }} className="px-4 py-1.5 bg-yellow-400 text-black rounded-full text-xs font-bold">Edit</button>
                          <button onClick={async()=>{ if(!confirm(`"${o.title}" ko delete karna hai?`)) return; const {error}=await supabase.from("notifications").delete().eq("id", o.id); if(error) alert(error.message); else fetchOffers(); }} className="px-4 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ): activeTab==="settings" && isMaster? (
            <div className="space-y-6">
              <h2 className="font-bold text-white text-lg">🔐 Advanced Password Control (Master Mode)</h2>
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
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl">
                <h3 className="font-bold mb-3">👑 Change Master Key (Master Only)</h3>
                <div className="flex gap-2">
                  <input value={newMasterKey} onChange={e=>setNewMasterKey(e.target.value)} placeholder="New Master Key" className="flex-1 p-3 rounded-xl border" />
                  <button onClick={()=>updatePasswordSecure("master_key", newMasterKey)} className="px-6 bg-yellow-400 text-black rounded-xl font-bold">Update Master</button>
                </div>
              </div>
            </div>
          ):(
            <>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Blog Title" className="w-full p-4 rounded-xl border mb-2" />
              <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl mb-2 items-center">
              <button type="button" onClick={()=>insertFormat("**","**")}>B</button><button type="button" onClick={()=>insertFormat("\n## ","")}>H2</button><button type="button" onClick={()=>insertFormat("\n### ","")}>H3</button><button type="button" onClick={()=>insertFormat("\n- ","")}>List</button><button type="button" onClick={()=>insertFormat("[", "](https://)")} >Link</button><button type="button" onClick={()=>setShowPreview(!showPreview)} className="ml-auto px-3 py-1 bg-purple-600 text-white rounded-lg">{showPreview? "Edit" : "Preview"}</button>
              </div>
              {!showPreview? (<textarea ref={contentRef} value={content} onChange={e=>setContent(e.target.value)} placeholder="Blog Content..." className="w-full h-[300px] p-4 rounded-xl border" />) : (<div className="w-full h-[300px] p-4 rounded-xl border bg-white overflow-y-auto whitespace-pre-wrap"><h2 className="font-bold text-lg mb-2">{title}</h2><div>{renderPreview(content)}</div></div>)}
              <button onClick={async()=>{
                if(!title ||!content) return alert("Fill all");
                setLoading(true);
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
                const { error } = await supabase.from("blogs").insert([{title, content, slug}]);
                if(error){ alert("❌ Publish Failed: "+error.message); }
                else { alert("✅ Posted!"); setTitle(""); setContent(""); }
                setLoading(false);
              }} className="w-full bg-black text-white p-4 rounded-xl font-bold mt-2">{loading? "Posting..." : "Post Blog"}</button>
            </>
          )}
        </div>
        {editTool && (<div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"><div className="bg-white rounded-[24px] p-6 w-full max-w-md shadow-2xl"><h3 className="font-bold text-lg mb-4">Edit Tool</h3><input value={editTool.name} onChange={e=>setEditTool({...editTool, name:e.target.value})} className="w-full p-3 rounded-xl border mb-3"/><input value={editTool.slug} onChange={e=>setEditTool({...editTool, slug:e.target.value})} className="w-full p-3 rounded-xl border mb-3"/><div className="flex gap-2"><button onClick={()=>setEditTool(null)} className="flex-1 p-3 rounded-xl border">Cancel</button><button onClick={handleToolUpdate} className="flex-1 p-3 rounded-xl bg-black text-white">Save</button></div></div></div>)}
      </div>
    </div>
  );
}
