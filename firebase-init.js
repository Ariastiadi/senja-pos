/* =========================================================================
   SENJA POS — Konfigurasi Firebase
   ========================================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyBqh3U2NafYRy-2gcPVzU6xMKRbmOV9Wug",
  authDomain: "senja-pos.firebaseapp.com",
  projectId: "senja-pos",
  storageBucket: "senja-pos.firebasestorage.app",
  messagingSenderId: "200213038165",
  appId: "1:200213038165:web:79e74a742244073bf0c0dc"
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
