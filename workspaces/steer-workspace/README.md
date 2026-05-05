# Steer Workspace

Development workspace for the entire steer ecosystem.

## Repos

| Repo | Purpose |
|------|---------|
| steer-runtime | Agent configs, prompts, MCP servers, workspaces |
| Koda | CLI/TUI manager |
| steer-autopilot | Multi-agent pipeline orchestration |
| steer-plugins | VS Code + IntelliJ IDE plugins |
| Kite | Desktop GUI |
| KiteStream | Web streaming interface |

## Setup

```bash
koda workspace apply steer-workspace
```

## Profiles

- `dev-core` — orchestrator, code review, planning, architecture
- `dev-web` — TypeScript/Node specialists
- `qa` — testing agents
- `ops` — releases, deployments
- `steer-master` — specialized reviewer for steer-runtime/Koda consistency

## Default Agent

`steer_orchestrator_agent` — aware of all repos, cross-repo impacts, and the steer-master review rules.
