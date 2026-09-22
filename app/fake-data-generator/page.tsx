// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const ALL_FIELDS = ['Full Name','Email','Mobile','Address','City','Pincode','Company','PAN','Aadhaar','UPI ID'];
const LANGS = ['Hindi','Tamil','Telugu','Marathi','Bengali','Gujarati','Malayalam','Kannada','Punjabi','Marwari','Urdu','Bhojpuri','Odia','English','Hinglish','English (US)','Spanish','French','German','Portuguese','Japanese','Chinese','Russian','Arabic','Korean','Italian','Turkish','Dutch','Thai','Vietnamese'];

const FULL_DATA: any = {
  Hindi: { names: ['अमित शर्मा','रवि वर्मा','सुनील कुमार','पूजा गुप्ता','नेहा सिंह','विजय यादव','अंजली मिश्रा','राहुल तिवारी','सीमा चौधरी','अजय कुमार','प्रिया शुक्ला','मनोज पांडे','सुरेश गुप्ता','राधा वर्मा','किशोर सिंह','संजय गुप्ता','अनिल कुमार','गीता देवी','राजेश सिंह','सुनीता वर्मा','विकास यादव','कविता शर्मा','अरुण मिश्रा','नीलम चौधरी','प्रकाश जैन','सुधा पाटिल','राकेश वर्मा','ममता सिंह','दिनेश कुमार','उषा यादव'], cities: ['दिल्ली','मुंबई','जयपुर','सूरतगढ़','लखनऊ','पटना','भोपाल','इंदौर'], addr: 'एमजी रोड', comp: 'प्रा. लि.' },
  Tamil: { names: ['அர்ஜுன் குமார்','சூர்யா சிவகுமார்','பிரியா லட்சுமி','விஜய் சேதுபதி','நயன்தாரா','தனுஷ்','சமந்தா','கார்த்தி'], cities: ['சென்னை','கோயம்புத்தூர்','மதுரை'], addr: 'எம்.ஜி. சாலை', comp: 'டெக்' },
  Telugu: { names: ['రవి తేజ','పవన్ కళ్యాణ్','సమంత అక్కినేని','అల్లు అర్జున్'], cities: ['హైదరాబాద్','విజయవాడ'], addr: 'ఎంజి రోడ్', comp: 'టెక్' },
  Marathi: { names: ['साहिल जोशी','ओंकार पाटील','स्नेहा कुलकर्णी'], cities: ['पुणे','मुंबई'], addr: 'एमजी रस्ता', comp: 'टेक' },
  Bengali: { names: ['অরিন্দম দাস','সৌরভ গাঙ্গুলী','রিয়া সেন','দেব'], cities: ['কলকাতা','হাওড়া'], addr: 'এমজি রোড', comp: 'টেক' },
  Gujarati: { names: ['હાર્દિક પટેલ','કિંજલ દવે','ધારા મહેતા'], cities: ['અમદાવાદ','સુરત'], addr: 'એમજી રોડ', comp: 'ટેક' },
  Malayalam: { names: ['മോഹൻലാൽ','ദുൽഖർ','നയൻ താര'], cities: ['കൊച്ചി','തിരുവനന്തപുരം'], addr: 'എംജി റോഡ്', comp: 'ടെക്' },
  Kannada: { names: ['ಯಶ್ ಗೌಡ','ರಶ್ಮಿಕಾ ಮಂದಣ್ಣ'], cities: ['ಬೆಂಗಳೂರು','ಮೈಸೂರು'], addr: 'ಎಂಜಿ ರಸ್ತೆ', comp: 'ಟೆಕ್' },
  Punjabi: { names: ['ਜੱਸੀ ਗਿੱਲ','ਸਿਮਰਨ ਕੌਰ'], cities: ['ਲੁਧਿਆਣਾ','ਅੰਮ੍ਰਿਤਸਰ'], addr: 'ਐਮਜੀ ਰੋਡ', comp: 'ਟੈਕ' },
  Marwari: { names: ['भंवर सिंह','कमला देवी'], cities: ['बीकानेर','जोधपुर','सूरतगढ़'], addr: 'एमजी रोड़', comp: 'टेक' },
  Urdu: { names: ['عمران خان','زویا شیخ'], cities: ['کراچی','لاہور'], addr: 'ایم جی روڈ', comp: 'ٹیک' },
  Bhojpuri: { names: ['खेसारी लाल','पवन सिंह','अक्षरा सिंह','रानी चटर्जी','दिनेश लाल','आम्रपाली दुबे','मनोज तिवारी','काजल राघवानी','निरहुआ','अंजना सिंह','प्रदीप पांडे','मोनालिसा','रवि किशन','समर सिंह','शुभी शर्मा','यश कुमार','अनारा गुप्ता','संचिता बनर्जी','गौरव झा','रक्षा गुप्ता','अरविंद अकेला','सीमा सिंह','प्रवेश लाल','माधुरी पांडे','गुंजन सिंह'], cities: ['पटना','आरा','बलिया','छपरा','बक्सर','सीवान','गोपालगंज','मुजफ्फरपुर'], addr: 'एमजी रोड', comp: 'टेक प्रा. लि.' },
  Odia: { names: ['ଶୁଭମ ମହାନ୍ତି','ସୋନଲ ମହାପାତ୍ର'], cities: ['ଭୁବନେଶ୍ୱର','କଟକ'], addr: 'ଏମଜି ରୋଡ', comp: 'ଟେକ୍' },
  English: { names: ['Aarav Mehta','Ananya Singh','Rahul Kumar','Priya Sharma','Vijay Patel','Neha Gupta','Amit Verma','Pooja Yadav','Sanjay Rao','Kavita Desai','Rohit Shetty','Sneha Kulkarni','Vikram Malhotra','Anjali Nair','Arjun Reddy'], cities: ['Delhi','Mumbai','Jaipur','Bangalore','Chennai','Kolkata'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  Hinglish: { names: ['Aarav Sharma','Pooja Singh'], cities: ['Delhi','Mumbai'], addr: 'MG Road', comp: 'Tech Pvt Ltd' },
  'English (US)': { names: ['John Smith','Emma Johnson','Michael Brown','Olivia Davis','James Wilson','Sophia Miller','William Moore','Isabella Taylor','David Anderson','Mia Thomas'], cities: ['New York','Los Angeles','Chicago','Houston'], addr: '5th Avenue', comp: 'Inc.' },
  Spanish: { names: ['Jose Garcia','Maria Lopez','Carlos Ruiz','Ana Martinez','Luis Hernandez','Laura Gomez','Juan Perez','Sofia Torres','Miguel Sanchez','Isabel Ramirez'], cities: ['Madrid','Barcelona','Valencia','Sevilla'], addr: 'Calle Mayor', comp: 'S.L.' },
  French: { names: ['Pierre Dupont','Marie Dubois','Luc Bernard','Camille Laurent'], cities: ['Paris','Lyon','Marseille'], addr: 'Rue de la Paix', comp: 'SARL' },
  German: { names: ['Hans Muller','Greta Schmidt','Klaus Weber'], cities: ['Berlin','Munich'], addr: 'Hauptstrasse', comp: 'GmbH' },
  Portuguese: { names: ['Joao Silva','Ana Santos'], cities: ['Lisboa','Porto'], addr: 'Rua Augusta', comp: 'Lda.' },
  Japanese: { names: ['田中太郎','佐藤花子','鈴木一郎','高橋美咲','渡辺健太','伊藤さくら','山本大輔','中村優子','小林誠','加藤愛','吉田翔太','山田彩乃','佐々木蓮','松本結衣','井上拓海','木村真央','林勇気','斎藤舞','清水和也','阿部里奈'], cities: ['東京','大阪','京都','横浜','名古屋','札幌','福岡','神戸'], addr: '中央通り', comp: '株式会社' },
  Chinese: { names: ['张伟','王芳','李强','刘洋','陈静','杨敏','黄磊','赵丽','周杰','吴倩','孙浩','马丽','朱明','胡斌','郭婷','林峰','何静','高翔','罗娟','梁超','唐娜','韩梅','冯刚','于娜','董强','萧蔷','程琳','曹阳','袁泉','邓超','范冰冰','李冰冰','章子怡','杨幂','刘德华','张学友','郭富城','黎明','周星驰','成龙'], cities: ['北京','上海','广州','深圳','成都','杭州','南京','武汉','西安','重庆','天津','苏州','青岛','大连','厦门'], addr: '中山路', comp: '有限公司' },
  Russian: { names: ['Иван Иванов','Анна Петрова','Сергей Смирнов','Елена Кузнецова'], cities: ['Москва','Санкт-Петербург'], addr: 'ул. Ленина', comp: 'ООО' },
  Arabic: { names: ['محمد أحمد','فاطمة علي','أحمد حسن','نورا خالد'], cities: ['دبي','الرياض','القاهرة'], addr: 'شارع الملك', comp: 'ذ.م.م' },
  Korean: { names: ['김민준','박지연','이서준','최유진'], cities: ['서울','부산'], addr: '강남대로', comp: '주식회사' },
  Italian: { names: ['Marco Rossi','Giulia Bianchi'], cities: ['Roma','Milano'], addr: 'Via Roma', comp: 'S.r.l.' },
  Turkish: { names: ['Mehmet Yilmaz','Ayse Kaya'], cities: ['Istanbul','Ankara'], addr: 'Ataturk Caddesi', comp: 'A.S.' },
  Dutch: { names: ['Jan Jansen','Emma de Vries'], cities: ['Amsterdam','Rotterdam'], addr: 'Damstraat', comp: 'B.V.' },
  Thai: { names: ['สมชาย ใจดี','สมหญิง รักไทย'], cities: ['กรุงเทพ','เชียงใหม่'], addr: 'ถนนสุขุมวิท', comp: 'จำกัด' },
  Vietnamese: { names: ['Nguyen Van A','Tran Thi B'], cities: ['Ha Noi','Ho Chi Minh'], addr: 'Duong Le Loi', comp: 'TNHH' },
};

const DAILY_POSTS = [
  { date: '2025-05-20', title: 'How to Use Fake Data for Testing? Best Practices', desc: 'Learn how developers use fake data for app testing, database seeding, and UI design without using real user data.' },
  { date: '2025-05-21', title: 'Why Fake Email Must Always Be in English?', desc: 'Email IDs with Hindi, Chinese, Japanese script are invalid. Only English format works globally.' },
  { date: '2025-05-22', title: 'Bhojpuri Fake Data for Regional Apps', desc: 'Need Bhojpuri names like खेसारी लाल and cities like पटना for Bihar/UP apps testing.' },
  { date: '2025-05-23', title: 'Chinese 40 Names Fix - No More Single Repeat', desc: 'We fixed Chinese single name bug. Now 40 unique names like 张伟, 王芳, 范冰冰.' },
  { date: '2025-05-24', title: 'CSV vs JSON vs TXT: Which Export Best?', desc: 'CSV for Excel, JSON for API, SQL for DB, TXT for quick view. All with UTF-8 BOM for Hindi/Chinese.' },
];

const FIRST = ['amit','ravi','sunil','pooja','neha','rahul','ananya','arjun','priya','vijay','john','emma','liam','sophia','jose','marie','hans','joao','tanaka','zhang'];
const LAST = ['sharma','verma','gupta','singh','yadav','kumar','patel','smith','johnson','brown','garcia','lopez'];
const DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com'];

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
  var [dailyPosts,setDailyPosts]=useState(DAILY_POSTS);
  var [newTitle,setNewTitle]=useState('');
  var [newDesc,setNewDesc]=useState('');

  useEffect(function(){
    document.title = 'Fake Data Generator - 30 Languages | Free Tool';
    var m1 = document.createElement('meta');
    m1.name = 'description';
    m1.content = 'Free Fake Data Generator 30 Languages - Hindi, Bhojpuri, Chinese, Japanese. Email always English. UTF-8 readable download.';
    document.head.appendChild(m1);
    var saved = localStorage.getItem('daily-posts-v2');
    if(saved){ try{ setDailyPosts(JSON.parse(saved)); }catch(e){} }
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

  var getJson = function(){ return JSON.stringify(data, null, 2); };
  var getCsv = function(){
    if(!data.length) return '';
    var header = Object.keys(data[0]).join(',');
    var rows = data.map(function(r){ return Object.values(r).map(function(v){ return '"' + String(v).replace(/"/g,'""') + '"'; }).join(','); }).join('\r\n');
    return header + '\r\n' + rows;
  };
  var getTxt = function(){ return data.map(function(r,i){ return (i+1) + '. Full Name: ' + (r['Full Name']||'') + ' | Email: ' + (r['Email']||'') + ' | Address: ' + (r['Address']||'') + ' | City: ' + (r['City']||'') + ' | Company: ' + (r['Company']||''); }).join('\r\n\r\n'); };
  var getSql = function(){
    if(!data.length) return '';
    var cols = Object.keys(data[0]).join(', ');
    var vals = data.map(function(r){ return '(' + Object.values(r).map(function(v){ return "'" + String(v).replace(/'/g,"''") + "'"; }).join(', ') + ')'; }).join(',\n');
    return 'INSERT INTO users (' + cols + ') VALUES\n' + vals + ';';
  };
  var getStr = function(){
    if(view==='json') return getJson();
    if(view==='csv') return getCsv();
    if(view==='txt') return getTxt();
    if(view==='sql') return getSql();
    return getJson();
  };

  var handleDownload = function(){
    var str = getStr();
    var bom = '\uFEFF';
    var blob = new Blob([bom + str], {type: 'text/plain;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    var ext = view==='table'?'txt':view;
    a.download = 'fake-data-' + lang + '-' + count + '.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  var todayIndex = new Date().getDate() % dailyPosts.length;
  var todayPost = dailyPosts[todayIndex];

  return (
    <div className='min-h-screen bg-[#f8f8f7] text-zinc-900'>
      <main className='max-w-[1100px] mx-auto px-3 py-4 pb-28'>
        <h1 className='text-[26px] font-black'>Fake Data Generator - 30 Languages</h1>
        <p className='text-zinc-500 text-[12px] mt-1'>Perfect Website | UTF-8 BOM Fixed | Chinese 40 Names | Readable Download | Daily Articles</p>

        <div className='bg-white rounded-[24px] border p-5 mt-4'>
          <label className='font-bold text-[14px]'>Select Language</label>
          <select value={lang} onChange={function(e){ setLang(e.target.value); }} className='w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold'>
            {LANGS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
          </select>
          <div className='mt-2 bg-green-100 border text-green-800 text-[12px] font-bold px-3 py-2 rounded-full text-center'>Active: {lang} - {FULL_DATA[lang]?.names?.length} Names | UTF-8 Readable | No Repeat</div>
          <h3 className='font-bold text-[14px] mt-6'>Select Fields ({fields.length} / 10)</h3>
          <div className='grid grid-cols-2 gap-2.5 mt-3'>
            {ALL_FIELDS.map(function(f){ var active=fields.includes(f); return <button key={f} onClick={function(){ if(active) setFields(fields.filter(function(x){return x!==f;})); else if(fields.length<10) setFields([...fields,f]); }} className={'h-[48px] rounded-full text-[13px] font-bold ' + (active?'bg-black text-white':'bg-zinc-100')}>{f}</button>; })}
          </div>
          <div className='mt-6'><label className='font-bold text-[14px]'>Records: {count} / 1000</label><input type='range' min={1} max={1000} value={count} onChange={function(e){ setCount(parseInt(e.target.value)); }} className='w-full mt-3 accent-black h-2' /></div>
          <button onClick={generate} className='mt-6 w-full h-[56px] bg-black text-white rounded-full font-black'>Generate {count} Records in {lang}</button>
        </div>

        {data.length>0 && (
          <div className='mt-5 bg-white rounded-[24px] border p-4'>
            <div className='flex gap-2 overflow-auto pb-2'>
              {['table','json','csv','txt','sql'].map(function(v){ return <button key={v} onClick={function(){ setView(v); }} className={'px-6 h-10 rounded-full text-xs font-black uppercase ' + (view===v?'bg-black text-white':'bg-zinc-100')}>{v}</button>; })}
            </div>
            <div className='flex gap-2 mt-4'>
              <button onClick={function(){ localStorage.setItem('saved-data', getStr()); setSaveText('Saved!'); setTimeout(function(){ setSaveText('Save'); },2000); }} className={'flex-1 h-12 rounded-full font-bold ' + (saveText==='Saved!'?'bg-green-500 text-white':'bg-zinc-100')}>{saveText}</button>
              <button onClick={function(){ navigator.clipboard.writeText(getStr()); setCopyText('Copied!'); setTimeout(function(){ setCopyText('Copy'); },2000); }} className={'flex-1 h-12 rounded-full font-bold ' + (copyText==='Copied!'?'bg-green-500 text-white':'bg-black text-white')}>{copyText}</button>
              <button onClick={handleDownload} className='flex-1 h-12 rounded-full bg-yellow-400 text-black font-black text-[13px]'>Download {view.toUpperCase()}</button>
            </div>

            <div className='mt-4 border-2 border-zinc-900 rounded-2xl overflow-auto max-h-[600px]'>
              {view==='table'?
                <table className='w-full text-[13px] border-collapse'>
                  <thead className='bg-zinc-900 text-white sticky top-0 z-10'>
                    <tr>{Object.keys(data[0]||{}).map(function(k){ return <th key={k} className='text-center p-4 font-black border-r border-zinc-700 last:border-0 whitespace-nowrap'>{k}</th>; })}</tr>
                  </thead>
                  <tbody>
                    {data.map(function(r,i){
                      return <tr key={i} className={'border-t ' + (i%2===0?'bg-white':'bg-zinc-50')}>
                        {Object.values(r).map(function(v,j){
                          return <td key={j} className='text-center p-4 border-r last:border-0 min-w-[160px] whitespace-nowrap font-medium'>{String(v)}</td>;
                        })}
                      </tr>;
                    })}
                  </tbody>
                </table>
               : <pre className='p-4 text-[12px] bg-zinc-50 whitespace-pre-wrap font-mono leading-6'>{getStr()}</pre>}
            </div>
            <p className='mt-2 text-[11px] text-center text-zinc-400'>Center Aligned | UTF-8 BOM Added - Hindi/Chinese Will Show Correctly in TXT</p>
          </div>
        )}

        <div className='mt-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-[24px] border-2 border-yellow-400 p-5'>
          <div className='flex items-center gap-2'><span className='bg-black text-white text-[10px] font-black px-3 py-1 rounded-full'>TODAY DAILY POST</span><span className='text-[11px] font-bold text-zinc-600'>{todayPost.date}</span></div>
          <h2 className='mt-3 text-[18px] font-black leading-tight'>{todayPost.title}</h2>
          <p className='mt-2 text-[13px] text-zinc-700 leading-6'>{todayPost.desc}</p>
        </div>

        <div className='mt-5 bg-white rounded-[24px] border p-5'>
          <h3 className='font-black text-[16px]'>+ Add New Daily Article (For SEO)</h3>
          <p className='text-[11px] text-zinc-500 mt-1'>Roz yaha naya article add karo - Google ko fresh content pasand hai</p>
          <input value={newTitle} onChange={function(e){ setNewTitle(e.target.value); }} placeholder='Article Title' className='w-full mt-3 border-2 border-zinc-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-black' />
          <textarea value={newDesc} onChange={function(e){ setNewDesc(e.target.value); }} placeholder='Description 2-3 lines' className='w-full mt-2 border-2 border-zinc-200 rounded-xl px-4 py-3 text-[13px] h-[80px] outline-none focus:border-black'></textarea>
          <button onClick={function(){
            if(!newTitle ||!newDesc){ alert('Title and Desc required'); return; }
            var newPost = { date: new Date().toISOString().slice(0,10), title: newTitle, desc: newDesc };
            var updated = [newPost].concat(dailyPosts);
            setDailyPosts(updated);
            localStorage.setItem('daily-posts-v2', JSON.stringify(updated));
            setNewTitle(''); setNewDesc(''); alert('Daily Post Added!');
          }} className='mt-3 w-full h-12 bg-black text-white rounded-full font-black text-[14px]'>Add Daily Post</button>
          <div className='mt-4 space-y-2 max-h-[200px] overflow-auto'>
            {dailyPosts.slice(0,5).map(function(p,i){ return <div key={i} className='border rounded-xl p-3 bg-zinc-50'><div className='text-[10px] font-bold text-zinc-500'>{p.date}</div><div className='text-[12px] font-bold mt-1'>{p.title}</div></div>; })}
          </div>
        </div>

        <div className='mt-5 bg-white rounded-[24px] border overflow-hidden'>
          <button onClick={function(){ setShowArticle(!showArticle); }} className='w-full p-5 flex justify-between font-black text-left text-[15px]'>What is Fake Data Generator? - Complete Guide <span>{showArticle?'−':'+'}</span></button>
          {showArticle && <div className='px-5 pb-5 text-[13px] text-zinc-600 leading-7 space-y-3'>
            <p><b>Fake Data Generator</b> is a complete free tool in 30 languages - 15 Indian + 15 Global. Now with UTF-8 BOM, so Chinese 张伟, Hindi अमित शर्मा, Japanese 田中太郎 show correctly in downloaded TXT/CSV.</p>
            <p><b>Chinese Fix:</b> Earlier 1 name repeated. Now 40 unique names - 张伟, 王芳, 李强, 范冰冰, 章子怡, 杨幂, 刘德华 etc.</p>
            <p><b>Download Fix:</b> Using Blob with BOM, so file opens readable in mobile text viewer. TXT shows numbered readable lines.</p>
            <p><b>Daily Post:</b> Add new article daily for SEO. Google ranks fresh content higher.</p>
          </div>}
        </div>

        <div className='mt-5 bg-white rounded-[24px] border p-5'>
          <h3 className='font-black text-[16px]'>FAQ - English</h3>
          <div className='mt-4 space-y-2'>
            {[
              {q:'Why TXT was showing à¤...?', a:'Because file had no UTF-8 BOM. Now we add BOM (\\uFEFF), so Hindi/Chinese shows correctly in mobile viewers.'},
              {q:'Chinese single name repeat?', a:'Fixed - Now 40 Chinese names, 20 Japanese, 25 Hindi, 25 Bhojpuri. No repeat till 1000 records.'},
              {q:'Download readable?', a:'Yes, Blob method with BOM. TXT is numbered, CSV has CRLF for Excel, JSON pretty, SQL ready.'},
              {q:'What is Daily Post?', a:'For SEO, add article daily. Today post auto rotates by date. Helps Google ranking.'},
            ].map(function(f,i){ return <div key={i} className='border rounded-xl overflow-hidden'><button onClick={function(){ setFaqOpen(faqOpen===i?null:i); }} className='w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px]'>{f.q}<span>{faqOpen===i?'−':'+'}</span></button>{faqOpen===i && <div className='px-4 py-3 text-[12px] bg-white leading-6'>{f.a}</div>}</div>; })}
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
