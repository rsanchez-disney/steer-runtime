# Steer Runtime v0.2.158 — Certification Report

🟡 **Trust Score: 89/100** (Qualified)

Generated: 2026-07-14T09:19:28

---

## Delegation (40%) — 19/26 passed (73%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| ba-analyze-requirements | ✓ | 17 |
| cloudops-infra-issue | ✓ | 6 |
| ai-route-ml-task | ✓ | 15 |
| leadership-quarterly-report | ✗ | 0 |
| analyze-story | ✓ | 8 |
| design-architecture-review | ✗ | 0 |
| ops-check-deployment | ✓ | 8 |
| inspector-inspect-app | ✓ | 20 |
| implement-feature | ✓ | 8 |
| write-code | ✓ | 8 |
| fetch-jira | ✓ | 8 |
| run-tests | ✓ | 8 |
| code-review | ✓ | 5 |
| qa-plan-testing | ✗ | 0 |
| pm-sprint-status | ✓ | 8 |
| create-pr | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| pm-run-retro | ✓ | 5 |
| qa-analyze-defect | ✗ | 0 |
| steer-release | ✓ | 8 |
| triage-incident | ✓ | 8 |
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