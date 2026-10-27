/* Generated preferences v2; public appearance only. */
// Public appearance only. No identity, authentication, sound or document payloads.
(() => {
  if (window.IrsyadsPreferences) return;
  const root = document.documentElement, key = 'irsyads-preferences-v2';
  const fields = { theme: ['system', 'light', 'dark'], palette: ['krem', 'forest', 'ocean', 'royal', 'aurora', 'earth'], language: ['en', 'id', 'ar', 'zh'], motion: ['system', 'full', 'reduce'] };
  const defaults = { theme: 'system', palette: typeof defaultPalette === 'string' && fields.palette.includes(defaultPalette) ? defaultPalette : 'krem', language: 'en', motion: 'system' };
  const source = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  const shared = location.hostname === 'irsyads.com' || location.hostname.endsWith('.irsyads.com');
  const dark = matchMedia('(prefers-color-scheme: dark)'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const write = (k, v) => { try { if (read(k) !== v) localStorage.setItem(k, v); } catch {} };
  const cookie = k => { try { return document.cookie.split(/;\s*/).find(v => v.startsWith(k + '='))?.slice(k.length + 1); } catch { return null; } };
  const putCookie = (k, v) => { if (!shared || cookie(k) === v) return; try { document.cookie = k + '=' + v + '; Path=/; Domain=.irsyads.com; Max-Age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); } catch {} };
  const clean = value => Object.fromEntries(Object.entries(fields).filter(([k, allowed]) => allowed.includes(value?.[k])).map(([k]) => [k, value[k]]));
  const valid = v => v?.version === 2 && Number.isSafeInteger(v.revision) && v.revision >= 0 && v.revision <= Date.now() + 86400000 && typeof v.source === 'string' && /^[\w-]{1,80}$/.test(v.source) && Object.keys(clean(v.values)).length === 4 && Object.keys(v).sort().join() === 'revision,source,values,version' && Object.keys(v.values).sort().join() === 'language,motion,palette,theme';
  const parse = text => { try { const v = JSON.parse(text); return valid(v) ? v : null; } catch { return null; } };
  const newer = (a, b) => a.revision > b.revision || (a.revision === b.revision && a.source > b.source);
  const same = (a, b) => Object.keys(fields).every(k => a[k] === b[k]);
  function stored() {
    const local = parse(read(key)); let remote;
    try { remote = parse(decodeURIComponent(cookie(key) || '')); } catch {}
    return remote && (!local || newer(remote, local)) ? remote : local;
  }
  const legacy = {};
  for (const k of ['theme', 'palette']) legacy[k] = (shared && cookie('irsyads-appearance-' + k)) || read('irsyads-' + k);
  legacy.language = cookie('irsyads-language') || read('irsyads-language');
  let state = stored() || { version: 2, revision: 0, source, values: { ...defaults, ...clean(legacy) } };
  let account, epoch = 0, explicit = 0, bc, bridgeSend;
  const listeners = new Set();
  const scopeKey = () => key + ':' + (account ? 'account:' + encodeURIComponent(account) : 'guest');
  function apply() {
    const theme = state.values.theme === 'system' ? (dark.matches ? 'dark' : 'light') : state.values.theme;
    const motion = reduced.matches || state.values.motion === 'reduce' ? 'reduce' : state.values.motion;
    if (root.dataset.theme !== theme) root.dataset.theme = theme;
    if (state.values.palette === 'krem') { if (root.dataset.palette !== undefined) delete root.dataset.palette; }
    else if (root.dataset.palette !== state.values.palette) root.dataset.palette = state.values.palette;
    if (root.dataset.motion !== motion) root.dataset.motion = motion;
    // Content routes keep their language; UI adapters apply supported fallbacks.
    if (root.dataset.interfaceLanguage !== state.values.language) root.dataset.interfaceLanguage = state.values.language;
  }
  function persist() {
    const text = JSON.stringify(state);
    write(key, text); if (account !== undefined) write(scopeKey(), text); putCookie(key, encodeURIComponent(text));
    for (const k of ['theme', 'palette']) {
      const legacyKey = 'irsyads-' + k;
      if (k === 'theme' && state.values[k] === 'system') { try { if (read(legacyKey) !== null) localStorage.removeItem(legacyKey); } catch {} }
      else write(legacyKey, state.values[k]);
      putCookie('irsyads-appearance-' + k, state.values[k]);
    }
    write('irsyads-language', state.values.language); putCookie('irsyads-language', state.values.language);
  }
  function announce(reason) {
    for (const listener of listeners) listener({ ...state.values }, reason);
    window.dispatchEvent(new CustomEvent('irsyads-preferences-applied', { detail: { ...state.values } }));
    window.dispatchEvent(new CustomEvent('irsyads-language-change', { detail: state.values.language }));
  }
  function receive(next) {
    if (!valid(next) || !newer(next, state)) return false;
    const changed = !same(next.values, state.values);
    state = { ...next, values: { ...next.values } }; persist(); apply();
    if (changed) announce('sync');
    return true;
  }
  function change(patch, reason = 'explicit') {
    const values = { ...state.values, ...clean(patch) };
    if (same(values, state.values)) return false;
    if (reason === 'explicit') { explicit++; if (account === undefined) account = null; }
    state = { version: 2, revision: Math.max(Date.now(), state.revision + 1), source, values };
    persist(); apply(); announce(reason);
    try { bc?.postMessage(state); } catch {}
    bridgeSend?.(state);
    return true;
  }
  const sync = () => { const next = stored(); if (next) receive(next); };
  window.IrsyadsPreferences = {
    version: 2, get: () => ({ ...state.values }), envelope: () => ({ ...state, values: { ...state.values } }),
    set: patch => change(patch), receive, validate: valid, newer,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    connectBridge: send => { bridgeSend = send; },
    // Identity stays in local account storage, never in cookies/messages.
    setAccount: id => {
      const next = typeof id === 'string' && id.length <= 128 ? id : null;
      if (next === account) return;
      account = next; epoch++; explicit++;
      const cached = parse(read(scopeKey()));
      change(cached?.values || defaults, 'account');
    },
    accountTicket: () => ({ account, epoch, explicit, revision: state.revision }),
    applyAccount: (values, ticket) => {
      if (!ticket || !account || ticket.account !== account || ticket.epoch !== epoch || ticket.explicit !== explicit || ticket.revision !== state.revision) return false;
      return change(values, 'account');
    },
  };
  apply(); persist();
  if (!read(key + ':guest')) write(key + ':guest', JSON.stringify(state));
  try { bc = new BroadcastChannel('irsyads-appearance'); bc.onmessage = event => { if (event.data === 'sync') sync(); else receive(event.data); }; } catch {}
  window.addEventListener('irsyads-appearance-change', event => change(event.detail));
  new MutationObserver(() => {
    const patch = {};
    const resolved = state.values.theme === 'system' ? (dark.matches ? 'dark' : 'light') : state.values.theme;
    let storedTheme = state.values.theme;
    try { storedTheme = localStorage.getItem('irsyads-theme') || 'system'; } catch {}
    if (root.dataset.theme !== resolved || storedTheme !== state.values.theme) patch.theme = storedTheme === 'system' ? 'system' : root.dataset.theme;
    const palette = root.dataset.palette || 'krem';
    if (palette !== state.values.palette) patch.palette = palette;
    change(patch);
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
  dark.addEventListener('change', apply); reduced.addEventListener('change', apply);
  window.addEventListener('focus', sync); window.addEventListener('pageshow', sync);
  window.addEventListener('storage', event => { if (event.key === key) sync(); });
})();

// Exact origins; this channel never carries identity/session/document data.
(() => {
  const prefs = window.IrsyadsPreferences;
  if (!prefs || window.__irsyadsPreferenceBridge) return;
  const origins = ['https://irsyads.com', 'https://id.irsyads.com', 'https://academy.irsyads.com', 'https://studio.irsyads.com', 'https://app.irsyads.com', 'https://verify.irsyads.com', 'https://letters.irsyads.com', 'https://cbt.irsyads.com', 'https://smart.irsyads.com', 'https://curriculum.irsyads.com', 'https://mosque.irsyads.com'];
  const local = ['localhost', '127.0.0.1'].includes(location.hostname) ? window.__irsyadsLocalPreferenceBridge : null;
  const allow = local?.origins || origins, bridgeOrigin = local?.origin || 'https://id.irsyads.com';
  if (!allow.includes(location.origin)) return;
  window.__irsyadsPreferenceBridge = true;
  if (['/preferensi-bridge', '/preferensi-bridge/'].includes(location.pathname)) {
    if (window.parent === window) return;
    let parentOrigin, channel;
    const send = envelope => { if (parentOrigin) window.parent.postMessage({ type: 'irsyads-preferences', envelope }, parentOrigin); };
    prefs.subscribe((_values, reason) => { if (reason === 'sync') send(prefs.envelope()); });
    try { channel = new BroadcastChannel('irsyads-preferences-bridge-v2'); channel.onmessage = event => { prefs.receive(event.data); }; } catch {}
    window.addEventListener('message', event => {
      if (event.source !== window.parent || !allow.includes(event.origin)) return;
      if (event.data?.type === 'irsyads-preferences-hello') { parentOrigin = event.origin; send(prefs.envelope()); return; }
      if (event.data?.type !== 'irsyads-preferences' || !prefs.validate(event.data.envelope)) return;
      parentOrigin = event.origin;
      if (prefs.receive(event.data.envelope)) { try { channel?.postMessage(prefs.envelope()); } catch {} }
    });
    return;
  }
  function mount() {
    const frame = document.createElement('iframe');
    frame.hidden = true; frame.title = 'Irsyads preferences'; frame.src = bridgeOrigin + '/preferensi-bridge/';
    frame.setAttribute('aria-hidden', 'true'); frame.setAttribute('tabindex', '-1');
    let ready = false;
    const send = envelope => { if (ready) frame.contentWindow?.postMessage({ type: 'irsyads-preferences', envelope }, bridgeOrigin); };
    prefs.connectBridge(send);
    window.addEventListener('message', event => {
      if (event.origin !== bridgeOrigin || event.source !== frame.contentWindow || event.data?.type !== 'irsyads-preferences' || !prefs.validate(event.data.envelope)) return;
      ready = true;
      if (prefs.newer(prefs.envelope(), event.data.envelope)) send(prefs.envelope()); else prefs.receive(event.data.envelope);
    });
    frame.addEventListener('load', () => frame.contentWindow?.postMessage({ type: 'irsyads-preferences-hello' }, bridgeOrigin));
    document.body.append(frame);
  }
  if (document.body) mount(); else window.addEventListener('DOMContentLoaded', mount, { once: true });
})();
