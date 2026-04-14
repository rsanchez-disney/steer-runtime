# qTest MCP Server

A Model Context Protocol server for managing qTest test cases, test runs, test cycles, requirements, and defects.

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cd ~/.kiro/tools/mcp-servers/qtest-mcp
cp .env.example .env
# Edit .env with your bearer token and project ID
```

2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

This produces `dist/index.cjs`, which can be invoked via `node dist/index.cjs`.

Alternatively, use the automated setup:

```bash
./setup.sh mcp-install
```

This prompts for your qTest bearer token and default project ID, writes the `.env` file, and injects tokens into agent configs.

The base URL defaults to `https://qtest.disney.com`. Override with `QTEST_BASE_URL` in `.env` if using a different instance.

To obtain a qTest API token, log in to your qTest instance and navigate to your user profile → API Token (or Resources → API Token depending on your qTest version).

## Tools

All tools support an optional `outputDir` parameter for controlling where API responses are saved to disk.

All tools that require a `projectId` accept it as an optional parameter. If omitted, the `QTEST_PROJECT_ID` environment variable is used. If neither is set, the tool returns an error.

### Project Tools

#### `qtest_get_projects`

List all qTest projects.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_get_project`

Get a qTest project by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

### Test Case Tools

#### `qtest_get_test_case`

Retrieve test case details including name, description, preconditions, and test steps. Accepts the `TC-####` PID format (e.g., `TC-8032`) or a numeric ID. When using `TC-####`, the tool automatically resolves the numeric ID and fetches test steps from the versioned endpoint.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testCaseId` | string \| number | Yes | Test case identifier — `TC-####` format (e.g., `"TC-8032"`) or numeric ID |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_create_test_case`

Create a new test case in qTest.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `name` | string | Yes | The test case name |
| `description` | string | No | The test case description |
| `precondition` | string | No | The test case precondition |
| `testSteps` | array | No | Array of test steps, each with `description` (string) and `expected` (string) |
| `parentId` | string \| number | No | Parent module — `MD-####` PID format (e.g., `"MD-42"`) or numeric ID |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_update_test_case`

Update test case fields in qTest.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testCaseId` | number | Yes | The qTest test case ID to update |
| `name` | string | No | Updated test case name |
| `description` | string | No | Updated test case description |
| `precondition` | string | No | Updated test case precondition |
| `testSteps` | array | No | Updated array of test steps, each with `description` and `expected` |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_search_test_cases`

Search test cases in a qTest project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `query` | string | Yes | Search query string |
| `page` | number | No | Page number (defaults to 1) |
| `pageSize` | number | No | Results per page (defaults to 25) |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

### Test Run Tools

#### `qtest_get_test_run`

Retrieve test run details including status, assigned tester, and linked test case.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testRunId` | number | Yes | The qTest test run ID |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_create_test_run`

Create a new test run in qTest.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testCaseId` | number | Yes | The qTest test case ID to create a run for |
| `parentId` | number | Yes | Parent test cycle or test suite ID |
| `name` | string | No | The test run name |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_update_test_run_result`

Submit a test execution result for a test run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testRunId` | number | Yes | The qTest test run ID |
| `status` | string | Yes | Execution status: `passed`, `failed`, `blocked`, or `incomplete` |
| `note` | string | No | Execution commentary or notes |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

### Test Cycle & Suite Tools

#### `qtest_get_test_cycles`

List test cycles for a qTest project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_create_test_cycle`

Create a new test cycle in qTest.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `name` | string | Yes | The test cycle name |
| `description` | string | No | The test cycle description |
| `parentId` | number | No | Parent test cycle ID for nesting |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_get_test_suites`

List test suites within a test cycle.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testCycleId` | number | Yes | The qTest test cycle ID |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_create_test_suite`

Create a new test suite in qTest.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testCycleId` | number | Yes | The qTest test cycle ID to create the suite in |
| `name` | string | Yes | The test suite name |
| `description` | string | No | The test suite description |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

### Requirement Tools

#### `qtest_get_requirements`

Retrieve the requirements tree for a qTest project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_get_requirement`

Retrieve requirement details with linked test cases. Accepts the `RQ-####` PID format (e.g., `RQ-1239`) or a numeric ID. Automatically fetches linked test cases via the `linked-artifacts` API and includes them in the output with count and TC PIDs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `requirementId` | string \| number | Yes | Requirement identifier — `RQ-####` format (e.g., `"RQ-1239"`) or numeric ID |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_link_requirement`

Create a traceability link between a requirement and a test case. Accepts `RQ-####` PID format for the requirement.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `requirementId` | string \| number | Yes | Requirement — `RQ-####` format (e.g., `"RQ-1239"`) or numeric ID |
| `testCaseId` | number | Yes | The qTest test case ID to link |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_create_requirement`

Create a new requirement in qTest. Useful for importing Jira stories as qTest requirements.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `name` | string | Yes | The requirement name/title |
| `description` | string | No | The requirement description (supports HTML) |
| `parentId` | string \| number | Yes | Parent requirement module — `MD-####` PID format (e.g., `"MD-42"`) or numeric ID |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

### Defect Tools

#### `qtest_get_defects`

Retrieve defects linked to a test run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testRunId` | number | Yes | The qTest test run ID |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_link_defect`

Link an existing defect to a test run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testRunId` | number | Yes | The qTest test run ID |
| `defectId` | number | Yes | The qTest defect ID to link |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

#### `qtest_submit_defect`

Create a new defect linked to a test run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | number | No | The qTest project ID (defaults to `QTEST_PROJECT_ID` env var) |
| `testRunId` | number | Yes | The qTest test run ID to link the defect to |
| `summary` | string | Yes | Summary/title of the defect |
| `description` | string | No | Detailed description of the defect |
| `outputDir` | string \| false \| null | No | Output directory for saved response |

## Output Directory

The `outputDir` parameter on every tool controls where API responses are saved as JSON files.

| Mode | Value | Behavior |
|------|-------|----------|
| Default | _(omitted)_ | Saves to `/tmp/qtest-mcp/` |
| Custom | `"/path/to/dir"` | Saves to the specified directory (created recursively if needed) |
| Opt-out | `false` or `null` | Skips saving entirely |

Saved files follow the naming pattern `<tool-name>-<identifier>-<ISO-timestamp>.json` and contain:

```json
{
  "fetchedAt": "2025-01-15T10:30:00.000Z",
  "rawData": { },
  "formattedSummary": "Human-readable summary text"
}
```

## Configuration

Add to your MCP client configuration (e.g., `~/.aws/amazonq/mcp.json`):

```json
{
  "mcpServers": {
    "qtest": {
      "command": "node",
      "args": ["$HOME/.kiro/tools/mcp-servers/qtest-mcp/dist/index.cjs"],
      "env": {
        "QTEST_BEARER_TOKEN": "YOUR_TOKEN",
        "QTEST_PROJECT_ID": "12345"
      }
    }
  }
}
```

For agents, reference the tools directly:

```json
{
  "tools": ["@qtest/*"],
  "allowedTools": ["@qtest/*"]
}
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `QTEST_BEARER_TOKEN is required` | Missing env var | Create `.env` from `.env.example` or set the env var directly |
| 401 Unauthorized | Token expired or invalid | Regenerate your qTest API token and update `.env` |
| 403 Forbidden | Insufficient permissions | Check your qTest role has access to the requested project/resource |
| Connection errors | Unreachable host | Verify the qTest instance is reachable (defaults to `https://qtest.disney.com`; override with `QTEST_BASE_URL` env var) |

## Development

```bash
npm run build     # Bundle to dist/index.cjs
npm run test      # Run unit and property tests
```
