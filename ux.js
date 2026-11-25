/* Creditfy — small things that make the app feel faster and safer to use:
   • an "offline" bar when the internet drops (and a short "back online" note)
   • application drafts: what a user types in the application steps is kept on this phone, so a dropped
     connection or a closed tab does not lose it (cleared once the application is sent; kept 7 days) */
(function(){
const css = `
#netBar{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top));transform:translate(-50%,-140%);z-index:100000;display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:14px;
  font:700 12.5px/1.3 inherit;color:#fff;background:linear-gradient(135deg,#3a1420,#5a1c2a);border:1px solid rgba(255,107,129,.5);box-shadow:0 10px 26px rgba(0,0,0,.45);transition:transform .35s cubic-bezier(.2,.8,.2,1);max-width:calc(min(100vw,400px) - 24px)}
#netBar.on{transform:translate(-50%,0)}#netBar.ok{background:linear-gradient(135deg,#0d3a26,#0e5a35);border-color:rgba(29,219,128,.5)}
#netBar i{font-size:14px}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

/* ───────── offline / online ───────── */
let bar, hideT;
function net(on){
  if(!bar){ bar = document.createElement('div'); bar.id = 'netBar'; document.body.appendChild(bar); }
  clearTimeout(hideT);
  bar.className = on ? 'on ok' : 'on';
  bar.innerHTML = on ? '<i class="fa-solid fa-wifi"></i>Back online' : '<i class="fa-solid fa-plane-slash"></i>You are offline · your answers are kept';
  if(on) hideT = setTimeout(() => { bar.className = 'ok'; }, 2200);
}
window.addEventListener('offline', () => net(false));
window.addEventListener('online', () => net(true));
if(navigator.onLine === false) setTimeout(() => net(false), 800);

/* ───────── application drafts ───────── */
const SCREENS = ['screen-basic-info', 'screen-personal-info', 'screen-emergency-contact', 'screen-bank-info'];
const SKIP = /pass|pin|otp|trx/i;
const who = () => { try { return (JSON.parse(localStorage.getItem('creditUpUser')) || {}).phone || ''; } catch (e) { return ''; } };
const key = () => 'cf_draft_' + who();
const read = () => { try { const d = JSON.parse(localStorage.getItem(key()) || 'null'); return d && Date.now() - (d.at || 0) < 7 * 864e5 ? d : null; } catch (e) { return null; } };
const fields = () => SCREENS.flatMap(id => [...document.querySelectorAll(`#${id} input[id], #${id} textarea[id]`)]).filter(e => !SKIP.test(e.id) && !['file', 'checkbox', 'radio', 'password', 'hidden'].includes(e.type));
let saveT;
document.addEventListener('input', e => {
  const t = e.target; if(!who() || !t.id || !t.closest || !SCREENS.some(s => t.closest('#' + s)) || SKIP.test(t.id)) return;
  clearTimeout(saveT);
  // save every application field at once (typing quickly in two fields keeps both)
  saveT = setTimeout(() => { try { const d = read() || { v: {} }; fields().forEach(e => { if(e.value) d.v[e.id] = String(e.value).slice(0, 500); }); d.at = Date.now(); localStorage.setItem(key(), JSON.stringify(d)); } catch (er) {} }, 400);
}, true);
// fill empty fields from the draft when an application step is shown
function restore(){
  const d = read(); if(!d || !d.v) return;
  let n = 0;
  fields().forEach(e => { if(!e.value && d.v[e.id]){ e.value = d.v[e.id]; e.dispatchEvent(new Event('input', { bubbles: true })); n++; } });
  if(n && window._svToast) window._svToast('Your saved answers are filled in');
}
let last = '';
setInterval(() => {
  const a = (document.querySelector('.screen.active') || {}).id || '';
  if(a === last) return; last = a;
  if(SCREENS.includes(a)) setTimeout(restore, 300);
  // sent: the draft is no longer needed
  if(a === 'screen-review-progress') try { localStorage.removeItem(key()); } catch (e) {}
}, 700);
})();
