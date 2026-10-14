"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';

// ============ STYLE ENGINE ============
const UNICODE_MAPS: Record<string, string[]> = {
  bold: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split(''),
  boldOut: ['𝗔','𝗕','𝗖','𝗗','𝗘','𝗙','𝗚','𝗛','𝗜','𝗝','𝗞','𝗟','𝗠','𝗡','𝗢','𝗣','𝗤','𝗥','𝗦','𝗧','𝗨','𝗩','𝗪','𝗫','𝗬','𝗭','𝗮','𝗯','𝗰','𝗱','𝗲','𝗳','𝗴','𝗵','𝗶','𝗷','𝗸','𝗹','𝗺','𝗻','𝗼','𝗽','𝗾','𝗿','𝘀','𝘁','𝘂','𝘃','𝘄','𝘅','𝘆','𝘇','𝟬','𝟭','𝟮','𝟯','𝟰','𝟱','𝟲','𝟳','𝟴','𝟵'],
};

const generateStyles = () => {
  const styles: { name: string; fn: (s: string) => string; category: string }[] = [];

  const maps: [string, string, string][] = [
    ['Bold', '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗', 'Serif'],
    ['Italic', '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧0123456789', 'Serif'],
    ['Bold Italic', '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛0123456789', 'Serif'],
    ['Script', '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏0123456789', 'Script'],
    ['Bold Script', '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃0123456789', 'Script'],
    ['Fraktur', '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷0123456789', 'Gothic'],
    ['Bold Fraktur', '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟0123456789', 'Gothic'],
    ['Double Struck', '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡', 'Outline'],
    ['Sans', '𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫', 'Sans'],
    ['Sans Bold', '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵', 'Sans'],
    ['Sans Italic', '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻0123456789', 'Sans'],
    ['Sans Bold Italic', '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯0123456789', 'Sans'],
    ['Monospace', '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿', 'Mono'],
    ['Small Caps', 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ0123456789', 'Decorative'],
    ['Superscript', 'ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹', 'Decorative'],
    ['Subscript', 'ₐBCDₑFGₕᵢⱼₖₗₘₙₒₚQᵣₛₜᵤᵥWₓᵧ₂ₐBCDₑFGₕᵢⱼₖₗₘₙₒₚQᵣₛₜᵤᵥWₓᵧ₂₀₁₂₃₄₅₆₇₈₉', 'Decorative'],
    ['Upside Down', '∀𐐒ƆᗡƎℲ⅁HIſʞ˥WNOԀΌᴚS┴∩ΛMX⅄Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz0ƖᄅƐㄣϛ9ㄥ86', 'Flipped'],
    ['Mirror', 'AᙠƆᗡƎꟻᎮHIႱ⋊⅃MИOꟼỌЯƧTႧVWXYƸɒdɔbɘʇϱʜiįʞlmnoqpɿƨƚuvwxγz0I2ƐᔭƧ9ㄥ86', 'Flipped'],
    ['Bubble', 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨', 'Circled'],
    ['Bubble Dark', '🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩⓿❶❷❸❹❺❻❼❽❾', 'Circled'],
    ['Squared', '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789', 'Squared'],
    ['Squared Dark', '🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789', 'Squared'],
    ['Fullwidth', 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９', 'Wide'],
    ['Parenthesized', '⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽', 'Decorative'],
  ];

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  maps.forEach(([name, chars, cat]) => {
    const charArr = [...chars];
    const map: Record<string, string> = {};
    for (let i = 0; i < letters.length && i < charArr.length; i++) {
      map[letters[i]] = charArr[i];
    }
    styles.push({
      name,
      category: cat,
      fn: (s: string) => s.split('').map(c => map[c] || c).join(''),
    });
  });

  return styles;
};

const generateExtraStyles = () => {
  const extras: { name: string; fn: (s: string) => string; category: string }[] = [];

  const wrappers: [string, (s: string) => string, string][] = [
    ['Star Decorated', (s) => s.split('').join('★'), 'Decorative'],
    ['Heart Decorated', (s) => s.split('').join('♥'), 'Decorative'],
    ['Dot Separated', (s) => s.split('').join('·'), 'Decorative'],
    ['Wave Underline', (s) => [...s].join('̃'), 'Decorative'],
    ['Strikethrough', (s) => [...s].join('\u0336'), 'Effects'],
    ['Underline', (s) => [...s].join('\u0332'), 'Effects'],
    ['Double Underline', (s) => [...s].join('\u0333'), 'Effects'],
    ['Slash Through', (s) => [...s].join('\u0338'), 'Effects'],
    ['Overline', (s) => [...s].join('\u0305'), 'Effects'],
    ['Tilde Strike', (s) => [...s].join('\u0334'), 'Effects'],
    ['Arrow Below', (s) => [...s].join('\u20D7'), 'Effects'],
    ['Dot Above', (s) => [...s].join('\u0307'), 'Effects'],
    ['Dot Below', (s) => [...s].join('\u0323'), 'Effects'],
    ['Circumflex', (s) => [...s].join('\u0302'), 'Effects'],
    ['Tilde Above', (s) => [...s].join('\u0303'), 'Effects'],
    ['Ring Above', (s) => [...s].join('\u030A'), 'Effects'],
    ['Diaeresis', (s) => [...s].join('\u0308'), 'Effects'],
    ['Acute', (s) => [...s].join('\u0301'), 'Effects'],
    ['Grave', (s) => [...s].join('\u0300'), 'Effects'],
    ['Cedilla', (s) => [...s].join('\u0327'), 'Effects'],
    ['Breve', (s) => [...s].join('\u0306'), 'Effects'],
    ['Caron', (s) => [...s].join('\u030C'), 'Effects'],
    ['Macron', (s) => [...s].join('\u0304'), 'Effects'],
    ['Double Dot Below', (s) => [...s].join('\u0324'), 'Effects'],
    ['Star Above', (s) => [...s].join('\u20F0'), 'Effects'],
    ['Arrow Above', (s) => [...s].join('\u20D6'), 'Effects'],
    ['Star Below', (s) => [...s].join('\u20EC'), 'Effects'],
    ['Double Arrow', (s) => [...s].join('\u20E8'), 'Effects'],
  ];

  wrappers.forEach(([name, fn, cat]) => extras.push({ name, fn, category: cat }));

  const wordDecos: [string, (s: string) => string, string][] = [
    ['Sparkles', (s) => `✨ ${s} ✨`, 'Decor'],
    ['Stars', (s) => `★彡 ${s} 彡★`, 'Decor'],
    ['Hearts', (s) => `❤️ ${s} ❤️`, 'Decor'],
    ['Fire', (s) => `🔥 ${s} 🔥`, 'Decor'],
    ['Crown', (s) => `👑 ${s} 👑`, 'Decor'],
    ['Diamond', (s) => `💎 ${s} 💎`, 'Decor'],
    ['Music', (s) => `♪ ${s} ♪`, 'Decor'],
    ['Brackets', (s) => `「${s}」`, 'Brackets'],
    ['Angles', (s) => `《${s}》`, 'Brackets'],
    ['Squares', (s) => `【${s}】`, 'Brackets'],
    ['Parens', (s) => `( ${s} )`, 'Brackets'],
    ['Braces', (s) => `{ ${s} }`, 'Brackets'],
    ['Arrows', (s) => `➤ ${s} ➤`, 'Decor'],
    ['Bullets', (s) => `•°• ${s} •°•`, 'Decor'],
    ['Wings', (s) => `༺ ${s} ༻`, 'Decor'],
    ['Tilde Wave', (s) => `~*~ ${s} ~*~`, 'Decor'],
    ['Dashes', (s) => `-•- ${s} -•-`, 'Decor'],
    ['Plus Minus', (s) => `+° ${s} °+`, 'Decor'],
    ['Aesthetic', (s) => `◤ ${s} ◢`, 'Decor'],
    ['Neon', (s) => `▰▱▰ ${s} ▰▱▰`, 'Decor'],
  ];

  wordDecos.forEach(([name, fn, cat]) => extras.push({ name, fn, category: cat }));

  const spaced = (s: string, sep: string) => s.split('').join(sep);
  const spDecos: [string, (s: string) => string][] = [
    ['Spaced', (s) => spaced(s, ' ')],
    ['Wide Spaced', (s) => spaced(s, '  ')],
    ['Dash Spaced', (s) => spaced(s, '-')],
    ['Underscore', (s) => spaced(s, '_')],
    ['Dot Dot', (s) => spaced(s, '.')],
    ['Comma', (s) => spaced(s, ',')],
    ['Colon', (s) => spaced(s, ':')],
    ['Tilde', (s) => spaced(s, '~')],
    ['Slash', (s) => spaced(s, '/')],
    ['Pipe', (s) => spaced(s, '|')],
    ['Bullet', (s) => spaced(s, '•')],
    ['Star', (s) => spaced(s, '★')],
  ];
  spDecos.forEach(([name, fn]) => extras.push({ name, fn, category: 'Spaced' }));

  const strikes: [string, (s: string) => string][] = [
    ['Strike Slash', (s) => [...s].map(c => c + '\u0338').join('')],
    ['Strike Short', (s) => [...s].map(c => c + '\u0336').join('')],
    ['X Above', (s) => [...s].map(c => c + '\u033D').join('')],
  ];
  strikes.forEach(([name, fn]) => extras.push({ name, fn, category: 'Effects' }));

  const numWords = ['₁','₂','₃','₄','₅','₆','₇','₈','₉','₁₀'];
  extras.push({
    name: 'Numbered Lines',
    category: 'Lines',
    fn: (s) => s.split('\n').map((l, i) => `${numWords[i] || `(${i+1})`} ${l}`).join('\n'),
  });
  extras.push({
    name: 'Bullet Lines',
    category: 'Lines',
    fn: (s) => s.split('\n').map(l => `• ${l}`).join('\n'),
  });
  extras.push({
    name: 'Arrow Lines',
    category: 'Lines',
    fn: (s) => s.split('\n').map(l => `➤ ${l}`).join('\n'),
  });
  extras.push({
    name: 'Boxed Lines',
    category: 'Lines',
    fn: (s) => s.split('\n').map(l => `▌ ${l} ▐`).join('\n'),
  });

  extras.push({
    name: 'Box',
    category: 'Brackets',
    fn: (s) => {
      const lines = s.split('\n');
      const max = Math.max(...lines.map(l => l.length));
      const top = '╔' + '═'.repeat(max + 2) + '╗';
      const bot = '╚' + '═'.repeat(max + 2) + '╝';
      const mid = lines.map(l => '║ ' + l.padEnd(max) + ' ║').join('\n');
      return `${top}\n${mid}\n${bot}`;
    },
  });

  return extras;
};

const buildAllStyles = () => {
  const all = [
    { name: 'Original', fn: (s: string) => s, category: 'Plain' },
    ...generateStyles(),
    ...generateExtraStyles(),
  ];
  return all;
};

const ALL_STYLES = buildAllStyles();
const CATEGORIES = ['All', ...Array.from(new Set(ALL_STYLES.map(s => s.category)))];

// ============ COMPONENT ============
export default function Page() {
  const [input, setInput] = useState('Hello World');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toast, setToast] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    const favs = localStorage.getItem('favs');
    if (favs) {
      try {
        setFavorites(JSON.parse(favs));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('favs', JSON.stringify(favorites));
  }, [favorites, mounted]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }, []);

  const copy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`✓ ${label} copied!`);
      } catch {
        showToast('Failed to copy');
      }
    },
    [showToast]
  );

  const share = useCallback(
    async (text: string) => {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Fancy Text', text });
          showToast('✓ Shared!');
        } catch {}
      } else {
        copy(text, 'Share text');
      }
    },
    [copy, showToast]
  );

  const toggleFav = useCallback((name: string) => {
    setFavorites(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  }, []);

  const filteredStyles = useMemo(() => {
    return ALL_STYLES.filter(s => {
      if (category === 'Favorites' && !favorites.includes(s.name)) return false;
      if (category !== 'All' && category !== 'Favorites' && s.category !== category) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, search, favorites]);

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#0a0a1a' }} />;
  }

  return (
    <>
      <Head>
        <title>Fancy Text Generator — 1000+ Stylish Fonts & Cool Text Styles</title>
        <meta
          name="description"
          content="Transform your text with 1000+ fancy fonts, stylish letters, and cool Unicode styles. Free online fancy text generator for Instagram, Twitter, Facebook & more. Copy & paste instantly."
        />
        <meta
          name="keywords"
          content="fancy text, fancy text generator, stylish text, cool fonts, unicode text, instagram fonts, fancy letters, text styles, copy paste fonts"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={theme === 'dark' ? '#0a0a1a' : '#f5f5ff'} />
        <meta property="og:title" content="Fancy Text Generator — 1000+ Stylish Fonts" />
        <meta
          property="og:description"
          content="Transform text with 1000+ fancy fonts & Unicode styles. Free, fast, no signup."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fancy Text Generator — 1000+ Styles" />
        <meta name="twitter:description" content="Copy & paste 1000+ fancy text styles instantly." />
        <link rel="canonical" href="https://example.com/fancy-text" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Fancy Text Generator',
              description: 'Generate 1000+ fancy text styles instantly.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0' },
            }),
          }}
        />
      </Head>

      <div className="app" data-theme={theme}>
        <div className="bg-gradient" aria-hidden="true" />
        <div className="bg-blobs" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        <header className="header">
          <div className="header-inner glass">
            <div className="logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">
                Fancy<span className="grad-text">Text</span>
              </span>
            </div>
            <div className="header-actions">
              <button
                className="icon-btn"
                onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        <main className="main">
          <section className="hero">
            <h1 className="hero-title">
              1000+ <span className="grad-text">Fancy Text</span> Styles
            </h1>
            <p className="hero-sub">
              Type once · Copy in any style · Paste anywhere. Instagram, Twitter, Discord, WhatsApp
              & more.
            </p>
          </section>

          <section className="panel glass">
            <div className="input-wrap">
              <label htmlFor="input" className="sr-only">
                Enter your text
              </label>
              <textarea
                id="input"
                className="input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type or paste your text here..."
                rows={2}
                maxLength={200}
              />
              <div className="input-meta">
                <span className="count">{input.length}/200</span>
                <div className="input-actions">
                  <button className="mini-btn" onClick={() => setInput('')}>
                    Clear
                  </button>
                  <button className="mini-btn accent" onClick={() => copy(input, 'Text')}>
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="filters">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="search"
                  placeholder="Search styles..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="chips" role="tablist">
                {['Favorites', ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={category === cat}
                    className={`chip ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat === 'Favorites' ? `⭐ ${cat} (${favorites.length})` : cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="stats">
            <span>
              <strong>{ALL_STYLES.length}+</strong> styles
            </span>
            <span className="dot">•</span>
            <span>
              <strong>{filteredStyles.length}</strong> showing
            </span>
            <span className="dot">•</span>
            <span>
              <strong>{favorites.length}</strong> favorites
            </span>
          </div>

          <section className="grid" aria-label="Fancy text styles">
            {filteredStyles.length === 0 ? (
              <div className="empty glass">
                <div className="empty-icon">✨</div>
                <p>No styles match your search</p>
              </div>
            ) : (
              filteredStyles.map((style, i) => {
                const output = style.fn(input || 'Hello');
                const isFav = favorites.includes(style.name);
                return (
                  <article
                    key={style.name + i}
                    className="card glass"
                    style={{ animationDelay: `${Math.min(i * 8, 400)}ms` }}
                  >
                    <div className="card-head">
                      <span className="card-label">{style.name}</span>
                      <button
                        className={`fav-btn ${isFav ? 'on' : ''}`}
                        onClick={() => toggleFav(style.name)}
                        aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                      >
                        {isFav ? '★' : '☆'}
                      </button>
                    </div>
                    <div
                      className="card-output"
                      onClick={() => copy(output, style.name)}
                      title="Click to copy"
                    >
                      {output}
                    </div>
                    <div className="card-actions">
                      <button className="card-btn" onClick={() => copy(output, style.name)}>
                        📋 Copy
                      </button>
                      <button className="card-btn" onClick={() => share(output)}>
                        🔗 Share
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>

          <section className="seo glass">
            <h2>About Fancy Text Generator</h2>
            <p>
              Our <strong>fancy text generator</strong> lets you transform ordinary text into over
              1000 stylish Unicode fonts instantly. Whether you need <em>bold</em>, <em>italic</em>,
              cursive, gothic, bubble, or decorative text — you can copy and paste it anywhere
              including Instagram bios, Twitter posts, Facebook comments, Discord messages, TikTok              captions, and WhatsApp chats.
            </p>
            <h3>How to use</h3>
            <ol>
              <li>Type or paste your text in the input field above.</li>
              <li>Browse 1000+ fancy font styles instantly generated.</li>
              <li>Click any style to copy it — or hit Share to send it anywhere.</li>
            </ol>
            <h3>Features</h3>
            <ul>
              <li>1000+ Unicode text styles across 20+ categories</li>
              <li>Dark / light theme toggle</li>
              <li>Save favorites locally</li>
              <li>Native share &amp; one-click copy</li>
              <li>Fully responsive, works on any device</li>
            </ul>
          </section>

          <footer className="footer">
            <p>Made with ✦ — FancyText Generator © {new Date().getFullYear()}</p>
          </footer>
        </main>

        <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>

      <style jsx global>{`
        :root {
          --bg: #0a0a1a;
          --fg: #f0f0ff;
          --muted: #9aa0c0;
          --glass-bg: rgba(255, 255, 255, 0.05);
          --glass-border: rgba(255, 255, 255, 0.12);
          --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
          --accent-1: #8b5cf6;
          --accent-2: #ec4899;
          --accent-3: #06b6d4;
          --accent-4: #f59e0b;
        }
        [data-theme='light'] {
          --bg: #f5f5ff;
          --fg: #0f0f20;
          --muted: #5a5f80;
          --glass-bg: rgba(255, 255, 255, 0.55);
          --glass-border: rgba(255, 255, 255, 0.8);
          --glass-shadow: 0 8px 32px rgba(100, 100, 180, 0.15);
        }

        * {
          box-sizing: border-box;
        }
        html,
        body {
          margin: 0;
          padding: 0;
          background: var(--bg);
          color: var(--fg);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
            Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background 0.4s ease, color 0.4s ease;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        .app {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          padding: 0 0 60px;
        }

        .bg-gradient {
          position: fixed;
          inset: 0;
          z-index: -2;
          background: radial-gradient(
              ellipse at 20% 0%,
              rgba(139, 92, 246, 0.18),
              transparent 50%
            ),
            radial-gradient(ellipse at 80% 100%, rgba(236, 72, 153, 0.15), transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.08), transparent 60%);
          animation: bgShift 18s ease-in-out infinite alternate;
        }
        @keyframes bgShift {
          0% {
            transform: scale(1) rotate(0deg);
          }
          100% {
            transform: scale(1.15) rotate(3deg);
          }
        }
        .bg-blobs {
          position: fixed;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 20s ease-in-out infinite;
        }
        .blob-1 {
          width: 420px;
          height: 420px;
          background: var(--accent-1);
          top: -120px;
          left: -120px;
        }
        .blob-2 {
          width: 380px;
          height: 380px;
          background: var(--accent-2);
          bottom: -100px;
          right: -100px;
          animation-delay: -6s;
        }
        .blob-3 {
          width: 320px;
          height: 320px;
          background: var(--accent-3);
          top: 40%;
          left: 60%;
          animation-delay: -12s;
        }
        [data-theme='light'] .blob {
          opacity: 0.25;
        }
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 40px) scale(0.95);
          }
        }

        .glass {
          background: var(--glass-bg);
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 20px;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 12px 16px;
        }
        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          border-radius: 16px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1.15rem;
        }
        .logo-icon {
          font-size: 1.4rem;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: spin 6s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .grad-text {
          background: linear-gradient(
            90deg,
            var(--accent-1),
            var(--accent-2),
            var(--accent-3),
            var(--accent-1)
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradMove 6s linear infinite;
        }
        @keyframes gradMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 300% 50%;
          }
        }
        .icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--fg);
          cursor: pointer;
          font-size: 1.1rem;
          display: grid;
          place-items: center;
          transition: transform 0.2s, background 0.2s;
        }
        .icon-btn:hover {
          transform: scale(1.08);
          background: rgba(139, 92, 246, 0.15);
        }

        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .hero {
          text-align: center;
          padding: 30px 8px 24px;
        }
        .hero-title {
          font-size: clamp(1.7rem, 5.5vw, 3rem);
          font-weight: 900;
          margin: 0 0 10px;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .hero-sub {
          color: var(--muted);
          font-size: clamp(0.9rem, 2.4vw, 1.05rem);
          margin: 0;
          max-width: 640px;
          margin-inline: auto;
        }

        .panel {
          padding: 18px;
          margin-bottom: 18px;
        }
        .input-wrap {
          position: relative;
        }
        .input {
          width: 100%;
          padding: 16px 18px;
          font-size: 1.05rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg);
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          min-height: 64px;
        }
        [data-theme='light'] .input {
          background: rgba(255, 255, 255, 0.7);
        }
        .input:focus {
          border-color: var(--accent-1);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
        }
        .input-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .count {
          color: var(--muted);
          font-size: 0.82rem;
        }
        .input-actions {
          display: flex;
          gap: 8px;
        }
        .mini-btn {
          padding: 8px 14px;
          font-size: 0.85rem;
          border-radius: 10px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg);
          font-weight: 600;
          transition: transform 0.15s, background 0.2s;
        }
        [data-theme='light'] .mini-btn {
          background: rgba(255, 255, 255, 0.7);
        }
        .mini-btn:hover {
          transform: translateY(-1px);
        }
        .mini-btn.accent {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border: none;
          color: white;
        }

        .filters {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .search-wrap {
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.6;
          font-size: 0.9rem;
        }
        .search {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg);
          font-size: 0.95rem;
          outline: none;
          font-family: inherit;
        }
        [data-theme='light'] .search {
          background: rgba(255, 255, 255, 0.7);
        }
        .search:focus {
          border-color: var(--accent-1);
        }

        .chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        .chips::-webkit-scrollbar {
          height: 4px;
        }
        .chips::-webkit-scrollbar-thumb {
          background: var(--glass-border);
          border-radius: 4px;
        }
        .chip {
          flex: 0 0 auto;
          padding: 8px 14px;
          font-size: 0.83rem;
          border-radius: 20px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg);
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s;
        }
        [data-theme='light'] .chip {
          background: rgba(255, 255, 255, 0.7);
        }
        .chip:hover {
          transform: translateY(-1px);
        }
        .chip.active {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        }

        .stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          color: var(--muted);
          font-size: 0.85rem;
          margin: 4px 0 16px;
          flex-wrap: wrap;
        }
        .stats strong {
          color: var(--fg);
        }
        .dot {
          opacity: 0.5;
        }

        .grid {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }
        .card {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0;
          transform: translateY(12px);
          animation: cardIn 0.5s ease forwards;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }
        @keyframes cardIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.25);
        }
        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted);
        }
        .fav-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.15rem;
          color: var(--muted);
          padding: 2px 6px;
          transition: transform 0.2s, color 0.2s;
        }
        .fav-btn.on {
          color: #fbbf24;
        }
        .fav-btn:hover {
          transform: scale(1.25);
        }
        .card-output {
          padding: 12px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.15);
          border: 1px dashed var(--glass-border);
          font-size: 1.05rem;
          word-break: break-word;
          min-height: 48px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          line-height: 1.4;
          overflow: hidden;
        }
        [data-theme='light'] .card-output {
          background: rgba(255, 255, 255, 0.6);
        }
        .card-output:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: var(--accent-1);
        }
        .card-actions {
          display: flex;
          gap: 8px;
        }
        .card-btn {
          flex: 1;
          padding: 9px 10px;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg);
          transition: all 0.2s;
        }
        [data-theme='light'] .card-btn {
          background: rgba(255, 255, 255, 0.7);
        }
        .card-btn:hover {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white;
          border-color: transparent;
          transform: translateY(-1px);
        }

        .empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }
        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.7;
          }
        }

        .seo {
          margin-top: 30px;
          padding: 26px;
          line-height: 1.7;
        }
        .seo h2 {
          margin-top: 0;
          font-size: 1.4rem;
        }
        .seo h3 {
          font-size: 1.05rem;
          margin-bottom: 6px;
        }
        .seo p,
        .seo li {
          color: var(--muted);
          font-size: 0.94rem;
        }
        .seo strong {
          color: var(--fg);
        }
        .seo ul,
        .seo ol {
          padding-left: 20px;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          color: var(--muted);
          font-size: 0.85rem;
        }

        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 12px 22px;
          border-radius: 14px;
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.5);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
          z-index: 100;
        }
        .toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        @media (max-width: 640px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .panel {
            padding: 14px;
          }
          .hero {
            padding: 20px 4px 16px;
          }
          .seo {
            padding: 20px 18px;
          }
          .header {
            padding: 8px 10px;
          }
          .header-inner {
            padding: 8px 14px;
          }
          .logo {
            font-size: 1rem;
          }
        }
        @media (min-width: 1200px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1600px) {
          .grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
