# Contract Compliance Report — Quick Start Guide

## What it does

Generates a visual HTML dashboard showing how actual sprint delivery compares to contract milestones. You provide a RITM number and team name — the agent handles everything else.

## Before your first run

### 1. Set up your team config

Create a file at `workspaces/<your-team>/context/contract-compliance-config.md` with your team's details:

```markdown
# Contract Compliance Configuration

## Team mapping

| Team | Jira Board ID | Project Key | Dev Emails |
|------|:---:|------|------|
| My Team | 3157 | GRPS | ana@disney.com, diego@disney.com, franco@disney.com |

## Contract source

| Item | Value |
|------|-------|
| Contract files location | ~/contracts/{Owner}/RITM{number}/ |

## Report output

| Item | Value |
|------|-------|
| Local output directory | ~/reports/contract-compliance/ |
| GitHub repo (optional) | https://github.disney.com/MY-ORG/compliance-reports.git |
| GitHub Pages branch | main |
```

### 2. Have your contract document ready

The agent needs access to the contract PDF or XLSX. Place it in the location you defined above, organized by RITM number.

## How to use

### Generate a report

Just say:

```
Generate contract compliance report for RITM6354060, BOLT Uplift team
```

The agent will:
1. Read your contract document
2. Pull expected deliverables from Jira
3. Pull actual sprint delivery from Jira
4. Show you a summary for approval
5. Generate the HTML report
6. Optionally publish to GitHub Pages

### Other commands

```
Compliance report for DTA
Update the compliance report for RITM6296051
Contract adherence for BOLT Uplift
```

## What you get

A self-contained HTML file with:

- Contract adherence % (contract tickets closed vs total)
- Completion rate % (actual stories closed vs total)
- Per-milestone breakdown with side-by-side comparison
- Risk assessment table
- Status badges (Complete, On Track, At Risk, Overdue)

The report works offline — just open the HTML file in any browser.

## Customizing the look

The default theme is "Cool Steel" (dark). To customize:

1. Copy `profiles/pm/context/contract-compliance-format.md` to your workspace's `context/` directory
2. Edit colors, layout, or structure as needed
3. Your version takes priority over the default

## Tips

- Run it regularly (weekly or per-sprint) to track progress over time
- The agent filters by contracted team members only — non-contracted contributors won't appear
- Rejected tickets count as Closed for metrics (they represent completed reviews)
- If contract tickets don't follow the `[1.x.x]` naming convention, the agent will ask you to map them manually

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Team not found" | Add your team to the config file |
| "No contract file for RITM" | Place the PDF/XLSX in the configured location |
| "No Jira tickets found" | Check the board ID and project key in your config |
| Metrics seem wrong | Verify dev emails match Jira assignee emails exactly |
| Report looks different than expected | Check if your workspace has a custom format override |
