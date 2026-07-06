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

---

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

#### Display Rules for Bug Listing

- **Dev Complete** → show count only, do NOT list individual bugs
- **In Progress** → list ALL bugs individually (Key, Summary, Status, Assignee, Days Open)
- **To Do** → list ALL bugs individually
- **Blocked** → list ALL bugs individually

---

### 2. High Priority Bugs

Identify and highlight bugs that require immediate attention.

#### Jira Fields

| Field | ID | Type | Relevant Values |
|-------|-----|------|-----------------|
| Priority | `priority` | Standard | `1 - Critical`, `2 - High` |
| Customer Priority | `customfield_10245` | Select (option) | `Release Blocker` |

#### Sub-sections

**P1 Critical (open):**
```jql
{base_jql} AND "Target Release" ~ "{release}" AND priority = "1 - Critical" AND status not in (Closed, Done, Resolved)
```

**P2 High (open):**
```jql
{base_jql} AND "Target Release" ~ "{release}" AND priority = "2 - High" AND status not in (Closed, Done, Resolved)
```

**Release Blockers (open):**
```jql
{base_jql} AND "Target Release" ~ "{release}" AND "Customer Priority" = "Release Blocker" AND status not in (Closed, Done, Resolved)
```

#### Display Rules

- Include a summary line: `P1: X | P2: Y | Release Blockers: Z`
- Apply the same grouping logic as Section 1:
  - Bugs in **Dev Complete** statuses → show count only
  - Bugs in **In Progress** statuses → list all issues
  - Bugs in **To Do** statuses → list all issues
  - Bugs in **Blocked** → list all issues
- Sort listed bugs by Days Open descending (oldest first)
- Days Open = today − created date
- If a bug is both P1/P2 AND a Release Blocker, show it in BOTH sub-tables
- Include `customfield_10245` (Customer Priority) in the fields request
- Show section even if counts are zero (state "None")

---

### 3. Bugs Promoted to Next Phase (last 24h)

Bugs whose status changed forward in the workflow in the last 24 hours.

| Key | Summary | Status | Team | Assignee |
|-----|---------|--------|------|----------|

JQL: `AND updated >= -1d`

A promotion = any status change to a later phase (e.g., In Dev → Ready for QA, Ready for QA → Awaiting Release).

---

### 4. Bugs Created (last 24h)

New bugs created in the last 24 hours.

| Key | Summary | Priority | Team | Assignee | Created |
|-----|---------|----------|------|----------|---------|

JQL addition: `AND created >= -1d`

---

### 5. Risks and Attention Points

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

---

### 6. Throughput Insights

Executive summary paragraph covering:
- Main flow changes in the last 24h
- Newly completed (moved to Closed/Done)
- Newly blocked or stagnant
- Delivery risks (trending stagnation, testing bottleneck growth, etc.)

---

## Weekly Trend Summary (Fridays only)

### Cadence

Every Friday, append an additional section to the report.

### Weekly Sections

#### 7. Weekly Trend Summary

| Metric | Previous Week | Current Week | Trend |
|--------|--------------|--------------|-------|
| Total Open Bugs | — | — | ↑/↓/→ |
| Bugs Closed (7d) | — | — | ↑/↓/→ |
| Avg Cycle Time | — | — | ↑/↓/→ |
| Bugs Stagnant 7+d | — | — | ↑/↓/→ |
| Bugs Blocked | — | — | ↑/↓/→ |

##### Throughput Trend
- Average bugs closed per day (this week vs previous)
- Net bug change (created minus closed)

##### Testing Bottlenecks
- Bugs in "Ready for QA" / "In QA" duration trend
- Average time in testing phase

##### Aging Trend
- Distribution by age (0-7d, 8-14d, 15-30d, 30+d)
- Movement compared to previous week

##### Delivery Risks Evolution
- Risks that persisted from previous week
- New risks identified
- Risks resolved

##### Comparison vs Previous Weekly Report
- Side-by-side delta on key metrics
- Narrative summary of improvement or regression

---

## Previous Report Reference

- Read the most recent report file in the output directory to calculate deltas
- If no previous report found, state "First report — no deltas available"
- For weekly comparisons, look back 7 days for the previous weekly file

---

## Output Rules

- Use today's date in ISO format (YYYY-MM-DD) for filenames
- Generate one report file per release
- Save reports to the designated output directory
- Include report generation timestamp at the bottom: `_Generated: YYYY-MM-DD HH:MM UTC_`
- Generate both `.md` and `.html` versions

---

## JQL Query Patterns

### All bugs for a release
```jql
project = "Point of Sale" AND Team in (...) AND "Target Release" ~ "DSP 2.1.X" AND issuetype = Bug
```

### Bugs updated in last 24h (for promotions)
```jql
... AND updated >= -1d
```

### New bugs (last 24h)
```jql
... AND created >= -1d
```

### Stagnant bugs (7+ days no update)
```jql
... AND updated <= -7d AND status not in (Closed, Done, Resolved)
```

### Blocked bugs (3+ days)
```jql
... AND status = Blocked AND updated <= -3d
```

### P1 Critical (open)
```jql
... AND priority = "1 - Critical" AND status not in (Closed, Done, Resolved)
```

### P2 High (open)
```jql
... AND priority = "2 - High" AND status not in (Closed, Done, Resolved)
```

### Release Blockers (open)
```jql
... AND "Customer Priority" = "Release Blocker" AND status not in (Closed, Done, Resolved)
```

---

## Customer Priority Field Reference

| Field | ID | Type |
|-------|-----|------|
| Customer Priority | `customfield_10245` | Select (option) |

### Known Values

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

---

## Critical Rules

1. Always generate all three release reports (DSP 2.1.1, 2.1.2, 2.1.3) unless a specific release is requested
2. Never fabricate data — if a query returns no results, state "None"
3. Delta calculations require reading the previous report; if unavailable, show "—"
4. Include the full team filter in every JQL query
5. Percentages rounded to 1 decimal place
6. Stagnant and blocked bugs are highest priority risk signals
7. If JQL returns paginated results (>50), paginate until all bugs are retrieved
8. One file per release — do not combine
9. Dev Complete = count only; In Progress + To Do + Blocked = list all issues
10. Weekly section only on Fridays
11. Generate both markdown and HTML versions
