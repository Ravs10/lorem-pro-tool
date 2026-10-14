"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';

// ============================================================
// STYLE ENGINE — generates 1000+ real transform styles
// ============================================================

const BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const BASE_ARR = BASE.split('');

type StyleDef = { name: string; fn: (s: string) => string; category: string; tags?: string[] };

// ----- Unicode alphabet maps (each char is a separate codepoint) -----
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

// ----- Combining diacritics (each applied per character) -----
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

// ----- Wrap / decorate styles -----
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

// ----- Per-character join separators (spaced styles) -----
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

// ----- Line transforms -----
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
    const top = '╔' + '═'.repeat(max + 2) + '╗';
    const bot = '╚' + '═'.repeat(max + 2) + '╝';
    const mid = lines.map(l => '║ ' + l.padEnd(max) + ' ║').join('\n');
    return `${top}\n${mid}\n${bot}`;
  }, 'Brackets'],
  ['Double Box', s => {
    const lines = s.split('\n');
    const max = Math.max(...lines.map(l => l.length));
    const top = '╔' + '═'.repeat(max + 2) + '╗';
    const bot = '╚' + '═'.repeat(max + 2) + '╝';
    const mid = lines.map(l => '║ ' + l.padEnd(max) + ' ║').join('\n');
    return `╔${'═'.repeat(max + 2)}╗\n║ ${''.padEnd(max)} ║\n${mid}\n║ ${''.padEnd(max)} ║\n╚${'═'.repeat(max + 2)}╝`;
  }, 'Brackets'],
  ['Rounded Box', s => {
    const lines = s.split('\n');
    const max = Math.max(...lines.map(l => l.length));
    const top = '╭' + '─'.repeat(max + 2) + '╮';
    const bot = '╰' + '─'.repeat(max + 2) + '╯';
    const mid = lines.map(l => '│ ' + l.padEnd(max) + ' │').join('\n');
    return `${top}\n${mid}\n${bot}`;
  }, 'Brackets'],
  ['Wave Border', s => {
    const lines = s.split('\n');
    const max = Math.max(...lines.map(l => l.length));
    const top = '〜' + '〜'.repeat(max + 2) + '〜';
    const bot = '〜' + '〜'.repeat(max + 2) + '〜';
    const mid = lines.map(l => '│ ' + l.padEnd(max) + ' │').join('\n');
    return `${top}\n${mid}\n${bot}`;
  }, 'Brackets'],
];

// ----- Mirror / Flip transforms -----
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

// ----- Build ALL styles -----
function buildAllStyles(): StyleDef[] {
  const styles: StyleDef[] = [];
  styles.push({ name: 'Original', fn: s => s, category: 'Plain' });

  // Alphabet transforms
  ALPHA_MAPS.forEach(([name, chars, cat]) => {
    const arr = [...chars];
    const map: Record<string, string> = {};
    for (let i = 0; i < BASE.length && i < arr.length; i++) map[BASE[i]] = arr[i];
    styles.push({ name, category: cat, fn: s => s.split('').map(c => map[c] || c).join('') });
  });

  // Combining marks
  COMBINING_MARKS.forEach(([name, mark, cat]) => {
    styles.push({ name, category: cat, fn: s => [...s].join(mark) });
    // also combined with bold
    const boldMap: Record<string, string> = {};
    const boldChars = [...ALPHA_MAPS[0][1]];
    for (let i = 0; i < BASE.length && i < boldChars.length; i++) boldMap[BASE[i]] = boldChars[i];
    styles.push({
      name: `Bold ${name}`,
      category: cat,
      fn: s => [...s.split('').map(c => boldMap[c] || c).join('')].join(mark),
    });
  });

  // Wrap styles
  WRAP_STYLES.forEach(([name, fn, cat]) => styles.push({ name, category: cat, fn }));

  // Separator styles
  SEPARATOR_STYLES.forEach(([name, sep, cat]) => {
    styles.push({ name, category: cat, fn: s => s.split('').join(sep) });
    // with bold
    const boldMap: Record<string, string> = {};
    const boldChars = [...ALPHA_MAPS[0][1]];
    for (let i = 0; i < BASE.length && i < boldChars.length; i++) boldMap[BASE[i]] = boldChars[i];
    styles.push({
      name: `Bold ${name}`,
      category: cat,
      fn: s => s.split('').map(c => boldMap[c] || c).join(sep),
    });
  });

  // Line styles
  LINE_STYLES.forEach(([name, fn, cat]) => styles.push({ name, category: cat, fn }));

  // Case/flip
  FLIP_STYLES.forEach(([name, fn, cat]) => styles.push({ name, category: cat, fn }));

  // Combined alpha × mark (Bold Script + Strikethrough, etc.)
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

  // Bold + wrap combos
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
// REACT COMPONENT
// ============================================================
type Tab = 'styles' | 'favorites' | 'toolbar';

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

  // --- Formatting toolbar ---
  const applyTransform = useCallback((type: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab' | 'reverse' | 'trim' | 'clearSpaces') => {
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
        <title>Fancy Text Generator — 1000+ Stylish Fonts & Cool Text Styles</title>
        <meta name="description" content="Transform your text with 1000+ fancy fonts, stylish letters, and cool Unicode styles. Free online fancy text generator for Instagram, Twitter, Facebook & more. Copy & paste instantly." />
        <meta name="keywords" content="fancy text, fancy text generator, stylish text, cool fonts, unicode text, instagram fonts, fancy letters, text styles, copy paste fonts" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={theme === 'dark' ? '#07071a' : '#f5f5ff'} />
        <meta property="og:title" content="Fancy Text Generator — 1000+ Stylish Fonts" />
        <meta property="og:description" content="Transform text with 1000+ fancy fonts & Unicode styles. Free, fast, no signup." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://example.com/fancy-text" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org', '@type': 'WebApplication',
            name: 'Fancy Text Generator', description: 'Generate 1000+ fancy text styles instantly.',
            applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0' },
          }),
        }} />
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

        {/* ===== HEADER ===== */}
        <header className="header">
          <div className="header-inner glass">
            <div className="logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">Fancy<span className="grad-text">Text</span></span>
              <span className="logo-badge">{ALL_STYLES.length}+</span>
            </div>
            <nav className="header-nav">
              <a href="#styles" className="nav-link">Styles</a>
              <a href="#about" className="nav-link">About</a>
            </nav>
            <div className="header-actions">
              <button className="icon-btn" onClick={() => setShowToolbar(v => !v)} aria-label="Toggle toolbar" title="Formatting toolbar">
                {showToolbar ? '▼' : '⚙️'}
              </button>
              <button className="icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme" title="Theme">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        <main className="main">
          {/* ===== HERO ===== */}
          <section className="hero">
            <div className="hero-pill glass">🚀 {ALL_STYLES.length}+ styles · No signup · Free forever</div>
            <h1 className="hero-title">
              1000+ <span className="grad-text">Fancy Text</span> Styles
            </h1>
            <p className="hero-sub">
              Type once · Copy any style · Paste anywhere. Works with Instagram, TikTok, Discord, WhatsApp, Twitter/X &amp; more.
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

            {/* ===== FORMATTING TOOLBAR ===== */}
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
                    <option>Inter</option>
                    <option>Arial</option>
                    <option>Georgia</option>
                    <option>Courier New</option>
                    <option>Verdana</option>
                    <option>Times New Roman</option>
                    <option>Comic Sans MS</option>
                    <option>Trebuchet MS</option>
                    <option>Impact</option>
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

            {/* ===== FILTERS ===== */}
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

          {!showToolbar && (
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

              {/* ===== GRID ===== */}
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

          {/* ===== SEO ===== */}
          <section className="seo glass" id="about">
            <h2>About Fancy Text Generator</h2>
            <p>
              Our <strong>fancy text generator</strong> transforms ordinary text into over {ALL_STYLES.length}+ stylish Unicode fonts instantly. Whether you need <em>bold</em>, <em>italic</em>,
              cursive, gothic, bubble, decorative, or combined effects — you can copy and paste them
              anywhere including Instagram bios, Twitter/X posts, Facebook comments, Discord
              messages, TikTok captions, and WhatsApp chats.
            </p>
            <h3>How to use</h3>
            <ol>
              <li>Type or paste your text in the input field above.</li>
              <li>Browse {ALL_STYLES.length}+ fancy font styles instantly generated.</li>
              <li>Click any style to copy it — or hit Share to send it anywhere.</li>
              <li>Use the toolbar to fine-tune fonts, spacing, alignment and case.</li>
            </ol>
            <h3>Features</h3>
            <ul>
              <li><strong>{ALL_STYLES.length}+</strong> Unicode text styles across {CATEGORIES.length - 3}+ categories</li>
              <li>Rich formatting toolbar with 20+ transform actions</li>
              <li>Dark / light theme toggle</li>
              <li>Favorites &amp; Recent history (saved locally)</li>
              <li>Native share &amp; one-click copy</li>
              <li>Download styles as .txt</li>
              <li>Fully responsive, works on any device</li>
            </ul>
          </section>

          <footer className="footer">
            <p>Made with ✦ — FancyText Generator © {new Date().getFullYear()}</p>
          </footer>
        </main>

        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >↑</button>

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

        /* HEADER */
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
          color: var(--muted); text-decoration: none; font-size: 0.9rem;
          font-weight: 600; padding: 8px 14px; border-radius: 10px;
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

        /* HERO */
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
          margin: 0; max-width: 680px; margin-inline: auto; line-height: 1.6;
        }

        /* PANEL */
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

        /* TOOLBAR */
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
        .tool-range {
          width: 100px; accent-color: var(--accent-1); cursor: pointer;
        }

        /* FILTERS */
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

        /* STATS */
        .stats {
          display: flex; justify-content: center; align-items: center;
          gap: 10px; color: var(--muted); font-size: 0.85rem;
          margin: 4px 0 16px; flex-wrap: wrap;
        }
        .stats strong { color: var(--fg); }
        .dot { opacity: 0.5; }

        /* GRID */
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

        /* EMPTY */
        .empty {
          grid-column: 1 / -1; text-align: center;
          padding: 60px 20px; color: var(--muted);
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 12px; animation: pulse 2s infinite; }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }

        /* SEO */
        .seo { margin-top: 30px; padding: 28px; line-height: 1.75; }
        .seo h2 { margin-top: 0; font-size: 1.45rem; }
        .seo h3 { font-size: 1.05rem; margin: 20px 0 6px; }
        .seo p, .seo li { color: var(--muted); font-size: 0.94rem; }
        .seo strong { color: var(--fg); }
        .seo ul, .seo ol { padding-left: 20px; }

        .footer { text-align: center; margin-top: 40px; color: var(--muted); font-size: 0.85rem; }

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
          .panel { padding: 14px; }
          .hero { padding: 22px 4px 18px; }
          .seo { padding: 20px 18px; }
          .header { padding: 8px 10px; }
          .header-inner { padding: 8px 14px; }
          .logo { font-size: 1rem; }
          .logo-badge { display: none; }
          .toolbar { padding: 10px; gap: 10px; }
          .tool-group { padding: 5px 8px; }
          .tool-range { width: 72px; }
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
