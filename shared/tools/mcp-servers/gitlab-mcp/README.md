# GitLab MCP Server

Model Context Protocol (MCP) server for GitLab API integration. Provides tools for interacting with GitLab projects, merge requests, files, and code reviews.

## Features

- **Multi-remote support** — Run multiple instances targeting different GitLab hosts
- **Tool name prefixing** — Avoid collisions when multiple remotes are configured
- **MR lifecycle** — Create, update, comment, search, and review merge requests
- **File access** — Read single or multiple files from any branch/ref
- **Code review** — Post inline discussion threads on MR diffs

## Tools

| Tool | Description |
|------|-------------|
| `gitlab_get_project` | Fetch project (repository) information |
| `gitlab_get_mr` | Fetch a merge request by IID |
| `gitlab_create_mr` | Create a new merge request |
| `gitlab_update_mr` | Update MR title, description, state, assignees, reviewers |
| `gitlab_comment_on_mr` | Add a comment (note) to a merge request |
| `gitlab_get_mr_comments` | Fetch all comments from a merge request |
| `gitlab_search_mrs` | Search/list merge requests with filters |
| `gitlab_get_file` | Read a single file from the repository |
| `gitlab_get_files` | Read multiple files in a single call |
| `gitlab_create_review` | Post inline review comments and optionally approve |
| `gitlab_list_remotes` | Show the configured GitLab instance URL |

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GITLAB_HOST` | GitLab hostname (e.g. `gitlab.disney.com`) |
| `GITLAB_TOKEN` | Personal access token |
| `GITLAB_REMOTE` | Optional: remote name for tool prefixing |
| `GITLAB_URL` | Legacy: full GitLab URL (fallback if HOST not set) |

### MCP Server Entry (single instance)

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["~/.kiro/tools/mcp-servers/gitlab-mcp/dist/index.cjs"],
      "env": {
        "GITLAB_HOST": "gitlab.disney.com",
        "GITLAB_TOKEN": "glpat-xxxxxxxxxxxx"
      }
    }
  }
}
```

### Multi-remote (multiple instances)

```json
{
  "mcpServers": {
    "gitlab-disney": {
      "command": "node",
      "args": ["~/.kiro/tools/mcp-servers/gitlab-mcp/dist/index.cjs"],
      "env": {
        "GITLAB_REMOTE": "disney",
        "GITLAB_HOST": "gitlab.disney.com",
        "GITLAB_TOKEN": "glpat-xxxxxxxxxxxx"
      }
    },
    "gitlab-public": {
      "command": "node",
      "args": ["~/.kiro/tools/mcp-servers/gitlab-mcp/dist/index.cjs"],
      "env": {
        "GITLAB_REMOTE": "public",
        "GITLAB_HOST": "gitlab.com",
        "GITLAB_TOKEN": "glpat-yyyyyyyyyyyy"
      }
    }
  }
}
```

When `GITLAB_REMOTE` is set, all tool names are prefixed (e.g. `disney_gitlab_get_mr`).

## Development

```bash
npm install
npm run build      # TypeScript compile
npm run bundle     # esbuild single-file CJS bundle
npm run prepare    # build + bundle
npm run typecheck  # Type check without emit
npm run lint       # ESLint
npm run test       # Vitest
```

## Architecture

```
src/
  index.ts              # MCP server entry point
  utils/
    apiClient.ts        # GitLab API client (gitbeaker)
    toolPrefix.ts       # Multi-remote tool name prefixing
    formatting.ts       # Timestamp/ID formatting helpers
    fileUtils.ts        # File save utility
  tools/
    gitlabGetProject.ts
    gitlabGetMr.ts
    gitlabCreateMr.ts
    gitlabUpdateMr.ts
    gitlabCommentOnMr.ts
    gitlabGetMrComments.ts
    gitlabSearchMrs.ts
    gitlabGetFile.ts
    gitlabGetFiles.ts
    gitlabCreateReview.ts
    gitlabListRemotes.ts
```

## Token Scopes

The GitLab personal access token needs these scopes:
- `api` — Full API access (covers all tools)
- Or more granular: `read_api` for read-only tools, `api` for write tools
