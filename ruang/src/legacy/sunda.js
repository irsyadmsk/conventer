/**
 * Aksara Sunda (Sundanese Script) Transliteration Engine
 * Converts Latin Sundanese text to Aksara Sunda (Unicode U+1B80..U+1BBF) and vice-versa.
 * Developed for Muhammad Irsyad Sirojul Khoeir, S.Sos., M.Sos., C.PS.
 */



  // Unicode Definitions (Escaped for absolute cross-platform reliability)
  const SWARA = {
    'a': '\u1B83',
    'i': '\u1B84',
    'u': '\u1B85',
    'é': '\u1B86',
    'è': '\u1B86',
    'o': '\u1B87',
    'e': '\u1B88',
    'eu': '\u1B89'
  };

  const NGALAGENA = {
    'ka': '\u1B8A',
    'qa': '\u1B8B',
    'ga': '\u1B8C',
    'nga': '\u1B8D',
    'ca': '\u1B8E',
    'ja': '\u1B8F',
    'za': '\u1B90',
    'nya': '\u1B91',
    'ta': '\u1B92',
    'da': '\u1B93',
    'na': '\u1B94',
    'pa': '\u1B95',
    'fa': '\u1B96',
    'va': '\u1B97',
    'ba': '\u1B98',
    'ma': '\u1B99',
    'ya': '\u1B9A',
    'ra': '\u1B9B',
    'la': '\u1B9C',
    'wa': '\u1B9D',
    'sa': '\u1B9E',
    'xa': '\u1B9F',
    'ha': '\u1BA0',
    'kha': '\u1BAE',
    'sya': '\u1BAF'
  };

  // Rarangkén Vowel Modifiers
  const RARANGKEN_SWARA = {
    'i': '\u1BA4',    // panghulu
    'u': '\u1BA5',    // panyuku
    'é': '\u1BA6',    // panéléng
    'è': '\u1BA6',
    'o': '\u1BA7',    // panolong
    'e': '\u1BA8',    // pamepet
    'eu': '\u1BA9'    // paneuleung
  };

  // Rarangkén Consonant Infixes (Sisipan)
  const RARANGKEN_INFIX = {
    'y': '\u1BA1',    // pamingkal (-ya-)
    'r': '\u1BA2',    // panyakra (-ra-)
    'l': '\u1BA3'     // panyiku (-la-)
  };

  // Final Consonants (Panyecek, Panglayar, Pangwisad, Pamaéh)
  const RARANGKEN_FINAL = {
    'ng': '\u1B80',   // panyecek
    'r': '\u1B81',    // panglayar
    'h': '\u1B82'     // pangwisad
  };

  const PAMAEH = '\u1BAA'; // pamaéh (killer / virama)

  // Digits
  const DIGITS = {
    '0': '\u1BB0',
    '1': '\u1BB1',
    '2': '\u1BB2',
    '3': '\u1BB3',
    '4': '\u1BB4',
    '5': '\u1BB5',
    '6': '\u1BB6',
    '7': '\u1BB7',
    '8': '\u1BB8',
    '9': '\u1BB9'
  };

  // Reverse mapping for Sunda to Latin
  const REVERSE_SWARA = {
    '\u1B83': 'a',
    '\u1B84': 'i',
    '\u1B85': 'u',
    '\u1B86': 'é',
    '\u1B87': 'o',
    '\u1B88': 'e',
    '\u1B89': 'eu'
  };

  const REVERSE_NGALAGENA = {
    '\u1B8A': 'k',
    '\u1B8B': 'q',
    '\u1B8C': 'g',
    '\u1B8D': 'ng',
    '\u1B8E': 'c',
    '\u1B8F': 'j',
    '\u1B90': 'z',
    '\u1B91': 'ny',
    '\u1B92': 't',
    '\u1B93': 'd',
    '\u1B94': 'n',
    '\u1B95': 'p',
    '\u1B96': 'f',
    '\u1B97': 'v',
    '\u1B98': 'b',
    '\u1B99': 'm',
    '\u1B9A': 'y',
    '\u1B9B': 'r',
    '\u1B9C': 'l',
    '\u1B9D': 'w',
    '\u1B9E': 's',
    '\u1B9F': 'x',
    '\u1BA0': 'h',
    '\u1BAE': 'kh',
    '\u1BAF': 'sy'
  };

  const REVERSE_RARANGKEN_SWARA = {
    '\u1BA4': 'i',
    '\u1BA5': 'u',
    '\u1BA6': 'é',
    '\u1BA7': 'o',
    '\u1BA8': 'e',
    '\u1BA9': 'eu'
  };

  const REVERSE_INFIX = {
    '\u1BA1': 'y',
    '\u1BA2': 'r',
    '\u1BA3': 'l'
  };

  const REVERSE_FINAL = {
    '\u1B80': 'ng',
    '\u1B81': 'r',
    '\u1B82': 'h'
  };

  const REVERSE_DIGITS = {
    '\u1BB0': '0',
    '\u1BB1': '1',
    '\u1BB2': '2',
    '\u1BB3': '3',
    '\u1BB4': '4',
    '\u1BB5': '5',
    '\u1BB6': '6',
    '\u1BB7': '7',
    '\u1BB8': '8',
    '\u1BB9': '9'
  };

  /**
   * Convert Latin string to Aksara Sunda
   * @param {string} text 
   * @param {object} options { wrapNumbers: true }
   * @returns {string}
   */
  function latinToSunda(text, options = {}) {
    if (!text) return '';
    const wrapNumbers = options.wrapNumbers !== false;

    let result = '';
    let i = 0;
    const len = text.length;

    const isDigit = (ch) => ch >= '0' && ch <= '9';
    const isLetter = (ch) => /[a-zA-Z\u00C0-\u017E]/.test(ch);

    while (i < len) {
      const ch = text[i];

      // 1. Handle Digits (grouped and optionally wrapped with | )
      if (isDigit(ch)) {
        let numStr = '';
        while (i < len && isDigit(text[i])) {
          numStr += DIGITS[text[i]];
          i++;
        }
        if (wrapNumbers) {
          result += '|' + numStr + '|';
        } else {
          result += numStr;
        }
        continue;
      }

      // 2. Non-letters: spaces, punctuation, symbols
      if (!isLetter(ch)) {
        result += ch;
        i++;
        continue;
      }

      // 3. Letters - tokenize into syllable components
      let consonant = '';
      let cLen = 0;
      const lower2 = text.substr(i, 2).toLowerCase();
      const lower1 = text.substr(i, 1).toLowerCase();

      if (lower2 === 'ng' || lower2 === 'ny' || lower2 === 'kh' || lower2 === 'sy') {
        consonant = lower2;
        cLen = 2;
      } else if (/[b-df-hj-np-tv-z]/.test(lower1)) {
        consonant = lower1;
        cLen = 1;
      }

      // If no consonant, it starts with an independent vowel (Aksara Swara)
      if (!consonant) {
        const v2 = text.substr(i, 2).toLowerCase();
        let v = '';
        let vLen = 0;
        if (v2 === 'eu') {
          v = 'eu';
          vLen = 2;
        } else if (lower1 === '\u00E9' || lower1 === '\u00E8') { // é or è
          v = 'é';
          vLen = 1;
        } else if (/[aiueo]/.test(lower1)) {
          v = lower1;
          vLen = 1;
        }

        if (v && SWARA[v]) {
          result += SWARA[v];
          i += vLen;
          continue;
        } else {
          result += ch;
          i++;
          continue;
        }
      }

      // Consonant found
      i += cLen;

      // Check for Infix (Sisipan): -y-, -r-, -l- followed by a vowel
      let infix = '';
      if (i < len) {
        const nextChar = text[i].toLowerCase();
        const afterNext = i + 1 < len ? text[i + 1].toLowerCase() : '';
        if ((nextChar === 'y' || nextChar === 'r' || nextChar === 'l') && 
            (/[aiueo\u00E9\u00E8]/.test(afterNext) || afterNext === 'e')) {
          infix = nextChar;
          i++;
        }
      }

      // Check for Vowel following consonant/infix
      let vowel = '';
      let vLen = 0;
      if (i < len) {
        const v2 = text.substr(i, 2).toLowerCase();
        const v1 = text.substr(i, 1).toLowerCase();
        if (v2 === 'eu') {
          vowel = 'eu';
          vLen = 2;
        } else if (v1 === '\u00E9' || v1 === '\u00E8') {
          vowel = 'é';
          vLen = 1;
        } else if (/[aiueo]/.test(v1)) {
          vowel = v1;
          vLen = 1;
        }
      }

      // Get Base Ngalagena character
      const baseChar = NGALAGENA[consonant + 'a'] || NGALAGENA['ha'];
      let syll = baseChar;

      // Attach Infix if any
      if (infix && RARANGKEN_INFIX[infix]) {
        syll += RARANGKEN_INFIX[infix];
      }

      if (vowel) {
        i += vLen;
        // Attach Vowel Modifier (unless 'a', which is default)
        if (vowel !== 'a' && RARANGKEN_SWARA[vowel]) {
          syll += RARANGKEN_SWARA[vowel];
        }

        // Now check for coda (final consonant in this syllable)
        if (i < len) {
          const rem2 = text.substr(i, 2).toLowerCase();
          const rem1 = text.substr(i, 1).toLowerCase();

          // Check for 'ng' coda
          if (rem2 === 'ng') {
            const nextAfterNg = i + 2 < len ? text.substr(i + 2, 1).toLowerCase() : '';
            if (!/[aiueo\u00E9\u00E8]/.test(nextAfterNg)) {
              syll += RARANGKEN_FINAL['ng'];
              i += 2;
            }
          } else if (rem1 === 'r' || rem1 === 'h') {
            const nextAfter = i + 1 < len ? text.substr(i + 1, 1).toLowerCase() : '';
            if (!/[aiueo\u00E9\u00E8]/.test(nextAfter)) {
              syll += RARANGKEN_FINAL[rem1];
              i += 1;
            }
          } else if (/[b-df-hj-np-tv-z]/.test(rem1)) {
            // General consonant coda: only if followed by another consonant or word end
            const nextAfter = i + 1 < len ? text.substr(i + 1, 1).toLowerCase() : '';
            const nextAfter2 = i + 1 < len ? text.substr(i + 1, 2).toLowerCase() : '';
            const isNextVowel = /[aiueo\u00E9\u00E8]/.test(nextAfter) || nextAfter2 === 'eu';
            if (!isNextVowel) {
              const codaBase = NGALAGENA[rem1 + 'a'];
              if (codaBase) {
                syll += codaBase + PAMAEH;
                i += 1;
              }
            }
          }
        }
      } else {
        // Consonant without vowel -> killed with pamaéh
        syll += PAMAEH;
      }

      result += syll;
    }

    return result;
  }

  /**
   * Convert Aksara Sunda string to Latin
   * @param {string} text 
   * @returns {string}
   */
  function sundaToLatin(text) {
    if (!text) return '';

    let result = '';
    let i = 0;
    const len = text.length;

    while (i < len) {
      const ch = text[i];

      // Handle Sundanese Digits
      if (REVERSE_DIGITS[ch]) {
        result += REVERSE_DIGITS[ch];
        i++;
        continue;
      }

      // Skip number delimiter pipe '|'
      if (ch === '|') {
        i++;
        continue;
      }

      // Handle Independent Swara
      if (REVERSE_SWARA[ch]) {
        result += REVERSE_SWARA[ch];
        i++;
        continue;
      }

      // Handle Ngalagena Base Consonants
      if (REVERSE_NGALAGENA[ch]) {
        const cons = REVERSE_NGALAGENA[ch];
        let infix = '';
        let vowel = 'a'; // default vowel
        let finalC = '';
        let killed = false;

        i++;
        // Check following modifiers
        while (i < len) {
          const next = text[i];
          if (REVERSE_INFIX[next]) {
            infix = REVERSE_INFIX[next];
            i++;
          } else if (REVERSE_RARANGKEN_SWARA[next]) {
            vowel = REVERSE_RARANGKEN_SWARA[next];
            i++;
          } else if (next === PAMAEH) {
            killed = true;
            vowel = '';
            i++;
          } else if (REVERSE_FINAL[next]) {
            finalC = REVERSE_FINAL[next];
            i++;
            break;
          } else {
            break;
          }
        }

        result += cons + infix + (killed ? '' : vowel) + finalC;
        continue;
      }

      // Free-standing modifiers (rare fallback)
      if (REVERSE_FINAL[ch]) {
        result += REVERSE_FINAL[ch];
        i++;
        continue;
      }

      // Other characters (spaces, punctuation, latin)
      result += ch;
      i++;
    }

    return result;
  }

  const SAMPLE_PHRASES = [
    { label: 'Salam', latin: 'Sampurasun! Rampés.' },
    { label: 'Semboyan Jawa Barat', latin: 'Gemah Ripah Repeh Rapih' },
    { label: 'Pepatah Sunda', latin: 'Hade tata, hade basa.' },
    { label: 'Filsafat Luhur', latin: 'Silih asih, silih asah, silih asuh.' },
    { label: 'Wilujeng Sumping', latin: 'Wilujeng sumping di Jawa Barat.' }
  ];

  const SundaConverter = {
    latinToSunda,
    sundaToLatin,
    SAMPLE_PHRASES
  };

  export default SundaConverter;
