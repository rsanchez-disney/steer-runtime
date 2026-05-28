# Jira MCP Setup Guide

## Detect if Jira MCP is already installed

Check one of:
1. Try `CallMcpTool` with `jira_search` — if it works, you're done.
2. Check if `~/.cursor/mcp.json` contains an entry with `jira` in the server name.
3. Check if `~/.cursor/projects/<workspace>/mcps/` contains a folder whose name includes `jira`.

If none of the above → proceed with installation.

---

## Installation

### Option A — Atlassian official plugin (recommended)

Cursor supports installing MCP servers through its plugin marketplace.

1. Open Cursor Settings → **MCP** tab.
2. Search for **"Jira"** or **"Atlassian"**.
3. Install the official Atlassian MCP plugin.
4. When prompted, provide:
   - **Jira base URL**: `https://yourcompany.atlassian.net`
   - **Email**: your Atlassian account email
   - **API Token**: generate one at https://id.atlassian.com/manage-profile/security/api-tokens

### Option B — Manual `mcp.json` configuration

Edit `~/.cursor/mcp.json` (create if missing) and add:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-jira"],
      "env": {
        "JIRA_URL": "https://yourcompany.atlassian.net",
        "JIRA_TOKEN": "YOUR_API_TOKEN_HERE",
        "JIRA_EMAIL": "you@yourcompany.com"
      }
    }
  }
}
```

**Generate an API token**:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Copy the token — you cannot see it again

---

## Restart required

After adding the MCP configuration, **restart Cursor** completely (not just reload window).
Then re-invoke the skill — the `jira_search` test in Step 0 should succeed.

---

## Troubleshooting

| Error | Likely cause | Fix |
|---|---|---|
| `Tool not found` | MCP not loaded | Restart Cursor |
| `401 Unauthorized` | Wrong token or email | Regenerate API token |
| `403 Forbidden` | Account lacks project access | Contact Jira admin for IEXP/AEXP/COREEXP access |
| `400 Bad Request` | JQL syntax error | Check Epic Link IDs match your Jira instance |
| Timeout | Large dataset | Reduce date range first, then expand |

---

## Verify the connection

Once configured, run this test query:
```
project IN (IEXP, AEXP, COREEXP) AND created >= -7d AND issuetype IN (Defect, Bug)
```
Expected: returns results with `summary`, `labels`, `created` fields populated.
