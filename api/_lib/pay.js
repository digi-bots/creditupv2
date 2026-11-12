// Shared code for the online fee payment (SSLCommerz).
// Secrets live only in Vercel environment variables, never in Firestore or the browser:
//   SSLCZ_STORE_ID, SSLCZ_STORE_PASSWD   – from the SSLCommerz merchant panel
//   SSLCZ_SANDBOX                        – "true" for test mode, "false" for live
//   FIREBASE_SERVICE_ACCOUNT             – service account JSON (plain or base64)
//   PUBLIC_BASE_URL (optional)           – e.g. https://creditup.online
const admin = require('firebase-admin');

const REQUIRED = ['SSLCZ_STORE_ID', 'SSLCZ_STORE_PASSWD', 'FIREBASE_SERVICE_ACCOUNT'];
const missingEnv = () => REQUIRED.filter(k => !process.env[k]);
const isSandbox = () => String(process.env.SSLCZ_SANDBOX ?? 'true').toLowerCase() !== 'false';
const sslHost = () => isSandbox() ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com';

let _db = null;
function db() {
  if (_db) return _db;
  if (!admin.apps.length) {
    let raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
    if (!raw.trim().startsWith('{')) raw = Buffer.from(raw, 'base64').toString('utf8');
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
  }
  _db = admin.firestore();
  return _db;
}

// same formula as the fee page: fixed fees + simple interest for the term
function computeFee(app, cfg) {
  const n = (v, d) => (v === undefined || v === null || v === '' || isNaN(Number(v))) ? d : Number(v);
  const amt = Number(String(app.loanAmount ?? '').replace(/,/g, '')) || 0;
  const months = Number(app.term) || 0;
  const rate = n(cfg.annualInterestRate, 18);
  const interest = Math.round(amt * (rate / 100) * (months / 12));
  const total = n(cfg.orgFee, 200) + n(cfg.serviceCharge, 100) + n(cfg.processingFee, 100) + interest;
  return { loanAmount: amt, term: months, interest, total };
}

function baseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/+$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `https://${host}`;
}

// ask SSLCommerz whether a payment is real; never trust what the browser posts
async function validateWithSslcz(valId) {
  const u = new URL(sslHost() + '/validator/api/validationserverAPI.php');
  u.searchParams.set('val_id', valId);
  u.searchParams.set('store_id', process.env.SSLCZ_STORE_ID);
  u.searchParams.set('store_passwd', process.env.SSLCZ_STORE_PASSWD);
  u.searchParams.set('v', '1');
  u.searchParams.set('format', 'json');
  const r = await fetch(u, { method: 'GET' });
  if (!r.ok) throw new Error('validation http ' + r.status);
  return r.json();
}

// mark a payment as paid exactly once: transaction record, application status, user notice
async function finalizePaid(tranId, valId) {
  const store = db();
  const payRef = store.collection('gatewayPayments').doc(tranId);
  const snap = await payRef.get();
  if (!snap.exists) return { ok: false, reason: 'unknown tran_id' };
  const pay = snap.data();
  if (pay.status === 'Paid') return { ok: true, already: true, pay };

  const v = await validateWithSslcz(valId);
  const valid = (v.status === 'VALID' || v.status === 'VALIDATED')
    && v.tran_id === tranId
    && String(v.currency || v.currency_type || 'BDT').toUpperCase() === 'BDT'
    && Math.abs(Number(v.amount) - Number(pay.amount)) < 0.01;
  if (!valid) {
    await payRef.set({ status: 'Invalid', lastCheck: { status: v.status || '', amount: v.amount || '', at: new Date().toISOString() } }, { merge: true });
    return { ok: false, reason: 'validation failed', pay };
  }

  const now = new Date().toISOString();
  const method = 'Online' + (v.card_type ? ' · ' + v.card_type : '');
  const result = await store.runTransaction(async (t) => {
    const fresh = await t.get(payRef);
    if (fresh.data().status === 'Paid') return { already: true };
    const appRef = store.collection('applications').doc(pay.appId);
    const appSnap = await t.get(appRef);
    let userRef = null;
    if (pay.appliedBalance > 0) {
      const us = await t.get(store.collection('users').where('phone', '==', pay.uid).limit(1));
      if (!us.empty) userRef = us.docs[0].ref;
    }
    t.set(payRef, { status: 'Paid', paidAt: now, valId, bankTranId: v.bank_tran_id || '', cardType: v.card_type || '' }, { merge: true });
    t.set(store.collection('transactions').doc('gw_' + tranId), {
      uid: pay.uid, appId: pay.appId, trxId: v.bank_tran_id || tranId, gatewayTranId: tranId,
      gateway: 'sslcommerz', payMethod: method, payType: 'Online',
      amount: pay.amount, totalFee: pay.totalFee, appliedBalance: pay.appliedBalance || 0,
      loanAmount: pay.loanAmount, term: pay.term, wallet: pay.wallet || '',
      status: 'Verified', submittedAt: pay.createdAt, verifiedAt: now
    });
    const cur = appSnap.exists ? appSnap.data().status : '';
    if (appSnap.exists && (cur === 'Pending Fee Payment' || cur === 'TrxID Submitted')) {
      t.update(appRef, { status: 'Fee Verified', feeVerifiedAt: now, statusUpdatedAt: now, updatedAt: now, feePaidOnline: true });
    }
    if (userRef) t.update(userRef, { balanceAdjustUsed: true, balanceAdjustAt: now });
    t.set(store.collection('user_notifications').doc('gw_' + tranId), {
      uid: pay.uid, type: 'info', createdAt: now,
      title: 'Fee Paid & Verified ✅',
      message: `We received your online fee payment of ৳${Number(pay.amount).toLocaleString('en-US')} for application CU-${String(pay.appId).slice(-6).toUpperCase()}. Our team is now reviewing your application.`
    });
    return { already: false };
  });
  return { ok: true, already: result.already, pay };
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return Object.fromEntries(new URLSearchParams(req.body)); }
  }
  return {};
}

module.exports = { missingEnv, isSandbox, sslHost, db, computeFee, baseUrl, validateWithSslcz, finalizePaid, readBody };
