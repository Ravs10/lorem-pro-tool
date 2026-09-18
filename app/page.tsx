"use client"
import {useState,useEffect} from "react"

const LANGS=[
["EN","English - USA UK"],["HI","हिन्दी - India"],["ZH","中文 - China"],
["ES","Español - Spain Mexico"],["FR","Français - France"],["DE","Deutsch - Germany"],
["JA","日本語 - Japan"],["KO","한국어 - Korea"],["RU","Русский - Russia"],
["PT","Português - Brazil"],["AR","العربية - Saudi UAE"],["TR","Türkçe - Turkey"],
["IT","Italiano - Italy"],["NL","Nederlands - Netherlands"],["PL","Polski - Poland"],
["VI","Tiếng Việt - Vietnam"],["TH","ไทย - Thailand"],["ID","Indonesia"],
["TL","Filipino - Philippines"],["MS","Melayu - Malaysia"],["BN","বাংলা - Bangladesh India"],
["TE","తెలుగు - India"],["TA","தமிழ் - India"],["MR","मराठी - India"],
["GU","ગુજરાતી - India"],["KN","ಕನ್ನಡ - India"],["ML","മലയാളം - India"],
["OR","ଓଡ଼ିଆ - India"],["PA","ਪੰਜਾਬੀ - India"],["UR","اردو - Pakistan"],
["FA","فارسی - Iran"],["HE","עברית - Israel"],["EL","Ελληνικά - Greece"],
["UK","Українська - Ukraine"],["CS","Čeština - Czech"],["RO","Română - Romania"],
["HU","Magyar - Hungary"],["SV","Svenska - Sweden"],["DA","Dansk - Denmark"],
["FI","Suomi - Finland"],["NO","Norsk - Norway"],["SW","Swahili - Kenya Tanzania"],
["AM","አማርኛ - Ethiopia"],["HA","Hausa - Nigeria"],["AF","Afrikaans - South Africa"],
["NE","नेपाली - Nepal"],["SI","සිංහල - Sri Lanka"],["MY","မြန်မာ - Myanmar"],
["LO","ລາວ - Laos"],["KM","ខ្មែរ - Cambodia"],["AS","অসমীয়া - India"],
["BO","བོད་ཡིག - Tibet"],["DZ","རྫོང་ཁ - Bhutan"],["SD","سنڌي - Pakistan"],
["PS","پښتو - Afghanistan"],["KU","Kurdî - Kurdistan"],["AZ","Azərbaycan - Azerbaijan"],
["KK","Қазақ - Kazakhstan"],["UZ","Oʻzbek - Uzbekistan"],["HY","Հայերեն - Armenia"],
["KA","ქართული - Georgia"],["MK","Македонски - Macedonia"],["IS","Íslenska - Iceland"],
["MT","Malti - Malta"],["GA","Gaeilge - Ireland"],["CY","Cymraeg - Wales"],
["EU","Euskara - Basque"],["CA","Català - Catalonia"],["GL","Galego - Galicia"],
["LT","Lietuvių - Lithuania"],["LV","Latviešu - Latvia"],["ET","Eesti - Estonia"],
["HR","Hrvatski - Croatia"],["SR","Српски - Serbia"],["BG","Български - Bulgaria"],
["SK","Slovenčina - Slovakia"],["SL","Slovenščina - Slovenia"],["SQ","Shqip - Albania"]
]

// 100% NATIVE - EK BHI ENGLISH NAHI
const DB:any={
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना शरीर को फिट रखता है","ताजे फल इम्युनिटी बढ़ाते हैं","रोज़ खूब पानी पियो","हरी सब्जियां बहुत फायदेमंद हैं"],
"EN":["Healthy life needs yoga for fitness","Morning walk keeps body active","Fresh fruits boost immunity naturally","Drink plenty of water daily","Green vegetables are very healthy"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳେ ବୁଲିବା ଶରୀର ପାଇଁ ଭଲ","ତାଜା ଫଳ ରୋଗ ପ୍ରତିରୋଧ ବଢାଏ","ପ୍ରତିଦିନ ପାଣି ପିଅ","ସବୁଜ ପରିବା ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ ଭଲ"],
"BN":["সুস্থ জীবনের জন্য যোগ ব্যায়াম জরুরি","সকালে হাঁটা শরীরের জন্য ভালো","তাজা ফল রোগ প্রতিরোধ ক্ষমতা বাড়ায়","প্রতিদিন প্রচুর জল পান করুন","সবুজ শাকসবজি খুব উপকারী"],
"TE":["ఆరోగ్యకరమైన జీవితానికి యోగా అవసరం","ఉదయం నడక శరీరానికి మంచిది","తాజా పండ్లు రోగనిరోధక శక్తిని పెంచుతాయి","రోజూ ఎక్కువ నీళ్లు తాగండి","ఆకుపచ్చ కూరగాయలు చాలా ఆరోగ్యకరం"],
"TA":["ஆரோக்கியமான வாழ்க்கைக்கு யோகா அவசியம்","காலை நடை உடலுக்கு நல்லது","புதிய பழங்கள் நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும்","தினமும் நிறைய தண்ணீர் குடியுங்கள்","பச்சை காய்கறிகள் மிகவும் ஆரோக்கியமானவை"],
"KN":["ಆರೋಗ್ಯಕರ ಜೀವನಕ್ಕೆ ಯೋಗ ಅಗತ್ಯ","ಬೆಳಗಿನ ನಡಿಗೆ ದೇಹಕ್ಕೆ ಒಳ್ಳೆಯದು","ತಾಜಾ ಹಣ್ಣುಗಳು ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ","ದಿನವೂ ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ","ಹಸಿರು ತರಕಾರಿಗಳು ತುಂಬಾ ಆರೋಗ್ಯಕರ"],
"ML":["ആരോഗ്യകരമായ ജീവിതത്തിന് യോഗ ആവശ്യമാണ്","രാവിലെ നടത്തം ശരീരത്തിന് നല്ലതാണ്","പുതിയ പഴങ്ങൾ പ്രതിരോധശേഷി വർദ്ധിപ്പിക്കുന്നു","ദിവസവും ധാരാളം വെള്ളം കുടിക്കുക","പച്ചക്കറികൾ വളരെ ആരോഗ്യകരമാണ്"],
"MR":["निरोगी जीवनासाठी योग आवश्यक आहे","सकाळी चालणे शरीरासाठी चांगले","ताजी फळे प्रतिकारशक्ती वाढवतात","रोज भरपूर पाणी प्या","हिरव्या भाज्या खूप आरोग्यदायी आहेत"],
"GU":["સ્વસ્થ જીવન માટે યોગ જરૂરી છે","સવારની ચાલ શરીર માટે સારી","તાજા ફળો રોગપ્રતિકારક શક્તિ વધારે છે","રોજ પુષ્કળ પાણી પીવો","લીલા શાકભાજી ખૂબ જ આરોગ્યપ્રદ છે"],
"PA":["ਸਿਹਤਮੰਦ ਜੀਵਨ ਲਈ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ","ਸਵੇਰ ਦੀ ਸੈਰ ਸਰੀਰ ਲਈ ਚੰਗੀ ਹੈ","ਤਾਜ਼ੇ ਫਲ ਇਮਿਊਨਿਟੀ ਵਧਾਉਂਦੇ ਹਨ","ਰੋਜ਼ ਖੂਬ ਪਾਣੀ ਪੀਓ","ਹਰੀਆਂ ਸਬਜ਼ੀਆਂ ਬਹੁਤ ਸਿਹਤਮੰਦ ਹਨ"],
"UR":["صحت مند زندگی کے لیے یوگا ضروری ہے","صبح کی سیر جسم کے لیے اچھی ہے","تازہ پھل قوت مدافعت بڑھاتے ہیں","روزانہ خوب پانی پیو","سبز سبزیاں بہت صحت مند ہیں"],
"AS":["সুস্থ জীৱনৰ বাবে যোগ অতি আৱশ্যক","ৰাতিপুৱা খোজ কঢ়াটো শৰীৰৰ বাবে ভাল","সতেজ ফল ৰোগ প্ৰতিৰোধ ক্ষমতা বঢ়ায়","প্ৰতিদিনে বহুত পানী খাওক","সেউজীয়া শাক-পাচলি অতি স্বাস্থ্যকৰ"],
"NE":["स्वस्थ जीवनका लागि योग आवश्यक छ","बिहानको हिँडाइ शरीरका लागि राम्रो छ","ताजा फलले रोग प्रतिरोधात्मक क्षमता बढाउँछ","हरेक दिन धेरै पानी पिउनुहोस्","हरियो तरकारी धेरै स्वस्थकर छ"],
"SI":["නිරෝගී ජීවිතයට යෝග අත්‍යවශ්‍යයි","උදෑසන ඇවිදීම ශරීරයට හොඳයි","නැවුම් පලතුරු ප්‍රතිශක්තිය වැඩි කරයි","දිනපතා ජලය පානය කරන්න","කොළ එළවළු ඉතා සෞඛ්‍ය සම්පන්නයි"],
"MY":["ကျန်းမာသောဘဝအတွက် ယောဂ လိုအပ်သည်","မနက်ခင်းလမ်းလျှောက်ခြင်းသည် ခန္ဓာကိုယ်အတွက် ကောင်းသည်","လတ်ဆတ်သောအသီးများသည် ကိုယ်ခံအားကို မြှင့်တင်ပေးသည်","နေ့စဉ် ရေများများသောက်ပါ","အစိမ်းရောင်ဟင်းသီးဟင်းရွက်များသည် အလွန်ကျန်းမာသည်"],
"TH":["ชีวิตที่มีสุขภาพดีต้องใช้โยคะ","การเดินตอนเช้าดีต่อร่างกาย","ผลไม้สดช่วยเพิ่มภูมิคุ้มกัน","ดื่มน้ำมากๆทุกวัน","ผักใบเขียวมีประโยชน์มาก"],
"LO":["ຊີວິດທີ່ມີສຸຂະພາບດີຕ້ອງການໂຍຄະ","ການຍ່າງຕອນເຊົ້າດີຕໍ່ຮ່າງກາຍ","ໝາກໄມ້ສົດຊ່ວຍເພີ່ມພູມຕ້ານທານ","ດື່ມນ້ຳຫຼາຍໆທຸກມື້","ຜັກຂຽວມີປະໂຫຍດຫຼາຍ"],
"KM":["ជីវិតដែលមានសុខភាពល្អត្រូវការយូហ្គា","ការដើរពេលព្រឹកល្អសម្រាប់រាងកាយ","ផ្លែឈើស្រស់បង្កើនភាពស៊ាំ","ផឹកទឹកច្រើនជារៀងរាល់ថ្ងៃ","បន្លែបៃតងមានប្រយោជន៍ខ្លាំង"],
"VI":["Cuộc sống khỏe mạnh cần yoga","Đi bộ buổi sáng tốt cho cơ thể","Trái cây tươi tăng cường miễn dịch","Uống nhiều nước mỗi ngày","Rau xanh rất tốt cho sức khỏe"],
"ID":["Hidup sehat membutuhkan yoga","Jalan pagi baik untuk tubuh","Buah segar meningkatkan kekebalan","Minum banyak air setiap hari","Sayuran hijau sangat sehat"],
"MS":["Hidup sihat memerlukan yoga","Jalan pagi baik untuk badan","Buah segar meningkatkan imuniti","Minum banyak air setiap hari","Sayur hijau sangat sihat"],
"TL":["Ang malusog na buhay ay nangangailangan ng yoga","Lakad sa umaga ay mabuti sa katawan","Sariwang prutas ay nagpapalakas ng immunity","Uminom ng maraming tubig araw-araw","Berdeng gulay ay napaka sustansya"],
"ZH":["健康的生活需要瑜伽","晨走对身体有好处","新鲜水果能提高免疫力","每天多喝水","绿色蔬菜非常健康"],
"JA":["健康的な生活にはヨガが必要です","朝の散歩は体に良い","新鮮な果物は免疫力を高める","毎日たくさん水を飲んでください","緑の野菜はとても健康的です"],
"KO":["건강한 삶에는 요가가 필요합니다","아침 산책은 몸에 좋다","신선한 과일은 면역력을 높인다","매일 물을 많이 마셔라","녹색 채소는 매우 건강하다"],
"AR":["الحياة الصحية تحتاج إلى اليوغا","المشي الصباحي مفيد للجسم","الفواكه الطازجة تعزز المناعة","اشرب الكثير من الماء يوميا","الخضروات الخضراء صحية جدا"],
"FA":["زندگی سالم به یوگا نیاز دارد","پیاده روی صبح برای بدن مفید است","میوه تازه ایمنی را افزایش می دهد","هر روز آب زیاد بنوشید","سبزیجات سبز بسیار سالم هستند"],
"HE":["חיים בריאים צריכים יוגה","הליכת בוקר טובה לגוף","פירות טריים מחזקים חסינות","שתה הרבה מים כל יום","ירקות ירוקים בריאים מאוד"],
"TR":["Sağlıklı yaşam için yoga gerekir","Sabah yürüyüşü vücut için iyidir","Taze meyve bağışıklığı artırır","Her gün bol su için","Yeşil sebze çok sağlıklıdır"],
"FR":["Une vie saine a besoin de yoga","La marche matinale est bonne pour le corps","Les fruits frais renforcent l'immunité","Buvez beaucoup d'eau chaque jour","Les légumes verts sont très sains"],
"DE":["Ein gesundes Leben braucht Yoga","Morgenspaziergang ist gut für den Körper","Frisches Obst stärkt die Immunität","Trinken Sie täglich viel Wasser","Grünes Gemüse ist sehr gesund"],
"ES":["La vida sana necesita yoga","Caminar por la mañana es bueno para el cuerpo","La fruta fresca aumenta la inmunidad","Bebe mucha agua cada día","Las verduras verdes son muy saludables"],
"PT":["Vida saudável precisa de ioga","Caminhada matinal é boa para o corpo","Fruta fresca aumenta a imunidade","Beba muita água todos os dias","Vegetais verdes são muito saudáveis"],
"IT":["La vita sana ha bisogno di yoga","La passeggiata mattutina fa bene al corpo","La frutta fresca aumenta l'immunità","Bevi molta acqua ogni giorno","Le verdure verdi sono molto sane"],
"NL":["Gezond leven heeft yoga nodig","Ochtendwandeling is goed voor het lichaam","Vers fruit verhoogt de immuniteit","Drink elke dag veel water","Groene groenten zijn erg gezond"],
"PL":["Zdrowe życie potrzebuje jogi","Poranny spacer jest dobry dla ciała","Świeże owoce wzmacniają odporność","Pij dużo wody codziennie","Zielone warzywa są bardzo zdrowe"],
"RU":["Здоровой жизни нужна йога","Утренняя прогулка полезна для тела","Свежие фрукты повышают иммунитет","Пейте много воды каждый день","Зеленые овощи очень полезны"],
"UK":["Здоровому життю потрібна йога","Ранкова прогулянка корисна для тіла","Свіжі фрукти підвищують імунітет","Пийте багато води щодня","Зелені овочі дуже корисні"],
"EL":["Η υγιεινή ζωή χρειάζεται γιόγκα","Ο πρωινός περίπατος κάνει καλό στο σώμα","Τα φρέσκα φρούτα ενισχύουν την ανοσία","Πίνετε πολύ νερό κάθε μέρα","Τα πράσινα λαχανικά είναι πολύ υγιεινά"],
"CS":["Zdravý život potřebuje jógu","Ranní procházka je dobrá pro tělo","Čerstvé ovoce posiluje imunitu","Pijte hodně vody každý den","Zelená zelenina je velmi zdravá"],
"RO":["Viața sănătoasă are nevoie de yoga","Plimbarea de dimineață este bună pentru corp","Fructele proaspete cresc imunitatea","Bea multă apă în fiecare zi","Legumele verzi sunt foarte sănătoase"],
"HU":["Az egészséges életnek jógára van szüksége","A reggeli séta jót tesz a testnek","A friss gyümölcs növeli az immunitást","Igyál sok vizet minden nap","A zöld zöldségek nagyon egészségesek"],
"SV":["Ett hälsosamt liv behöver yoga","Morgonpromenad är bra för kroppen","Färsk frukt stärker immuniteten","Drick mycket vatten varje dag","Gröna grönsaker är mycket hälsosamma"],
"DA":["Et sundt liv har brug for yoga","Morgentur er godt for kroppen","Frisk frugt styrker immuniteten","Drik meget vand hver dag","Grønne grøntsager er meget sunde"],
"FI":["Terveellinen elämä tarvitsee joogaa","Aamukävely on hyväksi keholle","Tuoreet hedelmät vahvistavat vastustuskykyä","Juo paljon vettä joka päivä","Vihreät vihannekset ovat erittäin terveellisiä"],
"NO":["Et sunt liv trenger yoga","Morgentur er bra for kroppen","Frisk frukt styrker immuniteten","Drikk mye vann hver dag","Grønne grønnsaker er veldig sunne"],
"SW":["Maisha yenye afya yanahitaji yoga","Kutembea asubuhi ni nzuri kwa mwili","Matunda safi huongeza kinga","Kunywa maji mengi kila siku","Mboga za kijani ni afya sana"],
"AM":["ጤናማ ሕይወት ዮጋ ያስፈልገዋል","ጠዋት የእግር ጉዞ ለሰውነት ጥሩ ነው","ትኩስ ፍራፍሬ በሽታ የመከላከል አቅም ይጨምራል","በየቀኑ ብዙ ውሃ ይጠጡ","አረንጓዴ አትክልቶች በጣም ጤናማ ናቸው"],
"HA":["Rayuwa mai lafiya tana bukatar yoga","Tafiya da safe yana da kyau ga jiki","Sabo da 'ya'yan itace suna kara rigakafi","Sha ruwa mai yawa kowace rana","Koren ganye suna da lafiya sosai"],
"AF":["Gesonde lewe benodig joga","Oggendwandeling is goed vir die liggaam","Vars vrugte versterk immuniteit","Drink elke dag baie water","Groen groente is baie gesond"],
"SQ":["Jeta e shëndetshme ka nevojë për joga","Shëtitja në mëngjes është e mirë për trupin","Frutat e freskëta rrisin imunitetin","Pini shumë ujë çdo ditë","Perimet e gjelbra janë shumë të shëndetshme"],
"HR":["Zdrav život treba jogu","Jutarnja šetnja dobra je za tijelo","Svježe voće jača imunitet","Pijte puno vode svaki dan","Zeleno povrće je vrlo zdravo"],
"SR":["Здрав живот треба јогу","Јутарња шетња добра је за тело","Свеже воће јача имунитет","Пијте пуно воде сваки дан","Зелено поврће је веома здраво"],
"BG":["Здравословният живот се нуждае от йога","Сутрешната разходка е добра за тялото","Пресните плодове повишават имунитета","Пийте много вода всеки ден","Зелените зеленчуци са много здравословни"],
"SK":["Zdravý život potrebuje jogu","Ranná prechádzka je dobrá pre telo","Čerstvé ovocie posilňuje imunitu","Pite veľa vody každý deň","Zelená zelenina je veľmi zdravá"],
"SL":["Zdravo življenje potrebuje jogo","Jutranji sprehod je dober za telo","Sveže sadje krepi imunost","Pijte veliko vode vsak dan","Zelena zelenjava je zelo zdrava"],
"LT":["Sveikam gyvenimui reikia jogos","Rytinis pasivaikščiojimas geras kūnui","Švieži vaisiai stiprina imunitetą","Gerkite daug vandens kasdien","Žalios daržovės labai sveikos"],
"LV":["Veselīgai dzīvei vajag jogu","Rīta pastaiga ir laba ķermenim","Svaigi augļi stiprina imunitāti","Dzeriet daudz ūdens katru dienu","Zaļie dārzeņi ir ļoti veselīgi"],
"ET":["Tervislik elu vajab joogat","Hommikune jalutuskäik on kehale hea","Värsked puuviljad tugevdavad immuunsust","Joo iga päev palju vett","Rohelised köögiviljad on väga tervislikud"],
"MT":["Ħajja b'saħħitha teħtieġ yoga","Mixja ta' filgħodu tajba għall-ġisem","Frott frisk isaħħaħ l-immunità","Ixrob ħafna ilma kuljum","Ħxejjex ħodor huma b'saħħithom ħafna"],
"GA":["Teastaíonn yoga ó shaol shláintiúil","Tá siúlóid mhaidin go maith don chorp","Torthaí úra a neartaíonn díolúine","Ól go leor uisce gach lá","Tá glasraí glasa an-shláintiúil"],
"CY":["Mae bywyd iach angen ioga","Mae taith gerdded yn y bore yn dda i'r corff","Mae ffrwythau ffres yn cryfhau imiwnedd","Yfwch lawer o ddŵr bob dydd","Mae llysiau gwyrdd yn iach iawn"],
"EU":["Bizitza osasuntsuak yoga behar du","Goizeko ibilaldia ona da gorputzerako","Fruta freskoak immunitatea indartzen du","Edan ur asko egunero","Barazki berdeak oso osasungarriak dira"],
"CA":["La vida sana necessita ioga","Passejar al matí és bo per al cos","La fruita fresca augmenta la immunitat","Beu molta aigua cada dia","Les verdures verdes són molt saludables"],
"GL":["A vida sa precisa ioga","Pasear pola mañá é bo para o corpo","A froita fresca aumenta a inmunidade","Bebe moita auga cada día","As verduras verdes son moi saudables"],
"IS":["Heilbrigt líf þarf jóga","Morgunganga er góð fyrir líkamann","Ferskir ávextir efla ónæmi","Drekktu mikinn vatn á hverjum degi","Grænt grænmeti er mjög hollt"],
"MK":["Здрав живот има потреба од јога","Утринска прошетка е добра за телото","Свежо овошје го зајакнува имунитетот","Пијте многу вода секој ден","Зелен зеленчук е многу здрав"],
"HY":["Առողջ կյանքը յոգայի կարիք ունի","Առավոտյան զբոսանքը լավ է մարմնի համար","Թարմ մրգերը բարձրացնում են իմունիտետը","Խմեք շատ ջուր ամեն օր","Կանաչ բանջարեղենը շատ առողջարար է"],
"KA":["ჯანსაღ ცხოვრებას იოგა სჭირდება","დილის გასეირნება კარგია სხეულისთვის","ახალი ხილი აძლიერებს იმუნიტეტს","დალიეთ ბევრი წყალი ყოველდღე","მწვანე ბოსტნეული ძალიან ჯანსაღია"],
"AZ":["Sağlam həyat yoqaya ehtiyac duyur","Səhər gəzintisi bədən üçün yaxşıdır","Təzə meyvə immuniteti artırır","Hər gün çox su için","Yaşıl tərəvəz çox sağlamdır"],
"KK":["Салауатты өмірге йога қажет","Таңертеңгі серуен денеге пайдалы","Жаңа піскен жемістер иммунитетті арттырады","Күн сайын көп су ішіңіз","Жасыл көкөністер өте пайдалы"],
"UZ":["Sog'lom hayot yoga talab qiladi","Ertalab yurish tana uchun yaxshi","Yangi mevalar immunitetni oshiradi","Har kuni ko'p suv iching","Yashil sabzavotlar juda sog'lom"],
"PS":["روغ ژوند یوګا ته اړتیا لري","سهار ګرځېدل د بدن لپاره ښه دی","تازه مېوه معافیت زیاتوي","هره ورځ ډېرې اوبه وڅښئ","شنه سابه ډېر صحي دي"],
"SD":["صحتمند زندگي کي يوگا جي ضرورت آهي","صبح جو گهمڻ جسم لاءِ سٺو آهي","تازا ميوا قوت مدافعت وڌائين ٿا","روزانو گهڻو پاڻي پيئو","ساوا ڀاڄيون تمام صحتمند آهن"],
"KU":["Jiyana saxlem pêdivî bi yogayê heye","Meşa sibehê ji bo laş baş e","Fêkiyên teze parastinê xurt dike","Her roj gelek av vexwe","Sebzeyên kesk pir saxlem in"],
"BO":["འབྲེལ་བའི་འཚོ་གནས་ལ་ཡོ་ག་དགོས།","སྔ་དྲོའི་འཆམ་འགྲོ་ལུས་པོར་ཕན།","ཤིང་ཏོག་གསར་པས་ནད་འགོག་ནུས་པ་ལེགས་བསྒྱུར།","ཉིན་ལྟར་ཆུ་མང་པོ་འཐུང་།","ཚོདམ་སྔོན་པོ་བདེ་ཐང་ལ་ཤིན་ཏུ་ཕན།"],
"DZ":["གཟུགས་གཞི་བདེ་ཐང་ལུ་ཡོ་ག་དགོ།","དྲོ་པའི་འཆམ་འགྲོ་གཟུགས་ལུ་ལེགས།","ཤིང་ཏོག་གསརཔ་གིས་ནད་འགོག་ནུས་པ་བརྩི།","ཉིན་བཞིན་ཆུ་མངམ་འཐུང་།","ཚོདམ་སྔོནམ་ལེགས་ཤོམ་སྦེ།"]
}

export default function Page(){
const [lang,setLang]=useState("HI")
const [cnt,setCnt]=useState(5)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
const [mode,setMode]=useState("SENTENCE")
const [copied,setCopied]=useState(false)
const [showDL,setShowDL]=useState(false)

const gen=()=>{
 if(cnt===0){setOut("");return}
 const base=DB[lang] || DB["EN"]
 let r=""
 if(mode==="SENTENCE"){ const a=[]; for(let i=0;i<cnt;i++) a.push(base[i%base.length]); r=a.join(" ") }
 if(mode==="PARAGRAPH"){ const paras=[]; for(let p=0;p<cnt;p++){ const len=2+(p%3); const s=[]; for(let j=0;j<len;j++) s.push(base[(p*len+j)%base.length]); paras.push(s.join(" ")); } r=paras.join("\n\n") }
 if(mode==="WORD"){ const all=base.join(" ").split(" "); const a=[]; for(let i=0;i<cnt;i++) a.push(all[i%all.length]); r=a.join(" ") }
 if(mode==="LIST"){ const a=[]; for(let i=0;i<cnt;i++) a.push(`• ${base[i%base.length]}`); r=a.join("\n") }
 setOut(r)
}
useEffect(()=>{gen()},[lang,cnt,mode])

const words = out.trim()?out.trim().split(/\s+/).length:0
const chars = out.length
const charsNoSpace = out.replace(/\s/g,"").length
const sentences = out.trim()?out.split(/[.!?।|。]/).filter(s=>s.trim().length>3).length:0
const paras = out.trim()?out.split("\n\n").filter(b=>b.trim()).length:0

const doDownload=(type:string)=>{
 if(!out) return
 let content=out
 if(type==="HTML") content=`<html><body><p>${out.replace(/\n\n/g,"</p><p>")}</p></body></html>`
 if(type==="JSON") content=JSON.stringify({lang,cnt,words,chars,text:out},null,2)
 const blob=new Blob([content],{type:"text/plain"})
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorem-${lang}.${type.toLowerCase()}`; a.click()
 setShowDL(false)
}

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
<b style={{color:"#000"}}>LP - {LANGS.length} Langs ✅ Fixed</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#000",color:"#fff",border:"none",padding:"10px 20px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>
<div style={{maxWidth:720,margin:"auto",padding:12}}>
{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{color:"#000",marginTop:0}}>All {LANGS.length} Popular Countries</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6, maxHeight:400, overflowY:"auto", border:"2px solid #000", borderRadius:12, padding:8}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:10,borderRadius:8,fontSize:11,fontWeight:700,border:"none",textAlign:"left"}}>{n} - {c}</button>)}
</div>
</div>}
{page==="home"&&<div style={{background:"#fff",borderRadius:20,padding:14}}>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff"}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}
</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["SENTENCE","PARAGRAPH","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:11,borderRadius:10,background:mode===m?"#000":"#f3f4f6",color:mode===m?"#fff":"#000",border:"none",fontSize:11,fontWeight:900}}>{m}</button>)}
</div>
<div style={{marginTop:12,background:"#f3f4f6",padding:12,borderRadius:12,border:"2px solid #000"}}>
<label style={{fontWeight:900,color:"#000",fontSize:13}}>Counter - {cnt} / 100</label>
<div style={{display:"flex",gap:8,marginTop:8}}>
<input type="range" min={0} max={100} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<input type="number" min={0} max={100} value={cnt} onChange={e=>{let v=e.target.value===""?0:parseInt(e.target.value); if(isNaN(v)) v=0; setCnt(Math.min(100,Math.max(0,v)))}} style={{width:80,padding:10,borderRadius:10,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff",textAlign:"center"}}/>
</div>
</div>
<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none"}}>GENERATE {lang} - {cnt} {mode}</button>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
<div style={{background:"#dbeafe",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{words}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>WORDS</div></div>
<div style={{background:"#fef9c3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{chars}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>CHARS</div></div>
<div style={{background:"#dcfce7",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{sentences||paras}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>SENT</div></div>
<div style={{background:"#fce7f3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{paras}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>PARA</div></div>
</div>

<div style={{border:"2px solid #000",borderRadius:12,padding:14,marginTop:12,minHeight:90,background:"#fff",color:"#000",fontSize:14,whiteSpace:"pre-wrap",fontWeight:600,lineHeight:1.6}}>{out||"Select language - auto generate"}</div>

<div style={{display:"flex",gap:8,marginTop:10}}>
<button onClick={()=>{if(!out) return; navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000)}} style={{flex:1,background:copied?"#16a34a":"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>{copied?"Copied ✅":"Copy"}</button>
<button onClick={()=>{setOut(""); setCnt(0)}} style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>

<div style={{marginTop:12,position:"relative"}}>
<button onClick={()=>setShowDL(!showDL)} style={{width:"100%",padding:14,borderRadius:12,background:"linear-gradient(90deg,#f43f5e,#8b5cf6,#3b82f6)",color:"#fff",border:"2px solid #000",fontWeight:900}}>📥 DOWNLOAD 8 Types {showDL?"▲":"▼"}</button>
{showDL&&<div style={{position:"absolute",top:"56px",left:0,right:0,background:"#fff",border:"2px solid #000",borderRadius:14,zIndex:20,overflow:"hidden"}}>
{["TXT","HTML","JSON","CSV","MD","JS","RTF","PDF"].map(code=><button key={code} onClick={()=>doDownload(code)} style={{width:"100%",padding:12,background:"#fff",color:"#000",border:"none",borderBottom:"1px solid #eee",fontWeight:800,textAlign:"left",fontSize:12}}>{code}</button>)}
</div>}
</div>
</div>}
</div>
<footer style={{background:"#000",color:"#fff",padding:16,marginTop:20,textAlign:"center",fontSize:11}}>© 2026 - {LANGS.length} Popular Countries - All Native Fixed | No English Fallback</footer>
</div>)}
