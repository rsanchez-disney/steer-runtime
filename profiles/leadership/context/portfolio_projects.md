# Portfolio Projects

This file is populated by the workspace `teams` configuration. When a leadership workspace is applied, the teams array provides:

- Team/studio name
- Workspace reference (optional — links to a child workspace)
- Jira project keys
- Board IDs
- Studio field value (for JQL: `Studio = "value"`)
- Studio ID (numeric, for JQL: `Studio = id`)
- Team ID (numeric, for JQL: `Team = id` — used when Studio field is absent)

## Expected workspace.json format

```json
{
  "teams": [
    {
      "name": "Studio Name",
      "workspace": "workspace-id",
      "jira_projects": ["ROS"],
      "board_ids": [6349],
      "studio": "ROS - Studio Name | Ruth",
      "studio_id": 49374,
      "team_id": 1988
    }
  ]
}
```

### Field usage

| Field | Required | Purpose |
|-------|----------|---------|
| name | yes | Display name for reports |
| workspace | no | Links to child workspace for drill-down |
| jira_projects | yes | Jira project keys to query |
| board_ids | yes | Scrum/Kanban board IDs |
| studio | no | Studio field value for JQL filtering |
| studio_id | no | Numeric Studio ID (alternative to name) |
| team_id | no | Team field ID — use when project uses Team instead of Studio |

### JQL construction

When querying for a team's work:
- If `studio` is set: `project in (KEYS) AND Studio = "value"`
- If `studio_id` is set: `project in (KEYS) AND Studio = id`
- If `team_id` is set: `project in (KEYS) AND Team = id`
- If none: `project in (KEYS)` (all work in that project)

## How agents use this

- portfolio_analyst_agent: iterates all teams, builds per-studio JQL for cross-team metrics
- quarterly_reporter_agent: groups achievements by team name
- cross_team_coordinator_agent: maps dependencies between teams using jira_projects overlap
- executive_briefing_agent: summarizes per-team status using board_ids for sprint data

## Jira Custom Field Mapping

| JQL Name | API Field | Type |
|----------|-----------|------|
| Studio | `customfield_20001` | `{value, id}` |
| Team | `customfield_22600` | `{name, id}` |
