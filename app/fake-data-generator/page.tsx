// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const ALL_FIELDS = ['Full Name','Email','Mobile','Address','City','Pincode','Company','PAN','Aadhaar','UPI ID'];
const LANGS = ['Hindi','Tamil','Telugu','Marathi','Bengali','Gujarati','Malayalam','Kannada','Punjabi','Marwari','Urdu','Bhojpuri','Odia','English','Hinglish','English (US)','Spanish','French','German','Portuguese','Japanese','Chinese','Russian','Arabic','Korean','Italian','Turkish','Dutch','Thai','Vietnamese'];

const FULL_DATA: any = {
  Hindi: { names: ['अमित शर्मा','रवि वर्मा','सुनील कुमार','पूजा गुप्ता','नेहा सिंह'], cities: ['दिल्ली','मुंबई','जयपुर','सूरतगढ़'], addr: 'एमजी रोड', comp: 'प्रा. लि.' },
  Bhojpuri: { names: ['खेसारी लाल','पवन सिंह','अक्षरा सिंह','रानी चटर्जी','दिनेश लाल','आम्रपाली दुबे','मनोज तिवारी','काजल राघवानी','निरहुआ','अंजना सिंह','प्रदीप पांडे','मोनालिसा','रवि किशन','समर सिंह','शुभी शर्मा'], cities: ['पटना','आरा','बलिया','छपरा','बक्सर','सीवान'], addr: 'एमजी रोड', comp: 'टेक प्रा. लि.' },
  English: { names: ['Aarav Mehta','Ananya Singh','Rahul Kumar','Priya Sharma','Vijay Patel'], cities: ['Delhi','Mumbai','Jaipur'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  Chinese: { names: ['张伟','王芳','李强','刘洋','陈静','杨敏','黄磊','赵丽','周杰','吴倩','范冰冰','章子怡','杨幂','刘德华','张学友','郭富城','黎明','周星驰','成龙','李冰冰'], cities: ['北京','上海','广州','深圳','成都'], addr: '中山路', comp: '有限公司' },
  Japanese: { names: ['田中太郎','佐藤花子','鈴木一郎','高橋美咲','渡辺健太'], cities: ['東京','大阪','京都'], addr: '中央通り', comp: '株式会社' },
  Tamil: { names: ['அர்ஜுன் குமார்','சூர்யா சிவகுமார்'], cities: ['சென்னை'], addr: 'எம்.ஜி. சாலை', comp: 'டெக்' },
  Telugu: { names: ['రవి తేజ','పవన్ కళ్యాణ్'], cities: ['హైదరాబాద్'], addr: 'ఎంజి రోడ్', comp: 'టెక్' },
  Marathi: { names: ['साहिल जोशी','ओंकार पाटील'], cities: ['पुणे'], addr: 'एमजी रस्ता', comp: 'टेक' },
  Bengali: { names: ['অরিন্দম দাস','সৌরভ গাঙ্গুলী'], cities: ['কলকাতা'], addr: 'এমজি রোড', comp: 'টেক' },
  Gujarati: { names: ['હાર્દિક પટેલ'], cities: ['અમદાવાદ'], addr: 'એમજી રોડ', comp: 'ટેક' },
  Malayalam: { names: ['മോഹൻലാൽ'], cities: ['കൊച്ചി'], addr: 'എംജി റോഡ്', comp: 'ടെക്' },
  Kannada: { names: ['ಯಶ್ ಗೌಡ'], cities: ['ಬೆಂಗಳೂರು'], addr: 'ಎಂಜಿ ರಸ್ತೆ', comp: 'ಟೆಕ್' },
  Punjabi: { names: ['ਜੱਸੀ ਗਿੱਲ'], cities: ['ਲੁਧਿਆਣਾ'], addr: 'ਐਮਜੀ ਰੋਡ', comp: 'ਟੈਕ' },
  Marwari: { names: ['भंवर सिंह'], cities: ['बीकानेर','सूरतगढ़'], addr: 'एमजी रोड़', comp: 'टेक' },
  Urdu: { names: ['عمران خان'], cities: ['کراچی'], addr: 'ایم جی روڈ', comp: 'ٹیک' },
  Odia: { names: ['ଶୁଭମ ମହାନ୍ତି'], cities: ['ଭୁବନେଶ୍ୱର'], addr: 'ଏମଜି ରୋଡ', comp: 'ଟେକ୍' },
  Hinglish: { names: ['Aarav Sharma'], cities: ['Delhi'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  'English (US)': { names: ['John Smith','Emma Johnson'], cities: ['New York'], addr: '5th Avenue', comp: 'Inc.' },
  Spanish: { names: ['Jose Garcia'], cities: ['Madrid'], addr: 'Calle Mayor', comp: 'S.L.' },
  French: { names: ['Pierre Dupont'], cities: ['Paris'], addr: 'Rue de la Paix', comp: 'SARL' },
  German: { names: ['Hans Muller'], cities: ['Berlin'], addr: 'Hauptstrasse', comp: 'GmbH' },
  Portuguese: { names: ['Joao Silva'], cities: ['Lisboa'], addr: 'Rua Augusta', comp: 'Lda.' },
  Russian: { names: ['Иван Иванов'], cities: ['Москва'], addr: 'ул. Ленина', comp: 'ООО' },
  Arabic: { names: ['محمد أحمد'], cities: ['دبي'], addr: 'شارع الملك', comp: 'ذ.م.م' },
  Korean: { names: ['김민준'], cities: ['서울'], addr: '강남대로', comp: '주식회사' },
  Italian: { names: ['Marco Rossi'], cities: ['Roma'], addr: 'Via Roma', comp: 'S.r.l.' },
  Turkish: { names: ['Mehmet Yilmaz'], cities: ['Istanbul'], addr: 'Ataturk Caddesi', comp: 'A.S.' },
  Dutch: { names: ['Jan Jansen'], cities: ['Amsterdam'], addr: 'Damstraat', comp: 'B.V.' },
  Thai: { names: ['สมชาย ใจดี'], cities: ['กรุงเทพ'], addr: 'ถนนสุขุมวิท', comp: 'จำกัด' },
  Vietnamese: { names: ['Nguyen Van A'], cities: ['Ha Noi'], addr: 'Duong Le Loi', comp: 'TNHH' },
};

const DEFAULT_BLOGS = [
  { id: 1, date: '2025-05-20', title: 'What is Fake Data? Complete Guide for Beginners', content: 'Fake data is artificially created information that looks real but is not linked to any real person. For example, name like Aarav Mehta, email like aarav.mehta1234@gmail.com, address like 123 MG Road, Delhi. Developers use it to test apps, websites and databases without risking real user privacy. Our tool generates this fake data in 30 languages including Hindi, Bhojpuri, Tamil, Japanese, Chinese etc. It is 100% safe and free for testing.', comments: [{name:'Rahul', text:'Very useful for college project!'}] },
  { id: 2, date: '2025-05-21', title: 'Why Bhojpuri Fake Data is Important for Bihar UP Apps', content: 'Most fake data tools only give English names like John Smith. But if you are building an app for Bihar, UP, or MP, you need names like खेसारी लाल, पवन सिंह, अक्षरा सिंह and cities like पटना, आरा, बलिया. Our tool provides 20+ Bhojpuri names with proper Hindi script. This makes your app testing feel real for local users.', comments: [] },
  { id: 3, date: '2025-05-22', title: 'How to Test Global Apps with Chinese and Japanese Data', content: 'If your app will be used in China or Japan, you must test if it can handle characters like 张伟 (Chinese) or 田中太郎 (Japanese). Many apps break because database is not UTF-8. With our generator, you can create 1000 Chinese names like 张伟, 王芳, 范冰冰 with cities like 北京, 上海 and check if your app displays them correctly.', comments: [] },
];

const FIRST = ['amit','ravi','sunil','pooja','neha','rahul','ananya','arjun','priya','vijay'];
const LAST = ['sharma','verma','gupta','singh','yadav','kumar','patel'];
const DOMAINS = ['gmail.com','yahoo.com','outlook.com'];

function genOne(fields: any, lang: any){
  var d = FULL_DATA[lang] || FULL_DATA.English;
  var name = d.names[Math.floor(Math.random()*d.names.length)];
  var city = d.cities[Math.floor(Math.random()*d.cities.length)];
  var first = FIRST[Math.floor(Math.random()*FIRST.length)];
  var last = LAST[Math.floor(Math.random()*LAST.length)];
  var domain = DOMAINS[Math.floor(Math.random()*DOMAINS.length)];
  var o: any = {};
  if(fields.includes('Full Name')) o['Full Name'] = name;
  if(fields.includes('Email')) o['Email'] = first + '.' + last + Math.floor(Math.random()*9999) + '@' + domain;
  if(fields.includes('Mobile')) o['Mobile'] = '9' + Math.floor(Math.random()*900000000+100000000);
  if(fields.includes('Address')) o['Address'] = Math.floor(Math.random()*900+10) + ' ' + d.addr + ', ' + city;
  if(fields.includes('City')) o['City'] = city;
  if(fields.includes('Pincode')) o['Pincode'] = '' + Math.floor(Math.random()*900000+100000);
  if(fields.includes('Company')) o['Company'] = city + ' ' + d.comp;
  if(fields.includes('PAN')) o['PAN'] = 'ABCDE' + Math.floor(Math.random()*9000+1000) + 'F';
  if(fields.includes('Aadhaar')) o['Aadhaar'] = Math.floor(Math.random()*9000+1000) + ' ' + Math.floor(Math.random()*9000+1000) + ' ' + Math.floor(Math.random()*9000+1000);
  if(fields.includes('UPI ID')) o['UPI ID'] = first + '@okpay';
  return o;
}

export default function Page(){
  var [fields,setFields]=useState(['Full Name','Email','Address','City','Company']);
  var [lang,setLang]=useState('Bhojpuri');
  var [count,setCount]=useState(124);
  var [data,setData]=useState<any[]>([]);
  var [view,setView]=useState('table');
  var [copyText,setCopyText]=useState('Copy');
  var [saveText,setSaveText]=useState('Save');
  var [showArticle,setShowArticle]=useState(true);
  var [faqOpen,setFaqOpen]=useState(0);
  var [activeTab,setActiveTab]=useState('tool');
  var [posts,setPosts]=useState(DEFAULT_BLOGS);
  var [openPost,setOpenPost]=useState(null as any);
  var [commentName,setCommentName]=useState('');
  var [commentText,setCommentText]=useState('');
  var [isAdmin,setIsAdmin]=useState(false);
  var [adminPass,setAdminPass]=useState('');
  var [newTitle,setNewTitle]=useState('');
  var [newContent,setNewContent]=useState('');
  var [showAdminForm,setShowAdminForm]=useState(false);

  useEffect(function(){
    document.title = 'Fake Data Generator - 30 Languages | Free Tool + Daily Blog';
    var saved = localStorage.getItem('my-blog-posts');
    if(saved){ try{ setPosts(JSON.parse(saved)); }catch(e){} }
    if(localStorage.getItem('admin-login')==='yes') setIsAdmin(true);
  },[]);

  var generate = function(){ setData(Array.from({length: count}, function(){ return genOne(fields, lang); })); };
  useEffect(function(){ generate(); }, []);
  useEffect(function(){ generate(); }, [lang]);

  var getStr = function(){
    if(view==='json') return JSON.stringify(data, null, 2);
    if(view==='csv'){
      if(!data.length) return '';
      var h = Object.keys(data[0]).join(',');
      var r = data.map(function(x){ return Object.values(x).map(function(v){ return '"' + String(v).replace(/"/g,'""') + '"'; }).join(','); }).join('\r\n');
      return h + '\r\n' + r;
    }
    if(view==='txt') return data.map(function(r,i){ return (i+1) + '. ' + Object.entries(r).map(function(kv){ return kv[0] + ': ' + kv[1]; }).join(' | '); }).join('\r\n\r\n');
    if(view==='sql'){
      var cols = Object.keys(data[0]||{}).join(', ');
      var vals = data.map(function(r){ return '(' + Object.values(r).map(function(v){ return "'" + String(v).replace(/'/g,"''") + "'"; }).join(', ') + ')'; }).join(',\n');
      return 'INSERT INTO users (' + cols + ') VALUES\n' + vals + ';';
    }
    return JSON.stringify(data, null, 2);
  };

  var handleDownload = function(){
    var blob = new Blob(['\uFEFF' + getStr()], {type: 'text/plain;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'fake-data-' + lang + '.' + (view==='table'?'txt':view);
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  var savePosts = function(p:any[]){ setPosts(p); localStorage.setItem('my-blog-posts', JSON.stringify(p)); };

  return (
    <div className='min-h-screen bg-[#f8f8f7] text-zinc-900'>
      <header className='sticky top-0 z-40 bg-black text-white px-4 py-3 flex justify-between items-center'>
        <h1 className='font-black text-[16px]'>⚡ Lorem Pro Tool</h1>
        <div className='flex gap-2'>
          <button onClick={function(){ setActiveTab('tool'); }} className={'px-4 py-2 rounded-full text-[11px] font-bold ' + (activeTab==='tool'?'bg-white text-black':'bg-zinc-800')}>Tool</button>
          <button onClick={function(){ setActiveTab('articles'); }} className={'px-4 py-2 rounded-full text-[11px] font-bold ' + (activeTab==='articles'?'bg-yellow-400 text-black':'bg-zinc-800')}>Articles</button>
        </div>
      </header>

      <main className='max-w-[1100px] mx-auto px-3 py-4 pb-28'>
        {activeTab==='tool' && (
          <>
            <h1 className='text-[22px] font-black mt-2'>Fake Data Generator - 30 Languages</h1>
            <div className='bg-white rounded-[24px] border p-5 mt-4'>
              <label className='font-bold text-[13px]'>Select Language</label>
              <select value={lang} onChange={function(e){ setLang(e.target.value); }} className='w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold'>
                {LANGS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
              </select>
              <div className='grid grid-cols-2 gap-2 mt-4'>
                {ALL_FIELDS.map(function(f){ var a=fields.includes(f); return <button key={f} onClick={function(){ if(a) setFields(fields.filter(function(x){return x!==f;})); else if(fields.length<10) setFields([...fields,f]); }} className={'h-[48px] rounded-full text-[12px] font-bold ' + (a?'bg-black text-white':'bg-zinc-100')}>{f}</button>; })}
              </div>
              <div className='mt-4'><label className='font-bold text-[13px]'>Records: {count}</label><input type='range' min={1} max={1000} value={count} onChange={function(e){ setCount(parseInt(e.target.value)); }} className='w-full mt-1 accent-black' /></div>
              <button onClick={generate} className='mt-4 w-full h-[52px] bg-black text-white rounded-full font-black'>Generate {count} in {lang}</button>
            </div>

            {data.length>0 && (
              <div className='mt-4 bg-white rounded-[24px] border p-3'>
                <div className='flex gap-2 overflow-auto'>
                  {['table','json','csv','txt','sql'].map(function(v){ return <button key={v} onClick={function(){ setView(v); }} className={'px-5 h-9 rounded-full text-[11px] font-black uppercase ' + (view===v?'bg-black text-white':'bg-zinc-100')}>{v}</button>; })}
                </div>
                <div className='flex gap-2 mt-3'>
                  <button onClick={function(){ localStorage.setItem('saved-data', getStr()); setSaveText('✓ Saved!'); setTimeout(function(){ setSaveText('Save'); },2000); }} className={'flex-1 h-11 rounded-full font-bold text-[13px] ' + (saveText.includes('Saved')?'bg-green-500 text-white':'bg-zinc-100')}>{saveText}</button>
                  <button onClick={function(){ navigator.clipboard.writeText(getStr()); setCopyText('✓ Copied!'); setTimeout(function(){ setCopyText('Copy'); },2000); }} className={'flex-1 h-11 rounded-full font-bold text-[13px] ' + (copyText.includes('Copied')?'bg-green-500 text-white':'bg-black text-white')}>{copyText}</button>
                  <button onClick={handleDownload} className='flex-1 h-11 rounded-full bg-yellow-400 font-black text-[13px]'>Download</button>
                </div>
                <div className='mt-3 border-2 border-zinc-900 rounded-2xl overflow-auto max-h-[450px]'>
                  {view==='table'?
                    <table className='w-full text-[12px]'><thead className='bg-zinc-900 text-white sticky top-0'><tr>{Object.keys(data[0]||{}).map(function(k){ return <th key={k} className='text-center p-3 border-r last:border-0 whitespace-nowrap'>{k}</th>; })}</tr></thead><tbody>{data.map(function(r,i){ return <tr key={i} className={'border-t ' + (i%2===0?'bg-white':'bg-zinc-50')}><td colSpan={20}><div className='flex'>{Object.values(r).map(function(v,j){ return <div key={j} className='text-center p-3 border-r min-w-[140px] whitespace-nowrap'>{String(v)}</div>; })}</div></td></tr>; })}</tbody></table>
                  : <pre className='p-3 text-[11px] whitespace-pre-wrap'>{getStr()}</pre>}
                </div>
              </div>
            )}

            <div className='mt-5 bg-white rounded-[24px] border overflow-hidden'>
              <button onClick={function(){ setShowArticle(!showArticle); }} className='w-full p-5 flex justify-between font-black text-left text-[15px]'>What is Fake Data Generator? <span>{showArticle?'−':'+'}</span></button>
              {showArticle && <div className='px-5 pb-5 text-[13px] text-zinc-700 leading-7 space-y-3'>
                <p><b>Fake Data Generator</b> is a free tool for developers and testers to create dummy data like <b>अमित शर्मा, खेसारी लाल, 张伟, 田中太郎</b> without using real user data.</p>
                <p><b>30 Languages:</b> 15 Indian + 15 Global. Name, City, Address changes to native script. Email always English because अमित@gmail.com is invalid.</p>
                <p><b>Use:</b> App testing, UI design, database seeding, college projects, startup demos.</p>
              </div>}
            </div>

            <div className='mt-5 bg-white rounded-[24px] border p-5'>
              <h3 className='font-black'>FAQ</h3>
              <div className='mt-3 space-y-2'>
                {[
                  {q:'Is data real?', a:'No, 100% fake for testing only.'},
                  {q:'Why Email always English?', a:'Hindi/Chinese email like अमित@gmail.com is invalid globally.'},
                  {q:'How many languages?', a:'30 languages - 15 Indian + 15 Global.'},
                  {q:'Is it free?', a:'Yes, free, no login, 1-1000 records.'},
                ].map(function(f,i){ return <div key={i} className='border rounded-xl'><button onClick={function(){ setFaqOpen(faqOpen===i?null:i); }} className='w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px]'>{f.q}<span>{faqOpen===i?'−':'+'}</span></button>{faqOpen===i && <div className='px-4 py-3 text-[12px] bg-white'>{f.a}</div>}</div>; })}
              </div>
            </div>
          </>
        )}

        {activeTab==='articles' && (
          <div>
            <h1 className='text-[20px] font-black'>Daily Articles Blog</h1>
            <p className='text-[12px] text-zinc-500 mt-1'>Roz naya article yahan padho. User comment kar sakta hai.</p>

            {!isAdmin && (
              <div className='mt-4 bg-white border rounded-[16px] p-4'>
                <p className='text-[12px] font-bold'>Admin Login - Mobile se post karne ke liye</p>
                <div className='flex gap-2 mt-2'>
                  <input type='password' value={adminPass} onChange={function(e){ setAdminPass(e.target.value); }} placeholder='Password: admin123' className='flex-1 border rounded-full px-4 py-2.5 text-[13px]' />
                  <button onClick={function(){ if(adminPass==='admin123'){ setIsAdmin(true); localStorage.setItem('admin-login','yes'); setAdminPass(''); } else alert('Wrong password'); }} className='bg-black text-white px-5 rounded-full text-[12px] font-bold'>Login</button>
                </div>
                <p className='text-[10px] text-zinc-400 mt-2'>Mobile se post karne ke liye login karo. Password: admin123</p>
              </div>
            )}

            {isAdmin && (
              <div className='mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-[16px] p-4'>
                <div className='flex justify-between items-center'>
                  <p className='text-[13px] font-black'>📱 Mobile Admin - New Article Post Karo</p>
                  <button onClick={function(){ setIsAdmin(false); localStorage.removeItem('admin-login'); }} className='text-[11px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold'>Logout</button>
                </div>
                <input value={newTitle} onChange={function(e){ setNewTitle(e.target.value); }} placeholder='Title - e.g. Aaj ka naya tip' className='w-full mt-3 border rounded-xl px-4 py-3 text-[13px]' />
                <textarea value={newContent} onChange={function(e){ setNewContent(e.target.value); }} placeholder='Full content 4-5 lines likho...' className='w-full mt-2 border rounded-xl px-4 py-3 text-[13px] h-[100px]'></textarea>
                <button onClick={function(){
                  if(!newTitle||!newContent){ alert('Dono bharo'); return; }
                  var newPost = { id: Date.now(), date: new Date().toISOString().slice(0,10), title: newTitle, content: newContent, comments: [] };
                  var updated = [newPost].concat(posts);
                  savePosts(updated);
                  setNewTitle(''); setNewContent(''); setShowAdminForm(false);
                  alert('✅ Article Post Ho Gaya! Sabko dikhega.');
                }} className='mt-3 w-full h-12 bg-black text-white rounded-full font-black'>Publish from Mobile</button>
                <p className='text-[10px] text-zinc-500 mt-2 text-center'>Ye article aapke phone me save hoga aur turant sabko dikhega. Permanent ke liye Vercel par bhi save karna hai to neeche dekho.</p>
              </div>
            )}

            <div className='mt-5 space-y-4'>
              {posts.map(function(p){
                var isOpen = openPost===p.id;
                return <div key={p.id} className='bg-white rounded-[20px] border p-5'>
                  <div className='text-[10px] font-bold bg-zinc-100 inline-block px-2 py-1 rounded-full'>{p.date}</div>
                  <h2 className='font-black text-[16px] mt-2 leading-tight'>{p.title}</h2>
                  <p className='text-[13px] text-zinc-600 mt-2 leading-6'>{isOpen? p.content : p.content.substring(0,130) + '...'}</p>
                  <button onClick={function(){ setOpenPost(isOpen?null:p.id); }} className='mt-2 text-[12px] font-black text-blue-600'>{isOpen?'Show Less':'Read More →'}</button>
                  {isAdmin && <button onClick={function(){ if(confirm('Delete?')){ savePosts(posts.filter(function(x:any){return x.id!==p.id;})); } }} className='ml-3 text-[11px] text-red-600 font-bold'>Delete</button>}
                  <div className='mt-4 border-t pt-3'>
                    <p className='font-bold text-[12px]'>Comments ({(p.comments||[]).length})</p>
                    <div className='mt-2 space-y-2'>
                      {(p.comments||[]).map(function(c:any,i:number){ return <div key={i} className='bg-zinc-50 border rounded-xl p-3'><p className='font-bold text-[11px]'>{c.name}</p><p className='text-[12px] mt-1'>{c.text}</p></div>; })}
                    </div>
                    <div className='flex gap-2 mt-3'>
                      <input value={isOpen?commentName:''} onChange={function(e){ setCommentName(e.target.value); setOpenPost(p.id); }} placeholder='Your name' className='flex-1 border rounded-full px-3 py-2 text-[12px]' />
                      <input value={isOpen?commentText:''} onChange={function(e){ setCommentText(e.target.value); setOpenPost(p.id); }} placeholder='Comment' className='flex-[2] border rounded-full px-3 py-2 text-[12px]' />
                      <button onClick={function(){
                        if(!commentName||!commentText){ alert('Name + comment'); return; }
                        var updated = posts.map(function(x:any){ if(x.id===p.id){ return {...x, comments: [...(x.comments||[]), {name: commentName, text: commentText}]}; } return x; });
                        savePosts(updated); setCommentName(''); setCommentText('');
                      }} className='bg-black text-white px-4 rounded-full text-[12px] font-bold'>Post</button>
                    </div>
                  </div>
                </div>;
              })}
            </div>

            <div className='mt-6 bg-white border rounded-[16px] p-4'>
              <h3 className='font-black text-[13px]'>📱 Mobile se Permanent Post kaise kare?</h3>
              <div className='text-[11px] text-zinc-600 mt-2 leading-5 space-y-2'>
                <p><b>Step 1:</b> Upar admin login karo (password: admin123) aur article publish karo - ye turant dikhega.</p>
                <p><b>Step 2:</b> Permanent sabke liye chahiye to GitHub App download karo (mobile me).</p>
                <p><b>Step 3:</b> GitHub App me apna lorem-pro-tool repo open karo → app/fake-data-generator/page.tsx → Edit → DEFAULT_BLOGS array me naya article paste karo → Commit.</p>
                <p><b>Easy tarika:</b> Admin panel se post karne ke baad jo article dikh raha hai usko aap screenshot leke yaad rakh lo, fir raat ko ek baar GitHub App se code me daal do - Vercel auto deploy ho jayega.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
