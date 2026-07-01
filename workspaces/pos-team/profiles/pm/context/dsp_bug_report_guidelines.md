# DSP Bug Report Guidelines

## Role

You generate daily operational Bug reports for POS DSP releases. Reports provide status visibility, risk identification, and throughput insights for delivery leads and stakeholders.

## Releases

| Release | Target Release Filter | Report Filename Pattern |
|---------|----------------------|------------------------|
| DSP 2.1.1 | `"Target Release" ~ "DSP 2.1.1"` | `pos-dsp-2.1.1-daily-report-YYYY-MM-DD.md` |
| DSP 2.1.2 | `"Target Release" ~ "DSP 2.1.2"` | `pos-dsp-2.1.2-daily-report-YYYY-MM-DD.md` |
| DSP 2.1.3 | `"Target Release" ~ "DSP 2.1.3"` | `pos-dsp-2.1.3-daily-report-YYYY-MM-DD.md` |

## Base JQL

All queries share this team filter:

```jql
project = "Point of Sale"
  AND Team in (
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4004,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4027,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4134,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-3993,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4168,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4111,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4237,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4326
  )
  AND issuetype = Bug
```

Append the appropriate `"Target Release"` filter per release.

## Report Sections

### 1. Bugs Status Summary

Group bugs by these custom status categories:

| Category | Includes Statuses |
|----------|-------------------|
| Dev Complete | Next Phase, Ready for QA, In QA, Fix Failed, Awaiting Release |
| In Progress | Technical Analysis, Ready for Dev, In Dev, In Code Review, Ready for Test, In Testing |
| To Do | New, Failed |
| Closed | Closed, Done, Resolved |
| Blocked | Blocked |

Present as a table:

| Status | Count | Delta vs Previous | % of Total |
|--------|-------|-------------------|------------|
| Dev Complete | — | +/- N | — |
| In Progress | — | +/- N | — |
| To Do | — | +/- N | — |
| Blocked | — | +/- N | — |
| Closed | — | +/- N | — |
| **Total** | — | — | 100% |

- Delta = count today − count in previous daily report
- Positive delta (+N) = increase; negative (−N) = decrease
- If no previous report exists, show "—" for deltas

### 1b. Critical Bugs & Release Blockers

Highlight bugs that require immediate attention due to priority or release impact.

#### Jira Fields

| Field | ID | Type | Relevant Values |
|-------|-----|------|-----------------|
| Priority | `priority` | Standard | `1 - Critical`, `2 - High` |
| Customer Priority | `customfield_10245` | Select (option) | `Release Blocker` |

#### Sub-sections

**P1 Critical Bugs (open)**

Bugs with `priority = "1 - Critical"` that are NOT in Closed/Done/Resolved status.

| Key | Summary | Status | Assignee | Customer Priority | Days Open |
|-----|---------|--------|----------|-------------------|-----------|

JQL:
```jql
{base_jql} AND "Target Release" ~ "{release}" AND priority = "1 - Critical" AND status not in (Closed, Done, Resolved)
```

**P2 High Bugs (open)**

Bugs with `priority = "2 - High"` that are NOT in Closed/Done/Resolved status.

| Key | Summary | Status | Assignee | Customer Priority | Days Open |
|-----|---------|--------|----------|-------------------|-----------|

JQL:
```jql
{base_jql} AND "Target Release" ~ "{release}" AND priority = "2 - High" AND status not in (Closed, Done, Resolved)
```

**Release Blockers**

Bugs where Customer Priority (`customfield_10245`) = "Release Blocker" that are NOT in Closed/Done/Resolved status.

| Key | Summary | Priority | Status | Assignee | Days Open |
|-----|---------|----------|--------|----------|-----------|

JQL:
```jql
{base_jql} AND "Target Release" ~ "{release}" AND "Customer Priority" = "Release Blocker" AND status not in (Closed, Done, Resolved)
```

#### Display Rules

- Always show this section even if counts are zero (state "None" explicitly)
- Include a summary line at the top: `P1: X | P2: Y | Release Blockers: Z`
- Sort each table by Days Open descending (oldest first = highest urgency)
- Days Open = today − created date
- If a bug is both P1/P2 AND a Release Blocker, show it in BOTH sub-tables
- Include `customfield_10245` (Customer Priority) in the fields request for all queries
- **Show ALL bugs in each table — never truncate or cap results**
- **Grouping rule:** For P1, P2, and Release Blockers, apply the same display logic as the status summary:
  - Bugs in **Dev Complete** statuses (Next Phase, Ready for QA, In QA, Fix Failed, Awaiting Release) → show count only, do NOT list individually
  - Bugs in **In Progress** statuses (Technical Analysis, Ready for Dev, In Dev, In Code Review, Ready for Test, In Testing) → list all issues
  - Bugs in **To Do** statuses (New, Failed) → list all issues
  - Bugs in **Blocked** → list all issues

#### All Known Customer Priority Values

| Value | Meaning |
|-------|---------|
| Release Blocker | Must be fixed before release ships |
| CORE - Critical | Critical for core functionality |
| CORE - High | High impact on core functionality |
| CORE - Medium | Medium impact on core |
| PROD - High | High priority for production |
| TSR - WDW Pilot | TSR WDW pilot priority |
| TSR - DLR Pilot | TSR DLR pilot priority |
| TSR - Standard | TSR standard priority |
| TSR - Simple | TSR simple priority |
| OP - Lite | Operations lite priority |
| Non-POS Software | Not POS software related |

### 2. Bugs Promoted to Next Phase (last 24h)

Bugs whose status changed forward in the workflow in the last 24 hours.

| Key | Summary | Status | Assignee | Promoted At |
|-----|---------|--------|----------|-------------|

Use `updated >= -1d` combined with status transitions to detect promotions. A promotion is any status change to a later phase (e.g., In Progress → Dev Complete, Dev Complete → In Testing, In Testing → Closed).

### 3. Bugs Created (last 24h)

New bugs created in the last 24 hours.

| Key | Summary | Priority | Assignee | Created |
|-----|---------|----------|----------|---------|

JQL addition: `AND created >= -1d`

### 4. Risks and Attention Points

Identify and flag:

#### Stagnant Bugs (no movement 7+ days)
- JQL: `AND updated <= -7d AND status not in (Closed, Done, Resolved)`
- List with key, summary, status, assignee, last updated date, days stagnant

#### Blocked Bugs (3+ days)
- JQL: `AND status = Blocked AND updated <= -3d`
- List with key, summary, assignee, blocked since

#### Rework Candidates
- Bugs that have been in "Failed" or "Fix Failed" status more than once
- Detect via status change history (multiple transitions to fail states)

#### Flow Bottlenecks
- Status categories with disproportionate accumulation (e.g., "In Testing" > 40% of open bugs)
- Highlight when a phase holds significantly more bugs than others

### 5. Throughput Insights

Executive summary paragraph covering:
- Main flow changes in the last 24h
- Newly completed (moved to Closed/Done)
- Newly blocked or stagnant
- Delivery risks (trending stagnation, testing bottleneck growth, etc.)

## Biweekly Trend Summary

### Cadence

Starting May 26, 2026, every second Tuesday is a biweekly report day.

To determine if today is a biweekly report day:
1. Anchor date: May 26, 2026 (Monday — first biweekly cycle start)
2. Biweekly Tuesdays: May 27, June 10, June 24, July 8, July 22, ...
3. Formula: if today is Tuesday AND `(today - May 27, 2026) mod 14 == 0`, include the biweekly section

### Biweekly Sections

When triggered, append after section 5:

#### 6. Biweekly Trend Summary

| Metric | Previous Biweekly | Current Biweekly | Trend |
|--------|-------------------|------------------|-------|
| Total Open Bugs | — | — | ↑/↓/→ |
| Bugs Closed (14d) | — | — | ↑/↓/→ |
| Avg Cycle Time | — | — | ↑/↓/→ |
| Bugs Stagnant 7+d | — | — | ↑/↓/→ |
| Bugs Blocked | — | — | ↑/↓/→ |

##### Throughput Trend
- Average bugs closed per day (this period vs previous)
- Net bug change (created minus closed)

##### Testing Bottlenecks
- Bugs in "In Testing" duration trend
- Average time in testing phase

##### Aging Trend
- Distribution by age (0-7d, 8-14d, 15-30d, 30+d)
- Movement compared to previous biweekly

##### Delivery Risks Evolution
- Risks that persisted from previous biweekly
- New risks identified
- Risks resolved

##### Comparison vs Previous Biweekly Report
- Side-by-side delta on key metrics
- Narrative summary of improvement or regression

## Previous Report Reference

- Read the most recent report file in the output directory to calculate deltas
- If no previous report found, state "First report — no deltas available"
- For biweekly comparisons, look back 14 days for the previous biweekly file

## Output Rules

- Use today's date in ISO format (YYYY-MM-DD) for filenames
- Generate one report file per release
- Save reports to the current working directory unless a specific path is given
- Include report generation timestamp at the bottom: `_Generated: YYYY-MM-DD HH:MM UTC_`

## JQL Query Patterns

### All bugs for a release
```jql
project = "Point of Sale" AND Team in (...) AND "Target Release" ~ "DSP 2.1.X" AND issuetype = Bug
```

### Bugs updated in last 24h (for promotions)
```jql
project = "Point of Sale" AND Team in (...) AND "Target Release" ~ "DSP 2.1.X" AND issuetype = Bug AND updated >= -1d
```

### New bugs (last 24h)
```jql
project = "Point of Sale" AND Team in (...) AND "Target Release" ~ "DSP 2.1.X" AND issuetype = Bug AND created >= -1d
```

### Stagnant bugs (7+ days no update)
```jql
project = "Point of Sale" AND Team in (...) AND "Target Release" ~ "DSP 2.1.X" AND issuetype = Bug AND updated <= -7d AND status not in (Closed, Done, Resolved)
```

### Blocked bugs (3+ days)
```jql
project = "Point of Sale" AND Team in (...) AND "Target Release" ~ "DSP 2.1.X" AND issuetype = Bug AND status = Blocked AND updated <= -3d
```

## Critical Rules

1. Always generate all three release reports (DSP 2.1.1, 2.1.2, 2.1.3) unless a specific release is requested
2. Never fabricate data — if a query returns no results, state that explicitly
3. Delta calculations require reading the previous report; if unavailable, omit deltas
4. Include the full team filter in every JQL query — do not abbreviate
5. Use Jira MCP tools (`jira_search_issues`) for all queries
6. Percentages should be rounded to 1 decimal place
7. Stagnant and blocked bugs are the highest priority risk signals — always list them even if the report is otherwise positive
8. If JQL returns paginated results (>50), paginate until all bugs are retrieved for accurate counts
