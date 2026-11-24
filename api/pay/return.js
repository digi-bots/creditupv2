// The browser comes back here from the payment page. The payment is re-checked with the provider
// (the webhook may arrive later), then the user is sent back to the site.
const { missingEnv, db, finalizePaid, readBody } = require('../_lib/pay');

module.exports = async (req, res) => {
  const q = req.query || {};
  const r = String(q.r || '');
  const b = readBody(req);
  const tz = q.gw === 'tz';
  const tranId = String((tz ? q.tran : b.tran_id) || '');
  let appId = String(b.value_a || '');
  let result = r === 'cancel' ? 'cancelled' : 'failed';
  try {
    if (!missingEnv().length && /^[A-Za-z0-9_-]{6,80}$/.test(tranId)) {
      const ref = db().collection('gatewayPayments').doc(tranId);
      const s = await ref.get();
      if (s.exists) appId = s.data().appId || appId;
      if (tz) {
        // success or cancel, always ask TZPayWay: an agent may still be processing the payment
        const out = await finalizePaid(tranId, '');
        if (out.ok) result = 'success';
        else if (out.pending) result = r === 'cancel' ? 'cancelled' : 'pending';
        else if (s.exists && s.data().status !== 'Paid' && r === 'cancel') await ref.set({ status: 'Cancelled', updatedAt: new Date().toISOString() }, { merge: true });
      } else if (r === 'success' && b.val_id) {
        const out = await finalizePaid(tranId, String(b.val_id));
        if (out.ok) result = 'success';
      } else if (s.exists && s.data().status !== 'Paid') {
        await ref.set({ status: r === 'cancel' ? 'Cancelled' : 'Failed', updatedAt: new Date().toISOString() }, { merge: true });
      }
    }
  } catch (e) { console.error('pay/return', e); }
  const to = `/?pay=${result}${/^[A-Za-z0-9_-]{6,64}$/.test(appId) ? '&app=' + appId : ''}`;
  res.statusCode = 303;
  res.setHeader('Location', to);
  res.end();
};
