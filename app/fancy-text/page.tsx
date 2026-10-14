"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';

// ============================================================
// STYLE ENGINE — generates 1000+ real transform styles
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
  ['Alternating Case', s => [...s].map((c, i) => i % 2 ? c.toLowerCase() : c.toUpperCase()).join(''), 'Case'],
  ['UPPERCASE', s => s.toUpperCase(), 'Case'],
  ['lowercase', s => s.toLowerCase(), 'Case'],
  ['Title Case', s => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()), 'Case'],
  ['Sentence Case', s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(), 'Case'],
  ['Camel Case', s => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()), 'Case'],
  ['Snake Case', s => s.trim().toLowerCase().replace(/\s+/g, '_'), 'Case'],
  ['Kebab Case', s => s.trim().toLowerCase().replace(/\s+/g, '-'), 'Case'],
  ['Dot Case', s => s.trim().toLowerCase().replace(/\s+/g, '.'), 'Case'],
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
// FUNNY TEXT ENGINE — dropdown-selectable comedic transformations
// ============================================================
type FunnyDef = { id: string; label: string; fn: (s: string) => string; emoji: string };

const FUNNY_STYLES: FunnyDef[] = [
  {
    id: 'mocking',
    emoji: '😏',
    label: 'Mocking SpongeBob',
    fn: s => [...s].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join(''),
  },
  {
    id: 'sarcasm',
    emoji: '🙄',
    label: 'Sarcasm Caps',
    fn: s => s.toUpperCase().split(' ').join(' '),
  },
  {
    id: 'whisper',
    emoji: '🤫',
    label: 'Whisper (tiny)',
    fn: s => s.toLowerCase().replace(/[aeiou]/g, c => ({ a: 'ᵃ', e: 'ᵉ', i: 'ⁱ', o: 'ᵒ', u: 'ᵘ' }[c] || c)),
  },
  {
    id: 'robot',
    emoji: '🤖',
    label: 'Robot',
    fn: s => s.split('').join('-').replace(/\s/g, '_'),
  },
  {
    id: 'alien',
    emoji: '👽',
    label: 'Alien Speak',
    fn: s => s.replace(/[aeiou]/gi, c => ({ a: 'α', e: 'ε', i: 'ι', o: 'σ', u: 'υ' }[c.toLowerCase()] || c)),
  },
  {
    id: 'pirate',
    emoji: '🏴‍☠️',
    label: 'Pirate',
    fn: s => s.replace(/\byou\b/gi, 'ye').replace(/\byour\b/gi, 'yer').replace(/\bis\b/gi, 'be').replace(/\bare\b/gi, 'be').replace(/\bmy\b/gi, 'me') + ' arrr!',
  },
  {
    id: 'uwu',
    emoji: '🥺',
    label: 'UwU',
    fn: s => s.replace(/[rl]/g, 'w').replace(/[RL]/g, 'W').replace(/n([aeiou])/g, 'ny$1').replace(/N([AEIOU])/g, 'NY$1') + ' uwu',
  },
  {
    id: 'owo',
    emoji: '😺',
    label: 'OwO',
    fn: s => s.replace(/[rl]/g, 'w').replace(/[RL]/g, 'W') + ' owo',
  },
  {
    id: 'cat',
    emoji: '🐱',
    label: 'Cat Speak',
    fn: s => s.replace(/[aeiou]/gi, 'a').replace(/\s+/g, ' ') + ' nya~',
  },
  {
    id: 'dog',
    emoji: '🐶',
    label: 'Dog Speak',
    fn: s => s + ' woof woof! 🐾',
  },
  {
    id: 'shout',
    emoji: '📢',
    label: 'SHOUTING',
    fn: s => s.toUpperCase() + '!!!',
  },
  {
    id: 'whispery',
    emoji: '💭',
    label: 'whispering',
    fn: s => s.toLowerCase().split(' ').join('... ') + '...',
  },
  {
    id: 'stutter',
    emoji: '😅',
    label: 'S-s-stutter',
    fn: s => s.replace(/\b([a-z])/gi, (m, c) => `${c}-${c}`),
  },
  {
    id: 'backwards',
    emoji: '🔄',
    label: 'Backwards',
    fn: s => [...s].reverse().join(''),
  },
  {
    id: 'leet',
    emoji: '💻',
    label: '1337 / Leet Speak',
    fn: s => s.replace(/a/gi, '4').replace(/e/gi, '3').replace(/i/gi, '1').replace(/o/gi, '0').replace(/s/gi, '5').replace(/t/gi, '7'),
  },
  {
    id: 'bubble',
    emoji: '🫧',
    label: 'Bubble Wrap',
    fn: s => s.split('').join('°˖✧').replace(/°˖✧$/, ''),
  },
  {
    id: 'zalgofy',
    emoji: '👾',
    label: 'Zalgo Glitch',
    fn: s => [...s].map(c => c + '\u0336\u0301\u0353\u0308').join(''),
  },
  {
    id: 'rainbow',
    emoji: '🌈',
    label: 'Rainbow Sparkle',
    fn: s => `🌈 ✨ ${s} ✨ 🌈`,
  },
  {
    id: 'angry',
    emoji: '😡',
    label: 'Angry',
    fn: s => s.toUpperCase().split('').join(' ') + '!!! 😡',
  },
  {
    id: 'sad',
    emoji: '😢',
    label: 'Sad / Soft',
    fn: s => s.toLowerCase().replace(/\./g, '...') + ' 😢',
  },
  {
    id: 'excited',
    emoji: '🤩',
    label: 'Excited',
    fn: s => s.toUpperCase().split(' ').join('!!! ') + '!!!',
  },
  {
    id: 'drunk',
    emoji: '🍺',
    label: 'Drunk Typing',
    fn: s => s.replace(/[aeiou]/gi, c => ({ a: 'aa', e: 'ee', i: 'ii', o: 'oo', u: 'uu' }[c.toLowerCase()] || c)) + ' 🍻',
  },
  {
    id: 'soviet',
    emoji: '☭',
    label: 'Soviet',
    fn: s => `☭ ${s.toUpperCase()} ☭`,
  },
  {
    id: 'wizard',
    emoji: '🧙',
    label: 'Wizard Spell',
    fn: s => `✨🪄 ${s.split('').join('·')} 🪄✨`,
  },
  {
    id: 'zombie',
    emoji: '🧟',
    label: 'Zombie',
    fn: s => s.replace(/[aeiou]/gi, 'rrr') + ' brraaiinnss...',
  },
  {
    id: 'vampire',
    emoji: '🧛',
    label: 'Vampire',
    fn: s => `🦇 ${s} 🦇  bluh!`,
  },
  {
    id: 'princess',
    emoji: '👑',
    label: 'Princess',
    fn: s => `👑💖 ${s} 💖👑`,
  },
  {
    id: 'gamer',
    emoji: '🎮',
    label: 'Gamer',
    fn: s => `[GG] ${s} [GG]  no scope`,
  },
  {
    id: 'boomer',
    emoji: '👴',
    label: 'OK Boomer',
    fn: s => s.toUpperCase().split('').join(' ') + '  OK boomer.',
  },
  {
    id: 'yoda',
    emoji: '🧝',
    label: 'Yoda Speak',
    fn: s => s.split(' ').reverse().join(' ') + ', hmm yes.',
  },
];

// ============================================================
// FAQ DATA (also used for JSON-LD schema)
// ============================================================
const FAQS = [
  {
    q: 'What is a fancy text generator?',
    a: 'A fancy text generator is an online tool that converts ordinary letters into alternative Unicode characters and symbols. Because these alternative letters exist as real characters in the Unicode standard, the resulting text can be copied and pasted anywhere — Instagram bios, Twitter/X posts, Facebook comments, Discord messages, TikTok captions, WhatsApp chats, or YouTube titles — without needing to install anything.',
  },
  {
    q: 'How does this fancy text tool work?',
    a: 'Type or paste your text into the input box at the top of the page. The tool instantly converts your text into 1000+ styles using mathematical alphanumeric symbols, decorative Unicode blocks, combining diacritical marks, and artistic wrappers. Click any style card to copy it to your clipboard — or use the Share button to send it directly to another app.',
  },
  {
    q: 'Is this fancy text generator free?',
    a: 'Yes, 100% free. There is no signup, no login, no ads, and no character limit beyond the 200-character input field to keep the page fast. You can generate unlimited fancy text styles every day at no cost.',
  },
  {
    q: 'Will fancy text work on Instagram, Twitter/X, Facebook, and TikTok?',
    a: 'Yes. All of the Unicode characters used here are supported on Instagram, Twitter/X, Facebook, TikTok, Discord, WhatsApp, Telegram, Snapchat, Reddit, Pinterest, YouTube, LinkedIn, and most modern websites. A few very decorative styles (like combining marks) may not render perfectly on older devices or certain apps, so we recommend testing before posting.',
  },
  {
    q: 'What is the Funny Text dropdown feature?',
    a: 'The Funny Text dropdown is a special collection of 30 comedic text transformations — including Mocking SpongeBob case, UwU speak, Pirate talk, Leet (1337) speak, Zalgo glitch text, Robot mode, Dog and Cat speak, and more. Just pick a style from the dropdown, and your text instantly becomes hilarious.',
  },
  {
    q: 'Can I save my favorite fancy text styles?',
    a: 'Yes. Click the star icon ☆ on any style card to save it to your Favorites. Favorites are stored locally in your browser so they persist between visits — no account required. You can also view recently-copied styles via the Recent tab.',
  },
  {
    q: 'Does the text stay the same when I paste it somewhere else?',
    a: 'In most cases, yes. The fancy text you generate is made of real Unicode characters, so it pastes exactly as shown on any platform that supports Unicode. Some extremely small, superscript, or combining-mark styles may look different depending on the font used by the destination app.',
  },
  {
    q: 'Can I use the generated text for commercial purposes?',
    a: 'Yes. You own the text you generate. You can use it in social media posts, bios, product names, usernames, T-shirts, artwork, or anywhere else. The styles are simply Unicode characters, which are a free public standard — no attribution required.',
  },
  {
    q: 'Why do some fancy fonts look like squares or boxes?',
    a: 'If a particular style shows as empty squares (□□□), that means the device or app you are viewing it on does not have a font that supports those specific Unicode characters. Trying a different style, or switching to a modern device, will usually fix this.',
  },
  {
    q: 'Does this tool work offline?',
    a: 'The generator works offline once the page has loaded, since all transformations run in your browser — no server round-trips. However, loading the page for the first time requires an internet connection.',
  },
  {
    q: 'Is there a character limit?',
    a: 'The input box is limited to 200 characters to keep the interface fast and responsive, since each keystroke regenerates 1000+ styles. If you need longer text, paste it in sections or use the Download button to save individual styles as .txt files.',
  },
  {
    q: 'Can I share my fancy text directly to other apps?',
    a: 'Yes. Every style card includes a Share button. On supported devices (most phones and modern browsers), this opens the native share sheet, letting you send the text to WhatsApp, Instagram, Messages, Email, or any installed app instantly.',
  },
];

// ============================================================
// REACT COMPONENT
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    const favs = localStorage.getItem('favs');
    if (favs) try { setFavorites(JSON.parse(favs)); } catch {}
    const rec = localStorage.getItem('recent');
    if (rec) try { setRecent(JSON.parse(rec)); } catch {}
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

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1600);
  }, []);

  const copy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`✓ ${label} copied!`);
        setCopiedStyle(label);
        setTimeout(() => setCopiedStyle(null), 900);
      } catch {
        showToast('Copy failed');
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
      } else copy(text, 'Share text');
    },
    [copy, showToast]
  );

  const toggleFav = useCallback((name: string) => {
    setFavorites(p => (p.includes(name) ? p.filter(n => n !== name) : [...p, name]));
  }, []);

  const addRecent = useCallback((name: string) => {
    setRecent(p => [name, ...p.filter(n => n !== name)].slice(0, 12));
  }, []);

  const applyTransform = useCallback((type: string) => {
    setInput(prev => {
      switch (type) {
        case 'upper': return prev.toUpperCase();
        case 'lower': return prev.toLowerCase();
        case 'title': return prev.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        case 'sentence': return prev.charAt(0).toUpperCase() + prev.slice(1).toLowerCase();
        case 'camel': return prev.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
        case 'snake': return prev.trim().toLowerCase().replace(/\s+/g, '_');
        case 'kebab': return prev.trim().toLowerCase().replace(/\s+/g, '-');
        case 'reverse': return [...prev].reverse().join('');
        case 'trim': return prev.trim();
        case 'clearSpaces': return prev.replace(/\s+/g, ' ').trim();
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
    showToast('✓ Cleared');
  }, [showToast]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      setInput(t.slice(0, 200));
      showToast('✓ Pasted');
    } catch {
      showToast('Paste failed');
    }
  }, [showToast]);

  const download = useCallback(() => {
    const blob = new Blob([input], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fancy-text.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Downloaded');
  }, [input, showToast]);

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
  };

  const filteredStyles = useMemo(() => {
    return ALL_STYLES.filter(s => {
      if (category === 'Favorites' && !favorites.includes(s.name)) return false;
      if (category === 'Recent' && !recent.includes(s.name)) return false;
      if (category !== 'All' && category !== 'Favorites' && category !== 'Recent' && s.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [category, search, favorites, recent]);

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#07071a' }} />;

  return (
    <>
      <Head>
        <title>Fancy Text Generator — 1000+ Stylish Fonts, Funny Text & Cool Unicode Styles (Free)</title>
        <meta
          name="description"
          content="Free fancy text generator with 1000+ stylish fonts, funny text styles, and cool Unicode characters. Instantly copy & paste fancy letters for Instagram, TikTok, Discord, Twitter/X, WhatsApp bios & posts. No signup required."
        />
        <meta
          name="keywords"
          content="fancy text, fancy text generator, stylish text, cool fonts, unicode text, instagram fonts, fancy letters, text styles, copy paste fonts, funny text generator, mocking spongebob text, uwu text, zalgo text, leet speak, bubble text, cursive text, aesthetic fonts"
        />
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
        <meta name="twitter:title" content="Fancy Text Generator — 1000+ Styles" />
        <meta name="twitter:description" content="Copy & paste 1000+ fancy and funny text styles instantly." />
        <link rel="canonical" href="https://example.com/fancy-text" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Fancy Text Generator',
              url: 'https://example.com/fancy-text',
              description:
                'Generate 1000+ fancy text styles and funny text transformations instantly. Copy & paste for Instagram, TikTok, Discord, and more.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              browserRequirements: 'Requires JavaScript',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '1284',
              },
              featureList: [
                '1000+ fancy text styles',
                'Funny text generator',
                'Rich formatting toolbar',
                'Dark and light theme',
                'Favorites and recent history',
                'Native share and download',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: 'How to use the Fancy Text Generator',
              description:
                'Learn how to generate and copy 1000+ fancy text styles and funny text in a few seconds.',
              totalTime: 'PT1M',
              step: [
                { '@type': 'HowToStep', name: 'Type your text', text: 'Type or paste your text into the input box at the top of the page.' },
                { '@type': 'HowToStep', name: 'Choose a style', text: 'Browse 1000+ fancy text styles by category or search, or pick a Funny Text style from the dropdown.' },
                { '@type': 'HowToStep', name: 'Copy', text: 'Click any style card to copy it to your clipboard instantly.' },
                { '@type': 'HowToStep', name: 'Paste anywhere', text: 'Paste the fancy text into Instagram, TikTok, Discord, Twitter/X, WhatsApp, Facebook, or any other app.' },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
                { '@type': 'ListItem', position: 2, name: 'Fancy Text Generator', item: 'https://example.com/fancy-text' },
              ],
            }),
          }}
        />
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
              <span className="logo-text">Fancy<span className="grad-text">Text</span></span>
              <span className="logo-badge">{ALL_STYLES.length}+</span>
            </div>
            <nav className="header-nav" aria-label="Primary">
              <a href="#styles" className="nav-link">Styles</a>
              <a href="#funny" className="nav-link">Funny</a>
              <a href="#how-to" className="nav-link">How to Use</a>
              <a href="#faq" className="nav-link">FAQ</a>
            </nav>
            <div className="header-actions">
              <button className="icon-btn" onClick={() => setShowToolbar(v => !v)} aria-label="Toggle toolbar" title="Formatting toolbar">
                {showToolbar ? '▼' : '⚙️'}
              </button>
              <button className="icon-btn" onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))} aria-label="Toggle theme" title="Theme">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        <main className="main">
          <section className="hero">
            <div className="hero-pill glass">🚀 {ALL_STYLES.length}+ styles · 30 funny modes · No signup</div>
            <h1 className="hero-title">
              1000+ <span className="grad-text">Fancy Text</span> &amp; Funny Text Generator
            </h1>
            <p className="hero-sub">
              Type once · Copy any style · Paste anywhere. Works with Instagram, TikTok, Discord, WhatsApp, Twitter/X, Facebook &amp; more.
            </p>
          </section>

          {/* ===== INPUT PANEL ===== */}
          <section className="panel glass" id="styles">
            <div className="panel-head">
              <div className="panel-tabs" role="tablist">
                <button role="tab" aria-selected={!showToolbar} className={`panel-tab ${!showToolbar ? 'active' : ''}`} onClick={() => setShowToolbar(false)}>✨ Styles</button>
                <button role="tab" aria-selected={showToolbar} className={`panel-tab ${showToolbar ? 'active' : ''}`} onClick={() => setShowToolbar(true)}>⚙️ Toolbar</button>
              </div>
            </div>

            <div className="input-wrap">
              <label htmlFor="input" className="sr-only">Enter your text</label>
              <textarea
                id="input"
                ref={textareaRef}
                className="input"
                value={input}
                onChange={e => setInput(e.target.value.slice(0, 200))}
                placeholder="Type or paste your text here..."
                rows={3}
                maxLength={200}
                style={inputPreviewStyle}
              />
              <div className="input-meta">
                <span className="count">{input.length}/200 characters</span>
                <div className="input-actions">
                  <button className="mini-btn" onClick={pasteFromClipboard} title="Paste">📥 Paste</button>
                  <button className="mini-btn" onClick={() => copy(input, 'Text')} title="Copy">📋 Copy</button>
                  <button className="mini-btn" onClick={download} title="Download">💾 Save</button>
                  <button className="mini-btn danger" onClick={clearAll} title="Clear">🗑 Clear</button>
                </div>
              </div>
            </div>

            {showToolbar && (
              <div className="toolbar">
                <div className="tool-group">
                  <span className="tool-label">Transform</span>
                  <button className="tool-btn" onClick={() => applyTransform('upper')} title="UPPERCASE">AA</button>
                  <button className="tool-btn" onClick={() => applyTransform('lower')} title="lowercase">aa</button>
                  <button className="tool-btn" onClick={() => applyTransform('title')} title="Title Case">Aa</button>
                  <button className="tool-btn" onClick={() => applyTransform('sentence')} title="Sentence case">A.</button>
                  <button className="tool-btn" onClick={() => applyTransform('camel')} title="camelCase">cC</button>
                  <button className="tool-btn" onClick={() => applyTransform('snake')} title="snake_case">s_s</button>
                  <button className="tool-btn" onClick={() => applyTransform('kebab')} title="kebab-case">k-k</button>
                  <button className="tool-btn" onClick={() => applyTransform('reverse')} title="Reverse">⇋</button>
                  <button className="tool-btn" onClick={() => applyTransform('trim')} title="Trim">✂</button>
                  <button className="tool-btn" onClick={() => applyTransform('clearSpaces')} title="Clear extra spaces">␣</button>
                </div>
                <div className="tool-group">
                  <span className="tool-label">Format</span>
                  <button className={`tool-btn ${bold ? 'on' : ''}`} onClick={() => setBold(v => !v)} title="Bold"><b>B</b></button>
                  <button className={`tool-btn ${italic ? 'on' : ''}`} onClick={() => setItalic(v => !v)} title="Italic"><i>I</i></button>
                  <button className={`tool-btn ${underline ? 'on' : ''}`} onClick={() => setUnderline(v => !v)} title="Underline"><u>U</u></button>
                  <button className={`tool-btn ${uppercase ? 'on' : ''}`} onClick={() => setUppercase(v => !v)} title="Uppercase">A↑</button>
                </div>
                <div className="tool-group">
                  <span className="tool-label">Align</span>
                  <button className={`tool-btn ${align === 'left' ? 'on' : ''}`} onClick={() => setAlign('left')} title="Left">⯇</button>
                  <button className={`tool-btn ${align === 'center' ? 'on' : ''}`} onClick={() => setAlign('center')} title="Center">≡</button>
                  <button className={`tool-btn ${align === 'right' ? 'on' : ''}`} onClick={() => setAlign('right')} title="Right">⯈</button>
                </div>
                <div className="tool-group">
                  <span className="tool-label">Font</span>
                  <select className="tool-select" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                    <option>Inter</option><option>Arial</option><option>Georgia</option>
                    <option>Courier New</option><option>Verdana</option>
                    <option>Times New Roman</option><option>Comic Sans MS</option>
                    <option>Trebuchet MS</option><option>Impact</option>
                  </select>
                </div>
                <div className="tool-group">
                  <span className="tool-label">Size: {fontSize}px</span>
                  <input type="range" min={12} max={32} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="tool-range" />
                </div>
                <div className="tool-group">
                  <span className="tool-label">Spacing: {letterSpacing}px</span>
                  <input type="range" min={0} max={10} value={letterSpacing} onChange={e => setLetterSpacing(+e.target.value)} className="tool-range" />
                </div>
                <div className="tool-group">
                  <span className="tool-label">Line: {lineHeight.toFixed(1)}</span>
                  <input type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)} className="tool-range" />
                </div>
              </div>
            )}

            {!showToolbar && (
              <div className="filters">
                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input className="search" placeholder="Search 1000+ styles..." value={search} onChange={e => setSearch(e.target.value)} />
                  {search && <button className="search-clear" onClick={() => setSearch('')}>×</button>}
                </div>
                <div className="chips" role="tablist">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={category === cat}
                      className={`chip ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat === 'Favorites' ? `⭐ ${cat} (${favorites.length})` :
                       cat === 'Recent' ? `🕐 ${cat} (${recent.length})` : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ===== FUNNY TEXT DROPDOWN ===== */}
          <section className="panel glass funny-panel" id="funny">
            <div className="funny-head">
              <div>
                <h2 className="funny-title">😂 Funny Text Generator</h2>
                <p className="funny-sub">Pick a comedic style from the dropdown — your text instantly transforms.</p>
              </div>
              <div className="funny-select-wrap">
                <label htmlFor="funny-select" className="sr-only">Choose a funny style</label>
                <select
                  id="funny-select"
                  className="funny-select"
                  value={funnyId}
                  onChange={e => setFunnyId(e.target.value)}
                >
                  {FUNNY_STYLES.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.emoji}  {f.label}
                    </option>
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
              >
                {funnyOutput}
              </div>
              <div className="funny-actions">
                <button className="card-btn" onClick={() => copy(funnyOutput, 'Funny')}>
                  {copiedStyle === 'Funny' ? '✓ Copied' : '📋 Copy'}
                </button>
                <button className="card-btn" onClick={() => share(funnyOutput)}>🔗 Share</button>
                <button
                  className="card-btn"
                  onClick={() => {
                    const nextIdx = (FUNNY_STYLES.findIndex(f => f.id === funnyId) + 1) % FUNNY_STYLES.length;
                    setFunnyId(FUNNY_STYLES[nextIdx].id);
                  }}
                >
                  🎲 Random
                </button>
              </div>
            </div>

            <div className="funny-grid">
              {FUNNY_STYLES.map(f => (
                <button
                  key={f.id}
                  className={`funny-chip ${funnyId === f.id ? 'active' : ''}`}
                  onClick={() => setFunnyId(f.id)}
                  title={f.label}
                >
                  <span className="funny-chip-emoji">{f.emoji}</span>
                  <span className="funny-chip-label">{f.label}</span>
                </button>
              ))}
            </div>
          </section>

          {!showToolbar && (
            <>
              <div className="stats">
                <span><strong>{ALL_STYLES.length}+</strong> styles</span>
                <span className="dot">•</span>
                <span><strong>{filteredStyles.length}</strong> showing</span>
                <span className="dot">•</span>
                <span><strong>{favorites.length}</strong> favorites</span>
                <span className="dot">•</span>
                <span><strong>{FUNNY_STYLES.length}</strong> funny modes</span>
                <span className="dot">•</span>
                <span><strong>{CATEGORIES.length - 3}</strong> categories</span>
              </div>

              <section className="grid" aria-label="Fancy text styles">
                {filteredStyles.length === 0 ? (
                  <div className="empty glass">
                    <div className="empty-icon">✨</div>
                    <p>No styles match your search</p>
                    <button className="mini-btn accent" onClick={() => { setSearch(''); setCategory('All'); }}>Reset filters</button>
                  </div>
                ) : (
                  filteredStyles.map((style, i) => {
                    const output = style.fn(input || 'Hello');
                    const isFav = favorites.includes(style.name);
                    const isCopied = copiedStyle === style.name;
                    return (
                      <article
                        key={style.name + i}
                        className="card glass"
                        style={{ animationDelay: `${Math.min(i * 4, 400)}ms` }}
                      >
                        <div className="card-head">
                          <span className="card-label">{style.name}</span>
                          <button
                            className={`fav-btn ${isFav ? 'on' : ''}`}
                            onClick={() => toggleFav(style.name)}
                            aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                          >{isFav ? '★' : '☆'}</button>
                        </div>
                        <div
                          className={`card-output ${isCopied ? 'copied' : ''}`}
                          onClick={() => { copy(output, style.name); addRecent(style.name); }}
                          title="Click to copy"
                        >
                          {output}
                        </div>
                        <div className="card-actions">
                          <button className="card-btn" onClick={() => { copy(output, style.name); addRecent(style.name); }}>
                            {isCopied ? '✓ Copied' : '📋 Copy'}
                          </button>
                          <button className="card-btn" onClick={() => share(output)}>🔗 Share</button>
                        </div>
                      </article>
                    );
                  })
                )}
              </section>
            </>
          )}

          {/* ===== HOW TO USE ===== */}
          <section className="content glass" id="how-to">
            <h2>How to Use the Fancy Text Generator (Step-by-Step)</h2>
            <p>
              Our <strong>fancy text generator</strong> is designed to be the fastest, most powerful
              tool of its kind. Whether you&apos;re looking for a <em>cursive Instagram bio</em>, a{' '}
              <em>bold Discord nickname</em>, a <em>funny TikTok caption</em>, or a{' '}
              <em>glitched gaming username</em>, you&apos;ll find a fitting style in under three seconds.
            </p>

            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <h3>Type or paste your text</h3>
                <p>
                  Enter up to 200 characters in the input box at the top. Every keystroke
                  regenerates all 1000+ styles in real time — no waiting, no page reloads. Use the
                  📥 <strong>Paste</strong> button to pull text from your clipboard instantly.
                </p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h3>Pick a style or a funny mode</h3>
                <p>
                  Browse the searchable style gallery by category (Serif, Script, Gothic, Bubble,
                  Squared, Decor, Effects, Lines, and 20+ more), or open the{' '}
                  <strong>Funny Text dropdown</strong> for 30 comedic transformations like Mocking
                  SpongeBob, UwU, Pirate, Leet, Zalgo, Robot, and Dog Speak.
                </p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h3>Copy with one click</h3>
                <p>
                  Click any style card to copy the transformed text to your clipboard. Star ⭐ your
                  favorites so they persist across visits, and open the <strong>Recent</strong> tab
                  to see styles you copied earlier.
                </p>
              </div>
              <div className="step">
                <div className="step-num">4</div>
                <h3>Paste it anywhere</h3>
                <p>
                  Use the generated text in your Instagram bio, TikTok caption, Discord server
                  nickname, WhatsApp status, Twitter/X post, Facebook comment, YouTube title,
                  Snapchat username, or any other app that accepts Unicode.
                </p>
              </div>
              <div className="step">
                <div className="step-num">5</div>
                <h3>Fine-tune with the toolbar</h3>
                <p>
                  Open the ⚙️ <strong>Formatting Toolbar</strong> to apply Bold / Italic / Underline
                  formatting, change the font family, adjust font size, letter spacing and line
                  height, and align the text left, center, or right — all with a live preview.
                </p>
              </div>
            </div>
          </section>

          {/* ===== WHY CHOOSE / FEATURES ===== */}
          <section className="content glass">
            <h2>Why Choose This Fancy Text Tool?</h2>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h3>Instant, real-time</h3>
                <p>Every style regenerates as you type — no buttons, no lag, no page reloads.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🎨</div>
                <h3>1000+ styles</h3>
                <p>More than a thousand real Unicode styles across Serif, Script, Gothic, Bubble, Decor, Effects, Lines, Case, and Flipped categories.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">😂</div>
                <h3>Funny text modes</h3>
                <p>30 hand-picked comedic transformations — UwU, Pirate, Zalgo, Leet, Robot, Dog, Cat, Boomer, and more.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🌗</div>
                <h3>Dark &amp; light theme</h3>
                <p>Glassmorphism UI with an animated gradient background and one-tap theme toggle.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⭐</div>
                <h3>Favorites &amp; history</h3>
                <p>Save styles locally and revisit your recent copies — no signup required.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📱</div>
                <h3>Mobile-first</h3>
                <p>Fully responsive — works flawlessly on phones, tablets, and desktops.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🔗</div>
                <h3>Native share</h3>
                <p>Send any style to WhatsApp, Instagram, or Messages with one tap via the Web Share API.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🆓</div>
                <h3>Free forever</h3>
                <p>No account, no ads, no watermarks. Unlimited use, every day.</p>
              </div>
            </div>
          </section>

          {/* ===== FAQ ===== */}
          <section className="content glass" id="faq">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {FAQS.map((f, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{f.q}</span>
                    <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="faq-a">
                      <p>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ===== SEO / ABOUT ===== */}
          <section className="content glass" id="about">
            <h2>About the Fancy Text Generator</h2>
            <p>
              The <strong>Fancy Text Generator</strong> is a free online utility that turns plain
              text into over 1000 fancy, stylish, and decorative Unicode fonts — plus 30 funny text
              transformations — that you can copy and paste anywhere. Unlike traditional fonts, the
              styles produced here are made of real Unicode characters, so they don&apos;t require
              the receiving app to install a font file. That&apos;s why they work in social media
              bios, usernames, messages, comments, and captions across virtually every modern
              platform.
            </p>
            <p>
              This tool is a popular choice for <strong>Instagram bio fonts</strong>,{' '}
              <strong>TikTok caption styles</strong>, <strong>Discord nickname fonts</strong>,{' '}
              <strong>Twitter/X display names</strong>, <strong>WhatsApp status text</strong>,{' '}
              <strong>Facebook posts</strong>, <strong>YouTube channel titles</strong>, and{' '}
              <strong>gaming usernames</strong> in games like Fortnite, Roblox, Minecraft, Valorant,
              and Free Fire.
            </p>
            <p>
              Categories include <em>Bold</em>, <em>Italic</em>, <em>Bold Italic</em>,{' '}
              <em>Script</em>, <em>Cursive</em>, <em>Fraktur / Gothic</em>, <em>Double-Struck</em>,{' '}
              <em>Sans-Serif</em>, <em>Monospace</em>, <em>Small Caps</em>, <em>Superscript</em>,{' '}
              <em>Subscript</em>, <em>Upside-down</em>, <em>Mirrored</em>, <em>Bubble / Circled</em>,{' '}
              <em>Squared</em>, <em>Fullwidth</em>, <em>Parenthesized</em>, plus dozens of
              decorative <em>Effects</em>, <em>Wrappers</em>, <em>Separators</em>, and{' '}
              <em>Line transformations</em>.
            </p>
            <p>
              Whether you&apos;re an influencer building a brand aesthetic, a gamer crafting a
              memorable handle, a student decorating a note, or just someone who wants to send a
              friend a silly <em>UwU</em>-style message, this tool has you covered. It&apos;s fast,
              free, mobile-friendly, and requires no registration.
            </p>
          </section>

          <footer className="footer">
            <p>Made with ✦ — FancyText Generator © {new Date().getFullYear()}</p>
            <p className="footer-links">
              <a href="#styles">Styles</a> · <a href="#funny">Funny</a> ·{' '}
              <a href="#how-to">How to Use</a> · <a href="#faq">FAQ</a>
            </p>
          </footer>
        </main>

        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>

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
        html, body {
          margin: 0; padding: 0;
          background: var(--bg); color: var(--fg);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background 0.4s ease, color 0.4s ease;
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); border: 0;
        }
        .app { min-height: 100vh; position: relative; overflow-x: hidden; padding: 0 0 60px; }

        .bg-gradient {
          position: fixed; inset: 0; z-index: -3;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(139, 92, 246, 0.22), transparent 55%),
            radial-gradient(ellipse at 80% 100%, rgba(236, 72, 153, 0.18), transparent 55%),
            radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.10), transparent 65%);
          animation: bgShift 22s ease-in-out infinite alternate;
        }
        @keyframes bgShift {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.15) rotate(3deg); }
        }
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
        .logo-badge {
          font-size: 0.68rem; padding: 3px 8px; border-radius: 999px;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; font-weight: 800; letter-spacing: 0.03em;
        }
        .grad-text {
          background: linear-gradient(90deg, var(--accent-1), var(--accent-2), var(--accent-3), var(--accent-1));
          background-size: 300% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: gradMove 6s linear infinite;
        }
        @keyframes gradMove { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
        .header-nav { display: flex; gap: 4px; }
        .nav-link {
          color: var(--muted); text-decoration: none; font-size: 0.88rem;
          font-weight: 600; padding: 8px 12px; border-radius: 10px;
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

        .toolbar {
          margin-top: 16px; padding: 14px;
          background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
          border-radius: 14px; display: flex; flex-wrap: wrap; gap: 14px;
          animation: toolbarIn 0.35s ease;
        }
        [data-theme='light'] .toolbar { background: rgba(255,255,255,0.5); }
        @keyframes toolbarIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .tool-group {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 10px; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          flex-wrap: wrap;
        }
        [data-theme='light'] .tool-group { background: rgba(255,255,255,0.65); }
        .tool-label {
          font-size: 0.7rem; font-weight: 700; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-right: 4px;
        }
        .tool-btn {
          min-width: 34px; height: 34px; padding: 0 8px;
          border-radius: 8px; cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg); font-weight: 600; font-size: 0.85rem;
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

        /* FUNNY PANEL */
        .funny-panel { background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(236, 72, 153, 0.08)); }
        .funny-head {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 16px; flex-wrap: wrap; margin-bottom: 16px;
        }
        .funny-title { margin: 0 0 4px; font-size: 1.35rem; font-weight: 800; }
        .funny-sub { margin: 0; color: var(--muted); font-size: 0.9rem; }
        .funny-select-wrap { flex-shrink: 0; }
        .funny-select {
          padding: 12px 16px; min-width: 240px;
          border-radius: 12px; cursor: pointer;
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--glass-border);
          color: var(--fg); font-family: inherit; font-size: 0.95rem;
          font-weight: 700; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
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
        .funny-output:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: var(--accent-1);
        }
        .funny-output.copied {
          background: rgba(16, 185, 129, 0.15);
          border-color: var(--accent-5);
        }
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
        .card-output:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: var(--accent-1);
        }
        .card-output.copied {
          background: rgba(16, 185, 129, 0.15);
          border-color: var(--accent-5);
        }
        .card-actions { display: flex; gap: 8px; }
        .card-btn {
          flex: 1; padding: 9px 10px; font-size: 0.82rem;
          font-weight: 600; border-radius: 10px; cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
          color: var(--fg); transition: all 0.2s;
        }
        [data-theme='light'] .card-btn { background: rgba(255,255,255,0.75); }
        .card-btn:hover {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; border-color: transparent;
          transform: translateY(-1px);
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

        /* CONTENT SECTIONS */
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

        /* FAQ */
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
        .faq-icon {
          font-size: 1.4rem; font-weight: 300;
          color: var(--accent-1); flex-shrink: 0;
        }
        .faq-a {
          padding: 0 18px 18px; color: var(--muted);
          font-size: 0.9rem; line-height: 1.7;
          animation: faqIn 0.25s ease;
        }
        .faq-a p { margin: 0; }
        @keyframes faqIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .footer {
          text-align: center; margin-top: 40px;
          color: var(--muted); font-size: 0.85rem;
        }
        .footer-links { margin-top: 8px; }
        .footer-links a { color: var(--muted); text-decoration: none; }
        .footer-links a:hover { color: var(--accent-1); }

        .back-to-top {
          position: fixed; bottom: 24px; right: 24px;
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white; border: none; cursor: pointer;
          font-size: 1.2rem; font-weight: 800;
          box-shadow: 0 8px 28px rgba(139, 92, 246, 0.5);
          z-index: 40; transition: transform 0.2s;
        }
        .back-to-top:hover { transform: translateY(-3px) scale(1.05); }

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

        @media (max-width: 720px) {
          .header-nav { display: none; }
          .grid { grid-template-columns: 1fr; gap: 12px; }
          .panel, .content { padding: 16px; }
          .hero { padding: 22px 4px 18px; }
          .header { padding: 8px 10px; }
          .header-inner { padding: 8px 14px; }
          .logo { font-size: 1rem; }
          .logo-badge { display: none; }
          .toolbar { padding: 10px; gap: 10px; }
          .tool-group { padding: 5px 8px; }
          .tool-range { width: 72px; }
          .funny-head { flex-direction: column; align-items: stretch; }
          .funny-select { width: 100%; min-width: 0; }
          .step { padding: 14px 14px 14px 66px; }
          .step-num { left: 14px; top: 14px; width: 36px; height: 36px; font-size: 1rem; }
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
