// SSLCommerz server-to-server notice (IPN). Verified with SSLCommerz before anything changes.
const { missingEnv, db, finalizePaid, readBody } = require('../_lib/pay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (missingEnv().length) return res.status(503).end();
  const b = readBody(req);
  const tranId = String(b.tran_id || '');
  try {
    if ((b.status === 'VALID' || b.status === 'VALIDATED') && b.val_id && tranId) {
      const out = await finalizePaid(tranId, String(b.val_id));
      return res.status(200).json({ ok: out.ok });
    }
    if (tranId && (b.status === 'FAILED' || b.status === 'CANCELLED' || b.status === 'UNATTEMPTED' || b.status === 'EXPIRED')) {
      const ref = db().collection('gatewayPayments').doc(tranId);
      const s = await ref.get();
      if (s.exists && s.data().status !== 'Paid') await ref.set({ status: b.status === 'CANCELLED' ? 'Cancelled' : 'Failed', updatedAt: new Date().toISOString() }, { merge: true });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('pay/ipn', e);
    return res.status(500).json({ ok: false });
  }
};
