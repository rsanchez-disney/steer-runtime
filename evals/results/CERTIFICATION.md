# Steer Runtime v0.2.123-2-g697807aa — Certification Report

🟢 **Trust Score: 95/100** (Certified)

Generated: 2026-06-17T11:49:38

---

## Delegation (40%) — 21/24 passed (88%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ai-route-ml-task | ✓ | 5 |
| ba-analyze-requirements | ✓ | 29 |
| cloudops-infra-issue | ✓ | 49 |
| design-architecture-review | ✓ | 8 |
| inspector-inspect-app | ✓ | 6 |
| leadership-quarterly-report | ✓ | 8 |
| ops-check-deployment | ✗ | 0 |
| analyze-story | ✓ | 20 |
| implement-feature | ✓ | 25 |
| code-review | ✓ | 29 |
| write-code | ✗ | 0 |
| run-tests | ✗ | 0 |
| fetch-jira | ✓ | 8 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| pm-run-retro | ✓ | 5 |
| qa-plan-testing | ✓ | 8 |
| qa-analyze-defect | ✓ | 27 |
| steer-review-pr | ✓ | 8 |
| steer-release | ✓ | 8 |
| triage-incident | ✓ | 64 |
| rca-investigation | ✓ | 8 |
| stability-validation | ✓ | 30 |
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