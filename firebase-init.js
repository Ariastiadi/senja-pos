/* =========================================================================
   SENJA POS — Konfigurasi Firebase
   =========================================================================
   GANTI 6 nilai di bawah ini dengan punya Bapak sendiri, dari:
   Firebase Console → Project Settings → General → scroll ke "Your apps" → Web app → SDK setup and configuration

   Kalau belum punya project Firebase:
   1. Buka https://console.firebase.google.com
   2. "Add project" → kasih nama (misal "senja-pos") → lanjutkan
   3. Di dashboard project, klik ikon "</>"  (Web) untuk daftarkan web app
   4. Kasih nickname app (misal "senja-pos-web"), TIDAK perlu centang Firebase Hosting
   5. Copy object firebaseConfig yang muncul, tempel gantikan yang di bawah ini
   6. Di sidebar kiri, buka "Build" → "Firestore Database" → "Create database"
      → pilih "Start in test mode" untuk awal (bisa diperketat nanti) → pilih lokasi asia-southeast (Jakarta/Singapore)
   ========================================================================= */
const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_ANDA",
  authDomain: "GANTI.firebaseapp.com",
  projectId: "GANTI_PROJECT_ID",
  storageBucket: "GANTI.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId: "GANTI_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ===== Util session (pengganti PHP $_SESSION) ===== */
function currentUser() {
  const raw = localStorage.getItem('senja_user');
  return raw ? JSON.parse(raw) : null;
}
function setCurrentUser(u) {
  localStorage.setItem('senja_user', JSON.stringify(u));
}
function logoutUser() {
  localStorage.removeItem('senja_user');
}
function requireLogin() {
  if (!currentUser()) { location.href = 'login.html'; throw new Error('belum login'); }
  return currentUser();
}
function isAdmin() {
  return (currentUser()?.role || '') === 'admin';
}

/* ===== Helper umum ===== */
function rp(n){ return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* Cari shift aktif milik user saat ini (selesai == null) */
async function activeShift() {
  const u = currentUser();
  if (!u) return null;
  const snap = await db.collection('shifts')
    .where('user_id', '==', u.id)
    .where('selesai', '==', null)
    .orderBy('mulai', 'desc')
    .limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/* Rentang waktu "hari ini" (dipakai berkali-kali untuk laporan/riwayat) */
function todayRange() {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  return { start: firebase.firestore.Timestamp.fromDate(start), end: firebase.firestore.Timestamp.fromDate(end) };
}
