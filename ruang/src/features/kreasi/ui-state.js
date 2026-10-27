/** Reject budgets across the entire account before accepting an edit. */
export function assertBudget(projects) {
  if (projects.length > 20) throw new Error('Maksimal 20 proyek per akun.')
  let points = 0
  for (const project of projects) for (const glyph of project.glyphs) {
    if (glyph.strokes.length > 128) throw new Error('Maksimal 128 goresan per simbol.')
    for (const stroke of glyph.strokes) {
      if (stroke.length > 2048) throw new Error('Maksimal 2.048 titik per goresan.')
      points += stroke.length
      if (points > 50000) throw new Error('Maksimal 50.000 titik untuk seluruh proyek akun.')
    }
  }
}
