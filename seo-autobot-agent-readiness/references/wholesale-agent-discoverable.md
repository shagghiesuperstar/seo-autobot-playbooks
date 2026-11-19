---
name: wholesale-agent-discoverable
description: "Use when humans are gated but agents see the full catalog."
metadata:
  version: "0.1.0"
  category: "agent-discoverability"
  collection: "extended"
  source_name: "wholesale-agent-discoverable"
  source_path: "agent-discoverability/wholesale-agent-discoverable/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

# Wholesale — agent-discoverable catalog layer

Wholesale-only sites are gated to humans industry-wide (sign-in / business license / approved account). The whole catalog — products, SKUs, photos, COA links, brand metadata — is public to AI crawlers and agent buyers. Humans see a closed door; agents see the store. This skill captures the rules for shipping that second layer without ever weakening the human gate or accidentally exposing wholesale prices to signed-out visitors.

## When to Use

Trigger when ANY of the following describe the work in front of you:

- Building a wholesale-only storefront and the operator confirms crawlers and AI agents must see the full catalog scope without signing in.
- Adding `llms.txt`, `llms-full.txt`, `sitemap.xml`, JSON-LD, `robots.txt`, or `/.well-known/*` to a gated-B2B site.
- A signed-out Store API response carries prices — that's a wholesale leak this skill knows how to fix (audit recipe in `references/wholesale-leak-checks.md`).
- The operator reverses scope mid-build and the preview host is already serving the wrong commit (rollback recipe in `references/preview-rollback-recipe.md`).

## The doctrine

- **Same catalog as a logged-in trade buyer, not more.** <owner> 2026-10-05 22:14 CT: robots do not get more than humans. The agent layer (llms.txt, llms-full.txt, JSON-LD Organization/FAQ, feeds) carries the same catalog information a logged-in trade buyer sees, and must explain why humans are gated: trade-only wholesale, licensed/approved retailers, state-by-state legality and age rules, and how to apply. An AI must understand both the gate and the inventory behind it. Human pages stay gated. Do not open signed-out product pages unless a later order says so.
- **Copy tone is facts and reasoning, not a defense.** On llms.txt, llms-full.txt, JSON-LD Organization/FAQ, and feeds, state the context plainly: trade-only wholesale, licensed/approved retailers, state-by-state legality and age rules, why a human must sign in, and how to apply. Let each AI judge for itself. No apologetic or defensive copy.
- **Prices stay out until <owner> confirms agent price handling.** Until that relay lands, no wholesale price on any agent surface. A price in anonymous JSON-LD or a public feed is a leak.
- **No blanket `Disallow`.** A `robots.txt` that blocks crawlers wholesale defeats the discovery goal. The robots file lets the crawlers in but tells them where prices live (`/us/account/*`), so price-discovery probes route correctly.
- **Cloaking by intent, not by User-Agent.** A page that renders different HTML for `User-Agent: GPTBot` vs `User-Agent: Mozilla/5.0` is detectable and unsafe. The shape that holds is "the human page does not expose the data at all (price-stripped, no PDP route); the agent-readable surface is its own URL set (`/llms.txt`, `/llms-full.txt`, sitemap, JSON-LD, anonymous catalog endpoints) that does not carry prices or wholesale content."
- **Previews exist for visual changes, period.** the owner standing order: "Previews have very little value other than a human review of an aesthetic change." Machine-readable surfaces (`llms.txt`, `llms-full.txt`, JSON-LD, anonymous Store API catalog feeds, `.well-known/*`, `sitemap.xml`) are NOT visual; they ship on a branch cut from the live SHA, pointed at the long-lived env, single build, no preview step. The default for "where does this preview go?" is the LIVE host. The default for "should I open a new Cloud preview instance?" is NO — fight the Cloud preview quota only when the change is something a human can look at and judge. Non-visual changes do not justify burning a preview slot.

## Procedure

1. **Confirm scope with the operator in writing, every time.** Wholesale sites sit at the intersection of competitive disclosure, bank review, and state-by-state compliance. Before any human-visible page changes, write the exact scope back to the operator: which URLs become agent-visible, what fields are exposed, what is stripped. A "yes to agents and crawlers" message without a named URL list is NOT scope; treat the response as zero and ask.
2. **Branch the work into two PRs.** Human-visible UI lives on its own PR (default draft). Agent-readable layer — robots/llms/sitemap/JSON-ld/well-known, anonymous Store API catalog feeds, price-stripped PDP responses — lives on its own PR. The two MUST be mergeable independently so a human-agent scope inversion can roll back one without the other.
3. **Strip wholesale fields from the agent surface.** The price-stripping rule lives in a server-side `catalogPriceGate` (or equivalent) on the anonymous Store API read path: never strip on the client. Verify the response: `variants[*].prices` should be empty/undefined; the public Product schema retains only allowlisted metadata. NEVER ship price-stripping by `display: none` or null-on-render — the data still travels over the wire.
4. **Build robots.txt to permit discovery but ban price paths.** Shape:
   ```
   User-agent: *
   Allow: /
   Disallow: /us/account/
   Disallow: /us/checkout/
   Disallow: /api/
   Sitemap: https://<host>/sitemap.xml
   ```
   Pair it with `llms.txt` per llmstxt.org (project title + summary + sections) and `llms-full.txt` carrying every product URL with name + SKU + COA URL. The full file is what crawlers index; the short file is what LLMs read first.
5. **Carry the catalog as machine-readable surfaces, not only HTML.** The minimum viable agent-readable set:
   - `robots.txt`, `llms.txt`, `llms-full.txt`, `sitemap.xml`
   - `/.well-known/security.txt`, `/.well-known/change-log.txt` if compliance uses them
   - JSON-LD on every signed-out PDP / category page (`@type: Product`, `name`, `sku`, `image`, `brand`, `url`, `sameAs` for COA)
   - Anonymous Store API catalog endpoints (price-stripped) so crawlers can pull the full set without rendering HTML
6. **Bake price-stripping into the response, not the route.** A signed-out anonymous request to `/store/products/<id>` returns 200 with the price fields stripped at the server; a signed-in (same) block at `/us/account`. The route is the same; only the response shape differs by viewer kind. Verify with both: anonymous shows 200, prices empty; signed-in shows 200 with prices. NEVER use a route guard to deny the anonymous read — that hides the catalog from agents.
7. **Reject the merge request that mixes human UI and agent surface.** A single PR that adds `discover(catalog)` AND `page.tsx` for a public PDP is a scope-creep failure shape: bank review cannot sign one without the other, rollback touches both. Two PRs is the only shape that survives a "scope correction from operator" mid-build.
8. **Roll back via preview rebuild, not new commit.** When the operator reverses scope mid-build and the preview host (`<store>.example` etc.) is already serving the wrong commit:
   - `git revert` the human-page commit on the preview branch (`git revert --no-edit <sha>`); commit only the revert.
   - `mcloud environments trigger-build <preview-name> -p <project-handle> -e <preview-name>` — Cloud reads the branch's new tip and rebuilds.
   - Verify `/version` (backend) returns the reverted commit SHA BEFORE claiming rollback complete.
   - DO NOT merge any new human-page PR. Keep it draft. The preview rebuild is enough to take the human pages off the host.

## Pitfalls

- **Opening any signed-out HUMAN route needs a quoted the owner order dated after the 10-05 lock.** Before carding, reviewing or releasing a PR that makes /us/store, /us/products/*, /us/categories/* (or any grid/PDP) render for signed-out visitors, paste the verbatim the owner order into the release card. No quote = humans stay gated (307 to /us/account), and only the agent surfaces (llms, feeds, sitemap, /us/coa, brands, faq, legality) are public. Why: PR #<pr> "Pack A" (10-10) opened signed-out browsing with no such order; the owner caught it on cutover day (10-11: "without having to login first!"). Also: never render a "No COA on file" label; show the lab-report link only when coa_url exists.

- **A blanket `Disallow` is a scope failure, not a safety move.** Wholesale sites that block all crawlers lose discovery to GPTBot, Claude, Perplexity, and the agent-buy tooling the operator wants feeding on the catalog. `Disallow: /us/account/` only — keep everything else open. A safety-minded blanket block is the same anti-discovery bug as a noindex-everywhere ship.
- **Price-stripping on the client is data exfiltration over the wire.** A `display:none` on the price node still serializes the price into the JSON-LD blob the crawler parsed. The fix is the `catalogPriceGate` on the backend read; no client override belongs in this card.
- **Cloaking by User-Agent is detectable and unsafe.** A page that serves different HTML to `User-Agent: GPTBot` vs `Mozilla/5.0` is cloaking and Google ranks it as deceptive. The agent-readable shape is the SAME HTML with prices stripped at the source, plus separate URLs (`llms.txt`, `sitemap.xml`) that crawlers parse — not different HTML per bot.
- **Wholesale price in any signed-out response = leak.** A single price field reaching an anonymous Store API response is a leak. Verify per-row with `jq '.products[] | {id, variants: [.variants[] | {prices: .prices}]}'` against an unauthenticated `/store/products` curl; every `prices` array is empty/undefined for anonymous. A non-empty price is a rollback trigger.
- **When authoring a deploy spec, source the base SHA from the backend `/version`, not the storefront `.site/version` stamp.** The storefront stamp is frozen at the commit that first introduced `deploy-stamp.generated.ts`; the BACKEND `.app/version` (`source == "env:MEDUSA_CLOUD_GIT_COMMIT_SHA"`) reflects the actual running Cloud build. An orchestrator that writes a deploy spec keyed on the storefront stamp rolls the live site back; an orchestrator that keys on the backend SHA writes a clean branch-cut-from-live spec. Always run `curl -fsS <backend>/version` before writing the spec, and quote `commit_sha` + `build_timestamp` + `source` in the spec body.
- **Mixing human UI and agent layer in one PR blocks rollback.** A PR that ships `/us/store/` page + `llms.txt` together cannot be partially reverted; rolling back the human page forces rolling back the agent layer too. Two PRs (human: draft only; agent: independent) is the only shape that survives a mid-build scope correction.
- **The store `.site` `/version` is a frozen stamp.** A `mcloud deployments list → succeeded` is not proof the running storefront serves the rolled-back commit. Read the BACKEND `/version` and assert `commit_sha == <revert-sha>`; the storefront's stamp is informational.
- **No blanket Human-Tier X-Agent-Tier merge on a release rule.** Wholesale Production tracks `main` and only deploys when the commit message contains `release:<brand>`. A `feat(b2b): public discovery Pack A` merge to `main` does NOT trigger Production unless the rule matches. Triggering Production is a separate card; preview environments track the branch with NO rule.
- **Crawlers do not authenticate.** Anything that requires a Bearer/JWT to be useful to a crawler is invisible to crawlers. The agent-readable layer must be reachable with zero auth — no API key, no cookie, no Cloudflare Access. The price gate is the only gate.
- **Branch the fix from the BACKEND `/version`, not the storefront `.site/version` stamp.** The storefront stamp is frozen at the commit that first introduced the stamp generator; the BACKEND `.app/version` (`source == "env:MEDUSA_CLOUD_GIT_COMMIT_SHA"`) reflects the actual running Cloud build. A branch cut from a stale stamp keeps the queue rebuilding an artifact no customer will see. Same rule for the deploy spec — quote `commit_sha` + `source` from the BACKEND, never from `.site/version`.
- **The release rule is the commit-message string, not the branch.** `mcp environments list` returns `external_id` (e.g. `release/<store>`, `agent/<store>-agent-on-<sha>`) AND a deployment rule. Medusa Cloud rebuilds on a push to the tracked branch, but only when the commit message matches the rule (e.g. `release:<store>`). A push with a non-matching message leaves the running backend unchanged. To deploy: push to the tracked branch AND include the rule keyword in the commit message. A merge commit alone does not satisfy the rule; if the merge does not match, add an empty marker commit whose message contains the rule keyword, and confirm via `mcp environments get <env-id> -p <project-handle> -e <env-name>` and a fresh `mcp deployments list` build id.
- **Merge a PR into the same branch the env tracks.** If the env's `external_id` is `release/<store>`, the merge target is `release/<store>`, not `main`. Merging into a branch the env does not track leaves the live build unchanged even when the build rule is satisfied. After the merge, re-read `external_id` from `mcp environments get` BEFORE the marker commit — never assume the tracked branch from a previous env id.

## Always-on rules

- The operator's only stopping criterion on a wholesale discovery build is "humans gated, agents wide open, no leaks" — never "all builds green" or "preview matches main".
- Wholesale prices NEVER appear on the anonymous Store API response, JSON-LD, robots.txt, sitemap, or any signed-out URL. Verify with an unauthenticated `curl -fsS https://<host>/store/products | jq` per release; one blank in every prices slot is the proof.
- A scope correction from the operator arrives supersede-style: write the new scope, stop in-flight cards, draft any unmerged PRs, and rebuild the affected preview with the corrected commit. Do NOT keep building the old scope.

## References

- `references/wholesale-leak-checks.md` — the curl/jq probes that prove no wholesale price reaches any signed-out surface (anonymous Store API, JSON-LD, sitemap, robots); per-field per-page audit recipe.
- `references/preview-rollback-recipe.md` — the revert-on-branch + mcloud-environment-to-trigger-build + `/version` BACKEND-pin sequence for taking a long-lived preview off a wrong commit without touching Production.
- `references/agent-surface-validation.md` — sitemap ↔ feed handle parity, robots-allow-list subset check, llms.txt stamp accuracy (backend `/version`, not the frozen storefront stamp), JSON-LD shape audit, and feed-image catalog check.
