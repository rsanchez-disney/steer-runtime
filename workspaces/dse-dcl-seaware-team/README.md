# DSE DCL Seaware Workspace

**Workspace:** `dse-dcl-seaware`  
**Profiles:** `dev-core`, `qa`, `dev-web`, `dev-ui`, `pm`, `ba`, `sustainment`  
**Jira:** `SEAS-*` on myjira.disney.com

## Quick Start

```bash
koda                         # Launch Koda TUI
# Press [w] → select dse-dcl-seaware
koda chat --agent orchestrator
```

## What This Workspace Covers

SEAS (Seaware Engineering & Application Solutions) — 6 studios owning 40+ services that bridge **Versonix Seaware** reservation system to Disney Cruise Line and Adventures by Disney digital properties.

## Studios (Subworkspaces)

Each studio has its own subworkspace with dedicated `team_context.md` and `project_architecture.md`.

| Studio | Subworkspace | Focus | Tech Lead | Stack |
|--------|-------------|-------|-----------|-------|
| **Atlantis** | `studio-atlantis/` | Platform, Security, Vendor Mgmt | Ken Sias | Ansible, GitLab, ActiveMQ |
| **Crush** | `studio-crush/` | Digital .NET APIs (Web/App) | John Madrid | C# .NET, Azure DevOps, ECS |
| **Gadget Hackwrench** | `studio-gadget-hackwrench/` | Java microservice rebuild (PCeC) | Ric Alvarez | Java 21, Spring Boot 3, WebFlux |
| **Triton** | `studio-triton/` | Finance & Back Office | Dominic Foti | C# .NET, GraphQL, Node.js |
| **Maui** | `studio-maui/` | Revenue Management | Marcelo Castro | Angular 20, NestJS, Java (Zazu) |
| **Data Droids** | `studio-data-droids/` | Reporting & Insights | Cory Marshall | MicroStrategy, SQL |

## Context Structure

```
dse-dcl-seaware/
├── workspace.json                          # Parent config (profiles, projects, teams)
├── context/
│   └── team_context.md                     # Shared: org, architecture, CI/CD, environments, monitoring
├── studio-atlantis/
│   ├── workspace.json
│   └── context/
│       ├── team_context.md                 # Team, BAPPs, repos, responsibilities
│       └── project_architecture.md         # Docker-only repos, Versonix WAR packaging
├── studio-crush/
│   ├── workspace.json
│   └── context/
│       ├── team_context.md
│       └── project_architecture.md         # .NET APIs, service catalog
├── studio-gadget-hackwrench/
│   ├── workspace.json
│   └── context/
│       ├── team_context.md
│       └── project_architecture.md         # Java services, pom.xml details, dependency graph
├── studio-triton/
│   ├── workspace.json
│   └── context/
│       ├── team_context.md
│       └── project_architecture.md         # Screenpop (Node.js), GraphQL, .NET batch
├── studio-maui/
│   ├── workspace.json
│   └── context/
│       ├── team_context.md
│       └── project_architecture.md         # Scuttle (Nx monorepo), Zazu eventing
└── studio-data-droids/
    ├── workspace.json
    └── context/
        ├── team_context.md
        └── project_architecture.md         # MicroStrategy, ETL pipelines
```

## Source Code Locations

| Platform | Organization | Studios |
|----------|-------------|---------|
| Azure DevOps | `disney-cruise/shoreside` | Crush, Triton, Maui (legacy .NET) |
| GitHub | `github.disney.com/dcl/` | Gadget Hackwrench, Maui (Scuttle), Triton (Screenpop) |
| GitHub | `github.disney.com/dcl-applications/` | Atlantis (Seaware containers) |
| GitLab | `gitlab.disney.com/dse/` | Atlantis (Helm, Ansible), Triton (GraphQL) |

## Key Services (GitHub)

| Service | Repo | Studio | Description |
|---------|------|--------|-------------|
| DataNavigator | `dcl/seas-datanavigator` | Gadget Hackwrench | Central orchestration layer |
| Reservation List | `dcl/seas-reservation-list` | Gadget Hackwrench | Reservation headers |
| Reservation Details | `dcl/seas-reservation-details` | Gadget Hackwrench | Full reservation data |
| Client Service | `dcl/seas-client-service` | Gadget Hackwrench | Guest profiles |
| Lookup Service | `dcl/seas-lookup-service` | Gadget Hackwrench | Reference data |
| Activity Availability | `dcl/seas-activity-availability` | Gadget Hackwrench | Onboard activities |
| Right to Forget | `dcl/seas-rtf` | Gadget Hackwrench | GDPR erasure (Lambda) |
| Scuttle | `dcl/scuttle` | Maui | Angular/NestJS portal |
| Screenpop | `dcl/dcl-seaware-genesys-screenpop` | Triton | Genesys CTI proxy |
| ZaZu Eventing| `dcl/zazu-eventing` | Maui | polling for changes and emitting events |

## CI/CD Pipeline

```
GitHub (merge) → Harness CI → AWS ECR → Harness CD → GitLab Helm → Rancher/K8s
```

## MyWiki Reference

- [SEAS Home](https://mywiki.disney.com/spaces/SEAS/pages/748258579)
- [Studios at a Glance](https://mywiki.disney.com/spaces/SEAS/pages/831995511)
- [BAPP/Repo Association](https://mywiki.disney.com/spaces/SEAS/pages/758612960)
- [CI/CD Flow](https://mywiki.disney.com/spaces/SEAS/pages/1172341594)
- [Zazu Architecture](https://mywiki.disney.com/spaces/SEAS/pages/1108510864)