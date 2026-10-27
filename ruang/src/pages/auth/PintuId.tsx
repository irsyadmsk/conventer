import { Link, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { pintuId } from '@/lib/sso'
import { AuthLayout } from './AuthLayout'

export default function PintuId({ mode = 'masuk' }: { mode?: 'masuk' | 'daftar' }) {
  const loc = useLocation()
  const state = loc.state as { dari?: string } | null
  const daftar = mode === 'daftar'
  return <AuthLayout
    judul={daftar ? 'Buat akun Irsyads' : 'Masuk ke Irsyads Toolkit'}
    sub="Satu akun untuk Toolkit, LessonCraft, Academy dan layanan Irsyads."
    kaki={<Link to={daftar ? '/masuk' : '/daftar'} state={state} className="font-bold text-accent-text hover:underline">{daftar ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}</Link>}
  >
    <p className="mb-5 text-sm leading-relaxed text-ink-2">Lanjutkan melalui Irsyads ID. Setelah selesai, Anda kembali ke halaman Toolkit yang ingin dibuka.</p>
    <a href={pintuId(state?.dari, mode)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-ink hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
      <LogIn className="size-5" aria-hidden />{daftar ? 'Daftar melalui Irsyads ID' : 'Masuk melalui Irsyads ID'}
    </a>
    <p className="mt-5 text-center text-sm"><Link to="/lupa-sandi" state={state} className="font-semibold text-accent-text hover:underline">Lupa kata sandi?</Link></p>
  </AuthLayout>
}
