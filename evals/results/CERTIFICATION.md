# Steer Runtime v0.2.170-2-g7935b353 — Certification Report

🟢 **Trust Score: 92/100** (Certified)

**Target:** kiro

Generated: 2026-07-22T16:54:05

---

## Delegation (40%) — 21/26 passed (81%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 5 |
| ba-analyze-requirements | ✓ | 27 |
| design-architecture-review | ✓ | 5 |
| analyze-story | ✓ | 8 |
| inspector-inspect-app | ✓ | 6 |
| ops-check-deployment | ✓ | 5 |
| leadership-quarterly-report | ✓ | 8 |
| run-tests | ✓ | 8 |
| implement-feature | ✓ | 25 |
| code-review | ✓ | 23 |
| fetch-jira | ✓ | 8 |
| write-code | ✓ | 37 |
| qa-plan-testing | ✗ | 0 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| qa-analyze-defect | ✗ | 0 |
| pm-run-retro | ✓ | 8 |
| steer-release | ✓ | 8 |
| triage-incident | ✓ | 25 |
| rca-minimal-delegation | ✗ | 0 |
| rca-investigation | ✓ | 5 |
| stability-validation | ✓ | 5 |
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