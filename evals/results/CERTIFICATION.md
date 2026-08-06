# Steer Runtime v0.2.180 — Certification Report

🟢 **Trust Score: 95/100** (Certified)

**Target:** kiro

Generated: 2026-08-06T09:20:36

---

## Delegation (40%) — 23/26 passed (88%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ai-route-ml-task | ✗ | 0 |
| ba-delegate-figma-design | ✓ | 0 |
| cloudops-infra-issue | ✓ | 8 |
| inspector-inspect-app | ✓ | 20 |
| ba-analyze-requirements | ✓ | 27 |
| design-architecture-review | ✓ | 5 |
| analyze-story | ✓ | 8 |
| leadership-quarterly-report | ✓ | 5 |
| ops-check-deployment | ✓ | 5 |
| implement-feature | ✓ | 25 |
| write-code | ✓ | 8 |
| code-review | ✓ | 29 |
| fetch-jira | ✓ | 8 |
| run-tests | ✓ | 8 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| pm-run-retro | ✓ | 5 |
| qa-plan-testing | ✓ | 5 |
| qa-analyze-defect | ✓ | 79 |
| triage-incident | ✓ | 62 |
| rca-investigation | ✓ | 5 |
| rca-minimal-delegation | ✓ | 0 |
| stability-validation | ✓ | 5 |
| gsm-report | ✓ | 8 |
| steer-release | ✗ | 0 |

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