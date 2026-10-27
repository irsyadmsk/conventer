function createProject(name) {
  return {
    version: 1,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2),
    name: String(name || 'Proyek tanpa judul').trim().slice(0, 80) || 'Proyek tanpa judul',
    updatedAt: new Date().toISOString(),
    cipher: { separator: '/', unknown: 'keep', rules: Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ ').map(function (source, i) { return { source: source, target: String(i + 1).padStart(2, '0') }; }) },
    glyphs: [],
    font: { family: 'Aksara Kreasi', author: '', license: '', mapping: 'latin', strokeWidth: 6, spacing: 80 },
    sample: 'HALO DUNIA'
  };
}
function validateCipher(cipher) {
  var errors = [];
  if (!cipher || !['/', '|', '·', ' '].includes(cipher.separator)) errors.push('Pilih pemisah /, |, ·, atau spasi.');
  if (!cipher || !['keep', 'reject'].includes(cipher.unknown)) errors.push('Pilihan karakter belum dipetakan tidak valid.');
  if (!cipher || !Array.isArray(cipher.rules) || !cipher.rules.length || cipher.rules.length > 256) return errors.concat('Isi 1–256 pasangan aturan.');
  var sources = new Set(), targets = new Set();
  cipher.rules.forEach(function (r, i) {
    var label = 'Baris ' + (i + 1) + ': ';
    if (!r || typeof r.source !== 'string' || !r.source.length || r.source.length > 16 || typeof r.target !== 'string' || !r.target.length || r.target.length > 40) { errors.push(label + 'isi sumber (maks. 16) dan kode (maks. 40 karakter).'); return; }
    if (sources.has(r.source)) errors.push(label + 'sumber sudah digunakan.');
    if (targets.has(r.target)) errors.push(label + 'kode bentrok; harus unik.');
    if (r.target.includes(cipher.separator) || r.target.startsWith('~') || /[\r\n]/.test(r.target)) errors.push(label + 'kode tidak boleh mengandung pemisah, baris baru, atau diawali ~.');
    sources.add(r.source); targets.add(r.target);
  });
  return errors;
}
function checkCipher(cipher) {
  var errors = validateCipher(cipher);
  if (errors.length) throw new Error(errors[0]);
}
function encode(text, cipher) {
  checkCipher(cipher);
  var rules = cipher.rules.slice().sort(function (a, b) { return b.source.length - a.source.length; });
  var tokens = [], position = 0;
  while (position < text.length) {
    var match = rules.find(function (r) { return text.startsWith(r.source, position); });
    if (match) { tokens.push(match.target); position += match.source.length; }
    else {
      var cp = text.codePointAt(position);
      if (cipher.unknown === 'reject') throw new Error('Karakter belum dipetakan: ' + String.fromCodePoint(cp));
      tokens.push('~' + cp.toString(16).padStart(6, '0'));
      position += cp > 0xffff ? 2 : 1;
    }
  }
  return tokens.join(cipher.separator);
}
function decode(text, cipher) {
  checkCipher(cipher);
  if (!text) return '';
  var reverse = new Map(cipher.rules.map(function (r) { return [r.target, r.source]; }));
  return text.split(cipher.separator).map(function (token) {
    if (reverse.has(token)) return reverse.get(token);
    if (/^~[0-9a-f]{6}$/i.test(token)) {
      var cp = parseInt(token.slice(1), 16);
      if (cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff)) return String.fromCodePoint(cp);
    }
    throw new Error('Token tidak dikenal: ' + token.slice(0, 40));
  }).join('');
}
function parseProject(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).byteLength > 2000000) throw new Error('Berkas proyek terlalu besar (maks. 2.000.000 byte UTF-8).');
  var p;
  try { p = JSON.parse(text); } catch (e) { throw new Error('Berkas bukan JSON proyek yang valid.'); }
  var fail = function () { throw new Error('Struktur proyek tidak valid atau versi belum didukung.'); };
  var str = function (s, max, allowEmpty) { return typeof s === 'string' && s.length <= max && (allowEmpty || s.length > 0); };
  if (!p || p.version !== 1 || !str(p.id, 100) || !str(p.name, 80) || !str(p.updatedAt, 40) || !str(p.sample, 20000, true)) fail();
  var c = p.cipher, f = p.font;
  if (!c || !['/', '|', '·', ' '].includes(c.separator) || !['keep', 'reject'].includes(c.unknown) || !Array.isArray(c.rules) || c.rules.length > 256) fail();
  var rules = c.rules.map(function (r) {
    if (!r || !str(r.source, 16, true) || !str(r.target, 40, true)) fail();
    return { source: r.source, target: r.target };
  });
  if (!f || !str(f.family, 80) || !str(f.author, 120, true) || !str(f.license, 500, true) || !['latin', 'pua'].includes(f.mapping) || !Number.isFinite(f.strokeWidth) || f.strokeWidth < 1 || f.strokeWidth > 16 || !Number.isFinite(f.spacing) || f.spacing < 0 || f.spacing > 300) fail();
  if (!Array.isArray(p.glyphs) || p.glyphs.length > 256) fail();
  var sources = new Set(), ids = new Set(), points = 0;
  var glyphs = p.glyphs.map(function (g) {
    if (!g || !str(g.id, 100) || !str(g.source, 16) || /[\r\n\t]/.test(g.source) || sources.has(g.source) || ids.has(g.id) || !Array.isArray(g.strokes) || g.strokes.length > 128) fail();
    sources.add(g.source); ids.add(g.id);
    var strokes = g.strokes.map(function (stroke) {
      if (!Array.isArray(stroke) || !stroke.length || stroke.length > 2048) fail();
      return stroke.map(function (pt) {
        if (!Array.isArray(pt) || pt.length !== 2 || !pt.every(function (v) { return Number.isFinite(v) && v >= 0 && v <= 100; }) || ++points > 50000) fail();
        return [pt[0], pt[1]];
      });
    });
    return { id: g.id, source: g.source, strokes: strokes };
  });
  return {version:1,id:p.id,name:p.name,updatedAt:p.updatedAt,cipher:{separator:c.separator,unknown:c.unknown,rules:rules},glyphs:glyphs,font:{family:f.family,author:f.author,license:f.license,mapping:f.mapping,strokeWidth:f.strokeWidth,spacing:f.spacing},sample:p.sample};
}
function serializeProject(project) { return JSON.stringify(parseProject(JSON.stringify(project))); }
export { createProject, encode, decode, validateCipher, parseProject, serializeProject };
