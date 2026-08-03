---
name: vista-daily-check
description: Quick sprint pulse for the [Int] Vista Teams channel with status breakdown, changes since last check, recent comments, and auto-posting via webhook.
---

# Skill: Vista Daily Check

Quick sprint pulse for the [Int] Vista Teams channel. Produces a concise, copy-paste-ready summary comparing current state vs last check. Includes recent developer comments from active tickets.

## Trigger Phrases
- "run Vista daily check"
- "Vista daily"
- "Vista pulse"
- "quick Vista update"

## Output Sections
1. Sprint stats (tickets, SP, day X/10)
2. Status breakdown (Closed, Review, Dev, Open)
3. Changes since last check (closures, advances)
4. Recent comments (last 3 days, from active tickets)
5. Attention items (stale PRs, P1s, unstarted past midpoint)
6. Forecast + health indicator
7. Scrum Board link

## Configuration
| Parameter | Value |
|-----------|-------|
| Jira Instance | disneyexperiences.atlassian.net (Cloud) |
| MCP | mcp_jira_cloud |
| Project | COREEXP |
| SP Field | customfield_10042 |
| Sprint Duration | 2 weeks (10 work days) |
| Teams Channel | [Int] Vista |
| Scrum Board | https://disneyexperiences.atlassian.net/jira/software/c/projects/COREEXP/boards/3558 |
| Snapshot File | vista-sprint-snapshot.json |
| Schedule | Mon-Fri 8:00 AM + 4:00 PM (launchd) |

## Auto-posting

**⏸ CHECKPOINT — Review the generated summary before posting to the Teams channel**

Scheduled via launchd (`com.vista.daily-check.plist`). Script: `vista-daily-check-scheduled.py`. Wrapper with retry: `run-vista-daily-check.sh` (3 retries, 30s delay for network readiness).
