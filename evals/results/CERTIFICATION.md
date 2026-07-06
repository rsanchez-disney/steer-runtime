# Steer Runtime v0.2.151-1-g178dd206 — Certification Report

🟢 **Trust Score: 91/100** (Certified)

Generated: 2026-07-05T09:16:22

---

## Delegation (40%) — 20/26 passed (77%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ai-route-ml-task | ✗ | 0 |
| ba-delegate-figma-design | ✗ | 0 |
| inspector-inspect-app | ✓ | 20 |
| cloudops-infra-issue | ✓ | 42 |
| ba-analyze-requirements | ✓ | 15 |
| design-architecture-review | ✓ | 5 |
| analyze-story | ✓ | 8 |
| code-review | ✓ | 8 |
| write-code | ✓ | 0 |
| leadership-quarterly-report | ✓ | 5 |
| ops-check-deployment | ✓ | 5 |
| fetch-jira | ✓ | 8 |
| implement-feature | ✓ | 39 |
| run-tests | ✓ | 8 |
| create-pr | ✓ | 8 |
| qa-analyze-defect | ✗ | 0 |
| pm-sprint-status | ✓ | 16 |
| steer-review-pr | ✗ | 0 |
| pm-run-retro | ✓ | 8 |
| qa-plan-testing | ✓ | 5 |
| triage-incident | ✓ | 30 |
| rca-investigation | ✓ | 8 |
| steer-release | ✗ | 0 |
| stability-validation | ✓ | 8 |
| rca-minimal-delegation | ✗ | 0 |
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