/* Creditfy — "Your loan journey" on the home page: the 8 steps of a loan (Applied → Repaid), with the
   user's current step highlighted and one clear button for what to do next. Uses the newest application. */
(function(){
const STEPS = ['Applied', 'Fee due', 'Fee sent', 'Verified', 'Approved', 'Sent', 'Active', 'Repaid'];
// status → index of the current step (steps before it are done)
const AT = { 'Pending Fee Payment': 1, 'TrxID Submitted': 2, 'Fee Verified': 3, 'Approved': 4, 'Disbursement Rejected': 4, 'Disbursed': 6, 'Active': 6, 'Overdue': 6, 'Repaid': 8 };
const css = `
#lnJourney{position:relative;border-radius:18px;padding:10px 10px 9px;margin:0 -8px 14px;background:radial-gradient(120% 140% at 0% 0%,rgba(29,219,128,.12),transparent 55%),linear-gradient(165deg,rgba(255,255,255,.05),rgba(255,255,255,.012));border:1px solid rgba(29,219,128,.28);box-shadow:0 8px 20px rgba(0,0,0,.22);cursor:pointer}
#lnJourney .hd{display:flex;align-items:center;gap:7px;margin:0 2px 8px}
#lnJourney .hd b{font-size:13px;color:var(--txt)}#lnJourney .hd span{margin-left:auto;font-size:10px;font-weight:900;padding:2px 8px;border-radius:8px;background:rgba(29,219,128,.14);color:var(--p);white-space:nowrap}
#lnJourney .hd span.bad{background:rgba(255,77,106,.15);color:#ff8fa3}#lnJourney .hd span.warn{background:rgba(255,140,66,.15);color:#ffae6b}
.lj-track{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));padding:2px 0 0}
.lj-s{min-width:0;display:flex;flex-direction:column;align-items:center;position:relative;text-align:center}
.lj-s::before{content:"";position:absolute;top:11px;left:-50%;width:100%;height:2px;background:rgba(255,255,255,.1);z-index:0}
.lj-s:first-child::before{display:none}
.lj-s.done::before,.lj-s.now::before{background:linear-gradient(90deg,#1ddb80,#14b86a)}
.lj-d{position:relative;z-index:1;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:900;color:var(--txt3);background:#0f1a2e;border:2px solid rgba(255,255,255,.14)}
.lj-s.done .lj-d{color:#03210f;background:linear-gradient(135deg,#3be07c,#14b86a);border-color:transparent}
.lj-s.now .lj-d{color:#fff;background:linear-gradient(135deg,#ffcf5a,#f2a91d);border-color:#fff3c4;box-shadow:0 0 0 3px rgba(255,207,90,.22);animation:ljPulse 1.8s ease-in-out infinite}
.lj-s.now.bad .lj-d{background:linear-gradient(135deg,#ff6b81,#e0334f);border-color:#ffd0d6;box-shadow:0 0 0 3px rgba(255,77,106,.2)}
@keyframes ljPulse{50%{box-shadow:0 0 0 6px rgba(255,207,90,.08)}}
.lj-l{margin-top:4px;font-size:8.5px;font-weight:800;color:var(--txt3);line-height:1.15;max-width:100%;overflow-wrap:anywhere;hyphens:auto}
.lj-s.done .lj-l{color:var(--txt2)}.lj-s.now .lj-l{color:#ffd76a}.lj-s.now.bad .lj-l{color:#ff8fa3}
.lj-next{display:flex;align-items:center;gap:8px;margin-top:8px;padding:7px 7px 7px 10px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--bord)}
.lj-next .t{flex:1;min-width:0}.lj-next b{display:block;font-size:12px;color:var(--txt)}.lj-next small{display:block;font-size:10.5px;color:var(--txt2);line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.lj-next button{flex:none;border:0;border-radius:10px;padding:8px 11px;font-weight:900;font-size:11.5px;cursor:pointer;font-family:inherit;color:#03210f;background:linear-gradient(135deg,var(--p),var(--p2))}
.lj-next button.gold{color:#2a1a00;background:linear-gradient(135deg,#fff3c4,#ffd76a 45%,#f2a91d)}
@media(max-width:360px){.lj-l{display:none}.lj-s.now .lj-l{display:block;position:absolute;top:25px;left:50%;transform:translateX(-50%);white-space:nowrap}.lj-track{padding-bottom:12px}.lj-d{width:21px;height:21px;font-size:9.5px}.lj-s::before{top:10px}}
@media(min-width:380px){.lj-l{font-size:9px}}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
const E = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const user = () => { try { return JSON.parse(localStorage.getItem('creditUpUser')); } catch (e) { return null; } };
const vip = () => { try { return !!(window._svState && window._svState.vip); } catch (e) { return false; } };

// what to do next for each place in the journey
function next(status, a){
  const borrow = "document.getElementById('mainBorrowBtn')&&document.getElementById('mainBorrowBtn').click()";
  switch(status){
    case 'none': return ['Start your loan', 'Apply from your phone in a few minutes — every fee is shown before you pay.', 'Apply now', borrow, ''];
    case 'Pending Fee Payment': return ['Next: pay the fee', 'Your application is saved. Pay the fee so our team can start the review.', 'Pay the fee', 'openAppStatusModal()', 'gold'];
    case 'TrxID Submitted': return ['We are checking your payment', 'This usually takes a few minutes. Want a faster review? VIP goes first — a higher plan, earlier.', vip() ? 'View status' : 'Get VIP priority', vip() ? 'openAppStatusModal()' : "svGo('vip')", vip() ? '' : 'gold'];
    case 'Fee Verified': return ['Under review', 'Loan money is processed through the bank — up to 7–14 working days. VIP is reviewed first (higher plan = earlier).', vip() ? 'View status' : 'Get VIP priority', vip() ? 'openAppStatusModal()' : "svGo('vip')", vip() ? '' : 'gold'];
    case 'Approved': return ['Approved — money on the way', 'Your loan is approved and the money is being sent to your account.', 'View details', 'openAppStatusModal()', ''];
    case 'Disbursement Rejected': return ['Sending did not go through', 'The amount is in your Creditfy balance. Check your receiving number and tap for details.', 'Details', 'openAppStatusModal()', 'gold'];
    case 'Disbursed': case 'Active': return ['Your loan is active', 'Pay each installment on time — it grows your loan limit and trust level.', 'Pay installment', "svGo('repay')", ''];
    case 'Overdue': return ['An installment is late', 'Pay it now to protect your trust level and future loans.', 'Pay now', "svGo('repay')", 'gold'];
    case 'Repaid': return ['Loan repaid — well done! 🎉', 'Your loan limit grew. You can apply for your next loan any time.', 'Apply again', borrow, ''];
    case 'Rejected': return ['Not approved this time', 'Your fee is refunded as per our policy. You can apply again with updated details.', 'Apply again', borrow, ''];
  }
  return null;
}
let last = '';
function render(){
  const home = document.querySelector('#screen-home .home-body'); if(!home) return;
  const a = user() ? window._latestApp : null;
  const status = a ? (a.status || 'Pending Fee Payment') : 'none';
  const key = status + '|' + (a && a.id) + '|' + vip() + '|' + document.documentElement.lang;
  let box = document.getElementById('lnJourney');
  if(key === last && box) return; last = key;
  const n = status === 'none' ? 0 : status === 'Rejected' ? Math.max(1, AT[a.lastStatus] || 3) : (AT[status] ?? 1);
  const bad = status === 'Rejected' || status === 'Overdue' || status === 'Disbursement Rejected';
  const N = next(status, a); if(!N) { if(box) box.remove(); return; }
  if(!box){
    box = document.createElement('div'); box.id = 'lnJourney';
    const anchor = document.getElementById('userStatusCard');
    if(anchor && anchor.parentNode === home) anchor.insertAdjacentElement('afterend', box); else home.insertBefore(box, home.firstChild);
    box.addEventListener('click', e => { if(e.target.closest('button')) return; if(window._latestApp && window.openAppStatusModal) openAppStatusModal(); });
  }
  const tag = status === 'none' ? `<span>8 easy steps</span>` : status === 'Repaid' ? '<span>Completed ✓</span>' : status === 'Rejected' ? '<span class="bad">Not approved</span>' : `<span class="${bad ? (status === 'Rejected' ? 'bad' : 'warn') : ''}">Step ${Math.min(8, n + 1)} of 8</span>`;
  box.innerHTML = `<div class="hd"><i class="fa-solid fa-route" style="color:var(--p)"></i><b>Your loan journey</b>${tag}</div>
    <div class="lj-track">${STEPS.map((s, i) => { const done = i < n || status === 'Repaid', now = !done && i === n;
      return `<div class="lj-s${done ? ' done' : ''}${now ? ' now' : ''}${now && bad ? ' bad' : ''}"><div class="lj-d">${done ? '<i class="fa-solid fa-check"></i>' : now && status === 'Rejected' ? '<i class="fa-solid fa-xmark"></i>' : i + 1}</div><div class="lj-l">${i === 0 && status === 'none' ? 'Apply' : s}</div></div>`; }).join('')}</div>
    <div class="lj-next"><div class="t"><b>${E(N[0])}</b><small>${E(N[1])}</small></div><button class="${N[4]}" onclick="event.stopPropagation();${N[3]}">${E(N[2])}</button></div>`;
}
setInterval(render, 1500);
setTimeout(render, 600);
})();
