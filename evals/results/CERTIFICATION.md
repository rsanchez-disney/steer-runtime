# Steer Runtime v0.2.157-3-g081a4b1c — Certification Report

🟢 **Trust Score: 91/100** (Certified)

Generated: 2026-07-13T09:19:32

---

## Delegation (40%) — 20/26 passed (77%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| cloudops-infra-issue | ✓ | 8 |
| ba-analyze-requirements | ✓ | 6 |
| ai-route-ml-task | ✓ | 15 |
| design-architecture-review | ✓ | 5 |
| ops-check-deployment | ✓ | 8 |
| inspector-inspect-app | ✓ | 6 |
| analyze-story | ✓ | 8 |
| leadership-quarterly-report | ✓ | 8 |
| code-review | ✓ | 51 |
| write-code | ✓ | 8 |
| fetch-jira | ✓ | 8 |
| implement-feature | ✓ | 25 |
| pm-sprint-status | ✓ | 8 |
| create-pr | ✓ | 8 |
| run-tests | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| pm-run-retro | ✓ | 5 |
| steer-release | ✗ | 0 |
| qa-analyze-defect | ✗ | 0 |
| qa-plan-testing | ✗ | 0 |
| stability-validation | ✓ | 8 |
| rca-investigation | ✓ | 8 |
| triage-incident | ✓ | 42 |
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