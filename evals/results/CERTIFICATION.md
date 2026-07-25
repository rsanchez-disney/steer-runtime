# Steer Runtime v0.2.175 — Certification Report

🟡 **Trust Score: 88/100** (Qualified)

**Target:** kiro

Generated: 2026-07-25T00:15:54

---

## Delegation (40%) — 18/26 passed (69%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✓ | 0 |
| ai-route-ml-task | ✓ | 8 |
| cloudops-infra-issue | ✓ | 49 |
| ba-analyze-requirements | ✓ | 5 |
| design-architecture-review | ✓ | 5 |
| ops-check-deployment | ✓ | 8 |
| analyze-story | ✗ | 0 |
| inspector-inspect-app | ✓ | 6 |
| leadership-quarterly-report | ✓ | 8 |
| implement-feature | ✗ | 0 |
| fetch-jira | ✗ | 0 |
| run-tests | ✓ | 0 |
| code-review | ✓ | 29 |
| create-pr | ✗ | 0 |
| pm-sprint-status | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| pm-run-retro | ✓ | 5 |
| write-code | ✓ | 0 |
| qa-plan-testing | ✓ | 5 |
| steer-review-pr | ✗ | 0 |
| rca-investigation | ✗ | 0 |
| triage-incident | ✓ | 8 |
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