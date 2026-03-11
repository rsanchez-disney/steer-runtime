# MCP Server Setup for steer-runtime

## Required MCP Servers

steer-runtime requires 2 MCP servers:

1. **Jira MCP** - For story_analyzer_agent
2. **GitHub MCP** - For pr_creator_agent

## Kiro UI Configuration

MCP servers must be configured in Kiro UI settings (cannot be automated via script).

### 1. Jira MCP Server

**Location**: Kiro UI → Settings → MCP Servers → Add Server

**Configuration**:
```json
{
  "name": "jira",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-jira"
  ],
  "env": {
    "JIRA_URL": "https://jira.disney.com",
    "JIRA_EMAIL": "your.email@disney.com",
    "JIRA_API_TOKEN": "your-jira-api-token"
  }
}
```

**Get Jira API Token**:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Copy token to configuration

**Tools Provided**:
- `@jira/get-issue` - Fetch issue details
- `@jira/search-issues` - Search Jira
- `@jira/create-issue` - Create new issues

### 2. GitHub MCP Server

**Location**: Kiro UI → Settings → MCP Servers → Add Server

**Configuration**:
```json
{
  "name": "github",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-github"
  ],
  "env": {
    "GITHUB_TOKEN": "your-github-personal-access-token"
  }
}
```

**Get GitHub Token**:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Scopes needed: `repo`, `workflow`, `write:packages`
4. Copy token to configuration

**Tools Provided**:
- `@github/create-pull-request` - Create PRs
- `@github/get-repository` - Get repo info
- `@github/create-branch` - Create branches

## Kiro CLI Configuration

For CLI, MCP servers are configured in `~/.kiro/config.json`:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-jira"],
      "env": {
        "JIRA_URL": "https://jira.disney.com",
        "JIRA_EMAIL": "your.email@disney.com",
        "JIRA_API_TOKEN": "your-jira-api-token"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-github-token"
      }
    }
  }
}
```

## Verification

### Test Jira MCP

In Kiro UI or CLI:
```
Can you fetch Jira issue DPAY-14337?
```

Expected: Issue details returned

### Test GitHub MCP

In Kiro UI or CLI:
```
Can you get info about repository disney/config-services?
```

Expected: Repository details returned

## Fallback Mode

If MCP servers are not configured:

**story_analyzer_agent**: Will ask user to provide story details manually

**pr_creator_agent**: Will provide git commands for manual PR creation

## Security Notes

⚠️ **Never commit tokens to git**

- Store tokens in environment variables
- Use `.env` files (add to `.gitignore`)
- Rotate tokens regularly
- Use minimal required scopes

## Troubleshooting

### "MCP server not found"

- Check server name matches agent expectations (`jira`, `github`)
- Verify `npx` is installed: `npx --version`
- Check MCP package exists: `npm info @modelcontextprotocol/server-jira`

### "Authentication failed"

- Verify API tokens are valid
- Check token scopes/permissions
- Ensure URLs are correct (no trailing slash)

### "Tool not available"

- Restart Kiro UI/CLI after adding MCP servers
- Check MCP server logs in Kiro settings
- Verify tool names match agent expectations

## Alternative: Custom MCP Servers

If Disney has custom MCP servers:

1. Update agent prompts with correct tool names
2. Configure custom server in Kiro settings
3. Update `MCP_SETUP.md` with custom configuration

---

**Note**: MCP configuration is per-user, not per-project. Configure once in Kiro settings, works for all projects.
