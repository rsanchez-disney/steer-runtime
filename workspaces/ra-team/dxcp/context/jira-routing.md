# Jira Instance Routing (DXCP)

## Dual Instances

DXCP uses TWO Jira instances with different field schemas:

| Instance | Host | Usage |
|----------|------|-------|
| Cloud (default) | disneyexperiences.atlassian.net | IOET project, primary ticketing |
| Enterprise | jira.disney.com / myjira-prod | Legacy, some cross-team tickets |

## Cloud Instance (dx-atlassian-cloud-prod)

- **Project:** IOET
- **Search:** `project = IOET AND text ~ 'keyword'`
- **Get issue:** `jira_get_issue` with IOET-XXXX

### Custom Fields (Cloud)

| Purpose | Field ID |
|---------|----------|
| Parent/Epic | customfield_10014 |
| Acceptance Criteria | customfield_10166 |
| Environment | standard field |
| Sprint | standard field |
| Team | standard field |

**Important:** AC goes in `customfield_10166`, NOT in the description field.

## Enterprise Instance (myjira-prod)

### Custom Fields (Enterprise)

| Purpose | Field ID |
|---------|----------|
| Epic Link | customfield_13912 |
| AC | customfield_16400 |
| Story Points | customfield_24800 |

## Story Creation Rules

1. Default to Cloud instance unless explicitly told otherwise
2. AC always in the dedicated AC field (not description)
3. Use compass-mcp for both read and write operations
4. Validate field IDs against the target instance before writing

## Story Templates

### Feature Story
- Summary: `[Component] Action description`
- Type: Story
- AC: Testable bullet points in AC field
- Description: Context, background, links

### Bug
- Summary: `[Component] Bug description`
- Type: Bug
- Steps to reproduce in description
- Expected vs actual behavior

### SOP Gap
- Summary: `[SOP] Process gap description`
- Type: Task
- Link to related incidents/RITMs

## Sprint Metrics Queries

```jql
# Active sprint items
project = IOET AND sprint in openSprints()

# Completed in sprint
project = IOET AND sprint = "Sprint Name" AND status = Done

# Team velocity
project = IOET AND sprint in closedSprints() AND status = Done
```

**Note:** JQL maxResults cap is 100. Paginate with startAt for larger result sets.
