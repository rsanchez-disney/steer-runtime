---
name: sprint-capacity-analysis
description: Analyzes sprint capacity vs demand for a release or filter, computes dev load, flags Feature Complete and close-date risks, and provides actionable recommendations.
---

# Skill: Sprint Capacity Analysis

Generates a capacity-vs-demand analysis from a Jira filter or JQL query, computing per-developer load, sprint-by-sprint allocation, and risk assessment against milestone dates.

## Trigger Phrases
- "analyze capacity for..."
- "can we make the deadline?"
- "sprint capacity check"
- "release feasibility"

## Parameters
| Parameter | Required | Default | Example |
|-----------|----------|---------|----------|
| source (filter_id or JQL) | Yes | — | Filter 216504 or JQL string |
| feature_complete_date | Yes | — | 2026-06-10 |
| all_close_date | Yes | — | 2026-07-09 |
| first_sprint_name | Yes | — | Vista Sprint 32 |
| capacity_per_dev | No | 8 SP | — |
| num_devs | Yes | — | 4 |
| sprint_capacity_override | No | — | {"Sprint 32": 27} |

**⏸ CHECKPOINT — Confirm filter/JQL source, milestone dates, and team size before running the analysis**

## Output Sections
1. Executive Summary (health indicators per milestone)
2. Sprint Calendar & Capacity
3. Status Breakdown
4. Developer Load
5. Feature Complete Assessment
6. All-Close Assessment
7. Unplanned/Unassigned Items
8. Recommendations

## Configuration
| Parameter | Value |
|-----------|-------|
| Jira Instance | myjira.disney.com (Server) or disneyexperiences.atlassian.net (Cloud) |
| SP Field (Server) | customfield_10003 |
| SP Field (Cloud) | customfield_10042 |
| Sprint Duration | 2 weeks (10 work days) |
| Work Days | Mon–Fri only for all calculations |
