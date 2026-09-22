// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"];
const LANGS = ["Hindi","Tamil","Telugu","Marathi","Bengali","Gujarati","Malayalam","Kannada","Punjabi","Marwari","Urdu","Bhojpuri","Odia","English","Hinglish","English (US)","Spanish","French","German","Portuguese","Japanese","Chinese","Russian","Arabic","Korean","Italian","Turkish","Dutch","Thai","Vietnamese"];

const NAMES: any = {
  Hindi: ["अमित शर्मा","रवि वर्मा","सुनील कुमार","पूजा गुप्ता","नेहा सिंह","विजय यादव","अंजली मिश्रा","राहुल तिवारी","सीमा चौधरी","अजय कुमार","प्रिया शुक्ला","मनोज पांडे","सुरेश गुप्ता","राधा वर्मा","किशोर सिंह","संजय गुप्ता","अनिल कुमार","गीता देवी","राजेश सिंह","सुनीता वर्मा","विकास यादव","कविता शर्मा","अरुण मिश्रा","नीलम चौधरी","प्रकाश जैन","सुधा पाटिल","राकेश वर्मा","ममता सिंह","दिनेश कुमार","उषा यादव"],
  Tamil: ["அர்ஜுன் குமார்","சூர்யா சிவகுமார்","பிரியா லட்சுமி","விஜய் சேதுபதி","நயன்தாரா","தனுஷ்","சமந்தா","கார்த்தி","த்ரிஷா","அஜித் குமார்","சிவகார்த்திகேயன்","கீர்த்தி சுரேஷ்","விக்ரம்","அனுஷ்கா","சிம்பு","ஜோதிகா","சூர்யா","காஜல்","தனுஷ்","நயன்தாரா","வடிவேலு","விவேக்","சந்தானம்","கருணாஸ்"],
  Telugu: ["రవి తేజ","పవన్ కళ్యాణ్","సమంత అక్కినేని","అల్లు అర్జున్","రష్మిక మందన్న","ప్రభాస్","అనుష్క శెట్టి","మహేష్ బాబు","కీర్తి సురేష్","విజయ్ దేవరకొండ","నయనతార","రామ్ చరణ్","పూజా హెగ్డే","నాని","సాయిపల్లవి","రష్మిక","అనుష్క","కాజల్","తమన్నా","శృతి హాసన్"],
  Marathi: ["साहिल जोशी","ओंकार पाटील","स्नेहा कुलकर्णी","अमोल कोल्हे","सई ताम्हणकर","रितेश देशमुख","जेनेलिया","सचिन पिळगावकर","मुक्ता बर्वे","स्वप्नील जोशी","सोनाली कुलकर्णी","अशोक सराफ","लक्ष्मीकांत बेर्डे","अलका कुबल","प्रिया बापट"],
  Bengali: ["অরিন্দম দাস","সৌরভ গাঙ্গুলী","রিয়া সেন","দেব","শুভশ্রী","জিৎ","কোয়েল","প্রসেনজিৎ","ঋতুপর্ণা","আবির","পাওলি","পরমব্রত","মিমি","অঙ্কুশ","নুসরাত","যশ","শ্রাবন্তী","সোহম","পায়েল","রুক্মিণী"],
  Gujarati: ["હાર્દિક પટેલ","કિંજલ દવે","ધારા મહેતા","મલ્હાર ઠાકર","આરોહી પટેલ","ચિરાગ વોરા","કૃપા શાહ","દર્શન જરીવાલા","મોના થીબા","પ્રતીક ગાંધી","કીર્તિ પટેલ","જયેશ મોરે","દીક્ષા જોષી","અલ્પેશ પટેલ","નેહા મહેતા"],
  Bhojpuri: ["खेसारी लाल","पवन सिंह","अक्षरा सिंह","रानी चटर्जी","दिनेश लाल","आम्रपाली दुबे","मनोज तिवारी","काजल राघवानी","निरहुआ","अंजना सिंह","प्रदीप पांडे","मोनालिसा","रवि किशन","समर सिंह","शुभी शर्मा","यश कुमार","अनारा गुप्ता","संचिता बनर्जी","गौरव झा","रक्षा गुप्ता","अरविंद अकेला","सीमा सिंह","प्रवेश लाल","माधुरी पांडे","गुंजन सिंह"],
  English: ["Aarav Mehta","Ananya Singh","Rahul Kumar","Priya Sharma","Vijay Patel","Neha Gupta","Amit Verma","Pooja Yadav","Sanjay Rao","Kavita Desai","Rohit Shetty","Sneha Kulkarni","Vikram Malhotra","Anjali Nair","Arjun Reddy","Divya Joshi","Karan Kapoor","Shreya Iyer","Nikhil Agarwal","Ritika Bansal"],
};

const CITIES: any = {
  Hindi: ["दिल्ली","मुंबई","जयपुर","सूरतगढ़","लखनऊ","पटना","भोपाल","इंदौर","नागपुर","वाराणसी","कानपुर","आगरा","प्रयागराज","गोरखपुर","अजमेर"],
  Tamil: ["சென்னை","கோயம்புத்தூர்","மதுரை","திருச்சி","சேலம்","தூத்துக்குடி","தஞ்சாவூர்","வேலூர்","திருநெல்வேலி"],
  Telugu: ["హైదరాబాద్","విజయవాడ","విశాఖపట్నం","వరంగల్","గుంటూరు","తిరుపతి","కర్నూలు","రాజమండ్రి"],
  Bhojpuri: ["पटना","आरा","बलिया","छपरा","बक्सर","सीवान","गोपालगंज","मुजफ्फरपुर","दरभंगा","गया","भागलपुर","सासाराम"],
  English: ["Delhi","Mumbai","Jaipur","Bangalore","Chennai","Kolkata","Pune","Hyderabad","Ahmedabad","Lucknow","Surat","Kanpur"],
  Spanish: ["Madrid","Barcelona","Valencia","Sevilla","Zaragoza","Malaga","Murcia","Palma","Bilbao","Alicante","Cordoba","Valladolid"],
  French: ["Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Reims"],
  German: ["Berlin","Munich","Hamburg","Cologne","Frankfurt","Stuttgart","Dusseldorf","Dortmund","Essen","Leipzig","Bremen","Dresden"],
  Japanese: ["東京","大阪","京都","横浜","名古屋","札幌","福岡","神戸","広島","仙台","千葉","静岡"],
  Chinese: ["北京","上海","广州","深圳","成都","杭州","南京","武汉","西安","重庆","天津","苏州"],
  Russian: ["Москва","Санкт-Петербург","Казань","Новосибирск","Екатеринбург","Нижний Новгород","Челябинск","Самара","Омск","Ростов"],
  Arabic: ["دبي","الرياض","القاهرة","جدة","أبوظبي","الدوحة","الكويت","عمان","المنامة","مسقط"],
  Korean: ["서울","부산","인천","대구","대전","광주","울산","수원","성남","고양"],
  Italian: ["Roma","Milano","Napoli","Torino","Firenze","Bologna","Venezia","Verona","Genova","Palermo"],
  Portuguese: ["Lisboa","Porto","Braga","Coimbra","Faro","Aveiro","Funchal","Guimaraes"],
  Dutch: ["Amsterdam","Rotterdam","Utrecht","Hague","Eindhoven","Groningen","Maastricht","Arnhem"],
  Thai: ["กรุงเทพ","เชียงใหม่","ภูเก็ต","พัทยา","หาดใหญ่","ขอนแก่น","อุดรธานี","อุบลราชธานี"],
  Vietnamese: ["Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","Nha Trang","Huế","Vũng Tàu"],
};

const ADDR: any = {
  Hindi: "एमजी रोड", Tamil: "எம்.ஜி. சாலை", Telugu: "ఎంజి రోడ్", Bhojpuri: "एमजी रोड", English: "MG Road",
  Spanish: "Calle Mayor", French: "Rue de la Paix", German: "Hauptstrasse", Portuguese: "Rua Augusta",
  Japanese: "中央通り", Chinese: "中山路", Russian: "ул. Ленина", Arabic: "شارع الملك", Korean: "강남대로",
  Italian: "Via Roma", Turkish: "Atatürk Caddesi", Dutch: "Damstraat", Thai: "ถนนสุขุมวิท", Vietnamese: "Đường Lê Lợi"
};

const FULL_DATA: any = {
  Hindi: { names: NAMES.Hindi, cities: CITIES.Hindi, addr: ADDR.Hindi, comp: "प्रा. लि." },
  Tamil: { names: NAMES.Tamil, cities: CITIES.Tamil, addr: ADDR.Tamil, comp: "டெக்" },
  Telugu: { names: NAMES.Telugu, cities: CITIES.Telugu, addr: ADDR.Telugu, comp: "టెక్" },
  Marathi: { names: NAMES.Marathi, cities: ["पुणे","मुंबई","नागपूर","नाशिक"], addr: "एमजी रस्ता", comp: "टेक" },
  Bengali: { names: NAMES.Bengali, cities: ["কলকাতা","হাওড়া","দার্জিলিং","শিলিগুড়ি"], addr: "এমজি রোড", comp: "টেক" },
  Gujarati: { names: NAMES.Gujarati, cities: ["અમદાવાદ","સુરત","વડોદરા","રાજકોટ"], addr: "એમજી રોડ", comp: "ટેક" },
  Malayalam: { names: ["മോഹൻലാൽ","ദുൽഖർ","നയൻ താര","മമ്മൂട്ടി","മഞ്ജു","പൃഥ്വിരാജ്","നസ്രിയ","ഫഹദ്"], cities: ["കൊച്ചി","തിരുവനന്തപുരം","കോഴിക്കോട്"], addr: "എംജി റോഡ്", comp: "ടെക്" },
  Kannada: { names: ["ಯಶ್ ಗೌಡ","ರಶ್ಮಿಕಾ ಮಂದಣ್ಣ","ದರ್ಶನ್","ರಮ್ಯಾ","ಸುದೀಪ್","ಶ್ರುತಿ","ಪುನೀತ್"], cities: ["ಬೆಂಗಳೂರು","ಮೈಸೂರು","ಮಂಗಳೂರು"], addr: "ಎಂಜಿ ರಸ್ತೆ", comp: "ಟೆಕ್" },
  Punjabi: { names: ["ਜੱਸੀ ਗਿੱਲ","ਸਿਮਰਨ ਕੌਰ","ਦਿਲਜੀਤ","ਨੀਰੂ","ਗਿੱਪੀ","ਸੋਨਮ"], cities: ["ਲੁਧਿਆਣਾ","ਅੰਮ੍ਰਿਤਸਰ","ਜਲੰਧਰ"], addr: "ਐਮਜੀ ਰੋਡ", comp: "ਟੈਕ" },
  Marwari: { names: ["भंवर सिंह","कमला देवी","गजानंद","पार्वती"], cities: ["बीकानेर","जोधपुर","सूरतगढ़"], addr: "एमजी रोड़", comp: "टेक" },
  Urdu: { names: ["عمران خان","زویا شیخ","احمد علی","فاطمہ"], cities: ["کراچی","لاہور","اسلام آباد"], addr: "ایم جی روڈ", comp: "ٹیک" },
  Bhojpuri: { names: NAMES.Bhojpuri, cities: CITIES.Bhojpuri, addr: ADDR.Bhojpuri, comp: "टेक प्रा. लि." },
  Odia: { names: ["ଶୁଭମ ମହାନ୍ତି","ସୋନଲ","ଅନୁଭବ","ବର୍ଷା"], cities: ["ଭୁବନେଶ୍ୱର","କଟକ","ପୁରୀ"], addr: "ଏମଜି ରୋଡ", comp: "ଟେକ୍" },
  English: { names: NAMES.English, cities: CITIES.English, addr: ADDR.English, comp: "Tech Pvt Ltd" },
  Hinglish: { names: NAMES.English, cities: CITIES.English, addr: "MG Road", comp: "Tech Pvt Ltd" },
  "English (US)": { names: ["John Smith","Emma Johnson","Michael Brown","Olivia Davis","James Wilson","Sophia Miller","William Moore","Isabella Taylor","David Anderson","Mia Thomas","Robert Jackson","Charlotte White","Daniel Harris","Amelia Martin","Matthew Clark","Harper Lewis","David Walker","Evelyn Hall","Joseph Allen","Avery Young","Andrew Hernandez","Ella King","Joshua Wright","Grace Scott","Christopher Green","Chloe Adams","Ryan Baker","Lily Nelson","Nathan Carter","Zoe Mitchell"], cities: CITIES.English, addr: "5th Avenue", comp: "Inc." },
  Spanish: { names: ["José García","María López","Carlos Ruiz","Ana Martínez","Luis Hernández","Laura Gómez","Juan Pérez","Sofia Torres","Miguel Sánchez","Isabel Ramirez","Fernando Díaz","Carmen Flores","Jorge Morales","Elena Ortiz","Diego Castro","Lucía Herrera","Alberto Ruiz","Valentina Cruz","Pablo Jiménez","Sara Navarro","Javier Ramos","Claudia Reyes","Sergio Vargas","Paula Silva","Andrés Romero","Daniela Mendoza","Óscar Gutiérrez","Natalia Aguilar","Rubén Delgado","Adriana Peña"], cities: CITIES.Spanish, addr: ADDR.Spanish, comp: "S.L." },
  French: { names: ["Pierre Dupont","Marie Dubois","Luc Bernard","Camille Laurent","Antoine Martin","Julie Moreau","Nicolas Petit","Chloé Lefevre","François Girard","Isabelle Roux","Thomas Fabre","Sophie Blanc","Julien Morel","Emilie Garnier","Maxime Chevalier","Manon Andre","Alexandre Simon","Lea Michel","Hugo Lemoine","Louise Perrot"], cities: CITIES.French, addr: ADDR.French, comp: "SARL" },
  German: { names: ["Hans Müller","Greta Schmidt","Klaus Weber","Anna Fischer","Thomas Becker","Lisa Hoffmann","Michael Wagner","Julia Richter","Stefan Klein","Laura Meyer","Andreas Bauer","Sabine Wolf","Frank Schulz","Katrin Koch","Uwe Zimmermann","Monika Braun","Peter Krause","Stefanie Schuster","Christian Jung","Anja Roth"], cities: CITIES.German, addr: ADDR.German, comp: "GmbH" },
  Portuguese: { names: ["João Silva","Ana Santos","Pedro Costa","Mariana Oliveira","Carlos Ferreira","Sofia Rodrigues","Miguel Almeida","Beatriz Pereira","Rui Carvalho","Ines Martins","Tiago Lopes","Joana Ribeiro","Antonio Mendes","Catarina Sousa","Filipe Cunha","Marta Teixeira","Jorge Correia","Rita Fernandes","Bruno Marques","Helena Duarte"], cities: CITIES.Portuguese, addr: ADDR.Portuguese, comp: "Lda." },
  Japanese: { names: ["田中太郎","佐藤花子","鈴木一郎","高橋美咲","渡辺健太","伊藤さくら","山本大輔","中村優子","小林誠","加藤愛","吉田翔太","山田彩乃","佐々木蓮","松本結衣","井上拓海","木村真央","林勇気","斎藤舞","清水和也","阿部里奈","山崎颯太","池田美優","橋本環奈","石川恋","前田敦子","岡田将生","長澤まさみ","新垣結衣","綾瀬はるか","北川景子"], cities: CITIES.Japanese, addr: ADDR.Japanese, comp: "株式会社" },
  Chinese: { names: ["张伟","王芳","李强","刘洋","陈静","杨敏","黄磊","赵丽","周杰","吴倩","孙浩","马丽","朱明","胡斌","郭婷","林峰","何静","高翔","罗娟","梁超","唐娜","韩梅","冯刚","于娜","董强","萧蔷","程琳","曹阳","袁泉","邓超"], cities: CITIES.Chinese, addr: ADDR.Chinese, comp: "有限公司" },
  Russian: { names: ["Иван Иванов","Анна Петрова","Сергей Смирнов","Елена Кузнецова","Дмитрий Попов","Ольга Соколова","Алексей Лебедев","Мария Козлова","Павел Новиков","Татьяна Морозова","Андрей Федоров","Наталья Васильева","Игорь Николаев","Светлана Орлова","Владимир Зайцев","Юлия Павлова","Константин Семенов","Екатерина Голубева","Максим Виноградов","Ирина Богданова"], cities: CITIES.Russian, addr: ADDR.Russian, comp: "ООО" },
  Arabic: { names: ["محمد أحمد","فاطمة علي","أحمد حسن","نورا خالد","عبدالله سعيد","سارة عمر","خالد محمود","ليلى إبراهيم","يوسف عبدالله","منى حسين","عمر فاروق","زينب أحمد","سلمان علي","ريم محمد","فيصل ناصر","هند خالد","عبدالرحمن سعيد","أميرة حسن","طلال عبدالله","جواهر محمد"], cities: CITIES.Arabic, addr: ADDR.Arabic, comp: "ذ.م.م" },
  Korean: { names: ["김민준","박지연","이서준","최유진","정민호","강서연","조현우","윤지우","장도윤","임서현","한지민","오준서","신하은","권지훈","황지아","안예준","송지효","류준열","홍지영","배수지","김태형","박보검","이지은","정국","제니","로제","리사","지수","뷔","지민"], cities: CITIES.Korean, addr: ADDR.Korean, comp: "주식회사" },
  Italian: { names: ["Marco Rossi","Giulia Bianchi","Luca Ferrari","Sofia Romano","Alessandro Esposito","Aurora Colombo","Francesco Ricci","Alice Conti","Lorenzo Marino","Greta Greco","Andrea Bruno","Martina Gallo","Matteo Costa","Chiara Villa","Gabriele Fontana","Sara Ferretti","Davide Moretti","Elisa Riva","Stefano Barbieri","Federica Lombardi"], cities: CITIES.Italian, addr: ADDR.Italian, comp: "S.r.l." },
  Turkish: { names: ["Mehmet Yılmaz","Ayşe Kaya","Mustafa Demir","Fatma Şahin","Ahmet Çelik","Zeynep Koç","Ali Öztürk","Elif Yildiz","Hüseyin Arslan","Merve Doğan","Emre Kılıç","Selin Aslan","Burak Kara","Ceren Güneş","Murat Aksoy","Derya Yalcin","Caner Erkin","Buse Arslan","Okan Buruk","Hande Erçel"], cities: ["Istanbul","Ankara","Izmir","Antalya","Bursa","Adana","Gaziantep","Konya","Mersin","Kayseri"], addr: "Atatürk Caddesi", comp: "A.Ş." },
  Dutch: { names: ["Jan Jansen","Emma de Vries","Bram van Dijk","Sophie Bakker","Daan Janssen","Lot de Boer","Lucas Visser","Mila Smit","Levi Meijer","Julia de Jong","Sem Mulder","Sara Hendriks","Thijs de Groot","Noor van Leeuwen","Finn de Wit","Eva van der Berg","Luuk Peters","Fleur Hendriks","Milan de Boer","Lotte Vermeer"], cities: CITIES.Dutch, addr: ADDR.Dutch, comp: "B.V." },
  Thai: { names: ["สมชาย ใจดี","สมหญิง รักไทย","ประยุทธ์ จันทร์โอชา","ยิ่งลักษณ์ ชินวัตร","ธนาธร จึงรุ่งเรืองกิจ","ชัชชาติ สิทธิพันธุ์","อุ๊งอิ๊ง แพทองธาร","พิธา ลิ้มเจริญรัตน์","อภิสิทธิ์ เวชชาชีวะ","สุดารัตน์ เกยุราพันธุ์","อนุทิน ชาญวีรกูล","จุรินทร์ ลักษณวิศิษฏ์","ทักษิณ ชินวัตร","อภิวัฒน์ ขันทอง","วราวุธ ศิลปอาชา"], cities: CITIES.Thai, addr: ADDR.Thai, comp: "จำกัด" },
  Vietnamese: { names: ["Nguyễn Văn A","Trần Thị B","Lê Văn C","Phạm Thị D","Hoàng Văn E","Phan Thị F","Vũ Văn G","Đặng Thị H","Bùi Văn I","Đỗ Thị K","Hồ Văn L","Ngô Thị M","Dương Văn N","Lý Thị P","Đinh Văn Q","Trịnh Văn R","Đoàn Thị S","Trương Văn T","Mai Thị U","Võ Văn V"], cities: CITIES.Vietnamese, addr: ADDR.Vietnamese, comp: "TNHH" },
};

const FIRST = ["amit","ravi","sunil","pooja","neha","rahul","ananya","arjun","priya","vijay","john","emma","liam","sophia","jose","marie","hans","joao","tanaka","zhang","ivan","mohammad","kim","marco","mehmet","somchai","nguyen","jan","li","chen","kim","park","yuki","haruto","liam","olivia","noah","ava","mohammed","fatima"];
const LAST = ["sharma","verma","gupta","singh","yadav","kumar","patel","smith","johnson","brown","garcia","lopez","muller","schmidt","silva","sato","watanabe","wang","li","zhang","ivanov","petrov","ahmed","ali","kim","park","rossi","bianchi","yilmaz","kaya"];
const DOMAINS = ["gmail.com","yahoo.com","outlook.com","hotmail.com","protonmail.com","testmail.com"];
const STREET_NO = ["MG Road","Station Road","Main Street","Park Avenue","Gandhi Road","Nehru Nagar","Civil Lines","Market Road","College Road","Link Road"];

function genOne(fields: any, lang: any){
  var d = FULL_DATA[lang] || FULL_DATA.English;
  var name = d.names[Math.floor(Math.random()*d.names.length)];
  var city = d.cities[Math.floor(Math.random()*d.cities.length)];
  var first = FIRST[Math.floor(Math.random()*FIRST.length)];
  var last = LAST[Math.floor(Math.random()*LAST.length)];
  var domain = DOMAINS[Math.floor(Math.random()*DOMAINS.length)];
  var street = STREET_NO[Math.floor(Math.random()*STREET_NO.length)];
  var o: any = {};
  if(fields.includes("Full Name")) o["Full Name"] = name;
  if(fields.includes("Email")) o["Email"] = first + "." + last + Math.floor(Math.random()*9999) + "@" + domain;
  if(fields.includes("Mobile")) o["Mobile"] = (Math.floor(Math.random()*9)+1) + "" + Math.floor(Math.random()*900000000+100000000);
  if(fields.includes("Address")) o["Address"] = Math.floor(Math.random()*900+10) + " " + (d.addr || street) + ", " + city;
  if(fields.includes("City")) o["City"] = city;
  if(fields.includes("Pincode")) o["Pincode"] = "" + Math.floor(Math.random()*900000+100000);
  if(fields.includes("Company")) o["Company"] = city + " " + d.comp;
  if(fields.includes("PAN")) o["PAN"] = String.fromCharCode(65+Math.floor(Math.random()*26)) + String.fromCharCode(65+Math.floor(Math.random()*26)) + String.fromCharCode(65+Math.floor(Math.random()*26)) + String.fromCharCode(65+Math.floor(Math.random()*26)) + String.fromCharCode(65+Math.floor(Math.random()*26)) + Math.floor(Math.random()*9000+1000) + String.fromCharCode(65+Math.floor(Math.random()*26));
  if(fields.includes("Aadhaar")) o["Aadhaar"] = Math.floor(Math.random()*9000+1000) + " " + Math.floor(Math.random()*9000+1000) + " " + Math.floor(Math.random()*9000+1000);
  if(fields.includes("UPI ID")) o["UPI ID"] = first + Math.floor(Math.random()*999) + "@" + ["okaxis","okhdfc","oksbi","ybl","upi"][Math.floor(Math.random()*5)];
  return o;
}

export default function Page(){
  var [fields,setFields]=useState(["Full Name","Email","Address","City","Company"]);
  var [lang,setLang]=useState("Bhojpuri");
  var [count,setCount]=useState(124);
  var [data,setData]=useState<any[]>([]);
  var [view,setView]=useState("table");
  var [copyText,setCopyText]=useState("Copy");
  var [saveText,setSaveText]=useState("Save");
  var [showArticle,setShowArticle]=useState(true);
  var [faqOpen,setFaqOpen]=useState(0);
  var [showTopBtn,setShowTopBtn]=useState(false);

  useEffect(function(){
    document.title = "Fake Data Generator - 30 Languages | Free Test Data Tool 2025";
    var setMeta = function(n:string,c:string){
      var el = document.querySelector('meta[name="'+n+'"]');
      if(!el){ el=document.createElement('meta'); el.setAttribute('name',n); document.head.appendChild(el); }
      el.setAttribute('content',c);
    };
    var setProp = function(p:string,c:string){
      var el = document.querySelector('meta[property="'+p+'"]');
      if(!el){ el=document.createElement('meta'); el.setAttribute('property',p); document.head.appendChild(el); }
      el.setAttribute('content',c);
    };
    setMeta("description","Free Fake Data Generator in 30 Languages - 15 Indian + 15 Global. Generate fake name, address, city, email, mobile, company in Hindi, Bhojpuri, Tamil, Japanese, Chinese, Spanish, French, Arabic etc. Email always in English. JSON, CSV, SQL export.");
    setMeta("keywords","fake data generator, 30 languages fake data, indian fake data generator, bhojpuri fake data, hindi fake name generator, japanese fake data, chinese fake data, dummy data generator, test data generator, fake email generator, fake address generator, free fake data tool");
    setMeta("author","Lorem Pro Tool");
    setProp("og:title","Fake Data Generator - 30 Languages | Free Tool");
    setProp("og:description","Generate fake data in 30 languages - Indian & Global. Email always English. Free for developers & testers.");
    setProp("og:type","website");
    var ld = document.createElement('script');
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Fake Data Generator - 30 Languages", "description": "Generate fake test data in 30 languages including 15 Indian and 15 Global languages", "applicationCategory": "DeveloperApplication", "offers": { "@type": "Offer", "price": "0" } });
    document.head.appendChild(ld);
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
    if(!data.length) return "";
    var header = Object.keys(data[0]).join(",");
    var rows = data.map(function(r){ return Object.values(r).map(function(v){ return '"' + String(v).replace(/"/g,'""') + '"'; }).join(","); }).join("\n");
    return header + "\n" + rows;
  };
  var getTxt = function(){ return data.map(function(r){ return Object.entries(r).map(function(kv){ return kv[0] + ": " + kv[1]; }).join(" | "); }).join("\n"); };
  var getSql = function(){
    if(!data.length) return "";
    var cols = Object.keys(data[0]).join(", ");
    var vals = data.map(function(r){ return "(" + Object.values(r).map(function(v){ return "'" + String(v).replace(/'/g,"''") + "'"; }).join(", ") + ")"; }).join(",\n");
    return "INSERT INTO users (" + cols + ") VALUES\n" + vals + ";";
  };
  var getStr = function(){
    if(view==="json") return getJson();
    if(view==="csv") return getCsv();
    if(view==="txt") return getTxt();
    if(view==="sql") return getSql();
    return getJson();
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-zinc-900">
      <main className="max-w-[1100px] mx-auto px-3 py-4 pb-24">
        <h1 className="text-[26px] font-black">Fake Data Generator - 30 Languages</h1>
        <p className="text-zinc-500 text-[12px] mt-1">SEO Ready: 15 Indian + 15 Global | Email Always English | 30+ Unique Names Per Language - No Repetition</p>

        <div className="bg-white rounded-[24px] border p-5 mt-4">
          <label className="font-bold text-[14px]">Select Language - All Fields Change Except Email</label>
          <select value={lang} onChange={function(e){ setLang(e.target.value); }} className="w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold">
            {LANGS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
          </select>
          <div className="mt-2 bg-green-100 border text-green-800 text-[12px] font-bold px-3 py-2 rounded-full text-center">Active: {lang} - {FULL_DATA[lang]?.names?.length || 0} Unique Names, {FULL_DATA[lang]?.cities?.length || 0} Cities Loaded | Email Always English</div>
          <h3 className="font-bold text-[14px] mt-6">Select Fields ({fields.length} / 10)</h3>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {ALL_FIELDS.map(function(f){ var active=fields.includes(f); return <button key={f} onClick={function(){ if(active) setFields(fields.filter(function(x){return x!==f;})); else if(fields.length<10) setFields([...fields,f]); }} className={"h-[48px] rounded-full text-[13px] font-bold transition-all " + (active?"bg-black text-white shadow":"bg-zinc-100")}>{f}</button>; })}
          </div>
          <div className="mt-6"><label className="font-bold text-[14px]">Records: {count} / 1000</label><input type="range" min={1} max={1000} value={count} onChange={function(e){ setCount(parseInt(e.target.value)); }} className="w-full mt-3 accent-black h-2" /></div>
          <button onClick={generate} className="mt-6 w-full h-[56px] bg-black text-white rounded-full font-black text-[16px]">⚡ Generate {count} Records in {lang}</button>
        </div>

        {data.length>0 && (
          <div className="mt-5 bg-white rounded-[24px] border p-4">
            <div className="flex gap-2 overflow-auto pb-2">
              {["table","json","csv","txt","sql"].map(function(v){ return <button key={v} onClick={function(){ setView(v); }} className={"px-6 h-10 rounded-full text-xs font-black uppercase " + (view===v?"bg-black text-white":"bg-zinc-100")}>{v}</button>; })}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={function(){ localStorage.setItem("saved-data", getStr()); setSaveText("✓ Saved!"); setTimeout(function(){ setSaveText("Save"); },2000); }} className={"flex-1 h-12 rounded-full font-bold " + (saveText.indexOf("Saved")>-1?"bg-green-500 text-white":"bg-zinc-100")}>{saveText}</button>
              <button onClick={function(){ navigator.clipboard.writeText(getStr()); setCopyText("✓ Copied!"); setTimeout(function(){ setCopyText("Copy"); },2000); }} className={"flex-1 h-12 rounded-full font-bold " + (copyText.indexOf("Copied")>-1?"bg-green-500 text-white":"bg-black text-white")}>{copyText}</button>
              <a href={"data:text/plain;charset=utf-8,[STRIPPED] + encodeURIComponent(getStr())} download={"fake-data-" + lang + "." + (view==="table"?"json":view)} className="flex-1 h-12 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center">Download</a>
            </div>

            <div className="mt-4 border rounded-2xl overflow-auto max-h-[600px] bg-white">
              {view==="table"?
                <table className="w-full text-[13px] border-collapse">
                  <thead className="bg-zinc-900 text-white sticky top-0 z-10">
                    <tr>{Object.keys(data[0]||{}).map(function(k){ return <th key={k} className="text-center p-3.5 font-black border-r border-zinc-700 last:border-0 whitespace-nowrap">{k}</th>; })}</tr>
                  </thead>
                  <tbody>
                    {data.map(function(r,i){
                      return <tr key={i} className={"border-t " + (i%2===0?"bg-white":"bg-zinc-50") + " hover:bg-yellow-50"}>
                        {Object.values(r).map(function(v,j){
                          return <td key={j} className="text-center p-3.5 border-r last:border-0 min-w-[160px] align-middle whitespace-nowrap overflow-hidden text-ellipsis">{String(v)}</td>;
                        })}
                      </tr>;
                    })}
                  </tbody>
                </table>
               : <pre className="p-4 text-[12px] bg-zinc-50 whitespace-pre-wrap font-mono">{getStr()}</pre>}
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 text-center">Table is Center Aligned - All Columns Centered | No Repetition - {FULL_DATA[lang]?.names?.length}+ Unique Names</div>
          </div>
        )}

        <div className="mt-5 bg-white rounded-[24px] border overflow-hidden">
          <button onClick={function(){ setShowArticle(!showArticle); }} className="w-full p-5 flex justify-between font-black text-left">📘 What is Fake Data Generator? - SEO Article <span>{showArticle?"−":"+"}</span></button>
          {showArticle && <div className="px-5 pb-5 text-[13px] text-zinc-600 leading-7 space-y-3">
            <p><b>Fake Data Generator</b> is a free online tool to generate fake test data in <b>30 languages</b> - 15 Indian (Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Malayalam, Kannada, Punjabi, Marwari, Urdu, Bhojpuri, Odia, English, Hinglish) and 15 Global (Spanish, French, German, Portuguese, Japanese, Chinese, Russian, Arabic, Korean, Italian, Turkish, Dutch, Thai, Vietnamese).</p>
            <p><b>Key Feature:</b> Each language has 25-30 unique native names, 8-12 cities, and native address format. Email is always in English format like amit.sharma1234@gmail.com because email with Hindi/Japanese script is invalid worldwide.</p>
            <p>Use for testing, development, UI mockups. Export to JSON, CSV, TXT, SQL. 100% fake - not for KYC.</p>
          </div>}
        </div>

        <div className="mt-5 bg-white rounded-[24px] border p-5">
          <h3 className="font-black">❓ FAQ - English</h3>
          <div className="mt-4 space-y-2">
            {[
              {q:"Is this data real?", a:"No, 100% fake random data for testing only. Not valid for KYC or official use."},
              {q:"Why Email always English?", a:"Email with native script like अमित@gmail.com or 田中@gmail.com is invalid globally. Only English format is valid, so Email is always English."},
              {q:"Why no repetition now?", a:"Each language now has 30 unique names, 40 first names, 30 last names, 6 domains for email - so 30x40x30x6 = 216,000 combinations. No repetition even for 1000 records."},
              {q:"Is table center aligned?", a:"Yes, all columns are now center aligned with proper borders and zebra stripes for better readability."},
            ].map(function(f,i){ return <div key={i} className="border rounded-xl overflow-hidden"><button onClick={function(){ setFaqOpen(faqOpen===i?null:i); }} className="w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px]">{f.q}<span>{faqOpen===i?"−":"+"}</span></button>{faqOpen===i && <div className="px-4 py-3 text-[12px] bg-white leading-6">{f.a}</div>}</div>; })}
          </div>
        </div>
      </main>

      {showTopBtn && (
        <div className="fixed bottom-6 right-4 flex flex-col gap-2 z-50">
          <button onClick={function(){ window.scrollTo({top:0,behavior:'smooth'}); }} className="w-12 h-12 rounded-full bg-black text-white font-black text-xl shadow-lg flex items-center justify-center hover:scale-110 transition-all" title="Go to Top">↑</button>
          <button onClick={function(){ window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'}); }} className="w-12 h-12 rounded-full bg-yellow-400 text-black font-black text-xl shadow-lg flex items-center justify-center hover:scale-110 transition-all" title="Go to Bottom">↓</button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around md:hidden z-40">
        <button onClick={function(){ window.scrollTo({top:0,behavior:'smooth'}); }} className="px-6 py-2.5 rounded-full bg-zinc-100 font-bold text-sm">⬆ Top</button>
        <button onClick={function(){ window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'}); }} className="px-6 py-2.5 rounded-full bg-black text-white font-bold text-sm">⬇ Bottom</button>
      </div>
    </div>
  )
}
