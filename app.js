/* =========================================================================
   SENJA POS — app.js  (logika halaman kasir index.html)
   ========================================================================= */
/* rp(), esc(), db, currentUser() dll. ada di firebase-init.js */
function LOC(){ return (window.SENJA_LANG && SENJA_LANG.loc) ? SENJA_LANG.loc() : 'id-ID'; }

/* ===== Audio Feedback ===== */
let AC;
function tone(f,d=.07,delay=0){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(.001,AC.currentTime+delay);
    g.gain.exponentialRampToValueAtTime(.06,AC.currentTime+delay+.01);
    g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+delay+d);
    o.connect(g).connect(AC.destination);
    o.start(AC.currentTime+delay);o.stop(AC.currentTime+delay+d+.05);
  }catch(e){}
}

const $ = id => document.getElementById(id);
const OT = {dinein:'Dine In',takeaway:'Take Away',room:'Kamar Hotel'};
const PM = {cash:'Tunai',qris:'QRIS',card:'Kartu Debit',ewallet:'E-Wallet'};
const PBADGE = {cash:'b-cash',qris:'b-qris',card:'b-card',ewallet:'b-ewallet'};
const TINT = {kopi:['#f3e2c8'],minuman:['#ddefe6'],makanan:['#fbe3d2'],camilan:['#f6ead2'],dessert:['#f9e0e3'],
  roomservice:['#e8e6f4'],minibar:['#e0ecf3'],laundry:['#e2eff4'],layanan:['#efe9db'],spa:['#ece2f2']};

let CATS = [], PRODS = [], ING = [], TX = [], SHIFT = null, SHIFT_TX = [], LAST_RECEIPT = null;
const STORE_DEFAULT = { nama:'SENJA GROUP', alamat:'Jl. Kenanga No. 21, Yogyakarta', telp:'0274-555-123',
  footer:'Terima kasih\nSampai jumpa lagi!', pajak:10, pajak_label:'PB1', hotel:true,
  lock_min:5, pin_scramble:true, duress_hash:null };
let STORE = Object.assign({}, STORE_DEFAULT), USERS = [], EDIT_UID = null;
let OPEN = [], ROOMS = [], CASHMOVES = [], LAST_KOT = null, ROOM_ID = null, CM_TIPE = 'masuk';
const S = {mode:'cafe',cat:'all',q:'',cart:[],orderType:'dinein',discMode:'percent',method:'cash',paid:0,activeOrderId:null,activeOrderNo:null,folioIds:null,folioRoomId:null};

function toast(msg,icon='✅'){
  const d=document.createElement('div');d.className='toast';
  const i=document.createElement('span'); i.textContent=icon;
  d.appendChild(i); d.appendChild(document.createTextNode(String(msg)));
  $('toasts').appendChild(d);
  setTimeout(()=>d.remove(),3500);
}
function fail(err){ toast('Gagal: '+authMsg(err),'❌'); }
const byId = id => PRODS.find(p=>p.id===id);
const catOf = kode => CATS.find(c=>c.id===kode);
const isActive = p => p && p.aktif!==0 && p.aktif!==false;
const num0 = v => Math.max(0, parseFloat(v)||0);
/* Baris keranjang bisa membawa harga/nama sendiri (sewa kamar, tagihan folio dengan harga lama) */
function lineInfo(l){
  const p = byId(l.id) || {};
  return { nama: l.n!=null ? l.n : (p.nama||'?'), harga: l.p!=null ? Number(l.p) : (Number(p.harga)||0),
           kat: l.k!=null ? l.k : (p.kategori_kode||''), emoji: l.e!=null ? l.e : (p.emoji||'🍽️') };
}
function billCalc(sub, disc){
  const tax = Math.round((sub-disc)*(Number(STORE.pajak)||0)/100);
  return {sub, disc, tax, total:sub-disc+tax};
}

/* ===== Jam ===== */
function tick(){ $('clock').textContent = new Date().toLocaleTimeString(LOC(),{hour12:false}); }
function paintDate(){ $('dateLabel').textContent = new Date().toLocaleDateString(LOC(),{weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
setInterval(tick,1000); tick(); paintDate();

/* ===== Init ===== */
(async function init(){
  const u = requireLogin();
  $('userInitial').textContent = u.nama.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
  $('userName').textContent = u.nama.split(' ')[0];
  $('userRole').textContent = u.role;
  $('shiftName').textContent = u.nama.split(' ')[0];
  if (isAdmin()) { $('financeBtn').style.display = 'flex'; $('settingsBtn').style.display = 'flex'; }
  try{
    /* Sesi Firebase Authentication wajib ada & cocok dengan akun yang login */
    if(window.firebase && firebase.auth){
      const au = await new Promise(res=>{ const off = firebase.auth().onAuthStateChanged(x=>{ off(); res(x); }); });
      if(!au || au.uid!==u.id){ fullLogout(); return; }
    }
    /* Sesi masih valid? (akun dihapus / peran diubah admin → ikut berubah) */
    try{
      const ud = await db.collection('users').doc(u.id).get();
      if(!ud.exists){ fullLogout(); return; }
      const dd = ud.data(); MY_HASH = dd.pinHash || null;
      try{ const pd = await db.collection('pins').doc(u.id).get(); if(pd.exists) MY_HASH = pd.data().pinHash || MY_HASH; }catch(e){}
      if((dd.role!==u.role || dd.nama!==u.nama) && typeof setCurrentUser==='function'){
        setCurrentUser({id:u.id, nama:dd.nama, username:dd.username, role:dd.role}); location.reload(); return;
      }
    }catch(e){}
    try{
      const st = await db.collection('settings').doc('store').get();
      if(st.exists) STORE = Object.assign({}, STORE_DEFAULT, st.data());
    }catch(e){}
    applyStore();
    const [catSnap, prodSnap] = await Promise.all([
      db.collection('categories').get(),
      db.collection('products').get()
    ]);
    CATS = catSnap.docs.map(d=>({id:d.id,...d.data()}));
    PRODS = prodSnap.docs.map(d=>{
      const p = {id:d.id,...d.data()};
      const c = catOf(p.kategori_kode);
      p.m = c ? c.mode : 'cafe';
      p.c = p.kategori_kode;
      return p;
    });
    SHIFT = await activeShift();
    attachRealtime();
    listenShift();
    attachSecurity();
    $('app').classList.add('show');
    $('loadingScreen').style.display = 'none';
    renderCats(); renderProducts(); renderCart();
    if (SHIFT) renderShiftChip(); else showOv('ovShift');
    if (LS.get('senja_locked',0)) lockNow();
  }catch(err){
    $('loadingScreen').innerHTML = '❌ Gagal memuat: '+esc(err.message)+'<br><small>Cek koneksi / config Firebase.</small>';
  }
})();

/* ===== Real-time lintas device ===== */
let UNSUB_TX = null, UNSUB_SHIFT = null, UNSUB_CASH = null, DAY_TIMER = null;
/* Transaksi "hari ini": didaftarkan ulang tepat lewat tengah malam supaya kasir 24 jam tetap benar */
function listenToday(){
  if(UNSUB_TX) UNSUB_TX();
  const {start,end} = todayRange();
  UNSUB_TX = db.collection('transactions')
    .where('created_at','>=',start).where('created_at','<=',end)
    .orderBy('created_at','desc')
    .onSnapshot(snap=>{
      TX = snap.docs.map(d=>({id:d.id,...d.data()}));
      $('syncDot').classList.add('on');
      $('syncStatus').textContent = 'Sinkron';
      if($('ovHistory').classList.contains('show')) openHistory();
    }, ()=>{ $('syncDot').classList.remove('on'); $('syncStatus').textContent = 'Terputus'; });
  clearTimeout(DAY_TIMER);
  const next = new Date(); next.setHours(24,0,2,0);
  DAY_TIMER = setTimeout(()=>{ paintDate(); listenToday(); }, next - Date.now());
}
/* Transaksi & kas milik shift aktif (tetap benar walau shift melewati tengah malam) */
function listenShift(){
  if(UNSUB_SHIFT) UNSUB_SHIFT(); if(UNSUB_CASH) UNSUB_CASH();
  UNSUB_SHIFT = UNSUB_CASH = null; SHIFT_TX = []; CASHMOVES = [];
  if(!SHIFT) return;
  const me = currentUser().id, mulai = SHIFT.mulai && SHIFT.mulai.toDate ? SHIFT.mulai : firebase.firestore.Timestamp.fromMillis(Number(SHIFT.mulai)||0);
  UNSUB_SHIFT = db.collection('transactions').where('created_at','>=',mulai).onSnapshot(snap=>{
    SHIFT_TX = snap.docs.map(d=>({id:d.id,...d.data()})).filter(t=>!t.void && (t.shift_id ? t.shift_id===SHIFT.id : t.user_id===me));
  }, ()=>{});
  UNSUB_CASH = db.collection('cashMoves').where('shift_id','==',SHIFT.id).onSnapshot(snap=>{
    CASHMOVES = snap.docs.map(d=>({id:d.id,...d.data()}));
  }, ()=>{});
}
function attachRealtime(){
  listenToday();
  db.collection('ingredients').onSnapshot(snap=>{
    ING = snap.docs.map(d=>({id:d.id,...d.data()}));
    updateLowBar();
  });
  db.collection('openOrders').where('status','==','open').onSnapshot(snap=>{
    OPEN = snap.docs.map(d=>({id:d.id,...d.data()}))
      .sort((a,b)=>((a.created_at&&a.created_at.seconds)||0)-((b.created_at&&b.created_at.seconds)||0));
    $('ooCount').textContent = OPEN.length;
    updateTicketHead();
    if($('ovOrders').classList.contains('show')) openOrdersModal();
    if($('ovRooms').classList.contains('show')) renderRoomTab();
    refreshRoomDetail();
  });
  db.collection('bookings').where('sampai','>=', ymd(new Date(Date.now()-86400000))).onSnapshot(snap=>{
    BOOKINGS = snap.docs.map(d=>({id:d.id,...d.data()}));
    if($('ovRooms').classList.contains('show')) renderRoomTab();
  }, ()=>{});
  db.collection('rooms').onSnapshot(snap=>{
    ROOMS = snap.docs.map(d=>({id:d.id,...d.data()}));
    if($('ovRooms').classList.contains('show')) renderRoomTab(); else renderRooms();
    refreshRoomDetail();
  });
}
function updateLowBar(){
  const low = ING.filter(i=>i.stok_min>0 && i.stok<=i.stok_min);
  const bar = $('lowBar'), badge = $('lowBadge');
  if(low.length){
    const sample = low.slice(0,3).map(i=>`<span class="no-i18n">${esc(i.nama)}</span> (${Math.round(i.stok)} ${esc(i.satuan)})`).join(' · ');
    $('lowText').innerHTML = `<b>Stok menipis:</b> ${sample}${low.length>3?' · +'+(low.length-3)+' lainnya':''}`;
    bar.classList.add('show'); badge.style.display='inline'; badge.textContent=`(${low.length})`;
  } else { bar.classList.remove('show'); badge.style.display='none'; }
}
function renderShiftChip(){
  if(!SHIFT) return;
  const d = SHIFT.mulai && SHIFT.mulai.toDate ? SHIFT.mulai.toDate() : new Date(SHIFT.mulai);
  $('shiftStart').textContent = d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'});
  $('shiftModal').textContent = rp(SHIFT.modal_awal||0);
}

/* ===== Menu ===== */
function setMode(m){
  S.mode=m; S.cat='all';
  $('modeCafe').classList.toggle('on',m==='cafe');
  $('modeHotel').classList.toggle('on',m==='hotel');
  $('roomBtn').style.display = m==='hotel' ? '' : 'none';
  renderCats(); renderProducts();
}
function setCat(c){ S.cat=c; renderCats(); renderProducts(); }
function visible(){ return PRODS.filter(p=>p.m===S.mode && isActive(p)); }
function hiddenProds(){ return isAdmin() ? PRODS.filter(p=>p.m===S.mode && !isActive(p)) : []; }
function renderCats(){
  const items = visible(), hidden = hiddenProds();
  if(S.cat==='_hidden' && !hidden.length) S.cat = 'all';
  let html = `<button class="cat-chip ${S.cat==='all'?'on':''}" onclick="setCat('all')">✨ Semua <span class="n">${items.length}</span></button>`;
  CATS.filter(c=>c.mode===S.mode).sort((a,b)=>(Number(a.urutan)||0)-(Number(b.urutan)||0)).forEach(c=>{
    const n = items.filter(p=>p.c===c.id).length;
    html += `<button class="cat-chip ${S.cat===c.id?'on':''}" onclick="setCat('${esc(c.id)}')"><span class="no-i18n no-deai">${esc(c.ikon||'')} ${esc(c.nama)}</span> <span class="n">${n}</span></button>`;
  });
  if(hidden.length) html += `<button class="cat-chip muted ${S.cat==='_hidden'?'on':''}" onclick="setCat('_hidden')">👁️ Tersembunyi <span class="n">${hidden.length}</span></button>`;
  $('catRow').innerHTML = html;
}
function renderProducts(){
  const hiddenView = S.cat==='_hidden';
  let list = hiddenView ? hiddenProds() : visible();
  if(S.cat!=='all' && !hiddenView) list = list.filter(p=>p.c===S.cat);
  if(S.q) list = list.filter(p=>String(p.nama||'').toLowerCase().includes(S.q.toLowerCase()));
  const canEdit = isAdmin();
  const addCard = canEdit && !S.q && !hiddenView ? `<div class="card add-card" onclick="openEditProduct(null)"><b>＋</b>Menu baru</div>` : '';
  if(!list.length){ $('productGrid').innerHTML = `<div class="empty-menu"><div style="font-size:44px;margin-bottom:10px">🔍</div>Tidak ada menu yang cocok.</div>` + addCard; return; }
  $('productGrid').innerHTML = list.map((p,i)=>{
    const bg = (TINT[p.c]||['#f3e2c8'])[0];
    const q = S.cart.filter(l=>l.id===p.id).reduce((s,l)=>s+l.q,0);
    const tap = hiddenView ? `openEditProduct('${p.id}')` : `addToCart('${p.id}')`;
    return `<div class="card${hiddenView?' is-hidden':''}" style="animation-delay:${Math.min(i*22,300)}ms" onclick="${tap}">
      ${hiddenView ? '<span class="hot">Tersembunyi</span>' : p.populer ? '<span class="hot">⭐ POPULER</span>' : ''}
      ${q? `<span class="qtyb">×${q}</span>`:''}
      <div class="tile no-deai" style="background:${bg}">${p.foto? `<img src="${esc(p.foto)}" alt="">` : `<span>${esc(p.emoji||'🍽️')}</span>`}</div>
      ${canEdit && !hiddenView? `<button class="edit-ico" aria-label="Edit" onclick="event.stopPropagation();openEditProduct('${p.id}')">✎</button>`:''}
      <h4 class="no-i18n">${esc(p.nama)}</h4>
      <div class="card-foot"><span class="price">${rp(p.harga)}</span><span class="plus">+</span></div>
    </div>`;
  }).join('') + addCard;
}

/* ===== Tipe pesanan & keranjang ===== */
function setOrderType(t){
  S.orderType=t;
  document.querySelectorAll('.obtn').forEach(b=>b.classList.toggle('on',b.dataset.ot===t));
  $('ctxDinein').classList.toggle('show',t==='dinein');
  $('ctxTakeaway').classList.toggle('show',t==='takeaway');
  $('ctxRoom').classList.toggle('show',t==='room');
  $('btnFolio').style.display = t==='room' ? '' : 'none';
  updateTicketHead();
}
function ctxText(){
  if(S.orderType==='dinein'){ const v=$('tableNo').value; return v?`Meja ${esc(v)}`:'Dine In'; }
  if(S.orderType==='takeaway'){ const v=$('guestTA').value; return v?`a.n. ${esc(v)}`:'Take Away'; }
  const r=$('roomNo').value,g=$('guestName').value;
  return `Kamar ${esc(r)||'—'}${g?' · '+esc(g):''}`;
}
function updateTicketHead(){
  $('orderCtx').innerHTML = ctxText();
  $('orderNo').textContent = S.activeOrderNo ? '#'+S.activeOrderNo : 'Baru';
}
function addToCart(id){
  const p = byId(id); if(!isActive(p)) return;
  const line = S.cart.find(l=>l.id===id && l.p==null);
  line ? line.q++ : S.cart.push({id,q:1,sent:0});
  renderCart(); renderProducts();
  const b=$('orderNo'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  const cb=$('cartBar'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
  tone(720,.06);
}
function changeQty(i,d){
  const line = S.cart[i]; if(!line) return;
  line.q += d;
  if((line.sent||0) > line.q) line.sent = line.q;
  if(line.q<=0) S.cart.splice(i,1);
  renderCart(); renderProducts();
  tone(d>0?720:300,.05);
}
function removeLine(i){ S.cart.splice(i,1); renderCart(); renderProducts(); tone(220,.08); }
function resetOrder(){
  S.cart=[]; S.activeOrderId=null; S.activeOrderNo=null; S.folioIds=null; S.folioRoomId=null; S.folioStay=null; FOLIO_BOOKING_ID=null;
  $('discVal').value=''; setDiscMode('percent');
}
function clearCart(){
  if(!S.cart.length && !S.activeOrderId) return;
  const wasOrder = !!S.activeOrderId;
  if(!confirm(wasOrder ? 'Kosongkan keranjang? (Pesanan '+S.activeOrderNo+' tetap tersimpan di Pesanan Terbuka)' : 'Hapus semua pesanan di keranjang?')) return;
  resetOrder(); renderCart(); renderProducts(); toast(wasOrder?'Keranjang dikosongkan':'Pesanan dibersihkan','🧹');
}
function calc(){
  const sub = S.cart.reduce((s,l)=>s + lineInfo(l).harga*l.q, 0);
  const dv = num0($('discVal').value);
  const disc = S.discMode==='percent' ? Math.round(sub*Math.min(dv,100)/100) : Math.min(Math.round(dv),sub);
  return billCalc(sub, disc);
}
function renderCart(){
  if(!S.cart.length){
    $('cartList').innerHTML = `<div class="tk-empty"><span style="font-size:46px;display:inline-block">☕</span><p style="margin-top:12px;font-size:13px;font-weight:600">Belum ada pesanan.<br>Pilih menu untuk memulai.</p></div>`;
  } else {
    $('cartList').innerHTML = S.cart.map((l,i)=>{
      const p = lineInfo(l), sent = l.sent||0;
      return `<div class="line"><span class="le no-deai">${esc(p.emoji)}</span>
        <div class="li"><div class="ln no-i18n">${esc(p.nama)}</div><div class="lp">${rp(p.harga)}${p.kat==='kamar'?'':sent>=l.q?'<span class="lk sent">✓ dapur</span>':sent>0?`<span class="lk new">+${l.q-sent} baru</span>`:'<span class="lk new">baru</span>'}</div></div>
        <div class="stepper"><button aria-label="Kurangi" onclick="changeQty(${i},-1)">−</button><span class="q">${l.q}</span><button aria-label="Tambah" onclick="changeQty(${i},1)">+</button></div>
        <span class="lt">${rp(p.harga*l.q)}</span>
        <button class="lx" aria-label="Hapus" onclick="removeLine(${i})">✕</button></div>`;
    }).join('');
  }
  const c = calc();
  $('subEl').textContent = rp(c.sub);
  $('discEl').textContent = '− '+rp(c.disc);
  $('taxEl').textContent = rp(c.tax);
  $('totalEl').textContent = rp(c.total);
  $('payBtnTotal').textContent = rp(c.total);
  $('btnPay').disabled = !S.cart.length;
  $('btnKot').disabled = !S.cart.some(l=>l.q>(l.sent||0));
  $('btnFolio').disabled = !S.cart.length;
  const nItem = S.cart.reduce((s,l)=>s+l.q,0);
  $('cbCount').textContent = nItem;
  $('cbTotal').textContent = rp(c.total);
  $('cbLabel').textContent = nItem ? 'Lihat pesanan' : 'Belum ada pesanan';
  $('cartBar').classList.toggle('empty', !nItem);
  updateTicketHead();
}
function isMobileLayout(){ return window.matchMedia && window.matchMedia('(max-width:1080px)').matches; }
function toggleCart(){ document.body.classList.toggle('cart-open'); }
function openCart(){ if(isMobileLayout()) document.body.classList.add('cart-open'); }
function closeCart(){ document.body.classList.remove('cart-open'); }
function setDiscMode(m){
  S.discMode=m;
  $('dmP').classList.toggle('on',m==='percent');
  $('dmR').classList.toggle('on',m==='nominal');
  renderCart();
}

/* ===== Shift ===== */
async function openShift(){
  const u = currentUser(), btn = $('btnOpenShift');
  const modal = Math.round(num0($('modalAwal').value));
  btn.disabled = true;
  try{
    await db.collection('shifts').add({
      user_id:u.id, user_name:u.nama,
      mulai: firebase.firestore.Timestamp.now(),
      modal_awal:modal, selesai:null, omzet:0, n_transaksi:0
    });
    SHIFT = await activeShift();
    listenShift(); renderShiftChip(); closeOv('ovShift');
    toast('Shift dibuka. Selamat bertugas!','☀️');
  }catch(err){ fail(err); }
  finally{ btn.disabled = false; }
}
function closeShift(){
  if(!SHIFT){ fullLogout(); return; }
  const tunai = shiftCashSales().reduce((s,t)=>s+t.total,0);
  const mv = shiftMoves();
  const masuk = mv.filter(m=>m.tipe==='masuk').reduce((s,m)=>s+(m.jumlah||0),0);
  const keluar = mv.filter(m=>m.tipe==='keluar').reduce((s,m)=>s+(m.jumlah||0),0);
  const exp = (SHIFT.modal_awal||0) + tunai + masuk - keluar;
  $('rcModal').textContent = rp(SHIFT.modal_awal||0);
  $('rcTunai').textContent = rp(tunai);
  $('rcMasuk').textContent = rp(masuk);
  $('rcKeluar').textContent = rp(keluar);
  $('rcExp').textContent = rp(exp);
  $('rcActual').value=''; $('rcActual').dataset.exp = exp; $('rcNote').value='';
  updateRecon(); showOv('ovClose');
  setTimeout(()=>$('rcActual').focus(),150);
}
function shiftCashSales(){ return SHIFT_TX.filter(t=>t.method==='cash'); }
function shiftMoves(){ return SHIFT ? CASHMOVES.filter(m=>m.shift_id===SHIFT.id) : []; }
function updateRecon(){
  const exp = parseFloat($('rcActual').dataset.exp)||0, v = $('rcActual').value, el = $('rcDiff');
  if(v===''){ el.textContent='—'; el.className='val'; return; }
  const diff = (parseFloat(v)||0) - exp;
  el.textContent = (diff>=0?'+':'−') + rp(Math.abs(diff)) + (diff===0?' (pas)':diff>0?' (lebih)':' (kurang)');
  el.className = 'val ' + (diff===0?'ok':'no');
}
async function confirmCloseShift(){
  const v = $('rcActual').value;
  if(v===''){ toast('Isi jumlah uang di laci dulu','⚠️'); $('rcActual').focus(); return; }
  const act = num0(v), exp = parseFloat($('rcActual').dataset.exp)||0;
  const mine = SHIFT_TX;
  const btn = $('btnCloseShift'); btn.disabled=true; btn.textContent='Menutup…';
  try{
    await db.collection('shifts').doc(SHIFT.id).update({
      selesai: firebase.firestore.Timestamp.now(),
      omzet: mine.reduce((s,t)=>s+t.total,0), n_transaksi: mine.length,
      tunai: shiftCashSales().reduce((s,t)=>s+t.total,0),
      kas_seharusnya: exp, kas_aktual: act, selisih: act-exp,
      catatan_tutup: $('rcNote').value||null
    });
    if(act!==exp) await audit('shift_selisih', 'Tutup shift, selisih kas '+(act-exp>0?'+':'−')+rp(Math.abs(act-exp))+($('rcNote').value?' · '+$('rcNote').value:''), 'warn');
    fullLogout();
  }catch(err){ toast('Gagal menutup shift: '+err.message,'❌'); btn.disabled=false; btn.textContent='Tutup Shift & Keluar'; }
}

/* ===== Pembayaran ===== */
function openPay(){
  if(!S.cart.length) return;
  if(!SHIFT){ showOv('ovShift'); return; }
  if(S.orderType==='room' && !$('roomNo').value){ toast('Isi nomor kamar dulu ya!','⚠️'); $('roomNo').focus(); return; }
  S.method='cash'; S.paid=0;
  $('paidInput').value='';
  document.querySelectorAll('.mbtn').forEach(b=>b.classList.toggle('on',b.dataset.m==='cash'));
  const c = calc();
  $('payTotalBig').textContent = rp(c.total);
  buildQuick(c.total); updatePayUI(); showOv('ovPay');
}
function buildQuick(total){
  const up = n => Math.ceil(total/n)*n;
  const amts = [...new Set([total, up(5000), up(10000), up(50000), up(100000), 50000, 100000, 200000, 500000, 1000000])]
    .filter(v=>v>=total).sort((a,b)=>a-b).slice(0,6);
  $('quickRow').innerHTML = amts.map(v=>{
    const label = v===total?'Uang Pas': v>=1000000?(v/1000000)+' jt':(v/1000)+' rb';
    return `<button class="qbtn" onclick="setPaid(${v})">${label}</button>`;
  }).join('');
}
function setPaid(v){ $('paidInput').value=v; updatePayUI(); }
function setMethod(m){
  S.method=m;
  document.querySelectorAll('.mbtn').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
  updatePayUI();
}
function updatePayUI(){
  const c = calc(), cash = S.method==='cash';
  $('cashBlock').style.display = cash?'block':'none';
  $('nonCashNote').style.display = cash?'none':'block';
  $('ncName').textContent = PM[S.method];
  const paid = cash ? (parseFloat($('paidInput').value)||0) : c.total;
  S.paid = paid;
  const cv=$('changeVal'), cl=$('changeLbl'), btn=$('btnConfirm');
  if(!cash){ cl.textContent='Status'; cv.textContent='Sesuai tagihan'; cv.className='val ok'; btn.disabled=false; }
  else{
    const diff = paid - c.total;
    if(paid>=c.total){ cl.textContent='Kembalian'; cv.textContent=rp(diff); cv.className='val ok'; btn.disabled=false; }
    else{ cl.textContent='Kurang'; cv.textContent=rp(-diff); cv.className='val no'; btn.disabled=true; }
  }
  btn.textContent = cash?'Konfirmasi Pembayaran':'Proses '+PM[S.method];
  if(PAYING){ btn.disabled = true; btn.textContent = 'Menyimpan…'; }
}
let PAYING = false;   /* true selama pembayaran disimpan: tombol bayar tidak bisa ditekan lagi */
/* Nomor pesanan berurutan per hari, aman dipakai banyak device sekaligus */
function ymdCompact(d){ return String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'); }
async function allocNo(){
  const d = new Date(), day = ymdCompact(d);
  try{
    const ref = db.collection('counters').doc('order-'+day);
    const n = await db.runTransaction(async t=>{
      const s = await t.get(ref);
      const n = (s.exists ? Number(s.data().n)||0 : 0) + 1;
      t.set(ref, { n, updated_at: firebase.firestore.Timestamp.now() });
      return n;
    });
    return 'SNJ-'+day+'-'+String(n).padStart(4,'0');
  }catch(e){
    /* aturan Firestore lama / offline: nomor berbasis jam, tetap unik */
    const hms = String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')+String(d.getSeconds()).padStart(2,'0');
    return 'SNJ-'+day+'-'+hms+rndInt(10);
  }
}

/* Akun pendapatan per kategori (jurnal otomatis) */
const REV_NAME = { '4101':'Pendapatan Kafe', '4102':'Pendapatan Kamar', '4103':'Pendapatan Room Service', '4104':'Pendapatan Laundry', '4105':'Pendapatan Spa', '4106':'Pendapatan Minibar' };
function revAcc(kat){
  const fixed = { kamar:'4102', roomservice:'4103', minibar:'4106', laundry:'4104', spa:'4105' };
  if(fixed[kat]) return fixed[kat];
  const c = catOf(kat);
  return c && c.mode==='hotel' ? '4102' : '4101';
}
/* Resep semua item di keranjang: dibaca sekali, dipakai untuk HPP & potong stok */
async function cartNeeds(lines){
  const need = {};
  for(const l of lines){
    if(!byId(l.id) || String(l.id).startsWith('room-')) continue;
    const rs = await db.collection('products').doc(l.id).collection('recipes').get();
    rs.docs.forEach(r=>{
      const q = (Number(r.data().qty)||0) * l.q; if(q<=0) return;
      if(!need[r.id]) need[r.id] = { qty:0, why:[] };
      need[r.id].qty += q; need[r.id].why.push(lineInfo(l).nama+' ×'+l.q);
    });
  }
  return need;
}
function buildJournal(no, c, method, lines, hpp){
  const L = [{ acc: method==='cash' ? '1101' : '1102', name: method==='cash' ? 'Kas' : 'Bank/E-Wallet', debit: c.total, credit: 0 }];
  if(c.tax > 0) L.push({ acc:'2101', name:'Utang '+(STORE.pajak_label||'Pajak'), debit:0, credit:c.tax });
  const rev = {};
  lines.forEach(l=>{ const p = lineInfo(l), a = revAcc(p.kat); rev[a] = (rev[a]||0) + p.harga*l.q; });
  const keys = Object.keys(rev).filter(a=>rev[a]>0);
  if(c.disc > 0 && c.sub > 0){   /* diskon dibagi proporsional ke tiap akun pendapatan, sisa pembulatan ke akun terakhir */
    let run = 0;
    keys.forEach((a,i)=>{ rev[a] = i<keys.length-1 ? Math.round(rev[a]*(c.sub-c.disc)/c.sub) : (c.sub-c.disc)-run; run += rev[a]; });
  }
  keys.forEach(a=>{ if(rev[a]) L.push({ acc:a, name:REV_NAME[a], debit:0, credit:rev[a] }); });
  if(hpp > 0){
    L.push({ acc:'5101', name:'HPP', debit:hpp, credit:0 });
    L.push({ acc:'1110', name:'Persediaan Bahan', debit:0, credit:hpp });
  }
  return { no:'JRN-'+no, date: firebase.firestore.Timestamp.now(), desc:'Penjualan '+no, source:'POS-SALE', lines:L };
}
/* Potong stok setelah transaksi tersimpan. Dicatat per transaksi supaya void mengembalikan jumlah yang sama persis. */
async function deductStock(no, need){
  const u = currentUser(), failed = [];
  for(const id of Object.keys(need)){
    try{
      const ref = db.collection('ingredients').doc(id);
      const taken = await db.runTransaction(async t=>{
        const doc = await t.get(ref); if(!doc.exists) return 0;
        const cur = Number(doc.data().stok)||0, take = Math.min(cur, need[id].qty);
        t.update(ref, { stok: cur - take });
        return take;
      });
      const ing = ING.find(i=>i.id===id) || {};
      await db.collection('stock_moves').add({ ingredient_id:id, ingredient_nama:ing.nama||id, satuan:ing.satuan||'', tipe:'keluar',
        qty:taken, catatan:'Terjual '+no+': '+need[id].why.join(', '), user_nama:u.nama, tx_no:no, created_at: firebase.firestore.Timestamp.now() });
    }catch(e){ failed.push((ING.find(i=>i.id===id)||{}).nama || id); }
  }
  if(failed.length) toast('Stok belum terpotong: '+failed.join(', ')+'. Sesuaikan manual di halaman Stok.','⚠️');
}
async function confirmPay(){
  const btn = $('btnConfirm');
  if(PAYING || btn.disabled) return;
  const u = currentUser(), c = calc();
  /* semua isian dibaca SEKARANG, sebelum menunggu jaringan */
  const method = S.method, orderType = S.orderType, meta = orderMeta(), activeNo = S.activeOrderNo;
  const paid = method==='cash' ? S.paid : c.total;
  if(method==='cash' && paid < c.total) return;
  PAYING = true; updatePayUI();
  const lines = S.cart.map(l=>Object.assign({}, l));
  const doneIds = S.folioIds ? S.folioIds.slice() : (S.activeOrderId ? [S.activeOrderId] : []);
  const folioRoomId = S.folioRoomId, folioStay = S.folioStay, bookingId = FOLIO_BOOKING_ID;
  let tx, need;
  try{
    need = await cartNeeds(lines);
    const hpp = Math.round(Object.keys(need).reduce((s,id)=>s + need[id].qty*(Number((ING.find(i=>i.id===id)||{}).harga_satuan)||0), 0));
    const no = activeNo || await allocNo();
    tx = {
      no, created_at: firebase.firestore.Timestamp.now(),
      type: orderType, user_id: u.id, user_name: u.nama, shift_id: SHIFT ? SHIFT.id : null,
      meta,
      items: lines.map(l=>{ const p = lineInfo(l); return {id:l.id, n:p.nama, p:p.harga, q:l.q, k:p.kat}; }),
      sub:c.sub, disc:c.disc, tax:c.tax, total:c.total, method, paid, change: paid - c.total,
      order_ids: doneIds, tax_rate: Number(STORE.pajak)||0, tax_label: STORE.pajak_label||'Pajak', stock_tracked: true
    };
    /* Satu transaksi Firestore: tersimpan semua atau tidak sama sekali, dan gagal kalau pesanan /
       kamar ini sudah diselesaikan device lain (mencegah tagihan ganda) */
    await db.runTransaction(async t=>{
      const now = firebase.firestore.Timestamp.now();
      const orderRefs = doneIds.map(oid=>db.collection('openOrders').doc(oid));
      const roomRef = folioRoomId ? db.collection('rooms').doc(folioRoomId) : null;
      const orders = await Promise.all(orderRefs.map(r=>t.get(r)));
      const room = roomRef ? await t.get(roomRef) : null;
      if(orders.some(o=>!o.exists || o.data().status!=='open')) throw new Error('Pesanan ini sudah dibayar / dibatalkan di device lain. Muat ulang pesanan.');
      if(room && (!room.exists || room.data().status!=='terisi' || stayKey(room.data())!==folioStay)) throw new Error('Kamar ini sudah di-checkout di device lain.');
      t.set(db.collection('transactions').doc(), tx);
      t.set(db.collection('journals').doc(), buildJournal(no, c, method, lines, hpp));
      orderRefs.forEach(r=>t.update(r, {status:'paid', tx_no:no, paid_at:now}));
      if(roomRef){
        t.update(roomRef, {status:'kosong', hk:'kotor', tamu:null, checkin_at:null, malam:null, harga_malam:null, harga_weekend_malam:null, booking_id:null});
        if(bookingId) t.update(db.collection('bookings').doc(bookingId), {status:'done', checkout_at:now, tx_no:no});
      }
    });
  }catch(err){
    PAYING = false;
    toast('Gagal menyimpan, belum ada yang tercatat: '+authMsg(err),'❌');
    tone(220,.2);
    updatePayUI();
    return;
  }
  /* Tersimpan. Mulai dari sini jangan sampai kasir menekan bayar dua kali. */
  closeOv('ovPay'); closeCart();
  resetOrder();
  ['tableNo','guestTA','roomNo','guestName'].forEach(id=>$(id).value='');
  renderCart(); renderProducts();
  tone(660,.09);tone(990,.14,.1);
  toast('Transaksi '+tx.no+' tersinkron ke semua device!','🎉');
  showReceipt({...tx, time: Date.now()});
  PAYING = false;
  deductStock(tx.no, need);
}

/* ===== Struk ===== */
const T = s => (window.SENJA_LANG ? SENJA_LANG.t(s) : s);
function txDate(t){ return t.time ? new Date(t.time) : (t.created_at && t.created_at.toDate ? t.created_at.toDate() : new Date()); }
function txCtx(t){
  const m = t.meta||{};
  return t.type==='dinein' ? T('Meja')+' '+(m.meja||'-')
    : t.type==='takeaway' ? T('Take Away')+' · '+(m.tamu||'-')
    : T('Kamar')+' '+(m.kamar||'-')+' · '+(m.tamu||'-');
}
function showReceipt(t){
  LAST_RECEIPT = t;
  const d = txDate(t);
  $('receiptPaper').innerHTML = `
    <h2 class="no-i18n">${esc(STORE.nama)}</h2>
    <div class="c no-i18n">${esc(STORE.alamat)}${STORE.telp?'<br>Telp '+esc(STORE.telp):''}</div>
    ${t.void?'<div class="c big void-mark">VOID</div>':''}
    <div class="dash"></div>
    <div class="rrow"><span>No. Ref</span><span>${esc(t.no)}</span></div>
    <div class="rrow"><span>${d.toLocaleDateString(LOC())} ${d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'})}</span><span>Kasir: <span class="no-i18n">${esc((t.user_name||'').split(' ')[0])}</span></span></div>
    <div class="rrow"><span>${OT[t.type]||''}</span><span class="no-i18n">${esc(txCtx(t))}</span></div>
    <div class="dash"></div>
    ${t.items.map(i=>`<div class="rrow"><span class="nm no-i18n">${i.q}× ${esc(i.n)}</span><span>${rp(i.p*i.q)}</span></div>`).join('')}
    <div class="dash"></div>
    <div class="rrow"><span>Subtotal</span><span>${rp(t.sub)}</span></div>
    ${t.disc?`<div class="rrow"><span>Diskon</span><span>-${rp(t.disc)}</span></div>`:''}
    ${t.tax?`<div class="rrow"><span class="no-i18n">${esc(taxTxt(t))}</span><span>${rp(t.tax)}</span></div>`:''}
    <div class="rrow big"><span>TOTAL</span><span>${rp(t.total)}</span></div>
    <div class="dash"></div>
    <div class="rrow"><span>${PM[t.method]}</span><span>${rp(t.paid)}</span></div>
    <div class="rrow"><span>Kembalian</span><span>${rp(t.change)}</span></div>
    <div class="dash"></div>
    <div class="c no-i18n">${esc(STORE.footer||'').split('\n').join('<br>')}</div>`;
  showOv('ovReceipt');
}

/* ===== Cetak Thermal via WebUSB (Chrome/Edge, printer USB ESC/POS) ===== */
async function escposSend(bytes, okMsg){
  if(!navigator.usb){ toast('Browser ini tidak mendukung WebUSB. Pakai Chrome atau Edge.','⚠️'); return; }
  let device = null;
  try{
    const known = await navigator.usb.getDevices();   /* printer yang sudah pernah diizinkan tidak perlu dipilih ulang */
    device = known[0] || await navigator.usb.requestDevice({ filters: [
      { vendorId: 0x04b8 }, // Epson
      { vendorId: 0x0483 }, // STMicro (Xprinter dkk)
      { vendorId: 0x0416 }, // Winbond (Zjiang dkk)
      { vendorId: 0x0d3a }, // Zjiang
      { vendorId: 0x1c8a }, // Global Unichip
      { vendorId: 0x28e9 }  // GD32-based (printer thermal generik)
    ] });
    if(!device.opened) await device.open();
    if(device.configuration === null) await device.selectConfiguration(1);
    const iface = device.configuration.interfaces.find(i => i.alternates.some(a => a.endpoints.some(e => e.direction === 'out')));
    if(!iface) throw new Error('Endpoint OUT tidak ditemukan pada printer ini.');
    await device.claimInterface(iface.interfaceNumber);
    const alt = iface.alternates.find(a => a.endpoints.some(e => e.direction === 'out'));
    const ep = alt.endpoints.find(e => e.direction === 'out');
    await device.transferOut(ep.endpointNumber, bytes);
    await device.releaseInterface(iface.interfaceNumber);
    toast(okMsg||'Terkirim ke printer!','🖨️');
  }catch(err){
    if(err.name !== 'NotFoundError') toast('Gagal cetak thermal: ' + err.message, '❌');
  }finally{
    try{ if(device && device.opened) await device.close(); }catch(e){}
  }
}
/* Printer thermal hanya paham ASCII: huruf beraksen & simbol diganti padanannya */
function ascii(s){
  return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/×/g,'x').replace(/[–—−]/g,'-').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/…/g,'...').replace(/[^\x20-\x7e\n]/g,'');
}
function escLines(){
  const bytes = [], W = 32;
  const push = arr => bytes.push(...arr);
  const line = (str='') => ascii(str).split('\n').forEach(x=>{ for(let i=0;i<Math.max(1,x.length);i+=W) for(const ch of x.slice(i,i+W)+'\n') bytes.push(ch.charCodeAt(0)); });
  const pad2 = (a,b) => { a = ascii(a); b = ascii(b); const room = W - b.length - 1; if(a.length > room) a = a.slice(0, Math.max(1,room)); return a + ' '.repeat(Math.max(1, W - a.length - b.length)) + b; };
  return {bytes, push, line, pad2};
}
async function printThermal(){
  if(!LAST_RECEIPT){ toast('Belum ada struk untuk dicetak','⚠️'); return; }
  const t = LAST_RECEIPT, {bytes, push, line, pad2} = escLines();
  const d = txDate(t);
  push([0x1B,0x40]); push([0x1B,0x61,0x01]);
  line(STORE.nama||''); if(STORE.alamat) line(STORE.alamat); if(STORE.telp) line('Telp '+STORE.telp);
  if(t.void) line('*** VOID ***');
  line('--------------------------------');
  push([0x1B,0x61,0x00]);
  line(T('No. Ref')+': ' + t.no);
  line(d.toLocaleDateString(LOC()) + ' ' + d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'}) + '  ' + T('Kasir') + ': ' + (t.user_name||'').split(' ')[0]);
  line(txCtx(t));
  line('--------------------------------');
  t.items.forEach(i => line(pad2(i.q + 'x ' + i.n, rp(i.p*i.q))));
  line('--------------------------------');
  line(pad2(T('Subtotal'), rp(t.sub)));
  if(t.disc) line(pad2(T('Diskon'), '-' + rp(t.disc)));
  if(t.tax) line(pad2(taxTxt(t), rp(t.tax)));
  push([0x1B,0x45,0x01]); line(pad2('TOTAL', rp(t.total))); push([0x1B,0x45,0x00]);
  line(pad2(T(PM[t.method]), rp(t.paid)));
  line(pad2(T('Kembalian'), rp(t.change)));
  line('--------------------------------');
  push([0x1B,0x61,0x01]); line(STORE.footer||''); line(''); line('');
  push([0x1D,0x56,0x42,0x00]);
  await escposSend(new Uint8Array(bytes), 'Struk terkirim ke printer thermal!');
}
async function printKOTThermal(){
  if(!LAST_KOT) return;
  const k = LAST_KOT, {bytes, push, line} = escLines();
  push([0x1B,0x40]); push([0x1B,0x61,0x01]);
  push([0x1D,0x21,0x11]); line(T('DAPUR')); push([0x1D,0x21,0x00]);
  line((k.no||'') + '  ' + k.time.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'}));
  line(T(k.ctx));
  line('--------------------------------');
  push([0x1B,0x61,0x00]); push([0x1D,0x21,0x01]);
  k.items.forEach(i => line(i.q + 'x ' + i.n));
  push([0x1D,0x21,0x00]);
  line('--------------------------------'); line(''); line('');
  push([0x1D,0x56,0x42,0x00]);
  await escposSend(new Uint8Array(bytes), 'Tiket dapur terkirim ke printer!');
}

/* ===== Riwayat & Laporan ===== */
function openHistory(){
  if(!TX.length){ $('txList').innerHTML = '<div class="empty-rep">Belum ada transaksi hari ini.</div>'; }
  else{
    $('txList').innerHTML = TX.map(t=>{
      const d = t.created_at.toDate ? t.created_at.toDate() : new Date(t.created_at);
      return `<div class="tx-row ${t.void?'void':''}">
        <span class="tx-time">${d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'})}</span>
        <div class="tx-main"><div class="tx-no">${esc(t.no)}<span class="badge ${PBADGE[t.method]}">${PM[t.method]}</span>${t.void?'<span class="badge b-void" title="'+esc(t.void_reason||'')+'">VOID</span>':''}</div>
        <div class="tx-sub">${OT[t.type]} · <span class="no-i18n">${esc(t.user_name||'')}</span> · ${t.items.reduce((s,x)=>s+x.q,0)} item</div></div>
        <span class="tx-total">${rp(t.total)}</span>
        <button class="tx-view" onclick="showReceiptById('${t.id}')">Lihat</button>
        ${(isAdmin()&&!t.void)?`<button class="tx-view danger" onclick="voidTx('${t.id}')">Void</button>`:''}
      </div>`;
    }).join('');
  }
  showOv('ovHistory');
}
function showReceiptById(id){ const t = TX.find(x=>x.id===id); if(t) showReceipt(t); }
function shiftBand(){
  const omzet = SHIFT_TX.reduce((s,t)=>s+t.total,0);
  return `<div class="shift-band">⏱️ Shift kamu saat ini: <span class="mono">${SHIFT_TX.length} transaksi · omzet ${rp(omzet)}</span></div>`;
}
function openReport(){
  const body = $('reportBody');
  const T = activeTX();
  if(!T.length){
    body.innerHTML = shiftBand() + `<div class="empty-rep">📭<br>Belum ada transaksi hari ini.</div>`;
    showOv('ovReport'); return;
  }
  const omzet = T.reduce((s,t)=>s+t.total,0);
  const n = T.length, avg = Math.round(omzet/n);
  const itemCount = T.reduce((s,t)=>s+t.items.reduce((a,i)=>a+i.q,0),0);
  const hourOf = t => (t.created_at && t.created_at.toDate ? t.created_at.toDate() : new Date(t.created_at)).getHours();
  const hrs = T.map(hourOf), h0 = Math.min(8, ...hrs), h1 = Math.max(22, ...hrs);
  const hourly = [];
  for(let h=h0;h<=h1;h++) hourly.push({h, v: T.filter(t=>hourOf(t)===h).reduce((s,t)=>s+t.total,0)});
  const max = Math.max(...hourly.map(x=>x.v),1);
  const cnt = {};
  T.forEach(t=>t.items.forEach(i=>cnt[i.n]=(cnt[i.n]||0)+i.q));
  const top = Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n2,q])=>({n:n2,q}));
  const maxQ = top.length?top[0].q:1;
  const methods = {}; T.forEach(t=>methods[t.method]=(methods[t.method]||0)+t.total);
  const cashiers = {}; T.forEach(t=>{const k=t.user_name||'?';if(!cashiers[k])cashiers[k]={c:0,v:0};cashiers[k].c++;cashiers[k].v+=t.total;});
  body.innerHTML = `
    ${shiftBand()}
    <div class="kpis">
      <div class="kpi k1"><div class="k">Omzet Hari Ini</div><div class="vv">${rp(omzet)}</div></div>
      <div class="kpi k2"><div class="k">Transaksi</div><div class="vv">${n}</div></div>
      <div class="kpi k3"><div class="k">Rata-rata</div><div class="vv">${rp(avg)}</div></div>
      <div class="kpi k4"><div class="k">Item Terjual</div><div class="vv">${itemCount}</div></div>
    </div>
    <div class="rp-title">📈 Penjualan per Jam</div>
    <div class="chart">${hourly.map(x=>`<div class="bar"><i class="${x.v?'':'zero'}" style="height:${x.v/max*100}%"></i><span>${x.h%2===0?x.h:''}</span></div>`).join('')}</div>
    <div class="rp-title">🏆 Produk Terlaris</div>
    ${top.map((t,i)=>`<div class="top-row"><span class="top-rank">${i+1}</span><span class="top-name no-i18n">${esc(t.n)}</span><div class="top-bar"><i style="width:${t.q/maxQ*100}%"></i></div><span class="top-q">×${t.q}</span></div>`).join('')}
    <div class="rp-title">💳 Metode Pembayaran</div>
    <div class="methods">${Object.entries(methods).map(([m,v])=>`<div class="m-chip">${PM[m]} · <b>${rp(v)}</b></div>`).join('')}</div>
    <div class="rp-title">👥 Kinerja Kasir Hari Ini</div>
    <div class="methods">${Object.entries(cashiers).map(([k,v])=>`<div class="m-chip"><span class="no-i18n">${esc(k)}</span> · <b>${v.c} tx</b> · ${rp(v.v)}</div>`).join('')}</div>`;
  showOv('ovReport');
}

/* ===== Edit & tambah menu — khusus Admin ===== */
let EDIT_ID = null, EDIT_FOTO = null;
function fillCatSelect(sel, current){
  const opts = CATS.slice().sort((a,b)=>(a.mode||'').localeCompare(b.mode||'') || (a.urutan||0)-(b.urutan||0))
    .map(c=>`<option value="${esc(c.id)}" ${c.id===current?'selected':''}>${esc(c.ikon||'')} ${esc(c.nama)}${STORE.hotel!==false?' · '+T(c.mode==='hotel'?'Hotel':'Kafe'):''}</option>`).join('');
  sel.innerHTML = opts;
}
function openEditProduct(id){
  if(!isAdmin()) return;
  const p = id ? byId(id) : null; if(id && !p) return;
  EDIT_ID = id || null; EDIT_FOTO = p && p.foto || null;
  $('editTitle').textContent = p ? '✎ Edit Menu' : '＋ Menu baru';
  $('editNama').value = p ? p.nama : '';
  $('editHarga').value = p ? p.harga : '';
  $('editEmoji').value = p ? (p.emoji||'') : '🍽️';
  const defCat = p ? p.c : (S.cat!=='all' ? S.cat : ((CATS.find(c=>c.mode===S.mode)||CATS[0]||{}).id));
  fillCatSelect($('editKat'), defCat);
  $('editPopuler').checked = !!(p && p.populer);
  $('editAktif').checked = !p || isActive(p);
  paintEditPhoto();
  $('editPhotoInput').value = '';
  showOv('ovEditProduct');
  if(!p) setTimeout(()=>{ const el = $('editNama'); if(el) el.focus(); }, 150);
}
function paintEditPhoto(){
  const p = EDIT_ID ? byId(EDIT_ID) : null;
  $('editPhotoPreview').innerHTML = EDIT_FOTO ? `<img src="${esc(EDIT_FOTO)}" alt="">` : `<span class="no-deai">${esc((p && p.emoji) || $('editEmoji').value || '🍽️')}</span>`;
  $('btnDelPhoto').style.display = EDIT_FOTO ? '' : 'none';
}
function removePhoto(){ EDIT_FOTO = ''; $('editPhotoInput').value = ''; paintEditPhoto(); }
function handlePhotoChange(e){
  const file = e.target.files && e.target.files[0];
  if(!file) return;
  const img = new Image();
  const reader = new FileReader();
  reader.onload = ev => { img.src = ev.target.result; };
  img.onload = () => {
    // Kompres & resize ke maksimal 480px sisi terpanjang, JPEG kualitas 0.75,
    // supaya ukuran dokumen Firestore tetap kecil (hemat kuota, hemat data HP).
    const maxDim = 480;
    let w = img.width, h = img.height;
    if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
    else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    EDIT_FOTO = canvas.toDataURL('image/jpeg', 0.75);
    paintEditPhoto();
  };
  img.onerror = () => toast('File ini bukan gambar yang bisa dibaca','⚠️');
  reader.readAsDataURL(file);
}
async function saveEditProduct(){
  const nama = $('editNama').value.trim(), harga = Math.round(num0($('editHarga').value));
  const emoji = $('editEmoji').value.trim() || '🍽️', kat = $('editKat').value;
  const populer = $('editPopuler').checked ? 1 : 0, aktif = $('editAktif').checked ? 1 : 0;
  if(!nama){ toast('Isi nama menu','⚠️'); $('editNama').focus(); return; }
  if(harga <= 0){ toast('Harga tidak boleh 0','⚠️'); return; }
  if(!kat){ toast('Buat kategori dulu di Pengaturan → Kategori','⚠️'); return; }
  const cat = catOf(kat) || {};
  const btn = $('btnSaveProduct');
  btn.disabled = true; btn.textContent = 'Menyimpan…';
  try{
    const payload = { nama, harga, emoji, kategori_kode:kat, populer, aktif };
    if(EDIT_FOTO) payload.foto = EDIT_FOTO;
    if(EDIT_ID){
      const old = byId(EDIT_ID) || {};
      const wasActive = isActive(old);
      if(!EDIT_FOTO && old.foto) payload.foto = firebase.firestore.FieldValue.delete();
      await db.collection('products').doc(EDIT_ID).update(payload);
      const changes = [], priceChanged = Number(old.harga)!==harga;
      if(old.nama!==nama) changes.push('nama "'+old.nama+'" → "'+nama+'"');
      if(priceChanged) changes.push(rp(old.harga||0)+' → '+rp(harga));
      if(old.c!==kat) changes.push('kategori '+old.c+' → '+kat);
      if(wasActive && !aktif) changes.push('disembunyikan');
      if(!wasActive && aktif) changes.push('ditampilkan lagi');
      if(!EDIT_FOTO && old.foto) changes.push('foto dihapus');
      Object.assign(old, payload, { c:kat, m:cat.mode||'cafe' });
      if(!EDIT_FOTO) delete old.foto;
      if(!aktif) S.cart = S.cart.filter(l=>l.id!==EDIT_ID || l.p!=null);
      if(changes.length) audit(priceChanged ? 'price' : 'menu', nama+': '+changes.join(' · '));
      toast('Menu diperbarui','✅');
    } else {
      const ref = await db.collection('products').add(payload);
      PRODS.push(Object.assign({ id:ref.id, c:kat, m:cat.mode||'cafe' }, payload));
      audit('menu', 'Menu baru: '+nama+' · '+rp(harga)+' · '+(cat.nama||kat));
      toast('Menu ditambahkan','✅');
    }
    closeOv('ovEditProduct');
    renderCats(); renderProducts(); renderCart();
  }catch(err){
    toast('Gagal menyimpan: '+err.message,'❌');
  }finally{
    btn.disabled=false; btn.textContent='Simpan Perubahan';
  }
}

/* ===== Kategori menu (Pengaturan) ===== */
function renderCatList(){
  const list = CATS.slice().sort((a,b)=>(a.mode||'').localeCompare(b.mode||'') || (a.urutan||0)-(b.urutan||0));
  $('catList').innerHTML = list.length ? list.map(c=>`<div class="cat-row" data-cat="${esc(c.id)}">
      <input class="inp ci" maxlength="4" value="${esc(c.ikon||'')}">
      <input class="inp cn" maxlength="30" value="${esc(c.nama||'')}">
      <input class="inp cu mono" type="number" value="${Number(c.urutan)||0}" title="Urutan">
      <small>${c.mode==='hotel'?'Hotel':'Kafe'} · ${PRODS.filter(p=>p.c===c.id).length} menu</small></div>`).join('') : '<div class="empty-rep">Belum ada kategori.</div>';
}
async function saveCats(){
  if(!(await reauth('Simpan kategori menu'))) return;
  const rows = [...document.querySelectorAll('#catList .cat-row')];
  const btn = $('btnSaveCats'); btn.disabled = true;
  try{
    let n = 0;
    for(const row of rows){
      const id = row.dataset.cat, c = catOf(id); if(!c) continue;
      const ins = row.querySelectorAll('input');
      const ikon = ins[0].value.trim() || c.ikon, nama = ins[1].value.trim() || c.nama, urutan = parseInt(ins[2].value) || 0;
      if(ikon!==c.ikon || nama!==c.nama || urutan!==(Number(c.urutan)||0)){
        await db.collection('categories').doc(id).update({ ikon, nama, urutan });
        if(nama!==c.nama) audit('menu', 'Kategori "'+c.nama+'" → "'+nama+'"');
        Object.assign(c, { ikon, nama, urutan }); n++;
      }
    }
    renderCats(); renderCatList();
    toast(n ? 'Kategori disimpan' : 'Tidak ada perubahan','✅');
  }catch(err){ toast('Gagal: '+err.message,'❌'); }
  finally{ btn.disabled = false; }
}
async function addCat(){
  const nama = $('ncNama').value.trim(), ikon = $('ncIkon').value.trim() || '🍽️', mode = $('ncMode').value;
  if(!nama){ toast('Isi nama kategori','⚠️'); return; }
  let id = nama.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || ('kat-'+Date.now().toString(36));
  if(catOf(id)) id += '-' + Date.now().toString(36).slice(-4);
  const urutan = Math.max(0, ...CATS.filter(c=>c.mode===mode).map(c=>Number(c.urutan)||0)) + 1;
  try{
    await db.collection('categories').doc(id).set({ nama, ikon, mode, urutan });
    CATS.push({ id, nama, ikon, mode, urutan });
    audit('menu', 'Kategori baru: '+ikon+' '+nama+' ('+mode+')');
    $('ncNama').value=''; $('ncIkon').value='';
    renderCats(); renderCatList(); toast('Kategori ditambahkan','✅');
  }catch(err){ fail(err); }
}

/* ===== Util ===== */
function printEl(id){
  const el = $(id); el.classList.add('print-target');
  window.print();
  setTimeout(()=>el.classList.remove('print-target'), 800);
}
function activeTX(){ return TX.filter(t=>!t.void); }
function stripTags(h){ const d=document.createElement('div'); d.innerHTML=h; return d.textContent||''; }
function orderMeta(){
  return { meja:$('tableNo').value||null, kamar:$('roomNo').value.trim()||null,
    tamu: S.orderType==='room' ? ($('guestName').value.trim()||null) : (S.orderType==='takeaway' ? ($('guestTA').value.trim()||null) : null) };
}

/* ===== Pesanan terbuka: pesan dulu, bayar belakangan ===== */
async function saveOpenOrder(extra){
  const u = currentUser(), c = calc();
  const items = S.cart.map(l=>{ const p = lineInfo(l); return {id:l.id, n:p.nama, p:p.harga, k:p.kat, q:l.q, sent:l.sent||0}; });
  const base = Object.assign({ type:S.orderType, meta:orderMeta(), items, sub:c.sub, disc:c.disc, tax:c.tax, total:c.total,
    disc_mode:S.discMode, disc_val:num0($('discVal').value),
    user_id:u.id, user_name:u.nama, updated_at: firebase.firestore.Timestamp.now() }, extra||{});
  if(S.activeOrderId){
    const ref = db.collection('openOrders').doc(S.activeOrderId);
    await db.runTransaction(async t=>{
      const cur = await t.get(ref);
      if(!cur.exists || cur.data().status!=='open') throw new Error('Pesanan '+S.activeOrderNo+' sudah dibayar / dibatalkan di device lain. Kosongkan keranjang lalu buat pesanan baru.');
      t.update(ref, base);
    });
  } else {
    const no = await allocNo();
    const ref = await db.collection('openOrders').add(Object.assign({ no, status:'open', chargeToRoom:false, created_at: firebase.firestore.Timestamp.now() }, base));
    S.activeOrderId = ref.id; S.activeOrderNo = no;
  }
  return S.activeOrderId;
}
/* Tandai semua item terkirim ke dapur; kembalikan fungsi untuk membatalkan tanda itu kalau penyimpanan gagal */
function markSent(){
  const before = S.cart.map(l=>l.sent||0);
  const kot = S.cart.filter(l=>l.q>(l.sent||0)).map(l=>({n:lineInfo(l).nama, q:l.q-(l.sent||0)}));
  S.cart.forEach(l=>l.sent=l.q);
  return { kot, undo(){ S.cart.forEach((l,i)=>{ l.sent = Math.min(l.q, before[i]||0); }); } };
}
async function sendToKitchen(){
  if(!S.cart.length) return;
  if(!SHIFT){ showOv('ovShift'); return; }
  if(S.folioRoomId){ toast('Ini tagihan checkout kamar — selesaikan lewat BAYAR','⚠️'); return; }
  if(!S.cart.some(l=>l.q>(l.sent||0))){ toast('Semua item sudah dikirim ke dapur','ℹ️'); return; }
  if(S.orderType==='room' && !$('roomNo').value.trim()){ toast('Isi nomor kamar dulu','⚠️'); $('roomNo').focus(); return; }
  const btn = $('btnKot'); btn.disabled = true;
  const m = markSent();
  try{
    await saveOpenOrder();
    renderCart();
    showKOT(m.kot, S.activeOrderNo, stripTags(ctxText()));
    toast('Tiket dapur dibuat · pesanan '+S.activeOrderNo+' tersimpan','🍳');
  }catch(err){ m.undo(); renderCart(); fail(err); }
}
function showKOT(items, no, ctx){
  const d = new Date();
  LAST_KOT = {items, no, ctx, time:d};
  $('kotPaper').innerHTML = `<h2>DAPUR</h2>
    <div class="c">${esc(no||'')} · ${d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'})}</div>
    <div class="c big">${esc(ctx)}</div>
    <div class="dash"></div>
    ${items.map(i=>`<div class="rrow big"><span>${i.q}×</span><span class="nm no-i18n">${esc(i.n)}</span></div>`).join('')}
    <div class="dash"></div>
    <div class="c no-i18n">${esc((currentUser().nama||'').split(' ')[0])}</div>`;
  showOv('ovKot');
}
function orderLabel(o){
  const m = o.meta||{};
  return o.type==='dinein' ? 'Meja '+(m.meja||'-') : o.type==='takeaway' ? 'Take Away'+(m.tamu?' · '+m.tamu:'') : 'Kamar '+(m.kamar||'-')+(m.tamu?' · '+m.tamu:'');
}
function openOrdersModal(){
  const list = $('ooList');
  if(!OPEN.length){ list.innerHTML = '<div class="empty-rep">📭<br>Tidak ada pesanan terbuka.</div>'; }
  else list.innerHTML = OPEN.map(o=>{
    const d = o.created_at && o.created_at.toDate ? o.created_at.toDate() : new Date();
    const unsent = (o.items||[]).reduce((s,i)=>s+Math.max(0,i.q-(i.sent||0)),0);
    return `<div class="tx-row">
      <span class="tx-time">${d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'})}</span>
      <div class="tx-main"><div class="tx-no">${esc(o.no)}${o.chargeToRoom?'<span class="badge b-card">FOLIO</span>':''}${unsent?'<span class="badge b-void">'+unsent+' belum ke dapur</span>':''}</div>
      <div class="tx-sub">${esc(orderLabel(o))} · ${(o.items||[]).reduce((s,i)=>s+i.q,0)} item · <span class="no-i18n">${esc(o.user_name||'')}</span></div></div>
      <span class="tx-total">${rp(o.total||0)}</span>
      <button class="tx-view" onclick="loadOrder('${o.id}')">Buka</button>
      ${isAdmin()?`<button class="tx-view danger" aria-label="Batalkan" onclick="deleteOpenOrder('${o.id}')">✕</button>`:''}
    </div>`;
  }).join('');
  showOv('ovOrders');
}
function loadOrder(id){
  const o = OPEN.find(x=>x.id===id); if(!o) return;
  if(S.cart.length && S.activeOrderId!==id && !confirm('Keranjang sekarang akan diganti dengan pesanan '+o.no+'. Lanjut?')) return;
  resetOrder();
  /* harga yang tercatat di pesanan dipakai kalau menu sudah berubah harga / disembunyikan */
  S.cart = (o.items||[]).map(i=>{
    const p = byId(i.id), l = {id:i.id, q:i.q, sent:i.sent||0};
    if(!p || Number(p.harga)!==Number(i.p) || !isActive(p)){ l.p = Number(i.p)||0; l.n = i.n; if(i.k) l.k = i.k; }
    return l;
  });
  S.activeOrderId = o.id; S.activeOrderNo = o.no;
  setDiscMode(o.disc_mode==='nominal' ? 'nominal' : 'percent');
  $('discVal').value = o.disc_val ? o.disc_val : (o.disc && !o.disc_mode ? o.disc : '');
  if(o.disc && !o.disc_mode) setDiscMode('nominal');
  const m = o.meta||{};
  if(o.type==='room') setMode('hotel');
  setOrderType(o.type||'dinein');
  $('tableNo').value = m.meja||''; $('roomNo').value = m.kamar||'';
  $('guestName').value = o.type==='room' ? (m.tamu||'') : ''; $('guestTA').value = o.type==='takeaway' ? (m.tamu||'') : '';
  closeOv('ovOrders'); renderCart(); renderProducts(); openCart();
  toast('Pesanan '+o.no+' dibuka di keranjang','📋');
}
async function deleteOpenOrder(id){
  const o = OPEN.find(x=>x.id===id); if(!o) return;
  const reason = prompt('Alasan membatalkan pesanan '+o.no+'?'); if(reason===null) return;
  if(!reason.trim()){ toast('Alasan wajib diisi','⚠️'); return; }
  if(!(await reauth('Batalkan pesanan '+o.no))) return;
  try{
    await db.collection('openOrders').doc(id).update({status:'void', void_reason:reason, void_by:currentUser().nama, void_at: firebase.firestore.Timestamp.now()});
    if(S.activeOrderId===id){ resetOrder(); renderCart(); renderProducts(); }
    toast('Pesanan '+o.no+' dibatalkan','🗑️');
    audit('order_void', o.no+' · '+rp(o.total||0)+' · alasan: '+reason, 'warn');
  }catch(err){ fail(err); }
}

/* ===== Tagihkan ke kamar (room folio) ===== */
async function chargeToRoom(){
  if(!S.cart.length) return;
  if(!SHIFT){ showOv('ovShift'); return; }
  if(S.folioRoomId){ toast('Ini tagihan checkout kamar — selesaikan lewat BAYAR','⚠️'); return; }
  const kamar = $('roomNo').value.trim();
  if(!kamar){ toast('Isi nomor kamar dulu','⚠️'); $('roomNo').focus(); return; }
  const room = ROOMS.find(r=>String(r.no)===kamar);
  if(!room){ toast('Kamar '+kamar+' tidak terdaftar di Papan Kamar','⚠️'); return; }
  if(room.status!=='terisi'){ toast('Kamar '+kamar+' belum check-in. Check-in dulu di Papan Kamar.','⚠️'); return; }
  if(!$('guestName').value.trim()) $('guestName').value = room.tamu||'';
  const btn = $('btnFolio'); btn.disabled = true;
  const m = markSent();
  try{
    await saveOpenOrder({chargeToRoom:true, stay:stayKey(room)});
    const no = S.activeOrderNo, ctx = stripTags(ctxText());
    resetOrder(); renderCart(); renderProducts(); closeCart();
    toast('Pesanan '+no+' ditagihkan ke kamar '+kamar,'🛏️');
    if(m.kot.length) showKOT(m.kot, no, ctx);
  }catch(err){ m.undo(); renderCart(); fail(err); }
}

/* =====================================================================
   KAMAR HOTEL — pola dari PMS open-source (kamra-pms, sunilkumarkumawat/hotel,
   harshuDev/hotel-pms, open-hotel-pms): status per tanggal, tape chart,
   pencarian ketersediaan, reservasi, tarif weekend, housekeeping.
   ===================================================================== */
let ROOM_FILTER = 'all', ROOM_TAB = 'status', BOOKINGS = [], CAL_START = null, FOLIO_BOOKING_ID = null;
const DAYMS = 86400000;
function ymd(d){ const x = new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); }
function pd(sv){ const a = String(sv).split('-').map(Number); return new Date(a[0], a[1]-1, a[2]); }
function addD(sv, n){ const d = pd(sv); d.setDate(d.getDate()+n); return ymd(d); }
function nightsBetween(a, b){ return Math.round((pd(b)-pd(a))/DAYMS); }
function todayYmd(){ return ymd(new Date()); }
function fmtD(sv){ return pd(sv).toLocaleDateString(LOC(),{weekday:'short',day:'numeric',month:'short'}); }
function isWeekendNight(sv){ const w = pd(sv).getDay(); return w===5 || w===6; }   /* malam Jumat & Sabtu */
function stayCost(rate, rateWe, dari, sampai){
  let wd = 0, we = 0;
  for(let d = dari; d < sampai; d = addD(d,1)){ if(rateWe>0 && isWeekendNight(d)) we++; else wd++; }
  return { wd, we, nights: wd+we, total: wd*rate + we*(rateWe>0 ? rateWe : rate) };
}
function rateTxt(rate, rateWe){ return rp(rate) + (rateWe>0 ? ' · Jum–Sab '+rp(rateWe) : ''); }
/* Penanda satu masa inap (waktu check-in). Tagihan folio hanya milik tamu yang sedang menginap. */
function stayKey(r){ return r && r.checkin_at && r.checkin_at.toMillis ? String(r.checkin_at.toMillis()) : ''; }
function roomFolio(r){
  const key = stayKey(r), since = Number(key)||0;
  return OPEN.filter(o=>o.chargeToRoom && o.meta && String(o.meta.kamar)===String(r.no) &&
    (o.stay ? o.stay===key : ((o.created_at && o.created_at.toMillis ? o.created_at.toMillis() : 0) >= since)));
}
function roomRate(r){ return Number(r.status==='terisi' && r.harga_malam!=null ? r.harga_malam : r.harga) || 0; }
function roomRateWe(r){ return Number(r.status==='terisi' && r.harga_malam!=null ? r.harga_weekend_malam : r.harga_weekend) || 0; }
function checkinYmd(r){ return r.checkin_at && r.checkin_at.toDate ? ymd(r.checkin_at.toDate()) : todayYmd(); }
function stayDates(r){
  const dari = checkinYmd(r), plan = Math.max(1, Number(r.malam)||1);
  let sampai = addD(dari, plan); if(sampai <= todayYmd()) sampai = addD(todayYmd(), 1);   /* tamu belum checkout = kamar tetap terpakai */
  return { dari, sampai };
}
function activeBookings(){ return BOOKINGS.filter(b=>b.status==='booked'); }
function roomStateOn(r, d){
  if(r.hk==='perbaikan') return { st:'perbaikan' };
  if(r.status==='terisi'){ const sd = stayDates(r); if(d>=sd.dari && d<sd.sampai) return { st:'terisi', who:r.tamu }; }
  const b = activeBookings().find(b=>b.room_id===r.id && b.dari<=d && d<b.sampai);
  if(b) return { st:'dipesan', who:b.tamu, b };
  return { st:'kosong', kotor: r.hk==='kotor' && d===todayYmd() };
}
function roomFree(r, dari, sampai, ignoreId){
  if(r.hk==='perbaikan') return false;
  if(r.status==='terisi'){ const sd = stayDates(r); if(dari < sd.sampai && sd.dari < sampai) return false; }
  return !activeBookings().some(b=>b.room_id===r.id && b.id!==ignoreId && b.dari<sampai && dari<b.sampai);
}
function nextBooking(r, from){ return activeBookings().filter(b=>b.room_id===r.id && b.sampai>from).sort((a,b)=>a.dari.localeCompare(b.dari))[0]; }
/* Tagihan kamar = sewa + pesanan folio (harga & diskon saat dipesan) + pajak — rumusnya sama dengan keranjang saat checkout */
function roomBill(r){
  const f = roomFolio(r);
  const folioSub = f.reduce((s,o)=>s+(Number(o.sub)||0),0), folioDisc = f.reduce((s,o)=>s+(Number(o.disc)||0),0);
  const rate = roomRate(r), rateWe = roomRateWe(r);
  let nights = 0, wd = 0, we = 0, sewa = 0;
  if(r.status==='terisi'){
    const dari = checkinYmd(r); nights = Math.max(1, nightsBetween(dari, todayYmd()));
    const c = stayCost(rate, rateWe, dari, addD(dari, nights)); wd = c.wd; we = c.we; sewa = c.total;
  }
  const b = billCalc(folioSub + sewa, Math.min(folioDisc, folioSub + sewa));
  return Object.assign(b, { folioSub, folioDisc, nights, wd, we, rate, rateWe, sewa });
}
function sortedRooms(){ return ROOMS.slice().sort((a,b)=>String(a.no).localeCompare(String(b.no),undefined,{numeric:true})); }

function openRoomBoard(){
  if(!$('roomDate').value) $('roomDate').value = todayYmd();
  renderRoomTab(); showOv('ovRooms');
}
function setRoomTab(t){
  ROOM_TAB = t;
  [['status','rtStatus','rpStatus'],['cal','rtCal','rpCal'],['find','rtFind','rpFind'],['book','rtBook','rpBook']].forEach(([k,b,p])=>{
    $(b).classList.toggle('on', k===t); $(p).style.display = k===t ? '' : 'none';
  });
  renderRoomTab();
}
function renderRoomTab(){
  renderHotelToday();
  $('rtBookN').textContent = activeBookings().length;
  if(ROOM_TAB==='status') renderRooms();
  else if(ROOM_TAB==='cal') renderCal();
  else if(ROOM_TAB==='find') findRooms();
  else renderBookings();
}
function renderHotelToday(){
  const t = todayYmd(), rs = sortedRooms();
  const isi = rs.filter(r=>r.status==='terisi').length;
  const tiba = activeBookings().filter(b=>b.dari===t).length;
  const pergi = rs.filter(r=>r.status==='terisi' && addD(checkinYmd(r), Math.max(1,Number(r.malam)||1))<=t).length;
  const kotor = rs.filter(r=>r.hk==='kotor' && r.status!=='terisi').length;
  $('hotelToday').innerHTML = rs.length ? `
    <div class="ht"><b>${isi}/${rs.length}</b>Terisi · ${Math.round(isi/rs.length*100)}%</div>
    <div class="ht"><b>${tiba}</b>🛬 Tiba hari ini</div>
    <div class="ht"><b>${pergi}</b>🛫 Jadwal checkout</div>
    <div class="ht"><b>${kotor}</b>🧹 Perlu dibersihkan</div>` : '';
}
function setRoomFilter(f){ ROOM_FILTER = f; renderRooms(); }
function renderRooms(){
  const g = $('roomGrid'); if(!g) return;
  const d = $('roomDate').value || todayYmd();
  const rs = sortedRooms(), states = rs.map(r=>({r, s:roomStateOn(r,d)}));
  const cnt = k => states.filter(x=>x.s.st===k).length;
  $('roomSum').innerHTML = rs.length ? [
      ['all','Semua',rs.length], ['kosong','✅ Kosong',cnt('kosong')], ['dipesan','🟠 Dipesan',cnt('dipesan')], ['terisi','🔴 Terisi',cnt('terisi')]
    ].map(([k,l,n])=>`<button class="rs-chip ${ROOM_FILTER===k?'on':''}" onclick="setRoomFilter('${k}')"><b>${n}</b>${l}</button>`).join('') : '';
  const list = states.filter(x=>ROOM_FILTER==='all' || x.s.st===ROOM_FILTER);
  if(!rs.length) g.innerHTML = '<div class="empty-rep" style="grid-column:1/-1">Belum ada kamar. '+(isAdmin()?'Tambahkan di bawah (nomor, tipe, harga per malam).':'Minta Admin menambahkan.')+'</div>';
  else if(!list.length) g.innerHTML = '<div class="empty-rep" style="grid-column:1/-1">Tidak ada kamar dengan status ini pada '+fmtD(d)+'.</div>';
  else g.innerHTML = list.map(({r,s:st})=>{
    const bill = st.st==='terisi' ? roomBill(r) : null;
    const line = st.st==='terisi' ? `<small style="color:var(--red);font-weight:800"><span class="no-i18n">${esc(st.who||'-')}</span> · ${bill.nights} mlm</small>${bill.total?`<small class="mono">Tagihan ${rp(bill.total)}</small>`:''}`
      : st.st==='dipesan' ? `<small style="color:var(--amber-deep);font-weight:800">Dipesan: <span class="no-i18n">${esc(st.who||'-')}</span></small><small>${fmtD(st.b.dari)} → ${fmtD(st.b.sampai)}</small>`
      : st.st==='perbaikan' ? '<span class="hk-badge hk-perbaikan">🔧 Perbaikan</span>'
      : `<small style="color:var(--green-deep);font-weight:800">Kosong${st.kotor?'':' · siap'}</small>${st.kotor?'<span class="hk-badge hk-kotor">🧹 Belum dibersihkan</span>':''}`;
    return `<div class="room st-${st.st} ${st.st==='terisi'?'on':''}" onclick="openRoomDetail('${r.id}')"><b>${esc(r.no)}</b><small>${esc(r.tipe||'—')}</small>
      <div class="rprice">${rp(Number(r.harga)||0)}<span> /malam</span>${Number(r.harga_weekend)>0?`<span> · Jum–Sab ${rp(r.harga_weekend)}</span>`:''}</div>${line}</div>`;
  }).join('');
  $('roomAdmin').style.display = isAdmin() ? 'flex' : 'none';
  $('roomList').innerHTML = rs.filter(r=>r.status==='terisi').map(r=>`<option value="${esc(r.no)}">${esc(r.tamu||'')}</option>`).join('');
}

/* ---- Kalender (tape chart): kamar × 14 hari ---- */
const ST_LABEL = { kosong:'Kosong', dipesan:'Dipesan', terisi:'Terisi', perbaikan:'Perbaikan' };
function shiftCal(n){ CAL_START = addD(CAL_START || todayYmd(), n); renderCal(); }
function renderCal(){
  if(!CAL_START) CAL_START = todayYmd();
  const days = Array.from({length:14},(_,i)=>addD(CAL_START,i)), t = todayYmd();
  $('calLabel').textContent = fmtD(days[0]) + ' – ' + fmtD(days[13]);
  const rs = sortedRooms();
  if(!rs.length){ $('calTable').innerHTML = '<tr><td class="empty-rep" style="padding:20px">Belum ada kamar.</td></tr>'; return; }
  const head = '<tr><th class="rn">Kamar</th>' + days.map(d=>{
    const x = pd(d); return `<th class="${d===t?'today':''} ${isWeekendNight(d)?'we':''}">${x.toLocaleDateString(LOC(),{weekday:'short'})}<br>${x.getDate()}</th>`;
  }).join('') + '</tr>';
  const rows = rs.map(r=>{
    let prevKey = '';
    const cells = days.map(d=>{
      const st = roomStateOn(r,d), key = st.st+'|'+(st.who||'');
      const label = (st.who && key!==prevKey) ? `<span class="no-i18n">${esc(st.who)}</span>` : '';
      prevKey = key;
      const act = st.st==='kosong' ? `startBooking('${r.id}','${d}')` : st.st==='dipesan' ? `openBookingRow('${st.b.id}')` : st.st==='terisi' ? `openRoomDetail('${r.id}')` : '';
      return `<td class="c-${st.st}" ${act?`onclick="${act}"`:''} title="${esc(r.no)} · ${fmtD(d)} · ${esc(T(ST_LABEL[st.st]))}">${label}</td>`;
    }).join('');
    return `<tr><td class="rn">${esc(r.no)}<small>${esc(r.tipe||'')}</small></td>${cells}</tr>`;
  }).join('');
  $('calTable').innerHTML = head + rows;
}

/* ---- Cari kamar kosong untuk rentang tanggal ---- */
function findRooms(){
  if(!$('bkDari').value) $('bkDari').value = todayYmd();
  if(!$('bkSampai').value || $('bkSampai').value <= $('bkDari').value) $('bkSampai').value = addD($('bkDari').value, 1);
  const tipes = [...new Set(sortedRooms().map(r=>r.tipe).filter(Boolean))], cur = $('bkTipe').value;
  $('bkTipe').innerHTML = '<option value="">Semua tipe</option>' + tipes.map(x=>`<option ${x===cur?'selected':''}>${esc(x)}</option>`).join('');
  const dari = $('bkDari').value, sampai = $('bkSampai').value, tipe = $('bkTipe').value;
  const n = nightsBetween(dari, sampai);
  const free = sortedRooms().filter(r=>(!tipe || r.tipe===tipe) && roomFree(r, dari, sampai));
  const box = $('findResult');
  if(!ROOMS.length){ box.innerHTML = '<div class="empty-rep">Belum ada kamar.</div>'; return; }
  box.innerHTML = `<div class="tx-sub" style="margin-bottom:8px">${fmtD(dari)} → ${fmtD(sampai)} · <b>${n} malam</b> · ${free.length} kamar tersedia</div>` +
    (free.length ? free.map(r=>{
      const c = stayCost(Number(r.harga)||0, Number(r.harga_weekend)||0, dari, sampai);
      return `<div class="find-row"><div class="fm"><b>${esc(r.no)}</b> <span class="tx-sub">${esc(r.tipe||'')}</span>
          <small>${c.wd?c.wd+' × '+rp(Number(r.harga)||0):''}${c.wd&&c.we?' + ':''}${c.we?c.we+' × '+rp(Number(r.harga_weekend)||0)+' (Jum–Sab)':''}${r.hk==='kotor'&&dari===todayYmd()?' · 🧹 perlu dibersihkan':''}</small></div>
        <span class="tx-total">${rp(c.total)}</span>
        ${dari===todayYmd()?`<button class="tx-view ok" onclick="walkInFromFind('${r.id}')">Check-in</button>`:''}
        <button class="tx-view" onclick="startBooking('${r.id}','${dari}','${sampai}')">Pesan</button></div>`;
    }).join('') : '<div class="empty-rep">Tidak ada kamar kosong untuk tanggal ini. Coba tanggal atau tipe lain.</div>');
}
function walkInFromFind(id){
  ROOM_ID = id; openRoomDetail(id);
  const n = nightsBetween($('bkDari').value, $('bkSampai').value);
  if($('rdNights')){ $('rdNights').value = n; updateCheckinEst(); }
}

/* ---- Reservasi ---- */
function startBooking(roomId, dari, sampai){
  const r = ROOMS.find(x=>x.id===roomId); if(!r) return;
  ROOM_ID = roomId; sampai = sampai || addD(dari, 1);
  $('rdTitle').textContent = 'Pesan kamar '+r.no+(r.tipe?' · '+r.tipe:'');
  $('rdBody').innerHTML = `
    <div style="display:flex;gap:8px"><div style="flex:1"><div class="field-lbl" style="margin-top:0">Masuk</div><input type="date" id="bfDari" class="inp" style="margin-top:0" value="${dari}" oninput="updateBookingEst()"></div>
      <div style="flex:1"><div class="field-lbl" style="margin-top:0">Keluar</div><input type="date" id="bfSampai" class="inp" style="margin-top:0" value="${sampai}" oninput="updateBookingEst()"></div></div>
    <div class="field-lbl">Nama tamu</div><input id="bfTamu" class="inp" style="margin-top:0" placeholder="Nama tamu" maxlength="60">
    <div class="field-lbl">No. HP / WhatsApp</div><input id="bfHp" class="inp" style="margin-top:0" inputmode="tel" placeholder="08xxxxxxxxxx" maxlength="20">
    <div class="field-lbl">Catatan</div><input id="bfNote" class="inp" style="margin-top:0" placeholder="cth: datang malam, extra bed" maxlength="120">
    <div class="pay-info"><span class="lbl" id="bfInfo">—</span><span class="val ok" id="bfEst">Rp 0</span></div>
    <button class="btn-confirm" id="btnSaveBooking" onclick="saveBooking()">📋 Simpan reservasi</button>`;
  updateBookingEst(); showOv('ovRoomDetail');
  setTimeout(()=>{ const el = $('bfTamu'); if(el) el.focus(); }, 150);
}
function updateBookingEst(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r) return;
  const dari = $('bfDari').value, sampai = $('bfSampai').value;
  if(!dari || !sampai || sampai<=dari){ $('bfInfo').textContent = 'Tanggal keluar harus setelah tanggal masuk'; $('bfEst').textContent = '—'; $('bfEst').className='val no'; return false; }
  if(dari < todayYmd()){ $('bfInfo').textContent = 'Tanggal masuk sudah lewat'; $('bfEst').textContent = '—'; $('bfEst').className='val no'; return false; }
  if(!roomFree(r, dari, sampai)){ $('bfInfo').textContent = 'Kamar tidak tersedia di tanggal ini'; $('bfEst').textContent = '✕'; $('bfEst').className='val no'; return false; }
  const c = stayCost(Number(r.harga)||0, Number(r.harga_weekend)||0, dari, sampai);
  $('bfInfo').textContent = c.nights+' malam'+(c.we?' ('+c.we+' Jum–Sab)':'');
  $('bfEst').textContent = rp(c.total); $('bfEst').className = 'val ok';
  return c;
}
async function saveBooking(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r) return;
  const c = updateBookingEst(); if(!c){ toast('Periksa tanggal / ketersediaan kamar','⚠️'); return; }
  const tamu = $('bfTamu').value.trim(); if(!tamu){ toast('Isi nama tamu','⚠️'); $('bfTamu').focus(); return; }
  const u = currentUser(), dari = $('bfDari').value, sampai = $('bfSampai').value;
  const btn = $('btnSaveBooking'); btn.disabled = true;
  try{
    await db.collection('bookings').add({ room_id:r.id, room_no:r.no, tipe:r.tipe||'', tamu, hp:$('bfHp').value.trim(), catatan:$('bfNote').value.trim(),
      dari, sampai, malam:c.nights, harga_malam:Number(r.harga)||0, harga_weekend_malam:Number(r.harga_weekend)||0, total_sewa:c.total,
      status:'booked', user_id:u.id, created_by:u.nama, created_at: firebase.firestore.Timestamp.now() });
    audit('booking', 'Reservasi kamar '+r.no+' · '+tamu+' · '+dari+' → '+sampai+' · '+rp(c.total));
    closeOv('ovRoomDetail'); toast('Reservasi kamar '+r.no+' untuk '+tamu+' tersimpan','📋');
    if($('ovRooms').classList.contains('show')) setRoomTab('book');
  }catch(err){ toast('Gagal: '+err.message,'❌'); }
  finally{ btn.disabled = false; }
}
function renderBookings(){
  const t = todayYmd(), list = activeBookings().sort((a,b)=>a.dari.localeCompare(b.dari) || String(a.room_no).localeCompare(String(b.room_no),undefined,{numeric:true}));
  $('bookList').innerHTML = list.length ? list.map(b=>{
    const r = ROOMS.find(x=>x.id===b.room_id);
    const canIn = b.dari<=t && r && r.status!=='terisi' && r.hk!=='perbaikan';
    const late = b.dari<t;
    return `<div class="find-row" id="bk-${b.id}"><div class="fm"><b>${esc(b.room_no)}</b> <span class="tx-sub">${esc(b.tipe||'')}</span>
        <small><b style="font-size:12px;font-family:var(--body)">${esc(b.tamu)}</b>${b.hp?' · '+esc(b.hp):''}</small>
        <small>${fmtD(b.dari)} → ${fmtD(b.sampai)} · ${b.malam} malam${b.dari===t?' · <b style="color:var(--green-deep);font-size:11px">tiba hari ini</b>':''}${late?' · <b style="color:var(--red);font-size:11px">terlambat</b>':''}${b.catatan?' · '+esc(b.catatan):''}</small></div>
      <span class="tx-total">${rp(b.total_sewa||0)}</span>
      ${canIn?`<button class="tx-view ok" onclick="checkinBooking('${b.id}')">Check-in</button>`:''}
      ${b.hp?`<button class="tx-view wa" onclick="waBooking('${b.id}')">WA</button>`:''}
      <button class="tx-view danger" onclick="cancelBooking('${b.id}')">Batal</button></div>`;
  }).join('') : '<div class="empty-rep">Belum ada reservasi aktif. Buat lewat tab 🔎 Cari & pesan atau 📅 Kalender.</div>';
}
function openBookingRow(id){ setRoomTab('book'); setTimeout(()=>{ const el = $('bk-'+id); if(el){ el.scrollIntoView({block:'center'}); el.style.outline='2px solid var(--amber)'; } }, 50); }
/* Check-in aman dari dua device sekaligus: gagal kalau kamar sudah terisi */
async function occupyRoom(roomId, data, extra){
  const ref = db.collection('rooms').doc(roomId);
  await db.runTransaction(async t=>{
    const cur = await t.get(ref);
    if(!cur.exists) throw new Error('Kamar tidak ditemukan');
    if(cur.data().status==='terisi') throw new Error('Kamar '+cur.data().no+' baru saja diisi dari device lain');
    t.update(ref, Object.assign({ status:'terisi', checkin_at: firebase.firestore.Timestamp.now() }, data));
    if(extra) extra(t);
  });
}
async function checkinBooking(id){
  const b = BOOKINGS.find(x=>x.id===id); if(!b) return;
  const r = ROOMS.find(x=>x.id===b.room_id); if(!r){ toast('Kamar tidak ditemukan','⚠️'); return; }
  if(r.status==='terisi'){ toast('Kamar '+r.no+' masih terisi','⚠️'); return; }
  if(r.hk==='perbaikan'){ toast('Kamar '+r.no+' sedang perbaikan','⚠️'); return; }
  const t = todayYmd(), malam = Math.max(1, nightsBetween(t, b.sampai)), now = firebase.firestore.Timestamp.now();
  try{
    await occupyRoom(r.id, { tamu:b.tamu, malam, harga_malam:b.harga_malam||0, harga_weekend_malam:b.harga_weekend_malam||0, booking_id:b.id },
      t=>t.update(db.collection('bookings').doc(b.id), { status:'checked_in', checkin_at:now }));
    audit('booking_in', 'Check-in reservasi kamar '+r.no+' · '+b.tamu);
    toast('Kamar '+r.no+' check-in: '+b.tamu,'🔑');
  }catch(err){ fail(err); }
}
async function cancelBooking(id){
  const b = BOOKINGS.find(x=>x.id===id); if(!b) return;
  const reason = prompt('Alasan membatalkan reservasi '+b.tamu+' (kamar '+b.room_no+')?'); if(reason===null) return;
  if(!reason.trim()){ toast('Alasan wajib diisi','⚠️'); return; }
  try{
    await db.collection('bookings').doc(id).update({ status:'cancelled', cancel_reason:reason, cancelled_by:currentUser().nama, cancelled_at: firebase.firestore.Timestamp.now() });
    audit('booking_cancel', 'Batal reservasi kamar '+b.room_no+' · '+b.tamu+' · alasan: '+reason, 'warn');
    toast('Reservasi dibatalkan','🗑️');
  }catch(err){ fail(err); }
}
function waBooking(id){
  const b = BOOKINGS.find(x=>x.id===id); if(!b || !b.hp) return;
  const no = waNumber(b.hp); if(!no){ toast('Nomor HP tamu tidak valid','⚠️'); return; }
  const msg = ['Halo '+b.tamu+',', '', 'Reservasi Anda di *'+(STORE.nama||'hotel kami')+'* sudah kami catat:',
    '🛏️ Kamar '+b.room_no+(b.tipe?' ('+b.tipe+')':''), '📅 '+fmtD(b.dari)+' → '+fmtD(b.sampai)+' ('+b.malam+' malam)', '💰 Estimasi '+rp(b.total_sewa||0), '', 'Sampai jumpa! 🙏'].join('\n');
  window.open('https://wa.me/'+no+'?text='+encodeURIComponent(msg), '_blank', 'noopener');
}

/* ---- Kelola kamar ---- */
async function addRoom(){
  const no = $('newRoomNo').value.trim(), tipe = $('newRoomTipe').value.trim(), harga = Math.round(num0($('newRoomHarga').value)), harga_weekend = Math.round(num0($('newRoomHargaWe').value));
  if(!no){ toast('Isi nomor kamar','⚠️'); return; }
  if(ROOMS.find(r=>String(r.no)===no)){ toast('Kamar '+no+' sudah ada','⚠️'); return; }
  if(harga<=0 && !confirm('Harga per malam belum diisi (Rp 0). Tetap tambahkan?')) return;
  try{
    await db.collection('rooms').add({no, tipe, harga, harga_weekend, hk:'bersih', status:'kosong', tamu:null, checkin_at:null});
    $('newRoomNo').value=''; $('newRoomTipe').value=''; $('newRoomHarga').value=''; $('newRoomHargaWe').value='';
    audit('room', 'Kamar baru '+no+(tipe?' · '+tipe:'')+' · '+rateTxt(harga, harga_weekend));
    toast('Kamar '+no+' ditambahkan · '+rateTxt(harga, harga_weekend),'✅');
  }catch(err){ fail(err); }
}
function roomAdminBox(r){
  if(!isAdmin()) return '';
  return `<details style="margin-top:12px"><summary class="rp-title" style="cursor:pointer;margin:6px 0">⚙️ Kelola kamar (tipe, harga, perbaikan)</summary>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input id="rdTipe" class="inp" style="flex:1;min-width:110px" value="${esc(r.tipe||'')}" placeholder="Tipe">
      <input id="rdHarga" class="inp mono" type="number" min="0" style="flex:1;min-width:110px;font-size:14px" value="${Number(r.harga)||0}" placeholder="Harga/malam">
      <input id="rdHargaWe" class="inp mono" type="number" min="0" style="flex:1;min-width:130px;font-size:14px" value="${Number(r.harga_weekend)||''}" placeholder="Harga Jum–Sab">
    </div>
    <button class="btn2 solid" style="width:100%;margin-top:8px" onclick="saveRoomEdit()">Simpan</button>
    ${r.status!=='terisi' ? (r.hk==='perbaikan'
        ? `<button class="btn2 ghost" style="width:100%;margin-top:8px" onclick="setRoomHk('bersih')">✅ Selesai perbaikan (bisa dijual lagi)</button>`
        : `<button class="btn2 ghost" style="width:100%;margin-top:8px" onclick="setRoomHk('perbaikan')">🔧 Tandai perbaikan (tidak bisa dipesan)</button>`) : ''}
    ${r.status!=='terisi'?`<button class="btn2 ghost" style="width:100%;margin-top:8px;color:var(--red)" onclick="deleteRoom()">🗑️ Hapus kamar ini</button>`:''}
  </details>`;
}
let RD_STATE = '';
function refreshRoomDetail(){
  if(!$('ovRoomDetail').classList.contains('show') || !ROOM_ID || $('bfTamu')) return;
  const r = ROOMS.find(x=>x.id===ROOM_ID);
  if(!r){ closeOv('ovRoomDetail'); return; }
  const el = document.activeElement, typing = $('rdBody').contains(el) && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
  if(RD_STATE===r.status+'|'+r.hk && (r.status!=='terisi' || typing)) return;
  openRoomDetail(ROOM_ID);
}
function openRoomDetail(id){
  const r = ROOMS.find(x=>x.id===id); if(!r) return; ROOM_ID = id; RD_STATE = r.status+'|'+r.hk;
  $('rdTitle').textContent = 'Kamar '+r.no+(r.tipe?' · '+r.tipe:'');
  const t = todayYmd(), nb = nextBooking(r, t);
  const nbTxt = nb ? `<div class="tx-sub" style="margin:4px 0 8px">📋 Reservasi berikutnya: <b>${esc(nb.tamu)}</b> · ${fmtD(nb.dari)} → ${fmtD(nb.sampai)}</div>` : '';
  let html = '';
  if(r.hk==='perbaikan' && r.status!=='terisi'){
    html = `<div class="shift-band">🔧 Sedang perbaikan<span class="mono">tidak bisa dipesan</span></div>${nbTxt}${roomAdminBox(r)}`;
  } else if(r.status!=='terisi'){
    const rate = Number(r.harga)||0, rateWe = Number(r.harga_weekend)||0;
    html = `<div class="shift-band">✅ Kosong${r.hk==='kotor'?' · 🧹 belum dibersihkan':' · siap'}<span class="mono">${rateTxt(rate, rateWe)}</span></div>
      ${r.hk==='kotor'?`<button class="btn2 ghost" style="width:100%;margin-bottom:8px" onclick="setRoomHk('bersih')">🧹 Tandai sudah dibersihkan</button>`:''}
      ${nbTxt}
      <div class="field-lbl">Check-in langsung (walk-in) · nama tamu</div>
      <input id="rdGuest" type="text" placeholder="Nama tamu" class="inp" style="margin-top:0">
      <div class="field-lbl">Rencana menginap (malam)</div>
      <input id="rdNights" type="number" min="1" value="1" class="inp mono" style="margin-top:0" oninput="updateCheckinEst()">
      <div class="pay-info"><span class="lbl" id="rdEstLbl">Estimasi sewa</span><span class="val ok" id="rdEst">${rp(rate)}</span></div>
      <button class="btn-confirm" onclick="checkinRoom()">🔑 Check-in sekarang</button>
      <button class="btn2 ghost" style="width:100%;margin-top:8px" onclick="startBooking('${r.id}','${t}')">📋 Buat reservasi (tanggal lain)</button>
      ${roomAdminBox(r)}`;
  } else {
    const b = roomBill(r), f = roomFolio(r), sd = stayDates(r);
    const d = r.checkin_at && r.checkin_at.toDate ? r.checkin_at.toDate() : null;
    html = `<div class="shift-band">👤 ${esc(r.tamu||'-')}<span class="mono">${d?'masuk '+d.toLocaleString(LOC(),{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}</span></div>
      <div class="tx-sub" style="margin:-6px 0 10px">Rencana ${Math.max(1,Number(r.malam)||1)} malam · checkout ${fmtD(addD(sd.dari, Math.max(1,Number(r.malam)||1)))}${r.booking_id?' · dari reservasi':''}</div>
      <div class="rp-title">🧾 Tagihan kamar</div>
      <div class="tx-row"><div class="tx-main"><div class="tx-no">🛏️ Sewa kamar · ${b.nights} malam</div>
        <div class="tx-sub">${b.wd?b.wd+' × '+rp(b.rate):''}${b.wd&&b.we?' + ':''}${b.we?b.we+' × '+rp(b.rateWe)+' (Jum–Sab)':''}</div></div><span class="tx-total">${rp(b.sewa)}</span></div>
      ${f.map(o=>`<div class="tx-row"><div class="tx-main"><div class="tx-no">${esc(o.no)}</div><div class="tx-sub no-i18n">${(o.items||[]).map(i=>i.q+'× '+esc(i.n)).join(', ')}</div></div><span class="tx-total">${rp((o.sub||0)-(o.disc||0))}</span></div>`).join('')}
      ${b.tax?`<div class="row"><span class="no-i18n">${esc(taxTxt())}</span><span class="v">${rp(b.tax)}</span></div>`:''}
      <div class="row total"><span class="lbl">TOTAL</span><span class="v">${rp(b.total)}</span></div>
      <button class="btn-confirm" onclick="orderForRoom()">🍽️ Pesan room service untuk kamar ini</button>
      <button class="btn-pay" onclick="checkoutRoom()" ${b.total?'':'disabled'}><span>CHECKOUT & BAYAR</span><span class="v">${rp(b.total)}</span></button>
      ${b.total?'':'<button class="btn2 ghost" style="width:100%;margin-top:8px" onclick="freeRoom()">🚪 Checkout (tanpa tagihan)</button>'}
      ${roomAdminBox(r)}`;
  }
  $('rdBody').innerHTML = html; showOv('ovRoomDetail');
}
function updateCheckinEst(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r || !$('rdNights')) return;
  const n = Math.max(1, parseInt($('rdNights').value)||1), t = todayYmd();
  const c = stayCost(Number(r.harga)||0, Number(r.harga_weekend)||0, t, addD(t, n));
  const ok = roomFree(r, t, addD(t, n));
  $('rdEstLbl').textContent = ok ? 'Estimasi sewa · '+n+' malam'+(c.we?' ('+c.we+' Jum–Sab)':'') : 'Bentrok dengan reservasi berikutnya';
  $('rdEst').textContent = ok ? rp(c.total) : '✕'; $('rdEst').className = 'val '+(ok?'ok':'no');
}
async function checkinRoom(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); const tamu = ($('rdGuest').value||'').trim();
  if(!r) return; if(!tamu){ toast('Isi nama tamu','⚠️'); return; }
  const malam = Math.max(1, parseInt(($('rdNights')||{}).value)||1), t = todayYmd();
  if(!roomFree(r, t, addD(t, malam))){
    const nb = nextBooking(r, t);
    toast('Bentrok dengan reservasi '+(nb?nb.tamu+' mulai '+fmtD(nb.dari):'lain')+'. Kurangi jumlah malam atau pilih kamar lain.','⚠️'); return;
  }
  if(r.status==='terisi'){ toast('Kamar '+r.no+' masih terisi','⚠️'); return; }
  try{
    await occupyRoom(r.id, {tamu, malam, harga_malam: Number(r.harga)||0, harga_weekend_malam: Number(r.harga_weekend)||0, booking_id:null});
    closeOv('ovRoomDetail'); toast('Kamar '+r.no+' check-in: '+tamu+' ('+malam+' malam)','🔑');
  }catch(err){ fail(err); }
}
async function setRoomHk(hk){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r) return;
  if(hk==='perbaikan' && !isAdmin()) return;
  if(hk==='perbaikan'){
    const nb = nextBooking(r, todayYmd());
    if(nb && !confirm('Kamar ini punya reservasi ('+nb.tamu+', '+fmtD(nb.dari)+'). Tetap tandai perbaikan?')) return;
  }
  try{
    await db.collection('rooms').doc(r.id).update({hk});
    if(hk!=='kotor') audit('room_hk', 'Kamar '+r.no+' → '+hk);
    toast('Kamar '+r.no+': '+(hk==='bersih'?'siap dipakai':'ditandai perbaikan'), hk==='bersih'?'🧹':'🔧');
    closeOv('ovRoomDetail');
  }catch(err){ fail(err); }
}
async function saveRoomEdit(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r || !isAdmin()) return;
  const tipe = $('rdTipe').value.trim(), harga = Math.round(num0($('rdHarga').value)), harga_weekend = Math.round(num0($('rdHargaWe').value));
  try{
    await db.collection('rooms').doc(r.id).update({tipe, harga, harga_weekend});
    audit('room', 'Kamar '+r.no+': '+(tipe||'-')+' · '+rateTxt(Number(r.harga)||0, Number(r.harga_weekend)||0)+' → '+rateTxt(harga, harga_weekend));
    toast('Kamar '+r.no+' diperbarui'+(r.status==='terisi'?' (tamu saat ini tetap tarif lama)':''),'✅');
    closeOv('ovRoomDetail');
  }catch(err){ fail(err); }
}
async function deleteRoom(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r || !isAdmin()) return;
  const nb = nextBooking(r, todayYmd());
  if(nb){ toast('Kamar '+r.no+' masih punya reservasi ('+nb.tamu+'). Batalkan dulu reservasinya.','⚠️'); return; }
  if(!confirm('Hapus kamar '+r.no+'?')) return;
  if(!(await reauth('Hapus kamar '+r.no))) return;
  try{
    await db.collection('rooms').doc(r.id).delete();
    audit('room', 'Kamar '+r.no+' dihapus', 'warn');
    closeOv('ovRoomDetail'); toast('Kamar '+r.no+' dihapus','🗑️');
  }catch(err){ fail(err); }
}
function orderForRoom(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r) return;
  setMode('hotel'); setOrderType('room');
  $('roomNo').value = r.no; $('guestName').value = r.tamu||''; updateTicketHead();
  closeOv('ovRoomDetail'); closeOv('ovRooms'); toast('Pesanan untuk kamar '+r.no,'🛏️');
}
async function freeRoom(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r) return;
  if(roomBill(r).total){ toast('Kamar ini masih punya tagihan — pakai CHECKOUT & BAYAR','⚠️'); return; }
  try{
    const wb = db.batch();
    wb.update(db.collection('rooms').doc(r.id), {status:'kosong', hk:'kotor', tamu:null, checkin_at:null, malam:null, harga_malam:null, harga_weekend_malam:null, booking_id:null});
    if(r.booking_id) wb.update(db.collection('bookings').doc(r.booking_id), {status:'done', checkout_at: firebase.firestore.Timestamp.now()});
    await wb.commit();
    closeOv('ovRoomDetail'); toast('Kamar '+r.no+' sekarang kosong (perlu dibersihkan)','🚪');
  }catch(err){ fail(err); }
}
function checkoutRoom(){
  const r = ROOMS.find(x=>x.id===ROOM_ID); if(!r) return;
  const f = roomFolio(r), b = roomBill(r);
  if(!b.total) return;
  if(!SHIFT){ showOv('ovShift'); return; }
  if(S.cart.length && S.folioRoomId!==r.id && !confirm('Keranjang sekarang akan diganti dengan tagihan kamar '+r.no+'. Lanjut?')) return;
  resetOrder();
  /* sewa kamar → akun Pendapatan Kamar (4102); pesanan folio memakai harga saat dipesan */
  const nm = 'Sewa Kamar '+r.no+(r.tipe?' ('+r.tipe+')':'');
  if(b.wd>0) S.cart.push({id:'room-'+r.id, q:b.wd, sent:b.wd, p:b.rate, n:nm, k:'kamar', e:'🛏️'});
  if(b.we>0) S.cart.push({id:'room-'+r.id+'-we', q:b.we, sent:b.we, p:b.rateWe, n:nm+' · Jum–Sab', k:'kamar', e:'🛏️'});
  f.forEach(o=>(o.items||[]).forEach(i=>{
    const p = Number(i.p)||0, same = S.cart.find(l=>l.id===i.id && l.p===p);
    if(same){ same.q += i.q; same.sent += i.q; }
    else S.cart.push({id:i.id, q:i.q, sent:i.q, p, n:i.n, k:i.k || (byId(i.id)||{}).kategori_kode || 'roomservice'});
  }));
  S.folioIds = f.map(o=>o.id); S.folioRoomId = r.id; S.folioStay = stayKey(r); FOLIO_BOOKING_ID = r.booking_id || null;
  if(b.disc){ setDiscMode('nominal'); $('discVal').value = b.disc; }
  setMode('hotel'); setOrderType('room');
  $('roomNo').value = r.no; $('guestName').value = r.tamu||'';
  renderCart(); renderProducts(); closeOv('ovRoomDetail'); closeOv('ovRooms');
  openPay();
}

/* ===== Kas masuk / keluar ===== */
function openCashMove(){
  if(!SHIFT){ showOv('ovShift'); return; }
  $('cmJumlah').value=''; $('cmCatatan').value=''; setCmTipe('masuk'); showOv('ovCash');
}
function setCmTipe(t){ CM_TIPE=t; $('cmIn').classList.toggle('on',t==='masuk'); $('cmOut').classList.toggle('on',t==='keluar'); }
async function saveCashMove(){
  const j = Math.round(num0($('cmJumlah').value)); if(j<=0){ toast('Isi jumlah','⚠️'); return; }
  if(!SHIFT){ showOv('ovShift'); return; }
  const u = currentUser(), btn = $('btnSaveCash'); btn.disabled = true;
  try{
    await db.collection('cashMoves').add({ tipe:CM_TIPE, jumlah:j, catatan:$('cmCatatan').value.trim(), shift_id:SHIFT.id, user_id:u.id, user:u.nama, created_at: firebase.firestore.Timestamp.now() });
    closeOv('ovCash'); toast('Kas '+CM_TIPE+' '+rp(j)+' dicatat','💵');
  }catch(err){ fail(err); }
  finally{ btn.disabled = false; }
}

/* ===== Void transaksi (Admin): balikkan stok + jurnal pembalik ===== */
async function voidTx(id){
  if(!isAdmin()) return;
  const t = TX.find(x=>x.id===id); if(!t || t.void) return;
  const reason = prompt('Alasan void transaksi '+t.no+'?'); if(reason===null) return;
  if(!reason.trim()){ toast('Alasan wajib diisi','⚠️'); return; }
  if(!confirm('Void '+t.no+' ('+rp(t.total)+')? Stok dikembalikan & jurnal dibalik. Tidak bisa dibatalkan.')) return;
  if(!(await reauth('Void '+t.no))) return;
  const u = currentUser(), now = firebase.firestore.Timestamp.now();
  try{
    const js = await db.collection('journals').where('no','==','JRN-'+t.no).get();
    const txRef = db.collection('transactions').doc(id);
    /* status void + jurnal pembalik dalam satu transaksi: tidak bisa ter-void dua kali dari dua device */
    await db.runTransaction(async tr=>{
      const cur = await tr.get(txRef);
      if(!cur.exists || cur.data().void) throw new Error('Transaksi ini sudah di-void.');
      tr.update(txRef, {void:true, void_reason:reason, void_by:u.nama, void_at:now});
      js.docs.forEach(j=>{
        const d = j.data();
        tr.set(db.collection('journals').doc(), { no:'JRN-VOID-'+t.no, date:now, desc:'Void '+t.no+' — '+reason, source:'POS-VOID',
          lines:(d.lines||[]).map(l=>({acc:l.acc, name:l.name, debit:l.credit||0, credit:l.debit||0})) });
      });
    });
  }catch(err){ fail(err); return; }
  audit('void', t.no+' · '+rp(t.total)+' · alasan: '+reason, 'warn');
  toast('Transaksi '+t.no+' di-void','↩️');
  await restoreStock(t, u);
}
/* Kembalikan stok persis sebanyak yang dipotong saat transaksi (dicatat di stock_moves) */
async function restoreStock(t, u){
  const failed = [];
  let moves = [];
  try{ moves = (await db.collection('stock_moves').where('tx_no','==',t.no).get()).docs.map(d=>d.data()).filter(m=>m.tipe==='keluar'); }catch(e){}
  if(!moves.length && !t.stock_tracked){   /* transaksi lama (sebelum pencatatan per transaksi): hitung ulang dari resep */
    for(const it of (t.items||[])){
      if(!byId(it.id)) continue;
      try{
        const rs = await db.collection('products').doc(it.id).collection('recipes').get();
        rs.docs.forEach(r=>{ const q = (Number(r.data().qty)||0)*it.q; if(q>0) moves.push({ingredient_id:r.id, qty:q}); });
      }catch(e){ failed.push(it.n); }
    }
  }
  for(const m of moves){
    if(!(m.qty>0)) continue;
    const ing = ING.find(i=>i.id===m.ingredient_id) || {};
    try{
      await db.collection('ingredients').doc(m.ingredient_id).update({stok: firebase.firestore.FieldValue.increment(m.qty)});
      await db.collection('stock_moves').add({ ingredient_id:m.ingredient_id, ingredient_nama:ing.nama||m.ingredient_nama||m.ingredient_id, satuan:ing.satuan||m.satuan||'',
        tipe:'masuk', qty:m.qty, catatan:'Void '+t.no, user_nama:u.nama, tx_no:'VOID-'+t.no, created_at: firebase.firestore.Timestamp.now() });
    }catch(e){ failed.push(ing.nama||m.ingredient_id); }
  }
  if(failed.length) toast('Stok belum kembali: '+failed.join(', ')+'. Sesuaikan manual di halaman Stok.','⚠️');
}

/* ===== Kirim struk via WhatsApp ===== */
function waNumber(raw){
  let no = String(raw||'').replace(/\D/g,'');
  if(no.startsWith('0')) no = '62'+no.slice(1); else if(no.startsWith('8')) no = '62'+no;
  return no.length>=10 && no.length<=15 ? no : '';
}
function sendWA(){
  if(!LAST_RECEIPT) return; const t = LAST_RECEIPT;
  const raw = prompt('Nomor WhatsApp pelanggan (cth: 08123456789):'); if(!raw) return;
  const no = waNumber(raw); if(!no){ toast('Nomor WhatsApp tidak valid','⚠️'); return; }
  const d = txDate(t);
  const L = ['*'+STORE.nama+'*', STORE.alamat||'', '', T('No. Ref')+': '+t.no,
    d.toLocaleDateString(LOC())+' '+d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'}), ''];
  (t.items||[]).forEach(i=>L.push(i.q+'× '+i.n+' — '+rp(i.p*i.q)));
  L.push('', T('Subtotal')+': '+rp(t.sub)); if(t.disc) L.push(T('Diskon')+': -'+rp(t.disc));
  if(t.tax) L.push(taxTxt(t)+': '+rp(t.tax));
  L.push('*TOTAL: '+rp(t.total)+'*', T(PM[t.method])+': '+rp(t.paid), T('Kembalian')+': '+rp(t.change), '', String(STORE.footer||'').replace(/\n/g,' · '));
  window.open('https://wa.me/'+no+'?text='+encodeURIComponent(L.join('\n')), '_blank', 'noopener');
}

/* ===== Profil toko ===== */
function taxTxt(t){
  const lbl = (t && t.tax_label) || STORE.pajak_label || 'Pajak';
  const rate = (t && t.tax_rate!=null) ? t.tax_rate : (Number(STORE.pajak)||0);
  return lbl+' '+rate+'%';
}
function applyStore(){
  document.title = 'SENJA POS' + (STORE.nama ? ' · ' + STORE.nama : '');
  $('taxLbl').textContent = (STORE.pajak_label||'Pajak') + ' (' + (Number(STORE.pajak)||0) + '%)';
  $('taxRow').style.display = (Number(STORE.pajak)||0) > 0 ? '' : 'none';
  const hotelOn = STORE.hotel !== false;
  document.querySelector('.mode-toggle').style.display = hotelOn ? '' : 'none';
  const roomBtn = document.querySelector('.obtn[data-ot="room"]'); if(roomBtn) roomBtn.style.display = hotelOn ? '' : 'none';
  if(!hotelOn){
    if(S.mode==='hotel' && typeof renderCats==='function' && CATS.length) setMode('cafe'); else S.mode='cafe';
    if(S.orderType==='room') setOrderType('dinein');
  }
  if(PRODS.length) renderCart();
}
function openSettings(){
  if(!isAdmin()) return;
  $('stNama').value = STORE.nama||''; $('stAlamat').value = STORE.alamat||''; $('stTelp').value = STORE.telp||'';
  $('stFooter').value = STORE.footer||''; $('stPajakLbl').value = STORE.pajak_label||''; $('stPajak').value = Number(STORE.pajak)||0;
  $('stHotel').checked = STORE.hotel !== false;
  setSetTab('store'); showOv('ovSettings');
}
function setSetTab(t){
  $('tabStore').classList.toggle('on',t==='store'); $('tabUsers').classList.toggle('on',t==='users'); $('tabSec').classList.toggle('on',t==='sec'); $('tabCat').classList.toggle('on',t==='cat');
  $('paneStore').style.display = t==='store' ? '' : 'none'; $('paneUsers').style.display = t==='users' ? '' : 'none'; $('paneSec').style.display = t==='sec' ? '' : 'none'; $('paneCat').style.display = t==='cat' ? '' : 'none';
  if(t==='cat') renderCatList();
  if(t==='users') loadUsers();
  if(t==='sec') openSecurityPane();
}
async function saveStore(){
  const nama = $('stNama').value.trim(); if(!nama){ toast('Nama toko wajib diisi','⚠️'); $('stNama').focus(); return; }
  const pajak = parseFloat($('stPajak').value);
  if(isNaN(pajak) || pajak<0 || pajak>100){ toast('Tarif pajak 0–100%','⚠️'); return; }
  const data = { nama, alamat:$('stAlamat').value.trim(), telp:$('stTelp').value.trim(), footer:$('stFooter').value.trim(),
    pajak, pajak_label:($('stPajakLbl').value.trim()||'Pajak'), hotel:$('stHotel').checked,
    updated_at: firebase.firestore.Timestamp.now(), updated_by: currentUser().nama };
  if(!(await reauth('Simpan profil toko'))) return;
  const btn = $('btnSaveStore'); btn.disabled = true; btn.textContent = 'Menyimpan…';
  try{
    await db.collection('settings').doc('store').set(data, {merge:true});
    await db.collection('settings').doc('public').set({ nama:data.nama, alamat:data.alamat, telp:data.telp }, {merge:true});
    audit('store', 'Profil toko diubah: '+nama+' · pajak '+data.pajak_label+' '+pajak+'%');
    STORE = Object.assign({}, STORE_DEFAULT, STORE, data);
    applyStore(); closeOv('ovSettings'); toast('Profil toko disimpan','✅');
  }catch(err){ toast('Gagal menyimpan: '+err.message,'❌'); }
  finally{ btn.disabled=false; btn.textContent='Simpan Profil Toko'; }
}

/* ===== Karyawan (khusus Admin) ===== */
/* HARUS sama persis dengan pinHash() di login.html / seed.html */
function pinHash(pin){
  var s = String(pin), h1 = 5381, h2 = 52711;
  for (var i = 0; i < s.length; i++){
    var c = s.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) | 0;
    h2 = ((h2 << 5) + h2 + c * 7) | 0;
  }
  return 'v1$' + (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}
const validPin = p => /^\d{4,8}$/.test(p);
const adminCount = exceptId => USERS.filter(x=>x.role==='admin' && x.id!==exceptId).length;
async function loadUsers(){
  try{
    const snap = await db.collection('users').get();
    USERS = snap.docs.map(d=>({id:d.id, ...d.data()})).sort((a,b)=>String(a.nama||'').localeCompare(String(b.nama||'')));
    renderUsers();
  }catch(err){ $('userList').innerHTML = '<div class="empty-rep">Gagal memuat: '+esc(err.message)+'</div>'; }
}
function renderUsers(){
  const me = currentUser().id;
  $('userList').innerHTML = USERS.length ? USERS.map(x=>`<div class="u-row">
      <div class="u-av">${esc(String(x.nama||'?').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase())}</div>
      <div class="u-main"><b><span class="no-i18n">${esc(x.nama||'-')}</span>${x.id===me?' <span style="color:var(--muted);font-weight:600">(kamu)</span>':''}</b><small class="no-i18n">@${esc(x.username||'-')}</small></div>
      ${x.auth?'':'<span class="badge b-void" title="Belum pindah ke sistem login baru — minta dia login sekali, atau isi PIN baru lewat Edit">LAMA</span>'}
      <span class="badge ${x.role==='admin'?'b-admin':'b-kasir'}">${esc((x.role||'kasir').toUpperCase())}</span>
      <button class="tx-view" onclick="openEditUser('${x.id}')">Edit</button>
    </div>`).join('') : '<div class="empty-rep">Belum ada karyawan.</div>';
}
async function addUser(){
  const nama = $('nuNama').value.trim(), username = $('nuUser').value.trim().toLowerCase(), pin = $('nuPin').value, role = $('nuRole').value;
  if(!nama){ toast('Isi nama','⚠️'); return; }
  if(!/^[a-z0-9._]{3,20}$/.test(username)){ toast('Username 3–20 huruf kecil/angka, tanpa spasi','⚠️'); return; }
  if(!validPin(pin)){ toast('PIN harus 4–8 angka','⚠️'); return; }
  if(STORE.duress_hash && pinHash(pin)===STORE.duress_hash){ toast('PIN ini sama dengan PIN darurat, pilih yang lain','⚠️'); return; }
  if(!(await reauth('Tambah karyawan'))) return;
  const btn = $('btnAddUser'); btn.disabled = true;
  try{
    const dupLogin = await db.collection('logins').doc(username).get();
    const dupOld = await db.collection('users').where('username','==',username).limit(1).get();
    if(dupLogin.exists || !dupOld.empty){ toast('Username "'+username+'" sudah dipakai','⚠️'); return; }
    const acc = await createAuthAccount(username, pin);
    await db.collection('users').doc(acc.uid).set({ nama, username, role, auth:true, created_at: firebase.firestore.Timestamp.now(), created_by: currentUser().nama });
    await db.collection('logins').doc(username).set({ email:acc.email, uid:acc.uid });
    await db.collection('pins').doc(acc.uid).set({ pinHash:pinHash(pin) });
    $('nuNama').value=''; $('nuUser').value=''; $('nuPin').value=''; $('nuRole').value='kasir';
    toast('Karyawan '+nama+' ditambahkan · login: '+username,'✅');
    audit('user_add', nama+' (@'+username+', '+role+')', 'warn');
    loadUsers();
  }catch(err){ toast('Gagal: '+authMsg(err),'❌'); }
  finally{ btn.disabled=false; }
}
function openEditUser(id){
  const x = USERS.find(y=>y.id===id); if(!x) return; EDIT_UID = id;
  const self = id===currentUser().id;
  $('euTitle').textContent = 'Edit · '+(x.nama||'');
  $('euNama').value = x.nama||''; $('euUser').value = x.username||'';
  $('euRole').value = x.role==='admin' ? 'admin' : 'kasir'; $('euRole').disabled = self;
  $('euPin').value = '';
  $('euPin').placeholder = x.auth ? 'Kosongkan kalau tidak diganti' : 'Akun lama — isi PIN baru untuk memindahkan ke sistem baru';
  $('btnDelUser').style.display = self ? 'none' : '';
  showOv('ovUser');
}
async function saveUser(){
  const x = USERS.find(y=>y.id===EDIT_UID); if(!x) return;
  const self = x.id===currentUser().id;
  const nama = $('euNama').value.trim(), role = self ? x.role : $('euRole').value, pin = $('euPin').value;
  if(!nama){ toast('Isi nama','⚠️'); return; }
  if(x.role==='admin' && role!=='admin' && adminCount(x.id)===0){ toast('Harus ada minimal 1 Admin','⚠️'); return; }
  if(pin && !validPin(pin)){ toast('PIN harus 4–8 angka','⚠️'); return; }
  if(pin && STORE.duress_hash && pinHash(pin)===STORE.duress_hash){ toast('PIN ini sama dengan PIN darurat, pilih yang lain','⚠️'); return; }
  if(!(await reauth('Ubah data '+nama))) return;
  const btn = $('btnSaveUser'); btn.disabled = true;
  try{
    const base = { nama, role, updated_at: firebase.firestore.Timestamp.now() };
    if(pin && self && authUser()){
      /* ganti PIN sendiri: langsung ubah password akun (baru saja diverifikasi lewat PIN) */
      await authUser().updatePassword(pinPw(pin));
      await db.collection('users').doc(x.id).update(base);
      await db.collection('pins').doc(x.id).set({ pinHash:pinHash(pin) });
      MY_HASH = pinHash(pin);
    } else if(pin){
      /* reset PIN orang lain / pindahkan akun lama: buat akun Auth baru, pindahkan datanya.
         Akun lama otomatis tidak punya akses lagi (aturan Firestore mensyaratkan dokumen users/{uid}). */
      const acc = await createAuthAccount(x.username, pin);
      const data = Object.assign({}, x, base, { auth:true, prev_uid:x.id }); delete data.id; delete data.pinHash;
      await db.collection('users').doc(acc.uid).set(data);
      await db.collection('logins').doc(x.username).set({ email:acc.email, uid:acc.uid });
      await db.collection('pins').doc(acc.uid).set({ pinHash:pinHash(pin) });
      await db.collection('users').doc(x.id).delete();
      try{ await db.collection('pins').doc(x.id).delete(); }catch(e){}
      /* shift yang masih terbuka ikut dipindah ke akun baru supaya tetap bisa ditutup */
      const open = await db.collection('shifts').where('user_id','==',x.id).where('selesai','==',null).get();
      for(const sh of open.docs) await sh.ref.update({ user_id:acc.uid });
    } else {
      await db.collection('users').doc(x.id).update(base);
    }
    if(self && typeof setCurrentUser==='function'){
      const cu = currentUser(); setCurrentUser({id:cu.id, nama, username:cu.username||x.username, role:cu.role});
      $('userName').textContent = nama.split(' ')[0];
    }
    audit('user_edit', nama+' (@'+x.username+')'+(role!==x.role?' · peran '+x.role+' → '+role:'')+(pin?(x.auth?' · PIN direset':' · dipindah ke sistem baru'):''), 'warn');
    closeOv('ovUser'); toast(pin ? 'Data & PIN '+nama+' diperbarui' : 'Data '+nama+' diperbarui','✅'); loadUsers();
  }catch(err){ toast('Gagal: '+authMsg(err),'❌'); }
  finally{ btn.disabled=false; }
}
async function deleteUser(){
  const x = USERS.find(y=>y.id===EDIT_UID); if(!x) return;
  if(x.id===currentUser().id){ toast('Tidak bisa menghapus akun sendiri','⚠️'); return; }
  if(x.role==='admin' && adminCount(x.id)===0){ toast('Harus ada minimal 1 Admin','⚠️'); return; }
  if(!confirm('Hapus '+x.nama+' (@'+x.username+')? Dia tidak bisa login lagi. Riwayat transaksinya tetap tersimpan.')) return;
  if(!(await reauth('Hapus '+x.nama))) return;
  try{
    await db.collection('users').doc(x.id).delete();
    try{ const lg = await db.collection('logins').doc(x.username).get(); if(lg.exists && lg.data().uid===x.id) await db.collection('logins').doc(x.username).delete(); }catch(e){}
    try{ await db.collection('pins').doc(x.id).delete(); }catch(e){}
    audit('user_del', x.nama+' (@'+x.username+', '+x.role+')', 'warn');
    closeOv('ovUser'); toast(x.nama+' dihapus','🗑️'); loadUsers();
  }catch(err){ toast('Gagal: '+err.message,'❌'); }
}

/* ===== Firebase Authentication ===== */
const AUTH_DOMAIN = 'senjapos.example.com';        /* domain fiktif (RFC 2606) — tidak pernah dikirimi email */
function pinPw(pin){ return 'senja:'+pin; }        /* HARUS sama dengan login.html */
function authUser(){ try{ return (window.firebase && firebase.auth) ? firebase.auth().currentUser : null; }catch(e){ return null; } }
async function fullLogout(){
  try{ if(window.firebase && firebase.auth) await firebase.auth().signOut(); }catch(e){}
  try{ logoutUser(); }catch(e){}
  location.href = 'login.html';
}
function secondaryAuth(){
  let app; try{ app = firebase.app('senja-admin'); }catch(e){ app = firebase.initializeApp(firebase.app().options, 'senja-admin'); }
  return app.auth();
}
async function createAuthAccount(username, pin){
  const a = secondaryAuth();
  try{ await a.setPersistence(firebase.auth.Auth.Persistence.NONE); }catch(e){}
  const email = username+'.'+Date.now().toString(36)+'@'+AUTH_DOMAIN;
  const cred = await a.createUserWithEmailAndPassword(email, pinPw(pin));
  const uid = cred.user.uid;
  try{ await a.signOut(); }catch(e){}
  return { uid, email };
}
async function verifyPin(pin){
  const au = authUser();
  if(au && au.email){
    try{
      await au.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(au.email, pinPw(pin)));
      return 'ok';
    }catch(e){
      const c = e && e.code || '';
      if(/wrong-password|invalid-credential|invalid-login-credentials/.test(c)) return 'bad';
      if(/too-many-requests/.test(c)) return 'server-throttled';
      if(/user-not-found|user-disabled|user-token-expired/.test(c)) return 'gone';
      /* offline / error jaringan → cadangan hash lokal di bawah */
    }
  }
  return (MY_HASH && pinHash(pin)===MY_HASH) ? 'ok' : 'bad';
}
function authMsg(err){
  const c = err && err.code || '';
  if(/operation-not-allowed/.test(c)) return 'Firebase Authentication (Email/Password) belum diaktifkan di Firebase Console.';
  if(/network/.test(c)) return 'Tidak ada koneksi internet.';
  if(/too-many-requests/.test(c)) return 'Terlalu banyak percobaan, tunggu beberapa menit.';
  if(/permission-denied|insufficient/.test(c+String(err&&err.message))) return 'Ditolak aturan keamanan Firestore.';
  return (err && err.message) || String(err);
}

/* =====================================================================
   KEAMANAN — terinspirasi GrapheneOS
   • PIN acak (PIN scrambling) · kunci otomatis · pembatasan percobaan PIN
   • konfirmasi PIN untuk aksi sensitif · PIN darurat (alarm diam) · log audit
   ===================================================================== */
let THR_SHOWN = false, MY_HASH = null, PIN_BUF = '', PIN_MODE = null, PIN_RESOLVE = null, THR_TIMER = null, LAST_ACT = Date.now(), HIDDEN_AT = 0, DURESS_EV = [];
const LS = {
  get(k,d){ try{ const v = localStorage.getItem(k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
function rndInt(n){
  try{ const a = new Uint32Array(1); window.crypto.getRandomValues(a); return a[0] % n; }catch(e){ return Math.floor(Math.random()*n); }
}
function audit(type, detail, level){
  try{
    const u = currentUser() || {};
    return db.collection('auditLog').add({ type, detail:String(detail||''), level:level||'info', user_id:u.id||null, user:u.nama||'?',
      at: firebase.firestore.Timestamp.now(), device:String(navigator.userAgent||'').slice(0,140), ack: type==='duress' ? false : true }).catch(()=>{});
  }catch(e){ return Promise.resolve(); }
}
function buildPad(){
  const d = ['1','2','3','4','5','6','7','8','9','0'];
  if(STORE.pin_scramble !== false){ for(let i=d.length-1;i>0;i--){ const j = rndInt(i+1); [d[i],d[j]] = [d[j],d[i]]; } }
  const keys = [...d.slice(0,9), '⌫', d[9], '✓'];
  $('pinPad').innerHTML = keys.map(k=>`<button class="${/^\d$/.test(k)?'':'fn'}" onclick="pinKey('${k}')">${k}</button>`).join('');
}
function renderDots(){
  const n = Math.min(8, Math.max(4, PIN_BUF.length));
  $('pinDots').innerHTML = Array.from({length:n},(_,i)=>`<i class="${i<PIN_BUF.length?'f':''}"></i>`).join('');
}
function setLockMsg(m, err){ const el = $('lockMsg'); el.textContent = m; el.className = err ? 'err' : ''; }
function openPinPrompt(mode, title, msg){
  PIN_MODE = mode; PIN_BUF = '';
  $('lockTitle').textContent = title; setLockMsg(msg);
  $('lockCancel').style.display = mode==='lock' ? 'none' : '';
  $('lockLogout').style.display = mode==='lock' ? '' : 'none';
  buildPad(); renderDots(); $('lockScreen').classList.add('show'); tickThrottle();
}
function lockNow(){
  if(!$('app').classList.contains('show')) return;
  if(PIN_RESOLVE){ const r = PIN_RESOLVE; PIN_RESOLVE = null; r(false); }
  closeOv('ovPay'); LS.set('senja_locked', 1);
  openPinPrompt('lock', (currentUser().nama||'Terkunci'), 'Masukkan PIN untuk membuka');
}
function reauth(action){
  if(!MY_HASH && !authUser()) return Promise.resolve(true); /* mode lama tanpa Auth & hash belum termuat */
  return new Promise(res=>{ PIN_RESOLVE = res; openPinPrompt('reauth', '🛡️ Konfirmasi PIN', action); });
}
function cancelPin(){
  if(PIN_MODE==='lock') return;
  $('lockScreen').classList.remove('show');
  const r = PIN_RESOLVE; PIN_RESOLVE = null; PIN_MODE = null; if(r) r(false);
}
function lockLogout(){ LS.del('senja_locked'); fullLogout(); }
function thr(){ return LS.get('senja_pin_thr', {n:0, until:0}); }
function throttleLeft(){ return Math.max(0, (thr().until||0) - Date.now()); }
function tickThrottle(){
  clearInterval(THR_TIMER);
  const upd = ()=>{
    const left = throttleLeft();
    document.querySelectorAll('#pinPad button').forEach(b=>b.disabled = left>0);
    if(left>0){ THR_SHOWN = true; setLockMsg('Terlalu banyak PIN salah. Coba lagi dalam '+Math.ceil(left/1000)+' detik', true); }
    else { clearInterval(THR_TIMER); if(THR_SHOWN){ THR_SHOWN = false; setLockMsg('Masukkan PIN'); } }
  };
  upd(); if(throttleLeft()>0) THR_TIMER = setInterval(upd, 1000);
}
function pinKey(k){
  if(throttleLeft()>0) return;
  if(k==='⌫') PIN_BUF = PIN_BUF.slice(0,-1);
  else if(k==='✓'){ submitPin(); return; }
  else if(PIN_BUF.length<8) PIN_BUF += k;
  renderDots();
}
async function submitPin(){
  if(!PIN_BUF) return;
  const pin = PIN_BUF; PIN_BUF = ''; renderDots();
  const h = pinHash(pin);
  let ok = false, duress = false;
  if(STORE.duress_hash && h===STORE.duress_hash){ ok = true; duress = true; }   /* PIN darurat tak pernah sama dgn PIN asli */
  else {
    const v = await verifyPin(pin);
    if(v==='gone'){ lockLogout(); return; }
    if(v==='server-throttled'){ setLockMsg('Server membatasi percobaan. Tunggu beberapa menit lalu coba lagi.', true); buildPad(); return; }
    ok = v==='ok';
  }
  if(ok){
    LS.set('senja_pin_thr', {n:0, until:0});
    if(duress) audit('duress', 'Sinyal darurat dari '+(PIN_MODE==='lock'?'layar kunci':'konfirmasi PIN'), 'high');
    const r = PIN_RESOLVE, mode = PIN_MODE; PIN_RESOLVE = null; PIN_MODE = null;
    $('lockScreen').classList.remove('show');
    if(mode==='lock'){ LS.del('senja_locked'); LAST_ACT = Date.now(); }
    if(r) r(true);
    return;
  }
  const t = thr(); t.n = (t.n||0) + 1;
  if(t.n>=10){
    await audit('lockout', '10x PIN salah berturut-turut — sesi dikeluarkan paksa', 'high');
    LS.set('senja_pin_thr', {n:0, until:0}); lockLogout(); return;
  }
  if(t.n>=5){
    t.until = Date.now() + Math.min(15*60000, 30000*Math.pow(2, t.n-5));   /* 30dtk, 1mnt, 2mnt, 4mnt, 8mnt */
    if(t.n===5) audit('pin_fail', '5x PIN salah berturut-turut', 'warn');
  }
  LS.set('senja_pin_thr', t);
  buildPad();   /* acak ulang tiap percobaan, seperti GrapheneOS */
  setLockMsg('PIN salah'+(t.n>=3 ? ' · '+(10-t.n)+' percobaan lagi sebelum keluar paksa' : ''), true);
  tickThrottle();
  const b = $('lockBox'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
}
function attachSecurity(){
  ['pointerdown','keydown','touchstart','wheel'].forEach(ev=>document.addEventListener(ev, ()=>{ LAST_ACT = Date.now(); }, {passive:true}));
  setInterval(()=>{
    const m = Number(STORE.lock_min)||0;
    if(m>0 && $('app').classList.contains('show') && !$('lockScreen').classList.contains('show') && Date.now()-LAST_ACT > m*60000) lockNow();
  }, 10000);
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){ HIDDEN_AT = Date.now(); return; }
    const m = Number(STORE.lock_min)||0;
    if(m>0 && HIDDEN_AT && Date.now()-HIDDEN_AT > m*60000 && !$('lockScreen').classList.contains('show')) lockNow();
  });
  if(isAdmin()){
    db.collection('auditLog').where('type','==','duress').where('ack','==',false).onSnapshot(snap=>{
      const me = currentUser().id;
      DURESS_EV = snap.docs.map(d=>({id:d.id, ...d.data()})).filter(e=>e.user_id!==me);
      const bar = $('duressBar');
      if(!DURESS_EV.length){ bar.classList.remove('show'); return; }
      $('duressText').textContent = '🚨 SINYAL DARURAT: ' + DURESS_EV.map(e=>{
        const d = e.at && e.at.toDate ? e.at.toDate() : new Date();
        return (e.user||'?')+' pukul '+d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'});
      }).join(' · ');
      bar.classList.add('show'); tone(880,.25); tone(660,.25,.3); tone(880,.25,.6);
    });
  }
}
async function ackDuress(){
  const ids = DURESS_EV.map(e=>e.id);
  for(const id of ids) await db.collection('auditLog').doc(id).update({ack:true, ack_by:currentUser().nama, ack_at: firebase.firestore.Timestamp.now()});
  audit('duress_ack', ids.length+' sinyal darurat ditandai sudah ditangani', 'warn');
}
function openSecurityPane(){
  $('secLock').value = String(Number(STORE.lock_min)||0);
  if(!$('secLock').value) $('secLock').value = '5';
  $('secScramble').checked = STORE.pin_scramble !== false;
  $('secDuress').value = ''; $('secDuressOff').checked = false;
  $('secDuressState').textContent = STORE.duress_hash ? '✅ PIN darurat aktif.' : '⚪ PIN darurat belum diatur.';
  loadAudit();
}
async function saveSecurity(){
  const dpin = $('secDuress').value, off = $('secDuressOff').checked;
  const data = { lock_min: Number($('secLock').value)||0, pin_scramble: $('secScramble').checked };
  if(off) data.duress_hash = null;
  else if(dpin){
    if(!validPin(dpin)){ toast('PIN darurat harus 4–8 angka','⚠️'); return; }
    const h = pinHash(dpin);
    try{
      const us = await db.collection('users').get();
      let ps = {docs:[]}; try{ ps = await db.collection('pins').get(); }catch(e){}
      if([...us.docs, ...ps.docs].some(d=>d.data().pinHash===h)){ toast('PIN darurat tidak boleh sama dengan PIN karyawan mana pun','⚠️'); return; }
    }catch(e){ toast('Tidak bisa mengecek PIN karyawan (offline?)','⚠️'); return; }
    data.duress_hash = h;
  }
  if(!(await reauth('Simpan pengaturan keamanan'))) return;
  const btn = $('btnSaveSec'); btn.disabled = true;
  try{
    await db.collection('settings').doc('store').set(data, {merge:true});
    STORE = Object.assign({}, STORE, data);
    audit('security', 'Kunci otomatis '+(data.lock_min?data.lock_min+' mnt':'mati')+' · PIN acak '+(data.pin_scramble?'ya':'tidak')+
      (off?' · PIN darurat dihapus':dpin?' · PIN darurat diubah':''), 'warn');
    toast('Pengaturan keamanan disimpan','🛡️'); openSecurityPane();
  }catch(err){ toast('Gagal: '+err.message,'❌'); }
  finally{ btn.disabled = false; }
}
async function loadAudit(){
  try{
    const snap = await db.collection('auditLog').orderBy('at','desc').limit(50).get();
    const rows = snap.docs.map(d=>d.data());
    $('auditList').innerHTML = rows.length ? rows.map(a=>{
      const d = a.at && a.at.toDate ? a.at.toDate() : new Date();
      return `<div class="au-row ${a.level==='high'?'high':a.level==='warn'?'warn':''}"><span class="t">${d.toLocaleDateString(LOC(),{day:'2-digit',month:'short'})} ${d.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'})}</span>
        <div class="d no-i18n"><b>${esc(a.user||'?')}</b> · ${esc(a.detail||a.type)}</div></div>`;
    }).join('') : '<div class="empty-rep">Belum ada aktivitas tercatat.</div>';
  }catch(err){ $('auditList').innerHTML = '<div class="empty-rep">Gagal memuat log: '+esc(err.message)+'</div>'; }
}

/* ===== Ganti bahasa ===== */
window.addEventListener('senja-lang', ()=>{
  try{
    tick(); paintDate();
    if(PRODS.length){ renderCats(); renderProducts(); renderCart(); }
    if(SHIFT) renderShiftChip();
    if($('ovRooms').classList.contains('show')) renderRoomTab();
    if($('ovHistory').classList.contains('show')) openHistory();
    if($('ovReport').classList.contains('show')) openReport();
    if($('ovOrders').classList.contains('show')) openOrdersModal();
    if($('ovReceipt').classList.contains('show') && LAST_RECEIPT) showReceipt(LAST_RECEIPT);
  }catch(e){}
});

/* ===== Modal util & listener ===== */
function showOv(id){ $(id).classList.add('show'); }
function closeOv(id){ $(id).classList.remove('show'); }
document.querySelectorAll('.overlay').forEach(ov=>ov.addEventListener('click',e=>{
  if(e.target===ov && ov.id!=='ovShift') ov.classList.remove('show');
}));
document.addEventListener('keydown',e=>{
  if($('lockScreen').classList.contains('show')){
    e.preventDefault(); e.stopPropagation();
    if(/^[0-9]$/.test(e.key)) pinKey(e.key);
    else if(e.key==='Backspace') pinKey('⌫');
    else if(e.key==='Enter') pinKey('✓');
    else if(e.key==='Escape') cancelPin();
    return;
  }
  if(e.key==='Escape') closeCart();
  if(e.key==='Escape') document.querySelectorAll('.overlay.show').forEach(o=>{ if(o.id!=='ovShift') o.classList.remove('show'); });
  if(e.key==='/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.querySelector('.overlay.show')){ e.preventDefault(); $('searchInput').focus(); }
});
$('searchInput').addEventListener('input',e=>{ S.q=e.target.value; renderProducts(); });
$('discVal').addEventListener('input',renderCart);
$('paidInput').addEventListener('input',updatePayUI);
['tableNo','guestTA','roomNo','guestName'].forEach(id=>$(id).addEventListener('input',updateTicketHead));
