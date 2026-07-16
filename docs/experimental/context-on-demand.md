# Context on-demand

> 🧪 **Status:** Experimental
> **Since:** v0.2.160 (steer-runtime)

Loads context files only when the current task matches keyword triggers — saving 30%+ tokens per session by avoiding irrelevant context injection.

## Quick start

Add `on-demand` frontmatter to any context file:

```markdown
---
inclusion: on-demand
trigger: "security|auth|encryption|PII|GDPR"
description: "Security context — loaded when task involves authentication or compliance"
---

# Security guidelines
...
```

The file loads only when the task description matches the trigger regex.

## How it works

1. Agent spawns → `context-inject.sh` hook fires
2. Hook reads the task prompt (`KIRO_PROMPT` env var)
3. Scans all `~/.kiro/context/*.md` files for `inclusion: on-demand`
4. If the task matches the `trigger:` pattern → injects the file into context
5. Non-matching files are never loaded

## Frontmatter schema

```yaml
---
inclusion: on-demand          # required — marks file as conditional
trigger: "regex|pattern"      # required — pipe-separated keywords (case-insensitive)
description: "Human reason"   # optional — shown in logs when loaded
---
```

## Migrated files (examples)

| File | Trigger | Saves |
|------|---------|:-----:|
| `email_guidelines.md` | email, notify, send message | ~2KB |
| `api_testing_with_bruno.md` | bruno, api test, contract test | ~4KB |
| `defect_templates.md` | bug, defect, RCA, incident | ~3KB |

## Relationship to other features

| Feature | Relationship |
|---------|-------------|
| `inclusion: always` | Always loaded — use for critical rules (golden_rules, sdlc-workflow) |
| `inclusion: auto` | Loaded by steering engine based on file path — existing behavior |
| `inclusion: on-demand` | New — conditional on task keywords |
