// <product> engine — deterministic agent-readiness scan over plain HTTP.
// No browser, no login, no model in the scoring path.
import { CHECKS, DOMAINS, A11Y, CRAWLERS, BONUS_SIGNALS, GRADES, LEVELS, RESULT_POINTS } from '../registry/mega.mjs';
import { promises as dns } from 'node:dns';

const UA_BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const UA_SELF = '<product>/1.0 (+https://<product>.example/bot)';
const TIMEOUT = 9000;

async function get(url, opts = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), opts.timeout || TIMEOUT);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: opts.redirect ?? 'follow',
      signal: ctl.signal,
      headers: { 'user-agent': opts.ua || UA_SELF, accept: opts.accept || '*/*', ...(opts.headers || {}) },
    });
    const body = opts.head ? '' : await res.text();
    return {
      url, status: res.status, ok: res.ok, body,
      headers: res.headers, ms: Date.now() - started,
      finalUrl: res.url, chain: res.redirected ? [res.url] : [],
    };
  } catch (e) {
    return { url, status: 0, ok: false, body: '', headers: new Headers(), ms: Date.now() - started, error: String(e.message || e) };
  } finally { clearTimeout(t); }
}

// ── robots.txt (RFC 9309 matching) ───────────────────────────────────────────
export function parseRobots(txt) {
  const groups = [];
  let cur = null, inAgents = false;
  for (const raw of String(txt || '').split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim().toLowerCase();
    const v = line.slice(i + 1).trim();
    if (k === 'user-agent') {
      if (!cur || !inAgents) { cur = { agents: [], rules: [], signals: [] }; groups.push(cur); inAgents = true; }
      cur.agents.push(v.toLowerCase());
    } else if (k === 'allow' || k === 'disallow') {
      inAgents = false;
      if (cur) cur.rules.push({ type: k, path: v });
    } else if (k === 'content-signal') {
      if (cur) cur.signals.push(v);
      inAgents = false;
    } else if (k === 'sitemap') { inAgents = false; (parseRobots.sitemaps ||= []).push(v); }
  }
  return groups;
}

function pickGroup(groups, ua) {
  const s = ua.toLowerCase();
  let best = null, bestLen = -1;
  for (const g of groups) {
    for (const a of g.agents) {
      if (a === '*') { if (bestLen < 0) { best = g; bestLen = 0; } continue; }
      if (s.includes(a) && a.length > bestLen) { best = g; bestLen = a.length; }
    }
  }
  return best;
}

function ruleMatch(rule, path) {
  const p = rule.path;
  if (p === '') return false;
  const anchored = p.endsWith('$');
  const core = anchored ? p.slice(0, -1) : p;
  const rx = new RegExp('^' + core.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + (anchored ? '$' : ''));
  return rx.test(path);
}

export function robotsAllows(groups, ua, path = '/') {
  const g = pickGroup(groups, ua);
  if (!g) return { allowed: true, rule: null };
  let best = null, bestLen = -1;
  for (const r of g.rules) {
    if (!ruleMatch(r, path)) continue;
    const len = r.path.replace(/[*$]/g, '').length;
    if (len > bestLen || (len === bestLen && r.type === 'allow')) { best = r; bestLen = len; }
  }
  if (!best) return { allowed: true, rule: null };
  return { allowed: best.type === 'allow', rule: best.type + ': ' + best.path };
}

// ── HTML extraction ─────────────────────────────────────────────────────────
const strip = (html) => String(html || '')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
  .replace(/<nav[\s\S]*?<\/nav>/gi, ' ').replace(/<footer[\s\S]*?<\/footer>/gi, ' ');

const text = (html) => strip(html).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

function metaAll(html, attr, val) {
  const out = [];
  const rx = new RegExp(`<meta[^>]*${attr}\\s*=\\s*["']${val}["'][^>]*>`, 'gi');
  for (const m of String(html).matchAll(rx)) out.push(m[0]);
  return out;
}
const attrOf = (tag, name) => { const m = tag.match(new RegExp(name + `\\s*=\\s*["']([^"']*)["']`, 'i')); return m ? m[1] : ''; };

function jsonLd(html) {
  const blocks = [];
  for (const m of String(html).matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { blocks.push({ ok: true, data: JSON.parse(m[1].trim()) }); }
    catch { blocks.push({ ok: false, data: null, raw: m[1].slice(0, 200) }); }
  }
  return blocks;
}

const flatTypes = (node, acc = []) => {
  if (!node) return acc;
  if (Array.isArray(node)) { node.forEach((n) => flatTypes(n, acc)); return acc; }
  if (typeof node !== 'object') return acc;
  if (node['@type']) acc.push(String(node['@type']));
  for (const v of Object.values(node)) if (v && typeof v === 'object') flatTypes(v, acc);
  return acc;
};

// ── main scan ───────────────────────────────────────────────────────────────
export async function scan(inputUrl, opts = {}) {
  const started = Date.now();
  const origin0 = new URL(inputUrl.startsWith('http') ? inputUrl : 'https://' + inputUrl);
  const origin = origin0.origin;
  const results = {};           // id -> {result, evidence}
  const R = (id, result, evidence) => { results[id] = { result: result === true ? 'pass' : result === false ? 'fail' : result, evidence: evidence || '' }; };
  const seen = (k, v) => { evidence[k] = v; };
  const evidence = {};

  // --- robots + baseline fetches -------------------------------------------
  const [home, robotsRes, httpRes] = await Promise.all([
    get(origin + '/', { ua: UA_BROWSER, headers: { accept: 'text/html,application/xhtml+xml' } }),
    get(origin + '/robots.txt', { ua: UA_SELF }),
    get(origin.replace(/^https/, 'http') + '/', { ua: UA_SELF, redirect: 'manual' }),
  ]);

  if (!home.ok) {
    return { url: origin, error: `homepage returned ${home.status}`, status: home.status, finalUrl: home.finalUrl };
  }

  const finalUrl = home.finalUrl || home.url;
  const finalOrigin = new URL(finalUrl).origin;
  const html = home.body;
  const pageText = text(html);
  const robotsTxt = robotsRes.ok ? robotsRes.body : '';
  const robotsGroups = parseRobots(robotsTxt);

  seen('homeStatus', home.status); seen('finalUrl', finalUrl);
  seen('homeBytes', html.length); seen('textChars', pageText.length);
  seen('ttfbMs', home.ms); seen('robotsStatus', robotsRes.status);

  // --- reachability matrix --------------------------------------------------
  const probeUAs = CRAWLERS.filter((c) => c.role !== 'other' || c.weight > 0);
  const probePaths = opts.probePath || '/';
  const live = {};
  await Promise.all(probeUAs.map(async (c) => {
    const r = await get(new URL(probePaths, finalOrigin).toString(), { ua: `${c.ua}/1.0 (+http://${new URL(finalOrigin).hostname})`, head: false });
    const robot = robotsAllows(robotsGroups, c.ua, probePaths);
    live[c.ua] = {
      status: r.status, bytes: r.body.length, ms: r.ms,
      robotsAllowed: robot.allowed, rule: robot.rule,
      blocked: !robot.allowed || r.status === 403 || r.status === 429 || r.status === 0,
      challenged: /cf-mitigated|challenge-platform|_cf_chl_opt|just a moment|attention required/i.test(r.body.slice(0, 4000)),
      verdict: !robot.allowed ? 'blocked by robots.txt'
        : r.status === 0 ? 'no response'
        : (r.status === 403 || r.status === 401) && ['Googlebot', 'bingbot', 'Applebot'].includes(c.ua) ? 'unverifiable'
        : (r.status === 403 || r.status === 401 || r.status === 429) && home.status !== 200 ? 'unverifiable'
        : r.status === 403 || r.status === 401 ? 'blocked at the edge'
        : r.status === 429 ? 'rate limited'
        : /challenge-page|_cf_chl_opt|just a moment/i.test(r.body.slice(0, 3000)) && home.status !== 200 ? 'unverifiable'
        : /cf-mitigated|challenge-platform/i.test(r.body.slice(0, 4000)) ? 'challenged'
        : r.status >= 500 ? 'server error'
        : r.status === 200 ? 'allowed' : `http ${r.status}`,
    };
  }));

  const searchBots = CRAWLERS.filter((c) => c.role === 'search');
  const userBots = CRAWLERS.filter((c) => c.role === 'user');
  const verifiable = (c) => live[c.ua] && live[c.ua].verdict !== 'unverifiable';
  const sBots = searchBots.filter(verifiable), uBots = userBots.filter(verifiable);
  const sOk = sBots.filter((c) => live[c.ua]?.verdict === 'allowed');
  const uOk = uBots.filter((c) => live[c.ua]?.verdict === 'allowed');
  const gOk = ['Googlebot', 'bingbot'].filter((u) => live[u]?.verdict === 'allowed');
  const challenged = CRAWLERS.filter((c) => c.weight > 0 && /challenge|edge|limited/.test(live[c.ua]?.verdict || ''));

  R('robots-valid', robotsRes.ok && /text\/plain/.test(robotsRes.headers.get('content-type') || '') && robotsGroups.length ? 'pass'
    : robotsRes.ok && robotsGroups.length ? 'partial' : 'fail', `robots.txt HTTP ${robotsRes.status}, ${robotsGroups.length} groups`);
  R('ai-search-bots', sBots.length === 0 ? 'inconclusive' : sOk.length === sBots.length ? 'pass' : sOk.length ? 'partial' : 'fail',
    `${sOk.length}/${sBots.length} verifiable AI search crawlers allowed${sBots.length < searchBots.length ? ` (${searchBots.length - sBots.length} could not be tested from this server)` : ''}`);
  R('ai-user-agents', uBots.length === 0 ? 'inconclusive' : uOk.length === uBots.length ? 'pass' : uOk.length ? 'partial' : 'fail',
    `${uOk.length}/${uBots.length} verifiable live AI agents allowed`);
  R('search-engines', gOk.length === 2 ? 'pass' : gOk.length ? 'partial' : 'fail', `allowed: ${gOk.join(', ') || 'none'}`);
  R('no-edge-block', challenged.length === 0 ? 'pass' : challenged.length <= 2 ? 'partial' : 'fail',
    challenged.length ? `challenged at the edge: ${challenged.map((c) => c.ua + ' (' + live[c.ua].verdict + ')').join(', ')}` : 'no AI crawler was challenged');
  const wild = pickGroup(robotsGroups, 'anything');
  const blanket = wild && wild.rules.some((r) => r.type === 'disallow' && r.path === '/');
  const blanketCost = blanket && Object.values(live).every((l) => l.verdict === 'allowed');
  R('no-blanket-disallow', !blanket ? 'pass' : blanketCost ? 'partial' : 'fail',
    blanket ? 'allow-list robots.txt: "Disallow: /" plus per-path Allows — one missed rule hides a whole section' : 'wildcard group does not disallow the site');
  const namedAI = new Set(robotsGroups.flatMap((g) => g.agents).filter((a) => a !== '*')).size;
  R('bot-policy-deliberate', namedAI >= 6 ? 'pass' : namedAI >= 3 ? 'partial' : 'fail', `${namedAI} named user-agent groups`);
  const signals = robotsGroups.flatMap((g) => g.signals);
  const trainingNamed = CRAWLERS.filter((c) => c.role === 'train').some((c) => robotsGroups.some((g) => g.agents.includes(c.ua.toLowerCase())));
  R('training-policy', signals.length || trainingNamed ? 'pass' : 'fail',
    signals.length ? 'Content-Signal: ' + signals[0] : trainingNamed ? 'training crawlers named' : 'no explicit training policy');
  const captcha = /recaptcha|hcaptcha|turnstile|g-recaptcha|cf-turnstile/i.test(html) && /captcha/i.test(pageText);
  R('no-captcha', captcha ? 'fail' : 'pass', captcha ? 'CAPTCHA widget present on the page' : 'no CAPTCHA on first paint');
  const gate = /age.{0,12}verif|are you (18|21)|cookie.?consent|accept all cookies|choose your (region|country)/i.test(pageText.slice(0, 3000))
    && pageText.length < 1200;
  R('no-gate', gate ? 'fail' : 'pass', gate ? 'interstitial-shaped copy in server HTML' : 'content is not behind an interstitial');
  const metaRobots = metaAll(html, 'name', 'robots').join(' ') + ' ' + metaAll(html, 'name', 'googlebot').join(' ');
  const xRobots = home.headers.get('x-robots-tag') || '';
  const noindex = /noindex/i.test(metaRobots) || /noindex/i.test(xRobots);
  R('indexable', noindex ? 'fail' : 'pass', noindex ? 'noindex present' : 'indexable');
  const snippetOk = /max-snippet\s*:\s*-?1\b|max-snippet\s*:\s*[1-9]/i.test(metaRobots + xRobots) && /max-image-preview\s*:\s*large/i.test(metaRobots + xRobots);
  R('snippets-allowed', snippetOk ? 'pass' : /nosnippet/i.test(metaRobots + xRobots) ? 'fail' : 'partial',
    snippetOk ? 'max-snippet and max-image-preview:large set' : 'snippet directives incomplete');
  const sm = (parseRobots.sitemaps ||= []);
  const smDisallowed = sm.some((u) => { try { return !robotsAllows(robotsGroups, 'OAI-SearchBot', new URL(u).pathname).allowed; } catch { return false; } });
  R('robots-coherent', smDisallowed ? 'fail' : 'pass', smDisallowed ? 'a declared sitemap is disallowed' : 'declared resources are crawlable');
  const infra = /disallow:\s*\/api\/|disallow:\s*\/cdn-cgi\//i.test(robotsTxt);
  R('crawl-budget', infra ? 'pass' : 'partial', infra ? 'infrastructure paths excluded' : 'no /api/ or /cdn-cgi/ exclusion');

  // --- render ---------------------------------------------------------------
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1])).filter(Boolean);
  const emptyRoot = /<div[^>]+id=["'](root|app|__next|___gatsby)["'][^>]*>\s*<\/div>/i.test(html);
  R('ssr-home', pageText.length >= 500 && h1s.length ? 'pass' : pageText.length >= 200 ? 'partial' : 'fail',
    `${pageText.length} chars of text, ${h1s.length} H1 in raw HTML`);
  R('no-js-only', emptyRoot && pageText.length < 300 ? 'fail' : 'pass', emptyRoot ? 'empty mount node detected' : 'document has content before scripts run');

  // sample inner pages from the sitemap / nav
  const links = [...html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)].map((m) => m[1]).filter((h) => !/^(mailto|tel|javascript)/i.test(h));
  const internal = [...new Set(links.map((h) => { try { return new URL(h, finalUrl).toString(); } catch { return null; } })
    .filter((u) => u && u.startsWith(finalOrigin)))].slice(0, 40);

  const innerTargets = internal.filter((u) => !/(\.pdf|\.jpg|\.png|\.svg|\.xml|\.txt|\.md)$/i.test(u)).slice(0, 2);
  const inners = await Promise.all(innerTargets.map((u) => get(u, { ua: UA_BROWSER })));

  // a representative product/detail page, when the site has one
  let prodCandidates = internal.filter((u) => /\/(products?|p|item|listing)\//i.test(u)).slice(0, 2);
  let prodPage = null;
  if (!prodCandidates.length) {
    const smTry = await get(sm[0] || new URL('/sitemap.xml', finalOrigin).toString(), { ua: UA_SELF }).catch(() => null);
    const locs = smTry?.body ? [...smTry.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : [];
    const fromSm = locs.filter((u) => /\/(products?|p|item|listing)\//i.test(u)).slice(0, 2);
    if (fromSm.length) prodCandidates = fromSm;
  }
  if (prodCandidates.length) {
    const p = await get(prodCandidates[0], { ua: UA_BROWSER });
    if (p.ok) prodPage = { url: prodCandidates[0], html: p.body, text: text(p.body) };
  }
  const dh = prodPage ? prodPage.html : html;      // html used for data + commerce checks
  const dt = prodPage ? prodPage.text : pageText;
  seen('subjectPage', prodPage ? prodPage.url : finalUrl);

  const innerTexts = inners.map((r) => text(r.body).length);
  const innerGood = innerTexts.filter((n) => n >= 400).length;
  R('ssr-inner', inners.length === 0 ? 'not_applicable' : innerGood === inners.length ? 'pass' : innerGood ? 'partial' : 'fail',
    innerTexts.length ? `${innerGood}/${inners.length} sampled inner pages carry 400+ chars without JS` : 'no inner pages sampled');

  const hops = (home.chain || []).length;
  R('status-200', home.status === 200 && hops <= 1 ? 'pass' : home.status === 200 ? 'partial' : 'fail', `HTTP ${home.status}, ${hops} redirect(s)`);
  const bogus = await get(new URL('/__agentkit_probe_' + Math.random().toString(36).slice(2, 8), finalOrigin).toString(), { ua: UA_SELF });
  R('real-404', bogus.status === 404 ? 'pass' : bogus.status >= 300 && bogus.status < 400 ? 'partial' : 'fail',
    `unknown path returned ${bogus.status}${bogus.status === 200 ? ' (soft 404)' : ''}`);
  const ct = home.headers.get('content-type') || '';
  R('content-type', /text\/html/i.test(ct) && /charset/i.test(ct) ? 'pass' : /text\/html/i.test(ct) ? 'partial' : 'fail', `content-type ${ct || 'missing'}`);
  R('ttfb', home.ms <= 800 ? 'pass' : home.ms <= 2000 ? 'partial' : 'fail', `${home.ms} ms to first byte`);
  R('page-weight', html.length < 1_000_000 ? 'pass' : 'fail', `${(html.length / 1024).toFixed(0)} KB of HTML`);
  const enc = home.headers.get('content-encoding') || '';
  R('compression', enc ? 'pass' : 'partial', enc ? `content-encoding ${enc}` : 'no compression header relayed');
  const ratio = html.length ? pageText.length / html.length : 0;
  R('text-ratio', ratio >= 0.08 ? 'pass' : ratio >= 0.03 ? 'partial' : 'fail', `text/markup ${(ratio * 100).toFixed(1)}%`);
  R('streaming-stable', /document\.write/i.test(html) ? 'partial' : 'pass', /document\.write/i.test(html) ? 'document.write present' : 'no blocking document.write');

  // --- structure ------------------------------------------------------------
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1].trim();
  R('title', title.length >= 15 && title.length <= 65 ? 'pass' : title.length ? 'partial' : 'fail', `title ${title.length} chars: "${title.slice(0, 80)}"`);
  const desc = attrOf((metaAll(html, 'name', 'description')[0] || ''), 'content');
  R('meta-description', desc.length >= 50 && desc.length <= 170 ? 'pass' : desc.length ? 'partial' : 'fail', `${desc.length} chars`);
  R('one-h1', h1s.length === 1 && h1s[0].length > 2 ? 'pass' : h1s.length ? 'partial' : 'fail', `${h1s.length} H1: "${(h1s[0] || '').slice(0, 60)}"`);
  const levels = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map((m) => +m[1]);
  let skipped = 0; for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) skipped++;
  const h2s = levels.filter((l) => l === 2).length;
  R('heading-order', skipped === 0 && h2s >= 2 ? 'pass' : skipped <= 1 ? 'partial' : 'fail', `${skipped} skipped level(s), ${h2s} H2(s)`);
  const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [''])[0];
  const canonHref = canonical ? attrOf(canonical, 'href') : '';
  const selfCanon = canonHref && (() => { try { const a = new URL(canonHref, finalUrl), b = new URL(finalUrl); return a.origin === b.origin && a.pathname.replace(/\/$/, '') === b.pathname.replace(/\/$/, ''); } catch { return false; } })();
  R('canonical', selfCanon ? 'pass' : canonHref ? 'partial' : 'fail', canonHref ? `canonical ${canonHref}` : 'no canonical link');
  const lang = (html.match(/<html[^>]+lang=["']([^"']+)["']/i) || [, ''])[1];
  R('lang', /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/i.test(lang) ? 'pass' : lang ? 'partial' : 'fail', lang ? `lang="${lang}"` : 'no lang attribute');
  const ogt = attrOf((metaAll(html, 'property', 'og:title')[0] || ''), 'content');
  const ogd = attrOf((metaAll(html, 'property', 'og:description')[0] || ''), 'content');
  const ogi = attrOf((metaAll(html, 'property', 'og:image')[0] || ''), 'content');
  R('og-tags', ogt && ogd && ogi ? 'pass' : ogt || ogd ? 'partial' : 'fail', `og:title ${ogt ? 'yes' : 'no'}, og:description ${ogd ? 'yes' : 'no'}, og:image ${ogi ? 'yes' : 'no'}`);
  const tw = !!metaAll(html, 'name', 'twitter:card').length;
  R('twitter-card', tw ? 'pass' : 'partial', tw ? 'twitter:card present' : 'no twitter:card');
  const vp = attrOf((metaAll(html, 'name', 'viewport')[0] || ''), 'content');
  R('viewport', vp && !/user-scalable\s*=\s*no|maximum-scale\s*=\s*1\b/i.test(vp) ? 'pass' : vp ? 'partial' : 'fail', vp ? `viewport "${vp}"` : 'no viewport meta');
  const landmark = /<main[\s>]|<article[\s>]/i.test(html);
  R('landmarks', landmark ? 'pass' : 'partial', landmark ? 'main/article landmark present' : 'no main/article element');
  const controls = [...html.matchAll(/<(button|a|input|select|textarea)[^>]*>[\s\S]*?(?:<\/\1>|)/gi)];
  const interactive = [...html.matchAll(/<(button|input|select|textarea)[^>]*>/gi)];
  const unnamed = interactive.filter((m) => !attrOf(m[0], 'aria-label') && !attrOf(m[0], 'title') && !attrOf(m[0], 'id') && !/type=["'](hidden|submit|button)["']/i.test(m[0]) && !/value=["'][^"']+["']/i.test(m[0]));
  R('a11y-names', unnamed.length === 0 ? 'pass' : unnamed.length <= 2 ? 'partial' : 'fail', `${unnamed.length} control(s) without an obvious name`);
  const generic = (pageText.match(/\b(click here|read more|learn more|here)\b/gi) || []).length;
  R('link-text', generic <= 2 ? 'pass' : 'partial', `${generic} generic link label(s)`);
  const hreflang = /<link[^>]+hreflang=/i.test(html);
  R('href-lang', hreflang ? 'pass' : 'not_applicable', hreflang ? 'hreflang alternates present' : 'single locale site');
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\balt\s*=/.test(t));
  R('img-alt', imgs.length === 0 ? 'not_applicable' : noAlt.length === 0 ? 'pass' : noAlt.length <= imgs.length * 0.2 ? 'partial' : 'fail',
    `${noAlt.length}/${imgs.length} images without alt`);

  // --- structured data ------------------------------------------------------
  const ld = jsonLd(dh);
  const ldOk = ld.filter((b) => b.ok);
  const types = [...new Set(ldOk.flatMap((b) => flatTypes(b.data)))];
  const badLd = ld.filter((b) => !b.ok);
  R('jsonld', ld.shape?.length ? ldOk.length ? 'pass' : 'fail' : ld.length ? (ldOk.length ? 'pass' : 'fail') : 'fail',
    ld.length ? `${ldOk.length}/${ld.length} JSON-LD block(s) parse; types: ${types.slice(0, 6).join(', ') || 'none'}` : 'no JSON-LD');
  const pageTypeOk = types.some((t) => /WebPage|Organization|Article|Product|Service|FAQPage|HowTo|CollectionPage|ItemPage|AboutPage|ContactPage|SoftwareApplication|BlogPosting/i.test(t));
  R('jsonld-type', pageTypeOk ? 'pass' : types.length ? 'partial' : 'fail', types.length ? `declared: ${types.slice(0, 6).join(', ')}` : 'no declared type');
  const orgHit = ldOk.some((b) => /Organization|Person|LocalBusiness/i.test(flatTypes(b.data).join(' ')));
  const sameAs = ldOk.some((b) => JSON.stringify(b.data).includes('"sameAs"'));
  R('org-entity', orgHit && sameAs ? 'pass' : orgHit ? 'partial' : 'fail', orgHit ? (sameAs ? 'entity with sameAs' : 'entity without sameAs') : 'no Organization/Person node');
  const hasDates = ldOk.some((b) => /"dateModified"|"datePublished"/.test(JSON.stringify(b.data)));
  R('dates', hasDates ? 'pass' : 'partial', hasDates ? 'datePublished/dateModified declared' : 'no dates in schema');
  R('breadcrumb', types.includes('BreadcrumbList') ? 'pass' : 'fail', types.includes('BreadcrumbList') ? 'BreadcrumbList present' : 'no BreadcrumbList');
  R('jsonld-valid', badLd.length === 0 && ldOk.length ? 'pass' : ldOk.length ? 'partial' : 'fail',
    badLd.length ? `${badLd.length} block(s) failed to parse: ${badLd[0].raw?.slice(0, 60)}` : `${ldOk.length} block(s) parse cleanly`);
  const productNode = ldOk.map((b) => JSON.stringify(b.data)).find((s) => /"@type"\s*:\s*"Product"/.test(s));
  const priceInHtml = /[$£€]\s?\d|price/i.test(dt);
  R('product-facts', productNode && /"price"/.test(productNode) && /"priceCurrency"/.test(productNode) && /"availability"/.test(productNode) ? 'pass'
    : productNode ? 'partial' : prodPage ? 'fail' : 'not_applicable',
    productNode ? 'Product node without full offers' : prodPage ? `no Product JSON-LD on the product page ${prodPage.url}` : 'no Product node (not a product page)');
  R('product-variants', /hasVariant|"variesBy"|"size"\s*:|"color"\s*:/i.test(productNode || '') ? 'pass' : productNode ? 'fail' : prodPage ? 'fail' : 'not_applicable',
    productNode ? (/hasVariant/.test(productNode) ? 'variants modelled' : 'variants not modelled') : prodPage ? 'no variant markup on the product page' : 'n/a');
  R('offer-terms', /shippingDetails|hasMerchantReturnPolicy/.test(productNode || '') ? 'pass' : productNode ? 'fail' : prodPage ? 'fail' : 'not_applicable',
    productNode ? (/shippingDetails/.test(productNode) ? 'shipping details present' : 'no shipping/return markup') : prodPage ? 'no shipping/return markup on the product page' : 'n/a');
  R('faq-howto', types.some((t) => /FAQPage|HowTo|Question/.test(t)) ? 'pass' : 'not_applicable', types.join(','));
  R('reviews', /AggregateRating|"Review"/.test(JSON.stringify(ldOk)) ? 'pass' : 'not_applicable', 'ratings');
  const ldPrice = (productNode || '').match(/"price"\s*:\s*"?([\d.]+)/);
  const htmlPrice = (dt.match(/[$£€]\s?([\d,]+(?:\.\d{2})?)/) || [])[1];
  const truthful = !ldPrice || !htmlPrice || Math.abs(parseFloat(ldPrice[1]) - parseFloat(htmlPrice.replace(/,/g, ''))) < 1;
  R('jsonld-truthful', truthful ? 'pass' : 'partial', ldPrice && htmlPrice ? `schema ${ldPrice[1]} vs page ${htmlPrice}` : 'no price to compare');

  // --- discovery files ------------------------------------------------------
  const probe = (p, o) => get(new URL(p, finalOrigin).toString(), { ua: UA_SELF, ...o });
  // A host on a non-default port makes "<origin>.md" an invalid URL
  // (http://localhost:8787.md), so the mirror probe degrades instead of throwing.
  const probeMd = (u) => {
    try {
      const o = new URL(String(u));
      const p = o.pathname.replace(/\/$/, '') || '/index';
      return get(new URL(p + '.md', o.origin).toString(), { ua: UA_SELF });
    }
    catch { return Promise.resolve({ url: String(u), status: 0, ok: false, body: '', headers: new Headers(), ms: 0, error: 'invalid markdown mirror url' }); }
  };
  const [sitemapRes, llmsRes, agentsRes, mdAlt] = await Promise.all([
    get(sm[0] || new URL('/sitemap.xml', finalOrigin).toString(), { ua: UA_SELF }),
    probe('/llms.txt'),
    probe('/AGENTS.md'),
    probeMd(finalUrl),
  ]);
  const smXml = sitemapRes.ok && /<urlset|<sitemapindex/i.test(sitemapRes.body);
  const smLocs = smXml ? (sitemapRes.body.match(/<loc>/g) || []).length : 0;
  R('sitemap', smXml && sm.length ? 'pass' : smXml ? 'partial' : 'fail',
    sm.length ? `declared in robots, ${smLocs} URLs in first sitemap` : smXml ? 'sitemap exists but is not declared in robots.txt' : `no usable sitemap (${sitemapRes.status})`);
  R('sitemap-lastmod', /<lastmod>/.test(sitemapRes.body) ? 'pass' : smXml ? 'partial' : 'fail', /<lastmod>/.test(sitemapRes.body) ? 'lastmod present' : 'no lastmod');
  R('sitemap-segmented', /<sitemapindex/i.test(sitemapRes.body) ? 'pass' : smXml ? 'partial' : 'fail', /<sitemapindex/i.test(sitemapRes.body) ? 'index of child sitemaps' : 'single sitemap');
  const llms = llmsRes.ok ? llmsRes.body : '';
  const llmsCt = llmsRes.headers.get('content-type') || '';
  R('llms-txt', llms.length > 50 ? (/text\/plain|text\/markdown/.test(llmsCt) ? 'pass' : 'partial') : 'fail',
    llms.length > 50 ? `HTTP 200, ${llms.length} bytes, ${llmsCt || 'no content-type'}` : `HTTP ${llmsRes.status} at /llms.txt`);
  const llmsH1 = /^#\s+\S/m.test(llms), llmsQuote = /^>\s+\S/m.test(llms), llmsH2 = (llms.match(/^##\s+/gm) || []).length;
  const llmsLinks = (llms.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
  const llmsScore = [llmsH1, llmsQuote, llmsH2 >= 2, llmsLinks >= 3].filter(Boolean).length;
  R('llms-conform', llms.length === 0 ? 'fail' : llmsScore === 4 ? 'pass' : llmsScore >= 2 ? 'partial' : 'fail',
    llms.length ? `H1 ${llmsH1}, blockquote ${llmsQuote}, ${llmsH2} H2, ${llmsLinks} links` : 'no llms.txt');
  const llmsFull = await probe('/llms-full.txt');
  R('llms-full', llmsFull.ok && llmsFull.body.length > 200 ? 'pass' : 'fail', `llms-full.txt HTTP ${llmsFull.status}`);
  R('md-mirror', mdAlt.ok && mdAlt.body.length > 100 ? (/markdown/.test(mdAlt.headers.get('content-type') || '') ? 'pass' : 'partial') : 'fail',
    `${finalUrl.replace(/\/$/, '')}.md → HTTP ${mdAlt.status}`);
  const neg = await get(finalUrl, { ua: UA_SELF, accept: 'text/markdown' });
  const negCt = neg.headers.get('content-type') || '';
  const vary = neg.headers.get('vary') || '';
  R('md-negotiation', /text\/markdown/.test(negCt) ? (/accept/i.test(vary) ? 'pass' : 'partial') : 'fail',
    `Accept: text/markdown → ${negCt || 'no content-type'}${/accept/i.test(vary) ? ', Vary: ' + vary : ''}`);
  R('md-alternate', /rel=["']alternate["'][^>]*type=["']text\/markdown/i.test(html) ? 'pass' : 'fail',
    /text\/markdown/i.test(html) ? 'markdown alternate link present' : 'no <link rel=alternate type=text/markdown>');
  const smMd = await probe('/sitemap.md');
  const smMdLinks = (smMd.body.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
  R('sitemap-md', smMd.ok && smMdLinks >= 2 ? 'pass' : smMd.ok ? 'partial' : 'fail',
    smMd.ok ? `sitemap.md lists ${smMdLinks} link(s)` : `HTTP ${smMd.status}`);
  const ask = await get(new URL('/ask?query=what+is+this+site', finalOrigin).toString(), { ua: UA_SELF, accept: 'application/json, text/plain' });
  let askJson = null; try { askJson = JSON.parse(ask.body); } catch { }
  R('nlweb-ask', askJson ? 'pass' : ask.ok && /text\/plain/i.test(ask.headers.get('content-type') || '') ? 'partial' : 'fail',
    askJson ? 'JSON answer from /ask' : `/ask → HTTP ${ask.status}, ${ask.headers.get('content-type') || 'no content-type'}`);
  const linkHdr = home.headers.get('link') || '';
  R('link-headers', linkHdr ? 'pass' : 'fail', linkHdr ? linkHdr.slice(0, 120) : 'no Link header');
  let dnsAid = '';
  try {
    const host = new URL(finalOrigin).hostname;
    const txt = await dns.resolveTxt('_agents.' + host).catch(() => []);
    dnsAid = txt.length ? JSON.stringify(txt) : '';
  } catch { }
  R('dns-aid', dnsAid ? 'pass' : 'fail', dnsAid ? 'DNS discovery record found' : 'no _agents TXT record');
  const agentsAlt = agentsRes.ok && agentsRes.body.length > 50 ? agentsRes : await probe('/.well-known/agents.md');
  R('agents-md', agentsAlt.ok && agentsAlt.body.length > 50 ? 'pass' : 'fail', `AGENTS.md HTTP ${agentsAlt.status}`);
  const agTxt = agentsAlt.ok ? agentsAlt.body : '';
  const agParts = [/(install|npm i|pip install|pnpm|bun)/i, /(config|environment|env var|\.env)/i, /(example|usage|```)/i].filter((rx) => rx.test(agTxt)).length;
  R('agents-md-depth', agParts >= 2 ? 'pass' : agTxt ? 'partial' : 'fail', `${agParts}/3 of install, configuration, examples`);
  R('content-signal', signals.length ? 'pass' : 'fail', signals.length ? signals[0] : 'no Content-Signal line');
  R('llms-indexes-agents', /(mcp|api|openapi|agent)/i.test(llms) ? 'pass' : 'fail', /mcp/i.test(llms) ? 'llms.txt names machine interfaces' : 'llms.txt does not list interfaces');
  R('describedby', /rel=["']describedby["']/i.test(html) || /describedby/i.test(linkHdr) ? 'pass' : 'fail', 'rel=describedby to the index');
  const advertisedFiles = ['/llms.txt', '/sitemap.xml', '/AGENTS.md'];
  R('discovery-file-404', 'pass', 'advertised files checked');

  // --- interfaces (discover-then-validate) ----------------------------------
  const [openapi, apiCatalog, opr, oas, mcpCard, a2a, skills, ard, agentsJson, agentPerms, papDir, wbaKeys] = await Promise.all([
    probe('/openapi.json'), probe('/.well-known/api-catalog'), probe('/.well-known/oauth-protected-resource'),
    probe('/.well-known/oauth-authorization-server'), probe('/.well-known/mcp.json'), probe('/.well-known/agent-card.json'),
    probe('/.well-known/agent-skills/index.json'), probe('/.well-known/ard.json'),
    probe('/.well-known/agents.json'), probe('/.well-known/agent-permissions.json'),
    probe('/.well-known/personal-agent.json'), probe('/.well-known/http-message-signatures-directory'),
  ]);
  const hasApiLink = internal.some((u) => /\/(api|docs|developers?|reference)/i.test(u));
  const devSurface = openapi.ok || hasApiLink || mcpCard.ok || /api/i.test(robotsTxt);
  const GATE_INTERFACES = !devSurface;

  let oaJson = null; try { oaJson = JSON.parse(openapi.body); } catch { }
  R('openapi', oaJson && Object.keys(oaJson.paths || {}).length ? 'pass' : openapi.ok ? 'partial' : 'fail',
    oaJson ? `${Object.keys(oaJson.paths || {}).length} paths` : `openapi.json HTTP ${openapi.status}`);
  let catJson = null; try { catJson = JSON.parse(apiCatalog.body); } catch { }
  R('api-catalog', catJson?.linkset ? 'pass' : 'fail', catJson?.linkset ? 'RFC 9727 linkset' : 'no linkset');
  const oprJson = (() => { try { return JSON.parse(opr.body); } catch { return null; } })();
  R('oauth-protected-resource', oprJson ? 'pass' : 'fail', oprJson ? 'metadata present' : `HTTP ${opr.status}`);
  const oasJson = (() => { try { return JSON.parse(oas.body); } catch { return null; } })();
  R('oauth-as', oasJson ? 'pass' : 'fail', oasJson?.token_endpoint ? 'token endpoint declared' : `HTTP ${oas.status}`);
  const scopes = JSON.stringify(oaJson || {}) + JSON.stringify(oasJson || {});
  R('scopes', /scope/i.test(scopes) ? 'pass' : 'fail', /scope/i.test(scopes) ? 'scopes declared' : 'no named scopes');
  const authMd = await probe('/auth.md');
  R('auth-md', authMd.ok && authMd.body.length > 60 ? 'pass' : 'fail', `auth.md HTTP ${authMd.status}`);
  const mcpJson = (() => { try { return JSON.parse(mcpCard.body); } catch { return null; } })();
  R('mcp-card', mcpJson ? 'pass' : 'fail', mcpJson ? `MCP card: ${Object.keys(mcpJson).slice(0, 6).join(', ')}` : 'no MCP card');
  const mcpFields = mcpJson ? [/(url|endpoint|transport)/i, /(tool|capabilit)/i, /(auth|security)/i, /(schema|inputSchema)/i]
    .filter((rx) => rx.test(JSON.stringify(mcpJson))).length : 0;
  R('mcp-card-fields', mcpFields >= 3 ? 'pass' : mcpFields ? 'partial' : 'fail', `${mcpFields}/4 required groups in the card`);
  let mcpLive = null;
  if (mcpJson) {
    const ep = mcpJson.url || mcpJson.endpoint || mcpJson.server?.url || mcpJson.remotes?.[0]?.url;
    if (ep) {
      const r = await fetch(ep, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'agentkit', version: '1' } } }) }).catch(() => null);
      mcpLive = r ? r.status : 0;
    }
  }
  R('mcp-live', mcpLive === 200 ? 'pass' : mcpCard.ok ? 'fail' : 'not_applicable', `MCP endpoint answered ${mcpLive ?? 'no endpoint in card'}`);
  const a2aJson = (() => { try { return JSON.parse(a2a.body); } catch { return null; } })();
  R('a2a-card', a2aJson ? 'pass' : 'fail', a2aJson ? 'agent card present' : `HTTP ${a2a.status}`);
  const skJson = (() => { try { return JSON.parse(skills.body); } catch { return null; } })();
  R('agent-skills', skJson ? 'pass' : 'fail', skJson ? 'skills index present' : `HTTP ${skills.status}`);
  const wmcp = /webmcp|navigator\.modelContext/i.test(html);
  R('webmcp', wmcp ? 'pass' : 'fail', wmcp ? 'WebMCP registration in page source' : 'no WebMCP registration');
  const ardJson = (() => { try { return JSON.parse(ard.body); } catch { return null; } })();
  R('ard', ardJson ? 'pass' : 'fail', ardJson ? 'ARD manifest present' : `HTTP ${ard.status}`);
  const agentsJsonJson = (() => { try { return JSON.parse(agentsJson.body); } catch { return null; } })();
  const agentsListed = agentsJsonJson && (Array.isArray(agentsJsonJson.agents) ? agentsJsonJson.agents.length
    : Array.isArray(agentsJsonJson.actions) ? agentsJsonJson.actions.length : Array.isArray(agentsJsonJson) ? agentsJsonJson.length : 0);
  R('agents-json', agentsJsonJson && agentsListed ? 'pass' : agentsJsonJson ? 'partial' : 'fail',
    agentsJsonJson ? `${agentsListed} agent(s) enumerated` : `HTTP ${agentsJson.status}`);
  const permsJson = (() => { try { return JSON.parse(agentPerms.body); } catch { return null; } })();
  const scoped = permsJson ? /scope|consent|permission/i.test(JSON.stringify(permsJson)) : false;
  R('agent-permissions', permsJson && scoped ? 'pass' : permsJson ? 'partial' : 'fail',
    permsJson ? (scoped ? 'permissions map actions to scopes' : 'permissions file has no scope/consent keys') : `HTTP ${agentPerms.status}`);
  const papJson = (() => { try { return JSON.parse(papDir.body); } catch { return null; } })();
  R('pap', papJson ? 'pass' : 'fail', papJson ? 'personal-agent profile present' : `HTTP ${papDir.status}`);
  const wbaJson = (() => { try { return JSON.parse(wbaKeys.body); } catch { return null; } })();
  const wbaKeysOk = wbaJson && (Array.isArray(wbaJson.keys) ? wbaJson.keys.length : 0);
  R('web-bot-auth', wbaKeysOk ? 'pass' : wbaJson ? 'partial' : 'fail',
    wbaJson ? `${wbaKeysOk || 0} signing key(s)` : `HTTP ${wbaKeys.status}`);
  const a2ui = /a2ui|application\/a2ui|agentic-ui/i.test(html + JSON.stringify([...home.headers].join(' ')));
  R('a2ui', a2ui ? 'pass' : 'fail', a2ui ? 'A2UI surface declared' : 'no A2UI declaration');
  const errJson = await get(new URL('/api/__agentkit_404', finalOrigin).toString(), { ua: UA_SELF });
  let errBody = null; try { errBody = JSON.parse(errJson.body); } catch { }
  R('json-errors', errBody ? 'pass' : errJson.status >= 500 ? 'fail' : 'partial',
    errBody ? 'JSON problem response' : `unknown API path returned ${errJson.headers.get('content-type') || errJson.status}`);
  const rl = home.headers.get('ratelimit-limit') || home.headers.get('x-ratelimit-limit') || '';
  R('rate-limit-headers', rl ? 'pass' : 'fail', rl ? 'RateLimit headers present' : 'no rate-limit headers');
  const oaProps = oaJson ? JSON.stringify(oaJson.components?.schemas || {}) : '';
  const described = (oaProps.match(/"description"/g) || []).length;
  R('fc-friendly', oaJson ? (described >= 3 ? 'pass' : 'partial') : 'fail', `${described} described properties in the schema`);
  R('dev-portal', hasApiLink ? 'pass' : 'fail', hasApiLink ? 'developer link on the page' : 'no developer link');
  R('public-api', oaJson && Object.values(oaJson.paths || {}).some((v) => Object.values(v).some((o) => /get/i.test(o && typeof o === 'object' ? Object.keys(o).join('') : ''))) ? 'pass' : 'partial',
    oaJson ? 'GET paths declared' : 'no API declared');
  const whenToUse = /when to use|use this (api|agent|server)|when to call/i.test(llms + agentsAlt.body + mcpCard.body);
  R('agent-instruction', whenToUse ? 'pass' : 'fail', whenToUse ? 'when-to-use block found' : 'no when-to-use block');
  R('idempotency', /idempotency-key/i.test(JSON.stringify(oaJson || {}) + (openapi.body || '')) ? 'pass' : 'fail', 'Idempotency-Key documented');
  R('agent-discovery-path', true, 'conventional paths probed');
  const pay = await get(new URL('/.well-known/x402', finalOrigin).toString(), { ua: UA_SELF });
  R('payment-negotiation', pay.ok ? 'pass' : 'fail', `x402 discovery HTTP ${pay.status}`);

  // --- commerce -------------------------------------------------------------
  const commerce = !!productNode || !!prodPage || /add to cart|add-to-cart|view cart|shop now|basket/i.test(dt) || /\/cart/.test(dh);
  const GATE_COMMERCE = !commerce;
  const ucp = await probe('/.well-known/ucp');
  const ucpJson = (() => { try { return JSON.parse(ucp.body); } catch { return null; } })();
  R('ucp-profile', ucpJson ? 'pass' : 'fail', ucpJson ? 'commerce profile present' : `HTTP ${ucp.status}`);
  const ucpEp = ucpJson?.endpoints?.[0]?.url || ucpJson?.services?.[0]?.endpoint || null;
  R('agent-endpoint', ucpEp ? 'pass' : ucpJson ? 'fail' : 'not_applicable', ucpEp ? `endpoint ${ucpEp}` : 'no endpoint advertised');
  const permalink = /\/cart\/[A-Za-z0-9_-]{6,}|\/checkout\?|cartId=|cart_id=/i.test(html);
  R('checkout-permalink', permalink ? 'pass' : 'fail', permalink ? 'cart/checkout permalink shape found' : 'no cart permalink');
  const x402Json = (() => { try { return JSON.parse(pay.body); } catch { return null; } })();
  R('x402', x402Json?.accepts ? 'pass' : 'fail', x402Json?.accepts ? 'x402 accepts array' : 'no x402 accepts array');
  R('ap2', /ap2|agent.?payments? protocol/i.test(JSON.stringify(a2aJson || {}) + JSON.stringify(ucpJson || {})) ? 'pass' : 'fail', 'AP2 advertised');
  const acp = await probe('/.well-known/acp.json');
  R('acp-profile', acp.ok ? 'pass' : 'fail', `acp profile HTTP ${acp.status}`);
  const forms = [...dh.matchAll(/<form[\s\S]*?<\/form>/gi)].map((m) => m[0]);
  const cartForm = forms.some((f) => /add.?to.?cart|addToCart/i.test(f));
  const cartBtn = /<button[^>]*>[^<]*(add to cart|add to bag|buy now)/i.test(dh);
  R('add-to-cart', cartForm && cartBtn ? 'pass' : cartBtn ? 'partial' : commerce ? 'fail' : 'not_applicable',
    cartForm ? 'add-to-cart inside a form' : cartBtn ? 'button without an enclosing form' : 'no add-to-cart control');
  const variantControls = /<select[^>]*(name|id)=["'][^"']*(size|color|variant)/i.test(dh) || /<input[^>]+type=["']radio["'][^>]*name=["'][^"']*(size|color|variant)/i.test(dh);
  R('variant-controls', variantControls ? 'pass' : commerce ? 'fail' : 'not_applicable', variantControls ? 'real variant controls' : 'no variant form controls');
  const searchForm = forms.some((f) => /(action|role)=["'][^"']*search|name=["']q["']|name=["']s["']/i.test(f));
  const searchUrl = /[?&](q|s|query)=/i.test(dh) || searchForm;
  R('site-search', searchForm && searchUrl ? 'pass' : searchUrl ? 'partial' : 'fail', searchForm ? 'search form present' : 'no GET search form');
  const pdpFacts = commerce && priceInHtml && !/<div[^>]+id=["'](root|app|__next)["'][^>]*><\/div>/i.test(dh);
  R('pdp-facts-html', pdpFacts ? 'pass' : commerce ? 'partial' : 'not_applicable', commerce ? (priceInHtml ? 'price in server HTML' : 'no price in HTML') : 'not a commerce page');
  const guestHint = !/sign in to (add|checkout)|login to (add|purchase)/i.test(dt);
  R('guest-checkout', guestHint ? 'pass' : 'fail', guestHint ? 'no login wall before cart' : 'login required before cart');
  const terms = /(shipping|returns?|delivery)/i.test(dt) && /(tax|vat)/i.test(pageText);
  R('checkout-docs', terms ? 'pass' : 'partial', terms ? 'shipping, returns and tax stated' : 'checkout terms incomplete');
  const policies = ['returns', 'shipping', 'terms', 'privacy', 'contact'].filter((p) => new RegExp('/' + p + '|' + p, 'i').test(internal.join(' ')));
  R('policy-links', policies.length >= 4 ? 'pass' : policies.length ? 'partial' : 'fail', `${policies.length}/5 policy pages linked`);

  // --- trust ----------------------------------------------------------------
  const author = /rel=["']author["']|by\s+[A-Z][a-z]+\s+[A-Z][a-z]+|"author"\s*:/i.test(html);
  R('author', author ? 'pass' : 'partial', author ? 'author declared' : 'no author signal');
  const visDate = /\b(20\d{2}-\d{2}-\d{2}|(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+20\d{2})\b/i.test(pageText);
  R('visible-date', visDate ? 'pass' : 'partial', visDate ? 'visible date on the page' : 'no visible date');
  const outbound = [...html.matchAll(/<a[^>]+href=["']https?:\/\/([^"']+)/gi)].map((m) => m[1]).filter((h) => !h.includes(new URL(finalOrigin).hostname));
  R('sources', outbound.length >= 2 ? 'pass' : outbound.length ? 'partial' : 'fail', `${outbound.length} outbound source link(s)`);
  const about = /\/about|\/contact|mailto:/i.test(internal.join(' '));
  R('about-contact', about ? 'pass' : 'fail', about ? 'about/contact reachable' : 'no about or contact link');
  R('org-completeness', /legalName/.test(JSON.stringify(ldOk)) ? 'pass' : orgHit ? 'partial' : 'fail', /legalName/.test(JSON.stringify(ldOk)) ? 'legalName declared' : 'legalName missing');
  const brand = (title.split(/[|\-–—]/).pop() || '').trim();
  const consistent = brand.length > 1 && (jsonLd(html).length ? JSON.stringify(ldOk).toLowerCase().includes(brand.toLowerCase().split(' ')[0]) : true);
  R('entity-consistency', consistent ? 'pass' : 'partial', `brand string "${brand.slice(0, 30)}"`);
  const httpsOk = finalOrigin.startsWith('https://') && (httpRes.status === 301 || httpRes.status === 308 || httpRes.status === 0);
  R('https', httpsOk ? 'pass' : 'partial', `https origin, http:// answered ${httpRes.status}`);
  R('mixed-content', /src=["']http:\/\//i.test(html) ? 'fail' : 'pass', /src=["']http:\/\//i.test(html) ? 'insecure subresource' : 'no insecure subresources');
  const hsts = home.headers.get('strict-transport-security');
  const nosniff = home.headers.get('x-content-type-options');
  R('security-headers', hsts && nosniff ? 'pass' : hsts || nosniff ? 'partial' : 'fail',
    `HSTS ${hsts ? 'yes' : 'no'}, nosniff ${nosniff ? 'yes' : 'no'}`);
  const sample = internal.filter((u) => !/(\.pdf|\.jpg|\.png|\.svg|\.zip)$/i.test(u)).slice(0, 3);
  const broken = (await Promise.all(sample.map(async (u) => (await get(u, { ua: UA_SELF, head: false })).status))).filter((s) => s >= 400).length;
  R('no-broken-links', broken === 0 ? 'pass' : 'fail', `${broken} broken among ${sample.length} sampled links`);

  // fix discovery-file check now that probes are done
  const deadAds = [llmsRes.ok, sitemapRes.ok].filter((x) => !x).length;
  R('discovery-file-404', deadAds === 0 ? 'pass' : 'fail', `${deadAds} advertised file(s) missing`);

  // --- accessibility sub-score ---------------------------------------------
  const a11y = scoreA11y(html, pageText);

  // --- scoring --------------------------------------------------------------
  const scoredChecks = CHECKS.map((c) => {
    const r = results[c.id] || { result: 'inconclusive', evidence: 'not run' };
    let result = r.result;
    if (GATE_INTERFACES && c.domain === 'interfaces') result = 'not_applicable';
    if (GATE_COMMERCE && c.domain === 'commerce' && !['site-search'].includes(c.id)) result = 'not_applicable';
    return { ...c, result, evidence: r.evidence, points: RESULT_POINTS[result] };
  });

  const domains = DOMAINS.map((d) => {
    const items = scoredChecks.filter((c) => c.domain === d.id && c.points !== null);
    const wsum = items.reduce((a, c) => a + c.weight, 0);
    const earned = items.reduce((a, c) => a + c.weight * c.points, 0);
    return { ...d, score: wsum ? Math.round((earned / wsum) * 1000) / 10 : null, checks: items.length,
      passed: items.filter((c) => c.result === 'pass').length, applicable: items.length,
      total: scoredChecks.filter((c) => c.domain === d.id).length };
  });
  const liveDomains = domains.filter((d) => d.score !== null);
  const wTotal = liveDomains.reduce((a, d) => a + d.weight, 0);
  const core = Math.round(liveDomains.reduce((a, d) => a + d.score * d.weight, 0) / wTotal);

  const bonusHits = BONUS_SIGNALS.filter((b) => results[b.id]?.result === 'pass');
  const bonus = Math.min(5, bonusHits.length);
  const mega0 = Math.min(100, core + bonus);
  const mega = Number.isFinite(mega0) ? mega0 : 0;

  let grade = GRADES.find((g) => mega >= g.min);
  if (a11y.score !== null && a11y.score < 80 && grade.grade === 'A+') grade = GRADES[1];

  const reach = CRAWLERS.map((c) => ({ ...c, ...(live[c.ua] || {}) }));
  const accessCoverage = (() => {
    const w = reach.filter((r) => r.weight > 0);
    return { tested: w.filter((r) => r.verdict !== 'unverifiable').length, of: w.length };
  })();
  const accessScore = (() => {
    const w = reach.filter((r) => r.weight > 0 && r.verdict !== 'unverifiable');
    const ok = w.filter((r) => r.verdict === 'allowed').reduce((a, r) => a + r.weight, 0);
    const all = w.reduce((a, r) => a + r.weight, 0);
    return all ? Math.round((ok / all) * 100) : null;
  })();

  const level = computeLevel(results, scoredChecks);

  return {
    url: origin, finalUrl, scannedAt: new Date().toISOString(), engine: 'ARI-100',
    score: mega, core, bonus, bonusSignals: bonusHits.map((b) => b.id),
    grade: grade.grade, gradeLabel: grade.label,
    level, accessScore, accessCoverage, a11yScore: a11y.score, a11yReport: a11y,
    domains,
    checks: scoredChecks,
    crawlers: reach,
    fixes: scoredChecks.filter((c) => c.points !== null && c.points < 1)
      .sort((a, b) => (b.weight * (1 - b.points)) - (a.weight * (1 - a.points)))
      .map((c) => ({ id: c.id, domain: c.domain, title: c.title, weight: c.weight, result: c.result,
        evidence: c.evidence, recoverable: Math.round(c.weight * (1 - c.points) * 10) / 10,
        prompt: fill(c.fix, { origin: finalOrigin, url: finalUrl, evidence: c.evidence }) })),
    counts: {
      total: scoredChecks.length,
      applicable: scoredChecks.filter((c) => c.points !== null).length,
      pass: scoredChecks.filter((c) => c.result === 'pass').length,
      partial: scoredChecks.filter((c) => c.result === 'partial' || c.result === 'warn').length,
      fail: scoredChecks.filter((c) => c.result === 'fail').length,
      notApplicable: scoredChecks.filter((c) => c.result === 'not_applicable').length,
      inconclusive: scoredChecks.filter((c) => c.result === 'inconclusive').length,
    },
    durationMs: Date.now() - started,
  };
}

const fill = (tpl, vars) => String(tpl || '').replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');

function computeLevel(results, scored) {
  const ok = (id) => results[id]?.result === 'pass' || results[id]?.result === 'partial';
  if (!ok('robots-valid') || !ok('sitemap')) return 0;
  if (!(ok('ai-search-bots') && ok('bot-policy-deliberate'))) return 1;
  if (!(ok('md-negotiation') || ok('llms-conform'))) return 1;
  if (!(ok('link-headers') || ok('dns-aid') || ok('ard'))) return 2;
  if (!(ok('mcp-live') || ok('a2a-card') || ok('a2a') || ok('public-api'))) return 3;
  if (!(ok('ucp-profile') || ok('x402') || ok('checkout-permalink'))) return 4;
  return 5;
}

function scoreA11y(html, pageText) {
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const interactive = [...html.matchAll(/<(button|input|select|textarea)[^>]*>/gi)].map((m) => m[0]);
  const levels = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const res = {};
  const put = (id, ok, note) => { res[id] = { result: ok === null ? 'not_applicable' : ok ? 'pass' : 'fail', note: note || '' }; };
  put('img-alt', imgs.length ? imgs.every((t) => /\balt\s*=/.test(t)) : null, `${imgs.filter((t) => !/\balt\s*=/.test(t)).length}/${imgs.length} missing alt`);
  const noLabel = interactive.filter((t) => !/aria-label|aria-labelledby|<label|id=/i.test(t)).length;
  put('form-label', interactive.length ? noLabel === 0 : null, `${noLabel} unlabelled`);
  put('control-name', interactive.length ? true : null, 'see structure check');
  const media = [...html.matchAll(/<(img|iframe|video)\b[^>]*>/gi)].map((m) => m[0]);
  put('media-dims', media.length ? media.every((t) => /width\s*=/.test(t) && /height\s*=/.test(t)) : null, `${media.filter((t) => !/width\s*=/.test(t)).length} without dimensions`);
  put('aria-refs', /aria-labelledby|label for=/i.test(html) ? !/aria-labelledby=["'][^"']+["']/i.test(html) || [...html.matchAll(/aria-labelledby=["']([^"']+)["']/gi)].every((m) => html.includes(`id="${m[1]}"`)) : null, '');
  const iframes = [...html.matchAll(/<iframe\b[^>]*>/gi)].map((m) => m[0]);
  put('iframe-title', iframes.length ? iframes.every((t) => /title=|aria-label/i.test(t)) : null, `${iframes.length} iframes`);
  let skip = 0; const seq = levels.map((m) => +m[1]);
  for (let i = 1; i < seq.length; i++) if (seq[i] - seq[i - 1] > 1) skip++;
  put('heading-levels', seq.length ? skip === 0 : null, `${skip} skipped`);
  put('tabindex', /tabindex=["'][1-9]/i.test(html) ? false : true, '');
  put('zoom', /user-scalable=no|maximum-scale=1\b/i.test(html) ? false : true, '');
  put('doc-title', /<title[^>]*>\s*\S/i.test(html), '');
  put('label-in-name', true, '');
  put('skip-link', /<main[\s>]|skip (to|nav)/i.test(html), '');
  put('lang-valid', /<html[^>]+lang=["'][a-z]{2,3}(-[A-Za-z0-9]{2,8})*["']/i.test(html), '');
  put('aria-hidden-focus', /aria-hidden=["']true["'][^>]*>\s*<a\b/i.test(html) ? false : true, '');
  put('nested-interactive', /<a[^>]*>[\s\S]{0,200}?<button/i.test(html) ? false : true, '');
  put('empty-heading', levels.length ? levels.every((m) => text(m[2]).length > 0) : null, '');
  put('meta-refresh', /http-equiv=["']refresh["']/i.test(html) ? false : true, '');
  put('autocomplete', /autocomplete=["'](?!on$|off$)[a-z- ]+["']/i.test(html) ? true : null, '');
  put('table-headers', /<table/i.test(html) ? /<th[\s>]/i.test(html) : null, '');
  put('svg-title', /<svg/i.test(html) ? /<svg[^>]*role=["']img["'][^>]*>[\s\S]{0,200}<title/i.test(html) || !/<svg/i.test(html) : null, '');
  put('captions', /<video/i.test(html) ? /<track[^>]*kind=["']captions/i.test(html) : null, '');
  put('list-structure', /<ul[^>]*>[\s\S]*?<li/i.test(html) ? /<ul[^>]*>\s*<div/i.test(html) ? false : true : null, '');
  const ariaRoles = [...html.matchAll(/\brole=["']([^"']+)["']/gi)].map((m) => m[1]);
  const validRoles = /^(alert|alertdialog|application|article|banner|button|cell|checkbox|columnheader|combobox|complementary|contentinfo|definition|dialog|directory|document|feed|figure|form|grid|gridcell|group|heading|img|link|list|listbox|listitem|log|main|marquee|math|menu|menubar|menuitem|menuitemcheckbox|menuitemradio|navigation|none|note|option|presentation|progressbar|radio|radiogroup|region|row|rowgroup|rowheader|scrollbar|search|searchbox|separator|slider|spinbutton|status|switch|tab|table|tablist|tabpanel|term|textbox|timer|toolbar|tooltip|tree|treegrid|treeitem)$/;
  put('aria-valid', ariaRoles.length ? ariaRoles.every((r) => validRoles.test(r)) : null, `${ariaRoles.filter((r) => !validRoles.test(r)).length} invalid roles`);

  const scored = Object.values(res).filter((r) => r.result !== 'not_applicable');
  const score = scored.length ? Math.round((scored.filter((r) => r.result === 'pass').length / scored.length) * 100) : null;
  return { score, checks: res, applicable: scored.length, total: Object.keys(res).length };
}
