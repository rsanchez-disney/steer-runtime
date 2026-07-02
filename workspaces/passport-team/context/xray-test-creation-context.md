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
11. [Complete Example: PAS2-286 (Post-Migration)](#complete-example-pas2-286-post-migration)
12. [Common Errors and Fixes](#common-errors-and-fixes)

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

All are linked to the story with `linkType: "Test"`.

---

## Technical Configuration

> ⚠️ **DESCRIPTION FORMAT:** Jira Cloud requires **ADF (Atlassian Document Format)** for proper rendering. 
> - **API v2** (`/rest/api/2/`) saves descriptions as **plain text** — markdown is NOT rendered (shows raw `##`, `| table |` as text).
> - **API v3** (`/rest/api/3/`) accepts native **ADF JSON** — renders headings, tables, bold, lists properly.
> - **Always use API v3 with ADF** for descriptions. The MCP `jira_create_issue` / `jira_update_issue` tools use API v2 — descriptions created with them will appear as plain text.
> - For the `description` field in API v3, pass a JSON object with `{"version": 1, "type": "doc", "content": [...]}` structure.

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

#### XRay Cloud (requires `XRAY_CLOUD_CLIENT_ID` + `XRAY_CLOUD_CLIENT_SECRET`)

| Tool                             | Purpose                                       | Status (2026-07-02)  |
|----------------------------------|-----------------------------------------------|:--------------------:|
| `xray_cloud_create_test`        | Create test (Manual steps + custom fields)    | ✅ WORKING           |
| `xray_cloud_update_run`         | Report status / associate tests to TEs        | ✅ WORKING           |
| `xray_cloud_search_tests`       | Search tests by JQL                           | ✅ FIXED             |
| `xray_cloud_get_test_steps`     | Read steps from an existing test              | ✅ FIXED             |
| `xray_cloud_get_test_runs`      | Get execution results for a test              | ✅ FIXED             |
| `xray_cloud_link_test_to_story` | Link test → story via issue link              | ✅ FIXED             |
| `xray_cloud_create_execution`   | Create Test Execution with tests              | ✅ FIXED             |
| `xray_cloud_update_test_type`   | Update test type/steps on existing test       | ✅ FIXED             |

#### ⛔ Removed (XRay Server — do NOT use)

| Removed Tool | Use Instead |
|------|-------------|
| `xray_add_tests_to_test_exec` | `xray_cloud_create_execution` (includes testKeys) |
| `xray_search_test_cases` | `xray_cloud_search_tests` (JQL via GraphQL) |
| `xray_get_folder_tests` | `xray_cloud_search_tests` (JQL to filter by label/path) |

### XRay Cloud Configuration

```bash
# Required env vars for XRay Cloud tools (set in Koda → [e] env vars)
XRAY_CLOUD_CLIENT_ID=<from XRay Cloud Settings → API Keys>
XRAY_CLOUD_CLIENT_SECRET=<from XRay Cloud Settings → API Keys>
```

> Tools are **conditionally loaded** — they only appear when both env vars are set.
> Auth uses client credentials → bearer token, cached for 50min (tokens expire at ~1h).

### Link Type for Coverage

> ⚠️ **CRITICAL:** The link type is **"Test"** (SINGULAR). Using "Tests" (plural) returns a 404 error.
> **Both methods work:**

```yaml
# Method A: Jira REST (always works)
jira_link_issues:
  inwardTicketId: "TEST-KEY"      # the test case / test execution / task
  outwardTicketId: "STORY-KEY"    # the user story
  linkType: "Test"                # ← ALWAYS singular

# Method B: XRay Cloud tool (✅ FIXED 2026-07-02 — uses jira_link_issues internally)
xray_cloud_link_test_to_story:
  testKey: "TEST-KEY"
  storyKey: "STORY-KEY"
```

### Custom Fields Reference

> ⚠️ **POST-MIGRATION (2026-06-25):** Field IDs changed. The table below shows the **verified correct IDs** for `disneyexperiences.atlassian.net`. Old IDs (pre-migration) are noted where different.

| Field | Field ID | Old ID (pre-migration) | Values |
|-------|----------|------------------------|--------|
| Story Points | `customfield_10042` | `customfield_10003` | Number |
| Sprint | `customfield_10020` | `customfield_10803` | Sprint ID (number) |
| AI Assisted Effort | `customfield_10173` | `customfield_27200` | Number (default: `0.5`) |
| AI Usage Level | `customfield_10221` | `customfield_27201` | `{"value": "Medium"}` \| `{"value": "High"}` \| `{"value": "Low"}` |
| AI Tools Used | `customfield_10191` | `customfield_27202` | String (default: `"kiro"`) |
| Priority | `priority` | — | `{"id": "10008"}` (3 - Medium) — **REQUIRED for Test and Test Execution** |
| Test Repository Path | `customfield_20111` | (unchanged) | String (e.g., `/Passport - UI`) — ⚠️ not on edit screen |
| Epic Link | `customfield_13912` | (unchanged) | Epic issue key (e.g., `"PAS2-1"`) — ⚠️ not on edit screen |
| Platforms | `customfield_10176` | ~~`customfield_11500`~~ | Array of objects: `[{"value": "iOS"}, {"value": "Android"}]` — ✅ on edit screen |
| Test Environments | `customfield_20125` | (unchanged) | Array of strings: `["LATEST"]` — ⚠️ not on edit screen |
| Automation Candidate | `customfield_10154` | ~~`customfield_23001`~~ | `{"value": "Y"}` \| `{"value": "N"}` \| `{"value": "Requires Analysis"}` — ✅ on edit screen |
| Automation Status | `customfield_10190` | ~~`customfield_23002`~~ | `{"value": "Not Started"}` (only when Candidate = Y) — ✅ on edit screen |
| Server Environment | `customfield_11009` | (unchanged) | Array: `[{"value": "Latest"}]` — ⚠️ not on edit screen |

> **"⚠️ not on edit screen"** = These fields cannot be set via `jira_update_issue` (returns `Field cannot be set`). They can only be set via Xray Cloud API or manually in the UI.

### Priority Values (PAS2 project)

| ID | Name | Use for |
|----|------|---------|
| `10008` | 3 - Medium | Default for test cases |
| `10007` | 2 - High | Critical path tests |
| `10019` | 2 - Medium | Alternative medium |

> **Priority is REQUIRED** when creating Test or Test Execution issues via REST API. Omitting it causes a 400 error.

---

## Step 1: Analyze the User Story

```yaml
jira_get_issue:
  ticketId: "{STORY-KEY}"
  customFields: ["sprint", "storyPoints", "acceptanceCriteria"]
```

Identify:
- Acceptance Criteria (ACs) → positive test cases (field: `customfield_10166`)
- Business Rules (BRs) → validation test cases
- Negative scenarios → when applicable
- The story **assignee** (used to assign the QA task)
- The story **reporter** (used to assign test executions)

> ⚠️ ACs are NOT in the description — they live in the custom field `acceptanceCriteria` (`customfield_10166`). Always fetch with `customFields: ["acceptanceCriteria"]`.

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
# Search by keyword/summary (✅ FIXED 2026-07-02):
xray_cloud_search_tests:
  jql: 'project = PAS2 AND summary ~ "{keyword}"'
  limit: 20

# Check steps of a known test by key (✅ FIXED 2026-07-02):
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
4. Link to the new story with `linkType: "Test"`
5. Do **NOT** reopen closed tests — the test execution status is independent of the test case status

---

## Step 2: Create Test Cases

> ✅ **CURRENT STATUS (2026-07-02):** `xray_cloud_create_test` is OPERATIONAL for PAS2. Production credentials configured and verified.

> **IMPORTANT:** Test steps MUST go in the **Test Details** panel (Xray) as Manual steps or Cucumber/Gherkin — NOT as plain text in the description. The description is for context (objective, expected results) only.

### Primary Method: `xray_cloud_create_test` ✅ WORKING

> This is the correct and preferred method — it creates the Test issue AND adds steps to Xray Test Details in one call.

```yaml
xray_cloud_create_test:
  projectKey: "{PROJECT}"
  summary: "{See naming format below}"
  testType: "Manual"           # or "Cucumber"
  labels: ["{PROJECT_LABEL}"]
  steps:                        # These go into Xray Test Details panel
    - action: "{precondition or setup step}"
      data: "{test data if applicable}"
      result: "{expected state after setup}"
    - action: "{user action / trigger}"
      data: "{input data}"
      result: "{expected result / verification}"
  customFields:
    customfield_10176: [{"value": "iOS"}, {"value": "Android"}]
    customfield_10154: {"value": "Y"}
    customfield_10190: {"value": "Not Started"}
```

### Then set the description (context only — NO steps in description):

```yaml
jira_update_issue:
  ticketId: "{TEST_KEY}"
  description: |
    Test Case: {name}

    Type: {Positive|Negative} | Story: {STORY-KEY} - {Story Title}

    Objective:
    {what this test validates}

    Expected Results:
    - {expected result 1}
    - {expected result 2}
    - {expected result 3}
```

> ⚠️ **DO NOT put steps in the description.** Steps live in XRay Test Details only.
> ⚠️ **DO NOT use markdown tables** in descriptions — API v2 renders them as plain text. Use simple lists instead.

### Description content rules:

- **Include:** Test name, Type (Positive/Negative), Story reference, Objective, Expected Results (as bullet list)
- **Do NOT include:** Steps table, Automation Candidate info (that goes in custom fields)
- **Format:** Plain text with simple lists (no markdown headings, no tables)

### Set custom fields after creation:

```yaml
jira_update_issue:
  ticketId: "{TEST_KEY}"
  customFields:
    customfield_10154: {"value": "Y"}            # Automation Candidate
    customfield_10190: {"value": "Not Started"}  # Automation Status
    customfield_10176: [{"value": "iOS"}, {"value": "Android"}]  # Platforms
```

### Link each test to the story:

```yaml
# Option A: Jira REST (always works)
jira_link_issues:
  inwardTicketId: "{TEST_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"

# Option B: XRay Cloud tool (fixed 2026-07-02)
xray_cloud_link_test_to_story:
  testKey: "{TEST_KEY}"
  storyKey: "{STORY_KEY}"
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
| Automation Candidate | `customfield_10154` | `{"value": "Y"}` \| `{"value": "N"}` \| `{"value": "Requires Analysis"}` |
| Automation Status | `customfield_10190` | `{"value": "Not Started"}` (only if Candidate = Y) |

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
    customfield_10154: {"value": "Y"}
    customfield_10190: {"value": "Not Started"}
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

### Primary Method: `xray_cloud_create_execution` ✅ WORKING

> Creates the Test Execution in XRay Cloud AND associates all specified tests in one call via GraphQL.

```yaml
xray_cloud_create_execution:
  projectKey: "{PROJECT}"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | {Platform}"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
  environment: "LATEST"  # optional
```

> This resolves issue keys to numeric Jira IDs internally, then calls the GraphQL `createTestExecution` mutation.

#### Then link and assign:

```yaml
jira_link_issues:
  inwardTicketId: "{TEST_EXEC_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"

jira_assign_issue:
  ticketId: "{TEST_EXEC_KEY}"
  assignee: "{STORY_REPORTER_NAME}"
```

### Fallback Method: `jira_create_issue` + `xray_cloud_update_run`

> Use this if `xray_cloud_create_execution` fails for any reason.

#### Step 1: Create the Test Execution

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Test Execution"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | {Platform}"
  priority: "3 - Medium"
  labels: ["{PROJECT_LABEL}"]
  description: |
    Test Execution - {Platform}

    Story: {STORY-KEY} | Platform: {Platform} | Environment: LATEST

    Tests Included:
    1. {TEST-1} - {test 1 summary}
    2. {TEST-2} - {test 2 summary}
```

> ⚠️ **DO NOT use markdown tables** in descriptions — they render as broken text. Use numbered lists instead.

#### Step 2: Add tests to the execution via XRay

```yaml
xray_cloud_update_run:
  testExecutionKey: "{TEST_EXEC_KEY}"
  tests:
    - testKey: "{TEST-1}"
      status: "TODO"
    - testKey: "{TEST-2}"
      status: "TODO"
```

> This associates the tests in XRay's internal test run. Without this step, the Test Execution will appear empty in XRay even if tests are listed in the description.

#### Step 3: Link and assign

```yaml
jira_link_issues:
  inwardTicketId: "{TEST_EXEC_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"

jira_assign_issue:
  ticketId: "{TEST_EXEC_KEY}"
  assignee: "{STORY_REPORTER_NAME}"
```

### Mobile/Flutter Story — Two Test Executions:

Create **exactly 2** Test Executions per story — one for Android, one for iOS.

### Service/BE Story — Single Test Execution:

Create only **1 Test Execution** (no platform suffix in summary).

> **Rule:** Always assign Test Executions to the story's **reporter** (not the assignee).

### ⛔ Tools that do NOT work for adding tests to executions:

| Tool                             | Why it fails                                                             |
|----------------------------------|--------------------------------------------------------------------------|
| `xray_add_tests_to_test_exec`   | XRay Server tool — not supported on Cloud                                |

### ⚠️ Cannot remove tests from a Test Execution via API

There is NO tool to remove individual tests from a Test Execution. If you need to replace tests:
1. Create a **new** Test Execution with only the correct tests
2. Reject the old one with a comment explaining supersession
3. Do NOT mark old tests as ABORTED (they stay visible in the execution forever)

---

## Step 4: QA Metrics Evaluation Task

### Create:

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Task"
  summary: "{STORY-KEY} | {Story Title} | QA Metrics Evaluation | Test Case Creation"
  priority: "3 - Medium"
  labels: ["{PROJECT_LABEL}"]
  description: |
    QA Metrics Evaluation

    Test case creation for {STORY-KEY} using AI-assisted tooling.

    Context:
    - Story: {STORY-KEY}
    - Test Cases Created: {count}
    - Test Executions: {TEST_EXEC_ANDROID} (Android), {TEST_EXEC_IOS} (iOS)
    - Automation Candidates: {count Y} / {total}

    Test Cases:
    1. {TEST-1} - {summary} ({Type}, {AC ref})
    2. {TEST-2} - {summary} ({Type}, {AC ref})

    AI Metrics:
    - AI Assisted Effort: 0.5
    - AI Usage Level: Medium
    - AI Tools Used: kiro
```

> ⚠️ Use numbered lists — NOT markdown tables (they render as broken text via API v2).
> **Note:** `priority` is REQUIRED. AI metrics fields are set via `jira_update_issue` after creation.

### Link to the story:

```yaml
jira_link_issues:
  inwardTicketId: "{TASK_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"
```

### Assign to the story's assignee:

```yaml
jira_assign_issue:
  ticketId: "{TASK_KEY}"
  assignee: "{STORY_ASSIGNEE_USERNAME}"
```

### Assign story points and AI fields:

```yaml
jira_update_issue:
  ticketId: "{TASK_KEY}"
  customFields:
    customfield_10042: 1              # Story Points = 1 (post-migration ID)
    customfield_10173: 0.5            # AI Assisted Effort
    customfield_10221: {"value": "Medium"}  # AI Usage Level
    customfield_10191: "kiro"         # AI Tools Used
```

> **Note:** Sprint assignment is NOT required for tests, test executions, or QA tasks.

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
# ✅ FIXED 2026-07-02:
xray_cloud_search_tests:
  jql: 'issue in requirementTests("{STORY_KEY}")'
```

### Check test run status:

```yaml
# ✅ FIXED 2026-07-02:
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
| **Test** | is tested by | tests |
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

## Complete Example: PAS2-286 (Post-Migration)

**Story:** PAS2-286 — "DLR | TnP | Flutter | Photo Upload | Refactor UserPhotoInfo to Remove photoPath and Use fileName Instead"  
**Domain:** DLR | TnP | Flutter | Photo Upload  
**Date:** 2026-07-02 (final version)  
**Assignee:** Miriam Cabrera  
**Reporter:** Angelique Sta Maria  
**Method:** `xray_cloud_create_test` (production credentials operational)

### Test Cases Created (final — with XRay Test Details steps)

| Key | Test Case | Covers | Type | Automation | Steps |
|-----|-----------|--------|------|-----------|:-----:|
| PAS2-1141 | Photo upload succeeds using fileName identifier | AC.02 | Positive | Y — Not Started | 4 |
| PAS2-1143 | User photo displays correctly using fileName | AC.01 | Positive | Y — Not Started | 3 |
| PAS2-1144 | Upload fails gracefully with invalid fileName | Edge case | Negative | Y — Not Started | 3 |
| PAS2-1142 | Photo info persists across navigation using fileName | AC.03 | Positive | Y — Not Started | 4 |
| PAS2-1148 | photoPath fully removed from model with no remaining usages | AC.04 | Positive | Y — Not Started | 3 |
| PAS2-1147 | Full flow regression - take, upload, review, submit, change, delete | AC.05 | Positive | Y — Not Started | 6 |

### Test Executions (final)

| Key | Summary | Platform | Assigned to | Tests |
|-----|---------|----------|-------------|:-----:|
| PAS2-1145 | Latest \| PAS2-286 \| DLR \| TnP \| Flutter \| Photo Upload \| Refactor UserPhotoInfo... | Android | Angelique Sta Maria | 6 |
| PAS2-1146 | Latest \| PAS2-286 \| DLR \| TnP \| Flutter \| Photo Upload \| Refactor UserPhotoInfo... | iOS | Angelique Sta Maria | 6 |

### QA Metrics Task

| Key | Summary | SP | AI Effort | AI Level | AI Tool | Status |
|-----|---------|----|-----------|---------:|---------|--------|
| PAS2-1055 | PAS2-286 \| Refactor UserPhotoInfo... \| QA Metrics Evaluation \| Test Case Creation | 1 | 0.5 | Medium | kiro | In Progress |

### Rejected (superseded)

| Key | Reason |
|-----|--------|
| PAS2-1073, 1074, 1075, 1076 | Replaced by PAS2-1141–1148 (had no XRay steps, only description text) |
| PAS2-1077, 1078 | Replaced by PAS2-1145, 1146 (had ABORTED tests that couldn't be removed) |

### Lessons Learned (2026-07-02)

- `xray_cloud_create_test` ✅ works with production credentials — creates test + steps in one call
- `xray_cloud_update_run` with `status: "TODO"` is the way to associate tests to Test Executions
- `xray_cloud_search_tests` ✅ FIXED — use for JQL searches and coverage verification
- `xray_cloud_get_test_steps` ✅ FIXED — use to read existing test steps before deciding reuse vs create
- `xray_cloud_get_test_runs` ✅ FIXED — use to verify test execution status
- `xray_cloud_link_test_to_story` ✅ FIXED — alternative to `jira_link_issues` for test coverage links
- `xray_cloud_update_test_type` ✅ FIXED — resolves issueId via `getTests` query; uses `removeAllTestSteps` (returns String) + `addTestStep` (singular, per step); Gherkin uses `updateGherkinTestDefinition`
- `xray_cloud_create_execution` ✅ FIXED — switched from broken REST `/api/v2/import/execution` to GraphQL `createTestExecution` mutation; resolves issue keys to numeric Jira IDs via `JiraApiClient.fetchJiraTicket`
- Cannot remove tests from a Test Execution via API — must create new TE and reject old one
- DO NOT use markdown tables in descriptions — API v2 renders them as broken text. Use bullet/numbered lists
- DO NOT put steps in the description — they belong ONLY in XRay Test Details
- Description should contain: objective + expected results (simple list format)
- Always fetch ACs with `customFields: ["acceptanceCriteria"]` — they live in `customfield_10166`
- Transition name is "Reject" (not "Rejected") to move to Rejected status

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `404 - No issue link type with name 'Tests' found` | Wrong link type name | Use **"Test"** (singular) |
| `The priority selected is invalid` | Used `"Medium"` instead of the project-specific name | Use `{"id": "10008"}` or `{"name": "3 - Medium"}` |
| `issuetype: Specify a valid issue type` (Xray Cloud) | Xray Cloud API connected to wrong Jira instance (dev vs prod) | Use `jira_create_issue` directly instead of `xray_cloud_create_test` |
| `Field 'customfield_XXXXX' cannot be set` | Custom fields not on the create/edit screen for that issue type | Include info in description; or use Xray Cloud API (when fixed) |
| `data was not an array` for Story Points | Used old field ID `customfield_10003` (now an array-type field) | Use `customfield_10042` (the correct post-migration ID) |
| `Number value expected as the Sprint id` | Sprint ID passed as string or alias | Use field ID `customfield_10020: {NUMBER}` |
| Test not showing in Test Coverage | Not linked with `jira_link_issues` | Run link with `linkType: "Test"` |
| Task unassigned | Forgot to assign to story owner | Use `jira_assign_issue` with the story assignee's `accountId` |
| Story Points not set with `storyPoints` param | Field uses custom field ID | Use `customFields: {"customfield_10042": 1}` |
| Test Execution empty (no tests in Xray) | Tests created via `jira_create_issue` only — Xray Cloud doesn't sync them | List tests in description table; add via UI when Xray Cloud API is fixed |
| Only 1 Test Execution created | Forgot per-platform split (Mobile stories only) | For Mobile/Flutter stories, always create 2: one Android, one iOS |
| Description shows `h2.`, `h3.`, `||` as plain text | Used Jira wiki syntax instead of markdown | Always use markdown (`##`, `**bold**`, `| table |`) — the tool auto-converts to ADF |
| `xray_add_tests_to_test_exec` returns error | XRay Server tool — removed | Use `xray_cloud_create_execution` (when fixed) or list tests in description |
| `xray_cloud_create_test` returns "issuetype" error | API Key connected to `disneyexperiences-dev.atlassian.net` | Use `jira_create_issue` with `issuetype: {"id": "10017"}` and include steps in description |
| `You do not have permission to delete issues` | User lacks delete permission in PAS2 | Transition to "Rejected" (transition id: 131) with a comment explaining supersession |
| `issueId provided is not valid` (Xray GraphQL) | PAS2 test doesn't exist in Xray Cloud's connected Jira instance | Cannot use Xray GraphQL for PAS2 until API key is reconfigured |
| AI fields (`customfield_27200/27201/27202`) cannot be set | Old field IDs from pre-migration | Use new IDs: `customfield_10173` (effort), `customfield_10221` (level), `customfield_10191` (tools) |
| Description shows raw markdown (## headings, \| tables \| as text) | Used API v2 which saves markdown as plain text | Use **API v3** (`/rest/api/3/issue/{KEY}`) with native ADF JSON format for descriptions |
| `xray_cloud_update_test_type` returns "warnings" error | GraphQL query includes non-existent field `warnings` on type `Test` | ✅ FIXED (2026-07-02) — field removed from query |
| `xray_cloud_update_test_type` returns "issueId not valid" | Mutation expects numeric Jira ID, tool passes issue key | ✅ FIXED (2026-07-02) — tool resolves key to numeric ID via `getTests` query |
| `xray_cloud_link_test_to_story` returns "addTestToIssue" error | GraphQL mutation `addTestToIssue` does not exist in XRay Cloud schema | ✅ FIXED (2026-07-02) — tool now uses `jira_link_issues` internally |
| `xray_cloud_search_tests` returns $limit type error | GraphQL variable `$limit` declared as `Int` but position expects `Int!` | ✅ FIXED (2026-07-02) — type corrected to `Int!` |
| `xray_cloud_create_execution` returns "not valid Xray Format" | REST endpoint `/api/v2/import/execution` broken | ✅ FIXED (2026-07-02) — switched to GraphQL `createTestExecution` mutation |
| Tests added to TE but need to be removed | No API tool exists to remove tests from a Test Execution | Create new TE with correct tests, reject old TE |
| Description table renders as single line of pipes | Markdown tables not supported via API v2 `jira_update_issue` | Use numbered lists or bullet points instead of tables |
| Acceptance Criteria not visible in description | ACs stored in separate custom field | Fetch with `customFields: ["acceptanceCriteria"]` — field ID is `customfield_10166` |

---

## Execution Order (Summary)

> Updated 2026-07-02 — ALL XRay Cloud tools operational ✅

```
1.  jira_get_issue                       → Fetch story + identify assignee/reporter + ACs (use customFields: ["acceptanceCriteria"])
2.  Analyze ACs/BRs                      → Define required test cases + classify Positive/Negative
3.  Check existing tests                 → Search by summary keyword or linked issues
4.  Decide reuse vs create               → Reuse existing tests when possible, update if needed
5.  Group similar scenarios              → Identify tests that can be merged into parameterized steps
6.  xray_cloud_create_test ×N            → Create each Test with Manual steps in XRay Test Details
7.  jira_update_issue ×N                 → Set description (objective + expected results, NO steps, NO tables)
8.  jira_link_issues ×N                  → Link each test to story (linkType: "Test")
9.  xray_cloud_create_execution ×2       → Create Test Execution Android + iOS with tests linked (primary method)
10. jira_link_issues ×2                  → Link both executions to story
11. jira_assign_issue ×2                 → Assign executions to story's reporter
12. jira_create_issue (type: Task)       → Create QA Metrics Task (priority required)
13. jira_link_issues                     → Link Task to story (linkType: "Test")
14. jira_assign_issue                    → Assign Task to story's assignee
15. jira_update_issue                    → Set SP (10042) + AI fields (10173, 10221, 10191)
16. jira_transition_issue                → Move Task to "In Progress"
17. Verify links on story                → Confirm all tests, executions, task linked
```

---

## Migration Notes (Jira Server → Atlassian Cloud)

> **Date:** 2026-06-24  
> **Status:** ✅ Migration complete — **Jira Cloud operational, XRay Cloud API fully operational** (2026-07-02)

### What changed

| Area | Before (Jira Server) | After (Jira Cloud) |
|------|----------------------|---------------------|
| Jira URL | `myjira.disney.com` | `disneyexperiences.atlassian.net` |
| XRay API | `/rest/raven/2.0/*` (Server REST) | `xray.cloud.getxray.app` (separate API) |
| Auth (XRay) | Jira PAT | Client ID + Client Secret (bearer token) |
| Auth (Jira) | PAT (header) | Email + API Token (Basic auth) |

### XRay Cloud API Status (updated 2026-07-02)

> Production credentials (`XRAY_CLOUD_CLIENT_ID`/`SECRET`) now point to `disneyexperiences.atlassian.net` ✅

| Tool                             | Status          | Notes                                                                                                   |
|----------------------------------|:---------------:|---------------------------------------------------------------------------------------------------------|
| `xray_cloud_create_test`        | ✅ WORKING      | Creates test + adds Manual steps in one call                                                            |
| `xray_cloud_update_run`         | ✅ WORKING      | Associates tests to TEs + reports status                                                                |
| `xray_cloud_search_tests`       | ✅ FIXED        | GraphQL `$limit` type fix applied — returns JQL results correctly                                       |
| `xray_cloud_get_test_steps`     | ✅ FIXED        | GraphQL `$limit` type fix applied — returns manual steps correctly                                      |
| `xray_cloud_get_test_runs`      | ✅ FIXED        | GraphQL errors (executedBy, jira, $limit) all fixed — returns run history                               |
| `xray_cloud_link_test_to_story` | ✅ FIXED        | Mutation replaced — now uses `jira_link_issues` internally with linkType "Test"                         |
| `xray_cloud_create_execution`   | ✅ FIXED        | Switched from REST to GraphQL `createTestExecution` mutation; resolves keys to numeric IDs              |
| `xray_cloud_update_test_type`   | ✅ FIXED        | Uses `removeAllTestSteps` + `addTestStep` (singular); `updateGherkinTestDefinition` for Cucumber        |

### Working Workflow (2026-07-02)

| Step                           | Tool                                         | Works? |
|--------------------------------|----------------------------------------------|:------:|
| Create test with steps         | `xray_cloud_create_test`                     | ✅     |
| Set description                | `jira_update_issue`                          | ✅     |
| Link test to story             | `jira_link_issues` (linkType: "Test")        | ✅     |
| Link test to story (XRay)      | `xray_cloud_link_test_to_story`              | ✅     |
| Create Test Execution          | `xray_cloud_create_execution`                | ✅     |
| Create Test Execution (alt)    | `jira_create_issue` (type: Test Execution)   | ✅     |
| Add tests to TE                | `xray_cloud_update_run` (status: TODO)       | ✅     |
| Link TE to story               | `jira_link_issues` (linkType: "Test")        | ✅     |
| Assign issues                  | `jira_assign_issue`                          | ✅     |
| Transition issues              | `jira_transition_issue` (status: "Reject")   | ✅     |
| Search tests by JQL            | `xray_cloud_search_tests`                    | ✅     |
| Read test steps                | `xray_cloud_get_test_steps`                  | ✅     |
| Get test run history           | `xray_cloud_get_test_runs`                   | ✅     |
| Update test type/steps         | `xray_cloud_update_test_type`                | ✅     |

### Known limitations (updated 2026-07-02)

| Limitation                                                | Workaround                                                                 |
|-----------------------------------------------------------|----------------------------------------------------------------------------|
| Cannot remove tests from a Test Execution                 | Create new TE, reject old one                                              |
| No folder/repository browsing via API                     | Use labels and naming conventions                                          |
| Description tables render as plain text                   | Use numbered/bullet lists instead of markdown tables                       |
| Cannot delete issues (403 permission)                     | Transition to "Rejected" with comment explaining why                       |

### Custom Field IDs — Verified Mapping (2026-06-25)

| Field | Old ID (Server/Pre-migration) | New ID (Cloud/Post-migration) | On Edit Screen? | Verified via |
|-------|-------------------------------|-------------------------------|-----------------|--------------|
| Story Points | `customfield_10003` | `customfield_10042` | ✅ Task | editmeta on PAS2-1055 |
| Sprint | `customfield_10803` | `customfield_10020` | ✅ Task, Test | editmeta on PAS2-1055 |
| AI Assisted Effort | `customfield_27200` | `customfield_10173` | ✅ Task | editmeta on PAS2-1055 |
| AI Usage Level | `customfield_27201` | `customfield_10221` | ✅ Task | editmeta on PAS2-1055 |
| AI Tools Used | `customfield_27202` | `customfield_10191` | ✅ Task | editmeta on PAS2-1055 |
| Automation Candidate | `customfield_23001` | `customfield_10154` | ✅ Test | editmeta on PAS2-1073 |
| Automation Status | `customfield_23002` | `customfield_10190` | ✅ Test | editmeta on PAS2-1073 |
| Platforms | `customfield_11500` | `customfield_10176` | ✅ Test | editmeta on PAS2-1073 |
| Acceptance Criteria | — | `customfield_10166` | ✅ Story | PAS2-286 |

### Verification (updated 2026-07-02)

- [x] `jira_create_issue` works for issue type "Test" (id: 10017) with priority field ✅
- [x] `jira_create_issue` works for issue type "Test Execution" (id: 10020) ✅
- [x] `jira_link_issues` with linkType "Test" (singular) works on Cloud ✅
- [x] `jira_update_issue` works for Story Points (`customfield_10042`) ✅
- [x] `jira_update_issue` works for AI fields (`customfield_10173`, `10221`, `10191`) ✅
- [x] `jira_transition_issue` with status "Reject" → Rejected works ✅
- [x] `xray_cloud_create_test` ✅ WORKING — creates test + steps in XRay Test Details
- [x] `xray_cloud_update_run` ✅ WORKING — associates tests to TEs with TODO status
- [x] `xray_cloud_search_tests` ✅ FIXED — GraphQL $limit type mismatch resolved
- [x] `xray_cloud_get_test_steps` ✅ FIXED — GraphQL $limit type mismatch resolved
- [x] `xray_cloud_get_test_runs` ✅ FIXED — multiple GraphQL errors resolved
- [x] `xray_cloud_link_test_to_story` ✅ FIXED — uses jira_link_issues internally now
- [x] `xray_cloud_create_execution` ✅ FIXED — switched to GraphQL `createTestExecution` mutation (resolves keys → numeric IDs)
- [x] `xray_cloud_update_test_type` ✅ FIXED — `removeAllTestSteps` + `addTestStep` (singular) + `updateGherkinTestDefinition`


