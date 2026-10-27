import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../src/features/kreasi/core.js';
import * as glyphs from '../src/features/kreasi/glyphs.js';
import * as font from '../src/features/kreasi/font.js';
import * as ot from '../src/features/kreasi/vendor/opentype.mjs';

test('independent versioned projects and whitelisted exact schema', () => {
  const a=core.createProject('Aksara'), b=core.createProject('B');
  assert.equal(a.version,1); assert.notEqual(a.id,b.id);
  a.cipher.rules[0].target='changed'; assert.notEqual(b.cipher.rules[0].target,'changed');
  assert.deepEqual(core.parseProject(core.serializeProject(a)),a);
  assert.equal(core.parseProject(JSON.stringify({...a,html:'<script>'})).html,undefined);
  for(const change of [{version:2},{glyphs:[{id:'x',source:'a',strokes:[[[101,20]]]}]},{font:{...a.font,strokeWidth:100}},{cipher:{...a.cipher,rules:'bad'}}]) assert.throws(()=>core.parseProject(JSON.stringify({...a,...change})));
  assert.throws(()=>core.parseProject('not JSON'));
});
test('greedy reversible cipher preserves Unicode, delimiters, escapes and rejects collisions',()=>{
  const c={separator:'/',unknown:'keep',rules:[{source:'ng',target:'99'},{source:'a',target:'01'},{source:'n',target:'02'}]};
  assert.equal(core.encode('anga',c),'01/99/01');
  for(const s of ['', 'ang /~🙂\né']) assert.equal(core.decode(core.encode(s,c),c),s);
  for(const rules of [[{source:'a',target:'1'},{source:'b',target:'1'}],[{source:'a',target:'1'},{source:'a',target:'2'}],[{source:'',target:'1'}],[{source:'a',target:'a/b'}],[{source:'a',target:'~000041'}]]) {
    const bad={...c,rules}; assert.ok(core.validateCipher(bad).length); assert.throws(()=>core.encode('a',bad)); assert.throws(()=>core.decode('1',bad));
  }
  assert.throws(()=>core.encode('!',{...c,unknown:'reject'}));
  assert.throws(()=>core.decode('~110000',c)); assert.throws(()=>core.decode('~00d800',c));
});
test('compact 50k-point Unicode export roundtrips and rejects the 50,001st point',()=>{
  const p=core.createProject('🙂 世界'); p.sample='🙂漢'.repeat(4000);
  p.glyphs=[{id:'g',source:'🙂',strokes:[]}];
  for(let remaining=50000;remaining>0;) {const n=Math.min(2048,remaining);remaining-=n;p.glyphs[0].strokes.push(Array.from({length:n},()=>[12.3,45.6]));}
  assert.ok(Buffer.byteLength(JSON.stringify(p,null,2))>2000000);
  const s=core.serializeProject(p);assert.ok(Buffer.byteLength(s)<=2000000);assert.deepEqual(core.parseProject(s),p);
  p.glyphs[0].strokes.push([[0,0]]); assert.throws(()=>core.serializeProject(p));
});
test('exact 2,000,000 UTF8 byte boundary matches importer and exporter',()=>{
  const p=core.createProject('Unicode'),raw=JSON.stringify({...p,extra:'漢'}),exact=raw+' '.repeat(2000000-Buffer.byteLength(raw));
  assert.deepEqual(core.parseProject(exact),p);assert.throws(()=>core.parseProject(exact+' '));
  assert.throws(()=>core.parseProject(JSON.stringify({...p,extra:'漢'.repeat(700000)})));
  p.glyphs=[{id:'g',source:'a',strokes:[]}];
  for(let remaining=50000;remaining>0;) {const n=Math.min(2048,remaining);remaining-=n;p.glyphs[0].strokes.push(Array.from({length:n},()=>[0.12345678901234568,0.12345678901234568]));}
  assert.throws(()=>core.serializeProject(p));
});
test('greedy SVG helpers escape XML and reuse geometry for PNG-ready SVG',()=>{
  const g=[{id:'a',source:'a',strokes:[Array.from({length:1000},(_,i)=>[i%100,(i*3)%100])]},{id:'ng',source:'ng',strokes:[[[50,10],[50,90]]]}];
  assert.deepEqual(glyphs.tokenize('ang🙂',g).map(t=>t.glyph?.source??t.text),['a','ng','🙂']);
  assert.match(glyphs.glyphSVG(g[0],6),/viewBox="0 0 100 100"/);
  assert.match(glyphs.textSVG('a<&\nng',g,6),/&lt;/);
  assert.match(glyphs.sheetSVG(g,6,'<My project>'),/&lt;My project&gt;/);
  const single=glyphs.textSVG('a',g,6), repeated=glyphs.textSVG('a'.repeat(100),g,6);
  assert.ok(repeated.length<single.length*4);assert.equal((repeated.match(/<path /g)||[]).length,1);assert.equal((repeated.match(/<use /g)||[]).length,100);
});
test('genuine parsable OTF, outlines, cmap, PUA mapping and preview',()=>{
  const p=core.createProject('Font');p.font.family='Langit';p.font.author='Pembuat';
  p.glyphs=[{id:'a',source:'a',strokes:[[[20,80],[50,15],[80,80]],[[32,55],[68,55]]]}];
  const r=font.build(p);assert.ok(r.buffer instanceof ArrayBuffer);assert.equal(Buffer.from(r.buffer).toString('ascii',0,4),'OTTO');
  const parsed=ot.parse(r.buffer); assert.equal(parsed.names.fontFamily.en,'Langit');assert.ok(parsed.charToGlyph('a').path.commands.length>10);assert.notEqual(parsed.charToGlyphIndex('a'),0);assert.ok(parsed.charToGlyph(' ').advanceWidth>0);assert.equal(r.mapping[0].codepoint,97);
  assert.throws(()=>font.build({...p,glyphs:[]}));p.glyphs[0].source='ng';assert.throws(()=>font.build(p));p.font.mapping='pua';
  const priv=font.build(p);assert.equal(priv.mapping[0].codepoint,0xe000);assert.notEqual(ot.parse(priv.buffer).charToGlyphIndex('\ue000'),0);assert.equal(font.previewText('ng!',p.glyphs,priv.mapping),'\ue000!');
});
