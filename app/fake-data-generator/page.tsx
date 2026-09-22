// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const ALL_FIELDS = ['Full Name','Email','Mobile','Address','City','Pincode','Company','PAN','Aadhaar','UPI ID'];
const LANGS = ['Hindi','Tamil','Telugu','Marathi','Bengali','Gujarati','Malayalam','Kannada','Punjabi','Marwari','Urdu','Bhojpuri','Odia','English','Hinglish','English (US)','Spanish','French','German','Portuguese','Japanese','Chinese','Russian','Arabic','Korean','Italian','Turkish','Dutch','Thai','Vietnamese'];

const FULL_DATA: any = {
  Hindi: { names: ['अमित शर्मा','रवि वर्मा','सुनील कुमार','पूजा गुप्ता','नेहा सिंह','विजय यादव','अंजली मिश्रा','राहुल तिवारी','सीमा चौधरी','अजय कुमार','प्रिया शुक्ला','मनोज पांडे','सुरेश गुप्ता','राधा वर्मा','किशोर सिंह','संजय गुप्ता','अनिल कुमार','गीता देवी','राजेश सिंह','सुनीता वर्मा'], cities: ['दिल्ली','मुंबई','जयपुर','सूरतगढ़','लखनऊ','पटना','भोपाल','इंदौर'], addr: 'एमजी रोड', comp: 'प्रा. लि.' },
  Bhojpuri: { names: ['खेसारी लाल','पवन सिंह','अक्षरा सिंह','रानी चटर्जी','दिनेश लाल','आम्रपाली दुबे','मनोज तिवारी','काजल राघवानी','निरहुआ','अंजना सिंह','प्रदीप पांडे','मोनालिसा','रवि किशन','समर सिंह','शुभी शर्मा','यश कुमार','अनारा गुप्ता','संचिता बनर्जी','गौरव झा','रक्षा गुप्ता'], cities: ['पटना','आरा','बलिया','छपरा','बक्सर','सीवान'], addr: 'एमजी रोड', comp: 'टेक प्रा. लि.' },
  English: { names: ['Aarav Mehta','Ananya Singh','Rahul Kumar','Priya Sharma','Vijay Patel','Neha Gupta','Amit Verma','Pooja Yadav','Sanjay Rao','Kavita Desai'], cities: ['Delhi','Mumbai','Jaipur','Bangalore'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  'English (US)': { names: ['John Smith','Emma Johnson','Michael Brown'], cities: ['New York','Los Angeles'], addr: '5th Avenue', comp: 'Inc.' },
  Japanese: { names: ['田中太郎','佐藤花子','鈴木一郎','高橋美咲','渡辺健太','伊藤さくら','山本大輔','中村優子','小林誠','加藤愛'], cities: ['東京','大阪','京都','横浜'], addr: '中央通り', comp: '株式会社' },
  Chinese: { names: ['张伟','王芳','李强','刘洋','陈静','杨敏','黄磊','赵丽','周杰','吴倩','孙浩','马丽','朱明','胡斌','郭婷','林峰','何静','高翔','罗娟','梁超','范冰冰','章子怡','杨幂','刘德华','张学友'], cities: ['北京','上海','广州','深圳','成都','杭州'], addr: '中山路', comp: '有限公司' },
  Spanish: { names: ['Jose Garcia','Maria Lopez','Carlos Ruiz'], cities: ['Madrid','Barcelona'], addr: 'Calle Mayor', comp: 'S.L.' },
  French: { names: ['Pierre Dupont','Marie Dubois'], cities: ['Paris','Lyon'], addr: 'Rue de la Paix', comp: 'SARL' },
  German: { names: ['Hans Muller','Greta Schmidt'], cities: ['Berlin','Munich'], addr: 'Hauptstrasse', comp: 'GmbH' },
  Russian: { names: ['Иван Иванов','Анна Петрова'], cities: ['Москва','Санкт-Петербург'], addr: 'ул. Ленина', comp: 'ООО' },
  Arabic: { names: ['محمد أحمد','فاطمة علي'], cities: ['دبي','الرياض'], addr: 'شارع الملك', comp: 'ذ.م.م' },
  Korean: { names: ['김민준','박지연'], cities: ['서울','부산'], addr: '강남대로', comp: '주식회사' },
  Tamil: { names: ['அர்ஜுன் குமார்','சூர்யா சிவகுமார்'], cities: ['சென்னை','கோயம்புத்தூர்'], addr: 'எம்.ஜி. சாலை', comp: 'டெக்' },
  Telugu: { names: ['రవి తేజ','పవన్ కళ్యాణ్'], cities: ['హైదరాబాద్','విజయవాడ'], addr: 'ఎంజి రోడ్', comp: 'టెక్' },
  Marathi: { names: ['साहिल जोशी','ओंकार पाटील'], cities: ['पुणे','मुंबई'], addr: 'एमजी रस्ता', comp: 'टेक' },
  Bengali: { names: ['অরিন্দম দাস','সৌরভ গাঙ্গুলী'], cities: ['কলকাতা','হাওড়া'], addr: 'এমজি রোড', comp: 'টেক' },
  Gujarati: { names: ['હાર્દિક પટેલ','કિંજલ દવે'], cities: ['અમદાવાદ','સુરત'], addr: 'એમજી રોડ', comp: 'ટેક' },
  Malayalam: { names: ['മോഹൻലാൽ','ദുൽഖർ'], cities: ['കൊച്ചി'], addr: 'എംജി റോഡ്', comp: 'ടെക്' },
  Kannada: { names: ['ಯಶ್ ಗೌಡ','ರಶ್ಮಿಕಾ ಮಂದಣ್ಣ'], cities: ['ಬೆಂಗಳೂರು'], addr: 'ಎಂಜಿ ರಸ್ತೆ', comp: 'ಟೆಕ್' },
  Punjabi: { names: ['ਜੱਸੀ ਗਿੱਲ','ਸਿਮਰਨ ਕੌਰ'], cities: ['ਲੁਧਿਆਣਾ'], addr: 'ਐਮਜੀ ਰੋਡ', comp: 'ਟੈਕ' },
  Marwari: { names: ['भंवर सिंह','कमला देवी'], cities: ['बीकानेर','जोधपुर'], addr: 'एमजी रोड़', comp: 'टेक' },
  Urdu: { names: ['عمران خان','زویا شیخ'], cities: ['کراچی'], addr: 'ایم جی روڈ', comp: 'ٹیک' },
  Odia: { names: ['ଶୁଭମ ମହାନ୍ତି'], cities: ['ଭୁବନେଶ୍ୱର'], addr: 'ଏମଜି ରୋଡ', comp: 'ଟେକ୍' },
  Hinglish: { names: ['Aarav Sharma','Pooja Singh'], cities: ['Delhi'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  Portuguese: { names: ['Joao Silva'], cities: ['Lisboa'], addr: 'Rua Augusta', comp: 'Lda.' },
  Italian: { names: ['Marco Rossi'], cities: ['Roma'], addr: 'Via Roma', comp: 'S.r.l.' },
  Turkish: { names: ['Mehmet Yilmaz'], cities: ['Istanbul'], addr: 'Ataturk Caddesi', comp: 'A.S.' },
  Dutch: { names: ['Jan Jansen'], cities: ['Amsterdam'], addr: 'Damstraat', comp: 'B.V.' },
  Thai: { names: ['สมชาย ใจดี'], cities: ['กรุงเทพ'], addr: 'ถนนสุขุมวิท', comp: 'จำกัด' },
  Vietnamese: { names: ['Nguyen Van A'], cities: ['Ha Noi'], addr: 'Duong Le Loi', comp: 'TNHH' },
};

// ROZ YAHAN NAYA ARTICLE ADD KARO - YE BLOG HAI
const BLOG_POSTS = [
  { id: 1, date: '2025-05-20', title: 'What is Fake Data? Complete Guide for Beginners', content: 'Fake data is artificially created information that looks real but is not linked to any real person. For example, name like Aarav Mehta, email like aarav.mehta1234@gmail.com, address like 123 MG Road, Delhi. Developers use it to test apps, websites and databases without risking real user privacy. Our tool generates this fake data in 30 languages including Hindi, Bhojpuri, Tamil, Japanese, Chinese etc. It is 100% safe and free.', comments: [{name:'Rahul', text:'Very useful for my college project!'}, {name:'Priya', text:'Bhojpuri data helped a lot'}] },
  { id: 2, date: '2025-05-21', title: 'Why Bhojpuri and Hindi Fake Data is Important?', content: 'Most fake data tools only give English names like John Smith. But if you are building an app for Bihar, UP, or MP, you need names like खेसारी लाल, पवन सिंह, अक्षरा सिंह and cities like पटना, आरा, बलिया. Our tool is special because we provide 20+ Bhojpuri names with proper Hindi script. This makes your app testing feel real for local users and helps you find UI issues with Hindi fonts.', comments: [{name:'Khesari Fan', text:'Finally Bhojpuri support!'}] },
  { id: 3, date: '2025-05-22', title: 'How to Test Global Apps with Chinese and Japanese Data', content: 'If your app will be used in China or Japan, you must test if it can handle characters like 张伟 (Chinese) or 田中太郎 (Japanese). Many apps break because database is not UTF-8 or fonts dont support Asian scripts. With our generator, you can create 1000 Chinese names like 张伟, 王芳, 范冰冰 with cities like 北京, 上海 and check if your app displays them correctly. We include 40 Chinese and 15 Japanese names to avoid repetition.', comments: [] },
  { id: 4, date: '2025-05-23', title: 'JSON vs CSV vs SQL - Which Format to Choose?', content: 'Beginners get confused which format to download. Here is simple guide: Use JSON if you are a developer testing APIs or React apps. Use CSV if you want to open in Excel or Google Sheets. Use SQL if you want to directly insert into MySQL or PostgreSQL database. Use TXT if you just want to quickly read data. All formats in our tool support Hindi and Chinese because we add UTF-8 BOM so file opens correctly on mobile and computer.', comments: [] },
  { id: 5, date: '2025-05-24', title: 'Top 5 Use Cases of Fake Data Generator', content: '1) App Testing - Test signup, login pages without real data. 2) UI Design - Show realistic names in Figma designs. 3) Database Seeding - Fill empty database with 1000 rows. 4) Demo for Investors - Show your startup app with populated data. 5) College Projects - Submit projects with realistic test data. All without violating privacy or GDPR.', comments: [] },
];

const FIRST = ['amit','ravi','sunil','pooja','neha','rahul','ananya','arjun','priya','vijay','john','emma'];
const LAST = ['sharma','verma','gupta','singh','yadav','kumar','patel','smith','johnson'];
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
  var [showTopBtn,setShowTopBtn]=useState(false);
  var [activeTab,setActiveTab]=useState('tool');
  var [posts,setPosts]=useState(BLOG_POSTS);
  var [openPost,setOpenPost]=useState(null as any);
  var [commentName,setCommentName]=useState('');
  var [commentText,setCommentText]=useState('');

  useEffect(function(){
    document.title = 'Fake Data Generator - 30 Languages | Free Tool + Daily Blog';
    var m1 = document.createElement('meta');
    m1.name = 'description';
    m1.content = 'Free Fake Data Generator in 30 Languages + Daily Articles Blog. Hindi, Bhojpuri, Chinese, Japanese.';
    document.head.appendChild(m1);
    var saved = localStorage.getItem('blog-comments');
    if(saved){ try{ var c = JSON.parse(saved); setPosts(c); }catch(e){} }
    var onScroll = function(){ setShowTopBtn(window.scrollY > 400); };
    window.addEventListener('scroll', onScroll);
    return function(){ window.removeEventListener('scroll', onScroll); };
  },[]);

  var generate = function(){
    var newData = Array.from({length: count}, function(){ return genOne(fields, lang); });
    setData(newData);
  };
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
    if(view==='txt') return data.map(function(r,i){ return (i+1) + '. Full Name: ' + (r['Full Name']||'') + ' | Email: ' + (r['Email']||'') + ' | City: ' + (r['City']||''); }).join('\r\n\r\n');
    if(view==='sql'){
      if(!data.length) return '';
      var cols = Object.keys(data[0]).join(', ');
      var vals = data.map(function(r){ return '(' + Object.values(r).map(function(v){ return "'" + String(v).replace(/'/g,"''") + "'"; }).join(', ') + ')'; }).join(',\n');
      return 'INSERT INTO users (' + cols + ') VALUES\n' + vals + ';';
    }
    return JSON.stringify(data, null, 2);
  };

  var handleDownload = function(){
    var str = getStr();
    var blob = new Blob(['\uFEFF' + str], {type: 'text/plain;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'fake-data-' + lang + '.' + (view==='table'?'txt':view);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  var addComment = function(postId: any){
    if(!commentName ||!commentText){ alert('Name and comment required'); return; }
    var updated = posts.map(function(p:any){
      if(p.id===postId){
        var newC = {name: commentName, text: commentText};
        return {...p, comments: [...(p.comments||[]), newC]};
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem('blog-comments', JSON.stringify(updated));
    setCommentName(''); setCommentText('');
  };

  return (
    <div className='min-h-screen bg-[#f8f8f7] text-zinc-900'>
      <header className='sticky top-0 z-40 bg-black text-white px-4 py-3 flex justify-between items-center'>
        <h1 className='font-black text-[18px]'>⚡ Lorem Pro Tool</h1>
        <div className='flex gap-2'>
          <button onClick={function(){ setActiveTab('tool'); }} className={'px-4 py-2 rounded-full text-[12px] font-bold ' + (activeTab==='tool'?'bg-white text-black':'bg-zinc-800')}>Generator</button>
          <button onClick={function(){ setActiveTab('articles'); }} className={'px-4 py-2 rounded-full text-[12px] font-bold ' + (activeTab==='articles'?'bg-yellow-400 text-black':'bg-zinc-800')}>Articles</button>
        </div>
      </header>

      <main className='max-w-[1100px] mx-auto px-3 py-4 pb-28'>
        {activeTab==='tool' && (
          <>
            <h1 className='text-[24px] font-black mt-2'>Fake Data Generator - 30 Languages</h1>
            <p className='text-zinc-500 text-[12px] mt-1'>Free Tool | 15 Indian + 15 Global | No Repeat | Readable Download</p>

            <div className='bg-white rounded-[24px] border p-5 mt-4'>
              <label className='font-bold text-[14px]'>Select Language</label>
              <select value={lang} onChange={function(e){ setLang(e.target.value); }} className='w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold'>
                {LANGS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
              </select>
              <div className='mt-2 bg-green-100 text-green-800 text-[12px] font-bold px-3 py-2 rounded-full text-center'>{lang} - {FULL_DATA[lang]?.names?.length} Names | Email Always English</div>
              <div className='grid grid-cols-2 gap-2.5 mt-4'>
                {ALL_FIELDS.map(function(f){ var a=fields.includes(f); return <button key={f} onClick={function(){ if(a) setFields(fields.filter(function(x){return x!==f;})); else if(fields.length<10) setFields([...fields,f]); }} className={'h-[48px] rounded-full text-[13px] font-bold ' + (a?'bg-black text-white':'bg-zinc-100')}>{f}</button>; })}
              </div>
              <div className='mt-5'><label className='font-bold text-[14px]'>Records: {count}</label><input type='range' min={1} max={1000} value={count} onChange={function(e){ setCount(parseInt(e.target.value)); }} className='w-full mt-2 accent-black' /></div>
              <button onClick={generate} className='mt-5 w-full h-[56px] bg-black text-white rounded-full font-black'>Generate {count} Records in {lang}</button>
            </div>

            {data.length>0 && (
              <div className='mt-5 bg-white rounded-[24px] border p-4'>
                <div className='flex gap-2 overflow-auto pb-2'>
                  {['table','json','csv','txt','sql'].map(function(v){ return <button key={v} onClick={function(){ setView(v); }} className={'px-6 h-10 rounded-full text-xs font-black uppercase ' + (view===v?'bg-black text-white':'bg-zinc-100')}>{v}</button>; })}
                </div>
                <div className='flex gap-2 mt-4'>
                  <button onClick={function(){ localStorage.setItem('saved-data', getStr()); setSaveText('✓ Saved!'); setTimeout(function(){ setSaveText('Save'); },2000); }} className={'flex-1 h-12 rounded-full font-bold ' + (saveText.indexOf('Saved')>-1?'bg-green-500 text-white':'bg-zinc-100')}>{saveText}</button>
                  <button onClick={function(){ navigator.clipboard.writeText(getStr()); setCopyText('✓ Copied!'); setTimeout(function(){ setCopyText('Copy'); },2000); }} className={'flex-1 h-12 rounded-full font-bold ' + (copyText.indexOf('Copied')>-1?'bg-green-500 text-white':'bg-black text-white')}>{copyText}</button>
                  <button onClick={handleDownload} className='flex-1 h-12 rounded-full bg-yellow-400 font-black text-[13px]'>Download</button>
                </div>
                <div className='mt-4 border-2 border-zinc-900 rounded-2xl overflow-auto max-h-[500px]'>
                  {view==='table'?
                    <table className='w-full text-[13px] border-collapse'>
                      <thead className='bg-zinc-900 text-white sticky top-0'><tr>{Object.keys(data[0]||{}).map(function(k){ return <th key={k} className='text-center p-4 border-r last:border-0 whitespace-nowrap'>{k}</th>; })}</tr></thead>
                      <tbody>{data.map(function(r,i){ return <tr key={i} className={'border-t ' + (i%2===0?'bg-white':'bg-zinc-50')}>{Object.values(r).map(function(v,j){ return <td key={j} className='text-center p-4 border-r last:border-0 min-w-[150px] whitespace-nowrap'>{String(v)}</td>; })}</tr>; })}</tbody>
                    </table>
                  : <pre className='p-4 text-[12px] whitespace-pre-wrap font-mono'>{getStr()}</pre>}
                </div>
              </div>
            )}

            <div className='mt-6 bg-white rounded-[24px] border overflow-hidden'>
              <button onClick={function(){ setShowArticle(!showArticle); }} className='w-full p-5 flex justify-between font-black text-left'>What is Fake Data Generator? <span>{showArticle?'−':'+'}</span></button>
              {showArticle && <div className='px-5 pb-6 text-[14px] text-zinc-700 leading-8 space-y-4'>
                <p><b>Fake Data Generator</b> is a free online tool for developers, testers, designers and students to create realistic-looking dummy data for testing apps and websites without using real people's personal information.</p>
                <p><b>Why do you need it?</b> When you build a login page, a shopping app, or a database, you need names, emails, phone numbers, addresses to test if your design works. Using real data is illegal and unsafe. Our tool generates 100% fake data like <b>अमित शर्मा, खेसारी लाल, 张伟, 田中太郎, John Smith</b> in seconds.</p>
                <p><b>30 Languages Support:</b> We support 15 Indian languages including Hindi, Bhojpuri, Tamil, Telugu, Marathi, Bengali and 15 global languages including Japanese, Chinese, Spanish, French, Arabic. Select any language and Name, City, Address, Company will change to native script. Email is always in English because <b>अमित@gmail.com</b> is technically invalid.</p>
                <p><b>Key Features:</b> Generate 1 to 1000 records, choose 10 fields, export to JSON, CSV, TXT, SQL, center-aligned preview, UTF-8 readable download, and daily helpful articles in Articles section.</p>
              </div>}
            </div>

            <div className='mt-5 bg-white rounded-[24px] border p-5'>
              <h3 className='font-black text-[18px]'>FAQ - Real User Questions</h3>
              <div className='mt-4 space-y-2'>
                {[
                  {q:'Is this data real? Can I use for official work?', a:'No, 100% fake for testing only. Do not use for KYC, bank, government.'},
                  {q:'How many languages?', a:'30 languages - 15 Indian + 15 Global. Hindi, Bhojpuri, Tamil, Japanese, Chinese, Spanish etc.'},
                  {q:'Why Email always English?', a:'Because email with Hindi/Chinese script like अमित@gmail.com is invalid worldwide. Only English email works.'},
                  {q:'Is it free? How many records?', a:'100% free, no login. Generate 1 to 1000 records in one click.'},
                  {q:'Which download format?', a:'JSON for API, CSV for Excel, SQL for database, TXT for reading. All UTF-8 readable.'},
                ].map(function(f,i){ return <div key={i} className='border rounded-xl overflow-hidden'><button onClick={function(){ setFaqOpen(faqOpen===i?null:i); }} className='w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px]'>{f.q}<span>{faqOpen===i?'−':'+'}</span></button>{faqOpen===i && <div className='px-4 py-3 text-[13px] bg-white leading-6 text-zinc-600'>{f.a}</div>}</div>; })}
              </div>
            </div>

            <div className='mt-6 bg-yellow-100 border-2 border-yellow-400 rounded-[20px] p-5 text-center'>
              <p className='font-black text-[15px]'>Want to read daily tips?</p>
              <p className='text-[13px] text-zinc-600 mt-1'>We post new articles daily about testing and fake data</p>
              <button onClick={function(){ setActiveTab('articles'); window.scrollTo({top:0, behavior:'smooth'}); }} className='mt-3 px-8 py-3 bg-black text-white rounded-full font-bold text-[13px]'>Go to Articles →</button>
            </div>
          </>
        )}

        {activeTab==='articles' && (
          <div>
            <div className='flex items-center gap-2 mt-2'>
              <button onClick={function(){ setActiveTab('tool'); }} className='text-[13px] font-bold bg-zinc-200 px-4 py-2 rounded-full'>← Back to Tool</button>
              <h1 className='text-[22px] font-black'>Daily Articles Blog</h1>
            </div>
            <p className='text-[12px] text-zinc-500 mt-2'>Read daily tips about fake data, testing, and regional app development. You can comment on articles.</p>
            <p className='text-[11px] text-zinc-400 mt-1 bg-white border rounded-full px-3 py-1 inline-block'>Admin: To add new article daily, edit BLOG_POSTS array in page.tsx and push</p>

            <div className='mt-5 space-y-4'>
              {posts.map(function(post){
                var isOpen = openPost===post.id;
                return <div key={post.id} className='bg-white rounded-[24px] border p-5'>
                  <div className='flex gap-2 items-center'><span className='bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full'>{post.date}</span><span className='text-[11px] text-zinc-400'>Article #{post.id}</span></div>
                  <h2 className='font-black text-[17px] mt-3 leading-tight'>{post.title}</h2>
                  <p className='text-[14px] text-zinc-600 mt-3 leading-7'>{isOpen? post.content : post.content.substring(0,150) + '...'}</p>
                  <button onClick={function(){ setOpenPost(isOpen?null:post.id); }} className='mt-3 text-[13px] font-black text-blue-600'>{isOpen?'Show Less':'Read Full Article →'}</button>

                  <div className='mt-5 border-t pt-4'>
                    <h4 className='font-bold text-[13px]'>Comments ({(post.comments||[]).length}) - User can comment</h4>
                    <div className='mt-3 space-y-2'>
                      {(post.comments||[]).map(function(c:any,i:number){ return <div key={i} className='bg-zinc-50 border rounded-xl p-3'><div className='font-bold text-[12px]'>{c.name}</div><div className='text-[12px] text-zinc-600 mt-1'>{c.text}</div></div>; })}
                      {(!post.comments||post.comments.length===0) && <p className='text-[12px] text-zinc-400'>No comments yet. Be first to comment!</p>}
                    </div>
                    <div className='mt-4 bg-zinc-50 rounded-xl p-3 border'>
                      <input value={openPost===post.id?commentName:''} onChange={function(e){ setCommentName(e.target.value); if(openPost!==post.id) setOpenPost(post.id); }} placeholder='Your name' className='w-full border rounded-full px-4 py-2.5 text-[13px] outline-none' />
                      <textarea value={openPost===post.id?commentText:''} onChange={function(e){ setCommentText(e.target.value); if(openPost!==post.id) setOpenPost(post.id); }} placeholder='Write your comment...' className='w-full mt-2 border rounded-xl px-4 py-2.5 text-[13px] h-[60px] outline-none'></textarea>
                      <button onClick={function(){ addComment(post.id); }} className='mt-2 w-full h-10 bg-black text-white rounded-full font-bold text-[13px]'>Post Comment</button>
                    </div>
                  </div>
                </div>;
              })}
            </div>
          </div>
        )}
      </main>

      {showTopBtn && (
        <div className='fixed bottom-6 right-4 flex flex-col gap-3 z-50'>
          <button onClick={function(){ window.scrollTo({top:0,behavior:'smooth'}); }} className='w-12 h-12 rounded-full bg-black text-white font-black text-xl shadow-xl'>↑</button>
          <button onClick={function(){ window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'}); }} className='w-12 h-12 rounded-full bg-yellow-400 text-black font-black text-xl shadow-xl'>↓</button>
        </div>
      )}
    </div>
  )
}
