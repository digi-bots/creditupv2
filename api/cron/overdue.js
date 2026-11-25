// Daily job (vercel.json → crons): marks overdue loans and sends due-date reminders.
// When CRON_SECRET is set in Vercel, only requests with "Authorization: Bearer <CRON_SECRET>" run it (Vercel adds this itself).
const { runOverdue } = require('../_lib/overdue');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return res.status(503).json({ error: 'FIREBASE_SERVICE_ACCOUNT is missing' });
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || '';
  if (secret ? auth !== `Bearer ${secret}` : !/vercel-cron/i.test(req.headers['user-agent'] || '')) return res.status(401).json({ error: 'Not allowed' });
  // 9am (Bangladesh): also run any due scheduled Telegram posts
  try { const { db } = require('../_lib/auth'); await require('../_lib/tg').runSchedule(db, true); } catch (e) { console.error('tg schedule', e.message); }
  try { return res.status(200).json(await runOverdue({ by: 'daily check' })); }
  catch (e) { console.error('overdue cron', e); return res.status(500).json({ error: 'Overdue check failed' }); }
};
