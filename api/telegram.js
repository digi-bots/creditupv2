// Telegram webhook: the bot's private chat (commands, account linking) and the community group
// (welcome with rules, link / bad-word filter). Only Telegram can call it: it sends our secret header.
const { db } = require('./_lib/auth');
const TG = require('./_lib/tg');
const X = require('./_lib/extra');
const MOD = require('./_lib/tgmod');

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

// what Creditfy offers, for new members (short, with the house rules)
const INTRO = `🏦 <b>Loans</b> — apply 24/7 from your phone, every fee shown before you pay, follow each step in the app
🛍️ <b>Digital Services</b> — gift cards, recharge, exchange, subscriptions, paid from your Digital Balance
🎁 <b>Rewards</b> — daily check-in, spin, redeem codes, refer &amp; earn
👑 <b>VIP</b> — VIP services and faster loan review`;
const NOTICE = n => `⚠️ <b>Please note:</b> links, ads, phone numbers, abuse and complaints about money are removed by the bot. After <b>${n} warnings</b> you can no longer post.
💬 Account, payment or order problem? Open the app → <b>Support</b> — it goes straight to our admin team.`;
const GROUP_HELP = `🤖 <b>Community bot</b>
/rules — group rules
/offers — today’s offers
/app — open Creditfy
/support — get help from the admin team
/report — reply to a message to report it
/mywarns — your warnings

<b>Admins</b> (reply to a member’s message):
/warn [reason] · /unwarn · /mute · /unmute · /ban · /warns · /pin`;

async function onGroup(m, S) {
  const chat = m.chat.id;
  // new members: greet them by name, explain the services and the house rules
  if (Array.isArray(m.new_chat_members) && m.new_chat_members.length) {
    if (S.welcome.deleteJoin) TG.call('deleteMessage', { chat_id: chat, message_id: m.message_id }).catch(() => {});
    if (S.welcome.on) {
      const names = m.new_chat_members.filter(u => !u.is_bot).map(u => `<a href="tg://user?id=${u.id}">${TG.esc(u.first_name || 'friend')}</a>`).join(', ');
      if (names) await say(chat, S, `${TG.esc(S.welcome.text).replace('{name}', `<b>${names}</b>`)}\n\n${INTRO}\n\n📜 <b>Rules</b>\n${TG.esc(S.rules)}\n\n${NOTICE(S.mod.limit)}`, false);
    }
    return;
  }
  if (m.left_chat_member) { if (S.welcome.deleteJoin) TG.call('deleteMessage', { chat_id: chat, message_id: m.message_id }).catch(() => {}); return; }
  const text = String(m.text || m.caption || ''), cmd = text.split(/[\s@]/)[0].toLowerCase();
  if (!m.from || m.sender_chat) return;   // posts by the channel itself or anonymous admins
  const admins = await groupAdmins(chat), isAdm = admins.includes(m.from.id);
  const target = m.reply_to_message && m.reply_to_message.from && !m.reply_to_message.from.is_bot ? m.reply_to_message.from : null;
  const del = () => TG.call('deleteMessage', { chat_id: chat, message_id: m.message_id }).catch(() => {});
  const note = (t, quiet = true) => TG.call('sendMessage', { chat_id: chat, text: t, parse_mode: 'HTML', disable_notification: quiet }).catch(() => {});
  // the channel is for notices only: comments under channel posts are removed — members talk in the group itself
  if (!isAdm && S.mod.noComments !== false && m.reply_to_message && m.reply_to_message.is_automatic_forward) {
    await del();
    return note(`💬 ${TG.esc(MOD.nameOf(m.from))}, comments on channel posts are off. Please write your message here in the group as a new message.`);
  }
  // everyone's commands
  if (cmd === '/offers') return say(chat, S, await offersText(), false);
  if (cmd === '/rules') return say(chat, S, `📜 <b>Community rules</b>\n\n${TG.esc(S.rules)}\n\n${NOTICE(S.mod.limit)}`, false);
  if (cmd === '/app') return say(chat, S, 'Open the Creditfy app 👇', false);
  if (cmd === '/help') return note(GROUP_HELP);
  if (cmd === '/support') return say(chat, S, '💬 For account, payment or order help, open Creditfy → <b>Support</b>. It goes straight to our admin team — please do not share your details in the group.', false);
  if (cmd === '/mywarns') { const d = await db().collection('tgMod').doc(`${chat}_${m.from.id}`).get(); const w = d.exists ? Number(d.data().warns) || 0 : 0; del(); return note(`${TG.esc(MOD.nameOf(m.from))}: ${w}/${S.mod.limit} warnings${w ? '' : ' — all good ✅'}`); }
  if (cmd === '/report') {
    del(); if (!target) return note('Reply to the message you want to report, then send /report.');
    await MOD.tellAdmins(db, `🚩 <b>Report</b> by ${TG.esc(MOD.nameOf(m.from))}\n👤 About ${TG.esc(MOD.nameOf(target))} · id <code>${target.id}</code>\n💬 “${TG.esc(String(m.reply_to_message.text || m.reply_to_message.caption || '[media]').slice(0, 200))}”`);
    return note('✅ Thank you — our admins have been told.');
  }
  // admin tools (reply to a member's message)
  if (isAdm && /^\/(warn|unwarn|mute|unmute|unban|ban|warns|pin)$/.test(cmd)) {
    if (cmd === '/pin') { if (m.reply_to_message) await TG.call('pinChatMessage', { chat_id: chat, message_id: m.reply_to_message.message_id, disable_notification: true }).catch(() => {}); return del(); }
    const id = target ? target.id : Number((text.split(/\s+/)[1] || '').replace(/\D/g, '')) || 0;
    if (!id) return note('Reply to the member’s message (or give their id), e.g. reply + /warn spam');
    const who = target || { id, first_name: 'Member ' + id };
    del();
    if (cmd === '/warn') { if (m.reply_to_message) TG.call('deleteMessage', { chat_id: chat, message_id: m.reply_to_message.message_id }).catch(() => {}); return MOD.warn(db, chat, who, { kind: 'admin', reason: text.split(/\s+/).slice(1).join(' ').slice(0, 100) || 'please follow the group rules' }, S, { by: 'admin', text: target ? (m.reply_to_message.text || '') : '' }); }
    if (cmd === '/unwarn') { await MOD.clear(db, chat, id); return note(`🧹 Warnings cleared for ${TG.esc(MOD.nameOf(who))}.`); }
    if (cmd === '/unmute' || cmd === '/unban') { await MOD.unban(db, chat, id); return note(`✅ ${TG.esc(MOD.nameOf(who))} can post again.`); }
    if (cmd === '/mute') { await MOD.warn(db, chat, who, { kind: 'admin', reason: 'muted by an admin' }, { ...S, mod: { ...S.mod, limit: 1 } }, { by: 'admin' }); return; }
    if (cmd === '/ban') { await TG.call('banChatMember', { chat_id: chat, user_id: id }).catch(() => {}); await db().collection('tgMod').doc(`${chat}_${id}`).set({ chat: String(chat), uid: String(id), name: MOD.nameOf(who), banned: true, removed: true, bannedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true }); return note(`⛔ ${TG.esc(MOD.nameOf(who))} was removed from the group.`); }
    if (cmd === '/warns') { const d = await db().collection('tgMod').doc(`${chat}_${id}`).get(); const x = d.exists ? d.data() : {}; return note(`${TG.esc(MOD.nameOf(who))}: ${Number(x.warns) || 0}/${S.mod.limit} warnings${x.banned ? ' · cannot post' : ''}`); }
  }
  // the guard: members only (admins are never checked)
  if (isAdm) return;
  const why = MOD.check(m, S);
  if (!why) return;
  await del();
  await MOD.warn(db, chat, m.from, why, S, { text });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).json({ ok: true, creditfy: true });   // also used to find the right webhook address
  if (!TG.configured() || req.headers['x-telegram-bot-api-secret-token'] !== TG.hookSecret()) return res.status(401).json({ ok: false });
  let u = req.body; if (typeof u === 'string') { try { u = JSON.parse(u); } catch (e) { u = {}; } }
  try {
    const S = await TG.settings(db);
    // Approve / Reject buttons on admin alerts
    if (u && u.callback_query && /^m:(unban|clear):/.test(u.callback_query.data || '')) { await MOD.onButton(db, u.callback_query); return res.status(200).json({ ok: true }); }
    if (u && u.callback_query && /^m:/.test(u.callback_query.data || '')) { await TG.call('answerCallbackQuery', { callback_query_id: u.callback_query.id }).catch(() => {}); return res.status(200).json({ ok: true }); }
    if (u && u.callback_query) { await require('./_lib/alerts').onButton(db, u.callback_query, require('./account').actions); return res.status(200).json({ ok: true }); }
    // someone joined the channel: Telegram does not allow a greeting inside a channel, so the bot greets them privately
    // (this reaches people who have started the bot before; others are greeted when they join the group)
    if (S.on && u && u.chat_member && u.chat_member.chat && u.chat_member.chat.type === 'channel' && sameChat(S.channel, u.chat_member.chat)) {
      const c = u.chat_member, was = (c.old_chat_member || {}).status, now = (c.new_chat_member || {}).status, who = (c.new_chat_member || {}).user || c.from;
      if (['left', 'kicked'].includes(was) && now === 'member' && who && !who.is_bot && S.welcome.on)
        await say(who.id, S, `👋 Thanks for joining our channel, <b>${TG.esc(who.first_name || 'friend')}</b>!\n\n${INTRO}\n\n${S.groupLink ? 'Questions? Join our community group 👇 — ' : ''}For account, payment or order help, open the app → <b>Support</b> (it goes straight to our admin team).`, true).catch(() => {});
      return res.status(200).json({ ok: true });
    }
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
