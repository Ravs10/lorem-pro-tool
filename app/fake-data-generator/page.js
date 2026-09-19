"use client";
import { useState } from 'react';

export default function FakeDataGenerator() {
  const [count, setCount] = useState(5);
  const [type, setType] = useState('users');
  const [data, setData] = useState('');

  const generate = () => {
    let result = [];
    for(let i=0; i<count; i++){
      if(type === 'users'){
        result.push({ id: i+1, name: `User ${i+1}`, email: `user${i+1}@example.com`, phone: `+91 9${Math.floor(100000000 + Math.random()*900000000)}` });
      } else if(type === 'products'){
        result.push({ id: i+1, product: `Product ${i+1}`, price: `$${(Math.random()*100).toFixed(2)}`, stock: Math.floor(Math.random()*100) });
      } else {
        result.push({ id: i+1, company: `Company ${i+1}`, city: ['Mumbai','Delhi','Pune','Noida'][Math.floor(Math.random()*4)], gst: `22AAAAA0000A1Z${i}` });
      }
    }
    setData(JSON.stringify(result, null, 2));
  };

  return (
    <div style={{padding:'20px', maxWidth:'800px', margin:'auto', fontFamily:'sans-serif'}}>
      <h1>Monster Tool 1 - Fake Data Generator</h1>
      <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
        <select value={type} onChange={e=>setType(e.target.value)} style={{padding:'10px'}}>
          <option value="users">Users</option>
          <option value="products">Products</option>
          <option value="companies">Companies</option>
        </select>
        <input type="number" value={count} onChange={e=>setCount(e.target.value)} style={{padding:'10px', width:'80px'}} />
        <button onClick={generate} style={{padding:'10px 20px', background:'black', color:'white', border:'none', cursor:'pointer'}}>Generate</button>
      </div>
      <pre style={{background:'#f5f5f5', padding:'20px', overflow:'auto', whiteSpace:'pre-wrap'}}>{data}</pre>
    </div>
  )
}
