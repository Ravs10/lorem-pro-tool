"use client";
import Link from "next/link";

export default function WriteForUs() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* TOP BUTTONS */}
        <div className="flex gap-2 flex-wrap mb-6">
          <Link href="/blog" className="px-5 py-2.5 bg-black text-white rounded-full font-bold text-sm">← Go Back</Link>
          <Link href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-full font-bold text-sm">🏠 Home</Link>
          <Link href="/write-blog" className="px-5 py-2.5 bg-white border-2 border-orange-500 text-orange-600 rounded-full font-bold text-sm">✍️ Write Now →</Link>
        </div>

        {/* HERO - QUORA / MEDIUM STYLE */}
        <div className="bg-black text-white rounded-3xl p-8 text-center">
          <p className="bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full inline-block">✅ 100% FREE - NO FEES</p>
          <h1 className="text-4xl font-bold mt-4 leading-tight">Write For Us.<br />Get 1 FREE DoFollow Backlink.</h1>
          <p className="text-gray-300 mt-3">Like Medium & Quora - Write a quality blog on Lorem Pro Tool and grow your website with a powerful DoFollow link + Author Bio.</p>
          <Link href="/write-blog" className="inline-block mt-6 bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg">✍️ Submit Your Blog Now →</Link>
          <p className="text-xs text-gray-400 mt-3">No Login Required • Approved in 24-48 Hours • Live on Google</p>
        </div>

        {/* WHAT YOU GET */}
        <h2 className="text-2xl font-bold mt-8">🎁 What You Will Get?</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-5 rounded-2xl border">
            <div className="text-3xl">🔗</div>
            <h3 className="font-bold mt-2">1 DoFollow Backlink</h3>
            <p className="text-sm text-gray-500 mt-1">A real SEO vote from our site to your site. Helps your Google ranking & Domain Authority grow.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border">
            <div className="text-3xl">👤</div>
            <h3 className="font-bold mt-2">Author Bio Box</h3>
            <p className="text-sm text-gray-500 mt-1">Your Name, Photo, About You & Website link will show below every blog you write. Like Medium.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border">
            <div className="text-3xl">🚀</div>
            <h3 className="font-bold mt-2">Free Traffic</h3>
            <p className="text-sm text-gray-500 mt-1">Our readers will click your bio and visit your website. Free referral traffic for lifetime.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border">
            <div className="text-3xl">🏆</div>
            <h3 className="font-bold mt-2">Author Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Write 3+ blogs and become a Trusted Author. Your next blogs will be approved faster.</p>
          </div>
        </div>

        {/* EXAMPLE AUTHOR BIO - LIVE DEMO */}
        <h2 className="text-2xl font-bold mt-8">👀 How Will Your Author Bio Look?</h2>
        <div className="bg-white border rounded-2xl p-5 mt-4 flex gap-4 items-start">
          <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shrink-0">R</div>
          <div>
            <p className="text-xs text-gray-400">WRITTEN BY</p>
            <p className="font-bold text-lg">Ravi Kumar</p>
            <p className="text-sm text-gray-500">Ravi is an SEO Blogger. He has 5 years of experience in blogging & affiliate marketing.</p>
            <a href="#" className="inline-block mt-2 bg-black text-white text-sm px-4 py-2 rounded-full font-bold">🌐 Visit My Website →</a>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">↑ This box will appear below your blog. The website link in this box will be DoFollow.</p>

        {/* RULES */}
        <h2 className="text-2xl font-bold mt-8">📋 Simple Rules - Understand in 2 minutes</h2>
        <div className="bg-white rounded-2xl border p-5 mt-4 space-y-3 text-sm">
          <p>✅ <b>Min 800 words</b> - Original, not copied from ChatGPT / other site.</p>
          <p>✅ <b>1 Link Only</b> - Only 1 link to your site, in Author Bio. No extra links in content.</p>
          <p>✅ <b>Any Topic</b> - Finance, AI Tools, YouTube, Blogging, Health, Travel, Tech - Any of 16 categories.</p>
          <p>❌ <b>No Spam</b> - No casino, betting, crypto, adult, or affiliate spam links.</p>
          <p>⏰ <b>Review Time</b> - Admin will check in 24-48 hours. If approved, it goes live on Google.</p>
        </div>

        {/* STEPS */}
        <h2 className="text-2xl font-bold mt-8">🪜 3 Steps - It is that easy</h2>
        <div className="space-y-3 mt-4">
          <div className="bg-white p-4 rounded-2xl border flex gap-3"><span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span><p className="text-sm"><b>Fill the form</b> - Name, Email, Website Link, Author Bio & Your Blog.</p></div>
          <div className="bg-white p-4 rounded-2xl border flex gap-3"><span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span><p className="text-sm"><b>Wait for approval</b> - We check quality & originality.</p></div>
          <div className="bg-white p-4 rounded-2xl border flex gap-3"><span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span><p className="text-sm"><b>Get Live + Backlink</b> - Your blog goes live with your DoFollow link forever!</p></div>
        </div>

        <Link href="/write-blog" className="block text-center mt-8 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg">✍️ Start Writing - Get My Backlink →</Link>

        <div className="flex gap-3 flex-wrap mt-6 justify-center">
          <Link href="/" className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold">🏠 Home</Link>
          <Link href="/blog" className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-full font-bold">📝 All Blogs</Link>
        </div>
      </div>
    </div>
  );
}
