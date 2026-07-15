# Context Gathering First

Before performing any ticket-related work (peer review, PR review, story creation, quality evaluation), gather context first.

## Context Gathering Workflow

1. **Identify the ticket** — extract IOET-XXXX from user request
2. **Fetch Jira issue** — read summary, description, AC (customfield_10166), status, sprint
3. **Check linked items** — epic/parent, linked issues, subtasks
4. **Find PRs** — search for branches/PRs matching IOET-XXXX
5. **Check Confluence** — search for related documentation
6. **Check ServiceNow** — look for related RITMs/incidents if applicable
7. **Identify contradictions** — note conflicts between sources

## Output: Context Brief

Produce a mental model (or write to `DXCP_tickets/[IOET-XXXX]/context-brief.md`) containing:

- **Core Intent** — what the ticket aims to achieve
- **Prior Context** — related work, decisions, history
- **Implementation Index** — PRs, branches, files changed
- **GitOps Main Snapshot** — current state of relevant GitOps resources
- **Contradictions** — conflicts between Jira, Confluence, code, and docs
- **Technical Validation** — verification points
- **Environment/Dependencies** — AWS accounts, clusters, affected services

## Instance Routing

- Default to Cloud (disneyexperiences.atlassian.net) for IOET tickets
- Use Enterprise (jira.disney.com) only when explicitly directed
- Check AC in `customfield_10166` (Cloud) or `customfield_16400` (Enterprise)
