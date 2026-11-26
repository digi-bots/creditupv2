// Answers for questions written to the Telegram bot: the admin's FAQ (Help & Info), the SEO FAQ, and a few
// built-in answers — scored by matching words (English and Bangla, with common other words for the same thing).
const BUILTIN = [
  { q: 'How long does approval take?', a: 'Loan money is processed through the bank, so approval and disbursement can take up to 7–14 working days. VIP applications are reviewed first.' },
  { q: 'What fees do I pay?', a: 'All fees and the upfront interest are shown before you apply and again on the fee page. See Quick Services → Fees Explained and Loan Terms.' },
  { q: 'How do I get Verified?', a: 'Open the app → Quick Services → Verify Number and pay the one-time fee. Verified members join every offer and reward and pay no service charge on Digital Services.' },
  { q: 'How do I use the daily bonus code?', a: 'Copy today’s code from the notification or our Telegram channel → Creditfy → Quick Services → Redeem Code → paste → Redeem. It works until midnight, once per person, for Verified members.' },
  { q: 'How do I invite friends?', a: 'Open the app → Refer & Earn and share your link. The more friends join, the bigger the offers you can unlock.' },
  { q: 'How do I add Digital Balance?', a: 'Digital Services → Digital Balance → Add balance: send the amount to the number shown and enter the Transaction ID. It is added after we check the payment.' },
  { q: 'Is my application rejected? Do I get a refund?', a: 'If your application is rejected, the fee you paid is refunded to the number you paid from.' },
  { q: 'Will you ask for my PIN or OTP?', a: 'Never. Creditfy never asks for your PIN, OTP or password. Pay only to the numbers shown inside the app.' }
];
const SYN = [['loan', 'লোন', 'ঋণ', 'borrow', 'credit'], ['fee', 'ফি', 'charge', 'চার্জ', 'cost', 'খরচ'], ['verify', 'verified', 'ভেরিফাই', 'ভেরিফায়েড', 'badge', 'ব্যাজ'],
  ['vip', 'ভিআইপি', 'priority'], ['refund', 'ফেরত'], ['pay', 'payment', 'পেমেন্ট', 'trxid', 'transaction'], ['installment', 'কিস্তি', 'emi', 'repay'],
  ['approve', 'approval', 'অনুমোদন', 'long', 'time', 'সময়', 'days', 'দিন'], ['reject', 'rejected', 'বাতিল'], ['invite', 'refer', 'রেফার', 'friend', 'বন্ধু'],
  ['bonus', 'বোনাস', 'redeem', 'রিডিম', 'code', 'কোড'], ['recharge', 'রিচার্জ'], ['balance', 'ব্যালেন্স', 'deposit', 'ডিপোজিট'], ['pin', 'otp', 'password', 'পাসওয়ার্ড']];
const norm = w => { w = w.toLowerCase(); const g = SYN.find(l => l.some(x => w === x || (x.length > 3 && w.startsWith(x)))); return g ? g[0] : w; };
const STOP = new Set(['how', 'what', 'the', 'do', 'is', 'my', 'can', 'to', 'a', 'an', 'of', 'in', 'for', 'and', 'or', 'it', 'you', 'kivabe', 'ki', 'kno', 'keno', 'কি', 'কীভাবে', 'কেন']);
const words = t => String(t || '').toLowerCase().split(/[^a-z0-9ঀ-৿]+/).filter(w => w.length > 1 && !STOP.has(w)).map(norm);
async function answer(db, text) {
  let list = [...BUILTIN];
  try {
    const [s, seo] = await Promise.all([db().collection('siteConfig').doc('services').get(), db().collection('siteConfig').doc('seo').get()]);
    const own = ((s.exists && s.data().help && s.data().help.faq) || []).filter(f => f && f.q && f.a && f.on !== false);
    const sf = ((seo.exists && seo.data().faq) || []).filter(f => f && f.q && f.a && f.on !== false);
    list = [...own, ...sf, ...list];
  } catch (e) {}
  const qw = [...new Set(words(text))]; if (!qw.length) return null;
  const best = list.map(f => { const qs = new Set(words(f.q)), as = new Set(words(f.a)); return { f, n: qw.reduce((n, w) => n + (qs.has(w) ? 3 : 0) + (as.has(w) ? 1 : 0), 0) }; }).sort((a, b) => b.n - a.n)[0];
  return best && best.n >= 3 ? best.f : null;
}
module.exports = { answer };
