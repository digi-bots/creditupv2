// Phone / browser push notifications through Firebase Cloud Messaging.
// Devices are saved in "pushTokens" (one document per device). Settings: Admin → App Settings → Push Notifications.
const crypto = require('crypto');
const admin = require('firebase-admin');
const { db } = require('./pay');

const PUSH_DEF = { on: true, auto: { updates: true, bonus: true, welcome: true, broadcast: true } };
const tokenId = t => crypto.createHash('sha256').update(String(t)).digest('hex').slice(0, 40);
// which automatic messages may also go to the phone, by notification type
const category = type => type === 'bonus' ? 'bonus' : type === 'welcome' ? 'welcome' : type === 'broadcast' ? 'broadcast' : 'updates';

async function pushCfg() {
  try { const s = await db().collection('siteConfig').doc('app').get(); const p = (s.exists && s.data().push) || {}; return { ...PUSH_DEF, ...p, auto: { ...PUSH_DEF.auto, ...(p.auto || {}) } }; }
  catch (e) { return PUSH_DEF; }
}

async function tokensFor({ uids, all }) {
  const col = db().collection('pushTokens');
  if (all) return (await col.get()).docs;
  const out = [];
  const list = [...new Set((uids || []).map(String).filter(Boolean))];
  for (let i = 0; i < list.length; i += 30) out.push(...(await col.where('uid', 'in', list.slice(i, i + 30)).get()).docs);
  return out;
}

// msg: { title, body, link, tag, image } — sent as data so our service worker shows it the same way everywhere
async function sendPush(target, msg) {
  const res = { devices: 0, sent: 0, failed: 0, removed: 0 };
  const docs = await tokensFor(target);
  res.devices = docs.length;
  if (!docs.length) return res;
  const data = { title: String(msg.title || 'Creditfy').slice(0, 80), body: String(msg.body || '').slice(0, 240), link: String(msg.link || '/'), tag: String(msg.tag || 'cu'), image: /^https:\/\//i.test(msg.image || '') ? msg.image : '' };
  for (let i = 0; i < docs.length; i += 500) {
    const chunk = docs.slice(i, i + 500);
    const r = await admin.messaging().sendEachForMulticast({ tokens: chunk.map(d => d.data().token), data, webpush: { headers: { Urgency: 'high', TTL: '86400' } } });
    r.responses.forEach((x, k) => {
      if (x.success) { res.sent++; return; }
      res.failed++;
      const code = x.error && x.error.code || '';
      if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) { chunk[k].ref.delete().catch(() => {}); res.removed++; }
    });
  }
  return res;
}

// automatic push for one user's notification, if the admin allows that kind
async function autoPush(uid, title, message, type) {
  try {
    const cfg = await pushCfg();
    if (cfg.on === false || cfg.auto[category(type)] === false) return null;
    return await sendPush({ uids: [uid] }, { title, body: message, link: '/?go=notifications', tag: 'cu-' + (type || 'info') });
  } catch (e) { console.warn('autoPush', e.message); return null; }
}

module.exports = { sendPush, autoPush, pushCfg, tokenId, category };
