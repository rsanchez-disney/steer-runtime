# Steer Runtime v0.2.143-2-g5bd0f90e — Certification Report

🟢 **Trust Score: 97/100** (Certified)

Generated: 2026-06-26T09:17:39

---

## Delegation (40%) — 24/26 passed (92%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 20 |
| ba-analyze-requirements | ✓ | 27 |
| design-architecture-review | ✓ | 5 |
| analyze-story | ✓ | 8 |
| inspector-inspect-app | ✓ | 8 |
| leadership-quarterly-report | ✓ | 27 |
| ops-check-deployment | ✓ | 5 |
| code-review | ✓ | 51 |
| implement-feature | ✓ | 38 |
| fetch-jira | ✓ | 16 |
| write-code | ✓ | 5 |
| run-tests | ✓ | 8 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| pm-run-retro | ✓ | 8 |
| qa-analyze-defect | ✓ | 20 |
| qa-plan-testing | ✓ | 8 |
| steer-review-pr | ✓ | 8 |
| steer-release | ✓ | 8 |
| rca-investigation | ✓ | 8 |
| rca-minimal-delegation | ✗ | 0 |
| triage-incident | ✓ | 49 |
| stability-validation | ✓ | 108 |
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