// Daily job (vercel.json → crons, 12:05am Bangladesh time): posts today's weekday deals / Red Friday to the Telegram channel.
// Same protection as the overdue job: CRON_SECRET (or Vercel's cron agent).
const { db } = require('../_lib/auth');
const TG = require('../_lib/tg');
const X = require('../_lib/extra');
const tk = n => '৳' + Math.round(Number(n) || 0).toLocaleString('en-US');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const secret = process.env.CRON_SECRET, auth = req.headers.authorization || '';
  if (secret ? auth !== `Bearer ${secret}` : !/vercel-cron/i.test(req.headers['user-agent'] || '')) return res.status(401).json({ error: 'Not allowed' });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT || !TG.configured()) return res.status(200).json({ skipped: 'not configured' });
  // just after midnight: yesterday's daily code stops and its posts / messages are deleted
  try { await require('../_lib/daily').cleanupDaily(db); } catch (e) { console.error('daily cleanup', e.message); }
  let sched = null;
  try { sched = await TG.runSchedule(db, true); } catch (e) { console.error('tg schedule', e.message); }
  try {
    const s = await db().collection('siteConfig').doc('services').get();
    const C = X.norm(s.exists ? s.data().extra : null);
    const t = Date.now() + 60e3, lines = [];
    C.services.filter(x => x.on && !x.soon && x.mode === 'items').forEach(sv => sv.items.filter(i => i.on).forEach(i => { const p = X.priceNow(C, sv, i, t); if (p.kind === 'deal') lines.push(`• ${TG.esc(i.name)} — <s>${tk(p.was)}</s> ${tk(p.price)}`); }));
    if (!lines.length) return res.status(200).json({ sent: 0, reason: 'no deals today', sched });
    const wd = new Date(t + 6 * 3600e3).getUTCDay(), red = C.redFriday && C.redFriday.on && C.redFriday.day === wd;
    const r = await TG.publish(db, { title: red ? `🔴 ${C.redFriday.title} is LIVE — today only!` : '⚡ Today’s deals are live', text: `${lines.slice(0, 15).join('\n')}\n\nPrices end at midnight (Bangladesh time). Verified & VIP members pay no service charge.`.replace(/<s>|<\/s>/g, ''), pin: red }, 'deals');
    return res.status(200).json(r);
  } catch (e) { console.error('tg cron', e); return res.status(500).json({ error: 'failed' }); }
};
