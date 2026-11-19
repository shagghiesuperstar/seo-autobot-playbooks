---
name: websmith-mcp-review
description: Use when a business has (or is building) an MCP server and wants it checked for quality and safety, covering tool names, annotations, outputSchema, server card, auth, errors, and OWASP MCP risks. Also use when the audit runner finds an MCP endpoint. Read-only by default.
---

# Websmith MCP quality review

Covers checks WS-MCP-01 through WS-MCP-20 in `../seo-autobot-agent-readiness/references/websmith-checklist/CHECKLIST.md`. The MCP spec revision is 2026-07-28 (stateless, `server/discover`). Many servers still speak 2025-11-25, so support both.

## Rules

- Allowed calls: `server/discover`, `initialize` + `notifications/initialized`, `tools/list`, `resources/list`, `prompts/list`. **Never `tools/call`** unless the owner approves one specific call in chat and the tool says `readOnlyHint: true`.
- Use auth tokens only from environment variables (`$WS_MCP_TOKEN`). Never echo them. Unauthenticated review is the default.
- Rate-limit to 1 request/second. Fail loud: any failed call is UNTESTED with the error.

## Steps

1. **Find the endpoint.** Check the profile first, then `/.well-known/ai-catalog.json` entries, `<mcp-url>/server-card`, docs links, and the MCP Registry search: `curl -sS -m 20 'https://registry.modelcontextprotocol.io/v0/servers?search=<brand>'`.
2. **Connect (2026-07-28 first):**
   ```
   curl -sS -m 20 -X POST "$M" -H 'Content-Type: application/json' \
     -H 'Accept: application/json, text/event-stream' \
     -d '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{}}'
   ```
   If that fails, use the 2025-11-25 flow: `initialize` with `"protocolVersion":"2025-11-25"`, keep the `Mcp-Session-Id` response header, send `notifications/initialized`, then `tools/list`. Record which protocol version worked. SSE responses: parse the `data:` lines.
3. **Auth probe (no token):** on a 401, read `WWW-Authenticate` for `resource_metadata` and `scope`, fetch the Protected Resource Metadata (RFC 9728), then the authorization server metadata (RFC 8414 / OIDC). Check that `code_challenge_methods_supported` includes `S256`. A public docs-only server SHOULD stay public. A server exposing private data or actions MUST require OAuth.
4. **Origin probe:** repeat a list call with `Origin: https://ws-origin-test.invalid`. 403 is expected when credentials or cookies are in play.
5. **Tool review**, for every tool:
   - The name matches `^[A-Za-z0-9_.-]{1,128}$` and is unique.
   - It has a `title` plus a plain, accurate description with no model-directed instructions, hidden unicode, or "always call me" language (tool poisoning, OWASP MCP03).
   - `annotations` are set and true to life: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`. Defaults are the worst case (read-only false, destructive true, idempotent false, open-world true), so missing annotations make clients more cautious.
   - Data tools have an `outputSchema`, so results carry `structuredContent`.
   - The `inputSchema` is tight: types, `required`, enums, length limits, `additionalProperties: false`.
   - Consequential tools (money, messages, account changes, deletes) have a confirm step or two-phase design (OWASP LLM06 / ASI02 / ASI09).
   - UGC/third-party text is returned in labeled fields (MCP06/MCP10).
6. **Determinism:** run `tools/list` twice and diff the order.
7. **Server card (SEP-2127, Final):** `GET <mcp-url>/server-card` should return `application/mcp-server-card+json` with identity and remote endpoints. It must contain no credentials, internal hosts, or user data. Cards intentionally don't list tools, so don't fail a card for leaving them out. Check that `/.well-known/ai-catalog.json` references it. Treat legacy `/.well-known/mcp.json` as informational only.
8. **Registry:** if listed, check that `server.json` `remotes[].url` matches the live endpoint and that package versions are pinned. Publishing goes through `mcp-publisher` with namespace verification, never through a PR to the registry repo. The registry is still a preview.
9. **Attest-only items** (ask the developer and record as `[ATTESTED]`): token audience/issuer validation (RFC 8707, `iss` per RFC 9207), no token passthrough, per-client consent for proxied OAuth, SSRF protections on any URL-fetching tool, audit logs, rate limits, dependency pinning, and a kill switch.
10. **Output:** append the MCP rows to the run's `results.json`. For each FAIL/WARN, include a ready-to-paste fix (see `websmith-fix-pack` snippets: annotations, outputSchema, server card, ai-catalog entry).

## Annotation cheat sheet (for fixes)

| Tool kind | readOnlyHint | destructiveHint | idempotentHint | openWorldHint |
|---|---|---|---|---|
| search/lookup own catalog | true | n/a | n/a | false |
| fetch arbitrary URL / web search | true | n/a | n/a | true |
| create cart / quote (repeatable with key) | false | false | true | false |
| place order / book / send message | false | true | false | false (true if it calls third parties) |
| delete / cancel | false | true | true | false |

Annotations are hints that clients treat as untrusted, so enforce permissions on the server too.


## Internal method resolver (merged library)
All following names mean Read the listed file through this category skill, not load a separate external skill. Paths here are relative to this category skill directory; helper paths inside each playbook are relative to `references/<slug>/`.
- `websmith-fix-pack` → `../seo-autobot-agent-readiness/references/websmith-fix-pack.md`.
