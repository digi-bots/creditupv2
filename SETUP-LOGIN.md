# নিরাপদ লগইন চালু করার ধাপ (Firebase Authentication)

এই আপডেটের পর:

- **Admin panel**-এ লগইন হবে email + password দিয়ে (Firebase Authentication)। কোডে বা database-এ কোনো পাসওয়ার্ড থাকে না।
- **ইউজাররা** আগের মতোই ফোন নম্বর + পাসওয়ার্ড দিয়ে লগইন করবে। পাসওয়ার্ড Firebase নিজে hash করে রাখে, Firestore-এ আর থাকে না।
- **Firestore rules** দিয়ে প্রত্যেক ইউজার শুধু নিজের data দেখতে পারবে। লোন approve, পেমেন্ট verify, balance বদলানো শুধু admin পারবে।

> ⚠️ **ধাপগুলো এই ক্রমেই করবেন।** ধাপ ৫ (rules publish) সবার শেষে করবেন। নতুন সাইট deploy হওয়ার আগে rules publish করলে পুরনো সাইট কাজ করা বন্ধ করে দেবে।

---

## ধাপ ১ — Vercel-এ Firebase service account (না থাকলে)

অনলাইন পেমেন্টের জন্য এটা আগেই বসানোর কথা ছিল। এখন **লগইন আর রেজিস্ট্রেশনের জন্যও এটা লাগবে।**

1. Firebase Console → ⚙️ **Project settings** → **Service accounts** → **Generate new private key**। একটা JSON ফাইল ডাউনলোড হবে।
2. Vercel → আপনার project → **Settings → Environment Variables**।
3. Name: `FIREBASE_SERVICE_ACCOUNT`। Value: JSON ফাইলের পুরো লেখা paste করুন। Environment: Production (আর চাইলে Preview)।
4. Save করে **Redeploy** করুন।

## ধাপ ২ — Email/Password লগইন চালু করুন

Firebase Console → **Authentication** → (প্রথমবার হলে **Get started**) → **Sign-in method** → **Email/Password** → **Enable** → Save।

## ধাপ ৩ — Admin account বানান

1. **Authentication → Users → Add user**।
2. আপনার admin email আর একটা শক্ত পাসওয়ার্ড দিন (কমপক্ষে ১২ অক্ষর)।
3. তালিকায় নতুন user-এর **User UID** কপি করুন।

## ধাপ ৪ — সেই account-কে admin বানান

1. Firebase Console → **Firestore Database → Data** → **Start collection**।
2. Collection ID: `admins`
3. Document ID: ধাপ ৩-এ কপি করা **UID** paste করুন।
4. যেকোনো একটা field দিন, যেমন `role` = `admin` → Save।

একাধিক admin লাগলে প্রত্যেকের জন্য ধাপ ৩ আর ৪ আবার করুন।

এখন `admin.html`-এ ওই email/password দিয়ে লগইন করে দেখুন।

## ধাপ ৫ — Security rules publish করুন (সবার শেষে)

1. নতুন সাইট deploy হয়েছে আর admin লগইন কাজ করছে কিনা নিশ্চিত হোন।
2. Firebase Console → **Firestore Database → Rules**।
3. এই repo-র `firestore.rules` ফাইলের পুরো লেখা paste করুন → **Publish**।

## ধাপ ৬ — পুরনো admin পাসওয়ার্ড মুছে ফেলুন

Firestore → `admin` collection → `credentials` document → **Delete**। এখানে পুরনো admin পাসওয়ার্ড সাধারণ লেখা হিসেবে আছে, এটা আর লাগবে না।

---

## ইউজারদের জন্য কী বদলাবে

- আপডেটের পর সবাইকে **একবার আবার লগইন** করতে হবে।
- পুরনো ইউজার নিজের আগের পাসওয়ার্ড দিয়ে লগইন করলেই তার account নিজে থেকে নতুন নিরাপদ লগইনে চলে যাবে, আর Firestore থেকে তার পাসওয়ার্ড মুছে যাবে।
- কারো পাসওয়ার্ড ৬ অক্ষরের কম হলে সে "contact support" মেসেজ পাবে। Admin panel → Users → ইউজার খুলে **Reset Login Password** দিয়ে নতুন পাসওয়ার্ড সেট করে দিন।
- পাসওয়ার্ড ভুলে গেলেও admin একইভাবে নতুন পাসওয়ার্ড সেট করে দিতে পারবে। Admin কারো পাসওয়ার্ড দেখতে পারে না।
