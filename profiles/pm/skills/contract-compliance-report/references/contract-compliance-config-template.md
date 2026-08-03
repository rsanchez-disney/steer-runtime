# Contract Compliance — Configuration Template

Copy this file to your workspace's `context/` directory and fill in your team's details.

## Team mapping

| Team | Jira Board ID | Project Key | Board URL | Dev Emails |
|------|:---:|------|------|------|
| {Team A} | {board_id} | {KEY} | https://disneyexperiences.atlassian.net/jira/software/c/projects/{KEY}/boards/{board_id} | email1@disney.com, email2@disney.com |
| {Team B} | {board_id} | {KEY} | https://disneyexperiences.atlassian.net/jira/software/c/projects/{KEY}/boards/{board_id} | email1@disney.com, email2@disney.com |

## Contract source

| Item | Value |
|------|-------|
| Contract files location | {path to contract PDFs/XLSX by RITM} |
| Naming pattern | `{Owner}/RITM{number}/` |

## Report output

| Item | Value |
|------|-------|
| Local output directory | {path where HTML reports are saved} |
| GitHub repo (optional) | {org/repo URL for GitHub Pages publishing} |
| GitHub Pages branch | main |
| GitHub Pages URL | {pages URL} |

## Jira configuration

| Item | Value |
|------|-------|
| Instance | disneyexperiences.atlassian.net |
| MCP | `@atlassian/*` or `cloud_` prefixed tools |
| Story points field | customfield_10042 |
| Sprint duration | 2 weeks |

## Milestone naming convention

How contract tickets map to milestones:

| Prefix pattern | Milestone |
|----------------|-----------|
| `[1.x.x]` | M1 / D1 |
| `[2.x.x]` | M2 / D2 |
| `[3.x.x]` | M3 / D3 |
| `[N.x.x]` | MN / DN |

If tickets don't follow this convention, list explicit ticket → milestone mappings below.

## Index page card template (for GitHub Pages)

```html
<div class="card">
    <div class="card-header">
        <div class="project-name">{TEAM}</div>
        <div class="ritm">RITM{number}</div>
    </div>
    <div class="subtitle">{Project Description}</div>
    <div class="meta">
        <span>Last updated: {date}</span>
    </div>
    <a href="{filename}.html" class="btn">View Report</a>
</div>
```
