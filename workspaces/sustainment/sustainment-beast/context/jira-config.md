
# Jira Configuration

- Project: APP
- Board: Beast Squad (ID: 468, Scrum)
- Sprint cadence: 2 weeks (10 business days)
- Current PI: 26.4 (sprints 26.4.1 through 26.4.5)
- PI Dates: Apr 20 - Jun 26, 2026
- Number of Sprints for this PI: 5
- Sprint naming: `APP - Iteration {PI}.{sprint_number}`
- Cloud ID: `b74e5abb-bafa-4a52-88a5-7fe9ba830b63`

## Custom Fields

| Field | Custom Field ID | Type | Notes |
|---|---|---|---|
| Squad (APP Squad) | `customfield_10166` | Dropdown | Used for squad assignment on tickets |
| Sprint | `customfield_10020` | Sprint (number) | Pass sprint ID as plain integer, not object |

### Squad Option IDs

| Squad | Value | Option ID |
|---|---|---|
| Cruz Ramirez | `Cruz (BaseApp/Food/Resort)` | `10248` |
| Storm | `Storm (GP/Attraction)` | `10249` |

### Default Squad Assignees

| Squad | Assignee | Account ID |
|---|---|---|
| Storm | RIGOBERT NGAHA | `5c45792687530c43d3a159c2` |
| Cruz Ramirez | Nicolas Miel | `712020:9a058180-f68c-4edc-a9ee-0a96f31f9021` |

### Current Sprint

| Sprint Name | Sprint ID | Board ID | State |
|---|---|---|---|
| APP - Iteration 26.4.5 | `1300` | `157` | active |

> **Note:** Sprint ID changes every 2 weeks. Update this when a new sprint starts.

## Velocity (last 3 sprints - Beast devs completed, ~90 days, as of 2026-06-05)

| Dev              | Tickets Done | Focus Areas                                                                      |
| ------------------| --------------| ----------------------------------------------------------------------------------|
| Edmund Nietes    | 25           | Cribl migrations, wiki documentation, deployments, foundation splits, monitoring |
| Cristian Lopez   | 22           | Deployments, AI tooling, postmortems, DB patching, Cribl, foundation, research   |
| David Herrera    | 16           | Cribl migrations, foundation splits, DSR, research, deployments                  |
| Leonidas Ramirez | 14           | Deployments, BFF, Cribl, FinOps, Splunk CICD, research, DSR                      |
| Andres Calvo     | 13           | AI/MCP tooling, incident research, CNIL masking, mobile app, custom pages        |
| Pravin Dake      | 12           | Cribl migrations, PII masking, deployments, wiki documentation, foundation       |
| Sergio Arean     | 11           | Deployments, research, mobile app, custom pages, CNIL masking                    |
| Kenneth Suarez   | 9            | Foundation splits, Cribl migrations, audit automation, cache docs, PII           |
| Ian Enriquez     | 5            | Mobile app setup, incident research, deployments                                 |

Note: Story points are not consistently used. Team tracks by task count and complexity.

## Common Issue Types

- Task: General work items, sustainment, deployments
- Enabler Story: Technical enablers (SDK, foundation, infrastructure)
- Dev Task: Development tasks
- Test Task: Testing/validation tasks
- Bug Prod: Production bugs
- Defect: Non-production defects

## Common Labels & Prefixes

- `[Sustainment]` — Operational/maintenance work
- `[Monitoring]` — Alert analysis and monitoring tasks
- `[Postmortem]` — Incident post-mortem analysis
- `[Research]` — Investigation tasks linked to incidents
- `[DSR]` — Data Subject Requests (GDPR)
- `[Storm]` — Storm squad related (backend microservices)
- `[SDK - OneID]` — OneID JWT migration tasks
- `[PROD]` / `[LOWER]` — Environment-specific tasks

## Enablers / Epics Where Tasks Go

- Sustainment tasks → Sustainment enabler in current PI
- Incident research → Sustainment enabler, linked to INC number
- Deployments/CHGs → Release management enabler
- SDK/Foundation → Technical enabler for the specific initiative
