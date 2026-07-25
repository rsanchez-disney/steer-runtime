# Steer Runtime v0.2.174 — Certification Report

🟡 **Trust Score: 89/100** (Qualified)

**Target:** kiro

Generated: 2026-07-24T22:49:14

---

## Delegation (40%) — 19/26 passed (73%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✓ | 0 |
| cloudops-infra-issue | ✓ | 8 |
| ai-route-ml-task | ✓ | 15 |
| ba-analyze-requirements | ✓ | 25 |
| design-architecture-review | ✓ | 5 |
| ops-check-deployment | ✓ | 8 |
| inspector-inspect-app | ✓ | 6 |
| analyze-story | ✗ | 0 |
| implement-feature | ✗ | 0 |
| leadership-quarterly-report | ✓ | 5 |
| fetch-jira | ✗ | 0 |
| run-tests | ✓ | 0 |
| create-pr | ✗ | 0 |
| code-review | ✓ | 25 |
| pm-sprint-status | ✓ | 8 |
| pm-run-retro | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| steer-review-pr | ✗ | 0 |
| qa-plan-testing | ✓ | 5 |
| write-code | ✓ | 0 |
| triage-incident | ✓ | 8 |
| steer-release | ✗ | 0 |
| rca-investigation | ✓ | 5 |
| stability-validation | ✓ | 5 |
| gsm-report | ✓ | 8 |
| rca-minimal-delegation | ✓ | 0 |

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