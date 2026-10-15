"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';

// ============================================================
// STYLE ENGINE
// ============================================================
const BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
type StyleDef = { name: string; fn: (s: string) => string; category: string };

const ALPHA_MAPS: [string, string, string][] = [
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

const COMBINING_MARKS: [string, string, string][] = [
  ['Strikethrough', '\u0336', 'Effects'],
  ['Underline', '\u0332', 'Effects'],
  ['Double Underline', '\u0333', 'Effects'],
  ['Slash Through', '\u0338', 'Effects'],
  ['Overline', '\u0305', 'Effects'],
  ['Tilde Strike', '\u0334', 'Effects'],
  ['Arrow Below', '\u20D7', 'Effects'],
  ['Dot Above', '\u0307', 'Effects'],
  ['Dot Below', '\u0323', 'Effects'],
  ['Circumflex', '\u0302', 'Effects'],
  ['Tilde Above', '\u0303', 'Effects'],
  ['Ring Above', '\u030A', 'Effects'],
  ['Diaeresis', '\u0308', 'Effects'],
  ['Acute', '\u0301', 'Effects'],
  ['Grave', '\u0300', 'Effects'],
  ['Cedilla', '\u0327', 'Effects'],
  ['Breve', '\u0306', 'Effects'],
  ['Caron', '\u030C', 'Effects'],
  ['Macron', '\u0304', 'Effects'],
  ['Double Dot Below', '\u0324', 'Effects'],
  ['Star Above', '\u20F0', 'Effects'],
  ['Arrow Above', '\u20D6', 'Effects'],
  ['Star Below', '\u20EC', 'Effects'],
  ['Double Arrow', '\u20E8', 'Effects'],
  ['X Above', '\u033D', 'Effects'],
  ['Bridge Above', '\u0346', 'Effects'],
  ['Bridge Below', '\u032A', 'Effects'],
  ['Hook Above', '\u0309', 'Effects'],
  ['Horn', '\u031B', 'Effects'],
  ['Left Half Ring', '\u031C', 'Effects'],
  ['Right Half Ring', '\u0339', 'Effects'],
  ['Minus Below', '\u0320', 'Effects'],
  ['Plus Below', '\u031F', 'Effects'],
  ['Seagull Below', '\u033C', 'Effects'],
  ['Not Tilde Below', '\u0330', 'Effects'],
  ['Vertical Line Below', '\u0329', 'Effects'],
  ['Double Vertical Below', '\u0348', 'Effects'],
  ['Inverted Breve', '\u0311', 'Effects'],
  ['Inverted Double Breve', '\u0361', 'Effects'],
];

const WRAP_STYLES: [string, (s: string) => string, string][] = [
  ['Sparkles', s => `✨ ${s} ✨`, 'Decor'],
  ['Stars', s => `★彡 ${s} 彡★`, 'Decor'],
  ['Hearts', s => `❤️ ${s} ❤️`, 'Decor'],
  ['Fire', s => `🔥 ${s} 🔥`, 'Decor'],
  ['Crown', s => `👑 ${s} 👑`, 'Decor'],
  ['Diamond', s => `💎 ${s} 💎`, 'Decor'],
  ['Music', s => `♪ ${s} ♪`, 'Decor'],
  ['Notes', s => `♫ ${s} ♫`, 'Decor'],
  ['Moon', s => `🌙 ${s} 🌙`, 'Decor'],
  ['Sun', s => `☀️ ${s} ☀️`, 'Decor'],
  ['Butterfly', s => `🦋 ${s} 🦋`, 'Decor'],
  ['Rose', s => `🌹 ${s} 🌹`, 'Decor'],
  ['Cherry', s => `🍒 ${s} 🍒`, 'Decor'],
  ['Lightning', s => `⚡ ${s} ⚡`, 'Decor'],
  ['Skull', s => `💀 ${s} 💀`, 'Decor'],
  ['Alien', s => `👽 ${s} 👽`, 'Decor'],
  ['Rocket', s => `🚀 ${s} 🚀`, 'Decor'],
  ['Brackets', s => `「${s}」`, 'Brackets'],
  ['Angles', s => `《${s}》`, 'Brackets'],
  ['Squares', s => `【${s}】`, 'Brackets'],
  ['Parens', s => `( ${s} )`, 'Brackets'],
  ['Braces', s => `{ ${s} }`, 'Brackets'],
  ['Curly', s => `❪ ${s} ❫`, 'Brackets'],
  ['Arrows', s => `➤ ${s} ➤`, 'Decor'],
  ['Right Arrow', s => `➔ ${s}`, 'Decor'],
  ['Left Arrow', s => `← ${s}`, 'Decor'],
  ['Bullets', s => `•°• ${s} •°•`, 'Decor'],
  ['Wings', s => `༺ ${s} ༻`, 'Decor'],
  ['Wings Alt', s => `꧁ ${s} ꧂`, 'Decor'],
  ['Double Wings', s => `꧁༺ ${s} ༻꧂`, 'Decor'],
  ['Tilde Wave', s => `~*~ ${s} ~*~`, 'Decor'],
  ['Dashes', s => `-•- ${s} -•-`, 'Decor'],
  ['Plus Minus', s => `+° ${s} °+`, 'Decor'],
  ['Aesthetic', s => `◤ ${s} ◢`, 'Decor'],
  ['Neon', s => `▰▱▰ ${s} ▰▱▰`, 'Decor'],
  ['Diamonds', s => `◈ ${s} ◈`, 'Decor'],
  ['Snowflake', s => `❄ ${s} ❄`, 'Decor'],
  ['Star Line', s => `✧･ﾟ: *✧ ${s} ✧*:･ﾟ✧`, 'Decor'],
  ['Glitter', s => `‧͙⁺˚*･༓☾ ${s} ☽༓･*˚⁺‧͙`, 'Decor'],
  ['Kawaii', s => `(っ◔◡◔)っ ♥ ${s} ♥`, 'Kawaii'],
  ['Bear', s => `ʕ•ᴥ•ʔ ${s} ʕ•ᴥ•ʔ`, 'Kawaii'],
  ['Lenny', s => `( ͡° ͜ʖ ͡°) ${s}`, 'Kawaii'],
  ['Shrug', s => `¯\\_(ツ)_/¯ ${s}`, 'Kawaii'],
  ['Happy', s => `◕‿◕ ${s} ◕‿◕`, 'Kawaii'],
  ['Heart Face', s => `♥‿♥ ${s} ♥‿♥`, 'Kawaii'],
  ['Sparkle Line', s => `✩₊˚.⋆☾⋆⁺₊✧ ${s} ✧₊⁺⋆☽⋆.˚₊✩`, 'Decor'],
  ['Ornate', s => `⊰⚘⊱ ${s} ⊰⚘⊱`, 'Ornate'],
  ['Royal', s => `♔──── ${s} ────♔`, 'Ornate'],
  ['Gothic', s => `╰⊱ ${s} ⊱╯`, 'Ornate'],
  ['Angle Fancy', s => `▸▹▸ ${s} ◂◃◂`, 'Ornate'],
  ['Circle Line', s => `◦◦◦ ${s} ◦◦◦`, 'Ornate'],
  ['Plus Line', s => `+++ ${s} +++`, 'Ornate'],
  ['Minus Line', s => `--- ${s} ---`, 'Ornate'],
  ['Equal Line', s => `=== ${s} ===`, 'Ornate'],
  ['Star Line 2', s => `★★★ ${s} ★★★`, 'Ornate'],
  ['Diamond Line', s => `◆◆◆ ${s} ◆◆◆`, 'Ornate'],
  ['Triangle Line', s => `▲▲▲ ${s} ▲▲▲`, 'Ornate'],
  ['Heart Line', s => `♥♥♥ ${s} ♥♥♥`, 'Ornate'],
  ['Music Line', s => `♪♫♪ ${s} ♪♫♪`, 'Ornate'],
  ['Wave Line', s => `〰〰〰 ${s} 〰〰〰`, 'Ornate'],
  ['Fire Line', s => `🔥🔥🔥 ${s} 🔥🔥🔥`, 'Ornate'],
  ['Sparkle Line 3', s => `✦✦✦ ${s} ✦✦✦`, 'Ornate'],
];

const SEPARATOR_STYLES: [string, string, string][] = [
  ['Spaced', ' ', 'Spaced'],
  ['Wide Spaced', '  ', 'Spaced'],
  ['Dash Spaced', '-', 'Spaced'],
  ['Underscore', '_', 'Spaced'],
  ['Dot Dot', '.', 'Spaced'],
  ['Comma', ',', 'Spaced'],
  ['Colon', ':', 'Spaced'],
  ['Semicolon', ';', 'Spaced'],
  ['Tilde', '~', 'Spaced'],
  ['Slash', '/', 'Spaced'],
  ['Backslash', '\\', 'Spaced'],
  ['Pipe', '|', 'Spaced'],
  ['Bullet', '•', 'Spaced'],
  ['Star', '★', 'Spaced'],
  ['Heart', '♥', 'Spaced'],
  ['Diamond', '◆', 'Spaced'],
  ['Circle', '●', 'Spaced'],
  ['Square', '■', 'Spaced'],
  ['Triangle', '▲', 'Spaced'],
  ['Plus', '+', 'Spaced'],
  ['Equal', '=', 'Spaced'],
  ['Arrow', '→', 'Spaced'],
  ['Wave', '〜', 'Spaced'],
  ['Dot Separator', '·', 'Spaced'],
  ['Asterisk', '*', 'Spaced'],
  ['Quote', '`', 'Spaced'],
  ['Space Dash', ' - ', 'Spaced'],
  ['Space Dot', ' . ', 'Spaced'],
  ['Space Pipe', ' | ', 'Spaced'],
];

const LINE_STYLES: [string, (s: string) => string, string][] = [
  ['Numbered', s => s.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'), 'Lines'],
  ['Numbered Circled', s => s.split('\n').map((l, i) => `${['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'][i] || `(${i+1})`} ${l}`).join('\n'), 'Lines'],
  ['Sub Numbered', s => s.split('\n').map((l, i) => `${['₁','₂','₃','₄','₅','₆','₇','₈','₉','₁₀'][i] || `(${i+1})`} ${l}`).join('\n'), 'Lines'],
  ['Bullet Lines', s => s.split('\n').map(l => `• ${l}`).join('\n'), 'Lines'],
  ['Dash Lines', s => s.split('\n').map(l => `- ${l}`).join('\n'), 'Lines'],
  ['Arrow Lines', s => s.split('\n').map(l => `➤ ${l}`).join('\n'), 'Lines'],
  ['Arrow 2 Lines', s => s.split('\n').map(l => `→ ${l}`).join('\n'), 'Lines'],
  ['Star Lines', s => s.split('\n').map(l => `★ ${l}`).join('\n'), 'Lines'],
  ['Heart Lines', s => s.split('\n').map(l => `♥ ${l}`).join('\n'), 'Lines'],
  ['Check Lines', s => s.split('\n').map(l => `✓ ${l}`).join('\n'), 'Lines'],
  ['Cross Lines', s => s.split('\n').map(l => `✗ ${l}`).join('\n'), 'Lines'],
  ['Box Lines', s => s.split('\n').map(l => `▌ ${l} ▐`).join('\n'), 'Lines'],
  ['Quote Lines', s => s.split('\n').map(l => `> ${l}`).join('\n'), 'Lines'],
  ['Double Quote Lines', s => s.split('\n').map(l => `>> ${l}`).join('\n'), 'Lines'],
  ['Roman Lines', s => s.split('\n').map((l, i) => `${['I','II','III','IV','V','VI','VII','VIII','IX','X'][i] || `(${i+1})`}. ${l}`).join('\n'), 'Lines'],
  ['Letter Lines', s => s.split('\n').map((l, i) => `${String.fromCharCode(97 + (i % 26))}. ${l}`).join('\n'), 'Lines'],
  ['Box Frame', s => {
    const lines = s.split('\n');
    const max = Math.max(...lines.map(l => l.length));
    return `╔${'═'.repeat(max + 2)}╗\n${lines.map(l => '║ ' + l.padEnd(max) + ' ║').join('\n')}\n╚${'═'.repeat(max + 2)}╝`;
  }, 'Brackets'],
  ['Rounded Box', s => {
    const lines = s.split('\n');
    const max = Math.max(...lines.map(l => l.length));
    return `╭${'─'.repeat(max + 2)}╮\n${lines.map(l => '│ ' + l.padEnd(max) + ' │').join('\n')}\n╰${'─'.repeat(max + 2)}╯`;
  }, 'Brackets'],
  ['Wave Border', s => {
    const lines = s.split('\n');
    const max = Math.max(...lines.map(l => l.length));
    return `〜${'〜'.repeat(max + 2)}〜\n${lines.map(l => '│ ' + l.padEnd(max) + ' │').join('\n')}\n〜${'〜'.repeat(max + 2)}〜`;
  }, 'Brackets'],
];

const FLIP_STYLES: [string, (s: string) => string, string][] = [
  ['Reverse Text', s => [...s].reverse().join(''), 'Flipped'],
  ['Reverse Words', s => s.split(' ').reverse().join(' '), 'Flipped'],
  ['Reverse Lines', s => s.split('\n').reverse().join('\n'), 'Flipped'],
  ['Alternating Case', s => [...s].map((c, i) => (i % 2 ? c.toLowerCase() : c.toUpperCase())).join(''), 'Case'],
  ['UPPERCASE', s => s.toUpperCase(), 'Case'],
  ['lowercase', s => s.toLowerCase(), 'Case'],
  ['Title Case', s => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()), 'Case'],
  ['Sentence Case', s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(), 'Case'],
  ['Camel Case', s => s.trim().split(/[\s_-]+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''), 'Case'],
  ['Pascal Case', s => s.trim().split(/[\s_-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''), 'Case'],
  ['Snake Case', s => s.trim().toLowerCase().replace(/\s+/g, '_'), 'Case'],
  ['Kebab Case', s => s.trim().toLowerCase().replace(/\s+/g, '-'), 'Case'],
  ['Dot Case', s => s.trim().toLowerCase().replace(/\s+/g, '.'), 'Case'],
  ['Constant Case', s => s.trim().toUpperCase().replace(/\s+/g, '_'), 'Case'],
  ['Toggle Case', s => [...s].map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''), 'Case'],
];

function buildAllStyles(): StyleDef[] {
  const styles: StyleDef[] = [];
  styles.push({ name: 'Original', fn: s => s, category: 'Plain' });

  ALPHA_MAPS.forEach(([name, chars, cat]) => {
    const arr = [...chars];
    const map: Record<string, string> = {};
    for (let i = 0; i < BASE.length && i < arr.length; i++) map[BASE[i]] = arr[i];
    styles.push({ name, category: cat, fn: s => s.split('').map(c => map[c] || c).join('') });
  });

  COMBINING_MARKS.forEach(([name, mark, cat]) => {
    styles.push({ name, category: cat, fn: s => [...s].join(mark) });
    const boldMap: Record<string, string> = {};
    const boldChars = [...ALPHA_MAPS[0][1]];
    for (let i = 0; i < BASE.length && i < boldChars.length; i++) boldMap[BASE[i]] = boldChars[i];
    styles.push({
      name: `Bold ${name}`,
      category: cat,
      fn: s => [...s.split('').map(c => boldMap[c] || c).join('')].join(mark),
    });
  });

  WRAP_STYLES.forEach(([name, fn, cat]) => styles.push({ name, category: cat, fn }));

  SEPARATOR_STYLES.forEach(([name, sep, cat]) => {
    styles.push({ name, category: cat, fn: s => s.split('').join(sep) });
    const boldMap: Record<string, string> = {};
    const boldChars = [...ALPHA_MAPS[0][1]];
    for (let i = 0; i < BASE.length && i < boldChars.length; i++) boldMap[BASE[i]] = boldChars[i];
    styles.push({
      name: `Bold ${name}`,
      category: cat,
      fn: s => s.split('').map(c => boldMap[c] || c).join(sep),
    });
  });

  LINE_STYLES.forEach(([name, fn, cat]) => styles.push({ name, category: cat, fn }));
  FLIP_STYLES.forEach(([name, fn, cat]) => styles.push({ name, category: cat, fn }));

  const combinedMarks = COMBINING_MARKS.slice(0, 15);
  const combinedAlphas = ALPHA_MAPS.slice(0, 8);
  combinedAlphas.forEach(([alphaName, chars, cat]) => {
    const arr = [...chars];
    const map: Record<string, string> = {};
    for (let i = 0; i < BASE.length && i < arr.length; i++) map[BASE[i]] = arr[i];
    combinedMarks.forEach(([markName, mark, mcat]) => {
      styles.push({
        name: `${alphaName} ${markName}`,
        category: `${cat} + ${mcat}`,
        fn: s => [...s.split('').map(c => map[c] || c).join('')].join(mark),
      });
    });
  });

  WRAP_STYLES.slice(0, 30).forEach(([name, wrapFn, cat]) => {
    const boldMap: Record<string, string> = {};
    const boldChars = [...ALPHA_MAPS[0][1]];
    for (let i = 0; i < BASE.length && i < boldChars.length; i++) boldMap[BASE[i]] = boldChars[i];
    styles.push({
      name: `Bold ${name}`,
      category: cat,
      fn: s => wrapFn(s.split('').map(c => boldMap[c] || c).join('')),
    });
  });

  return styles;
}

const ALL_STYLES = buildAllStyles();
const CATEGORIES = ['All', 'Favorites', 'Recent', ...Array.from(new Set(ALL_STYLES.map(s => s.category))).sort()];

// ============================================================
// FUNNY TEXT ENGINE
// ============================================================
type FunnyDef = { id: string; label: string; fn: (s: string) => string; emoji: string };

const FUNNY_STYLES: FunnyDef[] = [
  { id: 'mocking', emoji: '😏', label: 'Mocking SpongeBob', fn: s => [...s].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('') },
  { id: 'sarcasm', emoji: '🙄', label: 'Sarcasm Caps', fn: s => s.toUpperCase() },
  { id: 'robot', emoji: '🤖', label: 'Robot', fn: s => s.split('').join('-').replace(/\s/g, '_') },
  { id: 'alien', emoji: '👽', label: 'Alien Speak', fn: s => s.replace(/[aeiou]/gi, c => ({ a: 'α', e: 'ε', i: 'ι', o: 'σ', u: 'υ' }[c.toLowerCase()] || c)) },
  { id: 'pirate', emoji: '🏴‍☠️', label: 'Pirate', fn: s => s.replace(/\byou\b/gi, 'ye').replace(/\byour\b/gi, 'yer').replace(/\bis\b/gi, 'be').replace(/\bare\b/gi, 'be').replace(/\bmy\b/gi, 'me') + ' arrr!' },
  { id: 'uwu', emoji: '🥺', label: 'UwU', fn: s => s.replace(/[rl]/g, 'w').replace(/[RL]/g, 'W').replace(/n([aeiou])/g, 'ny$1').replace(/N([AEIOU])/g, 'NY$1') + ' uwu' },
  { id: 'owo', emoji: '😺', label: 'OwO', fn: s => s.replace(/[rl]/g, 'w').replace(/[RL]/g, 'W') + ' owo' },
  { id: 'cat', emoji: '🐱', label: 'Cat Speak', fn: s => s.replace(/[aeiou]/gi, 'a') + ' nya~' },
  { id: 'dog', emoji: '🐶', label: 'Dog Speak', fn: s => s + ' woof woof! 🐾' },
  { id: 'shout', emoji: '📢', label: 'SHOUTING', fn: s => s.toUpperCase() + '!!!' },
  { id: 'whispery', emoji: '💭', label: 'whispering', fn: s => s.toLowerCase().split(' ').join('... ') + '...' },
  { id: 'stutter', emoji: '😅', label: 'S-s-stutter', fn: s => s.replace(/\b([a-z])/gi, (m, c) => `${c}-${c}`) },
  { id: 'backwards', emoji: '🔄', label: 'Backwards', fn: s => [...s].reverse().join('') },
  { id: 'leet', emoji: '💻', label: '1337 / Leet Speak', fn: s => s.replace(/a/gi, '4').replace(/e/gi, '3').replace(/i/gi, '1').replace(/o/gi, '0').replace(/s/gi, '5').replace(/t/gi, '7') },
  { id: 'zalgofy', emoji: '👾', label: 'Zalgo Glitch', fn: s => [...s].map(c => c + '\u0336\u0301\u0353\u0308').join('') },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow Sparkle', fn: s => `🌈 ✨ ${s} ✨ 🌈` },
  { id: 'angry', emoji: '😡', label: 'Angry', fn: s => s.toUpperCase().split('').join(' ') + '!!! 😡' },
  { id: 'sad', emoji: '😢', label: 'Sad / Soft', fn: s => s.toLowerCase().replace(/\./g, '...') + ' 😢' },
  { id: 'excited', emoji: '🤩', label: 'Excited', fn: s => s.toUpperCase().split(' ').join('!!! ') + '!!!' },
  { id: 'drunk', emoji: '🍺', label: 'Drunk Typing', fn: s => s.replace(/[aeiou]/gi, c => ({ a: 'aa', e: 'ee', i: 'ii', o: 'oo', u: 'uu' }[c.toLowerCase()] || c)) + ' 🍻' },
  { id: 'soviet', emoji: '☭', label: 'Soviet', fn: s => `☭ ${s.toUpperCase()} ☭` },
  { id: 'wizard', emoji: '🧙', label: 'Wizard Spell', fn: s => `✨🪄 ${s.split('').join('·')} 🪄✨` },
  { id: 'zombie', emoji: '🧟', label: 'Zombie', fn: s => s.replace(/[aeiou]/gi, 'rrr') + ' brraaiinnss...' },
  { id: 'vampire', emoji: '🧛', label: 'Vampire', fn: s => `🦇 ${s} 🦇  bluh!` },
  { id: 'princess', emoji: '👑', label: 'Princess', fn: s => `👑💖 ${s} 💖👑` },
  { id: 'gamer', emoji: '🎮', label: 'Gamer', fn: s => `[GG] ${s} [GG]  no scope` },
  { id: 'boomer', emoji: '👴', label: 'OK Boomer', fn: s => s.toUpperCase().split('').join(' ') + '  OK boomer.' },
  { id: 'yoda', emoji: '🧝', label: 'Yoda Speak', fn: s => s.split(' ').reverse().join(' ') + ', hmm yes.' },
];

// ============================================================
// COLOR PALETTE
// ============================================================
const TEXT_COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Lime', value: '#a3e635' },
  { name: 'Rose', value: '#fb7185' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Amber', value: '#fbbf24' },
];

const BG_STYLES = [
  { name: 'None', value: 'transparent' },
  { name: 'Soft Purple', value: 'rgba(139, 92, 246, 0.18)' },
  { name: 'Soft Pink', value: 'rgba(236, 72, 153, 0.18)' },
  { name: 'Soft Cyan', value: 'rgba(6, 182, 212, 0.18)' },
  { name: 'Soft Green', value: 'rgba(16, 185, 129, 0.18)' },
  { name: 'Soft Yellow', value: 'rgba(250, 204, 21, 0.18)' },
  { name: 'Gradient Sunset', value: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { name: 'Gradient Ocean', value: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' },
  { name: 'Gradient Forest', value: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  { name: 'Gradient Royal', value: 'linear-gradient(135deg, #6366f1, #ec4899)' },
  { name: 'Gradient Fire', value: 'linear-gradient(135deg, #ef4444, #fbbf24)' },
  { name: 'Gradient Mint', value: 'linear-gradient(135deg, #a3e635, #14b8a6)' },
];

// ============================================================
// FAQS
// ============================================================
const FAQS = [
  { q: 'What is a fancy text generator?', a: 'A fancy text generator is an online tool that converts ordinary letters into alternative Unicode characters and symbols. Because these alternative letters exist as real characters in the Unicode standard, the resulting text can be copied and pasted anywhere — Instagram bios, Twitter/X posts, Facebook comments, Discord messages, TikTok captions, WhatsApp chats, or YouTube titles.' },
  { q: 'How does this fancy text tool work?', a: 'Type or paste your text into the input box at the top of the page. The tool instantly converts your text into 1000+ styles using mathematical alphanumeric symbols, decorative Unicode blocks, combining diacritical marks, and artistic wrappers. Click any style card to copy it to your clipboard.' },
  { q: 'Is this fancy text generator free?', a: 'Yes, 100% free. There is no signup, no login, no ads, and no character limit. You can generate unlimited fancy text styles every day at no cost.' },
  { q: 'Will fancy text work on Instagram, Twitter/X, Facebook, and TikTok?', a: 'Yes. All of the Unicode characters used here are supported on Instagram, Twitter/X, Facebook, TikTok, Discord, WhatsApp, Telegram, Snapchat, Reddit, Pinterest, YouTube, LinkedIn, and most modern websites.' },
  { q: 'What is the Funny Text dropdown feature?', a: 'The Funny Text dropdown is a special collection of 28 comedic text transformations — including Mocking SpongeBob case, UwU speak, Pirate talk, Leet (1337) speak, Zalgo glitch text, Robot mode, Dog and Cat speak, and more.' },
  { q: 'Can I save my favorite fancy text styles?', a: 'Yes. Click the star icon ☆ on any style card to save it to your Favorites. Favorites are stored locally in your browser so they persist between visits — no account required.' },
  { q: 'Does the text stay the same when I paste it somewhere else?', a: 'In most cases, yes. The fancy text you generate is made of real Unicode characters, so it pastes exactly as shown on any platform that supports Unicode.' },
  { q: 'Can I use the generated text for commercial purposes?', a: 'Yes. You own the text you generate. You can use it in social media posts, bios, product names, usernames, T-shirts, artwork, or anywhere else.' },
  { q: 'Why do some fancy fonts look like squares or boxes?', a: 'If a particular style shows as empty squares (□□□), that means the device or app you are viewing it on does not have a font that supports those specific Unicode characters.' },
  { q: 'Does this tool work offline?', a: 'The generator works offline once the page has loaded, since all transformations run in your browser — no server round-trips.' },
  { q: 'Is there a character limit?', a: 'No! There is no character limit. You can type as much text as you want, in any language — English, Hindi, Arabic, Chinese, Japanese, Korean, Russian, and more.' },
  { q: 'Can I share my fancy text directly to other apps?', a: 'Yes. Every style card includes a Share button. You can toggle "Share as PNG image" ON to send a beautiful colored image with your chosen text color and background — perfect for WhatsApp Stories, Instagram Stories, etc. When OFF (default), Share sends the fancy text as plain text (no colors), which pastes cleanly anywhere. For rich copy-paste with colors, the Copy button places text on the clipboard with HTML formatting so apps like Gmail, Google Docs, Word, and Telegram keep the colors.' },
];

// ============================================================
// OTHER TOOLS
// ============================================================
const OTHER_TOOLS = [
  { icon: '🔤', name: 'Word Counter', desc: 'Count words, characters & sentences', href: '#', color: '#8b5cf6' },
  { icon: '🔠', name: 'Case Converter', desc: 'Convert text to UPPER, lower, Title', href: '#', color: '#ec4899' },
  { icon: '🔡', name: 'Text Reverser', desc: 'Reverse letters, words or lines', href: '#', color: '#06b6d4' },
  { icon: '🔣', name: 'Symbol Picker', desc: 'Copy 1000+ symbols & emojis', href: '#', color: '#10b981' },
  { icon: '📝', name: 'Lorem Ipsum', desc: 'Generate placeholder text', href: '#', color: '#f59e0b' },
  { icon: '🔒', name: 'Password Generator', desc: 'Create strong random passwords', href: '#', color: '#ef4444' },
  { icon: '🔢', name: 'Number to Words', desc: 'Convert numbers into words', href: '#', color: '#6366f1' },
  { icon: '📊', name: 'Text Analyzer', desc: 'Readability & text statistics', href: '#', color: '#14b8a6' },
  { icon: '🌐', name: 'URL Encoder', desc: 'Encode & decode URLs safely', href: '#', color: '#a3e635' },
  { icon: '🔑', name: 'Base64 Tool', desc: 'Encode or decode Base64 strings', href: '#', color: '#fb7185' },
  { icon: '🎨', name: 'Color Picker', desc: 'Pick colors & generate palettes', href: '#', color: '#f97316' },
  { icon: '📅', name: 'Age Calculator', desc: 'Calculate age from date of birth', href: '#', color: '#8b5cf6' },
];

// ============================================================
// HELPERS
// ============================================================

function buildRichHTML(text: string, textColor: string, bgStyle: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const color = textColor === 'inherit' ? '#f0f0ff' : textColor;
  const bg = bgStyle === 'transparent' ? 'transparent' : bgStyle;
  const lines = esc(text).split('\n').join('<br>');
  return `<div style="display:inline-block;padding:14px 20px;border-radius:12px;background:${bg};color:${color};font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:20px;line-height:1.4;white-space:pre-wrap;word-break:break-word;">${lines}</div>`;
}

function buildRTF(text: string, textColor: string, bgStyle: string): string {
  const esc = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\n/g, '\\line ');
  const hex = (c: string) => {
    if (!c || c === 'inherit') return '240;240;255';
    const h = c.replace('#', '');
    if (h.length !== 6) return '240;240;255';
    return `${parseInt(h.slice(0, 2), 16)};${parseInt(h.slice(2, 4), 16)};${parseInt(h.slice(4, 6), 16)}`;
  };
  const [r, g, b] = hex(textColor).split(';');
  let bgHex = 'ffffff';
  if (bgStyle.startsWith('rgba')) {
    bgHex = 'f5f5ff';
  } else if (bgStyle.startsWith('#')) {
    bgHex = bgStyle.slice(1);
  }
  const br = parseInt(bgHex.slice(0, 2), 16) || 245;
  const bgc = parseInt(bgHex.slice(2, 4), 16) || 245;
  const bb = parseInt(bgHex.slice(4, 6), 16) || 255;
  return `{\\rtf1\\ansi\\deff0{\\colortbl ;\\red${r}\\green${g}\\blue${b};\\red${br}\\green${bgc}\\blue${bb};}\\fs40\\cf1 ${esc(text)}}`;
}

async function copyRich(
  text: string,
  html: string,
  rtf: string,
  plainText: string
): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      const items: Record<string, Blob> = {
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      };
      try {
        items['text/rtf'] = new Blob([rtf], { type: 'text/rtf' });
      } catch {}
      await navigator.clipboard.write([new ClipboardItem(items)]);
      return true;
    }
  } catch {}
  try {
    const el = document.createElement('div');
    el.contentEditable = 'true';
    el.innerHTML = html;
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    document.body.appendChild(el);
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    const ok = document.execCommand('copy');
    sel?.removeAllRanges();
    document.body.removeChild(el);
    if (ok) return true;
  } catch {}
  try {
    await navigator.clipboard.writeText(plainText);
    return true;
  } catch {
    return false;
  }
}

// FIXED: canvas PNG render — bigger fonts, higher resolution, readable without zoom
async function renderStyledToPNG(
  text: string,
  opts: {
    textColor: string;
    bgStyle: string;
    fontFamily: string;
    align: 'left' | 'center' | 'right';
  }
): Promise<Blob | null> {
  try {
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      await (document as any).fonts.ready;
    }
  } catch {}

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Bigger canvas + higher DPR → crisp, large readable text
  const dpr = Math.min(Math.max(window.devicePixelRatio || 2, 2), 3);
  const padding = 80;
  const baseFontSize = 96; // much bigger than before (was 36)
  const fontStack = `800 ${baseFontSize}px '${opts.fontFamily}', 'Segoe UI', system-ui, -apple-system, sans-serif`;

  ctx.font = fontStack;

  const lines = text.split('\n');
  let maxLineWidth = 400;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxLineWidth) maxLineWidth = w;
  }

  // Wider max so long lines don't get squeezed too small
  const minWidth = 720;
  const maxWidth = 2400;
  const width = Math.min(Math.max(maxLineWidth + padding * 2, minWidth), maxWidth);
  const lineGap = 1.25;
  const height = Math.max(lines.length * baseFontSize * lineGap + padding * 2, 320);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);

  const bg = opts.bgStyle === 'transparent' ? '#0a0a1a' : opts.bgStyle;
  const isGradient = bg.startsWith('linear-gradient');
  const radius = 32;

  ctx.save();
  ctx.beginPath();
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(r, 0);
  ctx.lineTo(width - r, 0);
  ctx.quadraticCurveTo(width, 0, width, r);
  ctx.lineTo(width, height - r);
  ctx.quadraticCurveTo(width, height, width - r, height);
  ctx.lineTo(r, height);
  ctx.quadraticCurveTo(0, height, 0, height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();

  if (isGradient) {
    const m = bg.match(/linear-gradient\(\s*(-?\d+(?:\.\d+)?)deg\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
    if (m) {
      const deg = parseFloat(m[1]);
      const c1 = m[2].trim();
      const c2 = m[3].trim();
      const angle = ((deg - 90) * Math.PI) / 180;
      const cx = width / 2;
      const cy = height / 2;
      const half = Math.max(width, height);
      const x1 = cx - Math.cos(angle) * half;
      const y1 = cy - Math.sin(angle) * half;
      const x2 = cx + Math.cos(angle) * half;
      const y2 = cy + Math.sin(angle) * half;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#0a0a1a';
    }
  } else {
    ctx.fillStyle = bg;
  }
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.fillStyle = opts.textColor === 'inherit' ? '#f0f0ff' : opts.textColor;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  // Auto-shrink only if the text is really long — never below 40px (still readable)
  let currentFontSize = baseFontSize;
  const minFontSize = 40;
  const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), '');
  ctx.font = `800 ${currentFontSize}px '${opts.fontFamily}', 'Segoe UI', system-ui, -apple-system, sans-serif`;
  while (
    ctx.measureText(longestLine).width > width - padding * 2 &&
    currentFontSize > minFontSize
  ) {
    currentFontSize -= 2;
    ctx.font = `800 ${currentFontSize}px '${opts.fontFamily}', 'Segoe UI', system-ui, -apple-system, sans-serif`;
  }

  const finalLineH = currentFontSize * lineGap;
  const totalTextH = lines.length * finalLineH;
  const startY = (height - totalTextH) / 2 + finalLineH / 2;

  lines.forEach((line, i) => {
    const lineW = ctx.measureText(line).width;
    const x =
      opts.align === 'left'
        ? padding
        : opts.align === 'right'
        ? width - padding - lineW
        : (width - lineW) / 2;
    ctx.fillText(line, x, startY + i * finalLineH);
  });

  return new Promise(res => {
    canvas.toBlob(b => res(b), 'image/png', 1.0);
  });
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Page() {
  const [input, setInput] = useState('Hello World');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toast, setToast] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(16);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [showToolbar, setShowToolbar] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const [funnyId, setFunnyId] = useState(FUNNY_STYLES[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [textColor, setTextColor] = useState(TEXT_COLORS[0].value);
  const [bgStyle, setBgStyle] = useState(BG_STYLES[0].value);
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showFancy, setShowFancy] = useState(true);
  const [showFunny, setShowFunny] = useState(true);
  const [styleSearch, setStyleSearch] = useState('');

  // NEW: user-controlled "share as PNG" toggle (default OFF → shares fancy text)
  const [shareAsPNG, setShareAsPNG] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fancyRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    const favs = localStorage.getItem('favs');
    if (favs) try { setFavorites(JSON.parse(favs)); } catch {}
    const rec = localStorage.getItem('recent');
    if (rec) try { setRecent(JSON.parse(rec)); } catch {}
    const savedPNG = localStorage.getItem('shareAsPNG');
    if (savedPNG !== null) setShareAsPNG(savedPNG === 'true');
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

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('recent', JSON.stringify(recent));
  }, [recent, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('shareAsPNG', String(shareAsPNG));
  }, [shareAsPNG, mounted]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  const copy = useCallback(
    async (text: string, label: string) => {
      const hasStyle = textColor !== 'inherit' || bgStyle !== 'transparent';
      if (hasStyle) {
        const html = buildRichHTML(text, textColor, bgStyle);
        const rtf = buildRTF(text, textColor, bgStyle);
        const ok = await copyRich(text, html, rtf, text);
        if (ok) {
          showToast(`✓ ${label} copied!`);
        } else {
          showToast('✓ Copied!');
        }
      } else {
        try {
          await navigator.clipboard.writeText(text);
          showToast(`✓ ${label} copied!`);
        } catch {
          showToast('Copy failed');
        }
      }
      setCopiedStyle(label);
      setTimeout(() => setCopiedStyle(null), 1400);
    },
    [showToast, textColor, bgStyle]
  );

  // UPDATED: share respects user's shareAsPNG toggle
  const shareStyled = useCallback(
    async (text: string, label: string) => {
      try {
        // When user enabled "Share as PNG" → render image with colors
        if (shareAsPNG) {
          const blob = await renderStyledToPNG(text, {
            textColor,
            bgStyle,
            fontFamily,
            align,
          });

          if (blob) {
            const file = new File([blob], `fancy-text-${Date.now()}.png`, { type: 'image/png' });

            if (
              typeof navigator !== 'undefined' &&
              typeof (navigator as any).canShare === 'function' &&
              (navigator as any).canShare({ files: [file] }) &&
              typeof navigator.share === 'function'
            ) {
              try {
                await navigator.share({
                  title: 'Fancy Text',
                  text: label,
                  files: [file],
                });
                showToast('✓ Shared styled image!');
                return;
              } catch (err: any) {
                if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
                  return;
                }
              }
            }

            // Fallback: download the PNG
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fancy-text-${label.replace(/\s+/g, '-').toLowerCase()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showToast('✓ Saved as PNG image');
            return;
          }
        }

        // Default: share fancy text as plain text (no colors)
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
          await navigator.share({ title: 'Fancy Text', text });
          showToast('✓ Shared!');
        } else {
          await copy(text, label);
        }
      } catch {
        // silent
      }
    },
    [shareAsPNG, bgStyle, textColor, fontFamily, align, copy, showToast]
  );

  const toggleFav = useCallback((name: string) => {
    setFavorites(p => (p.includes(name) ? p.filter(n => n !== name) : [...p, name]));
  }, []);

  const addRecent = useCallback((name: string) => {
    setRecent(p => [name, ...p.filter(n => n !== name)].slice(0, 12));
  }, []);

  const applyTransform = useCallback((type: string) => {
    setInput(prev => {
      const s = prev;
      switch (type) {
        case 'upper': return s.toUpperCase();
        case 'lower': return s.toLowerCase();
        case 'title': return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        case 'sentence': return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        case 'camel': return s.trim().split(/[\s_\-.]+/).filter(Boolean).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        case 'pascal': return s.trim().split(/[\s_\-.]+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        case 'snake': return s.trim().replace(/\s+/g, '_').toLowerCase();
        case 'kebab': return s.trim().replace(/\s+/g, '-').toLowerCase();
        case 'constant': return s.trim().replace(/\s+/g, '_').toUpperCase();
        case 'reverse': return [...s].reverse().join('');
        case 'trim': return s.replace(/^\s+|\s+$/g, '');
        case 'clearSpaces': return s.replace(/[ \t]+/g, ' ').replace(/^\s+|\s+$/g, '');
        case 'removeSpaces': return s.replace(/[ \t]+/g, '');
        case 'removeLineBreaks': return s.replace(/[\r\n]+/g, ' ').replace(/^\s+|\s+$/g, '');
        case 'removeNumbers': return s.replace(/[0-9]/g, '');
        case 'removePunctuation': return s.replace(/[!-\/:-@\[-`{-~]/g, '');
        case 'removeExtraDots': return s.replace(/\.{2,}/g, '.');
        case 'toggleCase': return [...s].map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
        case 'alternateCase': return [...s].map((c, i) => i % 2 ? c.toLowerCase() : c.toUpperCase()).join('');
        case 'duplicateWords': return s.split(/\s+/).filter(Boolean).map(w => `${w} ${w}`).join(' ');
        case 'duplicateChars': return [...s].map(c => c === ' ' ? ' ' : `${c}${c}`).join('');
        default: return prev;
      }
    });
    showToast('✓ Applied');
  }, [showToast]);

  const clearAll = useCallback(() => {
    setInput('');
    setBold(false); setItalic(false); setUnderline(false); setUppercase(false);
    setFontSize(16); setLetterSpacing(0); setLineHeight(1.4); setAlign('left');
    setFontFamily('Inter');
    setTextColor(TEXT_COLORS[0].value);
    setBgStyle(BG_STYLES[0].value);
    showToast('✓ Cleared');
  }, [showToast]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      let pastedText = '';
      let detectedColor: string | null = null;
      let detectedBg: string | null = null;

      if (navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            if (item.types.includes('text/html')) {
              const blob = await item.getType('text/html');
              const html = await blob.text();
              const temp = document.createElement('div');
              temp.innerHTML = html;
              pastedText = (temp.textContent || '').trim();
              const styled = temp.querySelector('[style*="color"]') || temp.querySelector('span');
              if (styled) {
                const cs = (styled as HTMLElement).style.color;
                if (cs) {
                  const m = cs.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
                  if (m) {
                    const hex = '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join('');
                    const found = TEXT_COLORS.find(c => c.value.toLowerCase() === hex.toLowerCase());
                    if (found) detectedColor = found.value;
                  }
                }
                const bs = (styled as HTMLElement).style.background;
                if (bs) {
                  const found = BG_STYLES.find(b => b.value.toLowerCase() === bs.toLowerCase());
                  if (found) detectedBg = found.value;
                }
              }
              if (pastedText) break;
            }
          }
        } catch {}
      }

      if (!pastedText) {
        pastedText = await navigator.clipboard.readText();
      }

      if (detectedColor) setTextColor(detectedColor);
      if (detectedBg) setBgStyle(detectedBg);

      const ta = textareaRef.current;
      if (ta) {
        const start = ta.selectionStart ?? input.length;
        const end = ta.selectionEnd ?? input.length;
        const before = input.slice(0, start);
        const after = input.slice(end);
        const next = before + pastedText + after;
        setInput(next);
        requestAnimationFrame(() => {
          try {
            const newPos = start + pastedText.length;
            ta.focus();
            ta.setSelectionRange(newPos, newPos);
          } catch {}
        });
      } else {
        setInput(prev => prev + pastedText);
      }

      showToast(
        detectedColor || detectedBg ? '✓ Pasted with style!' : '✓ Pasted'
      );
    } catch {
      showToast('Paste failed');
    }
  }, [showToast, input]);

  const download = useCallback(() => {
    const blob = new Blob([input], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fancy-text.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Downloaded');
  }, [input, showToast]);

  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const scrollToFancy = useCallback(() => {
    if (fancyRef.current) {
      fancyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const el = document.getElementById('styles');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const currentFunny = useMemo(
    () => FUNNY_STYLES.find(f => f.id === funnyId) || FUNNY_STYLES[0],
    [funnyId]
  );
  const funnyOutput = useMemo(() => currentFunny.fn(input || 'Hello'), [currentFunny, input]);

  const inputPreviewStyle: React.CSSProperties = {
    fontFamily: `'${fontFamily}', system-ui, sans-serif`,
    fontSize: `${fontSize}px`,
    fontWeight: bold ? 800 : 400,
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: underline ? 'underline' : 'none',
    textTransform: uppercase ? 'uppercase' : 'none',
    textAlign: align,
    letterSpacing: `${letterSpacing}px`,
    lineHeight,
    color: textColor === 'inherit' ? undefined : textColor,
    background: bgStyle === 'transparent' ? undefined : bgStyle,
  };

  const filteredStyles = useMemo(() => {
    const q = (styleSearch || search).toLowerCase().trim();
    return ALL_STYLES.filter(s => {
      if (category === 'Favorites' && !favorites.includes(s.name)) return false;
      if (category === 'Recent' && !recent.includes(s.name)) return false;
      if (category !== 'All' && category !== 'Favorites' && category !== 'Recent' && s.category !== category) return false;
      if (q) {
        return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [category, search, styleSearch, favorites, recent]);

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#07071a' }} />;

  return (
    <>
      <Head>
        <title>Fancy Text Generator — 1000+ Stylish Fonts, Funny Text & Cool Unicode Styles (Free)</title>
        <meta name="description" content="Free fancy text generator with 1000+ stylish fonts, funny text styles, and cool Unicode characters. Instantly copy & paste fancy letters for Instagram, TikTok, Discord, Twitter/X, WhatsApp bios & posts." />
        <meta name="keywords" content="fancy text, fancy text generator, stylish text, cool fonts, unicode text, instagram fonts, fancy letters, text styles, copy paste fonts, funny text generator, mocking spongebob text, uwu text, zalgo text, leet speak, bubble text, cursive text, aesthetic fonts" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={theme === 'dark' ? '#07071a' : '#f5f5ff'} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="FancyText Generator" />
        <meta property="og:title" content="Fancy Text Generator — 1000+ Stylish & Funny Text Styles" />
        <meta property="og:description" content="Transform text into 1000+ fancy fonts and funny styles instantly. Free, fast, no signup." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://example.com/fancy-text" />
        <meta property="og:site_name" content="FancyText Generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://example.com/fancy-text" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebApplication',
          name: 'Fancy Text Generator', url: 'https://example.com/fancy-text',
          applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '1284' },
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({
            '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        })}} />
      </Head>

      <div className="app">
        <div className="bg-gradient" aria-hidden />
        <div className="bg-grid" aria-hidden />
        <div className="bg-blobs" aria-hidden>
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="blob blob-4" />
        </div>

        <header className="header">
          <div className="header-inner glass">
            <div className="logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">
                <span className="logo-char">F</span>
                <span className="logo-char">a</span>
                <span className="logo-char">n</span>
                <span className="logo-char">c</span>
                <span className="logo-char">y</span>
                <span className="logo-char grad-text">T</span>
                <span className="logo-char grad-text">e</span>
                <span className="logo-char grad-text">x</span>
                <span className="logo-char grad-text">t</span>
              </span>
              <span className="logo-badge">{ALL_STYLES.length}+</span>
            </div>
            <nav className="header-nav" aria-label="Primary">
              <a href="#styles" className="nav-link" title="Jump to styles section">Styles</a>
              <a href="#funny" className="nav-link" title="Jump to funny text">Funny</a>
              <a href="#how-to" className="nav-link" title="How to use this tool">How to Use</a>
              <a href="#faq" className="nav-link" title="Frequently asked questions">FAQ</a>
              <a href="#tools" className="nav-link" title="Other useful tools">Tools</a>
            </nav>
            <div className="header-actions">
              <button
                className="icon-btn down-arrow"
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
                title="Jump to bottom of page"
                data-tooltip="Jump to bottom"
              >
                ⬇
              </button>
              <button
                className="icon-btn"
                onClick={() => setShowToolbar(v => !v)}
                aria-label="Toggle formatting toolbar"
                title="Toggle formatting toolbar"
                data-tooltip={showToolbar ? 'Hide toolbar' : 'Show formatting toolbar'}
              >
                {showToolbar ? '▼' : '⚙️'}
              </button>
              <button
                className="icon-btn"
                onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle theme"
                title="Toggle dark/light theme"
                data-tooltip={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        <main className="main">
          <section className="hero">
            <div className="hero-pill glass">🚀 {ALL_STYLES.length}+ styles · 28 funny modes · No signup</div>
            <h1 className="hero-title">1000+ <span className="grad-text">Fancy Text</span> &amp; Funny Text Generator</h1>
            <p className="hero-sub">
              Type once · Copy any style · Paste anywhere. Works with Instagram, TikTok, Discord, WhatsApp, Twitter/X, Facebook &amp; more.
            </p>
          </section>

          <section className="panel glass" id="styles">
            <div className="panel-head">
              <div className="panel-tabs" role="tablist">
                <button role="tab" aria-selected={!showToolbar} className={`panel-tab ${!showToolbar ? 'active' : ''}`} onClick={() => setShowToolbar(false)} title="Browse styles">✨ Styles</button>
                <button role="tab" aria-selected={showToolbar} className={`panel-tab ${showToolbar ? 'active' : ''}`} onClick={() => setShowToolbar(true)} title="Open formatting toolbar">⚙️ Toolbar</button>
              </div>
            </div>

            <div className="input-wrap">
              <label htmlFor="input" className="sr-only">Enter your text</label>
              <textarea
                id="input"
                ref={textareaRef}
                className="input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type or paste your text here... (no character limit)"
                rows={3}
                style={inputPreviewStyle}
                spellCheck={false}
                data-tooltip="Type your text here — no character limit"
              />
              <div className="input-meta">
                <span className="count">{input.length} characters · no limit</span>
                <div className="input-actions">
                  <button className="mini-btn" onClick={pasteFromClipboard} title="Paste from clipboard" data-tooltip="Paste from clipboard">📥 Paste</button>
                  <button className="mini-btn" onClick={() => copy(input, 'Text')} title="Copy text" data-tooltip="Copy">📋 Copy</button>
                  <button className="mini-btn" onClick={download} title="Download as .txt" data-tooltip="Download as .txt file">💾 Save</button>
                  <button className="mini-btn danger" onClick={clearAll} title="Clear everything" data-tooltip="Clear all text and styles">🗑 Clear</button>
                </div>
              </div>
            </div>

            <div className="color-panel-wrap">
              <button
                className={`color-toggle ${showColorPanel ? 'on' : ''}`}
                onClick={() => setShowColorPanel(v => !v)}
                aria-expanded={showColorPanel}
                title="Open color & background picker"
                data-tooltip="Pick text color & background"
              >
                🎨 Color &amp; Background {showColorPanel ? '▲' : '▼'}
              </button>

              {showColorPanel && (
                <div className="color-panel">
                  <div className="color-section">
                    <span className="color-label">Text Color</span>
                    <div className="color-grid">
                      {TEXT_COLORS.map(c => (
                        <button
                          key={c.name}
                          className={`color-swatch ${textColor === c.value ? 'active' : ''}`}
                          onClick={() => setTextColor(c.value)}
                          title={c.name}
                          aria-label={`Text color ${c.name}`}
                          data-tooltip={c.name}
                          style={{ background: c.value === 'inherit' ? 'var(--fg)' : c.value }}
                        >
                          {textColor === c.value && <span className="swatch-check">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="color-section">
                    <span className="color-label">Background Style</span>
                    <div className="bg-grid-colors">
                      {BG_STYLES.map(b => (
                        <button
                          key={b.name}
                          className={`bg-swatch ${bgStyle === b.value ? 'active' : ''}`}
                          onClick={() => setBgStyle(b.value)}
                          title={b.name}
                          data-tooltip={b.name}
                        >
                          <span className="bg-swatch-preview" style={{ background: b.value === 'transparent' ? 'repeating-conic-gradient(rgba(255,255,255,.1) 0 25%, transparent 0 50%) 50%/10px 10px' : b.value }} />
                          <span className="bg-swatch-name">{b.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="color-section">
                    <div className="copy-hint" role="note">
                      💡 <strong>Tip:</strong> Rich colors work when pasting into Gmail, Google Docs, Word, Telegram &amp; similar apps. <strong>WhatsApp chat does not support colored text</strong> — turn ON <strong>Share as PNG image</strong> below to send a styled image instead.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showToolbar && (
              <div className="toolbar">
                <div className="tool-group">
                  <span className="tool-label">Case</span>
                  <button className="tool-btn" onClick={() => applyTransform('upper')} title="UPPERCASE" data-tooltip="UPPERCASE">AA</button>
                  <button className="tool-btn" onClick={() => applyTransform('lower')} title="lowercase" data-tooltip="lowercase">aa</button>
                  <button className="tool-btn" onClick={() => applyTransform('title')} title="Title Case" data-tooltip="Title Case">Aa</button>
                  <button className="tool-btn" onClick={() => applyTransform('sentence')} title="Sentence case" data-tooltip="Sentence case">A.</button>
                  <button className="tool-btn" onClick={() => applyTransform('toggleCase')} title="tOGGLE cASE" data-tooltip="tOGGLE cASE">tG</button>
                  <button className="tool-btn" onClick={() => applyTransform('alternateCase')} title="aLtErNaTiNg" data-tooltip="aLtErNaTiNg CaSe">aA</button>
                </div>

                <div className="tool-group">
                  <span className="tool-label">Naming</span>
                  <button className="tool-btn" onClick={() => applyTransform('camel')} title="camelCase" data-tooltip="camelCase">cC</button>
                  <button className="tool-btn" onClick={() => applyTransform('pascal')} title="PascalCase" data-tooltip="PascalCase">PC</button>
                  <button className="tool-btn" onClick={() => applyTransform('snake')} title="snake_case" data-tooltip="snake_case">s_s</button>
                  <button className="tool-btn" onClick={() => applyTransform('kebab')} title="kebab-case" data-tooltip="kebab-case">k-k</button>
                  <button className="tool-btn" onClick={() => applyTransform('constant')} title="CONSTANT_CASE" data-tooltip="CONSTANT_CASE">C_C</button>
                </div>

                <div className="tool-group">
                  <span className="tool-label">Cleanup</span>
                  <button className="tool-btn" onClick={() => applyTransform('trim')} title="Trim leading/trailing spaces" data-tooltip="Trim spaces at edges">✂</button>
                  <button className="tool-btn" onClick={() => applyTransform('clearSpaces')} title="Collapse multiple spaces into one" data-tooltip="Collapse multiple spaces">␣</button>
                  <button className="tool-btn" onClick={() => applyTransform('removeSpaces')} title="Remove all spaces" data-tooltip="Remove ALL spaces">∅</button>
                  <button className="tool-btn" onClick={() => applyTransform('removeLineBreaks')} title="Remove all line breaks" data-tooltip="Remove line breaks">↵</button>
                  <button className="tool-btn" onClick={() => applyTransform('removeNumbers')} title="Remove all digits 0-9" data-tooltip="Remove numbers">1x</button>
                  <button className="tool-btn" onClick={() => applyTransform('removePunctuation')} title="Remove all punctuation marks" data-tooltip="Remove punctuation">!x</button>
                  <button className="tool-btn" onClick={() => applyTransform('removeExtraDots')} title="Collapse multiple dots into one" data-tooltip="Collapse ... into .">..</button>
                </div>

                <div className="tool-group">
                  <span className="tool-label">Fun</span>
                  <button className="tool-btn" onClick={() => applyTransform('reverse')} title="Reverse the entire text" data-tooltip="Reverse text">⇋</button>
                  <button className="tool-btn" onClick={() => applyTransform('duplicateWords')} title="Duplicate every word" data-tooltip="Duplicate words">ww</button>
                  <button className="tool-btn" onClick={() => applyTransform('duplicateChars')} title="Duplicate every character" data-tooltip="Duplicate characters">cc</button>
                </div>

                <div className="tool-group">
                  <span className="tool-label">Format</span>
                  <button className={`tool-btn ${bold ? 'on' : ''}`} onClick={() => setBold(v => !v)} title="Toggle Bold" data-tooltip="Bold"><b>B</b></button>
                  <button className={`tool-btn ${italic ? 'on' : ''}`} onClick={() => setItalic(v => !v)} title="Toggle Italic" data-tooltip="Italic"><i>I</i></button>
                  <button className={`tool-btn ${underline ? 'on' : ''}`} onClick={() => setUnderline(v => !v)} title="Toggle Underline" data-tooltip="Underline"><u>U</u></button>
                  <button className={`tool-btn ${uppercase ? 'on' : ''}`} onClick={() => setUppercase(v => !v)} title="Toggle Uppercase display" data-tooltip="Uppercase display">A↑</button>
                </div>

                <div className="tool-group">
                  <span className="tool-label">Align</span>
                  <button className={`tool-btn ${align === 'left' ? 'on' : ''}`} onClick={() => setAlign('left')} title="Align left" data-tooltip="Align left">⯇</button>
                  <button className={`tool-btn ${align === 'center' ? 'on' : ''}`} onClick={() => setAlign('center')} title="Align center" data-tooltip="Align center">≡</button>
                  <button className={`tool-btn ${align === 'right' ? 'on' : ''}`} onClick={() => setAlign('right')} title="Align right" data-tooltip="Align right">⯈</button>
                </div>

                <div className="tool-group">
                  <span className="tool-label">Font</span>
                  <select className="tool-select" value={fontFamily} onChange={e => setFontFamily(e.target.value)} title="Choose font family" data-tooltip="Font family">
                    <option>Inter</option><option>Arial</option><option>Georgia</option>
                    <option>Courier New</option><option>Verdana</option>
                    <option>Times New Roman</option><option>Comic Sans MS</option>
                    <option>Trebuchet MS</option><option>Impact</option>
                  </select>
                </div>

                <div className="tool-group">
                  <span className="tool-label">Size: {fontSize}px</span>
                  <input type="range" min={12} max={32} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="tool-range" title="Font size" data-tooltip="Font size" />
                </div>

                <div className="tool-group">
                  <span className="tool-label">Spacing: {letterSpacing}px</span>
                  <input type="range" min={0} max={10} value={letterSpacing} onChange={e => setLetterSpacing(+e.target.value)} className="tool-range" title="Letter spacing" data-tooltip="Letter spacing" />
                </div>

                <div className="tool-group">
                  <span className="tool-label">Line: {lineHeight.toFixed(1)}</span>
                  <input type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)} className="tool-range" title="Line height" data-tooltip="Line height" />
                </div>
              </div>
            )}

            {!showToolbar && (
              <div className="filters">
                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    className="search"
                    placeholder="Search 1000+ styles by name or category..."
                    value={styleSearch}
                    onChange={e => setStyleSearch(e.target.value)}
                    aria-label="Search fancy text styles"
                    title="Search styles"
                    data-tooltip="Search styles by name or category"
                  />
                  {styleSearch && (
                    <button className="search-clear" onClick={() => setStyleSearch('')} aria-label="Clear search" title="Clear search" data-tooltip="Clear search">×</button>
                  )}
                </div>
                <div className="chips" role="tablist">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={category === cat}
                      className={`chip ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                      title={`Filter by ${cat}`}
                      data-tooltip={`Show ${cat} styles`}
                    >
                      {cat === 'Favorites' ? `⭐ ${cat} (${favorites.length})` :
                       cat === 'Recent' ? `🕐 ${cat} (${recent.length})` : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ===== SHARE AS PNG TOGGLE ===== */}
          <section className="share-toggle-panel glass">
            <label className="share-toggle" data-tooltip={shareAsPNG ? 'Sharing as image (colors kept)' : 'Sharing as fancy text'}>
              <input
                type="checkbox"
                checked={shareAsPNG}
                onChange={e => setShareAsPNG(e.target.checked)}
                aria-label="Share as PNG image"
              />
              <span className="share-toggle-track">
                <span className="share-toggle-thumb" />
              </span>
              <span className="share-toggle-text">
                <span className="share-toggle-title">
                  {shareAsPNG ? '🖼️ Share as PNG image' : '📝 Share as fancy text'}
                </span>
                <span className="share-toggle-sub">
                  {shareAsPNG
                    ? 'Share button will send a big, colored image with your text color & background'
                    : 'Share button will send the fancy text only (no colors) — paste it anywhere'}
                </span>
              </span>
            </label>
          </section>

          {!showToolbar && (
            <>
              <section className="section-head">
                <h2 className="section-title">
                  <span>✨ Fancy Text Styles</span>
                </h2>
                <button
                  className={`toggle-section-btn ${showFancy ? 'on' : ''}`}
                  onClick={() => setShowFancy(v => !v)}
                  aria-expanded={showFancy}
                  title={showFancy ? 'Hide fancy text section' : 'Show fancy text section'}
                  data-tooltip={showFancy ? 'Hide fancy styles' : 'Show fancy styles'}
                >
                  {showFancy ? '👁 Hide' : '👁 Show'}
                </button>
              </section>

              {showFancy && (
                <>
                  <div className="stats">
                    <span><strong>{ALL_STYLES.length}+</strong> styles</span>
                    <span className="dot">•</span>
                    <span><strong>{filteredStyles.length}</strong> showing</span>
                    <span className="dot">•</span>
                    <span><strong>{favorites.length}</strong> favorites</span>
                    <span className="dot">•</span>
                    <span><strong>{CATEGORIES.length - 3}</strong> categories</span>
                  </div>

                  <section className="grid" aria-label="Fancy text styles" ref={fancyRef}>
                    {filteredStyles.length === 0 ? (
                      <div className="empty glass">
                        <div className="empty-icon">✨</div>
                        <p>No styles match your search</p>
                        <button className="mini-btn accent" onClick={() => { setSearch(''); setStyleSearch(''); setCategory('All'); }}>Reset filters</button>
                      </div>
                    ) : (
                      filteredStyles.map((style, i) => {
                        const output = style.fn(input || 'Hello');
                        const isFav = favorites.includes(style.name);
                        const isCopied = copiedStyle === style.name;
                        return (
                          <article key={style.name + i} className="card glass" style={{ animationDelay: `${Math.min(i * 4, 400)}ms` }}>
                            <div className="card-head">
                              <span className="card-label" title={style.category}>{style.name}</span>
                              <button
                                className={`fav-btn ${isFav ? 'on' : ''}`}
                                onClick={() => toggleFav(style.name)}
                                aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                data-tooltip={isFav ? 'Remove from favorites' : 'Add to favorites'}
                              >{isFav ? '★' : '☆'}</button>
                            </div>
                            <div
                              className={`card-output ${isCopied ? 'copied' : ''}`}
                              onClick={() => { copy(output, style.name); addRecent(style.name); }}
                              title="Click to copy"
                              data-tooltip="Click to copy"
                              style={{
                                color: textColor === 'inherit' ? undefined : textColor,
                                background: bgStyle === 'transparent' ? undefined : bgStyle,
                              }}
                            >
                              {output}
                            </div>
                            <div className="card-actions">
                              <button
                                className={`card-btn ${isCopied ? 'copied' : ''}`}
                                onClick={() => { copy(output, style.name); addRecent(style.name); }}
                                title="Copy"
                                data-tooltip="Copy"
                              >
                                {isCopied ? '✓ Copied!' : '📋 Copy'}
                              </button>
                              <button
                                className="card-btn"
                                onClick={() => shareStyled(output, style.name)}
                                title={shareAsPNG ? 'Share as PNG image' : 'Share fancy text'}
                                data-tooltip={shareAsPNG ? 'Share as PNG image' : 'Share fancy text'}
                              >
                                {shareAsPNG ? '🖼️ Share PNG' : '🔗 Share'}
                              </button>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </section>
                </>
              )}
            </>
          )}

          <section className="section-head">
            <h2 className="section-title">
              <span>😂 Funny Text Generator</span>
            </h2>
            <button
              className={`toggle-section-btn pulse ${showFunny ? 'on' : ''}`}
              onClick={() => setShowFunny(v => !v)}
              aria-expanded={showFunny}
              title={showFunny ? 'Hide funny text section' : 'Show funny text section'}
              data-tooltip={showFunny ? 'Hide funny styles' : 'Show funny styles'}
            >
              {showFunny ? '👁 Hide' : '👁 Show'}
            </button>
          </section>

          {showFunny && (
            <section className="panel glass funny-panel" id="funny">
              <div className="funny-head">
                <div>
                  <h3 className="funny-title">Pick a comedic style from the dropdown</h3>
                  <p className="funny-sub">Your text instantly transforms — try them all!</p>
                </div>
                <div className="funny-select-wrap">
                  <label htmlFor="funny-select" className="sr-only">Choose a funny style</label>
                  <select
                    id="funny-select"
                    className="funny-select"
                    value={funnyId}
                    onChange={e => setFunnyId(e.target.value)}
                    title="Choose a funny style"
                    data-tooltip="Choose a funny style"
                  >
                    {FUNNY_STYLES.map(f => (
                      <option key={f.id} value={f.id}>{f.emoji}  {f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="funny-preview">
                <div className="funny-preview-label">
                  <span className="funny-emoji">{currentFunny.emoji}</span>
                  <span>{currentFunny.label}</span>
                </div>
                <div
                  className={`funny-output ${copiedStyle === 'Funny' ? 'copied' : ''}`}
                  onClick={() => copy(funnyOutput, 'Funny')}
                  title="Click to copy"
                  data-tooltip="Click to copy"
                  style={{
                    color: textColor === 'inherit' ? undefined : textColor,
                    background: bgStyle === 'transparent' ? undefined : bgStyle,
                  }}
                >
                  {funnyOutput}
                </div>
                <div className="funny-actions">
                  <button
                    className={`card-btn ${copiedStyle === 'Funny' ? 'copied' : ''}`}
                    onClick={() => copy(funnyOutput, 'Funny')}
                    title="Copy"
                    data-tooltip="Copy"
                  >
                    {copiedStyle === 'Funny' ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button
                    className="card-btn"
                    onClick={() => shareStyled(funnyOutput, 'Funny')}
                    title={shareAsPNG ? 'Share as PNG image' : 'Share fancy text'}
                    data-tooltip={shareAsPNG ? 'Share as PNG image' : 'Share fancy text'}
                  >
                    {shareAsPNG ? '🖼️ Share PNG' : '🔗 Share'}
                  </button>
                  <button className="card-btn" onClick={() => {
                    const nextIdx = (FUNNY_STYLES.findIndex(f => f.id === funnyId) + 1) % FUNNY_STYLES.length;
                    setFunnyId(FUNNY_STYLES[nextIdx].id);
                  }} title="Random funny style" data-tooltip="Random style">🎲 Random</button>
                </div>
              </div>

              <div className="funny-grid">
                {FUNNY_STYLES.map(f => (
                  <button
                    key={f.id}
                    className={`funny-chip ${funnyId === f.id ? 'active' : ''}`}
                    onClick={() => setFunnyId(f.id)}
                    title={f.label}
                    data-tooltip={f.label}
                  >
                    <span className="funny-chip-emoji">{f.emoji}</span>
                    <span className="funny-chip-label">{f.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="content glass" id="how-to">
            <h2>How to Use the Fancy Text Generator (Step-by-Step)</h2>
            <p>
              Our <strong>fancy text generator</strong> is designed to be the fastest, most powerful tool of its kind. Whether you&apos;re looking for a <em>cursive Instagram bio</em>, a <em>bold Discord nickname</em>, a <em>funny TikTok caption</em>, or a <em>glitched gaming username</em>, you&apos;ll find a fitting style in under three seconds.
            </p>
            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <h3>Type or paste your text</h3>
                <p>Enter your text in the input box — there is <strong>no character limit</strong>. Every keystroke regenerates all 1000+ styles in real time. Use 📥 <strong>Paste</strong> to pull from clipboard — even colored text keeps its color!</p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h3>Pick a style or a funny mode</h3>
                <p>Browse the searchable style gallery by category, or open the <strong>Funny Text dropdown</strong> for 28 comedic transformations like Mocking SpongeBob, UwU, Pirate, Leet, Zalgo, and Robot.</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h3>Customize color &amp; background</h3>
                <p>Open the 🎨 <strong>Color &amp; Background</strong> panel to pick from 16 text colors and 12 background styles (including gradients).</p>
              </div>
              <div className="step">
                <div className="step-num">4</div>
                <h3>Choose how you want to share</h3>
                <p>Use the <strong>Share as PNG image</strong> toggle above the styles grid. When <em>ON</em>, the Share button sends a big, colorful image with your text color and background — perfect for WhatsApp, Instagram Stories, etc. When <em>OFF</em> (default), Share sends just the fancy text with no colors.</p>
              </div>
              <div className="step">
                <div className="step-num">5</div>
                <h3>Fine-tune with the toolbar</h3>
                <p>Open the ⚙️ <strong>Formatting Toolbar</strong> for Bold / Italic / Underline, font family, size, spacing, line height, alignment, and 20+ text transforms.</p>
              </div>
              <div className="step">
                <div className="step-num">6</div>
                <h3>Paste it anywhere</h3>
                <p>Use the generated text in your Instagram bio, TikTok caption, Discord server nickname, WhatsApp status (via Share PNG), Twitter/X post, or YouTube title.</p>
              </div>
            </div>
          </section>

          <section className="content glass">
            <h2>Why Choose This Fancy Text Tool?</h2>
            <div className="features">
              <div className="feature" title="Instant, real-time transformation" data-tooltip="Real-time updates">
                <div className="feature-icon">⚡</div>
                <h3>Instant, real-time</h3>
                <p>Every style regenerates as you type — no buttons, no lag, no reloads.</p>
              </div>
              <div className="feature" title="1000+ styles" data-tooltip="1000+ styles">
                <div className="feature-icon">🎨</div>
                <h3>1000+ styles</h3>
                <p>Real Unicode styles across Serif, Script, Gothic, Bubble, Decor, Effects, Lines, Case &amp; Flipped categories.</p>
              </div>
              <div className="feature" title="Funny text modes" data-tooltip="28 funny modes">
                <div className="feature-icon">😂</div>
                <h3>Funny text modes</h3>
                <p>28 hand-picked comedic transformations — UwU, Pirate, Zalgo, Leet, Robot, Dog, Cat, Boomer &amp; more.</p>
              </div>
              <div className="feature" title="Color & background" data-tooltip="Color & background picker">
                <div className="feature-icon">🌈</div>
                <h3>Color &amp; background</h3>
                <p>16 text colors and 12 background styles. Copy keeps the colors in rich-text apps; Share as PNG sends a styled image.</p>
              </div>
              <div className="feature" title="Any language supported" data-tooltip="Multilingual">
                <div className="feature-icon">🌐</div>
                <h3>Any language</h3>
                <p>Type in English, Hindi, Arabic, Chinese, Japanese, Russian — no limits, no restrictions.</p>
              </div>
              <div className="feature" title="Dark & light theme" data-tooltip="Theme toggle">
                <div className="feature-icon">🌗</div>
                <h3>Dark &amp; light theme</h3>
                <p>Glassmorphism UI with animated gradient background and one-tap theme toggle.</p>
              </div>
              <div className="feature" title="Favorites & history" data-tooltip="Favorites & Recent">
                <div className="feature-icon">⭐</div>
                <h3>Favorites &amp; history</h3>
                <p>Save styles locally and revisit your recent copies — no signup required.</p>
              </div>
              <div className="feature" title="Free forever" data-tooltip="100% free">
                <div className="feature-icon">🆓</div>
                <h3>Free forever</h3>
                <p>No account, no ads, no watermarks. Unlimited use, every day.</p>
              </div>
            </div>
          </section>

          <section className="content glass" id="faq">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {FAQS.map((f, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} title={f.q} data-tooltip="Click to expand">
                    <span>{f.q}</span>
                    <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="faq-a"><p>{f.a}</p></div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="content glass" id="about">
            <h2>About the Fancy Text Generator</h2>
            <p>
              The <strong>Fancy Text Generator</strong> is a free online utility that turns plain text into over 1000 fancy, stylish, and decorative Unicode fonts — plus 28 funny text transformations — that you can copy and paste anywhere. Unlike traditional fonts, the styles produced here are made of real Unicode characters, so they don&apos;t require the receiving app to install a font file.
            </p>
            <p>
              This tool is a popular choice for <strong>Instagram bio fonts</strong>, <strong>TikTok caption styles</strong>, <strong>Discord nickname fonts</strong>, <strong>Twitter/X display names</strong>, <strong>WhatsApp status text</strong>, <strong>Facebook posts</strong>, <strong>YouTube channel titles</strong>, and <strong>gaming usernames</strong> in games like Fortnite, Roblox, Minecraft, Valorant, and Free Fire.
            </p>
            <p>
              Categories include <em>Bold</em>, <em>Italic</em>, <em>Script</em>, <em>Fraktur / Gothic</em>, <em>Double-Struck</em>, <em>Sans-Serif</em>, <em>Monospace</em>, <em>Small Caps</em>, <em>Superscript</em>, <em>Subscript</em>, <em>Upside-down</em>, <em>Mirrored</em>, <em>Bubble / Circled</em>, <em>Squared</em>, <em>Fullwidth</em>, and dozens of decorative <em>Effects</em>, <em>Wrappers</em>, <em>Separators</em>, and <em>Line transformations</em>.
            </p>
          </section>

          <section className="content glass tools-section" id="tools">
            <h2>Other Useful Tools</h2>
            <p className="tools-sub">Explore our growing collection of free web utilities.</p>
            <div className="tools-grid">
              {OTHER_TOOLS.map((t, i) => (
                <a
                  key={t.name}
                  href={t.href}
                  className="tool-card"
                  title={t.desc}
                  data-tooltip={t.desc}
                  style={{ '--tool-color': t.color, animationDelay: `${i * 40}ms` } as React.CSSProperties}
                >
                  <div className="tool-card-icon">{t.icon}</div>
                  <div className="tool-card-body">
                    <h3 className="tool-card-name">{t.name}</h3>
                    <p className="tool-card-desc">{t.desc}</p>
                  </div>
                  <span className="tool-card-arrow">→</span>
                </a>
              ))}
            </div>
          </section>

          <footer className="footer">
            <p>Made with ✦ — FancyText Generator © {new Date().getFullYear()}</p>
            <p className="footer-links">
              <a href="#styles" title="Fancy styles">Styles</a> · <a href="#funny" title="Funny text">Funny</a> ·{' '}
              <a href="#how-to" title="How to use">How to Use</a> · <a href="#faq" title="FAQ">FAQ</a> · <a href="#tools" title="Other tools">Tools</a>
            </p>
          </footer>
        </main>

        <div ref={bottomRef} style={{ height: 1 }} />

        <button
          className="scroll-bottom"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          title="Scroll to bottom of page"
          data-tooltip="Scroll to bottom"
        >
          ⬇
        </button>

        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top of page"
          data-tooltip="Back to top"
        >
          ↑
        </button>

        <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
      </div>

      <style jsx global>{`
        :root {
          --bg: #07071a;
          --fg: #f0f0ff;
          --muted: #9aa0c0;
          --glass-bg: rgba(255, 255, 255, 0.055);
          --glass-border: rgba(255, 255, 255, 0.12);
          --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          --accent-1: #8b5cf6;
          --accent-2: #ec4899;
          --accent-3: #06b6d4;
          --accent-4: #f59e0b;
          --accent-5: #10b981;
        }
        [data-theme='light'] {
          --bg: #f5f5ff;
          --fg: #0f0f20;
          --muted: #5a5f80;
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(255, 255, 255, 0.9);
          --glass-shadow: 0 8px 32px rgba(100, 100, 180, 0.18);
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        html, body {
          margin: 0; padding: 0;
          background: var(--bg); color: var(--fg);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Arabic', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background 0.4s ease, color 0.4s ease;
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); border: 0;
        }
        .app { min-height: 100vh; position: relative; overflow-x: hidden; padding: 0 0 100px; }

        [data-tooltip] { position: relative; }
        [data-tooltip]::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          padding: 6px 10px;
          background: rgba(15, 15, 40, 0.96);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: 8px;
          white-space: nowrap;
          max-width: 240px;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 999;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          border: 1px solid rgba(139, 92, 246, 0.4);
          font-family: inherit;
        }
        [data-theme='light'] [data-tooltip]::after {
          background: rgba(20, 20, 45, 0.95);
        }
        [data-tooltip]:hover::after,
        [data-tooltip]:focus-visible::after {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .bg-gradient {
          position: fixed; inset: 0; z-index: -3;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(139, 92, 246, 0.22), transparent 55%),
            radial-gradient(ellipse at 80% 100%, rgba(236, 72, 153, 0.18), transparent 55%),
            radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.10), transparent 65%);
          animation: bgShift 22s ease-in-out infinite alternate;
        }
        @keyframes bgShift { 0% { transform: scale(1) rotate(0deg); } 100% { transform: scale(1.15) rotate(3deg); } }
        .bg-grid {
          position: fixed; inset: 0; z-index: -2; opacity: 0.35;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%);
        }
        [data-theme='light'] .bg-grid {
          background-image:
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
        }
        .bg-blobs { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(90px); opacity: 0.55;
          animation: float 24s ease-in-out infinite;
        }
        .blob-1 { width: 460px; height: 460px; background: var(--accent-1); top: -140px; left: -140px; }
        .blob-2 { width: 420px; height: 420px; background: var(--accent-2); bottom: -120px; right: -120px; animation-delay: -6s; }
        .blob-3 { width: 360px; height: 360px; background: var(--accent-3); top: 45%; left: 60%; animation-delay: -12s; }
        .blob-4 { width: 340px; height: 340px; background: var(--accent-4); top: 25%; left: 15%; animation-delay: -18s; opacity: 0.35; }
        [data-theme='light'] .blob { opacity: 0.28; }
        @keyframes float {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(50px,-40px) scale(1.1); }
          66% { transform: translate(-40px,50px) scale(0.92); }
        }

        .glass {
          background: var(--glass-bg);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 20px;
        }

        .header { position: sticky; top: 0; z-index: 50; padding: 10px 16px; }
        .header-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 10px 18px; border-radius: 16px;
        }
        .logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.15rem; }
        .logo-icon {
          font-size: 1.4rem;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: spin 8s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .logo-text { display: inline-flex; }
        .logo-char {
          display: inline-block;
          animation: charJump 2.4s ease-in-out infinite;
        }
        .logo-char:nth-child(1) { animation-delay: 0s; }
        .logo-char:nth-child(2) { animation-delay: 0.1s; }
        .logo-char:nth-child(3) { animation-delay: 0.2s; }
        .logo-char:nth-child(4) { animation-delay: 0.3s; }
        .logo-char:nth-child(5) { animation-delay: 0.4s; }
        .logo-char:nth-child(6) { animation-delay: 0.5s; }
        .logo-char:nth-child(7) { animation-delay: 0.6s; }
        .logo-char:nth-child(8) { animation-delay: 0.7s; }
        .logo-char:nth-child(9) { animation-delay: 0.8s; }
        @keyframes charJump {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          45% { transform: translateY(-2px) rotate(-3deg); }
          55% { transform: translateY(-2px) rotate(3deg); }
        }
        .logo-badge {
          font-size: 0.68rem; padding: 3px 8px; border-radius: 999px;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; font-weight: 800; letter-spacing: 0.03em;
          animation: badgePulse 2.5s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.5); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 8px rgba(139, 92, 246, 0); }
        }
        .grad-text {
          background: linear-gradient(90deg, var(--accent-1), var(--accent-2), var(--accent-3), var(--accent-1));
          background-size: 300% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: gradMove 6s linear infinite;
        }
        @keyframes gradMove { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
        .header-nav { display: flex; gap: 2px; }
        .nav-link {
          color: var(--muted); text-decoration: none; font-size: 0.85rem;
          font-weight: 600; padding: 8px 10px; border-radius: 10px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover { color: var(--fg); background: var(--glass-bg); }
        .header-actions { display: flex; gap: 8px; }
        .icon-btn {
          width: 42px; height: 42px; border-radius: 12px;
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          color: var(--fg); cursor: pointer; font-size: 1.05rem;
          display: grid; place-items: center;
          transition: transform 0.2s, background 0.2s;
        }
        .icon-btn:hover { transform: scale(1.08); background: rgba(139, 92, 246, 0.15); }
        .icon-btn.down-arrow {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15));
          border-color: rgba(6, 182, 212, 0.4);
          color: #67e8f9;
          animation: arrowBob 1.8s ease-in-out infinite;
        }
        .icon-btn.down-arrow:hover {
          background: linear-gradient(135deg, var(--accent-3), var(--accent-5));
          color: white;
        }
        @keyframes arrowBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }

        .main { max-width: 1200px; margin: 0 auto; padding: 0 16px; }

        .hero { text-align: center; padding: 36px 8px 28px; }
        .hero-pill {
          display: inline-block; padding: 8px 16px;
          font-size: 0.82rem; font-weight: 600; color: var(--muted);
          margin-bottom: 18px; border-radius: 999px;
        }
        .hero-title {
          font-size: clamp(1.8rem, 6vw, 3.4rem); font-weight: 900;
          margin: 0 0 14px; line-height: 1.1; letter-spacing: -0.025em;
        }
        .hero-sub {
          color: var(--muted); font-size: clamp(0.9rem, 2.4vw, 1.05rem);
          margin: 0; max-width: 720px; margin-inline: auto; line-height: 1.6;
        }

        .panel { padding: 18px; margin-bottom: 18px; }
        .panel-head { margin-bottom: 14px; }
        .panel-tabs {
          display: inline-flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.04);
          border-radius: 12px; border: 1px solid var(--glass-border);
        }
        [data-theme='light'] .panel-tabs { background: rgba(255,255,255,0.6); }
        .panel-tab {
          padding: 8px 16px; font-size: 0.85rem; font-weight: 700;
          background: transparent; border: none; color: var(--muted);
          border-radius: 9px; cursor: pointer; transition: all 0.2s;
        }
        .panel-tab.active {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
        }

        .input-wrap { position: relative; }
        .input {
          width: 100%; padding: 16px 18px; font-size: 1.05rem;
          border-radius: 14px; background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border); color: var(--fg);
          font-family: inherit; resize: vertical; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; min-height: 80px;
        }
        [data-theme='light'] .input { background: rgba(255,255,255,0.75); }
        .input:focus { border-color: var(--accent-1); box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15); }
        .input-meta {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 12px; flex-wrap: wrap; gap: 8px;
        }
        .count { color: var(--muted); font-size: 0.82rem; }
        .input-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .mini-btn {
          padding: 8px 14px; font-size: 0.82rem; border-radius: 10px;
          cursor: pointer; background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border); color: var(--fg);
          font-weight: 600; transition: transform 0.15s, background 0.2s;
        }
        [data-theme='light'] .mini-btn { background: rgba(255,255,255,0.75); }
        .mini-btn:hover { transform: translateY(-1px); background: rgba(139,92,246,0.12); }
        .mini-btn.accent {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border: none; color: white;
        }
        .mini-btn.danger { color: #fca5a5; border-color: rgba(239, 68, 68, 0.3); }
        .mini-btn.danger:hover { background: rgba(239, 68, 68, 0.15); }

        .color-panel-wrap { margin-top: 14px; }
        .color-toggle {
          width: 100%; padding: 10px 14px;
          border-radius: 12px; cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg); font-weight: 700; font-size: 0.85rem;
          text-align: left; transition: all 0.2s;
          font-family: inherit;
        }
        [data-theme='light'] .color-toggle { background: rgba(255,255,255,0.75); }
        .color-toggle:hover { background: rgba(139,92,246,0.12); }
        .color-toggle.on {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
          border-color: rgba(139, 92, 246, 0.4);
        }
        .color-panel {
          margin-top: 12px; padding: 16px;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          animation: panelIn 0.3s ease;
        }
        [data-theme='light'] .color-panel { background: rgba(255,255,255,0.5); }
        @keyframes panelIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .color-section { margin-bottom: 16px; }
        .color-section:last-child { margin-bottom: 0; }
        .color-label {
          display: block; font-size: 0.72rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted); margin-bottom: 10px;
        }
        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
          gap: 8px;
        }
        .color-swatch {
          width: 100%; aspect-ratio: 1;
          border-radius: 10px; cursor: pointer;
          border: 2px solid rgba(255,255,255,0.15);
          transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
          position: relative;
          padding: 0;
        }
        .color-swatch:hover { transform: scale(1.12); }
        .color-swatch.active {
          border-color: white;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.6);
          transform: scale(1.05);
        }
        .swatch-check {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          font-weight: 900; font-size: 1rem;
          color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.8);
        }
        .bg-grid-colors {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
        }
        .bg-swatch {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          cursor: pointer; color: var(--fg);
          font-size: 0.78rem; font-weight: 600;
          transition: all 0.15s; text-align: left;
          font-family: inherit;
        }
        [data-theme='light'] .bg-swatch { background: rgba(255,255,255,0.75); }
        .bg-swatch:hover { transform: translateY(-1px); background: rgba(139,92,246,0.12); }
        .bg-swatch.active {
          border-color: var(--accent-1);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.4);
        }
        .bg-swatch-preview {
          width: 26px; height: 26px; border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          flex-shrink: 0;
        }
        .bg-swatch-name {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .copy-hint {
          padding: 10px 14px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 10px;
          font-size: 0.8rem;
          color: var(--muted);
          line-height: 1.5;
        }
        .copy-hint strong { color: var(--fg); }

        /* ===== SHARE AS PNG TOGGLE ===== */
        .share-toggle-panel {
          padding: 16px 18px;
          margin-bottom: 18px;
        }
        .share-toggle {
          display: flex; align-items: center; gap: 16px;
          cursor: pointer;
          user-select: none;
        }
        .share-toggle input { display: none; }
        .share-toggle-track {
          width: 58px; height: 32px; border-radius: 999px;
          background: rgba(255,255,255,0.15);
          border: 1px solid var(--glass-border);
          position: relative; flex-shrink: 0;
          transition: background 0.25s;
        }
        [data-theme='light'] .share-toggle-track { background: rgba(0,0,0,0.15); }
        .share-toggle input:checked ~ .share-toggle-track {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border-color: transparent;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.5);
        }
        .share-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 24px; height: 24px; border-radius: 50%;
          background: white;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .share-toggle input:checked ~ .share-toggle-track .share-toggle-thumb {
          transform: translateX(26px);
        }
        .share-toggle-text {
          display: flex; flex-direction: column; gap: 4px;
          min-width: 0;
        }
        .share-toggle-title {
          font-size: 0.98rem; font-weight: 800;
          color: var(--fg);
        }
        .share-toggle-sub {
          font-size: 0.82rem;
          color: var(--muted);
          line-height: 1.5;
        }

        .toolbar {
          margin-top: 16px; padding: 14px;
          background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
          border-radius: 14px; display: flex; flex-wrap: wrap; gap: 12px;
          animation: panelIn 0.35s ease;
        }
        [data-theme='light'] .toolbar { background: rgba(255,255,255,0.5); }
        .tool-group {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 10px; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          flex-wrap: wrap;
        }
        [data-theme='light'] .tool-group { background: rgba(255,255,255,0.65); }
        .tool-label {
          font-size: 0.68rem; font-weight: 700; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-right: 4px;
        }
        .tool-btn {
          min-width: 34px; height: 34px; padding: 0 8px;
          border-radius: 8px; cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg); font-weight: 600; font-size: 0.82rem;
          display: inline-flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        [data-theme='light'] .tool-btn { background: rgba(255,255,255,0.9); }
        .tool-btn:hover { transform: translateY(-1px); background: rgba(139, 92, 246, 0.15); }
        .tool-btn.on {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; border-color: transparent;
          box-shadow: 0 3px 12px rgba(139, 92, 246, 0.4);
        }
        .tool-select {
          padding: 7px 10px; border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg); font-size: 0.82rem; cursor: pointer;
          font-family: inherit; outline: none;
        }
        [data-theme='light'] .tool-select { background: rgba(255,255,255,0.9); }
        .tool-range { width: 100px; accent-color: var(--accent-1); cursor: pointer; }

        .filters { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }
        .search-wrap { position: relative; }
        .search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          opacity: 0.6; font-size: 0.9rem; pointer-events: none;
        }
        .search {
          width: 100%; padding: 12px 40px 12px 40px;
          border-radius: 12px; background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border); color: var(--fg);
          font-size: 0.95rem; outline: none; font-family: inherit;
        }
        [data-theme='light'] .search { background: rgba(255,255,255,0.75); }
        .search:focus { border-color: var(--accent-1); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12); }
        .search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; color: var(--muted);
          font-size: 1.3rem; cursor: pointer; padding: 0 8px;
        }
        .chips {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;
          scrollbar-width: thin; -webkit-overflow-scrolling: touch;
        }
        .chips::-webkit-scrollbar { height: 4px; }
        .chips::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 4px; }
        .chip {
          flex: 0 0 auto; padding: 8px 14px; font-size: 0.83rem;
          border-radius: 20px; cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg); font-weight: 600; white-space: nowrap;
          transition: all 0.2s;
        }
        [data-theme='light'] .chip { background: rgba(255,255,255,0.75); }
        .chip:hover { transform: translateY(-1px); background: rgba(139,92,246,0.12); }
        .chip.active {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border-color: transparent; color: white;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        }

        .section-head {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; margin: 20px 0 12px; flex-wrap: wrap;
        }
        .section-title {
          margin: 0; font-size: 1.3rem; font-weight: 800;
          display: flex; align-items: center; gap: 8px;
        }
        .toggle-section-btn {
          padding: 8px 16px; font-size: 0.82rem;
          border-radius: 999px; cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg); font-weight: 700;
          transition: all 0.2s; font-family: inherit;
          position: relative;
        }
        [data-theme='light'] .toggle-section-btn { background: rgba(255,255,255,0.75); }
        .toggle-section-btn:hover { transform: translateY(-1px); background: rgba(139,92,246,0.15); }
        .toggle-section-btn.on {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2));
          border-color: rgba(16, 185, 129, 0.5);
          color: #6ee7b7;
        }
        .toggle-section-btn.pulse,
        .section-head .toggle-section-btn {
          animation: blinkGlow 1.8s ease-in-out infinite;
        }
        @keyframes blinkGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.55);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
            transform: scale(1.04);
          }
        }

        .funny-panel { background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(236, 72, 153, 0.08)); }
        .funny-head {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 16px; flex-wrap: wrap; margin-bottom: 16px;
        }
        .funny-title { margin: 0 0 4px; font-size: 1.05rem; font-weight: 800; }
        .funny-sub { margin: 0; color: var(--muted); font-size: 0.88rem; }
        .funny-select-wrap { flex-shrink: 0; }
        .funny-select {
          padding: 12px 16px; min-width: 240px;
          border-radius: 12px; cursor: pointer;
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--glass-border);
          color: var(--fg); font-family: inherit; font-size: 0.95rem;
          font-weight: 700; outline: none;
        }
        [data-theme='light'] .funny-select { background: rgba(255,255,255,0.9); }
        .funny-select:focus { border-color: var(--accent-1); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }

        .funny-preview {
          padding: 16px; border-radius: 14px;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          margin-bottom: 16px;
        }
        [data-theme='light'] .funny-preview { background: rgba(255,255,255,0.6); }
        .funny-preview-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.78rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted); margin-bottom: 10px;
        }
        .funny-emoji { font-size: 1.1rem; }
        .funny-output {
          padding: 14px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px dashed var(--glass-border);
          font-size: 1.15rem; font-weight: 600;
          min-height: 52px; display: flex; align-items: center;
          cursor: pointer; word-break: break-word;
          transition: all 0.2s; line-height: 1.4;
        }
        [data-theme='light'] .funny-output { background: rgba(255,255,255,0.7); }
        .funny-output:hover { background: rgba(139, 92, 246, 0.1); border-color: var(--accent-1); }
        .funny-output.copied { background: rgba(16, 185, 129, 0.15); border-color: var(--accent-5); }
        .funny-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }

        .funny-grid {
          display: grid; gap: 8px;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        .funny-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: var(--fg); cursor: pointer;
          font-size: 0.82rem; font-weight: 600;
          transition: all 0.2s; text-align: left;
          font-family: inherit;
        }
        [data-theme='light'] .funny-chip { background: rgba(255,255,255,0.7); }
        .funny-chip:hover { transform: translateY(-2px); background: rgba(139,92,246,0.12); }
        .funny-chip.active {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; border-color: transparent;
          box-shadow: 0 4px 18px rgba(139, 92, 246, 0.4);
        }
        .funny-chip-emoji { font-size: 1.05rem; }
        .funny-chip-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .stats {
          display: flex; justify-content: center; align-items: center;
          gap: 10px; color: var(--muted); font-size: 0.85rem;
          margin: 4px 0 16px; flex-wrap: wrap;
        }
        .stats strong { color: var(--fg); }
        .dot { opacity: 0.5; }

        .grid {
          display: grid; gap: 14px;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }
        .card {
          padding: 14px; display: flex; flex-direction: column; gap: 10px;
          opacity: 0; transform: translateY(12px);
          animation: cardIn 0.4s ease forwards;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }
        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
        .card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.25);
        }
        .card-head { display: flex; justify-content: space-between; align-items: center; }
        .card-label {
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted);
        }
        .fav-btn {
          background: transparent; border: none; cursor: pointer;
          font-size: 1.15rem; color: var(--muted); padding: 2px 6px;
          transition: transform 0.2s, color 0.2s;
        }
        .fav-btn.on { color: #fbbf24; }
        .fav-btn:hover { transform: scale(1.25); }
        .card-output {
          padding: 12px; border-radius: 10px;
          background: rgba(0,0,0,0.18);
          border: 1px dashed var(--glass-border);
          font-size: 1.05rem; word-break: break-word;
          min-height: 52px; display: flex; align-items: center;
          cursor: pointer; transition: all 0.2s;
          line-height: 1.4; overflow: hidden;
        }
        [data-theme='light'] .card-output { background: rgba(255,255,255,0.65); }
        .card-output:hover { background: rgba(139, 92, 246, 0.1); border-color: var(--accent-1); }
        .card-output.copied { background: rgba(16, 185, 129, 0.15); border-color: var(--accent-5); }
        .card-actions { display: flex; gap: 8px; }
        .card-btn {
          flex: 1; padding: 9px 10px; font-size: 0.82rem;
          font-weight: 600; border-radius: 10px; cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg); transition: all 0.2s;
          font-family: inherit;
        }
        [data-theme='light'] .card-btn { background: rgba(255,255,255,0.75); }
        .card-btn:hover {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; border-color: transparent;
          transform: translateY(-1px);
        }
        .card-btn.copied {
          background: linear-gradient(135deg, var(--accent-5), var(--accent-3));
          color: white; border-color: transparent;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
        }

        .empty {
          grid-column: 1 / -1; text-align: center;
          padding: 60px 20px; color: var(--muted);
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 12px; animation: pulse 2s infinite; }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }

        .content { margin-top: 30px; padding: 28px; line-height: 1.75; }
        .content h2 { margin-top: 0; font-size: 1.45rem; }
        .content h3 { font-size: 1.05rem; margin: 20px 0 6px; }
        .content p, .content li { color: var(--muted); font-size: 0.94rem; }
        .content strong { color: var(--fg); }
        .content ul, .content ol { padding-left: 20px; }

        .steps { display: grid; gap: 14px; margin-top: 20px; }
        .step {
          position: relative; padding: 18px 18px 18px 74px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
          border-radius: 14px; transition: transform 0.2s, border-color 0.2s;
        }
        [data-theme='light'] .step { background: rgba(255,255,255,0.6); }
        .step:hover { transform: translateY(-2px); border-color: rgba(139, 92, 246, 0.4); }
        .step-num {
          position: absolute; left: 18px; top: 18px;
          width: 40px; height: 40px; border-radius: 12px;
          display: grid; place-items: center;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; font-weight: 900; font-size: 1.1rem;
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }
        .step h3 { margin: 0 0 6px; font-size: 1rem; }
        .step p { margin: 0; font-size: 0.9rem; }

        .features {
          display: grid; gap: 14px; margin-top: 20px;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        }
        .feature {
          padding: 18px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        [data-theme='light'] .feature { background: rgba(255,255,255,0.6); }
        .feature:hover {
          transform: translateY(-3px);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 10px 32px rgba(139, 92, 246, 0.2);
        }
        .feature-icon { font-size: 1.8rem; margin-bottom: 8px; }
        .feature h3 { margin: 0 0 6px; font-size: 1rem; }
        .feature p { margin: 0; font-size: 0.88rem; }

        .faq-list { margin-top: 18px; display: grid; gap: 10px; }
        .faq-item {
          border: 1px solid var(--glass-border);
          border-radius: 12px; overflow: hidden;
          background: rgba(255,255,255,0.04);
          transition: border-color 0.2s, background 0.2s;
        }
        [data-theme='light'] .faq-item { background: rgba(255,255,255,0.6); }
        .faq-item.open { border-color: rgba(139, 92, 246, 0.5); background: rgba(139, 92, 246, 0.06); }
        .faq-q {
          width: 100%; text-align: left; padding: 16px 18px;
          background: transparent; border: none; cursor: pointer;
          color: var(--fg); font-weight: 700; font-size: 0.95rem;
          display: flex; justify-content: space-between;
          align-items: center; gap: 12px;
          font-family: inherit;
        }
        .faq-icon { font-size: 1.4rem; font-weight: 300; color: var(--accent-1); flex-shrink: 0; }
        .faq-a {
          padding: 0 18px 18px; color: var(--muted);
          font-size: 0.9rem; line-height: 1.7;
          animation: faqIn 0.25s ease;
        }
        .faq-a p { margin: 0; }
        @keyframes faqIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .tools-section { position: relative; }
        .tools-sub { margin: 0 0 18px; }
        .tools-grid {
          display: grid; gap: 14px;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        }
        .tool-card {
          position: relative; display: flex; align-items: center; gap: 14px;
          padding: 16px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
          text-decoration: none; color: var(--fg);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.25s, box-shadow 0.25s,
                      background 0.25s;
          overflow: hidden;
          opacity: 0; transform: translateY(10px);
          animation: cardIn 0.5s ease forwards;
        }
        [data-theme='light'] .tool-card { background: rgba(255,255,255,0.6); }
        .tool-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 20% 50%, var(--tool-color), transparent 70%);
          opacity: 0; transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .tool-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: var(--tool-color);
          box-shadow: 0 14px 40px color-mix(in srgb, var(--tool-color) 35%, transparent);
        }
        .tool-card:hover::before { opacity: 0.18; }
        .tool-card:active { transform: translateY(-2px) scale(1); }
        .tool-card-icon {
          font-size: 1.8rem; width: 50px; height: 50px;
          display: grid; place-items: center;
          border-radius: 12px; flex-shrink: 0;
          background: color-mix(in srgb, var(--tool-color) 22%, transparent);
          border: 1px solid color-mix(in srgb, var(--tool-color) 40%, transparent);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative; z-index: 1;
        }
        .tool-card:hover .tool-card-icon { transform: scale(1.12) rotate(-6deg); }
        .tool-card-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
        .tool-card-name {
          margin: 0 0 4px; font-size: 0.95rem; font-weight: 800;
          transition: color 0.25s;
        }
        .tool-card:hover .tool-card-name { color: var(--tool-color); }
        .tool-card-desc {
          margin: 0; font-size: 0.82rem; color: var(--muted);
          overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .tool-card-arrow {
          font-size: 1.2rem; font-weight: 800;
          color: var(--tool-color); opacity: 0.6;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s;
          position: relative; z-index: 1;
        }
        .tool-card:hover .tool-card-arrow { transform: translateX(6px); opacity: 1; }

        .footer {
          text-align: center; margin-top: 40px;
          color: var(--muted); font-size: 0.85rem;
        }
        .footer-links { margin-top: 8px; }
        .footer-links a { color: var(--muted); text-decoration: none; }
        .footer-links a:hover { color: var(--accent-1); }

        .back-to-top, .scroll-bottom {
          position: fixed; right: 24px;
          width: 46px; height: 46px; border-radius: 50%;
          color: white; border: none; cursor: pointer;
          font-size: 1.2rem; font-weight: 800;
          z-index: 40; transition: transform 0.2s, box-shadow 0.2s;
          display: grid; place-items: center;
        }
        .back-to-top {
          bottom: 24px;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          box-shadow: 0 8px 28px rgba(139, 92, 246, 0.5);
        }
        .scroll-bottom {
          bottom: 80px;
          background: linear-gradient(135deg, var(--accent-3), var(--accent-5));
          box-shadow: 0 8px 28px rgba(6, 182, 212, 0.5);
          animation: bounceDown 2s ease-in-out infinite;
        }
        .back-to-top:hover { transform: translateY(-3px) scale(1.05); }
        .scroll-bottom:hover { transform: translateY(3px) scale(1.05); animation-play-state: paused; }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        .toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; font-weight: 700; font-size: 0.9rem;
          padding: 12px 22px; border-radius: 14px;
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.5);
          opacity: 0; pointer-events: none;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
          z-index: 100;
        }
        .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

        @media (max-width: 900px) { .header-nav { display: none; } }
        @media (max-width: 720px) {
          .grid { grid-template-columns: 1fr; gap: 12px; }
          .panel, .content { padding: 16px; }
          .hero { padding: 22px 4px 18px; }
          .header { padding: 8px 10px; }
          .header-inner { padding: 8px 14px; gap: 6px; }
          .logo { font-size: 1rem; }
          .logo-badge { display: none; }
          .icon-btn { width: 38px; height: 38px; font-size: 0.95rem; }
          .toolbar { padding: 10px; gap: 10px; }
          .tool-group { padding: 5px 8px; }
          .tool-range { width: 72px; }
          .funny-head { flex-direction: column; align-items: stretch; }
          .funny-select { width: 100%; min-width: 0; }
          .step { padding: 14px 14px 14px 66px; }
          .step-num { left: 14px; top: 14px; width: 36px; height: 36px; font-size: 1rem; }
          .bg-grid-colors { grid-template-columns: 1fr 1fr; }
          .section-head { gap: 8px; }
          .section-title { font-size: 1.1rem; }
          .back-to-top, .scroll-bottom { width: 42px; height: 42px; right: 14px; }
          .back-to-top { bottom: 14px; }
          .scroll-bottom { bottom: 64px; }
          [data-tooltip]::after { font-size: 0.68rem; padding: 5px 8px; }
          .share-toggle-panel { padding: 14px; }
          .share-toggle { gap: 12px; }
          .share-toggle-title { font-size: 0.92rem; }
          .share-toggle-sub { font-size: 0.76rem; }
        }
        @media (min-width: 1280px) { .grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1680px) { .grid { grid-template-columns: repeat(4, 1fr); } }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
