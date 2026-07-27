# Steer Runtime v0.2.178 — Certification Report

🟢 **Trust Score: 89/100** (Certified)

**Target:** kiro

Generated: 2026-07-27T09:19:14

---

## Delegation (40%) — 19/26 passed (73%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✓ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 20 |
| ba-analyze-requirements | ✓ | 17 |
| design-architecture-review | ✓ | 5 |
| ops-check-deployment | ✓ | 8 |
| inspector-inspect-app | ✓ | 6 |
| analyze-story | ✗ | 0 |
| leadership-quarterly-report | ✓ | 5 |
| write-code | ✓ | 0 |
| run-tests | ✓ | 0 |
| fetch-jira | ✗ | 0 |
| code-review | ✓ | 29 |
| implement-feature | ✗ | 0 |
| create-pr | ✗ | 0 |
| pm-sprint-status | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| qa-analyze-defect | ✗ | 0 |
| pm-run-retro | ✓ | 8 |
| qa-plan-testing | ✓ | 8 |
| triage-incident | ✓ | 8 |
| rca-investigation | ✓ | 5 |
| stability-validation | ✓ | 5 |
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