// Admin alerts on Telegram: every linked admin gets a message the moment something needs checking (with
// Approve / Reject buttons where that is safe), and a short summary of the day after midnight.
// Admins link their Telegram in Admin → Telegram → Admin alerts (tgAdmins/{chatId} = { uid }).
// Buttons act as that admin, through the same account actions and the same role checks as the admin panel.
const TG = require('./tg');
const iso = (t = Date.now()) => new Date(t).toISOString();
const tk = n => '৳' + Math.round(Number(n) || 0).toLocaleString('en-US');
const esc = TG.esc;

async function cfg(db) { const S = await TG.settings(db); const A = (S.adminAlerts || {}); return { on: A.on !== false, orders: A.orders !== false, trx: A.trx !== false, summary: A.summary !== false }; }
async function admins(db) { try { const s = await db().collection('tgAdmins').get(); return s.docs.map(d => ({ chat: d.id, ...d.data() })).filter(a => a.uid); } catch (e) { return []; } }

// what an alert looks like for each kind of order
function describe(kind, o, id) {
  const who = `0${esc(o.uid)}`;
  if (kind === 'order') {
    if (o.kind === 'verify') return { title: '✅ Verified badge payment', body: `${who} paid ${tk(o.price)}\nTrxID <code>${esc(o.trxId)}</code>${o.payMethod ? ` · ${esc(o.payMethod)}` : ''}`, btn: [['approve', '✅ Approve'], ['reject', '❌ Reject']] };
    if (o.kind === 'vip') return { title: `👑 ${esc(o.planName)} payment`, body: `${who} paid ${tk(o.price)}\nTrxID <code>${esc(o.trxId)}</code>${o.sender ? ` · from 0${esc(o.sender)}` : ''}`, btn: [['approve', '✅ Approve'], ['reject', '❌ Reject']] };
    if (o.kind === 'xdeposit') return { title: '💳 Extra Balance deposit', body: `${who} sent ${tk(o.price)}\nTrxID <code>${esc(o.trxId)}</code>${o.coupon ? `\nCoupon ${esc(o.coupon)} (+${tk(o.couponBonus)})` : ''}`, btn: [['approve', '✅ Add balance'], ['reject', '❌ Reject']] };
    if (o.kind === 'extra') {
      const info = (o.fields || []).filter(f => f.value).map(f => `${esc(f.label)}: <b>${esc(f.value)}</b>`).join('\n');
      const paid = o.paidWith === 'xbal' ? 'paid from Extra Balance' : o.paidWith === 'main' ? 'paid from Creditfy balance' : `TrxID <code>${esc(o.trxId)}</code>`;
      return { title: o.sid === 'recharge' ? '📱 Mobile recharge' : `🛒 ${esc(o.sname)}`, body: `${who} — <b>${esc(o.iname)}</b>${o.amount ? ` (${esc(o.amount)} ${esc(o.unit)})` : ''}\n${o.flow === 'sell' ? 'Pay the user ' + tk(o.get) : tk(o.price)} · ${paid}${info ? '\n' + info : ''}`,
        btn: o.status === 'Processing' ? [['deliver', '✅ Done / delivered'], ['reject', '❌ Reject']] : [['process', '⏳ Payment OK'], ['deliver', '✅ Delivered'], ['reject', '❌ Reject']] };
    }
  }
  if (kind === 'job') return { title: '💼 Micro job proof', body: `${who} — <b>${esc(o.title)}</b> (+${tk(o.reward)})\nProof: ${esc(String(o.proof || '').slice(0, 300))}`, btn: [['approve', '✅ Approve'], ['reject', '❌ Reject']] };
  if (kind === 'trx') return { title: o.type === 'installment' ? '💵 Installment payment' : '🧾 Loan fee payment', body: `${who} paid ${tk(o.amount)}${o.appId ? ` for CU-${esc(String(o.appId).slice(-6).toUpperCase())}` : ''}\nTrxID <code>${esc(o.trxId)}</code>${o.payMethod ? ` · ${esc(o.payMethod)}` : ''}\nCheck it in the admin panel → Transactions.`, btn: [] };
  return null;
}

// send an alert to every linked admin (never throws)
async function notify(db, kind, id, o) {
  try {
    if (!TG.configured()) return;
    const C = await cfg(db); if (!C.on || (kind === 'trx' ? !C.trx : !C.orders)) return;
    const d = describe(kind, o, id); if (!d) return;
    const list = await admins(db); if (!list.length) return;
    const kb = d.btn.length ? { inline_keyboard: [d.btn.map(([op, label]) => ({ text: label, callback_data: `${kind === 'job' ? 'j' : 'o'}:${op}:${id}`.slice(0, 64) }))] } : undefined;
    await Promise.all(list.map(a => TG.call('sendMessage', { chat_id: a.chat, text: `<b>${d.title}</b>\n${d.body}`, parse_mode: 'HTML', ...(kb ? { reply_markup: kb } : {}), link_preview_options: { is_disabled: true } }).catch(() => {})));
  } catch (e) { console.warn('alert', e.message); }
}

// a button was pressed: act as that admin, then show the result on the message
async function onButton(db, q, actions) {
  const chat = q.message && q.message.chat && q.message.chat.id; const from = q.from && q.from.id;
  const a = from ? await db().collection('tgAdmins').doc(String(from)).get() : null;
  const answer = text => TG.call('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: text.length > 60 }).catch(() => {});
  if (!a || !a.exists || String(chat) !== String(from)) return answer('Only a linked admin can do this.');
  const [k, op, id] = String(q.data || '').split(':');
  const user = { uid: a.data().uid };
  let r;
  const reason = 'We could not find this payment.';
  if (k === 'j') r = await actions.adminJobs({ op, id, reason }, user);
  else {
    const s = await db().collection('serviceOrders').doc(String(id)).get();
    if (!s.exists) return answer('Order not found.');
    const o = s.data();
    if (['extra', 'xdeposit'].includes(o.kind)) r = await actions.adminExtraOrder({ id, op, text: '', reason }, user);
    else r = await actions.adminServiceOrder({ id, op, reason }, user);
  }
  const [status, out] = r || [500, {}];
  if (status !== 200) return answer(out.error || 'Could not do it.');
  const done = { approve: '✅ Approved', reject: '❌ Rejected', process: '⏳ Payment confirmed — in progress', deliver: '✅ Delivered' }[op] || 'Done';
  const by = a.data().name ? ` by ${esc(a.data().name)}` : '';
  try {
    await db().collection('activityLog').add({ action: `${done.replace(/^\S+ /, '')} from Telegram (${k === 'j' ? 'micro job' : 'order'} ${id})`, type: 'user', ref: String(id), at: iso(), via: 'telegram', by: user.uid });
    const keep = op === 'process' ? { reply_markup: { inline_keyboard: [[{ text: '✅ Delivered', callback_data: `o:deliver:${id}` }, { text: '❌ Reject', callback_data: `o:reject:${id}` }]] } } : { reply_markup: { inline_keyboard: [] } };
    await TG.call('editMessageText', { chat_id: chat, message_id: q.message.message_id, text: `${q.message.text || ''}\n\n<b>${done}${by}</b> · ${new Date(Date.now() + 6 * 3600e3).toISOString().slice(11, 16)}`.replace(/[<>&]/g, m => m === '<' ? '&lt;' : m === '>' ? '&gt;' : '&amp;').replace(/&lt;(\/?b)&gt;/g, '<$1>'), parse_mode: 'HTML', ...keep });
  } catch (e) {}
  return answer(done);
}

// the day in numbers (Bangladesh time); day = 'YYYY-MM-DD'
async function summary(db, day) {
  const from = new Date(day + 'T00:00:00+06:00').getTime(), to = from + 864e5;
  const inDay = v => { const t = new Date(v || 0).getTime(); return t >= from && t < to; };
  const [users, apps, trx, orders, jobs] = await Promise.all([
    db().collection('users').where('createdAt', '>=', iso(from)).get(), db().collection('applications').where('submittedAt', '>=', iso(from)).get(),
    db().collection('transactions').where('submittedAt', '>=', iso(from)).get(), db().collection('serviceOrders').where('createdAt', '>=', iso(from)).get(),
    db().collection('taskSubs').where('status', '==', 'Pending').get()]);
  const U = users.docs.map(d => d.data()).filter(x => inDay(x.createdAt)), A = apps.docs.map(d => d.data()).filter(x => inDay(x.submittedAt) && !x.removed);
  const T = trx.docs.map(d => d.data()).filter(x => inDay(x.submittedAt) && !x.removed), O = orders.docs.map(d => d.data()).filter(x => inDay(x.createdAt));
  const sum = (l, f) => l.reduce((a, x) => a + (Number(String(f(x) ?? 0).replace(/,/g, '')) || 0), 0);
  const pend = await Promise.all([db().collection('serviceOrders').where('status', 'in', ['Pending', 'Processing']).get(), db().collection('transactions').where('status', '==', 'Pending').get()]);
  const by = k => O.filter(o => o.kind === k);
  const lines = [
    `👥 New users: <b>${U.length}</b>${U.filter(u => u.referredBy).length ? ` (${U.filter(u => u.referredBy).length} invited)` : ''}`,
    `📝 Loan applications: <b>${A.length}</b>${A.length ? ` · ${tk(sum(A, a => a.loanAmount))} asked` : ''}`,
    `🧾 Payments sent: <b>${T.length}</b> · ${tk(sum(T, t => t.amount))}`,
    `✅ Verified badges: <b>${by('verify').length}</b> · 👑 VIP: <b>${by('vip').length}</b>`,
    `🛒 Extra orders: <b>${by('extra').length}</b> · ${tk(sum(by('extra'), o => o.price))}`,
    `💳 Deposits: <b>${by('xdeposit').length}</b> · ${tk(sum(by('xdeposit'), o => o.price))}`,
    '',
    `⏳ Waiting for you now: <b>${pend[0].size}</b> orders · <b>${pend[1].size}</b> payments · <b>${jobs.size}</b> job proofs`
  ];
  return `📊 <b>Creditfy — ${day}</b>\n\n${lines.join('\n')}`;
}
async function sendSummary(db, day) {
  if (!TG.configured()) return { sent: 0 };
  const C = await cfg(db); if (!C.on || !C.summary) return { sent: 0, skipped: 'off' };
  const list = await admins(db); if (!list.length) return { sent: 0 };
  const text = await summary(db, day);
  await Promise.all(list.map(a => TG.call('sendMessage', { chat_id: a.chat, text, parse_mode: 'HTML' }).catch(() => {})));
  return { sent: list.length };
}
module.exports = { notify, onButton, summary, sendSummary, admins };
