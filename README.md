# steer-runtime

AI agents for your entire team — devs, BAs, QA, ops, and PMs — running in any IDE.

50 agents, 7 profiles, one setup.

## Install

Install [Koda](https://github.com/rsanchez-disney/Koda) first, then:

```bash
koda install dev        # Dev agents (or: ba, qa, ops, pm)
koda mcp-install        # Setup MCP servers + tokens
koda chat --agent orchestrator
```

## Profiles

| Profile | Agents | Focus |
|---------|--------|-------|
| dev | 23 | Code, review, test, security, PRs, architecture |
| ba | 7 | Requirements, scope, stories, PRD generation, quality gates |
| qa | 10 | Test planning, automation, E2E generation, defect analysis |
| ops | 7 | AI metrics, infra, deployments, code quality, release management |
| pm | 6 | Sprints, standups, retros, risk tracking, delivery reports |

## Releases

Release tarballs are published as [GitHub Releases](https://github.com/rsanchez-disney/steer-runtime/releases). Koda downloads them automatically.

Source code is maintained internally.
