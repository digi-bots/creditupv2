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
.sv-open .hot-offer-floating,.sv-open .act-bar,.sv-open #pwBar,.sv-open .pw-bar{display:none!important}
/* premium Verified seal */
.vf-seal{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.18em;margin-left:.3em;position:relative;filter:drop-shadow(0 0 6px rgba(56,170,255,.65));animation:vfGlow 2.4s ease-in-out infinite}
.vf-seal svg{width:100%;height:100%;display:block;animation:vfSpin 9s linear infinite}
.vf-seal svg .ck{animation:vfSpinR 9s linear infinite;transform-origin:12px 12px}
@keyframes vfSpin{to{transform:rotate(360deg)}}@keyframes vfSpinR{to{transform:rotate(-360deg)}}
@keyframes vfGlow{50%{filter:drop-shadow(0 0 11px rgba(56,170,255,.95)) drop-shadow(0 0 3px #fff)}}
.vf-chip{display:inline-flex;align-items:center;gap:5px;margin-left:7px;padding:3px 10px 3px 6px;border-radius:20px;font-size:10.5px;font-weight:900;letter-spacing:.4px;color:#fff;vertical-align:middle;position:relative;overflow:hidden;
  background:linear-gradient(135deg,#0b5bd3,#1da1f2 45%,#7fd3ff 55%,#1da1f2 65%,#0b5bd3);background-size:250% 100%;animation:vfShine 3s linear infinite;box-shadow:0 0 0 1px rgba(255,255,255,.25) inset,0 4px 14px rgba(13,110,253,.45)}
.vf-chip .vf-seal{margin:0;width:15px;height:15px}
@keyframes vfShine{to{background-position:-150% 0}}
.vf-ring{position:relative}
.vf-ring::before{content:"";position:absolute;inset:-4px;border-radius:50%;padding:3px;background:conic-gradient(#1da1f2,#7fd3ff,#ffd76a,#1da1f2);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:vfSpin 4s linear infinite}
.vf-ring .vf-corner{position:absolute;right:-3px;bottom:-3px;width:40%;height:40%;margin:0;z-index:2}
.vf-seal.off{filter:drop-shadow(0 0 4px rgba(29,161,242,.6))}
.vf-seal.wait{filter:drop-shadow(0 0 5px rgba(255,140,66,.6));animation:none}.vf-seal.wait svg{animation:vfSpin 3s linear infinite}
.vf-chip.off,.vf-get{cursor:pointer;color:#fff;background:linear-gradient(#0b1628,#0b1628) padding-box,linear-gradient(120deg,#1da1f2,#7fd3ff,#ffd76a,#1da1f2) border-box;background-size:100% 100%,300% 100%;border:1.5px solid transparent;
  box-shadow:0 0 14px rgba(29,161,242,.35);animation:vfBorder 3s linear infinite,vfPulse 2.2s ease-in-out infinite}
.vf-chip.off b,.vf-get b{background:linear-gradient(90deg,#9fe0ff,#ffffff,#ffd76a,#9fe0ff);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:vfShine 2.6s linear infinite;font-weight:900}
.vf-chip.off em,.vf-get em{font-style:normal;color:#ffd76a;margin-left:1px}
@keyframes vfBorder{to{background-position:0 0,-300% 0}}
@keyframes vfPulse{50%{box-shadow:0 0 22px rgba(29,161,242,.6),0 0 4px rgba(255,215,106,.5)}}
.vf-get{display:inline-flex;align-items:center;gap:4px;margin:5px 0 0 6px;padding:3px 9px 3px 4px;border-radius:14px;font-size:10px;letter-spacing:.2px;vertical-align:top;line-height:1.5;white-space:nowrap;-webkit-text-fill-color:initial}
.vf-get.wait{background:rgba(255,140,66,.16);border:1px solid rgba(255,140,66,.45);color:var(--orange);animation:none;box-shadow:none}
#appBar .ab-name{display:flex;align-items:center;gap:6px;min-width:0}
#appBar .ab-name h3{min-width:0}
#appBar .ab-name .vf-seal{flex:none;width:19px;height:19px;margin:0;cursor:pointer}
#appBar .ab-name .vf-seal.off{animation:vfAsk 2s ease-in-out infinite}
@keyframes vfAsk{0%,100%{transform:scale(1);filter:drop-shadow(0 0 3px rgba(255,215,106,.5))}50%{transform:scale(1.12);filter:drop-shadow(0 0 9px rgba(255,215,106,.9))}}
.vf-get .vf-seal{margin:0;width:13px;height:13px}
.vf-chip.wait{background:rgba(255,140,66,.16);color:var(--orange);animation:none;box-shadow:0 0 0 1px rgba(255,140,66,.4) inset;cursor:pointer}
#userGreeting .vf-seal.off,#userGreeting .vf-seal.wait{cursor:pointer}
@media (prefers-reduced-motion:reduce){.vf-seal,.vf-seal svg,.vf-seal svg .ck,.vf-chip,.vf-ring::before{animation:none}}
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
.vf-why{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:12px 0}
.vf-why div{border-radius:12px;padding:8px 4px;text-align:center;font-size:9.5px;line-height:1.3;color:var(--txt2);background:rgba(255,255,255,.035);border:1px solid var(--bord);overflow-wrap:anywhere}
.vf-why i{display:block;font-size:15px;color:#46b0ff;margin-bottom:4px}
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

/* ═══ premium layer (v3) ═══ */
/* service pages stay inside the 400px app column on big screens, like every other pop-up */
.sv-sheet{left:var(--app-gut,0);right:var(--app-gut,0);background:radial-gradient(120% 60% at 50% -10%,rgba(29,219,128,.10),transparent 60%),var(--bg)}
@media (min-width:600px){.sv-sheet{border-left:1px solid rgba(255,255,255,.06);border-right:1px solid rgba(255,255,255,.06)}}
.sv-wrap{max-width:100%}
.sv-body{overflow-x:hidden}
/* phones: slimmer cards and fields so more fits on screen */
@media(max-width:480px){.sv-body{padding:12px 12px 32px}.sv-card{padding:12px 13px;border-radius:15px;margin-bottom:10px}.sv-in{height:46px;border-radius:12px;font-size:14.5px}
  .sv-btn{padding:12px;border-radius:13px;font-size:14px}.sv-lbl{margin:10px 2px 5px}.sv-head{padding:10px 12px}.sv-head h3{font-size:15px}.cx-hero{padding:11px;border-radius:16px}.vlock{padding:16px 14px 14px}}
.sv-body *{max-width:100%;box-sizing:border-box}
.sv-head{background:linear-gradient(180deg,rgba(12,30,24,.95),rgba(6,13,26,.9));border-bottom:1px solid rgba(29,219,128,.18)}
.sv-head h3{letter-spacing:-.2px;background:linear-gradient(90deg,#fff,#9ff5cf);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.sv-head button{border-color:rgba(29,219,128,.3);background:rgba(29,219,128,.08)}
/* tiles: glass card, gradient edge, glossy icon */
.qa-grid.sv-hub{gap:11px}
.sv-tile{border:0;background:linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.02));box-shadow:0 12px 26px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.08);padding:14px 4px 11px;transition:transform .18s,box-shadow .18s}
.sv-tile::before{content:"";position:absolute;inset:0;border-radius:18px;padding:1px;background:linear-gradient(150deg,rgba(255,255,255,.28),rgba(255,255,255,.04) 45%,rgba(29,219,128,.28));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
@media (hover:hover){.sv-tile:hover{transform:translateY(-3px);box-shadow:0 18px 34px rgba(0,0,0,.42),0 0 0 1px rgba(29,219,128,.18)}}
.sv-ic{position:relative;width:46px;height:46px;border-radius:15px;font-size:18px;overflow:hidden;box-shadow:0 8px 18px rgba(0,0,0,.35),inset 0 -3px 6px rgba(0,0,0,.18)}
.sv-ic::after{content:"";position:absolute;left:-20%;right:-20%;top:-55%;height:75%;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0));pointer-events:none}
.sv-tile span{font-size:10.8px;letter-spacing:.1px}
.sv-lockb{position:absolute;top:-6px;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;gap:3px;white-space:nowrap;font-size:8.5px;font-weight:900;letter-spacing:.3px;padding:2px 7px;border-radius:8px;color:#1a1200;background:linear-gradient(135deg,#ffe9a8,#f2b33d);box-shadow:0 3px 10px rgba(242,179,61,.45)}
.sv-tile.locked .sv-ic{filter:saturate(.75) brightness(.9)}
.qa-see{float:right;font-size:12px;font-weight:800;color:var(--p);cursor:pointer;margin-top:3px}
.qa-arr{float:right;margin:0 10px 0 0;width:26px;height:22px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;color:var(--txt2);background:rgba(255,255,255,.06);border:1px solid var(--bord)}
/* verified-only lock card */
.vlock{position:relative;overflow:hidden;border-radius:22px;padding:22px 18px 18px;margin:4px 0 14px;text-align:center;background:radial-gradient(140% 120% at 50% 0%,rgba(59,130,246,.28),rgba(6,13,26,0) 65%),linear-gradient(160deg,#0f1c38,#0a1226);border:1px solid rgba(147,197,253,.35);box-shadow:0 18px 40px rgba(0,0,0,.45)}
.vlock::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.10),transparent);animation:vSweep 3.6s ease-in-out infinite}
@keyframes vSweep{0%{left:-60%}60%,100%{left:130%}}
.vlock .big{font-size:62px;line-height:1;display:block}.vlock .big .vf-seal{width:1em;height:1em;margin:0}
.vlock h4{margin:10px 0 4px;font-size:17px;background:linear-gradient(90deg,#fff,#bfe0ff,#ffe9a8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.vlock p{margin:0 0 14px;font-size:12.5px;color:#a9bcdc;line-height:1.6}
.vlock ul{list-style:none;padding:0;margin:0 0 14px;text-align:left;display:inline-block}.vlock li{font-size:12.5px;color:#dbe7ff;padding:3px 0}.vlock li i{color:#ffd76a;width:18px}
.vbtn{position:relative;overflow:hidden;width:100%;border:0;border-radius:14px;padding:14px;font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;color:#0b1430;display:flex;align-items:center;justify-content:center;gap:8px;
  background:linear-gradient(135deg,#fff3c4,#ffd76a 40%,#f2a91d);box-shadow:0 12px 28px rgba(242,169,29,.35),inset 0 1px 0 rgba(255,255,255,.6)}
.vbtn::after{content:"";position:absolute;top:0;left:-50%;width:35%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.65),transparent);animation:vSweep 2.8s ease-in-out infinite}
.sv-dim{opacity:.45;filter:grayscale(.3);pointer-events:none}
.rd-hero{text-align:center;border-radius:22px;padding:18px 16px;margin-bottom:12px;background:radial-gradient(120% 120% at 50% 0%,rgba(168,85,247,.28),rgba(6,13,26,0) 70%),var(--surf);border:1px solid rgba(168,85,247,.4)}
.rd-hero h4{margin:0 0 6px;font-size:17px;color:var(--txt)}.rd-hero p{margin:0;font-size:12.5px;color:var(--txt2);line-height:1.55}
.rd-live{display:inline-block;margin-top:10px;font-size:11px;font-weight:900;padding:4px 10px;border-radius:10px;background:rgba(255,255,255,.06);color:var(--txt2)}.rd-live.on{background:rgba(29,219,128,.14);color:var(--p)}
.rd-v{display:flex;align-items:center;gap:10px;border-radius:16px;padding:10px 12px;margin-bottom:12px;cursor:pointer;background:rgba(185,130,40,.12);border:1px solid rgba(214,160,72,.5)}
.rd-v .vf-seal{width:30px;height:30px;flex:none}.rd-v b{display:block;font-size:12.5px;color:#f3c46b}.rd-v small{font-size:11px;color:var(--txt2)}
.rd-v span{margin-left:auto;flex:none;font-size:11.5px;font-weight:900;padding:6px 10px;border-radius:10px;color:#2a1a00;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d)}
.rd-step{display:flex;gap:11px;align-items:center;padding:9px 0;border-bottom:1px dashed var(--bord)}.rd-step:last-child{border-bottom:0}
.rd-step b{display:block;font-size:13px;color:var(--txt)}.rd-step small{font-size:11.5px;color:var(--txt2)}
.rd-tg{display:flex;gap:11px;align-items:center;border-radius:16px;padding:12px;margin:14px 0 8px;background:linear-gradient(135deg,rgba(55,187,254,.16),rgba(29,142,216,.06));border:1px solid rgba(55,187,254,.45)}
.rd-tg>i{font-size:28px;color:#37bbfe}.rd-tg b{display:block;font-size:13px;color:var(--txt)}.rd-tg small{font-size:11.5px;color:var(--txt2)}
.rd-tgb{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rd-tgb .sv-btn{display:flex;align-items:center;justify-content:center;gap:7px;padding:12px;font-size:13px}
/* premium Get Verified chip (profile) */
.vf-chip.off{gap:6px;padding:4px 11px 4px 5px;border-radius:22px;background:linear-gradient(135deg,#0f1f45,#1b3a7a) padding-box,conic-gradient(from var(--va,0deg),#60a5fa,#ffd76a,#fff4c2,#60a5fa) border-box;border:1.5px solid transparent;
  box-shadow:0 0 16px rgba(96,165,250,.35),0 0 4px rgba(255,215,106,.35);animation:vRot 3.5s linear infinite;position:relative;overflow:hidden}
@property --va{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes vRot{to{--va:360deg}}
.vf-chip.off::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);animation:vSweep 2.6s ease-in-out infinite}
.vf-chip.off .vf-seal{width:17px;height:17px}
.vf-chip.off b{font-size:10.5px;letter-spacing:.6px;background:linear-gradient(90deg,#fff7d6,#ffd76a,#ffffff,#bfe0ff,#fff7d6);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:vfShine 2.4s linear infinite}
.vf-chip.off em{color:#ffd76a;font-size:11px}
.vf-chip.off .tw{color:#ffe9a8;font-size:8px;animation:vTw 1.6s ease-in-out infinite}
@keyframes vTw{50%{opacity:.25;transform:scale(.6)}}
#appBar .ab-name .vf-seal.off{width:20px;height:20px;animation:vfAsk 2.2s ease-in-out infinite}
.vf-seal svg,.vf-seal svg .ck{animation:none!important}
/* not verified / pending: golden-brown warning look, so nobody mistakes it for an active badge */
.vf-warn{display:inline-flex;align-items:center;gap:3px;flex:none;padding:2px 7px 2px 3px;border-radius:12px;cursor:pointer;-webkit-text-fill-color:initial;
  background:rgba(185,130,40,.16);border:1px solid rgba(214,160,72,.55);color:#e9b85a;font-size:9.5px;font-weight:800;line-height:1.3;white-space:nowrap;letter-spacing:.1px}
.vf-warn .vf-seal{width:14px!important;height:14px!important;margin:0;animation:none!important;filter:none}
.vf-warn.off{animation:vWarn 2.4s ease-in-out infinite}
@keyframes vWarn{50%{box-shadow:0 0 0 3px rgba(214,160,72,.18);border-color:rgba(240,190,100,.85)}}
.vf-warn .lg,.vf-warn .sh{display:inline-block;line-height:14px;transform:translateY(.5px)}
.vf-warn .sh{display:none}
@media (max-width:340px){.vf-warn .lg{display:none}.vf-warn .sh{display:inline}#appBar .ab-name.has-warn h3{font-size:15px}}
.vf-chip.off,.vf-chip.wait{gap:6px;padding:4px 10px 4px 5px;border-radius:20px;border:1px solid rgba(214,160,72,.6);background:rgba(185,130,40,.15);box-shadow:none;animation:none;color:#e9b85a}
.vf-chip.off::after{display:none}
.vf-chip.off b{background:none;-webkit-text-fill-color:#e9b85a;color:#e9b85a;animation:none;font-size:10.5px;letter-spacing:.2px}
.vf-chip.off em{color:#ffd98a;font-style:normal;font-weight:900;margin-left:2px;padding-left:6px;border-left:1px solid rgba(214,160,72,.45)}
/* after-login pop-up: offers & rewards are for Verified members */
.vpop{position:fixed;inset:0;left:var(--app-gut,0);right:var(--app-gut,0);z-index:2700;display:flex;align-items:flex-end;justify-content:center;background:rgba(2,6,14,.72);backdrop-filter:blur(4px);opacity:0;transition:opacity .25s}
.vpop.on{opacity:1}
.vpop .card{width:100%;max-height:92dvh;overflow:auto;border-radius:26px 26px 0 0;padding:26px 20px calc(20px + env(safe-area-inset-bottom,0px));position:relative;transform:translateY(40px);transition:transform .3s cubic-bezier(.2,.8,.2,1);
  background:radial-gradient(130% 90% at 50% 0%,rgba(243,196,107,.22),rgba(6,13,26,0) 60%),linear-gradient(180deg,#14203a,#0a1224);border-top:1px solid rgba(243,196,107,.45);box-shadow:0 -20px 60px rgba(0,0,0,.6)}
.vpop.on .card{transform:none}
.vpop .x{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#cfd8ea;font-size:15px;cursor:pointer}
.vpop .big{display:block;text-align:center;font-size:58px;line-height:1}.vpop .big .vf-seal{width:1em;height:1em;margin:0}
.vpop h3{text-align:center;margin:12px 0 6px;font-size:19px;background:linear-gradient(90deg,#fff,#ffe3a3);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.vpop .sub{text-align:center;color:#a9bcdc;font-size:13px;line-height:1.6;margin:0 0 14px}
.vpop .row{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);margin-bottom:8px;font-size:12.5px;color:#dbe7ff;line-height:1.5}
.vpop .row i{width:26px;height:26px;flex:none;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:12px}
.vpop .row.lk i{background:rgba(214,160,72,.18);color:#f3c46b}.vpop .row.ok i{background:rgba(29,219,128,.15);color:var(--p)}
.vpop .row b{display:block;color:#fff;font-size:13px}
.vpop .acts{display:flex;flex-direction:column;gap:8px;margin-top:14px}
@media (min-height:0){.vpop{align-items:center;padding:16px}.vpop .card{max-width:350px;border-radius:24px;padding:18px 16px 12px;max-height:84dvh}
  .vpop .big{font-size:40px}.vpop h3{font-size:17px;margin:8px 0 4px}.vpop .sub{font-size:12px;line-height:1.5;margin-bottom:10px}
  .vpop .row{padding:7px 10px;font-size:11.5px;margin-bottom:6px;border-radius:12px}.vpop .row b{font-size:12px}.vpop .row i{width:22px;height:22px;font-size:11px}.vpop .acts{margin-top:10px;gap:4px}.vpop .x{top:10px;right:10px;width:30px;height:30px}}
body:has(#vPop) .hot-offer-floating,body:has(#vPop) .pw-bar{opacity:0!important;pointer-events:none!important}
.vpop .later{border:0;background:none;color:#8fa3c4;font-weight:700;font-size:13px;padding:8px;cursor:pointer;font-family:inherit}
@media (prefers-reduced-motion:reduce){.vlock::after,.vbtn::after,.vf-chip.off,.vf-chip.off::after,.vf-chip.off b,.vf-chip.off .tw{animation:none}}
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

/* ───────── admin-managed tiles: badges, status, access, custom pages, reminders ───────── */
(function(){ const st = document.createElement('style'); st.textContent = `
.sv-bdg.hot{background:linear-gradient(135deg,#ff4d6a,#ff8c42)}.sv-bdg.new{background:linear-gradient(135deg,#1ddb80,#0e9a5a);box-shadow:0 3px 8px rgba(29,219,128,.35)}
.sv-bdg.pop{background:linear-gradient(135deg,#b06bff,#7b3fe4);box-shadow:0 3px 8px rgba(176,107,255,.4)}.sv-bdg.ver{background:linear-gradient(135deg,#1da1f2,#0d6efd);box-shadow:0 3px 8px rgba(13,110,253,.4)}
.sv-bdg.vip{background:linear-gradient(135deg,#ffe08a,#f2a91d);color:#3a2500;box-shadow:0 3px 8px rgba(242,169,29,.4)}
.sv-bdg.tri{background:linear-gradient(135deg,#b06bff,#7b3fe4);box-shadow:0 3px 8px rgba(176,107,255,.4)}.sv-vr{position:absolute;bottom:4px;right:6px;font-style:normal;font-size:8px;font-weight:900;color:#9fd8ff;opacity:.85}
.cx-note.trial{background:rgba(176,107,255,.1);border-color:rgba(176,107,255,.4)}.cx-note.trial i{color:#c79bff}
.cx-hero .sv-bdg,.cx-it .sv-bdg{position:static;display:inline-block;vertical-align:middle;margin-left:4px}
.sv-stb{position:absolute;top:-6px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:8.5px;font-weight:900;letter-spacing:.3px;padding:2px 7px;border-radius:8px;color:#fff;background:#56627a}
.sv-stb.busy{background:linear-gradient(135deg,#ff9f43,#e67e22)}.sv-stb.soon{background:linear-gradient(135deg,#6c7a96,#46526b)}.sv-stb.closed{background:linear-gradient(135deg,#ff6b81,#c0392b)}
.sv-tile.off .sv-ic{filter:grayscale(.85) brightness(.75)}.sv-tile.off span{opacity:.65}
.sv-lockb.vip{background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d)}
.vlock.vip{background:radial-gradient(140% 120% at 50% 0%,rgba(255,200,90,.26),rgba(6,13,26,0) 65%),linear-gradient(160deg,#2a1f08,#120d05);border-color:rgba(255,215,106,.45)}
.vlock.st{background:linear-gradient(160deg,#141d31,#0a1226);border-color:var(--bord)}
.vip-lv{margin:10px 0 12px;padding:8px 10px;border-radius:11px;font-size:11.5px;line-height:1.5;color:#ffe9a8;background:rgba(255,215,106,.08);border:1px dashed rgba(255,215,106,.35)}.vip-lv i{margin-right:5px}
.vbtn.gold{color:#2a1a00;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d)}
.sv-nudge{display:flex;align-items:center;gap:11px;margin:0 0 12px;padding:11px 12px;border-radius:16px;cursor:pointer;border:1px solid rgba(70,176,255,.45);background:linear-gradient(135deg,rgba(29,161,242,.16),rgba(13,110,253,.05))}
.sv-nudge.p{border-color:rgba(255,215,106,.5);background:linear-gradient(135deg,rgba(255,215,106,.16),rgba(242,169,29,.04))}
.sv-nudge .ic{flex:0 0 34px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:24px}
.sv-nudge>div{flex:1;min-width:0}.sv-nudge b{display:block;font-size:13px;color:var(--txt)}.sv-nudge small{font-size:11.5px;color:var(--txt2);line-height:1.45}
.sv-nudge .go{flex:none;font-size:11.5px;font-weight:900;padding:7px 11px;border-radius:10px;color:#fff;background:linear-gradient(135deg,#1da1f2,#0d6efd)}
.sv-nudge.p .go{color:#2a1a00;background:linear-gradient(135deg,#ffe08a,#f2a91d)}
.sv-nudge.sw>div{animation:nudgeIn .45s ease}@keyframes nudgeIn{from{opacity:0;transform:translateY(6px)}}
.cx-hero{display:flex;gap:13px;align-items:center;margin-bottom:12px;padding:14px;border-radius:20px;background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.015));border:1px solid var(--bord)}
.cx-hero .sv-ic{flex:0 0 56px;width:56px;height:56px;border-radius:17px;font-size:22px;margin:0}
.cx-hero h4{margin:0 0 3px;font-size:16px;color:var(--txt)}.cx-hero p{margin:0 0 6px;font-size:12px;color:var(--txt2);line-height:1.5}
.cx-st{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;color:var(--p)}.cx-st i{font-size:7px}
.cx-st.busy{color:#ffae6b}.cx-st.closed{color:#ff8fa3}.cx-st.soon{color:var(--txt2)}
.cx-note{display:flex;gap:9px;align-items:flex-start;margin:0 0 12px;padding:10px 12px;border-radius:14px;font-size:12px;line-height:1.55;color:var(--txt2);background:rgba(77,143,255,.08);border:1px solid rgba(77,143,255,.3)}
.cx-note i{color:#7fb0ff;margin-top:2px}.cx-note.warn{background:rgba(255,159,67,.08);border-color:rgba(255,159,67,.35)}.cx-note.warn i{color:#ffae6b}
.cx-it{border-radius:15px;margin-bottom:8px;background:linear-gradient(160deg,rgba(255,255,255,.055),rgba(255,255,255,.015));border:1px solid var(--bord);cursor:pointer;overflow:hidden}
.cx-it .h{display:flex;align-items:center;gap:10px;padding:12px}.cx-it .h>i:first-child{color:var(--p);width:18px;text-align:center}.cx-it .h b{flex:1;min-width:0;font-size:13.5px;color:var(--txt)}
.cx-it .ch{color:var(--txt3);transition:transform .25s}.cx-it.on .ch{transform:rotate(180deg)}
.cx-it .b{display:none;padding:0 12px 12px 40px;font-size:12.5px;color:var(--txt2);line-height:1.6}.cx-it.on .b{display:block}.cx-it .b p{margin:0 0 6px;white-space:pre-line}
.cx-sub{padding:8px 10px;margin-top:6px;border-radius:11px;background:rgba(255,255,255,.04);border-left:3px solid var(--p)}.cx-sub b{display:block;font-size:12.5px;color:var(--txt)}.cx-sub small{font-size:11.5px}
`; document.head.appendChild(st); })();
/* ───────── one way to pay, everywhere: method cards with logos (like the loan fee page) → type → number to copy ───────── */
(function(){
const st = document.createElement('style'); st.textContent = `
.pp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:8px;margin:0 0 10px}
.pp-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:9px 5px 8px;border-radius:13px;cursor:pointer;background:linear-gradient(165deg,rgba(255,255,255,.07),rgba(255,255,255,.015));border:1.5px solid var(--bord);transition:transform .15s,border-color .2s}
.pp-card:active{transform:scale(.97)}.pp-card img{width:30px;height:30px;object-fit:contain;border-radius:8px;background:#fff;padding:2px}.pp-card .fb{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(29,219,128,.14);color:var(--p)}
.pp-card span{font-size:11.5px;font-weight:800;color:var(--txt);text-align:center;line-height:1.15}.pp-card em{font-size:9px;font-style:normal;color:var(--txt3);text-align:center;line-height:1.2}
.pp-card.sel{border-color:var(--p);background:rgba(29,219,128,.08);box-shadow:0 0 0 3px rgba(29,219,128,.12)}.pp-card.sel::after{content:"✓";position:absolute;top:4px;right:6px;font-size:10px;font-weight:900;color:var(--p)}
.pp-hint{font-size:11.5px;color:#ffd76a;margin:-2px 2px 10px;display:flex;gap:6px;align-items:center}
.pp-types{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 9px}.pp-types button{border:1.5px solid var(--bord);background:rgba(255,255,255,.04);color:var(--txt2);border-radius:20px;padding:5px 12px;font-size:11.5px;font-weight:800;font-family:inherit;cursor:pointer}.pp-types button.on{border-color:var(--p);color:var(--p);background:rgba(29,219,128,.08)}
.pp-num{display:flex;align-items:center;gap:10px;padding:10px 10px 10px 13px;border-radius:14px;margin-bottom:8px;background:linear-gradient(135deg,rgba(29,219,128,.1),rgba(29,219,128,.02));border:1.5px dashed rgba(29,219,128,.45)}
.pp-num>div{flex:1;min-width:0}.pp-num small{display:block;font-size:10.5px;color:var(--txt2);font-weight:700}.pp-num b{font-size:19px;letter-spacing:1px;color:var(--txt);font-family:ui-monospace,Menlo,monospace}
.pp-amt{display:flex;align-items:center;gap:8px;margin:-2px 0 8px;font-size:12px;color:var(--txt2)}.pp-amt b{color:#ffd76a;font-size:14px}
.pp-steps{margin:0 0 10px;padding:8px 11px;border-radius:12px;font-size:11px;line-height:1.55;color:var(--txt2);background:rgba(77,143,255,.06);border:1px dashed rgba(77,143,255,.3)}.pp-steps ol{margin:3px 0 0;padding-left:17px}
/* a 3D copy button for important values */
.cp3d{flex:none;display:inline-flex;align-items:center;gap:5px;border:0;border-radius:10px;padding:7px 11px;font-size:11.5px;font-weight:900;font-family:inherit;cursor:pointer;color:#03210f;
  background:linear-gradient(180deg,#5ff0a6,#1ddb80 55%,#14b86a);box-shadow:0 3px 0 #0b7a45,0 6px 12px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.5);transform:translateY(0);transition:transform .08s,box-shadow .08s}
.cp3d:active{transform:translateY(3px);box-shadow:0 0 0 #0b7a45,0 2px 6px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.5)}
.cp3d.sm{padding:4px 8px;font-size:10px;border-radius:8px;box-shadow:0 2px 0 #0b7a45,0 4px 8px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.5)}
.cp3d.ok{background:linear-gradient(180deg,#fff3c4,#ffd76a 55%,#f2a91d);box-shadow:0 3px 0 #a86f05,0 6px 12px rgba(0,0,0,.3)}`;
document.head.appendChild(st);
const E = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tk = n => '৳' + Math.round(Number(n) || 0).toLocaleString('en-US');
// copy with a small "Copied" on the button
window._cp = function(text, btn){ const done = () => { if(btn){ const h = btn.innerHTML; btn.classList.add('ok'); btn.innerHTML = '<i class="fa-solid fa-check"></i>Copied'; setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = h; }, 1400); } else if(window._svToast) window._svToast('Copied'); };
  try { navigator.clipboard.writeText(String(text)).then(done, () => { const t = document.createElement('textarea'); t.value = String(text); document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }); } catch (e) { done(); } };
window._cpBtn = (text, sm) => `<button type="button" class="cp3d${sm ? ' sm' : ''}" data-cp="${E(text)}" onclick="event.stopPropagation();_cp(this.dataset.cp,this)"><i class="fa-regular fa-copy"></i>Copy</button>`;
const PP = window._pp = window._pp || {};
const opts = w => typeof window._walletOptions === 'function' ? window._walletOptions(w) : (Array.isArray(w.methods) && w.methods.length ? w.methods.filter(o => o && o.number) : [{ type: w.payMethod || 'Send Money', number: w.collectionNumber || w.paymentNumber }].filter(o => o.number));
const list = () => (window._feeWallets || []).map(w => ({ w, o: opts(w) })).filter(x => x.o.length);
function inner(k){
  const S = PP[k];
  if(S.fixed){ S.cur = S.fixed; return num(S.cur, S.amount); }
  const L = list();
  if(!L.length){ if(window._loadWallets && !S.tried){ S.tried = 1; Promise.resolve(window._loadWallets()).then(() => window._ppRender(k)).catch(() => {}); } S.cur = null; return '<div class="sv-empty" style="padding:14px">No payment method is open right now. Please contact Support.</div>'; }
  if(L.length === 1 && S.w < 0) S.w = 0;
  const grid = `<div class="pp-grid">${L.map((x, i) => `<div class="pp-card${i === S.w ? ' sel' : ''}" onclick="_ppSel('${k}',${i})">${x.w.logoUrl ? `<img src="${E(x.w.logoUrl)}" alt="" onerror="this.outerHTML='<div class=&quot;fb&quot;><i class=&quot;fa-solid fa-wallet&quot;></i></div>'">` : '<div class="fb"><i class="fa-solid fa-wallet"></i></div>'}<span>${E(x.w.name)}</span><em>${E(x.o.map(o => o.type).filter(Boolean).join(' · '))}</em></div>`).join('')}</div>`;
  if(S.w < 0 || !L[S.w]){ S.cur = null; return grid + '<div class="pp-hint"><i class="fa-solid fa-hand-pointer"></i>Choose how you will pay</div>'; }
  const x = L[S.w]; if(!x.o[S.o]) S.o = 0; const o = x.o[S.o];
  S.cur = { name: x.w.name, type: o.type || 'Send Money', number: o.number, note: o.note || '', steps: Array.isArray(o.instructions) ? o.instructions.filter(Boolean).slice(0, 6) : [] };
  return grid + (x.o.length > 1 ? `<div class="pp-types">${x.o.map((y, j) => `<button class="${j === S.o ? 'on' : ''}" onclick="_ppType('${k}',${j})">${E(y.type || 'Send Money')}</button>`).join('')}</div>` : '') + num(S.cur, S.amount);
}
function num(c, amount){
  return `${amount ? `<div class="pp-amt">${E(c.type || 'Send')} exactly <b>${tk(amount)}</b> ${window._cpBtn(Math.round(amount), 1)}</div>` : ''}
    <div class="pp-num"><div><small>${E(c.name)}${c.type ? ' · ' + E(c.type) : ''}</small><b>${E(c.number)}</b></div>${window._cpBtn(c.number)}</div>
    ${c.note || (c.steps || []).length ? `<div class="pp-steps">${c.note ? `<div>${E(c.note)}</div>` : ''}${(c.steps || []).length ? `<ol>${c.steps.map(t => `<li>${E(t)}</li>`).join('')}</ol>` : ''}</div>` : ''}`;
}
// key: one picker per page; fixed: a number set by the admin for that item; amount: shown with its own copy button
window._payPick = function(k, o = {}){ PP[k] = PP[k] || { w: -1, o: 0 }; PP[k].amount = o.amount || 0; PP[k].fixed = o.fixed || null; return `<div class="pp-box" id="pp_${k}">${inner(k)}</div>`; };
window._ppRender = k => { const el = document.getElementById('pp_' + k); if(el && PP[k]) el.innerHTML = inner(k); };
window._ppSel = (k, i) => { PP[k].w = i; PP[k].o = 0; window._ppRender(k); };
window._ppType = (k, j) => { PP[k].o = j; window._ppRender(k); };
window._ppAmount = (k, a) => { if(PP[k]){ PP[k].amount = a; window._ppRender(k); } };
window._ppCur = k => (PP[k] && PP[k].cur) || null;
})();

/* ───────── data ───────── */
const SV = { cfg: null, st: null, cfgP: null };
function loadCfg(){ if(!SV.cfgP) SV.cfgP = fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'svcConfig' }) }).then(r => r.json()).then(j => { SV.cfg = j || {}; regCustom(); return SV.cfg; }).catch(() => (SV.cfg = {})); return SV.cfgP; }
async function loadState(){ if(!user()) return null; const r = await api('svcState'); SV.st = r.ok ? r.data : null; window._svState = SV.st; badges(); return SV.st; }

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
  recharge: { l: 'Mobile Recharge', ic: 'mobile-screen-button', g: 'g-green', cat: 'account', login: true, page: 'recharge', badge: 'VIP' },
  telegram: { l: 'Telegram', ic: 'paper-plane', g: 'g-blue', cat: 'help', login: true, page: 'telegram', badge: 'JOIN' },
  lang:     { l: 'Language', ic: 'language', g: 'g-teal', cat: 'account', page: 'lang' },
  all:      { l: 'All Services', ic: 'grip', g: 'g-slate', cat: '', page: 'all' },
  arrange:  { l: 'Arrange my tiles', ic: 'arrows-up-down', g: 'g-slate', cat: '', login: true, page: 'arrange' }
};
// other parts of the app (loan tools, help pages) add their own tiles here
window._svcTiles = T;
window._svcPages = window._svcPages || {};
const CATS = [['premium', 'Premium', 'crown'], ['rewards', 'Rewards', 'gift'], ['loans', 'Loans', 'hand-holding-dollar'], ['help', 'Help & Info', 'circle-question'], ['account', 'Account', 'user']];
const HOME_DEF = ['vip', 'checkin', 'spin', 'wallet', 'recharge', 'calc', 'refer', 'history', 'all'];

// offers, events and rewards are for Verified members (Admin → Services & Rewards); the sign-up bonus stays for everyone
const VONLY = ['checkin', 'spin', 'voucher'];   // Redeem Code is open to all (redeeming asks for the badge)
function needsV(){ const B = (SV.cfg && SV.cfg.bonus) || {}; return B.requireVerified !== false && !!user() && !!SV.st && SV.st.verified !== true; }
window._svNeedsV = needsV; window._svSeal = () => seal('', '');
function lockCard(what){
  const pend = SV.st && (SV.st.orders || []).some(o => o.kind === 'verify' && o.status === 'Pending');
  return `<div class="vlock"><span class="big">${seal('', pend ? 'wait' : 'off')}</span><h4>${pend ? 'Verification in progress' : 'For Verified members'}</h4>
    <p>${pend ? 'We are checking your verification payment. ' + E(what) + ' opens as soon as your badge is active.' : E(what) + ' and all offers, events and rewards are for Verified members. Get your Verified badge once and join everything.'}</p>
    ${pend ? '' : `<ul><li><i class="fa-solid fa-gift"></i>Daily check-in &amp; Spin &amp; Win rewards</li><li><i class="fa-solid fa-fire"></i>Hot offers, events &amp; prizes</li><li><i class="fa-solid fa-ticket"></i>Redeem codes &amp; gift vouchers</li><li><i class="fa-solid fa-percent"></i>0% charge &amp; 0 fee on Digital Services</li><li><i class="fa-solid fa-circle-check"></i>Premium badge &amp; better approval chance</li></ul>
    <button class="vbtn" onclick="svGo('verify')">${seal()}Get Verified</button>`}</div>`;
}
function tileCfg(k){ const h = (SV.cfg && SV.cfg.hub && SV.cfg.hub.tiles) || {}, c = h[k] || {};
  // a trial closes by itself when its time is over
  if(c.trialEnd && new Date(c.trialEnd).getTime() <= Date.now()) return { ...c, status: 'closed', statusNote: c.statusNote || 'This trial has ended. Thank you for trying it!', trialEnd: '' };
  return c; }
function tileOn(k){ const t = T[k]; if(!t) return false; if(k === 'all') return true; if(k === 'lang') return window._langOn !== false; const c = tileCfg(k); if(c.on === false) return false;
  const C = SV.cfg || {}; if(k === 'vip' && C.vip && C.vip.on === false) return false; if(k === 'verify' && C.verify && C.verify.on === false) return false;
  if(k === 'checkin' && C.checkin && C.checkin.on === false) return false; if(k === 'spin' && C.spin && C.spin.on === false) return false;
  if(k === 'voucher' && C.voucher && C.voucher.on === false) return false; if(k === 'redeem' && C.codes && C.codes.redeem === false) return false; return true; }
function tileHtml(k){
  const t = T[k], c = tileCfg(k), badge = c.badge !== undefined ? c.badge : (t.badge || '');
  // Mobile Recharge and Micro Jobs: Verified or VIP members
  const acc = accOf(k), noAcc = acc && !canUse(acc);
  const lk = noAcc || (VONLY.includes(k) && needsV());
  const st = ST_TXT[c.status] ? c.status : '';
  const dot = !lk && ((k === 'checkin' && SV.st && SV.st.checkin && !SV.st.checkin.doneToday) || (k === 'spin' && SV.st && SV.st.spin && SV.st.spin.canSpin));
  const ic = /fa-/.test(t.ic) ? t.ic : 'fa-solid fa-' + t.ic;
  const tri = !st && !lk && c.trialEnd && new Date(c.trialEnd).getTime() > Date.now();
  return `<div class="sv-tile${lk ? ' locked' : ''}${st === 'closed' || st === 'soon' ? ' off' : ''}" onclick="svGo('${k}')">${st && st !== 'open' ? `<em class="sv-stb ${st}">${ST_TXT[st]}</em>` : lk ? `<em class="sv-lockb${noAcc && acc !== 'verified' ? ' vip' : ''}"><i class="fa-solid fa-${noAcc && acc !== 'verified' ? 'crown' : 'lock'}"></i>${noAcc ? ACC_TXT[acc] : 'VERIFIED'}</em>` : tri ? '<em class="sv-bdg tri"><i class="fa-solid fa-flask"></i> TRIAL</em>' : badge ? bdg(badge, t.gold) : dot ? '<em class="sv-dot"></em>' : ''}<div class="sv-ic ${E(c.color || t.g)}"><i class="${E(c.icon ? (/fa-/.test(c.icon) ? c.icon : 'fa-solid fa-' + c.icon) : ic)}"></i></div><span>${E(c.label || t.l)}</span>${c.ver ? `<i class="sv-vr">v${E(c.ver)}</i>` : ''}</div>`;
}
/* ───────── tiles the admin manages (Admin → Services → Quick Services) ───────── */
// badge look by its text: HOT / NEW / POPULAR / VERIFIED / VIP (1·2·3) — any other text keeps the red look
const BADGE = { HOT: 'hot', SALE: 'hot', NEW: 'new', EARN: 'new', FREE: 'new', POPULAR: 'pop', TOP: 'pop', VERIFIED: 'ver', 'FOR VERIFIED': 'ver', JOIN: 'ver', VIP: 'vip', 'VIP 1': 'vip', 'VIP 2': 'vip', 'VIP 3': 'vip', 'FOR VIP': 'vip' };
function bdg(text, gold){ const t = String(text || '').trim(); if(!t) return ''; return `<em class="sv-bdg ${BADGE[t.toUpperCase()] || (gold ? 'vip' : '')}">${E(t)}</em>`; }
// services open by VIP level only (Verified is for rewards: check-in, spin, vouchers, redeem); Mobile Recharge is VIP unless the admin opens it
function accOf(k){ const a = tileCfg(k).access || (k === 'recharge' ? 'vip' : ''); return /^vip/.test(a) ? 'vip' : ''; }
const ACC_TXT = { vip: 'VIP' };
const ST_TXT = { open: '', busy: 'BUSY', closed: 'CLOSED', soon: 'SOON' };
const hubC = () => (SV.cfg && SV.cfg.hub) || {};
// VIP level = the plan's place in the VIP plans list (1 = first plan); 0 = not VIP
function vipLevel(){ const v = SV.st && SV.st.vip; if(!v) return 0; const pl = ((SV.cfg || {}).vip || {}).plans || []; const i = pl.findIndex(p => p.id === v.plan); return i < 0 ? 1 : i + 1; }
// services: any VIP plan opens a VIP service (the plan level only sets loan priority)
function canUse(a){ if(!a || a === 'all' || a === 'verified') return true; if(!SV.st) return false; return vipLevel() > 0; }
window._svLock = (name, a) => a === 'verified' ? lockCard(name) : vipLock(name, a); window._svCanUse = canUse; window._svVipLevel = vipLevel; window._svBadge = bdg;
function regCustom(){
  (hubC().custom || []).forEach(c => { if(!c || !c.id) return; const k = 'c_' + c.id;
    T[k] = { l: c.label || 'Service', ic: c.icon || 'star', g: c.color || 'g-teal', cat: c.cat || 'help', page: k, custom: c }; window._svcPages[k] = () => customPage(k); });
}
// closed / coming soon / not for this member: one clear page instead of the service
function gate(k){
  const c = tileCfg(k), t = T[k]; if(!t) return null; const name = c.label || t.l;
  if(c.status === 'closed' || c.status === 'soon') return () => show(name, `<div class="vlock st"><span class="big" style="font-size:44px"><i class="fa-solid fa-${c.status === 'soon' ? 'hourglass-half' : 'store-slash'}"></i></span><h4>${c.status === 'soon' ? 'Coming soon' : 'Closed right now'}</h4><p>${E(c.statusNote || (c.status === 'soon' ? name + ' is coming soon — stay tuned!' : name + ' is closed for now. Please check back later.'))}</p><button class="vbtn" onclick="svBack()">OK</button></div>${nudge()}`);
  const a = accOf(k);
  if(a && user()){
    if(!SV.st) return () => { show(name, loading); loadState().then(() => { if(_stack[_stack.length - 1] === k) open(k); }); };
    if(!canUse(a)) return () => show(name, a === 'verified' ? lockCard(name) : vipLock(name, a));
  }
  return null;
}
function vipLock(name, a){
  const pl = (((SV.cfg || {}).vip || {}).plans || []).filter(p => p.on !== false), cheap = pl.slice().sort((x, y) => (x.price || 0) - (y.price || 0))[0];
  return `<div class="vlock vip"><span class="big" style="font-size:44px">👑</span><h4>For VIP members</h4>
    <p>${E(name)} is a VIP service. <b>Any VIP plan</b> opens it${cheap ? ` — from ${tk(cheap.price)}` : ''}.</p>
    <div class="vip-lv"><i class="fa-solid fa-circle-info"></i>VIP 1, 2 or 3 does not change the services you get — the plan level only sets how early your <b>loan</b> is reviewed.</div>
    <button class="vbtn gold" onclick="svGo('vip')"><i class="fa-solid fa-crown"></i>Get VIP</button></div>`;
}
// a reminder on service pages: Verified first, then VIP; the text changes every few seconds
const NUDGE = {
  v: [['Get Verified — pay 0% charge', 'Verified members pay no service charge or fee on Digital Services.'], ['Verified members get more', 'Daily rewards, redeem codes, offers and a better approval chance.'], ['One badge, every perk', 'Verify once and unlock rewards, deals and 0 fee orders.']],
  p: [['Go VIP — be served first', 'VIP orders and loan reviews get high priority.'], ['VIP-only services', 'Some services and deals open only for VIP members.'], ['Faster loan with VIP', 'VIP applications are reviewed first — a better chance of early approval.']]
};
function nudge(){
  if(!user() || !SV.st) return ''; const lv = vipLevel(), ver = SV.st.verified === true;
  if(lv >= 3) return ''; const kind = !ver && !lv ? 'v' : 'p', L = NUDGE[kind], n = Math.floor(Date.now() / 7000) % L.length;
  return `<div class="sv-nudge ${kind}" data-k="${kind}" onclick="svGo('${kind === 'v' ? 'verify' : 'vip'}')"><span class="ic">${kind === 'v' ? seal() : '👑'}</span><div><b>${L[n][0]}</b><small>${L[n][1]}</small></div><span class="go">${kind === 'v' ? 'Verify' : lv ? 'Upgrade' : 'Get VIP'}</span></div>`;
}
window._svNudge = nudge;
setInterval(() => document.querySelectorAll('.sv-nudge').forEach(el => { const L = NUDGE[el.dataset.k]; if(!L) return; const n = Math.floor(Date.now() / 7000) % L.length; const b = el.querySelector('b'), sm = el.querySelector('small'); if(b && b.textContent !== L[n][0]){ el.classList.remove('sw'); void el.offsetWidth; el.classList.add('sw'); b.textContent = L[n][0]; sm.textContent = L[n][1]; } }), 1000);
// a page the admin builds: tabs (sections), menu items that open to show text and sub-items, and a button
function customPage(k){
  const t = T[k]; if(!t || !t.custom) return; const c = t.custom, cf = tileCfg(k);
  const secs = (c.sections || []).filter(x => x && x.title); let at = Math.min(window._cxTab && window._cxTab.k === k ? window._cxTab.i : 0, Math.max(0, secs.length - 1));
  const ic = v => /fa-/.test(v || '') ? v : 'fa-solid fa-' + (v || 'star');
  const btn = b => { if(!b || !b.label) return ''; const go = b.kind === 'tile' ? `svGo('${E(b.to)}')` : b.kind === 'extra' ? `xsOpen&&xsOpen('${E(b.to)}')` : b.kind === 'support' ? 'svClose();window.openSupportChat&&openSupportChat()' : /^https:\/\//.test(b.to || '') ? `window.open('${E(b.to)}','_blank','noopener')` : '';
    return go ? `<button class="sv-btn" style="margin-top:9px" onclick="event.stopPropagation();${go}"><i class="fa-solid fa-arrow-right"></i>${E(b.label)}</button>` : ''; };
  const sec = secs[at];
  const items = sec ? (sec.items || []).filter(i => i && i.title) : [];
  const st = cf.status && ST_TXT[cf.status] ? cf.status : 'open';
  show(cf.label || c.label, `<div class="cx-hero"><div class="sv-ic ${E(cf.color || c.color || 'g-teal')}"><i class="${E(ic(cf.icon || c.icon))}"></i></div><div style="min-width:0"><h4>${E(cf.label || c.label)} ${cf.badge ? bdg(cf.badge) : ''}${cf.ver ? `<span class="xs-ver${cf.verKind ? ' ' + E(cf.verKind) : ''}">v${E(cf.ver)}</span>` : ''}</h4>${c.desc ? `<p>${E(c.desc)}</p>` : ''}
      <span class="cx-st ${st}"><i class="fa-solid fa-circle"></i>${st === 'open' ? 'Open now' : st === 'busy' ? 'Busy — replies may be slow' : ST_TXT[st]}</span></div></div>
    ${cf.note || c.note ? `<div class="cx-note"><i class="fa-solid fa-circle-info"></i><span>${E(cf.note || c.note)}</span></div>` : ''}
    ${cf.statusNote && st !== 'open' ? `<div class="cx-note warn"><i class="fa-solid fa-triangle-exclamation"></i><span>${E(cf.statusNote)}</span></div>` : ''}
    ${typeof window._xbStrip === 'function' ? window._xbStrip() : ''}
    ${nudge()}
    ${secs.length > 1 ? `<div class="xs-chips cx-tabs">${secs.map((x, i) => `<button class="${i === at ? 'on' : ''}" onclick="window._cxTab={k:'${k}',i:${i}};svPage('${k}')">${E(x.title)}</button>`).join('')}</div>` : sec ? `<div class="sv-cat">${E(sec.title)}</div>` : ''}
    ${sec && sec.text ? `<div class="sv-card"><p style="white-space:pre-line">${E(sec.text)}</p></div>` : ''}
    <div class="cx-list">${items.map(i => `<div class="cx-it${items.length === 1 ? ' on' : ''}" onclick="this.classList.toggle('on')"><div class="h"><i class="${E(ic(i.icon || 'circle-chevron-right'))}"></i><b>${E(i.title)}</b>${i.tag ? bdg(i.tag) : ''}<i class="fa-solid fa-chevron-down ch"></i></div>
      <div class="b">${i.text ? `<p>${E(i.text)}</p>` : ''}${(i.sub || []).filter(x => x && x.title).map(x => `<div class="cx-sub"><b>${E(x.title)}</b>${x.text ? `<small>${E(x.text)}</small>` : ''}</div>`).join('')}${btn(i.btn)}</div></div>`).join('') || (sec ? '' : '<div class="sv-empty">Nothing here yet.</div>')}</div>
    ${btn(c.btn)}`);
}
function renderHub(){
  const g = document.querySelector('.qa-grid'); if(!g) return;
  const order = (SV.cfg && SV.cfg.hub && Array.isArray(SV.cfg.hub.home) && SV.cfg.hub.home.length) ? SV.cfg.hub.home : HOME_DEF;
  // the admin's tiles, then Language, then All Services (always the last two)
  let keys = myOrder(order.filter(k => k !== 'all' && k !== 'lang' && tileOn(k)).slice(0, 6));
  if(tileOn('lang')) keys.push('lang');
  keys.push('all');
  g.classList.add('sv-hub');
  g.innerHTML = keys.map(tileHtml).join('');
  const ttl = document.querySelector('.quick-actions-title');
  if(ttl && !ttl.querySelector('.qa-see')) ttl.insertAdjacentHTML('beforeend', '<span class="qa-see" onclick="svGo(\'all\')">See all ›</span>');
  const ar = ttl && ttl.querySelector('.qa-arr'), can = hubC().userArrange === true && !!user();
  if(ttl && can && !ar) ttl.insertAdjacentHTML('beforeend', '<span class="qa-arr" onclick="svGo(\'arrange\')" title="Arrange my tiles"><i class="fa-solid fa-arrows-up-down"></i></span>'); else if(ar && !can) ar.remove();
}
window.svRenderHub = renderHub;
// the user's own order of the home tiles (only when the admin allows it; the admin still decides which tiles are there)
function myOrder(keys){ if(hubC().userArrange !== true) return keys; let m = []; try { m = JSON.parse(localStorage.getItem('cf_qorder') || '[]'); } catch (e) {}
  if(!Array.isArray(m) || !m.length) return keys; const ix = k => { const i = m.indexOf(k); return i < 0 ? 99 + keys.indexOf(k) : i; }; return [...keys].sort((a, b) => ix(a) - ix(b)); }
window.svArr = (k, d) => { const order = (hubC().home && hubC().home.length ? hubC().home : HOME_DEF).filter(x => x !== 'all' && x !== 'lang' && tileOn(x)).slice(0, 6); const L = myOrder(order), i = L.indexOf(k), j = i + d;
  if(d === 0){ try { localStorage.removeItem('cf_qorder'); } catch (e) {} } else { if(i < 0 || j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; try { localStorage.setItem('cf_qorder', JSON.stringify(L)); } catch (e) {} }
  renderHub(); window.svPage('arrange'); };

/* ───────── the full-screen sheet ───────── */
let _stack = [];
function sheet(){
  let s = $s('svSheet');
  if(!s){ s = document.createElement('div'); s.id = 'svSheet'; s.className = 'sv-sheet'; s.innerHTML = '<div class="sv-wrap"><div class="sv-head"><button onclick="svBack()" aria-label="Back"><i class="fa-solid fa-arrow-left"></i></button><h3 id="svTitle"></h3><div id="svHx" class="sv-hx"></div><button id="svHomeB" class="sv-homeb" onclick="svHome()" aria-label="Home" style="display:none"><i class="fa-solid fa-house"></i></button></div><div class="sv-body" id="svBody"></div></div>'; document.body.appendChild(s); }
  return s;
}
function show(title, html){
  // the admin's note and a busy notice on that service's own page
  const top = _stack[_stack.length - 1], tc = top && T[top] && !T[top].custom ? tileCfg(top) : {};
  const recent = tc.ver && tc.verAt && Date.now() - new Date(tc.verAt).getTime() < 14 * 864e5, trialOn = tc.trialEnd && new Date(tc.trialEnd).getTime() > Date.now();
  if(recent || trialOn) html = `${trialOn ? `<div class="cx-note trial"><i class="fa-solid fa-flask"></i><span><b>Trial</b> — open until ${new Date(tc.trialEnd).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>` : ''}${recent ? `<div class="cx-note"><i class="fa-solid fa-${tc.verKind === 'fixed' ? 'screwdriver-wrench' : 'rotate'}"></i><span><b>v${E(tc.ver)} · ${tc.verKind === 'fixed' ? 'Fixed' : 'Updated'}</b>${tc.verNote ? ' — ' + E(tc.verNote) : ''}</span></div>` : ''}` + html;
  if(tc.note || tc.status === 'busy') html = `${tc.status === 'busy' ? `<div class="cx-note warn"><i class="fa-solid fa-hourglass-half"></i><span>${E(tc.statusNote || 'This service is busy right now — it may take longer than usual.')}</span></div>` : ''}${tc.note ? `<div class="cx-note"><i class="fa-solid fa-circle-info"></i><span>${E(tc.note)}</span></div>` : ''}` + html;
  sheet().classList.add('on');
  { const hb = $s('svHomeB'); if(hb) hb.style.display = _stack.length > 1 ? '' : 'none'; }
  // the Digital Balance in the header on digital service pages (extra.js decides)
  { const hx = $s('svHx'); if(hx){ let h = ''; try { h = typeof window._svHeadX === 'function' ? window._svHeadX(top) || '' : ''; } catch (e) {} hx.innerHTML = h; } } $s('svTitle').textContent = title; $s('svBody').innerHTML = html; $s('svBody').scrollTop = 0; document.body.style.overflow = 'hidden'; document.body.classList.add('sv-open'); }
let _jump = 0;
window.svGo = function(k, o){
  const t = T[k]; if(!t) return;
  if(t.login && !user()){ if(window.nav) nav('screen-login'); return; }
  if(!t.page){ svClose(); return t.go && t.go(); }
  // a page already open further back: go back to it (no copies piling up, so Back reaches home quickly)
  const at = _stack.indexOf(k);
  if(at >= 0 && !(o && o.replace)){ const n = _stack.length - 1 - at; _stack = _stack.slice(0, at + 1); if(n > 0){ _jump++; try { history.go(-n); } catch (e) { _jump--; } } open(k); return; }
  // a finished step (order placed, deposit sent) is replaced by the next page instead of stacking on it
  if(o && o.replace && _stack.length){ _stack[_stack.length - 1] = k; try { history.replaceState({ sv: k }, ''); } catch (e) {} open(k); return; }
  _stack.push(k); try { history.pushState({ sv: k }, ''); } catch (e) {}
  open(k);
};
// close every open page at once (the house button in the header)
window.svHome = function(){ const n = _stack.length; _stack = []; if(n > 0){ _jump++; try { history.go(-n); } catch (e) { _jump--; } } svClose(true); };
function open(k){ const g = gate(k); if(g) return g(); const P = PAGES[k] || window._svcPages[k]; if(P) P(); }
window.svBack = function(){ try { if(history.state && history.state.sv) { history.back(); return; } } catch (e) {} _pop(); };
function _pop(){ _stack.pop(); const k = _stack[_stack.length - 1]; if(k) open(k); else svClose(true); }
window.svClose = function(silent){ const s = $s('svSheet'); if(s) s.classList.remove('on'); document.body.style.overflow = ''; document.body.classList.remove('sv-open'); _stack = []; renderHub(); };
window.addEventListener('popstate', () => { if(_jump > 0){ _jump--; return; } if($s('svSheet') && $s('svSheet').classList.contains('on')) _pop(); });
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
  // language: two big choices; the choice is remembered on this phone
  lang(){
    const cur = document.documentElement.lang === 'bn' ? 'bn' : 'en';
    const opt = (v, flag, name, sub) => `<div class="sv-card" data-noi18n onclick="svLang('${v}')" style="cursor:pointer;display:flex;align-items:center;gap:14px;${cur === v ? 'border-color:rgba(29,219,128,.6);box-shadow:0 0 0 3px rgba(29,219,128,.15)' : ''}">
      <div style="font-size:30px">${flag}</div><div style="flex:1"><h4 style="margin:0">${name}</h4><p>${sub}</p></div>${cur === v ? '<i class="fa-solid fa-circle-check" style="color:var(--p);font-size:22px"></i>' : '<i class="fa-regular fa-circle" style="color:var(--txt3);font-size:22px"></i>'}</div>`;
    show(cur === 'bn' ? 'ভাষা' : 'Language', opt('en', '🇬🇧', 'English', 'Use the app in English') + opt('bn', '🇧🇩', 'বাংলা', 'অ্যাপটি বাংলায় ব্যবহার করুন')
      + `<div style="font-size:11.5px;color:var(--txt2);text-align:center;margin-top:6px" data-noi18n>${cur === 'bn' ? 'আপনার বাছাই এই ফোনে মনে থাকবে।' : 'Your choice is remembered on this phone.'}</div>`);
  },
  arrange(){
    const order = (hubC().home && hubC().home.length ? hubC().home : HOME_DEF).filter(x => x !== 'all' && x !== 'lang' && tileOn(x)).slice(0, 6), L = myOrder(order);
    show('Arrange my tiles', `<div class="cx-note"><i class="fa-solid fa-circle-info"></i><span>Move your favourite services to the front. This order is saved on this phone.</span></div>
      ${L.map((k, i) => { const t = T[k], c = tileCfg(k); return `<div class="sv-card" style="display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:8px"><div class="sv-ic ${E(c.color || t.g)}" style="width:40px;height:40px;flex:0 0 40px;margin:0;font-size:16px"><i class="${E(/fa-/.test(c.icon || t.ic) ? (c.icon || t.ic) : 'fa-solid fa-' + (c.icon || t.ic))}"></i></div>
        <b style="flex:1;font-size:13.5px">${E(c.label || t.l)}</b><button class="sv-btn ghost" style="width:40px;height:36px;padding:0;margin:0" ${i ? '' : 'disabled'} onclick="svArr('${k}',-1)"><i class="fa-solid fa-arrow-up"></i></button><button class="sv-btn ghost" style="width:40px;height:36px;padding:0;margin:0" ${i < L.length - 1 ? '' : 'disabled'} onclick="svArr('${k}',1)"><i class="fa-solid fa-arrow-down"></i></button></div>`; }).join('')}
      <button class="sv-btn ghost" onclick="svArr('',0)"><i class="fa-solid fa-rotate-left"></i>Reset to default</button>`);
  },
  all(){
    const html = CATS.map(([c, name, ic]) => { const ord = hubC().order || [], ix = k => { const i = ord.indexOf(k); return i < 0 ? 999 : i; }; const ks = Object.keys(T).filter(k => T[k].cat === c && tileOn(k)).sort((a, b) => ix(a) - ix(b)); if(!ks.length) return '';
      // the last tile of each group: suggest a new service for this group only
      const sug = user() && window.xsSug ? `<div class="sv-tile sg" onclick="xsSug('q:${c}','${name.replace('&', 'and')}')"><div class="sv-ic g-slate"><i class="fa-regular fa-lightbulb"></i></div><span>Suggest</span></div>` : '';
      return `<div class="sv-cat"><i class="fa-solid fa-${ic}"></i> ${name}</div><div class="qa-grid sv-hub" style="margin:0">${ks.map(tileHtml).join('')}${sug}</div>`; }).join('');
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
    if(needsV()){ show('Daily Check-in', lockCard('Daily check-in') + `<div class="sv-dim"><div class="ck-days">${R.map((v, i) => `<div class="ck-d ${i === 6 ? 'big' : ''}">Day ${i + 1}<b>${tk(v)}</b></div>`).join('')}</div></div>`); return; }
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
    if(needsV()){ show('Spin & Win', lockCard('Spin & Win') + `<div class="sv-dim"><div class="sp-wrap"><div class="sp-pin"></div><div class="sp-wheel" style="background:conic-gradient(${grad})">${labels}</div><div class="sp-hub">SPIN</div></div></div>`); return; }
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
      admin: ['user-shield', 'g-slate', 'Adjustment'], referral: ['user-plus', 'g-orange', 'Referral bonus'], cashback: ['coins', 'g-gold', 'Cashback'], game: ['gamepad', 'g-pink', 'Game win'], task: ['briefcase', 'g-orange', 'Micro job'], recharge: ['mobile-screen-button', 'g-green', 'Mobile recharge'], refund: ['rotate-left', 'g-slate', 'Refund'] };
    const items = L.map(x => { const m = META[x.type] || ['coins', 'g-teal', 'Wallet']; const pos = Number(x.amount) >= 0;
      return `<div class="wl-it"><div class="ic sv-ic ${m[1]}" style="width:38px;height:38px"><i class="fa-solid fa-${m[0]}"></i></div><div class="m"><b>${E(x.note || m[2])}</b><small>${m[2]} · ${ftime(x.at)}</small></div><div class="a ${pos ? 'p' : 'n'}">${pos ? '+' : '−'}${tk(Math.abs(x.amount))}</div></div>`; }).join('');
    show('Cashback Wallet', `<div class="wl-card"><small>AVAILABLE BALANCE</small><div class="v">${tk(r.data.balance)}</div><div style="font-size:11.5px;color:#b9f5d6;margin-top:6px">Use up to ৳100 on a fee payment, or send it as a gift voucher.</div></div>
      <div class="wl-sum"><div><b style="color:var(--p)">${tk(earned)}</b><span>Earned</span></div><div><b style="color:var(--red)">${tk(spent)}</b><span>Used</span></div><div><b>${L.length}</b><span>Entries</span></div></div>
      <div class="sv-two" style="margin-bottom:14px"><button class="sv-btn ghost" onclick="svGo('redeem')"><i class="fa-solid fa-ticket"></i>Redeem</button><button class="sv-btn ghost" onclick="svGo('voucher')"><i class="fa-solid fa-gift"></i>Gift</button></div>
      <div class="sv-cat">History</div>${items || '<div class="sv-empty"><i class="fa-solid fa-receipt"></i>No wallet activity yet. Check in daily or spin to start earning!</div>'}
      <div style="font-size:11px;color:var(--txt3);text-align:center;margin-top:12px">History is shown from when the wallet started.</div>`);
  },

  async redeem(){
    await loadCfg(); if(!SV.st) await loadState();
    // everyone can open it and see how codes work; only redeeming needs the Verified badge (the server checks)
    const unv = needsV();
    let I = {}; try { I = await (await fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'dailyInfo' }) })).json(); } catch (e) {}
    const amt = I && I.amount ? tk(I.amount) : '';
    const row = (ic, g, t, d) => `<div class="rd-step"><div class="sv-ic ${g}" style="width:38px;height:38px;font-size:15px;border-radius:12px;flex:none"><i class="${ic}"></i></div><div><b>${t}</b><small>${d}</small></div></div>`;
    show('Redeem Code', `<div class="rd-hero"><div class="sv-ic g-purple" style="width:62px;height:62px;margin:0 auto 10px;font-size:26px;border-radius:18px"><i class="fa-solid fa-ticket"></i></div>
        <h4>${I && I.on ? `Daily bonus code${amt ? ' · ' + amt : ''}` : 'Got a code?'}</h4>
        <p>${I && I.on ? `A new code every morning at ${E(I.time || '9:00 AM')}. Redeem it before midnight and ${amt || 'the bonus'} goes to your Creditfy balance.` : 'Enter a redeem code or a gift voucher from a friend. The amount goes straight to your balance.'}</p>
        ${I && I.on ? `<span class="rd-live ${I.live ? 'on' : ''}">${I.live ? '● Today’s code is live' : '○ Today’s code comes at ' + E(I.time || '9:00 AM')}</span>` : ''}</div>
      ${unv ? `<div class="rd-v" onclick="svGo('verify')">${seal('', 'off')}<div><b>Verified members can redeem</b><small>Get your Verified badge once and claim the bonus every day.</small></div><span>Verify</span></div>` : ''}
      <input class="sv-in code" id="rdIn" placeholder="PASTE THE CODE" maxlength="24" autocomplete="off">
      <button class="sv-btn" style="margin-top:12px" id="rdBtn" onclick="svRedeem()"><i class="fa-solid fa-gift"></i>Redeem</button>
      ${I && I.on ? `<span class="sv-lbl" style="margin-top:16px">Where to find today’s code</span>
      <div class="sv-card" style="padding:6px 14px">
        ${row('fa-solid fa-bell', 'g-gold', 'Notification bell', 'In the app every morning, with a Redeem button')}
        ${row('fa-solid fa-mobile-screen', 'g-green', 'Phone notification', 'If notifications are on for this phone')}
        ${row('fa-brands fa-telegram', 'g-blue', 'Telegram channel & bot', 'Tap the code there to copy it')}</div>
      <span class="sv-lbl" style="margin-top:14px">How to redeem</span>
      <div class="sv-card" style="padding:6px 14px">
        ${row('fa-regular fa-copy', 'g-purple', '1. Copy the code', 'From the notification or Telegram')}
        ${row('fa-solid fa-paste', 'g-teal', '2. Paste it above', 'Quick Services → Redeem Code')}
        ${row('fa-solid fa-coins', 'g-orange', '3. Tap Redeem', `${amt || 'The bonus'} goes to your Creditfy balance — once per person, until midnight`)}</div>
      ${I.channelLink || I.bot ? `<div class="rd-tg"><i class="fa-brands fa-telegram"></i><div><b>Never miss the daily bonus</b><small>Join our Telegram — the code is posted there every morning.</small></div></div>
        <div class="rd-tgb">${I.channelLink ? `<a class="sv-btn" style="background:linear-gradient(135deg,#37bbfe,#1d8ed8);color:#fff;text-decoration:none" href="${E(I.channelLink)}" target="_blank" rel="noopener" onclick="return window.tgOpen ? tgOpen(this.href, event) : true"><i class="fa-solid fa-bullhorn"></i>Join channel</a>` : ''}${I.bot ? `<a class="sv-btn ghost" style="text-decoration:none" href="https://t.me/${E(I.bot)}" target="_blank" rel="noopener" onclick="return window.tgOpen ? tgOpen(this.href, event) : true"><i class="fa-solid fa-robot"></i>Open the bot</a>` : ''}</div>` : ''}` : ''}`);
  },

  async voucher(){
    show('Gift Voucher', loading);
    await loadCfg(); const s = await loadState();
    if(needsV()){ show('Gift Voucher', lockCard('Gift vouchers')); return; }
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
      <div class="vip-lv"><i class="fa-solid fa-circle-info"></i><b>Every VIP plan opens all VIP services</b> (Mobile Recharge and VIP Digital Services). The plan level only sets your <b>loan priority</b> — a higher plan is reviewed earlier.</div>
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
    if(s && s.verified){ show('Verify Number', `<div class="vf-hero"><div style="font-size:64px;line-height:1">${seal()}</div><h2>Your account is verified</h2><p>0${E(u.phone)} <span class="vf-chip" data-noi18n>${seal()}VERIFIED</span><br>Since ${fdate(s.verifiedAt)}</p></div><div class="sv-card"><p>Your premium Verified badge shows next to your number and on your profile, and our review team sees that you are a serious customer.</p></div>`); return; }
    show('Verify Number', `<div class="vf-hero"><div style="font-size:64px;line-height:1">${seal()}</div><h2>${E(V.title || 'Get a Verified badge')}</h2><p>${E(V.text || '')}</p></div>
      <div class="vf-why"><div><i class="fa-solid fa-arrow-trend-up"></i>Better approval chance</div><div><i class="fa-solid fa-handshake"></i>Shows you are a serious customer</div><div><i class="fa-solid fa-certificate"></i>Premium badge on your profile</div><div><i class="fa-solid fa-percent"></i>0% charge &amp; 0 fee on Digital Services</div></div>
      <div class="sv-card"><div class="sv-row"><span>Your number</span><b>0${E(u.phone || '')}</b></div><div class="sv-row"><span>One-time fee</span><b>${tk(V.price)}</b></div><div class="sv-row" style="border:0"><span>Pay from</span><b>Any bKash / Nagad number</b></div></div>
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
    const u = user() || {};
    show(kind === 'vip' ? `${plan ? plan.name : 'VIP'} payment` : 'Verification payment', `
      <div class="pp-num" style="border-style:solid;border-color:${kind === 'vip' ? 'rgba(255,215,106,.55)' : 'rgba(70,176,255,.55)'};background:${kind === 'vip' ? 'rgba(255,215,106,.08)' : 'rgba(70,176,255,.08)'}"><div><small>Amount to send · ${kind === 'vip' ? E(plan.name) : 'Verified badge'} · one-time</small><b style="font-family:inherit;color:${kind === 'vip' ? '#ffd76a' : '#46b0ff'}">${tk(price)}</b></div>${window._cpBtn(price)}</div>
      <span class="sv-lbl">1. Choose how to pay</span>
      ${window._payPick('sv')}
      ${kind === 'verify' ? `<div style="font-size:11.5px;color:var(--txt2);margin:6px 2px"><i class="fa-solid fa-circle-info"></i> The full ৳${price} is needed — no discount, coupon or promo code applies to this fee.</div>` : ''}
      <span class="sv-lbl">2. Enter the payment details</span>
      <input class="sv-in code" id="pyTrx" placeholder="TRANSACTION ID" maxlength="30" autocomplete="off">
      ${kind === 'verify' ? '' : `<input class="sv-in" id="pySender" type="tel" placeholder="Paid from number (01XXXXXXXXX)" style="margin-top:8px">`}
      <button class="sv-btn ${kind === 'vip' ? 'gold' : ''}" style="margin-top:12px" id="pyBtn" onclick="svPaySubmit()"><i class="fa-solid fa-paper-plane"></i>Submit payment</button>
      <div style="font-size:11.5px;color:var(--txt2);margin-top:9px;text-align:center;line-height:1.6">Our team checks the payment and switches it on — usually within a few hours. You get a notification.</div>`);
    window._payData = { kind, plan: plan ? plan.id : '', price };
  }
};
window.svLang = function(v){ if(window.setLang) setLang(v); toast(v === 'bn' ? 'ভাষা: বাংলা' : 'Language: English'); setTimeout(() => { svClose(); renderHub(); }, 350); };
window.svPage = k => { const P = PAGES[k] || window._svcPages[k]; if(P) P(); };
window.svToastOk = m => toast(m);

/* ───────── actions ───────── */
function vGate(r){ if(r && !r.ok && r.data && r.data.code === 'verify_required'){ toast(r.data.error, true); setTimeout(() => svGo('verify'), 900); return true; } return false; }
window.svCheckin = async function(){
  const b = $s('ckBtn'); if(b){ b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Checking in…'; }
  const r = await api('checkin');
  if(vGate(r)) return;
  if(!r.ok){ toast(r.data.error || 'Could not check in', true); PAGES.checkin(); return; }
  if(r.data.reward > 0){ coin('+' + tk(r.data.reward)); confetti(); setBal(r.data.balance); }
  toast(`Day ${r.data.streak} done${r.data.reward ? ' · +' + tk(r.data.reward) : ''}!`);
  setTimeout(() => PAGES.checkin(), 900);
};
window.svSpin = async function(){
  const b = $s('spBtn'); if(!b || b.disabled) return; b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Spinning…';
  const r = await api('spin');
  if(vGate(r)) return;
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
  if(vGate(r)) return;
  if(!r.ok){ toast(r.data.error || 'Code not valid', true); return; }
  confetti(); coin('+' + tk(r.data.amount)); setBal(r.data.balance); $s('rdIn').value = '';
  toast(`${tk(r.data.amount)} added to your balance!${r.data.message ? ' “' + r.data.message + '”' : ''}`);
};
window.svVcAmt = (v, el) => { $s('vcAmt').value = v; $s('vcPrev').textContent = tk(v); document.querySelectorAll('.vc-chips button').forEach(b => b.classList.toggle('on', b === el)); };
window.svVoucher = async function(){
  const amount = Number($s('vcAmt').value) || 0;
  const r = await api('giftVoucher', { amount, message: $s('vcMsg').value });
  if(vGate(r)) return;
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
  const w = window._ppCur('sv'); if(!w){ toast('Choose how you paid (bKash, Nagad…)', true); return; }
  const d = { ...(window._payData || {}), payMethod: w.name + (w.type ? ' · ' + w.type : ''), toNumber: w.number }; const trxId = ($s('pyTrx').value || '').trim(), sender = (($s('pySender') || {}).value || '').trim();
  if(trxId.length < 6){ toast('Enter the Transaction ID from your payment SMS', true); return; }
  const b = $s('pyBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Submitting…';
  const r = await api('buyService', { ...d, trxId, sender });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-paper-plane"></i>Submit payment';
  if(!r.ok){ toast(r.data.error || 'Could not submit', true); return; }
  confetti(); toast('Payment submitted — we will switch it on after checking');
  await loadState(); svBack();
};

/* ───────── badges on the profile ───────── */
// the premium Verified seal: a scalloped blue badge with a white tick, slowly turning and glowing
const SEAL_PATH = (() => { let d = ''; for(let i = 0; i < 24; i++){ const a = i * Math.PI / 12, r = i % 2 ? 9.6 : 11.6; d += (i ? 'L' : 'M') + (12 + r * Math.cos(a)).toFixed(2) + ' ' + (12 + r * Math.sin(a)).toFixed(2); } return d + 'Z'; })();
// kind: '' = verified (blue, tick) · 'off' = not verified (grey, outline) · 'wait' = request being checked (orange, clock)
function seal(cls, kind){ const id = 'vg' + Math.random().toString(36).slice(2, 7);
  // body colours (top, middle, bottom), rim, tick
  const C = kind === 'off' ? ['#f3c46b', '#b98228', '#6e4612', '#ffe3a3', '#ffffff']
    : kind === 'wait' ? ['#f3c46b', '#b98228', '#6e4612', '#ffe3a3', '#ffffff']
    : ['#8fd8ff', '#1d8cf2', '#0b47b8', '#e3f4ff', '#ffffff'];
  const mark = kind === 'wait' ? `<path class="ck" d="M12 7.5v4.7l3 1.8" fill="none" stroke="${C[4]}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`
    : kind === 'off' ? `<path class="ck" d="M12 7.2v6M12 16.3v.5" fill="none" stroke="${C[4]}" stroke-width="2.5" stroke-linecap="round"/>`
    : `<path class="ck" d="M7.4 12.3l3 3 6.2-6.4" fill="none" stroke="${C[4]}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"${kind === 'off' ? ' opacity=".95"' : ''}/>`;
  const title = kind === 'off' ? 'Get Verified' : kind === 'wait' ? 'Verification is being checked' : 'Verified';
  return `<span class="vf-seal ${kind || ''} ${cls || ''}" data-noi18n title="${title}" ${kind ? `onclick="event.stopPropagation();svGo('verify')"` : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><defs>
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[0]}"/><stop offset=".55" stop-color="${C[1]}"/><stop offset="1" stop-color="${C[2]}"/></linearGradient>
    <radialGradient id="${id}h" cx=".35" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="${id}c"><path d="${SEAL_PATH}"/></clipPath></defs>
    <path d="${SEAL_PATH}" fill="url(#${id}b)" stroke="${C[3]}" stroke-width="${kind === 'off' ? 1.1 : .8}"/>
    <g clip-path="url(#${id}c)"><ellipse cx="9" cy="6.5" rx="9" ry="6" fill="url(#${id}h)"/>
      <rect x="-12" y="-4" width="6" height="32" fill="url(#${id}s)" transform="rotate(22 12 12)"><animate attributeName="x" values="-12;30;30" keyTimes="0;.55;1" dur="${kind === 'off' ? 2.6 : 3.6}s" repeatCount="indefinite"/></rect></g>
    ${mark}</svg></span>`; }
// verified · pending · not verified (only when the Verified badge is offered)
function vfKind(s){ if(!s) return null; if(s.verified) return ''; if(((SV.cfg || {}).verify || {}).on === false) return null; return (s.orders || []).some(o => o.kind === 'verify' && o.status === 'Pending') ? 'wait' : 'off'; }
window._vfSeal = seal;
function badges(){
  const s = SV.st; if(!s) return;
  const ph = $s('profPhone');
  if(ph){ ph.querySelectorAll('.vf-badge,.vf-chip,.vip-badge').forEach(x => x.remove());
    const k = vfKind(s);
    if(k === '') ph.insertAdjacentHTML('beforeend', `<span class="vf-chip" data-noi18n>${seal()}VERIFIED</span>`);
    else if(k === 'wait') ph.insertAdjacentHTML('beforeend', `<span class="vf-chip wait" onclick="closeModal&&closeModal('profileModal');svGo('verify')">${seal('', 'wait')}Verification pending</span>`);
    else if(k === 'off') ph.insertAdjacentHTML('beforeend', `<span class="vf-chip off" onclick="closeModal&&closeModal('profileModal');svGo('verify')">${seal('', 'off')}<b>Not verified</b><em>Get verified ›</em></span>`);
    if(s.vip) ph.insertAdjacentHTML('beforeend', `<span class="vip-badge" data-noi18n>👑 ${E(s.vip.name)}</span>`); }
  // the profile picture and the top-bar picture get a turning ring and a corner seal
  ['pfAv', 'abAv'].forEach(id => { const a = $s(id); if(!a) return; a.classList.toggle('vf-ring', !!s.verified); a.querySelectorAll('.vf-corner').forEach(x => x.remove()); if(s.verified) a.insertAdjacentHTML('beforeend', seal('vf-corner')); });
  // the phone number in the top bar
  const g = $s('userGreeting');
  if(g){ g.querySelectorAll('.vf-seal').forEach(x => x.remove()); topMark(g, vfKind(s)); }
}
// the app rewrites the top-bar title now and then: put the seal back each time
(function watch(){ const g = $s('userGreeting'); if(!g){ setTimeout(watch, 800); return; }
  new MutationObserver(() => { const row = g.parentElement; if(!(row && row.classList.contains('ab-name') && row.querySelector(':scope > .vf-seal, :scope > .vf-warn'))) topMark(g, vfKind(SV.st)); }).observe(g, { childList: true, characterData: true, subtree: true }); })();
// the title and the seal sit in their own row, so a long number never pushes into the buttons
function nameRow(g){ if(g.parentElement && g.parentElement.classList.contains('ab-name')) return g.parentElement;
  const w = document.createElement('div'); w.className = 'ab-name'; g.parentElement.insertBefore(w, g); w.appendChild(g); return w; }
function topMark(g, k){
  const row = nameRow(g); row.querySelectorAll(':scope > .vf-seal, :scope > .vf-warn').forEach(x => x.remove()); row.classList.remove('has-warn');
  if(k === null || !user()) return;
  if(k === ''){ row.insertAdjacentHTML('beforeend', seal()); const el = row.lastElementChild; el.setAttribute('title', 'Verified'); el.setAttribute('onclick', "event.stopPropagation();svGo('verify')"); return; }
  row.classList.add('has-warn');
  row.insertAdjacentHTML('beforeend', k === 'wait'
    ? `<span class="vf-warn wait" onclick="event.stopPropagation();svGo('verify')" title="Verification pending">${seal('', 'wait')}<span class="lg">Pending</span><span class="sh">Pending</span></span>`
    : `<span class="vf-warn off" onclick="event.stopPropagation();svGo('verify')" title="Not verified — tap to get verified">${seal('', 'off')}<span class="lg">Get verified</span><span class="sh">Verify</span></span>`); }
const _op = window.openProfileModal;
if(typeof _op === 'function') window.openProfileModal = function(){ const r = _op.apply(this, arguments); badges(); if(user()) loadState(); return r; };

/* ───────── promo code on the fee page ───────── */
function appId(){ return window._latestAppId || (window._latestApp && window._latestApp.id) || ''; }
function promoPaint(){
  const box = $s('promoBox'); if(!box) return;
  box.innerHTML = ''; return;   // fees take no promo or coupon (only the one-time sign-up bonus balance)
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
  promoPaint(); return;
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

/* ───────── after login: offers & rewards are for Verified members ───────── */
function vPopShow(){
  if($s('vPop')) return;
  const V = (SV.cfg && SV.cfg.verify) || {}, price = Number(V.price) || 100;
  const d = document.createElement('div'); d.id = 'vPop'; d.className = 'vpop';
  d.innerHTML = `<div class="card" role="dialog" aria-modal="true"><button class="x" aria-label="Close" onclick="vPopClose()"><i class="fa-solid fa-xmark"></i></button>
    <span class="big">${seal('', 'off')}</span><h3>Unlock offers &amp; rewards</h3>
    <p class="sub">On Creditfy, offers, events and rewards are for Verified members. Get your Verified badge once to join them all.</p>
    <div class="row lk"><i class="fa-solid fa-lock"></i><div><b>Daily check-in &amp; Spin &amp; Win</b>Win balance rewards every day and every month</div></div>
    <div class="row lk"><i class="fa-solid fa-lock"></i><div><b>Hot offers, events &amp; prizes</b>Join contests and win invite prizes</div></div>
    <div class="row lk"><i class="fa-solid fa-lock"></i><div><b>Redeem codes &amp; gift vouchers</b>Add codes and send gifts to friends</div></div>
    <div class="row lk"><i class="fa-solid fa-lock"></i><div><b>0% charge · 0 transaction fee</b>On exchange, gift cards, SMM and every Digital Service</div></div>
    <div class="row ok"><i class="fa-solid fa-check"></i><div><b>Your sign-up bonus is already yours</b>Use it on your loan fee — no verification needed</div></div>
    <div class="acts"><button class="vbtn" onclick="vPopClose();svGo('verify')">${seal()}Get Verified for ${tk(price)}</button><button class="later" onclick="vPopClose()">Maybe later</button></div></div>`;
  d.addEventListener('click', e => { if(e.target === d) vPopClose(); });
  document.body.appendChild(d); requestAnimationFrame(() => d.classList.add('on'));
  try { localStorage.setItem('cf_vpop_' + (user() || {}).phone, String(Date.now())); } catch (e) {}
}
window._vPopShow = () => vPopShow();
window.vPopClose = function(){ const d = $s('vPop'); if(!d) return; d.classList.remove('on'); setTimeout(() => d.remove(), 300); };
// fresh login → show now; otherwise at most once a day; never while verification is pending
async function vPopMaybe(fresh){
  const u = user(); if(!u) return;
  await loadCfg(); if(!SV.st) await loadState();
  if(!needsV() || (SV.cfg.verify || {}).on === false) return;
  if((SV.st.orders || []).some(o => o.kind === 'verify' && o.status === 'Pending')) return;
  let last = 0; try { last = Number(localStorage.getItem('cf_vpop_' + u.phone)) || 0; } catch (e) {}
  if(!fresh && Date.now() - last < 864e5) return;
  const wait = () => (document.getElementById('splash') || document.querySelector('.modal-overlay.on,.modal-overlay.active')) ? setTimeout(wait, 1200) : vPopShow();
  setTimeout(wait, fresh ? 1500 : 4000);
}
let _vpPhone = (user() || {}).phone || '';
setInterval(() => { const ph = (user() || {}).phone || ''; if(ph && ph !== _vpPhone){ _vpPhone = ph; SV.st = null; loadState().then(() => { renderHub(); vPopMaybe(true); }); } else if(!ph) _vpPhone = ''; }, 1500);

/* ───────── start ───────── */
function start(){ renderHub(); loadCfg().then(() => { renderHub(); if(user()) loadState().then(() => { renderHub(); vPopMaybe(false); }); }); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
// refresh the red dots after login / logout
window.addEventListener('storage', e => { if(e.key === 'creditUpUser') start(); });
setInterval(() => { if(user() && !SV.st) loadState().then(renderHub); }, 20000);
})();
