---
name: configure-chrome-devtools
description: Use browser for a URL — configures Chrome DevTools MCP and navigates to the target
---

# Use Browser for URL

Activate the Chrome DevTools MCP server and open a target URL in the browser.

## Trigger

User says something like:
- "Use browser for this https://example.com"
- "Open https://myapp.com in Chrome DevTools"
- "Browse https://site.com"

## Process

### Step 1: Extract URL and ask for token

1. Extract the URL from the user's message
2. Ask for the auth token:

> To connect Chrome DevTools, I need your Bearer auth token (valid ~8h).
> Please paste it here.

If the user says they don't need auth (e.g., localhost), skip the token and proceed without it.

### Step 2: Update mcp.json

1. Open `~/.kiro/settings/mcp.json`
2. Locate the `"chrome-devtools"` server block
3. Set `"disabled": false`
4. If token was provided, add/update the `"env"` field:

```json
"chrome-devtools": {
  "_source": "global",
  "command": "node",
  "args": [
    "~/.kiro/tools/mcp-servers/chrome-devtools-mcp/dist/index.cjs"
  ],
  "env": {
    "CHROME_WS_TOKEN": "<user-provided-token>"
  },
  "disabled": false
}
```

5. If no token needed, just ensure `"disabled": false` and remove `env` if present

### Step 3: Restart and navigate

1. Tell the user to restart the MCP server (Command Palette → "MCP: Restart All Servers")
2. Once confirmed, use the `navigate_page` tool to open the extracted URL
3. Confirm navigation was successful and report the page title

## Important notes

- The token expires in ~8 hours. After expiration, the user must provide a new one.
- Never commit real tokens to source control.
- If Chrome DevTools MCP is not installed, direct the user to run: `cd ~/.kiro/tools/mcp-servers/chrome-devtools-mcp && npm install && npm run build`
