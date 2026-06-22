# JIRA MCP Server

A Model Context Protocol server for fetching JIRA ticket information.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up authentication (choose one):

```bash
# Option 1: Create .env file (recommended)
cd /Users/yourname/path/to/jira-mcp
cp .env.example .env

# Option 2: Set environment variables
export JIRA_PAT=your_token
```

### Important: Environment Variable Loading

**CRITICAL**: When using this MCP server with Amazon Q CLI agents, the `.env` file must be located in root the local copy of the MCP server itself.
This ensures that the secrets held in the `.env` file are not repeated across many projects and potentially conflicting with other project requirements,
nor can it be accidentally shared in other git repositories if the `.env` file is not ignored by git.

For example:

- If you run `q chat --agent my-agent` from `/Users/yourname/my-project/`
- The MCP server will look for `.env` in `/Users/yourname/path/to/jira-mcp/.env`

To create a JIRA Personal Access Token, visit: https://disneyexperiences.atlassian.net/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens

3. Build the server:

```bash
npm run build
```

## Usage

The server provides thirteen tools with smart defaults for data saving:

- **All operations**: Automatically save responses to `/tmp/jira-mcp` by default
- This includes GET, POST, and PUT operations to capture error responses and updated ticket data
- Provides better context for Q in subsequent operations

### Output Directory Options

The `outputDir` parameter supports three modes:

1. **Default (undefined)**: Saves to `/tmp/jira-mcp/`
2. **Custom path (string)**: Saves to the specified directory
3. **Opt-out (false or null)**: Skips saving entirely

Example:
```javascript
// Default - saves to /tmp/jira-mcp/
jira_get_issue({ ticketId: "PROJ-123" })

// Custom path - useful for project-specific storage
jira_get_issue({ ticketId: "PROJ-123", outputDir: ".amazonq/external-data" })

// Opt-out - doesn't save
jira_get_issue({ ticketId: "PROJ-123", outputDir: false })
```

### Why `/tmp` as Default?

The default output directory is `/tmp/jira-mcp` for several important reasons:

1. **Automatic cleanup**: System automatically clears `/tmp` on reboot and periodically removes old files
2. **No git conflicts**: Temporary data never accidentally gets committed to repositories
3. **No manual maintenance**: Users don't need to remember to clean up API response files
4. **Clean project directories**: Keeps project workspaces free of transient API data

**When to use custom `outputDir`:**
- **Project-specific context**: Use `.amazonq/external-data` when you need persistent data for Q's context across sessions
- **Debugging**: Specify a custom path when you need to review API responses after system restart
- **Documentation**: Save to a specific location when capturing data for reference or sharing

If you use a custom directory like `.amazonq/external-data`, add it to your `.gitignore`:

```
.amazonq/external-data/
```

### Core Issue Management

### `jira_get_issue`

Fetch a JIRA ticket by ID and optionally save to output directory.

**Arguments:**

- `ticketId` (string, required): The JIRA ticket ID (e.g., "COREWEB-1815")
- `outputDir` (string | false | null, optional): Directory path where the ticket data will be saved (defaults to `/tmp/jira-mcp`). Pass `false` or `null` to skip saving.
- `fields` (array, optional): Fields to include in response. Available options: `summary`, `status`, `assignee`, `priority`, `created`, `updated`, `description`, `labels`, `components`. Default: `['summary', 'status', 'assignee', 'priority', 'created', 'description']`

**Response:**

- Returns formatted ticket summary with requested fields
- Saves complete ticket data as JSON file with timestamp in the output directory

### `jira_search_issues`

Search JIRA issues using JQL (JIRA Query Language).

**Arguments:**

- `jql` (string, required): JQL query string (e.g., "project = COREWEB AND status = Open")
- `maxResults` (number, optional): Maximum number of results to return (default: 50)
- `startAt` (number, optional): Starting index for pagination (default: 0)
- `outputDir` (string, optional): Directory path where the search results will be saved (defaults to `/tmp/jira-mcp`)

**Response:**

- Returns formatted search results with issue summaries
- Saves complete search data as JSON file with timestamp

### `jira_create_issue`

Create a new JIRA issue with support for custom fields.

**Arguments:**

- `projectKey` (string, required): Project key (e.g., "COREWEB")
- `summary` (string, required): Issue summary/title
- `issueType` (string, required): Issue type (e.g., "Bug", "Story", "Task")
- `description` (string, optional): Issue description
- `assignee` (string, optional): Username of assignee
- `epicLink` (string, optional): Epic ticket ID to link to (e.g., "SEWEB-46018")
- `components` (array of strings, optional): Component names (e.g., ["Client Platforms & Misc"])
- `labels` (array of strings, optional): Label names (e.g., ["SPORTSWEB", "olympics", "2026", "ai-generated-ticket"])
- `outputDir` (string, optional): Directory path where the created issue data will be saved (no default - only saves if provided)

**Response:**

- Returns formatted created issue summary with JIRA URL and custom field values
- Saves complete issue data as JSON file with timestamp if `outputDir` is provided

**Example:**

```javascript
jira_create_issue({
  projectKey: "SEWEB",
  issueType: "Task",
  summary: "Year/Sport/Event Filter Component",
  description: "Create a reusable filter component for year, sport, and event selection",
  epicLink: "SEWEB-46018", // NOTE: Will show warning - requires manual setup in JIRA web UI
  components: ["Client Platforms & Misc"], // ✅ Works automatically
  labels: ["SPORTSWEB", "olympics", "2026", "ai-generated-ticket"], // ✅ Works automatically
  outputDir: "./jira-data"
})
```

**Field Status:**
- ✅ **Components**: Fully automated
- ✅ **Labels**: Fully automated  
- ⚠️ **Epic Link**: Parameter accepted but requires manual setup in JIRA web UI

### `jira_update_issue`

Update a JIRA ticket and optionally save the updated data.

**Arguments:**

- `ticketId` (string, required): The JIRA ticket ID (e.g., "COREWEB-1815")
- `outputDir` (string, optional): Directory path where the updated ticket data will be saved (no default - only saves if provided)
- `summary` (string, optional): New ticket summary
- `description` (string, optional): New ticket description
- `assignee` (string, optional): Username of the new assignee
- `epicLink` (string, optional): Epic ticket ID to link to - attempts multiple field IDs
- `components` (array of strings, optional): Component names (e.g., ["Client Platforms & Misc"])
- `labels` (array of strings, optional): Label names (e.g., ["SPORTSWEB", "olympics", "2026"])

**Response:**

- Returns formatted updated ticket summary
- Saves complete updated ticket data as JSON file with timestamp if `outputDir` is provided

**Note**: Custom field availability (components, labels, Epic Link) varies by project configuration. Fields may not be available for all JIRA projects.

### `jira_transition_issue`

Transition a JIRA ticket to a new status.

**Arguments:**

- `ticketId` (string, required): The JIRA ticket ID (e.g., "COREWEB-1815")
- `status` (string, required): Target status name (e.g., "In Progress", "Done")
- `outputDir` (string, optional): Directory path where the updated ticket data will be saved (no default - only saves if provided)

### `jira_assign_issue`

Assign a JIRA ticket to a user.

**Arguments:**

- `ticketId` (string, required): The JIRA ticket ID (e.g., "COREWEB-1815")
- `assignee` (string, required): Email or username of the assignee
- `outputDir` (string, optional): Directory path where the updated ticket data will be saved (no default - only saves if provided)

### `jira_comment_on_issue`

Add a comment to a JIRA ticket.

**Arguments:**

- `ticketId` (string, required): The JIRA ticket ID (e.g., "COREWEB-1815")
- `comment` (string, required): The comment text to add to the ticket
- `outputDir` (string, optional): Directory path where the comment response data will be saved (no default - only saves if provided)

### `jira_get_transitions`

Get available transitions for a JIRA issue.

**Arguments:**

- `ticketId` (string, required): The JIRA ticket ID (e.g., "COREWEB-1815")
- `outputDir` (string, optional): Directory path where the transitions data will be saved (defaults to `/tmp/jira-mcp`)

**Response:**

- Returns formatted list of available transitions with IDs and target statuses
- Saves complete transitions data as JSON file with timestamp

### Project & System Information

### `jira_get_projects`

Get all JIRA projects.

**Arguments:**

- `outputDir` (string, optional): Directory path where the projects data will be saved (defaults to `/tmp/jira-mcp`)

**Response:**

- Returns formatted list of projects with keys, names, leads, and categories
- Saves complete projects data as JSON file with timestamp

### `jira_get_issue_types`

Get all JIRA issue types.

**Arguments:**

- `outputDir` (string, optional): Directory path where the issue types data will be saved (defaults to `/tmp/jira-mcp`)

**Response:**

- Returns formatted list of issue types with IDs, names, descriptions, and subtask flags
- Saves complete issue types data as JSON file with timestamp

### Agile & Sprint Management

### `jira_get_boards`

Get JIRA agile boards with optional filtering.

**Arguments:**

- `projectKey` (string, optional): Filter by project key
- `boardType` (string, optional): Filter by board type ("scrum" or "kanban")
- `name` (string, optional): Filter by board name
- `maxResults` (number, optional): Maximum number of results (default: 50)
- `startAt` (number, optional): Starting index for pagination (default: 0)
- `outputDir` (string, optional): Directory path where the boards data will be saved (defaults to `/tmp/jira-mcp`)

**Response:**

- Returns formatted list of boards with IDs, names, types, and locations
- Saves complete boards data as JSON file with timestamp

### `jira_get_sprints`

Get sprints for a JIRA agile board.

**Arguments:**

- `boardId` (string, required): Board ID to get sprints for
- `state` (string, optional): Filter by sprint state ("active", "closed", "future")
- `maxResults` (number, optional): Maximum number of results (default: 50)
- `startAt` (number, optional): Starting index for pagination (default: 0)
- `outputDir` (string, optional): Directory path where the sprints data will be saved (defaults to `/tmp/jira-mcp`)

**Response:**

- Returns formatted list of sprints with IDs, names, states, dates, and goals
- Saves complete sprints data as JSON file with timestamp

### `jira_get_sprint_issues`

Get issues in a specific JIRA sprint.

**Arguments:**

- `sprintId` (string, required): Sprint ID to get issues for
- `maxResults` (number, optional): Maximum number of results (default: 50)
- `startAt` (number, optional): Starting index for pagination (default: 0)
- `outputDir` (string, optional): Directory path where the sprint issues data will be saved (defaults to `/tmp/jira-mcp`)

**Response:**

- Returns formatted list of issues with keys, summaries, statuses, assignees, priorities, types, and projects
- Saves complete sprint issues data as JSON file with timestamp

**JSON file structure (all tools):**

- `ticketId`: The requested ticket ID
- `fetchedAt`: ISO timestamp of when the data was retrieved
- `rawData`: Complete JIRA API response
- `formattedSummary`: Human-readable ticket summary

## Configuration

Add to your MCP client configuration (ex: `~/.aws/amazonq/mcp.json`):

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/path/to/jira-mcp/build/index.js"],
      "cwd": "/path/to/jira-mcp"
    }
  }
}
```

For Amazon Q CLI agents, reference the tools directly:

```json
{
  "tools": [
    "@jira/jira_get_issue",
    "@jira/jira_search_issues",
    "@jira/jira_create_issue",
    "@jira/jira_update_issue",
    "@jira/jira_transition_issue",
    "@jira/jira_assign_issue",
    "@jira/jira_comment_on_issue",
    "@jira/jira_get_transitions",
    "@jira/jira_get_projects",
    "@jira/jira_get_issue_types",
    "@jira/jira_get_boards",
    "@jira/jira_get_sprints",
    "@jira/jira_get_sprint_issues"
  ],
  "allowedTools": [
    "@jira/jira_get_issue",
    "@jira/jira_search_issues",
    "@jira/jira_create_issue",
    "@jira/jira_update_issue",
    "@jira/jira_transition_issue",
    "@jira/jira_assign_issue",
    "@jira/jira_comment_on_issue",
    "@jira/jira_get_transitions",
    "@jira/jira_get_projects",
    "@jira/jira_get_issue_types",
    "@jira/jira_get_boards",
    "@jira/jira_get_sprints",
    "@jira/jira_get_sprint_issues"
  ]
}
```

**Note:** Adding tools to both `tools` and `allowedTools` prevents interruptions for tool approval during chat sessions.

## Custom Fields

The `jira_create_issue` tool supports Disney JIRA custom fields with the following status:

### ✅ Working Fields
- **Components**: Uses standard JIRA components field - fully automated
- **Labels**: Uses standard JIRA labels field - fully automated

### ⚠️ Limited Support
- **Epic Link**: Parameter accepted but **not set automatically**
  - Uses `customfield_10014` (Disney JIRA specific)
  - Field ID may not be available or configured for all projects
  - **Workaround**: Epic links must be set manually in JIRA web interface
  - Tool shows warning when Epic Link is provided but not set

### Configuration Notes
If you're using a different JIRA instance, you may need to:
1. Adjust the Epic Link field ID in the source code
2. Verify custom fields are available on project screens
3. Check API permissions for custom field access

### Troubleshooting Epic Links
If Epic Link functionality is critical:
1. Check JIRA project configuration for Epic Link field availability
2. Verify API user has permissions to set custom fields
3. Contact JIRA administrator to identify correct Epic Link field ID
4. Consider using `jira_update_issue` tool which attempts multiple field IDs

### Project-Specific Field Availability
**Important**: Field availability varies by JIRA project configuration. Some projects may not have components, labels, or Epic Link fields enabled.

**Symptoms of unavailable fields:**
- Tool succeeds without errors
- Fields appear to be set in tool output
- Fields don't actually appear in JIRA tickets
- Fields not listed in available fields for the project

**Workarounds for unavailable fields:**
1. **Single tickets**: Use JIRA web interface to manually set fields
2. **Bulk updates**: Use JIRA's bulk edit feature:
   - Search for tickets using JQL (e.g., `project = SEWEB AND created >= -1d`)
   - Select multiple tickets
   - Use "Bulk Change" → "Edit Issues"
   - Set components, labels, or Epic links for multiple tickets at once
3. **Project configuration**: Contact JIRA administrator to enable missing fields

### Field Testing
To verify which fields are available for your project:
1. Create a test ticket with the MCP tool
2. Check the JIRA web interface to see which fields were actually set
3. Use the debug output to see available field names

## Development

- `npm run watch`: Watch for changes and rebuild
- `npm run inspector`: Run MCP inspector for debugging
