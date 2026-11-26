/* Creditfy admin — Telegram: connection status and one-tap setup, settings (channel, group, what is posted
   automatically, welcome & rules, link filter, Mini App, personal updates), a post composer with templates,
   and the latest posts. Settings live in siteConfig/app → telegram. The bot token is only in Vercel. */

(function(){
  const css = `
.tg-st{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px}
.tg-k{border-radius:12px;border:1px solid var(--border);background:var(--card);padding:12px;font-size:12.5px}
.tg-k b{display:block;font-size:14px;margin-bottom:3px}.tg-k small{color:var(--txt2);display:block;line-height:1.5}
.tg-k .ok{color:var(--p)}.tg-k .no{color:var(--red,#ff4d6a)}.tg-k .wn{color:var(--orange,#ff8c42)}
.tg-tpl{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.tg-tpl button{border-radius:9px;padding:6px 11px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--txt);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
.tg-prev{border-radius:14px;background:#17212b;color:#f5f5f5;padding:12px 14px;font-size:13px;line-height:1.5;white-space:pre-wrap;max-width:420px;border:1px solid #233140}
.tg-prev b{font-weight:800}.tg-prev .btn2{display:block;margin-top:8px;text-align:center;border-radius:8px;background:#2b5278;padding:7px;font-weight:700;font-size:12.5px}
.tg-post{display:grid;grid-template-columns:1fr auto;gap:8px;padding:9px 10px;border-radius:10px;border:1px solid var(--border);margin-bottom:6px;font-size:12.5px}
.tg-post small{color:var(--txt2)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();

const TGD = { on: true, channel: '', channelLink: '', group: '', groupLink: '', siteUrl: 'https://www.creditfy.online', appLink: '', footer: '🌐 creditfy.online', button: 'Open Creditfy',
  auto: { broadcast: true, offers: true, deals: true, tasks: true, services: true }, dm: true, miniApp: true,
  welcome: { on: true, text: 'Welcome to the Creditfy community, {name}! 👋\nAsk anything about loans and our services here. Please read the rules below.', deleteJoin: true },
  rules: '1. Be respectful.\n2. No spam, ads or outside links.\n3. Never share your PIN, OTP or password — our team will never ask for it.\n4. For account issues, message the support inside the app.',
  mod: { links: true, words: [] } };
let _TG = clone(TGD);

function buildTg(){
  const s = $p('sec-telegram'); if(!s || s.dataset.built) return; s.dataset.built = 1;
  s.innerHTML = `<div class="sec-head"><h2>Telegram</h2>${svBtn('telegram')}</div>${roBanner}
  ${proTabs('telegram', [['conn', 'plug', 'Connection'], ['post', 'paper-plane', 'Post to channel'], ['auto', 'bolt', 'Auto posts'], ['group', 'comments', 'Group & bot'], ['alerts', 'bell', 'Admin alerts'], ['daily', 'sun', 'Daily reminder'], ['sched', 'calendar-days', 'Scheduled posts'], ['log', 'clock-rotate-left', 'Recent posts']], 'conn')}
  <div class="pro-pane" data-k="conn">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-plug"></i>Status <button class="btn btn-sm btn-s ro-ok" style="margin-left:auto" onclick="tgStatus()"><i class="fa-solid fa-rotate-right"></i>Check</button></div><div id="tgStatus" class="hint">Checking…</div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-list-check"></i>How to connect (one time)</div>
      <div class="hint" style="line-height:1.8">1. In Telegram open <b>@BotFather</b> → /newbot → choose a name and a username ending in “bot”. BotFather gives you a <b>token</b>.<br>
      2. <b>Do not paste the token here or in any chat.</b> Put it in Vercel → your project → Settings → Environment Variables as <code>TELEGRAM_BOT_TOKEN</code>, then Redeploy.<br>
      3. Add the bot to your <b>channel</b> and your <b>group</b> as an <b>admin</b> (channel: “Post messages”; group: “Delete messages”, “Pin messages”).<br>
      4. Fill in the channel and group below, press <b>Save changes</b>, then <b>Set up the bot</b>. Status should show everything green.<br>
      5. Mini App (optional): in @BotFather → /newapp (or Bot Settings → Menu Button) use your site link. The bot's “Open app” button is set up for you by step 4.</div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-gear"></i>Channel &amp; group</div>
      <div class="fgrid">${tog('tg-on', 'Telegram on', true)}${inp('tg-site', 'Site link (used for the bot and buttons)', 'https://www.creditfy.online')}
        ${inp('tg-channel', 'Channel — @username or ID (-100…)', '@creditfy')}${inp('tg-channelLink', 'Channel invite link (shown to users)', 'https://t.me/creditfy')}
        ${inp('tg-group', 'Group — @username or ID (-100…)', '@creditfy_community')}${inp('tg-groupLink', 'Group invite link (shown to users)', 'https://t.me/creditfy_community')}
        ${inp('tg-appLink', 'Mini App link (optional, e.g. https://t.me/YourBot/app)', '')}${inp('tg-button', 'Button text on posts', 'Open Creditfy')}${inp('tg-footer', 'Footer on every post', '🌐 creditfy.online', 'full')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-p ro-ok" onclick="tgSetup()"><i class="fa-solid fa-wand-magic-sparkles"></i>Set up the bot</button><span class="hint" style="align-self:center">Sets the webhook, the commands (/offers, /balance, /app, /rules), the “Open app” menu button and the bot description.</span></div></div>
  </div>
  <div class="pro-pane" data-k="post">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-paper-plane"></i>Write a post</div>
      <div class="tg-tpl"><button onclick="tgTpl('news')">📰 News</button><button onclick="tgTpl('feature')">🚀 New feature</button><button onclick="tgTpl('offer')">🔥 Offer</button><button onclick="tgTpl('update')">🛠 Update</button><button onclick="tgTpl('maint')">⏳ Maintenance</button><button onclick="tgTpl('tips')">💡 Tip</button></div>
      <div class="fgrid">${inp('tp-title', 'Title', '🚀 New on Creditfy', 'full')}${area('tp-text', 'Message', '', 5)}${inp('tp-image', 'Image link (optional, https://…)', '')}
        <div class="fg"><label>Send to</label><select id="tp-to"><option value="channel">Channel</option><option value="group">Group</option><option value="both">Channel + group</option></select></div>
        ${inp('tp-bt', 'Button text (optional)', 'Learn more')}${inp('tp-bl', 'Button link (optional, https://…)', '')}${tog('tp-pin', 'Pin it', false)}</div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:14px;align-items:start;margin-top:10px"><div><span class="hint">Preview</span><div class="tg-prev" id="tpPrev"></div></div>
        <button class="btn btn-p ro-ok" onclick="tgSend()"><i class="fa-brands fa-telegram"></i>Post now</button></div></div>
  </div>
  <div class="pro-pane" data-k="auto">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-bolt"></i>Post automatically to the channel</div>
      <div class="fgrid">${tog('ta-broadcast', 'Broadcasts to all users (Broadcast page)', true)}${tog('ta-offers', 'New offers &amp; weekday deals (Digital services)', true)}${tog('ta-deals', 'Every morning: today’s deals / Red Friday is live (12:05am)', true)}
        ${tog('ta-tasks', 'New micro jobs', true)}${tog('ta-services', 'New Digital services', true)}</div>
      <div class="hint">Offers, deals, micro jobs and new services are posted when you press Save on Services &amp; Rewards. Broadcasts have their own “Also post to Telegram” switch.</div></div>
  </div>
  <div class="pro-pane" data-k="group">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-comments"></i>Community group</div>
      <div class="fgrid">${tog('tw-on', 'Welcome new members', true)}${tog('tw-del', 'Hide “joined / left” lines', true)}${area('tw-text', 'Welcome message ({name} = their name)', '', 3)}${area('tg-rules', 'Group rules (also /rules)', '', 4)}
        ${tog('tm-links', 'Delete links posted by members (admins can post links)', true)}${area('tm-words', 'Blocked words — one per line (message is deleted)', '', 3)}</div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-robot"></i>Bot &amp; Mini App</div>
      <div class="fgrid">${tog('tg-dm', 'Send each user’s notifications to their Telegram too (after they connect)', true)}${tog('tg-mini', '“Open app” button opens Creditfy inside Telegram (Mini App)', true)}</div>
      <div class="hint">Users connect in the app: Quick Services → Telegram → Connect (or automatically when they open Creditfy inside Telegram while logged in). Commands: /start, /offers, /balance, /app, /rules, /help.</div></div>
  </div>
  <div class="pro-pane" data-k="alerts">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-bell" style="color:#ffd76a"></i>Admin alerts on your Telegram</div>
      <div class="hint" style="margin-bottom:10px">Link your own Telegram to get every new payment and order the moment it arrives — with <b>Approve / Reject</b> buttons for Verified, VIP, deposits, Extra orders, recharges and micro jobs (loan fee and installment payments come as a notice; verify those in Transactions). After midnight you get a summary of the day. Every admin links their own Telegram; the buttons follow that admin's role. Send <b>/summary</b> to the bot any time.</div>
      <div class="fgrid fgrid3">${tog('aa-on', 'Admin alerts on', true)}${tog('aa-orders', 'New orders, deposits & job proofs (with buttons)', true)}${tog('aa-trx', 'New loan fee & installment payments', true)}${tog('aa-summary', 'Daily summary after midnight', true)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-p ro-ok" onclick="aaLink()"><i class="fa-brands fa-telegram"></i>Connect my Telegram</button><button class="btn btn-s ro-ok" onclick="aaSummary()"><i class="fa-solid fa-chart-column"></i>Send today’s summary now</button><button class="btn btn-sm btn-s ro-ok" onclick="aaLoad()"><i class="fa-solid fa-rotate-right"></i></button></div>
      <div id="aaList" style="margin-top:12px"></div></div>
  </div>
  <div class="pro-pane" data-k="daily">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-sun" style="color:#ffd76a"></i>Daily reminder — one message, everywhere, every morning at 9am (Bangladesh)</div>
      <div class="hint" style="margin-bottom:10px">Sent automatically by the daily 9am job, to all of these at the same time. Press <b>Save changes</b> after editing.</div>
      <div class="fgrid fgrid3">${tog('dr-on', 'Daily reminder on', true)}${tog('dr-site', 'In-app notification for every user (shows for 24 hours)', true)}${tog('dr-push', 'Phone push to every device', true)}
        ${tog('dr-channel', 'Post in the Telegram channel', true)}${tog('dr-bot', 'Message from the bot to everyone who started it / opened the Mini App', true)}${tog('dr-pin', 'Pin the channel post', false)}</div>
      <div class="cfg-t" style="margin-top:4px;font-size:13px"><i class="fa-solid fa-ticket" style="color:#ffd76a"></i>Today’s bonus code (inside the reminder)</div>
      <div class="fgrid fgrid3">${tog('dr-code', 'Add a new random redeem code every day', true)}${inp('dr-amt', 'Amount per user (৳, to the Creditfy balance)', '5', 'type="number" min="1"')}${inp('dr-max', 'Most people who can use it (0 = everyone)', '0', 'type="number" min="0"')}</div>
      <div class="hint" style="margin-bottom:10px">A code like <b>CF-7K3QX9</b> is made at 9am and added to the reminder (on Telegram, tapping it copies it). Users enter it in Quick Services → Redeem Code: the amount goes to their Creditfy balance, once per person. It stops working at midnight, and at midnight the reminder's in-app notification, channel post and bot messages are deleted. Redeem codes follow the “rewards are for Verified members” rule (Services &amp; Rewards).</div>
      <div id="drCode" class="hint" style="margin-bottom:10px"></div>
      <div class="fgrid">${inp('dr-title', 'Title', '☀️ Good morning from Creditfy', 'full')}${area('dr-text', 'Message (channel, bot and in-app)', '', 14)}${inp('dr-pushText', 'Short text for the phone push (max 230)', '', 'full maxlength="230"')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-s ro-ok" onclick="drReset()"><i class="fa-solid fa-rotate-left"></i>Use the default text</button>
        <button class="btn btn-s ro-ok" onclick="drSend(['channel'])"><i class="fa-brands fa-telegram"></i>Test: channel only</button><button class="btn btn-p ro-ok" onclick="drSend(null)"><i class="fa-solid fa-paper-plane"></i>Send to everyone now</button></div>
      <div id="drLast" class="hint" style="margin-top:10px"></div></div>
  </div>
  <div class="pro-pane" data-k="sched">
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-calendar-plus"></i><span id="scFormT">New scheduled post</span></div>
      <div class="tg-tpl"><button onclick="tgTpl('news','sc')">📰 News</button><button onclick="tgTpl('offer','sc')">🔥 Offer</button><button onclick="tgTpl('tips','sc')">💡 Tip</button><button onclick="tgTpl('feature','sc')">🚀 Feature</button></div>
      <div class="fgrid">${inp('sc-title', 'Title', '💡 Tip of the day', 'full')}${area('sc-text', 'Message', '', 4)}${inp('sc-image', 'Image link (optional, https://…)', '')}
        <div class="fg"><label>Send to</label><select id="sc-to"><option value="channel">Channel</option><option value="group">Group</option><option value="both">Channel + group</option></select></div>
        ${inp('sc-bt', 'Button text (optional)', 'Open offer')}${inp('sc-bl', 'Button link (optional, https://…)', '')}
        <div class="fg"><label>Repeat</label><select id="sc-rep" onchange="scRep()"><option value="daily">Every day</option><option value="days">On chosen days</option><option value="once">Once, on a date</option></select></div>
        <div class="fg"><label>Time (Bangladesh)</label><input id="sc-time" type="time" value="10:00" style="color-scheme:dark"></div>
        <div class="fg full" id="sc-daysW" style="display:none"><label>Days</label><div id="sc-days" style="display:flex;gap:6px;flex-wrap:wrap">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, n) => `<label style="display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:8px;border:1px solid var(--border);font-size:12.5px"><input type="checkbox" value="${n}">${d}</label>`).join('')}</div></div>
        <div class="fg" id="sc-dateW" style="display:none"><label>Date</label><input id="sc-date" type="date" style="color-scheme:dark"></div>
        ${tog('sc-pin', 'Pin it', false)}</div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn btn-p ro-ok" onclick="scSave()"><i class="fa-solid fa-floppy-disk"></i><span id="scSaveL">Add to schedule</span></button><button class="btn btn-s ro-ok" id="scCancel" style="display:none" onclick="scReset()">Cancel</button></div>
      <div class="hint" style="margin-top:8px">Scheduled posts go out at the time you set (Bangladesh time). They run when people use the site (checked every few minutes) and twice a day by our server (12:05am and 9am), so on very quiet hours a post can go out a little later — never twice.</div></div>
    <div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-list"></i>Schedule <button class="btn btn-sm btn-s ro-ok" style="margin-left:auto" onclick="scRun()"><i class="fa-solid fa-play"></i>Run due posts now</button><button class="btn btn-sm btn-s ro-ok" onclick="scLoad()"><i class="fa-solid fa-rotate-right"></i></button></div><div id="scList" class="hint">Loading…</div></div>
  </div>
  <div class="pro-pane" data-k="log"><div class="cfg-blk"><div class="cfg-t"><i class="fa-solid fa-clock-rotate-left"></i>Recent posts <button class="btn btn-sm btn-s ro-ok" style="margin-left:auto" onclick="tgLog()"><i class="fa-solid fa-rotate-right"></i></button></div><div id="tgLog"></div></div></div>`;
  ['tp-title', 'tp-text', 'tp-bt', 'tp-bl'].forEach(id => { const e = $p(id); if(e) e.addEventListener('input', tgPrev); });
  // the post composer and the schedule form are not settings: they do not need “Save changes”
  s.querySelectorAll('[id^="tp-"],[id^="sc-"]').forEach(e => { e.dataset.nodirty = '1'; });
}

const TPL = {
  news: ['📰 Creditfy News', 'Here is what is new this week:\n\n• \n• \n\nThank you for being with Creditfy!'],
  feature: ['🚀 New feature: ', 'You can now … right in the app.\n\nHow to use it:\n1. Open Creditfy\n2. …\n\nUpdate the page (or reopen the app) to see it.'],
  offer: ['🔥 Special offer', 'For a limited time: …\n\nVerified & VIP members pay no service charge. Offer ends …'],
  update: ['🛠 App update', 'We improved:\n• \n• \n\nIf something looks old, reload the page once.'],
  maint: ['⏳ Short maintenance', 'Creditfy will be under maintenance on … from … to … (Bangladesh time). Your data and balance are safe. Thank you for your patience!'],
  tips: ['💡 Tip of the day', '…\n\n🔒 Remember: our team will never ask for your PIN, OTP or password.']
};
function tgTpl(k, f){ const [t, m] = TPL[k]; const P = f || 'tp'; $p(P + '-title').value = t; $p(P + '-text').value = m; if(!f) tgPrev(); }
function tgPrev(){
  const esc = x => String(x || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const p = $p('tpPrev'); if(!p) return;
  p.innerHTML = `${val('tp-title') ? `<b>${esc(val('tp-title'))}</b>\n\n` : ''}${esc($p('tp-text').value)}${val('tg-footer') ? `\n\n${esc(val('tg-footer'))}` : ''}${val('tp-bt') && val('tp-bl') ? `<span class="btn2">${esc(val('tp-bt'))}</span>` : ''}<span class="btn2">🚀 ${esc(val('tg-button') || 'Open Creditfy')}</span>`;
}
async function tgSend(){
  const d = { title: val('tp-title'), text: $p('tp-text').value.trim(), image: val('tp-image'), to: val('tp-to'), pin: chk('tp-pin'), buttonText: val('tp-bt'), buttonUrl: val('tp-bl') };
  if(!d.title && !d.text){ toast('Write a title or a message', 'w'); return; }
  if(d.image && !/^https:\/\//i.test(d.image)){ toast('The image link must start with https://', 'w'); return; }
  if(d.buttonUrl && !/^https:\/\//i.test(d.buttonUrl)){ toast('The button link must start with https://', 'w'); return; }
  showL(true); const r = await window._accountApi('adminTgPost', d); showL(false);
  if(!r.ok){ toast(r.data.error || 'Could not post', 'e'); return; }
  const bad = (r.data.out || []).filter(x => !x.ok);
  if(!r.data.sent){ toast(bad.length ? bad[0].error : 'Nothing was sent — check the channel / group and the bot\'s admin rights', 'e'); return; }
  await logAct(`Telegram post: "${d.title || d.text.slice(0, 40)}"`, 'broadcast', 'telegram');
  toast(`Posted on Telegram ✓${bad.length ? ' (' + bad.map(b => b.where + ': ' + b.error).join('; ') + ')' : ''}`); tgLog();
}
async function tgStatus(){
  const el = $p('tgStatus'); if(!el) return; el.innerHTML = 'Checking…';
  const r = await window._accountApi('adminTgStatus', {});
  if(!r.ok){ el.innerHTML = `<span style="color:var(--red)">${ep(r.data.error || 'Could not check')}</span>`; return; }
  const d = r.data;
  if(d.fixed) toast('Webhook address fixed automatically → ' + d.fixed);
  if(!d.configured){ el.innerHTML = '<div class="tg-st"><div class="tg-k"><b class="no">Bot not connected</b><small>Add <code>TELEGRAM_BOT_TOKEN</code> in Vercel → Settings → Environment Variables, then Redeploy. Steps are below.</small></div></div>'; return; }
  const chat = (c, name, need) => !c ? `<div class="tg-k"><b class="wn">${name}: not set</b><small>Fill it in below.</small></div>`
    : !c.ok ? `<div class="tg-k"><b class="no">${name}: not found</b><small>${ep(c.error)}<br>Check the @username / ID and that the bot was added.</small></div>`
    : `<div class="tg-k"><b class="${c.admin ? 'ok' : 'no'}">${name}: ${ep(c.title)}</b><small>${c.username ? '@' + ep(c.username) + ' · ' : ''}${c.members ? fa(c.members) + ' members · ' : ''}${c.admin ? 'bot is admin ✓' : '<span class="no">make the bot an admin</span>'}${need === 'del' && c.admin && !c.canDelete ? '<br><span class="wn">give it “Delete messages” for the link filter</span>' : ''}</small></div>`;
  el.innerHTML = `<div class="tg-st"><div class="tg-k"><b class="ok">Bot: @${ep(d.bot.username)}</b><small>${ep(d.bot.name)} · token OK</small></div>
    <div class="tg-k"><b class="${d.webhook.ok ? 'ok' : 'wn'}">Webhook: ${d.webhook.ok ? 'connected ✓' : 'not set up'}</b><small>${d.webhook.ok ? `Commands, the group and account linking work.<br><span style="word-break:break-all">${ep(d.webhook.url)}</span>${d.webhook.pending ? `<br><span class="wn">${d.webhook.pending} message(s) waiting — the bot is not getting them</span>` : ''}` : 'Press “Set up the bot”.'}${d.webhook.error ? '<br><span class="no">Last error' + (d.webhook.lastError ? ' (' + fd(d.webhook.lastError) + ')' : '') + ': ' + ep(d.webhook.error) + '</span><br><span class="wn">Press “Set up the bot” again.</span>' : ''}</small></div>
    ${chat(d.channel, 'Channel')}${chat(d.group, 'Group', 'del')}</div>`;
}
async function tgSetup(){
  if(window._isDirty && _isDirty('telegram')){ toast('Press Save changes first', 'w'); return; }
  showL(true); const r = await window._accountApi('adminTgSetup', {}); showL(false);
  if(!r.ok){ toast(r.data.error || 'Setup failed', 'e'); return; }
  await logAct(`Telegram bot @${r.data.bot} set up`, 'config', 'telegram');
  toast('Bot set up ✓ — @' + r.data.bot); tgStatus();
}
async function tgLog(){
  const el = $p('tgLog'); if(!el) return;
  const r = await window._accountApi('adminTgPosts', {});
  const L = r.ok ? r.data.list || [] : [];
  el.innerHTML = L.length ? L.map(p => `<div class="tg-post"><div><b>${ep(p.title || '(no title)')}</b><small> · ${ep(p.kind)} · ${fd(p.at)}</small><br><small>${ep(String(p.text || '').slice(0, 140))}</small></div>
    <div style="text-align:right">${(p.result || []).map(x => `<small style="color:${x.deleted ? 'var(--txt2)' : x.ok ? 'var(--p)' : 'var(--red)'}">${ep(x.where)} ${x.deleted ? 'deleted' : x.ok ? '✓' : '✗ ' + ep(x.error || '')}</small>`).join('<br>') || '<small>not sent</small>'}
      <div style="margin-top:6px;display:flex;gap:5px;justify-content:flex-end">${(p.result || []).some(x => x.ok && !x.deleted) ? `<button class="btn btn-sm btn-d ro-ok" title="Delete it from the channel / group" onclick="tgDel('${ep(p.id)}',true)"><i class="fa-brands fa-telegram"></i>Delete post</button>` : ''}<button class="btn btn-sm btn-s ro-ok" title="Remove from this list only" onclick="tgDel('${ep(p.id)}',false)"><i class="fa-solid fa-xmark"></i></button></div></div></div>`).join('') : '<div class="hint">No posts yet.</div>';
}
function tgDel(id, tg){
  confirm2(tg ? 'Delete this post from the Telegram channel / group too? (Telegram may not allow deleting posts older than 48 hours — then delete it by hand in Telegram.)' : 'Remove this post from the list? It stays on Telegram.', async () => {
    showL(true); const r = await window._accountApi('adminTgDelete', { id, fromTelegram: tg, fromList: true }); showL(false);
    if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; }
    if(r.data.errors && r.data.errors.length){ toast('Could not delete: ' + r.data.errors.join('; '), 'e'); }
    else { toast(tg ? 'Deleted from Telegram ✓' : 'Removed from the list'); await logAct(`Telegram post ${tg ? 'deleted' : 'removed from list'}`, 'broadcast', id); }
    tgLog();
  });
}

/* ═════════ scheduled posts ═════════ */
let _SC = [], _scEdit = '';
const SC_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function scRep(){ const r = val('sc-rep'); $p('sc-daysW').style.display = r === 'days' ? '' : 'none'; $p('sc-dateW').style.display = r === 'once' ? '' : 'none'; }
function scReset(){ _scEdit = ''; ['sc-title', 'sc-text', 'sc-image', 'sc-bt', 'sc-bl', 'sc-date'].forEach(id => { const e = $p(id); if(e) e.value = ''; }); $p('sc-time').value = '10:00'; $p('sc-rep').value = 'daily'; $p('sc-to').value = 'channel'; $p('sc-pin').checked = false;
  document.querySelectorAll('#sc-days input').forEach(c => c.checked = false); scRep(); $p('scFormT').textContent = 'New scheduled post'; $p('scSaveL').textContent = 'Add to schedule'; $p('scCancel').style.display = 'none'; }
async function scSave(){
  const item = { id: _scEdit || undefined, title: val('sc-title'), text: $p('sc-text').value.trim(), image: val('sc-image'), to: val('sc-to'), pin: chk('sc-pin'), buttonText: val('sc-bt'), buttonUrl: val('sc-bl'),
    repeat: val('sc-rep'), days: [...document.querySelectorAll('#sc-days input:checked')].map(c => Number(c.value)), date: val('sc-date'), time: val('sc-time'), on: true };
  if(item.image && !/^https:\/\//i.test(item.image)){ toast('The image link must start with https://', 'w'); return; }
  if(item.buttonUrl && !/^https:\/\//i.test(item.buttonUrl)){ toast('The button link must start with https://', 'w'); return; }
  showL(true); const r = await window._accountApi('adminTgSchedule', { op: 'save', item }); showL(false);
  if(!r.ok){ toast(r.data.error || 'Could not save', 'e'); return; }
  await logAct(`Telegram scheduled post ${_scEdit ? 'updated' : 'added'}: "${item.title || item.text.slice(0, 40)}"`, 'broadcast', 'telegram');
  toast(_scEdit ? 'Schedule updated ✓' : 'Added to schedule ✓'); scReset(); scLoad();
}
const scWhen = x => x.repeat === 'daily' ? `Every day · ${x.time}` : x.repeat === 'days' ? `${(x.days || []).map(n => SC_WD[n]).join(', ')} · ${x.time}` : `Once · ${x.date} ${x.time}`;
async function scLoad(){
  const el = $p('scList'); if(!el) return;
  const r = await window._accountApi('adminTgSchedule', { op: 'list' }); _SC = r.ok ? r.data.list || [] : [];
  el.className = ''; el.innerHTML = _SC.length ? _SC.map(x => `<div class="tg-post" style="${x.on === false ? 'opacity:.55' : ''}"><div><b>${ep(x.title || '(no title)')}</b><small> · <i class="fa-regular fa-clock"></i> ${ep(scWhen(x))} · ${ep(x.to)}${x.pin ? ' · pinned' : ''}</small><br><small>${ep(String(x.text || '').slice(0, 140))}</small>
      ${x.lastAt ? `<br><small>Last: ${fd(x.lastAt)} — <span style="color:${String(x.lastResult || '').startsWith('sent') ? 'var(--p)' : 'var(--red)'}">${ep(x.lastResult || '')}</span></small>` : ''}</div>
    <div style="display:flex;gap:5px;align-items:flex-start"><label class="tog" title="On / off"><input type="checkbox" ${x.on !== false ? 'checked' : ''} onchange="scToggle('${ep(x.id)}',this.checked)"><span class="tog-sl"></span></label>
      <button class="btn btn-sm btn-s ro-ok" onclick="scEdit('${ep(x.id)}')"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-d ro-ok" onclick="scDel('${ep(x.id)}')"><i class="fa-solid fa-trash"></i></button></div></div>`).join('')
    : '<div class="hint">Nothing scheduled yet. Add a post above — e.g. a tip every morning or an offer every Friday.</div>';
}
function scEdit(id){ const x = _SC.find(y => y.id === id); if(!x) return; _scEdit = id;
  fillIn({ 'sc-title': x.title, 'sc-text': x.text, 'sc-image': x.image, 'sc-to': x.to || 'channel', 'sc-bt': x.buttonText, 'sc-bl': x.buttonUrl, 'sc-rep': x.repeat, 'sc-time': x.time, 'sc-date': x.date, 'sc-pin': x.pin === true });
  document.querySelectorAll('#sc-days input').forEach(c => c.checked = (x.days || []).includes(Number(c.value))); scRep();
  $p('scFormT').textContent = 'Edit scheduled post'; $p('scSaveL').textContent = 'Save changes'; $p('scCancel').style.display = ''; $p('sc-title').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
async function scToggle(id, on){ const r = await window._accountApi('adminTgSchedule', { op: 'toggle', id, on }); if(!r.ok) toast(r.data.error || 'Failed', 'e'); else toast(on ? 'Schedule on' : 'Schedule paused'); scLoad(); }
function scDel(id){ confirm2('Delete this scheduled post? (Posts already sent stay on Telegram.)', async () => { const r = await window._accountApi('adminTgSchedule', { op: 'delete', id }); if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; } await logAct('Telegram scheduled post deleted', 'broadcast', id); toast('Deleted'); scLoad(); }); }
async function scRun(){ showL(true); const r = await window._accountApi('adminTgSchedule', { op: 'run' }); showL(false); if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; } toast(r.data.ran ? `Posted ${r.data.ran} due post${r.data.ran > 1 ? 's' : ''} ✓` : 'Nothing is due right now'); scLoad(); tgLog(); }

/* ═════════ admin alerts ═════════ */
async function aaLoad(){
  const el = $p('aaList'); if(!el) return;
  const r = await window._accountApi('adminTgAdmins', { op: 'list' }); const L = r.ok ? r.data.list || [] : [];
  el.innerHTML = L.length ? L.map(a => `<div class="tg-post"><div><b>${ep(a.name || 'Admin')}</b>${a.username ? ` <small>@${ep(a.username)}</small>` : ''}${a.mine ? ' <small style="color:var(--p)">· you</small>' : ''}<br><small>Linked ${fd(a.at)}</small></div><button class="btn btn-sm btn-d ro-ok" onclick="aaUnlink('${ep(a.chat)}')">Unlink</button></div>`).join('') : '<div class="hint">No admin Telegram linked yet.</div>';
}
async function aaLink(){
  const r = await window._accountApi('adminTgLink', {});
  if(!r.ok){ toast(r.data.error || 'Could not make a link', 'e'); return; }
  window.open(r.data.url, '_blank');
  toast('Telegram opened — press Start there (the link works for 15 minutes)'); setTimeout(aaLoad, 12000);
}
function aaUnlink(chat){ confirm2('Stop admin alerts for this Telegram?', async () => { const r = await window._accountApi('adminTgAdmins', { op: 'unlink', chat }); if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; } toast('Unlinked'); aaLoad(); }); }
async function aaSummary(){ showL(true); const r = await window._accountApi('adminTgAdmins', { op: 'summary' }); showL(false); if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; } toast(r.data.sent ? `Summary sent to ${r.data.sent} admin${r.data.sent > 1 ? 's' : ''} ✓` : 'No admin Telegram linked (or alerts are off)'); }

/* ═════════ daily reminder ═════════ */
const DR_DEF = { title: '☀️ Good morning from Creditfy', pushText: 'Loans are running smoothly ✅ Recharge, gift cards, exchange & more in Digital Services. Invite friends for bigger offers, get Verified and try VIP.',
  text: `✅ Loans are running smoothly — applications are reviewed and processed every day, and you can follow every step in the app.

🛍️ Digital Services, all in one place:
• 📱 Mobile recharge for every operator
• 🎁 Gift cards — Google Play, iTunes, Steam
• 💱 Currency & MFS exchange (bKash ⇄ Nagad ⇄ Rocket)
• 📣 SMM & Telegram Premium
• 💳 Virtual cards & gift vouchers
• 💼 Micro jobs — earn by doing simple tasks
• 🎮 Play & Earn, daily check-in and Spin & Win

🎁 Bonus & referrals: share your invite link — the more friends join, the bigger the offers you can unlock.

✔️ Get Verified today for a smoother review, full access to every service and no service charge on Digital Services.

👑 Need it sooner? VIP applications are reviewed first.

Open Creditfy and make the most of it today 👇` };
function drReset(){ fillIn({ 'dr-title': DR_DEF.title, 'dr-text': DR_DEF.text, 'dr-pushText': DR_DEF.pushText }); markDirty('telegram', 'daily'); }
async function drLast(){
  const el = $p('drLast'); if(!el) return;
  const r = await window._accountApi('adminDaily', { op: 'status' }); if(!r.ok){ el.textContent = ''; return; }
  const L = r.data.last && r.data.last.last, f = x => typeof x === 'object' && x ? (x.sent !== undefined ? `${x.sent} sent${x.failed ? ', ' + x.failed + ' failed' : ''}${x.total !== undefined ? ' of ' + x.total : ''}` : JSON.stringify(x)) : (x || '—');
  const c = r.data.code, ce = $p('drCode');
  if(ce) ce.innerHTML = c && c.code ? `Today’s code: <b style="font-family:monospace;font-size:14px;color:#ffd76a">${ep(c.code)}</b> = ৳${fa(c.amount)} · used by <b>${fa(c.uses || 0)}</b> · ${c.live ? '<span style="color:var(--p)">active until midnight</span>' : '<span style="color:var(--txt2)">expired</span>'}` : 'No code yet today — it is made with the 9am reminder (or “Send to everyone now”).';
  el.innerHTML = `Bot audience: <b>${fa(r.data.botUsers)}</b> people.` + (L ? `<br>Last sent ${ep(L.day || '')}: in-app <b>${ep(f(L.site))}</b> · push <b>${ep(f(L.push))}</b> · channel <b>${ep(f(L.channel))}</b> · bot <b>${ep(f(L.bot))}</b>` : '<br>Not sent yet.');
}
async function drSend(only){
  if(window._isDirty && _isDirty('telegram')){ toast('Press Save changes first', 'w'); return; }
  confirm2(only ? 'Post today\'s reminder in the channel now (test)?' : 'Send today\'s reminder now to everyone — in-app notification, phone push, Telegram channel and all bot users?', async () => {
    showL(true); const r = await window._accountApi('adminDaily', { op: 'send', only }); showL(false);
    if(!r.ok){ toast(r.data.error || 'Failed', 'e'); return; }
    await logAct(`Daily reminder sent now${only ? ' (' + only.join(', ') + ')' : ''}`, 'broadcast', 'daily');
    toast('Reminder sent ✓'); drLast(); tgLog();
  });
}

async function loadTg(){
  buildTg();
  const d = (await window._getDoc('siteConfig', 'app')) || {}; const t = d.telegram || {};
  _TG = { ...clone(TGD), ...t, auto: { ...TGD.auto, ...(t.auto || {}) }, welcome: { ...TGD.welcome, ...(t.welcome || {}) }, mod: { ...TGD.mod, ...(t.mod || {}) } };
  fillIn({ 'tg-on': _TG.on !== false, 'tg-site': _TG.siteUrl, 'tg-channel': _TG.channel, 'tg-channelLink': _TG.channelLink, 'tg-group': _TG.group, 'tg-groupLink': _TG.groupLink, 'tg-appLink': _TG.appLink,
    'tg-button': _TG.button, 'tg-footer': _TG.footer, 'ta-broadcast': _TG.auto.broadcast !== false, 'ta-offers': _TG.auto.offers !== false, 'ta-deals': _TG.auto.deals !== false, 'ta-tasks': _TG.auto.tasks !== false,
    'ta-services': _TG.auto.services !== false, 'tw-on': _TG.welcome.on !== false, 'tw-del': _TG.welcome.deleteJoin !== false, 'tw-text': _TG.welcome.text, 'tg-rules': _TG.rules, 'tm-links': _TG.mod.links !== false,
    'tm-words': (_TG.mod.words || []).join('\n'), 'tg-dm': _TG.dm !== false, 'tg-mini': _TG.miniApp !== false });
  const D = d.daily || {};
  const DC = D.code || {};
  fillIn({ 'dr-code': DC.on !== false, 'dr-amt': DC.amount ?? 5, 'dr-max': DC.maxUses ?? 0 });
  fillIn({ 'dr-on': D.on !== false, 'dr-site': D.site !== false, 'dr-push': D.push !== false, 'dr-channel': D.channel !== false, 'dr-bot': D.bot !== false, 'dr-pin': D.pin === true,
    'dr-title': D.title || DR_DEF.title, 'dr-text': D.text || DR_DEF.text, 'dr-pushText': D.pushText || DR_DEF.pushText });
  const AA = _TG.adminAlerts || {};
  fillIn({ 'aa-on': AA.on !== false, 'aa-orders': AA.orders !== false, 'aa-trx': AA.trx !== false, 'aa-summary': AA.summary !== false });
  proTabStart('telegram', 'conn'); afterLoad('telegram'); tgPrev(); tgStatus(); tgLog(); scLoad(); drLast(); aaLoad();
}
async function saveTg(){
  const link = id => { const v = val(id); if(v && !/^https:\/\//i.test(v)) throw new Error('Links must start with https://'); return v; };
  const data = { on: chk('tg-on'), siteUrl: link('tg-site') || TGD.siteUrl, channel: val('tg-channel'), channelLink: link('tg-channelLink'), group: val('tg-group'), groupLink: link('tg-groupLink'), appLink: link('tg-appLink'),
    button: val('tg-button') || 'Open Creditfy', footer: val('tg-footer'),
    auto: { broadcast: chk('ta-broadcast'), offers: chk('ta-offers'), deals: chk('ta-deals'), tasks: chk('ta-tasks'), services: chk('ta-services') },
    welcome: { on: chk('tw-on'), deleteJoin: chk('tw-del'), text: $p('tw-text').value.trim() || TGD.welcome.text }, rules: $p('tg-rules').value.trim(),
    mod: { links: chk('tm-links'), words: lines('tm-words').map(w => w.toLowerCase()).slice(0, 100) }, dm: chk('tg-dm'), miniApp: chk('tg-mini'),
    adminAlerts: { on: chk('aa-on'), orders: chk('aa-orders'), trx: chk('aa-trx'), summary: chk('aa-summary') }, updatedAt: new Date().toISOString() };
  const daily = { on: chk('dr-on'), site: chk('dr-site'), push: chk('dr-push'), channel: chk('dr-channel'), bot: chk('dr-bot'), pin: chk('dr-pin'),
    title: val('dr-title') || DR_DEF.title, text: $p('dr-text').value.trim() || DR_DEF.text, pushText: val('dr-pushText') || DR_DEF.pushText,
    code: { on: chk('dr-code'), amount: numv('dr-amt', 5, 1, 10000), maxUses: numv('dr-max', 0, 0, 1e7) } };
  await window._setDoc('siteConfig', 'app', { telegram: data, daily });
  await logAct('Telegram settings saved', 'config', 'telegram');
}
window._SAVERS.telegram = { load: loadTg, save: saveTg };
// roles: the Telegram page follows the App Settings permission
setTimeout(function hideNav(){ const p = window._perm; if(!p) return setTimeout(hideNav, 800); const n = $p('n-telegram'); if(n && p.appset === 'none') n.style.display = 'none'; }, 1500);

/* ═════════ auto posts when Services & Rewards is saved ═════════ */
(function(){
  const S = window._SAVERS && window._SAVERS.services; if(!S) return;
  let before = null;
  const snap = () => { const X = (typeof _SV !== 'undefined' && _SV.extra) || {}; const now = Date.now(), live = i => Number(i.offer) > 0 && Number(i.offer) < Number(i.price) && i.offerEnd && new Date(i.offerEnd).getTime() > now;
    return { svc: new Set((X.services || []).map(s => s.id)), off: new Set((X.services || []).flatMap(s => (s.items || []).filter(live).map(i => s.id + ':' + i.id + ':' + i.offer))),
      deal: new Set((X.deals || []).filter(d => d.on !== false).map(d => d.sid + ':' + d.iid + ':' + d.price + ':' + (d.days || []).join(''))), task: new Set(((X.jobs || {}).tasks || []).filter(t => t.on !== false).map(t => t.id)) }; };
  const save0 = S.save;
  // the page opens with loadSvc(); remember what was there, so only new things are posted
  const wrapLoad = f => async function(){ const r = await f.apply(this, arguments); before = null; const t0 = Date.now(); (function wait(){ if(typeof _SV !== 'undefined' && _SV.extra && _SV.extra.services) before = snap(); else if(Date.now() - t0 < 15000) setTimeout(wait, 300); })(); return r; };
  if(typeof window.loadSvc === 'function') window.loadSvc = wrapLoad(window.loadSvc);
  S.load = wrapLoad(S.load);
  S.save = async function(){
    const r = await save0.apply(this, arguments);
    try { if(before) await autoPost(before, snap()); } catch (e) { console.warn('tg auto', e); }
    before = snap(); return r;
  };
  const tk = n => '৳' + Math.round(Number(n) || 0).toLocaleString('en-US');
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  async function autoPost(b, a){
    const X = _SV.extra || {}, svcs = X.services || [], find = (sid, iid) => { const s = svcs.find(x => x.id === sid); return { s, i: s && (s.items || []).find(x => x.id === iid) }; };
    const posts = [];
    const newSvc = svcs.filter(s => !b.svc.has(s.id) && s.on !== false && !s.soon);
    if(newSvc.length) posts.push({ kind: 'services', title: '🆕 New on Creditfy', text: newSvc.map(s => `• ${s.name}${s.desc ? ' — ' + s.desc : ''}`).join('\n') + '\n\nOpen Digital Services in the app to try it.' });
    const offs = [...a.off].filter(k => !b.off.has(k)).map(k => { const [sid, iid] = k.split(':'); return find(sid, iid); }).filter(x => x.i);
    const deals = (X.deals || []).filter(d => d.on !== false && !b.deal.has(d.sid + ':' + d.iid + ':' + d.price + ':' + (d.days || []).join(''))).map(d => ({ d, ...find(d.sid, d.iid) })).filter(x => x.i && x.d.price < x.i.price);
    if(offs.length || deals.length) posts.push({ kind: 'offers', title: '🔥 New offers', text: [
      ...offs.map(({ i }) => `• ${i.name} — ${tk(i.price)} → ${tk(i.offer)} (till ${new Date(i.offerEnd).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })})`),
      ...deals.map(({ d, i }) => `• ${i.name} — ${tk(i.price)} → ${tk(d.price)} every ${(d.days || []).map(n => WD[n]).join(', ')}`)].join('\n') + '\n\nVerified & VIP members pay no service charge.' });
    const tasks = ((X.jobs || {}).tasks || []).filter(t => t.on !== false && !b.task.has(t.id) && String(t.title || '').trim());
    if(tasks.length) posts.push({ kind: 'tasks', title: '💼 New micro jobs', text: tasks.map(t => `• ${t.title} — earn ${tk(t.reward)}`).join('\n') + '\n\nOpen Digital Services → Micro Jobs in the app.' });
    let n = 0;
    for(const p of posts){ const r = await window._accountApi('adminTgPost', p); if(r.ok && r.data.sent) n++; }
    if(n) toast(`Posted ${n} update${n > 1 ? 's' : ''} on Telegram ✓`);
  }
})();
