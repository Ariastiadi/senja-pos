# ☕ SENJA POS

Aplikasi kasir (Point of Sale) untuk **kafe, restoran, dan hotel** — berjalan langsung di browser, tanpa server sendiri. Dibangun dengan HTML + JavaScript, di-hosting gratis di **GitHub Pages**, dengan **Firebase** (Firestore + Authentication) sebagai database dan sistem login.

🔗 **Aplikasi web:** https://ariastiadi.github.io/senja-pos/
📱 **APK Android:** unduh di halaman [Releases](https://github.com/Ariastiadi/senja-pos/releases/latest)

---

## ✨ Fitur

**Kasir**
- Mode **Kafe** & **Hotel** dalam satu aplikasi (bisa dimatikan kalau tidak perlu)
- Dine In / Take Away / Kamar Hotel, diskon (% atau Rp), pajak (PB1/PBJT) yang bisa diatur
- Pembayaran Tunai, QRIS, Kartu, E-Wallet — hitung kembalian otomatis
- **Kirim ke Dapur** (tiket dapur tanpa harga) & **Pesanan Terbuka** — pesan dulu, bayar belakangan
- Struk: cetak biasa, printer thermal USB (WebUSB), atau kirim via **WhatsApp**
- Edit harga & foto menu langsung dari layar kasir (Admin)

**Hotel**
- **Papan Kamar**: check-in, status kamar, tagihan kamar (folio)
- **Tagihkan ke Kamar** untuk room service, bayar sekaligus saat checkout

**Operasional & Keuangan**
- Stok bahan baku + resep → stok terpotong otomatis saat menu terjual
- Buka/tutup shift dengan **rekonsiliasi kas** (selisih laci), catat kas masuk/keluar
- **Void** transaksi (Admin) — stok dikembalikan & jurnal dibalik otomatis
- Modul Keuangan: jurnal otomatis (double-entry), Laba/Rugi, Neraca, Buku Besar, export PDF/Excel/CSV
- Sinkron real-time antar device

**Keamanan** (sebagian terinspirasi [GrapheneOS](https://grapheneos.org))
- Login per karyawan lewat **Firebase Authentication** (username + PIN)
- Keypad PIN **diacak** (anti-intip), pembatasan percobaan PIN
- **Kunci otomatis** saat tidak dipakai, konfirmasi PIN untuk aksi sensitif
- **PIN darurat** (alarm diam ke device Admin)
- **Log audit** aktivitas penting
- **Firestore Security Rules** per peran (Kasir / Admin) — lihat [`firestore.rules`](firestore.rules)

---

## 🗂️ Struktur file

| File | Fungsi |
|---|---|
| `index.html` | Halaman kasir utama |
| `login.html` | Halaman login (username + PIN) |
| `stok.html` | Stok bahan baku & resep |
| `finance.html` | Modul keuangan & akuntansi (Admin) |
| `firebase-init.js` | Konfigurasi Firebase |
| `firestore.rules` | Aturan keamanan database |
| `twa-manifest.json`, `scripts/`, `.github/workflows/` | Build APK Android otomatis |

---

## 🚀 Memakai untuk usaha sendiri

1. **Fork** repo ini, lalu aktifkan **Settings → Pages** (branch `main`, folder `/ (root)`).
2. Buat project di [Firebase Console](https://console.firebase.google.com):
   - Daftarkan **Web app**, salin `firebaseConfig` ke `firebase-init.js`
   - Aktifkan **Firestore Database**
   - Aktifkan **Authentication → Sign-in method → Email/Password**
3. Buat akun Admin pertama dan isi data awal (menu, kategori, bahan, COA) di Firestore.
4. Pasang isi [`firestore.rules`](firestore.rules) di **Firestore → Rules → Publish**.
5. Login sebagai Admin → **⚙️ Pengaturan** untuk mengatur nama toko, pajak, karyawan, dan keamanan.

> ⚠️ Jangan biarkan Firestore dalam "test mode" (terbuka untuk umum) saat dipakai sungguhan.

---

## 📱 Build APK

APK dibuat otomatis oleh **GitHub Actions** (tab *Actions* → **Build APK** → *Run workflow*) dan terbit di halaman **Releases**. APK ini adalah *Trusted Web Activity*: isinya selalu mengikuti versi web terbaru, jadi perbaikan di web langsung dirasakan pengguna APK tanpa perlu update.

Kunci penandatangan APK disimpan sebagai **GitHub Secrets** (`SENJAPOS_KEYSTORE_B64`, `SENJAPOS_KEYSTORE_PASSWORD`) dan tidak pernah disimpan di repo.

---

## 🙏 Kredit

Proyek ini awalnya di-fork dari **[andrasulthan-alt/senja-pos](https://github.com/andrasulthan-alt/senja-pos)**, lalu dikembangkan lebih lanjut secara mandiri (fitur hotel & folio, pesanan terbuka / KOT, rekonsiliasi kas, void, modul keuangan, Firebase Authentication, dan penguatan keamanan).

Terima kasih kepada **andrasulthan-alt** atas fondasi awalnya. 🙌

## 📄 Lisensi

[MIT](LICENSE) — hak cipta asli tetap milik andrasulthan-alt, dengan pengembangan lanjutan oleh Ariastiadi.
