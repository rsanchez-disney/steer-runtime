# Artifact Conventions

## Ticket Folder Structure

All work artifacts are stored per-ticket in:
```
DXCP_tickets/[IOET-XXXX] <title>/
```

## Standard Artifacts

| File | Produced By | Purpose |
|------|-------------|--------|
| context-brief.md | Context gathering | Full context snapshot |
| pr-review.md | PR review | Code review summary |
| pr-review-summary.md | PR review | Condensed verdict |
| helm-chart-review.md | Helm review | Chart review checklist |
| helm-review-test-values.yaml | Helm review | Synthetic test values |
| validation-summary.md | Peer review | Validation against AC |
| jira-approval-comment.md | Peer review | Draft approval (NOT auto-posted) |
| story-scorecard.md | Quality evaluator | Sprint readiness score |
| metrics-report.md | Metrics report | Sprint/team metrics |

## Rules

1. **Create the folder** before writing any artifacts
2. **Use the exact naming** from the table above
3. **Never auto-post** jira-approval-comment.md to Jira
4. **Include ticket ID** in folder name with Jira title
5. **Overwrite** existing artifacts when re-running a workflow (latest version wins)
