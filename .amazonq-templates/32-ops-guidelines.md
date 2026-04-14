# Ops Guidelines

## Jira Custom Fields
| Field | ID | Type |
|---|---|---|
| Story Points | customfield_10003 | Number |
| AI Assisted Effort | customfield_27200 | Number |
| AI Usage Level | customfield_27201 | Select (Low/Medium/High) |
| AI Tools Used | customfield_27202 | Text |
| Pull Request | customfield_21707 | Text (URL) |
| Evidence of Completion | customfield_20800 | Text |

## Jira Transitions
- In Progress → Ready for Review (PR created)
- In Progress → In Review (fallback)
- In Progress → Peer Review (fallback)
- Label `AI-Peer-Reviewed` when AI reviews the PR

## Infrastructure Defaults
- AWS Region: us-west-2
- Harness Org: Commerce, Base URL: https://disney.harness.io/
- SonarQube: https://sonar.cicd.wdprapps.disney.com

## MCP Tools Available
- Jira MCP: fetch/update issues, transitions, custom fields
- Confluence MCP: documentation and runbooks
- GitHub MCP: PR status, code review
