# Dev Core Profile

Orchestrator, planning, quality, security, workflow, and documentation agents. Required base for all dev work.

## Agents (13)

| Agent | Purpose |
|-------|---------|
| orchestrator | SDLC orchestrator with multi-agent delegation |
| planner_agent | Task planning and breakdown |
| story_analyzer_agent | Jira story analysis and requirements extraction |
| architecture_agent | Architecture review and design validation |
| codebase_explorer_agent | Code exploration and navigation |
| code_review_agent | Code review and quality checks |
| security_scanner_agent | Security analysis and vulnerability detection |
| compliance_agent | Compliance validation (golden rules, standards) |
| test_runner_agent | Test execution and coverage analysis |
| performance_agent | Performance optimization and analysis |
| pr_creator_agent | Pull request creation and management |
| discussion_agent | Technical discussions and decision support |
| technical_writer_agent | Technical documentation |

## Structure

```
.kiro-dev-core/
├── agents/       # 13 agent JSON configs
├── prompts/      # 13 agent prompt files
├── context/      # Shared context (golden_rules, project_mappings)
├── steering/     # Foundation, product, quality, security, powers
├── skills/       # (none — skills live in dev-web and dev-mobile)
├── powers/       # Kiro Powers (git-ops, code-analysis, file-ops, test-runner)
└── tools/        # Utility scripts (test-powers, sync-kiro-pack)
```

## Install

```bash
./setup.sh install dev-core               # Core only
./setup.sh install dev-core dev-web       # Fullstack web
./setup.sh install dev-core dev-mobile    # Mobile
./setup.sh install dev                    # All (alias → core + web + mobile)
```
