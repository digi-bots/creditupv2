/* Creditfy — Help & Info in Quick Services: Smart Tips, Partners & Sites (sponsored), Help Center (FAQ), Fees Explained,
   Stay Safe, Call Me Back and Our Offices. Content: Admin → Services & Rewards → Help & Info (siteConfig/services). */
(function(){
if(!window._svShow){ console.warn('help.js needs services.js'); return; }
const show = window._svShow, toast = window._svToast, E = window._svE, tk = window._svTk;
const $h = id => document.getElementById(id);
const user = () => { try { return JSON.parse(localStorage.getItem('creditUpUser')); } catch (e) { return null; } };
const C = () => window._svCfg() || {};
const H = () => C().help || {};

const css = `
.tp-card{display:flex;gap:12px;border-radius:18px;padding:14px;margin-bottom:10px;background:linear-gradient(160deg,var(--surf),var(--bg2));border:1px solid var(--bord)}
.tp-card .sv-ic{flex:none}.tp-card b{display:block;font-size:14px;color:var(--txt);margin-bottom:3px}.tp-card p{margin:0;font-size:12.5px;color:var(--txt2);line-height:1.6}
.tp-card button{margin-top:8px;border:0;border-radius:10px;padding:7px 12px;background:rgba(29,219,128,.14);color:var(--p);font-weight:800;font-size:12px;cursor:pointer;font-family:inherit}
.sp-card{display:flex;gap:12px;align-items:center;border-radius:18px;padding:13px;margin-bottom:10px;background:linear-gradient(160deg,var(--surf),var(--bg2));border:1px solid var(--bord);text-decoration:none;color:inherit}
.sp-card img{width:52px;height:52px;border-radius:14px;object-fit:contain;background:#fff;padding:5px;flex:none}
.sp-card .ph{width:52px;height:52px;border-radius:14px;background:var(--glass);display:flex;align-items:center;justify-content:center;font-weight:900;color:var(--txt);flex:none;font-size:20px}
.sp-card b{display:block;font-size:14px;color:var(--txt)}.sp-card p{margin:2px 0 0;font-size:12px;color:var(--txt2);line-height:1.5}
.sp-tag{font-size:9.5px;font-weight:900;letter-spacing:.4px;padding:2px 7px;border-radius:7px;background:rgba(255,215,106,.15);color:#ffd76a;margin-left:6px;vertical-align:middle}
.sp-card .go{margin-left:auto;color:var(--txt2);flex:none}
.fq-s{position:relative;margin-bottom:12px}.fq-s i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--txt2)}.fq-s input{padding-left:40px}
.fq-cats{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:2px}
.fq-cats button{flex:none;border-radius:20px;padding:7px 13px;border:1px solid var(--gbord);background:var(--glass);color:var(--txt2);font-weight:800;font-size:12px;cursor:pointer;font-family:inherit}
.fq-cats button.on{background:rgba(29,219,128,.14);color:var(--p);border-color:rgba(29,219,128,.45)}
.fq{border-radius:14px;margin-bottom:8px;background:rgba(255,255,255,.035);border:1px solid var(--bord);overflow:hidden}
.fq .q{padding:13px 14px;display:flex;gap:10px;align-items:center;font-size:13.5px;font-weight:800;color:var(--txt);cursor:pointer}
.fq .q i{margin-left:auto;color:var(--txt2);transition:.2s}.fq.open .q i{transform:rotate(180deg)}
.fq.best{border-color:rgba(29,219,128,.5);box-shadow:0 0 0 3px rgba(29,219,128,.08)}.fq-best{display:inline-flex;gap:5px;align-items:center;margin:10px 0 -4px 14px;font-size:10px;font-weight:900;color:var(--p);letter-spacing:.3px}
.fq .a{display:none;padding:0 14px 14px;font-size:12.5px;color:var(--txt2);line-height:1.7;white-space:pre-line}.fq.open .a{display:block}
.fe-row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px dashed var(--bord);font-size:13px;color:var(--txt2)}
.fe-row b{color:var(--txt)}.fe-row small{display:block;font-size:11px;color:var(--txt3)}
.fe-tot{display:flex;justify-content:space-between;padding:12px 0 0;font-size:15px;font-weight:900;color:var(--txt)}
.ss-num{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:14px;background:rgba(29,219,128,.07);border:1px solid rgba(29,219,128,.3);margin-bottom:8px}
.ss-num b{font-family:monospace;font-size:15px;color:var(--txt);letter-spacing:.5px}.ss-num small{display:block;font-size:11px;color:var(--txt2)}
.ss-num .ok{margin-left:auto;font-size:10px;font-weight:900;color:var(--p)}
.ss-tip{display:flex;gap:10px;padding:9px 0;font-size:13px;color:var(--txt);line-height:1.55}.ss-tip i{color:var(--red);margin-top:3px}
.of-card{border-radius:18px;padding:15px;margin-bottom:10px;background:linear-gradient(160deg,var(--surf),var(--bg2));border:1px solid var(--bord)}
.of-card b{font-size:15px;color:var(--txt)}.of-card div{font-size:12.5px;color:var(--txt2);margin-top:6px;display:flex;gap:8px;line-height:1.5}.of-card div i{color:var(--p);margin-top:3px;width:14px}
.of-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.of-acts a{text-align:center;border-radius:11px;padding:10px;font-size:12.5px;font-weight:800;text-decoration:none;background:var(--glass);border:1px solid var(--gbord);color:var(--txt)}
.of-acts a.p{background:linear-gradient(135deg,var(--p),var(--p2));color:#03210f;border:0}
.sv-sel{width:100%;height:50px;border-radius:14px;border:1.5px solid var(--gbord);background:rgba(255,255,255,.04);color:var(--txt);padding:0 12px;font-size:14px;font-family:inherit}
.sv-sel option{background:#0b1628}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
try { if(typeof BN === 'object') Object.assign(BN, { 'Smart Tips': 'স্মার্ট টিপস', 'Partners & Sites': 'পার্টনার ও সাইট', 'Help Center': 'হেল্প সেন্টার', 'Fees Explained': 'ফি-র ব্যাখ্যা',
  'Stay Safe': 'নিরাপদ থাকুন', 'Call Me Back': 'আমাকে কল করুন', 'Our Offices': 'আমাদের অফিস', 'Search questions': 'প্রশ্ন খুঁজুন', 'Request a call': 'কলের অনুরোধ' }); } catch (e) {}

/* ───────── defaults (used until the admin writes their own) ───────── */
const TIPS = [
  { ic: 'scale-balanced', g: 'g-teal', t: 'Borrow what you need', x: 'A smaller loan is easier to repay on time — and on-time loans raise your trust level and your next limit.', go: 'budget', btn: 'Plan my budget' },
  { ic: 'table-columns', g: 'g-orange', t: 'Compare before you choose', x: 'Part of the fee is fixed, so per ৳1,000 a bigger loan can cost less — but you repay more in total. EMI Compare shows both numbers side by side.', go: 'compare', btn: 'Compare terms' },
  { ic: 'calendar-check', g: 'g-green', t: 'Pay every installment on time', x: 'Each loan repaid on time adds to your loan limit. A late installment lowers your trust score until it is paid.', go: 'loans', btn: 'My loans' },
  { ic: 'circle-check', g: 'g-cyan', t: 'Verify your number', x: 'A verified number is reviewed with more trust and raises your loan limit.', go: 'verify', btn: 'Verify now' },
  { ic: 'flag-checkered', g: 'g-purple', t: 'Pay off early when you can', x: 'Clearing a loan early frees you sooner and grows your trust level.', go: 'payoff', btn: 'Early payoff' },
  { ic: 'shield-halved', g: 'g-red', t: 'Never share your password', x: 'Creditfy will never ask for your password or PIN. Pay only to the numbers shown inside the app.', go: 'safety', btn: 'Stay safe' }
];
const FAQ = [
  { cat: 'Loans', q: 'How long does approval take?', a: 'Loan money is processed through the bank, so approval and disbursement can take up to 7–14 working days. VIP Express members get a decision and the money within 72 hours, or their VIP fee back.' },
  { cat: 'Loans', q: 'How much can I borrow?', a: 'Up to the maximum shown on the home page. Your personal limit grows as you repay loans on time, verify your number or join VIP — see Loan Limit.' },
  { cat: 'Fees', q: 'What fees do I pay?', a: 'All fees and the upfront interest are shown before you apply and again on the fee page. See “Fees Explained” for the full list.' },
  { cat: 'Fees', q: 'Can I use a promo code on my fee?', a: 'No — fees take no promo code or coupon. The only reduction is your one-time ৳100 sign-up bonus from your balance.' },
  { cat: 'Fees', q: 'Will I get my fee back if I am rejected?', a: 'Yes — if your application is rejected, the fee is refunded to the number you paid from.' },
  { cat: 'Payments', q: 'How do I pay an installment?', a: 'Open Quick Services → Pay Installment, send the amount to the number shown, then enter the Transaction ID. We verify it and update your loan.' },
  { cat: 'Payments', q: 'Can I repay early?', a: 'Yes. Early Payoff shows the exact amount to clear your loan today.' },
  { cat: 'Account', q: 'What is the Verified badge?', a: 'A one-time ৳100 payment (from any bKash / Nagad number) shows that you are a serious customer. You get a premium Verified badge next to your number and on your profile, and it helps your approval. The full fee is paid — no promo or discount applies.' },
  { cat: 'Account', q: 'I forgot my password', a: 'Contact support from the Support page. For your safety, our team will confirm it is you before setting a new password.' }
];
const SAFE = ['Creditfy never asks for your password, PIN or OTP — not by call, SMS or WhatsApp.', 'Pay only to the numbers shown inside the app. We never ask you to pay to a personal number someone sends you.',
  'Our team never asks for “extra charges” by phone to release your loan.', 'If someone pretends to be Creditfy, report it to our support right away.'];

/* ───────── tiles ───────── */
Object.assign(window._svcTiles, {
  tips:     { l: 'Smart Tips', ic: 'lightbulb', g: 'g-gold', cat: 'help', page: 'tips' },
  sponsors: { l: 'Partners & Sites', ic: 'handshake', g: 'g-blue', cat: 'help', page: 'sponsors' },
  faq:      { l: 'Help Center', ic: 'circle-question', g: 'g-purple', cat: 'help', page: 'faq' },
  fees:     { l: 'Fees Explained', ic: 'receipt', g: 'g-teal', cat: 'help', page: 'fees' },
  terms:    { l: 'Loan Terms', ic: 'file-contract', g: 'g-blue', cat: 'help', page: 'terms' },
  safety:   { l: 'Stay Safe', ic: 'shield-halved', g: 'g-red', cat: 'help', page: 'safety' },
  callback: { l: 'Call Me Back', ic: 'phone-volume', g: 'g-green', cat: 'help', page: 'callback' },
  offices:  { l: 'Our Offices', ic: 'location-dot', g: 'g-orange', cat: 'help', page: 'offices' }
});
const P = window._svcPages;
const ready = async () => { await window._svLoadCfg(); };

P.tips = async function(){
  await ready();
  const L = Array.isArray(C().tips) && C().tips.length ? C().tips.filter(t => t.on !== false).map(t => ({ ic: t.icon || 'lightbulb', g: t.color || 'g-gold', t: t.title, x: t.text, go: t.go, btn: t.btn })) : TIPS;
  show('Smart Tips', `<div class="sv-card" style="background:radial-gradient(130% 120% at 50% 0%,rgba(255,215,106,.18),rgba(6,13,26,0) 70%),var(--surf);text-align:center"><div style="font-size:34px">💡</div><h4>Borrow smart, pay less</h4><p>Simple habits that save money and grow your loan limit.</p></div>
    ${L.map(t => `<div class="tp-card"><div class="sv-ic ${E(t.g)}"><i class="fa-solid fa-${E(t.ic)}"></i></div><div><b>${E(t.t)}</b><p>${E(t.x)}</p>${t.go && window._svcTiles[t.go] ? `<button onclick="svGo('${E(t.go)}')">${E(t.btn || 'Open')} →</button>` : ''}</div></div>`).join('')}`);
};
P.sponsors = async function(){
  await ready();
  const L = (Array.isArray(C().sponsors) ? C().sponsors : []).filter(s => s.on !== false && s.name && /^https?:\/\//i.test(s.url || ''));
  show('Partners & Sites', L.length ? `<div style="font-size:12.5px;color:var(--txt2);margin:0 2px 12px">Helpful services we recommend. Links open in your browser.</div>
    ${L.map(s => `<a class="sp-card" href="${E(s.url)}" target="_blank" rel="noopener sponsored">${s.logo ? `<img src="${E(s.logo)}" alt="" onerror="this.outerHTML='<div class=ph>${E(String(s.name).charAt(0))}</div>'">` : `<div class="ph">${E(String(s.name).charAt(0))}</div>`}
      <div><b>${E(s.name)}${s.tag !== '' ? `<span class="sp-tag">${E(s.tag || 'Sponsored')}</span>` : ''}</b><p>${E(s.desc || '')}</p></div><i class="fa-solid fa-arrow-up-right-from-square go"></i></a>`).join('')}
    <div style="font-size:11px;color:var(--txt3);text-align:center;margin-top:10px">Sponsored links are from our partners. Creditfy is not responsible for other websites.</div>`
    : '<div class="sv-empty"><i class="fa-solid fa-handshake"></i>Partner sites are coming soon.</div>');
};
P.faq = async function(){
  await ready();
  const own = Array.isArray(H().faq) && H().faq.length ? H().faq.filter(f => f.q && f.a) : FAQ;
  const all = [...own, ...((H().seoFaq || []).filter(f => !own.some(o => o.q === f.q)))];
  window._fqAll = all; window._fqCat = 'All';
  const cats = ['All', ...new Set(all.map(f => f.cat || 'General'))];
  show('Help Center', `<div class="fq-s"><i class="fa-solid fa-magnifying-glass"></i><input class="sv-in" id="fqQ" placeholder="Ask a question — e.g. how long does approval take?" oninput="hpFaq()"></div>
    <div class="fq-cats">${cats.map(c => `<button class="${c === 'All' ? 'on' : ''}" onclick="window._fqCat='${E(c)}';document.querySelectorAll('.fq-cats button').forEach(b=>b.classList.toggle('on',b.textContent==='${E(c)}'));hpFaq()">${E(c)}</button>`).join('')}</div>
    <div id="fqList"></div>
    <div class="sv-card" style="margin-top:14px;text-align:center"><h4>Still need help?</h4><p>Our team is happy to help.</p><div class="sv-two" style="margin-top:10px"><button class="sv-btn ghost" onclick="svClose();window.toggleCS&&toggleCS()"><i class="fa-solid fa-headset"></i>Support</button><button class="sv-btn ghost" onclick="svGo('callback')"><i class="fa-solid fa-phone-volume"></i>Call me</button></div></div>`);
  hpFaq();
};
// smart search: every word counts (in English or Bangla, with common other words for the same thing),
// the best matches come first and the top one opens by itself
const SYN = [['loan', 'লোন', 'ঋণ', 'borrow', 'credit'], ['fee', 'ফি', 'charge', 'চার্জ', 'cost', 'খরচ', 'টাকা'], ['verify', 'verified', 'ভেরিফাই', 'ভেরিফায়েড', 'badge', 'ব্যাজ'],
  ['vip', 'ভিআইপি', 'priority', 'fast', 'দ্রুত'], ['refund', 'ফেরত', 'return', 'back'], ['pay', 'payment', 'পেমেন্ট', 'trxid', 'transaction', 'ট্রানজেকশন'], ['bkash', 'বিকাশ', 'nagad', 'নগদ', 'rocket', 'রকেট', 'wallet'],
  ['installment', 'কিস্তি', 'emi', 'repay', 'পরিশোধ'], ['late', 'overdue', 'দেরি', 'বাকি'], ['approve', 'approval', 'অনুমোদন', 'time', 'সময়', 'days', 'দিন'], ['reject', 'rejected', 'বাতিল'],
  ['invite', 'refer', 'রেফার', 'ইনভাইট', 'friend', 'বন্ধু'], ['bonus', 'বোনাস', 'reward', 'পুরস্কার', 'redeem', 'রিডিম', 'code', 'কোড'], ['recharge', 'রিচার্জ', 'mobile'], ['balance', 'ব্যালেন্স'],
  ['password', 'পাসওয়ার্ড', 'login', 'লগইন'], ['nid', 'এনআইডি', 'document', 'কাগজ'], ['limit', 'লিমিট', 'সীমা', 'max', 'maximum']];
const norm = w => { w = w.toLowerCase(); const g = SYN.find(l => l.some(x => w === x || (x.length > 3 && w.startsWith(x)))); return g ? g[0] : w; };
const words = t => String(t || '').toLowerCase().split(/[^a-z0-9ঀ-৿]+/).filter(w => w.length > 1).map(norm);
window._faqScore = (f, qw) => { const qs = new Set(words(f.q)), as = new Set(words(f.a)); return qw.reduce((n, w) => n + (qs.has(w) ? 3 : 0) + (as.has(w) ? 1 : 0), 0); };
window.hpFaq = function(){
  const raw = ($h('fqQ') ? $h('fqQ').value : '').trim(), c = window._fqCat || 'All', qw = [...new Set(words(raw))];
  let L = (window._fqAll || []).filter(f => c === 'All' || (f.cat || 'General') === c);
  if(qw.length){ L = L.map(f => ({ f, n: window._faqScore(f, qw) + ((f.q + ' ' + f.a).toLowerCase().includes(raw.toLowerCase()) ? 4 : 0) })).filter(x => x.n > 0).sort((a, b) => b.n - a.n).map(x => x.f); }
  $h('fqList').innerHTML = L.length ? L.map((f, k) => `<div class="fq${qw.length && k === 0 ? ' open best' : ''}" onclick="this.classList.toggle('open')">${qw.length && k === 0 ? '<span class="fq-best"><i class="fa-solid fa-wand-magic-sparkles"></i> Best answer</span>' : ''}<div class="q">${E(f.q)}<i class="fa-solid fa-chevron-down"></i></div><div class="a">${E(f.a)}</div></div>`).join('')
    : `<div class="sv-empty">No answer found for “${E(raw)}”.<br>Ask our team — tap Support below.</div>`;
};
P.fees = async function(){
  await ready();
  const A = typeof ADMIN === 'object' ? ADMIN : {};
  const ex = typeof _feeBreak === 'function' ? _feeBreak(10000, 6) : null;
  const refund = (window._refundPolicy && String(window._refundPolicy).trim()) || 'If your application is rejected, the full fee you paid is refunded to the number you paid from.';
  const mode = (C().loans || {}).emiMode || 'principal';
  const rows = [['Origination fee', 'One-time, for opening your loan', tk(A.orgFee || 0)], ['Service charge', 'Handling your application', tk(A.serviceCharge || 0)], ['Processing fee', 'Checking your documents', tk(A.processingFee || 0)]]
    .concat((Array.isArray(A.customFees) ? A.customFees : []).filter(f => f && f.on !== false && f.name && Number(f.value) > 0).map(f => [f.name, f.type === 'percent' ? 'Share of the loan amount' : 'Fixed', f.type === 'percent' ? f.value + '%' : tk(f.value)]))
    .concat([['Interest', `${A.annualRate || 0}% per year, paid upfront with the fee`, (A.annualRate || 0) + '% / year']])
    .concat(A.extraInterest && A.extraInterest.on ? [[A.extraInterest.label || 'Additional interest', 'Per year, paid upfront', (A.extraInterest.rate || 0) + '% / year']] : []);
  show('Fees Explained', `<div class="sv-card" style="text-align:center;background:radial-gradient(130% 120% at 50% 0%,rgba(46,214,208,.18),rgba(6,13,26,0) 70%),var(--surf)"><div style="font-size:32px">🧾</div><h4>No hidden charges</h4><p>Every taka you pay, and why. The exact amounts for your loan are shown before you apply.</p></div>
    <div class="sv-card">${rows.map(r => `<div class="fe-row"><div>${E(r[0])}<small>${E(r[1])}</small></div><b>${E(r[2])}</b></div>`).join('')}</div>
    ${ex ? `<div class="sv-card"><h4>Example: ${tk(10000)} for 6 months</h4>${[['Fees', ex.fees], ['Interest (paid upfront)', ex.interest + ex.extraInterest]].map(r => `<div class="fe-row"><span>${r[0]}</span><b>${tk(r[1])}</b></div>`).join('')}
      <div class="fe-tot"><span>Paid before review</span><span>${tk(ex.total)}</span></div>
      <div class="fe-row" style="border:0"><span>Monthly installment after you get the money</span><b>${tk(window._svcEmi ? window._svcEmi(10000, 6) : Math.ceil(10000 / 6))}</b></div>
      <p style="margin-top:6px;font-size:11.5px">${mode === 'principal' ? 'Because interest is paid upfront, your installments repay only the loan amount.' : 'Installments include interest as shown in the calculator.'}</p></div>` : ''}
    <div class="sv-card" style="border-color:rgba(29,219,128,.35)"><h4><i class="fa-solid fa-rotate-left" style="color:var(--p)"></i> Refund policy</h4><p>${E(refund)}</p></div>
    ${H().feesNote ? `<div class="sv-card"><p>${E(H().feesNote)}</p></div>` : ''}
    <div class="sv-two"><button class="sv-btn ghost" onclick="svGo('compare')"><i class="fa-solid fa-table-columns"></i>Compare terms</button><button class="sv-btn ghost" onclick="svClose();window.openCalculator&&openCalculator()"><i class="fa-solid fa-calculator"></i>Calculator</button></div>`);
};
// Loan Terms: the key facts of a loan on one page — amounts, terms, every cost, the yearly cost, repayment,
// late payment, early payoff, refund and how to complain. Numbers come from Site Config; texts from Admin → Help & Info.
P.terms = async function(){
  await ready();
  const A = typeof ADMIN === 'object' ? ADMIN : {}, L = C().loans || {}, T = H().terms || {};
  const O = typeof OPTS === 'object' ? OPTS : {};
  const amts = (O.loanAmount || []).map(a => Number(String(a).replace(/,/g, '')) || 0).filter(Boolean), terms = (O.term || []).map(Number).filter(Boolean);
  const maxB = Number(window._maxBorrow) || Math.max(0, ...amts);
  const minA = amts.length ? Math.min(...amts) : 0, minT = terms.length ? Math.min(...terms) : 0, maxT = terms.length ? Math.max(...terms) : 0;
  // a worked example and the cost per year: (fees + interest) ÷ amount, spread over the term
  const exA = amts.includes(10000) ? 10000 : (amts[Math.floor(amts.length / 2)] || 10000), exT = terms.includes(6) ? 6 : (terms[0] || 6);
  const ex = typeof _feeBreak === 'function' ? _feeBreak(exA, exT) : null;
  const cost = ex ? ex.fees + ex.interest + ex.extraInterest : 0;
  const yearly = ex && exA ? Math.round(cost / exA * 12 / exT * 1000) / 10 : 0;
  const repaid = exA + cost;
  const row = (k, v, sub) => `<div class="fe-row"><div>${E(k)}${sub ? `<small>${E(sub)}</small>` : ''}</div><b>${v}</b></div>`;
  const po = L.payoff || {};
  show('Loan Terms', `<div class="sv-card" style="text-align:center;background:radial-gradient(130% 120% at 50% 0%,rgba(77,143,255,.22),rgba(6,13,26,0) 70%),var(--surf)"><div style="font-size:30px">📄</div><h4>Loan terms — key facts</h4><p>Read this before you apply. Your exact numbers are shown again on the fee page before you pay anything.</p></div>
    <span class="sv-lbl">The loan</span><div class="sv-card">
      ${row('Loan amount', `${tk(minA)} – ${tk(maxB)}`)}${row('Term', minT ? `${minT} – ${maxT} months` : '—')}
      ${row('Interest', `${A.annualRate || 0}% per year`, 'Paid upfront with the fee')}${A.extraInterest && A.extraInterest.on ? row(A.extraInterest.label || 'Additional interest', `${A.extraInterest.rate || 0}% per year`, 'Paid upfront') : ''}
      ${row('Fees', tk((A.orgFee || 0) + (A.serviceCharge || 0) + (A.processingFee || 0)), 'Origination, service and processing — see Fees Explained')}
      ${row('Paid to', 'Your own bKash / Nagad / Rocket', 'Only after approval')}</div>
    ${ex ? `<span class="sv-lbl">Example: ${tk(exA)} for ${exT} months</span><div class="sv-card">
      ${row('You receive', tk(exA))}${row('Fees + interest (paid before review)', tk(cost))}${row('Monthly installment', tk(window._svcEmi ? window._svcEmi(exA, exT) : Math.ceil(exA / exT)), `${exT} installments`)}
      <div class="fe-tot"><span>Total you pay</span><span>${tk(repaid)}</span></div>
      <div class="fe-row" style="border:0"><div>Cost per year (approx.)<small>All fees and interest as a yearly % of the loan</small></div><b>${yearly}%</b></div></div>` : ''}
    <span class="sv-lbl">Repayment</span><div class="sv-card"><p>${E(T.repay || 'Pay each installment by its due date from your bKash, Nagad or Rocket to the numbers shown in the app, and enter the Transaction ID. Your loan page shows every due date and what is left.')}</p></div>
    <span class="sv-lbl">Late payment</span><div class="sv-card" style="border-color:rgba(255,140,66,.4)"><p>${E(T.late || 'If an installment is late, your loan is marked overdue, we remind you, and your trust level and future loan limit go down. Talk to us early if you cannot pay on time.')}</p></div>
    ${po.on !== false ? `<span class="sv-lbl">Paying early</span><div class="sv-card"><p>You can pay off the whole loan at any time${Number(po.discountPct) ? ` and get ${po.discountPct}% off what is left` : ''}${Number(po.fee) ? `, with a ${tk(po.fee)} fee` : ' with no extra fee'}. See Early Payoff in Quick Services.</p></div>` : ''}
    <span class="sv-lbl">If your application is rejected</span><div class="sv-card" style="border-color:rgba(29,219,128,.35)"><p>${E((window._refundPolicy && String(window._refundPolicy).trim()) || 'The full fee you paid is refunded to the number you paid from.')}</p></div>
    <span class="sv-lbl">Questions or complaints</span><div class="sv-card"><p style="white-space:pre-line">${E(T.complaint || '1. Open Support in the app (headset icon) and describe the problem — include your Transaction ID if it is about a payment.\n2. Our team replies within 24 hours.\n3. Not solved? Ask for a call back in Quick Services → Call Me Back and a senior team member will call you.')}</p></div>
    ${T.extra ? `<div class="sv-card"><p style="white-space:pre-line">${E(T.extra)}</p></div>` : ''}
    <div class="sv-two"><button class="sv-btn ghost" onclick="svGo('fees')"><i class="fa-solid fa-receipt"></i>Fees explained</button><button class="sv-btn ghost" onclick="svClose();window.openCalculator&&openCalculator()"><i class="fa-solid fa-calculator"></i>Calculator</button></div>`);
};

P.safety = async function(){
  await ready();
  const S = H().safety || {};
  const own = Array.isArray(S.numbers) ? S.numbers.filter(n => n && n.number) : [];
  const pay = (window._feeWallets || []).flatMap(w => (Array.isArray(w.methods) && w.methods.length ? w.methods : [{ type: w.payMethod, number: w.collectionNumber || w.paymentNumber }]).filter(o => o && o.number).map(o => ({ label: `${w.name} · ${o.type || 'payment'}`, number: o.number })));
  const nums = [...own, ...pay.filter(p => !own.some(o => o.number === p.number))];
  const tips = Array.isArray(S.tips) && S.tips.length ? S.tips : SAFE;
  show('Stay Safe', `<div class="sv-card" style="text-align:center;background:radial-gradient(130% 120% at 50% 0%,rgba(255,77,106,.2),rgba(6,13,26,0) 70%),var(--surf);border-color:rgba(255,77,106,.35)"><div style="font-size:34px">🛡️</div><h4>Beware of fake loan offers</h4><p>Scammers pretend to be loan companies. These checks keep your money safe.</p></div>
    <div class="sv-cat">Our official numbers</div>
    ${nums.length ? nums.map(n => `<div class="ss-num"><i class="fa-solid fa-circle-check" style="color:var(--p)"></i><div><small>${E(n.label || 'Official')}</small><b>${E(n.number)}</b></div><span class="ok">OFFICIAL</span></div>`).join('') : '<div class="sv-empty" style="padding:10px">Numbers are shown inside the app when you pay.</div>'}
    <div class="sv-cat">Never do this</div><div class="sv-card">${tips.map(t => `<div class="ss-tip"><i class="fa-solid fa-ban"></i><span>${E(t)}</span></div>`).join('')}</div>
    <button class="sv-btn" style="background:linear-gradient(135deg,#ff6b81,#e0334f);color:#fff" onclick="svClose();window.toggleCS&&toggleCS()"><i class="fa-solid fa-flag"></i>Report a scam</button>`);
};
P.callback = async function(){
  await ready();
  const B = H().callback || {}, u = user() || {};
  if(B.on === false){ show('Call Me Back', '<div class="sv-empty">Call-back requests are switched off right now. Please use Support.</div>'); return; }
  const topics = Array.isArray(B.topics) && B.topics.length ? B.topics : ['New loan', 'My application', 'Payment / installment', 'VIP & services', 'Something else'];
  const slots = Array.isArray(B.slots) && B.slots.length ? B.slots : ['As soon as possible', 'Morning (10am – 1pm)', 'Afternoon (2pm – 5pm)', 'Evening (6pm – 9pm)'];
  show('Call Me Back', `<div class="sv-card" style="text-align:center;background:radial-gradient(130% 120% at 50% 0%,rgba(29,219,128,.2),rgba(6,13,26,0) 70%),var(--surf)"><div style="font-size:34px">📞</div><h4>We will call you</h4><p>${E(B.text || 'Choose a topic and a good time. Our team calls you from an official number.')}</p></div>
    <span class="sv-lbl">Your name</span><input class="sv-in" id="cbName" maxlength="60" placeholder="Your name" value="${E(u.name || '')}">
    <span class="sv-lbl">Phone number</span><input class="sv-in" id="cbPhone" type="tel" placeholder="01XXXXXXXXX" value="${u.phone ? '0' + E(u.phone) : ''}" ${u.phone ? 'readonly' : ''}>
    <span class="sv-lbl">Topic</span><select class="sv-sel" id="cbTopic">${topics.map(t => `<option>${E(t)}</option>`).join('')}</select>
    <span class="sv-lbl">Best time</span><select class="sv-sel" id="cbSlot">${slots.map(t => `<option>${E(t)}</option>`).join('')}</select>
    <span class="sv-lbl">Note (optional)</span><input class="sv-in" id="cbNote" maxlength="300" placeholder="How can we help?">
    <button class="sv-btn" style="margin-top:12px" id="cbBtn" onclick="hpCallback()"><i class="fa-solid fa-phone-volume"></i>Request a call</button>`);
};
window.hpCallback = async function(){
  const b = $h('cbBtn'); b.disabled = true; b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Sending…';
  const r = await window._svApi('callbackRequest', { name: $h('cbName').value, phone: $h('cbPhone').value, topic: $h('cbTopic').value, slot: $h('cbSlot').value, note: $h('cbNote').value });
  b.disabled = false; b.innerHTML = '<i class="fa-solid fa-phone-volume"></i>Request a call';
  if(!r.ok){ toast(r.data.error || 'Could not send', true); return; }
  toast('Request sent — we will call you soon'); svBack();
};
P.offices = async function(){
  await ready();
  const L = (Array.isArray(H().offices) ? H().offices : []).filter(o => o.on !== false && o.name);
  const site = window._siteContact || {};
  const list = L.length ? L : (site.address ? [{ name: 'Head office', address: site.address, phone: '', hours: '' }] : []);
  show('Our Offices', list.length ? list.map(o => { const map = o.map && /^https:\/\//i.test(o.map) ? o.map : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(o.address || o.name);
    return `<div class="of-card"><b>${E(o.name)}</b>${o.address ? `<div><i class="fa-solid fa-location-dot"></i><span>${E(o.address)}</span></div>` : ''}${o.hours ? `<div><i class="fa-regular fa-clock"></i><span>${E(o.hours)}</span></div>` : ''}${o.phone ? `<div><i class="fa-solid fa-phone"></i><span>${E(o.phone)}</span></div>` : ''}
      <div class="of-acts"><a class="p" href="${E(map)}" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> Directions</a>${o.phone ? `<a href="tel:${E(String(o.phone).replace(/[^\d+]/g, ''))}"><i class="fa-solid fa-phone"></i> Call</a>` : `<a href="javascript:void(0)" onclick="svGo('callback')"><i class="fa-solid fa-phone-volume"></i> Call me</a>`}</div></div>`; }).join('')
    : '<div class="sv-empty"><i class="fa-solid fa-location-dot"></i>We work fully online. Use Support or Call Me Back to reach us.</div>');
};
})();
