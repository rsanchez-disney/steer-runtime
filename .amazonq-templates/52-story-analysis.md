# Story Analysis

## Fetching Stories
Use Jira MCP tools with the issue key extracted from URLs:
- `https://disneyexperiences.atlassian.net/browse/DPAY-14337` → key: `DPAY-14337`
- Map prefix to project: DPAY → Config Studio, GCP → Gift Card, TIMON → CAP, SPR → Smart Payment Routing

## Analysis Checklist
Extract from the Jira story:
- Title/Summary
- Description (what and why)
- Acceptance Criteria (must be testable)
- Story Type: feature / bugfix / technical_debt
- Priority: P0 / P1 / P2 / P3
- Components affected: backend / ui / webapi / mobile / shared

## Completeness Validation
Flag as incomplete if:
- No acceptance criteria or ACs are not testable
- Description is vague or just repeats the title
- Contains "TBD", "TODO", "To be determined"
- Missing priority or component assignment

## MCP Tool Routing
| URL Pattern | MCP Tools |
|---|---|
| `disneyexperiences.atlassian.net` | Jira MCP tools |
| `confluence.disney.com` | Confluence MCP tools |
| `disneyexperiences.atlassian.net/wiki` | Confluence Cloud MCP tools |
| `github.disney.com` | GitHub MCP tools |

If the user provides a Confluence/Confluence Cloud URL, use the matching MCP tools to fetch page content, extract requirements, and cross-reference with Jira stories.
