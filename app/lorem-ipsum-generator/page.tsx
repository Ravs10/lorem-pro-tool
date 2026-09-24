"use client";
import { useState } from "react";

export default function Page() {
  const [count, setCount] = useState(3);
  const [text, setText] = useState("");

  const generate = () => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ";
    const result = Array(count).fill(lorem).join("\n\n");
    setText(result);
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto bg-white">
      <h1 className="text-3xl font-bold mb-6">Lorem Ipsum Generator</h1>
      <div className="flex gap-2 mb-6 items-center">
        <label>Paragraphs:</label>
        <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} className="border p-2 rounded w-20" min={1} max={20} />
        <button onClick={generate} className="bg-black text-white px-6 py-2 rounded-full font-medium">Generate</button>
        <button onClick={() => navigator.clipboard.writeText(text)} className="bg-gray-100 border px-4 py-2 rounded-full text-sm">Copy</button>
      </div>
      <pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl border text-gray-700 leading-relaxed">{text || "Click Generate to create lorem ipsum..."}</pre>
    </div>
  );
}
