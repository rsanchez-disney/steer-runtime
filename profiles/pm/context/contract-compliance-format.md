# Contract Compliance Report — Default Format

This defines the default HTML output format for the contract compliance report skill. Workspaces can override this by placing a `contract-compliance-format.md` file in their own `context/` directory.

## Theme: Cool Steel (Dark)

```css
/* Page */
body { background: #12141a; color: #e0e0e0; font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; }

/* Cards and sections */
.container { max-width: 1600px; margin: 0 auto; }
.header { background: linear-gradient(135deg, #272b31, #31363d); border: 1px solid #1a3a6b; border-radius: 12px; padding: 24px; }
.section { background: #272b31; border: 1px solid #1a3a6b; border-radius: 10px; padding: 20px; }
.milestone { background: #31363d; border-radius: 8px; padding: 16px; }
.comparison-col { background: #1b1d21; border-radius: 6px; padding: 12px; }
.summary-box { background: #12141a; border-radius: 6px; padding: 10px; }

/* Colors */
--accent: #4fc3f7;
--accent-secondary: #90caf9;
--warning: #ffa726;
--muted: #78909c;
--border: #1a3a6b;
```

## HTML structure

```text
.container
  .header
    h1: "{RITM} — {Project Name}"
    .sub: tech stack bullets (e.g., "Angular 20 SPA • Node.js 22 WebTier")
    .meta: "Contract: {period} • Total: ${amount} • Owner: {name} • Vendor: {vendor} • Report: {date}"

  .stats-grid (2 cards)
    Card 1: Contract Adherence — "{X} of {Y} tickets closed"
    Card 2: Overall Completion Rate — "{X} of {Y} actual deliveries"

  .section (per milestone)
    .milestone-header: milestone name
    .milestone-meta: due date, payment badge, status badge
    .mini-stats: per-milestone adherence + completion (2 mini cards)
    .comparison (2 columns side by side)
      .comparison-col LEFT: "Contract Expected" table (Ticket, Summary, Type, SP, Status)
      .comparison-col RIGHT: "Actual Delivery" table (Ticket, Summary, SP, Status)
        — Grouped by team member (separator rows)
        — Sub-grouped by sprint (separator rows)
    .summary-box: text summary of milestone status

  .risk-section (bottom)
    Risk assessment table: Milestone, Due Date, Payment, Contract Tickets, Adherence %, Actual Delivery, Status
    TOTAL row at bottom

  .footer
    Data sources, board link, RITM, vendor, generation date
```

## Status badges

### Milestone status

| Condition | Badge text | CSS class | Color |
|-----------|-----------|-----------|-------|
| 100% adherence + past due | COMPLETE | `.badge-done` | #2e7d32 (green) |
| ≥80% adherence + before due | ON TRACK | `.badge-on-track` | #1565c0 (blue) |
| <80% adherence + past due | OVERDUE | `.badge-overdue` | #e65100 (orange) |
| <80% adherence + due within 7 days | AT RISK | `.badge-at-risk` | #f57f17 (amber) |
| 0% adherence + future due | NOT STARTED | `.badge-not-started` | #37474f (gray) |

### Ticket status

| Status | CSS class | Color |
|--------|-----------|-------|
| Closed / Done | `.badge-done` | #2e7d32 (green) |
| In Progress | `.badge-in-progress` | #1565c0 (blue) |
| Open / To Do | `.badge-open` | #37474f (gray) |
| Rejected | `.badge-rejected` | #616161 (dark gray) |
| Blocked | `.badge-blocked` | #b71c1c (red) |
| In Review | `.badge-in-review` | #1565c0 (blue) |
| In Testing | `.badge-testing` | #6a1b9a (purple) |

## Stat card classes

| Condition | Class | Value color |
|-----------|-------|-------------|
| ≥80% | `.success` | #66bb6a (green) |
| 40–79% | `.warning` | #ffa726 (orange) |
| <40% | `.danger` | #ef5350 (red) |

## Jira link format

All ticket references link to: `https://disneyexperiences.atlassian.net/browse/{KEY}`

## Table styling

```css
table { width: 100%; border-collapse: collapse; }
th { color: #4fc3f7; font-weight: 600; background: #12141a; position: sticky; top: 0; }
th, td { padding: 5px 8px; border-bottom: 1px solid #1a3a6b; font-size: 0.78em; }
td a { color: #90caf9; text-decoration: none; }
```

## Comparison layout

- Side-by-side on desktop (2 columns, `grid-template-columns: 1fr 1fr`)
- Stacked on mobile (`@media (max-width: 900px)` → single column)
- Max-height 800px per column with `overflow-y: auto` for long lists

## Payment badges

Inline badge next to milestone due date: `background: #1b1d21; color: #ffa726; border-radius: 4px; padding: 2px 8px;`

## Output requirements

- **Self-contained**: all CSS inline in `<style>`, no external dependencies
- **Responsive**: works on desktop and tablet
- **Printable**: reasonable appearance when printed (light background for print)
- **Filename**: `{TEAM}-{RITM}-compliance-report.html`
