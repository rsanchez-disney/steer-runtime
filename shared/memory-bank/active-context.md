# Active Context

## Current Focus (March 20, 2026)
- v3.4.0 shipped: Amazon Q support, IDE-agnostic README, Mermaid diagrams, golden rule #11
- All changes merged to main via PRs #17, #18, #20 + cherry-picks
- Documentation fully reviewed by technical_writer_agent perspective

## Recent Completed Work (March 17–20, 2026)

### PR #17 — Reliability + New Tools + Hooks + Tool Standardization
- Created 3 missing QA context files (defect_templates, performance_patterns, api_test_patterns)
- Added welcomeMessage to ba, qa, pm orchestrators
- Added resources to 10 agents that had none
- Added thinking/todo/delegate/knowledge tools to 14 agents
- Created 3 hook scripts (git-context, guard-writes, warn-destructive)
- Standardized tool names across 6 dev agents (read/write/shell → fs_read/fs_write/execute_bash)
- Created `./setup.sh enable-tools` command
- Rewrote AGENTS.md, created PROJECT_OVERVIEW.md

### PR #18 — Cursor IDE Support
- Created `.cursor-templates/` with 19 .mdc rule files
- Added `setup.sh cursor install|sync|remove|init-memory` commands
- Created docs/CURSOR_SETUP.md

### PR #20 — IDE-Agnostic Rewrite + Amazon Q + Mermaid + Golden Rule
- Rewrote README as IDE-agnostic multi-team agent platform
- Converted 5 ASCII diagrams to Mermaid graphs (dark theme)
- Added Amazon Q Developer support (19 .md templates + setup.sh amazonq subcommand)
- Added golden rule #11 (cross-platform tool usage — ban findstr/dir/type)
- Technical writer review: restored prerequisites, fixed MCP claim, expanded AGENTS.md IDE table
- Version bumped to 3.4.0

## Open Items
- PR #19 (Mario Ojeda): TROUBLESHOOTING.md update for welcomeMessage error — needs rebase
- QA agents missing Jira MCP configs (api_tester, test_automation, performance_tester)
- setup.ps1 parity: needs enable-tools, cursor, amazonq subcommands
- Stale branches to clean: fix/phase1-harden-agents, feature/v3.1.0-ops-profile
- mywiki-mcp source divergence from confluence-mcp
