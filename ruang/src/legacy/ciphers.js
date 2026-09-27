// @ts-nocheck
/**
 * Ciphers & Cryptography Analysis
 * Ported from Text Converter Android App
 */

const Ciphers = {
  caesar: {
    encode: (text, shift = 3) => {
      shift = ((shift % 26) + 26) % 26;
      return text.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
      });
    },
    decode: (text, shift = 3) => {
      shift = ((shift % 26) + 26) % 26;
      return Ciphers.caesar.encode(text, 26 - shift);
    }
  },

  vigenere: {
    encode: (text, key = 'KEY') => {
      if (!key) return text;
      key = key.toUpperCase().replace(/[^A-Z]/g, '');
      if (key.length === 0) return text;

      let res = '';
      let j = 0;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c >= 'a' && c <= 'z') {
          const shift = key.charCodeAt(j % key.length) - 65;
          res += String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97);
          j++;
        } else if (c >= 'A' && c <= 'Z') {
          const shift = key.charCodeAt(j % key.length) - 65;
          res += String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
          j++;
        } else {
          res += c;
        }
      }
      return res;
    },
    decode: (text, key = 'KEY') => {
      if (!key) return text;
      key = key.toUpperCase().replace(/[^A-Z]/g, '');
      if (key.length === 0) return text;

      let res = '';
      let j = 0;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c >= 'a' && c <= 'z') {
          const shift = key.charCodeAt(j % key.length) - 65;
          res += String.fromCharCode(((c.charCodeAt(0) - 97 - shift + 26) % 26) + 97);
          j++;
        } else if (c >= 'A' && c <= 'Z') {
          const shift = key.charCodeAt(j % key.length) - 65;
          res += String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
          j++;
        } else {
          res += c;
        }
      }
      return res;
    }
  },

  frequency: {
    analyze: (text) => {
      const counts = {};
      let totalLetters = 0;
      for (let i = 0; i < 26; i++) {
        counts[String.fromCharCode(65 + i)] = 0;
      }
      for (let i = 0; i < text.length; i++) {
        const c = text[i].toUpperCase();
        if (c >= 'A' && c <= 'Z') {
          counts[c]++;
          totalLetters++;
        }
      }
      return { counts, totalLetters };
    }
  }
};

export default Ciphers;
