# Progress

## What Works
- ✅ 41 agents across 5 profiles (dev: 20, ba: 4, qa: 6, ops: 5, pm: 6)
- ✅ 4 IDE targets: Kiro CLI, Cursor (19 .mdc rules), Amazon Q (19 .md rules), Kite
- ✅ Unified setup.sh with 14 commands + 7 IDE subcommands
- ✅ Windows support via setup.ps1
- ✅ MCP servers: jira, confluence, mywiki, github, mermaid (pre-built bundles)
- ✅ Docker MCP: harness, sonarqube (ops profile)
- ✅ Agent hooks: git-context, guard-writes, warn-destructive (3 scripts)
- ✅ Advanced tools: thinking (7 agents), todo (6), delegate (5), knowledge (4)
- ✅ Consistent tool names across all 40 agents (fs_read/fs_write/execute_bash)
- ✅ Welcome messages on all 5 orchestrators
- ✅ Resources on all agents that need them (was 10 with zero)
- ✅ 12 shared context files, 10 steering rules, 16 skills
- ✅ 9 pre-built project memory banks
- ✅ Common rules, prompts, memory-bank templates
- ✅ Golden rule #11: cross-platform tool usage (no findstr/dir/type)
- ✅ Documentation: README, AGENTS.md, PROJECT_OVERVIEW, CURSOR_SETUP, GETTING_STARTED, TROUBLESHOOTING + role-specific guides
- ✅ All diagrams in Mermaid format (5 diagrams across README + PROJECT_OVERVIEW)
- ✅ `kiro-cli agent validate` integrated into `./setup.sh check`

## Known Issues
- ⚠️ QA agents (api_tester, test_automation, performance_tester) missing Jira MCP configs
- ✅ mywiki-mcp removed — mywiki now uses confluence-mcp binary with CONFLUENCE_URL env var
- ⚠️ setup.ps1 may need updates for: enable-tools, cursor, amazonq subcommands, hooks copying
- ⚠️ `chat.enableDelegate` not yet available in kiro-cli 1.26.2 (gracefully skipped)

## Decisions Made
- IDE-agnostic framing: steer-runtime is a platform, not a Kiro feature
- Compile-to-IDE-target model: author once, deploy to Kiro/Cursor/Amazon Q
- Amazon Q format: plain .md (no frontmatter) — simplest possible adapter
- Cursor format: .mdc with YAML frontmatter (alwaysApply, globs, manual activation)
- Hook exit codes: 0=allow, 2=block (preToolUse), other=warning
- Advanced tools are opt-in — agents degrade gracefully when settings are off
- Golden rules govern code output; steering rules govern agent behavior
- Version 3.4.0 with conventional commits and squash-merge for PRs
