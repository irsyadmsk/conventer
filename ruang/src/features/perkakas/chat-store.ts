import { BATAS_RIWAYAT, kontakBersih, validKontak, type Kontak } from './chat-core.ts'
type Op = { id: string; target: string; row?: Kontak }
type Cache = { rows: Kontak[]; pending: Op[] }
export type ChatBackend = {
  list(): Promise<Kontak[]>
  save(row: Kontak): Promise<void>
  remove(target: string): Promise<void>
}
export type ChatSnapshot = {
  rows: Kontak[]
  status: 'lokal' | 'menyinkron' | 'tersinkron' | 'tertunda'
  warning: string
}
export function createChatStore(
  owner: string | null,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  backend?: ChatBackend,
) {
  const key = 'ruang:chat:v1:' + (owner ? `akun:${encodeURIComponent(owner)}` : 'tamu')
  let active = true,
    cache: Cache = { rows: [], pending: [] },
    running: Promise<void> | null = null
  let state: ChatSnapshot = { rows: [], status: 'lokal', warning: '' }
  const listeners = new Set<(v: ChatSnapshot) => void>()
  let lastStored: string | null = null,
    conflict = false
  try {
    const raw = storage.getItem(key)
    lastStored = raw
    if (raw) {
      const parsed = JSON.parse(raw) as Cache
      if (
        !Array.isArray(parsed.rows) ||
        !parsed.rows.every(validKontak) ||
        parsed.rows.length > BATAS_RIWAYAT ||
        !Array.isArray(parsed.pending) ||
        !parsed.pending.every(
          (o) => typeof o.id === 'string' && (validKontak(o.row) || (!o.row && typeof o.target === 'string')),
        )
      )
        throw Error('invalid')
      cache = { rows: parsed.rows.map(kontakBersih), pending: parsed.pending }
    }
  } catch {
    state.warning = 'Riwayat lokal tidak dapat dibaca. Data lama dipertahankan; pemulihan diperlukan sebelum menyimpan.'
  }
  const blocked = !!state.warning
  function emit() {
    if (!active) return
    state = {
      ...state,
      rows: [...cache.rows].sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    }
    listeners.forEach((f) => f(state))
  }
  function persist() {
    if (blocked || conflict) throw Error(state.warning)
    let current: string | null | undefined
    try {
      current = storage.getItem(key)
    } catch {
      /* Tetap beri peringatan saat penyimpanan gagal di bawah. */
    }
    if (current !== undefined && current !== lastStored) {
      conflict = true
      state.warning =
        'Riwayat berubah di tab lain. Muat ulang halaman sebelum menyimpan agar perubahan tab lain tidak tertimpa.'
      emit()
      throw Error(state.warning)
    }
    try {
      const text = JSON.stringify(cache)
      storage.setItem(key, text)
      lastStored = text
    } catch {
      state.warning = 'Penyimpanan perangkat penuh atau diblokir. Perubahan saat ini hanya ada selama halaman terbuka.'
    }
    emit()
  }
  function queue(target: string, row?: Kontak) {
    cache.pending = cache.pending.filter((op) => op.target !== target)
    cache.pending.push({
      id: crypto.randomUUID(),
      target,
      ...(row ? { row } : {}),
    })
  }
  async function sync() {
    if (!active || !backend || blocked || conflict) return
    if (running) return running
    state.status = 'menyinkron'
    emit()
    running = (async () => {
      try {
        while (active && cache.pending.length) {
          const op = cache.pending[0]
          if (op.row) await backend.save(op.row)
          else await backend.remove(op.target)
          if (!active) return
          cache.pending = cache.pending.filter((o) => o.id !== op.id)
          persist()
        }
        if (!active) return
        const rows = await backend.list()
        if (!active) return
        if (!rows.every(validKontak)) throw Error('Format riwayat akun tidak valid.')
        // Mutasi baru selama pembacaan tidak boleh ditimpa respons lama.
        const merged = new Map(rows.map((r) => [r.target, kontakBersih(r)]))
        for (const op of cache.pending) {
          if (op.row) merged.set(op.target, op.row)
          else merged.delete(op.target)
        }
        cache.rows = [...merged.values()]
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
          .slice(0, BATAS_RIWAYAT)
        state.status = cache.pending.length ? 'tertunda' : 'tersinkron'
        persist()
      } catch {
        if (active) {
          state.status = 'tertunda'
          emit()
        }
      } finally {
        running = null
      }
    })()
    await running
  }
  emit()
  return {
    snapshot: () => state,
    subscribe(f: (v: ChatSnapshot) => void) {
      listeners.add(f)
      f(state)
      return () => {
        listeners.delete(f)
      }
    },
    async save(row: Kontak) {
      if (!active || blocked || conflict)
        throw Error(blocked || conflict ? state.warning : 'Akun berubah; buka kembali halaman.')
      if (!validKontak(row)) throw Error('Kontak tidak valid.')
      if (!cache.rows.some((r) => r.target === row.target) && cache.rows.length >= BATAS_RIWAYAT)
        throw Error('Riwayat penuh (100 nomor). Hapus nomor lama terlebih dahulu.')
      const clean = kontakBersih(row)
      cache.rows = [clean, ...cache.rows.filter((r) => r.target !== clean.target)]
      if (backend) queue(clean.target, clean)
      persist()
      await sync()
    },
    async remove(target: string) {
      if (!active || blocked || conflict)
        throw Error(blocked || conflict ? state.warning : 'Akun berubah; buka kembali halaman.')
      cache.rows = cache.rows.filter((r) => r.target !== target)
      if (backend) queue(target)
      persist()
      await sync()
    },
    sync,
    dispose() {
      active = false
      listeners.clear()
    },
  }
}
