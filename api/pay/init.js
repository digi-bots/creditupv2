// Starts an SSLCommerz payment for one application's fee.
// The amount is always computed here from Firestore, never taken from the browser.
const { missingEnv, sslHost, db, computeFee, baseUrl, readBody } = require('../_lib/pay');
const { caller } = require('../_lib/auth');

const BALANCE_MAX_ADJUST = 100;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (missingEnv().length) return res.status(503).json({ error: 'Online payment is not set up yet. Please use a manual method.' });
  const body = readBody(req);
  const appId = String(body.appId || '').trim();
  const uid = String(body.uid || '').trim();
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(appId) || !/^[0-9]{10,13}$/.test(uid)) return res.status(400).json({ error: 'Invalid request.' });

  try {
    // only the signed-in owner of the application can start its payment
    const me = await caller(req);
    if (!me || me.uid !== uid) return res.status(401).json({ error: 'Please login again.' });
    const store = db();
    const [appSnap, cfgSnap] = await Promise.all([
      store.collection('applications').doc(appId).get(),
      store.collection('siteConfig').doc('main').get()
    ]);
    if (!appSnap.exists) return res.status(404).json({ error: 'Application not found.' });
    const app = appSnap.data();
    const cfg = cfgSnap.exists ? cfgSnap.data() : {};
    if (cfg.gateway?.enabled !== true) return res.status(403).json({ error: 'Online payment is switched off right now.' });
    if (String(app.uid) !== uid) return res.status(403).json({ error: 'This application belongs to another account.' });
    if (app.status !== 'Pending Fee Payment') return res.status(409).json({ error: 'The fee for this application is already submitted or paid.' });

    const fee = computeFee(app, cfg);
    let applied = 0;
    if (body.useBalance === true) {
      const us = await store.collection('users').where('phone', '==', uid).limit(1).get();
      const u = us.empty ? null : us.docs[0].data();
      if (u && u.balanceAdjustUsed !== true) applied = Math.max(0, Math.min(BALANCE_MAX_ADJUST, Number(u.balance) || 0, fee.total));
    }
    const amount = fee.total - applied;
    if (amount < 10) return res.status(400).json({ error: 'The amount is too small for online payment. Please use a manual method.' });

    const tranId = 'CU' + appId.slice(-6).toUpperCase() + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const now = new Date().toISOString();
    await store.collection('gatewayPayments').doc(tranId).set({
      tranId, appId, uid, amount, totalFee: fee.total, appliedBalance: applied,
      loanAmount: fee.loanAmount, term: fee.term, wallet: app.wallet || '',
      status: 'Initiated', createdAt: now, provider: 'sslcommerz'
    });

    const base = baseUrl(req);
    const ret = (r) => `${base}/api/pay/return?r=${r}`;
    const form = new URLSearchParams({
      store_id: process.env.SSLCZ_STORE_ID,
      store_passwd: process.env.SSLCZ_STORE_PASSWD,
      total_amount: amount.toFixed(2),
      currency: 'BDT',
      tran_id: tranId,
      success_url: ret('success'),
      fail_url: ret('fail'),
      cancel_url: ret('cancel'),
      ipn_url: `${base}/api/pay/ipn`,
      cus_name: String(app.name || 'Customer').slice(0, 50),
      cus_email: String(app.email || 'customer@creditup.online').slice(0, 50),
      cus_add1: String(app.address || 'Bangladesh').slice(0, 50),
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '0' + uid.replace(/^0+/, '').slice(-10),
      shipping_method: 'NO',
      num_of_item: '1',
      product_name: `Loan fee CU-${appId.slice(-6).toUpperCase()}`,
      product_category: 'Service fee',
      product_profile: 'non-physical-goods',
      value_a: appId
    });
    const r = await fetch(sslHost() + '/gwprocess/v4/api.php', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString()
    });
    const j = await r.json().catch(() => ({}));
    if (j.status !== 'SUCCESS' || !j.GatewayPageURL) {
      await store.collection('gatewayPayments').doc(tranId).set({ status: 'InitFailed', error: String(j.failedreason || r.status) }, { merge: true });
      return res.status(502).json({ error: 'The payment provider did not respond. Please try again or use a manual method.' });
    }
    return res.status(200).json({ url: j.GatewayPageURL, tranId, amount });
  } catch (e) {
    console.error('pay/init', e);
    return res.status(500).json({ error: 'Online payment could not be started. Please try a manual method.' });
  }
};
