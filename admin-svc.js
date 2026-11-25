/* Creditfy admin — Services & Rewards: VIP / verification orders, the VIP 72-hour queue, promo · redeem · voucher codes,
   VIP plans, the verified badge, daily check-in, spin & win, gift vouchers and the Quick Services tiles.
   Settings live in siteConfig/services and use the normal save bar; orders and codes are saved straight away. */

(function(){
  const css = `
.sv-st{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}
.sv-k{border-radius:12px;border:1px solid var(--border);background:var(--card);padding:12px}
.sv-k b{display:block;font-size:20px;font-weight:900}.sv-k span{font-size:11px;color:var(--txt2)}
.od-row{display:grid;grid-template-columns:1.1fr 1fr 1fr .9fr auto;gap:10px;align-items:center;padding:11px;border-radius:11px;border:1px solid var(--border);background:rgba(255,255,255,.02);margin-bottom:7px;font-size:12.5px}
.od-row small{display:block;color:var(--txt2);font-size:11px;margin-top:2px}
.od-row .mono{font-family:monospace}
@media(max-width:900px){.od-row{grid-template-columns:1fr 1fr}}
.cd-row{display:grid;grid-template-columns:auto 1.1fr .8fr .9fr 1fr 1fr auto;gap:8px;align-items:center;padding:9px 10px;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,.02);margin-bottom:6px;font-size:12.5px}
.cd-row.off{opacity:.5}.cd-row .c{font-family:monospace;font-weight:800;letter-spacing:.5px}
.cd-k{font-size:10px;font-weight:900;padding:2px 7px;border-radius:7px;text-transform:uppercase}
.cd-k.promo{background:rgba(168,85,247,.15);color:#c085ff}.cd-k.redeem{background:rgba(29,219,128,.14);color:var(--p)}.cd-k.voucher{background:rgba(255,77,106,.14);color:#ff8fa3}
@media(max-width:1000px){.cd-row{grid-template-columns:auto 1fr 1fr}}
.vq-row{display:grid;grid-template-columns:1.2fr 1fr 1fr 1.1fr auto;gap:10px;align-items:center;padding:11px;border-radius:11px;border:1px solid var(--border);margin-bottom:7px;font-size:12.5px}
.vq-row small{display:block;color:var(--txt2);font-size:11px;margin-top:2px}
#ckDays{grid-template-columns:repeat(7,minmax(0,1fr))!important}#ckDays .fg{min-width:0}#ckDays input{width:100%;box-sizing:border-box;min-width:0}
.vq-row.late{border-color:rgba(255,77,106,.5);background:rgba(255,77,106,.05)}.vq-row.soon{border-color:rgba(255,140,66,.5)}
@media(max-width:900px){.vq-row{grid-template-columns:1fr 1fr}}
.pz-row{display:grid;grid-template-columns:1.2fr 1fr .8fr .8fr 70px 60px auto;gap:7px;align-items:center;margin-bottom:6px}
.pl-row{display:grid;grid-template-columns:auto 1.2fr .8fr .8fr 1fr auto;gap:7px;align-items:center;margin-bottom:6px}
.tl-row2{display:grid;grid-template-columns:auto 1.4fr 1fr .8fr auto;gap:7px;align-items:center;margin-bottom:6px}
.pz-row input,.pz-row select,.pl-row input,.pl-row select,.tl-row2 input,.lst-row input{height:34px;padding:0 9px;border-radius:8px;background:rgba(255,255,255,.04);border:1.5px solid var(--border);color:var(--txt);font-size:12.5px;font-family:inherit;min-width:0;width:100%;box-sizing:border-box}
.pz-row select option,.pl-row select option{background:#0f1d35}
.lst-row{display:grid;grid-template-columns:1fr auto;gap:7px;margin-bottom:6px}
@media(max-width:800px){.pz-row,.pl-row{grid-template-columns:1fr 1fr}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();

const SVD = {
  vip: { on: true, hours: 72, normal: '7–15 days', plans: [{ id: 'vip', name: 'VIP', price: 499, days: 90, on: true, color: 'gold' }, { id: 'super', name: 'Super VIP', price: 999, days: 365, on: true, color: 'violet' }, { id: 'supreme', name: 'Supreme VIP', price: 1999, days: 0, on: true, color: 'black' }],
    perks: ['Loan approved and money sent within 72 hours', 'Your application goes first in the review queue', 'Priority support', 'Gold VIP badge on your profile'],
    terms: ['If your loan is not approved and sent within 72 hours, your VIP fee is refunded.', 'VIP speeds up the review; approval still depends on your details.', 'A rejected application does not end your VIP — apply again any time while it is valid.', 'If your account is suspended, VIP ends automatically.'] },
  verify: { on: true, price: 100, title: 'Get a Verified badge', text: 'Pay a one-time ৳100 from any bKash / Nagad number. The Verified badge shows that you are a serious customer who really wants our service — a premium blue badge appears next to your number and on your profile, and your applications are reviewed with more trust, so you have a better chance of approval.' },
  checkin: { on: true, rewards: [1, 1, 2, 2, 3, 3, 10] },
  spin: { on: true, period: 'month', prizes: [{ id: 'p1', label: '৳5', type: 'balance', value: 5, weight: 30, color: '#1ddb80' }, { id: 'p2', label: 'Try again', type: 'none', value: 0, weight: 35, color: '#4d8fff' }, { id: 'p3', label: '৳10', type: 'balance', value: 10, weight: 18, color: '#ff8c42' }, { id: 'p4', label: '৳20', type: 'balance', value: 20, weight: 8, color: '#a855f7' }, { id: 'p5', label: 'Better luck', type: 'none', value: 0, weight: 7, color: '#5a6b85' }, { id: 'p6', label: '৳50', type: 'balance', value: 50, weight: 2, color: '#ffc94d' }] },
  voucher: { on: true, min: 50, max: 1000, days: 30 },
  codes: { promo: true, redeem: true },
  bonus: { requireVerified: true },
  loans: { emiMode: 'principal', pay: { on: true }, payoff: { on: true, discountPct: 0, fee: 0 }, limit: { on: true, enforce: false, start: 20000, step: 10000, verifiedBonus: 5000, vipBonus: 10000, max: 0 },
    trust: { on: true, levels: [{ name: 'Bronze', min: 0, perk: 'Welcome to Creditfy' }, { name: 'Silver', min: 30, perk: 'Faster review' }, { name: 'Gold', min: 60, perk: 'Higher loan limit and priority review' }, { name: 'Platinum', min: 85, perk: 'Our best limits and the fastest service' }] },
    budget: { safePct: 40 }, statement: { on: true } },
  hub: { home: ['vip', 'checkin', 'spin', 'wallet', 'calc', 'refer', 'history', 'all'], tiles: {} }
};
const SV_TILES = [['vip', 'VIP Express'], ['verify', 'Verify Number'], ['checkin', 'Daily Check-in'], ['spin', 'Spin & Win'], ['wallet', 'Wallet'], ['redeem', 'Redeem Code'], ['voucher', 'Gift Voucher'],
  ['calc', 'Calculator'], ['refer', 'Refer & Earn'], ['history', 'History'], ['profile', 'Profile'],
  ['loans', 'My Loans'], ['repay', 'Pay Installment'], ['payoff', 'Early Payoff'], ['limit', 'Loan Limit'], ['trust', 'Trust Level'], ['statement', 'Statement (PDF)'], ['budget', 'Budget Planner'], ['compare', 'EMI Compare'],
  ['tips', 'Smart Tips'], ['sponsors', 'Partners & Sites'], ['faq', 'Help Center'], ['fees', 'Fees Explained'], ['safety', 'Stay Safe'], ['callback', 'Call Me Back'], ['offices', 'Our Offices']];
let _SV = clone(SVD), _ORD = [], _CODES = [], _USES = [];

function buildSvc(){
  const s = $p('sec-services'); if(!s || s.dataset.built) return; s.dataset.built = 1;
  s.innerHTML = `<div class="sec-head"><h2>Services &amp; Rewards</h2>${svBtn('services')}</div>${roBanner}
  ${proTabs('services', [['orders', 'receipt', 'Orders'], ['vipq', 'stopwatch', 'VIP 72h queue'], ['codes', 'ticket', 'Promo & Redeem codes'], ['vip', 'crown', 'VIP plans'], ['verify', 'circle-check', 'Verified badge'], ['rewards', 'gift', 'Check-in · Spin · Voucher'], ['loans', 'hand-holding-dollar', 'Loan tools'], ['help', 'circle-question', 'Help & Info'], ['hub', 'grip', 'Quick Services tiles']], 'orders')}
  <div class="pro-pane" data-k="help">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-phone-volume"></i>Call-back requests <button class="btn btn-sm btn-s ro-ok" style="margin-left:auto" onclick="cbLoad()"><i class="fa-solid fa-rotate-right"></i></button></div><div id="cbList"></div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-lightbulb"></i>Smart Tips <button class="btn btn-sm btn-s" style="margin-left:auto" onclick="heAdd('tips')"><i class="fa-solid fa-plus"></i>Add tip</button></div>
      <div class="hint" style="margin-bottom:6px">Empty list = the built-in tips. “Opens” = a service key such as compare, budget, verify, vip, loans, payoff, safety.</div><div id="he-tips"></div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-handshake"></i>Partners &amp; Sites (sponsored) <button class="btn btn-sm btn-s" style="margin-left:auto" onclick="heAdd('sponsors')"><i class="fa-solid fa-plus"></i>Add site</button></div>
      <div class="hint" style="margin-bottom:6px">Shown with a “Sponsored” label (change it in Tag; leave Tag empty for none). Links open in a new tab.</div><div id="he-sponsors"></div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-circle-question"></i>Help Center questions <button class="btn btn-sm btn-s" style="margin-left:auto" onclick="heAdd('faq')"><i class="fa-solid fa-plus"></i>Add question</button></div>
      <div class="fgrid fgrid3">${tog('hp-seofaq', 'Also show the FAQ from SEO &amp; Reviews', 1)}</div>
      <div class="hint" style="margin:6px 0">Empty list = built-in questions about loans, fees, payments and the account.</div><div id="he-faq"></div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-receipt"></i>Fees Explained &amp; Stay Safe</div>
      <div class="hint" style="margin-bottom:6px">Fees are taken from Site Config automatically. The fee payment numbers from Wallets are always listed as official numbers.</div>
      <div class="fgrid">${area('hp-feesnote', 'Extra note on the Fees page (optional)', '', 2, 'maxlength="400"')}${area('hp-safetips', 'Safety warnings — one per line (empty = built-in)', '', 4, 'maxlength="1500"')}${area('hp-nums', 'Other official numbers — one per line as Label | Number (e.g. Hotline | 09612345678)', '', 3, 'maxlength="800"')}</div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-location-dot"></i>Our Offices <button class="btn btn-sm btn-s" style="margin-left:auto" onclick="heAdd('offices')"><i class="fa-solid fa-plus"></i>Add office</button></div>
      <div class="hint" style="margin-bottom:6px">Empty = the company address from Site Config. Map link optional (a Google Maps search is used otherwise).</div><div id="he-offices"></div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-phone"></i>Call Me Back settings</div>
      <div class="fgrid">${tog('cb-on', 'Users can ask for a call', 1)}${inp('cb-text', 'Text on the page', 'Choose a topic and a good time…', 'full maxlength="200"')}${area('cb-topics', 'Topics — one per line (empty = built-in)', '', 3)}${area('cb-slots', 'Time choices — one per line (empty = built-in)', '', 3)}</div></div>
  </div>
  <div class="pro-pane" data-k="loans">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-calendar-days"></i>Installments</div>
      <div class="fgrid fgrid3"><div class="fg"><label>How the monthly installment is counted</label><select id="ln-mode"><option value="principal">Loan ÷ months (interest is paid upfront with the fee)</option><option value="flat">(Loan + interest) ÷ months</option><option value="amortized">Bank EMI (reducing balance)</option></select></div>
      ${tog('ln-pay', 'Users can pay installments in the app', 1)}${tog('ln-po', 'Users can pay off early', 1)}${inp('ln-pod', 'Early payoff discount (% of what is left)', '0', 'type="number" min="0" max="100"')}${inp('ln-pof', 'Early payoff fee (৳)', '0', 'type="number" min="0"')}</div>
      <div class="hint" style="margin-top:6px">The same installment is shown in the calculator, Loan Details and My Loans. Your fee already includes the interest (“Advance Interest Fee”), so “Loan ÷ months” avoids charging interest twice. Repayments appear in Transactions as INSTALLMENT / EARLY PAYOFF; verifying them updates the loan and marks it Repaid when it is fully paid.</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-arrow-trend-up"></i>Personal loan limit</div>
      <div class="fgrid fgrid3">${tog('lm-on', 'Show users their loan limit', 1)}${tog('lm-enf', 'Block applications above the limit', 0)}${inp('lm-start', 'Starting limit (৳)', '20000', 'type="number" min="0"')}${inp('lm-step', 'Added per loan repaid (৳)', '10000', 'type="number" min="0"')}${inp('lm-vf', 'Added for a verified number (৳)', '5000', 'type="number" min="0"')}${inp('lm-vip', 'Added for VIP members (৳)', '10000', 'type="number" min="0"')}${inp('lm-max', 'Highest limit (৳, 0 = Max Borrow Amount)', '0', 'type="number" min="0"')}</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-shield-heart"></i>Trust levels</div>
      <div class="hint" style="margin-bottom:8px">Score out of 100: verified number 20, first loan repaid 15, second 15, always on time 20, member 3 months 10, VIP 10, complete profile 10; an overdue installment takes 30 away.</div>
      <div id="trLv"></div>
      <div class="fgrid fgrid3" style="margin-top:8px">${inp('bd-pct', 'Budget planner: safe share of free money for installments (%)', '40', 'type="number" min="10" max="80"')}</div>
    </div>
  </div>
  <div class="pro-pane" data-k="orders">
    <div class="sv-st" id="odStats"></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-receipt"></i>VIP &amp; verification payments
      <select id="odFilter" onchange="odRender()" style="margin-left:auto;height:32px;border-radius:8px;background:var(--card);color:var(--txt);border:1px solid var(--border)"><option value="Pending">Waiting for check</option><option value="all">All</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select>
      <button class="btn btn-sm btn-s ro-ok" onclick="odLoad()"><i class="fa-solid fa-rotate-right"></i></button></div>
      <div id="odList"></div>
      <div class="hint" style="margin-top:6px">Find the payment in your bKash / Nagad app (amount, TrxID, sender number), then Approve. For verification any sender number is fine — check the ৳ amount and TrxID. Approving VIP switches it on at once and starts the plan's days.</div>
    </div>
  </div>
  <div class="pro-pane" data-k="vipq">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-stopwatch"></i>VIP Express — open applications <button class="btn btn-sm btn-s ro-ok" style="margin-left:auto" onclick="vqLoad()"><i class="fa-solid fa-rotate-right"></i>Refresh</button></div>
      <div id="vqList"></div>
      <div class="hint" style="margin-top:6px">Applications from active VIP members, oldest deadline first. The clock starts when the application is submitted. If the loan was not sent within the time, the VIP fee is owed back: send it, then press <b>Mark refunded</b>.</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-users"></i>Active VIP members</div><div id="vqMembers"></div></div>
  </div>
  <div class="pro-pane" data-k="codes">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-plus"></i>New code</div>
      <div class="fgrid fgrid3">
        <div class="fg"><label>Kind</label><select id="cd-kind" onchange="cdKind()"><option value="redeem">Redeem — adds balance</option><option value="voucher">Gift voucher — adds balance, single use</option></select></div>
        <div class="fg"><label>Code (empty = random)</label><input id="cd-code" maxlength="24" placeholder="e.g. EID50" style="text-transform:uppercase"></div>
        <div class="fg cd-promo"><label>Discount type</label><select id="cd-type"><option value="flat">Fixed taka (৳)</option><option value="percent">Percent of the fee (%)</option></select></div>
        <div class="fg"><label id="cd-vlbl">Discount</label><input id="cd-value" type="number" min="1" placeholder="50"></div>
        <div class="fg cd-promo"><label>Max discount ৳ (for %, optional)</label><input id="cd-max" type="number" min="0" placeholder="0 = no limit"></div>
        <div class="fg"><label>Total uses (0 = unlimited)</label><input id="cd-uses" type="number" min="0" placeholder="100"></div>
        <div class="fg"><label>Uses per user</label><input id="cd-per" type="number" min="1" placeholder="1"></div>
        <div class="fg"><label>Starts</label><input id="cd-start" type="date"></div>
        <div class="fg"><label>Ends</label><input id="cd-end" type="date"></div>
        <div class="fg cd-promo"><label>Minimum loan ৳</label><input id="cd-min" type="number" min="0" placeholder="0"></div>
        <div class="fg"><label>Who can use it</label><select id="cd-aud"><option value="all">Everyone</option><option value="new">New customers (no loan yet)</option><option value="vip">VIP members</option><option value="verified">Verified numbers</option></select></div>
        <div class="fg"><label>Label shown to the user (optional)</label><input id="cd-label" maxlength="40" placeholder="Eid special 20% off"></div>
        <div class="fg"><label>How many codes</label><input id="cd-count" type="number" min="1" max="200" value="1"></div>
        <div class="fg"><label>Prefix for many codes</label><input id="cd-prefix" maxlength="8" placeholder="EID" style="text-transform:uppercase"></div>
        <div class="fg"><label>Note (admin only)</label><input id="cd-note" maxlength="80" placeholder="Facebook campaign"></div>
      </div>
      <button class="btn btn-p" style="margin-top:8px" onclick="cdCreate()"><i class="fa-solid fa-plus"></i>Create code</button>
      <div id="cdNew" style="margin-top:10px"></div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-ticket"></i>All codes
      <select id="cdFilter" onchange="cdRender()" style="margin-left:auto;height:32px;border-radius:8px;background:var(--card);color:var(--txt);border:1px solid var(--border)"><option value="">All kinds</option><option value="promo">Promo</option><option value="redeem">Redeem</option><option value="voucher">Vouchers</option></select>
      <input id="cdSearch" placeholder="Search…" oninput="cdRender()" style="height:32px;border-radius:8px;background:var(--card);color:var(--txt);border:1px solid var(--border);padding:0 9px;width:140px">
      <button class="btn btn-sm btn-s ro-ok" onclick="cdLoad()"><i class="fa-solid fa-rotate-right"></i></button></div>
      <div id="cdList"></div>
    </div>
  </div>
  <div class="pro-pane" data-k="vip">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-crown"></i>VIP Express</div>
      <div class="fgrid fgrid3">${tog('vp-on', 'Sell VIP plans', 1)}${inp('vp-hours', 'Promise: approved &amp; sent within (hours)', '72', 'type="number" min="1" max="720"')}${inp('vp-normal', 'Normal service time (shown for comparison)', '7–15 days')}</div>
      <div class="man-sub">Plans <button class="btn btn-sm btn-s" onclick="_SV.vip.plans.push({id:'p'+hid(),name:'New plan',price:0,days:30,on:true,color:'gold'});markDirty('services','vp');vpRender()"><i class="fa-solid fa-plus"></i>Add plan</button></div>
      <div class="hint" style="margin-bottom:6px">Days 0 = lifetime (never expires).</div>
      <div id="vpPlans"></div>
      <div class="man-sub">What VIP members get</div><div id="vpPerks"></div>
      <div class="man-sub">Promise &amp; terms (shown before buying)</div><div id="vpTerms"></div>
    </div>
  </div>
  <div class="pro-pane" data-k="verify">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-circle-check"></i>Verified number badge</div>
      <div class="fgrid fgrid3">${tog('vf-on', 'Offer verification', 1)}${inp('vf-price', 'Fee (৳)', '100', 'type="number" min="0"')}${inp('vf-title', 'Title', 'Get a Verified badge', 'maxlength="60"')}${area('vf-text', 'Explanation shown to the user', '', 3, 'maxlength="500"')}</div>
      <div class="hint" style="margin-top:6px">The user can pay from any number. The full fee is always paid — no promo, coupon or discount applies. Verified users show a blue badge here in Users and in their profile. Use it in your review: a verified number proves the user owns it.</div>
    </div>
  </div>
  <div class="pro-pane" data-k="rewards">
    <div class="cfg-blk" style="border-color:rgba(96,165,250,.45)"><div class="cfg-t"><i class="fa-solid fa-circle-check" style="color:#60a5fa"></i>Who can join offers &amp; rewards</div>
      <div class="fgrid">${tog('bn-reqv', 'Only Verified members can join offers, events and rewards', 1)}</div>
      <div class="hint" style="margin-top:6px">When on, users without the Verified badge cannot use Daily check-in, Spin &amp; Win, Redeem codes, Gift vouchers or the Hot Offer, and they are left out of invite prizes, the podium and winner lists (they can still invite friends). Every new user still gets the sign-up bonus and can use it on the fee.</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-calendar-check"></i>Daily check-in</div>
      <div class="fgrid fgrid3">${tog('ck-on', 'Daily check-in on', 1)}</div>
      <div class="man-sub">Reward for day 1 to 7 of a streak (৳)</div><div id="ckDays" style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px"></div>
      <div class="hint" style="margin-top:6px" id="ckCost"></div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-dharmachakra"></i>Spin &amp; Win <button class="btn btn-sm btn-s" style="margin-left:auto" onclick="_SV.spin.prizes.push({id:'p'+hid(),label:'৳5',type:'balance',value:5,weight:10,color:'#1ddb80'});markDirty('services','sp');spRender()"><i class="fa-solid fa-plus"></i>Add prize</button></div>
      <div class="fgrid fgrid3">${tog('sp-on', 'Spin & Win on', 1)}<div class="fg"><label>Each user can spin</label><select id="sp-period"><option value="day">Once a day</option><option value="week">Once a week</option><option value="month">Once a month</option></select></div></div>
      <div class="hint" style="margin:6px 0">Label · type · value · weight (bigger = more likely) · colour. The chance column is calculated for you. Type “Gift” = a prize you hand over yourself (the user is told your team will contact them).</div>
      <div id="spList"></div><div class="hint" id="spCost" style="margin-top:6px"></div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-gift"></i>Gift vouchers &amp; codes</div>
      <div class="fgrid fgrid3">${tog('vc-on', 'Users can send gift vouchers from their balance', 1)}${inp('vc-min', 'Smallest voucher (৳)', '50', 'type="number" min="1"')}${inp('vc-max', 'Largest voucher (৳)', '1000', 'type="number" min="1"')}${inp('vc-days', 'Voucher valid for (days)', '30', 'type="number" min="1" max="365"')}${tog('cd-redeem-on', 'Redeem codes', 1)}</div>
    </div>
  </div>
  <div class="pro-pane" data-k="hub">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-grip"></i>Quick Services on the home page</div>
      <div class="hint" style="margin-bottom:8px">Tick “Home” for up to 6 tiles (the last two are always “Language” and “All Services”). Use the arrows to set the order. “Show” off hides a service everywhere. Badge = a small label like NEW or HOT.</div>
      <div id="hbList"></div>
    </div>
  </div>`;
}

/* ═════════ orders ═════════ */
async function odLoad(){
  const [o, users] = await Promise.all([window._getDocs('serviceOrders'), (_D.users && _D.users.length) ? Promise.resolve(_D.users) : window._getDocs('users')]);
  _ORD = o.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); _D.users = users;
  const pend = _ORD.filter(x => x.status === 'Pending');
  const n = $p('nb-svc'); if(n){ n.textContent = pend.length; n.style.display = pend.length ? '' : 'none'; }
  const ok = _ORD.filter(x => x.status === 'Approved');
  const vipActive = users.filter(u => u.vip && u.vip.plan && u.vip.active !== false && (!u.vip.until || new Date(u.vip.until) > new Date()) && !['banned', 'suspended'].includes(u.status)).length;
  const el = $p('odStats'); if(el) el.innerHTML = [['Waiting for check', pend.length, 'var(--orange)'], ['Active VIP members', vipActive, '#ffd76a'], ['Verified numbers', users.filter(u => u.phoneVerified).length, '#46b0ff'],
    ['Earned (approved)', '৳' + fa(ok.reduce((a, x) => a + (Number(x.price) || 0), 0)), 'var(--p)']].map(([l, v, c]) => `<div class="sv-k"><b style="color:${c}">${v}</b><span>${l}</span></div>`).join('');
  odRender();
}
function odRender(){
  const f = $p('odFilter') ? $p('odFilter').value : 'Pending';
  const L = _ORD.filter(x => f === 'all' || x.status === f);
  const el = $p('odList'); if(!el) return;
  el.innerHTML = L.length ? L.map(o => {
    const u = (_D.users || []).find(x => String(x.phone) === String(o.uid)) || {};
    const own = String(o.sender) === String(o.uid);
    return `<div class="od-row"><div><b>${o.kind === 'vip' ? '👑 ' : '<i class="fa-solid fa-circle-check" style="color:#46b0ff"></i> '}${ep(o.planName || o.kind)}</b><small>${ep(u.name || '')} · 0${ep(o.uid)}</small></div>
      <div><b>৳${fa(o.price)}</b><small>${ep(o.payMethod || '')} → ${ep(o.toNumber || '-')}</small></div>
      <div><span class="mono">${ep(o.trxId)}</span><small>from 0${ep(o.sender)} </small></div>
      <div>${sb(o.status === 'Approved' ? 'Verified' : o.status === 'Rejected' ? 'Rejected' : 'Pending')}<small>${fd(o.createdAt)}</small></div>
      <div class="acts">${o.status === 'Pending' ? `<button class="ab ab-ok" title="Approve" onclick="odAct('${ep(o._id)}','approve')"><i class="fa-solid fa-check"></i></button><button class="ab ab-no" title="Reject" onclick="odAct('${ep(o._id)}','reject')"><i class="fa-solid fa-xmark"></i></button>` : `<small>${o.reason ? ep(o.reason) : ''}</small>`}</div></div>`;
  }).join('') : '<div class="hint">Nothing here.</div>';
}
async function odAct(id, op){
  const o = _ORD.find(x => x._id === id); if(!o) return;
  let reason = '';
  if(op === 'reject'){ reason = prompt('Reason (the user sees it):', 'We could not find this payment.'); if(reason === null) return; }
  else if(!confirm(`Approve ${o.planName} for 0${o.uid}? Check that ৳${o.price} with TrxID ${o.trxId} arrived first.`)) return;
  showL(true); const r = await window._accountApi('adminServiceOrder', { id, op, reason }); showL(false);
  if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; }
  await logAct(`${o.planName} ${op === 'approve' ? 'approved' : 'rejected'} for ${o.uid} (TrxID ${o.trxId})`, 'user', o.uid);
  toast(op === 'approve' ? 'Approved ✓' : 'Rejected', op === 'approve' ? 's' : 'e'); odLoad();
}

/* ═════════ VIP 72h queue ═════════ */
async function vqLoad(){
  const [users, apps] = await Promise.all([window._getDocs('users'), window._getDocs('applications')]);
  _D.users = users;
  const H = Number(_SV.vip.hours) || 72, now = Date.now();
  const vip = users.filter(u => u.vip && u.vip.plan && u.vip.active !== false && !['banned', 'suspended'].includes(u.status));
  const vipNow = vip.filter(u => !u.vip.until || new Date(u.vip.until) > new Date());
  const byUid = new Map(vip.map(u => [String(u.phone), u]));
  const done = ['Disbursed', 'Active', 'Repaid', 'Overdue'];
  const rows = apps.filter(a => byUid.has(String(a.uid)) && a.removed !== true && a.status !== 'Rejected').map(a => {
    const u = byUid.get(String(a.uid)), since = u.vip.since ? new Date(u.vip.since).getTime() : 0;
    const start = new Date(a.submittedAt || a.createdAt || 0).getTime();
    if(start < since) return null;   // applied before becoming VIP
    const due = start + H * 3600e3, sent = a.disbursedAt ? new Date(a.disbursedAt).getTime() : (done.includes(a.status) ? new Date(a.statusUpdatedAt || a.updatedAt || now).getTime() : 0);
    const late = sent ? sent > due : now > due;
    if(sent && !late) return null;   // delivered on time
    return { a, u, due, sent, late };
  }).filter(Boolean).sort((x, y) => x.due - y.due);
  const left = ms => { const h = Math.floor(Math.abs(ms) / 3600e3), m = Math.floor(Math.abs(ms) % 3600e3 / 60000); return `${h}h ${m}m`; };
  $p('vqList').innerHTML = rows.length ? rows.map(({ a, u, due, sent, late }) => {
    const refunded = a.vipRefund && a.vipRefund.at;
    return `<div class="vq-row ${late && !refunded ? 'late' : due - now < 12 * 3600e3 ? 'soon' : ''}"><div><b>${ep(a.name || u.name || '-')}</b><small>0${ep(a.uid)} · 👑 ${ep(u.vip.name || u.vip.plan)}</small></div>
      <div>৳${fa(a.loanAmount)}<small>${sb(a.status)}</small></div>
      <div>${sent ? 'Sent ' + fd(new Date(sent).toISOString()) : late ? `<span class="pro-bad">${left(now - due)} over time</span>` : `<span class="pro-warn">${left(due - now)} left</span>`}<small>deadline ${fd(new Date(due).toISOString())}</small></div>
      <div>${refunded ? `<span class="pro-ok">Refunded ৳${fa(a.vipRefund.amount)}</span><small>${fd(a.vipRefund.at)}</small>` : late ? `<span class="pro-bad">Refund due ৳${fa(u.vip.price || 0)}</span>` : '<span class="pro-note">On track</span>'}</div>
      <div class="acts"><button class="ab ab-v" title="Open application" onclick="gS('applications',document.getElementById('n-applications'));setTimeout(()=>window.viewApp&&viewApp('${ep(a._id)}'),700)"><i class="fa-solid fa-eye"></i></button>${late && !refunded ? `<button class="btn btn-sm btn-o" onclick="vqRefund('${ep(a._id)}',${Number(u.vip.price) || 0})">Mark refunded</button>` : ''}</div></div>`;
  }).join('') : '<div class="hint">No open VIP applications right now. 🎉</div>';
  $p('vqMembers').innerHTML = vipNow.length ? vipNow.map(u => `<div class="od-row" style="grid-template-columns:1.2fr 1fr 1fr 1fr"><div><b>${ep(u.name || '-')}</b><small>0${ep(u.phone)}</small></div><div>👑 ${ep(u.vip.name || u.vip.plan)}<small>৳${fa(u.vip.price || 0)}</small></div><div>Since ${fd(u.vip.since)}</div><div>${u.vip.until ? 'Until ' + fd(u.vip.until) : '<span class="pro-ok">Lifetime</span>'}</div></div>`).join('') : '<div class="hint">No active VIP members yet.</div>';
}
async function vqRefund(appId, price){
  const amt = prompt('Refund amount you sent (৳):', price || ''); if(amt === null) return;
  await window._updateDoc(appId, 'applications', { vipRefund: { at: new Date().toISOString(), amount: Number(amt) || 0 } });
  await logAct(`VIP refund ৳${amt} recorded for application ${appId.slice(-6)}`, 'application', appId);
  toast('Refund recorded ✓'); vqLoad();
}

/* ═════════ codes ═════════ */
function cdKind(){ const k = val('cd-kind'); document.querySelectorAll('.cd-promo').forEach(e => e.style.display = k === 'promo' ? '' : 'none'); $p('cd-vlbl').textContent = k === 'promo' ? 'Discount' : 'Balance to add (৳)'; if(k === 'voucher'){ $p('cd-uses').value = 1; $p('cd-per').value = 1; } }
const rndCode = (pre, n = 8) => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const b = new Uint32Array(n); crypto.getRandomValues(b); return (pre ? pre + '-' : '') + [...b].map(x => a[x % a.length]).join(''); };
async function cdCreate(){
  const kind = val('cd-kind'), value = Number(val('cd-value')), count = Math.min(200, Math.max(1, Number(val('cd-count')) || 1));
  if(!(value > 0)){ toast('Enter the discount or amount', 'w'); return; }
  if(kind === 'promo' && val('cd-type') === 'percent' && value > 100){ toast('Percent must be 100 or less', 'w'); return; }
  const base = { kind, value, on: true, uses: 0, maxUses: kind === 'voucher' ? 1 : Math.max(0, Number(val('cd-uses')) || 0), perUser: Math.max(1, Number(val('cd-per')) || 1),
    start: val('cd-start') ? new Date(val('cd-start') + 'T00:00:00+06:00').toISOString() : '', end: val('cd-end') ? new Date(val('cd-end') + 'T23:59:59+06:00').toISOString() : '',
    audience: val('cd-aud') || 'all', label: val('cd-label'), note: val('cd-note'), createdAt: new Date().toISOString(), createdBy: 'admin' };
  if(kind === 'promo'){ base.type = val('cd-type') || 'flat'; base.maxDiscount = Math.max(0, Number(val('cd-max')) || 0); base.minLoan = Math.max(0, Number(val('cd-min')) || 0); }
  const own = val('cd-code').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const pre = val('cd-prefix').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const codes = count === 1 && own ? [own] : Array.from({ length: count }, () => rndCode(pre || (kind === 'voucher' ? 'GIFT' : '')));
  if(codes.some(c => c.length < 3)){ toast('Code must be at least 3 letters', 'w'); return; }
  showL(true);
  try{
    for(const c of codes){ const ex = await window._getDoc('promoCodes', c); if(ex){ throw new Error(`Code ${c} already exists`); } }
    for(const c of codes) await window._setDoc('promoCodes', c, { ...base, code: c });
    await logAct(`${codes.length} ${kind} code${codes.length > 1 ? 's' : ''} created (${codes.slice(0, 3).join(', ')}${codes.length > 3 ? '…' : ''})`, 'config', 'codes');
    $p('cdNew').innerHTML = `<div class="pro-note"><b class="pro-ok">${codes.length} code${codes.length > 1 ? 's' : ''} created:</b> <span style="font-family:monospace">${codes.map(ep).join(', ')}</span> <button class="btn btn-sm btn-s ro-ok" onclick="navigator.clipboard.writeText('${codes.join('\\n')}').then(()=>toast('Copied'))"><i class="fa-solid fa-copy"></i>Copy all</button></div>`;
    toast('Created ✓'); $p('cd-code').value = ''; cdLoad();
  }catch(e){ toast(e.message, 'e'); }
  showL(false);
}
async function cdLoad(){
  const [c, u] = await Promise.all([window._getDocs('promoCodes'), window._getDocs('promoUses')]);
  _CODES = c.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); _USES = u; cdRender();
}
function cdRender(){
  const f = $p('cdFilter') ? $p('cdFilter').value : '', q = ($p('cdSearch') ? $p('cdSearch').value : '').toUpperCase();
  const L = _CODES.filter(x => (!f || x.kind === f) && (!q || String(x.code).includes(q) || String(x.note || '').toUpperCase().includes(q)));
  const now = Date.now();
  $p('cdList').innerHTML = L.length ? L.slice(0, 300).map(x => {
    const exp = x.end && new Date(x.end).getTime() < now, full = Number(x.maxUses) > 0 && (Number(x.uses) || 0) >= Number(x.maxUses);
    const what = x.kind === 'promo' ? (x.type === 'percent' ? `${x.value}% off${x.maxDiscount ? ' (max ৳' + fa(x.maxDiscount) + ')' : ''}` : `৳${fa(x.value)} off`) : `+৳${fa(x.value)} balance`;
    const used = _USES.filter(u => u.code === x.code);
    return `<div class="cd-row ${x.on === false || exp || full ? 'off' : ''}"><label class="tog" title="On / off"><input type="checkbox" ${x.on !== false ? 'checked' : ''} onchange="cdToggle('${ep(x.code)}',this.checked)"><span class="tog-sl"></span></label>
      <div><span class="c">${ep(x.code)}</span> <span class="cd-k ${ep(x.kind)}">${ep(x.kind)}</span><small style="display:block;color:var(--txt2);font-size:11px">${ep(x.note || x.label || (x.createdBy && x.createdBy !== 'admin' ? 'sent by 0' + x.createdBy : ''))}</small></div>
      <div>${what}</div><div>${fa(x.uses || 0)} / ${Number(x.maxUses) > 0 ? fa(x.maxUses) : '∞'} used<small style="display:block;color:var(--txt2);font-size:11px">${x.perUser > 1 ? x.perUser + ' per user' : '1 per user'}</small></div>
      <div style="font-size:11.5px">${{ all: 'Everyone', new: 'New customers', vip: 'VIP only', verified: 'Verified only' }[x.audience || 'all']}${x.minLoan ? '<br>min loan ৳' + fa(x.minLoan) : ''}</div>
      <div style="font-size:11.5px">${x.start ? fd(x.start) : 'now'} →<br>${x.end ? (exp ? '<span class="pro-bad">expired ' + fd(x.end) + '</span>' : fd(x.end)) : 'no end'}</div>
      <div class="acts"><button class="ab ab-v" title="Who used it" onclick="cdUses('${ep(x.code)}')"><i class="fa-solid fa-list"></i></button><button class="ab ab-d" title="Delete" onclick="cdDel('${ep(x.code)}')"><i class="fa-solid fa-trash"></i></button></div></div>
      <div id="cdu-${ep(x.code)}"></div>`;
  }).join('') : '<div class="hint">No codes yet.</div>';
}
async function cdToggle(code, on){ await window._setDoc('promoCodes', code, { on }); const x = _CODES.find(c => c.code === code); if(x) x.on = on; await logAct(`Code ${code} switched ${on ? 'on' : 'off'}`, 'config', 'codes'); toast(on ? 'Code on' : 'Code off'); cdRender(); }
function cdDel(code){ confirm2(`Delete code ${code}? Users can no longer use it. Past uses stay in the history.`, async () => { await window._deleteDoc(code, 'promoCodes'); await logAct(`Code ${code} deleted`, 'config', 'codes'); toast('Deleted', 'e'); cdLoad(); }); }
function cdUses(code){
  const el = $p('cdu-' + code); if(!el) return; if(el.innerHTML){ el.innerHTML = ''; return; }
  const L = _USES.filter(u => u.code === code).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  el.innerHTML = `<div class="pro-note" style="margin:-2px 0 8px 40px">${L.length ? L.map(u => `0${ep(u.uid)} · ${u.kind === 'promo' ? '−' : '+'}৳${fa(u.amount)}${u.appId ? ' · app ' + ep(String(u.appId).slice(-6).toUpperCase()) : ''} · ${fd(u.at)}`).join('<br>') : 'Not used yet.'}</div>`;
}

/* ═════════ settings editors ═════════ */
const rowIn = (path, i, f, v, ph, extra = '') => `<input value="${ep(v ?? '')}" placeholder="${ph}" oninput="svEdit('${path}',${i},'${f}',this.value)" ${extra}>`;
function svEdit(path, i, f, v){ const L = path.split('.').reduce((o, k) => o[k], _SV); if(!L[i]) return; if(f === null) L[i] = v; else L[i][f] = ['price', 'days', 'value', 'weight'].includes(f) ? Number(v) || 0 : v; markDirty('services', path); if(path === 'spin.prizes') spCost(); }
function svDel(path, i, re){ const L = path.split('.').reduce((o, k) => o[k], _SV); L.splice(i, 1); markDirty('services', path); window[re](); }
function vpRender(){
  $p('vpPlans').innerHTML = _SV.vip.plans.map((p, i) => `<div class="pl-row"><label class="tog" title="Sell this plan"><input type="checkbox" ${p.on !== false ? 'checked' : ''} onchange="svEdit('vip.plans',${i},'on',this.checked)"><span class="tog-sl"></span></label>
    ${rowIn('vip.plans', i, 'name', p.name, 'Plan name', 'maxlength="30"')}${rowIn('vip.plans', i, 'price', p.price, 'Price ৳', 'type="number" min="0"')}${rowIn('vip.plans', i, 'days', p.days, 'Days (0 = lifetime)', 'type="number" min="0"')}
    <select onchange="svEdit('vip.plans',${i},'color',this.value)">${[['gold', 'Gold card'], ['violet', 'Violet card'], ['black', 'Black premium card']].map(([v, l]) => `<option value="${v}" ${p.color === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <button class="ab ab-d" onclick="svDel('vip.plans',${i},'vpRender')"><i class="fa-solid fa-trash"></i></button></div>`).join('');
  const lst = (k, re) => _SV.vip[k].map((t, i) => `<div class="lst-row">${rowIn('vip.' + k, i, null, t, 'Text', 'maxlength="160"')}<button class="ab ab-d" onclick="svDel('vip.${k}',${i},'vpRender')"><i class="fa-solid fa-trash"></i></button></div>`).join('') + `<button class="btn btn-sm btn-s" onclick="_SV.vip.${k}.push('');markDirty('services','vp');vpRender()"><i class="fa-solid fa-plus"></i>Add line</button>`;
  $p('vpPerks').innerHTML = lst('perks'); $p('vpTerms').innerHTML = lst('terms');
}
function ckRender(){ $p('ckDays').innerHTML = _SV.checkin.rewards.map((v, i) => `<div class="fg"><label>Day ${i + 1}</label><input type="number" min="0" value="${Number(v) || 0}" oninput="_SV.checkin.rewards[${i}]=Number(this.value)||0;markDirty('services','ck');ckCost()"></div>`).join(''); ckCost(); }
function ckCost(){ const t = _SV.checkin.rewards.reduce((a, v) => a + (Number(v) || 0), 0); $p('ckCost').innerHTML = `A user who checks in every day gets <b>৳${fa(t)}</b> per week (≈ ৳${fa(Math.round(t / 7 * 30))} a month).`; }
function spRender(){
  $p('spList').innerHTML = _SV.spin.prizes.map((p, i) => `<div class="pz-row">${rowIn('spin.prizes', i, 'label', p.label, 'Label on the wheel', 'maxlength="16"')}
    <select onchange="svEdit('spin.prizes',${i},'type',this.value)">${[['balance', 'Balance ৳'], ['none', 'No prize'], ['gift', 'Gift (you hand over)']].map(([v, l]) => `<option value="${v}" ${p.type === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    ${rowIn('spin.prizes', i, 'value', p.value, 'Value', 'type="number" min="0"')}${rowIn('spin.prizes', i, 'weight', p.weight, 'Weight', 'type="number" min="0" step="0.1"')}
    <input type="color" value="${ep(p.color || '#1ddb80')}" oninput="svEdit('spin.prizes',${i},'color',this.value)" style="padding:2px">
    <span class="pro-note" id="spc-${i}"></span>
    <button class="ab ab-d" onclick="svDel('spin.prizes',${i},'spRender')"><i class="fa-solid fa-trash"></i></button></div>`).join('');
  spCost();
}
function spCost(){
  const P = _SV.spin.prizes, tot = P.reduce((a, p) => a + (Number(p.weight) || 0), 0) || 1;
  P.forEach((p, i) => { const e = $p('spc-' + i); if(e) e.textContent = ((Number(p.weight) || 0) / tot * 100).toFixed(1) + '%'; });
  const avg = P.reduce((a, p) => a + (p.type === 'balance' ? (Number(p.value) || 0) * (Number(p.weight) || 0) / tot : 0), 0);
  $p('spCost').innerHTML = `Average cost per spin: <b>৳${avg.toFixed(1)}</b>. With 1,000 spins ≈ ৳${fa(Math.round(avg * 1000))}.`;
}
function trRender(){ $p('trLv').innerHTML = _SV.loans.trust.levels.map((l, i) => `<div class="pl-row" style="grid-template-columns:1fr .6fr 2fr"><input value="${ep(l.name)}" placeholder="Level name" oninput="_SV.loans.trust.levels[${i}].name=this.value;markDirty('services','tr')"><input type="number" min="0" max="100" value="${Number(l.min) || 0}" placeholder="From score" oninput="_SV.loans.trust.levels[${i}].min=Number(this.value)||0;markDirty('services','tr')"><input value="${ep(l.perk || '')}" placeholder="What this level gets" oninput="_SV.loans.trust.levels[${i}].perk=this.value;markDirty('services','tr')"></div>`).join(''); }
// Help & Info list editors
const HE = {
  tips: { list: () => _SV.tips, fields: [['title', 'Title', 2], ['text', 'Text', 4], ['icon', 'Icon (e.g. lightbulb)', 1.4], ['go', 'Opens (service key)', 1.2], ['btn', 'Button text', 1.2]], add: { on: true, title: '', text: '', icon: 'lightbulb', go: '', btn: '' } },
  sponsors: { list: () => _SV.sponsors, fields: [['name', 'Name', 1.4], ['url', 'https://link', 2], ['logo', 'Logo URL (optional)', 1.8], ['desc', 'Short description', 2.4], ['tag', 'Tag', .8]], add: { on: true, name: '', url: '', logo: '', desc: '', tag: 'Sponsored' } },
  faq: { list: () => _SV.help.faq, fields: [['cat', 'Category', 1], ['q', 'Question', 2.4], ['a', 'Answer', 4]], add: { cat: 'General', q: '', a: '' } },
  offices: { list: () => _SV.help.offices, fields: [['name', 'Office name', 1.3], ['address', 'Address', 2.4], ['phone', 'Phone', 1.1], ['hours', 'Hours', 1.3], ['map', 'Map link (optional)', 1.6]], add: { on: true, name: '', address: '', phone: '', hours: '', map: '' } }
};
function heRender(k){
  const D = HE[k], L = D.list(), el = $p('he-' + k); if(!el) return;
  const cols = (D.add.on !== undefined ? 'auto ' : '') + D.fields.map(f => f[2] + 'fr').join(' ') + ' auto';
  el.innerHTML = L.length ? L.map((x, i) => `<div class="pl-row" style="grid-template-columns:${cols}">${D.add.on !== undefined ? `<label class="tog" title="Show"><input type="checkbox" ${x.on !== false ? 'checked' : ''} onchange="heSet('${k}',${i},'on',this.checked)"><span class="tog-sl"></span></label>` : ''}
    ${D.fields.map(([f, ph]) => `<input value="${ep(x[f] ?? '')}" placeholder="${ep(ph)}" oninput="heSet('${k}',${i},'${f}',this.value)">`).join('')}
    <button class="ab ab-d" onclick="heDel('${k}',${i})"><i class="fa-solid fa-trash"></i></button></div>`).join('') : '<div class="hint">Nothing yet.</div>';
}
function heAdd(k){ HE[k].list().push(clone(HE[k].add)); markDirty('services', 'he' + k); heRender(k); }
function heSet(k, i, f, v){ const L = HE[k].list(); if(L[i]) L[i][f] = v; markDirty('services', 'he' + k); }
function heDel(k, i){ HE[k].list().splice(i, 1); markDirty('services', 'he' + k); heRender(k); }
const lines = id => val(id).split('\n').map(t => t.trim()).filter(Boolean);
async function cbLoad(){
  const L = (await window._getDocs('callbacks')).sort((a, b) => (a.status === 'Open' ? 0 : 1) - (b.status === 'Open' ? 0 : 1) || String(b.createdAt).localeCompare(String(a.createdAt)));
  const el = $p('cbList'); if(!el) return;
  el.innerHTML = L.length ? L.slice(0, 100).map(c => `<div class="od-row" style="grid-template-columns:1.1fr 1fr 1.4fr .8fr auto"><div><b>${ep(c.name || '-')}</b><small>0${ep(c.phone)}</small></div><div>${ep(c.topic)}<small>${ep(c.slot)}</small></div><div><small style="margin:0">${ep(c.note || '')}</small></div>
    <div>${c.status === 'Open' ? '<span class="pro-warn">Waiting</span>' : '<span class="pro-ok">Called</span>'}<small>${fd(c.createdAt)}</small></div>
    <div class="acts"><a class="ab ab-v" href="tel:0${ep(c.phone)}" title="Call"><i class="fa-solid fa-phone"></i></a>${c.status === 'Open' ? `<button class="ab ab-ok" title="Mark called" onclick="cbDone('${ep(c._id)}')"><i class="fa-solid fa-check"></i></button>` : ''}</div></div>`).join('') : '<div class="hint">No call-back requests yet.</div>';
  const n = L.filter(c => c.status === 'Open').length; const b = $p('nb-svc'); if(b && n){ b.title = n + ' call-back request(s)'; }
}
async function cbDone(id){ await window._updateDoc(id, 'callbacks', { status: 'Done', doneAt: new Date().toISOString() }); await logAct('Call-back request marked as called', 'user', id); toast('Marked as called ✓'); cbLoad(); }
function hbRender(){
  const H = _SV.hub, home = H.home || [];
  const order = [...home.filter(k => k !== 'all'), ...SV_TILES.map(t => t[0]).filter(k => !home.includes(k))];
  $p('hbList').innerHTML = order.map((k, i) => { const name = (SV_TILES.find(t => t[0] === k) || [k, k])[1], c = (H.tiles || {})[k] || {};
    return `<div class="tl-row2"><label class="tog" title="Show"><input type="checkbox" ${c.on !== false ? 'checked' : ''} onchange="hbSet('${k}','on',this.checked)"><span class="tog-sl"></span></label>
      <div><b>${ep(name)}</b> <input value="${ep(c.label || '')}" placeholder="Own name (optional)" oninput="hbSet('${k}','label',this.value)" style="margin-top:4px"></div>
      <label class="hp-sw" style="font-size:12px"><input type="checkbox" ${home.includes(k) ? 'checked' : ''} onchange="hbHome('${k}',this.checked)"> Home</label>
      <input value="${ep(c.badge ?? '')}" placeholder="Badge" maxlength="6" oninput="hbSet('${k}','badge',this.value)">
      <div style="display:flex;gap:4px"><button class="ab ab-v" onclick="hbMove('${k}',-1)"><i class="fa-solid fa-arrow-up"></i></button><button class="ab ab-v" onclick="hbMove('${k}',1)"><i class="fa-solid fa-arrow-down"></i></button></div></div>`; }).join('');
}
function hbSet(k, f, v){ _SV.hub.tiles = _SV.hub.tiles || {}; _SV.hub.tiles[k] = { ...(_SV.hub.tiles[k] || {}), [f]: v }; markDirty('services', 'hub'); }
function hbHome(k, on){ let h = (_SV.hub.home || []).filter(x => x !== 'all' && x !== k); if(on){ if(h.length >= 6){ toast('Up to 6 tiles on the home page (Language and All Services are always last)', 'w'); hbRender(); return; } h.push(k); } _SV.hub.home = [...h, 'all']; markDirty('services', 'hub'); hbRender(); }
function hbMove(k, d){ const h = (_SV.hub.home || []).filter(x => x !== 'all'); const i = h.indexOf(k), j = i + d; if(i < 0 || j < 0 || j >= h.length) return; [h[i], h[j]] = [h[j], h[i]]; _SV.hub.home = [...h, 'all']; markDirty('services', 'hub'); hbRender(); }

/* ═════════ load / save ═════════ */
async function loadSvc(){
  buildSvc();
  const d = (await window._getDoc('siteConfig', 'services')) || {};
  _SV = clone(SVD);
  ['vip', 'verify', 'checkin', 'spin', 'voucher', 'codes', 'bonus', 'hub'].forEach(k => Object.assign(_SV[k], d[k] || {}));
  _SV.tips = Array.isArray(d.tips) ? clone(d.tips) : []; _SV.sponsors = Array.isArray(d.sponsors) ? clone(d.sponsors) : [];
  const Hd = d.help || {}; _SV.help = { useSeoFaq: Hd.useSeoFaq !== false, faq: clone(Hd.faq || []), feesNote: Hd.feesNote || '', safety: { numbers: clone((Hd.safety || {}).numbers || []), tips: clone((Hd.safety || {}).tips || []) }, offices: clone(Hd.offices || []), callback: { on: true, text: '', topics: [], slots: [], ...(Hd.callback || {}) } };
  if(!Array.isArray(_SV.vip.plans) || !_SV.vip.plans.length) _SV.vip.plans = clone(SVD.vip.plans);
  ['perks', 'terms'].forEach(k => { if(!Array.isArray(_SV.vip[k])) _SV.vip[k] = clone(SVD.vip[k]); });
  _SV.checkin.rewards = Array.from({ length: 7 }, (_, i) => Number((_SV.checkin.rewards || [])[i]) || 0);
  if(!Array.isArray(_SV.hub.home) || !_SV.hub.home.length) _SV.hub.home = clone(SVD.hub.home);
  const Ld = d.loans || {}; _SV.loans = { ...clone(SVD.loans), ...Ld, pay: { ...SVD.loans.pay, ...(Ld.pay || {}) }, payoff: { ...SVD.loans.payoff, ...(Ld.payoff || {}) }, limit: { ...SVD.loans.limit, ...(Ld.limit || {}) },
    trust: { ...SVD.loans.trust, ...(Ld.trust || {}), levels: clone(Ld.trust && Array.isArray(Ld.trust.levels) && Ld.trust.levels.length ? Ld.trust.levels : SVD.loans.trust.levels) }, budget: { ...SVD.loans.budget, ...(Ld.budget || {}) } };
  const LL = _SV.loans;
  fillIn({ 'ln-mode': LL.emiMode || 'principal', 'ln-pay': LL.pay.on !== false, 'ln-po': LL.payoff.on !== false, 'ln-pod': LL.payoff.discountPct, 'ln-pof': LL.payoff.fee,
    'lm-on': LL.limit.on !== false, 'lm-enf': LL.limit.enforce === true, 'lm-start': LL.limit.start, 'lm-step': LL.limit.step, 'lm-vf': LL.limit.verifiedBonus, 'lm-vip': LL.limit.vipBonus, 'lm-max': LL.limit.max, 'bd-pct': LL.budget.safePct });
  trRender(); ['tips', 'sponsors', 'faq', 'offices'].forEach(heRender);
  fillIn({ 'hp-seofaq': _SV.help.useSeoFaq, 'hp-feesnote': _SV.help.feesNote, 'hp-safetips': _SV.help.safety.tips.join('\n'), 'hp-nums': _SV.help.safety.numbers.map(n => `${n.label || ''} | ${n.number}`).join('\n'),
    'cb-on': _SV.help.callback.on !== false, 'cb-text': _SV.help.callback.text, 'cb-topics': (_SV.help.callback.topics || []).join('\n'), 'cb-slots': (_SV.help.callback.slots || []).join('\n') });
  if($p('cd-kind')) $p('cd-kind').value = 'redeem';
  fillIn({ 'vp-on': _SV.vip.on !== false, 'vp-hours': _SV.vip.hours, 'vp-normal': _SV.vip.normal, 'vf-on': _SV.verify.on !== false, 'vf-price': _SV.verify.price, 'vf-title': _SV.verify.title, 'vf-text': _SV.verify.text,
    'ck-on': _SV.checkin.on !== false, 'sp-on': _SV.spin.on !== false, 'sp-period': _SV.spin.period || 'month', 'vc-on': _SV.voucher.on !== false, 'vc-min': _SV.voucher.min, 'vc-max': _SV.voucher.max, 'vc-days': _SV.voucher.days,
    'cd-promo-on': _SV.codes.promo !== false, 'cd-redeem-on': _SV.codes.redeem !== false, 'bn-reqv': _SV.bonus.requireVerified !== false });
  vpRender(); ckRender(); spRender(); hbRender(); cdKind();
  proTabStart('services', 'orders');
  afterLoad('services');
  odLoad(); cdLoad(); vqLoad(); cbLoad();
}
async function saveSvc(){
  const plans = _SV.vip.plans.filter(p => String(p.name || '').trim()).map(p => ({ ...p, id: p.id || 'p' + hid(), price: Math.max(0, Math.round(Number(p.price) || 0)), days: Math.max(0, Math.round(Number(p.days) || 0)) }));
  if(!plans.length) throw new Error('Keep at least one VIP plan');
  if(_SV.spin.prizes.some(p => !String(p.label || '').trim())) throw new Error('Every spin prize needs a label');
  const data = {
    vip: { on: chk('vp-on'), hours: numv('vp-hours', 72, 1, 720), normal: val('vp-normal') || '7–15 days', plans, perks: _SV.vip.perks.map(t => String(t).trim()).filter(Boolean), terms: _SV.vip.terms.map(t => String(t).trim()).filter(Boolean) },
    verify: { on: chk('vf-on'), price: numv('vf-price', 100, 0, 100000), title: val('vf-title') || SVD.verify.title, text: val('vf-text') || SVD.verify.text },
    checkin: { on: chk('ck-on'), rewards: _SV.checkin.rewards.map(v => Math.max(0, Math.round(Number(v) || 0))) },
    spin: { on: chk('sp-on'), period: val('sp-period') || 'month', prizes: _SV.spin.prizes.map(p => ({ id: p.id || 'p' + hid(), label: String(p.label).trim().slice(0, 16), type: p.type || 'balance', value: Math.max(0, Math.round(Number(p.value) || 0)), weight: Math.max(0, Number(p.weight) || 0), color: p.color || '#1ddb80' })) },
    voucher: { on: chk('vc-on'), min: numv('vc-min', 50, 1, 1e6), max: numv('vc-max', 1000, 1, 1e6), days: numv('vc-days', 30, 1, 365) },
    codes: { promo: false, redeem: chk('cd-redeem-on') },
    bonus: { requireVerified: chk('bn-reqv') },
    hub: { home: _SV.hub.home, tiles: _SV.hub.tiles || {} },
    loans: { emiMode: val('ln-mode') || 'principal', pay: { on: chk('ln-pay') }, payoff: { on: chk('ln-po'), discountPct: numv('ln-pod', 0, 0, 100), fee: numv('ln-pof', 0, 0, 1e6) },
      limit: { on: chk('lm-on'), enforce: chk('lm-enf'), start: numv('lm-start', 20000, 0, 1e8), step: numv('lm-step', 10000, 0, 1e8), verifiedBonus: numv('lm-vf', 5000, 0, 1e8), vipBonus: numv('lm-vip', 10000, 0, 1e8), max: numv('lm-max', 0, 0, 1e9) },
      trust: { on: true, levels: _SV.loans.trust.levels.filter(l => String(l.name || '').trim()).map(l => ({ name: String(l.name).trim().slice(0, 20), min: Math.max(0, Math.min(100, Number(l.min) || 0)), perk: String(l.perk || '').slice(0, 120) })).sort((a, b) => a.min - b.min) },
      budget: { safePct: numv('bd-pct', 40, 10, 80) }, statement: { on: true } },
    updatedAt: new Date().toISOString()
  };
  if(data.voucher.min > data.voucher.max) throw new Error('The smallest voucher is bigger than the largest');
  const clean = (L, req) => L.filter(x => String(x[req] || '').trim()).map(x => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, typeof v === 'string' ? v.trim().slice(0, 600) : v])));
  if(_SV.sponsors.some(x => String(x.name || '').trim() && !/^https?:\/\//i.test(String(x.url || '').trim()))) throw new Error('Every partner site needs a link starting with https://');
  data.tips = clean(_SV.tips, 'title'); data.sponsors = clean(_SV.sponsors, 'name');
  data.help = { useSeoFaq: chk('hp-seofaq'), faq: clean(_SV.help.faq, 'q').filter(f => f.a), feesNote: val('hp-feesnote'),
    safety: { tips: lines('hp-safetips'), numbers: lines('hp-nums').map(l => { const [a, b] = l.includes('|') ? l.split('|') : ['Official', l]; return { label: a.trim().slice(0, 40), number: String(b || '').trim().slice(0, 30) }; }).filter(n => n.number) },
    offices: clean(_SV.help.offices, 'name'), callback: { on: chk('cb-on'), text: val('cb-text'), topics: lines('cb-topics'), slots: lines('cb-slots') } };
  await window._setDoc('siteConfig', 'services', data);
  await logAct('Services & Rewards saved', 'config', 'services');
}
window._SAVERS.services = { load: loadSvc, save: saveSvc, data: () => ({ 'VIP › Plans': _SV.vip.plans, 'Spin › Prizes': _SV.spin.prizes, 'Home tiles': _SV.hub.home }) };
// the pending-orders counter on the menu, shortly after login
setTimeout(function tick(){ if(window._db && (window._perm || {}).services !== 'none') window._getDocs('serviceOrders').then(o => { const n = o.filter(x => x.status === 'Pending').length; const b = $p('nb-svc'); if(b){ b.textContent = n; b.style.display = n ? '' : 'none'; } }).catch(() => {}); else setTimeout(tick, 4000); }, 5000);
