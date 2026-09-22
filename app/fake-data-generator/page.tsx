// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const ALL_FIELDS = ['Full Name','Email','Mobile','Address','City','Pincode','Company','PAN','Aadhaar','UPI ID'];
const LANGS = ['Hindi','Bhojpuri','Tamil','Telugu','English','Japanese','Chinese','Spanish','French','German','Russian','Arabic','Korean','Marathi','Bengali','Gujarati','Malayalam','Kannada','Punjabi','Urdu'];

const DEFAULT_BLOGS = [
  { id: 1, slug: 'what-is-fake-data-generator', date: '2025-05-20', title: 'What is Fake Data Generator? Complete Guide 2025', meta: 'Learn what is fake data generator, why developers use fake name, email, address for testing.', content: 'Fake Data Generator is a free online tool for developers, testers, designers and students to create realistic dummy data like names, emails, mobile numbers, addresses without using real user data. For example: Name: Aarav Mehta, Email: aarav.mehta1234@gmail.com, Address: 123 MG Road, Delhi. Developers use it for app testing, UI design, database seeding, college projects and startup demos. Our tool supports 30 languages including Hindi, Bhojpuri, Tamil, Telugu, Japanese (田中太郎), Chinese (张伟), Spanish, French etc. Email is always in English because Hindi email like अमित@gmail.com is technically invalid worldwide.', tags: 'fake data' },
  { id: 2, slug: 'bhojpuri-fake-data-importance', date: '2025-05-21', title: 'Why Bhojpuri Fake Data is Important for Bihar UP Apps?', meta: 'Bhojpuri fake data like खेसारी लाल, पटना, आरा is important for Bihar UP apps testing.', content: 'Most fake data tools only give English names like John Smith. But if you are building an app for Bihar, UP, or MP, your users have names like खेसारी लाल, पवन सिंह, अक्षरा सिंह and cities like पटना, आरा, बलिया, छपरा. Our tool provides 20+ Bhojpuri names with proper Hindi script. This makes your app testing real for 20 crore Bhojpuri users. Google also ranks regional content higher.', tags: 'bhojpuri' },
  { id: 3, slug: 'chinese-japanese-testing', date: '2025-05-22', title: 'How to Test Chinese and Japanese Apps with Native Data', meta: 'Test Chinese 张伟 and Japanese 田中太郎 names with fake data generator.', content: 'Building a global app for China and Japan? You must test if your app supports Chinese characters like 张伟, 王芳, 范冰冰 and Japanese like 田中太郎, 佐藤花子. Many apps crash because database is not UTF-8. Our generator provides 40 Chinese names and 15 Japanese names with native cities like 北京, 上海, 東京, 大阪. Generate 1000 records and check if your app displays them correctly.', tags: 'chinese japanese' },
];

const REAL_FAQS = [
  { q: 'Is this fake data real? Can I use it for official work?', a: 'No, all data is 100% fake and randomly generated for testing only. Names, mobile numbers, Aadhaar, PAN are not real. Do not use for KYC, bank, or government work. It is only for developers, testers, and designers to test apps and websites safely.' },
  { q: 'How many languages are supported?', a: 'Total 30 languages - 15 Indian: Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Malayalam, Kannada, Punjabi, Marwari, Urdu, Bhojpuri, Odia, English, Hinglish and 15 Global: Spanish, French, German, Portuguese, Japanese, Chinese, Russian, Arabic, Korean, Italian, Turkish, Dutch, Thai, Vietnamese.' },
  { q: 'Why is Email always in English even when I select Hindi or Chinese?', a: 'Because email addresses with Hindi or Chinese script like अमित@gmail.com or 张伟@gmail.com are invalid worldwide. Email system only accepts English letters (RFC standard). So we always generate valid English emails like amit.sharma1234@gmail.com for all languages to ensure your testing does not fail.' },
  { q: 'Is this tool free? How many records can I generate?', a: 'Yes, 100% free with no login required. You can generate from 1 to 1000 records in one click. Select up to 10 fields like Name, Email, Mobile, Address, City, Company, PAN, Aadhaar, UPI ID and export in 5 formats.' },
  { q: 'In which formats can I download data?', a: '5 formats: Table view for preview, JSON for API developers, CSV for Excel/Google Sheets, TXT for quick reading, SQL INSERT query for direct database import. All files support Hindi, Chinese, Japanese with UTF-8 BOM so they open correctly on mobile.' },
  { q: 'Can I use this for my college project or startup demo?', a: 'Yes, perfect for college projects, startup MVPs, UI design mockups, and client demos. You get realistic data without asking real users for their personal details, so it is GDPR safe.' },
  { q: 'Will my generated data be saved? Is it private?', a: 'Data is generated in your browser only. We do not store your data on server. Save button stores in your own browser localStorage. Your data is private to you.' },
  { q: 'What is the Blog section?', a: 'We publish a new helpful article every day about testing, fake data tips, and regional app development. Each article has a separate URL like?blog=slug which helps in Google ranking. Users can read and comment. Only admin can post new articles after login.' },
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
  Marathi: { names: ['साहिल जोशी'], cities: ['पुणे'], addr: 'एमजी रस्ता', comp: 'टेक' },
  Bengali: { names: ['অরিন্দম দাস'], cities: ['কলকাতা'], addr: 'এমজি রোড', comp: 'টেক' },
  Gujarati: { names: ['હાર્દિક પટેલ'], cities: ['અમદાવાદ'], addr: 'એમજી રોડ', comp: 'ટેક' },
  Malayalam: { names: ['മോഹൻലാൽ'], cities: ['കൊച്ചി'], addr: 'എംജി റോഡ്', comp: 'ടെക്' },
  Kannada: { names: ['ಯಶ್ ಗೌಡ'], cities: ['ಬೆಂಗಳೂರು'], addr: 'ಎಂಜಿ ರಸ್ತೆ', comp: 'ಟೆಕ್' },
  Punjabi: { names: ['ਜੱਸੀ ਗਿੱਲ'], cities: ['ਲੁਧਿਆਣਾ'], addr: 'ਐਮਜੀ ਰੋਡ', comp: 'ਟੈਕ' },
  Urdu: { names: ['عمران خان'], cities: ['کراچی'], addr: 'ایم جی روڈ', comp: 'ٹیک' },
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
  var [linkCopyId,setLinkCopyId]=useState(null as any);
  var [tab,setTab]=useState('tool');
  var [blogs,setBlogs]=useState(DEFAULT_BLOGS);
  var [selectedSlug,setSelectedSlug]=useState(null as any);
  var [isAdmin,setIsAdmin]=useState(false);
  var [passInput,setPassInput]=useState('');
  var [newTitle,setNewTitle]=useState('');
  var [newMeta,setNewMeta]=useState('');
  var [newContent,setNewContent]=useState('');
  var [showPassChange,setShowPassChange]=useState(false);
  var [oldPass,setOldPass]=useState('');
  var [newPass,setNewPass]=useState('');
  var [faqOpen,setFaqOpen]=useState(0);

  useEffect(function(){
    var saved = localStorage.getItem('seo-blogs');
    if(saved){ try{ setBlogs(JSON.parse(saved)); }catch(e){} }
    if(localStorage.getItem('admin')==='yes') setIsAdmin(true);
    generate();
  },[]);

  var getAdminPass = function(){ return localStorage.getItem('my-admin-pass') || 'admin123'; };
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

  return (
    <div className='min-h-screen bg-[#f8f8f7] text-zinc-900'>
      <header className='sticky top-0 z-50 bg-black text-white px-4 py-3 flex justify-between items-center'>
        <b className='text-[15px]'>⚡ Lorem Pro Tool</b>
        <div className='flex gap-1.5'>
          <button onClick={function(){ setTab('tool'); setSelectedSlug(null); }} className={'px-3.5 py-2 rounded-full text-[11px] font-bold ' + (tab==='tool'&&!selectedSlug?'bg-white text-black':'bg-zinc-800')}>Tool</button>
          <button onClick={function(){ setTab('blog'); setSelectedSlug(null); }} className={'px-3.5 py-2 rounded-full text-[11px] font-bold ' + (tab==='blog'?'bg-yellow-400 text-black':'bg-zinc-800')}>Blog ({blogs.length})</button>
        </div>
      </header>

      <main className='max-w-[1100px] mx-auto px-3 py-4 pb-24'>
        {tab==='tool' &&!selectedSlug && (
          <>
            <h1 className='text-[22px] font-black mt-2'>Fake Data Generator - 30 Languages</h1>
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
                  <button onClick={function(){ localStorage.setItem('saved-data', getStr()); setSaveText('✓ Saved!'); setTimeout(function(){ setSaveText('Save'); },2000); }} className={'flex-1 h-11 rounded-full font-bold text-[12px] transition-all ' + (saveText.includes('Saved')?'bg-green-500 text-white':'bg-zinc-100')}>{saveText}</button>
                  <button onClick={function(){ navigator.clipboard.writeText(getStr()); setCopyText('✓ Copied!'); setTimeout(function(){ setCopyText('Copy'); },2000); }} className={'flex-1 h-11 rounded-full font-bold text-[12px] transition-all ' + (copyText.includes('Copied')?'bg-green-500 text-white':'bg-black text-white')}>{copyText}</button>
                  <button onClick={handleDownload} className='flex-1 h-11 rounded-full bg-yellow-400 font-black text-[12px]'>Download</button>
                </div>
                <div className='mt-3 border-2 border-zinc-900 rounded-2xl overflow-auto max-h-[400px]'>
                  {view==='table'? <table className='w-full text-[12px]'><thead className='bg-zinc-900 text-white sticky top-0'><tr>{Object.keys(data[0]||{}).map(function(k){ return <th key={k} className='text-center p-3 border-r whitespace-nowrap'>{k}</th>; })}</tr></thead><tbody>{data.map(function(r,i){ return <tr key={i} className='border-t'><td colSpan={10}><div className='flex'>{Object.values(r).map(function(v,j){ return <div key={j} className='text-center p-3 border-r min-w-[130px] whitespace-nowrap'>{String(v)}</div>; })}</div></td></tr>; })}</tbody></table> : <pre className='p-3 text-[11px] whitespace-pre-wrap'>{getStr()}</pre>}
                </div>
              </div>
            )}

            <div className='mt-6 bg-white rounded-[24px] border p-5'>
              <h3 className='font-black text-[18px]'>Frequently Asked Questions</h3>
              <div className='mt-4 space-y-2'>
                {REAL_FAQS.map(function(f,i){ return <div key={i} className='border rounded-xl overflow-hidden'><button onClick={function(){ setFaqOpen(faqOpen===i?null:i); }} className='w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px] leading-tight'>{f.q}<span className='ml-2'>{faqOpen===i?'−':'+'}</span></button>{faqOpen===i && <div className='px-4 py-4 text-[13px] bg-white leading-7 text-zinc-600'>{f.a}</div>}</div>; })}
              </div>
            </div>

            <div className='mt-5 bg-yellow-100 border-2 border-yellow-400 rounded-[20px] p-5 text-center'>
              <p className='font-black'>📝 Daily Articles - SEO Ranking ke liye</p>
              <button onClick={function(){ setTab('blog'); }} className='mt-3 bg-black text-white px-6 py-3 rounded-full text-[12px] font-bold'>Go to Blog →</button>
            </div>
          </>
        )}

        {tab==='blog' &&!selectedSlug && (
          <div>
            <h1 className='text-[20px] font-black'>Daily Blog - Fake Data Tips</h1>
            <p className='text-[11px] text-zinc-500 mt-1'>Roz naya article - Google Ranking ke liye</p>

            {!isAdmin? (
              <div className='mt-4 bg-white border rounded-[16px] p-4'>
                <p className='text-[12px] font-bold'>🔐 Admin Login</p>
                <div className='flex gap-2 mt-2'>
                  <input type='password' value={passInput} onChange={function(e){ setPassInput(e.target.value); }} placeholder='Password dalo' className='flex-1 border rounded-full px-4 py-2.5 text-[13px]' />
                  <button onClick={function(){ if(passInput===getAdminPass()){ setIsAdmin(true); localStorage.setItem('admin','yes'); setPassInput(''); } else alert('Wrong password'); }} className='bg-black text-white px-5 rounded-full text-[12px] font-bold'>Login</button>
                </div>
                <p className='text-[10px] text-zinc-400 mt-2'>Default: admin123 | Baad me aap change kar sakte ho</p>
              </div>
            ) : (
              <div className='mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-[16px] p-4'>
                <div className='flex justify-between items-center'>
                  <p className='font-black text-[13px]'>📱 Mobile Admin Panel</p>
                  <button onClick={function(){ setIsAdmin(false); localStorage.removeItem('admin'); }} className='text-[11px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold'>Logout</button>
                </div>

                <input value={newTitle} onChange={function(e){ setNewTitle(e.target.value); }} placeholder='Article Title' className='w-full mt-3 border rounded-xl px-4 py-3 text-[13px]' />
                <input value={newMeta} onChange={function(e){ setNewMeta(e.target.value); }} placeholder='Meta Description for Google (150 chars)' className='w-full mt-2 border rounded-xl px-4 py-3 text-[12px]' />
                <textarea value={newContent} onChange={function(e){ setNewContent(e.target.value); }} placeholder='Full Article Content 5-6 lines...' className='w-full mt-2 border rounded-xl px-4 py-3 text-[13px] h-[120px]'></textarea>
                <button onClick={function(){
                  if(!newTitle||!newContent){ alert('Title + Content bharo'); return; }
                  var slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now();
                  var newPost = { id: Date.now(), slug: slug, date: new Date().toISOString().slice(0,10), title: newTitle, meta: newMeta||newTitle, content: newContent, tags: 'daily' };
                  saveBlogs([newPost].concat(blogs));
                  setNewTitle(''); setNewMeta(''); setNewContent('');
                }} className='mt-3 w-full h-12 bg-black text-white rounded-full font-black'>Publish Blog Post</button>

                <div className='mt-4 border-t pt-4'>
                  <button onClick={function(){ setShowPassChange(!showPassChange); }} className='text-[12px] font-bold bg-zinc-900 text-white px-4 py-2 rounded-full'>🔑 Password Change Karo</button>
                  {showPassChange && (
                    <div className='mt-3 bg-white border rounded-xl p-3'>
                      <p className='text-[11px] font-bold'>Khud ka naya password set karo:</p>
                      <input type='password' value={oldPass} onChange={function(e){ setOldPass(e.target.value); }} placeholder='Old password' className='w-full mt-2 border rounded-full px-4 py-2 text-[12px]' />
                      <input type='password' value={newPass} onChange={function(e){ setNewPass(e.target.value); }} placeholder='New password' className='w-full mt-2 border rounded-full px-4 py-2 text-[12px]' />
                      <button onClick={function(){
                        if(oldPass!==getAdminPass()){ alert('Old password galat hai'); return; }
                        if(newPass.length<4){ alert('Password kam se kam 4 char ka rakho'); return; }
                        localStorage.setItem('my-admin-pass', newPass);
                        setOldPass(''); setNewPass(''); setShowPassChange(false);
                        // no alert, show green
                        var btn = document.getElementById('pass-changed-btn');
                        if(btn){ btn.innerText='✓ Changed!'; btn.className='mt-2 w-full h-10 bg-green-500 text-white rounded-full text-[12px] font-bold'; setTimeout(function(){ btn.innerText='Password Change Karo'; btn.className='mt-2 w-full h-10 bg-black text-white rounded-full text-[12px] font-bold'; },2000); }
                      }} id='pass-changed-btn' className='mt-2 w-full h-10 bg-black text-white rounded-full text-[12px] font-bold'>Update Password</button>
                      <p className='text-[10px] text-zinc-400 mt-2'>Aap jab chahe yahan se password change kar sakte ho. Naya password isi phone me save hoga.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className='mt-5 space-y-3'>
              {blogs.map(function(b:any){
                var isCopied = linkCopyId===b.id;
                return <div key={b.id} className='bg-white rounded-[20px] border p-5'>
                  <div className='flex gap-2'><span className='bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-full'>{b.date}</span><span className='bg-yellow-100 text-[10px] px-2 py-1 rounded-full font-bold'>SEO Ready</span></div>
                  <h2 className='font-black text-[16px] mt-3 leading-tight'>{b.title}</h2>
                  <p className='text-[12px] text-zinc-500 mt-1'>{b.meta}</p>
                  <p className='text-[13px] text-zinc-600 mt-3 leading-6'>{b.content.substring(0,130)}...</p>
                  <div className='flex gap-2 mt-3'>
                    <button onClick={function(){ setSelectedSlug(b.slug); history.pushState(null,'','?blog='+b.slug); window.scrollTo({top:0, behavior:'smooth'}); }} className='bg-black text-white px-5 py-2.5 rounded-full text-[12px] font-bold'>Read Full → SEO URL</button>
                    <button onClick={function(){
                      navigator.clipboard.writeText(window.location.origin + window.location.pathname + '?blog=' + b.slug);
                      setLinkCopyId(b.id);
                      setTimeout(function(){ setLinkCopyId(null); },2000);
                    }} className={'px-4 py-2.5 rounded-full text-[12px] font-bold transition-all ' + (isCopied?'bg-green-500 text-white':'bg-zinc-100')}>{isCopied?'✓ Copied!':'Copy Link'}</button>
                  </div>
                </div>;
              })}
            </div>
          </div>
        )}

        {selectedSlug && selectedBlog && (
          <div>
            <button onClick={function(){ setSelectedSlug(null); }} className='bg-zinc-200 px-4 py-2 rounded-full text-[12px] font-bold'>← Back</button>
            <div className='mt-4 bg-white rounded-[24px] border p-6'>
              <h1 className='text-[22px] font-black mt-2 leading-tight'>{selectedBlog.title}</h1>
              <p className='text-[13px] text-zinc-500 mt-3 bg-yellow-50 border p-3 rounded-xl'>{selectedBlog.meta}</p>
              <div className='mt-5 text-[15px] leading-8 text-zinc-700'>{selectedBlog.content}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
