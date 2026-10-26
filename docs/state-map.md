# Audit peta state — My Glow Up Era

## Cakupan dan batas audit

Audit dilakukan pada `My_Glow_Up_Era.html` di root workspace (HTML tunggal, inline CSS/JS; 3.300-an baris) dan `schema.sql`. Fase 1 kemudian menyalin HTML ke `legacy/` dan SQL ke `supabase/migrations/0001_init.sql`. `schema.sql` didefinisikan sebagai `0001_init.sql` ajuan, jadi temuan di bawah membandingkan kode terhadap SQL itu. Jangan edit SQL awal jika sudah dijalankan; koreksi melalui migrasi lanjutan.

Nilai awal diisi oleh `dflt()` (sekitar baris 1280), lalu state localStorage digabungkan secara dangkal dengan default. Normalisasi tambahan menjamin beberapa objek/array ada; `normBooks()` membetulkan bentuk rak baca. `save()` menulis seluruh objek `S` sebagai JSON sinkron di localStorage dengan key `glow30_v1`.

## Bentuk state dan pemetaan yang disarankan

| Key | Tipe dan bentuk dalam yang terbukti | Pembaca / penulis utama | Tujuan DB yang diusulkan |
|---|---|---|---|
| `start` | number epoch ms di tengah malam lokal | `todayN`, `dateOf`, `dow`, tanggal mulai; `setStart` menulis | `journeys.start_date` (date; konversi zona/tanggal harus ditetapkan) |
| `done` | objek `{[hari 1..30]: {[idRitual]: boolean}}` | checklist, progress, streak/achievement, kalender; toggle/skip/spa/rescue | `daily_logs.done` JSONB per hari |
| `low` | `{[hari]: boolean}` | status harian, progress, streak, achievement; `winLow` | `daily_logs.low` boolean per hari |
| `j` | `{[hari]: {text?, well?, tom?, mood?, ...}}`; properti persis disusun oleh UI jurnal | jurnal, ringkasan mood/achievement; input jurnal | `daily_logs.journal` JSONB |
| `skin` | `{[hari]: {tags: string[], note?: string, ...}}` | diary/skin, summary; editor catatan | `daily_logs.skin` JSONB |
| `wk` | `{[minggu 1..4]: {...}}` (catatan/ringkasan mingguan, properti tepat bergantung form) | tampilan perjalanan/mingguan; editor diary | `weekly_logs.data` JSONB dengan PK user/journey/week |
| `photos` | array `{d: number, src: string}`; `src` kini data URL JPEG dari canvas kualitas 0.68 | unggah/foto progres, render galeri, hapus | `progress_photos` (id, user_id, journey_id, day, storage_path, metadata); **jangan simpan src/base64** |
| `lowMode` | boolean global | mode minimal dan evaluasi `lowish`; toggle | `app_settings.low_mode` |
| `periodMode` | boolean global | filter ritual `fit`, rescue, teks/tombol mode; toggle | `app_settings.period_mode` |
| `theme` | `null \| "light" \| "dark"` | sinkronisasi tema dan tombol; toggle | `app_settings.theme` |
| `sch` | objek jadwal `{travel, buffer, prepWork, bath:number[], wake:{[dow]:time}, work:{[dow]:[time,time]}, courses:[{day,s,e,n}]}` | jadwal, kalkulasi waktu/aktivitas; editor jadwal | `app_settings.schedule` JSONB |
| `fit` | boolean (default `true`; tidak ditemukan perubahan dinamis dalam UI yang diperiksa) | helper `fit(d,h)` dan ritual | `app_settings.fit` |
| `ci` | `{[hari]: {energy?, mood?, time?, type?, skip?}}`; nilai pilihan berupa indeks angka (0-based), helper mengakses empat field tersebut | check-in harian dan rekomendasi; kontrol chip | `daily_logs.checkin` JSONB |
| `rest` | `{[hari]: boolean}` | progress/status aktif, streak, UI; `restDay` | `daily_logs.rest` boolean |
| `skip` | `{[hari]: {[ritualId]: 1}}` | checklist/progress; `skipQ`, terhapus saat ritual ditandai | `daily_logs.skip` JSONB |
| `acts` | `{[hari]: Array<{a: string, done: truthy, at?: number}>}`; ditulis juga oleh aksi FX | summary aktivitas, achievement, UI aktivitas | `daily_logs.activities` JSONB |
| `ach` | objek `{[achievementId]: timestamp}`; mencakup achievement `m0..m3` | achievement/keepsakes; `checkAch` menambah saat syarat tercapai | `achievements.key, unlocked_at` (PK journey/key) |
| `gifts` | objek indeks hadiah `{[index]: null \| ISO timestamp}`; toggled oleh `claim` | keepsake/treat; tombol Ambil | `app_settings.gifts` JSONB (global; bukan per hari; ditambahkan di `0002_state_mapping.sql`) |
| `fx` | `{fav:{[indeks]:truthy}, nope:{[indeks]:{until:number}}, log:[{i,e,t}], seen:{[indeks]:{n,t}}}` | saran FX, favorit/tidak suka/riwayat; helper `fxS` dan aksi FX | `fx_state.data` JSONB per user |
| `ovr` | `{[hari]: {lazy?, noWork?, ...}}`; dipakai `lowish`, jadwal dan rekomendasi | override hari/jadwal; tombol toggle | `daily_logs.overrides` JSONB |
| `spa` | `{[hari]: "quick" \| "silky" \| "full"}`; properti hari dihapus saat batal | status spa/progress dan ritual; pilihan/batal paket spa | `daily_logs.spa` JSONB |
| `rescue` | `{[hari]: "night" \| "class"}`; properti hari diset saat rescue selesai | status, progress, ritual; penyelamat 2 menit | `daily_logs.rescue` JSONB |
| `vanity` | array produk `{id,cat,name,badge,role,note,img}`; default 6. `img` nullable, foto JPEG base64 kualitas 0.74 | lemari produk, ritual mengikuti role, editor/tambah/hapus | tabel `vanity_items` + `storage_path` privat |
| `lookbook` | array `{title,desc,img}`; default 3; foto base64 kualitas 0.75 | lookbook/editor/tambah gambar | tabel `lookbook_items` (perlu id stabil) + `storage_path` |
| `media` | array `{id,cat,title,creator,dur,thumb,url,desc}`; default media eksternal; item custom dapat ditambah/dihapus | pustaka media/video | `media_items`; `description`, `legacy_id`, `extra` dan `position` ditambahkan di `0002_state_mapping.sql` |
| `jar` | array `{t:string,d:number,at?:number}`; default satu item tanpa `at` | bukti/kenangan, skor, ringkasan; tambah item | `jar_items` (SQL punya UUID tetapi tidak ada id state; perlu id deterministik/metadata dan urutan eksplisit) |
| `books` | objek `{cur: null\|Book, days:{[yyyy-mm-dd]: {…}}, done:Book[], tbr:Book[]}`; Book aktif/TBR memuat `id,title,author,totalPages,currentPage?,quote?`; selesai memuat `id,title,author,totalPages,quote,at` | seluruh Reading Nook, streak dan aura; `bk*` handlers | `books` untuk current/TBR/finished + `reading_log` untuk tanggal. Hari baca ditandai nilai truthy, biasanya record objek dari `bkTouch`; jangan diasumsikan boolean sebelum mapper dikunci |
| `muse` | `{preset:number,custom:null|string,motto:string}`; `custom` adalah data URL JPEG kualitas 0.78 pada state lama dan menjadi Storage path saat online | gallery wall/motto; preset, motto, unggah foto | `app_settings.muse` JSONB `custom` berisi Storage path saja |
| `archive` | objek teks kunci `calmSkin,lipCombo,hairLook,outfit,feelPretty`, dapat berkembang lewat UI | poster/recap dan editor archive | `app_settings.archive` JSONB |

## Temuan ketidakcocokan / keputusan yang perlu dicatat

1. `gifts` **global berupa indeks hadiah**, bukan objek per hari. Namun `0001` menempatkan `gifts` pada `daily_logs` (satu salinan per hari). `skip` memang objek per hari/per ritual, tetapi SQL hanya menyediakan `extra` sebagai cadangan, bukan kolom bernama `skip`. `0002_state_mapping.sql` menambahkan `app_settings.gifts jsonb` dan `daily_logs.skip jsonb`; jangan mengubah `0001` yang sudah dijalankan.
2. `spa` dan `rescue` merupakan string per hari; row mapper mempertahankan key presence melalui `extra.state_presence` agar key yang tidak ada tidak berubah menjadi nilai default kosong.
3. SQL `daily_logs` dan `weekly_logs` PK `(journey_id, day/week)` cocok dengan upsert per hari/minggu. `0002_state_mapping.sql` menambahkan FK gabungan yang memastikan pemilik log sama dengan pemilik `journey_id`.
4. `books.days` berkunci tanggal kalender `yyyy-mm-dd`, sedangkan catatan lain berkunci nomor hari perjalanan. `books + reading_log` memadai secara konsep, tetapi `books` tidak punya `journey_id` (buku kini global di S) dan `extra` perlu menyimpan `id`, `currentPage`, `quote`, serta status/state losslessly. PK unik user/status reading sudah sejalan dengan satu buku aktif.
5. `lookbook` default tidak memiliki `id`; `jar` default juga tidak memiliki ID/urutan. SQL memakai UUID acak, sehingga import/upsert berulang dapat menggandakan baris. Perlu ID stabil yang dibuat saat mengangkat data localStorage dan dipersistenkan di item, atau strategi key tambahan. Vanity/media sudah punya id string di state, sedangkan SQL id-nya UUID—jangan langsung mengirim string lama ke kolom UUID.
6. `media` mencampur daftar default ber-URL eksternal dan item buatan pengguna; `media_items` cocok. `0002_state_mapping.sql` menambahkan `description` untuk `desc` dan kolom ID lama/metadata/urutan yang dibutuhkan mapper.
7. `photos[].src`, `vanity[].img`, `lookbook[].img`, serta `muse.custom` adalah base64/data URL JPEG di state; migrasi harus mengonversi dan mengunggahnya, bukan memasukkannya ke kolom JSON.
8. Fungsi reset legacy kini memanggil alur arsip journey baru; perjalanan lama tidak dihapus. Data lokal diarsipkan secara terpisah.
9. Copy aktif foto progres diperbarui menjadi “Foto disimpan privat di akunmu”; versi `legacy/` tetap menjadi sumber audit yang tidak diubah.
10. `0001` memiliki RLS untuk semua tabel dan bucket privat dengan pembatasan folder `{user_id}`. `0002` menambahkan FK pemilik journey untuk log terkait.

## Alur tulis/baca umum

- Baca awal: `localStorage.getItem(KEY)` → `Object.assign(dflt(), raw)` → normalisasi → `normBooks()`.
- Tulis: hampir semua handler mutasi memanggil `save()` lalu `render()`; `save()` saat ini menulis seluruh JSON sinkron.
- Logika turunan penting: `todayN/dateOf/dow`, `fit`, `active`, `dn`, `hasAct`, `hasJrn`, `hasSkn`, `prog`, `checkAch`, `streak`, `bookStreak`, `bookAuraPts`. Migrasi harus mempertahankan bentuk `S` dan perilaku helper ini.
- Navigasi: `today`, `journey`, `act`, `diary`, `me` (Beranda, Perjalanan, Aktivitas, Diary & Lemari, Profil).

## Status fase

Audit 0001 dibandingkan dengan `schema.sql` byte-for-byte; karena schema sudah dipasang, koreksi berada di migrasi tambahan `0002_state_mapping.sql`. Mapper dan repository ada di `src/data/mapper.js` dan `src/data/repo.js`. Round-trip diuji memakai fixture representatif `tests/fixtures/legacy-local-storage.json`. Workspace tidak menyediakan ekspor localStorage aktual, sehingga fixture adalah sampel bentuk kode lama, bukan data pribadi hasil ekspor. RLS lintas dua akun, Supabase Storage nyata, dan preview Vercel memerlukan project/env pemilik dan belum diuji dari workspace ini.
