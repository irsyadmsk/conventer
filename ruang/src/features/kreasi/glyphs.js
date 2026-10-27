function escapeXML(text) { return String(text).replace(/[&<>"']/g, function (ch) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]; }); }
function tokenize(text, glyphs) {
  var sorted = glyphs.filter(function (g) { return g.source.length; }).slice().sort(function (a, b) { return b.source.length - a.source.length; });
  var result = [], i = 0;
  while (i < text.length) {
    var glyph = sorted.find(function (g) { return text.startsWith(g.source, i); });
    if (glyph) { result.push({ glyph:glyph }); i += glyph.source.length; }
    else { var ch = String.fromCodePoint(text.codePointAt(i)); result.push({ text:ch }); i += ch.length; }
  }
  return result;
}
function paths(glyph, strokeWidth) {
  return glyph.strokes.map(function (stroke) {
    var points = stroke.length === 1 ? [stroke[0], [stroke[0][0] + 0.01, stroke[0][1]]] : stroke;
    return '<path d="' + points.map(function (pt, i) { return (i ? 'L' : 'M') + pt[0] + ' ' + pt[1]; }).join(' ') + '" fill="none" stroke="#172033" stroke-width="' + strokeWidth + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }).join('');
}
function glyphSVG(glyph, strokeWidth) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">' + paths(glyph, strokeWidth) + '</svg>';
}
var svgSerial = 0;
function textSVG(text, glyphs, strokeWidth) {
  var x = 16, y = 16, body = [], maxX = 96, definitions = [], used = new Map();
  var prefix = 'cr-render-' + (++svgSerial) + '-';
  tokenize(text, glyphs).forEach(function (token) {
    if (token.text === '\n') { x = 16; y += 100; return; }
    if (x + 80 > 816) { x = 16; y += 100; }
    if (token.glyph) {
      if (!used.has(token.glyph)) {
        var id = prefix + used.size;
        used.set(token.glyph, id);
        definitions.push('<g id="' + id + '">' + paths(token.glyph, strokeWidth) + '</g>');
      }
      body.push('<g transform="translate(' + x + ',' + y + ') scale(.8)"><use href="#' + used.get(token.glyph) + '"/></g>');
    }
    else body.push('<text x="' + (x + 12) + '" y="' + (y + 60) + '" font-size="36" font-family="sans-serif" fill="#64748b">' + escapeXML(token.text) + '</text>');
    x += token.text === ' ' ? 40 : 80; maxX = Math.max(maxX, x);
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + Math.min(832, maxX + 16) + ' ' + (y + 104) + '" width="' + Math.min(832, maxX + 16) + '" height="' + (y + 104) + '"><defs>' + definitions.join('') + '</defs><rect width="100%" height="100%" fill="white"/>' + body.join('') + '</svg>';
}
function sheetSVG(glyphs, strokeWidth, title) {
  var body = '<text x="24" y="38" font-size="22" font-family="sans-serif" fill="#172033">' + escapeXML(title) + '</text>';
  glyphs.forEach(function (g, i) {
    var x = 24 + (i % 6) * 128, y = 64 + Math.floor(i / 6) * 144;
    body += '<g transform="translate(' + x + ',' + y + ')"><rect width="112" height="132" rx="6" fill="none" stroke="#cbd5e1"/><g transform="translate(6,4)">' + paths(g, strokeWidth) + '</g><text x="56" y="120" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#172033">' + escapeXML(g.source === ' ' ? 'spasi' : g.source) + '</text></g>';
  });
  var height = Math.max(230, Math.ceil(glyphs.length / 6) * 144 + 80);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="816" height="' + height + '" viewBox="0 0 816 ' + height + '"><rect width="100%" height="100%" fill="white"/>' + body + '</svg>';
}
export { tokenize, glyphSVG, textSVG, sheetSVG };
