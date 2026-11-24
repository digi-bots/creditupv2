/* Creditfy — Quick Services: services hub, daily check-in, spin & win, cashback wallet, redeem codes, gift vouchers,
   promo codes on the fee, VIP Express plans and the Verified number badge.
   Settings: Admin → Services & Rewards (siteConfig/services). Money is always decided by the server (/api/account). */
(function(){
const $s = id => document.getElementById(id);
const E = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tk = n => '৳' + Math.round(Number(n) || 0).toLocaleString('en-US');
const api = (a, d) => (window._api ? window._api(a, d || {}, true) : Promise.resolve({ ok: false, data: { error: 'Please wait a moment and try again.' } }));
const user = () => { try { return JSON.parse(localStorage.getItem('creditUpUser')); } catch (e) { return null; } };
const toast = (m, bad) => { let t = $s('svToast'); if(!t){ t = document.createElement('div'); t.id = 'svToast'; document.body.appendChild(t); } t.className = 'sv-toast on' + (bad ? ' bad' : ''); t.innerHTML = `<i class="fa-solid fa-${bad ? 'circle-exclamation' : 'circle-check'}"></i>${E(m)}`; clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 3200); };
const fdate = t => { try { return new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
const ftime = t => { try { return new Date(t).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }); } catch (e) { return ''; } };

/* ───────── styles ───────── */
const css = `
.qa-grid.sv-hub{grid-template-columns:repeat(4,1fr);gap:10px}
.sv-tile{position:relative;background:linear-gradient(150deg,rgba(255,255,255,.07),rgba(255,255,255,.015));border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:13px 4px 11px;display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer;transition:transform .15s;box-shadow:0 10px 24px rgba(0,0,0,.22);-webkit-tap-highlight-color:transparent;min-width:0}
.sv-tile:active{transform:scale(.94)}
.sv-tile span{font-size:10.5px;font-weight:700;color:var(--txt);text-align:center;line-height:1.2;padding:0 2px}
.sv-ic{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 6px 14px rgba(0,0,0,.25)}
.sv-bdg{position:absolute;top:-6px;right:-3px;font-size:8.5px;font-weight:900;letter-spacing:.3px;padding:2px 6px;border-radius:8px;background:linear-gradient(135deg,#ff4d6a,#ff8c42);color:#fff;box-shadow:0 3px 8px rgba(255,77,106,.4)}
.sv-bdg.gold{background:linear-gradient(135deg,#ffd76a,#f5a623);color:#3a2500}
.sv-dot{position:absolute;top:7px;right:12px;width:8px;height:8px;border-radius:50%;background:#ff4d6a;box-shadow:0 0 0 3px rgba(255,77,106,.25)}
.g-blue{background:linear-gradient(135deg,#4d8fff,#2b5fd9)}.g-orange{background:linear-gradient(135deg,#ffa25c,#ff6a2b)}.g-purple{background:linear-gradient(135deg,#b06bff,#7a3ff2)}
.g-green{background:linear-gradient(135deg,#2ee59a,#0fae63)}.g-gold{background:linear-gradient(135deg,#ffd76a,#e69a12);color:#3a2500}.g-pink{background:linear-gradient(135deg,#ff6fa5,#e8336f)}
.g-teal{background:linear-gradient(135deg,#2fd6d0,#0e9aa0)}.g-red{background:linear-gradient(135deg,#ff6b81,#e0334f)}.g-slate{background:linear-gradient(135deg,#7b90b4,#4a5d80)}.g-cyan{background:linear-gradient(135deg,#46c8ff,#1786d8)}
.g-dark{background:linear-gradient(135deg,#3b3b55,#151526);border:1px solid rgba(255,215,106,.5);color:#ffd76a}
.sv-sheet{position:fixed;inset:0;z-index:2600;display:none;background:var(--bg);overflow:hidden}
.sv-sheet.on{display:flex;flex-direction:column;animation:svIn .22s ease-out}
@keyframes svIn{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
.sv-wrap{width:100%;max-width:520px;margin:0 auto;height:100%;display:flex;flex-direction:column}
.sv-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--bord);background:rgba(6,13,26,.85);backdrop-filter:blur(10px)}
.sv-head button{width:38px;height:38px;border-radius:12px;border:1px solid var(--gbord);background:var(--glass);color:var(--txt);font-size:15px;cursor:pointer}
.sv-head h3{font-size:16px;font-weight:800;color:var(--txt);margin:0;flex:1}
.sv-body{flex:1;overflow-y:auto;padding:16px 16px 40px;-webkit-overflow-scrolling:touch}
.sv-cat{font-size:11px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:var(--txt2);margin:18px 2px 10px}
.sv-cat:first-child{margin-top:2px}
.sv-card{background:linear-gradient(160deg,var(--surf),var(--bg2));border:1px solid var(--bord);border-radius:18px;padding:16px;margin-bottom:12px}
.sv-card h4{margin:0 0 6px;font-size:15px;color:var(--txt)}.sv-card p{margin:0;font-size:12.5px;color:var(--txt2);line-height:1.6}
.sv-btn{width:100%;border:0;border-radius:14px;padding:14px;font-size:14.5px;font-weight:800;font-family:inherit;cursor:pointer;background:linear-gradient(135deg,var(--p),var(--p2));color:#03210f;box-shadow:0 10px 24px rgba(29,219,128,.25);display:flex;align-items:center;justify-content:center;gap:8px}
.sv-btn:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
.sv-btn.gold{background:linear-gradient(135deg,#ffe08a,#f2a91d);color:#3a2500;box-shadow:0 10px 24px rgba(242,169,29,.3)}
.sv-btn.ghost{background:var(--glass);color:var(--txt);border:1px solid var(--gbord);box-shadow:none}
.sv-in{width:100%;box-sizing:border-box;height:50px;border-radius:14px;border:1.5px solid var(--gbord);background:rgba(255,255,255,.04);color:var(--txt);padding:0 14px;font-size:15px;font-family:inherit;outline:none}
.sv-in:focus{border-color:rgba(29,219,128,.6)}
.sv-in.code{text-transform:uppercase;letter-spacing:2px;font-weight:800;text-align:center;font-family:monospace;font-size:17px}
.sv-lbl{font-size:12px;font-weight:700;color:var(--txt2);margin:12px 2px 6px;display:block}
.sv-row{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:8px 0;border-bottom:1px dashed var(--bord);color:var(--txt2)}
.sv-row b{color:var(--txt)}
.sv-empty{text-align:center;color:var(--txt2);font-size:13px;padding:26px 10px}
.sv-empty i{display:block;font-size:30px;margin-bottom:10px;opacity:.5}
.sv-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,30px);opacity:0;z-index:3000;background:#0f2a1c;color:#c9ffe1;border:1px solid rgba(29,219,128,.4);padding:11px 16px;border-radius:14px;font-size:13px;font-weight:700;display:flex;gap:8px;align-items:center;transition:.25s;max-width:88vw;pointer-events:none}
.sv-toast.on{opacity:1;transform:translate(-50%,0)}.sv-toast.bad{background:#2e0f17;color:#ffd0d8;border-color:rgba(255,77,106,.45)}
/* check-in */
.ck-hero{text-align:center;padding:22px 16px;border-radius:22px;background:radial-gradient(120% 120% at 50% 0%,rgba(29,219,128,.22),rgba(6,13,26,0) 70%),var(--surf);border:1px solid rgba(29,219,128,.25);margin-bottom:14px}
.ck-hero .n{font-size:40px;font-weight:900;color:var(--p);line-height:1}.ck-hero small{display:block;color:var(--txt2);font-size:12px;margin-top:6px}
.ck-days{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin:14px 0}
.ck-d{border-radius:13px;padding:9px 2px;text-align:center;background:rgba(255,255,255,.035);border:1px solid var(--bord);font-size:10px;color:var(--txt2);font-weight:700}
.ck-d b{display:block;font-size:12.5px;color:var(--txt);margin-top:3px}
.ck-d.done{background:rgba(29,219,128,.12);border-color:rgba(29,219,128,.4);color:var(--p)}.ck-d.done b{color:var(--p)}
.ck-d.now{border-color:#ffd76a;box-shadow:0 0 0 2px rgba(255,215,106,.25);animation:ckP 1.6s infinite}
.ck-d.big{background:linear-gradient(160deg,rgba(255,215,106,.18),rgba(255,215,106,.04));border-color:rgba(255,215,106,.4)}
@keyframes ckP{50%{box-shadow:0 0 0 5px rgba(255,215,106,.12)}}
.coin-pop{position:fixed;left:50%;top:45%;font-size:46px;font-weight:900;color:#ffd76a;transform:translate(-50%,-50%);z-index:3100;text-shadow:0 6px 24px rgba(0,0,0,.6);animation:coin 1.4s ease-out forwards;pointer-events:none}
@keyframes coin{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}25%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-140%) scale(1)}}
/* spin */
.sp-wrap{position:relative;width:min(300px,78vw);aspect-ratio:1;margin:8px auto 18px}
.sp-wheel{width:100%;height:100%;border-radius:50%;transition:transform 4.6s cubic-bezier(.12,.62,.08,1);box-shadow:0 0 0 8px rgba(255,255,255,.06),0 0 0 10px rgba(255,215,106,.35),0 24px 60px rgba(0,0,0,.6)}
.sp-pin{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:26px solid #ffd76a;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5));z-index:2}
.sp-hub{position:absolute;inset:38%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3c4,#e8a317);display:flex;align-items:center;justify-content:center;font-weight:900;color:#3a2500;font-size:13px;box-shadow:0 6px 16px rgba(0,0,0,.45)}
.confetti{position:fixed;inset:0;pointer-events:none;z-index:3050;overflow:hidden}
.confetti i{position:absolute;top:-12px;width:8px;height:14px;border-radius:2px;animation:cf 1.9s ease-in forwards}
@keyframes cf{to{transform:translateY(105vh) rotate(720deg);opacity:.7}}
/* wallet */
.wl-card{border-radius:22px;padding:20px;position:relative;overflow:hidden;background:linear-gradient(135deg,#0c5a34,#0a3a26 55%,#0b1f2e);border:1px solid rgba(29,219,128,.35);box-shadow:0 18px 40px rgba(0,0,0,.45);margin-bottom:14px}
.wl-card::after{content:"";position:absolute;right:-40px;top:-40px;width:170px;height:170px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.14),transparent 70%)}
.wl-card small{color:#b9f5d6;font-size:12px;font-weight:700;letter-spacing:.5px}.wl-card .v{font-size:34px;font-weight:900;color:#fff;margin-top:4px}
.wl-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.wl-sum div{border-radius:14px;padding:10px;background:rgba(255,255,255,.035);border:1px solid var(--bord);text-align:center}
.wl-sum b{display:block;font-size:14px;color:var(--txt)}.wl-sum span{font-size:10.5px;color:var(--txt2)}
.wl-it{display:flex;gap:11px;align-items:center;padding:11px 0;border-bottom:1px solid var(--bord)}
.wl-it .ic{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex:none;font-size:15px}
.wl-it .m{flex:1;min-width:0}.wl-it .m b{display:block;font-size:13px;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wl-it .m small{font-size:11px;color:var(--txt2)}
.wl-it .a{font-weight:900;font-size:14px}.wl-it .a.p{color:var(--p)}.wl-it .a.n{color:var(--red)}
/* voucher ticket */
.vc-t{position:relative;border-radius:18px;padding:18px 18px 16px 22px;background:linear-gradient(120deg,#3b1d6e,#6b2fb3 60%,#b04bd6);color:#fff;margin:12px 0;box-shadow:0 14px 34px rgba(107,47,179,.35);overflow:hidden}
.vc-t::before,.vc-t::after{content:"";position:absolute;top:50%;width:22px;height:22px;border-radius:50%;background:var(--bg);transform:translateY(-50%)}
.vc-t::before{left:-11px}.vc-t::after{right:-11px}
.vc-t small{opacity:.8;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase}.vc-t .v{font-size:30px;font-weight:900}
.vc-t .c{margin-top:10px;padding-top:10px;border-top:2px dashed rgba(255,255,255,.35);font-family:monospace;font-size:18px;font-weight:800;letter-spacing:2px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.vc-t .c button{border:0;border-radius:10px;padding:7px 11px;background:rgba(255,255,255,.2);color:#fff;font-weight:800;font-size:12px;cursor:pointer}
.vc-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.vc-chips button{flex:1;min-width:70px;border-radius:12px;padding:11px 6px;border:1.5px solid var(--gbord);background:var(--glass);color:var(--txt);font-weight:800;font-family:inherit;cursor:pointer}
.vc-chips button.on{border-color:var(--p);background:rgba(29,219,128,.12);color:var(--p)}
/* VIP */
.vp-hero{border-radius:24px;padding:22px 18px;text-align:center;background:radial-gradient(140% 120% at 50% 0%,rgba(255,215,106,.28),rgba(6,13,26,0) 65%),linear-gradient(160deg,#1d1606,#0b0f1c);border:1px solid rgba(255,215,106,.35);margin-bottom:14px}
.vp-hero .cr{font-size:38px;filter:drop-shadow(0 6px 14px rgba(255,190,60,.5))}
.vp-hero h2{margin:6px 0 4px;font-size:21px;background:linear-gradient(90deg,#fff1c2,#ffcf4a,#fff1c2);-webkit-background-clip:text;background-clip:text;color:transparent}
.vp-hero p{color:#d9c79a;font-size:12.5px;margin:0;line-height:1.6}
.vp-vs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0 4px}
.vp-vs div{border-radius:14px;padding:11px;text-align:center;font-size:11px;color:var(--txt2);background:rgba(255,255,255,.035);border:1px solid var(--bord)}
.vp-vs b{display:block;font-size:17px;color:var(--txt);margin-top:2px}.vp-vs .vip{border-color:rgba(255,215,106,.5);background:rgba(255,215,106,.08)}.vp-vs .vip b{color:#ffd76a}
.vp-plan{position:relative;border-radius:20px;padding:16px;margin-bottom:11px;cursor:pointer;border:1.5px solid var(--bord);background:linear-gradient(160deg,var(--surf),var(--bg2));transition:.15s}
.vp-plan.on{border-color:#ffd76a;box-shadow:0 0 0 3px rgba(255,215,106,.18)}
.vp-plan .t{display:flex;align-items:center;gap:10px}.vp-plan .nm{font-size:16px;font-weight:900;color:var(--txt);flex:1}
.vp-plan .pr{font-size:21px;font-weight:900;color:#ffd76a}.vp-plan .du{font-size:11.5px;color:var(--txt2);margin-top:3px}
.vp-plan .bd{position:absolute;top:-9px;right:14px;font-size:9.5px;font-weight:900;padding:3px 8px;border-radius:8px;background:linear-gradient(135deg,#ffd76a,#f5a623);color:#3a2500}
.vp-plan.violet .nm{color:#d9b8ff}.vp-plan.black{background:linear-gradient(160deg,#17142a,#0a0a12);border-color:rgba(255,215,106,.3)}.vp-plan.black .nm{background:linear-gradient(90deg,#fff,#ffd76a);-webkit-background-clip:text;background-clip:text;color:transparent}
.vp-perk{display:flex;gap:9px;font-size:12.5px;color:var(--txt);padding:6px 0;line-height:1.5}.vp-perk i{color:#ffd76a;margin-top:3px}
.vp-term{display:flex;gap:9px;font-size:11.5px;color:var(--txt2);padding:4px 0;line-height:1.55}.vp-term i{color:var(--p);margin-top:3px}
.vp-active{border-radius:20px;padding:16px;margin-bottom:14px;background:linear-gradient(135deg,#3a2a05,#151005);border:1px solid rgba(255,215,106,.55);display:flex;gap:12px;align-items:center}
.vp-active .cr{font-size:28px}.vp-active b{color:#ffd76a;font-size:15px}.vp-active small{display:block;color:#d9c79a;font-size:11.5px;margin-top:2px}
.pay-w{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px}
.pay-w button{flex:1;min-width:88px;border-radius:12px;padding:10px 6px;border:1.5px solid var(--gbord);background:var(--glass);color:var(--txt);font-weight:800;font-size:12px;font-family:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px}
.pay-w button img{height:22px;max-width:70px;object-fit:contain}
.pay-w button.on{border-color:var(--p);background:rgba(29,219,128,.1)}
.pay-num{display:flex;align-items:center;justify-content:space-between;gap:10px;border-radius:14px;padding:12px 14px;background:rgba(29,219,128,.08);border:1px dashed rgba(29,219,128,.45);margin-bottom:6px}
.pay-num b{font-size:18px;letter-spacing:1px;font-family:monospace;color:var(--txt)}.pay-num small{display:block;font-size:11px;color:var(--txt2)}
.pay-num button{border:0;border-radius:10px;padding:8px 12px;background:var(--p);color:#03210f;font-weight:800;cursor:pointer}
.ord{border-radius:14px;padding:11px 13px;margin-bottom:8px;border:1px solid var(--bord);background:rgba(255,255,255,.03);font-size:12.5px;color:var(--txt2);display:flex;gap:10px;align-items:center}
.ord b{color:var(--txt)}.ord .st{margin-left:auto;font-size:10.5px;font-weight:900;padding:3px 8px;border-radius:8px}
.st-Pending{background:rgba(255,140,66,.15);color:var(--orange)}.st-Approved{background:rgba(29,219,128,.15);color:var(--p)}.st-Rejected{background:rgba(255,77,106,.15);color:var(--red)}
/* verified */
.vf-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:900;padding:3px 8px;border-radius:9px;background:linear-gradient(135deg,#1da1f2,#0d6efd);color:#fff;vertical-align:middle;margin-left:6px;box-shadow:0 3px 10px rgba(13,110,253,.35)}
.vip-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:900;padding:3px 8px;border-radius:9px;background:linear-gradient(135deg,#ffe08a,#f2a91d);color:#3a2500;vertical-align:middle;margin-left:6px}
.vf-hero{text-align:center;padding:22px 16px;border-radius:22px;background:radial-gradient(130% 120% at 50% 0%,rgba(29,161,242,.25),rgba(6,13,26,0) 70%),var(--surf);border:1px solid rgba(29,161,242,.35);margin-bottom:14px}
.vf-hero .ic{width:64px;height:64px;margin:0 auto 8px;border-radius:50%;background:linear-gradient(135deg,#1da1f2,#0d6efd);display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;box-shadow:0 10px 26px rgba(13,110,253,.45)}
.vf-hero h2{margin:0 0 4px;font-size:19px;color:var(--txt)}.vf-hero p{margin:0;color:var(--txt2);font-size:12.5px;line-height:1.6}
.vf-why{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0}
.vf-why div{border-radius:14px;padding:11px 6px;text-align:center;font-size:10.5px;color:var(--txt2);background:rgba(255,255,255,.035);border:1px solid var(--bord)}
.vf-why i{display:block;font-size:18px;color:#46b0ff;margin-bottom:5px}
/* promo on the fee page */
.pr-box{border-radius:16px;border:1px dashed rgba(168,85,247,.45);background:rgba(168,85,247,.06);padding:12px;margin:12px 0}
.pr-box .h{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:var(--txt);cursor:pointer}
.pr-box .h i{color:#c085ff}.pr-box .h em{margin-left:auto;font-style:normal;font-size:11px;color:var(--txt2)}
.pr-box .f{display:none;gap:8px;margin-top:10px}.pr-box.open .f{display:flex}
.pr-box .f input{flex:1;min-width:0;height:44px;border-radius:12px;border:1.5px solid var(--gbord);background:rgba(255,255,255,.05);color:var(--txt);padding:0 12px;font-family:monospace;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;outline:none}
.pr-box .f button{border:0;border-radius:12px;padding:0 16px;background:linear-gradient(135deg,#b06bff,#7a3ff2);color:#fff;font-weight:800;font-family:inherit;cursor:pointer}
.pr-ok{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--txt)}
.pr-ok b{font-family:monospace;letter-spacing:1px;color:#d9b8ff}.pr-ok span{color:var(--p);font-weight:800}.pr-ok button{margin-left:auto;border:0;background:none;color:var(--txt2);font-size:12px;text-decoration:underline;cursor:pointer}
.sv-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

/* ───────── Bangla words for the new pages (Language switch) ───────── */
try { if(typeof BN === 'object') Object.assign(BN, {
  'All Services': 'সব সার্ভিস', 'Daily Check-in': 'ডেইলি চেক-ইন', 'Spin & Win': 'স্পিন করে জিতুন', 'Wallet': 'ওয়ালেট', 'Cashback Wallet': 'ক্যাশব্যাক ওয়ালেট', 'Redeem Code': 'রিডিম কোড',
  'Gift Voucher': 'গিফট ভাউচার', 'VIP Express': 'ভিআইপি এক্সপ্রেস', 'Verify Number': 'নম্বর ভেরিফাই', 'Rewards': 'রিওয়ার্ড', 'Premium': 'প্রিমিয়াম', 'Loans': 'লোন',
  'Calculator': 'ক্যালকুলেটর', 'Refer & Earn': 'রেফার করে আয়', 'History': 'ইতিহাস', 'Profile': 'প্রোফাইল', 'Check in now': 'এখনই চেক-ইন', 'Spin now': 'এখনই স্পিন করুন',
  'Redeem': 'রিডিম', 'Create voucher': 'ভাউচার তৈরি', 'My vouchers': 'আমার ভাউচার', 'Choose your plan': 'প্ল্যান বেছে নিন', 'Get VIP': 'ভিআইপি নিন', 'Apply code': 'কোড দিন',
  'Have a promo code?': 'প্রোমো কোড আছে?', 'Apply': 'প্রয়োগ', 'Remove': 'সরান', 'Balance': 'ব্যালেন্স', 'How to pay': 'কীভাবে পেমেন্ট করবেন', 'Submit payment': 'পেমেন্ট জমা দিন',
  'Transaction ID (TrxID)': 'ট্রানজেকশন আইডি (TrxID)', 'Paid from number': 'যে নম্বর থেকে পাঠিয়েছেন', 'My requests': 'আমার অনুরোধ', 'Copy': 'কপি', 'Share': 'শেয়ার'
}); } catch (e) {}

/* ───────── data ───────── */
const SV = { cfg: null, st: null, cfgP: null };
function loadCfg(){ if(!SV.cfgP) SV.cfgP = fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'svcConfig' }) }).then(r => r.json()).then(j => (SV.cfg = j || {})).catch(() => (SV.cfg = {})); return SV.cfgP; }
async function loadState(){ if(!user()) return null; const r = await api('svcState'); SV.st = r.ok ? r.data : null; badges(); return SV.st; }

/* ───────── services list ───────── */
const T = {
  calc:     { l: 'Calculator', ic: 'calculator', g: 'g-blue', cat: 'loans', go: () => window.openCalculator && openCalculator() },
  refer:    { l: 'Refer & Earn', ic: 'user-plus', g: 'g-orange', cat: 'rewards', go: () => window.openReferModal && openReferModal() },
  history:  { l: 'History', ic: 'clock-rotate-left', g: 'g-purple', cat: 'loans', go: () => window.openHistoryModal && openHistoryModal() },
  profile:  { l: 'Profile', ic: 'user', g: 'g-green', cat: 'account', go: () => window.openProfileModal && openProfileModal() },
  vip:      { l: 'VIP Express', ic: 'crown', g: 'g-gold', cat: 'premium', badge: 'VIP', gold: true, login: true, page: 'vip' },
  verify:   { l: 'Verify Number', ic: 'circle-check', g: 'g-cyan', cat: 'premium', login: true, page: 'verify' },
  checkin:  { l: 'Daily Check-in', ic: 'calendar-check', g: 'g-green', cat: 'rewards', login: true, page: 'checkin' },
  spin:     { l: 'Spin & Win', ic: 'dharmachakra', g: 'g-pink', cat: 'rewards', badge: 'HOT', login: true, page: 'spin' },
  wallet:   { l: 'Wallet', ic: 'wallet', g: 'g-teal', cat: 'rewards', login: true, page: 'wallet' },
  redeem:   { l: 'Redeem Code', ic: 'ticket', g: 'g-purple', cat: 'rewards', login: true, page: 'redeem' },
  voucher:  { l: 'Gift Voucher', ic: 'gift', g: 'g-red', cat: 'rewards', login: true, page: 'voucher' },
  all:      { l: 'All Services', ic: 'grip', g: 'g-slate', cat: '', page: 'all' }
};
// other parts of the app (loan tools, help pages) add their own tiles here
window._svcTiles = T;
window._svcPages = window._svcPages || {};
const CATS = [['premium', 'Premium', 'crown'], ['rewards', 'Rewards', 'gift'], ['loans', 'Loans', 'hand-holding-dollar'], ['help', 'Help & Info', 'circle-question'], ['account', 'Account', 'user']];
const HOME_DEF = ['vip', 'checkin', 'spin', 'wallet', 'calc', 'refer', 'history', 'all'];

function tileCfg(k){ const h = (SV.cfg && SV.cfg.hub && SV.cfg.hub.tiles) || {}; return h[k] || {}; }
function tileOn(k){ const t = T[k]; if(!t) return false; if(k === 'all') return true; const c = tileCfg(k); if(c.on === false) return false;
  const C = SV.cfg || {}; if(k === 'vip' && C.vip && C.vip.on === false) return false; if(k === 'verify' && C.verify && C.verify.on === false) return false;
  if(k === 'checkin' && C.checkin && C.checkin.on === false) return false; if(k === 'spin' && C.spin && C.spin.on === false) return false;
  if(k === 'voucher' && C.voucher && C.voucher.on === false) return false; if(k === 'redeem' && C.codes && C.codes.redeem === false) return false; return true; }
function tileHtml(k){
  const t = T[k], c = tileCfg(k), badge = c.badge !== undefined ? c.badge : (t.badge || '');
  const dot = (k === 'checkin' && SV.st && SV.st.checkin && !SV.st.checkin.doneToday) || (k === 'spin' && SV.st && SV.st.spin && SV.st.spin.canSpin);
  return `<div class="sv-tile" onclick="svGo('${k}')">${badge ? `<em class="sv-bdg${t.gold ? ' gold' : ''}">${E(badge)}</em>` : dot ? '<em class="sv-dot"></em>' : ''}<div class="sv-ic ${t.g}"><i class="fa-solid fa-${t.ic}"></i></div><span>${E(c.label || t.l)}</span></div>`;
}
function renderHub(){
  const g = document.querySelector('.qa-grid'); if(!g) return;
  const order = (SV.cfg && SV.cfg.hub && Array.isArray(SV.cfg.hub.home) && SV.cfg.hub.home.length) ? SV.cfg.hub.home : HOME_DEF;
  let keys = order.filter(k => k !== 'all' && tileOn(k)).slice(0, 7);
  keys.push('all');
  g.classList.add('sv-hub');
  g.innerHTML = keys.map(tileHtml).join('');
}
window.svRenderHub = renderHub;

/* ───────── the full-screen sheet ───────── */
let _stack = [];
function sheet(){
  let s = $s('svSheet');
  if(!s){ s = document.createElement('div'); s.id = 'svSheet'; s.className = 'sv-sheet'; s.innerHTML = '<div class="sv-wrap"><div class="sv-head"><button onclick="svBack()" aria-label="Back"><i class="fa-solid fa-arrow-left"></i></button><h3 id="svTitle"></h3></div><div class="sv-body" id="svBody"></div></div>'; document.body.appendChild(s); }
  return s;
}
function show(title, html){ sheet().classList.add('on'); $s('svTitle').textContent = title; $s('svBody').innerHTML = html; $s('svBody').scrollTop = 0; document.body.style.overflow = 'hidden'; }
window.svGo = function(k){
  const t = T[k]; if(!t) return;
  if(t.login && !user()){ if(window.nav) nav('screen-login'); return; }
  if(!t.page){ svClose(); return t.go && t.go(); }
  _stack.push(k); try { history.pushState({ sv: k }, ''); } catch (e) {}
  open(k);
};
function open(k){ const P = PAGES[k] || window._svcPages[k]; if(P) P(); }
window.svBack = function(){ try { if(history.state && history.state.sv) { history.back(); return; } } catch (e) {} _pop(); };
function _pop(){ _stack.pop(); const k = _stack[_stack.length - 1]; if(k) open(k); else svClose(true); }
window.svClose = function(silent){ const s = $s('svSheet'); if(s) s.classList.remove('on'); document.body.style.overflow = ''; _stack = []; renderHub(); };
window.addEventListener('popstate', () => { if($s('svSheet') && $s('svSheet').classList.contains('on')) _pop(); });
window._svShow = show; window._svApi = api; window._svToast = toast; window._svE = E; window._svTk = tk; window._svCfg = () => SV.cfg || {}; window._svLoadCfg = loadCfg;

/* ───────── effects ───────── */
function confetti(){ const c = document.createElement('div'); c.className = 'confetti'; const cols = ['#1ddb80', '#ffd76a', '#ff6fa5', '#4d8fff', '#b06bff', '#ff8c42'];
  for(let i = 0; i < 70; i++){ const p = document.createElement('i'); p.style.left = Math.random() * 100 + 'vw'; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * .5 + 's'; p.style.animationDuration = 1.4 + Math.random() * 1.2 + 's'; c.appendChild(p); }
  document.body.appendChild(c); setTimeout(() => c.remove(), 3200); }
function coin(txt){ const c = document.createElement('div'); c.className = 'coin-pop'; c.textContent = txt; document.body.appendChild(c); setTimeout(() => c.remove(), 1500); }
function setBal(v){ if(v === null || v === undefined) return; try { if(window._setBalance) window._setBalance(v); } catch (e) {} if(SV.st) SV.st.balance = v; }
const loading = '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>';

/* ───────── pages ───────── */
const PAGES = {
  all(){
    const html = CATS.map(([c, name, ic]) => { const ks = Object.keys(T).filter(k => T[k].cat === c && tileOn(k)); if(!ks.length) return '';
      return `<div class="sv-cat"><i class="fa-solid fa-${ic}"></i> ${name}</div><div class="qa-grid sv-hub" style="margin:0">${ks.map(tileHtml).join('')}</div>`; }).join('');
    show('All Services', html);
  },

  async checkin(){
    show('Daily Check-in', loading);
    await loadCfg(); const s = await loadState();
    const R = (SV.cfg.checkin && SV.cfg.checkin.rewards) || [1, 1, 2, 2, 3, 3, 10];
    if(!s){ show('Daily Check-in', '<div class="sv-empty">Please login again.</div>'); return; }
    const c = s.checkin, done = c.doneToday, streak = c.streak;
    const days = R.map((v, i) => { const n = i + 1, isDone = done ? n <= streak : n <= streak, isNow = !done && n === streak + 1;
      return `<div class="ck-d ${isDone ? 'done' : ''} ${isNow ? 'now' : ''} ${n === 7 ? 'big' : ''}">Day ${n}<b>${isDone ? '<i class="fa-solid fa-check"></i>' : tk(v)}</b></div>`; }).join('');
    show('Daily Check-in', `<div class="ck-hero"><div style="font-size:13px;color:var(--txt2);font-weight:700">Your streak</div><div class="n">${streak} <span style="font-size:16px">day${streak === 1 ? '' : 's'}</span></div><small>${done ? 'Checked in today ✓ Come back tomorrow to keep the streak.' : `Check in today and get <b style="color:#ffd76a">${tk(c.next)}</b> in your balance.`}</small></div>
      <div class="ck-days">${days}</div>
      <button class="sv-btn ${done ? 'ghost' : 'gold'}" id="ckBtn" ${done ? 'disabled' : ''} onclick="svCheckin()"><i class="fa-solid fa-${done ? 'check' : 'hand-sparkles'}"></i>${done ? 'Checked in today' : 'Check in now'}</button>
      <div class="sv-card" style="margin-top:14px"><h4><i class="fa-solid fa-circle-info" style="color:var(--p)"></i> How it works</h4><p>Open the app and check in once a day. Each day in a row gives a bigger reward, and day 7 gives the biggest. Miss a day and the streak starts again. Rewards go straight to your balance — see them in your Wallet.</p></div>`);
  },

  async spin(){
    show('Spin & Win', loading);
    await loadCfg(); const s = await loadState();
    const P = (SV.cfg.spin && SV.cfg.spin.prizes) || [];
    if(!P.length || !s){ show('Spin & Win', '<div class="sv-empty">Spin & Win is not ready yet.</div>'); return; }
    const n = P.length, seg = 360 / n;
    const grad = P.map((p, i) => `${p.color || ['#1ddb80', '#4d8fff', '#ff8c42', '#a855f7', '#ff6fa5', '#ffc94d'][i % 6]} ${i * seg}deg ${(i + 1) * seg}deg`).join(',');
    const labels = P.map((p, i) => `<div style="position:absolute;inset:0;transform:rotate(${i * seg + seg / 2}deg)"><span style="position:absolute;left:50%;top:8%;transform:translateX(-50%);font-size:${n > 8 ? 10 : 12.5}px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7);white-space:nowrap;max-width:34%;overflow:hidden;text-overflow:ellipsis">${E(p.label)}</span></div>`).join('');
    const per = { day: 'once a day', week: 'once a week', month: 'once a month' }[SV.cfg.spin.period] || 'once a month';
    const can = s.spin.canSpin;
    show('Spin & Win', `<div style="text-align:center;color:var(--txt2);font-size:12.5px;margin-bottom:6px">Spin <b style="color:var(--txt)">${per}</b> for a chance to win balance rewards.</div>
      <div class="sp-wrap"><div class="sp-pin"></div><div class="sp-wheel" id="spW" style="background:conic-gradient(${grad})">${labels}</div><div class="sp-hub">SPIN</div></div>
      <button class="sv-btn gold" id="spBtn" ${can ? '' : 'disabled'} onclick="svSpin()"><i class="fa-solid fa-dharmachakra"></i>${can ? 'Spin now' : 'Next spin ' + fdate(s.spin.nextAt)}</button>
      ${s.spin.lastPrize ? `<div style="text-align:center;margin-top:10px;font-size:12px;color:var(--txt2)">Last time you got: <b style="color:var(--txt)">${E(s.spin.lastPrize)}</b></div>` : ''}
      <div class="sv-card" style="margin-top:14px"><h4>Fair play</h4><p>The result is decided on our server the moment you spin, so it cannot be changed. Balance prizes are added to your wallet right away.</p></div>`);
    window._spinN = n; window._spinP = P;
  },

  async wallet(){
    show('Cashback Wallet', loading);
    const r = await api('walletHistory');
    if(!r.ok){ show('Cashback Wallet', `<div class="sv-empty">${E(r.data.error || 'Could not load.')}</div>`); return; }
    const L = r.data.list || [];
    const sum = t => L.filter(x => t(x)).reduce((a, x) => a + Number(x.amount || 0), 0);
    const earned = sum(x => x.amount > 0 && !['voucher-back'].includes(x.type)), spent = -sum(x => x.amount < 0);
    const META = { bonus: ['gift', 'g-orange', 'Bonus'], checkin: ['calendar-check', 'g-green', 'Check-in'], spin: ['dharmachakra', 'g-pink', 'Spin & Win'], redeem: ['ticket', 'g-purple', 'Redeem code'],
      voucher: ['gift', 'g-red', 'Gift voucher'], 'voucher-sent': ['paper-plane', 'g-red', 'Voucher sent'], 'voucher-back': ['rotate-left', 'g-slate', 'Voucher returned'], fee: ['receipt', 'g-blue', 'Used for fee'],
      admin: ['user-shield', 'g-slate', 'Adjustment'], referral: ['user-plus', 'g-orange', 'Referral bonus'], cashback: ['coins', 'g-gold', 'Cashback'] };
    const items = L.map(x => { const m = META[x.type] || ['coins', 'g-teal', 'Wallet']; const pos = Number(x.amount) >= 0;
      return `<div class="wl-it"><div class="ic sv-ic ${m[1]}" style="width:38px;height:38px"><i class="fa-solid fa-${m[0]}"></i></div><div class="m"><b>${E(x.note || m[2])}</b><small>${m[2]} · ${ftime(x.at)}</small></div><div class="a ${pos ? 'p' : 'n'}">${pos ? '+' : '−'}${tk(Math.abs(x.amount))}</div></div>`; }).join('');
    show('Cashback Wallet', `<div class="wl-card"><small>AVAILABLE BALANCE</small><div class="v">${tk(r.data.balance)}</div><div style="font-size:11.5px;color:#b9f5d6;margin-top:6px">Use up to ৳100 on a fee payment, or send it as a gift voucher.</div></div>
      <div class="wl-sum"><div><b style="color:var(--p)">${tk(earned)}</b><span>Earned</span></div><div><b style="color:var(--red)">${tk(spent)}</b><span>Used</span></div><div><b>${L.length}</b><span>Entries</span></div></div>
      <div class="sv-two" style="margin-bottom:14px"><button class="sv-btn ghost" onclick="svGo('redeem')"><i class="fa-solid fa-ticket"></i>Redeem</button><button class="sv-btn ghost" onclick="svGo('voucher')"><i class="fa-solid fa-gift"></i>Gift</button></div>
      <div class="sv-cat">History</div>${items || '<div class="sv-empty"><i class="fa-solid fa-receipt"></i>No wallet activity yet. Check in daily or spin to start earning!</div>'}
      <div style="font-size:11px;color:var(--txt3);text-align:center;margin-top:12px">History is shown from when the wallet started.</div>`);
  },

  redeem(){
    show('Redeem Code', `<div class="sv-card" style="text-align:center;background:radial-gradient(120% 120% at 50% 0%,rgba(168,85,247,.25),rgba(6,13,26,0) 70%),var(--surf);border-color:rgba(168,85,247,.35)">
      <div class="sv-ic g-purple" style="width:60px;height:60px;margin:0 auto 10px;font-size:26px;border-radius:18px"><i class="fa-solid fa-ticket"></i></div><h4>Got a code?</h4><p>Enter a redeem code or a gift voucher from a friend. The amount goes straight to your balance.</p></div>
      <input class="sv-in code" id="rdIn" placeholder="ENTER CODE" maxlength="24" autocomplete="off">
      <button class="sv-btn" style="margin-top:12px" id="rdBtn" onclick="svRedeem()"><i class="fa-solid fa-gift"></i>Redeem</button>
      <div class="sv-card" style="margin-top:14px"><p><i class="fa-solid fa-circle-info"></i> Promo codes that give a discount on your fee are entered on the fee payment page.</p></div>`);
  },

  async voucher(){
    show('Gift Voucher', loading);
    await loadCfg(); const s = await loadState();
    const V = SV.cfg.voucher || { min: 50, max: 1000, days: 30 };
    const chips = [50, 100, 200, 500].filter(v => v >= V.min && v <= V.max);
    const r = await api('myVouchers'); const mine = r.ok ? r.data.list : [];
    show('Gift Voucher', `<div class="vc-t"><small>Creditfy gift voucher</small><div class="v" id="vcPrev">${tk(chips[0] || V.min)}</div><div style="font-size:12px;opacity:.85">Send balance to a friend as a gift code</div><div class="c"><span>GIFT-••••••••</span></div></div>
      <span class="sv-lbl">Amount (your balance: ${tk(s ? s.balance : 0)})</span>
      <div class="vc-chips">${chips.map((v, i) => `<button class="${i === 0 ? 'on' : ''}" onclick="svVcAmt(${v},this)">${tk(v)}</button>`).join('')}</div>
      <input class="sv-in" id="vcAmt" type="number" min="${V.min}" max="${V.max}" value="${chips[0] || V.min}" style="margin-top:8px" oninput="document.getElementById('vcPrev').textContent='৳'+(Number(this.value)||0).toLocaleString('en-US');document.querySelectorAll('.vc-chips button').forEach(b=>b.classList.remove('on'))">
      <span class="sv-lbl">Message (optional)</span><input class="sv-in" id="vcMsg" maxlength="120" placeholder="e.g. Happy Eid! 🎉">
      <button class="sv-btn" style="margin-top:12px" onclick="svVoucher()"><i class="fa-solid fa-gift"></i>Create voucher</button>
      <div style="font-size:11.5px;color:var(--txt2);margin-top:8px;text-align:center">From ${tk(V.min)} to ${tk(V.max)} · valid ${V.days} days · unused vouchers can be cancelled and the money comes back.</div>
      <div id="vcNew"></div>
      <div class="sv-cat">My vouchers</div>${mine.length ? mine.map(v => `<div class="ord"><i class="fa-solid fa-gift" style="color:#d9b8ff"></i><div><b style="font-family:monospace">${E(v.code)}</b><br>${tk(v.value)} · ${v.refunded ? 'cancelled' : v.used ? 'used by a friend' : 'valid till ' + fdate(v.end)}</div>${!v.used && !v.refunded ? `<button class="sv-btn ghost" style="width:auto;padding:8px 10px;font-size:11.5px;margin-left:auto" onclick="svVcBack('${E(v.code)}')">Cancel</button>` : `<span class="st ${v.used ? 'st-Approved' : 'st-Rejected'}">${v.used ? 'USED' : 'CANCELLED'}</span>`}</div>`).join('') : '<div class="sv-empty" style="padding:12px">No vouchers yet.</div>'}`);
  },

  async vip(){
    show('VIP Express', loading);
    await loadCfg(); const s = await loadState();
    const V = SV.cfg.vip || {}; const plans = (V.plans || []).filter(p => p.on !== false);
    const act = s && s.vip, pend = s && (s.orders || []).find(o => o.kind === 'vip' && o.status === 'Pending');
    const dur = p => p.days > 0 ? (p.days % 365 === 0 ? `${p.days / 365} year${p.days > 365 ? 's' : ''}` : `${p.days} days`) : 'Lifetime';
    window._vipSel = window._vipSel || (plans[1] || plans[0] || {}).id;
    show('VIP Express', `${act ? `<div class="vp-active"><div class="cr">👑</div><div><b>${E(act.name)} active</b><small>${act.until ? 'Valid until ' + fdate(act.until) : 'Lifetime membership'} · express ${V.hours || 72}-hour service</small></div></div>` : ''}
      <div class="vp-hero"><div class="cr">👑</div><h2>Creditfy VIP Express</h2><p>Get your loan approved and sent within <b style="color:#ffd76a">${V.hours || 72} hours</b> — or your VIP fee back.</p>
        <div class="vp-vs"><div>Normal service<b>${E(V.normal || '7–15 days')}</b></div><div class="vip">VIP Express<b>${V.hours || 72} hours</b></div></div></div>
      ${pend ? `<div class="ord"><i class="fa-solid fa-hourglass-half" style="color:var(--orange)"></i><div><b>${E(pend.planName)}</b> request is being checked<br>TrxID ${E(pend.trxId)} · ${ftime(pend.createdAt)}</div><span class="st st-Pending">PENDING</span></div>` : ''}
      <div class="sv-cat">Choose your plan</div>
      ${plans.map((p, i) => `<div class="vp-plan ${p.color || ''} ${window._vipSel === p.id ? 'on' : ''}" onclick="window._vipSel='${E(p.id)}';document.querySelectorAll('.vp-plan').forEach(x=>x.classList.toggle('on',x.dataset.id==='${E(p.id)}'))" data-id="${E(p.id)}">
        ${i === 1 ? '<span class="bd">MOST POPULAR</span>' : p.days === 0 ? '<span class="bd">BEST VALUE</span>' : ''}
        <div class="t"><div style="font-size:22px">${p.days === 0 ? '💎' : i === 1 ? '🌟' : '👑'}</div><div class="nm">${E(p.name)}</div><div class="pr">${tk(p.price)}</div></div>
        <div class="du">${dur(p)} · one-time payment${p.days > 0 ? ` · ≈ ${tk(Math.ceil(p.price / (p.days / 30)))} / month` : ' · never expires'}</div></div>`).join('')}
      <div class="sv-card"><h4>What you get</h4>${(V.perks || []).map(t => `<div class="vp-perk"><i class="fa-solid fa-star"></i><span>${E(t)}</span></div>`).join('')}</div>
      <div class="sv-card"><h4><i class="fa-solid fa-shield-halved" style="color:var(--p)"></i> Our promise</h4>${(V.terms || []).map(t => `<div class="vp-term"><i class="fa-solid fa-circle-check"></i><span>${E(t)}</span></div>`).join('')}</div>
      ${pend ? '' : `<button class="sv-btn gold" onclick="svPay('vip')"><i class="fa-solid fa-crown"></i>Get VIP</button>`}`);
  },

  async verify(){
    show('Verify Number', loading);
    await loadCfg(); const s = await loadState();
    const V = SV.cfg.verify || { price: 100 };
    const u = user() || {};
    const pend = s && (s.orders || []).find(o => o.kind === 'verify' && o.status === 'Pending');
    if(s && s.verified){ show('Verify Number', `<div class="vf-hero"><div class="ic"><i class="fa-solid fa-check"></i></div><h2>Your number is verified</h2><p>0${E(u.phone)} <span class="vf-badge"><i class="fa-solid fa-circle-check"></i>Verified</span><br>Since ${fdate(s.verifiedAt)}</p></div><div class="sv-card"><p>Your applications show the Verified badge to our review team.</p></div>`); return; }
    show('Verify Number', `<div class="vf-hero"><div class="ic"><i class="fa-solid fa-circle-check"></i></div><h2>${E(V.title || 'Get a Verified badge')}</h2><p>${E(V.text || '')}</p></div>
      <div class="vf-why"><div><i class="fa-solid fa-arrow-trend-up"></i>Better approval chance</div><div><i class="fa-solid fa-user-shield"></i>Trusted profile</div><div><i class="fa-solid fa-certificate"></i>Blue badge</div></div>
      <div class="sv-card"><div class="sv-row"><span>Your number</span><b>0${E(u.phone || '')}</b></div><div class="sv-row"><span>One-time fee</span><b>${tk(V.price)}</b></div><div class="sv-row" style="border:0"><span>Pay from</span><b>Your own number only</b></div></div>
      ${pend ? `<div class="ord"><i class="fa-solid fa-hourglass-half" style="color:var(--orange)"></i><div><b>Verification</b> is being checked<br>TrxID ${E(pend.trxId)} · ${ftime(pend.createdAt)}</div><span class="st st-Pending">PENDING</span></div>` : `<button class="sv-btn" style="background:linear-gradient(135deg,#46b0ff,#0d6efd);color:#fff" onclick="svPay('verify')"><i class="fa-solid fa-circle-check"></i>Verify for ${tk(V.price)}</button>`}`);
  },

  // pay for VIP or the badge: the user sends money to one of the fee numbers, then gives the TrxID
  pay(){
    const kind = window._payKind, V = SV.cfg || {};
    const plans = ((V.vip || {}).plans || []).filter(p => p.on !== false);
    const plan = kind === 'vip' ? (plans.find(p => p.id === window._vipSel) || plans[1] || plans[0]) : null;
    if(kind === 'vip' && !plan){ show('Payment', '<div class="sv-empty">No VIP plan is available right now.</div>'); return; }
    if(plan) window._vipSel = plan.id;
    const price = kind === 'vip' ? (plan ? plan.price : 0) : V.verify.price;
    const ws = (window._feeWallets || []).map(w => ({ w, opts: Array.isArray(w.methods) && w.methods.length ? w.methods.filter(o => o && o.number) : [{ type: w.payMethod || 'Send Money', number: w.collectionNumber || w.paymentNumber }] })).filter(x => x.opts.length && x.opts[0].number);
    if(!ws.length){ show('Payment', '<div class="sv-empty">No payment number is available right now. Please contact support.</div>'); return; }
    window._payW = window._payW || 0; if(!ws[window._payW]) window._payW = 0;
    const cur = ws[window._payW], opt = cur.opts[0];
    const u = user() || {};
    show(kind === 'vip' ? `${plan ? plan.name : 'VIP'} payment` : 'Verification payment', `
      <div class="sv-card" style="text-align:center"><div style="font-size:12px;color:var(--txt2)">Amount to send</div><div style="font-size:34px;font-weight:900;color:${kind === 'vip' ? '#ffd76a' : '#46b0ff'}">${tk(price)}</div><div style="font-size:12px;color:var(--txt2)">${kind === 'vip' ? E(plan.name) + ' · one-time' : 'Verified badge · one-time'}</div></div>
      <span class="sv-lbl">1. Choose how to pay</span>
      <div class="pay-w">${ws.map((x, i) => `<button class="${i === window._payW ? 'on' : ''}" onclick="window._payW=${i};svPage('pay')">${x.w.logoUrl ? `<img src="${E(x.w.logoUrl)}" alt="">` : '<i class="fa-solid fa-wallet"></i>'}${E(x.w.name)}</button>`).join('')}</div>
      <span class="sv-lbl">2. ${E(opt.type || 'Send Money')} ${tk(price)} to this number</span>
      <div class="pay-num"><div><small>${E(cur.w.name)} · ${E(opt.type || 'Send Money')}</small><b>${E(opt.number)}</b></div><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${E(opt.number)}').then(()=>svToastOk('Number copied'))">Copy</button></div>
      ${kind === 'verify' ? `<div style="font-size:11.5px;color:var(--orange);margin:6px 2px"><i class="fa-solid fa-triangle-exclamation"></i> Send from your own number <b>0${E(u.phone)}</b> — that is how we verify it.</div>` : ''}
      <span class="sv-lbl">3. Enter the payment details</span>
      <input class="sv-in code" id="pyTrx" placeholder="TRANSACTION ID" maxlength="30" autocomplete="off">
      <input class="sv-in" id="pySender" type="tel" placeholder="Paid from number (01XXXXXXXXX)" value="${kind === 'verify' ? '0' + E(u.phone) : ''}" ${kind === 'verify' ? 'readonly' : ''} style="margin-top:8px">
      <button class="sv-btn ${kind === 'vip' ? 'gold' : ''}" style="margin-top:12px" id="pyBtn" onclick="svPaySubmit()"><i class="fa-solid fa-paper-plane"></i>Submit payment</button>
      <div style="font-size:11.5px;color:var(--txt2);margin-top:9px;text-align:center;line-height:1.6">Our team checks the payment and switches it on — usually within a few hours. You get a notification.</div>`);
    window._payData = { kind, plan: plan ? plan.id : '', price, payMethod: cur.w.name, toNumber: opt.number };
  }
};
window.svPage = k => { const P = PAGES[k] || window._svcPages[k]; if(P) P(); };
window.svToastOk = m => toast(m);

/* ───────── actions ───────── */
window.svCheckin = async function(){
  const b = $s('ckBtn'); if(b){ b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Checking in…'; }
  const r = await api('checkin');
  if(!r.ok){ toast(r.data.error || 'Could not check in', true); PAGES.checkin(); return; }
  if(r.data.reward > 0){ coin('+' + tk(r.data.reward)); confetti(); setBal(r.data.balance); }
  toast(`Day ${r.data.streak} done${r.data.reward ? ' · +' + tk(r.data.reward) : ''}!`);
  setTimeout(() => PAGES.checkin(), 900);
};
window.svSpin = async function(){
  const b = $s('spBtn'); if(!b || b.disabled) return; b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Spinning…';
  const r = await api('spin');
  if(!r.ok){ toast(r.data.error || 'Could not spin', true); PAGES.spin(); return; }
  const P = window._spinP || [], n = window._spinN || 1, i = Math.max(0, P.findIndex(p => p.id === r.data.prize.id)), seg = 360 / n;
  const target = 360 * 6 + (360 - (i * seg + seg / 2)) + (Math.random() * seg * .5 - seg * .25);
  const w = $s('spW'); if(w) w.style.transform = `rotate(${target}deg)`;
  setTimeout(() => {
    const won = r.data.prize.type !== 'none';
    if(won){ confetti(); if(r.data.prize.value) coin('+' + tk(r.data.prize.value)); setBal(r.data.balance); }
    toast(won ? `You won ${r.data.prize.label}! 🎉` : `${r.data.prize.label} — try again next time!`, !won);
    if(b) b.innerHTML = '<i class="fa-solid fa-dharmachakra"></i>Next spin ' + fdate(r.data.nextAt);
    loadState();
  }, 4800);
};
window.svRedeem = async function(){
  const code = ($s('rdIn').value || '').trim(); if(!code){ toast('Enter a code', true); return; }
  const b = $s('rdBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Checking…';
  const r = await api('redeemCode', { code });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-gift"></i>Redeem';
  if(!r.ok){ toast(r.data.error || 'Code not valid', true); return; }
  confetti(); coin('+' + tk(r.data.amount)); setBal(r.data.balance); $s('rdIn').value = '';
  toast(`${tk(r.data.amount)} added to your balance!${r.data.message ? ' “' + r.data.message + '”' : ''}`);
};
window.svVcAmt = (v, el) => { $s('vcAmt').value = v; $s('vcPrev').textContent = tk(v); document.querySelectorAll('.vc-chips button').forEach(b => b.classList.toggle('on', b === el)); };
window.svVoucher = async function(){
  const amount = Number($s('vcAmt').value) || 0;
  const r = await api('giftVoucher', { amount, message: $s('vcMsg').value });
  if(!r.ok){ toast(r.data.error || 'Could not create', true); return; }
  setBal(null); loadState();
  const msg = `🎁 A Creditfy gift for you: ${tk(r.data.amount)}! Open Creditfy → Redeem Code and enter ${r.data.code} (valid till ${fdate(r.data.end)}). ${location.origin}`;
  $s('vcNew').innerHTML = `<div class="vc-t"><small>Your new voucher</small><div class="v">${tk(r.data.amount)}</div><div style="font-size:12px;opacity:.85">Valid till ${fdate(r.data.end)}</div><div class="c"><span>${E(r.data.code)}</span><span style="display:flex;gap:6px"><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${E(r.data.code)}').then(()=>svToastOk('Code copied'))">Copy</button><button onclick='svShare(${JSON.stringify(msg)})'>Share</button></span></div></div>`;
  confetti(); toast('Voucher created — share the code with your friend');
  $s('vcNew').scrollIntoView({ behavior: 'smooth' });
};
window.svShare = t => { if(navigator.share) navigator.share({ text: t }).catch(() => {}); else window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank'); };
window.svVcBack = async function(code){
  if(!confirm('Cancel this voucher and get the money back to your balance?')) return;
  const r = await api('reclaimVoucher', { code });
  if(!r.ok){ toast(r.data.error || 'Could not cancel', true); return; }
  toast(`${tk(r.data.amount)} returned to your balance`); setBal(r.data.balance); PAGES.voucher();
};
window.svPay = function(kind){ window._payKind = kind; _stack.push('pay'); try { history.pushState({ sv: 'pay' }, ''); } catch (e) {} PAGES.pay(); };
window.svPaySubmit = async function(){
  const d = window._payData || {}; const trxId = ($s('pyTrx').value || '').trim(), sender = ($s('pySender').value || '').trim();
  if(trxId.length < 6){ toast('Enter the Transaction ID from your payment SMS', true); return; }
  const b = $s('pyBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Submitting…';
  const r = await api('buyService', { ...d, trxId, sender });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-paper-plane"></i>Submit payment';
  if(!r.ok){ toast(r.data.error || 'Could not submit', true); return; }
  confetti(); toast('Payment submitted — we will switch it on after checking');
  await loadState(); svBack();
};

/* ───────── badges on the profile ───────── */
function badges(){
  const s = SV.st; const el = $s('profPhone'); if(!el || !s) return;
  el.querySelectorAll('.vf-badge,.vip-badge').forEach(x => x.remove());
  if(s.verified) el.insertAdjacentHTML('beforeend', '<span class="vf-badge" data-noi18n><i class="fa-solid fa-circle-check"></i>Verified</span>');
  if(s.vip) el.insertAdjacentHTML('beforeend', `<span class="vip-badge" data-noi18n>👑 ${E(s.vip.name)}</span>`);
}
const _op = window.openProfileModal;
if(typeof _op === 'function') window.openProfileModal = function(){ const r = _op.apply(this, arguments); badges(); if(user()) loadState(); return r; };

/* ───────── promo code on the fee page ───────── */
function appId(){ return window._latestAppId || (window._latestApp && window._latestApp.id) || ''; }
function promoPaint(){
  const box = $s('promoBox'); if(!box) return;
  if(SV.cfg && SV.cfg.codes && SV.cfg.codes.promo === false){ box.innerHTML = ''; return; }
  if(window._promoDisc > 0){ box.innerHTML = `<div class="pr-box"><div class="pr-ok"><i class="fa-solid fa-tag" style="color:#c085ff"></i><div>Code <b>${E(window._promoCode)}</b> applied<br><span>−${tk(window._promoDisc)} off your fee</span></div><button onclick="svPromoOff()">Remove</button></div></div>`; return; }
  box.innerHTML = `<div class="pr-box" id="prBox"><div class="h" onclick="document.getElementById('prBox').classList.toggle('open')"><i class="fa-solid fa-tag"></i>Have a promo code?<em>Tap to add</em></div><div class="f"><input id="prIn" maxlength="24" placeholder="CODE" autocomplete="off"><button id="prBtn" onclick="svPromo()">Apply</button></div></div>`;
}
function feeRefresh(){
  try { if(typeof appliedBalance !== 'undefined' && appliedBalance > 0 && typeof _balanceAllowed === 'function'){ const m = _balanceAllowed(); if(appliedBalance > m){ appliedBalance = m; const a = $s('balAdjustAmt'); if(a) a.innerText = m; } } } catch (e) {}
  try { if(typeof updateFeeDisplay === 'function') updateFeeDisplay(); } catch (e) {}
  promoPaint();
}
window._svcFeeInit = async function(){
  promoPaint();
  const id = appId(); if(!id || !user()) return;
  await loadCfg(); promoPaint();
  const r = await api('myPromo', { appId: id });
  if(r.ok && r.data.promo && appId() === id){ window._promoCode = r.data.promo.code; window._promoDisc = Number(r.data.promo.discount) || 0; feeRefresh(); }
};
window.svPromo = async function(){
  const code = ($s('prIn').value || '').trim(); if(!code){ toast('Enter a promo code', true); return; }
  const id = appId(); if(!id){ toast('Open your application first', true); return; }
  const b = $s('prBtn'); b.disabled = true; b.textContent = '…';
  const r = await api('usePromo', { code, appId: id });
  b.disabled = false; b.textContent = 'Apply';
  if(!r.ok){ toast(r.data.error || 'Code not valid', true); return; }
  window._promoCode = r.data.code; window._promoDisc = Number(r.data.discount) || 0;
  feeRefresh(); confetti(); toast(`${r.data.label} — you save ${tk(r.data.discount)}!`);
};
window.svPromoOff = async function(){
  const r = await api('removePromo', { appId: appId() });
  if(!r.ok){ toast(r.data.error || 'Could not remove', true); return; }
  window._promoCode = ''; window._promoDisc = 0; feeRefresh();
};

/* ───────── start ───────── */
function start(){ renderHub(); loadCfg().then(() => { renderHub(); if(user()) loadState().then(renderHub); }); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
// refresh the red dots after login / logout
window.addEventListener('storage', e => { if(e.key === 'creditUpUser') start(); });
setInterval(() => { if(user() && !SV.st) loadState().then(renderHub); }, 20000);
})();
