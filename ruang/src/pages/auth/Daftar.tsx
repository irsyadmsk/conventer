import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MailCheck, Mail, User, UserPlus } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { pesanGalat } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { cn } from '@/lib/utils'
import { AuthLayout, GoogleButton, Pemisah } from './AuthLayout'

function kekuatan(s: string) {
  let n = 0
  if (s.length >= 8) n++
  if (s.length >= 12) n++
  if (/[A-Z]/.test(s) && /[a-z]/.test(s)) n++
  if (/\d/.test(s)) n++
  if (/[^A-Za-z0-9]/.test(s)) n++
  return Math.min(n, 4)
}

export default function Daftar() {
  const { daftar, masukGoogle } = useAuth()
  const nav = useNavigate()
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [sandi, setSandi] = useState('')
  const [memuat, setMemuat] = useState(false)
  const [galat, setGalat] = useState<string | null>(null)
  const [terkirim, setTerkirim] = useState(false)
  const skor = useMemo(() => kekuatan(sandi), [sandi])

  async function kirim(e: FormEvent) {
    e.preventDefault()
    setGalat(null)
    if (nama.trim().length < 2) return setGalat('Nama minimal 2 huruf.')
    if (!email.includes('@')) return setGalat('Masukkan alamat email yang valid.')
    if (sandi.length < 8) return setGalat('Kata sandi minimal 8 karakter.')
    setMemuat(true)
    try {
      const { perluKonfirmasi } = await daftar(nama, email, sandi)
      if (perluKonfirmasi) setTerkirim(true)
    } catch (err) {
      setGalat(pesanGalat(err))
    } finally {
      setMemuat(false)
    }
  }

  if (terkirim)
    return (
      <AuthLayout judul="Cek email Anda" sub={<>Tautan konfirmasi dikirim ke <strong>{email}</strong>. Buka tautannya untuk mengaktifkan akun.</>}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="mx-auto grid size-20 place-items-center rounded-3xl bg-success-soft text-success"
        >
          <MailCheck className="size-9" aria-hidden />
        </motion.div>
        <p className="mt-6 text-center text-sm text-ink-3">Tidak menerima email? Periksa folder spam, atau daftar ulang beberapa menit lagi.</p>
        <Button varian="outline" ukuran="lg" penuh className="mt-6" onClick={() => nav('/masuk')}>
          Kembali ke halaman masuk
        </Button>
      </AuthLayout>
    )

  const labelSkor = ['Terlalu lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][skor]

  return (
    <AuthLayout
      judul="Buat akun Ruang"
      sub="Gratis. Satu akun untuk Ruang dan irsyads.com."
      kaki={
        <>
          Sudah punya akun?{' '}
          <Link to="/masuk" className="font-bold text-accent-text hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <GoogleButton
        onClick={async () => {
          try {
            await masukGoogle()
          } catch (err) {
            setGalat(pesanGalat(err).includes('provider is not enabled') ? 'Daftar dengan Google belum diaktifkan. Gunakan email.' : pesanGalat(err))
          }
        }}
      />
      <Pemisah />
      <form onSubmit={kirim} className="flex flex-col gap-4" noValidate>
        <Input label="Nama lengkap" autoComplete="name" value={nama} onChange={(e) => setNama(e.target.value)} ikon={<User />} placeholder="Nama Anda" required />
        <Input label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} ikon={<Mail />} placeholder="nama@contoh.com" required />
        <div>
          <Input label="Kata sandi" type="password" autoComplete="new-password" value={sandi} onChange={(e) => setSandi(e.target.value)} bantuan="Minimal 8 karakter. Campur huruf besar, angka & simbol." required />
          {sandi && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    className={cn('h-1.5 flex-1 rounded-full', i < skor ? (skor <= 1 ? 'bg-danger' : skor === 2 ? 'bg-warning' : 'bg-success') : 'bg-line')}
                    animate={{ scaleY: i < skor ? 1 : 0.7 }}
                  />
                ))}
              </div>
              <span className="w-24 text-right text-xs font-semibold text-ink-3">{labelSkor}</span>
            </div>
          )}
        </div>
        {galat && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
            {galat}
          </p>
        )}
        <Button type="submit" varian="primary" ukuran="lg" penuh memuat={memuat} ikon={<UserPlus />}>
          Daftar
        </Button>
        <p className="text-center text-xs text-ink-3">Dengan mendaftar, Anda menyetujui penggunaan data sesuai kebijakan privasi irsyads.com.</p>
      </form>
    </AuthLayout>
  )
}
