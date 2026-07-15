# DXCP Team Learnings

Persistent knowledge captured from ticket work, incidents, and platform operations.

## Rafay Patterns

- AddonOverride `metadata.name` MUST exactly match the filename (without .yaml) — Rafay silently ignores mismatches
- `versionRegex` uses Go regex syntax; escape dots with `\\.`
- `sharing: {}` (empty map) removes override from all clusters; `sharing:` with `projects: []` (empty list) is different
- CloudEvents endpoint returns most recent events first; use `?limit=N` to control
- Blueprint changes can take 5–10 minutes to reconcile across fleet clusters

## Helm Pitfalls

- Rafay `{{{ .global.Rafay... }}}` triple-brace syntax is NOT Helm — these files fail `helm lint`
- Always create synthetic test values for local validation
- Immutable selector changes (matchLabels) cause deployment failures on upgrade — never change after initial release
- Subchart globals can leak across charts; always scope with chart name prefix

## AWS / IAM

- Cross-account S3 requires Pod Identity in source account + `dxcp-xa-s3-*` role in ra-sandbox
- IRSA annotations must match the exact service account name in the namespace
- `WDPR-DATABASE_ENGINEER` role is only for wdpr-ipe-sandbox; all others use `WDPR-RAI_ENGINEER`
- Session tokens from assume-role expire after 1 hour by default

## Jira / Workflow

- AC lives in `customfield_10166` (Cloud) not description — many tickets have empty AC field by mistake
- JQL `maxResults` caps at 100; always paginate with `startAt` for sprint velocity queries
- Sprint field `closedSprints` in Jira response is per-issue, not a project-level list — don't infer sprint catalog from it
- Team field adoption varies by sprint; check before computing per-team metrics

## PR / Review

- wdpr-cloud-paas-rafay org has a PR template in `.github/` — always use it
- One dependency layer per PR is enforced by review convention, not CI
- Scope leaks are the #1 review feedback item — keep PRs atomic

## Incidents / Operational

- Rundeck vault API uses version 36, not 52 — different from standard Rundeck API
- Rafay RBAC regression: some v3 endpoints return 403 when v1 equivalents work — use audit script to verify
