# Jira Cloud Setup Guide

How to configure your steer environment to work with Jira Cloud (`disneyexperiences.atlassian.net`).

> 🎬 **Video demo:** [jira-cloud-setup-demo.mov](./jira-cloud-setup-demo.mov) — walkthrough of the full setup via TUI.

## Prerequisites

- Koda **v0.4.120+** (includes Jira Cloud TUI fix for Tab field persistence)
- steer-runtime **v3.10+** (includes `cloud_` prefix routing in orchestrator context)

## Step 1: Upgrade Koda

```bash
koda upgrade
```

Verify the version:

```bash
koda version
# Should show v0.4.120 or later
```

## Step 2: Generate a Jira Cloud API Token

Jira Cloud uses **API tokens** (not PATs like on-prem Jira).

1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Give it a label (e.g., "Koda CLI")
4. Copy the token — you won't see it again

## Step 3: Configure the Jira Cloud Instance

You have the options of using the TUI dashboard.

1. Launch the dashboard:

   ```bash
   koda
   ```

2. Navigate to the **MCP** tab (use arrow keys to switch sections)

3. In the Jira instances area, select the `cloud` row and press **Enter** to edit

4. Fill in each field using **Tab** to advance:
   - **URL** → `https://disneyexperiences.atlassian.net` → Tab
   - **Email** → your Atlassian email (e.g., `your.email@disney.com`) → Tab
   - **Custom Fields** → leave empty or enter field IDs → Tab
   - **Token** → paste your API token from Step 2 → **Enter** to save

5. The status bar shows: `tab=switch field  enter=save  esc=cancel  (email empty=Server, set=Cloud)`

### Important Note

The **Email** field is what tells Koda to use Jira Cloud authentication (Basic Auth + API v3) instead of PAT auth. If Email is empty, it treats the instance as on-prem Server.

## Step 4: Verify Configuration

After saving, check that `mcp.json` was generated correctly:

```bash
cat ~/.kiro/settings/mcp.json | jq '.mcpServers | to_entries[] | select(.key | startswith("jira")) | {server: .key, env: .value.env}'
```

Expected output:

```json
{
  "JIRA_INSTANCE_PREFIX": "cloud_",
  "JIRA_PAT": "<your-api-token>",
  "JIRA_URL": "https://disneyexperiences.atlassian.net",
  "JIRA_EMAIL": "your.email@disney.com"
}
```

## Step 5: Sync steer-runtime

Ensure your steer-runtime has the latest orchestrator routing rules:

```bash
koda sync --update
```

This pulls the updated `mcp_priority.md` and `orchestrator_rules.md` that teach orchestrators to route `disneyexperiences.atlassian.net` URLs to the `cloud_` prefix tools.

## Usage

Once configured, you can use Jira Cloud URLs directly in your chat sessions:

```
Help me implement https://disneyexperiences.atlassian.net/browse/DPAY-15726
```

```
Review my tickets from https://disneyexperiences.atlassian.net/jira/software/c/projects/DPAY/boards/2006
```

The orchestrator will automatically delegate to `story_analyzer_agent` using the `cloud_` prefixed tools (`cloud_get_issue`, `cloud_search_issues`, etc.).

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "I don't have access to Jira" | Run `koda sync --update` to get latest orchestrator routing rules |
| 401 Unauthorized | Verify your Email is set (required for Cloud auth). Regenerate your API token. |
| Tab erases field values | Upgrade Koda to v0.4.120+ (`koda upgrade`) |
| `cloud_` tools not found | Run `koda mcp-install` to regenerate `mcp.json` |

## How It Works

Koda generates a separate MCP server entry (`jira-cloud`) with `JIRA_INSTANCE_PREFIX: "cloud_"`. This means all Jira MCP tools for this instance are prefixed with `cloud_`:

- `cloud_get_issue` — fetch a single issue
- `cloud_search_issues` — JQL search
- `cloud_get_board` — board details

The orchestrator context maps URLs to prefixes:

| URL | Prefix | Tools |
|-----|--------|-------|
| `myjira.disney.com` | `jira_` | `jira_get_issue` |
| `jira.disney.com` | `jira_` | `jira_get_issue` |
| `disneyexperiences.atlassian.net` | `cloud_` | `cloud_get_issue` |
