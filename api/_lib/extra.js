// Extra Services (below Quick Services): currency & MFS exchange, gift cards, SMM, virtual cards, promo codes,
// gift vouchers and games. Most are paid: the user sends the money (TrxID), the admin delivers the order by hand.
// The list lives in siteConfig/services → extra (Admin → Services & Rewards → Extra services).
// Orders: serviceOrders with kind 'extra' (Pending → Processing → Delivered, or Rejected).

const iso = (t = Date.now()) => new Date(t).toISOString();
const bdDay = (t = Date.now()) => new Date(t + 6 * 3600e3).toISOString().slice(0, 10);
const money = n => Math.round(Number(n) || 0);
const str = (v, n = 200) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, n);

const item = (id, name, price, note = '') => ({ id, name, price, note, on: true });
const pair = (id, name, o = {}) => ({ id, name, on: true, unit: '৳', rate: 1, pct: 1.5, fee: 0, min: 100, max: 25000, flow: 'buy', to: '', note: '', ...o });
const DEF = {
  on: true, title: 'Extra Services',
  services: [
    { id: 'exchange', name: 'Currency Exchange', short: 'Exchange', icon: 'fa-solid fa-money-bill-transfer', color: 'g-teal', mode: 'amount', on: true,
      desc: 'Buy or sell USDT and dollars at our daily rate. Our team sends it by hand after checking your payment.',
      fields: [{ label: 'Where we send it (wallet address or bKash/Nagad number)', req: true }],
      items: [pair('usdt-buy', 'Buy USDT (TRC20)', { unit: 'USDT', rate: 128, pct: 0, min: 5, max: 1000 }), pair('usdt-sell', 'Sell USDT (TRC20)', { unit: 'USDT', rate: 120, pct: 0, min: 5, max: 1000, flow: 'sell', note: 'Send the USDT to the address shown, then enter the transaction hash.' }),
        pair('usd-buy', 'Buy Dollar (Payoneer / Wise)', { unit: 'USD', rate: 130, pct: 0, min: 5, max: 500 })] },
    { id: 'giftcard', name: 'Gift Cards', short: 'Gift Cards', icon: 'fa-brands fa-google-play', color: 'g-purple', mode: 'items', on: true,
      desc: 'Google Play, iTunes, Steam and more. The code is sent to you here in My Orders.',
      fields: [{ label: 'Email', req: false }],
      items: [item('gp10', 'Google Play $10 (US)', 1450), item('gp25', 'Google Play $25 (US)', 3500), item('it10', 'iTunes / Apple $10 (US)', 1500), item('st10', 'Steam $10', 1450), item('st20', 'Steam $20', 2850)] },
    { id: 'smm', name: 'SMM & Premium', short: 'SMM', icon: 'fa-solid fa-hashtag', color: 'g-blue', mode: 'items', on: true,
      desc: 'Telegram Premium, Facebook page services and more premium social services.',
      fields: [{ label: 'Link or username', req: true }],
      items: [item('tgp3', 'Telegram Premium — 3 months (gift)', 1650), item('tgp12', 'Telegram Premium — 12 months (gift)', 4300), item('fbmv', 'Meta Verified (blue badge) — 1 month setup', 1900, 'You need a real name and ID that match the profile.'),
        item('fbpage', 'Facebook page setup & design', 800), item('fbboost', 'Facebook page boost help', 500)] },
    { id: 'games', name: 'Play & Earn', short: 'Games', icon: 'fa-solid fa-gamepad', color: 'g-pink', mode: 'game', on: true,
      desc: 'Beat the computer at Tic-Tac-Toe and get a small reward in your wallet.', fields: [], items: [] },
    { id: 'vcc', name: 'Virtual Card (VCC)', short: 'VCC', icon: 'fa-brands fa-cc-visa', color: 'g-gold', mode: 'items', on: true,
      desc: 'A prepaid virtual Visa or Mastercard in your own name, from a licensed card issuer, for online payments.',
      fields: [{ label: 'Full name (as on your NID)', req: true }, { label: 'Email', req: true }],
      items: [item('visa5', 'Virtual Visa — $5 balance', 950), item('visa10', 'Virtual Visa — $10 balance', 1650), item('mc10', 'Virtual Mastercard — $10 balance', 1650)] },
    { id: 'promo', name: 'Daraz Promo Codes', short: 'Promo Codes', icon: 'fa-solid fa-tags', color: 'g-orange', mode: 'items', on: true,
      desc: 'Discount codes for Daraz shops. The code is sent to you here in My Orders.', fields: [],
      items: [item('dz100', 'Daraz ৳100 off code', 40), item('dz200', 'Daraz ৳200 off code', 80)] },
    { id: 'voucher', name: 'Gift Vouchers', short: 'Vouchers', icon: 'fa-solid fa-gift', color: 'g-red', mode: 'items', on: true,
      desc: 'Apex, Daraz and digital service vouchers — domains, hosting and more.', fields: [{ label: 'Details (domain name, email, etc.)', req: false }],
      items: [item('apex1k', 'Apex shoe voucher ৳1,000', 1000), item('dz500', 'Daraz gift card ৳500', 500), item('dom', '.com domain — 1 year', 1550), item('host', 'Web hosting — 1 year (5 GB)', 1200)] },
    { id: 'mfs', name: 'MFS Exchange', short: 'MFS Exchange', icon: 'fa-solid fa-right-left', color: 'g-green', mode: 'amount', on: true,
      desc: 'Move money between bKash, Nagad and Rocket. Send to our number, we send the amount to your number.',
      fields: [{ label: 'Your receiving number', req: true }],
      items: [pair('b2n', 'bKash → Nagad'), pair('n2b', 'Nagad → bKash'), pair('b2r', 'bKash → Rocket'), pair('r2b', 'Rocket → bKash'), pair('n2r', 'Nagad → Rocket'), pair('r2n', 'Rocket → Nagad')] }
  ],
  games: { on: true, reward: 1, perDay: 5, plays: 30, level: 75 },
  // Extra Balance: deposit once, pay for orders from it; direct = also allow paying each order with a TrxID
  wallet: { on: true, min: 50, max: 50000, direct: true },
  live: { on: true, count: 12 },
  // Verified exclusive: no service charge on fixed-price services and no transaction fee on exchanges
  perk: { on: true, chargePct: 5, chargeMin: 10 },
  // shown on the home page, after applying and in the application details
  loanNotice: { on: true, days: '7–14' }
};

function norm(x) {
  x = x || {};
  const list = Array.isArray(x.services) ? x.services : DEF.services;
  return {
    on: x.on !== false, title: str(x.title || DEF.title, 40),
    services: list.filter(s => s && s.id && s.name).map(s => ({
      id: str(s.id, 30), name: str(s.name, 40), short: str(s.short || s.name, 16), logo: str(s.logo, 500), icon: str(s.icon || 'fa-solid fa-star', 60), color: str(s.color || 'g-teal', 20),
      mode: ['items', 'amount', 'game'].includes(s.mode) ? s.mode : 'items', on: s.on !== false, soon: s.soon === true, badge: str(s.badge, 10), desc: str(s.desc, 400), note: str(s.note, 400),
      fields: (Array.isArray(s.fields) ? s.fields : []).filter(f => f && f.label).slice(0, 6).map(f => ({ label: str(f.label, 60), req: f.req === true })),
      items: (Array.isArray(s.items) ? s.items : []).filter(i => i && i.id && i.name).slice(0, 60).map(i => ({
        id: str(i.id, 30), name: str(i.name, 60), on: i.on !== false, note: str(i.note, 300), price: money(i.price), to: str(i.to, 120),
        unit: str(i.unit || '৳', 8), rate: Math.max(0, Number(i.rate) || 0) || 1, pct: Math.max(0, Math.min(50, Number(i.pct) || 0)), fee: money(i.fee),
        min: Math.max(0, Number(i.min) || 0), max: Math.max(0, Number(i.max) || 0), flow: i.flow === 'sell' ? 'sell' : 'buy' }))
    })),
    games: { ...DEF.games, ...(x.games || {}) },
    wallet: { ...DEF.wallet, ...(x.wallet || {}), min: Math.max(1, money((x.wallet || {}).min ?? DEF.wallet.min)), max: money((x.wallet || {}).max ?? DEF.wallet.max) },
    perk: { ...DEF.perk, ...(x.perk || {}), on: (x.perk || {}).on !== false, chargePct: Math.max(0, Math.min(50, Number((x.perk || {}).chargePct ?? DEF.perk.chargePct) || 0)), chargeMin: money((x.perk || {}).chargeMin ?? DEF.perk.chargeMin) },
    loanNotice: { on: (x.loanNotice || {}).on !== false, days: str((x.loanNotice || {}).days || DEF.loanNotice.days, 20) },
    live: { ...DEF.live, ...(x.live || {}), count: Math.max(3, Math.min(30, money((x.live || {}).count) || DEF.live.count)) }
  };
}
// what the user pays (buy) or gets (sell) for an amount
// Verified members pay no service charge and no transaction fee (the perk; Admin → Extra services)
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
  // add (or take) Extra Balance and write a history line — one transaction; `also` adds more writes to it
  async function xcredit(ref, uid, amount, type, note, extra = {}, also) {
    const log = db().collection('xbalLog').doc();
    let after = 0;
    await db().runTransaction(async t => {
      const s = await t.get(ref);
      after = (Number((s.data() || {}).xbal) || 0) + amount;
      if (after < 0) throw Object.assign(new Error('Not enough Extra Balance. Please add balance first.'), { status: 400, code: 'xbal_low' });
      t.update(ref, { xbal: after });
      t.set(log, { uid, amount, type, note: String(note || '').slice(0, 140), after, at: iso(), ...extra });
      if (also) also(t);
    });
    return after;
  }
  const mask = p => { p = String(p || ''); return p.length >= 6 ? '0' + p.slice(0, 2) + '****' + p.slice(-3) : 'A user'; };
  async function feed(uid, text, s) { try { await db().collection('extraFeed').add({ who: mask(uid), text: str(text, 80), icon: s ? s.icon : 'fa-solid fa-wallet', color: s ? s.color : 'g-green', at: iso() }); _live = null; } catch (e) {} }
  const pubOrder = o => ({ id: o.id, sid: o.sid, sname: o.sname, iname: o.iname, unit: o.unit, amount: o.amount, price: o.price, get: o.get, fee: o.fee || 0, feeWaived: o.feeWaived === true, saved: o.saved || 0, flow: o.flow, fields: o.fields || [], trxId: o.trxId,
    status: o.status, reason: o.reason || '', delivery: o.status === 'Delivered' ? (o.delivery || '') : '', createdAt: o.createdAt, decidedAt: o.decidedAt || '' });

  const actions = {
    extraConfig: async () => [200, await cfg()],

    extraOrder: wrap(async (b, uid) => {
      const { d, u } = await me(uid);
      const C = await cfg();
      if (!C.on) return [400, { error: 'Extra services are switched off right now.' }];
      const s = C.services.find(x => x.id === b.sid && x.on && !x.soon && x.mode !== 'game');
      if (!s) return [400, { error: 'This service is not available right now.' }];
      const i = s.items.find(x => x.id === b.iid && x.on);
      if (!i) return [400, { error: 'Please choose an option.' }];
      let amount = 0;
      if (s.mode === 'amount') {
        amount = Math.round((Number(b.amount) || 0) * 100) / 100;
        if (!(amount > 0)) return [400, { error: 'Please enter the amount.' }];
        if (i.min && amount < i.min) return [400, { error: `The smallest amount is ${i.min} ${i.unit}.` }];
        if (i.max && amount > i.max) return [400, { error: `The largest amount is ${i.max} ${i.unit}.` }];
      }
      const q = quote(s, i, amount, u.phoneVerified === true, C.perk);
      const vals = Array.isArray(b.fields) ? b.fields : [];
      const fields = s.fields.map((f, k) => ({ label: f.label, value: str(vals[k], 300) }));
      const miss = s.fields.find((f, k) => f.req && !fields[k].value);
      if (miss) return [400, { error: `Please fill in: ${miss.label}` }];
      const mine = await db().collection('serviceOrders').where('uid', '==', uid).get();
      if (mine.docs.filter(x => x.data().kind === 'extra' && ['Pending', 'Processing'].includes(x.data().status)).length >= 5) return [400, { error: 'You have 5 orders in progress. Please wait until they are delivered.' }];
      // pay from the Extra Balance (buy options only), or send money and give the TrxID
      const useBal = b.payWith === 'xbal' && i.flow !== 'sell';
      let trxId;
      if (useBal) {
        if (!C.wallet.on) return [400, { error: 'Extra Balance is switched off right now.' }];
        trxId = 'XB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
      } else {
        if (i.flow !== 'sell' && !C.wallet.direct) return [400, { error: 'Please pay from your Extra Balance. Add balance first.' }];
        trxId = String(b.trxId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 80);
        if (trxId.length < 6) return [400, { error: i.flow === 'sell' ? 'Please enter the transaction ID / hash of what you sent.' : 'Please enter the Transaction ID from your payment SMS.' }];
        const [dupO, dupT] = await Promise.all([db().collection('serviceOrders').where('trxId', '==', trxId).limit(1).get(), db().collection('transactions').doc('trx_' + trxId).get()]);
        if (!dupO.empty || dupT.exists) return [400, { error: 'This Transaction ID has already been used.' }];
      }
      const sender = String(b.sender || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      const ref = db().collection('serviceOrders').doc();
      const order = { uid, kind: 'extra', sid: s.id, sname: s.name, iid: i.id, iname: i.name, planName: `${s.name} · ${i.name}`, unit: i.unit, flow: i.flow,
        amount, price: q.pay, get: q.get, base: q.base, fee: q.fee, feeWaived: q.waived, saved: q.saved, fields, trxId, paidWith: useBal ? 'xbal' : 'trx', sender: isPhone(sender) ? sender : '', payMethod: useBal ? 'Extra Balance' : str(b.payMethod, 30),
        toNumber: useBal ? '' : str(b.toNumber || i.to, 120), status: useBal ? 'Processing' : 'Pending', createdAt: iso() };
      let xbal = null;
      if (useBal) xbal = await xcredit(d.ref, uid, -q.pay, 'order', `${s.name} · ${i.name}`, { orderId: ref.id }, t => t.set(ref, order));
      else await ref.set(order);
      await feed(uid, `ordered ${i.name}`, s);
      await notifyUser(uid, 'Order received 🛒', `${s.name} · ${i.name}${amount ? ` (${amount} ${i.unit})` : ''} — ${useBal ? `paid ৳${q.pay} from your Extra Balance` : 'TrxID ' + trxId}. Our team will deliver it soon. See Extra Services → My orders.`, 'transaction');
      return [200, { ok: true, id: ref.id, xbal }];
    }),

    extraOrders: wrap(async (b, uid) => {
      const s = await db().collection('serviceOrders').where('uid', '==', uid).get();
      const list = s.docs.map(x => ({ id: x.id, ...x.data() })).filter(o => o.kind === 'extra').sort((a, c) => String(c.createdAt).localeCompare(String(a.createdAt))).slice(0, 50).map(pubOrder);
      return [200, { list }];
    }),

    // Extra Balance: a separate balance only for Extra Services (not the loan balance, not for loan fees)
    xbalState: wrap(async (b, uid) => {
      const { u } = await me(uid);
      const [lg, od] = await Promise.all([db().collection('xbalLog').where('uid', '==', uid).get(), db().collection('serviceOrders').where('uid', '==', uid).get()]);
      const log = lg.docs.map(x => x.data()).sort((a, c) => String(c.at).localeCompare(String(a.at))).slice(0, 40);
      const deposits = od.docs.map(x => ({ id: x.id, ...x.data() })).filter(o => o.kind === 'xdeposit').sort((a, c) => String(c.createdAt).localeCompare(String(a.createdAt))).slice(0, 10)
        .map(o => ({ id: o.id, amount: o.price, trxId: o.trxId, status: o.status, reason: o.reason || '', createdAt: o.createdAt }));
      return [200, { xbal: Number(u.xbal) || 0, log, deposits, verified: u.phoneVerified === true, vip: !!SVC.vipState(u) }];
    }),
    xbalDeposit: wrap(async (b, uid) => {
      await me(uid);
      const C = await cfg(), W = C.wallet;
      if (!W.on) return [400, { error: 'Extra Balance is switched off right now.' }];
      const amount = money(b.amount);
      if (amount < W.min) return [400, { error: `The smallest deposit is ৳${W.min}.` }];
      if (W.max && amount > W.max) return [400, { error: `The largest deposit is ৳${W.max}.` }];
      const trxId = String(b.trxId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40);
      if (trxId.length < 6) return [400, { error: 'Please enter the Transaction ID from your payment SMS.' }];
      const [dupO, dupT] = await Promise.all([db().collection('serviceOrders').where('trxId', '==', trxId).limit(1).get(), db().collection('transactions').doc('trx_' + trxId).get()]);
      if (!dupO.empty || dupT.exists) return [400, { error: 'This Transaction ID has already been used.' }];
      const mine = await db().collection('serviceOrders').where('uid', '==', uid).get();
      if (mine.docs.filter(x => x.data().kind === 'xdeposit' && x.data().status === 'Pending').length >= 3) return [400, { error: 'You have 3 deposits waiting for check. Please wait a little.' }];
      const sender = String(b.sender || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      const ref = await db().collection('serviceOrders').add({ uid, kind: 'xdeposit', planName: 'Extra Balance deposit', sname: 'Extra Balance', iname: 'Deposit', price: amount, trxId,
        sender: isPhone(sender) ? sender : '', payMethod: str(b.payMethod, 30), toNumber: str(b.toNumber, 40), status: 'Pending', createdAt: iso() });
      await notifyUser(uid, 'Deposit received 💳', `We received your Extra Balance deposit of ৳${amount} (TrxID ${trxId}). It is added as soon as we check it.`, 'transaction');
      return [200, { ok: true, id: ref.id }];
    }),

    // live list under Extra Services: the latest real orders and deposits (numbers are masked)
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
          await xcredit(ud.ref, o.uid, o.price, 'deposit', `Deposit · TrxID ${o.trxId}`, { orderId: s.id }, t => t.update(ref, { status: 'Approved', decidedAt: iso(), decidedBy: user.uid }));
          await feed(o.uid, `added ৳${o.price} Extra Balance`, null);
          await notifyUser(o.uid, 'Extra Balance added ✅', `৳${o.price} is added to your Extra Balance. You can order any Extra Service now.`, 'success');
        } else if (b.op === 'reject') {
          const reason = str(b.reason, 200);
          await ref.update({ status: 'Rejected', reason, decidedAt: iso(), decidedBy: user.uid });
          await notifyUser(o.uid, 'Deposit not approved', `Your Extra Balance deposit of ৳${o.price} (TrxID ${o.trxId}) could not be approved.${reason ? ' Reason: ' + reason : ''}`, 'warning');
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
        await notifyUser(o.uid, 'Order delivered ✅', `${what} is delivered.${text ? ' Open Extra Services → My orders to see the details.' : ''}`, 'success');
      } else if (b.op === 'reject') {
        const reason = str(b.reason, 200);
        // paid from the Extra Balance: the money goes straight back
        if (o.paidWith === 'xbal' && o.price > 0 && ud) await xcredit(ud.ref, o.uid, o.price, 'refund', `Refund · ${what}`, { orderId: s.id }, t => t.update(ref, { status: 'Rejected', reason, refunded: true, decidedAt: iso(), decidedBy: user.uid }));
        else await ref.update({ status: 'Rejected', reason, decidedAt: iso(), decidedBy: user.uid });
        await notifyUser(o.uid, 'Order not completed', `Your order ${what} could not be completed.${reason ? ' Reason: ' + reason : ''} ${o.paidWith === 'xbal' ? `৳${o.price} is back in your Extra Balance.` : 'Please contact support if you paid.'}`, 'warning');
      } else return [400, { error: 'Unknown action.' }];
      return [200, { ok: true }];
    },

    // admin: add or take Extra Balance by hand (refunds, corrections)
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
      try { after = await xcredit(ud.ref, phone, amount, 'admin', note, { by: user.uid }); } catch (e) { if (e.status) return [e.status, { error: 'The user does not have that much Extra Balance.' }]; throw e; }
      await notifyUser(phone, amount > 0 ? 'Extra Balance added' : 'Extra Balance updated', `${amount > 0 ? '+' : '−'}৳${Math.abs(amount)} · ${note}. Extra Balance now ৳${after}.`, amount > 0 ? 'success' : 'info');
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
      let balance = null;
      if (b.op === 'move' && out.result === 'win' && out.reward > 0) balance = await SVC.credit(d.ref, uid, out.reward, 'game', 'Tic-Tac-Toe win');
      return [200, { b: out.b || '', over: out.over !== false, result: out.result || '', reward: b.op === 'move' ? (out.reward || 0) : 0, balance,
        wins: out.wins || 0, plays: out.plays || 0, perDay: G.perDay, maxPlays: G.plays, prize: money(G.reward) }];
    })
  };
  return { actions, cfg };
};
module.exports.DEF = DEF;
module.exports.norm = norm;
module.exports.quote = quote;
