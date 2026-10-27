import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'
import { useFamily } from './family'
import { catat } from './activity'
import { pastikanAkun } from './account-scope'

export type JenisItem = 'snippet' | 'apma' | 'pipeline' | 'calc'

export type Item<C = Record<string, unknown>> = {
  id: string
  owner_id: string
  family_id: string | null
  kind: JenisItem
  tool: string
  title: string
  content: C
  pinned: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

type Opsi = { kind?: JenisItem | JenisItem[]; batas?: number }

/** Koleksi tersinkron (milik sendiri + yang dibagikan keluarga), realtime. */
export function useItems<C = Record<string, unknown>>(opsi: Opsi = {}) {
  const { user } = useAuth()
  const [items, setItems] = useState<Item<C>[]>([])
  const [memuat, setMemuat] = useState(true)
  const kinds = opsi.kind ? (Array.isArray(opsi.kind) ? opsi.kind : [opsi.kind]) : null
  const kunciKind = kinds?.join(',') ?? '*'
  const batas = opsi.batas ?? 300

  const muat = useCallback(async () => {
    if (!user) return
    let q = supabase.from('studio_items').select('*').order('pinned', { ascending: false }).order('updated_at', { ascending: false }).limit(batas)
    if (kunciKind !== '*') q = q.in('kind', kunciKind.split(','))
    const { data } = await q
    setItems((data as Item<C>[]) ?? [])
    setMemuat(false)
  }, [user, kunciKind, batas])

  useEffect(() => {
    muat()
  }, [muat])

  useEffect(() => {
    if (!user) return
    const ch = supabase
      .channel(`ruang-items-${kunciKind}-${Math.random().toString(36).slice(2, 7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_items' }, () => muat())
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [user, kunciKind, muat])

  return { items, memuat, muatUlang: muat, setItems }
}

export function useItemAksi() {
  const { keluarga } = useFamily()
  const { user } = useAuth()
  const active = useRef(true)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const guard = () => pastikanAkun(supabase.auth, user?.id, () => active.current)
  return {
    async simpan<C>(data: { kind: JenisItem; tool: string; title: string; content: C; bagikan?: boolean; tags?: string[] }) {
      await guard()
      const { data: baris, error } = await supabase
        .from('studio_items')
        .insert({
          owner_id: user!.id,
          kind: data.kind,
          tool: data.tool,
          title: data.title.slice(0, 200) || 'Tanpa judul',
          content: data.content,
          tags: data.tags ?? [],
          family_id: data.bagikan && keluarga ? keluarga.id : null,
        })
        .select()
        .single()
      if (error) throw error
      catat(data.tool, 'simpan', JSON.stringify(data.content).length)
      return baris as Item<C>
    },
    async ubah(id: string, patch: Partial<Pick<Item, 'title' | 'content' | 'pinned' | 'tags' | 'family_id'>>) {
      await guard()
      const { error } = await supabase.from('studio_items').update(patch).eq('id', id)
      if (error) throw error
    },
    async hapus(id: string) {
      await guard()
      const { error } = await supabase.from('studio_items').delete().eq('id', id)
      if (error) throw error
    },
    async bagikan(id: string, ya: boolean) {
      await guard()
      const { error } = await supabase
        .from('studio_items')
        .update({ family_id: ya && keluarga ? keluarga.id : null })
        .eq('id', id)
      if (error) throw error
    },
  }
}
