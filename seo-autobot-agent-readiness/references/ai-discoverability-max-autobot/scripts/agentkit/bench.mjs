#!/usr/bin/env node
// Bench: for each site config, measure the live baseline, then the projected
// score with the readiness kit applied through the preview proxy.
//   node engine/bench.mjs [glob]
import { spawn, execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { scan } from './scan.mjs';

const dir = 'sites';
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && (!process.argv[2] || f.includes(process.argv[2])));
const rows = [];
const PORT0 = 8900;

const runPreview = (cfgFile, port) => new Promise((resolve) => {
  const p = spawn('node', ['engine/preview.mjs', cfgFile, String(port)], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, TLS: '1' } });
  let ready = false;
  p.stdout.on('data', (d) => { if (/preview\s+\S+/.test(String(d))) { ready = true; resolve(p); } });
  p.stderr.on('data', () => {});
  setTimeout(() => { if (!ready) resolve(p); }, 4000);
});

for (let i = 0; i < files.length; i++) {
  const cfgFile = `${dir}/${files[i]}`;
  const cfg = JSON.parse(execFileSync('cat', [cfgFile]).toString());
  const port = PORT0 + i;
  let base, proj, err = '';
  try { base = await scan(cfg.host); } catch (e) { err += 'baseline: ' + e.message + '; '; }
  // the preview is a local self-signed TLS proxy; without this every projected
  // scan dies at the handshake and the row silently reports null
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  try {
    execFileSync('node', ['engine/kit.mjs', cfgFile, `out/kit-${new URL(cfg.host).hostname}`], { stdio: 'ignore' });
    const p = await runPreview(cfgFile, port);
    // wait until the preview actually answers before scanning, or every scan
    // reads a half-built kit and reports phantom sitemap/discovery failures
    for (let t = 0; t < 40; t++) {
      try { const r = await fetch(`https://127.0.0.1:${port}/llms.txt`); if (r.ok) break; } catch {}
      await new Promise((s) => setTimeout(s, 250));
    }
    try { proj = await scan(`https://127.0.0.1:${port}`); } finally {
      p.kill('SIGKILL');
      // wait for the port to actually be released, or the next iteration
      // reuses it and an orphaned preview serves the PREVIOUS site's kit
      await new Promise((r) => p.once('exit', r));
      await new Promise((r) => setTimeout(r, 300));
    }
  } catch (e) { err += 'projected: ' + e.message + '; '; }
  const row = {
    site: new URL(cfg.host).hostname,
    baseline: base?.score ?? null,
    baselineGrade: base?.grade ?? null,
    projected: proj?.score ?? null,
    projectedGrade: proj?.grade ?? null,
    level: proj?.level ?? base?.level ?? null,
    a11y: proj?.a11y?.score ?? base?.a11y?.score ?? null,
    access: proj?.crawlerAccess?.score ?? base?.crawlerAccess?.score ?? null,
    remaining: (proj?.fixes || []).slice(0, 6).map((f) => `${f.id}(${f.recoverable})`),
    err,
  };
  rows.push(row);
  await new Promise((r) => setTimeout(r, 5000));
  console.log(`${row.site.padEnd(24)} ${String(row.baseline).padStart(3)} -> ${String(row.projected).padStart(3)}  ${row.projectedGrade} ${err}`);
}
mkdirSync('out', { recursive: true });
// merge into the existing file: a one-site run must not erase the others
let prev = [];
try { prev = JSON.parse(readFileSync('out/bench.json', 'utf8')); } catch {}
const by = new Map(prev.map((r) => [r.site, r]));
for (const r of rows) by.set(r.site, r);
writeFileSync('out/bench.json', JSON.stringify([...by.values()].sort((a, b) => a.site.localeCompare(b.site)), null, 2));
console.log('\nwrote out/bench.json');
