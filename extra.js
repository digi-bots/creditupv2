/* Creditfy — Extra Services, the second tile section under Quick Services: currency & MFS exchange, gift cards,
   SMM, virtual cards, promo codes, gift vouchers and Play & Earn. Paid orders: the user sends the money with a TrxID
   and the team delivers by hand (Admin → Services & Rewards → Orders). List: Admin → Services & Rewards → Extra services. */
(function(){
if(!window._svShow){ console.warn('extra.js needs services.js'); return; }
const show = window._svShow, api = window._svApi, toast = window._svToast, E = window._svE, tk = window._svTk;
const $x = id => document.getElementById(id);
const user = () => { try { return JSON.parse(localStorage.getItem('creditUpUser')); } catch (e) { return null; } };
const T = window._svcTiles, P = window._svcPages;
const X = { cfg: null, sel: null, game: null };
const num = n => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const css = `
.xs-title{display:flex;align-items:center;gap:8px}
.xs-title em{font-style:normal;font-size:9.5px;font-weight:900;letter-spacing:.5px;padding:3px 8px;border-radius:8px;color:#3a2500;background:linear-gradient(135deg,#ffe08a,#f2a91d)}
.xs-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin:10px 0 25px}
.xs-t{position:relative;display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer;border-radius:18px;padding:12px 4px 10px;text-align:center;
  background:linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.02));box-shadow:0 12px 26px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.08);transition:transform .18s}
.xs-t::before{content:"";position:absolute;inset:0;border-radius:18px;padding:1px;background:linear-gradient(150deg,rgba(255,215,106,.45),rgba(255,255,255,.04) 45%,rgba(77,143,255,.35));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
@media (hover:hover){.xs-t:hover{transform:translateY(-3px)}}
.xs-lg{position:relative;width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:23px;overflow:hidden;box-shadow:0 8px 18px rgba(0,0,0,.35),inset 0 -3px 6px rgba(0,0,0,.18)}
.xs-lg::after{content:"";position:absolute;left:-20%;right:-20%;top:-55%;height:75%;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0));pointer-events:none}
.xs-lg img{width:100%;height:100%;object-fit:cover}
.xs-lg.img{background:#fff}
.xs-t b{font-size:10.6px;font-weight:800;color:var(--txt);line-height:1.25;max-width:100%;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.xs-t .bd{position:absolute;top:-6px;right:-2px;font-size:8.5px;font-weight:900;padding:2px 6px;border-radius:8px;color:#3a2500;background:linear-gradient(135deg,#ffe08a,#f2a91d)}
.xs-t.soon{opacity:.55}
.xs-hero{display:flex;gap:14px;align-items:center;border-radius:20px;padding:16px;margin-bottom:12px;background:radial-gradient(120% 120% at 0% 0%,rgba(255,215,106,.16),transparent 60%),linear-gradient(160deg,var(--surf),var(--bg2));border:1px solid var(--bord)}
.xs-hero .xs-lg{width:62px;height:62px;font-size:28px;flex:none}
.xs-hero h4{margin:0 0 4px;font-size:16px;color:var(--txt)}.xs-hero p{margin:0;font-size:12.5px;color:var(--txt2);line-height:1.55}
.xs-it{display:flex;align-items:center;gap:12px;border-radius:16px;padding:13px 14px;margin-bottom:8px;cursor:pointer;background:rgba(255,255,255,.035);border:1px solid var(--bord)}
.xs-it:hover{border-color:rgba(29,219,128,.45)}
.xs-it b{display:block;font-size:13.5px;color:var(--txt)}.xs-it small{display:block;font-size:11.5px;color:var(--txt2);margin-top:2px}
.xs-it .pr{margin-left:auto;flex:none;font-weight:900;font-size:14px;color:#ffd76a;text-align:right}
.xs-it .pr small{font-weight:700;color:var(--txt2)}
.xs-sum{display:flex;justify-content:space-between;align-items:center;border-radius:14px;padding:12px 14px;margin:10px 0;background:rgba(29,219,128,.08);border:1px solid rgba(29,219,128,.3);font-size:13px;color:var(--txt2)}
.xs-sum b{font-size:19px;color:var(--txt)}
.xs-od{border-radius:16px;padding:13px 14px;margin-bottom:9px;background:rgba(255,255,255,.035);border:1px solid var(--bord);font-size:12.5px;color:var(--txt2)}
.xs-od .h{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.xs-od .h b{font-size:13.5px;color:var(--txt)}
.xs-st{flex:none;font-size:10px;font-weight:900;padding:3px 8px;border-radius:8px}
.xs-st.Pending{background:rgba(255,140,66,.15);color:#ffae6b}.xs-st.Processing{background:rgba(77,143,255,.15);color:#8db7ff}.xs-st.Delivered{background:rgba(29,219,128,.15);color:var(--p)}.xs-st.Rejected{background:rgba(255,77,106,.15);color:#ff8fa3}
.xs-dl{margin-top:9px;padding:10px 12px;border-radius:12px;background:rgba(29,219,128,.08);border:1px dashed rgba(29,219,128,.45);color:var(--txt);font-family:monospace;font-size:13px;white-space:pre-wrap;word-break:break-word}
.xs-dl button{display:block;margin-top:8px;border:0;border-radius:9px;padding:6px 11px;background:rgba(29,219,128,.18);color:var(--p);font-weight:800;font-size:11.5px;cursor:pointer;font-family:inherit}
.tt-top{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.tt-top div{border-radius:14px;padding:10px;text-align:center;background:rgba(255,255,255,.04);border:1px solid var(--bord);font-size:11px;color:var(--txt2)}.tt-top b{display:block;font-size:18px;color:var(--txt)}
.tt-b{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:300px;margin:0 auto 14px}
.tt-c{aspect-ratio:1;border-radius:18px;border:1px solid var(--gbord);background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;cursor:pointer;font-family:inherit;color:var(--txt)}
.tt-c.X{color:#1ddb80;text-shadow:0 0 18px rgba(29,219,128,.5)}.tt-c.O{color:#ff6fa5;text-shadow:0 0 18px rgba(255,111,165,.45)}
.tt-c:disabled{cursor:default}
.tt-msg{text-align:center;font-size:15px;font-weight:900;margin-bottom:12px;color:var(--txt)}
.xs-soon{display:flex;gap:10px;align-items:center;border-radius:14px;padding:12px;margin-top:8px;background:rgba(255,255,255,.03);border:1px dashed var(--gbord);font-size:12.5px;color:var(--txt2)}
@media (max-width:360px){.xs-grid{gap:8px}.xs-lg{width:46px;height:46px;font-size:20px}}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

function logo(s){ return s.logo ? `<div class="xs-lg img"><img src="${E(s.logo)}" alt="${E(s.name)}" loading="lazy"></div>` : `<div class="xs-lg ${E(s.color)}"><i class="${E(s.icon)}"></i></div>`; }
const svcs = () => ((X.cfg && X.cfg.services) || []).filter(s => s.on);

async function load(){
  if(X.p) return X.p;
  X.p = fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'extraConfig' }) })
    .then(r => r.json()).then(c => { X.cfg = c; register(); render(); return c; }).catch(() => { X.p = null; });
  return X.p;
}
// every service gets its own page, opened through the normal Quick Services sheet
function register(){
  svcs().forEach(s => { const k = 'x_' + s.id; T[k] = { l: s.name, ic: 'star', g: s.color, cat: '', login: true, page: k }; P[k] = () => svcPage(s.id); });
  T.x_order = { l: 'Order', cat: '', login: true, page: 'x_order' }; P.x_order = orderPage;
  T.x_orders = { l: 'My orders', cat: '', login: true, page: 'x_orders' }; P.x_orders = ordersPage;
}
function render(){
  const g = document.querySelector('.home-body .qa-grid') || document.querySelector('.qa-grid'); if(!g) return;
  let box = $x('xsBlock');
  const L = svcs();
  if(!X.cfg || !X.cfg.on || !L.length){ if(box) box.remove(); return; }
  if(!box){ box = document.createElement('div'); box.id = 'xsBlock'; g.insertAdjacentElement('afterend', box); }
  box.innerHTML = `<div class="quick-actions-title xs-title">${E(X.cfg.title || 'Extra Services')} <em>PREMIUM</em><span class="qa-see" style="margin-left:auto" onclick="svGo('x_orders')">My orders ›</span></div>
    <div class="xs-grid">${L.map(s => `<div class="xs-t${s.soon ? ' soon' : ''}" onclick="xsOpen('${E(s.id)}')">${s.badge || s.soon ? `<span class="bd">${E(s.soon ? 'SOON' : s.badge)}</span>` : ''}${logo(s)}<b>${E(s.short || s.name)}</b></div>`).join('')}</div>`;
}
window.xsOpen = id => { const s = svcs().find(x => x.id === id); if(!s) return; if(s.soon){ toast('Coming soon — stay tuned!'); return; } svGo('x_' + id); };

/* ───────── one service: its options ───────── */
function svcPage(id){
  const s = svcs().find(x => x.id === id); if(!s) return;
  if(s.mode === 'game') return gamePage(s);
  const items = s.items.filter(i => i.on);
  const row = i => {
    if(s.mode === 'amount'){
      const rate = i.unit === '৳' ? (i.pct ? `Fee ${num(i.pct)}%${i.fee ? ' + ' + tk(i.fee) : ''}` : i.fee ? 'Fee ' + tk(i.fee) : 'No fee')
        : `1 ${E(i.unit)} = ${tk(i.rate)}${i.pct ? ` · fee ${num(i.pct)}%` : ''}`;
      return `<div class="xs-it" onclick="xsPick('${E(s.id)}','${E(i.id)}')"><div><b>${E(i.name)}</b><small>${rate}${i.min || i.max ? ` · ${num(i.min)}–${num(i.max)} ${E(i.unit)}` : ''}</small></div><div class="pr"><i class="fa-solid fa-chevron-right" style="color:var(--txt2)"></i></div></div>`;
    }
    return `<div class="xs-it" onclick="xsPick('${E(s.id)}','${E(i.id)}')"><div><b>${E(i.name)}</b>${i.note ? `<small>${E(i.note)}</small>` : ''}</div><div class="pr">${tk(i.price)}</div></div>`;
  };
  show(s.name, `<div class="xs-hero">${logo(s)}<div><h4>${E(s.name)}</h4><p>${E(s.desc)}</p></div></div>
    ${items.length ? `<span class="sv-lbl">Choose an option</span>${items.map(row).join('')}` : '<div class="sv-empty">Nothing is available here right now. Please check back soon.</div>'}
    ${s.note ? `<div class="sv-card"><p>${E(s.note)}</p></div>` : ''}
    <div class="sv-card" style="margin-top:12px"><h4><i class="fa-solid fa-shield-halved" style="color:var(--p)"></i> How it works</h4><p>Pick an option, send the payment and enter the Transaction ID. Our team checks the payment and delivers your order by hand — usually within a few hours. You can follow it in My orders.</p></div>
    <button class="sv-btn ghost" onclick="svGo('x_orders')"><i class="fa-solid fa-receipt"></i>My orders</button>`);
}
window.xsPick = (sid, iid) => { X.sel = { sid, iid }; window._xsW = 0; svGo('x_order'); };

/* ───────── the order form ───────── */
function payTargets(i){
  if(i.to) return [{ name: i.flow === 'sell' ? 'Send to' : 'Pay to', type: '', number: i.to }];
  return (window._feeWallets || []).map(w => { const o = Array.isArray(w.methods) && w.methods.length ? w.methods.filter(m => m && m.number)[0] : { type: w.payMethod || 'Send Money', number: w.collectionNumber || w.paymentNumber };
    return o && o.number ? { name: w.name, type: o.type || 'Send Money', number: o.number, logo: w.logoUrl } : null; }).filter(Boolean);
}
function orderPage(){
  const sel = X.sel || {}; const s = svcs().find(x => x.id === sel.sid); const i = s && s.items.find(x => x.id === sel.iid);
  if(!s || !i){ show('Order', '<div class="sv-empty">Please choose an option again.</div>'); return; }
  const amt = s.mode === 'amount', sell = i.flow === 'sell';
  const tg = payTargets(i); const w = tg[window._xsW || 0] || tg[0];
  show(s.name, `<div class="xs-hero">${logo(s)}<div><h4>${E(i.name)}</h4><p>${E(i.note || s.desc)}</p></div></div>
    ${amt ? `<span class="sv-lbl">${sell ? 'How much will you send?' : 'How much do you want?'} (${E(i.unit)})</span>
      <input class="sv-in" id="xsAmt" type="number" inputmode="decimal" min="${i.min || 0}" ${i.max ? `max="${i.max}"` : ''} placeholder="${i.min ? 'Min ' + num(i.min) : 'Amount'}${i.max ? ' · max ' + num(i.max) : ''}" oninput="xsCalc()">
      <div class="xs-sum"><span id="xsLbl">${sell ? 'You get' : 'You pay'}</span><b id="xsPay">৳0</b></div>`
    : `<div class="xs-sum"><span>You pay</span><b>${tk(i.price)}</b></div>`}
    ${s.fields.map((f, k) => `<span class="sv-lbl">${E(f.label)}${f.req ? '' : ' <small style="color:var(--txt3)">(optional)</small>'}</span><input class="sv-in" id="xsF${k}" maxlength="300" autocomplete="off">`).join('')}
    <span class="sv-lbl">${sell ? `Send the ${E(i.unit)} here` : 'Send the payment'}</span>
    ${tg.length > 1 ? `<div class="pay-w">${tg.map((x, k) => `<button class="${x === w ? 'on' : ''}" onclick="window._xsW=${k};svPage('x_order')">${x.logo ? `<img src="${E(x.logo)}" alt="">` : '<i class="fa-solid fa-wallet"></i>'}${E(x.name)}</button>`).join('')}</div>` : ''}
    ${w ? `<div class="pay-num"><div><small>${E(w.name)}${w.type ? ' · ' + E(w.type) : ''}</small><b>${E(w.number)}</b></div><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${E(w.number)}').then(()=>svToastOk('Copied'))">Copy</button></div>`
      : '<div class="sv-empty">No payment number is set for this service yet. Please contact support.</div>'}
    <span class="sv-lbl">${sell ? 'Transaction ID / hash of what you sent' : 'Transaction ID from your payment SMS'}</span>
    <input class="sv-in code" id="xsTrx" placeholder="TRANSACTION ID" maxlength="80" autocomplete="off">
    <button class="sv-btn gold" style="margin-top:12px" id="xsBtn" onclick="xsSubmit()" ${w ? '' : 'disabled'}><i class="fa-solid fa-paper-plane"></i>Place order</button>
    <div style="font-size:11.5px;color:var(--txt2);margin:10px 2px;line-height:1.6"><i class="fa-solid fa-circle-info"></i> Orders are checked and delivered by hand. If we cannot complete it, your money is returned.</div>`);
  window._xsCur = { s, i, w };
}
window.xsCalc = () => {
  const c = window._xsCur; if(!c) return; const { i } = c; const a = Number(($x('xsAmt') || {}).value) || 0;
  const base = a * i.rate;
  const v = i.flow === 'sell' ? Math.max(0, Math.floor(base * (1 - i.pct / 100) - i.fee)) : a > 0 ? Math.ceil(base * (1 + i.pct / 100) + i.fee) : 0;
  $x('xsPay').textContent = tk(v);
};
window.xsSubmit = async function(){
  const c = window._xsCur; if(!c) return; const { s, i, w } = c;
  const trxId = ($x('xsTrx').value || '').trim();
  if(s.mode === 'amount' && !(Number(($x('xsAmt') || {}).value) > 0)){ toast('Enter the amount', true); return; }
  if(trxId.length < 6){ toast('Enter the Transaction ID', true); return; }
  const fields = s.fields.map((f, k) => (($x('xsF' + k) || {}).value || '').trim());
  const miss = s.fields.find((f, k) => f.req && !fields[k]); if(miss){ toast('Please fill in: ' + miss.label, true); return; }
  const b = $x('xsBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Placing order…';
  const r = await api('extraOrder', { sid: s.id, iid: i.id, amount: Number(($x('xsAmt') || {}).value) || 0, fields, trxId, payMethod: w ? w.name : '', toNumber: w ? w.number : '' });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-paper-plane"></i>Place order';
  if(!r.ok){ toast(r.data.error || 'Could not place the order', true); return; }
  toast('Order placed — we will deliver it soon');
  svGo('x_orders');
};

/* ───────── my orders ───────── */
async function ordersPage(){
  show('My orders', '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>');
  const r = await api('extraOrders');
  if(!r.ok){ show('My orders', `<div class="sv-empty">${E(r.data.error || 'Could not load.')}</div>`); return; }
  const L = r.data.list || [];
  const when = t => { try { return new Date(t).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
  const lbl = { Pending: 'Checking payment', Processing: 'In progress', Delivered: 'Delivered', Rejected: 'Not completed' };
  show('My orders', L.length ? L.map(o => `<div class="xs-od"><div class="h"><div><b>${E(o.iname)}</b><div>${E(o.sname)} · ${when(o.createdAt)}</div></div><span class="xs-st ${E(o.status)}">${lbl[o.status] || E(o.status)}</span></div>
      <div style="margin-top:6px">${o.amount ? `${num(o.amount)} ${E(o.unit)} · ` : ''}${o.flow === 'sell' ? 'You get ' + tk(o.get) : 'Paid ' + tk(o.price)} · TrxID <span style="font-family:monospace">${E(o.trxId)}</span></div>
      ${o.status === 'Delivered' && o.delivery ? `<div class="xs-dl">${E(o.delivery)}<button onclick="navigator.clipboard&&navigator.clipboard.writeText(this.parentNode.firstChild.textContent).then(()=>svToastOk('Copied'))"><i class="fa-regular fa-copy"></i> Copy</button></div>` : ''}
      ${o.status === 'Rejected' && o.reason ? `<div style="margin-top:6px;color:#ff8fa3">${E(o.reason)}</div>` : ''}</div>`).join('')
    : `<div class="sv-empty"><i class="fa-solid fa-bag-shopping"></i>No orders yet.</div><button class="sv-btn ghost" onclick="svClose()">Browse Extra Services</button>`);
}

/* ───────── Play & Earn: Tic-Tac-Toe ───────── */
async function gamePage(s){
  show(s.name, '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>');
  const r = await api('ttt', { op: 'state' });
  X.gs = s; drawGame(r);
}
function drawGame(r){
  const s = X.gs || { name: 'Play & Earn' };
  if(!r.ok){
    if(r.data && r.data.code === 'verify_required') return show(s.name, `<div class="xs-hero">${logo(s)}<div><h4>${E(s.name)}</h4><p>${E(s.desc || '')}</p></div></div>
      <div class="sv-card" style="text-align:center"><h4>For Verified members</h4><p>${E(r.data.error)}</p></div><button class="vbtn" onclick="svGo('verify')">Get Verified</button>`);
    return show(s.name, `<div class="sv-empty">${E(r.data.error || 'Could not load.')}</div>`);
  }
  const g = r.data; X.game = g;
  const b = (g.b || '.........').split('');
  const live = g.b && !g.over;
  const msg = !g.b ? 'Ready to play?' : !g.over ? 'Your turn — you are X' : g.result === 'win' ? (g.reward ? `You won ${tk(g.reward)}! 🎉` : 'You won! 🎉') : g.result === 'lose' ? 'The computer won this time' : "It's a draw";
  show(s.name, `<div class="tt-top"><div><b>${tk(g.prize)}</b>per win</div><div><b>${g.wins}/${g.perDay}</b>paid wins today</div><div><b>${Math.max(0, g.maxPlays - g.plays)}</b>games left</div></div>
    <div class="tt-msg">${msg}</div>
    <div class="tt-b">${b.map((v, k) => `<button class="tt-c ${v === '.' ? '' : v}" ${live && v === '.' ? `onclick="xsMove(${k})"` : 'disabled'}>${v === '.' ? '' : v === 'X' ? '✕' : '○'}</button>`).join('')}</div>
    ${live ? '' : `<button class="sv-btn gold" onclick="xsNew()" ${g.plays >= g.maxPlays ? 'disabled' : ''}><i class="fa-solid fa-play"></i>${g.b ? 'Play again' : 'Start game'}</button>`}
    <div class="sv-card" style="margin-top:14px"><h4>How it works</h4><p>Get three ✕ in a row before the computer does. Each win adds ${tk(g.prize)} to your wallet — up to ${g.perDay} paid wins a day. The game runs on our server, so every result is fair.</p></div>
    <div class="xs-soon"><i class="fa-solid fa-dice" style="font-size:20px;color:#ffd76a"></i>More games are coming soon.</div>`);
}
window.xsNew = async () => drawGame(await api('ttt', { op: 'new' }));
window.xsMove = async k => {
  document.querySelectorAll('.tt-c').forEach(c => c.disabled = true);
  const r = await api('ttt', { op: 'move', cell: k });
  if(r.ok && r.data.balance !== null && r.data.balance !== undefined){ try { if(window._setBalance) window._setBalance(r.data.balance); } catch (e) {} }
  drawGame(r);
};

load();
// redraw the section after the language changes or the home page is rebuilt
setInterval(() => { if(X.cfg && !$x('xsBlock')) render(); }, 1500);
})();
