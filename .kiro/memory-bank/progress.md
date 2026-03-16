# Progress

## What Works
- ✅ Multi-profile agent system (dev: 18, ba: 4, qa: 6, ops: 5 = 33 total agents)
- ✅ Unified setup.sh with all commands (install, sync, remove, clean, list, check, mcp-install)
- ✅ New commands: rules, prompts, init-memory, configure
- ✅ MCP servers: jira-mcp, confluence-mcp, github-mcp, mermaid-diagram-mcp
- ✅ Docker-based MCP configs: mcp-atlassian, harness, sonarqube (in ops agents)
- ✅ Common rules: conventional_commit, general-java-development
- ✅ Common prompts: generate-ai-metrics-report, check-ecs-tasks
- ✅ Memory bank templates (guidelines, product, structure, tech)
- ✅ Known project configs: wdpr-payment-svc
- ✅ Token placeholder pattern (YOUR_TOKEN) in ops agent configs
- ✅ Documentation updated: README.md v3.1.0, AGENTS.md with ops profile
- ✅ CLI and UI installation modes
- ✅ All existing functionality preserved (backward compatible)

## In Progress
- 🔄 Testing ops agents with live MCP servers
- 🔄 Evaluating Kiro env var interpolation in JSON configs

## Known Issues
- ⚠️ `.kiro-dev/agents/story_analyzer_agent.json` has hardcoded tokens (pre-existing)

## Decisions Made
- Profile convention: `.kiro-<profile>/` directories with auto-discovery
- Orchestrator-delegates pattern for each profile
- `ops` chosen as profile name for AI metrics, infra, deployments, code quality
- Token placeholder pattern (`YOUR_TOKEN`) adopted from AI initiative
- Memory bank schema: guidelines.md, product.md, structure.md, tech.md (from AI initiative)
- All v3.1.0 changes are additive — no existing files modified except docs
