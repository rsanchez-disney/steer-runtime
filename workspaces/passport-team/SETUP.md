# Passport Team Workspace — Setup

## Prerequisites

- Koda installed (`koda --version` works)
- Jira Cloud MCP already configured and working
- No agent sessions open during setup (close all first)

---

## Step 1: Update Koda and sync

```bash
koda upgrade
koda sync --update
```

---

## Step 2: Add XRay credentials to tokens.env

If you already have the Jira MCP working, you only need to add the XRay variables.

Edit `~/.kiro/tokens.env` and add:

```
XRAY_CLOUD_CLIENT_ID=<your XRay client ID>
XRAY_CLOUD_CLIENT_SECRET=<your XRay client secret>
```

Your complete `tokens.env` should look like this:

```
JIRA_PAT_cloud=<your Atlassian Cloud API token>
JIRA_URL_cloud=https://disneyexperiences.atlassian.net
JIRA_EMAIL_cloud=your.name@disney.com
CONFLUENCE_PAT_cloud=<same token as JIRA_PAT_cloud>
CONFLUENCE_URL_cloud=https://disneyexperiences.atlassian.net/wiki
CONFLUENCE_EMAIL_cloud=your.name@disney.com
XRAY_CLOUD_CLIENT_ID=<your XRay client ID>
XRAY_CLOUD_CLIENT_SECRET=<your XRay client secret>
```

### Where to get tokens

| Token                    | Generate at                                                    |
|--------------------------|----------------------------------------------------------------|
| JIRA_PAT_cloud           | https://id.atlassian.com/manage-profile/security/api-tokens    |
| CONFLUENCE_PAT_cloud     | Same token as JIRA (they share the same Atlassian API token)   |
| XRAY_CLOUD_CLIENT_ID     | Jira → Apps → XRay → Settings → API Keys                      |
| XRAY_CLOUD_CLIENT_SECRET | Same location as above                                         |

---

## Step 3: Regenerate MCP config

Run in terminal (no agents open):

```bash
koda mcp-install
koda sync --update
```

After running these commands, verify that the Jira MCP entry in your `mcp.json` includes the XRay variables:

```json
"jira-cloud": {
  "_source": "global",
  "args": [
    "/Users/$USER/.kiro/tools/mcp-servers/jira-mcp/dist/index.cjs"
  ],
  "command": "/opt/homebrew/bin/node",
  "env": {
    "JIRA_EMAIL": "your.name@disney.com",
    "JIRA_INSTANCE_PREFIX": "cloud_",
    "JIRA_PAT": "<your token>",
    "JIRA_URL": "https://disneyexperiences.atlassian.net",
    "XRAY_CLOUD_CLIENT_ID": "<your client ID>",
    "XRAY_CLOUD_CLIENT_SECRET": "<your client secret>"
  }
}
```

> If XRAY variables are missing from the `env` block, go back to Step 2 and verify your `tokens.env`.

---

## Step 4: Apply the workspace

```bash
koda workspace apply passport-team
```

After applying, run sync again:

```bash
koda sync --update
```

> All of the above steps must be done in terminal with NO agent sessions open.

---

## Step 5: Verify connectivity

Start the QA orchestrator agent:

```bash
koda chat --agent qa_orchestrator_agent
```

Load the XRay context:

```
Load @xray-test-creation-context.md as context
```

Then ask the agent to test connectivity:

```
Test connection to Jira, Confluence, and XRay
```

If all three pass, you are ready to create or read test cases.

---

## Quick Commands After Setup

```bash
# Read test cases for a user story
"Analyze PAS2-412 and check test coverage"

# Create test cases for a user story
"Create test cases for PAS2-XXX"

# Execute tests on a device
koda chat --agent mobile_test_executor_agent
"Run PAS2-649 on iOS iPhone 17 Pro"
```

---

## Agents

| Agent                        | Purpose                                      |
|------------------------------|----------------------------------------------|
| `qa_orchestrator_agent`      | Routes QA tasks, test creation, Jira + XRay  |
| `mobile_test_executor_agent` | Executes XRay Gherkin tests via Appium       |
| `api_test_executor_agent`    | Executes API tests via Bruno                 |

---

## Troubleshooting

| Problem                         | Fix                                                        |
|---------------------------------|------------------------------------------------------------|
| 401 Unauthorized                | Regenerate token at Atlassian, update tokens.env           |
| XRay tools not appearing        | Check XRAY_CLOUD_CLIENT_ID and SECRET in tokens.env        |
| Variable not found              | Verify ~/.kiro/tokens.env has all _cloud vars              |
| mcp.json missing XRAY vars      | Run `koda mcp-install` then `koda sync --update`           |
| Tool not found after workspace  | Run `koda workspace apply passport-team` again             |
| Agent cannot connect to XRay    | Close agent, re-run steps 3-4, restart agent               |
