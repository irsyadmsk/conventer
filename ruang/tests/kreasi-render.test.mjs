import test from 'node:test';
import assert from 'node:assert/strict';
import * as glyphEngine from '../src/features/kreasi/glyphs.js';
test('repeated complex glyphs reuse one SVG definition instead of duplicating geometry', () => {
  const glyphs = [{id:'safe',source:'a',strokes:[Array.from({length:1000},(_,i)=>[i%100,(i*3)%100])]}];
  const single = glyphEngine.textSVG('a',glyphs,6);
  const repeated = glyphEngine.textSVG('a'.repeat(100),glyphs,6);
  assert.ok(repeated.length < single.length * 4, '100 repeated symbols must not serialize the same complex geometry 100 times');
  assert.equal((repeated.match(/<path /g)||[]).length,1);
  assert.equal((repeated.match(/<use /g)||[]).length,100);
  assert.match(repeated,/<defs>/);
});