---
name: contract-compliance-report
description: "Generates HTML compliance dashboards comparing CONTRACT EXPECTED vs ACTUAL DELIVERY. User provides RITM number and team name — agent handles data extraction, Jira queries, HTML generation, and optional publishing."
---

# Skill: Contract Compliance Report

Automated workflow that generates HTML compliance dashboards comparing contract expected deliverables vs actual sprint delivery. Inputs: RITM number + team name. Output: self-contained HTML report.

## Trigger phrases

- "Generate contract compliance report for RITM{X}"
- "Compliance report for {team}"
- "Update the compliance report"
- "Contract adherence for {team}"

## Inputs

| Input | Required | Example | Purpose |
|-------|:--------:|---------|---------|
| RITM number | Yes | RITM6296051 | Identifies the contract engagement |
| Team name | Yes | BOLT Uplift | Maps to Jira board, project key, team members |

## Configuration

The skill requires a `contract-compliance-config.md` file in the workspace's `context/` directory with:

- Team mapping (name → Jira board ID, project key, dev emails)
- Contract source file locations
- Report output directory
- GitHub Pages repo (if publishing)

See `references/contract-compliance-config-template.md` for the template.

## Process

### Step 1: Read contract

Parse the contract document (PDF/XLSX) for the given RITM. Extract:

- Milestone names, due dates, payment amounts
- Deliverables and referenced Jira tickets
- Contracted team composition
- Contract period (start–end)
- Total contract value
- Disney owner name

### Step 2: Pull contract expected (Jira)

Query Jira Cloud for contract tickets. For each ticket get:

- Key, summary, status, assignee, story points, sprint
- Map to milestones using naming convention: `[1.x.x]` = M1, `[2.x.x]` = M2, etc.

### Step 3: Pull actual delivery (Jira)

Query the team's Jira board for sprints within each milestone's date range:

- Filter by **contracted team members only** (from config)
- Stories and Tasks only (skip sub-tasks)
- Group by team member, then by sprint

### Step 4: Build comparison

For each milestone create a side-by-side view:

- LEFT: Contract expected tickets
- RIGHT: Actual delivery grouped by sprint and team member

### Step 5: Calculate metrics

| Metric | Formula | Scope |
|--------|---------|-------|
| Contract Adherence % | contract tickets closed / total contract tickets | Per-milestone + overall |
| Completion Rate % | actual tickets closed / total actual tickets | Per-milestone + overall |

Rules:
- **Rejected** tickets count as **Closed** for both metrics
- Overall metrics appear in the top stats grid
- Per-milestone metrics appear within each milestone section

### Step 6: Generate HTML

Output: `{TEAM}-{RITM}-compliance-report.html` (self-contained, no external dependencies)

**Format resolution order:**

1. Workspace `context/contract-compliance-format.md` (team override — if present, use this)
2. PM profile `context/contract-compliance-format.md` (global default)

The format file defines: theme colors, HTML structure, badge classes, table styling, and layout rules. See the format file for full details.

If no format file exists, use the Cool Steel (Dark) theme with the standard comparison layout.

### Step 7: Publish (optional)

If configured with a GitHub Pages repo:

1. Save HTML to output directory
2. Update `index.html` with a card for this report
3. Commit and push to the configured branch
4. Report live URL to user

## Rules

1. **Rejected = Closed** — rejected tickets count as closed for all metrics
2. **Filter by contracted team only** — exclude non-contracted members on the board
3. **No future-to-past mapping** — never map tickets from future sprints to past-due milestones
4. **Sprint-to-milestone by dates** — use sprint start/end dates to assign actual delivery
5. **Contract tickets are placeholders** — actual work is measured by sprint stories
6. **Self-contained HTML** — all CSS inline, no external dependencies, works offline
7. **Always show both sides** — even if one column is empty, show the structure

## Data sources

| Source | Tool | Purpose |
|--------|------|---------|
| Contract documents | `document_analyzer_agent` or `fs_read` | Extract milestones, payments |
| Jira Cloud tickets | `@atlassian/*` or `cloud_` prefixed tools | Ticket status, sprints, assignees |
| Git publishing | `devops_runner_agent` | Commit and push reports |

## Example interaction

```text
User: "Generate compliance report for RITM6354060, BOLT Uplift team"

Agent:
1. Reads contract → extracts 5 milestones (M1-M5, May-Oct 2026, $350,500 total)
2. Queries Jira board 3157 (GRPS) for contract tickets
3. Queries closed stories by BOLT devs in milestone date ranges
4. Generates BOLT-RITM6354060-compliance-report.html
5. Reports: "Report generated. Contract Adherence: 0% (5 tickets open). Completion Rate: 83% (91/109 actual deliveries closed)."
```

## Checkpoint

**Before generating the HTML**, present a summary to the user:

- Milestones found (count, date range, total value)
- Contract tickets found (count, how many closed)
- Actual delivery found (count per milestone, story points)
- Any data gaps or concerns

Wait for user confirmation before proceeding with HTML generation.
