// 1) Serves the home page with the admin's SEO settings already in the HTML (search engines and link previews read it).
//    If anything goes wrong the normal static index.html is served, so the site never breaks because of SEO.
// 2) Hides the admin panel behind a secret address. Set ADMIN_PATH in Vercel (e.g. "cf-desk-7k2q9x"),
//    then the panel opens only at https://your-site/cf-desk-7k2q9x and /admin.html shows "not found".
//    Without ADMIN_PATH the panel stays at /admin.html as before.
export const config = { matcher: ['/', '/admin.html', '/admin', '/:slug([^/.]+)'] };

const secret = () => String(process.env.ADMIN_PATH || '').trim().replace(/^\/+|\/+$/g, '');

function notFound() {
  return new Response('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>404</title>'
    + '<body style="font-family:system-ui;text-align:center;padding:60px;color:#555"><h1>404</h1><p>This page could not be found.</p>'
    + '<p><a href="/">Go to home page</a></p></body>', {
    status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' }
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const key = secret();

  if (path === '/admin.html' || path === '/admin') {
    if (!key) return undefined;                                       // no secret set yet: old address keeps working
    if (url.searchParams.get('k') === key) return undefined;          // internal fetch from the secret address below
    return notFound();
  }

  if (path !== '/') {
    if (!key || path.slice(1) !== key) return undefined;              // any other page: untouched
    try {
      const r = await fetch(new URL('/admin.html?k=' + encodeURIComponent(key), url.origin));
      if (r.ok) {
        return new Response(r.body, { status: 200, headers: {
          'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store',
          'x-robots-tag': 'noindex, nofollow'
        } });
      }
    } catch (e) { /* fall through */ }
    return notFound();
  }

  try {
    const r = await fetch(new URL('/api/seo?f=page', url.origin), { headers: { 'x-forwarded-host': url.host } });
    if (r.ok && (r.headers.get('content-type') || '').includes('text/html')) {
      return new Response(r.body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' } });
    }
  } catch (e) { /* fall through to the static page */ }
  return undefined;
}
