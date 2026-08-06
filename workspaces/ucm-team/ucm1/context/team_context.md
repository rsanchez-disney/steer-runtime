# UCM1 — Team Context

## Jira

- **Project prefixes:** `UCM-` (Unified Checkout) · `COM-` (Commerce)
- **Board:** Unified Checkout

## Team Roster
- <name> Solange Diedrych
- <name> Rodrigo Davico
- <name> Valeria Rocha
- <name> Agustin Moreno

## Usage Notes

When querying Jira for UCM UI team, use:
- **Jira Main Board:** [Unified Checkout Modernization](https://disneyexperiences.atlassian.net/jira/software/c/projects/UCM/boards/602)
- **Jira DVC Backlog:** [DVC/UC Integration Backlog](https://disneyexperiences.atlassian.net/jira/people/628d3958ab91fe007097f9fa/boards/5544/backlog)
- **Custom Dashboard:** [Globant | UCM](https://disneyexperiences.atlassian.net/jira/dashboards/22483)
- **Dev filter:** `assignee in ("agustin.x.moreno.-nd@disney.com", "diedrych.jimenez.-nd@disney.com", "rodrigo.davico.-nd@disney.com", "valeria.rocha.-nd@disney.com")`

## Branch & Workflow Conventions

- Branch names match the Jira ticket: `UCM12345` or `COM-12345`
- Push to a **personal fork** only — never push directly to origin
- PRs go from `fork/UCM12345` → `origin/develop` (or `master` for components/lambda)
- Never commit or push directly to `develop`, `master`, or `main`

## Team Standards
- All PRs should include title, description, related PRs (if applies), Tests Results, Evidence (Before/After if applies)
- All PRs require two ACR approvals (Approved Code Reviewers) along with a Peer approval
- Tickets status must be updated frenquently (at least 2 times during working hours)
- PRs must be added into `Evidence of Completion` field once they are created
- Tickets must include Applications Fix Versions (if there were PRs attached to `Evidence of Completion`)