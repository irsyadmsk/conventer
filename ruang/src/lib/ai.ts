import { lessonDraft, lessonBlock, inspectLesson, type LessonForm } from '@/features/apma/lesson-template'

export type TugasAI = 'apma_modul' | 'apma_blok' | 'apma_audit' | 'laporan' | 'tulis' | 'status'

export type HasilAI = {
  teks?: string
  json?: Record<string, unknown>
  model?: string
  provider?: string
  sisa_hari_ini?: number
  terpotong?: boolean
}

/**
 * LessonCraft uses local templates and structural checks. Cloud tasks stay
 * paused while their free allowance and billing cannot be verified.
 */
export async function panggilAI(tugas: TugasAI, isi: Record<string, unknown> = {}): Promise<HasilAI> {
  const form = (isi.konteks ?? {}) as LessonForm;
  if (tugas === 'apma_modul') return { teks: lessonDraft(form), provider: 'local', model: 'template' };
  if (tugas === 'apma_blok') return { teks: lessonBlock(String(isi.jenis ?? 'Bagian modul'), form, String(isi.instruksi ?? '')), provider: 'local', model: 'template' };
  if (tugas === 'apma_audit') return { json: inspectLesson((isi.blocks ?? []) as {title?:string;content?:string}[]), provider: 'local', model: 'structure-check' };
  if (tugas === 'status') return { provider: 'local', model: 'template', sisa_hari_ini: 0 };
  throw new Error('Cloud AI is paused until its free allowance and billing are verified. LessonCraft local templates remain available.');
}
