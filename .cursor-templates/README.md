# Cursor Rule Templates

This directory contains `.mdc` rule templates for Cursor IDE, generated from the same source material used by Kiro agents.

## Installation

```bash
./setup.sh cursor install <project-dir>   # Install rules + commands + MCP config
./setup.sh cursor sync <project-dir>      # Update rules and commands from latest templates
./setup.sh cursor remove <project-dir>    # Remove .cursor/ directory
```

Agent commands live in `common/cursor-commands/` (`/orchestrator`, `/implement-story`, `/code-review`). Use them in Cursor **Agent** mode via `/`.

## Rule Numbering

| Range | Category | Activation |
|-------|----------|------------|
| 00-09 | Foundation (golden rules, mappings, commits) | `alwaysApply: true` |
| 10-19 | Language specialists (Java, Node, Angular, Go, Flutter) | `globs` pattern |
| 20-29 | Quality (testing, security, architecture) | `globs` or `alwaysApply` |
| 30-39 | Role guides (BA, QA, Ops, PM) | Manual activation |
| 40-49 | Guardrails (write protection, destructive command warnings) | `alwaysApply: true` |
| 50-59 | Workflow (SDLC steps, PR templates) | Manual activation |
| 60-69 | Project context (memory banks) | `alwaysApply: true` |

## Source Mapping

| Template | Source Files |
|----------|-------------|
| `00-golden-rules.mdc` | `.kiro/context/golden_rules.md` |
| `01-project-mappings.mdc` | `.kiro/context/project_mappings.md` |
| `02-conventional-commits.mdc` | `common/rules/conventional_commit.md` |
| `10-java-backend.mdc` | `common/rules/general-java-development.md` + `.kiro-dev/prompts/backend.md` |
| `11-node-webapi.mdc` | `common/rules/general-node-development.md` + `.kiro-dev/prompts/webapi.md` |
| `12-angular-ui.mdc` | `common/rules/general-angular-development.md` + `.kiro-dev/prompts/ui.md` |
| `13-go-services.mdc` | `common/rules/general-go-development.md` |
| `14-flutter-mobile.mdc` | `.kiro-dev/prompts/flutter.md` |
| `20-testing-standards.mdc` | `.kiro-dev/prompts/code_review_agent.md` + `.kiro-dev/prompts/test_runner_agent.md` |
| `21-security-guidelines.mdc` | `.kiro-dev/prompts/security_scanner_agent.md` |
| `22-architecture-patterns.mdc` | `.kiro-dev/prompts/architecture_agent.md` |
| `30-ba-guidelines.mdc` | `.kiro/context/ba_guidelines.md` + `.kiro-ba/prompts/*.md` |
| `31-qa-guidelines.mdc` | `.kiro/context/qa_guidelines.md` + `.kiro-qa/prompts/*.md` |
| `32-ops-guidelines.mdc` | `.kiro/context/ops_guidelines.md` + `.kiro-ops/prompts/*.md` |
| `33-pm-guidelines.mdc` | `.kiro/context/pm_guidelines.md` + `.kiro-pm/prompts/*.md` |
| `40-guardrails.mdc` | `.kiro/hooks/guard-writes.sh` + `.kiro/hooks/warn-destructive.sh` |
| `50-sdlc-workflow.mdc` | `.kiro-dev/prompts/orchestrator.md` |
| `51-pr-template.mdc` | `.kiro-dev/prompts/pr_creator_agent.md` |
| `52-story-analysis.mdc` | `.kiro-dev/prompts/story_analyzer_agent.md` |

## Relationship to Kiro

These templates are derived from the same source files used by Kiro agents. Both systems coexist:
- **Kiro CLI** uses `~/.kiro/` — multi-agent orchestration, hooks, tools
- **Cursor** uses `.cursor/` — single-agent with glob-activated rules and MCP

The MCP servers in `~/.kiro/tools/mcp-servers/` are shared between both tools.
