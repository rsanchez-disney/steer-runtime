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
| Test Cases | Test (Cucumber) | 1 per testable AC/BR |
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

| Tool | Purpose |
|------|---------|
| `jira_get_issue` | Fetch user story details |
| `jira_create_issue` | Create Tests, Test Executions, Tasks |
| `jira_link_issues` | Link issues (test coverage) |
| `jira_assign_issue` | Assign issue to a user |
| `jira_update_issue` | Update fields (sprint, story points) |
| `xray_add_tests_to_test_exec` | Add tests to a Test Execution |
| `jira_transition_issue` | Change issue status |
| `xray_search_test_cases` | Verify coverage with JQL |
| `jira_get_link_types` | Query available link types |

### Link Type for Coverage

> ⚠️ **CRITICAL:** The link type is **"Tests"** (PLURAL). Using "Test" (singular) returns a 404 error.

```yaml
jira_link_issues:
  inwardTicketId: "TEST-KEY"      # the test case / test execution / task
  outwardTicketId: "STORY-KEY"    # the user story
  linkType: "Tests"               # ← ALWAYS plural
```

### XRay Custom Fields

| Field | Field ID | Values |
|-------|----------|--------|
| Test Type | `customfield_20100` | `{"value": "Cucumber"}` \| `{"value": "Manual"}` |
| Cucumber Test Type | `customfield_20101` | `{"value": "Scenario"}` \| `{"value": "Scenario Outline"}` |
| Cucumber Scenario | `customfield_20102` | Gherkin text (Given/When/Then) |
| Datasets | `customfield_22401` | JSON with params and values |
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

> ⚠️ **ALWAYS check the XRay Test Repository before creating new test cases.** Reuse existing tests when they cover the same functionality.

### Repository Folder Routing

| Story Type | Repository Folder | Folder ID |
|------------|-------------------|-----------|
| Mobile / Flutter / UI | `/Passport - UI` | 54273 |
| Services / Backend / API | `/Passport - BE` | 54293 |

### How to check

```yaml
xray_get_folder_tests:
  projectKey: "PAS2"
  folderId: "{FOLDER_ID}"   # 54273 for UI, 54293 for BE
  page: 1
  limit: 100
```

Scan the results for tests with similar summaries to the ACs you identified. Also search directly:

```yaml
xray_search_test_cases:
  jql: 'project = PAS2 AND summary ~ "{keyword}"'
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

### Create each test:

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Test"
  summary: "{See naming format below}"
  description: |
    h2. User Story
    {Narrative from the story — "As a..., I want..., So that..." if available, otherwise the description text}

    h2. Business Rules
    {Business rules from the story, if available. Use Jira wiki numbered list format: # rule}

    h2. Test Case
    *Summary:* {Brief description of what this test validates}

    *Expected Result:* {Clear and verifiable expected outcome}

    *Type:* {Positive / Negative}
  labels: ["{PROJECT_LABEL}"]
  customFields:
    customfield_20100: {"value": "Cucumber"}
    customfield_20101: {"value": "Scenario"}
    customfield_20102: |
      Given {precondition}
      When {user action}
      Then {expected result}
    customfield_20111: "{Test Repository Path}"
    customfield_13912: "{EPIC_KEY}"
    customfield_11500: [{"value": "iOS"}, {"value": "Android"}]
    customfield_20125: ["LATEST"]
    customfield_23001: {"value": "Y"}           # or "N" or "Requires Analysis"
    customfield_23002: {"value": "Not Started"}  # only if Candidate = Y
```

> **Description format notes:**
> - Use `h2.` for headings (Jira wiki format, NOT markdown `##`)
> - Include narrative/user story text from the parent story
> - Include business rules if the story has them
> - If the story has no formal narrative, use the description text
> - The "Business Rules" section is optional — omit if the story has none

### Link each test to the story:

```yaml
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
### Scenario Outline — Grouping Similar Test Cases
**Before creating individual test cases, look for scenarios that can be grouped** into a single Scenario Outline with an Examples table. This reduces redundancy and improves maintainability.

**When to group:**
- Multiple test cases validate the **same flow** with different inputs/conditions
- The Given/When/Then structure is identical, only the data changes
- Examples: different field validations, different states of the same element, different ticket types

**When NOT to group:**
- Tests have fundamentally different Given conditions or flows
- Grouping would make the scenario confusing or lose clarity
- Only 2 rows and the tests are conceptually different

**Examples table formatting rules:**
- The longest value in each column defines the column width
- All other values are padded with spaces to align the `|` pipes vertically
- Exactly 1 space after the longest value before the closing `|`
- All shorter values are padded to match that same `|` position

**Example (properly aligned):**

```gherkin
Given the guest views their entitlement in Tickets and Passes
And the condition is "<condition>"
When the CTA area is rendered
Then "<expected>"

Examples:
| condition                 | expected                              |
| eligible, no photo linked | Upload Photo CTA present and enabled  |
| feature toggled OFF       | Upload Photo CTA not present          |
| entitlement redeemed      | CTA visible but disabled (greyed out) |
| photo already linked      | Change Photo CTA displayed            |
```

**When grouping existing test cases:**
1. Pick one test case as the "survivor" — convert it to Scenario Outline
2. Add comment to redundant tests: "Merged into {KEY} as a Scenario Outline"
3. Transition redundant tests to "Reject"

**Custom fields for Scenario Outline:**

```yaml
customFields:
  customfield_20100: {"value": "Cucumber"}
  customfield_20101: {"value": "Scenario Outline"}
  customfield_20102: |
    Given {shared precondition}
    And the "<paramName>" is "<paramValue>"
    When {shared action}
    Then "<expected>"

    Examples:
    | paramName | paramValue | expected |
    | value1    | data1      | result1  |
    | value2    | data2      | result2  |
```

> **Note:** Use the Examples table directly in the Gherkin field (`customfield_20102`). Only use the Dataset field (`customfield_22401`) for complex cases with 3+ columns and 6+ rows.



## Step 3: Create Test Executions (per platform)

> **Rule:** If the story is a **Service/BE story** (title does NOT contain "Mobile" or "Flutter"), create only **1 Test Execution** (no platform split, no platform custom field). If it is a **Mobile/Flutter story**, create **exactly 2** — one for Android, one for iOS.

### Service/BE Story — Single Test Execution:

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Test Execution"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title}"
  labels: ["{PROJECT_LABEL}"]
  customFields:
    customfield_11009: [{"value": "Latest"}]
    customfield_10803: {SPRINT_ID}
```

### Mobile/Flutter Story — Two Test Executions:

Create **exactly 2** Test Executions per story — one for Android, one for iOS.

### Create Android Test Execution:

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
```

### Create iOS Test Execution:

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Test Execution"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | iOS"
  labels: ["{PROJECT_LABEL}"]
  customFields:
    customfield_11500: [{"value": "iOS"}]
    customfield_11009: [{"value": "Latest"}]
    customfield_10803: {SPRINT_ID}
```

### Link both to the story:

```yaml
jira_link_issues:
  inwardTicketId: "{TEST_EXEC_ANDROID_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Tests"

jira_link_issues:
  inwardTicketId: "{TEST_EXEC_IOS_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Tests"
```

### Add tests to both executions:

```yaml
xray_add_tests_to_test_exec:
  testExecKey: "{TEST_EXEC_ANDROID_KEY}"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]

xray_add_tests_to_test_exec:
  testExecKey: "{TEST_EXEC_IOS_KEY}"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
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

```yaml
xray_search_test_cases:
  jql: 'issue in requirementTests("{STORY_KEY}")'
```

### Verification checklist:

- [ ] All test cases appear in the Story's Test Coverage section
- [ ] Both Test Executions (Android + iOS) linked to the Story
- [ ] Tests added to both Test Executions
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
1.  jira_get_issue            → Fetch story + identify assignee + active sprint
2.  Analyze ACs/BRs           → Define required test cases + classify Positive/Negative
3.  Check repository          → xray_get_folder_tests (UI: 54273, BE: 54293) + xray_search_test_cases for existing coverage
4.  Decide reuse vs create    → Reuse existing tests when possible, update if needed
5.  Group similar scenarios   → Identify tests that can be merged into Scenario Outlines
6.  jira_create_issue ×N      → Create each NEW Test (Cucumber/Scenario Outline) with all custom fields
7.  jira_link_issues ×N       → Link each test (new + reused) to story (linkType: "Tests")
8.  jira_create_issue ×2      → Create Test Execution Android + iOS (with platform, server env, sprint)
9.  jira_link_issues ×2       → Link both Test Executions to story (linkType: "Tests")
10. xray_add_tests_to_test_exec ×2 → Add all tests to both executions
11. jira_create_issue         → Create QA Metrics Task (with AI fields)
12. jira_link_issues          → Link Task to story (linkType: "Tests")
13. jira_assign_issue         → Assign Task to story's assignee
14. jira_update_issue         → Set active sprint + 1 story point on Task
15. jira_transition_issue     → Move Task to "In Progress"
16. xray_search_test_cases    → Verify coverage with requirementTests()
```
