# Workspace Naming Convention

## Tiers

Every workspace belongs to one of four tiers, identified by its suffix:

| Tier | Pattern | Purpose | Example |
|------|---------|---------|---------|
| **Vertical** | `{name}-vertical` | LoB/leadership oversight over multiple teams | `payments-vertical`, `lodging-vertical` |
| **Team** | `{name}-team` | Dev/ops team workspace | `shield-team`, `dpi-team`, `finder-services-team` |
| **Sustainment** | `sustainment-{studio}` | Ops-scoped to a managed services catalog studio | `sustainment-kaos`, `sustainment-mars` |
| **Project** | `app-{name}` | Single project/app scope within a team | `app-config-studio`, `app-gift-card` |

### Special workspaces

| Name | Purpose |
|------|---------|
| `default` | Fallback workspace when no workspace is selected |
| `steer-platform` | Platform development (steer-runtime, Koda, Kite) |
| `sustainment` | Parent workspace for all sustainment children |

## Rules

1. **Tier indicator is mandatory** — every workspace must include `-vertical`, `-team`, `sustainment-` prefix, or `app-` prefix to indicate its tier
2. **kebab-case** — all lowercase, hyphens only, no underscores or spaces
3. **Directory = name** — the workspace directory name must match the `name` field in workspace.json
4. **No redundant words** — don't include "workspace", "studio-" (in sustainment), or "project" in the name
5. **Short and recognizable** — prefer team acronyms or short names over full descriptions

## Hierarchy

```
workspaces/
├── {name}-vertical/              ← leadership profile, teams[] field
├── {name}-team/                  ← dev/ops team
│   └── app-{name}/              ← project sub-scope (optional children)
├── sustainment/                  ← parent
│   └── sustainment-{studio}/    ← ops-scoped to catalog studio
├── default/                      ← fallback
└── steer-platform/               ← platform internal
```

## How to determine the tier

| Condition | Tier |
|-----------|------|
| Has `leadership` profile or `teams[]` field | Vertical |
| Has `sustainment` profile + `managed_studios` + ops-focused | Sustainment |
| Is a sub-scope of a team (child directory) | Project (`app-`) |
| Everything else | Team |

## Verticals vs Teams

- **Verticals** supervise multiple teams. They use the `leadership` profile and have a `teams[]` field listing the teams they oversee.
- **Teams** do the actual work. They have dev/qa/ops profiles and `projects[]` with repos.

A vertical never has `projects[]`. A team never has `teams[]`.

## Sustainment workspaces

Sustainment workspaces are children of the `sustainment` parent workspace:
- They live under `workspaces/sustainment/`
- They use `"extends": "sustainment"`
- They have `managed_studios` to scope the catalog
- The studio name drops the `studio-` prefix: `sustainment-kaos` (not `sustainment-studio-kaos`)

## Project workspaces (app-)

When a team has multiple distinct projects that benefit from separate contexts:
- Parent team workspace: `app-team/` (Adaptive Payment Platform)
- Children: `app-config-studio/`, `app-gift-card/`, `app-payment-sheet/`

The `app-` prefix indicates these are project-scoped, not team-scoped.

## Migration

When renaming a workspace, add an entry to `workspaces/renames.json`:
```json
{
  "renames": {
    "old-name": "new-name"
  }
}
```

Koda reads this file on sync and auto-migrates users' `activeWorkspace` setting. Remove entries after all users have synced (typically 2-4 weeks).

## Examples

| ✅ Good | ❌ Bad | Why |
|---------|--------|-----|
| `shield-team` | `shield` | Missing tier suffix |
| `payments-vertical` | `payments-and-commerce-vertical` | Too long |
| `sustainment-kaos` | `sustainment-studio-kaos` | Redundant `studio-` |
| `app-config-studio` | `config-studio-project` | Use `app-` prefix for projects |
| `finder-services-team` | `finder-services` | Missing `-team` suffix |
