/* =========================================================
   SENJA POS — deai.js
   Mengganti SEMUA emoji menjadi satu set ikon garis (SVG sprite)
   secara otomatis, termasuk konten yang dirender JS setelah login.
   ========================================================= */
(function(){
  const SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
  +'<symbol id="i-cup" viewBox="0 0 24 24"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/></symbol>'
  +'<symbol id="i-glass" viewBox="0 0 24 24"><path d="M8 2h8l-1.2 18a2 2 0 0 1-2 1.9h-1.6a2 2 0 0 1-2-1.9Z"/><path d="M7.5 9h9"/></symbol>'
  +'<symbol id="i-bowl" viewBox="0 0 24 24"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M7 8c0-1 .8-1.4.8-2.4"/><path d="M12 8c0-1 .8-1.4.8-2.4"/><path d="M17 8c0-1 .8-1.4.8-2.4"/></symbol>'
  +'<symbol id="i-cookie" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 8.5h.01"/><path d="M15.5 8.5h.01"/><path d="M12 12h.01"/><path d="M8.5 15.5h.01"/><path d="M15.5 15.5h.01"/></symbol>'
  +'<symbol id="i-cake" viewBox="0 0 24 24"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/></symbol>'
  +'<symbol id="i-plate" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></symbol>'
  +'<symbol id="i-fridge" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14"/><path d="M9 6v2"/></symbol>'
  +'<symbol id="i-shirt" viewBox="0 0 24 24"><path d="M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.2a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.4-2.2Z"/></symbol>'
  +'<symbol id="i-bell" viewBox="0 0 24 24"><path d="M3 18h18"/><path d="M5 18a7 7 0 0 1 14 0"/><path d="M12 11V9"/><path d="M10 9h4"/></symbol>'
  +'<symbol id="i-leaf" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/></symbol>'
  +'<symbol id="i-hotel" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M12 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></symbol>'
  +'<symbol id="i-box" viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/></symbol>'
  +'<symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M8 17v-4"/><path d="M13 17V7"/><path d="M18 17V8"/></symbol>'
  +'<symbol id="i-power" viewBox="0 0 24 24"><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/><path d="M12 2v10"/></symbol>'
  +'<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></symbol>'
  +'<symbol id="i-utensils" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></symbol>'
  +'<symbol id="i-bag" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></symbol>'
  +'<symbol id="i-bed" viewBox="0 0 24 24"><path d="M2 18v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6"/><path d="M2 18h20"/><path d="M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/></symbol>'
  +'<symbol id="i-cash" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></symbol>'
  +'<symbol id="i-qr" viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/></symbol>'
  +'<symbol id="i-card" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></symbol>'
  +'<symbol id="i-wallet" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></symbol>'
  +'<symbol id="i-alert" viewBox="0 0 24 24"><path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></symbol>'
  +'<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>'
  +'<symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 9h18"/></symbol>'
  +'<symbol id="i-receipt" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></symbol>'
  +'<symbol id="i-print" viewBox="0 0 24 24"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></symbol>'
  +'<symbol id="i-star" viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></symbol>'
  +'<symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></symbol>'
  +'<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>'
  +'<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></symbol>'
  +'<symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></symbol>'
  +'<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>'
  +'<symbol id="i-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol>'
  +'<symbol id="i-scale" viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M5 7h14"/><path d="M8 21h8"/><path d="M5 7 2 13a3 3 0 0 0 6 0Z"/><path d="M19 7l-3 6a3 3 0 0 0 6 0Z"/></symbol>'
  +'<symbol id="i-book" viewBox="0 0 24 24"><path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4Z"/><path d="M20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7Z"/></symbol>'
  +'<symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></symbol>'
  +'<symbol id="i-flask" viewBox="0 0 24 24"><path d="M10 2v6L4.7 18a2 2 0 0 0 1.8 3h11a2 2 0 0 0 1.8-3L14 8V2"/><path d="M8.5 2h7"/><path d="M7 15h10"/></symbol>'
  +'</svg>';

  document.body.insertAdjacentHTML('afterbegin', SPRITE);

  /* emoji -> ikon (satu set konsisten) */
  const MAP = {
    '🍽️':'i-utensils','⚠️':'i-alert','⏱️':'i-clock','🛏️':'i-bed','🖨️':'i-print','🛎️':'i-bell','🗃️':'i-box',
    '☕':'i-cup','🥛':'i-cup','🌅':'i-cup','⏳':'i-cup','🫖':'i-cup',
    '🍹':'i-glass','🍵':'i-glass','🍋':'i-glass','🥑':'i-glass','💧':'i-glass','🥤':'i-glass',
    '🍛':'i-bowl','🍜':'i-bowl','🍗':'i-bowl','🥣':'i-bowl','🐟':'i-bowl','🍝':'i-bowl',
    '🍟':'i-cookie','🍞':'i-cookie','🍌':'i-cookie','🥟':'i-cookie','🧂':'i-cookie','🥐':'i-cookie',
    '🍨':'i-cake','🍫':'i-cake','🍰':'i-cake','🧁':'i-cake','🥥':'i-cake',
    '🍳':'i-plate','🥞':'i-plate','🥪':'i-plate','🥗':'i-plate','🍲':'i-plate',
    '🍺':'i-fridge','🥔':'i-fridge',
    '🧺':'i-shirt','👔':'i-shirt','🫧':'i-shirt','🤵':'i-shirt','⚡':'i-power',
    '🔑':'i-bell','🚐':'i-bell','🛵':'i-bell','🕐':'i-clock',
    '💆':'i-leaf','🌺':'i-leaf','🧖':'i-leaf','💞':'i-leaf',
    '🏨':'i-hotel','📦':'i-box','📊':'i-chart','⏻':'i-power','🔍':'i-search','🥡':'i-bag',
    '💵':'i-cash','💰':'i-cash','📱':'i-qr','💳':'i-card','👛':'i-wallet','📅':'i-cal',
    '🧾':'i-receipt','⭐':'i-star','✨':'i-grid','✅':'i-check','🎉':'i-star',
    '🧪':'i-flask','➕':'i-plus','🕘':'i-clock','🔓':'i-lock',
    '⚖️':'i-scale','📈':'i-chart','📘':'i-book','📖':'i-book','✍️':'i-plus','💾':'i-check','❌':'i-x'
  };
  const keys = Object.keys(MAP).sort((a,b)=>b.length-a.length);
  const rx = new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  const NS = 'http://www.w3.org/2000/svg';

  const icon = id => {
    const s = document.createElementNS(NS,'svg');
    s.setAttribute('class','ic'); s.setAttribute('aria-hidden','true');
    const u = document.createElementNS(NS,'use');
    u.setAttribute('href','#'+id); s.appendChild(u); return s;
  };
  const skip = el => !el || !!el.closest('script,style,.receipt,#receiptPaper,input,textarea,select');

  function scan(root){
    if(!root || root.nodeType !== 1) return;
    const hits = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(n){
      const v = n.nodeValue || ''; rx.lastIndex = 0;
      if(!rx.test(v)) return NodeFilter.FILTER_SKIP;
      rx.lastIndex = 0;
      return skip(n.parentElement) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
    }});
    while(w.nextNode()) hits.push(w.currentNode);
    for(const n of hits){
      const text = n.nodeValue; rx.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while((m = rx.exec(text))){
        if(m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        frag.appendChild(icon(MAP[m[0]]));
        last = m.index + m[0].length;
      }
      if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      n.parentNode.replaceChild(frag, n);
    }
  }

  scan(document.body);

  /* konten yang dirender JS setelah login (grid menu, keranjang, laporan) ikut diproses */
  const pending = new Set(); let queued = false;
  new MutationObserver(muts=>{
    for(const m of muts) for(const n of m.addedNodes){
      if(n.nodeType === 1) pending.add(n);
      else if(n.nodeType === 3 && n.parentNode && n.parentNode.nodeType === 1) pending.add(n.parentNode);
    }
    if(pending.size && !queued){
      queued = true;
      requestAnimationFrame(()=>{ queued = false;
        const list = [...pending]; pending.clear();
        for(const el of list) if(el.isConnected) scan(el);
      });
    }
  }).observe(document.body, {childList:true, subtree:true});
})();
