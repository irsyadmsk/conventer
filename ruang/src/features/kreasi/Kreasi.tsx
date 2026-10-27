import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Download, Plus, Sparkles, Upload, PenTool, KeyRound, Type } from 'lucide-react'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Badge, CopyButton, Segmented, Slider } from '@/components/ui/Controls'
import { Dialog } from '@/components/ui/Dialog'
import { useAuth } from '@/lib/auth'
import { createProject, encode, decode, validateCipher, parseProject, serializeProject } from './core.js'
import { glyphSVG, sheetSVG, textSVG, tokenize } from './glyphs.js'
import { ProjectStore } from './store'
import type { CreationProject, ProjectState, Glyph, Point } from './types'
import { assertBudget } from './ui-state.js'

type Tab = 'sandi' | 'aksara' | 'font'
const message = (e: unknown) => e instanceof Error ? e.message : 'Operasi tidak berhasil.'
function download(data: BlobPart, name: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function SvgPreview({ svg, label }: { svg: string; label: string }) {
  return <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={label} className="max-h-72 max-w-full rounded-xl bg-white" />
}

export default function Kreasi() {
  const { user } = useAuth()
  return user ? <Studio key={user.id} owner={user.id} /> : null
}

function Studio({ owner }: { owner: string }) {
  const [state, setState] = useState<ProjectState | null>(null)
  const current = useRef<ProjectState | null>(null)
  const store = useRef<ProjectStore | null>(null)
  const alive = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const revision = useRef(0)
  const dirty = useRef(false)
  const [status, setStatus] = useState('Memuat proyek lokal…')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('sandi')
  const [remove, setRemove] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  useEffect(() => {
    alive.current = true
    const live = new ProjectStore(owner)
    store.current = live
    try {
      const loaded = live.load()
      assertBudget(loaded.projects)
      current.current = loaded; setState(loaded)
      setStatus('Proyek lokal siap · bukan cloud')
    } catch (e) {
      const p = createProject('Proyek pemulihan')
      const fallback: ProjectState = { version: 1, activeId: p.id, projects: [p] }
      current.current = fallback; setState(fallback)
      live.markConflict()
      setError(`${message(e)} Penyimpanan dihentikan agar data lama tidak tertimpa. Anda tetap dapat mengekspor proyek.`)
      setStatus('Mode pemulihan · ekspor tersedia')
    }
    const storage = (event: StorageEvent) => {
      if (event.key === live.key || event.key === null) {
        live.markConflict()
        revision.current++
        if (timer.current) clearTimeout(timer.current)
        setError('Data berubah di tab lain. Ekspor perubahan Anda, lalu muat ulang sebelum melanjutkan penyimpanan.')
        setStatus('Konflik penyimpanan')
      }
    }
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty.current) { event.preventDefault(); event.returnValue = '' }
    }
    window.addEventListener('storage', storage)
    window.addEventListener('beforeunload', unload)
    return () => {
      alive.current = false; revision.current++
      if (timer.current) clearTimeout(timer.current)
      live.dispose()
      if (store.current === live) store.current = null
      window.removeEventListener('storage', storage)
      window.removeEventListener('beforeunload', unload)
    }
  }, [owner])

  function commit(next: ProjectState) {
    try {
      assertBudget(next.projects)
      current.current = next; setState(next)
      dirty.current = true; setStatus('Perubahan belum tersimpan…')
      const rev = ++revision.current
      if (timer.current) clearTimeout(timer.current)
      const live = store.current
      timer.current = setTimeout(() => {
        if (!alive.current || !live || live !== store.current) return
        live.save(next).then(() => {
          if (!alive.current || live !== store.current || revision.current !== rev) return
          dirty.current = false; setStatus('Tersimpan di perangkat ini · bukan cloud')
        }).catch((e: unknown) => {
          if (!alive.current || live !== store.current) return
          setError(`${message(e)} Ekspor proyek untuk menyimpan salinan.`)
          setStatus('Belum tersimpan · ekspor tersedia')
        })
      }, 250)
    } catch (e) { setError(message(e)) }
  }
  function checkBudget(project: CreationProject) {
    const s = current.current
    if (s) assertBudget(s.projects.map(p => p.id === project.id ? project : p))
  }
  function update(project: CreationProject) {
    const s = current.current
    if (!s) return
    commit({ ...s, projects: s.projects.map(p => p.id === project.id ? { ...project, updatedAt: new Date().toISOString() } : p) })
  }
  function add(copy = false) {
    const s = current.current
    if (!s) return
    const selected = s.projects.find(p => p.id === s.activeId)
    const fresh = createProject(copy && selected ? `${selected.name.slice(0, 70)} (salinan)` : 'Proyek baru')
    const p = copy && selected ? { ...structuredClone(selected), id: fresh.id, name: fresh.name, updatedAt: fresh.updatedAt } : fresh
    commit({ ...s, activeId: p.id, projects: [...s.projects, p] })
  }
  async function importProject(f?: File) {
    if (!f) return
    try {
      if (f.size > 2000000) throw new Error('Berkas terlalu besar. Maksimal 2 MB (2.000.000 byte).')
      const text = await f.text()
      if (!alive.current) return
      const imported = parseProject(text)
      const fresh = createProject(imported.name)
      const s = current.current
      if (s) commit({ ...s, activeId: fresh.id, projects: [...s.projects, { ...imported, id: fresh.id }] })
    } catch (e) { if (alive.current) setError(message(e)) }
  }
  const project = state?.projects.find(p => p.id === state.activeId)
  return <div>
    <PageHeader judul="Studio Kreasi" deskripsi="Rancang sandi, gambar aksara, dan jadikan font milik Anda sendiri." ikon={<Sparkles />} aksi={<Badge nada="aksen">Lokal per akun</Badge>} />
    <Panel judul="Ruang proyek" titik="aksen" aksi={<><Button ukuran="sm" ikon={<Plus />} onClick={() => add()}>Proyek baru</Button><Button ukuran="sm" onClick={() => add(true)} disabled={!project}>Duplikat</Button></>}>
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
        <Select label="Proyek aktif" value={state?.activeId ?? ''} onChange={e => state && commit({ ...state, activeId: e.target.value })}>
          {state?.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Input label="Nama proyek" value={project?.name ?? ''} maxLength={80} onChange={e => project && update({ ...project, name: e.target.value })} />
        <div className="flex flex-wrap gap-2">
          <Button ikon={<Upload />} onClick={() => file.current?.click()}>Impor</Button>
          <Button ikon={<Download />} disabled={!project} onClick={() => { if (project) try { download(serializeProject(project), `${project.name || 'proyek'}.json`, 'application/json') } catch (e) { setError(message(e)) } }}>Ekspor</Button>
          <Button varian="danger" disabled={!project} onClick={() => setRemove(true)}>Hapus</Button>
        </div>
      </div>
      <input ref={file} type="file" accept=".json,application/json" className="hidden" aria-label="Impor proyek JSON" onChange={e => { void importProject(e.target.files?.[0]); e.target.value = '' }} />
      <p className="mt-3 text-xs text-ink-3" role="status">{status}. Maks. 20 proyek; 50.000 titik per akun.</p>
    </Panel>
    {error && <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger"><p className="flex-1">{error}</p><button aria-label="Tutup pesan" onClick={() => setError('')}>×</button></div>}
    <div className="my-5"><Segmented<Tab> label="Laboratorium kreasi" nilai={tab} onChange={setTab} pilihan={[{ id: 'sandi', label: 'Sandi Lab', ikon: <KeyRound /> }, { id: 'aksara', label: 'Aksara Lab', ikon: <PenTool /> }, { id: 'font', label: 'Font Lab', ikon: <Type /> }]} /></div>
    {project && <div key={project.id}>
      {tab === 'sandi' && <SandiLab project={project} update={update} />}
      {tab === 'aksara' && <AksaraLab project={project} update={update} report={setError} checkBudget={checkBudget} />}
      {tab === 'font' && <FontLab project={project} update={update} />}
    </div>}
    <Dialog buka={remove} tutup={() => setRemove(false)} judul="Hapus proyek?" bahaya deskripsi="Tindakan ini tidak dapat dibatalkan. Ekspor salinan terlebih dahulu bila diperlukan." kaki={<><Button onClick={() => setRemove(false)}>Batal</Button><Button varian="danger" onClick={() => {
      if (!state || !project) return
      const rest = state.projects.filter(p => p.id !== project.id)
      if (!rest.length) rest.push(createProject('Proyek baru'))
      commit({ ...state, projects: rest, activeId: rest[0].id }); setRemove(false)
    }}>Hapus proyek</Button></>}><p className="text-sm text-ink-2">{project?.name}</p></Dialog>
  </div>
}

function SandiLab({ project, update }: { project: CreationProject; update: (p: CreationProject) => void }) {
  const input = project.sample
  const [output, setOutput] = useState('')
  const [feedback, setFeedback] = useState('')
  const errors = validateCipher(project.cipher)
  const cipher = (change: Partial<CreationProject['cipher']>) => { update({ ...project, cipher: { ...project.cipher, ...change } }); setOutput(''); setFeedback('') }
  function run(mode: 'encode' | 'decode' | 'roundtrip') {
    try {
      const encoded = mode === 'decode' ? decode(input, project.cipher) : encode(input, project.cipher)
      setOutput(mode === 'roundtrip' ? decode(encoded, project.cipher) : encoded)
      setFeedback(mode === 'roundtrip' ? (decode(encoded, project.cipher) === input ? 'Roundtrip berhasil — teks kembali persis.' : 'Roundtrip tidak sama.') : '')
    } catch (e) { setOutput(''); setFeedback(message(e)) }
  }
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
    <Panel judul="Aturan sandi" titik="aksen" aksi={<Button ukuran="sm" disabled={project.cipher.rules.length >= 256} onClick={() => cipher({ rules: [...project.cipher.rules, { source: '', target: '' }] })}>Tambah aturan</Button>}>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Select label="Pemisah" value={project.cipher.separator} onChange={e => cipher({ separator: e.target.value as CreationProject['cipher']['separator'] })}>{['/', '|', '·', ' '].map(v => <option key={v} value={v}>{v === ' ' ? 'Spasi' : v}</option>)}</Select>
        <Select label="Karakter tak dikenal" value={project.cipher.unknown} onChange={e => cipher({ unknown: e.target.value as 'keep' | 'reject' })}><option value="keep">Pertahankan (escape)</option><option value="reject">Tolak</option></Select>
      </div>
      <div className="max-h-96 overflow-auto rounded-xl border border-line">
        <table className="w-full text-sm"><caption className="sr-only">Tabel sumber dan kode sandi</caption><thead className="sticky top-0 bg-surface-2 text-left text-ink-2"><tr><th className="p-2">Sumber</th><th className="p-2">Kode unik</th><th><span className="sr-only">Hapus</span></th></tr></thead><tbody>{project.cipher.rules.map((r, i) => <tr key={i} className="border-t border-line"><td className="p-1.5"><input className="field h-9" aria-label={`Sumber aturan ${i + 1}`} value={r.source} maxLength={16} onChange={e => cipher({ rules: project.cipher.rules.map((v, n) => n === i ? { ...v, source: e.target.value } : v) })} /></td><td className="p-1.5"><input className="field h-9" aria-label={`Kode aturan ${i + 1}`} value={r.target} maxLength={40} onChange={e => cipher({ rules: project.cipher.rules.map((v, n) => n === i ? { ...v, target: e.target.value } : v) })} /></td><td><button className="p-2 text-danger" aria-label={`Hapus aturan ${i + 1}`} onClick={() => cipher({ rules: project.cipher.rules.filter((_, n) => n !== i) })}>×</button></td></tr>)}</tbody></table>
      </div>
      <div className="mt-3 text-xs" role="status">{errors.length ? <ul className="space-y-1 text-danger">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul> : <span className="text-success">Aturan valid · tidak ada kode bentrok. Sandi kreatif ini bukan enkripsi keamanan.</span>}</div>
    </Panel>
    <div className="flex min-w-0 flex-col gap-4">
      <Panel judul="Masukan" titik="aksen"><Textarea label="Teks sandi" value={input} maxLength={20000} onChange={e => { update({ ...project, sample: e.target.value }); setOutput(''); setFeedback('') }} /><div className="mt-3 flex flex-wrap gap-2"><Button varian="primary" disabled={!!errors.length} onClick={() => run('encode')}>Encode</Button><Button disabled={!!errors.length} onClick={() => run('decode')}>Decode</Button><Button disabled={!!errors.length} onClick={() => run('roundtrip')}>Uji roundtrip</Button></div></Panel>
      <Panel judul="Hasil" titik="sukses" aksi={<CopyButton teks={output} tool="kreasi" />}><output className="block min-h-32 break-all whitespace-pre-wrap font-mono text-sm">{output || <span className="text-ink-3">Hasil transformasi muncul di sini.</span>}</output>{feedback && <p className="mt-2 text-sm text-ink-2" role="status">{feedback}</p>}<div className="mt-3 flex flex-wrap gap-2"><Button ukuran="sm" disabled={!output} onClick={() => { update({ ...project, sample: output }); setOutput('') }}>Hasil → masukan</Button><Button ukuran="sm" disabled={!output} onClick={() => download(output, 'sandi.txt')}>Unduh TXT</Button></div></Panel>
    </div>
  </div>
}

function AksaraLab({ project, update, report, checkBudget }: { project: CreationProject; update: (p: CreationProject) => void; report: (s: string) => void; checkBudget: (p: CreationProject) => void }) {
  const [selected, setSelected] = useState(project.glyphs[0]?.id ?? '')
  const [source, setSource] = useState('ng')
  const [draft, setDraft] = useState<Point[]>([])
  const drawing = useRef<{ id: number; points: Point[] } | null>(null)
  const [past, setPast] = useState<Point[][][]>([])
  const [future, setFuture] = useState<Point[][][]>([])
  const glyph = project.glyphs.find(g => g.id === selected)
  const setStrokes = (strokes: Point[][], history = true) => {
    if (!glyph) return
    const next = { ...project, glyphs: project.glyphs.map(g => g.id === glyph.id ? { ...g, strokes } : g) }
    try {
      // The parent additionally enforces the account-wide aggregate before committing.
      checkBudget(next)
      if (history) { setPast(p => [...p.slice(-19), glyph.strokes]); setFuture([]) }
      update(next)
    } catch (e) { report(message(e)) }
  }
  const choose = (id: string) => { drawing.current = null; setDraft([]); setSelected(id); setPast([]); setFuture([]) }
  function addGlyph(value = source) {
    if (!value || value.length > 16 || /[\r\n\t]/.test(value)) { report('Isi sumber 1–16 karakter tanpa tab atau baris baru.'); return }
    const existing = project.glyphs.find(g => g.source === value)
    if (existing) { choose(existing.id); return }
    if (project.glyphs.length >= 256) { report('Maksimal 256 simbol per proyek.'); return }
    const g: Glyph = { id: crypto.randomUUID(), source: value, strokes: [] }
    update({ ...project, glyphs: [...project.glyphs, g] }); choose(g.id)
  }
  function point(e: PointerEvent<SVGSVGElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect()
    return [Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100)), Math.max(0, Math.min(100, (e.clientY - rect.top) / rect.height * 100))]
  }
  function checkDraft(points: Point[]) {
    if (!glyph) return false
    try {
      checkBudget({ ...project, glyphs: project.glyphs.map(g => g.id === glyph.id ? { ...g, strokes: [...g.strokes, points] } : g) })
      return true
    } catch (e) { report(message(e)); return false }
  }
  function end(e: PointerEvent<SVGSVGElement>, cancel = false) {
    const stroke = drawing.current
    if (!stroke || stroke.id !== e.pointerId) return
    drawing.current = null; setDraft([])
    if (!cancel && glyph) setStrokes([...glyph.strokes, stroke.points])
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  async function png() {
    if (!glyph) return
    const svg = glyphSVG(glyph, project.font.strokeWidth)
    try {
      const image = new Image(); image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      await image.decode()
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 800
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas tidak tersedia.')
      ctx.drawImage(image, 0, 0, 800, 800)
      canvas.toBlob(blob => { if (blob) download(blob, 'simbol.png', 'image/png') }, 'image/png')
    } catch (e) { report(message(e)) }
  }
  return <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
    <Panel judul="Koleksi simbol" titik="aksen">
      <Input label="Sumber / gabungan" bantuan="Satu huruf atau gabungan seperti ng." value={source} maxLength={16} onChange={e => setSource(e.target.value)} />
      <Button className="mt-3" varian="primary" penuh onClick={() => addGlyph()}>Tambah / pilih</Button>
      <p className="mt-5 mb-2 text-xs font-semibold text-ink-3">PAPAN SUMBER</p>
      <div className="flex flex-wrap gap-1">{Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').concat(['ng', 'ny', ' ']).map(c => <button key={c} className="grid size-8 place-items-center rounded-lg bg-surface-2 text-xs hover:bg-accent-soft" onClick={() => addGlyph(c)} aria-label={`Tambah atau pilih ${c === ' ' ? 'spasi' : c}`}>{c === ' ' ? '␣' : c}</button>)}</div>
      <div className="mt-4 grid max-h-80 grid-cols-3 gap-2 overflow-auto">{project.glyphs.map(g => <button key={g.id} aria-pressed={g.id === selected} onClick={() => choose(g.id)} className={`rounded-xl border p-1 ${g.id === selected ? 'border-accent bg-accent-soft' : 'border-line bg-surface-2'}`}><SvgPreview svg={glyphSVG(g, project.font.strokeWidth)} label={`Simbol ${g.source}`} /><span className="text-xs">{g.source === ' ' ? 'spasi' : g.source}</span></button>)}</div>
    </Panel>
    <div className="flex min-w-0 flex-col gap-4">
      <Panel judul={glyph ? `Editor vektor · ${glyph.source}` : 'Editor vektor'} titik="aksen" aksi={<Badge>100 × 100</Badge>}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="min-w-0 flex-1">
            <svg viewBox="0 0 100 100" role="img" aria-label="Kanvas gambar simbol; gunakan pointer atau tombol bentuk" className="mx-auto aspect-square w-full max-w-96 touch-none rounded-2xl border border-line bg-surface-2 text-ink" onPointerDown={e => {
              if (!glyph || drawing.current || e.button !== 0) return
              if (glyph.strokes.length >= 128) { report('Maksimal 128 goresan per simbol.'); return }
              const first = [point(e)]
              if (!checkDraft(first)) return
              e.currentTarget.setPointerCapture(e.pointerId)
              drawing.current = { id: e.pointerId, points: first }; setDraft(drawing.current.points)
            }} onPointerMove={e => {
              const stroke = drawing.current
              if (!stroke || stroke.id !== e.pointerId) return
              if (stroke.points.length >= 2048) { report('Batas 2.048 titik tercapai; akhiri goresan.'); return }
              const next = [...stroke.points, point(e)]
              if (!checkDraft(next)) return
              stroke.points = next; setDraft(stroke.points)
            }} onPointerUp={e => end(e)} onPointerCancel={e => end(e, true)} onLostPointerCapture={() => { drawing.current = null; setDraft([]) }}>
              {[25, 50, 75].map(n => <path key={n} d={`M${n} 0V100 M0 ${n}H100`} stroke="currentColor" opacity=".1" strokeWidth=".4" />)}
              {[...(glyph?.strokes ?? []), ...(draft.length ? [draft] : [])].map((s, i) => <path key={i} d={s.map((p, n) => `${n ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ') + (s.length === 1 ? `l.01 0` : '')} fill="none" stroke="currentColor" strokeWidth={project.font.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />)}
            </svg>
            <p className="mt-2 text-center text-xs text-ink-3">{glyph ? `${glyph.strokes.length}/128 goresan · gambar dengan mouse, pena, atau sentuhan` : 'Tambah atau pilih sumber untuk mulai menggambar.'}</p>
          </div>
          <div className="flex flex-wrap content-start gap-2 sm:w-40">
            <Button ukuran="sm" disabled={!glyph || !past.length} onClick={() => { const prev = past.at(-1); if (!prev || !glyph) return; setFuture(f => [...f, glyph.strokes]); setPast(p => p.slice(0, -1)); setStrokes(prev, false) }}>Undo</Button>
            <Button ukuran="sm" disabled={!glyph || !future.length} onClick={() => { const next = future.at(-1); if (!next || !glyph) return; setPast(p => [...p, glyph.strokes]); setFuture(f => f.slice(0, -1)); setStrokes(next, false) }}>Redo</Button>
            <Button ukuran="sm" disabled={!glyph} onClick={() => glyph && setStrokes([...glyph.strokes, [[20, 80], [80, 20]]])}>Garis</Button>
            <Button ukuran="sm" disabled={!glyph} onClick={() => glyph && setStrokes([...glyph.strokes, [[20, 20], [80, 20], [80, 80], [20, 80], [20, 20]]])}>Kotak</Button>
            <Button ukuran="sm" disabled={!glyph} onClick={() => glyph && setStrokes([...glyph.strokes, Array.from({ length: 33 }, (_, i): Point => [50 + 30 * Math.cos(i * Math.PI / 16), 50 + 30 * Math.sin(i * Math.PI / 16)])])}>Lingkaran</Button>
            <Button ukuran="sm" disabled={!glyph} onClick={() => glyph && setStrokes(glyph.strokes.map(s => s.map(([x, y]): Point => [100 - x, y])))}>Cermin ↔</Button>
            <Button ukuran="sm" disabled={!glyph} onClick={() => glyph && setStrokes(glyph.strokes.map(s => s.map(([x, y]): Point => [x, 100 - y])))}>Cermin ↕</Button>
            <Button ukuran="sm" varian="danger" disabled={!glyph?.strokes.length} onClick={() => setStrokes([])}>Bersihkan</Button>
            <div className="w-full"><Slider label="Tebal goresan" nilai={project.font.strokeWidth} min={1} max={16} onChange={strokeWidth => update({ ...project, font: { ...project.font, strokeWidth } })} /></div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><Button ukuran="sm" disabled={!glyph} onClick={() => glyph && download(glyphSVG(glyph, project.font.strokeWidth), 'simbol.svg', 'image/svg+xml')}>Unduh SVG</Button><Button ukuran="sm" disabled={!glyph} onClick={() => void png()}>Unduh PNG</Button><Button ukuran="sm" disabled={!project.glyphs.length} onClick={() => download(sheetSVG(project.glyphs, project.font.strokeWidth, project.name), 'lembar-simbol.svg', 'image/svg+xml')}>Lembar simbol SVG</Button></div>
      </Panel>
      <Panel judul="Pratinjau & keyboard aksara"><Textarea label="Teks contoh" maxLength={20000} value={project.sample} onChange={e => update({ ...project, sample: e.target.value })} /><div className="my-3 flex flex-wrap gap-2">{project.glyphs.map(g => <Button key={g.id} ukuran="sm" onClick={() => update({ ...project, sample: (project.sample + g.source).slice(0, 20000) })}>{g.source === ' ' ? 'Spasi' : g.source}</Button>)}</div><SvgPreview svg={textSVG(project.sample, project.glyphs, project.font.strokeWidth)} label="Pratinjau teks aksara" /></Panel>
    </div>
  </div>
}

function FontLab({ project, update }: { project: CreationProject; update: (p: CreationProject) => void }) {
  const [built, setBuilt] = useState<{ buffer: ArrayBuffer; mapping: { source: string; codepoint: number; character: string }[]; text: string; family: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const face = useRef<FontFace | null>(null)
  useEffect(() => {
    generation.current++; setBuilt(null); setBusy(false)
    if (face.current) { document.fonts.delete(face.current); face.current = null }
    return () => { generation.current++; if (face.current) { document.fonts.delete(face.current); face.current = null } }
  }, [project.font, project.glyphs])
  const mappedText = built ? tokenize(project.sample, project.glyphs).map(t => t.glyph ? (built.mapping.find(m => m.source === t.glyph.source)?.character ?? t.glyph.source) : t.text).join('') : ''
  async function build() {
    const token = ++generation.current
    setBusy(true); setError('')
    let loaded: FontFace | null = null
    try {
      const engine = await import('./font.js')
      if (token !== generation.current) return
      const result = engine.build(project)
      const family = `Kreasi-${crypto.randomUUID()}`
      loaded = new FontFace(family, result.buffer)
      await loaded.load()
      if (token !== generation.current) return
      if (face.current) document.fonts.delete(face.current)
      document.fonts.add(loaded); face.current = loaded
      setBuilt({ ...result, family, text: engine.previewText(project.sample, project.glyphs, result.mapping) })
    } catch (e) { if (token === generation.current) setError(message(e)) }
    finally { if (token === generation.current) setBusy(false) }
  }
  const font = (change: Partial<CreationProject['font']>) => update({ ...project, font: { ...project.font, ...change } })
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
    <Panel judul="Identitas & pemetaan" titik="aksen"><div className="space-y-4">
      <Input label="Keluarga font" value={project.font.family} maxLength={80} onChange={e => font({ family: e.target.value })} />
      <Input label="Pembuat" value={project.font.author} maxLength={120} onChange={e => font({ author: e.target.value })} />
      <Textarea label="Lisensi" value={project.font.license} maxLength={500} onChange={e => font({ license: e.target.value })} />
      <Select label="Pemetaan Unicode" bantuan="Gabungan seperti ng memerlukan Unicode privat. Hanya simbol yang digambar disertakan. Urutan simbol menentukan kode PUA; mengubah urutan dapat mengubah pemetaan." value={project.font.mapping} onChange={e => font({ mapping: e.target.value as 'latin' | 'pua' })}><option value="latin">Karakter asli</option><option value="pua">Unicode privat (PUA)</option></Select>
      <Slider label="Jarak huruf" nilai={project.font.spacing} min={0} max={300} onChange={spacing => font({ spacing })} />
      <Slider label="Tebal goresan" nilai={project.font.strokeWidth} min={1} max={16} onChange={strokeWidth => font({ strokeWidth })} />
      <Button varian="primary" memuat={busy} onClick={() => void build()}>Bangun & muat font</Button>
      <p className="text-xs text-ink-3">Font OpenType asli, dimuat lokal melalui FontFace. Tidak ada unggahan ke server. Ekspor font maksimal 12.000 titik.</p>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div></Panel>
    <Panel judul="Pratinjau font nyata" titik="sukses"><Textarea label="Teks contoh font" maxLength={20000} value={project.sample} onChange={e => update({ ...project, sample: e.target.value })} />
      <div className="my-4 min-h-44 rounded-2xl border border-line bg-surface-2 p-5"><p className="break-words whitespace-pre-wrap text-4xl leading-relaxed" style={built ? { fontFamily: `"${built.family}"` } : undefined}>{built ? mappedText : 'Bangun font untuk melihat hasil.'}</p></div>
      <div className="flex flex-wrap gap-2"><Button disabled={!built} ikon={<Download />} onClick={() => built && download(built.buffer, `${project.font.family || 'kreasi'}.otf`, 'font/otf')}>Unduh OTF</Button><Button disabled={!built} onClick={() => built && download(JSON.stringify(built.mapping, null, 2), 'pemetaan-font.json', 'application/json')}>Unduh pemetaan</Button><CopyButton teks={mappedText} tool="kreasi" label="Salin teks terpetakan" /></div>
      {built && <div className="mt-5 max-h-64 overflow-auto rounded-xl border border-line"><table className="w-full text-left text-sm"><thead className="bg-surface-2"><tr><th className="p-3">Sumber</th><th className="p-3">Unicode</th><th className="p-3">Simbol</th></tr></thead><tbody>{built.mapping.map(m => <tr key={m.source} className="border-t border-line"><td className="p-3">{m.source}</td><td className="p-3 font-mono">U+{m.codepoint.toString(16).toUpperCase()}</td><td className="p-3 text-2xl" style={{ fontFamily: `"${built.family}"` }}>{m.character}</td></tr>)}</tbody></table></div>}
    </Panel>
  </div>
}
