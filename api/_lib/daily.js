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
  // today's bonus code: a new random redeem code every day, valid until midnight (Bangladesh)
  code: { on: true, amount: 5, maxUses: 0 },
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
  on: d.on !== false, site: d.site !== false, push: d.push !== false, channel: d.channel !== false, bot: d.bot !== false, pin: d.pin === true,
  code: { on: (d.code || {}).on !== false, amount: Math.max(1, Math.min(10000, Math.round(Number((d.code || {}).amount ?? 5) || 5))), maxUses: Math.max(0, Math.round(Number((d.code || {}).maxUses) || 0)) } }; };
async function settings(db) { try { const s = await db().collection('siteConfig').doc('app').get(); return norm(s.exists ? s.data().daily : null); } catch (e) { return norm(null); } }
const bdDay = (t = Date.now()) => new Date(t + 6 * 3600e3).toISOString().slice(0, 10);
const sleep = ms => new Promise(r => setTimeout(r, ms));
// midnight tonight in Bangladesh
function bdMidnight(t = Date.now()) { const d = new Date(t + 6 * 3600e3); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - 6 * 3600e3; }

// today's code (made once per day and reused if the reminder is sent again)
async function todaysCode(db, D, day) {
  const meta = db().collection('tgMeta').doc('dailyCode');
  const m = await meta.get();
  if (m.exists && m.data().day === day && m.data().code) return m.data();
  const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // never the same code twice: 8 random characters (about a trillion choices), and every code ever made is
  // registered in dailyCodes — creating a register entry fails if that code was ever used before
  let code = '';
  for (let k = 0; k < 8 && !code; k++) {
    const c = 'CF-' + Array.from(require('crypto').randomBytes(8)).map(b => ABC[b % ABC.length]).join('');
    if ((await db().collection('promoCodes').doc(c).get()).exists) continue;
    try { await db().collection('dailyCodes').doc(c).create({ day, at: iso() }); code = c; } catch (e) { /* taken: try another */ }
  }
  if (!code) throw new Error('Could not make a new code');
  const end = iso(bdMidnight());
  await db().collection('promoCodes').doc(code).set({ code, kind: 'redeem', value: D.code.amount, maxUses: D.code.maxUses, perUser: 1, uses: 0, on: true, audience: 'all',
    start: iso(), end, daily: true, note: 'Daily bonus code', createdAt: iso(), createdBy: '' });
  const out = { day, code, amount: D.code.amount, end };
  await meta.set(out);
  return out;
}

// after midnight: the day's code stops (it also expires by itself), and the reminder posts / messages are deleted
async function cleanupDaily(db) {
  const ref = db().collection('tgMeta').doc('dailyMsgs'); const s = await ref.get();
  if (!s.exists || !s.data().day || s.data().day >= bdDay()) return { cleaned: 0 };
  const x = s.data(); let n = 0;
  await ref.set({ day: '', msgs: [], cleanedAt: iso() });   // claim first, so it runs once
  if (x.code) await db().collection('promoCodes').doc(x.code).update({ on: false }).catch(() => {});
  const old = await db().collection('broadcasts').where('daily', '==', true).get().catch(() => ({ docs: [] }));
  await Promise.all(old.docs.filter(d => d.data().removed !== true).map(d => d.ref.update({ removed: true })));
  if (TG.configured()) {
    const msgs = x.msgs || [];
    for (let i = 0; i < msgs.length; i += 25) {
      await Promise.all(msgs.slice(i, i + 25).map(([chat, id]) => TG.call('deleteMessage', { chat_id: chat, message_id: id }).then(() => n++).catch(() => {})));
      if (i + 25 < msgs.length) await sleep(1100);
    }
  }
  return { cleaned: n };
}

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
  try { await cleanupDaily(db); } catch (e) {}
  // today's code; if it cannot be made, the reminder still goes out (without a code)
  let tc = null;
  if (D.code.on) { try { tc = await todaysCode(db, D, out.day); } catch (e) { out.codeError = e.message; console.error('daily code', e.message); } }
  if (tc) out.code = tc.code;
  const sent = [];   // [chat, message id] of everything sent today, deleted after midnight
  const codeTxt = tc ? `\n\n🎟️ Today's bonus code: ${tc.code}  (৳${tc.amount})\nHow to redeem: copy the code → open Creditfy → Quick Services → Redeem Code → paste → Redeem.\n⏳ Valid until midnight tonight · one use per person · for Verified members.` : '';
  const codeHtml = tc ? `\n\n🎟️ <b>Today's bonus code:</b> <code>${tc.code}</code>  (৳${tc.amount}, tap to copy)\n<b>How to redeem:</b> open Creditfy → Quick Services → <b>Redeem Code</b> → paste → Redeem.\n⏳ Valid until midnight tonight · one use per person · for Verified members.` : '';
  // 1. in-app notification for 24 hours (yesterday's one is taken down)
  if (want('site')) {
    try {
      const old = await db().collection('broadcasts').where('daily', '==', true).get();
      await Promise.all(old.docs.filter(d => d.data().removed !== true).map(d => d.ref.update({ removed: true })));
      await db().collection('broadcasts').add({ title: D.title, subject: tc ? `🎟️ Today's code ${tc.code} = ৳${tc.amount}` : D.pushText, message: D.text + codeTxt, type: 'info', from: 'daily', daily: true, createdAt: iso(), expiresAt: iso(bdMidnight()),
        ...(tc ? { buttonText: 'Redeem the code', buttonUrl: '/?go=redeem' } : { buttonText: 'Open Extra Services', buttonUrl: '/?go=extra' }) });
      out.site = 'ok';
    } catch (e) { out.site = 'failed: ' + e.message; }
  }
  // 2. phone push to every device
  if (want('push')) { try { const r = await sendPush({ all: true }, { title: D.title, body: tc ? `🎟️ Today's bonus code ${tc.code} = ৳${tc.amount} (until midnight). ${D.pushText}`.slice(0, 230) : D.pushText, link: '/?go=notifications', tag: 'cu-daily' }); out.push = r; } catch (e) { out.push = 'failed: ' + e.message; } }
  // 3. Telegram channel
  if (want('channel') && TG.configured()) {
    try {
      const S = await TG.settings(db), chat = S.channel && TG.chatId(S.channel);
      if (!chat) out.channel = 'no channel set';
      else {
        const m = await TG.call('sendMessage', { chat_id: chat, text: `<b>${TG.esc(D.title)}</b>\n\n${TG.esc(D.text)}${codeHtml}${S.footer ? '\n\n' + TG.esc(S.footer) : ''}`, parse_mode: 'HTML', link_preview_options: { is_disabled: true },
          reply_markup: { inline_keyboard: [[{ text: '🚀 ' + S.button, url: TG.appUrl(S) }]] } });
        sent.push([String(m.chat && m.chat.id || chat), m.message_id]);
        if (D.pin) await TG.call('pinChatMessage', { chat_id: chat, message_id: m.message_id, disable_notification: true }).catch(() => {});
        out.channel = 'ok';
      }
    } catch (e) { out.channel = 'failed: ' + e.message; }
  }
  // 4. a message from the bot to everyone who uses it (25 at a time, within Telegram's limits)
  if (want('bot') && TG.configured()) {
    const S = await TG.settings(db); const chats = (await botChats(db)).slice(0, 1500);
    const msg = `<b>${TG.esc(D.title)}</b>\n\n${TG.esc(D.text)}${codeHtml}`;
    const kb = { inline_keyboard: [[S.miniApp ? { text: '📱 Open Creditfy', web_app: { url: S.siteUrl } } : { text: '📱 Open Creditfy', url: TG.appUrl(S) }], ...(S.channelLink ? [[{ text: '📢 Our channel', url: S.channelLink }]] : [])] };
    let ok = 0, failed = 0;
    for (let i = 0; i < chats.length; i += 25) {
      await Promise.all(chats.slice(i, i + 25).map(async c => {
        try { const m = await TG.call('sendMessage', { chat_id: c, text: msg, parse_mode: 'HTML', reply_markup: kb, link_preview_options: { is_disabled: true } }); sent.push([String(c), m.message_id]); ok++; }
        catch (e) { failed++; if (/blocked|deactivated|chat not found/i.test(e.message)) await db().collection('tgUsers').doc(String(c)).set({ blocked: true, blockedAt: iso() }, { merge: true }).catch(() => {}); }
      }));
      if (i + 25 < chats.length) await sleep(1100);
    }
    out.bot = { sent: ok, failed, total: chats.length };
  }
  try { await db().collection('tgMeta').doc('daily').set({ last: out, at: iso() }, { merge: true }); } catch (e) {}
  // remember what to delete after midnight (added to anything already sent today)
  try { const r = db().collection('tgMeta').doc('dailyMsgs'); const o = await r.get(); const prev = o.exists && o.data().day === out.day ? (o.data().msgs || []) : [];
    await r.set({ day: out.day, code: tc ? tc.code : '', msgs: prev.concat(sent).slice(-3000) }); } catch (e) {}
  return out;
}
module.exports = { DEF, norm, settings, runDaily, botChats, cleanupDaily, todaysCode, bdMidnight };
