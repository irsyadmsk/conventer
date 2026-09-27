// @ts-nocheck
/**
 * Complete Stylish & Aesthetic Font Generator
 * Muhammad Irsyad Sirojul Khoeir - irsyads.com
 */

const Stylish = (() => {
  function mapChars(text, mapUpper, mapLower, mapDigits) {
    return text.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90 && mapUpper) {
        return mapUpper[code - 65] || c;
      }
      if (code >= 97 && code <= 122 && mapLower) {
        return mapLower[code - 97] || c;
      }
      if (code >= 48 && code <= 57 && mapDigits) {
        return mapDigits[code - 48] || c;
      }
      return c;
    }).join('');
  }

  function combineChars(text, mark) {
    return text.split('').map(c => c === ' ' ? ' ' : c + mark).join('');
  }

  // --- MATHEMATICAL ALPHANUMERIC SYMBOLS ---

  // 1. Fraktur Bold (Gothic Bold)
  const frakturBoldUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D56C + i));
  const frakturBoldLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D586 + i));

  // 2. Fraktur Normal (Gothic)
  const frakturSpecial = { 'C': 'ℭ', 'H': 'ℌ', 'I': 'ℑ', 'R': 'ℜ', 'Z': 'ℨ' };
  const frakturUpper = Array.from({length: 26}, (_, i) => {
    const ch = String.fromCharCode(65 + i);
    return frakturSpecial[ch] || String.fromCodePoint(0x1D504 + i);
  });
  const frakturLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D51E + i));

  // 3. Bold Serif
  const boldSerifUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D400 + i));
  const boldSerifLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D41A + i));
  const boldDigits = Array.from({length: 10}, (_, i) => String.fromCodePoint(0x1D7CE + i));

  // 4. Italic Serif
  const italicUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D434 + i));
  const italicLower = Array.from({length: 26}, (_, i) => i === 7 ? 'ℎ' : String.fromCodePoint(0x1D44E + i));

  // 5. Bold Italic Serif
  const boldItalicUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D468 + i));
  const boldItalicLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D482 + i));

  // 6. Cursive Bold (Script Bold)
  const cursiveBoldUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D4D0 + i));
  const cursiveBoldLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D4EA + i));

  // 7. Cursive Normal (Script Normal)
  const scriptSpecial = {
    'B': 'ℬ', 'E': 'ℰ', 'F': 'ℱ', 'H': 'ℋ', 'I': 'ℐ', 'L': 'ℒ', 'M': 'ℳ', 'R': 'ℛ',
    'e': 'ℯ', 'g': 'ℊ', 'o': 'ℴ'
  };
  const scriptUpper = Array.from({length: 26}, (_, i) => {
    const ch = String.fromCharCode(65 + i);
    return scriptSpecial[ch] || String.fromCodePoint(0x1D49C + i);
  });
  const scriptLower = Array.from({length: 26}, (_, i) => {
    const ch = String.fromCharCode(97 + i);
    return scriptSpecial[ch] || String.fromCodePoint(0x1D4B6 + i);
  });

  // 8. Double Struck (Blackboard Bold)
  const doubleStruckSpecial = {
    'C': 'ℂ', 'H': 'ℍ', 'N': 'ℕ', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 'Z': 'ℤ'
  };
  const doubleStruckUpper = Array.from({length: 26}, (_, i) => {
    const ch = String.fromCharCode(65 + i);
    return doubleStruckSpecial[ch] || String.fromCodePoint(0x1D538 + i);
  });
  const doubleStruckLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D552 + i));
  const doubleStruckDigits = Array.from({length: 10}, (_, i) => String.fromCodePoint(0x1D7D8 + i));

  // 9. Sans-Serif Normal
  const sansUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D5A0 + i));
  const sansLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D5BA + i));
  const sansDigits = Array.from({length: 10}, (_, i) => String.fromCodePoint(0x1D7E2 + i));

  // 10. Sans-Serif Bold
  const sansBoldUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D5D4 + i));
  const sansBoldLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D5EE + i));
  const sansBoldDigits = Array.from({length: 10}, (_, i) => String.fromCodePoint(0x1D7EC + i));

  // 11. Sans-Serif Italic
  const sansItalicUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D608 + i));
  const sansItalicLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D622 + i));

  // 12. Sans-Serif Bold Italic
  const sansBoldItalicUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D63C + i));
  const sansBoldItalicLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D656 + i));

  // 13. Monospace (Typewriter)
  const monoUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D670 + i));
  const monoLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1D68A + i));
  const monoDigits = Array.from({length: 10}, (_, i) => String.fromCodePoint(0x1D7F6 + i));

  // 14. Squared Letters
  const sqUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1F130 + i));

  // 15. Negative Squared Letters (Black Square)
  const sqBlackUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1F170 + i));

  // 16. Circled (Bubble White)
  const circUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x24B6 + i));
  const circLower = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x24D0 + i));
  const circDigits = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?'];

  // 17. Negative Circled (Black Bubble)
  const circBlackUpper = Array.from({length: 26}, (_, i) => String.fromCodePoint(0x1F150 + i));
  const circBlackDigits = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?'];

  // 18. Small Caps
  const smallCapsMap = {
    'a': '?', 'b': '?', 'c': '?', 'd': '?', 'e': '?', 'f': '?', 'g': '?', 'h': '?',
    'i': '?', 'j': '?', 'k': '?', 'l': '?', 'm': '?', 'n': '?', 'o': '?', 'p': '?',
    'q': '?', 'r': '?', 's': '?', 't': '?', 'u': '?', 'v': '?', 'w': '?', 'x': 'x',
    'y': '?', 'z': '?'
  };
  function toSmallCaps(text) {
    return text.toLowerCase().split('').map(c => smallCapsMap[c] || c).join('');
  }

  // 19. Full Width (Vaporwave)
  function toFullWidth(text) {
    return text.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 33 && code <= 126) {
        return String.fromCharCode(code + 0xFEE0);
      }
      return c === ' ' ? '　' : c;
    }).join('');
  }

  // 20. Upside Down
  const normalUpside = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const flipUpside   = "?q?p??b????l?uodb?s?n??x?z?q?????HI???WNO???S???MX?Z0?????9?86";
  function toUpsideDown(text) {
    let res = '';
    for (let i = 0; i < text.length; i++) {
      const idx = normalUpside.indexOf(text[i]);
      res += idx !== -1 ? flipUpside[idx] : text[i];
    }
    return res.split('').reverse().join('');
  }

  // Main Generator Function
  function generateAll(inputText, category = 'all') {
    if (!inputText) inputText = 'Muhammad Irsyad Sirojul Khoeir';
    const list = [];

    // CATEGORY 1: GOTHIC & FRAKTUR
    if (category === 'all' || category === 'gothic') {
      list.push({
        category: 'gothic',
        title: 'Fraktur Bold (Gothic Tebal)',
        text: mapChars(inputText, frakturBoldUpper, frakturBoldLower)
      });
      list.push({
        category: 'gothic',
        title: 'Fraktur Normal (Gothic Klasik)',
        text: mapChars(inputText, frakturUpper, frakturLower)
      });
      list.push({
        category: 'gothic',
        title: 'Gothic + Ornamen Sayap',
        text: '\u0FD0\u0F04 ' + mapChars(inputText, frakturBoldUpper, frakturBoldLower) + ' \u0F04\u0FD0'
      });
    }

    // CATEGORY 2: SCRIPT & KALIGRAFI
    if (category === 'all' || category === 'script') {
      list.push({
        category: 'script',
        title: 'Cursive Bold (Kaligrafi Tebal)',
        text: mapChars(inputText, cursiveBoldUpper, cursiveBoldLower)
      });
      list.push({
        category: 'script',
        title: 'Script Handwriting (Tulisan Tangan Indah)',
        text: mapChars(inputText, scriptUpper, scriptLower)
      });
      list.push({
        category: 'script',
        title: 'Cursive + Kilau Estetik',
        text: '\u2728 ' + mapChars(inputText, cursiveBoldUpper, cursiveBoldLower) + ' \u2728'
      });
    }

    // CATEGORY 3: BOLD & ITALIC
    if (category === 'all' || category === 'bold') {
      list.push({
        category: 'bold',
        title: 'Bold Serif (Tebal Klasik)',
        text: mapChars(inputText, boldSerifUpper, boldSerifLower, boldDigits)
      });
      list.push({
        category: 'bold',
        title: 'Sans Bold (Tebal Modern)',
        text: mapChars(inputText, sansBoldUpper, sansBoldLower, sansBoldDigits)
      });
      list.push({
        category: 'bold',
        title: 'Italic Serif (Miring Elegan)',
        text: mapChars(inputText, italicUpper, italicLower)
      });
      list.push({
        category: 'bold',
        title: 'Bold Italic Serif (Tebal Miring)',
        text: mapChars(inputText, boldItalicUpper, boldItalicLower)
      });
      list.push({
        category: 'bold',
        title: 'Sans Italic (Miring Modern)',
        text: mapChars(inputText, sansItalicUpper, sansItalicLower)
      });
      list.push({
        category: 'bold',
        title: 'Sans Bold Italic (Tebal Miring Modern)',
        text: mapChars(inputText, sansBoldItalicUpper, sansBoldItalicLower)
      });
    }

    // CATEGORY 4: DOUBLE STRUCK & MONOSPACE
    if (category === 'all' || category === 'blackboard') {
      list.push({
        category: 'blackboard',
        title: 'Double Struck (Blackboard Papan Tulis)',
        text: mapChars(inputText, doubleStruckUpper, doubleStruckLower, doubleStruckDigits)
      });
      list.push({
        category: 'blackboard',
        title: 'Monospace (Mesin Tik / Typewriter)',
        text: mapChars(inputText, monoUpper, monoLower, monoDigits)
      });
      list.push({
        category: 'blackboard',
        title: 'Full Width (Vaporwave Estetik)',
        text: toFullWidth(inputText)
      });
      list.push({
        category: 'blackboard',
        title: 'Small Caps (Kapital Mini Elegan)',
        text: toSmallCaps(inputText)
      });
    }

    // CATEGORY 5: KOTAK & LINGKARAN (BOXED & CIRCLED)
    if (category === 'all' || category === 'enclosed') {
      list.push({
        category: 'enclosed',
        title: 'Circled (Gelembung Lingkaran Putih)',
        text: mapChars(inputText, circUpper, circLower, circDigits)
      });
      list.push({
        category: 'enclosed',
        title: 'Black Circled (Gelembung Hitam Pekat)',
        text: mapChars(inputText.toUpperCase(), circBlackUpper, circBlackUpper, circBlackDigits)
      });
      list.push({
        category: 'enclosed',
        title: 'Squared (Kotak Putih)',
        text: mapChars(inputText.toUpperCase(), sqUpper, sqUpper)
      });
      list.push({
        category: 'enclosed',
        title: 'Black Squared (Kotak Hitam)',
        text: mapChars(inputText.toUpperCase(), sqBlackUpper, sqBlackUpper)
      });
    }

    // CATEGORY 6: CORETAN & GARIS (COMBINING MARKS)
    if (category === 'all' || category === 'lines') {
      list.push({
        category: 'lines',
        title: 'Coret Tengah (Strikethrough)',
        text: combineChars(inputText, '̶')
      });
      list.push({
        category: 'lines',
        title: 'Garis Bawah (Underline)',
        text: combineChars(inputText, '̲')
      });
      list.push({
        category: 'lines',
        title: 'Garis Bawah Ganda (Double Underline)',
        text: combineChars(inputText, '̳')
      });
      list.push({
        category: 'lines',
        title: 'Garis Miring Coret (Slash Through)',
        text: combineChars(inputText, '̸')
      });
      list.push({
        category: 'lines',
        title: 'Garis Gelombang Bawah (Wavy Underline)',
        text: combineChars(inputText, '̰')
      });
      list.push({
        category: 'lines',
        title: 'Titik di Bawah (Dotted Underline)',
        text: combineChars(inputText, '̣')
      });
      list.push({
        category: 'lines',
        title: 'Teks Terbalik (Upside Down)',
        text: toUpsideDown(inputText)
      });
    }

    // CATEGORY 7: DEKORASI & FRAME ESTETIK
    if (category === 'all' || category === 'decorations') {
      const scriptText = mapChars(inputText, cursiveBoldUpper, cursiveBoldLower);
      const frakturText = mapChars(inputText, frakturBoldUpper, frakturBoldLower);
      const scText = toSmallCaps(inputText);

      list.push({
        category: 'decorations',
        title: 'Mahkota Kerajaan (Crown Royal)',
        text: '\u{1F451} ' + scriptText + ' \u{1F451}'
      });
      list.push({
        category: 'decorations',
        title: 'Bintang Galaksi (Starry Galaxy)',
        text: '\u2605\u5F61 ' + scriptText + ' \u5F61\u2605'
      });
      list.push({
        category: 'decorations',
        title: 'Pedang Prajurit (Swords Battle)',
        text: '\u2694\uFE0F ' + frakturText + ' \u2694\uFE0F'
      });
      list.push({
        category: 'decorations',
        title: 'Kurung Sudut Jepang (Japanese Brackets)',
        text: '\u263E ' + scText + ' \u263D'
      });
      list.push({
        category: 'decorations',
        title: 'Sudut Putih Kaligrafi',
        text: '\u3010 ' + scriptText + ' \u3011'
      });
      list.push({
        category: 'decorations',
        title: 'Bunga Sakura Romantis',
        text: '\u{1F338} ' + scriptText + ' \u{1F338}'
      });
      list.push({
        category: 'decorations',
        title: 'Bulan Sabit Malam (Crescent Moon)',
        text: '\u300E ' + scriptText + ' \u300F'
      });
      list.push({
        category: 'decorations',
        title: 'Kilau Berlian (Diamond Sparkle)',
        text: '\u2727\u00B7 \u2726 ' + scriptText + ' \u2726 \u00B7\u2727'
      });
      list.push({
        category: 'decorations',
        title: 'Gaya Uang Dolar (Banknote)',
        text: inputText.split('').map(c => c === ' ' ? ' ' : '[??' + c + '??]').join('')
      });
    }

    return list;
  }

  return { generateAll };
})();

export default Stylish;
