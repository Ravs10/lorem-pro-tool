"use client";
import { useState } from "react";
export default function Page(){
 const fields=["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"];
 const [selected,setSelected]=useState([0,1,2]);
 const [count,setCount]=useState(1);
 const [show,setShow]=useState(false);
 const [data,setData]=useState([]);
 function toggle(i){
  if(selected.includes(i)){
   if(selected.length>1) setSelected(selected.filter(x=>x!==i));
  } else {
   if(selected.length<10) setSelected([...selected,i]);
  }
 }
 function gen(){
  const arr=[];
  for(let k=0;k<count;k++){
   const obj={};
   selected.forEach((j)=>{ obj[fields[j]]="Test-"+Math.floor(Math.random()*9999); });
   arr.push(obj);
  }
  setData(arr);
 }
 return (
  <div className="max-w-4xl mx-auto p-4">
   <h1 className="text-2xl font-bold">Fake Data Generator - Pro</h1>
   <div className="mt-4 p-4 border rounded-2xl bg-white">
    <p className="font-bold text-sm">Fields ({selected.length}/10)</p>
    <div className="grid grid-cols-2 gap-2 mt-2">
     {fields.map((f,i)=><button key={i} onClick={()=>toggle(i)} className={selected.includes(i)?"p-2 text-sm border rounded-xl bg-black text-white":"p-2 text-sm border rounded-xl bg-gray-50"}>{f}</button>)}
    </div>
    <p className="mt-4 font-bold text-sm">Records: {count}</p>
    <input type="range" min="1" max="50" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full"/>
    <button onClick={gen} className="w-full mt-4 bg-black text-white py-3 rounded-xl">Generate</button>
   </div>
   {data.length>0 && <pre className="mt-4 bg-black text-green-400 p-3 rounded-xl text-xs overflow-auto">{JSON.stringify(data,null,2)}</pre>}
   <button onClick={()=>setShow(!show)} className="w-full mt-6 border p-4 rounded-2xl flex justify-between bg-white"><span className="font-bold">Articles & Guide</span><span>{show?"Hide":"Show"}</span></button>
   {show && <div className="mt-3 bg-white border rounded-2xl p-5"><h2 className="font-bold">What is Fake Data Generator?</h2><p className="text-sm text-gray-600 mt-2">Generate Indian fake data for testing. Select 1 to 10 fields.</p></div>}
  </div>
 );
}
