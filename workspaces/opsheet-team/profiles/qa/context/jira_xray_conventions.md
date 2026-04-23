# Jira & Xray Conventions

## Resolving the Current User's Jira Username

The Jira API requires the internal username (e.g., `john.doe.-nd@disney.com`), not the display
name (e.g., "Doe, John"). Display names will be rejected with a 400 error.

To resolve the username:

1. Call `jira_get_myself` — it returns the authenticated user's internal username directly.
2. Use the `Username` field from the response as the assignee value.
3. Cache this value for the rest of the session.

## Issue Link Types

Available link types can be discovered via `jira_get_link_types`. Key ones for QA:

| Link Type | Inward (on target) | Outward (on source) | Usage                              |
|-----------|--------------------|---------------------|------------------------------------|
| Tests     | tested by          | tests               | Link Test ticket → Testable ticket |
| Defect    | created by         | created             | Link Bug → Source ticket           |
| Blocks    | is blocked by      | blocks              | Dependency blocking                |
| Relates   | relates to         | relates to          | General relationship               |

When linking a Test ticket to its testable Story/Improvement:

- Do NOT use `jira_link_issues` to create Jira-level links between Test tickets and testable
  tickets, or between Test Executions and testable tickets.
- The only association is via the Xray API (`xray_add_tests_to_test_exec`). Xray manages its own
  internal links when tests are registered in a Test Execution.

## Xray Custom Field IDs

When creating or updating Test tickets, set these fields via `customFields`:

| Field ID            | Name                 | Type          | Example Value                                              |
|---------------------|----------------------|---------------|------------------------------------------------------------|
| `customfield_20100` | Test Type            | Select object | `{"value": "Cucumber"}` or `{"value": "Manual"}`           |
| `customfield_20101` | Scenario Type        | Select object | `{"value": "Scenario"}` or `{"value": "Scenario Outline"}` |
| `customfield_20102` | Cucumber Scenario    | Plain text    | `"Given ...\nWhen ...\nThen ..."`                          |
| `customfield_20111` | Test Repository Path | Plain text    | `"/Globant TC/OPS-74/OPS-24611"`                           |

## One Scenario Per Test Ticket (strict)

Each Jira Test ticket must contain exactly ONE Gherkin scenario. This is a hard constraint — never
combine multiple scenarios into a single ticket.

- One `Scenario:` block per `customfield_20102` value. If you have 5 scenarios, you create 5 Test
  tickets.
- Do not use `Scenario Outline` as a way to pack multiple behaviors into one ticket. A Scenario
  Outline is only acceptable when it parameterizes the same single behavior with different data rows.
- If you find yourself writing more than one `Scenario:` keyword in a single `customfield_20102`
  value, stop — split into separate tickets.

## Test Execution Association (required)

Every Test ticket must be linked to a Test Execution. Test Executions use the `QA_GB_Internal` label
and are of issue type `Test Execution`.

To associate Test tickets with a Test Execution:

1. Search for existing Test Executions linked to the testable ticket:
   `issuetype = "Test Execution" AND issue in linkedIssues("{testableTicketId}") AND labels = QA_GB_Internal`
2. If exactly one is found, use it.
3. If multiple are found, ask the user to choose.
4. If none is found, create a new Test Execution with:
   - Labels: `QA_GB_Internal`, `QA_GB_Internal-IA`
   - Components: copied from the testable ticket
   - Epic Link: copied from the testable ticket (same epic as the testable ticket)
   - Summary: `"Globant Test for {testableTicketId}: {testable ticket slug}"`

Link each Test ticket to the Test Execution using only the Xray API — do NOT use `jira_link_issues`.

Register the tests via the Xray API using `xray_add_tests_to_test_exec`:
- `testExecKey`: the Test Execution ticket key
- `testKeys`: array of Test ticket keys to add

Issue links are not used — the Xray API call is the sole mechanism for tests to appear in the
Test Execution's Xray panel.

## Test Ticket Description Content

The Jira description field must contain only the user story, formatted in Jira wiki markup:

- Use `*bold:*` for labels (e.g., `*As an:*`, `*I want:*`, `*So that:*`)
- Use real newlines between lines — do NOT use literal `\n` characters
- Use `*Background:*` as a bold label followed by bullet points (`* Given ...`, `* And ...`)
- Optionally, a Background section with preconditions

All Gherkin scenarios (Given/When/Then) go exclusively into `customfield_20102`. Never put Gherkin
content in the description.
