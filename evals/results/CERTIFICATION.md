# Steer Runtime v0.2.174-rc.1 — Certification Report

🟡 **Trust Score: 89/100** (Qualified)

**Target:** kiro

Generated: 2026-07-24T21:31:34

---

## Delegation (40%) — 19/26 passed (73%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✓ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 27 |
| ba-analyze-requirements | ✓ | 15 |
| design-architecture-review | ✓ | 5 |
| ops-check-deployment | ✓ | 8 |
| analyze-story | ✗ | 0 |
| inspector-inspect-app | ✓ | 5 |
| implement-feature | ✗ | 0 |
| leadership-quarterly-report | ✓ | 5 |
| fetch-jira | ✗ | 0 |
| create-pr | ✗ | 0 |
| run-tests | ✓ | 0 |
| pm-sprint-status | ✓ | 8 |
| code-review | ✓ | 15 |
| qa-analyze-defect | ✗ | 0 |
| write-code | ✓ | 0 |
| pm-run-retro | ✓ | 5 |
| steer-review-pr | ✗ | 0 |
| qa-plan-testing | ✓ | 5 |
| rca-investigation | ✓ | 8 |
| triage-incident | ✓ | 30 |
| steer-release | ✗ | 0 |
| stability-validation | ✓ | 5 |
| rca-minimal-delegation | ✓ | 0 |
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