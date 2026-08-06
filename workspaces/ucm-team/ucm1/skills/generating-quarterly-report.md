---
name: generating-quarterly-report
description: Generates a quarterly PDF report for the UCM1 Globant team. The report is a styled PDF with charts and visual highlights. Supports dry_run to print metrics without generating a file.
---

# Generating Quarterly Report

## When to use
User asks to "generate a quarterly report", "create a velocity report", "generate a report", mentions "Q1/Q2/Q3/Q4 report", or references story points, velocity, or tickets worked by the UCM1 team.

## Overview

Generates `UCM1_Q{Q}_{YEAR}_Report.pdf` — a styled PDF quarterly
velocity report for the UCM1 Globant Cart & Checkout team.

The PDF contains:
1. Cover page — team name, quarter, generation date, key KPI cards
2. Executive Summary + Overall Board Snapshot
3. UCM1 Globant Team Direct Contribution table + SP per engineer bar chart
4. Velocity Summary metrics + work type donut chart
5. Affected Applications by Fix Version + tickets per repo bar chart
6. Work Theme Analysis + theme breakdown chart
7. Priority Distribution pie chart + Observations & Recommendations
8. In-flight items table
9. Quarter-over-Quarter comparison (conditional — only if previous quarter data provided)
10. Appendix — complete ticket list

For team member definitions see the workspace `context/team_context.md`.

## Workflow

### Step 0 — Confirm Parameters

Ask the user (or infer from context):

| Parameter | Required | Default | Example |
|---|---|---|---|
| `quarter` | Yes | Current quarter | `Q2 2026` |
| `start_date` | Yes (infer from quarter) | — | `2026-04-01` |
| `end_date` | Yes (infer from quarter) | — | `2026-06-30` |
| `output_path` | Optional | `~/Desktop/` | Any writable path within home directory |
| `previous_quarter_sp` | Optional | — | `72` (enables QoQ comparison page) |
| `previous_quarter_tickets` | Optional | — | `20` (enables QoQ comparison page) |
| `dry_run` | Optional | `false` | `true` — print metrics to chat only, skip PDF |

Quarter → date mapping:
- Q1: Jan 1 – Mar 31
- Q2: Apr 1 – Jun 30
- Q3: Jul 1 – Sep 30
- Q4: Oct 1 – Dec 31

Validate `output_path` before writing: resolve to absolute path and confirm it is within the
user's home directory. Default to `~/Desktop/` if not provided.

---

### Step 1 — Query Jira for All Tickets with Evidence of Completion

Use `jira-cloud` tools with the following JQL. The dual `assignee in / assignee was in`
clause captures tickets currently assigned to a team member AND tickets that were assigned
to a team member at any point — since tickets in this team are frequently closed under a
different assignee after the developer's work is done:

```jql
(
  assignee in (
    "agustin.x.moreno.-nd@disney.com",
    "diedrych.jimenez.-nd@disney.com",
    "rodrigo.davico.-nd@disney.com",
    "valeria.rocha.-nd@disney.com"
  )
  OR
  assignee was in (
    "agustin.x.moreno.-nd@disney.com",
    "diedrych.jimenez.-nd@disney.com",
    "rodrigo.davico.-nd@disney.com",
    "valeria.rocha.-nd@disney.com"
  )
)
AND "Evidence of Completion[Paragraph]" is not EMPTY
AND status in (Closed, Resolved)
AND labels NOT IN(D-Scribe)
AND "Story Points[Number]" >= 0
AND type NOT IN (Content)
AND updated >= "{start_date}"
AND updated <= "{end_date}"
ORDER BY updated DESC
```

Fetch with these custom fields: `storyPoints` (customfield_10003), `fixVersions`,
`Evidence of Completion[Paragraph]` (customfield_20800 - could be wrong). If `Evidence of Completion[Paragraph]` is not available, 
find out which field contains the list of Pull Requests made for the ticket.

Paginate in batches of 100 until all results are retrieved (`startAt` + `maxResults`).

Produce a master list with: Key, Summary, Status, Assignee (email + display name),
Reporter, Priority, Issue Type, Project, Story Points, Fix Versions,
Evidence of Completion (PR links), created date, updated date.

---

### Step 2 — Identify UCM1 Globant Team Members

Always read the team roster fresh from `context/team_context.md` — the roster may change
between quarters.

Use email as the canonical identifier for Jira matching. Map each email to a display label
for all report output — never rely on Jira's `assignee.displayName` alone, as it can vary:

| Email | Display Label |
|---|---|
| agustin.x.moreno.-nd@disney.com | Moreno, Agustin |
| diedrych.jimenez.-nd@disney.com | Jimenez, Diedrych |
| rodrigo.davico.-nd@disney.com | Davico, Rodrigo |
| valeria.rocha.-nd@disney.com | Rocha, Valeria |

Matching strategy: check `assignee.emailAddress` (lowercased) against the email list.
If the email field is absent, fall back to case-insensitive substring match of
`assignee.displayName` against the display label values. Flag matched tickets `GLB`.

Per member compute: `ticket_count`, `sp_total` (null SP → 0, tracked separately),
and `ticket_list` (key + SP + truncated summary).

Compute `active_member_count` as the number of members with at least 1 ticket this quarter.
Use this as the divisor for avg SP per engineer — never hardcode the team size.
Note any members with 0 tickets in the Observations section.

---

### Step 3 — Infer Affected Applications from Evidence of Completion

Parse the `Evidence of Completion[Paragraph]` PR links across all tickets to identify which repositories
were touched. Map GitHub repo name patterns to application names:

| GitHub Repo Pattern | Application | Ownership |
|---|---|---|
| `wdpr-ecommerce-uc-spa` | UC SPA | UCM1 |
| `wdpr-ecommerce-uc-api` | UC API | UCM1 |
| `com-uc-ui-components` | UI Components | UCM1 |
| `wdpr-ecommerce-wdpr-cart-ui` | Cart UI | UCM1 |
| `wdpr-ecommerce-wdpr-cart-api` | Cart API | UCM1 |
| `com-ui-api-lambda` | Lambda API | UCM1 |
| `ecommerce-order-vas-java-17` | OrderVAS | Cross-team (Java) |
| `order-service` | OrderSVC | Cross-team (Java) |
| `wdpr-mock-svc` | Mock Service | Cross-team |

`OrderVAS`, `OrderSVC`, and `wdpr-mock-svc` are NOT UCM1-owned repos. Flag tickets touching
these repos as cross-team dependencies in the Observations section — they represent
coordination overhead, not direct UCM1 delivery.

Count tickets per application. Flag tickets with PRs in 3 or more repos as cross-repo tickets.

**Fix version resolution** — use a two-step strategy per ticket:
1. **Primary**: read the `fixVersions` Jira field (fetched in Step 1). If one or more values
   are present, use them directly. These are the authoritative fix versions set by the team.
2. **Fallback**: if `fixVersions` is empty or null, parse the `Evidence of Completion[Paragraph]` PR links
   to infer which repository was touched, then derive the fix version group from the repo name
   (e.g. a PR in `wdpr-ecommerce-uc-api` implies the UC API fix version group). Mark
   inferred fix versions with an asterisk (*) in the report to distinguish them from
   Jira-declared values.

When grouping tickets by fix version for the Applications table and the Notes section,
always prefer Jira-declared values. Inferred values are supplementary — used only to
fill gaps where `fixVersions` was not set.

---

### Step 4 — Identify Work Themes

Categorize each ticket into exactly one delivery track using this priority order
(first match wins — prevents double-counting):

| Priority | Theme | Detection Rule |
|---|---|---|
| 1 | Validation | Summary starts with `[VALIDATION]` |
| 2 | Accessibility | Summary contains "Accessibility" or "a11y" (case-insensitive) |
| 3 | Auth / Security | Summary contains "token", "auth", "client ID", or "B2B" (case-insensitive) |
| 4 | Cherry-pick / CP | Issue type = Task AND summary contains "cherry-pick", "cherry pick", or " CP " |
| 5 | Tech Debt / Perf | Issue type = Technical Debt |
| 6 | Feature Delivery | Issue type = Story |
| 7 | Bug Fixes | Issue type = Bug |
| 8 | Other | Anything not matched above |

Compute ticket count and total SP per theme.

---

### Step 5 — Compute Velocity Metrics

| Metric | Formula |
|---|---|
| Total tickets (board) | Count of all fetched tickets |
| UCM1 team tickets | Count of GLB-flagged tickets |
| UCM1 team SP | Sum of SP for GLB tickets |
| Avg SP per ticket | UCM1 SP / UCM1 ticket count |
| Avg SP per active engineer | UCM1 SP / active_member_count |
| Closed rate | Closed tickets / total tickets × 100 |
| In-flight % | Non-closed / total × 100 |
| Cross-repo tickets | Tickets with PRs touching 3+ repos |
| Cycle time (proxy) | Avg days between `created` and `updated` for GLB closed tickets |

If `dry_run = true`: print all computed metrics to chat as a plain text summary and stop
here — skip Steps 6–8.

---

### Step 6 — Compute Priority Distribution

Count all tickets by priority:
- 1 - Critical
- 2 - High
- 3 - Medium
- 4 - Low
- Not set

---

### Step 7 — Save Metrics to Persistent Memory

Save to yax at this point — before PDF generation — so the Jira data is persisted even if
PDF rendering fails later:

```
yax_save:
  title: "UCM1 {QUARTER} Quarterly Velocity Report"
  content: |
    Quarter: {QUARTER}
    Total board tickets: {TOTAL}
    UCM1 team tickets: {UCM1_TICKET_COUNT} ({UCM1_PCT}%)
    UCM1 SP: {UCM1_SP}
    Closed rate: {CLOSED_RATE}%
    Active members this quarter: {ACTIVE_MEMBER_COUNT}
    Avg SP/active engineer: {AVG_SP_PER_ENG}
    Cycle time avg: {CYCLE_TIME_DAYS} days
    Cross-team dependency tickets: {CROSS_TEAM_COUNT}
    Cross-repo tickets (3+ repos): {CROSS_REPO_COUNT}
    Top themes: {TOP_THEMES}
    In-flight: {INFLIGHT_LIST}
    PDF: UCM1_Q{Q}_{YEAR}_Velocity_Report.pdf
  project: "ucm-team"
  topic_key: "ucm1-quarterly-{quarter_slug}"
  type: "discovery"
  session_id: "{session_id}"
```

---

### Step 8 — Generate PDF Report

> **Implementation reference**: The canonical PDF generator is the `ucm1-pdf-generator`
> skill (`#[[skill:ucm1-pdf-generator]]`). Always activate it before writing any Python
> code for PDF generation. Adapt its script with the computed metrics from Steps 1–6
> rather than rewriting from scratch. The `UCM1Report` class, color palette, page methods,
> and `sanitize()` helper are authoritative — only override the data variables
> (`TOTAL_TICKETS`, `team_data`, `themes_data`, etc.) with the live Jira data.

Generate a portrait Letter-size PDF (216 × 279 mm) using Python's `fpdf` library.

**Font**: Helvetica throughout. No external font downloads required.
- Titles (section headers): Helvetica Bold, 18pt
- Subtitles (table headers, subsection labels): Helvetica Bold, 12pt
- Body text / table cells: Helvetica, 8pt
- KPI card numbers: Helvetica Bold, 22pt
- KPI card labels: Helvetica, 9pt
- Footer: Helvetica, 7pt

**Margins**: left=15mm, right=15mm, top=20mm, bottom=20mm

**Page header** (every page except cover): navy bar (height 10mm) containing
"UCM1 — Cart & Checkout · {QUARTER} Velocity Report" in white Bold 9pt, page number right-aligned.

**Page footer**: light gray bar, "Generated {TODAY} · Confidential · Globant / Disney" in 7pt.

**Color palette**:
- Navy (15, 32, 69) — page headers, section title bars
- Blue (74, 144, 217) — accent, chart primary, GLB badges, KPI top border
- Light blue (235, 245, 255) — table alternate row background
- White (255, 255, 255)
- Dark gray (60, 60, 60) — body text
- Mid gray (130, 130, 130) — captions, secondary labels
- Light gray (245, 245, 245) — table zebra rows, card backgrounds
- Green (46, 204, 113) — closed status, positive indicators
- Orange (243, 156, 18) — in-flight/warning indicators
- Red (231, 76, 60) — critical priority

**Unicode sanitization** — replace characters Helvetica cannot render before passing any
text to fpdf:
- em dash `\u2014` → `-`
- en dash `\u2013` → `-`
- left/right single quotes `\u2018` `\u2019` → `'`
- left/right double quotes `\u201c` `\u201d` → `"`
- bullet `\u2022` → `-`

---

#### Page 1: Cover

1. Full-width navy rectangle (60mm tall) — white "UCM1" in 40pt Bold,
   "Cart & Checkout Team" in 14pt below it
2. Centered subtitle: "{QUARTER} Quarterly Velocity Report · {START_DATE} – {END_DATE}"
   in Blue 18pt Bold
3. Generation date in mid gray 9pt, centered
4. Horizontal rule (1mm, Blue)
5. Four KPI cards in a row — each with light gray background, Blue top border (3mm),
   rounded corners:
   - "Total Tickets" / {TOTAL}
   - "UCM1 SP Delivered" / ~{UCM1_SP}
   - "Closed Rate" / {CLOSED_RATE}%
   - "Active Engineers" / {ACTIVE_MEMBER_COUNT}
6. Thin Blue stripe (2mm) at bottom of cover

---

#### Page 2: Executive Summary + Board Snapshot

- Section title bar "Executive Summary" — navy background, white 18pt Bold
- Two-paragraph narrative summarising the quarter: total tickets, UCM1 contribution,
  closed rate, and top delivery theme
- Horizontal rule
- Section title "1. Overall Board Snapshot"
- Two-column metrics table (metric label | value), zebra rows, 8pt
- Status breakdown chart — horizontal stacked bar (single row):
  Green segment = closed, Orange segment = in-flight.
  Annotate the green segment with "{CLOSED_RATE}% closed".

---

#### Page 3: UCM1 Team Contribution

- Section title bar "2. UCM1 Globant Team — Direct Contribution"
- Team contribution table:
  - Columns: Engineer | Tickets | SP | Notable Tickets (top 3 keys + summaries)
  - Header row: navy background, white Bold 10pt
  - Data rows: zebra (white / light gray), 8pt
  - Total row: Blue background, white Bold
- SP per Engineer chart — horizontal bar chart:
  - One bar per active engineer, sorted by SP descending
  - Blue fill, SP value label inside each bar in white
  - Title: "Story Points by Engineer", Bold 11pt

---

#### Page 4: Velocity Summary

- Section title bar "3. Velocity Summary"
- Left half: two-column metrics table (metric | value), key velocity numbers, 8pt
- Right half: Work Type Donut chart:
  - Donut slices per theme (ticket count as slice size)
  - Colors from the theme map in Step 4
  - Legend to the right listing theme name + ticket count
  - Title: "Work Distribution by Theme", Bold 11pt
- Work type sub-table below spanning full width:
  - Columns: Theme | Tickets | SP | % of Total SP

---

#### Page 5: Affected Applications

- Section title bar "4. Affected Applications by Fix Version"
- Applications table:
  - Columns: Application | Repo | Tickets | Ownership | Key Fix Versions
  - UCM1-owned rows: normal background
  - Cross-team rows: light orange background (255, 240, 220) with "Cross-team" label
- Tickets per Application chart — horizontal bar chart:
  - One bar per application, sorted by ticket count descending
  - UCM1-owned: Blue fill; cross-team: gray fill with diagonal hatch pattern
  - Title: "Tickets per Application", Bold 11pt

---

#### Page 6: Work Theme Analysis

- Section title bar "5. Work Theme Analysis"
- Themes table:
  - Columns: Theme | Tickets | SP | % SP | Sample Tickets
  - Row background matches the theme color (lightened — 80% white mix)
- Work Theme Breakdown chart — vertical grouped bar chart:
  - X-axis: theme names, rotated 30 degrees
  - Two bars per theme: ticket count (Blue) and SP (Orange)
  - Title: "Work Theme Breakdown", Bold 11pt

---

#### Page 7: Priority Distribution + Observations

- Section title bar "6. Priority Distribution"
- Left half: Priority pie chart:
  - Slices: Critical (red), High (orange), Medium (blue), Low (green), Not set (gray)
  - Percentage labels on slices, legend below
  - Title: "Priority Distribution", Bold 11pt
- Right half: Priority count table — Columns: Priority | Count | %
- Horizontal rule
- Section title "7. Observations & Recommendations"
- Bullet list, 8pt, one bullet per observation. Always include:
  - Overall delivery summary (closed rate, SP total)
  - Any active engineers with 0 tickets this quarter
  - Cross-team dependency ticket count and which repos
  - Cross-repo ticket count (3+ repos) as coordination overhead signal
  - Any Cherry-pick/CP tasks as hotfix activity signal
  - In-flight items at quarter close
- In-flight items table:
  - Columns: Key | Summary | Status | SP | Assignee
  - Each row has an Orange left border (3mm)

---

#### Page 8 (conditional): Quarter-over-Quarter Comparison

Render this page only if `previous_quarter_sp` or `previous_quarter_tickets` were provided.

- Section title bar "8. Quarter-over-Quarter Comparison"
- QoQ grouped bar chart:
  - Metrics: Total Tickets, UCM1 Tickets, UCM1 SP, Closed Rate %, Avg SP/Engineer
  - Two bars per metric: previous quarter (mid gray) and current quarter (Blue)
  - Title: "Quarter-over-Quarter", Bold 11pt
- Comparison table below:
  - Columns: Metric | Previous Quarter | Current Quarter | Delta
  - Positive delta (improvement): green text
  - Negative delta: red text

---

#### Appendix Page(s): Complete Ticket List

- Section title bar "Appendix — All Tickets"
- Full table across all tickets:
  - Columns: Key | Summary (truncated to 75 chars) | Status | Assignee | SP | GLB
  - Column widths (landscape ~249mm): Key=22, Summary=118, Status=30, Assignee=35, SP=12, GLB=14
  - Status color coding:
    - Closed → light green (200, 255, 200)
    - Ready for Deployment → light blue (200, 220, 255)
    - In Testing / Ready for testing → light yellow (255, 255, 200)
    - In Development / In Progress → light orange (255, 220, 200)
    - Open / Not Started → light gray (240, 240, 240)
  - GLB-flagged rows: bold text, Blue "GLB" badge in last column
    (bg: 0, 100, 200; white text, 7pt)
  - Header rows: navy background (50, 50, 80), white Bold text

---

### Step 9 — Save and Confirm

Save the PDF to `{output_path}/UCM1_Q{Q}_{YEAR}_Velocity_Report.pdf`.

Present a summary to the user:

```
Report generated: {output_path}/UCM1_Q{Q}_{YEAR}_Velocity_Report.pdf

Total board tickets:   {TOTAL}
UCM1 team tickets:     {UCM1_TICKET_COUNT} (~{UCM1_PCT}% of board)
UCM1 SP delivered:     ~{UCM1_SP}
Closed rate:           {CLOSED_RATE}%
Cycle time (avg):      ~{CYCLE_TIME_DAYS} days

Team breakdown:
  Moreno:   {N} tickets · {SP} SP
  Davico:   {N} tickets · {SP} SP
  Rocha:    {N} tickets · {SP} SP
  Jimenez:  {N} tickets · {SP} SP

Charts: SP by Engineer, Work Distribution Donut, Tickets per App,
        Theme Breakdown, Priority Pie, Closed vs In-Flight
        {+ QoQ Comparison}
Apps most impacted: {TOP_3_APPS}
Cross-team dependency tickets: {CROSS_TEAM_COUNT}
Cross-repo tickets (3+ repos): {CROSS_REPO_COUNT}
In-flight items: {INFLIGHT_COUNT}
```

---

### Notes

- **Font**: Use Helvetica (built into fpdf — no downloads, no external dependencies).
  Do not attempt to download or register external fonts.
- **Library**: Use Python's `fpdf` library. Import as `from fpdf import FPDF`.
  Suggest installation if missing: `pip install fpdf`.
- **Fix versions**: Always use the `fixVersions` Jira field as the primary source. Fall back
  to inferring the fix version group from `Evidence of Completion[Paragraph]` PR repo names only when
  `fixVersions` is empty or null. Mark inferred values with `*` in report output.
- **assignee was in**: Always include this JQL clause — team members' tickets are
  frequently closed under a different assignee.
- **Others contributors**: Closed/resolved tickets that were assigned to UCM team members but are now assigned to
  other Jira users must be considered as tickets completed by the team and the points should be assigned to the last UCM
  team member that had that ticket assigned.
- **SP = null**: Treat as 0 for SP sums. Count toward ticket totals. Flag in appendix.
- **Member labels**: Always use the email → display label map for report output.
  Never rely on Jira's assignee.displayName alone.
- **Active member count**: Compute from members with at least 1 ticket this quarter.
  Never hardcode the team size.
- **[VALIDATION] tickets**: Count toward team metrics; flag as Validation theme.
- **Cherry-pick / CP tasks**: Note in observations as a hotfix activity signal.
- **Pagination**: Always paginate Jira results (`startAt` 0, 100, 200…) until
  `len(issues) < maxResults`.
- **Cross-quarter tickets**: Old UCM-2xxx / UCM-4xxx / UCM-5xxx keys updated/closed this
  quarter are valid — include them.
- **Cross-team repos**: `OrderVAS`, `OrderSVC`, and `wdpr-mock-svc` are not UCM1-owned.
  Flag tickets touching them as cross-team dependencies in observations.
- **QoQ page**: Only render when `previous_quarter_sp` or `previous_quarter_tickets`
  are provided. Skip the page entirely if neither is given.
- **Dry run**: When `dry_run = true`, skip all PDF generation and file I/O entirely.
  Print the computed metrics summary to chat only.
- **Output path**: Resolve to absolute path and confirm it is within the home directory
  before writing. Default to `~/Desktop/`.
- **Cycle time**: Average `(updated_date - created_date).days` for GLB closed tickets only.
  This is a proxy — actual dev time may be shorter if the ticket predates the work.

> ⚠️ **PDF generation is handled by the `referencs/ucm1-pdf-generator` skill.**
> Always activate `#[[skill:ucm1-pdf-generator]]` before writing any Python code.
> Use its `UCM1Report` class, page methods, color palette, and `sanitize()` helper
> as the implementation blueprint. Replace ONLY the data variables (`TOTAL_TICKETS`,
> `team_data`, `apps_data`, `themes_data`, `priority_data`, `observations`, etc.)
> with the live values computed from Steps 1–6 of this skill.

