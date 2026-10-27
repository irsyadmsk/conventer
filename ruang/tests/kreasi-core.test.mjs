import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../src/features/kreasi/core.js';
import * as g from '../src/features/kreasi/glyphs.js';
test('Studio Kreasi creates a versioned, independent local project', () => {

  const a = core.createProject('Aksara Langit');
  const b = core.createProject('Proyek kedua');
  assert.equal(a.version, 1);
  assert.equal(a.name, 'Aksara Langit');
  assert.notEqual(a.id, b.id);
  a.cipher.rules[0].target = 'changed';
  assert.notEqual(b.cipher.rules[0].target, 'changed');
  assert.deepEqual(a.glyphs, []);
});

test('custom cipher reversibly encodes longest source matches and Unicode literals', () => {

  assert.equal(typeof core.encode, 'function', 'custom cipher encoder is missing');
  const cipher = { separator: '/', unknown: 'keep', rules: [{ source: 'ng', target: '99' }, { source: 'a', target: '01' }, { source: 'n', target: '02' }] };
  assert.equal(core.encode('anga', cipher), '01/99/01');
  const text = 'ang /~🙂\né';
  const encoded = core.encode(text, cipher);
  assert.equal(core.decode(encoded, cipher), text);
  assert.equal(core.encode('', cipher), '');
  assert.equal(core.decode('', cipher), '');
});

test('cipher validates collisions, reserved tokens, separators and rejects malformed input', () => {

  assert.equal(typeof core.validateCipher, 'function');
  const config = { separator: '/', unknown: 'reject', rules: [{source: 'A', target: '1'}, {source: 'B', target: '11'}] };
  assert.deepEqual(core.validateCipher(config), []); // prefixes are safe because tokens are delimited
  assert.equal(core.decode(core.encode('ABA', config), config), 'ABA');
  assert.throws(() => core.encode('Z', config), /belum dipetakan/);
  assert.throws(() => core.decode('3', config), /tidak dikenal/);
  for (const rules of [
    [{source: 'A', target:'1'}, {source:'B', target:'1'}],
    [{source: 'A', target:'1'}, {source:'A', target:'2'}],
    [{source: '', target:'1'}], [{source:'A', target:''}],
    [{source:'A', target:'a/b'}], [{source:'A', target:'~000041'}]
  ]) {
    const bad = {...config, rules};
    assert.ok(core.validateCipher(bad).length);
    assert.throws(() => core.encode('A', bad));
    assert.throws(() => core.decode('1', bad));
  }
  assert.ok(core.validateCipher({...config, separator:''}).length);
  assert.throws(() => core.decode('~110000', {...config, unknown:'keep'}), /tidak dikenal/);
});

test('project import roundtrips editable glyphs and rejects malformed or oversized data', () => {

  assert.equal(typeof core.parseProject, 'function');
  const p = core.createProject('<script>unsafe label</script>');
  p.glyphs = [{id:'g-a', source:'a', strokes:[[[10,20],[60,80]]]}];
  const result = core.parseProject(core.serializeProject(p));
  assert.deepEqual(result, p);
  for (const change of [
    {version:2}, {glyphs:[{id:'x',source:'a',strokes:[[[NaN,20]]]}]},
    {glyphs:[{id:'x',source:'a',strokes:[[[101,20]]]}]},
    {glyphs:[{id:'x',source:'a',strokes:[]},{id:'y',source:'a',strokes:[]}]},
    {font:{...p.font,strokeWidth:100}}, {cipher:{...p.cipher,rules:'bad'}}
  ]) assert.throws(() => core.parseProject(JSON.stringify({...p,...change})));
  assert.throws(() => core.parseProject('not json'));
  assert.throws(() => core.parseProject(' '.repeat(2_000_001)), /besar/);
  const extra = JSON.parse(core.serializeProject(p));
  extra.untrustedHTML = '<img onerror=alert(1)>';
  assert.equal(core.parseProject(JSON.stringify(extra)).untrustedHTML, undefined);
});

test('compact exports roundtrip 50,000 points and Unicode within the UTF-8 byte limit', () => {
  const p = core.createProject('🙂 Aksara 世界');
  p.sample = '🙂漢'.repeat(4000);
  p.glyphs = [{id:'g',source:'🙂',strokes:[]}];
  for (let remaining=50000; remaining>0;) {
    const n=Math.min(2048,remaining); remaining-=n;
    p.glyphs[0].strokes.push(Array.from({length:n},() => [12.3,45.6]));
  }
  assert.ok(Buffer.byteLength(JSON.stringify(p,null,2),'utf8')>2000000, 'reproduces oversized pretty export');
  const text=core.serializeProject(p);
  assert.ok(Buffer.byteLength(text,'utf8')<=2000000);
  assert.deepEqual(core.parseProject(text),p);
});

test('parse and serialize enforce the same exact 2,000,000 UTF-8 byte boundary', () => {
  const p=core.createProject('Unicode');
  const withExtra={...p,extra:'漢'};
  const raw=JSON.stringify(withExtra), bytes=Buffer.byteLength(raw,'utf8');
  const exact=raw+' '.repeat(2000000-bytes);
  assert.equal(Buffer.byteLength(exact,'utf8'),2000000);
  assert.deepEqual(core.parseProject(exact),p);
  assert.throws(() => core.parseProject(exact+' '),/besar/);
  const wide=JSON.stringify({...p,extra:'漢'.repeat(700000)});
  assert.ok(wide.length<2000000);
  assert.throws(() => core.parseProject(wide),/besar/);
  p.glyphs=[{id:'g',source:'a',strokes:[]}];
  for(let remaining=50000;remaining>0;) { const n=Math.min(remaining,2048);remaining-=n;p.glyphs[0].strokes.push(Array.from({length:n},() => [0.12345678901234568,0.12345678901234568])); }
  assert.ok(Buffer.byteLength(JSON.stringify(p),'utf8')>2000000);
  assert.throws(() => core.serializeProject(p),/besar/);
});

test('glyph tokenizer uses longest mappings, preserves Unicode and exports safe SVG', () => {

  const glyphs = [{id:'a',source:'a',strokes:[[[10,10],[90,90]]]}, {id:'ng',source:'ng',strokes:[[[50,10],[50,90]]]}];
  assert.deepEqual(g.tokenize('ang🙂', glyphs).map(t=>t.glyph ? t.glyph.source : t.text), ['a','ng','🙂']);
  const svg = g.textSVG('a<&\nng', glyphs, 6);
  assert.match(svg, /<svg/);
  assert.match(svg, /<path/);
  assert.match(svg, /&lt;/);
  assert.ok(!svg.includes('<&'));
  assert.match(g.glyphSVG(glyphs[0], 6), /viewBox="0 0 100 100"/);
  assert.match(g.sheetSVG(glyphs, 6, '<My project>'), /&lt;My project&gt;/);
});