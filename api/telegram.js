// Telegram webhook: the bot's private chat (commands, account linking) and the community group
// (welcome with rules, link / bad-word filter). Only Telegram can call it: it sends our secret header.
const { db } = require('./_lib/auth');
const TG = require('./_lib/tg');
const X = require('./_lib/extra');

const tk = n => '৳' + Math.round(Number(n) || 0).toLocaleString('en-US');
let _admins = { at: 0, chat: '', ids: [] };

async function groupAdmins(chat) {
  if (_admins.chat === String(chat) && Date.now() - _admins.at < 10 * 60e3) return _admins.ids;
  const list = await TG.call('getChatAdministrators', { chat_id: chat }).catch(() => []);
  _admins = { at: Date.now(), chat: String(chat), ids: list.map(m => m.user.id) };
  return _admins.ids;
}
const sameChat = (cfg, chat) => { const c = String(cfg || '').trim(); if (!c) return false; if (/^-?\d+$/.test(c)) return String(chat.id) === c; const u = c.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').toLowerCase(); return (chat.username || '').toLowerCase() === u; };

function appButtons(S, priv, ref) {
  // ref: an invite — the app opens with ?ref=… so the friend who invited gets the referral
  const url = S.siteUrl + (ref ? '/?ref=0' + ref : '');
  const rows = [[priv && S.miniApp ? { text: '📱 Open Creditfy', web_app: { url } } : { text: '📱 Open Creditfy', url: ref ? url : TG.appUrl(S) }]];
  const r2 = [];
  if (S.channelLink) r2.push({ text: '📢 Channel', url: S.channelLink });
  if (S.groupLink) r2.push({ text: '💬 Community', url: S.groupLink });
  if (r2.length) rows.push(r2);
  return { inline_keyboard: rows };
}
async function say(chat, S, text, priv, extra = {}, ref = '') {
  return TG.call('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', reply_markup: appButtons(S, priv, ref), link_preview_options: { is_disabled: true }, ...extra });
}

// today's offers: offer prices that are still running and today's weekday deals
async function offersText() {
  const s = await db().collection('siteConfig').doc('services').get();
  const C = X.norm(s.exists ? s.data().extra : null);
  const lines = [];
  C.services.filter(x => x.on && !x.soon && x.mode === 'items').forEach(sv => sv.items.filter(i => i.on).forEach(i => {
    const p = X.priceNow(C, sv, i); if (p.kind) lines.push(`• ${TG.esc(i.name)} — <s>${tk(p.was)}</s> <b>${tk(p.price)}</b>${p.kind === 'deal' ? ' (today)' : ''}`);
  }));
  return lines.length ? `🔥 <b>Today’s offers</b>\n\n${lines.slice(0, 15).join('\n')}\n\nVerified &amp; VIP members pay no service charge.` : 'No special offers right now — check back soon! 🙌';
}

async function onPrivate(m, S) {
  const chat = m.chat.id, text = String(m.text || '').trim(), cmd = text.split(/[\s@]/)[0].toLowerCase();
  if (cmd === '/start') {
    const arg = text.split(/\s+/)[1] || '';
    // an admin linking their Telegram for alerts: /start A<code> (made in the admin panel, 15 minutes)
    if (/^A[\w-]{8,}$/.test(arg)) {
      const ref = db().collection('tgLinks').doc(arg.slice(1)); const s = await ref.get();
      if (s.exists && s.data().adminUid && s.data().exp > Date.now()) {
        await db().collection('tgAdmins').doc(String(chat)).set({ uid: s.data().adminUid, name: String(m.from.first_name || '').slice(0, 60), username: String(m.from.username || '').slice(0, 40), at: new Date().toISOString() });
        await ref.delete().catch(() => {});
        return TG.call('sendMessage', { chat_id: chat, text: '🛡️ <b>Admin alerts are on</b>\nYou will get new payments and orders here with Approve / Reject buttons, and a summary of each day after midnight.\n\n/summary — today so far', parse_mode: 'HTML' });
      }
      return TG.call('sendMessage', { chat_id: chat, text: 'This admin link has expired. Make a new one in Admin → Telegram → Admin alerts.' });
    }
    if (/^L[\w-]{8,}$/.test(arg)) {
      const ref = db().collection('tgLinks').doc(arg.slice(1)); const s = await ref.get();
      if (s.exists && s.data().exp > Date.now()) {
        const uid = s.data().uid; const u = await db().collection('users').doc(String(uid)).get();
        if (u.exists) {
          await u.ref.update({ tgChatId: String(chat), tgName: [m.from.first_name, m.from.last_name].filter(Boolean).join(' ').slice(0, 60), tgUser: String(m.from.username || '').slice(0, 40), tgLinkedAt: new Date().toISOString() });
          await ref.delete().catch(() => {});
          return say(chat, S, `✅ <b>Connected!</b>\nYour Creditfy account 0${TG.esc(uid)} is now linked. You will get your loan, payment and order updates here.\n\nTry /balance or /offers.`, true);
        }
      }
      return say(chat, S, 'This link has expired. Open Creditfy → Telegram and tap “Connect” again.', true);
    }
    // an invite link: t.me/<bot>?start=r01XXXXXXXXX
    const ref = /^r/i.test(arg) ? (String(arg).replace(/\D/g, '').replace(/^(880)?0*/, '').match(/^1\d{9}$/) || [''])[0] : '';
    if (ref) return say(chat, S, `👋 <b>Welcome to Creditfy</b>, ${TG.esc(m.from.first_name || 'friend')}!\n\nA friend invited you. Tap <b>Open Creditfy</b> below and create your account — your friend’s invite is already applied.\n\n🔒 We will never ask for your PIN, OTP or password.`, true, {}, ref);
    return say(chat, S, `👋 <b>Welcome to Creditfy</b>, ${TG.esc(m.from.first_name || 'friend')}!\n\n• Tap <b>Open Creditfy</b> to use the app right here\n• /offers — today’s offers\n• /balance — your balances (after you connect your account)\n\n🔒 We will never ask for your PIN, OTP or password.`, true);
  }
  if (cmd === '/offers') return say(chat, S, await offersText(), true);
  if (cmd === '/summary') {
    const a = await db().collection('tgAdmins').doc(String(chat)).get();
    if (a.exists) return TG.call('sendMessage', { chat_id: chat, text: await require('./_lib/alerts').summary(db, new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 10)), parse_mode: 'HTML' });
  }
  if (cmd === '/balance') {
    const q = await db().collection('users').where('tgChatId', '==', String(chat)).limit(1).get();
    if (q.empty) return say(chat, S, 'Your account is not connected yet. Open Creditfy → Telegram → <b>Connect</b>.', true);
    const u = q.docs[0].data();
    return say(chat, S, `💼 <b>Your balances</b>\nCreditfy balance: <b>${tk(u.balance)}</b>\nDigital Balance: <b>${tk(u.xbal)}</b>${u.phoneVerified ? '\n✅ Verified member' : ''}`, true);
  }
  if (cmd === '/rules') return say(chat, S, `📜 <b>Community rules</b>\n\n${TG.esc(S.rules)}`, true);
  if (cmd === '/app') return say(chat, S, 'Open the Creditfy app 👇', true);
  // a question: answer it from the FAQ when there is a good match
  if (text && !text.startsWith('/')) { const f = await require('./_lib/faq').answer(db, text); if (f) return say(chat, S, `💡 <b>${TG.esc(f.q)}</b>\n\n${TG.esc(f.a)}\n\n<i>Not what you asked? Open the app → Support, our team will help.</i>`, true); }
  return say(chat, S, 'I can help with:\n/offers — today’s offers\n/balance — your balances\n/app — open Creditfy\n/rules — community rules\n\nFor account help, open the app → Support.', true);
}

async function onGroup(m, S) {
  const chat = m.chat.id;
  // new members: delete the "joined" line and say welcome with the rules
  if (Array.isArray(m.new_chat_members) && m.new_chat_members.length) {
    if (S.welcome.deleteJoin) TG.call('deleteMessage', { chat_id: chat, message_id: m.message_id }).catch(() => {});
    if (S.welcome.on) {
      const names = m.new_chat_members.filter(u => !u.is_bot).map(u => TG.esc(u.first_name || 'friend')).join(', ');
      if (names) await say(chat, S, `${TG.esc(S.welcome.text).replace('{name}', `<b>${names}</b>`)}\n\n📜 <b>Rules</b>\n${TG.esc(S.rules)}`, false);
    }
    return;
  }
  if (m.left_chat_member) { if (S.welcome.deleteJoin) TG.call('deleteMessage', { chat_id: chat, message_id: m.message_id }).catch(() => {}); return; }
  const text = String(m.text || m.caption || ''), cmd = text.split(/[\s@]/)[0].toLowerCase();
  if (cmd === '/offers') return say(chat, S, await offersText(), false);
  if (cmd === '/rules') return say(chat, S, `📜 <b>Community rules</b>\n\n${TG.esc(S.rules)}`, false);
  if (cmd === '/app' || cmd === '/help') return say(chat, S, 'Open the Creditfy app 👇  Ask your questions here — our team and members will help.', false);
  // moderation: members (not admins) may not post links or blocked words
  if (!m.from || m.sender_chat) return;
  const admins = await groupAdmins(chat); if (admins.includes(m.from.id)) return;
  const ents = [...(m.entities || []), ...(m.caption_entities || [])];
  const hasLink = ents.some(e => ['url', 'text_link'].includes(e.type)) || /(https?:\/\/|t\.me\/|www\.)/i.test(text);
  const low = text.toLowerCase(), bad = S.mod.words.find(w => w && low.includes(w));
  if ((S.mod.links && hasLink) || bad) {
    await TG.call('deleteMessage', { chat_id: chat, message_id: m.message_id }).catch(() => {});
    await TG.call('sendMessage', { chat_id: chat, text: `⚠️ ${TG.esc(m.from.first_name || 'Member')}, ${hasLink ? 'links are not allowed here' : 'please keep the chat clean'}. Read /rules.`, disable_notification: true }).catch(() => {});
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).json({ ok: true, creditfy: true });   // also used to find the right webhook address
  if (!TG.configured() || req.headers['x-telegram-bot-api-secret-token'] !== TG.hookSecret()) return res.status(401).json({ ok: false });
  let u = req.body; if (typeof u === 'string') { try { u = JSON.parse(u); } catch (e) { u = {}; } }
  try {
    const S = await TG.settings(db);
    // Approve / Reject buttons on admin alerts
    if (u && u.callback_query) { await require('./_lib/alerts').onButton(db, u.callback_query, require('./account').actions); return res.status(200).json({ ok: true }); }
    const m = u && (u.message || u.edited_message);
    if (S.on && m && m.chat) {
      if (m.chat.type === 'private') {
        // remember who uses the bot (for the daily reminder); a new message also lifts an old 'blocked' mark
        db().collection('tgUsers').doc(String(m.chat.id)).set({ name: String(m.from.first_name || '').slice(0, 60), username: String(m.from.username || '').slice(0, 40), lastAt: new Date().toISOString(), blocked: false, canWrite: true }, { merge: true }).catch(() => {});
        await onPrivate(m, S);
      }
      else if (sameChat(S.group, m.chat)) await onGroup(m, S);
    }
  } catch (e) { console.error('telegram', e.message); }
  return res.status(200).json({ ok: true });   // always 200, so Telegram does not resend
};
