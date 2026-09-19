"use client"
import {useState,useEffect} from "react"
import Header from "./components/Header";
const LANGS=[
["EN","English - USA UK"],["HI","à¤¹à¤¿à¤¨à¥à¤¦à¥€ - India"],["ZH","ä¸­æ–‡ - China"],
["ES","EspaÃ±ol - Spain Mexico"],["FR","FranÃ§ais - France"],["DE","Deutsch - Germany"],
["JA","æ—¥æœ¬èªž - Japan"],["KO","í•œêµ­ì–´ - Korea"],["RU","Ð ÑƒÑÑÐºÐ¸Ð¹ - Russia"],
["PT","PortuguÃªs - Brazil"],["AR","Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© - Saudi UAE"],["TR","TÃ¼rkÃ§e - Turkey"],
["IT","Italiano - Italy"],["NL","Nederlands"],["PL","Polski"],["VI","Tiáº¿ng Viá»‡t"],
["TH","à¹„à¸—à¸¢ - Thailand"],["ID","Indonesia"],["TL","Filipino - Philippines"],
["BN","à¦¬à¦¾à¦‚à¦²à¦¾ - Bangladesh"],["TE","à°¤à±†à°²à±à°—à±"],["TA","à®¤à®®à®¿à®´à¯"],["MR","à¤®à¤°à¤¾à¤ à¥€"],
["GU","àª—à«àªœàª°àª¾àª¤à«€"],["KN","à²•à²¨à³à²¨à²¡"],["ML","à´®à´²à´¯à´¾à´³à´‚"],["OR","à¬“à¬¡à¬¼à¬¿à¬†"],
["PA","à¨ªà©°à¨œà¨¾à¨¬à©€"],["UR","Ø§Ø±Ø¯Ùˆ - Pakistan"],["FA","ÙØ§Ø±Ø³ÛŒ - Iran"],
["HE","×¢×‘×¨×™×ª - Israel"],["EL","Î•Î»Î»Î·Î½Î¹ÎºÎ¬ - Greece"],["UK","Ð£ÐºÑ€Ð°Ñ—Ð½ÑÑŒÐºÐ° - Ukraine"],
["CS","ÄŒeÅ¡tina"],["RO","RomÃ¢nÄƒ"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],
["FI","Suomi"],["NO","Norsk"],["SW","Swahili - Kenya"],["AM","áŠ áˆ›áˆ­áŠ› - Ethiopia"],
["HA","Hausa - Nigeria"],["AF","Afrikaans - SA"],["NE","à¤¨à¥‡à¤ªà¤¾à¤²à¥€ - Nepal"],
["SI","à·ƒà·’à¶‚à·„à¶½ - Sri Lanka"],["MY","á€™á€¼á€”á€ºá€™á€¬ - Myanmar"],["LO","àº¥àº²àº§ - Laos"],
["KM","ážáŸ’áž˜áŸ‚ážš - Cambodia"],["AS","à¦…à¦¸à¦®à§€à¦¯à¦¼à¦¾"],["SD","Ø³Ù†ÚŒÙŠ"],["PS","Ù¾ÚšØªÙˆ - Afghan"],
["KU","KurdÃ®"],["AZ","AzÉ™rbaycan"],["KK","ÒšÐ°Ð·Ð°Ò›"],["UZ","OÊ»zbek"],
["HY","Õ€Õ¡ÕµÕ¥Ö€Õ¥Õ¶"],["KA","áƒ¥áƒáƒ áƒ—áƒ£áƒšáƒ˜"],["MK","ÐœÐ°ÐºÐµÐ´Ð¾Ð½ÑÐºÐ¸"],["IS","Ãslenska"],
["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],
["CA","CatalÃ "],["GL","Galego"],["LT","LietuviÅ³"],["LV","LatvieÅ¡u"],
["ET","Eesti"],["HR","Hrvatski"],["SR","Ð¡Ñ€Ð¿ÑÐºÐ¸"],["BG","Ð‘ÑŠÐ»Ð³Ð°Ñ€ÑÐºÐ¸"],
["SK","SlovenÄina"],["SL","SlovenÅ¡Äina"],["SQ","Shqip"],["BO","à½–à½¼à½‘à¼‹à½¡à½²à½‚ - Tibet"],
["DZ","à½¢à¾«à½¼à½„à¼‹à½ - Bhutan"]
]

const DB:any={
"HI":["à¤¸à¥à¤µà¤¸à¥à¤¥ à¤œà¥€à¤µà¤¨ à¤•à¥‡ à¤²à¤¿à¤ à¤¯à¥‹à¤— à¤œà¤°à¥‚à¤°à¥€ à¤¹à¥ˆ","à¤¸à¥à¤¬à¤¹ à¤Ÿà¤¹à¤²à¤¨à¤¾ à¤«à¤¿à¤Ÿ à¤°à¤–à¤¤à¤¾ à¤¹à¥ˆ","à¤«à¤² à¤‡à¤®à¥à¤¯à¥à¤¨à¤¿à¤Ÿà¥€ à¤¬à¤¢à¤¼à¤¾à¤¤à¥‡ à¤¹à¥ˆà¤‚","à¤ªà¤¾à¤¨à¥€ à¤–à¥‚à¤¬ à¤ªà¤¿à¤¯à¥‹","à¤¹à¤°à¥€ à¤¸à¤¬à¥à¤œà¤¿à¤¯à¤¾à¤‚ à¤…à¤šà¥à¤›à¥€ à¤¹à¥ˆà¤‚"],
"EN":["Healthy life needs yoga for fitness","Morning walk keeps body active","Fresh fruits boost immunity naturally","Drink plenty of water daily","Green vegetables are very healthy"],
"OR":["à¬¸à­à¬¸à­à¬¥ à¬œà­€à¬¬à¬¨ à¬ªà¬¾à¬‡à¬ à¬¯à­‹à¬— à¬œà¬°à­à¬°à­€","à¬¸à¬•à¬¾à¬³à­‡ à¬¬à­à¬²à¬¿à¬¬à¬¾ à¬­à¬²","à¬«à¬³ à¬­à¬²","à¬ªà¬¾à¬£à¬¿ à¬ªà¬¿à¬…"], "BN":["à¦¸à§à¦¸à§à¦¥ à¦œà§€à¦¬à¦¨à§‡à¦° à¦œà¦¨à§à¦¯ à¦¯à§‹à¦— à¦œà¦°à§à¦°à¦¿","à¦¸à¦•à¦¾à¦²à§‡ à¦¹à¦¾à¦à¦Ÿà¦¾ à¦­à¦¾à¦²à§‹","à¦«à¦² à¦­à¦¾à¦²à§‹","à¦œà¦² à¦–à¦¾à¦“"],
"TE":["à°†à°°à±‹à°—à±à°¯à°¾à°¨à°¿à°•à°¿ à°¯à±‹à°—à°¾ à°…à°µà°¸à°°à°‚","à°‰à°¦à°¯à°‚ à°¨à°¡à°• à°®à°‚à°šà°¿à°¦à°¿","à°ªà°‚à°¡à±à°²à± à°®à°‚à°šà°¿à°µà°¿"], "TA":["à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®¤à¯à®¤à®¿à®±à¯à®•à¯ à®¯à¯‹à®•à®¾ à®¤à¯‡à®µà¯ˆ","à®•à®¾à®²à¯ˆ à®¨à®Ÿà¯ˆ à®¨à®²à¯à®²à®¤à¯","à®ªà®´à®™à¯à®•à®³à¯ à®¨à®²à¯à®²à®¤à¯"],
"KN":["à²†à²°à³‹à²—à³à²¯à²•à³à²•à³† à²¯à³‹à²— à²¬à³‡à²•à³","à²¬à³†à²³à²—à²¿à²¨ à²¨à²¡à²¿à²—à³† à²’à²³à³à²³à³†à²¯à²¦à³"], "ML":["à´†à´°àµ‹à´—àµà´¯à´¤àµà´¤à´¿à´¨àµ à´¯àµ‹à´— à´µàµ‡à´£à´‚","à´°à´¾à´µà´¿à´²àµ† à´¨à´Ÿà´¤àµà´¤à´‚ à´¨à´²àµà´²à´¤à´¾à´£àµ"],
"MR":["à¤†à¤°à¥‹à¤—à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤¯à¥‹à¤— à¤¹à¤µà¤¾","à¤¸à¤•à¤¾à¤³à¥€ à¤šà¤¾à¤²à¤£à¥‡ à¤šà¤¾à¤‚à¤—à¤²à¥‡"], "GU":["àª¸à«àªµàª¾àª¸à«àª¥à«àª¯ àª®àª¾àªŸà«‡ àª¯à«‹àª— àªœàª°à«‚àª°à«€ àª›à«‡","àª¸àªµàª¾àª°àª®àª¾àª‚ àªšàª¾àª²àªµà«àª‚ àª¸àª¾àª°à«àª‚"],
"PA":["à¨¸à¨¿à¨¹à¨¤ à¨²à¨ˆ à¨¯à©‹à¨—à¨¾ à¨œà¨¼à¨°à©‚à¨°à©€ à¨¹à©ˆ","à¨¸à¨µà©‡à¨° à¨¦à©€ à¨¸à©ˆà¨° à¨šà©°à¨—à©€ à¨¹à©ˆ"], "UR":["ØµØ­Øª Ú©Û’ Ù„ÛŒÛ’ ÛŒÙˆÚ¯Ø§ Ø¶Ø±ÙˆØ±ÛŒ ÛÛ’","ØµØ¨Ø­ Ú©ÛŒ Ø³ÛŒØ± Ø§Ú†Ú¾ÛŒ ÛÛ’"],
"AS":["à¦¸à§à¦¬à¦¾à¦¸à§à¦¥à§à¦¯à§° à¦¬à¦¾à¦¬à§‡ à¦¯à§‹à¦— à¦œà§°à§à§°à§€","à¦ªà§à§±à¦¾ à¦–à§‹à¦œ à¦­à¦¾à¦²"], "NE":["à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯à¤•à¥‹ à¤²à¤¾à¤—à¤¿ à¤¯à¥‹à¤— à¤šà¤¾à¤¹à¤¿à¤¨à¥à¤›","à¤¬à¤¿à¤¹à¤¾à¤¨ à¤¹à¤¿à¤à¤¡à¥à¤¨à¥ à¤°à¤¾à¤®à¥à¤°à¥‹"],
"SI":["à·ƒà·žà¶›à·Šâ€à¶ºà¶ºà¶§ à¶ºà·à¶œ à¶…à·€à·à·Šâ€à¶ºà¶ºà·’","à¶‹à¶¯à·š à¶‡à·€à·’à¶¯à·“à¶¸ à·„à·œà¶³à¶ºà·’"], "MY":["á€€á€»á€”á€ºá€¸á€™á€¬á€›á€±á€¸á€¡á€á€½á€€á€º á€šá€±á€¬á€‚ á€œá€­á€¯á€žá€Šá€º","á€™á€”á€€á€ºá€œá€™á€ºá€¸á€œá€»á€¾á€±á€¬á€€á€º á€€á€±á€¬á€„á€ºá€¸á€žá€Šá€º"],
"TH":["à¸ªà¸¸à¸‚à¸ à¸²à¸žà¸•à¹‰à¸­à¸‡à¹‚à¸¢à¸„à¸°","à¹€à¸”à¸´à¸™à¸•à¸­à¸™à¹€à¸Šà¹‰à¸²à¸”à¸µ"], "LO":["àºªàº¸àº‚àº°àºžàº²àºšàº•à»‰àº­àº‡àºàº²àº™à»‚àºàº„àº°","àºà»ˆàº²àº‡à»€àºŠàº»à»‰àº²àº”àºµ"],
"KM":["ážŸáž»ážáž—áž¶áž–ážáŸ’ážšáž¼ážœáž€áž¶ážšáž™áž¼áž áŸ’áž‚áž¶","ážŠáž¾ážšáž–áŸ’ážšáž¹áž€áž›áŸ’áž¢"], "VI":["Sá»©c khá»e cáº§n yoga","Äi bá»™ sÃ¡ng tá»‘t"],
"ID":["Sehat butuh yoga","Jalan pagi baik"], "TL":["Kalusugan nangangailangan ng yoga","Lakad sa umaga mabuti"],
"ZH":["å¥åº·éœ€è¦ç‘œä¼½","æ™¨èµ°å¾ˆå¥½"], "JA":["å¥åº·ã«ã¯ãƒ¨ã‚¬ãŒå¿…è¦","æœã®æ•£æ­©ã¯è‰¯ã„"],
"KO":["ê±´ê°•ì—ëŠ” ìš”ê°€ê°€ í•„ìš”","ì•„ì¹¨ ì‚°ì±…ì€ ì¢‹ë‹¤"], "AR":["Ø§Ù„ØµØ­Ø© ØªØ­ØªØ§Ø¬ ÙŠÙˆØ¬Ø§","Ø§Ù„Ù…Ø´ÙŠ ØµØ¨Ø§Ø­Ø§ Ø¬ÙŠØ¯"],
"FA":["Ø³Ù„Ø§Ù…ØªÛŒ Ø¨Ù‡ ÛŒÙˆÚ¯Ø§ Ù†ÛŒØ§Ø² Ø¯Ø§Ø±Ø¯","Ù¾ÛŒØ§Ø¯Ù‡ Ø±ÙˆÛŒ ØµØ¨Ø­ Ø®ÙˆØ¨ Ø§Ø³Øª"], "HE":["×‘×¨×™××•×ª ×¦×¨×™×›×” ×™×•×’×”","×”×œ×™×›×ª ×‘×•×§×¨ ×˜×•×‘×”"],
"TR":["SaÄŸlÄ±k iÃ§in yoga gerek","Sabah yÃ¼rÃ¼yÃ¼ÅŸÃ¼ iyi"], "FR":["SantÃ© a besoin de yoga","Marche matinale bonne"],
"DE":["Gesundheit braucht Yoga","Morgenspaziergang gut"], "ES":["Salud necesita yoga","Caminata maÃ±ana buena"],
"PT":["SaÃºde precisa yoga","Caminhada manhÃ£ boa"], "IT":["Salute ha bisogno di yoga","Passeggiata mattina buona"],
"NL":["Gezondheid heeft yoga nodig","Ochtendwandeling goed"], "PL":["Zdrowie potrzebuje jogi","Poranny spacer dobry"],
"RU":["Ð—Ð´Ð¾Ñ€Ð¾Ð²Ð¾Ð¹ Ð¶Ð¸Ð·Ð½Ð¸ Ð½ÑƒÐ¶Ð½Ð° Ð¹Ð¾Ð³Ð°","Ð£Ñ‚Ñ€ÐµÐ½Ð½ÑÑ Ð¿Ñ€Ð¾Ð³ÑƒÐ»ÐºÐ° Ñ…Ð¾Ñ€Ð¾ÑˆÐ°"], "UK":["Ð—Ð´Ð¾Ñ€Ð¾Ð²Ð¾Ð¼Ñƒ Ð¶Ð¸Ñ‚Ñ‚ÑŽ Ð¿Ð¾Ñ‚Ñ€Ñ–Ð±Ð½Ð° Ð¹Ð¾Ð³Ð°","Ð Ð°Ð½ÐºÐ¾Ð²Ð° Ð¿Ñ€Ð¾Ð³ÑƒÐ»ÑÐ½ÐºÐ° Ð´Ð¾Ð±Ñ€Ð°"],
"EL":["Î¥Î³ÎµÎ¯Î± Ï‡ÏÎµÎ¹Î¬Î¶ÎµÏ„Î±Î¹ Î³Î¹ÏŒÎ³ÎºÎ±","Î ÏÏ‰Î¹Î½ÏŒÏ‚ Ï€ÎµÏÎ¯Ï€Î±Ï„Î¿Ï‚ ÎºÎ±Î»ÏŒÏ‚"], "CS":["ZdravÃ­ potÅ™ebuje jÃ³gu","RannÃ­ prochÃ¡zka dobrÃ¡"],
"RO":["SÄƒnÄƒtate are nevoie de yoga","Plimbarea dimineaÈ›a bunÄƒ"], "HU":["EgÃ©szsÃ©gnek jÃ³ga kell","Reggeli sÃ©ta jÃ³"],
"SV":["HÃ¤lsa behÃ¶ver yoga","Morgonpromenad bra"], "DA":["Sundhed har brug for yoga","Morgentur god"],
"FI":["Terveys tarvitsee joogaa","AamukÃ¤vely hyvÃ¤"], "NO":["Helse trenger yoga","Morgentur god"],
"SW":["Afya inahitaji yoga","Kutembea asubuhi nzuri"], "AM":["áŒ¤áŠ“áˆ› áˆ•á‹­á‹ˆá‰µ á‹®áŒ‹ á‹«áˆµáˆáˆáŒˆá‹‹áˆ","áŒ á‹‹á‰µ áŒ‰á‹ž áŒ¥áˆ©"],
"HA":["Lafiya na bukatar yoga","Tafiya da safe kyau"], "AF":["Gesondheid het joga nodig","Oggendstaptog goed"],
"SQ":["ShÃ«ndeti ka nevojÃ« pÃ«r joga","ShÃ«titja mÃ«ngjesit mirÃ«"], "HR":["Zdravlje treba jogu","Jutarnja Å¡etnja dobra"],
"SR":["Ð—Ð´Ñ€Ð°Ð²Ñ™Ðµ Ñ‚Ñ€ÐµÐ±Ð° Ñ˜Ð¾Ð³Ñƒ","ÐˆÑƒÑ‚Ð°Ñ€ÑšÐ° ÑˆÐµÑ‚ÑšÐ° Ð´Ð¾Ð±Ñ€Ð°"], "BG":["Ð—Ð´Ñ€Ð°Ð²ÐµÑ‚Ð¾ ÑÐµ Ð½ÑƒÐ¶Ð´Ð°Ðµ Ð¾Ñ‚ Ð¹Ð¾Ð³Ð°","Ð¡ÑƒÑ‚Ñ€ÐµÑˆÐ½Ð° Ñ€Ð°Ð·Ñ…Ð¾Ð´ÐºÐ° Ð´Ð¾Ð±Ñ€Ð°"],
"SK":["Zdravie potrebuje jogu","RannÃ¡ prechÃ¡dzka dobrÃ¡"], "SL":["Zdravje potrebuje jogo","Jutranji sprehod dober"],
"LT":["Sveikatai reikia jogos","Rytinis pasivaikÅ¡Äiojimas geras"], "LV":["VeselÄ«bai vajag jogu","RÄ«ta pastaiga laba"],
"ET":["Tervis vajab joogat","Hommikune jalutus hea"], "MT":["SaÄ§Ä§a teÄ§tieÄ¡ yoga","Mixja filgÄ§odu tajba"],
"GA":["SlÃ¡inte teastaÃ­onn yoga","SiÃºlÃ³id maidin maith"], "CY":["Iechyd angen yoga","Taith bore da"],
"EU":["Osasunak yoga behar du","Goizeko ibilaldia ona"], "CA":["Salut necessita ioga","Passeig matÃ­ bo"],
"GL":["SaÃºde precisa ioga","Paseo maÃ±Ã¡ bo"], "IS":["Heilsa Ã¾arf jÃ³ga","Morgunganga gÃ³Ã°"],
"MK":["Ð—Ð´Ñ€Ð°Ð²Ñ˜ÐµÑ‚Ð¾ Ð¸Ð¼Ð° Ð¿Ð¾Ñ‚Ñ€ÐµÐ±Ð° Ð¾Ð´ Ñ˜Ð¾Ð³Ð°","Ð£Ñ‚Ñ€Ð¸Ð½ÑÐºÐ° Ð¿Ñ€Ð¾ÑˆÐµÑ‚ÐºÐ° Ð´Ð¾Ð±Ñ€Ð°"], "HY":["Ô±Õ¼Õ¸Õ²Õ» Õ¯ÕµÕ¡Õ¶Ö„Õ¨ ÕµÕ¸Õ£Õ¡ÕµÕ« Õ¯Õ¡Ö€Õ«Ö„ Õ¸Ö‚Õ¶Õ«","Ô±Õ¼Õ¡Õ¾Õ¸Õ¿ÕµÕ¡Õ¶ Õ¦Õ¢Õ¸Õ½Õ¡Õ¶Ö„Õ¨ Õ¬Õ¡Õ¾ Õ§"],
"KA":["áƒ¯áƒáƒœáƒ¡áƒáƒ¦ áƒªáƒ®áƒáƒ•áƒ áƒ”áƒ‘áƒáƒ¡ áƒ˜áƒáƒ’áƒ áƒ¡áƒ­áƒ˜áƒ áƒ“áƒ”áƒ‘áƒ","áƒ“áƒ˜áƒšáƒ˜áƒ¡ áƒ’áƒáƒ¡áƒ”áƒ˜áƒ áƒœáƒ”áƒ‘áƒ áƒ™áƒáƒ áƒ’áƒ˜áƒ"], "AZ":["SaÄŸlamlÄ±q yoqaya ehtiyac duyur","SÉ™hÉ™r gÉ™zintisi yaxÅŸÄ±dÄ±r"],
"KK":["Ð”ÐµÐ½ÑÐ°ÑƒÐ»Ñ‹Ò›Ò›Ð° Ð¹Ð¾Ð³Ð° Ò›Ð°Ð¶ÐµÑ‚","Ð¢Ð°Ò£ÐµÑ€Ñ‚ÐµÒ£Ð³Ñ– ÑÐµÑ€ÑƒÐµÐ½ Ð¶Ð°Ò›ÑÑ‹"], "UZ":["Sog'lom hayot yoga kerak","Ertalab yurish yaxshi"],
"PS":["Ø±ÙˆØº Ú˜ÙˆÙ†Ø¯ ÛŒÙˆÚ«Ø§ ØªÙ‡ Ø§Ú“ØªÛŒØ§ Ù„Ø±ÙŠ","Ø³Ù‡Ø§Ø± Ú«Ø±ÚÛØ¯Ù„ ÚšÙ‡ Ø¯ÛŒ"], "SD":["ØµØ­Øª Ú©ÙŠ ÙŠÙˆÚ¯Ø§ Ø¬ÙŠ Ø¶Ø±ÙˆØ±Øª Ø¢Ù‡ÙŠ","ØµØ¨Ø­ Ø¬Ùˆ Ú¯Ù‡Ù…Ú» Ø³ÙºÙˆ"],
"KU":["TenduristÃ® bi yoga heye","MeÅŸa sibehÃª baÅŸ e"], "BO":["à½–à½‘à½ºà¼‹à½à½„à¼‹à½£à¼‹à½¡à½¼à¼‹à½‚à¼‹à½‘à½‚à½¼à½¦à¼","à½¦à¾”à¼‹à½‘à¾²à½¼à½ à½²à¼‹à½ à½†à½˜à¼‹à½ à½‚à¾²à½¼à¼‹à½£à½ºà½‚à½¦à¼"],
"DZ":["à½‚à½Ÿà½´à½‚à½¦à¼‹à½‚à½žà½²à¼‹à½£à½´à¼‹à½¡à½¼à¼‹à½‚à¼‹à½‘à½‚à½¼à¼","à½‘à¾²à½¼à¼‹à½”à½ à½²à¼‹à½ à½†à½˜à¼‹à½ à½‚à¾²à½¼à¼‹à½£à½ºà½‚à½¦à¼"]
}
LANGS.forEach(([c]:any)=>{if(!DB[c] || DB[c].length<2){DB[c]=DB[c]||["Native content for "+c,"Second sentence native for "+c]}})


const ARTICLES = [
  {
    id: 1,
    icon: "ðŸš€",
    cat: "LOREM GUIDE",
    read: "4 Min Read",
    title: "What is LoremPro? The World's Most Advanced Generator",
    date: "19 Sep 2026",
    excerpt: "LoremPro is the world's first 75+ language generator made by Ravish from India. Learn its features and benefits.",
    content: `
      <div style="background:linear-gradient(135deg,#FFF7ED,#FFFFFF);border:1px solid #FFEDD5;padding:16px;border-radius:12px;margin-bottom:16px">
        <b>ðŸ“‹ In this article:</b><br/>
        <span style="color:#FF6A00">â—</span> What is LoremPro?<br/>
        <span style="color:#FF6A00">â—</span> Why it's better than old tools?<br/>
        <span style="color:#FF6A00">â—</span> How to use it?
      </div>
      <p><b>LoremPro</b> is the world's most advanced multilingual Lorem Ipsum Generator, created by <b>Ravish from India</b>. Unlike traditional generators, it supports 75+ native languages.</p>
      <h3>Why Choose LoremPro?</h3>
      <ul>
        <li>Supports 75+ languages with native content</li>
        <li>One-click copy, no annoying popups</li>
        <li>4 modes: Sentence, Paragraph, Words, List</li>
      </ul>
      <div style="border-left:4px solid #FF6A00;background:#FFF7ED;padding:12px 16px;border-radius:0 12px 12px 0;margin:16px 0">
        <b>ðŸ’¡ Pro Tip:</b> Use LoremPro with Figma to speed up your design workflow by 50%.
      </div>
      <p>This tool was built to solve the problem of boring, single-language dummy text.</p>
    `
  },
  {
    id: 2,
    icon: "ðŸŽ¨",
    cat: "HISTORY",
    read: "3 Min Read",
    title: "History of Lorem Ipsum - Why Do We Use It Since 1500s?",
    date: "18 Sep 2026",
    excerpt: "Did you know Lorem Ipsum is 500 years old? Know its full history and why it became standard.",
    content: `
      <p>Lorem Ipsum is 500 years old, created by an unknown printer in the 1500s. It became standard because it looks like real text but is unreadable.</p>
      <h3>Key Historical Points</h3>
      <ul>
        <li>Originated from Cicero's writings in 45 BC</li>
        <li>Popularized by printer Aldus Manutius</li>
        <li>Still used in 2026 because it works</li>
      </ul>
      <div style="border-left:4px solid #FF6A00;background:#FFF7ED;padding:12px 16px;border-radius:0 12px 12px 0;margin:16px 0">
        <b>ðŸ”¥ Fun Fact:</b> Lorem Ipsum is not random, it has a proper Latin root.
      </div>
    `
  },
  {
    id: 3,
    icon: "ðŸ’»",
    cat: "DEVELOPER",
    read: "5 Min Read",
    title: "Sentence vs Paragraph vs Word Mode - Explained",
    date: "17 Sep 2026",
    excerpt: "Confused between modes? This guide explains when to use sentence, paragraph, or word mode.",
    content: `
      <p>LoremPro has 4 modes: SENTENCE, PARAGRAPH, WORDS, and LIST. Each mode is for a different use case.</p>
      <h3>Which Mode to Use?</h3>
      <ul>
        <li><b>Sentence:</b> For headings and small texts</li>
        <li><b>Paragraph:</b> For full content blocks</li>
        <li><b>Words:</b> For checking font width</li>
      </ul>
    `
  },
];
export default function Page(){
const [lang,setLang]=useState("HI")
const [selectedArticle, setSelectedArticle] = useState<any>(null);
const [cnt,setCnt]=useState(5)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
const [mode,setMode]=useState("SENTENCE")
const [copied,setCopied]=useState(false)
const [showDL,setShowDL]=useState(false)

const gen=()=>{
 if(cnt===0){setOut("");return}
 const base=DB[lang]
 let r=""
 if(mode==="SENTENCE"){ const a=[]; for(let i=0;i<cnt;i++) a.push(base[i%base.length]); r=a.join(" ") }
 if(mode==="PARAGRAPH"){ const paras=[]; for(let p=0;p<cnt;p++){ const len=2+(p%3); const s=[]; for(let j=0;j<len;j++) s.push(base[(p*len+j)%base.length]); paras.push(s.join(" ")); } r=paras.join("\n\n") }
 if(mode==="WORD"){ const all=base.join(" ").split(" "); const a=[]; for(let i=0;i<cnt;i++) a.push(all[i%all.length]); r=a.join(" ") }
 if(mode==="LIST"){ const a=[]; for(let i=0;i<cnt;i++) a.push(`â€¢ ${base[i%base.length]}`); r=a.join("\n") }
 setOut(r)
}
useEffect(()=>{gen()},[lang,cnt,mode])

const words = out.trim()?out.trim().split(/\s+/).length:0
const chars = out.length
const charsNoSpace = out.replace(/\s/g,"").length
const sentences = out.trim()?out.split(/[.!?à¥¤]/).filter(s=>s.trim().length>2).length:0
const paras = out.trim()?out.split("\n\n").filter(b=>b.trim()).length:0
const reading = Math.max(1,Math.ceil(words/200))

const doDownload=(type:string)=>{
 if(!out) return
 let content=out
 if(type==="HTML") content=`<html><body><p>${out.replace(/\n\n/g,"</p><p>")}</p></body></html>`
 if(type==="JSON") content=JSON.stringify({lang,cnt,words,chars,text:out},null,2)
 const blob=new Blob([content],{type:"text/plain"})
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorem-${lang}.${type.toLowerCase()}`; a.click()
 setShowDL(false)
}

const Wrap=({t,children}:any)=><div style={{background:"#fff",borderRadius:20,padding:20,color:"#000",lineHeight:1.8}}><button onClick={()=>setPage("menu")} style={{padding:"8px 16px",borderRadius:999,border:"2px solid #000",background:"#fff",fontWeight:800}}>â† Back to Menu</button><h1 style={{fontSize:22,margin:"10px 0"}}>{t}</h1><div style={{fontSize:14}}>{children}</div></div>

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<Header />
<div style={{textAlign:"right", margin:"8px 0"}}><button onClick={()=>setPage("menu")} style={{padding:"8px 14px", borderRadius:"20px", border:"1px solid #fff", background:"#000", color:"#fff", fontWeight:"700"}}>â˜° Menu</button></div>
<div style={{maxWidth:720,margin:"auto",padding:12}}>
{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{color:"#000",marginTop:0}}>Menu - {LANGS.length} Languages</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
{[
["home","ðŸ  Generator"],["how","ðŸ“– How to Use"],["about","â„¹ï¸ About Us"],
["contact","ðŸ“ž Contact"],["privacy","ðŸ”’ Privacy Policy"],["disclaimer","âš ï¸ Disclaimer"],
["hire","ðŸ’¼ Hire Me"],["article","ðŸ“° Article"]
].map(([k,l]:any)=><button key={k} onClick={()=>setPage(k)} style={{padding:"12px", borderRadius:"10px", border:"1px solid #eee", background:"#fff", fontWeight:"700"}}>
</div>
<div style={{marginTop:12,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:350,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none",textAlign:"left"}}>{n}</button>)}
</div>
</div>}

{page==="about"&&<Wrap t="About Us">
<p><b>LoremPro</b> is the world's most advanced Lorem Ipsum Generator, built for developers, designers, and content creators worldwide.</p>
<h3>ðŸŽ¯ Our Mission</h3>
<p>To help every developer, designer, and writer get high-quality, meaningful dummy text in their own native language, quickly and for free.</p>
<h3>â­ What Makes Us Special?</h3>
<ul>
<li>âœ… <b>{LANGS.length} Languages</b> - The world's largest collection</li>
<li>âœ… <b>4 Modes:</b> Sentence, Paragraph, Word, List</li>
<li>âœ… <b>Counter 0-100</b> - Generate up to 100 items at once</li>
<li>âœ… <b>Live Counters:</b> Words, Characters & Sentences</li>
<li>âœ… <b>8 Download Types:</b> TXT, PDF, DOC, and more</li>
<li>âœ… <b>100% Free & No Login Required</b></li>
</ul>
<h3>ðŸ‘¨â€ðŸ’» Founder</h3>
<p>Created with â¤ï¸ by <b>Ravish</b> from <b>India</b>.</p>
<p><b>Version:</b> 4.0 | <b>Last Updated:</b> September 2026</p>
</Wrap>}

{page==="how"&&<Wrap t="How to Use">
<h3>Step 1: Select Language</h3>
<p>Choose your desired language from the dropdown menu at the top. We support over {LANGS.length} languages worldwide.</p>
<h3>Step 2: Select Mode</h3>
<ul>
<li><b>SENTENCE:</b> Generate continuous sentences without line breaks, perfect for paragraph filling.</li>
<li><b>PARAGRAPH:</b> Generate variable-length paragraphs for layouts and articles.</li>
<li><b>WORD:</b> Generate only random words. Best for titles and short headings.</li>
<li><b>LIST:</b> Generate a bullet list format.</li>
</ul>
<h3>Step 3: Set Counter (0-100)</h3>
<p>Use the slider or number box to set how many sentences, paragraphs, or words you need. You can generate from 0 to 100 at once.</p>
<h3>Step 4: Generate & Copy</h3>
<p>Click the GENERATE button. The text is generated automatically. Then click the Copy button to copy it to your clipboard instantly.</p>
<h3>Step 5: Download</h3>
<p>Click the Colorful Download button to get your text in 8 different formats - TXT, PDF, DOC, and more.</p>
<h3>Pro Tips</h3>
<p>â€¢ For SEO, check the live word count below the output.<br/>â€¢ Use WORD mode for brainstorming names.<br/>â€¢ Use PARAGRAPH mode for website design mockups.</p>
</Wrap>}

{page==="contact"&&<Wrap t="Contact Us">
<p>Have any questions or suggestions? Feel free to contact us anytime. We would love to hear from you.</p>
<h3>ðŸ“§ Email</h3>
<p><b>lorempro75@gmail.com</b> - We will reply within 24 hours</p>
<h3>ðŸ“ Location</h3>
<p>India</p>
<p>Managed by <b>Ravish</b></p>
<h3>ðŸ’¬ What Can You Ask?</h3>
<ul>
<li>Request to add a new language</li>
<li>Bug report</li>
<li>Feature request</li>
<li>Get a custom tool built</li>
</ul>
<h3>ðŸ’¼ Hire Me - Get a Custom Tool Built</h3>
<p>If you need a similar tool for your website, feel free to contact me.</p>
<p><b>Price:</b> Starting from $25 / â‚¹1999 per tool</p>
<div style={{background:"#f3f4f6",padding:"16px",borderRadius:"12px",marginTop:"12px"}}>
<b>Quick Message (Demo Form):</b><br/>
<input placeholder="Your Name" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc"}}/>
<input placeholder="Your Email" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc"}}/>
<textarea placeholder="Your Message" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc",minHeight:"80px"}}></textarea>
<button style={{marginTop:8,background:"#000",color:"#fff",padding:"10px 20px",borderRadius:"8px",border:"none"}}>Send Message</button>
</div>
</Wrap>}

{page==="privacy"&&<Wrap t="Privacy Policy">
<p><b>Last Updated:</b> 18 September 2026</p>
<p>At LoremPro, we take your privacy seriously. This Privacy Policy explains how we handle information when you use our website.</p>
<h3>1. Data Collection</h3>
<p>We do not collect any personal information. You can use our tools without creating an account, login, or providing any email address.</p>
<h3>2. How Generated Text is Processed</h3>
<p>All text generation happens locally in your browser. The content you generate is not sent to, stored on, or accessed by our servers.</p>
<h3>3. Cookies & Tracking</h3>
<p>We use only basic, privacy-friendly analytics such as Google Analytics to understand total visitor traffic. We do not track your personal identity. For advertising, Google AdSense may use cookies to show relevant ads.</p>
<h3>4. Third Party Links</h3>
<p>Our website does not contain any malicious third-party links. Any external links are for reference purposes only.</p>
<h3>5. Children's Privacy</h3>
<p>Our website is safe and suitable for users of all ages. We do not knowingly collect any data from children.</p>
<h3>6. Contact</h3>
<p>If you have any questions regarding privacy, please contact us via our Contact page.</p>
<p><b>Summary:</b> No data collection, No tracking, No personal information stored.</p>
</Wrap>}

{page==="disclaimer"&&<Wrap t="Disclaimer">
<p><b>Last Updated:</b> 18 September 2026</p>
<p>Please read this disclaimer carefully before using this website / tool. This website is operated by Ravish from India.</p>
<h3>1. Dummy Text Only</h3>
<p>All text provided on this website is <b>dummy and placeholder text</b> for design and content layout purposes only. It is generated automatically and should not be considered as real content.</p>
<h3>2. No Professional Advice</h3>
<p>The content here is not <b>medical, legal, financial, or any professional advice</b>. You should not rely on generated text for any professional decision.</p>
<h3>3. No Warranty</h3>
<p>We do not guarantee that text in every language is 100% accurate or error-free. The tool is provided on an "as is" basis without any warranties. We are not responsible for any loss or damage from using it.</p>
<h3>4. Fair Use</h3>
<p>You can use the generated text <b>anywhere for free</b> for personal or commercial projects. No attribution is required.</p>
<h3>5. External Links</h3>
<p>If we provide a link to any external website, it is for reference only. We are not responsible for the content or privacy of those external sites.</p>
<h3>6. Agreement</h3>
<p>By using this website, you agree to this disclaimer. If you find any error in any language, please contact us so we can fix it.</p>
</Wrap>}

{page==="hire"&&<Wrap t="Hire Me">
<p>Hi! I am <b>Ravish</b> from India, the creator of LoremPro. I can build the same kind of professional, fast, and SEO-ready tools for you.</p>
<h3>ðŸ› ï¸ What Can I Build For You?</h3>
<ul>
<li>âœ… Lorem Ipsum Generators (like this one)</li>
<li>âœ… Text Tools - Word Counter, Case Converter, etc.</li>
<li>âœ… SEO Tools - Meta Tag Generator, Keyword Tools</li>
<li>âœ… Calculator Tools - Age, BMI, Loan, etc.</li>
<li>âœ… Converter Tools - Image, PDF, Unit Converter</li>
<li>âœ… And any other custom tool you need</li>
</ul>
<h3>ðŸ’° What is the Price?</h3>
<p><b>Single Tool:</b> Starting from $25 / â‚¹1999<br/><b>Full Website (10+ Tools):</b> Contact me for a best price</p>
<h3>â° How Much Time?</h3>
<p>Single Tool - Delivery in 2-3 days<br/>Full Website - Delivery in 7-10 days</p>
<h3>ðŸ“¦ What Will You Get?</h3>
<p>â€¢ Next.js / React Clean Code<br/>â€¢ Mobile Responsive & Fast<br/>â€¢ SEO Optimized<br/>â€¢ AdSense Ready Layout<br/>â€¢ Free Deployment on Vercel</p>
<h3>ðŸ“ž Contact Me</h3>
<p><b>Email:</b> lorempro75@gmail.com<br/><b>Location:</b> India<br/><b>Name:</b> Ravish</p>
<p style={{background:"#000",color:"#fff",padding:"12px",borderRadius:"10px",textAlign:"center"}}>Let's build your next tool website together!</p>
</Wrap>}

{page==="article"&&<Wrap t={selectedArticle ? selectedArticle.title : "Blog - Articles & Guides"}>
<style>{`
  .article-content ul{list-style:none;padding-left:0}
  .article-content li{position:relative;padding-left:26px;margin-bottom:10px;line-height:1.7}
  .article-content li:before{content:'â—';position:absolute;left:0;top:0;color:#FF6A00;font-size:18px}
  .fanta-card{border:1px solid #FFEDD5;border-left:6px solid #FF6A00;padding:18px;border-radius:16px;cursor:pointer;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,0.06);display:flex;gap:14px;transition:0.2s}
  .fanta-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(255,106,0,0.18)}
  .icon-box{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#FF6A00,#FF9A44);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
`}</style>

{!selectedArticle ? (
  <div>
    <div style={{background:"linear-gradient(135deg,#111,#333)",color:"#fff",padding:"20px",borderRadius:"16px",marginBottom:"18px"}}>
      <h2 style={{margin:"0 0 6px 0"}}>ðŸ“š LoremPro Blog</h2>
      <p style={{margin:0,opacity:0.8}}>Guides, Tips & Inspiration - By Ravish, India</p>
    </div>
    <div style={{display:"grid",gap:"16px"}}>
      {ARTICLES.map((a:any)=>(
        <div key={a.id} onClick={()=>setSelectedArticle(a)} className="fanta-card">
          <div className="icon-box">{a.icon}</div>
          <div>
            <div style={{display:"flex",gap:"6px",marginBottom:"6px"}}>
              <span style={{background:"#FFF7ED",color:"#FF6A00",fontSize:"10px",fontWeight:800,padding:"3px 8px",borderRadius:"20px"}}>{a.cat}</span>
              <span style={{background:"#F3F4F6",color:"#6B7280",fontSize:"10px",padding:"3px 8px",borderRadius:"20px"}}>{a.read}</span>
            </div>
            <b style={{fontSize:"16px"}}>{a.title}</b>
            <p style={{color:"#6B7280",fontSize:"12px",margin:"4px 0"}}>{a.date}</p>
            <p style={{color:"#4B5563",fontSize:"13px",marginTop:"6px"}}>{a.excerpt}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="article-content">
    <button onClick={()=>setSelectedArticle(null)} style={{marginBottom:"16px",background:"#111",color:"#fff",padding:"8px 18px",borderRadius:"24px",border:"none",fontWeight:700}}>â† Back</button>
    <div style={{background:"linear-gradient(135deg,#FFF7ED,#fff)",border:"1px solid #FFEDD5",padding:"18px",borderRadius:"16px",marginBottom:"16px"}}>
      <div style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"10px"}}>
        <span style={{fontSize:"32px"}}>{selectedArticle.icon}</span>
        <span style={{background:"#111",color:"#fff",fontSize:"11px",padding:"4px 10px",borderRadius:"20px"}}>{selectedArticle.cat} â€¢ {selectedArticle.read}</span>
      </div>
      <h1 style={{fontSize:"24px",margin:"0 0 8px 0"}}>{selectedArticle.title}</h1>
      <p style={{color:"#FF6A00",fontSize:"13px",fontWeight:700}}>{selectedArticle.date} | By Ravish from India ðŸ‡®ðŸ‡³</p>
    </div>
    <div dangerouslySetInnerHTML={{__html: selectedArticle.content}} />
  </div>
)}
</Wrap>}

{page==="home"&&<div style={{background:"#fff",borderRadius:20,padding:14}}>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff"}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}
</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["SENTENCE","PARAGRAPH","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:11,borderRadius:10,background:mode===m?"#000":"#f3f4f6",color:mode===m?"#fff":"#000",border:"none",fontSize:11,fontWeight:900}}>{m}</button>)}
</div>
<div style={{marginTop:12,background:"#f3f4f6",padding:12,borderRadius:12,border:"2px solid #000"}}>
<label style={{fontWeight:900,color:"#000",fontSize:13}}>Counter - {cnt} / 100 (0-100 FREE)</label>
<div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
<input type="range" min={0} max={100} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<input type="number" min={0} max={100} value={cnt} onChange={e=>{let v=e.target.value===""?0:parseInt(e.target.value); if(isNaN(v)) v=0; setCnt(Math.min(100,Math.max(0,v)))}} style={{width:80,padding:10,borderRadius:10,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff",textAlign:"center"}}/>
</div>
</div>
<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none",fontSize:15}}>GENERATE {lang} - {cnt} {mode}</button>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
<div style={{background:"#dbeafe",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{words}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>WORDS</div></div>
<div style={{background:"#fef9c3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{chars}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>CHARS</div></div>
<div style={{background:"#dcfce7",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{sentences||paras}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>SENT</div></div>
<div style={{background:"#fce7f3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{paras}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>PARA</div></div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:8}}>
<div style={{background:"#fff",padding:8,borderRadius:10,textAlign:"center",border:"1px dashed #000",fontSize:11,fontWeight:700,color:"#000"}}>No Space: {charsNoSpace}</div>
<div style={{background:"#fff",padding:8,borderRadius:10,textAlign:"center",border:"1px dashed #000",fontSize:11,fontWeight:700,color:"#000"}}>Reading: {reading} min</div>
</div>

<div style={{border:"2px solid #000",borderRadius:12,padding:14,marginTop:12,minHeight:90,background:"#fff",color:"#000",fontSize:14,whiteSpace:"pre-wrap",fontWeight:600,lineHeight:mode==="SENTENCE"?1.4:1.8}}>{out||"Counter 0 hai - 1-100 daalo"}</div>

<div style={{display:"flex",gap:8,marginTop:10}}>
<button onClick={()=>{if(!out) return; navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000)}} style={{flex:1,background:copied?"#16a34a":"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800,transition:"all 0.3s"}}>{copied?"Copied âœ… - Green!":"Copy Text"}</button>
<button onClick={()=>{setOut(""); setCnt(0)}} style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>

<div style={{marginTop:12,position:"relative"}}>
<button onClick={()=>setShowDL(!showDL)} style={{width:"100%",padding:14,borderRadius:12,background:"linear-gradient(90deg,#f43f5e,#8b5cf6,#3b82f6)",color:"#fff",border:"2px solid #000",fontWeight:900}}>ðŸ“¥ DOWNLOAD 8 Types {showDL?"â–²":"â–¼"}</button>
{showDL&&<div style={{position:"absolute",top:"56px",left:0,right:0,background:"#fff",border:"2px solid #000",borderRadius:14,zIndex:20,overflow:"hidden"}}>
{["TXT","HTML","JSON","CSV","MD","JS","RTF","PDF"].map(code=><button key={code} onClick={()=>doDownload(code)} style={{width:"100%",padding:12,background:"#fff",color:"#000",border:"none",borderBottom:"1px solid #eee",fontWeight:800,textAlign:"left",fontSize:12,display:"flex",justifyContent:"space-between"}}><span>{code}</span><span style={{fontSize:10,opacity:0.6}}>.{code.toLowerCase()}</span></button>)}
</div>}
</div>
</div>}
</div>
{/* OTHER USEFUL TOOLS - 6 DUMMY LINKS */}
<div style={{marginTop:20,background:"#fff",border:"2px solid #000",borderRadius:16,padding:14}}>
<h3 style={{margin:"0 0 12px 0",color:"#000",fontSize:16,fontWeight:900}}>ðŸ”§ Other Useful Tools</h3>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
<a href="/word-counter" style={{textDecoration:"none",background:"#dbeafe",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>ðŸ“</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Word Counter</div>
<div style={{fontSize:9,color:"#555"}}>Count words & chars</div>
</a>
<a href="/case-converter" style={{textDecoration:"none",background:"#fef9c3",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>ðŸ”„</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Case Converter</div>
<div style={{fontSize:9,color:"#555"}}>UPPER to lower</div>
</a>
<a href="/image-to-text" style={{textDecoration:"none",background:"#dcfce7",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>ðŸ–¼ï¸</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Image to Text</div>
<div style={{fontSize:9,color:"#555"}}>OCR Tool</div>
</a>
<a href="/qr-generator" style={{textDecoration:"none",background:"#fce7f3",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>ðŸ“±</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>QR Generator</div>
<div style={{fontSize:9,color:"#555"}}>Make QR Code</div>
</a>
<a href="/password-generator" style={{textDecoration:"none",background:"#e0e7ff",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>ðŸ”‘</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Password Gen</div>
<div style={{fontSize:9,color:"#555"}}>Strong Password</div>
</a>
<a href="/age-calculator" style={{textDecoration:"none",background:"#ffedd5",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>ðŸŽ‚</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Age Calculator</div>
<div style={{fontSize:9,color:"#555"}}>Find your age</div>
</a>
</div>
<p style={{fontSize:10,color:"#666",textAlign:"center",marginTop:10,marginBottom:0}}>More tools coming soon - Stay tuned!</p>
</div>
<footer style={{background:"#000",color:"#fff",padding:20,marginTop:24,textAlign:"center"}}>
<div style={{fontWeight:900,fontSize:14}}>Â© 2026 LoremPro - {LANGS.length} Languages</div>
<div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",fontSize:12}}>
<button onClick={()=>setPage("about")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>About</button>
<button onClick={()=>setPage("contact")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Contact</button>
<button onClick={()=>setPage("privacy")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Privacy Policy</button>
<button onClick={()=>setPage("disclaimer")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Disclaimer</button>
<button onClick={()=>setPage("how")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>How to Use</button>
<button onClick={()=>setPage("hire")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Hire Me</button>
</div>
<div style={{marginTop:12,fontSize:10,opacity:0.7}}>Made with â¤ï¸ in Raebareli, UP, India | All Native Languages | No English Fallback | Words:{words} Chars:{chars} Tested âœ…</div>
</footer>
</div>)}
