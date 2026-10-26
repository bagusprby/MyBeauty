# My Glow Up Era

Web app vanilla JS yang dibundel Vite sebagai aset statis. Data diary disimpan di Supabase dengan RLS; gambar berada di bucket privat dan ditampilkan melalui signed URL.

## Menjalankan lokal

1. `npm ci`
2. Salin `.env.example` ke `.env.local`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari Supabase → Project Settings → API. Jangan gunakan `service_role` key.
3. `npm run dev`

Tanpa variabel Supabase, halaman berjalan hanya memakai penyimpanan lokal. Dengan Supabase terkonfigurasi, login diwajibkan.

## Supabase

Schema awal `schema.sql`/`supabase/migrations/0001_init.sql` telah dipasang oleh pemilik. Jalankan isi `supabase/migrations/0002_state_mapping.sql` satu kali dari SQL Editor untuk menambahkan kolom pemetaan legacy, idempotensi, dan foreign key kepemilikan. Bucket `glow-photos` dan policy RLS Storage dibuat oleh schema awal. Periksa Authentication → URL Configuration setelah domain Vercel tersedia, lalu tambahkan URL produksi dan preview yang dipakai.

Buat user pemilik melalui Supabase Authentication. Sesudah akun dibuat, matikan public sign-ups di pengaturan Authentication. `VITE_ALLOW_SIGNUP=false` secara default; jangan aktifkan di deployment personal.

## Impor legacy

Jika browser baru berada di origin/domain berbeda, browser tidak dapat membaca localStorage origin lama. Dari aplikasi lama, unduh cadangan JSON melalui Profil → Pengaturan → Unduh Cadangan Arsip. Login di deploy baru dengan akun yang belum berisi diary, pilih file cadangan JSON, lalu aplikasi mengunduh salinan cadangan lagi sebelum menulis ke Supabase, mengunggah foto ke bucket, dan menghitung ulang baris/objek untuk verifikasi. Data localStorage lama tidak dihapus. Dari Profil, ekspor JSON kapan saja; tombol hapus salinan lokal meminta konfirmasi terpisah.

## Vercel

Hubungkan repository GitHub ke Vercel, pilih preset Vite, dan tambahkan environment variables berikut untuk Production (serta Preview bila diperlukan):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (anon/publishable key saja)
- `VITE_ALLOW_SIGNUP=false`

Deploy. Untuk cron keepalive, tambahkan server-side variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `CRON_SECRET` di Vercel. Buat nilai acak panjang untuk `CRON_SECRET`; jangan memakai awalan `VITE_`. Cron harian memanggil endpoint API ringan di Vercel yang mengecek endpoint PostgREST. Aplikasi utama tetap dibangun sebagai aset statis di `dist/`.

## Pemeriksaan lokal

- `npm test` menjalankan tes mapper round-trip pada fixture legacy representatif.
- `npm run build` menghasilkan deploy statis di `dist/`.

Isolasi RLS akun kedua dan keberhasilan deploy perlu diperiksa pada project/deployment nyata pemilik; belum dapat disimpulkan dari lingkungan lokal tanpa kredensial.
