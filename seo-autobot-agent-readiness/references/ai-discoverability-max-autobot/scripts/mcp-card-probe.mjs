#!/usr/bin/env node
// Probe: does /.well-known/mcp.json list the tools the /mcp endpoint actually serves?
//
// Usage: node scripts/mcp-card-probe.mjs [base-url] [card-path]
//   base-url   default https://<store>.example
//   card-path  default /.well-known/mcp.json
//
// Exit 0 = AGREE, exit 1 = DISAGREE (usable as a CI gate / release check).
//
// Compares the card's `tools` array against a live initialize + tools/list on
// /mcp: same names, same count, same order, and each card inputSchema
// deep-equals what the endpoint serves.
//
// Transport note: POST /mcp answers SSE, so the `data:` prefix is stripped
// before parsing. Some servers answer with bare JSON; both are handled.

const BASE = (process.argv[2] || 'https://<store>.example').replace(/\/$/, '');
const CARD_PATH = process.argv[3] || '/.well-known/mcp.json';
const UA = 'mcp-card-probe/1.0 (read-only card-vs-endpoint comparison)';

const fails = [];
const notes = [];

function fail(msg) { fails.push(msg); console.log(`FAIL ${msg}`); }
function ok(msg) { console.log(`OK   ${msg}`); }
function note(msg) { notes.push(msg); console.log(`     ${msg}`); }

function sseToJson(text) {
  for (const line of String(text).split(/\r?\n/)) {
    if (line.startsWith('data:')) return line.slice(5).trim();
  }
  return text; // bare JSON fallback
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { /* keep null */ }
  return { status: res.status, contentType: res.headers.get('content-type') || '', body, text };
}

async function mcpCall(base, method, params, sessionId) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    'user-agent': UA,
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;

  const res = await fetch(`${base}/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: Math.floor(Math.random() * 1e9), method, params }),
  });
  const text = await res.text();
  let parsed = null;
  try { parsed = JSON.parse(sseToJson(text)); } catch { /* keep null */ }
  return { status: res.status, sessionId: res.headers.get('mcp-session-id'), parsed, raw: text };
}

console.log(`BASE                 ${BASE}`);
console.log(`CARD                 ${CARD_PATH}`);

// ---- 1. the card -------------------------------------------------------
const card = await getJson(`${BASE}${CARD_PATH}`);
console.log(`CARD status          ${card.status} ${card.contentType}`);

if (card.status !== 200) {
  fail(`card returned HTTP ${card.status}, expected 200`);
} else if (!card.body || typeof card.body !== 'object') {
  fail('card body is not JSON');
}

const cardObj = card.body || {};
const cardTools = Array.isArray(cardObj.tools) ? cardObj.tools : [];
const cardNames = cardTools.map((t) => t && t.name);

console.log(`CARD tools (${cardNames.length})  ${cardNames.length ? cardNames.join(', ') : '(none)'}`);
console.log(`TOP-LEVEL KEYS       ${Object.keys(cardObj).sort().join(', ')}`);

if (!('tools' in cardObj)) {
  fail('the card has no top-level "tools" key');
} else if (cardNames.length === 0) {
  fail('the card lists no tools at all');
}

// ---- 2. the live endpoint ------------------------------------------------
const init = await mcpCall(BASE, 'initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'mcp-card-probe', version: '1.0.0' },
});

if (!init.parsed) {
  fail(`initialize returned no parseable JSON (HTTP ${init.status}): ${init.raw.slice(0, 200)}`);
  console.log(`\nRESULT               DISAGREE (endpoint unreachable)`);
  process.exit(1);
}

const list = await mcpCall(BASE, 'tools/list', {}, init.sessionId);
const liveTools = list.parsed?.result?.tools || [];
const liveNames = liveTools.map((t) => t && t.name);

console.log(`LIVE tools (${liveNames.length})  ${liveNames.length ? liveNames.join(', ') : '(none)'}`);

if (liveNames.length === 0) {
  fail('the endpoint served no tools; cannot compare card to endpoint');
  console.log(`\nRESULT               DISAGREE`);
  process.exit(1);
}

// ---- 3. the three-way comparison ----------------------------------------
if (cardNames.length === liveNames.length && JSON.stringify(cardNames) === JSON.stringify(liveNames)) {
  ok('names and order match');
} else {
  fail('names/order differ');
  console.log(`     card: ${JSON.stringify(cardNames)}`);
  console.log(`     live: ${JSON.stringify(liveNames)}`);
}

for (const name of liveNames) {
  if (!cardNames.includes(name)) {
    fail(`${name} is served but missing from the card`);
  }
}
for (const name of cardNames) {
  if (!liveNames.includes(name)) {
    fail(`${name} is in the card but not served`);
  }
}

for (const live of liveTools) {
  const cardEntry = cardTools.find((t) => t && t.name === live.name);
  if (!cardEntry) continue;

  for (const field of ['inputSchema', 'outputSchema']) {
    if (live[field] === undefined) continue;
    if (JSON.stringify(cardEntry[field]) !== JSON.stringify(live[field])) {
      fail(`${name}: card ${field} differs from what the endpoint serves`);
    }
  }
  for (const field of ['title', 'annotations']) {
    if (live[field] !== undefined && cardEntry[field] === undefined) {
      fail(`${name}: card is missing ${field}`);
    }
  }
  if (typeof cardEntry.description !== 'string' || !cardEntry.description.trim()) {
    fail(`${name}: card entry has no description`);
  }
}

// ---- 4. remote / protocol sanity ----------------------------------------
const remote = (cardObj.remotes || [])[0] || {};
if (remote.url) {
  const remotePath = remote.url.replace(BASE, '');
  if (remotePath && remotePath !== '/mcp') {
    note(`card remote url is ${remote.url} (not the probed endpoint path)`);
  }
}

const verdict = fails.length === 0 ? 'AGREE' : 'DISAGREE';
console.log(`\nRESULT               ${verdict}`);
if (fails.length === 0) {
  ok('card lists every live tool, schema for schema');
}
process.exit(fails.length === 0 ? 0 : 1);
