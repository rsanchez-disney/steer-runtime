---
name: quarterly-studio-report
description: |
  Generates a quarterly report for a single studio within a vertical. Invoked by leaders to produce
  Confluence pages with metrics, achievements, business impact, roadmap, and director metrics for one
  studio. Also updates the parent vertical report's scorecard and achievements table.
  Use when: user says 'create Q report', 'quarterly report for studio X', or 'help me with the Qx report for Studio Y'.
---

# Skill: Quarterly Studio Report

Generate a quarterly performance report for a single studio, matching the format established in Q3 FY2026.

## Prerequisites

- User provides: quarter (e.g., Q3), studio name (e.g., Bang), vertical name (e.g., Lodging)
- Vertical config exists in context (or user provides studio metadata: project, board, sprint prefix)
- Access to Jira Cloud (disneyexperiences.atlassian.net) via cloud_ prefixed tools
- Access to Confluence Cloud for publishing

## Step 0: Extract Parameters

From the user's request, extract:
- `quarter`: Q1, Q2, Q3, or Q4
- `fiscal_year`: FY2026, FY2027, etc.
- `studio_name`: The studio to report on
- `vertical_name`: The vertical it belongs to

Derive dates from fiscal calendar:
- Q1: Oct 1 – Dec 31
- Q2: Jan 1 – Mar 31
- Q3: Apr 1 – Jun 30
- Q4: Jul 1 – Sep 30

Confirm with user: "I'll generate the {quarter} FY{year} report for Studio {name} in {vertical}. Period: {start} – {end}. Correct?"

**⏸ CHECKPOINT: Confirm scope with user before proceeding.**

## Step 1: Resolve Studio Configuration

Look up the studio in the vertical config (context/vertical-config.json):

```json
{
  "studio": "Bang",
  "project": "ROS",
  "query_method": "studio_field",
  "studio_field_value": "ROS - BANG | Ruth",
  "board_ids": [2730],
  "sprint_prefix": "ROS-BAN-SP",
  "sub_tasks": "exclude",
  "impact_classification": "INFRASTRUCTURE",
  "guest_reach": ["WDW", "DLR", "HKDL", "AUL"]
}
```

If studio is not in config, ask user for:
- Jira project key
- How to filter (Studio field value, sprint prefix, or project-only)
- Board ID(s)
- Whether to include or exclude sub-tasks

## Step 2: Query Jira — Resolved Issues

Build JQL based on query_method:

### studio_field method (most ROS studios)
```
project = {project} AND Studio = "{studio_field_value}" AND resolved >= "{quarter_start}" AND resolved <= "{quarter_end}"
```
Add `AND issuetype not in subTaskIssueTypes()` if sub_tasks = "exclude"

### sprint_based method (TEP3/Yondu, GRPS/Bolt, CCS/Forky)
```
project = {project} AND sprint in ({sprint_names}) AND resolved >= "{quarter_start}" AND resolved <= "{quarter_end}" AND issuetype not in subTaskIssueTypes()
```
If the studio config has `assignee_exclusions`, append:
```
AND assignee NOT IN ("{exclusion1}", "{exclusion2}")
```

### combined method (Terror — multiple field values)
```
project = {project} AND Studio in ("{value1}", "{value2}") AND resolved >= "{quarter_start}" AND resolved <= "{quarter_end}" AND issuetype not in subTaskIssueTypes()
```

Capture:
- Total resolved count (use `total` from API response metadata — Jira returns max 100 per page)
- Issue type breakdown (Story, Task, Bug, Test, Sub-task, Epic)
- Key epic completions (status = Done)

## Step 3: Query Jira — Created Issues (Backlog Growth)

```
project = {project} AND Studio = "{studio_field_value}" AND created >= "{quarter_start}" AND created <= "{quarter_end}"
```

Calculate net backlog: created - resolved = growth/reduction.

## Step 4: Query Jira — Sprint Velocity

Use board_ids to get sprint data:
- Fetch sprints for the quarter date range
- For each sprint: count completed issues
- Calculate average velocity (issues/sprint)

Record sprint names for the Data Source & Methodology section.

## Step 5: Identify Key Deliverables

From the resolved issues, identify:
- Epics completed (status = Done)
- High-impact stories (production deployments, launches, toggle-ons)
- Bug resolution trends (Critical/High priority)
- Notable milestones (go-lives, migrations, compliance completions)

Ask user: "Here are the top deliverables I found for {studio} in {quarter}. Are there any I'm missing or any that should be highlighted differently?"

**⏸ CHECKPOINT: User validates key deliverables before writing narrative.**

## Step 6: Draft Studio Report Content

Generate the studio page following the exact structure in `OUTPUT_TEMPLATE.md` (co-located in this skill directory). Sections cannot be reordered, renamed, or omitted.

### Metrics Table
| Metric | Value |
|--------|-------|
| Resolved ({incl/excl} sub-tasks) | {count} |
| Created | {count} |
| Net Backlog | {+/- count} ({growth/reduction}) |
| Issue Mix (Resolved) | {breakdown percentages} |

### Data Source & Methodology
Info panel with:
| Field | Value |
|-------|-------|
| Project | {project} |
| Studio Field | {studio_field_value} (or Filter Method: sprint-based) |
| Date Filter | resolved >= {start} AND resolved <= {end} |
| Sub-tasks | {Included/Excluded} |
| Board | {board_id} |
| Sprint Range | {first sprint} through {last sprint} |
| JQL (Resolved) | {full query} |

### Business Impact
2-3 paragraphs. Tone rules:
- Conservative — state confirmed outcomes only, not aspirational projections
- Specific — name products, dates, environments (PROD, toggle-on, go-live)
- Quantified where possible — "15+ services", "8 languages", "81% reduction"
- Business-value oriented — revenue, compliance, cost reduction, guest experience
- NO generic filler like "improved performance" or "enhanced capabilities"
- Every statement must pass: "So what? Why does this matter to the business?"

### Key Deliverables
Bulleted list of major items delivered (epics, launches, migrations).

### Team
Key contributors identified from Jira assignees (optional — ask user if they want this).

### Roadmap (Q+1 Planned)
Table with status lozenges:
| Lane | Milestone | Timeline | Status |
|------|-----------|----------|--------|
| Q{N} Delivered | {item} | {dates} | ✅ DONE |
| Q{N+1} Planned | {item} | {dates} | 🔵 IN PROGRESS / 🟡 PLANNED |
| Constraint | {freeze/dependency} | {dates} | 🔴 BLOCKER |

### Risks & Notes
Bulleted list of concerns, blockers, dependencies.

### Director Metrics
| Metric | Value | Notes |
|--------|-------|-------|
| Impact Classification | {color — category} | {justification} |
| Guest Reach | {markets} | {explanation} |
| Release Success Rate | {%} | {context} |
| Health Rating | {color — status} | {justification} |
| Sprint Velocity | ~{n} issues/sprint ({incl/excl} sub-tasks) | {trend} |
| Blocked Items | {count} | {details} |

Impact Classification values:
- Green — REVENUE GENERATING (new revenue streams, upsell)
- Yellow — COMPLIANCE / COST REDUCTION (mandatory, risk prevention)
- Blue — INFRASTRUCTURE / QA INVESTMENT (enables others, no direct impact)

Health Rating criteria:
- 🟢 ON TRACK — No blocked epics, manageable backlog, milestones progressing
- 🟡 AT RISK — Blocked epics OR backlog growing significantly OR freeze conflict OR capacity concern
- 🔴 BLOCKED — Critical dependency preventing delivery, needs escalation

## Step 7: Review & Refine

Present the full draft to the user.

Ask: "Does this accurately represent {studio}'s Q{N} work? Any corrections to achievements, business impact tone, or director metrics?"

**⏸ CHECKPOINT: User approves content before publishing.**

## Step 8: Publish to Confluence

Create the studio page in Confluence Cloud:
- Space: use `confluence_space` from vertical config
- Parent: use `parent_page_id` from vertical config. If null, search for the existing vertical quarterly page by title pattern `Q{N} FY{YEAR} — {vertical_name}`. If not found, ask the user where to create it and note the page ID for future runs.
- Title: `Q{N} FY{YEAR} — Studio {Name}`
- Format: Confluence storage format (XHTML with ac:structured-macro for info panels, status lozenges)

Use these Confluence rendering rules:
- Info panels: `<ac:structured-macro ac:name="info"><ac:rich-text-body>...</ac:rich-text-body></ac:structured-macro>`
- Status lozenges: `<ac:structured-macro ac:name="status"><ac:parameter ac:name="title">{text}</ac:parameter><ac:parameter ac:name="colour">{Green|Yellow|Blue|Red|Grey}</ac:parameter></ac:structured-macro>`
- Tables: standard HTML `<table><thead><tr><th>...</th></tr></thead><tbody>...</tbody></table>`
- Avoid: Mermaid diagrams (don't render), roadmap macro (unsupported on Cloud)

## Step 9: Update Parent Report (Optional)

If a parent vertical report page exists, update:
1. Studio Scorecard table — add/update the studio's row
2. Key Achievements & Business Impact table — add/update the studio's row
3. Total resolved count (increment by this studio's resolved)

Ask user: "Should I also update the parent vertical report at {page URL}?"

## Rules

### Tone
- Executive-facing but technically grounded
- Achievements column: product names, toggle-on dates, version numbers, environments. Short declarative statements.
- Business Impact column: revenue, guest experience, compliance, cost reduction. Persuasive but conservative.
- Never use: "enhanced", "leveraged", "streamlined", "cutting-edge", "next-generation" (generic fluff)
- Always use: specific numbers, dates, product names, market names

### Data Integrity
- Always use `resolved` date filter (not `updated` — inflates 3-4x)
- Document the exact JQL used in the Data Source & Methodology section
- If Jira API returns partial data (pagination cap), note it explicitly
- Multi-field studios (Terror): combine both field values and document
- Sprint-based studios (Yondu, Bolt, Forky): document sprint names, not date ranges alone

### Lessons Learned (from Q3 FY2026)
- Studio field is customfield_10156 in ROS (dropdown, not label)
- Some studios live in different projects (TEP3, GRPS, CCS) — ask if unsure
- Sub-task inclusion varies by studio workflow (Gamora/Tadashi include, others exclude)
- Terror requires 2 field values combined
- Confluence Cloud: use native tables + status macros, NOT Mermaid/roadmap macros
- Always exclude external teams (Vision/CApG, COM/TravelBox, AntMan) from vertical totals
- Forky may need assignee exclusions (cross-team contributors) — check `assignee_exclusions` in vertical config

### Do NOT
- Do not generate generic business impact statements without specific evidence
- Do not count external team metrics in vertical totals
- Do not use `updated` instead of `resolved` for date filtering
- Do not present estimated numbers as exact without noting the caveat
- Do not publish without user checkpoint approval
