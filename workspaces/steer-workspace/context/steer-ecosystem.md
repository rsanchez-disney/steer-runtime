# Steer Ecosystem

## Repositories

| Repo | Language | Purpose |
|------|----------|---------|
| **steer-runtime** | Markdown, JSON, Shell | Agent configs, prompts, context, hooks, MCP servers, workspaces |
| **Koda** | Go | CLI/TUI for managing agents, profiles, workspaces, MCP, IDE plugins |
| **steer-autopilot** | Go (planned) | Distributed multi-agent AI-SDLC pipeline orchestration |
| **steer-plugins** | TypeScript, Kotlin | VS Code + IntelliJ IDE plugins for agent chat |
| **Kite** | Astro, React | Desktop GUI over kiro-cli (Electron) |
| **KiteStream** | Node, React | Web-based streaming agent interface |

## How They Connect

```
steer-runtime (source of truth)
  ├── Agent configs → installed by Koda → used by kiro-cli
  ├── MCP servers → bundled by Koda → registered in mcp.json
  ├── Hooks → copied by Koda → executed by kiro-cli on agent events
  └── Workspaces → applied by Koda → configure profiles + context

Koda (installer + manager)
  ├── Reads steer-runtime → installs to ~/.kiro/
  ├── Generates mcp.json → consumed by kiro-cli
  ├── Manages tokens/env vars → injected into agent configs
  └── IDE plugin install → downloads from steer-plugins releases

kiro-cli (agent runtime)
  ├── Loads agents from ~/.kiro/agents/
  ├── Executes prompts, uses tools, delegates
  ├── ACP protocol → consumed by Koda, Kite, KiteStream, steer-plugins
  └── MCP protocol → connects to Jira, Confluence, GitHub, etc.

steer-plugins (IDE extensions)
  ├── Spawns kiro-cli via ACP protocol
  ├── Same chat experience as Koda TUI
  └── Distributed via Koda `ide install`

steer-autopilot (pipeline orchestration)
  ├── Spawns kiro-cli sessions via Agent Broker
  ├── Reads pipeline YAML definitions
  ├── Manages gates, artifacts, state
  └── Dashboard via REST + WebSocket
```

## Cross-Repo Impact Rules

| Change in | Affects | Action needed |
|-----------|---------|---------------|
| steer-runtime agent JSON schema | Koda model, steer-plugins | Update Koda model, rebuild plugins |
| steer-runtime hooks | Koda InstallShared | Ensure .sh + .ps1 parity |
| steer-runtime MCP servers | Koda knownServers, mcp.json | May need Koda registry update |
| Koda ACP client | steer-plugins, Kite, KiteStream | Protocol must stay compatible |
| kiro-cli ACP protocol | All consumers | Version bump, update all clients |
| steer-runtime workspace schema | Koda model | Add fields with `omitempty` |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent configs | JSON + Markdown |
| CLI/TUI | Go (cobra, bubbletea, lipgloss) |
| MCP servers | Node.js (TypeScript, esbuild → CJS bundle) |
| VS Code plugin | TypeScript |
| IntelliJ plugin | Kotlin |
| Dashboard (Kite) | Astro + React |
| Streaming (KiteStream) | Node + React |
| Autopilot | Go (planned) |

## Versioning

- steer-runtime: `v3.x.0` (tarball releases)
- Koda: `v0.4.x` (binary releases)
- steer-plugins: `v0.x.0` (vsix + zip releases)
- All repos version independently but must maintain ACP protocol compatibility
