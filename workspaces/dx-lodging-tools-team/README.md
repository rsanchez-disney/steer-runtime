# DX Lodging Tools Workspace

Multi-team workspace for DX Lodging Tools — manages DLR resort reservations, checkout, celebrations, trade retrieve, lodging pinned offers, package entitlements, and non-Disney add-ons.

## Apply

```bash
# Sustainment (Rocket)
koda workspace apply rocket-team

# Project team working on Non-Disney Addons (Star Lord)
koda workspace apply starlord-veggies

# Project team working on TEP3 (Yondu)
koda workspace apply yondu-tep3
```

---

## What's Included

### Projects

| Team | Repos | Key Applications |
|------|:-----:|-----------------|
| Rocket | 20 | Auth, Celebrations, Package Entitlement, Resort Reservation VA, Cast/Guest RR, Checkout, Trade Retrieve, Pinned Offer, Ticket Order/Voucher Batch |
| Star Lord | 3 | Non-Disney Addons SPA/API/VA (Rental Car, Shuttle, Travel Protection, Area Attractions) |
| Yondu | 4 | Resort Reservation VA, Guest RR SPA/API, Package Entitlement (subset of Rocket) |

### Context Files

| File | Location | Content |
|------|----------|---------|
| `domain_context.md` | Parent | Architecture, environments, health checks, AppDynamics, business flows |
| `splunk_queries.md` | Parent | All Splunk indexes, field names, common queries |
| `team_members.md` | Parent | Globant + Cast Members roster across all teams |
| `lodging-tools-conventions.md` | Parent (rules/) | Shared conventions (SPA→WebAPI→VA, deployment, Feign, Splunk) |
| `team_context.md` | rocket-team | 20 apps with BAPP IDs, repos, partners, ServiceNow |
| `alerts_runbook.md` | rocket-team | Alert inventory, severity levels, handling procedures, DMP batch |
| `team_context.md` | starlord-team | Star Lord contact, workflow |
| `project_context.md` | starlord-veggies | Non-Disney Addons domain, repos, Splunk, AWS |
| `team_context.md` | yondu-team | Yondu contact, workflow |
| `project_context.md` | yondu-tep3 | TEP3 domain, repos subset, Jira |

### Custom Agent

| Agent | Location | Description |
|-------|----------|-------------|
| `rocket_alert_analyst_agent` | rocket-team | Analyzes Splunk alerts via Chrome DevTools — reads results, determines severity, identifies root cause, recommends actions |

**Requires:** Chrome with `--remote-debugging-port=9222` and authenticated in Splunk.

### Rules

| Rule | Source | Purpose |
|------|--------|---------|
| `lodging-tools-conventions.md` | Parent | SPA→WebAPI→VA pattern, Feign connectors, deployment, Splunk, PMS RabbitMQ |
| `conventional_commit` | Common | Conventional commit format |
| `general-java-development` | Common | Java/Spring Boot best practices |
| `general-node-development` | Common | Node.js best practices |
| `general-angular-development` | Common | Angular best practices |
| `general-aws` | Common | AWS best practices |
| `general-api-design` | Common | REST API design patterns |
| `general-testing-strategies` | Common | Testing strategies |
| `jira-commit-format` | Common | Jira ticket reference in commits |
| `jira-safety` | Common | Jira field safety guardrails |

### Profiles

| Profile | Agents | Used by | Purpose |
|---------|:------:|---------|---------|
| `dev-core` | 21 | All teams | Code review, PRs, architecture, testing, security |
| `dev-web` | 5 | All teams | Angular UI, Node gateway, backend specialists |
| `sustainment` | 5 | Rocket | Incident response, triage, RCA, stability validation |
| `dev-ui` | 3 | Rocket | Legacy Angular, Polymer, Lambda |

### Jira & Wiki

| Team | Jira Prefix | Board | Wiki |
|------|-------------|-------|------|
| Rocket | ROS- | [10320](https://myjira.disney.com/secure/RapidBoard.jspa?rapidView=10320) | [Studio ROCKET](https://mywiki.disney.com/spaces/ROS/pages/451024499/Studio+ROCKET) |
| Star Lord | ROS- | [10955](https://myjira.disney.com/secure/RapidBoard.jspa?rapidView=10955) | [Star-Lord LSWM](https://mywiki.disney.com/spaces/ROS/pages/925995234) |
| Yondu | TEP3- | [12887](https://myjira.disney.com/secure/RapidBoard.jspa?rapidView=12887) | [Yondu YMP](https://mywiki.disney.com/spaces/ROS/pages/1222089118) |

### GitHub Organizations

- `wdpro-development` — Auth, Celebrations, Trade Retrieve, Lodging Pinned Offer
- `wdprd-development` — Cast/Guest RR SPAs & WebAPIs, Checkout SPA/WebAPI, Non-Disney Addons SPA/API
- `wdprt-paap-api` — Package Entitlement, Resort Reservation VA, Ticket Lambdas, Checkout VA, Non-Disney Addons VA

---

## Structure & Design

```
dx-lodging-tools-team/                        ← Shared foundation (architecture, Splunk, conventions)
├── rocket-team/                           ← Sustainment team (20 apps, alerts, incident response)
│   └── profiles/sustainment/agents/     ← Custom alert analyst agent
├── starlord-team/                         ← Project team (parent)
│   └── starlord-veggies/                ← Current project: Non-Disney Add Ons
└── yondu-team/                            ← Project team (parent)
    └── yondu-tep3/                      ← Current project: Pre-Arrival / Post Booking
```

### Why this structure?

1. **No redundancy** — Shared architecture, Splunk indexes, conventions, and observability live in the parent. Each child only adds what's unique to their team/project.

2. **Different roles, different profiles** — Rocket needs `sustainment` + alert analysis. Star Lord and Yondu need `dev-core` + `dev-web` for feature development.

3. **Separate ceremonies** — Each team has their own Jira board, dailies, and sprint cadence. Applying a specific workspace gives the agent the right Jira prefix and board context.

4. **Shared repos, different scopes** — Yondu works on a subset of Rocket's repos. The parent provides the full domain context so any team can troubleshoot across the stack.

### Inheritance chain

```
dx-lodging-tools-team
│   profiles: [dev-core]
│   rules: [conventional_commit, general-java-development, general-node-development, ...]
│   context: domain_context.md, splunk_queries.md, team_members.md
│
├── rocket-team (extends: dx-lodging-tools-team)
│   profiles: + [sustainment, dev-web, dev-ui]
│   jira_prefix: ROS-
│   projects: 20 repos
│   context: + team_context.md, alerts_runbook.md
│
├── starlord-team (extends: dx-lodging-tools-team)
│   profiles: + [dev-web]
│   context: + team_context.md
│   │
│   └── starlord-veggies (extends: starlord-team)
│       jira_prefix: ROS-
│       projects: 3 repos (Non-Disney Addons SPA/API/VA)
│       context: + project_context.md
│
└── yondu-team (extends: dx-lodging-tools-team)
    profiles: + [dev-web]
    context: + team_context.md
    │
    └── yondu-tep3 (extends: yondu-team)
        jira_prefix: TEP3-
        projects: 4 repos (subset of Rocket)
        context: + project_context.md
```

---

## Scaling Guide

### Adding a new project to an existing team

If Star Lord starts a new project "UCM":

```bash
mkdir -p starlord-team/starlord-ucm/context
```

Create `starlord-team/starlord-ucm/workspace.json`:
```json
{
  "name": "starlord-ucm",
  "extends": "starlord-team",
  "description": "UCM project — [description]",
  "team": "Studio Star Lord — UCM",
  "jira_prefix": "XYZ-",
  "projects": [...]
}
```

Add `starlord-team/starlord-ucm/context/project_context.md` with project-specific info.

### Adding a new team

If a new team "Groot" joins Lodging Tools:

```bash
mkdir -p dx-lodging-tools-team/groot-team/context
```

Create `groot-team/workspace.json`:
```json
{
  "name": "groot-team",
  "extends": "dx-lodging-tools-team",
  "description": "Studio Groot — [description]",
  "team": "Studio Groot",
  "profiles": ["dev-core", "dev-web"],
  "default_agent": "orchestrator"
}
```

If Groot has sub-projects, nest them inside `groot-team/` following the same pattern.

### Removing a team or project

Delete the folder. Parent and sibling workspaces are unaffected.

### Adding shared context

New information that applies to ALL teams (e.g., a new shared service, a new Splunk index) goes in `dx-lodging-tools-team/context/` or `dx-lodging-tools-team/rules/`. All children inherit it automatically.

---

## Teams

| Team | Role | Workspace | Jira |
|------|------|-----------|------|
| Rocket | Sustainment (20 apps) | `rocket-team` | ROS- |
| Star Lord | Project (new apps) | `starlord-veggies` | ROS- |
| Yondu | Project (existing apps) | `yondu-tep3` | TEP3- |

## Escalation

| Team | Email | Teams Channel |
|------|-------|---------------|
| Rocket | DPEP.DL-Studio.Rocket@disney.com | dx-studio-rocket |
| Star Lord | DX.DL-Studio.Star.Lord@disney.com | Studio Star-Lord |
| Yondu | StudioYondu-LodgingTools@twdc.onmicrosoft.com | Studio Yondu \| YMP |
| ServiceNow | — | Assignment group: `web-global-rocket` |
