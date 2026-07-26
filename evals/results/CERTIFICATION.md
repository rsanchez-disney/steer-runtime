# Steer Runtime v0.2.174-rc.2 — Certification Report

🟡 **Trust Score: 89/100** (Qualified)

**Target:** kiro

Generated: 2026-07-25T12:14:57

---

## Delegation (40%) — 19/26 passed (73%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✓ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 20 |
| ba-analyze-requirements | ✓ | 42 |
| design-architecture-review | ✓ | 5 |
| ops-check-deployment | ✓ | 8 |
| analyze-story | ✗ | 0 |
| inspector-inspect-app | ✓ | 6 |
| leadership-quarterly-report | ✓ | 8 |
| implement-feature | ✗ | 0 |
| fetch-jira | ✗ | 0 |
| create-pr | ✗ | 0 |
| run-tests | ✓ | 0 |
| pm-sprint-status | ✓ | 8 |
| code-review | ✓ | 25 |
| qa-analyze-defect | ✗ | 0 |
| pm-run-retro | ✓ | 5 |
| qa-plan-testing | ✓ | 5 |
| steer-review-pr | ✗ | 0 |
| write-code | ✓ | 0 |
| triage-incident | ✓ | 25 |
| rca-investigation | ✓ | 8 |
| stability-validation | ✓ | 8 |
| rca-minimal-delegation | ✓ | 0 |
| steer-release | ✗ | 0 |
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