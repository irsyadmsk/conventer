import { useEffect, useRef, useState } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight, Printer, RefreshCw, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/Controls'
import { HURUF, BRAILLE, RADIO, MORSE, acakBatas, acak, braille, encode, decode, kodeHuruf, type Kode } from './core'
import { Field, Galat, Halaman, KotakGlyph, SemaphoreGlyph, TautanAlat } from './ui'

function alfabetOnly(value: string) {
  if (!/^[a-z\s]*$/i.test(value)) throw Error('Gunakan huruf A–Z dan spasi.')
  return value.toUpperCase()
}
export function Semaphore() {
  const [input, setInput] = useState('SALAM'),
    [pos, setPos] = useState(0),
    [play, setPlay] = useState(false),
    [speed, setSpeed] = useState(900),
    [quiz, setQuiz] = useState(''),
    [answer, setAnswer] = useState(''),
    [feedback, setFeedback] = useState('')
  let text = '',
    error = ''
  try {
    text = alfabetOnly(input)
  } catch (e) {
    error = (e as Error).message
  }
  const frames = [...text]
  useEffect(() => {
    if (!play) return
    const timer = setInterval(
      () =>
        setPos((p) => {
          if (p >= frames.length - 1) {
            setPlay(false)
            return p
          }
          return p + 1
        }),
      speed,
    )
    return () => clearInterval(timer)
  }, [play, frames.length, speed])
  function soal() {
    setQuiz(HURUF[acakBatas(26)])
    setAnswer('')
    setFeedback('')
  }
  return (
    <Halaman
      judul="Semaphore Studio"
      sub="Belajar membaca posisi bendera dari sudut pandang penerima. Latih huruf A–Z, putar pesan, lalu uji kemampuan Anda."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card space-y-4 p-5 sm:p-6">
          <Field id="pesan-semaphore" label="Pesan huruf A–Z">
            <textarea
              id="pesan-semaphore"
              className="field min-h-28"
              maxLength={200}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setPos(0)
                setPlay(false)
              }}
            />
          </Field>
          <Galat isi={error} />
          <div className="inset flex min-h-64 flex-col items-center justify-center p-4">
            <SemaphoreGlyph huruf={frames[pos] ?? ' '} size={200} />
            <p className="font-display text-3xl">{frames[pos] === ' ' ? 'Spasi' : frames[pos] || 'Siap'}</p>
            <p className="mt-1 text-sm text-ink-3">
              {frames.length ? `${pos + 1} / ${frames.length}` : 'Masukkan pesan'}
            </p>
          </div>
          <Field id="kecepatan-semaphore" label="Jeda tiap huruf">
            <select
              id="kecepatan-semaphore"
              className="field"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={1600}>Pelan — 1,6 detik</option>
              <option value={900}>Sedang — 0,9 detik</option>
              <option value={500}>Cepat — 0,5 detik</option>
            </select>
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              varian="outline"
              aria-label="Huruf sebelumnya"
              disabled={play || pos === 0}
              onClick={() => setPos((p) => p - 1)}
              ikon={<ChevronLeft />}
            />
            <Button
              disabled={!frames.length || !!error}
              onClick={() => {
                if (pos === frames.length - 1) setPos(0)
                setPlay((p) => !p)
              }}
              ikon={play ? <Pause /> : <Play />}
            >
              {play ? 'Jeda' : 'Putar pesan'}
            </Button>
            <Button
              varian="outline"
              aria-label="Huruf berikutnya"
              disabled={play || pos >= frames.length - 1}
              onClick={() => setPos((p) => p + 1)}
              ikon={<ChevronRight />}
            />
          </div>
          <p className="text-sm text-ink-3">
            Putaran ini untuk latihan huruf; sinyal protokol dan angka belum disertakan.{' '}
            <a
              className="underline"
              href="https://prod-cms.scouts.org.uk/media/5508/generic-resources-semaphore-signals.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Referensi Scouts
            </a>
            .
          </p>
        </section>
        <section className="card space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-xl">Tantangan membaca</h2>
          <p className="text-sm text-ink-3">Tebak huruf dari posisi benderanya.</p>
          {quiz ? (
            <>
              <div className="inset flex justify-center">
                <SemaphoreGlyph huruf={quiz} size={200} kuis />
              </div>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  setFeedback(
                    answer.toUpperCase() === quiz
                      ? 'Benar! Lanjutkan ke huruf berikutnya.'
                      : `Belum tepat. Huruf yang ditampilkan adalah ${quiz}.`,
                  )
                }}
              >
                <Field id="jawaban-semaphore" label="Jawaban Anda">
                  <input
                    id="jawaban-semaphore"
                    className="field"
                    maxLength={1}
                    autoComplete="off"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </Field>
                <Button type="submit" disabled={!answer}>
                  Periksa jawaban
                </Button>
              </form>
              <p role="status" className="text-sm font-semibold">
                {feedback}
              </p>
            </>
          ) : (
            <div className="inset grid min-h-48 place-items-center p-5 text-sm text-ink-3">
              Tekan Mulai tantangan untuk mendapat soal.
            </div>
          )}
          <Button varian="outline" onClick={soal} ikon={<RefreshCw />}>
            {quiz ? 'Soal berikutnya' : 'Mulai tantangan'}
          </Button>
        </section>
      </div>
      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-display text-xl">Kartu alfabet</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-7">
          {[...HURUF].map((c) => (
            <button
              key={c}
              className="flex flex-col items-center rounded-xl border border-line p-2 hover:bg-surface-2"
              onClick={() => {
                setInput(c)
                setPos(0)
                setPlay(false)
              }}
              aria-label={`Pelajari huruf ${c}`}
            >
              <SemaphoreGlyph huruf={c} size={110} />
              <strong>{c}</strong>
            </button>
          ))}
        </div>
      </section>
      <TautanAlat />
    </Halaman>
  )
}

export function SandiPramuka() {
  const [kind, setKind] = useState<Kode>('angka'),
    [direction, setDirection] = useState('encode'),
    [input, setInput] = useState('SALAM PRAMUKA')
  let output = '',
    error = ''
  try {
    output = direction === 'encode' ? encode(input, kind) : decode(input, kind)
  } catch (e) {
    error = (e as Error).message
  }
  return (
    <Halaman
      judul="Sandi Pramuka"
      sub="Ubah pesan dengan sandi angka, koordinat, rumput, dan kotak. Setiap varian menampilkan kunci agar pengirim dan penerima memakai aturan yang sama."
    >
      <section className="card space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="jenis-sandi" label="Jenis sandi">
            <select
              id="jenis-sandi"
              className="field"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as Kode)
                setInput('')
                setDirection('encode')
              }}
            >
              <option value="angka">Angka — A=1 sampai Z=26</option>
              <option value="koordinat">Koordinat — Polybius 5×5</option>
              <option value="rumput">Rumput — Morse pendek/panjang</option>
              <option value="kotak">Kotak 1 — pasangan AB hingga YZ</option>
            </select>
          </Field>
          <Field id="arah-sandi" label="Arah konversi">
            <select
              id="arah-sandi"
              className="field"
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value)
                setInput(output)
              }}
            >
              <option value="encode">Teks → sandi</option>
              <option value="decode">Sandi → teks</option>
            </select>
          </Field>
        </div>
        <Field id="input-sandi-pramuka" label={direction === 'encode' ? 'Teks A–Z' : 'Kode sandi'}>
          <textarea
            id="input-sandi-pramuka"
            className="field min-h-32"
            maxLength={4000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Field>
        <Galat isi={error} />
        <p className="text-sm text-ink-3">
          Pisahkan kode tiap huruf dengan spasi dan kata dengan /.{' '}
          {kind === 'koordinat'
            ? 'I dan J memakai sel yang sama; hasil pembacaan selalu I.'
            : kind === 'rumput'
              ? '▁ = titik Morse, ▇ = garis Morse.'
              : kind === 'kotak'
                ? 'K1–K9 = sel kisi dari kiri atas; X1–X4 = bagian atas, kanan, bawah, kiri kisi silang. Titik • menandai huruf kedua.'
                : ''}
        </p>
        <div className="inset min-h-24 p-5">
          <p className="eyebrow mb-2">Hasil</p>
          <output className="block whitespace-pre-wrap break-words font-mono text-lg">{output || '—'}</output>
          {kind === 'kotak' && direction === 'encode' && !error && (
            <div className="mt-4 flex flex-wrap gap-3" aria-label="Simbol sandi kotak">
              {[...input.toUpperCase()].map((c, i) =>
                HURUF.includes(c) ? <KotakGlyph key={i} huruf={c} /> : <span key={i} className="w-3" />,
              )}
            </div>
          )}
        </div>
        <CopyButton teks={output} tool="sandi-pramuka" />
      </section>
      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-display text-xl">Kunci sandi</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {[...HURUF].map((c) => (
            <div
              key={c}
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-line p-2"
            >
              <strong>{c}</strong>
              {kind === 'kotak' && <KotakGlyph huruf={c} />}
              <span className="break-all text-center font-mono text-sm">{kodeHuruf(c, kind)}</span>
            </div>
          ))}
        </div>
      </section>
      <TautanAlat />
    </Halaman>
  )
}

export function BrailleLab() {
  const [input, setInput] = useState('salam'),
    [balik, setBalik] = useState(false),
    [bits, setBits] = useState(0)
  let output = '',
    error = ''
  try {
    output = braille(input, balik)
  } catch (e) {
    error = (e as Error).message
  }
  const selected = String.fromCodePoint(0x2800 + bits),
    letter = Object.entries(BRAILLE).find(([, v]) => v === selected)?.[0]
  return (
    <Halaman
      judul="Braille Lab"
      sub="Kenali huruf dasar A–Z melalui sel enam titik. Lab ini tidak membedakan huruf kapital, serta belum mencakup angka, tanda baca, kontraksi, dan kaidah bahasa lengkap."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card space-y-4 p-5 sm:p-6">
          <Field id="arah-braille" label="Arah konversi">
            <select
              className="field"
              id="arah-braille"
              value={balik ? 'balik' : 'maju'}
              onChange={(e) => {
                setBalik(e.target.value === 'balik')
                setInput(output)
              }}
            >
              <option value="maju">Huruf → pola Braille</option>
              <option value="balik">Pola Braille → huruf kecil</option>
            </select>
          </Field>
          <Field id="input-braille" label={balik ? 'Pola Braille' : 'Teks huruf dasar'}>
            <textarea
              id="input-braille"
              className="field min-h-32"
              maxLength={1000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </Field>
          <Galat isi={error} />
          <output
            className={`inset block min-h-32 whitespace-pre-wrap break-words p-5 ${balik ? 'text-xl' : 'text-4xl leading-relaxed'}`}
          >
            {output || '—'}
          </output>
          <CopyButton teks={output} tool="braille" />
          <p className="text-sm text-ink-3">
            Tampilan layar membantu pengenalan visual; bukan keluaran timbul untuk dibaca dengan perabaan.{' '}
            <a href="https://iceb.org/publications/ueb/" target="_blank" rel="noreferrer" className="underline">
              Rujukan alfabet dasar UEB
            </a>
            .
          </p>
        </section>
        <section className="card space-y-4 p-5 sm:p-6">
          <h2 className="font-display text-xl">Papan enam titik</h2>
          <p className="text-sm text-ink-3">Dilihat dari sisi pembaca: kiri 1–2–3, kanan 4–5–6.</p>
          <div className="mx-auto grid max-w-48 grid-cols-2 gap-3">
            {[1, 4, 2, 5, 3, 6].map((n) => (
              <button
                key={n}
                className={`grid size-16 place-items-center rounded-full border-2 text-lg font-bold ${bits & (1 << (n - 1)) ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface-2'}`}
                aria-label={`Titik ${n}`}
                aria-pressed={!!(bits & (1 << (n - 1)))}
                onClick={() => setBits((b) => b ^ (1 << (n - 1)))}
              >
                {n}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="text-center text-lg">
            {letter ? `Huruf ${letter}` : bits === 0 ? 'Sel kosong' : 'Bukan huruf dasar A–Z'}{' '}
            <span className="ml-3 text-4xl">{selected}</span>
          </p>
          <div className="flex justify-center gap-2">
            <Button varian="outline" onClick={() => setBits(0)}>
              Kosongkan
            </Button>
            <Button disabled={!letter} onClick={() => setInput((p) => p + (balik ? selected : letter!.toLowerCase()))}>
              Tambahkan
            </Button>
          </div>
        </section>
      </div>
      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-display text-xl">Alfabet dasar</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-9">
          {Object.entries(BRAILLE).map(([c, b]) => (
            <button
              key={c}
              className="rounded-xl border border-line p-3 text-center hover:bg-surface-2"
              onClick={() => setBits(b.codePointAt(0)! - 0x2800)}
              aria-label={`Pelajari Braille ${c}`}
            >
              <span className="block text-4xl">{b}</span>
              <strong>{c}</strong>
            </button>
          ))}
        </div>
      </section>
      <TautanAlat />
    </Halaman>
  )
}

export function EjaanRadio() {
  const [input, setInput] = useState('IRSYAD'),
    [audio, setAudio] = useState(false),
    [speaking, setSpeaking] = useState(false)
  const voice = useRef<SpeechSynthesisVoice | null>(null)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const update = () => {
      voice.current = speechSynthesis.getVoices().find((v) => v.localService && v.lang.startsWith('en')) ?? null
      setAudio(!!voice.current)
    }
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', update)
      speechSynthesis.cancel()
    }
  }, [])
  let text = '',
    error = ''
  try {
    text = alfabetOnly(input)
  } catch (e) {
    error = (e as Error).message
  }
  const words = [...text].map((c) => (c === ' ' ? '/' : RADIO[HURUF.indexOf(c)])),
    output = words.join(' ')
  function bicara() {
    if (!voice.current) return
    if (speaking) {
      speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const u = new SpeechSynthesisUtterance(output.replaceAll('/', ' . '))
    u.voice = voice.current
    u.rate = 0.8
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    speechSynthesis.speak(u)
    setSpeaking(true)
  }
  return (
    <Halaman
      judul="Ejaan Radio"
      sub="Eja nama atau kata dengan alfabet NATO/ICAO agar tiap huruf mudah dibedakan saat komunikasi suara."
    >
      <section className="card space-y-4 p-5 sm:p-6">
        <Field id="input-radio" label="Kata atau nama A–Z">
          <input
            id="input-radio"
            className="field"
            maxLength={200}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if ('speechSynthesis' in window) speechSynthesis.cancel()
              setSpeaking(false)
            }}
          />
        </Field>
        <Galat isi={error} />
        <output className="inset block min-h-28 p-5 text-xl leading-relaxed break-words">{output || '—'}</output>
        <div className="flex flex-wrap gap-2">
          <CopyButton teks={output} tool="ejaan-radio" />
          <Button
            varian="outline"
            disabled={!audio || !output || !!error}
            onClick={bicara}
            ikon={speaking ? <Pause /> : <Volume2 />}
          >
            {speaking ? 'Hentikan' : 'Dengarkan'}
          </Button>
        </div>
        <p className="text-sm text-ink-3">
          {audio
            ? 'Suara menggunakan mesin lokal yang tersedia di perangkat.'
            : 'Suara bahasa Inggris lokal belum tersedia di perangkat ini; kartu ejaan tetap dapat digunakan.'}{' '}
          <a
            className="underline"
            href="https://www.nato.int/nato_static_fl2014/assets/pdf/pdf_history/20161027_E1-Symbols-Phonetic_Alphabet_CJ.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Referensi NATO
          </a>
          .
        </p>
      </section>
      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-display text-xl">Kartu ejaan</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {RADIO.map((w, i) => (
            <div key={w} className="inset p-4">
              <strong className="font-display text-2xl">{HURUF[i]}</strong>
              <span className="mt-1 block text-sm">{w}</span>
            </div>
          ))}
        </div>
      </section>
      <TautanAlat />
    </Halaman>
  )
}

type Soal = { word: string; letters: string[] }
export function LembarLatihan() {
  const [title, setTitle] = useState('Latihan Kode & Isyarat'),
    [kind, setKind] = useState('morse'),
    [count, setCount] = useState(10),
    [input, setInput] = useState('SALAM\nTUNAS\nREGU\nPANDU\nBAKTI\nSIAGA\nGALANG\nTENDA\nKOMPAS\nJALAN'),
    [questions, setQuestions] = useState<Soal[]>([]),
    [answer, setAnswer] = useState(false),
    [error, setError] = useState('')
  function generate() {
    try {
      const words = input
        .split(/\r?\n/)
        .map((w) => w.trim().toUpperCase())
        .filter(Boolean)
      if (!words.length || words.length > 200 || words.some((w) => !/^[A-Z]{1,16}$/.test(w)))
        throw Error('Isi 1–200 kata, satu per baris; tiap kata 1–16 huruf A–Z.')
      if (!Number.isInteger(count) || count < 1 || count > 40) throw Error('Jumlah soal harus 1–40.')
      let bank = acak(words)
      while (bank.length < count) bank = bank.concat(acak(words))
      setQuestions(bank.slice(0, count).map((word) => ({ word, letters: [...word] })))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }
  function render(q: Soal) {
    if (kind === 'semaphore')
      return (
        <div className="flex flex-wrap">
          {q.letters.map((c, i) => (
            <SemaphoreGlyph key={i} huruf={c} size={90} />
          ))}
        </div>
      )
    if (kind === 'braille') return <span className="text-3xl">{braille(q.word)}</span>
    if (kind === 'radio') return q.letters.map((c) => RADIO[HURUF.indexOf(c)]).join(' · ')
    if (kind === 'morse')
      return <span className="font-mono text-xl">{q.letters.map((c) => MORSE[HURUF.indexOf(c)]).join(' ')}</span>
    return encode(q.word, kind as Kode)
  }
  return (
    <Halaman
      judul="Pembuat Lembar Latihan"
      sub="Siapkan soal membaca kode beserta kunci jawaban. Buat lembar kegiatan untuk kelas atau Pramuka, lalu cetak atau simpan sebagai PDF lewat browser."
    >
      <section className="card space-y-4 p-5 sm:p-6 no-print">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="judul-latihan" label="Judul lembar">
            <input
              id="judul-latihan"
              className="field"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field id="jenis-latihan" label="Materi">
            <select
              id="jenis-latihan"
              className="field"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value)
                setQuestions([])
              }}
            >
              {[
                ['morse', 'Morse'],
                ['semaphore', 'Semaphore A–Z'],
                ['braille', 'Braille huruf dasar'],
                ['radio', 'Ejaan radio'],
                ['angka', 'Sandi angka'],
                ['koordinat', 'Koordinat I/J'],
                ['rumput', 'Sandi rumput'],
              ].map(([v, n]) => (
                <option value={v} key={v}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="kata-latihan" label="Bank kata — satu kata per baris">
          <textarea
            id="kata-latihan"
            className="field min-h-32"
            maxLength={4000}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setQuestions([])
            }}
          />
        </Field>
        <Field id="jumlah-soal" label="Jumlah soal (1–40)">
          <input
            id="jumlah-soal"
            className="field max-w-40"
            type="number"
            min="1"
            max="40"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </Field>
        <Galat isi={error} />
        <label className="flex items-center gap-3 text-sm">
          <input className="size-4" type="checkbox" checked={answer} onChange={(e) => setAnswer(e.target.checked)} />
          Sertakan halaman kunci jawaban saat dicetak
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} ikon={<RefreshCw />}>
            Buat soal
          </Button>
          <Button varian="outline" disabled={!questions.length} onClick={() => window.print()} ikon={<Printer />}>
            Cetak / simpan PDF
          </Button>
        </div>
      </section>
      <section className="worksheet card space-y-5 p-5 sm:p-8">
        <h2 className="font-display text-2xl">{title || 'Lembar latihan'}</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          {['Nama', 'Kelas/Regu', 'Tanggal'].map((label) => (
            <div key={label} className="flex items-end gap-2">
              <span>{label}:</span>
              <span className="min-w-0 flex-1 border-b border-line">&nbsp;</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-ink-2">
          Tuliskan kata yang diwakili kode berikut.
          {kind === 'semaphore' ? ' Posisi bendera dilihat dari penerima.' : ''}
          {kind === 'koordinat' ? ' Gunakan kisi Polybius 5×5; I dan J digabung.' : ''}
        </p>
        {!questions.length ? (
          <p className="inset p-6 text-sm text-ink-3">Buat soal terlebih dahulu untuk melihat pratinjau.</p>
        ) : (
          <ol className="space-y-5">
            {questions.map((q, i) => (
              <li className="worksheet-question border-b border-line pb-4" key={i}>
                <strong>{i + 1}.</strong>
                <div className="my-2 break-words">{render(q)}</div>
                <div className="flex items-end gap-2 text-sm">
                  <span>Jawaban:</span>
                  <span className="min-w-0 flex-1 border-b border-line">&nbsp;</span>
                </div>
              </li>
            ))}
          </ol>
        )}
        {answer && questions.length > 0 && (
          <div className="worksheet-answers space-y-4 border-t border-line pt-6">
            <h3 className="font-display text-xl">Kunci jawaban — {title}</h3>
            <ol className="list-inside list-decimal space-y-2">
              {questions.map((q, i) => (
                <li key={i}>{kind === 'koordinat' ? q.word.replaceAll('J', 'I') : q.word}</li>
              ))}
            </ol>
          </div>
        )}
      </section>
      <div className="no-print">
        <TautanAlat />
      </div>
    </Halaman>
  )
}
