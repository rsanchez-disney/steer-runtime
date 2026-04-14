# Changelog

All notable changes to steer-runtime.

## [Unreleased]

### Added
- **steer-master profile** — specialized code reviewer for steer-runtime & Koda consistency: 5 agents (orchestrator + 4 reviewers), 6 golden rules, 2 validation hooks, memory bank (#163)
- **Enterprise Memory Bank** — service/channel bank templates, shared context (enterprise architecture, domain glossary, API standards), Config Studio example (#151)
- **Orchestrator execution modes** — review mode (pause after each specialist, show diff) and autopilot mode (run straight through) (#160)
- **Agent registry hook** — automatic agent discovery via `agent-registry.sh` on session start, replaces manual LLM-driven discovery, wired into all 5 orchestrators (#157)
- **Kiro IDE setup** — `setup-kiro-ide.ps1` for Windows + `kiro-ide` subcommand in `setup.sh` for all platforms: steering, skills, hooks, MCP with absolute paths (#153)
- **Developer Quick Start Guide** — practical copy-paste prompts for orchestrator, including project initialization as Step 0 (#154, #150)
- **memory-mcp** — persistent semantic memory for agents via containerized vector store (#149)
- **WSL path detection** — `to_win_path()` converts Linux paths to Windows UNC format for MCP servers running in WSL (#159, #161)
- **Figma MCP server** — compiled and bundled figma-mcp for UI/UX agents (#152)
- **Compass MCP server** — SSE-based remote MCP for global search (#140)
- **Multi-instance GitHub MCP** — support multiple GitHub remotes with per-remote config (#135)
- **Astro agent + Vista web components** — SSR specialist with React islands, Nanostores state (#138)
- **dev-python profile** — Python specialist for FastAPI, Flask, Django (#134)
- **dev-infra profile** — Terraform/IaC specialist (#134)
- **Amazon Q sync agent** — sync rules + context + MCP to Amazon Q plugin (#145)
- **Generate steering from agents** — skill to convert kiro-cli agent definitions into Kiro IDE steering files (#147)
- **Enterprise Memory Bank assessment + diagrams** — proposal documentation (#146)

### Fixed
- WSL path deduplication — extracted `to_win_path()` to single definition, added missing mywiki/figma paths (#161)
- Windows setup guide — WSL prerequisites formatting, added `wsl --install` shortcut (#155, #158)
- `setup.sh` — removed `local` keyword outside function scope (#148)
- MCP build scripts — added esbuild to devDependencies, aligned build scripts (#143, #144)
- MCP bundle script — ship self-contained `dist/index.cjs` (#141)
- `setup.sh` workspace commands — support nested folders (#137)
- Stale doc counts — fixed agent/profile counts, added figma-mcp to reference (#139)
- VERSION removed from git tracking (#133)

### Changed
- Orchestrator prompt — replaced manual "Agent Discovery" section with injected "Agent Registry" from hook (#157)
- MCP_SETUP.md — comprehensive rewrite with all servers documented (#142)
- Workspace model — supports nested child workspaces inside parent folders (#136)
- Workspace apply — auto-clone repos, init memory banks, resolve paths (#132)

---

## [0.1.0] — 2026-03-28

Initial release with dev-core, dev-web, dev-mobile, ba, qa, ops, pm profiles.
