/* Creditfy × Telegram (user side)
   • Mini App: when the site is opened inside Telegram it fits Telegram (full height, theme, back button),
     and a logged-in user is linked to their Telegram automatically (checked on our server).
   • Quick Services → Telegram: join the channel and the community group, and connect the account
     so loan, payment and order updates also come from the Creditfy bot. */
(function(){
const W = window.Telegram && window.Telegram.WebApp;
const inTg = !!(W && W.initData);
const user = () => { try { return JSON.parse(localStorage.getItem('creditUpUser')); } catch (e) { return null; } };
const api = (a, d) => (window._api ? window._api(a, d || {}, true) : Promise.resolve({ ok: false, data: {} }));
const E = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ───────── inside Telegram ───────── */
if(inTg){
  document.documentElement.classList.add('in-tg');
  try { W.ready(); W.expand(); W.setHeaderColor('#06101f'); W.setBackgroundColor('#050b16'); if(W.disableVerticalSwipes) W.disableVerticalSwipes(); } catch (e) {}
  const st = document.createElement('style');
  st.textContent = '.in-tg .pw-bar{display:none!important}.in-tg body{overscroll-behavior:none}';
  document.head.appendChild(st);
  // Telegram's back button follows the app: an open sheet or any screen other than home
  const back = W.BackButton;
  const needBack = () => { const sh = document.getElementById('svSheet'); if(sh && sh.classList.contains('on')) return true; const a = document.querySelector('.screen.active'); return !!(a && a.id !== 'screen-home'); };
  if(back){
    back.onClick(() => { const sh = document.getElementById('svSheet'); if(sh && sh.classList.contains('on') && window.svBack) return window.svBack(); if(window.nav) window.nav('screen-home'); else history.back(); });
    setInterval(() => { try { needBack() ? back.show() : back.hide(); } catch (e) {} }, 400);
  }
  // link this Telegram to the logged-in account (once per login on this phone)
  let tried = '';
  setInterval(async () => {
    const u = user(); if(!u || !u.phone || tried === u.phone) return;
    tried = u.phone; let done = ''; try { done = localStorage.getItem('cf_tg_linked') || ''; } catch (e) {}
    if(done === u.phone) return;
    const r = await api('tgLinkWebApp', { initData: W.initData });
    if(r.ok){ try { localStorage.setItem('cf_tg_linked', u.phone); } catch (e) {} if(window._svToast) window._svToast('Telegram connected — updates will come from our bot'); }
  }, 2500);
}

/* ───────── Quick Services → Telegram ───────── */
const css = `
.tg-hero{position:relative;overflow:hidden;border-radius:22px;padding:20px 16px;margin-bottom:12px;color:#fff;text-align:center;background:radial-gradient(120% 120% at 50% 0%,rgba(42,171,238,.45),transparent 60%),linear-gradient(160deg,#0b2a4a,#071426);border:1px solid rgba(42,171,238,.45)}
.tg-hero .big{width:64px;height:64px;margin:0 auto 8px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:30px;background:linear-gradient(135deg,#37bbfe,#1d8ed8);box-shadow:0 12px 26px rgba(42,171,238,.4),inset 0 1.5px 0 rgba(255,255,255,.5)}
.tg-hero h3{margin:0 0 4px;font-size:19px}.tg-hero p{margin:0;font-size:12.5px;color:#b9daf3;line-height:1.55}
.tg-row{display:flex;align-items:center;gap:12px;border-radius:16px;padding:12px;margin-bottom:9px;background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.015));border:1px solid var(--bord);text-decoration:none;color:inherit;cursor:pointer}
.tg-row .ic{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:19px;color:#fff;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.45),0 8px 16px rgba(0,0,0,.3)}
.tg-row b{display:block;font-size:13.5px;color:var(--txt)}.tg-row small{font-size:11.5px;color:var(--txt2)}.tg-row .go{margin-left:auto;color:var(--txt2)}
.tg-ok{display:flex;align-items:center;gap:10px;border-radius:16px;padding:12px;margin-bottom:10px;background:rgba(29,219,128,.08);border:1px solid rgba(29,219,128,.35);font-size:12.5px;color:var(--txt)}
.tg-ok i{color:var(--p);font-size:20px}`;
const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

async function page(){
  const show = window._svShow; if(!show) return;
  show('Telegram', '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>');
  const r = await api('tgState'); const d = r.ok ? r.data : {};
  if(!d.on && !d.channelLink && !d.groupLink){ show('Telegram', '<div class="sv-empty"><i class="fa-brands fa-telegram"></i>Our Telegram is coming soon.</div>'); return; }
  const row = (href, ic, bg, t, sub) => `<a class="tg-row" href="${E(href)}" target="_blank" rel="noopener"><div class="ic" style="background:${bg}"><i class="${ic}"></i></div><div><b>${t}</b><small>${sub}</small></div><i class="fa-solid fa-arrow-up-right-from-square go"></i></a>`;
  show('Telegram', `<div class="tg-hero"><div class="big"><i class="fa-brands fa-telegram"></i></div><h3>Creditfy on Telegram</h3><p>News, offers and new features in our channel — questions and chat in our community group.</p></div>
    ${d.channelLink ? row(d.channelLink, 'fa-solid fa-bullhorn', 'linear-gradient(135deg,#37bbfe,#1d8ed8)', 'Join our channel', 'Offers, news and updates first') : ''}
    ${d.groupLink ? row(d.groupLink, 'fa-solid fa-comments', 'linear-gradient(135deg,#1ddb80,#0e9a5a)', 'Join the community', 'Chat with members and our team') : ''}
    ${d.bot ? `<span class="sv-lbl" style="margin-top:12px">Your updates on Telegram</span>
      ${d.linked ? `<div class="tg-ok"><i class="fa-solid fa-circle-check"></i><div><b>Connected${d.tgName ? ' as ' + E(d.tgName) : ''}</b><br>Loan, payment and order updates also come from @${E(d.bot)}.</div></div>
        <button class="sv-btn ghost" onclick="tgUnlink()"><i class="fa-solid fa-link-slash"></i>Disconnect</button>`
      : `<div class="sv-card"><p>Connect your account to get your loan, payment and order updates from our official bot <b>@${E(d.bot)}</b>. You can also check your balance with /balance.</p></div>
        <button class="sv-btn" id="tgCon" onclick="tgConnect()"><i class="fa-brands fa-telegram"></i>Connect Telegram</button>`}` : ''}
    <div style="font-size:11.5px;color:var(--txt2);margin:12px 2px;line-height:1.6"><i class="fa-solid fa-shield-halved"></i> Our team will never ask for your PIN, OTP or password on Telegram. Only trust @${E(d.bot || 'our official bot')}.</div>`);
}
window.tgConnect = async function(){
  const b = document.getElementById('tgCon'); if(b){ b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Opening Telegram…'; }
  if(inTg){ const r = await api('tgLinkWebApp', { initData: W.initData }); if(b) b.disabled = false; if(r.ok){ try { localStorage.setItem('cf_tg_linked', (user() || {}).phone || ''); } catch (e) {} page(); return; } }
  const r = await api('tgLinkStart');
  if(b){ b.disabled = false; b.innerHTML = '<i class="fa-brands fa-telegram"></i>Connect Telegram'; }
  if(!r.ok){ if(window._svToast) window._svToast(r.data.error || 'Could not connect', true); return; }
  if(inTg && W.openTelegramLink) W.openTelegramLink(r.data.url); else window.open(r.data.url, '_blank');
  setTimeout(page, 8000);
};
window.tgUnlink = async function(){ if(!confirm('Stop getting updates on Telegram?')) return; await api('tgUnlink'); try { localStorage.removeItem('cf_tg_linked'); } catch (e) {} page(); };

const reg = () => { if(!window._svcPages || !window._svcTiles) return setTimeout(reg, 300);
  window._svcPages.telegram = page; };
reg();
})();
