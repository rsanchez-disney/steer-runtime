# Studio Last Dragon — Search Tech Sustainment

Search infrastructure team powering search across Disney's digital properties (WDW, DLR, HKDL, DCL, Disney Springs, DVC).

## Quick Start

```bash
koda workspace apply last-dragon-team
koda mcp-install
koda chat
```

## Profiles

| Profile | Purpose |
|---------|---------|
| core | Email, log analysis, story analysis |
| dev-core | Code, review, test, security, PRs, architecture |
| qa | Test planning, automation, defect analysis |
| pm | Sprints, standups, retros, delivery reports |
| sustainment | Incident response, ServiceNow, Splunk |
| ops | Infra, deployments, log analysis, releases |

## Repositories

| Repo | Tech | Purpose |
|------|------|---------|
| wdpr-content-search-api | Java | Search Service |
| wdpr-content-search-webapi | Node.js | Search Web API |
| wdpr-content-search-indexing-svc | Java | Search Indexing Service |
| Elastic | Config | ES indices, templates, config |
| spring-batch-app | Java | Spring Batch → Elasticsearch |
| ApacheNutch | Java | Web crawler |
| PE_Scripts | JMeter | Performance tests |

## Key Resources

- [Team Wiki](https://disneyexperiences.atlassian.net/wiki/spaces/DPEPSD/pages/445256067/DX+Studio+Raya)
- [Jira Board (Kanban)](https://disneyexperiences.atlassian.net/jira/software/boards/12243)
- ServiceNow Assignment Group: `app-global-finder-search`

See [Team Workspaces Guide](../../docs/reference/TEAM_WORKSPACES.md) for workspace details.
