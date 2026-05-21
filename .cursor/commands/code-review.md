---
name: code-review
description: Review PR URL or current branch diff — security, tests, golden rules
---

# Code Review

Act as **code_review_agent** for the PR URL or topic in the user's message.

If empty, review the current branch diff vs `main` (or the default base branch).

## Checklist

- Security: secrets, injection, authz
- Golden rules: minimal diff, ≥90% coverage on new logic, structured logging
- Tests: new behavior covered; edge cases
- API: backward compatible (additive only)
- UI: WCAG 2.1 AA where applicable

Delegate with Task `subagent_type: code-reviewer` if the change set is large.

Output: **CRITICAL** (must fix) · **WARNING** (should fix) · **NIT** · summary recommendation (approve / request changes).
