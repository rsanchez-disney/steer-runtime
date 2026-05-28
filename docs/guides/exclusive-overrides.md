# Exclusive Overrides

## Problem

When a workspace overrides a global profile (e.g., `dev-web`), the default behavior is **additive** — workspace files are layered on top of the global profile. All base agents, skills, and context are preserved.

Some workspaces need **exclusive** mode — they want ONLY their specified agents/skills, removing the global ones they don't use.

## Solution: `exclusive_overrides` in workspace.json

```json
{
  "name": "opsheet-team",
  "profiles": ["dev-core", "dev-web"],
  "exclusive_overrides": {
    "dev-web": ["agents", "skills"]
  }
}
```

This means:
- `dev-web/agents/` → exclusive: only workspace agents installed, global `astro.json` removed
- `dev-web/skills/` → exclusive: only workspace skills installed, global dev-web skills removed
- `dev-web/steering/` → additive (not listed): global + workspace steering files coexist
- `dev-core` → fully additive (not listed in exclusive_overrides)

## Behavior Matrix

| Scenario | `exclusive_overrides` | Result |
|----------|----------------------|--------|
| app-gift-card (adds 1 agent to dev-core) | not set | All dev-core agents preserved ✅ |
| opsheet-team (wants only 4 dev-web agents) | `{"dev-web": ["agents", "skills"]}` | Global astro.json removed ✅ |
| User adds custom_agent.json manually | any | Never removed (not in global profile) ✅ |

## Valid directory names for exclusive_overrides

- `agents` — agent JSON files
- `skills` — skill markdown files
- `context` — context markdown files
- `rules` — rule files
- `steering` — steering files
- `powers` — power files

## Legacy: `_exclusive` marker files

For backward compatibility, placing a file named `_exclusive` inside a workspace override directory has the same effect:

```
workspaces/my-team/profiles/dev-web/agents/_exclusive
```

The `workspace.json` field is preferred — it's declarative and visible without browsing the directory tree.

## Implementation

- **Koda commit**: https://github.disney.com/SANCR225/Koda/commit/8c3e4fa
- **steer-runtime commit**: https://github.disney.com/SANCR225/steer-runtime/commit/7cfeaf1
