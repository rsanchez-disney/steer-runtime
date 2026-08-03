---
name: home-devui-sprint-health
description: Generates a multi-tab Excel sprint health report for the Home Dev UI program (TxP Explore, Feature Menu, Home Screen, HKDL Nav). Use when the user says "run Home DevUI report", "Home Dev UI sprint health", "regenerate Home DevUI spreadsheet", or asks for a Home program level report.
---

# Skill: Home Dev UI Sprint Health

Generates a multi-tab Excel sprint health report for the Home Dev UI program (TxP Explore, Feature Menu, Home Screen, HKDL Nav). Pulls fresh data from Jira Cloud filter 112465, groups by fix version, and includes sprint projections, assignee load, and risk analysis.

## Prerequisites

- Jira Cloud MCP configured and connected to disneyexperiences.atlassian.net
- Read access to filter 112465 ("Home_All_at_Program Level")
- Python 3 with openpyxl library (for Excel generation)

---

## Trigger Phrases
- "run Home DevUI report"
- "Home Dev UI sprint health"
- "regenerate Home DevUI spreadsheet"
- "Home program level report"

---

## Data Source

| Parameter | Value |
|-----------|-------|
| Jira Instance | disneyexperiences.atlassian.net (Cloud) |
| MCP | `mcp_jira_cloud` |
| Filter | 112465 ("Home_All_at_Program Level") |
| Filter URL | https://disneyexperiences.atlassian.net/issues/?filter=112465 |
| SP Field | `customfield_10042` |
| Projects in scope | COREEXP, TXPE, DPI, FNB, GCX |

---

## Fix Versions (as of Jul 13, 2026)

| Version | Scope | Fix Version Names |
|---------|-------|-------------------|
| **8.25** | Active dev — WDW/DLR bugs + Home Screen stories in testing | WDW 8.25 iOS, DLR 8.25 iOS, WDW 8.25 Android, DLR 8.25 Android, HKDL 8.25 iOS, HKDL 8.25 Android |
| **9.0** | HKDL stories (moved from 9.1) + WDW/DLR engineering/nav items | WDW 9.0 iOS, DLR 9.0 iOS, WDW 9.0 Android, DLR 9.0 Android, HKDL 9.0 iOS, HKDL 9.0 Android |
| **9.1** | Empty (all moved to 9.0 as of Jul 13) | WDW 9.1 iOS, DLR 9.1 iOS, WDW 9.1 Android, DLR 9.1 Android, HKDL 9.1 iOS, HKDL 9.1 Android |
| **No FV** | A11y bugs + Shuri contextual content — needs triage | (fixVersion is EMPTY) |

### Version History
- **8.24** → All bugs moved to 9.0 (Jun 2026), then to 8.25 (Jul 2026)
- **9.1 → 9.0**: HKDL stories moved Jul 13, 2026
- **9.0 → 8.25**: WDW/DLR bugs and Home Screen stories moved Jul 13, 2026

> **Note**: Update this section when fix versions change (new version added, tickets moved).

---

## Release Milestones (from Release Calendar)

| Milestone | 8.25 | 9.0 | 9.1 |
|-----------|------|-----|-----|
| Exp Client Dev Complete | Jul 2 | Jul 31 | Sep 4 |
| Feature Complete | Jul 10 | Aug 7 | Sep 14 |
| Code Complete | Jul 24 | Aug 21 | Sep 28 |
| All Tickets Closed | Aug 6 | Sep 4 | Oct 12 |

---

## Report Structure (5 tabs)

1. **Status Report** — Executive summary, scope summary table, status breakdown per version, assignee load, sprint projection, target dates
2. **8.25 Tickets** — Key (hyperlinked), Summary, Status, SP, Priority, Assignee, Fix Versions, Type, Tag
3. **9.0 Tickets** — Same + Origin column (Moved from 8.24 / Original 9.0)
4. **9.1 Tickets** — Same (currently empty)
5. **No Fix Version** — Key, Summary, Status, SP, Priority, Assignee, Type, Tag

---

## Workflow

### Step 0 — Confirm Parameters

Before pulling data, confirm:
- Filter 112465 is accessible
- Fix version scope is current (check Version History above)
- Target release milestones are accurate

**⏸ CHECKPOINT — Confirm filter access and fix version scope before pulling data**

---

### Step 1 — Pull Fresh Data

**CRITICAL**: Always query Jira fresh. Never use cached/hardcoded data.

The Jira Cloud MCP returns max 50 results per call. To handle pagination:
- Query with `status = Open ORDER BY key ASC` (first batch)
- Query with `status NOT IN (Open) ORDER BY key ASC` (second batch)
- Combine and deduplicate by key

JQLs:
```
# 8.25
filter = 112465 AND status NOT IN (Closed, Rejected) AND fixVersion in ("WDW 8.25 iOS", "DLR 8.25 iOS", "WDW 8.25 Android", "DLR 8.25 Android", "HKDL 8.25 iOS", "HKDL 8.25 Android") ORDER BY key ASC

# 9.0
filter = 112465 AND status NOT IN (Closed, Rejected) AND fixVersion in ("WDW 9.0 iOS", "DLR 9.0 iOS", "WDW 9.0 Android", "DLR 9.0 Android", "HKDL 9.0 iOS", "HKDL 9.0 Android") ORDER BY key ASC

# 9.1
filter = 112465 AND status NOT IN (Closed, Rejected) AND fixVersion in ("WDW 9.1 iOS", "DLR 9.1 iOS", "WDW 9.1 Android", "DLR 9.1 Android", "HKDL 9.1 iOS", "HKDL 9.1 Android") ORDER BY key ASC

# No Fix Version
filter = 112465 AND status NOT IN (Closed, Rejected) AND fixVersion is EMPTY ORDER BY key ASC
```

If any query returns 50 results (max page), paginate using `key > "{last_key}"` in the JQL to get remaining tickets.

---

### Step 2 — Save JSON Data Files

Save to workspace:
- `home_devui_825_data.json`
- `home_devui_90_data.json`
- `home_devui_91_data.json`
- `home_devui_nofv_data.json`

Schema per ticket:
```json
{"key": "COREEXP-XXX", "summary": "...", "status": "...", "sp": 3, "priority": "3 - Medium", "assignee": "Name", "fix_versions": "WDW 8.25 iOS, DLR 8.25 Android", "issue_type": "Bug"}
```

**⏸ CHECKPOINT — Verify JSON data files are complete before generating report**

---

### Step 3 — Generate Report

Run: `python3 generate_home_devui_report_v6.py`

Output: `Home_DevUI_Sprint_Health_2026-{MM}-{DD}.xlsx`

> **Note**: If the Python script is unavailable, output the JSON data files and provide manual instructions for creating the Excel report.

---

### Step 4 — Tag Column

Extract text between `{}` from summary field. Example:
- `"TxP Explore : Android | {Badge} | PhotoPass..."` → Tag = `"Badge"`
- `"{iOS} HK Bottom Nav | Navigation Tabs"` → Tag = `"iOS"`

---

## Capacity & Projection Parameters

| Parameter | Value |
|-----------|-------|
| Team size (WDW/DLR active) | 3 devs |
| Capacity/sprint | 24 SP (3 × 8 SP) |
| Sprint duration | 2 weeks |
| Sprint naming | "TxP Sprint XX" |

---

## Developers

| Developer | Platform | Primary Scope |
|-----------|----------|---------------|
| Swaleh Kavuma | Android | TxP Explore Android bugs, HKDL nav |
| Cameron Klein | iOS/Flutter | iOS bugs, HKDL explore, nav gradient |
| Alejandro Alzate | iOS/Flutter | iOS badge bugs, Flutter router |
| Diana Bustamante | iOS/Flutter | Home Screen stories, localization |
| Rashmi Rao | QA/Testing | Testing coordination |
| Tiayr Cannon | iOS/Android | Safe area testing (HKDL) |
| Sergio Peralta | Android | A11y bugs |
| Jose Lopez | Android | ANR/performance |
| Marcos Garcia | Flutter | Contentsquare SDK |

---

## Rules

- If filter 112465 is inaccessible, stop and report the permission error
- If any JQL returns 0 results, note it in the report but continue with other versions
- If any query returns 50 results, paginate using `key > "{last_key}"` until exhausted
- If Python script is unavailable, output the JSON data files and provide manual Excel creation instructions
- Product stories with 0 SP are intentional (acceptance/validation items) — do not flag as errors
- Tickets can appear in multiple fix versions (cross-brand) — this is expected behavior
- HKDL tickets are excluded from WDW/DLR capacity projections

---

## Notes

- Origin column: "Moved from 8.24" means the bug was originally filed under 8.24 fix versions
- Filter 112465 is the single source of truth for all scopes
- When fix versions change (new version added, tickets moved), update the Fix Versions section above
