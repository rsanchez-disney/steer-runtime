# POS Team Skills Library

Reusable multi-step workflows for the POS team. Skills are one-shot workflows that leverage the team's agent ecosystem.

## Structure

Each skill follows the folder convention:

```
skill-name/
├── SKILL.md           # Required — workflow definition
├── scripts/           # Optional — executable code
├── references/        # Optional — supporting documentation
└── assets/            # Optional — templates and output formats
```

## Available Skills

### Development Workflows

| Skill | Description | Agents Involved |
|-------|-------------|-----------------|
| [implement-android-ticket] | Full SDLC for Android/Kotlin tickets | android_arch → dev/test/quality/pr |
| [implement-backoffice-ticket] | Full SDLC for PHP/Go/React tickets | pos_architecture → specialists |
| [refactor-android-feature] | Feature-flagged refactoring with safety net | android_refactor → dev/test/quality |

### Quality & Review

| Skill | Description | Agents Involved |
|-------|-------------|-----------------|
| [validate-regression-coverage] | Test set vs epic coverage analysis | qa_validation_agent |
| [epic-qa-workflow] | Full QA workflow for Android EPICs | qa_validation_agent |
| [review-code-changes] | Multi-language code review (PHP/Go/React/Kotlin) | pos_code_review, android_quality |
| [run-security-scan] | Security assessment across POS repos | pos_security_scanner_agent |

### Reporting & PM

| Skill | Description | Agents Involved |
|-------|-------------|-----------------|
| [generate-dsp-daily-report] | Daily bug reports for DSP releases | dsp_bug_report_agent |
| [sprint-health-check] | Sprint status + risk identification | pos_story_analyzer_agent |

### Architecture & Planning

| Skill | Description | Agents Involved |
|-------|-------------|-----------------|
| [design-architecture-decision] | ADR for cross-service changes | pos_architecture_agent |
| [plan-implementation] | Task breakdown with effort estimation | pos_planner_agent |

## Usage

### Kiro CLI

```bash
kiro-cli chat --prompt workspaces/pos-team/skills/implement-android-ticket/SKILL.md
kiro-cli chat --prompt workspaces/pos-team/skills/generate-dsp-daily-report/SKILL.md
```

### Direct Invocation

Reference skill `SKILL.md` files directly in chat or via the orchestrator agent.

## Conventions

- Skills follow the same golden rules defined in `context/golden_rules.md`
- All code-producing skills require user approval at gate checkpoints
- Branch naming varies by profile:
  - **Backoffice (PHP/Go/React):** `POS-XXXXX-short-description` (flat, no prefix)
  - **Mobile (Android/iOS):** `{type}/POS-XXXXX/description` (prefixed with type)
- Commit messages follow conventional commit format

<!-- Links -->
[implement-android-ticket]: implement-android-ticket/SKILL.md
[implement-backoffice-ticket]: implement-backoffice-ticket/SKILL.md
[epic-qa-workflow]: epic-qa-workflow/SKILL.md
[refactor-android-feature]: refactor-android-feature/SKILL.md
[validate-regression-coverage]: validate-regression-coverage/SKILL.md
[review-code-changes]: review-code-changes/SKILL.md
[run-security-scan]: run-security-scan/SKILL.md
[generate-dsp-daily-report]: generate-dsp-daily-report/SKILL.md
[sprint-health-check]: sprint-health-check/SKILL.md
[design-architecture-decision]: design-architecture-decision/SKILL.md
[plan-implementation]: plan-implementation/SKILL.md
