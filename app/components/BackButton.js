'use client'
import { useRouter } from 'next/navigation'

export default function BackButton({ variant = 'top' }) {
  const router = useRouter()
  
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/blog')
    }
  }

  if (variant === 'top') {
    return (
      <button 
        onClick={handleBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-orange-500 hover:text-black transition-all duration-300 hover:-translate-x-1"
      >
        <span>←</span> Back to Blog
      </button>
    )
  }

  // Bottom wala bada orange wala
  return (
    <div className="flex flex-wrap gap-3 mt-10">
      <button 
        onClick={handleBack}
        className="px-6 py-3 rounded-full bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition"
      >
        ← Go Back
      </button>
      <button 
        onClick={() => router.push('/')}
        className="px-6 py-3 rounded-full bg-orange-500 text-black font-black hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
      >
        🏠 Home
      </button>
      <button 
        onClick={() => router.push('/blog')}
        className="px-6 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-500 hover:text-black transition-all"
      >
        📝 All Blogs →
      </button>
    </div>
  )
}
