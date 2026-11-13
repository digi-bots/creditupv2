// Account API: everything that must not be decided in the browser.
//   POST /api/account  { action, ... }
//   exists        { phone }                 → { exists }
//   register      { phone, password, referrer? } → creates the login + profile (bonus decided here)
//   migrate       { phone, password }       → moves an older account (password kept in Firestore) to Firebase Auth
//   feed          { admin? }                → live activity: approved loans + verified fees (masked), per Home Page settings
//   myReferral    {}            (signed in) → can this user still add an invite code?
//   setReferrer   { code }      (signed in) → adds the inviter's code after sign-up (if the admin allows it)
//   offerCount    {}                        → how many users took the "first 50" offer
//   claimOffer    {}            (signed in) → 'ok' | 'already' | 'full'
//   referrals     {}            (signed in) → { total, active }
//   balanceOffer  {}            (signed in) → { available, locked, used, allowed, active, needMore } (balance use: 1 + 1 per 5 active friends + admin extras)
//   adminBalanceOffer { phone, op: status|unlock|lock } (admin) → same state; unlock gives one more use now, lock switches it off
//   adminResetPassword { phone, password } (admin) → sets a user's new password
//   adminDeleteLogin   { phone }           (admin) → removes a deleted user's login
// Needs FIREBASE_SERVICE_ACCOUNT in Vercel → Settings → Environment Variables.
const crypto = require('crypto');
const { readBody } = require('./_lib/pay');
const { admin, db, auth, caller, isAdmin, findUserDoc, phoneEmail, isPhone } = require('./_lib/auth');

const OFFER_LIMIT = 50;
// the "use balance for the fee" offer: 1 use, plus 1 more for every this many active friends
const BAL_FRIENDS_PER_USE = 5;
const strong = (pw) => typeof pw === 'string' && pw.length >= 8 && pw.length <= 128 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
const sameText = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

// the one-time "use balance for the fee" offer:
// 1 use + 1 per BAL_FRIENDS_PER_USE active friends + any uses an admin added; an admin lock switches it off
async function balanceState(d, phone, syncFlag) {
  const data = d.data() || {};
  const [refs, trx] = await Promise.all([
    db().collection('users').where('referredBy', '==', phone).get(),
    db().collection('transactions').where('uid', '==', phone).get()
  ]);
  const active = refs.docs.filter(x => x.data().status === 'active').length;
  const used = trx.docs.filter(x => Number(x.data().appliedBalance) > 0 && x.data().status !== 'Rejected').length;
  const extra = Math.max(0, Number(data.balanceExtraUses) || 0);
  const locked = data.balanceLocked === true;
  const allowed = 1 + Math.floor(active / BAL_FRIENDS_PER_USE) + extra;
  const available = !locked && used < allowed;
  // friends still needed for the next use (0 when free or when an admin lock is on)
  const needMore = (available || locked) ? 0 : (used + 1 - allowed) * BAL_FRIENDS_PER_USE - (active % BAL_FRIENDS_PER_USE);
  // keep the profile flag in step: the online payment reads it
  const wasUsed = data.balanceAdjustUsed === true;
  if (syncFlag && wasUsed === available) {
    await d.ref.update({ balanceAdjustUsed: !available });
    // it was used before and is free again (new friends or an admin unlock): tell the user
    if (available && wasUsed) await notifyUser(phone, 'Balance Offer Unlocked 🔓', 'You can use up to ৳100 of your Credit Up balance on your next fee payment again.', 'bonus');
  }
  return { available, locked, used, allowed, extra, active, needMore, perUse: BAL_FRIENDS_PER_USE };
}

async function notifyUser(uid, title, message, type) {
  try { await db().collection('user_notifications').add({ uid, title, message, type: type || 'info', createdAt: new Date().toISOString() }); }
  catch (e) { console.warn('notify', e); }
}

// a friend joined with this user's link: tell them, plus any reward or balance-offer use it unlocked
const REF_MILESTONES = { 20: '1st installment free (loans under ৳10,000)', 50: '৳5,000 loan, no need to pay back', 100: '৳50,000 cash reward' };
async function notifyReferrer(ref) {
  try {
    const d = await findUserDoc(ref);
    if (!d) return;
    const refs = await db().collection('users').where('referredBy', '==', ref).get();
    const active = refs.docs.filter(x => x.data().status === 'active').length;
    const next = [20, 50, 100].find(n => n > active);
    await notifyUser(ref, 'A Friend Joined! 👋', `A friend joined Credit Up with your invite link. You now have ${active} active friend${active === 1 ? '' : 's'}.`
      + (next ? ` ${next - active} more to unlock: ${REF_MILESTONES[next]}.` : ''), 'bonus');
    if (REF_MILESTONES[active]) await notifyUser(ref, 'Reward Unlocked! 🏆', `You reached ${active} active friends and unlocked: ${REF_MILESTONES[active]}. Contact support to claim it.`, 'bonus');
    await balanceState(d, ref, true);   // sends "Balance Offer Unlocked" if 5 more friends freed it again
  } catch (e) { console.warn('referrer notify', e); }
}

async function homeCfg() {
  try { const s = await db().collection('siteConfig').doc('home').get(); return s.exists ? (s.data() || {}) : {}; }
  catch (e) { return {}; }
}
const maskName = (n) => { n = String(n || 'User').trim() || 'User'; return n.length > 4 ? n.substring(0, 4) + '***' : n; };
const maskPhone = (p) => { p = String(p || '').replace(/\D/g, ''); return p.length >= 6 ? '0' + p.slice(0, 3) + '*****' + p.slice(-2) : 'User'; };
// fees are never shown in full: first two digits, the rest hidden (৳1,300 → "13**.00")
const maskFee = (n) => { const s = String(Math.round(Number(n) || 0)); return s.slice(0, 2) + '*'.repeat(Math.max(0, s.length - 2)) + '.00'; };

async function referralEntryState(d) {
  const data = d.data() || {};
  const cfg = (await homeCfg()).referralEntry || {};
  const days = Math.max(0, Number(cfg.days) || 0);
  const base = { on: cfg.on !== false, days, referredBy: data.referredBy || '' };
  if (cfg.on === false) return { ...base, canSet: false, reason: 'Adding an invite code is turned off right now.' };
  if (data.referredBy) return { ...base, canSet: false, reason: 'An invite code is already added to your account.' };
  if (days && data.createdAt && Date.now() - new Date(data.createdAt).getTime() > days * 864e5)
    return { ...base, canSet: false, reason: `An invite code can only be added within ${days} day${days === 1 ? '' : 's'} of joining.` };
  return { ...base, canSet: true };
}

async function authUser(uid) { try { return await auth().getUser(uid); } catch (e) { return null; } }

// someone may have created a Firebase login with this phone's e-mail from the browser;
// such a login is not tied to the phone number (its UID differs), so it is removed
async function freeEmail(phone) {
  try {
    const u = await auth().getUserByEmail(phoneEmail(phone));
    if (u.uid !== phone) await auth().deleteUser(u.uid);
  } catch (e) { /* not found: nothing to do */ }
}

async function createLogin(phone, password) {
  await freeEmail(phone);
  await auth().createUser({ uid: phone, email: phoneEmail(phone), password, emailVerified: true });
}

const actions = {
  async exists(b) {
    if (!isPhone(b.phone)) return [400, { error: 'Invalid phone number.' }];
    const d = await findUserDoc(b.phone);
    return [200, { exists: !!d || !!(await authUser(b.phone)) }];
  },

  async register(b) {
    const phone = String(b.phone || ''), pw = b.password;
    if (!isPhone(phone)) return [400, { error: 'Please enter a valid 10-digit BD mobile number.' }];
    if (!strong(pw)) return [400, { error: 'Password must be at least 8 characters and contain both letters and numbers.' }];
    const store = db();
    const cfgSnap = await store.collection('siteConfig').doc('main').get();
    const cfg = cfgSnap.exists ? cfgSnap.data() : {};
    if (cfg.flags?.registrationOpen === false) return [403, { error: 'New user registration is currently disabled.', code: 'closed' }];
    if (await findUserDoc(phone) || await authUser(phone)) return [409, { error: 'This number is already registered.', code: 'exists' }];

    // 0 is a valid admin choice (no bonus); only a missing value falls back to 100
    const raw = cfg.newUserBonus;
    const bonus = (raw === undefined || raw === null || raw === '' || isNaN(Number(raw))) ? 100 : Math.max(0, Number(raw));
    const now = new Date().toISOString();
    const u = { phone, createdAt: now, appStatus: 0, balance: bonus, status: 'active' };
    const ref = String(b.referrer || '');
    if (isPhone(ref) && ref !== phone && await findUserDoc(ref)) u.referredBy = ref;

    await createLogin(phone, pw);
    const userRef = store.collection('users').doc(phone);
    try {
      await store.runTransaction(async (t) => {
        const cur = await t.get(userRef);
        if (cur.exists) throw Object.assign(new Error('exists'), { code: 'exists' });
        t.set(userRef, u);
      });
    } catch (e) {
      await auth().deleteUser(phone).catch(() => {});
      if (e.code === 'exists') return [409, { error: 'This number is already registered.', code: 'exists' }];
      throw e;
    }
    const notes = store.collection('user_notifications');
    await notes.add({ uid: phone, title: 'Welcome to Credit Up! 🎉', message: 'Your account is created successfully.', type: 'welcome', createdAt: new Date(Date.now() - 2000).toISOString() });
    if (bonus > 0) await notes.add({ uid: phone, title: 'Sign-up Bonus Received! 🎁', message: `You have received ৳${bonus} sign-up bonus.`, type: 'bonus', createdAt: now });
    if (u.referredBy) await notifyReferrer(u.referredBy);
    return [200, { ok: true, bonus }];
  },

  async migrate(b) {
    const phone = String(b.phone || ''), pw = String(b.password || '');
    if (!isPhone(phone) || !pw) return [400, { error: 'Invalid request.' }];
    const d = await findUserDoc(phone);
    if (!d) return [404, { error: 'No account with this number.', code: 'not_found' }];
    // already moved: the browser's sign-in failed, so the password is wrong
    if (await authUser(phone)) return [401, { error: 'The password you entered is incorrect.', code: 'wrong_password' }];
    const data = d.data();
    if (typeof data.password !== 'string' || !sameText(data.password, pw)) return [401, { error: 'The password you entered is incorrect.', code: 'wrong_password' }];
    if (data.status === 'banned') return [403, { error: 'Your account has been suspended by admin.', code: 'banned' }];
    if (pw.length < 6) return [400, { error: 'Your password is too short for the new secure login. Please contact support to set a new password.', code: 'short' }];
    await createLogin(phone, pw);
    // the password now lives only in Firebase Auth (hashed); remove the plain copy
    await d.ref.update({ password: admin.firestore.FieldValue.delete(), authMigratedAt: new Date().toISOString() });
    return [200, { ok: true }];
  },

  // live activity on the home page: real approved loans and verified fee payments only.
  // The admin decides what is shown (Home Page → Live Transactions); fees are always partly hidden.
  async feed(b, me) {
    const cfg = (await homeCfg()).live || {};
    const admin = !!(b && b.admin && me && await isAdmin(me.uid));
    if (cfg.on === false && !admin) return [200, { items: [], off: true }];
    const hidden = new Set(Array.isArray(cfg.hidden) ? cfg.hidden : []);
    const days = Math.max(0, Number(cfg.days) || 0);
    const since = days ? Date.now() - days * 864e5 : 0;
    const count = Math.min(30, Math.max(1, Number(cfg.count) || 8));
    const items = [];
    if (cfg.loans !== false) {
      const snap = await db().collection('applications').where('status', 'in', ['Approved', 'Disbursed']).limit(300).get();
      const at = (a) => a.disbursedAt || a.creditedAt || a.approvedAt || a.statusUpdatedAt || a.submittedAt || '';
      snap.docs.forEach(x => {
        const a = x.data();
        items.push({ id: 'a_' + x.id, kind: 'loan', name: maskName(a.name), amount: Number(String(a.loanAmount || 0).replace(/,/g, '')) || 0, at: at(a) });
      });
    }
    if (cfg.fees !== false) {
      const snap = await db().collection('transactions').where('status', '==', 'Verified').limit(300).get();
      snap.docs.forEach(x => {
        const t = x.data();
        const amt = Number(t.amount) || 0;
        if (amt <= 0) return;
        items.push({ id: 't_' + x.id, kind: 'fee', name: maskPhone(t.uid), amount: maskFee(amt), at: t.verifiedAt || t.submittedAt || t.createdAt || '' });
      });
    }
    const out = items
      .filter(i => !since || new Date(i.at || 0).getTime() >= since)
      .filter(i => admin || !hidden.has(i.id))
      .sort((x, y) => new Date(y.at || 0) - new Date(x.at || 0))
      .slice(0, admin ? 40 : count)
      .map(i => admin ? { ...i, hidden: hidden.has(i.id) } : i);
    return [200, { items: out }];
  },

  // a user who joined without an invite link can add the inviter's code later (Home Page → Invite Code in Profile)
  async myReferral(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const d = await findUserDoc(me.uid);
    if (!d) return [404, { error: 'Account not found.' }];
    return [200, await referralEntryState(d)];
  },

  async setReferrer(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const d = await findUserDoc(me.uid);
    if (!d) return [404, { error: 'Account not found.' }];
    const st = await referralEntryState(d);
    if (!st.canSet) return [400, { error: st.reason || 'You cannot add an invite code now.' }];
    const ref = String(b.code || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
    if (!isPhone(ref)) return [400, { error: 'Please enter a valid invite code (the inviter\'s phone number).' }];
    if (ref === me.uid) return [400, { error: 'You cannot use your own invite code.' }];
    const rd = await findUserDoc(ref);
    if (!rd) return [404, { error: 'No account found with this invite code.' }];
    if (rd.data().referredBy === me.uid) return [400, { error: 'This person joined with your invite code, so you cannot use theirs.' }];
    await d.ref.update({ referredBy: ref, referredVia: 'profile', referredAt: new Date().toISOString() });
    await notifyUser(me.uid, 'Invite Code Added ✅', 'Your invite code was added. Your friend will get credit for inviting you.', 'info');
    await notifyReferrer(ref);
    return [200, { ok: true }];
  },

  async offerCount() {
    const c = await db().collection('users').where('promoClaimed', '==', true).count().get();
    return [200, { count: c.data().count, limit: OFFER_LIMIT }];
  },

  async claimOffer(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const d = await findUserDoc(me.uid);
    if (!d) return [404, { error: 'Account not found.' }];
    if (d.data().promoClaimed === true) return [200, { result: 'already' }];
    const c = await db().collection('users').where('promoClaimed', '==', true).count().get();
    if (c.data().count >= OFFER_LIMIT) return [200, { result: 'full' }];
    await d.ref.update({ promoClaimed: true, promoClaimedAt: new Date().toISOString(), promo: 'First installment free' });
    return [200, { result: 'ok' }];
  },

  async referrals(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const s = await db().collection('users').where('referredBy', '==', me.uid).get();
    return [200, { total: s.size, active: s.docs.filter(x => x.data().status === 'active').length }];
  },

  async balanceOffer(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const d = await findUserDoc(me.uid);
    if (!d) return [404, { error: 'Account not found.' }];
    return [200, await balanceState(d, me.uid, true)];
  },

  // admin: see the offer, give one more use now ('unlock'), or switch it off for this user ('lock')
  async adminBalanceOffer(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    const phone = String(b.phone || '');
    if (!isPhone(phone)) return [400, { error: 'Invalid phone number.' }];
    const d = await findUserDoc(phone);
    if (!d) return [404, { error: 'Account not found.' }];
    const op = String(b.op || 'status');
    if (op === 'unlock') {
      const st = await balanceState(d, phone, false);
      const extra = (Number(d.data().balanceExtraUses) || 0) + Math.max(0, st.used + 1 - st.allowed);
      await d.ref.update({ balanceExtraUses: extra, balanceLocked: false, balanceOfferBy: me.uid, balanceOfferAt: new Date().toISOString() });
    } else if (op === 'lock') {
      const wasLocked = d.data().balanceLocked === true;
      await d.ref.update({ balanceLocked: true, balanceOfferBy: me.uid, balanceOfferAt: new Date().toISOString() });
      if (!wasLocked) await notifyUser(phone, 'Balance Offer Paused', 'The "use balance for the fee" offer is switched off on your account for now. Please contact support if you have questions.', 'warning');
    } else if (op !== 'status') return [400, { error: 'Unknown action.' }];
    const fresh = await d.ref.get();
    return [200, await balanceState(fresh, phone, true)];
  },

  async adminResetPassword(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    const phone = String(b.phone || ''), pw = String(b.password || '');
    if (!isPhone(phone)) return [400, { error: 'Invalid phone number.' }];
    if (pw.length < 6 || pw.length > 128) return [400, { error: 'Password must be at least 6 characters.' }];
    const d = await findUserDoc(phone);
    if (!d) return [404, { error: 'No user with this number.' }];
    if (await authUser(phone)) await auth().updateUser(phone, { password: pw });
    else await createLogin(phone, pw);
    await d.ref.update({ password: admin.firestore.FieldValue.delete(), passwordResetAt: new Date().toISOString() });
    return [200, { ok: true }];
  },

  // removes the login of a user the admin deleted, so the number can register again
  async adminDeleteLogin(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    const phone = String(b.phone || '');
    if (!isPhone(phone)) return [400, { error: 'Invalid phone number.' }];
    if (await authUser(phone)) await auth().deleteUser(phone);
    return [200, { ok: true }];
  }
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return res.status(503).json({ error: 'Login service is not set up yet (FIREBASE_SERVICE_ACCOUNT is missing).', code: 'not_configured' });
  const b = readBody(req);
  const fn = Object.prototype.hasOwnProperty.call(actions, b.action) ? actions[b.action] : null;
  if (!fn) return res.status(400).json({ error: 'Unknown action.' });
  try {
    const me = await caller(req);
    const [status, out] = await fn(b, me);
    return res.status(status).json(out);
  } catch (e) {
    console.error('account', b.action, e);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
