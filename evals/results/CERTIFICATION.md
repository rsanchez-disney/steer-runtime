# Steer Runtime v0.2.142-8-gb251410f — Certification Report

🟢 **Trust Score: 95/100** (Certified)

Generated: 2026-06-25T23:55:27

---

## Delegation (40%) — 23/26 passed (88%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 8 |
| ba-analyze-requirements | ✓ | 15 |
| leadership-quarterly-report | ✓ | 30 |
| design-architecture-review | ✓ | 5 |
| analyze-story | ✓ | 8 |
| inspector-inspect-app | ✓ | 9 |
| ops-check-deployment | ✓ | 8 |
| write-code | ✓ | 20 |
| implement-feature | ✓ | 41 |
| fetch-jira | ✓ | 16 |
| code-review | ✓ | 9 |
| pm-sprint-status | ✓ | 86 |
| run-tests | ✓ | 16 |
| pm-run-retro | ✓ | 8 |
| create-pr | ✓ | 16 |
| qa-analyze-defect | ✗ | 0 |
| qa-plan-testing | ✓ | 8 |
| steer-review-pr | ✓ | 8 |
| steer-release | ✓ | 8 |
| triage-incident | ✓ | 30 |
| gsm-report | ✓ | 8 |
| rca-investigation | ✓ | 8 |
| stability-validation | ✓ | 5 |
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