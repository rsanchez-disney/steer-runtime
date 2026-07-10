---
inclusion: always
---

# Workspace identity — steer-platform

## What this workspace is

The development workspace for the steer ecosystem: the AI-assisted developer tooling platform that provides agents, profiles, workspaces, MCP servers, and CLI tools to engineering teams.

## Repositories (10 projects)

| Repo                    | Language      | Purpose                                                        |
|-------------------------|---------------|----------------------------------------------------------------|
| steer-runtime           | MD, JSON, SH  | Agent configs, prompts, context, hooks, MCP servers, workspaces |
| Koda                    | Go            | CLI/TUI for managing agents, profiles, workspaces, MCP, IDE     |
| Kite                    | TypeScript    | Electron desktop app (ACP protocol, chat UI)                    |
| Mouseketool             | TypeScript    | Web-based team chat interface                                   |
| steer-autopilot         | Go            | Autonomous agent runner (headless pipelines)                    |
| steer-plugins           | TypeScript    | VS Code extension for ACP integration                           |
| prompt-scorer           | Go            | Prompt quality scoring and token usage tracking                  |
| delivery-command-center | TypeScript    | Release and delivery dashboard                                   |
| KodaSDK                 | TypeScript    | SDK for building tools on top of Koda                           |
| yax                     | Go            | Persistent memory (observations, graph, search)                  |

## Primary tasks in this workspace

- Develop and maintain steer-runtime (agents, profiles, workspaces, MCP servers)
- Develop and maintain Koda CLI/TUI (Go)
- Release management (publish-all pipeline)
- Review and merge contributor PRs to steer-runtime
- Create and onboard new team workspaces
- Build and integrate MCP servers

## Working directories

- steer-runtime: `~/Workspace/Disney/SANCR225/steer-runtime`
- Koda: `~/Workspace/Disney/SANCR225/Koda`
- Other repos: `~/Workspace/Disney/SANCR225/<repo-name>`

## Conventions

- Private repos on `github.disney.com/SANCR225/`
- Public mirrors on `github.com/rsanchez-disney/` (Koda, steer-runtime)
- Default branch: `main` for all repos
- Version scheme: `v0.2.x` for steer-runtime (public), `v0.4.x` for Koda
