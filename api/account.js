// Account API: everything that must not be decided in the browser.
//   POST /api/account  { action, ... }
//   exists        { phone }                 → { exists }
//   register      { phone, password, referrer? } → creates the login + profile (bonus decided here)
//   login         { phone, password }       → { token } to sign in; counts wrong passwords (5 tries → 5 min, 30 min, 1 h, 6 h, 12 h, then suspended)
//   migrate       { phone, password }       → same as login (older app versions)
//   adminUnlockLogin { phone }       (admin) → removes the wrong-password lock / automatic suspension
//   feed          { admin? }                → live activity: approved loans + verified fees (masked), per Home Page settings
//   myReferral    {}            (signed in) → can this user still add an invite code?
//   setReferrer   { code }      (signed in) → adds the inviter's code after sign-up (if the admin allows it)
//   offerCount    {}                        → { count, limit, open } for the hot offer (Home Page → Hot Offer)
//   claimOffer    {}            (signed in) → 'ok' | 'already' | 'full' | 'closed'
//   referrals     {}            (signed in) → { total, active }
//   balanceOffer  {}            (signed in) → { available, locked, used, allowed, active, needMore } (balance use: 1 + 1 per 5 active friends + admin extras)
//   adminBalanceOffer { phone, op: status|unlock|lock } (admin) → same state; unlock gives one more use now, lock switches it off
//   adminResetPassword { phone, password } (admin) → sets a user's new password
//   adminDeleteLogin   { phone }           (admin) → removes a deleted user's login
//   adminCreateUser    { phone, password, name?, balance?, status?, referrer?, note?, fixLogin? } (admin) → creates the login + profile by hand
//   adminLoginStatus   { phone }           (admin) → { profile, login } so the admin can see why a user cannot sign in
//   ping               {}            (signed in) → records when the user was last active (Admin → Users → Active users)
//   showcase           { admin? }               → home page stats (users, granted loans, money sent, today) + invite champions + offer winners + reviews
//   adminTeam          { op: list|create|update|remove|password, ... } (super admin) → manage admin accounts and their roles
//   runOverdue         {}                (admin) → mark overdue loans and send reminders now (also runs daily)
//   submitReview       { rating, text }  (signed in, had a loan) → a review waits for admin approval (SEO & Reviews)
//   myReview           {}                (signed in) → { canReview, review }
//   pushSubscribe      { token, device } (signed in) → this device gets phone notifications for this user
//   pushUnsubscribe    { token }                     → stop notifications on this device (logout)
//   adminPush          { audience: all|user, phone?, title, body, link?, type?, auto? } (admin) → send a phone notification
//   adminPushStats     {}                (admin) → { devices, users }
// Needs FIREBASE_SERVICE_ACCOUNT in Vercel → Settings → Environment Variables.
const crypto = require('crypto');
const { readBody } = require('./_lib/pay');
const { admin, db, auth, caller, isAdmin, findUserDoc, phoneEmail, isPhone } = require('./_lib/auth');
const { runOverdue } = require('./_lib/overdue');
const { sendPush, autoPush, pushCfg, tokenId, category } = require('./_lib/push');

// admins: a document in "admins" per Firebase Auth UID. role: superadmin | admin | a custom role (Team & Settings).
// An older admin document without a role is treated as an owner (full access), so nothing breaks after the update.
async function adminInfo(uid) {
  if (!uid) return null;
  const s = await db().collection('admins').doc(uid).get();
  if (!s.exists) return null;
  const d = s.data() || {};
  const role = String(d.role || '').toLowerCase().replace(/[\s_-]/g, '');
  return { ...d, uid, role: role || 'owner', canTeam: !role || role === 'superadmin' };
}
// may this admin change this section? The same rule as Firestore: full roles may do everything,
// other roles need "edit" for one of the sections in adminConfig/roles (Team & Settings). secs = null: any admin.
const FULL_ROLES = ['', 'owner', 'superadmin', 'admin'];
async function adminCan(me, secs) {
  if (!me) return false;
  const s = await db().collection('admins').doc(me.uid).get();
  if (!s.exists) return false;
  const raw = String((s.data() || {}).role || '').toLowerCase();
  if (!secs || FULL_ROLES.includes(raw.replace(/[\s_-]/g, ''))) return true;
  const r = await db().collection('adminConfig').doc('roles').get();
  const perms = ((((r.exists && r.data().roles) || {})[raw]) || {}).perms || {};
  return secs.some(k => perms[k] === 'edit');
}
const noRole = [403, { error: 'Your admin role does not allow this.' }];
// a random id the app keeps on each phone (not personal data) — only letters, digits and dashes
const devId = v => { const s = String(v || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 40); return s.length >= 12 ? s : ''; };
const cleanEmail = e => String(e || '').trim().toLowerCase();
const okEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

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
  const used = trx.docs.filter(x => Number(x.data().appliedBalance) > 0 && x.data().status !== 'Rejected' && x.data().removed !== true).length;
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
    if (available && wasUsed) await notifyUser(phone, 'Balance Offer Unlocked 🔓', 'You can use up to ৳100 of your Creditfy balance on your next fee payment again.', 'bonus');
  }
  return { available, locked, used, allowed, extra, active, needMore, perUse: BAL_FRIENDS_PER_USE };
}

async function notifyUser(uid, title, message, type) {
  try { await db().collection('user_notifications').add({ uid, title, message, type: type || 'info', createdAt: new Date().toISOString() }); }
  catch (e) { console.warn('notify', e); }
  await autoPush(uid, title, message, type || 'info');   // also to the phone, when allowed
  await require('./_lib/tg').dm(db, uid, title, message);   // and to the user's Telegram, when linked
}

// a friend joined with this user's link: tell them, plus any reward or balance-offer use it unlocked
const REF_MILESTONES = { 20: '1st installment free (loans under ৳10,000)', 50: '৳5,000 loan, no need to pay back', 100: '৳50,000 cash reward' };
// invite targets: Admin → Home Page → Winners → Invite targets (falls back to 20 / 50 / 100)
function refTargetsFrom(home) {
  const T = Array.isArray(home?.winners?.targets) ? home.winners.targets : null;
  const list = T && T.length ? T.map(t => ({ need: Math.round(Number(t.need) || 0), prize: String(t.prize || '').slice(0, 120) })).filter(t => t.need > 0 && t.prize)
    : Object.entries(REF_MILESTONES).map(([n, p]) => ({ need: Number(n), prize: p }));
  return list.sort((a, b) => a.need - b.need);
}
async function notifyReferrer(ref) {
  try {
    const d = await findUserDoc(ref);
    if (!d) return;
    const refs = await db().collection('users').where('referredBy', '==', ref).get();
    const active = refs.docs.filter(x => x.data().status === 'active').length;
    const targets = refTargetsFrom(await homeCfg());
    const next = targets.find(t => t.need > active), hit = targets.find(t => t.need === active);
    await notifyUser(ref, 'A Friend Joined! 👋', `A friend joined Creditfy with your invite link. You now have ${active} active friend${active === 1 ? '' : 's'}.`
      + (next ? ` ${next.need - active} more to unlock: ${next.prize}.` : ''), 'bonus');
    if (hit) {
      const manual = (((await homeCfg()).winners || {}).mode || 'manual') !== 'auto';
      const needV = ((await SVC.cfg()).bonus || {}).requireVerified !== false && (d.data() || {}).phoneVerified !== true;
      const vNote = needV ? ' Only Verified members can win prizes — get your Verified badge from Quick Services to take part.' : '';
      if (manual) await notifyUser(ref, 'Target Reached! 🎯', `You reached ${active} active friends for: ${hit.prize}. Winners are chosen by our team — watch the Winners section on the home page!${vNote}`, 'bonus');
      else await notifyUser(ref, 'Reward Unlocked! 🏆', `You reached ${active} active friends and unlocked: ${hit.prize}. ${needV ? 'Get your Verified badge to claim it.' : 'Contact support to claim it.'}`, 'bonus');
    }
    await balanceState(d, ref, true);   // sends "Balance Offer Unlocked" if 5 more friends freed it again
  } catch (e) { console.warn('referrer notify', e); }
}

async function homeCfg() {
  try { const s = await db().collection('siteConfig').doc('home').get(); return s.exists ? (s.data() || {}) : {}; }
  catch (e) { return {}; }
}
// the hot ("first N users") offer, set in Admin → Home Page → Hot Offer. A new round restarts the count.
async function fomoCfg() {
  const f = (await homeCfg()).fomo || {};
  const end = f.end ? new Date(f.end).getTime() : 0;
  return {
    on: f.on !== false,
    ended: !!end && Date.now() > end,
    limit: Math.min(100000, Math.max(1, parseInt(f.limit, 10) || 50)),
    round: Math.max(1, parseInt(f.round, 10) || 1),
    promo: String(f.promo || 'First installment free').slice(0, 80)
  };
}
async function fomoClaims(round) {
  // round 1 counts every earlier claim too (they were made before rounds existed)
  const q = round === 1 ? db().collection('users').where('promoClaimed', '==', true) : db().collection('users').where('promoRound', '==', round);
  return (await q.count().get()).data().count;
}
const maskName = (n) => { n = String(n || 'User').trim() || 'User'; return n.length > 4 ? n.substring(0, 4) + '***' : n; };
const maskPhone = (p) => { p = String(p || '').replace(/\D/g, ''); return p.length >= 6 ? '0' + p.slice(0, 3) + '*****' + p.slice(-2) : 'User'; };
// fees are never shown in full: first two digits, the rest hidden (৳1,300 → "13**.00")
const maskFee = (n) => { const s = String(Math.round(Number(n) || 0)); return s.slice(0, 2) + '*'.repeat(Math.max(0, s.length - 2)) + '.00'; };

// ── home page showcase: real totals, invite champions and offer winners (Admin → Home Page → Stats / Winners) ──
const GRANTED = ['Approved', 'Disbursed', 'Active', 'Repaid', 'Overdue'];
const num = (v) => Number(String(v ?? '').replace(/,/g, '')) || 0;
const dhakaDay = (t) => new Date(new Date(t).getTime() + 6 * 3600e3).toISOString().slice(0, 10);   // Bangladesh time (UTC+6)
let _showcaseCache = { at: 0, data: null };
async function showcaseData() {
  if (_showcaseCache.data && Date.now() - _showcaseCache.at < 60e3) return _showcaseCache.data;
  const store = db();
  const [uSnap, aSnap, tSnap, mainSnap] = await Promise.all([
    store.collection('users').select('phone', 'name', 'status', 'referredBy', 'createdAt', 'createdBy', 'promoClaimed', 'promoClaimedAt', 'promo', 'removed', 'phoneVerified').get(),
    store.collection('applications').select('uid', 'name', 'status', 'loanAmount', 'approvedAt', 'disbursedAt', 'creditedAt', 'statusUpdatedAt', 'submittedAt', 'removed').get(),
    store.collection('transactions').where('status', '==', 'Verified').select('uid', 'appliedBalance', 'verifiedAt', 'submittedAt', 'removed').get(),
    store.collection('siteConfig').doc('main').get()
  ]);
  const users = uSnap.docs.map(d => d.data()).filter(u => u.removed !== true);
  const allApps = aSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.removed !== true);
  const apps = allApps.filter(a => GRANTED.includes(a.status));
  const verified = tSnap.docs.filter(d => d.data().removed !== true);
  const names = {};
  apps.forEach(a => { if (a.name && a.uid) names[a.uid] = a.name; });
  users.forEach(u => { if (u.name) names[u.phone] = u.name; });
  const today = dhakaDay(Date.now());
  const at = a => a.disbursedAt || a.creditedAt || a.approvedAt || a.statusUpdatedAt || a.submittedAt || '';
  const stats = {
    users: users.filter(u => u.status !== 'banned').length,
    borrowers: new Set(apps.map(a => a.uid).filter(Boolean)).size,
    granted: apps.length,
    distributed: apps.reduce((t, a) => t + num(a.loanAmount), 0),
    today: apps.filter(a => at(a) && dhakaDay(at(a)) === today).reduce((t, a) => t + num(a.loanAmount), 0),
    todayCount: apps.filter(a => at(a) && dhakaDay(at(a)) === today).length,
    applications: allApps.length,
    activeLoans: apps.filter(a => ['Approved', 'Disbursed', 'Active', 'Overdue'].includes(a.status)).length,
    repaid: apps.filter(a => a.status === 'Repaid').length,
    verified: verified.length,
    invites: users.filter(u => u.referredBy).length,
    avgLoan: apps.length ? Math.round(apps.reduce((t, a) => t + num(a.loanAmount), 0) / apps.length) : 0,
    week: apps.filter(a => at(a) && Date.now() - new Date(at(a)).getTime() < 7 * 864e5).reduce((t, a) => t + num(a.loanAmount), 0)
  };
  // invite champions: active friends per inviter, and when each target was reached
  const byRef = {};
  users.forEach(u => { if (u.referredBy && u.status === 'active') (byRef[u.referredBy] = byRef[u.referredBy] || []).push(u.createdAt || ''); });
  const refs = Object.entries(byRef).map(([phone, joined]) => ({ phone, count: joined.length, joined: joined.sort() }));
  refs.sort((a, b) => b.count - a.count || String(a.joined[a.joined.length - 1]).localeCompare(String(b.joined[b.joined.length - 1])));
  const events = [];
  users.forEach(u => { if (u.promoClaimed && u.promoClaimedAt) events.push({ id: 'h_' + u.phone, kind: 'hot', phone: u.phone, at: u.promoClaimedAt, prize: u.promo || 'Hot offer' }); });
  tSnap.docs.forEach(d => { const t = d.data(); if (t.removed !== true && Number(t.appliedBalance) > 0) events.push({ id: 'b_' + d.id, kind: 'balance', phone: t.uid, at: t.verifiedAt || t.submittedAt || '', prize: `Saved ৳${Math.round(Number(t.appliedBalance))} on the fee` }); });
  const cfg = mainSnap.exists ? mainSnap.data() : {};
  const bonus = cfg.newUserBonus === undefined || cfg.newUserBonus === null || cfg.newUserBonus === '' ? 100 : Number(cfg.newUserBonus) || 0;
  if (bonus > 0) users.forEach(u => { if (u.createdAt && u.createdBy !== 'admin') events.push({ id: 'j_' + u.phone, kind: 'bonus', phone: u.phone, at: u.createdAt, prize: `৳${bonus} sign-up bonus` }); });
  events.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const known = new Set(users.map(u => u.phone));
  const vset = new Set(users.filter(u => u.phoneVerified === true).map(u => u.phone));
  const data = { stats, refs, events, names, known, vset };
  _showcaseCache = { at: Date.now(), data };
  return data;
}
const shortName = (n, phone) => n ? maskName(String(n).split(' ')[0]) : maskPhone(phone);

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

// ── wrong-password limit ──
// 5 wrong passwords → locked 5 min; each next 5 → 30 min, 1 h, 6 h, 12 h; after that the account is suspended
// until an admin unlocks it. While locked, the Firebase login itself is disabled too, so the lock cannot be skipped.
const LOCK_STEPS_MIN = [5, 30, 60, 360, 720];
const TRIES = 5;
const WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || 'AIzaSyA6FTCSfXhNxPkpq2WCnz_EiaJFJWYYc8Q';
const guardRef = phone => db().collection('loginGuard').doc(phone);
const waitText = ms => { const m = Math.ceil(ms / 60000); return m >= 60 ? `${Math.round(m / 60 * 10) / 10} hour${m >= 120 ? 's' : ''}` : `${m} minute${m === 1 ? '' : 's'}`; };
const SUSPEND_MSG = 'Your account was suspended after too many wrong password attempts. Please contact our support team (admin) to unlock it.';

// checks the password with Firebase Auth without signing in here: 'ok' | 'wrong' | 'disabled' | 'busy'
async function checkPassword(phone, pw) {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: phoneEmail(phone), password: pw, returnSecureToken: false })
  });
  if (r.ok) return 'ok';
  const j = await r.json().catch(() => ({}));
  const code = String((j.error && j.error.message) || '');
  if (/USER_DISABLED/.test(code)) return 'disabled';
  if (/TOO_MANY_ATTEMPTS/.test(code)) return 'busy';
  if (/INVALID_PASSWORD|INVALID_LOGIN_CREDENTIALS|EMAIL_NOT_FOUND/.test(code)) return 'wrong';
  throw new Error('password check failed: ' + code);
}

async function lockLogin(phone, disabled) {
  try { await auth().updateUser(phone, { disabled }); } catch (e) { /* no login yet (old account) */ }
}

// one more wrong password: returns the reply for the app
async function wrongPassword(phone, g, prof) {
  const fails = (Number(g.fails) || 0) + 1, level = Number(g.level) || 0, now = Date.now();
  if (fails < TRIES) {
    await guardRef(phone).set({ fails, level, lastFailAt: new Date(now).toISOString() }, { merge: true });
    const left = TRIES - fails;
    return [401, { error: `The password you entered is incorrect. ${left} attempt${left === 1 ? '' : 's'} left before your account is locked.`, code: 'wrong_password', left }];
  }
  const next = level + 1;
  if (next > LOCK_STEPS_MIN.length) {
    await guardRef(phone).set({ fails: 0, level: next, until: '', suspended: true, suspendedAt: new Date(now).toISOString() }, { merge: true });
    await lockLogin(phone, true);
    if (prof) await prof.ref.update({ status: 'banned', statusReason: 'Too many wrong password attempts', 'vip.active': false, statusLog: admin.firestore.FieldValue.arrayUnion({ status: 'banned', reason: 'Too many wrong password attempts (automatic)', action: 'Login locked', at: new Date(now).toISOString() }) });
    return [403, { error: SUSPEND_MSG, code: 'suspended' }];
  }
  const ms = LOCK_STEPS_MIN[next - 1] * 60000;
  await guardRef(phone).set({ fails: 0, level: next, until: new Date(now + ms).toISOString(), lastFailAt: new Date(now).toISOString(), suspended: false }, { merge: true });
  await lockLogin(phone, true);
  return [429, { error: `Too many wrong passwords. Your account is locked for ${waitText(ms)}. Please try again later.`, code: 'locked', until: new Date(now + ms).toISOString() }];
}

const actions = {
  // sign in through the server so wrong passwords are counted; returns a one-time sign-in token
  async login(b) {
    const phone = String(b.phone || ''), pw = String(b.password || '');
    if (!isPhone(phone) || !pw) return [400, { error: 'Please enter your phone number and password.' }];
    const prof = await findUserDoc(phone);
    const gs = await guardRef(phone).get();
    const g = gs.exists ? (gs.data() || {}) : {};
    if (g.suspended) return [403, { error: SUSPEND_MSG, code: 'suspended' }];
    if (g.until && new Date(g.until).getTime() > Date.now())
      return [429, { error: `Too many wrong passwords. Please try again in ${waitText(new Date(g.until).getTime() - Date.now())}.`, code: 'locked', until: g.until }];
    if (g.until) { await lockLogin(phone, false); await guardRef(phone).set({ until: '' }, { merge: true }); }   // the lock time is over
    const data = prof ? (prof.data() || {}) : null;
    if (data && data.status === 'banned') return [403, { error: 'Your account has been suspended by admin.', code: 'banned' }];
    if (data && data.removed === true) return [403, { error: 'This account is no longer available. Please contact support if you think this is a mistake.', code: 'removed' }];
    const login = await authUser(phone);
    if (login) {
      const res = await checkPassword(phone, pw);
      if (res === 'busy') return [429, { error: 'Too many attempts. Please wait a few minutes and try again.', code: 'busy' }];
      if (res === 'disabled') return [403, { error: 'Your login is switched off. Please contact support.', code: 'disabled' }];
      if (res === 'wrong') return wrongPassword(phone, g, prof);
    } else {
      // an account from before the secure login: the old password is checked once and moved to Firebase Auth
      if (!prof) return [404, { error: 'No account with this number.', code: 'not_found' }];
      if (typeof data.password !== 'string' || !sameText(data.password, pw)) return wrongPassword(phone, g, prof);
      if (pw.length < 6) return [400, { error: 'Your password is too short for the new secure login. Please contact support to set a new password.', code: 'short' }];
      await createLogin(phone, pw);
      await prof.ref.update({ password: admin.firestore.FieldValue.delete(), authMigratedAt: new Date().toISOString() });
    }
    if (gs.exists) await guardRef(phone).delete();
    // fraud check: which devices this account signs in from (Risk Center groups accounts that share a device)
    const dev = devId(b.deviceId); if (dev && prof) prof.ref.update({ devices: admin.firestore.FieldValue.arrayUnion(dev), lastDeviceId: dev }).catch(() => {});
    return [200, { ok: true, token: await auth().createCustomToken(phone) }];
  },

  // admin: remove the wrong-password lock (and the automatic suspension) so the user can sign in again
  async adminUnlockLogin(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    if (!(await adminCan(me, ['users']))) return noRole;
    const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
    if (!isPhone(phone)) return [400, { error: 'Invalid phone number.' }];
    const gs = await guardRef(phone).get();
    await guardRef(phone).delete();
    await lockLogin(phone, false);
    const prof = await findUserDoc(phone);
    if (prof && b.activate !== false && prof.data().statusReason === 'Too many wrong password attempts')
      await prof.ref.update({ status: 'active', statusReason: admin.firestore.FieldValue.delete(), statusLog: admin.firestore.FieldValue.arrayUnion({ status: 'active', reason: 'Login unlocked by admin', action: 'Login unlocked', at: new Date().toISOString() }) });
    return [200, { ok: true, wasLocked: gs.exists }];
  },

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
    const refDoc = isPhone(ref) && ref !== phone ? await findUserDoc(ref) : null;
    if (refDoc) u.referredBy = ref;
    const dev = devId(b.deviceId);
    if (dev) { u.devices = [dev]; u.lastDeviceId = dev; }
    // a friend invited from the same phone as the person who invited them: kept, but flagged for the Risk Center
    if (refDoc && dev && ((refDoc.data() || {}).devices || []).includes(dev)) u.riskSelfRef = true;

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
    await notes.add({ uid: phone, title: 'Welcome to Creditfy! 🎉', message: 'Your account is created successfully.', type: 'welcome', createdAt: new Date(Date.now() - 2000).toISOString() });
    if (bonus > 0) await notes.add({ uid: phone, title: 'Sign-up Bonus Received! 🎁', message: `You have received ৳${bonus} sign-up bonus.`, type: 'bonus', createdAt: now });
    if (bonus > 0) await store.collection('walletLog').add({ uid: phone, amount: bonus, type: 'bonus', note: 'Sign-up bonus', balanceAfter: bonus, at: now });
    if (u.referredBy) await notifyReferrer(u.referredBy);
    return [200, { ok: true, bonus }];
  },

  // older app versions call this; it now goes through the same wrong-password limit as login
  async migrate(b) {
    return actions.login(b);
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
        if (a.removed === true) return;   // removed from the site by an admin (kept for review)
        items.push({ id: 'a_' + x.id, kind: 'loan', name: maskName(a.name), amount: Number(String(a.loanAmount || 0).replace(/,/g, '')) || 0, at: at(a) });
      });
    }
    if (cfg.fees !== false) {
      const snap = await db().collection('transactions').where('status', '==', 'Verified').limit(300).get();
      snap.docs.forEach(x => {
        const t = x.data();
        if (t.removed === true) return;
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

  async showcase(b, me) {
    const home = await homeCfg();
    const S = home.stats || {}, W = home.winners || {};
    const admin = !!(b && b.admin && me && await isAdmin(me.uid));
    const d = await showcaseData();
    const targets = refTargetsFrom(home);
    // manual mode (default): a target winner is shown only after the admin picks them (Home Page → Winners)
    const manual = (W.mode || 'manual') !== 'auto';
    // prizes, winner lists and offer winners are for Verified members only (Services & Rewards setting)
    const reqV = ((await SVC.cfg()).bonus || {}).requireVerified !== false;
    const okV = phone => !reqV || d.vset.has(phone);
    const picked = (W.picked && typeof W.picked === 'object') ? W.picked : {};
    const isPicked = (t, phone) => (Array.isArray(picked[String(t.need)]) ? picked[String(t.need)] : []).includes(phone);
    const won = (t, r) => r.count >= t.need && (!manual || isPicked(t, r.phone)) && okV(r.phone);
    // target events depend on the admin's targets; announced winners must be real, registered users
    const events = [...d.events];
    d.refs.forEach(r => targets.forEach((t, i) => { if (won(t, r)) events.push({ id: `t${i + 1}_` + r.phone, kind: 'target', target: i + 1, phone: r.phone, at: r.joined[t.need - 1] || '', prize: t.prize }); }));
    (Array.isArray(W.announced) ? W.announced : []).forEach(a => {
      const ph = String(a.phone || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
      if (a.on !== false && d.known.has(ph) && okV(ph) && a.prize) events.push({ id: 'a_' + (a.id || ph), kind: 'announce', phone: ph, at: a.at || '', prize: String(a.prize).slice(0, 120), offer: String(a.offer || 'Special offer').slice(0, 60) });
    });
    events.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    const hidden = new Set(Array.isArray(W.hidden) ? W.hidden : []);
    const person = (phone, extra) => ({ id: 'u_' + phone, name: shortName(d.names[phone], phone), ...(admin ? { phone, hidden: hidden.has('u_' + phone) } : {}), ...extra });
    const keep = x => admin || !hidden.has(x.id);
    const out = { mode: manual ? 'manual' : 'auto', requireVerified: reqV };
    if (S.on !== false || admin) out.stats = { ...d.stats };
    if (W.on !== false || admin) {
      const top = Math.min(10, Math.max(1, Number(W.leaderCount) || 3));
      out.leaders = d.refs.filter(r => keep({ id: 'u_' + r.phone }) && okV(r.phone)).slice(0, top).map((r, i) => person(r.phone, { rank: i + 1, count: r.count }));
      const perTarget = Math.min(20, Math.max(1, Number(W.targetCount) || 5));
      out.targets = targets.map((t, i) => {
        const all = d.refs.filter(r => won(t, r) && keep({ id: 'u_' + r.phone }));
        const out1 = { level: i + 1, need: t.need, prize: t.prize, total: all.length, winners: all.slice(0, perTarget).map(r => person(r.phone, { count: r.count })) };
        // the admin also sees everyone who reached the target, to choose the winners from
        if (admin) out1.eligible = d.refs.filter(r => r.count >= t.need).map(r => ({ phone: r.phone, name: String(d.names[r.phone] || ''), count: r.count, at: r.joined[t.need - 1] || '', picked: isPicked(t, r.phone), verified: d.vset.has(r.phone) }));
        return out1;
      });
      const kinds = { hot: true, target: true, balance: true, bonus: false, announce: true, ...(W.kinds || {}) };
      const feedN = Math.min(40, Math.max(1, Number(W.feedCount) || 10));
      out.feed = events.filter(e => kinds[e.kind] && keep(e) && keep({ id: 'u_' + e.phone }) && (!['hot', 'target', 'announce'].includes(e.kind) || okV(e.phone))).slice(0, admin ? 40 : feedN)
        .map(e => ({ id: e.id, kind: e.kind, target: e.target || 0, prize: e.prize, offer: e.offer || '', at: e.at, name: shortName(d.names[e.phone], e.phone), ...(admin ? { hidden: hidden.has(e.id) } : {}) }));
    }
    let R = {};
    try { const sd = await db().collection('siteConfig').doc('seo').get(); R = (sd.exists && sd.data().reviews) || {}; } catch (e) {}
    out.reviewCfg = { on: R.on !== false, title: R.title || 'What our users say', ask: R.ask !== false, askText: R.askText || '' };
    if (R.on !== false || admin) {
      const rs = await db().collection('reviews').where('status', '==', 'approved').get();
      const list = rs.docs.map(x => ({ id: x.id, ...x.data() })).filter(r => r.removed !== true && Number(r.rating) >= (Number(R.minStars) || 1))
        .sort((a, b) => (b.featured === true) - (a.featured === true) || String(b.createdAt).localeCompare(String(a.createdAt)));
      const all = rs.docs.map(x => x.data()).filter(r => r.removed !== true);
      out.reviews = { count: all.length, avg: all.length ? Math.round(all.reduce((t, r) => t + Number(r.rating || 0), 0) / all.length * 10) / 10 : 0,
        items: list.slice(0, Math.min(30, Math.max(1, Number(R.max) || 10))).map(r => ({ id: r.id, name: r.name || 'User', rating: Number(r.rating) || 5, text: r.text || '', at: r.createdAt || '', featured: r.featured === true })) };
    }
    return [200, out];
  },

  // a user who received a loan may leave one review; it shows on the site only after an admin approves it
  async myReview(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const [apps, mine] = await Promise.all([
      db().collection('applications').where('uid', '==', me.uid).get(),
      db().collection('reviews').where('uid', '==', me.uid).limit(1).get()
    ]);
    const had = apps.docs.some(d => ['Approved', 'Disbursed', 'Active', 'Repaid', 'Overdue'].includes(d.data().status) && d.data().removed !== true);
    const r = mine.empty ? null : { id: mine.docs[0].id, ...mine.docs[0].data() };
    return [200, { canReview: had && !r, review: r ? { rating: r.rating, text: r.text, status: r.status } : null }];
  },

  async submitReview(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const rating = Math.round(Number(b.rating));
    const text = String(b.text || '').replace(/\s+/g, ' ').trim().slice(0, 400);
    if (!(rating >= 1 && rating <= 5)) return [400, { error: 'Please choose 1 to 5 stars.' }];
    if (text.length < 10) return [400, { error: 'Please write a few words (at least 10 letters).' }];
    const [st, info] = await actions.myReview(b, me);
    if (st !== 200 || !info.canReview) return [403, { error: info.review ? 'You already left a review. Thank you!' : 'You can leave a review after you receive a loan.' }];
    const d = await findUserDoc(me.uid);
    const apps = await db().collection('applications').where('uid', '==', me.uid).get();
    const nm = (d && d.data().name) || (apps.docs.map(x => x.data().name).find(Boolean)) || '';
    await db().collection('reviews').add({ uid: me.uid, name: shortName(nm, me.uid), rating, text, status: 'pending', createdAt: new Date().toISOString() });
    return [200, { ok: true }];
  },

  async pushSubscribe(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const token = String(b.token || '');
    if (token.length < 20 || token.length > 4096) return [400, { error: 'Invalid device.' }];
    const ref = db().collection('pushTokens').doc(tokenId(token));
    const cur = await ref.get();
    await ref.set({ uid: me.uid, token, device: String(b.device || '').slice(0, 60), lastSeen: new Date().toISOString(), ...(cur.exists ? {} : { createdAt: new Date().toISOString() }) }, { merge: true });
    return [200, { ok: true }];
  },

  // no login needed: the device token itself identifies the subscription (used on logout)
  async pushUnsubscribe(b) {
    const token = String(b.token || '');
    if (token.length < 20) return [400, { error: 'Invalid device.' }];
    await db().collection('pushTokens').doc(tokenId(token)).delete().catch(() => {});
    return [200, { ok: true }];
  },

  async adminPush(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    if (!(await adminCan(me, b.auto ? ['applications', 'transactions', 'users', 'support', 'broadcast', 'risk', 'portfolio'] : ['broadcast']))) return noRole;
    const title = String(b.title || '').trim(), body = String(b.body || '').trim();
    if (!title) return [400, { error: 'A title is needed.' }];
    const cfg = await pushCfg();
    if (b.auto) {   // automatic copies of in-app notifications follow the App Settings switches
      if (cfg.on === false || cfg.auto[category(b.type)] === false) return [200, { skipped: true }];
    }
    const link = /^https:\/\//i.test(b.link || '') || String(b.link || '').startsWith('/') ? String(b.link) : '/';
    if (b.audience === 'all') return [200, await sendPush({ all: true }, { title, body, link, tag: 'cu-broadcast', image: b.image })];
    const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
    if (!isPhone(phone)) return [400, { error: 'Invalid phone number.' }];
    return [200, await sendPush({ uids: [phone] }, { title, body, link, tag: 'cu-' + (b.type || 'info'), image: b.image })];
  },

  async adminPushStats(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    const s = await db().collection('pushTokens').get();
    return [200, { devices: s.size, users: new Set(s.docs.map(d => d.data().uid)).size }];
  },

  async runOverdue(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    if (!(await adminCan(me, ['applications', 'portfolio', 'appset']))) return noRole;
    return [200, await runOverdue({ force: true, by: 'admin' })];
  },

  // team: only a super admin (or an older owner account without a role) may add, change or remove admins
  async adminTeam(b, me) {
    const meInfo = me && await adminInfo(me.uid);
    if (!meInfo) return [403, { error: 'Admin login required.' }];
    const op = String(b.op || 'list');
    if (op !== 'list' && !meInfo.canTeam) return [403, { error: 'Only a Super Admin can manage the team.' }];
    const col = db().collection('admins');
    if (op === 'list') {
      const s = await col.get();
      const list = await Promise.all(s.docs.map(async d => {
        const x = d.data() || {}; let u = null; try { u = await auth().getUser(d.id); } catch (e) {}
        return { uid: d.id, name: x.name || '', email: (u && u.email) || x.email || '', role: x.role || '', disabled: !!(u && u.disabled), lastSignIn: (u && u.metadata.lastSignInTime) || '', createdAt: x.createdAt || '', me: d.id === me.uid };
      }));
      return [200, { list, canTeam: meInfo.canTeam }];
    }
    if (op === 'create') {
      const email = cleanEmail(b.email), pw = String(b.password || ''), role = String(b.role || 'admin').slice(0, 30), name = String(b.name || '').trim().slice(0, 60);
      if (!okEmail(email)) return [400, { error: 'Enter a valid e-mail address.' }];
      if (pw.length < 8) return [400, { error: 'Password must be at least 8 characters.' }];
      let u;
      try { u = await auth().getUserByEmail(email); } catch (e) { u = null; }
      if (u && (await col.doc(u.uid).get()).exists) return [409, { error: 'This e-mail is already an admin.' }];
      if (u) await auth().updateUser(u.uid, { password: pw, displayName: name || undefined, disabled: false });
      else u = await auth().createUser({ email, password: pw, displayName: name || undefined, emailVerified: true });
      await col.doc(u.uid).set({ role, name, email, createdAt: new Date().toISOString(), createdBy: me.uid });
      return [200, { ok: true, uid: u.uid }];
    }
    const uid = String(b.uid || '');
    const target = uid && await col.doc(uid).get();
    if (!target || !target.exists) return [404, { error: 'Admin not found.' }];
    const supers = (await col.get()).docs.filter(d => { const r = String(d.data().role || '').toLowerCase(); return r === 'superadmin' || !r; });
    const isLastSuper = supers.length === 1 && supers[0].id === uid;
    if (op === 'update') {
      const upd = {};
      if (b.role !== undefined) { if (isLastSuper && String(b.role).toLowerCase() !== 'superadmin') return [400, { error: 'Keep at least one Super Admin.' }]; upd.role = String(b.role).slice(0, 30); }
      if (b.name !== undefined) upd.name = String(b.name).trim().slice(0, 60);
      if (b.disabled !== undefined) { if (uid === me.uid) return [400, { error: 'You cannot block your own account.' }]; await auth().updateUser(uid, { disabled: !!b.disabled }); upd.disabled = !!b.disabled; }
      upd.updatedAt = new Date().toISOString(); upd.updatedBy = me.uid;
      await target.ref.update(upd);
      return [200, { ok: true }];
    }
    if (op === 'password') {
      const pw = String(b.password || '');
      if (pw.length < 8) return [400, { error: 'Password must be at least 8 characters.' }];
      await auth().updateUser(uid, { password: pw });
      return [200, { ok: true }];
    }
    if (op === 'remove') {
      if (uid === me.uid) return [400, { error: 'You cannot remove yourself.' }];
      if (isLastSuper) return [400, { error: 'Keep at least one Super Admin.' }];
      await target.ref.delete();
      try { await auth().updateUser(uid, { disabled: true }); } catch (e) {}
      return [200, { ok: true }];
    }
    return [400, { error: 'Unknown action.' }];
  },

  async offerCount() {
    const f = await fomoCfg();
    return [200, { count: await fomoClaims(f.round), limit: f.limit, open: f.on && !f.ended }];
  },

  async claimOffer(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const d = await findUserDoc(me.uid);
    if (!d) return [404, { error: 'Account not found.' }];
    const f = await fomoCfg();
    if (!f.on || f.ended) return [200, { result: 'closed' }];
    const u = d.data();
    if (((await SVC.cfg()).bonus || {}).requireVerified !== false && u.phoneVerified !== true) return [200, { result: 'verify' }];
    const mine = f.round === 1 ? u.promoClaimed === true : Number(u.promoRound) === f.round;
    if (mine) return [200, { result: 'already' }];
    if ((await fomoClaims(f.round)) >= f.limit) return [200, { result: 'full' }];
    await d.ref.update({ promoClaimed: true, promoRound: f.round, promoClaimedAt: new Date().toISOString(), promo: f.promo });
    return [200, { result: 'ok', promo: f.promo }];
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
    if (op !== 'status' && !(await adminCan(me, ['users']))) return noRole;
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
    if (!(await adminCan(me, ['users']))) return noRole;
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

  // admin: make an account by hand (when a user could not register). With fixLogin, an existing profile
  // that has no working login gets one with this password instead.
  async adminCreateUser(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    if (!(await adminCan(me, ['users']))) return noRole;
    const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
    const pw = String(b.password || '');
    if (!isPhone(phone)) return [400, { error: 'Enter a valid 10-digit BD mobile number (e.g. 1711000000).' }];
    if (pw.length < 6 || pw.length > 128) return [400, { error: 'Password must be at least 6 characters.' }];
    const store = db();
    const existing = await findUserDoc(phone);
    const login = await authUser(phone);
    if (existing && login) return [409, { error: 'This number already has an account and a login. Use "Reset password" on the user instead.', code: 'exists' }];
    if (existing) {
      if (!b.fixLogin) return [409, { error: 'A profile with this number exists but it has no login. Tick "Repair login" to give it this password.', code: 'no_login' }];
      await createLogin(phone, pw);
      await existing.ref.update({ password: admin.firestore.FieldValue.delete(), loginRepairedAt: new Date().toISOString(), loginRepairedBy: me.uid });
      return [200, { ok: true, phone, repaired: true }];
    }
    const now = new Date().toISOString();
    const balance = Math.max(0, Math.round(Number(b.balance) || 0));
    const status = ['active', 'inactive', 'suspended'].includes(b.status) ? b.status : 'active';
    const u = { phone, createdAt: now, appStatus: 0, balance, status, createdBy: 'admin', createdByAdmin: me.uid };
    const name = String(b.name || '').trim().slice(0, 60);
    if (name) u.name = name;
    const note = String(b.note || '').trim().slice(0, 300);
    if (note) u.adminNote = note;
    const ref = String(b.referrer || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
    if (isPhone(ref) && ref !== phone && await findUserDoc(ref)) u.referredBy = ref;
    if (login) await auth().updateUser(phone, { password: pw, email: phoneEmail(phone), emailVerified: true });   // a stray login without a profile: reuse it
    else await createLogin(phone, pw);
    try { await store.collection('users').doc(phone).set(u); }
    catch (e) { if (!login) await auth().deleteUser(phone).catch(() => {}); throw e; }
    await notifyUser(phone, 'Welcome to Creditfy! 🎉', 'Your account was created by our support team. You can now log in with your phone number and password.', 'welcome');
    if (balance > 0) await notifyUser(phone, 'Balance Added 🎁', `৳${balance} has been added to your Creditfy balance.`, 'bonus');
    if (u.referredBy) await notifyReferrer(u.referredBy);
    return [200, { ok: true, phone }];
  },

  // admin: does this number have a profile and a working login?
  async adminLoginStatus(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(?:880|0)+/, '');
    if (!isPhone(phone)) return [400, { error: 'Invalid phone number.' }];
    const d = await findUserDoc(phone), u = await authUser(phone);
    const gs = await guardRef(phone).get(), g = gs.exists ? (gs.data() || {}) : null;
    const lock = g ? { fails: Number(g.fails) || 0, level: Number(g.level) || 0, until: g.until && new Date(g.until).getTime() > Date.now() ? g.until : '', suspended: !!g.suspended, lastFailAt: g.lastFailAt || '' } : null;
    return [200, { phone, profile: !!d, login: !!u, disabled: !!(u && u.disabled), lastSignIn: u?.metadata?.lastSignInTime || '', status: d ? (d.data().status || 'active') : '', lock }];
  },

  // signed-in user: "I am here" (throttled in the app to once every few minutes)
  async ping(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const d = await findUserDoc(me.uid);
    if (!d) return [404, { error: 'Account not found.' }];
    const ua = String(b.device || '').slice(0, 80);
    const upd = { lastSeenAt: new Date().toISOString() };
    if (ua) upd.lastDevice = ua;
    await d.ref.update(upd);
    return [200, { ok: true }];
  },

  // removes the login of a user the admin deleted, so the number can register again
  async adminDeleteLogin(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    if (!(await adminCan(me, ['users']))) return noRole;
    const phone = String(b.phone || '');
    if (!isPhone(phone)) return [400, { error: 'Invalid phone number.' }];
    if (await authUser(phone)) await auth().deleteUser(phone);
    return [200, { ok: true }];
  }
};

// ── online payment connection test (admin): a real ৳10 payment that touches no application ──
Object.assign(actions, {
  async adminPayTest(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    if (!(await adminCan(me, ['wallets', 'config']))) return noRole;
    const P = require('./_lib/pay');
    if (P.provider() !== 'tzpayway') return [400, { error: 'The connection test is for TZPayWay. Add TZPAY_API_KEY in Vercel first.' }];
    if (P.missingEnv().length) return [503, { error: 'Missing on Vercel: ' + P.missingEnv().join(', ') }];
    const amount = 10, tranId = 'TEST' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString('hex').toUpperCase();
    const base = String(process.env.PUBLIC_BASE_URL || 'https://www.creditfy.online').replace(/\/+$/, '');
    const q = `gw=tz&tran=${tranId}`;
    const ref = db().collection('gatewayPayments').doc(tranId);
    await ref.set({ tranId, test: true, amount, uid: me.uid, status: 'Initiated', provider: 'tzpayway', createdAt: new Date().toISOString() });
    const r = await P.tzCreate({ amount, currency: 'BDT', country: 'BD', fee_paid_by_user: false, cus_name: 'Creditfy test',
      webhook_url: `${base}/api/pay/ipn?${q}`, success_url: `${base}/api/pay/return?r=success&${q}`, cancel_url: `${base}/api/pay/return?r=cancel&${q}`, user_data: { tranId, test: true } });
    if (!r.ok || !r.data.payment_url || !r.data.trx_id) {
      const why = String((r.raw && (r.raw.error || r.raw.message)) || ('HTTP ' + r.status)).slice(0, 200);
      await ref.set({ status: 'InitFailed', error: why }, { merge: true });
      return [502, { error: 'TZPayWay refused to create the payment: ' + why, tranId }];
    }
    await ref.set({ gwTrxId: String(r.data.trx_id) }, { merge: true });
    return [200, { ok: true, tranId, url: r.data.payment_url, gwTrxId: r.data.trx_id }];
  },
  async adminPayTestStatus(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    const tranId = String(b.tranId || '');
    if (!/^TEST[A-Z0-9]{6,40}$/.test(tranId)) return [400, { error: 'Unknown test.' }];
    const P = require('./_lib/pay');
    const s = await db().collection('gatewayPayments').doc(tranId).get();
    if (!s.exists) return [404, { error: 'Test not found.' }];
    let d = s.data();
    // ask TZPayWay now (the webhook may not have come yet)
    if (d.status !== 'Paid' && d.gwTrxId && b.check !== false) { try { await P.finalizePaid(tranId, ''); d = (await s.ref.get()).data(); } catch (e) {} }
    return [200, { status: d.status, created: d.createdAt, gwTrxId: d.gwTrxId || '', webhookAt: d.webhookAt || '', paidAt: d.paidAt || '', method: d.method || '', lastCheck: d.lastCheck || null, error: d.error || '' }];
  }
});

// Quick Services (codes, vouchers, wallet history, check-in, spin, VIP, verified badge) — see api/_lib/services.js
const SVC = require('./_lib/services')({ db, admin, findUserDoc, isAdmin, adminCan, notifyUser, isPhone });
Object.assign(actions, SVC.actions);
const XTR = require('./_lib/extra')({ db, findUserDoc, isAdmin, adminCan, notifyUser, isPhone, SVC });
Object.assign(actions, XTR.actions);
Object.assign(actions, require('./_lib/tg').actions({ db, isAdmin, adminCan, findUserDoc }));

// admin alerts on Telegram: link this admin's Telegram, list / unlink, and the alert for a fee payment saved by the app
Object.assign(actions, {
  async adminTgLink(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    const TG = require('./_lib/tg'); const S = await TG.settings(db);
    if (!TG.configured() || !S.botUsername) return [400, { error: 'Set up the Telegram bot first (Connection tab).' }];
    const code = crypto.randomBytes(9).toString('base64url');
    await db().collection('tgLinks').doc(code).set({ adminUid: me.uid, exp: Date.now() + 15 * 60e3 });
    return [200, { url: `https://t.me/${S.botUsername}?start=A${code}` }];
  },
  async adminTgAdmins(b, me) {
    if (!me || !(await isAdmin(me.uid))) return [403, { error: 'Admin login required.' }];
    if (b.op === 'unlink') {
      const ref = db().collection('tgAdmins').doc(String(b.chat || '')); const x = await ref.get();
      if (!x.exists) return [404, { error: 'Not found.' }];
      if (x.data().uid !== me.uid && !(await adminCan(me, ['appset']))) return noRole;   // your own link, or with App Settings rights
      await ref.delete(); return [200, { ok: true }];
    }
    if (b.op === 'summary') { const day = new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 10); return [200, { ok: true, ...(await require('./_lib/alerts').sendSummary(db, day)) }]; }
    const s = await db().collection('tgAdmins').get();
    return [200, { list: s.docs.map(d => ({ chat: d.id, name: d.data().name || '', username: d.data().username || '', mine: d.data().uid === me.uid, at: d.data().at })) }];
  },
  // the app saved a fee payment (transactions/trx_<TrxID>): tell the admins once
  async alertTrx(b, me) {
    if (!me) return [401, { error: 'Please login again.' }];
    const id = 'trx_' + String(b.trxId || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 60);
    if (id.length < 10) return [200, { ok: false }];
    const ref = db().collection('transactions').doc(id); let t = null;
    await db().runTransaction(async x => { const s = await x.get(ref); if (!s.exists) return; const d = s.data(); if (String(d.uid) !== String(me.uid) || d.alerted) return; x.update(ref, { alerted: true }); t = d; });
    if (t) await require('./_lib/alerts').notify(db, 'trx', id, t);
    return [200, { ok: true }];
  }
});
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
module.exports.actions = actions;
