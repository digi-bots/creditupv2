/* Creditfy — one controller for the floating bars at the bottom (Hot Offer, Install app):
   • only one bar is open at a time; a bar that appears by itself waits as a tab if another is open
   • folded bars sit as neat, equal tabs in one column on the right edge — never on top of each other,
     always above the open bar
   • smart folding: scrolling down folds the open bar into its tab; tapping a tab opens it and folds the other
   • everything hides while a popup / sheet is open */
(function(){
const css = `
:root{--dock-r:max(0px,calc((100vw - 400px) / 2));--dock-tab:54px}
/* open bar: one place, bottom of the app column */
.hot-offer-floating[data-dock="open"],.pw-bar[data-dock="open"]{bottom:calc(14px + env(safe-area-inset-bottom))!important;transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .25s,box-shadow .3s!important}
/* tabs: equal size, stacked in one column on the right edge */
.hot-offer-floating[data-dock="tab"]{bottom:var(--dock-b)!important;right:var(--dock-r)!important;transform:translateX(calc(100% - var(--dock-tab)))!important;
  clip-path:inset(-24px calc(100% - var(--dock-tab)) -24px -24px)!important;border-radius:18px 0 0 18px!important;padding-top:12px!important;padding-bottom:12px!important;
  box-shadow:-8px 10px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.35),inset 1px 0 0 rgba(255,255,255,.25)!important;transition:transform .45s cubic-bezier(.22,1,.36,1)!important}
.hot-offer-floating[data-dock="tab"] .hot-close,.hot-offer-floating[data-dock="tab"] .hot-text,.hot-offer-floating[data-dock="tab"] .offer-bar,.hot-offer-floating[data-dock="tab"] .offer-left{display:none!important}
.hot-offer-floating[data-dock="tab"]{min-height:58px;height:58px;box-sizing:border-box;padding:0!important;display:flex!important;align-items:center}
.hot-offer-floating[data-dock="tab"] .hot-offer-content{width:var(--dock-tab);justify-content:center;padding:0!important}
.hot-offer-floating[data-dock="tab"] .hot-icon{font-size:24px;margin:0!important}
.hot-offer-floating[data-dock="tab"] .hot-icon{animation:fire-shake 1.6s infinite;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))}
.pw-bar[data-dock="tab"]{bottom:var(--dock-b)!important;right:var(--dock-r)!important;left:auto!important;transform:none!important;width:auto!important;padding:0!important;background:none!important;border:0!important;box-shadow:none!important}
.pw-bar[data-dock="tab"]>*:not(.pw-tab){display:none!important}
.pw-bar[data-dock="tab"] .pw-tab{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:var(--dock-tab);min-height:58px;height:58px;box-sizing:border-box;cursor:pointer;font-family:inherit;
  border:1px solid rgba(29,219,128,.5);border-right:0;border-radius:18px 0 0 18px;padding:7px 4px 6px;color:#bff5d8;font-size:9.5px;font-weight:900;letter-spacing:.4px;
  background:linear-gradient(160deg,rgba(18,64,44,.97),rgba(8,22,40,.97));box-shadow:-8px 10px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.18);animation:dockPeek .45s cubic-bezier(.2,.8,.2,1)}
.pw-bar[data-dock="tab"] .pw-tab img{width:26px;height:26px;border-radius:8px;box-shadow:0 3px 8px rgba(0,0,0,.4)}
/* a soft shine passes over the tabs now and then */
.dock-shine{position:relative;overflow:hidden}
.pw-bar[data-dock="tab"] .pw-tab::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%);background-size:250% 100%;animation:dockShine 4.5s ease-in-out infinite;pointer-events:none}
.pw-bar[data-dock="tab"] .pw-tab{position:relative;overflow:hidden}
@keyframes dockShine{0%,60%{background-position:120% 0}100%{background-position:-120% 0}}
@keyframes dockPeek{from{transform:translateX(100%)}to{transform:none}}
/* hidden while a popup / sheet is open */
body:has(.modal-overlay.on,.premium-cs-overlay.on,.bottom-sheet.on,#vPop,.sv-sheet.on) .pw-bar{opacity:0!important;pointer-events:none!important}
body:has(.sv-sheet.on) .hot-offer-floating{opacity:0!important;pointer-events:none!important}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const $ = id => document.getElementById(id);
const shown = el => !!el && el.style.display !== 'none' && getComputedStyle(el).display !== 'none' && (el.id !== 'pwBar' || el.classList.contains('on'));
// each bar: is it folded, and how to fold / open it
const BARS = [
  { id: 'hotOfferBanner', folded: el => el.classList.contains('folded') || el.classList.contains('away'), fold: el => el.classList.add('folded'), open: el => { el.classList.remove('folded'); } },
  { id: 'pwBar', folded: el => el.classList.contains('tab'), fold: el => el.classList.add('tab'), open: el => el.classList.remove('tab') }
];
let lastUser = 0, lastOpen = '';
// a tap on a bar or its tab = the user's choice (it wins over a bar that appeared by itself)
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('#hotOfferBanner,#pwBar'); if(b){ lastUser = Date.now(); lastOpen = b.id; } }, true);

let busy = false;
function layout(){
  if(busy) return; busy = true;
  try {
    // a bar that is hidden (e.g. the offer ended) is left alone
    BARS.forEach(b => { const el = $(b.id); if(el && el.dataset.dock && (el.style.display === 'none' || (b.id === 'pwBar' && !el.classList.contains('on')))) delete el.dataset.dock; });
    const live = BARS.map(b => ({ ...b, el: $(b.id) })).filter(b => shown(b.el));
    let open = live.filter(b => !b.folded(b.el));
    // only one open: keep the one the user just chose, otherwise the one that was open first
    if(open.length > 1){
      const keep = (Date.now() - lastUser < 1500 && open.find(b => b.id === lastOpen)) || open.find(b => b.el.dataset.dock === 'open') || open[0];
      open.filter(b => b !== keep).forEach(b => b.fold(b.el));
      open = [keep];
    }
    // fixed spots: every bar always folds to its own place (offer: first spot, app: second), the same on every page —
    // so nothing moves up or down when another bar opens or folds
    const BASE = 112, STEP = 68;
    BARS.forEach((b, k) => { const el = $(b.id), v = `calc(${BASE + k * STEP}px + env(safe-area-inset-bottom))`; if(el && el.style.getPropertyValue('--dock-b') !== v) el.style.setProperty('--dock-b', v); });
    live.forEach(b => { const v = b === open[0] ? 'open' : 'tab'; if(b.el.dataset.dock !== v) b.el.dataset.dock = v; });
  } finally { busy = false; }
}
// watch the bars' classes / visibility and the screen changes
const mo = new MutationObserver(() => requestAnimationFrame(layout));
const watch = () => { BARS.forEach(b => { const el = $(b.id); if(el && !el.dataset.dockWatched){ el.dataset.dockWatched = 1; mo.observe(el, { attributes: true, attributeFilter: ['class', 'style'] }); } });
  document.querySelectorAll('.screen').forEach(s => { if(!s.dataset.dockWatched){ s.dataset.dockWatched = 1; mo.observe(s, { attributes: true, attributeFilter: ['class'] }); } }); };
setInterval(() => { watch(); layout(); }, 1200);
window.addEventListener('resize', () => requestAnimationFrame(layout));

// smart folding: scrolling down a little folds the open bar into its tab (not remembered — tap the tab to open it)
let acc = 0, lastY = new WeakMap();
document.addEventListener('scroll', e => {
  const t = e.target === document ? document.scrollingElement : e.target; if(!t || typeof t.scrollTop !== 'number') return;
  const y = t.scrollTop, prev = lastY.get(t) ?? y; lastY.set(t, y);
  const d = y - prev; acc = d > 0 ? acc + d : 0;
  if(acc > 140 && Date.now() - lastUser > 1200){
    acc = 0;
    BARS.forEach(b => { const el = $(b.id); if(shown(el) && !b.folded(el)) b.fold(el); });
  }
}, { capture: true, passive: true });
watch(); layout();
})();
