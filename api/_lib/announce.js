// Good-news announcements: a new service, item, task or bonus, or a service update / fix.
// One short message goes everywhere at once: an in-app notification, a phone push, the Telegram channel and a
// message from the bot. Unlike the daily reminder, these are NOT deleted at midnight.
// Only positive changes are announced; removing, hiding or editing a service never sends anything.
const TG = require('./tg');
const { sendPush } = require('./push');
const iso = (t = Date.now()) => new Date(t).toISOString();
const str = (v, n) => String(v ?? '').trim().slice(0, n);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// lines: [{ kind: 'new' | 'updated' | 'fixed' | 'bonus', text }]
async function announce(db, { lines, link = '/?go=extra', where = {} }) {
  const L = (Array.isArray(lines) ? lines : []).map(l => ({ kind: ['new', 'updated', 'fixed', 'bonus'].includes(l.kind) ? l.kind : 'new', text: str(l.text, 160) })).filter(l => l.text).slice(0, 8);
  if (!L.length) return { skipped: 'nothing to announce' };
  const W = { site: where.site !== false, push: where.push !== false, channel: where.channel !== false, bot: where.bot !== false };
  const icon = { new: '✨', updated: '🔄', fixed: '🛠️', bonus: '🎁' };
  const onlyFix = L.every(l => l.kind === 'fixed' || l.kind === 'updated');
  const title = onlyFix ? (L.some(l => l.kind === 'fixed') ? '🛠️ Service update & fix' : '🔄 Service updated') : L.some(l => l.kind === 'bonus') && L.length === 1 ? '🎁 New bonus on Creditfy' : '✨ New on Creditfy';
  const body = L.map(l => `${icon[l.kind]} ${l.text}`).join('\n');
  const out = { title, count: L.length };
  if (W.site) {
    try {
      await db().collection('broadcasts').add({ title, subject: L[0].text, message: body, type: 'success', from: 'announce', createdAt: iso(), buttonText: 'Open', buttonUrl: link });
      out.site = 'ok';
    } catch (e) { out.site = 'failed: ' + e.message; }
  }
  if (W.push) { try { await sendPush({ all: true }, { title, body: L.map(l => l.text).join(' · ').slice(0, 220), link, tag: 'cu-news-' + Date.now() }); out.push = 'ok'; } catch (e) { out.push = 'failed: ' + e.message; } }
  if (!TG.configured()) return out;
  const S = await TG.settings(db);
  const html = `<b>${TG.esc(title)}</b>\n\n${L.map(l => `${icon[l.kind]} ${TG.esc(l.text)}`).join('\n')}`;
  const appUrl = S.siteUrl + link;
  if (W.channel) {
    const chat = S.channel && TG.chatId(S.channel);
    if (chat) { try { await TG.call('sendMessage', { chat_id: chat, text: html + (S.footer ? '\n\n' + TG.esc(S.footer) : ''), parse_mode: 'HTML', link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: [[{ text: '🚀 ' + S.button, url: appUrl }]] } }); out.channel = 'ok'; } catch (e) { out.channel = 'failed: ' + e.message; } }
    else out.channel = 'no channel set';
  }
  if (W.bot) {
    const chats = (await require('./daily').botChats(db)).slice(0, 1500);
    const kb = { inline_keyboard: [[S.miniApp ? { text: '📱 Open Creditfy', web_app: { url: appUrl } } : { text: '📱 Open Creditfy', url: appUrl }]] };
    let ok = 0;
    for (let i = 0; i < chats.length; i += 25) {
      await Promise.all(chats.slice(i, i + 25).map(c => TG.call('sendMessage', { chat_id: c, text: html, parse_mode: 'HTML', reply_markup: kb, link_preview_options: { is_disabled: true } }).then(() => ok++).catch(() => {})));
      if (i + 25 < chats.length) await sleep(1100);
    }
    out.bot = { sent: ok, total: chats.length };
  }
  return out;
}
module.exports = { announce };
