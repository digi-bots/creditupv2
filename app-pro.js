/* Credit Up — Bangla / English, install as an app, live application tracking, user reviews and sharing.
   Settings: Admin → App Settings (siteConfig/app) and Admin → SEO & Reviews (siteConfig/seo). */

const _ap = id => document.getElementById(id);
const _ae = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// the module script (Firebase) defines some helpers a little later; wait for them
function _whenReady(name, cb, tries = 80){ if(typeof window[name] === 'function') return cb(window[name]); if(tries > 0) setTimeout(() => _whenReady(name, cb, tries - 1), 150); }
let _APPCFG = null;
function appCfg(){ return new Promise(res => _whenReady('loadAppCfg', f => f().then(c => { _APPCFG = c || {}; res(_APPCFG); }).catch(() => res({}))) ); }

/* ═════════ BANGLA / ENGLISH ═════════ */
const BN = {
  'Please wait...': 'অনুগ্রহ করে অপেক্ষা করুন...', 'Welcome Back!': 'আবার স্বাগতম!', 'Enter your password to continue securely.': 'নিরাপদে চালিয়ে যেতে পাসওয়ার্ড দিন।',
  'Forgot Password?': 'পাসওয়ার্ড ভুলে গেছেন?', 'Contact Support': 'সাপোর্টে যোগাযোগ', 'Cancel': 'বাতিল', 'Login': 'লগইন', 'OK': 'ঠিক আছে', 'Select Option': 'একটি বেছে নিন',
  'Confirm': 'নিশ্চিত করুন', 'Date of Birth': 'জন্ম তারিখ', 'Confirm Your Information': 'আপনার তথ্য নিশ্চিত করুন', 'Accurate info greatly increases approval chances': 'সঠিক তথ্য দিলে অনুমোদনের সম্ভাবনা অনেক বাড়ে',
  'Full Name': 'পূর্ণ নাম', 'E-mail': 'ই-মেইল', 'Gender': 'লিঙ্গ', 'NID / ID No.': 'এনআইডি / আইডি নং', 'Monthly Income': 'মাসিক আয়', 'Confirm & Continue': 'নিশ্চিত করে এগিয়ে যান',
  'Loan Details': 'লোনের বিবরণ', 'Approved Loan Amount': 'অনুমোদিত লোনের পরিমাণ', 'All amounts are in BDT (৳)': 'সব টাকার অঙ্ক বাংলাদেশি টাকায় (৳)', 'Loan Terms': 'লোনের শর্ত', 'Term': 'মেয়াদ',
  'Annual Interest Rate': 'বার্ষিক সুদের হার', 'Interest Amount': 'সুদের পরিমাণ', 'Charges': 'চার্জ', 'Origination Fee': 'অরিজিনেশন ফি', 'Service & Processing Fee': 'সার্ভিস ও প্রসেসিং ফি',
  'Total Upfront Fee': 'মোট অগ্রিম ফি', 'Schedule': 'সময়সূচি', 'Start Date': 'শুরুর তারিখ', 'Due Date': 'পরিশোধের তারিখ', 'Monthly EMI': 'মাসিক কিস্তি', 'You Receive': 'আপনি পাবেন',
  'Total Repayment': 'মোট পরিশোধ', 'View Repayment Schedule': 'কিস্তির তালিকা দেখুন', 'Repayment Schedule': 'কিস্তির তালিকা', 'Loan Amount': 'লোনের পরিমাণ', 'Interest': 'সুদ', 'Total Payable': 'মোট দেয়',
  'Upload Front Side': 'সামনের দিক আপলোড করুন', 'Choose how to add your ID photo': 'আইডির ছবি কীভাবে দেবেন বেছে নিন', 'Take Photo': 'ছবি তুলুন', 'Open camera to capture': 'ক্যামেরা খুলে ছবি তুলুন',
  'Choose from Gallery': 'গ্যালারি থেকে নিন', 'Select an existing photo': 'আগের তোলা ছবি বেছে নিন', 'Notifications': 'নোটিফিকেশন', "You're all caught up": 'নতুন কিছু নেই', 'All': 'সব',
  'My updates': 'আমার আপডেট', 'Announcements': 'ঘোষণা', 'New notification': 'নতুন নোটিফিকেশন', 'Loan Calculator': 'লোন ক্যালকুলেটর', 'Estimate your monthly repayment easily.': 'সহজে মাসিক কিস্তি হিসাব করুন।',
  'Loan Amount (BDT)': 'লোনের পরিমাণ (টাকা)', 'Term (Months)': 'মেয়াদ (মাস)', 'Principal Amount': 'মূল টাকা', 'Monthly Installment': 'মাসিক কিস্তি', 'Apply Loan': 'লোনের আবেদন',
  'Principal + interest only. Any fee is shown before you submit.': 'শুধু মূল টাকা + সুদ। যেকোনো ফি জমা দেওয়ার আগেই দেখানো হয়।', 'Invite friends, earn more': 'বন্ধুদের আমন্ত্রণ জানান, বেশি আয় করুন',
  'Rewards for every friend who joins and stays active': 'যোগ দিয়ে সক্রিয় থাকা প্রতিটি বন্ধুর জন্য পুরস্কার', 'Invite Friends': 'বন্ধুদের আমন্ত্রণ', 'Invite Friends, Get Rewards': 'বন্ধুদের আমন্ত্রণ জানান, পুরস্কার পান',
  'Share your link. When friends join and stay active, you unlock rewards.': 'আপনার লিংক শেয়ার করুন। বন্ধুরা যোগ দিয়ে সক্রিয় থাকলে পুরস্কার পাবেন।', 'Friends joined': 'যোগ দিয়েছে', 'Active friends': 'সক্রিয় বন্ধু',
  'Premium Rewards': 'প্রিমিয়াম পুরস্কার', 'Starter': 'শুরু', 'Bronze': 'ব্রোঞ্জ', 'Silver': 'সিলভার', 'Gold': 'গোল্ড', 'Invite friends to unlock your first reward.': 'প্রথম পুরস্কার পেতে বন্ধুদের আমন্ত্রণ জানান।', 'Share with': 'শেয়ার করুন',
  'Copy Invite': 'আমন্ত্রণ কপি', 'Share Now': 'এখনই শেয়ার', 'Copied': 'কপি হয়েছে', 'Transaction History': 'লেনদেনের ইতিহাস', 'Pending': 'অপেক্ষমাণ', 'Verified': 'যাচাইকৃত', 'Rejected': 'বাতিল',
  'Application Details': 'আবেদনের বিবরণ', 'My Profile': 'আমার প্রোফাইল', 'Active': 'সক্রিয়', 'Balance': 'ব্যালেন্স', 'Applications': 'আবেদন', 'Active invites': 'সক্রিয় আমন্ত্রণ', 'Loan profile': 'লোন প্রোফাইল',
  'Checking your details…': 'আপনার তথ্য দেখা হচ্ছে…', 'Complete my profile': 'প্রোফাইল সম্পূর্ণ করুন', 'Login password': 'লগইন পাসওয়ার্ড', 'Change the password you use to log in': 'লগইনের পাসওয়ার্ড বদলান', 'Change': 'বদলান',
  'Current password': 'বর্তমান পাসওয়ার্ড', 'New password': 'নতুন পাসওয়ার্ড', 'Type the new password again': 'নতুন পাসওয়ার্ড আবার লিখুন', 'At least 8 characters, with letters and numbers.': 'অন্তত ৮ অক্ষর, অক্ষর ও সংখ্যা মিলিয়ে।',
  'Save new password': 'নতুন পাসওয়ার্ড সেভ করুন', 'Invites': 'আমন্ত্রণ', 'Friends who joined with your code': 'আপনার কোডে যোগ দেওয়া বন্ধুরা', 'Invite': 'আমন্ত্রণ', 'Joined': 'যোগ দিয়েছে', 'To next reward': 'পরের পুরস্কারে বাকি',
  'Invited by': 'আমন্ত্রণকারী', 'Have an invite code?': 'আমন্ত্রণ কোড আছে?', 'If a friend invited you, add their code so they get credit. You can add it only once.': 'বন্ধু আমন্ত্রণ জানালে তাঁর কোড দিন, যেন তিনি কৃতিত্ব পান। একবারই দেওয়া যাবে।',
  'Add': 'যোগ করুন', 'Logout': 'লগআউট', 'How can we help?': 'কীভাবে সাহায্য করতে পারি?', 'Chat with our team or get quick answers below.': 'আমাদের টিমের সঙ্গে চ্যাট করুন বা নিচে দ্রুত উত্তর দেখুন।',
  'Quick Help': 'দ্রুত সাহায্য', 'Instant answers about loans & fees': 'লোন ও ফি নিয়ে তাৎক্ষণিক উত্তর', 'Admin Support Chat': 'সাপোর্ট চ্যাট', 'Chat directly with our support team': 'সরাসরি সাপোর্ট টিমের সঙ্গে চ্যাট করুন',
  'WhatsApp Support': 'হোয়াটসঅ্যাপ সাপোর্ট', 'Chat with a human agent': 'একজন প্রতিনিধির সঙ্গে চ্যাট করুন', 'Telegram Support': 'টেলিগ্রাম সাপোর্ট', 'Connect via Telegram': 'টেলিগ্রামে যোগাযোগ',
  'Email Support': 'ই-মেইল সাপোর্ট', 'Send us an email': 'আমাদের ই-মেইল করুন', 'Max Loan Limit': 'সর্বোচ্চ লোন সীমা', 'Processing Fees': 'প্রসেসিং ফি', 'Complaint': 'অভিযোগ', 'Admin Support': 'সাপোর্ট',
  'Conversation Ended': 'কথোপকথন শেষ', 'This chat has been closed.': 'এই চ্যাটটি বন্ধ হয়েছে।', 'Start New Chat': 'নতুন চ্যাট শুরু', 'Smart credit, made simple': 'স্মার্ট ঋণ, সহজ পথে', 'Supported Payments': 'সমর্থিত পেমেন্ট',
  '100% Authentic & Verified': '১০০% আসল ও যাচাইকৃত', '256-bit SSL Encrypted | Safe & Secure': '২৫৬-বিট SSL এনক্রিপ্টেড | নিরাপদ', 'Under Maintenance': 'রক্ষণাবেক্ষণ চলছে',
  'We are currently upgrading our system. Please check back later.': 'আমরা সিস্টেম আপগ্রেড করছি। একটু পরে আবার আসুন।', 'Good morning 👋': 'শুভ সকাল 👋', 'Good afternoon 👋': 'শুভ অপরাহ্ন 👋', 'Good evening 👋': 'শুভ সন্ধ্যা 👋', 'Good night 👋': 'শুভ রাত্রি 👋',
  'Welcome to Credit Up': 'ক্রেডিট আপে স্বাগতম', 'Notice': 'নোটিশ', 'Borrow up to (BDT)': 'সর্বোচ্চ লোন (টাকা)', 'Easy Approval': 'সহজ অনুমোদন', 'Fast Funding': 'দ্রুত টাকা', 'Safe & Secure': 'নিরাপদ ও সুরক্ষিত',
  'Borrow Now': 'লোন নিন', 'Apply for Another': 'আরেকটি আবেদন', 'Already have an account?': 'আগে থেকেই অ্যাকাউন্ট আছে?', 'Login / Register': 'লগইন / রেজিস্টার', 'Application Status': 'আবেদনের অবস্থা',
  'Tap to view your application details': 'আবেদনের বিবরণ দেখতে চাপুন', 'Quick Services': 'দ্রুত সেবা', 'Calculator': 'ক্যালকুলেটর', 'Refer & Earn': 'রেফার করে আয়', 'History': 'ইতিহাস', 'Profile': 'প্রোফাইল',
  'Step 1': 'ধাপ ১', 'Step 2': 'ধাপ ২', 'Step 3': 'ধাপ ৩', 'Apply Online': 'অনলাইনে আবেদন', 'Fill basic info in under a minute — no complex documents needed.': 'এক মিনিটে প্রাথমিক তথ্য দিন — জটিল কাগজপত্র লাগবে না।',
  'Review': 'যাচাই', 'Our team reviews your application and payment, and you can follow the status in the app.': 'আমাদের টিম আপনার আবেদন ও পেমেন্ট যাচাই করে, আর আপনি অ্যাপেই অবস্থা দেখতে পারেন।',
  'Receive Funds': 'টাকা গ্রহণ', 'Approved funds deposited directly into your mobile wallet.': 'অনুমোদিত টাকা সরাসরি আপনার মোবাইল ওয়ালেটে যায়।', 'Live Transactions': 'লাইভ লেনদেন', 'Live': 'লাইভ',
  'Loading recent activity...': 'সাম্প্রতিক কার্যক্রম লোড হচ্ছে...', 'Our Impact': 'আমাদের অর্জন', 'Invite Champions': 'সেরা আমন্ত্রণকারী', 'Live Offer Winners': 'লাইভ অফার বিজয়ী', 'Our Partners': 'আমাদের পার্টনার',
  'Trusted payment & banking network': 'বিশ্বস্ত পেমেন্ট ও ব্যাংকিং নেটওয়ার্ক', 'Secured': 'সুরক্ষিত', '256-bit SSL encryption on every page': 'প্রতিটি পেজে ২৫৬-বিট SSL এনক্রিপশন', 'Verified Payments': 'যাচাইকৃত পেমেন্ট',
  'Every TrxID is checked by our team': 'প্রতিটি TrxID আমাদের টিম যাচাই করে', 'Transparent Fees': 'স্বচ্ছ ফি', 'All fees shown before you apply': 'আবেদনের আগেই সব ফি দেখানো হয়', 'Private': 'গোপনীয়',
  'Your data is never sold or shared': 'আপনার তথ্য কখনো বিক্রি বা শেয়ার করা হয় না', 'Premium Digital Lending': 'প্রিমিয়াম ডিজিটাল লোন', 'Smart credit, made simple — fast, transparent and secure loans from your phone.': 'স্মার্ট ঋণ, সহজ পথে — আপনার ফোন থেকেই দ্রুত, স্বচ্ছ ও নিরাপদ লোন।',
  'Invite & Earn': 'আমন্ত্রণ করে আয়', 'Privacy & Fees': 'গোপনীয়তা ও ফি', 'Support': 'সাপোর্ট', 'Digital Signature': 'ডিজিটাল স্বাক্ষর', 'Authorized Signatory': 'অনুমোদিত স্বাক্ষরকারী',
  'This website is operated and signed by its management.': 'এই ওয়েবসাইটটি এর ব্যবস্থাপনা কর্তৃপক্ষ পরিচালিত ও স্বাক্ষরিত।', 'Before you apply': 'আবেদনের আগে', 'Check the fees and our policy, then tick the box below to continue.': 'ফি ও আমাদের নীতিমালা দেখুন, তারপর নিচের বক্সে টিক দিয়ে এগিয়ে যান।',
  'Welcome back!': 'আবার স্বাগতম!', 'Clear all': 'সব মুছুন', 'Fees & refund': 'ফি ও ফেরত', 'Privacy Policy': 'গোপনীয়তা নীতি', 'Contact us': 'যোগাযোগ করুন', 'Tick the box to continue': 'এগোতে বক্সে টিক দিন',
  'Hello!': 'হ্যালো!', 'Register / Login': 'রেজিস্টার / লগইন', 'Use the phone number linked to your NID for a smoother approval process.': 'দ্রুত অনুমোদনের জন্য এনআইডির সঙ্গে যুক্ত ফোন নম্বর দিন।', 'NEXT': 'পরবর্তী',
  'By continuing you agree to our': 'এগিয়ে গেলে আপনি আমাদের', 'Create Account': 'অ্যাকাউন্ট খুলুন', 'Step complete': 'ধাপ সম্পন্ন', 'Your information is saved.': 'আপনার তথ্য সেভ হয়েছে।', 'Continue': 'চালিয়ে যান',
  'Back to application overview': 'আবেদনের সারসংক্ষেপে ফিরুন', 'Welcome!': 'স্বাগতম!', 'Application Progress': 'আবেদনের অগ্রগতি', 'Basic Information': 'প্রাথমিক তথ্য', 'Personal Information': 'ব্যক্তিগত তথ্য',
  'Emergency Contact': 'জরুরি যোগাযোগ', 'Bank Information': 'ব্যাংক তথ্য', 'Identity Verification': 'পরিচয় যাচাই', 'Apply Now': 'এখনই আবেদন', 'Application': 'আবেদন',
  'Please ensure all information matches your official documents for a smooth approval process.': 'দ্রুত অনুমোদনের জন্য সব তথ্য আপনার সরকারি কাগজপত্রের সঙ্গে মিলিয়ে দিন।', 'E-mail Address': 'ই-মেইল ঠিকানা',
  'NID / National ID Number': 'এনআইডি / জাতীয় পরিচয়পত্র নম্বর', 'Monthly Income (BDT)': 'মাসিক আয় (টাকা)', 'Loan Purpose': 'লোনের উদ্দেশ্য', 'Loan Amount Required': 'প্রয়োজনীয় লোনের পরিমাণ',
  'Repayment Term (Months)': 'পরিশোধের মেয়াদ (মাস)', 'Education Level': 'শিক্ষাগত যোগ্যতা', 'Marital Status': 'বৈবাহিক অবস্থা', 'Number of Children': 'সন্তানের সংখ্যা', 'Occupation': 'পেশা',
  'Company / Employer Name': 'প্রতিষ্ঠান / নিয়োগকর্তার নাম', 'Home Address': 'বাসার ঠিকানা', 'Please provide real contact persons': 'অনুগ্রহ করে সত্যিকারের যোগাযোগের ব্যক্তি দিন', 'First Contact': 'প্রথম যোগাযোগ',
  'Name': 'নাম', 'Relation': 'সম্পর্ক', 'Second Contact': 'দ্বিতীয় যোগাযোগ', "We've pre-filled your registered number — edit it if the loan should be sent elsewhere.": 'আপনার নিবন্ধিত নম্বর আগেই বসানো হয়েছে — অন্য নম্বরে লোন চাইলে বদলে দিন।',
  'Select Wallet Type': 'ওয়ালেটের ধরন বেছে নিন', 'Account Type': 'অ্যাকাউন্টের ধরন', 'Account Holder Name': 'অ্যাকাউন্টধারীর নাম', 'Bank Name': 'ব্যাংকের নাম', 'Branch': 'শাখা', 'Receiving Account Number': 'টাকা গ্রহণের নম্বর',
  'Tap the icon to edit your receiving number.': 'নম্বর বদলাতে আইকনে চাপুন।', 'Tips': 'পরামর্শ', '1. Use your own wallet account to receive the loan.': '১. লোন গ্রহণে নিজের ওয়ালেট অ্যাকাউন্ট ব্যবহার করুন।',
  '2. The number cannot be changed once the loan is active.': '২. লোন চালু হলে নম্বর আর বদলানো যাবে না।', '3. Make sure the wallet is active and registered in your name.': '৩. ওয়ালেটটি চালু ও আপনার নামে নিবন্ধিত কি না নিশ্চিত হন।',
  'Please upload a clear, complete photo of your National ID Card. Blurry or cropped images will delay approval.': 'জাতীয় পরিচয়পত্রের পরিষ্কার ও পুরো ছবি দিন। ঝাপসা বা কাটা ছবিতে অনুমোদন দেরি হবে।',
  'Tap to upload': 'আপলোড করতে চাপুন', 'Photo Uploaded': 'ছবি আপলোড হয়েছে', 'Tap to change': 'বদলাতে চাপুন', 'Front Side': 'সামনের দিক', 'Back Side': 'পেছনের দিক', 'SUBMIT APPLICATION': 'আবেদন জমা দিন',
  'All documents submitted successfully ✓': 'সব কাগজপত্র সফলভাবে জমা হয়েছে ✓', 'Submitting Application': 'আবেদন জমা হচ্ছে', 'We are saving your application. It will be reviewed by our team — this is not an approval.': 'আপনার আবেদন সেভ হচ্ছে। আমাদের টিম যাচাই করবে — এটি অনুমোদন নয়।',
  'Submitting...': 'জমা হচ্ছে...', 'Reviewing...': 'যাচাই হচ্ছে...', 'Uploading details...': 'তথ্য আপলোড হচ্ছে...', 'Saving application...': 'আবেদন সেভ হচ্ছে...', 'Application received ✓': 'আবেদন গৃহীত হয়েছে ✓',
  'Need help? Contact us:': 'সাহায্য দরকার? যোগাযোগ করুন:', 'Application received': 'আবেদন গৃহীত', 'Application submitted': 'আবেদন জমা হয়েছে', 'Requested loan amount (BDT)': 'চাওয়া লোনের পরিমাণ (টাকা)', 'Term:': 'মেয়াদ:', 'months': 'মাস',
  'View Details': 'বিস্তারিত দেখুন', 'If approved, your loan will be sent to': 'অনুমোদিত হলে লোন পাঠানো হবে', 'Proceed to Pay Fee': 'ফি পরিশোধে এগিয়ে যান', 'Fee Payment': 'ফি পরিশোধ',
  'Loan Amount (You Receive)': 'লোনের পরিমাণ (আপনি পাবেন)', 'Service Charge': 'সার্ভিস চার্জ', 'Advance Interest Fee': 'অগ্রিম সুদ', 'Account Balance Applied': 'ব্যালেন্স থেকে কাটা', 'Total Fee to Pay Now': 'এখন মোট পরিশোধযোগ্য ফি',
  'Use Account Balance': 'ব্যালেন্স ব্যবহার করুন', 'Available:': 'আছে:', 'Select Payment Method': 'পেমেন্ট পদ্ধতি বেছে নিন', 'required': 'আবশ্যক', 'Pay Online': 'অনলাইনে পেমেন্ট', 'Amount:': 'পরিমাণ:',
  'No payment method selected yet': 'এখনো কোনো পেমেন্ট পদ্ধতি বাছা হয়নি', 'Tap one of the methods above to see where to send your fee.': 'ফি কোথায় পাঠাবেন দেখতে উপরের একটি পদ্ধতিতে চাপুন।', 'Payment Instructions': 'পেমেন্টের নির্দেশনা',
  'Select a payment method above to see the number and instructions.': 'নম্বর ও নির্দেশনা দেখতে উপরে পেমেন্ট পদ্ধতি বেছে নিন।', 'Note': 'নোট', 'Transaction ID (TrxID) *': 'ট্রানজেকশন আইডি (TrxID) *', 'Paste': 'পেস্ট',
  'Pick a payment method above and paste your TrxID.': 'উপরে পদ্ধতি বেছে TrxID পেস্ট করুন।', 'Submit Transaction ID': 'ট্রানজেকশন আইডি জমা দিন', 'Verification Pending': 'যাচাই চলছে',
  'Your Transaction ID has been submitted. Our team is verifying your payment. This usually takes 5–15 minutes.': 'আপনার ট্রানজেকশন আইডি জমা হয়েছে। আমাদের টিম পেমেন্ট যাচাই করছে। সাধারণত ৫–১৫ মিনিট লাগে।',
  'Transaction ID': 'ট্রানজেকশন আইডি', 'Payment Method': 'পেমেন্ট পদ্ধতি', 'Status': 'অবস্থা', '⏳ Pending Verification': '⏳ যাচাইয়ের অপেক্ষায়', 'Back to Home': 'হোমে ফিরুন',
  'Enter your password': 'পাসওয়ার্ড দিন', 'Type your message...': 'মেসেজ লিখুন...', 'Enter mobile number': 'মোবাইল নম্বর দিন', 'Create password (min 8, letters + numbers)': 'পাসওয়ার্ড দিন (কমপক্ষে ৮, অক্ষর + সংখ্যা)',
  'Confirm password': 'পাসওয়ার্ড নিশ্চিত করুন', 'Name as on the bank account': 'ব্যাংক অ্যাকাউন্টে থাকা নাম', 'Pending Fee Payment': 'ফি পরিশোধ বাকি', 'TrxID Submitted': 'TrxID জমা হয়েছে', 'Fee Verified': 'ফি যাচাই হয়েছে',
  'Approved': 'অনুমোদিত', 'Disbursed': 'টাকা পাঠানো হয়েছে', 'Overdue': 'মেয়াদোত্তীর্ণ', 'Repaid': 'পরিশোধিত', 'Loan approved': 'লোন অনুমোদিত', 'Fee paid': 'ফি পরিশোধিত',
  'Satisfied Users': 'সন্তুষ্ট ব্যবহারকারী', 'Loans Granted': 'অনুমোদিত লোন', 'Total Disbursed': 'মোট বিতরণ', "Today's Disbursed": 'আজকের বিতরণ', 'Real numbers from Credit Up, updated live': 'ক্রেডিট আপের আসল সংখ্যা, লাইভ আপডেট',
  'Invite friends, climb the board and win real rewards': 'বন্ধুদের আমন্ত্রণ জানান, তালিকায় উঠুন, আসল পুরস্কার জিতুন', 'Your name here': 'এখানে আপনার নাম', 'Invite to win': 'আমন্ত্রণ করে জিতুন', 'Be the first!': 'প্রথম হোন!',
  'Close': 'বন্ধ করুন', 'Yes': 'হ্যাঁ', 'No': 'না', 'Save': 'সেভ করুন', 'Submit': 'জমা দিন', 'Back': 'ফিরে যান', 'Next': 'পরবর্তী', 'Done': 'সম্পন্ন', 'Error': 'ত্রুটি', 'Success': 'সফল',
  'Track your application': 'আবেদন ট্র্যাক করুন', 'Get updates on your phone': 'ফোনেই আপডেট পান', 'Turn on': 'চালু করুন', 'Later': 'পরে', 'How to install': 'কীভাবে ইনস্টল করবেন',
  'Know the moment your payment is verified, your loan is approved or the money is sent — even when the app is closed.': 'পেমেন্ট যাচাই, লোন অনুমোদন বা টাকা পাঠানো হলেই জানতে পারবেন — অ্যাপ বন্ধ থাকলেও।',
  'Notifications are on for this phone.': 'এই ফোনে নোটিফিকেশন চালু হয়েছে।', 'Pay the fee': 'ফি পরিশোধ করুন', 'Pay the application fee to continue.': 'এগোতে আবেদনের ফি পরিশোধ করুন।', 'We are sending the money to your account.': 'আপনার অ্যাকাউন্টে টাকা পাঠানো হচ্ছে।',
  'We received your application.': 'আমরা আপনার আবেদন পেয়েছি।', 'Your payment is waiting for verification.': 'আপনার পেমেন্ট যাচাইয়ের অপেক্ষায়।', 'Our team is checking your details.': 'আমাদের টিম আপনার তথ্য যাচাই করছে।', 'Your loan was approved.': 'আপনার লোন অনুমোদিত হয়েছে।',
  'The loan was sent to your account.': 'লোন আপনার অ্যাকাউন্টে পাঠানো হয়েছে।', 'Your fee payment was confirmed.': 'আপনার ফি পেমেন্ট নিশ্চিত হয়েছে।', 'Under review': 'যাচাই চলছে', 'Payment verified': 'পেমেন্ট যাচাই হয়েছে', 'Money sent': 'টাকা পাঠানো হয়েছে', 'Usually takes': 'সাধারণত লাগে',
  'Application not approved': 'আবেদন অনুমোদিত হয়নি', 'What our users say': 'ব্যবহারকারীরা যা বলেন', 'Rate your experience': 'আপনার অভিজ্ঞতা রেট করুন', 'Send review': 'রিভিউ পাঠান',
  'Thank you! Your review will appear after approval.': 'ধন্যবাদ! অনুমোদনের পর আপনার রিভিউ দেখা যাবে।', 'Install app': 'অ্যাপ ইনস্টল', 'Install': 'ইনস্টল', 'Not now': 'এখন না', 'Share Credit Up': 'ক্রেডিট আপ শেয়ার করুন',
  'Love Credit Up? Tell your friends': 'ক্রেডিট আপ ভালো লাগলে বন্ধুদের জানান', 'Copy link': 'লিংক কপি', 'Link copied': 'লিংক কপি হয়েছে', 'reviews': 'রিভিউ', 'Live tracking': 'লাইভ ট্র্যাকিং',
  'Fee for this application': 'এই আবেদনের ফি', 'Pay Fee': 'ফি দিন', 'View Verification Status': 'যাচাইয়ের অবস্থা দেখুন', 'View Loan Details': 'লোনের বিবরণ দেখুন', 'Loan Amount': 'লোনের পরিমাণ', 'Fee TrxID': 'ফি TrxID', 'Applied On': 'আবেদনের তারিখ'
};
const BN_RE = [
  [/^Step (\d) \/ (\d)$/, 'ধাপ $1 / $2'], [/^Step (\d) of (\d)$/, 'ধাপ $1 / $2'], [/^(\d+) installments$/, '$1টি কিস্তি'], [/^(\d+) Months?$/, '$1 মাস'], [/^(\d+) active friends$/, '$1 জন সক্রিয় বন্ধু'],
  [/^(\d+) friends$/, '$1 জন বন্ধু'], [/^(\d+) winners?$/, '$1 জন বিজয়ী'], [/^(\d+) min ago$/, '$1 মিনিট আগে'], [/^(\d+) hr ago$/, '$1 ঘণ্টা আগে'], [/^just now$/, 'এইমাত্র'], [/^(\d+) today$/, 'আজ $1টি'],
  [/^(1st|2nd|3rd|4th|5th) target$/i, (m, a) => ({ '1st': '১ম', '2nd': '২য়', '3rd': '৩য়', '4th': '৪র্থ', '5th': '৫ম' }[a.toLowerCase()] || a) + ' লক্ষ্য'], [/^Usually takes Within (\d+) hours$/, 'সাধারণত $1 ঘণ্টার মধ্যে'], [/^Usually takes (.+)$/, 'সাধারণত লাগে $1'], [/^(\d+) reviews$/, '$1টি রিভিউ'], [/^Hello, (.+)$/, 'হ্যালো, $1'], [/^Pay Fee for (CU-\w+)$/, '$1 এর ফি দিন']
];
let _LANG = 'en', _CUSTOM = {};
const _SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'NOSCRIPT']);
function _bn(s){
  const k = s.replace(/\s+/g, ' ').trim(); if(!k) return null;
  let v = _CUSTOM[k] || BN[k];
  if(!v) for(const [re, rep] of BN_RE){ if(re.test(k)){ v = k.replace(re, rep); break; } }
  return v ? s.replace(s.trim(), v) : null;
}
function _trNode(n){
  if(n.nodeType === 3){
    const p = n.parentElement; if(!p || _SKIP.has(p.tagName) || p.closest('[data-noi18n]')) return;
    if(n._bnv !== undefined && n.nodeValue !== n._bnv) { n._en = undefined; n._bnv = undefined; }   // the app changed the text: start again
    if(_LANG === 'bn'){ const en = n._en ?? n.nodeValue; const v = _bn(en); if(v && v !== n.nodeValue){ n._en = en; n._bnv = v; n.nodeValue = v; } }
    else if(n._en !== undefined){ n.nodeValue = n._en; n._en = undefined; n._bnv = undefined; }
    return;
  }
  if(n.nodeType !== 1 || _SKIP.has(n.tagName) && n.tagName !== 'INPUT' && n.tagName !== 'TEXTAREA' || n.hasAttribute('data-noi18n')) return;
  ['placeholder', 'title', 'aria-label'].forEach(a => {
    if(!n.hasAttribute(a)) return;
    const key = 'en' + a.replace(/-/g, '');
    if(_LANG === 'bn'){ const en = n.dataset[key] ?? n.getAttribute(a); const v = _bn(en); if(v){ n.dataset[key] = en; n.setAttribute(a, v); } }
    else if(n.dataset[key] !== undefined){ n.setAttribute(a, n.dataset[key]); delete n.dataset[key]; }
  });
  if(n.tagName === 'INPUT' || n.tagName === 'TEXTAREA') return;
  for(let c = n.firstChild; c; c = c.nextSibling) _trNode(c);
}
let _trQ = new Set(), _trRaf = 0;
const _mo = new MutationObserver(ms => {
  if(_LANG !== 'bn') return;
  ms.forEach(m => { if(m.type === 'characterData') _trQ.add(m.target); else m.addedNodes.forEach(x => _trQ.add(x)); if(m.type === 'attributes') _trQ.add(m.target); });
  if(!_trRaf) _trRaf = requestAnimationFrame(() => { _trRaf = 0; const q = [..._trQ]; _trQ.clear(); _mo.disconnect(); q.forEach(_trNode); _observe(); });
});
function _observe(){ _mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder'] }); }
function setLang(l, save = true){
  _LANG = l === 'bn' ? 'bn' : 'en';
  document.documentElement.lang = _LANG;
  document.documentElement.classList.toggle('lang-bn', _LANG === 'bn');
  if(save) try{ localStorage.setItem('cu_lang', _LANG); }catch(e){}
  _mo.disconnect(); _trNode(document.body); if(_LANG === 'bn') _observe();
  const b = _ap('langSw'); if(b){ b.textContent = _LANG === 'bn' ? 'EN' : 'বাং'; b.title = _LANG === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'; }
}
window.setLang = setLang;
function _langInit(cfg){
  const L = { on: true, showSwitch: true, def: 'en', custom: [], ...((cfg || {}).lang || {}) };
  _CUSTOM = {}; (L.custom || []).forEach(x => { if(x && x.en && x.bn) _CUSTOM[String(x.en).replace(/\s+/g, ' ').trim()] = x.bn; });
  let saved = null; try{ saved = localStorage.getItem('cu_lang'); }catch(e){}
  const acts = document.querySelector('#appBar .ab-acts');
  if(L.on !== false && L.showSwitch !== false && acts && !_ap('langSw')){
    const b = document.createElement('button'); b.id = 'langSw'; b.className = 'lang-sw'; b.type = 'button'; b.setAttribute('data-noi18n', '');
    b.onclick = () => setLang(_LANG === 'bn' ? 'en' : 'bn'); acts.insertBefore(b, acts.firstChild);
  }
  setLang(L.on === false ? 'en' : (saved || L.def || 'en'), false);
}

/* ═════════ LIVE APPLICATION TRACKING ═════════ */
const TL_DEF = { on: true, live: true, showTimes: true, showEta: true, rejected: 'Application not approved', note: '',
  steps: { submitted: { on: true, label: 'Application submitted', desc: 'We received your application.' }, fee: { on: true, label: 'Fee paid', desc: 'Your payment is waiting for verification.', eta: '5–15 min' },
    feeVerified: { on: true, label: 'Payment verified', desc: 'Your fee payment was confirmed.' }, review: { on: true, label: 'Under review', desc: 'Our team is checking your details.', eta: 'Within 24 hours' },
    approved: { on: true, label: 'Loan approved', desc: 'Your loan was approved.' }, disbursed: { on: true, label: 'Money sent', desc: 'The loan was sent to your account.' } } };
const TL_ORDER = ['submitted', 'fee', 'feeVerified', 'review', 'approved', 'disbursed'];
function _tlCfg(){ const T = { ...TL_DEF, ...((_APPCFG || {}).timeline || {}) }; T.steps = { ...TL_DEF.steps, ...(T.steps || {}) }; return T; }
// how far an application is: index of the step it is on now, and where it failed (if rejected)
function _tlState(a){
  const s = a.status || '';
  // the step the application is waiting on now (its text says what happens next)
  const cur = { 'Pending Fee Payment': 1, 'TrxID Submitted': 1, 'Fee Verified': 3, 'Approved': 5, 'Disbursed': 6, 'Active': 6, 'Repaid': 6, 'Overdue': 6 }[s];
  if(s === 'Rejected') return { cur: 3, fail: 3 };
  if(s === 'Disbursement Rejected') return { cur: 5, fail: 5 };
  return { cur: cur ?? 1, fail: -1 };
}
function _tlTime(t){ if(!t) return ''; const d = new Date(t); if(isNaN(d)) return ''; return d.toLocaleString(_LANG === 'bn' ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
window._tlHtml = function(a){
  const T = _tlCfg(); if(T.on === false || !a) return '';
  const trx = (window._trxByApp || {})[a.id] || {};
  const at = { submitted: a.submittedAt, fee: trx.submittedAt || (a.status !== 'Pending Fee Payment' ? a.statusUpdatedAt : ''), feeVerified: a.feeVerifiedAt || trx.verifiedAt, review: a.feeVerifiedAt || trx.verifiedAt, approved: a.approvedAt, disbursed: a.disbursedAt || a.creditedAt };
  const { cur, fail } = _tlState(a);
  const steps = TL_ORDER.map((k, i) => ({ k, i, ...T.steps[k] })).filter(x => x.on !== false);
  const unpaid = a.status === 'Pending Fee Payment';
  const rows = steps.map(x => {
    const done = x.i < cur && !(fail >= 0 && x.i >= fail), now = x.i === cur && fail < 0, bad = fail >= 0 && x.i === fail;
    const st = bad ? 'bad' : done ? 'done' : now ? 'now' : 'todo';
    const label = bad ? (T.rejected || 'Application not approved') : (now && x.k === 'fee' && unpaid ? 'Pay the fee' : x.label);
    const desc = now ? (x.k === 'fee' && unpaid ? 'Pay the application fee to continue.' : x.k === 'disbursed' ? 'We are sending the money to your account.' : x.desc) : '';
    const time = T.showTimes !== false && (done || now) && at[x.k] && !(now && unpaid) ? `<span class="tl-time">${_tlTime(at[x.k])}</span>` : '';
    const eta = T.showEta !== false && now && x.eta && !unpaid ? `<span class="tl-eta"><i class="fa-regular fa-clock"></i> Usually takes ${_ae(x.eta)}</span>` : '';
    return `<div class="tl-s ${st}"><div class="tl-dot">${bad ? '<i class="fa-solid fa-xmark"></i>' : done ? '<i class="fa-solid fa-check"></i>' : ''}</div><div class="tl-b"><b>${_ae(label)}</b>${time}${desc ? `<p>${_ae(desc)}</p>` : ''}${eta}</div></div>`;
  }).join('');
  return `<div class="tl-box"><div class="tl-h"><i class="fa-solid fa-route"></i> Track your application${T.live !== false ? '<span class="tl-live"><i></i>Live tracking</span>' : ''}</div>${rows}${T.note ? `<div class="tl-note">${_ae(T.note)}</div>` : ''}</div>`;
};
// while the details popup is open, the applications are watched and the timeline updates by itself
let _tlUnsub = [];
window._tlStart = function(apps){
  window._tlStop();
  if(_tlCfg().live === false || typeof window._watchApps !== 'function') return;
  _tlUnsub = window._watchApps((apps || []).map(a => a.id).filter(Boolean), (id, data) => {
    if(!data) return;
    const L = window._allApps || []; const i = L.findIndex(a => a.id === id);
    const before = i >= 0 ? JSON.stringify(L[i]) : '';
    if(i >= 0) L[i] = { ...L[i], ...data, id };
    if(window._latestApp && window._latestApp.id === id) window._latestApp = { ...window._latestApp, ...data, id };
    if(i >= 0 && JSON.stringify(L[i]) !== before && _ap('appStatusModal')?.classList.contains('on') && typeof openAppStatusModal === 'function') openAppStatusModal(true);
  });
};
window._tlStop = function(){ _tlUnsub.forEach(u => { try{ u(); }catch(e){} }); _tlUnsub = []; };

/* ═════════ INSTALL AS AN APP (PWA) ═════════ */
let _bip = null;
const _standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const _ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); _bip = e; document.documentElement.classList.add('can-install'); });
window.addEventListener('appinstalled', () => { _bip = null; _pwHide(); try{ localStorage.setItem('cu_installed', '1'); }catch(e){} });
window.cuInstall = async function(){
  if(_bip){ _bip.prompt(); const r = await _bip.userChoice.catch(() => null); _bip = null; _pwHide(); return r; }
  if(_ios()) return _pwIosHelp();
  if(typeof showAlert === 'function') showAlert('Install app', 'Open this site in Chrome and choose “Install app” or “Add to Home screen” from the browser menu.', 'info');
};
function _pwHide(){ _ap('pwBar')?.classList.remove('on'); }
function _pwIosHelp(){
  if(typeof showAlert === 'function') showAlert('Add to Home Screen', 'Tap the Share button in Safari, then choose “Add to Home Screen”. The app opens full screen like a normal app.', 'info');
}
function _pwInit(cfg){
  const P = { on: true, prompt: true, promptText: 'Install the Credit Up app — opens faster and works like a real app.', btn: 'Install', delay: 15, iosHint: true, ...((cfg || {}).pwa || {}) };
  if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('/sw.js').catch(() => {});
  if(P.on === false || P.prompt === false || _standalone()) return;
  let last = 0; try{ last = Number(localStorage.getItem('cu_pw_dismiss') || 0); }catch(e){}
  if(Date.now() - last < 7 * 864e5) return;
  setTimeout(() => {
    if(_standalone() || (!_bip && !(_ios() && P.iosHint !== false))) return;
    let bar = _ap('pwBar');
    if(!bar){ bar = document.createElement('div'); bar.id = 'pwBar'; bar.className = 'pw-bar'; document.body.appendChild(bar); }
    bar.innerHTML = `<div class="pw-ic"><img src="/icons/icon-192.png" alt="" onerror="this.remove()"></div><div class="pw-t">${_ae(P.promptText)}</div><button class="pw-go" type="button">${_ae(P.btn || 'Install')}</button><button class="pw-x" type="button" aria-label="Not now"><i class="fa-solid fa-xmark"></i></button>`;
    bar.querySelector('.pw-go').onclick = () => window.cuInstall();
    bar.querySelector('.pw-x').onclick = () => { _pwHide(); try{ localStorage.setItem('cu_pw_dismiss', String(Date.now())); }catch(e){} };
    requestAnimationFrame(() => bar.classList.add('on'));
  }, Math.max(0, Number(P.delay) || 0) * 1000);
}
// shortcuts from the installed app icon (long-press menu): ?go=apply, ?go=calc
function _goShortcut(){
  const g = new URLSearchParams(location.search).get('go');
  if(g === 'calc') _whenReady('openCalculator', f => setTimeout(f, 800));
  if(g === 'apply') _whenReady('handleMainAction', f => setTimeout(f, 1200));
  if(g === 'notifications') _whenReady('openNotificationModal', f => setTimeout(() => { if(typeof _getUser === 'function' && _getUser()) f(); }, 1500));
}

/* ═════════ USER REVIEWS + SHARING ═════════ */
function _stars(n){ n = Math.round(Number(n) || 0); return '<span class="rvw-st">' + '★'.repeat(n) + '<span>' + '★'.repeat(5 - n) + '</span></span>'; }
function _rvRender(d){
  const R = (d && d.reviews) || null, C = (d && d.reviewCfg) || {};
  let blk = _ap('rvwBlock');
  if(!blk){ const pb = _ap('partnerBlock'); if(!pb) return; blk = document.createElement('div'); blk.id = 'rvwBlock'; blk.className = 'rvw'; pb.parentNode.insertBefore(blk, pb); }
  const items = R && C.on !== false ? R.items || [] : [];
  blk.innerHTML = `${items.length ? `<div class="sx-head"><div class="live-title">${_ae(C.title || 'What our users say')}</div><span class="rvw-avg">${_stars(R.avg)} <b>${R.avg}</b> · ${R.count} reviews</span></div>
    <div class="rvw-row">${items.map(r => `<div class="rvw-c${r.featured ? ' ft' : ''}">${_stars(r.rating)}<p>“${_ae(r.text)}”</p><div class="rvw-n"><span>${_ae(String(r.name || 'U').charAt(0))}</span>${_ae(r.name)}</div></div>`).join('')}</div>` : ''}
    <div id="rvwAsk"></div>
    <div class="rvw-share"><div><b>Love Credit Up? Tell your friends</b><small>Sharing helps more people find a fair loan.</small></div>
      <div class="rvw-sb"><a class="s-wa" target="_blank" rel="noopener" id="shWa"><i class="fa-brands fa-whatsapp"></i></a><a class="s-fb" target="_blank" rel="noopener" id="shFb"><i class="fa-brands fa-facebook-f"></i></a><a class="s-ms" target="_blank" rel="noopener" id="shMs"><i class="fa-brands fa-facebook-messenger"></i></a><a class="s-cp" role="button" id="shCp"><i class="fa-solid fa-link"></i></a></div></div>`;
  const u = (typeof _getUser === 'function' && _getUser()) || null;
  const link = location.origin + '/?utm_source=share&utm_medium=user' + (u && u.phone ? '&ref=0' + String(u.phone).replace(/^0+/, '') : '');
  const msg = 'I use Credit Up for fast, transparent loans from my phone. Try it: ' + link;
  _ap('shWa').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
  _ap('shFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link);
  _ap('shMs').href = 'fb-messenger://share/?link=' + encodeURIComponent(link);
  _ap('shCp').onclick = () => { (navigator.share ? navigator.share({ title: document.title, text: msg, url: link }) : navigator.clipboard.writeText(msg)).then(() => { if(!navigator.share && typeof showToast === 'function') showToast('Link copied'); }).catch(() => {}); };
  if(u && C.ask !== false) _rvAsk(C);
}
async function _rvAsk(C){
  const box = _ap('rvwAsk'); if(!box || typeof window._api !== 'function') return;
  const r = await window._api('myReview', {}, true).catch(() => null);
  if(!r || !r.ok || !r.data.canReview) return;
  let rating = 0;
  box.innerHTML = `<div class="rvw-ask"><b>Rate your experience</b><small>${_ae(C.askText || 'How was your experience? Your review helps other people choose with confidence.')}</small>
    <div class="rvw-pick">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-v="${i}" aria-label="${i} stars">★</button>`).join('')}</div>
    <textarea id="rvwTx" rows="3" maxlength="400" placeholder="Write a few words about your experience"></textarea><button class="rvw-send" type="button" id="rvwGo">Send review</button><div class="rvw-msg" id="rvwMsg"></div></div>`;
  box.querySelectorAll('.rvw-pick button').forEach(b => b.onclick = () => { rating = Number(b.dataset.v); box.querySelectorAll('.rvw-pick button').forEach(x => x.classList.toggle('on', Number(x.dataset.v) <= rating)); });
  _ap('rvwGo').onclick = async () => {
    const m = _ap('rvwMsg');
    if(!rating){ m.textContent = 'Please choose the stars.'; return; }
    const res = await window._api('submitReview', { rating, text: _ap('rvwTx').value }, true);
    if(!res.ok){ m.textContent = res.data.error || 'Could not send. Please try again.'; return; }
    box.innerHTML = '<div class="rvw-ask done"><i class="fa-solid fa-heart"></i> Thank you! Your review will appear after approval.</div>';
  };
}
window.addEventListener('cu:showcase', e => _rvRender(e.detail));

/* ═════════ PHONE NOTIFICATIONS (push) ═════════ */
const PUSH_DEF = { on: true, askTitle: 'Get updates on your phone', askText: 'Know the moment your payment is verified, your loan is approved or the money is sent — even when the app is closed.', askBtn: 'Turn on', askDelay: 8 };
const _pushDev = () => ((/Android|iPhone|iPad|Windows|Macintosh|Linux/.exec(navigator.userAgent) || ['Web'])[0]).replace('Macintosh', 'Mac') + (_standalone() ? ' app' : ' browser');
async function _pushSync(force){
  // register this device for the signed-in user (quietly, at most once a day)
  if(typeof window._pushToken !== 'function' || typeof window._api !== 'function') return false;
  let last = 0; try{ last = Number(localStorage.getItem('cu_push_at') || 0); }catch(e){}
  if(!force && Date.now() - last < 864e5) return true;
  try{
    const t = await window._pushToken(); if(!t) return false;
    const r = await window._api('pushSubscribe', { token: t, device: _pushDev() }, true);
    if(!r.ok) return false;
    try{ localStorage.setItem('cu_push_token', t); localStorage.setItem('cu_push_at', String(Date.now())); }catch(e){}
    return true;
  }catch(e){ console.warn('push', e); return false; }
}
function _pushCard(P){
  if(_ap('pushCard')) return;
  const ios = _ios() && !_standalone();
  const c = document.createElement('div'); c.id = 'pushCard'; c.className = 'push-card';
  c.innerHTML = `<div class="pc-ic"><i class="fa-solid fa-bell"></i></div><div class="pc-m"><b>${_ae(P.askTitle)}</b><small>${ios ? 'On iPhone: first tap Share → “Add to Home Screen”, open the app from your home screen, then turn on notifications.' : _ae(P.askText)}</small>
    <div class="pc-acts">${ios ? '<button type="button" class="pc-go" data-k="ios">How to install</button>' : `<button type="button" class="pc-go" data-k="on">${_ae(P.askBtn || 'Turn on')}</button>`}<button type="button" class="pc-no">Later</button></div></div>`;
  const home = document.querySelector('#screen-home .home-body'); if(!home) return;
  home.insertBefore(c, home.firstChild);
  c.querySelector('.pc-no').onclick = () => { c.remove(); try{ localStorage.setItem('cu_push_later', String(Date.now())); }catch(e){} };
  c.querySelector('.pc-go').onclick = async ev => {
    if(ev.currentTarget.dataset.k === 'ios') return _pwIosHelp();
    const perm = await Notification.requestPermission().catch(() => 'denied');
    if(perm !== 'granted'){ c.querySelector('small').textContent = 'Notifications are blocked. You can allow them later in your browser’s site settings.'; return; }
    ev.currentTarget.disabled = true; ev.currentTarget.textContent = '…';
    const ok = await _pushSync(true);
    c.innerHTML = ok ? '<div class="pc-ok"><i class="fa-solid fa-circle-check"></i> Notifications are on for this phone.</div>' : '<div class="pc-ok bad">Could not turn on notifications. Please try again later.</div>';
    setTimeout(() => c.remove(), 4000);
  };
}
function _pushInit(cfg){
  const P = { ...PUSH_DEF, ...((cfg || {}).push || {}) };
  if(P.on === false) return;
  const tick = () => {
    const u = typeof _getUser === 'function' && _getUser(); if(!u || !u.phone) return;
    if(!('Notification' in window) || !('serviceWorker' in navigator)){ if(_ios() && !_standalone()) _pushAsk(P); return; }
    if(Notification.permission === 'granted') _pushSync(false);
    else if(Notification.permission === 'default') _pushAsk(P);
  };
  setTimeout(tick, Math.max(2, Number(P.askDelay) || 8) * 1000);
}
function _pushAsk(P){
  let later = 0; try{ later = Number(localStorage.getItem('cu_push_later') || 0); }catch(e){}
  if(Date.now() - later < 3 * 864e5) return;
  _pushCard(P);
}
// signing out: this phone stops getting the account's notifications
_whenReady('logoutUser', f => {
  window.logoutUser = logoutUser = function(){
    let t = null; try{ t = localStorage.getItem('cu_push_token'); localStorage.removeItem('cu_push_token'); localStorage.removeItem('cu_push_at'); }catch(e){}
    if(t && typeof window._api === 'function') window._api('pushUnsubscribe', { token: t }).catch(() => {});
    return f.apply(this, arguments);
  };
});

/* ═════════ BIG SCREENS: side panel next to the app ═════════ */
function _deskInit(cfg){
  if(_ap('deskSide')) return;
  const P = (cfg || {}).pwa || {};
  const d = document.createElement('aside'); d.id = 'deskSide'; d.setAttribute('aria-hidden', 'true');
  d.innerHTML = `<div class="ds-logo">${_ae((typeof _bt === 'function' && _bt('name', 'Credit Up')) || 'Credit Up')}</div><p>${_ae(P.desc || 'Smart credit, made simple — fast, transparent and secure loans from your phone.')}</p>
    <ul><li><i class="fa-solid fa-bolt"></i>Apply in minutes</li><li><i class="fa-solid fa-shield-halved"></i>Fees shown before you apply</li><li><i class="fa-solid fa-mobile-screen"></i>Money to bKash, Nagad or Rocket</li></ul>
    <button type="button" onclick="cuInstall()"><i class="fa-solid fa-download"></i>Install app</button>`;
  document.body.appendChild(d);
}

/* ═════════ BOOT ═════════ */
(async function(){
  const ready = () => document.readyState === 'loading' ? new Promise(r => document.addEventListener('DOMContentLoaded', r)) : Promise.resolve();
  await ready();
  const cfg = await appCfg();
  _langInit(cfg); _pwInit(cfg); _deskInit(cfg); _goShortcut(); _pushInit(cfg);
  if(window._showcase) _rvRender(window._showcase);
})();
