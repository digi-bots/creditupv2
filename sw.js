/* Credit Up service worker: installable app, friendly offline page and phone notifications.
   Pages and data always come from the network first, so users never see stale loan information. */
const V = 'cu-v2';
const SHELL = ['/offline.html', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;
  if (req.mode === 'navigate') {
    // the page: network first, the last copy or the offline page when there is no connection
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(V).then(c => c.put('/', copy)).catch(() => {}); return r; })
      .catch(() => caches.match('/').then(r => r || caches.match('/offline.html'))));
    return;
  }
  if (url.pathname.startsWith('/icons/')) e.respondWith(caches.match(req).then(r => r || fetch(req)));
});

// phone notification sent from the admin panel or by an automatic update (Firebase Cloud Messaging)
self.addEventListener('push', e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (err) { p = { data: { body: e.data && e.data.text() } }; }
  const d = { ...(p.notification || {}), ...(p.data || {}) };
  const title = d.title || 'Credit Up';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '', icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', image: d.image || undefined,
    tag: d.tag || 'cu', renotify: true, data: { link: d.link || '/' }, vibrate: [120, 60, 120]
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const link = new URL((e.notification.data && e.notification.data.link) || '/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const same = list.find(c => new URL(c.url).origin === self.location.origin);
    if (same) { same.focus(); return same.navigate ? same.navigate(link).catch(() => {}) : null; }
    return self.clients.openWindow(link);
  }));
});
