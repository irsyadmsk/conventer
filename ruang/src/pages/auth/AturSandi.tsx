import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { pesanGalat } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout } from './AuthLayout'

export default function AturSandi() {
  const { gantiSandi, user, memuat: memuatAuth } = useAuth()
  const nav = useNavigate()
  const toast = useToast()
  const [sandi, setSandi] = useState('')
  const [ulang, setUlang] = useState('')
  const [memuat, setMemuat] = useState(false)
  const [galat, setGalat] = useState<string | null>(null)

  async function kirim(e: FormEvent) {
    e.preventDefault()
    setGalat(null)
    if (sandi.length < 8) return setGalat('Kata sandi minimal 8 karakter.')
    if (sandi !== ulang) return setGalat('Kedua kata sandi tidak sama.')
    setMemuat(true)
    try {
      await gantiSandi(sandi)
      toast('Kata sandi diperbarui')
      nav('/', { replace: true })
    } catch (err) {
      setGalat(pesanGalat(err))
    } finally {
      setMemuat(false)
    }
  }

  return (
    <AuthLayout judul="Buat kata sandi baru" sub={!memuatAuth && !user ? 'Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru dari halaman lupa sandi.' : 'Gunakan kata sandi yang kuat dan belum pernah dipakai.'}>
      {user && (
        <form onSubmit={kirim} className="flex flex-col gap-4" noValidate>
          <Input label="Kata sandi baru" type="password" autoComplete="new-password" value={sandi} onChange={(e) => setSandi(e.target.value)} />
          <Input label="Ulangi kata sandi" type="password" autoComplete="new-password" value={ulang} onChange={(e) => setUlang(e.target.value)} />
          {galat && (
            <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
              {galat}
            </p>
          )}
          <Button type="submit" varian="primary" ukuran="lg" penuh memuat={memuat} ikon={<KeyRound />}>
            Simpan kata sandi
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
