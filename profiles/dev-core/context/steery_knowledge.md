# Steery Knowledge Base

Condensed reference for the steer-runtime support assistant.

## Platform Overview

steer-runtime is an AI agent platform for software teams. 41 agents across 7 profiles.

Tools: **Kiro** (CLI engine) · **Kite** (desktop GUI) · **Koda** (terminal companion) · **Steery** (Slack bot)

## Profiles

| Profile | Agents | Orchestrator | Focus |
|---------|--------|-------------|-------|
| dev-core | 13 | orchestrator | SDLC orchestration, planning, code review, security, testing, PRs |
| dev-web | 4 | — | Java backend, Node.js API, Angular UI, UX/accessibility |
| dev-mobile | 3 | — | Flutter, Android native, iOS native |
| dev (alias) | 20 | orchestrator | All of dev-core + dev-web + dev-mobile |
| ba | 4 | ba_orchestrator_agent | Requirements, scope, user stories, acceptance criteria |
| qa | 6 | qa_orchestrator_agent | Test planning, automation, defect analysis, API & perf testing |
| ops | 5 | ops_orchestrator_agent | AI metrics, infra checks, deployments (Harness), code quality (SonarQube) |
| pm | 6 | pm_orchestrator_agent | Sprints, standups, retros, risk tracking, delivery reports |

## Install with Koda

```
curl -fsSL https://github.disney.com/raw/SANCR225/steer-runtime/main/tools/install-koda.sh | bash
koda setup                        # Check dependencies
koda install dev                  # Install dev agents
koda mcp-install                  # Setup MCP servers
koda configure                    # Configure tokens
koda chat --agent orchestrator    # Start chatting
```

## Install with setup.sh

```
git clone <repo> ~/steer-runtime && cd ~/steer-runtime
./setup.sh install dev
./setup.sh mcp-install
```

## Koda Commands

- `koda` — interactive TUI dashboard
- `koda chat [--agent NAME]` — chat with an agent
- `koda install/remove/sync/list/clean` — profile management
- `koda workspace list/show/apply` — team workspaces
- `koda configure` — token setup
- `koda mcp-install` — MCP server setup
- `koda doctor` — deep health check
- `koda setup` — install dependencies
- `koda status` — one-liner status

## Common Issues

**kiro-cli not found**: Install via `koda setup` or `npm install -g @anthropic/kiro-cli`

**MCP servers not working**: Run `koda mcp-install` to verify bundles and generate mcp.json

**Agent not responding**: Check `koda doctor` for missing dependencies. Ensure tokens are configured with `koda configure`.

**Permission errors on tools**: kiro-cli needs `--trust-all-tools` flag (Koda passes this automatically)

**Profile not found**: Run `koda list` to see available profiles. Use `koda sync` to update.

**Windows issues**: Use PowerShell. Install via `irm .../install-koda.ps1 | iex`

## Workspaces

Team workspaces pre-configure profiles, rules, and memory banks:
- `koda workspace list` — see available
- `koda workspace apply payments-core` — apply team config
- `koda workspace create my-team` — scaffold new workspace

## MCP Servers

Jira, Confluence, GitHub (Disney Enterprise), Mermaid diagrams, Bruno API testing. Tokens configured via `koda configure`.

## Reporting Issues

When reporting a bug, include: OS, kiro-cli version (`kiro-cli --version`), koda version (`koda version`), error message, and steps to reproduce.

## Feature Requests

Describe: what you want, why it's useful, which profile/agent it relates to.
