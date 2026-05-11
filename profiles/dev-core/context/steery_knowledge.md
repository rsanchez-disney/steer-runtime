# Steery Knowledge Base

Condensed reference for the steer-runtime support assistant.

## Platform Overview

steer-runtime is an AI agent platform for software teams. 124 agents across 21 profiles.

Tools: **Koda** (terminal companion + TUI) · **Kiro** (CLI engine) · **KiteStream** (web UI)

## Profiles

| Profile | Agents | Orchestrator | Focus |
|---------|--------|-------------|-------|
| dev-core | 21 | orchestrator | SDLC orchestration, planning, code review, security, testing, PRs |
| dev-web | 5 | — | Java backend, Node.js API, Angular UI, UX/accessibility, Astro |
| dev-mobile | 3 | — | Flutter, Android native, iOS native |
| dev-ai | 5 | ai_orchestrator | ML training, data science, LLM apps, MLOps |
| dev-python | 1 | — | Python (FastAPI, Flask, Django) |
| dev-infra | 1 | — | Terraform / IaC |
| dev-dotnet | 3 | — | .NET / C# development |
| dev-php | 1 | — | PHP / Zend |
| dev-ui | 3 | — | Legacy Angular, Polymer, Lambda |
| dev (alias) | 42 | orchestrator | All dev-* profiles combined |
| ba | 8 | ba_orchestrator_agent | Requirements, scope, user stories, PRDs, estimation |
| qa | 16 | qa_orchestrator_agent | Test planning, automation, defect analysis, API & perf testing |
| ops | 9 | ops_orchestrator_agent | AI metrics, infra, deployments, log analysis, email |
| pm | 6 | pm_orchestrator_agent | Sprints, standups, retros, risk tracking, delivery reports |
| leadership | 5 | leadership_orchestrator_agent | Cross-team analytics, quarterly reports, executive briefings |
| sustainment | 5 | sustainment_orchestrator_agent | Incident response, AppDynamics, ServiceNow, Splunk |
| core | 3 | — | Email, log analysis, story analysis |
| inspector | 10 | — | Multi-dimensional audit and compliance |
| design | 6 | — | Design discovery and UX research |
| cloudops | 4 | — | Infrastructure strategy and SRE |
| presales | 1 | — | Pre-sales and client intake |
| steer-master | 8 | steer_orchestrator_agent | steer-runtime/Koda development and review |

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
