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
| 2026-04-14 | steer-runtime | #188 | jira-mcp reads `JIRA_URL` from env | No longer hardcoded to myjira.disney.com | Multi-instance: same binary, different env vars |
| 2026-04-14 | steer-runtime | #190 | Removed mywiki-mcp | mywiki now uses confluence-mcp binary | mcp.json `mywiki` entry points to confluence-mcp with `CONFLUENCE_URL` |
| 2026-04-14 | steer-runtime | #191 | Removed context7-mcp | Blocked at Disney, removed from all agents | Already removed from Koda knownServers in v0.4.25 |
| 2026-04-14 | Koda | #84 | Multi-instance Jira/Confluence tokens | `JIRA_PAT_{name}`, `CONFLUENCE_PAT_{name}` format | Backward compat with single `JIRA_PAT`, `CONFLUENCE_PAT`, `MYWIKI_PAT` |
| 2026-04-14 | Koda | #85 | Default instances + skip empty tokens | Pre-populated URLs for GitHub/Jira/Confluence | Only instances with PATs get MCP entries |
| 2026-04-15 | steer-runtime | #192 | agent-registry.sh emits workspace context | Orchestrators now see active workspace, profiles, team | No breaking change — additive output |
| 2026-04-15 | steer-runtime | #193 | PowerShell hook equivalents | All 9 hooks have .ps1 versions | Koda v0.4.27+ swaps .sh→.ps1 on Windows |

## Patterns Observed
- Workspace schema changes always need matching Koda model updates
- Orchestrator prompt changes should update all 5 orchestrators
- MCP server additions need updates in: setup.sh, Koda knownServers, setup.ps1
- Hook additions need registration in relevant agent JSON files
- Multi-instance MCP: same binary + different env vars, no code duplication needed
- Token format changes need backward compat in Read functions
