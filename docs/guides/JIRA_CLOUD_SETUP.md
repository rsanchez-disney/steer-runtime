# Jira & Confluence Cloud Setup Guide

How to configure your steer environment to work with Jira Cloud and Confluence Cloud (`disneyexperiences.atlassian.net`).

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

## Step 2: Generate an Atlassian API Token

Atlassian Cloud uses **API tokens** (not PATs like on-prem). The same token works for both Jira Cloud and Confluence Cloud.

1. Go to: <https://id.atlassian.com/manage-profile/security/api-tokens>
2. Click **Create API token**
3. Give it a label (e.g., "Koda CLI")
4. Copy the token — you won't see it again

> ℹ️ One token covers both Jira and Confluence on the same Atlassian instance.

## Step 3: Configure the Jira Cloud Instance

You have the option of using the TUI dashboard.

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

The **Email** field is what tells Koda to use Cloud authentication (Basic Auth + API v3) instead of PAT auth. If Email is empty, it treats the instance as on-prem Server.

## Step 4: Configure the Confluence Cloud Instance

The same API token works for Confluence Cloud. The URL has a `/wiki` suffix.

1. In the same **MCP** tab, switch to the **Confluence** section (section 3)

2. Select the `cloud` row and press **Enter** to edit

3. Fill in:
   - **URL** → `https://disneyexperiences.atlassian.net/wiki` → Tab
   - **Email** → your Atlassian email (same as Jira) → Tab
   - **Token** → paste the same API token from Step 2 → **Enter** to save

4. The Email field tells Koda this is a Cloud instance (same behavior as Jira)

### Alternative: Manual Configuration via `tokens.env`

If you prefer to configure manually, add these entries to `~/.kiro/tokens.env`:

```bash
# Confluence Cloud
CONFLUENCE_PAT_CLOUD=<your-api-token>
CONFLUENCE_URL_CLOUD=https://disneyexperiences.atlassian.net/wiki
CONFLUENCE_EMAIL_CLOUD=your.email@disney.com
```

Then regenerate the MCP config:

```bash
koda mcp-install
```

## Step 5: Verify Configuration

After saving, check that `mcp.json` was generated correctly for both services:

```bash
cat ~/.kiro/settings/mcp.json | jq '.mcpServers | to_entries[] | select(.key | test("jira|confluence")) | select(.value.env.JIRA_URL // .value.env.CONFLUENCE_URL | test("atlassian")) | {server: .key, env: .value.env}'
```

Expected Jira Cloud entry:

```json
{
  "server": "jira-cloud",
  "env": {
    "JIRA_INSTANCE_PREFIX": "cloud_",
    "JIRA_PAT": "<your-api-token>",
    "JIRA_URL": "https://disneyexperiences.atlassian.net",
    "JIRA_EMAIL": "your.email@disney.com"
  }
}
```

Expected Confluence Cloud entry:

```json
{
  "server": "confluence-cloud",
  "env": {
    "CONFLUENCE_INSTANCE_PREFIX": "cloud_",
    "CONFLUENCE_PAT": "<your-api-token>",
    "CONFLUENCE_URL": "https://disneyexperiences.atlassian.net/wiki",
    "CONFLUENCE_EMAIL": "your.email@disney.com"
  }
}
```

## Step 6: Sync steer-runtime

Ensure your steer-runtime has the latest orchestrator routing rules:

```bash
koda sync --update
```

This pulls the updated `mcp_priority.md` and `orchestrator_rules.md` that teach orchestrators to route `disneyexperiences.atlassian.net` URLs to the `cloud_` prefix tools.

## Usage

Once configured, you can use Jira and Confluence Cloud URLs directly in your chat sessions:

### Jira Cloud

```text
Help me implement https://disneyexperiences.atlassian.net/browse/DPAY-15726
```

```text
Review my tickets from https://disneyexperiences.atlassian.net/jira/software/c/projects/DPAY/boards/2006
```

### Confluence Cloud

```text
Summarize this page: https://disneyexperiences.atlassian.net/wiki/spaces/TEAM/pages/123456/My+Document
```

```text
Search Confluence Cloud for architecture decision records in the DPAY space
```

The orchestrator will automatically delegate using the `cloud_` prefixed tools:

- Jira: `cloud_get_issue`, `cloud_search_issues`, `cloud_get_board`
- Confluence: `cloud_get_page`, `cloud_search_pages`, `cloud_get_space`

## Troubleshooting

| Problem                            | Solution                                                                                     |
|------------------------------------|----------------------------------------------------------------------------------------------|
| "I don't have access to Jira"      | Run `koda sync --update` to get latest orchestrator routing rules                            |
| "I don't have access to Confluence" | Verify Confluence Cloud is configured (Step 4). Run `koda mcp-install` to regenerate.        |
| 401 Unauthorized                   | Verify your Email is set (required for Cloud auth). Regenerate your API token.               |
| Tab erases field values            | Upgrade Koda to v0.4.120+ (`koda upgrade`)                                                   |
| `cloud_` tools not found           | Run `koda mcp-install` to regenerate `mcp.json`                                              |
| Confluence returns 404             | Ensure URL ends with `/wiki` — Cloud Confluence uses `atlassian.net/wiki` not just `/`       |

## How It Works

Koda generates separate MCP server entries for each instance, using `INSTANCE_PREFIX` to namespace the tools:

| Service    | Server name          | Prefix    | Example tools              |
|------------|---------------------|-----------|----------------------------|
| Jira Cloud | `jira-cloud`        | `cloud_`  | `cloud_get_issue`          |
| Confluence Cloud | `confluence-cloud` | `cloud_` | `cloud_get_page`          |
| Jira On-Prem | `jira-myjira`     | `jira_`   | `jira_get_issue`           |
| Confluence On-Prem | `confluence-confluence` | `confluence_` | `confluence_get_page` |
| MyWiki On-Prem | `confluence-mywiki` | `mywiki_` | `mywiki_get_page`       |

The orchestrator context maps URLs to prefixes:

| URL                                        | Service    | Prefix        |
|--------------------------------------------|------------|---------------|
| `myjira.disney.com`                        | Jira       | `jira_`       |
| `jira.disney.com`                          | Jira       | `jira_`       |
| `disneyexperiences.atlassian.net`          | Jira       | `cloud_`      |
| `disneyexperiences.atlassian.net/wiki`     | Confluence | `cloud_`      |
| `confluence.disney.com`                    | Confluence | `confluence_` |
| `mywiki.disney.com`                        | Confluence | `mywiki_`     |
