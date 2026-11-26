/* Creditfy — loan tools in Quick Services: My Loans (tracker), Pay Installment, Early Payoff, Loan Limit, Trust Level,
   Statement (PDF), Budget Planner and EMI Compare. The server works out every amount (/api/account → myLoans, payLoan).
   Settings: Admin → Services & Rewards → Loan tools. Needs services.js (the sheet, tiles and helpers). */
(function(){
if(!window._svShow){ console.warn('loans.js needs services.js'); return; }
const show = window._svShow, api = window._svApi, toast = window._svToast, E = window._svE, tk = window._svTk;
const $l = id => document.getElementById(id);
const user = () => { try { return JSON.parse(localStorage.getItem('creditUpUser')); } catch (e) { return null; } };
const fdate = t => { try { return t ? new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; } catch (e) { return '—'; } };
const loading = '<div class="sv-empty"><i class="fa-solid fa-circle-notch fa-spin"></i>Loading…</div>';
const num = v => Number(String(v ?? '').replace(/,/g, '')) || 0;

/* ───────── styles ───────── */
const css = `
.ln-card{border-radius:20px;padding:16px;margin-bottom:12px;background:linear-gradient(160deg,var(--surf),var(--bg2));border:1px solid var(--bord);position:relative;overflow:hidden}
.ln-card.live{border-color:rgba(29,219,128,.35)}.ln-card.late{border-color:rgba(255,77,106,.55);background:linear-gradient(160deg,rgba(255,77,106,.08),var(--bg2))}
.ln-top{display:flex;align-items:center;gap:10px}.ln-top b{font-size:20px;color:var(--txt);font-weight:900}.ln-top small{display:block;font-size:11px;color:var(--txt2)}
.ln-st{margin-left:auto;font-size:10.5px;font-weight:900;padding:4px 9px;border-radius:9px;background:rgba(255,255,255,.07);color:var(--txt2)}
.ln-st.ok{background:rgba(29,219,128,.14);color:var(--p)}.ln-st.bad{background:rgba(255,77,106,.15);color:var(--red)}.ln-st.wait{background:rgba(255,140,66,.15);color:var(--orange)}.ln-st.done{background:rgba(168,85,247,.15);color:#c085ff}
.ln-bar{height:10px;border-radius:8px;background:rgba(255,255,255,.07);overflow:hidden;margin:14px 0 6px}
.ln-bar i{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,var(--p),#7dffc0);transition:width .8s}
.ln-meta{display:flex;justify-content:space-between;font-size:11.5px;color:var(--txt2)}.ln-meta b{color:var(--txt)}
.ln-next{display:flex;align-items:center;gap:10px;margin-top:12px;padding:11px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid var(--bord)}
.ln-next .ic{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:rgba(29,219,128,.12);color:var(--p);flex:none}
.ln-next.late .ic{background:rgba(255,77,106,.15);color:var(--red)}
.ln-next b{display:block;font-size:14px;color:var(--txt)}.ln-next small{font-size:11px;color:var(--txt2)}
.ln-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.ln-acts button{border-radius:12px;padding:11px;font-size:12.5px;font-weight:800;font-family:inherit;cursor:pointer;border:1px solid var(--gbord);background:var(--glass);color:var(--txt)}
.ln-acts button.p{background:linear-gradient(135deg,var(--p),var(--p2));color:#03210f;border:0}
.ln-sch{margin-top:10px;display:none}.ln-card.open .ln-sch{display:block}
.ln-sch div{display:flex;justify-content:space-between;font-size:12px;padding:7px 0;border-bottom:1px dashed var(--bord);color:var(--txt2)}
.ln-sch div.done{color:var(--p)}.ln-sch div.late{color:var(--red)}
.ln-more{font-size:11.5px;color:var(--txt2);text-align:center;margin-top:8px;cursor:pointer}
.ln-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.ln-sum div{border-radius:14px;padding:11px 6px;text-align:center;background:rgba(255,255,255,.035);border:1px solid var(--bord)}
.ln-sum b{display:block;font-size:15px;color:var(--txt)}.ln-sum span{font-size:10.5px;color:var(--txt2)}
.cnt-sel{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 4px}
.cnt-sel button{flex:1;min-width:64px;border-radius:12px;padding:10px 4px;border:1.5px solid var(--gbord);background:var(--glass);color:var(--txt);font-weight:800;font-family:inherit;cursor:pointer;font-size:12px}
.cnt-sel button.on{border-color:var(--p);background:rgba(29,219,128,.12);color:var(--p)}
.ring{--v:0;width:150px;height:150px;border-radius:50%;margin:6px auto 12px;display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative;background:conic-gradient(var(--c,var(--p)) calc(var(--v)*1%),rgba(255,255,255,.07) 0)}
.ring::before{content:"";position:absolute;inset:12px;border-radius:50%;background:var(--bg)}
.ring b,.ring span{position:relative}.ring b{font-size:34px;font-weight:900;color:var(--txt)}.ring span{font-size:11.5px;color:var(--txt2);font-weight:700}
.tr-lv{display:flex;gap:6px;margin:6px 0 14px}.tr-lv div{flex:1;text-align:center;border-radius:12px;padding:8px 2px;font-size:10.5px;font-weight:800;color:var(--txt2);background:rgba(255,255,255,.035);border:1px solid var(--bord)}
.tr-lv div.on{color:#111;border:0}
.tr-it{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--bord);font-size:13px;color:var(--txt)}
.tr-it i{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex:none;font-size:12px}
.tr-it .ok{background:rgba(29,219,128,.15);color:var(--p)}.tr-it .no{background:rgba(255,255,255,.06);color:var(--txt3)}
.tr-it small{display:block;font-size:11px;color:var(--txt2)}.tr-it em{margin-left:auto;font-style:normal;font-weight:900;font-size:12px;color:var(--txt2)}
.lm-hero{border-radius:22px;padding:20px;text-align:center;background:radial-gradient(130% 120% at 50% 0%,rgba(77,143,255,.28),rgba(6,13,26,0) 70%),var(--surf);border:1px solid rgba(77,143,255,.35);margin-bottom:14px}
.lm-hero small{color:#a9c6ff;font-size:12px;font-weight:700}.lm-hero b{display:block;font-size:36px;font-weight:900;color:#fff;margin:4px 0}
.cmp{width:100%;border-collapse:separate;border-spacing:0 7px;font-size:12.5px}
.cmp th{font-size:10.5px;color:var(--txt2);text-transform:uppercase;letter-spacing:.4px;text-align:right;padding:0 6px;font-weight:800}.cmp th:first-child{text-align:left}
.cmp td{background:rgba(255,255,255,.035);padding:11px 6px;text-align:right;color:var(--txt);font-weight:700}.cmp td:first-child{text-align:left;border-radius:12px 0 0 12px;font-weight:900}.cmp td:last-child{border-radius:0 12px 12px 0}
.cmp tr.best td{background:rgba(29,219,128,.1)}
.sv-range{width:100%;accent-color:var(--p);margin:8px 0}
.bd-res{border-radius:18px;padding:16px;margin-top:12px;background:linear-gradient(160deg,rgba(29,219,128,.12),var(--bg2));border:1px solid rgba(29,219,128,.35)}
.bd-res.bad{background:linear-gradient(160deg,rgba(255,77,106,.1),var(--bg2));border-color:rgba(255,77,106,.4)}
.bd-res b{font-size:24px;color:var(--txt)}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
try { if(typeof BN === 'object') Object.assign(BN, { 'My Loans': 'আমার লোন', 'Pay Installment': 'কিস্তি পরিশোধ', 'Early Payoff': 'আগাম পরিশোধ', 'Loan Limit': 'লোন সীমা',
  'Trust Level': 'ট্রাস্ট লেভেল', 'Statement': 'স্টেটমেন্ট', 'Budget Planner': 'বাজেট প্ল্যানার', 'EMI Compare': 'কিস্তি তুলনা', 'Next installment': 'পরের কিস্তি', 'Paid': 'পরিশোধিত',
  'Remaining': 'বাকি', 'Download statement': 'স্টেটমেন্ট ডাউনলোড', 'Pay now': 'এখনই পরিশোধ', 'Show schedule': 'কিস্তির তালিকা' }); } catch (e) {}

/* ───────── shared numbers ───────── */
let LN = null, LNp = null;
const cfgL = () => (window._svCfg() || {}).loans || {};
function loadLoans(force){ if(!user()) return Promise.resolve(null); if(!LNp || force) LNp = api('myLoans').then(r => (LN = r.ok ? r.data : null)).catch(() => null); return LNp; }
// the monthly installment by the admin's rule (also used by the calculator and Loan Details)
window._svcEmi = function(amount, months){
  amount = num(amount); months = Math.max(1, Number(months) || 1);
  const L = cfgL(), rate = (typeof ADMIN === 'object' ? Number(ADMIN.annualRate) : 18) || 0, r = rate / 100 / 12;
  if(L.emiMode === 'amortized' && r > 0) return Math.round(amount * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
  if(L.emiMode === 'flat') return Math.ceil((amount + Math.round(amount * rate / 100 * months / 12)) / months);
  return Math.ceil(amount / months);
};
// the personal loan limit, when the admin enforces it
window._limitCheck = function(v){
  const lim = LN && LN.limit; if(!lim || !lim.on || !lim.enforce) return true;
  const n = num(v); if(n <= lim.limit) return true;
  if(window.showAlert) showAlert('Above your limit', `Your current loan limit is ${tk(lim.limit)}. Repay on time, verify your number or join VIP to raise it.`, 'info');
  return false;
};
function fee(amount, months){ try { return typeof _feeBreak === 'function' ? _feeBreak(amount, months).total : 0; } catch (e) { return 0; } }
function terms(){ try { const t = (typeof OPTS === 'object' && OPTS.term || []).map(Number).filter(v => v > 0); return t.length ? [...new Set(t)].sort((a, b) => a - b) : [3, 6, 9, 12]; } catch (e) { return [3, 6, 9, 12]; } }
function maxBorrow(){ return Number(window._maxBorrow) || 60000; }
const STATUS = { 'Pending Fee Payment': ['Fee pending', 'wait'], 'TrxID Submitted': ['Fee submitted', 'wait'], 'Fee Verified': ['Under review', 'wait'], 'Under Review': ['Under review', 'wait'], 'Approved': ['Approved', 'ok'],
  'Disbursed': ['Active', 'ok'], 'Active': ['Active', 'ok'], 'Overdue': ['Overdue', 'bad'], 'Repaid': ['Repaid', 'done'], 'Rejected': ['Not approved', 'bad'] };

/* ───────── tiles ───────── */
Object.assign(window._svcTiles, {
  loans:     { l: 'My Loans', ic: 'file-invoice-dollar', g: 'g-green', cat: 'loans', login: true, page: 'loans' },
  repay:     { l: 'Pay Installment', ic: 'money-bill-transfer', g: 'g-blue', cat: 'loans', login: true, page: 'repay' },
  payoff:    { l: 'Early Payoff', ic: 'flag-checkered', g: 'g-purple', cat: 'loans', login: true, page: 'payoff' },
  limit:     { l: 'Loan Limit', ic: 'arrow-trend-up', g: 'g-cyan', cat: 'loans', login: true, page: 'limit' },
  trust:     { l: 'Trust Level', ic: 'shield-heart', g: 'g-gold', cat: 'loans', login: true, page: 'trust' },
  statement: { l: 'Statement', ic: 'file-pdf', g: 'g-red', cat: 'loans', login: true, page: 'statement' },
  budget:    { l: 'Budget Planner', ic: 'scale-balanced', g: 'g-teal', cat: 'loans', page: 'budget' },
  compare:   { l: 'EMI Compare', ic: 'table-columns', g: 'g-orange', cat: 'loans', page: 'compare' }
});

/* ───────── pages ───────── */
const P = window._svcPages;
function loanCard(v, i){
  const [stL, stC] = STATUS[v.status] || [v.status, ''];
  const pct = v.total ? Math.round(v.paid / v.total * 100) : 0;
  const nx = v.next;
  const live = v.live;
  return `<div class="ln-card ${live ? 'live' : ''} ${v.overdue && live ? 'late' : ''}" id="ln-${i}">
    <div class="ln-top"><div><b>${tk(v.amount)}</b><small>${E(v.ref)} · ${v.term} months · applied ${fdate(v.submittedAt)}</small></div><span class="ln-st ${v.overdue && live ? 'bad' : stC}">${v.overdue && live ? 'Overdue' : E(stL)}</span></div>
    ${live || v.repaid ? `<div class="ln-bar"><i style="width:${pct}%"></i></div><div class="ln-meta"><span>Paid <b>${tk(v.paid)}</b></span><span>${pct}%</span><span>Left <b>${tk(v.remaining)}</b></span></div>` : ''}
    ${live && nx ? `<div class="ln-next ${v.overdue ? 'late' : ''}"><div class="ic"><i class="fa-solid fa-${v.overdue ? 'triangle-exclamation' : 'calendar-day'}"></i></div><div><b>${tk(nx.amount - nx.paid)}</b><small>Installment ${nx.n} of ${v.term} · ${v.overdue ? 'was due' : 'due'} ${fdate(nx.due)}</small></div></div>` : ''}
    ${v.pending ? `<div style="font-size:11.5px;color:var(--orange);margin-top:8px"><i class="fa-solid fa-hourglass-half"></i> ${tk(v.pending)} waiting for verification</div>` : ''}
    ${!live && !v.repaid && v.status !== 'Rejected' ? `<div style="font-size:12px;color:var(--txt2);margin-top:10px">Installments start after the money is sent to you.</div>` : ''}
    ${v.repaid ? '<div style="font-size:12px;color:#c085ff;margin-top:8px"><i class="fa-solid fa-trophy"></i> Fully repaid — thank you!</div>' : ''}
    ${live ? `<div class="ln-acts"><button class="p" onclick="window._lnSel='${E(v.id)}';svGo('repay')"><i class="fa-solid fa-money-bill-transfer"></i> Pay installment</button><button onclick="window._lnSel='${E(v.id)}';svGo('payoff')"><i class="fa-solid fa-flag-checkered"></i> Pay off early</button></div>` : ''}
    ${v.schedule && v.disbursedAt ? `<div class="ln-more" onclick="document.getElementById('ln-${i}').classList.toggle('open')"><i class="fa-solid fa-list"></i> Show schedule</div>
      <div class="ln-sch">${v.schedule.map(s => `<div class="${s.done ? 'done' : (s.due && new Date(s.due) < new Date() ? 'late' : '')}"><span>#${s.n} · ${fdate(s.due)}</span><span>${tk(s.amount)} ${s.done ? '✓' : s.paid ? '(' + tk(s.paid) + ' paid)' : ''}</span></div>`).join('')}</div>` : ''}
  </div>`;
}
P.loans = async function(){
  show('My Loans', loading);
  await window._svLoadCfg(); const d = await loadLoans(true);
  if(!d){ show('My Loans', '<div class="sv-empty">Please login again.</div>'); return; }
  const L = d.loans || [];
  const live = L.filter(v => v.live), owed = live.reduce((a, v) => a + v.remaining, 0), paid = L.reduce((a, v) => a + v.paid, 0);
  show('My Loans', `<div class="ln-sum"><div><b>${live.length}</b><span>Active</span></div><div><b style="color:var(--orange)">${tk(owed)}</b><span>To repay</span></div><div><b style="color:var(--p)">${tk(paid)}</b><span>Repaid</span></div></div>
    ${L.length ? L.map(loanCard).join('') : `<div class="sv-empty"><i class="fa-solid fa-file-invoice-dollar"></i>No loans yet.<br><br><button class="sv-btn" style="max-width:220px;margin:auto" onclick="svClose();window.handleMainAction&&handleMainAction()">Apply for a loan</button></div>`}
    ${L.length ? `<div class="sv-two"><button class="sv-btn ghost" onclick="svGo('statement')"><i class="fa-solid fa-file-pdf"></i> Statement</button><button class="sv-btn ghost" onclick="svGo('trust')"><i class="fa-solid fa-shield-heart"></i> Trust level</button></div>` : ''}`);
};
function pickLive(title, next){
  const L = (LN && LN.loans || []).filter(v => v.live);
  if(!L.length){ show(title, `<div class="sv-empty"><i class="fa-solid fa-circle-check"></i>You have no active loan to pay right now.</div>`); return null; }
  let v = L.find(x => x.id === window._lnSel) || L[0]; window._lnSel = v.id;
  const sel = L.length > 1 ? `<span class="sv-lbl">Loan</span><div class="cnt-sel">${L.map(x => `<button class="${x.id === v.id ? 'on' : ''}" onclick="window._lnSel='${E(x.id)}';svPage('${next}')">${E(x.ref)}<br>${tk(x.amount)}</button>`).join('')}</div>` : '';
  return { v, sel };
}
function wallets(){
  return (window._feeWallets || []).map(w => ({ w, opts: typeof window._walletOptions === 'function' ? window._walletOptions(w) : Array.isArray(w.methods) && w.methods.length ? w.methods.filter(o => o && o.number) : [{ type: w.payMethod || 'Send Money', number: w.collectionNumber || w.paymentNumber }] })).filter(x => x.opts.length && x.opts[0].number);
}
function payBlock(amount, kind){
  const ws = wallets();
  if(!ws.length) return '<div class="sv-empty">No payment number is available right now. Please contact support.</div>';
  window._lnW = window._lnW || 0; if(!ws[window._lnW]) window._lnW = 0;
  const cur = ws[window._lnW]; if(!cur.opts[window._lnO || 0]) window._lnO = 0; const opt = cur.opts[window._lnO || 0];
  window._lnPay = { payMethod: cur.w.name + (opt.type ? ' · ' + opt.type : ''), toNumber: opt.number };
  return `<span class="sv-lbl">Pay with</span>
    <div class="pay-w">${ws.map((x, i) => `<button class="${i === window._lnW ? 'on' : ''}" onclick="window._lnW=${i};window._lnO=0;svPage('${kind}')">${x.w.logoUrl ? `<img src="${E(x.w.logoUrl)}" alt="">` : '<i class="fa-solid fa-wallet"></i>'}${E(x.w.name)}</button>`).join('')}</div>
    ${cur.opts.length > 1 ? `<div class="xs-chips" style="margin:-2px 0 8px">${cur.opts.map((o, j) => `<button class="${j === (window._lnO || 0) ? 'on' : ''}" onclick="window._lnO=${j};svPage('${kind}')">${E(o.type || 'Send Money')}</button>`).join('')}</div>` : ''}
    <span class="sv-lbl">${E(opt.type || 'Send Money')} ${tk(amount)} to</span>
    <div class="pay-num"><div><small>${E(cur.w.name)} · ${E(opt.type || 'Send Money')}</small><b>${E(opt.number)}</b></div><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${E(opt.number)}').then(()=>svToastOk('Number copied'))">Copy</button></div>
    ${opt.note || (opt.instructions || []).filter(Boolean).length ? `<div class="xs-pnote">${opt.note ? `<div>${E(opt.note)}</div>` : ''}${(opt.instructions || []).filter(Boolean).length ? `<ol>${opt.instructions.filter(Boolean).slice(0, 6).map(t => `<li>${E(t)}</li>`).join('')}</ol>` : ''}</div>` : ''}
    <span class="sv-lbl">Payment details</span>
    <input class="sv-in code" id="lnTrx" placeholder="TRANSACTION ID" maxlength="30" autocomplete="off">
    <input class="sv-in" id="lnSender" type="tel" placeholder="Paid from number (01XXXXXXXXX)" value="0${E((user() || {}).phone || '')}" style="margin-top:8px">`;
}
P.repay = async function(){
  show('Pay Installment', loading);
  await window._svLoadCfg(); if(!LN) await loadLoans(true);
  const pk = pickLive('Pay Installment', 'repay'); if(!pk) return;
  const { v, sel } = pk;
  const left = Math.max(0, v.remaining - v.pending), maxN = Math.max(1, Math.ceil(left / Math.max(1, v.emi)));
  window._lnN = Math.min(window._lnN || 1, maxN);
  const amount = Math.min(left, v.emi * window._lnN);
  show('Pay Installment', `${sel}
    <div class="sv-card" style="text-align:center"><div style="font-size:12px;color:var(--txt2)">${E(v.ref)} · installment ${v.next ? v.next.n : '-'} of ${v.term}${v.next ? ' · due ' + fdate(v.next.due) : ''}</div>
      <div style="font-size:34px;font-weight:900;color:var(--p)">${tk(amount)}</div><div style="font-size:12px;color:var(--txt2)">Left on this loan: ${tk(left)}</div></div>
    <span class="sv-lbl">How many installments?</span>
    <div class="cnt-sel">${[1, 2, 3].filter(n => n <= maxN).concat(maxN > 3 ? [maxN] : []).map(n => `<button class="${n === window._lnN ? 'on' : ''}" onclick="window._lnN=${n};svPage('repay')">${n === maxN && n > 1 ? 'All (' + n + ')' : n}</button>`).join('')}</div>
    ${left <= 0 ? '<div class="sv-empty">Your pending payments already cover this loan.</div>' : payBlock(amount, 'repay') + `<button class="sv-btn" style="margin-top:12px" id="lnBtn" onclick="lnSubmit('installment')"><i class="fa-solid fa-paper-plane"></i>Submit payment</button>
    <div style="font-size:11.5px;color:var(--txt2);margin-top:9px;text-align:center">We verify it and update your loan — you get a notification.</div>`}`);
  window._lnAmt = amount;
};
P.payoff = async function(){
  show('Early Payoff', loading);
  await window._svLoadCfg(); if(!LN) await loadLoans(true);
  const pk = pickLive('Early Payoff', 'payoff'); if(!pk) return;
  const { v, sel } = pk;
  const po = v.payoff || { amount: v.remaining, discount: 0, fee: 0 };
  const amount = Math.max(0, po.amount - v.pending);
  const left = v.term - v.paidCount;
  show('Early Payoff', `${sel}
    <div class="sv-card" style="background:radial-gradient(130% 120% at 50% 0%,rgba(168,85,247,.22),rgba(6,13,26,0) 70%),var(--surf);border-color:rgba(168,85,247,.35);text-align:center">
      <div style="font-size:12px;color:var(--txt2)">Pay off ${E(v.ref)} today</div><div style="font-size:34px;font-weight:900;color:#d9b8ff">${tk(amount)}</div>
      <div style="font-size:12px;color:var(--txt2)">and you are free of this loan 🎉</div></div>
    <div class="sv-card"><div class="sv-row"><span>Left on the loan</span><b>${tk(v.remaining)}</b></div>
      ${po.discount ? `<div class="sv-row"><span>Early payoff discount</span><b style="color:var(--p)">−${tk(po.discount)}</b></div>` : ''}
      ${po.fee ? `<div class="sv-row"><span>Payoff fee</span><b>+${tk(po.fee)}</b></div>` : ''}
      ${v.pending ? `<div class="sv-row"><span>Already sent (waiting)</span><b>−${tk(v.pending)}</b></div>` : ''}
      <div class="sv-row" style="border:0"><span>Installments you skip</span><b>${left}</b></div></div>
    ${po.discount ? `<div class="sv-card" style="border-color:rgba(29,219,128,.35)"><h4 style="color:var(--p)"><i class="fa-solid fa-piggy-bank"></i> You save ${tk(po.discount)}</h4><p>Paying early costs less than paying every installment.</p></div>` : `<div class="sv-card"><p><i class="fa-solid fa-circle-info"></i> Paying early clears the loan, raises your trust level and your next loan limit.</p></div>`}
    ${amount <= 0 ? '<div class="sv-empty">Your pending payments already cover this loan.</div>' : payBlock(amount, 'payoff') + `<button class="sv-btn" style="margin-top:12px;background:linear-gradient(135deg,#b06bff,#7a3ff2);color:#fff" id="lnBtn" onclick="lnSubmit('payoff')"><i class="fa-solid fa-flag-checkered"></i>Pay off ${tk(amount)}</button>`}`);
};
window.lnSubmit = async function(kind){
  const trxId = ($l('lnTrx').value || '').trim(), sender = ($l('lnSender').value || '').trim();
  if(trxId.length < 6){ toast('Enter the Transaction ID from your payment SMS', true); return; }
  const b = $l('lnBtn'); const h = b.innerHTML; b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Submitting…';
  const r = await api('payLoan', { kind, appId: window._lnSel, count: window._lnN || 1, trxId, sender, ...(window._lnPay || {}) });
  b.disabled = false; b.innerHTML = h;
  if(!r.ok){ toast(r.data.error || 'Could not submit', true); return; }
  toast(`${tk(r.data.amount)} submitted — we will verify it shortly`);
  await loadLoans(true); window._lnN = 1; svBack();
};
P.limit = async function(){
  show('Loan Limit', loading);
  await window._svLoadCfg(); const d = await loadLoans(true);
  if(!d){ show('Loan Limit', '<div class="sv-empty">Please login again.</div>'); return; }
  const L = d.limit, pct = L.cap ? Math.round(L.limit / L.cap * 100) : 100;
  show('Loan Limit', `<div class="lm-hero"><small>YOUR LOAN LIMIT</small><b>${tk(L.limit)}</b><div style="font-size:12px;color:var(--txt2)">Highest possible: ${tk(L.cap)}</div>
      <div class="ln-bar" style="margin:14px 0 0"><i style="width:${pct}%;background:linear-gradient(90deg,#4d8fff,#46c8ff)"></i></div></div>
    <div class="sv-card"><h4>How your limit is made</h4>${L.parts.map(p => `<div class="sv-row"><span>${E(p.label)}${p.capped ? `<small style="display:block;font-size:10.5px;color:var(--txt3)">${tk(p.full)} · <span>counted up to the highest loan</span></small>` : ''}</span><b>+${tk(p.amount)}</b></div>`).join('')}
      <div class="sv-row" style="border:0;padding-top:10px"><span><b>Your limit</b></span><b style="color:#7fb7ff">${tk(L.limit)}</b></div></div>
    ${L.tips.length ? `<div class="sv-cat">Raise your limit</div>${L.tips.map(t => `<div class="ord" style="cursor:pointer" onclick="svGo('${E(t.go)}')"><i class="fa-solid fa-arrow-trend-up" style="color:#46c8ff"></i><div><b>${E(t.label)}</b></div><span class="st st-Approved">+${tk(t.amount)}</span></div>`).join('')}` : '<div class="sv-card"><p>🎉 You have the highest limit.</p></div>'}
    ${L.enforce ? '' : '<div style="font-size:11.5px;color:var(--txt2);text-align:center;margin-top:10px">Your limit is a guide — applications above it may need extra review.</div>'}`);
};
P.trust = async function(){
  show('Trust Level', loading);
  await window._svLoadCfg(); const d = await loadLoans(true);
  if(!d){ show('Trust Level', '<div class="sv-empty">Please login again.</div>'); return; }
  const T = d.trust, cols = { Bronze: '#d08b4f', Silver: '#c9d3e0', Gold: '#ffd76a', Platinum: '#9ff3ff' };
  const col = cols[T.level] || 'var(--p)';
  show('Trust Level', `<div class="ring" style="--v:${T.score};--c:${col}"><b>${T.score}</b><span>${E(T.level)}</span></div>
    <div style="text-align:center;color:var(--txt2);font-size:12.5px;margin-bottom:10px">${E(T.perk)}${T.next ? `<br><b style="color:var(--txt)">${T.next.need} points</b> to ${E(T.next.name)}` : '<br>You are at the top level 🏆'}</div>
    ${T.overdueNow ? '<div class="sv-card" style="border-color:rgba(255,77,106,.5)"><p style="color:var(--red)"><i class="fa-solid fa-triangle-exclamation"></i> An overdue installment lowers your score by 30. Pay it to get the points back.</p></div>' : ''}
    <div class="tr-lv">${T.levels.map(l => `<div class="${l.name === T.level ? 'on' : ''}" style="${l.name === T.level ? 'background:' + (cols[l.name] || 'var(--p)') : ''}">${E(l.name)}<br>${l.min}+</div>`).join('')}</div>
    <div class="sv-card">${T.items.map(i => `<div class="tr-it"><i class="fa-solid fa-${i.ok ? 'check ok' : 'lock no'}"></i><div>${E(i.label)}${i.ok ? '' : `<small>${E(i.tip)}</small>`}</div><em>${i.ok ? '+' + i.pts : '+' + i.max}</em></div>`).join('')}</div>`);
};
P.statement = async function(){
  show('Statement', loading);
  await window._svLoadCfg(); const d = await loadLoans(true);
  if(!d){ show('Statement', '<div class="sv-empty">Please login again.</div>'); return; }
  show('Statement', `<div class="sv-card" style="text-align:center"><div class="sv-ic g-red" style="width:60px;height:60px;margin:0 auto 10px;font-size:26px;border-radius:18px"><i class="fa-solid fa-file-pdf"></i></div>
      <h4>Your loan statement</h4><p>All your loans, payments and installments in one document. Choose “Save as PDF” in the print window.</p></div>
    <button class="sv-btn" onclick="lnStatement()"><i class="fa-solid fa-download"></i>Download statement</button>
    <div class="sv-card" style="margin-top:12px"><div class="sv-row"><span>Loans</span><b>${d.loans.length}</b></div><div class="sv-row"><span>Total repaid</span><b>${tk(d.loans.reduce((a, v) => a + v.paid, 0))}</b></div><div class="sv-row" style="border:0"><span>Still to repay</span><b>${tk(d.loans.filter(v => v.live).reduce((a, v) => a + v.remaining, 0))}</b></div></div>`);
};
window.lnStatement = function(){
  const d = LN; if(!d) return;
  const brand = (document.querySelector('.splash-title,.logo-text,#appName') || {}).textContent || 'Creditfy';
  const u = d.user, e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '৳' + Math.round(Number(n) || 0).toLocaleString('en-US');
  const rows = d.loans.map(v => `<h3>${e(v.ref)} — ${money(v.amount)} · ${v.term} months <span class="st">${e(v.status)}</span></h3>
    <table><tr><td>Applied</td><td>${fdate(v.submittedAt)}</td><td>Money sent</td><td>${fdate(v.disbursedAt)}</td></tr>
    <tr><td>Installment</td><td>${money(v.emi)}</td><td>Total to repay</td><td>${money(v.total)}</td></tr>
    <tr><td>Paid</td><td>${money(v.paid)}</td><td>Remaining</td><td>${money(v.remaining)}</td></tr></table>
    ${(v.fee || []).length ? `<h4>Fee payments</h4><table><tr><th>Date</th><th>Amount</th><th>Status</th></tr>${v.fee.map(f => `<tr><td>${fdate(f.at)}</td><td>${money(f.amount)}</td><td>${e(f.status)}</td></tr>`).join('')}</table>` : ''}
    ${(v.payments || []).length ? `<h4>Repayments</h4><table><tr><th>Date</th><th>Type</th><th>TrxID</th><th>Amount</th><th>Status</th></tr>${v.payments.map(p => `<tr><td>${fdate(p.at)}</td><td>${p.type === 'payoff' ? 'Early payoff' : 'Installment'}</td><td>${e(p.trxId)}</td><td>${money(p.amount)}</td><td>${e(p.status)}</td></tr>`).join('')}</table>` : ''}
    ${v.disbursedAt ? `<h4>Schedule</h4><table><tr><th>#</th><th>Due</th><th>Amount</th><th>Paid</th></tr>${v.schedule.map(s => `<tr><td>${s.n}</td><td>${fdate(s.due)}</td><td>${money(s.amount)}</td><td>${s.done ? '✓ ' + money(s.paid) : money(s.paid)}</td></tr>`).join('')}</table>` : ''}`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${e(brand.trim())} statement — 0${e(u.phone)}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:28px;font-size:12px}header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #0a8a48;padding-bottom:10px;margin-bottom:16px}
    .lg{font-size:26px;font-weight:900;color:#0a8a48}.lg span{color:#111}h3{font-size:14px;margin:20px 0 6px;color:#0a3a26}h4{font-size:12px;margin:10px 0 4px;color:#444}
    table{width:100%;border-collapse:collapse;margin-bottom:6px}td,th{border:1px solid #ddd;padding:5px 7px;text-align:left}th{background:#f1f7f3;font-size:11px}
    .st{font-size:10px;background:#eef;padding:2px 7px;border-radius:6px;margin-left:6px}.sum{display:flex;gap:10px;margin:10px 0}.sum div{flex:1;border:1px solid #ddd;border-radius:8px;padding:8px}.sum b{display:block;font-size:16px}
    footer{margin-top:26px;font-size:10px;color:#777;border-top:1px solid #ddd;padding-top:8px}@media print{body{margin:12mm}}</style></head><body>
    <header><div class="lg">${e(brand.trim()).replace(/fy$/, '<span>fy</span>')}</div><div style="text-align:right">Loan statement<br>${new Date().toLocaleString('en-GB')}</div></header>
    <div><b>${e(u.name || 'Customer')}</b> · 0${e(u.phone)}${u.verified ? ' · ✔ Verified number' : ''}${u.vip ? ' · 👑 ' + e(u.vip.name) : ''}<br>Member since ${fdate(u.since)}</div>
    <div class="sum"><div>Loans<b>${d.loans.length}</b></div><div>Total repaid<b>${money(d.loans.reduce((a, v) => a + v.paid, 0))}</b></div><div>Still to repay<b>${money(d.loans.filter(v => v.live).reduce((a, v) => a + v.remaining, 0))}</b></div><div>Trust level<b>${e(d.trust.level)} (${d.trust.score})</b></div></div>
    ${rows || '<p>No loans yet.</p>'}<footer>This statement is generated from your Creditfy account. Payments waiting for verification are shown as Pending. For questions contact our support team.</footer>
    <script>setTimeout(function(){window.print()},400)<\/script></body></html>`;
  const w = window.open('', '_blank');
  if(!w){ toast('Please allow pop-ups to download the statement', true); return; }
  w.document.open(); w.document.write(html); w.document.close();
};
P.budget = function(){
  const pct = Number(cfgL().budget && cfgL().budget.safePct) || 40;
  show('Budget Planner', `<div class="sv-card"><h4><i class="fa-solid fa-scale-balanced" style="color:var(--p)"></i> How much can you safely borrow?</h4><p>Enter your monthly numbers. We keep your installments under ${pct}% of the money left after your expenses.</p></div>
    <span class="sv-lbl">Monthly income (৳)</span><input class="sv-in" id="bdInc" type="number" min="0" placeholder="e.g. 25000" oninput="lnBudget()">
    <span class="sv-lbl">Monthly expenses — rent, food, bills (৳)</span><input class="sv-in" id="bdExp" type="number" min="0" placeholder="e.g. 15000" oninput="lnBudget()">
    <span class="sv-lbl">Other loan installments you pay now (৳)</span><input class="sv-in" id="bdEmi" type="number" min="0" placeholder="0" oninput="lnBudget()">
    <div id="bdOut"></div>`);
};
window.lnBudget = function(){
  const inc = num($l('bdInc').value), ex = num($l('bdExp').value), emi = num($l('bdEmi').value);
  const pct = Number(cfgL().budget && cfgL().budget.safePct) || 40;
  const out = $l('bdOut'); if(!inc){ out.innerHTML = ''; return; }
  const free = inc - ex - emi, safe = Math.max(0, Math.floor(free * pct / 100));
  if(free <= 0){ out.innerHTML = `<div class="bd-res bad"><b>${tk(free)}</b><p style="color:var(--txt2);font-size:12.5px;margin:6px 0 0">Your expenses are higher than your income. A new loan would be hard to repay — we suggest lowering costs first.</p></div>`; return; }
  const mx = maxBorrow();
  const rows = terms().map(t => { let lo = 0, hi = mx; for(let i = 0; i < 30; i++){ const m = (lo + hi) / 2; if(window._svcEmi(m, t) <= safe) lo = m; else hi = m; } const amt = Math.floor(lo / 500) * 500; return { t, amt, emi: window._svcEmi(amt, t) }; });
  const best = rows.reduce((a, r) => r.amt > a.amt ? r : a, rows[0]);
  out.innerHTML = `<div class="bd-res"><div style="font-size:12px;color:var(--txt2)">Money left each month</div><b>${tk(free)}</b>
    <div style="font-size:12.5px;color:var(--txt2);margin-top:6px">Safe installment: up to <b style="color:var(--p)">${tk(safe)}</b> a month</div></div>
    <table class="cmp" style="margin-top:10px"><tr><th>Term</th><th>You can borrow</th><th>Installment</th></tr>
    ${rows.map(r => `<tr class="${r === best && r.amt ? 'best' : ''}"><td>${r.t} months</td><td>${tk(r.amt)}</td><td>${tk(r.emi)}</td></tr>`).join('')}</table>
    ${best.amt >= 1000 ? `<button class="sv-btn" style="margin-top:10px" onclick="svClose();window.handleMainAction&&handleMainAction()"><i class="fa-solid fa-hand-holding-dollar"></i>Apply for up to ${tk(best.amt)}</button>` : '<div class="sv-card"><p>A loan is not comfortable with these numbers right now.</p></div>'}
    <div style="font-size:11px;color:var(--txt3);text-align:center;margin-top:8px">Borrow only what you need — a smaller loan is easier to repay on time.</div>`;
};
P.compare = function(){
  const mx = maxBorrow(), stp = mx > 20000 ? 1000 : 500;
  window._cmpAmt = window._cmpAmt || Math.min(mx, 20000);
  show('EMI Compare', `<div class="sv-card" style="text-align:center"><div style="font-size:12px;color:var(--txt2)">Loan amount</div><div style="font-size:30px;font-weight:900;color:var(--txt)" id="cmpV">${tk(window._cmpAmt)}</div>
      <input type="range" class="sv-range" min="${stp}" max="${mx}" step="${stp}" value="${window._cmpAmt}" oninput="window._cmpAmt=Number(this.value);document.getElementById('cmpV').textContent='৳'+Number(this.value).toLocaleString('en-US');lnCompare()"></div>
    <div id="cmpOut"></div>`);
  lnCompare();
};
window.lnCompare = function(){
  const a = window._cmpAmt, rows = terms().map(t => { const f = fee(a, t), emi = window._svcEmi(a, t), repay = cfgL().emiMode === 'principal' || !cfgL().emiMode ? a : emi * t; return { t, f, emi, cost: f + (repay - a), per: Math.round((f + (repay - a)) / a * 1000) }; });
  const low = rows.reduce((x, r) => r.emi < x.emi ? r : x, rows[0]), cheap = rows.reduce((x, r) => r.cost < x.cost ? r : x, rows[0]);
  $l('cmpOut').innerHTML = `<table class="cmp"><tr><th>Term</th><th>Monthly</th><th>Upfront fee</th><th>Total cost</th></tr>
    ${rows.map(r => `<tr class="${r === cheap ? 'best' : ''}"><td>${r.t} mo</td><td>${tk(r.emi)}</td><td>${tk(r.f)}</td><td>${tk(r.cost)}<div style="font-size:10px;color:var(--txt2);font-weight:600">৳${r.per} per ৳1,000</div></td></tr>`).join('')}</table>
    <div class="sv-card" style="margin-top:6px"><p><i class="fa-solid fa-lightbulb" style="color:#ffd76a"></i> <b>${low.t} months</b> has the smallest monthly installment (${tk(low.emi)}). <b>${cheap.t} months</b> costs the least in total (${tk(cheap.cost)}). Fees and interest are shown before you apply — nothing hidden.</p></div>`;
};

/* ───────── start: load numbers for the calculator, limit check and badges ───────── */
function start(){ window._svLoadCfg().then(() => { if(user()) loadLoans(); try { if(window.svRenderHub) svRenderHub(); } catch (e) {} }); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
