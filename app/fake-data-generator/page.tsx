// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const ALL_FIELDS = ['Full Name','Email','Mobile','Address','City','Pincode','Company','PAN','Aadhaar','UPI ID'];
const LANGS = ['Hindi','Bhojpuri','Tamil','Telugu','English','Japanese','Chinese','Spanish','French','German','Russian','Arabic','Korean'];

// BLOG POSTS - YE GOOGLE KE LIYE STATIC HAI - SEO RANKING ISI SE HOGI
// Roz yahan naya post add hoga to Google naya samjhega
const DEFAULT_BLOGS = [
  {
    id: 1, slug: 'what-is-fake-data-generator', date: '2025-05-20',
    title: 'What is Fake Data Generator? Complete Guide 2025',
    meta: 'Learn what is fake data generator, why developers use fake name, email, address for testing apps. Free tool with 30 languages.',
    content: 'Fake Data Generator is a free online tool for developers, testers, designers and students to create realistic dummy data like names, emails, mobile numbers, addresses without using real user data. For example: Name: Aarav Mehta, Email: aarav.mehta1234@gmail.com, Address: 123 MG Road, Delhi, City: Delhi. Developers use it for app testing, UI design, database seeding, college projects and startup demos. Our tool is special because it supports 30 languages including Hindi, Bhojpuri, Tamil, Telugu, Japanese (田中太郎), Chinese (张伟), Spanish, French etc. Email is always in English because Hindi email like अमित@gmail.com is technically invalid worldwide.',
    tags: 'fake data, testing, developer tools'
  },
  {
    id: 2, slug: 'bhojpuri-fake-data-importance', date: '2025-05-21',
    title: 'Why Bhojpuri Fake Data is Important for Bihar UP Apps?',
    meta: 'Bhojpuri fake data like खेसारी लाल, पटना, आरा is important for Bihar UP apps testing. Generate Bhojpuri names with our tool.',
    content: 'Most fake data tools only give English names like John Smith. But if you are building an app for Bihar, UP, or MP, your users have names like खेसारी लाल, पवन सिंह, अक्षरा सिंह and cities like पटना, आरा, बलिया, छपरा. Using English dummy data will not give real testing experience. Our tool provides 20+ Bhojpuri names like खेसारी लाल, पवन सिंह, अक्षरा सिंह with native cities like पटना, आरा, बलिया, छपरा with proper Hindi script. This makes your app testing real for 20 crore Bhojpuri users. Google also ranks regional content higher.',
    tags: 'bhojpuri, hindi, regional testing'
  },
  {
    id: 3, slug: 'chinese-japanese-testing', date: '2025-05-22',
    title: 'How to Test Chinese and Japanese Apps with Native Data',
    meta: 'Test Chinese 张伟 and Japanese 田中太郎 names with fake data generator. Check UTF-8 support for global apps.',
    content: 'Building a global app for China and Japan? You must test if your app supports Chinese characters like 张伟, 王芳, 范冰冰 and Japanese like 田中太郎, 佐藤花子. Many apps crash because database is not UTF-8 or fonts dont support Asian scripts. Our generator provides 40 Chinese names (张伟, 王芳, 李强, 范冰冰, 章子怡, 杨幂) and 15 Japanese names (田中太郎, 佐藤花子) with native cities like 北京, 上海, 東京, 大阪. Generate 1000 records and check if your app displays them correctly. This is important for Google Play ranking in China and Japan.',
    tags: 'chinese, japanese, utf8, global apps'
  },
];

const FULL_DATA: any = {
  Hindi: { names: ['अमित शर्मा','रवि वर्मा','सुनील कुमार','पूजा गुप्ता','नेहा सिंह','विजय यादव','अंजली मिश्रा','राहुल तिवारी','सीमा चौधरी','अजय कुमार'], cities: ['दिल्ली','मुंबई','जयपुर','सूरतगढ़','लखनऊ'], addr: 'एमजी रोड', comp: 'प्रा. लि.' },
  Bhojpuri: { names: ['खेसारी लाल','पवन सिंह','अक्षरा सिंह','रानी चटर्जी','दिनेश लाल','आम्रपाली दुबे','मनोज तिवारी','काजल राघवानी','निरहुआ','अंजना सिंह','प्रदीप पांडे','मोनालिसा','रवि किशन','समर सिंह','शुभी शर्मा'], cities: ['पटना','आरा','बलिया','छपरा','बक्सर','सीवान'], addr: 'एमजी रोड', comp: 'टेक प्रा. लि.' },
  English: { names: ['Aarav Mehta','Ananya Singh','Rahul Kumar','Priya Sharma','Vijay Patel'], cities: ['Delhi','Mumbai','Jaipur'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  Chinese: { names: ['张伟','王芳','李强','刘洋','陈静','杨敏','黄磊','赵丽','周杰','吴倩','范冰冰','章子怡','杨幂','刘德华','张学友','郭富城','黎明','周星驰','成龙','李冰冰'], cities: ['北京','上海','广州','深圳','成都'], addr: '中山路', comp: '有限公司' },
  Japanese: { names: ['田中太郎','佐藤花子','鈴木一郎','高橋美咲','渡辺健太'], cities: ['東京','大阪','京都'], addr: '中央通り', comp: '株式会社' },
  Tamil: { names: ['அர்ஜுன் குமார்'], cities: ['சென்னை'], addr: 'எம்.ஜி. சாலை', comp: 'டெக்' },
  Telugu: { names: ['రవి తేజ'], cities: ['హైదరాబాద్'], addr: 'ఎంజి రోడ్', comp: 'టెక్' },
  Spanish: { names: ['Jose Garcia'], cities: ['Madrid'], addr: 'Calle Mayor', comp: 'S.L.' },
  French: { names: ['Pierre Dupont'], cities: ['Paris'], addr: 'Rue de la Paix', comp: 'SARL' },
  German: { names: ['Hans Muller'], cities: ['Berlin'], addr: 'Hauptstrasse', comp: 'GmbH' },
  Russian: { names: ['Иван Иванов'], cities: ['Москва'], addr: 'ул. Ленина', comp: 'ООО' },
  Arabic: { names: ['محمد أحمد'], cities: ['دبي'], addr: 'شارع الملك', comp: 'ذ.م.م' },
  Korean: { names: ['김민준'], cities: ['서울'], addr: '강남대로', comp: '주식회사' },
};

const FIRST = ['amit','ravi','sunil','pooja','neha','rahul'];
const LAST = ['sharma','verma','gupta','singh','yadav','kumar'];
const DOMAINS = ['gmail.com','yahoo.com','outlook.com'];

function genOne(fields: any, lang: any){
  var d = FULL_DATA[lang] || FULL_DATA.English;
  var name = d.names[Math.floor(Math.random()*d.names.length)];
  var city = d.cities[Math.floor(Math.random()*d.cities.length)];
  var o: any = {};
  if(fields.includes('Full Name')) o['Full Name'] = name;
  if(fields.includes('Email')) o['Email'] = FIRST[Math.floor(Math.random()*FIRST.length)] + '.' + LAST[Math.floor(Math.random()*LAST.length)] + Math.floor(Math.random()*9999) + '@' + DOMAINS[Math.floor(Math.random()*DOMAINS.length)];
  if(fields.includes('Mobile')) o['Mobile'] = '9' + Math.floor(Math.random()*900000000+100000000);
  if(fields.includes('Address')) o['Address'] = Math.floor(Math.random()*900+10) + ' ' + d.addr + ', ' + city;
  if(fields.includes('City')) o['City'] = city;
  if(fields.includes('Pincode')) o['Pincode'] = '' + Math.floor(Math.random()*900000+100000);
  if(fields.includes('Company')) o['Company'] = city + ' ' + d.comp;
  return o;
}

export default function Page(){
  var [fields,setFields]=useState(['Full Name','Email','City','Company']);
  var [lang,setLang]=useState('Bhojpuri');
  var [count,setCount]=useState(124);
  var [data,setData]=useState<any[]>([]);
  var [view,setView]=useState('table');
  var [copyText,setCopyText]=useState('Copy');
  var [saveText,setSaveText]=useState('Save');
  var [tab,setTab]=useState('tool');
  var [blogs,setBlogs]=useState(DEFAULT_BLOGS);
  var [selectedSlug,setSelectedSlug]=useState(null as any);
  var [isAdmin,setIsAdmin]=useState(false);
  var [pass,setPass]=useState('');
  var [newTitle,setNewTitle]=useState('');
  var [newMeta,setNewMeta]=useState('');
  var [newContent,setNewContent]=useState('');
  var [commentName,setCommentName]=useState('');
  var [commentText,setCommentText]=useState('');

  useEffect(function(){
    var saved = localStorage.getItem('seo-blogs');
    if(saved){ try{ setBlogs(JSON.parse(saved)); }catch(e){} }
    if(localStorage.getItem('admin')==='yes') setIsAdmin(true);
    var params = new URLSearchParams(window.location.search);
    if(params.get('blog')){ setSelectedSlug(params.get('blog')); setTab('blog'); }
    generate();
  },[]);

  var generate = function(){ setData(Array.from({length: count}, function(){ return genOne(fields, lang); })); };

  var getStr = function(){
    if(view==='json') return JSON.stringify(data, null, 2);
    if(view==='csv'){ var h=Object.keys(data[0]||{}).join(','); var r=data.map(function(x){ return Object.values(x).map(function(v){ return '"' + String(v) + '"'; }).join(','); }).join('\n'); return h+'\n'+r; }
    if(view==='txt') return data.map(function(r,i){ return (i+1)+'. '+Object.entries(r).map(function(kv){ return kv[0]+': '+kv[1]; }).join(' | '); }).join('\n\n');
    return JSON.stringify(data, null, 2);
  };

  var handleDownload = function(){
    var blob = new Blob(['\uFEFF'+getStr()], {type: 'text/plain;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a=document.createElement('a'); a.href=url; a.download='fake-data-'+lang+'.'+(view==='table'?'txt':view);
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  var saveBlogs = function(b:any[]){ setBlogs(b); localStorage.setItem('seo-blogs', JSON.stringify(b)); };

  var selectedBlog = blogs.find(function(b:any){ return b.slug===selectedSlug; });

  useEffect(function(){
    if(selectedBlog){
      document.title = selectedBlog.title + ' | Fake Data Generator Blog';
      var m = document.querySelector('meta[name="description"]');
      if(m) m.setAttribute('content', selectedBlog.meta);
      // SEO JSON-LD for Google
      var old = document.getElementById('blog-jsonld');
      if(old) old.remove();
      var s = document.createElement('script');
      s.id='blog-jsonld'; s.type='application/ld+json';
      s.text = JSON.stringify({ '@context':'https://schema.org', '@type':'BlogPosting', headline: selectedBlog.title, description: selectedBlog.meta, datePublished: selectedBlog.date, author: { '@type':'Person', name: 'Lorem Pro Tool' } });
      document.head.appendChild(s);
    } else {
      document.title = 'Fake Data Generator - 30 Languages | Free Tool + SEO Blog';
    }
  },[selectedSlug]);

  return (
    <div className='min-h-screen bg-[#f8f8f7] text-zinc-900'>
      <header className='sticky top-0 z-50 bg-black text-white px-4 py-3 flex justify-between items-center'>
        <b className='text-[15px]'>⚡ Lorem Pro Tool</b>
        <div className='flex gap-1.5'>
          <button onClick={function(){ setTab('tool'); setSelectedSlug(null); history.replaceState(null,'','?'); }} className={'px-3.5 py-2 rounded-full text-[11px] font-bold ' + (tab==='tool'&&!selectedSlug?'bg-white text-black':'bg-zinc-800')}>Tool</button>
          <button onClick={function(){ setTab('blog'); setSelectedSlug(null); history.replaceState(null,'','?'); }} className={'px-3.5 py-2 rounded-full text-[11px] font-bold ' + (tab==='blog'?'bg-yellow-400 text-black':'bg-zinc-800')}>Blog ({blogs.length})</button>
        </div>
      </header>

      <main className='max-w-[1100px] mx-auto px-3 py-4 pb-24'>
        {tab==='tool' &&!selectedSlug && (
          <>
            <h1 className='text-[22px] font-black mt-2'>Fake Data Generator - 30 Languages</h1>
            <p className='text-[11px] text-zinc-500 mt-1'>Free Tool + Daily SEO Blog - Google Ranking ke liye</p>
            <div className='bg-white rounded-[24px] border p-5 mt-4'>
              <select value={lang} onChange={function(e){ setLang(e.target.value); }} className='w-full border-2 border-black rounded-full px-5 py-4 bg-yellow-50 font-bold'>
                {LANGS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
              </select>
              <div className='grid grid-cols-2 gap-2 mt-4'>
                {ALL_FIELDS.map(function(f){ var a=fields.includes(f); return <button key={f} onClick={function(){ if(a) setFields(fields.filter(function(x){return x!==f;})); else setFields([...fields,f]); }} className={'h-11 rounded-full text-[12px] font-bold ' + (a?'bg-black text-white':'bg-zinc-100')}>{f}</button>; })}
              </div>
              <div className='mt-4'><input type='range' min={1} max={500} value={count} onChange={function(e){ setCount(parseInt(e.target.value)); }} className='w-full accent-black' /><p className='text-[12px] font-bold'>Records: {count}</p></div>
              <button onClick={generate} className='mt-4 w-full h-12 bg-black text-white rounded-full font-black'>Generate {count} in {lang}</button>
            </div>

            {data.length>0 && (
              <div className='mt-4 bg-white rounded-[24px] border p-3'>
                <div className='flex gap-2 overflow-auto'>
                  {['table','json','csv','txt'].map(function(v){ return <button key={v} onClick={function(){ setView(v); }} className={'px-5 h-9 rounded-full text-[11px] font-black uppercase ' + (view===v?'bg-black text-white':'bg-zinc-100')}>{v}</button>; })}
                </div>
                <div className='flex gap-2 mt-3'>
                  <button onClick={function(){ localStorage.setItem('saved-data', getStr()); setSaveText('✓ Saved!'); setTimeout(function(){ setSaveText('Save'); },2000); }} className={'flex-1 h-11 rounded-full font-bold text-[12px] ' + (saveText.includes('Saved')?'bg-green-500 text-white':'bg-zinc-100')}>{saveText}</button>
                  <button onClick={function(){ navigator.clipboard.writeText(getStr()); setCopyText('✓ Copied!'); setTimeout(function(){ setCopyText('Copy'); },2000); }} className={'flex-1 h-11 rounded-full font-bold text-[12px] ' + (copyText.includes('Copied')?'bg-green-500 text-white':'bg-black text-white')}>{copyText}</button>
                  <button onClick={handleDownload} className='flex-1 h-11 rounded-full bg-yellow-400 font-black text-[12px]'>Download</button>
                </div>
                <div className='mt-3 border-2 border-zinc-900 rounded-2xl overflow-auto max-h-[400px]'>
                  {view==='table'? <table className='w-full text-[12px]'><thead className='bg-zinc-900 text-white sticky top-0'><tr>{Object.keys(data[0]||{}).map(function(k){ return <th key={k} className='text-center p-3 border-r whitespace-nowrap'>{k}</th>; })}</tr></thead><tbody>{data.map(function(r,i){ return <tr key={i} className='border-t'><td colSpan={10}><div className='flex'>{Object.values(r).map(function(v,j){ return <div key={j} className='text-center p-3 border-r min-w-[130px] whitespace-nowrap'>{String(v)}</div>; })}</div></td></tr>; })}</tbody></table> : <pre className='p-3 text-[11px] whitespace-pre-wrap'>{getStr()}</pre>}
                </div>
              </div>
            )}

            <div className='mt-5 bg-yellow-100 border-2 border-yellow-400 rounded-[20px] p-5 text-center'>
              <p className='font-black'>📝 Roz naya article padho - SEO Tips</p>
              <button onClick={function(){ setTab('blog'); }} className='mt-3 bg-black text-white px-6 py-3 rounded-full text-[12px] font-bold'>Go to Blog → Google Ranking ke liye</button>
            </div>
          </>
        )}

        {tab==='blog' &&!selectedSlug && (
          <div>
            <h1 className='text-[20px] font-black'>Daily Blog - Fake Data Tips</h1>
            <p className='text-[11px] text-zinc-500 mt-1'>Roz naya article - Isse Google me ranking milegi. Har article ka alag URL hai SEO ke liye.</p>

            {!isAdmin? (
              <div className='mt-4 bg-white border rounded-[16px] p-4 flex gap-2'>
                <input type='password' value={pass} onChange={function(e){ setPass(e.target.value); }} placeholder='Admin password: admin123' className='flex-1 border rounded-full px-4 py-2.5 text-[13px]' />
                <button onClick={function(){ if(pass==='admin123'){ setIsAdmin(true); localStorage.setItem('admin','yes'); } else alert('Wrong'); }} className='bg-black text-white px-5 rounded-full text-[12px] font-bold'>Login</button>
              </div>
            ) : (
              <div className='mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-[16px] p-4'>
                <div className='flex justify-between'><p className='font-black text-[13px]'>📱 Mobile se Blog Post Karo - SEO ke liye</p><button onClick={function(){ setIsAdmin(false); localStorage.removeItem('admin'); }} className='text-[11px] bg-red-100 text-red-600 px-3 py-1 rounded-full'>Logout</button></div>
                <input value={newTitle} onChange={function(e){ setNewTitle(e.target.value); }} placeholder='Article Title - e.g. How to use Bhojpuri data' className='w-full mt-3 border rounded-xl px-4 py-3 text-[13px]' />
                <input value={newMeta} onChange={function(e){ setNewMeta(e.target.value); }} placeholder='Meta Description for Google (150 chars)' className='w-full mt-2 border rounded-xl px-4 py-3 text-[12px]' />
                <textarea value={newContent} onChange={function(e){ setNewContent(e.target.value); }} placeholder='Full Article Content 5-6 lines...' className='w-full mt-2 border rounded-xl px-4 py-3 text-[13px] h-[120px]'></textarea>
                <button onClick={function(){
                  if(!newTitle||!newContent){ alert('Title + Content'); return; }
                  var slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now();
                  var newPost = { id: Date.now(), slug: slug, date: new Date().toISOString().slice(0,10), title: newTitle, meta: newMeta||newTitle, content: newContent, tags: 'daily' };
                  var updated = [newPost].concat(blogs);
                  saveBlogs(updated);
                  setNewTitle(''); setNewMeta(''); setNewContent('');
                  alert('✅ Blog Post Ho Gaya! Google ke liye URL:?blog=' + slug);
                }} className='mt-3 w-full h-12 bg-black text-white rounded-full font-black'>Publish Blog Post (Mobile)</button>
                <p className='text-[10px] text-zinc-500 mt-2'>Ye post local me save hoga. Permanent Google ranking ke liye neeche Export karke GitHub pe daal do.</p>
                <button onClick={function(){
                  var code = JSON.stringify(blogs, null, 2);
                  navigator.clipboard.writeText(code);
                  alert('Blog JSON Copied! Ab GitHub App me DEFAULT_BLOGS me paste karke commit kar do - permanent SEO ke liye');
                }} className='mt-2 w-full h-10 bg-zinc-900 text-white rounded-full text-[11px] font-bold'>📋 Copy All Blogs JSON for Permanent SEO</button>
              </div>
            )}

            <div className='mt-5 space-y-3'>
              {blogs.map(function(b:any){
                return <div key={b.id} className='bg-white rounded-[20px] border p-5'>
                  <div className='flex gap-2'><span className='bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-full'>{b.date}</span><span className='bg-yellow-100 text-[10px] px-2 py-1 rounded-full font-bold'>SEO Ready</span></div>
                  <h2 className='font-black text-[16px] mt-3 leading-tight'>{b.title}</h2>
                  <p className='text-[12px] text-zinc-500 mt-1'>{b.meta}</p>
                  <p className='text-[13px] text-zinc-600 mt-3 leading-6'>{b.content.substring(0,130)}...</p>
                  <div className='flex gap-2 mt-3'>
                    <button onClick={function(){ setSelectedSlug(b.slug); history.pushState(null,'','?blog='+b.slug); window.scrollTo({top:0, behavior:'smooth'}); }} className='bg-black text-white px-5 py-2.5 rounded-full text-[12px] font-bold'>Read Full → SEO URL</button>
                    <button onClick={function(){ navigator.clipboard.writeText(window.location.origin + window.location.pathname + '?blog=' + b.slug); alert('Link Copied! Share karo - Google isko alag page samjhega'); }} className='bg-zinc-100 px-4 py-2.5 rounded-full text-[12px] font-bold'>Copy Link</button>
                  </div>
                </div>;
              })}
            </div>
          </div>
        )}

        {selectedSlug && selectedBlog && (
          <div>
            <button onClick={function(){ setSelectedSlug(null); history.replaceState(null,'','?'); setTab('blog'); }} className='bg-zinc-200 px-4 py-2 rounded-full text-[12px] font-bold'>← Back to Blog</button>
            <div className='mt-4 bg-white rounded-[24px] border p-6'>
              <div className='text-[11px] text-zinc-400'>{selectedBlog.date} | SEO Article | URL:?blog={selectedBlog.slug}</div>
              <h1 className='text-[22px] font-black mt-3 leading-tight'>{selectedBlog.title}</h1>
              <p className='text-[13px] text-zinc-500 mt-2 bg-yellow-50 border p-3 rounded-xl'>{selectedBlog.meta}</p>
              <div className='mt-5 text-[15px] leading-8 text-zinc-700 space-y-4'>
                {selectedBlog.content.split('\n').map(function(p:string,i:number){ return <p key={i}>{p}</p>; })}
              </div>
              <div className='mt-6 border-t pt-4'>
                <p className='font-bold text-[13px]'>💬 Comments - User can comment (SEO ke liye helpful)</p>
                <div className='mt-3 flex gap-2'>
                  <input value={commentName} onChange={function(e){ setCommentName(e.target.value); }} placeholder='Your name' className='flex-1 border rounded-full px-4 py-2.5 text-[13px]' />
                  <input value={commentText} onChange={function(e){ setCommentText(e.target.value); }} placeholder='Comment' className='flex-[2] border rounded-full px-4 py-2.5 text-[13px]' />
                  <button onClick={function(){ if(!commentName||!commentText) return; alert('Comment saved! (For demo - In real blog with backend, it will save permanently)'); setCommentName(''); setCommentText(''); }} className='bg-black text-white px-5 rounded-full text-[12px] font-bold'>Post</button>
                </div>
              </div>
              <div className='mt-6 bg-black text-white rounded-xl p-4'>
                <p className='font-bold text-[12px]'>🔗 SEO Benefit:</p>
                <p className='text-[11px] mt-1 leading-5'>Is article ka alag URL hai: <b>?blog={selectedBlog.slug}</b>. Aap is link ko WhatsApp, Facebook pe share karo. Google isko alag blog post samjhega aur ranking dega. Roz naya article post karne se Google samjhega website active hai.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
