# Steer Runtime v0.2.145-1-g4fb38a6c — Certification Report

🟢 **Trust Score: 95/100** (Certified)

Generated: 2026-06-28T09:21:23

---

## Delegation (40%) — 23/26 passed (88%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 20 |
| inspector-inspect-app | ✓ | 20 |
| ba-analyze-requirements | ✓ | 44 |
| design-architecture-review | ✓ | 8 |
| analyze-story | ✓ | 8 |
| code-review | ✓ | 8 |
| leadership-quarterly-report | ✓ | 8 |
| ops-check-deployment | ✓ | 5 |
| run-tests | ✓ | 0 |
| implement-feature | ✓ | 38 |
| fetch-jira | ✓ | 16 |
| write-code | ✓ | 0 |
| pm-sprint-status | ✓ | 57 |
| create-pr | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| pm-run-retro | ✓ | 28 |
| qa-plan-testing | ✓ | 8 |
| triage-incident | ✓ | 30 |
| steer-release | ✓ | 8 |
| rca-investigation | ✓ | 8 |
| rca-minimal-delegation | ✗ | 0 |
| stability-validation | ✓ | 8 |
| gsm-report | ✓ | 8 |
| qa-analyze-defect | ✓ | 30 |

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