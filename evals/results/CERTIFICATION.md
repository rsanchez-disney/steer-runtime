# Steer Runtime v0.2.136-17-g3a8628b4 — Certification Report

🟢 **Trust Score: 95/100** (Certified)

Generated: 2026-06-24T01:12:58

---

## Delegation (40%) — 23/26 passed (88%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ai-route-ml-task | ✓ | 15 |
| ba-analyze-requirements | ✓ | 95 |
| ba-delegate-figma-design | ✗ | 0 |
| cloudops-infra-issue | ✓ | 20 |
| design-architecture-review | ✓ | 5 |
| inspector-inspect-app | ✓ | 20 |
| leadership-quarterly-report | ✓ | 8 |
| ops-check-deployment | ✗ | 0 |
| analyze-story | ✓ | 8 |
| implement-feature | ✓ | 30 |
| code-review | ✓ | 51 |
| write-code | ✓ | 0 |
| run-tests | ✓ | 0 |
| fetch-jira | ✓ | 8 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| pm-run-retro | ✓ | 8 |
| qa-plan-testing | ✓ | 8 |
| qa-analyze-defect | ✓ | 27 |
| steer-review-pr | ✓ | 8 |
| steer-release | ✓ | 8 |
| triage-incident | ✓ | 8 |
| rca-investigation | ✓ | 5 |
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