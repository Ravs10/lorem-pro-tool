// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const ALL_FIELDS = ['Full Name','Email','Mobile','Address','City','Pincode','Company','PAN','Aadhaar','UPI ID'];
const LANGS = ['Hindi','Tamil','Telugu','Marathi','Bengali','Gujarati','Malayalam','Kannada','Punjabi','Marwari','Urdu','Bhojpuri','Odia','English','Hinglish','English (US)','Spanish','French','German','Portuguese','Japanese','Chinese','Russian','Arabic','Korean','Italian','Turkish','Dutch','Thai','Vietnamese'];

const FULL_DATA: any = {
  Hindi: { names: ['अमित शर्मा','रवि वर्मा','सुनील कुमार','पूजा गुप्ता','नेहा सिंह','विजय यादव','अंजली मिश्रा','राहुल तिवारी','सीमा चौधरी','अजय कुमार','प्रिया शुक्ला','मनोज पांडे','सुरेश गुप्ता','राधा वर्मा','किशोर सिंह','संजय गुप्ता','अनिल कुमार','गीता देवी','राजेश सिंह','सुनीता वर्मा'], cities: ['दिल्ली','मुंबई','जयपुर','सूरतगढ़','लखनऊ','पटना','भोपाल','इंदौर'], addr: 'एमजी रोड', comp: 'प्रा. लि.' },
  Tamil: { names: ['அர்ஜுன் குமார்','சூர்யா சிவகுமார்','பிரியா லட்சுமி','விஜய் சேதுபதி','நயன்தாரா','தனுஷ்'], cities: ['சென்னை','கோயம்புத்தூர்','மதுரை'], addr: 'எம்.ஜி. சாலை', comp: 'டெக்' },
  Telugu: { names: ['రవి తేజ','పవన్ కళ్యాణ్','సమంత అక్కినేని','అల్లు అర్జున్'], cities: ['హైదరాబాద్','విజయవాడ'], addr: 'ఎంజి రోడ్', comp: 'టెక్' },
  Marathi: { names: ['साहिल जोशी','ओंकार पाटील','स्नेहा कुलकर्णी'], cities: ['पुणे','मुंबई'], addr: 'एमजी रस्ता', comp: 'टेक' },
  Bengali: { names: ['অরিন্দম দাস','সৌরভ গাঙ্গুলী','রিয়া সেন'], cities: ['কলকাতা','হাওড়া'], addr: 'এমজি রোড', comp: 'টেক' },
  Gujarati: { names: ['હાર્દિક પટેલ','કિંજલ દવે'], cities: ['અમદાવાદ','સુરત'], addr: 'એમજી રોડ', comp: 'ટેક' },
  Malayalam: { names: ['മോഹൻലാൽ','ദുൽഖർ'], cities: ['കൊച്ചി','തിരുവനന്തപുരം'], addr: 'എംജി റോഡ്', comp: 'ടെക്' },
  Kannada: { names: ['ಯಶ್ ಗೌಡ','ರಶ್ಮಿಕಾ ಮಂದಣ್ಣ'], cities: ['ಬೆಂಗಳೂರು','ಮೈಸೂರು'], addr: 'ಎಂಜಿ ರಸ್ತೆ', comp: 'ಟೆಕ್' },
  Punjabi: { names: ['ਜੱਸੀ ਗਿੱਲ','ਸਿਮਰਨ ਕੌਰ'], cities: ['ਲੁਧਿਆਣਾ','ਅੰਮ੍ਰਿਤਸਰ'], addr: 'ਐਮਜੀ ਰੋਡ', comp: 'ਟੈਕ' },
  Marwari: { names: ['भंवर सिंह','कमला देवी'], cities: ['बीकानेर','जोधपुर','सूरतगढ़'], addr: 'एमजी रोड़', comp: 'टेक' },
  Urdu: { names: ['عمران خان','زویا شیخ'], cities: ['کراچی','لاہور'], addr: 'ایم جی روڈ', comp: 'ٹیک' },
  Bhojpuri: { names: ['खेसारी लाल','पवन सिंह','अक्षरा सिंह','रानी चटर्जी','दिनेश लाल','आम्रपाली दुबे','मनोज तिवारी','काजल राघवानी','निरहुआ','अंजना सिंह','प्रदीप पांडे','मोनालिसा','रवि किशन','समर सिंह','शुभी शर्मा','यश कुमार','अनारा गुप्ता','संचिता बनर्जी','गौरव झा','रक्षा गुप्ता'], cities: ['पटना','आरा','बलिया','छपरा','बक्सर','सीवान','गोपालगंज','मुजफ्फरपुर'], addr: 'एमजी रोड', comp: 'टेक प्रा. लि.' },
  Odia: { names: ['ଶୁଭମ ମହାନ୍ତି','ସୋନଲ ମହାପାତ୍ର'], cities: ['ଭୁବନେଶ୍ୱର','କଟକ'], addr: 'ଏମଜି ରୋଡ', comp: 'ଟେକ୍' },
  English: { names: ['Aarav Mehta','Ananya Singh','Rahul Kumar','Priya Sharma','Vijay Patel','Neha Gupta','Amit Verma','Pooja Yadav','Sanjay Rao','Kavita Desai','Rohit Shetty','Sneha Kulkarni','Vikram Malhotra','Anjali Nair','Arjun Reddy'], cities: ['Delhi','Mumbai','Jaipur','Bangalore','Chennai','Kolkata'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  Hinglish: { names: ['Aarav Sharma','Pooja Singh'], cities: ['Delhi','Mumbai'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  'English (US)': { names: ['John Smith','Emma Johnson','Michael Brown','Olivia Davis','James Wilson'], cities: ['New York','Los Angeles','Chicago'], addr: '5th Avenue', comp: 'Inc.' },
  Spanish: { names: ['Jose Garcia','Maria Lopez','Carlos Ruiz','Ana Martinez','Luis Hernandez'], cities: ['Madrid','Barcelona','Valencia'], addr: 'Calle Mayor', comp: 'S.L.' },
  French: { names: ['Pierre Dupont','Marie Dubois','Luc Bernard'], cities: ['Paris','Lyon'], addr: 'Rue de la Paix', comp: 'SARL' },
  German: { names: ['Hans Muller','Greta Schmidt','Klaus Weber'], cities: ['Berlin','Munich'], addr: 'Hauptstrasse', comp: 'GmbH' },
  Portuguese: { names: ['Joao Silva','Ana Santos'], cities: ['Lisboa','Porto'], addr: 'Rua Augusta', comp: 'Lda.' },
  Japanese: { names: ['田中太郎','佐藤花子','鈴木一郎','高橋美咲','渡辺健太','伊藤さくら','山本大輔','中村優子','小林誠','加藤愛','吉田翔太','山田彩乃','佐々木蓮','松本結衣','井上拓海'], cities: ['東京','大阪','京都','横浜','名古屋','札幌'], addr: '中央通り', comp: '株式会社' },
  Chinese: { names: ['张伟','王芳','李强','刘洋','陈静','杨敏','黄磊','赵丽','周杰','吴倩','孙浩','马丽','朱明','胡斌','郭婷','林峰','何静','高翔','罗娟','梁超','唐娜','韩梅','冯刚','于娜','董强','萧蔷','程琳','曹阳','袁泉','邓超','范冰冰','李冰冰','章子怡','杨幂','刘德华','张学友','郭富城','黎明','周星驰','成龙'], cities: ['北京','上海','广州','深圳','成都','杭州','南京','武汉','西安','重庆'], addr: '中山路', comp: '有限公司' },
  Russian: { names: ['Иван Иванов','Анна Петрова','Сергей Смирнов'], cities: ['Москва','Санкт-Петербург'], addr: 'ул. Ленина', comp: 'ООО' },
  Arabic: { names: ['محمد أحمد','فاطمة علي','أحمد حسن'], cities: ['دبي','الرياض','القاهرة'], addr: 'شارع الملك', comp: 'ذ.م.م' },
  Korean: { names: ['김민준','박지연','이서준'], cities: ['서울','부산'], addr: '강남대로', comp: '주식회사' },
  Italian: { names: ['Marco Rossi','Giulia Bianchi'], cities: ['Roma','Milano'], addr: 'Via Roma', comp: 'S.r.l.' },
  Turkish: { names: ['Mehmet Yilmaz','Ayse Kaya'], cities: ['Istanbul','Ankara'], addr: 'Ataturk Caddesi', comp: 'A.S.' },
  Dutch: { names: ['Jan Jansen','Emma de Vries'], cities: ['Amsterdam','Rotterdam'], addr: 'Damstraat', comp: 'B.V.' },
  Thai: { names: ['สมชาย ใจดี','สมหญิง รักไทย'], cities: ['กรุงเทพ','เชียงใหม่'], addr: 'ถนนสุขุมวิท', comp: 'จำกัด' },
  Vietnamese: { names: ['Nguyen Van A','Tran Thi B'], cities: ['Ha Noi','Ho Chi Minh'], addr: 'Duong Le Loi', comp: 'TNHH' },
};

const DEFAULT_POSTS = [
  { id: 1, date: '2025-05-20', title: 'How to Use Fake Data for App Testing', content: 'Developers need dummy data to test apps without using real user information. Our Fake Data Generator creates realistic names, addresses, cities in 30 languages. You can generate 1000 records in one click and export as JSON for API testing, CSV for Excel, or SQL for database. This keeps your testing safe, fast and GDPR compliant because no real personal data is used.' },
  { id: 2, date: '2025-05-21', title: 'Why Bhojpuri Fake Data is Important for Bihar UP Apps', content: 'If you are building an app for Bihar or UP, your users have names like खेसारी लाल, पवन सिंह and cities like पटना, आरा, बलिया. Using English dummy data like John Smith will not give real testing experience. Our tool provides 20+ Bhojpuri names and 8 Bhojpuri cities with native script, so your UI testing looks real for regional users.' },
  { id: 3, date: '2025-05-22', title: 'Japanese and Chinese Testing Made Easy', content: 'Building a global app? You need to test if your app supports Japanese characters like 田中太郎 and Chinese like 张伟. Our generator provides 40 Chinese names and 15 Japanese names with native cities like 東京, 北京. This helps you check font support, database UTF-8 handling, and UI layout for Asian languages.' },
];

const REAL_FAQS = [
  { q: 'Is this fake data real? Can I use it for official work?', a: 'No, all data is 100% fake and randomly generated for testing only. Names, mobile numbers, Aadhaar, PAN are not real. Do not use for KYC, bank, or government work. It is only for developers, testers, and designers to test apps and websites.' },
  { q: 'How many languages are supported?', a: 'Total 30 languages - 15 Indian: Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Malayalam, Kannada, Punjabi, Marwari, Urdu, Bhojpuri, Odia, English, Hinglish and 15 Global: Spanish, French, German, Portuguese, Japanese, Chinese, Russian, Arabic, Korean, Italian, Turkish, Dutch, Thai, Vietnamese.' },
  { q: 'Why is Email always in English even when I select Hindi or Chinese?', a: 'Because email addresses with Hindi or Chinese script like अमित@gmail.com or 张伟@gmail.com are invalid worldwide. Email system only accepts English letters. So we always generate valid English emails like amit.sharma1234@gmail.com for all languages.' },
  { q: 'Is this tool free? How many records can I generate?', a: 'Yes, 100% free with no login. You can generate from 1 to 1000 records in one click. Select up to 10 fields like Name, Email, Mobile, Address, City, Company, PAN, Aadhaar, UPI ID.' },
  { q: 'In which formats can I download data?', a: '5 formats: Table view for preview, JSON for API developers, CSV for Excel, TXT for quick reading, SQL INSERT query for direct database import. All files support Hindi, Chinese, Japanese with UTF-8.' },
  { q: 'Can I use this for my college project or startup demo?', a: 'Yes, perfect for college projects, startup MVPs, UI design mockups, and client demos. You get realistic data without asking real users for their personal details.' },
  { q: 'Will my generated data be saved? Is it private?', a: 'Data is generated in your browser only. We do not store your data on server. Save button stores in your own browser localStorage. Your data is private to you.' },
  { q: 'What is the Daily Article section?', a: 'We publish a new helpful article every day about testing, fake data tips, and regional app development. Users can only read articles. Only admin can post new articles after login.' },
];

const FIRST = ['amit','ravi','sunil','pooja','neha','rahul','ananya','arjun','priya','vijay','john','emma'];
const LAST = ['sharma','verma','gupta','singh','yadav','kumar','patel','smith','johnson','brown'];
const DOMAINS = ['gmail.com','yahoo.com','outlook.com','testmail.com'];

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
  var [showArticle,setShowArticle]=useState(true);
  var [faqOpen,setFaqOpen]=useState(0);
  var [showTopBtn,setShowTopBtn]=useState(false);
  var [posts,setPosts]=useState(DEFAULT_POSTS);
  var [isAdmin,setIsAdmin]=useState(false);
  var [adminPass,setAdminPass]=useState('');
  var [showAdminLogin,setShowAdminLogin]=useState(false);
  var [newTitle,setNewTitle]=useState('');
  var [newContent,setNewContent]=useState('');
  var [selectedPost,setSelectedPost]=useState(null as any);

  useEffect(function(){
    document.title = 'Fake Data Generator - 30 Languages | Free Test Data Tool';
    var m1 = document.createElement('meta');
    m1.name = 'description';
    m1.content = 'Free Fake Data Generator in 30 Languages - Hindi, Bhojpuri, Tamil, Japanese, Chinese, Spanish. Generate fake name, email, mobile, address for testing.';
    document.head.appendChild(m1);
    var saved = localStorage.getItem('admin-posts');
    if(saved){ try{ setPosts(JSON.parse(saved)); }catch(e){} }
    var admin = localStorage.getItem('isAdmin');
    if(admin==='true') setIsAdmin(true);
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
    if(view==='txt') return data.map(function(r,i){ return (i+1) + '. ' + Object.entries(r).map(function(kv){ return kv[0] + ': ' + kv[1]; }).join(' | '); }).join('\r\n\r\n');
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

  var adminLogin = function(){
    if(adminPass==='admin123'){
      setIsAdmin(true);
      localStorage.setItem('isAdmin','true');
      setShowAdminLogin(false);
      setAdminPass('');
    } else { alert('Wrong password'); }
  };

  return (
    <div className='min-h-screen bg-[#f8f8f7] text-zinc-900'>
      <main className='max-w-[1100px] mx-auto px-3 py-4 pb-28'>
        <h1 className='text-[26px] font-black'>Fake Data Generator - 30 Languages</h1>
        <p className='text-zinc-500 text-[12px] mt-1'>Free Tool for Developers & Testers | 15 Indian + 15 Global Languages</p>

        <div className='bg-white rounded-[24px] border p-5 mt-4'>
          <label className='font-bold text-[14px]'>Select Language</label>
          <select value={lang} onChange={function(e){ setLang(e.target.value); }} className='w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold'>
            {LANGS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
          </select>
          <div className='mt-2 bg-green-100 text-green-800 text-[12px] font-bold px-3 py-2 rounded-full text-center'>Active: {lang} - {FULL_DATA[lang]?.names?.length} Names | Email Always English</div>
          <div className='grid grid-cols-2 gap-2.5 mt-4'>
            {ALL_FIELDS.map(function(f){ var a=fields.includes(f); return <button key={f} onClick={function(){ if(a) setFields(fields.filter(function(x){return x!==f;})); else if(fields.length<10) setFields([...fields,f]); }} className={'h-[48px] rounded-full text-[13px] font-bold ' + (a?'bg-black text-white':'bg-zinc-100')}>{f}</button>; })}
          </div>
          <div className='mt-5'><label className='font-bold text-[14px]'>Records: {count}</label><input type='range' min={1} max={1000} value={count} onChange={function(e){ setCount(parseInt(e.target.value)); }} className='w-full mt-2 accent-black' /></div>
          <button onClick={generate} className='mt-5 w-full h-[56px] bg-black text-white rounded-full font-black'>Generate {count} Records</button>
        </div>

        {data.length>0 && (
          <div className='mt-5 bg-white rounded-[24px] border p-4'>
            <div className='flex gap-2 overflow-auto pb-2'>
              {['table','json','csv','txt','sql'].map(function(v){ return <button key={v} onClick={function(){ setView(v); }} className={'px-6 h-10 rounded-full text-xs font-black uppercase ' + (view===v?'bg-black text-white':'bg-zinc-100')}>{v}</button>; })}
            </div>
            <button onClick={handleDownload} className='mt-3 w-full h-12 rounded-full bg-yellow-400 font-black'>Download {view.toUpperCase()} - Readable File</button>
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
            <p><b>Key Features:</b> Generate 1 to 1000 records, choose 10 fields (Name, Email, Mobile, Address, City, Pincode, Company, PAN, Aadhaar, UPI), export to JSON, CSV, TXT, SQL, center-aligned preview table, UTF-8 readable download for Hindi/Chinese, and daily helpful articles.</p>
            <p><b>Who uses it?</b> App developers for API testing, UI designers for mockups, QA testers for database seeding, college students for projects, startups for investor demos.</p>
          </div>}
        </div>

        <div className='mt-6'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-[20px] font-black'>Daily Articles</h2>
            {!isAdmin? <button onClick={function(){ setShowAdminLogin(true); }} className='text-[11px] font-bold bg-zinc-900 text-white px-4 py-2 rounded-full'>Admin Login</button>
            : <div className='flex gap-2'><span className='text-[11px] font-bold bg-green-100 text-green-800 px-3 py-2 rounded-full'>Admin Mode</span><button onClick={function(){ setIsAdmin(false); localStorage.removeItem('isAdmin'); }} className='text-[11px] font-bold bg-red-100 text-red-700 px-3 py-2 rounded-full'>Logout</button></div>}
          </div>

          {showAdminLogin &&!isAdmin && (
            <div className='bg-white border-2 border-black rounded-[20px] p-5 mb-4'>
              <h3 className='font-black text-[14px]'>Admin Login Only</h3>
              <p className='text-[11px] text-zinc-500 mt-1'>Only admin can post articles. Users can only read.</p>
              <input type='password' value={adminPass} onChange={function(e){ setAdminPass(e.target.value); }} placeholder='Enter admin password' className='w-full mt-3 border-2 border-zinc-200 rounded-xl px-4 py-3 text-[13px] outline-none' />
              <button onClick={adminLogin} className='mt-2 w-full h-11 bg-black text-white rounded-full font-bold text-[13px]'>Login as Admin</button>
              <p className='text-[10px] text-zinc-400 mt-2 text-center'>Demo password: admin123</p>
            </div>
          )}

          {isAdmin && (
            <div className='bg-yellow-50 border-2 border-yellow-400 rounded-[20px] p-5 mb-4'>
              <h3 className='font-black text-[14px]'>Post New Article - Admin Only</h3>
              <input value={newTitle} onChange={function(e){ setNewTitle(e.target.value); }} placeholder='Article title' className='w-full mt-3 border rounded-xl px-4 py-3 text-[13px] outline-none' />
              <textarea value={newContent} onChange={function(e){ setNewContent(e.target.value); }} placeholder='Full article content - 4-5 lines' className='w-full mt-2 border rounded-xl px-4 py-3 text-[13px] h-[100px] outline-none'></textarea>
              <button onClick={function(){
                if(!newTitle||!newContent){ alert('Fill both'); return; }
                var p = { id: Date.now(), date: new Date().toISOString().slice(0,10), title: newTitle, content: newContent };
                var u = [p].concat(posts);
                setPosts(u); localStorage.setItem('admin-posts', JSON.stringify(u));
                setNewTitle(''); setNewContent(''); alert('Posted!');
              }} className='mt-2 w-full h-11 bg-black text-white rounded-full font-bold'>Publish Article</button>
            </div>
          )}

          <div className='space-y-3'>
            {posts.map(function(p){
              return <div key={p.id} className='bg-white border rounded-[20px] p-5'>
                <div className='text-[10px] font-bold text-zinc-400'>{p.date}</div>
                <h3 className='font-black text-[15px] mt-1 leading-tight'>{p.title}</h3>
                {selectedPost===p.id? <p className='text-[13px] text-zinc-600 mt-2 leading-6'>{p.content}</p> : <p className='text-[13px] text-zinc-600 mt-2 leading-6 line-clamp-2'>{p.content.substring(0,120)}...</p>}
                <button onClick={function(){ setSelectedPost(selectedPost===p.id?null:p.id); }} className='mt-2 text-[12px] font-black text-blue-600'>{selectedPost===p.id?'Show Less':'Read Full Article →'}</button>
                {isAdmin && <button onClick={function(){ var u=posts.filter(function(x){return x.id!==p.id;}); setPosts(u); localStorage.setItem('admin-posts', JSON.stringify(u)); }} className='ml-3 text-[11px] font-bold text-red-600'>Delete</button>}
              </div>;
            })}
          </div>
          <p className='text-[11px] text-zinc-400 mt-3 text-center'>Users can only read articles. Posting is admin-only.</p>
        </div>

        <div className='mt-6 bg-white rounded-[24px] border p-5'>
          <h3 className='font-black text-[18px]'>Frequently Asked Questions</h3>
          <div className='mt-4 space-y-2'>
            {REAL_FAQS.map(function(f,i){ return <div key={i} className='border rounded-xl overflow-hidden'><button onClick={function(){ setFaqOpen(faqOpen===i?null:i); }} className='w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px] leading-tight'>{f.q}<span className='ml-2 shrink-0'>{faqOpen===i?'−':'+'}</span></button>{faqOpen===i && <div className='px-4 py-4 text-[13px] bg-white leading-7 text-zinc-600'>{f.a}</div>}</div>; })}
          </div>
        </div>
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
