# POS Team Workspace

Disney POS platform — ActivateX (DSP Go & Check-Sync) Android app and DSP Back Office (Connect) services.

## Architecture

```
pos_team_orchestrator_agent (orchestrator profile)
├── android_arch_agent (dev-mobile) ─── orchestrates mobile SDLC
│   ├── requirements_analyst_agent (base)
│   ├── sprint_manager_agent (base)
│   ├── android_dev_agent
│   ├── android_test_agent
│   ├── android_quality_agent
│   ├── android_pr_agent
│   └── dsp_bug_report_agent
├── pos_backoffice_orchestrator (dev-backoffice) ─── orchestrates backoffice SDLC
│   ├── pos_architecture_agent       ← specialist (no delegation)
│   ├── pos_story_analyzer_agent
│   ├── pos_codebase_explorer_agent
│   ├── pos_planner_agent
│   ├── pos_php_agent
│   ├── pos_go_agent
│   ├── pos_react_agent
│   ├── pos_test_runner_agent
│   ├── pos_code_review_agent
│   ├── pos_security_scanner_agent
│   └── pos_work_documenter_agent
├── qa_validation_agent (qa)
└── dsp_bug_report_agent (pm)
```

Additionally, `android_refactor_agent` (dev-mobile) is an independent orchestrator for refactoring tasks, delegating to: android_dev_agent, android_test_agent, android_quality_agent, android_pr_agent.

## Profiles (7)

| Profile | Agents | Purpose |
|---------|--------|---------|
| `orchestrator` | 1 | Top-level routing — delegates to domain agents |
| `dev-mobile` | 6 | Android/Kotlin mobile development (ActivateX) |
| `dev-backoffice` | 12 | PHP, Go, React backend + frontend (Connect) |
| `qa` | 1 | Regression test validation against epics |
| `pm` | 1 | DSP release bug reporting |
| `dev-core` | — | (reserved) |
| `ba` | — | (reserved) |

## Agent Inventory (21 workspace agents + 2 base agents)

| Agent | Profile | Role | Type |
|-------|---------|------|------|
| `pos_team_orchestrator_agent` | orchestrator | Top-level router to domain agents | Orchestrator |
| `android_arch_agent` | dev-mobile | Android Architect — orchestrates mobile SDLC | Orchestrator |
| `android_dev_agent` | dev-mobile | Kotlin implementation and Jira management | Specialist |
| `android_test_agent` | dev-mobile | MockK-based unit test generation | Specialist |
| `android_quality_agent` | dev-mobile | Mandatory code/test quality review gate | Specialist |
| `android_pr_agent` | dev-mobile | GitLab MR description generation | Specialist |
| `android_refactor_agent` | dev-mobile | Feature-flagged refactoring orchestrator | Orchestrator |
| `pos_backoffice_orchestrator` | dev-backoffice | Backoffice SDLC orchestrator (7 stages + 2 gates) | Orchestrator |
| `pos_architecture_agent` | dev-backoffice | Architecture specialist — design decisions, ADRs, impact analysis | Specialist |
| `pos_php_agent` | dev-backoffice | PHP specialist (CodeIgniter + Laravel/Lumen) | Specialist |
| `pos_go_agent` | dev-backoffice | Go specialist (gRPC microservices) | Specialist |
| `pos_react_agent` | dev-backoffice | React/TypeScript specialist (connect-frontend) | Specialist |
| `pos_planner_agent` | dev-backoffice | Task breakdown and dependency planning | Specialist |
| `pos_test_runner_agent` | dev-backoffice | PHPUnit, go test, Jest execution | Specialist |
| `pos_work_documenter_agent` | dev-backoffice | Commit messages and PR descriptions | Specialist |
| `pos_story_analyzer_agent` | dev-backoffice | Jira ticket fetching and analysis | Specialist |
| `pos_codebase_explorer_agent` | dev-backoffice | Codebase file and pattern discovery | Specialist |
| `pos_code_review_agent` | dev-backoffice | Code quality and golden rules compliance | Specialist |
| `pos_security_scanner_agent` | dev-backoffice | OWASP, secrets, dependency vulnerabilities | Specialist |
| `qa_validation_agent` | qa | Test set vs epic coverage validation | Specialist |
| `dsp_bug_report_agent` | pm | Daily DSP release bug reports | Specialist |

**Base agents** (referenced by android_arch_agent): `requirements_analyst_agent`, `sprint_manager_agent`

## Quick Start

```bash
# Top-level orchestrator (routes to all domains)
kiro-cli chat --agent pos_team_orchestrator_agent

# Android development directly
kiro-cli chat --agent android_arch_agent

# Backoffice development directly
kiro-cli chat --agent pos_backoffice_orchestrator

# Refactoring tasks
kiro-cli chat --agent android_refactor_agent
```

## Repositories (10)

| Name | Host | Tech |
|------|------|------|
| activatex | github.disney.com | Kotlin/Android |
| connect | gitlab.disney.com | PHP (CodeIgniter 2/3) |
| connect-frontend | gitlab.disney.com | React/TypeScript |
| audit | gitlab.disney.com | PHP (Laravel) |
| reduction | gitlab.disney.com | PHP (Lumen) |
| product_catalog | gitlab.disney.com | Go |
| connect_reports | gitlab.disney.com | Go |
| connect-fast-api-accounts | gitlab.disney.com | Go |
| connect-fast-api-venue | gitlab.disney.com | Go |
| connect-fast-api | gitlab.disney.com | Go |

## Tech Stack

- **Mobile**: Kotlin, Java, Gradle, Hilt/Dagger, RxJava, Coroutines, Room, gRPC
- **Backend (Legacy)**: PHP 8.1, CodeIgniter 2/3, Illuminate Migrations
- **Microservices**: Go, gRPC, REST, protobuf
- **Frontend**: React 17, TypeScript, Redux/RTK, MUI 5
- **Testing**: MockK, JUnit, Espresso, PHPUnit 9, Mockery, Jest
- **CI/CD**: Detekt, Spotless, JaCoCo, SonarQube, Docker, Kubernetes, GitLab CI
- **Feature Flags**: Unleash

## Context Files

| File | Purpose |
|------|---------|
| `context/team_context.md` | Architecture guide, module structure, conventions |
| `context/testing_conventions.md` | MockK rules, flaky test prevention, shard verification |
| `context/golden_rules.md` | 10 golden rules (Android) |
| `context/backoffice_golden_rules.md` | 10 golden rules (backoffice — backward compat, null guards, DI) |
| `context/security_golden_rules.md` | 10 OWASP-based security rules |
| `context/backoffice_sdlc_workflow.md` | 7-stage SDLC pipeline definition |
| `context/project_mappings.md` | POS repos, tech stacks, directory patterns |
| `context/pr_template.md` | MR description template |
| `context/hilt_guidelines.md` | Hilt DI conventions for Android |
| `context/memory-bank/` | Learnings from past tickets |
| `context/features/` | Feature knowledge bases (gift card, bundling, receipts, etc.) |
