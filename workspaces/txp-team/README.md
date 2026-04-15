# TxP Team — Workspace

Stencil web components for Disney vacation package booking flows.

## Projects

| Repo | Purpose |
|------|---------|
| [wdpr-quick-quote](https://github.disney.com/wdprd-development/wdpr-quick-quote) | New Stencil component (active development) |
| [lodging-quick-quote](https://github.disney.com/wdprd-development/lodging-quick-quote) | Legacy component (behavioral reference) |
| [wdpr-ra-web-components](https://github.disney.com/WDPR-RA-UI-Components/wdpr-ra-web-components) | Disney RA UI component library (reference) |

## Quick Start

```bash
koda workspace apply txp-team
koda mcp-install
```

## Profiles

- `dev-core` — orchestrator, code review, planning agents
- `dev-web` — UI, UX specialist, webapi agents

## Rules (inherited)

- `conventional_commit` — commit message format
- `general-node-development` — Node.js/TypeScript best practices
- `vista-design-system` — Vista component-first UI development
- `wdpr-dependency-versioning` — `^` for `@wdpr/`, `~` for everything else

## Context Files

| File | Description |
|------|-------------|
| `txp-team-context.md` | Team overview, repos, tech stack, brands/locales |
| `stencil-conventions.md` | Architecture patterns, RA integration, testing |
| `team_standards.md` | Code review SLA, branch naming, deployment |
| `cookie-testing-reference.md` | `roomForm_jar` cookie formats for WDW, DLR, UK |

## Workspace Path

`~/dev` — all 3 repos clone here (`~/dev/wdpr-quick-quote`, `~/dev/lodging-quick-quote`, `~/dev/wdpr-ra-web-components`).

## JIRA

- Project: **ROS**
- Prefix: `ROS-`
