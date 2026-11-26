// Community group guard: the bot reads every member message in the group (and in the channel's comment group),
// removes what breaks the rules, warns the member, and after 3 warnings stops them from posting. Admins get each
// case on their Telegram (with Unban / Clear buttons) and see the ban list and suspects in Admin → Telegram.
// Group admins are never checked. Data: tgMod/{chat}_{user} = { warns, banned, history[] }.
const TG = require('./tg');
const iso = (t = Date.now()) => new Date(t).toISOString();
const str = (v, n) => String(v ?? '').trim().slice(0, n);

// talk against payments / money / the service, in Bangla, English and Banglish — removed, and the member is sent to Support
const PAY_NEG = [
  /\b(scam+e?r?|fraud|fake|cheat(er|ing)?|chor|batpar|batpaar|bat\s*par|dhoka|dhoka\s*baj|thog|thok|vua|vuya|bhua|bhuya|ponzi|refund\s*koi|fraudster)\b/i,
  /\b(taka|tk|money|payment|loan|fee)\b.{0,30}\b(dey\s*na|dei\s*na|day\s*na|pai\s*ni|pay\s*ni|painai|paini|pawa\s*jay\s*na|ferot\s*dey\s*na|not\s*(received|paid|given|returned)|never\s*(received|paid|came)|stuck|atke|atkay)\b/i,
  /\b(dey\s*na|pai\s*ni|painai|paini)\b.{0,30}\b(taka|tk|money|payment|loan)\b/i,
  /(প্রতারক|প্রতারণা|ভুয়া|ভূয়া|বাটপার|বাটপাড়|চোর|চিটার|ধোকা|ধোঁকা|ঠক|ফ্রড|স্ক্যাম|ভণ্ড)/,
  /(টাকা|পেমেন্ট|লোন|ফি).{0,25}(দেয়\s*না|দেয়না|দেয়\s*নাই|দেয়নি|পাই\s*নি|পাইনি|পাইনাই|পাচ্ছি\s*না|ফেরত\s*দেয়|আটকে|আটকা)/,
  /(দেয়\s*না|পাইনি|পাই\s*নাই).{0,25}(টাকা|পেমেন্ট|লোন)/
];
// abuse in any of the three ways of writing
const ABUSE = [/\b(fuck|f\*ck|bitch|bastard|idiot|stupid|harami|haramjada|kuttar\s*bacha|shuorer|shala|sala|magi|khanki|chudi|bokachoda|baal|bal\s*chhal)\b/i, /(হারামি|হারামজাদা|কুত্তার|শুয়োরের|শালা|মাগি|খানকি|বোকাচোদা|বাল)/];
const PHONE = /(?:\+?88)?01[3-9]\d{2}[\s-]?\d{6}\b/;
const SPAMMY = /\b(earn\s*\$?\d+\s*(daily|per\s*day)|investment\s*plan|double\s*your\s*money|crypto\s*signal|join\s*my\s*channel|dm\s*me\s*for|whatsapp\s*me|work\s*from\s*home\s*earn|free\s*recharge\s*link)\b/i;

const DEF = { on: true, limit: 3, links: true, payNeg: true, abuse: true, phones: true, flood: true, forwards: true, spam: true, words: [] };
function cfg(S) { const m = (S && S.mod) || {}; return { ...DEF, ...m, limit: Math.max(1, Math.min(10, Math.floor(Number(m.limit) || DEF.limit))), words: Array.isArray(m.words) ? m.words : [] }; }

// flood: more than 6 messages in 15 seconds (kept in memory, per server)
const _flood = new Map();
function flooding(chat, uid) {
  const k = chat + ':' + uid, now = Date.now(), L = (_flood.get(k) || []).filter(t => now - t < 15e3); L.push(now); _flood.set(k, L);
  if (_flood.size > 5000) _flood.clear();
  return L.length > 6;
}

// what is wrong with this message (null = fine)
function check(m, S) {
  const C = cfg(S); if (!C.on) return null;
  const text = String(m.text || m.caption || ''), low = text.toLowerCase();
  const ents = [...(m.entities || []), ...(m.caption_entities || [])];
  if (C.flood && flooding(m.chat.id, m.from.id)) return { kind: 'flood', reason: 'please do not flood the chat' };
  if (C.forwards && (m.forward_from_chat || m.forward_origin && m.forward_origin.type === 'channel')) return { kind: 'forward', reason: 'forwarding from other channels is not allowed' };
  if (C.links && (ents.some(e => ['url', 'text_link'].includes(e.type)) || /(https?:\/\/|t\.me\/|www\.|\.com\b|\.xyz\b|bit\.ly)/i.test(text))) return { kind: 'link', reason: 'links are not allowed here' };
  if (C.spam && (SPAMMY.test(text) || ents.filter(e => e.type === 'mention').length >= 4)) return { kind: 'spam', reason: 'no ads or spam please' };
  if (C.phones && PHONE.test(text.replace(/[^\d+\s-]/g, ' '))) return { kind: 'phone', reason: 'for your safety, do not share phone numbers here' };
  if (C.abuse && ABUSE.some(r => r.test(text))) return { kind: 'abuse', reason: 'please keep the chat respectful' };
  if (C.payNeg && PAY_NEG.some(r => r.test(text))) return { kind: 'payment', reason: 'payment, account and order problems are solved by our admin team', pay: true };
  const bad = C.words.find(w => w && low.includes(String(w).toLowerCase()));
  if (bad) return { kind: 'word', reason: 'please keep the chat clean' };
  return null;
}

const ref = (db, chat, uid) => db().collection('tgMod').doc(`${chat}_${uid}`);
const nameOf = u => [u.first_name, u.last_name].filter(Boolean).join(' ').slice(0, 60) || 'Member';

async function tellAdmins(db, html, kb) {
  const A = await require('./alerts').admins(db);
  await Promise.all(A.map(a => TG.call('sendMessage', { chat_id: a.chat, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, ...(kb ? { reply_markup: kb } : {}) }).catch(() => {})));
}

// one warning; at the limit the member can no longer post (they can still read)
async function warn(db, chat, user, why, S, { text = '', by = 'bot' } = {}) {
  const C = cfg(S), r = ref(db, chat, user.id);
  let warns = 0, banned = false;
  await db().runTransaction(async t => {
    const s = await t.get(r); const d = s.exists ? s.data() : {};
    warns = (Number(d.warns) || 0) + 1; banned = d.banned === true || warns >= C.limit;
    const history = [...(Array.isArray(d.history) ? d.history : []), { at: iso(), kind: why.kind, reason: why.reason, text: str(text, 200), by }].slice(-10);
    t.set(r, { chat: String(chat), uid: String(user.id), name: nameOf(user), username: str(user.username, 40), warns, banned, history, updatedAt: iso(), ...(banned && !d.banned ? { bannedAt: iso() } : {}) }, { merge: true });
  });
  if (banned) await TG.call('restrictChatMember', { chat_id: chat, user_id: user.id, permissions: { can_send_messages: false, can_send_audios: false, can_send_documents: false, can_send_photos: false, can_send_videos: false, can_send_video_notes: false, can_send_voice_notes: false, can_send_polls: false, can_send_other_messages: false, can_add_web_page_previews: false } }).catch(() => {});
  const nm = TG.esc(nameOf(user));
  const support = why.pay ? '\n💬 For any account, payment or order problem, open Creditfy → <b>Support</b> — our admin team will help you personally.' : '';
  const msg = banned ? `⛔ ${nm} can no longer post here after ${C.limit} warnings.${support}` : `⚠️ ${nm}, ${TG.esc(why.reason)}. Warning <b>${warns}/${C.limit}</b> — after ${C.limit} warnings you cannot post here.${support}`;
  await TG.call('sendMessage', { chat_id: chat, text: msg, parse_mode: 'HTML', disable_notification: true }).catch(() => {});
  const key = `m:unban:${chat}_${user.id}`;
  await tellAdmins(db, `${banned ? '⛔ <b>Member stopped from posting</b>' : '🚨 <b>Group warning</b>'}\n👤 ${nm}${user.username ? ' (@' + TG.esc(user.username) + ')' : ''} · id <code>${user.id}</code>\n📌 ${TG.esc(why.reason)} — warning ${warns}/${C.limit}${text ? `\n💬 “${TG.esc(str(text, 160))}”` : ''}`,
    { inline_keyboard: [[banned ? { text: '✅ Unban', callback_data: key } : { text: '🧹 Clear warnings', callback_data: `m:clear:${chat}_${user.id}` }]] });
  return { warns, banned };
}

async function unban(db, chat, uid) {
  await TG.call('restrictChatMember', { chat_id: chat, user_id: Number(uid), permissions: { can_send_messages: true, can_send_audios: true, can_send_documents: true, can_send_photos: true, can_send_videos: true, can_send_video_notes: true, can_send_voice_notes: true, can_send_polls: true, can_send_other_messages: true, can_add_web_page_previews: true } }).catch(() => {});
  await TG.call('unbanChatMember', { chat_id: chat, user_id: Number(uid), only_if_banned: true }).catch(() => {});
  await ref(db, chat, uid).set({ warns: 0, banned: false, unbannedAt: iso(), updatedAt: iso() }, { merge: true });
}
async function clear(db, chat, uid) { await ref(db, chat, uid).set({ warns: 0, updatedAt: iso() }, { merge: true }); }

// Unban / Clear buttons on the admin's Telegram (only linked admins can press them)
async function onButton(db, q) {
  const [, op, key] = String(q.data || '').split(':'); const [chat, uid] = String(key || '').split('_');
  const adm = await db().collection('tgAdmins').doc(String(q.from.id)).get();
  if (!adm.exists) return TG.call('answerCallbackQuery', { callback_query_id: q.id, text: 'Only linked admins can do this.', show_alert: true });
  if (op === 'unban') await unban(db, chat, uid); else await clear(db, chat, uid);
  await TG.call('answerCallbackQuery', { callback_query_id: q.id, text: op === 'unban' ? 'Unbanned ✓' : 'Warnings cleared ✓' });
  if (q.message) await TG.call('editMessageReplyMarkup', { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: op === 'unban' ? '✅ Unbanned' : '🧹 Cleared', callback_data: 'm:done:0_0' }]] } }).catch(() => {});
}

async function list(db) {
  const s = await db().collection('tgMod').get();
  const L = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return { banned: L.filter(x => x.banned), suspects: L.filter(x => !x.banned && Number(x.warns) > 0) };
}
module.exports = { DEF, cfg, check, warn, unban, clear, onButton, list, tellAdmins, nameOf };
