// Firebase Admin helpers shared by the account API.
// Needs only FIREBASE_SERVICE_ACCOUNT (service account JSON, plain or base64) in Vercel.
const admin = require('firebase-admin');
const { db } = require('./pay');

// every user signs in to Firebase Auth with an internal e-mail built from the phone number;
// the user only ever sees and types the phone number
const USER_EMAIL_DOMAIN = 'users.creditup.online';
const phoneEmail = (phone) => `${phone}@${USER_EMAIL_DOMAIN}`;
const isPhone = (p) => /^1[0-9]{9}$/.test(String(p || ''));

function auth() { db(); return admin.auth(); }   // db() initialises the admin app

// the signed-in caller, from "Authorization: Bearer <Firebase ID token>"; null when missing or invalid
async function caller(req) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) return null;
  try { return await auth().verifyIdToken(m[1]); } catch (e) { return null; }
}

// an admin is any Firebase Auth account whose UID has a document in the "admins" collection
async function isAdmin(uid) {
  if (!uid) return false;
  const s = await db().collection('admins').doc(uid).get();
  return s.exists;
}

// the user's profile document: new accounts use the phone as the id, older ones a random id
async function findUserDoc(phone) {
  const store = db();
  const byId = await store.collection('users').doc(phone).get();
  if (byId.exists && String(byId.data().phone) === phone) return byId;
  const q = await store.collection('users').where('phone', '==', phone).limit(1).get();
  return q.empty ? null : q.docs[0];
}

module.exports = { admin, db, auth, caller, isAdmin, findUserDoc, phoneEmail, isPhone, USER_EMAIL_DOMAIN };
