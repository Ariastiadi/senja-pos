/* =========================================================================
   SENJA POS — i18n.js  (Bahasa Indonesia ⇄ English)
   Menerjemahkan teks antarmuka secara otomatis, termasuk konten yang
   dirender JavaScript. Data pengguna (nama menu, kategori, nama toko,
   nama tamu, catatan) TIDAK ikut diterjemahkan: elemen .no-i18n dilewati.
   Kunci kamus selalu teks Indonesia tanpa ikon di depannya.
   ========================================================================= */
(function(){
  var KEY = 'senja_lang';
  var lang = 'id';
  try{ lang = localStorage.getItem(KEY) === 'en' ? 'en' : 'id'; }catch(e){}

  /* ---- Frasa utuh ---- */
  var D = {
    /* umum */
    'Simpan':'Save','Batal':'Cancel','Tutup':'Close','Kembali':'Back','Hapus':'Delete','Edit':'Edit','Tambah':'Add','Kurangi':'Decrease',
    'Lihat':'View','Buka':'Open','Pesan':'Book','Semua':'All','Baru':'New','Nama':'Name','Harga':'Price','Kategori':'Category','Tipe':'Type',
    'Catatan':'Notes','Catatan (opsional)':'Notes (optional)','Memuat…':'Loading…','Menyimpan…':'Saving…','Menutup…':'Closing…',
    'Admin':'Admin','ADMIN':'ADMIN','admin':'admin','Kasir':'Cashier','KASIR':'CASHIER','kasir':'cashier','Kafe':'Café','Hotel':'Hotel',
    'Sinkron':'Synced','Terputus':'Disconnected','Menyambungkan…':'Connecting…','Batalkan':'Cancel',

    /* login */
    'Masuk untuk membuka kasir':'Sign in to open the register','Username':'Username','username kamu':'your username',
    'Lupa PIN? Minta Admin mengatur ulang di':'Forgot your PIN? Ask an Admin to reset it in','Pengaturan →':'Settings →','Karyawan.':'Staff.',
    'Memeriksa…':'Checking…','Username atau PIN salah.':'Wrong username or PIN.','Isi username dulu.':'Enter your username first.','PIN 4–8 angka.':'PIN must be 4–8 digits.',
    'Berhasil, membuka kasir…':'Success, opening the register…','Memindahkan akun ke sistem login baru…':'Moving your account to the new sign-in system…',
    'Akun ini sudah tidak aktif. Hubungi Admin.':'This account is no longer active. Contact an Admin.','Tidak ada koneksi internet.':'No internet connection.',
    'Server mengunci sementara karena terlalu banyak percobaan. Coba lagi nanti.':'Too many attempts; the server has temporarily locked sign-in. Try again later.',
    'Admin: aktifkan Email/Password di Firebase Console → Authentication.':'Admin: enable Email/Password in Firebase Console → Authentication.',
    'Akun lama tidak bisa dipindah lagi. Minta Admin mengisi PIN baru untukmu.':'This old account can no longer be migrated. Ask an Admin to set a new PIN for you.',

    /* header & kasir */
    'Memuat SENJA POS…':'Loading SENJA POS…','Sejak':'Since','Modal':'Float','Stok':'Stock','Riwayat':'History','Laporan':'Reports','Keuangan':'Finance',
    'Pengaturan':'Settings','Kunci':'Lock','Kunci layar':'Lock screen','Tutup Shift':'Close Shift','Kelola stok →':'Manage stock →','Stok menipis':'Low stock',
    'Cari menu atau layanan…':'Search menu or service…','Dine In':'Dine In','Take Away':'Take Away','Kamar Hotel':'Hotel Room','Terbuka':'Open','Kamar':'Room',
    'Meja':'Table','No. Meja':'Table No.','cth: 12':'e.g. 12','Nama Pelanggan':'Customer Name','cth: Budi (opsional)':'e.g. Budi (optional)',
    'Tamu':'Guest','Nama tamu':'Guest name','cth: 305':'e.g. 305','Cek kamar':'Check rooms','POPULER':'POPULAR','Tersembunyi':'Hidden',
    'Tidak ada menu yang cocok.':'No matching menu items.','Pesanan Aktif':'Active Order','Bersihkan':'Clear','Tutup pesanan':'Close order',
    'Belum ada pesanan.':'No order yet.','Belum ada pesanan':'No order yet','Pilih menu untuk memulai.':'Pick a menu item to start.','Lihat pesanan':'View order',
    'Subtotal':'Subtotal','Diskon':'Discount','TOTAL':'TOTAL','BAYAR':'PAY','Kirim ke Dapur':'Send to Kitchen','Tagihkan ke Kamar':'Charge to Room',
    'baru':'new','dapur':'kitchen','Menu baru':'New menu item',

    /* shift */
    'Buka Shift Baru':'Open New Shift','Halo':'Hello','Masukkan modal awal kasir (uang kembalian) untuk memulai shift hari ini.':'Enter the opening cash float (change money) to start today’s shift.',
    'Modal awal (Rp)':'Opening float (Rp)','Mulai Shift':'Start Shift','Bukan kamu? Keluar':'Not you? Log out','Shift dibuka. Selamat bertugas!':'Shift opened. Have a good shift!',
    'Tutup Shift & Keluar':'Close Shift & Log Out','Modal awal':'Opening float','Penjualan tunai (shift ini)':'Cash sales (this shift)',
    'Kas masuk':'Cash in','Kas keluar':'Cash out','Seharusnya di laci':'Expected in drawer','Uang di laci (hitung fisik)':'Cash in drawer (counted)','Selisih':'Difference',
    'Isi jumlah uang di laci dulu':'Enter the counted cash first','pas':'exact','lebih':'over','kurang':'short',

    /* pembayaran & struk */
    'Pembayaran':'Payment','Total Tagihan':'Total Due','Tunai':'Cash','QRIS':'QRIS','Kartu':'Card','E-Wallet':'E-Wallet','Kartu Debit':'Debit Card',
    'Masukkan nominal uang…':'Enter amount received…','Pembayaran via':'Payment via','tanpa kembalian.':'no change due.',
    'Kembalian':'Change','Kurang':'Short','Status':'Status','Sesuai tagihan':'Exact amount','Konfirmasi Pembayaran':'Confirm Payment','Uang Pas':'Exact',
    'Proses QRIS':'Process QRIS','Proses Kartu Debit':'Process Debit Card','Proses E-Wallet':'Process E-Wallet',
    'Thermal (USB)':'Thermal (USB)','Thermal':'Thermal','Cetak':'Print','WA':'WA','No. Ref':'Ref No.','DAPUR':'KITCHEN',
    'Belum ada struk untuk dicetak':'No receipt to print yet','Browser ini tidak mendukung WebUSB. Pakai Chrome atau Edge.':'This browser doesn’t support WebUSB. Use Chrome or Edge.',
    'Terkirim ke printer!':'Sent to printer!','Struk terkirim ke printer thermal!':'Receipt sent to the thermal printer!','Tiket dapur terkirim ke printer!':'Kitchen ticket sent to printer!',
    'Nomor WhatsApp pelanggan (cth: 08123456789):':'Customer WhatsApp number (e.g. 08123456789):','Nomor WhatsApp tidak valid':'Invalid WhatsApp number',

    /* riwayat & laporan */
    'Riwayat Transaksi Hari Ini':'Today’s Transactions','Belum ada transaksi hari ini.':'No transactions today.','Void':'Void','VOID':'VOID',
    'Laporan Hari Ini':'Today’s Report','Catat Kas Masuk / Keluar':'Record Cash In / Out','Shift kamu saat ini':'Your current shift',
    'Omzet Hari Ini':'Today’s Sales','Transaksi':'Transactions','Rata-rata':'Average','Item Terjual':'Items Sold','Penjualan per Jam':'Sales per Hour',
    'Produk Terlaris':'Best Sellers','Metode Pembayaran':'Payment Methods','Kinerja Kasir Hari Ini':'Cashier Performance Today',
    'Kas Masuk / Keluar':'Cash In / Out','Masuk (tambah modal)':'In (add float)','Keluar (belanja/setor)':'Out (purchase/deposit)',
    'Jumlah (Rp)':'Amount (Rp)','Keterangan (cth: beli gas, setor bank)':'Description (e.g. gas refill, bank deposit)','Isi jumlah':'Enter an amount',
    'Alasan wajib diisi':'A reason is required',

    /* menu */
    'Edit Menu':'Edit Menu','Ganti Foto (kamera/galeri)':'Change Photo (camera/gallery)','Hapus foto':'Remove photo','Simpan Perubahan':'Save Changes',
    'Nama menu':'Menu name','cth: Kopi Susu Aren':'e.g. Iced Palm-Sugar Latte','Emoji':'Emoji','Tandai populer':'Mark as popular','Tampilkan di menu':'Show on menu',
    'Menu diperbarui':'Menu updated','Menu ditambahkan':'Menu item added','Harga tidak boleh 0':'Price cannot be 0','Isi nama menu':'Enter a menu name',
    'File ini bukan gambar yang bisa dibaca':'This file is not a readable image','Buat kategori dulu di Pengaturan → Kategori':'Create a category first in Settings → Categories',

    /* pesanan terbuka */
    'Pesanan Terbuka':'Open Orders','Tidak ada pesanan terbuka.':'No open orders.','FOLIO':'FOLIO','Semua item sudah dikirim ke dapur':'All items have been sent to the kitchen',
    'Keranjang dikosongkan':'Cart cleared','Pesanan dibersihkan':'Order cleared','Hapus semua pesanan di keranjang?':'Remove everything from the cart?',
    'Ini tagihan checkout kamar — selesaikan lewat BAYAR':'This is a room checkout bill — finish it with PAY','Isi nomor kamar dulu':'Enter the room number first',
    'Isi nomor kamar dulu ya!':'Enter the room number first!','Isi nomor kamar':'Enter the room number',

    /* kamar */
    'Papan Kamar':'Room Board','Status kamar':'Room status','Kalender':'Calendar','Cari & pesan':'Find & book','Reservasi':'Reservations',
    'Status pada tanggal':'Status on date','Kosong':'Vacant','Dipesan':'Booked','Terisi':'Occupied','Perbaikan':'Maintenance',
    'kosong':'vacant','dipesan':'booked','terisi':'occupied','perbaikan':'maintenance',
    'Tambah kamar':'Add room','No. kamar (cth: 305)':'Room no. (e.g. 305)','Tipe (cth: Deluxe)':'Type (e.g. Deluxe)','Harga/malam (Rp)':'Rate/night (Rp)',
    'Harga Jumat–Sabtu (opsional)':'Fri–Sat rate (optional)','7 hari ▶':'7 days ▶','7 hari':'7 days',
    'Kosong (tap untuk pesan)':'Vacant (tap to book)','Tanggal masuk':'Check-in date','Tanggal keluar':'Check-out date','Tipe kamar':'Room type','Semua tipe':'All types',
    'Belum ada kamar.':'No rooms yet.','Tiba hari ini':'Arriving today','Jadwal checkout':'Due to check out','Perlu dibersihkan':'Needs cleaning','perlu dibersihkan':'needs cleaning',
    'Belum dibersihkan':'Not cleaned yet','Kosong · siap':'Vacant · ready','Check-in':'Check-in','terlambat':'late','tiba hari ini':'arriving today',
    'Belum ada reservasi aktif. Buat lewat tab Cari & pesan atau Kalender.':'No active reservations. Create one from Find & book or Calendar.',
    'Tidak ada kamar kosong untuk tanggal ini. Coba tanggal atau tipe lain.':'No vacant rooms for these dates. Try other dates or types.',
    'No. HP / WhatsApp':'Phone / WhatsApp','cth: datang malam, extra bed':'e.g. late arrival, extra bed',
    'Simpan reservasi':'Save reservation','Sedang perbaikan':'Under maintenance','tidak bisa dipesan':'not bookable',
    'Tandai sudah dibersihkan':'Mark as cleaned','Check-in langsung (walk-in) · nama tamu':'Walk-in check-in · guest name','Rencana menginap (malam)':'Planned stay (nights)',
    'Estimasi sewa':'Estimated room charge','Check-in sekarang':'Check in now','Buat reservasi (tanggal lain)':'Make a reservation (other dates)',
    'Tagihan kamar':'Room bill','Pesan room service untuk kamar ini':'Order room service for this room','CHECKOUT & BAYAR':'CHECK OUT & PAY',
    'Checkout (tanpa tagihan)':'Check out (no charges)','Kelola kamar (tipe, harga, perbaikan)':'Manage room (type, rate, maintenance)','Harga/malam':'Rate/night',
    'Harga Jum–Sab':'Fri–Sat rate','Selesai perbaikan (bisa dijual lagi)':'Maintenance done (sellable again)',
    'Tandai perbaikan (tidak bisa dipesan)':'Mark for maintenance (not bookable)','Hapus kamar ini':'Delete this room','Reservasi berikutnya':'Next reservation',
    'Bentrok dengan reservasi berikutnya':'Conflicts with the next reservation','Tanggal keluar harus setelah tanggal masuk':'Check-out must be after check-in',
    'Tanggal masuk sudah lewat':'Check-in date is in the past','Kamar tidak tersedia di tanggal ini':'Room not available on these dates',
    'Periksa tanggal / ketersediaan kamar':'Check the dates / room availability','Isi nama tamu':'Enter the guest name','Reservasi dibatalkan':'Reservation cancelled',
    'Kamar tidak ditemukan':'Room not found','Nomor HP tamu tidak valid':'Invalid guest phone number','Harga per malam belum diisi (Rp 0). Tetap tambahkan?':'No nightly rate set (Rp 0). Add anyway?',
    'Kamar ini masih punya tagihan — pakai CHECKOUT & BAYAR':'This room still has charges — use CHECK OUT & PAY',

    /* pengaturan */
    'Profil Toko':'Store Profile','Karyawan':'Staff','Keamanan':'Security','Nama toko / usaha':'Store / business name','Alamat':'Address','Telepon / WhatsApp':'Phone / WhatsApp',
    'Pesan penutup struk':'Receipt footer message','Nama pajak':'Tax name','Tarif pajak (%)':'Tax rate (%)',
    'Isi 0 kalau usaha tidak memungut pajak. Tarif PB1 tiap daerah bisa beda (maks. 10%).':'Enter 0 if you don’t charge tax. Local restaurant tax (PB1) varies by region (max 10%).',
    'Aktifkan mode Hotel (kamar, room service, tagihan kamar)':'Enable Hotel mode (rooms, room service, room billing)','Simpan Profil Toko':'Save Store Profile',
    'Nama toko wajib diisi':'Store name is required','Tarif pajak 0–100%':'Tax rate must be 0–100%','Profil toko disimpan':'Store profile saved',
    'Tambah karyawan':'Add staff','Nama lengkap':'Full name','Username (cth: rani)':'Username (e.g. rani)','PIN 4–8 angka':'PIN 4–8 digits','Tambah Karyawan':'Add Staff',
    'Edit Karyawan':'Edit Staff','Peran':'Role','PIN baru':'New PIN','Kosongkan kalau tidak diganti':'Leave blank to keep current',
    'Akun lama — isi PIN baru untuk memindahkan ke sistem baru':'Old account — enter a new PIN to move it to the new system',
    'Hapus karyawan ini':'Delete this staff member','LAMA':'LEGACY','Belum ada karyawan.':'No staff yet.',
    'Isi nama':'Enter a name','Username 3–20 huruf kecil/angka, tanpa spasi':'Username: 3–20 lowercase letters/numbers, no spaces','PIN harus 4–8 angka':'PIN must be 4–8 digits',
    'PIN ini sama dengan PIN darurat, pilih yang lain':'This PIN equals the duress PIN, choose another','Harus ada minimal 1 Admin':'There must be at least 1 Admin',
    'Tidak bisa menghapus akun sendiri':'You can’t delete your own account',
    'Kunci otomatis kalau tidak dipakai':'Auto-lock when idle','Mati':'Off','1 menit':'1 minute','2 menit':'2 minutes','5 menit':'5 minutes','10 menit':'10 minutes','15 menit':'15 minutes','30 menit':'30 minutes',
    'Acak posisi angka PIN (anti-intip di meja kasir)':'Shuffle PIN keypad (anti shoulder-surfing)','PIN darurat (alarm diam)':'Duress PIN (silent alarm)',
    'Kosongkan = tidak diubah':'Blank = unchanged','Hapus PIN darurat':'Remove duress PIN','Simpan Keamanan':'Save Security',
    'Kalau kasir dipaksa membuka kunci (mis. perampokan), masukkan PIN darurat: aplikasi terbuka seperti biasa, tapi layar Admin di device lain langsung muncul peringatan merah. Tidak menghapus data, tidak menghubungi polisi.':
      'If a cashier is forced to unlock (e.g. a robbery), enter the duress PIN: the app opens normally, but Admin screens on other devices immediately show a red alert. It does not delete data or contact the police.',
    'Log aktivitas (50 terakhir)':'Activity log (last 50)','Belum ada aktivitas tercatat.':'No activity recorded yet.',
    'PIN darurat aktif.':'Duress PIN is active.','PIN darurat belum diatur.':'Duress PIN not set.','Pengaturan keamanan disimpan':'Security settings saved',
    'PIN darurat harus 4–8 angka':'Duress PIN must be 4–8 digits','PIN darurat tidak boleh sama dengan PIN karyawan mana pun':'The duress PIN must differ from every staff PIN',
    'Tidak bisa mengecek PIN karyawan (offline?)':'Couldn’t check staff PINs (offline?)',
    'Kategori menu':'Menu categories','Simpan kategori':'Save categories','Tambah kategori':'Add category','Nama kategori':'Category name','Urutan':'Order',
    'Ubah ikon, nama, dan urutan tampil. Menu di dalamnya tidak berubah.':'Change the icon, name and display order. Menu items inside are not affected.',
    'Kategori disimpan':'Categories saved','Kategori ditambahkan':'Category added','Tidak ada perubahan':'No changes',
    'Pesanan ini sudah dibayar / dibatalkan di device lain. Muat ulang pesanan.':'This order was already paid / cancelled on another device. Reload the order.',
    'Kamar ini sudah di-checkout di device lain.':'This room was already checked out on another device.',
    'Ditolak aturan keamanan Firestore.':'Blocked by Firestore security rules.','Terlalu banyak percobaan, tunggu beberapa menit.':'Too many attempts, wait a few minutes.','Isi nama kategori':'Enter a category name',

    /* kunci layar */
    'Terkunci':'Locked','Masukkan PIN':'Enter PIN','Masukkan PIN untuk membuka':'Enter PIN to unlock','Bukan kamu? Keluar & ganti pengguna':'Not you? Log out & switch user',
    'Konfirmasi PIN':'Confirm PIN','PIN salah':'Wrong PIN','Sudah ditangani':'Handled','SINYAL DARURAT':'DURESS SIGNAL',
    'Server membatasi percobaan. Tunggu beberapa menit lalu coba lagi.':'The server is limiting attempts. Wait a few minutes and try again.',
    'Simpan profil toko':'Save store profile','Simpan pengaturan keamanan':'Save security settings','Simpan kategori menu':'Save menu categories',

    /* stok */
    'STOK BAHAN':'INGREDIENT STOCK','SENJA POS · Gudang':'SENJA POS · Storeroom','← Kembali ke Kasir':'← Back to Register','Kembali ke Kasir':'Back to Register',
    'Total Bahan':'Ingredients','Stok Aman':'In Stock','Menipis':'Low','Habis':'Out','AMAN':'OK','MENIPIS':'LOW','HABIS':'OUT',
    'Daftar Bahan Baku':'Ingredients','Bahan':'Ingredient','Min.':'Min.','Kondisi':'Level','Aksi':'Actions','Masuk':'In','Keluar':'Out',
    'Tambah Bahan Baru':'Add New Ingredient','Nama Bahan':'Ingredient Name','Satuan':'Unit','Stok Awal':'Opening Stock','Stok Minimum':'Minimum Stock',
    'Harga / Satuan (Rp)':'Cost / Unit (Rp)','Simpan Bahan':'Save Ingredient','Riwayat Pergerakan Stok':'Stock Movements','(25 terakhir)':'(last 25)',
    'Resep Produk':'Product Recipes','bahan yang terpotong otomatis saat terjual (admin)':'ingredients deducted automatically on each sale (admin)',
    'Belum ada resep — produk tidak memotong stok.':'No recipe yet — this item doesn’t deduct stock.','Tambah Bahan':'Add Ingredient','malam':'night',
    'Hapus dari resep':'Remove from recipe','Stok Masuk':'Stock In','Stok Keluar':'Stock Out','Jumlah':'Quantity',
    'cth: Sirup Vanilla':'e.g. Vanilla Syrup','ml / gr / pcs':'ml / g / pcs','cth: Kiriman supplier':'e.g. Supplier delivery','stok sekarang':'current stock',
    'Tidak ada bahan pada filter ini.':'No ingredients in this filter.','Belum ada pergerakan stok.':'No stock movements yet.','Belum ada menu.':'No menu items yet.',
    'Tambahkan bahan baku dulu di atas.':'Add ingredients above first.','Stok diperbarui':'Stock updated','Bahan baru ditambahkan':'Ingredient added',
    'Jumlah harus lebih dari 0':'Quantity must be more than 0','Nama & satuan wajib diisi.':'Name & unit are required.','Resep disimpan':'Recipe saved',
    'Tidak punya izin untuk aksi ini.':'You don’t have permission for this.','Sistem':'System','(bahan terhapus)':'(deleted ingredient)',

    /* keuangan */
    'Modul Keuangan & Akuntansi':'Finance & Accounting','Export PDF':'Export PDF','Export Excel':'Export Excel','Export CSV':'Export CSV',
    'Periode':'Period','Semua Waktu':'All Time','Hari Ini':'Today','Bulan Ini':'This Month','Tahun Ini':'This Year','Custom...':'Custom...',
    'Dashboard':'Dashboard','Laba / Rugi':'Profit & Loss','Neraca':'Balance Sheet','Jurnal Umum':'General Journal','Buku Besar':'General Ledger',
    'Neraca Saldo':'Trial Balance','Input Manual':'Manual Entry','Total Aset':'Total Assets','Kewajiban & Ekuitas':'Liabilities & Equity',
    'Laba Bersih Periode Ini':'Net Profit This Period','Jumlah Jurnal':'Journal Entries','Validasi Persamaan Dasar Akuntansi':'Accounting Equation Check',
    'Aset (':'Assets (','Kewajiban + Ekuitas + Laba (':'Liabilities + Equity + Profit (','SEIMBANG':'BALANCED','SELISIH! Periksa Jurnal':'OUT OF BALANCE! Check the journal',
    'SELISIH! Periksa Jurnal.':'OUT OF BALANCE! Check the journal.','Laporan Laba Rugi':'Profit & Loss Statement','Uraian':'Description','Nominal':'Amount','Total':'Total',
    'PENDAPATAN':'REVENUE','Total Pendapatan':'Total Revenue','HARGA POKOK PENJUALAN (HPP)':'COST OF GOODS SOLD (COGS)','Total HPP':'Total COGS',
    'LABA KOTOR':'GROSS PROFIT','BEBAN OPERASIONAL':'OPERATING EXPENSES','Total Beban':'Total Expenses','LABA BERSIH':'NET PROFIT',
    'Neraca (Balance Sheet)':'Balance Sheet','Aset':'Assets','TOTAL ASET':'TOTAL ASSETS','Laba Berjalan':'Current Profit','TOTAL KEWAJIBAN & EKUITAS':'TOTAL LIABILITIES & EQUITY',
    'Tanggal':'Date','Keterangan':'Description','Akun':'Account','Debit':'Debit','Kredit':'Credit','Saldo':'Balance','Saldo awal':'Opening balance',
    'Buku Besar (General Ledger)':'General Ledger','Pilih Akun':'Choose Account','Neraca Saldo (Trial Balance)':'Trial Balance','Kode':'Code','Nama Akun':'Account Name',
    'Input Jurnal Manual (Beban / Pembelian Aset)':'Manual Journal Entry (Expense / Asset Purchase)','Akun Debit':'Debit Account','Akun Kredit':'Credit Account',
    'Nominal (Rp)':'Amount (Rp)','Simpan Jurnal':'Save Journal','cth: Bayar Listrik Toko':'e.g. Electricity bill','Belum ada jurnal pada periode ini.':'No journal entries in this period.',
    'Mengambil data dari cloud...':'Fetching data from the cloud...','Isi tanggal, keterangan, dan nominal lebih dari 0.':'Fill in the date, description, and an amount above 0.',
    'Akun Debit dan Kredit harus berbeda.':'Debit and Credit accounts must differ.','Jurnal manual tersimpan.':'Manual journal saved.',
    'Modul PDF belum termuat. Cek koneksi internet lalu muat ulang halaman.':'PDF module not loaded. Check your connection and reload.',
    'Modul Excel belum termuat. Cek koneksi internet lalu muat ulang halaman.':'Excel module not loaded. Check your connection and reload.'
  };

  /* ---- Pola: kalimat utuh dengan angka/nama di tengah (dicoba lebih dulu) ---- */
  var FULL = [
    [/^Rencana (\d+) malam$/, 'Planned $1 night(s)'],
    [/^(\d+) malam$/, '$1 night(s)'], [/^(\d+) mlm$/, '$1 nt'], [/^(\d+) bahan$/, '$1 ingredient(s)'], [/^(\d+) menu$/, '$1 item(s)'],
    [/^(Kafe|Hotel) · (\d+) menu$/, function(m,a,n){ return (a==='Kafe'?'Café':'Hotel')+' · '+n+' item(s)'; }],
    [/^(\d+) transaksi · omzet (.+)$/, '$1 transactions · sales $2'],
    [/^Terisi · (\d+)%$/, 'Occupied · $1%'], [/^Dipesan: $/, 'Booked: '], [/^Tagihan (.+)$/, 'Bill $1'], [/^masuk (.+)$/, 'in $1'],
    [/^Sewa kamar · (\d+) malam$/, 'Room charge · $1 night(s)'], [/^Sewa Kamar (.+)$/, 'Room Charge $1'],
    [/^\(kamu\)$/, '(you)'], [/^Meja (.+)$/, 'Table $1'], [/^Kamar (\S+)$/, 'Room $1'], [/^Kamar (\S+) · (.+)$/, 'Room $1 · $2'],
    [/^Pesan kamar (.+)$/, 'Book room $1'], [/^Edit · (.+)$/, 'Edit · $1'], [/^Kasir: ?$/, 'Cashier: '],
    [/^Terlalu banyak PIN salah\. Coba lagi dalam (\d+) detik$/, 'Too many wrong PINs. Try again in $1 seconds'],
    [/^Terlalu banyak percobaan salah\. Coba lagi dalam (\d+) detik\.$/, 'Too many wrong attempts. Try again in $1 seconds.'],
    [/^PIN salah · (\d+) percobaan lagi sebelum keluar paksa$/, 'Wrong PIN · $1 more tries before forced logout'],
    [/^Kamar (\S+) check-in: (.+) \((\d+) malam\)$/, 'Room $1 checked in: $2 ($3 night(s))'], [/^Kamar (\S+) check-in: (.+)$/, 'Room $1 checked in: $2'],
    [/^Pesanan (\S+) dibuka di keranjang$/, 'Order $1 opened in cart'], [/^Pesanan (\S+) dibatalkan$/, 'Order $1 cancelled'],
    [/^Transaksi (\S+) tersinkron ke semua device!$/, 'Transaction $1 synced to all devices!'], [/^Transaksi (\S+) di-void$/, 'Transaction $1 voided'],
    [/^Pesanan (\S+) ditagihkan ke kamar (\S+)$/, 'Order $1 charged to room $2'], [/^Pesanan untuk kamar (\S+)$/, 'Order for room $1'],
    [/^Reservasi kamar (\S+) untuk (.+) tersimpan$/, 'Reservation for room $1 ($2) saved'],
    [/^Kamar (\S+) ditambahkan · (.+)$/, 'Room $1 added · $2'], [/^Kamar (\S+) sekarang kosong \(perlu dibersihkan\)$/, 'Room $1 is now vacant (needs cleaning)'],
    [/^Kamar (\S+) diperbarui( \(tamu saat ini tetap tarif lama\))?$/, function(m,a,b){ return 'Room '+a+' updated'+(b?' (current guest keeps the old rate)':''); }],
    [/^Kamar (\S+) dihapus$/, 'Room $1 deleted'], [/^Kamar (\S+) sudah ada$/, 'Room $1 already exists'], [/^Kamar (\S+) masih terisi$/, 'Room $1 is still occupied'],
    [/^Kamar (\S+) sedang perbaikan$/, 'Room $1 is under maintenance'], [/^Kamar (\S+): siap dipakai$/, 'Room $1: ready'], [/^Kamar (\S+): ditandai perbaikan$/, 'Room $1: marked for maintenance'],
    [/^Kamar (\S+) tidak terdaftar di Papan Kamar$/, 'Room $1 is not on the Room Board'],
    [/^Kamar (\S+) belum check-in\. Check-in dulu di Papan Kamar\.$/, 'Room $1 is not checked in. Check in first on the Room Board.'],
    [/^Kamar (\S+) masih punya reservasi \((.+)\)\. Batalkan dulu reservasinya\.$/, 'Room $1 still has a reservation ($2). Cancel it first.'],
    [/^Bentrok dengan reservasi (.+) mulai (.+)\. Kurangi jumlah malam atau pilih kamar lain\.$/, 'Conflicts with the reservation of $1 from $2. Reduce the nights or pick another room.'],
    [/^Bentrok dengan reservasi lain\. Kurangi jumlah malam atau pilih kamar lain\.$/, 'Conflicts with another reservation. Reduce the nights or pick another room.'],
    [/^Hapus kamar (\S+)\?$/, 'Delete room $1?'], [/^Hapus kamar (\S+)$/, 'Delete room $1'],
    [/^Kamar ini punya reservasi \((.+)\)\. Tetap tandai perbaikan\?$/, 'This room has a reservation ($1). Mark for maintenance anyway?'],
    [/^Tiket dapur dibuat · pesanan (\S+) tersimpan$/, 'Kitchen ticket created · order $1 saved'], [/^Karyawan (.+) ditambahkan · login: (\S+)$/, 'Staff $1 added · login: $2'],
    [/^Kas (masuk|keluar) (.+) dicatat$/, function(m,a,b){ return 'Cash '+(a==='masuk'?'in':'out')+' '+b+' recorded'; }],
    [/^Tidak ada kamar dengan status ini pada (.+)\.$/, 'No rooms with this status on $1.'],
    [/^Keranjang sekarang akan diganti dengan pesanan (\S+)\. Lanjut\?$/, 'The current cart will be replaced with order $1. Continue?'],
    [/^Keranjang sekarang akan diganti dengan tagihan kamar (\S+)\. Lanjut\?$/, 'The current cart will be replaced with the bill for room $1. Continue?'],
    [/^Kosongkan keranjang\? \(Pesanan (\S+) tetap tersimpan di Pesanan Terbuka\)$/, 'Clear the cart? (Order $1 stays saved in Open Orders)'],
    [/^Alasan membatalkan pesanan (\S+)\?$/, 'Reason for cancelling order $1?'], [/^Batalkan pesanan (\S+)$/, 'Cancel order $1'],
    [/^Alasan membatalkan reservasi (.+) \(kamar (\S+)\)\?$/, 'Reason for cancelling the reservation of $1 (room $2)?'],
    [/^Alasan void transaksi (\S+)\?$/, 'Reason for voiding transaction $1?'], [/^Void (\S+)$/, 'Void $1'],
    [/^Void (\S+) \((.+)\)\? Stok dikembalikan & jurnal dibalik\. Tidak bisa dibatalkan\.$/, 'Void $1 ($2)? Stock is restored & the journal reversed. This can’t be undone.'],
    [/^Hapus (.+) \(@(\S+)\)\? Dia tidak bisa login lagi\. Riwayat transaksinya tetap tersimpan\.$/, 'Delete $1 (@$2)? They won’t be able to log in. Their transaction history is kept.'],
    [/^Hapus (.+)$/, 'Delete $1'], [/^Ubah data (.+)$/, 'Edit $1'], [/^Data & PIN (.+) diperbarui$/, 'Details & PIN for $1 updated'], [/^Data (.+) diperbarui$/, 'Details for $1 updated'],
    [/^(.+) dihapus$/, '$1 deleted'], [/^Username "(.+)" sudah dipakai$/, 'Username "$1" is already taken'], [/^Bahan "(.+)" sudah ada\.$/, 'Ingredient "$1" already exists.'],
    [/^Stok tidak cukup \(tersedia (.+)\)\.$/, 'Not enough stock (available $1).'],
    [/^Stok belum terpotong: (.+)\. Sesuaikan manual di halaman Stok\.$/, 'Stock not deducted: $1. Adjust it manually on the Stock page.'],
    [/^Stok belum kembali: (.+)\. Sesuaikan manual di halaman Stok\.$/, 'Stock not restored: $1. Adjust it manually on the Stock page.'],
    [/^Gagal menyimpan, belum ada yang tercatat: (.+)$/, function(m,a){ return 'Couldn’t save, nothing was recorded: '+tr(a); }], [/^Gagal menyimpan: (.+)$/, 'Couldn’t save: $1'],
    [/^Gagal cetak thermal: (.+)$/, 'Thermal print failed: $1'], [/^Gagal menutup shift: (.+)$/, 'Couldn’t close the shift: $1'],
    [/^Gagal memuat: (.+)$/, 'Couldn’t load: $1'], [/^Gagal memuat resep: (.+)$/, 'Couldn’t load recipes: $1'], [/^Gagal: (.+)$/, function(m,a){ return 'Failed: '+tr(a); }],
    [/^Simpan jurnal: (.+) \(D\) \/ (.+) \(K\) (.+)\?$/, 'Save journal: $1 (Dr) / $2 (Cr) $3?'], [/^· per (.+)$/, '· as of $1'],
    [/^Pesanan (\S+) sudah dibayar \/ dibatalkan di device lain\. Kosongkan keranjang lalu buat pesanan baru\.$/, 'Order $1 was already paid / cancelled on another device. Clear the cart and start a new order.'],
    [/^Kamar (\S+) baru saja diisi dari device lain$/, 'Room $1 was just occupied from another device'],
    [/^SINYAL DARURAT: (.+)$/, function(m,a){ return 'DURESS SIGNAL: '+a.replace(/ pukul /g,' at '); }]
  ];
  /* ---- Pola potongan (dipakai kalau tidak ada yang cocok di atas) ---- */
  var PART = [
    [/(\d+) malam/g, '$1 night(s)'], [/(\d+) kamar tersedia/g, '$1 rooms available'], [/(\d+) item\b/g, '$1 item(s)'], [/(\d+) transaksi/g, '$1 transactions'],
    [/(\d+) belum ke dapur/g, '$1 not sent to kitchen'], [/(\d+) rb\b/g, '$1k'], [/(\d+) jt\b/g, '$1M'], [/Jum–Sab/g, 'Fri–Sat'], [/\/malam/g, '/night'],
    [/ · dari reservasi/g, ' · from reservation'], [/ · checkout /g, ' · check-out '], [/ · tiba hari ini/g, ' · arriving today'], [/ · terlambat/g, ' · late'],
    [/\(lebih\)/g, '(over)'], [/\(kurang\)/g, '(short)'], [/\(pas\)/g, '(exact)'], [/ · siap$/, ' · ready'], [/^Kosong /, 'Vacant ']
  ];

  function core(s){
    var m = s.match(/^([^\p{L}\p{N}"'(]*)([\s\S]*?)([\s:·]*)$/u);
    return m ? m : ['', '', s, ''];
  }
  function tr(s){
    if(lang !== 'en' || !s || !/[A-Za-z]/.test(s)) return s;
    var m = core(s), pre = m[1], mid = m[2], suf = m[3], i;
    if(D.hasOwnProperty(mid)) return pre + D[mid] + suf;
    for(i=0;i<FULL.length;i++){ if(FULL[i][0].test(mid)) return pre + mid.replace(FULL[i][0], FULL[i][1]) + suf; }
    var out = mid;
    for(i=0;i<PART.length;i++) out = out.replace(PART[i][0], PART[i][1]);
    return out !== mid ? pre + out + suf : s;
  }
  function skip(el){
    for(var e = el; e && e !== document.body; e = e.parentElement){
      if(e.nodeType===1 && (e.classList.contains('no-i18n') || e.tagName==='SCRIPT' || e.tagName==='STYLE' || e.tagName==='TEXTAREA')) return true;
    }
    return false;
  }
  var ATTRS = ['placeholder','title','aria-label'];
  function doNode(n){
    if(n.nodeType === 3){
      if(!n.parentElement || skip(n.parentElement)) return;
      if(n.__o === undefined || (n.nodeValue !== n.__t && n.nodeValue !== n.__o)) n.__o = n.nodeValue;
      var t = lang==='en' ? tr(n.__o) : n.__o;
      n.__t = t;
      if(n.nodeValue !== t) n.nodeValue = t;
    } else if(n.nodeType === 1){
      if(skip(n)) return;
      for(var i=0;i<ATTRS.length;i++){
        var a = ATTRS[i]; if(!n.hasAttribute(a)) continue;
        var key = 'data-o-'+a, cur = n.getAttribute(a);
        if(!n.hasAttribute(key) || (cur !== n.getAttribute('data-t-'+a) && cur !== n.getAttribute(key))) n.setAttribute(key, cur);
        var o = n.getAttribute(key), v = lang==='en' ? tr(o) : o;
        n.setAttribute('data-t-'+a, v); if(cur !== v) n.setAttribute(a, v);
      }
      var kids = n.childNodes; for(var j=0;j<kids.length;j++) doNode(kids[j]);
    }
  }
  var busy = false;
  var obs = new MutationObserver(function(ms){
    if(busy) return; busy = true;
    try{
      for(var i=0;i<ms.length;i++){
        var m = ms[i];
        if(m.type === 'characterData' || m.type === 'attributes') doNode(m.target);
        else for(var j=0;j<m.addedNodes.length;j++){
          var n = m.addedNodes[j];
          /* ikon (deai.js) dipasang dulu supaya teks asli yang disimpan, bukan hasil terjemahan */
          if(window.SENJA_ICONS && n.isConnected) window.SENJA_ICONS.scan(n);
          if(n.isConnected) doNode(n);
        }
      }
    } finally { busy = false; }
  });
  function start(){
    if(!document.body) return;
    doNode(document.body);
    obs.observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS});
    paint();
  }
  function paint(){
    document.documentElement.lang = lang;
    var bs = document.querySelectorAll('[data-lang-switch] button');
    for(var i=0;i<bs.length;i++){ var on = bs[i].getAttribute('data-l')===lang; bs[i].classList.toggle('on', on); bs[i].setAttribute('aria-pressed', on ? 'true' : 'false'); }
  }
  /* tombol ID | EN di semua halaman */
  document.addEventListener('click', function(e){
    var b = e.target && e.target.closest ? e.target.closest('[data-lang-switch] button') : null;
    if(b && b.getAttribute('data-l') !== lang) window.SENJA_LANG.set(b.getAttribute('data-l'));
  });

  /* dialog bawaan browser ikut diterjemahkan */
  var _c = window.confirm, _p = window.prompt, _a = window.alert;
  window.confirm = function(m){ return _c.call(window, tr(String(m))); };
  window.prompt  = function(m, d){ return _p.call(window, tr(String(m)), d); };
  window.alert   = function(m){ return _a.call(window, tr(String(m))); };

  window.SENJA_LANG = {
    get: function(){ return lang; },
    loc: function(){ return lang==='en' ? 'en-GB' : 'id-ID'; },
    t: tr,
    set: function(l){
      lang = l==='en' ? 'en' : 'id';
      try{ localStorage.setItem(KEY, lang); }catch(e){}
      busy = true; try{ doNode(document.body); } finally { busy = false; }
      paint();
      try{ window.dispatchEvent(new Event('senja-lang')); }catch(e){}
    },
    toggle: function(){ this.set(lang==='en' ? 'id' : 'en'); }
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
