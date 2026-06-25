# XRay Test Creation Playbook

> Operational guide for creating Test Cases, Test Executions, and QA Metrics Tasks linked to user stories using Jira + XRay + AI Agents (Steer/Kiro).

---

## Table of Contents

1. [Process Overview](#process-overview)
2. [Technical Configuration](#technical-configuration)
3. [Step 1: Analyze the User Story](#step-1-analyze-the-user-story)
4. [Step 2: Create Test Cases](#step-2-create-test-cases)
5. [Step 3: Create Test Executions (per platform)](#step-3-create-test-executions-per-platform)
6. [Step 4: QA Metrics Evaluation Task](#step-4-qa-metrics-evaluation-task)
7. [Step 5: Final Verification](#step-5-final-verification)
8. [Naming Conventions](#naming-conventions)
9. [Field Quick Reference](#field-quick-reference)
10. [Complete Example: PAS2-17](#complete-example-pas2-17)
11. [Common Errors and Fixes](#common-errors-and-fixes)

---

## Process Overview

```
User Story → Analyze ACs/BRs → Test Cases → Test Executions (Android + iOS) → QA Task → Verification
```

For each user story, generate:

| Artifact | Jira Type | Quantity (Mobile/Flutter) | Quantity (Services/BE) |
|----------|-----------|---------------------------|------------------------|
| Test Cases | Test (Manual steps) | 1 per testable AC/BR |
| Test Executions | Test Execution | 2 (one Android, one iOS) | 1 (no platform split) |
| QA Metrics Task | Task | 1 per story | 1 per story |

### Story Type Detection

| Story Type | Detection Rule | Test Repository Path | Test Executions |
|------------|----------------|---------------------|-----------------|
| **Mobile/Flutter** | Title contains "Mobile" and/or "Flutter" | `/Passport - UI` | 2 (Android + iOS) |
| **Services (BE)** | Title does NOT mention "Mobile" nor "Flutter" | `/Passport - BE` | 1 (no platform split) |

All are linked to the story with `linkType: "Tests"`.

---

## Technical Configuration

### Available Tools

#### Jira Cloud (base tools)

| Tool | Purpose |
|------|---------|
| `jira_get_issue` | Fetch user story details |
| `jira_create_issue` | Create Tasks (QA Metrics) |
| `jira_link_issues` | Link issues — fallback for test coverage |
| `jira_assign_issue` | Assign issue to a user |
| `jira_update_issue` | Update fields (sprint, story points) |
| `jira_transition_issue` | Change issue status |

#### XRay Cloud (new — requires `XRAY_CLOUD_CLIENT_ID` + `XRAY_CLOUD_CLIENT_SECRET`)

| Tool | Purpose | Replaces |
|------|---------|----------|
| `xray_cloud_create_test` | Create test (Manual steps OR Cucumber/Gherkin + custom fields) | `jira_create_issue` for Tests |
| `xray_cloud_create_execution` | Create Test Execution with tests + custom fields in one call | `jira_create_issue` + `xray_add_tests_to_test_exec` |
| `xray_cloud_link_test_to_story` | Link test → story via XRay GraphQL | `jira_link_issues` with linkType "Tests" |
| `xray_cloud_search_tests` | Search tests by JQL | `xray_search_test_cases` |
| `xray_cloud_update_run` | Report PASSED/FAILED results per test/step | (new capability) |
| `xray_cloud_get_test_runs` | Get execution results for a test | (new capability) |
| `xray_cloud_get_test_steps` | Read steps from an existing test | (new capability) |

#### Deprecated (XRay Server — no longer works on Jira Cloud)

| Tool | Replacement |
|------|-------------|
| `xray_add_tests_to_test_exec` | `xray_cloud_create_execution` (includes testKeys) |
| `xray_search_test_cases` | `xray_cloud_search_tests` (JQL via GraphQL) |
| `xray_get_folder_tests` | `xray_cloud_search_tests` (use JQL to filter by label/path) |

### XRay Cloud Configuration

```bash
# Required env vars for XRay Cloud tools (set in Koda → [e] env vars)
XRAY_CLOUD_CLIENT_ID=<from XRay Cloud Settings → API Keys>
XRAY_CLOUD_CLIENT_SECRET=<from XRay Cloud Settings → API Keys>
```

> Tools are **conditionally loaded** — they only appear when both env vars are set.
> Auth uses client credentials → bearer token, cached for 50min (tokens expire at ~1h).

### Link Type for Coverage

> ⚠️ **CRITICAL:** The link type is **"Tests"** (PLURAL). Using "Test" (singular) returns a 404 error.
> **Post-migration:** Prefer `xray_cloud_link_test_to_story` which handles linking via GraphQL (no linkType needed).

```yaml
# Preferred (XRay Cloud):
xray_cloud_link_test_to_story:
  testKey: "TEST-KEY"
  storyKey: "STORY-KEY"

# Fallback (Jira REST):
jira_link_issues:
  inwardTicketId: "TEST-KEY"      # the test case / test execution / task
  outwardTicketId: "STORY-KEY"    # the user story
  linkType: "Tests"               # ← ALWAYS plural
```

### Custom Fields Reference

| Field | Field ID | Values |
|-------|----------|--------|
| Test Repository Path | `customfield_20111` | String (e.g., `/Passport - UI`) |
| Epic Link | `customfield_13912` | Epic issue key (e.g., `"PAS2-1"`) |
| Platforms | `customfield_11500` | Array of objects: `[{"value": "iOS"}, {"value": "Android"}]` |
| Test Environments | `customfield_20125` | Array of strings: `["LATEST"]` |
| Automation Candidate | `customfield_23001` | `{"value": "Y"}` \| `{"value": "N"}` \| `{"value": "Requires Analysis"}` |
| Automation Status | `customfield_23002` | `{"value": "Not Started"}` (only when Candidate = Y) |
| Server Environment | `customfield_11009` | Array: `[{"value": "Latest"}]` |
| AI Assisted Effort | `customfield_27200` | Number (default: `0.5`) |
| AI Usage Level | `customfield_27201` | `{"value": "Medium"}` \| `{"value": "High"}` \| `{"value": "Low"}` |
| AI Tools Used | `customfield_27202` | String (default: `"kiro"`) |
| Story Points | `customfield_10003` | Number |
| Sprint | `customfield_10803` | Sprint ID (number) |

> **Note:** Custom field IDs may have changed after migration. If `jira_update_issue` returns errors, verify IDs with `jira_get_issue` on an existing test case.

---

## Step 1: Analyze the User Story

```yaml
jira_get_issue:
  ticketId: "{STORY-KEY}"
  customFields: ["sprint", "storyPoints"]
```

Identify:
- Acceptance Criteria (ACs) → positive test cases
- Business Rules (BRs) → validation test cases
- Negative scenarios → when applicable
- The story **assignee** (used to assign the QA task)
- The **active sprint ID** (used to assign the QA task to the current sprint)

### Coverage Criteria

| Type | Include |
|------|---------|
| Happy path per AC | ✅ Always |
| Negative / error handling | ✅ When validations exist |
| Edge cases / boundaries | ✅ When boundary conditions exist |
| Feature toggle OFF | ✅ If applicable |

Each test case must be **independent** (not depend on results of another).

---

## Step 1.5: Check Existing Tests in the Repository

> ⚠️ **ALWAYS check for existing tests before creating new test cases.** Reuse existing tests when they cover the same functionality.

### How to check

```yaml
# Search by keyword/summary:
xray_cloud_search_tests:
  jql: 'project = PAS2 AND summary ~ "{keyword}"'
  limit: 20

# Check steps of a known test by key:
xray_cloud_get_test_steps:
  testKey: "{KNOWN_TEST_KEY}"

# Check coverage on a story (verify links):
xray_cloud_search_tests:
  jql: 'issue in requirementTests("{STORY_KEY}")'
```

### Decision Criteria

| Scenario | Action |
|----------|--------|
| Existing test covers the **same AC** exactly | **Reuse** — link it to the new story with `jira_link_issues` |
| Existing test is **similar but outdated** (wrong format, Manual instead of Cucumber) | **Reuse and update** — update summary, description, Gherkin, then link |
| Existing test covers a **different story's AC** with same functionality | **Reuse** — link to both stories (a test can cover multiple stories) |
| No existing test covers the AC | **Create new** test case |

### When reusing an existing test

1. Update the summary to include the new story key (e.g., `PAS2-118 | ...`)
2. Update description with the new story's User Story and Business Rules
3. Convert to Cucumber if it was Manual (update `customfield_20100`, `customfield_20101`, `customfield_20102`)
4. Link to the new story with `linkType: "Tests"`
5. Do **NOT** reopen closed tests — the test execution status is independent of the test case status

---

## Step 2: Create Test Cases

> **Post-migration:** Use `xray_cloud_create_test` — supports Manual steps, Cucumber/Gherkin, labels, and custom fields in a single call.

### Create each test (Manual steps):

```yaml
xray_cloud_create_test:
  projectKey: "{PROJECT}"
  summary: "{See naming format below}"
  testType: "Manual"
  labels: ["{PROJECT_LABEL}"]
  steps:
    - action: "{precondition or setup step}"
      data: "{test data if applicable}"
      result: "{expected state after setup}"
    - action: "{user action / trigger}"
      data: "{input data}"
      result: "{expected result / verification}"
  customFields:
    customfield_13912: "{EPIC_KEY}"
    customfield_11500: [{"value": "iOS"}, {"value": "Android"}]
    customfield_20111: "{Test Repository Path}"
    customfield_20125: ["LATEST"]
    customfield_23001: {"value": "Y"}
    customfield_23002: {"value": "Not Started"}
```

### Create each test (Cucumber/Gherkin — alternative):

```yaml
xray_cloud_create_test:
  projectKey: "{PROJECT}"
  summary: "{See naming format below}"
  testType: "Cucumber"
  labels: ["{PROJECT_LABEL}"]
  gherkin: |
    Given {precondition}
    When {user action}
    Then {expected result}
  customFields:
    customfield_13912: "{EPIC_KEY}"
    customfield_11500: [{"value": "iOS"}, {"value": "Android"}]
    customfield_20111: "{Test Repository Path}"
    customfield_20125: ["LATEST"]
    customfield_23001: {"value": "Y"}
    customfield_23002: {"value": "Not Started"}
```

**Example (Manual):**
```yaml
xray_cloud_create_test:
  projectKey: "PAS2"
  summary: "PAS2-17 | DLR | Mobile | Photo Display | Guest photo displayed when linked"
  testType: "Manual"
  labels: ["PAS2_CQE"]
  steps:
    - action: "Guest has a photo linked to their entitlement"
      data: ""
      result: "Photo is stored and associated with the entitlement"
    - action: "Guest navigates to Tickets and Passes section"
      data: ""
      result: "Entitlement card is displayed"
    - action: "Verify the photo display area on the entitlement card"
      data: ""
      result: "Guest photo is displayed (not placeholder)"
  customFields:
    customfield_13912: "PAS2-1"
    customfield_11500: [{"value": "iOS"}, {"value": "Android"}]
    customfield_20111: "/Passport - UI"
    customfield_20125: ["LATEST"]
    customfield_23001: {"value": "Y"}
    customfield_23002: {"value": "Not Started"}
```

### Link each test to the story:

> **Post-migration:** Use `xray_cloud_link_test_to_story` (preferred) or `jira_link_issues` (fallback).

```yaml
# Preferred — XRay Cloud GraphQL
xray_cloud_link_test_to_story:
  testKey: "{TEST_KEY}"
  storyKey: "{STORY_KEY}"

# Fallback — Jira REST (if XRay Cloud env vars not configured)
jira_link_issues:
  inwardTicketId: "{TEST_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Tests"
```

### Test Case Classification

Each test case must be classified as:

| Type | Description |
|------|-------------|
| **Positive** | Validates happy path / expected behavior |
| **Negative** | Validates error handling / invalid inputs / feature OFF |

Include the type in the test case description.

### Automation Evaluation (per test case)

Set these **custom fields** on each test case (NOT in the description):

| Field | Field ID | Values |
|-------|----------|--------|
| Automation Candidate | `customfield_23001` | `{"value": "Y"}` \| `{"value": "N"}` \| `{"value": "Requires Analysis"}` |
| Automation Status | `customfield_23002` | `{"value": "Not Started"}` (only if Candidate = Y) |

**Criteria:**

| Scenario | Automation Candidate |
|----------|---------------------|
| Critical flows, navigation, logic | **Y** |
| Simple visual UI validation | **N** |
| Complex integrations | **Requires Analysis** |

**Rules:**
- If Automation Candidate = **Y** → set Automation Status: `Not Started`
- If **N** or **Requires Analysis** → leave Automation Status empty

```yaml
jira_update_issue:
  ticketId: "{TEST_KEY}"
  customFields:
    customfield_23001: {"value": "Y"}
    customfield_23002: {"value": "Not Started"}
```
### Scenario Outline — Grouping Similar Test Cases (as parameterized steps)

**Before creating individual test cases, look for scenarios that can be grouped** into a single test with parameterized steps. This reduces redundancy and improves maintainability.

**When to group:**
- Multiple test cases validate the **same flow** with different inputs/conditions
- The step structure is identical, only the data changes
- Examples: different field validations, different states of the same element, different ticket types

**When NOT to group:**
- Tests have fundamentally different preconditions or flows
- Grouping would make the test confusing or lose clarity
- Only 2 variations and the tests are conceptually different

**Example (grouped as one test with data variations in steps):**

```yaml
xray_cloud_create_test:
  projectKey: "PAS2"
  summary: "PAS2-118 | DLR | Mobile | Photo CTA | CTA display based on conditions"
  testType: "Manual"
  labels: ["PAS2_CQE"]
  steps:
    - action: "Guest views entitlement with condition: eligible, no photo linked"
      data: "Condition: eligible, no photo linked"
      result: "Upload Photo CTA present and enabled"
    - action: "Guest views entitlement with condition: feature toggled OFF"
      data: "Condition: feature toggled OFF"
      result: "Upload Photo CTA not present"
    - action: "Guest views entitlement with condition: entitlement redeemed"
      data: "Condition: entitlement redeemed"
      result: "CTA visible but disabled (greyed out)"
    - action: "Guest views entitlement with condition: photo already linked"
      data: "Condition: photo already linked"
      result: "Change Photo CTA displayed"
```

> **Note:** Each step represents a variation/condition. The `data` field documents the parameterized input.

**When grouping existing test cases:**
1. Pick one test case as the "survivor" — add all variations as steps
2. Add comment to redundant tests: "Merged into {KEY} as parameterized test"
3. Transition redundant tests to "Reject"



## Step 3: Create Test Executions (per platform)

> **Rule:** If the story is a **Service/BE story** (title does NOT contain "Mobile" or "Flutter"), create only **1 Test Execution** (no platform split, no platform custom field). If it is a **Mobile/Flutter story**, create **exactly 2** — one for Android, one for iOS.

> **Post-migration:** Use `xray_cloud_create_execution` (preferred) — it creates the execution AND adds tests in one call. Fall back to `jira_create_issue` + `xray_add_tests_to_test_exec` only if XRay Cloud env vars are not configured.

### Service/BE Story — Single Test Execution:

```yaml
xray_cloud_create_execution:
  projectKey: "{PROJECT}"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title}"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
  environment: "LATEST"
  customFields:
    customfield_11009: [{"value": "Latest"}]
    customfield_10803: {SPRINT_ID}
```

### Mobile/Flutter Story — Two Test Executions:

Create **exactly 2** Test Executions per story — one for Android, one for iOS.

### Create Android Test Execution:

```yaml
xray_cloud_create_execution:
  projectKey: "{PROJECT}"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | Android"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
  environment: "LATEST"
  customFields:
    customfield_11500: [{"value": "Android"}]
    customfield_11009: [{"value": "Latest"}]
    customfield_10803: {SPRINT_ID}
```

### Create iOS Test Execution:

```yaml
xray_cloud_create_execution:
  projectKey: "{PROJECT}"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | iOS"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
  environment: "LATEST"
  customFields:
    customfield_11500: [{"value": "iOS"}]
    customfield_11009: [{"value": "Latest"}]
    customfield_10803: {SPRINT_ID}
```

### Link both to the story:

```yaml
# Preferred — XRay Cloud GraphQL
xray_cloud_link_test_to_story:
  testKey: "{TEST_EXEC_ANDROID_KEY}"
  storyKey: "{STORY_KEY}"

xray_cloud_link_test_to_story:
  testKey: "{TEST_EXEC_IOS_KEY}"
  storyKey: "{STORY_KEY}"

# Fallback — Jira REST
jira_link_issues:
  inwardTicketId: "{TEST_EXEC_ANDROID_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Tests"
```

### Assign both executions to the story's reporter:

```yaml
jira_assign_issue:
  ticketId: "{TEST_EXEC_ANDROID_KEY}"
  assignee: "{STORY_REPORTER_USERNAME}"

jira_assign_issue:
  ticketId: "{TEST_EXEC_IOS_KEY}"
  assignee: "{STORY_REPORTER_USERNAME}"
```

> **Rule:** Always assign Test Executions to the story's **reporter** (not the assignee).

### Legacy approach (fallback if XRay Cloud not configured):

<details>
<summary>Click to expand jira_create_issue approach</summary>

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Test Execution"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | Android"
  labels: ["{PROJECT_LABEL}"]
  customFields:
    customfield_11500: [{"value": "Android"}]
    customfield_11009: [{"value": "Latest"}]
    customfield_10803: {SPRINT_ID}

xray_add_tests_to_test_exec:
  testExecKey: "{TEST_EXEC_KEY}"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
```

</details>

---

## Step 4: QA Metrics Evaluation Task

### Create:

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Task"
  summary: "{STORY-KEY} | {Story Title} | QA Metrics Evaluation | Test Case Creation"
  labels: ["{PROJECT_LABEL}"]
  description: |
    h2. QA Metrics Evaluation

    Test case creation for {STORY-KEY} using AI-assisted tooling.

    h3. Context
    || Field || Value ||
    | Story | {STORY-KEY} |
    | Test Cases Created | {count} |
    | Test Executions | {TEST_EXEC_ANDROID} (Android), {TEST_EXEC_IOS} (iOS) |
    | Automation Candidates | {count Y} / {total} |
  customFields:
    customfield_27200: 0.5                      # AI Assisted Effort (default)
    customfield_27201: {"value": "Medium"}      # AI Usage Level (default)
    customfield_27202: "kiro"                   # AI Tools Used (default)
```

> **AI Metrics fields** go directly in custom fields, NOT in the description.
> Default values: Effort = 0.5, Level = Medium, Tool = kiro.

### Link to the story:

```yaml
jira_link_issues:
  inwardTicketId: "{TASK_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Tests"
```

### Assign to the story's assignee:

```yaml
jira_assign_issue:
  ticketId: "{TASK_KEY}"
  assignee: "{STORY_ASSIGNEE_USERNAME}"
```

### Assign current sprint and story points (1 SP):

```yaml
jira_update_issue:
  ticketId: "{TASK_KEY}"
  customFields:
    customfield_10003: 1              # Story Points = 1
    customfield_10803: {SPRINT_ID}    # Sprint ID (number, NOT string)
```

> To get the sprint ID: check `jira_get_issue` on the story with `customFields: ["sprint"]` and extract the `id` from the ACTIVE sprint.

### Transition to In Progress:

```yaml
jira_transition_issue:
  ticketId: "{TASK_KEY}"
  status: "In Progress"
```

---

## Step 5: Final Verification

### Check test coverage (link verification):

```yaml
xray_cloud_search_tests:
  jql: 'issue in requirementTests("{STORY_KEY}")'
```

### Check test run status:

```yaml
xray_cloud_get_test_runs:
  testKey: "{TEST-1}"
  limit: 5
```

> Returns: run status (PASSED/FAILED/TODO), execution key, step-level results.

### Verification checklist:

- [ ] All test cases appear in the Story's Test Coverage section
- [ ] Both Test Executions (Android + iOS) linked to the Story
- [ ] Tests added to both Test Executions (via `xray_cloud_create_execution`)
- [ ] QA Metrics Task created, linked, assigned, in current sprint, In Progress
- [ ] Each test case has: type (Positive/Negative), automation evaluation
- [ ] Summary: X test cases, 2 executions, 1 task

---

## Naming Conventions

### Test Cases

```
{STORY-KEY} | {DOMAIN} | {AREA} | {Feature} | {Story Title} | {Test Case Name}
```

**Example:**
```
PAS2-17 | DLR | Mobile | Photo Display | Readback of Photo on Tickets and Passes | Guest photo displayed when linked
```

### Test Executions

```
Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | {Platform}
```

**Examples:**
```
Latest | PAS2-17 | DLR | TnP | Flutter | Photo Display | Readback of Photo on Tickets and Passes | Android
Latest | PAS2-17 | DLR | TnP | Flutter | Photo Display | Readback of Photo on Tickets and Passes | iOS
```

### QA Metrics Task

```
{STORY-KEY} | {Story Title} | QA Metrics Evaluation | Test Case Creation
```

---

## Field Quick Reference

### Per Project

| Project | Label | Repository Path | Epic | Epic Key | Platforms | Test Environment |
|---------|-------|-----------------|------|----------|-----------|-----------------|
| PAS2 (Mobile/Flutter) | `PAS2_CQE` | `/Passport - UI` | Photo Upload, Management, and Display | `PAS2-1` | iOS, Android | LATEST |
| PAS2 (Services/BE) | `PAS2_CQE` | `/Passport - BE` | Photo Upload, Management, and Display | `PAS2-1` | N/A (single execution) | LATEST |

> Add more projects here as they are used.

### Test Case Details Section

| Field | Value |
|-------|-------|
| Label | `{PROJECT_LABEL}` |
| Test Repository Path | `{Repository Path}` |
| Test Type | Cucumber |
| Automation Candidate | Y / N / Requires Analysis |
| Automation Status | Not Started (if Y) / empty |
| Type | Positive / Negative |

### Test Execution Details Section

| Field | Value |
|-------|-------|
| Label | `{PROJECT_LABEL}` |
| Sprint | Active sprint (Passport Phase 2 Sprint N) |
| Platform | Android / iOS |
| Server Environment | Latest |

### Available Link Types (12 total)

| Link Type | Inward | Outward |
|-----------|--------|---------|
| **Tests** | tested by | tests |
| Blocks | is blocked by | blocks |
| Defect | created by | created |
| Dependency | is dependent upon | dependency of |
| Relates | relates to | relates to |
| Implementers | is implemented by | implements |
| Documentation | is documented by | documents |
| Duplicate | is duplicated by | duplicates |
| Cloners | is cloned by | clones |
| Parent/Child | parent of | child of |
| Issue split | split from | split to |
| Bonfire Testing | Testing discovered | Discovered while testing |

---

## Complete Example: PAS2-17

**Story:** PAS2-17 — "Readback of Photo on Tickets and Passes"  
**Domain:** DLR | TnP | Flutter | Photo Display  
**Date:** 2026-06-04  
**Assignee:** Castellanos, Luis

### Test Cases Created

| Key | Test Case | Covers | Type | Automation |
|-----|-----------|--------|------|-----------|
| PAS2-649 | Placeholder displayed when no photo linked | AC.01 | Positive | Y — Not Started |
| PAS2-647 | Guest photo displayed when linked | AC.02 | Positive | Y — Not Started |
| PAS2-646 | No photo or placeholder when feature OFF | AC.03 | Negative | Y — Not Started |
| PAS2-650 | New photo displayed after replacement | BR #4 | Positive | Y — Not Started |
| PAS2-648 | Placeholder displayed after photo deletion | BR #5 | Positive | Y — Not Started |

### Test Executions

| Key | Summary | Platform |
|-----|---------|----------|
| PAS2-651 | Latest \| PAS2-17 \| DLR \| TnP \| Flutter \| Photo Display \| Readback of Photo on Tickets and Passes | Both* |

> *Note: PAS2-17 was created with a single Test Execution before the 2-platform convention was established. Going forward, always create 2.

### QA Metrics Task

| Key | Summary | Sprint | SP | Status |
|-----|---------|--------|----|--------|
| PAS2-652 | PAS2-17 \| Readback of Photo on Tickets and Passes \| QA Metrics Evaluation \| Test Case Creation | Sprint 7 (64282) | 1 | In Progress |

### Verification

```
xray_search_test_cases:
  jql: 'issue in requirementTests("PAS2-17")'
  → Result: 5/5 tests confirmed ✅
```

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `404 - No issue link type with name 'Test' found` | Wrong link type name | Use **"Tests"** (plural) |
| `Number value expected as the Sprint id` | Sprint ID passed as string or alias | Use field ID directly: `customfield_10803: {NUMBER}` |
| Test not showing in Test Coverage | Not linked with `jira_link_issues` | Run link with `linkType: "Tests"` |
| Task unassigned | Forgot to assign to story owner | Use `jira_assign_issue` with the story assignee's username |
| Story Points not set with `storyPoints` param | Field uses custom field ID | Use `customFields: {"customfield_10003": 1}` |
| Test Execution empty | Only linked but tests not added | Use `xray_add_tests_to_test_exec` after linking |
| Only 1 Test Execution created | Forgot per-platform split (Mobile stories only) | For Mobile/Flutter stories, always create 2: one Android, one iOS. For Services/BE stories, 1 is correct |

---

## Execution Order (Summary)

```
1.  jira_get_issue                       → Fetch story + identify assignee + active sprint
2.  Analyze ACs/BRs                      → Define required test cases + classify Positive/Negative
3.  xray_cloud_search_tests              → Check existing coverage (JQL by keyword or requirementTests)
4.  Decide reuse vs create               → Reuse existing tests when possible, update if needed
5.  Group similar scenarios              → Identify tests that can be merged into parameterized steps
6.  xray_cloud_create_test ×N            → Create each NEW Test (Manual/Cucumber + custom fields in one call)
7.  xray_cloud_link_test_to_story ×N     → Link each test (new + reused) to story
8.  xray_cloud_create_execution ×2       → Create Test Execution Android + iOS (testKeys + custom fields)
9.  xray_cloud_link_test_to_story ×2     → Link both executions to story
10. jira_assign_issue ×2                 → Assign executions to story's reporter
11. jira_create_issue                    → Create QA Metrics Task (with AI fields)
12. jira_link_issues                     → Link Task to story (linkType: "Tests")
13. jira_assign_issue                    → Assign Task to story's assignee
14. jira_update_issue                    → Set active sprint + 1 story point on Task
15. jira_transition_issue                → Move Task to "In Progress"
16. xray_cloud_search_tests              → Verify coverage with requirementTests()
```

---

## Migration Notes (Jira Server → Atlassian Cloud)

> **Date:** 2026-06-24  
> **Status:** In transition — hybrid approach

### What changed

| Area | Before (Jira Server) | After (Jira Cloud) |
|------|----------------------|---------------------|
| Jira URL | `myjira.disney.com` | `disneyexperiences.atlassian.net` |
| XRay API | `/rest/raven/2.0/*` (Server REST) | `xray.cloud.getxray.app` (separate API) |
| Auth (XRay) | Jira PAT | Client ID + Client Secret (bearer token) |
| Auth (Jira) | PAT (header) | Email + API Token (Basic auth) |

### Current limitations

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| No folder/repository browsing | Cannot browse test repo by folder tree | Use `xray_cloud_search_tests` with JQL |
| Custom field IDs may have changed | Fields like sprint, epic may have new IDs in Cloud | Verify with `jira_get_issue` including `customFields` |

### Pending verification

- [ ] Confirm `jira_create_issue` works for issue type "Test" with XRay custom fields on Cloud
- [ ] Confirm `jira_create_issue` works for issue type "Test Execution" on Cloud
- [ ] Confirm custom field IDs (`customfield_20100`, `20101`, `20102`, etc.) are unchanged
- [ ] Confirm `jira_link_issues` with linkType "Tests" still works on Cloud
- [ ] Confirm sprint field ID (`customfield_10803`) is unchanged
- [ ] Test `xray_cloud_link_test_to_story` with PAS2 project
- [ ] Test `xray_cloud_create_execution` with PAS2 project


