// Telegram: channel auto-posts, community group (welcome, rules, link filter), the bot (commands, personal
// notifications, account linking) and the Mini App (the site inside Telegram).
// The bot token lives only in the Vercel env TELEGRAM_BOT_TOKEN — never in code or Firestore.
// Settings (channel, group, what to post…): siteConfig/app → telegram (Admin → Telegram).
const crypto = require('crypto');

const TOKEN = () => String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
const configured = () => /^\d+:[\w-]{30,}$/.test(TOKEN());
// the webhook secret is derived from the token, so no second secret is needed
const hookSecret = () => crypto.createHash('sha256').update('creditfy-tg-hook:' + TOKEN()).digest('hex').slice(0, 48);
const iso = (t = Date.now()) => new Date(t).toISOString();
const esc = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const str = (v, n = 300) => String(v ?? '').trim().slice(0, n);

const DEF = {
  on: true, channel: '', channelLink: '', group: '', groupLink: '', botUsername: '', appLink: '', siteUrl: 'https://www.creditfy.online',
  footer: '🌐 creditfy.online', button: 'Open Creditfy',
  auto: { broadcast: true, offers: true, deals: true, tasks: true, services: true },
  dm: true, miniApp: true,
  welcome: { on: true, text: 'Welcome to the Creditfy community, {name}! 👋\nAsk anything about loans and our services here. Please read the rules below.', deleteJoin: true },
  rules: '1. Be respectful.\n2. No spam, ads or outside links.\n3. Never share your PIN, OTP or password — our team will never ask for it.\n4. For account issues, message the support inside the app.',
  mod: { links: true, words: [] }
};
function norm(t) {
  t = t || {};
  return {
    ...DEF, ...t,
    channel: str(t.channel, 80), group: str(t.group, 80), channelLink: str(t.channelLink, 200), groupLink: str(t.groupLink, 200), botUsername: str(t.botUsername, 64).replace(/^@/, ''),
    appLink: str(t.appLink, 200), siteUrl: /^https:\/\//.test(String(t.siteUrl || '')) ? str(t.siteUrl, 200).replace(/\/+$/, '') : DEF.siteUrl,
    footer: str(t.footer ?? DEF.footer, 120), button: str(t.button || DEF.button, 30),
    auto: { ...DEF.auto, ...(t.auto || {}) }, welcome: { ...DEF.welcome, ...(t.welcome || {}) }, rules: str(t.rules ?? DEF.rules, 1500),
    mod: { links: (t.mod || {}).links !== false, words: (Array.isArray((t.mod || {}).words) ? t.mod.words : []).map(w => str(w, 40).toLowerCase()).filter(Boolean).slice(0, 100) },
    on: t.on !== false, dm: t.dm !== false, miniApp: t.miniApp !== false
  };
}
async function settings(db) { try { const s = await db().collection('siteConfig').doc('app').get(); return norm(s.exists ? s.data().telegram : null); } catch (e) { return norm(null); } }

async function call(method, body) {
  if (!configured()) throw Object.assign(new Error('Telegram is not connected yet: add TELEGRAM_BOT_TOKEN in Vercel → Settings → Environment Variables, then redeploy.'), { status: 400, code: 'tg_not_configured' });
  const r = await fetch(`https://api.telegram.org/bot${TOKEN()}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw Object.assign(new Error('Telegram: ' + (j.description || 'request failed')), { status: 400 });
  return j.result;
}
const chatId = c => { c = String(c || '').trim(); if (!c) return ''; if (/^-?\d+$/.test(c)) return c; const m = /t\.me\/([\w]+)/.exec(c); return '@' + (m ? m[1] : c.replace(/^@/, '')); };
const appUrl = S => S.appLink || S.siteUrl;

// a post: bold title, text, footer, and buttons (the post's own button + "Open Creditfy")
function compose(S, p) {
  const text = [p.title ? `<b>${esc(p.title)}</b>` : '', esc(p.text || ''), S.footer ? esc(S.footer) : ''].filter(Boolean).join('\n\n').slice(0, 3900);
  const rows = [];
  if (p.button && p.button.text && /^https:\/\//.test(p.button.url || '')) rows.push([{ text: str(p.button.text, 40), url: p.button.url }]);
  rows.push([{ text: '🚀 ' + S.button, url: appUrl(S) }]);
  return { text, reply_markup: { inline_keyboard: rows } };
}
async function sendTo(chat, S, p) {
  const m = compose(S, p);
  if (p.image && /^https:\/\//.test(p.image)) {
    if (m.text.length <= 1000) return call('sendPhoto', { chat_id: chat, photo: p.image, caption: m.text, parse_mode: 'HTML', reply_markup: m.reply_markup });
    await call('sendPhoto', { chat_id: chat, photo: p.image });
  }
  return call('sendMessage', { chat_id: chat, text: m.text, parse_mode: 'HTML', reply_markup: m.reply_markup, link_preview_options: { is_disabled: true } });
}
// post to the channel (and the group if asked); kind = which auto switch it belongs to ('' = always)
async function publish(db, p, kind) {
  const S = await settings(db);
  if (!S.on || !configured()) return { sent: 0, skipped: 'off' };
  if (kind && S.auto[kind] === false) return { sent: 0, skipped: kind };
  const out = []; let sent = 0;
  const targets = [];
  if (p.to !== 'group' && S.channel) targets.push(['channel', chatId(S.channel)]);
  if ((p.to === 'group' || p.to === 'both') && S.group) targets.push(['group', chatId(S.group)]);
  for (const [where, chat] of targets) {
    try { const m = await sendTo(chat, S, p); sent++; if (p.pin) await call('pinChatMessage', { chat_id: chat, message_id: m.message_id, disable_notification: true }).catch(() => {}); out.push({ where, ok: true, id: m.message_id }); }
    catch (e) { out.push({ where, ok: false, error: e.message }); }
  }
  try { await db().collection('tgPosts').add({ kind: kind || 'manual', title: str(p.title, 120), text: str(p.text, 600), image: str(p.image, 300), result: out, at: iso() }); } catch (e) {}
  return { sent, out };
}
// a personal message from the bot to a linked user (mirrors the in-app notifications)
async function dm(db, uid, title, message) {
  try {
    if (!configured()) return;
    const S = await settings(db); if (!S.on || !S.dm) return;
    const u = await db().collection('users').doc(String(uid)).get();
    const c = u.exists && u.data().tgChatId; if (!c) return;
    await call('sendMessage', { chat_id: c, text: `<b>${esc(title)}</b>\n${esc(message)}`, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[S.miniApp ? { text: '📱 Open Creditfy', web_app: { url: S.siteUrl } } : { text: '📱 Open Creditfy', url: appUrl(S) }]] } });
  } catch (e) { console.warn('tg dm', e.message); }
}
// Mini App: check the signed initData Telegram gives the page (the bot token is the key)
function verifyInitData(initData, maxAgeSec = 86400) {
  if (!configured() || !initData) return null;
  const p = new URLSearchParams(String(initData)); const hash = p.get('hash'); if (!hash) return null;
  p.delete('hash');
  const data = [...p.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(TOKEN()).digest();
  const calc = crypto.createHmac('sha256', secret).update(data).digest('hex');
  if (calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
  if (Date.now() / 1000 - Number(p.get('auth_date') || 0) > maxAgeSec) return null;
  try { return JSON.parse(p.get('user') || 'null'); } catch (e) { return null; }
}

module.exports = { DEF, norm, settings, call, publish, dm, verifyInitData, configured, hookSecret, chatId, compose, esc, appUrl, TOKEN };

// account actions (admin + user), merged into /api/account
module.exports.actions = function ({ db, isAdmin, adminCan, findUserDoc }) {
  const admin = async (user, secs = ['appset']) => {
    if (!user || !(await isAdmin(user.uid))) return [403, { error: 'Admin login required.' }];
    if (!(await adminCan(user, secs))) return [403, { error: 'Your admin role does not allow this.' }];
    return null;
  };
  const wrapE = fn => async (b, user) => { try { return await fn(b, user); } catch (e) { if (e.status) return [e.status, { error: e.message, ...(e.code ? { code: e.code } : {}) }]; throw e; } };
  return {
    // what is connected: the bot, the webhook, and whether the bot is an admin of the channel / group
    adminTgStatus: wrapE(async (b, user) => {
      const no = await admin(user); if (no) return no;
      if (!configured()) return [200, { configured: false }];
      const S = await settings(db);
      const me = await call('getMe');
      const hook = await call('getWebhookInfo').catch(() => ({}));
      const check = async c => { if (!c) return null; try { const chat = await call('getChat', { chat_id: chatId(c) }); const m = await call('getChatMember', { chat_id: chat.id, user_id: me.id }).catch(() => ({})); const n = await call('getChatMemberCount', { chat_id: chat.id }).catch(() => null);
        return { ok: true, title: chat.title, username: chat.username || '', id: chat.id, type: chat.type, admin: ['administrator', 'creator'].includes(m.status), canPost: m.can_post_messages !== false, canDelete: !!m.can_delete_messages, members: n }; } catch (e) { return { ok: false, error: e.message }; } };
      const [channel, group] = await Promise.all([check(S.channel), check(S.group)]);
      const site = S.siteUrl;
      return [200, { configured: true, bot: { id: me.id, username: me.username, name: me.first_name }, webhook: { url: hook.url || '', ok: (hook.url || '') === site + '/api/telegram', pending: hook.pending_update_count || 0, error: hook.last_error_message || '' }, channel, group }];
    }),
    // one-tap setup: webhook, commands, the "Open app" menu button, bot descriptions
    adminTgSetup: wrapE(async (b, user) => {
      const no = await admin(user); if (no) return no;
      const S = await settings(db);
      const me = await call('getMe');
      await call('setWebhook', { url: S.siteUrl + '/api/telegram', secret_token: hookSecret(), allowed_updates: ['message', 'callback_query', 'chat_member', 'my_chat_member'], drop_pending_updates: true });
      const cmds = [{ command: 'start', description: 'Open Creditfy & connect your account' }, { command: 'offers', description: 'Today’s offers and deals' }, { command: 'balance', description: 'Your Creditfy & Extra Balance' },
        { command: 'app', description: 'Open the Creditfy app' }, { command: 'rules', description: 'Community rules' }, { command: 'help', description: 'Help' }];
      await call('setMyCommands', { commands: cmds });
      await call('setMyCommands', { commands: cmds.filter(c => ['offers', 'app', 'rules', 'help'].includes(c.command)), scope: { type: 'all_group_chats' } });
      if (S.miniApp) await call('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Open app', web_app: { url: S.siteUrl } } });
      else await call('setChatMenuButton', { menu_button: { type: 'commands' } });
      await call('setMyShortDescription', { short_description: 'Creditfy — smart digital loans, offers & services. Open the app right here.' }).catch(() => {});
      await call('setMyDescription', { description: 'Creditfy official bot 🤝\n• Open the Creditfy app inside Telegram\n• Get your loan & order updates here\n• See today’s offers\nWe will never ask for your PIN, OTP or password.' }).catch(() => {});
      const ref = db().collection('siteConfig').doc('app');
      await ref.update({ 'telegram.botUsername': me.username }).catch(() => ref.set({ telegram: { botUsername: me.username } }, { merge: true }));
      return [200, { ok: true, bot: me.username, webhook: S.siteUrl + '/api/telegram' }];
    }),
    adminTgPost: wrapE(async (b, user) => {
      const no = await admin(user, ['appset', 'broadcast']); if (no) return no;
      const p = { title: str(b.title, 120), text: str(b.text, 3500), image: str(b.image, 500), to: ['channel', 'group', 'both'].includes(b.to) ? b.to : 'channel', pin: b.pin === true,
        button: b.buttonText && b.buttonUrl ? { text: str(b.buttonText, 40), url: str(b.buttonUrl, 300) } : null };
      if (!p.title && !p.text) return [400, { error: 'Write a title or a message.' }];
      const kind = ['broadcast', 'offers', 'deals', 'tasks', 'services'].includes(b.kind) ? b.kind : '';
      const r = await publish(db, p, kind);
      return [200, { ok: true, ...r }];
    }),
    adminTgPosts: wrapE(async (b, user) => {
      const no = await admin(user); if (no) return no;
      const s = await db().collection('tgPosts').orderBy('at', 'desc').limit(30).get();
      return [200, { list: s.docs.map(x => ({ id: x.id, ...x.data() })) }];
    }),
    // user: the Telegram card (links, connected or not, a one-time link code)
    tgState: async (b, user) => {
      const S = await settings(db);
      const pub = { on: S.on && configured(), channelLink: S.channelLink, groupLink: S.groupLink, bot: S.botUsername, dm: S.dm };
      if (!user) return [200, pub];
      const d = await findUserDoc(user.uid); const u = d ? d.data() || {} : {};
      return [200, { ...pub, linked: !!u.tgChatId, tgName: u.tgName || '' }];
    },
    tgLinkStart: async (b, user) => {
      if (!user) return [401, { error: 'Please login again.' }];
      const S = await settings(db);
      if (!configured() || !S.botUsername) return [400, { error: 'Telegram is not set up yet.' }];
      const code = crypto.randomBytes(9).toString('base64url');
      await db().collection('tgLinks').doc(code).set({ uid: user.uid, exp: Date.now() + 15 * 60e3 });
      return [200, { url: `https://t.me/${S.botUsername}?start=L${code}` }];
    },
    // inside the Mini App: link with Telegram's signed data, no code needed
    tgLinkWebApp: async (b, user) => {
      if (!user) return [401, { error: 'Please login again.' }];
      const t = verifyInitData(b.initData); if (!t || !t.id) return [400, { error: 'Could not verify Telegram.' }];
      const d = await findUserDoc(user.uid); if (!d) return [404, { error: 'Account not found.' }];
      await d.ref.update({ tgChatId: String(t.id), tgName: str([t.first_name, t.last_name].filter(Boolean).join(' ') || t.username, 60), tgUser: str(t.username, 40), tgLinkedAt: iso() });
      return [200, { ok: true }];
    },
    tgUnlink: async (b, user) => {
      if (!user) return [401, { error: 'Please login again.' }];
      const d = await findUserDoc(user.uid); if (!d) return [404, { error: 'Account not found.' }];
      await d.ref.update({ tgChatId: '', tgName: '', tgUser: '' });
      return [200, { ok: true }];
    }
  };
};
