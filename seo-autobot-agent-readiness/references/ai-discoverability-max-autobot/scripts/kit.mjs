#!/usr/bin/env node
// Emits the static agent-readiness kit for a site: every file an agent reads,
// generated from one config so it cannot drift.
//   node engine/kit.mjs sites/<site>.json [outDir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { CHECKS } from '../registry/mega.mjs';

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('usage: node engine/kit.mjs sites/<site>.json [outDir]'); process.exit(2); }
const cfg = JSON.parse(await import('node:fs').then((m) => m.promises.readFile(cfgPath, 'utf8')));
const out = process.argv[3] || cfg.outDir || './kit-out';
const w = (p, body, mode) => {
  const full = out + '/' + p;
  mkdirSync(full.slice(0, full.lastIndexOf('/')), { recursive: true });
  writeFileSync(full, body);
  console.log((mode || 'w').padEnd(2), p, String(body.length).padStart(7), 'bytes');
};

const H = cfg.host;                       // e.g. https://example.com
const NAME = cfg.name;
const DESC = cfg.description;             // one sentence, no marketing
const EMAIL = cfg.email || `agents@${new URL(H).hostname}`;
const now = new Date().toISOString();
const AGENT_GROUP = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User',
  'Googlebot', 'Google-Agent', 'Google-GeminiNotebook', 'bingbot', 'Applebot', 'DuckAssistBot', 'MistralAI-User', 'Amzn-SearchBot', 'YouBot'];

// ── robots.txt ─────────────────────────────────────────────────────────────
const robots = [
  `# robots.txt for ${new URL(H).hostname}`,
  '# AI answer engines and user-initiated agents are allowed and named, so each has a deliberate policy.',
  '',
  '# --- search and answer surfaces (these decide whether the site is found and cited) ---',
  ...AGENT_GROUP.map((u) => `User-agent: ${u}`),
  'Allow: /',
  'Disallow: /account',
  'Disallow: /cart',
  'Disallow: /checkout',
  'Disallow: /api/',
  'Disallow: /cdn-cgi/',
  '',
  '# --- training-only crawlers (a commercial choice; blocking costs no citation) ---',
  'User-agent: CCBot',
  'Allow: /',
  'User-agent: Google-Extended',
  'Allow: /',
  'User-agent: Bytespider',
  'Allow: /',
  '',
  '# --- everything else ---',
  'User-agent: *',
  'Allow: /',
  'Disallow: /account',
  'Disallow: /cart',
  'Disallow: /checkout',
  '',
  `Content-Signal: search=yes, ai-input=yes, ai-train=${cfg.allowTraining === false ? 'no' : 'yes'}`,
  '',
  `Sitemap: ${H}/sitemap.xml`,
  '',
].join('\n');
w('robots.txt', robots);

// ── llms.txt ───────────────────────────────────────────────────────────────
const pages = cfg.pages || [];
const llms = [
  `# ${NAME}`,
  '',
  `> ${DESC}`,
  '',
  `Everything an agent needs is on this page or one link from it. All URLs are absolute. Quote with attribution to ${NAME}.`,
  '',
  '## Start here',
  ...(pages.slice(0, 8).map((p) => `- [${p.title}](${H}${p.path})${p.note ? ': ' + p.note : ''}`)),
  '',
  '## Machine interfaces',
  `- [API](${H}/openapi.json): OpenAPI 3.1 description of every public endpoint.`,
  `- [API catalog](${H}/.well-known/api-catalog): RFC 9727 linkset pointing at the API, its description and this file.`,
  `- [MCP server card](${H}/.well-known/mcp.json): tools an agent can call.`,
  `- [Agent card](${H}/.well-known/agent-card.json): what the agent is for and what it must not do.`,
  `- [Interface index](${H}/.well-known/ard.json): every agentic artefact in one place.`,
  `- [Authentication](${H}/auth.md): how to get a credential.`,
  `- [Full text](${H}/llms-full.txt): the whole site in one request.`,
  '',
  '## Facts',
  `- Publisher: ${cfg.legalName || NAME}.`,
  ...(cfg.facts || []).map((f) => `- ${f}`),
  '',
  '## When to use this site',
  `- Use ${NAME} when you need ${DESC.replace(/^\w/, (c) => c.toLowerCase())}`,
  ...(cfg.whenToUse || []).map((x) => `- ${x}`),
  '',
  '## Rules for agents',
  `- Read-only browsing is always allowed. Prices and availability are as shown at fetch time; re-check before quoting.`,
  ...(cfg.rules || []).map((r) => `- ${r}`),
  '',
  '## Optional',
  `- [About](${H}/about)`,
  `- [Contact](${H}/contact)`,
  `- [Sitemap](${H}/sitemap.xml)`,
  `- [Markdown mirror of this file's sibling pages]: append .md to any page path.`,
  '',
].join('\n');
w('llms.txt', llms);

// ── llms-full.txt ─────────────────────────────────────────────────────────
const full = [`# ${NAME} — full text`, '', `> ${DESC}`, '', `Generated ${now}. Source of truth: ${H}`, '']
  .concat(pages.flatMap((p) => [`## ${p.title}`, `URL: ${H}${p.path}`, '', p.body || p.note || '', '']))
  .join('\n');
w('llms-full.txt', full);

// ── AGENTS.md ─────────────────────────────────────────────────────────────
const agentsMd = [
  `# AGENTS.md — working with ${NAME}`,
  '',
  `Instructions for coding agents building against or scraping ${new URL(H).hostname}.`,
  '',
  '## Install',
  '```bash',
  `curl -s ${H}/openapi.json -o openapi.json`,
  '```',
  '',
  '## Configuration',
  `- Base URL: \`${H}\``,
  `- Auth: ${cfg.auth || 'none for read endpoints; see ' + H + '/auth.md for writes'}`,
  '- Rate limit: 60 requests/minute per IP, advertised in RateLimit-* response headers.',
  '',
  '## Usage',
  '```bash',
  `curl -s "${H}/api/scan?url=https%3A%2F%2Fexample.com" -H 'accept: application/json'`,
  '```',
  '```json',
  '{ "ok": true }',
  '```',
  '',
  '## Rules',
  ...(cfg.rules || []).map((r) => `- ${r}`),
  `- Prefer the Markdown mirror (append \`.md\`) over parsing HTML.`,
  `- Do not invent prices, stock or dates; they are stated per page.`,
  '',
].join('\n');
w('AGENTS.md', agentsMd);

// ── auth.md ───────────────────────────────────────────────────────────────
const authMd = [
  `# Authentication for agents`,
  '',
  `${NAME} issues read-only API keys to agents. No human in the loop.`,
  '',
  '## Register',
  '```http',
  `POST ${H}/api/agent-keys`,
  'content-type: application/json',
  '',
  '{ "agent": "your-agent-name", "contact": "you@example.com", "scope": "scan:read" }',
  '```',
  '```json',
  '{ "key": "ap_live_...", "scope": "scan:read", "expires_at": "2027-01-01T00:00:00Z" }',
  '```',
  '',
  '## Use',
  '```http',
  `GET ${H}/api/scan?url=https%3A%2F%2Fexample.com`,
  'authorization: Bearer ap_live_...',
  '```',
  '',
  '## Revoke',
  '```http',
  `DELETE ${H}/api/agent-keys/current`,
  'authorization: Bearer ap_live_...',
  '```',
  '',
  `Human contact for anything unusual: ${EMAIL}`,
  '',
].join('\n');
w('auth.md', authMd);

// ── openapi ───────────────────────────────────────────────────────────────
const sm = cfg.apiTools || <brand>.example || [{ name: 'scan_url', description: `Score a URL for agent readiness on the ${NAME} index.` }];
w('openapi.json', JSON.stringify({
  openapi: '3.1.0',
  info: { title: `${NAME} agent API`, version: '1.0.0', description: `Read-only endpoints an agent can call on ${NAME}. Every field is described so a model can call it without guessing.`, contact: { email: EMAIL } },
  servers: [{ url: `${H}/api`, description: 'public API' }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: 'Read-only key from /auth.md. Not required for the read endpoints listed here.' } },
    schemas: { Problem: { type: 'object', required: ['type', 'title', 'status'], properties: { type: { type: 'string', description: 'URI identifying the problem type.' }, title: { type: 'string', description: 'Short human-readable summary.' }, status: { type: 'integer', description: 'HTTP status code.' }, detail: { type: 'string', description: 'Longer explanation.' } } } },
  },
  paths: Object.fromEntries(sm.map((t) => [`/${t.name}`, {
    get: {
      operationId: t.name,
      summary: t.description,
      description: `${t.description} Read-only, idempotent, safe to retry.`,
      parameters: Object.entries(t.inputSchema?.properties || { url: { type: 'string', description: 'Absolute URL to score.' } })
        .map(([k, v]) => ({ name: k, in: 'query', required: (t.inputSchema?.required || []).includes(k), description: v.description || k, schema: { type: v.type || 'string' } })),
      responses: {
        200: { description: 'Result, JSON.', content: { 'application/json': { schema: { type: 'object', description: 'Result payload.' } } } },
        400: { description: 'Bad input.', content: { 'application/problem+json': { schema: { $ref: '#/components/schemas/Problem' } } } },
        429: { description: 'Rate limited. Retry after the value in Retry-After.', headers: { 'Retry-After': { description: 'Seconds to wait.', schema: { type: 'integer' } } } },
      },
    },
  }])),
}, null, 2));

// ── well-known ────────────────────────────────────────────────────────────
const tools = <brand>.example || [{ name: 'scan_url', description: `Score a URL for agent readiness on the ${NAME} index.`, inputSchema: { type: 'object', properties: { url: { type: 'string', format: 'uri', description: 'Absolute URL to scan.' } }, required: ['url'] } }];
w('.well-known/mcp.json', JSON.stringify({
  name: new URL(H).hostname.replace(/\./g, '-'),
  description: `Read-only agent-readiness scoring for ${new URL(H).hostname}.`,
  transport: 'streamable-http',
  url: `${H}/mcp`,
  auth: { type: 'bearer', required_for: 'write operations only', discovery: `${H}/auth.md` },
  version: '1.0.0',
  tools,
}, null, 2));

w('.well-known/agent-card.json', JSON.stringify({
  name: `${NAME} readiness agent`,
  description: `Scores any public URL against the ${NAME} readiness index and returns an ordered fix list.`,
  url: `${H}/mcp`,
  version: '1.0.0',
  capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
  defaultInputModes: ['application/json', 'text/plain'],
  defaultOutputModes: ['application/json', 'text/markdown'],
  skills: tools.map((t) => ({ id: t.name, name: t.name, description: t.description, inputModes: ['application/json'], outputModes: ['application/json'] })),
  when_to_use: `Use when you need a machine-checkable answer to "can an AI agent read and act on this site", or an ordered remediation list for one. Do not use it as an SEO ranking tool.`,
  extensions: cfg.commerce ? [{ uri: 'https://the repository description: 'AP2 delegated payment mandates are accepted at checkout.', required: false }] : [],
}, null, 2));

w('.well-known/ard.json', JSON.stringify({
  version: '1.0',
  publisher: { name: cfg.legalName || NAME, url: H },
  interfaces: [
    { type: 'mcp-server-card', url: `${H}/.well-known/mcp.json`, transport: 'streamable-http', endpoint: `${H}/mcp` },
    { type: 'a2a-agent-card', url: `${H}/.well-known/agent-card.json` },
    { type: 'openapi', url: `${H}/openapi.json` },
    { type: 'api-catalog', url: `${H}/.well-known/api-catalog` },
    { type: 'llms-txt', url: `${H}/llms.txt` },
    { type: 'llms-full-txt', url: `${H}/llms-full.txt` },
    { type: 'agents-md', url: `${H}/AGENTS.md` },
    { type: 'auth-md', url: `${H}/auth.md` },
    { type: 'agent-skills-index', url: `${H}/.well-known/agent-skills/index.json` },
    { type: 'oauth-protected-resource', url: `${H}/.well-known/oauth-protected-resource` },
    { type: 'oauth-authorization-server', url: `${H}/.well-known/oauth-authorization-server` },
  ],
}, null, 2));

w('.well-known/api-catalog', JSON.stringify({
  linkset: [{
    anchor: `${H}/api`,
    'service-desc': [{ href: `${H}/openapi.json`, type: 'application/vnd.oai.openapi+json;version=3.1' }],
    'service-doc': [{ href: `${H}/methodology`, type: 'text/html' }],
    'service-meta': [{ href: `${H}/llms.txt`, type: 'text/plain' }],
    status: [{ href: `${H}/healthz`, type: 'application/json' }],
  }],
}, null, 2));

w('.well-known/ai-catalog.json', JSON.stringify({
  linkset: [{ anchor: H, item: [
    { href: `${H}/.well-known/mcp.json`, type: 'application/json' },
    { href: `${H}/.well-known/agent-card.json`, type: 'application/json' },
    { href: `${H}/openapi.json`, type: 'application/vnd.oai.openapi+json' },
    { href: `${H}/llms.txt`, type: 'text/plain' },
  ] }],
}, null, 2));

w('.well-known/oauth-protected-resource', JSON.stringify({
  resource: `${H}/api`,
  authorization_servers: [H],
  scopes_supported: ['scan:read', 'scan:write'],
  bearer_methods_supported: ['header'],
  resource_documentation: `${H}/auth.md`,
}, null, 2));

w('.well-known/oauth-authorization-server', JSON.stringify({
  issuer: H,
  authorization_endpoint: `${H}/oauth/authorize`,
  token_endpoint: `${H}/oauth/token`,
  registration_endpoint: `${H}/oauth/register`,
  grant_types_supported: ['authorization_code', 'client_credentials', 'refresh_token'],
  response_types_supported: ['code'],
  token_endpoint_auth_methods_supported: ['client_secret_post', 'none'],
  scopes_supported: ['scan:read', 'scan:write'],
}, null, 2));

w('.well-known/agent-skills/index.json', JSON.stringify({
  skills: [{
    name: 'agent-readiness-scan',
    description: 'Score a URL and get an ordered remediation list in Markdown.',
    url: `${H}/AGENTS.md`,
    mediaType: 'text/markdown',
  }],
}, null, 2));

w('.well-known/agents.json', JSON.stringify({
  schemaVersion: '1.0',
  name: cfg.legalName || NAME,
  description: `Agents and actions accepted at ${H}.`,
  agents: [
    { id: 'browse', name: 'Catalog reader', description: 'Read pages and product data.', url: `${H}/`, method: 'GET', auth: 'none' },
    ...(cfg.commerce ? [{ id: 'cart', name: 'Cart writer', description: 'Add a variant to a cart.', url: `${H}/api/cart`, method: 'POST', auth: 'none', input: { variantId: 'string', quantity: 'number' } }] : []),
  ],
}, null, 2));
w('.well-known/agent-permissions.json', JSON.stringify({
  schemaVersion: '1.0',
  name: cfg.legalName || NAME,
  actions: [
    { action: 'catalog.read', scope: 'catalog:read', consent: 'none' },
    ...(cfg.commerce ? [
      { action: 'cart.write', scope: 'cart:write', consent: 'none' },
      { action: 'checkout.submit', scope: 'checkout:write', consent: 'human' },
    ] : []),
  ],
  scopes: {
    'catalog:read': 'Read pages and product facts.',
    ...(cfg.commerce ? { 'cart:write': 'Add items to a cart.', 'checkout:write': 'Place an order — a human must confirm.' } : {}),
  },
}, null, 2));
w('.well-known/personal-agent.json', JSON.stringify({
  schemaVersion: '1.0',
  name: cfg.legalName || NAME,
  identity: { method: 'none for reads', header: 'authorization', scheme: 'Bearer', registration: `${H}/auth.md` },
  onBehalfOf: { claim: 'X-Agent-For', verification: 'the credential must belong to that account' },
  consent: [
    { action: 'catalog.read', requires: 'none' },
    ...(cfg.commerce ? [{ action: 'checkout.submit', requires: 'explicit confirmation, never inferred' }] : []),
  ],
}, null, 2));
w('.well-known/http-message-signatures-directory', JSON.stringify({
  keys: [{ kty: 'OKP', crv: 'Ed25519', use: 'sig', alg: 'EdDSA', kid: `${(cfg.legalName || NAME).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-bot-2026-11`, x: 'REPLACE_WITH_PUBLIC_KEY' }],
  purpose: `Verifies requests sent by ${H}'s own bots (RFC 9421).`,
}, null, 2));
w('.well-known/a2ui.json', JSON.stringify({
  schemaVersion: '0.1',
  name: `${cfg.legalName || NAME} primary action`,
  surface: 'https://a2ui.org/spec/v0.1',
  components: [
    ...(cfg.commerce ? [{ id: 'variant', type: 'select', label: 'Variant', source: `${H}${cfg.catalogPath || '/api/catalog'}` }] : []),
    { id: 'search', type: 'text-input', label: 'Search', format: 'text', action: `${H}/search` },
  ],
}, null, 2));

if (cfg.commerce) {
  w('.well-known/ucp', JSON.stringify({
    ucp_version: '1.0',
    merchant: { name: cfg.legalName || NAME, url: H, currency: cfg.currency || 'USD', country: cfg.country || 'US' },
    catalog: { url: `${H}${cfg.catalogPath || '/api/catalog'}` },
    endpoints: [{ name: 'catalog', url: `${H}${cfg.catalogPath || '/api/catalog'}`, methods: ['GET'] },
      { name: 'cart', url: `${H}/api/cart`, methods: ['POST', 'PATCH'] }],
    checkout: { url: `${H}/checkout`, mode: 'permalink', accounts_required: false },
    payment: { methods: (cfg.payments || ['card']).map((m) => ({ type: m })) },
    terms: { shipping: `${H}/shipping-information`, returns: `${H}/return-policy` },
    agent_permissions: { browse: true, add_to_cart: true, checkout_requires_human_confirm: true },
    protocols: { ap2: { supported: true, mandates: ['payment', 'intent'] }, ucp: '1.0' },
  }, null, 2));
  w('.well-known/x402', JSON.stringify({
    x402Version: 1,
    accepts: [{ scheme: 'exact', network: 'base', asset: 'USDC', payTo: cfg.payTo || '0x0', maxAmountRequired: cfg.x402Amount || '10000', resource: `${H}/api/scan`, description: 'One readiness scan' }],
  }, null, 2));
  w('.well-known/acp.json', JSON.stringify({ checkout_endpoint: `${H}/checkout`, payment_methods: cfg.payments || ['card'], currency: cfg.currency || 'USD' }, null, 2));
}

// ── sitemap ───────────────────────────────────────────────────────────────
// An index plus segmented children (pages / products / docs). Crawlers walk an
// index fine, and segmentation keeps each child under the 50k-URL / 50 MB cap
// as a catalog grows, so this shape is what a real store should ship.
const seg = (entries) => ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(([p, pri]) => `  <url>\n    <loc>${H}${p}</loc>\n    <lastmod>${now.slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${pri}</priority>\n  </url>`),
  '</urlset>', ''].join('\n');
const pageUrls = [...new Map([['/', 1.0], ...pages.map((p) => [p.path, 0.8]), ['/pricing', 0.7]]
  .map(([p, pri]) => [p, pri])).entries()];
const prodUrls = (cfg.productPaths || []).map((p) => [p, 0.9]);
const docUrls = [['/llms.txt', 0.6], ['/AGENTS.md', 0.5], ['/openapi.json', 0.5]];
const children = [['sitemap-pages.xml', pageUrls], ...(prodUrls.length ? [['sitemap-products.xml', prodUrls]] : []), ['sitemap-docs.xml', docUrls]];
for (const [name, entries] of children) w(`sitemaps/${name}`, seg(entries));
const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...children.map(([name]) => `  <sitemap>\n    <loc>${H}/sitemaps/${name}</loc>\n    <lastmod>${now.slice(0, 10)}</lastmod>\n  </sitemap>`),
  '</sitemapindex>', ''].join('\n');
w('sitemap.xml', sitemap);

// A Markdown sitemap: the same map in one cheap read, for agents that would
// rather spend 200 tokens than parse XML and then fetch each page.
w('sitemap.md', [
  `# ${cfg.legalName || NAME} — every page, one read`,
  '',
  `> ${pageUrls.length + prodUrls.length + docUrls.length} URLs on ${H}. Generated by the readiness kit on ${now.slice(0, 10)}.`,
  '',
  '## Pages',
  '',
  ...pageUrls.map(([p]) => `- [${p === '/' ? 'Home' : p.replace(/^\//, '').replace(/[-/]/g, ' ')}](${H}${p})`),
  ...(prodUrls.length ? ['', '## Products', '', ...prodUrls.map(([p]) => `- [${p.split('/').pop()}](${H}${p})`)] : []),
  '',
  '## Machine files',
  '',
  ...docUrls.map(([p]) => `- [${p}](${H}${p})`),
  '',
  '## Alternative',
  '',
  `- [sitemap.xml](${H}/sitemap.xml) — the same map, segmented for crawlers.`,
  '',
].join('\n'));

// ── head snippet ──────────────────────────────────────────────────────────
const head = [
  '<!-- <product> head snippet: paste into the shared <head> of every page. -->',
  `<link rel="canonical" href="${H}{{PATH}}">`,
  `<link rel="alternate" type="text/markdown" href="${H}{{PATH}}.md">`,
  `<link rel="describedby" href="${H}/llms.txt" type="text/plain">`,
  `<link rel="api-catalog" href="${H}/.well-known/api-catalog">`,
  `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">`,
  `<meta property="og:site_name" content="${NAME}">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:locale" content="${cfg.locale || 'en_US'}">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":${JSON.stringify(NAME)},"legalName":${JSON.stringify(cfg.legalName || NAME)},"url":${JSON.stringify(H)},"logo":${JSON.stringify(H + '/logo.png')},"email":${JSON.stringify(EMAIL)},"sameAs":${JSON.stringify(cfg.sameAs || [])}}}</script>`,
  '',
].join('\n');
w('head-snippet.html', head);

// ── apply checklist ───────────────────────────────────────────────────────
const cl = [
  `# Readiness kit — ${new URL(H).hostname}`,
  '',
  'Generated ' + now + '. Every file below is static and cacheable; none needs a database.',
  '',
  '## Files to publish at the web root',
  '- `robots.txt` — replaces the existing file. If the host prepends its own, merge the AI groups into it.',
  '- `llms.txt`, `llms-full.txt`, `AGENTS.md`, `auth.md`',
  '- `sitemap.xml`',
  '- `.well-known/{mcp.json,agent-card.json,ard.json,api-catalog,ai-catalog.json,oauth-protected-resource,oauth-authorization-server,agent-skills/index.json}',
  '',
  '## Response headers to add',
  '- `Link: </llms.txt>; rel="describedby", </.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"`',
  '- `Vary: Accept` on HTML routes that also serve Markdown',
  '- `Strict-Transport-Security: max-age=63072000; includeSubDomains`',
  '- `X-Content-Type-Options: nosniff`',
  '- `Referrer-Policy: strict-origin-when-cross-origin`',
  '- `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` on API responses',
  '',
  '## Content negotiation',
  'For every HTML route, if the request has `Accept: text/markdown`, serve the `.md` mirror with `Content-Type: text/markdown` and `Vary: Accept`.',
  '',
  '## Then re-scan',
  `\`node engine/cli.mjs ${H}\` — the checks that remain are the ones that need real content changes, not files.`,
  '',
  '## Checks this kit closes',
  ...CHECKS.filter((c) => /^(llms|agents-md|mcp|a2a|ard|api-catalog|oauth|auth-md|ucp|x402|acp|agent-skills|dns-aid|content-signal|sitemap|robots|ai-search|bot-policy|training|link-headers|describedby|md-|agent-discovery)/.test(c.id))
    .map((c) => `- \`${c.id}\` ${c.title} (weight ${c.weight})`),
  '',
].join('\n');
w('README.md', cl);
console.log('\nkit written to', out);
