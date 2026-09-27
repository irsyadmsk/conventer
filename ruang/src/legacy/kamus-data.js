/**
 * Kamus Kosakata Bahasa Sunda & Aksara Sunda Baku
 * Disediakan untuk conventer.irsyads.com
 * Dikembangkan oleh Muhammad Irsyad Sirojul Khoeir, S.Sos., M.Sos., C.PS.
 */



  const KAMUS_DATA = [
    // Salam & Sapaan
    { sunda: 'Sampurasun', aksara: '\u1B9E\u1B99\u1BAA\u1B95\u1BA5\u1B9B\u1B9E\u1BA5\u1B94\u1BAA', arti: 'Salam khas Sunda (Permisi / Maaf)', kategori: 'salam' },
    { sunda: 'Rampés', aksara: '\u1B9B\u1B99\u1BAA\u1B95\u1BA6\u1B9E\u1BAA', arti: 'Jawaban atas salam sampurasun', kategori: 'salam' },
    { sunda: 'Wilujeng sumping', aksara: '\u1B9D\u1BA4\u1B9C\u1BA5\u1B8F\u1BA8\u1B80 \u1B9E\u1BA5\u1B99\u1BAA\u1B95\u1BA4\u1B80', arti: 'Selamat datang', kategori: 'salam' },
    { sunda: 'Wilujeng enjing', aksara: '\u1B9D\u1BA4\u1B9C\u1BA5\u1B8F\u1BA8\u1B80 \u1B88\u1B94\u1BAA\u1B8F\u1BA4\u1B80', arti: 'Selamat pagi', kategori: 'salam' },
    { sunda: 'Wilujeng siang', aksara: '\u1B9D\u1BA4\u1B9C\u1BA5\u1B8F\u1BA8\u1B80 \u1B9E\u1BA4\u1B83\u1B80', arti: 'Selamat siang', kategori: 'salam' },
    { sunda: 'Wilujeng sonten', aksara: '\u1B9D\u1BA4\u1B9C\u1BA5\u1B8F\u1BA8\u1B80 \u1B9E\u1BA7\u1B94\u1BAA\u1B92\u1BA8\u1B94\u1BAA', arti: 'Selamat sore', kategori: 'salam' },
    { sunda: 'Wilujeng wengi', aksara: '\u1B9D\u1BA4\u1B9C\u1BA5\u1B8F\u1BA8\u1B80 \u1B9D\u1BA8\u1B8D\u1BA4', arti: 'Selamat malam', kategori: 'salam' },
    { sunda: 'Hatur nuhun', aksara: '\u1BA0\u1B92\u1BA5\u1B81 \u1B94\u1BA5\u1BA0\u1BA5\u1B94\u1BAA', arti: 'Terima kasih', kategori: 'salam' },
    { sunda: 'Sami-sami', aksara: '\u1B9E\u1B99\u1BA4-\u1B9E\u1B99\u1BA4', arti: 'Sama-sama', kategori: 'salam' },
    { sunda: 'Punten', aksara: '\u1B95\u1BA5\u1B94\u1BAA\u1B92\u1BA8\u1B94\u1BAA', arti: 'Permisi / maaf', kategori: 'salam' },
    { sunda: 'Mangga', aksara: '\u1B99\u1B80\u1B8C', arti: 'Silakan', kategori: 'salam' },
    { sunda: 'Kumaha damang', aksara: '\u1B8A\u1BA5\u1B99\u1BA0 \u1B93\u1B99\u1B80', arti: 'Bagaimana kabarnya? / Apa kabar?', kategori: 'salam' },
    { sunda: 'Damang', aksara: '\u1B93\u1B99\u1B80', arti: 'Sehat / baik', kategori: 'salam' },
    { sunda: 'Pileuleuyan', aksara: '\u1B95\u1BA4\u1B9C\u1BA9\u1B9C\u1BA9\u1B9A\u1B94\u1BAA', arti: 'Selamat tinggal / perpisahan', kategori: 'salam' },

    // Kata Ganti (Pronomina)
    { sunda: 'Abdi', aksara: '\u1B83\u1B98\u1BAA\u1B93\u1BA4', arti: 'Saya (bahasa halus)', kategori: 'ganti' },
    { sunda: 'Kuring', aksara: '\u1B8A\u1BA5\u1B9B\u1BA4\u1B80', arti: 'Saya / aku (bahasa akrab/loma)', kategori: 'ganti' },
    { sunda: 'Simkuring', aksara: '\u1B9E\u1BA4\u1B99\u1BAA\u1B8A\u1BA5\u1B9B\u1BA4\u1B80', arti: 'Kami / saya pribadi', kategori: 'ganti' },
    { sunda: 'Anjeun', aksara: '\u1B83\u1B94\u1BAA\u1B8F\u1BA9\u1B94\u1BAA', arti: 'Anda / kamu (halus)', kategori: 'ganti' },
    { sunda: 'Manéh', aksara: '\u1B99\u1B94\u1BA6\u1B82', arti: 'Kamu (akrab)', kategori: 'ganti' },
    { sunda: 'Urang', aksara: '\u1B85\u1B9B\u1B80', arti: 'Kita / orang', kategori: 'ganti' },
    { sunda: 'Maranéhna', aksara: '\u1B99\u1B9B\u1B94\u1BA6\u1B82\u1B94', arti: 'Mereka', kategori: 'ganti' },

    // Angka (Wilangan)
    { sunda: 'Hiji', aksara: '\u1BA0\u1BA4\u1B8F\u1BA4', arti: 'Satu (|᮱|)', kategori: 'angka' },
    { sunda: 'Dua', aksara: '\u1B93\u1BA5\u1B83', arti: 'Dua (|᮲|)', kategori: 'angka' },
    { sunda: 'Tilu', aksara: '\u1B92\u1BA4\u1B9C\u1BA5', arti: 'Tiga (|᮳|)', kategori: 'angka' },
    { sunda: 'Opat', aksara: '\u1B87\u1B95\u1B92\u1BAA', arti: 'Empat (|᮴|)', kategori: 'angka' },
    { sunda: 'Lima', aksara: '\u1B9C\u1BA4\u1B99', arti: 'Lima (|᮵|)', kategori: 'angka' },
    { sunda: 'Genep', aksara: '\u1B8C\u1BA8\u1B94\u1BA8\u1B95\u1BAA', arti: 'Enam (|᮶|)', kategori: 'angka' },
    { sunda: 'Tujuh', aksara: '\u1B92\u1BA5\u1B8F\u1BA5\u1B82', arti: 'Tujuh (|᮷|)', kategori: 'angka' },
    { sunda: 'Dalapan', aksara: '\u1B93\u1B9C\u1B95\u1B94\u1BAA', arti: 'Delapan (|᮸|)', kategori: 'angka' },
    { sunda: 'Salapan', aksara: '\u1B9E\u1B9C\u1B95\u1B94\u1BAA', arti: 'Sembilan (|᮹|)', kategori: 'angka' },
    { sunda: 'Sapuluh', aksara: '\u1B9E\u1B95\u1BA5\u1B9C\u1BA5\u1B82', arti: 'Sepuluh (|᮱᮰|)', kategori: 'angka' },
    { sunda: 'Salawé', aksara: '\u1B9E\u1B9C\u1B9D\u1BA6', arti: 'Dua puluh lima (25 khas Sunda)', kategori: 'angka' },
    { sunda: 'Saratus', aksara: '\u1B9E\u1B9B\u1B92\u1BA5\u1B9E\u1BAA', arti: 'Seratus (|᮱᮰᮰|)', kategori: 'angka' },
    { sunda: 'Sarébu', aksara: '\u1B9E\u1B9B\u1BA6\u1B98\u1BA5', arti: 'Seribu (|᮱᮰᮰᮰|)', kategori: 'angka' },

    // Warna
    { sunda: 'Bodas', aksara: '\u1B98\u1BA7\u1B93\u1B9E\u1BAA', arti: 'Putih', kategori: 'warna' },
    { sunda: 'Beureum', aksara: '\u1B98\u1BA9\u1B9B\u1BA9\u1B99\u1BAA', arti: 'Merah', kategori: 'warna' },
    { sunda: 'Hideung', aksara: '\u1BA0\u1BA4\u1B93\u1BA9\u1B80', arti: 'Hitam', kategori: 'warna' },
    { sunda: 'Héjo', aksara: '\u1BA0\u1BA6\u1B8F\u1BA7', arti: 'Hijau', kategori: 'warna' },
    { sunda: 'Konéng', aksara: '\u1B8A\u1BA7\u1B94\u1BA6\u1B80', arti: 'Kuning', kategori: 'warna' },
    { sunda: 'Bulao', aksara: '\u1B98\u1BA5\u1B9C\u1B87', arti: 'Biru', kategori: 'warna' },
    { sunda: 'Coklat', aksara: '\u1B8E\u1BA7\u1B8A\u1BAA\u1B9C\u1B92\u1BAA', arti: 'Cokelat', kategori: 'warna' },

    // Sehari-hari & Kata Kerja
    { sunda: 'Dahar', aksara: '\u1B93\u1BA0\u1B81', arti: 'Makan (loma)', kategori: 'kegiatan' },
    { sunda: 'Tuang', aksara: '\u1B92\u1BA5\u1B83\u1B80', arti: 'Makan (halus)', kategori: 'kegiatan' },
    { sunda: 'Nginum', aksara: '\u1B8D\u1BA4\u1B94\u1BA5\u1B99\u1BAA', arti: 'Minum', kategori: 'kegiatan' },
    { sunda: 'Sarê', aksara: '\u1B9E\u1B9B\u1BA6', arti: 'Tidur', kategori: 'kegiatan' },
    { sunda: 'Mondok', aksara: '\u1B99\u1BA7\u1B94\u1BAA\u1B93\u1BA7\u1B8A\u1BAA', arti: 'Tidur / bermalam (halus)', kategori: 'kegiatan' },
    { sunda: 'Indit', aksara: '\u1B84\u1B94\u1BAA\u1B93\u1BA4\u1B92\u1BAA', arti: 'Pergi', kategori: 'kegiatan' },
    { sunda: 'Mios', aksara: '\u1B99\u1BA4\u1B87\u1B9E\u1BAA', arti: 'Pergi / berangkat (halus)', kategori: 'kegiatan' },
    { sunda: 'Balik', aksara: '\u1B98\u1B9C\u1BA4\u1B8A\u1BAA', arti: 'Pulang', kategori: 'kegiatan' },
    { sunda: 'Mulih', aksara: '\u1B99\u1BA5\u1B9C\u1BA4\u1B82', arti: 'Pulang (halus)', kategori: 'kegiatan' },
    { sunda: 'Leumpang', aksara: '\u1B9C\u1BA9\u1B99\u1BAA\u1B95\u1B80', arti: 'Berjalan', kategori: 'kegiatan' },
    { sunda: 'Calik', aksara: '\u1B8E\u1B9C\u1BA4\u1B8A\u1BAA', arti: 'Duduk (halus)', kategori: 'kegiatan' },
    { sunda: 'Cicing', aksara: '\u1B8E\u1BA4\u1B8E\u1BA4\u1B80', arti: 'Diam / tinggal', kategori: 'kegiatan' },
    { sunda: 'Gawé', aksara: '\u1B8C\u1B9D\u1BA6', arti: 'Kerja / bekerja', kategori: 'kegiatan' },
    { sunda: 'Diajar', aksara: '\u1B93\u1BA4\u1B83\u1B8F\u1B81', arti: 'Belajar', kategori: 'kegiatan' },
    { sunda: 'Maca', aksara: '\u1B99\u1B8E', arti: 'Membaca', kategori: 'kegiatan' },
    { sunda: 'Nulis', aksara: '\u1B94\u1BA5\u1B9C\u1BA4\u1B9E\u1BAA', arti: 'Menulis', kategori: 'kegiatan' },

    // Kata Benda & Alam
    { sunda: 'Imah', aksara: '\u1B84\u1B99\u1B82', arti: 'Rumah', kategori: 'benda' },
    { sunda: 'Bumi', aksara: '\u1B98\u1BA5\u1B99\u1BA4', arti: 'Rumah (halus) / bumi', kategori: 'benda' },
    { sunda: 'Cai', aksara: '\u1B8E\u1B84', arti: 'Air', kategori: 'benda' },
    { sunda: 'Sangu', aksara: '\u1B9E\u1B8D\u1BA5', arti: 'Nasi', kategori: 'benda' },
    { sunda: 'Kueh', aksara: '\u1B8A\u1BA5\u1BA6\u1B82', arti: 'Kue', kategori: 'benda' },
    { sunda: 'Duit', aksara: '\u1B93\u1BA5\u1B84\u1B92\u1BAA', arti: 'Uang', kategori: 'benda' },
    { sunda: 'Artos', aksara: '\u1B83\u1B81\u1B92\u1BA7\u1B9E\u1BAA', arti: 'Uang (halus)', kategori: 'benda' },
    { sunda: 'Gunung', aksara: '\u1B8C\u1BA5\u1B94\u1BA5\u1B80', arti: 'Gunung', kategori: 'benda' },
    { sunda: 'Walungan', aksara: '\u1B9D\u1B9C\u1BA5\u1B8D\u1B94\u1BAA', arti: 'Sungai', kategori: 'benda' },
    { sunda: 'Laut', aksara: '\u1B9C\u1B83\u1B85\u1B92\u1BAA', arti: 'Laut', kategori: 'benda' },
    { panon: 'Panon', sunda: 'Panon', aksara: '\u1B95\u1B94\u1BA7\u1B94\u1BAA', arti: 'Mata', kategori: 'benda' },
    { sunda: 'Panonpoé', aksara: '\u1B95\u1B94\u1BA7\u1B94\u1BAA\u1B95\u1BA7\u1BA6', arti: 'Matahari', kategori: 'benda' },
    { sunda: 'Bulan', aksara: '\u1B98\u1BA5\u1B9C\u1B94\u1BAA', arti: 'Bulan', kategori: 'benda' },
    { sunda: 'Béntang', aksara: '\u1B98\u1BA6\u1B94\u1BAA\u1B92\u1B80', arti: 'Bintang', kategori: 'benda' },

    // Sifat & Karakter
    { sunda: 'Kasép', aksara: '\u1B8A\u1B9E\u1BA6\u1B95\u1BAA', arti: 'Tampan / ganteng', kategori: 'sifat' },
    { sunda: 'Geulis', aksara: '\u1B8C\u1BA9\u1B9C\u1BA4\u1B9E\u1BAA', arti: 'Cantik', kategori: 'sifat' },
    { sunda: 'Bagéur', aksara: '\u1B98\u1B8C\u1BA9\u1B81', arti: 'Baik budi / penurut', kategori: 'sifat' },
    { sunda: 'Pinter', aksara: '\u1B95\u1BA4\u1B94\u1BAA\u1B92\u1BA8\u1B81', arti: 'Pintar / cerdas', kategori: 'sifat' },
    { sunda: 'Saé', aksara: '\u1B9E\u1B83\u1BA6', arti: 'Bagus / baik', kategori: 'sifat' },
    { sunda: 'Goréng', aksara: '\u1B8C\u1BA7\u1B9B\u1BA6\u1B80', arti: 'Jelek / buruk', kategori: 'sifat' },
    { sunda: 'Beunghar', aksara: '\u1B98\u1BA9\u1B8D\u1BA0\u1B81', arti: 'Kaya', kategori: 'sifat' },
    { sunda: 'Miskin', aksara: '\u1B99\u1BA4\u1B9E\u1BAA\u1B8A\u1BA4\u1B94\u1BAA', arti: 'Miskin', kategori: 'sifat' },
    { sunda: 'Gede', aksara: '\u1B8C\u1BA8\u1B93\u1BA6', arti: 'Besar', kategori: 'sifat' },
    { sunda: 'Leutik', aksara: '\u1B9C\u1BA9\u1B92\u1BA4\u1B8A\u1BAA', arti: 'Kecil', kategori: 'sifat' },
    { sunda: 'Panjang', aksara: '\u1B95\u1B94\u1BAA\u1B8F\u1B80', arti: 'Panjang', kategori: 'sifat' },
    { sunda: 'Pondok', aksara: '\u1B95\u1BA7\u1B94\u1BAA\u1B93\u1BA7\u1B8A\u1BAA', arti: 'Pendek', kategori: 'sifat' },
    { sunda: 'Bungah', aksara: '\u1B98\u1BA5\u1B8D\u1BA0\u1B82', arti: 'Gembira / senang', kategori: 'sifat' },
    { sunda: 'Sedih', aksara: '\u1B9E\u1BA8\u1B93\u1BA4\u1B82', arti: 'Sedih', kategori: 'sifat' },
    { sunda: 'Nyaah', aksara: '\u1B91\u1B83\u1B82', arti: 'Sayang / cinta', kategori: 'sifat' },

    // Falsafah & Pepatah Luhur Sunda
    { sunda: 'Silih asih, silih asah, silih asuh', aksara: '\u1B9E\u1BA4\u1B9C\u1BA4\u1B82 \u1B83\u1B9E\u1BA4\u1B82, \u1B9E\u1BA4\u1B9C\u1BA4\u1B82 \u1B83\u1B9E\u1BA0, \u1B9E\u1BA4\u1B9C\u1BA4\u1B82 \u1B83\u1B9E\u1BA5\u1B82', arti: 'Saling mengasihi, saling mengasah pengetahuan, saling membimbing/mengayomi', kategori: 'falsafah' },
    { sunda: 'Gemah ripah repeh rapih', aksara: '\u1B8C\u1BA8\u1B99\u1B82 \u1B9B\u1BA4\u1B95\u1B82 \u1B9B\u1BA8\u1B95\u1BA6\u1B82 \u1B9B\u1B95\u1BA4\u1B82', arti: 'Makmur berlimpah, damai sentosa, tertib dan rukun', kategori: 'falsafah' },
    { sunda: 'Hade tata, hade basa', aksara: '\u1BA0\u1B93\u1BA6 \u1B92\u1B92, \u1BA0\u1B93\u1BA6 \u1B98\u1B9E', arti: 'Baik tingkah laku dan sopan tutur bahasanya', kategori: 'falsafah' },
    { sunda: 'Kuring nyaah ka anjeun', aksara: '\u1B8A\u1BA5\u1B9B\u1BA4\u1B80 \u1B91\u1B83\u1B82 \u1B8A \u1B83\u1B94\u1BAA\u1B8F\u1BA9\u1B94\u1BAA', arti: 'Aku sayang kepadamu', kategori: 'falsafah' }
  ];

  const KamusModule = {
    getAll: () => KAMUS_DATA,
    search: (query, kategori = 'all') => {
      let q = (query || '').trim().toLowerCase();
      return KAMUS_DATA.filter(item => {
        const matchesCat = (kategori === 'all' || item.kategori === kategori);
        if (!matchesCat) return false;
        if (!q) return true;
        return item.sunda.toLowerCase().includes(q) ||
               item.arti.toLowerCase().includes(q) ||
               item.aksara.includes(q);
      });
    }
  };

  export default KamusModule;
