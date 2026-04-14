# qTest Guidelines

Context for QA agents working with the qTest MCP integration.

## qTest Project Structure

qTest organizes test management in a hierarchy:

- **Project** — Top-level container. All entities belong to a project.
  - **Requirements** — Traceable requirements organized in a tree. Link to test cases for coverage.
  - **Test Cases** — Reusable test definitions with steps and expected results.
  - **Test Cycles** — Logical execution groupings (e.g., "Sprint 5 Regression"). Contains test suites.
    - **Test Suites** — Organize test runs within a cycle by feature area or priority.
      - **Test Runs** — Individual execution instances of a test case. Carry pass/fail status.
  - **Defects** — Bugs linked to failed test runs for traceability.

## Test Case Lifecycle

1. **Draft** — Initial creation. Author writes name, description, precondition, and test steps.
2. **Approved** — Reviewed and ready for execution.
3. **In Use** — Linked to one or more test runs.

Each test case contains:
- **Name** — Short descriptive title
- **Description** — What the test validates
- **Precondition** — Setup required before execution
- **Test Steps** — Ordered list, each with a description and expected result

## Test Execution Workflow

1. **Create a test cycle** — Name it after the sprint or release (e.g., "Sprint 12 Regression").
2. **Create test suites** — Group by feature area within the cycle (e.g., "Payment Flow", "User Auth").
3. **Create test runs** — Instantiate from existing test cases into a test suite.
4. **Execute and submit results** — Mark each test run as `passed`, `failed`, `blocked`, or `incomplete`. Add notes for context.

## Requirement Traceability

- Requirements can be linked to test cases via `qtest_link_requirement`.
- Use this to track coverage: every requirement should have at least one linked test case.
- Query linked test cases with `qtest_get_requirement` to verify coverage gaps.

## Available qTest MCP Tools

For the full tool reference with parameters and usage details, see the [qTest MCP README](../../.kiro/tools/mcp-servers/qtest-mcp/README.md).

**Quick reference of available tools:**
- `qtest_get_projects` / `qtest_get_project` — Project listing and details
- `qtest_get_test_case` / `qtest_create_test_case` / `qtest_update_test_case` / `qtest_search_test_cases` — Test case CRUD and search
- `qtest_get_test_run` / `qtest_create_test_run` / `qtest_update_test_run_result` — Test run management and result submission
- `qtest_get_test_cycles` / `qtest_create_test_cycle` / `qtest_get_test_suites` / `qtest_create_test_suite` — Cycle and suite management
- `qtest_get_requirements` / `qtest_get_requirement` / `qtest_link_requirement` / `qtest_create_requirement` — Requirement management and traceability
- `qtest_get_defects` / `qtest_link_defect` / `qtest_submit_defect` — Defect tracking

All tools accept an optional `outputDir` parameter. Default: `/tmp/qtest-mcp/`. Set to `false` or `null` to skip file saving.

All tools that require a `projectId` accept it as an optional parameter. If omitted, the `QTEST_PROJECT_ID` environment variable is used. If neither is set, the tool returns an error.

The base URL defaults to `https://qtest.disney.com`. Override with `QTEST_BASE_URL` env var if using a different instance.

## Best Practices

### Naming Conventions
- **Requirements imported from Jira**: Always prefix with the Jira key — `FNB-18957: Identity reintegration to prepare for OneID SDK v5`. Format: `{JIRA-KEY}: {Summary}`
- **Test cycles**: Use sprint or release context — `Sprint 12 Regression`, `Release 3.2 Smoke`, `Hotfix 3.2.1 Validation`
- **Test suites**: Organize by feature area — `Payment Processing`, `User Authentication`, `Cart Management`
- **Test cases**: Start with action verb — `Verify login with valid credentials`, `Validate cart total calculation`

### Organization
- One test cycle per sprint or release
- Group test suites by feature area within each cycle
- Keep test cases atomic — one scenario per test case
- Reuse test cases across cycles via test runs

### Defect Linking
- Always link defects to the failed test run that discovered them
- Use `qtest_submit_defect` to create and link in one step
- Include reproduction steps in the defect description
- Reference the test run ID in defect summaries for traceability

### Requirement Traceability
- Link every test case to at least one requirement
- Review unlinked requirements regularly for coverage gaps
- Use `qtest_get_requirements` to audit the full tree
- Track coverage metrics per requirement

### Creating Requirements
- `parentId` (module) is always required — never guess or search for the best module
- If the user does not specify a module (e.g., `MD-####`), **ask them** before creating the requirement
- Do not call `qtest_get_requirements` to find a module on behalf of the user — let them decide where it goes

### Creating Test Cases
- `parentId` (module) is always required — never guess or search for the best module
- If the user does not specify a module (e.g., `MD-####`), **ask them** before creating the test case
- Do not browse the test design tree to pick a module on behalf of the user — let them decide where it goes
