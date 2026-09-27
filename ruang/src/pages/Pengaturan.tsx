import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Download, KeyRound, LogOut, Monitor, Moon, Settings, Sun } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { PALET, usePrefs } from '@/lib/prefs'
import { supabase, pesanGalat } from '@/lib/supabase'
import { cn, unduh } from '@/lib/utils'
import { bunyi } from '@/lib/sound'
import { PageHeader, Panel } from '@/components/ui/Layout'
import { Avatar, Segmented, Switch } from '@/components/ui/Controls'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

export default function Pengaturan() {
  const { user, profil, namaTampil, perbaruiNama, gantiSandi, keluar } = useAuth()
  const { prefs, set } = usePrefs()
  const toast = useToast()
  const [nama, setNama] = useState(namaTampil)
  const [sandi, setSandi] = useState('')
  const [memuat, setMemuat] = useState<string | null>(null)

  async function jalan(k: string, fn: () => Promise<unknown>, ok: string) {
    setMemuat(k)
    try {
      await fn()
      toast(ok)
    } catch (e) {
      toast('Gagal', { nada: 'galat', isi: pesanGalat(e) })
    } finally {
      setMemuat(null)
    }
  }

  async function eksporData() {
    const [items, prefsRow, act] = await Promise.all([
      supabase.from('studio_items').select('*').eq('owner_id', user!.id),
      supabase.from('studio_preferences').select('*').eq('user_id', user!.id).maybeSingle(),
      supabase.from('studio_activity').select('tool, action, chars, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5000),
    ])
    unduh(
      `data-ruang-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ akun: { email: user?.email, nama: namaTampil }, koleksi: items.data, preferensi: prefsRow.data, aktivitas: act.data }, null, 2),
      'application/json',
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Akun" judul="Pengaturan" deskripsi="Semua preferensi tersimpan di akun dan ikut ke perangkat lain." ikon={<Settings />} />

      <div className="flex flex-col gap-4">
        <Panel judul="Profil">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar nama={namaTampil} url={profil?.avatar_url} ukuran={64} />
            <Input className="flex-1" label="Nama tampilan" value={nama} onChange={(e) => setNama(e.target.value)} bantuan={user?.email ?? undefined} />
            <Button varian="primary" memuat={memuat === 'nama'} disabled={nama.trim() === namaTampil || nama.trim().length < 2} onClick={() => jalan('nama', () => perbaruiNama(nama), 'Nama diperbarui')}>
              Simpan
            </Button>
          </div>
        </Panel>

        <Panel judul="Tampilan">
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-sm font-semibold">Tema</p>
              <Segmented
                label="Tema"
                nilai={prefs.theme}
                onChange={(v) => set({ theme: v })}
                pilihan={[
                  { id: 'system', label: 'Ikuti sistem', ikon: <Monitor /> },
                  { id: 'light', label: 'Terang', ikon: <Sun /> },
                  { id: 'dark', label: 'Gelap', ikon: <Moon /> },
                ]}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Palet aksen</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Palet aksen">
                {PALET.map((p) => {
                  const aktif = prefs.palette === p.id
                  return (
                    <motion.button
                      key={p.id}
                      role="radio"
                      aria-checked={aktif}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        bunyi('toggle')
                        set({ palette: p.id })
                      }}
                      className={cn('flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors', aktif ? 'border-ink bg-surface' : 'border-line hover:border-line-2')}
                    >
                      <span className="grid size-5 place-items-center rounded-full" style={{ background: p.warna }}>
                        {aktif && <Check className="size-3 text-white" />}
                      </span>
                      {p.nama}
                    </motion.button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Animasi</p>
              <Segmented
                label="Animasi"
                nilai={prefs.motion}
                onChange={(v) => set({ motion: v })}
                pilihan={[
                  { id: 'system', label: 'Ikuti sistem' },
                  { id: 'full', label: 'Penuh' },
                  { id: 'reduce', label: 'Dikurangi' },
                ]}
              />
            </div>
          </div>
        </Panel>

        <Panel judul="Perilaku">
          <div className="flex flex-col gap-4">
            <Switch checked={prefs.sound} onChange={(v) => set({ sound: v })} label="Suara & getar sentuhan" keterangan="Bunyi klik halus dan getar ringan (ponsel) saat menekan tombol." />
            <Switch checked={prefs.autoSave} onChange={(v) => set({ autoSave: v })} label="Simpan otomatis ke Koleksi" keterangan="Setiap hasil yang disalin langsung tersimpan." />
            <Switch checked={prefs.weeklyAi} onChange={(v) => set({ weeklyAi: v })} label="Ringkasan AI untuk laporan mingguan" keterangan="Hanya angka ringkasan yang dikirim ke AI, bukan isi teks." />
          </div>
        </Panel>

        <Panel judul="Keamanan">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input className="flex-1" label="Kata sandi baru" type="password" autoComplete="new-password" value={sandi} onChange={(e) => setSandi(e.target.value)} bantuan="Minimal 8 karakter." />
            <Button
              varian="outline"
              ikon={<KeyRound />}
              memuat={memuat === 'sandi'}
              disabled={sandi.length < 8}
              onClick={() =>
                jalan(
                  'sandi',
                  async () => {
                    await gantiSandi(sandi)
                    setSandi('')
                  },
                  'Kata sandi diganti',
                )
              }
            >
              Ganti sandi
            </Button>
          </div>
        </Panel>

        <Panel judul="Data & akun">
          <div className="flex flex-wrap gap-2">
            <Button varian="outline" ikon={<Download />} memuat={memuat === 'ekspor'} onClick={() => jalan('ekspor', eksporData, 'Data diunduh')}>
              Unduh semua data saya
            </Button>
            <Button varian="danger" ikon={<LogOut />} onClick={() => keluar()}>
              Keluar
            </Button>
          </div>
          <p className="mt-3 text-xs text-ink-3">Untuk menghapus akun sepenuhnya, hubungi pengelola melalui irsyads.com/contact — akun ini juga dipakai di irsyads.com.</p>
        </Panel>
        <p className="text-center text-xs text-ink-3 tabular">
          Versi {new Date(__VERSI_BUILD__).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>
    </div>
  )
}
