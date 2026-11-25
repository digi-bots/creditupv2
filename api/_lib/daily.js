// Daily reminder: once a day (the 9am Bangladesh job), the same message goes out everywhere at the same time:
// an in-app notification for every user (for 24 hours), a phone push to every device, a Telegram channel post,
// and a message from the bot to everyone who has started the bot or opened the Mini App.
// Settings: siteConfig/app → daily (Admin → Telegram → Daily reminder).
const TG = require('./tg');
const { sendPush } = require('./push');
const iso = (t = Date.now()) => new Date(t).toISOString();
const str = (v, n) => String(v ?? '').trim().slice(0, n);

const DEF = {
  on: true, site: true, push: true, channel: true, bot: true, pin: false,
  title: '☀️ Good morning from Creditfy',
  text: `✅ Loans are running smoothly — applications are reviewed and processed every day, and you can follow every step in the app.

🛍️ Extra Services, all in one place:
• 📱 Mobile recharge for every operator
• 🎁 Gift cards — Google Play, iTunes, Steam
• 💱 Currency & MFS exchange (bKash ⇄ Nagad ⇄ Rocket)
• 📣 SMM & Telegram Premium
• 💳 Virtual cards & gift vouchers
• 💼 Micro jobs — earn by doing simple tasks
• 🎮 Play & Earn, daily check-in and Spin & Win

🎁 Bonus & referrals: share your invite link — the more friends join, the bigger the offers you can unlock.

✔️ Get Verified today for a smoother review, full access to every service and no service charge on Extra Services.

👑 Need it sooner? VIP applications are reviewed first.

Open Creditfy and make the most of it today 👇`,
  pushText: 'Loans are running smoothly ✅ Recharge, gift cards, exchange & more in Extra Services. Invite friends for bigger offers, get Verified and try VIP.'
};
const norm = d => { d = d || {}; return { ...DEF, ...d, title: str(d.title || DEF.title, 120), text: str(d.text || DEF.text, 3500), pushText: str(d.pushText || DEF.pushText, 230),
  on: d.on !== false, site: d.site !== false, push: d.push !== false, channel: d.channel !== false, bot: d.bot !== false, pin: d.pin === true }; };
async function settings(db) { try { const s = await db().collection('siteConfig').doc('app').get(); return norm(s.exists ? s.data().daily : null); } catch (e) { return norm(null); } }
const bdDay = (t = Date.now()) => new Date(t + 6 * 3600e3).toISOString().slice(0, 10);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// everyone the bot may write to: people who started the bot / opened the Mini App, and linked accounts
async function botChats(db) {
  const ids = new Set();
  const [a, b] = await Promise.all([db().collection('tgUsers').get().catch(() => ({ docs: [] })), db().collection('users').where('tgChatId', '>', '').get().catch(() => ({ docs: [] }))]);
  a.docs.forEach(d => { const x = d.data(); if (!x.blocked && x.canWrite !== false) ids.add(String(d.id)); });
  b.docs.forEach(d => { const c = d.data().tgChatId; if (c) ids.add(String(c)); });
  return [...ids];
}

async function runDaily(db, { force = false, only = null } = {}) {
  const D = await settings(db); const out = { day: bdDay() };
  if (!D.on && !force) return { ...out, skipped: 'off' };
  // once a day
  if (!force) {
    const lock = db().collection('tgMeta').doc('daily'); let go = false;
    await db().runTransaction(async t => { const s = await t.get(lock); if (!s.exists || s.data().day !== out.day) { t.set(lock, { day: out.day, at: iso() }); go = true; } });
    if (!go) return { ...out, skipped: 'already sent today' };
  }
  const want = k => (only ? only.includes(k) : D[k]);
  // 1. in-app notification for 24 hours (yesterday's one is taken down)
  if (want('site')) {
    try {
      const old = await db().collection('broadcasts').where('daily', '==', true).get();
      await Promise.all(old.docs.filter(d => d.data().removed !== true).map(d => d.ref.update({ removed: true })));
      await db().collection('broadcasts').add({ title: D.title, subject: D.pushText, message: D.text, type: 'info', from: 'daily', daily: true, createdAt: iso(), expiresAt: iso(Date.now() + 24 * 3600e3), buttonText: 'Open Extra Services', buttonUrl: '/?go=extra' });
      out.site = 'ok';
    } catch (e) { out.site = 'failed: ' + e.message; }
  }
  // 2. phone push to every device
  if (want('push')) { try { const r = await sendPush({ all: true }, { title: D.title, body: D.pushText, link: '/?go=notifications', tag: 'cu-daily' }); out.push = r; } catch (e) { out.push = 'failed: ' + e.message; } }
  // 3. Telegram channel
  if (want('channel') && TG.configured()) { try { const r = await TG.publish(db, { title: D.title, text: D.text, pin: D.pin }, ''); out.channel = r.sent ? 'ok' : 'not sent'; } catch (e) { out.channel = 'failed: ' + e.message; } }
  // 4. a message from the bot to everyone who uses it (25 at a time, within Telegram's limits)
  if (want('bot') && TG.configured()) {
    const S = await TG.settings(db); const chats = (await botChats(db)).slice(0, 1500);
    const msg = `<b>${TG.esc(D.title)}</b>\n\n${TG.esc(D.text)}`;
    const kb = { inline_keyboard: [[S.miniApp ? { text: '📱 Open Creditfy', web_app: { url: S.siteUrl } } : { text: '📱 Open Creditfy', url: TG.appUrl(S) }], ...(S.channelLink ? [[{ text: '📢 Our channel', url: S.channelLink }]] : [])] };
    let sent = 0, failed = 0;
    for (let i = 0; i < chats.length; i += 25) {
      await Promise.all(chats.slice(i, i + 25).map(async c => {
        try { await TG.call('sendMessage', { chat_id: c, text: msg, parse_mode: 'HTML', reply_markup: kb, link_preview_options: { is_disabled: true } }); sent++; }
        catch (e) { failed++; if (/blocked|deactivated|chat not found/i.test(e.message)) await db().collection('tgUsers').doc(String(c)).set({ blocked: true, blockedAt: iso() }, { merge: true }).catch(() => {}); }
      }));
      if (i + 25 < chats.length) await sleep(1100);
    }
    out.bot = { sent, failed, total: chats.length };
  }
  try { await db().collection('tgMeta').doc('daily').set({ last: out, at: iso() }, { merge: true }); } catch (e) {}
  return out;
}
module.exports = { DEF, norm, settings, runDaily, botChats };
