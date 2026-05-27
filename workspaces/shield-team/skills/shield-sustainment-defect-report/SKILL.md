---
name: shield-defect-report
description: Generates a self-contained HTML defect trend report for the Shield Sustainment epics from Jira data. Use when the user asks to generate, refresh, or create a Shield defect report, mentions "shield report", "defect trend report", or provides a Jira date range for Shield sustainment analysis. Handles Jira MCP verification, paginated data fetching, ticket classification, and full HTML generation.
disable-model-invocation: true
---

# Shield Defect Trend Report Skill

Generates `shield-defect-trend-report-{date}.html` (dark-themed, Chart.js) from a paginated Jira query.
For classification rules see [classification-rules.md](classification-rules.md).
For MCP setup see [mcp-setup.md](mcp-setup.md).
The HTML template lives alongside this file: `report-template.html`.

---

## Step 0 — Verify Jira MCP

Before anything, confirm the Jira MCP is reachable:

```
CallMcpTool → server: "user-jira-server", toolName: "jira_search"
  jql: "project = IEXP AND created >= -1d"
  limit: 1
```

**If the call succeeds** → proceed to Step 1.

**If the call fails** (tool not found / auth error):
1. Tell the user the Jira MCP is not configured.
2. Read [mcp-setup.md](mcp-setup.md) and follow the installation instructions.
3. Ask the user to restart Cursor and re-invoke the skill.

---

## Step 1 — Confirm Parameters

Ask the user (or infer from context):

| Parameter | Default | Example |
|---|---|---|
| `start_date` | 12 months ago | `"2025-06-01"` |
| `end_date` | today | `"2026-05-31"` |
| `output_path` | same folder as template | `shield-defect-trend-report-{YYYY-MM-DD}.html` |

The **base JQL** is always:
```
project IN (IEXP, AEXP, COREEXP)
AND ("Epic Link" IN (AEXP-92, IEXP-1027)
  OR "Feature" IN ("Shield Tech Sustainment",
                   "Shield Salesforce Sustainment",
                   "Shield Tech Hardening Crashes"))
AND issuetype IN (Defect, Bug)
AND created >= "{start_date}"
AND created <= "{end_date}"
```

---

## Step 2 — Fetch All Issues (paginated)

The tool returns max 50 per call. Paginate until `start_at >= total`.

```
fields: "summary,labels,created,project,status,resolution"
limit: 50
start_at: 0, 50, 100, … until exhausted
```

Collect every issue into a single flat list. Store: `key`, `summary`, `labels[]`, `created` (ISO date → extract `YYYY-MM`), `project.key`, `status`.

---

## Step 3 — Classify Each Issue

For each issue apply the rules in [classification-rules.md](classification-rules.md) to determine:

- `isReal`: boolean — is this a genuine app defect?
- `area`: string — functional area (Crashes, Finder/Map, Analytics, …)
- `category`: string — App Bug | Crash | Tech Debt | CI/CD & Build | Localization | Performance | Content | Security | Ingestion

---

## Step 4 — Aggregate Monthly Data

Group issues by `YYYY-MM` month. Build parallel arrays (one entry per month, sorted chronologically):

```javascript
months[]        // display labels e.g. "Jun'25"
totalCounts[]   // all tickets that month
realDefects[]   // isReal === true
techDebt[]      // isReal === false
```

Compute:
- `AVG` = Math.round(sum(realDefects) / months.length)
- `rollingAvg` = 3-month rolling average of realDefects

For **area data**, count per-area per-month across all real defects → build `areaData[]` array.

For **Content tickets** specifically, run a secondary Jira query:
```
{base JQL} AND (labels in ("content","Content") OR summary ~ "Content")
```
to get the exact content count and monthly distribution.

---

## Step 5 — Identify Deep-Dive Month

The deep-dive section covers the **most recent calendar month** in the dataset. Compute for that month:

```
total, realCount, iOS (IEXP), Android (AEXP), Flutter/Core (COREEXP)
category breakdown (App Bug, Crash, Tech Debt, …)
App Bugs by functionality area
cross-platform duplicates (same summary on iOS + Android)
```

---

## Step 6 — Generate the HTML

Read `report-template.html` from this skill folder as the canonical template.
Do not rewrite the full HTML from scratch — replace only the data sections inside `<script>`:

- `months`, `totalCounts`, `realDefects`, `techDebt`, `AVG`
- `rollingAvg` (recompute inline using the `rolling3` function already in the template)
- `monthNotes[]` (auto-generate using signals from classification-rules.md)
- `areaData[]` (rebuilt from Step 4)
- `kpiData[]` (deep-dive month KPIs: total, iOS count, Android count, Flutter count)
- The 4 `areaKpis` entries: Most Frequent, 2nd Most Frequent, Newly Growing, Content Issues

Also update the static HTML:
- Header meta: period string, total tickets, real defects %, report date
- Executive Summary text: reflect new date range and key findings
- Deep-dive section label: replace "May 2026" with the actual month name

Save output as `shield-defect-trend-report-{YYYY-MM-DD}.html` in the same directory the user specifies (default: next to the template).

---

## Step 7 — Open the Report

After saving, open the file:
```
CallMcpTool → server: "cursor-app-control", toolName: "open_resource"
  uri: "file:///absolute/path/to/shield-defect-trend-report-{date}.html"
```

---

## Notes

- **Large datasets**: If total > 500 issues, warn the user about processing time and proceed page-by-page.
- **Missing months**: If a calendar month has zero tickets, still include it in the arrays as `0`.
- **Security callout**: If any issue has "Security", "encryption", "FIND-" in summary → surface it as the red critical callout at the bottom.
- **Portability**: All paths inside this skill are relative. The template (`report-template.html`) and this file live in the same folder — no absolute paths needed.
