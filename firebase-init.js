/* =========================================================================
   SENJA POS — Konfigurasi Firebase (SANDBOX)
   ========================================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyAwIPMNpU5tFcx97AEFHaicEodTeltdoLw",
  authDomain: "senja-pos-sandbox.firebaseapp.com",
  projectId: "senja-pos-sandbox",
  storageBucket: "senja-pos-sandbox.firebasestorage.app",
  messagingSenderId: "818178856375",
  appId: "1:818178856375:web:4a9bb982724fbdd8178432"
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

/* Cari shift aktif (selesai == null) — TANPA orderBy, jadi tidak butuh index komposit */
async function activeShift() {
  const u = currentUser();
  if (!u) return null;
  const snap = await db.collection('shifts')
    .where('user_id', '==', u.id)
    .where('selesai', '==', null)
    .get();
  if (snap.empty) return null;
  let best = null;
  snap.forEach(d => {
    const s = { id: d.id, ...d.data() };
    const t = (s.mulai && typeof s.mulai.toMillis === 'function') ? s.mulai.toMillis()
            : (typeof s.mulai === 'number' ? s.mulai : 0);
    if (!best || t > best.t) best = { t: t, s: s };
  });
  return best ? best.s : null;
}

/* Rentang waktu "hari ini" (dipakai berkali-kali untuk laporan/riwayat) */
function todayRange() {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  return { start: firebase.firestore.Timestamp.fromDate(start), end: firebase.firestore.Timestamp.fromDate(end) };
}
