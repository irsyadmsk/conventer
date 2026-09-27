import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { pesanGalat } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { AuthLayout, GoogleButton, Pemisah } from './AuthLayout'

export default function Masuk() {
  const { masuk, masukGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [sandi, setSandi] = useState('')
  const [lihat, setLihat] = useState(false)
  const [memuat, setMemuat] = useState(false)
  const [galat, setGalat] = useState<string | null>(null)

  async function kirim(e: FormEvent) {
    e.preventDefault()
    setGalat(null)
    if (!email.includes('@')) return setGalat('Masukkan alamat email yang valid.')
    if (!sandi) return setGalat('Kata sandi belum diisi.')
    setMemuat(true)
    try {
      await masuk(email, sandi)
    } catch (err) {
      setGalat(pesanGalat(err))
    } finally {
      setMemuat(false)
    }
  }

  return (
    <AuthLayout
      judul="Selamat datang kembali"
      sub="Masuk untuk membuka ruang kerja Anda dan keluarga."
      kaki={
        <>
          Belum punya akun?{' '}
          <Link to="/daftar" className="font-bold text-accent-text hover:underline">
            Daftar gratis
          </Link>
        </>
      }
    >
      <GoogleButton
        onClick={async () => {
          try {
            await masukGoogle()
          } catch (err) {
            setGalat(pesanGalat(err).includes('provider is not enabled') ? 'Masuk dengan Google belum diaktifkan. Gunakan email.' : pesanGalat(err))
          }
        }}
      />
      <a
        href="https://id.irsyads.com/?redirect=https://app.irsyads.com/"
        className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line-2 bg-surface px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-accent hover:bg-surface-2 no-underline"
      >
        <span className="size-4 rounded bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">ID</span>
        <span>Masuk melalui Irsyads ID (SSO)</span>
      </a>
      <Pemisah />
      <form onSubmit={kirim} className="flex flex-col gap-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} ikon={<Mail />} placeholder="nama@contoh.com" required />
        <Input
          label="Kata sandi"
          type={lihat ? 'text' : 'password'}
          autoComplete="current-password"
          value={sandi}
          onChange={(e) => setSandi(e.target.value)}
          required
          kanan={
            <Link to="/lupa-sandi" className="text-[13px] font-semibold text-accent-text hover:underline">
              Lupa sandi?
            </Link>
          }
        />
        <label className="-mt-1 flex w-fit items-center gap-2 text-[13px] text-ink-2">
          <input type="checkbox" checked={lihat} onChange={(e) => setLihat(e.target.checked)} className="size-4" />
          {lihat ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          Tampilkan sandi
        </label>
        {galat && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
            {galat}
          </p>
        )}
        <Button type="submit" varian="primary" ukuran="lg" penuh memuat={memuat} ikon={<LogIn />}>
          Masuk
        </Button>
      </form>
    </AuthLayout>
  )
}
