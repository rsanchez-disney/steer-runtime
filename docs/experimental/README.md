# Experimental Features

Features in this section are functional but still evolving. They may change behavior between releases.

| Feature                                      | Status          | Since   | Description                                                  |
|----------------------------------------------|:---------------:|---------|--------------------------------------------------------------|
| [Autopilot](autopilot.md)                    | 🧪 Experimental | v0.2.140 | Autonomous SDLC loop — ticket to PR without human gates     |
| [Propose-Judge](propose-judge.md)            | 🧪 Experimental | v0.2.150 | Dual-strategy SDLC — explore alternatives + score quality   |
| [CI Mode](ci-mode.md)                        | 🧪 Experimental | v0.4.207 | Headless agent execution for pipelines                       |
| [Planning Mode](planning-mode.md)            | 🧪 Experimental | v0.4.207 | Read-only exploration and plan generation                    |
| [Graphify](graphify.md)                      | 🧪 Experimental | v0.4.200 | Code knowledge graph for agent codebase understanding        |
| [Per-Project Memory](per-project-memory.md)  | 🧪 Experimental | v0.4.205 | SQLite-backed persistent memory isolated per project         |
| [Cursor Integration](cursor-integration.md)  | 🧪 Experimental | v0.4.207 | Multi-runtime support — run agents in Cursor IDE             |

## Graduation criteria

A feature moves from experimental to stable when:

- Used by 3+ teams in production workflows
- No breaking changes for 2+ releases
- Documentation is complete with examples
- Edge cases are handled gracefully
