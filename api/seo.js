// SEO + app install, all from Admin → SEO & Reviews and App Settings (siteConfig/seo, siteConfig/app).
//   GET /api/seo?f=robots    → robots.txt     (vercel.json rewrites /robots.txt here)
//   GET /api/seo?f=sitemap   → sitemap.xml    (/sitemap.xml)
//   GET /api/seo?f=manifest  → web app manifest (/manifest.webmanifest)
//   GET /api/seo?f=page      → the home page with title, meta, social and structured data filled in (used by middleware.js)
const { db, baseUrl } = require('./_lib/pay');

const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SEO_DEF = { title: 'Creditfy – Smart Loans in Bangladesh', description: 'Apply for a loan from your phone in minutes. Transparent fees, fast review and money sent to bKash, Nagad or Rocket.', keywords: 'loan, online loan, bkash loan, nagad loan, instant loan bangladesh', siteName: 'Creditfy', locale: 'en_BD', index: true };

let cache = { at: 0, data: null };
async function load() {
  if (cache.data && Date.now() - cache.at < 60e3) return cache.data;
  const out = { seo: {}, app: {}, main: {}, reviews: { count: 0, avg: 0, items: [] } };
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return out;
  try {
    const sc = db().collection('siteConfig');
    const [s, a, m, r] = await Promise.all([sc.doc('seo').get(), sc.doc('app').get(), sc.doc('main').get(), db().collection('reviews').where('status', '==', 'approved').get()]);
    out.seo = s.exists ? s.data() : {}; out.app = a.exists ? a.data() : {}; out.main = m.exists ? m.data() : {};
    const rv = r.docs.map(d => d.data()).filter(x => x.removed !== true);
    out.reviews = { count: rv.length, avg: rv.length ? Math.round(rv.reduce((t, x) => t + Number(x.rating || 0), 0) / rv.length * 10) / 10 : 0, items: rv.slice(0, 5) };
  } catch (e) { console.warn('seo load', e.message); }
  cache = { at: Date.now(), data: out };
  return out;
}

// the main address: SEO › Site address, else the official domain
const SITE_URL = 'https://www.creditfy.online';
function siteUrl(S, req) { return String(S.canonical || SITE_URL || baseUrl(req)).replace(/\/+$/, ''); }

function headTags(d, req) {
  const S = { ...SEO_DEF, ...d.seo }, url = siteUrl(S, req);
  const brand = (d.main.branding && d.main.branding.name) || S.siteName || 'Creditfy';
  const ogT = S.ogTitle || S.title, ogD = S.ogDescription || S.description;
  const img = /^https:\/\//i.test(S.ogImage || '') ? S.ogImage : '';
  const t = [];
  t.push(`<meta name="description" content="${esc(S.description)}">`);
  if (S.keywords) t.push(`<meta name="keywords" content="${esc(S.keywords)}">`);
  if (S.author) t.push(`<meta name="author" content="${esc(S.author)}">`);
  t.push(`<meta name="robots" content="${S.index === false ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'}">`);
  t.push(`<link rel="canonical" href="${esc(url)}/">`);
  t.push(`<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(brand)}"><meta property="og:url" content="${esc(url)}/">`);
  t.push(`<meta property="og:title" content="${esc(ogT)}"><meta property="og:description" content="${esc(ogD)}"><meta property="og:locale" content="${esc(S.locale || 'en_BD')}">`);
  if (img) t.push(`<meta property="og:image" content="${esc(img)}"><meta name="twitter:image" content="${esc(img)}">`);
  t.push(`<meta name="twitter:card" content="${img ? 'summary_large_image' : 'summary'}"><meta name="twitter:title" content="${esc(ogT)}"><meta name="twitter:description" content="${esc(ogD)}">`);
  if (S.twitter) t.push(`<meta name="twitter:site" content="@${esc(String(S.twitter).replace(/^@/, ''))}">`);
  const V = S.verify || {};
  if (V.google) t.push(`<meta name="google-site-verification" content="${esc(V.google)}">`);
  if (V.bing) t.push(`<meta name="msvalidate.01" content="${esc(V.bing)}">`);
  if (V.yandex) t.push(`<meta name="yandex-verification" content="${esc(V.yandex)}">`);
  if (V.facebook) t.push(`<meta name="facebook-domain-verification" content="${esc(V.facebook)}">`);
  // structured data
  const O = S.org || {};
  const org = { '@context': 'https://schema.org', '@type': S.schemaType || 'FinancialService', name: O.name || brand, url: url + '/', description: S.description, areaServed: O.area || 'BD' };
  if (/^https:\/\//i.test(O.logo || '')) { org.logo = O.logo; org.image = O.logo; } else if (img) org.image = img;
  if (O.phone) org.telephone = O.phone;
  if (O.email) org.email = O.email;
  if (O.address || O.city) org.address = { '@type': 'PostalAddress', streetAddress: O.address || undefined, addressLocality: O.city || undefined, addressCountry: O.country || 'BD' };
  const same = (Array.isArray(O.sameAs) ? O.sameAs : []).filter(x => /^https:\/\//i.test(x));
  if (same.length) org.sameAs = same;
  if (S.ratings !== false && d.reviews.count >= 1) org.aggregateRating = { '@type': 'AggregateRating', ratingValue: d.reviews.avg, reviewCount: d.reviews.count, bestRating: 5, worstRating: 1 };
  const ld = [org, { '@context': 'https://schema.org', '@type': 'WebSite', name: brand, url: url + '/', inLanguage: ['en', 'bn'] }];
  const faq = (Array.isArray(S.faq) ? S.faq : []).filter(x => x && x.q && x.a && x.on !== false);
  if (faq.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) });
  t.push(`<script type="application/ld+json" id="seoLd">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
  // analytics (only well-formed IDs are used)
  const A = S.analytics || {};
  if (/^G-[A-Z0-9]{4,}$/.test(A.ga4 || '')) t.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${A.ga4}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${A.ga4}');</script>`);
  if (/^GTM-[A-Z0-9]{4,}$/.test(A.gtm || '')) t.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${A.gtm}');</script>`);
  if (/^\d{8,20}$/.test(A.pixel || '')) t.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${A.pixel}');fbq('track','PageView');</script>`);
  if (/^[a-z0-9]{6,14}$/i.test(A.clarity || '')) t.push(`<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${A.clarity}");</script>`);
  return { tags: t.join('\n'), title: S.title || SEO_DEF.title };
}

module.exports = async (req, res) => {
  const f = String((req.query && req.query.f) || new URL(req.url, 'http://x').searchParams.get('f') || '');
  try {
    const d = await load();
    const S = { ...SEO_DEF, ...d.seo }, url = siteUrl(S, req);
    if (f === 'robots') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.setHeader('Cache-Control', 'public, s-maxage=600');
      const lines = S.index === false ? ['User-agent: *', 'Disallow: /'] : ['User-agent: *', 'Allow: /', 'Disallow: /api/'];
      if (S.robotsExtra) lines.push(...String(S.robotsExtra).split('\n').map(x => x.trim()).filter(Boolean));
      lines.push('', `Sitemap: ${url}/sitemap.xml`);
      return res.status(200).send(lines.join('\n') + '\n');
    }
    if (f === 'sitemap') {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8'); res.setHeader('Cache-Control', 'public, s-maxage=600');
      const mod = (S.updatedAt || new Date().toISOString()).slice(0, 10);
      const urls = [{ loc: url + '/', pr: '1.0' }, ...(Array.isArray(S.sitemapExtra) ? S.sitemapExtra : []).filter(x => /^https?:\/\//i.test(x)).map(x => ({ loc: x, pr: '0.6' }))];
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(u.loc)}</loc><lastmod>${mod}</lastmod><changefreq>daily</changefreq><priority>${u.pr}</priority></url>`).join('\n')}\n</urlset>\n`);
    }
    if (f === 'manifest') {
      const P = { name: 'Creditfy', short: 'Creditfy', desc: S.description, theme: '#0a6e35', bg: '#060d1a', display: 'standalone', ...(d.app.pwa || {}) };
      const icon = /^https:\/\//i.test(P.icon || '') ? P.icon : '';
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8'); res.setHeader('Cache-Control', 'public, s-maxage=300');
      return res.status(200).send(JSON.stringify({
        name: P.name, short_name: String(P.short || P.name).slice(0, 12), description: P.desc, id: '/', start_url: '/?source=pwa', scope: '/',
        display: ['standalone', 'fullscreen', 'minimal-ui'].includes(P.display) ? P.display : 'standalone', orientation: 'portrait',
        background_color: P.bg, theme_color: P.theme, lang: 'en', categories: ['finance'],
        icons: icon ? [{ src: icon, sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: icon, sizes: '512x512', type: 'image/png', purpose: 'maskable' }]
          : [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
        shortcuts: [{ name: 'Apply for a loan', url: '/?go=apply' }, { name: 'Loan calculator', url: '/?go=calc' }]
      }));
    }
    if (f === 'page') {
      const r = await fetch(`${baseUrl(req)}/index.html`, { headers: { 'x-seo-render': '1' } });
      if (!r.ok) return res.status(502).send('static page unavailable');
      let html = await r.text();
      const h = headTags(d, req);
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(h.title)}</title>`)
        .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, '')
        .replace(/<\/head>/i, `<!--seo:start-->\n${h.tags}\n<!--seo:end-->\n</head>`);
      res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      return res.status(200).send(html);
    }
    return res.status(400).json({ error: 'Unknown file' });
  } catch (e) {
    console.error('seo', f, e);
    return res.status(500).send('error');
  }
};
module.exports.headTags = headTags;
