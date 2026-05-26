# Steer Ecosystem

## Repositories

| Repo | Language | Purpose |
|------|----------|---------|
| **steer-runtime** | Markdown, JSON, Shell | Agent configs, prompts, context, hooks, MCP servers, workspaces |
| **Koda** | Go | CLI/TUI for managing agents, profiles, workspaces, MCP, IDE plugins, app marketplace |
| **steer-autopilot** | Go (planned) | Distributed multi-agent AI-SDLC pipeline orchestration |
| **steer-plugins** | TypeScript, Kotlin | VS Code + IntelliJ IDE plugins for agent chat |
| **Kite** | Electron, TypeScript, React | Desktop GUI over kiro-cli — chat, agents, scoring, sessions |
| **Mouseketool** | Electron, TypeScript, React | Config Studio desktop app |
| **prompt-score** | Python, FastAPI | Prompt quality scoring API (6 dimensions, token estimation) |

## How They Connect

```
steer-runtime (source of truth)
  ├── Agent configs → installed by Koda → used by kiro-cli
  ├── MCP servers → bundled by Koda → registered in mcp.json
  ├── Hooks → copied by Koda → executed by kiro-cli on agent events
  └── Workspaces → applied by Koda → configure profiles + context

Koda (installer + manager + app marketplace)
  ├── Reads steer-runtime → installs to ~/.kiro/
  ├── Generates mcp.json → consumed by kiro-cli
  ├── Manages tokens/env vars → injected into agent configs
  ├── IDE plugin install → downloads from steer-plugins releases
  ├── App marketplace → koda apps install/start/update (Kite, Mouseketool)
  └── System tray → health, updates, app launcher

kiro-cli (agent runtime)
  ├── Loads agents from ~/.kiro/agents/
  ├── Executes prompts, uses tools, delegates
  ├── ACP protocol → consumed by Koda, Kite, steer-plugins
  └── MCP protocol → connects to Jira, Confluence, GitHub, etc.

Kite (desktop GUI)
  ├── Electron monorepo (packages/main, renderer, shared)
  ├── Spawns kiro-cli via ACP protocol
  ├── Prompt scoring via prompt-score API
  ├── Sessions persisted in SQLite (~/.kiro/settings/sessions.db)
  ├── Deployed via Koda: koda apps start kite
  └── Installed at ~/.koda/bin/kite/Kite.app

steer-plugins (IDE extensions)
  ├── Spawns kiro-cli via ACP protocol
  ├── Same chat experience as Koda TUI
  └── Distributed via Koda `ide install`

prompt-score (scoring API)
  ├── POST /score → evaluates prompt across 6 dimensions
  ├── Returns: total score (0-100), estimated tokens, per-dimension breakdown
  └── Consumed by Kite (Ctrl+Space pre-check, auto-score on send)
```

## Cross-Repo Impact Rules

| Change in | Affects | Action needed |
|-----------|---------|---------------|
| steer-runtime agent JSON schema | Koda model, steer-plugins | Update Koda model, rebuild plugins |
| steer-runtime hooks | Koda InstallShared | Ensure .sh + .ps1 parity |
| steer-runtime MCP servers | Koda knownServers, mcp.json | May need Koda registry update |
| Koda ACP client | steer-plugins, Kite | Protocol must stay compatible |
| kiro-cli ACP protocol | All consumers | Version bump, update all clients |
| steer-runtime workspace schema | Koda model | Add fields with `omitempty` |
| Kite packages/main deps | Root package.json | Must mirror for electron-builder |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent configs | JSON + Markdown |
| CLI/TUI | Go (cobra, bubbletea, lipgloss) |
| MCP servers | Node.js (TypeScript, esbuild → CJS bundle) |
| VS Code plugin | TypeScript |
| IntelliJ plugin | Kotlin |
| Desktop GUI (Kite) | Electron 35 + React 19 + Vite 7 + TypeScript |
| Desktop GUI (Mouseketool) | Electron + React + TypeScript |
| Scoring API | Python + FastAPI |
| Autopilot | Go (planned) |

## Versioning & Releases

| Repo | Public (github.com) | Enterprise (github.disney.com) |
|------|---------------------|-------------------------------|
| steer-runtime | v0.2.x (rsanchez-disney/steer-runtime) | v3.x.x internal |
| Koda | v0.4.x (rsanchez-disney/Koda) | same |
| Kite | v0.1.x (rsanchez-disney/kite) | SANCR225/Kite |
| Mouseketool | v0.1.x (rsanchez-disney/mouseketool) | SANCR225/mouseketool |

Release workflow: `make publish-all` in Koda handles cross-compilation, artifact encryption, and GitHub release creation for all repos.

## Koda App Marketplace

Apps managed by `koda apps`:
- `koda apps list` — show available apps
- `koda apps install <name>` — download + install
- `koda apps start <name>` — launch app
- `koda apps update <name>` — update to latest

Current apps: Kite, Mouseketool. KiteStream retired (replaced by Kite).
