import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { pesanGalat } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { AuthLayout } from './AuthLayout'

export default function LupaSandi() {
  const { lupaSandi } = useAuth()
  const [email, setEmail] = useState('')
  const [memuat, setMemuat] = useState(false)
  const [galat, setGalat] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function kirim(e: FormEvent) {
    e.preventDefault()
    setGalat(null)
    if (!email.includes('@')) return setGalat('Masukkan alamat email yang valid.')
    setMemuat(true)
    try {
      await lupaSandi(email)
      setOk(true)
    } catch (err) {
      setGalat(pesanGalat(err))
    } finally {
      setMemuat(false)
    }
  }

  return (
    <AuthLayout
      judul="Atur ulang kata sandi"
      sub={ok ? 'Jika email terdaftar, tautan pengaturan ulang sudah dikirim. Cek kotak masuk Anda.' : 'Kami akan mengirim tautan untuk membuat kata sandi baru.'}
      kaki={
        <Link to="/masuk" className="font-bold text-accent-text hover:underline">
          ← Kembali ke halaman masuk
        </Link>
      }
    >
      {!ok && (
        <form onSubmit={kirim} className="flex flex-col gap-4" noValidate>
          <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} ikon={<Mail />} placeholder="nama@contoh.com" />
          {galat && (
            <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
              {galat}
            </p>
          )}
          <Button type="submit" varian="primary" ukuran="lg" penuh memuat={memuat} ikon={<Send />}>
            Kirim tautan
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
