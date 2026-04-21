# GitHub MCP Server

Multi-remote GitHub MCP server with support for multiple GitHub Enterprise instances.

## Features

- **Multi-remote support**: Connect to multiple GitHub instances with different PATs
- **Auto-detection**: Automatically detect remote from repository URLs
- **Explicit override**: Specify remote explicitly when needed
- **Standard GitHub API**: Full pull request, comment, and repository operations
- **File reading**: Read one or multiple files from a repo for use as agent context

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Personal Access Token

Create a token at your GitHub instance (e.g., `https://code.espn.com/settings/tokens`)

**Required Scopes:**
- `repo` - Full control of private repositories (covers PRs, comments, code access)

**Optional Scopes:**
- `read:org` - Read org and team membership
- `read:user` - Read user profile data

### 3. Configure Environment

```bash
cd /path/to/github-mcp
cp .env.example .env
# Edit .env with your GitHub hosts and tokens
```

Edit `.env`:

```bash
# ESPN Code GitHub Enterprise
GITHUB_TOKEN_espn_code=your_espn_code_token_here
GITHUB_HOST_espn_code=code.espn.com

# TWDC Grid GitHub Enterprise
GITHUB_TOKEN_twdcgrid=your_twdcgrid_token_here
GITHUB_HOST_twdcgrid=github.twdcgrid.net

# Optional: Custom API path (defaults to /api/v3)
# GITHUB_PATH_espn_code=/api/v3

# Default remote (optional, defaults to first available)
GITHUB_DEFAULT_REMOTE=espn_code

# Output directory (optional)
GITHUB_OUTPUT_DIR=/tmp/github-mcp
```

### 4. Build

```bash
npm run build
```

## Important: Environment Variable Loading

**CRITICAL**: When using this MCP server with Amazon Q CLI agents, the `.env` file must be located in the root of the local copy of the MCP server itself. This ensures that secrets are not repeated across projects and cannot be accidentally shared in git repositories.

For example:
- If you run `q chat --agent my-agent` from `/Users/yourname/my-project/`
- The MCP server will look for `.env` in `/path/to/github-mcp/.env`

## Output Directory Options

The `outputDir` parameter supports three modes:

1. **Default (undefined)**: Saves to `/tmp/github-mcp/`
2. **Custom path (string)**: Saves to the specified directory
3. **Opt-out (false or null)**: Skips saving entirely

Example:
```javascript
// Default - saves to /tmp/github-mcp/
github_get_pr({ owner: "org", repo: "repo", prNumber: 123 })

// Custom path - useful for project-specific storage
github_get_pr({ owner: "org", repo: "repo", prNumber: 123, outputDir: ".amazonq/external-data" })

// Opt-out - doesn't save
github_get_pr({ owner: "org", repo: "repo", prNumber: 123, outputDir: false })
```

### Why `/tmp` as Default?

The default output directory is `/tmp/github-mcp` for several important reasons:

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

## Data Storage and Git Ignore

By default, all MCP operations save API responses to `/tmp/github-mcp/` in your current working directory. This helps Q maintain context across operations.

**Recommended:** Add to your project's `.gitignore`:

```
/tmp/github-mcp/
```

### 5. Configure MCP

Add to your MCP client configuration (ex: `~/.aws/amazonq/mcp.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/Users/Charles.Leathers/Workspace/mcps/github-mcp/build/index.js"]
    }
  }
}
```

For Amazon Q CLI agents, reference the tools directly:

```json
{
  "tools": [
    "@github/github_get_pr",
    "@github/github_create_pr",
    "@github/github_comment_on_pr",
    "@github/github_get_pr_comments",
    "@github/github_update_pr",
    "@github/github_get_repo",
    "@github/github_search_prs",
    "@github/github_list_remotes",
    "@github/github_get_file",
    "@github/github_get_files",
    "@github/github_create_review"
  ],
  "allowedTools": [
    "@github/github_get_pr",
    "@github/github_create_pr",
    "@github/github_comment_on_pr",
    "@github/github_get_pr_comments",
    "@github/github_update_pr",
    "@github/github_get_repo",
    "@github/github_search_prs",
    "@github/github_list_remotes",
    "@github/github_get_file",
    "@github/github_get_files",
    "@github/github_create_review"
  ]
}
```

**Note:** Adding tools to both `tools` and `allowedTools` prevents interruptions for tool approval during chat sessions.

## Usage

### List Available Remotes

```typescript
github_list_remotes()
```

### Get Pull Request

```typescript
// Auto-detect from URL
github_get_pr({
  repo: "https://code.espn.com/team/project",
  prNumber: "123"
})

// Explicit remote
github_get_pr({
  repo: "team/project",
  remote: "espn_code",
  prNumber: "456"
})

// Uses default remote
github_get_pr({
  repo: "owner/repo",
  prNumber: "789"
})
```

### Create Pull Request

```typescript
github_create_pr({
  repo: "team/project",
  remote: "espn_code",
  title: "Feature: Add new component",
  head: "feature-branch",
  base: "main",
  body: "## Changes\n- Added component\n- Updated tests",
  draft: false
})
```

### Comment on Pull Request

```typescript
github_comment_on_pr({
  repo: "team/project",
  remote: "twdcgrid",
  prNumber: "123",
  body: "LGTM! ✅"
})
```

### Get PR Comments

```typescript
github_get_pr_comments({
  repo: "team/project",
  prNumber: "123"
})
```

### Update Pull Request

```typescript
github_update_pr({
  repo: "team/project",
  prNumber: "123",
  title: "Updated: Feature implementation",
  assignees: ["username1"],
  reviewers: ["username2", "username3"]
})
```

### Search Pull Requests

```typescript
github_search_prs({
  repo: "team/project",
  state: "open",
  base: "main",
  sort: "updated",
  direction: "desc"
})
```

### Get Repository Info

```typescript
github_get_repo({
  repo: "team/project",
  remote: "espn_code"
})
```

### Read a Single File

```typescript
// Read a file from default branch
github_get_file({
  repo: "team/project",
  path: "src/index.ts"
})

// Read from a specific branch
github_get_file({
  repo: "team/project",
  path: "README.md",
  ref: "feature-branch"
})

// Read from a specific commit
github_get_file({
  repo: "team/project",
  path: "package.json",
  ref: "abc123f"
})
```

### Read Multiple Files

```typescript
// Read several files at once for context
github_get_files({
  repo: "team/project",
  paths: [
    "src/index.ts",
    "src/utils/helpers.ts",
    "package.json"
  ]
})

// From a specific branch
github_get_files({
  repo: "team/project",
  paths: ["src/main.dart", "pubspec.yaml"],
  ref: "develop",
  remote: "espn_code"
})
```

### Create Pull Request Review (Inline Comments)

```typescript
// Post inline review comments on specific lines
github_create_review({
  repo: "team/project",
  prNumber: "123",
  event: "COMMENT",
  comments: [
    {
      path: "src/utils/helper.dart",
      line: 42,
      body: "Consider extracting this into a separate method",
      side: "RIGHT"
    },
    {
      path: "src/main.dart",
      line: 15,
      body: "This import is unused"
    }
  ]
})

// Approve with inline feedback
github_create_review({
  repo: "team/project",
  prNumber: "456",
  event: "APPROVE",
  body: "LGTM! Minor suggestions below.",
  comments: [
    { path: "lib/widget.dart", line: 30, body: "Nit: prefer `const` constructor here" }
  ]
})

// Request changes
github_create_review({
  repo: "team/project",
  prNumber: "789",
  event: "REQUEST_CHANGES",
  body: "Security concern — see inline comment.",
  comments: [
    { path: "src/auth.ts", line: 12, body: "**Critical:** This exposes the token in logs", side: "RIGHT" }
  ]
})
```

## Adding New Remotes

To add a new GitHub instance, add these environment variables:

```bash
GITHUB_TOKEN_remote_name=your_token
GITHUB_HOST_remote_name=github.example.com
```

Optional custom API path (defaults to `/api/v3`):
```bash
GITHUB_PATH_remote_name=/api/v4
```

The remote name can be anything (e.g., `espn_code`, `twdcgrid`, `my_github`).

## Tools

- `github_get_pr` - Fetch pull request details
- `github_create_pr` - Create new pull request
- `github_comment_on_pr` - Add comment to PR
- `github_get_pr_comments` - Fetch PR comments
- `github_update_pr` - Update PR (title, description, assignees, reviewers)
- `github_get_repo` - Fetch repository information
- `github_search_prs` - Search pull requests
- `github_list_remotes` - List configured remotes
- `github_get_file` - Read a single file from a repository (decoded text content)
- `github_get_files` - Read multiple files from a repository in one call
- `github_create_review` - Create a PR review with inline comments on specific diff lines

## Output

All API responses are automatically saved to `/tmp/github-mcp/` (or custom directory) for reference.
