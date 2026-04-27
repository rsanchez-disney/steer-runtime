---
name: opsheet-ui-bugfix
description: End-to-end Angular UI bugfix workflow — Jira ticket to verified fix with regression checks and user checkpoints
---

# Skill: UI Bugfix (Angular)

Use this skill when a UI bug is reported in Opsheet plus (wdpr-parkops-opsheet-suite).

## Prerequisites

- Jira MCP configured and accessible
- Working Angular 15 project with NGXS and Jasmine
- Steering file loaded: `ui-angular-opsheet.md`

---

## Workflow

### Step 0: Fetch Bug Ticket from Jira

1. Ask the user for the ticket ID if not provided (e.g., `OPS-XXXXX`).
2. Fetch the ticket via Jira MCP. **Important:** for bugs and defects, the critical information is NOT in the `description` field — it lives in these custom fields:
   - **Steps to Reproduce** (`customfield_11005`) — the exact steps to trigger the bug.
   - **Actual Results** (`customfield_11007`) — what currently happens (the broken behavior).
   - **Expected Results** (`customfield_11006`) — what should happen instead.

   Fetch the ticket with these custom fields explicitly:
   ```
   jira_get_issue(ticketId, customFields: ["customfield_XXXXX", "customfield_XXXXX", "customfield_XXXXX"])
   ```
   Also retrieve: summary, status, priority, labels, linked issues, and attachments list.
   The `description` field may be empty or contain only a brief overview — always prefer the custom fields above for bug details.

3. Save the full ticket data (including custom field values) as `.kiro/ticket-cache/<TICKET-ID>.json` with a `fetchedAt` ISO timestamp.
4. This file is the **source of truth** for the entire workflow. Every time you read it, remind the user: _"Using ticket data last fetched on {fetchedAt}. Say 'refresh ticket' if you need me to re-fetch."_
5. If the ticket links to an original story/feature ticket, note it — you may need it later for requirement verification.

### Step 1: Understand the Bug

1. Summarize the bug to the user in plain language, using the **custom fields** as the primary source:
   - **Steps to Reproduce** (from the custom field, not the description) — present as a numbered list.
   - **Actual Results** (from the custom field) — what currently happens.
   - **Expected Results** (from the custom field) — what should happen.
   - What is broken and where (route, component, feature area).
   - Severity / priority.
2. If any of the three custom fields are empty or vague, flag it explicitly — these are required for a proper fix. Ask the user to fill in the gaps.
3. Also check the `description` field for any supplementary context, but do not rely on it as the primary bug specification.
4. Ask the user to confirm or clarify before proceeding.

**⏸ CHECKPOINT — User confirms bug understanding before investigation**

### Step 2: Locate the Problem in Code

1. **Determine the boundary** — is this a UI-only issue, an API response issue, or a backend problem?
   - Search for the affected component, template, service, and state by route/feature area.
   - Trace the data flow: component → state/selector → service → API call.
   - Check the relevant transformer/mapper if the data shape looks wrong.

2. **Narrow down the root cause:**
   - Read the affected files and their tests.
   - Look for recent changes in the area (`git log --oneline -20 -- <path>`).
   - Check if the issue is in rendering (template), data (state/service), or contract (model mismatch).
   - Look for common culprits: missing null checks, incorrect selector, stale state, unhandled error path, missing field tolerance.

3. **If you cannot pinpoint the root cause from code alone:**
   - Tell the user what you've investigated and what you've ruled out.
   - Suggest specific manual checks the user can perform (browser console, network tab, specific user actions).
   - Ask the user to report back what they observe.

**⏸ CHECKPOINT — User confirms root cause diagnosis (or provides manual test results)**

### Step 3: Create Branch

1. Ensure the working tree is clean (`git status`).
2. Create a fix branch from the base branch:

```bash
git checkout main
git pull
git checkout -b fix/OPS-<number>-<short-description>
```

Branch naming must follow: `fix/OPS-{number}` or `fix/OPS-{number}-{short-description}`.

### Step 4: Implement the Fix

Follow the steering file `ui-angular-opsheet.md` for all conventions. Key rules for bugfixes:

- **Minimal diff** — fix only the bug. Do not refactor surrounding code unless it directly caused the issue.
- **Safe defaults** — tolerate missing/null fields; never crash on undefined.
- **Single-return style** — no early return guard clauses.
- **No `console.log`** in production code.
- **Error handling** must stay user-friendly — no raw error messages exposed to the UI.
- If the fix touches state: immutable updates only (`ctx.patchState()` with spread).
- If the fix touches a template: ensure all UX states still work (loading / empty / error / success).

### Step 5: Regression Check — Verify No Side Effects

This is critical for bugfixes. Before writing tests:

1. **Run the full existing test suite:**

```bash
npm run test -- --watch=false
```

2. **If any existing tests break:**
   - Determine whether the test was wrong (testing the buggy behavior) or the fix introduced a side effect.
   - If the test was asserting buggy behavior → update the test to match the corrected behavior.
   - If the fix caused an unrelated test to fail → **STOP and notify the user:**
     _"The fix for OPS-{number} caused a change in behavior in {affected area}. This may affect the original feature requirements. Can you provide the original story ticket so I can verify the intended behavior?"_

**⏸ CHECKPOINT — If side effects detected, user provides original story ticket or confirms the behavioral change is acceptable**

3. If the user provides an original story ticket:
   - Fetch it via Jira MCP and cache it alongside the bug ticket.
   - Compare the acceptance criteria from the original story against the new behavior.
   - Confirm with the user that the fix aligns with the original requirements.

### Step 6: Add Regression Tests

Write targeted tests that prevent this specific bug from recurring:

**Mocking strategy (follow `ui-angular-opsheet.md`):**
- Mock ALL dependencies — `jasmine.createSpyObj()` with class reference.
- `withArgs()` over `callFake()` for conditional returns.
- NGXS State tests → real Store; Component/Service tests → mock Store.
- No `NO_ERRORS_SCHEMA`.

**Test coverage for the fix:**
- A test that reproduces the exact bug scenario (would have failed before the fix).
- Edge cases around the fix: null/undefined inputs, empty collections, error responses.
- If the bug was a missing null check → test with null, undefined, empty string, and valid value.
- If the bug was a state issue → test the state transition that was broken.

**Run and verify:**

```bash
npm run test -- --watch=false
npm run lint-style
```

Fix any failures before proceeding.

### Step 7: Self-Review

1. Run `git diff main...HEAD` to review all changes.
2. Verify the fix addresses the bug description and reproduction steps from the cached ticket.
3. Check the self-review checklist:
   - [ ] Fix is minimal — no unrelated changes.
   - [ ] No `console.log` / `console.warn` / `console.debug` in production code.
   - [ ] No `any` types without justification.
   - [ ] No imports from `src/tests/` in production code.
   - [ ] Error handling is user-friendly.
   - [ ] All observable subscriptions cleaned up.
   - [ ] State updates are immutable.
   - [ ] Regression test added that reproduces the original bug.
   - [ ] All existing tests pass (no unintended side effects).
   - [ ] Single-return style used.
   - [ ] New TODOs include ticket number: `// TODO(OPS-XXXXX): description`.

**⏸ CHECKPOINT — User reviews final changes before shipping**

### Step 8: Commit & Push

1. Stage only relevant files (avoid `git add .`).
2. Commit with conventional commit format:

```bash
git add <files>
git commit -m "fix: OPS-<number> - <description>"
```

3. Push the branch:

```bash
git push -u origin fix/OPS-<number>-<short-description>
```

### Step 9: Cleanup

1. Remove the ticket cache file(s) if the user confirms the fix is complete:

```bash
rm .kiro/ticket-cache/<TICKET-ID>.json
```

2. Summarize what was done:
   - Root cause explanation.
   - Files changed.
   - Regression tests added.
   - Any side effects detected and how they were resolved.
   - Any follow-up items or related tickets to watch.

---

## Important Rules

- **Never proceed past a checkpoint without explicit user approval.**
- **Ticket cache is the source of truth** — always remind the user of the fetch date when referencing it.
- **Minimal diff** — fix only the bug, nothing else.
- **Ask the user when stuck** — if you can't find the root cause from code, suggest manual checks and wait for input.
- **Side effects require user confirmation** — if the fix changes behavior beyond the bug, stop and verify with the original story.
- **No secrets in code or logs.**
- **Follow `ui-angular-opsheet.md`** for all coding, testing, and architectural decisions.
