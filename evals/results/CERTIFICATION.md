# Steer Runtime v0.2.147-9-ga3552c55 — Certification Report

🟢 **Trust Score: 94/100** (Certified)

Generated: 2026-06-30T09:18:45

---

## Delegation (40%) — 22/26 passed (85%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ai-route-ml-task | ✗ | 0 |
| ba-delegate-figma-design | ✗ | 0 |
| cloudops-infra-issue | ✓ | 8 |
| leadership-quarterly-report | ✗ | 0 |
| ba-analyze-requirements | ✓ | 6 |
| design-architecture-review | ✓ | 5 |
| inspector-inspect-app | ✓ | 6 |
| analyze-story | ✓ | 8 |
| ops-check-deployment | ✓ | 5 |
| write-code | ✓ | 8 |
| implement-feature | ✓ | 25 |
| code-review | ✓ | 51 |
| run-tests | ✓ | 8 |
| fetch-jira | ✓ | 8 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| pm-run-retro | ✓ | 8 |
| qa-plan-testing | ✓ | 8 |
| qa-analyze-defect | ✓ | 25 |
| steer-review-pr | ✓ | 16 |
| steer-release | ✓ | 8 |
| rca-investigation | ✓ | 8 |
| triage-incident | ✓ | 25 |
| rca-minimal-delegation | ✗ | 0 |
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