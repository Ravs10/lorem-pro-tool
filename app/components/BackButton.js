'use client'
import { useRouter } from 'next/navigation'

export default function BackButton({ variant = 'top' }) {
  const router = useRouter()
  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push('/blog')
  }

  if (variant === 'top') {
    return (
      <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-orange-500 hover:text-black transition-all">
        ← Back to Blog
      </button>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 mt-10 border-t pt-6">
      <button onClick={goBack} className="px-6 py-3 rounded-full bg-zinc-900 text-white font-bold">← Go Back</button>
      <button onClick={() => router.push('/')} className="px-6 py-3 rounded-full bg-orange-500 text-black font-black">🏠 Home</button>
      <button onClick={() => router.push('/blog')} className="px-6 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-bold">📝 All Blogs →</button>
    </div>
  )
}
