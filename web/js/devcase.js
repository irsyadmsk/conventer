/**
 * Developer Case Converter & Text Statistics Analyzer
 * Tailored for Muhammad Irsyad Sirojul Khoeir, S.Sos., M.Sos., C.PS.
 * (Public Speaker & Developer friendly)
 */

(function(root) {
  'use strict';

  /**
   * Split any text into words (handling camelCase, PascalCase, snake_case, kebab-case, punctuation)
   * @param {string} str
   * @returns {string[]}
   */
  function tokenizeWords(str) {
    if (!str) return [];
    return str
      // Insert space between lower and Upper: "camelCase" -> "camel Case"
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      // Insert space between consecutive Upper and lower: "HTMLParser" -> "HTML Parser"
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      // Replace non-alphanumeric with spaces
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  const CaseConverter = {
    camelCase: (str) => {
      const words = tokenizeWords(str);
      if (words.length === 0) return '';
      return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    },

    pascalCase: (str) => {
      const words = tokenizeWords(str);
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    },

    snakeCase: (str) => {
      return tokenizeWords(str).map(w => w.toLowerCase()).join('_');
    },

    kebabCase: (str) => {
      return tokenizeWords(str).map(w => w.toLowerCase()).join('-');
    },

    constantCase: (str) => {
      return tokenizeWords(str).map(w => w.toUpperCase()).join('_');
    },

    titleCase: (str) => {
      return tokenizeWords(str).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    },

    sentenceCase: (str) => {
      const trimmed = str.trim();
      if (!trimmed) return '';
      return trimmed.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    },

    dotCase: (str) => {
      return tokenizeWords(str).map(w => w.toLowerCase()).join('.');
    },

    pathCase: (str) => {
      return tokenizeWords(str).map(w => w.toLowerCase()).join('/');
    },

    headerCase: (str) => {
      return tokenizeWords(str).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-');
    },

    getAllCases: (str) => {
      return {
        camelCase: CaseConverter.camelCase(str),
        pascalCase: CaseConverter.pascalCase(str),
        snakeCase: CaseConverter.snakeCase(str),
        kebabCase: CaseConverter.kebabCase(str),
        constantCase: CaseConverter.constantCase(str),
        titleCase: CaseConverter.titleCase(str),
        sentenceCase: CaseConverter.sentenceCase(str),
        dotCase: CaseConverter.dotCase(str),
        pathCase: CaseConverter.pathCase(str),
        headerCase: CaseConverter.headerCase(str)
      };
    }
  };

  /**
   * Text Statistics & Public Speaking Metrics
   */
  const TextStats = {
    analyze: (text) => {
      if (!text || !text.trim()) {
        return {
          characters: 0,
          charactersNoSpaces: 0,
          words: 0,
          sentences: 0,
          paragraphs: 0,
          readingTimeSeconds: 0,
          readingTimeFormatted: '0 dtk',
          speakingTimeSeconds: 0,
          speakingTimeFormatted: '0 dtk',
          avgWordLength: 0,
          avgWordsPerSentence: 0
        };
      }

      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;

      // Words count
      const wordMatches = text.trim().match(/[\w\u00C0-\u024F\u1E00-\u1EFF]+/g);
      const words = wordMatches ? wordMatches.length : 0;

      // Sentences count (split on . ! ? followed by whitespace or end)
      const sentenceMatches = text.trim().split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0);
      const sentences = sentenceMatches.length || (words > 0 ? 1 : 0);

      // Paragraphs count (split on double newline)
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (words > 0 ? 1 : 0);

      // Reading Time: avg 225 words/minute = 3.75 words/sec
      const readingSeconds = Math.ceil((words / 225) * 60);

      // Public Speaking Time (C.PS. benchmark): avg 130 words/minute = 2.16 words/sec
      const speakingSeconds = Math.ceil((words / 130) * 60);

      const formatDuration = (secs) => {
        if (secs < 60) return `${secs} dtk`;
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        return remSecs > 0 ? `${mins} mnt ${remSecs} dtk` : `${mins} mnt`;
      };

      const avgWordLength = words > 0 ? (charactersNoSpaces / words).toFixed(1) : 0;
      const avgWordsPerSentence = sentences > 0 ? (words / sentences).toFixed(1) : 0;

      return {
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        readingTimeSeconds: readingSeconds,
        readingTimeFormatted: formatDuration(readingSeconds),
        speakingTimeSeconds: speakingSeconds,
        speakingTimeFormatted: formatDuration(speakingSeconds),
        avgWordLength,
        avgWordsPerSentence
      };
    }
  };

  const DevCaseModule = {
    CaseConverter,
    TextStats
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DevCaseModule;
  } else {
    root.DevCaseModule = DevCaseModule;
  }
})(typeof self !== 'undefined' ? self : this);
