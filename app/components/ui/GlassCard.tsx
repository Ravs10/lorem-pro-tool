export default function GlassCard({children, className=""}: any){
  return (
    <div className={`backdrop-blur-[20px] bg-white/[0.08] border border-white/[0.15] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}>
      {children}
    </div>
  )
}
