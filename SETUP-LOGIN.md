# Steps to turn on secure login (Firebase Authentication)

After this update:

- **Admin panel** login uses email + password (Firebase Authentication). No password is kept in the code or the database.
- **Users** log in with phone number + password as before. Firebase stores the password as a hash; it is no longer kept in Firestore.
- **Firestore rules** let each user see only their own data. Only an admin can approve loans, verify payments or change balances.

> ⚠️ **Do the steps in this order.** Do step 5 (publish rules) last. If you publish the rules before the new site is deployed, the old site stops working.

---

## Step 1 — Firebase service account in Vercel (if not added yet)

This was already needed for online payments. It is now **also needed for login and registration.**

1. Firebase Console → ⚙️ **Project settings** → **Service accounts** → **Generate new private key**. A JSON file downloads.
2. Vercel → your project → **Settings → Environment Variables**.
3. Name: `FIREBASE_SERVICE_ACCOUNT`. Value: paste the full text of the JSON file. Environment: Production (and Preview if you like).
4. Save, then **Redeploy**.

## Step 2 — Turn on Email/Password login

Firebase Console → **Authentication** → (**Get started** the first time) → **Sign-in method** → **Email/Password** → **Enable** → Save.

## Step 3 — Create the admin account

1. **Authentication → Users → Add user**.
2. Enter your admin email and a strong password (at least 12 characters).
3. Copy the new user's **User UID** from the list.

## Step 4 — Make that account an admin

1. Firebase Console → **Firestore Database → Data** → **Start collection**.
2. Collection ID: `admins`
3. Document ID: paste the **UID** you copied in step 3.
4. Add any one field, for example `role` = `admin` → Save.

For more admins, repeat steps 3 and 4 for each one.

Now log in to `admin.html` with that email and password.

## Step 5 — Publish the security rules (last)

1. Make sure the new site is deployed and admin login works.
2. Firebase Console → **Firestore Database → Rules**.
3. Paste the full text of this repo's `firestore.rules` file → **Publish**.

## Step 6 — Delete the old admin password

Firestore → `admin` collection → `credentials` document → **Delete**. It holds the old admin password as plain text and is no longer needed.

---

## What changes for users

- After the update, everyone has to **log in once more**.
- When an existing user logs in with their old password, their account moves to the new secure login automatically, and their password is deleted from Firestore.
- If someone's password is shorter than 6 characters, they see a "contact support" message. Open Admin panel → Users → the user → **Reset Login Password** to set a new one.
- If a user forgets their password, the admin can set a new one the same way. Admins can never see anyone's password.

## Team, roles, overdue check and SEO (after the November update)

1. **Publish the new rules** – open Firebase Console → Firestore Database → Rules, paste the whole
   `firestore.rules` file and press **Publish**. Until you do, every admin keeps full access.
2. **Make yourself Super Admin** – in Firestore → `admins` → your document, add a field
   `role` = `superadmin`. (An admin document without a role is treated as an owner with full access,
   so nothing breaks if you skip this.) Then add your team in **Team & Settings**.
3. **Daily overdue check** – `vercel.json` runs `/api/cron/overdue` every day at 9:00 AM Bangladesh time.
   Optional but recommended: add `CRON_SECRET` (any long random text) in Vercel → Settings →
   Environment Variables; Vercel then signs its own calls and nobody else can start the job.
4. **SEO** – fill in **SEO & Reviews**, then in Google Search Console verify the site with the
   HTML-tag code and submit `https://<your-domain>/sitemap.xml`.
