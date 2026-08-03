---
name: vista-sprint-health
description: Detailed sprint health report with full board status, developer load, risk assessment, forecast, and actionable recommendations for PM/Scrum Master consumption.
---

# Skill: Vista Sprint Health

Detailed sprint health report with full board status, developer load, risk assessment, forecast, and actionable recommendations. Designed for PM/Scrum Master consumption and standup preparation.

## Trigger Phrases
- "run Vista sprint health"
- "Vista sprint report"
- "Vista health check"
- "Vista sprint status"

## Output Sections
1. Sprint at a Glance (status breakdown table)
2. Changes since last check
3. Developer load analysis
4. Sprint board detail (full ticket table)
5. Risk assessment (stale PRs, P1s, blocked, carryover risk)
6. Sprint forecast (optimistic/realistic/conservative)
7. Actions for today
8. Overall health rating

## Configuration
| Parameter | Value |
|-----------|-------|
| Jira Instance | disneyexperiences.atlassian.net (Cloud) |
| MCP | mcp_jira_cloud |
| Project | COREEXP |
| SP Field | customfield_10042 |
| Sprint Duration | 2 weeks (10 work days) |
| Previous Sprint Velocity | 46 SP (Vista Sprint 32) |
| Snapshot File | vista-sprint-snapshot.json |

## Health Rating Logic
| Condition | Rating |
|-----------|--------|
| burned% >= elapsed% AND no P1 open | 🟢 ON TRACK |
| burned% within 20% of elapsed% | 🟡 ON TRACK with flags |
| burned% < 50% of elapsed% | 🟠 AT RISK |
| blocked > 3 OR no progress 2 days | 🔴 OFF TRACK |

**⏸ CHECKPOINT — Confirm sprint and snapshot data are current before generating the health report**
