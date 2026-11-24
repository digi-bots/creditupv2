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
  verify: { on: true, price: 100, title: 'Get a Verified badge', text: 'Pay ৳100 from your own bKash / Nagad number. Our team checks that the payment came from the number you registered and adds a Verified badge to your account. Verified numbers are reviewed with more trust, so your application has a better chance of approval.' },
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
  codes: { promo: true, redeem: true }
};

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
    codes: { ...DEF.codes, ...(d.codes || {}) },
    hub: d.hub || {}, tips: d.tips || null, sponsors: d.sponsors || null, help: d.help || null, loans: d.loans || null
  };
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

  const wrap = fn => async (b, user) => {
    if (!user) return [401, { error: 'Please login again.' }];
    try { return await fn(b, user.uid, user); }
    catch (e) { if (e.status) return [e.status, { error: e.message }]; throw e; }
  };

  const actions = {
    // everything the Quick Services pages need, in one call (works without login: settings only)
    async svcConfig() {
      const C = await cfg();
      return [200, { vip: C.vip, verify: C.verify, checkin: { on: C.checkin.on, rewards: C.checkin.rewards }, spin: { on: C.spin.on, period: C.spin.period, prizes: C.spin.prizes.map(p => ({ id: p.id, label: p.label, color: p.color })) },
        voucher: C.voucher, codes: C.codes, hub: C.hub, tips: C.tips, sponsors: C.sponsors, help: C.help, loans: C.loans }];
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
      const { d } = await me(uid);
      const C = await cfg();
      if (!C.checkin.on) return [400, { error: 'Daily check-in is switched off right now.' }];
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
      const { d } = await me(uid);
      const C = await cfg();
      if (!C.spin.on) return [400, { error: 'Spin & Win is switched off right now.' }];
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
      if (!C.codes.promo) return [400, { error: 'Promo codes are switched off right now.' }];
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
      if (kind === 'verify' && sender !== uid) return [400, { error: 'For verification, pay from your own registered number (0' + uid + ').' }];
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

  return { actions, vipState, credit, cfg, feeFor };
};
module.exports.DEF = DEF;
module.exports.feeFor = feeFor;
