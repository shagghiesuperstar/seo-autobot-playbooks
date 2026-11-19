# Scoring a site against an external agent-readiness rubric

Read when the ask is "make this site score 100% on <named scanner>" or "pass every check in <agent-readiness spec>". This is a different job from grading an MCP endpoint you already own (`mcp-endpoint-live-probe.md`) and from building one (`mcp-endpoint-build-and-bot-wiring.md`): here the acceptance criteria belong to a third party, and the only way to hit them is to read THEIR definition of each check before you write a line.

## 1. Get the rubric from the scanner's own published docs, never from memory of a score

A scanner's public score page is a summary. The criteria live in a machine-readable doc the scanner publishes for agents (commonly `llms-full.txt` or an equivalent spec page). Fetch that, and build your check list from it.

- Record, per check: the exact name, what it fetches, what status and content-type it demands, and which field it reads. A check that "looks for OAuth" may actually look for three distinct documents at three distinct paths.
- Note the checks the scanner grades from DNS or from a live third-party lookup (DNSSEC, a registry entry). Those cannot be satisfied by a file in the repo, so they belong on the ship card, not the build card.
- **A scan that publishes a result page under the domain's name is the operator's action, not yours.** But check for a JSON endpoint first: some scanners serve the full result (overall score, per-category scores, every criterion with status and findings) at a stable URL with no page published and no side effect. When one exists, that JSON is the fastest honest baseline — read it, and still write the local reproduction below so you can re-measure without the scanner. The HTML page is a spinner; the data is in the JSON.

## 1b. Known scanner: <store>.example

`GET https://<store>.example/api/scan?url=<host>` returns the full result as JSON (no auth, no published page). Shape: `overallScore`, `grade`, `platform`, `pagesSampled`, `categories[]` (`id`, `name`, `weight`, `score`) and `criteria[]` (`id`, `name`, `category`, `weight`, `status`, `findings[]`, `fixPrompt`, `score`). The HTML page at `/scan?url=` only renders a spinner, so never read the score off the page.

Grade it with the third-party triage rules in SKILL.md, not as a work list: `fail` and `partial` rows are claims about production until reproduced. Two traps specific to this scanner: it samples a handful of pages and guesses product URLs, so a finding on one PDP is not proof about the catalog; and it reads SERVER HTML only, so "no add-to-cart control" means the control is absent from the initial response — which is exactly the server-render requirement in section 1 and section 5, not evidence the button is missing for humans.

## 2. Write the local reproduction BEFORE the implementation

One script, one check per rubric row, run against a local dev server. It is the acceptance gate and the only honest progress number ("11/15" beats "nearly done"). Each check must assert the thing the rubric asserts — status, content-type, and the specific field — not merely that the URL returns 200.

- Run it once before any change and keep the output. A check that already passes is not work, and a baseline you did not record cannot prove the diff.
- A check that fails locally for a reason the rubric does not care about (a dev server with no TLS failing an HTTPS-only assertion) gets noted as environment, not as a gap.

## 3. Never advertise an endpoint that does not exist yet

Discovery files are read by agents that then CALL what they find. A `Link` header, an `llms.txt` line, or a server card that names a path returning 404 is worse than silence: it sends the agent into a dead end and it fails the check anyway.

- Split the work at the capability boundary. The discovery files and the endpoint they point at ship together; anything that needs a capability the site does not have yet (a real login, a payment flow) is a separate card, and the files stay silent about it until that card lands.
- The same rule applies inside one file: an `auth.md` that documents a grant type the server does not implement is a false advertisement. Document only the flows the code actually runs, and add a test that fetches every URL the file names.

## 4. Auth checks need a genuinely working flow, not a metadata stub

When the rubric checks for OAuth, it checks that the discovery documents and the endpoints agree and that a client can complete the flow. Static JSON that describes an endpoint is not a pass.

- Read the site's existing identity mechanism before designing one. A site that already emails a sign-in link has an identity provider; reuse it. Inventing a parallel account system to satisfy a scanner is scope the rubric never asked for.
- Keep read tools anonymous. Adding auth must not put a wall in front of a surface that was public, or you will pass the auth checks and fail the reachability ones.
- Pin the abuse cases in the spec, not as afterthoughts: PKCE required on the public client, `redirect_uri` validated against an exact registered list, tokens stored hashed, and registration rate-limited. These are the things a review finds and a scanner never tests.

## 5. The one check that is not a file

DNSSEC and DNS-based discovery records are zone settings, not repo content. They go on the ship card, and the builder's local score is reported honestly short of them.

- Enabling DNSSEC is reversible and is an operator-owned zone action, so it proceeds; the DS record at the registrar often is not, because the registrar may be a different vendor than the DNS host.
- When the DS step is outside the DNS host, stop and hand the operator the exact record and the exact registrar screen. Do not block the rest of the ship on it, and do not report the check as passed.
- Prove the registrar before writing that operator step. `whois` Registrar plus the zone NS: if both are Cloudflare, the parent DS publishes automatically. Zone status `pending` plus a computed DS digest is waiting on the registry, not on the operator. Do not ask them to paste a DS at a registrar screen that does not exist. Watch with a silent `dig DS` plus the AD flag until both are live, then re-run only the DNS check.
- A discovery record (SVCB/HTTPS) on the authoritative nameserver is not the DNSSEC check. Query `@<ns>.ns.cloudflare.com` for the record; query a public resolver for `DS` and the `ad` flag. Public resolvers lag the authoritative NS. Report the DNS check failed only when DS or AD is absent, and say which one is missing.

## 6. Prove it against production with the same script

Point the local reproduction script at the live host after deploy and paste its output. A scanner score the operator runs afterwards is confirmation, not the evidence — your evidence is the script output plus the live curls of each new path, taken after the deploy, on the SHA that shipped.

- A scanner script whose HTTP client is Python urllib scores 0 on a Cloudflare zone with Browser Integrity Check even when every path is 200 to curl. Re-probe the failing paths with curl and with python-requests before treating 0 as a failed deploy. If only `Python-urllib/*` is refused, document a User-Agent; do not disable the zone check.
