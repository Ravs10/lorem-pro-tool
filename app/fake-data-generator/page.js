"use client";
import { useState } from 'react';

export default function Page(){
  const [count,setCount]=useState(10);
  const [type,setType]=useState('users');
  const [data,setData]=useState([]);
  const [format,setFormat]=useState('json');

  const gen=()=>{
    let r=[];
    for(let i=0;i<count;i++){
      if(type==='users') r.push({id:i+1, name:`Rahul Sharma ${i+1}`, email:`user${i+1}@test.com`, phone:`+91 9${Math.floor(100000000+Math.random()*900000000)}`, city:['Delhi','Mumbai','Pune','Indore'][i%4]});
      else if(type==='products') r.push({id:i+1, product:`Headphone ${i+1}`, price:Math.floor(Math.random()*5000+500), rating:(Math.random()*2+3).toFixed(1)});
      else r.push({id:i+1, company:`Tech ${i+1} Pvt Ltd`, gst:`22AAAAA0000A1Z${i%10}`, revenue:`$${(Math.random()*10).toFixed(1)}M`});
    }
    setData(r);
  };
  const out=()=>{
    if(!data.length) return "";
    if(format==='json') return JSON.stringify(data,null,2);
    if(format==='csv') return Object.keys(data[0]).join(',')+'\n'+data.map(x=>Object.values(x).join(',')).join('\n');
    return data.map(x=>Object.values(x).join(' | ')).join('\n');
  };

  return(
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',padding:'20px',fontFamily:'sans-serif'}}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <h1 style={{fontSize:'36px',fontWeight:'900'}}>Fake Data Generator</h1>
        <p style={{color:'#aaa',marginBottom:'20px'}}>Generate realistic dummy data for testing - JSON, CSV supported.</p>

        <div style={{background:'#18181b',border:'1px solid #27272a',borderRadius:'20px',padding:'20px'}}>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'15px'}}>
            <select value={type} onChange={e=>setType(e.target.value)} style={{background:'#27272a',color:'#fff',padding:'12px',borderRadius:'10px',border:'1px solid #3f3f46',flex:1}}>
              <option value="users">👤 Users Data</option>
              <option value="products">📦 Products</option>
              <option value="companies">🏢 Companies</option>
            </select>
            <input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} style={{background:'#27272a',color:'#fff',padding:'12px',borderRadius:'10px',border:'1px solid #3f3f46',width:'80px'}}/>
            <select value={format} onChange={e=>setFormat(e.target.value)} style={{background:'#27272a',color:'#fff',padding:'12px',borderRadius:'10px',border:'1px solid #3f3f46'}}>
              <option value="json">JSON</option><option value="csv">CSV</option>
            </select>
            <button onClick={gen} style={{background:'#fff',color:'#000',fontWeight:'bold',padding:'12px 20px',borderRadius:'10px',flex:1}}>Generate</button>
          </div>

          {data.length>0 && <div style={{display:'flex',gap:'10px',marginBottom:'10px'}}><button onClick={()=>navigator.clipboard.writeText(out())} style={{background:'#27272a',border:'1px solid #3f3f46',padding:'8px 15px',borderRadius:'8px',color:'#fff'}}>📋 Copy</button><span style={{color:'#888',marginLeft:'auto'}}>{data.length} records</span></div>}

          <pre style={{background:'#000',border:'1px solid #27272a',borderRadius:'12px',padding:'15px',overflow:'auto',maxHeight:'500px',color:'#4ade80',fontSize:'13px'}}>{out() || "Click Generate..."}</pre>
        </div>
      </div>
    </div>
  )
}
