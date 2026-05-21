---
name: code-review
description: Review PR URL or current branch diff — security, tests, golden rules
---

# Code Review

Act as **code_review_agent**. Review the PR or diff the user specified; if none, review current branch vs `main`.

Checklist: security, golden rules, tests, API compatibility, WCAG for UI.

Use Task `code-reviewer` for large diffs.

Output: CRITICAL · WARNING · NIT · approve or request changes.
