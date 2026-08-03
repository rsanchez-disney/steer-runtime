---
name: dev-cycle-time-analysis
description: Measures development cycle time (In Dev → Peer Review) and review wait time (Peer Review → next status) from Jira changelogs. Produces an Excel report with per-sprint comparison, per-developer breakdown, trend chart, and bottleneck analysis.
---

# Dev Cycle Time Analysis

Measures how long tickets take from "In Development" to "Peer Review" (dev cycle) and from "Peer Review" to the next status transition (review wait). Produces a 2-tab Excel report with comparison across sprints, developer breakdown, trend chart, and actionable insights.

---

## Trigger Phrases
- "run cycle time analysis"
- "dev cycle time for..."
- "how long to PR?"
- "review bottleneck check"
- "cycle time trend"

---

## Parameters

| Parameter | Required | Default | Example |
|-----------|----------|---------|----------|
| `project` | Yes | — | `COREEXP`, `RAA`, `IEXP` |
| `sprints` | One of these | — | `["Vista Sprint 32", "Vista Sprint 34"]` |
| `filter_id` | One of these | — | `216504` |
| `jql` | One of these | — | JQL string |
| `baseline_sprint` | No | First sprint | Sprint to compare against |
| `output_path` | No | `{project}_Cycle_Time_Analysis.xlsx` | — |

---

## Metrics

| Metric | Definition |
|--------|------------|
| **Dev Cycle Time** | Work days from In Development → Peer Review |
| **Review Wait Time** | Work days from Peer Review → next status |
| **Total Cycle Time** | Dev Cycle + Review Wait |

All calculations use **work days** (Mon–Fri only).

---

## "Left Review" Definition

| Transition | Meaning | Category |
|-----------|---------|----------|
| → Final Review | Reviewer approved | ✅ Clean pass |
| → Ready for Build | Merged | ✅ Clean pass |
| → Ready for Testing | Merged + build ready | ✅ Clean pass |
| → Closed | Reviewed and closed | ✅ Clean pass |
| → In Development | Changes requested | ⚠️ Rework |
| Still in Peer Review | No action yet | 🔴 Waiting |

---

## Output (Excel, 2 tabs)

**Tab 1: Dev Cycle Time**
- Executive summary (baseline vs comparison)
- Weekly trend line chart
- Per-developer breakdown
- Full ticket detail

**Tab 2: Review Wait Time**
- Definition table
- Summary comparison
- Weekly trend chart
- Full ticket detail with transition types
- Auto-generated bottleneck insights

---

## Auto-Generated Insights

| Pattern | Detection |
|---------|----------|
| Improvement | comparison < baseline |
| Review bottleneck | review_wait > dev_cycle |
| Rework cycles | PR → Dev → PR detected |
| Stale PRs | review_wait > 5 days |
| Same-day reviews | review_wait = 0 |
| Developer variance | max - min > 5 days |

---

## Configuration

| Parameter | Value |
|-----------|-------|
| Jira Instance | Any (Cloud or Server) |
| SP Field (Cloud) | customfield_10042 |
| SP Field (Server) | customfield_10003 |
| Work Days | Mon–Fri only |
| Output | Excel (.xlsx) via openpyxl |
| Charts | Bar (sprint comparison) + Line (weekly trend) |

---

## Examples

### Compare sprints
```
"Run cycle time analysis for COREEXP, comparing Sprint 32 vs Sprint 34-35"
```

### Filter-based
```
"Cycle time for filter 216504"
```

### Different project
```
"How long are RAA tickets sitting in review?"
```

### Weekly trend
```
"Show cycle time trend for Vista over last 6 weeks"
```
