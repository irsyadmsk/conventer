import { createProject, parseProject, serializeProject } from './core.js';
import type { ProjectState } from './types.ts';

// Leave headroom for browser origin quotas shared with the rest of the app.
const MAX_COLLECTION_BYTES = 2_000_000;
const bytes = (text: string) => new TextEncoder().encode(text).byteLength;

function validateState(value: unknown): ProjectState {
  const state = value as ProjectState | null;
  if (!state || state.version !== 1 || typeof state.activeId !== 'string' ||
      !Array.isArray(state.projects) || !state.projects.length || state.projects.length > 20) {
    throw new Error('Struktur koleksi proyek tidak valid (maks. 20 proyek).');
  }
  const projects = state.projects.map(project => parseProject(serializeProject(project)));
  const ids = new Set(projects.map(project => project.id));
  if (ids.size !== projects.length || !ids.has(state.activeId)) {
    throw new Error('ID proyek harus unik dan proyek aktif harus tersedia.');
  }
  const result: ProjectState = { version: 1, activeId: state.activeId, projects };
  if (bytes(JSON.stringify(result)) > MAX_COLLECTION_BYTES) {
    throw new Error('Quota koleksi terlalu besar (maks. 2.000.000 byte UTF-8).');
  }
  return result;
}

export class ProjectStore {
  readonly key: string;
  private storage?: Storage;
  private locks?: LockManager;
  private snapshot: string | null = null;
  private loaded = false;
  private disposed = false;
  private blocked = false;

  constructor(owner: string, options?: { storage?: Storage; locks?: LockManager }) {
    if (typeof owner !== 'string' || !owner.trim()) throw new Error('Akun proyek tidak valid.');
    this.key = 'ruang:kreasi:v1:' + encodeURIComponent(owner);
    try {
      this.storage = options && 'storage' in options ? options.storage : globalThis.localStorage;
      this.locks = options && 'locks' in options ? options.locks : globalThis.navigator?.locks;
    } catch {
      // Access can be denied in private/sandboxed contexts; load/save fail closed.
    }
  }

  get conflicted(): boolean { return this.blocked; }

  load(): ProjectState {
    if (this.disposed) throw new Error('Project store disposed / ditutup.');
    try {
      if (!this.storage) throw new Error('Penyimpanan browser tidak tersedia.');
      const raw = this.storage.getItem(this.key);
      let state: ProjectState;
      if (raw === null) {
        const project = createProject();
        state = { version: 1, activeId: project.id, projects: [project] };
      } else {
        if (bytes(raw) > MAX_COLLECTION_BYTES) throw new Error('Quota koleksi terlalu besar.');
        state = validateState(JSON.parse(raw));
      }
      this.snapshot = raw;
      this.loaded = true;
      return state;
    } catch (error) {
      this.blocked = true;
      throw error;
    }
  }

  async save(state: ProjectState): Promise<void> {
    this.assertWritable();
    // Capture before waiting: mutable UI state must not alter a queued write.
    const text = JSON.stringify(validateState(state));
    const locks = this.locks;
    if (!locks || typeof locks.request !== 'function') {
      throw new Error('Web Locks tidak tersedia; gunakan ekspor untuk menyimpan.');
    }
    let written = false;
    await locks.request(this.key, { mode: 'exclusive' }, lock => {
      if (!lock) throw new Error('Exclusive Web Lock tidak diberikan.');
      this.assertWritable();
      const storage = this.storage!;
      if (storage.getItem(this.key) !== this.snapshot) {
        this.markConflict();
        throw new Error('Konflik / conflict: simpanan akun berubah di tab lain. Ekspor lalu muat ulang.');
      }
      storage.setItem(this.key, text);
      if (storage.getItem(this.key) !== text) {
        this.markConflict();
        throw new Error('Penyimpanan berubah setelah penulisan (conflict).');
      }
      this.snapshot = text;
      written = true;
    });
    if (!written) throw new Error('Web Lock gagal menjalankan penulisan.');
  }

  markConflict(): void { this.blocked = true; }
  dispose(): void { this.disposed = true; }

  private assertWritable(): void {
    if (this.disposed) throw new Error('Project store disposed / ditutup.');
    if (this.blocked) throw new Error('Konflik / conflict simpanan. Ekspor lalu muat ulang.');
    if (!this.loaded || !this.storage) throw new Error('Muat penyimpanan proyek sebelum menyimpan.');
  }
}
