# quarterly-report-utils

Power tools for generating quarterly studio reports. Eliminates common failure modes: wrong JQL construction, incorrect date math, and malformed Confluence XHTML.

## Tools

### resolve_studio

Look up a studio's full configuration by name.

```javascript
resolve_studio({ studio_name: "Bang" })
// Returns: { success: true, studio: { name, project, query_method, board_ids, ... }, vertical, confluence_space }
```

### build_jql

Construct the correct JQL for a studio + quarter combination. Handles all query methods (studio_field, sprint_based, combined) and applies sub-task/assignee exclusions automatically.

```javascript
build_jql({ studio_name: "Bang", quarter: "Q3 FY2026" })
// Returns: { success: true, jql: "project = ROS AND ...", dates: { start, end }, ... }

build_jql({ studio_name: "Forky", quarter: "Q3 FY2026", query_type: "created" })
// Returns: JQL for created issues with assignee exclusions applied
```

Query types: `resolved` (default), `created`, `epics`

### format_confluence_page

Convert structured report data into Confluence Cloud storage format XHTML. Produces output matching OUTPUT_TEMPLATE.md exactly.

```javascript
format_confluence_page({
  title: "Q3 FY2026 — Studio Bang",
  metrics: { resolved: "127", created: "89", net_backlog: "-38 (reduction)", issue_mix: "Story: 45 (35%), Bug: 32 (25%), Task: 50 (40%)", velocity: "~21 issues/sprint" },
  methodology: { project: "ROS", filter_method: "Studio Field", filter_value: "ROS - BANG | Ruth", ... },
  business_impact: "<p>Bang delivered the core payment gateway migration...</p>",
  deliverables: ["Payment Gateway v2 — production toggle-on (May 12)", "PCI DSS 4.0 compliance — audit passed"],
  roadmap: [{ lane: "Q3 Delivered", milestone: "Payment Gateway v2", timeline: "Apr-Jun", status: "DONE", status_color: "Green" }],
  risks: ["SOX freeze Aug 13 – Oct 6 blocks Q4 releases"],
  director_metrics: { impact_classification: { value: "Blue — INFRASTRUCTURE", notes: "Enables all payment studios" }, ... }
})
// Returns: { success: true, title: "...", body: "<h2>Metrics</h2><table>...", format: "storage" }
```

## Why use this power

| Without power | With power |
|---|---|
| Agent constructs JQL in prose (error-prone) | Deterministic JQL from config |
| Date math can go wrong (fiscal year offset) | Fiscal calendar encoded correctly |
| Confluence XHTML varies between runs | Identical structure every time |
| Agent must parse vertical-config.json itself | Pre-parsed, validated, error-handled |

## Adding to an agent

```json
{
  "name": "quarterly_reporter_agent",
  "powers": ["quarterly-report-utils"]
}
```
