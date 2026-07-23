# Steer Runtime v0.2.173 — Certification Report

🟢 **Trust Score: 91/100** (Certified)

**Target:** kiro

Generated: 2026-07-23T10:34:00

---

## Delegation (40%) — 20/26 passed (77%)

| Scenario | Status | Subagent Calls |
|----------|--------|----------------|
| ba-delegate-figma-design | ✗ | 0 |
| cloudops-infra-issue | ✓ | 8 |
| ai-route-ml-task | ✓ | 8 |
| ba-analyze-requirements | ✓ | 15 |
| design-architecture-review | ✓ | 5 |
| inspector-inspect-app | ✓ | 6 |
| ops-check-deployment | ✓ | 8 |
| analyze-story | ✓ | 8 |
| leadership-quarterly-report | ✓ | 5 |
| run-tests | ✓ | 8 |
| implement-feature | ✓ | 30 |
| code-review | ✓ | 51 |
| fetch-jira | ✓ | 8 |
| write-code | ✓ | 30 |
| create-pr | ✓ | 8 |
| pm-sprint-status | ✓ | 8 |
| steer-review-pr | ✗ | 0 |
| qa-analyze-defect | ✗ | 0 |
| qa-plan-testing | ✓ | 8 |
| pm-run-retro | ✓ | 5 |
| steer-release | ✗ | 0 |
| gsm-report | ✗ | 0 |
| rca-minimal-delegation | ✗ | 8 |
| triage-incident | ✓ | 30 |
| rca-investigation | ✓ | 5 |
| stability-validation | ✓ | 5 |

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