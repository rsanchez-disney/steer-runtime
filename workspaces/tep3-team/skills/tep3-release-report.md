---
name: tep3-release-report
description: Generates a PDF release report for a DLR UC Stack release. Use when the user asks to generate a release report, mentions "release report", provides a Confluence release page URL or pageId, or references a UC release version (e.g. "2.54.0", "2.55.0"). The report includes all tickets, assignee, status, application, and Globant TEP3 team contribution summary with comparison to prior release.
disable-model-invocation: true
---

# TEP3 Release Report Skill

Generates `DLR_UC_Stack_{version}_Release_Report.pdf` from a Confluence release page.
The report contains:
1. Globant TEP3 Contribution Summary (first page)
2. Complete ticket list with status, assignee, application, and Globant flag
3. Status summary and attention-required items

For Globant team member definitions see the workspace `context/team_context.md`.

---

## Step 0 — Confirm Parameters

Ask the user (or infer from context):

| Parameter | Required | Example |
|---|---|---|
| `confluence_page_id` | Yes | `2188817537` |
| `confluence_instance` | Default: `confluence.disney.com` | `confluence.disney.com` or `mywiki.disney.com` |
| `release_version` | Yes (infer from page title) | `2.54.0` |
| `output_path` | Default: `~/Desktop/` | Any writable path |
| `previous_release_globant_count` | Optional (for comparison table) | `9` |
| `previous_release_total_count` | Optional (for comparison table) | `170` |

---

## Step 1 — Fetch the Confluence Release Page

Fetch the release page and extract ALL Jira ticket references.

```
Use @confluence/* tools (or @mywiki/* if mywiki.disney.com instance)
Get page by pageId → extract ticket patterns: COM-\d+, UCM-\d+, TEP3-\d+, TXPE-\d+
```

The page typically contains changelogs for these applications:
- **UC SPA** (DLR UC SPA 1.{version})
- **UC API** (DLR UC API 1.{version})
- **OrderVAS** (DLR OrderVas 2.{version})
- **OrderSVC** (DLR OrderSvc 1.{version})
- **PEOS** (DLR PEOS 1.{version})

If the page links to child pages or separate changelog pages per application, follow those links and extract tickets from each.

Produce a **deduplicated master list** of all ticket keys, noting which application each ticket belongs to. If a ticket appears in multiple apps, assign the primary app (first occurrence).

---

## Step 2 — Query Jira for Status and Assignees

Query `myjira.disney.com` for all tickets using JQL batches (max 25 keys per query due to URL limits):

```
Use @jira/* tools with prefix myjira_
JQL: key in (KEY-1, KEY-2, ..., KEY-25)
Fields needed: key, summary, status.name, assignee.displayName
```

For each ticket, record:
- **Key**: e.g. `TEP3-14015`
- **Summary**: truncated to 75 chars for display
- **Status**: Closed, Ready for Deployment, In Testing, In Development, In Progress, Open, Not Started
- **Assignee**: display name (e.g. "Ortiz, Felix") or "Unassigned"
- **App**: from Step 1 mapping

---

## Step 3 — Identify Globant TEP3 Team Tickets

Read the team roster from `context/team_context.md` in this workspace. The file contains two sections:

- **TEP3 Standalone Assignees** (e.g. Sifontes Rafael, Soto Diego, Ramos Jonathan)
- **TEP3 Packages Assignees** (e.g. Gonzalez Debernardi Alvaro, Luna Lautaro, Orozco Carlos, Medina David, Chavez Erik, Ortiz Felix)

Match assignee display names against this list (case-insensitive, last-name-first format: "Surname, GivenName"). Flag matched tickets as Globant (`GLB`).

Compute:
- `globant_count`: number of Globant tickets
- `globant_pct`: globant_count / total_count * 100
- `member_tickets`: dict of member → list of ticket keys
- `all_closed`: count of Globant tickets with status "Closed"

---

## Step 4 — Generate PDF Report

Generate a landscape Letter-size PDF using Python's `fpdf` library with this structure:

### Page 1: Globant TEP3 Team Contribution Summary

1. **Header**: "Globant TEP3 Team - Contribution Summary"
2. **Overview metrics**:
   - Release version
   - Total tickets in release
   - Globant team tickets: N (X.X%)
   - All Globant tickets status: N/N Closed
3. **Team Member Breakdown table** (columns: Member, Qty, Tickets, Stream/App, Status)
   - One row per Globant member who has tickets
   - Green background
   - TOTAL row in dark green with white text
4. **Globant Tickets Detail table** (columns: Key, Summary, Status, Assignee, App)
   - All Globant tickets listed with green background
5. **Comparison with Previous Release** table (columns: Metric, Previous Release, Current Release)
   - Metrics: Total Tickets, Globant Tickets, Globant %, Active Members, Primary Stream, All Closed?

### Pages 2+: Complete Ticket List

Table with columns: Key | Summary | Status | Assignee | App | GLB

Formatting rules:
- **Status color coding**:
  - Closed → light green (200, 255, 200)
  - Ready for Deployment → light blue (200, 220, 255)
  - Ready for testing → lighter blue (210, 240, 255)
  - In Testing → light yellow (255, 255, 200)
  - In Development → light orange (255, 220, 200)
  - In Progress → peach (255, 230, 210)
  - Open → light gray (240, 240, 240)
  - Not Started → lighter gray (245, 245, 245)
- **Globant rows**: bold text, green "GLB" badge in last column (bg: 0,150,0, white text)
- **Header rows**: dark navy background (50, 50, 80), white text
- **Font**: Helvetica, 7-8pt for data rows, 8-9pt for headers
- **Column widths** (landscape, ~249mm usable): Key=22, Summary=118, Status=30, Assignee=35, App=30, GLB=14

### Last Page: Status Summary

1. **Status Breakdown**: count and percentage per status
2. **Project Breakdown**: count per project prefix (COM, TEP3, UCM, TXPE, etc.)
3. **Tickets Not Yet Closed**: list of key | status | assignee | summary for all non-Closed tickets

---

## Step 5 — Handle Unicode

Replace Unicode characters that `fpdf` Helvetica cannot render:
- `\u2014` (em dash) → `-`
- `\u2013` (en dash) → `-`
- `\u2018` / `\u2019` (smart quotes) → `'`
- `\u201c` / `\u201d` (smart double quotes) → `"`

---

## Step 6 — Save and Confirm

Save the PDF to `{output_path}/DLR_UC_Stack_{version}_Release_Report.pdf`.

Present a summary to the user:

```
Report generated: ~/Desktop/DLR_UC_Stack_{version}_Release_Report.pdf

Total tickets: N
Closed: N (X.X%)
Globant TEP3 contribution: N tickets (X.X%)
  - Member A: N tickets (KEY-1, KEY-2)
  - Member B: N tickets (KEY-3)
  ...
Tickets still not closed: N
```

---

## Step 7 — Save to Persistent Memory

Save the report metadata to yax for future reference:

```
yax_save:
  title: "DLR UC Stack {version} Release Report Generated"
  content: summary metrics, Globant breakdown, notable non-closed tickets
  project: "dps-team"
  topic_key: "dlr-uc-stack-{version_no_dots}-release"
  type: "discovery"
```

---

## Notes

- **New project prefixes**: The release page may include ticket prefixes not seen before (e.g. TXPE appeared in 2.54.0). Include all prefixes found.
- **Shared tickets**: Some tickets appear in multiple applications. Assign to the first app encountered and note as shared.
- **Parent stories**: Tickets with status "Open" are typically parent/story-level items whose dev sub-tasks are already closed. Note this in the summary.
- **Team roster changes**: Always read `context/team_context.md` fresh — members may be added or removed between releases.
- **Batch size**: Query Jira in batches of max 25 keys per JQL `key in (...)` clause to avoid URL length limits.
- **Config tasks**: Tickets with "Configuration:" in the summary are often "Not Started" until deployment day — not a concern.
