---
name: backlog-capacity-forecast
description: Analyzes a full backlog (CSV, filter, or JQL) against team capacity at multiple staffing levels. Projects sprint counts and generates an Excel report with gap analysis.
---

# Skill: Backlog Capacity Forecast

Takes a backlog and produces a single-tab Excel report with sprint projections, gap analysis, and actionable recommendations. Designed for roadmap planning, staffing conversations, and stakeholder communication.

## Trigger Phrases
- "how long will this take?"
- "backlog forecast"
- "staffing projection"
- "roadmap analysis"

## Parameters
| Parameter | Required | Default | Example |
|-----------|----------|---------|----------|
| source | Yes | — | CSV file, Jira filter ID, or JQL |
| dev_scenarios | No | [3, 4, 5] | Number of developers to model |
| velocity_optimistic | No | 8 SP/dev/sprint | — |
| velocity_realistic | No | 6 SP/dev/sprint | — |
| include_current_sprint | No | Yes | Include in-flight sprint SP |

**⏸ CHECKPOINT — Confirm source, dev scenarios, and velocity assumptions before generating the report**

## Output (Excel, single tab)
1. Executive Summary
2. Sprint Projections Table (color-coded: green ≤15, yellow 16-25, red >25 sprints)
3. Gap Analysis Table (missing AC, user stories, estimates, design docs)
4. Breakdown by Category (UI / Screenreader / Motion / Spike)
5. Current Sprint Load
6. Recommendations

## Gap Detection
| Gap | Severity |
|-----|----------|
| No AC | 🔴 Critical |
| No User Story | 🔴 Critical |
| 0 SP | 🟡 Flag |
| Blank SP | 🟡 Flag |
| No Fix Version | 🟡 Expected for backlog |
| Missing design docs | ⚠️ Blocker |

## Configuration
| Parameter | Value |
|-----------|-------|
| Velocity Models | Optimistic (8 SP) + Realistic (6 SP) |
| Sprint Duration | 2 weeks (10 work days) |
| Output | {project}_Capacity_Analysis.xlsx |
| Requires | Python 3 + openpyxl |
