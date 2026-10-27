
const KEY = "glow30_v1";

/* ===== iOS Safari fallback: ctx.roundRect (WebKit lama) ===== */
if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Array.isArray(r) ? (r[0] || 0) : (r || 0);
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
  };
}

/* ===== Coquette Sticker & Object Art Library ===== */
const ART = window.__GLOW_ART;

function artForCat(catIdx) {
  return [
    ART.bow, ART.teapot, ART.mirror, ART.hairMask,
    ART.perfume, ART.shoe, ART.swan, ART.heartBag,
    ART.bow, ART.dressform, ART.camisole, ART.teapot, ART.mirror
  ][catIdx] || ART.bow;
}

function artForVanity(v) {
  if (v.img) return `<img src="${window.__photoUrl?.(v.img) || v.img}" alt="${E(v.name)}">`;
  if (v.role === "moist") return ART.creamJar;
  if (v.role === "clean") return ART.cleanser;
  if (v.role === "spf") return ART.spfTube;
  if (v.role === "hair") return ART.hairMask;
  if (v.role === "makeup") return ART.cushion;
  if (v.role === "lip") return ART.lipgloss;
  return ART.perfume;
}

const CATS = { s: ["🌸", "Perawatan Kulit"], b: ["🎀", "Postur & Tubuh"], h: ["🍓", "Ritme Harian"], f: ["🪞", "Pesona & Diri"] };

const H = [
  ["pm_clean", "s", "Malam: cuci muka lembut (atau bilas air biasa)", 1, 1, "Air suhu ruang, usap lembut dengan ujung jari tanpa menggosok."],
  ["pm_moist", "s", "Malam: oleskan pelembap tipis yang menenangkan", 1, 1, "Satu lapis tipis untuk menjaga skin barrier malam ini."],
  ["post1", "b", "Postur 1 menit (tarik dagu & rilekskan bahu ×5)", 1, 1, "Sangat cocok dilakukan setelah duduk lama di kelas atau depan laptop."],
  ["teeth", "h", "Sikat gigi dengan tenang", 1, 1, "Pagi atau malam sebelum tidur. Keduanya adalah bentuk sayang diri."],
  ["spf", "s", "Tabir surya SPF 30+ (jika keluar rumah/ke kampus)", 4, 1, "Langkah terakhir pagi hari sebelum berangkat."],
  ["meal", "h", "Makan teratur (jangan biarkan perut kosong sebelum kerja)", 5, 1, "Penting untuk menjaga energimu sebelum jam 20.00."],
  ["am_clean", "s", "Pagi: bilas air biasa atau cleanser lembut, lalu pelembap", 8, 0, "Bilas air saja sudah cukup jika kulit sedang kering atau sensitif."],
  ["post_routine", "b", "Rutinitas postur 3–5 menit (buka bahu & dada)", 9, 0, "Chin tucks, shoulder squeezes, dan regangkan dada di kusen pintu."],
  ["water", "h", "Minum air saat haus di sela kuliah & editing", 10, 0, "Siapkan botol atau gelas di dekat meja kerjamu."],
  ["screen", "h", "Jeda mata dari layar 10 menit (tanpa scroll)", 10, 0, "Bukan larangan main HP—hanya mengistirahatkan mata sejenak."],
  ["no_pick", "s", "Jauhkan jari dari menyentuh atau memencet jerawat", 11, 0, "Membiarkannya tenang adalah cara tercepat mencegah bekas gelap."],
  ["hair", "f", "Sisir lembut atau rapikan gaya rambut", 12, 0, "Hal kecil yang langsung mengubah mood saat bercermin."],
  ["sleep", "h", "Bersiap tidur dengan tenang setelah selesai aktivitas", 14, 0, "Redupkan lampu dan biarkan tubuhmu benar-benar beristirahat."],
  ["healing", "f", "Satu momen menyenangkan untuk diri sendiri hari ini", 14, 0, "Nonton 1 episode, dengar lagu, minum teh, atau rebahan nyaman."],
  ["walk", "h", "Gerak ringan atau jalan santai 5–10 menit", 15, 0, "Keliling rumah atau jalan di kampus sudah sangat dihitung."],
  ["breaks", "b", "Berdiri & luruskan punggung setelah duduk lama", 16, 0, "Setiap selesai 1 sesi kuliah atau beberapa halaman scanlation."],
  ["wall", "b", "Cek postur di dinding (30 detik berdiri anggun)", 17, 0, "Tumit, pinggul, dan bahu menempel nyaman di dinding."],
  ["fruit", "h", "Tambahkan sedikit buah atau sayur hari ini", 18, 0, "Apa pun yang mudah dan tersedia di rumah."],
  ["tidy", "f", "Rapikan satu sudut kecil meja atau kasur (5 menit)", 19, 0, "Cukup satu titik agar kamar terasa lebih lapang."],
  ["alone", "f", "5 menit hening untuk diri sendiri tanpa beban", 20, 0, "Duduk nyaman, tarik napas, nikmati ketenangan."],
  ["lotion", "f", "Pakai body lotion atau wewangian setelah mandi", 21, 0, "Sentuhan lembut yang membuatmu merasa wangi dan terawat."],
  ["nails", "f", "Rapikan kuku & kebersihan detail diri", 22, 0, "Kuku yang bersih selalu terasa rapi saat mengetik."],
  ["clothes", "f", "Kenakan pakaian bersih & nyaman yang membuatmu cantik", 23, 0, "Bahkan saat di rumah saja, pilih warna yang kamu sukai."],
  ["mandi", "h", "Hari mandi utama: ritual mandi bersih & segar 🛁", 1, 0, "Selasa, Jumat, dan Minggu (atau kapan pun kamu ingin segar)."],
  ["pillow", "s", "Ganti sarung bantal & bersihkan layar HP (mingguan)", 25, 0, "Kebiasaan sederhana yang sangat ramah untuk kulit berjerawat."]
];

const F = [
  "Hadir dengan lembut untuk dirimu sendiri", "Langkah sederhana yang diulang dengan tenang", "Turunkan bahu yang tegang, lembutkan rahangmu",
  "Lindungi kulitmu saat melangkah keluar", "Rawat kulitmu seperti merawat sesuatu yang berharga", "Dengarkan apa yang tubuhmu butuhkan hari ini",
  "Apresiasi minggu pertamamu tanpa menghakimi", "Segarkan wajahmu di pagi hari dengan lembut", "Buka kembali postur bahumu yang lelah menunduk",
  "Jaga tubuhmu tetap terhidrasi di sela kesibukan", "Biarkan kulitmu pulih tanpa disentuh jari", "Tata rambutmu dan temukan pesonamu di cermin",
  "Beri tubuhmu asupan yang hangat dan teratur", "Lindungi waktu istirahat malammu", "Langkah kaki ringan untuk menyegarkan pikiran",
  "Jeda sejenak dari kursi kerja dan kuliahmu", "Berdiri tegak dengan anggun selama tiga puluh detik", "Tambahkan kesegaran alami di piringmu",
  "Ciptakan sudut kamar yang menenangkan mata", "Lima menit yang sepenuhnya milikmu sendiri", "Kulit yang lembap, wangi yang menenangkan",
  "Detail kecil pada jemari yang bersih dan rapi", "Kenakan sesuatu yang membuatmu suka pada dirimu", "Amati perkembangan kulitmu dengan penuh kesabaran",
  "Sarung bantal bersih untuk tidur yang lebih nyaman", "Regangkan punggungmu sedikit lebih lama hari ini", "Simpan kebiasaan yang terasa paling cocok untukmu",
  "Perhatikan cara anggunmu membawa diri", "Rayakan setiap kemenangan kecil yang tak terlihat", "Menjadi versi dirimu yang lebih tenang dan percaya diri"
];

const NOTES = [
  "Melakukan sedikit hal dengan tenang jauh lebih berarti daripada memaksakan daftar panjang.",
  "Kamu tidak butuh motivasi besar; cukup satu langkah paling ringan.",
  "Merawat kulit yang sedang breakout adalah perjalanan sabar—setiap malam kamu mencuci muka dengan lembut, kamu sedang membantu kulitmu.",
  "Setelah hari kuliah yang panjang atau malam scanlation yang larut, istirahat adalah bagian dari glow up.",
  "Hari yang lelah tidak pernah menghapus kemajuan yang sudah kamu bangun.",
  "Postur yang anggun dimulai dari kesadaran kecil saat kamu duduk di depan layar.",
  "Lembut pada diri sendiri selalu menang melawan rutinitas yang agresif.",
  "Kamu boleh berjalan pelan-pelan dan menyesuaikan ritme dengan energimu hari ini.",
  "Tetap hadir dengan versi minimal saat malas adalah kemenangan yang nyata.",
  "Perlakukan dirimu dengan kehangatan yang sama seperti sahabat terdekatmu."
];

const REW = {
  3: "Secangkir minuman favorit di dekat jendela",
  7: "Playlist lagu kesukaan dan malam bebas beban",
  10: "Satu episode tontonan favorit tanpa rasa bersalah",
  14: "Mandi air hangat tanpa terburu-buru",
  18: "Mencoba padu padan outfit atau jepit rambut favorit",
  21: "Sore santai menikmati jajanan atau minuman kesukaan",
  25: "Surat apresiasi singkat untuk dirimu sendiri",
  30: "Hadiah kecil yang sudah lama ingin kamu nikmati"
};

const PHASES = [
  [1, 7, "Chapter I · The Gentle Prelude", "Cukup beberapa ritual dasar yang paling ringan. Fokus pada kenyamanan."],
  [8, 14, "Chapter II · Soft Foundation", "Menambahkan kesadaran postur dan perawatan pagi sesuai energimu."],
  [15, 21, "Chapter III · Finding My Rhythm", "Menyelaraskan kuliah, scanlation, dan ruang istirahat tanpa beban."],
  [22, 30, "Chapter IV · Becoming Her", "Merawat hal-hal yang membuatmu merasa cantik, nyaman, dan percaya diri."]
];

const MOOD = ["Sedih", "Lelah", "Biasa saja", "Baik", "Semangat"];
const ME = ["😔", "😴", "😐", "🙂", "🥰"];
const EN = ["Sangat rendah", "Rendah", "Sedang", "Tinggi"];
const WAKTU = ["5 menit", "15 menit", "30 menit", "Fleksibel"];
const TIPE = ["Kuliah padat", "Fokus kerja", "Santai", "Banyak tugas"];
const TAGS = ["Jerawat baru", "Terasa nyeri", "Iritasi", "Berminyak", "Kering", "Terasa ketarik", "Kemerahan", "Produk baru", "Stres", "Kurang tidur", "Keringat / masker", "Masa hormonal"];

const $ = s => document.querySelector(s);
const E = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const D0 = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

function mkSch() {
  const c = (day, s, e, n) => ({ day, s, e, n });
  return {
    travel: 45, buffer: 15, prepWork: 60, bath: [2, 5, 0],
    wake: { 1: "05:00", 3: "07:30", 4: "07:30" },
    work: { 1: ["20:00", "23:00"], 3: ["20:00", "01:00"], 4: ["20:00", "01:00"] },
    courses: [
      c(1, "07:30", "10:00", "Corporate Responsibility (CSR)"),
      c(1, "10:15", "12:45", "Customer Relationship Management & Loyalty Programs"),
      c(1, "13:15", "15:45", "B2B Marketing"),
      c(3, "10:15", "12:45", "Islamics Finance & Ethical Banking"),
      c(3, "13:15", "15:45", "Cryptocurrency & Blockchain in Business"),
      c(4, "10:15", "12:45", "AI and Big Data in Business"),
      c(4, "13:15", "15:45", "Managing Innovation for Circular Economics")
    ]
  };
}

const DEFAULT_VANITY = [
  { id: "v1", cat: "Skincare", name: "Centella Soothing Cream / Gel", badge: "Penyelamat Breakout", role: "moist", note: "Oles tipis setiap malam agar kemerahan lebih kalem.", img: null },
  { id: "v2", cat: "Skincare", name: "Gentle Low-pH Facial Wash", badge: "Wajib Malam", role: "clean", note: "Busakan di tangan, usap lembut 30 detik tanpa digosok.", img: null },
  { id: "v3", cat: "Skincare", name: "Daily Light Sunscreen SPF 30+", badge: "Pagi Kampus", role: "spf", note: "Dua jari tipis sebelum berangkat ke kampus.", img: null },
  { id: "v4", cat: "Hair & Body", name: "Hair Mask & Bond Repair Treatment", badge: "Mandi Utama 🛁", role: "hair", note: "Diamkan 5–10 menit saat mandi Selasa/Jumat/Minggu agar rambut lembut.", img: null },
  { id: "v5", cat: "Makeup", name: "Glad2Glow Cushion & Gouté Loose Powder", badge: "Andalan Kampus", role: "makeup", note: "Tap tipis merata untuk tampilan medium neutral-warm yang segar.", img: null },
  { id: "v6", cat: "Makeup", name: "Luxcrime Contour, Emina Blush & Lip Tint", badge: "Pretty Boost", role: "lip", note: "Sentuhan akhir yang langsung bikin wajah terlihat hidup di cermin.", img: null }
];

const DEFAULT_LOOKBOOK = [
  { title: "Look 01 · Kampus", desc: "Blouse nyaman & celana rapi", img: null },
  { title: "Look 02 · Cozy", desc: "Cardigan lembut & rok/jeans", img: null },
  { title: "Look 03 · Pretty", desc: "Dress / atasan pita favorit", img: null }
];

const DEFAULT_MEDIA = [
  { id: "m1", cat: "posture", title: "8-Min Posture Fix (Rounded Shoulders & Forward Head)", creator: "Emi Wong · Female Trainer", dur: "8 mnt", thumb: "https://i.ytimg.com/vi/RqcOCBb4arc/hqdefault.jpg", url: "https://www.youtube.com/watch?v=RqcOCBb4arc", desc: "Gerakan lembut tanpa lompat bersama Emi Wong untuk membuka bahu yang pegal menunduk." },
  { id: "m2", cat: "posture", title: "5-Min Neck & Shoulder Release (Bisa Sambil Duduk)", creator: "Mady Morrison · Female Instructor", dur: "5 mnt", thumb: "https://i.ytimg.com/vi/SedzswEwpPw/hqdefault.jpg", url: "https://www.youtube.com/watch?v=SedzswEwpPw", desc: "Peregangan leher super tenang bersama Mady Morrison sehabis ngedit atau kuliah." },
  { id: "m3", cat: "posture", title: "Swan Arms & Upper Back Posture (Ballet Inspired)", creator: "Move With Nicole · Female Pilates", dur: "10 mnt", thumb: "https://i.ytimg.com/vi/BPlCatqZRPI/hqdefault.jpg", url: "https://www.youtube.com/watch?v=BPlCatqZRPI", desc: "Melatih postur punggung atas yang anggun dan tegak ala balerina bersama Nicole." },
  { id: "m4", cat: "podcast", title: "The Psychology of Self-Acceptance & Berani Tidak Disukai", creator: "Audio Refleksi & Psikologi", dur: "20 mnt", thumb: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80", url: "https://www.youtube.com/results?search_query=podcast+berani+tidak+disukai+psikologi+indonesia", desc: "Bahasan psikologi Adlerian yang menenangkan pikiran sambil typesetting/perjalanan." },
  { id: "m5", cat: "podcast", title: "The Comfort Mindset: Cara Berdamai dengan Hari Lelah", creator: "Soft Living Audio Essay", dur: "18 mnt", thumb: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", url: "https://www.youtube.com/results?search_query=the+comfort+book+matt+haig+review+podcast", desc: "Teman audio yang hangat saat kamu sedang kerja malam atau butuh perspektif baru." },
  { id: "m6", cat: "glowup", title: "Soft Girl Reset & Romanticizing Your Daily Routine", creator: "Feminine Editorial Vlog", dur: "12 mnt", thumb: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80", url: "https://www.youtube.com/results?search_query=soft+girl+sunday+reset+aesthetic+vlog", desc: "Visual tenang yang bikin kamu semangat merapikan kamar, mandi wangi, dan merawat diri." },
  { id: "m7", cat: "glowup", title: "Effortless Pretty Girl Habits (TikTok Curated)", creator: "Coquette Beauty Archive", dur: "5 mnt", thumb: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80", url: "https://www.tiktok.com/search?q=coquette%20soft%20glow%20up%20routine", desc: "Inspirasi singkat di TikTok untuk kebiasaan kecil yang bikin kamu merasa lebih rapi." },
  { id: "m8", cat: "subliminal", title: "Calm Clear Skin & Soothing Beauty Affirmations (Night Audio)", creator: "Sleep & Skincare Ambient", dur: "15 mnt", thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80", url: "https://www.youtube.com/results?search_query=calm+clear+skin+subliminal+rain+sound", desc: "Suara hujan lembut dengan afirmasi positif untuk menemani ritual memakai pelembap malam." },
  { id: "m9", cat: "subliminal", title: "Magnetic Confidence & Graceful Aura Subliminal", creator: "Dreamy Frequency", dur: "10 mnt", thumb: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80", url: "https://www.youtube.com/results?search_query=feminine+elegance+aura+subliminal+calm", desc: "Audio pengantar tidur atau bersantai agar pikiranmu lebih rileks dan percaya diri." }
];

const DEFAULT_JAR = [
  { t: "Memulai ruang pribadiku sendiri untuk 30 hari ke depan 🌸", d: 1 }
];

/* ===== NEW: Daily Beauty & Wellness Whisper (3 sif sehari) ===== */
const FACTS = {
  p: [
    "💧 Setelah tidur semalaman, tubuhmu biasanya agak kurang cairan. Segelas air putih sebelum kopi atau teh bikin kulit dan fokus kuliahmu lebih siap, bestie.",
    "☀️ Sinar UVA tetap menembus awan dan kaca jendela. Sunscreen SPF 30+ sebelum berangkat, walau mendung, membantu bekas jerawat tidak makin gelap.",
    "🧴 Patokan praktis: sunscreen sepanjang dua jari (telunjuk dan tengah) untuk wajah dan leher. Leher sering terlupa padahal ikut kena sinar.",
    "🎀 Duduk kuliah: layar sejajar mata, kaki menapak lantai, punggung bersandar. Tiap 30–45 menit, tarik bahu ke belakang lalu turunkan pelan-pelan.",
    "🍳 Sarapan yang punya protein dan serat (telur, yoghurt, roti gandum) bikin energi lebih stabil daripada sarapan yang cuma manis.",
    "🌿 Kalau kulit lagi breakout dan perih, cuci muka pagi cukup dengan pembersih lembut atau air saja. Kulit nggak harus terasa kesat biar bersih.",
    "🌅 Cahaya pagi 10–15 menit (jalan ke kampus atau duduk dekat jendela) membantu jam biologismu, jadi malam nanti lebih gampang ngantuk.",
    "🪞 Oleskan pelembap tidak lama setelah cuci muka, saat kulit masih sedikit lembap, supaya air di kulit lebih terjaga.",
    "🌸 Chin tuck: tarik dagu lurus ke belakang pelan-pelan, tahan 5 detik, ulangi 5 kali. Enak banget untuk leher yang sering maju karena menatap laptop.",
    "🤍 Tangan kita menyentuh wajah puluhan kali tanpa sadar. Cuci tangan dulu sebelum skincare pagi biar area breakout nggak ketempelan kuman."
  ],
  s: [
    "👀 Aturan 20-20-20: tiap 20 menit, lihat sesuatu sejauh ±6 meter selama 20 detik. Mata yang seharian menatap layar jadi lebih rileks.",
    "💧 Saat fokus ke layar, kita jadi jarang berkedip dan mata terasa kering. Sengaja berkedip pelan beberapa kali, atau pakai tetes mata buatan bila perlu.",
    "😴 Power nap 10–20 menit sebelum sekitar jam 3 sore bisa menyegarkan tanpa mengacaukan tidur malam. Kalau terlalu lama, badan malah terasa berat.",
    "🎀 Peregangan bahu: putar bahu ke belakang 10 kali, lalu miringkan kepala ke satu sisi dan tahan 20 detik tanpa memaksa. Ganti sisi satunya.",
    "🧱 Skin barrier itu seperti tembok bata pelindung kulit. Terlalu banyak scrub dan produk aktif bisa meretakkannya, kulit jadi perih dan gampang breakout. Kalau kulit protes, kurangi langkah.",
    "🥤 Rasa haus sering baru muncul saat tubuh sudah agak kekurangan cairan. Taruh botol minum di samping laptop supaya gampang dicicil.",
    "🧴 Sunscreen idealnya diulang tiap 2–3 jam kalau kena matahari langsung. Kalau seharian di dalam ruangan, aplikasi pagi biasanya cukup, kecuali duduk dekat jendela.",
    "🚶‍♀️ Berdiri dan jalan 2–5 menit setiap satu jam duduk membantu sirkulasi darah dan mengurangi pegal di punggung.",
    "😷 Masker yang lembap karena napas dan keringat bisa memicu jerawat. Ganti kalau sudah basah, dan bersihkan wajah dengan lembut.",
    "☕ Ngantuk jam 2–3 siang itu normal, ritme tubuh memang menurun di jam itu. Cahaya terang, air putih, dan jalan sebentar sering lebih membantu daripada kopi ketiga."
  ],
  m: [
    "🌙 Saat tidur, kulit lebih aktif memperbaiki diri. Jadi tidur cukup itu salah satu skincare gratis yang paling ampuh.",
    "🌸 Memencet jerawat bisa mendorong radang lebih dalam dan memperbesar risiko bekas gelap atau luka. Lebih aman: kompres dingin sebentar atau tempel pimple patch hydrocolloid, lalu biarkan tenang.",
    "📱 Cahaya biru layar di malam hari bisa menekan melatonin, hormon pengantar tidur. Turunkan kecerahan, aktifkan Night Shift, dan beri jeda layar 30 menit sebelum tidur.",
    "🧼 Cuci muka malam cukup 30–60 detik, pelan, dengan ujung jari. Sunscreen, keringat, dan debu seharian memang perlu dibersihkan.",
    "🛏️ Ganti sarung bantal 1–2 kali seminggu. Minyak, keringat, dan sel kulit mati menumpuk di sana, dan itu bisa mengganggu kulit yang sedang breakout.",
    "🫖 Habis kerja malam, beri tubuhmu jeda 20–30 menit: lampu redup, layar dijauhkan, tarik napas 4 hitungan dan hembuskan 6 hitungan. Otak yang tadi fokus butuh waktu untuk turun gigi.",
    "💤 Kurang tidur membuat tubuh memproduksi lebih banyak hormon stres (kortisol), dan itu bisa ikut memperparah breakout. Tidur adalah bagian dari perawatan kulit.",
    "💧 Kulit cenderung kehilangan lebih banyak air di malam hari, jadi pelembap malam yang lembut membantu menjaga barrier kulit sampai pagi.",
    "🎀 Tidur terlentang atau miring dengan bantal yang tidak terlalu tinggi menjaga leher tetap netral, jadi bangun pagi nggak terasa kaku.",
    "📔 Menulis 3 hal kecil yang berjalan baik hari ini sebelum tidur membantu banyak orang merasa lebih tenang. Satu kalimat per hal juga cukup."
  ]
};
const FACT_LBL = { p: ["🌅", "Bisikan Pagi", "04.00–11.59"], s: ["☀️", "Bisikan Siang–Sore", "12.00–18.59"], m: ["🌙", "Bisikan Malam", "19.00–03.59"] };
let factOff = { k: "", n: 0 };
const ymd = (t = new Date()) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
function factShift() { const h = new Date().getHours(); return h >= 4 && h < 12 ? "p" : h >= 12 && h < 19 ? "s" : "m"; }
function factNow() {
  const sh = factShift(), pool = FACTS[sh], t = new Date(Date.now() - 4 * 36e5);
  const doy = Math.floor((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - Date.UTC(t.getFullYear(), 0, 0)) / 864e5);
  const k = ymd(t) + sh;
  if (factOff.k !== k) factOff = { k, n: 0 };
  return { sh, text: pool[(doy * 3 + factOff.n) % pool.length] };
}
function nextFact() { factNow(); factOff.n++; render(); }
function renderWhisperCard() {
  const f = factNow(), L = FACT_LBL[f.sh];
  return `<div class="whisper">
    <span class="eyebrow">${L[0]} Daily Beauty &amp; Wellness Whisper · ${L[1]}</span>
    <p>${E(f.text)}</p>
    <div class="row" style="justify-content:space-between">
      <small class="mut">Berganti otomatis 3× sehari (${L[2]})</small>
      <button class="chip" onclick="nextFact()">↻ Fakta Lain</button>
    </div>
  </div>`;
}

/* ===== NEW: My Coquette Reading Nook + TBR Shelf (S.books) ===== */
const bkId = () => "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
function defBooks() {
  return { cur: null, days: {}, done: [], tbr: [
    { id: "t1", title: "No Longer Human", author: "Osamu Dazai", totalPages: 0 },
    { id: "t2", title: "The Comfort Book", author: "Matt Haig", totalPages: 0 },
    { id: "t3", title: "Berani Tidak Disukai", author: "Ichiro Kishimi & Fumitake Koga", totalPages: 0 }
  ] };
}
function normBooks() {
  const b = S.books;
  if (!b || typeof b !== "object" || Array.isArray(b)) { S.books = defBooks(); return; }
  if (!Array.isArray(b.tbr)) b.tbr = defBooks().tbr;
  if (!Array.isArray(b.done)) b.done = [];
  if (!b.days || typeof b.days !== "object" || Array.isArray(b.days)) b.days = {};
  if (!b.cur || typeof b.cur !== "object") b.cur = null;
}
function bookStreak() {
  const d = S.books.days || {};
  const ago = i => { const t = new Date(); t.setHours(12, 0, 0, 0); t.setDate(t.getDate() - i); return ymd(t); };
  let n = 0;
  for (let i = 0; i < 400; i++) {
    if (d[ago(i)]) n++;
    else if (i === 0) continue;
    else if (d[ago(i + 1)]) continue;
    else break;
  }
  return n;
}
function bookAuraPts() { return Math.min(2, Object.keys(S.books.days || {}).length * 0.3); }
function bkPct(c) { return c && c.totalPages > 0 ? Math.min(100, Math.round((c.currentPage || 0) / c.totalPages * 100)) : 0; }
function bkBar(c) { const p = bkPct(c); return `<div class="rrow"><div class="rbar"><i style="width:${p}%"></i></div><span>🎀</span><b>${p}%</b></div>`; }
function bkTouch(n = 0) {
  const B = S.books, k = ymd(), first = !B.days[k];
  B.days[k] = Math.max(1, (B.days[k] || 0) + Math.max(0, n));
  if (!first) return;
  const s = bookStreak();
  addJarProof(`Meluangkan waktu membaca${B.cur ? " “" + B.cur.title + "”" : ""} 📖`, todayN(), true);
  if ([3, 7, 14, 30, 60, 100].includes(s)) addJarProof(`Reading streak ${s} hari 🌸`, todayN(), true);
  toast(`Reading streak ${s} 🌸 · aura Main Character bertambah ✨`);
}
function bkAdd(n) {
  const c = S.books.cur; if (!c) return;
  const max = c.totalPages > 0 ? c.totalPages : 99999, old = c.currentPage || 0;
  c.currentPage = Math.min(max, Math.max(0, old + n));
  const diff = c.currentPage - old;
  if (diff > 0) bkTouch(diff);
  if (c.totalPages > 0 && c.currentPage >= c.totalPages && diff > 0) toast("Halaman terakhir! Tandai selesai ya 🎀");
  save(); render();
}
function bkSetPage(v) { const c = S.books.cur; if (c) bkAdd(Math.round(+v || 0) - (c.currentPage || 0)); }
function bkCheck() {
  if (S.books.days[ymd()]) toast("Hari ini sudah tercatat 🌸"); else bkTouch(0);
  save(); render();
}
function bkQuote(v) { if (S.books.cur) { S.books.cur.quote = v; save(); } }
function bkDoneQuote(id, v) { const b = S.books.done.find(x => x.id === id); if (b) { b.quote = v; save(); } }
function bkFinish() {
  const B = S.books, c = B.cur; if (!c) return;
  B.done.unshift({ id: c.id, title: c.title, author: c.author, totalPages: c.totalPages, quote: c.quote || "", at: Date.now() });
  B.cur = null;
  addJarProof(`Selesai membaca “${c.title}” 🎀`, todayN(), true);
  toast("Satu buku selesai dibaca! 🎀"); save(); render();
}
function bkStart(id) {
  const B = S.books;
  const run = () => {
    if (B.cur) B.tbr.push(B.cur);
    const it = B.tbr.splice(B.tbr.findIndex(x => x.id === id), 1)[0]; if (!it) return;
    B.cur = { id: it.id, title: it.title, author: it.author, totalPages: it.totalPages || 0, currentPage: it.currentPage || 0, quote: it.quote || "" };
    save(); render();
    if (!B.cur.totalPages) bookSheet("cur"); else toast("Selamat membaca 📖");
  };
  if (!B.tbr.some(x => x.id === id)) return;
  B.cur ? ask("Ganti buku yang sedang dibaca?", "Buku saat ini akan kembali ke daftar keinginan beserta progresnya.", "Ya, Ganti", run) : run();
}
function bkDel(kind, id) {
  ask("Hapus buku ini?", "Data buku ini akan dihapus dari rakmu.", "Hapus", () => {
    if (kind === "cur") S.books.cur = null; else S.books[kind] = S.books[kind].filter(x => x.id !== id);
    save(); render();
  });
}
function bookSheet(kind, id) {
  const B = S.books, b = kind === "cur" ? B.cur : kind === "tbr" ? B.tbr.find(x => x.id === id) : null;
  if (kind !== "new" && !b) return;
  sheet(`<span class="eyebrow">My Reading Wishlist</span>
    <h3>${kind === "new" ? "Tambah Buku Impian 📚" : "Edit Buku 🎀"}</h3>
    <label class="q" for="bkT">Judul</label><input type="text" id="bkT" style="width:100%" value="${E(b ? b.title : "")}">
    <label class="q" for="bkA">Penulis</label><input type="text" id="bkA" style="width:100%" value="${E(b ? b.author : "")}">
    <label class="q" for="bkP">Total halaman ${kind === "cur" ? "(untuk progress bar)" : "(opsional)"}</label><input type="number" id="bkP" min="0" inputmode="numeric" style="width:100%" value="${b && b.totalPages ? b.totalPages : ""}">
    <div class="row" style="margin-top:10px"><button class="btn" onclick="bkSave('${kind}','${id || ""}')">Simpan</button></div>`);
}
function bkSave(kind, id) {
  const B = S.books, t = $("#bkT").value.trim(), a = $("#bkA").value.trim(), p = Math.max(0, parseInt($("#bkP").value, 10) || 0);
  if (!t) { toast("Judul bukunya diisi dulu ya 🌸"); return; }
  if (kind === "new") B.tbr.push({ id: bkId(), title: t, author: a, totalPages: p });
  else {
    const b = kind === "cur" ? B.cur : B.tbr.find(x => x.id === id); if (!b) return;
    b.title = t; b.author = a; b.totalPages = p;
    if (kind === "cur" && p > 0 && (b.currentPage || 0) > p) b.currentPage = p;
  }
  $("#sheet").close(); save(); render(); toast("Tersimpan di rak bukumu 📚");
}
function renderNookMini() {
  const B = S.books, c = B.cur, done = !!B.days[ymd()];
  return `<div class="card nook-mini">
    <div class="bk-top">${ART.book}<div>
      <span class="eyebrow">My Coquette Reading Nook · Streak ${bookStreak()} 🌸</span>
      <h3 style="font-size:1.15rem">${c ? E(c.title) : "Pilih bacaan berikutnya"}</h3>
      ${c ? `${bkBar(c)}<small class="mut">Hal ${c.currentPage || 0} dari ${c.totalPages || "?"}</small>` : `<small class="mut">${B.tbr.length} buku menunggu di rak keinginanmu</small>`}
    </div></div>
    <div class="row">
      <button class="chip on" onclick="bkCheck()">${done ? "✓ Tercatat Hari Ini" : "✓ Sudah Baca Hari Ini"}</button>
      ${c ? `<button class="chip" onclick="bkAdd(1)">+1 Hal</button>` : ""}
      <button class="chip" onclick="go('diary')">Buka Nook →</button>
    </div>
  </div>`;
}
function renderNookCard() {
  const B = S.books, c = B.cur, st = bookStreak(), done = !!B.days[ymd()];
  let h = `<section class="diary-reading-summary tier-quiet">
    <div class="boutique-hdr"><span class="boutique-hdr-title">My Coquette Reading Nook</span></div>
    <div class="bk-top">${ART.book}<div>
      <span class="eyebrow">📖 Sedang Dibaca · Reading Streak ${st} 🌸</span>
      ${c ? `<h3>${E(c.title)}</h3><small class="mut">${E(c.author || "Penulis belum diisi")}</small>` : `<h3>Belum ada buku di tanganmu</h3><small class="mut">Pilih satu dari rak keinginan di bawah ✨</small>`}
    </div></div>`;
  if (c) {
    const fin = c.totalPages > 0 && (c.currentPage || 0) >= c.totalPages;
    h += `${bkBar(c)}
    <p class="diary-reading-progress">Halaman ${c.currentPage || 0} dari ${c.totalPages || "?"}${c.totalPages ? "" : " · atur total halaman lewat Edit"}</p></section>
    <div class="card diary-reading-controls tier-primary">
    <div class="chips">
      <button class="chip on" onclick="bkAdd(1)">+1 Hal</button>
      <button class="chip on" onclick="bkAdd(5)">+5 Hal</button>
      <button class="chip on" onclick="bkAdd(10)">+10 Hal</button>
      <input type="number" class="bk-pg" min="0" inputmode="numeric" value="${c.currentPage || 0}" onchange="bkSetPage(this.value)" aria-label="Halaman saat ini">
    </div>
    <label class="q" for="bkQ">✦ Kutipan favoritku dari buku ini</label>
    <textarea id="bkQ" rows="2" placeholder="Tulis kalimat yang menyentuh hatimu..." oninput="bkQuote(this.value)">${E(c.quote)}</textarea>
    <div class="row" style="margin-top:8px">
      <button class="btn" onclick="bkCheck()">${done ? "✓ Tercatat Hari Ini" : "✓ Sudah Baca Hari Ini"}</button>
      <button class="${fin ? "btn" : "chip"}" onclick="bkFinish()">${fin ? "Selesai 🎀" : "Tandai Selesai"}</button>
      <button class="chip" onclick="bookSheet('cur')">✎ Edit</button>
      <button class="chip" onclick="bkDel('cur')">🗑</button>
    </div></div>`;
  } else {
    h += `</section><div class="card diary-reading-controls tier-primary"><div class="row"><button class="btn" onclick="bkCheck()">${done ? "✓ Tercatat Hari Ini" : "✓ Sudah Baca Hari Ini"}</button></div></div>`;
  }
  h += `<section class="diary-reading-list tier-quiet"><div class="boutique-hdr"><span class="boutique-hdr-title">My Reading Wishlist · TBR Shelf</span></div>`;
  h += B.tbr.length ? B.tbr.map(x => `<div class="bk-item">
      <div><b>${E(x.title)}</b><br><small class="mut">${E(x.author || "")}${x.totalPages ? " · " + x.totalPages + " hal" : ""}</small></div>
      <div class="row"><button class="chip on" onclick="bkStart('${x.id}')">Mulai Baca 📖</button><button class="chip" onclick="bookSheet('tbr','${x.id}')">✎</button><button class="chip" onclick="bkDel('tbr','${x.id}')">🗑</button></div>
    </div>`).join("") : `<div class="empty">Rak keinginanmu masih kosong. Tambah satu buku impian 🌸</div>`;
  h += `<div class="card diary-reading-add"><button class="btn ghost" onclick="bookSheet('new')">+ Tambah Buku Baru</button></div>`;
  if (B.done.length) {
    h += `<div class="boutique-hdr"><span class="boutique-hdr-title">Sudah Selesai Dibaca (${B.done.length})</span></div>`;
    h += B.done.map(x => `<div class="bk-item" style="display:block">
      <div class="row" style="justify-content:space-between"><span><b>✓ ${E(x.title)}</b> <small class="mut">${E(x.author || "")}</small></span><button class="chip" onclick="bkDel('done','${x.id}')">🗑</button></div>
      <textarea rows="2" placeholder="Kutipan favoritku..." onchange="bkDoneQuote('${x.id}',this.value)">${E(x.quote)}</textarea>
    </div>`).join("");
  }
  return h + `</section>`;
}

/* ===== NEW: Ilustrasi vintage coquette beranimasi pengganti foto yang gagal dimuat ===== */
const CF_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="cfRib" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbc6d0"/><stop offset="1" stop-color="#e48a9d"/></linearGradient>
<radialGradient id="cfFawn" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f0cfa6"/><stop offset="1" stop-color="#c8955f"/></radialGradient>
<radialGradient id="cfBear" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#f6d9b2"/><stop offset="1" stop-color="#d09f6e"/></radialGradient>
<radialGradient id="cfBun" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#fbf0e2"/><stop offset="1" stop-color="#d9bea1"/></radialGradient>
<radialGradient id="cfWool" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#ecd8c4"/></radialGradient>
<radialGradient id="cfEye" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#7a5348"/><stop offset="1" stop-color="#1e1210"/></radialGradient>
</defs></svg>`;
const CF_EYE = (x, y, r = 3) => `<g class="cf-bl"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#cfEye)"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .35}" fill="#fff"/><circle cx="${x + r * .3}" cy="${y + r * .35}" r="${r * .18}" fill="#fff" opacity=".7"/></g>`;
const CF_BL = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.6" fill="#f2a1ae" opacity=".55"/>`;
const CF_BOW = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><g class="cf-sway"><path d="M0 0 C-8 -9 -15 -5 -12 1 C-10 6 -3 4 0 0 Z M0 0 C8 -9 15 -5 12 1 C10 6 3 4 0 0 Z" fill="url(#cfRib)" stroke="#c9707f" stroke-width=".8"/><circle r="2.2" fill="#e48a9d" stroke="#c9707f" stroke-width=".7"/><path d="M-1 2 L-4 9 M1 2 L4 9" stroke="#e48a9d" stroke-width="2" stroke-linecap="round"/></g></g>`;
const CF_SHADOW = `<ellipse cx="50" cy="93" rx="26" ry="3.5" fill="#9e525d" opacity=".15"/>`;
const CF_PET = `<g fill="#f6b8c4"><ellipse class="cf-p" cx="14" cy="4" rx="2.4" ry="1.4"/><ellipse class="cf-p" style="animation-delay:-2.4s" cx="84" cy="0" rx="2.4" ry="1.4"/><ellipse class="cf-p" style="animation-delay:-4.6s" cx="62" cy="6" rx="2.2" ry="1.3"/></g>`;
const CF_BG = ["cf-floral", "cf-cream", "cf-stripe", "cf-rosy"];
const CF_ART = [
  /* rusa berpita */ () => `${CF_SHADOW}<g class="cf-b">
    <g stroke-linecap="round" stroke="#c8955f" stroke-width="5"><line x1="40" y1="68" x2="40" y2="88"/><line x1="47" y1="70" x2="48" y2="89"/><line x1="64" y1="70" x2="63" y2="89"/><line x1="71" y1="68" x2="72" y2="88"/></g>
    <g fill="#6b4a40"><ellipse cx="40" cy="89" rx="3" ry="1.8"/><ellipse cx="48" cy="90" rx="3" ry="1.8"/><ellipse cx="63" cy="90" rx="3" ry="1.8"/><ellipse cx="72" cy="89" rx="3" ry="1.8"/></g>
    <ellipse cx="81" cy="54" rx="3.5" ry="5.5" transform="rotate(-30 81 54)" fill="#fff6ec"/>
    <ellipse cx="57" cy="60" rx="24" ry="14" fill="url(#cfFawn)"/>
    <path d="M38 58 C34 50 33 44 36 38 L47 42 C48 50 50 54 53 60 Z" fill="url(#cfFawn)"/>
    <g fill="#fcefdf" opacity=".9"><circle cx="50" cy="55" r="1.7"/><circle cx="58" cy="52" r="1.6"/><circle cx="66" cy="56" r="1.8"/><circle cx="74" cy="58" r="1.5"/><circle cx="55" cy="63" r="1.5"/><circle cx="63" cy="65" r="1.6"/><circle cx="71" cy="64" r="1.3"/><circle cx="46" cy="49" r="1.3"/></g>
    <g class="cf-w"><ellipse cx="29" cy="24" rx="4" ry="9" transform="rotate(-18 29 24)" fill="url(#cfFawn)"/><ellipse cx="29" cy="25" rx="2" ry="6" transform="rotate(-18 29 25)" fill="#f4b8c0"/></g>
    <g class="cf-w" style="animation-delay:-1.1s"><ellipse cx="42" cy="25" rx="4" ry="9" transform="rotate(18 42 25)" fill="url(#cfFawn)"/><ellipse cx="42" cy="26" rx="2" ry="6" transform="rotate(18 42 26)" fill="#f4b8c0"/></g>
    <ellipse cx="33" cy="36" rx="13" ry="11" fill="url(#cfFawn)"/><ellipse cx="22.5" cy="41" rx="7.5" ry="5.5" fill="#f6dcc0"/><ellipse cx="17" cy="40" rx="2.4" ry="1.8" fill="#5b3a30"/>
    ${CF_EYE(29, 34, 3.1)}${CF_BL(30, 41)}${CF_BOW(39, 27, .7, 15)}${CF_BOW(43, 50, 1.1, -10)}</g>`,
  /* teddy bear */ () => `${CF_SHADOW}<g class="cf-b">
    <circle cx="31" cy="23" r="9" fill="url(#cfBear)"/><circle cx="31" cy="23" r="4.5" fill="#f4c9c3"/><circle cx="69" cy="23" r="9" fill="url(#cfBear)"/><circle cx="69" cy="23" r="4.5" fill="#f4c9c3"/>
    <ellipse cx="50" cy="77" rx="21" ry="17" fill="url(#cfBear)"/>
    <ellipse cx="29" cy="74" rx="6" ry="10" transform="rotate(20 29 74)" fill="url(#cfBear)"/><ellipse cx="71" cy="74" rx="6" ry="10" transform="rotate(-20 71 74)" fill="url(#cfBear)"/>
    <path d="M32 66 Q50 76 68 66 L66 74 Q50 84 34 74 Z" fill="#fbd9e0"/><g fill="#fff0f3" stroke="#f2b5c2" stroke-width=".7"><circle cx="35" cy="72" r="3.2"/><circle cx="41" cy="76" r="3.2"/><circle cx="47" cy="78" r="3.2"/><circle cx="53" cy="78" r="3.2"/><circle cx="59" cy="76" r="3.2"/><circle cx="65" cy="72" r="3.2"/></g>
    <circle cx="50" cy="44" r="23" fill="url(#cfBear)"/><ellipse cx="50" cy="52" rx="10.5" ry="8" fill="#fbecd6"/><ellipse cx="50" cy="48.5" rx="3.4" ry="2.4" fill="#5b3a30"/>
    <path d="M50 51 L50 54 M45.5 54.5 Q50 58 54.5 54.5" stroke="#5b3a30" stroke-width="1" fill="none" stroke-linecap="round"/>
    ${CF_EYE(40, 40, 3.2)}${CF_EYE(60, 40, 3.2)}${CF_BL(33, 48)}${CF_BL(67, 48)}${CF_BOW(66, 21, 1.1, 20)}</g>`,
  /* kelinci plush telinga turun */ () => `${CF_SHADOW}<g class="cf-b">
    <ellipse cx="50" cy="76" rx="20" ry="17" fill="url(#cfBun)"/><ellipse cx="50" cy="80" rx="11" ry="11" fill="#fff8ee" opacity=".7"/><ellipse cx="42" cy="90" rx="6" ry="3.5" fill="#f3e4d1"/><ellipse cx="58" cy="90" rx="6" ry="3.5" fill="#f3e4d1"/>
    <g class="cf-w" style="transform-origin:50% 10%"><ellipse cx="29" cy="50" rx="8" ry="19" transform="rotate(12 29 50)" fill="url(#cfBun)"/><ellipse cx="30" cy="52" rx="4" ry="13" transform="rotate(12 30 52)" fill="#f6c7ca"/></g>
    <g class="cf-w" style="transform-origin:50% 10%;animation-delay:-1.1s"><ellipse cx="71" cy="50" rx="8" ry="19" transform="rotate(-12 71 50)" fill="url(#cfBun)"/><ellipse cx="70" cy="52" rx="4" ry="13" transform="rotate(-12 70 52)" fill="#f6c7ca"/></g>
    <ellipse cx="50" cy="44" rx="20" ry="18" fill="url(#cfBun)"/><ellipse cx="50" cy="51" rx="9" ry="6.5" fill="#fff6ea"/><path d="M47 48 Q50 46 53 48 Q50 52 47 48 Z" fill="#f09aa8"/>
    <path d="M50 51 L50 53 M46.5 54 Q50 57 53.5 54" stroke="#b86f78" stroke-width=".9" fill="none" stroke-linecap="round"/>
    ${CF_EYE(41, 42, 3)}${CF_EYE(59, 42, 3)}${CF_BL(35, 50)}${CF_BL(65, 50)}${CF_BOW(50, 64, 1.2, 0)}${CF_BOW(62, 29, .7, 25)}</g>`,
  /* domba berbulu lembut */ () => `${CF_SHADOW}<g class="cf-b">
    <ellipse cx="50" cy="76" rx="22" ry="16" fill="url(#cfWool)"/>
    <g fill="url(#cfWool)" stroke="#ead6c2" stroke-width=".6">${Array.from({ length: 10 }, (_, i) => { const a = i / 10 * 6.283; return `<circle cx="${(50 + Math.cos(a) * 20).toFixed(1)}" cy="${(50 + Math.sin(a) * 19).toFixed(1)}" r="9.5"/>`; }).join("")}<circle cx="38" cy="86" r="7"/><circle cx="50" cy="89" r="7"/><circle cx="62" cy="86" r="7"/></g>
    <g class="cf-w"><ellipse cx="27" cy="46" rx="4.5" ry="8" transform="rotate(-60 27 46)" fill="#f2bdc0" stroke="#e29aa3" stroke-width=".7"/></g><g class="cf-w" style="animation-delay:-1.1s"><ellipse cx="73" cy="46" rx="4.5" ry="8" transform="rotate(60 73 46)" fill="#f2bdc0" stroke="#e29aa3" stroke-width=".7"/></g>
    <ellipse cx="50" cy="50" rx="13" ry="14.5" fill="#fbeee0"/><ellipse cx="50" cy="56" rx="4" ry="3" fill="#f3b3bb"/><path d="M47 59 Q50 61.5 53 59" stroke="#b86f78" stroke-width=".9" fill="none" stroke-linecap="round"/>
    ${CF_EYE(44, 48, 3)}${CF_EYE(56, 48, 3)}${CF_BL(39, 55)}${CF_BL(61, 55)}${CF_BOW(36, 33, .9, -20)}
    <g><circle cx="63" cy="34" r="5" fill="#f4a9b6"/><circle cx="63" cy="34" r="3" fill="#f08fa0"/><circle cx="63" cy="34" r="1.3" fill="#f4a9b6"/></g></g>`
];
const cfBad = new Set();
function cfSwap(img, perm = true) {
  if (!img || !img.isConnected) return;
  const s = img.getAttribute("src") || "";
  if (perm && s && s.slice(0, 5) !== "data:") cfBad.add(s);
  let h = 0; for (let i = 0; i < Math.min(s.length, 400); i += 5) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const k = h % CF_ART.length, d = document.createElement("div");
  d.className = ("cute-fb " + CF_BG[k] + " " + (img.className || "")).trim();
  const st = img.getAttribute("style"); if (st) d.setAttribute("style", st);
  d.style.display = "flex";
  d.setAttribute("role", "img");
  d.setAttribute("aria-label", (img.alt || "Foto") + " (ilustrasi pengganti)");
  d.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${CF_ART[k]()}${CF_PET}</svg>`;
  img.replaceWith(d);
}
function cfSweep(root) {
  (root || document).querySelectorAll("img").forEach(img => {
    const s = img.getAttribute("src") || "";
    if (!s || cfBad.has(s) || (img.complete && img.naturalWidth === 0)) cfSwap(img);
    else if (!img.complete) setTimeout(() => { if (img.isConnected && !img.complete) cfSwap(img, false); }, 7000);
  });
}
document.body.insertAdjacentHTML("afterbegin", CF_DEFS);
document.addEventListener("error", e => { if (e.target && e.target.tagName === "IMG") cfSwap(e.target); }, true);

const dflt = () => ({
  start: D0(new Date()).getTime(),
  done: {}, low: {}, j: {}, skin: {}, wk: {}, photos: [], lowMode: false, periodMode: false, theme: null,
  sch: mkSch(), fit: true, ci: {}, rest: {}, skip: {}, acts: {}, ach: {}, gifts: {},
  fx: { fav: {}, nope: {}, log: [], seen: {} }, ovr: {}, spa: {}, rescue: {},
  vanity: DEFAULT_VANITY, lookbook: DEFAULT_LOOKBOOK, media: DEFAULT_MEDIA, jar: DEFAULT_JAR, books: defBooks(),
  muse: { preset: 0, custom: null, motto: "Elegance in gentle pace, confidence in my own skin." },
  archive: {
    calmSkin: "Centella soothing cream, cleanser lembut, sunscreen ringan",
    lipCombo: "Glad2Glow cushion, Gouté powder, Luxcrime contour & Emina blush",
    hairLook: "Rambut terawat hair mask, half-up ribbon / soft waves",
    outfit: "Blouse/kemeja nyaman & celana rapi yang effortless ke kampus",
    feelPretty: "Rambut wangi habis mandi utama, kulit tenang, dan bahu yang tegak"
  }
});

let S;
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
  S = Object.assign(dflt(), raw);
  if (!S.sch) S.sch = mkSch();
  ["ci", "rest", "skip", "acts", "ach", "gifts", "ovr", "spa", "rescue"].forEach(k => { if (!S[k]) S[k] = {}; });
  if (!S.muse) S.muse = dflt().muse;
  if (!S.archive) S.archive = dflt().archive;
  if (!S.fx) S.fx = { fav: {}, nope: {}, log: [], seen: {} };
  if (!Array.isArray(S.vanity) || !S.vanity.length) S.vanity = DEFAULT_VANITY;
  if (!Array.isArray(S.lookbook) || S.lookbook.length < 3) S.lookbook = DEFAULT_LOOKBOOK;
  if (!Array.isArray(S.media) || !S.media.length) S.media = DEFAULT_MEDIA;
  if (!Array.isArray(S.jar) || !S.jar.length) S.jar = DEFAULT_JAR;
  normBooks();
} catch (e) {
  S = dflt();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); window.__repoSave?.(S); return true; }
  catch (e) { toast("Penyimpanan penuh. Coba hapus beberapa foto lama."); return false; }
}

const todayN = () => Math.min(30, Math.max(1, Math.round((D0(new Date()) - S.start) / 864e5) + 1));
let sel = todayN(), tab = "today", pop = null, ciOpen, allOpen = false, openCat = {}, sA = "fx", sP = "kol", ed = 1, ni = -1, mCat = "all", curVanityIdx = 0, curLookIdx = 0, scheduleEditorOpen = false;

const dateOf = d => new Date(S.start + (d - 1) * 864e5).toLocaleDateString("id-ID", { weekday: "short", month: "short", day: "numeric" });
const dow = d => new Date(S.start + (d - 1) * 864e5).getDay();
const ovrOf = d => S.ovr[d] || (S.ovr[d] = {});
const jd = d => S.j[d] || (S.j[d] = {});
const sd = d => S.skin[d] || (S.skin[d] = { tags: [] });
const cd = d => S.ci[d] || (S.ci[d] = {});
const wkN = d => Math.min(4, Math.ceil(d / 7));
const wk = w => S.wk[w] || (S.wk[w] = {});
const phase = d => PHASES.find(p => d >= p[0] && d <= p[1]) || PHASES[3];

function getVanityByRole(role, fallback) {
  const item = (S.vanity || []).find(v => v.role === role && v.badge !== "Pause Dulu");
  return item ? item.name : fallback;
}

function workedLatePrevNight(d) {
  const prevW = (dow(d) + 6) % 7;
  const prevOvr = S.ovr[d - 1] || {};
  if (prevOvr.noWork) return false;
  const w = S.sch.work[prevW];
  if (!w || !w[0] || !w[1]) return false;
  const s = tm(w[0]), e = tm(w[1]);
  return s != null && e != null && e <= s;
}

function isBathDay(d) {
  const o = ovrOf(d);
  if (o.bath != null) return o.bath;
  return S.sch.bath.includes(dow(d));
}

/* ===== NEW Feature: 1-Tap Soft Cycle / PMS & Period Comfort Mode ===== */
function togglePeriodMode() {
  S.periodMode = !S.periodMode;
  const d = todayN();
  if (S.periodMode) {
    const tags = sd(d).tags;
    if (!tags.includes("Masa hormonal")) tags.push("Masa hormonal");
    addJarProof("Merawat tubuh dengan ekstra lembut di masa tamu bulanan / PMS 🌸", d, true);
    toast("Mode Tamu Bulanan / PMS aktif. Ritme harian dibuat ekstra lembut 🌸");
  } else {
    toast("Mode Tamu Bulanan dinonaktifkan.");
  }
  fx.sig = null;
  save();
  render();
}

function renderCycleBanner() {
  if (!S.periodMode) return "";
  const heroCream = getVanityByRole("moist", "Centella soothing cream");
  return `<div class="cycle-banner">
    <div class="mh">
      <span class="eyebrow">Soft Cycle &amp; PMS Comfort Mode Active</span>
      <button class="chip" style="padding:2px 8px;font-size:0.7rem" onclick="togglePeriodMode()">Matikan</button>
    </div>
    <h3>Tubuh &amp; kulitmu sedang butuh ekstra disayang</h3>
    <p>Wajar banget kalau kulit lebih gampang muncul jerawat hormonal atau badan terasa cepat lelah/pegal. Target hari ini otomatis dilonggarkan: cukup minum air hangat, pakai <b>${E(heroCream)}</b> tipis, dan istirahat tanpa beban.</p>
  </div>`;
}

const hab = d => H.filter(h => h[3] <= d && (h[0] != "mandi" || isBathDay(d)));
const HEAVY = ["post_routine", "walk", "wall", "nails", "tidy", "pillow", "clothes"];

function fit(d, h) {
  if (!S.fit || h[4]) return true;
  if (S.periodMode && HEAVY.includes(h[0])) return false;
  const o = ovrOf(d);
  const w = dow(d);
  const busyClass = !o.noClass && (w == 1 || w == 3 || w == 4);
  if (w == 1 && busyClass) return false;
  if ((w == 3 || w == 4) && busyClass) return !HEAVY.includes(h[0]);
  return true;
}

const dn = d => Object.keys(S.done[d] || {}).filter(k => (S.done[d] || {})[k] && H.some(h => h[0] == k)).length;
const hasAct = d => (S.acts[d] || []).some(a => a && a.done);
const hasJrn = d => { const j = S.j[d]; return !!(j && (j.text || j.well || j.tom || j.mood != null)); };
const hasSkn = d => { const s = S.skin[d]; return !!(s && ((s.tags && s.tags.length) || s.note)); };

const active = d => !!(S.low[d] || (S.rest && S.rest[d]) || (S.spa && S.spa[d]) || (S.rescue && S.rescue[d]) || dn(d) > 0 || hasAct(d) || hasJrn(d) || hasSkn(d));
const total = () => { let t = 0; for (let d = 1; d <= 30; d++) t += dn(d); return t; };
const daysIn = () => { let t = 0; for (let d = 1; d <= 30; d++) if (active(d)) t++; return t; };

function streak() {
  let n = 0;
  for (let d = todayN(); d >= 1; d--) {
    if (active(d)) n++;
    else if (d == todayN()) continue;
    else if (d > 1 && active(d - 1)) continue;
    else break;
  }
  return n;
}

function calcAura() {
  let skinPts = 4, poisePts = 4, cozyPts = 4, prettyPts = 4, mcPts = 4;
  for (let d = 1; d <= 30; d++) {
    const x = S.done[d] || {};
    if (x.pm_clean || x.pm_moist || x.am_clean || x.spf || x.no_pick || x.pillow) skinPts += 0.7;
    if (hasSkn(d)) skinPts += 0.4;
    if (x.post1 || x.post_routine || x.wall || x.breaks || x.walk) poisePts += 0.85;
    if (x.meal || x.sleep || x.water || x.screen || S.rest[d] || S.low[d] || S.rescue[d]) cozyPts += 0.75;
    if (x.hair || x.lotion || x.nails || x.clothes || x.mandi || S.spa[d]) prettyPts += 0.85;
    if (hasAct(d) || hasJrn(d)) mcPts += 0.75;
  }
  mcPts += Math.min(3, (S.jar || []).length * 0.35);
  mcPts += bookAuraPts();
  const clamp = v => Math.min(10, Math.round(v * 2) / 2);
  return [
    { name: "Calm Skin", icon: "🌸", val: clamp(skinPts) },
    { name: "Graceful Poise", icon: "🎀", val: clamp(poisePts) },
    { name: "Cozy Balance", icon: "🌙", val: clamp(cozyPts) },
    { name: "Pretty Energy", icon: "🪞", val: clamp(prettyPts) },
    { name: "Main Character", icon: "✨", val: clamp(mcPts) }
  ];
}

function renderHeartBar(val) {
  const full = Math.floor(val);
  let s = "";
  for (let i = 1; i <= 10; i++) s += i <= full ? "♥" : `<span class="empty-h">♡</span>`;
  return `<span class="aura-hearts" aria-label="${val} dari 10">${s}</span>`;
}

function renderAuraCard(compact = false) {
  const auras = calcAura();
  return `<div class="profile-aura-content">
    <div class="profile-aura-heading">
      <span class="eyebrow">My Era Stats &amp; Aura</span>
      <button class="home-text-action" onclick="openRecapCardModal()">📸 Cetak Poster Edisi</button>
    </div>
    <div class="profile-aura-list">
      ${auras.map(a => `<div class="aura-row">
        <span class="aura-name">${a.icon} ${E(a.name)}</span>
        <span class="aura-meter" role="progressbar" aria-label="${E(a.name)}" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${a.val}"><i style="width:${Math.max(0, Math.min(100, a.val * 10))}%"></i></span>
        <span class="aura-score">${a.val}/10</span>
      </div>`).join("")}
    </div>
  </div>`;
}

/* ===== NEW Feature: Editorial Recap Card Generator (Save Image to Phone Gallery) ===== */
function openRecapCardModal() {
  sheet(`
    <span class="eyebrow">Magazine Keepsake Poster</span>
    <h3>Kartu Edisi Mingguanmu 📸</h3>
    <p class="mut" style="margin:0 0 8px;font-size:0.83rem">Kartu ini merangkum Aura Stats, bukti kecil terbaikmu, dan produk andalanmu dalam format poster majalah Coquette. Tekan tombol di bawah untuk mengunduh gambarnya.</p>
    <div style="text-align:center">
      <canvas id="recapCanvas" width="720" height="1040" style="width:100%;max-width:310px;border-radius:16px;border:1.5px solid var(--line);box-shadow:var(--sh)"></canvas>
    </div>
    <div class="row" style="justify-content:center;margin-top:12px">
      <button class="btn" onclick="downloadRecapPoster()">⬇ Simpan Gambar ke Galeri (.PNG)</button>
    </div>
  `);
  setTimeout(drawRecapCanvas, 60);
}

function drawRecapCanvas() {
  const c = $("#recapCanvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  const W = c.width, Hc = c.height;

  // Soft Pinstripe Background (Ref 11)
  ctx.fillStyle = "#fdf1f3";
  ctx.fillRect(0, 0, W, Hc);
  ctx.fillStyle = "#fffaf7";
  for (let x = 0; x < W; x += 48) ctx.fillRect(x, 0, 24, Hc);

  // Outer & Inner Coquette Borders
  ctx.strokeStyle = "#cc8892";
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, W - 52, Hc - 52);
  ctx.strokeStyle = "#d5b895";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, W - 72, Hc - 72);

  // Header Issue Title
  ctx.fillStyle = "#8c6d66";
  ctx.font = "700 17px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`MY GLOW UP ERA  ·  ISSUE NO. ${String(todayN()).padStart(2, "0")}`, W / 2, 78);

  ctx.fillStyle = "#84362c";
  ctx.font = "italic 54px 'Cormorant Garamond', serif";
  ctx.fillText("Personal Beauty Chronicle", W / 2, 134);

  // Motto Oval Box
  ctx.fillStyle = "#fffdfb";
  ctx.strokeStyle = "#cc8892";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(70, 162, W - 140, 88, 44);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#4a302c";
  ctx.font = "italic 24px 'Cormorant Garamond', serif";
  const motto = (S.muse && S.muse.motto) ? S.muse.motto : "Elegance in gentle pace.";
  ctx.fillText(`“${motto.slice(0, 48)}”`, W / 2, 214);

  // Stats Section Box
  ctx.fillStyle = "#fffdfb";
  ctx.strokeStyle = "#ebd3ce";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(64, 276, W - 128, 330, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#9e525d";
  ctx.font = "700 18px 'Cormorant Garamond', serif";
  ctx.fillText("❦  CHARACTER AURA STATS  ❦", W / 2, 316);

  const auras = calcAura();
  auras.forEach((a, idx) => {
    const y = 364 + idx * 48;
    ctx.textAlign = "left";
    ctx.fillStyle = "#4a302c";
    ctx.font = "700 19px Inter, sans-serif";
    ctx.fillText(`${a.icon}  ${a.name.toUpperCase()}`, 96, y);

    let hearts = "";
    for (let i = 1; i <= 10; i++) hearts += i <= Math.floor(a.val) ? "♥ " : "♡ ";
    ctx.fillStyle = "#cc8892";
    ctx.font = "22px sans-serif";
    ctx.fillText(hearts, 290, y);

    ctx.textAlign = "right";
    ctx.fillStyle = "#764c43";
    ctx.font = "700 22px 'Cormorant Garamond', serif";
    ctx.fillText(`${a.val}/10`, W - 96, y);
  });

  // Dossier Box
  const ar = S.archive || dflt().archive;
  ctx.fillStyle = "#fffaf7";
  ctx.strokeStyle = "#d5b895";
  ctx.beginPath();
  ctx.roundRect(64, 632, W - 128, 210, 22);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#9e525d";
  ctx.font = "700 18px 'Cormorant Garamond', serif";
  ctx.fillText("❦  MY SIGNATURE DOSSIER  ❦", W / 2, 670);

  const rows = [
    ["SKIN HERO", ar.calmSkin],
    ["LIP & MAKEUP", ar.lipCombo],
    ["GO-TO LOOK", ar.outfit]
  ];
  rows.forEach((r, idx) => {
    const y = 712 + idx * 40;
    ctx.textAlign = "left";
    ctx.fillStyle = "#8c6d66";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.fillText(r[0], 96, y);
    ctx.fillStyle = "#4a302c";
    ctx.font = "600 17px Inter, sans-serif";
    ctx.fillText(String(r[1] || "").slice(0, 38), 235, y);
  });

  // Little Proof Quote Footer
  const jarList = S.jar || [];
  const latestJar = jarList.length ? jarList[jarList.length - 1].t : "Hadir dengan lembut untuk diriku sendiri.";
  ctx.fillStyle = "#fae3e6";
  ctx.beginPath();
  ctx.roundRect(64, 868, W - 128, 96, 20);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#84362c";
  ctx.font = "700 14px Inter, sans-serif";
  ctx.fillText("LITTLE PROOF JAR HIGHLIGHT", W / 2, 898);
  ctx.fillStyle = "#4a302c";
  ctx.font = "italic 21px 'Cormorant Garamond', serif";
  ctx.fillText(`“${latestJar.slice(0, 52)}”`, W / 2, 934);

  ctx.fillStyle = "#8c6d66";
  ctx.font = "600 15px Inter, sans-serif";
  ctx.fillText(`${daysIn()} Days Present  ·  Soft Streak ${streak()} 🌷  ·  ${ (S.jar || []).length } Proofs Collected`, W / 2, 994);
}

let DL = null;
try {
  if (window.claude && window.claude.use) {
    window.claude.use("downloads").then(d => { DL = d || null; }).catch(() => {});
  }
} catch (e) {}

function offerFile(filename, data, okMsg) {
  return DL.save({ filename, data }).then(
    () => toast(okMsg),
    e => { if (!e || e.code !== "declined") toast("File belum bisa disimpan dari halaman ini."); }
  );
}

function downloadRecapPoster() {
  const c = $("#recapCanvas");
  if (!c) return;
  const name = `My_Glow_Up_Era_Day_${todayN()}.png`;
  if (DL) {
    c.toBlob(blob => { if (blob) offerFile(name, blob, "Poster Edisi tersimpan 📸"); }, "image/png");
    return;
  }
  const img = new Image();
  img.src = c.toDataURL("image/png");
  img.alt = "Poster Edisi";
  img.style.cssText = "width:100%;max-width:310px;border-radius:16px;border:1.5px solid var(--line);box-shadow:var(--sh)";
  c.parentNode.replaceChild(img, c);
  toast("Tekan lama gambarnya, lalu pilih Simpan ke Foto 📸");
}

function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.className = "s";
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = "", 2500);
}

function ask(t, b, y, fn) {
  $("#dT").textContent = t; $("#dB").textContent = b; $("#dYes").textContent = y;
  $("#dYes").onclick = () => { $("#dlg").close(); fn(); };
  $("#dNo").onclick = () => $("#dlg").close();
  $("#dlg").showModal();
}

const QN = { skin: "Calm Skin Ritual", body: "Graceful Posture", self: "Pretty & Cozy Care", dig: "Digital Balance", rest: "Rest & Recovery" };
const QI = {
  skin: "M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z",
  body: "M12 3.5a1.8 1.8 0 1 0 .01 0M12 8v6M7.5 10.5h9M9.5 21l2.5-7 2.5 7",
  self: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z",
  dig: "M8 3h8v18H8zM11 18h2",
  rest: "M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10z",
  ck: "M5 12l5 5 9-10", home: "M4 11l8-7 8 7v9H4zM10 20v-6h4v6", map: "M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", book: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM8 8h6", user: "M12 12a4 4 0 1 0 .01 0M5 21c0-4 3-6 7-6s7 2 7 6"
};
const ico = (k, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${QI[k]}"/></svg>`;
const QC = h => ({ alone: "dig", screen: "dig", sleep: "rest", healing: "rest", breaks: "body", post1: "body", post_routine: "body", wall: "body", walk: "body" }[h[0]] || (h[1] == "s" ? "skin" : "self"));

const LOWP = ["pm_clean", "pm_moist", "meal", "am_clean", "teeth", "spf", "post1"];

const lowish = d => {
  const c = S.ci[d] || {}, o = ovrOf(d);
  return S.lowMode || S.periodMode || o.lazy || (c.energy != null && c.energy <= 1) || (c.mood != null && c.mood <= 1) || c.time === 0 || c.type === 0;
};

function quests(d) {
  const low = lowish(d), c = S.ci[d] || {}, skTags = (S.skin[d] && S.skin[d].tags) || [];
  let l = low ? hab(d).filter(h => h[4]) : hab(d).filter(h => fit(d, h));
  l = l.slice().sort(low ? (a, b) => LOWP.indexOf(a[0]) - LOWP.indexOf(b[0]) : (a, b) => (b[3] == d) - (a[3] == d));
  if (!low && isBathDay(d)) {
    const m = l.find(h => h[0] == "mandi");
    if (m) l = [m, ...l.filter(h => h != m)];
  }
  if (!low && (skTags.includes("Jerawat baru") || skTags.includes("Terasa nyeri"))) {
    const np = l.find(h => h[0] == "no_pick");
    if (np) l = [l[0], np, ...l.filter(h => h != l[0] && h != np)];
  }
  return { main: l.slice(0, 3), bonus: (!low && c.energy >= 2) ? l[3] : null, low };
}

function prog(d) {
  const q = quests(d), sk = S.skip[d] || {}, dd = S.done[d] || {};
  const m = q.main.filter(h => !sk[h[0]]);
  const n = m.filter(h => dd[h[0]]).length;
  return { n, t: m.length, p: m.length ? Math.round(100 * n / m.length) : ((S.rest[d] || S.low[d] || S.spa[d] || S.rescue[d] || hasAct(d)) ? 100 : 0), q };
}

const ring = (p, s = 56) => `<svg width="${s}" height="${s}" viewBox="0 0 36 36" role="img" aria-label="Progres ${p}%"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--blush)" stroke-width="3"/><circle cx="18" cy="18" r="15" fill="none" stroke="var(--rose)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${p * 0.942} 94.2" transform="rotate(-90 18 18)" style="transition:stroke-dasharray .5s"/><text x="18" y="21" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="10" font-weight="700" fill="currentColor">${p}%</text></svg>`;

function qrow(h, d, b) {
  const on = (S.done[d] || {})[h[0]], s = (S.skip[d] || {})[h[0]];
  const skTags = (S.skin[d] && S.skin[d].tags) || [];
  let title = h[2], customTip = h[5];
  if (h[0] == "pm_moist") {
    const prod = getVanityByRole("moist", null);
    if (prod) title = `Malam: oleskan tipis ${prod}`;
  } else if (h[0] == "pm_clean") {
    const prod = getVanityByRole("clean", null);
    if (prod) title = `Malam: cuci muka lembut (${prod})`;
    if (skTags.includes("Iritasi") || skTags.includes("Kering")) customTip = "Kulit sensitif: cukup bilas air biasa tanpa digosok.";
  } else if (h[0] == "spf") {
    const prod = getVanityByRole("spf", null);
    if (prod) title = `Pagi: pakai ${prod} (jika ke kampus/keluar)`;
  }
  const hasVideo = h[0] == "post1" || h[0] == "post_routine";

  return `<div class="qr ${on ? "on" : ""} ${s ? "sk" : ""}">
    <button class="qc ${pop == h[0] ? "pop" : ""}" onclick="toggle('${h[0]}',${d})" aria-pressed="${!!on}" aria-label="Selesai: ${E(title)}">${on ? ico("ck", 14) : ""}</button>
    <div class="qt">
      <span class="qn">${ico(QC(h), 12)} ${b ? "Bonus · " : ""}${QN[QC(h)]}${s ? " · dilewati" : ""}</span>
      <b>${E(title)}</b>
      ${customTip ? `<small>${E(customTip)}</small>` : ""}
      ${hasVideo ? `<button class="lk" style="padding:1px 0;font-size:0.75rem" onclick="openMediaPlay('m1')">▶ Video Panduan (Emi Wong)</button>` : ""}
    </div>
    ${on || s ? "" : `<button class="lk" onclick="skipQ('${h[0]}',${d})">lewati</button>`}
  </div>`;
}

const MS = ["Satu ritual lembut tercatat 🌷", "Pelan-pelan, kamu merawat diri dengan baik.", "Aura karaktermu bertambah ✨"];

function toggle(id, d = sel) {
  const x = S.done[d] || (S.done[d] = {}), h = H.find(h => h[0] == id);
  x[id] = !x[id];
  if (x[id]) {
    if (S.skip[d]) delete S.skip[d][id];
    pop = id;
    const p = prog(d);
    toast(p.t && p.n == p.t ? "Ritual utama selesai. Waktunya bersantai 🌙" : (h ? QN[QC(h)] : "Ritual") + " · " + MS[(d + id.length) % 3]);
  }
  save(); render(); setTimeout(() => pop = null, 700);
}

function skipQ(id, d) { (S.skip[d] || (S.skip[d] = {}))[id] = 1; if (S.done[d]) delete S.done[d][id]; save(); render(); }
function restDay(d) { S.rest[d] = !S.rest[d]; save(); render(); toast(S.rest[d] ? "Hari istirahat tercatat 🌙" : "Mode istirahat dibatalkan"); }
function setLow(v) { S.lowMode = v; save(); render(); }
function winLow() { const d = todayN(); S.low[d] = !S.low[d]; save(); render(); if (S.low[d]) toast("Hari minimal dihitung menang 🌙"); }
function setCi(d, k, i) { const c = cd(d); c[k] = c[k] === i ? null : i; if (k == "mood" || k == "energy") jd(d)[k] = c[k]; save(); render(); }
function setSel(d) { sel = d; render(); }

function toggleOvr(d, k) {
  const o = ovrOf(d);
  if (k == "bath") o.bath = !isBathDay(d); else o[k] = !o[k];
  fx.sig = null; save(); render();
}

const SPA_PACKAGES = [
  { id: "quick", name: "Paket I · Fresh & Clean Reset", dur: "10 mnt", desc: "Keramas segar + sabun wangi saat energi sedang tipis." },
  { id: "silky", name: "Paket II · Silky Hair & Bond Repair", dur: "20 mnt", desc: "Keramas + Hair Mask / Bond Repair 5 menit + pelembap wajah." },
  { id: "full", name: "Paket III · Everything Shower & Glow Spa", dur: "30 mnt", desc: "Ritual mandi utama lengkap: Hair Mask, body care & body lotion wangi." }
];

function pickSpa(d, pkgId) {
  if (S.spa[d] === pkgId) delete S.spa[d];
  else {
    S.spa[d] = pkgId;
    const x = S.done[d] || (S.done[d] = {});
    x.mandi = true;
    if (pkgId !== "quick") { x.hair = true; x.lotion = true; }
    addJarProof(`Menikmati ${SPA_PACKAGES.find(p => p.id === pkgId).name} 🛁`, d, true);
    toast("Home Salon Spa tercatat! Pretty Girl Energy bertambah ✨");
  }
  save(); render();
}

function renderSpaCard(d) {
  if (!isBathDay(d)) return "";
  const cur = S.spa[d];
  const hairProd = getVanityByRole("hair", "Hair Mask & Bond Repair");
  return `<div class="spa-card">
    <div class="mh">
      <div>
        <span class="eyebrow">Home Salon &amp; Spa Menu · Selasa / Jumat / Minggu</span>
        <h3>Reservasi Mandi Utamamu 🛁</h3>
      </div>
      <span class="pill">${cur ? "✓ Selesai" : E(hairProd)}</span>
    </div>
    ${SPA_PACKAGES.map(p => `<button class="spa-tier ${cur === p.id ? "on" : ""}" onclick="pickSpa(${d},'${p.id}')">
      <div><b>${E(p.name)} (${p.dur})</b><small class="mut" style="display:block">${E(p.desc)}</small></div>
      <span style="font-weight:700;color:var(--rose-deep)">${cur === p.id ? "✓" : "Pilih"}</span>
    </button>`).join("")}
  </div>`;
}

function openRescueModal(mode) {
  const d = todayN(), moistProd = getVanityByRole("moist", "Centella soothing cream");
  const isNight = mode === "night";
  sheet(`
    <span class="eyebrow">${isNight ? "1 AM Scanlation Wind-Down" : "Post-Class Afternoon Rescue"}</span>
    <h3>${isNight ? "Penyelamat 2 Menit Sebelum Tidur 🌙" : "Transisi Pulang Kuliah 🌸"}</h3>
    <div class="card soft" style="margin:8px 0;font-size:0.88rem">
      <p style="margin:3px 0"><b>Langkah 1 (60 dtk):</b> ${isNight ? "Bilas wajah lembut & keringkan dengan tisu wajah." : "Ganti pakaian rumah paling nyaman & bersihkan wajah."}</p>
      <p style="margin:6px 0 3px"><b>Langkah 2 (60 dtk):</b> ${isNight ? `Oles tipis <b>${E(moistProd)}</b>, rilekskan bahu di bantal.` : "Minum segelas air & ambil jeda tidur siang sebelum jam 20.00."}</p>
    </div>
    <div class="row">
      <button class="btn" onclick="completeRescue(${d}, '${mode}')">✓ Selesai 2 Menit (Catat Menang)</button>
      <button class="btn ghost" onclick="openMediaPlay('m8')">🎧 Audio Pengantar Tidur</button>
    </div>
  `);
}

function completeRescue(d, mode) {
  S.rescue[d] = mode;
  const x = S.done[d] || (S.done[d] = {});
  x.pm_clean = true; x.pm_moist = true;
  addJarProof(mode === "night" ? "Tetap merawat kulit 2 menit meski selesai kerja larut malam 🌙" : "Transisi pulang kuliah dengan lembut 🌸", d, true);
  save(); if ($("#sheet").open) $("#sheet").close(); render();
  toast("Penyelamat 2 menit tercatat! Istirahatlah dengan tenang 🌙");
}

function renderRescueBanner(d) {
  const h = new Date().getHours(), w = dow(d);
  const isLateNight = h >= 22 || h < 4;
  const isPostClass = (w == 1 || w == 3 || w == 4) && !ovrOf(d).noClass && h >= 15 && h <= 18;
  if (S.rescue[d] || (!isLateNight && !isPostClass)) return "";
  const mode = isLateNight ? "night" : "class";
  return `<div class="rescue-banner">
    <span class="eyebrow">${isLateNight ? "Late Night Scanlation Rescue" : "Post-Class Recovery"}</span>
    <h3>${isLateNight ? "Sudah selesai ngedit malam ini, cantik?" : "Baru sampai rumah habis kuliah?"}</h3>
    <p>${isLateNight ? "Aktifkan Penyelamat 2 Menit supaya kulitmu tetap kalem." : "Ambil jeda istirahatmu sebelum jam kerja pukul 20.00."}</p>
    <button class="btn" onclick="openRescueModal('${mode}')">Aktifkan Penyelamat 2 Menit</button>
  </div>`;
}

const QUICK_PROOFS = [
  "Tahan nggak ngorek jerawat hari ini 🌸", "Bahu langsung tegak waktu inget postur 🎀",
  "Ngerasa cakep & rapi waktu ngaca ✨", "Tetap cuci muka malam walau capek 🌙",
  "Berhasil istirahat tanpa rasa bersalah 🌷", "Rambut lembut habis pakai hair mask 🛁"
];

function addJarProof(txt, d = todayN(), silent = false) {
  if (!txt || !txt.trim()) return;
  if (!Array.isArray(S.jar)) S.jar = [];
  S.jar.push({ t: txt.trim(), d, at: Date.now() });
  save();
  if (!silent) { toast("Satu kelopak bukti kecil masuk toples 🌷"); render(); }
}

function openJarSheet(shake = false) {
  const list = (S.jar || []).slice().reverse();
  const picked = list.length ? list[Math.floor(Math.random() * list.length)] : null;
  sheet(`
    <span class="eyebrow">The Jar of Little Proofs</span>
    <h3>Toples Bukti Kecilku 🌷</h3>
    ${shake && picked ? `<div class="card soft" style="border:1.5px solid var(--rose);margin:8px 0">
      <span class="eyebrow">✦ Kelopak Kenangan yang Keluar:</span>
      <p style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-style:italic;margin:4px 0">“${E(picked.t)}”</p>
      <small class="mut">Tercatat pada Hari ke-${picked.d}</small>
    </div>` : ""}
    <div class="chips" style="margin-top:8px">
      ${QUICK_PROOFS.map(q => `<button class="chip" onclick="addJarProof('${q}');openJarSheet()">+ ${q}</button>`).join("")}
    </div>
    <div class="crow" style="margin-top:6px">
      <input type="text" id="jarIn" placeholder="Tulis bukti kecilmu sendiri..." style="flex:1">
      <button class="btn" onclick="addJarProof($('#jarIn').value);openJarSheet()">Simpan</button>
    </div>
    <h3 style="margin-top:12px">Isi Toplesmu (${list.length} Kelopak)</h3>
    <div style="max-height:170px;overflow-y:auto">
      ${list.map(item => `<div class="tl"><b>Hari ${item.d}</b><span>🌸 ${E(item.t)}</span></div>`).join("")}
    </div>
  `);
}

function renderJarCard(extraClass = "") {
  const cnt = (S.jar || []).length;
  const latest = cnt ? S.jar[cnt - 1] : null;
  const petals = Math.min(14, cnt);
  let petalCircles = "";
  for (let i = 0; i < petals; i++) {
    const cx = 31 + ((i * 17) % 38);
    const cy = 92 - Math.floor(i / 3) * 10 - (i % 2) * 3;
    petalCircles += `<ellipse cx="${cx}" cy="${cy}" rx="7.5" ry="4.5" transform="rotate(${(i * 35) % 180} ${cx} ${cy})" fill="${i % 2 ? "#cc8892" : "#eebbc3"}" opacity="0.9"/>`;
  }
  return `<div class="card ${extraClass}">
    <div class="jar-box">
      <div class="jar-svg-wrap" onclick="openJarSheet(true)" title="Ketuk untuk mengocok toples bukti kecil">
        <svg width="80" height="102" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="10" width="40" height="10" rx="4" fill="#d5b895" stroke="#764c43" stroke-width="1.5"/>
          <path d="M34 20 L66 20 L76 34 L76 98 C76 106 68 110 50 110 C32 110 24 106 24 98 L24 34 Z" fill="var(--blush-soft)" stroke="#cc8892" stroke-width="2"/>
          <path d="M32 24 C42 28 58 28 68 24" fill="none" stroke="#9e525d" stroke-width="1.5"/>
          ${petalCircles}
          <rect x="32" y="44" width="36" height="22" rx="4" fill="#fffcf9" stroke="#ebd3ce" stroke-width="1"/>
          <text x="50" y="58" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="700" font-size="11.5" fill="#764c43">${cnt} 🌷</text>
        </svg>
        <span class="muse-caption">Kocok Toples</span>
      </div>
      <div>
        <span class="eyebrow">The Jar of Little Proofs</span>
        <h3>Toples Bukti Kecilku (${cnt})</h3>
        <p class="mut" style="margin:2px 0 6px;font-size:0.83rem">${latest ? `Terbaru: <i>“${E(latest.t)}”</i>` : "Simpan setiap kemenangan kecilmu."}</p>
        <div class="row">
          <button class="chip on" onclick="openJarSheet(false)">+ Tambah Bukti</button>
          <button class="chip" onclick="openJarSheet(true)">✨ Ambil Kenangan</button>
        </div>
      </div>
    </div>
  </div>`;
}

const MUSE_PRESETS = [
  { name: "Coquette Salon Lounge", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80" },
  { name: "Pink Satin & Roses", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80" },
  { name: "Dreamy Editorial Muse", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80" }
];

function openMuseSheet() {
  const m = S.muse || dflt().muse;
  sheet(`
    <span class="eyebrow">Boutique Gallery Wall</span>
    <h3>Ganti Foto Utama &amp; Kutipan</h3>
    <div class="chips">
      ${MUSE_PRESETS.map((p, i) => `<button class="chip ${!m.custom && m.preset === i ? "on" : ""}" onclick="window.__deleteGlowImage?.(S.muse.custom).catch(()=>{});S.muse.custom=null;S.muse.preset=${i};save();render();openMuseSheet()">${p.name}</button>`).join("")}
      <button class="btn" onclick="$('#museInput').click()">📷 Unggah Foto Sendiri (Wonyoung/Bias/Dirimu)</button>
    </div>
    <label class="q" for="mottoIn">Kalimat Motto Editorialku</label>
    <input type="text" id="mottoIn" style="width:100%" value="${E(m.motto || "")}" oninput="S.muse.motto=this.value;save();render()">
  `);
}

function setMusePhoto(el) {
  const f = el.files[0]; if (!f) return;
  const previous = S.muse.custom;
  const r = new FileReader();
  r.onload = () => {
    const i = new Image();
    i.onload = async () => {
      const c = document.createElement("canvas"), k = Math.min(1, 560 / Math.max(i.width, i.height));
      c.width = i.width * k; c.height = i.height * k;
      c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
      try {
        S.muse.custom = await window.__uploadGlowImage(c, "muse", 0.78, previous);
        save(); if ($("#sheet").open) $("#sheet").close(); render();
        toast(S.muse.custom.startsWith("local:") ? "Foto disimpan dan menunggu sinkronisasi 📷" : "Foto Gallery Wall berhasil diganti ✨");
      } catch (e) { toast("Foto belum dapat disimpan. Coba lagi."); }
    };
    i.onerror = () => toast("Berkas foto tidak dapat dibuka.");
    i.src = r.result;
  };
  r.readAsDataURL(f);
  el.value = "";
}

/* ===== Jadwal KRS & Konteks Kehidupan ===== */
const NAMA = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const IC = { b: "⏰", p: "🎒", c: "📚", s: "🌸", r: "🌙", w: "💼" };
const tm = s => { const m = /^(\d\d):(\d\d)$/.exec(s || ""); return m ? +m[1] * 60 + +m[2] : null; };
const fm = m => { const x = ((m % 1440) + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, "0") + "." + String(x % 60).padStart(2, "0"); };
const vc = c => tm(c.s) != null && tm(c.e) != null;
const wv = (w, d = todayN()) => {
  if (d && (S.ovr[d] || {}).noWork) return null;
  const x = S.sch.work[w];
  return x && tm(x[0]) != null && tm(x[1]) != null ? x : null;
};

function plan(w, d = todayN()) {
  const sc = S.sch, o = d ? (S.ovr[d] || {}) : {};
  const cs = o.noClass ? [] : sc.courses.filter(c => c.day == w && vc(c)).sort((a, b) => tm(a.s) - tm(b.s));
  const it = [], add = (m, l, k) => it.push({ m, l, k });
  const wu = o.noClass && (w == 1 || w == 3 || w == 4) ? null : sc.wake[w];
  const wo = wv(w, d);

  if (wu) add(tm(wu), "Bangun pagi", "b");
  if (cs.length) {
    const lv = tm(cs[0].s) - sc.travel - sc.buffer;
    add(lv - 35, "Mulai siap-siap (santai, jangan mepet)", "p");
    add(lv, "Berangkat ke kampus (cadangan " + sc.buffer + " menit)", "p");
    cs.forEach(c => add(tm(c.s), c.n + " (" + fm(tm(c.s)) + "–" + fm(tm(c.e)) + ")", "c"));
    const l = tm(cs[cs.length - 1].e);
    add(l, "Selesai kelas & perjalanan pulang", "p");
    add(l + sc.travel, "Makan, bersihkan wajah & ganti baju nyaman", "s");
    add(l + sc.travel + 45, "Tidur siang / rebahan pemulihan energi", "r");
  }
  if (wo) {
    const a = tm(wo[0]);
    let b = tm(wo[1]);
    if (b <= a) b += 1440;
    add(a - sc.prepWork, "Makan, mandi/bersiap & buka file scanlation", "p");
    add(a, "Mulai kerja scanlation", "w");
    add(b, "Selesai kerja" + (b >= 1440 ? " (lewat tengah malam)" : ""), "w");
    add(b + 25, "Cuci muka lembut, pelembap tipis, lalu tidur", "s");
  }
  return it.sort((x, y) => x.m - y.m);
}

function recs(w, d = todayN()) {
  const r = [], o = ovrOf(d);
  if (workedLatePrevNight(d)) r.push("Semalam jadwal kerjamu selesai larut (pukul 01.00). Pagi ini bergeraklah lebih pelan, tidak perlu memaksakan target berat.");
  if (w == 1 && !o.noClass) r.push("Senin adalah maraton 3 mata kuliah (07.30–15.45) + kerja malam (20.00–23.00). Utamakan makan, cuci muka, dan tidur siang sepulang kampus.");
  if ((w == 3 || w == 4) && !o.noClass) r.push("Rabu/Kamis: kuliah siang lalu lanjut scanlation sampai pukul 01.00. Gunakan jeda sore untuk benar-benar rebahan.");
  if (isBathDay(d)) r.push("Hari ini jadwal Mandi Utama 🛁. Pilih paket Home Salon & Spa yang paling pas dengan energimu.");
  if (w == 0) r.push("Sunday Reset: mandi utama Minggu, ganti sarung bantal, dan siapkan tas untuk Senin pagi pukul 05.00.");
  return r;
}

const clk = () => {
  const n = new Date();
  return n.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(":", ".") + " · " + n.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
};

function greet(d) {
  const h = new Date().getHours();
  if (S.periodMode) return ["Pelan-pelan ya, cantik 🌸", "Kamu sedang di masa tamu bulanan/PMS. Hari ini prioritaskan kenyamanan tubuh dan kulitmu."];
  if (h < 4) return ["Udah larut, cantik", "Gunakan Penyelamat 2 Menit & biarkan tubuhmu tidur."];
  if (workedLatePrevNight(d) && h < 12) return ["Pagi, sweet girl", "Semalam lembur scanlation. Hari ini kita mulai dengan ritme ekstra lembut."];
  if (h < 11) return ["Pagi, pretty girl", "Semoga harimu terasa ringan, hangat, dan tidak terburu-buru."];
  if (h < 15) return ["Siang, cantik", "Minum air dan rilekskan bahumu sejenak dari layar."];
  if (h < 19) return ["Sore yang tenang", "Waktunya transisi pulang, bersih-bersih, dan rebahan."];
  return ["Malam, cantik", "Terima kasih sudah bertahan melewati hari ini."];
}

const dur = m => m < 60 ? m + " mnt" : Math.floor(m / 60) + " jam" + (m % 60 ? " " + (m % 60) + " mnt" : "");

function nextCard(d) {
  const n = new Date(), now = n.getHours() * 60 + n.getMinutes(), w = n.getDay();
  const it = plan(w, d), cur = [...it].reverse().find(x => x.m <= now), nx = it.find(x => x.m > now);
  const o = ovrOf(d);
  const t = !it.length ? "Hari fleksibel tanpa jadwal tetap." : cur ? "Saat ini: " + cur.l : "Belum ada agenda wajib.";

  return `<div class="card nx">
    <div class="mh">
      <span class="eyebrow">Ritme Hari Ini · ${NAMA[w]}</span>
      ${isBathDay(d) ? `<span class="pill">🛁 Mandi Utama</span>` : ""}
    </div>
    <b>${nx ? fm(nx.m) + " — " + E(nx.l) : "Seluruh jadwal utama hari ini selesai"}</b>
    ${nx ? `<span class="mut" style="font-size:0.8rem">dalam ${dur(nx.m - now)}</span>` : ""}
    <p>${E(t)}</p>
    <div class="chips" style="margin-top:8px;margin-bottom:0">
      ${(w == 1 || w == 3 || w == 4) ? `<button class="chip ${o.noClass ? "on" : ""}" onclick="toggleOvr(${d},'noClass')">${o.noClass ? "✓ Kelas libur/online" : "Kelas libur?"}</button>` : ""}
      ${S.sch.work[w] ? `<button class="chip ${o.noWork ? "on" : ""}" onclick="toggleOvr(${d},'noWork')">${o.noWork ? "✓ Kerja malam libur" : "Kerja libur?"}</button>` : ""}
      <button class="chip ${isBathDay(d) ? "on" : ""}" onclick="toggleOvr(${d},'bath')">${isBathDay(d) ? "🛁 Menu Salon Aktif" : "+ Jadikan Hari Mandi"}</button>
      <button class="chip ${S.periodMode ? "on" : ""}" onclick="togglePeriodMode()">🌸 ${S.periodMode ? "Mode PMS / Haid Aktif" : "Tamu Bulanan / PMS"}</button>
      <button class="chip" onclick="openRescueModal('${now >= 1200 || now < 240 ? "night" : "class"}')">⚡ Penyelamat 2 Mnt</button>
    </div>
  </div>`;
}

const chipRow = (lab, arr, k, d, em) => `<div class="q2"><span>${lab}</span><div class="chips">${arr.map((a, i) => `<button class="chip ${S.ci[d] && S.ci[d][k] === i ? "on" : ""}" onclick="setCi(${d},'${k}',${i})">${em ? em[i] + " " : ""}${a}</button>`).join("")}</div></div>`;

function allList(d) {
  const g = {};
  hab(d).forEach(h => (g[QC(h)] = g[QC(h)] || []).push(h));
  return Object.keys(QN).filter(k => g[k]).map(k => `<details class="card" ${openCat[k] ? "open" : ""} ontoggle="openCat['${k}']=this.open"><summary>${ico(k, 16)} ${QN[k]} <small>${g[k].filter(x => (S.done[d] || {})[x[0]]).length}/${g[k].length}</small></summary>${g[k].map(x => qrow(x, d)).join("")}</details>`).join("");
}

/* ===== Halaman 1: Beranda ===== */
const homeText = value => String(value ?? "").replace(/[\p{Extended_Pictographic}\uFE0E\uFE0F\u200D]/gu, "").trim();

function homeRitualRow(h, d, bonus = false, scope = "main") {
  const on = !!(S.done[d] || {})[h[0]], skipped = !!(S.skip[d] || {})[h[0]];
  const skTags = (S.skin[d] && S.skin[d].tags) || [];
  let title = h[2], customTip = h[5];
  if (h[0] == "pm_moist") {
    const prod = getVanityByRole("moist", null);
    if (prod) title = `Malam: oleskan tipis ${prod}`;
  } else if (h[0] == "pm_clean") {
    const prod = getVanityByRole("clean", null);
    if (prod) title = `Malam: cuci muka lembut (${prod})`;
    if (skTags.includes("Iritasi") || skTags.includes("Kering")) customTip = "Kulit sensitif: cukup bilas air biasa tanpa digosok.";
  } else if (h[0] == "spf") {
    const prod = getVanityByRole("spf", null);
    if (prod) title = `Pagi: pakai ${prod} (jika ke kampus/keluar)`;
  }
  const id = `home-ritual-${scope}-${d}-${h[0]}`;
  const hasVideo = h[0] == "post1" || h[0] == "post_routine";
  return `<div class="home-ritual-item ${on ? "is-done" : ""} ${skipped ? "is-skipped" : ""}">
    <div class="home-ritual-row">
      <input class="home-ritual-checkbox" id="${id}" type="checkbox" ${on ? "checked" : ""} onchange="toggle('${h[0]}',${d})" aria-label="Selesai: ${E(homeText(title))}">
      <label class="home-ritual-label" for="${id}">${E(homeText(title))}${skipped ? '<small class="home-skip-state">Dilewati</small>' : ""}</label>
      <span class="home-ritual-meta">${bonus ? "Bonus · opsional" : E(QN[QC(h)])}</span>
      ${!on && !skipped ? `<button class="home-skip" type="button" onclick="skipQ('${h[0]}',${d})">Lewati</button>` : ""}
    </div>
    ${customTip ? `<small class="home-ritual-tip">${E(homeText(customTip))}</small>` : ""}
    ${hasVideo ? `<button class="home-video-link" type="button" onclick="openMediaPlay('m1')">Video panduan Emi Wong</button>` : ""}
  </div>`;
}

function homeMoodRow(lab, arr, key, d) {
  return `<div class="home-checkin-row"><span>${lab}</span><div class="chips">${arr.map((item, i) => `<button class="chip ${S.ci[d] && S.ci[d][key] === i ? "on" : ""}" onclick="setCi(${d},'${key}',${i})">${item}</button>`).join("")}</div></div>`;
}

function homeAllList(d) {
  const groups = {};
  hab(d).forEach(h => (groups[QC(h)] = groups[QC(h)] || []).push(h));
  return Object.keys(QN).filter(key => groups[key]).map(key => `<details class="home-archive-group" ${openCat[key] ? "open" : ""} ontoggle="openCat['${key}']=this.open">
    <summary>${QN[key]} <small>${groups[key].filter(h => (S.done[d] || {})[h[0]]).length}/${groups[key].length}</small></summary>
    ${groups[key].map(h => homeRitualRow(h, d, false, "archive")).join("")}
  </details>`).join("");
}

function homeNookSummary() {
  const books = S.books, current = books.cur, readToday = !!books.days[ymd()];
  return `<section class="home-quiet-block home-nook">
    <span class="eyebrow">Reading Nook · Streak ${bookStreak()}</span>
    <h3>${current ? E(current.title) : "Pilih bacaan berikutnya"}</h3>
    ${current ? `${bkBar(current)}<p>Hal ${current.currentPage || 0} dari ${current.totalPages || "?"}</p>` : `<p>${books.tbr.length} buku menunggu di rak keinginanmu</p>`}
    <div class="home-quiet-actions">
      <button type="button" class="home-text-action" onclick="bkCheck()">${readToday ? "Tercatat hari ini" : "Sudah baca hari ini"}</button>
      ${current ? `<button type="button" class="home-text-action" onclick="bkAdd(1)">Tambah 1 halaman</button>` : ""}
      <button type="button" class="home-text-action" onclick="go('diary')">Buka Nook</button>
    </div>
  </section>`;
}

function homeAuraSummary() {
  return `<section class="home-quiet-block home-aura">
    <span class="eyebrow">My Era Stats &amp; Aura</span>
    <div class="home-aura-list">${calcAura().map(a => `<div><span>${E(a.name)}</span><b>${a.val}/10</b></div>`).join("")}</div>
    <button type="button" class="home-text-action" onclick="openRecapCardModal()">Cetak Poster Edisi</button>
  </section>`;
}

function homeJarSummary() {
  const list = S.jar || [], latest = list[list.length - 1];
  return `<section class="home-quiet-block home-proof-jar">
    <span class="eyebrow">The Jar of Little Proofs</span>
    <h3>Toples Bukti Kecilku (${list.length})</h3>
    <p>${latest ? `Terbaru: “${E(homeText(latest.t))}” · Hari ${latest.d}` : "Simpan setiap kemenangan kecilmu."}</p>
    <div class="home-quiet-actions">
      <button type="button" class="home-text-action" onclick="openJarSheet(false)">Tambah bukti</button>
      <button type="button" class="home-text-action" onclick="openJarSheet(true)">Ambil kenangan</button>
    </div>
  </section>`;
}

function vTodayQuiet() {
  const d = todayN(), c = S.ci[d] || {}, open = ciOpen ?? !(c.skip || (c.mood != null && c.energy != null));
  const skTags = (S.skin[d] && S.skin[d].tags) || [];
  const spa = renderSpaCard(d);
  let h = `<div class="home-quiet">
    <section class="home-quiet-block home-checkin">
      <span class="eyebrow">Daily Mood &amp; Energy</span>
      ${open ? `${homeMoodRow("Suasana hati", MOOD, "mood", d)}${homeMoodRow("Energi", EN, "energy", d)}${homeMoodRow("Waktu luang", WAKTU, "time", d)}${homeMoodRow("Tipe hari", TIPE, "type", d)}
        <div class="home-quiet-actions"><button type="button" class="home-text-action" onclick="ciOpen=false;fx.sig=null;render()">Simpan &amp; Sesuaikan</button><button type="button" class="home-text-action" onclick="cd(${d}).skip=1;ciOpen=false;save();render()">Lewati</button></div>`
        : `<button class="home-checkin-summary" type="button" onclick="ciOpen=true;render()"><span>${c.mood != null ? `Mood: ${MOOD[c.mood]}` : "Check-in harian"}${c.energy != null ? ` · Energi: ${EN[c.energy]}` : ""}</span><span>Ubah</span></button>`}
    </section>
    <details class="home-more-details">
      <summary>Lihat ringkasan &amp; pintasan</summary>
      <div class="home-more-content">
    ${skTags.length ? `<section class="home-quiet-block home-skin-note"><span class="eyebrow">Kulit Hari Ini · ${E(skTags.slice(0, 2).join(", "))}</span><p>Oleskan ${E(getVanityByRole("moist", "Centella soothing cream"))} dan biarkan tenang tanpa disentuh.</p></section>` : ""}
    <section class="home-quiet-block home-fact">${renderWhisperCard().replace("↻ Fakta Lain", "Fakta Lain").replace(/>\s*([^<]*[\p{Extended_Pictographic}][^<]*)</gu, (_, value) => `>${homeText(value)}<`)}</section>
    <section class="home-quiet-block home-links">
      <span class="eyebrow">Pintasan</span>
      <div class="home-quick-links">
        <button type="button" onclick="go('act');sA='sk';render()">Etalase Rak</button>
        <button type="button" onclick="go('act');sA='md';render()">Video &amp; Audio</button>
        <button type="button" onclick="nowOpen()">Ide Sekarang</button>
        <button type="button" onclick="openJarSheet(true)">Toples Bukti</button>
      </div>
    </section>
    <section class="home-quiet-block home-reminder"><span class="eyebrow">Catatan hari ini</span><p>${E(homeText(F[d - 1]))}</p><small>${E(homeText(greet(d)[1]))}</small></section>
    <section class="home-quiet-block home-schedule">${nextCard(d).replace(/[\p{Extended_Pictographic}\uFE0E\uFE0F\u200D]/gu, "")}</section>
    ${spa ? `<section class="home-quiet-block home-spa">${spa.replace(/[\p{Extended_Pictographic}\uFE0E\uFE0F\u200D]/gu, "")}</section>` : ""}
    ${homeNookSummary()}
    ${homeAuraSummary()}
    ${homeJarSummary()}
    ${allOpen ? `<section class="home-quiet-block home-archive"><span class="eyebrow">Semua kebiasaan · Arsip</span>${homeAllList(d)}</section>` : ""}
    <section class="home-quiet-block home-actions"><span class="eyebrow">Ritme yang kamu butuhkan</span><div class="home-quiet-actions">
      <button type="button" class="home-text-action" onclick="nowOpen()">Sekarang Aku Enaknya Ngapain?</button>
      <button type="button" class="home-text-action" onclick="setLow(${!S.lowMode})">${S.lowMode ? "Keluar mode malas" : "Hari ini lagi malas"}</button>
      <button type="button" class="home-text-action" onclick="restDay(${d})">${S.rest[d] ? "Batalkan istirahat" : "Butuh istirahat"}</button>
      ${S.lowMode ? `<button type="button" class="home-text-action" onclick="winLow()">${S.low[d] ? "Hari minimal menang" : "Hitung menang"}</button>` : ""}
      <button type="button" class="home-text-action" onclick="allOpen=!allOpen;render()">${allOpen ? "Sembunyikan arsip" : `Lihat semua kebiasaan (${hab(d).length})`}</button>
    </div></section>
      </div>
    </details>
  </div>`;
  return h;
}

function vToday() {
  const d = todayN(), p = prog(d), ph = phase(d), m = S.muse || dflt().muse;
  const [grTitle] = greet(d);
  const mainImg = m.custom
    ? (window.__photoUrl?.(m.custom) || m.custom)
    : (MUSE_PRESETS[(m.preset || 0) % MUSE_PRESETS.length]?.img || "");
  const why = S.periodMode
    ? "Mode PMS · pilih ritual yang terasa nyaman."
    : p.q.low ? "Mode ringan · cukup lakukan yang kamu mampu." : p.q.bonus ? "3 ritual inti · 1 bonus opsional." : "3 ritual inti untuk hari ini.";
  const progress = Math.round((d / 30) * 100);
  return `<section class="home-hero" aria-labelledby="home-hero-title">
    <button class="home-hero-photo" type="button" onclick="openMuseSheet()" aria-label="Ganti foto Muse">
      ${mainImg ? `<img src="${E(mainImg)}" alt="Foto Muse">` : `<span class="home-photo-placeholder">FOTO MUSE</span>`}
    </button>
    <div class="home-hero-content">
      <span class="home-hero-eyebrow">${E(homeText(clk()))}</span>
      <h1 id="home-hero-title">${E(homeText(grTitle))}</h1>
      <p class="home-motto">“${E(m.motto || "")}"</p>
      <div class="home-day-line"><span class="home-day-number">${d}</span><span class="home-day-total">/ 30 hari</span></div>
      <div class="home-progress" role="progressbar" aria-label="Progres perjalanan 30 hari" aria-valuemin="1" aria-valuemax="30" aria-valuenow="${d}"><span style="width:${progress}%"></span></div>
      <p class="home-hero-context">Streak ${streak()} hari · Minggu ${wkN(d)} · ${E(ph[2])}</p>
      <button class="home-start" type="button" onclick="startRun()">Mulai ritual</button>
    </div>
  </section>
  ${renderCycleBanner()}
  ${renderRescueBanner(d)}
  <section class="home-rituals" aria-labelledby="home-ritual-title">
    <header class="home-ritual-header"><div><span class="eyebrow">${E(ph[2])}</span><h2 id="home-ritual-title">Ritual hari ini</h2></div><span class="home-ritual-count">${p.n} dari ${p.t}</span></header>
    <p class="home-ritual-note">${E(why)}</p>
    <div class="home-ritual-list">${p.q.main.map(h => homeRitualRow(h, d)).join("")}${p.q.bonus ? homeRitualRow(p.q.bonus, d, true) : ""}</div>
    ${S.rest[d] ? '<p class="home-status-note">Tercatat sebagai <b>Hari Istirahat</b>.</p>' : ""}
    ${S.rescue[d] ? '<p class="home-status-note"><b>Penyelamat 2 Menit</b> selesai hari ini.</p>' : ""}
  </section>`;
}

function sheet(h) {
  const s = $("#sheet");
  s.innerHTML = h + '<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" onclick="$(\'#sheet\').close()">Tutup</button></div>';
  if (!s.open) s.showModal();
}

function startRun() {
  const d = todayN(), p = prog(d), dd = S.done[d] || {}, sk = S.skip[d] || {};
  const q = p.q.main.concat(p.q.bonus ? [p.q.bonus] : []).find(h => !dd[h[0]] && !sk[h[0]]);
  if (!q) return sheet('<h3>Seluruh ritual selesai 🌸</h3><p>Kamu sudah merawat dirimu dengan sangat baik hari ini.</p>');
  sheet(`<span class="eyebrow">${QN[QC(q)]}</span><h3>${q[2]}</h3>${q[5] ? `<p class="note">${q[5]}</p>` : ""}<div class="row"><button class="btn" onclick="toggle('${q[0]}',${d});startRun()">Selesai ✓</button><button class="btn ghost" onclick="skipQ('${q[0]}',${d});startRun()">Lewati</button></div>`);
}

function cands() {
  const d = todayN(), n = new Date(), now = n.getHours() * 60 + n.getMinutes(), w = n.getDay();
  const it = plan(w, d), cur = [...it].reverse().find(x => x.m <= now), nx = it.find(x => x.m > now), g = nx ? nx.m - now : 999;
  const lowE = lowish(d), out = [];
  if (S.periodMode) out.push({ title: "Ritual Nyaman Tamu Bulanan 🌸", desc: "Seduh minuman hangat, kompres perut/punggung, oleskan Centella soothing cream, dan rebahan santai.", actIdx: 1 });
  if (cur && cur.k == "c") out.push({ title: "Di Sela Jam Kuliah", desc: "Tarik dagu perlahan ke belakang 3 kali agar leher tidak pegal menunduk & minum air.", actIdx: 34 });
  if (cur && cur.k == "w") out.push({ title: "Jeda Mikro Saat Scanlation", desc: "Simpan file kerjaanmu, pejamkan mata 30 detik, atau putar Podcast Otak Encer.", actIdx: 16, mediaId: "m4" });
  if (nx && g <= 25 && (nx.k == "c" || nx.l.startsWith("Berangkat"))) out.push({ title: `${g} Menit Sebelum ${nx.l}`, desc: "Cek charger, botol minum, tap cushion/lip tint favoritmu, dan berangkat tenang.", actIdx: 41 });
  if (now >= 1350 || now < 240) out.push({ title: "Penyelamat 2 Menit Sebelum Tidur", desc: "Cuci muka lembut & oles Centella soothing cream tipis.", actIdx: 42, mediaId: "m8" });
  if (isBathDay(d) && !((S.done[d] || {}).mandi)) out.push({ title: "Momen Mandi Utama & Hair Mask 🛁", desc: "Pilih paket Home Salon Spa yang paling pas sore ini.", actIdx: 13 });
  fxPre();
  fxPick(fx.f, []).p.forEach(idx => { const a = FXD[idx]; if (a) out.push({ title: a[0] + " (" + a[2] + " mnt)", desc: lowE ? a[9] : a[8], actIdx: idx, cat: CT[a[1]] }); });
  if (!out.length) out.push({ title: "Rebahan Tanpa Rasa Bersalah", desc: "Istirahat nyaman 15 menit.", actIdx: 44 });
  return out;
}

function nowOpen(more) {
  const l = cands(); ni = more ? ni + 1 : 0; const item = l[ni % l.length];
  sheet(`
    <span class="eyebrow">${E(item.cat || "Saran Kontekstual Untukmu")}</span>
    <h3>${E(item.title)}</h3>
    <p style="font-size:0.95rem;line-height:1.55">${E(item.desc)}</p>
    <div class="row">
      <button class="btn" onclick="${item.actIdx != null ? `fxDone(${item.actIdx});$('#sheet').close()` : `$('#sheet').close()`}">Oke, Aku Coba Sekarang</button>
      ${item.mediaId ? `<button class="btn ghost" onclick="openMediaPlay('${item.mediaId}')">▶ Putar Audio</button>` : ""}
      <button class="btn ghost" onclick="nowOpen(1)">Pilihan Lain ↻</button>
    </div>
  `);
}

function dayNav() {
  const d = sel;
  return `<div class="dn"><button class="chip" onclick="setSel(${Math.max(1, d - 1)})">‹ Hari ${Math.max(1, d - 1)}</button><b>Hari ${d} · ${dateOf(d)}</b><button class="chip" onclick="setSel(${Math.min(30, d + 1)})">Hari ${Math.min(30, d + 1)} ›</button></div>`;
}

/* ===== Halaman 2: Perjalanan 30 Hari ===== */
function vJourney() {
  const d = sel, td = todayN();
  const s0 = x => (S.rest[x] || S.low[x] || S.rescue[x]) ? "r" : prog(x).p >= 100 ? "full" : active(x) ? "part" : x < td ? "miss" : "fut";
  const actsDone = (S.acts[d] || []).filter(a => a && a.done);
  const week = wkN(d);
  const weekStart = week === 4 && d > 28 ? 24 : (week - 1) * 7 + 1;
  const weekEnd = Math.min(30, weekStart + 6);
  const weekDays = Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => weekStart + i);
  const dayButton = x => {
    const s = s0(x);
    return `<button class="dd ${s} ${x == td ? "today" : ""} ${x == d ? "sel" : ""}" onclick="setSel(${x})" aria-label="Pilih Hari ${x}">${s == "full" ? ico("ck", 12) : s == "r" ? ico("rest", 11) : x}</button>`;
  };
  const phaseRow = p => {
    const count = Array.from({ length: p[1] - p[0] + 1 }, (_, i) => p[0] + i).filter(active).length;
    return `<div class="journey-chapter-row ${d >= p[0] && d <= p[1] ? "is-current" : ""}"><span><b>${E(p[2])}</b><small>Hari ${p[0]}–${p[1]} · ${count}/${p[1] - p[0] + 1} Hari Hadir</small></span></div>`;
  };
  const fullWeek = weekDays.filter(x => s0(x) === "full").length;
  const restWeek = weekDays.filter(x => !!S.rest[x]).length;
  let h = `<header class="screen-heading">
    <span class="eyebrow">The 30-Day Chronicle · Hari ${d} · ${dateOf(d)}</span>
    <h1>My Glow Up Era</h1>
  </header>
  <section class="journey-week-card tier-primary" aria-label="Hari dalam minggu ${week}">
    <span class="eyebrow">MINGGU ${week} · ${E(phase(d)[2].replace(/^Chapter [IVX]+ · /, ""))}</span>
    <div class="dgrid">${weekDays.map(dayButton).join("")}</div>
    <p class="journey-week-summary">${fullWeek} hari penuh · ${restWeek} hari istirahat</p>
  </section>
  <section class="journey-focus tier-quiet">
    ${dayNav()}
    <span class="eyebrow">FOKUS HARI ${d}</span>
    <h2>“${E(F[d - 1])}”</h2>
    <details class="journey-note-disclosure">
      <summary>Catatan &amp; milestone hari ini</summary>
      <p class="note">${E(NOTES[(d * 3) % NOTES.length])}</p>
      ${REW[d] ? `<p class="note"><b>Milestone Hari ${d}:</b> ${E(REW[d])}</p>` : ""}
    </details>
    ${actsDone.length ? `<p class="mut journey-activity-summary">Aktivitas yang dinikmati: <b>${actsDone.map(a => E(a.a)).join(", ")}</b></p>` : ""}
    <button class="btn journey-focus-cta" type="button" onclick="document.querySelector('.journey-habits')?.scrollIntoView({behavior:'smooth',block:'start'})">Lihat checklist</button>
  </section>
  <section class="journey-chapters tier-quiet" aria-label="Empat chapter perjalanan">
    <span class="eyebrow">30 HARI · 4 CHAPTER</span>
    <h2>Chapter</h2>
    ${PHASES.map(phaseRow).join("")}
  </section>
  <details class="journey-all-days tier-quiet">
    <summary>Lihat peta lengkap 30 hari</summary><div class="map">
  `;
  PHASES.forEach((p, i) => {
    let hit = 0, b = "";
    for (let x = p[0]; x <= p[1]; x++) {
      if (active(x)) hit++;
      b += dayButton(x);
    }
    h += `<div class="ms">
      <span class="eyebrow">Hari ${p[0]}–${p[1]} · ${hit}/${p[1] - p[0] + 1} Hari Hadir</span>
      <h3>${E(p[2])}</h3>
      <p class="mut" style="margin:0;font-size:0.83rem">${E(p[3])}</p>
      <div class="dgrid">${b}</div>
    </div>`;
  });

  return h + `</div></details>
  <section class="journey-habits tier-primary" aria-label="Kebiasaan hari terpilih">
    <header class="journey-habits-header"><div><span class="eyebrow">CHECKLIST HARI ${d}</span><h2>Kebiasaan</h2></div><span class="journey-habits-count">${prog(d).n}/${prog(d).t}</span></header>
    ${allList(d)}
  </section>
  <section class="journey-keepsake tier-quiet">${renderJarCard("journey-jar tier-quiet")}</section>`;
}

/* ===== Halaman 3: Aktivitas, Media, Rak Vanity, Postur ===== */
const CT = [
  "", "Soft Girl Reset", "Pretty Girl Activities", "Hair, Body & Beauty Care",
  "Cozy Healing at Home", "Main Character Moments", "Hiburan & Santai",
  "Produktif tapi Ringan", "Digital Balance", "Posture & Gentle Movement",
  "Persiapan Kuliah & Kerja", "Low-Energy Days", "Sunday Reset"
];

const FXD = [
  ["Reset meja rias & etalase skincare", 1, 10, 0, 0, 0, "hpcF", "Tisu basah / lap", "Singkirkan barang yang bukan milik meja rias, lap permukaannya, lalu tata produk skincare utamamu seperti display butik.", "Cukup rapikan botol skincare yang dipakai malam ini."],
  ["Minuman favorit di dekat jendela", 1, 10, 0, 0, 0, "hlbF", "Teh hangat, susu, atau kopi", "Seduh minuman kesukaanmu, duduk tenang di dekat jendela, dan nikmati perlahan tanpa membuka file kerjaan.", "Minum 5 teguk sambil duduk santai tanpa layar."],
  ["Suasana kamar sore/malam yang hangat", 1, 5, 0, 0, 0, "hlcF", "", "Tutup tirai, kebaskan sprei serta bantal agar empuk kembali, dan nyalakan lampu kamar yang paling teduh.", "Rapikan bantal dan selimut saja."],
  ["Semprot wewangian sebelum rebahan", 1, 5, 0, 0, 0, "chlnR", "Body mist atau parfum lembut", "Semprotkan sedikit body mist di pergelangan tangan atau ujung bantal agar suasana istirahatmu terasa nyaman.", "Cium aroma parfum favoritmu dari botolnya."],

  ["Eksperimen cushion, contour, blush & lip combo di cermin", 2, 10, 0, 0, 0, "cebF", "Glad2Glow cushion, Gouté powder, Luxcrime contour, Emina blush", "Tanpa harus pergi ke mana-mana, coba padukan blush tipis, kontur lembut, dan lip tint di depan cermin.", "Pakai lip balm berwarna atau satu lip tint saja lalu senyum di cermin."],
  ["Lookbook mini dari lemari sendiri", 2, 15, 1, 0, 1, "cbpKF", "Pakaian di lemari", "Ambil 1 atasan yang nyaman untuk ke kampus, padukan dengan 2 bawahan berbeda, lalu foto untuk slot Lookbook Lemarimu.", "Pilih satu set baju untuk kuliah berikutnya."],
  ["Kurasi parfum & body mist minggu ini", 2, 5, 0, 0, 0, "chbKWF", "Koleksi parfum / mist", "Pilih satu aroma yang paling mewakili mood minggu ini dan masukkan ke tas kuliah.", "Pakai satu semprotan di pergelangan tangan sekarang."],
  ["Latihan pose & angle foto cantik", 2, 10, 0, 0, 1, "cebF", "HP & pencahayaan bagus", "Cari cahaya jendela atau lampu kamar yang lembut, coba 3 angle wajah dan bahu yang paling anggun.", "Ambil satu mirror selfie dengan postur bahu tegak."],
  ["Rapikan isi tas harian ala What's In My Bag", 2, 10, 0, 0, 0, "cpKF", "Tas kuliah/harian", "Keluarkan struk lama dari tas, lalu tata kembali pouch bedak/lip product, tisu, charger, dan dompet.", "Buang sampah kertas/struk dari dalam tas saja."],

  ["Coba satu tatanan rambut baru yang manis", 3, 10, 1, 0, 1, "cbeF", "Sisir, jedai, pita, atau ikat rambut", "Sisir rambut perlahan, lalu coba gaya half-up dengan jepit/pita atau gelombang lembut.", "Sisir rambut sampai halus dan jepit rapi."],
  ["Cuci puff cushion & kuas blush/contour", 3, 12, 1, 1, 0, "pcF", "Puff/kuas, sabun wajah lembut, tisu", "Cuci puff cushion dan kuas makeup dengan sabun lembut di bawah air mengalir. Sangat baik untuk kulit yang sedang breakout!", "Cuci 1 puff cushion yang paling sering menyentuh pipi."],
  ["Hand & Nail Spa mini di kamar", 3, 10, 0, 0, 0, "chbF", "Pemotong kuku & hand cream / lotion", "Potong kuku yang mulai panjang, bersihkan ujungnya, lalu oleskan lotion sambil memijat jari yang sering mengetik.", "Oleskan lotion di punggung tangan dan jari saja."],
  ["Totol Centella soothing cream di area kemerahan", 3, 5, 0, 0, 0, "chlR", "Centella soothing cream", "Oleskan satu lapis ekstra pelembap penenang pada area jerawat yang terasa nyeri atau kemerahan tanpa memencetnya.", "Oleskan satu titik moisturizer ekstra di area reaktif."],
  ["Mandi Utama + Hair Mask & Bond Repair", 3, 20, 0, 1, 0, "hlcF", "Shampoo, Hair Mask / Bond Repair, sabun wangi", "Khusus di jadwal mandi utamamu (Selasa/Jumat/Minggu): keramas bersih, aplikasikan hair mask 5 menit agar rambut lembut.", "Bilas tubuh dengan air hangat dan ganti pakaian bersih."],

  ["Ritual body lotion sambil putar 2 lagu favorit", 4, 10, 0, 0, 1, "hclF", "Body lotion & musik", "Nyalakan 2 lagu kesukaanmu, lalu oleskan body lotion dari kaki hingga lengan dengan gerakan memijat pelan.", "Oleskan lotion di lengan dan betis saja."],
  ["Camilan sore di piring cantik", 4, 10, 0, 1, 0, "hbleF", "Buah, biskuit, atau jajanan favorit", "Pindahkan camilanmu dari bungkus plastik ke piring cantik, lalu nikmati sambil duduk santai seperti di kafe.", "Makan camilan sambil duduk tenang."],
  ["Pijat bahu & leher pasca-typesetting", 4, 5, 0, 0, 0, "lhWR", "Lotion sedikit", "Usapkan sedikit lotion di leher dan pundak, lalu pijat lembut otot bahu yang kaku setelah lama menatap Photoshop.", "Tekan lembut bahu kiri dan kanan masing-masing 5 kali."],
  ["Masker bibir (lip balm tebal) sebelum tidur", 4, 3, 0, 0, 0, "clhR", "Lip balm / lip mask", "Bersihkan bibir, lalu oleskan lip balm agak tebal agar besok pagi bibirmu terasa lembap.", "Oleskan lip balm satu lapis sekarang."],

  ["Jalan sore 10 menit atau kayuh sepeda santai", 5, 10, 1, 2, 1, "bhecF", "Earphone", "Pasang earphone, putar lagu dreamy, lalu jalan santai atau bersepeda sebentar sambil memperhatikan langit sore.", "Berdiri di teras/dekat jendela sambil mendengarkan 1 lagu penuh."],
  ["Romanticize sudut meja belajarmu", 5, 8, 0, 0, 0, "cpKW", "Gelas cantik / barang estetis", "Tata laptop, buku catatan, dan segelas air minum dengan komposisi rapi sebelum mulai mengerjakan sesuatu.", "Singkirkan gelas kotor dan rapikan posisi laptop."],
  ["Abadikan 3 detail cantik di sekitarmu", 5, 8, 0, 1, 1, "bceF", "Kamera HP", "Cari 3 benda atau sudut dengan cahaya indah di kamar/rumah, lalu foto secara close-up.", "Ambil 1 foto benda favoritmu di meja."],
  ["Beli atau seduh minuman manis apresiasi diri", 5, 15, 1, 1, 1, "bcheF", "", "Buat minuman ala home-cafe dengan es batu sebagai hadiah kecil karena sudah melewati minggu ini.", "Tuang air dingin dengan es batu di gelas yang bagus."],

  ["Satu episode drama/anime tanpa rasa bersalah", 6, 30, 0, 0, 1, "eblhF", "Minuman & bantal nyaman", "Pilih 1 episode tontonan yang sedang kamu ikuti, duduk bersandar nyaman, dan tonton murni untuk hiburan.", "Tonton 15 menit pertamanya saja."],
  ["Baca 2 chapter webtoon/buku reflektif murni sebagai pembaca", 6, 15, 0, 0, 1, "eblhF", "HP atau buku bacaan", "Buka cerita atau buku favorit yang TIDAK sedang kamu kerjakan sebagai editor, nikmati alurnya murni untuk santai.", "Baca beberapa halaman ringan saja."],
  ["Virtual City Walk (Tokyo / Paris / Seoul) dari kasur", 6, 15, 0, 0, 1, "ebhF", "YouTube & earphone", "Putar video 4K walking tour sore atau malam hari di kota impianmu, rebahan, dan biarkan matamu jalan-jalan ke sana.", "Tonton selama 5 menit sambil rebahan."],
  ["Dengarkan Podcast Otak Encer sambil rebahan", 6, 15, 0, 0, 1, "hebF", "Earphone", "Buka sub-tab Media, pilih satu episode podcast psikologi/refleksi diri, dan dengarkan dengan santai.", "Dengarkan 5 menit pertama saja."],
  ["Teka-teki kata (Wordle) atau puzzle 1 ronde", 6, 8, 0, 0, 1, "ebF", "HP", "Mainkan 1 ronde tebak kata (Wordle) untuk menyegarkan otak, lalu tutup aplikasinya dengan puas.", "Coba beberapa tebakan selama 3 menit."],

  ["Aturan 5 Menit untuk 1 tugas kuliah", 7, 5, 1, 0, 1, "pKF", "Laptop / catatan", "Pilih satu tugas kuliah, nyalakan timer 5 menit, dan kerjakan bagian termudahnya saja. Saat bunyi, bebas berhenti.", "Buka dokumen tugasnya dan tulis 2 kalimat saja."],
  ["Bersihkan 10 screenshot lama di galeri HP", 7, 5, 0, 0, 1, "pbF", "HP", "Buka album Screenshot, hapus 10 gambar lama yang sudah tidak terpakai agar galerimu terasa lega.", "Hapus 3 foto buram/screenshot lama."],
  ["Rapikan folder kerja scanlation / desktop", 7, 8, 0, 0, 1, "pWF", "Laptop", "Pindahkan file chapter yang sudah selesai ke folder arsip dan tutup tab browser yang menumpuk.", "Tutup 5 tab browser yang sudah tidak dipakai."],
  ["Satu laci atau satu rak selama 5 menit", 7, 5, 1, 0, 0, "pbF", "", "Pilih hanya satu area super kecil di meja, buang sampahnya, dan kembalikan sisanya dengan rapi.", "Buang 3 sampah kecil di sekitar tempat dudukmu."],

  ["Parkir HP di seberang kasur selama 15 menit", 8, 15, 0, 0, 0, "hblF", "", "Letakkan HP agak jauh selama 15 menit. Gunakan untuk meluruskan punggung atau memejamkan mata.", "Balik layar HP menghadap ke bawah selama 5 menit."],
  ["Mode Jangan Ganggu (DND) untuk aplikasi berisik", 8, 5, 0, 0, 1, "pbF", "HP", "Bisukan notifikasi grup yang tidak mendesak selama 2 jam ke depan supaya kepalamu tenang.", "Matikan suara notifikasi HP sekarang."],
  ["Mindful Scrolling dengan batas 10 menit", 8, 10, 0, 0, 1, "belF", "HP", "Pasang timer 10 menit, nikmati konten yang membuatmu senang, dan saat berbunyi, minum segelas air.", "Scroll santai selama 5 menit lalu istirahatkan mata."],

  ["Ikuti video 5-Min Neck & Shoulder Posture (Instruktur Wanita)", 9, 5, 0, 0, 1, "lhpKWR", "Video di tab Media", "Putar video panduan postur Emi Wong / Mady Morrison, tarik dagu ke belakang perlahan, dan rilekskan bahu.", "Turunkan bahu dari telinga sambil buang napas panjang 3 kali."],
  ["Buka dada & bahu di kusen pintu", 9, 5, 0, 1, 0, "lhKWF", "Kusen pintu kamar", "Tempelkan lengan bawah di kusen pintu, condongkan dada sedikit ke depan selama 20 detik agar bahu terbuka.", "Rentangkan kedua tangan ke belakang punggung selama 15 detik."],
  ["Berdiri anggun di dinding (Wall Angel Check)", 9, 5, 0, 0, 0, "cbpF", "Dinding rata", "Tempelkan tumit, punggung atas, dan kepala belakang ke dinding selama 30 detik. Rasakan postur tegak.", "Berdiri tegak sambil menarik bahu lembut ke belakang 15 detik."],
  ["Kaki diangkat ke dinding (Legs Up The Wall)", 9, 10, 0, 0, 0, "lhKWR", "Kasur & dinding", "Rebahan di kasur dan sandarkan kedua kaki lurus ke dinding selama 5–10 menit sepulang kampus.", "Rebahan telentang dengan bantal di bawah lutut 5 menit."],

  ["Siapkan tas & outfit kampus besok malam ini", 10, 10, 1, 0, 0, "pK", "Tas, baju kuliah, charger", "Gantung baju yang akan dipakai besok, masukkan charger ke tas supaya pagi tidak panik.", "Siapkan charger dan dompet di dalam tas saja."],
  ["Power Nap 25 menit sebelum jam kerja 20.00", 10, 25, 0, 0, 0, "lhKW", "Alarm HP", "Pasang alarm 25 menit sore hari sepulang kuliah agar nanti malam saat mulai scanlation matamu segar.", "Pejamkan mata 10 menit tanpa melihat layar HP."],
  ["Pemanasan meja kerja 10 menit sebelum pukul 20.00", 10, 10, 0, 0, 1, "pW", "Air minum, laptop", "Isi penuh botol minummu, nyalakan laptop, buka Photoshop & script lebih dulu sebelum mulai.", "Siapkan segelas air di sebelah laptopmu sekarang."],
  ["Touch-up segar 3 menit sebelum berangkat kelas", 10, 5, 0, 0, 0, "cKR", "Sunscreen, cushion/bedak tipis, lip tint", "Pastikan sunscreen meresap, tap bedak/lip tint favoritmu, dan rapikan rambut di cermin.", "Rapikan rambut dan pakai lip balm saja."],

  ["Cuci muka super lembut, soothing cream, langsung rebahan", 11, 5, 0, 0, 0, "lhR", "Cleanser lembut & Centella soothing cream", "Saat energimu hampir habis: bilas wajah dengan cleanser lembut, oles soothing cream tipis, lalu naik ke kasur.", "Bilas wajah dengan air biasa dan tepuk lembut dengan tisu wajah."],
  ["Ganti kaos/piyama paling nyaman di lemari", 11, 5, 0, 0, 0, "lhR", "Pakaian rumah", "Lepas pakaian luar yang gerah, ganti dengan baju paling lembut dan longgar yang kamu miliki.", "Lepas ikat rambut yang kencang dan ganti atasan nyaman."],
  ["Izin resmi untuk bermalas-malasan 20 menit", 11, 20, 0, 0, 1, "lebhR", "", "Tidak ada target produktif. Rebahan, peluk guling, boleh sambil dengar audio subliminal tanpa rasa bersalah.", "Tarik selimut dan istirahat selama yang kamu mau."],
  ["Minum setengah gelas air sambil duduk di tepi kasur", 11, 3, 0, 0, 0, "lhR", "Air minum", "Langkah terkecil saat sedang malas melakukan apa-apa: minum beberapa teguk air, lalu kembali bersandar.", "Minum 3 teguk air saja."],

  ["Ganti sarung bantal bersih untuk minggu baru", 12, 8, 1, 0, 0, "pbcF", "Sarung bantal bersih", "Lepas sarung bantal lama dan pasang yang baru demi menenangkan kulit wajah yang sedang breakout.", "Balik bantal ke sisi sebelahnya atau lapisi kain bersih."],
  ["Pilih 3 kombinasi baju untuk Senin, Rabu, dan Kamis", 12, 12, 1, 0, 0, "pcKF", "Lemari pakaian", "Gantung berjejer 3 stel baju kuliah untuk Senin, Rabu, dan Kamis agar sepanjang minggu selalu tampil rapi.", "Pilih baju untuk hari kuliah berikutnya saja."],
  ["Bersihkan layar HP & cermin meja rias", 12, 5, 0, 0, 0, "pcF", "Tisu / kain lembut", "Usap layar HP dan cermin meja rias sampai mengilap agar lebih higienis saat menyentuh pipi.", "Bersihkan layar HP dengan tisu bersih."],
  ["Persiapan lembut Minggu malam untuk Senin 05.00", 12, 10, 0, 0, 0, "pK", "Tas, alarm 05.00", "Cek alarm pukul 05.00, siapkan tas untuk 3 mata kuliah Senin, lalu tutup malam Minggu dengan tenang.", "Nyalakan alarm Senin pagi dan taruh tas di dekat pintu."]
];

const FXM = ["Bosan", "Ingin cantik", "Butuh healing", "Sedikit produktif", "Ingin hiburan", "Lelah"];
const FXE = ["Rendah", "Sedang", "Tinggi"];
const FXU = ["5 menit", "10–15 menit", "20–30 menit", "Fleksibel"];
const FXL = ["Di Kamar", "Di Rumah", "Keluar Sebentar"];
const FXH = ["Tanpa HP", "Boleh Pakai HP"];
const FXC = ["Hari Kuliah", "Sebelum/Saat Kerja", "Waktu Bebas"];
const FXLAB = ["Main Point I · Paling Ringan", "Main Point II · Menyenangkan", "Main Point III · Sentuhan Ekstra"];

const STN = [
  ["Aku lagi bosan di rumah", { m: 0 }, "🫖"],
  ["Butuh me-time & tenang", { m: 2, en: 1, hp: 0 }, "🦢"],
  ["Kehilangan motivasi", { m: 3, en: 0, du: 0 }, "🌷"],
  ["Ingin merasa cantik hari ini", { m: 1 }, "🪞"],
  ["Capek habis kuliah / kerja", { m: 5, en: 0 }, "🌙"],
  ["Ingin jeda dari layar HP", { hp: 0 }, "🎀"],
  ["Bermanfaat tapi tetap santai", { m: 3, en: 1 }, "✨"]
];

let fx = { f: {}, picks: [], sel: null, run: 0, t0: 0, note: "", sig: null, rest: 0, fo: false, cat: 0, showFav: false };
const fxS = () => S.fx || (S.fx = { fav: {}, nope: {}, log: [], seen: {} });
const fxMeta = a => `${a[2]} mnt · energi ${FXE[a[3]].toLowerCase()} · ${FXL[a[4]].toLowerCase()}`;

function fxLog(i, e) {
  const z = fxS(), n = Date.now();
  z.log.push({ i, e, t: n });
  if (z.log.length > 400) z.log.splice(0, z.log.length - 400);
  if (e == "shown") { const s = z.seen[i] || (z.seen[i] = { n: 0, t: 0 }); s.n++; s.t = n; }
  save();
}

function fxPre() {
  const d = todayN(), c = S.ci[d] || {}, n = new Date(), now = n.getHours() * 60 + n.getMinutes(), w = n.getDay();
  const it = plan(w, d), cur = [...it].reverse().find(x => x.m <= now), nx = it.find(x => x.m > now), f = {};
  if (c.energy != null) f.en = [0, 0, 1, 2][c.energy];
  if (S.periodMode) { f.en = 0; f.m = 2; }
  if (c.mood != null && c.mood <= 1) { f.en = 0; f.m = c.mood == 1 ? 5 : 2; }
  if (c.time != null && c.time < 3) f.du = c.time;
  if (c.type == 3 && f.m == null) f.m = 3;
  f.cx = (cur && cur.k == "c") || c.type == 0 ? 0 : (cur && cur.k == "w") || (nx && nx.k == "w" && nx.m - now <= 90) || c.type == 1 ? 1 : c.type == 2 ? 2 : null;
  if (f.en == null && (now >= 1320 || now < 300 || workedLatePrevNight(d))) f.en = 0;
  fx.f = f;
}

function fxPool(f, r) {
  const z = fxS(), now = Date.now(), M = "bchpel";
  return FXD.map((a, i) => ({ a, i })).filter(({ a, i }) => {
    const nk = z.nope[i];
    if (nk && now < nk.until) return false;
    if (fx.cat && a[1] != fx.cat && r < 4) return false;
    if (f.en != null && a[3] > f.en) return false;
    if (f.hp != null && a[5] != f.hp) return false;
    if (r < 4 && f.m != null && !a[6].includes(M[f.m])) return false;
    if (r < 3 && f.cx != null) {
      const t = a[6].replace(/[^KWF]/g, "");
      if (t && !t.includes("KWF"[f.cx])) return false;
    }
    if (r < 2 && f.lo != null && a[4] > f.lo) return false;
    if (r < 1 && f.du != null && f.du < 3 && a[2] > [7, 17, 35][f.du]) return false;
    return true;
  }).map(({ a, i }) => {
    const s = z.seen[i]; let v = Math.random() * 3;
    if (s) v -= (Math.max(0, 5 - (now - s.t) / 864e5) * 1.5 + Math.min(s.n, 6) * 0.3) * (a[6].includes("R") ? 0.6 : 1);
    if (z.fav[i]) v += 1.2;
    return { i, s: v };
  });
}

function fxPick(f, old) {
  let r = 0, P;
  for (; r <= 4; r++) { P = fxPool(f, r); if (P.length >= 3) break; }
  let Q = P.filter(p => !old.includes(p.i)); if (Q.length < 3) Q = P;
  Q = Q.sort((x, y) => y.s - x.s).slice(0, 14);
  const ld = i => FXD[i][3] * 20 + FXD[i][2];
  const fu = i => ([2, 4, 5, 6].includes(FXD[i][1]) ? 2 : 0) + (/[ce]/.test(FXD[i][6]) ? 1 : 0);
  const out = [];
  const take = cmp => {
    const c = Q.filter(p => !out.includes(p.i)).map(p => ({ ...p, r: Math.random() })).sort((x, y) => cmp(x, y) || x.r - y.r);
    const d = c.filter(p => !out.some(o => FXD[o][1] == FXD[p.i][1]));
    const b = (d.length ? d : c).slice(0, 3);
    const nc = b[Math.floor(Math.random() * b.length)];
    if (nc) out.push(nc.i);
  };
  take((x, y) => ld(x.i) - ld(y.i));
  take((x, y) => fu(y.i) - fu(x.i) || y.s - x.s);
  take((x, y) => ld(y.i) - ld(x.i));
  return { p: out, r: r > 0 && out.length };
}

function fxRoll(ex) {
  fx.rest = 0; fx.showFav = false;
  const r = fxPick(fx.f, ex ? fx.picks.slice() : []);
  fx.picks = r.p; fx.note = r.r ? "Filter dilonggarkan sedikit agar tetap ada ide untukmu." : "";
  fx.sel = null; fx.run = 0;
  r.p.forEach(i => fxLog(i, "shown"));
  render();
}

function fxSur() {
  fx.showFav = false;
  let P = fxPool(fx.f, 0); if (!P.length) P = fxPool(fx.f, 4);
  if (!P.length) return;
  const i = P[Math.floor(Math.random() * P.length)].i;
  fx.picks = [i]; fx.sel = i; fx.run = 0; fx.rest = 0;
  fx.note = "Satu kejutan manis untukmu.";
  fxLog(i, "shown"); render();
}

function fxSet(k, v) { fx.f[k] = fx.f[k] === v ? null : v; fxRoll(0); }
function fxPreset(i) { fx.cat = 0; fx.f = Object.assign({ en: fx.f.en, cx: fx.f.cx }, STN[i][1]); fxRoll(0); }
function fxStart(i) { fx.run = 1; fx.t0 = Date.now(); fxLog(i, "start"); render(); }

function fxDone(i) {
  fx.run = 2; const d = todayN();
  (S.acts[d] || (S.acts[d] = [])).push({ a: FXD[i][0], done: 1, at: Date.now() });
  fxLog(i, "done");
  addJarProof(`Menikmati momen: ${FXD[i][0]} ✨`, d, true);
  toast("Tercatat di perjalanan & toples buktimu 🌷"); render();
}

function fxSkip(i) { fxLog(i, "skip"); fx.sel = null; fx.run = 0; render(); }
function fxFav(i) { const z = fxS(); z.fav[i] ? delete z.fav[i] : z.fav[i] = 1; save(); render(); }
function fxRest() { fx.picks = []; fx.sel = null; fx.run = 0; fx.rest = 1; render(); }
function fxNope(i, w) {
  const z = fxS(); z.nope[i] = { w, until: Date.now() + 864e5 * (w == 1 ? 60 : 7) };
  fxLog(i, "nope"); if ($("#sheet").open) $("#sheet").close();
  toast("Aktivitas disimpan dulu dari daftar."); fxRoll(1);
}

function fxCard(i, k) {
  const a = FXD[i], o = fx.sel === i, fv = fxS().fav[i], lab = fx.picks.length == 1 ? "✦ Edisi Kejutan" : FXLAB[k];
  let b = "";
  if (o) {
    b = `<div class="fxc-body">
      <p style="margin:0 0 8px;line-height:1.52">${E(a[8])}</p>
      ${a[7] ? `<p class="mut" style="margin:0 0 6px;font-size:0.8rem">✦ <b>Perlengkapan:</b> ${E(a[7])}</p>` : ""}
      <p class="note" style="margin:6px 0 10px">🌙 <b>Versi paling ringan:</b> ${E(a[9])}</p>
      ${fx.run == 0 ? `<div class="row">
        <button class="btn" onclick="fxStart(${i})">Mulai Sekarang</button>
        ${a[1] == 9 ? `<button class="chip" onclick="openMediaPlay('m1')">▶ Video Panduan</button>` : ""}
        <button class="chip ${fv ? "on" : ""}" onclick="fxFav(${i})">${fv ? "♥ Favorit" : "♡ Simpan"}</button>
        <button class="chip" onclick="fxNope(${i},0)">Ganti</button>
      </div>` : fx.run == 1 ? `<div class="row"><button class="btn" onclick="fxDone(${i})">Selesai &amp; Catat ✓</button><button class="chip" onclick="fxSkip(${i})">Batal</button></div>` : `<div class="row"><button class="btn" onclick="fxRest()">Istirahat</button><button class="chip" onclick="fxRoll(1)">Ide Lainnya</button></div>`}
    </div>`;
  }
  return `<div class="fxc ${o ? "on" : ""}">
    <button class="fx-zigzag" onclick="if(!fx.run){fx.sel=${o ? "null" : i};render()}">
      <div class="fx-art">${artForCat(a[1])}</div>
      <div class="fx-info">
        <small>${lab} · ${E(CT[a[1]])}</small>
        <b>${E(a[0])}</b>
        <span>${fxMeta(a)}</span>
      </div>
    </button>
    ${b}
  </div>`;
}

function vFx() {
  const f = fx.f, sig = todayN() + JSON.stringify(S.ci[todayN()] || {}) + JSON.stringify(S.ovr[todayN()] || {}) + S.periodMode;
  if (fx.sig !== sig) {
    fx.sig = sig; fxPre();
    const r = fxPick(fx.f, []);
    fx.picks = r.p; fx.note = ""; fx.sel = null; fx.run = 0; fx.rest = 0;
  }
  const rows = [
    ["Suasana Hati", FXM, "m"], ["Batas Energi", FXE, "en"], ["Durasi", FXU, "du"],
    ["Tempat", FXL, "lo"], ["Layar HP", FXH, "hp"], ["Situasi Hari", FXC, "cx"]
  ];
  const n = Object.values(fx.f).filter(v => v != null).length + (fx.cat ? 1 : 0);
  const favIds = Object.keys(fxS().fav).map(Number);

  if (fx.showFav) {
    return `<section class="activity-recommendations activity-favorites">
      <div class="activity-recommendations-header"><div><span class="eyebrow">Saved Collection</span><h2>Koleksi Favoritku (${favIds.length})</h2></div><button class="chip" onclick="fx.showFav=false;render()">← Kembali</button></div>
      <div class="activity-rec-list">${favIds.length ? favIds.map((i, k) => fxCard(i, k % 3)).join("") : '<div class="empty">Belum ada favorit tersimpan.</div>'}</div>
    </section>`;
  }

  let h = `<section class="activity-recommendations">
      <div class="activity-recommendations-header">
        <div><span class="eyebrow">The Art of Coquette · Lookbook</span><h2>Curated Activities</h2></div>
        <button class="chip" onclick="fx.showFav=true;render()">♥ Favorit (${favIds.length})</button>
      </div>
      ${fx.note ? `<p class="note">${E(fx.note)}</p>` : ""}
      <div class="activity-rec-list">${fx.picks.map((i, k) => fxCard(i, k)).join("")}</div>
      <div class="card activity-controls-card"><div class="row">
        <button class="btn ghost" onclick="fxRoll(1)">↻ Putar 3 Pilihan Baru</button>
        <button class="btn" onclick="fxSur()">✨ Surprise Me</button>
      </div></div>
  </section>`;

  h += `<div class="card activity-filters tier-primary">
    <div class="boutique-hdr"><span class="boutique-hdr-title">Vibe &amp; Category Filter</span></div>
    <div class="sg" style="margin-bottom:10px">
      ${STN.map((s, i) => `<button class="opt" onclick="fxPreset(${i})"><span>${s[0]}</span></button>`).join("")}
    </div>
    <div class="chips">
      <button class="chip ${fx.cat == 0 ? "on" : ""}" onclick="fx.cat=0;fxRoll(0)">Semua (50+)</button>
      ${CT.slice(1).map((cName, idx) => `<button class="chip ${fx.cat == idx + 1 ? "on" : ""}" onclick="fx.cat=${idx + 1};fxRoll(0)">${cName}</button>`).join("")}
    </div>
    <details style="margin-top:8px" ${fx.fo ? "open" : ""} ontoggle="fx.fo=this.open">
      <summary style="font-weight:700;color:var(--brown);font-size:0.84rem">Filter Detail Waktu, Energi &amp; HP ${n ? "(" + n + " aktif)" : ""}</summary>
      ${rows.map(r => `<div class="q2"><span>${r[0]}</span><div class="chips">${r[1].map((x, i) => `<button class="chip ${f[r[2]] === i ? "on" : ""}" onclick="fxSet('${r[2]}',${i})">${x}</button>`).join("")}</div></div>`).join("")}
      <button class="lk" onclick="fx.f={};fx.cat=0;fxRoll(0)">Reset semua filter</button>
    </details>
  </div>`;
  return h;
}

/* ===== Sub-Tab Media Lounge ===== */
const MEDIA_CATS = { all: "Semua", posture: "Olahraga Postur", podcast: "Podcast", glowup: "Motivasi", subliminal: "Subliminal" };

function openMediaPlay(id) {
  const m = (S.media || []).find(x => x.id === id); if (!m) return;
  sheet(`
    <span class="eyebrow">${E(MEDIA_CATS[m.cat] || "Media Companion")}</span>
    <h3>${E(m.title)}</h3>
    <p class="mut" style="font-size:0.83rem;margin:0 0 8px">${E(m.creator)} · ${E(m.dur)}</p>
    ${m.thumb ? `<div style="border-radius:14px;overflow:hidden;border:1px solid var(--line);margin-bottom:10px;max-height:190px"><img src="${E(m.thumb)}" alt="" style="width:100%;height:190px;object-fit:cover;display:block"></div>` : ""}
    <p style="font-size:0.9rem;margin:0 0 12px">${E(m.desc || "")}</p>
    <div class="row">
      <a class="btn" href="${E(m.url)}" target="_blank" rel="noopener noreferrer">▶ Putar Sekarang (${m.url.includes("tiktok") ? "TikTok" : "YouTube / Audio"})</a>
      <button class="btn ghost" onclick="logMediaDone('${E(m.title)}','${m.cat}')">✓ Tandai Selesai</button>
    </div>
  `);
}

function logMediaDone(title, cat) {
  const d = todayN();
  (S.acts[d] || (S.acts[d] = [])).push({ a: title, done: 1, at: Date.now() });
  if (cat === "posture") { const x = S.done[d] || (S.done[d] = {}); x.post1 = true; }
  addJarProof(`Menikmati sesi ${title} 🎧`, d, true);
  save(); if ($("#sheet").open) $("#sheet").close(); render();
  toast("Tercatat! Aura karaktermu bertambah ✨");
}

function addCustomMedia() {
  const title = ($("#mTitle")?.value || "").trim(), url = ($("#mUrl")?.value || "").trim();
  const cat = $("#mCatSel")?.value || "glowup", dur = ($("#mDur")?.value || "10 mnt").trim();
  if (!title || !url) { toast("Isi judul dan link videonya dulu ya."); return; }
  const ytMatch = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(url);
  const thumb = ytMatch ? `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg` : "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80";
  S.media.unshift({ id: "u" + Date.now(), cat, title, creator: "Koleksi Pribadiku", dur, thumb, url, desc: "Disimpan ke arsip pribadiku." });
  save(); render(); toast("Link berhasil disimpan ✨");
}

function delMedia(id) { S.media = (S.media || []).filter(m => m.id !== id); save(); render(); }

function vMedia() {
  const list = (S.media || []).filter(m => mCat === "all" || m.cat === mCat);
  return `<div class="card paper activity-primary">
    <div class="washi"></div>
    <div class="boutique-hdr"><span class="boutique-hdr-title">Boutique Media Lounge</span></div>
    <p class="mut" style="margin:0 0 8px;font-size:0.84rem">Kurasi khusus instruktur wanita (Emi Wong, Mady Morrison, Move With Nicole), podcast reflektif, dan subliminal malam.</p>
    <div class="chips">${Object.keys(MEDIA_CATS).map(k => `<button class="chip ${mCat === k ? "on" : ""}" onclick="mCat='${k}';render()">${MEDIA_CATS[k]}</button>`).join("")}</div>
    <div class="media-grid">
      ${list.map(m => `<div class="media-card-vis">
        <div class="media-thumb" onclick="openMediaPlay('${m.id}')">
          <img src="${E(m.thumb || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80")}" alt="${E(m.title)}">
          <div class="play-pill">▶</div>
          <span class="dur-tag">${E(m.dur)}</span>
        </div>
        <div style="min-width:0">
          <span class="eyebrow">${E(MEDIA_CATS[m.cat] || m.cat)}</span>
          <b style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;line-height:1.2;display:block;margin:2px 0">${E(m.title)}</b>
          <small class="mut" style="display:block;margin-bottom:6px">${E(m.creator)}</small>
          <div class="row">
            <a class="chip on" href="${E(m.url)}" target="_blank" rel="noopener noreferrer" style="padding:3px 10px;font-size:0.74rem">↗ Putar</a>
            <button class="chip" style="padding:3px 9px;font-size:0.74rem" onclick="logMediaDone('${E(m.title)}','${m.cat}')">✓ Selesai</button>
            ${String(m.id).startsWith("u") ? `<button class="lk" onclick="delMedia('${m.id}')">✕</button>` : ""}
          </div>
        </div>
      </div>`).join("")}
    </div>
  </div>
  <div class="card activity-primary">
    <div class="boutique-hdr"><span class="boutique-hdr-title">+ Simpan Link TikTok / YouTube / Spotify</span></div>
    <div class="crow">
      <input type="text" id="mTitle" placeholder="Judul video / podcast favoritmu" style="flex:1">
      <select id="mCatSel">
        <option value="posture">🎀 Olahraga Postur</option>
        <option value="podcast">🎧 Podcast Otak Encer</option>
        <option value="glowup">✨ Motivasi Glow Up</option>
        <option value="subliminal">🌙 Subliminal &amp; Afirmasi</option>
      </select>
    </div>
    <div class="crow">
      <input type="url" id="mUrl" placeholder="Tempel link https://..." style="flex:2">
      <input type="text" id="mDur" placeholder="10 mnt" style="width:90px">
      <button class="btn" onclick="addCustomMedia()">Simpan</button>
    </div>
  </div>`;
}

/* ===== Sub-Tab Etalase Skincare (With Real Custom Product Photo Slot!) ===== */
const BADGE_OPTS = ["Penyelamat Breakout", "Wajib Malam", "Pagi Kampus", "Mandi Utama 🛁", "Andalan Kampus", "Pretty Boost", "Pause Dulu"];

function editVanityItem(idx) {
  curVanityIdx = idx;
  const v = S.vanity[idx]; if (!v) return;
  sheet(`
    <span class="eyebrow">Edit Vanity Mirror Slot 0${idx + 1}</span>
    <h3>${E(v.name)}</h3>
    <div class="row" style="margin:8px 0">
      <button class="btn" onclick="$('#vanityPhIn').click()">📷 Pasang Foto Produk Asliku</button>
      ${v.img ? `<button class="chip" onclick="window.__deleteGlowImage?.(S.vanity[${idx}].img).catch(()=>{});S.vanity[${idx}].img=null;save();editVanityItem(${idx});render()">Pakai Ilustrasi SVG</button>` : ""}
    </div>
    <label class="q">Nama Produk</label>
    <input type="text" id="vName" style="width:100%" value="${E(v.name)}">
    <label class="q">Status di Etalase</label>
    <div class="chips">
      ${BADGE_OPTS.map(b => `<button class="chip ${v.badge === b ? "on" : ""}" onclick="S.vanity[${idx}].badge='${b}';save();editVanityItem(${idx})">${b}</button>`).join("")}
    </div>
    <label class="q">Catatan Pemakaian</label>
    <input type="text" id="vNote" style="width:100%" value="${E(v.note || "")}">
    <div class="row" style="margin-top:12px">
      <button class="btn" onclick="S.vanity[${idx}].name=$('#vName').value;S.vanity[${idx}].note=$('#vNote').value;save();$('#sheet').close();render()">Simpan</button>
      <button class="btn ghost" onclick="S.vanity.splice(${idx},1);save();$('#sheet').close();render()">Hapus Produk</button>
    </div>
  `);
}

function handleVanityPhoto(el) {
  const f = el.files[0]; if (!f) return;
  const previous = S.vanity[curVanityIdx]?.img;
  const r = new FileReader();
  r.onload = () => {
    const i = new Image();
    i.onload = async () => {
      const c = document.createElement("canvas"), k = Math.min(1, 360 / Math.max(i.width, i.height));
      c.width = i.width * k; c.height = i.height * k;
      c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
      if (S.vanity[curVanityIdx]) {
        try {
          S.vanity[curVanityIdx].img = await window.__uploadGlowImage(c, "vanity", 0.74, previous);
        } catch (e) { toast("Foto belum dapat disimpan. Coba lagi."); return; }
        save();
        toast(S.vanity[curVanityIdx].img.startsWith("local:") ? "Foto disimpan dan menunggu sinkronisasi 📷" : "Foto produk berhasil dipasang di cermin etalase ✨");
      }
      if ($("#sheet").open) $("#sheet").close();
      render();
    };
    i.src = r.result;
  };
  r.readAsDataURL(f);
  el.value = "";
}

function addVanityModal() {
  sheet(`
    <span class="eyebrow">New Vanity Arrival</span>
    <h3>+ Tambah Produk ke Etalase</h3>
    <label class="q">Kategori</label>
    <select id="nvCat" style="width:100%"><option value="Skincare">Skincare</option><option value="Hair & Body">Hair &amp; Body Care</option><option value="Makeup">Makeup</option></select>
    <label class="q">Nama Produk</label>
    <input type="text" id="nvName" style="width:100%" placeholder="Misal: Centella Soothing Gel / Lip Tint">
    <label class="q">Ikon Visual Botol / Produk</label>
    <select id="nvRole" style="width:100%">
      <option value="moist">Jar Krim (Soothing Cream)</option>
      <option value="clean">Tabung Cleanser</option>
      <option value="spf">Tabung Sunscreen</option>
      <option value="hair">Jar Hair Mask</option>
      <option value="makeup">Compact Cushion Berpita</option>
      <option value="lip">Lip Gloss / Tint Wand</option>
      <option value="other">Botol Parfum Pita</option>
    </select>
    <label class="q">Catatan Singkat</label>
    <input type="text" id="nvNote" style="width:100%" placeholder="Cara pakai di kulit/rambutku...">
    <button class="btn big" style="margin-top:12px" onclick="S.vanity.push({id:'v'+Date.now(),cat:$('#nvCat').value,name:$('#nvName').value||'Produk Baru',badge:'Andalan Kampus',role:$('#nvRole').value,note:$('#nvNote').value,img:null});save();$('#sheet').close();render()">Tambahkan ke Etalase ✨</button>
  `);
}

function tag(t) { const a = sd(sel).tags, i = a.indexOf(t); i < 0 ? a.push(t) : a.splice(i, 1); save(); render(); }
function wset(w, k, v, r) { wk(w)[k] = v; save(); if (r) render(); }
function ci(f, k, v) { f(sel)[k] = v; save(); }

function vSkin() {
  const d = sel, s = sd(d), w = wkN(d), wr = wk(w), o = ["Lebih tenang", "Sama saja", "Lebih reaktif / iritasi"];
  const tags = s.tags || [];
  const heroMoist = getVanityByRole("moist", "Centella soothing cream");
  let advice = `Fokus pada cuci muka lembut, ${heroMoist}, dan sunscreen.`;
  if (tags.includes("Terasa nyeri") || tags.includes("Jerawat baru") || tags.includes("Masa hormonal")) advice = `Ada jerawat meradang/hormonal: jangan disentuh/dipencet. Oleskan ${heroMoist} ekstra dan pastikan sarung bantal bersih.`;
  else if (tags.includes("Kering") || tags.includes("Iritasi")) advice = `Skin barrier butuh istirahat: pagi cukup bilas air biasa, malam oles ${heroMoist}.`;

  const skinToday = `<div class="card tier-primary">
    ${dayNav()}
    <div class="boutique-hdr"><span class="boutique-hdr-title">Skin Diary · Hari ${d}</span><button class="chip ${S.periodMode ? "on" : ""}" onclick="togglePeriodMode()">🌸 ${S.periodMode ? "Mode PMS Aktif" : "Mode PMS"}</button></div>
    <p class="note">🌸 <b>Saran untuk kulitmu hari ini:</b> ${E(advice)}</p>
    <div class="chips">${TAGS.map(t => `<button class="chip ${s.tags.includes(t) ? "on" : ""}" onclick="tag('${t}')">${t}</button>`).join("")}</div>
    <label class="q" for="sn">Catatan Kondisi Kulit &amp; Pemicu</label>
    <textarea id="sn" placeholder="Misal: habis begadang scanlation, memakai soothing cream, kulit lebih kalem..." oninput="ci(sd,'note',this.value)">${E(s.note)}</textarea>
  </div>`;

  const vanity = `<div class="coq-frame tier-primary">
    <div class="coq-inner">
      <div class="boutique-hdr">
        <span class="boutique-hdr-title">My Vanity Shelf · Etalase Meja Rias</span>
        <button class="chip on" onclick="addVanityModal()">+ Produk</button>
      </div>
      <p class="mut" style="margin:0 0 6px;font-size:0.8rem">Ketuk bingkai cermin untuk pasang foto produk aslimu atau mengubah statusnya.</p>
      <div class="vanity-grid">
        ${(S.vanity || []).map((v, idx) => `<div class="mirror-card ${v.badge === "Penyelamat Breakout" ? "hero-prod" : ""}" onclick="editVanityItem(${idx})">
          <div class="mirror-crown">❦ NO. 0${idx + 1} ❦</div>
          <div class="mirror-well">${artForVanity(v)}</div>
          <span class="vanity-badge">${E(v.badge)}</span>
          <b style="display:block;font-family:'Cormorant Garamond',serif;font-size:1.14rem;line-height:1.2;margin:2px 0">${E(v.name)}</b>
          <small class="mut" style="display:block;font-size:0.75rem">${E(v.note || v.cat)}</small>
        </div>`).join("")}
      </div>
    </div>
  </div>`;

  const weekly = `<div class="card tier-quiet">
    <div class="boutique-hdr"><span class="boutique-hdr-title">Weekly Skin Check · Minggu ${w}</span></div>
    <div class="chips">${o.map(x => `<button class="chip ${wr.skin === x ? "on" : ""}" onclick="wset(${w},'skin','${x}',1)">${x}</button>`).join("")}</div>
    <textarea placeholder="Pola kulit yang kusadari minggu ini..." oninput="wset(${w},'skinNote',this.value)">${E(wr.skinNote)}</textarea>
  </div>`;

  const gallery = `<div class="card tier-quiet">
    <div class="boutique-hdr"><span class="boutique-hdr-title">Private Progress Gallery 📷</span></div>
    <input type="file" accept="image/*" id="ph" hidden onchange="addPhoto(this)">
    <button class="btn-ed" onclick="$('#ph').click()"><span>+ Simpan Foto Kulit / Mirror Check Hari ${d}</span><span class="arr">→</span></button>
    ${S.photos.length ? `<div class="ph" style="margin-top:10px">${S.photos.map((p, i) => `<div><img src="${window.__photoUrl?.(p.src) || p.src}" alt="Hari ${p.d}"><div class="dn"><small>Hari ${p.d}</small><button class="lk" onclick="ask('Hapus foto?','Foto akan dihapus dari akun dan penyimpananmu.','Hapus',async()=>{try{await window.__deleteGlowImage?.(S.photos[${i}].src);S.photos.splice(${i},1);save();render()}catch(e){toast('Foto belum dapat dihapus. Coba lagi.')}})">Hapus</button></div></div>`).join("")}</div>` : '<div class="empty">Belum ada foto progres. Foto disimpan privat di akunmu.</div>'}
  </div>`;
  return skinToday + vanity + weekly + gallery;
}

function addPhoto(el) {
  const f = el.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const i = new Image();
    i.onload = async () => {
      const c = document.createElement("canvas"), k = Math.min(1, 480 / Math.max(i.width, i.height));
      c.width = i.width * k; c.height = i.height * k;
      c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
      try {
        const src = await window.__uploadGlowImage(c, "progress", 0.68);
        S.photos.push({ id: crypto.randomUUID(), d: sel, src });
        save();
        toast(src.startsWith("local:") ? "Foto disimpan dan menunggu sinkronisasi 📷" : "Foto tersimpan secara privat 📷");
        render();
      } catch (e) { toast("Foto belum dapat disimpan. Coba lagi."); }
    };
    i.onerror = () => toast("Berkas foto tidak dapat dibuka.");
    i.src = r.result;
  };
  r.readAsDataURL(f);
  el.value = "";
}

/* ===== Sub-Tab Postur ===== */
function vBody() {
  const w = wkN(sel), wr = wk(w), cs = ["Nyaman & ringan", "Agak pegal di bahu/leher", "Lelah / butuh istirahat"];
  const ok = x => x && (x.post1 || x.post_routine || x.breaks || x.wall);
  let dots = "";
  for (let i = Math.max(1, todayN() - 6); i <= todayN(); i++) dots += `<span class="pd ${ok(S.done[i]) ? "full" : ""}" title="Hari ${i}"></span>`;
  const postVids = (S.media || []).filter(m => m.cat === "posture");

  const exercise = `<div class="card tier-primary">
    <div class="boutique-hdr"><span class="boutique-hdr-title">1–5 Minute Desk &amp; Class Reset</span></div>
    <ul style="padding-left:18px;margin:6px 0;line-height:1.6">
      <li><b>Chin Tucks:</b> tarik dagu lurus ke belakang perlahan 5 kali.</li>
      <li><b>Shoulder Blade Squeeze:</b> tarik bahu ke belakang-bawah, tahan 3 detik × 5.</li>
      <li><b>Doorway Chest Opener:</b> lengan di kusen pintu, condongkan dada 20 detik.</li>
      <li><b>30-Second Wall Poise:</b> berdiri tegak bersandar di dinding selama 30 detik.</li>
    </ul>
    <button class="btn-ed" onclick="toggle('post1', ${todayN()})"><span>${(S.done[todayN()] || {}).post1 ? "✓ Postur 1 Menit Hari Ini Selesai" : "Tandai Selesai: Reset Postur 1 Menit"}</span><span class="arr">→</span></button>
  </div>`;
  const videos = `<div class="card tier-primary">
    <div class="boutique-hdr"><span class="boutique-hdr-title">Guided Videos · Instruktur Wanita</span></div>
    <div class="media-grid">${postVids.map(m => `<div class="media-card-vis">
      <div class="media-thumb" onclick="openMediaPlay('${m.id}')"><img src="${E(m.thumb)}" alt="${E(m.title)}"><div class="play-pill">▶</div><span class="dur-tag">${E(m.dur)}</span></div>
      <div><b style="font-family:'Cormorant Garamond',serif;font-size:1.12rem;display:block">${E(m.title)}</b><small class="mut" style="display:block;margin-bottom:6px">${E(m.creator)}</small><a class="chip on" href="${E(m.url)}" target="_blank" rel="noopener noreferrer" style="padding:3px 10px;font-size:0.74rem">↗ Tonton Panduan</a></div>
    </div>`).join("")}</div>
  </div>`;
  const progress = `<div class="card tier-quiet">
    <div class="boutique-hdr"><span class="boutique-hdr-title">Graceful Poise &amp; Posture</span></div>
    <p style="margin:4px 0">7 hari terakhir: ${dots}</p>
    <p class="mut" style="margin:0;font-size:0.83rem">${Object.keys(S.done).filter(k => ok(S.done[k])).length} hari dengan jeda postur atau peregangan bahu.</p>
  </div>`;
  const weekly = `<div class="card tier-quiet">
    <div class="boutique-hdr"><span class="boutique-hdr-title">Refleksi Tubuh · Minggu ${w}</span></div>
    <div class="chips">${cs.map(x => `<button class="chip ${wr.body === x ? "on" : ""}" onclick="wset(${w},'body','${x}',1)">${x}</button>`).join("")}</div>
    <textarea placeholder="Catatan kenyamanan leher & punggung minggu ini..." oninput="wset(${w},'bodyNote',this.value)">${E(wr.bodyNote)}</textarea>
  </div>`;
  return exercise + videos + progress + weekly;
}

const SEG = (arr, cur, v) => `<div class="seg">${arr.map(a => `<button class="chip ${cur == a[0] ? "on" : ""}" onclick="${v}='${a[0]}';render()">${a[1]}</button>`).join("")}</div>`;
function vAct() {
  if (!["fx", "md", "sk", "po"].includes(sA)) sA = "fx";
  const labels = { fx: "Katalog", md: "Media", sk: "Etalase Rak", po: "Postur" };
  return `<header class="screen-heading"><span class="eyebrow">Aktivitas · ${labels[sA]}</span><h1>Aktivitas</h1></header>
    <nav class="activity-tabs" aria-label="Kategori aktivitas">${SEG([["fx", "Katalog"], ["md", "Media"], ["sk", "Etalase Rak"], ["po", "Postur"]], sA, "sA")}</nav>
    <div class="activity-content" data-activity-view="${sA}">${({ fx: vFx, md: vMedia, sk: vSkin, po: vBody }[sA])()}</div>`;
}

/* ===== Halaman 4: Diary Lengkap + Open Wardrobe + 3 Custom OOTD Mirror Slots ===== */
const QD = [
  "Hal kecil apa yang membuat harimu terasa sedikit lebih nyaman hari ini?",
  "Satu hal yang patut kamu apresiasi dari dirimu hari ini (sekecil apa pun itu):",
  "Bagaimana rasanya tubuh dan pikiranmu setelah melewati jadwal hari ini?",
  "Momen apa hari ini yang membuatmu merasa tenang atau menjadi diri sendiri?",
  "Jika besok kamu hanya ingin melakukan satu hal lembut untuk dirimu, apakah itu?",
  "Apa yang paling kamu sukai dari caramu merawat diri belakangan ini?",
  "Apa yang bisa membuat waktu istirahat malammu nanti terasa lebih hangat?",
  "Kalimat lembut apa yang ingin kamu sampaikan untuk dirimu yang sudah berusaha hari ini?",
  "Kapan energimu terasa paling nyaman hari ini, dan kapan kamu butuh jeda?",
  "Satu hal menyenangkan di rumah yang ingin kamu nikmati dalam waktu dekat:"
];

function auto(k, v) {
  jd(sel)[k] = v; save();
  const s = $("#sv");
  if (s) { s.textContent = "Tersimpan otomatis ✓"; clearTimeout(s._t); s._t = setTimeout(() => s.textContent = "", 1800); }
}

function autoArc(k, v) {
  if (!S.archive) S.archive = dflt().archive;
  S.archive[k] = v; save();
  const s = $("#svArc");
  if (s) { s.textContent = "Arsip tersimpan ✓"; clearTimeout(s._t); s._t = setTimeout(() => s.textContent = "", 1800); }
}

function editLookSlot(idx) {
  curLookIdx = idx;
  const lk = (S.lookbook || DEFAULT_LOOKBOOK)[idx];
  sheet(`
    <span class="eyebrow">Wardrobe Lookbook Slot 0${idx + 1}</span>
    <h3>${E(lk.title)}</h3>
    <div class="row" style="margin:8px 0">
      <button class="btn" onclick="$('#lookPhIn').click()">📷 Unggah Foto OOTD / Baju Asliku</button>
      ${lk.img ? `<button class="chip" onclick="window.__deleteGlowImage?.(S.lookbook[${idx}].img).catch(()=>{});S.lookbook[${idx}].img=null;save();$('#sheet').close();render()">Reset Ilustrasi</button>` : ""}
    </div>
    <label class="q">Judul Look</label>
    <input type="text" id="lkTitle" style="width:100%" value="${E(lk.title)}">
    <label class="q">Catatan Kombinasi Pakaian</label>
    <input type="text" id="lkDesc" style="width:100%" value="${E(lk.desc)}">
    <button class="btn big" style="margin-top:12px" onclick="S.lookbook[${idx}].title=$('#lkTitle').value;S.lookbook[${idx}].desc=$('#lkDesc').value;save();$('#sheet').close();render()">Simpan Lookbook ✨</button>
  `);
}

async function handleLookPhoto(el) {
  const f = el.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const i = new Image();
    i.onload = async () => {
      const c = document.createElement("canvas"), k = Math.min(1, 420 / Math.max(i.width, i.height));
      c.width = i.width * k; c.height = i.height * k;
      c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
      if (!Array.isArray(S.lookbook)) S.lookbook = DEFAULT_LOOKBOOK;
      try {
        S.lookbook[curLookIdx].img = await window.__uploadGlowImage(c, "lookbook", 0.75, S.lookbook[curLookIdx].img);
        save();
        toast(S.lookbook[curLookIdx].img.startsWith("local:") ? "Foto disimpan dan menunggu sinkronisasi 📷" : "Foto OOTD berhasil dipasang di cermin lemarimu 👗");
        if ($("#sheet").open) $("#sheet").close();
        render();
      } catch (e) { toast("Foto belum dapat disimpan. Coba lagi."); }
    };
    i.src = r.result;
  };
  r.readAsDataURL(f);
}

function vJournal() {
  const d = sel, j = jd(d), w = wkN(d), wr = wk(w), ar = S.archive || dflt().archive;
  const looks = S.lookbook || DEFAULT_LOOKBOOK;
  const lookIcons = [ART.camisole, ART.dressform, ART.shoe];
  const row = (k, a, em) => `<div class="chips">${a.map((x, i) => `<button class="chip ${j[k] === i ? "on" : ""}" onclick="setCi(${d},'${k}',${i})">${em ? em[i] + " " : ""}${x}</button>`).join("")}</div>`;

  let h = `<header class="screen-heading"><span class="eyebrow">Diary · Hari ${d} · ${dateOf(d)}</span><h1>Personal Diary Entry</h1></header>
  <div class="card paper diary-entry tier-primary">
    ${dayNav()}
    <div class="sv" id="sv" aria-live="polite"></div>
    <label class="q">Suasana Hatiku (Hari ${d})</label>
    ${row("mood", MOOD, ME)}
    <label class="q">Tingkat Energiku</label>
    ${row("energy", EN)}
    <label class="q" for="j1">✦ Prompt Hari Ini: ${QD[(d - 1) % 10]}</label>
    <textarea id="j1" rows="3" placeholder="Tulis catatan atau curhatanmu hari ini..." oninput="auto('text',this.value)">${E(j.text)}</textarea>
    <details style="margin-top:8px" ${j.well || j.tom ? "open" : ""}>
      <summary style="font-weight:700;color:var(--brown);font-size:0.84rem">+ Catatan Syukur &amp; Keinginan Kecil Besok</summary>
      <label class="q" for="j2">Hal kecil yang kusyukuri / membuatku nyaman hari ini</label>
      <textarea id="j2" oninput="auto('well',this.value)">${E(j.well)}</textarea>
      <label class="q" for="j3">Besok aku ingin memberi ruang untuk…</label>
      <textarea id="j3" oninput="auto('tom',this.value)">${E(j.tom)}</textarea>
    </details>
  </div>

  ${renderJarCard("diary-jar tier-quiet")}

  ${renderNookCard()}

  <div class="wardrobe-box diary-wardrobe tier-quiet">
    <span class="eyebrow">My Open Wardrobe &amp; Beauty Dossier</span>
    <h3 class="script" style="font-size:2rem;margin:2px 0">Lemari &amp; Lookbook Pesonaku</h3>
    <svg class="wardrobe-svg" viewBox="0 0 420 155" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 18 L75 30 L75 138 L18 148 Z" fill="#f6dfe2" stroke="#4a302c" stroke-width="2"/>
      <rect x="28" y="34" width="36" height="44" rx="4" fill="none" stroke="#9e525d" stroke-width="1.3"/>
      <rect x="28" y="86" width="36" height="42" rx="4" fill="none" stroke="#9e525d" stroke-width="1.3"/>
      <path d="M402 18 L345 30 L345 138 L402 148 Z" fill="#f6dfe2" stroke="#4a302c" stroke-width="2"/>
      <rect x="356" y="34" width="36" height="44" rx="4" fill="none" stroke="#9e525d" stroke-width="1.3"/>
      <rect x="356" y="86" width="36" height="42" rx="4" fill="none" stroke="#9e525d" stroke-width="1.3"/>
      <rect x="75" y="26" width="270" height="114" fill="#fffaf7" stroke="#4a302c" stroke-width="2"/>
      <path d="M75 26 Q210 4 345 26" fill="#f4cfd5" stroke="#4a302c" stroke-width="2"/>
      <circle cx="210" cy="17" r="5" fill="#cc8892"/>
      <line x1="85" y1="42" x2="335" y2="42" stroke="#c59b6d" stroke-width="2.5"/>
      <path d="M130 42 C130 36 136 36 134 42 L118 54 L148 54 Z" fill="none" stroke="#4a302c" stroke-width="1.5"/>
      <path d="M120 54 L146 54 L154 118 L112 118 Z" fill="#f4cfd5" stroke="#4a302c" stroke-width="1.5"/>
      <path d="M210 42 C210 36 216 36 214 42 L198 54 L228 54 Z" fill="none" stroke="#4a302c" stroke-width="1.5"/>
      <path d="M198 54 L228 54 L224 86 L202 86 Z" fill="#fff" stroke="#4a302c" stroke-width="1.5"/>
      <path d="M200 86 L226 86 L234 118 L192 118 Z" fill="#d8e2dc" stroke="#4a302c" stroke-width="1.5"/>
      <path d="M286 42 C286 36 292 36 290 42 L274 54 L304 54 Z" fill="none" stroke="#4a302c" stroke-width="1.5"/>
      <path d="M274 54 L304 54 L310 112 L268 112 Z" fill="#faeaec" stroke="#4a302c" stroke-width="1.5"/>
      <circle cx="289" cy="68" r="3" fill="#cc8892"/>
    </svg>
    <p class="mut" style="margin:0 0 6px;font-size:0.78rem">Ketuk cermin di bawah untuk memajang foto OOTD atau baju favoritmu:</p>
    <div class="lookbook-grid">
      ${looks.map((lk, idx) => `<div class="mirror-card" onclick="editLookSlot(${idx})" style="padding:8px 6px">
        <div class="mirror-crown">0${idx + 1}</div>
        <div class="mirror-well" style="width:68px;height:82px">${lk.img ? `<img src="${window.__photoUrl?.(lk.img) || lk.img}" alt="${E(lk.title)}">` : lookIcons[idx % 3]}</div>
        <b style="display:block;font-family:'Cormorant Garamond',serif;font-size:0.98rem">${E(lk.title)}</b>
        <small class="mut" style="font-size:0.7rem;display:block">${E(lk.desc)}</small>
      </div>`).join("")}
    </div>
    <div class="sv" id="svArc" aria-live="polite"></div>
    <table class="ed-table" style="text-align:left;background:var(--card);border-radius:14px;padding:6px">
      <tr><th>Calm Skin Hero</th><td><input class="ed-input" type="text" value="${E(ar.calmSkin)}" oninput="autoArc('calmSkin',this.value)"></td></tr>
      <tr><th>Lip &amp; Makeup</th><td><input class="ed-input" type="text" value="${E(ar.lipCombo)}" oninput="autoArc('lipCombo',this.value)"></td></tr>
      <tr><th>Hair Style</th><td><input class="ed-input" type="text" value="${E(ar.hairLook)}" oninput="autoArc('hairLook',this.value)"></td></tr>
      <tr><th>Go-To Outfit</th><td><input class="ed-input" type="text" value="${E(ar.outfit)}" oninput="autoArc('outfit',this.value)"></td></tr>
      <tr><th>Instant Pretty</th><td><input class="ed-input" type="text" value="${E(ar.feelPretty)}" oninput="autoArc('feelPretty',this.value)"></td></tr>
    </table>
  </div>

  <details class="card diary-weekly tier-primary">
    <summary><span class="serif" style="font-size:1.18rem">Ulasan Mingguan · Minggu ${w}</span> <small>Hari ${w == 4 ? "22–30" : (w * 7 - 6) + "–" + (w * 7)}</small></summary>
    <label class="q" for="w1">Apa yang terasa paling nyaman dan realistis minggu ini?</label>
    <textarea id="w1" oninput="wset(${w},'ok',this.value)">${E(wr.ok)}</textarea>
    <label class="q" for="w2">Apa yang menguras energi, dan apa yang bisa membantu minggu depan?</label>
    <textarea id="w2" oninput="wset(${w},'hard',this.value)">${E(wr.hard)}</textarea>
    <label class="q" for="w3">Satu ritual kecil yang ingin terus kubawa</label>
    <textarea id="w3" oninput="wset(${w},'keep',this.value)">${E(wr.keep)}</textarea>
  </details>`;

  if (d == 30) {
    const f = wk("final");
    h += `<div class="card soft diary-final tier-primary">
      <h3>Surat untuk Diriku di Hari ke-30 🎀</h3>
      <label class="q" for="f1">Perubahan kecil apa yang paling kurasakan dibanding Hari 1?</label>
      <textarea id="f1" oninput="wset('final','a',this.value)">${E(f.a)}</textarea>
      <label class="q" for="f2">Kebiasaan mana yang kini terasa alami?</label>
      <textarea id="f2" oninput="wset('final','b',this.value)">${E(f.b)}</textarea>
      <label class="q" for="f3">Pesan hangat untuk diriku sendiri</label>
      <textarea id="f3" oninput="wset('final','c',this.value)">${E(f.c)}</textarea>
    </div>`;
  }

  const hs = Object.keys(S.j).map(Number).filter(k => {
    const x = S.j[k];
    return x && (x.mood != null || x.text || x.well || x.tom);
  }).sort((a, b) => b - a);

  return h + `<div class="card diary-archive tier-quiet">
    <div class="boutique-hdr"><span class="boutique-hdr-title">Arsip Lembar Sebelumnya</span></div>
    ${hs.length ? hs.map(k => {
      const x = S.j[k];
      return `<button class="opt" style="width:100%;margin:5px 0" onclick="setSel(${k})"><div><b>Hari ${k} · ${dateOf(k)}</b> ${x.mood != null ? ME[x.mood] + " " + MOOD[x.mood] : ""}<small>${E((x.text || x.well || x.tom || "").slice(0, 90))}</small></div></button>`;
    }).join("") : '<div class="empty">Belum ada catatan tersimpan.</div>'}
  </div>`;
}

/* ===== Halaman 5: Profil, Backup/Restore Archive Key & Jadwal KRS ===== */
const dw = ids => Object.keys(S.done).filter(k => ids.some(i => (S.done[k] || {})[i])).length;
const backTrack = () => {
  for (let d = 4; d <= todayN(); d++) {
    if (active(d) && !active(d - 1) && !active(d - 2)) {
      for (let e = 1; e < d - 2; e++) if (active(e)) return true;
    }
  }
  return false;
};

const ACH = [
  ["first", "First Page Opened", "Memulai langkah pertamamu di jurnal ini.", () => total() > 0 || daysIn() > 0, "spark"],
  ["skin", "Calm Skin Devotee", "Merawat kulit dengan lembut di 5 hari berbeda.", () => dw(["pm_clean", "pm_moist", "am_clean"]) >= 5, "skin"],
  ["post", "Graceful Poise", "Memberi jeda peregangan leher dan bahu.", () => dw(["breaks", "post1", "post_routine", "wall"]) >= 1, "body"],
  ["sun", "Sunday Reset Ritual", "Menikmati perawatan diri di hari Minggu.", () => Object.keys(S.done).some(k => dow(+k) == 0 && ["hair", "lotion", "nails", "tidy", "alone", "mandi", "healing", "pillow"].some(i => S.done[k][i])) || Object.keys(S.acts).some(k => dow(+k) == 0 && S.acts[k].some(a => a.done)), "self"],
  ["back", "Gentle Return", "Kembali hadir setelah beberapa hari jeda.", backTrack, "map"],
  ["pace", "Unapologetic Rest", "Menggunakan Hari Minimal, Penyelamat 2 Menit, atau Istirahat.", () => Object.values(S.low).some(Boolean) || Object.values(S.rest).some(Boolean) || Object.values(S.rescue).some(Boolean), "rest"],
  ["d30", "Her Era · Issue 30", "Menemani dirimu hingga halaman ke-30.", () => active(30) && daysIn() >= 10, "self"]
];

const GIFTS = [
  "Menonton 1 episode serial/drama favorit tanpa rasa bersalah",
  "Waktu santai bebas tugas sebelum jam kerja malam",
  "Minuman atau jajanan favorit sore ini",
  "Mandi air hangat + hair mask lebih lama di hari mandi utama",
  "Rebahan sambil mendengarkan album favorit dari awal",
  "Membaca webtoon/buku favorit murni untuk hiburan"
];

function checkAch() {
  const nw = [], now = new Date().toISOString();
  ACH.forEach(a => { if (!S.ach[a[0]] && a[3]()) { S.ach[a[0]] = now; nw.push(a[1]); } });
  PHASES.forEach((p, i) => {
    let n = 0; for (let x = p[0]; x <= p[1]; x++) if (active(x)) n++;
    if (!S.ach["m" + i] && n >= (i == 3 ? 5 : 4)) { S.ach["m" + i] = now; nw.push(p[2]); }
  });
  if (nw.length) { save(); toast("Keepsake baru tersimpan: " + nw[0] + " 🎀"); }
}

function claim(i) { S.gifts[i] = S.gifts[i] ? null : new Date().toISOString(); save(); render(); }
const fd = s => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

/* ===== NEW Feature: My Archive Key (1-Click JSON Export & Restore) ===== */
function exportArchiveJson() {
  let dataStr = "";
  try { dataStr = JSON.stringify(S, null, 2); } catch (e) { toast("Gagal menyiapkan cadangan."); return; }
  const name = `My_Glow_Up_Era_Backup_Day${todayN()}.json`;
  if (DL) {
    offerFile(name, new Blob([dataStr], { type: "application/json" }), "File cadangan arsip (.json) tersimpan ✨");
    return;
  }
  sheet(`<span class="eyebrow">My Archive Key</span>
    <h3>Salin Cadangan Arsipmu</h3>
    <p class="mut" style="margin:0 0 8px;font-size:0.83rem">Penyimpanan file belum tersedia di tampilan ini. Salin teks di bawah, lalu simpan di aplikasi Catatan.</p>
    <textarea id="bkpTxt" rows="6" readonly></textarea>
    <div class="row" style="margin-top:8px"><button class="btn" onclick="copyBackupText()">Salin Teks Cadangan</button></div>
    <label class="q" for="bkpIn">Pulihkan dari teks cadangan</label>
    <textarea id="bkpIn" rows="3" placeholder="Tempel teks cadangan di sini..."></textarea>
    <div class="row" style="margin-top:8px"><button class="btn ghost" onclick="if(restoreFromText($('#bkpIn').value))$('#sheet').close()">Pulihkan</button></div>`);
  $("#bkpTxt").value = dataStr;
}

function copyBackupText() {
  const t = $("#bkpTxt"); if (!t) return;
  const pick = () => { t.focus(); t.select(); t.setSelectionRange(0, t.value.length); toast("Teks terpilih. Ketuk Salin di menu yang muncul."); };
  try { navigator.clipboard.writeText(t.value).then(() => toast("Teks cadangan tersalin ✨"), pick); } catch (e) { pick(); }
}

function restoreFromText(txt) {
  try {
    const parsed = JSON.parse(txt);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid");
    S = Object.assign(dflt(), parsed);
    normBooks();
    save();
    sel = todayN();
    render();
    toast("Seluruh arsip, jurnal & fotomu berhasil dipulihkan! 🌸");
    return true;
  } catch (e) {
    toast("File cadangan tidak valid.");
    return false;
  }
}

function handleRestoreFile(el) {
  const f = el.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => restoreFromText(r.result);
  r.readAsText(f);
}

function planCard(d) {
  const w = dow(d), it = plan(w, d), raw = Math.round((D0(new Date()) - S.start) / 864e5) + 1, n = new Date(), now = n.getHours() * 60 + n.getMinutes();
  let h = `<div class="card">
    <div class="boutique-hdr"><span class="boutique-hdr-title">${NAMA[w]} · ${isBathDay(d) ? "Hari Mandi Utama 🛁" : "Rencana Ritme Harian"}</span></div>`;
  if (d == raw && it.length) {
    const cur = [...it].reverse().find(x => x.m <= now), nx = it.find(x => x.m > now);
    h += `<p class="note">Sekarang ${fm(now)}: ${cur ? cur.l : "belum ada agenda terjadwal"}${nx ? ` · berikutnya ${fm(nx.m)} ${nx.l}` : ""}</p>`;
  }
  h += it.length
    ? it.map(x => `<div class="tl"><b>${fm(x.m)}</b><span>${IC[x.k]} ${E(x.l)}</span></div>`).join("")
    : '<div class="empty">Tidak ada kuliah atau jam kerja tetap. Hari ini fleksibel.</div>';
  h += recs(w, d).map(r => `<p class="note">${E(r)}</p>`).join("");
  return h + '</div>';
}

function vJadwal() {
  const sc = S.sch, td = new Date().getDay(), wo = S.sch.work[ed] || ["", ""];
  const days = [1, 2, 3, 4, 5, 6, 0];
  const dayTabs = days.map(w => {
    const count = sc.courses.filter(c => c.day == w && vc(c)).length;
    return `<button type="button" class="schedule-day-btn ${w == td ? "today" : ""} ${w == ed ? "sel" : ""}" onclick="ed=${w};render()" aria-pressed="${w == ed}">
      <span>${NAMA[w]}</span><small>${count ? `${count} kelas` : "Kosong"}</small>
    </button>`;
  }).join("");
  const selectedCourses = sc.courses.filter(c => c.day == ed && vc(c)).sort((a, b) => tm(a.s) - tm(b.s));
  const courseCards = selectedCourses.length
    ? selectedCourses.map(c => `<article class="schedule-course-card">
        <div class="schedule-course-heading"><span class="eyebrow">MATA KULIAH</span><h3>${E(c.n || "Mata kuliah")}</h3></div>
        <div class="schedule-course-time"><span class="eyebrow">WAKTU</span><b>${fm(tm(c.s))} – ${fm(tm(c.e))}</b></div>
      </article>`).join("")
    : '<p class="schedule-empty">Belum ada mata kuliah untuk hari ini.</p>';
  const workSummary = wo[0] ? `<span class="schedule-meta-item"><small>Kerja</small><b>${fm(tm(wo[0]))} – ${fm(tm(wo[1]))}</b></span>` : "";
  const wakeSummary = sc.wake[ed] ? `<span class="schedule-meta-item"><small>Bangun</small><b>${fm(tm(sc.wake[ed]))}</b></span>` : "";
  const bathSummary = sc.bath.includes(ed) ? '<span class="schedule-meta-item"><small>Perawatan</small><b>Mandi utama</b></span>' : "";

  const rows = sc.courses.map((c, i) => c.day == ed ? `<div class="crow"><input type="time" value="${c.s}" onchange="setC(${i},'s',this.value)"><input type="time" value="${c.e}" onchange="setC(${i},'e',this.value)"><input type="text" value="${E(c.n)}" onchange="setC(${i},'n',this.value)"><button class="chip" onclick="delC(${i})">Hapus</button></div>` : "").join("");

  return `<section class="card schedule-overview">
    <div class="schedule-heading"><div><span class="eyebrow">JADWAL MINGGUAN</span><h2>${NAMA[ed]}</h2></div><button type="button" class="btn ghost schedule-edit-cta" onclick="const e=document.querySelector('.schedule-editor');if(e){e.open=true;e.scrollIntoView({behavior:'smooth',block:'start'})}">Atur jadwal</button></div>
    <div class="schedule-day-strip" aria-label="Pilih hari">${dayTabs}</div>
    <div class="schedule-course-list">${courseCards}</div>
    ${(workSummary || wakeSummary || bathSummary) ? `<div class="schedule-meta">${workSummary}${wakeSummary}${bathSummary}</div>` : ""}
  </section>
  <details class="card schedule-editor" ${scheduleEditorOpen ? "open" : ""} ontoggle="scheduleEditorOpen=this.open">
    <summary>Atur jadwal ${NAMA[ed]}</summary>
    <div class="schedule-editor-content">
      <label class="q">Jam bangun (kosongkan jika fleksibel)</label>
      <input type="time" value="${sc.wake[ed] || ""}" onchange="setWake(this.value)">
      <label class="q">Jam kerja scanlation</label>
      <div class="crow"><input type="time" value="${wo[0]}" onchange="setWork(0,this.value)"><input type="time" value="${wo[1]}" onchange="setWork(1,this.value)"></div>
      <label class="q">Mata Kuliah (${NAMA[ed]})</label>
      ${rows || '<div class="empty">Tidak ada mata kuliah di hari ini.</div>'}
      <button class="btn ghost" onclick="addC()">+ Tambah Mata Kuliah</button>
      <label class="q">Hari Mandi Utama (Selasa, Jumat, Minggu)</label>
      <div class="chips">${days.map(w => `<button class="chip ${sc.bath.includes(w) ? "on" : ""}" onclick="bath(${w})">${NAMA[w]}</button>`).join("")}</div>
      <label class="q">Waktu perjalanan ke kampus (menit)</label>
      <input type="number" min="0" max="240" value="${sc.travel}" onchange="S.sch.travel=Math.max(0,+this.value||0);save();render()">
      <button class="btn ghost big" style="margin-top:12px" onclick="ask('Kembalikan jadwal KRS awal?','Jadwal mingguan akan dikembalikan ke KRS awal.','Kembalikan',()=>{S.sch=mkSch();save();render()})">Kembalikan ke Jadwal KRS Awal</button>
    </div>
  </details>`;
}

function setWake(v) { v ? S.sch.wake[ed] = v : delete S.sch.wake[ed]; save(); render(); }
function setWork(i, v) { const w = S.sch.work[ed] || ["", ""]; w[i] = v; if (!w[0] && !w[1]) delete S.sch.work[ed]; else S.sch.work[ed] = w; save(); render(); }
function setC(i, k, v) { S.sch.courses[i][k] = v; save(); render(); }
function addC() { S.sch.courses.push({ day: ed, s: "08:00", e: "10:00", n: "Mata kuliah baru" }); save(); render(); }
function delC(i) { ask("Hapus mata kuliah?", "Mata kuliah ini akan dihapus.", "Hapus", () => { S.sch.courses.splice(i, 1); save(); render(); }); }
function bath(w) { const b = S.sch.bath, i = b.indexOf(w); i < 0 ? b.push(w) : b.splice(i, 1); save(); render(); }

function resetAll() {
  ask("Mulai lembar baru dari Hari 1?", "Lembar saat ini akan diarsipkan dan riwayatnya tetap tersimpan.", "Ya, Lembar Baru", async () => {
    const fresh = dflt();
    try { await window.__glowStartNewJourney?.(S, fresh); }
    catch (e) { toast("Lembar baru gagal disimpan. Coba lagi saat tersambung."); return; }
    S = fresh; sel = 1; tab = "today"; ciOpen = undefined; save(); render(); toast("Lembar baru dimulai 🌸");
  });
}

function setStart(v) {
  if (!v) return;
  const p = v.split("-");
  S.start = new Date(+p[0], +p[1] - 1, +p[2]).getTime();
  save(); sel = todayN(); render();
}

function vMe() {
  if (!["kol", "jd", "pg"].includes(sP)) sP = "kol";
  const labels = { kol: "Keepsakes", jd: "Jadwal & KRS", pg: "Pengaturan" };
  let h = `<header class="screen-heading"><span class="eyebrow">${labels[sP]} · Hari ${todayN()} · ${dateOf(todayN())}</span><h1>Profil</h1></header>
    <nav class="profile-tabs" aria-label="Bagian profil">${SEG([["kol", "Keepsakes"], ["jd", "Jadwal & KRS"], ["pg", "Pengaturan"]], sP, "sP")}</nav>`;
  if (sP == "kol") {
    const all = ACH.map(a => [a[0], a[1], a[2], a[4]]).concat(PHASES.map((p, i) => ["m" + i, p[2], "Hadir di " + (i == 3 ? 5 : 4) + " hari atau lebih pada bab ini.", "map"]));
    h += `<section class="profile-aura tier-quiet">${renderAuraCard(false)}</section>
    <div class="card profile-keepsakes tier-quiet">
      <div class="boutique-hdr"><span class="boutique-hdr-title">Stamp &amp; Ribbon Keepsakes</span></div>
      <div class="stamp-grid">
        ${all.map(a => {
          const e = S.ach[a[0]];
          return `<div class="ach-stamp ${e ? "unlocked" : "lock"}">
            <span class="ai">${ico(a[3], 18)}</span>
            <div>
              <b style="font-family:'Cormorant Garamond',serif;font-size:1.1rem">${E(a[1])}</b>
              <small style="display:block;color:var(--ink);font-size:0.78rem">${E(a[2])}</small>
              <small class="mut" style="font-size:0.72rem">${e ? "✦ Tersimpan · " + fd(e) : "Menunggu momenmu"}</small>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
    <div class="card profile-treats tier-quiet">
      <div class="boutique-hdr"><span class="boutique-hdr-title">Self-Kindness Treats</span></div>
      ${GIFTS.map((g, i) => `<div class="dn" style="padding:6px 0;border-bottom:1px dashed var(--line)"><span>${E(g)}</span><button class="chip ${S.gifts[i] ? "on" : ""}" onclick="claim(${i})">${S.gifts[i] ? "Dinikmati ✓" : "Ambil"}</button></div>`).join("")}
    </div>`;
  } else if (sP == "jd") {
    h += `<section class="profile-today tier-quiet">${planCard(todayN())}</section><section class="profile-schedule tier-primary">${vJadwal()}</section>`;
  } else {
    h += `<div class="card profile-preferences tier-primary">
      <div class="boutique-hdr"><span class="boutique-hdr-title">Editorial Preferences</span></div>
      <div class="row" style="margin:8px 0">
        <button class="btn ghost theme-toggle" id="themeBtn" type="button" onclick="toggleTheme()" aria-label="Ganti mode terang atau gelap">
          <span id="themeIco" aria-hidden="true">☾</span> <span id="themeTxt">Malam</span>
        </button>
        <button class="btn ghost" onclick="openMuseSheet()">Atur Foto Gallery Wall</button>
        <button class="btn" onclick="openRecapCardModal()">📸 Cetak Poster Edisi</button>
      </div>
      <label class="q" for="sd0">Tanggal Mulai Hari ke-1</label>
      <input type="date" id="sd0" value="${new Date(S.start).toLocaleDateString("sv-SE")}" onchange="setStart(this.value)">
    </div>
    <div class="card profile-backup tier-primary">
      <div class="boutique-hdr"><span class="boutique-hdr-title">My Archive Key · Cadangkan &amp; Pindah Perangkat</span></div>
      <p class="mut" style="margin:0 0 8px;font-size:0.83rem">Simpan seluruh jurnal, progres, isi Etalase Rak, dan fotomu ke dalam file cadangan agar aman di Safari iPhone maupun laptop.</p>
      <div class="row">
        <button class="btn" onclick="exportArchiveJson()">⬇ Unduh Cadangan Arsip (.json)</button>
        <button class="btn ghost" onclick="$('#restoreIn').click()">⬆ Pulihkan dari File Arsip</button>
      </div>
    </div>
    <div class="card profile-reset tier-quiet">
      <div class="boutique-hdr"><span class="boutique-hdr-title">Reset Perjalanan</span></div>
      <button class="btn ghost big" onclick="resetAll()">Atur Ulang Seluruh Data</button>
    </div>`;
  }
  return h;
}

const TABS2 = [["today", "Hari ini"], ["journey", "Perjalanan"], ["act", "Aktivitas"], ["diary", "Diary"], ["me", "Profil"]];
const NAV_ICONS = {
  today: `<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>`,
  journey: `<path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.2"/>`,
  act: `<path d="M6 4v16M18 4v16M3 9v6M21 9v6M6 12h12"/>`,
  diary: `<path d="M12 7v14M3 5c3-1 6-.3 9 2v14c-3-2-6-3-9-2V5Zm18 0c-3-1-6-.3-9 2v14c3-2 6-3 9-2V5Z"/>`,
  me: `<circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>`
};
function navMarkup() {
  return `<div class="sidebar-brand">Glow Up Era</div>${TABS2.map(([key, label]) => `<button class="${tab == key ? "on" : ""}" onclick="go('${key}')" aria-label="${label}" aria-current="${tab == key ? "page" : "false"}"><span class="nav-icon-wrap"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAV_ICONS[key]}</svg></span><span class="nav-label">${label}</span></button>`).join("")}`;
}

function syncThemeUI() {
  const dk = matchMedia("(prefers-color-scheme:dark)").matches;
  const cur = S.theme || (dk ? "dark" : "light");
  if (S.theme) document.documentElement.dataset.theme = S.theme;
  const ti = $("#themeIco"), tt = $("#themeTxt");
  if (ti && tt) { ti.textContent = cur == "dark" ? "☀" : "☾"; tt.textContent = cur == "dark" ? "Terang" : "Malam"; }
}

function toggleTheme() {
  const dk = matchMedia("(prefers-color-scheme:dark)").matches;
  const cur = S.theme || (dk ? "dark" : "light");
  S.theme = cur == "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = S.theme; save(); syncThemeUI();
}

function go(t) { tab = t; if (t == "today" || t == "diary" || (t == "journey" && sel < 1)) sel = todayN(); render(); scrollTo(0, 0); }

function applyCardHierarchy(view) {
  // Each redesigned tab now marks its own semantic tiers in its template.
  // Avoid inferring a hero from the first legacy card in DOM order.
  return;
}

function render() {
  const y = scrollY;
  try {
  checkAch(); syncThemeUI();
  document.body.dataset.activeTab = tab;
  $("#nav").innerHTML = navMarkup();
  $("#main").innerHTML = { today: vToday, journey: vJourney, act: vAct, diary: vJournal, me: vMe }[tab]();
  document.body.dataset.activeSubtab = tab === "act" ? sA : tab === "me" ? sP : "";
  syncThemeUI();
  applyCardHierarchy(tab);
  const rail = $("#quiet-rail"); if (rail) rail.innerHTML = `<h2 class="eyebrow rail-title">Ringkasan</h2>${tab === "today" ? vTodayQuiet() : (window.__glowApp?.getQuietHTML?.() || "")}`;
  if (tab === "me") window.__glowProfileActions?.();
  cfSweep($("#main"));
  scrollTo(0, y);
  } catch (error) {
    console.error("My Glow Up Era render failed", error);
    const main = $("#main");
    if (main) main.innerHTML = `<section class="card app-error-card"><span class="eyebrow">Diary belum dapat dimuat</span><h2>Ada bagian data yang gagal dibuka</h2><p class="mut">Perubahan tersimpan di cache perangkat. Muat ulang aplikasi untuk mencoba lagi.</p><details><summary>Detail teknis</summary><pre>${E(error?.message || error)}</pre></details><button class="btn big" type="button" onclick="location.reload()">Muat ulang</button></section>`;
    const nav = $("#nav");
    if (nav && !nav.children.length) nav.innerHTML = navMarkup();
  }
}

document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
setInterval(() => {
  if (tab == "today" && !document.querySelector("dialog[open]") && !["TEXTAREA", "INPUT", "SELECT"].includes(document.activeElement?.tagName)) render();
}, 45000);

$("#sheet").addEventListener("click", e => { if (e.target.id == "sheet") e.target.close(); });
window.__glowApp = {
  getState: () => S,
  getDefaultState: () => dflt(),
  getQuietHTML: () => `<section class="quiet-card"><span class="eyebrow">Ritme hari ini</span><h3>Hari ${todayN()} dari 30</h3><p>${streak()} hari streak · ${(S.jar || []).length} bukti kecil</p></section><section class="quiet-card"><span class="eyebrow">Ceklis ritual</span><h3>${Object.values(S.done?.[todayN()] || {}).filter(Boolean).length} selesai</h3><p>Pelan-pelan, satu langkah lembut setiap kali.</p></section><section class="quiet-card"><span class="eyebrow">Keepsake terbaru</span><h3>${Object.keys(S.ach || {}).length ? E(Object.keys(S.ach).at(-1)) : "Momenmu berikutnya"}</h3></section>`,
  render,
  replaceState(next, { persist = true } = {}) {
    S = Object.assign(dflt(), next);
    normBooks(); sel = todayN();
    if (persist) save();
    render();
  }
};
sel = todayN(); save(); render();
