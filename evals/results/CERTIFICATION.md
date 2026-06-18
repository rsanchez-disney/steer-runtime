# Steer Runtime v0.2.124-1-gd0f728b2 — Certification Report

🟢 **Trust Score: 92/100** (Certified)

Generated: 2026-06-18T17:47:06

---

## Delegation (40%) — 19/24 passed (79%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ai-route-ml-task | ✓ | 15 |
| ba-analyze-requirements | ✓ | 27 |
| cloudops-infra-issue | ✓ | 8 |
| design-architecture-review | ✓ | 8 |
| inspector-inspect-app | ✓ | 6 |
| leadership-quarterly-report | ✗ | 0 |
| ops-check-deployment | ✗ | 0 |
| analyze-story | ✓ | 8 |
| implement-feature | ✓ | 30 |
| code-review | ✓ | 51 |
| write-code | ✗ | 0 |
| run-tests | ✗ | 0 |
| fetch-jira | ✓ | 8 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| pm-run-retro | ✓ | 8 |
| qa-plan-testing | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| steer-review-pr | ✓ | 8 |
| steer-release | ✓ | 8 |
| triage-incident | ✓ | 30 |
| rca-investigation | ✓ | 8 |
| stability-validation | ✓ | 169 |
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