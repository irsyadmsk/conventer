import { Link, useLocation } from 'react-router-dom'
import { pintuId } from '@/lib/sso'
import { AuthLayout } from './AuthLayout'

export default function LupaSandi() {
  const { state } = useLocation()
  return <AuthLayout judul="Pulihkan akun melalui Irsyads ID" sub="Satu tempat untuk pemulihan akun pribadi dan pendidikan." kaki={<Link to="/masuk" state={state} className="font-bold text-accent-text hover:underline">Kembali masuk</Link>}>
    <p className="mb-5 text-sm leading-relaxed text-ink-2">Tujuan Toolkit Anda tetap tersimpan. Tautan pemulihan lama dari email tetap dapat dibuka.</p>
    <a href={pintuId((state as { dari?: string } | null)?.dari, 'pemulihan')} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-4 py-3 font-semibold text-accent-ink">Pulihkan melalui Irsyads ID</a>
  </AuthLayout>
}
