/* Creditfy admin — App Settings, SEO & Reviews, Risk Center, Team & roles.
   Every settings page here uses the same save system as Site Config (header Save button + bottom save bar). */

const $p = id => document.getElementById(id);
const ep = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const hid = () => Math.random().toString(36).slice(2, 10);

/* ───────── shared styles ───────── */
(function(){
  const css = `
.pro-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:13px}
.pro-tabs button{display:flex;align-items:center;gap:7px;padding:9px 13px;border-radius:11px;border:1px solid var(--border);background:var(--card);color:var(--txt2);font-weight:700;font-size:12.5px;cursor:pointer;font-family:inherit}
.pro-tabs button.on{background:rgba(29,219,128,.12);border-color:rgba(29,219,128,.45);color:var(--p)}
.pro-pane{display:none}.pro-pane.on{display:block}
.pro-row{display:grid;gap:7px;align-items:center;padding:9px;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,.02);margin-bottom:7px}
.pro-row input,.pro-row select,.pro-row textarea{height:34px;padding:0 10px;border-radius:8px;background:rgba(255,255,255,.04);border:1.5px solid var(--border);color:var(--txt);font-size:12.5px;outline:none;min-width:0;width:100%;box-sizing:border-box;font-family:inherit}
.pro-row textarea{height:auto;padding:7px 10px;resize:vertical}
.pro-row select option{background:#0f1d35}
.pro-row .k{font-size:12px;font-weight:800;color:var(--txt)}
.pro-row.off{opacity:.55}
.tl-row{grid-template-columns:auto 150px 1.2fr 1.6fr 1fr}
.lg-row{grid-template-columns:1fr 1fr auto}
.faq-row{grid-template-columns:auto 1fr 1.6fr auto}
.rv-row{grid-template-columns:1fr auto;align-items:flex-start}
@media(max-width:900px){.tl-row,.faq-row{grid-template-columns:1fr 1fr}.lg-row{grid-template-columns:1fr}}
.pro-note{font-size:12px;color:var(--txt2);line-height:1.6}
.pro-ok{color:var(--p);font-weight:800}.pro-bad{color:var(--red);font-weight:800}.pro-warn{color:var(--orange);font-weight:800}
.seo-top{display:grid;grid-template-columns:180px 1fr;gap:16px;align-items:center}
.seo-ring{--v:0;width:150px;height:150px;border-radius:50%;margin:auto;display:flex;align-items:center;justify-content:center;flex-direction:column;background:conic-gradient(var(--c,var(--p)) calc(var(--v)*1%),rgba(255,255,255,.06) 0);position:relative}
.seo-ring::before{content:"";position:absolute;inset:12px;border-radius:50%;background:var(--card)}
.seo-ring b,.seo-ring span{position:relative}.seo-ring b{font-size:34px;font-weight:900}.seo-ring span{font-size:11px;color:var(--txt2)}
.seo-checks{display:flex;flex-direction:column;gap:6px}
.seo-ck{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.025);border:1px solid var(--border)}
.seo-ck i{margin-top:2px}.seo-ck .ok{color:var(--p)}.seo-ck .bad{color:var(--red)}.seo-ck .warn{color:var(--orange)}
.seo-ck small{display:block;color:var(--txt2);font-size:11px;margin-top:1px}
.serp{background:#fff;border-radius:12px;padding:14px 16px;color:#202124;font-family:Arial,sans-serif;max-width:600px}
.serp .u{font-size:12px;color:#4d5156}.serp .t{font-size:19px;color:#1a0dab;margin:3px 0;line-height:1.3}.serp .d{font-size:13px;color:#4d5156;line-height:1.5}
.ogc{max-width:420px;border-radius:12px;overflow:hidden;border:1px solid var(--border);background:#f0f2f5;color:#1c1e21;font-family:Arial,sans-serif}
.ogc .im{height:200px;background:#dfe3e8 center/cover no-repeat;display:flex;align-items:center;justify-content:center;color:#888;font-size:12px}
.ogc .tx{padding:10px 12px}.ogc .dm{font-size:11px;color:#65676b;text-transform:uppercase}.ogc .tt{font-weight:700;font-size:15px;margin:2px 0}.ogc .ds{font-size:13px;color:#65676b}
.prev-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:900px){.seo-top,.prev-grid{grid-template-columns:1fr}}
.cnt{font-size:10.5px;color:var(--txt2);text-align:right;margin-top:2px}.cnt.bad{color:var(--red)}
.rv-stars{color:#ffc94d;letter-spacing:1px}
.rv-st{font-size:10px;font-weight:800;padding:2px 7px;border-radius:7px;margin-left:6px}
.rv-st.pending{background:rgba(255,140,66,.14);color:var(--orange)}.rv-st.approved{background:rgba(29,219,128,.14);color:var(--p)}.rv-st.hidden{background:rgba(255,255,255,.08);color:var(--txt2)}
.rk-card{border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.02);padding:12px;margin-bottom:9px;display:flex;gap:12px}
.rk-card.high{border-left:4px solid var(--red)}.rk-card.med{border-left:4px solid var(--orange)}.rk-card.low{border-left:4px solid var(--blue)}
.rk-card.done{opacity:.6}
.rk-ic{width:34px;height:34px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(255,77,106,.12);color:var(--red)}
.rk-card.med .rk-ic{background:rgba(255,140,66,.12);color:var(--orange)}.rk-card.low .rk-ic{background:rgba(77,143,255,.12);color:var(--blue)}
.rk-m{flex:1;min-width:0}.rk-m b{display:block;font-size:13.5px}.rk-m p{font-size:12px;color:var(--txt2);margin:3px 0 6px;line-height:1.5}
.rk-ppl{display:flex;flex-wrap:wrap;gap:5px}
.rk-ppl a{font-size:11px;font-family:monospace;padding:2px 7px;border-radius:7px;background:rgba(255,255,255,.06);color:var(--txt);cursor:pointer;text-decoration:none}
.rk-acts{display:flex;flex-direction:column;gap:5px;flex:none}
.pm-wrap{overflow-x:auto}
.pm{border-collapse:collapse;width:100%;min-width:640px;font-size:12px}
.pm th,.pm td{padding:6px 7px;border-bottom:1px solid var(--border);text-align:left}
.pm th{color:var(--txt2);font-size:10.5px;text-transform:uppercase;letter-spacing:.4px}
.pm select{height:30px;padding:0 6px;border-radius:7px;background:rgba(255,255,255,.04);border:1.5px solid var(--border);color:var(--txt);font-size:12px;font-family:inherit}
.pm select option{background:#0f1d35}
.pm select.v-edit{border-color:rgba(29,219,128,.5);color:var(--p)}.pm select.v-none{color:var(--txt3,#5a6b85)}
.tm-row{display:grid;grid-template-columns:1.4fr 1fr 150px auto;gap:8px;align-items:center;padding:10px;border-radius:10px;border:1px solid var(--border);margin-bottom:7px;background:rgba(255,255,255,.02)}
.tm-row select{height:34px;border-radius:8px;background:rgba(255,255,255,.04);border:1.5px solid var(--border);color:var(--txt);font-family:inherit;padding:0 8px}
.tm-row select option{background:#0f1d35}
@media(max-width:800px){.tm-row{grid-template-columns:1fr 1fr}}
.sec.ro .btn-p:not(.ro-ok),.sec.ro .btn-d,.sec.ro .btn-o,.sec.ro .ab-ok,.sec.ro .ab-no,.sec.ro .ab-d,.sec.ro .ab-s,.sec.ro .sv-btn{display:none!important}
.sec.ro .ro-banner{display:flex}
.ro-banner{display:none;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;margin-bottom:12px;background:rgba(77,143,255,.1);border:1px solid rgba(77,143,255,.3);color:#9ec0ff;font-size:12.5px;font-weight:700}
.pw-prev{max-width:360px;border-radius:16px;padding:12px;display:flex;gap:11px;align-items:center;background:linear-gradient(135deg,#0d2f1f,#071a11);border:1px solid rgba(29,219,128,.35)}
.pw-prev .ic{width:44px;height:44px;border-radius:12px;background:linear-gradient(145deg,#0a6e35,#0f9e4e);flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900}
.pw-prev .tx{flex:1;font-size:12.5px;color:#dff5e8}.pw-prev button{border:0;border-radius:9px;background:var(--p);color:#03210f;font-weight:800;padding:8px 12px;font-family:inherit}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();

function proTabs(sec, list, cur){
  return `<div class="pro-tabs" id="${sec}Tabs">${list.map(([k, ic, l]) => `<button data-k="${k}" class="${k === cur ? 'on' : ''}" onclick="proTab('${sec}','${k}')"><i class="fa-solid fa-${ic}"></i>${l}</button>`).join('')}</div>`;
}
function proTab(sec, k){
  document.querySelectorAll(`#${sec}Tabs button`).forEach(b => b.classList.toggle('on', b.dataset.k === k));
  document.querySelectorAll(`#sec-${sec} .pro-pane`).forEach(p => p.classList.toggle('on', p.dataset.k === k));
  try{ localStorage.setItem('pro_' + sec, k); }catch(e){}
  if(sec === 'seo' && k === 'score') seoScore();
  if(sec === 'seo' && k === 'reviews') rvLoad();
}
function proTabStart(sec, def){ let k = def; try{ k = localStorage.getItem('pro_' + sec) || def; }catch(e){} if(!document.querySelector(`#${sec}Tabs [data-k="${k}"]`)) k = def; proTab(sec, k); }
const svBtn = tab => `<button class="btn btn-p btn-lg sv-btn" id="svBtn-${tab}" onclick="saveTab('${tab}')" disabled><i class="fa-solid fa-circle-check"></i><span>All saved</span></button>`;
const roBanner = '<div class="ro-banner"><i class="fa-solid fa-eye"></i>View only — your role cannot change this page.</div>';
// fill inputs by id from a map; checkboxes take booleans
function fillIn(map){ Object.entries(map).forEach(([id, v]) => { const e = $p(id); if(!e) return; if(e.type === 'checkbox') e.checked = !!v; else e.value = v ?? ''; }); }
const val = id => ($p(id)?.value || '').trim();
const chk = id => !!$p(id)?.checked;
const numv = (id, d, lo, hi) => { const x = parseFloat(val(id)); return Math.min(hi ?? 1e9, Math.max(lo ?? -1e9, isNaN(x) ? d : x)); };
function afterLoad(tab){ _dirty[tab] = new Set(); _snapTake(tab); _paintSave(); }
const tog = (id, label, on) => `<div class="fg"><label class="hp-sw"><label class="tog"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span class="tog-sl"></span></label>${label}</label></div>`;
const inp = (id, label, ph, extra = '') => `<div class="fg${/full/.test(extra) ? ' full' : ''}"><label>${label}</label><input id="${id}" placeholder="${ep(ph || '')}" ${extra.replace('full', '')}></div>`;
const area = (id, label, ph, rows = 2, extra = '') => `<div class="fg full"><label>${label}</label><textarea id="${id}" rows="${rows}" placeholder="${ep(ph || '')}" ${extra}></textarea></div>`;

/* ═════════ APP SETTINGS (siteConfig/app) ═════════ */
const TL_KEYS = [['submitted', 'Application submitted'], ['fee', 'Fee paid (TrxID sent)'], ['feeVerified', 'Payment verified'], ['review', 'Under review'], ['approved', 'Loan approved'], ['disbursed', 'Money sent']];
const APP_DEF = {
  timeline: { on: true, live: true, showTimes: true, showEta: true, rejected: 'Application not approved', note: '',
    steps: { submitted: { on: true, label: 'Application submitted', desc: 'We received your application.', eta: '' },
      fee: { on: true, label: 'Fee paid', desc: 'Your payment is waiting for verification.', eta: '5–15 min' },
      feeVerified: { on: true, label: 'Payment verified', desc: 'Your fee payment was confirmed.', eta: '' },
      review: { on: true, label: 'Under review', desc: 'Our team is checking your details.', eta: 'Within 24 hours' },
      approved: { on: true, label: 'Loan approved', desc: 'Your loan was approved.', eta: '' },
      disbursed: { on: true, label: 'Money sent', desc: 'The loan was sent to your account.', eta: '' } } },
  lang: { on: true, showSwitch: true, def: 'en', custom: [] },
  pwa: { on: true, name: 'Creditfy', short: 'Creditfy', desc: '', theme: '#0a6e35', bg: '#060d1a', display: 'standalone', icon: '', prompt: true,
    promptText: 'Install the Creditfy app — opens faster and works like a real app.', btn: 'Install', delay: 15, iosHint: true },
  push: { on: true, askDelay: 8, askTitle: 'Get updates on your phone', askText: 'Know the moment your payment is verified, your loan is approved or the money is sent — even when the app is closed.', askBtn: 'Turn on',
    auto: { updates: true, bonus: true, welcome: true, broadcast: true } },
  overdue: { on: true, graceDays: 0, notify: true, title: 'Payment Overdue', msg: 'Your loan {ref} was due on {due}. Please pay as soon as possible to keep your account in good standing.',
    remind: true, remindDays: 3, remindTitle: 'Payment Reminder', remindMsg: 'Your loan {ref} is due on {due}. Please make sure the payment is ready.' }
};
let _APP = clone(APP_DEF);

function buildAppSet(){
  const s = $p('sec-appset'); if(!s || s.dataset.built) return; s.dataset.built = 1;
  s.innerHTML = `<div class="sec-head"><h2>App Settings</h2>${svBtn('appset')}</div>${roBanner}
  ${proTabs('appset', [['tl', 'route', 'Tracking Timeline'], ['lang', 'language', 'Language'], ['pwa', 'download', 'App Install'], ['push', 'bell', 'Push Notifications'], ['od', 'calendar-xmark', 'Overdue Loans']], 'tl')}
  <div class="pro-pane" data-k="tl">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-route"></i>Live application tracking</div>
      <div class="fgrid fgrid3">${tog('tl-on', 'Show the tracking timeline', 1)}${tog('tl-live', 'Update live (no refresh needed)', 1)}${tog('tl-times', 'Show date and time of each step', 1)}${tog('tl-eta', 'Show “usually takes” times', 1)}
      ${inp('tl-rejected', 'Text when an application is rejected', 'Application not approved')}${inp('tl-note', 'Note under the timeline', 'e.g. Questions? Tap Support.')}</div>
      <div class="hint" style="margin-top:8px">Users see it in “Application Details”. Steps follow the real status of each application.</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-list-check"></i>Steps</div><div id="tlSteps"></div></div>
  </div>
  <div class="pro-pane" data-k="lang">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-language"></i>Bangla / English</div>
      <div class="fgrid fgrid3">${tog('lg-on', 'Bangla available', 1)}${tog('lg-switch', 'Show the EN / বাং switch in the top bar', 1)}
      <div class="fg"><label>Language for new visitors</label><select id="lg-def"><option value="en">English</option><option value="bn">বাংলা (Bangla)</option></select></div></div>
      <div class="hint" style="margin-top:8px">The app has a built-in Bangla dictionary for its menus, buttons and forms. A user’s own choice is remembered on their phone.</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-pen-nib"></i>Your own translations <button class="btn btn-sm btn-p" style="margin-left:auto" onclick="lgAdd()"><i class="fa-solid fa-plus"></i>Add</button></div>
      <div class="hint" style="margin:-4px 0 10px">Type the English text exactly as it appears on the site and how it should read in Bangla. These win over the built-in words — use them for your own offers, titles and notices.</div>
      <div id="lgRows"></div>
    </div>
  </div>
  <div class="pro-pane" data-k="pwa">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-mobile-screen-button"></i>Install as an app (PWA)</div>
      <div class="fgrid fgrid3">${tog('pw-on', 'Allow installing the app', 1)}${inp('pw-name', 'App name', 'Creditfy', 'maxlength="40"')}${inp('pw-short', 'Name under the icon (max 12)', 'Creditfy', 'maxlength="12"')}
      ${inp('pw-theme', 'Theme colour', '#0a6e35', 'maxlength="7"')}${inp('pw-bg', 'Splash background colour', '#060d1a', 'maxlength="7"')}
      <div class="fg"><label>Opens as</label><select id="pw-display"><option value="standalone">App window (recommended)</option><option value="fullscreen">Full screen</option><option value="minimal-ui">Browser with small bar</option></select></div>
      ${inp('pw-icon', 'Icon URL (PNG 512×512, optional)', 'https://… empty = built-in icon', 'full')}${area('pw-desc', 'Description', 'Apply for loans from your phone in minutes.')}</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-bell"></i>Install invitation</div>
      <div class="fgrid fgrid3">${tog('pw-prompt', 'Invite users to install', 1)}${inp('pw-delay', 'Show after (seconds on the site)', '15', 'type="number" min="0" max="600"')}${tog('pw-ios', 'Show iPhone “Add to Home Screen” help', 1)}
      ${inp('pw-text', 'Invitation text', '', 'full maxlength="120"')}${inp('pw-btn', 'Button text', 'Install', 'maxlength="16"')}</div>
      <div class="man-sub">Preview</div><div class="pw-prev"><div class="ic">CF</div><div class="tx" id="pwPrevT"></div><button id="pwPrevB">Install</button></div>
      <div class="hint" style="margin-top:8px">Android and desktop Chrome show a real install button. iPhone (Safari) has no install button, so users get short “Share → Add to Home Screen” help instead.</div>
    </div>
  </div>
  <div class="pro-pane" data-k="push">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-bell"></i>Phone notifications <button class="btn btn-sm btn-s ro-ok" style="margin-left:auto" onclick="puStats()"><i class="fa-solid fa-rotate-right"></i>Refresh</button></div>
      <div class="stats" id="puStats" style="margin-bottom:10px"></div>
      <div class="fgrid fgrid3">${tog('pu-on', 'Phone notifications on', 1)}${inp('pu-delay', 'Ask users after (seconds)', '8', 'type="number" min="2" max="120"')}</div>
      <div class="man-sub">Send these to phones automatically</div>
      <div class="fgrid fgrid3">${tog('pu-a-updates', 'Payment & loan updates (verified, approved, sent, overdue, reminders)', 1)}${tog('pu-a-bonus', 'Bonuses & rewards', 1)}${tog('pu-a-welcome', 'Welcome message', 1)}${tog('pu-a-broadcast', 'Broadcasts (default for the Broadcast page)', 1)}</div>
      <div class="man-sub">Invitation card</div>
      <div class="fgrid">${inp('pu-title', 'Title', 'Get updates on your phone', 'full maxlength="60"')}${area('pu-text', 'Text', '', 2, 'maxlength="200"')}${inp('pu-btn', 'Button', 'Turn on', 'maxlength="16"')}</div>
      <div class="hint" style="margin-top:8px">Users are asked only after they log in, with a friendly card first (not a sudden browser pop-up). Android and computers work in the browser; iPhone needs iOS 16.4+ and the app added to the home screen. Send a message to everyone from <b>Broadcast</b>.</div>
    </div>
  </div>
  <div class="pro-pane" data-k="od">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-calendar-xmark"></i>Mark overdue loans automatically <button class="btn btn-sm btn-s ro-ok" style="margin-left:auto" onclick="odRun()"><i class="fa-solid fa-play"></i>Run check now</button></div>
      <div class="fgrid fgrid3">${tog('od-on', 'Check every day automatically', 1)}${inp('od-grace', 'Grace days after the due date', '0', 'type="number" min="0" max="60"')}${tog('od-notify', 'Tell the user when the loan becomes overdue', 1)}
      ${inp('od-title', 'Overdue message title', 'Payment Overdue', 'maxlength="60"')}${area('od-msg', 'Overdue message', '', 2, 'maxlength="300"')}</div>
      <div class="man-sub">Reminder before the due date</div>
      <div class="fgrid fgrid3">${tog('od-remind', 'Send a reminder', 1)}${inp('od-rdays', 'Days before the due date', '3', 'type="number" min="1" max="30"')}${inp('od-rtitle', 'Reminder title', 'Payment Reminder', 'maxlength="60"')}${area('od-rmsg', 'Reminder message', '', 2, 'maxlength="300"')}</div>
      <div class="hint" style="margin-top:8px">Use {ref} for the loan number, {due} for the due date and {amount} for the loan amount. Due date = the stored due date, or the day the loan was sent + its term. The daily check runs at 9:00 AM Bangladesh time.</div>
      <div id="odLast" class="pro-note" style="margin-top:10px"></div>
    </div>
  </div>`;
  ['pw-text', 'pw-btn'].forEach(id => $p(id).addEventListener('input', pwPrev));
}
function tlRender(){
  $p('tlSteps').innerHTML = TL_KEYS.map(([k, name]) => { const x = _APP.timeline.steps[k] || {}; return `<div class="pro-row tl-row">
    <label class="tog" title="Show"><input type="checkbox" id="tl-${k}-on" ${x.on !== false ? 'checked' : ''}><span class="tog-sl"></span></label>
    <div class="k">${name}</div><input id="tl-${k}-label" value="${ep(x.label)}" placeholder="Label" maxlength="40"><input id="tl-${k}-desc" value="${ep(x.desc)}" placeholder="Short explanation" maxlength="120"><input id="tl-${k}-eta" value="${ep(x.eta)}" placeholder="Usually takes…" maxlength="30"></div>`; }).join('');
}
function lgRender(){
  const L = _APP.lang.custom;
  $p('lgRows').innerHTML = L.length ? L.map((x, i) => `<div class="pro-row lg-row"><input value="${ep(x.en)}" placeholder="English text" oninput="_APP.lang.custom[${i}].en=this.value;markDirty('appset','lg')" data-nodirty="1"><input value="${ep(x.bn)}" placeholder="বাংলা" oninput="_APP.lang.custom[${i}].bn=this.value;markDirty('appset','lg')" data-nodirty="1"><button class="ab ab-d" onclick="_APP.lang.custom.splice(${i},1);markDirty('appset','lg');lgRender()"><i class="fa-solid fa-trash"></i></button></div>`).join('') : '<div class="hint">No own translations yet.</div>';
}
function lgAdd(){ _APP.lang.custom.push({ id: hid(), en: '', bn: '' }); markDirty('appset', 'lg'); lgRender(); }
function pwPrev(){ $p('pwPrevT').textContent = val('pw-text') || APP_DEF.pwa.promptText; $p('pwPrevB').textContent = val('pw-btn') || 'Install'; }
async function loadAppSet(){
  buildAppSet();
  const d = (await window._getDoc('siteConfig', 'app')) || {};
  _APP = clone(APP_DEF);
  ['timeline', 'lang', 'pwa', 'overdue', 'push'].forEach(k => Object.assign(_APP[k], d[k] || {}));
  _APP.push.auto = { ...APP_DEF.push.auto, ...((d.push || {}).auto || {}) };
  _APP.timeline.steps = { ...clone(APP_DEF.timeline.steps), ...((d.timeline || {}).steps || {}) };
  _APP.lang.custom = (Array.isArray(_APP.lang.custom) ? _APP.lang.custom : []).map(x => ({ id: hid(), ...x }));
  const T = _APP.timeline, G = _APP.lang, W = _APP.pwa, O = _APP.overdue, U = _APP.push;
  fillIn({ 'pu-on': U.on, 'pu-delay': U.askDelay, 'pu-a-updates': U.auto.updates, 'pu-a-bonus': U.auto.bonus, 'pu-a-welcome': U.auto.welcome, 'pu-a-broadcast': U.auto.broadcast, 'pu-title': U.askTitle, 'pu-text': U.askText, 'pu-btn': U.askBtn });
  puStats();
  fillIn({ 'tl-on': T.on, 'tl-live': T.live, 'tl-times': T.showTimes, 'tl-eta': T.showEta, 'tl-rejected': T.rejected, 'tl-note': T.note,
    'lg-on': G.on, 'lg-switch': G.showSwitch, 'lg-def': G.def,
    'pw-on': W.on, 'pw-name': W.name, 'pw-short': W.short, 'pw-theme': W.theme, 'pw-bg': W.bg, 'pw-display': W.display, 'pw-icon': W.icon, 'pw-desc': W.desc, 'pw-prompt': W.prompt, 'pw-delay': W.delay, 'pw-ios': W.iosHint, 'pw-text': W.promptText, 'pw-btn': W.btn,
    'od-on': O.on, 'od-grace': O.graceDays, 'od-notify': O.notify, 'od-title': O.title, 'od-msg': O.msg, 'od-remind': O.remind, 'od-rdays': O.remindDays, 'od-rtitle': O.remindTitle, 'od-rmsg': O.remindMsg });
  tlRender(); lgRender(); pwPrev(); odLast();
  proTabStart('appset', 'tl');
  afterLoad('appset');
}
async function saveAppSet(){
  const hex = (v, d) => /^#[0-9a-f]{6}$/i.test(v) ? v : d;
  const steps = {}; TL_KEYS.forEach(([k]) => { steps[k] = { on: chk(`tl-${k}-on`), label: val(`tl-${k}-label`) || APP_DEF.timeline.steps[k].label, desc: val(`tl-${k}-desc`), eta: val(`tl-${k}-eta`) }; });
  const icon = val('pw-icon');
  if(icon && !/^https:\/\//i.test(icon)) throw new Error('The app icon must be an https:// link to a PNG image');
  const data = {
    timeline: { on: chk('tl-on'), live: chk('tl-live'), showTimes: chk('tl-times'), showEta: chk('tl-eta'), rejected: val('tl-rejected') || APP_DEF.timeline.rejected, note: val('tl-note'), steps },
    lang: { on: chk('lg-on'), showSwitch: chk('lg-switch'), def: val('lg-def') || 'en', custom: _APP.lang.custom.filter(x => String(x.en || '').trim() && String(x.bn || '').trim()).map(x => ({ en: String(x.en).trim(), bn: String(x.bn).trim() })) },
    pwa: { on: chk('pw-on'), name: val('pw-name') || 'Creditfy', short: (val('pw-short') || val('pw-name') || 'Creditfy').slice(0, 12), theme: hex(val('pw-theme'), '#0a6e35'), bg: hex(val('pw-bg'), '#060d1a'),
      display: val('pw-display') || 'standalone', icon, desc: val('pw-desc'), prompt: chk('pw-prompt'), delay: numv('pw-delay', 15, 0, 600), iosHint: chk('pw-ios'), promptText: val('pw-text') || APP_DEF.pwa.promptText, btn: val('pw-btn') || 'Install' },
    push: { on: chk('pu-on'), askDelay: numv('pu-delay', 8, 2, 120), askTitle: val('pu-title') || APP_DEF.push.askTitle, askText: val('pu-text') || APP_DEF.push.askText, askBtn: val('pu-btn') || 'Turn on',
      auto: { updates: chk('pu-a-updates'), bonus: chk('pu-a-bonus'), welcome: chk('pu-a-welcome'), broadcast: chk('pu-a-broadcast') } },
    overdue: { on: chk('od-on'), graceDays: numv('od-grace', 0, 0, 60), notify: chk('od-notify'), title: val('od-title') || APP_DEF.overdue.title, msg: val('od-msg') || APP_DEF.overdue.msg,
      remind: chk('od-remind'), remindDays: numv('od-rdays', 3, 1, 30), remindTitle: val('od-rtitle') || APP_DEF.overdue.remindTitle, remindMsg: val('od-rmsg') || APP_DEF.overdue.remindMsg },
    updatedAt: new Date().toISOString()
  };
  await window._setDoc('siteConfig', 'app', data);
  await logAct('App settings saved', 'config', 'app');
  _APP.lang.custom = data.lang.custom.map(x => ({ id: hid(), ...x })); lgRender();
}
async function puStats(){
  const el = $p('puStats'); if(!el) return;
  const r = await window._accountApi('adminPushStats', {});
  const v = r.ok ? r.data : { devices: '–', users: '–' };
  el.innerHTML = [['mobile-screen', 'gn', v.devices, 'Devices with notifications on'], ['users', 'bl', v.users, 'Users reachable by push']].map(([ic, cl, n, l]) => `<div class="sc ${cl}"><div class="sc-ic ic-${cl}"><i class="fa-solid fa-${ic}"></i></div><div class="sc-val">${n}</div><div class="sc-lbl">${l}</div></div>`).join('');
}
async function odLast(){
  const r = await window._getDoc('adminConfig', 'overdueRun');
  $p('odLast').innerHTML = r ? `<i class="fa-solid fa-clock-rotate-left"></i> Last check: <b>${fd(r.at)}</b> (${ep(r.by || '')}) — ${r.skipped ? 'switched off' : `${r.checked} loans checked, <span class="pro-warn">${r.marked} marked overdue</span>, ${r.reminded} reminded`}` : 'No check has run yet.';
}
async function odRun(){
  showL(true);
  const r = await window._accountApi('runOverdue', {});
  showL(false);
  if(!r.ok){ toast(r.data.error || 'Check failed', 'e'); return; }
  toast(`Done: ${r.data.marked} overdue, ${r.data.reminded} reminded`, r.data.marked ? 'w' : 's');
  odLast();
}
window._SAVERS.appset = { load: loadAppSet, save: saveAppSet, data: () => ({ 'Language › Own translations': _APP.lang.custom }) };

/* ═════════ SEO & REVIEWS (siteConfig/seo + reviews) ═════════ */
const SEO_DEF = { title: 'Creditfy – Smart Loans in Bangladesh', description: 'Apply for a loan from your phone in minutes. Transparent fees, fast review and money sent to bKash, Nagad or Rocket.',
  keywords: 'online loan, instant loan bangladesh, bkash loan, nagad loan, mobile loan', canonical: '', siteName: 'Creditfy', locale: 'en_BD', author: '', ogTitle: '', ogDescription: '', ogImage: '', twitter: '',
  schemaType: 'FinancialService', org: { name: '', logo: '', phone: '', email: '', address: '', city: 'Dhaka', country: 'BD', sameAs: [] }, faq: [], verify: { google: '', bing: '', yandex: '', facebook: '' },
  analytics: { ga4: '', gtm: '', pixel: '', clarity: '' }, index: true, ratings: true, robotsExtra: '', sitemapExtra: [],
  reviews: { on: true, title: 'What our users say', max: 10, minStars: 1, ask: true, askText: 'How was your experience? Your review helps other people choose with confidence.' } };
let _SEO = clone(SEO_DEF);
const FAQ_SUGGEST = [
  ['How fast can I get a loan?', 'Fill in the application in a few minutes. After the fee is verified, our team reviews it — usually within 24 hours.'],
  ['Which wallets can receive the loan?', 'The loan is sent to your bKash, Nagad or Rocket account, or to the bank account you choose.'],
  ['Are there any hidden fees?', 'No. Every fee is shown before you apply, and you must accept them before you submit.'],
  ['Is my data safe?', 'Your data is encrypted and never sold or shared.']
];

function buildSeo(){
  const s = $p('sec-seo'); if(!s || s.dataset.built) return; s.dataset.built = 1;
  s.innerHTML = `<div class="sec-head"><h2>SEO &amp; Reviews</h2>${svBtn('seo')}</div>${roBanner}
  ${proTabs('seo', [['score', 'gauge-high', 'Score & Preview'], ['meta', 'tags', 'Title & Social'], ['schema', 'sitemap', 'Business & FAQ'], ['track', 'chart-simple', 'Search engines & Analytics'], ['robots', 'robot', 'Robots & Sitemap'], ['reviews', 'star', 'User Reviews']], 'score')}
  <div class="pro-pane" data-k="score">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-gauge-high"></i>SEO score</div>
      <div class="seo-top"><div class="seo-ring" id="seoRing"><b id="seoPct">0</b><span>out of 100</span></div><div class="seo-checks" id="seoChecks"></div></div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-eye"></i>How it looks</div>
      <div class="prev-grid"><div><div class="man-sub" style="margin-top:0">Google result</div><div class="serp"><div class="u" id="pvU"></div><div class="t" id="pvT"></div><div class="d" id="pvD"></div></div></div>
      <div><div class="man-sub" style="margin-top:0">Facebook / WhatsApp share</div><div class="ogc"><div class="im" id="pvI">No share image</div><div class="tx"><div class="dm" id="pvDm"></div><div class="tt" id="pvOt"></div><div class="ds" id="pvOd"></div></div></div></div></div>
      <div class="hint" style="margin-top:10px">After saving, the home page HTML carries these settings for search engines and link previews within about 5 minutes. Test: <a href="/robots.txt" target="_blank" style="color:var(--blue)">robots.txt</a> · <a href="/sitemap.xml" target="_blank" style="color:var(--blue)">sitemap.xml</a> · <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener" style="color:var(--blue)">Rich results test</a> · <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener" style="color:var(--blue)">Facebook debugger</a></div>
    </div>
  </div>
  <div class="pro-pane" data-k="meta">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-heading"></i>Search result</div>
      <div class="fgrid">${inp('se-title', 'Page title (50–60 letters is best)', '', 'full maxlength="80"')}<div class="cnt full" id="cntT"></div>
      ${area('se-desc', 'Description (120–160 letters is best)', '', 3, 'maxlength="300"')}<div class="cnt full" id="cntD"></div>
      ${inp('se-kw', 'Keywords (comma-separated)', 'online loan, bkash loan, …', 'full')}
      ${inp('se-url', 'Site address (canonical URL)', 'https://www.yoursite.com', '')}${inp('se-name', 'Site name', 'Creditfy')}
      <div class="fg"><label>Main language / region</label><select id="se-locale"><option value="en_BD">English – Bangladesh</option><option value="bn_BD">বাংলা – Bangladesh</option><option value="en_US">English</option></select></div>${inp('se-author', 'Author / company', '')}</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-share-nodes"></i>Social sharing (Facebook, WhatsApp, Messenger, X)</div>
      <div class="fgrid">${inp('se-ogt', 'Share title (empty = page title)', '', 'full maxlength="90"')}${area('se-ogd', 'Share description (empty = description)', '', 2, 'maxlength="200"')}
      ${inp('se-ogi', 'Share image URL (1200×630, https)', 'https://…', 'full')}${inp('se-tw', 'X / Twitter username', '@yourpage')}</div>
    </div>
  </div>
  <div class="pro-pane" data-k="schema">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-building"></i>Business details (structured data)</div>
      <div class="fgrid fgrid3"><div class="fg"><label>Business type</label><select id="se-type"><option value="FinancialService">Financial service</option><option value="Organization">Organization</option><option value="LocalBusiness">Local business</option></select></div>
      ${inp('se-oname', 'Official name', '')}${inp('se-ologo', 'Logo URL (https, square)', 'https://…')}${inp('se-ophone', 'Phone', '+8801…')}${inp('se-oemail', 'Email', '')}${inp('se-oaddr', 'Street address', '')}${inp('se-ocity', 'City', 'Dhaka')}${inp('se-oarea', 'Area served', 'BD')}
      ${area('se-same', 'Official pages, one per line (Facebook, YouTube, LinkedIn …)', 'https://facebook.com/yourpage', 3)}${tog('se-ratings', 'Add the review rating to search data', 1)}</div>
      <div class="hint" style="margin-top:8px">Google uses this to understand your business. It may not show review stars for reviews collected on your own site — that is Google's rule.</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-circle-question"></i>FAQ (can appear in Google results) <span style="margin-left:auto;display:flex;gap:6px"><button class="btn btn-sm btn-s" onclick="faqSuggest()"><i class="fa-solid fa-wand-magic-sparkles"></i>Add suggested</button><button class="btn btn-sm btn-p" onclick="faqAdd()"><i class="fa-solid fa-plus"></i>Add</button></span></div>
      <div id="faqRows"></div>
    </div>
  </div>
  <div class="pro-pane" data-k="track">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-badge-check"></i>Site verification codes</div>
      <div class="fgrid">${inp('se-vg', 'Google Search Console (content of the meta tag)', 'e.g. AbC123…')}${inp('se-vb', 'Bing Webmaster', '')}${inp('se-vy', 'Yandex', '')}${inp('se-vf', 'Facebook domain verification', '')}</div>
      <div class="hint" style="margin-top:8px">In Search Console choose “HTML tag” and paste only the code inside content="…". Then submit <b>/sitemap.xml</b> there.</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-chart-simple"></i>Analytics</div>
      <div class="fgrid">${inp('se-ga', 'Google Analytics 4 ID', 'G-XXXXXXXXXX')}${inp('se-gtm', 'Google Tag Manager ID', 'GTM-XXXXXXX')}${inp('se-px', 'Facebook Pixel ID', '1234567890')}${inp('se-cl', 'Microsoft Clarity ID', 'abcd1234')}</div>
      <div id="anaCheck" class="pro-note" style="margin-top:8px"></div>
    </div>
  </div>
  <div class="pro-pane" data-k="robots">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-robot"></i>Search engine access</div>
      <div class="fgrid">${tog('se-index', 'Allow search engines to list the site', 1)}${area('se-robots', 'Extra robots.txt lines (advanced)', 'Disallow: /private', 3)}${area('se-smap', 'Extra pages for the sitemap, one URL per line', 'https://…/blog', 3)}</div>
      <div class="hint" style="margin-top:8px">The admin panel and the API are always kept out of search results.</div>
    </div>
  </div>
  <div class="pro-pane" data-k="reviews">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-star"></i>User reviews on the home page</div>
      <div class="fgrid fgrid3">${tog('rv-on', 'Show approved reviews on the home page', 1)}${inp('rv-title', 'Section title', 'What our users say')}${inp('rv-max', 'How many to show', '10', 'type="number" min="1" max="30"')}
      <div class="fg"><label>Show reviews with at least</label><select id="rv-min"><option value="1">1 star</option><option value="3">3 stars</option><option value="4">4 stars</option><option value="5">5 stars</option></select></div>
      ${tog('rv-ask', 'Ask users for a review after they receive a loan', 1)}${inp('rv-ask-t', 'Request text', '', 'full maxlength="160"')}</div>
      <div class="hint" style="margin-top:8px">Only users who received a loan can write one review each. Nothing appears until you approve it. Real reviews from real users build trust and help SEO.</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-inbox"></i>Reviews <select class="fsel ro-ok" id="rvFilter" data-nodirty="1" style="margin-left:auto" onchange="rvRender()"><option value="pending">Waiting for approval</option><option value="approved">Approved</option><option value="hidden">Hidden</option><option value="removed">Removed</option><option value="all">All</option></select></div>
      <div id="rvList"><div class="hint">Loading...</div></div>
    </div>
  </div>`;
  ['se-title', 'se-desc', 'se-url', 'se-ogt', 'se-ogd', 'se-ogi', 'se-name', 'se-ga', 'se-gtm', 'se-px', 'se-cl'].forEach(id => $p(id).addEventListener('input', seoScore));
}
function faqRender(){
  const L = _SEO.faq;
  $p('faqRows').innerHTML = L.length ? L.map((x, i) => `<div class="pro-row faq-row ${x.on === false ? 'off' : ''}"><label class="tog"><input type="checkbox" ${x.on !== false ? 'checked' : ''} data-nodirty="1" onchange="_SEO.faq[${i}].on=this.checked;markDirty('seo','faq');faqRender()"><span class="tog-sl"></span></label>
    <input value="${ep(x.q)}" placeholder="Question" data-nodirty="1" oninput="_SEO.faq[${i}].q=this.value;markDirty('seo','faq')"><textarea rows="2" placeholder="Answer" data-nodirty="1" oninput="_SEO.faq[${i}].a=this.value;markDirty('seo','faq')">${ep(x.a)}</textarea>
    <button class="ab ab-d" onclick="_SEO.faq.splice(${i},1);markDirty('seo','faq');faqRender()"><i class="fa-solid fa-trash"></i></button></div>`).join('') : '<div class="hint">No questions yet. “Add suggested” fills in common loan questions you can edit.</div>';
}
function faqAdd(){ _SEO.faq.push({ id: hid(), on: true, q: '', a: '' }); markDirty('seo', 'faq'); faqRender(); }
function faqSuggest(){ const have = new Set(_SEO.faq.map(x => x.q)); FAQ_SUGGEST.forEach(([q, a]) => { if(!have.has(q)) _SEO.faq.push({ id: hid(), on: true, q, a }); }); markDirty('seo', 'faq'); faqRender(); }
async function loadSeo(){
  buildSeo();
  const d = (await window._getDoc('siteConfig', 'seo')) || {};
  _SEO = { ...clone(SEO_DEF), ...d, org: { ...SEO_DEF.org, ...(d.org || {}) }, verify: { ...SEO_DEF.verify, ...(d.verify || {}) }, analytics: { ...SEO_DEF.analytics, ...(d.analytics || {}) }, reviews: { ...SEO_DEF.reviews, ...(d.reviews || {}) } };
  _SEO.faq = (Array.isArray(d.faq) ? d.faq : []).map(x => ({ id: hid(), on: true, ...x }));
  const S = _SEO;
  fillIn({ 'se-title': S.title, 'se-desc': S.description, 'se-kw': S.keywords, 'se-url': S.canonical || location.origin, 'se-name': S.siteName, 'se-locale': S.locale, 'se-author': S.author,
    'se-ogt': S.ogTitle, 'se-ogd': S.ogDescription, 'se-ogi': S.ogImage, 'se-tw': S.twitter, 'se-type': S.schemaType,
    'se-oname': S.org.name, 'se-ologo': S.org.logo, 'se-ophone': S.org.phone, 'se-oemail': S.org.email, 'se-oaddr': S.org.address, 'se-ocity': S.org.city, 'se-oarea': S.org.area || 'BD', 'se-same': (S.org.sameAs || []).join('\n'), 'se-ratings': S.ratings !== false,
    'se-vg': S.verify.google, 'se-vb': S.verify.bing, 'se-vy': S.verify.yandex, 'se-vf': S.verify.facebook, 'se-ga': S.analytics.ga4, 'se-gtm': S.analytics.gtm, 'se-px': S.analytics.pixel, 'se-cl': S.analytics.clarity,
    'se-index': S.index !== false, 'se-robots': S.robotsExtra, 'se-smap': (S.sitemapExtra || []).join('\n'),
    'rv-on': S.reviews.on !== false, 'rv-title': S.reviews.title, 'rv-max': S.reviews.max, 'rv-min': String(S.reviews.minStars || 1), 'rv-ask': S.reviews.ask !== false, 'rv-ask-t': S.reviews.askText });
  faqRender();
  proTabStart('seo', 'score');
  seoScore(); rvLoad(true);
  afterLoad('seo');
}
async function saveSeo(){
  const lines = id => val(id).split('\n').map(x => x.trim()).filter(Boolean);
  const url = val('se-url').replace(/\/+$/, '');
  if(url && !/^https?:\/\//i.test(url)) throw new Error('Site address must start with https://');
  const img = val('se-ogi'); if(img && !/^https:\/\//i.test(img)) throw new Error('Share image must be an https:// link');
  const data = { title: val('se-title') || SEO_DEF.title, description: val('se-desc') || SEO_DEF.description, keywords: val('se-kw'), canonical: url, siteName: val('se-name') || 'Creditfy', locale: val('se-locale') || 'en_BD', author: val('se-author'),
    ogTitle: val('se-ogt'), ogDescription: val('se-ogd'), ogImage: img, twitter: val('se-tw').replace(/^@/, ''), schemaType: val('se-type') || 'FinancialService',
    org: { name: val('se-oname'), logo: val('se-ologo'), phone: val('se-ophone'), email: val('se-oemail'), address: val('se-oaddr'), city: val('se-ocity'), area: val('se-oarea') || 'BD', country: 'BD', sameAs: lines('se-same').filter(x => /^https:\/\//i.test(x)) },
    ratings: chk('se-ratings'), faq: _SEO.faq.filter(x => String(x.q || '').trim() && String(x.a || '').trim()).map(x => ({ q: x.q.trim(), a: x.a.trim(), on: x.on !== false })),
    verify: { google: val('se-vg'), bing: val('se-vb'), yandex: val('se-vy'), facebook: val('se-vf') },
    analytics: { ga4: val('se-ga').toUpperCase(), gtm: val('se-gtm').toUpperCase(), pixel: val('se-px'), clarity: val('se-cl') },
    index: chk('se-index'), robotsExtra: val('se-robots'), sitemapExtra: lines('se-smap').filter(x => /^https?:\/\//i.test(x)),
    reviews: { on: chk('rv-on'), title: val('rv-title') || SEO_DEF.reviews.title, max: numv('rv-max', 10, 1, 30), minStars: Number(val('rv-min')) || 1, ask: chk('rv-ask'), askText: val('rv-ask-t') || SEO_DEF.reviews.askText },
    updatedAt: new Date().toISOString() };
  await window._setDoc('siteConfig', 'seo', data);
  await logAct('SEO settings saved', 'config', 'seo');
  seoScore();
}
function seoScore(){
  if(!$p('se-title')) return;
  const t = val('se-title'), d = val('se-desc'), url = val('se-url') || location.origin, img = val('se-ogi');
  $p('cntT').textContent = `${t.length} letters`; $p('cntT').className = 'cnt full' + (t.length < 30 || t.length > 65 ? ' bad' : '');
  $p('cntD').textContent = `${d.length} letters`; $p('cntD').className = 'cnt full' + (d.length < 70 || d.length > 165 ? ' bad' : '');
  const ck = [];
  const add = (w, ok, title, tip, warn) => ck.push({ w, ok, title, tip, warn });
  add(15, t.length >= 30 && t.length <= 65, 'Page title length', `${t.length} letters — aim for 50–60 and put your main keyword first.`);
  add(15, d.length >= 70 && d.length <= 165, 'Description length', `${d.length} letters — aim for 120–160 with a clear benefit and call to action.`);
  add(8, val('se-kw').split(',').filter(x => x.trim()).length >= 3, 'Keywords', 'Add at least 3 phrases people search for.');
  add(7, /^https:\/\//i.test(url), 'Site address uses https', 'Use your real https:// address.');
  add(12, /^https:\/\//i.test(img), 'Share image', 'Add a 1200×630 image so shares look professional.');
  add(10, !!val('se-vg'), 'Google Search Console connected', 'Paste the Google verification code, then submit the sitemap.');
  add(8, /^G-[A-Z0-9]{4,}$/i.test(val('se-ga')) || /^GTM-[A-Z0-9]{4,}$/i.test(val('se-gtm')), 'Analytics', 'Add a Google Analytics 4 ID to measure visitors.');
  add(10, _SEO.faq.filter(x => x.q && x.a && x.on !== false).length >= 3, 'FAQ (3 or more)', 'Answer common questions — they can appear directly in Google.');
  add(7, !!(val('se-oname') || val('se-name')) && !!(val('se-ophone') || val('se-oemail')), 'Business details', 'Add your official name and a phone or email.');
  add(8, (window._rvApproved || 0) >= 3, 'Approved user reviews (3 or more)', 'Approve real user reviews in “User Reviews”.');
  add(0, chk('se-index'), 'Search engines allowed', 'Listing is switched off — the site will not appear in Google.', true);
  const total = ck.reduce((a, c) => a + c.w, 0), got = ck.reduce((a, c) => a + (c.ok ? c.w : 0), 0);
  const pct = chk('se-index') ? Math.round(got / total * 100) : 0;
  $p('seoPct').textContent = pct; const ring = $p('seoRing'); ring.style.setProperty('--v', pct); ring.style.setProperty('--c', pct >= 80 ? 'var(--p)' : pct >= 50 ? 'var(--orange)' : 'var(--red)');
  $p('seoChecks').innerHTML = ck.map(c => `<div class="seo-ck"><i class="fa-solid ${c.ok ? 'fa-circle-check ok' : c.warn ? 'fa-triangle-exclamation bad' : 'fa-circle-xmark warn'}"></i><div><b>${c.title}</b>${c.ok ? '' : `<small>${c.tip}</small>`}</div></div>`).join('');
  const host = url.replace(/^https?:\/\//, '').replace(/\/.*/, '');
  $p('pvU').textContent = host + ' › '; $p('pvT').textContent = t.slice(0, 65) + (t.length > 65 ? '…' : ''); $p('pvD').textContent = d.slice(0, 160) + (d.length > 160 ? '…' : '');
  $p('pvDm').textContent = host; $p('pvOt').textContent = val('se-ogt') || t; $p('pvOd').textContent = (val('se-ogd') || d).slice(0, 110);
  const pi = $p('pvI'); if(/^https:\/\//i.test(img)){ pi.style.backgroundImage = `url("${img.replace(/"/g, '')}")`; pi.textContent = ''; } else { pi.style.backgroundImage = ''; pi.textContent = 'No share image'; }
  const bad = [['se-ga', /^G-[A-Z0-9]{4,}$/i, 'GA4 ID should look like G-XXXXXXX'], ['se-gtm', /^GTM-[A-Z0-9]{4,}$/i, 'GTM ID should look like GTM-XXXXXX'], ['se-px', /^\d{8,20}$/, 'Pixel ID is only digits'], ['se-cl', /^[a-z0-9]{6,14}$/i, 'Clarity ID is letters and digits']]
    .filter(([id, re]) => val(id) && !re.test(val(id))).map(x => x[2]);
  $p('anaCheck').innerHTML = bad.length ? `<span class="pro-bad"><i class="fa-solid fa-triangle-exclamation"></i> ${bad.join(' · ')} — wrong IDs are ignored.</span>` : '<span class="pro-ok"><i class="fa-solid fa-circle-check"></i> IDs look right.</span>';
}
// reviews (actions save at once, they are not part of the save bar)
let _RV = [];
async function rvLoad(quiet){
  _RV = await _get('reviews', 'createdAt');
  window._rvApproved = _RV.filter(r => r.status === 'approved' && !r.removed).length;
  const pend = _RV.filter(r => r.status === 'pending' && !r.removed).length;
  const b = $p('nb-rv'); if(b){ b.textContent = pend; b.style.display = pend ? '' : 'none'; }
  rvRender(); if(!quiet) seoScore();
}
function rvRender(){
  const f = $p('rvFilter')?.value || 'pending', el = $p('rvList'); if(!el) return;
  const L = _RV.filter(r => f === 'all' ? true : f === 'removed' ? r.removed : !r.removed && (r.status || 'pending') === f);
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  el.innerHTML = L.length ? L.map(r => `<div class="pro-row rv-row"><div><div><span class="rv-stars">${stars(Number(r.rating) || 0)}</span><span class="rv-st ${r.removed ? 'hidden' : r.status || 'pending'}">${r.removed ? 'removed' : r.status || 'pending'}</span>${r.featured ? '<span class="rv-st approved">featured</span>' : ''}</div>
    <div style="font-size:13px;margin:5px 0;line-height:1.5">${ep(r.text)}</div><div style="font-size:11px;color:var(--txt2)">${ep(r.name)} · 0${ep(r.uid)} · ${fd(r.createdAt)}</div></div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">${r.removed ? `<button class="btn btn-sm btn-s" onclick="rvSet('${r._id}',{removed:false})">Restore</button>` : `
      ${r.status !== 'approved' ? `<button class="btn btn-sm btn-p" onclick="rvSet('${r._id}',{status:'approved',approvedAt:new Date().toISOString()})"><i class="fa-solid fa-check"></i>Approve</button>` : `<button class="btn btn-sm btn-s" onclick="rvSet('${r._id}',{featured:${!r.featured}})"><i class="fa-solid fa-thumbtack"></i>${r.featured ? 'Unfeature' : 'Feature'}</button>`}
      ${r.status !== 'hidden' ? `<button class="btn btn-sm btn-s" onclick="rvSet('${r._id}',{status:'hidden'})"><i class="fa-solid fa-eye-slash"></i>Hide</button>` : ''}
      <button class="btn btn-sm btn-d" onclick="rvRemove('${r._id}')"><i class="fa-solid fa-trash"></i></button>`}</div></div>`).join('') : '<div class="hint">Nothing here.</div>';
}
async function rvSet(id, upd){ showL(true); try{ await window._updateDoc(id, 'reviews', upd); await logAct('Review updated: ' + Object.keys(upd).join(', '), 'config', id); toast('Saved ✓'); }catch(e){ toast(e.message, 'e'); } showL(false); rvLoad(); }
function rvRemove(id){ askRemove('Remove review', 'This user review.', () => rvSet(id, { removed: true, removedAt: new Date().toISOString() }), async () => { showL(true); try{ await window._deleteDoc(id, 'reviews'); toast('Deleted', 'e'); }catch(e){ toast(e.message, 'e'); } showL(false); rvLoad(); }); }
window._SAVERS.seo = { load: loadSeo, save: saveSeo, data: () => ({ 'Business & FAQ › FAQ': _SEO.faq }) };

/* ═════════ RISK CENTER (adminConfig/risk + riskReviews) ═════════ */
const RISK_DEF = { nid: { on: true }, payout: { on: true, min: 2 }, trx: { on: true }, rapid: { on: true, count: 3, hours: 24 }, refBurst: { on: true, count: 10, hours: 2 }, rejected: { on: true, min: 2 }, newBig: { on: true, days: 3, amount: 30000 } };
let _RK = clone(RISK_DEF), _RKA = [], _RKR = {};
function buildRisk(){
  const s = $p('sec-risk'); if(!s || s.dataset.built) return; s.dataset.built = 1;
  s.innerHTML = `<div class="sec-head"><h2>Risk Center</h2><div class="sec-head-r"><button class="btn btn-sm btn-s ro-ok" onclick="rkScan()"><i class="fa-solid fa-rotate-right"></i>Scan again</button>${svBtn('risk')}</div></div>${roBanner}
  <div class="stats" id="rkStats"></div>
  <details class="cfg-blk" id="rkCfg"><summary style="cursor:pointer;font-weight:800;font-size:13px"><i class="fa-solid fa-sliders" style="color:var(--p);margin-right:7px"></i>Alert rules &amp; limits</summary>
    <div class="fgrid fgrid3" style="margin-top:12px">
      ${tog('rk-nid', 'Same NID number on different accounts', 1)}
      ${tog('rk-payout', 'Same payout number on different accounts', 1)}${inp('rk-payout-min', '…when used by at least (accounts)', '2', 'type="number" min="2" max="20"')}
      ${tog('rk-trx', 'Same Transaction ID used more than once', 1)}
      ${tog('rk-rapid', 'Many applications in a short time', 1)}${inp('rk-rapid-n', 'Applications', '3', 'type="number" min="2" max="20"')}${inp('rk-rapid-h', 'Within hours', '24', 'type="number" min="1" max="720"')}
      ${tog('rk-ref', 'Invite burst (many sign-ups for one inviter)', 1)}${inp('rk-ref-n', 'Sign-ups', '10', 'type="number" min="3" max="200"')}${inp('rk-ref-h', 'Within hours', '2', 'type="number" min="1" max="72"')}
      ${tog('rk-rej', 'Several rejected payments', 1)}${inp('rk-rej-n', 'Rejected payments', '2', 'type="number" min="1" max="20"')}
      ${tog('rk-new', 'New account asking for a big loan', 1)}${inp('rk-new-d', 'Account younger than (days)', '3', 'type="number" min="1" max="60"')}${inp('rk-new-a', 'Loan of at least (৳)', '30000', 'type="number" min="0"')}
    </div>
  </details>
  <div class="tc"><div class="tc-hdr"><div class="tc-title">Alerts</div><div class="tc-r"><select class="fsel ro-ok" id="rkF" data-nodirty="1" onchange="rkRender()"><option value="open">Open</option><option value="reviewed">Reviewed</option><option value="all">All</option></select><select class="fsel ro-ok" id="rkS" data-nodirty="1" onchange="rkRender()"><option value="">All levels</option><option value="high">High</option><option value="med">Medium</option><option value="low">Low</option></select></div></div>
    <div id="rkList" style="padding:12px"><div class="hint">Scanning…</div></div></div>`;
}
async function loadRisk(){
  buildRisk();
  const d = (await window._getDoc('adminConfig', 'risk')) || {};
  _RK = clone(RISK_DEF); Object.keys(_RK).forEach(k => Object.assign(_RK[k], (d.rules || {})[k] || {}));
  const R = _RK;
  fillIn({ 'rk-nid': R.nid.on, 'rk-payout': R.payout.on, 'rk-payout-min': R.payout.min, 'rk-trx': R.trx.on, 'rk-rapid': R.rapid.on, 'rk-rapid-n': R.rapid.count, 'rk-rapid-h': R.rapid.hours,
    'rk-ref': R.refBurst.on, 'rk-ref-n': R.refBurst.count, 'rk-ref-h': R.refBurst.hours, 'rk-rej': R.rejected.on, 'rk-rej-n': R.rejected.min, 'rk-new': R.newBig.on, 'rk-new-d': R.newBig.days, 'rk-new-a': R.newBig.amount });
  afterLoad('risk');
  await rkScan();
}
async function saveRisk(){
  const rules = { nid: { on: chk('rk-nid') }, payout: { on: chk('rk-payout'), min: numv('rk-payout-min', 2, 2, 20) }, trx: { on: chk('rk-trx') },
    rapid: { on: chk('rk-rapid'), count: numv('rk-rapid-n', 3, 2, 20), hours: numv('rk-rapid-h', 24, 1, 720) }, refBurst: { on: chk('rk-ref'), count: numv('rk-ref-n', 10, 3, 200), hours: numv('rk-ref-h', 2, 1, 72) },
    rejected: { on: chk('rk-rej'), min: numv('rk-rej-n', 2, 1, 20) }, newBig: { on: chk('rk-new'), days: numv('rk-new-d', 3, 1, 60), amount: numv('rk-new-a', 30000, 0) } };
  await window._setDoc('adminConfig', 'risk', { rules, updatedAt: new Date().toISOString() });
  await logAct('Risk rules saved', 'config', 'risk');
  _RK = rules; rkScan();
}
const _num = v => Number(String(v ?? '').replace(/,/g, '')) || 0;
const _dig = v => String(v || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
async function rkScan(){
  const [users, apps, trx, rev] = await Promise.all([_get('users'), _get('applications', 'submittedAt'), _get('transactions', 'submittedAt'), _get('riskReviews', 'at')]);
  _RKR = {}; rev.forEach(r => { _RKR[r._id] = r; });
  const U = {}; users.forEach(u => { U[String(u.phone)] = u; });
  const A = apps.filter(a => !a.removed), T = trx.filter(t => !t.removed), R = _RK, out = [];
  const push = (rule, key, sev, title, detail, phones) => out.push({ id: (rule + '_' + key).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 120), rule, sev, title, detail, phones: [...new Set(phones.filter(Boolean))].slice(0, 12) });
  const group = (list, keyFn) => { const m = {}; list.forEach(x => { const k = keyFn(x); if(k) (m[k] = m[k] || []).push(x); }); return m; };
  if(R.nid.on) Object.entries(group(A, a => _dig(a.nid).length >= 8 ? _dig(a.nid) : '')).forEach(([k, l]) => { const ph = [...new Set(l.map(a => String(a.uid)))]; if(ph.length > 1) push('nid', k, 'high', `Same NID on ${ph.length} accounts`, `NID ${k} was used by different phone numbers. One person may be using several accounts.`, ph); });
  if(R.payout.on) Object.entries(group(A, a => _dig(a.bankPhone).length === 10 ? _dig(a.bankPhone) : '')).forEach(([k, l]) => { const ph = [...new Set(l.map(a => String(a.uid)))]; if(ph.length >= R.payout.min) push('payout', k, 'med', `Payout number shared by ${ph.length} accounts`, `Loans of different accounts would be sent to 0${k}.`, ph); });
  if(R.trx.on) Object.entries(group(T, t => { const k = String(t.trxId || '').toUpperCase(); return k && k !== 'BALANCE_PAYMENT' ? k : ''; })).forEach(([k, l]) => { if(l.length > 1) push('trx', k, 'high', `Transaction ID used ${l.length} times`, `TrxID ${k} was submitted more than once${new Set(l.map(t => t.uid)).size > 1 ? ' by different accounts' : ''}.`, l.map(t => String(t.uid))); });
  if(R.rapid.on) Object.entries(group(A, a => String(a.uid || ''))).forEach(([ph, l]) => { const ts = l.map(a => new Date(a.submittedAt || 0).getTime()).filter(Boolean).sort((a, b) => a - b); for(let i = 0; i + R.rapid.count - 1 < ts.length; i++){ if(ts[i + R.rapid.count - 1] - ts[i] <= R.rapid.hours * 36e5){ push('rapid', ph, 'med', `${R.rapid.count}+ applications within ${R.rapid.hours} h`, `0${ph} applied ${l.length} times in total.`, [ph]); break; } } });
  if(R.refBurst.on) Object.entries(group(users, u => String(u.referredBy || ''))).forEach(([ref, l]) => { const ts = l.map(u => new Date(u.createdAt || 0).getTime()).filter(Boolean).sort((a, b) => a - b); for(let i = 0; i + R.refBurst.count - 1 < ts.length; i++){ if(ts[i + R.refBurst.count - 1] - ts[i] <= R.refBurst.hours * 36e5){ push('ref', ref, 'med', `Invite burst: ${R.refBurst.count}+ sign-ups in ${R.refBurst.hours} h`, `Many accounts joined with 0${ref}'s link very quickly — they may be fake accounts made for rewards.`, [ref, ...l.slice(0, 8).map(u => String(u.phone))]); break; } } });
  if(R.rejected.on) Object.entries(group(T.filter(t => t.status === 'Rejected'), t => String(t.uid || ''))).forEach(([ph, l]) => { if(l.length >= R.rejected.min) push('rej', ph, 'med', `${l.length} rejected payments`, `0${ph} sent Transaction IDs that could not be verified ${l.length} times.`, [ph]); });
  if(R.newBig.on) A.forEach(a => { const u = U[String(a.uid)]; if(!u || !u.createdAt || !a.submittedAt) return; const age = (new Date(a.submittedAt) - new Date(u.createdAt)) / 864e5; if(age >= 0 && age <= R.newBig.days && _num(a.loanAmount) >= R.newBig.amount) push('new', a._id, 'low', `New account, big loan (৳${fa(a.loanAmount)})`, `Account was ${Math.max(0, Math.round(age))} day(s) old when CU-${String(a._id).slice(-6).toUpperCase()} was submitted.`, [String(a.uid)]); });
  const rank = { high: 0, med: 1, low: 2 };
  _RKA = out.sort((a, b) => rank[a.sev] - rank[b.sev]);
  rkRender();
}
function rkRender(){
  const open = _RKA.filter(a => !_RKR[a.id] || _RKR[a.id].status !== 'reviewed');
  const n = s => open.filter(a => a.sev === s).length;
  $p('rkStats').innerHTML = [['triangle-exclamation', 'rd', n('high'), 'High'], ['circle-exclamation', 'or', n('med'), 'Medium'], ['circle-info', 'bl', n('low'), 'Low'], ['circle-check', 'gn', _RKA.length - open.length, 'Reviewed']]
    .map(([ic, cl, v, l]) => `<div class="sc ${cl}"><div class="sc-ic ic-${cl}"><i class="fa-solid fa-${ic}"></i></div><div class="sc-val">${v}</div><div class="sc-lbl">${l}</div></div>`).join('');
  const b = $p('nb-risk'); const hm = n('high') + n('med'); if(b){ b.textContent = hm; b.style.display = hm ? '' : 'none'; }
  const f = $p('rkF').value, sv = $p('rkS').value;
  const L = _RKA.filter(a => (f === 'all' || (f === 'open') === !(_RKR[a.id] && _RKR[a.id].status === 'reviewed')) && (!sv || a.sev === sv));
  const ic = { nid: 'id-card', payout: 'wallet', trx: 'receipt', rapid: 'bolt', ref: 'user-plus', rej: 'ban', new: 'user-clock' };
  $p('rkList').innerHTML = L.length ? L.map(a => { const r = _RKR[a.id], done = r && r.status === 'reviewed'; return `<div class="rk-card ${a.sev} ${done ? 'done' : ''}"><div class="rk-ic"><i class="fa-solid fa-${ic[a.rule] || 'flag'}"></i></div>
    <div class="rk-m"><b>${ep(a.title)}</b><p>${ep(a.detail)}${done ? `<br><span class="pro-ok"><i class="fa-solid fa-circle-check"></i> Reviewed ${fd(r.at)}${r.note ? ' — ' + ep(r.note) : ''}</span>` : ''}</p>
    <div class="rk-ppl">${a.phones.map(p => `<a onclick="rkUser('${ep(p)}')" title="Open user">0${ep(p)}</a>`).join('')}</div></div>
    <div class="rk-acts">${done ? `<button class="btn btn-sm btn-s" onclick="rkMark('${a.id}',false)">Reopen</button>` : `<button class="btn btn-sm btn-p" onclick="rkMark('${a.id}',true)"><i class="fa-solid fa-check"></i>Reviewed</button><button class="btn btn-sm btn-d" onclick="rkBan('${a.id}')"><i class="fa-solid fa-ban"></i>Ban</button>`}</div></div>`; }).join('')
    : `<div class="hint" style="text-align:center;padding:20px">${_RKA.length ? 'Nothing in this view.' : '<i class="fa-solid fa-shield-halved" style="color:var(--p)"></i> No risks found. 🎉'}</div>`;
}
async function rkMark(id, done){
  const note = done ? (prompt('Note (optional): what did you check or decide?') ?? null) : '';
  if(note === null) return;
  showL(true);
  try{ await window._setDoc('riskReviews', id, { status: done ? 'reviewed' : 'open', note: String(note || '').slice(0, 200), at: new Date().toISOString(), by: (window._adminData || {}).email || '' }); await logAct(`Risk alert ${done ? 'reviewed' : 'reopened'}: ${id}`, 'user', id); }
  catch(e){ toast(e.message, 'e'); }
  showL(false); await rkScan();
}
function rkBan(id){
  const a = _RKA.find(x => x.id === id); if(!a) return;
  confirm2(`Ban ${a.phones.length} account(s): ${a.phones.map(p => '0' + p).join(', ')}? They will not be able to use the site.`, async () => {
    showL(true);
    const users = await _get('users');
    for(const p of a.phones){ const u = users.find(x => String(x.phone) === p); if(u) await window._updateDoc(u._id, 'users', { status: 'banned', statusLog: [...(u.statusLog || []), { status: 'banned', action: 'Risk Center', reason: a.title, at: new Date().toISOString() }] }); }
    await window._setDoc('riskReviews', id, { status: 'reviewed', note: 'Accounts banned', at: new Date().toISOString(), by: (window._adminData || {}).email || '' });
    await logAct(`Risk Center: banned ${a.phones.length} account(s) — ${a.title}`, 'user', id);
    showL(false); toast('Accounts banned', 'e'); rkScan();
  });
}
async function rkUser(phone){
  gS('users', $p('n-users'));
  setTimeout(() => { const u = (_D.users || []).find(x => String(x.phone) === phone); if(u) viewUser(u._id); else toast('User not found', 'w'); }, 900);
}
window._SAVERS.risk = { load: loadRisk, save: saveRisk };

/* ═════════ TEAM & ROLES (admins + adminConfig/roles) ═════════ */
const P_SECS = [['dashboard', 'Dashboard'], ['users', 'Users'], ['applications', 'Applications'], ['transactions', 'Transactions'], ['portfolio', 'Loan Portfolio'], ['analytics', 'Analytics'], ['wallets', 'Wallets'],
  ['config', 'Site Config'], ['home', 'Home Page'], ['appset', 'App Settings'], ['seo', 'SEO & Reviews'], ['broadcast', 'Broadcast'], ['support', 'Support'], ['risk', 'Risk Center'], ['actlog', 'Activity Log']];
const allP = v => Object.fromEntries(P_SECS.map(([k]) => [k, v]));
const ROLE_DEF = {
  manager: { label: 'Manager', perms: allP('edit') },
  verifier: { label: 'Payment Verifier', perms: { ...allP('none'), dashboard: 'view', users: 'view', applications: 'edit', transactions: 'edit', portfolio: 'view', risk: 'view', support: 'view' } },
  support: { label: 'Support Agent', perms: { ...allP('none'), dashboard: 'view', users: 'view', applications: 'view', transactions: 'view', support: 'edit', broadcast: 'edit' } },
  viewer: { label: 'Viewer', perms: allP('view') }
};
let _ROLES = clone(ROLE_DEF), _TEAM = [], _CANTEAM = false;
function buildTeam(){
  const w = $p('teamWrap'); if(!w || w.dataset.built) return; w.dataset.built = 1;
  w.innerHTML = `<div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-users-gear"></i>Team members</div>
      <div id="tmList"><div class="hint">Loading…</div></div>
      <div id="tmAdd"></div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-key"></i>Roles &amp; permissions <button class="btn btn-sm btn-p" id="rlAddBtn" style="margin-left:auto" onclick="rlAdd()"><i class="fa-solid fa-plus"></i>Add role</button></div>
      <div class="hint" style="margin:-4px 0 10px"><b>Super Admin</b> can do everything and manage the team. <b>Admin</b> can do everything except the team. Other roles get exactly what you choose here: <b>Edit</b>, <b>View</b> only, or <b>Hidden</b>.</div>
      <div class="pm-wrap" id="rlMatrix"></div>
      <div class="hint" style="margin-top:8px">Permissions are enforced by the database rules too — publish the updated <b>firestore.rules</b> in Firebase once.</div></div>`;
}
function rlRender(){
  const keys = Object.keys(_ROLES);
  $p('rlMatrix').innerHTML = `<table class="pm"><thead><tr><th>Section</th>${keys.map(k => `<th><input id="rl-${k}" value="${ep(_ROLES[k].label)}" maxlength="24" style="width:120px;height:28px;border-radius:7px;background:rgba(255,255,255,.04);border:1.5px solid var(--border);color:var(--txt);padding:0 7px;font-family:inherit" ${_CANTEAM ? '' : 'disabled'}>${_CANTEAM ? ` <button class="ab ab-d" title="Delete role" onclick="rlDel('${k}')"><i class="fa-solid fa-trash"></i></button>` : ''}</th>`).join('')}</tr></thead>
  <tbody>${P_SECS.map(([s, name]) => `<tr><td>${name}</td>${keys.map(k => { const v = (_ROLES[k].perms || {})[s] || 'none'; return `<td><select id="rp-${k}-${s}" class="v-${v}" onchange="this.className='v-'+this.value" ${_CANTEAM ? '' : 'disabled'}><option value="edit" ${v === 'edit' ? 'selected' : ''}>Edit</option><option value="view" ${v === 'view' ? 'selected' : ''}>View</option><option value="none" ${v === 'none' ? 'selected' : ''}>Hidden</option></select></td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
  $p('rlAddBtn').style.display = _CANTEAM ? '' : 'none';
}
function rlAdd(){
  const label = (prompt('Name of the new role (e.g. Loan Officer)') || '').trim(); if(!label) return;
  const key = label.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'role' + hid();
  if(_ROLES[key] || ['superadmin', 'admin', 'owner'].includes(key)){ toast('A role with this name exists', 'w'); return; }
  rlReadInputs(); _ROLES[key] = { label, perms: allP('none') }; markDirty('settings', 'roles'); rlRender();
}
function rlDel(k){
  const used = _TEAM.filter(m => String(m.role).toLowerCase() === k).length;
  confirm2(used ? `${used} member(s) have this role and will lose access until you give them another role. Delete “${_ROLES[k].label}”?` : `Delete the role “${_ROLES[k].label}”?`, () => { rlReadInputs(); delete _ROLES[k]; markDirty('settings', 'roles'); rlRender(); });
}
function rlReadInputs(){ Object.keys(_ROLES).forEach(k => { const l = $p('rl-' + k); if(l) _ROLES[k].label = l.value.trim() || _ROLES[k].label; P_SECS.forEach(([s]) => { const e = $p(`rp-${k}-${s}`); if(e) _ROLES[k].perms[s] = e.value; }); }); }
const roleName = r => { const k = String(r || '').toLowerCase().replace(/[\s_-]/g, ''); return !k || k === 'owner' ? 'Owner (full)' : k === 'superadmin' ? 'Super Admin' : k === 'admin' ? 'Admin' : (_ROLES[k] ? _ROLES[k].label : r); };
async function tmLoad(){
  const r = await window._accountApi('adminTeam', { op: 'list' });
  if(!r.ok){ $p('tmList').innerHTML = `<div class="hint pro-bad">${ep(r.data.error || 'Could not load the team (the account service must be set up).')}</div>`; return; }
  _TEAM = r.data.list || []; _CANTEAM = !!r.data.canTeam;
  const opts = cur => [['superadmin', 'Super Admin'], ['admin', 'Admin'], ...Object.entries(_ROLES).map(([k, v]) => [k, v.label])].map(([k, l]) => `<option value="${k}" ${String(cur || '').toLowerCase().replace(/[\s_-]/g, '') === k ? 'selected' : ''}>${ep(l)}</option>`).join('');
  $p('tmList').innerHTML = _TEAM.map(m => `<div class="tm-row"><div><b style="font-size:13px">${ep(m.name || m.email.split('@')[0])}</b>${m.me ? ' <span class="wbadge">YOU</span>' : ''}${m.disabled ? ' <span class="rm-tag">BLOCKED</span>' : ''}<div style="font-size:11px;color:var(--txt2)">${ep(m.email)}</div></div>
    <div style="font-size:11px;color:var(--txt2)">Last sign-in<br><b style="color:var(--txt)">${m.lastSignIn ? fd(m.lastSignIn) : 'never'}</b></div>
    ${_CANTEAM && !m.me ? `<select onchange="tmSet('${m.uid}',{role:this.value})" data-nodirty="1">${m.role ? '' : '<option value="" selected>Owner (full)</option>'}${opts(m.role)}</select>` : `<div style="font-size:12px;font-weight:800">${ep(roleName(m.role))}</div>`}
    <div style="display:flex;gap:4px">${_CANTEAM && !m.me ? `<button class="ab ab-v" title="Set password" onclick="tmPw('${m.uid}')"><i class="fa-solid fa-key"></i></button><button class="ab ${m.disabled ? 'ab-ok' : 'ab-s'}" title="${m.disabled ? 'Unblock' : 'Block'}" onclick="tmSet('${m.uid}',{disabled:${!m.disabled}})"><i class="fa-solid fa-${m.disabled ? 'unlock' : 'lock'}"></i></button><button class="ab ab-d" title="Remove" onclick="tmDel('${m.uid}')"><i class="fa-solid fa-user-minus"></i></button>` : ''}</div></div>`).join('') || '<div class="hint">No admins found.</div>';
  $p('tmAdd').innerHTML = _CANTEAM ? `<div class="man-sub">Add a team member</div><div class="fgrid fgrid3">
    <div class="fg"><label>Name</label><input id="tmN" data-nodirty="1" maxlength="60"></div><div class="fg"><label>E-mail (login)</label><input id="tmE" data-nodirty="1" type="email"></div>
    <div class="fg"><label>Password</label><div style="display:flex;gap:6px"><input id="tmP" data-nodirty="1" style="flex:1;min-width:0"><button class="btn btn-sm btn-s" type="button" onclick="$p('tmP').value=genPw()+genPw().slice(0,3)"><i class="fa-solid fa-dice"></i></button></div></div>
    <div class="fg"><label>Role</label><select id="tmR" data-nodirty="1">${opts('admin')}</select></div>
    <div class="fg"><label>&nbsp;</label><button class="btn btn-p" onclick="tmCreate()"><i class="fa-solid fa-user-plus"></i>Add member</button></div></div>
    <div class="hint">They sign in to this panel with the e-mail and password. Send them the details privately.</div>`
    : '<div class="hint" style="margin-top:8px"><i class="fa-solid fa-lock"></i> Only a Super Admin can add or change team members.</div>';
  rlRender();
}
async function tmCreate(){
  const b = { op: 'create', name: val('tmN'), email: val('tmE'), password: val('tmP'), role: val('tmR') };
  if(!b.email || b.password.length < 8){ toast('E-mail and a password of 8+ characters are needed', 'w'); return; }
  showL(true); const r = await window._accountApi('adminTeam', b); showL(false);
  if(!r.ok){ toast(r.data.error || 'Could not add', 'e'); return; }
  await logAct(`Team member added: ${b.email} (${roleName(b.role)})`, 'user', r.data.uid);
  toast('Member added ✓'); tmLoad();
}
async function tmSet(uid, upd){
  showL(true); const r = await window._accountApi('adminTeam', { op: 'update', uid, ...upd }); showL(false);
  if(!r.ok){ toast(r.data.error || 'Could not save', 'e'); tmLoad(); return; }
  await logAct('Team member updated: ' + Object.keys(upd).join(', '), 'user', uid); toast('Saved ✓'); tmLoad();
}
async function tmPw(uid){
  const pw = prompt('New password (at least 8 characters)'); if(!pw) return;
  showL(true); const r = await window._accountApi('adminTeam', { op: 'password', uid, password: pw }); showL(false);
  toast(r.ok ? 'Password changed ✓' : (r.data.error || 'Failed'), r.ok ? 's' : 'e');
}
function tmDel(uid){
  const m = _TEAM.find(x => x.uid === uid);
  confirm2(`Remove ${m ? m.email : 'this admin'} from the team? Their login is blocked.`, async () => {
    showL(true); const r = await window._accountApi('adminTeam', { op: 'remove', uid }); showL(false);
    if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; }
    await logAct('Team member removed', 'user', uid); toast('Removed', 'e'); tmLoad();
  });
}
async function loadTeam(){
  buildTeam();
  const d = (await window._getDoc('adminConfig', 'roles')) || {};
  _ROLES = d.roles && Object.keys(d.roles).length ? clone(d.roles) : clone(ROLE_DEF);
  Object.values(_ROLES).forEach(r => { r.perms = { ...allP('none'), ...(r.perms || {}) }; });
  await tmLoad();
  afterLoad('settings');
}
async function saveTeam(){
  if(!_CANTEAM) throw new Error('Only a Super Admin can change roles');
  rlReadInputs();
  await window._setDoc('adminConfig', 'roles', { updatedAt: new Date().toISOString() });
  // update() replaces the whole "roles" map, so deleted roles are really gone
  await window._updateDoc('roles', 'adminConfig', { roles: _ROLES });
  await logAct('Admin roles saved', 'config', 'roles');
}
window._SAVERS.settings = { load: loadTeam, save: saveTeam, data: () => ({ 'Roles': Object.keys(_ROLES) }) };

/* ═════════ PERMISSIONS for the signed-in admin ═════════ */
async function applyPerms(){
  const d = window._adminData || {};
  const r = String(d.role || '').toLowerCase().replace(/[\s_-]/g, '');
  window._isFull = !r || ['superadmin', 'admin', 'owner'].includes(r);
  window._perm = {};
  if(window._isFull) return;
  const rd = await window._getDoc('adminConfig', 'roles');
  const perms = (rd && rd.roles && rd.roles[r] && rd.roles[r].perms) || (ROLE_DEF[r] && ROLE_DEF[r].perms) || {};
  P_SECS.forEach(([k]) => { const p = perms[k] || 'none'; window._perm[k] = p; const n = $p('n-' + k); if(n) n.style.display = p === 'none' ? 'none' : ''; });
  // quick actions on the dashboard follow the same rules
  document.querySelectorAll('.qa[onclick]').forEach(q => { const m = /gS\('([a-z]+)'/.exec(q.getAttribute('onclick')); if(m && window._perm[m[1]] === 'none') q.style.display = 'none'; });
  if(window._perm[_sec] === 'none'){ const first = P_SECS.find(([k]) => window._perm[k] !== 'none'); gS(first ? first[0] : 'settings', $p('n-' + (first ? first[0] : 'settings'))); }
  else document.getElementById('sec-' + _sec)?.classList.toggle('ro', window._perm[_sec] === 'view');
}
const _gS0 = gS;
gS = function(id, el){
  const p = (window._perm || {})[id];
  if(p === 'none' && id !== 'settings'){ toast('Your role cannot open this page', 'w'); return; }
  _gS0(id, el);
  document.getElementById('sec-' + id)?.classList.toggle('ro', p === 'view');
  if(id === 'broadcast') window._getDoc('siteConfig', 'app').then(d => { const c = $p('bc-push'); const P = (d && d.push) || {}; if(c) c.checked = P.on !== false && (P.auto || {}).broadcast !== false; }).catch(() => {});
};
const _loginOK0 = loginOK;
// after login: apply the role, then fill the Risk Center and Reviews counters on the menu
loginOK = function(){ _loginOK0(); applyPerms().then(() => setTimeout(() => { try{ if((window._perm || {}).risk !== 'none') { buildRisk(); loadRiskQuiet(); } }catch(e){} }, 2500)); };
async function loadRiskQuiet(){
  const d = (await window._getDoc('adminConfig', 'risk')) || {}; _RK = clone(RISK_DEF); Object.keys(_RK).forEach(k => Object.assign(_RK[k], (d.rules || {})[k] || {}));
  await rkScan();
  if((window._perm || {}).seo !== 'none'){ buildSeo(); rvLoad(true); }
}
