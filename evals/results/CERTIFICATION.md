# Steer Runtime v0.2.156-7-ga983f686 — Certification Report

🟢 **Trust Score: 94/100** (Certified)

Generated: 2026-07-11T09:18:18

---

## Delegation (40%) — 22/26 passed (85%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| cloudops-infra-issue | ✓ | 8 |
| inspector-inspect-app | ✓ | 8 |
| ai-route-ml-task | ✓ | 15 |
| ba-analyze-requirements | ✓ | 42 |
| analyze-story | ✓ | 8 |
| design-architecture-review | ✓ | 5 |
| leadership-quarterly-report | ✓ | 8 |
| code-review | ✓ | 51 |
| ops-check-deployment | ✓ | 5 |
| implement-feature | ✓ | 30 |
| run-tests | ✓ | 8 |
| fetch-jira | ✓ | 8 |
| write-code | ✓ | 8 |
| qa-plan-testing | ✗ | 0 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| pm-run-retro | ✓ | 8 |
| steer-review-pr | ✓ | 8 |
| steer-release | ✓ | 5 |
| triage-incident | ✓ | 8 |
| rca-investigation | ✓ | 8 |
| rca-minimal-delegation | ✗ | 0 |
| gsm-report | ✓ | 8 |
| stability-validation | ✓ | 33 |

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