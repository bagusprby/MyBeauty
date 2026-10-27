# Audit UI — Fase 0

Branch: `redesign-minimal`. Audit dilakukan tanpa mengubah markup, CSS, atau perilaku aplikasi. Jumlah pemakaian di bawah menghitung kemunculan pada atribut `class` dalam template sumber `public/legacy-app.js` dan shell `index.html`; satu template di dalam loop dapat menghasilkan beberapa elemen saat runtime.

## SEBELUM: lokasi markup dan styling

| Area | Lokasi | Tanggung jawab saat ini |
|---|---|---|
| Shell HTML | `index.html` | `.wrap`, `.heart-lace`, masthead, `#main`, `#nav`, `#quiet-rail`, dialog/sheet, empat file input, toast. Masih ada `<title>`, font link, dan viewport-fit meta duplikat di `<body>`, serta reset inline yang mengatur warna/font dasar sendiri. |
| State dan renderer legacy | `public/legacy-app.js` | `render()` memilih `vToday`, `vJourney`, `vAct`, `vJournal`, atau `vMe` untuk lima tab. Template HTML disusun sebagai string pada fungsi-fungsi ini dan helper render kartu. `applyCardHierarchy()` kemudian menebak hero dari class pertama yang cocok, memindah banner aktif, lalu menetapkan primary/quiet. |
| CSS utama | `src/styles/app.css` | Token tema, tipografi, layout komponen lama, banyak varian kartu, dark mode, navigasi, dan media query desktop/mobile. |
| Override saat ini | `src/styles/minimal.css` | Aturan minimalis yang menimpa beberapa dekorasi dan permukaan kartu; masih bergantung pada selector/markup lama. |
| Gaya fungsi tambahan | `src/styles/auth-screen.css`, `src/styles/sync-status.css` | Layar login/impor dan indikator sinkronisasi. |

### Inventaris class visual

Hitungan adalah jumlah titik deklarasi template, bukan jumlah item yang muncul bila markup dibuat dari `.map()`/loop.

| Class/varian | Pemakaian template | Catatan bentuk saat ini |
|---|---:|---|
| `card` | 36 | Kelas dasar paling sering; bobotnya bercampur antara form, konten, ringkasan, dan daftar. |
| `card paper` | 7 | Grid kertas / tekstur, sebagian dengan `washi`. |
| `card soft` | 3 | Latar blush tambahan. Subset dari 36 pemakaian `card`. |
| `coq-frame` | 3 | Bingkai dekoratif berscaffold. |
| `boutique-wall` | 1 | Gallery wall dan cover Muse di Beranda. |
| `notebook-card` | 1 | Reminder/notebook strip di Beranda. |
| `fxc` | 1 | Varian katalog/flow Aktivitas. |
| `mirror-card` | 2 | Slot produk/Lookbook; satu titik template dapat berulang untuk item. |
| `media-card-vis` | 2 | Kartu media visual; satu titik template dapat berulang untuk item. |
| `wardrobe-box` | 1 | Wadah Lemari/Lookbook di Diary. |
| `spa-card` | 1 | Menu Salon & Spa. |
| `cycle-banner`, `rescue-banner` | masing-masing 1 | Banner status bersyarat; dikeluarkan hanya ketika kondisinya aktif. |
| `obj-btn` | 4 | Empat pintasan Beranda dengan ilustrasi. |
| `whisper`, `nx` | masing-masing 1 | Bisikan/fakta dan kartu saran berikutnya. |
| `boutique-hdr` | 25 | Header dekoratif di banyak panel. |
| `washi` | 6 | Tape dekoratif pada formulir/kartu. |
| `scallop-oval` | 2 | Crest/scallop pada beberapa ringkasan. |
| `lace-bar` | 3 | Pemisah dekoratif. |
| `heart-lace` | 1 di shell | Deret hati di atas halaman. |
| `masthead`, `mast-brand`, `mast-crest`, `mast-title`, `mast-sub` | masing-masing 1 di shell | Crest dan brand header; tombol tema juga berada di masthead. |

Kelas `media-card` tanpa akhiran tidak ditemukan sebagai varian markup; kelas yang dipakai adalah `media-card-vis`. `scallop` dipakai sebagai bagian dari `scallop-oval`, bukan class mandiri. Ada pula komponen visual lain seperti `mini-frame`, `center-portrait`, `portrait-ribbon`, `boutique-hdr`, `jar-box`, `map`, `stamp-grid`, dan `quiet-card` yang perlu ditinjau saat fase desain tiap tab.

## Pemetaan blok layar yang diusulkan

Tier mengacu pada rancangan di prompt dan dua artboard pada PDF. Tier belum diterapkan; ini usulan audit untuk disetujui sebelum fase implementasi.

| Tab / blok yang ada | Tier usulan | Alasan / catatan |
|---|---|---|
| **Beranda** — cover Muse, hari berjalan, motto, streak, chapter, progress, tombol mulai ritual | Hero | Ringkasan hari adalah fokus halaman. Pertahankan foto Muse yang sudah ada, tetapi tampilkan tanpa bingkai/ornamen lama. |
| **Beranda** — checklist ritual yang saat ini dihasilkan di `vToday()` dari `p.q.main` dan bonus opsional | Primary | Aksi inti dan interaksi centang. Validasi “n dari 5” terhadap daftar ritual aktual diperlukan karena jumlah ritual dapat berubah oleh state/fitur yang ada. |
| **Beranda** — banner mode siklus/rescue saat aktif | Primary status | Tampil hanya bila aktif, tepat di bawah hero; banner nonaktif memang tidak dirender. |
| **Beranda** — check-in, fakta/bisikan, toples, saran berikutnya, spa, pintasan, nook, aura, catatan kulit | Quiet | Informasi dan alat pendukung. Urutan mobile mengikuti aksi utama. Check-in tetap punya kontrol aktif dan perlu mempertahankan semua handler-nya. |
| **Perjalanan** — ringkasan 30 hari / tanggal dan chapter terpilih | Hero | Mengikat peta perjalanan ke hari yang dipilih tanpa mengganti perhitungan `active()`, `prog()`, atau `phase()`. Detail tampilan ringkasan perlu disetujui. |
| **Perjalanan** — peta 30 hari per chapter, pilih hari, fokus hari terpilih, daftar kebiasaan | Primary | Navigasi dan tindakan inti tab; seleksi hari harus tetap memakai `setSel()`. Fokus hari dan daftar bisa dikelompokkan sesuai urutan visual tanpa mengubah aturan. |
| **Perjalanan** — toples bukti, teks milestone/achievement, catatan pelengkap | Quiet | Riwayat/dukungan; jangan mengulang statistik yang sama di hero dan rail. |
| **Aktivitas** — pemilih subtab Katalog, Media, Etalase Rak, Postur | Navigasi/kontrol | Empat subtab memetakan ke renderer berbeda (`vFx`, `vMedia`, `vSkin`, `vBody`); jangan diperlakukan sebagai kartu dekoratif. |
| **Aktivitas** — konten utama dari subtab terpilih | Primary | Tindakan bergantung subtab. Belum ada satu blok ringkasan yang jelas untuk dipakai sebagai hero pada semua empat subtab; jangan mengarang hero bersama. |
| **Aktivitas** — riwayat, katalog/media lain, statistik, detail pendamping | Quiet | Konten penjelas/arsip setelah aksi terpilih. Pengelompokan rinci per subtab ditandai perlu audit Fase 3. |
| **Diary** — form mood/energi, prompt harian, jurnal, syukur/keinginan | Primary | Area input inti dengan autosave (`auto()`) dan indikator `#sv`. `dayNav()` memberi konteks tanggal, bukan kartu dekoratif. |
| **Diary** — ulasan mingguan dan surat akhir hari 30 | Primary sekunder / quiet | Form masih bisa diedit, namun frekuensi lebih rendah; posisikan setelah jurnal dan jangan mencampur dengan arsip. Detail tier per status hari 30 ditinjau pada Fase 3. |
| **Diary** — toples, nook/buku, Lemari & Lookbook, foto progres, arsip penampilan | Quiet | Koleksi pendukung dan arsip. Foto Lookbook harus mempertahankan `editLookSlot()` dan input `#lookPhIn`. |
| **Profil — Keepsakes** — aura/character sheet | Hero kandidat | Ringkasan profil yang sudah tersedia. Pastikan tidak menjadi hero berulang ketika subtab Profil berubah. |
| **Profil — Keepsakes** — pencapaian dan hadiah | Quiet | Koleksi/riwayat; aksi klaim hadiah tetap `claim()`. |
| **Profil — Jadwal & KRS** — `planCard()` dan jadwal mingguan | Primary | Form pengaturan rutinitas yang dipakai lintas aplikasi; perlu mempertahankan kontrol jadwal. |
| **Profil — Pengaturan** — tanggal mulai, preferensi, tema, ekspor/impor, reset | Primary terpisah per grup | Pengaturan dan operasi data. Tombol tema boleh dipindahkan dari masthead, tetapi handler `#themeBtn`/`syncThemeUI()` jangan dihapus. Reset dan impor/ekspor wajib mempertahankan dialog/handler. |

**Belum jelas untuk diputuskan pada Fase 3:** apakah tiap subtab Aktivitas (khususnya katalog FX dan Etalase) membutuhkan hero atau cukup heading + panel primary; penempatan form surat mingguan; dan pemisahan aksi Profil yang saat ini hidup dalam satu subtab. Tidak ada markup yang diubah pada fase audit ini.

## Kontrak interaksi yang harus dipertahankan

### Handler global yang dipanggil dari markup

Nama berikut dipanggil oleh atribut inline di template legacy atau file input shell. Saat mengganti markup ke modul, fungsi harus tetap terpapar pada `window` atau event binding harus menggantikannya dengan cakupan fungsi yang sama.

| Area | Handler |
|---|---|
| Navigasi, ritual, check-in, jadwal | `go`, `render`, `setSel`, `setStart`, `setCi`, `ci`, `toggle`, `toggleOvr`, `setLow`, `winLow`, `restDay`, `skipQ`, `bath`, `setWake`, `setWork`, `setC`, `addC`, `delC`, `wset`, `tag`, `claim`, `togglePeriodMode`, `completeRescue`, `pickSpa`, `ask`, `startRun` |
| Diary, Muse, foto, dialog, arsip | `auto`, `autoArc`, `setMusePhoto`, `handleVanityPhoto`, `handleLookPhoto`, `handleRestoreFile`, `openMuseSheet`, `openJarSheet`, `addJarProof`, `addPhoto`, `editLookSlot`, `editVanityItem`, `addVanityModal`, `restoreFromText`, `exportArchiveJson`, `copyBackupText`, `downloadRecapPoster`, `openRecapCardModal`, `resetAll` |
| Aktivitas, media, rekomendasi | `fxDone`, `fxFav`, `fxNope`, `fxPreset`, `fxRest`, `fxRoll`, `fxSet`, `fxSkip`, `fxStart`, `fxSur`, `nowOpen`, `nextFact`, `logMediaDone`, `openMediaPlay`, `delMedia`, `addCustomMedia`, `openRescueModal` |
| Buku | `bkAdd`, `bkCheck`, `bkDel`, `bkDoneQuote`, `bkFinish`, `bkQuote`, `bkSave`, `bkSetPage`, `bkStart`, `bookSheet` |

### ID yang dirujuk atau didefinisikan oleh markup

- Shell: `main`, `nav`, `quiet-rail`, `mastIssue`, `themeBtn`, `themeIco`, `themeTxt`, `dlg`, `dT`, `dB`, `dNo`, `dYes`, `sheet`, `toast`, `museInput`, `vanityPhIn`, `lookPhIn`, `restoreIn`.
- Elemen dinamis yang dipilih/dibaca JavaScript: `bkA`, `bkP`, `bkT`, `bkpIn`, `bkpTxt`, `jarIn`, `lkDesc`, `lkTitle`, `mCatSel`, `mDur`, `mTitle`, `mUrl`, `nvCat`, `nvName`, `nvNote`, `nvRole`, `ph`, `recapCanvas`, `sv`, `svArc`, `vName`, `vNote`.
- ID input/label dan SVG yang juga didefinisikan template: `bkQ`, `cfBear`, `cfBun`, `cfEye`, `cfFawn`, `cfRib`, `cfWool`, `f1`, `f2`, `f3`, `j1`, `j2`, `j3`, `mottoIn`, `sd0`, `sn`, `w1`, `w2`, `w3`.

Semua file input shell menghubungkan `museInput → setMusePhoto`, `vanityPhIn → handleVanityPhoto`, `lookPhIn → handleLookPhoto`, dan `restoreIn → handleRestoreFile`. `#sheet`, `#dlg`, `#toast`, status autosave `#sv`/`#svArc`, dan kontainer navigasi/rail adalah kontrak markup lainnya.

## Fase 1 — fondasi tipografi dan shell

Fase 1 menerapkan fondasi visual dari artboard mobile/desktop tanpa mengubah logika data atau perhitungan aplikasi.

- `index.html` kini hanya memiliki satu title, satu viewport meta dengan `viewport-fit=cover`, dan satu tautan font. Font yang dimuat hanya Cormorant Garamond 500/600 dan Inter 400/500/600; dekorasi masthead/heart-lace shell lama dihapus.
- `src/styles/tokens.css` memusatkan token warna, radius, spasi, dan font. Nilai mode terang mengikuti spesifikasi desain. `src/styles/shell.css` mengatur navigasi teks pada mobile, sidebar pada desktop, rail Ringkasan, skala tipografi, fokus keyboard, safe area, dan reduced motion.
- Navigasi mobile berlabel Hari ini, Perjalanan, Aktivitas, Diary, Profil. Pada desktop, label yang sama tampil vertikal di sidebar dengan “Glow Up Era”; rail kanan diberi judul Ringkasan. Untuk lebar 1024–1279 px sidebar dan rail menyempit agar konten tetap muat; pada ≥1280 px ukuran sidebar 232 px dan rail hingga 320 px.
- Kontrol tema dipindah ke Profil → Pengaturan. `toggleTheme()` tetap mengubah `S.theme`, menyimpan melalui `save()`, dan memperbarui label; hanya lokasinya yang berubah.
- Hierarki dan konten kartu lama tetap utuh pada fase fondasi ini. Pengurutan serta penyederhanaan permukaan kartu dilakukan pada fase desain tab berikutnya.

### Token mode gelap yang diusulkan

Warna gelap belum tercantum di PDF, jadi nilai berikut adalah usulan yang akan digunakan bila disetujui:

| Token | Nilai |
|---|---|
| `--bg` | `#171416` |
| `--surface` | `#211D20` |
| `--ink` | `#FAF7F5` |
| `--muted` | `#C8BFC1` |
| `--line` / `--line-strong` | `#40383B` / `#5A4D51` |
| `--accent` / `--accent-soft` | `#D98297` / `#E8B4C0` |
| `--hero-bg` / `--hero-ink` / `--hero-muted` | `#2B2426` / `#FAF7F5` / `#D9CCC9` |
| `--photo-ph` / `--photo-ph-ink` | `#443A3D` / `#F0E5E3` |

Perubahan file fase ini: `index.html`, `public/legacy-app.js`, `src/bootstrap.js`, `src/styles/tokens.css`, `src/styles/shell.css`, `src/styles/app.css`, `src/styles/minimal.css`, `src/styles/auth-screen.css`, `src/styles/sync-status.css`, dan dokumen ini. Belum ada build atau pemeriksaan visual browser pada fase ini.

Perubahan kontrak shell: `mastIssue` sudah dihapus bersama masthead lama. `themeBtn`, `themeIco`, dan `themeTxt` sekarang baru dibuat saat Profil → Pengaturan dirender; fungsi `syncThemeUI()` tetap memperbarui ketiganya.

## Fase 2 — Beranda

- Urutan Beranda sekarang: hero Muse → banner siklus/rescue hanya saat aktif → checklist ritual → konten pendukung dan arsip. Di mobile konten pendukung tampil setelah checklist; di desktop konten itu mengisi rail kanan.
- Hero tunggal memakai foto Muse yang dipilih atau diunggah, dengan sumber signed URL yang sama dan fallback ilustrasi gambar yang gagal. Foto menjadi blok 180 px di atas pada mobile dan kolom 240 px di kiri pada desktop. Hero menampilkan sapaan, motto, hari 30 hari, progres, streak/chapter, dan tombol `Mulai ritual` yang tetap menjalankan `startRun()`.
- Primary `Ritual hari ini` memakai checkbox native yang tetap memanggil `toggle()`, tautan `Lewati` yang memanggil `skipQ()`, tip khusus produk/kulit, dan video panduan. Angka selesai memakai hasil `prog()` (`p.n` dan `p.t`), bukan angka tetap 5: jumlah ritual inti berubah mengikuti hari, mode ringan, dan ritual yang dilewati; bonus tetap ditandai opsional dan tidak mengubah hitungan lama.
- Data kebiasaan `H` tidak memiliki jam per ritual: nilai `h[3]` adalah hari mulai kebiasaan, bukan jam. Agar tidak menampilkan waktu rekaan, sisi kanan baris menampilkan kategori kebiasaan yang sudah ada di `QN`.
- Kontrol check-in, catatan kulit, fakta, pintasan, jadwal, spa, Reading Nook, aura, toples bukti, dan arsip tetap tersedia sebagai konten Quiet tanpa bingkai/shadow kartu lama. Perilaku `setCi`, `nextFact`, `toggleOvr`, `togglePeriodMode`, `pickSpa`, `bkCheck`, `bkAdd`, `addJarProof`, serta kontrol yang lain tetap menggunakan handler lama.
- Beranda secara eksplisit melewati `applyCardHierarchy()` yang lama karena urutan mobile/desktop sekarang dirender langsung; tab lain belum berubah di fase ini.
- Verifikasi: `npm test` lulus (2 tes), `npm run build` lulus, `node --check public/legacy-app.js` dan `git diff --check` lulus. Screenshot viewport 390 px dan 1280 px belum dapat diambil: pratinjau browser terisolasi meminta login dan sesi Chrome pengguna tidak dapat dipilih pada pemeriksaan ini.

## Fase 3 — tab selain Beranda

Markup setiap tab kini memberi tier secara eksplisit. `applyCardHierarchy()` tidak lagi menebak tier dari elemen pertama, sehingga judul halaman atau tab tidak berubah menjadi hero hanya karena urutan DOM.

| Tab / blok | Tier | Urutan dan alasan |
|---|---|---|
| Perjalanan — judul Chronicle dan konteks hari terpilih | Heading | Memberi konteks tanpa membuat hero kedua. |
| Perjalanan — peta fase 30 hari dan navigasi pilihan hari | Primary | Memilih hari adalah tindakan utama tab. |
| Perjalanan — fokus hari terpilih dan kebiasaan | Primary | Menampilkan catatan serta kebiasaan hari yang dipilih setelah peta. |
| Perjalanan — Toples Bukti | Quiet | Koleksi pendukung setelah pemilihan hari dan kebiasaan. |
| Aktivitas — judul dan empat subtabs Katalog, Media, Etalase Rak, Postur | Navigasi | Tidak ada hero bersama karena konten berubah menurut subtab. Ikon emoji dekoratif di label navigasi/kategori dihilangkan. |
| Aktivitas — rekomendasi Katalog dan favorit | Primary | Rekomendasi serta koleksi pilihan adalah konten inti Katalog; filter berada di bawah sebagai Quiet. |
| Aktivitas — pustaka Media dan form tambah tautan | Primary | Pustaka dan penambahan media adalah aksi langsung; kategori/filter mendukung eksplorasi. |
| Aktivitas — Skin Diary hari ini dan Etalase produk | Primary | Status kulit tampil sebelum produk; weekly check dan foto progres turun menjadi Quiet. |
| Aktivitas — reset postur dan video panduan | Primary | Aksi panduan berada sebelum statistik dan refleksi mingguan yang Quiet. |
| Diary — Personal Diary Entry | Primary | Form hari terpilih dan autosave berada paling atas setelah heading konteks. |
| Diary — ulasan mingguan dan surat Hari 30 | Primary | Form refleksi sekunder berada setelah entri harian; surat hanya muncul pada hari 30 seperti sebelumnya. |
| Diary — toples, bacaan, lemari/lookbook | Quiet | Koleksi dan arsip pribadi berada setelah form yang sedang diedit. |
| Diary — arsip lembar sebelumnya | Quiet | Riwayat lama menjadi bagian terakhir layar. |
| Profil — Keepsakes | Hero + Quiet | Aura menjadi satu-satunya ringkasan utama; pencapaian dan hadiah menyusul sebagai koleksi. Aura tidak diulang pada subtab lain. |
| Profil — Jadwal & KRS | Quiet + Primary | Agenda hari ini memberi konteks, lalu kalender dan editor jadwal menerima fokus aksi. |
| Profil — Pengaturan | Primary + Quiet | Preferensi serta ekspor/impor adalah grup utama; reset dipisah di bagian akhir. |

Judul konteks dan navigasi subtabs selalu tampil sebelum konten. Urutan data dan kontrol hanya diubah pada tab yang ditampilkan; seluruh handler lama tetap menjadi tujuan aksi. Dialog, sheet, dan toast mengikuti permukaan yang sama tanpa ornamen tambahan.

Verifikasi Fase 3: `npm test` lulus (2 tes), `npm run build` berhasil (64 modul), `node --check public/legacy-app.js` dan `git diff --check` lulus. Pemeriksaan visual dan uji interaksi manual pada browser belum dilakukan. Fase 4 berikutnya berisi pembersihan kelas/aset lama, pemeriksaan responsif, uji fungsi manual, dan verifikasi akhir.
