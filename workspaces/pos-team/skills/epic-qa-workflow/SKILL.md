---
name: epic-qa-workflow
description: Full QA workflow for an EPIC — requirements analysis, code review, test gap analysis, manual test plan generation, unit test creation, manual test execution loop, and optional Slack bug reporting
agents: [android_arch_agent, requirements_analyst_agent, android_dev_agent, android_test_agent]
---

# Epic QA Workflow

End-to-end QA workflow for validating an Android EPIC. Covers requirements analysis, code review, automated test gaps, manual test plan generation, test execution tracking, and optional bug reporting.

## Prerequisites

- Jira MCP configured (POS-* tickets accessible)
- Epic ticket ID (POS-XXXX) with linked Stories and Bugs
- Git repository with clean working tree
- Gradle build working locally (`./gradlew assembleDebug`)
- Device or emulator available for manual testing

## Usage Examples

```
"Run QA workflow for epic POS-12345"
"Epic QA validation for POS-98765"
"Full QA pass on POS-11111"
```

## Workflow

### Step 1: Analyze EPIC Requirements

1. Fetch the EPIC via Jira MCP (summary, description, ACs, components)
2. Fetch ALL child Stories and Bugs linked to the EPIC
3. For each Story/Bug, extract:
   - Acceptance criteria
   - Business rules
   - Edge cases and boundary conditions
4. Produce a consolidated requirements summary grouped by feature area
5. Identify testable scenarios from the combined ACs

**Agent:** `requirements_analyst_agent`

### Step 2: Code Review for AC Issues

1. Identify the implementation files related to the EPIC features
2. Review code against each acceptance criterion:
   - Are all ACs properly implemented?
   - Are there logic gaps or missing conditions?
   - Are edge cases handled (null safety, boundary values, error states)?
3. Flag potential bugs or AC violations
4. Document findings with file paths and line references

**Agent:** `android_dev_agent`

### Step 3: Unit Test Gap Analysis

Run in parallel with Step 2:

1. Identify existing test files for the EPIC's feature area
2. Map test coverage against the requirements from Step 1
3. List uncovered scenarios:
   - Missing happy path tests
   - Missing edge case tests
   - Missing error/failure path tests
4. Prioritize gaps by risk (Critical > High > Medium > Low)

**Agent:** `android_dev_agent`

### Step 4: Generate Manual Test Plan

1. Create a `.md` file (e.g., `epic-pos-XXXX-manual-test-plan.md`) in the project root
2. Structure the test plan with:
   - EPIC reference and scope summary
   - Test case table with columns: TC#, Description, Status (⬜), Priority
   - For each TC, detailed section with:
     - **Preconditions**
     - **Steps to reproduce** (numbered, specific)
     - **Expected result**
     - **Actual result** (blank — filled during execution)
     - **Status** (⬜ Pending)
     - **Observations** (blank — filled during execution)
3. Cover all scenarios from Steps 1–3
4. Mark priority: 🔴 Critical, 🟡 High, 🟢 Medium

**Agent:** `android_dev_agent`

**⏸ GATE — Present the test plan to the user for review before proceeding**

### Step 5: Create Missing Unit Tests

1. Based on gap analysis from Step 3, write unit tests for uncovered scenarios
2. Follow project conventions:
   - MockK-based tests
   - File naming: `{ClassName}Test.kt`
   - Injectable dispatchers for coroutine testing
   - Cover happy path, edge cases, and error scenarios
3. Place tests in appropriate test source sets

**Agent:** `android_test_agent`

### Step 6: Run All Tests

1. Execute the new and existing unit tests:
   ```bash
   ./gradlew :gc:AppetizeActivate:testDebugUnitTest --tests "com.appetizeactivate.android.{package}.*"
   ```
2. Report results: passed, failed, errors
3. Fix any failures introduced by new tests
4. Re-run until all tests pass

**Agent:** `android_test_agent`

### Step 7: Manual Test Execution Loop

**⏸ GATE — This is an iterative step. User performs each TC on device and reports results.**

For each test case reported by the user:

1. User announces which TC they are testing (e.g., "Testing TC-01")
2. User reports result: PASS or FAIL with observations
3. Agent updates the manual test plan `.md` file:
   - Set status: ✅ Pass or ❌ Fail
   - Fill in "Actual result" field
   - Add observations/notes from user
4. If TC requires special setup (e.g., hardcoding a value to simulate a condition):

   **⏸ GATE — Confirm with user before applying any code changes**

   a. Apply the temporary code change (hardcode value, disable flag, etc.)
   b. User tests on device
   c. User reports result
   d. Agent updates the test plan
   e. Agent REVERTS the temporary change immediately after testing

5. Repeat until all TCs are executed

**Agent:** `android_dev_agent` (code changes) + `android_arch_agent` (orchestration)

### Step 8: Optional — Generate Slack Bug Reports

**⏸ GATE — Only execute this step when the user explicitly requests it**

For each FAILED test case, generate a short Slack-ready bug report:

```
🐛 *[TC-XX] Brief title*

*Steps to reproduce:*
1. Step one
2. Step two
3. Step three

*Actual:* What happened
*Expected:* What should happen

*Epic:* POS-XXXX | *Priority:* High/Critical
```

Keep messages SHORT and actionable. No long technical analysis.

**Agent:** `android_dev_agent`

## Delivery Summary

```
## 📊 QA Workflow Results
| Phase | Output | Status |
|-------|--------|--------|
| Requirements Analysis | Consolidated ACs | ✅ |
| Code Review | Issues found / Clean | ✅ |
| Test Gap Analysis | Gaps identified | ✅ |
| Manual Test Plan | .md file generated | ✅ |
| Unit Tests | X new tests created | ✅ |
| Test Execution | X/Y passed | ✅ |
| Manual Testing | X/Y TCs passed | ✅ |
| Bug Reports | Generated (if requested) | ⬜ |
```

## Important Rules

- **Orchestrator controls flow** — `android_arch_agent` coordinates all steps and communicates with the user
- **Test plan is the source of truth** — all manual test results are tracked in the `.md` file
- **Hardcoding is OPTIONAL** — only apply temporary code changes when the user requests it or the TC explicitly requires it
- **Always revert hardcoded changes** — never leave temporary test modifications in the codebase
- **Slack reports are OPTIONAL** — only generate when the user explicitly asks
- **Slack messages are SHORT** — steps to reproduce, actual vs expected, that's it
- **One TC at a time** — during manual testing, process results as the user reports them
- **Never skip the gates** — always wait for user input at ⏸ markers
- **Parallel where possible** — Steps 2 and 3 can run concurrently
