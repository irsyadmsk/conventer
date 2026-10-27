import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ExternalLink, MessageCircle, Save, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/Controls'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { pastikanAkun } from '@/lib/account-scope'
import { createChatStore, type ChatBackend, type ChatSnapshot } from './chat-store'
import { targetChat, tautanChat, type Kontak, type Platform } from './chat-core'
import { Field, Galat, Halaman, TautanAlat } from './ui'

export default function KlikChat() {
  const { user } = useAuth()
  return <ChatForm key={user?.id ?? 'tamu'} owner={user?.id ?? null} />
}
function ChatForm({ owner }: { owner: string | null }) {
  const loc = useLocation()
  const [platform, setPlatform] = useState<Platform>('whatsapp'),
    [nomor, setNomor] = useState(''),
    [country, setCountry] = useState('62'),
    [label, setLabel] = useState(''),
    [pesan, setPesan] = useState('')
  const [simpan, setSimpan] = useState(true),
    [cari, setCari] = useState(''),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [hapus, setHapus] = useState<string | null>(null)
  const [history, setHistory] = useState<ChatSnapshot>({
    rows: [],
    status: 'lokal',
    warning: '',
  })
  const store = useRef<ReturnType<typeof createChatStore> | null>(null)
  useEffect(() => {
    let active = true
    async function guard() {
      await pastikanAkun(supabase.auth, owner ?? undefined, () => active)
    }
    const backend: ChatBackend | undefined = owner
      ? {
          async list() {
            await guard()
            const { data, error } = await supabase
              .from('studio_chat_contacts')
              .select('target,label,platform,updated_at')
              .eq('user_id', owner)
              .order('updated_at', { ascending: false })
              .limit(100)
            if (error) throw error
            await guard()
            return (data ?? []) as Kontak[]
          },
          async save(row) {
            await guard()
            const { data, error } = await supabase
              .from('studio_chat_contacts')
              .upsert({ ...row, user_id: owner }, { onConflict: 'user_id,target' })
              .select('target')
            if (error) throw error
            if (!data?.length) throw Error('Nomor belum tersimpan di akun.')
            await guard()
          },
          async remove(target) {
            await guard()
            const { error } = await supabase
              .from('studio_chat_contacts')
              .delete()
              .eq('user_id', owner)
              .eq('target', target)
            if (error) throw error
            await guard()
          },
        }
      : undefined
    const controller = createChatStore(
      owner,
      {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
      },
      backend,
    )
    store.current = controller
    const off = controller.subscribe(setHistory)
    void controller.sync()
    const retry = () => void controller.sync()
    window.addEventListener('online', retry)
    return () => {
      active = false
      off()
      controller.dispose()
      store.current = null
      window.removeEventListener('online', retry)
    }
  }, [owner])
  let target = '',
    href = '',
    validation = ''
  try {
    if (nomor.trim()) {
      target = targetChat(nomor, platform, country)
      href = tautanChat(target, platform, pesan)
    }
  } catch (e) {
    validation = (e as Error).message
  }
  async function save() {
    setError('')
    setNotice('')
    try {
      if (!target || !href) throw Error(validation || 'Masukkan nomor tujuan terlebih dahulu.')
      if (!store.current) throw Error('Riwayat sedang disiapkan.')
      await store.current.save({
        target,
        label: label.trim(),
        platform,
        updated_at: new Date().toISOString(),
      })
      setNotice('Tujuan dicatat di riwayat. Status penyimpanannya ditampilkan di bawah.')
    } catch (e) {
      setError((e as Error).message)
    }
  }
  const rows = history.rows.filter((r) =>
    (r.label + ' ' + r.target).toLocaleLowerCase('id').includes(cari.toLocaleLowerCase('id')),
  )
  const status = !owner
    ? 'Tersimpan lokal di browser ini'
    : history.status === 'tersinkron'
      ? 'Tersinkron dengan akun pribadi'
      : history.status === 'menyinkron'
        ? 'Menyinkronkan riwayat…'
        : 'Lokal — sinkronisasi akun tertunda'
  return (
    <Halaman
      judul="Klik ke Chat"
      sub="Buka percakapan tanpa menyimpan kontak ke buku telepon. Simpan nomor dan label di Toolkit agar mudah ditemukan kembali."
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <section className="card space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-2 font-semibold">
            <MessageCircle className="size-5" aria-hidden />
            Percakapan baru
          </div>
          <Field id="platform-chat" label="Buka melalui">
            <select
              className="field"
              id="platform-chat"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
            >
              <option value="whatsapp">WhatsApp / WhatsApp Business</option>
              <option value="telegram">Telegram</option>
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <Field id="kode-negara" label="Kode negara">
              <input
                className="field"
                id="kode-negara"
                inputMode="numeric"
                maxLength={4}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="62"
              />
            </Field>
            <Field id="nomor-chat" label={platform === 'telegram' ? 'Nomor atau @username' : 'Nomor WhatsApp'}>
              <input
                className="field"
                id="nomor-chat"
                type="text"
                inputMode={platform === 'telegram' ? 'text' : 'tel'}
                autoComplete="off"
                maxLength={100}
                value={nomor}
                onChange={(e) => {
                  setNomor(e.target.value)
                  setNotice('')
                }}
                placeholder={platform === 'telegram' ? '0812… atau @username' : '0812… atau +62812…'}
              />
            </Field>
          </div>
          <p className="text-sm text-ink-3">
            Awalan 0 memakai kode negara di atas. Gunakan + untuk nomor internasional negara lain.
          </p>
          <Field id="label-chat" label="Label opsional">
            <input
              className="field"
              id="label-chat"
              maxLength={120}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Toko alat tulis"
            />
          </Field>
          <Field id="pesan-chat" label="Pesan awal opsional">
            <textarea
              className="field min-h-28"
              id="pesan-chat"
              maxLength={2000}
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Halo, saya ingin bertanya…"
            />
          </Field>
          <p className="text-sm text-ink-3">
            Pesan awal tidak disimpan dalam riwayat. Anda tetap menekan Kirim di aplikasi tujuan.
          </p>
          <label className="flex items-start gap-3 text-sm">
            <input
              className="mt-1 size-4"
              type="checkbox"
              checked={simpan}
              onChange={(e) => setSimpan(e.target.checked)}
            />
            <span>Catat tujuan ke riwayat saat membuka chat.</span>
          </label>
          <Galat isi={validation || error} />
          {href && (
            <p className="rounded-xl bg-surface-2 p-3 text-sm break-all">
              Tujuan: <strong>{target}</strong>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
                onClick={() => {
                  if (simpan) void save()
                }}
              >
                <ExternalLink className="size-4" aria-hidden />
                Buka {platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
              </a>
            ) : (
              <Button disabled ikon={<ExternalLink />}>
                Buka chat
              </Button>
            )}
            <Button varian="outline" disabled={!href} ikon={<Save />} onClick={() => void save()}>
              Simpan tujuan
            </Button>
            <CopyButton teks={href} tool="klik-chat" label="Salin tautan" />
          </div>
          <div className="inset space-y-2 p-4 text-sm text-ink-2">
            <p>
              WhatsApp biasa atau Business mengikuti aplikasi yang dipilih perangkat. Situs tidak dapat menjamin
              aplikasi mana yang dibuka.
            </p>
            <p>
              Telegram melalui nomor mengikuti pengaturan privasi penerima. Gunakan @username bila nomor tidak dapat
              ditemukan.
            </p>
          </div>
          {notice && (
            <p role="status" className="text-sm text-success">
              {notice}
            </p>
          )}
        </section>
        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">Riwayat tujuan</h2>
            <span className="text-xs text-ink-3">{history.rows.length}/100</span>
          </div>
          <p role="status" className="text-sm text-ink-2">
            {status}
          </p>
          {history.warning && <Galat isi={history.warning} />}
          {!owner ? (
            <p className="inset p-3 text-sm text-ink-2">
              <Link to="/masuk" state={{ dari: loc.pathname }} className="font-semibold text-accent-text underline">
                Masuk
              </Link>{' '}
              untuk menyimpan riwayat baru ke akun lintas perangkat. Riwayat tamu tetap di browser ini, terpisah dari
              akun.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-3">
                Riwayat ini pribadi dan tidak dibagikan ke keluarga. Saat luring, perubahan menunggu sinkronisasi.
              </p>
              {history.status !== 'tersinkron' && (
                <Button
                  varian="outline"
                  ukuran="sm"
                  ikon={<RefreshCw />}
                  disabled={history.status === 'menyinkron'}
                  onClick={() => void store.current?.sync()}
                >
                  Coba sinkronkan
                </Button>
              )}
            </>
          )}
          <Field id="cari-riwayat" label="Cari label atau nomor">
            <input
              className="field"
              id="cari-riwayat"
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </Field>
          {!rows.length && (
            <div className="inset grid min-h-40 place-items-center p-5 text-center text-sm text-ink-3">
              {cari ? 'Tidak ada tujuan yang cocok.' : 'Belum ada riwayat. Simpan tujuan pertama Anda.'}
            </div>
          )}
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.target} className="rounded-xl border border-line p-4">
                <div className="flex items-start gap-3">
                  <button
                    className="min-h-11 min-w-0 flex-1 text-left"
                    onClick={() => {
                      setNomor(row.target)
                      setLabel(row.label)
                      setPlatform(row.platform)
                      setPesan('')
                      setError('')
                      setNotice('Tujuan dipilih. Periksa nomor sebelum membuka chat.')
                    }}
                  >
                    <span className="block truncate font-semibold">{row.label || row.target}</span>
                    <span className="block break-all text-sm text-ink-3">
                      {row.target} · {row.platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
                    </span>
                  </button>
                  <Button
                    varian="ghost"
                    aria-label={`Hapus ${row.label || row.target}`}
                    onClick={() => setHapus(row.target)}
                    ikon={<Trash2 />}
                  />
                </div>
                {hapus === row.target && (
                  <div className="mt-3 space-y-2 border-t border-line pt-3">
                    <p className="text-sm">
                      Hapus tujuan ini dari riwayat
                      {owner ? ' akun dan perangkat ini' : ''}?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        varian="danger"
                        ukuran="sm"
                        onClick={async () => {
                          try {
                            await store.current?.remove(row.target)
                            setHapus(null)
                          } catch (e) {
                            setError((e as Error).message)
                          }
                        }}
                      >
                        Hapus tujuan
                      </Button>
                      <Button varian="ghost" ukuran="sm" onClick={() => setHapus(null)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <TautanAlat />
    </Halaman>
  )
}
