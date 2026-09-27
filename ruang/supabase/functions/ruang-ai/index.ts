import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Gerbang AI untuk Ruang (app.irsyads.com).
 *
 * Kunci penyedia tidak pernah sampai ke peramban. Memakai secret yang sama
 * dengan `ai-bantu`: GEMINI_API_KEY (tingkat gratis, dicoba dulu) dan
 * AI_API_KEY (DeepSeek, cadangan berbayar). Urutan mengikuti
 * private_config.ai_urutan; batas biaya bulanan ai_batas_bulanan_usd hanya
 * berlaku untuk penyedia berbayar.
 *
 * Tugas apma_* hanya untuk admin (public.admins) atau pengguna berizin
 * (studio_izin_fitur status 'disetujui'). Tugas lain untuk semua akun yang
 * masuk, dengan kuota harian RUANG_KUOTA_HARIAN
 * (bawaan 30 permintaan). Teks tidak disimpan — hanya angka pemakaian di
 * ai_usage dengan task berawalan "ruang_".
 *
 * TUGAS:
 *   status      — kesiapan & sisa kuota
 *   apma_modul  — modul ajar lengkap dari prompt yang disusun klien (+ foto buku opsional)
 *   apma_blok   — satu blok tambahan (LKPD, asesmen, rubrik, dst.)
 *   apma_audit  — audit kualitas modul (JSON)
 *   laporan     — narasi laporan pemakaian dari angka ringkasan
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TUGAS = ["status", "apma_modul", "apma_blok", "apma_audit", "laporan"] as const;
type Tugas = (typeof TUGAS)[number];

const potong = (t: unknown, n = 8000) => String(t ?? "").slice(0, n);

type Penyedia = { id: "gemini" | "deepseek"; gratis: boolean; kunci: string; baseUrl: string; model: string; batasMs: number; gambar: boolean };

function penyedia(): Record<Penyedia["id"], Penyedia> {
  return {
    gemini: {
      id: "gemini",
      gratis: true,
      kunci: Deno.env.get("GEMINI_API_KEY") ?? "",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: Deno.env.get("GEMINI_MODEL") ?? "gemini-flash-latest",
      batasMs: 140_000,
      gambar: true,
    },
    deepseek: {
      id: "deepseek",
      gratis: false,
      kunci: Deno.env.get("AI_API_KEY") ?? "",
      baseUrl: (Deno.env.get("AI_BASE_URL") ?? "https://api.deepseek.com").replace(/\/+$/, ""),
      model: Deno.env.get("AI_MODEL") ?? "deepseek-flash",
      batasMs: 140_000,
      gambar: false,
    },
  };
}

const harga = (n: string, d: number) => Number(Deno.env.get(n) ?? d);

function bacaJson(teks: string): Record<string, unknown> | null {
  const bersih = teks.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  for (const c of [bersih, bersih.slice(bersih.indexOf("{"), bersih.lastIndexOf("}") + 1)]) {
    try {
      const j = JSON.parse(c);
      if (j && typeof j === "object") return j;
    } catch { /* lanjut */ }
  }
  return null;
}

const SISTEM_APMA =
  "Anda Ahli Kurikulum Kemendikdasmen dan guru berpengalaman. Tulis dalam bahasa Indonesia baku yang jelas dan operasional. Gunakan nomenklatur terbaru: Murid (bukan peserta didik), KKTP, Kokurikuler, Dimensi Profil Lulusan, Kesiapan Belajar Murid, Karakteristik Murid. Jangan mengarang kutipan, tautan, atau referensi yang tidak dapat diverifikasi — bila menyarankan media/tautan, sebutkan kata kunci pencariannya.";

const SISTEM_LAPORAN =
  "Anda analis produktivitas yang ramah untuk aplikasi Ruang (alat teks, aksara Sunda, kalkulator, modul ajar). Tulis dalam bahasa Indonesia yang hangat dan ringkas. Anda hanya menerima ANGKA ringkasan, bukan isi teks pengguna — jangan menebak isinya. Struktur Markdown: '### Sorotan' (2–3 poin), '### Pola' (1 paragraf pendek tentang jam/hari/alat), '### Saran minggu depan' (2–3 poin konkret memakai fitur Ruang: Otomatisasi, Koleksi, Keluarga, Kalkulator, Modul Ajar). Maksimal 180 kata. Jangan pakai emoji berlebihan.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const balas = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS } });
  if (req.method !== "POST") return balas(405, { error: "Metode tidak didukung." });

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return balas(401, { error: "Silakan masuk terlebih dahulu." });
  const layanan = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: masuk, error: gm } = await layanan.auth.getUser(jwt);
  if (gm || !masuk.user) return balas(401, { error: "Sesi tidak valid. Masuk ulang." });
  const user = masuk.user;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return balas(400, { error: "Isi permintaan tidak valid." });
  }
  const tugas = body.tugas as Tugas;
  if (!TUGAS.includes(tugas)) return balas(400, { error: "Tugas AI tidak dikenal." });

  // Modul Ajar adalah fitur privat: hanya admin dan pengguna yang disetujui admin.
  if (tugas.startsWith("apma_")) {
    const [{ data: admin }, { data: izin }] = await Promise.all([
      layanan.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
      layanan.from("studio_izin_fitur").select("status").eq("user_id", user.id).eq("fitur", "apma").maybeSingle(),
    ]);
    if (!admin && izin?.status !== "disetujui") {
      return balas(403, { error: "Modul Ajar adalah fitur privat. Ajukan akses dan tunggu persetujuan admin." });
    }
  }

  // Kuota harian per akun (zona WIB).
  const kuota = Number(Deno.env.get("RUANG_KUOTA_HARIAN") ?? 30) || 30;
  const wib = new Date(Date.now() + 7 * 3600_000);
  const awalHari = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()) - 7 * 3600_000);
  const awalBulan = new Date();
  awalBulan.setUTCDate(1);
  awalBulan.setUTCHours(0, 0, 0, 0);
  const [{ count: dipakaiHariIni }, { data: biayaBulan }, { data: konfig }] = await Promise.all([
    layanan.from("ai_usage").select("id", { count: "exact", head: true }).eq("user_id", user.id).like("task", "ruang_%").gte("created_at", awalHari.toISOString()),
    layanan.from("ai_usage").select("cost_usd").gte("created_at", awalBulan.toISOString()),
    layanan.from("private_config").select("key,value").in("key", ["ai_batas_bulanan_usd", "ai_urutan"]),
  ]);
  const nilai = (k: string) => (konfig ?? []).find((r) => r.key === k)?.value;
  const terpakaiUsd = (biayaBulan ?? []).reduce((a, b) => a + Number(b.cost_usd || 0), 0);
  const batasUsd = Number(nilai("ai_batas_bulanan_usd") ?? 5) || 5;
  const urutan = String(nilai("ai_urutan") ?? "gemini_dulu");
  const semua = penyedia();
  const urut: Penyedia["id"][] = urutan === "deepseek_saja" ? ["deepseek"] : urutan === "gemini_saja" ? ["gemini"] : ["gemini", "deepseek"];
  const siap = urut.map((id) => semua[id]).filter((p) => p.kunci);
  const sisa = Math.max(0, kuota - (dipakaiHariIni ?? 0));

  if (tugas === "status") return balas(200, { siap: siap.length > 0, sisa_hari_ini: sisa, kuota, model: siap[0]?.model ?? null });
  if (!siap.length) return balas(503, { error: "Layanan AI belum dikonfigurasi (secret GEMINI_API_KEY / AI_API_KEY)." });
  if (sisa <= 0) return balas(429, { error: `Kuota AI harian (${kuota} permintaan) sudah habis. Coba lagi besok.` });

  // ---- Susun pesan per tugas ----
  type Bagian = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
  const pesan: { role: string; content: string | Bagian[] }[] = [];
  let maksToken = 2500;
  let suhu = 0.6;
  let modeJson = false;
  let adaGambar = false;

  if (tugas === "apma_modul") {
    const prompt = potong(body.prompt, 90_000).trim();
    if (prompt.length < 200) return balas(400, { error: "Data modul belum lengkap." });
    const g = body.gambar as { mimeType?: string; data?: string } | undefined;
    pesan.push({ role: "system", content: SISTEM_APMA });
    if (g?.data && /^image\/(png|jpeg|webp)$/.test(g.mimeType ?? "") && g.data.length < 7_000_000) {
      adaGambar = true;
      pesan.push({ role: "user", content: [{ type: "image_url", image_url: { url: `data:${g.mimeType};base64,${g.data}` } }, { type: "text", text: prompt }] });
    } else pesan.push({ role: "user", content: prompt });
    maksToken = 16000;
    suhu = 0.55;
  } else if (tugas === "apma_blok") {
    const f = (body.konteks ?? {}) as Record<string, unknown>;
    const jenis = potong(body.jenis, 120);
    pesan.push({ role: "system", content: SISTEM_APMA });
    pesan.push({
      role: "user",
      content: `Hasilkan bagian modul ajar "${jenis}" (kategori ${potong(body.kategori, 40) || "Lampiran"}).

Konteks:
- Mata pelajaran: ${potong(f.mapel, 120) || "-"}
- Jenjang/Fase/Kelas: ${potong(f.jenjang, 40)} / ${potong(f.fase, 20)} / ${potong(f.kelas, 20)}
- Materi pokok: ${potong(f.materi, 300) || "-"}
- Model: ${potong(f.model, 120) || "-"}
- Tujuan/ringkasan modul saat ini:
${potong(body.ringkasan, 6000)}

Instruksi tambahan guru: ${potong(body.instruksi, 1500) || "(tidak ada)"}

Tulis langsung isinya dalam Markdown (boleh tabel), tanpa pengantar/penutup, tanpa placeholder.`,
    });
    maksToken = 6000;
  } else if (tugas === "apma_audit") {
    const blok = (Array.isArray(body.blocks) ? body.blocks : []) as { title?: string; category?: string; content?: string }[];
    const teks = blok.map((b) => `### ${potong(b.title, 200)} (${potong(b.category, 40)})\n${potong(b.content, 6000)}`).join("\n\n").slice(0, 60_000);
    pesan.push({ role: "system", content: "Anda auditor profesional kualitas Modul Ajar Kurikulum Merdeka. Jawab HANYA JSON valid sesuai skema, tanpa teks lain." });
    pesan.push({
      role: "user",
      content: `Evaluasi modul ajar mapel "${potong(body.mapel, 120)}":\n---\n${teks}\n---\nBalas JSON dengan skema:
{"score":0-100,"checklist":{"cp":bool,"tp":bool,"kktp":bool,"asesmenAwal":bool,"formatif":bool,"sumatif":bool,"lkpd":bool,"rubrik":bool,"daftarPustaka":bool},
"scores":{"administrasi":0-100,"regulasi":0-100,"pembelajaran":0-100,"asesmen":0-100,"bahasa":0-100,"desain":0-100},
"warnings":[{"type":"regulasi|konsistensi|bahasa|kelengkapan","message":"..."}],
"recommendations":["..."],"kelebihan":["..."]}
Nilai jujur dan spesifik; "regulasi" untuk istilah lama (peserta didik, IKTP, P5, Profil Pelajar Pancasila, kompetensi awal).`,
    });
    maksToken = 3000;
    suhu = 0.2;
    modeJson = true;
  } else if (tugas === "laporan") {
    pesan.push({ role: "system", content: SISTEM_LAPORAN });
    pesan.push({
      role: "user",
      content: `Periode: ${potong(body.periode, 80)} · Cakupan: ${potong(body.cakupan, 20)}
Ringkasan (JSON): ${potong(JSON.stringify(body.ringkasan ?? {}), 8000)}
Periode sebelumnya (JSON, boleh kosong): ${potong(JSON.stringify(body.pembanding ?? null), 4000)}
Catatan kode alat: aksara=Pangalihtulis Sunda, kamus=Kamus Sunda, morse, codec, sandi=Sandi klasik, hash, kalkulator, gaya=Gaya teks, teks=Analisis & teleprompter, qr, apma=Modul ajar, otomatisasi, koleksi, ai=Asisten AI.`,
    });
    maksToken = 900;
    suhu = 0.5;
  }

  const calon = siap.filter((p) => p.gratis || terpakaiUsd < batasUsd).filter((p) => !adaGambar || p.gambar || siap.length === 1);
  if (!calon.length) return balas(429, { error: `Batas biaya AI bulan ini ($${batasUsd}) tercapai.` });

  const mulai = Date.now();
  type Pesan = { role: string; content: string | Bagian[] };

  /** Satu panggilan ke penyedia; mencatat pemakaian; tidak pernah melempar. */
  async function panggil(p: Penyedia, messages: Pesan[]) {
    const isi: Record<string, unknown> = {
      model: p.model,
      messages: p.gambar ? messages : messages.map((m) => (Array.isArray(m.content) ? { ...m, content: m.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("\n") } : m)),
      temperature: suhu,
      stream: false,
    };
    if (modeJson) isi.response_format = { type: "json_object" };
    if (p.id === "deepseek") {
      isi.max_tokens = Math.min(maksToken, 8000);
      isi.thinking = { type: "disabled" };
    } else {
      isi.max_tokens = maksToken + 2048;
      isi.reasoning_effort = "low";
    }

    let res: Response;
    try {
      res = await fetch(`${p.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.kunci}` },
        body: JSON.stringify(isi),
        signal: AbortSignal.timeout(p.batasMs),
      });
    } catch (e) {
      return { galat: `${p.id}: tidak menjawab (${e instanceof Error ? e.message : "waktu habis"})`, konten: "", terpotong: false };
    }
    const hasil = await res.json().catch(() => null);
    const pakai = hasil?.usage ?? {};
    const cache = Number(pakai.prompt_cache_hit_tokens ?? pakai.prompt_tokens_details?.cached_tokens ?? 0);
    const masukTok = Number(pakai.prompt_tokens ?? 0);
    const keluarTok = Number(pakai.completion_tokens ?? 0);
    const biaya = p.gratis ? 0 : ((masukTok - cache) * harga("AI_HARGA_INPUT", 0.3) + cache * harga("AI_HARGA_INPUT_CACHE", 0.006) + keluarTok * harga("AI_HARGA_OUTPUT", 1.2)) / 1_000_000;
    const konten = String(hasil?.choices?.[0]?.message?.content ?? "");

    let galat: string | null = null;
    if (!res.ok) galat = `${p.id}: ${(Array.isArray(hasil) ? hasil[0] : hasil)?.error?.message ?? `HTTP ${res.status}`}`;
    else if (!konten.trim()) galat = `${p.id}: jawaban kosong`;
    // Alasan kegagalan ke log fungsi (tanpa kunci) supaya bisa ditelusuri.
    if (galat) console.warn(`[ruang-ai] ${tugas} gagal di ${p.id} (${p.model}): ${galat.slice(0, 300)}`);

    await layanan.from("ai_usage").insert({
      user_id: user.id,
      task: `ruang_${tugas}`,
      provider: p.id,
      model: p.model,
      input_tokens: masukTok,
      cached_input_tokens: cache,
      output_tokens: keluarTok,
      cost_usd: biaya,
      ok: !galat,
    });
    return { galat, konten, terpotong: hasil?.choices?.[0]?.finish_reason === "length" };
  }

  const gagal: string[] = [];
  for (const p of calon) {
    const r = await panggil(p, pesan);
    if (r.galat) {
      gagal.push(r.galat);
      continue;
    }

    if (modeJson) {
      const json = bacaJson(r.konten);
      if (!json) {
        gagal.push(`${p.id}: JSON tidak terbaca`);
        continue;
      }
      return balas(200, { json, model: p.model, provider: p.id, sisa_hari_ini: sisa - 1 });
    }

    // Jawaban panjang (modul lengkap) bisa melewati batas token keluaran
    // penyedia. Minta lanjutan tepat dari titik terpotong, maksimal 3 kali,
    // selama masih jauh dari batas waktu Edge Function.
    let teks = r.konten;
    let terpotong = r.terpotong;
    for (let lanjut = 0; terpotong && lanjut < 3 && Date.now() - mulai < 95_000; lanjut++) {
      const s = await panggil(p, [
        ...pesan,
        { role: "assistant", content: teks },
        { role: "user", content: "Jawaban Anda terpotong. Lanjutkan TEPAT dari karakter terakhir di atas — jangan mengulang bagian yang sudah ada, jangan menambah pengantar. Selesaikan sampai blok terakhir dan penanda penutupnya." },
      ]);
      if (s.galat) break;
      teks += s.konten;
      terpotong = s.terpotong;
    }

    return balas(200, {
      teks: teks.trim(),
      model: p.model,
      provider: p.id,
      terpotong,
      sisa_hari_ini: sisa - 1,
    });
  }
  return balas(502, { error: `AI belum berhasil menjawab — ${gagal.join("; ")}. Coba lagi.` });
});
