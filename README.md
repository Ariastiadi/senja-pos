# SENJA POS — Versi Web (GitHub Pages + Firebase)

Ini hasil convert dari versi PHP+MySQL kamu. Sekarang murni **HTML + JavaScript**
(tidak ada server PHP sama sekali), dengan **Firebase Firestore** sebagai pengganti MySQL.
Tampilan, warna, dan alur kerja **sengaja dibuat identik** dengan versi lama.

## File yang ada
- `firebase-init.js` — konfigurasi Firebase (WAJIB diisi dulu, lihat langkah 1)
- `seed.html` — pengganti `install.php`, isi database awal (jalankan 1x saja)
- `login.html` — pengganti `login.php`
- `index.html` — pengganti `index.php` (halaman kasir utama)
- `stok.html` — pengganti `stok.php`

## Langkah 1 — Bikin project Firebase (gratis)
1. Buka https://console.firebase.google.com, klik **Add project**
2. Kasih nama (misal `senja-pos`), lanjutkan sampai selesai (boleh matikan Google Analytics)
3. Di dashboard project, klik ikon **`</>`** (Web) untuk daftarkan web app
   - Nickname bebas, **jangan** centang Firebase Hosting
4. Copy object `firebaseConfig` yang muncul, **tempel ke `firebase-init.js`** (gantikan bagian yang bertuliskan "GANTI...")
5. Di sidebar kiri: **Build → Firestore Database → Create database**
   - Pilih **Start in test mode** dulu (mode ini terbuka untuk siapa saja — lihat catatan keamanan di bawah)
   - Pilih lokasi server: `asia-southeast2 (Jakarta)` atau `asia-southeast1 (Singapore)`

## Langkah 2 — Isi data awal
Buka `seed.html` di browser (bisa langsung dobel-klik filenya untuk coba lokal dulu),
klik **"Jalankan Instalasi"**. Ini otomatis membuat semua kategori, menu, bahan baku,
resep, dan 3 akun (rani/1234, bima/2345, admin/9999) — sama persis dengan data demo yang lama.

## Langkah 3 — Upload ke GitHub, aktifkan GitHub Pages
1. Buat repository baru di GitHub (boleh private atau public)
2. Upload ke-6 file di folder ini (jangan lupa `firebase-init.js` yang sudah diisi)
3. Buka **Settings → Pages** di repo itu
4. Source: pilih branch `main`, folder `/ (root)` → Save
5. Tunggu 1-2 menit, GitHub kasih link seperti `https://namamu.github.io/nama-repo/`

## ⚠️ PENTING — soal keamanan
Karena ini murni jalan di browser (tanpa server), ada 2 hal yang beda dari versi PHP lama:

1. **Firestore "test mode" bisa diakses siapa saja yang tahu project ID-nya** — bukan cuma
   orang yang login lewat `login.html`. Untuk penggunaan internal jangka pendek ini oke,
   tapi kalau mau lebih aman, di Firebase Console buka **Firestore → Rules** dan ganti jadi
   aturan yang lebih ketat (saya bisa bantu susun kalau diminta).
2. **Perhitungan total transaksi dipercaya dari browser kasir**, bukan diverifikasi ulang oleh
   server terpisah (beda dari versi PHP yang menghitung ulang di `api.php`). Untuk pemakaian
   internal oleh kasir yang dipercaya, ini wajar — tapi kalau sistem ini nantinya dibuka ke
   pihak luar, ini jadi celah yang perlu ditutup dengan backend asli.

## Yang TIDAK berubah dari versi lama
- Semua tampilan, warna, dan animasi — sama persis
- Alur kerja: buka shift → pilih menu → bayar → cetak struk → laporan — sama persis
- Potong stok otomatis sesuai resep saat produk terjual — sama persis
- Peringatan stok menipis/habis — sama persis
