/**
 * Text Codecs - Ported from Text Converter Android App
 * Author: Muhammad Irsyad Sirojul Khoeir (irsyads.com)
 */

const Codecs = {
  // --- ASCII ---
  ascii: {
    encode: (text) => {
      return text.split('').map(c => c.charCodeAt(0)).join(' ');
    },
    decode: (text) => {
      try {
        return text.trim().split(/\s+/).filter(Boolean).map(code => String.fromCharCode(parseInt(code, 10))).join('');
      } catch (e) {
        return text;
      }
    }
  },

  // --- BINARY ---
  binary: {
    encode: (text) => {
      return text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    },
    decode: (text) => {
      try {
        return text.trim().split(/\s+/).filter(Boolean).map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
      } catch (e) {
        return text;
      }
    }
  },

  // --- HEXADECIMAL ---
  hex: {
    encode: (text) => {
      return text.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()).join(' ');
    },
    decode: (text) => {
      try {
        const clean = text.replace(/[^0-9a-fA-F]/g, '');
        let res = '';
        for (let i = 0; i < clean.length; i += 2) {
          const byte = clean.substr(i, 2);
          if (byte.length === 2) {
            res += String.fromCharCode(parseInt(byte, 16));
          }
        }
        return res;
      } catch (e) {
        return text;
      }
    }
  },

  // --- OCTAL ---
  octal: {
    encode: (text) => {
      return text.split('').map(c => c.charCodeAt(0).toString(8).padStart(3, '0')).join(' ');
    },
    decode: (text) => {
      try {
        return text.trim().split(/\s+/).filter(Boolean).map(oct => String.fromCharCode(parseInt(oct, 8))).join('');
      } catch (e) {
        return text;
      }
    }
  },

  // --- BASE64 ---
  base64: {
    encode: (text) => {
      try {
        return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        }));
      } catch (e) {
        return btoa(text);
      }
    },
    decode: (text) => {
      try {
        return decodeURIComponent(Array.prototype.map.call(atob(text.trim()), c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      } catch (e) {
        try {
          return atob(text.trim());
        } catch (err) {
          return 'Error: Invalid Base64 string';
        }
      }
    }
  },

  // --- BASE32 ---
  base32: {
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    encode: (text) => {
      try {
        const utf8Bytes = new TextEncoder().encode(text);
        let bits = 0;
        let value = 0;
        let output = '';

        for (let i = 0; i < utf8Bytes.length; i++) {
          value = (value << 8) | utf8Bytes[i];
          bits += 8;
          while (bits >= 5) {
            output += Codecs.base32.alphabet[(value >>> (bits - 5)) & 31];
            bits -= 5;
          }
        }

        if (bits > 0) {
          output += Codecs.base32.alphabet[(value << (5 - bits)) & 31];
        }

        while (output.length % 8 !== 0) {
          output += '=';
        }
        return output;
      } catch (e) {
        return text;
      }
    },
    decode: (text) => {
      try {
        const clean = text.toUpperCase().replace(/=+$/, '');
        let bits = 0;
        let value = 0;
        const bytes = [];

        for (let i = 0; i < clean.length; i++) {
          const idx = Codecs.base32.alphabet.indexOf(clean[i]);
          if (idx === -1) continue;
          value = (value << 5) | idx;
          bits += 5;

          if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 255);
            bits -= 8;
          }
        }
        return new TextDecoder().decode(new Uint8Array(bytes));
      } catch (e) {
        return 'Error: Invalid Base32 string';
      }
    }
  },

  // --- URL ENCODE/DECODE ---
  url: {
    encode: (text) => encodeURIComponent(text),
    decode: (text) => {
      try {
        return decodeURIComponent(text);
      } catch (e) {
        return text;
      }
    }
  },

  // --- REVERSER ---
  reverser: {
    encode: (text) => text.split('').reverse().join(''),
    decode: (text) => text.split('').reverse().join('')
  },

  // --- UPPER / LOWER / RANDOM CASE ---
  uppercase: {
    encode: (text) => text.toUpperCase(),
    decode: (text) => text.toLowerCase()
  },
  lowercase: {
    encode: (text) => text.toLowerCase(),
    decode: (text) => text.toUpperCase()
  },
  randomcase: {
    encode: (text) => {
      return text.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
    },
    decode: (text) => text
  },

  // --- MORSE CODE ---
  morse: {
    map: {
      a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.',
      h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.',
      o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-',
      v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
      '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
      '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
      '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
      '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
      ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
      '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
    },
    encode: (text) => {
      const lower = text.toLowerCase();
      const tokens = [];
      for (let i = 0; i < lower.length; i++) {
        const ch = lower[i];
        if (Codecs.morse.map[ch]) {
          tokens.push(Codecs.morse.map[ch]);
        } else {
          tokens.push(ch);
        }
      }
      return tokens.join(' ');
    },
    decode: (text) => {
      const reverseMap = {};
      Object.keys(Codecs.morse.map).forEach(k => {
        reverseMap[Codecs.morse.map[k]] = k;
      });
      const words = text.trim().split(/\s+/);
      return words.map(code => {
        if (code === '/') return ' ';
        return reverseMap[code] || code;
      }).join('');
    }
  },

  // --- UPSIDE DOWN ---
  upsidedown: {
    map: {
      'a': '\u0250', 'b': 'q', 'c': '\u0254', 'd': 'p', 'e': '\u01DD', 'f': '\u025F', 'g': '\u0183',
      'h': '\u0265', 'i': '\u1D09', 'j': '\u027E', 'k': '\u029E', 'l': 'l', 'm': '\u026F', 'n': 'u',
      'o': 'o', 'p': 'd', 'q': 'b', 'r': '\u0279', 's': 's', 't': '\u0287', 'u': 'n', 'v': '\u028C',
      'w': '\u028D', 'x': 'x', 'y': '\u028E', 'z': 'z',
      'A': '\u2200', 'B': 'q', 'C': '\u0186', 'D': 'p', 'E': '\u018E', 'F': '\u2132', 'G': '\u2141',
      'H': 'H', 'I': 'I', 'J': '\u017F', 'K': '\u029E', 'L': '\u02E5', 'M': 'W', 'N': 'N', 'O': 'O',
      'P': '\u0500', 'Q': 'b', 'R': '\u1D1A', 'S': 'S', 'T': '\u22A5', 'U': '\u2229', 'V': '\u039B',
      'W': 'M', 'X': 'X', 'Y': '\u2144', 'Z': 'Z',
      '0': '0', '1': '\u0196', '2': '\u018E', '3': '\u0190', '4': '\u0447', '5': '\u03DB', '6': '9',
      '7': '\u3125', '8': '8', '9': '6',
      ',': "'", '.': '\u02D9', '?': '\u00BF', '!': '\u00A1', "'": ',', '"': ',,', '`': ',',
      '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
      '&': '\u214B', '_': '\u203E'
    },
    encode: (text) => {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        result += Codecs.upsidedown.map[c] || c;
      }
      return result.split('').reverse().join('');
    },
    decode: (text) => {
      const reverse = {};
      Object.keys(Codecs.upsidedown.map).forEach(k => {
        reverse[Codecs.upsidedown.map[k]] = k;
      });
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        result += reverse[c] || c;
      }
      return result.split('').reverse().join('');
    }
  },

  // --- SUPERSCRIPT ---
  superscript: {
    map: {
      'a': '\u1D43', 'b': '\u1D47', 'c': '\u1D9C', 'd': '\u1D48', 'e': '\u1D49', 'f': '\u1DA0', 'g': '\u1D4D',
      'h': '\u02B0', 'i': '\u2071', 'j': '\u02B2', 'k': '\u1D4F', 'l': '\u02E1', 'm': '\u1D50', 'n': '\u207F',
      'o': '\u1D52', 'p': '\u1D56', 'q': '\u1D60', 'r': '\u02B3', 's': '\u02E2', 't': '\u1D57', 'u': '\u1D58',
      'v': '\u1D5B', 'w': '\u02B7', 'x': '\u02E3', 'y': '\u02B8', 'z': '\u1DBB',
      'A': '\u1D2C', 'B': '\u1D2E', 'C': '\u1D9C', 'D': '\u1D30', 'E': '\u1D31', 'F': '\u1DA0', 'G': '\u1D33',
      'H': '\u1D34', 'I': '\u1D35', 'J': '\u1D36', 'K': '\u1D37', 'L': '\u1D38', 'M': '\u1D39', 'N': '\u1D3A',
      'O': '\u1D3C', 'P': '\u1D3E', 'Q': '\u1D60', 'R': '\u1D3F', 'S': '\u02E2', 'T': '\u1D40', 'U': '\u1D41',
      'V': '\u2C7D', 'W': '\u1D42', 'X': '\u02E3', 'Y': '\u02B8', 'Z': '\u1DBB',
      '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074', '5': '\u2075',
      '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
      '+': '\u207A', '-': '\u207B', '=': '\u207C', '(': '\u207D', ')': '\u207E'
    },
    encode: (text) => {
      let res = '';
      for (let i = 0; i < text.length; i++) {
        res += Codecs.superscript.map[text[i]] || text[i];
      }
      return res;
    },
    decode: (text) => {
      const reverse = {};
      Object.keys(Codecs.superscript.map).forEach(k => {
        reverse[Codecs.superscript.map[k]] = k;
      });
      let res = '';
      for (let i = 0; i < text.length; i++) {
        res += reverse[text[i]] || text[i];
      }
      return res;
    }
  },

  // --- SUBSCRIPT ---
  subscript: {
    map: {
      'a': '\u2090', 'e': '\u2091', 'h': '\u2095', 'i': '\u1D62', 'j': '\u2C7C', 'k': '\u2096',
      'l': '\u2097', 'm': '\u2098', 'n': '\u2099', 'o': '\u2092', 'p': '\u209A', 'r': '\u1D63',
      's': '\u209B', 't': '\u209C', 'u': '\u1D64', 'v': '\u1D65', 'x': '\u2093',
      '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083', '4': '\u2084', '5': '\u2085',
      '6': '\u2086', '7': '\u2087', '8': '\u2088', '9': '\u2089',
      '+': '\u208A', '-': '\u208B', '=': '\u208C', '(': '\u208D', ')': '\u208E'
    },
    encode: (text) => {
      let res = '';
      for (let i = 0; i < text.length; i++) {
        res += Codecs.subscript.map[text[i]] || text[i];
      }
      return res;
    },
    decode: (text) => {
      const reverse = {};
      Object.keys(Codecs.subscript.map).forEach(k => {
        reverse[Codecs.subscript.map[k]] = k;
      });
      let res = '';
      for (let i = 0; i < text.length; i++) {
        res += reverse[text[i]] || text[i];
      }
      return res;
    }
  },

  // --- ATBASH ---
  atbash: {
    encode: (text) => {
      return text.split('').map(c => {
        if (c >= 'a' && c <= 'z') {
          return String.fromCharCode(219 - c.charCodeAt(0));
        } else if (c >= 'A' && c <= 'Z') {
          return String.fromCharCode(155 - c.charCodeAt(0));
        }
        return c;
      }).join('');
    },
    decode: (text) => Codecs.atbash.encode(text)
  },

  // --- ROT-13 ---
  rot13: {
    encode: (text) => {
      return text.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
    },
    decode: (text) => Codecs.rot13.encode(text)
  },

  // --- NATO PHONETIC ---
  nato: {
    dict: {
      A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
      F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliet',
      K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
      P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
      U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee',
      Z: 'Zulu',
      '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
      '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
    },
    encode: (text) => {
      return text.toUpperCase().split('').map(c => Codecs.nato.dict[c] || c).join(' ');
    },
    decode: (text) => {
      const reverse = {};
      Object.keys(Codecs.nato.dict).forEach(k => {
        reverse[Codecs.nato.dict[k].toUpperCase()] = k;
      });
      return text.split(/\s+/).map(word => reverse[word.toUpperCase()] || word).join('');
    }
  },

  // --- UNICODE ESCAPE ---
  unicode: {
    encode: (text) => {
      return text.split('').map(c => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)).join('');
    },
    decode: (text) => {
      try {
        return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
      } catch (e) {
        return text;
      }
    }
  },

  // --- WINGDINGS ---
  wingdings: {
    map: {
      '!': 9999, '"': 9986, '#': 9985, '$': 128083, '%': 128365, '&': 128366, "'": 128367,
      '(': 9742, ')': 9990, '*': 128386, '+': 128387, ',': 128234, '-': 128235, '.': 128236,
      '/': 128237, '0': 128193, '1': 128194, '2': 128196, '3': 128463, '4': 128464, '5': 128452,
      '6': 8987, '7': 128430, '8': 128432, '9': 128434, ':': 128435, ';': 128436, '<': 128427,
      '=': 128428, '>': 9991, '?': 9997, '@': 128398, A: 9996, B: 128076, C: 128077,
      D: 128078, E: 9756, F: 9758, G: 9757, H: 9759, I: 9995, J: 9786,
      K: 128528, L: 9785, M: 128163, N: 9760, O: 9872, P: 127985, Q: 9992,
      R: 9788, S: 128167, T: 10052, U: 128326, V: 10014, W: 128328, X: 10016,
      Y: 10017, Z: 9770, '[': 9775, ']': 9784, '^': 9800, _: 9801, '`': 9802,
      '{': 10048, '|': 10047, '}': 10077, '~': 10078
    },
    encode: (text) => {
      let res = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const cp = Codecs.wingdings.map[c];
        res += cp ? String.fromCodePoint(cp) : c;
      }
      return res;
    },
    decode: (text) => {
      const reverse = {};
      Object.keys(Codecs.wingdings.map).forEach(k => {
        reverse[String.fromCodePoint(Codecs.wingdings.map[k])] = k;
      });
      let res = '';
      for (const char of text) {
        res += reverse[char] || char;
      }
      return res;
    }
  },

  // --- ZALGO ---
  zalgo: {
    up: [
      '\u030d','\u030e','\u0304','\u0305','\u033f','\u0311','\u0306','\u0310',
      '\u0352','\u0357','\u0351','\u0307','\u0308','\u030a','\u0342','\u0343',
      '\u0344','\u034a','\u034b','\u034c','\u0303','\u0302','\u030c','\u0350',
      '\u0300','\u0301','\u030b','\u030f','\u0312','\u0313','\u0314','\u033d',
      '\u0309','\u0363','\u0364','\u0365','\u0366','\u0367','\u0368','\u0369',
      '\u036a','\u036b','\u036c','\u036d','\u036e','\u036f','\u033e','\u035b',
      '\u0346','\u031a'
    ],
    down: [
      '\u0316','\u0317','\u0318','\u0319','\u031c','\u031d','\u031e','\u031f',
      '\u0320','\u0324','\u0325','\u0326','\u0329','\u032a','\u032b','\u032c',
      '\u032d','\u032e','\u032f','\u0330','\u0331','\u0332','\u0333','\u0339',
      '\u033a','\u033b','\u033c','\u0345','\u0347','\u0348','\u0349','\u034d',
      '\u034e','\u0353','\u0354','\u0355','\u0356','\u0359','\u035a','\u0323'
    ],
    mid: [
      '\u0315','\u031b','\u0340','\u0341','\u0358','\u0321','\u0322','\u0327',
      '\u0328','\u0334','\u0335','\u0336','\u034f','\u035c','\u035d','\u035e',
      '\u035f','\u0360','\u0362','\u0338','\u0337','\u0361','\u0489'
    ],
    encode: (text, intensity = 'normal') => {
      let counts = { up: 2, mid: 1, down: 2 };
      if (intensity === 'mini') counts = { up: 1, mid: 0, down: 1 };
      if (intensity === 'big') counts = { up: 5, mid: 2, down: 5 };

      let result = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === ' ' || c === '\n') {
          result += c;
          continue;
        }
        result += c;
        for (let u = 0; u < counts.up; u++) {
          result += Codecs.zalgo.up[Math.floor(Math.random() * Codecs.zalgo.up.length)];
        }
        for (let m = 0; m < counts.mid; m++) {
          result += Codecs.zalgo.mid[Math.floor(Math.random() * Codecs.zalgo.mid.length)];
        }
        for (let d = 0; d < counts.down; d++) {
          result += Codecs.zalgo.down[Math.floor(Math.random() * Codecs.zalgo.down.length)];
        }
      }
      return result;
    },
    decode: (text) => {
      return text.replace(/[\u0300-\u036f\u0489]/g, '');
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = Codecs;
}
