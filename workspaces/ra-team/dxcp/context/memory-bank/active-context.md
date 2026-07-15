# DXCP Active Context

Current team focus and in-flight work. Update this file as priorities shift.

## Current Focus

- Platform addon standardization and override lifecycle management
- Cross-account S3 IRSA patterns for fleet workloads
- Sprint metrics automation and team velocity tracking
- Sandbox-to-production promotion workflow improvements

## Recent Decisions

- ADR-20260618: Override naming uses two-segment versioning (*-vX.X)
- ADR-20260613: Artifact vs override content split for alerting rules
- Dual Jira routing: Cloud (disneyexperiences.atlassian.net) as default, Enterprise only when directed

## Open Questions

- (Add open questions here as they arise during ticket work)

## Known Issues

- Some Rafay v3 GET endpoints return 403 intermittently — RBAC regression under investigation
- Sprint metrics queries hit 100-result cap; pagination workaround in place
