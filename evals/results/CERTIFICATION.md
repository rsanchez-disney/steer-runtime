# Steer Runtime v0.2.172-16-g637c0b8c — Certification Report

🟢 **Trust Score: 91/100** (Certified)

**Target:** kiro

Generated: 2026-07-26T09:18:06

---

## Delegation (40%) — 20/26 passed (77%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✓ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 49 |
| ba-analyze-requirements | ✓ | 27 |
| design-architecture-review | ✓ | 5 |
| analyze-story | ✗ | 0 |
| inspector-inspect-app | ✓ | 6 |
| leadership-quarterly-report | ✓ | 5 |
| ops-check-deployment | ✓ | 5 |
| implement-feature | ✗ | 0 |
| write-code | ✓ | 0 |
| run-tests | ✓ | 0 |
| fetch-jira | ✗ | 0 |
| create-pr | ✗ | 0 |
| pm-sprint-status | ✓ | 8 |
| code-review | ✓ | 30 |
| pm-run-retro | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| qa-plan-testing | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| triage-incident | ✓ | 30 |
| rca-investigation | ✓ | 8 |
| steer-release | ✓ | 8 |
| stability-validation | ✓ | 8 |
| rca-minimal-delegation | ✓ | 0 |
| gsm-report | ✓ | 8 |

## Structural (30%) — 4/4 passed (100%)

| Target | Fixture | Status | Failed Checks |
|--------|---------|--------|---------------|
| orchestrator | implement-story | ✓ |  |
| orchestrator | multi-file-change | ✓ |  |
| test_planner_agent | api-endpoint | ✓ |  |
| code_review_agent | java-pr | ✓ |  |

## Quality (30%) — avg 100/100

*Note: Full LLM judge scoring not yet integrated. Using structural pass rate as proxy.*

---

## Tier Definitions

| Score | Badge | Meaning |
|-------|-------|---------|
| 90-100 | 🟢 | **Certified** — Production-ready |
| 70-89 | 🟡 | **Qualified** — Minor gaps |
| 50-69 | 🟠 | **Conditional** — Known issues |
| <50 | 🔴 | **Uncertified** — Do not release |