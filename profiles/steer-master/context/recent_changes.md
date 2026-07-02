# Recent changes

Rolling awareness of what shipped recently in the steer ecosystem. Updated each release cycle.

Last updated: 2026-07-01

## steer-runtime

### v0.2.139 (Jul 1)

- Autopilot mode — `--autopilot` flag injects steering for autonomous SDLC loop
- Subagent failure handling rules added to orchestrator prompts
- Experimental features section: autopilot, ci-mode, cursor-integration, graphify, per-project-memory, planning-mode
- `@jira-cloud/*` and `@confluence-cloud/*` added to all 52+ agents for multi-instance MCP support
- POS team: PM profile, `includeMcpJson` fix, DSP bug report agent
- XRay Cloud tools: `xray_cloud_update_test_type`, `xray_cloud_add_precondition`
- Jira MCP: warns when Cloud URL detected without `JIRA_EMAIL`
- Cursor integration guides and quick-start docs

### v0.2.148 (Jun 30)

- Certification pipeline: `make certify` runs delegation tests + evals + generates report
- Orchestrator delegation test harness: 24 scenarios across 12 orchestrators
- Unified eval runner: 187 agents + skills via `make eval-all`
- `validate-agents` guardrail for delegation regression prevention
- STEER_HOME env var for kiro-cli isolation
- Skill materializer: directory skills auto-flattened for kiro-cli
- Workspace naming cleanup: sustainment-uad → sustainment/, app-team → adaptive-payments-team

## Koda

### v0.4.215 (Jul 1)

- Full Cursor integration: `koda cursor --ws`, project registry, bulk sync, auto-detect
- MCP tool hints injected into generated Cursor agent prompts
- `koda ps` shows Cursor agent processes, `koda ps --kill cursor`
- `koda setup runtime` — configure kiro/cursor/both
- `koda doctor` includes Cursor MCP health section
- Interactive project picker for `workspace apply`
- `P` shortcut in dashboard for project picker
- Windows: `@` key fix in TUI, ANSI/spinner fix for PowerShell
- Companion tool detection in workspace directories
- `koda version` enriched with component info and companion tools
- `ATLASSIAN_PAT` renamed to `ATLASSIAN_API_TOKEN` (Cloud uses API tokens)
- Cloud Jira/Confluence email validation at `mcp-install` time
- Stale GitHub release handling in `make publish-all`

## Key patterns to be aware of

- Agent tools restricted to routing-only for orchestrators (subagent, thinking, todo_list, @yax/*)
- Exception: sustainment_orchestrator retains `read` for service catalog lookups
- Exception: steer_orchestrator_agent retains `read` for codebase lookups across 9 repos
- Dev specialist agents (backend, webapi, ui, etc.) include code + grep tools
- All new model fields in Koda must use `omitempty`
- Breaking changes documented in `shared/memory-bank/steer-master/breaking-change-log.md`
