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
.xs-bal{margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:5px 6px 5px 11px;border-radius:20px;cursor:pointer;font-size:12.5px;font-weight:900;color:var(--txt);
  background:linear-gradient(135deg,rgba(29,219,128,.16),rgba(77,143,255,.14));border:1px solid rgba(29,219,128,.4)}
.xs-bal i.p{width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--p),var(--p2));color:#03210f;font-size:10px}
.xs-sub{display:flex;justify-content:space-between;align-items:center;margin:-4px 2px 10px;font-size:12px;color:var(--txt2)}.xs-sub span{color:var(--p);font-weight:800;cursor:pointer}
.xs-live{border-radius:18px;padding:12px 12px 6px;margin:-12px 0 25px;background:linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.015));border:1px solid var(--bord)}
.xs-live .hd{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:900;color:var(--txt);margin-bottom:8px}
.xs-live .hd em{font-style:normal;display:inline-flex;align-items:center;gap:4px;font-size:9.5px;font-weight:900;color:#ff6b81;letter-spacing:.4px}
.xs-live .hd em::before{content:"";width:7px;height:7px;border-radius:50%;background:#ff4d6a;box-shadow:0 0 0 0 rgba(255,77,106,.6);animation:xsPulse 1.6s infinite}
@keyframes xsPulse{70%{box-shadow:0 0 0 7px rgba(255,77,106,0)}100%{box-shadow:0 0 0 0 rgba(255,77,106,0)}}
.xs-lv{max-height:196px;overflow:hidden;position:relative}
.xs-lv .in{animation:xsUp linear infinite}
.xs-lv:hover .in{animation-play-state:paused}
@keyframes xsUp{to{transform:translateY(-50%)}}
.xs-li{display:flex;align-items:center;gap:10px;padding:7px 2px;border-bottom:1px dashed var(--bord);font-size:12px;color:var(--txt2)}
.xs-li .ic{flex:none;width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px}
.xs-li b{color:var(--txt);font-weight:800}.xs-li small{margin-left:auto;flex:none;font-size:10.5px;color:var(--txt3)}
.xb-card{position:relative;overflow:hidden;border-radius:22px;padding:18px;margin-bottom:12px;color:#fff;background:radial-gradient(120% 140% at 100% 0%,rgba(77,143,255,.45),transparent 55%),linear-gradient(135deg,#0d7a52,#0a3d6b)}
.xb-card small{font-size:11px;font-weight:800;letter-spacing:.6px;opacity:.85}.xb-card .v{font-size:34px;font-weight:900;margin:4px 0}.xb-card p{margin:0;font-size:11.5px;opacity:.85;line-height:1.5}
.xb-chips{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}.xb-chips button{flex:1;min-width:64px;border-radius:11px;padding:9px 4px;border:1.5px solid var(--gbord);background:var(--glass);color:var(--txt);font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit}
.xb-chips button.on{border-color:var(--p);background:rgba(29,219,128,.12);color:var(--p)}
.xs-pm{display:flex;gap:8px;margin:6px 0 10px}.xs-pm button{flex:1;border-radius:13px;padding:11px 8px;border:1.5px solid var(--gbord);background:var(--glass);color:var(--txt);font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit;line-height:1.35}
.xs-pm button.on{border-color:var(--p);background:rgba(29,219,128,.12)}.xs-pm button small{display:block;font-size:11px;color:var(--txt2);font-weight:700}
.xs-perk{position:relative;overflow:hidden;display:flex;gap:12px;align-items:center;border-radius:18px;padding:13px 14px;margin:0 0 12px;cursor:pointer;
  background:radial-gradient(120% 140% at 0% 0%,rgba(70,176,255,.28),transparent 60%),linear-gradient(135deg,#0f1f45,#132a5c 60%,#2a2208);border:1px solid rgba(120,180,255,.35);box-shadow:0 10px 26px rgba(0,0,0,.3)}
.xs-perk::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.12),transparent);animation:xsSweep 3.4s ease-in-out infinite}
@keyframes xsSweep{0%{left:-60%}60%,100%{left:130%}}
.xs-perk .sl{flex:none;font-size:34px;line-height:1}.xs-perk .sl .vf-seal{width:1em;height:1em;margin:0}
.xs-perk b{display:block;font-size:13.5px;background:linear-gradient(90deg,#fff,#bfe0ff,#ffe9a8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.xs-perk p{margin:2px 0 0;font-size:11.5px;color:#b9cbea;line-height:1.5}
.xs-perk .go{flex:none;margin-left:auto;font-size:11.5px;font-weight:900;padding:7px 11px;border-radius:11px;color:#2a1a00;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d);white-space:nowrap}
.xs-perk.on{background:radial-gradient(120% 140% at 0% 0%,rgba(29,219,128,.25),transparent 60%),linear-gradient(135deg,#0b2a22,#0f2f45);border-color:rgba(29,219,128,.45);cursor:default}
.xs-perk.on .go{background:rgba(29,219,128,.18);color:var(--p)}
.xs-brk{border-radius:14px;padding:10px 14px;margin:10px 0;background:rgba(255,255,255,.035);border:1px solid var(--bord);font-size:12.5px;color:var(--txt2)}
.xs-brk div{display:flex;justify-content:space-between;gap:8px;padding:4px 0}.xs-brk s{opacity:.6}.xs-brk .ok{color:var(--p);font-weight:800}
.xs-brk .tot{border-top:1px dashed var(--bord);margin-top:4px;padding-top:8px;font-size:14px;color:var(--txt);font-weight:900}.xs-brk .tot b{font-size:19px}
.xs-it .pr .vp{display:block;font-size:10.5px;font-weight:800;color:#7fc3ff}
.ln-note{display:flex;gap:11px;align-items:flex-start;text-align:left;border-radius:16px;padding:12px 13px;margin:12px 0;background:linear-gradient(135deg,rgba(255,215,106,.10),rgba(255,140,66,.06));border:1px solid rgba(255,200,90,.35);font-size:12px;color:var(--txt2);line-height:1.55}
.ln-note .ic{flex:none;width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:rgba(255,200,90,.16);color:#ffd76a;font-size:15px}
.ln-note b{display:block;color:var(--txt);font-size:13px;margin-bottom:2px}
.ln-note .vb{display:inline-flex;align-items:center;gap:5px;margin-top:7px;border:0;border-radius:10px;padding:7px 11px;font-weight:900;font-size:11.5px;cursor:pointer;font-family:inherit;color:#3a2500;background:linear-gradient(135deg,#ffe08a,#f2a91d)}
.ln-note.vip{background:linear-gradient(135deg,rgba(255,215,106,.16),rgba(29,219,128,.06))}
@media (max-width:360px){.xs-grid{gap:8px}.xs-lg{width:46px;height:46px;font-size:20px}}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

function logo(s){ return s.logo ? `<div class="xs-lg img"><img src="${E(s.logo)}" alt="${E(s.name)}" loading="lazy"></div>` : `<div class="xs-lg ${E(s.color)}"><i class="${E(s.icon)}"></i></div>`; }
const svcs = () => ((X.cfg && X.cfg.services) || []).filter(s => s.on);
const isV = () => !!(X.xb && X.xb.verified);
const PK = () => (X.cfg && X.cfg.perk) || { on: false };
// the same price rule as the server: Verified members pay no service charge and no transaction fee
function quote(s, i, amount, ver){
  const P = PK(), free = !!(P.on && ver);
  const ch = Math.max(Math.round(P.chargeMin || 0), Math.ceil(i.price * (Number(P.chargePct) || 0) / 100));
  if(s.mode !== 'amount') return { base: i.price, fee: P.on && !ver ? ch : 0, saved: free ? ch : 0, pay: i.price + (P.on && !ver ? ch : 0), get: 0, waived: free };
  const base = amount * i.rate, f = base * i.pct / 100 + i.fee;
  if(i.flow === 'sell') return { base: Math.floor(base), fee: free ? 0 : Math.ceil(f), saved: free ? Math.ceil(f) : 0, pay: 0, get: Math.max(0, Math.floor(free ? base : base - f)), waived: free };
  return { base: Math.ceil(base), fee: free ? 0 : Math.ceil(f), saved: free ? Math.ceil(f) : 0, pay: Math.ceil(free ? base : base + f), get: amount, waived: free };
}
const sealHtml = () => { try { return window._svSeal ? window._svSeal() : '<i class="fa-solid fa-circle-check" style="color:#46b0ff"></i>'; } catch (e) { return ''; } };
// the Verified exclusive banner
function perkBanner(){
  const P = PK(); if(!P.on) return '';
  if(user() && isV()) return `<div class="xs-perk on"><span class="sl">${sealHtml()}</span><div><b>Verified Exclusive is active</b><p>You pay no service charge and no transaction fee on every Extra Service.</p></div><span class="go">0% fee ✓</span></div>`;
  return `<div class="xs-perk" onclick="svGo('verify')"><span class="sl">${sealHtml()}</span><div><b>Verified Exclusive: 0% charge · 0 fee</b><p>Verified members pay no service charge${P.chargePct ? ` (${P.chargePct}%)` : ''} and no transaction fee on exchange, gift cards, SMM and every Extra Service.</p></div><span class="go">Get Verified</span></div>`;
}
// processing-time notice for loans (home page, after applying, application details)
function loanNote(){
  const N = (X.cfg && X.cfg.loanNotice) || {}; if(N.on === false) return '';
  const days = E(N.days || '7–14');
  if(X.xb && X.xb.vip) return `<div class="ln-note vip"><div class="ic"><i class="fa-solid fa-crown"></i></div><div><b>Your application has VIP priority</b>Loan money is processed through the bank, which normally takes ${days} working days. As a VIP member, your application is reviewed first with high priority.</div></div>`;
  return `<div class="ln-note"><div class="ic"><i class="fa-solid fa-building-columns"></i></div><div><b>Processing time: ${days} working days</b>Loan money is processed through the bank, so approval and disbursement can take up to ${days} working days. Want it sooner? VIP applications get high priority and are reviewed first — a better chance of early approval and disbursement.<br><button class="vb" onclick="svGo('vip')"><i class="fa-solid fa-crown"></i>Get VIP priority</button></div></div>`;
}
function placeNotes(){
  const html = loanNote(); if(!html) return;
  const spots = [['#screen-home .home-body', el => el.querySelector('.quick-actions-title'), 'before'], ['#screen-review-progress', el => el.querySelector('.rv-foot'), 'before'],
    ['#screen-waiting', el => el.querySelector('.btn-home'), 'before'], ['#statusModalContent', el => el.firstChild, 'first']];
  spots.forEach(([sel, at, how]) => { const el = document.querySelector(sel); if(!el || el.querySelector(':scope > .ln-note')) return;
    const box = document.createElement('div'); box.innerHTML = html; const n = box.firstChild;
    if(how === 'first') el.insertBefore(n, el.firstChild); else { const ref = at(el); if(ref) el.insertBefore(n, ref); else el.appendChild(n); } });
}
function refreshNotes(){ document.querySelectorAll('.ln-note').forEach(n => n.remove()); placeNotes(); }

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
  T.x_wallet = { l: 'Extra Balance', cat: '', login: true, page: 'x_wallet' }; P.x_wallet = walletPage; T.x_dep = { l: 'Add balance', cat: '', login: true, page: 'x_dep' }; P.x_dep = depPage;
}
function render(){
  const g = document.querySelector('.home-body .qa-grid') || document.querySelector('.qa-grid'); if(!g) return;
  let box = $x('xsBlock');
  const L = svcs();
  if(!X.cfg || !X.cfg.on || !L.length){ if(box) box.remove(); return; }
  if(!box){ box = document.createElement('div'); box.id = 'xsBlock'; g.insertAdjacentElement('afterend', box); }
  const W = X.cfg.wallet || {};
  box.innerHTML = `<div class="quick-actions-title xs-title">${E(X.cfg.title || 'Extra Services')} <em>PREMIUM</em>${W.on !== false ? `<span class="xs-bal" onclick="svGo('x_wallet')" title="Extra Balance">${user() && X.xb ? tk(X.xb.xbal) : 'Balance'}<i class="p fa-solid fa-plus"></i></span>` : ''}</div>
    <div class="xs-sub"><span style="color:var(--txt2);font-weight:600">${W.on !== false ? 'Pay with your Extra Balance' : 'Paid services, delivered by our team'}</span><span onclick="svGo('x_orders')">My orders ›</span></div>
    ${perkBanner()}
    <div class="xs-grid">${L.map(s => `<div class="xs-t${s.soon ? ' soon' : ''}" onclick="xsOpen('${E(s.id)}')">${s.badge || s.soon ? `<span class="bd">${E(s.soon ? 'SOON' : s.badge)}</span>` : ''}${logo(s)}<b>${E(s.short || s.name)}</b></div>`).join('')}</div>
    <div id="xsLive"></div>`;
  drawLive();
}
// live list of the latest real orders and deposits (masked numbers), refreshed every 30 seconds
const ago = t => { const m = Math.max(0, Math.round((Date.now() - new Date(t).getTime()) / 6e4)); return m < 1 ? 'just now' : m < 60 ? m + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago'; };
function drawLive(){
  const el = $x('xsLive'); if(!el) return;
  const L = X.live || [];
  if(!L.length || !X.cfg || !(X.cfg.live || {}).on){ el.innerHTML = ''; el.className = ''; return; }
  el.className = 'xs-live';
  const row = x => `<div class="xs-li"><div class="ic sv-ic ${E(x.color || 'g-green')}"><i class="${E(x.icon || 'fa-solid fa-bag-shopping')}"></i></div><div><b>${E(x.who)}</b> ${E(x.text)}</div><small>${ago(x.at)}</small></div>`;
  const scroll = L.length > 5;
  el.innerHTML = `<div class="hd"><i class="fa-solid fa-bolt" style="color:#ffd76a"></i>Live orders <em>LIVE</em></div><div class="xs-lv"><div class="in" style="${scroll ? `animation-duration:${L.length * 3}s` : 'animation:none'}">${L.map(row).join('')}${scroll ? L.map(row).join('') : ''}</div></div>`;
}
async function loadLive(){
  try { const r = await fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'extraLive' }) }); const d = await r.json(); X.live = d.list || []; drawLive(); } catch (e) {}
}
async function loadXb(){ if(!user()) { X.xb = null; refreshNotes(); return null; } const r = await api('xbalState'); if(r.ok){ X.xb = r.data; render(); refreshNotes(); } return X.xb; }
window.xsOpen = id => { const s = svcs().find(x => x.id === id); if(!s) return; if(s.soon){ toast('Coming soon — stay tuned!'); return; } svGo('x_' + id); };

/* ───────── one service: its options ───────── */
function svcPage(id){
  const s = svcs().find(x => x.id === id); if(!s) return;
  if(s.mode === 'game') return gamePage(s);
  const items = s.items.filter(i => i.on);
  const row = i => {
    if(s.mode === 'amount'){
      const hasFee = i.pct || i.fee, free = PK().on && isV();
      const feeTxt = !hasFee ? 'No fee' : free ? '<span style="color:var(--p);font-weight:800">No fee — Verified ✓</span>' : `Fee ${i.pct ? num(i.pct) + '%' : ''}${i.pct && i.fee ? ' + ' : ''}${i.fee ? tk(i.fee) : ''}${PK().on ? ' · <span style="color:#7fc3ff">Verified: no fee</span>' : ''}`;
      const rate = i.unit === '৳' ? feeTxt : `1 ${E(i.unit)} = ${tk(i.rate)} · ${feeTxt}`;
      return `<div class="xs-it" onclick="xsPick('${E(s.id)}','${E(i.id)}')"><div><b>${E(i.name)}</b><small>${rate}${i.min || i.max ? ` · ${num(i.min)}–${num(i.max)} ${E(i.unit)}` : ''}</small></div><div class="pr"><i class="fa-solid fa-chevron-right" style="color:var(--txt2)"></i></div></div>`;
    }
    return `<div class="xs-it" onclick="xsPick('${E(s.id)}','${E(i.id)}')"><div><b>${E(i.name)}</b>${i.note ? `<small>${E(i.note)}</small>` : ''}</div><div class="pr">${(() => { const q = quote(s, i, 0, isV()); return q.fee ? `${tk(q.pay)}<span class="vp">Verified ${tk(q.base)}</span>` : `${tk(q.pay)}${q.waived ? '<span class="vp">No charge ✓</span>' : ''}`; })()}</div></div>`;
  };
  show(s.name, `<div class="xs-hero">${logo(s)}<div><h4>${E(s.name)}</h4><p>${E(s.desc)}</p></div></div>
    ${perkBanner()}
    ${items.length ? `<span class="sv-lbl">Choose an option</span>${items.map(row).join('')}` : '<div class="sv-empty">Nothing is available here right now. Please check back soon.</div>'}
    ${s.note ? `<div class="sv-card"><p>${E(s.note)}</p></div>` : ''}
    <div class="sv-card" style="margin-top:12px"><h4><i class="fa-solid fa-shield-halved" style="color:var(--p)"></i> How it works</h4><p>Pick an option, send the payment and enter the Transaction ID. Our team checks the payment and delivers your order by hand — usually within a few hours. You can follow it in My orders.</p></div>
    <button class="sv-btn ghost" onclick="svGo('x_orders')"><i class="fa-solid fa-receipt"></i>My orders</button>`);
}
window.xsPick = (sid, iid) => { X.sel = { sid, iid }; window._xsW = 0; window._xsPm = ''; svGo('x_order'); loadXb().then(() => { const typed = [...document.querySelectorAll('#svBody input')].some(e => e.value); if(document.getElementById('xsBtn') && !typed) window.svPage('x_order'); }); };

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
  const W = X.cfg.wallet || {}, bal = X.xb ? X.xb.xbal : 0;
  const canBal = !sell && W.on !== false, canDirect = sell || W.direct !== false;
  if(!canDirect) window._xsPm = 'xbal'; else if(!canBal) window._xsPm = 'trx'; else if(!window._xsPm) window._xsPm = 'xbal';
  const pm = window._xsPm, q0 = quote(s, i, 0, isV()), price = amt ? 0 : q0.pay;
  const payBlock = pm === 'xbal' ? `<div class="pay-num" style="border-style:solid"><div><small>Extra Balance</small><b>${tk(bal)}</b></div><button onclick="svGo('x_dep')">+ Add</button></div>
      <div style="font-size:11.5px;color:var(--txt2);margin:6px 2px" id="xsBalNote">${!amt && price > bal ? `<span style="color:#ff8fa3">You need ${tk(price - bal)} more. Add balance first.</span>` : 'The price is taken from your Extra Balance when you place the order.'}</div>`
    : `<span class="sv-lbl">${sell ? `Send the ${E(i.unit)} here` : 'Send the payment'}</span>
    ${tg.length > 1 ? `<div class="pay-w">${tg.map((x, k) => `<button class="${x === w ? 'on' : ''}" onclick="window._xsW=${k};svPage('x_order')">${x.logo ? `<img src="${E(x.logo)}" alt="">` : '<i class="fa-solid fa-wallet"></i>'}${E(x.name)}</button>`).join('')}</div>` : ''}
    ${w ? `<div class="pay-num"><div><small>${E(w.name)}${w.type ? ' · ' + E(w.type) : ''}</small><b>${E(w.number)}</b></div><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${E(w.number)}').then(()=>svToastOk('Copied'))">Copy</button></div>`
      : '<div class="sv-empty">No payment number is set for this service yet. Please contact support.</div>'}
    <span class="sv-lbl">${sell ? 'Transaction ID / hash of what you sent' : 'Transaction ID from your payment SMS'}</span>
    <input class="sv-in code" id="xsTrx" placeholder="TRANSACTION ID" maxlength="80" autocomplete="off">`;
  show(s.name, `<div class="xs-hero">${logo(s)}<div><h4>${E(i.name)}</h4><p>${E(i.note || s.desc)}</p></div></div>
    ${amt ? `<span class="sv-lbl">${sell ? 'How much will you send?' : 'How much do you want?'} (${E(i.unit)})</span>
      <input class="sv-in" id="xsAmt" type="number" inputmode="decimal" min="${i.min || 0}" ${i.max ? `max="${i.max}"` : ''} placeholder="${i.min ? 'Min ' + num(i.min) : 'Amount'}${i.max ? ' · max ' + num(i.max) : ''}" oninput="xsCalc()">
      <div class="xs-brk" id="xsBrk"></div>`
    : `<div class="xs-brk" id="xsBrk"></div>`}
    ${PK().on && !isV() ? `<div class="xs-perk" onclick="svGo('verify')" style="margin-top:-2px"><span class="sl">${sealHtml()}</span><div><b>Pay no charge with Verified</b><p>Verified members skip the ${amt ? 'transaction fee' : 'service charge'} on every order — a one-time badge that keeps saving.</p></div><span class="go">Get Verified</span></div>` : ''}
    ${s.fields.map((f, k) => `<span class="sv-lbl">${E(f.label)}${f.req ? '' : ' <small style="color:var(--txt3)">(optional)</small>'}</span><input class="sv-in" id="xsF${k}" maxlength="300" autocomplete="off">`).join('')}
    ${canBal && canDirect ? `<span class="sv-lbl">How do you want to pay?</span><div class="xs-pm"><button class="${pm === 'xbal' ? 'on' : ''}" onclick="xsPm('xbal')"><i class="fa-solid fa-wallet"></i> Extra Balance<small>${tk(bal)}</small></button><button class="${pm === 'trx' ? 'on' : ''}" onclick="xsPm('trx')"><i class="fa-solid fa-mobile-screen"></i> bKash / Nagad<small>Send &amp; give TrxID</small></button></div>` : ''}
    ${payBlock}
    <button class="sv-btn gold" style="margin-top:12px" id="xsBtn" onclick="xsSubmit()" ${pm === 'xbal' || w ? '' : 'disabled'}><i class="fa-solid fa-paper-plane"></i>Place order</button>
    <div style="font-size:11.5px;color:var(--txt2);margin:10px 2px;line-height:1.6"><i class="fa-solid fa-circle-info"></i> Orders are checked and delivered by hand. If we cannot complete it, your money is returned.</div>`);
  window._xsCur = { s, i, w, pm };
  xsCalc();
}
window.xsPm = v => { window._xsPm = v; window.svPage('x_order'); };
window.xsCalc = () => {
  const c = window._xsCur; if(!c) return; const { s, i } = c; const amt = s.mode === 'amount', sell = i.flow === 'sell';
  const a = Number(($x('xsAmt') || {}).value) || 0, q = quote(s, i, a, isV());
  const v = sell ? q.get : (amt && !(a > 0)) ? 0 : q.pay;
  const lbl = amt ? 'Transaction fee' : 'Service charge';
  const feeRow = !PK().on && !q.fee ? '' : q.waived ? `<div><span>${lbl}</span><span><s>${tk(q.saved)}</s> <span class="ok">Waived — Verified ✓</span></span></div>` : q.fee ? `<div><span>${lbl}</span><span>${sell ? '−' : '+'}${tk(q.fee)}</span></div>` : `<div><span>${lbl}</span><span class="ok">৳0</span></div>`;
  const b = $x('xsBrk'); if(b) b.innerHTML = `<div><span>${amt ? (sell ? 'Value' : 'Amount') : 'Price'}</span><span>${tk(amt ? (a > 0 ? q.base : 0) : q.base)}</span></div>${feeRow}<div class="tot"><span>${sell ? 'You get' : 'You pay'}</span><b>${tk(v)}</b></div>`;
  const n = $x('xsBalNote'); if(n && i.flow !== 'sell'){ const bal = X.xb ? X.xb.xbal : 0; n.innerHTML = v > bal ? `<span style="color:#ff8fa3">You need ${tk(v - bal)} more. Add balance first.</span>` : 'The price is taken from your Extra Balance when you place the order.'; }
};
window.xsSubmit = async function(){
  const c = window._xsCur; if(!c) return; const { s, i, w, pm } = c;
  const trxId = (($x('xsTrx') || {}).value || '').trim();
  if(s.mode === 'amount' && !(Number(($x('xsAmt') || {}).value) > 0)){ toast('Enter the amount', true); return; }
  if(pm !== 'xbal' && trxId.length < 6){ toast('Enter the Transaction ID', true); return; }
  const fields = s.fields.map((f, k) => (($x('xsF' + k) || {}).value || '').trim());
  const miss = s.fields.find((f, k) => f.req && !fields[k]); if(miss){ toast('Please fill in: ' + miss.label, true); return; }
  const b = $x('xsBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Placing order…';
  const r = await api('extraOrder', { sid: s.id, iid: i.id, amount: Number(($x('xsAmt') || {}).value) || 0, fields, trxId, payWith: pm, payMethod: w ? w.name : '', toNumber: w ? w.number : '' });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-paper-plane"></i>Place order';
  if(!r.ok){ toast(r.data.error || 'Could not place the order', true); if(r.data.code === 'xbal_low') svGo('x_dep'); return; }
  if(r.data.xbal !== null && r.data.xbal !== undefined && X.xb){ X.xb.xbal = r.data.xbal; render(); }
  loadLive();
  toast('Order placed — we will deliver it soon');
  svGo('x_orders');
};

/* ───────── Extra Balance ───────── */
async function walletPage(){
  show('Extra Balance', '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>');
  const x = await loadXb();
  if(!x){ show('Extra Balance', '<div class="sv-empty">Please login again.</div>'); return; }
  const when = t => { try { return new Date(t).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
  const TY = { deposit: ['arrow-down', 'g-green', 'Deposit'], order: ['bag-shopping', 'g-purple', 'Order'], refund: ['rotate-left', 'g-blue', 'Refund'], admin: ['user-shield', 'g-slate', 'Adjustment'] };
  const dep = (x.deposits || []).filter(d => d.status !== 'Approved');
  show('Extra Balance', `<div class="xb-card"><small>EXTRA BALANCE</small><div class="v">${tk(x.xbal)}</div><p>Only for Extra Services. It is separate from your loan and cannot be used for loan fees.</p></div>
    <button class="sv-btn gold" onclick="svGo('x_dep')"><i class="fa-solid fa-plus"></i>Add balance</button>
    ${dep.length ? `<span class="sv-lbl" style="margin-top:14px">Deposits</span>${dep.map(d => `<div class="xs-od"><div class="h"><div><b>${tk(d.amount)}</b><div>TrxID <span style="font-family:monospace">${E(d.trxId)}</span> · ${when(d.createdAt)}</div></div><span class="xs-st ${d.status === 'Rejected' ? 'Rejected' : 'Pending'}">${d.status === 'Rejected' ? 'Not approved' : 'Checking'}</span></div>${d.reason ? `<div style="margin-top:6px;color:#ff8fa3">${E(d.reason)}</div>` : ''}</div>`).join('')}` : ''}
    <span class="sv-lbl" style="margin-top:14px">History</span>
    ${(x.log || []).length ? x.log.map(l => { const m = TY[l.type] || ['coins', 'g-teal', 'Balance']; const pos = Number(l.amount) >= 0;
      return `<div class="wl-it"><div class="ic sv-ic ${m[1]}" style="width:38px;height:38px"><i class="fa-solid fa-${m[0]}"></i></div><div class="m"><b>${E(l.note || m[2])}</b><small>${m[2]} · ${when(l.at)}</small></div><div class="a ${pos ? 'p' : 'n'}">${pos ? '+' : '−'}${tk(Math.abs(l.amount))}</div></div>`; }).join('')
      : '<div class="sv-empty"><i class="fa-solid fa-wallet"></i>No history yet.</div>'}`);
}
function depPage(){
  const W = (X.cfg && X.cfg.wallet) || {};
  const tg = payTargets({}); const w = tg[window._xbW || 0] || tg[0];
  const amts = [100, 500, 1000, 2000, 5000].filter(a => a >= (W.min || 1) && (!W.max || a <= W.max));
  show('Add balance', `<div class="xb-card"><small>EXTRA BALANCE</small><div class="v">${tk(X.xb ? X.xb.xbal : 0)}</div><p>Add money once and order any Extra Service in one tap.</p></div>
    <span class="sv-lbl">1. Amount</span>
    <div class="xb-chips">${amts.map(a => `<button onclick="xbAmt(${a},this)">${tk(a)}</button>`).join('')}</div>
    <input class="sv-in" id="xbAmt" type="number" inputmode="numeric" placeholder="Amount (min ${tk(W.min || 50)}${W.max ? ', max ' + tk(W.max) : ''})">
    <span class="sv-lbl">2. Send it to</span>
    ${tg.length > 1 ? `<div class="pay-w">${tg.map((x, k) => `<button class="${x === w ? 'on' : ''}" onclick="window._xbW=${k};svPage('x_dep')">${x.logo ? `<img src="${E(x.logo)}" alt="">` : '<i class="fa-solid fa-wallet"></i>'}${E(x.name)}</button>`).join('')}</div>` : ''}
    ${w ? `<div class="pay-num"><div><small>${E(w.name)}${w.type ? ' · ' + E(w.type) : ''}</small><b>${E(w.number)}</b></div><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${E(w.number)}').then(()=>svToastOk('Copied'))">Copy</button></div>` : '<div class="sv-empty">No payment number is available right now. Please contact support.</div>'}
    <span class="sv-lbl">3. Transaction ID from your payment SMS</span>
    <input class="sv-in code" id="xbTrx" placeholder="TRANSACTION ID" maxlength="40" autocomplete="off">
    <button class="sv-btn gold" style="margin-top:12px" id="xbBtn" onclick="xbSubmit()" ${w ? '' : 'disabled'}><i class="fa-solid fa-paper-plane"></i>Submit deposit</button>
    <div style="font-size:11.5px;color:var(--txt2);margin:10px 2px;line-height:1.6"><i class="fa-solid fa-circle-info"></i> We add it as soon as we check your payment. Extra Balance is only for Extra Services — not for loans or loan fees.</div>`);
  window._xbCur = w;
}
window.xbAmt = (v, el) => { $x('xbAmt').value = v; document.querySelectorAll('.xb-chips button').forEach(b => b.classList.toggle('on', b === el)); };
window.xbSubmit = async function(){
  const w = window._xbCur, amount = Number($x('xbAmt').value) || 0, trxId = ($x('xbTrx').value || '').trim();
  if(!(amount > 0)){ toast('Enter the amount', true); return; }
  if(trxId.length < 6){ toast('Enter the Transaction ID', true); return; }
  const b = $x('xbBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Submitting…';
  const r = await api('xbalDeposit', { amount, trxId, payMethod: w ? w.name : '', toNumber: w ? w.number : '' });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-paper-plane"></i>Submit deposit';
  if(!r.ok){ toast(r.data.error || 'Could not submit', true); return; }
  toast('Deposit submitted — we will add it after checking'); svGo('x_wallet');
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

load().then(() => { loadLive(); loadXb(); });
setInterval(loadLive, 30e3);
// redraw the section after the language changes or the home page is rebuilt; reload the balance after login / logout
let _ph = (user() || {}).phone || '';
setInterval(() => { if(X.cfg) placeNotes(); if(X.cfg && !$x('xsBlock')) render(); const ph = (user() || {}).phone || ''; if(ph !== _ph){ _ph = ph; X.xb = null; loadXb().then(render); } }, 1500);
})();
