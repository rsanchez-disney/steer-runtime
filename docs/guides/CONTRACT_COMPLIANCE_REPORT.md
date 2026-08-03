# Contract Compliance Report — Quick Start Guide

Generate HTML compliance dashboards comparing contract expected deliverables vs actual sprint delivery. Available to all workspaces with the `pm` profile.

## Prerequisites

- Workspace with `pm` profile active
- Jira Cloud MCP configured (`@atlassian/*` or `cloud_` tools)
- Contract document (PDF/XLSX) accessible to the agent

## Setup (one-time)

### 1. Create your team config (required)

The agent needs to know your Jira board, project key, and team members. Without this file, the skill cannot run.

Create a file at `workspaces/<your-team>/context/contract-compliance-config.md` with your team's details:

```markdown
# Contract Compliance Configuration

## Team mapping

| Team | Jira Board ID | Project Key | Dev Emails |
|------|:---:|------|------|
| BOLT Uplift | 3157 | GRPS | ana@disney.com, diego@disney.com, franco@disney.com |
| DTA | 448 | TTD | andres@disney.com, jose@disney.com, luisa@disney.com |

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

### 2. Place your contract documents locally

The agent reads the contract file directly from your machine (via `fs_read`). Place the PDF or XLSX in a folder on your local computer, organized by RITM number:

```
~/contracts/Dan Perrine/RITM6354060/contract.pdf
```

This must be a local path on the PM's machine — not a shared drive or cloud URL. The agent needs filesystem access to the file during report generation.

## Usage

### Generate a report

```
Generate contract compliance report for RITM6354060, BOLT Uplift team
```

### Other commands

```
Compliance report for DTA
Update the compliance report for RITM6296051
Contract adherence for BOLT Uplift
```

## What happens

1. Agent reads the contract document (milestones, payments, deliverables)
2. Queries Jira for contract tickets (expected)
3. Queries Jira for closed stories by the contracted team (actual)
4. Presents a summary for your approval
5. Generates self-contained HTML report
6. Optionally publishes to GitHub Pages

## What you get

A single HTML file (`{TEAM}-{RITM}-compliance-report.html`) with:

- **Contract Adherence %** — contract tickets closed vs total
- **Completion Rate %** — actual stories closed vs total
- **Per-milestone comparison** — expected (left) vs actual delivery (right)
- **Risk assessment table** — all milestones with status, payment, and adherence
- **Status badges** — Complete, On Track, At Risk, Overdue, Not Started

The file is self-contained (all CSS inline) — open it in any browser, works offline.

## Customizing the report format

The default theme is "Cool Steel" (dark). To customize:

1. Copy `profiles/pm/context/contract-compliance-format.md` to your workspace's `context/` directory:

```bash
cp ~/.kiro/steer-runtime/profiles/pm/context/contract-compliance-format.md \
   ~/.kiro/steer-runtime/workspaces/<your-team>/context/contract-compliance-format.md
```

2. Edit colors, layout, badge styles, or HTML structure
3. Your version takes priority over the default on next `koda sync`

## Metrics explained

| Metric | What it measures | Formula |
|--------|------------------|---------|
| Contract Adherence | Are the contracted deliverables formally closed? | Contract tickets closed / total contract tickets |
| Completion Rate | Is the team delivering sprint work? | Actual stories closed / total actual stories |

- **Rejected** tickets count as **Closed** (they went through review)
- Only **contracted team members** are counted in actual delivery
- Sprint-to-milestone mapping uses sprint date ranges

## Tips

- Run weekly or per-sprint to track progress over time
- If contract tickets don't use `[1.x.x]` naming, the agent will ask you to map them
- The agent filters by dev emails — make sure they match Jira assignees exactly
- You can have multiple teams in one config file

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Team not found" | Add your team to the config file in `context/` |
| "No contract file for RITM" | Place the PDF/XLSX in the configured location |
| "No Jira tickets found" | Verify board ID and project key in your config |
| Wrong metrics | Check dev emails match Jira assignees exactly (case-insensitive) |
| Report looks different | Check if your workspace has a custom format override |
| Publishing fails | Verify GitHub repo URL and branch in config, ensure push access |
