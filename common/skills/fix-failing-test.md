---
name: fix-failing-test
description: Diagnose and fix failing tests by identifying root cause
---

# Fix Failing Test

Diagnose and fix failing test(s) by identifying the root cause.

## Process

### Step 1: Analyze Failures

1. Run the failing test(s) and capture the exact error messages and stack traces
2. Identify the test file, test name, and assertion that fails

### Step 2: Diagnose Root Cause

Determine if the issue is:

- **Test setup** — missing mocks, incorrect test data, improper initialization
- **Source code bug** — implementation doesn't match expected behavior
- **Outdated assertion** — test expectations are stale after intentional changes
- **Async/timing** — missing awaits, race conditions, timeout issues
- **Environment** — missing config, wrong dependencies, database state

### Step 3: Fix

1. Make targeted changes to resolve the failure
2. Prefer fixing source code over modifying test assertions (unless the test is genuinely wrong)
3. Keep changes minimal — don't refactor unrelated code

### Step 4: Verify

1. Re-run the specific failing test(s)
2. Run the full test suite to check for regressions
3. If new failures appear, repeat from Step 1

```bash
# Use commands from project.yaml
<test_command>
```

### Step 5: Report

Summarize what was wrong and what was fixed:
- Root cause
- Files changed
- Any follow-up items

## Important Rules

- **Do not assume the test is wrong** — always check if the source code needs fixing
- **Do not skip re-running tests** — earlier fixes may resolve later failures
- **Preserve test intent** — if a test checks important behavior, don't weaken the assertion
