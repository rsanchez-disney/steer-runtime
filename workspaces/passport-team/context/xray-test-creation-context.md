# XRay Test Creation Playbook

> Operational guide for creating Test Cases, Test Executions, and QA Metrics Tasks linked to user stories using Jira + XRay Cloud.

---

## Table of Contents

1. [Process Overview](#process-overview)
2. [Technical Configuration](#technical-configuration)
3. [Step 1: Analyze the User Story](#step-1-analyze-the-user-story)
4. [Step 2: Check Existing Tests](#step-2-check-existing-tests)
5. [Step 3: Create or Fix Test Cases](#step-3-create-or-fix-test-cases)
6. [Step 4: Create Test Executions](#step-4-create-test-executions)
7. [Step 5: QA Metrics Evaluation Task](#step-5-qa-metrics-evaluation-task)
8. [Step 6: Story Status Update](#step-6-story-status-update)
9. [Step 7: Final Verification](#step-7-final-verification)
10. [Step 8: Defect Creation (when needed)](#step-8-defect-creation-when-needed)
11. [Naming Conventions](#naming-conventions)
12. [Field Quick Reference](#field-quick-reference)
13. [Common Errors and Fixes](#common-errors-and-fixes)

---

## Process Overview

```
User Story → Analyze ACs → Check Existing Tests → Create/Fix Tests → Test Executions → QA Task → Story Update → Verify
```

### Decision Tree for Existing Stories

```
Story has linked tests?
├── YES → Check each test:
│   ├── Has XRay steps (Gherkin or Manual)? → KEEP, complete missing fields if needed
│   ├── No XRay steps (only description text)? → REJECT, create new with xray_cloud_create_test
│   └── Missing fields (Automation, Platforms)? → UPDATE via jira_update_issue
├── Has Test Executions?
│   ├── TEs contain valid tests? → KEEP
│   └── TEs contain rejected/broken tests? → REJECT TE, create new one with correct tests
├── Has QA Task?
│   ├── Task is up to date? → KEEP
│   └── Task references old/rejected keys? → UPDATE description with new keys
└── NO tests at all → Create everything from scratch (full flow)
```

### Artifacts per Story

| Artifact        | Jira Type      | Mobile/Flutter           | Services/BE              |
|-----------------|----------------|:------------------------:|:------------------------:|
| Test Cases      | Test           | 1 per testable AC/BR     | 1 per testable AC/BR     |
| Test Executions | Test Execution | 2 (one Android, one iOS) | 1 (no platform split)    |
| QA Metrics Task | Task           | 1 per story              | 1 per story              |

### Story Type Detection

| Story Type         | Detection Rule                                 | Test Repository Path                            | Test Executions        |
|--------------------|------------------------------------------------|-------------------------------------------------|------------------------|
| **Mobile/Flutter** | Title contains "Mobile" and/or "Flutter"       | `/Passport - UI` (auto-set via folder tool)     | 2 (Android + iOS)      |
| **Services (BE)**  | Title does NOT mention "Mobile" nor "Flutter"  | `/Passport - BE` (auto-set via folder tool)     | 1 (no platform split)  |

All artifacts are linked to the story with `linkType: "Test"`.

---

## Technical Configuration

### Available Tools

#### Jira Cloud (base tools)

| Tool                    | Purpose                              |
|-------------------------|--------------------------------------|
| `jira_get_issue`        | Fetch user story details             |
| `jira_create_issue`     | Create Tasks (QA Metrics)            |
| `jira_link_issues`      | Link issues (linkType: "Test")       |
| `jira_assign_issue`     | Assign issue to a user               |
| `jira_update_issue`     | Update fields (description, custom)  |
| `jira_transition_issue` | Change issue status                  |
| `jira_add_comment`      | Add comment to an issue              |

#### XRay Cloud (requires `XRAY_CLOUD_CLIENT_ID` + `XRAY_CLOUD_CLIENT_SECRET`)

| Tool                                 | Purpose                                    |
|--------------------------------------|--------------------------------------------|
| `xray_cloud_create_test`            | Create test with Gherkin/Manual steps      |
| `xray_cloud_create_execution`       | Create TE with tests linked (GraphQL)      |
| `xray_cloud_update_run`             | Associate tests to TE / report status      |
| `xray_cloud_search_tests`           | Search tests by JQL                        |
| `xray_cloud_get_test_steps`         | Read steps from an existing test           |
| `xray_cloud_get_test_runs`          | Get execution results for a test           |
| `xray_cloud_link_test_to_story`     | Link test → story (uses jira_link_issues)  |
| `xray_cloud_update_test_type`       | Update test type/steps on existing test    |
| `xray_cloud_get_test_datasets`      | Read dataset (parameterized data) from test |
| `xray_cloud_update_test_datasets`   | Create/update dataset iterations on test   |
| `xray_cloud_get_folders`            | List Test Repository folder tree           |
| `xray_cloud_move_tests_to_folder`   | Move tests to a repository folder          |

#### ⛔ Do NOT use (XRay Server tools — not supported on Cloud)

| Removed Tool                    | Use Instead                                                          |
|---------------------------------|----------------------------------------------------------------------|
| `xray_add_tests_to_test_exec`   | `xray_cloud_create_execution` (includes testKeys)                   |
| `xray_search_test_cases`        | `xray_cloud_search_tests` (JQL via GraphQL)                         |
| `xray_get_folder_tests`         | `xray_cloud_move_tests_to_folder` / `xray_cloud_search_tests`       |
| `xray_get_test_exec_tests`      | `xray_cloud_get_test_runs` (check runs per test)                    |
| `xray_get_test_case_full`       | `xray_cloud_get_test_steps` + `jira_get_issue`                      |

> **Note:** Cloud folder tools (`xray_cloud_get_folders`, `xray_cloud_move_tests_to_folder`) replace the need for Server-side folder operations.

### Critical Rules

1. **Link type is "Test" (SINGULAR)** — "Tests" (plural) returns 404
2. **Priority is REQUIRED** for Test and Test Execution creation — use `{"id": "10008"}` (3 - Medium) for standard tests, `{"id": "10007"}` (2 - High) for critical path tests
3. **DO NOT put steps in the description** — steps live ONLY in XRay Test Details
4. **DO NOT use markdown tables in descriptions** — API v2 renders them as plain text. Use bullet/numbered lists
5. **Test Executions are assigned to the QE who creates/executes them** — use `jira_assign_issue` after creation
6. **ACs live in `customfield_10166`** — always fetch with `customFields: ["acceptanceCriteria"]`
7. **Tests created with `jira_create_issue` have NO XRay steps** — always use `xray_cloud_create_test`
8. **`xray_cloud_get_test_steps` may return cached/stale data** — if in doubt, verify in UI
9. **Cannot remove tests from a Test Execution** — must create new TE and reject old one
10. **Label `PAS2_CQE` is REQUIRED on ALL artifacts** — Test Cases, Test Executions, and QA Tasks must all carry this label. For TEs created via `xray_cloud_create_execution`, set label via `jira_update_issue` after creation
11. **Sprint and Team are REQUIRED on Test Executions and QA Tasks** — propagate Sprint ID from the User Story; set Team based on story type (`"PAS2 | Mobile"` or `"PAS2 | Services"`)
12. **Task Type MUST be set to "Testing" on all QA Metrics Tasks** (`customfield_10160`)
13. **Test Cases and Test Executions MUST be assigned to the QE** (story assignee)
14. **Team field MUST be set on ALL artifacts** — Test Cases, Test Executions, and QA Tasks
15. **After all artifacts are created, transition the story to "In Testing"** and add QE comment
16. **Move all new tests to the correct repository folder after creation** — use `xray_cloud_move_tests_to_folder`

### XRay Cloud Configuration

```bash
# Required env vars (set in Koda → [e] env vars)
XRAY_CLOUD_CLIENT_ID=<from XRay Cloud Settings → API Keys>
XRAY_CLOUD_CLIENT_SECRET=<from XRay Cloud Settings → API Keys>
```

> Tools are conditionally loaded — they only appear when both env vars are set.
> Auth uses client credentials → bearer token, cached for 50min.

### Link Type for Coverage

```yaml
# Always use:
jira_link_issues:
  inwardTicketId: "TEST-KEY"      # the test case / test execution / task
  outwardTicketId: "STORY-KEY"    # the user story
  linkType: "Test"                # ← ALWAYS singular
```

### Custom Fields Reference (Post-Migration)

| Field                | Field ID            | Values                                                              | On Edit Screen?   |
|----------------------|---------------------|---------------------------------------------------------------------|:-----------------:|
| Story Points         | `customfield_10042` | Number                                                              | ✅ Task           |
| Sprint               | `customfield_10020` | Sprint ID (number) — propagate from Story                           | ✅ Task, TE       |
| Team                 | `customfield_10001` | `"PAS2 \| Mobile"` (FE/Flutter) or `"PAS2 \| Services"` (BE)       | ✅ Task, TE, Test |
| Task Type            | `customfield_10160` | `{"value": "Testing"}`                                              | ✅ Task           |
| AI Assisted Effort   | `customfield_10173` | Number (default: `0.5`)                                             | ✅ Task           |
| AI Usage Level       | `customfield_10221` | `{"value": "Medium"}` \| `{"value": "High"}` \| `{"value": "Low"}` | ✅ Task           |
| AI Tools Used        | `customfield_10191` | String (default: `"kiro"`)                                          | ✅ Task           |
| Platforms            | `customfield_10176` | `[{"value": "iOS"}, {"value": "Android"}]`                          | ✅ Test           |
| Automation Candidate | `customfield_10154` | `{"value": "Y"}` \| `{"value": "N"}` \| `{"value": "Requires Analysis"}` | ✅ Test     |
| Automation Status    | `customfield_10190` | `{"value": "Not Started"}` (only when Candidate = Y)               | ✅ Test           |
| Acceptance Criteria  | `customfield_10166` | Text (on Stories)                                                   | ✅ Story          |
| Priority             | `priority`          | `{"id": "10008"}` (3 - Medium) or `{"id": "10007"}` (2 - High)     | ✅ All            |
| Test Repository Path | `customfield_20111` | String (e.g., `/Passport - UI`)                                     | ⚠️ use xray_cloud_move_tests_to_folder |
| Epic Link            | `customfield_13912` | Epic issue key (e.g., `"PAS2-1"`)                                   | ⚠️ not editable  |
| Test Environments    | `customfield_20125` | Array of strings: `["LATEST"]`                                      | ⚠️ not editable  |

> **"⚠️ not editable"** = Cannot be set via `jira_update_issue`. Set via XRay Cloud API or manually.

### Priority Values (PAS2 project)

| ID      | Name       | Use for                                  |
|---------|------------|------------------------------------------|
| `10007` | 2 - High   | Critical path / core functionality tests |
| `10008` | 3 - Medium | Standard tests (default)                 |


---

## Step 1: Analyze the User Story

```yaml
jira_get_issue:
  ticketId: "{STORY-KEY}"
  customFields: ["acceptanceCriteria", "sprint", "storyPoints"]
  fields: ["summary", "status", "assignee", "reporter", "description", "labels", "issuelinks"]
```

Identify:
- **Acceptance Criteria** (from `customfield_10166`) → positive test cases
- **Business Rules** (from description) → validation test cases
- **Negative scenarios** → when error handling or validations exist
- **Story assignee** → used to assign QA Task, Test Cases, and Test Executions
- **Existing issue links** → check what artifacts already exist

### Coverage Criteria

| Type                      | Include                              |
|---------------------------|--------------------------------------|
| Happy path per AC         | ✅ Always                            |
| Negative / error handling | ✅ When validations exist            |
| Edge cases / boundaries   | ✅ When boundary conditions exist    |
| Feature toggle OFF        | ✅ If applicable                     |

Each test case must be **independent** (not depend on results of another).

---

## Step 2: Check Existing Tests

> ⚠️ **ALWAYS check for existing tests before creating new ones.**

### How to check

```yaml
# Search tests linked to story:
xray_cloud_search_tests:
  jql: 'issue in requirementTests("{STORY_KEY}")'

# Search by keyword:
xray_cloud_search_tests:
  jql: 'project = PAS2 AND summary ~ "{keyword}"'
  limit: 20
```

### Decision Criteria

| Scenario                                                         | Action                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------|
| Existing test has XRay steps AND covers the **same AC** exactly  | **REUSE** — link it to the new story                           |
| Existing test has XRay steps but is **similar/outdated**         | **REUSE and update** — update summary, description, Gherkin    |
| Existing test covers a **different story's AC** with same logic  | **REUSE** — link to both stories (test can cover multiple)     |
| Test has NO XRay steps (created with `jira_create_issue`)        | **REJECT** → create new with `xray_cloud_create_test`          |
| No existing test covers the AC                                   | **CREATE new**                                                 |

### When reusing an existing test

1. Update the summary to include the new story key (e.g., `PAS2-118 | ...`) if not already present
2. Update description with the new story's context if needed
3. If it was Manual and needs to be Cucumber, convert with `xray_cloud_update_test_type`
4. Link to the new story with `linkType: "Test"`
5. Do **NOT** reopen closed tests — the test execution status is independent of the test case status
6. Ensure Automation Candidate and Platforms fields are set

```yaml
# Link existing test to new story:
jira_link_issues:
  inwardTicketId: "{EXISTING_TEST_KEY}"
  outwardTicketId: "{NEW_STORY_KEY}"
  linkType: "Test"

# Update test type if needed (e.g., Manual → Cucumber):
xray_cloud_update_test_type:
  testKey: "{EXISTING_TEST_KEY}"
  testType: "Cucumber"
  gherkin: |
    Given {updated precondition}
    When {action}
    Then {expected result}
```

### When rejecting old tests:

```yaml
jira_transition_issue:
  ticketId: "{OLD_TEST_KEY}"
  status: "Reject"
  comment: "Superseded by {NEW_TEST_KEY}. Original had no XRay Test Details steps."
```

### When rejecting old Test Executions:

```yaml
jira_transition_issue:
  ticketId: "{OLD_TE_KEY}"
  status: "Reject"
  comment: "Superseded by {NEW_TE_KEY}. Old TE contained tests without XRay steps."
```

---

## Step 3: Create or Fix Test Cases

> ⚠️ **BEFORE creating test cases, ASK the user:** "Should the test cases be Cucumber (Gherkin Given/When/Then) or Manual (action/data/result steps)?"
> Do NOT assume one or the other — wait for the user's answer before proceeding.

### Creating new tests (primary and ONLY correct method):

```yaml
xray_cloud_create_test:
  projectKey: "{PROJECT}"
  summary: "{See naming conventions below}"
  testType: "Cucumber"
  labels: ["{PROJECT_LABEL}"]
  priority: {"id": "10008"}
  gherkin: |
    Given {precondition}
    And {additional context}
    When {action}
    Then {expected result}
    And {additional verification}
  customFields:
    customfield_10176: [{"value": "iOS"}, {"value": "Android"}]
    customfield_10154: {"value": "Y"}
    customfield_10190: {"value": "Not Started"}
```

For Manual test type:

```yaml
xray_cloud_create_test:
  projectKey: "{PROJECT}"
  summary: "{See naming conventions below}"
  testType: "Manual"
  labels: ["{PROJECT_LABEL}"]
  priority: {"id": "10008"}
  steps:
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

### Priority guidance:

- Use `{"id": "10007"}` (2 - High) for critical path / core functionality tests
- Use `{"id": "10008"}` (3 - Medium) for standard tests (default)

### Then set description (context only — NO steps):

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

### Then link to story:

```yaml
jira_link_issues:
  inwardTicketId: "{TEST_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"
```

### Assign to creator (QE):

```yaml
jira_assign_issue:
  ticketId: "{TEST_KEY}"
  assignee: "{STORY_ASSIGNEE}"
```

### Set Team field on test cases:

```yaml
jira_update_issue:
  ticketId: "{TEST_KEY}"
  customFields:
    customfield_10001: "{TEAM_VALUE}"
```

### Move tests to correct repository folder:

```yaml
xray_cloud_move_tests_to_folder:
  projectKey: "{PROJECT}"
  path: "{REPOSITORY_PATH}"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
```

Where `REPOSITORY_PATH` is `/Passport - UI` (mobile) or `/Passport - BE` (services).

### Test Case Classification

| Type         | Description                                        |
|--------------|----------------------------------------------------|
| **Positive** | Validates happy path / expected behavior           |
| **Negative** | Validates error handling / invalid inputs / OFF    |

### Automation Evaluation (per test case)

| Scenario                           | Automation Candidate  |
|------------------------------------|-----------------------|
| Critical flows, navigation, logic  | **Y**                 |
| Simple visual UI validation        | **N**                 |
| Complex integrations               | **Requires Analysis** |

Rules:
- If Y → set Automation Status: `Not Started`
- If N or Requires Analysis → leave Automation Status empty

```yaml
jira_update_issue:
  ticketId: "{TEST_KEY}"
  customFields:
    customfield_10154: {"value": "Y"}
    customfield_10190: {"value": "Not Started"}
```

### Scenario Outline — Grouping Similar Test Cases

**When to group:**
- Multiple test cases validate the **same flow** with different inputs/conditions
- The step structure is identical, only the data changes

**When NOT to group:**
- Tests have fundamentally different preconditions or flows
- Grouping would make the test confusing or lose clarity

**Example (grouped as one test with data variations):**

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
```

### Datasets for Cucumber (Scenario Outline) Test Cases

When a Cucumber test uses a **Scenario Outline** with `<placeholders>`, the data variations are stored as a **Dataset** in XRay — not in the Gherkin text itself.

#### When to use Datasets

| Scenario                                                  | Use Dataset? |
|-----------------------------------------------------------|:------------:|
| Scenario Outline with `Examples:` table (2+ rows of data) | ✅ Yes       |
| Single scenario with fixed data                           | ❌ No        |
| Manual test with varying data in steps                    | ❌ No (use `data` column in steps) |

#### Workflow: Create Cucumber test with Dataset

1. **Create the test** with Gherkin using `<placeholders>` (NO `Examples:` block — XRay manages those via Datasets):

```yaml
xray_cloud_create_test:
  projectKey: "PAS2"
  summary: "PAS2-200 | DLR | Mobile | Login | Validate credentials"
  testType: "Cucumber"
  labels: ["PAS2_CQE"]
  gherkin: |
    Scenario Outline: Validate user login with different credentials
    Given the user is on the login screen
    When the user enters "<username>" and "<password>"
    And taps the Login button
    Then the system displays "<expectedResult>"
  customFields:
    customfield_10176: [{"value": "iOS"}, {"value": "Android"}]
    customfield_10154: {"value": "Y"}
    customfield_10190: {"value": "Not Started"}
```

2. **Add the Dataset** with parameter values for each iteration:

```yaml
xray_cloud_update_test_datasets:
  testKey: "{TEST_KEY}"
  parameters: ["username", "password", "expectedResult"]
  values:
    - ["valid_user", "correct_pass", "Dashboard screen"]
    - ["valid_user", "wrong_pass", "Invalid credentials error"]
    - ["", "correct_pass", "Username required error"]
    - ["locked_user", "correct_pass", "Account locked message"]
  datasetName: "Login Credentials"
```

#### Reading existing Datasets

To inspect what data iterations exist on a test:

```yaml
xray_cloud_get_test_datasets:
  testKey: "{TEST_KEY}"
```

Returns a table with parameters (columns) and values (rows/iterations).

#### Dataset Rules

- Parameter names in the dataset must **exactly match** the `<placeholder>` names in the Gherkin
- Each row in `values` must have the **same number of elements** as `parameters`
- When updating a dataset, the **entire dataset is replaced** — always provide all rows
- One test can have multiple datasets (use different `datasetName` values), but typically one is enough
- Datasets only apply to **Cucumber** test type — Manual tests use the `data` column in steps instead

---

## Step 4: Create Test Executions

### Primary Method: `xray_cloud_create_execution`

> Creates the Test Execution in XRay Cloud AND associates all specified tests in one call.

#### Mobile/Flutter stories — 2 TEs:

```yaml
xray_cloud_create_execution:
  projectKey: "{PROJECT}"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | Android"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
  environment: "LATEST"

xray_cloud_create_execution:
  projectKey: "{PROJECT}"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | iOS"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
  environment: "LATEST"
```

#### Service/BE stories — 1 TE (no platform suffix):

```yaml
xray_cloud_create_execution:
  projectKey: "{PROJECT}"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title}"
  testKeys: ["{TEST-1}", "{TEST-2}", "{TEST-3}"]
  environment: "LATEST"
```

#### Then link to story:

```yaml
jira_link_issues:
  inwardTicketId: "{TE_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"
```

#### Then set Sprint, Team, and Label:

> `xray_cloud_create_execution` does not support `labels`, `Sprint`, or `Team` params — set them via `jira_update_issue` immediately after creation.

```yaml
jira_update_issue:
  ticketId: "{TE_KEY}"
  labels: ["PAS2_CQE"]
  customFields:
    customfield_10020: {SPRINT_ID}
    customfield_10001: "{TEAM_VALUE}"
```

Where:
- `{SPRINT_ID}` = Sprint ID number from the User Story
- `{TEAM_VALUE}` = `"PAS2 | Mobile"` or `"PAS2 | Services"` based on story type

#### Assign to QE (creator/executor):

```yaml
jira_assign_issue:
  ticketId: "{TE_KEY}"
  assignee: "{STORY_ASSIGNEE}"
```

### Fallback Method (if `xray_cloud_create_execution` fails):

1. Create with `jira_create_issue`:

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Test Execution"
  summary: "Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | {Platform}"
  priority: "3 - Medium"
  labels: ["{PROJECT_LABEL}"]
  description: |
    Test Execution

    Story: {STORY-KEY} | Environment: LATEST

    Tests Included:
    1. {TEST-1} - {summary}
    2. {TEST-2} - {summary}
```

2. Add tests via XRay:

```yaml
xray_cloud_update_run:
  testExecutionKey: "{TE_KEY}"
  tests:
    - testKey: "{TEST-1}"
      status: "TODO"
    - testKey: "{TEST-2}"
      status: "TODO"
```

3. Link to story with `jira_link_issues`

### Cannot remove tests from a Test Execution

There is NO API to remove individual tests from a TE. If you need to replace tests:
1. Create a **new** TE with only the correct tests
2. Reject the old one with a comment explaining supersession

---

## Step 5: QA Metrics Evaluation Task

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
    - Test Executions: {TE_ANDROID} (Android), {TE_IOS} (iOS)
    - Automation Candidates: {count Y} / {total}

    Test Cases:
    1. {TEST-1} - {summary} ({Type}, {AC ref})
    2. {TEST-2} - {summary} ({Type}, {AC ref})

    AI Metrics:
    - AI Assisted Effort: 0.5
    - AI Usage Level: Medium
    - AI Tools Used: kiro
```

### Link to story:

```yaml
jira_link_issues:
  inwardTicketId: "{TASK_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Test"
```

### Assign to story's assignee:

```yaml
jira_assign_issue:
  ticketId: "{TASK_KEY}"
  assignee: "{STORY_ASSIGNEE}"
```

### Set story points, AI fields, Sprint, Team, and Task Type:

> **Sprint** is propagated from the User Story (`customfield_10020`). **Team** depends on story type:
> - Mobile/Flutter → `"PAS2 | Mobile"`
> - Services/BE → `"PAS2 | Services"`

```yaml
jira_update_issue:
  ticketId: "{TASK_KEY}"
  customFields:
    customfield_10042: 1
    customfield_10020: {SPRINT_ID}
    customfield_10001: "{TEAM_VALUE}"
    customfield_10160: {"value": "Testing"}
    customfield_10173: 0.5
    customfield_10221: {"value": "Medium"}
    customfield_10191: "kiro"
```

Where:
- `{SPRINT_ID}` = Sprint ID number from the User Story (fetched in Step 1)
- `{TEAM_VALUE}` = `"PAS2 | Mobile"` or `"PAS2 | Services"` based on story type detection

### Transition to In Progress:

```yaml
jira_transition_issue:
  ticketId: "{TASK_KEY}"
  status: "In Progress"
```

### Updating an existing QA Task:

If the task already exists but references old/rejected test keys:
1. Reopen (transition from Closed → "In Progress")
2. Update description with new test keys and TE keys
3. Ensure AI fields and SP are still set

---

## Step 6: Story Status Update

> After all artifacts (Test Cases, Test Executions, QA Task) are created and linked, transition the story to "In Testing" and add a summary comment.

### Transition story:

```yaml
jira_transition_issue:
  ticketId: "{STORY_KEY}"
  status: "In Testing"
```

### Add QE coverage comment:

```yaml
jira_add_comment:
  ticketId: "{STORY_KEY}"
  comment: |
    QE Coverage Complete:
    - Test Cases: {TEST_KEYS_LIST}
    - Test Executions: {TE_KEYS_LIST}
    - Automation Candidates: {count_Y}/{total}
    All artifacts linked and ready for execution.
```

---

## Step 7: Final Verification

### Checklist:

- [ ] All ACs/BRs have corresponding test cases with XRay steps
- [ ] All test cases linked to story (appear in Test Coverage)
- [ ] Each test has: Automation Candidate, Platforms, description with objective
- [ ] Cucumber Scenario Outline tests have datasets with all iterations defined
- [ ] Test Cases assigned to QE (creator)
- [ ] Test Cases have Team field set
- [ ] Tests moved to correct repository folder (Passport - UI or Passport - BE)
- [ ] Test Executions linked to story and contain all tests
- [ ] Test Executions have: label `PAS2_CQE`, Sprint (from story), Team (`PAS2 | Mobile` or `PAS2 | Services`)
- [ ] Test Executions assigned to QE (creator/executor)
- [ ] QA Metrics Task created, linked, assigned to story assignee, In Progress
- [ ] QA Metrics Task has: label `PAS2_CQE`, Sprint (from story), Team, Story Points, AI fields
- [ ] QA Task has Task Type = Testing
- [ ] All artifacts carry label `PAS2_CQE`
- [ ] Old/broken tests rejected with comment explaining supersession
- [ ] Story transitioned to In Testing
- [ ] QE Comment added to story
- [ ] Summary: X test cases, Y executions, 1 task

### Verify coverage:

```yaml
xray_cloud_search_tests:
  jql: 'issue in requirementTests("{STORY_KEY}")'
```

### Verify test runs:

```yaml
xray_cloud_get_test_runs:
  testKey: "{TEST_KEY}"
  limit: 5
```

---

## Step 8: Defect Creation (when needed)

> Use this template when a defect is discovered during test execution.

### Create defect:

```yaml
jira_create_issue:
  projectKey: "{PROJECT}"
  issueType: "Bug"
  summary: "{STORY-KEY} | {DOMAIN} | {Platform} | {Short defect description}"
  priority: "2 - High"
  labels: ["{PROJECT_LABEL}"]
  description: |
    Defect Report

    Story: {STORY-KEY} - {Story Title}
    Platform: {iOS/Android/API}
    Build: {build version}
    Environment: {LATEST/STAGE}

    Steps to Reproduce:
    1. {step 1}
    2. {step 2}
    3. {step 3}

    Actual Result:
    {what actually happened}

    Expected Result:
    {what should have happened}

    Evidence:
    {screenshots/videos attached}
```

### Set Team field:

```yaml
jira_update_issue:
  ticketId: "{BUG_KEY}"
  customFields:
    customfield_10001: "{TEAM_VALUE}"
```

### Link to story:

```yaml
jira_link_issues:
  inwardTicketId: "{BUG_KEY}"
  outwardTicketId: "{STORY_KEY}"
  linkType: "Defect"
```

### Assign to Angelique for review:

```yaml
jira_assign_issue:
  ticketId: "{BUG_KEY}"
  assignee: "angelique"
```

---

## Naming Conventions

### Test Cases

```
{STORY-KEY} | {DOMAIN} | {AREA} | {Feature} | {Test Case Name}
```

**Example:**
```
PAS2-17 | DLR | TnP | Flutter | Photo Display | Guest photo displayed when linked
```

### Test Executions

```
Latest | {STORY-KEY} | {DOMAIN} | {AREA} | {Story Title} | {Platform}
```

**Examples:**
```
Latest | PAS2-17 | DLR | TnP | Flutter | Photo Display | Readback of Photo | Android
Latest | PAS2-17 | DLR | TnP | Flutter | Photo Display | Readback of Photo | iOS
```

### QA Metrics Task

```
{STORY-KEY} | {Story Title} | QA Metrics Evaluation | Test Case Creation
```

### Defects

```
{STORY-KEY} | {DOMAIN} | {Platform} | {Short defect description}
```

---

## Field Quick Reference

### PAS2 Project

| Variant        | Label       | Team                | Repository Path  | Epic Key | Platforms    | Test Environment | Test Executions   |
|----------------|-------------|---------------------|------------------|----------|:------------:|:----------------:|:-----------------:|
| Mobile/Flutter | `PAS2_CQE`  | `PAS2 \| Mobile`   | `/Passport - UI` | `PAS2-1` | iOS, Android | LATEST           | 2 (Android + iOS) |
| Services/BE    | `PAS2_CQE`  | `PAS2 \| Services` | `/Passport - BE` | `PAS2-1` | N/A          | LATEST           | 1                 |

> **`{PROJECT_LABEL}`** in templates always resolves to `PAS2_CQE` for this project.

### Available Link Types

| Link Type    | Inward             | Outward        |
|--------------|--------------------|----------------|
| **Test**     | is tested by       | tests          |
| Blocks       | is blocked by      | blocks         |
| Defect       | created by         | created        |
| Dependency   | is dependent upon  | dependency of  |
| Relates      | relates to         | relates to     |
| Implementers | is implemented by  | implements     |
| Duplicate    | is duplicated by   | duplicates     |
| Cloners      | is cloned by       | clones         |

---

## Common Errors and Fixes

| Error                                            | Cause                                    | Fix                                                     |
|--------------------------------------------------|------------------------------------------|---------------------------------------------------------|
| `404 - No issue link type 'Tests' found`         | Wrong link type name                     | Use **"Test"** (singular)                               |
| `The priority selected is invalid`               | Wrong priority name                      | Use `{"id": "10008"}` or `"3 - Medium"`                 |
| `Field cannot be set`                            | Field not on edit screen for issue type  | Set during creation via XRay API, or leave for manual   |
| `data was not an array` for Story Points         | Old field ID `customfield_10003`         | Use `customfield_10042`                                 |
| `Number value expected as the Sprint id`         | Sprint ID passed as string               | Use `customfield_10020: {NUMBER}`                       |
| Test not showing in Test Coverage                | Not linked with `jira_link_issues`       | Run link with `linkType: "Test"`                        |
| Test Execution empty in XRay                     | Tests created with `jira_create_issue`   | Use `xray_cloud_create_execution` with testKeys         |
| Description shows raw markdown                   | API v2 stores as plain text              | Use bullet/numbered lists, no tables, no headings       |
| Cannot remove tests from TE                      | No API for removal                       | Create new TE with correct tests, reject old one        |
| Cannot delete issues (403)                       | No delete permission in PAS2             | Transition to "Rejected" with comment                   |
| AI fields not setting                            | Old field IDs (pre-migration)            | Use `10173` (effort), `10221` (level), `10191` (tools)  |
| `xray_cloud_create_test` returns "issuetype" error | Wrong Jira instance                   | Verify XRAY_CLOUD_CLIENT_ID points to prod              |
| `xray_cloud_get_test_steps` returns stale data   | GraphQL cache or test not synced         | Verify steps in Jira UI directly                        |
| Test created but no steps visible in UI          | Created with `jira_create_issue`         | Must use `xray_cloud_create_test` — reject and recreate |

---

## Execution Order (Summary)

```
1.  jira_get_issue                            → Fetch story + ACs + assignee + Sprint + existing links
2.  Analyze ACs/BRs                           → Define required test cases + classify Positive/Negative
3.  Check existing tests                      → Search linked tests, determine reuse vs reject vs create
4.  Reject broken tests/TEs                   → Transition to "Reject" with comment
5.  Group similar scenarios                   → Identify tests that can use parameterized steps / Scenario Outlines
6.  xray_cloud_create_test ×N                 → Create each test with Cucumber/Manual steps
7.  xray_cloud_update_test_datasets ×N        → Add datasets for Cucumber Scenario Outline tests (if applicable)
8.  jira_update_issue ×N                      → Set description (objective + expected results, NO steps, NO tables)
9.  jira_link_issues ×N                       → Link each test to story (linkType: "Test")
10. jira_assign_issue ×N                      → Assign test cases to QE (story assignee)
11. jira_update_issue ×N                      → Set Team field on test cases
12. xray_cloud_move_tests_to_folder           → Move tests to correct repository folder
13. xray_cloud_create_execution ×2            → Create TEs with all tests (Android + iOS for mobile)
14. jira_update_issue ×2                      → Set label (PAS2_CQE), Sprint, and Team on each TE
15. jira_assign_issue ×2                      → Assign TEs to QE (story assignee)
16. jira_link_issues ×2                       → Link TEs to story
17. jira_create_issue (Task)                  → Create QA Metrics Task (priority + label required)
18. jira_link_issues                          → Link Task to story
19. jira_assign_issue                         → Assign Task to story's assignee
20. jira_update_issue                         → Set SP + Sprint + Team + Task Type + AI fields
21. jira_transition_issue                     → Move Task to "In Progress"
22. jira_transition_issue                     → Transition story to "In Testing"
23. jira_add_comment                          → Add QE coverage comment to story
24. Verify                                    → Confirm all links, coverage, and completeness
```

---

## Known Limitations

| Limitation                                            | Workaround                                          |
|-------------------------------------------------------|-----------------------------------------------------|
| Cannot remove tests from a Test Execution             | Create new TE, reject old one                       |
| Cannot delete issues (403 permission)                 | Transition to "Rejected" with comment               |
| Description tables render as plain text (API v2)      | Use numbered/bullet lists instead                   |
| `xray_cloud_get_test_steps` may return cached data    | Verify in UI when uncertain                         |
| Tests created with `jira_create_issue` have no steps  | Always use `xray_cloud_create_test`                 |
| Test Repository Path not directly editable via field  | Use `xray_cloud_move_tests_to_folder` to set path   |
