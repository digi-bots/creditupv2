// Overdue loans: marks loans past their due date (plus grace days) as "Overdue" and sends reminders.
// Settings: Admin → App Settings → Overdue Loans (siteConfig/app.overdue). Used by the daily cron and by "Run check now".
const { db } = require('./pay');

const OPEN = ['Approved', 'Disbursed', 'Active'];
const DEF = {
  on: true, graceDays: 0, notify: true, title: 'Payment Overdue',
  msg: 'Your loan {ref} was due on {due}. Please pay as soon as possible to keep your account in good standing.',
  remind: true, remindDays: 3, remindTitle: 'Payment Reminder',
  remindMsg: 'Your loan {ref} is due on {due}. Please make sure the payment is ready.'
};
const ref = id => 'CU-' + String(id).slice(-6).toUpperCase();
const fmt = d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' });
const fill = (t, a, due) => String(t || '').replace(/\{ref\}/g, ref(a.id)).replace(/\{due\}/g, fmt(due)).replace(/\{amount\}/g, '৳' + (a.loanAmount || ''));

// the due date: stored dueDate, else the day the money was sent (or approved) + term in months
function dueOf(a) {
  if (a.dueDate && !isNaN(new Date(a.dueDate))) return new Date(a.dueDate);
  const start = a.disbursedAt || a.creditedAt || a.approvedAt;
  const months = Number(a.term) || 0;
  if (!start || !months || isNaN(new Date(start))) return null;
  const d = new Date(start); d.setMonth(d.getMonth() + months); return d;
}

async function runOverdue({ force = false, by = 'cron' } = {}) {
  const store = db();
  const appSnap = await store.collection('siteConfig').doc('app').get();
  const cfg = { ...DEF, ...((appSnap.exists && appSnap.data().overdue) || {}) };
  const result = { at: new Date().toISOString(), by, checked: 0, marked: 0, reminded: 0, skipped: false };
  if (cfg.on === false && !force) { result.skipped = true; await store.collection('adminConfig').doc('overdueRun').set(result); return result; }
  const now = Date.now(), grace = Math.max(0, Number(cfg.graceDays) || 0) * 864e5, remindMs = Math.max(0, Number(cfg.remindDays) || 0) * 864e5;
  const snap = await store.collection('applications').where('status', 'in', OPEN).get();
  const notes = store.collection('user_notifications');
  for (const d of snap.docs) {
    const a = { id: d.id, ...d.data() };
    if (a.removed === true) continue;
    const due = dueOf(a); if (!due) continue;
    result.checked++;
    const t = due.getTime();
    if (now > t + grace) {
      const upd = { status: 'Overdue', overdueAt: new Date().toISOString(), statusUpdatedAt: new Date().toISOString(), dueDate: a.dueDate || due.toISOString() };
      await d.ref.update(upd);
      result.marked++;
      if (cfg.notify !== false && a.uid) await notes.add({ uid: a.uid, title: cfg.title || DEF.title, message: fill(cfg.msg || DEF.msg, a, due), type: 'warning', createdAt: new Date().toISOString() });
    } else if (cfg.remind !== false && remindMs && t - now <= remindMs && t > now && !a.remindedAt) {
      await d.ref.update({ remindedAt: new Date().toISOString(), dueDate: a.dueDate || due.toISOString() });
      result.reminded++;
      if (a.uid) await notes.add({ uid: a.uid, title: cfg.remindTitle || DEF.remindTitle, message: fill(cfg.remindMsg || DEF.remindMsg, a, due), type: 'info', createdAt: new Date().toISOString() });
    }
  }
  await store.collection('adminConfig').doc('overdueRun').set(result);
  if (result.marked || result.reminded) await store.collection('activityLog').add({ action: `Overdue check: ${result.marked} marked overdue, ${result.reminded} reminded (${by})`, type: 'application', ref: 'overdue', at: result.at });
  return result;
}

module.exports = { runOverdue, dueOf };
