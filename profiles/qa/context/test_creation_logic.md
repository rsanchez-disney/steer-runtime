# Test Creation Logic

## Extracting Acceptance Criteria

Fetch the story with `jira_get_issue`. Extract ACs from:
- Dedicated "Acceptance Criteria" field
- Description section under "Acceptance Criteria" heading
- Given/When/Then blocks in description

If ACs are not in Given/When/Then format, convert them:
- Identify the precondition → Given
- Identify the action → When
- Identify the expected outcome → Then

If the story has no ACs → ask the user to provide them.

## Test Repository Discovery

Before generating TCs, understand how tests are organized in the project:

1. Extract from the story: project key, components, labels, epic link
2. Search for existing Test issues in the project:
   - `project = {PROJECT} AND issuetype in (Test, "Test Case") ORDER BY created DESC`
   - If story has components: `AND component = "{COMPONENT}"`
   - If story has epic: `AND "Epic Link" = {EPIC_KEY}`
3. Identify naming convention and grouping pattern
4. Present the structure to the user:

```
📁 {PROJECT} — Test Repository
├── 📁 {Group A} ({N} tests)
├── 📁 {Group B} ({N} tests)
└── 📁 {Group C} ({N} tests)
Story context: component={COMPONENT}, epic={EPIC}
```

## Existing Coverage Check

Before suggesting new TCs, check what already exists for this story:

1. Linked tests via XRay: `issue in linkedIssues("{STORY_KEY}") AND issuetype in (Test, "Test Case")`
2. Text match: `project = {PROJECT} AND issuetype in (Test, "Test Case") AND text ~ "{STORY_KEY}"`

If existing tests found → present them and identify which ACs are already covered. Only suggest new TCs for uncovered ACs.

## Generating Test Cases from ACs

For each **uncovered** AC, generate test cases covering:

| Type | Rule | Example |
|------|------|---------|
| Happy path | At least 1 per AC | User completes flow successfully |
| Edge case | Boundary values, empty states, max limits | 0 items, 99 items, special characters |
| Negative | Invalid input, unauthorized access, error states | Wrong password, expired session |

Minimum: 1 happy path + 1 edge case + 1 negative per AC (where applicable).

## Data-Driven Consolidation

Identify scenarios that share the same steps but differ only in input data. Present to user:

> "These scenarios share the same logic and differ only in data:
> - Scenario 3: {description}
> - Scenario 4: {description}
>
> Consolidate into one data-driven TC with a dataset? Or keep separate?"

If consolidated, use `{variable}` placeholders and a dataset table:

```
| variable_1 | variable_2 | expected_result |
|------------|------------|-----------------|
| value_a    | value_b    | outcome_1       |
```

## Priority Assignment

| Priority | Criteria |
|----------|----------|
| Critical | Blocks main user flow or causes data loss |
| High | Core functionality affected, no workaround |
| Medium | Feature works but degraded experience, workaround exists |
| Low | Cosmetic issues, edge cases with minimal user impact |

## Test Case Format

Each suggested TC must have:
- **Title:** Pattern: `{Area} | {Action} | {Expected Result}`
- **Steps:** Given/When/Then format
- **Type:** Happy path / Edge case / Negative
- **Priority:** Critical / High / Medium / Low
- **Linked AC:** Which acceptance criterion it covers

## Duplicate Detection

Search Jira for existing tests before suggesting creation:

```
jira_search_issues({
  jql: "project = {PROJECT} AND issuetype in (Test, \"Test Case\") AND summary ~ \"{keywords}\""
})
```

### Classification:
- **Duplicate** — existing test covers the exact same scenario → skip, suggest linking
- **Adapt** — similar scenario, needs parameter changes → flag for user
- **Related** — similar area but different validation → note but create new

## Creating in Jira

After user approves:

1. Ask user for issue type (Test, Sub-task, etc.)
2. Ask user where to place them (based on discovered test repository structure)
3. For each approved TC, run `jira_create_issue`:
   - `project`: same as the story
   - `issuetype`: user's choice
   - `summary`: TC title
   - `description`: steps in Given/When/Then format
   - `link`: "is tested by" → original story key
4. Print created key for each

## Output Tables

### Suggested TCs Table

| # | AC | Test Case | Type | Priority | Duplicate? |
|---|-----|-----------|------|----------|------------|
| 1 | AC1 | Verify calendar loads | Happy path | High | — |
| 2 | AC1 | Verify calendar with no dates | Edge case | Medium | ⚠️ COM-999 (adapt) |

### Created TCs Table

| # | Key | Summary | Linked to |
|---|-----|---------|-----------|
| 1 | COM-12345 | Verify calendar loads | COM-100 |
