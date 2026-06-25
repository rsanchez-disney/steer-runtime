# Contributed Agents

Agents shared by teams from their workspaces for org-wide adoption.

## How it works

1. A team builds a useful agent in their workspace
2. They share it: `./scripts/share-agent.sh <workspace> <agent-name>`
3. The agent lands here with `status: pending_review`
4. A maintainer reviews, assigns to a profile, and merges

## Status lifecycle

| Status | Meaning |
|--------|---------|
| pending_review | Shared but not yet reviewed |
| approved | Reviewed, ready to assign to a profile |
| promoted | Moved to an official profile |
| rejected | Not suitable for org-wide use (reason in meta) |

## Files per contribution

- `<agent>.json` — Agent definition
- `<agent>.md` — Prompt file (if applicable)
- `<agent>.meta.json` — Contribution metadata (source, date, status)
