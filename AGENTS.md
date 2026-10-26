# AGENTS.md — MyBeauty / My Glow Up Era

Letakkan file ini di root repo (`MyBeauty/AGENTS.md`). Codex membacanya otomatis; jangan ditempel ulang di tiap prompt.

## Proyek
- Web app diary/tracker glow-up 30 hari. **Vanilla JS + Vite** (bukan React), entry `index.html` → `src/bootstrap.js`, build statis ke `dist/`.
- Data di Supabase (RLS), foto di bucket privat `glow-photos` lewat signed URL. Tanpa env Supabase, app jatuh ke localStorage.
- Deploy: Vercel (preset Vite), repo GitHub `bagusprby/MyBeauty`. Referensi perilaku lama: `legacy/` dan `My_Glow_Up_Era.html`.
- Perintah: `npm ci`, `npm run dev`, `npm test` (tes mapper round-trip), `npm run build`.

## Aturan yang selalu berlaku
1. **Jangan mengubah lapisan data** (`repo`/mapper Supabase, skema, migrasi, auth, storage) kecuali diminta eksplisit. Tugas desain hanya menyentuh markup, CSS, dan tata letak.
2. **Jangan mengubah logika/perilaku**: streak, achievement, `fit()`, `active()`, penyimpanan, impor/ekspor cadangan. Teks UI tidak diubah selain yang disebut di tugas.
3. Handler global yang dipanggil dari HTML (`setMusePhoto`, `handleVanityPhoto`, `handleLookPhoto`, `handleRestoreFile`, dll.) harus tetap tersedia dan bekerja.
4. **Jangan commit secret.** `.env*` tetap di `.gitignore`. Jangan pakai `service_role` di kode klien.
5. Jangan menambah dependensi UI besar (Tailwind, MUI, dll.). Boleh: tidak ada dependensi baru.
6. Jangan menjalankan perintah destruktif pada database. Tidak ada `git push --force`, tidak ada hapus data.
7. Kerja di branch `redesign-minimal`; **satu commit per fase** dengan pesan jelas, supaya bisa di-revert.
8. **Laporan harus berbasis bukti**: tampilkan keluaran perintah (`npm test`, `npm run build`, `grep`), daftar file yang diubah, dan screenshot bila diminta. Jangan menulis "selesai" untuk sesuatu yang tidak kamu verifikasi; tulis apa yang belum diuji.
9. Berhenti di akhir tiap fase dan tunggu persetujuan sebelum lanjut.
10. Bila ragu bentuk data atau perilaku, baca kodenya dan `legacy/`; jangan mengarang.
