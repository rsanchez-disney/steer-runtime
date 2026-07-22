# Steer Runtime v0.2.167-2-gc2fbef71 — Certification Report

🟢 **Trust Score: 91/100** (Certified)

**Target:** kiro

Generated: 2026-07-22T10:40:23

---

## Delegation (40%) — 20/26 passed (77%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ai-route-ml-task | ✗ | 0 |
| ba-delegate-figma-design | ✗ | 0 |
| cloudops-infra-issue | ✓ | 5 |
| ba-analyze-requirements | ✓ | 56 |
| design-architecture-review | ✓ | 5 |
| inspector-inspect-app | ✓ | 6 |
| analyze-story | ✓ | 8 |
| ops-check-deployment | ✓ | 5 |
| leadership-quarterly-report | ✓ | 5 |
| implement-feature | ✓ | 25 |
| write-code | ✓ | 8 |
| run-tests | ✓ | 8 |
| code-review | ✓ | 29 |
| fetch-jira | ✓ | 8 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| pm-run-retro | ✓ | 8 |
| qa-plan-testing | ✓ | 5 |
| qa-analyze-defect | ✗ | 0 |
| stability-validation | ✗ | 0 |
| steer-release | ✓ | 8 |
| rca-minimal-delegation | ✗ | 0 |
| triage-incident | ✓ | 5 |
| rca-investigation | ✓ | 5 |
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