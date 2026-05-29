# Finder Services Team Workspace

Content propagation, publishing, facility services, and discovery across Disney digital properties.

## Studios

| Studio | Focus | Profiles |
|--------|-------|----------|
| **Triumph** | Sustainment + development (explorer, facility-svc, publishers) | sustainment, ops, dev-core, qa |
| **Incredibles** | PM / project management | pm |

## Services

- `facility-svc` — Facility data service
- `finder-assembler` — Content assembly/aggregation
- `explorer-svc` — Content exploration API

## Channels (Publishers)

- `characters-publisher`
- `content-publisher`
- `schedules-publisher`
- `facilities-publisher`
- `facility-status-publisher`

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

# Or use as an isolated session
koda chat --ws finder-services-team
```

## Context Files

| File | Purpose |
|------|---------|
| `context/team_context.md` | Team structure, services, architecture |
| `context/testing_workflow.md` | Black-box testing protocol (inherited by all studios) |

## Profiles

- **dev-core** — orchestrator, code review, architecture, PR creation
- **qa** — API testing, Bruno collections, test planning, coverage analysis
- **sustainment** — incident triage, RCA, stability validation, alert analysis

## Jira

- Prefix: `GIT-`
- Host: myjira.disney.com
- Boards: Triumph (8644), Incredibles (4972)
