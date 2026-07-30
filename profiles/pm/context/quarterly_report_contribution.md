# Contributing to quarterly reports (PM perspective)

## Your role

As a PM/Scrum Master, your sprint delivery reports provide the raw data and narrative that feeds into the quarterly studio report. You don't generate the quarterly report yourself — the `leadership` profile handles that — but you can contribute directly.

## Sprint reports that feed quarterly

Use `delivery_reporter_agent` to generate sprint reports during the quarter:

```
koda chat --agent delivery_reporter_agent
```

```
Create sprint report for ROS-BAN-SP42
```

```
Generate delivery report for our last completed sprint
```

These 10-section reports capture velocity, goals, flagged items, and releases that the quarterly reporter can later reference.

## Direct contribution to quarterly reports

If you have the `leadership` profile installed, you can generate studio reports directly:

```
koda chat --agent quarterly_reporter_agent
```

```
Create Q3 FY2026 report for Studio Bang
```

The agent handles Jira queries, metrics, and Confluence publishing. You validate deliverables and business impact at checkpoints.

## End-of-quarter checklist

1. Ensure last sprint of the quarter has a delivery report published
2. Note any carry-over items or blocked epics (the quarterly agent will ask about risks)
3. Identify top 3-5 deliverables the agent might miss (internal knowledge, toggle-ons, launches)
4. Have board IDs and sprint names handy if your studio isn't in `vertical-config.json`

## What the quarterly agent pulls from Jira

- Resolved issues (by `resolved` date, not `updated`)
- Created issues (for net backlog calculation)
- Sprint velocity (from board data)
- Epic completions

It does NOT pull from your sprint reports automatically — the skill queries Jira directly. Sprint reports are supplementary context you can reference during the checkpoint review.

## Useful PM prompts for quarter-end

```
What was our average velocity this quarter?
```

```
List all epics we completed in Q3
```

```
Show me carry-over trends over the last 6 sprints
```

```
What blockers recurred this quarter?
```

These use `sprint_manager_agent` or `risk_tracker_agent` and help you prepare before the quarterly report is generated.
