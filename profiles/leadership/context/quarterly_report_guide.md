# Generating quarterly reports

## From the leadership profile

### Full vertical report (all studios)

Use `leadership_orchestrator_agent` or `quarterly_reporter_agent` directly.

```
koda chat --agent quarterly_reporter_agent
```

Prompts:

```
Generate the full Q3 FY2026 Lodging vertical report
```

```
Create the quarterly report for all studios in Lodging, Q4 FY2026
```

What you get:
- Parent Confluence page with executive summary, scorecard, combined roadmap
- Child page per studio (generated using the `quarterly-studio-report` skill)
- Director metrics across the vertical

### Single studio report

```
Create Q3 FY2026 report for Studio Bang in Lodging
```

```
Help me with the Q4 report for Nebula
```

```
Quarterly report for Terror — Q3 FY2026
```

What you get:
- One Confluence page with metrics, business impact, deliverables, roadmap, director metrics
- Fixed format (OUTPUT_TEMPLATE.md) — consistent across all studios

### Portfolio analytics (no Confluence output)

Use `portfolio_analyst_agent` for data queries without publishing:

```
Compare velocity trends across Lodging studios last 3 sprints
```

```
Which studios have growing backlogs this quarter?
```

```
Show me delivery health for all Lodging studios
```

### Executive briefing (narrative, not data)

Use `executive_briefing_agent` for communication drafts:

```
Summarize Q3 for my director — focus on revenue-generating studios
```

```
Draft a VP update on Lodging delivery health
```

---

## From the PM profile

### Sprint delivery report (per-sprint, not quarterly)

Use `delivery_reporter_agent`:

```
koda chat --agent delivery_reporter_agent
```

Prompts:

```
Create sprint report for ROS-BAN-SP42
```

```
Generate delivery report for our last completed sprint and publish to Confluence
```

What you get:
- 10-section report matching the DPE Confluence Cloud template
- Sprint goals, velocity, flagged items, releases, retrospective notes

### Feeding into quarterly reports

PM sprint reports feed into the quarterly narrative. At quarter end:

1. Run delivery reports for the last 6 sprints (one quarter)
2. Switch to `quarterly_reporter_agent`
3. Reference sprint reports: "Use the last 6 sprint reports to build Q3 for Studio Bang"

Or let the quarterly skill handle it — it queries Jira directly and doesn't require pre-existing sprint reports.

---

## Which agent for which task

| Task                                    | Profile      | Agent                          |
|-----------------------------------------|--------------|--------------------------------|
| Full vertical quarterly report          | leadership   | `quarterly_reporter_agent`     |
| Single studio quarterly report          | leadership   | `quarterly_reporter_agent`     |
| Cross-studio velocity/health comparison | leadership   | `portfolio_analyst_agent`      |
| Executive summary (for 1:1 or VP)       | leadership   | `executive_briefing_agent`     |
| Cross-team blockers and dependencies    | leadership   | `cross_team_coordinator_agent` |
| Sprint delivery report (per-sprint)     | pm           | `delivery_reporter_agent`      |
| Sprint planning / capacity              | pm           | `sprint_manager_agent`         |
| Daily standup summary                   | pm           | `standup_agent`                |
| Retrospective facilitation              | pm           | `retro_agent`                  |
| Risk and blocker tracking               | pm           | `risk_tracker_agent`           |

---

## Quarterly report timeline

Typical flow at end of quarter:

```
Week 1 after quarter end:
  "Generate Q3 report for Studio Bang"         → repeat per studio
  "Generate Q3 report for Studio Nebula"
  ...

Week 2:
  "Create the full Lodging vertical report for Q3"  → parent page with scorecard

  "Draft VP briefing summarizing Q3 Lodging delivery"  → executive comms
```

---

## Tips

- Always let the agent confirm scope before it queries Jira (checkpoint 1)
- Review deliverables before the narrative is written (checkpoint 2)
- You can edit after publish — "Update the Q3 report for Bang, add the June 15 toggle-on"
- The fiscal calendar is: Q1=Oct-Dec, Q2=Jan-Mar, Q3=Apr-Jun, Q4=Jul-Sep
- Studios not in `vertical-config.json` can still be reported — the agent will ask for metadata
