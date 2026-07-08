# DCL WFER Travel Workspace

EFM WFER Travel — DCL Crew Workflow/Travel system. Java backend, Node.js BFF, Angular UI, and MariaDB schema across 4 coordinated repos.

## Quick start

```bash
koda workspace apply dcl-wfer-travel-team
koda chat
```

## Profiles

| Profile  | Purpose                                            |
|:---------|:---------------------------------------------------|
| dev-core | Orchestration, architecture, code review, PRs      |
| dev-web  | Backend (Java), WebAPI (Node), UI (Angular)        |
| qa       | Test planning, automation                          |

## Repositories

| Repo                      | Tech                  | Role              |
|:--------------------------|:----------------------|:------------------|
| dcl-apps-travel-service   | Java 21 / Spring Boot | Core backend      |
| dcl-apps-travel-webapi    | Node.js 22 / Restify  | BFF / Gateway     |
| dcl-apps-travel-ui        | Angular 20 / TS 5.8   | Frontend UI       |
| dcl-crew-travel-datamodel | SQL (MariaDB)         | Schema/migrations |

## Architecture

```text
UI (Angular) → WebAPI (Node/Restify) → Service (Java/Spring) → MariaDB
```

All repos share coordinated releases (currently v26.6.2). Default branch: `develop`.

## Context files

| File | Purpose |
|:-----|:--------|
| `context/team_context.md` | Architecture, stack, conventions, contacts |
| `context/service_repo_mapping.md` | Repo → agent routing |
| `context/splunk_services.md` | Splunk index and query patterns |

## Jira

- **Project**: DCLWFER
- **Instance**: disneyexperiences.atlassian.net
- **Board**: 6071
