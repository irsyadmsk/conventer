import * as opentype from './vendor/opentype.mjs';
import * as glyphEngine from './glyphs.js';
import * as core from './core.js';
// Stroke centerlines become filled outlines: same winding for overlapping shapes.
function polygon(path, points) {
  var area = points.reduce(function (sum, p, i) { var q = points[(i + 1) % points.length]; return sum + p[0] * q[1] - q[0] * p[1]; }, 0);
  if (area < 0) points = points.slice().reverse();
  path.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(function (p) { path.lineTo(p[0], p[1]); });
  path.close();
}
function outlines(strokes, width) {
  var path = new opentype.Path(), radius = width * 3.5;
  strokes.forEach(function (stroke) {
    var points = stroke.map(function (p) { return [Math.round(70 + p[0] * 6), Math.round((90 - p[1]) * 8)]; });
    points.forEach(function (p, i) {
      var circle = [];
      for (var j = 0; j < 12; j++) { var angle = j * Math.PI / 6; circle.push([Math.round(p[0] + Math.cos(angle) * radius), Math.round(p[1] + Math.sin(angle) * radius)]); }
      polygon(path, circle);
      if (i) {
        var a = points[i - 1], dx = p[0] - a[0], dy = p[1] - a[1], length = Math.hypot(dx, dy);
        if (length) {
          var nx = -dy / length * radius, ny = dx / length * radius;
          polygon(path, [[a[0]+nx,a[1]+ny],[p[0]+nx,p[1]+ny],[p[0]-nx,p[1]-ny],[a[0]-nx,a[1]-ny]].map(function (v) { return v.map(Math.round); }));
        }
      }
    });
  });
  return path;
}
function build(project) {
  if (!opentype) throw new Error('Pustaka font belum termuat. Muat ulang halaman.');
  project = core.parseProject(core.serializeProject(project));
  var drawn = project.glyphs.filter(function (g) { return g.strokes.length; });
  if (!drawn.length) throw new Error('Gambar sedikitnya satu simbol di Aksara Lab terlebih dahulu.');
  var count = drawn.reduce(function (n,g) { return n + g.strokes.reduce(function (m,s) { return m+s.length; },0); },0);
  if (count > 12000) throw new Error('Gambar terlalu rumit untuk ekspor font awal. Kurangi goresan (maks. 12.000 titik).');
  var notdef = new opentype.Path();
  polygon(notdef, [[80,0],[80,600],[440,600],[440,0]]);
  // A visible .notdef instead of silently substituting an empty glyph.
  var glyphs = [new opentype.Glyph({name:'.notdef',advanceWidth:650,path:notdef})];
  var mapping = [], used = new Set();
  drawn.forEach(function (g, i) {
    if (project.font.mapping === 'latin' && Array.from(g.source).length !== 1) throw new Error('Mode karakter asli membutuhkan satu karakter per simbol. Untuk gabungan seperti ng, pilih Unicode privat.');
    var cp = project.font.mapping === 'pua' ? 0xe000 + i : g.source.codePointAt(0);
    if (cp === 0 || cp < 32 || (cp >= 0xd800 && cp <= 0xdfff) || used.has(cp)) throw new Error('Pemetaan font tidak valid atau berulang.');
    used.add(cp);
    glyphs.push(new opentype.Glyph({name:'uni'+cp.toString(16).toUpperCase(),unicode:cp,advanceWidth:740+project.font.spacing,path:outlines(g.strokes, project.font.strokeWidth)}));
    mapping.push({source:g.source,codepoint:cp,character:String.fromCodePoint(cp)});
  });
  if (!used.has(32)) glyphs.push(new opentype.Glyph({name:'space',unicode:32,advanceWidth:350,path:new opentype.Path()}));
  var font = new opentype.Font({familyName:project.font.family,styleName:'Regular',unitsPerEm:1000,ascender:850,descender:-200,glyphs:glyphs});
  if (project.font.author) font.names.designer = {en:project.font.author};
  if (project.font.license) font.names.license = {en:project.font.license};
  font.names.description = {en:'Created in Studio Kreasi. Custom glyphs; only mapped characters are included.'};
  return {buffer:font.toArrayBuffer(),mapping:mapping};
}
function previewText(text, glyphs, mapping) {
  var bySource = new Map(mapping.map(function (m) { return [m.source,m.character]; }));
  return glyphEngine.tokenize(text,glyphs).map(function (t) { return t.glyph ? (bySource.get(t.glyph.source) || t.glyph.source) : t.text; }).join('');
}
export { build, previewText };
