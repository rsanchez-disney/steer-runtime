# Amazon Q Developer Rule Templates

Plain markdown rules for [Amazon Q Developer](https://aws.amazon.com/q/developer/). These are derived from the same source as the Kiro agents and Cursor rules — same standards, different format.

## How it works

Amazon Q loads all `.md` files from `.amazonq/rules/` in your project. No frontmatter, no activation config — every rule is always active.

## Installation

```bash
koda amazonq install ~/my-project       # Install rule templates
koda amazonq sync-all ~/my-project      # Full sync: templates + context + MCP
koda amazonq sync-mcp                   # Sync MCP servers only
koda amazonq status ~/my-project        # Check sync status
```

`sync-all` copies templates, adds installed context files (as `60-ctx-*.md`), and merges your Kiro MCP config into `~/.aws/amazonq/mcp.json` — preserving any servers you added manually.

## Rule numbering

| Range | Category | Examples |
|-------|----------|---------|
| 00-09 | Foundation (always apply) | Golden rules, project mappings, conventional commits |
| 10-19 | Language specialists | Java, Node.js, Angular, Go, Flutter |
| 20-29 | Quality & security | Testing standards, security, architecture |
| 30-39 | Role guides | BA, QA, Ops, PM guidelines |
| 40-49 | Guardrails | Blocked paths, destructive command warnings |
| 50-59 | Workflow | SDLC workflow, PR templates, story analysis |

## Source mapping

| Amazon Q rule | Kiro source |
|---------------|-------------|
| `00-golden-rules.md` | `.kiro/context/golden_rules.md` |
| `01-project-mappings.md` | `.kiro/context/project_mappings.md` |
| `02-conventional-commits.md` | `.kiro-dev/steering/00-foundation.md` |
| `10-java-backend.md` | `.kiro-dev/prompts/backend.md` |
| `11-node-webapi.md` | `.kiro-dev/prompts/webapi.md` |
| `12-angular-ui.md` | `.kiro-dev/prompts/ui.md` |
| `13-go-services.md` | `.kiro-dev/prompts/backend.md` (Go variant) |
| `14-flutter-mobile.md` | `.kiro-dev/prompts/flutter.md` |
| `20-testing-standards.md` | `.kiro-dev/steering/30-quality-and-tests.md` |
| `21-security-guidelines.md` | `.kiro-dev/steering/40-security-and-secrets.md` |
| `22-architecture-patterns.md` | `.kiro-dev/prompts/architecture_agent.md` |
| `30-ba-guidelines.md` | `.kiro-ba/context/ba_guidelines.md` |
| `31-qa-guidelines.md` | `.kiro-qa/context/qa_guidelines.md` |
| `32-ops-guidelines.md` | `.kiro-ops/context/ops_guidelines.md` |
| `33-pm-guidelines.md` | `.kiro/context/pm_guidelines.md` |
| `40-guardrails.md` | `.kiro/hooks/guard-writes.sh` + `warn-destructive.sh` |
| `50-sdlc-workflow.md` | `.kiro-dev/prompts/orchestrator.md` |
| `51-pr-template.md` | `.kiro-dev/prompts/pr_creator_agent.md` |
| `52-story-analysis.md` | `.kiro-dev/prompts/story_analyzer_agent.md` |
