/** Legacy device drafts are preserved, never assigned to an arbitrary signed-in account. */
export function kunciDrafAkun(base: string, userId: string | null | undefined): string {
  if (!userId) throw new Error('Masuk untuk membuka draf akun.')
  return `${base}:akun:${encodeURIComponent(userId)}`
}

export async function pastikanAkun(auth: { getSession: () => Promise<{ data: { session: { user: { id: string } } | null }; error: unknown }> }, expected: string | undefined, active: () => boolean) {
  if (!expected || !active()) throw new Error('Akun berubah. Buka kembali halaman ini.')
  const { data, error } = await auth.getSession()
  if (error || data.session?.user.id !== expected || !active()) throw new Error('Akun berubah. Buka kembali halaman ini.')
}
