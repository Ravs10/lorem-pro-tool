'use client'
import { useState } from 'react'
export default function Page(){
  const [text, setText] = useState("Lorem ipsum dolor sit amet...");
  const generate = () => {
    setText("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10))
  }
  return (
    <div style={{fontFamily:'sans-serif', maxWidth:800, margin:'auto', padding:20}}>
      <h1 style={{fontSize:28, fontWeight:'bold'}}>Lorem Ipsum Pro Tool</h1>
      <button onClick={generate} style={{padding:'10px 20px', background:'black', color:'white', borderRadius:8, margin:'10px 0'}}>Generate</button>
      <button onClick={()=>navigator.clipboard.writeText(text)} style={{padding:'10px 20px', marginLeft:10, background:'#eee', borderRadius:8}}>Copy</button>
      <div style={{marginTop:20, padding:15, border:'1px solid #ddd', borderRadius:8, minHeight:200}}>{text}</div>
    </div>
  )
}
