// Digital Services (below Quick Services): currency & MFS exchange, gift cards, SMM, virtual cards, promo codes,
// gift vouchers and games. Most are paid: the user sends the money (TrxID), the admin delivers the order by hand.
// The list lives in siteConfig/services → extra (Admin → Services & Rewards → Digital services).
// Orders: serviceOrders with kind 'extra' (Pending → Processing → Delivered, or Rejected).

const iso = (t = Date.now()) => new Date(t).toISOString();
const bdDay = (t = Date.now()) => new Date(t + 6 * 3600e3).toISOString().slice(0, 10);
const money = n => Math.round(Number(n) || 0);
const str = (v, n = 200) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, n);

const item = (id, name, price, note = '', cat = '', hot = false) => ({ id, name, price, note, on: true, cat, hot });
const pair = (id, name, o = {}) => ({ id, name, on: true, unit: '৳', rate: 1, pct: 1.5, fee: 0, min: 100, max: 25000, flow: 'buy', to: '', note: '', ...o });
const DEF = {
  on: true, title: 'Digital Services',
  services: [
    { id: 'exchange', name: 'Currency Exchange', short: 'Exchange', icon: 'fa-solid fa-money-bill-transfer', color: 'g-teal', mode: 'amount', on: true,
      desc: 'Buy or sell USDT and dollars at our daily rate. Our team sends it by hand after checking your payment.',
      fields: [{ label: 'Where we send it (wallet address or bKash/Nagad number)', req: true }],
      items: [pair('usdt-buy', 'Buy USDT (TRC20)', { unit: 'USDT', rate: 128, pct: 0, min: 5, max: 1000 }), pair('usdt-sell', 'Sell USDT (TRC20)', { unit: 'USDT', rate: 120, pct: 0, min: 5, max: 1000, flow: 'sell', note: 'Send the USDT to the address shown, then enter the transaction hash.' }),
        pair('usd-buy', 'Buy Dollar (Payoneer / Wise)', { unit: 'USD', rate: 130, pct: 0, min: 5, max: 500 })] },
    { id: 'giftcard', name: 'Gift Cards', short: 'Gift Cards', icon: 'fa-brands fa-google-play', color: 'g-purple', mode: 'items', on: true,
      desc: 'Google Play, iTunes, Steam and more. The code is sent to you here in My Orders.',
      fields: [{ label: 'Email', req: false }],
      items: [item('gp10', 'Google Play $10 (US)', 1450, '', 'Google Play', true), item('gp25', 'Google Play $25 (US)', 3500, '', 'Google Play'), item('it10', 'iTunes / Apple $10 (US)', 1500, '', 'Apple'), item('st10', 'Steam $10', 1450, '', 'Steam', true), item('st20', 'Steam $20', 2850, '', 'Steam')] },
    { id: 'smm', name: 'SMM & Premium', short: 'SMM', icon: 'fa-solid fa-hashtag', color: 'g-blue', mode: 'items', on: true,
      desc: 'Telegram Premium, Facebook page services and more premium social services.',
      fields: [{ label: 'Link or username', req: true }],
      items: [item('tgp3', 'Telegram Premium — 3 months (gift)', 1650, '', 'Telegram', true), item('tgp12', 'Telegram Premium — 12 months (gift)', 4300, '', 'Telegram'), item('fbmv', 'Meta Verified (blue badge) — 1 month setup', 1900, 'You need a real name and ID that match the profile.', 'Facebook', true),
        item('fbpage', 'Facebook page setup & design', 800, '', 'Facebook'), item('fbboost', 'Facebook page boost help', 500, '', 'Facebook')] },
    { id: 'games', name: 'Play & Earn', short: 'Games', icon: 'fa-solid fa-gamepad', color: 'g-pink', mode: 'game', on: true,
      desc: 'Beat the computer at Tic-Tac-Toe and get a small reward in your wallet.', fields: [], items: [] },
    { id: 'vcc', name: 'Virtual Card (VCC)', short: 'VCC', icon: 'fa-brands fa-cc-visa', color: 'g-gold', mode: 'items', on: true,
      desc: 'A prepaid virtual Visa or Mastercard in your own name, from a licensed card issuer, for online payments.',
      fields: [{ label: 'Full name (as on your NID)', req: true }, { label: 'Email', req: true }],
      items: [item('visa5', 'Virtual Visa — $5 balance', 950, '', 'Visa'), item('visa10', 'Virtual Visa — $10 balance', 1650, '', 'Visa', true), item('mc10', 'Virtual Mastercard — $10 balance', 1650, '', 'Mastercard')] },
    { id: 'promo', name: 'Daraz Promo Codes', short: 'Promo Codes', icon: 'fa-solid fa-tags', color: 'g-orange', mode: 'items', on: true,
      desc: 'Discount codes for Daraz shops. The code is sent to you here in My Orders.', fields: [],
      items: [item('dz100', 'Daraz ৳100 off code', 40), item('dz200', 'Daraz ৳200 off code', 80)] },
    { id: 'voucher', name: 'Gift Vouchers', short: 'Vouchers', icon: 'fa-solid fa-gift', color: 'g-red', mode: 'items', on: true,
      desc: 'Apex, Daraz and digital service vouchers — domains, hosting and more.', fields: [{ label: 'Details (domain name, email, etc.)', req: false }],
      items: [item('apex1k', 'Apex shoe voucher ৳1,000', 1000, '', 'Shopping'), item('dz500', 'Daraz gift card ৳500', 500, '', 'Shopping', true), item('dom', '.com domain — 1 year', 1550, '', 'Web'), item('host', 'Web hosting — 1 year (5 GB)', 1200, '', 'Web')] },
    { id: 'mfs', name: 'MFS Exchange', short: 'MFS Exchange', icon: 'fa-solid fa-right-left', color: 'g-green', mode: 'amount', on: true,
      desc: 'Move money between bKash, Nagad and Rocket. Send to our number, we send the amount to your number.',
      fields: [{ label: 'Your receiving number', req: true }],
      items: [pair('b2n', 'bKash → Nagad'), pair('n2b', 'Nagad → bKash'), pair('b2r', 'bKash → Rocket'), pair('r2b', 'Rocket → bKash'), pair('n2r', 'Nagad → Rocket'), pair('r2n', 'Rocket → Nagad')] }
  ],
  games: { on: true, reward: 1, perDay: 5, plays: 30, level: 75 },
  // Digital Balance: deposit once, pay for orders from it; direct = also allow paying each order with a TrxID
  wallet: { on: true, min: 50, max: 50000, direct: true },
  // deposit bonus: the best matching tier (by deposit amount) adds a % on top, up to a cap
  depBonus: { on: false, tiers: [{ min: 500, pct: 2 }, { min: 2000, pct: 3 }, { min: 5000, pct: 5 }], max: 500 },
  // mobile recharge (Quick Services): Verified and VIP members only, paid from Digital Balance, done by hand
  recharge: { on: true, min: 20, max: 1000, ops: ['Grameenphone', 'Robi', 'Airtel', 'Banglalink', 'Teletalk'] },
  // micro jobs: tasks a user finishes and proves; the admin checks and adds the reward to Digital Balance
  jobs: { on: true, tasks: [] },
  live: { on: true, count: 12 },
  // Verified exclusive: no service charge on fixed-price services and no transaction fee on exchanges
  perk: { on: true, chargePct: 5, chargeMin: 10 },
  // shown on the home page, after applying and in the application details
  loanNotice: { on: true, days: '7–14' },
  // a special tile that opens on one weekday (Bangladesh time) with that day's deals (from the weekday deals list)
  redFriday: { on: true, title: 'Red Friday', day: 5, text: 'Our biggest prices of the week — one day only.' }
};

const JOB_TYPES = ['join', 'visit', 'signup', 'form', 'survey', 'share', 'refer', 'other'];
function bonusFor(B, amount) { if (!B || !B.on) return 0; const t = [...B.tiers].reverse().find(x => amount >= x.min); return t ? Math.min(B.max || Infinity, Math.floor(amount * t.pct / 100)) : 0; }
// who can order a service: everyone, Verified (or VIP) members, any VIP, or VIP plan 1 / 2 / 3 and above
const ACCESS = ['all', 'verified', 'vip', 'vip1', 'vip2', 'vip3'];
// VIP level = the plan's place in Admin → VIP plans (1 = first plan); 0 = not VIP
function vipLevel(v, plans) { if (!v) return 0; const i = (plans || []).findIndex(p => p.id === v.plan); return i < 0 ? 1 : i + 1; }
// services: any VIP plan opens a VIP service (VIP 1 / 2 / 3 only sets how early a loan is reviewed);
// older settings with a plan level read as plain VIP
function canUse(access, verified, level) {
  if (!access || access === 'all' || access === 'verified') return true;
  if (/^vip/.test(access)) return level > 0;
  if (access === 'verified') return verified || level > 0;
  if (access === 'vip') return level > 0;
  return level >= Number(access.slice(3));
}
const accessText = a => (/^vip/.test(a || '') ? 'VIP members (any VIP plan)' : '');
// a service on trial until a set time: after it ends, it closes by itself (no order can be placed)
function trial(s) {
  const end = s.trialEnd ? new Date(s.trialEnd).getTime() : 0, st = ['open', 'busy', 'closed'].includes(s.status) ? s.status : 'open';
  if (end && end <= Date.now()) return { status: 'closed', statusNote: str(s.trialNote, 160) || 'This trial has ended. Thank you for trying it!', trialEnd: str(s.trialEnd, 40), trialOver: true };
  return { status: st, statusNote: str(s.statusNote, 160), trialEnd: end ? str(s.trialEnd, 40) : '' };
}
function norm(x) {
  x = x || {};
  const list = Array.isArray(x.services) ? x.services : DEF.services;
  return {
    on: x.on !== false, title: /^(extra|additional) services?$/i.test(String(x.title || '').trim()) ? DEF.title : str(x.title || DEF.title, 40),
    services: list.filter(s => s && s.id && s.name).map(s => ({
      id: str(s.id, 30), name: str(s.name, 40), short: str(s.short || s.name, 16), logo: str(s.logo, 500), icon: str(s.icon || 'fa-solid fa-star', 60), color: str(s.color || 'g-teal', 20),
      mode: ['items', 'amount', 'game'].includes(s.mode) ? s.mode : 'items', on: s.on !== false, soon: s.soon === true, badge: str(s.badge, 14), desc: str(s.desc, 400), note: str(s.note, 400),
      access: /^vip/.test(s.access || '') ? 'vip' : 'all', ...trial(s),
      eta: str(s.eta, 40), deliver: s.deliver === 'email' ? 'email' : '', ver: str(s.ver, 12), verKind: s.verKind === 'fixed' ? 'fixed' : s.verKind === 'updated' ? 'updated' : '', verNote: str(s.verNote, 160), verAt: str(s.verAt, 40),
      fields: (Array.isArray(s.fields) ? s.fields : []).filter(f => f && f.label).slice(0, 6).map(f => ({ label: str(f.label, 60), req: f.req === true })),
      items: (Array.isArray(s.items) ? s.items : []).filter(i => i && i.id && i.name).slice(0, 60).map(i => ({
        id: str(i.id, 30), name: str(i.name, 60), on: i.on !== false, note: str(i.note, 300), price: money(i.price), to: str(i.to, 120),
        unit: str(i.unit || '৳', 8), rate: Math.max(0, Number(i.rate) || 0) || 1, pct: Math.max(0, Math.min(50, Number(i.pct) || 0)), fee: money(i.fee),
        min: Math.max(0, Number(i.min) || 0), max: Math.max(0, Number(i.max) || 0), flow: i.flow === 'sell' ? 'sell' : 'buy',
        offer: money(i.offer), offerEnd: str(i.offerEnd, 40), cat: str(i.cat, 24), group: str(i.group, 24), hot: i.hot === true,
        rating: Math.max(0, Math.min(5, Math.round((Number(i.rating) || 0) * 10) / 10)), region: str(i.region, 30), eta: str(i.eta, 40),
        stock: i.stock === '' || i.stock === null || i.stock === undefined || Number(i.stock) < 0 || isNaN(Number(i.stock)) ? null : Math.floor(Number(i.stock)), lowAt: Math.max(0, Math.floor(Number(i.lowAt ?? 3) || 0)),
        icon: /^https:\/\//i.test(String(i.icon || '')) ? str(i.icon, 500) : str(i.icon, 60), color: str(i.color, 20) }))
    })),
    deals: (Array.isArray(x.deals) ? x.deals : []).filter(d => d && d.sid && d.iid && money(d.price) > 0).slice(0, 30).map(d => ({ id: str(d.id || d.sid + d.iid, 30), sid: str(d.sid, 30), iid: str(d.iid, 30),
      price: money(d.price), on: d.on !== false, days: (Array.isArray(d.days) ? d.days : []).map(Number).filter(n => n >= 0 && n <= 6) })),
    games: { ...DEF.games, ...(x.games || {}) },
    depBonus: { on: (x.depBonus || {}).on === true, max: money((x.depBonus || {}).max ?? DEF.depBonus.max),
      tiers: (Array.isArray((x.depBonus || {}).tiers) ? x.depBonus.tiers : DEF.depBonus.tiers).map(t => ({ min: money(t.min), pct: Math.max(0, Math.min(100, Number(t.pct) || 0)) })).filter(t => t.min > 0 && t.pct > 0).sort((a, b) => a.min - b.min).slice(0, 8) },
    recharge: { on: (x.recharge || {}).on !== false, min: Math.max(10, money((x.recharge || {}).min ?? DEF.recharge.min)), max: Math.max(10, money((x.recharge || {}).max ?? DEF.recharge.max)),
      ops: (Array.isArray((x.recharge || {}).ops) && x.recharge.ops.length ? x.recharge.ops : DEF.recharge.ops).map(o => str(o, 24)).filter(Boolean).slice(0, 10) },
    jobs: { on: (x.jobs || {}).on !== false, tasks: (Array.isArray((x.jobs || {}).tasks) ? x.jobs.tasks : []).filter(t => t && t.id && t.title).slice(0, 100).map(t => ({
      id: str(t.id, 30), title: str(t.title, 80), type: JOB_TYPES.includes(t.type) ? t.type : 'other', link: /^https?:\/\//i.test(String(t.link || '')) ? str(t.link, 400) : '',
      reward: money(t.reward), steps: str(t.steps, 800), proof: str(t.proof || 'Your username, email or a screenshot link', 120), slots: money(t.slots), on: t.on !== false, until: str(t.until, 40) })) },
    wallet: { ...DEF.wallet, ...(x.wallet || {}), min: Math.max(1, money((x.wallet || {}).min ?? DEF.wallet.min)), max: money((x.wallet || {}).max ?? DEF.wallet.max) },
    perk: { ...DEF.perk, ...(x.perk || {}), on: (x.perk || {}).on !== false, chargePct: Math.max(0, Math.min(50, Number((x.perk || {}).chargePct ?? DEF.perk.chargePct) || 0)), chargeMin: money((x.perk || {}).chargeMin ?? DEF.perk.chargeMin) },
    redFriday: { on: (x.redFriday || {}).on !== false, title: str((x.redFriday || {}).title || DEF.redFriday.title, 24), day: Math.max(0, Math.min(6, Math.round(Number((x.redFriday || {}).day ?? DEF.redFriday.day)))), text: str((x.redFriday || {}).text ?? DEF.redFriday.text, 160) },
    loanNotice: { on: (x.loanNotice || {}).on !== false, days: str((x.loanNotice || {}).days || DEF.loanNotice.days, 20) },
    live: { ...DEF.live, ...(x.live || {}), count: Math.max(3, Math.min(30, money((x.live || {}).count) || DEF.live.count)) }
  };
}
// offers with a real end: (1) an offer price until a set date and time, (2) a deal on chosen weekdays (Bangladesh time).
// Once the time is over the regular price is back — nothing restarts.
const BD = 6 * 3600e3;
const bdWeekday = (t = Date.now()) => new Date(t + BD).getUTCDay();
function bdMidnight(t = Date.now()) { const d = new Date(t + BD); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - BD; }
function priceNow(C, s, i, t = Date.now()) {
  let price = i.price, kind = '', ends = '';
  if (s.mode !== 'amount') {
    const end = i.offerEnd ? new Date(i.offerEnd).getTime() : 0;
    if (i.offer > 0 && i.offer < price && end > t) { price = i.offer; kind = 'offer'; ends = new Date(end).toISOString(); }
    const d = (C.deals || []).find(x => x.on && x.sid === s.id && x.iid === i.id && x.days.includes(bdWeekday(t)) && x.price < price);
    if (d) { price = d.price; kind = 'deal'; ends = new Date(bdMidnight(t)).toISOString(); }
  }
  return { price, was: i.price, kind, ends };
}

// what the user pays (buy) or gets (sell) for an amount
// Verified members pay no service charge and no transaction fee (the perk; Admin → Digital services)
function quote(s, i, amount, verified, P) {
  const free = !!(P && P.on && verified);
  if (s.mode !== 'amount') {
    const fee = P && P.on && !verified ? Math.max(money(P.chargeMin), Math.ceil(i.price * (Number(P.chargePct) || 0) / 100)) : 0;
    return { base: i.price, fee, saved: free ? Math.max(money(P.chargeMin), Math.ceil(i.price * (Number(P.chargePct) || 0) / 100)) : 0, pay: i.price + fee, get: 0, waived: free };
  }
  const base = amount * i.rate, f = base * i.pct / 100 + i.fee;
  if (i.flow === 'sell') return { base: Math.floor(base), fee: free ? 0 : Math.ceil(f), saved: free ? Math.ceil(f) : 0, pay: 0, get: Math.max(0, Math.floor(free ? base : base - f)), waived: free };
  return { base: Math.ceil(base), fee: free ? 0 : Math.ceil(f), saved: free ? Math.ceil(f) : 0, pay: Math.ceil(free ? base : base + f), get: amount, waived: free };
}

// tic-tac-toe
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = b => { for (const [a, c, d] of LINES) if (b[a] !== '.' && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.includes('.') ? '' : 'draw'; };
function cpu(b, level) {
  const free = [...b].map((v, i) => v === '.' ? i : -1).filter(i => i >= 0);
  const finish = p => free.find(i => { const t = b.split(''); t[i] = p; return winner(t.join('')) === p; });
  const w = finish('O'); if (w !== undefined) return w;
  const blk = finish('X'); if (blk !== undefined && Math.random() * 100 < level) return blk;
  if (b[4] === '.' && Math.random() < .6) return 4;
  return free[Math.floor(Math.random() * free.length)];
}

module.exports = function extra({ db, findUserDoc, isAdmin, adminCan, notifyUser, isPhone, SVC }) {
  async function cfg() { try { const s = await db().collection('siteConfig').doc('services').get(); return norm(s.exists ? s.data().extra : null); } catch (e) { return norm(null); } }
  async function me(uid) {
    const d = await findUserDoc(uid);
    if (!d) throw Object.assign(new Error('Account not found.'), { status: 404 });
    const u = d.data() || {};
    if (['banned', 'suspended'].includes(u.status)) throw Object.assign(new Error('Your account is suspended. Please contact support.'), { status: 403 });
    return { d, u };
  }
  const wrap = fn => async (b, user) => {
    if (!user) return [401, { error: 'Please login again.' }];
    try { return await fn(b, user.uid, user); }
    catch (e) { if (e.status) return [e.status, { error: e.message, ...(e.code ? { code: e.code } : {}) }]; throw e; }
  };
  let _live = null;
  // add (or take) Digital Balance and write a history line — one transaction; `also` adds more writes to it
  async function xcredit(ref, uid, amount, type, note, extra = {}, also) {
    const log = db().collection('xbalLog').doc();
    let after = 0;
    await db().runTransaction(async t => {
      const s = await t.get(ref);
      after = (Number((s.data() || {}).xbal) || 0) + amount;
      if (after < 0) throw Object.assign(new Error('Not enough Digital Balance. Please add balance first.'), { status: 400, code: 'xbal_low' });
      t.update(ref, { xbal: after });
      t.set(log, { uid, amount, type, note: String(note || '').slice(0, 140), after, at: iso(), ...extra });
      if (also) also(t);
    });
    return after;
  }
  const mask = p => { p = String(p || ''); return p.length >= 6 ? '0' + p.slice(0, 2) + '****' + p.slice(-3) : 'A user'; };
  async function feed(uid, text, s) { try { await db().collection('extraFeed').add({ who: mask(uid), text: str(text, 80), icon: s ? s.icon : 'fa-solid fa-wallet', color: s ? s.color : 'g-green', at: iso() }); _live = null; } catch (e) {} }
  // deposit coupon check (kind 'deposit'): active, dates, uses, per person, audience, minimum deposit → the bonus
  async function depCoupon(code, uid, amount) {
    const c = String(code || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
    const s = await db().collection('promoCodes').doc(c).get(); const p = s.exists ? s.data() : null;
    const no = m => { throw Object.assign(new Error(m), { status: 400 }); };
    if (!p || p.kind !== 'deposit') no('This coupon is not valid for deposits.');
    if (p.on === false) no('This coupon is switched off.');
    const now = Date.now();
    if (p.start && new Date(p.start).getTime() > now) no('This coupon is not active yet.');
    if (p.end && new Date(p.end).getTime() < now) no('This coupon has expired.');
    if (Number(p.maxUses) > 0 && (Number(p.uses) || 0) >= Number(p.maxUses)) no('This coupon has been fully used.');
    if (Number(p.minDeposit) > 0 && amount < Number(p.minDeposit)) no(`This coupon needs a deposit of at least ৳${p.minDeposit}.`);
    const u = (await me(uid)).u;
    if (p.audience === 'verified' && u.phoneVerified !== true) no('This coupon is for Verified members.');
    if (p.audience === 'vip' && !SVC.vipState(u)) no('This coupon is for VIP members.');
    const per = Math.max(1, Number(p.perUser) || 1);
    const [used, pend] = await Promise.all([db().collection('promoUses').where('code', '==', c).where('uid', '==', uid).get(), db().collection('serviceOrders').where('uid', '==', uid).get()]);
    const waiting = pend.docs.filter(x => x.data().kind === 'xdeposit' && x.data().coupon === c && x.data().status === 'Pending').length;
    if (used.size + waiting >= per) no(per === 1 ? 'You have already used this coupon.' : `You can use this coupon ${per} times only.`);
    const v = Number(p.value) || 0;
    let bonus = p.type === 'flat' ? Math.round(v) : Math.floor(amount * v / 100);
    if (Number(p.maxBonus) > 0) bonus = Math.min(bonus, Number(p.maxBonus));
    return { code: c, bonus: Math.max(0, bonus), label: p.label || '' };
  }
  const pubOrder = o => ({ id: o.id, sid: o.sid, sname: o.sname, iname: o.iname, unit: o.unit, amount: o.amount, price: o.price, get: o.get, fee: o.fee || 0, feeWaived: o.feeWaived === true, saved: o.saved || 0, flow: o.flow, fields: o.fields || [], trxId: o.trxId,
    status: o.status, reason: o.reason || '', delivery: o.status === 'Delivered' ? (o.delivery || '') : '', createdAt: o.createdAt, decidedAt: o.decidedAt || '' });

  // one less in stock; tell the admins on Telegram when it gets low (the admin panel also shows a low-stock banner)
  async function takeStock(sid, iid) {
    const ref = db().collection('siteConfig').doc('services'); let left = null, name = '', low = 3;
    await db().runTransaction(async t => {
      const snap = await t.get(ref); const x = (snap.exists && snap.data().extra) || {}; const list = Array.isArray(x.services) ? x.services : [];
      const sv = list.find(v => v && v.id === sid), it = sv && (sv.items || []).find(v => v && v.id === iid);
      if (!it || it.stock === '' || it.stock === null || it.stock === undefined || Number(it.stock) < 0) return;
      it.stock = Math.max(0, Math.floor(Number(it.stock) || 0) - 1); left = it.stock; name = `${sv.name} · ${it.name}`; low = Math.max(0, Math.floor(Number(it.lowAt ?? 3) || 0));
      t.update(ref, { 'extra.services': list });
    });
    if (left !== null && left <= low) {
      const txt = left === 0 ? `⛔ Out of stock: ${name}` : `⚠️ Low stock: ${name} — only ${left} left`;
      const TG = require('./tg'); if (TG.configured()) { const A = await require('./alerts').admins(db); await Promise.all(A.map(a => TG.call('sendMessage', { chat_id: a.chat, text: txt + '\nRestock it in Admin → Services → Digital services.' }).catch(() => {}))); }
    }
  }
  const actions = {
    // a user's idea for a new service, kept per section (scope) so ideas do not get mixed: 'x:<service id>', 'q:<category>', 'x:all'
    suggest: wrap(async (b, uid) => {
      const scope = str(b.scope, 60).replace(/[^\w:.-]/g, ''), text = str(b.text, 500);
      if (!/^[xq]:[\w.-]{1,50}$/.test(scope)) return [400, { error: 'Please try again.' }];
      if (text.length < 4) return [400, { error: 'Please write a few words about the service you want.' }];
      const day = new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 10);
      const mine = await db().collection('suggestions').where('uid', '==', uid).get();
      if (mine.docs.filter(x => String(x.data().createdAt || '').slice(0, 10) >= day).length >= 5) return [429, { error: 'You can send up to 5 suggestions a day. Thank you!' }];
      await db().collection('suggestions').add({ uid, scope, label: str(b.label, 60), text, status: 'new', createdAt: iso() });
      return [200, { ok: true }];
    }),
    // good news to everyone (new service / item / task / bonus, or a service update or fix) — admins only
    adminAnnounce: async (b, user) => {
      if (!user || !(await isAdmin(user.uid))) return [403, { error: 'Admins only.' }];
      const lines = (Array.isArray(b.lines) ? b.lines : []).slice(0, 8);
      if (!lines.length) return [400, { error: 'Nothing to announce.' }];
      const out = await require('./announce').announce(db, { lines, link: /^\/\?go=[\w-]+$/.test(String(b.link || '')) ? b.link : '/?go=extra', where: b.where || {} });
      await db().collection('announcements').add({ lines, out, by: user.uid, at: iso() }).catch(() => {});
      return [200, { ok: true, out }];
    },
    adminSuggestions: async (b, user) => {
      if (!user || !(await isAdmin(user.uid))) return [403, { error: 'Admins only.' }];
      if (b.op === 'done' && b.id) { await db().collection('suggestions').doc(str(b.id, 60)).update({ status: b.status === 'new' ? 'new' : 'seen' }); return [200, { ok: true }]; }
      if (b.op === 'delete' && b.id) { await db().collection('suggestions').doc(str(b.id, 60)).delete(); return [200, { ok: true }]; }
      const s = await db().collection('suggestions').get();
      return [200, { list: s.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, c) => String(c.createdAt).localeCompare(String(a.createdAt))).slice(0, 300) }];
    },
    extraConfig: async () => [200, await cfg()],

    extraOrder: wrap(async (b, uid) => {
      const { d, u } = await me(uid);
      const C = await cfg();
      if (!C.on) return [400, { error: 'Digital services are switched off right now.' }];
      const s = C.services.find(x => x.id === b.sid && x.on && !x.soon && x.mode !== 'game');
      if (!s) return [400, { error: 'This service is not available right now.' }];
      if (s.status === 'closed') return [400, { error: s.statusNote || 'This service is closed right now. Please try again later.' }];
      if (s.access !== 'all') {
        const sc = await db().collection('siteConfig').doc('services').get().catch(() => null);
        const plans = (sc && sc.exists && sc.data().vip && sc.data().vip.plans) || [];
        if (!canUse(s.access, u.phoneVerified === true, vipLevel(SVC.vipState(u), plans))) return [403, { error: `This service is for ${accessText(s.access)}.`, need: s.access }];
      }
      const i = s.items.find(x => x.id === b.iid && x.on);
      if (!i) return [400, { error: 'Please choose an option.' }];
      let amount = 0;
      if (s.mode === 'amount') {
        amount = Math.round((Number(b.amount) || 0) * 100) / 100;
        if (!(amount > 0)) return [400, { error: 'Please enter the amount.' }];
        if (i.min && amount < i.min) return [400, { error: `The smallest amount is ${i.min} ${i.unit}.` }];
        if (i.max && amount > i.max) return [400, { error: `The largest amount is ${i.max} ${i.unit}.` }];
      }
      // Verified and VIP members both get the exclusive: no charge, no fee
      const pn = priceNow(C, s, i);
      const q = quote(s, { ...i, price: pn.price }, amount, u.phoneVerified === true || !!SVC.vipState(u), C.perk);
      const vals = Array.isArray(b.fields) ? b.fields : [];
      const fields = s.fields.map((f, k) => ({ label: f.label, value: str(vals[k], 300) }));
      const miss = s.fields.find((f, k) => f.req && !fields[k].value);
      if (miss) return [400, { error: `Please fill in: ${miss.label}` }];
      // out of stock / region confirmed / where to send a digital product
      if (i.stock !== null && i.stock <= 0) return [400, { error: 'Sorry, this item is out of stock right now.', code: 'stock' }];
      if (i.region && b.regionOk !== true) return [400, { error: `Please confirm that your account region is ${i.region}.`, code: 'region' }];
      if (s.deliver === 'email') {
        const em = str(b.email, 120).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(em)) return [400, { error: 'Please enter the email where we should send it.', code: 'email' }];
        fields.push({ label: 'Delivery email', value: em });
      }
      if (i.region) fields.push({ label: 'Region (confirmed)', value: i.region });
      const mine = await db().collection('serviceOrders').where('uid', '==', uid).get();
      if (mine.docs.filter(x => x.data().kind === 'extra' && ['Pending', 'Processing'].includes(x.data().status)).length >= 5) return [400, { error: 'You have 5 orders in progress. Please wait until they are delivered.' }];
      // pay from the Digital Balance (buy options only), or send money and give the TrxID
      const useBal = b.payWith === 'xbal' && i.flow !== 'sell';
      let trxId;
      if (useBal) {
        if (!C.wallet.on) return [400, { error: 'Digital Balance is switched off right now.' }];
        trxId = 'XB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
      } else {
        if (i.flow !== 'sell' && !C.wallet.direct) return [400, { error: 'Please pay from your Digital Balance. Add balance first.' }];
        trxId = String(b.trxId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 80);
        if (trxId.length < 6) return [400, { error: i.flow === 'sell' ? 'Please enter the transaction ID / hash of what you sent.' : 'Please enter the Transaction ID from your payment SMS.' }];
        const [dupO, dupT] = await Promise.all([db().collection('serviceOrders').where('trxId', '==', trxId).limit(1).get(), db().collection('transactions').doc('trx_' + trxId).get()]);
        if (!dupO.empty || dupT.exists) { db().collection('riskEvents').add({ type: 'dupTrx', uid, trxId, at: new Date().toISOString() }).catch(() => {}); return [400, { error: 'This Transaction ID has already been used.' }]; }
      }
      const sender = String(b.sender || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      const ref = db().collection('serviceOrders').doc();
      const order = { uid, kind: 'extra', sid: s.id, sname: s.name, iid: i.id, iname: i.name, planName: `${s.name} · ${i.name}`, unit: i.unit, flow: i.flow,
        amount, price: q.pay, get: q.get, base: q.base, regular: pn.was, offerKind: pn.kind, fee: q.fee, feeWaived: q.waived, saved: q.saved, fields, trxId, paidWith: useBal ? 'xbal' : 'trx', sender: isPhone(sender) ? sender : '', payMethod: useBal ? 'Digital Balance' : str(b.payMethod, 30),
        toNumber: useBal ? '' : str(b.toNumber || i.to, 120), status: useBal ? 'Processing' : 'Pending', createdAt: iso() };
      let xbal = null;
      if (useBal) xbal = await xcredit(d.ref, uid, -q.pay, 'order', `${s.name} · ${i.name}`, { orderId: ref.id }, t => t.set(ref, order));
      else await ref.set(order);
      await require('./alerts').notify(db, 'order', ref.id, order);
      if (i.stock !== null) await takeStock(s.id, i.id).catch(e => console.error('stock', e.message));
      await feed(uid, `ordered ${i.name}`, s);
      await notifyUser(uid, 'Order received 🛒', `${s.name} · ${i.name}${amount ? ` (${amount} ${i.unit})` : ''} — ${useBal ? `paid ৳${q.pay} from your Digital Balance` : 'TrxID ' + trxId}. Our team will deliver it soon. See Digital Services → My orders.`, 'transaction');
      return [200, { ok: true, id: ref.id, xbal }];
    }),

    extraOrders: wrap(async (b, uid) => {
      const s = await db().collection('serviceOrders').where('uid', '==', uid).get();
      const list = s.docs.map(x => ({ id: x.id, ...x.data() })).filter(o => o.kind === 'extra').sort((a, c) => String(c.createdAt).localeCompare(String(a.createdAt))).slice(0, 50).map(pubOrder);
      return [200, { list }];
    }),

    // Digital Balance: a separate balance only for Digital Services (not the loan balance, not for loan fees)
    xbalState: wrap(async (b, uid) => {
      const { u } = await me(uid);
      const [lg, od] = await Promise.all([db().collection('xbalLog').where('uid', '==', uid).get(), db().collection('serviceOrders').where('uid', '==', uid).get()]);
      const log = lg.docs.map(x => x.data()).sort((a, c) => String(c.at).localeCompare(String(a.at))).slice(0, 40);
      const deposits = od.docs.map(x => ({ id: x.id, ...x.data() })).filter(o => o.kind === 'xdeposit').sort((a, c) => String(c.createdAt).localeCompare(String(a.createdAt))).slice(0, 10)
        .map(o => ({ id: o.id, amount: o.price, trxId: o.trxId, status: o.status, reason: o.reason || '', createdAt: o.createdAt }));
      return [200, { xbal: Number(u.xbal) || 0, balance: Number(u.balance) || 0, log, deposits, verified: u.phoneVerified === true, vip: !!SVC.vipState(u) }];
    }),
    // check a deposit coupon before sending the money
    depositCoupon: wrap(async (b, uid) => { const amount = money(b.amount); const q = await depCoupon(b.code, uid, amount); return [200, { ok: true, ...q }]; }),
    xbalDeposit: wrap(async (b, uid) => {
      await me(uid);
      const C = await cfg(), W = C.wallet;
      if (!W.on) return [400, { error: 'Digital Balance is switched off right now.' }];
      const amount = money(b.amount);
      if (amount < W.min) return [400, { error: `The smallest deposit is ৳${W.min}.` }];
      if (W.max && amount > W.max) return [400, { error: `The largest deposit is ৳${W.max}.` }];
      const trxId = String(b.trxId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40);
      if (trxId.length < 6) return [400, { error: 'Please enter the Transaction ID from your payment SMS.' }];
      const [dupO, dupT] = await Promise.all([db().collection('serviceOrders').where('trxId', '==', trxId).limit(1).get(), db().collection('transactions').doc('trx_' + trxId).get()]);
      if (!dupO.empty || dupT.exists) { db().collection('riskEvents').add({ type: 'dupTrx', uid, trxId, at: new Date().toISOString() }).catch(() => {}); return [400, { error: 'This Transaction ID has already been used.' }]; }
      const mine = await db().collection('serviceOrders').where('uid', '==', uid).get();
      if (mine.docs.filter(x => x.data().kind === 'xdeposit' && x.data().status === 'Pending').length >= 3) return [400, { error: 'You have 3 deposits waiting for check. Please wait a little.' }];
      const sender = String(b.sender || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      // a deposit coupon: checked now, its bonus is added when the deposit is approved
      let coupon = '', cbonus = 0;
      if (b.coupon) { const q = await depCoupon(b.coupon, uid, amount); coupon = q.code; cbonus = q.bonus; }
      const ref = await db().collection('serviceOrders').add({ uid, kind: 'xdeposit', planName: 'Digital Balance deposit', sname: 'Digital Balance', iname: 'Deposit', price: amount, trxId, coupon, couponBonus: cbonus,
        sender: isPhone(sender) ? sender : '', payMethod: str(b.payMethod, 30), toNumber: str(b.toNumber, 40), status: 'Pending', createdAt: iso() });
      await require('./alerts').notify(db, 'order', ref.id, { uid, kind: 'xdeposit', price: amount, trxId, coupon, couponBonus: cbonus, status: 'Pending' });
      await notifyUser(uid, 'Deposit received 💳', `We received your Digital Balance deposit of ৳${amount} (TrxID ${trxId}). It is added as soon as we check it.`, 'transaction');
      return [200, { ok: true, id: ref.id }];
    }),

    // live list under Digital Services: the latest real orders and deposits (numbers are masked)
    async extraLive() {
      const C = await cfg();
      if (!C.on || !C.live.on) return [200, { list: [] }];
      if (_live && Date.now() - _live.t < 20e3) return [200, { list: _live.list }];
      let list = [];
      try { const s = await db().collection('extraFeed').orderBy('at', 'desc').limit(C.live.count).get(); list = s.docs.map(x => x.data()); } catch (e) {}
      _live = { t: Date.now(), list };
      return [200, { list }];
    },

    // admin: Processing / Delivered (with the code or details) / Rejected; deposits: approve / reject
    async adminExtraOrder(b, user) {
      if (!user || !(await isAdmin(user.uid))) return [403, { error: 'Admin login required.' }];
      if (!(await adminCan(user, ['services']))) return [403, { error: 'Your admin role does not allow this.' }];
      const ref = db().collection('serviceOrders').doc(String(b.id || ''));
      const s = await ref.get();
      if (!s.exists || !['extra', 'xdeposit'].includes(s.data().kind)) return [404, { error: 'Order not found.' }];
      const o = s.data();
      if (!['Pending', 'Processing'].includes(o.status)) return [400, { error: 'This order is already ' + o.status + '.' }];
      const ud = await findUserDoc(o.uid);
      if (o.kind === 'xdeposit') {
        if (b.op === 'deliver' || b.op === 'approve') {
          if (!ud) return [404, { error: 'The user no longer exists.' }];
          const C = await cfg(), bonus = bonusFor(C.depBonus, o.price);
          await xcredit(ud.ref, o.uid, o.price, 'deposit', `Deposit · TrxID ${o.trxId}`, { orderId: s.id }, t => t.update(ref, { status: 'Approved', bonus, decidedAt: iso(), decidedBy: user.uid }));
          if (bonus > 0) await xcredit(ud.ref, o.uid, bonus, 'bonus', `Deposit bonus on ৳${o.price}`, { orderId: s.id });
          // the coupon: counted once, at approval (a fixed usage record, so it cannot be used twice)
          let cb = 0;
          if (o.coupon && o.couponBonus > 0) {
            try {
              await db().runTransaction(async t => {
                const cref = db().collection('promoCodes').doc(o.coupon), use = db().collection('promoUses').doc(`${o.coupon}_${o.uid}_${s.id}`);
                const c = await t.get(cref), u2 = await t.get(use); if (!c.exists || u2.exists) return;
                const x = c.data(); if (x.on === false || (Number(x.maxUses) > 0 && (Number(x.uses) || 0) >= Number(x.maxUses))) return;
                t.update(cref, { uses: (Number(x.uses) || 0) + 1, lastUsedAt: iso() }); t.set(use, { code: o.coupon, uid: o.uid, kind: 'deposit', amount: o.couponBonus, appId: s.id, at: iso() }); cb = o.couponBonus;
              });
              if (cb) await xcredit(ud.ref, o.uid, cb, 'bonus', `Coupon ${o.coupon} on ৳${o.price}`, { orderId: s.id });
            } catch (e) { console.warn('coupon', e.message); }
          }
          await feed(o.uid, `added ৳${o.price} Digital Balance`, null);
          await notifyUser(o.uid, 'Digital Balance added ✅', `৳${o.price} is added to your Digital Balance${bonus ? ` + ৳${bonus} deposit bonus` : ''}${cb ? ` + ৳${cb} coupon bonus` : ''}. You can order any Digital Service now.`, 'success');
        } else if (b.op === 'reject') {
          const reason = str(b.reason, 200);
          await ref.update({ status: 'Rejected', reason, decidedAt: iso(), decidedBy: user.uid });
          await notifyUser(o.uid, 'Deposit not approved', `Your Digital Balance deposit of ৳${o.price} (TrxID ${o.trxId}) could not be approved.${reason ? ' Reason: ' + reason : ''}`, 'warning');
        } else return [400, { error: 'Unknown action.' }];
        return [200, { ok: true }];
      }
      const what = `${o.sname} · ${o.iname}`;
      if (b.op === 'process') {
        await ref.update({ status: 'Processing', processAt: iso(), processBy: user.uid });
        await notifyUser(o.uid, 'Order in progress ⏳', `Your payment for ${what} is confirmed. We are preparing your order now.`, 'info');
      } else if (b.op === 'deliver') {
        const text = String(b.text || '').trim().slice(0, 2000);
        await ref.update({ status: 'Delivered', delivery: text, decidedAt: iso(), decidedBy: user.uid });
        await notifyUser(o.uid, 'Order delivered ✅', `${what} is delivered.${text ? ' Open Digital Services → My orders to see the details.' : ''}`, 'success');
      } else if (b.op === 'reject') {
        const reason = str(b.reason, 200);
        // paid from the Digital Balance: the money goes straight back
        // paid from the Creditfy balance (Quick Services, e.g. Mobile Recharge): back to the Creditfy balance
        if (o.paidWith === 'main' && o.price > 0 && ud) { await ref.update({ status: 'Rejected', reason, refunded: true, decidedAt: iso(), decidedBy: user.uid }); await SVC.credit(ud.ref, o.uid, o.price, 'refund', `Refund · ${what}`); }
        else if (o.paidWith === 'xbal' && o.price > 0 && ud) await xcredit(ud.ref, o.uid, o.price, 'refund', `Refund · ${what}`, { orderId: s.id }, t => t.update(ref, { status: 'Rejected', reason, refunded: true, decidedAt: iso(), decidedBy: user.uid }));
        else await ref.update({ status: 'Rejected', reason, decidedAt: iso(), decidedBy: user.uid });
        await notifyUser(o.uid, 'Order not completed', `Your order ${what} could not be completed.${reason ? ' Reason: ' + reason : ''} ${o.paidWith === 'xbal' ? `৳${o.price} is back in your Digital Balance.` : o.paidWith === 'main' ? `৳${o.price} is back in your Creditfy balance.` : 'Please contact support if you paid.'}`, 'warning');
      } else return [400, { error: 'Unknown action.' }];
      return [200, { ok: true }];
    },

    // mobile recharge: Verified and VIP members only; paid from Digital Balance; the team sends it by hand
    rechargeOrder: wrap(async (b, uid) => {
      const { d, u } = await me(uid);
      const C = await cfg(), R = C.recharge;
      if (!R.on) return [400, { error: 'Mobile recharge is switched off right now.' }];
      // who can recharge: the Mobile Recharge tile's "Who can open it" (Admin → Quick Services); VIP when not set
      { const sc = await db().collection('siteConfig').doc('services').get().catch(() => null); const D = (sc && sc.exists && sc.data()) || {};
        let acc = (((D.hub || {}).tiles || {}).recharge || {}).access || 'vip'; if (acc === 'verified') acc = 'vip';
        if (!canUse(acc, false, vipLevel(SVC.vipState(u), (D.vip || {}).plans || []))) return [403, { error: `Mobile recharge is for ${accessText(acc)}.`, code: 'vip_required' }]; }
      const op = R.ops.find(o => o === b.op); if (!op) return [400, { error: 'Please choose the operator.' }];
      const number = String(b.number || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      if (!isPhone(number)) return [400, { error: 'Please enter a valid mobile number.' }];
      const amount = money(b.amount);
      if (amount < R.min || amount > R.max) return [400, { error: `Recharge between ৳${R.min} and ৳${R.max}.` }];
      const type = b.type === 'postpaid' ? 'Postpaid' : 'Prepaid';
      const mine = await db().collection('serviceOrders').where('uid', '==', uid).get();
      if (mine.docs.filter(x => x.data().sid === 'recharge' && ['Pending', 'Processing'].includes(x.data().status)).length >= 3) return [400, { error: 'You have 3 recharges in progress. Please wait a little.' }];
      const ref = db().collection('serviceOrders').doc();
      const order = { uid, kind: 'extra', sid: 'recharge', sname: 'Mobile Recharge', iid: op, iname: `${op} ${type} · 0${number}`, planName: `Mobile Recharge · ${op} 0${number}`, unit: '৳', flow: 'buy',
        amount, price: amount, get: amount, base: amount, fee: 0, fields: [{ label: 'Number', value: '0' + number }, { label: 'Operator', value: op }, { label: 'Type', value: type }],
        trxId: 'CB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(), paidWith: 'main', sender: '', payMethod: 'Creditfy Balance', toNumber: '', status: 'Processing', createdAt: iso() };
      // Quick Services use the Creditfy balance (not the Digital Balance)
      let balance;
      try { balance = await SVC.credit(d.ref, uid, -amount, 'recharge', `Recharge ${op} 0${number}`, { orderId: ref.id }); }
      catch (e) { if (e.status) return [400, { error: 'Not enough Creditfy balance for this recharge.', code: 'bal_low' }]; throw e; }
      try { await ref.set(order); } catch (e) { await SVC.credit(d.ref, uid, amount, 'refund', 'Recharge could not be saved'); throw e; }
      await require('./alerts').notify(db, 'order', ref.id, order);
      await feed(uid, `recharged ৳${amount} ${op}`, { icon: 'fa-solid fa-mobile-screen', color: 'g-green' });
      await notifyUser(uid, 'Recharge received 📱', `৳${amount} ${op} recharge to 0${number} is in progress. You will get it shortly.`, 'transaction');
      return [200, { ok: true, balance }];
    }),

    // micro jobs: the list with this user's status, a proof submission, and the admin's check
    jobsState: wrap(async (b, uid) => {
      const { u } = await me(uid);
      const C = await cfg(), S = await SVC.cfg(), now = Date.now();
      const [mine, all] = await Promise.all([db().collection('taskSubs').where('uid', '==', uid).get(), db().collection('taskSubs').where('status', 'in', ['Pending', 'Approved']).get()]);
      const my = {}; mine.docs.forEach(x => { my[x.data().tid] = { status: x.data().status, reason: x.data().reason || '', at: x.data().at }; });
      const used = {}; all.docs.forEach(x => { used[x.data().tid] = (used[x.data().tid] || 0) + 1; });
      const tasks = C.jobs.tasks.filter(t => t.on && (!t.until || new Date(t.until).getTime() > now)).map(t => ({ ...t, left: t.slots ? Math.max(0, t.slots - (used[t.id] || 0)) : null, mine: my[t.id] || null }));
      const earned = mine.docs.filter(x => x.data().status === 'Approved').reduce((a, x) => a + (Number(x.data().reward) || 0), 0);
      return [200, { on: C.jobs.on, tasks, earned, needVerify: S.bonus.requireVerified !== false && u.phoneVerified !== true && !SVC.vipState(u), xbal: Number(u.xbal) || 0 }];
    }),
    jobSubmit: wrap(async (b, uid) => {
      const { u } = await me(uid);
      const C = await cfg(), S = await SVC.cfg();
      if (!C.jobs.on) return [400, { error: 'Micro jobs are switched off right now.' }];
      if (S.bonus.requireVerified !== false && u.phoneVerified !== true && !SVC.vipState(u)) return [403, { error: 'Task rewards are for Verified members. Get your Verified badge to earn.', code: 'verify_required' }];
      const t = C.jobs.tasks.find(x => x.id === b.tid && x.on && (!x.until || new Date(x.until).getTime() > Date.now()));
      if (!t) return [400, { error: 'This task is not available any more.' }];
      const proof = str(b.proof, 400); if (proof.length < 3) return [400, { error: 'Please add your proof.' }];
      const ref = db().collection('taskSubs').doc(`${t.id}_${uid}`);
      const old = await ref.get();
      if (old.exists && old.data().status !== 'Rejected') return [400, { error: old.data().status === 'Approved' ? 'You have already done this task.' : 'Your proof is being checked.' }];
      if (t.slots) { const n = await db().collection('taskSubs').where('tid', '==', t.id).get(); if (n.docs.filter(x => ['Pending', 'Approved'].includes(x.data().status)).length >= t.slots) return [400, { error: 'All places for this task are taken.' }]; }
      await ref.set({ tid: t.id, title: t.title, type: t.type, reward: t.reward, uid, proof, status: 'Pending', at: iso() });
      await require('./alerts').notify(db, 'job', ref.id, { uid, title: t.title, reward: t.reward, proof });
      return [200, { ok: true }];
    }),
    async adminJobs(b, user) {
      if (!user || !(await isAdmin(user.uid))) return [403, { error: 'Admin login required.' }];
      if (!(await adminCan(user, ['services']))) return [403, { error: 'Your admin role does not allow this.' }];
      if (b.op === 'list') {
        const s = await db().collection('taskSubs').get();
        return [200, { list: s.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, c) => String(c.at).localeCompare(String(a.at))).slice(0, 300) }];
      }
      const ref = db().collection('taskSubs').doc(String(b.id || ''));
      const s = await ref.get(); if (!s.exists) return [404, { error: 'Not found.' }];
      const o = s.data(); if (o.status !== 'Pending') return [400, { error: 'Already ' + o.status + '.' }];
      if (b.op === 'approve') {
        const ud = await findUserDoc(o.uid); if (!ud) return [404, { error: 'The user no longer exists.' }];
        // Micro Jobs is in Digital Services: the reward goes to the Digital Balance
        await xcredit(ud.ref, o.uid, o.reward, 'task', `Task: ${o.title}`, { taskId: o.tid }, t => t.update(ref, { status: 'Approved', decidedAt: iso(), decidedBy: user.uid }));
        await feed(o.uid, `earned ৳${o.reward} from a task`, { icon: 'fa-solid fa-briefcase', color: 'g-orange' });
        await notifyUser(o.uid, 'Task approved 💼', `“${o.title}” is approved — ৳${o.reward} is added to your Digital Balance.`, 'success');
      } else if (b.op === 'reject') {
        const reason = str(b.reason, 200);
        await ref.update({ status: 'Rejected', reason, decidedAt: iso(), decidedBy: user.uid });
        await notifyUser(o.uid, 'Task not approved', `“${o.title}” could not be approved.${reason ? ' Reason: ' + reason : ''} You can try again.`, 'warning');
      } else return [400, { error: 'Unknown action.' }];
      return [200, { ok: true }];
    },

    // admin: add or take Digital Balance by hand (refunds, corrections)
    async adminXbal(b, user) {
      if (!user || !(await isAdmin(user.uid))) return [403, { error: 'Admin login required.' }];
      if (!(await adminCan(user, ['users', 'services']))) return [403, { error: 'Your admin role does not allow this.' }];
      const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      const ud = isPhone(phone) && await findUserDoc(phone);
      if (!ud) return [404, { error: 'User not found.' }];
      const amount = money(b.amount);
      if (!amount) return [400, { error: 'Enter an amount (use minus to take money).' }];
      const note = str(b.note, 120) || (amount > 0 ? 'Added by Creditfy' : 'Adjustment');
      let after;
      try { after = await xcredit(ud.ref, phone, amount, 'admin', note, { by: user.uid }); } catch (e) { if (e.status) return [e.status, { error: 'The user does not have that much Digital Balance.' }]; throw e; }
      await notifyUser(phone, amount > 0 ? 'Digital Balance added' : 'Digital Balance updated', `${amount > 0 ? '+' : '−'}৳${Math.abs(amount)} · ${note}. Digital Balance now ৳${after}.`, amount > 0 ? 'success' : 'info');
      return [200, { ok: true, xbal: after }];
    },

    // Play & Earn: Tic-Tac-Toe against the computer, played on the server so the result is fair
    ttt: wrap(async (b, uid) => {
      const { d, u } = await me(uid);
      const C = await cfg(), G = C.games, S = await SVC.cfg();
      const gs = C.services.find(x => x.mode === 'game');
      if (!C.on || !G.on || !gs || !gs.on) return [400, { error: 'Games are switched off right now.' }];
      if (S.bonus.requireVerified !== false && u.phoneVerified !== true) return [403, { error: 'Game rewards are for Verified members. Get your Verified badge to play and earn.', code: 'verify_required' }];
      const today = bdDay();
      let out;
      await db().runTransaction(async t => {
        const cur = (await t.get(d.ref)).data() || {};
        let g = cur.ttt && cur.ttt.day === today ? { ...cur.ttt } : { day: today, wins: 0, plays: 0, b: '', over: true };
        if (b.op === 'state') { out = g; return; }
        if (b.op === 'new') {
          if (g.plays >= G.plays) throw Object.assign(new Error(`You have played ${G.plays} games today. Come back tomorrow!`), { status: 400 });
          g = { ...g, b: '.........', over: false, result: '', plays: g.plays + 1, reward: 0 };
          // the computer goes first every other game
          if (g.plays % 2 === 0) { const bb = g.b.split(''); bb[cpu(g.b, G.level)] = 'O'; g.b = bb.join(''); }
        } else if (b.op === 'move') {
          const c = Math.round(Number(b.cell));
          if (g.over || !g.b || !(c >= 0 && c <= 8) || g.b[c] !== '.') throw Object.assign(new Error('Start a new game.'), { status: 400 });
          const bb = g.b.split(''); bb[c] = 'X'; g.b = bb.join('');
          let w = winner(g.b);
          if (!w) { const bb2 = g.b.split(''); bb2[cpu(g.b, G.level)] = 'O'; g.b = bb2.join(''); w = winner(g.b); }
          if (w) {
            g.over = true; g.result = w === 'X' ? 'win' : w === 'O' ? 'lose' : 'draw';
            if (w === 'X' && g.wins < G.perDay) { g.wins++; g.reward = money(G.reward); }
          }
        } else throw Object.assign(new Error('Unknown action.'), { status: 400 });
        t.update(d.ref, { ttt: g });
        out = g;
      });
      // Play & Earn is an Digital Service: wins go to the Digital Balance
      let xbal = null;
      if (b.op === 'move' && out.result === 'win' && out.reward > 0) xbal = await xcredit(d.ref, uid, out.reward, 'game', 'Tic-Tac-Toe win');
      return [200, { b: out.b || '', over: out.over !== false, result: out.result || '', reward: b.op === 'move' ? (out.reward || 0) : 0, xbal,
        wins: out.wins || 0, plays: out.plays || 0, perDay: G.perDay, maxPlays: G.plays, prize: money(G.reward) }];
    })
  };
  return { actions, cfg };
};
module.exports.DEF = DEF;
module.exports.norm = norm;
module.exports.quote = quote;
module.exports.priceNow = priceNow;
module.exports.bonusFor = bonusFor;
module.exports.canUse = canUse;
module.exports.vipLevel = vipLevel;
module.exports.ACCESS = ACCESS;
