# Steer Runtime v0.2.144-10-g9e6f01bd — Certification Report

🟢 **Trust Score: 95/100** (Certified)

Generated: 2026-06-27T09:17:01

---

## Delegation (40%) — 23/26 passed (88%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| ai-route-ml-task | ✓ | 8 |
| ba-analyze-requirements | ✓ | 59 |
| cloudops-infra-issue | ✓ | 33 |
| inspector-inspect-app | ✓ | 20 |
| design-architecture-review | ✓ | 5 |
| analyze-story | ✓ | 16 |
| ops-check-deployment | ✓ | 5 |
| leadership-quarterly-report | ✓ | 5 |
| implement-feature | ✓ | 31 |
| code-review | ✓ | 49 |
| run-tests | ✓ | 8 |
| create-pr | ✓ | 8 |
| fetch-jira | ✓ | 16 |
| pm-sprint-status | ✓ | 8 |
| write-code | ✓ | 9 |
| pm-run-retro | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| qa-plan-testing | ✓ | 5 |
| steer-release | ✓ | 8 |
| triage-incident | ✓ | 30 |
| steer-review-pr | ✓ | 8 |
| rca-minimal-delegation | ✗ | 0 |
| rca-investigation | ✓ | 8 |
| gsm-report | ✓ | 8 |
| stability-validation | ✓ | 8 |

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