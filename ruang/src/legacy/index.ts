// Mesin konversi warisan aplikasi lama (terbukti), dibungkus dengan tipe.
import CodecsJs from './codecs.js'
import CiphersJs from './ciphers.js'
import HashesJs from './hashes.js'
import StylishJs from './stylish.js'
import SundaJs from './sunda.js'
import KamusJs from './kamus-data.js'
import DevCaseJs from './devcase.js'
import BarcodeJs from './barcode.js'
import { MORSE_MAP as MM, REVERSE_MAP as RM, MorseStudioEngine as MSE } from './morse-engine.js'

type Codec = { encode: (t: string, opt?: string) => string; decode: (t: string) => string }

export const Codecs = CodecsJs as unknown as Record<string, Codec>

export const Ciphers = CiphersJs as unknown as {
  caesar: { encode: (t: string, s?: number) => string; decode: (t: string, s?: number) => string }
  vigenere: { encode: (t: string, k?: string) => string; decode: (t: string, k?: string) => string }
  frequency: { analyze: (t: string) => { counts: Record<string, number>; totalLetters: number } }
}

export const Hashes = HashesJs as unknown as {
  md5: (t: string) => string
  sha1: (t: string) => Promise<string>
  sha256: (t: string) => Promise<string>
  sha384: (t: string) => Promise<string>
  sha512: (t: string) => Promise<string>
  convertBase: (v: string, from: number) => { bin: string; oct: string; dec: string; hex: string } | null
}

export type GayaHasil = { category: string; title: string; text: string }
export const Stylish = StylishJs as unknown as { generateAll: (t: string, cat?: string) => GayaHasil[] }

export const Sunda = SundaJs as unknown as {
  latinToSunda: (t: string, o?: { wrapNumbers?: boolean }) => string
  sundaToLatin: (t: string) => string
  SAMPLE_PHRASES: { label: string; latin: string }[]
}

export type EntriKamus = { sunda: string; aksara: string; arti: string; kategori: string }
export const Kamus = KamusJs as unknown as {
  getAll: () => EntriKamus[]
  search: (q: string, kategori?: string) => EntriKamus[]
  getCategories?: () => string[]
}

export const DevCase = DevCaseJs as unknown as {
  CaseConverter: Record<string, (s: string) => string> & { getAllCases: (s: string) => Record<string, string> }
  TextStats: {
    analyze: (t: string) => {
      characters: number
      charactersNoSpaces: number
      words: number
      sentences: number
      paragraphs: number
      readingTimeSeconds: number
      readingTimeFormatted: string
      speakingTimeSeconds: number
      speakingTimeFormatted: string
      avgWordLength: number | string
      avgWordsPerSentence: number | string
    }
  }
}

export const Barcode = BarcodeJs as unknown as { drawBarcode128: (c: HTMLCanvasElement, t: string) => boolean }

export const MORSE_MAP = MM as Record<string, string>
export const MORSE_REVERSE = RM as Record<string, string>

export type MorseEngine = {
  frequency: number
  wpm: number
  volume: number
  soundEnabled: boolean
  flashScreenEnabled: boolean
  torchCameraEnabled: boolean
  isPlaying: boolean
  isPaused: boolean
  onSignalChange: ((on: boolean) => void) | null
  onProgress: ((tokenIdx: number, sym: string, isSignal: boolean) => void) | null
  onComplete: (() => void) | null
  onStatusChange: ((s: 'playing' | 'paused' | 'stopped') => void) | null
  encodeText: (t: string) => string
  decodeMorse: (m: string) => string
  getTelemetryData: (t: string, m?: string) => { dots: number; dashes: number; words: number; ditRatio: string; durationSec: string; unitMs: number }
  play: (m: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  playSingleChar: (c: string) => void
  manualKeyDown: () => void
  manualKeyUp: (cb: (letter: string, code: string) => void) => void
  enableTorch: () => Promise<boolean>
  disableTorch: () => Promise<void>
  attachOscilloscope: (c: HTMLCanvasElement) => void
  initAudio: () => void
}
export const MorseStudioEngine = MSE as unknown as new () => MorseEngine
