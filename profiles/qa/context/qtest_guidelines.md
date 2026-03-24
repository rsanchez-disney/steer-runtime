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

### Project Tools
| Tool | Description |
|------|-------------|
| `qtest_get_projects` | List all projects with ID, name, and description |
| `qtest_get_project` | Get details for a single project by ID |

### Test Case Tools
| Tool | Description |
|------|-------------|
| `qtest_get_test_case` | Retrieve test case details including steps and preconditions. Accepts `TC-####` format (e.g., `TC-8032`) or numeric ID. Auto-fetches test steps. |
| `qtest_create_test_case` | Create a new test case with name, description, steps, and optional parent (`MD-####` or numeric) |
| `qtest_update_test_case` | Update fields on an existing test case |
| `qtest_search_test_cases` | Search test cases by query string (paginated) |

### Test Run Tools
| Tool | Description |
|------|-------------|
| `qtest_get_test_run` | Retrieve test run details with status and linked test case |
| `qtest_create_test_run` | Create a test run from a test case in a cycle or suite |
| `qtest_update_test_run_result` | Submit execution result (passed/failed/blocked/incomplete) with optional note |

### Test Cycle & Suite Tools
| Tool | Description |
|------|-------------|
| `qtest_get_test_cycles` | List all test cycles for a project |
| `qtest_create_test_cycle` | Create a new test cycle with name and optional description |
| `qtest_get_test_suites` | List test suites within a test cycle |
| `qtest_create_test_suite` | Create a test suite within a test cycle |

### Requirement Tools
| Tool | Description |
|------|-------------|
| `qtest_get_requirements` | Retrieve the requirements tree for a project |
| `qtest_get_requirement` | Get requirement details and linked test cases. Accepts `RQ-####` format or numeric ID. Automatically fetches linked TCs via the `linked-artifacts` API. |
| `qtest_link_requirement` | Link a requirement to a test case for traceability. Accepts `RQ-####` format or numeric ID. |
| `qtest_create_requirement` | Create a new requirement in qTest with auto-comment. Accepts `MD-####` PID or numeric `parentId`. |

### Defect Tools
| Tool | Description |
|------|-------------|
| `qtest_get_defects` | Get defects linked to a test run |
| `qtest_link_defect` | Link an existing defect to a test run |
| `qtest_submit_defect` | Create a new defect linked to a failed test run |

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
