// Quick Services on the server: promo / redeem codes, gift vouchers, cashback wallet history, daily check-in,
// spin & win, VIP plans and the verified-number badge. Everything that touches money is decided here, never in the browser.
// Settings: Admin → Services & Rewards (siteConfig/services). Codes: promoCodes. Uses: promoUses. Wallet history: walletLog.
// Orders for VIP and the verified badge: serviceOrders (the admin approves them after checking the payment).
const crypto = require('crypto');

const DEF = {
  vip: {
    on: true, hours: 72, normal: '7–15 days',
    plans: [
      { id: 'vip', name: 'VIP', price: 499, days: 90, on: true, color: 'gold' },
      { id: 'super', name: 'Super VIP', price: 999, days: 365, on: true, color: 'violet' },
      { id: 'supreme', name: 'Supreme VIP', price: 1999, days: 0, on: true, color: 'black' }
    ],
    perks: ['Loan approved and money sent within 72 hours', 'Your application goes first in the review queue', 'Priority support', 'Gold VIP badge on your profile'],
    terms: ['If your loan is not approved and sent within 72 hours, your VIP fee is refunded.', 'VIP speeds up the review; approval still depends on your details.',
      'A rejected application does not end your VIP — apply again any time while it is valid.', 'If your account is suspended, VIP ends automatically.']
  },
  verify: { on: true, price: 100, title: 'Get a Verified badge', text: 'Pay a one-time ৳100 from any bKash / Nagad number. The Verified badge shows that you are a serious customer who really wants our service — a premium blue badge appears next to your number and on your profile, and your applications are reviewed with more trust, so you have a better chance of approval.' },
  checkin: { on: true, rewards: [1, 1, 2, 2, 3, 3, 10] },
  spin: { on: true, period: 'month', prizes: [
    { id: 'p1', label: '৳5', type: 'balance', value: 5, weight: 30, color: '#1ddb80' },
    { id: 'p2', label: 'Try again', type: 'none', value: 0, weight: 35, color: '#4d8fff' },
    { id: 'p3', label: '৳10', type: 'balance', value: 10, weight: 18, color: '#ff8c42' },
    { id: 'p4', label: '৳20', type: 'balance', value: 20, weight: 8, color: '#a855f7' },
    { id: 'p5', label: 'Better luck', type: 'none', value: 0, weight: 7, color: '#5a6b85' },
    { id: 'p6', label: '৳50', type: 'balance', value: 50, weight: 2, color: '#ffc94d' }
  ] },
  voucher: { on: true, min: 50, max: 1000, days: 30 },
  codes: { promo: false, redeem: true },
  // offers, events and rewards are for Verified members only (the sign-up bonus stays for everyone)
  bonus: { requireVerified: true },
  // loan tools: how installments are counted, early payoff, the personal loan limit and trust levels
  loans: {
    emiMode: 'principal',            // principal = loan ÷ months (interest is paid upfront with the fee) · flat = (loan + interest) ÷ months · amortized = bank EMI
    pay: { on: true }, payoff: { on: true, discountPct: 0, fee: 0 },
    limit: { on: true, enforce: false, start: 20000, step: 10000, verifiedBonus: 5000, vipBonus: 10000, max: 0 },
    trust: { on: true, levels: [{ name: 'Bronze', min: 0, perk: 'Welcome to Creditfy' }, { name: 'Silver', min: 30, perk: 'Faster review' }, { name: 'Gold', min: 60, perk: 'Higher loan limit and priority review' }, { name: 'Platinum', min: 85, perk: 'Our best limits and the fastest service' }] },
    budget: { safePct: 40 }, statement: { on: true }
  }
};
const LIVE = ['Disbursed', 'Active', 'Overdue'];
const num = v => Number(String(v ?? '').replace(/,/g, '')) || 0;

const iso = (t = Date.now()) => new Date(t).toISOString();
// Bangladesh date (UTC+6) — check-in days and spin periods follow the local calendar
const bdDay = (t = Date.now()) => new Date(t + 6 * 3600e3).toISOString().slice(0, 10);
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
const money = n => Math.round(Number(n) || 0);

function merge(d) {
  d = d || {};
  const plans = Array.isArray(d.vip?.plans) && d.vip.plans.length ? d.vip.plans : DEF.vip.plans;
  return {
    vip: { ...DEF.vip, ...(d.vip || {}), plans: plans.map(p => ({ ...p, price: money(p.price), days: Math.max(0, money(p.days)) })) },
    verify: { ...DEF.verify, ...(d.verify || {}), price: money((d.verify || {}).price ?? DEF.verify.price) },
    checkin: { ...DEF.checkin, ...(d.checkin || {}), rewards: (Array.isArray(d.checkin?.rewards) && d.checkin.rewards.length ? d.checkin.rewards : DEF.checkin.rewards).slice(0, 7).map(money) },
    spin: { ...DEF.spin, ...(d.spin || {}), prizes: (Array.isArray(d.spin?.prizes) && d.spin.prizes.length ? d.spin.prizes : DEF.spin.prizes).slice(0, 12) },
    voucher: { ...DEF.voucher, ...(d.voucher || {}) },
    codes: { ...DEF.codes, ...(d.codes || {}), promo: false },
    bonus: { ...DEF.bonus, ...(d.bonus || {}) },
    hub: d.hub || {}, tips: d.tips || null, sponsors: d.sponsors || null, help: d.help || null,
    loans: loansCfg(d.loans)
  };
}
function loansCfg(l) {
  l = l || {}; const D = DEF.loans;
  return { ...D, ...l, pay: { ...D.pay, ...(l.pay || {}) }, payoff: { ...D.payoff, ...(l.payoff || {}) }, limit: { ...D.limit, ...(l.limit || {}) },
    trust: { ...D.trust, ...(l.trust || {}), levels: Array.isArray(l.trust?.levels) && l.trust.levels.length ? l.trust.levels : D.trust.levels },
    budget: { ...D.budget, ...(l.budget || {}) }, statement: { ...D.statement, ...(l.statement || {}) } };
}
// one loan: installment, total to repay, what is paid, the schedule and the next due date
function loanView(a, txs, L, rate, now = Date.now()) {
  const amount = num(a.loanAmount), term = Math.max(1, Number(a.term) || 1);
  const r = (Number(rate) || 0) / 100 / 12;
  let emi, total;
  if (L.emiMode === 'amortized' && r > 0) { emi = Math.round(amount * r * Math.pow(1 + r, term) / (Math.pow(1 + r, term) - 1)); total = emi * term; }
  else if (L.emiMode === 'flat') { total = amount + Math.round(amount * (Number(rate) || 0) / 100 * term / 12); emi = Math.ceil(total / term); }
  else { total = amount; emi = Math.ceil(amount / term); }
  const mine = txs.filter(t => t.appId === a.id && ['installment', 'payoff'].includes(t.payType) && t.removed !== true);
  const paid = Math.min(total, mine.filter(t => t.status === 'Verified').reduce((x, t) => x + num(t.amount), 0) + num(a.paidManual));
  const pending = mine.filter(t => !t.status || t.status === 'Pending').reduce((x, t) => x + num(t.amount), 0);
  const startS = a.disbursedAt || a.creditedAt || a.approvedAt || '';
  const start = startS ? new Date(startS) : null;
  const repaid = a.status === 'Repaid' || paid >= total - 0.5;
  const schedule = Array.from({ length: term }, (_, i) => {
    const due = start ? new Date(start) : null; if (due) due.setMonth(due.getMonth() + i + 1);
    const amt = i === term - 1 ? total - emi * (term - 1) : emi;
    const before = emi * i, got = Math.max(0, Math.min(amt, paid - before));
    return { n: i + 1, due: due ? due.toISOString() : '', amount: amt, paid: got, done: got >= amt - 0.5 };
  });
  const next = repaid ? null : schedule.find(x => !x.done) || null;
  const overdue = !!(next && next.due && new Date(next.due).getTime() < now) || a.status === 'Overdue';
  return { id: a.id, amount, term, status: a.status, submittedAt: a.submittedAt || '', disbursedAt: startS, dueDate: a.dueDate || (schedule.length ? schedule[schedule.length - 1].due : ''),
    emi, total, paid, pending, remaining: Math.max(0, total - paid), paidCount: schedule.filter(x => x.done).length, next, overdue, repaid, live: LIVE.includes(a.status) && !repaid, schedule,
    payments: mine.map(t => ({ id: t.id, type: t.payType, amount: num(t.amount), status: t.status || 'Pending', trxId: t.trxId || '', at: t.submittedAt || '', verifiedAt: t.verifiedAt || '' })).sort((x, y) => String(y.at).localeCompare(String(x.at))) };
}
function payoffOf(v, L) {
  const P = L.payoff || {};
  const disc = Math.round(v.remaining * Math.min(100, Math.max(0, Number(P.discountPct) || 0)) / 100);
  return { amount: Math.max(0, v.remaining - disc + Math.round(Number(P.fee) || 0)), discount: disc, fee: Math.round(Number(P.fee) || 0) };
}
// trust score 0–100 from the user's own history
function trustOf(u, views, apps, vip, L) {
  const items = [];
  const add = (ok, pts, label, tip) => items.push({ ok, pts: ok ? pts : 0, max: pts, label, tip });
  const repaid = views.filter(v => v.repaid).length;
  const late = apps.filter(a => a.overdueAt || a.status === 'Overdue').length;
  const ageDays = u.createdAt ? (Date.now() - new Date(u.createdAt).getTime()) / 864e5 : 0;
  add(u.phoneVerified === true, 20, 'Verified number', 'Verify your number');
  add(repaid >= 1, 15, 'First loan repaid', 'Repay a loan fully');
  add(repaid >= 2, 15, 'Two loans repaid', 'Repay a second loan');
  add(repaid >= 1 && late === 0, 20, 'Always on time', 'Pay every installment by its due date');
  add(ageDays >= 90, 10, 'Member for 3 months', 'Stay with us for 3 months');
  add(!!vip, 10, 'VIP member', 'Join VIP');
  add(!!(u.name || apps.some(a => a.name)), 10, 'Complete profile', 'Complete your profile');
  let score = items.reduce((x, i) => x + i.pts, 0);
  if (views.some(v => v.overdue)) score = Math.max(0, score - 30);
  score = Math.min(100, score);
  const levels = [...L.trust.levels].sort((a, b) => a.min - b.min);
  const lvl = levels.filter(l => score >= l.min).pop() || levels[0];
  const nxt = levels.find(l => l.min > score) || null;
  return { score, level: lvl.name, perk: lvl.perk || '', next: nxt ? { name: nxt.name, need: nxt.min - score } : null, items, levels, overdueNow: views.some(v => v.overdue) };
}
function limitOf(u, views, vip, L, maxBorrow) {
  const C = L.limit || {};
  const cap = num(C.max) || num(maxBorrow) || 60000;
  const onTime = views.filter(v => v.repaid).length;
  const parts = [{ label: 'Starting limit', amount: num(C.start) }];
  if (onTime) parts.push({ label: `${onTime} loan${onTime > 1 ? 's' : ''} repaid`, amount: onTime * num(C.step) });
  if (u.phoneVerified === true) parts.push({ label: 'Verified number', amount: num(C.verifiedBonus) });
  if (vip) parts.push({ label: 'VIP member', amount: num(C.vipBonus) });
  const raw = parts.reduce((x, p) => x + p.amount, 0);
  const limit = Math.min(cap, Math.max(0, raw));
  const tips = [];
  if (u.phoneVerified !== true && num(C.verifiedBonus)) tips.push({ label: 'Verify your number', amount: num(C.verifiedBonus), go: 'verify' });
  if (num(C.step)) tips.push({ label: 'Repay your loan on time', amount: num(C.step), go: 'loans' });
  if (!vip && num(C.vipBonus)) tips.push({ label: 'Join VIP', amount: num(C.vipBonus), go: 'vip' });
  return { on: C.on !== false, enforce: C.enforce === true, limit, cap, parts, tips: limit >= cap ? [] : tips };
}

// the fee for a loan, from Site Config (the same rules as the app and the admin panel)
function feeFor(cfg, amt, months, extra) {
  const n = (v, d) => (v === undefined || v === null || v === '' || isNaN(Number(v))) ? d : Number(v);
  const rate = n(cfg.annualInterestRate, 18), xi = cfg.extraInterest || {}, xr = xi.on ? (Number(xi.rate) || 0) : 0;
  const custom = (Array.isArray(cfg.customFees) ? cfg.customFees : []).filter(f => f && f.on !== false && f.name && Number(f.value) > 0)
    .reduce((a, f) => a + (f.type === 'percent' ? Math.round(amt * f.value / 100) : Math.round(f.value)), 0);
  return n(cfg.orgFee, 200) + n(cfg.serviceCharge, 100) + n(cfg.processingFee, 100) + custom + Math.round(Number(extra) || 0)
    + Math.round(amt * rate / 100 * months / 12) + Math.round(amt * xr / 100 * months / 12);
}

module.exports = function services({ db, admin, findUserDoc, isAdmin, adminCan, notifyUser, isPhone }) {
  const FV = () => admin.firestore.FieldValue;
  async function cfg() { try { const s = await db().collection('siteConfig').doc('services').get(); return merge(s.exists ? s.data() : {}); } catch (e) { return merge({}); } }

  function vipState(u) {
    const v = u && u.vip;
    if (!v || !v.plan || v.active === false) return null;
    if (['banned', 'suspended'].includes(u.status)) return null;
    if (v.until && new Date(v.until).getTime() < Date.now()) return null;
    return { plan: v.plan, name: v.name || v.plan, since: v.since || '', until: v.until || '' };
  }

  // add (or take) money from the balance and write a line in the wallet history — in one transaction
  async function credit(ref, uid, amount, type, note, extra = {}) {
    const log = db().collection('walletLog').doc();
    let after = 0;
    await db().runTransaction(async t => {
      const s = await t.get(ref);
      const bal = Number((s.data() || {}).balance) || 0;
      after = bal + amount;
      if (after < 0) throw Object.assign(new Error('Not enough balance.'), { status: 400 });
      t.update(ref, { balance: after });
      t.set(log, { uid, amount, type, note: String(note || '').slice(0, 140), balanceAfter: after, at: iso(), ...extra });
    });
    return after;
  }

  async function me(uid) {
    const d = await findUserDoc(uid);
    if (!d) throw Object.assign(new Error('Account not found.'), { status: 404 });
    const u = d.data() || {};
    if (['banned', 'suspended'].includes(u.status)) throw Object.assign(new Error('Your account is suspended. Please contact support.'), { status: 403 });
    return { d, u };
  }

  // checks a code against its limits; returns the code data or throws a friendly error
  async function codeCheck(code, kinds, uid, u, extra = {}) {
    const c = normCode(code);
    if (c.length < 3) throw Object.assign(new Error('Please enter a valid code.'), { status: 400 });
    const s = await db().collection('promoCodes').doc(c).get();
    const p = s.exists ? (s.data() || {}) : null;
    if (!p || !kinds.includes(p.kind || 'promo')) throw Object.assign(new Error('This code is not valid.'), { status: 404 });
    if (p.on === false) throw Object.assign(new Error('This code is switched off.'), { status: 400 });
    const now = Date.now();
    if (p.start && new Date(p.start).getTime() > now) throw Object.assign(new Error('This code is not active yet.'), { status: 400 });
    if (p.end && new Date(p.end).getTime() < now) throw Object.assign(new Error('This code has expired.'), { status: 400 });
    if (Number(p.maxUses) > 0 && (Number(p.uses) || 0) >= Number(p.maxUses)) throw Object.assign(new Error('This code has been fully used.'), { status: 400 });
    if (p.createdBy && p.createdBy === uid) throw Object.assign(new Error('This is your own gift voucher — send it to a friend to use.'), { status: 400 });
    const aud = p.audience || 'all';
    if (aud === 'new') { const a = await db().collection('applications').where('uid', '==', uid).get(); if (a.docs.some(x => ['Disbursed', 'Active', 'Repaid', 'Overdue'].includes(x.data().status))) throw Object.assign(new Error('This code is only for new customers.'), { status: 400 }); }
    if (aud === 'vip' && !vipState(u)) throw Object.assign(new Error('This code is only for VIP members.'), { status: 400 });
    if (aud === 'verified' && u.phoneVerified !== true) throw Object.assign(new Error('This code is only for verified numbers.'), { status: 400 });
    if (Number(p.minLoan) > 0 && extra.loan !== undefined && extra.loan < Number(p.minLoan)) throw Object.assign(new Error(`This code needs a loan of at least ৳${Number(p.minLoan).toLocaleString('en-US')}.`), { status: 400 });
    const per = Math.max(1, Number(p.perUser) || 1);
    const mine = await db().collection('promoUses').where('code', '==', c).where('uid', '==', uid).get();
    const used = mine.docs.filter(x => !extra.appId || x.data().appId !== extra.appId).length;
    if (used >= per) throw Object.assign(new Error(per === 1 ? 'You have already used this code.' : `You can use this code ${per} times only.`), { status: 400 });
    return { c, p, ref: s.ref };
  }

  // offers, events and rewards need the Verified badge (Admin → Services & Rewards → Check-in · Spin · Voucher)
  const VERIFY_MSG = 'This reward is for Verified members. Get your Verified badge to join offers, events and Spin & Win.';
  function needVerified(u, C) { if (C.bonus.requireVerified !== false && u.phoneVerified !== true) throw Object.assign(new Error(VERIFY_MSG), { status: 403, code: 'verify_required' }); }

  const wrap = fn => async (b, user) => {
    if (!user) return [401, { error: 'Please login again.' }];
    try { return await fn(b, user.uid, user); }
    catch (e) { if (e.status) return [e.status, { error: e.message, ...(e.code ? { code: e.code } : {}) }]; throw e; }
  };

  const actions = {
    // everything the Quick Services pages need, in one call (works without login: settings only)
    async svcConfig() {
      const C = await cfg();
      // the Help Center can also show the FAQ written in SEO & Reviews
      let seoFaq = [];
      if (!C.help || C.help.useSeoFaq !== false) { try { const s = await db().collection('siteConfig').doc('seo').get(); seoFaq = ((s.exists && s.data().faq) || []).filter(f => f && f.q && f.a && f.on !== false).map(f => ({ q: f.q, a: f.a, cat: 'General' })); } catch (e) {} }
      return [200, { vip: C.vip, verify: C.verify, checkin: { on: C.checkin.on, rewards: C.checkin.rewards }, spin: { on: C.spin.on, period: C.spin.period, prizes: C.spin.prizes.map(p => ({ id: p.id, label: p.label, color: p.color })) },
        voucher: C.voucher, codes: C.codes, bonus: C.bonus, hub: C.hub, tips: C.tips, sponsors: C.sponsors, help: { ...(C.help || {}), seoFaq }, loans: C.loans }];
    },

    // "Call me back": the user picks a topic and a time, the team calls
    async callbackRequest(b, user) {
      const C = await cfg(), H = C.help || {};
      if (H.callback && H.callback.on === false) return [400, { error: 'Call-back requests are switched off right now.' }];
      const phone = user ? user.uid : String(b.phone || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      if (!isPhone(phone)) return [400, { error: 'Please enter a valid mobile number.' }];
      const name = String(b.name || '').replace(/[<>]/g, '').trim().slice(0, 60);
      const open = await db().collection('callbacks').where('phone', '==', phone).get();
      if (open.docs.some(x => x.data().status === 'Open')) return [400, { error: 'You already asked for a call. Our team will call you soon.' }];
      await db().collection('callbacks').add({ phone, name, uid: user ? user.uid : '', topic: String(b.topic || 'General').slice(0, 60), slot: String(b.slot || 'Any time').slice(0, 60),
        note: String(b.note || '').replace(/[<>]/g, '').slice(0, 300), status: 'Open', createdAt: iso() });
      if (user) await notifyUser(user.uid, 'Call request received 📞', `We will call you on 0${phone} (${String(b.slot || 'any time').slice(0, 60)}).`, 'info');
      return [200, { ok: true }];
    },

    svcState: wrap(async (b, uid) => {
      const { u } = await me(uid);
      const C = await cfg(), today = bdDay();
      const ck = u.checkin || {}, sp = u.spin || {};
      const y = bdDay(Date.now() - 864e5);
      const streak = ck.last === today ? Number(ck.streak) || 1 : ck.last === y ? (Number(ck.streak) || 0) % 7 : 0;
      const orders = await db().collection('serviceOrders').where('uid', '==', uid).get();
      return [200, {
        balance: Number(u.balance) || 0, vip: vipState(u), verified: u.phoneVerified === true, verifiedAt: u.verifiedAt || '',
        checkin: { doneToday: ck.last === today, streak, next: C.checkin.rewards[(ck.last === today ? streak : streak) % 7] || 0 },
        spin: { canSpin: C.spin.on && sp.key !== periodKey(C.spin.period), last: sp.at || '', lastPrize: sp.label || '', nextAt: nextPeriod(C.spin.period) },
        orders: orders.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 10)
      }];
    }),

    walletHistory: wrap(async (b, uid) => {
      const s = await db().collection('walletLog').where('uid', '==', uid).get();
      const list = s.docs.map(x => x.data()).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 150);
      const { u } = await me(uid);
      return [200, { balance: Number(u.balance) || 0, list }];
    }),

    checkin: wrap(async (b, uid) => {
      const { d, u } = await me(uid);
      const C = await cfg();
      if (!C.checkin.on) return [400, { error: 'Daily check-in is switched off right now.' }];
      needVerified(u, C);
      const today = bdDay(), y = bdDay(Date.now() - 864e5);
      let reward = 0, streak = 1;
      await db().runTransaction(async t => {
        const s = await t.get(d.ref); const ck = (s.data() || {}).checkin || {};
        if (ck.last === today) throw Object.assign(new Error('You already checked in today. Come back tomorrow!'), { status: 400 });
        streak = ck.last === y ? ((Number(ck.streak) || 0) % 7) + 1 : 1;
        reward = C.checkin.rewards[streak - 1] || 0;
        t.update(d.ref, { checkin: { last: today, streak, at: iso() } });
      });
      let balance = null;
      if (reward > 0) balance = await credit(d.ref, uid, reward, 'checkin', `Daily check-in · day ${streak}`);
      return [200, { ok: true, streak, reward, balance }];
    }),

    spin: wrap(async (b, uid) => {
      const { d, u } = await me(uid);
      const C = await cfg();
      if (!C.spin.on) return [400, { error: 'Spin & Win is switched off right now.' }];
      needVerified(u, C);
      const key = periodKey(C.spin.period);
      const prizes = C.spin.prizes.filter(p => Number(p.weight) > 0);
      if (!prizes.length) return [400, { error: 'No prizes are set up yet.' }];
      const total = prizes.reduce((a, p) => a + Number(p.weight), 0);
      let r = crypto.randomInt(0, Math.max(1, Math.round(total * 1000))) / 1000, prize = prizes[prizes.length - 1];
      for (const p of prizes) { r -= Number(p.weight); if (r < 0) { prize = p; break; } }
      await db().runTransaction(async t => {
        const s = await t.get(d.ref); const sp = (s.data() || {}).spin || {};
        if (sp.key === key) throw Object.assign(new Error('You have already used your spin. Come back next time!'), { status: 400 });
        t.update(d.ref, { spin: { key, at: iso(), label: String(prize.label || '').slice(0, 40), prize: prize.id || '' } });
      });
      let balance = null;
      if (prize.type === 'balance' && money(prize.value) > 0) balance = await credit(d.ref, uid, money(prize.value), 'spin', `Spin & Win · ${prize.label}`);
      if (prize.type === 'gift') await notifyUser(uid, 'You won! 🎁', `Spin & Win: ${prize.label}. Our team will contact you to give your prize.`, 'bonus');
      await db().collection('spinLog').add({ uid, prize: prize.id || '', label: prize.label || '', type: prize.type || 'none', value: money(prize.value), at: iso() });
      return [200, { ok: true, prize: { id: prize.id, label: prize.label, type: prize.type, value: money(prize.value) }, balance, nextAt: nextPeriod(C.spin.period) }];
    }),

    redeemCode: wrap(async (b, uid) => {
      const { d, u } = await me(uid);
      const C = await cfg();
      if (!C.codes.redeem) return [400, { error: 'Redeem codes are switched off right now.' }];
      needVerified(u, C);
      const { c, p, ref } = await codeCheck(b.code, ['redeem', 'voucher'], uid, u);
      const value = money(p.value);
      if (value <= 0) return [400, { error: 'This code has no value.' }];
      await db().runTransaction(async t => {
        const s = await t.get(ref); const x = s.data() || {};
        if (Number(x.maxUses) > 0 && (Number(x.uses) || 0) >= Number(x.maxUses)) throw Object.assign(new Error('This code has been fully used.'), { status: 400 });
        t.update(ref, { uses: (Number(x.uses) || 0) + 1, lastUsedAt: iso(), ...(x.kind === 'voucher' ? { usedBy: uid, usedAt: iso() } : {}) });
        t.set(db().collection('promoUses').doc(), { code: c, uid, kind: x.kind || 'redeem', amount: value, at: iso() });
      });
      const balance = await credit(d.ref, uid, value, p.kind === 'voucher' ? 'voucher' : 'redeem', `${p.kind === 'voucher' ? 'Gift voucher' : 'Redeem code'} ${c}`);
      if (p.kind === 'voucher' && p.createdBy) await notifyUser(p.createdBy, 'Your gift was used 🎁', `Your gift voucher ${c} (৳${value}) was redeemed by a friend.`, 'bonus');
      return [200, { ok: true, amount: value, balance, message: p.message || '' }];
    }),

    // promo code on a fee payment: checked and reserved for this application on the server
    usePromo: wrap(async (b, uid) => {
      const { u } = await me(uid);
      const C = await cfg();
      // fees take no promo or coupon: only the one-time balance use (sign-up bonus) works on a loan fee
      return [400, { error: 'Promo codes cannot be used on fees.' }];
      const appId = String(b.appId || '');
      const a = appId && await db().collection('applications').doc(appId).get();
      if (!a || !a.exists || a.data().uid !== uid) return [404, { error: 'Application not found.' }];
      if (a.data().status !== 'Pending Fee Payment') return [400, { error: 'A promo code can only be added before the fee is paid.' }];
      const amt = money(String(a.data().loanAmount || '').replace(/,/g, '')), term = Number(a.data().term) || 0;
      const { c, p, ref } = await codeCheck(b.code, ['promo'], uid, u, { loan: amt, appId });
      const main = (await db().collection('siteConfig').doc('main').get()).data() || {};
      const fee = feeFor(main, amt, term, a.data().extraFee);
      let disc = p.type === 'percent' ? Math.round(fee * Math.min(100, Number(p.value) || 0) / 100) : money(p.value);
      if (Number(p.maxDiscount) > 0) disc = Math.min(disc, money(p.maxDiscount));
      disc = Math.max(0, Math.min(disc, fee));
      if (!disc) return [400, { error: 'This code gives no discount on this fee.' }];
      const useRef = db().collection('promoUses').doc(`app_${appId}`);
      await db().runTransaction(async t => {
        const [s, old] = await Promise.all([t.get(ref), t.get(useRef)]);
        const x = s.data() || {}, o = old.exists ? old.data() : null;
        const same = o && o.code === c;
        if (!same && Number(x.maxUses) > 0 && (Number(x.uses) || 0) >= Number(x.maxUses)) throw Object.assign(new Error('This code has been fully used.'), { status: 400 });
        if (o && !same) t.update(db().collection('promoCodes').doc(o.code), { uses: FV().increment(-1) });
        if (!same) t.update(ref, { uses: (Number(x.uses) || 0) + 1, lastUsedAt: iso() });
        t.set(useRef, { code: c, uid, kind: 'promo', appId, amount: disc, fee, at: iso() });
      });
      return [200, { ok: true, code: c, discount: disc, fee, label: p.label || (p.type === 'percent' ? `${p.value}% off` : `৳${disc} off`) }];
    }),

    removePromo: wrap(async (b, uid) => {
      const appId = String(b.appId || '');
      const useRef = db().collection('promoUses').doc(`app_${appId}`);
      const s = await useRef.get();
      if (!s.exists || s.data().uid !== uid) return [200, { ok: true }];
      const a = await db().collection('applications').doc(appId).get();
      if (a.exists && a.data().status !== 'Pending Fee Payment') return [400, { error: 'The fee is already paid.' }];
      await useRef.delete();
      await db().collection('promoCodes').doc(s.data().code).update({ uses: FV().increment(-1) }).catch(() => {});
      return [200, { ok: true }];
    }),

    myPromo: wrap(async (b, uid) => {
      const s = await db().collection('promoUses').doc(`app_${String(b.appId || '')}`).get();
      if (!s.exists || s.data().uid !== uid) return [200, { promo: null }];
      return [200, { promo: { code: s.data().code, discount: s.data().amount } }];
    }),

    // a user turns part of their balance into a gift voucher for a friend
    giftVoucher: wrap(async (b, uid) => {
      const { d, u } = await me(uid);
      const C = await cfg();
      if (!C.voucher.on) return [400, { error: 'Gift vouchers are switched off right now.' }];
      needVerified(u, C);
      const amount = money(b.amount);
      if (amount < money(C.voucher.min) || amount > money(C.voucher.max)) return [400, { error: `Choose an amount from ৳${C.voucher.min} to ৳${C.voucher.max}.` }];
      if ((Number(u.balance) || 0) < amount) return [400, { error: 'Not enough balance for this voucher.' }];
      let code; for (let i = 0; i < 5; i++) { code = 'GIFT-' + crypto.randomBytes(4).toString('hex').toUpperCase(); if (!(await db().collection('promoCodes').doc(code).get()).exists) break; }
      await credit(d.ref, uid, -amount, 'voucher-sent', `Gift voucher ${code}`);
      const days = Math.max(1, money(C.voucher.days) || 30);
      await db().collection('promoCodes').doc(code).set({ code, kind: 'voucher', value: amount, maxUses: 1, perUser: 1, uses: 0, on: true, audience: 'all',
        end: iso(Date.now() + days * 864e5), createdBy: uid, message: String(b.message || '').replace(/[<>]/g, '').slice(0, 120), createdAt: iso(), note: 'Sent by a user' });
      return [200, { ok: true, code, amount, end: iso(Date.now() + days * 864e5) }];
    }),

    myVouchers: wrap(async (b, uid) => {
      const s = await db().collection('promoCodes').where('createdBy', '==', uid).get();
      return [200, { list: s.docs.map(x => x.data()).map(v => ({ code: v.code, value: v.value, used: (Number(v.uses) || 0) > 0, end: v.end || '', createdAt: v.createdAt || '', refunded: !!v.refundedAt })).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) }];
    }),

    // an unused, expired voucher goes back to the sender's balance
    reclaimVoucher: wrap(async (b, uid) => {
      const c = normCode(b.code);
      const ref = db().collection('promoCodes').doc(c);
      const { d } = await me(uid);
      let value = 0;
      await db().runTransaction(async t => {
        const s = await t.get(ref); const v = s.data() || {};
        if (!s.exists || v.createdBy !== uid) throw Object.assign(new Error('Voucher not found.'), { status: 404 });
        if ((Number(v.uses) || 0) > 0 || v.refundedAt) throw Object.assign(new Error('This voucher was already used.'), { status: 400 });
        value = money(v.value);
        t.update(ref, { on: false, refundedAt: iso(), maxUses: 0, uses: 1 });
      });
      const balance = await credit(d.ref, uid, value, 'voucher-back', `Gift voucher ${c} cancelled`);
      return [200, { ok: true, amount: value, balance }];
    }),

    // buy VIP or the verified badge: the user sends the money, the admin checks it and approves
    buyService: wrap(async (b, uid) => {
      const { u } = await me(uid);
      const C = await cfg();
      const kind = b.kind === 'verify' ? 'verify' : 'vip';
      let price, plan = null;
      if (kind === 'vip') {
        if (!C.vip.on) return [400, { error: 'VIP is not available right now.' }];
        plan = C.vip.plans.find(p => p.id === b.plan && p.on !== false);
        if (!plan) return [400, { error: 'Please choose a VIP plan.' }];
        price = plan.price;
      } else {
        if (!C.verify.on) return [400, { error: 'Verification is not available right now.' }];
        if (u.phoneVerified === true) return [400, { error: 'Your number is already verified.' }];
        price = C.verify.price;
      }
      const trxId = String(b.trxId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40);
      if (trxId.length < 6) return [400, { error: 'Please enter the Transaction ID from your payment SMS.' }];
      const sender = String(b.sender || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      if (!isPhone(sender)) return [400, { error: 'Please enter the number you paid from.' }];
      const [dupO, dupT] = await Promise.all([db().collection('serviceOrders').where('trxId', '==', trxId).limit(1).get(), db().collection('transactions').doc('trx_' + trxId).get()]);
      if (!dupO.empty || dupT.exists) return [400, { error: 'This Transaction ID has already been used.' }];
      const mine = await db().collection('serviceOrders').where('uid', '==', uid).get();
      if (mine.docs.some(x => x.data().kind === kind && x.data().status === 'Pending')) return [400, { error: 'You already have a request waiting for review.' }];
      const ref = await db().collection('serviceOrders').add({ uid, kind, plan: plan ? plan.id : '', planName: plan ? plan.name : 'Verified badge', price, days: plan ? plan.days : 0,
        trxId, sender, payMethod: String(b.payMethod || '').slice(0, 30), toNumber: String(b.toNumber || '').replace(/[^\d+]/g, '').slice(0, 20), status: 'Pending', createdAt: iso() });
      await notifyUser(uid, kind === 'vip' ? `${plan.name} request received 👑` : 'Verification request received ✅',
        `We received your payment of ৳${price} (TrxID ${trxId}). Our team will check it and switch it on shortly.`, 'transaction');
      return [200, { ok: true, id: ref.id }];
    }),

    // admin: approve / reject an order
    async adminServiceOrder(b, user) {
      if (!user || !(await isAdmin(user.uid))) return [403, { error: 'Admin login required.' }];
      if (!(await adminCan(user, ['services', 'users']))) return [403, { error: 'Your admin role does not allow this.' }];
      const ref = db().collection('serviceOrders').doc(String(b.id || ''));
      const s = await ref.get();
      if (!s.exists) return [404, { error: 'Order not found.' }];
      const o = s.data();
      if (o.status !== 'Pending') return [400, { error: 'This order is already ' + o.status + '.' }];
      const ud = await findUserDoc(o.uid);
      if (!ud) return [404, { error: 'The user no longer exists.' }];
      if (b.op === 'reject') {
        await ref.update({ status: 'Rejected', reason: String(b.reason || '').slice(0, 200), decidedAt: iso(), decidedBy: user.uid });
        await notifyUser(o.uid, 'Request not approved', `Your ${o.planName} request (TrxID ${o.trxId}) could not be approved.${b.reason ? ' Reason: ' + String(b.reason).slice(0, 200) : ''} Please contact support if you paid.`, 'warning');
        return [200, { ok: true }];
      }
      if (b.op !== 'approve') return [400, { error: 'Unknown action.' }];
      const now = Date.now();
      if (o.kind === 'verify') {
        await ud.ref.update({ phoneVerified: true, verifiedAt: iso(now), verifiedBy: user.uid });
        await notifyUser(o.uid, 'Number verified ✅', 'Your number is now verified. The Verified badge is on your profile, and your applications are reviewed with more trust.', 'success');
      } else {
        const u = ud.data() || {}, cur = vipState(u);
        const base = cur && cur.until ? Math.max(now, new Date(cur.until).getTime()) : now;
        const until = o.days > 0 ? (cur && !cur.until ? '' : iso(base + o.days * 864e5)) : '';
        await ud.ref.update({ vip: { plan: o.plan, name: o.planName, since: (cur && cur.since) || iso(now), until, active: true, orderId: s.id, price: o.price } });
        await notifyUser(o.uid, `Welcome to ${o.planName}! 👑`, `${o.planName} is active${until ? ' until ' + new Date(until).toDateString() : ' for life'}. Your next loan is reviewed first — approved and sent within 72 hours, or your VIP fee is refunded.`, 'success');
      }
      await ref.update({ status: 'Approved', decidedAt: iso(now), decidedBy: user.uid });
      return [200, { ok: true }];
    }
  };

  function periodKey(p, t = Date.now()) {
    const d = bdDay(t);
    if (p === 'day') return 'd' + d;
    if (p === 'week') { const x = new Date(d + 'T00:00:00Z'); const day = (x.getUTCDay() + 6) % 7; x.setUTCDate(x.getUTCDate() - day); return 'w' + x.toISOString().slice(0, 10); }
    return 'm' + d.slice(0, 7);
  }
  function nextPeriod(p) {
    const d = new Date(bdDay() + 'T00:00:00Z');
    if (p === 'day') d.setUTCDate(d.getUTCDate() + 1);
    else if (p === 'week') { const day = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - day + 7); }
    else { d.setUTCMonth(d.getUTCMonth() + 1, 1); }
    return new Date(d.getTime() - 6 * 3600e3).toISOString();   // midnight in Bangladesh
  }

  // ── loan tools ──
  async function myData(uid) {
    const { d, u } = await me(uid);
    const [C, main, as, ts] = await Promise.all([cfg(), db().collection('siteConfig').doc('main').get(), db().collection('applications').where('uid', '==', uid).get(), db().collection('transactions').where('uid', '==', uid).get()]);
    const M = main.exists ? main.data() : {};
    const apps = as.docs.map(x => ({ id: x.id, ...x.data() })).filter(a => a.removed !== true);
    const txs = ts.docs.map(x => ({ id: x.id, ...x.data() }));
    const views = apps.map(a => loanView(a, txs, C.loans, M.annualInterestRate ?? 18));
    const vip = vipState(u);
    return { d, u, C, M, apps, txs, views, vip };
  }
  Object.assign(actions, {
    myLoans: wrap(async (b, uid) => {
      const { u, C, M, apps, txs, views, vip } = await myData(uid);
      const L = C.loans;
      const loans = views.map(v => { const a = apps.find(x => x.id === v.id) || {}; return { ...v, ref: 'CU-' + v.id.slice(-6).toUpperCase(), wallet: a.wallet || '', fee: txs.filter(t => t.appId === v.id && !['installment', 'payoff'].includes(t.payType) && t.removed !== true).map(t => ({ amount: num(t.amount) + num(t.appliedBalance), status: t.status || 'Pending', at: t.submittedAt || '' })), payoff: v.live ? payoffOf(v, L) : null }; })
        .sort((x, y) => String(y.submittedAt).localeCompare(String(x.submittedAt)));
      return [200, { cfg: L, rate: M.annualInterestRate ?? 18, loans, limit: limitOf(u, views, vip, L, M.maxBorrowAmount), trust: trustOf(u, views, apps, vip, L),
        user: { phone: uid, name: u.name || (apps.find(a => a.name) || {}).name || '', verified: u.phoneVerified === true, vip, since: u.createdAt || '', balance: num(u.balance) } }];
    }),

    // pay one or more installments, or the whole loan early: the user sends the money, the admin checks it
    payLoan: wrap(async (b, uid) => {
      const { C, apps, txs, views } = await myData(uid);
      const L = C.loans, kind = b.kind === 'payoff' ? 'payoff' : 'installment';
      if (kind === 'payoff' && L.payoff.on === false) return [400, { error: 'Early payoff is not available right now.' }];
      if (kind === 'installment' && L.pay.on === false) return [400, { error: 'Paying installments in the app is not available right now.' }];
      const v = views.find(x => x.id === String(b.appId || ''));
      if (!v) return [404, { error: 'Loan not found.' }];
      if (!v.live) return [400, { error: v.repaid ? 'This loan is already fully repaid. 🎉' : 'This loan is not active yet.' }];
      if (txs.some(t => t.appId === v.id && t.payType === 'payoff' && (!t.status || t.status === 'Pending'))) return [400, { error: 'Your early payoff is already waiting for review.' }];
      let amount, count = 0;
      const left = Math.max(0, v.remaining - v.pending);
      if (kind === 'payoff') { amount = payoffOf(v, L).amount - v.pending; if (amount <= 0) return [400, { error: 'Your pending payments already cover this loan.' }]; }
      else { count = Math.max(1, Math.min(v.term, Math.round(Number(b.count) || 1))); amount = Math.min(left, v.emi * count); if (amount <= 0) return [400, { error: 'Your pending payments already cover this loan.' }]; }
      const trxId = String(b.trxId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40);
      if (trxId.length < 6) return [400, { error: 'Please enter the Transaction ID from your payment SMS.' }];
      const sender = String(b.sender || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      if (!isPhone(sender)) return [400, { error: 'Please enter the number you paid from.' }];
      const ref = db().collection('transactions').doc('trx_' + trxId);
      const [dupT, dupO] = await Promise.all([ref.get(), db().collection('serviceOrders').where('trxId', '==', trxId).limit(1).get()]);
      if (dupT.exists || !dupO.empty) return [400, { error: 'This Transaction ID has already been used.' }];
      const a = apps.find(x => x.id === v.id);
      await ref.set({ uid, appId: v.id, trxId, payType: kind, amount, installments: count, payoffDiscount: kind === 'payoff' ? payoffOf(v, L).discount : 0,
        payMethod: String(b.payMethod || '').slice(0, 30), collectionNumber: String(b.toNumber || '').replace(/[^\d+]/g, '').slice(0, 20), senderNumber: sender,
        totalFee: 0, appliedBalance: 0, loanAmount: v.amount, term: v.term, wallet: a.wallet || '', status: 'Pending', submittedAt: iso() });
      await notifyUser(uid, kind === 'payoff' ? 'Early payoff received ⏳' : 'Installment received ⏳', `We received your ${kind === 'payoff' ? 'early payoff' : 'installment'} of ৳${amount.toLocaleString('en-US')} for loan CU-${v.id.slice(-6).toUpperCase()} (TrxID ${trxId}). Our team will verify it shortly.`, 'transaction');
      return [200, { ok: true, amount }];
    }),

    // admin: verify or reject a repayment; a fully paid loan becomes "Repaid"
    async adminRepay(b, user) {
      if (!user || !(await isAdmin(user.uid))) return [403, { error: 'Admin login required.' }];
      if (!(await adminCan(user, ['transactions', 'portfolio']))) return [403, { error: 'Your admin role does not allow this.' }];
      const ref = db().collection('transactions').doc(String(b.id || ''));
      const s = await ref.get();
      if (!s.exists) return [404, { error: 'Payment not found.' }];
      const t = s.data();
      if (!['installment', 'payoff'].includes(t.payType)) return [400, { error: 'This is not a loan repayment.' }];
      const status = b.op === 'reject' ? 'Rejected' : 'Verified';
      await ref.update({ status, verifiedAt: status === 'Verified' ? iso() : null, decidedBy: user.uid });
      const tk = n => '৳' + Number(n || 0).toLocaleString('en-US');
      if (status === 'Rejected') {
        await notifyUser(t.uid, 'Payment not verified', `We could not verify your ${t.payType === 'payoff' ? 'early payoff' : 'installment'} payment (TrxID ${t.trxId}). Please check it and contact support.`, 'warning');
        return [200, { ok: true }];
      }
      const C = await cfg(), main = (await db().collection('siteConfig').doc('main').get()).data() || {};
      const as = await db().collection('applications').doc(t.appId).get();
      if (!as.exists) return [200, { ok: true, note: 'The loan no longer exists.' }];
      const ts = await db().collection('transactions').where('appId', '==', t.appId).get();
      const v = loanView({ id: as.id, ...as.data() }, ts.docs.map(x => ({ id: x.id, ...x.data() })), C.loans, main.annualInterestRate ?? 18);
      const done = v.repaid || t.payType === 'payoff';
      const upd = { paidAmount: v.paid, lastPaidAt: iso(), updatedAt: iso() };
      if (done) Object.assign(upd, { status: 'Repaid', repaidAt: iso(), statusUpdatedAt: iso() });
      else if (as.data().status === 'Overdue' && !v.overdue) Object.assign(upd, { status: 'Active', statusUpdatedAt: iso() });
      await as.ref.update(upd);
      await notifyUser(t.uid, done ? 'Loan fully repaid 🎉' : 'Installment received ✅', done
        ? `Congratulations! Loan CU-${t.appId.slice(-6).toUpperCase()} is fully repaid. Thank you — your trust level and loan limit grow with every loan you repay.`
        : `Your payment of ${tk(t.amount)} is verified. Paid ${tk(v.paid)} of ${tk(v.total)}${v.next ? `; next installment ${tk(v.next.amount - v.next.paid)} due ${v.next.due ? new Date(v.next.due).toDateString() : 'soon'}` : ''}.`, 'success');
      return [200, { ok: true, repaid: done, paid: v.paid, total: v.total }];
    }
  });

  return { actions, vipState, credit, cfg, feeFor };
};
module.exports.DEF = DEF;
module.exports.feeFor = feeFor;
