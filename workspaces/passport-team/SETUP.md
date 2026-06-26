# Passport Team Workspace — Setup

## One-time setup (2 minutes)

### 1. Apply the workspace

```bash
koda workspace apply passport-team
```

### 2. Configure tokens

Add to `~/.kiro/tokens.env`:

```
JIRA_PAT_cloud=<your Atlassian Cloud API token>
JIRA_URL_cloud=https://disneyexperiences.atlassian.net
JIRA_EMAIL_cloud=your.name@disney.com
CONFLUENCE_PAT_cloud=<same token>
CONFLUENCE_URL_cloud=https://disneyexperiences.atlassian.net/wiki
CONFLUENCE_EMAIL_cloud=your.name@disney.com
XRAY_CLOUD_CLIENT_ID=<when available>
XRAY_CLOUD_CLIENT_SECRET=<when available>
```

| Token | Generate at |
|-------|------------|
| JIRA_PAT_cloud | https://id.atlassian.com/manage-profile/security/api-tokens |
| XRAY_CLOUD_CLIENT_ID | Jira → Apps → XRay → Settings → API Keys |
| XRAY_CLOUD_CLIENT_SECRET | Same as above |

Note: JIRA_PAT and CONFLUENCE_PAT use the same Atlassian API token.

### 3. Verify

```bash
curl -s -w "\nHTTP: %{http_code}" -u "your.name@disney.com:YOUR_TOKEN" \
  "https://disneyexperiences.atlassian.net/rest/api/3/myself"
```

Expected: HTTP 200.

### 4. Start

```bash
koda chat
```

## Agents

| Agent | Purpose |
|-------|---------|
| qa_orchestrator_agent | Routes QA tasks, Jira + Confluence |
| mobile_test_executor_agent | Executes XRay Gherkin tests via Appium |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 401 Unauthorized | Regenerate token at Atlassian |
| Variable not found | Check ~/.kiro/tokens.env has all _cloud vars |
| Tool not found | `koda workspace apply passport-team` |
