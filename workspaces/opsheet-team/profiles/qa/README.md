# OpSheet QA Profile (Workspace Override)

Workspace-specific QA agents and context for the OpSheet team. These extend the shared
`profiles/qa/` profile with OpSheet-specific tooling and conventions.

## Workspace-Only Files

| Type    | File                             | Purpose                                                    |
|---------|----------------------------------|------------------------------------------------------------|
| Agent   | `test_case_generator_agent.json` | Generates Gherkin test cases from OPS testable tickets     |
| Prompt  | `test_case_generator_agent.md`   | Pipeline instructions for the test case generator          |
| Context | `jira_xray_conventions.md`       | Jira/Xray field mappings, link conventions, username resolution |
| Context | `test_case_format.md`            | Markdown template for local test case files                |

## Inherited from `profiles/qa/`

All other QA agents (orchestrator, test planner, test automation, defect analyst, API tester,
performance tester, coverage analyzer, etc.) and their context files are inherited from the shared
profile. Do not duplicate them here.

## Key Conventions

- **Xray API only** for test-to-execution association — no `jira_link_issues` between Test/Test
  Execution and testable tickets
- **`jira_get_myself`** for resolving the authenticated user's internal Jira username
- **Epic link** copied from testable ticket to Test Execution and Test tickets
- **Test Execution reuse**: searches for existing TE with `QA_GB_Internal` label before creating
- **Test Execution title**: `Globant Test for {ticketId}: {slug}`
- **One Gherkin scenario per Test ticket** (strict — never combine multiple scenarios)
- **Jira wiki markup** for description formatting (not literal `\n`)

## Usage

Invoke the test case generator directly with an OPS ticket ID:

```
Generate test cases for OPS-26880
```

The agent will fetch the ticket, resolve references, generate Gherkin scenarios, create Jira Test
tickets with Xray custom fields, and associate them to a Test Execution via the Xray API.

## Dependencies

- Jira MCP server with `jira_get_myself` and `xray_add_tests_to_test_exec` tools
- MyWiki MCP server for downloading referenced wiki pages
