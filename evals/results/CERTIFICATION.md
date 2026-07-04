# Steer Runtime v0.2.148-52-gc9d113a3 — Certification Report

🟢 **Trust Score: 97/100** (Certified)

Generated: 2026-07-03T11:36:36

---

## Delegation (40%) — 24/26 passed (92%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✓ | 20 |
| cloudops-infra-issue | ✓ | 16 |
| ai-route-ml-task | ✓ | 8 |
| ba-analyze-requirements | ✓ | 42 |
| inspector-inspect-app | ✓ | 20 |
| design-architecture-review | ✓ | 5 |
| analyze-story | ✓ | 8 |
| leadership-quarterly-report | ✓ | 5 |
| ops-check-deployment | ✓ | 5 |
| implement-feature | ✓ | 25 |
| run-tests | ✓ | 8 |
| fetch-jira | ✓ | 8 |
| code-review | ✓ | 6 |
| write-code | ✓ | 5 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| steer-review-pr | ✓ | 8 |
| pm-run-retro | ✓ | 8 |
| qa-plan-testing | ✓ | 8 |
| triage-incident | ✓ | 8 |
| steer-release | ✓ | 8 |
| rca-investigation | ✓ | 8 |
| stability-validation | ✓ | 5 |
| gsm-report | ✓ | 8 |
| rca-minimal-delegation | ✗ | 8 |

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