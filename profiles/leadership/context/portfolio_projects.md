# Portfolio Projects

This file is populated by the workspace `teams` configuration. When a leadership workspace is applied, the teams array provides:

- Team name
- Workspace reference
- Jira project keys
- Board IDs

The portfolio_analyst_agent reads this to know which Jira projects to query across.

## Expected workspace.json format

```json
{
  "teams": [
    { "name": "Team Name", "workspace": "workspace-id", "jira_projects": ["KEY"], "board_ids": [1234] }
  ]
}
```

## How agents use this
- portfolio_analyst_agent: iterates all jira_projects for cross-team metrics
- quarterly_reporter_agent: groups achievements by team
- cross_team_coordinator_agent: maps dependencies between teams
- executive_briefing_agent: summarizes per-team status
