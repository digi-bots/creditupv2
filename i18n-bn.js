/* Creditfy — Bangla words for Quick Services, loan tools, help pages, rewards, profile and invite screens.
   Adds to the dictionary in app-pro.js (BN = exact text, BN_RE = text with numbers). Admin → App Settings → Language
   "Your own translations" still win over these. */
(function(){
if(typeof BN !== 'object' || typeof BN_RE !== 'object') return;
const T = 'ক্রেডিটফাই';
Object.assign(BN, {
  // hub & common
  'Help & Info': 'সাহায্য ও তথ্য', 'Account': 'অ্যাকাউন্ট', 'Premium': 'প্রিমিয়াম', 'Rewards': 'রিওয়ার্ড', 'Loans': 'লোন', 'VIP': 'ভিআইপি', 'HOT': 'হট', 'NEW': 'নতুন',
  'VERIFIED': 'ভেরিফায়েড', 'PENDING': 'অপেক্ষমাণ', 'GET VERIFIED': 'ভেরিফায়েড হোন', 'Get Verified': 'ভেরিফায়েড হোন', 'OFFICIAL': 'অফিসিয়াল', 'Loading…': 'লোড হচ্ছে…',
  'Please login again.': 'অনুগ্রহ করে আবার লগইন করুন।', 'Copy': 'কপি', 'Share': 'শেয়ার', 'Cancel': 'বাতিল', 'Open': 'খুলুন', 'Gift': 'গিফট', 'Redeem': 'রিডিম',
  'Sharing helps more people find a fair loan.': 'শেয়ার করলে আরও মানুষ ন্যায্য লোন খুঁজে পায়।', 'For Creditfy': 'ক্রেডিটফাই-এর পক্ষে', '© 2026 Creditfy. All rights reserved.': '© ২০২৬ ক্রেডিটফাই। সর্বস্বত্ব সংরক্ষিত।',
  // check-in
  'Your streak': 'আপনার ধারাবাহিকতা', 'Daily check-in': 'ডেইলি চেক-ইন', 'Daily Check-in': 'ডেইলি চেক-ইন', 'days': 'দিন', 'day': 'দিন', 'Check in today and get': 'আজ চেক-ইন করলে পাবেন', 'in your balance.': 'আপনার ব্যালেন্সে।',
  'Checked in today ✓ Come back tomorrow to keep the streak.': 'আজ চেক-ইন হয়েছে ✓ ধারাবাহিকতা রাখতে কাল আবার আসুন।', 'Checked in today': 'আজ চেক-ইন হয়েছে', 'Check in now': 'এখনই চেক-ইন', 'How it works': 'কীভাবে কাজ করে',
  'Open the app and check in once a day. Each day in a row gives a bigger reward, and day 7 gives the biggest. Miss a day and the streak starts again. Rewards go straight to your balance — see them in your Wallet.': 'প্রতিদিন একবার অ্যাপ খুলে চেক-ইন করুন। টানা প্রতিটি দিনে পুরস্কার বাড়ে, ৭ম দিনে সবচেয়ে বড়। একদিন বাদ গেলে আবার প্রথম থেকে শুরু। পুরস্কার সরাসরি ব্যালেন্সে যায় — ওয়ালেটে দেখুন।',
  // spin
  'Spin': 'স্পিন করুন', 'once a month': 'মাসে একবার', 'once a week': 'সপ্তাহে একবার', 'once a day': 'দিনে একবার', 'for a chance to win balance rewards.': '— ব্যালেন্স পুরস্কার জেতার সুযোগ।',
  'Try again': 'আবার চেষ্টা', 'Better luck': 'পরের বার', 'SPIN': 'স্পিন', 'Last time you got:': 'গতবার পেয়েছিলেন:', 'Fair play': 'ন্যায্য খেলা', 'Spin now': 'এখনই স্পিন', 'Spinning…': 'ঘুরছে…',
  'The result is decided on our server the moment you spin, so it cannot be changed. Balance prizes are added to your wallet right away.': 'স্পিন করার মুহূর্তেই ফল আমাদের সার্ভারে ঠিক হয়, তাই বদলানো যায় না। ব্যালেন্স পুরস্কার সাথে সাথে ওয়ালেটে যোগ হয়।',
  'Spin & Win is not ready yet.': 'স্পিন অ্যান্ড উইন এখনো চালু হয়নি।',
  // wallet
  'Cashback Wallet': 'ক্যাশব্যাক ওয়ালেট', 'AVAILABLE BALANCE': 'বর্তমান ব্যালেন্স', 'Use up to ৳100 on a fee payment, or send it as a gift voucher.': 'ফি পরিশোধে ৳১০০ পর্যন্ত ব্যবহার করুন, বা গিফট ভাউচার হিসেবে পাঠান।',
  'Earned': 'আয়', 'Used': 'খরচ', 'Entries': 'এন্ট্রি', 'History': 'ইতিহাস', 'History is shown from when the wallet started.': 'ওয়ালেট চালুর সময় থেকে ইতিহাস দেখানো হয়।',
  'No wallet activity yet. Check in daily or spin to start earning!': 'এখনো কোনো লেনদেন নেই। প্রতিদিন চেক-ইন বা স্পিন করে আয় শুরু করুন!',
  'Sign-up bonus': 'সাইন-আপ বোনাস', 'Bonus': 'বোনাস', 'Check-in': 'চেক-ইন', 'Redeem code': 'রিডিম কোড', 'Gift voucher': 'গিফট ভাউচার', 'Voucher sent': 'ভাউচার পাঠানো', 'Voucher returned': 'ভাউচার ফেরত',
  'Used for fee': 'ফি-তে ব্যবহৃত', 'Adjustment': 'সমন্বয়', 'Referral bonus': 'রেফারেল বোনাস', 'Cashback': 'ক্যাশব্যাক', 'Added by Creditfy': 'ক্রেডিটফাই যোগ করেছে', 'Deducted by Creditfy': 'ক্রেডিটফাই কেটেছে',
  // redeem & voucher
  'Got a code?': 'কোড আছে?', 'Enter a redeem code or a gift voucher from a friend. The amount goes straight to your balance.': 'রিডিম কোড বা বন্ধুর দেওয়া গিফট ভাউচার দিন। টাকা সরাসরি আপনার ব্যালেন্সে যাবে।',
  'Promo codes that give a discount on your fee are entered on the fee payment page.': 'ফি-তে কোনো প্রোমো কোড বা কুপন চলে না।', 'ENTER CODE': 'কোড লিখুন', 'Checking…': 'যাচাই হচ্ছে…',
  'Creditfy gift voucher': 'ক্রেডিটফাই গিফট ভাউচার', 'Send balance to a friend as a gift code': 'বন্ধুকে গিফট কোড হিসেবে ব্যালেন্স পাঠান', 'Message (optional)': 'মেসেজ (ঐচ্ছিক)', 'e.g. Happy Eid! 🎉': 'যেমন: ঈদ মোবারক! 🎉',
  'Create voucher': 'ভাউচার তৈরি', 'My vouchers': 'আমার ভাউচার', 'No vouchers yet.': 'এখনো কোনো ভাউচার নেই।', 'Your new voucher': 'আপনার নতুন ভাউচার', 'USED': 'ব্যবহৃত', 'CANCELLED': 'বাতিল', 'used by a friend': 'বন্ধু ব্যবহার করেছে', 'cancelled': 'বাতিল',
  // VIP
  'VIP Express': 'ভিআইপি এক্সপ্রেস', 'Creditfy VIP Express': 'ক্রেডিটফাই ভিআইপি এক্সপ্রেস', 'Get your loan approved and sent within': 'আপনার লোন অনুমোদন হয়ে টাকা পৌঁছাবে', '— or your VIP fee back.': 'এর মধ্যে — নইলে ভিআইপি ফি ফেরত।',
  'Normal service': 'সাধারণ সার্ভিস', 'Choose your plan': 'প্ল্যান বেছে নিন', 'MOST POPULAR': 'সবচেয়ে জনপ্রিয়', 'BEST VALUE': 'সেরা মূল্য', 'Super VIP': 'সুপার ভিআইপি', 'Supreme VIP': 'সুপ্রিম ভিআইপি',
  'Lifetime · one-time payment · never expires': 'আজীবন · এককালীন পেমেন্ট · মেয়াদ শেষ হয় না', 'What you get': 'আপনি যা পাবেন', 'Our promise': 'আমাদের প্রতিশ্রুতি', 'Get VIP': 'ভিআইপি নিন', 'request is being checked': 'অনুরোধ যাচাই হচ্ছে',
  'Loan approved and money sent within 72 hours': '৭২ ঘণ্টার মধ্যে লোন অনুমোদন ও টাকা পাঠানো', 'Your application goes first in the review queue': 'রিভিউ সারিতে আপনার আবেদন সবার আগে', 'Priority support': 'অগ্রাধিকার সাপোর্ট', 'Gold VIP badge on your profile': 'প্রোফাইলে সোনালি ভিআইপি ব্যাজ',
  'If your loan is not approved and sent within 72 hours, your VIP fee is refunded.': '৭২ ঘণ্টার মধ্যে লোন অনুমোদন হয়ে টাকা না পৌঁছালে ভিআইপি ফি ফেরত দেওয়া হবে।',
  'VIP speeds up the review; approval still depends on your details.': 'ভিআইপি রিভিউ দ্রুত করে; অনুমোদন তবুও আপনার তথ্যের উপর নির্ভর করে।',
  'A rejected application does not end your VIP — apply again any time while it is valid.': 'আবেদন বাতিল হলেও ভিআইপি শেষ হয় না — মেয়াদ থাকা পর্যন্ত যেকোনো সময় আবার আবেদন করুন।',
  'If your account is suspended, VIP ends automatically.': 'অ্যাকাউন্ট সাসপেন্ড হলে ভিআইপি নিজে থেকে বন্ধ হয়ে যায়।', 'Lifetime membership': 'আজীবন সদস্যপদ', 'No VIP plan is available right now.': 'এখন কোনো ভিআইপি প্ল্যান নেই।',
  // verify
  'Verify Number': 'নম্বর ভেরিফাই', 'Get a Verified badge': 'ভেরিফায়েড ব্যাজ নিন', 'Better approval chance': 'অনুমোদনের বেশি সম্ভাবনা', 'Shows you are a serious customer': 'আপনি যে আন্তরিক গ্রাহক তা দেখায়', 'Premium badge on your profile': 'প্রোফাইলে প্রিমিয়াম ব্যাজ',
  'Your number': 'আপনার নম্বর', 'One-time fee': 'এককালীন ফি', 'Pay from': 'যেখান থেকে দেবেন', 'Any bKash / Nagad number': 'যেকোনো বিকাশ / নগদ নম্বর', 'Your account is verified': 'আপনার অ্যাকাউন্ট ভেরিফায়েড',
  'Pay a one-time ৳100 from any bKash / Nagad number. The Verified badge shows that you are a serious customer who really wants our service — a premium blue badge appears next to your number and on your profile, and your applications are reviewed with more trust, so you have a better chance of approval.': 'যেকোনো বিকাশ / নগদ নম্বর থেকে এককালীন ৳১০০ দিন। ভেরিফায়েড ব্যাজ দেখায় আপনি একজন আন্তরিক গ্রাহক যিনি সত্যিই আমাদের সার্ভিস চান — আপনার নম্বর ও প্রোফাইলের পাশে প্রিমিয়াম নীল ব্যাজ দেখাবে, আর আপনার আবেদন বেশি আস্থার সাথে রিভিউ হবে, তাই অনুমোদনের সম্ভাবনা বাড়ে।',
  'Your premium Verified badge shows next to your number and on your profile, and our review team sees that you are a serious customer.': 'আপনার প্রিমিয়াম ভেরিফায়েড ব্যাজ নম্বর ও প্রোফাইলের পাশে দেখায়, আর আমাদের রিভিউ টিম দেখে আপনি একজন আন্তরিক গ্রাহক।',
  // payment page
  'Amount to send': 'যত টাকা পাঠাবেন', '1. Choose how to pay': '১. কীভাবে দেবেন বেছে নিন', '3. Enter the payment details': '৩. পেমেন্টের তথ্য দিন', 'Submit payment': 'পেমেন্ট জমা দিন', 'Submitting…': 'জমা হচ্ছে…',
  'Our team checks the payment and switches it on — usually within a few hours. You get a notification.': 'আমাদের টিম পেমেন্ট যাচাই করে চালু করে দেবে — সাধারণত কয়েক ঘণ্টার মধ্যে। আপনি নোটিফিকেশন পাবেন।',
  'TRANSACTION ID': 'ট্রানজেকশন আইডি', 'Paid from number (01XXXXXXXXX)': 'যে নম্বর থেকে পাঠিয়েছেন (01XXXXXXXXX)', 'No payment number is available right now. Please contact support.': 'এখন কোনো পেমেন্ট নম্বর নেই। সাপোর্টে যোগাযোগ করুন।',
  'Super VIP · one-time': 'সুপার ভিআইপি · এককালীন', 'VIP · one-time': 'ভিআইপি · এককালীন', 'Supreme VIP · one-time': 'সুপ্রিম ভিআইপি · এককালীন', 'Verified badge · one-time': 'ভেরিফায়েড ব্যাজ · এককালীন',
  'Super VIP payment': 'সুপার ভিআইপি পেমেন্ট', 'VIP payment': 'ভিআইপি পেমেন্ট', 'Supreme VIP payment': 'সুপ্রিম ভিআইপি পেমেন্ট', 'Verification payment': 'ভেরিফিকেশন পেমেন্ট', 'Payment': 'পেমেন্ট',
  'Send Money': 'সেন্ড মানি', 'Cash Out': 'ক্যাশ আউট', 'Pay with': 'যা দিয়ে দেবেন', 'Payment details': 'পেমেন্টের তথ্য',
  // loans
  'My Loans': 'আমার লোন', 'Active': 'সক্রিয়', 'To repay': 'শোধ বাকি', 'Repaid': 'পরিশোধিত', 'Left': 'বাকি', 'Paid': 'পরিশোধ', 'Overdue': 'মেয়াদোত্তীর্ণ', 'Fee pending': 'ফি বাকি', 'Fee submitted': 'ফি জমা হয়েছে',
  'Under review': 'রিভিউ চলছে', 'Approved': 'অনুমোদিত', 'Not approved': 'অনুমোদিত হয়নি', 'Pay installment': 'কিস্তি দিন', 'Pay off early': 'আগেই শোধ করুন', 'Show schedule': 'কিস্তির তালিকা',
  'Fully repaid — thank you!': 'সম্পূর্ণ পরিশোধিত — ধন্যবাদ!', 'Installments start after the money is sent to you.': 'টাকা পাঠানোর পর থেকে কিস্তি শুরু হবে।', 'Trust level': 'ট্রাস্ট লেভেল', 'Statement': 'স্টেটমেন্ট',
  'No loans yet.': 'এখনো কোনো লোন নেই।', 'Apply for a loan': 'লোনের আবেদন করুন', 'You have no active loan to pay right now.': 'এখন পরিশোধ করার মতো সক্রিয় লোন নেই।',
  'How many installments?': 'কয়টি কিস্তি?', 'We verify it and update your loan — you get a notification.': 'আমরা যাচাই করে আপনার লোন আপডেট করব — আপনি নোটিফিকেশন পাবেন।',
  'Your pending payments already cover this loan.': 'আপনার অপেক্ষমাণ পেমেন্টেই এই লোন পুরো হয়ে যায়।', 'Pay Installment': 'কিস্তি পরিশোধ', 'Early Payoff': 'আগাম পরিশোধ', 'Loan': 'লোন',
  'and you are free of this loan 🎉': 'আর আপনি এই লোন থেকে মুক্ত 🎉', 'Left on the loan': 'লোনে বাকি', 'Early payoff discount': 'আগাম পরিশোধে ছাড়', 'Payoff fee': 'পরিশোধ ফি', 'Already sent (waiting)': 'আগেই পাঠানো (অপেক্ষমাণ)',
  'Installments you skip': 'যতগুলো কিস্তি লাগবে না', 'Paying early costs less than paying every installment.': 'আগে শোধ করলে প্রতিটি কিস্তি দেওয়ার চেয়ে কম খরচ পড়ে।',
  'Paying early clears the loan, raises your trust level and your next loan limit.': 'আগে শোধ করলে লোন শেষ হয়, ট্রাস্ট লেভেল ও পরের লোন সীমা বাড়ে।',
  'Loan Limit': 'লোন সীমা', 'YOUR LOAN LIMIT': 'আপনার লোন সীমা', 'How your limit is made': 'আপনার সীমা যেভাবে হিসাব হয়', "Verified Exclusive is active": "ভেরিফায়েড এক্সক্লুসিভ চালু আছে", "You pay no service charge and no transaction fee on every Extra Service.": "প্রতিটি এক্সট্রা সার্ভিসে আপনার কোনো সার্ভিস চার্জ বা ট্রানজেকশন ফি লাগবে না।", "0% fee ✓": "০% ফি ✓", "Verified Exclusive: 0% charge · 0 fee": "ভেরিফায়েড এক্সক্লুসিভ: ০% চার্জ · ০ ফি", "Get Verified": "ভেরিফায়েড হোন", "Pay no charge with Verified": "ভেরিফায়েড হলে কোনো চার্জ নেই", "Price": "দাম", "Amount": "পরিমাণ", "Value": "মূল্য", "Service charge": "সার্ভিস চার্জ", "Transaction fee": "ট্রানজেকশন ফি", "Waived — Verified ✓": "মওকুফ — ভেরিফায়েড ✓", "No fee": "কোনো ফি নেই", "No fee — Verified ✓": "কোনো ফি নেই — ভেরিফায়েড ✓", "Verified: no fee": "ভেরিফায়েড: কোনো ফি নেই", "No charge ✓": "কোনো চার্জ নেই ✓", "Your application has VIP priority": "আপনার আবেদন ভিআইপি অগ্রাধিকারে আছে", "Get VIP priority": "ভিআইপি অগ্রাধিকার নিন", "0% charge & 0 fee on Extra Services": "এক্সট্রা সার্ভিসে ০% চার্জ ও ০ ফি", "0% charge · 0 transaction fee": "০% চার্জ · ০ ট্রানজেকশন ফি", "On exchange, gift cards, SMM and every Extra Service": "এক্সচেঞ্জ, গিফট কার্ড, এসএমএম ও সব এক্সট্রা সার্ভিসে", "Extra Balance": "এক্সট্রা ব্যালেন্স", "EXTRA BALANCE": "এক্সট্রা ব্যালেন্স", "Add balance": "ব্যালেন্স যোগ করুন", "Balance": "ব্যালেন্স", "Pay with your Extra Balance": "এক্সট্রা ব্যালেন্স দিয়ে পেমেন্ট করুন", "Live orders": "লাইভ অর্ডার", "LIVE": "লাইভ", "How do you want to pay?": "কীভাবে পেমেন্ট করবেন?", "bKash / Nagad": "বিকাশ / নগদ", "Send & give TrxID": "পাঠিয়ে TrxID দিন", "Deposits": "ডিপোজিট", "History": "ইতিহাস", "Checking": "যাচাই হচ্ছে", "Not approved": "অনুমোদন হয়নি", "Submit deposit": "ডিপোজিট জমা দিন", "No history yet.": "এখনো কোনো ইতিহাস নেই।", "Only for Extra Services. It is separate from your loan and cannot be used for loan fees.": "শুধু এক্সট্রা সার্ভিসের জন্য। এটি লোন থেকে আলাদা, লোন ফি-তে ব্যবহার করা যায় না।", "Add money once and order any Extra Service in one tap.": "একবার টাকা যোগ করুন, তারপর এক ট্যাপে যেকোনো এক্সট্রা সার্ভিস অর্ডার করুন।", "The price is taken from your Extra Balance when you place the order.": "অর্ডার করার সময় দাম আপনার এক্সট্রা ব্যালেন্স থেকে কাটা হবে।", "1. Amount": "১. পরিমাণ", "2. Send it to": "২. এই নম্বরে পাঠান", "3. Transaction ID from your payment SMS": "৩. পেমেন্ট SMS-এর ট্রানজেকশন আইডি", "just now": "এইমাত্র", "Extra Services": "এক্সট্রা সার্ভিস", "PREMIUM": "প্রিমিয়াম", "My orders ›": "আমার অর্ডার ›", "My orders": "আমার অর্ডার", "Currency Exchange": "কারেন্সি এক্সচেঞ্জ", "Exchange": "এক্সচেঞ্জ", "Gift Cards": "গিফট কার্ড", "SMM & Premium": "এসএমএম ও প্রিমিয়াম", "SMM": "এসএমএম", "Play & Earn": "খেলুন ও আয় করুন", "Games": "গেমস", "Virtual Card (VCC)": "ভার্চুয়াল কার্ড (VCC)", "VCC": "ভিসিসি", "Daraz Promo Codes": "দারাজ প্রোমো কোড", "Promo Codes": "প্রোমো কোড", "Gift Vouchers": "গিফট ভাউচার", "Vouchers": "ভাউচার", "MFS Exchange": "এমএফএস এক্সচেঞ্জ", "Choose an option": "একটি অপশন বাছুন", "How it works": "যেভাবে কাজ করে", "You pay": "আপনি দেবেন", "You get": "আপনি পাবেন", "Send the payment": "পেমেন্ট পাঠান", "Transaction ID from your payment SMS": "পেমেন্ট SMS-এর ট্রানজেকশন আইডি", "Place order": "অর্ডার করুন", "Copy": "কপি", "Checking payment": "পেমেন্ট যাচাই হচ্ছে", "In progress": "কাজ চলছে", "Delivered": "ডেলিভারি হয়েছে", "Not completed": "সম্পন্ন হয়নি", "No orders yet.": "এখনো কোনো অর্ডার নেই।", "Browse Extra Services": "এক্সট্রা সার্ভিস দেখুন", "Your turn — you are X": "আপনার পালা — আপনি X", "Ready to play?": "খেলতে প্রস্তুত?", "Start game": "খেলা শুরু করুন", "Play again": "আবার খেলুন", "The computer won this time": "এবার কম্পিউটার জিতেছে", "It's a draw": "ড্র হয়েছে", "per win": "প্রতি জয়ে", "paid wins today": "আজকের পুরস্কারের জয়", "games left": "বাকি গেম", "More games are coming soon.": "আরও গেম শিগগির আসছে।", "For Verified members": "শুধু ভেরিফায়েড সদস্যদের জন্য", "Your receiving number": "আপনার টাকা পাওয়ার নম্বর", "Orders are checked and delivered by hand. If we cannot complete it, your money is returned.": "অর্ডার যাচাই করে হাতে ডেলিভারি দেওয়া হয়। সম্পন্ন করতে না পারলে আপনার টাকা ফেরত দেওয়া হবে।", "Pick an option, send the payment and enter the Transaction ID. Our team checks the payment and delivers your order by hand — usually within a few hours. You can follow it in My orders.": "অপশন বাছুন, পেমেন্ট পাঠান এবং ট্রানজেকশন আইডি দিন। আমাদের টিম পেমেন্ট যাচাই করে হাতে অর্ডার ডেলিভারি দেয় — সাধারণত কয়েক ঘণ্টার মধ্যে। আমার অর্ডার-এ অবস্থা দেখতে পারবেন।", "Game win": "গেম জয়", "Order": "অর্ডার", 'counted up to the highest loan': 'সর্বোচ্চ লোন পর্যন্ত ধরা হয়েছে', 'Your limit': 'আপনার সীমা', 'Starting limit': 'শুরুর সীমা', 'Verified number': 'ভেরিফায়েড নম্বর', 'VIP member': 'ভিআইপি সদস্য',
  'Raise your limit': 'সীমা বাড়ান', 'Verify your number': 'নম্বর ভেরিফাই করুন', 'Repay your loan on time': 'সময়মতো লোন শোধ করুন', 'Join VIP': 'ভিআইপি নিন', '🎉 You have the highest limit.': '🎉 আপনার সীমা সর্বোচ্চ।',
  'Your limit is a guide — applications above it may need extra review.': 'সীমা একটি নির্দেশনা — এর বেশি আবেদনে বাড়তি রিভিউ লাগতে পারে।', 'Above your limit': 'আপনার সীমার বেশি',
  'Trust Level': 'ট্রাস্ট লেভেল', 'Platinum': 'প্লাটিনাম', 'Welcome to Creditfy': 'ক্রেডিটফাই-এ স্বাগতম', 'Faster review': 'দ্রুত রিভিউ', 'Higher loan limit and priority review': 'বেশি লোন সীমা ও অগ্রাধিকার রিভিউ', 'Our best limits and the fastest service': 'আমাদের সর্বোচ্চ সীমা ও দ্রুততম সার্ভিস',
  'An overdue installment lowers your score by 30. Pay it to get the points back.': 'মেয়াদোত্তীর্ণ কিস্তি স্কোর ৩০ কমায়। পরিশোধ করলে পয়েন্ট ফিরে আসবে।', 'You are at the top level 🏆': 'আপনি সর্বোচ্চ লেভেলে 🏆',
  'First loan repaid': 'প্রথম লোন পরিশোধিত', 'Two loans repaid': 'দুটি লোন পরিশোধিত', 'Always on time': 'সবসময় সময়মতো', 'Member for 3 months': '৩ মাসের সদস্য', 'Complete profile': 'সম্পূর্ণ প্রোফাইল',
  'Repay a loan fully': 'একটি লোন পুরো শোধ করুন', 'Repay a second loan': 'দ্বিতীয় লোন শোধ করুন', 'Pay every installment by its due date': 'প্রতিটি কিস্তি তারিখের মধ্যে দিন', 'Stay with us for 3 months': '৩ মাস আমাদের সাথে থাকুন', 'Complete your profile': 'প্রোফাইল সম্পূর্ণ করুন',
  'Your loan statement': 'আপনার লোন স্টেটমেন্ট', 'All your loans, payments and installments in one document. Choose “Save as PDF” in the print window.': 'আপনার সব লোন, পেমেন্ট ও কিস্তি এক ডকুমেন্টে। প্রিন্ট উইন্ডোতে “Save as PDF” বেছে নিন।',
  'Download statement': 'স্টেটমেন্ট ডাউনলোড', 'Loans': 'লোন', 'Total repaid': 'মোট পরিশোধ', 'Still to repay': 'শোধ বাকি', 'Please allow pop-ups to download the statement': 'স্টেটমেন্ট ডাউনলোডের জন্য পপ-আপ চালু করুন',
  'Budget Planner': 'বাজেট প্ল্যানার', 'How much can you safely borrow?': 'নিরাপদে কত লোন নিতে পারেন?', 'Monthly income (৳)': 'মাসিক আয় (৳)', 'Monthly expenses — rent, food, bills (৳)': 'মাসিক খরচ — ভাড়া, খাবার, বিল (৳)',
  'Other loan installments you pay now (৳)': 'অন্য লোনের কিস্তি যা এখন দিচ্ছেন (৳)', 'Money left each month': 'প্রতি মাসে যা বাঁচে', 'Safe installment: up to': 'নিরাপদ কিস্তি: সর্বোচ্চ', 'a month': 'মাসে', 'You can borrow': 'নিতে পারবেন', 'Installment': 'কিস্তি', 'Term': 'মেয়াদ',
  'Borrow only what you need — a smaller loan is easier to repay on time.': 'যতটুকু দরকার ততটুকুই নিন — ছোট লোন সময়মতো শোধ করা সহজ।', 'A loan is not comfortable with these numbers right now.': 'এই হিসাবে এখন লোন নেওয়া আরামদায়ক হবে না।',
  'e.g. 25000': 'যেমন 25000', 'e.g. 15000': 'যেমন 15000',
  'Your expenses are higher than your income. A new loan would be hard to repay — we suggest lowering costs first.': 'আপনার খরচ আয়ের চেয়ে বেশি। নতুন লোন শোধ করা কঠিন হবে — আগে খরচ কমানোর পরামর্শ দিচ্ছি।',
  'EMI Compare': 'কিস্তি তুলনা', 'Loan amount': 'লোনের পরিমাণ', 'Monthly': 'মাসিক', 'Upfront fee': 'অগ্রিম ফি', 'Total cost': 'মোট খরচ',
  // tips
  'Smart Tips': 'স্মার্ট টিপস', 'Borrow smart, pay less': 'বুদ্ধি করে নিন, কম খরচ করুন', 'Simple habits that save money and grow your loan limit.': 'সহজ কিছু অভ্যাস যা টাকা বাঁচায় আর লোন সীমা বাড়ায়।',
  'Borrow what you need': 'যতটুকু দরকার ততটুকু নিন', 'A smaller loan is easier to repay on time — and on-time loans raise your trust level and your next limit.': 'ছোট লোন সময়মতো শোধ করা সহজ — আর সময়মতো শোধ করলে ট্রাস্ট লেভেল ও পরের সীমা বাড়ে।',
  'Plan my budget →': 'বাজেট প্ল্যান করুন →', 'Compare before you choose': 'বেছে নেওয়ার আগে তুলনা করুন', 'Compare terms →': 'মেয়াদ তুলনা →', 'Compare terms': 'মেয়াদ তুলনা',
  'Part of the fee is fixed, so per ৳1,000 a bigger loan can cost less — but you repay more in total. EMI Compare shows both numbers side by side.': 'ফি-র একটা অংশ নির্দিষ্ট, তাই প্রতি ৳১,০০০-এ বড় লোনে খরচ কম পড়তে পারে — কিন্তু মোট বেশি শোধ করতে হয়। কিস্তি তুলনায় দুটো হিসাবই পাশাপাশি দেখুন।',
  'Pay every installment on time': 'প্রতিটি কিস্তি সময়মতো দিন', 'Each loan repaid on time adds to your loan limit. A late installment lowers your trust score until it is paid.': 'প্রতিটি লোন সময়মতো শোধ করলে লোন সীমা বাড়ে। দেরির কিস্তি পরিশোধ না হওয়া পর্যন্ত ট্রাস্ট স্কোর কমিয়ে রাখে।',
  'My loans →': 'আমার লোন →', 'A verified number is reviewed with more trust and raises your loan limit.': 'ভেরিফায়েড নম্বর বেশি আস্থায় রিভিউ হয় এবং লোন সীমা বাড়ায়।', 'Verify now →': 'এখনই ভেরিফাই →',
  'Pay off early when you can': 'পারলে আগেই শোধ করুন', 'Clearing a loan early frees you sooner and grows your trust level.': 'আগে লোন শেষ করলে দ্রুত মুক্ত হন আর ট্রাস্ট লেভেল বাড়ে।', 'Early payoff →': 'আগাম পরিশোধ →',
  'Never share your password': 'পাসওয়ার্ড কখনো শেয়ার করবেন না', 'Creditfy will never ask for your password or PIN. Pay only to the numbers shown inside the app.': 'ক্রেডিটফাই কখনো আপনার পাসওয়ার্ড বা পিন চাইবে না। শুধু অ্যাপে দেখানো নম্বরে টাকা দিন।', 'Stay safe →': 'নিরাপদ থাকুন →',
  // partners
  'Partners & Sites': 'পার্টনার ও সাইট', 'Partner sites are coming soon.': 'পার্টনার সাইট শীঘ্রই আসছে।', 'Sponsored': 'স্পন্সরড', 'Helpful services we recommend. Links open in your browser.': 'আমাদের সুপারিশ করা দরকারি সার্ভিস। লিংক আপনার ব্রাউজারে খুলবে।',
  'Sponsored links are from our partners. Creditfy is not responsible for other websites.': 'স্পন্সরড লিংকগুলো আমাদের পার্টনারদের। অন্য ওয়েবসাইটের দায় ক্রেডিটফাই-এর নয়।',
  // help center
  'Help Center': 'হেল্প সেন্টার', 'Search questions': 'প্রশ্ন খুঁজুন', 'All': 'সব', 'Fees': 'ফি', 'Payments': 'পেমেন্ট', 'General': 'সাধারণ', 'Still need help?': 'আরও সাহায্য দরকার?', 'Our team is happy to help.': 'আমাদের টিম সাহায্য করতে প্রস্তুত।',
  'Support': 'সাপোর্ট', 'Call me': 'আমাকে কল করুন', 'No answer found. Try other words or contact support.': 'উত্তর পাওয়া যায়নি। অন্য শব্দে খুঁজুন বা সাপোর্টে যোগাযোগ করুন।',
  'How long does approval take?': 'অনুমোদনে কত সময় লাগে?', 'Normal applications are reviewed in 7–15 days. VIP Express members get a decision and the money within 72 hours, or their VIP fee back.': 'সাধারণ আবেদন ৭–১৫ দিনে রিভিউ হয়। ভিআইপি এক্সপ্রেস সদস্যরা ৭২ ঘণ্টার মধ্যে সিদ্ধান্ত ও টাকা পান, নইলে ভিআইপি ফি ফেরত।',
  'How much can I borrow?': 'কত টাকা লোন নিতে পারব?', 'Up to the maximum shown on the home page. Your personal limit grows as you repay loans on time, verify your number or join VIP — see Loan Limit.': 'হোম পেজে দেখানো সর্বোচ্চ পর্যন্ত। সময়মতো লোন শোধ, নম্বর ভেরিফাই বা ভিআইপি নিলে আপনার ব্যক্তিগত সীমা বাড়ে — লোন সীমা দেখুন।',
  'What fees do I pay?': 'কী কী ফি দিতে হয়?', 'All fees and the upfront interest are shown before you apply and again on the fee page. See “Fees Explained” for the full list.': 'সব ফি ও অগ্রিম সুদ আবেদনের আগে এবং ফি পেজে আবার দেখানো হয়। পুরো তালিকা “ফি-র ব্যাখ্যা”-তে দেখুন।',
  'Can I use a promo code on my fee?': 'ফি-তে কি প্রোমো কোড দেওয়া যায়?', 'No — fees take no promo code or coupon. The only reduction is your one-time ৳100 sign-up bonus from your balance.': 'না — ফি-তে কোনো প্রোমো কোড বা কুপন চলে না। একমাত্র ছাড় আপনার ব্যালেন্সের এককালীন ৳১০০ সাইন-আপ বোনাস।',
  'Will I get my fee back if I am rejected?': 'বাতিল হলে কি ফি ফেরত পাব?', 'Yes — if your application is rejected, the fee is refunded to the number you paid from.': 'হ্যাঁ — আবেদন বাতিল হলে যে নম্বর থেকে দিয়েছেন সেখানে ফি ফেরত যায়।',
  'How do I pay an installment?': 'কিস্তি কীভাবে দেব?', 'Open Quick Services → Pay Installment, send the amount to the number shown, then enter the Transaction ID. We verify it and update your loan.': 'কুইক সার্ভিস → কিস্তি পরিশোধ খুলুন, দেখানো নম্বরে টাকা পাঠান, তারপর ট্রানজেকশন আইডি দিন। আমরা যাচাই করে লোন আপডেট করব।',
  'Can I repay early?': 'আগে কি শোধ করা যায়?', 'Yes. Early Payoff shows the exact amount to clear your loan today.': 'হ্যাঁ। আগাম পরিশোধে আজ লোন শেষ করার সঠিক অঙ্ক দেখায়।',
  'What is the Verified badge?': 'ভেরিফায়েড ব্যাজ কী?', 'A one-time ৳100 payment (from any bKash / Nagad number) shows that you are a serious customer. You get a premium Verified badge next to your number and on your profile, and it helps your approval. The full fee is paid — no promo or discount applies.': 'এককালীন ৳১০০ পেমেন্ট (যেকোনো বিকাশ / নগদ নম্বর থেকে) দেখায় আপনি একজন আন্তরিক গ্রাহক। আপনার নম্বর ও প্রোফাইলে প্রিমিয়াম ভেরিফায়েড ব্যাজ দেখাবে, আর এটা অনুমোদনে সাহায্য করে। পুরো ফি দিতে হয় — কোনো প্রোমো বা ছাড় নেই।',
  'I forgot my password': 'পাসওয়ার্ড ভুলে গেছি', 'Contact support from the Support page. For your safety, our team will confirm it is you before setting a new password.': 'সাপোর্ট পেজ থেকে যোগাযোগ করুন। আপনার নিরাপত্তার জন্য নতুন পাসওয়ার্ড দেওয়ার আগে আমাদের টিম নিশ্চিত হবে যে এটা আপনি।',
  // fees
  'Fees Explained': 'ফি-র ব্যাখ্যা', 'No hidden charges': 'কোনো লুকানো চার্জ নেই', 'Every taka you pay, and why. The exact amounts for your loan are shown before you apply.': 'প্রতিটি টাকা কেন দিচ্ছেন। আপনার লোনের সঠিক অঙ্ক আবেদনের আগেই দেখানো হয়।',
  'Origination fee': 'অরিজিনেশন ফি', 'One-time, for opening your loan': 'এককালীন, লোন খোলার জন্য', 'Service charge': 'সার্ভিস চার্জ', 'Handling your application': 'আবেদন প্রক্রিয়ার জন্য', 'Processing fee': 'প্রসেসিং ফি', 'Checking your documents': 'কাগজপত্র যাচাইয়ের জন্য',
  'Interest': 'সুদ', 'Interest (paid upfront)': 'সুদ (অগ্রিম)', 'Paid before review': 'রিভিউয়ের আগে দেয়', 'Monthly installment after you get the money': 'টাকা পাওয়ার পর মাসিক কিস্তি', 'Share of the loan amount': 'লোনের অংশ হিসেবে', 'Fixed': 'নির্দিষ্ট', 'Per year, paid upfront': 'বার্ষিক, অগ্রিম',
  'Because interest is paid upfront, your installments repay only the loan amount.': 'সুদ অগ্রিম দেওয়া হয় বলে কিস্তিতে শুধু লোনের টাকা শোধ হয়।', 'Installments include interest as shown in the calculator.': 'ক্যালকুলেটরে দেখানো মতো কিস্তিতে সুদ ধরা আছে।',
  'Refund policy': 'ফেরতের নীতি', 'If your application is rejected, the full fee you paid is refunded to the number you paid from.': 'আবেদন বাতিল হলে আপনার দেওয়া পুরো ফি যে নম্বর থেকে দিয়েছেন সেখানে ফেরত দেওয়া হয়।', 'Calculator': 'ক্যালকুলেটর',
  // safety
  'Stay Safe': 'নিরাপদ থাকুন', 'Beware of fake loan offers': 'ভুয়া লোন অফার থেকে সাবধান', 'Scammers pretend to be loan companies. These checks keep your money safe.': 'প্রতারকরা লোন কোম্পানি সেজে আসে। এই বিষয়গুলো খেয়াল রাখলে আপনার টাকা নিরাপদ থাকবে।',
  'Our official numbers': 'আমাদের অফিসিয়াল নম্বর', 'Never do this': 'কখনো এসব করবেন না', 'Report a scam': 'প্রতারণা রিপোর্ট করুন', 'Hotline': 'হটলাইন', 'Numbers are shown inside the app when you pay.': 'পেমেন্টের সময় অ্যাপেই নম্বর দেখানো হয়।',
  'Creditfy never asks for your password, PIN or OTP — not by call, SMS or WhatsApp.': 'ক্রেডিটফাই কখনো আপনার পাসওয়ার্ড, পিন বা ওটিপি চায় না — কল, এসএমএস বা হোয়াটসঅ্যাপে কোনোভাবেই না।',
  'Pay only to the numbers shown inside the app. We never ask you to pay to a personal number someone sends you.': 'শুধু অ্যাপে দেখানো নম্বরে টাকা দিন। কেউ ব্যক্তিগত নম্বর পাঠিয়ে টাকা চাইলে সেটা আমরা নই।',
  'Our team never asks for “extra charges” by phone to release your loan.': 'লোন ছাড়ার জন্য আমাদের টিম কখনো ফোনে “বাড়তি চার্জ” চায় না।', 'If someone pretends to be Creditfy, report it to our support right away.': 'কেউ ক্রেডিটফাই সেজে যোগাযোগ করলে সাথে সাথে আমাদের সাপোর্টে জানান।',
  // call back & offices
  'Call Me Back': 'আমাকে কল করুন', 'We will call you': 'আমরা আপনাকে কল করব', 'Choose a topic and a good time. Our team calls you from an official number.': 'বিষয় ও সুবিধাজনক সময় বেছে নিন। আমাদের টিম অফিসিয়াল নম্বর থেকে কল করবে।',
  'Your name': 'আপনার নাম', 'Phone number': 'ফোন নম্বর', 'Topic': 'বিষয়', 'Best time': 'সুবিধাজনক সময়', 'Note (optional)': 'নোট (ঐচ্ছিক)', 'How can we help?': 'কীভাবে সাহায্য করতে পারি?', 'Request a call': 'কলের অনুরোধ', 'Sending…': 'পাঠানো হচ্ছে…',
  'New loan': 'নতুন লোন', 'My application': 'আমার আবেদন', 'Payment / installment': 'পেমেন্ট / কিস্তি', 'VIP & services': 'ভিআইপি ও সার্ভিস', 'Something else': 'অন্য কিছু',
  'As soon as possible': 'যত দ্রুত সম্ভব', 'Morning (10am – 1pm)': 'সকাল (১০টা – ১টা)', 'Afternoon (2pm – 5pm)': 'দুপুর (২টা – ৫টা)', 'Evening (6pm – 9pm)': 'সন্ধ্যা (৬টা – ৯টা)',
  'Request sent — we will call you soon': 'অনুরোধ পাঠানো হয়েছে — শীঘ্রই কল করব', 'Call-back requests are switched off right now. Please use Support.': 'কলের অনুরোধ এখন বন্ধ। সাপোর্ট ব্যবহার করুন।',
  'Our Offices': 'আমাদের অফিস', 'Head office': 'প্রধান কার্যালয়', 'Directions': 'দিকনির্দেশনা', 'Call': 'কল', 'We work fully online. Use Support or Call Me Back to reach us.': 'আমরা সম্পূর্ণ অনলাইনে কাজ করি। সাপোর্ট বা “আমাকে কল করুন” দিয়ে যোগাযোগ করুন।',
  // profile & invite (main app)
  'Creditfy member': 'ক্রেডিটফাই সদস্য', 'Loan details': 'লোনের তথ্য', 'Personal info': 'ব্যক্তিগত তথ্য', 'Work & income': 'কাজ ও আয়', 'Emergency contacts': 'জরুরি যোগাযোগ', 'NID': 'এনআইডি', 'Receiving account': 'টাকা গ্রহণের অ্যাকাউন্ট',
  'WhatsApp': 'হোয়াটসঅ্যাপ', 'Facebook': 'ফেসবুক', 'Telegram': 'টেলিগ্রাম', 'SMS': 'এসএমএস', 'No transactions found.': 'কোনো লেনদেন পাওয়া যায়নি।', 'Nothing here yet': 'এখানে এখনো কিছু নেই', 'No notifications yet': 'এখনো কোনো নোটিফিকেশন নেই',
  '1st installment free': '১ম কিস্তি ফ্রি', '1st installment free (loans under ৳10,000)': '১ম কিস্তি ফ্রি (৳১০,০০০-এর কম লোনে)', '৳5,000 loan, no need to pay back': '৳৫,০০০ লোন, ফেরত দিতে হবে না', '৳5,000 loan, no pay back': '৳৫,০০০ লোন, ফেরত নেই', '৳50,000 cash reward': '৳৫০,০০০ ক্যাশ পুরস্কার',
  'SUPER HOT OFFER!': 'সুপার হট অফার!', 'First 50 lucky users get the': 'প্রথম ৫০ জন ভাগ্যবান পাবেন', "1st month's installment free!": '১ম মাসের কিস্তি ফ্রি!',
  // messages from the server (toasts)
  'You already checked in today. Come back tomorrow!': 'আজ চেক-ইন হয়ে গেছে। কাল আবার আসুন!', 'You have already used your spin. Come back next time!': 'এবারের স্পিন হয়ে গেছে। পরের বার আসুন!',
  'This code is not valid.': 'এই কোডটি সঠিক নয়।', 'This code has expired.': 'এই কোডের মেয়াদ শেষ।', 'This code has been fully used.': 'এই কোড পুরোপুরি ব্যবহার হয়ে গেছে।', 'You have already used this code.': 'আপনি এই কোড আগেই ব্যবহার করেছেন।',
  'This code is switched off.': 'এই কোড বন্ধ আছে।', 'This code is not active yet.': 'এই কোড এখনো চালু হয়নি।', 'Please enter a valid code.': 'সঠিক কোড দিন।', 'Enter a code': 'কোড দিন', 'Code not valid': 'কোড সঠিক নয়',
  'This is your own gift voucher — send it to a friend to use.': 'এটা আপনার নিজের গিফট ভাউচার — বন্ধুকে পাঠান।', 'Not enough balance for this voucher.': 'এই ভাউচারের জন্য যথেষ্ট ব্যালেন্স নেই।',
  'This Transaction ID has already been used.': 'এই ট্রানজেকশন আইডি আগেই ব্যবহার হয়েছে।', 'Please enter the Transaction ID from your payment SMS.': 'পেমেন্টের এসএমএস থেকে ট্রানজেকশন আইডি দিন।', 'Enter the Transaction ID from your payment SMS': 'পেমেন্টের এসএমএস থেকে ট্রানজেকশন আইডি দিন',
  'Please enter the number you paid from.': 'যে নম্বর থেকে পাঠিয়েছেন তা দিন।', 'You already have a request waiting for review.': 'আপনার একটি অনুরোধ রিভিউয়ের অপেক্ষায় আছে।', 'Your number is already verified.': 'আপনার নম্বর আগেই ভেরিফায়েড।',
  'Payment submitted — we will switch it on after checking': 'পেমেন্ট জমা হয়েছে — যাচাইয়ের পর চালু হবে', 'Voucher created — share the code with your friend': 'ভাউচার তৈরি হয়েছে — কোডটি বন্ধুকে দিন',
  'Your early payoff is already waiting for review.': 'আপনার আগাম পরিশোধ রিভিউয়ের অপেক্ষায় আছে।', 'This loan is not active yet.': 'এই লোন এখনো সক্রিয় হয়নি।', 'This loan is already fully repaid. 🎉': 'এই লোন ইতিমধ্যে সম্পূর্ণ পরিশোধিত। 🎉',
  'You already asked for a call. Our team will call you soon.': 'আপনি আগেই কলের অনুরোধ করেছেন। শীঘ্রই কল করা হবে।', 'Please enter a valid mobile number.': 'সঠিক মোবাইল নম্বর দিন।',
  'Payment Being Confirmed ⏳': 'পেমেন্ট নিশ্চিত হচ্ছে ⏳', 'Opening secure payment…': 'নিরাপদ পেমেন্ট খুলছে…',
  'For Verified members': 'শুধু ভেরিফায়েড সদস্যদের জন্য', 'Verification in progress': 'ভেরিফিকেশন চলছে', 'See all ›': 'সব দেখুন ›',
  'Daily check-in & Spin & Win rewards': 'ডেইলি চেক-ইন ও স্পিন অ্যান্ড উইন পুরস্কার', 'Hot offers, events & prizes': 'হট অফার, ইভেন্ট ও পুরস্কার', 'Redeem codes & gift vouchers': 'রিডিম কোড ও গিফট ভাউচার',
  'Premium badge & better approval chance': 'প্রিমিয়াম ব্যাজ ও অনুমোদনের বেশি সম্ভাবনা', 'Verified Members Only ✨': 'শুধু ভেরিফায়েড সদস্যদের জন্য ✨',
  'Offers and events are for Verified members. Get your Verified badge once and join every offer, event and reward.': 'অফার ও ইভেন্ট শুধু ভেরিফায়েড সদস্যদের জন্য। একবার ভেরিফায়েড ব্যাজ নিন, তারপর সব অফার, ইভেন্ট ও পুরস্কারে অংশ নিন।',
  'This reward is for Verified members. Get your Verified badge to join offers, events and Spin & Win.': 'এই পুরস্কার শুধু ভেরিফায়েড সদস্যদের জন্য। অফার, ইভেন্ট ও স্পিন অ্যান্ড উইনে অংশ নিতে ভেরিফায়েড ব্যাজ নিন।',
  'Redeem codes': 'রিডিম কোড', 'Gift vouchers': 'গিফট ভাউচার',
  'Get verified': 'ভেরিফাই করুন', 'Verify': 'ভেরিফাই', 'Not verified': 'ভেরিফায়েড নয়', 'Get verified ›': 'ভেরিফাই করুন ›', 'Verification pending': 'ভেরিফিকেশন অপেক্ষমাণ', 'Pending': 'অপেক্ষমাণ',
  'Unlock offers & rewards': 'অফার ও পুরস্কার আনলক করুন', 'On Creditfy, offers, events and rewards are for Verified members. Get your Verified badge once to join them all.': 'ক্রেডিটফাই-তে অফার, ইভেন্ট ও পুরস্কার শুধু ভেরিফায়েড সদস্যদের জন্য। একবার ভেরিফায়েড ব্যাজ নিন, সবকিছুতে অংশ নিন।',
  'Daily check-in & Spin & Win': 'ডেইলি চেক-ইন ও স্পিন অ্যান্ড উইন', 'Win balance rewards every day and every month': 'প্রতিদিন ও প্রতি মাসে ব্যালেন্স পুরস্কার জিতুন', 'Join contests and win invite prizes': 'প্রতিযোগিতায় অংশ নিন, ইনভাইট পুরস্কার জিতুন',
  'Add codes and send gifts to friends': 'কোড ব্যবহার করুন, বন্ধুকে গিফট পাঠান', 'Your sign-up bonus is already yours': 'আপনার সাইন-আপ বোনাস আপনারই', 'Use it on your loan fee — no verification needed': 'লোনের ফি-তে ব্যবহার করুন — ভেরিফিকেশন লাগবে না', 'Maybe later': 'পরে দেখব',
  'Language': 'ভাষা',
  'Number copied': 'নম্বর কপি হয়েছে', 'Code copied': 'কোড কপি হয়েছে', 'Copied': 'কপি হয়েছে', 'Could not submit': 'জমা দেওয়া যায়নি', 'Could not send': 'পাঠানো যায়নি', 'Could not load.': 'লোড করা যায়নি।'
});
const M = { Jan: 'জানু', Feb: 'ফেব্রু', Mar: 'মার্চ', Apr: 'এপ্রিল', May: 'মে', Jun: 'জুন', Jul: 'জুলাই', Aug: 'আগস্ট', Sep: 'সেপ্টে', Sept: 'সেপ্টে', Oct: 'অক্টো', Nov: 'নভে', Dec: 'ডিসে' };
const D = s => String(s).replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\b/g, m => M[m] || m).replace(/\bam\b/g, 'এএম').replace(/\bpm\b/g, 'পিএম');
const TK = '(৳ ?[\\d,]+)';
const R = (re, f) => BN_RE.push([new RegExp(re), f]);
R(`^Day (\\d+)$`, 'দিন $1');
R(`^Processing time: (.+) working days$`, 'প্রসেসিং সময়: $1 কর্মদিবস');
R(`^Loan money is processed through the bank, so approval and disbursement can take up to (.+) working days\\. Want it sooner\\? VIP applications get high priority and are reviewed first — a better chance of early approval and disbursement\\.$`, 'লোনের টাকা ব্যাংকের মাধ্যমে প্রসেস হয়, তাই অনুমোদন ও টাকা পেতে $1 কর্মদিবস পর্যন্ত সময় লাগতে পারে। আগে পেতে চান? ভিআইপি আবেদন উচ্চ অগ্রাধিকারে সবার আগে যাচাই হয় — তাই দ্রুত অনুমোদন ও টাকা পাওয়ার সম্ভাবনা বেশি।');
R(`^Loan money is processed through the bank, which normally takes (.+) working days\\. As a VIP member, your application is reviewed first with high priority\\.$`, 'লোনের টাকা ব্যাংকের মাধ্যমে প্রসেস হয়, সাধারণত $1 কর্মদিবস লাগে। ভিআইপি সদস্য হিসেবে আপনার আবেদন উচ্চ অগ্রাধিকারে সবার আগে যাচাই হয়।');
R(`^Verified and VIP members pay no service charge(?: \\((\\d+)%\\))? and no transaction fee on exchange, gift cards, SMM and every Extra Service\\.$`, (m, p) => `ভেরিফায়েড ও ভিআইপি সদস্যদের এক্সচেঞ্জ, গিফট কার্ড, এসএমএম ও সব এক্সট্রা সার্ভিসে কোনো সার্ভিস চার্জ${p ? ` (${p}%)` : ''} বা ট্রানজেকশন ফি লাগে না।`);
R(`^Verified members pay no service charge(?: \\((\\d+)%\\))? and no transaction fee on exchange, gift cards, SMM and every Extra Service\\.$`, (m, p) => `ভেরিফায়েড সদস্যদের এক্সচেঞ্জ, গিফট কার্ড, এসএমএম ও সব এক্সট্রা সার্ভিসে কোনো সার্ভিস চার্জ${p ? ` (${p}%)` : ''} বা ট্রানজেকশন ফি লাগে না।`);
R(`^Verified members skip the (service charge|transaction fee) on every order — a one-time badge that keeps saving\\.$`, (m, k) => `ভেরিফায়েড সদস্যদের প্রতিটি অর্ডারে ${k === 'service charge' ? 'সার্ভিস চার্জ' : 'ট্রানজেকশন ফি'} লাগে না — একবারের ব্যাজ, সঞ্চয় চলতেই থাকে।`);
R(`^Daily check-in · day (\\d+)$`, 'ডেইলি চেক-ইন · দিন $1');
R(`^(\\d+)–(\\d+) days$`, '$1–$2 দিন');
R(`^Enter your monthly numbers\\. We keep your installments under (\\d+)% of the money left after your expenses\\.$`, 'আপনার মাসিক হিসাব দিন। খরচের পর যা বাঁচে তার $1%-এর মধ্যে কিস্তি রাখা হবে।');
R(`^Day (\\d+) done(.*)!$`, 'দিন $1 সম্পন্ন$2!');
R(`^(CU-\\w+) · (\\d+) months · applied (.+)$`, (m, a, b, c) => `${a} · ${b} মাস · আবেদন ${D(c)}`);
R(`^Installment (\\d+) of (\\d+) · was due (.+)$`, (m, a, b, c) => `কিস্তি ${a}/${b} · তারিখ পেরিয়েছে ${D(c)}`);
R(`^Installment (\\d+) of (\\d+) · due (.+)$`, (m, a, b, c) => `কিস্তি ${a}/${b} · পরিশোধের তারিখ ${D(c)}`);
R(`^(CU-\\w+) · installment (\\S+) of (\\d+)(?: · due (.+))?$`, (m, a, b, c, d) => `${a} · কিস্তি ${b}/${c}${d ? ' · তারিখ ' + D(d) : ''}`);
R(`^${TK} waiting for verification$`, '$1 যাচাইয়ের অপেক্ষায়');
R(`^Left on this loan: ${TK}$`, 'এই লোনে বাকি: $1');
R(`^All \\((\\d+)\\)$`, 'সব ($1)');
R(`^(Send Money|Cash Out|Payment|Make Payment) ${TK} to$`, (m, a, b) => `${b} পাঠান (${a === 'Cash Out' ? 'ক্যাশ আউট' : 'সেন্ড মানি'}) এই নম্বরে`);
R(`^2\\. (.+) ${TK} to this number$`, (m, a, b) => `২. এই নম্বরে ${b} পাঠান (${a === 'Cash Out' ? 'ক্যাশ আউট' : 'সেন্ড মানি'})`);
R(`^(.+) · (Send Money|Cash Out|Payment)$`, (m, a, b) => `${a} · ${b === 'Cash Out' ? 'ক্যাশ আউট' : b === 'Payment' ? 'পেমেন্ট' : 'সেন্ড মানি'}`);
R(`^Pay off (CU-\\w+) today$`, 'আজই $1 শোধ করুন');
R(`^Pay off ${TK}$`, '$1 দিয়ে শোধ করুন');
R(`^You save ${TK}$`, 'আপনার সাশ্রয় $1');
R(`^Highest possible: ${TK}$`, 'সর্বোচ্চ সম্ভব: $1');
R(`^(\\d+) loans? repaid$`, '$1টি লোন পরিশোধিত');
R(`^(\\d+) points$`, '$1 পয়েন্ট');
R(`^to (Bronze|Silver|Gold|Platinum)$`, (m, a) => ({ Bronze: 'ব্রোঞ্জ', Silver: 'সিলভার', Gold: 'গোল্ড', Platinum: 'প্লাটিনাম' }[a]) + ' লেভেলে যেতে');
R(`^(Bronze|Silver|Gold|Platinum)\\s*(\\d+)\\+$`, (m, a, b) => ({ Bronze: 'ব্রোঞ্জ', Silver: 'সিলভার', Gold: 'গোল্ড', Platinum: 'প্লাটিনাম' }[a]) + ` ${b}+`);
R(`^(\\d+) mo$`, '$1 মাস');
R(`^(\\d+) months?$`, '$1 মাস');
R(`^${TK} per ৳1,000$`, 'প্রতি ৳১,০০০-এ $1');
R(`^Apply for up to ${TK}$`, 'সর্বোচ্চ $1 এর জন্য আবেদন করুন');
R(`^has the smallest monthly installment \\(${TK}\\)\\.$`, '-এ মাসিক কিস্তি সবচেয়ে কম ($1)।');
R(`^costs the least in total \\(${TK}\\)\\. Fees and interest are shown before you apply — nothing hidden\\.$`, '-এ মোট খরচ সবচেয়ে কম ($1)। ফি ও সুদ আবেদনের আগেই দেখানো হয় — কিছুই লুকানো নেই।');
R(`^Example: ${TK} for (\\d+) months$`, 'উদাহরণ: $1, $2 মাসের জন্য');
R(`^([\\d.]+)% per year, paid upfront with the fee$`, 'বছরে $1%, ফি-এর সাথে অগ্রিম');
R(`^([\\d.]+)% \\/ year$`, 'বছরে $1%');
R(`^Amount \\(your balance: ${TK}\\)$`, 'পরিমাণ (আপনার ব্যালেন্স: $1)');
R(`^From ${TK} to ${TK} · valid (\\d+) days · unused vouchers can be cancelled and the money comes back\\.$`, '$1 থেকে $2 · $3 দিন মেয়াদ · অব্যবহৃত ভাউচার বাতিল করলে টাকা ফেরত আসে।');
R(`^${TK} · valid till (.+)$`, (m, a, b) => `${a} · মেয়াদ ${D(b)} পর্যন্ত`);
R(`^Valid till (.+)$`, (m, a) => `মেয়াদ ${D(a)} পর্যন্ত`);
R(`^(\\d+) days · one-time payment · ≈ ${TK} \\/ month$`, '$1 দিন · এককালীন পেমেন্ট · ≈ মাসে $2');
R(`^(\\d+) years? · one-time payment · ≈ ${TK} \\/ month$`, '$1 বছর · এককালীন পেমেন্ট · ≈ মাসে $2');
R(`^(.+) active$`, (m, a) => /VIP/.test(a) ? `${a} সক্রিয়` : m);
R(`^Valid until (.+) · express (\\d+)-hour service$`, (m, a, b) => `মেয়াদ ${D(a)} পর্যন্ত · ${b} ঘণ্টার এক্সপ্রেস সার্ভিস`);
R(`^Lifetime membership · express (\\d+)-hour service$`, 'আজীবন সদস্যপদ · $1 ঘণ্টার এক্সপ্রেস সার্ভিস');
R(`^(\\d+) hours$`, '$1 ঘণ্টা');
R(`^Verify for ${TK}$`, '$1 দিয়ে ভেরিফাই করুন');
R(`^Since (.+)$`, (m, a) => `${D(a)} থেকে`);
R(`^Next spin (.+)$`, (m, a) => `পরের স্পিন ${D(a)}`);
R(`^You won (.+)! 🎉$`, 'আপনি জিতেছেন $1! 🎉');
R(`^(.+) — try again next time!$`, (m, a) => `${BN[a] || a} — পরের বার আবার চেষ্টা করুন!`);
R(`^(Redeem code|Daily check-in|Gift voucher|Bonus|Check-in|Spin & Win|Sign-up bonus|Voucher sent|Voucher returned|Adjustment|Wallet) · (.+)$`, (m, a, b) => `${BN[a] || a} · ${D(b)}`);
R(`^Redeem code (\\S+)$`, 'রিডিম কোড $1');
R(`^Gift voucher (\\S+)( cancelled)?$`, (m, a, b) => `গিফট ভাউচার ${a}${b ? ' বাতিল' : ''}`);
R(`^Daily check-in · day (\\d+)$`, 'ডেইলি চেক-ইন · দিন $1');
R(`^Spin & Win · (.+)$`, 'স্পিন অ্যান্ড উইন · $1');
R(`^${TK} added to your balance!(.*)$`, '$1 আপনার ব্যালেন্সে যোগ হয়েছে!$2');
R(`^${TK} returned to your balance$`, '$1 আপনার ব্যালেন্সে ফেরত এসেছে');
R(`^${TK} submitted — we will verify it shortly$`, '$1 জমা হয়েছে — শীঘ্রই যাচাই করা হবে');
R(`^(.+) — you save ${TK}!$`, 'আপনার সাশ্রয় $2!');
R(`^(\\d+) of (\\d+) sections complete · tap a section to see what is missing$`, '$2টির মধ্যে $1টি অংশ সম্পূর্ণ · কী বাকি দেখতে একটি অংশে চাপুন');
R(`^(\\d+) missing$`, '$1টি বাকি');
R(`^(\\d+) more active friends to reach (\\d+)$`, '$2 জনে পৌঁছাতে আরও $1 জন সক্রিয় বন্ধু');
R(`^Invite (\\d+) more active friends to unlock: (.+)$`, (m, a, b) => `আরও ${a} জন সক্রিয় বন্ধু আনলে পাবেন: ${BN[b] || b}`);
R(`^Your invite code: (\\d+)$`, 'আপনার আমন্ত্রণ কোড: $1');
R(`^Max ${TK}$`, 'সর্বোচ্চ $1');
R(`^TrxID (\\w+) · (.+)$`, (m, a, b) => `TrxID ${a} · ${D(b)}`);
R(`^(\\d+) installments?$`, '$1টি কিস্তি');
R(`^(\\d+) friends?$`, '$1 জন বন্ধু');
R(`^(\\d+) days?$`, '$1 দিন');
R(`^(\\d+) of (\\d+)$`, '$1 / $2');
R(`^(\\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec) \\d{4})$`, (m, a) => D(a));
R(`^(\\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec), \\d{1,2}:\\d{2} [ap]m)$`, (m, a) => D(a));
R(`^#(\\d+) · (.+)$`, (m, a, b) => `#${a} · ${D(b)}`);
R(`^Sat–Thu(.*)$`, 'শনি–বৃহস্পতি$1');
R(`^Get Verified for (৳ ?[\\d,]+)$`, '$1 দিয়ে ভেরিফায়েড হোন');
R(`^(.+) and all offers, events and rewards are for Verified members\\. Get your Verified badge once and join everything\\.$`, (m, a) => `${BN[a] || a} সহ সব অফার, ইভেন্ট ও পুরস্কার শুধু ভেরিফায়েড সদস্যদের জন্য। একবার ভেরিফায়েড ব্যাজ নিন, তারপর সবকিছুতে অংশ নিন।`);
R(`^We are checking your verification payment\\. (.+) opens as soon as your badge is active\\.$`, (m, a) => `আপনার ভেরিফিকেশন পেমেন্ট যাচাই হচ্ছে। ব্যাজ চালু হলেই ${BN[a] || a} খুলে যাবে।`);
R(`^We are waiting for the payment provider to confirm your fee for (CU-\\w+)\\. This usually takes a few minutes — you will get a notification as soon as it is verified\\. Please do not pay again\\.$`, '$1 এর ফি পেমেন্ট প্রোভাইডারের নিশ্চিতকরণের অপেক্ষায় আছে। সাধারণত কয়েক মিনিট লাগে — যাচাই হলেই নোটিফিকেশন পাবেন। দয়া করে আবার পেমেন্ট করবেন না।');
// re-translate what is already on screen
try { if(document.documentElement.lang === 'bn' && window.setLang) setLang('bn', false); } catch (e) {}
})();
