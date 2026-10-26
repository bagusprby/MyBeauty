# Hirarki UI

Tema, font, ilustrasi dan token warna coquette yang ada tetap dipertahankan. Override CSS menetapkan satu hero visual per tampilan, kartu aksi sebagai tingkat primary, dan panel ringkasan/media sebagai quiet tanpa shadow berat. Banner mode siklus/rescue tetap tampil sesuai status aktif yang ditentukan state; ornamen penuh tidak ditambahkan lagi.

## Prioritas per tab

Beranda mempertahankan gallery wall sebagai hero, memindahkan banner siklus/rescue aktif tepat setelahnya, lalu menempatkan check-in dan ritual harian sebelum pintasan, bisikan, dan ringkasan pendukung. Perjalanan menampilkan peta/progres pertama; Aktivitas menampilkan tindakan utama sebelum pustaka/media; Diary & Lemari menampilkan check-in/jurnal sebelum galeri/arsip; Profil menampilkan ringkasan diri/pengaturan sebelum keepsake. Tiga tab terakhir mengikuti urutan prioritas sumbernya; renderer memberi satu hero, hingga dua primary, dan quiet untuk blok sisanya.

Pada layar lebar (1024px ke atas), bottom navigation menjadi sidebar kiri. Konten aplikasi berada di kolom tengah (maksimum 720px), dengan rel kanan berisi hari/streak, checklist singkat, dan keepsake terbaru sebagai informasi quiet. Kolom akan menyusut pada viewport desktop yang sempit; body menahan overflow horizontal.

Kontrol utama diberi tinggi minimum 44px, safe area iOS dipertahankan, dan animasi `cf-*` mematuhi `prefers-reduced-motion`.
