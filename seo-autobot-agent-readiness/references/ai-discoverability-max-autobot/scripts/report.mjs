// Markdown report + agent fix-prompt pack.
export function renderMarkdown(r) {
  const L = [];
  L.push(`# Agent readiness — ${r.finalUrl}`);
  L.push('');
  L.push(`**ARI-100 ${r.score}/100 · grade ${r.grade} (${r.gradeLabel}) · level L${r.level}**`);
  L.push('');
  L.push(`core ${r.core} + emerging-signal bonus ${r.bonus} · crawler access ${r.accessScore}/100 · accessibility ${r.a11yScore ?? 'n/a'}/100`);
  L.push(`scanned ${r.scannedAt} · ${r.counts.applicable} checks scored of ${r.counts.total} · ${r.counts.pass} pass, ${r.counts.partial} partial, ${r.counts.fail} fail`);
  L.push('');
  L.push('## Domains');
  L.push('| domain | weight | score | passed |');
  L.push('|---|---|---|---|');
  for (const d of r.domains) L.push(`| ${d.name} | ${d.weight} | ${d.score ?? '—'} | ${d.passed}/${d.checks} |`);
  L.push('');
  L.push('## Crawler reachability');
  L.push('| crawler | platform | role | verdict |');
  L.push('|---|---|---|---|');
  for (const c of r.crawlers) if (c.weight > 0 || c.verdict !== 'allowed') L.push(`| ${c.ua} | ${c.platform} | ${c.role} | ${c.verdict} |`);
  L.push('');
  L.push('## Failing checks, most recoverable first');
  for (const f of r.fixes) {
    L.push(`### ${f.title}  (+${f.recoverable})`);
    L.push(`\`${f.domain}/${f.id}\` · weight ${f.weight} · **${f.result}** · ${f.evidence}`);
    L.push('');
    L.push(f.prompt);
    L.push('');
  }
  L.push('## Paste-ready prompt for a coding agent');
  L.push('```text');
  L.push(promptPack(r));
  L.push('```');
  return L.join('\n');
}

export function promptPack(r) {
  const head = [
    `You are fixing the agent readability of ${r.finalUrl} (Agent Readiness Index ${r.score}/100, grade ${r.grade}).`,
    `Work top to bottom. Each item states the observed evidence, the required outcome, and the check id that will be re-run to verify it.`,
    `Do not restyle the site. Do not invent facts: prices, reviews, dates and author names must come from content that already exists.`,
    '',
  ];
  const items = r.fixes.map((f, i) => `${i + 1}. [${f.id}] (weight ${f.weight}, +${f.recoverable}) ${f.title}\n   Observed: ${f.evidence}\n   Fix: ${f.prompt}`);
  return head.concat(items).join('\n');
}
