/* Credit Up service worker: makes the site installable and gives a friendly page when offline.
   Pages and data always come from the network first, so users never see stale loan information. */
const V = 'cu-v1';
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
