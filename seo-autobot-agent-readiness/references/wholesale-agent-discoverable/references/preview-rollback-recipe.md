# Preview rollback recipe — take a long-lived preview off a wrong commit without touching Production

When the operator reverses scope mid-build and the preview host (`<store>.example` etc.) is already serving the wrong commit, the only safe move is: revert on the branch → trigger-build on the preview environment → verify the backend `/version` returns the reverted SHA. Production stays untouched because the deploy rule (`release:<brand>`) does not match a normal commit on `main`.

This is the long-lived-preview shape: the preview tracks the preview branch directly with NO deploy rule, so any commit on that branch becomes a candidate for build. Production (<store>-preview for <store>, <store>-staging for <store>) tracks `main` and only deploys when the commit message contains `release:<brand>`. A regular merge to `main` does NOT deploy Production.

## When to use

- The preview host (`<subdomain>.<store>.example` or `.app`) is serving a commit that no longer matches the brief.
- The operator reversed scope mid-build and the live preview now carries pages or routes that should not be there.
- The card is in scope for preview, NOT for Production. Production rollback is a separate recipe (use your production release runbook).

## Procedure

1. **Identify the wrong commit and the preview branch.** Pull `mcloud environments get <preview-name>` for `default_subdomain` and `external_id` (= branch name). Read the live `/version` to record the current `commit_sha` and `build_timestamp` as the rollback target.

   ```bash
   mcloud environments get <preview-env> -p <store>-b2b-storefront --json \
     | jq '{handle, default_subdomain, default_domain, external_id}'
   curl -fsS https://<default_domain>/version
   ```

2. **Find the commit to revert.** `git log <preview-branch> --oneline -n 20` — the wrong commit is the one that introduced the un-wanted pages. If the un-wanted change is a single feature commit, revert it:

   ```bash
   git checkout <preview-branch>
   git pull origin <preview-branch>
   git revert --no-edit <bad-sha>
   git push origin HEAD:<preview-branch>
   ```

   If the wrong change is many commits, the right move is a force-reset to the previous good SHA — but only on the preview branch, NEVER on `main`:

   ```bash
   git checkout <preview-branch>
   git reset --hard <last-good-sha>
   git push --force-with-lease origin <preview-branch>
   ```

3. **Trigger a fresh build on the preview environment, NOT Production.**

   ```bash
   mcloud environments trigger-build <preview-name> -p <project-handle> -e <preview-name>
   ```

   Verify the build picked up the new tip:

   ```bash
   mcloud deployments list -p <project-handle> -e <preview-name> --limit 1 --json \
     | jq '.[0] | {id, commit_hash, backend_status, storefront_status}'
   ```

   `commit_hash` MUST equal the post-revert SHA. A mismatch means the build picked up the wrong tip — stop and re-check the branch state.

4. **Verify the rollback is live.** Wait for `backend_status: deployed`. Then read the BACKEND `/version` (NOT the `.site` storefront stamp, which is frozen):

   ```bash
   curl -fsS https://<default_domain>/version
   ```

   `commit_sha` MUST equal the post-revert SHA. `build_timestamp` MUST be within the build that just finished.

5. **Spot-check the rolled-back routes.** Pick 1–2 URLs the operator named as out-of-scope (e.g. `/us/store`, `/us/products/<handle>`, `/us/legality/<state>`). Each should now return 404 or be served from the pre-revert tree. The storefront's `/version` is informational, NOT evidence.

6. **Keep the wrong-direction PRs as drafts.** Any PR that introduced the bad commits stays `isDraft: true` and unmerged. `gh pr ready <n> --undo` if a reviewer had flipped it ready. Do not delete the PR; it is the audit trail.

7. **Report.** Write a task comment with the rollback SHA, build id, environment handle, and the verified `/version` SHA. Include the PID for any background process that was killed mid-build (the worker that triggered the deletion chain).

## Pitfalls

- **Do NOT trigger Production by accident.** A `feat(b2b): public discovery Pack A` merge to `main` does NOT deploy Production unless the commit message contains `release:<brand>`. But a `git push origin <preview-branch>` does not touch Production — preview branches are not Production tracks. The mistake is `mcloud environments trigger-build production` (or the Production env name) — `whoami` shows the active env in the CLI; if the active context is Production, switch first with `mcloud use -e <preview-name>`.
- **`--force-with-lease` only on the preview branch.** `git push --force-with-lease` rewrites history; on `main` it is a coordination break with anyone else pushing. On the preview branch it is the right tool because the branch is single-tenant for this build.
- **The storefront `.site` `/version` is a frozen stamp.** The build went green but the storefront stamp can still show the old SHA. Trust the BACKEND `/version`, not the storefront stamp. See the identity-pin step in your production release runbook for the full IDENTITY_FIRST preflight.
- **A canceled build still appears in the list with `status: canceled`.** A build you triggered 30 seconds ago may show `canceled` if the next trigger raced it. Always check `status` AND `started_at` — a `canceled` row from a previous trigger does not stop a new trigger.
- **Keep the wrong-direction PRs as drafts.** Do not close them. The PR body, the diff, and the reviewer comments are the audit trail of what was reversed. The operator may ask to see why a given page was rolled back; the PR diff answers without you having to remember.
- **Revert vs reset.** Revert (a new commit that undoes) keeps both chains in `git log`. Reset (rewrites history) removes the wrong commit. Use revert when audit is shared (preview branch tracked by multiple lanes, a known reviewer, an open PR); use reset when the branch is single-tenant for this build.

## Always-on rule

Preview rollback is a `git revert` + `mcloud environments trigger-build <preview>` + `/version` pin. Production rollback is a different recipe (see your production release runbook "Roll back under a new build" + the `release-time.txt` + `release-sha.txt` pin pair). Never cross the recipes — they target different tracks with different deploy rules.
