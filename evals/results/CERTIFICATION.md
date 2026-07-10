# Steer Runtime v0.2.156 — Certification Report

🟡 **Trust Score: 75/100** (Qualified)

Generated: 2026-07-10T17:03:24

---

## Delegation (40%) — 10/26 passed (38%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| cloudops-infra-issue | ✗ | 0 |
| ba-delegate-figma-design | ✗ | 0 |
| ba-analyze-requirements | ✗ | 0 |
| ai-route-ml-task | ✗ | 0 |
| ops-check-deployment | ✗ | 0 |
| analyze-story | ✓ | 8 |
| design-architecture-review | ✗ | 0 |
| inspector-inspect-app | ✗ | 0 |
| leadership-quarterly-report | ✗ | 0 |
| run-tests | ✓ | 0 |
| implement-feature | ✓ | 25 |
| code-review | ✓ | 20 |
| fetch-jira | ✓ | 8 |
| write-code | ✓ | 0 |
| pm-sprint-status | ✗ | 0 |
| create-pr | ✓ | 8 |
| pm-run-retro | ✗ | 0 |
| steer-review-pr | ✓ | 8 |
| qa-plan-testing | ✓ | 8 |
| triage-incident | ✗ | 0 |
| steer-release | ✗ | 0 |
| gsm-report | ✗ | 0 |
| rca-minimal-delegation | ✗ | 0 |
| qa-analyze-defect | ✓ | 15 |
| rca-investigation | ✗ | 0 |
| stability-validation | ✗ | 0 |

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