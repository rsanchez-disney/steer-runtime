# Finder Services Team Workspace

Maintain and develop the guest discovery data pipeline and the real-time client data sync pipeline in the Disney Parks (WDW, DLR, HKDL) organization.

## Studios

| Studio | Focus | Profiles |
|--------|-------|----------|
| **Triumph** | Sustainment + development (Kanban) | dev-core, sustainment, qa |
| **Incredibles** | Development (Scrum) | dev-core, qa |

## Services

- `finder-assembler` — Cache assembly layer (FAS)
- `explorer-svc` — Content discovery read API
- `characters-publisher` — Character data publishing (Lambda)
- `content-publisher` — Generic content write/read (REST + Queue Consumer)
- `facilities-publisher` — Facility data publishing
- `facility-status-publisher` — Wait times and facility status
- `schedules-publisher` — Schedule data publishing

## Testing Tickets

When a ticket passes code review and is deployed to `latest`:

```
koda chat --ws finder-services-team
> Test ticket GIT-60790
```

The agent will:
1. Read the Jira ticket ACs
2. Build black-box test cases from the ACs + service context
3. Execute tests using Bruno collections against `latest` environment
4. Review responses and logs
5. Generate a pass/fail report

See `context/testing_workflow.md` for the full testing protocol.

### Key Points

- Testing is **black-box** — API calls, not code review
- Use Bruno MCP for authenticated requests (handles token refresh)
- Bruno collections repo: `finder-services-bruno-collections`
- Default environment: `latest`

## Quick Start

```bash
# Apply as your primary workspace
koda workspace apply finder-services-team

# Or use a studio-specific workspace
koda workspace apply finder-services-team/studio-triumph
koda workspace apply finder-services-team/studio-incredibles

# Or use as an isolated session
koda chat --ws finder-services-team
```

## Context Files

| File | Purpose |
|------|---------|
| `context/team_context.md` | Team structure, services, architecture |
| `context/testing_workflow.md` | Black-box testing protocol (inherited by all studios) |
| `context/tool_restrictions.md` | Restricted MCP tools |

## Profiles

- **dev-core** — orchestrator, code review, architecture, PR creation
- **qa** — API testing, Bruno collections, test planning, coverage analysis
- **sustainment** — incident triage, RCA, stability validation, alert analysis

## Jira

- **Project**: GIT
- **Instance**: disneyexperiences.atlassian.net
- **Boards**: Triumph (8644), Incredibles (4972)
