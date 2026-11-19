#!/usr/bin/env node
// agentkit scan <url> [--json out.json] [--md out.md]
import { scan } from './scan.mjs';
import { writeFileSync } from 'node:fs';
import { renderMarkdown } from './report.mjs';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
if (!url) { console.error('usage: node engine/cli.mjs <url> [--json f] [--md f]'); process.exit(2); }
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };

const t0 = Date.now();
const r = await scan(url);
if (r.error) { console.error(JSON.stringify(r, null, 2)); process.exit(1); }

const jf = opt('json'), mf = opt('md');
if (jf) writeFileSync(jf, JSON.stringify(r, null, 2));
const md = renderMarkdown(r);
if (mf) writeFileSync(mf, md);

const line = `\n${r.finalUrl}\n  ARI-100 ${r.score}/100  (core ${r.core} + bonus ${r.bonus})  grade ${r.grade} ${r.gradeLabel}  level L${r.level}\n  crawler access ${r.accessScore}/100   a11y ${r.a11yScore ?? 'n/a'}/100\n  ${r.counts.pass} pass, ${r.counts.partial} partial, ${r.counts.fail} fail, ${r.counts.notApplicable} n/a, ${r.counts.inconclusive} inconclusive (${r.counts.applicable} scored)\n`;
console.log(line);
console.log('domains:'); for (const d of r.domains) console.log(`  ${String(d.score ?? '—').padStart(6)}%  ${d.name} (${d.passed}/${d.checks})`);
console.log('\ntop recoverable fixes:');
for (const f of r.fixes.slice(0, 8)) console.log(`  +${f.recoverable}  ${f.domain}/${f.id} — ${f.title}\n        ${f.evidence}`);
console.log(`\n${Date.now() - t0} ms`);
