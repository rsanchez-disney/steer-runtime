# Compass MCP setup guide

## Step 1 — Create your MCP server

Go to https://compass.wdprapps.disney.com/mcp and create a personal MCP server.

## Step 2 — Add toolsets

Select the tools you want available (e.g., Splunk, ServiceNow, BAPP Runbooks). Pick what's relevant to your team.

## Step 3 — Get your credentials

In your MCP server page, go to the **Install & Use** section and click **Claude Code Configure**. You'll see a block like:

```bash
claude mcp add --scope user --transport http kiro https://compass.wdprapps.disney.com/api/mcp/<YOUR_ID> \
  --header "Authorization: Bearer <YOUR_TOKEN>"
```

From this, extract:
- **Compass URL**: `https://compass.wdprapps.disney.com/api/mcp/<YOUR_ID>`
- **Compass Token**: the Bearer token value

## Step 4 — Configure in Koda

Run:

```bash
koda configure
```

Navigate to the configuration screen.

### Set the Compass URL

In the **env vars** section, set:

```
COMPASS_URL = https://compass.wdprapps.disney.com/api/mcp/<YOUR_ID>
```

### Set the Compass Token

In the **MCPs** section, set:

```
COMPASS_TOKEN = <YOUR_TOKEN>
```

## Step 5 — Regenerate MCP config

Press `r` in the Koda TUI to regenerate the MCP configuration. This rebuilds `mcp.json` with your new Compass credentials.

## Step 6 — Verify

```bash
koda doctor
```

Look for `✓ compass` in the MCP servers section.

## Done

Your agents now have access to Compass tools (Splunk queries, ServiceNow, BAPP Runbooks, etc.) depending on which toolsets you enabled in Step 2.
