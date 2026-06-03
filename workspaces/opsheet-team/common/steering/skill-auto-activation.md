---
inclusion: always
description: Auto-discover and activate skills from ~/.kiro without explicit user invocation
---

# Skill Auto-Activation

Skills are markdown files located in `~/.kiro/skills/` and its subdirectories. Each skill has a frontmatter with `name` and `description` fields that describe when it should be used.

## Behavior

1. When receiving a user request, scan available skill files and match the request intent against skill descriptions
2. If a skill's description matches the user's intent, read its full content and execute it immediately
3. Do not ask the user to "activate" or "use" a skill — activation is automatic based on intent matching
4. If no skill matches, proceed normally

## Discovery

Skills are organized by profile:

- `~/.kiro/skills/` — common skills (apply to any repo)
- `~/.kiro/skills/{profile}/` — profile-specific skills (apply when working in that stack)

Use the skill's `description` field as the primary matching signal. The `name` field can also be used as a keyword trigger.
