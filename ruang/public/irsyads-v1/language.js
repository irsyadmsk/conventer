var IrsyadsLanguage = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/design-tokens/src/language.ts
  var language_exports = {};
  __export(language_exports, {
    LANGUAGES: () => LANGUAGES,
    LANGUAGE_KEY: () => LANGUAGE_KEY,
    isLanguage: () => isLanguage,
    preferredLanguage: () => preferredLanguage,
    resolveLanguage: () => resolveLanguage,
    saveLanguage: () => saveLanguage
  });
  var LANGUAGE_KEY = "irsyads-language";
  var LANGUAGES = ["id", "en", "ar"];
  function isLanguage(value) {
    return LANGUAGES.includes(value);
  }
  function preferredLanguage() {
    if (typeof document === "undefined") return null;
    try {
      const cookie = document.cookie.split(/;\s*/).find((item) => item.startsWith(`${LANGUAGE_KEY}=`))?.slice(LANGUAGE_KEY.length + 1);
      if (isLanguage(cookie)) return cookie;
    } catch {
    }
    try {
      const local = localStorage.getItem(LANGUAGE_KEY);
      if (isLanguage(local)) return local;
    } catch {
    }
    return null;
  }
  function saveLanguage(language) {
    if (!isLanguage(language) || typeof document === "undefined") return;
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
    }
    try {
      const shared = location.hostname === "irsyads.com" || location.hostname.endsWith(".irsyads.com");
      document.cookie = `${LANGUAGE_KEY}=${language}; Path=/; Max-Age=31536000; SameSite=Lax${shared ? "; Domain=irsyads.com; Secure" : ""}`;
    } catch {
    }
    window.dispatchEvent(new CustomEvent("irsyads-language-change", { detail: language }));
  }
  function resolveLanguage(supported, fallback, legacyKey) {
    if (typeof location === "undefined") return fallback;
    const explicit = new URLSearchParams(location.search).get("lang");
    if (isLanguage(explicit) && supported.includes(explicit)) return explicit;
    const shared = preferredLanguage();
    if (shared) return supported.includes(shared) ? shared : fallback;
    try {
      const legacy = legacyKey ? localStorage.getItem(legacyKey) : null;
      if (isLanguage(legacy) && supported.includes(legacy)) return legacy;
    } catch {
    }
    return fallback;
  }
  return __toCommonJS(language_exports);
})();
