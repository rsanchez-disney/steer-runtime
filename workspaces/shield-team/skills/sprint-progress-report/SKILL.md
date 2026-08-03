---
name: sprint-progress-report
description: Generates a concise, friendly progress report per developer showing what moved, what's stuck, what's blocked, and what needs attention. Accepts a sprint, filter, JQL, or Kanban board as input.
---

# Skill: Sprint Progress Report

Produces a triage-friendly progress snapshot split by developer. Designed for daily standups, stakeholder check-ins, and PM awareness.

## Trigger Phrases
- "sprint progress for..."
- "developer progress"
- "what's happening in the sprint?"
- "standup summary"

## Parameters
| Parameter | Required | Default | Example |
|-----------|----------|---------|----------|
| source | Yes | — | Sprint name, filter ID, JQL, or board ID |
| target_date | Yes | — | 2026-07-09 |
| velocity_per_dev | No | 8 SP | — |
| stale_threshold_days | No | 2 | — |

**⏸ CHECKPOINT — Confirm sprint source and target date before generating the progress report**

## Output Sections
1. Sprint Health Dashboard (status breakdown, blockers, unpointed)
2. Recommendations (prioritized actions with ticket keys)
3. Developer Breakdown (per-person cards with activity signals)

## Key Features
- Stale detection: sprint input = sprint start baseline; filter/JQL = ticket created date
- Work days only (Mon–Fri) for all calculations
- Activity signals: 🟢 Active (24h) / 🟡 Quiet (2-3d) / 🔴 Silent (>3d)
- Flags unpointed tickets (assumes 3 SP for capacity math)
- Fetches last 3 comments for activity context

## Configuration
| Parameter | Value |
|-----------|-------|
| Jira Instance | myjira.disney.com (Server) or disneyexperiences.atlassian.net (Cloud) |
| SP Field (Server) | customfield_10003 |
| SP Field (Cloud) | customfield_10042 |
| Sprint Duration | 2 weeks (10 work days) |
