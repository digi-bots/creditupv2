// Serves the home page with the admin's SEO settings already in the HTML (search engines and link previews read it).
// If anything goes wrong the normal static index.html is served, so the site never breaks because of SEO.
export const config = { matcher: '/' };

export default async function middleware(request) {
  try {
    const url = new URL(request.url);
    const r = await fetch(new URL('/api/seo?f=page', url.origin), { headers: { 'x-forwarded-host': url.host } });
    if (r.ok && (r.headers.get('content-type') || '').includes('text/html')) {
      return new Response(r.body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' } });
    }
  } catch (e) { /* fall through to the static page */ }
  return undefined;
}
