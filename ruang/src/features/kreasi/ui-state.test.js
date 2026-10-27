import test from 'node:test'
import assert from 'node:assert/strict'
import { assertBudget } from './ui-state.js'
test('rejects oversized strokes and aggregate before mutation', () => {
  assert.throws(() => assertBudget([{ glyphs: [{ strokes: [Array(2049).fill([0, 0])] }] }]), /2.048/)
  assert.throws(() => assertBudget([{ glyphs: [{ strokes: Array(129).fill([[0, 0]]) }] }]), /128/)
  assert.throws(() => assertBudget(Array(21).fill({ glyphs: [] })), /20/)
  const glyph = { strokes: Array(25).fill(Array(2000).fill([0, 0])) }
  assert.throws(() => assertBudget([{ glyphs: [glyph, { strokes: [[[0, 0]]] }] }]), /50.000/)
  assert.doesNotThrow(() => assertBudget([{ glyphs: [glyph] }]))
})
