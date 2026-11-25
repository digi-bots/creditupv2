/* Creditfy admin — Services & Rewards: VIP / verification orders, the VIP 72-hour queue, promo · redeem · voucher codes,
   VIP plans, the verified badge, daily check-in, spin & win, gift vouchers and the Quick Services tiles.
   Settings live in siteConfig/services and use the normal save bar; orders and codes are saved straight away. */

(function(){
  const css = `
.sv-st{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}
.sv-k{border-radius:12px;border:1px solid var(--border);background:var(--card);padding:12px}
.sv-k b{display:block;font-size:20px;font-weight:900}.sv-k span{font-size:11px;color:var(--txt2)}
.ir-t{width:100%;border-collapse:collapse;font-size:12px;min-width:860px}.ir-t th{text-align:left;font-size:10.5px;color:var(--txt2);padding:7px 8px;border-bottom:1px solid var(--border);white-space:nowrap}.ir-t td{padding:7px 8px;border-bottom:1px solid rgba(255,255,255,.05);white-space:nowrap}.ir-t small{color:var(--txt2)}
.bk-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:4px 0 10px;font-size:12.5px}.bk-bar label{display:inline-flex;gap:6px;align-items:center;font-weight:700}.bk-bar span{color:var(--txt2);margin-right:auto}
.bk-ck{width:17px;height:17px;accent-color:var(--p);cursor:pointer}.bk-sp{width:17px}
.od-row{display:grid;grid-template-columns:22px 1.1fr 1fr 1fr .9fr auto;gap:10px;align-items:center;padding:11px;border-radius:11px;border:1px solid var(--border);background:rgba(255,255,255,.02);margin-bottom:7px;font-size:12.5px}
.od-row small{display:block;color:var(--txt2);font-size:11px;margin-top:2px}
.od-row .mono{font-family:monospace}
@media(max-width:900px){.od-row{grid-template-columns:22px 1fr 1fr}}
.cd-row{display:grid;grid-template-columns:auto 1.1fr .8fr .9fr 1fr 1fr auto;gap:8px;align-items:center;padding:9px 10px;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,.02);margin-bottom:6px;font-size:12.5px}
.cd-row.off{opacity:.5}.cd-row .c{font-family:monospace;font-weight:800;letter-spacing:.5px}
.cd-k{font-size:10px;font-weight:900;padding:2px 7px;border-radius:7px;text-transform:uppercase}
.cd-k.promo{background:rgba(168,85,247,.15);color:#c085ff}.cd-k.deposit{background:rgba(255,215,106,.15);color:#ffd76a}.cd-k.redeem{background:rgba(29,219,128,.14);color:var(--p)}.cd-k.voucher{background:rgba(255,77,106,.14);color:#ff8fa3}
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
  hub: { home: ['vip', 'checkin', 'spin', 'wallet', 'recharge', 'calc', 'refer', 'history', 'all'], tiles: {} }
};
const SV_TILES = [['vip', 'VIP Express'], ['verify', 'Verify Number'], ['checkin', 'Daily Check-in'], ['spin', 'Spin & Win'], ['wallet', 'Wallet'], ['redeem', 'Redeem Code'], ['voucher', 'Gift Voucher'],
  ['recharge', 'Mobile Recharge'], ['telegram', 'Telegram'], ['calc', 'Calculator'], ['refer', 'Refer & Earn'], ['history', 'History'], ['profile', 'Profile'],
  ['loans', 'My Loans'], ['repay', 'Pay Installment'], ['payoff', 'Early Payoff'], ['limit', 'Loan Limit'], ['trust', 'Trust Level'], ['statement', 'Statement (PDF)'], ['budget', 'Budget Planner'], ['compare', 'EMI Compare'],
  ['tips', 'Smart Tips'], ['sponsors', 'Partners & Sites'], ['faq', 'Help Center'], ['fees', 'Fees Explained'], ['safety', 'Stay Safe'], ['callback', 'Call Me Back'], ['terms', 'Loan Terms'], ['offices', 'Our Offices']];
let _SV = clone(SVD), _ORD = [], _CODES = [], _USES = [];

function buildSvc(){
  const s = $p('sec-services'); if(!s || s.dataset.built) return; s.dataset.built = 1;
  s.innerHTML = `<div class="sec-head"><h2>Services &amp; Rewards</h2>${svBtn('services')}</div>${roBanner}
  ${proTabs('services', [['orders', 'receipt', 'Orders'], ['vipq', 'stopwatch', 'VIP 72h queue'], ['codes', 'ticket', 'Promo & Redeem codes'], ['vip', 'crown', 'VIP plans'], ['verify', 'circle-check', 'Verified badge'], ['rewards', 'gift', 'Check-in · Spin · Voucher'], ['loans', 'hand-holding-dollar', 'Loan tools'], ['help', 'circle-question', 'Help & Info'], ['hub', 'grip', 'Quick Services tiles'], ['extra', 'store', 'Extra services'], ['jobs', 'briefcase', 'Micro jobs'], ['report', 'chart-line', 'Income report']], 'orders')}
  <div class="pro-pane" data-k="help">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-file-contract"></i>Loan Terms page (Quick Services → Loan Terms)</div>
      <div class="hint" style="margin-bottom:8px">Amounts, terms, fees, interest and the yearly cost are taken from Site Config automatically. Write the parts below in your own words (empty = a clear default text).</div>
      <div class="fgrid">${area('ht-repay', 'Repayment', '', 2)}${area('ht-late', 'Late payment (what happens, any late fee)', '', 3)}${area('ht-complaint', 'How to complain / get help', '', 3)}${area('ht-extra', 'Anything else (optional)', '', 2)}</div></div>
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
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-receipt"></i>Orders — VIP, verification &amp; extra services
      <select id="odFilter" onchange="odRender()" style="margin-left:auto;height:32px;border-radius:8px;background:var(--card);color:var(--txt);border:1px solid var(--border)"><option value="Pending">Waiting for check</option><option value="Processing">In progress (extra)</option><option value="Delivered">Delivered (extra)</option><option value="all">All</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select>
      <button class="btn btn-sm btn-s ro-ok" onclick="odLoad()"><i class="fa-solid fa-rotate-right"></i></button></div>
      <div class="bk-bar" id="odBulk"><label><input type="checkbox" id="odAll" onchange="odSelAll(this.checked)"> Select all</label><span id="odSelN">0 selected</span>
        <button class="btn btn-sm btn-p ro-ok" onclick="odBulk('approve')"><i class="fa-solid fa-check-double"></i>Approve selected</button><button class="btn btn-sm btn-s ro-ok" onclick="odBulk('process')" title="Extra orders: payment checked"><i class="fa-solid fa-hourglass-half"></i>Payment OK</button><button class="btn btn-sm btn-d ro-ok" onclick="odBulk('reject')"><i class="fa-solid fa-xmark"></i>Reject selected</button></div>
      <div id="odList"></div>
      <div class="hint" style="margin-top:6px">Find the payment in your bKash / Nagad app (amount, TrxID, sender number), then Approve. For verification any sender number is fine — check the ৳ amount and TrxID. Approving VIP switches it on at once and starts the plan's days. Verification needs only the TrxID — check the ৳ amount in your wallet app.</div>
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
        <div class="fg"><label>Kind</label><select id="cd-kind" onchange="cdKind()"><option value="redeem">Redeem — adds balance</option><option value="voucher">Gift voucher — adds balance, single use</option><option value="deposit">Deposit coupon — extra bonus on an Extra Balance deposit</option></select></div>
        <div class="fg"><label>Code (empty = random)</label><input id="cd-code" maxlength="24" placeholder="e.g. EID50" style="text-transform:uppercase"></div>
        <div class="fg cd-promo"><label>Discount type</label><select id="cd-type"><option value="flat">Fixed taka (৳)</option><option value="percent">Percent of the fee (%)</option></select></div>
        <div class="fg cd-dep" style="display:none"><label>Bonus type</label><select id="cd-dtype"><option value="percent">Percent of the deposit (%)</option><option value="flat">Fixed taka (৳)</option></select></div>
        <div class="fg cd-dep" style="display:none"><label>Max bonus ৳ (for %, 0 = no limit)</label><input id="cd-dmax" type="number" min="0" placeholder="200"></div>
        <div class="fg cd-dep" style="display:none"><label>Minimum deposit ৳</label><input id="cd-dmin" type="number" min="0" placeholder="500"></div>
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
  </div>
  <div class="pro-pane" data-k="report">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-chart-line"></i>Income report <select id="irMonths" data-nodirty="1" onchange="irRender()" style="margin-left:auto;height:30px;border-radius:8px;background:var(--card);color:var(--txt);border:1px solid var(--border)"><option value="3">Last 3 months</option><option value="6" selected>Last 6 months</option><option value="12">Last 12 months</option></select>
      <button class="btn btn-sm btn-s ro-ok" onclick="irLoad()"><i class="fa-solid fa-rotate-right"></i>Load</button><button class="btn btn-sm btn-p ro-ok" onclick="irCsv()"><i class="fa-solid fa-file-csv"></i>Download CSV</button></div>
      <div class="hint" style="margin-bottom:10px">Money in, by month (Bangladesh time), from approved / verified records only. <b>Extra Services sales</b> is what users paid (the cost of the cards / recharge is not known to the app); <b>service charges</b> is the part that is pure income. <b>Deposits</b> are users' money held as Extra Balance — not income. <b>Rewards given</b> is what check-in, spin, codes, games, tasks and bonuses added to users' balances.</div>
      <div id="irOut" class="hint">Press Load.</div></div>
  </div>
  <div class="pro-pane" data-k="jobs">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-briefcase"></i>Micro Jobs — tasks users do to earn (in Extra Services, paid to the Extra Balance)</div>
      <div class="hint" style="margin-bottom:8px">Add a task (join a Telegram / WhatsApp group or channel, visit a link, sign up, fill a form, a survey, share, refer…), its link, the reward and what proof you want. Users send the proof, you check it below and approve — the reward goes to their <b>Extra Balance</b> (Micro Jobs is in Extra Services). Rewards are for Verified &amp; VIP members. Slots = how many people can do it (0 = no limit). Press <b>Save changes</b> after editing tasks.</div>
      <div class="fgrid fgrid3">${tog('mj-on', 'Micro Jobs on', true)}</div>
      <div id="mjTasks"></div>
      <button class="btn btn-sm btn-s ro-ok" onclick="mjAdd()"><i class="fa-solid fa-plus"></i>Add a task</button>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-list-check"></i>Proofs to check <select id="mjFilter" onchange="mjSubsRender()" style="margin-left:auto;height:30px;border-radius:8px;background:var(--card);color:var(--txt);border:1px solid var(--border)"><option value="Pending">Waiting</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option><option value="all">All</option></select><button class="btn btn-sm btn-s ro-ok" onclick="mjLoad()"><i class="fa-solid fa-rotate-right"></i></button></div><div class="bk-bar"><label><input type="checkbox" onchange="document.querySelectorAll('#mjSubs .bk-ck').forEach(c=>c.checked=this.checked)"> Select all</label><button class="btn btn-sm btn-p ro-ok" onclick="mjBulk('approve')"><i class="fa-solid fa-check-double"></i>Approve selected</button><button class="btn btn-sm btn-d ro-ok" onclick="mjBulk('reject')"><i class="fa-solid fa-xmark"></i>Reject selected</button></div><div id="mjSubs"></div></div>
  </div>
  <div class="pro-pane" data-k="extra">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-store"></i>Extra Services (the section under Quick Services)</div>
      <div class="hint" style="margin-bottom:10px">Paid services the team delivers by hand. Orders come into the <b>Orders</b> tab: press <i class="fa-solid fa-hourglass-half"></i> when you start, <i class="fa-solid fa-check"></i> to deliver (write the code or details — only that user sees it), or <i class="fa-solid fa-xmark"></i> to reject. Logo = an image link (square, e.g. 200×200); without one the icon is shown.</div>
      <div class="fgrid fgrid3">${tog('xs-on', 'Show Extra Services on the home page', true)}${inp('xs-title', 'Section title', 'Extra Services')}</div>
      <div class="cfg-t" style="margin-top:12px;font-size:13px"><i class="fa-solid fa-circle-check" style="color:#46b0ff"></i>Verified exclusive: no charge, no fee</div>
      <div class="fgrid fgrid3">${tog('xs-p-on', 'Verified members pay no charge and no fee', true)}${inp('xs-p-pct', 'Service charge for others on fixed-price services (%)', '5', 'type="number" min="0" max="50"')}${inp('xs-p-min', 'Smallest service charge (৳)', '10', 'type="number" min="0"')}</div>
      <div class="hint">Fixed-price services: others pay the price + this charge, Verified members pay the price only. Exchange services: the Fee % and Fee ৳ of each option are skipped for Verified members. A banner tells users about it.</div>
      <div class="cfg-t" style="margin-top:12px;font-size:13px"><i class="fa-solid fa-building-columns"></i>Loan processing-time notice</div>
      <div class="fgrid fgrid3">${tog('xs-n-on', 'Show the notice (home, after applying, application details)', true)}${inp('xs-n-days', 'Working days', '7–14')}</div>
      <div class="hint">“Loan money is processed through the bank, so approval and disbursement can take up to 7–14 working days. VIP applications get high priority…” — VIP members see that their application has priority.</div>
      <div class="cfg-t" style="margin-top:12px;font-size:13px"><i class="fa-solid fa-gamepad"></i>Play &amp; Earn (Tic-Tac-Toe)</div>
      <div class="fgrid fgrid3">${tog('xs-g-on', 'Games on', true)}${inp('xs-g-reward', 'Reward per win (৳)', '1', 'type="number" min="0"')}${inp('xs-g-perday', 'Paid wins per day', '5', 'type="number" min="0"')}${inp('xs-g-plays', 'Games per day', '30', 'type="number" min="1"')}${inp('xs-g-level', 'Computer skill (0–100)', '75', 'type="number" min="0" max="100"')}</div>
      <div id="xsCost" class="hint"></div>
      <div class="cfg-t" style="margin-top:12px;font-size:13px"><i class="fa-solid fa-wallet"></i>Extra Balance (separate from loans and loan fees)</div>
      <div class="fgrid fgrid3">${tog('xs-w-on', 'Extra Balance on', true)}${tog('xs-w-direct', 'Also allow paying each order with a TrxID', true)}${inp('xs-w-min', 'Smallest deposit (৳)', '50', 'type="number" min="1"')}${inp('xs-w-max', 'Largest deposit (৳, 0 = no limit)', '50000', 'type="number" min="0"')}</div>
      <div class="hint">Deposits come into the Orders tab — press ✓ when the money arrived. An order paid from Extra Balance that you reject is refunded to the user's Extra Balance automatically. Users → open a user → “Extra Balance” to add or take money by hand.</div>
      <div class="cfg-t" style="margin-top:12px;font-size:13px"><i class="fa-solid fa-gift"></i>Deposit bonus (Extra Balance)</div>
      <div class="fgrid fgrid3">${tog('xs-b-on', 'Give a bonus on deposits', false)}${inp('xs-b-max', 'Largest bonus per deposit (৳, 0 = no limit)', '500', 'type="number" min="0"')}${area('xs-b-tiers', 'Tiers — one per line: deposit from = bonus %', '500 = 2\n2000 = 3\n5000 = 5', 3)}</div>
      <div class="hint">The best matching tier is used. Example: ৳2,500 deposit with “2000 = 3” → ৳75 bonus. The bonus is added when you approve the deposit, as its own line in the user's history. Users see the tiers on the Add balance page.</div>
      <div class="cfg-t" style="margin-top:12px;font-size:13px"><i class="fa-solid fa-mobile-screen-button"></i>Mobile Recharge (Quick Services · Verified &amp; VIP only)</div>
      <div class="fgrid fgrid3">${tog('xs-rc-on', 'Mobile recharge on', true)}${inp('xs-rc-min', 'Smallest (৳)', '20', 'type="number" min="10"')}${inp('xs-rc-max', 'Largest (৳)', '1000', 'type="number" min="10"')}${area('xs-rc-ops', 'Operators — one per line', 'Grameenphone\nRobi\nAirtel\nBanglalink\nTeletalk', 3)}</div>
      <div class="hint">A Quick Service, so it is paid from the user's <b>Creditfy balance</b> (not Extra Balance). Recharges come into the Orders tab as “Mobile Recharge” — send it, then press ✓. Rejecting refunds the Creditfy balance.</div>
      <div class="cfg-t" style="margin-top:12px;font-size:13px"><i class="fa-solid fa-bolt"></i>Live orders list (under Extra Services)</div>
      <div class="fgrid fgrid3">${tog('xs-l-on', 'Show the live list', true)}${inp('xs-l-count', 'How many to show', '12', 'type="number" min="3" max="30"')}</div>
      <div class="hint">Shows real orders and deposits only, with the number masked (017****013).</div>
    </div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-bolt" style="color:#ffd76a"></i>Weekday deals (a special price on chosen days)</div>
      <div class="hint" style="margin-bottom:8px">Pick an option, a deal price and the days. On those days (Bangladesh time, 12:00am – 11:59pm) users see “Today's deal” with a countdown to midnight; on other days they see the next deal and when it starts. Example: tick only Friday for a Friday special. For a one-time offer instead, use the <b>Offer ৳</b> and <b>Offer ends</b> columns of an option below — when that time passes, the regular price comes back.</div>
      <div class="fgrid fgrid3" style="margin-bottom:10px">${tog('xs-r-on', 'Show the Red Friday tile', true)}${inp('xs-r-title', 'Tile name', 'Red Friday')}<div class="fg"><label>Its day</label><select id="xs-r-day">${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, n) => `<option value="${n}">${d}</option>`).join('')}</select></div>${inp('xs-r-text', 'Short text', 'Our biggest prices of the week — one day only.', 'full')}</div>
      <div class="hint" style="margin-bottom:8px">The Red Friday tile shows every deal below that has its day ticked. On that day it is LIVE with a countdown to midnight; on other days users see the deals locked with a countdown to when it opens. With no deal on that day, the tile is hidden.</div>
      <div id="xsDeals"></div>
      <button class="btn btn-sm btn-s ro-ok" onclick="xsAddDeal()"><i class="fa-solid fa-plus"></i>Add a deal</button>
    </div>
    <div id="xsList"></div>
    <button class="btn btn-s ro-ok" onclick="xsAddSvc()"><i class="fa-solid fa-plus"></i>Add a service</button>
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
// bulk actions: tick several orders and approve / mark in progress / reject them at once
const _odSel = new Set();
const odLive = o => o.status === 'Pending' || (o.kind === 'extra' && o.status === 'Processing');
const odCk = o => odLive(o) ? `<input type="checkbox" class="bk-ck" ${_odSel.has(o._id) ? 'checked' : ''} onchange="odSel('${ep(o._id)}',this.checked)">` : '<span class="bk-sp"></span>';
function odSel(id, on){ on ? _odSel.add(id) : _odSel.delete(id); const n = $p('odSelN'); if(n) n.textContent = `${_odSel.size} selected`; }
function odSelAll(on){ document.querySelectorAll('#odList .bk-ck').forEach(c => { c.checked = on; c.dispatchEvent(new Event('change')); }); }
async function odBulk(op){
  const L = [..._odSel].map(id => _ORD.find(o => o._id === id)).filter(o => o && odLive(o));
  if(!L.length){ toast('Tick the orders first', 'w'); return; }
  // what each kind allows: approve = Verified / VIP / deposits; payment OK = extra orders waiting; reject = all
  const ok = L.filter(o => op === 'reject' || (op === 'approve' ? ['verify', 'vip', 'xdeposit'].includes(o.kind) : o.kind === 'extra' && o.status === 'Pending'));
  if(!ok.length){ toast(op === 'approve' ? 'Approve works for Verified, VIP and deposits — extra orders are delivered one by one' : 'Payment OK is for extra orders that are waiting', 'w'); return; }
  let reason = '';
  if(op === 'reject'){ reason = prompt(`Reject ${ok.length} order(s). Reason (the users see it):`, 'We could not find this payment.'); if(reason === null) return; }
  else if(!confirm(`${op === 'approve' ? 'Approve' : 'Mark as payment OK'} ${ok.length} order(s)? Check each payment arrived first.${ok.length < L.length ? `\n(${L.length - ok.length} selected order(s) do not fit this action and are skipped.)` : ''}`)) return;
  showL(true); let done = 0, fail = [];
  for(const o of ok){
    const r = ['extra', 'xdeposit'].includes(o.kind) ? await window._accountApi('adminExtraOrder', { id: o._id, op, text: '', reason }) : await window._accountApi('adminServiceOrder', { id: o._id, op, reason });
    if(r.ok){ done++; _odSel.delete(o._id); } else fail.push(`${o.planName || o.kind}: ${r.data.error || 'failed'}`);
  }
  showL(false);
  await logAct(`Bulk ${op}: ${done} order(s)${fail.length ? `, ${fail.length} failed` : ''}`, 'user', 'bulk');
  toast(`${done} done${fail.length ? ` · ${fail.length} failed (${fail[0]})` : ' ✓'}`, fail.length ? 'w' : 's'); odLoad();
}
function odRender(){
  const f = $p('odFilter') ? $p('odFilter').value : 'Pending';
  const L = _ORD.filter(x => f === 'all' || x.status === f || (f === 'Pending' && x.kind === 'extra' && x.status === 'Processing'));
  const el = $p('odList'); if(!el) return;
  [..._odSel].forEach(id => { const o = _ORD.find(x => x._id === id); if(!o || !odLive(o)) _odSel.delete(id); }); odSel('', false);
  const all = $p('odAll'); if(all) all.checked = false;
  el.innerHTML = L.length ? L.map(o => {
    const u = (_D.users || []).find(x => String(x.phone) === String(o.uid)) || {};
    const own = String(o.sender) === String(o.uid);
    if(o.kind === 'xdeposit'){
      return `<div class="od-row">${odCk(o)}<div><b><i class="fa-solid fa-wallet" style="color:var(--p)"></i> Extra Balance deposit</b><small>${ep(u.name || '')} · 0${ep(o.uid)}</small></div>
      <div><b>৳${fa(o.price)}</b><small>${ep(o.payMethod || '')} → ${ep(o.toNumber || '-')}</small></div>
      <div><span class="mono">${ep(o.trxId)}</span><small>TrxID</small></div>
      <div>${sb(o.status === 'Approved' ? 'Verified' : o.status === 'Rejected' ? 'Rejected' : 'Pending')}<small>${fd(o.createdAt)}</small></div>
      <div class="acts">${o.status === 'Pending' ? `<button class="ab ab-ok" title="Payment arrived — add the balance" onclick="xsOrder('${ep(o._id)}','approve')"><i class="fa-solid fa-check"></i></button><button class="ab ab-no" title="Reject" onclick="xsOrder('${ep(o._id)}','reject')"><i class="fa-solid fa-xmark"></i></button>` : `<small>${ep(o.reason || '')}</small>`}</div></div>`;
    }
    if(o.kind === 'extra'){
      const live = ['Pending', 'Processing'].includes(o.status);
      const info = (o.fields || []).filter(f => f.value).map(f => `${ep(f.label)}: <b>${ep(f.value)}</b>`).join('<br>');
      return `<div class="od-row">${odCk(o)}<div><b><i class="fa-solid fa-store" style="color:#ffd76a"></i> ${ep(o.iname)}</b><small>${ep(o.sname)} · ${ep(u.name || '')} · 0${ep(o.uid)}</small>${info ? `<small>${info}</small>` : ''}</div>
      <div><b>${o.flow === 'sell' ? 'Pay user ৳' + fa(o.get) : '৳' + fa(o.price)}</b>${o.feeWaived ? '<small style="color:#46b0ff">Verified · fee waived</small>' : o.fee ? `<small>incl. fee ৳${fa(o.fee)}</small>` : ''}<small>${o.amount ? ep(o.amount) + ' ' + ep(o.unit) + ' · ' : ''}${ep(o.payMethod || '')} → ${ep(o.toNumber || '-')}</small></div>
      <div>${o.paidWith === 'xbal' ? '<b style="color:var(--p)">Paid from Extra Balance</b><small>no TrxID needed</small>' : `<span class="mono">${ep(o.trxId)}</span><small>${o.sender ? 'from 0' + ep(o.sender) : 'TrxID only'}</small>`}</div>
      <div>${sb(o.status === 'Delivered' ? 'Verified' : o.status === 'Rejected' ? 'Rejected' : 'Pending')}<small>${ep(o.status)} · ${fd(o.createdAt)}</small></div>
      <div class="acts">${live ? `${o.status === 'Pending' ? `<button class="ab" title="Payment OK — start working" onclick="xsOrder('${ep(o._id)}','process')"><i class="fa-solid fa-hourglass-half"></i></button>` : ''}<button class="ab ab-ok" title="Deliver" onclick="xsOrder('${ep(o._id)}','deliver')"><i class="fa-solid fa-check"></i></button><button class="ab ab-no" title="Reject" onclick="xsOrder('${ep(o._id)}','reject')"><i class="fa-solid fa-xmark"></i></button>` : `<small>${ep(o.delivery || o.reason || '')}</small>`}</div></div>`;
    }
    return `<div class="od-row">${odCk(o)}<div><b>${o.kind === 'vip' ? '👑 ' : '<i class="fa-solid fa-circle-check" style="color:#46b0ff"></i> '}${ep(o.planName || o.kind)}</b><small>${ep(u.name || '')} · 0${ep(o.uid)}</small></div>
      <div><b>৳${fa(o.price)}</b><small>${ep(o.payMethod || '')} → ${ep(o.toNumber || '-')}</small></div>
      <div><span class="mono">${ep(o.trxId)}</span><small>${o.sender ? 'from 0' + ep(o.sender) : 'TrxID only'}</small></div>
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
function cdKind(){ const k = val('cd-kind'); document.querySelectorAll('.cd-promo').forEach(e => e.style.display = k === 'promo' ? '' : 'none'); document.querySelectorAll('.cd-dep').forEach(e => e.style.display = k === 'deposit' ? '' : 'none'); $p('cd-vlbl').textContent = k === 'promo' ? 'Discount' : k === 'deposit' ? 'Bonus (% or ৳)' : 'Balance to add (৳)'; if(k === 'voucher'){ $p('cd-uses').value = 1; $p('cd-per').value = 1; } }
const rndCode = (pre, n = 8) => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const b = new Uint32Array(n); crypto.getRandomValues(b); return (pre ? pre + '-' : '') + [...b].map(x => a[x % a.length]).join(''); };
async function cdCreate(){
  const kind = val('cd-kind'), value = Number(val('cd-value')), count = Math.min(200, Math.max(1, Number(val('cd-count')) || 1));
  if(!(value > 0)){ toast('Enter the discount or amount', 'w'); return; }
  if(kind === 'promo' && val('cd-type') === 'percent' && value > 100){ toast('Percent must be 100 or less', 'w'); return; }
  const base = { kind, value, on: true, uses: 0, maxUses: kind === 'voucher' ? 1 : Math.max(0, Number(val('cd-uses')) || 0), perUser: Math.max(1, Number(val('cd-per')) || 1),
    start: val('cd-start') ? new Date(val('cd-start') + 'T00:00:00+06:00').toISOString() : '', end: val('cd-end') ? new Date(val('cd-end') + 'T23:59:59+06:00').toISOString() : '',
    audience: val('cd-aud') || 'all', label: val('cd-label'), note: val('cd-note'), createdAt: new Date().toISOString(), createdBy: 'admin' };
  if(kind === 'deposit'){ base.type = val('cd-dtype') || 'percent'; if(base.type === 'percent' && value > 100){ toast('Percent must be 100 or less', 'w'); return; } base.maxBonus = Math.max(0, Number(val('cd-dmax')) || 0); base.minDeposit = Math.max(0, Number(val('cd-dmin')) || 0); }
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

/* ═════════ Extra services ═════════ */
const XS_COLORS = ['g-teal', 'g-green', 'g-blue', 'g-cyan', 'g-purple', 'g-pink', 'g-red', 'g-orange', 'g-gold', 'g-slate', 'g-dark'];
const xsInp = (v, on, ph = '', t = 'text', w = '') => `<input type="${t}" value="${ep(v ?? '')}" placeholder="${ep(ph)}" oninput="${on}" style="height:34px;padding:0 9px;border-radius:8px;background:rgba(255,255,255,.04);border:1.5px solid var(--border);color:var(--txt);font-size:12.5px;font-family:inherit;min-width:0;width:100%;box-sizing:border-box${w}">`;
function xsRender(){
  const X = _SV.extra; const el = $p('xsList'); if(!el || !X) return;
  el.innerHTML = X.services.map((s, n) => {
    const amt = s.mode === 'amount';
    const head = amt ? ['Option', 'Icon', 'Unit', 'Rate ৳/unit', 'Fee %', 'Fee ৳', 'Min', 'Max', 'Buy / Sell', 'Pay-to number / address (blank = payment wallets)', 'On', '']
      : ['Option', 'Icon', 'Category', 'Price ৳', 'Offer ৳', 'Offer ends (date & time)', 'Note for the user', 'Pay-to (blank = wallets)', 'Popular', 'On', ''];
    const cols = amt ? '1.4fr 1fr .5fr .7fr .5fr .5fr .5fr .6fr .7fr 1.6fr 34px 34px' : '1.3fr 1fr .8fr .55fr .55fr 1.15fr 1.1fr .9fr 44px 34px 34px';
    const row = (i, k) => { const f = (key, ph, t) => xsInp(i[key], `xsItem(${n},${k},'${key}',this.value)`, ph, t);
      return `<div style="display:grid;grid-template-columns:${cols};gap:6px;align-items:center;margin-bottom:5px">${amt
        ? f('name', 'bKash → Nagad') + f('icon', 'auto') + f('unit', '৳') + f('rate', '1', 'number') + f('pct', '0', 'number') + f('fee', '0', 'number') + f('min', '0', 'number') + f('max', '0', 'number')
          + `<select onchange="xsItem(${n},${k},'flow',this.value)" style="height:34px;border-radius:8px;background:var(--card);color:var(--txt);border:1.5px solid var(--border)"><option value="buy"${i.flow !== 'sell' ? ' selected' : ''}>User pays</option><option value="sell"${i.flow === 'sell' ? ' selected' : ''}>User sells</option></select>` + f('to', 'e.g. bKash 017XXXXXXXX')
        : f('name', 'Google Play $10') + f('icon', 'auto') + f('cat', 'e.g. Steam') + f('price', '0', 'number') + f('offer', 'none', 'number')
          + `<input type="datetime-local" value="${ep(xsLocal(i.offerEnd))}" onchange="xsItem(${n},${k},'offerEnd',this.value?new Date(this.value).toISOString():'');xsRender()" style="height:34px;padding:0 6px;border-radius:8px;background:rgba(255,255,255,.04);border:1.5px solid ${xsOfferLive(i) ? 'rgba(255,215,106,.7)' : 'var(--border)'};color:var(--txt);font-size:12px;min-width:0;width:100%;box-sizing:border-box;color-scheme:dark">`
          + f('note', 'optional') + f('to', 'optional') + `<input type="checkbox" title="Popular" ${i.hot ? 'checked' : ''} onchange="xsItem(${n},${k},'hot',this.checked)">`}
        <input type="checkbox" ${i.on !== false ? 'checked' : ''} onchange="xsItem(${n},${k},'on',this.checked)"><button class="ab ab-no ro-ok" title="Remove" onclick="xsDelItem(${n},${k})"><i class="fa-solid fa-trash"></i></button></div>`; };
    const lg = s.logo ? `<img src="${ep(s.logo)}" style="width:40px;height:40px;border-radius:12px;object-fit:cover;background:#fff">` : `<div class="${ep(s.color)}" style="width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;background:#345"><i class="${ep(s.icon)}"></i></div>`;
    return `<div class="cfg-blk" style="${s.on === false ? 'opacity:.6' : ''}"><div class="cfg-t" style="gap:10px">${lg}<span>${ep(s.name || 'New service')}</span><small style="color:var(--txt2);font-weight:600">${s.mode === 'game' ? 'game' : amt ? 'amount (exchange)' : 'fixed price'}</small>
        <span style="margin-left:auto;display:flex;gap:5px"><button class="btn btn-sm btn-s ro-ok" onclick="xsMove(${n},-1)"><i class="fa-solid fa-arrow-up"></i></button><button class="btn btn-sm btn-s ro-ok" onclick="xsMove(${n},1)"><i class="fa-solid fa-arrow-down"></i></button><button class="btn btn-sm btn-d ro-ok" onclick="xsDelSvc(${n})"><i class="fa-solid fa-trash"></i></button></span></div>
      <div class="fgrid fgrid3">
        <div class="fg"><label>Name</label>${xsInp(s.name, `xsSet(${n},'name',this.value)`, 'Gift Cards')}</div>
        <div class="fg"><label>Tile label (short)</label>${xsInp(s.short, `xsSet(${n},'short',this.value)`, 'Gift Cards')}</div>
        <div class="fg"><label>Badge (NEW, HOT…)</label>${xsInp(s.badge, `xsSet(${n},'badge',this.value)`, '')}</div>
        <div class="fg"><label>Logo image link</label>${xsInp(s.logo, `xsSet(${n},'logo',this.value)`, 'https://…/logo.png')}</div>
        <div class="fg"><label>Icon (Font Awesome)</label>${xsInp(s.icon, `xsSet(${n},'icon',this.value)`, 'fa-brands fa-steam')}</div>
        <div class="fg"><label>Colour</label><select onchange="xsSet(${n},'color',this.value,1)">${XS_COLORS.map(c => `<option${c === s.color ? ' selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="fg"><label>Type</label><select onchange="xsSet(${n},'mode',this.value,1)"><option value="items"${s.mode === 'items' ? ' selected' : ''}>Fixed price options</option><option value="amount"${amt ? ' selected' : ''}>Amount (exchange)</option><option value="game"${s.mode === 'game' ? ' selected' : ''}>Game (Tic-Tac-Toe)</option></select></div>
        <div class="fg"><label class="hp-sw"><input type="checkbox" ${s.on !== false ? 'checked' : ''} onchange="xsSet(${n},'on',this.checked,1)"> Show</label><label class="hp-sw"><input type="checkbox" ${s.soon ? 'checked' : ''} onchange="xsSet(${n},'soon',this.checked)"> Coming soon</label></div>
        <div class="fg full"><label>Description</label>${xsInp(s.desc, `xsSet(${n},'desc',this.value)`, 'What this service gives')}</div>
        <div class="fg full"><label>Questions for the user — one per line, add <b>*</b> at the end if required</label><textarea rows="2" oninput="xsFields(${n},this.value)" style="width:100%;box-sizing:border-box">${ep((s.fields || []).map(f => f.label + (f.req ? ' *' : '')).join('\n'))}</textarea></div>
      </div>
      ${s.mode === 'game' ? '<div class="hint">The game settings are at the top of this page.</div>' : `<div style="overflow-x:auto"><div style="min-width:${amt ? 1120 : 1220}px"><div style="display:grid;grid-template-columns:${cols};gap:6px;font-size:10.5px;color:var(--txt2);font-weight:800;margin:8px 0 5px">${head.map(h => `<span>${h}</span>`).join('')}</div>
        ${(s.items || []).map(row).join('')}</div></div>
        <button class="btn btn-sm btn-s ro-ok" onclick="xsAddItem(${n})"><i class="fa-solid fa-plus"></i>Add option</button>
        <div class="hint" style="margin-top:6px"><b>Icon</b>: leave empty for an automatic icon (Google Play, Steam, Telegram, Visa, bKash… are recognised from the name), or write a Font Awesome icon such as <code>fa-brands fa-steam</code>, <code>fa-brands fa-playstation</code>, <code>fa-solid fa-film</code>, or paste a logo image link starting with https://.</div>
        ${amt ? '<div class="hint" style="margin-top:6px">User pays = amount × rate + fee % + fee ৳. “User sells” = the user sends to the pay-to address and gets amount × rate − fee.</div>' : ''}`}
    </div>`;
  }).join('');
  const g = { r: numv('xs-g-reward', 1, 0, 1e5), d: numv('xs-g-perday', 5, 0, 1e3) };
  if(typeof xsDealsRender === 'function') xsDealsRender();
  if($p('xsCost')) $p('xsCost').innerHTML = `Game wins go to the Extra Balance. Most a Verified user can win: <b>৳${fa(g.r * g.d)} a day</b> (about ৳${fa(g.r * g.d * 30)} a month).`;
}
const xsDirty = () => markDirty('services', 'extra');
const XS_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function xsDealsRender(){
  const el = $p('xsDeals'); if(!el || !_SV.extra) return;
  const S = _SV.extra.services.filter(s => s.mode === 'items');
  const sel = 'height:34px;border-radius:8px;background:var(--card);color:var(--txt);border:1.5px solid var(--border);min-width:0;width:100%';
  el.innerHTML = (_SV.extra.deals || []).map((d, k) => { const s = S.find(x => x.id === d.sid) || S[0] || { items: [] }; const it = (s.items || []).find(x => x.id === d.iid);
    return `<div style="display:grid;grid-template-columns:1fr 1.3fr .6fr 2fr 34px 34px;gap:6px;align-items:center;margin-bottom:6px">
      <select style="${sel}" onchange="xsDeal(${k},'sid',this.value)">${S.map(x => `<option value="${ep(x.id)}"${x.id === d.sid ? ' selected' : ''}>${ep(x.name)}</option>`).join('')}</select>
      <select style="${sel}" onchange="xsDeal(${k},'iid',this.value)">${(s.items || []).map(x => `<option value="${ep(x.id)}"${x.id === d.iid ? ' selected' : ''}>${ep(x.name)} (৳${fa(x.price)})</option>`).join('')}</select>
      ${xsInp(d.price, `xsDeal(${k},'price',Number(this.value)||0,1)`, 'deal ৳', 'number')}
      <div style="display:flex;gap:3px;flex-wrap:wrap">${XS_WD.map((w, n) => `<label style="display:inline-flex;align-items:center;gap:2px;font-size:11px;padding:3px 6px;border-radius:7px;border:1px solid var(--border);${(d.days || []).includes(n) ? 'background:rgba(255,215,106,.15);color:#ffd76a' : ''}"><input type="checkbox" ${(d.days || []).includes(n) ? 'checked' : ''} onchange="xsDealDay(${k},${n},this.checked)" style="margin:0">${w}</label>`).join('')}</div>
      <input type="checkbox" ${d.on !== false ? 'checked' : ''} onchange="xsDeal(${k},'on',this.checked)" title="On"><button class="ab ab-no ro-ok" onclick="xsDelDeal(${k})"><i class="fa-solid fa-trash"></i></button>
      ${it && Number(d.price) >= Number(it.price) ? '<div class="hint" style="grid-column:1/-1;color:var(--orange);margin:-2px 0 4px">The deal price must be lower than the regular price, or it will not show.</div>' : ''}</div>`; }).join('') || '<div class="hint">No deals yet.</div>';
}
function xsDeal(k, f, v, quiet){ const d = _SV.extra.deals[k]; if(!d) return; d[f] = v; if(f === 'sid'){ const s = _SV.extra.services.find(x => x.id === v); d.iid = s && s.items && s.items[0] ? s.items[0].id : ''; } xsDirty(); if(!quiet || f !== 'price') xsDealsRender(); }
function xsDealDay(k, n, on){ const d = _SV.extra.deals[k]; d.days = (d.days || []).filter(x => x !== n); if(on) d.days.push(n); d.days.sort(); xsDirty(); xsDealsRender(); }
function xsAddDeal(){ const s = _SV.extra.services.find(x => x.mode === 'items' && (x.items || []).length); if(!s){ toast('Add a fixed-price service with options first', 'w'); return; }
  _SV.extra.deals = _SV.extra.deals || []; _SV.extra.deals.push({ id: 'd' + hid(), sid: s.id, iid: s.items[0].id, price: 0, days: [5], on: true }); xsDirty(); xsDealsRender(); }
function xsDelDeal(k){ _SV.extra.deals.splice(k, 1); xsDirty(); xsDealsRender(); }
function xsSet(n, k, v, re){ const s = _SV.extra.services[n]; if(!s) return; s[k] = v; if(k === 'mode' && v !== 'game' && !s.items) s.items = []; xsDirty(); if(re) xsRender(); }
function xsFields(n, txt){ _SV.extra.services[n].fields = txt.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 6).map(l => ({ label: l.replace(/\s*\*$/, ''), req: /\*$/.test(l) })); xsDirty(); }
const xsLocal = iso => { if(!iso) return ''; const d = new Date(iso); if(isNaN(d)) return ''; return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); };
const xsOfferLive = i => Number(i.offer) > 0 && Number(i.offer) < Number(i.price) && i.offerEnd && new Date(i.offerEnd) > new Date();
function xsItem(n, k, f, v){ const i = _SV.extra.services[n].items[k]; if(!i) return; i[f] = ['price', 'rate', 'pct', 'fee', 'min', 'max', 'offer'].includes(f) ? (Number(v) || 0) : v; xsDirty(); }
function xsAddItem(n){ const s = _SV.extra.services[n]; s.items = s.items || []; s.items.push(s.mode === 'amount' ? { id: 'o' + hid(), name: '', unit: '৳', rate: 1, pct: 0, fee: 0, min: 0, max: 0, flow: 'buy', to: '', on: true } : { id: 'o' + hid(), name: '', price: 0, note: '', to: '', on: true }); xsDirty(); xsRender(); }
function xsDelItem(n, k){ _SV.extra.services[n].items.splice(k, 1); xsDirty(); xsRender(); }
function xsAddSvc(){ _SV.extra.services.push({ id: 's' + hid(), name: 'New service', short: '', icon: 'fa-solid fa-star', color: 'g-teal', mode: 'items', on: true, desc: '', fields: [], items: [] }); xsDirty(); xsRender(); setTimeout(() => { const l = $p('xsList'); if(l && l.lastElementChild) l.lastElementChild.scrollIntoView({ behavior: 'smooth' }); }, 50); }
function xsDelSvc(n){ const s = _SV.extra.services[n]; confirm2(`Remove “${s.name}” from Extra Services? Past orders stay in the Orders tab.`, () => { _SV.extra.services.splice(n, 1); xsDirty(); xsRender(); }); }
function xsMove(n, d){ const L = _SV.extra.services, j = n + d; if(j < 0 || j >= L.length) return; [L[n], L[j]] = [L[j], L[n]]; xsDirty(); xsRender(); }
function xsData(){
  const X = _SV.extra;
  const services = X.services.filter(s => String(s.name || '').trim()).map(s => ({ ...s, id: s.id || 's' + hid(), name: String(s.name).trim().slice(0, 40), short: String(s.short || '').trim().slice(0, 16),
    items: (s.items || []).filter(i => String(i.name || '').trim()).map(i => ({ ...i, id: i.id || 'o' + hid(), name: String(i.name).trim().slice(0, 60) })) }));
  if(services.some(s => s.logo && !/^https:\/\//i.test(s.logo))) throw new Error('Extra services: a logo link must start with https://');
  if(services.some(s => (s.items || []).some(i => i.icon && /^http:/i.test(i.icon)))) throw new Error('Extra services: an icon image link must start with https://');
  const deals = (X.deals || []).filter(d => d.sid && d.iid && Number(d.price) > 0 && (d.days || []).length).map(d => ({ id: d.id || 'd' + hid(), sid: d.sid, iid: d.iid, price: Math.round(Number(d.price)), days: d.days, on: d.on !== false }));
  return { on: chk('xs-on'), deals, redFriday: { on: chk('xs-r-on'), title: val('xs-r-title') || 'Red Friday', day: Number(val('xs-r-day') || 5), text: val('xs-r-text') }, title: val('xs-title') || 'Extra Services', services,
    perk: { on: chk('xs-p-on'), chargePct: numv('xs-p-pct', 5, 0, 50), chargeMin: numv('xs-p-min', 10, 0, 1e5) },
    loanNotice: { on: chk('xs-n-on'), days: val('xs-n-days') || '7–14' },
    wallet: { on: chk('xs-w-on'), direct: chk('xs-w-direct'), min: numv('xs-w-min', 50, 1, 1e7), max: numv('xs-w-max', 50000, 0, 1e8) },
    live: { on: chk('xs-l-on'), count: numv('xs-l-count', 12, 3, 30) },
    depBonus: { on: chk('xs-b-on'), max: numv('xs-b-max', 500, 0, 1e7), tiers: lines('xs-b-tiers').map(l => { const [a, b] = l.split('='); return { min: Math.round(Number(String(a).replace(/[^\d.]/g, '')) || 0), pct: Number(String(b || '').replace(/[^\d.]/g, '')) || 0 }; }).filter(t => t.min > 0 && t.pct > 0) },
    recharge: { on: chk('xs-rc-on'), min: numv('xs-rc-min', 20, 10, 1e5), max: numv('xs-rc-max', 1000, 10, 1e6), ops: lines('xs-rc-ops') },
    jobs: { on: chk('mj-on'), tasks: (_SV.extra.jobs.tasks || []).filter(t => String(t.title || '').trim()).map(t => ({ ...t, id: t.id || 't' + hid(), title: String(t.title).trim().slice(0, 80), reward: Math.max(0, Math.round(Number(t.reward) || 0)), slots: Math.max(0, Math.round(Number(t.slots) || 0)) })) },
    games: { on: chk('xs-g-on'), reward: numv('xs-g-reward', 1, 0, 1e5), perDay: numv('xs-g-perday', 5, 0, 1e3), plays: numv('xs-g-plays', 30, 1, 1e3), level: numv('xs-g-level', 75, 0, 100) } };
}
async function xsLoad(){
  const r = await window._accountApi('extraConfig', {});
  _SV.extra = r.ok ? r.data : { on: true, title: 'Extra Services', services: [], games: { on: true, reward: 1, perDay: 5, plays: 30, level: 75 } };
  fillIn({ 'xs-on': _SV.extra.on !== false, 'xs-title': _SV.extra.title, 'xs-g-on': _SV.extra.games.on !== false, 'xs-g-reward': _SV.extra.games.reward, 'xs-g-perday': _SV.extra.games.perDay, 'xs-g-plays': _SV.extra.games.plays, 'xs-g-level': _SV.extra.games.level,
    'xs-w-on': (_SV.extra.wallet || {}).on !== false, 'xs-w-direct': (_SV.extra.wallet || {}).direct !== false, 'xs-w-min': (_SV.extra.wallet || {}).min ?? 50, 'xs-w-max': (_SV.extra.wallet || {}).max ?? 50000,
    'xs-p-on': (_SV.extra.perk || {}).on !== false, 'xs-p-pct': (_SV.extra.perk || {}).chargePct ?? 5, 'xs-p-min': (_SV.extra.perk || {}).chargeMin ?? 10,
    'xs-r-on': (_SV.extra.redFriday || {}).on !== false, 'xs-r-title': (_SV.extra.redFriday || {}).title || 'Red Friday', 'xs-r-day': String((_SV.extra.redFriday || {}).day ?? 5), 'xs-r-text': (_SV.extra.redFriday || {}).text || '',
    'xs-n-on': (_SV.extra.loanNotice || {}).on !== false, 'xs-n-days': (_SV.extra.loanNotice || {}).days || '7–14',
    'xs-l-on': (_SV.extra.live || {}).on !== false, 'xs-l-count': (_SV.extra.live || {}).count || 12,
    'xs-b-on': (_SV.extra.depBonus || {}).on === true, 'xs-b-max': (_SV.extra.depBonus || {}).max ?? 500, 'xs-b-tiers': ((_SV.extra.depBonus || {}).tiers || []).map(t => `${t.min} = ${t.pct}`).join('\n'),
    'xs-rc-on': (_SV.extra.recharge || {}).on !== false, 'xs-rc-min': (_SV.extra.recharge || {}).min ?? 20, 'xs-rc-max': (_SV.extra.recharge || {}).max ?? 1000, 'xs-rc-ops': ((_SV.extra.recharge || {}).ops || []).join('\n'),
    'mj-on': (_SV.extra.jobs || {}).on !== false });
  _SV.extra.jobs = _SV.extra.jobs || { on: true, tasks: [] }; mjRender(); mjLoad();
  ['xs-g-reward', 'xs-g-perday'].forEach(id => { const e = $p(id); if(e) e.oninput = xsRender; });
  _SV.extra.deals = _SV.extra.deals || [];
  xsRender(); xsDealsRender();
}
async function xsOrder(id, op){
  const o = _ORD.find(x => x._id === id); if(!o) return;
  let text = '', reason = '';
  if(op === 'deliver'){ text = prompt(`Deliver ${o.planName} to 0${o.uid}.\nWrite the code / card details / note the user should see (only this user sees it):`, ''); if(text === null) return; }
  if(op === 'reject'){ reason = prompt('Reason (the user sees it):', 'We could not find this payment.'); if(reason === null) return; }
  if(op === 'approve' && !confirm(`Add ৳${fa(o.price)} Extra Balance to 0${o.uid}? Check that ৳${fa(o.price)} with TrxID ${o.trxId} arrived first.`)) return;
  if(op === 'process' && !confirm(`Payment ${o.price ? '৳' + fa(o.price) + ' ' : ''}(TrxID ${o.trxId}) checked? Mark “${o.planName}” as in progress.`)) return;
  showL(true); const r = await window._accountApi('adminExtraOrder', { id, op, text, reason }); showL(false);
  if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; }
  await logAct(`Extra order ${o.planName} → ${op} for ${o.uid} (TrxID ${o.trxId})`, 'user', o.uid);
  toast(op === 'approve' ? 'Balance added ✓' : op === 'deliver' ? 'Delivered ✓' : op === 'process' ? 'Marked in progress' : 'Rejected', op === 'reject' ? 'e' : 's'); odLoad();
}

/* ═════════ income report ═════════ */
let _IR = null;
const irMonth = t => new Date(new Date(t).getTime() + 6 * 3600e3).toISOString().slice(0, 7);
async function irLoad(){
  const el = $p('irOut'); el.innerHTML = 'Loading…';
  const [trx, ord, wl, xl] = await Promise.all([window._getDocs('transactions', 'submittedAt'), window._getDocs('serviceOrders'), window._getDocs('walletLog', 'at').catch(() => []), window._getDocs('xbalLog', 'at').catch(() => [])]);
  _IR = { trx, ord, wl, xl }; irRender();
}
function irRender(){
  if(!_IR) return; const el = $p('irOut');
  const n = Number(val('irMonths')) || 6, months = [];
  for(let i = n - 1; i >= 0; i--){ const d = new Date(Date.now() + 6 * 3600e3); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - i); months.push(d.toISOString().slice(0, 7)); }
  const R = {}; months.forEach(m => { R[m] = { fees: 0, feeN: 0, inst: 0, verify: 0, vip: 0, extra: 0, charge: 0, extraN: 0, dep: 0, rewards: 0 }; });
  const add = (t, k, v) => { if(!t) return; const m = irMonth(t); if(R[m]) R[m][k] += Number(String(v || 0).replace(/,/g, '')) || 0; };
  _IR.trx.filter(t => t.status === 'Verified' && !t.removed).forEach(t => {
    const when = t.verifiedAt || t.submittedAt;
    if(['installment', 'payoff'].includes(t.type)) add(when, 'inst', t.amount); else { add(when, 'fees', t.amount); add(when, 'feeN', 1); } });
  _IR.ord.forEach(o => { const when = o.decidedAt || o.createdAt;
    if(o.kind === 'verify' && o.status === 'Approved') add(when, 'verify', o.price);
    if(o.kind === 'vip' && o.status === 'Approved') add(when, 'vip', o.price);
    if(o.kind === 'xdeposit' && o.status === 'Approved') add(when, 'dep', o.price);
    if(o.kind === 'extra' && o.status === 'Delivered' && o.flow !== 'sell'){ add(when, 'extra', o.price); add(when, 'charge', o.fee); add(when, 'extraN', 1); } });
  const RW = ['checkin', 'spin', 'redeem', 'voucher', 'referral', 'bonus', 'cashback', 'game', 'task'];
  _IR.wl.filter(x => RW.includes(x.type) && Number(x.amount) > 0).forEach(x => add(x.at, 'rewards', x.amount));
  _IR.xl.filter(x => ['game', 'task', 'bonus'].includes(x.type) && Number(x.amount) > 0).forEach(x => add(x.at, 'rewards', x.amount));
  const T = months.reduce((a, m) => { Object.keys(R[m]).forEach(k => a[k] = (a[k] || 0) + R[m][k]); return a; }, {});
  const inc = r => r.fees + r.verify + r.vip + r.charge;
  const head = ['Month', 'Loan fees & interest', 'Verified', 'VIP', 'Extra sales', 'of which charges', 'Income*', 'Installments back', 'Deposits held', 'Rewards given'];
  const row = (lbl, r, b) => `<tr${b ? ' style="font-weight:900;border-top:2px solid var(--border)"' : ''}><td>${lbl}</td><td>৳${fa(r.fees)}<small> (${r.feeN})</small></td><td>৳${fa(r.verify)}</td><td>৳${fa(r.vip)}</td><td>৳${fa(r.extra)}<small> (${r.extraN})</small></td><td>৳${fa(r.charge)}</td><td style="color:var(--p);font-weight:900">৳${fa(inc(r))}</td><td>৳${fa(r.inst)}</td><td>৳${fa(r.dep)}</td><td style="color:var(--orange)">−৳${fa(r.rewards)}</td></tr>`;
  const max = Math.max(1, ...months.map(m => inc(R[m])));
  el.className = '';
  el.innerHTML = `<div class="sv-st">${[['Income*', '৳' + fa(inc(T)), 'var(--p)'], ['Loan fees & interest', '৳' + fa(T.fees), '#46b0ff'], ['Verified + VIP', '৳' + fa(T.verify + T.vip), '#ffd76a'], ['Extra Services sales', '৳' + fa(T.extra), '#c085ff'], ['Rewards given', '৳' + fa(T.rewards), 'var(--orange)']].map(([l, v, c]) => `<div class="sv-k"><b style="color:${c}">${v}</b><span>${l}</span></div>`).join('')}</div>
    <div style="display:flex;align-items:flex-end;gap:8px;height:120px;margin:6px 0 14px;padding:0 4px">${months.map(m => `<div style="flex:1;text-align:center"><div title="৳${fa(inc(R[m]))}" style="height:${Math.round(inc(R[m]) / max * 92) + 2}px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#1ddb80,#0e9a5a)"></div><small style="font-size:10px;color:var(--txt2)">${m.slice(2)}</small></div>`).join('')}</div>
    <div style="overflow-x:auto"><table class="ir-t"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${months.slice().reverse().map(m => row(m, R[m])).join('')}${row('Total', T, true)}</tbody></table></div>
    <div class="hint" style="margin-top:8px">* Income = loan fees &amp; interest + Verified + VIP + Extra Services charges. Installments are loan money coming back (not income).</div>`;
  _IR.months = months; _IR.R = R; _IR.T = T;
}
function irCsv(){
  if(!_IR || !_IR.R){ toast('Press Load first', 'w'); return; }
  const k = ['fees', 'feeN', 'verify', 'vip', 'extra', 'extraN', 'charge', 'inst', 'dep', 'rewards'];
  const lines = [['month', 'loan_fees_interest', 'fee_payments', 'verified', 'vip', 'extra_sales', 'extra_orders', 'extra_charges', 'income', 'installments_back', 'deposits_held', 'rewards_given'].join(',')]
    .concat(_IR.months.map(m => [m, ...k.slice(0, 7).map(x => _IR.R[m][x]), _IR.R[m].fees + _IR.R[m].verify + _IR.R[m].vip + _IR.R[m].charge, _IR.R[m].inst, _IR.R[m].dep, _IR.R[m].rewards].join(',')));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })); a.download = `creditfy-income-${_IR.months[0]}-to-${_IR.months[_IR.months.length - 1]}.csv`; a.click();
}

/* ═════════ Micro jobs ═════════ */
const MJ_TYPES = [['join', 'Join group / channel'], ['visit', 'Visit link'], ['signup', 'Sign up'], ['form', 'Form fill-up'], ['survey', 'Survey'], ['share', 'Share'], ['refer', 'Refer'], ['other', 'Other']];
let _MJS = [];
function mjRender(){
  const el = $p('mjTasks'); if(!el || !_SV.extra) return; const L = _SV.extra.jobs.tasks;
  const sel = 'height:34px;border-radius:8px;background:var(--card);color:var(--txt);border:1.5px solid var(--border);min-width:0;width:100%';
  el.innerHTML = L.map((t, k) => `<div style="border:1px solid var(--border);border-radius:12px;padding:10px;margin-bottom:8px;${t.on === false ? 'opacity:.6' : ''}">
    <div style="display:grid;grid-template-columns:1.6fr 1fr .6fr .6fr 1fr 34px 34px;gap:6px;align-items:center">
      ${xsInp(t.title, `mjSet(${k},'title',this.value)`, 'Join our Telegram channel')}
      <select style="${sel}" onchange="mjSet(${k},'type',this.value)">${MJ_TYPES.map(([v, l]) => `<option value="${v}"${t.type === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
      ${xsInp(t.reward, `mjSet(${k},'reward',this.value)`, 'reward ৳', 'number')}${xsInp(t.slots, `mjSet(${k},'slots',this.value)`, 'slots', 'number')}
      <input type="datetime-local" value="${ep(xsLocal(t.until))}" title="Ends (optional)" onchange="mjSet(${k},'until',this.value?new Date(this.value).toISOString():'')" style="${sel};padding:0 6px;color-scheme:dark">
      <input type="checkbox" ${t.on !== false ? 'checked' : ''} onchange="mjSet(${k},'on',this.checked)" title="On"><button class="ab ab-no ro-ok" onclick="mjDel(${k})"><i class="fa-solid fa-trash"></i></button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">${xsInp(t.link, `mjSet(${k},'link',this.value)`, 'https://t.me/… (task link)')}${xsInp(t.proof, `mjSet(${k},'proof',this.value)`, 'Proof: your Telegram username')}</div>
    <textarea rows="2" oninput="mjSet(${k},'steps',this.value)" placeholder="Steps for the user (one per line)" style="width:100%;box-sizing:border-box;margin-top:6px">${ep(t.steps || '')}</textarea></div>`).join('') || '<div class="hint">No tasks yet.</div>';
}
function mjSet(k, f, v){ const t = _SV.extra.jobs.tasks[k]; if(!t) return; t[f] = v; markDirty('services', 'jobs'); }
function mjAdd(){ _SV.extra.jobs.tasks.push({ id: 't' + hid(), title: '', type: 'join', link: '', reward: 5, slots: 0, proof: 'Your username', steps: '', on: true, until: '' }); markDirty('services', 'jobs'); mjRender(); }
function mjDel(k){ confirm2('Remove this task? Proofs already sent stay in the list.', () => { _SV.extra.jobs.tasks.splice(k, 1); markDirty('services', 'jobs'); mjRender(); }); }
async function mjLoad(){ const r = await window._accountApi('adminJobs', { op: 'list' }); _MJS = r.ok ? r.data.list || [] : []; mjSubsRender(); }
function mjSubsRender(){
  const el = $p('mjSubs'); if(!el) return; const f = $p('mjFilter') ? $p('mjFilter').value : 'Pending';
  const L = _MJS.filter(x => f === 'all' || x.status === f);
  el.innerHTML = L.length ? L.map(x => { const u = (_D.users || []).find(y => String(y.phone) === String(x.uid)) || {};
    return `<div class="od-row">${x.status === 'Pending' ? `<input type="checkbox" class="bk-ck" value="${ep(x.id)}">` : '<span class="bk-sp"></span>'}<div><b>${ep(x.title)}</b><small>${ep(u.name || '')} · 0${ep(x.uid)}</small></div><div><b style="color:var(--p)">+৳${fa(x.reward)}</b><small>${ep(x.type)}</small></div>
      <div style="grid-column:span 2"><small>Proof</small><div style="word-break:break-word">${ep(x.proof)}</div></div>
      <div class="acts">${x.status === 'Pending' ? `<button class="ab ab-ok" title="Approve — add the reward" onclick="mjAct('${ep(x.id)}','approve')"><i class="fa-solid fa-check"></i></button><button class="ab ab-no" title="Reject" onclick="mjAct('${ep(x.id)}','reject')"><i class="fa-solid fa-xmark"></i></button>` : `<small>${ep(x.status)}${x.reason ? ' · ' + ep(x.reason) : ''}</small>`}</div></div>`; }).join('') : '<div class="hint">Nothing here.</div>';
}
async function mjBulk(op){
  const ids = [...document.querySelectorAll('#mjSubs .bk-ck:checked')].map(c => c.value); if(!ids.length){ toast('Tick the proofs first', 'w'); return; }
  let reason = '';
  if(op === 'reject'){ reason = prompt(`Reject ${ids.length} proof(s). Reason (the users see it):`, 'We could not confirm this task.'); if(reason === null) return; }
  else if(!confirm(`Approve ${ids.length} proof(s)? Each user gets the task reward in their Extra Balance.`)) return;
  showL(true); let done = 0, fail = 0;
  for(const id of ids){ const r = await window._accountApi('adminJobs', { op, id, reason }); r.ok ? done++ : fail++; }
  showL(false); await logAct(`Bulk micro job ${op}: ${done}${fail ? `, ${fail} failed` : ''}`, 'user', 'bulk');
  toast(`${done} done${fail ? ` · ${fail} failed` : ' ✓'}`, fail ? 'w' : 's'); mjLoad();
}
async function mjAct(id, op){
  const x = _MJS.find(y => y.id === id); if(!x) return; let reason = '';
  if(op === 'reject'){ reason = prompt('Reason (the user sees it):', 'We could not confirm this task.'); if(reason === null) return; }
  showL(true); const r = await window._accountApi('adminJobs', { op, id, reason }); showL(false);
  if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; }
  await logAct(`Micro job “${x.title}” ${op === 'approve' ? 'approved (+৳' + x.reward + ')' : 'rejected'} for ${x.uid}`, 'user', x.uid);
  toast(op === 'approve' ? 'Approved — reward added ✓' : 'Rejected', op === 'approve' ? 's' : 'e'); mjLoad();
}

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
    'ht-repay': (Hd.terms || {}).repay || '', 'ht-late': (Hd.terms || {}).late || '', 'ht-complaint': (Hd.terms || {}).complaint || '', 'ht-extra': (Hd.terms || {}).extra || '',
    'cb-on': _SV.help.callback.on !== false, 'cb-text': _SV.help.callback.text, 'cb-topics': (_SV.help.callback.topics || []).join('\n'), 'cb-slots': (_SV.help.callback.slots || []).join('\n') });
  if($p('cd-kind')) $p('cd-kind').value = 'redeem';
  fillIn({ 'vp-on': _SV.vip.on !== false, 'vp-hours': _SV.vip.hours, 'vp-normal': _SV.vip.normal, 'vf-on': _SV.verify.on !== false, 'vf-price': _SV.verify.price, 'vf-title': _SV.verify.title, 'vf-text': _SV.verify.text,
    'ck-on': _SV.checkin.on !== false, 'sp-on': _SV.spin.on !== false, 'sp-period': _SV.spin.period || 'month', 'vc-on': _SV.voucher.on !== false, 'vc-min': _SV.voucher.min, 'vc-max': _SV.voucher.max, 'vc-days': _SV.voucher.days,
    'cd-promo-on': _SV.codes.promo !== false, 'cd-redeem-on': _SV.codes.redeem !== false, 'bn-reqv': _SV.bonus.requireVerified !== false });
  vpRender(); ckRender(); spRender(); hbRender(); cdKind();
  proTabStart('services', 'orders');
  afterLoad('services');
  odLoad(); cdLoad(); vqLoad(); cbLoad();
  xsLoad().then(() => afterLoad('services'));
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
    terms: { repay: $p('ht-repay').value.trim(), late: $p('ht-late').value.trim(), complaint: $p('ht-complaint').value.trim(), extra: $p('ht-extra').value.trim() },
    offices: clean(_SV.help.offices, 'name'), callback: { on: chk('cb-on'), text: val('cb-text'), topics: lines('cb-topics'), slots: lines('cb-slots') } };
  if(_SV.extra) data.extra = xsData();
  await window._setDoc('siteConfig', 'services', data);
  await logAct('Services & Rewards saved', 'config', 'services');
}
window._SAVERS.services = { load: loadSvc, save: saveSvc, data: () => ({ 'VIP › Plans': _SV.vip.plans, 'Spin › Prizes': _SV.spin.prizes, 'Home tiles': _SV.hub.home }) };
// the pending-orders counter on the menu, shortly after login
setTimeout(function tick(){ if(window._db && (window._perm || {}).services !== 'none') window._getDocs('serviceOrders').then(o => { const n = o.filter(x => x.status === 'Pending').length; const b = $p('nb-svc'); if(b){ b.textContent = n; b.style.display = n ? '' : 'none'; } }).catch(() => {}); else setTimeout(tick, 4000); }, 5000);
