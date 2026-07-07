---
name: generate-dsp-daily-report
description: Generates daily operational bug reports for DSP releases (2.1.1, 2.1.2, 2.1.3) with status tracking and risk identification
agents: [dsp_bug_report_agent]
---

# Generate DSP Daily Report

Produces daily bug reports for POS DSP releases. Gives delivery leads a clear picture of bug status, flow changes, and risks.

## Prerequisites

- Jira MCP configured with access to POS project
- Previous report files accessible (for delta calculations)
- Output directory defined (default: `workspaces/pos-team/POS Output/`)

## Workflow

### Step 1: Determine Scope

1. If no specific release requested → generate reports for ALL three:
   - DSP 2.1.1
   - DSP 2.1.2
   - DSP 2.1.3
2. If specific release requested → generate only that release
3. Determine today's date for filename and biweekly check

### Step 2: Load Previous Report

- Find most recent `pos-dsp-{version}-daily-report-*.md` in output directory
- Parse previous counts for delta calculations
- If no previous report: note "First report — no deltas available"

### Step 3: Query Bug Status Summary

Using base JQL (see `references/jql-queries.md`):
- Paginate with `maxResults: 50` until all results retrieved
- Group by status: In Progress, In Testing, Dev Complete, Closed
- Calculate deltas vs previous report
- Calculate percentage of total

### Step 4: Critical Bugs & Release Blockers

Query separately:
- P1 Critical (open)
- P2 High (open)
- Release Blockers (open — `Customer Priority = "Release Blocker"`)
- Record: key, summary, status, assignee, priority, days open

### Step 5: Promotions (last 24h)

- Query bugs updated in last 24h
- Identify status promotions (forward movement)
- Record: key, summary, new status, assignee, timestamp

### Step 6: New Bugs (last 24h)

- Query bugs created in last 24h
- Record: key, summary, priority, assignee, created date

### Step 7: Risks & Attention Points

- **Stagnant bugs:** 7+ days no update, still open
- **Blocked bugs:** 3+ days in Blocked status
- **Rework candidates:** Bugs that failed testing more than once
- **Flow bottlenecks:** Any status holding >40% of open bugs

### Step 8: Throughput Insights

Write executive summary paragraph covering:
- Main flow changes in last 24h
- Newly completed count
- Newly blocked or stagnant
- Delivery risk patterns

### Step 9: Biweekly Check

- If today is a qualifying biweekly Tuesday (see `references/jql-queries.md`), append Section 6 with trend analysis

### Step 10: Write Report Files

- Filename: `pos-dsp-{version}-daily-report-YYYY-MM-DD.md`
- One file per release
- Include generation timestamp at bottom
- Save to output directory

**Agent:** `dsp_bug_report_agent`

## Output Location

Default: `workspaces/pos-team/POS Output/`

## Usage Examples

```
"Generate daily DSP reports"
"Generate DSP 2.1.3 bug report"
"Run the daily report for all releases"
```

## Important Rules

- **Paginate all queries** — never report partial counts
- **Never fabricate data** — if zero results, show "None"
- **One file per release** — do not combine into a single file
- **Include full team filter** in every JQL query
- **Biweekly section** only on qualifying Tuesdays
- **Delta requires previous report** — show "—" if unavailable
