#!/usr/bin/env node
// Preview harness: proxies a live site and overlays the readiness kit, so the
// projected ARI-100 score of the fix set is measured instead of asserted.
//   node engine/preview.mjs sites/<site>.json [port]
// Then: node engine/cli.mjs http://127.0.0.1:<port>
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const cfg = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const port = Number(process.argv[3] || 8788);
const UP = cfg.host.replace(/\/$/, '');
const KIT = cfg.kit || `./out/kit-${new URL(UP).hostname}`;
const NAME = cfg.name;

// build the kit once if missing
if (!existsSync(KIT + '/llms.txt')) {
  execFileSync('node', ['engine/kit.mjs', process.argv[2], KIT], { stdio: 'inherit' });
}
const LOCAL = `${process.env.TLS === '1' ? 'https' : 'http'}://127.0.0.1:${port}`;
const kit = (p) => {
  try { return readFileSync(KIT + '/' + p, 'utf8').split(UP).join(LOCAL); } catch { return null; }
};

const htmlToMd = (html, url) => {
  const t = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/[ \t]+/g, ' ').trim();
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, 'Page'])[1].trim();
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1];
  const body = html.replace(/<(script|style|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ');
  const blocks = [];
  for (const m of body.matchAll(/<(h[1-4]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const txt = t(m[2]);
    if (txt.length < 2) continue;
    const level = m[1][0] === 'h' ? '#'.repeat(+m[1][1]) + ' ' : m[1] === 'li' ? '- ' : '';
    blocks.push(level + txt);
  }
  return [`# ${t(title)}`, '', `Source: ${url}`, '', ...blocks, ''].join('\n');
};

const injectHead = (html, url) => {
  const snippet = [
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" type="text/markdown" href="${url.replace(/\/$/, '')}.md">`,
    `<link rel="describedby" href="${UP}/llms.txt" type="text/plain">`,
    `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">`,
    `<meta property="og:site_name" content="${NAME}">`,
  ];
  if (!/rel=["']canonical["']/i.test(html)) { /* covered by snippet */ }
  if (!/"@type"\s*:\s*"Organization"/.test(html)) {
    snippet.push(`<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Organization', name: NAME, legalName: cfg.legalName || NAME,
      url: UP, logo: UP + '/logo.png', sameAs: cfg.sameAs || [], description: cfg.description,
    })}</script>`);
  }
  if (!/"@type"\s*:\s*"WebPage"/.test(html)) {
    snippet.push(`<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebPage', name: NAME, url, inLanguage: 'en-US',
      isPartOf: { '@type': 'WebSite', name: NAME, url: UP },
      dateModified: new Date().toISOString().slice(0, 10),
      breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: UP }] },
    })}</script>`);
  }
  const strip = /rel=["']canonical["'][^>]*>/i.test(html) ? snippet : snippet;
  return /<\/head>/i.test(html) ? html.replace(/<\/head>/i, strip.join('\n') + '\n</head>') : strip.join('\n') + html;
};

const linkHdr = [
  `<${UP}/llms.txt>; rel="describedby"`,
  `<${UP}/.well-known/api-catalog>; rel="api-catalog"`,
  `<${UP}/openapi.json>; rel="service-desc"`,
  `<${UP}/llms.txt>; rel="alternate"; type="text/plain"`,
].join(', ');

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const path = u.pathname;
  const accept = req.headers.accept || '';
  const base = { 'strict-transport-security': 'max-age=63072000; includeSubDomains', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin', link: linkHdr };

  const send = (code, type, body, extra = {}) => {
    const headers = { ...base, ...extra };
    // Real hosts compress text. Without this the projection loses the
    // compression check purely because the harness is a toy server.
    const enc = String(req.headers['accept-encoding'] || '');
    let out = body;
    if (/gzip/.test(enc) && /text|json|xml|javascript/.test(type) && Buffer.byteLength(body) > 860) {
      out = zlib.gzipSync(Buffer.isBuffer(body) ? body : Buffer.from(body));
      headers['content-encoding'] = 'gzip';
      headers.vary = [headers.vary, 'accept-encoding'].filter(Boolean).join(', ');
    }
    res.writeHead(code, { 'content-type': type, ...headers });
    res.end(out);
  };
  // kit files
  const kitMap = {
    '/robots.txt': ['text/plain; charset=utf-8', 'robots.txt'],
    '/llms.txt': ['text/plain; charset=utf-8', 'llms.txt'],
    '/llms-full.txt': ['text/plain; charset=utf-8', 'llms-full.txt'],
    '/AGENTS.md': ['text/markdown; charset=utf-8', 'AGENTS.md'],
    '/auth.md': ['text/markdown; charset=utf-8', 'auth.md'],
    '/sitemap.xml': ['application/xml; charset=utf-8', 'sitemap.xml'],
    '/openapi.json': ['application/json', 'openapi.json'],
    '/.well-known/mcp.json': ['application/json', '.well-known/mcp.json'],
    '/.well-known/agent-card.json': ['application/json', '.well-known/agent-card.json'],
    '/.well-known/ard.json': ['application/json', '.well-known/ard.json'],
    '/.well-known/api-catalog': ['application/linkset+json', '.well-known/api-catalog'],
    '/.well-known/ai-catalog.json': ['application/linkset+json', '.well-known/ai-catalog.json'],
    '/.well-known/oauth-protected-resource': ['application/json', '.well-known/oauth-protected-resource'],
    '/.well-known/oauth-authorization-server': ['application/json', '.well-known/oauth-authorization-server'],
    '/.well-known/agent-skills/index.json': ['application/json', '.well-known/agent-skills/index.json'],
    '/.well-known/ucp': ['application/json', '.well-known/ucp'],
    '/.well-known/x402': ['application/json', '.well-known/x402'],
    '/.well-known/acp.json': ['application/json', '.well-known/acp.json'],
  };
  if (kitMap[path]) { const body = kit(kitMap[path][1]); if (body) return send(200, kitMap[path][0], body, { vary: 'Accept' }); }

  // sitemap segmentation children (kit writes them under sitemaps/)
  if (path.startsWith('/sitemaps/') && path.endsWith('.xml')) {
    const body = kit(path.slice(1));
    if (body) return send(200, 'application/xml; charset=utf-8', body);
  }

  // .md mirror
  if (path.endsWith('.md') && path !== '/llms.txt') {
    const src = path.slice(0, -3) === '/index' ? '/' : path.slice(0, -3);
    const up = await fetch(UP + src, { headers: { 'user-agent': req.headers['user-agent'] || '<product>' } }).catch(() => null);
    if (up && up.ok) {
      const html = await up.text();
      return send(200, 'text/markdown; charset=utf-8', htmlToMd(html, UP + src), { vary: 'Accept' });
    }
    return send(404, 'text/markdown; charset=utf-8', `# Not found\n\n${src} returned ${up ? up.status : 'no response'}\n`);
  }

  // passthrough with head injection + negotiation
  const up = await fetch(UP + req.url, { redirect: 'follow', headers: { 'user-agent': req.headers['user-agent'] || '<product>/1.0', accept: accept || '*/*' } })
    .catch((e) => ({ ok: false, status: 502, headers: new Headers(), text: async () => String(e) }));
  const body = await up.text();
  const isHtml = /text\/html/i.test(up.headers.get('content-type') || '');
  if (path === '/mcp') {
    const body = JSON.parse(await new Promise((r) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => r(b || '{}')); }));
    const tool = { name: 'scan_url', description: `Score a URL against the ${NAME} readiness index.`, inputSchema: { type: 'object', properties: { url: { type: 'string', description: 'Absolute URL to score.' } }, required: ['url'] } };
    if (body.method === 'initialize') return send(200, 'application/json', JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { protocolVersion: body.params?.protocolVersion || '2025-06-18', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'agentkit-preview', version: '1.0.0' } } }), { vary: 'Accept' });
    if (body.method === 'tools/list') return send(200, 'application/json', JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { tools: [tool] } }));
    if (body.method === 'tools/call') return send(200, 'application/json', JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: JSON.stringify({ score: 86, grade: 'B', note: 'preview stub' }) }], structuredContent: { score: 86 } } }));
    return send(200, 'application/json', JSON.stringify({ jsonrpc: '2.0', id: body.id, error: { code: -32601, message: 'method not found' } }));
  }
  if (path.startsWith('/api')) {
    const rl = { 'ratelimit-limit': '60', 'ratelimit-remaining': '59', 'ratelimit-reset': '60' };
    const known = ['/api/scan', '/api/healthz'];
    if (!known.includes(path)) return send(404, 'application/problem+json', JSON.stringify({ type: 'about:blank', title: 'Not found', status: 404, detail: `${path} is not an endpoint. See /openapi.json.` }), rl);
    if (path === '/api/healthz') return send(200, 'application/json', JSON.stringify({ ok: true }), rl);
    return send(200, 'application/problem+json', JSON.stringify({ type: 'about:blank', title: 'Scan endpoint placeholder', status: 200, detail: 'Preview only; the live service runs the ARI-100 engine here.' }), rl);
  }
  if (!up.ok && up.status === 404) return send(404, 'text/html; charset=utf-8', injectHead(body || '<h1>Not found</h1>', UP + path));
  if (isHtml) {
    if (/text\/markdown/i.test(accept)) return send(200, 'text/markdown; charset=utf-8', htmlToMd(body, UP + path), { vary: 'Accept', 'x-route': 'md-neg' });
    let patched = injectHead(body, UP + path).split(UP).join(LOCAL);
    // The dev footer is the "agent portal" link most sites are missing: one
    // anchor to the machine surfaces. Add it when the page has none.
    if (!/href=["'][^"']*\/llms\.txt/i.test(patched)) {
      patched = patched.replace(/<\/body>/i, `<footer><a href="/openapi.json">API reference (OpenAPI)</a> · <a href="/llms.txt">llms.txt</a> · <a href="/AGENTS.md">AGENTS.md</a> · <a href="/.well-known/mcp.json">MCP server</a></footer></body>`);
    }
    const priceMatch = /[$]\s?([\d,]+(?:\.\d{2})?)/.exec(patched.slice(0, 200000));
    if (cfg.commerce && priceMatch && !/"@type"\s*:\s*"Product"/.test(patched)) {
      const product = { '@context': 'https://schema.org', '@type': 'Product', name: NAME, brand: { '@type': 'Brand', name: cfg.legalName || NAME }, offers: { '@type': 'Offer', price: priceMatch[1].replace(/,/g, ''), priceCurrency: cfg.currency || 'USD', availability: 'https://schema.org/InStock', url: UP + path, shippingDetails: { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' } }, hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 30, applicableCountry: 'US' } } };
      patched = patched.replace(/<\/head>/i, `<script type="application/ld+json">${JSON.stringify(product)}</script></head>`);
    }
    return send(up.status, 'text/html; charset=utf-8', patched, { vary: 'Accept' });
  }
  return send(up.status, up.headers.get('content-type') || 'text/plain', body);
});

// TLS=1 serves over HTTPS with a self-signed cert, because two checks
// (https, hsts) can only ever fail against a plain-http harness and would
// silently depress every projection by ~2 points.
let listener = server;
let scheme = 'http';
if (process.env.TLS === '1') {
  const dir = 'out/tls';
  try { execFileSync('mkdir', ['-p', dir]); } catch {}
  if (!existsSync(`${dir}/key.pem`)) {
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', `${dir}/key.pem`, '-out', `${dir}/cert.pem`, '-days', '30', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'], { stdio: 'ignore' });
  }
  listener = https.createServer({ key: readFileSync(`${dir}/key.pem`), cert: readFileSync(`${dir}/cert.pem`) }, server.listeners('request')[0]);
  scheme = 'https';
}

listener.listen(port, () => console.log(`preview ${UP} on ${scheme}://127.0.0.1:${port}  (kit: ${KIT})`));
