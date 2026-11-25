// Server-to-server payment notice (SSLCommerz IPN or TZPayWay webhook).
// Nothing in the notice is trusted: the payment is always re-checked with the provider before anything changes.
const { missingEnv, db, finalizePaid, readBody } = require('../_lib/pay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (missingEnv().length) return res.status(503).end();
  const b = readBody(req);
  const q = req.query || {};
  try {
    // TZPayWay: our tran id is in the webhook URL; the (encrypted) body is ignored and the status API decides
    if (q.gw === 'tz') {
      let tranId = String(q.tran || '');
      if (!tranId && b && b.trx_id) {
        const s = await db().collection('gatewayPayments').where('gwTrxId', '==', String(b.trx_id)).limit(1).get();
        if (!s.empty) tranId = s.docs[0].id;
      }
      if (!/^[A-Za-z0-9_-]{6,80}$/.test(tranId)) return res.status(200).json({ ok: false });
      // note that TZPayWay reached us (shown in the admin's connection test)
      await db().collection('gatewayPayments').doc(tranId).set({ webhookAt: new Date().toISOString(), webhookEvent: String((b && b.event) || '').slice(0, 40) }, { merge: true }).catch(() => {});
      const out = await finalizePaid(tranId, '');
      return res.status(200).json({ ok: out.ok, pending: !!out.pending });
    }
    const tranId = String(b.tran_id || '');
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
