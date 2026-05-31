# Workspace Enrichment — Launchpad Data

When asked to "enrich workspace", "add environments", "add pipelines", or "setup launchpad" for a workspace:

## Steps

1. **Read workspace.json** — get the workspace name and projects list
2. **Query Harness** — use `harness_list_pipelines` with the workspace's Harness org/project to find matching pipelines for each project
3. **Query Harness environments** — use `harness_list_environments` to get available environments
4. **Infer health URLs** — follow the naming convention: `https://{service}-{env}.wdprapps.disney.com/health`
5. **Update workspace.json** — add `harness` config and `environments` to each project

## Output Format

Add to workspace.json:
```json
{
  "harness": {
    "org": "<detected org>",
    "project": "<detected project>"
  },
  "projects": [
    {
      "name": "service-name",
      "repo": "Org/repo-name",
      "pipeline": "<harness pipeline identifier>",
      "environments": {
        "latest": { "url": "https://service-name-latest.wdprapps.disney.com", "health": "/health" },
        "stage": { "url": "https://service-name-stage.wdprapps.disney.com", "health": "/health" },
        "load": { "url": "https://service-name-load.wdprapps.disney.com", "health": "/health" },
        "prod": { "url": "https://service-name.wdprapps.disney.com", "health": "/health" }
      }
    }
  ]
}
```

## Rules

- Only add `harness` if pipelines are found for the workspace's projects
- Only add `environments` if the service follows the standard URL pattern
- Ask the user to confirm before writing changes
- If Harness org/project is unknown, ask the user (common orgs: Commerce, Architecture_Engineering, NGSE)
- Health endpoint defaults to `/health` — ask if different
- Do NOT modify existing fields — only add missing ones
