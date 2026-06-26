# Dev Backoffice Profile

DSP Back Office (Connect) specialists — PHP monolith, Go/PHP microservices, React SPA.

## Agents (12)

| Agent | Role |
|-------|------|
| `pos_backoffice_orchestrator` | SDLC orchestrator — 7-stage pipeline, delegates to all other agents |
| `pos_php_agent` | PHP specialist (CodeIgniter monolith + Laravel/Lumen microservices) |
| `pos_go_agent` | Go specialist (gRPC microservices) |
| `pos_react_agent` | React/TypeScript specialist (connect-frontend SPA) |
| `pos_planner_agent` | Task breakdown, dependencies, test strategy |
| `pos_architecture_agent` | Architecture guidance, design decisions, gRPC patterns |
| `pos_test_runner_agent` | PHPUnit in k8s pods, go test, Jest |
| `pos_work_documenter_agent` | Work summary, commit message, PR description |
| `pos_story_analyzer_agent` | Jira ticket analysis (POS-* from myjira) |
| `pos_codebase_explorer_agent` | Find relevant files, patterns, impact surface |
| `pos_code_review_agent` | Code quality + golden rules compliance |
| `pos_security_scanner_agent` | Security scan + OWASP compliance |

## Workflow

```
Analyze → Explore → Plan → 🚦 Gate 1 → Implement → Test → Review → 🚦 Gate 2 → Document
```

The orchestrator is the single entry point. It delegates each stage to the appropriate agent and pauses at gates for user approval.

## Quick Start

```bash
koda workspace apply pos-team
kiro-cli chat --agent pos_backoffice_orchestrator
```

Then: `"implement POS-19542"`

## Context Files

| File | Purpose |
|------|---------|
| `context/backoffice_golden_rules.md` | 10 golden rules (backward compat, null guards, DI, etc.) |
| `context/security_golden_rules.md` | 10 OWASP-based security rules |
| `context/backoffice_sdlc_workflow.md` | 7-stage SDLC pipeline definition |
| `context/project_mappings.md` | POS repos, tech stacks, directory patterns |

## Tech Stack

- **PHP**: CodeIgniter 2/3, PHP 8.1, Illuminate Migrations, PHPUnit 9 + Mockery
- **Go**: gRPC, REST, protobuf
- **React**: React 17, TypeScript, Redux/RTK, MUI 5, Jest
- **Infrastructure**: Docker, Kubernetes, GitLab CI, Unleash feature flags
