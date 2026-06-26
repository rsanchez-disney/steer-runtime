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

| Tool | Purpose | Replaces |
|------|---------|----------|
| `xray_cloud_create_test` | Create test (Manual steps OR Cucumber/Gherkin + custom fields) | `jira_create_issue` for Tests |
| `xray_cloud_create_execution` | Create Test Execution with tests + custom fields in one call | `jira_create_issue` + `xray_add_tests_to_test_exec` |
| `xray_cloud_link_test_to_story` | Link test → story via XRay GraphQL | `jira_link_issues` with linkType "Test" |
| `xray_cloud_search_tests` | Search tests by JQL | `xray_search_test_cases` |
| `xray_cloud_update_run` | Report PASSED/FAILED results per test/step | (new capability) |
| `xray_cloud_get_test_runs` | Get execution results for a test | (new capability) |
| `xray_cloud_get_test_steps` | Read steps from an existing test | (new capability) |

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
> **Primary method:** Use `xray_cloud_link_test_to_story` which handles linking via GraphQL (no linkType needed).

```yaml
# Preferred (XRay Cloud):
xray_cloud_link_test_to_story:
  testKey: "TEST-KEY"
  storyKey: "STORY-KEY"

# Fallback (Jira REST):
jira_link_issues:
  inwardTicketId: "TEST-KEY"      # the test case / test execution / task
  outwardTicketId: "STORY-KEY"    # the user story
  linkType: "Test"                # ← ALWAYS singular
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
  customFields: ["sprint", "storyPoints"]
```

Identify:
- Acceptance Criteria (ACs) → positive test cases
- Business Rules (BRs) → validation test cases
- Negative scenarios → when applicable
- The story **assignee** (used to assign the QA task)
- The story **reporter** (used to assign test executions)

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
4. Link to the new story with `linkType: "Test"`
5. Do **NOT** reopen closed tests — the test execution status is independent of the test case status

---

## Step 2: Create Test Cases

> ⚠️ **CURRENT STATUS (2026-06-25):** `xray_cloud_create_test` is NOT operational for PAS2 (Xray Cloud API Key connected to wrong Jira instance). Use `jira_create_issue` to create the issue + **manually add steps in Xray Test Details** (or wait for API key fix).

> **IMPORTANT:** Test steps MUST go in the **Test Details** panel (Xray) as Manual steps or Cucumber/Gherkin — NOT as plain text in the description. The description is for context (objective, type, story reference) only.

### Preferred Method: `xray_cloud_create_test` (when API key is fixed)

> This is the correct method — it creates the Test issue AND adds steps to Xray Test Details in one call.

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

### Current Workaround: `jira_create_issue` + manual step entry

> ⚠️ Steps added this way go in the **description only** — they MUST be added to Xray Test Details manually (or via API when fixed).

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Test"
  summary: "{See naming format below}"
  priority: "3 - Medium"
  labels: ["{PROJECT_LABEL}"]
```

Then set the description via API v3 (ADF format) with:
- Objective
- Type (Positive/Negative)
- Story reference
- Steps table (for reference until they are added to Xray Test Details)
- Automation candidate info

### Description template (ADF — for context only, NOT a substitute for Xray steps):

The description provides context. The **actual test steps** must be in Xray Test Details panel.
Automation Candidate and Status go in **custom fields** (`customfield_10154`, `customfield_10190`), NOT in the description.

```
## Test Case: {name}
Type: Positive | Negative  |  Story: {STORY-KEY}

### Objective
{what this test validates}

### Steps (reference — pending Xray Test Details)
| # | Action | Data | Expected Result |
| 1 | ... | ... | ... |
```

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

> Use `xray_cloud_link_test_to_story` (preferred) or `jira_link_issues` (fallback).

```yaml
# Preferred — XRay Cloud GraphQL
xray_cloud_link_test_to_story:
  testKey: "{TEST_KEY}"
  storyKey: "{STORY_KEY}"

# Fallback — Jira REST (if XRay Cloud env vars not configured)
jira_link_issues:
  inwardTicketId: "{TEST_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"
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

> ⚠️ **CURRENT STATUS (2026-06-25):** `xray_cloud_create_execution` is NOT operational for PAS2. Use `jira_create_issue` as the primary method.

### Primary Method: Create Test Execution via `jira_create_issue`

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Test Execution"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | {Platform}"
  priority: "3 - Medium"
  labels: ["{PROJECT_LABEL}"]
  description: |
    ## Test Execution - {Platform}

    **Story:** {STORY-KEY}
    **Platform:** {Platform}
    **Environment:** LATEST

    ### Tests Included
    | # | Test Key | Summary |
    |---|----------|---------|
    | 1 | {TEST-1} | {test 1 summary} |
    | 2 | {TEST-2} | {test 2 summary} |
```

### Mobile/Flutter Story — Two Test Executions:

Create **exactly 2** Test Executions per story — one for Android, one for iOS.

### Service/BE Story — Single Test Execution:

Create only **1 Test Execution** (no platform suffix in summary).

### Link both to the story:

```yaml
jira_link_issues:
  inwardTicketId: "{TEST_EXEC_ANDROID_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"

jira_link_issues:
  inwardTicketId: "{TEST_EXEC_IOS_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"
```

### Assign both executions to the story's reporter:

```yaml
jira_assign_issue:
  ticketId: "{TEST_EXEC_ANDROID_KEY}"
  assignee: "{STORY_REPORTER_ACCOUNT_ID}"

jira_assign_issue:
  ticketId: "{TEST_EXEC_IOS_KEY}"
  assignee: "{STORY_REPORTER_ACCOUNT_ID}"
```

> **Rule:** Always assign Test Executions to the story's **reporter** (not the assignee).
> **Note:** On Jira Cloud, use `accountId` (not username) for assignments.

### Alternative: `xray_cloud_create_execution` (when API key is fixed)

> 🚫 **NOT CURRENTLY WORKING** for PAS2. When fixed, this creates the execution AND adds tests in one call:

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
    ## QA Metrics Evaluation

    Test case creation for {STORY-KEY} using AI-assisted tooling.

    ### Context
    | Field | Value |
    |-------|-------|
    | Story | {STORY-KEY} |
    | Test Cases Created | {count} |
    | Test Executions | {TEST_EXEC_ANDROID} (Android), {TEST_EXEC_IOS} (iOS) |
    | Automation Candidates | {count Y} / {total} |

    ### AI Metrics
    - **AI Assisted Effort:** 0.5
    - **AI Usage Level:** Medium
    - **AI Tools Used:** kiro
```

> **Note:** `priority` is REQUIRED. AI metrics fields are set via `jira_update_issue` after creation (they ARE on the edit screen for Task issue type).

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
**Date:** 2026-06-25  
**Assignee:** Alana Burgess  
**Reporter:** Angelique Sta Maria  
**Method:** `jira_create_issue` (Xray Cloud API not operational for PAS2)

### Test Cases Created

| Key | Test Case | Type | Automation |
|-----|-----------|------|-----------|
| PAS2-1073 | Photo upload succeeds using fileName identifier | Positive | Y — Not Started |
| PAS2-1074 | User photo displays correctly using fileName | Positive | Y — Not Started |
| PAS2-1075 | Upload fails gracefully with invalid fileName | Negative | Y — Not Started |
| PAS2-1076 | Photo info persists across navigation using fileName | Positive | Y — Not Started |

### Test Executions

| Key | Summary | Platform | Assigned to |
|-----|---------|----------|-------------|
| PAS2-1077 | Latest \| PAS2-286 \| DLR \| TnP \| Flutter \| Photo Upload \| Refactor UserPhotoInfo... | Android | Angelique Sta Maria |
| PAS2-1078 | Latest \| PAS2-286 \| DLR \| TnP \| Flutter \| Photo Upload \| Refactor UserPhotoInfo... | iOS | Angelique Sta Maria |

### QA Metrics Task

| Key | Summary | SP | AI Effort | AI Level | AI Tool | Status |
|-----|---------|----|-----------|---------:|---------|--------|
| PAS2-1055 | PAS2-286 \| Refactor UserPhotoInfo... \| QA Metrics Evaluation \| Test Case Creation | 1 | 0.5 | Medium | kiro | In Progress |

### Notes / Lessons Learned

- Story had **no formal ACs/BRs** — test cases derived from description (3 flows: display, upload, navigation)
- `xray_cloud_create_test` failed — Xray Cloud API Key connected to dev instance, not production
- Priority field (`"3 - Medium"`, id: `10008`) is **required** for Test and Test Execution creation
- Old tests (PAS2-1049 to PAS2-1052) and executions (PAS2-1053, PAS2-1054) transitioned to "Rejected"
- Cannot delete issues (403 permission denied) — reject with comment instead
- AI fields use new IDs: `customfield_10173` (effort), `customfield_10221` (level), `customfield_10191` (tools)
- Story Points use `customfield_10042` (not `customfield_10003`)
- Automation Candidate = `customfield_10154`, Automation Status = `customfield_10190`, Platforms = `customfield_10176`
- Assignments use `accountId` (not username) on Jira Cloud
- **API v2 saves markdown as plain text** — must use **API v3 with ADF JSON** for proper rendering
- ⚠️ **Pending:** Steps need to be added to Xray Test Details (Manual type) — requires correct API Key or manual entry in UI

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

---

## Execution Order (Summary)

> Updated 2026-06-25 — reflects `jira_create_issue` as primary method (Xray Cloud API not operational for PAS2)

```
1.  jira_get_issue                       → Fetch story + identify assignee/reporter
2.  Analyze ACs/BRs                      → Define required test cases + classify Positive/Negative
3.  Check existing tests                 → Search by summary keyword or linked issues
4.  Decide reuse vs create               → Reuse existing tests when possible, update if needed
5.  Group similar scenarios              → Identify tests that can be merged into parameterized steps
6.  jira_create_issue ×N (type: Test)    → Create each NEW Test (priority required, steps in description)
7.  PUT /rest/api/3/issue/{KEY}          → Set description with ADF (headings + table for steps)
8.  jira_link_issues ×N                  → Link each test to story (linkType: "Test")
9.  jira_create_issue ×2 (type: TE)     → Create Test Execution Android + iOS (priority required)
10. PUT /rest/api/3/issue/{KEY}          → Set description with ADF (test list table)
11. jira_link_issues ×2                  → Link both executions to story
12. jira_assign_issue ×2                 → Assign executions to story's reporter (accountId)
13. jira_create_issue (type: Task)       → Create QA Metrics Task (priority required)
14. PUT /rest/api/3/issue/{KEY}          → Set description with ADF (context + test case tables)
15. jira_link_issues                     → Link Task to story (linkType: "Test")
16. jira_assign_issue                    → Assign Task to story's assignee (accountId)
17. jira_update_issue                    → Set SP (10042) + AI fields (10173, 10221, 10191)
18. jira_transition_issue                → Move Task to "In Progress"
19. Verify links on story                → Confirm all tests, executions, task linked
```

---

## Migration Notes (Jira Server → Atlassian Cloud)

> **Date:** 2026-06-24  
> **Status:** ⚠️ Migration complete — **Jira Cloud operational, XRay Cloud API NOT operational for PAS2**

### What changed

| Area | Before (Jira Server) | After (Jira Cloud) |
|------|----------------------|---------------------|
| Jira URL | `myjira.disney.com` | `disneyexperiences.atlassian.net` |
| XRay API | `/rest/raven/2.0/*` (Server REST) | `xray.cloud.getxray.app` (separate API) |
| Auth (XRay) | Jira PAT | Client ID + Client Secret (bearer token) |
| Auth (Jira) | PAT (header) | Email + API Token (Basic auth) |

### ⚠️ CRITICAL: XRay Cloud API Instance Mismatch

> **Discovered 2026-06-25:** The XRay Cloud API Key (`XRAY_CLOUD_CLIENT_ID`/`SECRET`) is connected to `disneyexperiences-dev.atlassian.net` (dev instance), NOT to `disneyexperiences.atlassian.net` (production where PAS2 lives).

**Impact:**
- `xray_cloud_create_test` → ❌ FAILS with "issuetype: Specify a valid issue type"
- `xray_cloud_create_execution` → ❌ FAILS (same error)
- `xray_cloud_search_tests` → Returns 0 results for PAS2 (tests don't exist in dev)
- `xray_cloud_link_test_to_story` → ❌ FAILS ("issueId provided is not valid")
- `xray_cloud_get_test_steps` → Returns null for PAS2 tests

**Root cause:** The issue type "Test" has ID `10017` in production but `10005` in the dev instance. Xray Cloud tries to create the issue in its connected Jira instance (dev) where the mapping doesn't exist.

**Workaround (current):** Use `jira_create_issue` with Jira REST API directly (see Step 2 fallback approach). This IS the primary method until the API key is reconfigured.

**To fix:** Request a new XRay Cloud API Key from XRay Cloud Settings → API Keys on the **production** Jira instance (`disneyexperiences.atlassian.net`).

### Known limitations

| Limitation | Workaround |
|-----------|------------|
| XRay Cloud API points to wrong Jira instance | Use `jira_create_issue` for Test/Test Execution creation |
| No folder/repository browsing via API | Use labels and naming conventions |
| XRay-specific fields not on edit screen | Include info in description (markdown table format) |
| Custom fields not settable on Test issue type | Document in description; set manually in UI if needed |
| Cannot delete issues (403 permission) | Transition to "Rejected" with comment explaining why |

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

### Verification (updated 2026-06-25)

- [x] `jira_create_issue` works for issue type "Test" (id: 10017) with priority field ✅
- [x] `jira_create_issue` works for issue type "Test Execution" (id: 10020) ✅
- [x] `jira_link_issues` with linkType "Test" (singular) works on Cloud ✅
- [x] `jira_update_issue` works for Story Points (`customfield_10042`) ✅
- [x] `jira_update_issue` works for AI fields (`customfield_10173`, `10221`, `10191`) ✅
- [x] `jira_transition_issue` with transition id 131 → Rejected works ✅
- [ ] `xray_cloud_create_test` ❌ NOT WORKING (wrong Jira instance)
- [ ] `xray_cloud_create_execution` ❌ NOT WORKING (wrong Jira instance)
- [ ] `xray_cloud_link_test_to_story` ❌ NOT WORKING (wrong Jira instance)
- [ ] `xray_cloud_search_tests` ⚠️ WORKS but returns 0 results for PAS2


