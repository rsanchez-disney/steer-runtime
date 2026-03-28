# Defect Report Templates

## Bug Report

```
Summary: [Component] — [Short description of the defect]

Environment: [Staging/Production] | [Browser/OS] | App v[X.Y.Z]

Steps to Reproduce:
1. [Step]
2. [Step]
3. [Step]

Expected: [What should happen]
Actual: [What happens instead]

Severity: [Critical/High/Medium/Low]
Priority: [P0/P1/P2/P3]

Attachments: [Screenshots, logs, HAR files]
Related: [DPAY-XXXX, PR #XX]
Workaround: [Yes/No — describe if yes]
```

## Severity Guide

| Severity | Criteria | SLA |
|----------|----------|-----|
| Critical | System down, data loss, security breach | Fix within 4h |
| High | Major feature broken, no workaround | Fix within 1 sprint |
| Medium | Feature degraded, workaround exists | Prioritize in backlog |
| Low | Cosmetic, minor UX issue | Best effort |

## Root Cause Categories

- Code logic error
- Missing input validation
- Race condition / concurrency
- Configuration / environment
- Third-party dependency
- Data migration / schema
- Missing error handling
