# Breaking Change Log

Historical record of breaking or near-breaking changes across steer-runtime and Koda.

## Format

| Date | Repo | PR | Change | Impact | Resolution |
|---|---|---|---|---|---|

## Log

| Date | Repo | PR | Change | Impact | Resolution |
|---|---|---|---|---|---|
| 2026-04-08 | steer-runtime | #151 | Added `services`/`channels` to workspace concept | New workspace.json fields | Koda PR #63 added matching model fields with `omitempty` |
| 2026-04-09 | steer-runtime | #157 | Replaced manual Agent Discovery with agent-registry hook | Orchestrator prompt section renamed | All 5 orchestrators updated in same PR |
| 2026-04-09 | steer-runtime | #159 | Added WSL path detection to setup.sh | MCP paths changed format on WSL | Follow-up #161 deduplicated and added missing paths |
| 2026-04-09 | steer-runtime | #160 | Added review mode / autopilot mode to orchestrator | New prompt section, behavioral change | Docs updated across README, AGENTS.md, PROMPT_GUIDE, DEV_QUICK_START |
| 2026-04-10 | Koda | #65 | Refactored MCPInstall into interactive flow | New `MCPServer` registry, `GenerateMCPConfig` function | Old `MCPInstall` preserved as deprecated wrapper |

## Patterns Observed
- Workspace schema changes always need matching Koda model updates
- Orchestrator prompt changes should update all 5 orchestrators
- MCP server additions need updates in: setup.sh, Koda knownServers, setup.ps1
- Hook additions need registration in relevant agent JSON files
