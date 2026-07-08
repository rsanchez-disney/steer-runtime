---
name: validate-regression-coverage
description: Validates regression test sets against epic requirements — coverage matrix, gap analysis, and risk scoring
agents: [qa_validation_agent]
---

# Validate Regression Coverage

Validates that a regression test set provides adequate coverage for an epic's requirements. Produces a structured, risk-scored report with actionable recommendations.

## Prerequisites

- Jira/XRay MCP configured
- Epic ticket ID (POS-XXXX) with defined requirements/ACs
- Test Set ticket ID (POS-XXXX) with associated test cases

## Workflow

### Step 1: Gather Epic Context

1. Fetch epic via Jira MCP (summary, description, labels, components, links)
2. Extract: acceptance criteria, business rules, scope exclusions
3. Fetch child stories/sub-tasks for additional requirements
4. Fetch linked issues (related bugs, dependencies)
5. If description references wiki pages, fetch via Confluence/MyWiki MCP

**Data needed:** All testable requirements from the epic scope

### Step 2: Gather Test Set Context

1. Fetch test set issue details (summary, status, labels)
2. Get all tests via `xray_get_test_set_tests`
3. For each test, fetch full details:
   - Summary, description, Cucumber scenarios
   - XRay repository path
   - Platform (Android, iOS, Web)
   - Last execution status
   - Test type (Manual, Cucumber, Generic)

**Data needed:** Complete test inventory with coverage intent

### Step 3: Decompose Requirements

Parse the epic into discrete, testable requirements:

- Numbered acceptance criteria
- Business rules (explicit and implicit)
- Boundary conditions and edge cases
- Integration touchpoints
- Configuration requirements
- Scope exclusions (what's NOT covered)

Output: `R1` through `Rn` numbered list

### Step 4: Build Coverage Matrix

For each requirement, determine coverage status:

| Status | Symbol | Meaning |
|--------|--------|---------|
| COVERED | ✅ | Test explicitly validates this requirement |
| IMPLICIT | ⚠️ | Test likely covers this as part of broader scenario |
| NOT COVERED | ❌ | No test addresses this requirement |
| OUT OF SCOPE | ➖ | Explicitly excluded from this test set |

### Step 5: Gap Analysis

For each NOT COVERED requirement:
- **Severity:** Critical / High / Medium / Low
- **Risk:** What could go wrong untested?
- **Recommendation:** Specific test to add

Severity rules:
- Critical: financial calculation, data integrity, security
- High: user-facing behavior, downstream integration
- Medium: edge case, configuration validation
- Low: documentation, nice-to-have boundary test

### Step 6: Cross-Cutting Assessment

- Platform coverage (Android, iOS, Web — all targets tested?)
- Environment coverage (appropriate test environments?)
- Negative scenarios (failure/error paths tested?)
- Regression safety (could changes break adjacent features?)

### Step 7: Generate Report

Use the template in `assets/coverage-report-template.md`

**Agent:** `qa_validation_agent`

## Usage Examples

```
"Validate POS-19406 against POS-1429"
"Check coverage for test set POS-123 vs epic POS-456"
"Release coverage report for GLB 2.1.3 epics"
```

## Important Rules

- **Match by intent**, not exact text — a test can cover multiple requirements
- **Mark IMPLICIT** if only happy path exists but edge cases are missing
- **Never fabricate coverage** — if uncertain, mark as gap and recommend validation
- **Cite specific test keys** when referencing coverage evidence
