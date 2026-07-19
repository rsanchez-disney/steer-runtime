# Steer Runtime v0.2.164 — Certification Report

🟡 **Trust Score: 89/100** (Qualified)

Generated: 2026-07-19T09:17:13

---

## Delegation (40%) — 19/26 passed (73%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ai-route-ml-task | ✗ | 0 |
| ba-delegate-figma-design | ✗ | 0 |
| ba-analyze-requirements | ✓ | 25 |
| cloudops-infra-issue | ✓ | 25 |
| design-architecture-review | ✓ | 5 |
| inspector-inspect-app | ✓ | 20 |
| analyze-story | ✓ | 8 |
| ops-check-deployment | ✓ | 8 |
| leadership-quarterly-report | ✓ | 5 |
| write-code | ✓ | 8 |
| implement-feature | ✓ | 27 |
| code-review | ✓ | 51 |
| run-tests | ✓ | 8 |
| fetch-jira | ✓ | 8 |
| create-pr | ✓ | 8 |
| qa-plan-testing | ✗ | 0 |
| steer-review-pr | ✗ | 0 |
| pm-sprint-status | ✓ | 8 |
| pm-run-retro | ✓ | 8 |
| steer-release | ✗ | 0 |
| triage-incident | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| rca-minimal-delegation | ✗ | 0 |
| stability-validation | ✓ | 8 |
| rca-investigation | ✓ | 8 |
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