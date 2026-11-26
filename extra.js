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
.ln-note{display:-webkit-box;display:flex;position:relative;overflow:hidden;isolation:isolate;gap:11px;align-items:flex-start;text-align:left;border-radius:16px;padding:12px 13px;margin:12px 0;background:linear-gradient(135deg,rgba(255,215,106,.10),rgba(255,140,66,.06));border:1px solid rgba(255,200,90,.35);font-size:12px;color:var(--txt2);line-height:1.55}
.ln-note .ic{flex:0 0 34px;align-self:flex-start;max-height:34px;overflow:hidden;width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:rgba(255,200,90,.16);color:#ffd76a;font-size:15px}
.xb-strip{display:flex;align-items:center;gap:10px;margin:0 0 12px;padding:10px 10px 10px 12px;border-radius:16px;background:linear-gradient(135deg,rgba(29,219,128,.12),rgba(29,219,128,.03));border:1px solid rgba(29,219,128,.35)}
.xb-strip .ic{flex:0 0 34px;width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;color:#03210f;background:linear-gradient(135deg,#3be07c,#14b86a)}
.xb-strip>div{flex:1;min-width:0}.xb-strip small{display:block;font-size:10.5px;color:var(--txt2)}.xb-strip b{font-size:16px;color:var(--txt)}.xb-strip em{display:block;font-style:normal;font-size:10.5px;color:#ff8fa3;font-weight:800}
.xb-strip button{flex:none;border:0;border-radius:11px;padding:8px 11px;font-weight:900;font-size:11.5px;cursor:pointer;font-family:inherit;color:#03210f;background:linear-gradient(135deg,var(--p),var(--p2));display:inline-flex;align-items:center;gap:5px}
.xb-strip button.g{color:var(--txt);background:rgba(255,255,255,.07);border:1px solid var(--bord)}
.xb-strip.empty{border-color:rgba(255,107,129,.45);background:linear-gradient(135deg,rgba(255,107,129,.12),rgba(255,107,129,.03))}
.xs-steps{display:flex;gap:4px;margin:0 0 12px;padding:8px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid var(--bord)}
.xs-steps div{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;font-weight:800;color:var(--txt3);position:relative}
.xs-steps span{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10.5px;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.14)}
.xs-steps .done{color:var(--txt2)}.xs-steps .done span{color:#03210f;background:var(--p);border-color:transparent}
.xs-steps .now{color:#ffd76a}.xs-steps .now span{color:#2a1a00;background:linear-gradient(135deg,#ffe08a,#f2a91d);border-color:#fff3c4}
.xs-menu{display:flex;gap:8px;overflow-x:auto;margin:0 0 10px;padding:2px 2px 4px;scrollbar-width:none}.xs-menu::-webkit-scrollbar{display:none}
.xs-menu button{flex:0 0 auto;min-width:74px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:9px 8px 8px;border-radius:15px;cursor:pointer;font-family:inherit;color:var(--txt2);background:rgba(255,255,255,.035);border:1.5px solid var(--bord)}
.xs-menu button .xs-lg,.xs-menu button .al{flex:none;margin:0!important;width:30px!important;height:30px!important;border-radius:10px;font-size:13px!important;display:flex;align-items:center;justify-content:center}
.xs-menu button .al{background:rgba(255,255,255,.08);color:var(--txt)}
.xs-menu button b{font-size:11px;color:var(--txt);max-width:90px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xs-menu button small{font-size:9.5px;color:var(--txt3)}
.xs-menu button.on{border-color:rgba(29,219,128,.65);background:rgba(29,219,128,.09);box-shadow:0 0 0 3px rgba(29,219,128,.12)}
.xs-sub{justify-content:flex-start}.xs-sub button{flex:0 0 auto!important;width:auto!important;font-size:11.5px!important;padding:6px 11px!important}
.xs-gh{display:flex;align-items:center;gap:8px;margin:14px 2px 8px;font-size:12.5px;font-weight:900;color:var(--txt)}.xs-gh::after{content:"";flex:1;height:1px;background:var(--bord)}.xs-gh small{order:2;font-size:10.5px;color:var(--txt3);font-weight:700}
.xs-gh:first-child{margin-top:2px}
.xs-t .bd.new{background:linear-gradient(135deg,#1ddb80,#0e9a5a);color:#fff}.xs-t .bd.pop{background:linear-gradient(135deg,#b06bff,#7b3fe4);color:#fff}.xs-t .bd.ver{background:linear-gradient(135deg,#1da1f2,#0d6efd);color:#fff}
.xs-t .bd.lk{display:inline-flex;align-items:center;gap:3px;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d);color:#2a1a00}
.xs-t .bd.st{background:#56627a;color:#fff}.xs-t .bd.st.busy{background:linear-gradient(135deg,#ff9f43,#e67e22)}.xs-t .bd.st.closed{background:linear-gradient(135deg,#ff6b81,#c0392b)}
.xs-t.lk .xs-lg{filter:saturate(.7) brightness(.9)}
.xs-pnote{margin:-2px 0 8px;padding:9px 11px;border-radius:12px;background:rgba(77,143,255,.07);border:1px dashed rgba(77,143,255,.35);font-size:11.5px;color:var(--txt2);line-height:1.55}.xs-pnote ol{margin:4px 0 0;padding-left:18px}
.pay-w button .pw-t{display:block;font-size:9.5px;font-weight:700;opacity:.75;margin-top:1px}
.ln-note b{display:block;color:var(--txt);font-size:13px;margin-bottom:2px}
.ln-note .vb{display:inline-flex;align-items:center;gap:5px;margin-top:7px;border:0;border-radius:10px;padding:7px 11px;font-weight:900;font-size:11.5px;cursor:pointer;font-family:inherit;color:#3a2500;background:linear-gradient(135deg,#ffe08a,#f2a91d)}
.ln-note.vip{background:linear-gradient(135deg,rgba(255,215,106,.16),rgba(29,219,128,.06))}
.cz{position:relative;padding-right:46px!important}
.cz-tg{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.16);cursor:pointer;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(160deg,rgba(255,255,255,.14),rgba(255,255,255,.04));color:var(--txt);font-size:11px;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:transform .25s}
.cz-tg i{transition:transform .3s}.cz-slim .cz-tg i{transform:rotate(180deg)}
.cz-tg:hover{transform:scale(1.08)}
.cz-m{min-width:0;flex:1 1 auto;width:100%}
.cz-body{display:block;max-height:600px;overflow:hidden;transition:max-height .35s ease,opacity .3s ease}
.cz-body>div{overflow:hidden}
.cz-slim .cz-body{max-height:0;opacity:0}
.cz-slim{padding-top:9px!important;padding-bottom:9px!important;align-items:center!important}
.cz-slim .ic,.cz-slim .pc-ic{width:28px!important;height:28px!important;flex-basis:28px!important;max-height:28px!important;font-size:12px!important;transition:.3s}
.cz-slim b{margin:0!important}
.ln-note .cz-body>div{padding-top:1px}
/* premium finish */
#xsBlock{position:relative}
#xsBlock::before{content:"";position:absolute;inset:-8px -6px auto;height:180px;border-radius:26px;pointer-events:none;background:radial-gradient(60% 100% at 20% 0%,rgba(255,215,106,.10),transparent 70%),radial-gradient(60% 100% at 90% 0%,rgba(77,143,255,.10),transparent 70%)}
.xs-title em,.xs-title .xs-bal{-webkit-text-fill-color:initial}
.xs-t{overflow:hidden}
.xs-t::after{content:"";position:absolute;top:0;left:-70%;width:45%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.10),transparent);transform:skewX(-12deg);transition:left .6s ease;pointer-events:none}
@media (hover:hover){.xs-t:hover::after{left:130%}.xs-t:hover .xs-lg{box-shadow:0 10px 24px rgba(0,0,0,.45),0 0 0 2px rgba(255,215,106,.35)}}
.xs-t:active{transform:scale(.97)}
.xs-lg{transition:box-shadow .25s}
.xs-it{position:relative;overflow:hidden;background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.015));transition:transform .15s,border-color .2s}
.xs-it:active{transform:scale(.99)}
.xs-it::before{content:"";position:absolute;left:0;top:12%;bottom:12%;width:3px;border-radius:3px;background:linear-gradient(180deg,#ffd76a,#4d8fff);opacity:.7}
.xs-hero{box-shadow:0 14px 30px rgba(0,0,0,.28)}
.xs-cd{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;color:#ffd76a;white-space:nowrap}
.xs-cd b{font-family:ui-monospace,monospace;font-size:11.5px;letter-spacing:.3px;padding:2px 6px;border-radius:7px;background:rgba(255,215,106,.12);color:#ffe9a8}
.xs-it{flex-wrap:wrap}
.xs-it .pr .was{display:block;font-size:11px;font-weight:700;color:var(--txt3)}
.xs-it .pr .now{color:#ffd76a;font-size:16px;text-shadow:0 0 14px rgba(255,215,106,.35)}
.xs-off{flex-basis:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,215,106,.25)}
.xs-off .tg,.xs-deal .tg{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:900;letter-spacing:.4px;padding:3px 8px;border-radius:8px;color:#2a1a00;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d)}
.xs-t .bd{top:5px;right:5px;z-index:2}
.xs-t .bd.sale{background:linear-gradient(135deg,#ff6b81,#e0334f);color:#fff}
.xs-deal{position:relative;overflow:hidden;border-radius:18px;padding:12px;margin:0 0 12px;background:radial-gradient(120% 140% at 100% 0%,rgba(255,107,129,.20),transparent 55%),linear-gradient(135deg,#2a1a08,#1a1430 70%);border:1px solid rgba(255,200,90,.45);box-shadow:0 10px 26px rgba(0,0,0,.3)}
.xs-deal .hd{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:9px}
.xs-deal .row{display:flex;align-items:center;gap:11px;padding:8px;border-radius:13px;background:rgba(255,255,255,.05);cursor:pointer;margin-top:6px}
.xs-deal .row .xs-lg{width:42px;height:42px;font-size:18px;flex:none;border-radius:13px}
.xs-deal .m{min-width:0;flex:1}.xs-deal .m b{display:block;font-size:13px;color:var(--txt)}.xs-deal .m small{font-size:11px;color:var(--txt2)}
.xs-deal .pp{text-align:right;flex:none}.xs-deal .pp s{display:block;font-size:11px;color:var(--txt3)}.xs-deal .pp b{font-size:17px;color:#ffd76a;font-weight:900}
.xs-deal .pp em{display:block;font-style:normal;font-size:10px;font-weight:900;color:#ff8fa3}
.xs-deal.soon{background:linear-gradient(135deg,#141c33,#1a1430);border-color:rgba(120,160,255,.35)}
.xb-cp{display:grid;grid-template-columns:1fr auto;gap:8px;margin:2px 0 6px}.xb-cp button{border:0;border-radius:14px;padding:0 18px;font-weight:900;font-family:inherit;cursor:pointer;color:#2a1a00;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d)}
.xb-bonus{border-radius:16px;padding:12px;margin:0 0 12px;background:linear-gradient(135deg,rgba(255,215,106,.12),rgba(29,219,128,.06));border:1px solid rgba(255,215,106,.4)}
.xb-bonus .h{font-size:13px;font-weight:900;color:#ffd76a;display:flex;gap:7px;align-items:center;margin-bottom:8px}
.xb-bonus .tiers{display:flex;gap:7px;margin-bottom:8px}.xb-bonus .tiers div{flex:1;text-align:center;border-radius:11px;padding:7px 4px;background:rgba(0,0,0,.2)}
.xb-bonus .tiers b{display:block;font-size:16px;color:#fff}.xb-bonus .tiers small,.xb-bonus>small{font-size:10.5px;color:var(--txt2)}
.xb-bonus .you{margin-top:6px;font-size:12.5px;color:var(--p);font-weight:700}
.rc-lock{text-align:center;border-radius:22px;padding:24px 16px 16px;background:radial-gradient(120% 100% at 50% 0%,rgba(29,219,128,.22),transparent 60%),linear-gradient(160deg,#0f2430,#0a1426);border:1px solid rgba(29,219,128,.35)}
.rc-lock .big{width:62px;height:62px;margin:0 auto 10px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;background:linear-gradient(135deg,#1ddb80,#0e9a5a)}
.rc-lock h3{margin:0 0 6px;color:var(--txt)}.rc-lock p{margin:0 0 14px;font-size:12.5px;color:var(--txt2)}
.rc-hero{display:flex;justify-content:space-between;align-items:center;border-radius:18px;padding:14px 16px;margin-bottom:12px;color:#fff;background:linear-gradient(135deg,#0d7a52,#0a3d6b)}
.rc-hero small{font-size:10.5px;font-weight:800;letter-spacing:.5px;opacity:.85}.rc-hero b{display:block;font-size:24px}
.rc-hero button{border:0;border-radius:12px;padding:9px 13px;font-weight:900;font-family:inherit;cursor:pointer;background:rgba(255,255,255,.18);color:#fff}
.rc-ops{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:6px 0 10px}.rc-ops button,.rc-type button{border-radius:12px;padding:10px 4px;border:1.5px solid var(--gbord);background:var(--glass);color:var(--txt);font-weight:800;font-size:12px;cursor:pointer;font-family:inherit}
.rc-ops button.on,.rc-type button.on{border-color:var(--p);background:rgba(29,219,128,.12);color:var(--p)}
.rc-type{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.mj-hero{display:flex;justify-content:space-between;align-items:center;border-radius:20px;padding:16px;margin-bottom:12px;color:#fff;background:radial-gradient(120% 140% at 100% 0%,rgba(255,140,66,.4),transparent 55%),linear-gradient(135deg,#2a1708,#14203a)}
.mj-hero small{font-size:10.5px;font-weight:800;letter-spacing:.5px;color:#ffc89a}.mj-hero b{display:block;font-size:28px;margin:2px 0}.mj-hero span{font-size:11.5px;color:#d9c3b0}.mj-hero>i{font-size:34px;color:#ffb27a;opacity:.8}
.mj-t{display:flex;align-items:center;gap:12px;border-radius:16px;padding:12px;margin-bottom:8px;cursor:pointer;background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.015));border:1px solid var(--bord)}
.mj-t .m{flex:1;min-width:0}.mj-t b{display:block;font-size:13.5px;color:var(--txt)}.mj-t small{font-size:11px;color:var(--txt2)}
.mj-t .r{text-align:right;flex:none}.rw{display:inline-block;font-weight:900;font-size:14px;color:#1ddb80}
.mj-st{display:block;margin-top:3px;font-size:10px;font-weight:900}.mj-st.ok{color:var(--p)}.mj-st.wait{color:#ffae6b}.mj-st.no{color:#ff8fa3}.mj-st.full{color:var(--txt3)}
.mj-dh{display:flex;gap:13px;align-items:center;margin-bottom:12px}.mj-dh .xs-lg{width:56px;height:56px;font-size:24px;flex:none}.mj-dh h4{margin:0 0 5px;font-size:16px;color:var(--txt)}
/* square, realistic 3D glass icons (Quick Services + Extra Services) */
.sv-ic,.xs-lg{border-radius:14px!important;position:relative;overflow:hidden;
  box-shadow:0 10px 18px -6px rgba(0,0,0,.55),0 3px 6px rgba(0,0,0,.35),inset 0 1.5px 0 rgba(255,255,255,.55),inset 0 -4px 8px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.18)!important}
.sv-ic::before,.xs-lg::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(160deg,rgba(255,255,255,.38) 0%,rgba(255,255,255,.10) 38%,rgba(255,255,255,0) 52%,rgba(0,0,0,.10) 100%);pointer-events:none;z-index:1}
.sv-ic::after,.xs-lg::after{content:""!important;position:absolute!important;left:8%!important;right:8%!important;top:5%!important;height:42%!important;border-radius:10px 10px 50% 50%/10px 10px 22% 22%!important;background:linear-gradient(180deg,rgba(255,255,255,.42),rgba(255,255,255,.04))!important;pointer-events:none;z-index:1}
.sv-ic i,.xs-lg i{position:relative;z-index:2;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35)) drop-shadow(0 0 6px rgba(255,255,255,.25))}
.xs-lg.img::before,.xs-lg.img::after{opacity:.6}
.sv-tile .sv-ic,.xs-t .xs-lg{transition:transform .2s}
@media (hover:hover){.sv-tile:hover .sv-ic,.xs-t:hover .xs-lg{transform:translateY(-2px) rotate(-2deg)}}
.xs-t .bd.earn{background:linear-gradient(135deg,#ffb35c,#ff7a2f);color:#2a1300}
/* living 3D icons: each glows in its own colour, floats gently, and a light sweep passes over the glass */
.sv-ic,.xs-lg{--glow:rgba(29,219,128,.55)}
.g-green{--glow:rgba(29,219,128,.6)}.g-teal{--glow:rgba(47,214,208,.55)}.g-cyan{--glow:rgba(56,189,248,.55)}.g-blue{--glow:rgba(77,143,255,.6)}
.g-purple{--glow:rgba(168,85,247,.6)}.g-pink{--glow:rgba(255,111,165,.6)}.g-red{--glow:rgba(255,90,110,.6)}.g-orange{--glow:rgba(255,140,66,.6)}
.g-gold{--glow:rgba(255,201,77,.6)}.g-slate{--glow:rgba(148,170,210,.45)}.g-dark{--glow:rgba(148,170,210,.35)}
.sv-tile .sv-ic,.xs-t .xs-lg{animation:icFloat 4.6s ease-in-out infinite,icGlow 4.6s ease-in-out infinite;will-change:transform}
.sv-tile:nth-child(4n+2) .sv-ic,.xs-t:nth-child(4n+2) .xs-lg{animation-delay:-1.1s,-1.1s}
.sv-tile:nth-child(4n+3) .sv-ic,.xs-t:nth-child(4n+3) .xs-lg{animation-delay:-2.3s,-2.3s}
.sv-tile:nth-child(4n) .sv-ic,.xs-t:nth-child(4n) .xs-lg{animation-delay:-3.4s,-3.4s}
@keyframes icFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(-1.5deg)}}
@keyframes icGlow{0%,100%{box-shadow:0 10px 18px -6px rgba(0,0,0,.55),0 0 14px -4px var(--glow),inset 0 1.5px 0 rgba(255,255,255,.55),inset 0 -4px 8px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.18)}
  50%{box-shadow:0 14px 22px -6px rgba(0,0,0,.5),0 0 22px 0 var(--glow),inset 0 1.5px 0 rgba(255,255,255,.6),inset 0 -4px 8px rgba(0,0,0,.25),inset 0 0 0 1px rgba(255,255,255,.22)}}
/* the light sweep (a moving band on the glass layer) */
.sv-ic::before,.xs-lg::before{background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.5) 50%,transparent 65%) no-repeat,linear-gradient(160deg,rgba(255,255,255,.38) 0%,rgba(255,255,255,.10) 38%,rgba(255,255,255,0) 52%,rgba(0,0,0,.10) 100%)!important;
  background-size:250% 100%,100% 100%!important;background-position:160% 0,0 0!important;animation:icSweep 6s ease-in-out infinite}
.sv-tile:nth-child(odd) .sv-ic::before,.xs-t:nth-child(odd) .xs-lg::before{animation-delay:-3s}
@keyframes icSweep{0%,70%{background-position:160% 0,0 0}100%{background-position:-60% 0,0 0}}
/* the symbol itself looks embossed */
.sv-ic i,.xs-lg i{text-shadow:0 1px 0 rgba(255,255,255,.25),0 2px 0 rgba(0,0,0,.14),0 3px 0 rgba(0,0,0,.1),0 5px 8px rgba(0,0,0,.35)}
/* a little tilt when touched / hovered */
.sv-tile:active .sv-ic,.xs-t:active .xs-lg{transform:scale(.94)!important}
@media (hover:hover){.sv-tile:hover .sv-ic,.xs-t:hover .xs-lg{animation-play-state:paused;transform:translateY(-4px) rotate(-4deg) scale(1.05)!important;box-shadow:0 16px 26px -6px rgba(0,0,0,.5),0 0 26px 2px var(--glow),inset 0 1.5px 0 rgba(255,255,255,.6),inset 0 -4px 8px rgba(0,0,0,.25)!important}}
/* the tile itself picks up a faint coloured light from its icon */
.sv-tile,.xs-t{background-image:linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.02))!important}
.sv-tile,.xs-t{background-image:radial-gradient(70% 55% at 50% 30%,color-mix(in srgb,var(--tglow,transparent) 22%,transparent),transparent 70%),linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.02))!important}
.sv-tile:has(.g-green),.xs-t:has(.g-green){--tglow:#1ddb80}
.sv-tile:has(.g-teal),.xs-t:has(.g-teal){--tglow:#2fd6d0}
.sv-tile:has(.g-cyan),.xs-t:has(.g-cyan){--tglow:#38bdf8}
.sv-tile:has(.g-blue),.xs-t:has(.g-blue){--tglow:#4d8fff}
.sv-tile:has(.g-purple),.xs-t:has(.g-purple){--tglow:#a855f7}
.sv-tile:has(.g-pink),.xs-t:has(.g-pink){--tglow:#ff6fa5}
.sv-tile:has(.g-red),.xs-t:has(.g-red){--tglow:#ff5a6e}
.sv-tile:has(.g-orange),.xs-t:has(.g-orange){--tglow:#ff8c42}
.sv-tile:has(.g-gold),.xs-t:has(.g-gold){--tglow:#ffc94d}
.sv-tile:has(.g-slate),.xs-t:has(.g-slate){--tglow:#94aad2}
@media (prefers-reduced-motion:reduce){.sv-tile .sv-ic,.xs-t .xs-lg{animation:icGlow 6s ease-in-out infinite}}
/* Extra Balance notice */
.xb-note{display:flex;align-items:center;gap:10px;border-radius:16px;padding:10px 10px 10px 12px;margin:0 0 12px;background:linear-gradient(135deg,rgba(255,215,106,.16),rgba(242,169,29,.06));border:1px solid rgba(255,215,106,.55)}
.xb-note>i{flex:none;font-size:18px;color:#ffd76a}
.xb-note b{display:block;font-size:12.5px;color:#ffe9a8}.xb-note span{display:block;font-size:11px;color:#d9c9a0;line-height:1.45;margin-top:1px}
.xb-note button{flex:none;border:0;border-radius:11px;padding:8px 11px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit;color:#2a1a00;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d);display:inline-flex;gap:5px;align-items:center}
.xb-note.empty{animation:xbPulse 2.2s ease-in-out infinite}
@keyframes xbPulse{50%{box-shadow:0 0 0 4px rgba(255,215,106,.15);border-color:#ffd76a}}
.xs-perk{padding:10px 12px!important}.xs-perk .sl{font-size:28px!important}.xs-perk b{font-size:12.5px!important}.xs-perk p{font-size:11px!important}
/* one slim-bordered box per home section */
.hs-box{position:relative;border-radius:24px;padding:4px 10px 12px;margin:26px -8px 22px;border:1px solid rgba(255,255,255,.10);background:linear-gradient(170deg,rgba(255,255,255,.035),rgba(255,255,255,.008));box-shadow:0 12px 30px rgba(0,0,0,.22)}
.hs-box .quick-actions-title{margin-top:16px}
.hs-box .qa-grid{margin-bottom:6px}
.hs-box.qs{border-color:rgba(29,219,128,.22)}
.hs-box.xs{border-color:rgba(255,215,106,.26);padding-top:14px}
.hs-box.xs .xs-head{margin-top:0}
.hs-box.xs .xs-grid{margin-bottom:12px}
.hs-box.xs #xsLive.xs-live{margin:2px 0 0}
.hs-box.xs .xs-grid:last-child{margin-bottom:0}
.xs-li:last-child{border-bottom:0}
.hs-tag{position:absolute;top:-10px;left:16px;z-index:2;display:inline-flex;align-items:center;gap:5px;font-size:9.5px;font-weight:900;letter-spacing:.3px;padding:3px 9px;border-radius:9px;background:#0b1424;border:1px solid rgba(29,219,128,.35);color:var(--p)}
.hs-box.xs>.hs-tag{border-color:rgba(255,215,106,.4);color:#ffd76a}
#liveBlock,#statsBlock,#winBlock{border-radius:24px;padding:12px;border:1px solid rgba(255,255,255,.10);background:linear-gradient(170deg,rgba(255,255,255,.035),rgba(255,255,255,.008))}
#liveBlock{margin:0 -8px 22px}#statsBlock,#winBlock{margin-left:-8px;margin-right:-8px}
#screen-home .home-body>.ln-note,#screen-home .home-body>#pushCard,#screen-home .home-body>.info-card,#screen-home .home-body>#userStatusCard{margin-left:-8px;margin-right:-8px}
#screen-home .home-body>.info-card{margin-top:4px;margin-bottom:22px;border-radius:24px}
#screen-home #liveSection{margin-top:0!important}
#xsBlock.hs-box::before{display:none}
/* premium section v2 */
.xs-head{position:relative;overflow:hidden;border-radius:22px;padding:15px 14px 13px;margin:22px 0 12px;background:radial-gradient(120% 120% at 0% 0%,rgba(255,215,106,.20),transparent 55%),radial-gradient(120% 140% at 100% 100%,rgba(77,143,255,.22),transparent 55%),linear-gradient(150deg,#141b30,#0b1222);border:1px solid rgba(255,215,106,.28);box-shadow:0 16px 36px rgba(0,0,0,.35)}
.xs-head::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.08),transparent);animation:xsSweep 5s ease-in-out infinite}
.xs-head .xs-title{font-size:18px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;margin:0}
.xs-head small{display:block;font-size:11.5px;color:#9fb2d6;margin-top:3px;line-height:1.45}
.xs-head .a{display:flex;gap:8px;margin-top:12px}
.xs-head .xs-bal{flex:1;margin:0;justify-content:flex-start;padding:7px 8px 7px 10px;border-radius:14px;font-size:14px;gap:9px;cursor:pointer;font-family:inherit;color:var(--txt)}
.xs-head .xs-bal span{display:flex;flex-direction:column;line-height:1.15;text-align:left}.xs-head .xs-bal span small{font-size:9.5px;color:#9fd8bb;margin:0;font-weight:800;letter-spacing:.4px}
.xs-head .xs-bal .p{margin-left:auto}
.xs-ord{flex:none;display:inline-flex;align-items:center;gap:7px;border-radius:14px;padding:0 13px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:var(--txt);font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit}
.xs-cat{display:flex;align-items:center;margin:4px 2px 9px;font-size:13px;font-weight:900;color:var(--txt)}
.xs-hot{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 10px;margin-bottom:8px;scrollbar-width:none}.xs-hot::-webkit-scrollbar{display:none}
.xs-hc{position:relative;flex:none;width:136px;scroll-snap-align:start;border-radius:16px;padding:11px;cursor:pointer;background:linear-gradient(160deg,rgba(255,215,106,.10),rgba(255,255,255,.02));border:1px solid rgba(255,215,106,.35)}
.xs-hc .xs-lg{width:38px;height:38px;font-size:16px;border-radius:12px}.xs-hc b{display:block;font-size:11.5px;color:var(--txt);margin:7px 0 4px;line-height:1.3;height:30px;overflow:hidden}
.xs-hc .pp s,.xs-pc .pp s{font-size:10.5px;color:var(--txt3);margin-right:5px}.xs-hc .pp span{font-size:15px;font-weight:900;color:#ffd76a}
.xs-hc .xs-cd{margin-top:5px}.xs-hc .xs-cd i{display:none}
.xs-hc .off,.xs-pc .off{position:absolute;top:8px;right:8px;font-size:10px;font-weight:900;padding:2px 7px;border-radius:8px;color:#fff;background:linear-gradient(135deg,#ff6b81,#e0334f);box-shadow:0 4px 10px rgba(224,51,79,.35)}
.xs-red{position:relative;overflow:hidden;display:flex;align-items:center;gap:12px;border-radius:18px;padding:12px 13px;margin:0 0 12px;cursor:pointer;background:linear-gradient(135deg,#3a0a14,#7a0f24 55%,#2a0710);border:1px solid rgba(255,90,110,.55);box-shadow:0 12px 28px rgba(150,10,40,.35)}
.xs-red::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.14),transparent);animation:xsSweep 3s ease-in-out infinite}
.xs-red .rb{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:19px;color:#fff;background:linear-gradient(135deg,#ff4d6a,#b3122e);box-shadow:0 0 0 3px rgba(255,77,106,.18)}
.xs-red.live .rb{animation:xsPulse 1.6s infinite}
.xs-red .m{flex:1;min-width:0}.xs-red b{display:block;font-size:15px;color:#fff;letter-spacing:.3px}.xs-red small{font-size:11px;color:#ffc2cb}
.xs-red .r .xs-cd{color:#ffd0d6}.xs-red .r .xs-cd b{background:rgba(0,0,0,.25);color:#fff}.xs-red .r .xs-cd i{display:none}
.xs-redhero{border-radius:22px;padding:22px 16px 16px;margin-bottom:14px;text-align:center;color:#fff;background:radial-gradient(120% 100% at 50% 0%,rgba(255,77,106,.45),transparent 60%),linear-gradient(160deg,#4a0c1a,#1b0710);border:1px solid rgba(255,90,110,.5)}
.xs-redhero .big{width:62px;height:62px;margin:0 auto 8px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;background:linear-gradient(135deg,#ff4d6a,#b3122e);box-shadow:0 10px 26px rgba(255,77,106,.4)}
.xs-redhero h3{margin:0;font-size:22px;letter-spacing:.5px}.xs-redhero p{margin:6px 0 10px;font-size:12.5px;color:#ffd0d6}
.xs-redhero .cdw .xs-cd{font-size:13px;color:#fff}.xs-redhero .cdw .xs-cd b{font-size:17px;padding:4px 10px;background:rgba(0,0,0,.3);color:#fff}
.xs-redhero small{display:block;margin-top:9px;font-size:11px;color:#ffb3bf}
.xs-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.xs-meta span{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:8px;background:rgba(255,255,255,.06);color:var(--txt2)}
.xs-meta span.o{background:rgba(255,215,106,.14);color:#ffd76a}
.xs-tool{display:flex;gap:8px;margin-bottom:10px}
.xs-srch{flex:1;position:relative}.xs-srch i{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--txt2);font-size:13px}
.xs-srch input{width:100%;box-sizing:border-box;height:44px;border-radius:13px;border:1.5px solid var(--gbord);background:rgba(255,255,255,.04);color:var(--txt);padding:0 12px 0 36px;font-size:14px;font-family:inherit;outline:none}
.xs-tool select{flex:none;height:44px;border-radius:13px;border:1.5px solid var(--gbord);background:#0f1a30;color:var(--txt);padding:0 8px;font-size:12px;font-weight:700;font-family:inherit;max-width:42%}
.xs-chips{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:2px;scrollbar-width:none}.xs-chips::-webkit-scrollbar{display:none}
.xs-chips button{flex:none;border-radius:20px;padding:7px 13px;border:1px solid var(--gbord);background:var(--glass);color:var(--txt2);font-weight:800;font-size:12px;cursor:pointer;font-family:inherit}
.xs-chips button.on{background:linear-gradient(135deg,rgba(255,215,106,.22),rgba(242,169,29,.12));color:#ffd76a;border-color:rgba(255,215,106,.55)}
.xs-pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.xs-pc{position:relative;display:flex;flex-direction:column;border-radius:18px;padding:12px;cursor:pointer;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.015));border:1px solid var(--bord);box-shadow:0 10px 22px rgba(0,0,0,.25);transition:transform .15s,border-color .2s}
.xs-pc:active{transform:scale(.98)}@media (hover:hover){.xs-pc:hover{border-color:rgba(255,215,106,.5);transform:translateY(-2px)}}
.xs-pc.sale{border-color:rgba(255,215,106,.45);background:linear-gradient(160deg,rgba(255,215,106,.10),rgba(255,255,255,.015))}
.xs-pc .xs-lg{width:40px;height:40px;font-size:17px;border-radius:12px}
.xs-pc b{font-size:12.5px;color:var(--txt);margin:9px 0 2px;line-height:1.3}.xs-pc small{font-size:10.5px;color:var(--txt2)}
.xs-pc em{font-style:normal;font-size:10.5px;color:var(--txt3);margin-top:3px;line-height:1.35}
.xs-pc .pp{margin-top:auto;padding-top:8px}.xs-pc .pp span{font-size:17px;font-weight:900;color:var(--txt)}.xs-pc.sale .pp span{color:#ffd76a;text-shadow:0 0 14px rgba(255,215,106,.35)}
.xs-pc .vp{display:inline-flex;align-items:center;gap:4px;align-self:flex-start;margin-top:4px;font-size:10px;font-weight:800;color:#9fd2ff;padding:2px 7px;border-radius:8px;background:rgba(70,176,255,.12);border:1px solid rgba(70,176,255,.3)}
.xs-pc .vp.ok{color:var(--p);background:rgba(29,219,128,.1);border-color:rgba(29,219,128,.3)}.xs-pc .vp.ok{color:var(--p)}
.xs-pc .ct{display:flex;align-items:center;gap:5px;margin-top:6px;font-size:10px;font-weight:900;color:#ffd76a}.xs-pc .ct .xs-cd i{display:none}
.xs-pc .hot{position:absolute;top:8px;right:8px;display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:900;padding:2px 7px;border-radius:8px;color:#ff9a6b;background:rgba(255,122,89,.14)}
.xs-pc .off+.hot{top:30px}
.xs-pc .go{margin-top:9px;text-align:center;border-radius:11px;padding:8px;font-size:12px;font-weight:900;color:#2a1a00;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d)}
.xs-pc.lock{cursor:default;opacity:.85}.xs-pc.lock .go{background:rgba(255,255,255,.07);color:var(--txt2)}
.xs-ir{flex-wrap:nowrap!important}.xs-ir .xs-lg{width:40px;height:40px;font-size:17px;flex:none;border-radius:12px!important}
.xs-go{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:900;color:var(--p)}
.xs-how{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
.xs-how div{border-radius:14px;padding:11px 6px;text-align:center;background:rgba(255,255,255,.035);border:1px solid var(--bord)}
.xs-how i{color:#ffd76a;font-size:16px}.xs-how b{display:block;font-size:12px;color:var(--txt);margin-top:5px}.xs-how small{font-size:10px;color:var(--txt2)}
@media (max-width:360px){.xs-pgrid{gap:8px}.xs-pc{padding:10px}}
@media (max-width:360px){.xs-grid{gap:8px}.xs-lg{width:46px;height:46px;font-size:20px}}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

// each option (pack) can have its own icon or logo (Admin → Extra services → Icon); otherwise one is picked from its name / category
const AUTO_IC = [[/google\s*play/i, 'fa-brands fa-google-play', 'g-green'], [/itunes|apple/i, 'fa-brands fa-apple', 'g-slate'], [/steam/i, 'fa-brands fa-steam', 'g-dark'],
  [/telegram/i, 'fa-brands fa-telegram', 'g-blue'], [/whatsapp/i, 'fa-brands fa-whatsapp', 'g-green'], [/facebook|meta/i, 'fa-brands fa-facebook', 'g-blue'], [/youtube/i, 'fa-brands fa-youtube', 'g-red'],
  [/instagram/i, 'fa-brands fa-instagram', 'g-pink'], [/tiktok/i, 'fa-brands fa-tiktok', 'g-dark'], [/netflix/i, 'fa-solid fa-film', 'g-red'], [/spotify/i, 'fa-brands fa-spotify', 'g-green'],
  [/pubg|free\s*fire|uc\b|diamond/i, 'fa-solid fa-gamepad', 'g-orange'], [/visa/i, 'fa-brands fa-cc-visa', 'g-blue'], [/master\s*card/i, 'fa-brands fa-cc-mastercard', 'g-orange'],
  [/usdt|tether|crypto/i, 'fa-solid fa-coins', 'g-teal'], [/dollar|payoneer|wise|usd/i, 'fa-solid fa-dollar-sign', 'g-green'], [/bkash/i, 'fa-solid fa-mobile-screen', 'g-pink'],
  [/nagad/i, 'fa-solid fa-mobile-screen', 'g-orange'], [/rocket/i, 'fa-solid fa-rocket', 'g-purple'], [/daraz/i, 'fa-solid fa-bag-shopping', 'g-orange'], [/apex|shoe/i, 'fa-solid fa-shoe-prints', 'g-red'],
  [/domain/i, 'fa-solid fa-globe', 'g-cyan'], [/hosting|server/i, 'fa-solid fa-server', 'g-purple'], [/shopping/i, 'fa-solid fa-bag-shopping', 'g-orange'], [/web/i, 'fa-solid fa-globe', 'g-cyan']];
function ilogo(s, i){
  if(!i) return logo(s);
  if(i.icon && /^https:\/\//i.test(i.icon)) return `<div class="xs-lg img"><img src="${E(i.icon)}" alt="${E(i.name)}" loading="lazy"></div>`;
  if(i.icon) return `<div class="xs-lg ${E(i.color || s.color)}"><i class="${E(i.icon)}"></i></div>`;
  const m = AUTO_IC.find(([re]) => re.test(i.name + ' ' + (i.cat || '')));
  return m ? `<div class="xs-lg ${E(i.color || m[2])}"><i class="${m[1]}"></i></div>` : logo(s);
}
function logo(s){ return s.logo ? `<div class="xs-lg img"><img src="${E(s.logo)}" alt="${E(s.name)}" loading="lazy"></div>` : `<div class="xs-lg ${E(s.color)}"><i class="${E(s.icon)}"></i></div>`; }
const svcs = () => ((X.cfg && X.cfg.services) || []).filter(s => s.on);
const isV = () => !!(X.xb && (X.xb.verified || X.xb.vip));
const PK = () => (X.cfg && X.cfg.perk) || { on: false };
// offers with a real end (the same rule as the server): an offer price until its end time, or a weekday deal until midnight (Bangladesh time)
const BDMS = 6 * 3600e3;
const bdWd = (t = Date.now()) => new Date(t + BDMS).getUTCDay();
function bdMid(t = Date.now()){ const d = new Date(t + BDMS); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - BDMS; }
function priceNow(s, i, t = Date.now()){
  let price = i.price, kind = '', ends = '';
  if(s.mode !== 'amount'){
    const end = i.offerEnd ? new Date(i.offerEnd).getTime() : 0;
    if(i.offer > 0 && i.offer < price && end > t){ price = i.offer; kind = 'offer'; ends = end; }
    const d = ((X.cfg && X.cfg.deals) || []).find(x => x.on && x.sid === s.id && x.iid === i.id && x.days.includes(bdWd(t)) && x.price < price);
    if(d){ price = d.price; kind = 'deal'; ends = bdMid(t); }
  }
  return { price, was: i.price, kind, ends };
}
const withNow = (s, i) => ({ ...i, price: priceNow(s, i).price });
// live countdowns: every [data-end] shows the time left; when it reaches zero the page is drawn again with the regular price
const left = ms => { ms = Math.max(0, ms); const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, sc = Math.floor(ms / 1e3) % 60, p = n => String(n).padStart(2, '0');
  return (d ? d + 'd ' : '') + p(h) + ':' + p(m) + ':' + p(sc); };
const cd = (end, lbl) => `<span class="xs-cd" data-end="${end}"><i class="fa-regular fa-clock"></i>${lbl ? E(lbl) + ' ' : ''}<b>${left(end - Date.now())}</b></span>`;
setInterval(() => {
  let over = false;
  document.querySelectorAll('.xs-cd[data-end]').forEach(e => { const ms = Number(e.dataset.end) - Date.now(); const b = e.querySelector('b'); if(b) b.textContent = left(ms); if(ms <= 0 && !e.dataset.done){ e.dataset.done = 1; over = true; } });
  if(over){ render(); const st = (window._xsStack || []); if(document.getElementById('xsBrk') && window.svPage) window.svPage('x_order'); else if(X.openSid && $x('xsItems')) drawItems(); else if($x('svTitle') && document.querySelector('.xs-redhero')) redPage(); }
}, 1000);
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// today's deals, or the next one coming up (from the admin's weekday deal list)
function dealCard(){
  const D = ((X.cfg && X.cfg.deals) || []).filter(d => d.on && d.days.length);
  const find = d => { const s = svcs().find(x => x.id === d.sid && !x.soon); const i = s && s.items.find(x => x.id === d.iid && x.on); return s && i && d.price < i.price ? { d, s, i } : null; };
  // the Red Friday day has its own tile
  const R = X.cfg && X.cfg.redFriday, rd = R && R.on && redDeals().length ? R.day : -1;
  const today = bdWd() === rd ? [] : D.filter(d => d.days.includes(bdWd())).map(find).filter(Boolean);
  if(today.length){
    return `<div class="xs-deal"><div class="hd"><span class="tg"><i class="fa-solid fa-bolt"></i>TODAY'S DEAL</span>${cd(bdMid(), 'Ends in')}</div>
      ${today.map(({ d, s, i }) => `<div class="row" onclick="xsOpen('${E(s.id)}');setTimeout(()=>xsPick('${E(s.id)}','${E(i.id)}'),60)">${ilogo(s, i)}<div class="m"><b>${E(i.name)}</b><small>${E(s.name)}</small></div><div class="pp"><s>${tk(i.price)}</s><b>${tk(d.price)}</b><em>−${Math.round((1 - d.price / i.price) * 100)}%</em></div></div>`).join('')}</div>`;
  }
  // the next weekday that has a deal
  for(let k = 1; k <= 7; k++){
    const wd = (bdWd() + k) % 7; if(wd === rd) continue; const nx = D.filter(d => d.days.includes(wd)).map(find).filter(Boolean);
    if(nx.length){ const start = bdMid() + (k - 1) * 864e5;
      return `<div class="xs-deal soon"><div class="hd"><span class="tg"><i class="fa-solid fa-calendar-day"></i>NEXT DEAL · ${WD[wd].toUpperCase()}</span>${cd(start, 'Starts in')}</div>
        <div class="row" style="cursor:default">${logo(nx[0].s)}<div class="m"><b>${E(nx[0].i.name)}${nx.length > 1 ? ` +${nx.length - 1} more` : ''}</b><small>${E(nx[0].s.name)}</small></div><div class="pp"><s>${tk(nx[0].i.price)}</s><b>${tk(nx[0].d.price)}</b></div></div></div>`; }
  }
  return '';
}
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
// who can order: everyone / Verified / VIP / VIP 1·2·3 (the server checks the same rule)
const can = a => !a || a === 'all' || (typeof window._svCanUse === 'function' && window._svCanUse(a));
const ACC = { verified: 'VERIFIED', vip: 'VIP', vip1: 'VIP 1+', vip2: 'VIP 2+', vip3: 'VIP 3' };
const BDC = t => ({ HOT: 'sale', SALE: 'sale', NEW: 'new', EARN: 'earn', FREE: 'new', POPULAR: 'pop', TOP: 'pop', VERIFIED: 'ver', 'FOR VERIFIED': 'ver', JOIN: 'ver' }[String(t).toUpperCase()] || '');
const nudge = () => typeof window._svNudge === 'function' ? window._svNudge() : '';
// the Extra Balance on every service page, with Deposit and My orders
function xbStrip(){
  if(!X.cfg || (X.cfg.wallet || {}).on === false || !user()) return '';
  const b = X.xb ? Number(X.xb.xbal) || 0 : null;
  return `<div class="xb-strip${b === 0 ? ' empty' : ''}"><span class="ic"><i class="fa-solid fa-wallet"></i></span><div><small>Your Extra Balance</small><b>${b === null ? '…' : tk(b)}</b>${b === 0 ? '<em>Deposit first to order</em>' : ''}</div>
    <button onclick="svGo('x_dep')"><i class="fa-solid fa-plus"></i>Deposit</button><button class="g" onclick="svGo('x_orders')" aria-label="My orders"><i class="fa-solid fa-receipt"></i></button></div>`;
}
window._xbStrip = xbStrip;
// where the user is in the order: category → item → details → pay
function steps(n, has){ const L = (has === false ? ['Item', 'Details', 'Pay'] : ['Category', 'Item', 'Details', 'Pay']); if(has === false) n = Math.max(0, n - 1);
  return `<div class="xs-steps" id="xsSteps">${L.map((t, i) => `<div class="${i < n ? 'done' : i === n ? 'now' : ''}"><span>${i < n ? '<i class="fa-solid fa-check"></i>' : i + 1}</span>${t}</div>`).join('')}</div>`; }
function statusBar(s){
  if(s.status === 'busy') return `<div class="cx-note warn"><i class="fa-solid fa-hourglass-half"></i><span>${E(s.statusNote || 'Busy right now — delivery may take longer than usual.')}</span></div>`;
  return s.statusNote && s.status === 'open' ? `<div class="cx-note"><i class="fa-solid fa-circle-info"></i><span>${E(s.statusNote)}</span></div>` : '';
}
// the Verified exclusive banner
function perkBanner(){
  const P = PK(); if(!P.on) return '';
  if(user() && isV()) return `<div class="xs-perk on"><span class="sl">${sealHtml()}</span><div><b>${X.xb && X.xb.vip && !X.xb.verified ? 'VIP Exclusive is active' : 'Verified Exclusive is active'}</b><p>You pay no service charge and no transaction fee on every Extra Service.</p></div><span class="go">0% fee ✓</span></div>`;
  return `<div class="xs-perk" onclick="svGo('verify')"><span class="sl">${sealHtml()}</span><div><b>Verified Exclusive: 0% charge · 0 fee</b><p>Verified &amp; VIP members pay no service charge${P.chargePct ? ` (${P.chargePct}%)` : ''} or transaction fee here.</p></div><span class="go">Get Verified</span></div>`;
}
// processing-time notice for loans (home page, after applying, application details)
function loanNote(){
  const N = (X.cfg && X.cfg.loanNotice) || {}; if(N.on === false) return '';
  const days = E(N.days || '7–14');
  if(X.xb && X.xb.vip) return `<div class="ln-note vip"><div class="ic"><i class="fa-solid fa-crown"></i></div><div class="cz-m"><b>Your application has VIP priority</b><div class="cz-body"><div><span>Loan money is processed through the bank, which normally takes ${days} working days. As a VIP member, your application is reviewed first with high priority.</span></div></div></div></div>`;
  return `<div class="ln-note"><div class="ic"><i class="fa-solid fa-building-columns"></i></div><div class="cz-m"><b>Processing time: ${days} working days</b><div class="cz-body"><div><span>Loan money is processed through the bank, so approval and disbursement can take up to ${days} working days. Want it sooner? VIP applications get high priority and are reviewed first — a better chance of early approval and disbursement.</span><br><button class="vb" onclick="svGo('vip')"><i class="fa-solid fa-crown"></i>Get VIP priority</button></div></div></div></div>`;
}
function placeNotes(){
  const html = loanNote(); if(!html) return;
  const spots = [['#screen-home .home-body', el => $x('qsBox') || el.querySelector(':scope > .quick-actions-title'), 'before'], ['#screen-review-progress', el => el.querySelector('.rv-foot'), 'before'],
    ['#screen-waiting', el => el.querySelector('.btn-home'), 'before'], ['#statusModalContent', el => el.firstChild, 'first']];
  spots.forEach(([sel, at, how]) => { const el = document.querySelector(sel); if(!el || el.querySelector(':scope > .ln-note')) return;
    const box = document.createElement('div'); box.innerHTML = html; const n = box.firstChild;
    if(how === 'first') el.insertBefore(n, el.firstChild); else { const ref = at(el); if(ref) el.insertBefore(n, ref); else el.appendChild(n); } });
}
// slim / full cards: a small round button folds the card to one line; the choice is remembered on this phone
function slimKey(k){ try { return localStorage.getItem('cf_slim_' + k) === '1'; } catch (e) { return false; } }
function makeSlim(card, key){
  if(!card || card.dataset.cz) return; card.dataset.cz = key; card.classList.add('cz');
  if(!card.querySelector('.cz-body')){
    // the push card: fold its text and buttons
    const m = card.querySelector('.pc-m'); if(m){ const body = document.createElement('div'); body.className = 'cz-body'; const inner = document.createElement('div');
      [...m.children].filter(e => e.tagName !== 'B').forEach(e => inner.appendChild(e)); body.appendChild(inner); m.appendChild(body); m.classList.add('cz-m'); }
  }
  const b = document.createElement('button'); b.type = 'button'; b.className = 'cz-tg'; b.setAttribute('aria-label', 'Show less / more');
  b.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  b.onclick = ev => { ev.stopPropagation(); const on = !card.classList.contains('cz-slim'); card.classList.toggle('cz-slim', on); try { localStorage.setItem('cf_slim_' + key, on ? '1' : '0'); } catch (e) {} };
  card.appendChild(b);
  if(slimKey(key)) card.classList.add('cz-slim');
}
function slimAll(){ document.querySelectorAll('.ln-note').forEach(n => makeSlim(n, 'loan')); const pc = document.getElementById('pushCard'); if(pc && !pc.querySelector('.pc-ok')) makeSlim(pc, 'push'); }
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
  T.x_red = { l: 'Red Friday', cat: '', login: true, page: 'x_red' }; P.x_red = redPage;
  P.recharge = rechargePage; P.jobs = jobsPage; T.x_job = { l: 'Task', cat: '', login: true, page: 'x_job' }; P.x_job = jobPage;
  T.x_order = { l: 'Order', cat: '', login: true, page: 'x_order' }; P.x_order = orderPage;
  T.x_orders = { l: 'My orders', cat: '', login: true, page: 'x_orders' }; P.x_orders = ordersPage;
  T.x_wallet = { l: 'Extra Balance', cat: '', login: true, page: 'x_wallet' }; P.x_wallet = walletPage; T.x_dep = { l: 'Add balance', cat: '', login: true, page: 'x_dep' }; P.x_dep = depPage;
}
// every home section sits in its own slim-bordered box; Quick Services (title + tiles) are wrapped together
function boxQuick(){
  const hb = document.querySelector('#screen-home .home-body'); if(!hb) return null; if($x('qsBox')) return $x('qsBox');
  const t = hb.querySelector(':scope > .quick-actions-title'), g = hb.querySelector(':scope > .qa-grid'); if(!t || !g) return null;
  const box = document.createElement('div'); box.id = 'qsBox'; box.className = 'hs-box qs';
  box.insertAdjacentHTML('beforeend', '<div class="hs-tag"><i class="fa-solid fa-wallet"></i>Uses your Creditfy balance</div>');
  hb.insertBefore(box, t); box.appendChild(t); box.appendChild(g); return box;
}
function render(){
  const g = boxQuick() || document.querySelector('.home-body .qa-grid') || document.querySelector('.qa-grid'); if(!g) return;
  let box = $x('xsBlock');
  const Ls = svcs();
  if(!X.cfg || !X.cfg.on || !Ls.length){ if(box) box.remove(); return; }
  if(!box){ box = document.createElement('div'); box.id = 'xsBlock'; box.className = 'hs-box xs'; g.insertAdjacentElement('afterend', box); }
  const W = X.cfg.wallet || {};
  const tile = s => { const st = s.soon ? 'soon' : s.status !== 'open' ? s.status : '', lk = !st && !can(s.access);
    const bd = st ? `<span class="bd st ${st}">${st.toUpperCase()}</span>` : lk ? `<span class="bd lk"><i class="fa-solid fa-${s.access === 'verified' ? 'lock' : 'crown'}"></i>${ACC[s.access]}</span>` : s.badge ? `<span class="bd ${BDC(s.badge)}">${E(s.badge)}</span>` : s.items.some(i => i.on && priceNow(s, i).kind) ? '<span class="bd sale">SALE</span>' : '';
    return `<div class="xs-t${st === 'soon' || st === 'closed' ? ' soon' : ''}${lk ? ' lk' : ''}" onclick="xsOpen('${E(s.id)}')">${bd}${logo(s)}<b>${E(s.short || s.name)}</b></div>`; };
  box.innerHTML = `<div class="hs-tag"><i class="fa-solid fa-wallet"></i>Uses your Extra Balance</div><div class="xs-head">
      <div class="t"><div><div class="xs-title">${E(X.cfg.title || 'Extra Services')} <em>PREMIUM</em></div><small>Gift cards, exchange, social &amp; digital services — paid from your Extra Balance</small></div></div>
      <div class="a">${W.on !== false ? `<button class="xs-bal" onclick="svGo('x_wallet')"><i class="fa-solid fa-wallet"></i><span><small>Extra Balance</small>${user() && X.xb ? tk(X.xb.xbal) : 'Open'}</span><i class="p fa-solid fa-plus"></i></button>` : ''}<button class="xs-ord" onclick="svGo('x_orders')"><i class="fa-solid fa-receipt"></i>My orders</button></div>
    </div>
    ${xbNotice()}
    ${perkBanner()}
    ${redTile()}
    ${dealCard()}
    ${hotRow()}
    <div class="xs-cat"><span>All services</span></div>
    <div class="xs-grid">${(X.cfg.jobs || {}).on !== false ? `<div class="xs-t" onclick="svGo('jobs')"><span class="bd earn">EARN</span><div class="xs-lg g-orange"><i class="fa-solid fa-briefcase"></i></div><b>Micro Jobs</b></div>` : ''}${Ls.map(tile).join('')}</div>
    <div id="xsLive"></div>`;
  drawLive();
}
// clear notice: everything in this section is paid from the Extra Balance, so deposit first
function xbNotice(){
  if((X.cfg.wallet || {}).on === false) return '';
  const bal = user() && X.xb ? Number(X.xb.xbal) || 0 : null, empty = bal !== null && bal <= 0;
  return `<div class="xb-note${empty ? ' empty' : ''}"><i class="fa-solid fa-circle-exclamation"></i><div><b>Paid from your Extra Balance only</b><span>Extra Services are charged from your Extra Balance — not your Creditfy balance. ${empty ? 'Your Extra Balance is ৳0 — deposit first to order.' : 'Keep it topped up to order in one tap.'}</span></div><button onclick="svGo('x_dep')"><i class="fa-solid fa-plus"></i>Deposit</button></div>`;
}
// a sliding row of everything on offer right now (offer price or today's deal)
function hotRow(){
  const H = []; svcs().filter(s => !s.soon && s.mode === 'items').forEach(s => s.items.filter(i => i.on).forEach(i => { const pn = priceNow(s, i); if(pn.kind === 'offer') H.push({ s, i, pn }); }));
  if(!H.length) return '';
  return `<div class="xs-cat"><span><i class="fa-solid fa-fire" style="color:#ff7a59"></i> Hot offers</span></div>
    <div class="xs-hot">${H.slice(0, 12).map(({ s, i, pn }) => { const q = quote(s, withNow(s, i), 0, isV());
      return `<div class="xs-hc" onclick="xsOpen('${E(s.id)}');setTimeout(()=>xsPick('${E(s.id)}','${E(i.id)}'),60)"><span class="off">−${Math.round((1 - pn.price / pn.was) * 100)}%</span>${ilogo(s, i)}<b>${E(i.name)}</b><div class="pp"><s>${tk(quote(s, i, 0, isV()).pay)}</s><span>${tk(q.pay)}</span></div>${cd(pn.ends, '')}</div>`; }).join('')}</div>`;
}
// Red Friday: one weekday with that day's deals; on other days it shows when it opens
function redDeals(){
  const R = X.cfg && X.cfg.redFriday; if(!R || !R.on) return [];
  return ((X.cfg.deals) || []).filter(d => d.on && d.days.includes(R.day)).map(d => { const s = svcs().find(x => x.id === d.sid && !x.soon); const i = s && s.items.find(x => x.id === d.iid && x.on); return s && i && d.price < i.price ? { d, s, i } : null; }).filter(Boolean);
}
const redOpen = () => X.cfg && X.cfg.redFriday && bdWd() === X.cfg.redFriday.day;
const redStart = () => { const R = X.cfg.redFriday; const k = (R.day - bdWd() + 7) % 7 || 7; return bdMid() + (k - 1) * 864e5; };
function redTile(){
  const R = X.cfg && X.cfg.redFriday, D = redDeals(); if(!R || !R.on || !D.length) return '';
  const best = Math.max(...D.map(x => Math.round((1 - x.d.price / x.i.price) * 100)));
  return `<div class="xs-red${redOpen() ? ' live' : ''}" onclick="svGo('x_red')"><div class="rb"><i class="fa-solid fa-tags"></i></div>
    <div class="m"><b>${E(R.title)}</b><small>${redOpen() ? `LIVE now · up to ${best}% off · ${D.length} deals` : `Opens ${WD[R.day]} · up to ${best}% off`}</small></div>
    <div class="r">${redOpen() ? cd(bdMid(), 'Ends') : cd(redStart(), 'In')}</div></div>`;
}
function redPage(){
  const R = X.cfg.redFriday, D = redDeals(), open = redOpen();
  const card = ({ d, s, i }) => { const q = quote(s, { ...i, price: d.price }, 0, isV()), was = quote(s, i, 0, isV()).pay;
    return `<div class="xs-pc${open ? '' : ' lock'}" ${open ? `onclick="xsPick('${E(s.id)}','${E(i.id)}')"` : ''}><span class="off">−${Math.round((1 - d.price / i.price) * 100)}%</span>${ilogo(s, i)}<b>${E(i.name)}</b><small>${E(s.name)}</small>
      <div class="pp"><s>${tk(was)}</s><span>${tk(q.pay)}</span></div><div class="go">${open ? 'Buy now' : `<i class="fa-solid fa-lock"></i> Opens ${WD[R.day]}`}</div></div>`; };
  show(R.title, `<div class="xs-redhero${open ? ' live' : ''}"><div class="big"><i class="fa-solid fa-tags"></i></div><h3>${E(R.title)}</h3><p>${E(R.text || '')}</p>
      <div class="cdw">${open ? cd(bdMid(), 'Ends in') : cd(redStart(), `Opens ${WD[R.day]} in`)}</div>
      <small>${open ? 'Prices below are live today only (Bangladesh time).' : `Every ${WD[R.day]}, 12:00am – 11:59pm (Bangladesh time).`}</small></div>
    ${D.length ? `<div class="xs-pgrid">${D.map(card).join('')}</div>` : '<div class="sv-empty">No deals are set for this day yet.</div>'}`);
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
window.xsOpen = id => { const s = svcs().find(x => x.id === id); if(!s) return; if(s.soon){ toast(s.statusNote || 'Coming soon — stay tuned!'); return; } if(s.status === 'closed'){ toast(s.statusNote || 'Closed right now — please check back later.', true); return; } svGo('x_' + id); };

/* ───────── one service: its options ───────── */
function svcPage(id){
  const s = svcs().find(x => x.id === id); if(!s) return; X.openSid = id;
  if(s.access !== 'all' && !can(s.access)){
    if(user() && !window._svState && (X._wt = (X._wt || 0) + 1) < 8){ show(s.name, '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>'); setTimeout(() => svcPage(id), 600); return; }
    X._wt = 0; show(s.name, `<div class="xs-hero">${logo(s)}<div><h4>${E(s.name)}</h4><p>${E(s.desc)}</p></div></div>${typeof window._svLock === 'function' ? window._svLock(s.name, s.access) : ''}${xbStrip()}`); return;
  }
  if(s.mode === 'game') return gamePage(s);
  if(!X.f || X.f.sid !== id) X.f = { sid: id, q: '', cat: '', grp: '', sort: 'pop' };
  const items = s.items.filter(i => i.on);
  const cats = [...new Set(items.map(i => i.cat).filter(Boolean))];
  const offers = items.filter(i => priceNow(s, i).kind).length;
  show(s.name, `<div class="xs-hero">${logo(s)}<div><h4>${E(s.name)}</h4><p>${E(s.desc)}</p>
      <div class="xs-meta"><span><i class="fa-solid fa-layer-group"></i>${items.length} options</span>${offers ? `<span class="o"><i class="fa-solid fa-tag"></i>${offers} on offer</span>` : ''}<span><i class="fa-solid fa-user-shield"></i>Hand-delivered</span>${s.access !== 'all' ? `<span class="o"><i class="fa-solid fa-crown"></i>${ACC[s.access]}</span>` : ''}</div></div></div>
    ${statusBar(s)}
    ${xbStrip()}
    ${steps(cats.length > 1 && !X.f.cat ? 0 : 1, cats.length > 1)}
    ${isV() ? nudge() : perkBanner()}
    ${items.length > 3 ? `<div class="xs-tool"><div class="xs-srch"><i class="fa-solid fa-magnifying-glass"></i><input id="xsQ" placeholder="Search ${E(s.name)}" value="${E(X.f.q)}" oninput="xsF('q',this.value)"></div>
      ${s.mode === 'items' ? `<select id="xsSort" onchange="xsF('sort',this.value)"><option value="pop">Popular</option><option value="off">Offers first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>` : ''}</div>` : ''}
    ${cats.length > 1 ? `<div class="xs-menu">${[['', 'All', items.length], ...cats.map(c => [c, c, items.filter(i => i.cat === c).length])].map(([v, t, n]) => `<button data-c="${E(v)}" class="${X.f.cat === v ? 'on' : ''}" onclick="xsF('cat',this.dataset.c)">${v ? ilogo(s, items.find(i => i.cat === v) || {}) : '<span class="al"><i class="fa-solid fa-grip"></i></span>'}<b>${E(t)}</b><small>${n}</small></button>`).join('')}</div>` : ''}
    <div id="xsGrp"></div>
    <div id="xsItems"></div>
    ${s.note ? `<div class="sv-card"><p>${E(s.note)}</p></div>` : ''}
    <div class="xs-how"><div><i class="fa-solid fa-hand-pointer"></i><b>Choose</b><small>Pick an option</small></div><div><i class="fa-solid fa-wallet"></i><b>Pay</b><small>Extra Balance or TrxID</small></div><div><i class="fa-solid fa-truck-fast"></i><b>Get it</b><small>Delivered in My orders</small></div></div>
    <button class="sv-btn ghost" onclick="svGo('x_orders')"><i class="fa-solid fa-receipt"></i>My orders</button>`);
  const so = $x('xsSort'); if(so) so.value = X.f.sort;
  drawItems();
}
window.xsF = (k, v) => { if(!X.f) return; X.f[k] = v;
  if(k === 'cat'){ X.f.grp = ''; document.querySelectorAll('.xs-menu button').forEach(b => b.classList.toggle('on', b.dataset.c === v)); const st = $x('xsSteps'); if(st) st.outerHTML = steps(v ? 1 : 0, true); }
  if(k === 'grp') document.querySelectorAll('#xsGrp button').forEach(b => b.classList.toggle('on', b.dataset.g === v));
  drawItems(); };
function drawItems(){
  const el = $x('xsItems'); const s = svcs().find(x => x.id === X.openSid); if(!el || !s) return;
  const f = X.f || {}, q = String(f.q || '').toLowerCase();
  const inCat = s.items.filter(i => i.on && (!f.cat || i.cat === f.cat));
  const groups = [...new Set(inCat.map(i => i.group).filter(Boolean))];
  const ge = $x('xsGrp'); if(ge) ge.innerHTML = groups.length > 1 ? `<div class="xs-chips xs-sub"><button data-g="" class="${!f.grp ? 'on' : ''}" onclick="xsF('grp','')">All${f.cat ? ' ' + E(f.cat) : ''}</button>${groups.map(g => `<button data-g="${E(g)}" class="${f.grp === g ? 'on' : ''}" onclick="xsF('grp',this.dataset.g)">${E(g)}</button>`).join('')}</div>` : '';
  let items = inCat.filter(i => (!f.grp || i.group === f.grp) && (!q || (i.name + ' ' + (i.cat || '') + ' ' + (i.group || '') + ' ' + (i.note || '')).toLowerCase().includes(q)));
  const P = i => priceNow(s, i).price;
  if(f.sort === 'low') items.sort((a, b) => P(a) - P(b)); else if(f.sort === 'high') items.sort((a, b) => P(b) - P(a));
  else if(f.sort === 'off') items.sort((a, b) => (priceNow(s, b).kind ? 1 : 0) - (priceNow(s, a).kind ? 1 : 0));
  else items.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
  if(!items.length){ el.innerHTML = '<div class="sv-empty"><i class="fa-solid fa-magnifying-glass"></i>Nothing matches. Try another word.</div>'; return; }
  // with sub-menus (groups) and no group picked, the options are shown under a heading per group
  const byGroup = !f.grp && groups.length > 1 && f.sort === 'pop' && !q;
  const wrap = fn => { if(!byGroup) return fn(items); const order = [...groups, '']; return order.map(g => { const L = items.filter(i => (i.group || '') === g); return L.length ? `<div class="xs-gh"><span>${E(g || 'More')}</span><small>${L.length}</small></div>${fn(L)}` : ''; }).join(''); };
  if(s.mode === 'amount'){
    el.innerHTML = wrap(items => items.map(i => { const hasFee = i.pct || i.fee, free = PK().on && isV();
      const feeTxt = !hasFee ? 'No fee' : free ? '<span style="color:var(--p);font-weight:800">No fee — Verified ✓</span>' : `Fee ${i.pct ? num(i.pct) + '%' : ''}${i.pct && i.fee ? ' + ' : ''}${i.fee ? tk(i.fee) : ''}${PK().on ? ' · <span style="color:#7fc3ff">Verified: no fee</span>' : ''}`;
      const rate = i.unit === '৳' ? feeTxt : `1 ${E(i.unit)} = ${tk(i.rate)} · ${feeTxt}`;
      return `<div class="xs-it xs-ir" onclick="xsPick('${E(s.id)}','${E(i.id)}')">${ilogo(s, i)}<div style="flex:1;min-width:0"><b>${E(i.name)}</b><small>${rate}${i.min || i.max ? ` · ${num(i.min)}–${num(i.max)} ${E(i.unit)}` : ''}</small></div><div class="pr"><span class="xs-go">Start <i class="fa-solid fa-arrow-right"></i></span></div></div>`; }).join(''));
    return;
  }
  el.innerHTML = wrap(items => `<div class="xs-pgrid">${items.map(i => { const pn = priceNow(s, i), qq = quote(s, withNow(s, i), 0, isV()), off = pn.kind ? Math.round((1 - pn.price / pn.was) * 100) : 0;
    return `<div class="xs-pc${pn.kind ? ' sale' : ''}" onclick="xsPick('${E(s.id)}','${E(i.id)}')">${off ? `<span class="off">−${off}%</span>` : ''}${i.hot ? '<span class="hot"><i class="fa-solid fa-fire"></i>Popular</span>' : ''}
      ${ilogo(s, i)}<b>${E(i.name)}</b><small>${E(i.cat || s.name)}</small>${i.note ? `<em>${E(i.note)}</em>` : ''}
      <div class="pp">${pn.kind ? `<s>${tk(quote(s, i, 0, isV()).pay)}</s>` : ''}<span>${tk(qq.pay)}</span></div>
      ${qq.fee ? `<div class="vp"><i class="fa-solid fa-circle-check"></i>Save ${tk(qq.fee)} with Verified</div>` : qq.waived ? `<div class="vp ok"><i class="fa-solid fa-circle-check"></i>You save ${tk(qq.saved)} · Verified</div>` : ''}
      ${pn.kind ? `<div class="ct">${pn.kind === 'deal' ? '<i class="fa-solid fa-bolt"></i>Today' : ''}${cd(pn.ends, '')}</div>` : ''}
      <div class="go">Buy now</div></div>`; }).join('')}</div>`);
}

window.xsPick = (sid, iid) => { X.sel = { sid, iid }; window._xsW = 0; window._xsPm = ''; svGo('x_order'); loadXb().then(() => { const typed = [...document.querySelectorAll('#svBody input')].some(e => e.value); if(document.getElementById('xsBtn') && !typed) window.svPage('x_order'); }); };

/* ───────── the order form ───────── */
function payTargets(i){
  if(i.to) return [{ name: i.flow === 'sell' ? 'Send to' : 'Pay to', type: '', number: i.to }];
  // every receiving method the admin turned on for fees (Admin → Payment methods), each with its own type and note
  const opts = w => typeof window._walletOptions === 'function' ? window._walletOptions(w) : (Array.isArray(w.methods) && w.methods.length ? w.methods.filter(m => m && m.number) : [{ type: w.payMethod || 'Send Money', number: w.collectionNumber || w.paymentNumber }].filter(m => m.number));
  if(!(window._feeWallets || []).length && window._loadWallets && !X._wl){ X._wl = 1; Promise.resolve(window._loadWallets()).then(() => { if(document.getElementById('xsBtn') || document.getElementById('xbBtn')) window.svPage(_cur()); }).catch(() => {}); }
  return (window._feeWallets || []).flatMap(w => opts(w).map(o => ({ name: w.name, type: o.type || 'Send Money', number: o.number, logo: w.logoUrl, note: o.note || '', steps: Array.isArray(o.instructions) ? o.instructions.filter(Boolean).slice(0, 6) : [] })));
}
const _cur = () => document.getElementById('xbBtn') ? 'x_dep' : 'x_order';
// the chosen receiving method: number, copy button, the admin's note and steps
function payNum(w){
  if(!w) return '<div class="sv-empty">No payment number is set yet. Please contact support.</div>';
  return `<div class="pay-num"><div><small>${E(w.name)}${w.type ? ' · ' + E(w.type) : ''}</small><b>${E(w.number)}</b></div><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${E(w.number)}').then(()=>svToastOk('Copied'))">Copy</button></div>
    ${w.note || w.steps.length ? `<div class="xs-pnote">${w.note ? `<div>${E(w.note)}</div>` : ''}${w.steps.length ? `<ol>${w.steps.map(t => `<li>${E(t)}</li>`).join('')}</ol>` : ''}</div>` : ''}`;
}
function orderPage(){
  const sel = X.sel || {}; const s = svcs().find(x => x.id === sel.sid); const i = s && s.items.find(x => x.id === sel.iid);
  if(!s || !i){ show('Order', '<div class="sv-empty">Please choose an option again.</div>'); return; }
  if(!can(s.access) || s.status === 'closed') return svcPage(s.id);
  const amt = s.mode === 'amount', sell = i.flow === 'sell';
  const tg = payTargets(i); const w = tg[window._xsW || 0] || tg[0];
  const W = X.cfg.wallet || {}, bal = X.xb ? X.xb.xbal : 0;
  const canBal = !sell && W.on !== false, canDirect = sell || W.direct !== false;
  if(!canDirect) window._xsPm = 'xbal'; else if(!canBal) window._xsPm = 'trx'; else if(!window._xsPm) window._xsPm = 'xbal';
  const pm = window._xsPm, q0 = quote(s, withNow(s, i), 0, isV()), price = amt ? 0 : q0.pay;
  const payBlock = pm === 'xbal' ? `<div class="pay-num" style="border-style:solid"><div><small>Extra Balance</small><b>${tk(bal)}</b></div><button onclick="svGo('x_dep')">+ Add</button></div>
      <div style="font-size:11.5px;color:var(--txt2);margin:6px 2px" id="xsBalNote">${!amt && price > bal ? `<span style="color:#ff8fa3">You need ${tk(price - bal)} more. Add balance first.</span>` : 'The price is taken from your Extra Balance when you place the order.'}</div>`
    : `<span class="sv-lbl">${sell ? `Send the ${E(i.unit)} here` : 'Send the payment'}</span>
    ${tg.length > 1 ? `<div class="pay-w">${tg.map((x, k) => `<button class="${x === w ? 'on' : ''}" onclick="window._xsW=${k};svPage('x_order')">${x.logo ? `<img src="${E(x.logo)}" alt="">` : '<i class="fa-solid fa-wallet"></i>'}${E(x.name)}${x.type ? `<small class="pw-t">${E(x.type)}</small>` : ''}</button>`).join('')}</div>` : ''}
    ${payNum(w)}
    <span class="sv-lbl">${sell ? 'Transaction ID / hash of what you sent' : 'Transaction ID from your payment SMS'}</span>
    <input class="sv-in code" id="xsTrx" placeholder="TRANSACTION ID" maxlength="80" autocomplete="off">`;
  const hasCats = new Set(s.items.filter(x => x.on).map(x => x.cat).filter(Boolean)).size > 1;
  show(s.name, `${steps(sell || pm !== 'xbal' ? 3 : 2, hasCats)}<div class="xs-hero">${ilogo(s, i)}<div><h4>${E(i.name)}</h4><p>${E(i.note || s.desc)}</p>${i.cat || i.group ? `<div class="xs-meta"><span>${E([i.cat, i.group].filter(Boolean).join(' › '))}</span></div>` : ''}</div></div>
    ${statusBar(s)}
    ${amt ? `<span class="sv-lbl">${sell ? 'How much will you send?' : 'How much do you want?'} (${E(i.unit)})</span>
      <input class="sv-in" id="xsAmt" type="number" inputmode="decimal" min="${i.min || 0}" ${i.max ? `max="${i.max}"` : ''} placeholder="${i.min ? 'Min ' + num(i.min) : 'Amount'}${i.max ? ' · max ' + num(i.max) : ''}" oninput="xsCalc()">
      <div class="xs-brk" id="xsBrk"></div>`
    : `<div class="xs-brk" id="xsBrk"></div>`}
    ${PK().on && !isV() ? `<div class="xs-perk" onclick="svGo('verify')" style="margin-top:-2px"><span class="sl">${sealHtml()}</span><div><b>Pay no charge with Verified</b><p>Verified members skip the ${amt ? 'transaction fee' : 'service charge'} on every order — a one-time badge that keeps saving.</p></div><span class="go">Get Verified</span></div>` : nudge()}
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
  const a = Number(($x('xsAmt') || {}).value) || 0, pn = priceNow(s, i), q = quote(s, withNow(s, i), a, isV());
  const v = sell ? q.get : (amt && !(a > 0)) ? 0 : q.pay;
  const lbl = amt ? 'Transaction fee' : 'Service charge';
  const feeRow = !PK().on && !q.fee ? '' : q.waived ? `<div><span>${lbl}</span><span><s>${tk(q.saved)}</s> <span class="ok">Waived — Verified ✓</span></span></div>` : q.fee ? `<div><span>${lbl}</span><span>${sell ? '−' : '+'}${tk(q.fee)}</span></div>` : `<div><span>${lbl}</span><span class="ok">৳0</span></div>`;
  const offRow = pn.kind ? `<div><span>Regular price</span><span><s>${tk(pn.was)}</s></span></div><div><span>${pn.kind === 'deal' ? "Today's deal" : 'Offer price'} ${cd(pn.ends, '')}</span><span class="ok">${tk(pn.price)}</span></div>` : '';
  const b = $x('xsBrk'); if(b) b.innerHTML = (pn.kind ? offRow : `<div><span>${amt ? (sell ? 'Value' : 'Amount') : 'Price'}</span><span>${tk(amt ? (a > 0 ? q.base : 0) : q.base)}</span></div>`) + `${feeRow}<div class="tot"><span>${sell ? 'You get' : 'You pay'}</span><b>${tk(v)}</b></div>`;
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
  const TY = { deposit: ['arrow-down', 'g-green', 'Deposit'], order: ['bag-shopping', 'g-purple', 'Order'], refund: ['rotate-left', 'g-blue', 'Refund'], admin: ['user-shield', 'g-slate', 'Adjustment'], bonus: ['gift', 'g-gold', 'Deposit bonus'], task: ['briefcase', 'g-orange', 'Micro job'] };
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
  const DB = (X.cfg && X.cfg.depBonus) || {};
  show('Add balance', `<div class="xb-card"><small>EXTRA BALANCE</small><div class="v">${tk(X.xb ? X.xb.xbal : 0)}</div><p>Add money once and order any Extra Service in one tap.</p></div>
    ${DB.on && DB.tiers.length ? `<div class="xb-bonus"><div class="h"><i class="fa-solid fa-gift"></i>Deposit bonus</div><div class="tiers">${DB.tiers.map(t => `<div><b>+${num(t.pct)}%</b><small>on ${tk(t.min)}+</small></div>`).join('')}</div><small>Added to your Extra Balance as soon as your deposit is approved${DB.max ? ` · up to ${tk(DB.max)} per deposit` : ''}.</small><div class="you" id="xbBon"></div></div>` : ''}
    <span class="sv-lbl">1. Amount</span>
    <div class="xb-chips">${amts.map(a => `<button onclick="xbAmt(${a},this)">${tk(a)}</button>`).join('')}</div>
    <input class="sv-in" id="xbAmt" type="number" inputmode="numeric" oninput="xbBon()" placeholder="Amount (min ${tk(W.min || 50)}${W.max ? ', max ' + tk(W.max) : ''})">
    <div class="xb-cp"><input class="sv-in" id="xbCp" placeholder="Coupon code (optional)" maxlength="24" autocomplete="off" style="text-transform:uppercase"><button onclick="xbCoupon()" id="xbCpB">Apply</button></div>
    <div id="xbCpMsg" style="font-size:12px;margin:-2px 2px 8px"></div>
    <span class="sv-lbl">2. Send it to</span>
    ${tg.length > 1 ? `<div class="pay-w">${tg.map((x, k) => `<button class="${x === w ? 'on' : ''}" onclick="window._xbW=${k};svPage('x_dep')">${x.logo ? `<img src="${E(x.logo)}" alt="">` : '<i class="fa-solid fa-wallet"></i>'}${E(x.name)}${x.type ? `<small class="pw-t">${E(x.type)}</small>` : ''}</button>`).join('')}</div>` : ''}
    ${payNum(w)}
    <span class="sv-lbl">3. Transaction ID from your payment SMS</span>
    <input class="sv-in code" id="xbTrx" placeholder="TRANSACTION ID" maxlength="40" autocomplete="off">
    <button class="sv-btn gold" style="margin-top:12px" id="xbBtn" onclick="xbSubmit()" ${w ? '' : 'disabled'}><i class="fa-solid fa-paper-plane"></i>Submit deposit</button>
    <div style="font-size:11.5px;color:var(--txt2);margin:10px 2px;line-height:1.6"><i class="fa-solid fa-circle-info"></i> We add it as soon as we check your payment. Extra Balance is only for Extra Services — not for loans or loan fees.</div>`);
  window._xbCur = w;
}
window.xbAmt = (v, el) => { $x('xbAmt').value = v; document.querySelectorAll('.xb-chips button').forEach(b => b.classList.toggle('on', b === el)); xbBon(); };
// the bonus for the amount typed (same rule as the server)
function bonusFor(amount){ const B = (X.cfg && X.cfg.depBonus) || {}; if(!B.on) return 0; const t = [...(B.tiers || [])].reverse().find(x => amount >= x.min); return t ? Math.min(B.max || Infinity, Math.floor(amount * t.pct / 100)) : 0; }
// a deposit coupon: checked on the server for this amount; its bonus comes with the deposit approval
window._xbCoupon = null;
window.xbCoupon = async function(){
  const code = ($x('xbCp').value || '').trim(), amount = Number(($x('xbAmt') || {}).value) || 0, m = $x('xbCpMsg');
  if(!code){ window._xbCoupon = null; m.innerHTML = ''; return; }
  if(!amount){ m.innerHTML = '<span style="color:#ff8fa3">Enter the amount first.</span>'; return; }
  const r = await api('depositCoupon', { code, amount });
  if(!r.ok){ window._xbCoupon = null; m.innerHTML = `<span style="color:#ff8fa3">${E(r.data.error || 'Not valid')}</span>`; return; }
  window._xbCoupon = { code: r.data.code, amount }; m.innerHTML = `<span style="color:var(--p);font-weight:800"><i class="fa-solid fa-circle-check"></i> ${E(r.data.code)} applied — +${tk(r.data.bonus)} bonus when your deposit is approved</span>`;
};
window.xbBon = () => {
  if(window._xbCoupon && window._xbCoupon.amount !== (Number(($x('xbAmt') || {}).value) || 0)){ window._xbCoupon = null; const m = $x('xbCpMsg'); if(m) m.innerHTML = '<span style="color:var(--txt2)">Amount changed — tap Apply again for the coupon.</span>'; } const el = $x('xbBon'); if(!el) return; const a = Number(($x('xbAmt') || {}).value) || 0, b = bonusFor(a); el.innerHTML = b ? `You get <b>${tk(a + b)}</b> (${tk(a)} + ${tk(b)} bonus)` : ''; };
window.xbSubmit = async function(){
  const w = window._xbCur, amount = Number($x('xbAmt').value) || 0, trxId = ($x('xbTrx').value || '').trim();
  if(!(amount > 0)){ toast('Enter the amount', true); return; }
  if(trxId.length < 6){ toast('Enter the Transaction ID', true); return; }
  const b = $x('xbBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Submitting…';
  const r = await api('xbalDeposit', { amount, trxId, payMethod: w ? w.name : '', toNumber: w ? w.number : '', coupon: window._xbCoupon && window._xbCoupon.amount === amount ? window._xbCoupon.code : '' });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-paper-plane"></i>Submit deposit';
  if(!r.ok){ toast(r.data.error || 'Could not submit', true); return; }
  toast('Deposit submitted — we will add it after checking'); svGo('x_wallet');
};

/* ───────── Mobile Recharge (Verified & VIP) ───────── */
async function rechargePage(){
  show('Mobile Recharge', '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>');
  await load(); const x = await loadXb(); const R = (X.cfg && X.cfg.recharge) || {};
  if(!R.on){ show('Mobile Recharge', '<div class="sv-empty">Mobile recharge is switched off right now.</div>'); return; }
  if(!x || !(x.verified || x.vip)){
    show('Mobile Recharge', `<div class="rc-lock"><div class="big"><i class="fa-solid fa-mobile-screen-button"></i></div><h3>For Verified &amp; VIP members</h3><p>Recharge any Bangladeshi number from your Creditfy balance — a members-only service.</p>
      <button class="vbtn" onclick="svGo('verify')">${sealHtml()}Get Verified</button><button class="sv-btn gold" style="margin-top:8px" onclick="svGo('vip')"><i class="fa-solid fa-crown"></i>Join VIP</button></div>`); return; }
  const me = (user() || {}).phone || '';
  window._rc = window._rc || { op: R.ops[0], type: 'prepaid' };
  show('Mobile Recharge', `<div class="rc-hero"><div><small>CREDITFY BALANCE</small><b>${tk(x.balance)}</b></div><button onclick="svGo('wallet')"><i class="fa-solid fa-wallet"></i>Wallet</button></div>
    <span class="sv-lbl">Operator</span><div class="rc-ops">${R.ops.map(o => `<button class="${window._rc.op === o ? 'on' : ''}" onclick="window._rc.op=this.dataset.o;document.querySelectorAll('.rc-ops button').forEach(b=>b.classList.toggle('on',b===this))" data-o="${E(o)}">${E(o)}</button>`).join('')}</div>
    <span class="sv-lbl">Number</span><input class="sv-in" id="rcNum" type="tel" inputmode="numeric" value="${me ? '0' + E(me) : ''}" placeholder="01XXXXXXXXX">
    <div class="rc-type"><button class="${window._rc.type === 'prepaid' ? 'on' : ''}" onclick="window._rc.type='prepaid';svPage('recharge')">Prepaid</button><button class="${window._rc.type === 'postpaid' ? 'on' : ''}" onclick="window._rc.type='postpaid';svPage('recharge')">Postpaid</button></div>
    <span class="sv-lbl">Amount (৳${R.min} – ৳${R.max})</span><div class="xb-chips">${[20, 50, 100, 200, 500].filter(a => a >= R.min && a <= R.max).map(a => `<button onclick="document.getElementById('rcAmt').value=${a};document.querySelectorAll('.xb-chips button').forEach(b=>b.classList.toggle('on',b===this))">${tk(a)}</button>`).join('')}</div>
    <input class="sv-in" id="rcAmt" type="number" inputmode="numeric" placeholder="Amount">
    <button class="sv-btn gold" style="margin-top:12px" id="rcBtn" onclick="rcSubmit()"><i class="fa-solid fa-bolt"></i>Recharge now</button>
    <div style="font-size:11.5px;color:var(--txt2);margin:10px 2px;line-height:1.6"><i class="fa-solid fa-circle-info"></i> Paid from your Creditfy balance (Quick Services use your Creditfy balance). Our team sends the recharge by hand — you can follow it in My orders. If it cannot be done, the money goes back to your Creditfy balance.</div>`);
}
window._xsRecharge = () => rechargePage(); window._xsJobs = () => jobsPage();
window.rcSubmit = async function(){
  const number = ($x('rcNum').value || '').trim(), amount = Number($x('rcAmt').value) || 0;
  if(!amount){ toast('Enter the amount', true); return; }
  const b = $x('rcBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Sending…';
  const r = await api('rechargeOrder', { op: window._rc.op, type: window._rc.type, number, amount });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-bolt"></i>Recharge now';
  if(!r.ok){ toast(r.data.error || 'Could not recharge', true); return; }
  if(X.xb) X.xb.balance = r.data.balance; try { if(window._setBalance) window._setBalance(r.data.balance); } catch (e) {} loadLive();
  toast('Recharge request sent — you will get it shortly'); svGo('x_orders');
};

/* ───────── Micro Jobs ───────── */
const JT = { join: ['fa-brands fa-telegram', 'g-blue', 'Join'], visit: ['fa-solid fa-arrow-up-right-from-square', 'g-teal', 'Visit'], signup: ['fa-solid fa-user-plus', 'g-purple', 'Sign up'],
  form: ['fa-solid fa-clipboard-list', 'g-cyan', 'Form'], survey: ['fa-solid fa-square-poll-vertical', 'g-gold', 'Survey'], share: ['fa-solid fa-share-nodes', 'g-pink', 'Share'], refer: ['fa-solid fa-people-arrows', 'g-orange', 'Refer'], other: ['fa-solid fa-briefcase', 'g-slate', 'Task'] };
async function jobsPage(){
  show('Micro Jobs', '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>');
  const r = await api('jobsState');
  if(!r.ok){ show('Micro Jobs', `<div class="sv-empty">${E(r.data.error || 'Could not load.')}</div>`); return; }
  const d = r.data; X.jobs = d; X.jf = X.jf || '';
  if(!d.on){ show('Micro Jobs', '<div class="sv-empty">Micro jobs are switched off right now.</div>'); return; }
  const types = [...new Set(d.tasks.map(t => t.type))];
  const open = d.tasks.filter(t => !t.mine || t.mine.status === 'Rejected').length;
  show('Micro Jobs', `<div class="mj-hero"><div><small>EARNED FROM TASKS</small><b>${tk(d.earned)}</b><span>${open} task${open === 1 ? '' : 's'} open · rewards go to your Extra Balance</span></div><i class="fa-solid fa-briefcase"></i></div>
    ${d.needVerify ? `<div class="xs-perk" onclick="svGo('verify')"><span class="sl">${sealHtml()}</span><div><b>Get Verified to earn</b><p>Task rewards are for Verified and VIP members. You can look at the tasks now.</p></div><span class="go">Get Verified</span></div>` : ''}
    ${types.length > 1 ? `<div class="xs-chips"><button class="${!X.jf ? 'on' : ''}" onclick="X_jf('')">All</button>${types.map(t => `<button class="${X.jf === t ? 'on' : ''}" onclick="X_jf('${t}')">${(JT[t] || JT.other)[2]}</button>`).join('')}</div>` : ''}
    <div id="mjList"></div>`);
  drawJobs();
}
window.xsJob = id => { X.jt = id; svGo('x_job'); };
window.X_jf = t => { X.jf = t; document.querySelectorAll('.xs-chips button').forEach(b => b.classList.toggle('on', (b.getAttribute('onclick') || '').includes(`'${t}'`))); drawJobs(); };
function drawJobs(){
  const el = $x('mjList'); if(!el || !X.jobs) return;
  const L = X.jobs.tasks.filter(t => !X.jf || t.type === X.jf);
  const st = t => !t.mine ? (t.left === 0 ? '<span class="mj-st full">Full</span>' : '') : t.mine.status === 'Approved' ? '<span class="mj-st ok">Done ✓</span>' : t.mine.status === 'Pending' ? '<span class="mj-st wait">Checking</span>' : '<span class="mj-st no">Try again</span>';
  el.innerHTML = L.length ? L.map(t => { const m = JT[t.type] || JT.other;
    return `<div class="mj-t" onclick="xsJob('${E(t.id)}')"><div class="xs-lg ${m[1]}" style="width:44px;height:44px;font-size:18px;border-radius:14px;flex:none"><i class="${m[0]}"></i></div>
      <div class="m"><b>${E(t.title)}</b><small>${m[2]}${t.left !== null ? ` · ${t.left} place${t.left === 1 ? '' : 's'} left` : ''}</small></div><div class="r"><span class="rw">+${tk(t.reward)}</span>${st(t)}</div></div>`; }).join('')
    : '<div class="sv-empty"><i class="fa-solid fa-briefcase"></i>No tasks right now. New tasks are added often — check back soon.</div>';
}
function jobPage(){
  const t = X.jobs && X.jobs.tasks.find(x => x.id === X.jt); if(!t){ jobsPage(); return; }
  const m = JT[t.type] || JT.other, done = t.mine && t.mine.status === 'Approved', wait = t.mine && t.mine.status === 'Pending';
  show(t.title, `<div class="mj-dh"><div class="xs-lg ${m[1]}"><i class="${m[0]}"></i></div><div><h4>${E(t.title)}</h4><span class="rw">Reward +${tk(t.reward)}</span></div></div>
    ${t.steps ? `<div class="sv-card"><h4>What to do</h4><p style="white-space:pre-line">${E(t.steps)}</p></div>` : ''}
    ${t.link ? `<a class="sv-btn ghost" href="${E(t.link)}" target="_blank" rel="noopener nofollow" style="display:flex;text-decoration:none"><i class="fa-solid fa-arrow-up-right-from-square"></i>Open the task</a>` : ''}
    ${done ? '<div class="sv-card" style="text-align:center"><h4 style="color:var(--p)">Done ✓</h4><p>The reward is in your Extra Balance.</p></div>'
      : wait ? '<div class="sv-card" style="text-align:center"><h4 style="color:#ffae6b">Being checked</h4><p>We are checking your proof. The reward is added as soon as it is approved.</p></div>'
      : t.left === 0 ? '<div class="sv-empty">All places for this task are taken.</div>'
      : `${t.mine && t.mine.reason ? `<div class="sv-card"><p style="color:#ff8fa3">Last time: ${E(t.mine.reason)}</p></div>` : ''}<span class="sv-lbl" style="margin-top:12px">Proof: ${E(t.proof)}</span><textarea class="sv-in" id="mjProof" rows="3" maxlength="400" style="height:auto;padding:12px" placeholder="${E(t.proof)}"></textarea>
        <button class="sv-btn gold" style="margin-top:10px" id="mjBtn" onclick="mjSubmit()"><i class="fa-solid fa-paper-plane"></i>Submit proof</button>`}
    <div style="font-size:11.5px;color:var(--txt2);margin:10px 2px;line-height:1.6"><i class="fa-solid fa-shield-halved"></i> Do the task honestly with your own account. Fake or copied proof is rejected.</div>`);
}
window.mjSubmit = async function(){
  const proof = ($x('mjProof').value || '').trim(); if(proof.length < 3){ toast('Add your proof', true); return; }
  const b = $x('mjBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Sending…';
  const r = await api('jobSubmit', { tid: X.jt, proof });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-paper-plane"></i>Submit proof';
  if(!r.ok){ toast(r.data.error || 'Could not send', true); if(r.data.code === 'verify_required') svGo('verify'); return; }
  toast('Proof sent — we will check it soon'); const t = X.jobs.tasks.find(x => x.id === X.jt); if(t) t.mine = { status: 'Pending' }; jobPage();
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
    <div class="sv-card" style="margin-top:14px"><h4>How it works</h4><p>Get three ✕ in a row before the computer does. Each win adds ${tk(g.prize)} to your Extra Balance — up to ${g.perDay} paid wins a day. The game runs on our server, so every result is fair.</p></div>
    <div class="xs-soon"><i class="fa-solid fa-dice" style="font-size:20px;color:#ffd76a"></i>More games are coming soon.</div>`);
}
window.xsNew = async () => drawGame(await api('ttt', { op: 'new' }));
window.xsMove = async k => {
  document.querySelectorAll('.tt-c').forEach(c => c.disabled = true);
  const r = await api('ttt', { op: 'move', cell: k });
  if(r.ok && r.data.xbal !== null && r.data.xbal !== undefined && X.xb){ X.xb.xbal = r.data.xbal; render(); }
  drawGame(r);
};

load().then(() => { loadLive(); loadXb();
  // ?go=extra (from the daily reminder) opens the home page at Extra Services
  const go = new URLSearchParams(location.search).get('go');
  if(go === 'extra') setTimeout(() => { const b = $x('xsBlock'); if(b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 1200);
  // ?go=redeem (the daily code): open Redeem Code
  if(go === 'redeem') setTimeout(() => { if(user() && window.svGo) window.svGo('redeem'); }, 1500); });
setInterval(loadLive, 30e3);
// redraw the section after the language changes or the home page is rebuilt; reload the balance after login / logout
let _ph = (user() || {}).phone || '';
setInterval(() => { if(X.cfg) placeNotes(); slimAll(); if(X.cfg && !$x('xsBlock')) render(); const ph = (user() || {}).phone || ''; if(ph !== _ph){ _ph = ph; X.xb = null; loadXb().then(render); } }, 1500);
})();
// Quick Services pages (Mobile Recharge, Micro Jobs) are ready even before the settings load
(function(){ const P = window._svcPages, T = window._svcTiles; P.recharge = P.recharge || (() => window._xsRecharge()); P.jobs = P.jobs || (() => window._xsJobs()); T.x_job = T.x_job || { l: 'Task', cat: '', login: true, page: 'x_job' }; })();
