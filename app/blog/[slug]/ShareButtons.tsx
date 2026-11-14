'use client'
import { useState } from 'react'
export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  function share(type: string) {
    const url = window.location.href
    if (type === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank')
    if (type === 'x') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
    if (type === 'copy') { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  return (
    <div className="flex gap-2">
      <button onClick={() => share('whatsapp')} className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center text-lg">💬</button>
      <button onClick={() => share('x')} className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">𝕏</button>
      <button onClick={() => share('copy')} className="px-3 h-9 rounded-full bg-gray-100 text-sm font-semibold">{copied ? '✅ Copied!' : '🔗 Copy Link'}</button>
    </div>
  )
}
